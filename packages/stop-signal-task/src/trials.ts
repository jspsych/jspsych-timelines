import "./styles.css";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import type { JsPsych } from "jspsych";

import {
  INSTRUCTION_CORRECT_MS,
  INSTRUCTION_MAX_ATTEMPTS,
  INSTRUCTION_SSD_MS,
  INSTRUCTION_STOP_WAIT_MS,
  TASK_CLASS,
  TASK_NAME,
  TONE_DURATION_MS,
  TONE_FREQUENCY_HZ,
  VERSION,
} from "./constants";
import { Direction, TrialSpec, buildBlockSpecs } from "./design";
import {
  DEFAULT_OPTIONS,
  ResolvedOptions,
  StopSignalTaskOptions,
  resolveOptions,
  splitTrials,
  validateOptions,
} from "./options";
import { hasForcedRt, simulateRace } from "./simulation";
import { StaircaseManager, TrackKey } from "./staircase";
import { CLS, renderArrow, renderGoStage, renderStage } from "./stimuli";
import { InstructionStepArgs, StopSignalForm, TextConfig, defaultText } from "./text";

export type Phase = "practice" | "test";

export interface Outcome {
  trial_type: "go" | "stop";
  /** go: the right key; stop: no response */
  correct: boolean;
  /** no response before the window ended */
  timeout: boolean;
  rt: number | null;
  correct_label: string;
}

export interface Context {
  jsPsych: JsPsych;
  text: TextConfig;
  /** user options as given (for phase resolution) */
  user: StopSignalTaskOptions;
  practice: ResolvedOptions;
  test: ResolvedOptions;
  staircases: StaircaseManager;
  state: {
    last: Outcome | null;
    /** the previous block of each phase, so run and gap rules hold across blocks */
    lastSpecs: Record<Phase, TrialSpec[]>;
    /** practice missed its criterion and may repeat */
    practice_failed: boolean;
    /** the criterion said "end": the test blocks are skipped */
    ended: boolean;
  };
}

export function createContext(jsPsych: JsPsych, options: StopSignalTaskOptions = {}): Context {
  if (typeof (jsPsych as any).adaptive?.createStaircase !== "function") {
    throw new Error("stop-signal-task: needs jsPsych 8.4.0 or later (jsPsych.adaptive).");
  }
  const text: TextConfig = { ...defaultText, ...options.text };
  const test = resolveOptions(options, "test");
  const practice = resolveOptions(options, "practice");
  validateOptions(test, "test");
  validateOptions(practice, "practice");
  return {
    jsPsych,
    text,
    user: options,
    practice,
    test,
    staircases: new StaircaseManager(jsPsych),
    state: {
      last: null,
      lastSpecs: { practice: [], test: [] },
      practice_failed: false,
      ended: false,
    },
  };
}

// -- helpers ------------------------------------------------------------------------------------

const baseData = (extra: Record<string, unknown>) => ({
  task: TASK_NAME,
  task_version: VERSION,
  ...extra,
});

const isKeyboard = (o: ResolvedOptions) => o.response_device === "keyboard";

/** How a key is named to the participant: letters in capitals, named keys in words. */
const KEY_NAMES: Record<string, string> = {
  " ": "space",
  ArrowLeft: "left arrow",
  ArrowRight: "right arrow",
  ArrowUp: "up arrow",
  ArrowDown: "down arrow",
  Enter: "Enter",
};

export function keyName(key: string): string {
  return KEY_NAMES[key] ?? (key.length === 1 ? key.toUpperCase() : key);
}

/** Label of response `r` (0 = left-arrow response) for instruction text: a key cap, or the button label. */
function responseLabelHtml(ctx: Context, o: ResolvedOptions, r: 0 | 1): string {
  if (isKeyboard(o)) return `<kbd>${keyName(o.response_keys[r])}</kbd>`;
  return r === 0 ? ctx.text.left_button : ctx.text.right_button;
}

const responseIndex = (d: Direction): 0 | 1 => (d === "left" ? 0 : 1);

// -- display (no-response) trials --------------------------------------------------------------

interface DisplayArgs {
  phase: string;
  part: string;
  block?: number;
  stimulus: string | (() => string);
  duration: number;
  data?: Record<string, unknown>;
}

/**
 * No-response display trial (fixation, ITI, feedback): the keyboard plugin with `choices: "NO_KEYS"` and a
 * fixed duration, whatever the response device (PACKAGE-STANDARD §10).
 */
export function createDisplayTrial(a: DisplayArgs) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: [TASK_CLASS],
    stimulus: a.stimulus as any,
    choices: "NO_KEYS",
    trial_duration: a.duration,
    data: baseData({
      phase: a.phase,
      part: a.part,
      block: a.block ?? null,
      duration_ms: a.duration,
      ...(a.data ?? {}),
    }),
    on_finish: (d: any) => {
      delete d.stimulus; // derived HTML; the descriptive fields carry what was shown
    },
  };
}

export function createFixation(phase: Phase, block: number, ms: number, ctx: Context) {
  return createDisplayTrial({
    phase,
    part: "fixation",
    block,
    duration: ms,
    stimulus: renderStage(`<span class="${CLS.fixation}">${ctx.text.fixation}</span>`),
    data: { fixation_duration: ms },
  });
}

export function createIti(phase: Phase, block: number, ms: number) {
  return createDisplayTrial({
    phase,
    part: "iti",
    block,
    duration: ms,
    stimulus: renderStage(""),
    data: { iti: ms },
  });
}

// -- the response trial (go stimulus, stop signal inside the same trial) --------------------------

/** The stop-signal delay and staircase track of one trial, decided when the trial starts. */
interface TrialState {
  resolved: boolean;
  ssd: number | null;
  track: TrackKey | null;
  ssd_actual: number | null;
  shown: boolean;
  raf: number | null;
  sim: { rt: number | null; response: string | number | null } | null;
}

const newState = (): TrialState => ({
  resolved: false,
  ssd: null,
  track: null,
  ssd_actual: null,
  shown: false,
  raf: null,
  sim: null,
});

/**
 * One short tone through the Web Audio API. Returns whether the audio context was running when the
 * tone started (false: no audio, or a context the browser has not unlocked), so the data do not claim
 * a signal nobody heard.
 */
function playTone(jsPsych: JsPsych, ms: number): boolean {
  try {
    const ctx = (jsPsych.pluginAPI as any).audioContext?.() as AudioContext | null | undefined;
    if (!ctx) return false;
    if (ctx.state === "suspended") void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = TONE_FREQUENCY_HZ;
    gain.gain.value = 0.2;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000);
    return ctx.state === "running";
  } catch {
    return false; // no audio: the trial still runs
  }
}

interface ResponseArgs {
  ctx: Context;
  o: ResolvedOptions;
  direction: Direction;
  trial_type: "go" | "stop";
  /** called once when the trial starts: the delay and track of a stop trial */
  resolve: (st: TrialState) => void;
  /** ms from go onset, or null (the walkthrough's go steps) */
  window: number | null;
  below?: string;
  data: Record<string, unknown>;
  /** a global forced RT (`default.data.rt`) replaces the race model; the walkthrough ignores it and answers correctly */
  honourForcedRt: boolean;
  /** the simulated response when no forced RT is given */
  simulate: (st: TrialState) => { rt: number | null; response_index: 0 | 1 | null };
  /** after the common outcome fields are set */
  finish: (d: any, st: TrialState, info: { responded: boolean; correct: boolean }) => void;
}

/**
 * Builds the trial for one go stimulus. A stop trial is the same trial: at the stop-signal delay after
 * go onset, a script adds the class `signalled` to the stage (or plays a tone). The stage does not
 * change size or position, so the anchored layout holds, and the response clock keeps running.
 * The measured delay (`ssd_actual`, rounded to the display frame) is recorded next to the requested one.
 */
function buildResponseTrial(a: ResponseArgs) {
  const { ctx, o } = a;
  const keyboard = isKeyboard(o);
  const st = newState();
  const correctIdx = responseIndex(a.direction);
  const correctResponse: string | number = keyboard ? o.response_keys[correctIdx] : correctIdx;
  const stop = a.trial_type === "stop";
  const resolve = () => {
    if (!st.resolved) {
      st.resolved = true;
      a.resolve(st);
    }
  };

  const onLoad = () => {
    resolve();
    if (!stop || st.ssd === null) return;
    const root = ctx.jsPsych.getDisplayElement()?.querySelector<HTMLElement>(`.${CLS.stage}`);
    if (!root) return; // data-only simulation draws nothing
    const t0 = performance.now();
    const tone = o.stimulus_set.stop_signal === "tone";
    const signalMs = o.stimulus_duration_ms.stop_signal;
    const show = () => {
      st.ssd_actual = Math.round(performance.now() - t0);
      st.shown = true;
      if (tone) st.shown = playTone(ctx.jsPsych, signalMs ?? TONE_DURATION_MS);
      else {
        root.classList.add(CLS.signalled);
        if (signalMs !== null) {
          ctx.jsPsych.pluginAPI.setTimeout(() => root.classList.remove(CLS.signalled), signalMs);
        }
      }
    };
    // half a frame early, then the next animation frame: the signal lands on the frame nearest the delay
    ctx.jsPsych.pluginAPI.setTimeout(() => {
      if (typeof requestAnimationFrame === "function") st.raf = requestAnimationFrame(show);
      else show();
    }, Math.max(0, st.ssd - 8));
  };

  const onFinish = (d: any) => {
    if (st.raf !== null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(st.raf);
    delete d.stimulus;
    // jsPsych's simulation merge can turn a null response into {}; only a key or a button index counts
    const responded = typeof d.response === "string" || typeof d.response === "number";
    if (!responded) {
      d.response = null;
      d.rt = null;
    }
    const correct = stop
      ? !responded
      : responded &&
        (keyboard
          ? String(d.response).toLowerCase() === String(correctResponse).toLowerCase()
          : d.response === correctResponse);
    d.timeout = !responded;
    d.correct = correct;
    d.stop_outcome = stop ? (responded ? "failed" : "successful") : "na";
    d.ssd = stop ? st.ssd : null;
    // a simulated run has no screen: the signal counts as shown unless the response came before it
    const real = st.ssd_actual !== null;
    d.ssd_actual = real ? st.ssd_actual : null;
    d.stop_signal_shown = stop ? (real ? st.shown : d.rt === null || d.rt >= (st.ssd ?? 0)) : null;
    a.finish(d, st, { responded, correct });
    ctx.state.last = {
      trial_type: a.trial_type,
      correct,
      timeout: !responded,
      rt: responded ? d.rt : null,
      correct_label: keyboard
        ? keyName(correctResponse as string)
        : correctIdx === 0
        ? ctx.text.left_button
        : ctx.text.right_button,
    };
  };

  const common: Record<string, unknown> = {
    css_classes: [TASK_CLASS],
    stimulus: () =>
      renderGoStage(o.stimulus_set.go, o.stimulus_set.stop_signal, a.direction, a.below ?? ""),
    stimulus_duration: o.stimulus_duration_ms.go,
    trial_duration: a.window,
    response_ends_trial: true,
    data: baseData({
      ...a.data,
      condition: a.trial_type,
      go_stimulus: a.direction,
      correct_response: correctResponse,
      response_window: a.window,
      stimulus_duration: o.stimulus_duration_ms.go,
      stop_signal_duration: o.stimulus_duration_ms.stop_signal,
      stop_signal: o.stimulus_set.stop_signal,
      response_device: o.response_device,
    }),
    on_start: resolve,
    on_load: onLoad,
    on_finish: onFinish,
    // data-only simulation: an independent race between the go and the stop process
    simulation_options: () => {
      resolve();
      if (a.honourForcedRt && hasForcedRt(ctx.jsPsych)) return {};
      if (st.sim === null) {
        const r = a.simulate(st);
        st.sim = {
          rt: r.rt,
          response:
            r.response_index === null
              ? null
              : keyboard
              ? o.response_keys[r.response_index]
              : r.response_index,
        };
      }
      return { data: st.sim };
    },
  };
  if (keyboard) {
    return { type: jsPsychHtmlKeyboardResponse, choices: [...o.response_keys], ...common } as any;
  }
  return {
    type: jsPsychHtmlButtonResponse,
    choices: [ctx.text.left_button, ctx.text.right_button],
    button_html: (choice: string) => `<button class="jspsych-btn">${choice}</button>`,
    ...common,
  } as any;
}

/** The scorable trial: one row per trial with `phase`, `part: "response"`. */
export function createResponseTrial(
  ctx: Context,
  o: ResolvedOptions,
  spec: TrialSpec,
  phase: Phase,
  block: number,
  trialInBlock: number,
  extra: { n_in_block?: number; stop_probability?: number; attempt?: number } = {}
) {
  const set = () => ctx.staircases.current(phase, o.adaptive!);
  return buildResponseTrial({
    ctx,
    o,
    direction: spec.go_direction,
    trial_type: spec.trial_type,
    window: o.response_window_ms,
    honourForcedRt: true,
    resolve: (st) => {
      if (spec.trial_type !== "stop") return;
      if (o.adaptive) {
        const s = set();
        st.track = s.keyFor(spec.go_direction);
        st.ssd = Math.round(s.level(st.track) * 10) / 10;
      } else {
        st.ssd = spec.fixed_ssd;
      }
    },
    data: {
      phase,
      part: "response",
      block,
      trial_index_in_block: trialInBlock,
      stop_probability_condition: extra.stop_probability ?? null,
      ...(phase === "practice" ? { practice_attempt: extra.attempt ?? 1 } : {}),
    },
    simulate: (st) =>
      simulateRace(
        ctx.jsPsych,
        { trial_type: spec.trial_type, ssd: st.ssd, direction: spec.go_direction },
        o.response_window_ms as number
      ),
    finish: (d, st, info) => {
      d.staircase_id = spec.trial_type === "stop" && o.adaptive ? st.track : null;
      if (spec.trial_type === "stop" && o.adaptive && st.track) {
        const s = set();
        s.update(st.track, !info.responded);
        // the state after this trial's update, without the history
        d.staircase_state = s.compact(st.track);
        d.next_ssd = s.level(st.track);
      } else {
        d.staircase_state = null;
        d.next_ssd = null;
      }
      if (o.adaptive && extra.n_in_block !== undefined && trialInBlock === extra.n_in_block) {
        // the whole staircase (history included) once per block
        d.staircase_final = set().snapshot();
      }
    },
  });
}

// -- feedback ---------------------------------------------------------------------------------

export function feedbackText(ctx: Context, o: ResolvedOptions, out: Outcome): string {
  const t = ctx.text;
  const acc =
    out.trial_type === "stop"
      ? out.correct
        ? t.correct_feedback
        : t.stop_failed_feedback
      : out.timeout
      ? t.timeout_feedback
      : out.correct
      ? t.correct_feedback
      : t.incorrect_feedback;
  switch (o.trial_feedback) {
    case "accuracy":
      return acc;
    case "rt":
      return out.rt !== null ? t.feedback_rt({ rt: out.rt }) : acc;
    case "accuracy_rt":
      return out.rt !== null ? `${acc} — ${t.feedback_rt({ rt: out.rt })}` : acc;
    case "correct_answer":
      return out.correct || out.trial_type === "stop" || out.timeout
        ? acc
        : `${acc}. ${t.feedback_correct_answer({ answer: out.correct_label })}`;
    default:
      return "";
  }
}

export function shouldShowFeedback(o: ResolvedOptions, out: Outcome | null): boolean {
  if (o.trial_feedback === "none" || out === null) return false;
  switch (o.feedback_condition) {
    case "errors_only":
      return !out.correct;
    case "correct_only":
      return out.correct;
    default:
      return true;
  }
}

export function createFeedback(
  ctx: Context,
  o: ResolvedOptions,
  phase: Phase,
  block: number,
  ms: number
) {
  const trial: any = createDisplayTrial({
    phase,
    part: "feedback",
    block,
    duration: ms,
    stimulus: () => {
      const out = ctx.state.last!;
      const cls = out.timeout ? "timeout" : out.correct ? "correct" : "incorrect";
      return renderStage(`<div class="${CLS.feedback} ${cls}">${feedbackText(ctx, o, out)}</div>`);
    },
    data: { feedback_duration: ms },
  });
  trial.data.feedback_kind = o.trial_feedback;
  trial.data.feedback_condition = o.feedback_condition;
  const strip = trial.on_finish;
  trial.on_finish = (d: any) => {
    strip(d);
    d.feedback_text = feedbackText(ctx, o, ctx.state.last!);
  };
  return { timeline: [trial], conditional_function: () => shouldShowFeedback(o, ctx.state.last) };
}

// -- trial and block ---------------------------------------------------------------------------

/** All trials of one stimulus presentation: fixation, go stimulus (with the stop signal inside), feedback, ITI. */
export function createTrialSequence(
  ctx: Context,
  o: ResolvedOptions,
  spec: TrialSpec,
  phase: Phase,
  block: number,
  trialInBlock: number,
  extra: { n_in_block?: number; stop_probability?: number; attempt?: number } = {}
) {
  const tl: any[] = [];
  if (spec.fixation_ms > 0) tl.push(createFixation(phase, block, spec.fixation_ms, ctx));
  tl.push(createResponseTrial(ctx, o, spec, phase, block, trialInBlock, extra));
  if (o.trial_feedback !== "none" && spec.feedback_ms > 0)
    tl.push(createFeedback(ctx, o, phase, block, spec.feedback_ms));
  if (spec.iti_ms > 0) tl.push(createIti(phase, block, spec.iti_ms));
  return { timeline: tl };
}

/**
 * One block. The trial list is built now; the staircase runs as the block runs: each stop trial reads
 * the current delay when it starts, and updates it when it ends. `reset` decides whether the block
 * starts fresh staircases.
 */
export function createBlock(
  ctx: Context,
  phase: Phase,
  block: number,
  nTrials: number,
  attempt = 1
) {
  const o = phase === "practice" ? ctx.practice : ctx.test;
  const props = o.condition_proportions[Math.min(block - 1, o.condition_proportions.length - 1)];
  const specs = buildBlockSpecs(ctx.jsPsych, o, nTrials, props, ctx.state.lastSpecs[phase]);
  ctx.state.lastSpecs[phase] = specs;
  return {
    timeline: specs.map((s, i) =>
      createTrialSequence(ctx, o, s, phase, block, i + 1, {
        n_in_block: nTrials,
        stop_probability: props.stop ?? 0,
        attempt,
      })
    ),
    on_timeline_start: () => {
      ctx.staircases.startBlock(phase, o.adaptive);
    },
  };
}

export { splitTrials };

// -- instructions and transitions ----------------------------------------------------------------

function textPage(ctx: Context, html: string, phase: string, part: string, label?: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: `<div class="${CLS.text}">${html}</div>`,
    choices: [label ?? ctx.text.continue_button],
    data: baseData({ phase, part }),
  };
}

export function createTransition(ctx: Context, html: string, phase: string, part = "transition") {
  return textPage(ctx, `<p>${html}</p>`, phase, part);
}

function strategyHtml(ctx: Context): string {
  const o = ctx.test;
  const t = ctx.text;
  switch (o.strategy_instruction) {
    case "dont_wait":
      return t.strategy_dont_wait;
    case "dont_wait_plus_tracking_explanation":
      return (
        t.strategy_dont_wait +
        t.strategy_tracking_explanation({ target_accuracy: o.adaptive?.target_accuracy ?? 0.5 })
      );
    case "balance_speed_and_stopping":
      return t.strategy_balance;
    default:
      return "";
  }
}

export function createInstructions(ctx: Context) {
  const o = ctx.test;
  if (o.instruction_format === "experimenter") return { timeline: [] as any[] };
  const t = ctx.text;
  const device = o.response_device as "keyboard" | "mouse" | "touch";
  const hasStop = o.condition_proportions.some((p) => (p.stop ?? 0) > 0);
  const pages: string[] = [t.instruction_intro];
  pages.push(
    t.instruction_response({
      device,
      left_response: responseLabelHtml(ctx, o, 0),
      right_response: responseLabelHtml(ctx, o, 1),
      left_arrow: renderArrow("left", 28),
      right_arrow: renderArrow("right", 28),
    })
  );
  if (hasStop) {
    pages.push(t.instruction_stop({ signal: o.stimulus_set.stop_signal }) + strategyHtml(ctx));
  }
  return { timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction")) };
}

// -- instruction walkthrough ---------------------------------------------------------------------

export interface DemoStep {
  trial_type: "go" | "stop";
  direction: Direction;
}

/** The steps: go left, go right, and (when the task has stop trials) a stop step. The stop step's arrow alternates. */
export function demoSteps(ctx: Context): DemoStep[] {
  const phases = [...(ctx.test.practice_trials === 0 ? [] : [ctx.practice]), ctx.test];
  const hasStop = phases.some((p) => p.condition_proportions.some((c) => (c.stop ?? 0) > 0));
  const steps: DemoStep[] = [
    { trial_type: "go", direction: "left" },
    { trial_type: "go", direction: "right" },
  ];
  if (hasStop) steps.push({ trial_type: "stop", direction: "left" });
  return steps;
}

function stepArgs(ctx: Context, step: DemoStep): InstructionStepArgs {
  const o = ctx.test;
  return {
    condition: step.trial_type,
    device: o.response_device as "keyboard" | "mouse" | "touch",
    response:
      step.trial_type === "stop" ? "" : responseLabelHtml(ctx, o, responseIndex(step.direction)),
    signal: o.stimulus_set.stop_signal as StopSignalForm,
  };
}

const demoText = (html: string) => `<div class="${CLS.text}">${html}</div>`;

/** Static examples: each trial type as drawn in the task, with the answer named (`instruction_demonstration: "examples"`). */
function createExamples(ctx: Context, steps: DemoStep[]) {
  const o = ctx.test;
  const pages = steps.map((step) => ({
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () =>
      renderGoStage(
        o.stimulus_set.go,
        o.stimulus_set.stop_signal,
        step.direction,
        demoText(ctx.text.instruction_step(stepArgs(ctx, step)))
      ),
    choices: [ctx.text.continue_button],
    data: baseData({
      phase: "instructions",
      part: "instruction_example",
      condition: step.trial_type,
      go_stimulus: step.direction,
    }),
    on_finish: (d: any) => {
      delete d.stimulus;
    },
  }));
  return {
    timeline: [
      textPage(ctx, ctx.text.instruction_examples_intro, "instructions", "instruction"),
      ...pages,
    ],
  };
}

/**
 * Interactive walkthrough (PACKAGE-STANDARD §6a): a go step for each arrow and a stop step, drawn and
 * answered with the same renderer, signal code and response mapping as the test trials. The go steps are
 * untimed; the stop step shows the signal after INSTRUCTION_SSD_MS and waits INSTRUCTION_STOP_WAIT_MS for the
 * (absent) response. A wrong response shows a hint and repeats the step; after INSTRUCTION_MAX_ATTEMPTS the
 * answer is shown and it moves on. Rows are `phase: "instructions"`, `part: "instruction_check"` (hints and
 * confirmations: `instruction_feedback`) and are never scored.
 */
export function createInstructionWalkthrough(ctx: Context) {
  const o = ctx.test;
  const mode = o.instruction_demonstration;
  if (o.instruction_format !== "text" || mode === "none") return { timeline: [] as any[] };
  const steps = demoSteps(ctx);
  if (mode === "examples") return createExamples(ctx, steps);
  const t = ctx.text;
  const nodes: any[] = [textPage(ctx, t.instruction_demo_intro, "instructions", "instruction")];

  for (const step of steps) {
    const stop = step.trial_type === "stop";
    const args = stepArgs(ctx, step);
    const state = { attempt: 0, correct: null as boolean | null };
    const shown = (html: string) =>
      renderGoStage(o.stimulus_set.go, o.stimulus_set.stop_signal, step.direction, demoText(html));
    const stepData = {
      phase: "instructions",
      condition: step.trial_type,
      go_stimulus: step.direction,
    };

    // the response: the same trial as the test's, with a caption under the stage
    const response = buildResponseTrial({
      ctx,
      o,
      direction: step.direction,
      trial_type: step.trial_type,
      window: stop ? INSTRUCTION_STOP_WAIT_MS : null,
      honourForcedRt: false,
      below: demoText(t.instruction_step(args)),
      resolve: (st) => {
        if (stop) st.ssd = INSTRUCTION_SSD_MS;
      },
      data: { ...stepData, part: "instruction_check" },
      // data-only simulation answers correctly (and withholds on the stop step)
      simulate: () => ({
        rt: stop ? null : 600,
        response_index: stop ? null : responseIndex(step.direction),
      }),
      finish: (d) => {
        state.attempt++;
        state.correct = d.correct;
        d.attempt = state.attempt;
      },
    });

    const confirm = createDisplayTrial({
      phase: "instructions",
      part: "instruction_feedback",
      duration: INSTRUCTION_CORRECT_MS,
      stimulus: () => shown(`<p><strong>${t.instruction_correct}</strong></p>`),
      data: { ...stepData, feedback_kind: "correct" },
    });
    const note = (html: string, kind: string) => ({
      type: jsPsychHtmlButtonResponse,
      css_classes: [TASK_CLASS],
      stimulus: () => shown(html),
      choices: [t.continue_button],
      data: baseData({ ...stepData, part: "instruction_feedback", feedback_kind: kind }),
      on_finish: (d: any) => {
        delete d.stimulus;
      },
    });
    const again = () => state.correct === false && state.attempt < INSTRUCTION_MAX_ATTEMPTS;

    nodes.push({
      timeline: [
        response,
        { timeline: [confirm], conditional_function: () => state.correct === true },
        { timeline: [note(t.instruction_hint(args), "hint")], conditional_function: again },
        {
          timeline: [note(t.instruction_reveal(args), "reveal")],
          conditional_function: () => state.correct === false && !again(),
        },
      ],
      on_timeline_start: () => {
        state.attempt = 0;
        state.correct = null;
      },
      loop_function: again,
    });
  }
  return { timeline: nodes };
}

export function createPracticeIntro(ctx: Context) {
  return textPage(ctx, ctx.text.instruction_practice_intro, "instructions", "instruction");
}

export function createTestIntro(ctx: Context) {
  return textPage(ctx, ctx.text.instruction_test_intro, "instructions", "instruction");
}

// -- practice with a criterion -------------------------------------------------------------------

/** Go accuracy over the last `window` practice trials of an attempt (null = the whole block); null if it has no go trials. */
export function practiceGoAccuracy(
  ctx: Context,
  attempt: number,
  window: number | null
): number | null {
  const rows = ctx.jsPsych.data
    .get()
    .filter({ task: TASK_NAME, phase: "practice", part: "response", practice_attempt: attempt })
    .values();
  const recent = window === null ? rows : rows.slice(-window);
  const go = recent.filter((r: any) => r.condition === "go");
  if (!go.length) return null;
  return go.filter((r: any) => r.correct === true).length / go.length;
}

/**
 * Practice, with `practice_criterion` if set: a block, then a check of go accuracy; a miss repeats the block
 * (up to `max_repeats`), continues, or ends the task. Each repeat is a new block with its own trial list. The
 * result is written to the last row of the attempt (`practice_criterion_met`, `practice_go_accuracy`).
 */
export function createPractice(ctx: Context): any[] {
  const crit = ctx.test.practice_criterion;
  const n = ctx.test.practice_trials;
  if (n <= 0) return [];
  const out: any[] = [];
  if (ctx.test.instruction_format === "text") out.push(createPracticeIntro(ctx));
  if (!crit) {
    out.push(createBlock(ctx, "practice", 1, n, 1));
    return out;
  }
  const attempts = crit.on_fail === "repeat" ? crit.max_repeats + 1 : 1;
  for (let k = 1; k <= attempts; k++) {
    const nodes: any[] = [];
    if (k > 1) nodes.push(textPage(ctx, ctx.text.practice_repeat, "instructions", "instruction"));
    nodes.push(createBlock(ctx, "practice", 1, n, k));
    out.push({
      timeline: nodes,
      conditional_function: () => !ctx.state.ended && (k === 1 || ctx.state.practice_failed),
      on_timeline_finish: () => {
        const acc = practiceGoAccuracy(ctx, k, crit.window);
        const met = acc === null || acc >= crit.accuracy;
        ctx.state.practice_failed = !met;
        if (!met && crit.on_fail === "end") ctx.state.ended = true;
        ctx.jsPsych.data.addDataToLastTrial({
          practice_criterion_met: met,
          practice_go_accuracy: acc,
        });
      },
    });
  }
  if (crit.on_fail === "end") {
    out.push({
      timeline: [textPage(ctx, ctx.text.practice_ended, "instructions", "instruction")],
      conditional_function: () => ctx.state.ended,
    });
  }
  return out;
}

// -- block feedback, breaks ----------------------------------------------------------------------

export function createBlockFeedback(ctx: Context, block: number) {
  const o = ctx.test;
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      const rows = ctx.jsPsych.data
        .get()
        .filter({ task: TASK_NAME, phase: "test", part: "response", block });
      const go = rows.filter({ condition: "go" });
      const stop = rows.filter({ condition: "stop" });
      const goCorrect = go.filter({ correct: true });
      const goAcc = go.count() > 0 ? goCorrect.count() / go.count() : null;
      const stopAcc =
        stop.count() > 0 ? stop.filter({ correct: true }).count() / stop.count() : null;
      const rts = goCorrect.select("rt");
      const meanRt = rts.count() > 0 ? rts.mean() : null;
      let html = ctx.text.block_feedback({
        block,
        n_blocks: o.n_blocks,
        go_accuracy: goAcc,
        mean_go_rt: meanRt,
        stop_accuracy: stopAcc,
        kind: o.block_feedback as "accuracy" | "rt" | "accuracy_rt" | "progress",
      });
      if (stopAcc !== null && o.block_feedback !== "progress") {
        if (stopAcc > 0.6) html += `<p>${ctx.text.tip_waiting}</p>`;
        else if (stopAcc < 0.4) html += `<p>${ctx.text.tip_stop_more}</p>`;
      }
      return `<div class="${CLS.text}">${html}</div>`;
    },
    choices: [ctx.text.continue_button],
    data: baseData({ phase: "test", part: "block_feedback", block }),
  };
}

/** The rest between blocks: the continue button is enabled after `break_duration_ms` (null: at once). */
export function createRestBreak(ctx: Context, block: number) {
  const ms = ctx.test.break_duration_ms;
  return {
    ...textPage(ctx, `<p>${ctx.text.block_complete(block)}</p>`, "test", "rest"),
    enable_button_after: ms ?? 0,
    data: baseData({ phase: "test", part: "rest", block, break_duration: ms }),
  };
}

// -- checks ------------------------------------------------------------------------------------

function isCoarsePointerOnly(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches &&
    !window.matchMedia("(any-pointer: fine)").matches
  );
}

export function createDeviceCheck(ctx: Context) {
  return {
    timeline: [
      {
        ...textPage(
          ctx,
          `<p>${ctx.text.device_not_supported}</p>`,
          "instructions",
          "device_check",
          ctx.text.ok_button
        ),
        on_finish: () => ctx.jsPsych.abortExperiment(ctx.text.device_not_supported),
      },
    ],
    conditional_function: () => isCoarsePointerOnly(),
  };
}

// -- completion --------------------------------------------------------------------------------

export function createCompletion(ctx: Context, calculate: (data: any) => any) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      const s = calculate(ctx.jsPsych.data.get());
      return `<div class="${CLS.text}"><h2>${ctx.text.task_complete}</h2>${ctx.text.result_summary({
        go_accuracy: s.go_accuracy,
        mean_go_rt: s.mean_go_rt,
        stop_accuracy: s.stop_accuracy,
      })}</div>`;
    },
    choices: [ctx.text.continue_button],
    data: baseData({ phase: "completion", part: "completion" }),
  };
}

export { DEFAULT_OPTIONS };
