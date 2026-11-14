/**
 * The data contract: what a package tells the shared checks about its data.
 *
 * Shared checks are written once against vocabulary option names and the standard data tagging
 * (PACKAGE-STANDARD 4: `task`, `phase`, `part: "response"` on the scorable trial, `part` names from
 * the recommended vocabulary). Everything else a check reads (the block number, the trial type, the
 * correctness flag, the recorded duration) is named here, once, by the package's adapter. Each
 * check lists the contract entries it relies on in `requires`, and the runner reports an adapter
 * that lacks one instead of failing in the middle of an assertion.
 */
import type { Row } from "./types";

export interface PartNames {
  /** the scorable trial */
  response: string;
  fixation: string;
  iti: string;
  feedback: string;
  cue: string;
  rest: string;
}

export interface FieldNames {
  /** 1-based block number on response rows */
  block: string;
  correct: string;
  response: string;
  correct_response: string;
  rt: string;
  /** boolean: the participant missed the response window; `null` if the package has no field */
  timeout: string | null;
  /** recorded `response_window_ms` on response rows (number, `null` = none) */
  response_window: string | null;
  /** recorded `stimulus_duration_ms` on response rows */
  stimulus_duration: string | null;
  /** names the device on response rows (`keyboard`, `touch`, ...) */
  response_device: string | null;
  /** names the feedback content on feedback rows (`accuracy`, `accuracy_rt`, ...) */
  feedback_kind: string | null;
}

export interface DataContract<E = any> {
  /** `TASK_NAME`: every row the package writes has `task` equal to it */
  task: string;
  parts: PartNames;
  fields: FieldNames;
  /**
   * The trial type of a response row, as keyed in `condition_proportions` and `condition_set`
   * (after `normaliseCondition`). `null` when the row has none.
   */
  condition: (row: Row) => string | null;
  /** Fold fine trial types into the coarse ones the options use (e.g. `neutral_dash` into `neutral`). */
  normaliseCondition: (condition: string) => string;
  /**
   * The keys of `eff.condition_proportions` that name trial types (and not other factors such as
   * `cued`). Rows are counted by `normaliseCondition(condition(row))`.
   */
  proportionKeys: (eff: E) => string[];
  /** Does the row count towards this `condition_proportions` key? Default: its condition equals the key. */
  rowMatchesKey: (row: Row, key: string) => boolean;
  /** Rows with no correct response or no response window (e.g. no-go trials). */
  exempt: (row: Row) => boolean;
  /** Largest-remainder allocation of `n` trials to proportions; the package's rounding rule. */
  allocate: (weights: number[], n: number) => number[];
  /** Trials per block, from the resolved options. */
  blockSizes: (eff: E) => number[];
  /**
   * Durations: the data fields (all of them) that record the sampled value of a `_ms` option on
   * the part's rows. Default: `["duration_ms"]`.
   */
  durationFields: (option: string) => string[];
  /** device -> plugin name written by jsPsych as `trial_type` */
  plugins: Record<string, string>;
  /**
   * Checks for the keys of `sequence_constraints` beyond `max_run` and `no_immediate_repeat`.
   * Each receives the response rows of one block, in order, and the constraint's value.
   */
  sequenceConstraints: Record<
    string,
    (blockRows: Row[], value: any, contract: DataContract<E>) => void
  >;
}

/** Largest-remainder allocation; ties go to the earlier entry. */
export function allocateLargestRemainder(weights: number[], n: number): number[] {
  const total = weights.reduce((a, b) => a + b, 0);
  if (!(total > 0)) throw new Error("condition proportions must sum to more than 0");
  const exact = weights.map((w) => (w / total) * n);
  const counts = exact.map(Math.floor);
  let left = n - counts.reduce((a, b) => a + b, 0);
  const order = exact
    .map((e, i) => ({ i, r: e - Math.floor(e) }))
    .sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) counts[order[k].i]++;
  return counts;
}

/** `total` trials in `parts` blocks, the remainder going to the first blocks. */
export function splitEvenly(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const extra = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
}

/**
 * Default block sizes: `trials_per_block` x `n_blocks` if the package has `trials_per_block`
 * and no `n_test_trials`; otherwise `n_test_trials` split evenly over `n_blocks`.
 */
export function defaultBlockSizes(eff: any): number[] {
  const blocks = eff.n_blocks ?? 1;
  if (eff.n_test_trials == null && eff.trials_per_block != null) {
    return Array.from({ length: blocks }, () => eff.trials_per_block);
  }
  return splitEvenly(eff.n_test_trials, blocks);
}

export const STANDARD_PARTS: PartNames = {
  response: "response",
  fixation: "fixation",
  iti: "iti",
  feedback: "feedback",
  cue: "cue",
  rest: "rest",
};

export const STANDARD_FIELDS: FieldNames = {
  block: "block",
  correct: "correct",
  response: "response",
  correct_response: "correct_response",
  rt: "rt",
  timeout: "timeout",
  response_window: "response_window",
  stimulus_duration: "stimulus_duration",
  response_device: "response_device",
  feedback_kind: "feedback_kind",
};

/** What a package gives `defineContract`: the task name and whatever differs from the defaults. */
export type ContractInput<E = any> = { task: string } & {
  parts?: Partial<PartNames>;
  fields?: Partial<FieldNames>;
} & Partial<Omit<DataContract<E>, "task" | "parts" | "fields">>;

export function defineContract<E = any>(input: ContractInput<E>): DataContract<E> {
  const condition = input.condition ?? ((row: Row) => row.condition ?? null);
  const normaliseCondition = input.normaliseCondition ?? ((c: string) => c);
  return {
    task: input.task,
    parts: { ...STANDARD_PARTS, ...(input.parts ?? {}) },
    fields: { ...STANDARD_FIELDS, ...(input.fields ?? {}) },
    condition,
    normaliseCondition,
    proportionKeys:
      input.proportionKeys ?? ((eff: any) => Object.keys(eff.condition_proportions ?? {})),
    rowMatchesKey:
      input.rowMatchesKey ??
      ((row: Row, key: string) => {
        const c = condition(row);
        return c !== null && normaliseCondition(c) === key;
      }),
    exempt: input.exempt ?? (() => false),
    allocate: input.allocate ?? allocateLargestRemainder,
    blockSizes: input.blockSizes ?? defaultBlockSizes,
    durationFields: input.durationFields ?? (() => ["duration_ms"]),
    plugins: {
      keyboard: "html-keyboard-response",
      mouse: "html-button-response",
      touch: "html-button-response",
      ...(input.plugins ?? {}),
    },
    sequenceConstraints: input.sequenceConstraints ?? {},
  };
}
