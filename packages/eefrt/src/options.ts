/**
 * Options for the EEfRT timeline.
 *
 * Every default below states its source. The anchor is Treadway et al. 2009 (S007, "PLoS ONE"), the
 * original EEfRT: fixation 1 s, a choice of at most 5 s between an easy and a hard task, a 1 s ready
 * screen, then 30 presses in 7 s (easy, index finger, $1) or 100 presses in 21 s (hard, little finger,
 * $1.24 to $4.30), 2 s completion feedback and 2 s reward feedback, with a 12 %, 50 % or 88 % chance
 * that the trial pays. The session lasts 20 minutes and two winning trials are paid. Defaults that
 * differ from the generated spec are listed with reasons in packages/eefrt/DEFAULTS.md.
 */
import type { TextConfig } from "./text";

// -- value types --------------------------------------------------------------------------------

/** The two tasks a participant chooses between. */
export type Task = "easy" | "hard";

/** Fixed duration, or a uniform jitter range sampled in `step` increments. */
export type DurationSpec = number | { min: number; max: number; step?: number };

/**
 * The hard-task reward on offer. Three forms, told apart by their keys:
 *  - `{ levels: [1.24, 2, 4.3] }`: a list of discrete amounts, each crossed with every probability;
 *  - `{ min, max, n_levels }`: `n_levels` amounts equally spaced from `min` to `max` (inclusive),
 *    rounded to 2 decimals, each crossed with every probability (8 levels, 1.24 to 4.30, in the Inquisit EEfRT);
 *  - `{ uniform: { min, max } }`: a fresh amount drawn uniformly (to 2 decimals) on every trial,
 *    with no list of levels (S014's implementation).
 */
export type HardRewards =
  | { levels: number[] }
  | { min: number; max: number; n_levels: number }
  | { uniform: { min: number; max: number } };

export interface RewardMagnitude {
  /** Easy-task reward. (default: 1 — S007, Inquisit EEfRT S021; S034 uses 0.5) */
  easy?: number;
  /** Hard-task reward. (default: { min: 1.24, max: 4.3, n_levels: 8 } — S007 range, S021/S017 8 equally spaced levels) */
  hard?: HardRewards;
}

/** Required presses for each task. */
export interface DifficultyLevels {
  /** Presses needed for the easy task. (default: 30 — S007, S021, S034) */
  easy?: number;
  /** Presses needed for the hard task. (default: 100 — S007, S021; S034 uses 98) */
  hard?: number;
}

/**
 * Response windows in milliseconds, keyed by the task's own terms: `choice` is the time to choose
 * between the tasks (`null` = untimed), `easy` and `hard` are the time allowed to complete each
 * task's presses. A number or `null` on its own is the choice window.
 */
export interface ResponseWindows {
  /** (default: 5000 — S007, S021, S034; S008 used 3000 and an untimed choice) */
  choice?: number | null;
  /** (default: 7000 — S007, S021, S033) */
  easy?: number;
  /** (default: 21000 — S007, S021; S033's 30 s is probably a typo in the paper) */
  hard?: number;
}

/** Feedback durations: one value for both screens, or a map. */
export interface FeedbackDurations {
  /** "Task completed" or "not completed" screen. (default: 2000 — S007, S021, S035) */
  completion?: DurationSpec;
  /** "You win …" or "no reward" screen. (default: 2000 — S007, S027) */
  reward?: DurationSpec;
}

/** Keys that press during the effort phase, per task. */
export interface EffortKeys {
  /** (default: "space" — S008, S021, S030) */
  easy?: string;
  /** (default: "space") */
  hard?: string;
}

export interface EefrtOptions {
  // -- timing --
  /**
   * How long the completion screen and the reward screen stay on screen; 0 = that screen does not
   * appear. A single duration applies to both, `{ completion, reward }` sets them apart. Each may be a
   * `{min, max, step}` jitter range.
   * (default: 2000 for both — S007, S021, S035)
   */
  feedback_duration_ms?: DurationSpec | FeedbackDurations;
  /**
   * Fixation mark at the start of each trial; 0 = no fixation. A `{min, max, step}` object draws a
   * uniform jitter per trial.
   * (default: 1000 — S007, S013)
   */
  fixation_duration_ms?: DurationSpec;
  /**
   * The "ready" screen between the choice and the effort phase of every trial; 0 = none. (The vocabulary
   * calls this a countdown before a block; in this task it precedes each pressing phase, as in S007.)
   * (default: 1000 — S007, S021; S035 used 3000 for EEG)
   */
  pre_block_countdown_ms?: DurationSpec;
  /**
   * Response windows, keyed by `choice`, `easy` and `hard` (see `ResponseWindows`). A number or `null`
   * alone sets the choice window; `null` means untimed. The easy and hard windows are the time allowed
   * to complete the presses and must be finite. When no task is chosen in time, the task is assigned
   * at random (`missed_response_handling`).
   * (default: { choice: 5000, easy: 7000, hard: 21000 } — S007, S021)
   */
  response_window_ms?: number | null | ResponseWindows;
  /**
   * Length of the test session in minutes, with `task_end_rule: "fixed_time"`. A trial that starts
   * before the time is up is completed. The session clock adds up the planned and measured durations of
   * the task's screens (fixation, choice, ready, effort, feedback), and in a real run it never runs behind
   * the wall clock. `null` (no limit) throws with `fixed_time`.
   * (default: 20 — S007, S013, S014, S021, S034; S008 and S027 used 15, S039 10)
   */
  session_duration_min?: number | null;

  // -- design --
  /**
   * Presses required for each task, `{ easy, hard }`.
   * (default: { easy: 30, hard: 100 } — S007, S021, S034 (98 hard))
   */
  difficulty_levels?: DifficultyLevels;
  /**
   * Number of test trials with `task_end_rule: "fixed_trial_count"`; not used (and rejected when given)
   * with `fixed_time`.
   * (default: 48 — S017's fixed count and the length of Inquisit's trial list, S021; the spec has no value)
   */
  n_test_trials?: number;
  /**
   * What the reward is. "money" shows amounts through the `amount` text function (a "$" sign by
   * default; the currency is text, not an option); "points" shows them as points. Other values are not implemented.
   * (default: "money" — S007)
   */
  outcome_type?: "money" | "points" | "points_exchanged_for_candy" | "food_portions";
  /**
   * Only "gain" is implemented; the loss trials of S008's review table are not described in the dossier.
   * (default: "gain" — S007)
   */
  outcome_valence?: "gain" | "loss" | "gain_and_loss" | "mixed";
  /**
   * Amounts at stake, `{ easy, hard }` (see `RewardMagnitude` and `HardRewards`). Currency is not part of
   * the value; use the `amount` text function.
   * (default: { easy: 1, hard: { min: 1.24, max: 4.3, n_levels: 8 } } — S007, S021)
   */
  reward_magnitude?: RewardMagnitude;
  /**
   * Probability that a trial pays if the task is completed, as proportions (0.12, not "12%"). It is shown
   * before the choice and is the same for the easy and the hard task. Every level is crossed with every hard
   * reward level. `[1]` means every trial pays, and then no probability is shown.
   * (default: [0.12, 0.5, 0.88] — S007, S021; S027 and S032 drop the 12 %)
   */
  reward_probability?: number[];
  /**
   * How the offers (probability x reward cells) are ordered: "fixed_sequence" repeats one scrambled order that is
   * the same for every participant (S007; the original list is not published, so this package's own constant
   * order is used and no random numbers are drawn), "shuffled_list" shuffles each pass through all cells per
   * participant (S014), "random" draws every offer independently. Win trials are balanced within each
   * probability level in the two list orders and drawn independently with "random". Practice offers are always drawn at random.
   * (default: "fixed_sequence" — S007, S008, S021)
   */
  trial_order?: "random" | "shuffled_list" | "fixed_sequence";

  // -- response --
  /**
   * What happens when no task is chosen within the choice window: "random_assignment" gives the participant a
   * random task and flags the trial (`choice_forced`). The only value.
   * (default: "random_assignment" — S007, S017, S021)
   */
  missed_response_handling?: "random_assignment";
  /**
   * Choice keys: the first chooses the easy task, the second the hard task. Letters, digits or named keys
   * such as "ArrowLeft".
   * (default: ["e", "i"] — Inquisit's choice keys, S021 (1/3 studies); S017 uses F/J, S013 L/S)
   */
  response_keys?: [string, string];
  /**
   * Keys pressed during the effort phase, `{ easy, hard }`. The same key for both tasks (the space bar) is
   * the usual design (S008, S021, S030); two different keys let software check which finger was used (S013, S014).
   * "space" names the space bar. Which finger presses is an instruction, not an option: see the `finger_instruction` text.
   * (default: { easy: "space", hard: "space" } — S021, S008, S030)
   */
  response_key_mapping?: EffortKeys;

  // -- procedure --
  /**
   * "computer_only" ends the experiment on touch-only devices (rapid pressing needs a physical keyboard; S030, S042).
   * Others are not implemented.
   * (default: "computer_only" — both online studies, fill 2/2)
   */
  device_eligibility?: "none" | "computer_only" | "browser_restricted" | "hardware_required";
  /**
   * Practice trials before the test; 0 = no practice. Not paid.
   * (default: 4 — S007, S021, S035; S014 uses 2)
   */
  practice_trials?: number;
  /**
   * The tasks assigned (not chosen) on the first practice trials, in order, so that participants feel both
   * effort levels before choosing. `[]` = every practice trial is a free choice.
   * (default: ["easy", "hard"] — S007: 4 practice trials, 2 forced (easy, then hard) and 2 free)
   */
  practice_forced_tasks?: Task[];
  /**
   * Only "none" is implemented. S008's unrewarded maximal-pressing pretest (10 trials of 20 s) is not.
   * (default: "none" — S007)
   */
  pretraining?: "none" | "stimulus_preexposure" | "pavlovian" | "familiarization";
  /**
   * What ends the test: "fixed_time" (`session_duration_min`) or "fixed_trial_count" (`n_test_trials`). When only
   * one of the two numbers is given it sets the rule; giving both without a rule, or a number that
   * belongs to the other rule, throws.
   * (default: "fixed_time" — S007, S021)
   */
  task_end_rule?: "fixed_time" | "fixed_trial_count";

  // -- feedback --
  /**
   * How earnings are worked out at the end: "two_random_win_trials_paid" pays the rewards of two trials picked
   * at random among the completed winning trials (S007), "percent_of_total_5" and "percent_of_total_10" pay that
   * share of everything won (S008). The amount is shown on the last screen and returned by the scoring. Nothing
   * is paid by the package. "fixed_noncontingent_with_deception" (S032) is not implemented: it is a deception
   * that the researcher, not the package, would carry out.
   * (default: "two_random_win_trials_paid" — S007, S027, S034)
   */
  payout_rule?:
    | "two_random_win_trials_paid"
    | "percent_of_total_5"
    | "percent_of_total_10"
    | "fixed_noncontingent_with_deception";
  /**
   * What the effort screen shows of the presses made: "progress_bar" (the bar fills as presses accumulate; S007),
   * "counter" (the number of presses made out of the number required) or "none".
   * (default: "progress_bar" — S007, S021)
   */
  progress_indicator?: "none" | "counter" | "progress_bar";

  // -- instructions --
  /**
   * Walkthrough between the instruction pages and practice (PACKAGE-STANDARD §6a). "interactive": the real choice
   * screen is shown twice (choose the easy task, then the hard one), then the easy effort task is done; a wrong
   * choice shows a hint and repeats the step (at most 3 attempts), as does failing to complete the easy task.
   * "none": instruction pages only. "examples", "animated" and "guided_trial" are not implemented. Only used when
   * `instruction_format` is "text".
   * (default: "interactive" — documented exception to the evidence-anchored defaults (PACKAGE-STANDARD §6a))
   */
  instruction_demonstration?: "none" | "examples" | "animated" | "guided_trial" | "interactive";
  /**
   * "text" shows instruction pages; "experimenter" shows none. Others are not implemented.
   * (default: "text" — S007)
   */
  instruction_format?: "text" | "audio" | "video" | "experimenter";

  // -- phase overrides and text --
  /**
   * Overrides for the practice phase. Honoured: feedback_duration_ms, fixation_duration_ms, pre_block_countdown_ms,
   * response_window_ms, difficulty_levels, reward_magnitude, reward_probability, progress_indicator, response_key_mapping.
   * Other keys are ignored in practice. Practice has no time limit and no payout.
   * (default: {} — practice runs at the real task's pace)
   */
  practice?: Partial<EefrtOptions>;
  /** Custom text strings for translation, including the currency format (`amount`) and the finger instructions (`finger_instruction`). Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

/** Options that can differ between practice and test (the keys `practice` honours). */
export const PHASE_OPTIONS = [
  "feedback_duration_ms",
  "fixation_duration_ms",
  "pre_block_countdown_ms",
  "response_window_ms",
  "difficulty_levels",
  "reward_magnitude",
  "reward_probability",
  "progress_indicator",
  "response_key_mapping",
] as const;

export type PhaseOptionKey = (typeof PHASE_OPTIONS)[number];

export interface ResolvedOptions {
  feedback_duration_ms: { completion: DurationSpec; reward: DurationSpec };
  fixation_duration_ms: DurationSpec;
  pre_block_countdown_ms: DurationSpec;
  response_window_ms: { choice: number | null; easy: number; hard: number };
  session_duration_min: number | null;
  difficulty_levels: { easy: number; hard: number };
  n_test_trials: number;
  outcome_type: NonNullable<EefrtOptions["outcome_type"]>;
  outcome_valence: NonNullable<EefrtOptions["outcome_valence"]>;
  reward_magnitude: { easy: number; hard: HardRewards };
  reward_probability: number[];
  trial_order: NonNullable<EefrtOptions["trial_order"]>;
  missed_response_handling: "random_assignment";
  response_keys: [string, string];
  response_key_mapping: { easy: string; hard: string };
  device_eligibility: NonNullable<EefrtOptions["device_eligibility"]>;
  practice_trials: number;
  practice_forced_tasks: Task[];
  pretraining: NonNullable<EefrtOptions["pretraining"]>;
  task_end_rule: "fixed_time" | "fixed_trial_count";
  payout_rule: NonNullable<EefrtOptions["payout_rule"]>;
  progress_indicator: NonNullable<EefrtOptions["progress_indicator"]>;
  instruction_demonstration: NonNullable<EefrtOptions["instruction_demonstration"]>;
  instruction_format: NonNullable<EefrtOptions["instruction_format"]>;
}

export const DEFAULT_OPTIONS: ResolvedOptions & { practice: Partial<EefrtOptions> } = {
  feedback_duration_ms: { completion: 2000, reward: 2000 },
  fixation_duration_ms: 1000,
  pre_block_countdown_ms: 1000,
  response_window_ms: { choice: 5000, easy: 7000, hard: 21000 },
  session_duration_min: 20,
  difficulty_levels: { easy: 30, hard: 100 },
  n_test_trials: 48,
  outcome_type: "money",
  outcome_valence: "gain",
  reward_magnitude: { easy: 1, hard: { min: 1.24, max: 4.3, n_levels: 8 } },
  reward_probability: [0.12, 0.5, 0.88],
  trial_order: "fixed_sequence",
  missed_response_handling: "random_assignment",
  response_keys: ["e", "i"],
  response_key_mapping: { easy: "space", hard: "space" },
  device_eligibility: "computer_only",
  practice_trials: 4,
  practice_forced_tasks: ["easy", "hard"],
  pretraining: "none",
  task_end_rule: "fixed_time",
  payout_rule: "two_random_win_trials_paid",
  progress_indicator: "progress_bar",
  instruction_demonstration: "interactive",
  instruction_format: "text",
  practice: {},
};

// -- helpers ------------------------------------------------------------------------------------

/** The key as jsPsych reports it: "space" (any case) is the space bar. */
export function normaliseKey(key: string): string {
  return key.toLowerCase() === "space" ? " " : key;
}

const isRange = (v: unknown): v is { min: number; max: number; step?: number } =>
  typeof v === "object" && v !== null && "min" in v && "max" in v;

function isFeedbackMap(v: unknown): v is FeedbackDurations {
  return typeof v === "object" && v !== null && !isRange(v);
}

/** Merge the map options key by key (a number or null alone is shorthand for one key). */
function mergeMaps(layer: Partial<EefrtOptions>, merged: any): void {
  const fd = layer.feedback_duration_ms;
  if (fd !== undefined) {
    merged.feedback_duration_ms = isFeedbackMap(fd)
      ? { ...DEFAULT_OPTIONS.feedback_duration_ms, ...stripUndefined(fd) }
      : { completion: fd, reward: fd };
  } else merged.feedback_duration_ms = { ...DEFAULT_OPTIONS.feedback_duration_ms };

  const rw = layer.response_window_ms;
  if (rw === undefined) merged.response_window_ms = { ...DEFAULT_OPTIONS.response_window_ms };
  else if (rw === null || typeof rw === "number") {
    merged.response_window_ms = { ...DEFAULT_OPTIONS.response_window_ms, choice: rw };
  } else {
    merged.response_window_ms = { ...DEFAULT_OPTIONS.response_window_ms, ...stripUndefined(rw) };
  }

  merged.difficulty_levels = {
    ...DEFAULT_OPTIONS.difficulty_levels,
    ...stripUndefined(layer.difficulty_levels ?? {}),
  };
  merged.reward_magnitude = {
    ...DEFAULT_OPTIONS.reward_magnitude,
    ...stripUndefined(layer.reward_magnitude ?? {}),
  };
  merged.response_key_mapping = {
    ...DEFAULT_OPTIONS.response_key_mapping,
    ...stripUndefined(layer.response_key_mapping ?? {}),
  };
}

function stripUndefined<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

/**
 * Resolve user options into complete options for one phase. Precedence, highest first: the user's
 * `practice` value (practice only), the user's top-level value, the package default. Map options
 * (`feedback_duration_ms`, `response_window_ms`, `difficulty_levels`, `reward_magnitude`,
 * `response_key_mapping`) merge key by key. `task_end_rule`, `session_duration_min` and `n_test_trials` are
 * reconciled: one given number sets the rule; a number that belongs to the other rule throws.
 */
export function resolveOptions(
  user: EefrtOptions = {},
  phase: "practice" | "test" = "test"
): ResolvedOptions {
  const { practice, text: _text, ...top } = user;
  let layer: Partial<EefrtOptions> = stripUndefined({ ...top });
  if (phase === "practice") layer = { ...layer, ...stripUndefined(practice ?? {}) };

  const merged: any = { ...DEFAULT_OPTIONS };
  delete merged.practice;
  for (const [k, v] of Object.entries(layer)) if (v !== undefined) merged[k] = v;
  mergeMaps(layer, merged);

  // the end rule: reconciled from what the user gave at the top level (practice has no end rule)
  const t = stripUndefined(top) as EefrtOptions;
  const timeGiven = t.session_duration_min !== undefined;
  const countGiven = t.n_test_trials !== undefined;
  if (t.task_end_rule === "fixed_time" && countGiven) {
    throw new Error(
      'eefrt: n_test_trials contradicts task_end_rule "fixed_time" (the session ends on time); use task_end_rule "fixed_trial_count".'
    );
  }
  if (t.task_end_rule === "fixed_trial_count" && timeGiven) {
    throw new Error(
      'eefrt: session_duration_min contradicts task_end_rule "fixed_trial_count"; use task_end_rule "fixed_time".'
    );
  }
  if (t.task_end_rule === undefined) {
    if (timeGiven && countGiven) {
      throw new Error(
        "eefrt: session_duration_min and n_test_trials both given without task_end_rule; the test ends on time or on a count, not both. Give task_end_rule."
      );
    }
    if (countGiven) merged.task_end_rule = "fixed_trial_count";
    else merged.task_end_rule = "fixed_time";
  }
  return merged as ResolvedOptions;
}

// -- validation ---------------------------------------------------------------------------------

const NOT_IMPLEMENTED: Array<[keyof ResolvedOptions, string[], string]> = [
  [
    "outcome_type",
    ["points_exchanged_for_candy", "food_portions"],
    'use "money" or "points" and translate the payout text (`text.payout_sentence`, `text.amount`)',
  ],
  [
    "outcome_valence",
    ["loss", "gain_and_loss", "mixed"],
    "only gains are implemented; the dossier does not describe the loss trials of S008's review table",
  ],
  [
    "pretraining",
    ["stimulus_preexposure", "pavlovian", "familiarization"],
    "only none is implemented; the maximal-pressing pretest of S008 is not (see DEFAULTS.md)",
  ],
  [
    "device_eligibility",
    ["browser_restricted", "hardware_required"],
    "only none and computer_only are implemented",
  ],
  [
    "payout_rule",
    ["fixed_noncontingent_with_deception"],
    "a deception that the researcher, not the package, would carry out; pay outside the package",
  ],
  [
    "instruction_format",
    ["audio", "video"],
    "no media is bundled; supply your own instruction trials",
  ],
  [
    "instruction_demonstration",
    ["examples", "animated", "guided_trial"],
    "use interactive (real screens, repeat until correct) or none",
  ],
];

const positive = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x) && x > 0;

function validateDuration(name: string, d: DurationSpec): void {
  if (typeof d === "number") {
    if (!(d >= 0)) throw new Error(`eefrt: ${name} must be 0 or more.`);
    return;
  }
  if (
    !isRange(d) ||
    !(d.min >= 0) ||
    !(d.max >= d.min) ||
    (d.step !== undefined && !(d.step > 0))
  ) {
    throw new Error(`eefrt: ${name}: { min, max, step } needs 0 <= min <= max and step > 0.`);
  }
}

export function validateHardRewards(h: HardRewards): void {
  if ("levels" in h) {
    if (!Array.isArray(h.levels) || h.levels.length === 0 || h.levels.some((x) => !(x >= 0))) {
      throw new Error(
        "eefrt: reward_magnitude.hard.levels needs a non-empty list of amounts of 0 or more."
      );
    }
  } else if ("uniform" in h) {
    const u = h.uniform;
    if (!u || !(u.min >= 0) || !(u.max >= u.min)) {
      throw new Error("eefrt: reward_magnitude.hard.uniform needs 0 <= min <= max.");
    }
  } else if ("n_levels" in h) {
    if (!Number.isInteger(h.n_levels) || h.n_levels < 1 || !(h.min >= 0) || !(h.max >= h.min)) {
      throw new Error(
        "eefrt: reward_magnitude.hard { min, max, n_levels } needs an integer n_levels of 1 or more and 0 <= min <= max."
      );
    }
    if (h.n_levels === 1 && h.min !== h.max) {
      throw new Error("eefrt: reward_magnitude.hard with n_levels 1 needs min equal to max.");
    }
  } else {
    throw new Error(
      "eefrt: reward_magnitude.hard must be { levels }, { min, max, n_levels } or { uniform: { min, max } }."
    );
  }
}

/** Throw on values the package cannot honour or combinations that contradict each other. */
export function validateOptions(o: ResolvedOptions): void {
  for (const [key, values, why] of NOT_IMPLEMENTED) {
    if (values.includes(o[key] as string)) {
      throw new Error(`eefrt: ${key}: "${o[key]}" is not implemented (${why}).`);
    }
  }
  if (o.task_end_rule === "fixed_time") {
    if (o.session_duration_min === null || o.session_duration_min === undefined) {
      throw new Error(
        'eefrt: task_end_rule "fixed_time" needs session_duration_min (null would never end the session); use "fixed_trial_count" to end on a count.'
      );
    }
    if (!positive(o.session_duration_min)) {
      throw new Error("eefrt: session_duration_min must be more than 0.");
    }
  } else if (!Number.isInteger(o.n_test_trials) || o.n_test_trials < 1) {
    throw new Error("eefrt: n_test_trials must be a positive integer.");
  }
  if (!Number.isInteger(o.practice_trials) || o.practice_trials < 0) {
    throw new Error("eefrt: practice_trials must be a whole number of 0 or more.");
  }
  const w = o.response_window_ms;
  if (w.choice !== null && !positive(w.choice)) {
    throw new Error("eefrt: response_window_ms.choice must be more than 0, or null for untimed.");
  }
  for (const task of ["easy", "hard"] as const) {
    if (!positive(w[task])) {
      throw new Error(
        `eefrt: response_window_ms.${task} must be a finite time in ms (null would never end the ${task} task).`
      );
    }
    if (!Number.isInteger(o.difficulty_levels[task]) || o.difficulty_levels[task] < 1) {
      throw new Error(
        `eefrt: difficulty_levels.${task} must be a positive whole number of presses.`
      );
    }
  }
  validateDuration("feedback_duration_ms.completion", o.feedback_duration_ms.completion);
  validateDuration("feedback_duration_ms.reward", o.feedback_duration_ms.reward);
  validateDuration("fixation_duration_ms", o.fixation_duration_ms);
  validateDuration("pre_block_countdown_ms", o.pre_block_countdown_ms);
  if (!(o.reward_magnitude.easy >= 0))
    throw new Error("eefrt: reward_magnitude.easy must be 0 or more.");
  validateHardRewards(o.reward_magnitude.hard);
  if (
    !Array.isArray(o.reward_probability) ||
    o.reward_probability.length === 0 ||
    o.reward_probability.some((p) => !(p > 0 && p <= 1))
  ) {
    throw new Error(
      'eefrt: reward_probability must be a non-empty list of proportions above 0 and at most 1 (0.12, not 12 or "12%").'
    );
  }
  if (!Array.isArray(o.response_keys) || o.response_keys.length !== 2) {
    throw new Error(
      "eefrt: response_keys must list exactly two keys (first = easy task, second = hard task)."
    );
  }
  if (o.response_keys[0].toLowerCase() === o.response_keys[1].toLowerCase()) {
    throw new Error("eefrt: response_keys needs two different keys.");
  }
  if (
    !Array.isArray(o.practice_forced_tasks) ||
    o.practice_forced_tasks.some((t) => t !== "easy" && t !== "hard")
  ) {
    throw new Error('eefrt: practice_forced_tasks must be a list of "easy" and "hard".');
  }
  if (o.practice_forced_tasks.length > o.practice_trials) {
    throw new Error(
      "eefrt: practice_forced_tasks assigns more tasks than practice_trials; raise practice_trials or shorten the list."
    );
  }
  const effort = [o.response_key_mapping.easy, o.response_key_mapping.hard].map((k) =>
    normaliseKey(k).toLowerCase()
  );
  for (const k of o.response_keys) {
    if (effort.includes(normaliseKey(k).toLowerCase())) {
      throw new Error(
        `eefrt: the choice key "${k}" is also an effort key; a key held down from the choice would count as a press. Use different keys.`
      );
    }
  }
}

/** Sample a duration spec through jsPsych's seeded randomisation. */
export function sampleDuration(
  jsPsych: { randomization: { randomInt: (a: number, b: number) => number } },
  spec: DurationSpec
): number {
  if (typeof spec === "number") return spec;
  const step = spec.step && spec.step > 0 ? spec.step : 1;
  const n = Math.floor((spec.max - spec.min) / step + 1e-9);
  return spec.min + step * jsPsych.randomization.randomInt(0, n);
}

export { isRange };
