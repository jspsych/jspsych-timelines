import "./styles.css";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import type { JsPsych } from "jspsych";

import {
  ACKNOWLEDGE_MS,
  INSTRUCTION_CORRECT_MS,
  INSTRUCTION_MAX_ATTEMPTS,
  INSTRUCTION_NOGO_WAIT_MS,
  STIMULUS_SIZE_PX,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import {
  DEFAULT_OPTIONS,
  GoNogoOptions,
  OptionContext,
  ResolvedOptions,
  StimulusItem,
  resolveOptions,
  validateOptions,
} from "./options";
import { TrialSpec, buildBaselineBlock, buildBlocks, sampleDuration } from "./sequence";
import {
  backgroundFixation,
  locationsOf,
  namesOf,
  renderItem,
  renderStage,
  renderStimulusScreen,
  stimulusId,
  stimulusName,
} from "./stimuli";
import { InstructionStepArgs, TextConfig, defaultText } from "./text";

type Phase = "practice" | "test";

export interface Outcome {
  condition: TrialSpec["condition"];
  correct: boolean;
  responded: boolean;
  rt: number | null;
}

export interface Context {
  jsPsych: JsPsych;
  text: TextConfig;
  /** user options as given (for phase resolution) */
  user: GoNogoOptions;
  practice: ResolvedOptions;
  test: ResolvedOptions;
  /** go and no-go stimulus sets after the role assignment (drawn once per participant) */
  stimulus_set: { go: StimulusItem[]; nogo: StimulusItem[] };
  state: { last: Outcome | null };
}

export function createContext(jsPsych: JsPsych, options: GoNogoOptions = {}): Context {
  const text: TextConfig = { ...defaultText, ...options.text };
  const test = resolveOptions(options, "test");
  const practice = resolveOptions(options, "practice");
  validateOptions(test);
  validateOptions(practice);
  let stimulus_set = test.stimulus_set;
  if (test.stimulus_role_assignment === "random_per_participant") {
    // the two sets swap roles with probability .5, drawn once per participant
    if (jsPsych.randomization.randomInt(0, 1) === 1) {
      stimulus_set = { go: test.stimulus_set.nogo, nogo: test.stimulus_set.go };
    }
  }
  return { jsPsych, text, user: options, practice, test, stimulus_set, state: { last: null } };
}

// -- helpers ------------------------------------------------------------------------------------

const baseData = (extra: Record<string, unknown>) => ({
  task: TASK_NAME,
  task_version: VERSION,
  ...extra,
});

const isKeyboard = (o: ResolvedOptions) => o.response_device === "keyboard";
const deviceOf = (o: ResolvedOptions) => o.response_device as "keyboard" | "mouse" | "touch";

/** How a key is named to the participant: letters in capitals, named keys in words. */
const KEY_NAMES: Record<string, string> = {
  " ": "the space bar",
  ArrowLeft: "the left arrow",
  ArrowRight: "the right arrow",
  ArrowUp: "the up arrow",
  ArrowDown: "the down arrow",
  Enter: "Enter",
};

export function keyName(key: string): string {
  return KEY_NAMES[key] ?? (key.length === 1 ? key.toUpperCase() : key);
}

/** Label of the go response for instruction text: the key name, or the button label. */
function responseLabel(ctx: Context, o: ResolvedOptions): string {
  return isKeyboard(o) ? `<kbd>${keyName(o.response_keys[0])}</kbd>` : ctx.text.go_button;
}

function itemHtml(item: StimulusItem, size = STIMULUS_SIZE_PX) {
  return renderItem(item, size);
}

// -- display (no-response) trials --------------------------------------------------------------

interface DisplayArgs {
  phase: string;
  part: string;
  block?: number | null;
  stimulus: string | (() => string);
  duration: number;
  data?: Record<string, unknown>;
}

/**
 * No-response display trial (ITI, feedback, countdown): the keyboard plugin with `choices: "NO_KEYS"` and a
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
      if (a.data?.stimulus !== undefined) d.stimulus = a.data.stimulus;
    },
  };
}

export function createIti(ctx: Context, o: ResolvedOptions, phase: Phase, block: number | null) {
  const ms = sampleDuration(ctx.jsPsych, o.iti_ms);
  const cross = `<span class="jspsych-timelines-go-nogo-fixation">${ctx.text.fixation}</span>`;
  return createDisplayTrial({
    phase,
    part: "iti",
    block,
    duration: ms,
    stimulus: renderStage(o.inter_trial_display === "fixation_cross" ? cross : ""),
    data: { iti: ms },
  });
}

export function createCountdown(ctx: Context, o: ResolvedOptions, phase: Phase, block: number) {
  return createDisplayTrial({
    phase,
    part: "transition",
    block,
    duration: o.pre_block_countdown_ms,
    stimulus: renderStage(
      `<div class="jspsych-timelines-go-nogo-text">${ctx.text.countdown({ phase, block })}</div>`
    ),
    data: { transition: "countdown" },
  });
}

// -- the scorable trial -------------------------------------------------------------------------

const hasResponse = (d: any) => typeof d.response === "string" || typeof d.response === "number";

/** What the response window of one trial is, and how it is recorded. */
function windowOf(
  ctx: Context,
  o: ResolvedOptions,
  phase: Phase,
  block: number,
  trialInBlock: number
) {
  const w = o.response_window_ms;
  const state: { value: number | null; rule: string | null } = { value: null, rule: null };
  if (typeof w === "function") {
    state.rule = w.label ?? "function";
    const trial_duration = () => {
      const ctxArg: OptionContext = {
        jsPsych: ctx.jsPsych,
        phase,
        block,
        trial_index_in_block: trialInBlock,
      };
      state.value = w(ctxArg);
      return state.value;
    };
    return { state, trial_duration: trial_duration as any };
  }
  state.value = w === null ? null : sampleDuration(ctx.jsPsych, w);
  return { state, trial_duration: state.value };
}

/**
 * Add the response acknowledgement (`response_acknowledgement`): on the first response the stimulus is
 * highlighted or marked for ACKNOWLEDGE_MS. Runs in the browser only (data-only simulation has no display).
 */
function acknowledge(o: ResolvedOptions, keyboard: boolean) {
  return () => {
    if (o.response_acknowledgement === "none" || typeof document === "undefined") return;
    const mark = () => {
      const el = document.querySelector(".jspsych-timelines-go-nogo-item");
      if (!el) return;
      const cls =
        o.response_acknowledgement === "highlight" ? "acknowledge-highlight" : "acknowledge-mark";
      el.classList.add(cls);
      setTimeout(() => el.classList.remove(cls), ACKNOWLEDGE_MS);
    };
    if (keyboard) {
      const key = o.response_keys[0].toLowerCase();
      const onKey = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === key) {
          mark();
          document.removeEventListener("keydown", onKey);
        }
      };
      document.addEventListener("keydown", onKey);
    } else {
      document
        .querySelector("#jspsych-html-button-response-btngroup")
        ?.addEventListener("click", mark, { once: true });
    }
  };
}

export function ruleReminder(ctx: Context, o: ResolvedOptions): string {
  if (o.rule_reminder !== "on_screen") return "";
  const t = ctx.text;
  return t.rule_reminder({
    go_names: namesOf(ctx.stimulus_set.go, t),
    nogo_names: namesOf(ctx.stimulus_set.nogo, t),
    response: isKeyboard(o) ? keyName(o.response_keys[0]) : t.go_button,
    device: deviceOf(o),
  });
}

/**
 * The scorable trial: one row per trial with `phase`, `part: "response"`. A go (or go-only baseline) trial is
 * correct if the participant responds in the window; a no-go trial is correct if they do not.
 */
export function createResponseTrial(
  ctx: Context,
  o: ResolvedOptions,
  spec: TrialSpec,
  phase: Phase,
  block: number | null,
  trialInBlock: number,
  extra: Record<string, unknown> = {}
) {
  const keyboard = isKeyboard(o);
  const nogo = spec.condition === "nogo";
  const correctResponse: string | number | null = nogo ? null : keyboard ? o.response_keys[0] : 0;
  const { state, trial_duration } = windowOf(ctx, o, phase, block ?? 0, trialInBlock);

  const data = baseData({
    phase,
    part: "response",
    block,
    trial_index_in_block: trialInBlock,
    condition: spec.condition,
    stimulus: spec.stimulus,
    stimulus_location: spec.stimulus_location,
    correct_response: correctResponse,
    stimulus_duration: o.stimulus_duration_ms,
    trial_termination: o.trial_termination_rule,
    response_device: o.response_device,
    ...extra,
  });

  const onFinish = (d: any) => {
    const responded = hasResponse(d);
    if (!responded) {
      d.response = null;
      d.rt = null;
    }
    const correct = nogo ? !responded : responded;
    d.stimulus = spec.stimulus;
    d.responded = responded;
    d.timeout = !responded;
    d.correct = correct;
    d.response_window = state.value;
    if (state.rule) d.response_window_rule = state.rule;
    ctx.state.last = { condition: spec.condition, correct, responded, rt: d.rt };
  };

  const reminder = ruleReminder(ctx, o);
  const fixation =
    o.inter_trial_display === "fixation_cross" && o.stimulus_duration_ms !== null
      ? backgroundFixation(
          `<span class="jspsych-timelines-go-nogo-fixation">${ctx.text.fixation}</span>`
        )
      : "";
  const prompt =
    (reminder
      ? `<div class="jspsych-timelines-go-nogo-below"><div class="jspsych-timelines-go-nogo-text">${reminder}</div></div>`
      : "") + fixation;

  const common = {
    css_classes: [TASK_CLASS],
    stimulus: renderStimulusScreen(itemHtml(spec.item), spec.stimulus_location),
    stimulus_duration: o.stimulus_duration_ms,
    trial_duration,
    response_ends_trial: o.trial_termination_rule !== "fixed_duration",
    prompt: prompt || null,
    data,
    on_load: acknowledge(o, keyboard),
    on_finish: onFinish,
    // data-only simulation: a participant who does the task correctly responds to go stimuli and withholds on no-go
    ...(nogo ? { simulation_options: { data: { response: null, rt: null } } } : {}),
  };
  if (keyboard) {
    return { type: jsPsychHtmlKeyboardResponse, choices: [...o.response_keys], ...common };
  }
  return {
    type: jsPsychHtmlButtonResponse,
    choices: [ctx.text.go_button],
    button_html: (choice: string) => `<button class="jspsych-btn">${choice}</button>`,
    ...common,
  };
}

// -- feedback ---------------------------------------------------------------------------------

export function feedbackText(ctx: Context, o: ResolvedOptions, out: Outcome): string {
  const t = ctx.text;
  const nogo = out.condition === "nogo";
  const acc = out.correct ? t.correct_feedback : nogo ? t.incorrect_feedback : t.timeout_feedback;
  const rt = out.responded && !nogo && out.rt !== null ? t.feedback_rt({ rt: out.rt }) : null;
  switch (o.trial_feedback) {
    case "accuracy":
      return acc;
    case "rt":
      return rt ?? acc;
    case "accuracy_rt":
      return rt ? `${acc} — ${rt}` : acc;
    case "correct_answer":
      if (out.correct) return acc;
      return `${acc}. ${
        nogo
          ? t.feedback_correct_nogo
          : t.feedback_correct_go({
              response: isKeyboard(o) ? keyName(o.response_keys[0]) : t.go_button,
            })
      }`;
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
  block: number | null
) {
  const ms = sampleDuration(ctx.jsPsych, o.feedback_duration_ms);
  const trial: any = createDisplayTrial({
    phase,
    part: "feedback",
    block,
    duration: ms,
    stimulus: () => {
      const out = ctx.state.last!;
      const cls = out.correct ? "correct" : "incorrect";
      return renderStage(
        `<div class="jspsych-timelines-go-nogo-feedback ${cls}">${feedbackText(ctx, o, out)}</div>`
      );
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

/** All trials of one stimulus presentation: the response trial, feedback, ITI. */
export function createTrialSequence(
  ctx: Context,
  o: ResolvedOptions,
  spec: TrialSpec,
  phase: Phase,
  block: number | null,
  trialInBlock: number,
  extra: Record<string, unknown> = {}
) {
  const tl: any[] = [createResponseTrial(ctx, o, spec, phase, block, trialInBlock, extra)];
  if (o.trial_feedback !== "none") tl.push(createFeedback(ctx, o, phase, block));
  const itiOff = typeof o.iti_ms === "number" && o.iti_ms === 0;
  if (!itiOff) tl.push(createIti(ctx, o, phase, block));
  return { timeline: tl };
}

/** One block from its trial specs (built together with the other blocks, so the sequence rules cross block boundaries). */
export function createBlock(ctx: Context, phase: Phase, block: number, specs: TrialSpec[]) {
  const o = phase === "practice" ? ctx.practice : ctx.test;
  const tl: any[] = [];
  if (o.pre_block_countdown_ms > 0) tl.push(createCountdown(ctx, o, phase, block));
  specs.forEach((s, i) => tl.push(createTrialSequence(ctx, o, s, phase, block, i + 1)));
  return { timeline: tl };
}

/** A go-only baseline block (`single_task_blocks`): `go_control` trials, recorded with `block: null` and `baseline_block`. */
export function createBaselineBlock(ctx: Context, index: number) {
  const o = ctx.test;
  const specs = buildBaselineBlock({ jsPsych: ctx.jsPsych, o, stimulus_set: ctx.stimulus_set });
  const tl: any[] = [textPage(ctx, ctx.text.instruction_baseline_intro, "test", "instruction")];
  specs.forEach((s, i) =>
    tl.push(createTrialSequence(ctx, o, s, "test", null, i + 1, { baseline_block: index }))
  );
  return { timeline: tl };
}

/** The trials of the practice block and the test blocks, built together. */
export function buildPhaseBlocks(ctx: Context, phase: Phase, sizes: number[]): TrialSpec[][] {
  const o = phase === "practice" ? ctx.practice : ctx.test;
  return buildBlocks(
    { jsPsych: ctx.jsPsych, o, stimulus_set: ctx.stimulus_set },
    sizes,
    o.sequence_constraints
  );
}

/** Split `total` into `parts` near-equal integers; the remainder goes to the first blocks. */
export function splitTrials(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const extra = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
}

// -- instructions and transitions ----------------------------------------------------------------

function textPage(ctx: Context, html: string, phase: string, part: string, label?: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: `<div class="jspsych-timelines-go-nogo-text">${html}</div>`,
    choices: [label ?? ctx.text.continue_button],
    data: baseData({ phase, part }),
  };
}

export function createInstructions(ctx: Context) {
  const o = ctx.test;
  if (o.instruction_format === "experimenter") return { timeline: [] as any[] };
  const t = ctx.text;
  const small = (items: StimulusItem[]) =>
    items
      .map((i) => `<span class="jspsych-timelines-go-nogo-inline">${itemHtml(i, 36)}</span>`)
      .join(" ");
  const emphasis =
    o.speed_accuracy_emphasis === "speed"
      ? t.emphasis_speed
      : o.speed_accuracy_emphasis === "accuracy"
      ? t.emphasis_accuracy
      : o.speed_accuracy_emphasis === "both"
      ? t.emphasis_both
      : "";
  const pages = [
    t.instruction_intro({
      go_stimuli: small(ctx.stimulus_set.go),
      nogo_stimuli: small(ctx.stimulus_set.nogo),
      go_names: namesOf(ctx.stimulus_set.go, t),
      nogo_names: namesOf(ctx.stimulus_set.nogo, t),
    }),
    t.instruction_response({ device: deviceOf(o), response: responseLabel(ctx, o) }) +
      (emphasis ? `<p>${emphasis}</p>` : ""),
  ];
  return { timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction")) };
}

// -- instruction walkthrough ---------------------------------------------------------------------

export interface DemoStep {
  spec: TrialSpec;
}

/**
 * The steps of the walkthrough: one per stimulus, alternating go and no-go (go first) so that both responses
 * are taught early; when one kind has more stimuli, the rest follow.
 */
export function demoSteps(ctx: Context): DemoStep[] {
  const o = ctx.test;
  const location = locationsOf(o.stimulus_layout)[0];
  const mk = (condition: "go" | "nogo", item: StimulusItem): DemoStep => ({
    spec: { condition, item, stimulus: stimulusId(item), stimulus_location: location },
  });
  const go = ctx.stimulus_set.go.map((i) => mk("go", i));
  const nogo = ctx.stimulus_set.nogo.map((i) => mk("nogo", i));
  const steps: DemoStep[] = [];
  for (let i = 0; i < Math.max(go.length, nogo.length); i++) {
    if (go[i]) steps.push(go[i]);
    if (nogo[i]) steps.push(nogo[i]);
  }
  return steps;
}

function stepArgs(ctx: Context, step: DemoStep): InstructionStepArgs {
  const o = ctx.test;
  return {
    condition: step.spec.condition as "go" | "nogo",
    device: deviceOf(o),
    stimulus_name: stimulusName(step.spec.item, ctx.text),
    response: responseLabel(ctx, o),
  };
}

const demoText = (html: string) => `<div class="jspsych-timelines-go-nogo-text">${html}</div>`;

const stepHtml = (ctx: Context, step: DemoStep, html: string) =>
  renderStimulusScreen(itemHtml(step.spec.item), step.spec.stimulus_location, demoText(html));

/** Static examples: each stimulus as drawn in the task, with the answer named (`instruction_demonstration: "examples"`). */
function createExamples(ctx: Context, steps: DemoStep[]) {
  const pages = steps.map((step) => ({
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => stepHtml(ctx, step, ctx.text.instruction_step(stepArgs(ctx, step))),
    choices: [ctx.text.continue_button],
    data: baseData({
      phase: "instructions",
      part: "instruction_example",
      condition: step.spec.condition,
      stimulus: step.spec.stimulus,
    }),
    on_finish: (d: any) => {
      d.stimulus = step.spec.stimulus;
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
 * Interactive walkthrough (PACKAGE-STANDARD §6a): one step per stimulus, drawn and answered with the same
 * renderer and response mapping as the test trials. Untimed, except that a no-go step waits
 * INSTRUCTION_NOGO_WAIT_MS for the (absent) response. A wrong response shows a hint and repeats the step; after
 * INSTRUCTION_MAX_ATTEMPTS the answer is shown and it moves on. Rows are `phase: "instructions"`,
 * `part: "instruction_check"` (hints and confirmations: `instruction_feedback`) and are never scored.
 */
export function createInstructionWalkthrough(ctx: Context) {
  const o = ctx.test;
  const mode = o.instruction_demonstration;
  if (o.instruction_format !== "text" || mode === "none") return { timeline: [] as any[] };
  const steps = demoSteps(ctx);
  if (mode === "examples") return createExamples(ctx, steps);
  const keyboard = isKeyboard(o);
  const t = ctx.text;
  const nodes: any[] = [textPage(ctx, t.instruction_demo_intro, "instructions", "instruction")];

  for (const step of steps) {
    const { spec } = step;
    const nogo = spec.condition === "nogo";
    const correctResponse: string | number | null = nogo ? null : keyboard ? o.response_keys[0] : 0;
    const args = stepArgs(ctx, step);
    const state = { attempt: 0, correct: null as boolean | null };
    const shown = (html: string) => stepHtml(ctx, step, html);
    const stepData = { phase: "instructions", condition: spec.condition, stimulus: spec.stimulus };

    const response = {
      type: keyboard ? jsPsychHtmlKeyboardResponse : jsPsychHtmlButtonResponse,
      css_classes: [TASK_CLASS],
      stimulus: () => shown(t.instruction_step(args)),
      ...(keyboard
        ? { choices: [...o.response_keys] }
        : {
            choices: [t.go_button],
            button_html: (choice: string) => `<button class="jspsych-btn">${choice}</button>`,
          }),
      trial_duration: nogo ? INSTRUCTION_NOGO_WAIT_MS : null,
      data: baseData({ ...stepData, part: "instruction_check", correct_response: correctResponse }),
      // data-only simulation answers correctly (and withholds on no-go)
      simulation_options: { data: { response: correctResponse, rt: nogo ? null : 600 } },
      on_finish: (d: any) => {
        const responded = hasResponse(d);
        if (!responded) {
          d.response = null;
          d.rt = null;
        }
        const correct = nogo ? !responded : responded;
        state.attempt++;
        state.correct = correct;
        d.stimulus = spec.stimulus;
        d.responded = responded;
        d.correct = correct;
        d.attempt = state.attempt;
      },
    };

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
        d.stimulus = spec.stimulus;
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

// -- block feedback ------------------------------------------------------------------------------

export function createBlockFeedback(ctx: Context, block: number) {
  const o = ctx.test;
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      const rows = ctx.jsPsych.data
        .get()
        .filter({ task: TASK_NAME, phase: "test", part: "response", block });
      const n = rows.count();
      const correct = rows.filter({ correct: true });
      const rts = correct.filter({ condition: "go" }).select("rt");
      return `<div class="jspsych-timelines-go-nogo-text">${ctx.text.block_feedback({
        block,
        n_blocks: o.n_blocks,
        accuracy: n > 0 ? correct.count() / n : null,
        mean_rt: rts.count() > 0 ? rts.mean() : null,
        kind: o.block_feedback as "accuracy" | "rt" | "accuracy_rt" | "progress",
      })}</div>`;
    },
    choices: [ctx.text.continue_button],
    data: baseData({ phase: "test", part: "block_feedback", block }),
  };
}

// -- completion --------------------------------------------------------------------------------

export function createCompletion(ctx: Context, calculate: (data: any) => any) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      const s = calculate(ctx.jsPsych.data.get());
      return `<div class="jspsych-timelines-go-nogo-text"><h2>${
        ctx.text.task_complete
      }</h2>${ctx.text.result_summary({
        commission_error_rate: s.commission_error_rate,
        omission_error_rate: s.omission_error_rate,
        mean_correct_go_rt: s.mean_correct_go_rt,
      })}</div>`;
    },
    choices: [ctx.text.continue_button],
    data: baseData({ phase: "completion", part: "completion" }),
  };
}

export { DEFAULT_OPTIONS };
