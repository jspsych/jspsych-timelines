import "./styles.css";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import type { JsPsych } from "jspsych";

import {
  AUDIO_NONE,
  AUDIO_UNPLAYED,
  HeadphoneToneKind,
  Playback,
  TrialSound,
  audioContextOf,
  audioSampleRate,
  headphoneIntervals,
  play,
  renderCalibrationSound,
  renderHeadphoneSound,
  renderTrialSound,
  trialIntervals,
} from "./audio";
import {
  AUDIO,
  DEFAULT_QUIET_CALIBRATION_DB,
  HEADPHONE_SCREEN,
  INSTRUCTION_CORRECT_MS,
  INSTRUCTION_MAX_ATTEMPTS,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
  WALKTHROUGH_QUIET_RE_CALIBRATION_DB,
  WALKTHROUGH_SNR_DB,
} from "./constants";
import {
  TrackSpec,
  allocateLevels,
  buildTrackSpecs,
  conditionLabel,
  plannedTrials,
  sampleDuration,
} from "./design";
import { ResolvedOptions, ToneDetectionOptions, resolveOptions, validateOptions } from "./options";
import {
  SimulatedAnswer,
  answerCorrectly,
  hasForcedRt,
  simulateHeadphoneAnswer,
  simulateListener,
} from "./simulation";
import { CLS, renderScreen, renderStage, textBlock } from "./stimuli";
import { TextConfig, WalkthroughArgs, defaultText } from "./text";
import { Track } from "./track";

export type Phase = "practice" | "test";

export interface Outcome {
  correct: boolean;
  rt: number | null;
}

/** Everything about the trial that is playing now, decided when its sound starts and shared by its screens. */
export interface Plan {
  n_intervals: number;
  /** 1-based interval with the tone (headphone screen: the quietest tone) */
  target_interval: number;
  frequency_hz: number;
  condition: string;
  /** the tracked level: dB SNR with a masker, dB FS in quiet; null in the headphone screen */
  level: number | null;
  tone_db: number;
  masker_db: number | null;
  tone_ms: number;
  ramp_ms: number;
  isi_ms: number;
  iti_ms: number;
  feedback_ms: number;
  /** planned length of the sound, ms */
  total_ms: number;
  trial_in_block: number;
  /** headphone screen: what each interval holds */
  kinds?: HeadphoneToneKind[];
  sound: TrialSound | null;
  playback: Playback | null;
  /** the progress text shown under the stage on the listening screen, or null */
  progress: string | null;
  /** the screens of this trial are done; the next presentation starts a new plan */
  used: boolean;
}

export interface Context {
  jsPsych: JsPsych;
  text: TextConfig;
  /** user options as given (for phase resolution) */
  user: ToneDetectionOptions;
  practice: ResolvedOptions;
  test: ResolvedOptions;
  state: {
    last: Outcome | null;
    plan: Plan | null;
    /** practice missed its criterion and may repeat */
    practice_failed: boolean;
    /** the criterion said "end": the test is skipped */
    ended: boolean;
    headphone: { n_trials: number; n_correct: number };
  };
}

export function createContext(jsPsych: JsPsych, options: ToneDetectionOptions = {}): Context {
  if (typeof (jsPsych as any).adaptive?.createStaircase !== "function") {
    throw new Error("tone-detection: needs jsPsych 8.4.0 or later (jsPsych.adaptive).");
  }
  const text: TextConfig = { ...defaultText, ...options.text };
  const test = resolveOptions(options, "test");
  const practice = resolveOptions(options, "practice");
  validateOptions(test, options, "test");
  validateOptions(practice, options, "practice");
  return {
    jsPsych,
    text,
    user: options,
    practice,
    test,
    state: {
      last: null,
      plan: null,
      practice_failed: false,
      ended: false,
      headphone: { n_trials: 0, n_correct: 0 },
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

/** Label of the response for interval `i` (1-based) in instruction text: a key cap, or the number on the button. */
function responseLabelHtml(ctx: Context, o: ResolvedOptions, i: number): string {
  if (isKeyboard(o)) return `<kbd>${keyName(o.response_keys[i - 1])}</kbd>`;
  return ctx.text.interval_label({ interval: i });
}

const device = (o: ResolvedOptions) => o.response_device as "keyboard" | "mouse" | "touch";

const labelsOf = (ctx: Context, n: number) =>
  Array.from({ length: n }, (_, i) => ctx.text.interval_label({ interval: i + 1 }));

const progressHtml = (ctx: Context, o: ResolvedOptions, trial: number, of: number | null) =>
  o.progress_indicator === "counter" ? `<p>${ctx.text.progress({ trial, of })}</p>` : "";

/** The tone's level (dB FS) and the masker's, for a tracked level. */
function levelsFor(
  o: ResolvedOptions,
  level: number
): { tone_db: number; masker_db: number | null } {
  return o.stimulus_set.masker === "none"
    ? { tone_db: level, masker_db: null }
    : { tone_db: o.presentation_level_db + level, masker_db: o.presentation_level_db };
}

/** The tracked level of a walkthrough trial: the tone clearly audible. */
function walkthroughLevel(o: ResolvedOptions): number {
  return o.stimulus_set.masker === "none"
    ? (o.calibration_level_db ?? DEFAULT_QUIET_CALIBRATION_DB) + WALKTHROUGH_QUIET_RE_CALIBRATION_DB
    : WALKTHROUGH_SNR_DB;
}

// -- display (no-response) trials --------------------------------------------------------------

interface DisplayArgs {
  phase: string;
  part: string;
  block?: number;
  stimulus: string | (() => string);
  duration: number | (() => number);
  data?: Record<string, unknown>;
  onFinish?: (d: any) => void;
}

/**
 * No-response display trial (feedback, ITI, the sounds playing): the keyboard plugin with `choices: "NO_KEYS"` and a
 * duration, whatever the response device (PACKAGE-STANDARD §10).
 */
export function createDisplayTrial(a: DisplayArgs) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: [TASK_CLASS],
    stimulus: a.stimulus as any,
    choices: "NO_KEYS",
    trial_duration: a.duration as any,
    data: baseData({ phase: a.phase, part: a.part, block: a.block ?? null, ...(a.data ?? {}) }),
    on_finish: (d: any) => {
      delete d.stimulus; // derived HTML; the descriptive fields carry what was shown
      a.onFinish?.(d);
    },
  };
}

// -- the trial: sound, answer, feedback, pause ----------------------------------------------------

interface PairConfig {
  ctx: Context;
  o: ResolvedOptions;
  /** "practice" | "test" | "instructions" */
  phase: string;
  /** part of the scorable row: "response", "instruction_check" or "headphone_check" */
  responsePart: string;
  /** called once when the trial begins: the plan (target interval, levels, durations) */
  begin: () => Plan;
  makeSound: (plan: Plan, sampleRate: number, gauss: () => number) => TrialSound;
  intervals: (plan: Plan) => Array<{ start_ms: number; end_ms: number }>;
  /** HTML under the stage */
  caption: (plan: Plan, stage: "listen" | "ask") => string;
  /** fields on every row of the trial (block, track, ...) */
  data: Record<string, unknown>;
  /** the simulated answer when no forced RT is given */
  simulate: (plan: Plan) => SimulatedAnswer;
  honourForcedRt: boolean;
  /** after the common answer fields are set */
  finish: (d: any, plan: Plan, info: { correct: boolean; responded: boolean }) => void;
  /** extra fields of the sound row */
  finishSound?: (d: any, plan: Plan) => void;
}

/**
 * Builds the two screens of one trial. The sounds play on the first (no keys, the interval markers light up as each interval plays);
 * the answer is taken on the second, so RT is measured from the end of the last interval and an early key press does nothing. Both
 * draw the same stage, so nothing moves. The plan is made when the first screen's parameters are read, and shared by both.
 */
function buildPair(c: PairConfig) {
  const { ctx, o } = c;
  const keyboard = isKeyboard(o);
  const labels = labelsOf(ctx, o.n_intervals);
  let plan: Plan | null = null;
  const ensure = (): Plan => {
    if (plan === null || plan.used) {
      plan = c.begin();
      ctx.state.plan = plan;
    }
    return plan;
  };

  /** What the audio context was doing when the sound started; "unplayed" when there is a context but no sound was started. */
  const stateOf = (p: Plan) =>
    p.playback ? p.playback.state : audioContextOf(ctx.jsPsych) ? AUDIO_UNPLAYED : AUDIO_NONE;

  const presentation = {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => renderStage(labels, c.caption(ensure(), "listen")),
    choices: "NO_KEYS",
    trial_duration: () => ensure().total_ms + AUDIO.start_delay_ms,
    data: baseData({ ...c.data, phase: c.phase, part: "stimulus" }),
    on_load: () => {
      const p = ensure();
      const display = ctx.jsPsych.getDisplayElement();
      const rate = audioSampleRate(ctx.jsPsych);
      if (rate !== null) {
        const gauss = () => ctx.jsPsych.randomization.sampleNormal(0, 1);
        p.sound = c.makeSound(p, rate, gauss);
        p.playback = play(ctx.jsPsych, p.sound.channels);
      }
      // the markers follow the intervals: the sound starts `start_delay_ms` after the screen
      c.intervals(p).forEach((iv, k) => {
        const marker = () =>
          display.querySelector<HTMLElement>(`.${CLS.marker}[data-interval="${k + 1}"]`);
        ctx.jsPsych.pluginAPI.setTimeout(
          () => marker()?.classList.add(CLS.lit),
          AUDIO.start_delay_ms + iv.start_ms
        );
        ctx.jsPsych.pluginAPI.setTimeout(
          () => marker()?.classList.remove(CLS.lit),
          AUDIO.start_delay_ms + iv.end_ms
        );
      });
    },
    on_finish: (d: any) => {
      delete d.stimulus;
      const p = ensure();
      p.playback?.stop();
      d.target_interval = p.target_interval;
      d.tone_frequency = p.frequency_hz;
      d.condition = p.condition;
      d.level = p.level;
      d.tone_level_db = p.tone_db;
      d.masker_level_db = p.masker_db;
      d.tone_duration = p.tone_ms;
      d.tone_ramp = p.ramp_ms;
      d.inter_item_interval = p.isi_ms;
      d.sound_duration = p.total_ms;
      d.audio_context_state = stateOf(p);
      d.peak_before_limiting = p.sound ? p.sound.peak : null;
      d.sound_limited = p.sound ? p.sound.limited : null;
      d.progress_text = p.progress;
      c.finishSound?.(d, p);
    },
  };

  const common: Record<string, unknown> = {
    css_classes: [TASK_CLASS],
    stimulus: () => renderStage(labels, c.caption(ensure(), "ask")),
    response_ends_trial: true,
    data: baseData({
      ...c.data,
      phase: c.phase,
      part: c.responsePart,
      n_alternatives: o.n_intervals,
      response_device: o.response_device,
    }),
    on_finish: (d: any) => {
      const p = ensure();
      delete d.stimulus;
      // jsPsych's simulation merge can turn a null response into {}: only a key or a button index with an RT counts
      const responded =
        (typeof d.response === "string" || typeof d.response === "number") &&
        typeof d.rt === "number";
      let given: number | null = null;
      if (responded) {
        given = keyboard
          ? o.response_keys.findIndex((k) => k.toLowerCase() === String(d.response).toLowerCase()) +
            1
          : (d.response as number) + 1;
        if (given < 1) given = null;
      }
      if (!responded || given === null) {
        d.response = null;
        d.rt = null;
      }
      const correct = given !== null && given === p.target_interval;
      d.response_interval = given;
      d.target_interval = p.target_interval;
      d.correct_response = keyboard
        ? o.response_keys[p.target_interval - 1]
        : p.target_interval - 1;
      d.correct = correct;
      d.condition = p.condition;
      d.tone_frequency = p.frequency_hz;
      d.standard_value = p.frequency_hz;
      d.trial_index_in_block = p.trial_in_block;
      d.audio_context_state = stateOf(p);
      c.finish(d, p, { correct, responded: given !== null });
      ctx.state.last = { correct, rt: d.rt };
      p.used = true;
    },
    simulation_options: () => {
      const p = ensure();
      // a global simulation option named after the row's part (`response`, `instruction_check`, `headphone_check`) wins: tests use it to
      // give wrong answers in the walkthrough and the headphone screen
      if ((ctx.jsPsych as any).simulationOptions?.[c.responsePart] !== undefined)
        return c.responsePart as any;
      if (c.honourForcedRt && hasForcedRt(ctx.jsPsych)) return {};
      const r = c.simulate(p);
      return {
        data: {
          response: keyboard ? o.response_keys[r.response_interval - 1] : r.response_interval - 1,
          rt: r.rt,
        },
      };
    },
  };
  const choices: string[] = keyboard ? o.response_keys.slice() : labels;
  const response: any = {
    type: keyboard ? jsPsychHtmlKeyboardResponse : jsPsychHtmlButtonResponse,
    choices,
    ...common,
  };
  if (!keyboard) {
    response.button_html = (choice: string) => `<button class="jspsych-btn">${choice}</button>`;
  }
  return { presentation: presentation as any, response, plan: () => plan };
}

// -- feedback, pause --------------------------------------------------------------------------------

export function feedbackText(ctx: Context, o: ResolvedOptions, out: Outcome): string {
  return o.trial_feedback === "accuracy"
    ? out.correct
      ? ctx.text.correct_feedback
      : ctx.text.incorrect_feedback
    : "";
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

function createFeedback(
  ctx: Context,
  o: ResolvedOptions,
  phase: string,
  block: number | null,
  getPlan: () => Plan | null
) {
  const labels = labelsOf(ctx, o.n_intervals);
  const trial: any = createDisplayTrial({
    phase,
    part: "feedback",
    block: block ?? undefined,
    duration: () => getPlan()?.feedback_ms ?? 0,
    stimulus: () => {
      const out = ctx.state.last!;
      const cls = out.correct ? "correct" : "incorrect";
      return renderStage(
        labels,
        textBlock(`<div class="${CLS.feedback} ${cls}">${feedbackText(ctx, o, out)}</div>`)
      );
    },
    onFinish: (d: any) => {
      d.feedback_duration = getPlan()?.feedback_ms ?? null;
      d.feedback_text = feedbackText(ctx, o, ctx.state.last!);
    },
  });
  trial.data.feedback_kind = o.trial_feedback;
  trial.data.feedback_condition = o.feedback_condition;
  return { timeline: [trial], conditional_function: () => shouldShowFeedback(o, ctx.state.last) };
}

function createIti(
  ctx: Context,
  o: ResolvedOptions,
  phase: string,
  block: number | null,
  getPlan: () => Plan | null
) {
  const labels = labelsOf(ctx, o.n_intervals);
  return {
    timeline: [
      createDisplayTrial({
        phase,
        part: "iti",
        block: block ?? undefined,
        duration: () => getPlan()?.iti_ms ?? 0,
        stimulus: () => renderStage(labels),
        onFinish: (d: any) => {
          d.iti = getPlan()?.iti_ms ?? null;
        },
      }),
    ],
    conditional_function: () => (getPlan()?.iti_ms ?? 0) > 0,
  };
}

// -- a track or block of trials --------------------------------------------------------------------

interface BlockState {
  count: number;
  track: Track | null;
  /** fixed levels for this block, in order */
  fixed: number[];
}

function taskPlan(
  ctx: Context,
  o: ResolvedOptions,
  spec: { condition: string; frequency_hz: number },
  level: number,
  trialInBlock: number
): Plan {
  const R = ctx.jsPsych.randomization;
  const { tone_db, masker_db } = levelsFor(o, level);
  const tone_ms = sampleDuration(ctx.jsPsych, o.stimulus_duration_ms as any);
  const isi_ms = sampleDuration(ctx.jsPsych, o.inter_item_interval_ms);
  const iv = trialIntervals(o.n_intervals, tone_ms, isi_ms);
  return {
    n_intervals: o.n_intervals,
    target_interval: R.randomInt(1, o.n_intervals),
    frequency_hz: spec.frequency_hz,
    condition: spec.condition,
    level,
    tone_db,
    masker_db,
    tone_ms,
    ramp_ms: sampleDuration(ctx.jsPsych, o.tone_ramp_ms),
    isi_ms,
    iti_ms: sampleDuration(ctx.jsPsych, o.iti_ms),
    feedback_ms: sampleDuration(ctx.jsPsych, o.feedback_duration_ms),
    total_ms: iv[iv.length - 1].end_ms,
    trial_in_block: trialInBlock,
    sound: null,
    playback: null,
    progress: null,
    used: false,
  };
}

const soundOf = (p: Plan, sampleRate: number, gauss: () => number): TrialSound =>
  renderTrialSound(
    {
      sampleRate,
      n_intervals: p.n_intervals,
      target_interval: p.target_interval,
      frequency_hz: p.frequency_hz,
      tone_ms: p.tone_ms,
      ramp_ms: p.ramp_ms,
      isi_ms: p.isi_ms,
      tone_db: p.tone_db,
      masker_db: p.masker_db,
    },
    gauss
  );

const intervalsOf = (p: Plan) => trialIntervals(p.n_intervals, p.tone_ms, p.isi_ms);

/**
 * One block of the task: a track of one condition. A staircase block runs until its stop rule fires (a practice block with a
 * staircase runs `practice_trials` trials); a fixed-level block runs `n` trials with the levels balanced over `difficulty_levels`.
 * Each iteration is one trial: sounds, answer, feedback, pause.
 */
export function createBlock(
  ctx: Context,
  phase: Phase,
  spec: TrackSpec,
  extra: { attempt?: number; n_tracks?: number } = {}
) {
  const o = phase === "practice" ? ctx.practice : ctx.test;
  const jsPsych = ctx.jsPsych;
  const n =
    phase === "practice"
      ? ctx.test.practice_trials
      : o.adaptive === null
      ? (o.trials_per_block as number)
      : null;
  const of = plannedTrials(o, phase, ctx.test.practice_trials);
  const st: BlockState = { count: 0, track: null, fixed: [] };

  const pair = buildPair({
    ctx,
    o,
    phase,
    responsePart: "response",
    begin: () => {
      const level = st.track ? st.track.level : st.fixed[st.count];
      return taskPlan(ctx, o, spec, level, st.count + 1);
    },
    makeSound: soundOf,
    intervals: intervalsOf,
    caption: (p, stage) => {
      p.progress =
        o.progress_indicator === "counter"
          ? ctx.text.progress({ trial: p.trial_in_block, of })
          : null;
      return textBlock(
        `<p>${
          stage === "listen"
            ? ctx.text.listen
            : ctx.text.response_prompt({
                device: device(o),
                n_intervals: o.n_intervals,
                responses: o.response_keys.map((_, i) => responseLabelHtml(ctx, o, i + 1)),
              })
        }</p>${progressHtml(ctx, o, p.trial_in_block, of)}`
      );
    },
    data: {
      block: spec.block,
      track_id: spec.track_id,
      ...(phase === "practice" ? { practice_attempt: extra.attempt ?? 1 } : {}),
    },
    simulate: (p) =>
      simulateListener(jsPsych, {
        level: p.level as number,
        n_intervals: p.n_intervals,
        target_interval: p.target_interval,
        masker: o.stimulus_set.masker !== "none",
      }),
    honourForcedRt: true,
    finish: (d, p) => {
      d.level_unit = o.level_unit;
      d.trial_in_track = p.trial_in_block;
      d.block = spec.block;
      d.track_id = spec.track_id;
      d.masker_level_db = p.masker_db;
      d.tone_level_db = p.tone_db;
      d.calibration_level_db = o.calibration_level_db;
      d.level_re_calibration_db =
        o.calibration_level_db === null
          ? null
          : (p.masker_db ?? p.tone_db) - o.calibration_level_db;
      d.inter_item_interval = p.isi_ms;
      d.tone_duration = p.tone_ms;
      d.tone_ramp = p.ramp_ms;
      d.iti = p.iti_ms;
      d.level = p.level;
      if (st.track) {
        const u = st.track.update(d.correct);
        d.step_size = u.step_down;
        d.step_size_up = u.step_up;
        d.is_reversal = u.is_reversal;
        d.reversal_count = u.reversal_count;
        d.next_level = u.next_level;
        d.track_threshold = st.track.estimate();
        d.track_state = st.track.compact();
        d.track_done = st.track.done;
        if (st.track.done) d.track_final = st.track.snapshot();
      } else {
        d.step_size = null;
        d.is_reversal = null;
        d.reversal_count = null;
        d.next_level = null;
        d.track_threshold = null;
      }
      st.count++;
    },
  });

  const blockDone = () =>
    (n !== null && st.count >= n) || (n === null && st.track !== null && st.track.done);
  return {
    timeline: [
      pair.presentation,
      pair.response,
      createFeedback(ctx, o, phase, spec.block, pair.plan),
      createIti(ctx, o, phase, spec.block, pair.plan),
    ],
    on_timeline_start: () => {
      st.count = 0;
      if (o.adaptive) {
        st.track = new Track(
          jsPsych,
          o.adaptive,
          `${phase}-${spec.block}-${spec.condition}`,
          phase === "practice"
        );
        st.fixed = [];
      } else {
        st.track = null;
        st.fixed = allocateLevels(jsPsych, o.difficulty_levels as number[], n as number);
      }
    },
    loop_function: () => !blockDone(),
  };
}

// -- instruction pages ---------------------------------------------------------------------------

function textPage(ctx: Context, html: string, phase: string, part: string, label?: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: textBlock(html),
    choices: [label ?? ctx.text.continue_button],
    data: baseData({ phase, part }),
  };
}

export function createTransition(ctx: Context, html: string, phase: string, part = "transition") {
  return textPage(ctx, `<p>${html}</p>`, phase, part);
}

export function createInstructions(ctx: Context) {
  const o = ctx.test;
  if (o.instruction_format === "experimenter") return { timeline: [] as any[] };
  const t = ctx.text;
  const masker = o.stimulus_set.masker !== "none";
  const pages: string[] = [t.instruction_intro({ n_intervals: o.n_intervals, masker })];
  if (o.environment_instructions === "quiet_room") pages.push(t.instruction_environment);
  pages.push(
    t.instruction_response({
      device: device(o),
      n_intervals: o.n_intervals,
      responses: o.response_keys.map((_, i) => responseLabelHtml(ctx, o, i + 1)),
    })
  );
  // advice on how to do the task gets its own page, after the rules
  pages.push(t.instruction_guess);
  return { timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction")) };
}

// -- hearing question, volume setting, headphone check -----------------------------------------------

export function createHearingCheck(ctx: Context) {
  const t = ctx.text;
  return {
    timeline: [
      {
        type: jsPsychHtmlButtonResponse,
        css_classes: [TASK_CLASS],
        stimulus: textBlock(t.hearing_question),
        choices: [t.hearing_no_difficulty, t.hearing_some_difficulty],
        data: baseData({ phase: "instructions", part: "hearing_check" }),
        // the answer is recorded and nobody is excluded
        on_finish: (d: any) => {
          delete d.stimulus;
          d.hearing_difficulty = d.response === 1;
        },
      },
    ],
    conditional_function: () => ctx.test.participant_eligibility === "hearing",
  };
}

/**
 * The volume-setting screen: a looping calibration sound at a fixed digital level (`calibration_level_db`); the participant sets the volume
 * of their device until it is just detectable (or comfortable). The page cannot read the device volume, so the data record the digital level
 * and what the participant was asked.
 */
export function createVolumeCalibration(ctx: Context) {
  const o = ctx.test;
  const t = ctx.text;
  const masker = o.stimulus_set.masker !== "none";
  const sound = masker ? ("noise" as const) : ("tone" as const);
  const level = o.calibration_level_db as number;
  let playback: Playback | null = null;
  let plays = 0;
  let startState = "none";
  const start = (c: HTMLElement | null) => {
    const rate = audioSampleRate(ctx.jsPsych);
    if (rate === null) return;
    const gauss = () => ctx.jsPsych.randomization.sampleNormal(0, 1);
    const samples = renderCalibrationSound(rate, sound, level, o.tone_frequency_hz[0], gauss);
    playback = play(ctx.jsPsych, [samples], { loop: true });
    plays++;
    startState = playback.state;
    if (c) c.textContent = t.calibration_stop;
  };
  const stop = (c: HTMLElement | null) => {
    playback?.stop();
    playback = null;
    if (c) c.textContent = t.calibration_play;
  };
  return {
    timeline: [
      {
        type: jsPsychHtmlButtonResponse,
        css_classes: [TASK_CLASS],
        stimulus: textBlock(
          `${t.calibration_page({
            target: o.calibration_target,
            sound,
          })}<p><button type="button" class="${CLS.sound}">${t.calibration_play}</button></p>`
        ),
        choices: [t.calibration_done],
        data: baseData({
          phase: "instructions",
          part: "volume_calibration",
          calibration_level_db: level,
          calibration_target: o.calibration_target,
          calibration_sound: sound,
          device_volume_setting: o.volume_calibration,
          presentation_level_db: o.presentation_level_db,
        }),
        on_load: () => {
          plays = 0;
          startState = "none";
          const btn = ctx.jsPsych.getDisplayElement().querySelector<HTMLElement>(`.${CLS.sound}`);
          start(btn);
          btn?.addEventListener("click", () => (playback ? stop(btn) : start(btn)));
        },
        on_finish: (d: any) => {
          delete d.stimulus;
          playback?.stop();
          playback = null;
          d.calibration_plays = plays;
          d.audio_context_state = startState;
        },
      },
    ],
    conditional_function: () => ctx.test.volume_calibration === "participant_adjusted",
  };
}

/**
 * The headphone screen (Woods et al., 2017): three tones, say which was the quietest. Nobody is excluded: every row carries the number
 * correct so far and the last row has the final count.
 */
export function createHeadphoneCheck(ctx: Context) {
  const o = ctx.test;
  const t = ctx.text;
  const nTrials = o.headphone_check_trials;
  const nIntervals = 3;
  const labels = labelsOf(ctx, nIntervals);
  const jsPsych = ctx.jsPsych;
  const R = jsPsych.randomization;
  // the screen has three intervals whatever task_variant says: it needs its own keys when the task has two
  const keys = isKeyboard(o) ? Array.from({ length: nIntervals }, (_, i) => String(i + 1)) : [];
  const ho: ResolvedOptions = {
    ...o,
    n_intervals: nIntervals,
    response_keys: keys.length ? keys : o.response_keys,
  };
  const hResponses = keys.length ? keys.map((k) => `<kbd>${keyName(k)}</kbd>`) : labels;
  const pair = buildPair({
    ctx,
    o: ho,
    phase: "instructions",
    responsePart: "headphone_check",
    begin: () => {
      const target = R.randomInt(1, nIntervals);
      const others = [1, 2, 3].filter((i) => i !== target);
      const anti = others[R.randomInt(0, 1)];
      const kinds: HeadphoneToneKind[] = [1, 2, 3].map((i) =>
        i === target ? "target" : i === anti ? "antiphase" : "foil"
      );
      const iv = headphoneIntervals(nIntervals);
      return {
        n_intervals: nIntervals,
        target_interval: target,
        frequency_hz: HEADPHONE_SCREEN.frequency_hz,
        condition: "headphone_check",
        level: null,
        tone_db: HEADPHONE_SCREEN.level_db,
        masker_db: null,
        tone_ms: HEADPHONE_SCREEN.tone_ms,
        ramp_ms: HEADPHONE_SCREEN.ramp_ms,
        isi_ms: HEADPHONE_SCREEN.gap_ms,
        iti_ms: 0,
        feedback_ms: 0,
        total_ms: iv[iv.length - 1].end_ms,
        trial_in_block: ctx.state.headphone.n_trials + 1,
        kinds,
        sound: null,
        playback: null,
        progress: null,
        used: false,
      };
    },
    makeSound: (p, sampleRate) =>
      renderHeadphoneSound({ sampleRate, kinds: p.kinds as HeadphoneToneKind[] }),
    intervals: () => headphoneIntervals(nIntervals),
    caption: (_p, stage) =>
      textBlock(
        `<p>${
          stage === "listen"
            ? t.headphone_listen
            : t.headphone_question({ device: device(o), responses: hResponses })
        }</p>`
      ),
    data: { headphone_screen: o.headphone_screen },
    simulate: (p) => simulateHeadphoneAnswer(jsPsych, p.target_interval, nIntervals),
    honourForcedRt: true,
    finish: (d, p) => {
      ctx.state.headphone.n_trials++;
      if (d.correct) ctx.state.headphone.n_correct++;
      d.headphone_check_n_correct = ctx.state.headphone.n_correct;
      d.headphone_check_n_trials = ctx.state.headphone.n_trials;
      d.antiphase_interval = (p.kinds as HeadphoneToneKind[]).indexOf("antiphase") + 1;
    },
  });
  const pages = o.instruction_format === "text";
  return {
    timeline: [
      ...(pages
        ? [
            textPage(
              ctx,
              t.headphone_intro + t.headphone_instructions({ n_trials: nTrials }),
              "instructions",
              "instruction"
            ),
          ]
        : []),
      {
        timeline: [{ timeline: [pair.presentation, pair.response], repetitions: nTrials }],
        on_timeline_start: () => {
          ctx.state.headphone = { n_trials: 0, n_correct: 0 };
        },
      },
      ...(pages ? [textPage(ctx, t.headphone_done, "instructions", "instruction")] : []),
    ],
    conditional_function: () => ctx.test.headphone_check === "screening_task",
  };
}

// -- instruction walkthrough ---------------------------------------------------------------------

/** The intervals the walkthrough puts the tone in: the listening example, then the check steps, alternating between intervals. */
export function walkthroughTargets(nIntervals: number): { listen: number; steps: number[] } {
  return nIntervals === 3 ? { listen: 2, steps: [3, 1] } : { listen: 1, steps: [2, 1] };
}

function walkthroughArgs(ctx: Context, target: number): WalkthroughArgs {
  const o = ctx.test;
  return {
    n_intervals: o.n_intervals,
    target_interval: target,
    masker: o.stimulus_set.masker !== "none",
    response_for: (i) => responseLabelHtml(ctx, o, i),
    device: device(o),
    frequency_hz: o.tone_frequency_hz[0],
  };
}

/** The plan of a walkthrough trial: the first condition, the tone clearly audible, the tone in the given interval. */
function walkthroughPlan(ctx: Context, target: number): Plan {
  const o = ctx.test;
  const p = taskPlan(
    ctx,
    o,
    { condition: conditionLabel(o.tone_frequency_hz[0]), frequency_hz: o.tone_frequency_hz[0] },
    walkthroughLevel(o),
    1
  );
  return { ...p, target_interval: target, iti_ms: 0, feedback_ms: 0 };
}

/**
 * Interactive walkthrough (PACKAGE-STANDARD §6a, adapted to sound). A listening example: the tone is in a named interval, and the participant can
 * play it again as often as they like. Then check steps: the tone, clearly audible, is in another interval; the participant answers with the task's
 * own response mapping. A wrong answer gives a hint and plays it again; after INSTRUCTION_MAX_ATTEMPTS the answer is given and it moves on. The sounds keep
 * their real durations; there is no withheld-response step. Rows are `phase: "instructions"`, `part: "instruction_check"` (hints and confirmations:
 * `instruction_feedback`; the listening example: `instruction_example`) and are never scored.
 */
export function createInstructionWalkthrough(ctx: Context) {
  const o = ctx.test;
  const mode = o.instruction_demonstration;
  if (o.instruction_format !== "text" || mode === "none") return { timeline: [] as any[] };
  const t = ctx.text;
  const labels = labelsOf(ctx, o.n_intervals);
  const targets = walkthroughTargets(o.n_intervals);
  const nodes: any[] = [
    textPage(
      ctx,
      mode === "examples" ? t.instruction_examples_intro : t.instruction_demo_intro,
      "instructions",
      "instruction"
    ),
  ];

  // the listening example: the sound, then a page with the caption, a replay button and a continue button
  const listenArgs = walkthroughArgs(ctx, targets.listen);
  const listenPair = buildPair({
    ctx,
    o,
    phase: "instructions",
    responsePart: "instruction_check",
    begin: () => walkthroughPlan(ctx, targets.listen),
    makeSound: soundOf,
    intervals: intervalsOf,
    caption: () => textBlock(`<p>${t.listen}</p>`),
    data: {},
    simulate: () => answerCorrectly(targets.listen),
    honourForcedRt: false,
    finish: () => {},
  });
  const listenNote = {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => renderStage(labels, textBlock(t.instruction_listen(listenArgs))),
    // Continue first: the layout check (and a quick participant) takes the first button; "Listen again" is the second
    choices: [t.continue_button, t.replay_button],
    data: baseData({
      phase: "instructions",
      part: "instruction_example",
      target_interval: targets.listen,
    }),
    on_finish: (d: any) => {
      delete d.stimulus;
      d.replayed = d.response === 1;
    },
    // data-only simulation goes on at once
    simulation_options: { data: { response: 0, rt: 400 } },
  };
  nodes.push({
    timeline: [listenPair.presentation, listenNote],
    loop_function: (data: any) => data.last(1).values()[0]?.response === 1,
  });
  if (mode === "examples") return { timeline: nodes };

  for (const target of targets.steps) {
    const args = walkthroughArgs(ctx, target);
    const state = { attempt: 0, correct: null as boolean | null };
    const shown = (html: string) => renderStage(labels, textBlock(html));
    const stepData = { phase: "instructions", target_interval: target };
    const pair = buildPair({
      ctx,
      o,
      phase: "instructions",
      responsePart: "instruction_check",
      begin: () => walkthroughPlan(ctx, target),
      makeSound: soundOf,
      intervals: intervalsOf,
      caption: (_p, stage) =>
        textBlock(stage === "listen" ? `<p>${t.listen}</p>` : t.instruction_step(args)),
      data: {},
      // data-only simulation answers correctly
      simulate: () => answerCorrectly(target),
      honourForcedRt: false,
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
        pair.presentation,
        pair.response,
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

export function createTestIntro(ctx: Context, nTracks: number) {
  return textPage(
    ctx,
    ctx.text.instruction_test_intro({ n_tracks: nTracks }),
    "instructions",
    "instruction"
  );
}

// -- practice with a criterion -------------------------------------------------------------------

/** Accuracy over the last `window` practice trials of an attempt (null = the whole block); null if there are none. */
export function practiceAccuracy(
  ctx: Context,
  attempt: number,
  window: number | null
): number | null {
  const rows = ctx.jsPsych.data
    .get()
    .filter({ task: TASK_NAME, phase: "practice", part: "response", practice_attempt: attempt })
    .values();
  const recent = window === null ? rows : rows.slice(-window);
  if (!recent.length) return null;
  return recent.filter((r: any) => r.correct === true).length / recent.length;
}

/**
 * Practice, with `practice_criterion` if set: a block at fixed levels, then a check of accuracy; a miss repeats the block (up to `max_repeats`),
 * continues, or ends the task. The result is written to the last row of the attempt (`practice_criterion_met`, `practice_accuracy`).
 */
export function createPractice(ctx: Context): any[] {
  const crit = ctx.test.practice_criterion;
  const n = ctx.test.practice_trials;
  if (n <= 0) return [];
  const spec: TrackSpec = {
    block: 1,
    track_id: 1,
    condition: conditionLabel(ctx.test.tone_frequency_hz[0]),
    frequency_hz: ctx.test.tone_frequency_hz[0],
  };
  const out: any[] = [];
  if (ctx.test.instruction_format === "text") out.push(createPracticeIntro(ctx));
  if (!crit) {
    out.push(createBlock(ctx, "practice", spec, { attempt: 1 }));
    return out;
  }
  const attempts = crit.on_fail === "repeat" ? crit.max_repeats + 1 : 1;
  for (let k = 1; k <= attempts; k++) {
    const nodes: any[] = [];
    if (k > 1) nodes.push(textPage(ctx, ctx.text.practice_repeat, "instructions", "instruction"));
    nodes.push(createBlock(ctx, "practice", spec, { attempt: k }));
    out.push({
      timeline: nodes,
      conditional_function: () => !ctx.state.ended && (k === 1 || ctx.state.practice_failed),
      on_timeline_finish: () => {
        const acc = practiceAccuracy(ctx, k, crit.window);
        const met = acc === null || acc >= crit.accuracy;
        ctx.state.practice_failed = !met;
        if (!met && crit.on_fail === "end") ctx.state.ended = true;
        ctx.jsPsych.data.addDataToLastTrial({
          practice_criterion_met: met,
          practice_accuracy: acc,
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

// -- the test --------------------------------------------------------------------------------------

/** The pause after a track. */
export function createRestBreak(ctx: Context, track: number, nTracks: number) {
  return {
    ...textPage(
      ctx,
      `<p>${ctx.text.track_complete({ track, n_tracks: nTracks })}</p>`,
      "test",
      "rest"
    ),
    data: baseData({ phase: "test", part: "rest", block: track }),
  };
}

// -- completion --------------------------------------------------------------------------------

export function createCompletion(ctx: Context, calculate: (data: any) => any) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      const s = calculate(ctx.jsPsych.data.get());
      return textBlock(
        `<h2>${ctx.text.task_complete}</h2>${ctx.text.result_summary({
          threshold: s.threshold,
          level_unit: s.level_unit ?? ctx.test.level_unit,
          n_trials: s.n_trials,
          accuracy: s.accuracy,
        })}`
      );
    },
    choices: [ctx.text.continue_button],
    data: baseData({ phase: "completion", part: "completion" }),
  };
}

export { buildTrackSpecs, renderScreen };
