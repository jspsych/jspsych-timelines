import { FALLBACK_DEADLINE_MS, INSTRUCTION_RECALL_SET_SIZE } from "./constants";
/**
 * Options for the complex span (operation span) timeline.
 *
 * Every default below states its source. The anchor is the automated operation span of Unsworth et al.
 * 2005 (S006, Engle lab), summarised for the family by Redick et al. 2012 (S008) with the procedural
 * recommendations of Conway et al. 2005 (S007). The spec marked the anchor `escalate: true` for the
 * processing pacing rule; see DEFAULTS.md ("needs human decision"). Defaults that differ from the
 * generated spec are listed with reasons in packages/operation-span/DEFAULTS.md.
 */
import { DeadlineFunction, deadlines } from "./deadlines";
import { Stimulus, StimulusSet, asStimulusSet, buildPool, letters, setProblems } from "./sets";
import type { TextConfig } from "./text";

// -- value types --------------------------------------------------------------------------------

/** Fixed duration, or a uniform jitter range sampled in `step` increments. */
export type DurationOrJitter = number | { min: number; max: number; step?: number };

/**
 * Time allowed for the processing response. A number (ms), a jitter range, `null` (untimed), or a
 * function computed during the session (PACKAGE-STANDARD §2a), called at the start of each timed
 * processing trial with `{ jsPsych, phase, block, trial_index_in_block }`.
 */
export type ResponseWindow = DurationOrJitter | null | DeadlineFunction;

export type ResponseDeviceName =
  | "keyboard"
  | "mouse"
  | "touch"
  | "microphone"
  | "eye_tracker"
  | "gamepad";

/** Devices of the two kinds of response: the true/false processing task and the recall. */
export interface ResponseDeviceMap {
  processing?: ResponseDeviceName;
  recall?: ResponseDeviceName;
}

export type BlockOrder =
  | "fixed"
  | "random"
  | "counterbalanced"
  | "ascending"
  | "descending"
  | "alternating"
  | "random_within_block";

export type PracticeStructure =
  | "storage_processing_combined"
  | "storage_processing"
  | "combined_only"
  | "none";

export interface PracticeCriterion {
  /** Minimum processing accuracy (proportion, timeouts count as errors). */
  accuracy: number;
  /** Number of most recent practice processing trials the accuracy is computed over; null = the whole part. */
  window?: number | null;
  /** What happens on a miss. (default: "repeat") */
  on_fail?: "repeat" | "continue" | "end";
  /** Most repeats before the task continues. (default: 1) */
  max_repeats?: number;
}

export type { Stimulus, StimulusSet } from "./sets";

/** The `stimulus_set` option: the memoranda, and where they come from. */
export interface StimulusSetOption {
  /**
   * The memoranda: a set (`{ name?, noun?, items }`) or a plain array of items. The bundled sets are
   * `utils.stimuli.letters` (the 12 consonants of the Engle-lab task, F H J K L N P Q R S T Y) and `utils.stimuli.digits` (1-9).
   * Your own set takes strings or `{ text, id? }` objects (text only: recall names the items), at least as many as the largest
   * set size; `noun` is what the instructions call them (default "item"/"items"). The recall matrix shows the set in its order.
   * (default: utils.stimuli.letters — Unsworth et al. 2005, S006)
   */
  memorandum?: StimulusSet | readonly Stimulus[];
  /**
   * Where memoranda come from. Only "separate_item" is implemented; "sentence_final_word" (reading span) needs sentences.
   * (default: "separate_item" — S006)
   */
  memorandum_source?: "separate_item" | "sentence_final_word";
}

export interface OperationSpanOptions {
  // -- timing --
  /**
   * How long trial feedback stays on screen. A `{min, max, step}` object draws a jitter per trial.
   * (default: 2000 — Unsworth et al. 2005 Fig. 1, S006)
   */
  feedback_duration_ms?: DurationOrJitter;
  /**
   * Gap between successive events (a problem, a memorandum) within a trial; 0 = none.
   * (default: 0 — no free time between events, as in S006 and recommended by S007; the spec's fill of 500 ms comes from one jsPsych implementation, S020. See DEFAULTS.md)
   */
  inter_item_interval_ms?: DurationOrJitter;
  /**
   * Time allowed for the processing response (the problem screen in the two-screen format, the true/false response in the single-screen format), from its onset;
   * null = untimed. Misses are speed errors (`timeout: true`). A function is called at the start of each timed trial and
   * reads practice data itself: the default is the anchor's calibrated rule, `utils.deadlines.meanPlusSd(2.5)` (mean + 2.5 SD of the
   * correct processing-only practice RTs; until there are 5 usable RTs it returns the fixed 6000 ms). The processing-only practice part itself is self-paced
   * unless `practice.response_window_ms` is given. Function values are code-only: presets leave them out.
   * (default: utils.deadlines.meanPlusSd(2.5) — Unsworth et al. 2005, S006; also PsyToolkit, S017)
   * @acceptsFunction (ctx: { jsPsych, phase, block, trial_index_in_block }) => number
   */
  response_window_ms?: ResponseWindow;
  /**
   * How long each memorandum is shown. Must be a duration (a memorandum cannot wait for a response).
   * (default: 800 — Unsworth et al. 2005, S006)
   */
  stimulus_duration_ms?: DurationOrJitter;

  // -- stimulus --
  /**
   * Language of verbal stimuli. The task has no built-in word lists: only null (language-neutral letters, digits and equations) is implemented.
   * Supply your own words as a set in `stimulus_set.memorandum`.
   * (default: null — the anchor uses letters; the spec's fill of "Portuguese" (2/4) belongs to word and sentence materials)
   */
  stimulus_language?: "Dutch" | "German" | "Portuguese" | null;
  /**
   * Memorandum material, keyed by the task's own terms: `memorandum`, `memorandum_source`.
   * (default: { memorandum: utils.stimuli.letters, memorandum_source: "separate_item" } — S006)
   */
  stimulus_set?: StimulusSetOption;
  /**
   * Layout of the processing task. "problem_then_answer_screens": the problem alone (timed, click when solved),
   * then the proposed answer with true/false. "equation_with_answer_single_screen": problem and answer together (timed true/false).
   * "equation_and_memorandum_same_screen" is not implemented.
   * (default: "problem_then_answer_screens" — S006 p. 502; the verification screen is untimed, S017)
   */
  processing_display_format?:
    | "problem_then_answer_screens"
    | "equation_with_answer_single_screen"
    | "equation_and_memorandum_same_screen";

  // -- design --
  /**
   * Order of the test trials' set sizes. "random": one block, every set size `trials_per_condition` times in random order
   * (per participant). "random_within_block": `trials_per_condition` blocks, each holding every set size once in random order.
   * "fixed": one block in a fixed interleaved order, identical for every participant. "ascending" / "descending": one block,
   * set sizes grouped. With a per-block `set_sizes` list, the order applies within each block. "counterbalanced" and "alternating" are not implemented.
   * (default: "random" — random per participant, S006; S007 recommends it)
   */
  block_order?: BlockOrder;
  /**
   * Scored test trials in total. Equal to the number of set sizes times `trials_per_condition`: give one of the three
   * to derive the others (this one throws when it is not a multiple of the number of set sizes).
   * (default: 15 — 3 trials of each of 5 set sizes, S006)
   */
  n_test_trials?: number;
  /**
   * Set sizes (number of memoranda per trial). A flat list is the levels of one design. A list of lists is one list per block
   * (the number of blocks is the length of the outer list; each block holds each of its set sizes `trials_per_condition` times).
   * Practice set sizes are `practice.set_sizes`, not this.
   * (default: [3, 4, 5, 6, 7] — S006; S007 calls 2-5 adequate for college samples, S011 adds 8-9 for high ability)
   */
  set_sizes?: number[] | number[][];
  /**
   * Trials of each set size (flat `set_sizes`: in total; per-block `set_sizes`: per block).
   * (default: 3 — S006)
   */
  trials_per_condition?: number;
  /**
   * Order of events within one memorandum step. "processing_first": the problem, then the memorandum (so the last event before recall
   * is a memorandum). "memorandum_first": the memorandum, then the problem(s), so processing follows the last item.
   * (default: "processing_first" — S006; S021 and S033 use memorandum_first)
   */
  memorandum_order_in_pair?: "memorandum_first" | "processing_first";
  /**
   * Processing problems per memorandum; 0 gives a simple span with no processing.
   * (default: 1 — S006; S045 uses 2)
   */
  processing_items_per_memorandum?: number;
  /**
   * Which complex span runs. Only "operation_span" (arithmetic processing) is implemented; the deferred processing task of the spec
   * (reading, symmetry and rotation span) needs other stimulus generators.
   * (default: "operation_span" — S006)
   */
  task_variant?: "operation_span" | "reading_span" | "symmetry_span" | "rotation_span";

  // -- response --
  /**
   * Input device. A single value applies to both responses; a map sets `processing` (the true/false task) and `recall` separately.
   * Keyboard processing uses `response_keys`; mouse and touch use buttons. Recall with mouse or touch is the click grid, with keyboard it is typed.
   * (default: { processing: "mouse", recall: "mouse" } — S006)
   */
  response_device?: ResponseDeviceName | ResponseDeviceMap;
  /**
   * Shape of the recall response. "n_afc": click letters in an on-screen matrix (needs mouse or touch). "free_text": one typed
   * box per memorandum (keyboard). "single_response": one key press per recalled item (keyboard). The processing task is always a true/false choice.
   * (default: "n_afc" — S006's 4 x 3 click matrix)
   */
  response_format?: "single_response" | "n_afc" | "rating" | "free_text" | "location" | "none";
  /**
   * Whether recall must be in presentation order. "serial": a position is correct only when it holds the item presented there.
   * "free": an item counts when it was presented, wherever it is entered. "task1_first" is not implemented.
   * (default: "serial" — S006)
   */
  response_order?: "serial" | "free" | "task1_first";
  /**
   * Keys of the processing task when its device is "keyboard": the first means "true", the second "false".
   * (default: ["f", "j"] — letters, index fingers; the spec lists F/J and a/l without counts)
   */
  response_keys?: string[];
  /**
   * How a forgotten item is entered. "blank_button": a button that fills the position with a blank, so later items keep their serial position.
   * "skip_button": the same, labelled "skip". "question_mark_key": the ? key does it (keyboard recall). "none": every position must be filled.
   * (default: "blank_button" — S006)
   */
  recall_omission_handling?: "blank_button" | "none" | "question_mark_key" | "skip_button";

  // -- procedure --
  /**
   * Accuracy criterion on the processing task in practice, and what happens when it is missed: it is checked after the processing-only
   * part (or the combined part when there is none). null = no criterion.
   * (default: null — the anchor has no practice criterion; S036 uses `{ accuracy: 0.85, window: 10 }`)
   */
  practice_criterion?: PracticeCriterion | null;
  /**
   * Which practice parts run, in order. "storage_processing_combined": letters only, then processing only, then both (S006).
   * "storage_processing": letters only, then processing only (S026). "combined_only": both (S027, S034). "none": no practice.
   * (default: "storage_processing_combined" — Unsworth et al. 2005, S006)
   */
  practice_structure?: PracticeStructure;
  /**
   * Processing-only practice problems (self-paced; they calibrate the deadline); 0 skips that part.
   * (default: 15 — S006)
   */
  practice_trials?: number;
  /**
   * Letters-only practice trials (set sizes from `practice.set_sizes`); 0 skips that part.
   * (default: 4 — the PsyToolkit implementation of the anchor uses 4 sets, S017)
   */
  practice_storage_trials?: number;
  /**
   * Combined (processing + memoranda) practice trials, at the practice set sizes; 0 skips that part.
   * (default: 3 — S006: three trials of set size 2; S033 3, S027 3, S034 2)
   */
  practice_combined_trials?: number;

  // -- feedback --
  /**
   * Score report on the last screen. "score": the partial score and processing accuracy. "summary" is the same with the full breakdown.
   * "normative" is not implemented.
   * (default: "none" — the spec has no typed value for the anchor; S027 shows percentage success at the end)
   */
  end_of_task_feedback?: "none" | "score" | "summary" | "normative";
  /**
   * What is shown after each recall (and after each problem in processing-only practice). "accuracy": letters recalled, math errors and
   * running math accuracy. "correct_answer" adds the presented sequence. RT-based and points values are not implemented.
   * (default: "accuracy" — S006 per-trial feedback; shown in practice and test, as in the anchor)
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
   * "text" shows instruction pages; "experimenter" shows none. Others are not implemented.
   * (default: "text" — the spec's fill is video then written (S026), which needs media)
   */
  instruction_format?: "text" | "audio" | "video" | "experimenter";
  /**
   * Walkthrough between the instruction pages and practice (PACKAGE-STANDARD §6a). "interactive": a true and a false problem answered as in the task,
   * then a two-item recall at task timing on the real recall input; wrong answers get a hint and repeat (3 attempts). "examples" and "none" skip the interaction.
   * "animated" and "guided_trial" are not implemented.
   * (default: "interactive" — documented exception to the evidence-anchored defaults, §6a)
   */
  instruction_demonstration?: "none" | "examples" | "animated" | "guided_trial" | "interactive";
  /**
   * Emphasis sentence in the instructions. "accuracy": keep processing accuracy at 85% or higher. "both": be quick and accurate within the time limit.
   * "speed": be as fast as you can. "none": no sentence.
   * (default: "accuracy" — S006: keep math accuracy at least 85%)
   */
  speed_accuracy_emphasis?: "speed" | "accuracy" | "both" | "none";
  /**
   * Instruct participants to read each problem aloud (blocks articulatory rehearsal; it cannot be verified online). Adds an instruction sentence only.
   * (default: false — S006; used in S034, S036)
   */
  processing_read_aloud?: boolean;

  // -- phase overrides and text --
  /**
   * Overrides for the practice phase. Honoured: trial_feedback, feedback_duration_ms, response_window_ms, stimulus_duration_ms,
   * inter_item_interval_ms, set_sizes. Other keys are ignored in practice. Practice `set_sizes` are never taken from the top level.
   * (default: { set_sizes: [2] } — S006 combined practice is three trials of set size 2)
   */
  practice?: Partial<OperationSpanOptions>;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

/** Options that can differ between practice and test (the keys `practice` honours). */
export const PHASE_OPTIONS = [
  "trial_feedback",
  "feedback_duration_ms",
  "response_window_ms",
  "stimulus_duration_ms",
  "inter_item_interval_ms",
  "set_sizes",
] as const;

/** Test-design options whose top-level value is never used in practice. */
const TEST_ONLY = ["set_sizes"];

export type PhaseOptionKey = (typeof PHASE_OPTIONS)[number];

export type ResolvedOptions = Required<
  Omit<OperationSpanOptions, "practice" | "text" | "response_device" | "stimulus_set">
> & {
  /** The memoranda as a set (a bare array is normalised to `{ items }`). */
  stimulus_set: {
    memorandum: StimulusSet;
    memorandum_source: NonNullable<StimulusSetOption["memorandum_source"]>;
  };
  /** Both devices, resolved. */
  response_device: { processing: ResponseDeviceName; recall: ResponseDeviceName };
};

export const DEFAULT_OPTIONS: ResolvedOptions & { practice: Partial<OperationSpanOptions> } = {
  feedback_duration_ms: 2000,
  inter_item_interval_ms: 0,
  response_window_ms: deadlines.meanPlusSd(2.5),
  stimulus_duration_ms: 800,
  stimulus_language: null,
  stimulus_set: { memorandum: letters, memorandum_source: "separate_item" },
  processing_display_format: "problem_then_answer_screens",
  block_order: "random",
  n_test_trials: 15,
  set_sizes: [3, 4, 5, 6, 7],
  trials_per_condition: 3,
  memorandum_order_in_pair: "processing_first",
  processing_items_per_memorandum: 1,
  task_variant: "operation_span",
  response_device: { processing: "mouse", recall: "mouse" },
  response_format: "n_afc",
  response_order: "serial",
  response_keys: ["f", "j"],
  recall_omission_handling: "blank_button",
  practice_criterion: null,
  practice_structure: "storage_processing_combined",
  practice_trials: 15,
  practice_storage_trials: 4,
  practice_combined_trials: 3,
  end_of_task_feedback: "none",
  trial_feedback: "accuracy",
  instruction_format: "text",
  instruction_demonstration: "interactive",
  speed_accuracy_emphasis: "accuracy",
  processing_read_aloud: false,
  practice: { set_sizes: [2] },
};

// -- resolution ---------------------------------------------------------------------------------

const NOT_IMPLEMENTED: Array<[keyof ResolvedOptions, string[], string]> = [
  [
    "task_variant",
    ["reading_span", "symmetry_span", "rotation_span"],
    "only the arithmetic operation span is implemented; the other processing tasks need their own stimulus generators",
  ],
  [
    "processing_display_format",
    ["equation_and_memorandum_same_screen"],
    "use problem_then_answer_screens or equation_with_answer_single_screen",
  ],
  [
    "block_order",
    ["counterbalanced", "alternating"],
    "use random, random_within_block, fixed, ascending or descending",
  ],
  [
    "response_format",
    ["rating", "location", "none"],
    "recall is n_afc, free_text or single_response",
  ],
  ["response_order", ["task1_first"], "recall is serial or free"],
  [
    "trial_feedback",
    ["rt", "accuracy_rt", "points", "reward_outcome"],
    "use accuracy, correct_answer or none",
  ],
  ["end_of_task_feedback", ["normative"], "no norms are bundled; use score or summary"],
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
];

const DEVICES_IMPLEMENTED = ["keyboard", "mouse", "touch"];

function normaliseDevice(
  d: OperationSpanOptions["response_device"] | undefined,
  base: ResolvedOptions["response_device"]
) {
  if (d === undefined) return base;
  if (typeof d === "string") return { processing: d, recall: d };
  return { processing: d.processing ?? base.processing, recall: d.recall ?? base.recall };
}

const isNested = (s: number[] | number[][]): s is number[][] => Array.isArray(s[0]);

/** Set-size lists, one per block of a per-block `set_sizes`; one list for a flat `set_sizes`. */
export function setSizeLists(s: number[] | number[][]): number[][] {
  return isNested(s) ? s : [s];
}

/** The number of set-size cells (set size x block). */
function cellCount(s: number[] | number[][]): number {
  return setSizeLists(s).reduce((a, l) => a + l.length, 0);
}

/**
 * Resolve user options into complete options for one phase. In the test phase `n_test_trials`,
 * `set_sizes` and `trials_per_condition` are reconciled (n_test_trials = cells x trials_per_condition):
 * the ones the user gave set the others; when all three are given they must agree. A user value in
 * `practice` wins over a user value at the top level, which wins over the package practice default;
 * `set_sizes` is test-only at the top level.
 */
export function resolveOptions(
  user: OperationSpanOptions = {},
  phase: "practice" | "test" = "test"
): ResolvedOptions {
  const { practice, text: _text, ...top } = user;
  const topKeys = new Set(Object.keys(top).filter((k) => (top as any)[k] !== undefined));
  let layer: Partial<OperationSpanOptions> = { ...top };

  if (phase === "practice") {
    for (const k of TEST_ONLY) delete (layer as any)[k];
    const practiceKeys = new Set(Object.keys(practice ?? {}));
    const defaultPractice: Partial<OperationSpanOptions> = {};
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
  merged.stimulus_set.memorandum =
    asStimulusSet(merged.stimulus_set.memorandum) ?? merged.stimulus_set.memorandum;
  merged.response_device = normaliseDevice(layer.response_device, DEFAULT_OPTIONS.response_device);

  if (phase === "test") {
    const cells = cellCount(merged.set_sizes);
    const nGiven = layer.n_test_trials !== undefined;
    const rGiven = layer.trials_per_condition !== undefined;
    if (cells > 0) {
      if (nGiven && rGiven) {
        if (layer.n_test_trials !== cells * layer.trials_per_condition!) {
          throw new Error(
            `operation-span: n_test_trials (${layer.n_test_trials}) and trials_per_condition (${
              layer.trials_per_condition
            }) disagree: ${cells} set size${cells === 1 ? "" : "s"} x ${
              layer.trials_per_condition
            } is ${cells * layer.trials_per_condition!}. Give one of them.`
          );
        }
      } else if (nGiven) {
        if (layer.n_test_trials! % cells !== 0) {
          throw new Error(
            `operation-span: n_test_trials (${
              layer.n_test_trials
            }) is not a multiple of the number of set sizes (${cells}, set_sizes ${JSON.stringify(
              merged.set_sizes
            )}); give set_sizes or trials_per_condition too.`
          );
        }
        merged.trials_per_condition = layer.n_test_trials! / cells;
      } else {
        merged.n_test_trials = cells * merged.trials_per_condition;
      }
    }
  }
  return merged as ResolvedOptions;
}

/** Throw on values the package cannot honour or combinations that contradict each other. */
export function validateOptions(o: ResolvedOptions, phase: "practice" | "test" = "test"): void {
  for (const [key, values, why] of NOT_IMPLEMENTED) {
    if (values.includes(o[key] as string)) {
      throw new Error(`operation-span: ${key}: "${o[key]}" is not implemented (${why}).`);
    }
  }
  if (o.stimulus_language !== null) {
    throw new Error(
      `operation-span: stimulus_language: "${o.stimulus_language}" is not implemented (no word lists are bundled; give your own words as a set in stimulus_set.memorandum).`
    );
  }
  if (!asStimulusSet(o.stimulus_set.memorandum)) {
    throw new Error(
      "operation-span: stimulus_set.memorandum must be a set ({ name?, noun?, items }) or an array of items, e.g. utils.stimuli.letters."
    );
  }
  const setIssues = setProblems(o.stimulus_set.memorandum);
  if (setIssues.length) {
    throw new Error(`operation-span: stimulus_set.memorandum: ${setIssues.join("; ")}.`);
  }
  if (o.stimulus_set.memorandum_source === "sentence_final_word") {
    throw new Error(
      'operation-span: stimulus_set.memorandum_source: "sentence_final_word" is not implemented (reading span needs a sentence processing task).'
    );
  }
  for (const [role, d] of Object.entries(o.response_device)) {
    if (!DEVICES_IMPLEMENTED.includes(d)) {
      throw new Error(
        `operation-span: response_device.${role}: "${d}" is not implemented (keyboard, mouse and touch only).`
      );
    }
  }
  const { recall } = o.response_device;
  if (o.response_format === "n_afc" && recall === "keyboard") {
    throw new Error(
      'operation-span: response_format "n_afc" is a click matrix and needs response_device recall "mouse" or "touch"; use "free_text" or "single_response" with the keyboard.'
    );
  }
  if (
    (o.response_format === "free_text" || o.response_format === "single_response") &&
    recall !== "keyboard"
  ) {
    throw new Error(
      `operation-span: response_format "${o.response_format}" is typed and needs response_device recall "keyboard" (got "${recall}").`
    );
  }
  if (o.recall_omission_handling === "question_mark_key" && recall !== "keyboard") {
    throw new Error(
      'operation-span: recall_omission_handling "question_mark_key" needs response_device recall "keyboard".'
    );
  }
  if (
    o.response_format === "single_response" &&
    buildPool(o.stimulus_set.memorandum).some((it) => it.text.trim().length !== 1)
  ) {
    throw new Error(
      'operation-span: response_format "single_response" is one key per item and needs single-character memoranda.'
    );
  }
  if (!Array.isArray(o.response_keys) || o.response_keys.length !== 2) {
    throw new Error(
      "operation-span: response_keys must list exactly two keys (first = true, second = false)."
    );
  }
  if (
    typeof o.stimulus_duration_ms === "number"
      ? !(o.stimulus_duration_ms > 0)
      : o.stimulus_duration_ms === null
  ) {
    throw new Error(
      "operation-span: stimulus_duration_ms must be a duration: each memorandum is shown for that long."
    );
  }
  const lists = setSizeLists(o.set_sizes);
  if (
    !lists.length ||
    lists.some(
      (l) => !Array.isArray(l) || l.length === 0 || l.some((n) => !Number.isInteger(n) || n < 1)
    )
  ) {
    throw new Error(
      "operation-span: set_sizes must be a list of positive integers, or a list of such lists (one per block)."
    );
  }
  const biggest = Math.max(...lists.flat());
  const pool = o.stimulus_set.memorandum.items.length;
  if (biggest > pool) {
    throw new Error(
      `operation-span: set size ${biggest} needs ${biggest} different memoranda but the pool has ${pool}.`
    );
  }
  const walkthrough = o.instruction_format === "text" && o.instruction_demonstration !== "none";
  if (walkthrough && pool < INSTRUCTION_RECALL_SET_SIZE) {
    throw new Error(
      `operation-span: the walkthrough's recall step needs ${INSTRUCTION_RECALL_SET_SIZE} different memoranda but the pool has ${pool}.`
    );
  }
  if (isNested(o.set_sizes) && o.block_order === "random_within_block") {
    throw new Error(
      'operation-span: block_order "random_within_block" with per-block set_sizes is contradictory: the blocks are the lists. Use "random", "fixed", "ascending" or "descending", or a flat set_sizes.'
    );
  }
  if (phase === "test" && !(o.trials_per_condition >= 1)) {
    throw new Error("operation-span: trials_per_condition must be at least 1.");
  }
  if (
    !(o.processing_items_per_memorandum >= 0) ||
    !Number.isInteger(o.processing_items_per_memorandum)
  ) {
    throw new Error(
      "operation-span: processing_items_per_memorandum must be a non-negative integer."
    );
  }
  const pc = o.practice_criterion;
  if (pc !== null && pc !== undefined && !(pc.accuracy > 0 && pc.accuracy <= 1)) {
    throw new Error("operation-span: practice_criterion.accuracy must be a proportion in (0, 1].");
  }
  if (typeof o.response_window_ms === "object" && o.response_window_ms !== null) {
    const w: any = o.response_window_ms;
    if (typeof w !== "function" && !(w.min > 0 && w.max >= w.min)) {
      throw new Error("operation-span: response_window_ms: { min, max } needs 0 < min <= max.");
    }
  }
  if (o.processing_items_per_memorandum === 0 && o.practice_criterion) {
    throw new Error(
      "operation-span: practice_criterion needs processing (processing_items_per_memorandum is 0)."
    );
  }
}

export { FALLBACK_DEADLINE_MS };
