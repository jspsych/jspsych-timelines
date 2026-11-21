/**
 * Options for the two-step task timeline.
 *
 * Every default below states its source. The anchor is the Expfactory two-stage-decision defaults
 * (S024), as in the spec. Defaults that differ from the generated spec are listed with reasons in
 * packages/two-step-task/DEFAULTS.md.
 */
import { OPTION_IDS, STATE_IDS } from "./constants";
import type { TextConfig } from "./text";

// -- value types --------------------------------------------------------------------------------

/** Fixed duration, or a uniform jitter range sampled in `step` increments. */
export type DurationOrJitter = number | { min: number; max: number; step?: number };

export type StateId = (typeof STATE_IDS)[number];
export type OptionId = (typeof OPTION_IDS)[number];

/** A starting reward probability: a number, or `{ min, max }`, drawn uniformly once per run of trials. */
export type ProbabilitySpec = number | { min: number; max: number };

/**
 * Starting reward probabilities, keyed by the colour of the state and then by option. Both levels
 * can be left out; missing entries take the default.
 */
export type RewardProbability = Partial<
  Record<StateId, Partial<Record<OptionId, ProbabilitySpec>>>
>;

/**
 * How the reward probabilities of the four second-stage options change over trials.
 * `random_walk`: each probability takes a Gaussian step (SD `sd`) on every trial and stays within
 * `bounds`. `boundary` says what happens to a step that would cross a bound: `reflect` folds the
 * excess back inside (Daw et al., 2011); `reverse_step` takes the step in the opposite direction
 * instead (Expfactory two-stage-decision). The other kinds of the vocabulary are not implemented.
 */
export type RewardSchedule =
  | {
      kind: "random_walk";
      sd: number;
      bounds: [number, number];
      boundary: "reflect" | "reverse_step";
    }
  | { kind: "block_alternating" }
  | { kind: "pregenerated_walk_sets" };

export type SequenceConstraints = Record<string, unknown> | null;

export type Framing =
  | "abstract_symbols"
  | "spaceship_planet_alien"
  | "magic_carpet_mountain_genie"
  | "ship_island_chest";

export interface TwoStepTaskOptions {
  // -- timing --
  /**
   * How long the outcome (a coin, or no coin) stays on screen, in ms; 0 skips the display, a
   * `{ min, max, step }` range is sampled per trial. (default: 500 — Expfactory two-stage-decision, S024)
   */
  feedback_duration_ms?: DurationOrJitter;
  /**
   * Fixation before the first-stage choice, in ms; 0 for none. The literature that has one shows it before each
   * stage; this package has it before the first stage only. (default: 0 — Expfactory two-stage-decision, S024)
   */
  fixation_duration_ms?: DurationOrJitter;
  /**
   * Time between the end of a trial and the start of the next, in ms; 0 for none. (default: 1000 — Expfactory
   * two-stage-decision, S024)
   */
  iti_ms?: DurationOrJitter;
  /**
   * Time allowed for each of the two choices, in ms; `null` for no limit. A choice that is not made in time
   * is a missed trial. (default: 2000 — Expfactory two-stage-decision, S024; also Daw et al. 2011)
   */
  response_window_ms?: DurationOrJitter | null;
  /**
   * How long the "too slow" message stays after a missed choice, in ms; 0 for none. (default: 1500 — Kool
   * space_daw_task jsPsych, S025; the anchor does not report it)
   */
  timeout_message_ms?: DurationOrJitter;
  /**
   * How long the chosen option stays highlighted after each choice, in ms (the "selection display" of the
   * literature); 0 for none. Not in the vocabulary yet: the translator proposes `response_acknowledgement_ms`.
   * (default: 1000 — Expfactory two-stage-decision, S024)
   */
  response_acknowledgement_ms?: DurationOrJitter;

  // -- design --
  /** Number of blocks of the main phase. (default: 2 — Expfactory two-stage-decision, S024) */
  n_blocks?: number;
  /**
   * Number of main-phase trials, over all blocks; the blocks differ by at most one trial when it does not divide
   * evenly. Given with `trials_per_block`, it must equal `n_blocks` times `trials_per_block`. (default: 200 —
   * Expfactory two-stage-decision, S024)
   */
  n_test_trials?: number;
  /**
   * Number of trials in each block. Given alone it sets `n_test_trials` to `n_blocks` times this. (default: 100 —
   * Expfactory two-stage-decision, S024)
   */
  trials_per_block?: number;
  /**
   * Probability that a choice in the first stage leads to the state it usually leads to (the common transition);
   * the other state is reached with the remaining probability (the rare transition). (default: 0.7 — Expfactory
   * two-stage-decision, S024; also Daw et al. 2011)
   */
  common_transition_prob?: number;
  /**
   * The starting reward probability of each of the four second-stage options, by state (`red`, `blue`) and option
   * (`option_1`, `option_2`). A number, or `{ min, max }` for a uniform draw. (default: every option drawn uniformly
   * from 0.25 to 0.75 — Expfactory two-stage-decision, S024)
   */
  reward_probability?: RewardProbability;
  /**
   * How the reward probabilities drift over trials, as a typed schedule. The walk and the rewards drawn from it
   * are generated when the timeline is built and recorded in the data (`reward_probs`, `reward_walk`).
   * (default: { kind: "random_walk", sd: 0.025, bounds: [0.25, 0.75], boundary: "reverse_step" } — Expfactory
   * two-stage-decision, S024; Daw et al. 2011 and 3 of 4 other walks reflect at the bounds)
   */
  reward_schedule?: RewardSchedule;
  /**
   * Ordering rules for the sequence of common and rare transitions. Only `null` (each transition drawn
   * independently with `common_transition_prob`) and `{}` are implemented. (default: null — independent
   * per trial, Expfactory two-stage-decision, S024)
   */
  sequence_constraints?: SequenceConstraints;

  // -- response --
  /**
   * What happens after a choice is missed. `skip_trial`: the trial is recorded as missed and the task goes on.
   * `repeat_trial`: the trial is run again, with the same reward probabilities and outcomes, until both choices
   * are made. (default: "skip_trial" — Expfactory two-stage-decision, S024)
   */
  missed_response_handling?: "skip_trial" | "repeat_trial" | "none";
  /**
   * Where the two options of a stage are shown. `random_per_trial`: each stage of each trial is drawn at random;
   * `counterbalanced`: each option is on the left in half the trials of a block; `fixed`: the same sides on every
   * trial, chosen at random per participant. (default: "random_per_trial" — most common in the literature, 3 of 5)
   */
  option_side_assignment?: "fixed" | "random_per_trial" | "counterbalanced";
  /**
   * The keys for the left and the right option, in that order. (default: ["ArrowLeft", "ArrowRight"] —
   * Expfactory two-stage-decision, S024)
   */
  response_keys?: string[];

  // -- procedure --
  /** Not implemented: only "none". The walkthrough has its own check questions. (default: "none" — S024) */
  comprehension_check?: "none" | "quiz" | "quiz_with_repeat" | "knowledge_test";
  /** Not implemented: only "none". (default: "none" — S024) */
  fullscreen_enforcement?: "none" | "fullscreen" | "fullscreen_and_focus";
  /**
   * A probe of what the participant learned. `questionnaire`: after the task, for each first-stage option, which
   * state it mostly led to. (default: "none" — S024)
   */
  manipulation_check?: "none" | "questionnaire" | "in_task_probe" | "debrief";
  /** Number of practice trials before the main task; 0 for none. (default: 50 — Expfactory two-stage-decision, S024) */
  practice_trials?: number;
  /** A pause between blocks: `self_paced` waits for a button. (default: "none" — S024) */
  rest_breaks?: "none" | "self_paced" | "fixed_interval";

  // -- feedback --
  /**
   * What marks the chosen option on screen after each choice (for `response_acknowledgement_ms`).
   * (default: "highlight" — Expfactory two-stage-decision, S024)
   */
  response_acknowledgement?: "none" | "keypress_mark" | "highlight";
  /**
   * `running_total` shows the coins earned so far with each outcome; practice coins are counted apart.
   * (default: "running_total" — Kool space_daw_task jsPsych, S025; the anchor does not report it)
   */
  running_score_display?: "none" | "running_total";

  // -- instructions --
  /**
   * How much of the task's structure the instructions disclose. `none`: only the keys and that coins are the
   * reward. `partial`: that each first-stage option mostly leads to one state, and that the reward chances change
   * slowly, without saying which state. `full`: also which state each option mostly leads to.
   * (default: "partial" — fill-in from the literature (1 of 4 sources); the anchor does not report it)
   */
  contingency_disclosure?: "none" | "partial" | "full";
  /** `text` (instruction pages and walkthrough) or `experimenter` (none). (default: "text" — S024) */
  instruction_format?: "text" | "audio" | "video" | "experimenter";
  /**
   * `interactive` (default for every package, PACKAGE-STANDARD 6a): a walkthrough with the task's own screens;
   * `none` skips it. (default: "interactive")
   */
  instruction_demonstration?: "interactive" | "none";
  /**
   * The cover story and drawings. `abstract_symbols`: plain symbols on coloured screens. `spaceship_planet_alien`:
   * two spaceships, two planets, four aliens. The other two stories of the literature are not implemented.
   * (default: "abstract_symbols" — Expfactory two-stage-decision, S024)
   */
  instruction_framing?: Framing;
  /** Not implemented: only "standard". (default: "standard" — S024) */
  population_protocol?: "standard" | "child" | "gamified_child" | "clinical";

  /**
   * Overrides for the practice phase (the values of these options win over the main options during practice).
   * (default: {})
   */
  practice?: Partial<Omit<TwoStepTaskOptions, "practice" | "text">>;
  /** Custom text strings for translation. Partial objects are merged with defaults. (default: {}) */
  text?: Partial<TextConfig>;
}

export type ResolvedOptions = Required<
  Omit<TwoStepTaskOptions, "practice" | "text" | "reward_probability">
> & {
  /** Complete: every state and option has a number or a range. */
  reward_probability: Record<StateId, Record<OptionId, ProbabilitySpec>>;
};

const FULL_RANGE = { min: 0.25, max: 0.75 };

export const DEFAULT_OPTIONS: ResolvedOptions & { practice: Partial<TwoStepTaskOptions> } = {
  feedback_duration_ms: 500,
  fixation_duration_ms: 0,
  iti_ms: 1000,
  response_window_ms: 2000,
  timeout_message_ms: 1500,
  response_acknowledgement_ms: 1000,
  n_blocks: 2,
  n_test_trials: 200,
  trials_per_block: 100,
  common_transition_prob: 0.7,
  reward_probability: {
    red: { option_1: FULL_RANGE, option_2: FULL_RANGE },
    blue: { option_1: FULL_RANGE, option_2: FULL_RANGE },
  },
  reward_schedule: {
    kind: "random_walk",
    sd: 0.025,
    bounds: [0.25, 0.75],
    boundary: "reverse_step",
  },
  sequence_constraints: null,
  missed_response_handling: "skip_trial",
  option_side_assignment: "random_per_trial",
  response_keys: ["ArrowLeft", "ArrowRight"],
  comprehension_check: "none",
  fullscreen_enforcement: "none",
  manipulation_check: "none",
  practice_trials: 50,
  rest_breaks: "none",
  response_acknowledgement: "highlight",
  running_score_display: "running_total",
  contingency_disclosure: "partial",
  instruction_format: "text",
  instruction_demonstration: "interactive",
  instruction_framing: "abstract_symbols",
  population_protocol: "standard",
  practice: {},
};

/** Options a `practice` override may set. The rest describe the whole run (counts, keys, instructions). */
export const PHASE_OPTIONS: string[] = [
  "feedback_duration_ms",
  "fixation_duration_ms",
  "iti_ms",
  "response_window_ms",
  "timeout_message_ms",
  "response_acknowledgement_ms",
  "common_transition_prob",
  "reward_probability",
  "reward_schedule",
  "missed_response_handling",
  "option_side_assignment",
  "response_acknowledgement",
  "running_score_display",
];

// -- resolution ---------------------------------------------------------------------------------

/** Merge a partial `reward_probability` over the default, state by state and option by option. */
function mergeProbabilities(
  over: RewardProbability | undefined
): Record<StateId, Record<OptionId, ProbabilitySpec>> {
  const out: any = {};
  for (const s of STATE_IDS) {
    out[s] = {};
    for (const o of OPTION_IDS) {
      out[s][o] = over?.[s]?.[o] ?? DEFAULT_OPTIONS.reward_probability[s][o];
    }
  }
  return out;
}

/**
 * The three count options are reconciled here. One alone sets the others (`n_test_trials` with the default
 * `n_blocks`; `trials_per_block` with the default `n_blocks`; `n_blocks` with the default `n_test_trials`);
 * two set the third; all three must agree. `trials_per_block` is the size of the largest block.
 */
function reconcileCounts(
  given: { n_test_trials?: number; n_blocks?: number; trials_per_block?: number },
  phase: "practice" | "test"
): { n_test_trials: number; n_blocks: number; trials_per_block: number } {
  if (phase === "practice") {
    // practice is one block of `practice_trials`; its counts are not used
    return { n_test_trials: 0, n_blocks: 1, trials_per_block: 0 };
  }
  const D = DEFAULT_OPTIONS;
  const hasN = given.n_test_trials !== undefined;
  const hasB = given.n_blocks !== undefined;
  const hasP = given.trials_per_block !== undefined;
  let n = given.n_test_trials ?? D.n_test_trials;
  let b = given.n_blocks ?? D.n_blocks;
  let p = given.trials_per_block ?? D.trials_per_block;
  if (hasN && hasB && hasP) {
    if (n !== b * p) {
      throw new Error(
        `two-step-task: n_test_trials (${n}), n_blocks (${b}) and trials_per_block (${p}) disagree: n_test_trials must equal n_blocks * trials_per_block.`
      );
    }
  } else if (hasN && hasP) {
    if (n % p !== 0) {
      throw new Error(
        `two-step-task: n_test_trials (${n}) is not a multiple of trials_per_block (${p}); give n_blocks as well, or change one of them.`
      );
    }
    b = n / p;
  } else if (hasB && hasP) {
    n = b * p;
  } else if (hasP) {
    n = b * p;
  } else {
    p = Math.ceil(n / b);
  }
  return { n_test_trials: n, n_blocks: b, trials_per_block: p };
}

/**
 * Resolve user options into complete options for one phase. Precedence (PACKAGE-STANDARD 2a): the user's
 * `practice` value, the user's top-level value, the package's practice default, the package default.
 */
export function resolveOptions(
  user: TwoStepTaskOptions = {},
  phase: "practice" | "test" = "test"
): ResolvedOptions {
  const { practice, text: _text, ...top } = user;
  const topKeys = new Set(Object.keys(top).filter((k) => (top as any)[k] !== undefined));
  let layer: Partial<TwoStepTaskOptions> = { ...top };
  if (phase === "practice") {
    const practiceKeys = new Set(Object.keys(practice ?? {}));
    const defaultPractice: Partial<TwoStepTaskOptions> = {};
    for (const [k, v] of Object.entries(DEFAULT_OPTIONS.practice)) {
      if (!topKeys.has(k) && !practiceKeys.has(k)) (defaultPractice as any)[k] = v;
    }
    layer = { ...layer, ...defaultPractice, ...(practice ?? {}) };
  }
  const merged: any = { ...DEFAULT_OPTIONS };
  delete merged.practice;
  for (const [k, v] of Object.entries(layer)) if (v !== undefined) merged[k] = v;
  merged.reward_probability = mergeProbabilities(layer.reward_probability);
  // the counts describe the main phase; `practice` cannot change them
  Object.assign(merged, reconcileCounts(top, phase));
  // an empty rule set is the same as none
  if (merged.sequence_constraints && Object.keys(merged.sequence_constraints).length === 0) {
    merged.sequence_constraints = null;
  }
  return merged as ResolvedOptions;
}

const NOT_IMPLEMENTED: Array<[keyof ResolvedOptions, string[], string]> = [
  [
    "comprehension_check",
    ["quiz", "quiz_with_repeat", "knowledge_test"],
    "the interactive walkthrough has its own check questions (instruction_demonstration)",
  ],
  ["fullscreen_enforcement", ["fullscreen", "fullscreen_and_focus"], "not implemented"],
  ["manipulation_check", ["in_task_probe", "debrief"], "only questionnaire is implemented"],
  [
    "rest_breaks",
    ["fixed_interval"],
    "the break schedule is not defined in the spec; use self_paced",
  ],
  ["response_acknowledgement", ["keypress_mark"], "only highlight is implemented"],
  [
    "instruction_format",
    ["audio", "video"],
    "no media is bundled; supply your own instruction trials",
  ],
  [
    "instruction_framing",
    ["magic_carpet_mountain_genie", "ship_island_chest"],
    "only abstract_symbols and spaceship_planet_alien are drawn",
  ],
  [
    "population_protocol",
    ["child", "gamified_child", "clinical"],
    "it bundles a deadline, audio, a tutorial and breaks; set those options one by one",
  ],
  ["missed_response_handling", ["none"], "use skip_trial or repeat_trial"],
];

const isNumber = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

function checkProbability(where: string, v: ProbabilitySpec, lo: number, hi: number) {
  const range = typeof v === "number" ? { min: v, max: v } : v;
  if (!isNumber(range?.min) || !isNumber(range?.max) || range.min > range.max) {
    throw new Error(`two-step-task: reward_probability.${where} must be a number or { min, max }.`);
  }
  if (range.min < lo || range.max > hi) {
    throw new Error(
      `two-step-task: reward_probability.${where} (${range.min}..${range.max}) lies outside reward_schedule.bounds [${lo}, ${hi}].`
    );
  }
}

/** Throw on values the package cannot honour or combinations that contradict each other. */
export function validateOptions(o: ResolvedOptions): void {
  for (const [key, values, why] of NOT_IMPLEMENTED) {
    if (values.includes(o[key] as string)) {
      throw new Error(`two-step-task: ${key}: "${o[key]}" is not implemented (${why}).`);
    }
  }
  const sch = o.reward_schedule as RewardSchedule;
  if (!sch || sch.kind !== "random_walk") {
    throw new Error(
      `two-step-task: reward_schedule: kind "${
        (sch as any)?.kind
      }" is not implemented (only "random_walk").`
    );
  }
  if (!(sch.sd > 0) || !Array.isArray(sch.bounds) || !(sch.bounds[0] < sch.bounds[1])) {
    throw new Error(
      "two-step-task: reward_schedule needs sd > 0 and bounds [lower, upper] with lower < upper."
    );
  }
  if (sch.boundary !== "reflect" && sch.boundary !== "reverse_step") {
    throw new Error(`two-step-task: reward_schedule.boundary must be "reflect" or "reverse_step".`);
  }
  for (const s of STATE_IDS)
    for (const opt of OPTION_IDS)
      checkProbability(`${s}.${opt}`, o.reward_probability[s][opt], sch.bounds[0], sch.bounds[1]);
  if (!(o.common_transition_prob >= 0 && o.common_transition_prob <= 1)) {
    throw new Error("two-step-task: common_transition_prob must be between 0 and 1.");
  }
  if (!Array.isArray(o.response_keys) || o.response_keys.length !== 2) {
    throw new Error(
      "two-step-task: response_keys must list exactly two keys (first = left option)."
    );
  }
  if (o.response_keys[0] === o.response_keys[1]) {
    throw new Error("two-step-task: response_keys must be two different keys.");
  }
  for (const k of ["n_blocks", "n_test_trials", "trials_per_block"] as const) {
    if (o[k] !== 0 && (!(o[k] >= 1) || !Number.isInteger(o[k]))) {
      throw new Error(`two-step-task: ${k} must be a positive integer.`);
    }
  }
  if (o.sequence_constraints !== null) {
    throw new Error(
      "two-step-task: sequence_constraints: ordering rules are not implemented; transitions are drawn independently (use null or {})."
    );
  }
}
