/**
 * Options for the stop-signal (countermanding) timeline.
 *
 * Every default below states its source. The anchor is the STOP-IT jsPsych version (Verbruggen, S010),
 * chosen by the spec generator (coverage 0.95, lead 0.50, no escalation). Defaults that differ from
 * the generated spec are listed with reasons in packages/stop-signal-task/DEFAULTS.md.
 */
import type { TextConfig } from "./text";

// -- value types --------------------------------------------------------------------------------

export type TrialType = "go" | "stop";

/** Fixed duration, or a uniform jitter range sampled in `step` increments. */
export type DurationSpec = number | { min: number; max: number; step?: number };

/** Proportion of each trial type. */
export type TrialTypeProportions = Partial<Record<TrialType, number>>;

export type GoForm = "arrows" | "arrows_in_circle";
export type StopSignalForm = "arrow_turns_red" | "circle_turns_red" | "border" | "tone";

export interface StopSignalStimulusSet {
  /**
   * The go stimulus: a left or right arrow, plain or inside a circle (the circle is what turns red for
   * `stop_signal: "circle_turns_red"`). (default: "arrows" — STOP-IT, S010; 7 of 14 sources use left/right arrows)
   */
  go?: GoForm;
  /**
   * The stop signal. `"arrow_turns_red"` (the go arrow changes colour), `"circle_turns_red"` (needs `go: "arrows_in_circle"`),
   * `"border"` (a blue frame around the stage), or `"tone"` (a 750 Hz beep; needs `stimulus_modality: "auditory"`).
   * (default: "arrow_turns_red" — STOP-IT, S010: the go arrow turns red)
   */
  stop_signal?: StopSignalForm;
}

/** Go-stimulus and stop-signal exposure; a bare number or null is the go stimulus. */
export type StimulusDurationOptions =
  | number
  | null
  | { go?: number | null; stop_signal?: number | null };

/** Ordering rules (PACKAGE-STANDARD §2a). `<condition>` is "go" or "stop". */
export interface SequenceConstraints {
  max_run?: number | Record<string, number>;
  min_gap?: Record<string, number>;
  max_gap?: Record<string, number>;
  run_length?: Record<string, number[]>;
  start_with?: Record<string, number>;
  no_immediate_repeat?: true | string[];
  balanced_transitions?: true;
  cycle_length?: number;
}

export interface DiscontinueRule {
  /** Stop adapting after this many stop trials. */
  trials?: number;
  /** Stop adapting after this many reversals of direction. */
  reversals?: number;
  /** Stop after this many successive failed stops. */
  consecutive_failures?: number;
  /** Stop after this many failed stops since the delay last changed. */
  failures_at_level?: number;
  /** Stop after this many successful stops at the maximum delay (needs a finite upper bound). */
  ceiling?: number;
}

/**
 * The stop-signal-delay staircase (`jsPsych.adaptive`). The tracked level is the delay in ms; a successful
 * stop makes the next stop harder (longer delay), a failed stop easier.
 */
export interface AdaptiveOptions {
  /**
   * The rule. `staircase_1up_1down` moves the delay after every stop trial (it converges where p(stop) = `target_accuracy`, 0.5
   * with equal steps); `staircase_1up_2down` and `staircase_1up_3down` need 2 or 3 successful stops in a row
   * to lengthen the delay (they converge near 0.707 and 0.794). The dossier calls the procedure "tracking" in all
   * 4 sources that report one; that is `staircase_1up_1down`. Other vocabulary values are not implemented.
   * (default: "staircase_1up_1down" — STOP-IT "tracking" targeting 50% successful stops, S010)
   */
  procedure?:
    | "staircase_1up_1down"
    | "staircase_1up_2down"
    | "staircase_1up_3down"
    | "ascending_discontinue"
    | "quest"
    | "rt_based";
  /** Delay of the first stop trial, ms. (default: 200 — STOP-IT, S010; 9 sources report 183 to 350) */
  start_level?: number;
  /**
   * Step in ms: one number, or `{ up, down }` (up = after a successful stop, down = after a failed one).
   * A single number is the larger step; the other is derived from `target_accuracy` so that the delay is stable at that
   * stopping rate. Together with `target_accuracy` it must agree (p x up = (1 - p) x down), or this throws.
   * (default: 50 — STOP-IT, S010; also 47, 33.3 and {up: 25, down: 50})
   */
  step_size?: number | { up: number; down: number };
  /**
   * The proportion of successful stops the staircase converges on, for `staircase_1up_1down`.
   * With `{ up, down }` steps and no target it is down / (up + down). (default: 0.5 — S001 recommendation, S010; 0.667 in S082)
   */
  target_accuracy?: number;
  /** `[min, max]` of the delay in ms; null on a side means no limit. (default: [50, 1200] — STOP-IT, S010) */
  bounds?: [number | null, number | null];
  /**
   * Freeze the delay when a rule is met (the delay then stays at its last value and the data record the
   * staircase as done). No study in the dossier reports one. (default: null — none)
   */
  discontinue_rule?: DiscontinueRule | null;
  /**
   * `"single"`: one staircase for all stop trials. `"per_condition"`: one independent staircase for each go direction
   * (left, right); the stop trial's go direction picks it. (default: "single" — STOP-IT, S010; per stimulus category in S072)
   */
  tracks?: "single" | "per_condition";
  /**
   * When the delay returns to `start_level`: `"never"` (practice carries into the test), `"block"` (every block starts
   * fresh, practice included), `"phase"` (the test starts fresh after practice, as in S082).
   * (default: "never" — STOP-IT "continuous", S010)
   */
  reset?: "never" | "block" | "phase";
}

export interface PracticeCriterion {
  /**
   * Minimum proportion of correct go responses (omissions and wrong keys count as errors) over the window.
   * Stop trials do not count: their outcome depends on the staircase. (default: none — spec lists go accuracy 0.7 and 0.8)
   */
  accuracy?: number;
  /** Number of most recent practice trials the accuracy is computed over; null = the whole practice block. (default: null) */
  window?: number | null;
  /** `"repeat"` runs practice again, `"continue"` goes on to the test, `"end"` skips the test. (default: "repeat") */
  on_fail?: "repeat" | "continue" | "end";
  /** Most repeats before the task continues. (default: 2) */
  max_repeats?: number;
}

export interface StopSignalTaskOptions {
  // -- timing --
  /**
   * Rest between test blocks: `null` = self-paced (a continue button), a number = the continue button is
   * enabled after that long, 0 = no rest screen. No effect with one block.
   * (default: 15000 — STOP-IT, S010; 60000 in S072)
   */
  break_duration_ms?: number | null;
  /** How long trial feedback stays on screen. (default: 750 — STOP-IT, S010) */
  feedback_duration_ms?: DurationSpec;
  /** Fixation duration; 0 = no fixation. `{min, max, step}` draws a uniform jitter per trial. (default: 250 — STOP-IT, S010) */
  fixation_duration_ms?: DurationSpec;
  /**
   * Blank interval after the trial (and its feedback); 0 = none. `{min, max, step}` draws a jitter.
   * (default: 500 — STOP-IT, S010)
   */
  iti_ms?: DurationSpec;
  /**
   * Time allowed to respond, from go-stimulus onset (the stop signal comes inside this window). Must be a number:
   * a stop trial would never end without it. (default: 1250 — STOP-IT, S010)
   */
  response_window_ms?: number | null;
  /**
   * Exposure of the go stimulus and of the stop signal. A number or null is the go stimulus (`null` = until response or the window ends);
   * `{ go, stop_signal }` sets both; a null `stop_signal` stays on until the trial ends (the tone then lasts 75 ms).
   * (default: { go: null, stop_signal: null } — STOP-IT, S010; go 850 in S011, 150 in S080; signal 500 in S011, 75 in S057)
   */
  stimulus_duration_ms?: StimulusDurationOptions;

  // -- stimulus --
  /** Modality of the stop signal. `"auditory"` needs `stimulus_set.stop_signal: "tone"`. (default: "visual" — STOP-IT, S010) */
  stimulus_modality?: "visual" | "auditory" | "audiovisual" | "tactile";
  /** Stimulus material, keyed by role: `go` and `stop_signal`. */
  stimulus_set?: StopSignalStimulusSet;

  // -- design --
  /**
   * Proportion of trial types per block: `{ stop: 0.25, go: 0.75 }`. A list gives one map per block, the last repeating
   * (a block schedule such as `[{stop: 0.4, go: 0.6}, {stop: 0.2, go: 0.8}]`). Counts per block are exact (largest remainder).
   * (default: { stop: 0.25, go: 0.75 } — 0.25 in 8 of 13 sources, S010)
   */
  condition_proportions?: TrialTypeProportions | TrialTypeProportions[];
  /**
   * Fixed stop-signal delays in ms (the constant-stimuli alternative to the staircase): a list of delays
   * (each stop trial gets one, balanced over the list), or `{ min, max, step }` for a random delay in that range.
   * Giving it without `adaptive` switches the staircase off; giving both is an error.
   * (default: null — the staircase; fixed sets 17/67/117/167 in S008, 11 values 0-500 in S025, random 100-450 in S014)
   */
  difficulty_levels?: number[] | { min: number; max: number; step?: number } | null;
  /**
   * Number of test blocks. (default: 4 — STOP-IT, S010; 12 in S011, 8 in S072 and S082)
   */
  n_blocks?: number;
  /**
   * Total test trials, split over `n_blocks`. Given alone it sets `trials_per_block`; given with both it must agree.
   * (default: n_blocks x trials_per_block = 256 — STOP-IT, S010)
   */
  n_test_trials?: number;
  /**
   * Number of trials in each test block. (default: 64 — STOP-IT, S010)
   */
  trials_per_block?: number;
  /**
   * Ordering rules within each block (PACKAGE-STANDARD §2a); `<condition>` is "go" or "stop"; null = a plain shuffled list with
   * exact proportions. The default cycle rule applies only when every block holds whole 8-trial cycles that carry the
   * proportions exactly; with other proportions or block sizes it is dropped, and a cycle_length you give that does not fit throws.
   * (default: { cycle_length: 8 } — STOP-IT "randomized within repeated 8-trial design cycles", S010)
   */
  sequence_constraints?: SequenceConstraints | null;

  // -- response --
  /** "keyboard" keys; "mouse" and "touch" use two on-screen buttons. Others are not implemented. (default: "keyboard" — S010) */
  response_device?: "keyboard" | "mouse" | "touch" | "microphone" | "eye_tracker" | "gamepad";
  /**
   * Keys for the left-arrow and the right-arrow response; arrow keys as `"ArrowLeft"`.
   * (default: ["ArrowLeft", "ArrowRight"] — STOP-IT, S010; Z/M, B/N, V/N, A/L in others)
   */
  response_keys?: string[];
  /**
   * How the key mapping is assigned. Only "fixed": the arrows point left or right, so the mapping is spatial.
   * (default: "fixed" — S010)
   */
  response_mapping_counterbalancing?:
    | "fixed"
    | "counterbalanced"
    | "random_per_participant"
    | "within_participant";

  // -- adaptive procedure --
  /**
   * The stop-signal-delay staircase, or null for fixed delays (`difficulty_levels`). Fields you leave out
   * take the defaults of `AdaptiveOptions`. The staircase state (`toJSON()`) is recorded in the data.
   * (default: { procedure: "staircase_1up_1down", start_level: 200, step_size: 50, target_accuracy: 0.5, bounds: [50, 1200],
   * tracks: "single", reset: "never" } — STOP-IT, S010)
   */
  adaptive?: AdaptiveOptions | null;

  // -- procedure --
  /**
   * "computer_only" ends the experiment on touch-only devices. Others are not implemented.
   * (default: "none" — STOP-IT requires fullscreen, an 800x600 window and no Safari, S010; see DEFAULTS.md)
   */
  device_eligibility?: "none" | "computer_only" | "browser_restricted" | "hardware_required";
  /**
   * Accuracy criterion for practice: below it practice repeats (or continues, or ends the task).
   * (default: null — none in STOP-IT, S010; S011 and S086 use one)
   */
  practice_criterion?: PracticeCriterion | null;
  /** Practice trials before the test; 0 = none. One block with the staircase running. (default: 32 — STOP-IT, S010) */
  practice_trials?: number;

  // -- feedback --
  /**
   * Summary after each test block: go accuracy, go RT and the stopping rate, with a reminder not to wait when
   * the stopping rate is above 60%. `points` is not implemented.
   * (default: "accuracy_rt" — STOP-IT "performance summary", S010)
   */
  block_feedback?: "none" | "accuracy" | "rt" | "accuracy_rt" | "points" | "progress";
  /** On which trials trial feedback is shown. Ignored when `trial_feedback` is "none". (default: "all" — S010) */
  feedback_condition?: "all" | "errors_only" | "correct_only";
  /**
   * What trial feedback shows. "points" and "reward_outcome" are not implemented.
   * (default: "none" — STOP-IT shows trial feedback in practice only; practice default below, S010)
   */
  trial_feedback?:
    | "none"
    | "accuracy"
    | "rt"
    | "accuracy_rt"
    | "points"
    | "reward_outcome"
    | "correct_answer";
  /** Incentive scheme. Only "none" is implemented. (default: "none" — S010) */
  performance_incentive?: "none" | "bonus" | "points_only" | "fixed_payment";
  /**
   * Instruction about how to balance responding and stopping (S001 recommends telling participants not to wait).
   * `"dont_wait"`, `"dont_wait_plus_tracking_explanation"` (adds that the signal gets later or earlier with performance),
   * `"balance_speed_and_stopping"`, or `"none"`.
   * (default: "dont_wait_plus_tracking_explanation" — STOP-IT, S010)
   */
  strategy_instruction?:
    | "none"
    | "dont_wait"
    | "dont_wait_plus_tracking_explanation"
    | "balance_speed_and_stopping";
  /** Adaptation of the whole protocol for a population. Only "standard" is implemented. (default: "standard" — S010) */
  population_protocol?: "standard" | "child" | "gamified_child" | "clinical";

  // -- instructions --
  /**
   * "text" shows instruction pages; "experimenter" shows none (the experimenter explains). Others are not implemented.
   * (default: "text")
   */
  instruction_format?: "text" | "audio" | "video" | "experimenter";
  /**
   * Walkthrough of the instructions, between the instruction pages and practice (PACKAGE-STANDARD §6a).
   * "interactive": untimed go steps (left, right) and a stop step (the signal appears after
   * 250 ms; no response within 2.5 s is correct), drawn and answered with the task's own code; a wrong response shows a hint
   * and repeats the step (at most 3 attempts, then the answer is shown). "examples": the stimuli as static pages. "none": instruction pages only.
   * (default: "interactive" — a documented exception to the evidence-anchored defaults (PACKAGE-STANDARD §6a).)
   */
  instruction_demonstration?: "none" | "examples" | "animated" | "guided_trial" | "interactive";

  // -- phase overrides and text --
  /**
   * Overrides for the practice phase. Honoured: trial_feedback, feedback_condition, feedback_duration_ms,
   * response_window_ms, fixation_duration_ms, iti_ms, stimulus_duration_ms, condition_proportions,
   * sequence_constraints, difficulty_levels, adaptive. Other keys are ignored in practice.
   * (default: { trial_feedback: "accuracy" } — STOP-IT gives feedback in practice only, S010. It applies
   * unless `trial_feedback` is set at the top level or in `practice`.)
   */
  practice?: Partial<StopSignalTaskOptions>;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

/** Options that can differ between practice and test (the keys `practice` honours). */
export const PHASE_OPTIONS = [
  "trial_feedback",
  "feedback_condition",
  "feedback_duration_ms",
  "response_window_ms",
  "fixation_duration_ms",
  "iti_ms",
  "stimulus_duration_ms",
  "condition_proportions",
  "sequence_constraints",
  "difficulty_levels",
  "adaptive",
] as const;

export type PhaseOptionKey = (typeof PHASE_OPTIONS)[number];

/** The staircase with every field filled and the step resolved to `{ up, down }`. */
export interface ResolvedAdaptive {
  procedure: "staircase_1up_1down" | "staircase_1up_2down" | "staircase_1up_3down";
  start_level: number;
  step_size: { up: number; down: number };
  target_accuracy: number;
  bounds: [number | null, number | null];
  discontinue_rule: DiscontinueRule | null;
  tracks: "single" | "per_condition";
  reset: "never" | "block" | "phase";
}

export type ResolvedOptions = Required<
  Omit<
    StopSignalTaskOptions,
    | "practice"
    | "text"
    | "condition_proportions"
    | "adaptive"
    | "stimulus_duration_ms"
    | "stimulus_set"
    | "sequence_constraints"
    | "practice_criterion"
    | "difficulty_levels"
  >
> & {
  /** One map per block, the last repeating (a single map is a list of one). */
  condition_proportions: TrialTypeProportions[];
  adaptive: ResolvedAdaptive | null;
  difficulty_levels: number[] | { min: number; max: number; step?: number } | null;
  stimulus_duration_ms: { go: number | null; stop_signal: number | null };
  stimulus_set: Required<StopSignalStimulusSet>;
  /** The constraints in force; the default cycle rule is dropped here when it does not fit. */
  sequence_constraints: SequenceConstraints | null;
  practice_criterion: Required<PracticeCriterion> | null;
};

export const DEFAULT_ADAPTIVE: ResolvedAdaptive = {
  procedure: "staircase_1up_1down",
  start_level: 200,
  step_size: { up: 50, down: 50 },
  target_accuracy: 0.5,
  bounds: [50, 1200],
  discontinue_rule: null,
  tracks: "single",
  reset: "never",
};

export const DEFAULT_PRACTICE_CRITERION: Required<PracticeCriterion> = {
  accuracy: 0.8,
  window: null,
  on_fail: "repeat",
  max_repeats: 2,
};

/** The default cycle length of the anchor, applied only where it fits. */
export const DEFAULT_CYCLE_LENGTH = 8;

export const DEFAULT_OPTIONS: Omit<
  ResolvedOptions,
  "adaptive" | "n_test_trials" | "sequence_constraints"
> & {
  adaptive: ResolvedAdaptive;
  sequence_constraints: SequenceConstraints;
  practice: Partial<StopSignalTaskOptions>;
} = {
  break_duration_ms: 15000,
  feedback_duration_ms: 750,
  fixation_duration_ms: 250,
  iti_ms: 500,
  response_window_ms: 1250,
  stimulus_duration_ms: { go: null, stop_signal: null },
  stimulus_modality: "visual",
  stimulus_set: { go: "arrows", stop_signal: "arrow_turns_red" },
  condition_proportions: [{ stop: 0.25, go: 0.75 }],
  difficulty_levels: null,
  n_blocks: 4,
  trials_per_block: 64,
  sequence_constraints: { cycle_length: DEFAULT_CYCLE_LENGTH },
  response_device: "keyboard",
  response_keys: ["ArrowLeft", "ArrowRight"],
  response_mapping_counterbalancing: "fixed",
  adaptive: DEFAULT_ADAPTIVE,
  device_eligibility: "none",
  practice_criterion: null,
  practice_trials: 32,
  block_feedback: "accuracy_rt",
  feedback_condition: "all",
  trial_feedback: "none",
  performance_incentive: "none",
  strategy_instruction: "dont_wait_plus_tracking_explanation",
  population_protocol: "standard",
  instruction_format: "text",
  instruction_demonstration: "interactive",
  practice: { trial_feedback: "accuracy" },
};

// -- resolution ---------------------------------------------------------------------------------

const NOT_IMPLEMENTED: Array<[keyof ResolvedOptions, string[], string]> = [
  [
    "stimulus_modality",
    ["audiovisual", "tactile"],
    "only visual and auditory stop signals are implemented",
  ],
  [
    "response_device",
    ["microphone", "eye_tracker", "gamepad"],
    "only keyboard, mouse and touch (two buttons) are implemented",
  ],
  [
    "device_eligibility",
    ["browser_restricted", "hardware_required"],
    "only computer_only is implemented (fullscreen, window size and browser checks are not)",
  ],
  ["block_feedback", ["points"], "the stop-signal task has no points"],
  ["trial_feedback", ["points", "reward_outcome"], "the stop-signal task has no points or reward"],
  [
    "performance_incentive",
    ["bonus", "points_only", "fixed_payment"],
    "incentives are not implemented",
  ],
  [
    "population_protocol",
    ["child", "gamified_child", "clinical"],
    "only the standard protocol is implemented",
  ],
  [
    "instruction_format",
    ["audio", "video"],
    "no media is bundled; supply your own instruction trials",
  ],
  [
    "instruction_demonstration",
    ["animated", "guided_trial"],
    "use interactive (real stimuli, repeat until correct), examples or none",
  ],
  [
    "response_mapping_counterbalancing",
    ["counterbalanced", "random_per_participant", "within_participant"],
    "the arrows point left or right, so the mapping is spatial and fixed",
  ],
];

const isObj = (v: unknown): v is Record<string, any> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** Normalise proportions to a list of maps; unknown trial types and bad numbers throw. */
function normaliseProportions(
  p: TrialTypeProportions | TrialTypeProportions[]
): TrialTypeProportions[] {
  const list = Array.isArray(p) ? p : [p];
  if (list.length === 0) {
    throw new Error("stop-signal-task: condition_proportions: an empty list.");
  }
  return list.map((m, i) => {
    if (!isObj(m)) throw new Error(`stop-signal-task: condition_proportions[${i}] must be a map.`);
    const values = Object.values(m);
    if (values.some((v) => isObj(v))) {
      throw new Error(
        "stop-signal-task: condition_proportions: crossed factors (maps of maps) are not used here; give { stop, go } or a list of such maps."
      );
    }
    const unknown = Object.keys(m).filter((k) => k !== "go" && k !== "stop");
    if (unknown.length) {
      throw new Error(
        `stop-signal-task: condition_proportions: unknown trial type ${unknown.join(
          ", "
        )} (use go, stop).`
      );
    }
    for (const v of values) {
      if (typeof v !== "number" || !(v >= 0) || !Number.isFinite(v)) {
        throw new Error("stop-signal-task: condition_proportions values must be numbers >= 0.");
      }
    }
    const sum = values.reduce((a: number, b) => a + (b as number), 0);
    if (!(sum > 0)) {
      throw new Error("stop-signal-task: condition_proportions must sum to more than 0.");
    }
    // a lone type means the other has proportion 0; both are written out
    return {
      stop: (m.stop ?? 0) / sum,
      go: (m.go ?? 0) / sum,
    };
  });
}

/** Resolve the `adaptive` bundle: defaults, the step and target pair, the procedure's own convergence point. */
export function resolveAdaptive(user: AdaptiveOptions): ResolvedAdaptive {
  const procedure = user.procedure ?? DEFAULT_ADAPTIVE.procedure;
  if (
    procedure !== "staircase_1up_1down" &&
    procedure !== "staircase_1up_2down" &&
    procedure !== "staircase_1up_3down"
  ) {
    throw new Error(
      `stop-signal-task: adaptive.procedure: "${procedure}" is not implemented (use staircase_1up_1down, staircase_1up_2down or staircase_1up_3down; the dossier's "tracking" is staircase_1up_1down).`
    );
  }
  const natural =
    procedure === "staircase_1up_1down" ? 0.5 : procedure === "staircase_1up_2down" ? 0.707 : 0.794;
  const rawStep = user.step_size ?? 50;
  const given = user.target_accuracy;
  let up: number;
  let down: number;
  let target: number;
  if (typeof rawStep === "number") {
    if (!(rawStep > 0)) throw new Error("stop-signal-task: adaptive.step_size must be > 0.");
    target = given ?? natural;
    if (procedure === "staircase_1up_1down") {
      if (!(target > 0 && target < 1)) {
        throw new Error("stop-signal-task: adaptive.target_accuracy must be between 0 and 1.");
      }
      // p x up = (1 - p) x down; the larger of the two steps is `step_size`
      up = round1(rawStep * Math.min(1, (1 - target) / target));
      down = round1(rawStep * Math.min(1, target / (1 - target)));
    } else {
      if (Math.abs(target - natural) > 0.02) {
        throw new Error(
          `stop-signal-task: adaptive.target_accuracy ${target} contradicts adaptive.procedure "${procedure}", which converges near ${natural}.`
        );
      }
      up = rawStep;
      down = rawStep;
    }
  } else {
    up = rawStep.up;
    down = rawStep.down;
    if (!(up > 0) || !(down > 0)) {
      throw new Error("stop-signal-task: adaptive.step_size { up, down } must both be > 0.");
    }
    if (procedure === "staircase_1up_1down") {
      const implied = down / (up + down);
      if (given !== undefined && Math.abs(given - implied) > 0.02) {
        throw new Error(
          `stop-signal-task: adaptive.step_size { up: ${up}, down: ${down} } and target_accuracy ${given} contradict each other (the steps imply ${implied.toFixed(
            3
          )}; p x up must equal (1 - p) x down).`
        );
      }
      target = given ?? implied;
    } else {
      if (up !== down) {
        throw new Error(
          `stop-signal-task: adaptive.procedure "${procedure}" needs equal up and down steps.`
        );
      }
      if (given !== undefined && Math.abs(given - natural) > 0.02) {
        throw new Error(
          `stop-signal-task: adaptive.target_accuracy ${given} contradicts adaptive.procedure "${procedure}", which converges near ${natural}.`
        );
      }
      target = given ?? natural;
    }
  }
  const bounds = user.bounds ?? DEFAULT_ADAPTIVE.bounds;
  if (!Array.isArray(bounds) || bounds.length !== 2) {
    throw new Error("stop-signal-task: adaptive.bounds must be [min, max] (null for no limit).");
  }
  const start = user.start_level ?? DEFAULT_ADAPTIVE.start_level;
  if (bounds[0] !== null && bounds[1] !== null && !(bounds[0] < bounds[1])) {
    throw new Error("stop-signal-task: adaptive.bounds must have min < max.");
  }
  if ((bounds[0] !== null && start < bounds[0]) || (bounds[1] !== null && start > bounds[1])) {
    throw new Error(
      `stop-signal-task: adaptive.start_level ${start} is outside adaptive.bounds [${bounds[0]}, ${bounds[1]}].`
    );
  }
  const tracks = user.tracks ?? DEFAULT_ADAPTIVE.tracks;
  const reset = user.reset ?? DEFAULT_ADAPTIVE.reset;
  if (tracks !== "single" && tracks !== "per_condition") {
    throw new Error('stop-signal-task: adaptive.tracks must be "single" or "per_condition".');
  }
  if (reset !== "never" && reset !== "block" && reset !== "phase") {
    throw new Error('stop-signal-task: adaptive.reset must be "never", "block" or "phase".');
  }
  return {
    procedure,
    start_level: start,
    step_size: { up, down },
    target_accuracy: round3(target),
    bounds: [bounds[0] ?? null, bounds[1] ?? null],
    discontinue_rule: user.discontinue_rule ?? null,
    tracks,
    reset,
  };
}

const round1 = (x: number) => Math.round(x * 10) / 10;
const round3 = (x: number) => Math.round(x * 1000) / 1000;

/** Block sizes: `total` split over `parts` near-equal integers, the remainder going to the first blocks. */
export function splitTrials(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const extra = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
}

/**
 * Resolve user options into complete options for one phase. Pairs that describe the same thing reconcile
 * here: `difficulty_levels` alone switches the staircase off; `stimulus_set.stop_signal` and
 * `stimulus_modality` set each other when only one is given; `n_test_trials`, `n_blocks` and
 * `trials_per_block` fill in the missing one and must agree when all three are given.
 */
export function resolveOptions(
  user: StopSignalTaskOptions = {},
  phase: "practice" | "test" = "test"
): ResolvedOptions {
  const { practice, text: _text, ...top } = user;
  const topKeys = new Set(Object.keys(top).filter((k) => (top as any)[k] !== undefined));
  let layer: Partial<StopSignalTaskOptions> = { ...top };

  if (phase === "practice") {
    const practiceKeys = new Set(Object.keys(practice ?? {}));
    const defaultPractice: Partial<StopSignalTaskOptions> = {};
    for (const [k, v] of Object.entries(DEFAULT_OPTIONS.practice)) {
      if (!topKeys.has(k) && !practiceKeys.has(k)) (defaultPractice as any)[k] = v;
    }
    layer = { ...layer, ...defaultPractice, ...(practice ?? {}) };
  }

  const merged: any = { ...DEFAULT_OPTIONS };
  delete merged.practice;
  for (const [k, v] of Object.entries(layer)) if (v !== undefined) merged[k] = v;

  // -- stimulus duration: a number or null is the go stimulus
  const sd = layer.stimulus_duration_ms;
  merged.stimulus_duration_ms =
    sd === undefined
      ? { ...DEFAULT_OPTIONS.stimulus_duration_ms }
      : isObj(sd)
      ? { go: sd.go ?? null, stop_signal: sd.stop_signal ?? null }
      : { go: sd, stop_signal: null };

  // -- stimulus set and modality
  const set = layer.stimulus_set ?? {};
  const modGiven = layer.stimulus_modality !== undefined;
  const signalGiven = set.stop_signal !== undefined;
  let modality = merged.stimulus_modality as string;
  let signal: StopSignalForm = set.stop_signal ?? DEFAULT_OPTIONS.stimulus_set.stop_signal;
  if (signalGiven && !modGiven) modality = signal === "tone" ? "auditory" : "visual";
  if (modGiven && !signalGiven && modality === "auditory") signal = "tone";
  if (modGiven && signalGiven) {
    if (
      (modality === "auditory") !== (signal === "tone") &&
      (modality === "visual" || modality === "auditory")
    ) {
      throw new Error(
        `stop-signal-task: stimulus_modality "${modality}" and stimulus_set.stop_signal "${signal}" contradict each other (the tone is the auditory signal).`
      );
    }
  }
  let goForm: GoForm = set.go ?? DEFAULT_OPTIONS.stimulus_set.go;
  if (signal === "circle_turns_red") {
    if (set.go === "arrows") {
      throw new Error(
        'stop-signal-task: stimulus_set.stop_signal "circle_turns_red" needs stimulus_set.go "arrows_in_circle", not "arrows".'
      );
    }
    goForm = "arrows_in_circle";
  }
  merged.stimulus_modality = modality;
  merged.stimulus_set = { go: goForm, stop_signal: signal };

  // -- proportions
  merged.condition_proportions = normaliseProportions(
    layer.condition_proportions ?? DEFAULT_OPTIONS.condition_proportions
  );

  // -- staircase or fixed delays
  const adaptiveGiven = layer.adaptive !== undefined;
  const levelsGiven = layer.difficulty_levels !== undefined && layer.difficulty_levels !== null;
  if (levelsGiven && adaptiveGiven && layer.adaptive !== null) {
    throw new Error(
      "stop-signal-task: adaptive and difficulty_levels both set the stop-signal delay; give one (adaptive: null with difficulty_levels is fixed delays)."
    );
  }
  if (levelsGiven) {
    merged.adaptive = null;
  } else if (layer.adaptive === null) {
    merged.adaptive = null;
  } else {
    merged.adaptive = resolveAdaptive(layer.adaptive ?? {});
    merged.difficulty_levels = null;
  }
  if (levelsGiven) merged.difficulty_levels = layer.difficulty_levels;

  // -- counts
  const nGiven = top.n_test_trials;
  const blocksGiven = top.n_blocks !== undefined;
  const tpbGiven = top.trials_per_block !== undefined;
  let nBlocks = merged.n_blocks as number;
  let tpb = merged.trials_per_block as number;
  let n: number;
  if (nGiven !== undefined) {
    n = nGiven;
    if (tpbGiven && blocksGiven && n !== nBlocks * tpb) {
      throw new Error(
        `stop-signal-task: n_test_trials ${n} contradicts n_blocks ${nBlocks} x trials_per_block ${tpb}.`
      );
    }
    if (tpbGiven && !blocksGiven) {
      if (n % tpb !== 0) {
        throw new Error(
          `stop-signal-task: n_test_trials ${n} is not a multiple of trials_per_block ${tpb}.`
        );
      }
      nBlocks = n / tpb;
    } else {
      tpb = Math.ceil(n / nBlocks);
    }
  } else {
    n = nBlocks * tpb;
  }
  merged.n_blocks = nBlocks;
  merged.trials_per_block = tpb;
  merged.n_test_trials = n;

  // -- sequence constraints: the default cycle rule applies only where it fits
  const scGiven = layer.sequence_constraints !== undefined;
  if (scGiven) {
    merged.sequence_constraints = layer.sequence_constraints;
  } else {
    const sizes = splitTrials(n, nBlocks);
    const fits = (size: number, p: TrialTypeProportions) => {
      if (size % DEFAULT_CYCLE_LENGTH !== 0) return false;
      const stopPerCycle = (p.stop ?? 0) * DEFAULT_CYCLE_LENGTH;
      return Math.abs(stopPerCycle - Math.round(stopPerCycle)) < 1e-9;
    };
    const blocks = phase === "test" ? sizes : [merged.practice_trials as number];
    const ok = blocks.every((size, i) =>
      fits(size, merged.condition_proportions[Math.min(i, merged.condition_proportions.length - 1)])
    );
    merged.sequence_constraints = ok ? { cycle_length: DEFAULT_CYCLE_LENGTH } : null;
  }
  const sc = merged.sequence_constraints;
  if (sc && sc.cycle_length === undefined && Object.keys(sc).length === 0) {
    merged.sequence_constraints = null;
  }

  // -- practice criterion
  const pc = layer.practice_criterion;
  // the tracking explanation is false when the delays are fixed: an unset strategy follows the procedure
  const stratGiven = top.strategy_instruction !== undefined;
  if (!stratGiven && merged.adaptive === null) merged.strategy_instruction = "dont_wait";
  merged.practice_criterion =
    pc === undefined || pc === null
      ? null
      : {
          accuracy: pc.accuracy ?? DEFAULT_PRACTICE_CRITERION.accuracy,
          window: pc.window === undefined ? DEFAULT_PRACTICE_CRITERION.window : pc.window,
          on_fail: pc.on_fail ?? DEFAULT_PRACTICE_CRITERION.on_fail,
          max_repeats: pc.max_repeats ?? DEFAULT_PRACTICE_CRITERION.max_repeats,
        };
  return merged as ResolvedOptions;
}

/** Throw on values the package cannot honour or combinations that contradict each other. */
export function validateOptions(o: ResolvedOptions, phase: "practice" | "test" = "test"): void {
  for (const [key, values, why] of NOT_IMPLEMENTED) {
    if (values.includes(o[key] as string)) {
      throw new Error(`stop-signal-task: ${key}: "${o[key]}" is not implemented (${why}).`);
    }
  }
  if (typeof o.response_window_ms !== "number" || !(o.response_window_ms > 0)) {
    throw new Error(
      "stop-signal-task: response_window_ms must be a positive number: a stop trial has no response to end it, so null (untimed) is not possible."
    );
  }
  if (!Array.isArray(o.response_keys) || o.response_keys.length !== 2) {
    throw new Error(
      "stop-signal-task: response_keys must list exactly two keys (first = left arrow)."
    );
  }
  if (!(o.n_blocks >= 1) || !Number.isInteger(o.n_blocks)) {
    throw new Error("stop-signal-task: n_blocks must be a positive integer.");
  }
  // a per-block list never sets the number of blocks (PACKAGE-STANDARD §2a): fewer entries repeat the last, more throw
  const nLists = Array.isArray(o.condition_proportions) ? o.condition_proportions.length : 1;
  if (phase === "test" && nLists > o.n_blocks) {
    throw new Error(
      `stop-signal-task: condition_proportions lists ${nLists} blocks but the test has ${o.n_blocks}; set n_blocks or shorten the list.`
    );
  }
  if (!(o.trials_per_block >= 1)) {
    throw new Error("stop-signal-task: trials_per_block must be a positive integer.");
  }
  const hasStop = o.condition_proportions.some((p) => (p.stop ?? 0) > 0);
  if (hasStop && o.adaptive === null && o.difficulty_levels === null) {
    throw new Error(
      "stop-signal-task: stop trials need a stop-signal delay: set adaptive (the staircase) or difficulty_levels (fixed delays)."
    );
  }
  const dl = o.difficulty_levels;
  if (dl !== null) {
    if (Array.isArray(dl)) {
      if (dl.length === 0 || dl.some((v) => typeof v !== "number" || !(v >= 0))) {
        throw new Error("stop-signal-task: difficulty_levels must be a list of delays >= 0 ms.");
      }
    } else if (!(dl.min >= 0) || !(dl.max >= dl.min)) {
      throw new Error("stop-signal-task: difficulty_levels { min, max } needs 0 <= min <= max.");
    }
  }
  const { go, stop_signal } = o.stimulus_duration_ms;
  const onGo = o.stimulus_set.stop_signal;
  if ((onGo === "arrow_turns_red" || onGo === "circle_turns_red") && go !== null) {
    throw new Error(
      `stop-signal-task: stimulus_set.stop_signal "${onGo}" changes the go stimulus, which is gone when stimulus_duration_ms.go is a number; use null, or the "border" or "tone" signal.`
    );
  }
  for (const [name, v] of [
    ["go", go],
    ["stop_signal", stop_signal],
  ] as const) {
    if (v !== null && !(v > 0)) {
      throw new Error(`stop-signal-task: stimulus_duration_ms.${name} must be > 0 or null.`);
    }
  }
  if (o.device_eligibility === "computer_only" && o.response_device === "touch") {
    throw new Error(
      'stop-signal-task: device_eligibility "computer_only" contradicts response_device "touch".'
    );
  }
  if (o.strategy_instruction === "dont_wait_plus_tracking_explanation" && o.adaptive === null) {
    throw new Error(
      'stop-signal-task: strategy_instruction "dont_wait_plus_tracking_explanation" explains the staircase, but adaptive is null (fixed delays).'
    );
  }
  const pc = o.practice_criterion;
  if (pc) {
    if (!(pc.accuracy > 0 && pc.accuracy <= 1)) {
      throw new Error("stop-signal-task: practice_criterion.accuracy must be in (0, 1].");
    }
    if (pc.window !== null && !(pc.window >= 1)) {
      throw new Error("stop-signal-task: practice_criterion.window must be >= 1 or null.");
    }
    if (!["repeat", "continue", "end"].includes(pc.on_fail)) {
      throw new Error(
        'stop-signal-task: practice_criterion.on_fail must be "repeat", "continue" or "end".'
      );
    }
    if (!(pc.max_repeats >= 0) || !Number.isInteger(pc.max_repeats)) {
      throw new Error("stop-signal-task: practice_criterion.max_repeats must be an integer >= 0.");
    }
    if (phase === "test" && o.practice_trials === 0) {
      throw new Error("stop-signal-task: practice_criterion needs practice_trials > 0.");
    }
  }
  const sc = o.sequence_constraints;
  if (sc) {
    const known = [
      "max_run",
      "min_gap",
      "max_gap",
      "run_length",
      "start_with",
      "no_immediate_repeat",
      "balanced_transitions",
      "cycle_length",
    ];
    const unknown = Object.keys(sc).filter((k) => !known.includes(k));
    if (unknown.length) {
      throw new Error(
        `stop-signal-task: sequence_constraints: unknown rule ${unknown.join(
          ", "
        )} (known: ${known.join(", ")}).`
      );
    }
    const condKeys = (m: Record<string, unknown> | undefined) =>
      Object.keys(m ?? {}).filter((k) => k !== "go" && k !== "stop");
    const bad = [
      ...(typeof sc.max_run === "object" ? condKeys(sc.max_run) : []),
      ...condKeys(sc.min_gap),
      ...condKeys(sc.max_gap),
      ...condKeys(sc.run_length),
      ...condKeys(sc.start_with),
    ];
    if (bad.length) {
      throw new Error(
        `stop-signal-task: sequence_constraints names unknown trial type ${bad.join(
          ", "
        )} (use go, stop).`
      );
    }
  }
}
