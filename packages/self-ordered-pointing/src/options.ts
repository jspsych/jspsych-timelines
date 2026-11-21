/**
 * Options for the self-ordered pointing timeline.
 *
 * Every default below states its source. The anchor is the TaskBeacon reference implementation (S019, MIT),
 * which agrees with Inquisit's SOPT (S024) and the most detailed lab paper (Geva et al. 2016, S010): 6, 8, 10
 * and 12 items, three series each, increasing load, item positions reshuffled on every page, untimed,
 * no feedback. The original Petrides & Milner 1982 design (S005) is only known from its abstract.
 * Defaults that differ from the generated spec are listed with reasons in packages/self-ordered-pointing/DEFAULTS.md.
 *
 * Vocabulary: a "series" is one run through a set (the literature's "trial": N pages of N items, one pick per page).
 * A "page" is one screen of items, one scorable row.
 */
import {
  DEFAULT_POSITION_REPEAT_MAX,
  DEFAULT_RESHUFFLE_PROPORTION,
  MAX_SET_SIZE,
  POOL_SIZE,
} from "./constants";
import type { TextConfig } from "./text";

// -- value types --------------------------------------------------------------------------------

/** Fixed duration, or a uniform jitter range sampled in `step` increments. */
export type DurationOrJitter = number | { min: number; max: number; step?: number };

/** What the items are. */
export type ItemSet =
  | "abstract_designs"
  | "representational_drawings"
  | "words"
  | "nonwords"
  | { words: string[] }
  | { images: string[] };

export interface StimulusSet {
  /**
   * The items. "abstract_designs": this package's own random polygons (seeded Attneave-style, 48 in the pool);
   * "words": 48 common concrete nouns; "nonwords": 48 pronounceable nonwords; `{ words: [...] }`: your own text
   * items; `{ images: [...] }`: your own image URLs. "representational_drawings" is not implemented (no licensed drawing set is bundled).
   * (default: "abstract_designs" — S019, S010, S034, S054, S014)
   */
  items?: ItemSet;
  /**
   * Which items each set size uses. "nested_first_n": the first N items of one pool (a set of 6 is the first 6 of the set of 12; S019).
   * "distinct_per_set_size": every set size gets its own items, so no item reappears across sizes (S010, S053).
   * (default: "nested_first_n" — S019)
   */
  pool?: "nested_first_n" | "distinct_per_set_size";
}

export type BlockOrder =
  | "fixed"
  | "random"
  | "counterbalanced"
  | "ascending"
  | "descending"
  | "alternating"
  | "random_within_block";

export type ResponseDeviceName =
  | "keyboard"
  | "mouse"
  | "touch"
  | "microphone"
  | "eye_tracker"
  | "gamepad";

export interface SelfOrderedPointingOptions {
  // -- timing --
  /**
   * The blank screen before every page, so that the reshuffle is seen as a new page. 0 = no blank page.
   * A `{min, max, step}` object draws a jitter per page.
   * (default: 250 — S019, its own adaptation to a digital page turn; no paper reports one)
   */
  iti_ms?: DurationOrJitter;
  /**
   * Time allowed for each pick, from the page onset; null = untimed. A miss records no pick (`timeout: true`,
   * `response: null`), the page is not repeated, and the item stays unpicked.
   * (default: null — untimed in every source: S012, S014, S040, S019)
   */
  response_window_ms?: DurationOrJitter | null;
  /**
   * How long page feedback (`trial_feedback`) stays on screen. A `{min, max, step}` object draws a jitter per page.
   * (default: 800 — package choice: no source gives feedback; see DEFAULTS.md)
   */
  feedback_duration_ms?: DurationOrJitter;

  // -- stimulus --
  /**
   * How the items are placed on a page. "fixed_grid_slots": a grid of slots (rows and columns follow the set size), items move between slots;
   * "free_positions_in_area": each item sits at a random place inside its own cell of the area, so no two overlap.
   * The position-repeat rules (`position_repeat_rule`) need the grid.
   * (default: "fixed_grid_slots" — S019, S014, S010; S054 used free positions on paper)
   */
  stimulus_layout?: "fixed_grid_slots" | "free_positions_in_area";
  /**
   * The items, keyed by the task's own terms: `items` and `pool`.
   * (default: { items: "abstract_designs", pool: "nested_first_n" } — S019)
   */
  stimulus_set?: StimulusSet;
  /**
   * What moves between pages. "full_reshuffle_each_page": a new random arrangement on every page (never the same as the page before);
   * "partial_reshuffle_each_page": only some of the items change places after each pick (S014), so some spatial cues remain.
   * (default: "full_reshuffle_each_page" — S019, S024, S034, S010)
   */
  rearrangement_rule?: "full_reshuffle_each_page" | "partial_reshuffle_each_page";
  /**
   * Under "partial_reshuffle_each_page": the proportion of the items that change places (at least two move). Task-specific;
   * S014 says only that "some" items were rearranged.
   * (default: 0.5 — package choice, needs human decision: no source gives the number)
   */
  reshuffle_proportion?: number;

  // -- design --
  /**
   * Order of the test's series across set sizes. "ascending" (default) and "descending": one block per set size, in order; "fixed": one block
   * per set size in the order of `set_sizes`; "random": one block holding every series in random order (per participant);
   * "random_within_block": `trials_per_condition` blocks, each holding one series of every set size in random order.
   * "counterbalanced" and "alternating" are not implemented.
   * (default: "ascending" — S019, S024, S053, S054; S040 randomised)
   */
  block_order?: BlockOrder;
  /**
   * Set sizes: how many items a set has, which is also how many pages one series has.
   * Practice set sizes are `practice.set_sizes`, not this.
   * (default: [6, 8, 10, 12] — S019, S024; S010 adds 4, S034 uses 6, 9, 12)
   */
  set_sizes?: number[];
  /**
   * Series (the literature's "trials") of each set size. The items of a set size stay the same across its series; positions reshuffle.
   * (default: 3 — S019, S024, S010, S014, S053 (modal))
   */
  trials_per_condition?: number;
  /**
   * A limit on pointing at the same screen position over and over (a strategy that avoids remembering the items).
   * "none": no rule; "instructed": the instructions tell the participant not to pick the same position more than `position_repeat_max`
   * times in a row (S010); "enforced": the position that would break the limit is disabled on the page (S055);
   * "detect_and_remind": the pick that breaks the limit is allowed and followed by a reminder screen (S024; Inquisit's thresholds are not published).
   * Task-specific: `sequence_constraints` constrains generated trial order, not the participant's picks.
   * (default: "none" — S019 has no rule; S054 deliberately had none)
   */
  position_repeat_rule?: "none" | "instructed" | "enforced" | "detect_and_remind";
  /**
   * The most picks at one screen position in a row the rule above allows.
   * (default: 2 — S010, S055)
   */
  position_repeat_max?: number;

  // -- response --
  /**
   * Input device. Mouse and touch both click or tap an item; the value is recorded and sets the wording ("click" or "tap").
   * Keyboard, microphone, eye tracker and gamepad are not implemented: the response is a position on screen.
   * (default: "mouse" — S019, S040; S014 and S053 used a touchscreen)
   */
  response_device?: ResponseDeviceName;

  // -- procedure --
  /**
   * Handling of a repeat within a series. Only "none" is implemented: the series continues to its N pages, with no retry or correction (S019, S012, S040).
   * (default: "none" — S019)
   */
  error_correction_procedure?: "none" | "retry" | "correction_trial" | "answer_change_allowed";
  /**
   * Adaptive load. Only null (a fixed schedule of set sizes) is implemented: S040's IRT-CAT and S056's ascending-until-fail need
   * item banks and a discontinue rule that the spec has no count for.
   * (default: null — fixed schedule, S019, S024)
   */
  adaptive?: null;
  /**
   * Practice series (set sizes from `practice.set_sizes`); 0 skips practice. The walkthrough comes first and does not count.
   * (default: 0 — S019 has no practice; S024 and S054 use 2, S053 3)
   */
  practice_trials?: number;
  /**
   * Whole-protocol adaptation. Only "standard" is implemented: the preschool protocol (S056, S008) needs picture cards, pre-training and a discontinue rule.
   * (default: "standard" — the anchor is the adult protocol; the spec's fill "child" is a fill, not evidence)
   */
  population_protocol?: "standard" | "child" | "gamified_child" | "clinical";

  // -- feedback --
  /**
   * What is shown after each page. "accuracy": "new item" or "repeat" for `feedback_duration_ms`. "none": nothing, as in the
   * anchor (S019 marks no selected items). Other values are not implemented.
   * (default: "none" — S019; practice default "accuracy", so the rule is learned)
   */
  trial_feedback?:
    | "none"
    | "accuracy"
    | "rt"
    | "accuracy_rt"
    | "points"
    | "reward_outcome"
    | "correct_answer";
  /**
   * Result screen after the last series. "score": total repeat errors and errors per set size. "none": the completion page only.
   * (default: "none")
   */
  end_of_task_feedback?: "none" | "score";

  // -- instructions --
  /**
   * "text" shows the instruction pages; "experimenter" shows none. Others are not implemented.
   * (default: "text")
   */
  instruction_format?: "text" | "audio" | "video" | "experimenter";
  /**
   * Walkthrough between the instruction pages and the task (PACKAGE-STANDARD §6a). "interactive": a set of three, real picks, a hint after
   * a repeat (3 attempts). "none" skips it. Others are not implemented.
   * (default: "interactive" — documented exception to the evidence-anchored defaults, §6a)
   */
  instruction_demonstration?: "none" | "examples" | "animated" | "guided_trial" | "interactive";

  // -- phase overrides and text --
  /**
   * Overrides for the practice phase. Honoured: trial_feedback, feedback_duration_ms, response_window_ms, iti_ms, set_sizes.
   * Other keys are ignored in practice. Practice `set_sizes` are never taken from the top level.
   * (default: { set_sizes: [3], trial_feedback: "accuracy" } — S054 uses a practice set of 3)
   */
  practice?: Partial<SelfOrderedPointingOptions>;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

/** Options that can differ between practice and test (the keys `practice` honours). */
export const PHASE_OPTIONS = [
  "trial_feedback",
  "feedback_duration_ms",
  "response_window_ms",
  "iti_ms",
  "set_sizes",
] as const;

/** Test-design options whose top-level value is never used in practice. */
const TEST_ONLY = ["set_sizes", "block_order"];

export type ResolvedOptions = Required<Omit<SelfOrderedPointingOptions, "practice" | "text">> & {
  stimulus_set: Required<StimulusSet>;
};

export const DEFAULT_OPTIONS: ResolvedOptions & { practice: Partial<SelfOrderedPointingOptions> } =
  {
    iti_ms: 250,
    response_window_ms: null,
    feedback_duration_ms: 800,
    stimulus_layout: "fixed_grid_slots",
    stimulus_set: { items: "abstract_designs", pool: "nested_first_n" },
    rearrangement_rule: "full_reshuffle_each_page",
    reshuffle_proportion: DEFAULT_RESHUFFLE_PROPORTION,
    block_order: "ascending",
    set_sizes: [6, 8, 10, 12],
    trials_per_condition: 3,
    position_repeat_rule: "none",
    position_repeat_max: DEFAULT_POSITION_REPEAT_MAX,
    response_device: "mouse",
    error_correction_procedure: "none",
    adaptive: null,
    practice_trials: 0,
    population_protocol: "standard",
    trial_feedback: "none",
    end_of_task_feedback: "none",
    instruction_format: "text",
    instruction_demonstration: "interactive",
    practice: { set_sizes: [3], trial_feedback: "accuracy" },
  };

// -- resolution ---------------------------------------------------------------------------------

const NOT_IMPLEMENTED: Array<[keyof ResolvedOptions, string[], string]> = [
  [
    "block_order",
    ["counterbalanced", "alternating"],
    "use ascending, descending, fixed, random or random_within_block",
  ],
  [
    "trial_feedback",
    ["rt", "accuracy_rt", "points", "reward_outcome", "correct_answer"],
    "use accuracy or none",
  ],
  [
    "error_correction_procedure",
    ["retry", "correction_trial", "answer_change_allowed"],
    "a repeat never ends or repeats the series; S056's terminate-on-repeat-errors has no count in the spec either",
  ],
  [
    "population_protocol",
    ["child", "gamified_child", "clinical"],
    "the preschool protocol needs picture cards, pre-training and a discontinue rule that the spec gives no count for",
  ],
  [
    "instruction_format",
    ["audio", "video"],
    "no media is bundled; supply your own instruction trials",
  ],
  [
    "instruction_demonstration",
    ["examples", "animated", "guided_trial"],
    "use interactive (real picks, repeat until correct) or none",
  ],
];

const DEVICES_IMPLEMENTED = ["mouse", "touch"];

/**
 * Resolve user options into complete options for one phase. A user value in `practice` wins over a user
 * value at the top level, which wins over the package practice default; `set_sizes` and `block_order` are
 * test-only at the top level.
 */
export function resolveOptions(
  user: SelfOrderedPointingOptions = {},
  phase: "practice" | "test" = "test"
): ResolvedOptions {
  const { practice, text: _text, ...top } = user;
  const topKeys = new Set(Object.keys(top).filter((k) => (top as any)[k] !== undefined));
  let layer: Partial<SelfOrderedPointingOptions> = { ...top };

  if (phase === "practice") {
    for (const k of TEST_ONLY) delete (layer as any)[k];
    const practiceKeys = new Set(Object.keys(practice ?? {}));
    const defaultPractice: Partial<SelfOrderedPointingOptions> = {};
    for (const [k, v] of Object.entries(DEFAULT_OPTIONS.practice)) {
      if ((!topKeys.has(k) || TEST_ONLY.includes(k)) && !practiceKeys.has(k))
        (defaultPractice as any)[k] = v;
    }
    layer = { ...layer, ...defaultPractice, ...(practice ?? {}) };
  }

  const merged: any = { ...DEFAULT_OPTIONS };
  delete merged.practice;
  for (const [k, v] of Object.entries(layer)) if (v !== undefined) merged[k] = v;
  merged.stimulus_set = { ...DEFAULT_OPTIONS.stimulus_set, ...(layer.stimulus_set ?? {}) };
  return merged as ResolvedOptions;
}

/** Number of items a set of the items option can supply, or Infinity for the built-in pools (checked against POOL_SIZE). */
export function poolCapacity(items: ItemSet): number {
  if (typeof items === "object") return "words" in items ? items.words.length : items.images.length;
  return POOL_SIZE;
}

const isDuration = (v: unknown) =>
  typeof v === "number" ? v >= 0 : typeof v === "object" && v !== null;

function checkDuration(name: string, v: unknown, allowNull: boolean) {
  if (v === null && allowNull) return;
  if (!isDuration(v) || v === null) {
    throw new Error(
      `self-ordered-pointing: ${name} must be a duration (a number of ms, or { min, max, step })${
        allowNull ? " or null" : ""
      }.`
    );
  }
  if (typeof v === "object") {
    const w: any = v;
    if (!(w.min >= 0 && w.max >= w.min)) {
      throw new Error(`self-ordered-pointing: ${name}: { min, max } needs 0 <= min <= max.`);
    }
  }
}

/** Number of distinct items a whole run needs under the pool rule, or the largest set size when nested. */
export function itemsNeeded(
  pool: "nested_first_n" | "distinct_per_set_size",
  testSizes: number[],
  practiceSizes: number[],
  walkthroughSize: number
): number {
  if (pool === "nested_first_n") return Math.max(...testSizes, ...practiceSizes, walkthroughSize);
  const uniq = (l: number[]) => [...new Set(l)].reduce((a, b) => a + b, 0);
  return uniq(testSizes) + uniq(practiceSizes) + walkthroughSize;
}

/** Throw on values the package cannot honour or combinations that contradict each other. */
export function validateOptions(o: ResolvedOptions, phase: "practice" | "test" = "test"): void {
  for (const [key, values, why] of NOT_IMPLEMENTED) {
    if (values.includes(o[key] as string)) {
      throw new Error(
        `self-ordered-pointing: ${String(key)}: "${o[key]}" is not implemented (${why}).`
      );
    }
  }
  if (o.adaptive !== null) {
    throw new Error(
      "self-ordered-pointing: adaptive is not implemented: only a fixed schedule of set sizes (adaptive: null). IRT-CAT (S040) and ascending-until-fail (S056) need an item bank and a discontinue rule."
    );
  }
  if (!DEVICES_IMPLEMENTED.includes(o.response_device)) {
    throw new Error(
      `self-ordered-pointing: response_device: "${o.response_device}" is not implemented (mouse and touch only: the response is a click or tap on an item).`
    );
  }
  const items = o.stimulus_set.items;
  if (items === "representational_drawings") {
    throw new Error(
      'self-ordered-pointing: stimulus_set.items: "representational_drawings" is not implemented (no licensed drawing set is bundled); use "abstract_designs", "words", "nonwords", { words: [...] } or { images: [...] }.'
    );
  }
  if (
    typeof items === "object" &&
    !(
      ("words" in items && Array.isArray(items.words)) ||
      ("images" in items && Array.isArray(items.images))
    )
  ) {
    throw new Error(
      "self-ordered-pointing: stimulus_set.items as an object must be { words: [...] } or { images: [...] }."
    );
  }
  if (!["nested_first_n", "distinct_per_set_size"].includes(o.stimulus_set.pool)) {
    throw new Error(
      `self-ordered-pointing: stimulus_set.pool: "${o.stimulus_set.pool}" is not a pool rule (nested_first_n or distinct_per_set_size).`
    );
  }
  if (!["fixed_grid_slots", "free_positions_in_area"].includes(o.stimulus_layout)) {
    throw new Error(
      `self-ordered-pointing: stimulus_layout: "${o.stimulus_layout}" is not implemented.`
    );
  }
  if (
    !Array.isArray(o.set_sizes) ||
    o.set_sizes.length === 0 ||
    o.set_sizes.some((n) => !Number.isInteger(n) || n < 2 || n > MAX_SET_SIZE)
  ) {
    throw new Error(
      `self-ordered-pointing: set_sizes must be a list of integers from 2 to ${MAX_SET_SIZE} (the grid layout is built for that range).`
    );
  }
  if (new Set(o.set_sizes).size !== o.set_sizes.length) {
    throw new Error(
      "self-ordered-pointing: set_sizes must not repeat a size; use trials_per_condition."
    );
  }
  if (
    phase === "test" &&
    !(Number.isInteger(o.trials_per_condition) && o.trials_per_condition >= 1)
  ) {
    throw new Error(
      "self-ordered-pointing: trials_per_condition must be a whole number of at least 1."
    );
  }
  if (!(Number.isInteger(o.practice_trials) && o.practice_trials >= 0)) {
    throw new Error("self-ordered-pointing: practice_trials must be a whole number of at least 0.");
  }
  checkDuration("iti_ms", o.iti_ms, false);
  checkDuration("feedback_duration_ms", o.feedback_duration_ms, false);
  checkDuration("response_window_ms", o.response_window_ms, true);
  if (typeof o.response_window_ms === "number" && o.response_window_ms <= 0) {
    throw new Error(
      "self-ordered-pointing: response_window_ms must be above 0, or null for untimed."
    );
  }
  if (!(o.reshuffle_proportion > 0 && o.reshuffle_proportion <= 1)) {
    throw new Error("self-ordered-pointing: reshuffle_proportion must be in (0, 1].");
  }
  if (!["none", "instructed", "enforced", "detect_and_remind"].includes(o.position_repeat_rule)) {
    throw new Error(
      `self-ordered-pointing: position_repeat_rule: "${o.position_repeat_rule}" is not a rule (none, instructed, enforced, detect_and_remind).`
    );
  }
  if (o.position_repeat_rule !== "none") {
    if (o.stimulus_layout !== "fixed_grid_slots") {
      throw new Error(
        `self-ordered-pointing: position_repeat_rule "${o.position_repeat_rule}" and stimulus_layout "${o.stimulus_layout}" contradict each other: a position is only defined on the fixed grid.`
      );
    }
    if (!(Number.isInteger(o.position_repeat_max) && o.position_repeat_max >= 1)) {
      throw new Error(
        "self-ordered-pointing: position_repeat_max must be a whole number of at least 1."
      );
    }
  }
}

/** The whole-run item check: the pool must hold enough items for all the sets (called once the phases are resolved). */
export function checkPool(
  test: ResolvedOptions,
  practice: ResolvedOptions,
  walkthroughSize: number
): void {
  const needed = itemsNeeded(
    test.stimulus_set.pool,
    test.set_sizes,
    practice.practice_trials > 0 ? practice.set_sizes : [],
    walkthroughSize
  );
  const cap = poolCapacity(test.stimulus_set.items);
  if (needed > cap) {
    throw new Error(
      `self-ordered-pointing: stimulus_set.pool "${test.stimulus_set.pool}" with these set sizes needs ${needed} different items but the item set has ${cap}. Use "nested_first_n", fewer or smaller sets, or give more items.`
    );
  }
}
