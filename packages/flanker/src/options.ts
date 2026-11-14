/**
 * Options for the flanker timeline.
 *
 * Every default below states its source. The anchor is the PEBL flanker battery (S019), a recorded
 * human decision (specs/escalations.tsv, 2026-11-13). Defaults that differ from the generated spec
 * are listed with reasons in packages/flanker/DEFAULTS.md.
 */
import type { TextConfig } from "./text";

// -- value types --------------------------------------------------------------------------------

/** Trial types. `neutral` uses `stimulus_set.neutral_flanker`; the two `neutral_*` types fix the form. */
export type FlankerCondition =
  | "congruent"
  | "incongruent"
  | "neutral"
  | "neutral_dash"
  | "neutral_empty"
  | "nogo";

/** Orthogonal cue factor, usable as keys of `condition_proportions` when a warning cue is shown. */
export type CueCondition = "cued" | "uncued";

export type NeutralFlankerForm =
  | "dashes"
  | "blank"
  | "straight_lines"
  | "squares"
  | "plus_signs"
  | "diamonds"
  | "vertical_arrows"
  | "unmapped_letter";

/** Fixed duration, or a uniform jitter range sampled in `step` increments. */
export type DurationOrJitter = number | { min: number; max: number; step?: number };

export type StimulusSizeUnit = "px" | "deg" | "screen_height_fraction";

export interface FlankerStimulusSet {
  /**
   * Target and flanker material. `"arrows"`, or `{ letters: [[...], [...]] }`: the letters that map
   * to the first and to the second response. (default: "arrows" — PEBL flanker defaults, S019)
   */
  target?: "arrows" | { letters: string[][] };
  /**
   * Flankers per side of the target: one number, or a list from which each trial draws (balanced).
   * (default: { per_side: 2 } — PEBL flanker defaults, S019; 2 per side in 4 of the 7 studies that report it)
   */
  flanker?: { per_side?: number | number[] };
  /**
   * Form of the flankers on `neutral` trials; a list is used in rotation. The `neutral_dash` and
   * `neutral_empty` trial types ignore it. (default: "dashes" — PEBL flanker defaults, S019)
   */
  neutral_flanker?: NeutralFlankerForm | NeutralFlankerForm[];
  /** Warning cue form. (default: "none" — PEBL flanker defaults, S019 has no cue) */
  cue?: "none" | "circles";
}

export interface FlankerStimulusLayout {
  /**
   * Gap between neighbouring items, in `unit`, or `"adjacent"` (no gap). A list is drawn from per trial
   * (balanced) and recorded in `flanker_distance`.
   * (default: { gap: 2, unit: "px" } — PEBL flanker defaults, S019)
   */
  flanker_spacing?: "adjacent" | { gap: number | number[]; unit: "px" | "deg" };
  /** Where the array sits relative to the fixation point. (default: "centre_at_fixation" — S019/S012) */
  array_position?: "centre_at_fixation" | "above_fixation" | "below_fixation";
  /** Array axis. (default: "horizontal" — PEBL flanker defaults, S019) */
  orientation?: "horizontal" | "vertical";
}

export interface FlankerOptions {
  // -- timing --
  /**
   * Interval from cue onset to array onset. 0 = no cue. Requires `stimulus_set.cue` other than "none".
   * (default: 0 — no cue in PEBL flanker defaults, S019; also S012, S004)
   */
  cue_target_interval_ms?: number;
  /**
   * How long trial feedback stays on screen.
   * (default: 400 — PEBL flanker defaults, S019)
   */
  feedback_duration_ms?: number;
  /**
   * Fixation duration; 0 = no fixation. A `{min, max, step}` object draws a uniform jitter per trial.
   * (default: 500 — PEBL flanker defaults, S019; also 6/10 studies)
   */
  fixation_duration_ms?: DurationOrJitter;
  /**
   * Blank interval after the trial (and its feedback); 0 = none.
   * (default: 1000 — PEBL flanker defaults, S019)
   */
  iti_ms?: number;
  /**
   * Time allowed to respond, from array onset; null = untimed. Misses are recorded as `timeout: true`.
   * (default: 800 — PEBL flanker defaults, S019)
   */
  response_window_ms?: number | null;
  /**
   * Onset asynchrony between flankers and target. Negative: flankers first; positive: target first.
   * 0 = simultaneous. During the lead the other items are hidden; RT is measured from full-array onset.
   * (default: 0 — PEBL flanker defaults, S019)
   */
  soa_ms?: number;
  /**
   * How long the array stays visible; null = until response (or the response window ends).
   * (default: null — PEBL flanker defaults, S019, stimulus until response)
   */
  stimulus_duration_ms?: number | null;

  // -- stimulus --
  /**
   * Colours as "<foreground> on <background>", any CSS colour names (e.g. "black on grey").
   * (default: "white on black" — PEBL flanker defaults, S019)
   */
  stimulus_color?: string;
  /** Array geometry. Keys given here replace the matching default keys. */
  stimulus_layout?: FlankerStimulusLayout;
  /** Stimulus material, keyed by the task's own terms: target, flanker, neutral_flanker, cue. */
  stimulus_set?: FlankerStimulusSet;
  /**
   * Size of each item. "deg" needs `screen_calibration` (otherwise 37.8 px per degree is assumed);
   * "screen_height_fraction" is relative to the window height.
   * (default: { value: 40, unit: "px" } — PEBL flanker defaults, S019)
   */
  stimulus_size?: { value: number; unit: StimulusSizeUnit };
  /**
   * With letters: how many different letters map to each response (1 or 2).
   * (default: 1 — S012, S119; arrows have one target per response)
   */
  targets_per_response?: number;

  // -- design --
  /**
   * Secondary task. Only "none" is implemented; compose with the simon-task package for the others.
   * (default: "none" — pure flanker, 2/4 studies)
   */
  concurrent_task?: "none" | "simultaneous" | "interleaved_trials" | "alternating_blocks";
  /**
   * Proportion of each trial type per block, keyed by trial type (and optionally cued/uncued).
   * Normalised to sum 1; counts per block use largest remainders. Must agree with `condition_set`.
   * (default: { congruent: .25, incongruent: .25, neutral_dash: .25, neutral_empty: .25 } — PEBL flanker defaults, S019)
   */
  condition_proportions?: Partial<Record<FlankerCondition | CueCondition, number>>;
  /**
   * Trial types included. `neutral` stands for any neutral form. If both this and
   * `condition_proportions` are given they must name the same types.
   * (default: ["congruent", "incongruent", "neutral_dash", "neutral_empty"] — PEBL flanker defaults, S019)
   */
  condition_set?: FlankerCondition[];
  /**
   * Number of test blocks.
   * (default: 1 — PEBL runs its 160 test trials as one block; S012 also 1)
   */
  n_blocks?: number;
  /**
   * Scored test trials in total (split over blocks; each block is balanced).
   * (default: 160 — PEBL flanker defaults, S019)
   */
  n_test_trials?: number;
  /**
   * Order within a block: "shuffled_list" (balanced list, shuffled), "random" (independent draws),
   * "fixed_sequence" (balanced list cycling through the conditions).
   * (default: "shuffled_list" — PEBL flanker defaults, S019)
   */
  trial_order?: "random" | "shuffled_list" | "fixed_sequence";

  // -- response --
  /**
   * "keyboard" keys; "mouse" and "touch" use on-screen buttons. Others are not implemented.
   * (default: "keyboard" — PEBL's "auto" (S019) picks the device at run time; keyboard is the first choice)
   */
  response_device?: "keyboard" | "mouse" | "touch" | "microphone" | "eye_tracker" | "gamepad";
  /**
   * Which hand(s) respond. Only affects the instructions.
   * (default: "two_hands_index_fingers" — 2/3 studies; PEBL uses left and right shift)
   */
  response_hand?: "two_hands_index_fingers" | "one_hand_dominant";
  /**
   * Keys for the first (left) and second (right) response; arrow keys as `"ArrowLeft"`.
   * (default: ["z", "/"] — PEBL browser keys, S135; PEBL's native left/right shift cannot be told apart by jsPsych)
   */
  response_keys?: string[];
  /**
   * Letter-to-key mapping across participants (only matters with letters; arrows map spatially):
   * "fixed", "random_per_participant" (drawn once), "within_participant" (reverses every other block).
   * (default: "fixed" — S012, S015)
   */
  response_mapping_counterbalancing?:
    | "fixed"
    | "counterbalanced"
    | "random_per_participant"
    | "within_participant";

  // -- procedure --
  /**
   * "instructed_items" adds two instructed-response probes before the task. Others are not implemented.
   * (default: "none" — S012, S068)
   */
  attention_checks?:
    | "none"
    | "catch_trials"
    | "instructed_items"
    | "consistency_items"
    | "self_report";
  /**
   * "computer_only" ends the experiment on touch-only devices. Others are not implemented.
   * (default: "none" — no restriction in PEBL flanker defaults, S019)
   */
  device_eligibility?: "none" | "computer_only" | "browser_restricted" | "hardware_required";
  /**
   * Practice trials before the test; 0 = no practice. One balanced block.
   * (default: 8 — PEBL flanker defaults, S019)
   */
  practice_trials?: number;
  /**
   * Break between test blocks: "self_paced" shows a screen with a continue button. Has no effect with one block.
   * (default: "none" — PEBL has no breaks; the spec's fill-in "self_paced" (3/4) only applies with several blocks)
   */
  rest_breaks?: "none" | "self_paced" | "fixed_interval";
  /**
   * Size calibration. "credit_card" and "virtual_chinrest" run the jsPsych virtual chinrest plugin and
   * convert "deg" units. (default: "none" — S012, S068)
   */
  screen_calibration?: "none" | "credit_card" | "virtual_chinrest" | "self_report";

  // -- feedback --
  /**
   * Summary screen after each test block.
   * (default: "none" — S012, S068)
   */
  block_feedback?: "none" | "accuracy" | "rt" | "accuracy_rt" | "points" | "progress";
  /**
   * On which trials trial feedback is shown (timeouts count as errors). Ignored when `trial_feedback` is "none".
   * (default: "all" — PEBL flanker defaults, S019)
   */
  feedback_condition?: "all" | "errors_only" | "correct_only";
  /**
   * What trial feedback shows. "points" and "reward_outcome" are not implemented.
   * (default: "none" — PEBL gives no feedback in the test phase; practice default below, S019)
   */
  trial_feedback?:
    | "none"
    | "accuracy"
    | "rt"
    | "accuracy_rt"
    | "points"
    | "reward_outcome"
    | "correct_answer";

  // -- instructions --
  /**
   * "text" shows instruction pages; "experimenter" shows none (the experimenter explains). Others are not implemented.
   * (default: "text" — S012)
   */
  instruction_format?: "text" | "audio" | "video" | "experimenter";
  /**
   * Emphasis sentence in the instructions.
   * (default: "both" — S004, S005, 2/3 studies)
   */
  speed_accuracy_emphasis?: "speed" | "accuracy" | "both" | "none";

  /**
   * Walkthrough of the instructions, between the instruction pages and practice (PACKAGE-STANDARD §6a).
   * "interactive": one untimed step per trial type in `condition_set`, drawn with the task's own renderer
   * and response mapping; a wrong response shows a hint and repeats the step (at most 3 attempts, then the
   * answer is shown). "examples": the same stimuli as static pages with the answer named, no responses.
   * "none": instruction pages only. "animated" and "guided_trial" are not implemented. Only used when
   * `instruction_format` is "text".
   * (default: "interactive" — a documented exception to the evidence-anchored defaults (PACKAGE-STANDARD §6a):
   * most published studies use text-only instructions, S012. Set "none" to reproduce those.)
   */
  instruction_demonstration?: "none" | "examples" | "animated" | "guided_trial" | "interactive";

  // -- phase overrides and text --
  /**
   * Overrides for the practice phase. Honoured: trial_feedback, feedback_condition, feedback_duration_ms,
   * response_window_ms, fixation_duration_ms, iti_ms, stimulus_duration_ms, soa_ms, cue_target_interval_ms,
   * condition_set, condition_proportions, trial_order, stimulus_set, stimulus_layout, stimulus_size,
   * stimulus_color, targets_per_response. Other keys are ignored in practice.
   * (default: { trial_feedback: "accuracy_rt" } — PEBL gives feedback in practice only, S019. It applies
   * unless `trial_feedback` is set at the top level or in `practice`.)
   */
  practice?: Partial<FlankerOptions>;
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
  "soa_ms",
  "cue_target_interval_ms",
  "condition_set",
  "condition_proportions",
  "trial_order",
  "stimulus_set",
  "stimulus_layout",
  "stimulus_size",
  "stimulus_color",
  "targets_per_response",
] as const;

export type PhaseOptionKey = (typeof PHASE_OPTIONS)[number];

export type ResolvedOptions = Required<Omit<FlankerOptions, "practice" | "text">>;

export const DEFAULT_OPTIONS: ResolvedOptions & { practice: Partial<FlankerOptions> } = {
  cue_target_interval_ms: 0,
  feedback_duration_ms: 400,
  fixation_duration_ms: 500,
  iti_ms: 1000,
  response_window_ms: 800,
  soa_ms: 0,
  stimulus_duration_ms: null,
  stimulus_color: "white on black",
  stimulus_layout: {
    flanker_spacing: { gap: 2, unit: "px" },
    array_position: "centre_at_fixation",
    orientation: "horizontal",
  },
  stimulus_set: {
    target: "arrows",
    flanker: { per_side: 2 },
    neutral_flanker: "dashes",
    cue: "none",
  },
  stimulus_size: { value: 40, unit: "px" },
  targets_per_response: 1,
  concurrent_task: "none",
  condition_proportions: {
    congruent: 0.25,
    incongruent: 0.25,
    neutral_dash: 0.25,
    neutral_empty: 0.25,
  },
  condition_set: ["congruent", "incongruent", "neutral_dash", "neutral_empty"],
  n_blocks: 1,
  n_test_trials: 160,
  trial_order: "shuffled_list",
  response_device: "keyboard",
  response_hand: "two_hands_index_fingers",
  response_keys: ["z", "/"],
  response_mapping_counterbalancing: "fixed",
  attention_checks: "none",
  device_eligibility: "none",
  practice_trials: 8,
  rest_breaks: "none",
  screen_calibration: "none",
  block_feedback: "none",
  feedback_condition: "all",
  trial_feedback: "none",
  instruction_format: "text",
  instruction_demonstration: "interactive",
  speed_accuracy_emphasis: "both",
  practice: { trial_feedback: "accuracy_rt" },
};

// -- resolution ---------------------------------------------------------------------------------

const NOT_IMPLEMENTED: Array<[keyof ResolvedOptions, string[], string]> = [
  [
    "concurrent_task",
    ["simultaneous", "interleaved_trials", "alternating_blocks"],
    "compose this timeline with the simon-task package instead",
  ],
  [
    "response_device",
    ["microphone", "eye_tracker", "gamepad"],
    "only keyboard, mouse and touch are implemented",
  ],
  [
    "attention_checks",
    ["catch_trials", "consistency_items", "self_report"],
    "only instructed_items is implemented",
  ],
  [
    "device_eligibility",
    ["browser_restricted", "hardware_required"],
    "only computer_only is implemented",
  ],
  [
    "rest_breaks",
    ["fixed_interval"],
    "the break length is not defined in the spec; use self_paced",
  ],
  ["screen_calibration", ["self_report"], "only credit_card and virtual_chinrest are implemented"],
  ["block_feedback", ["points"], "flanker has no points"],
  ["trial_feedback", ["points", "reward_outcome"], "flanker has no points or reward"],
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
    ["counterbalanced"],
    "needs an external participant counter; use random_per_participant",
  ],
];

const COARSE: Record<string, string> = { neutral_dash: "neutral", neutral_empty: "neutral" };
const coarse = (c: string) => COARSE[c] ?? c;

/** Merge a partial map option over its default, key by key. */
function mergeMap<T extends object>(base: T, over: Partial<T> | undefined): T {
  return { ...base, ...(over ?? {}) } as T;
}

/**
 * Resolve user options into complete options for one phase. `condition_set` and
 * `condition_proportions` are reconciled here: a user-supplied one replaces the default of the other;
 * when both are supplied they must name the same trial types (coarsely: `neutral` covers `neutral_*`).
 */
export function resolveOptions(
  user: FlankerOptions = {},
  phase: "practice" | "test" = "test"
): ResolvedOptions {
  const { practice, text: _text, ...top } = user;
  const topKeys = new Set(Object.keys(top).filter((k) => (top as any)[k] !== undefined));
  let layer: Partial<FlankerOptions> = { ...top };

  if (phase === "practice") {
    const practiceKeys = new Set(Object.keys(practice ?? {}));
    const defaultPractice: Partial<FlankerOptions> = {};
    for (const [k, v] of Object.entries(DEFAULT_OPTIONS.practice)) {
      if (!topKeys.has(k) && !practiceKeys.has(k)) (defaultPractice as any)[k] = v;
    }
    layer = { ...layer, ...defaultPractice, ...(practice ?? {}) };
  }

  const merged: any = { ...DEFAULT_OPTIONS };
  delete merged.practice;
  for (const [k, v] of Object.entries(layer)) if (v !== undefined) merged[k] = v;
  merged.stimulus_set = {
    ...mergeMap(DEFAULT_OPTIONS.stimulus_set, layer.stimulus_set),
    flanker: { ...DEFAULT_OPTIONS.stimulus_set.flanker, ...(layer.stimulus_set?.flanker ?? {}) },
  };
  merged.stimulus_layout = mergeMap(DEFAULT_OPTIONS.stimulus_layout, layer.stimulus_layout);

  // reconcile condition_set / condition_proportions
  const propConditions = (p: object) =>
    Object.keys(p).filter((k) => k !== "cued" && k !== "uncued") as FlankerCondition[];
  const setGiven = layer.condition_set !== undefined;
  const givenConds = layer.condition_proportions ? propConditions(layer.condition_proportions) : [];
  const propGiven = givenConds.length > 0;
  const cuedOnly = layer.condition_proportions && !propGiven ? layer.condition_proportions : {};
  if (setGiven && propGiven) {
    const a = new Set(layer.condition_set!.map(coarse));
    const b = new Set(givenConds.map(coarse));
    if (a.size !== b.size || [...a].some((c) => !b.has(c))) {
      throw new Error(
        "flanker: condition_set and condition_proportions name different trial types; give one of them or make them agree."
      );
    }
  } else if (setGiven || (!propGiven && layer.condition_proportions)) {
    // equal proportions over the given (or default) set; cued/uncued keys are kept
    const set = layer.condition_set ?? DEFAULT_OPTIONS.condition_set;
    merged.condition_proportions = {
      ...Object.fromEntries(set.map((c) => [c, 1])),
      ...cuedOnly,
    };
  } else if (propGiven) {
    merged.condition_set = givenConds;
  }
  return merged as ResolvedOptions;
}

/** Throw on values the package cannot honour or combinations that contradict each other. */
export function validateOptions(o: ResolvedOptions): void {
  for (const [key, values, why] of NOT_IMPLEMENTED) {
    if (values.includes(o[key] as string)) {
      throw new Error(`flanker: ${key}: "${o[key]}" is not implemented (${why}).`);
    }
  }
  if (!Array.isArray(o.response_keys) || o.response_keys.length !== 2) {
    throw new Error("flanker: response_keys must list exactly two keys (first = left response).");
  }
  if (!(o.n_blocks >= 1) || !Number.isInteger(o.n_blocks)) {
    throw new Error("flanker: n_blocks must be a positive integer.");
  }
  if (!(o.targets_per_response === 1 || o.targets_per_response === 2)) {
    throw new Error("flanker: targets_per_response must be 1 or 2.");
  }
  const conds = Object.keys(o.condition_proportions).filter((k) => k !== "cued" && k !== "uncued");
  if (conds.includes("nogo") && o.response_window_ms === null) {
    throw new Error(
      "flanker: a nogo condition needs a response_window_ms (null would never end the trial)."
    );
  }
  const cue = o.stimulus_set.cue ?? "none";
  if (cue !== "none" && !(o.cue_target_interval_ms > 0)) {
    throw new Error("flanker: stimulus_set.cue is set but cue_target_interval_ms is 0.");
  }
  if (cue === "none" && o.cue_target_interval_ms > 0) {
    throw new Error(
      'flanker: cue_target_interval_ms > 0 needs stimulus_set.cue other than "none".'
    );
  }
  if (o.device_eligibility === "computer_only" && o.response_device === "touch") {
    throw new Error(
      'flanker: device_eligibility "computer_only" contradicts response_device "touch".'
    );
  }
}
