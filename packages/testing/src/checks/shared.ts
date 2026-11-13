import type { DataContract } from "../contract";
import { rowsOf, trialsOf } from "../harness";
import type { Run } from "../harness";
/**
 * Shared checks for vocabulary options whose effect is observable in the standard data fields.
 *
 * Each check is keyed by the vocabulary option name, declares the contract entries it needs in
 * `requires`, and is written against `r.eff` (the package's resolved options) and the rows. A
 * package's adapter supplies the `DataContract`; task-specific options get task-specific checks.
 */
import { byBlock, distinct, filterRows } from "../rows";
import type { DurationSpec, Row } from "../types";
import type { Check, CheckContext, CheckSet } from "./types";

const phaseRows = (r: Run, c: DataContract, phase: "test" | "practice") =>
  rowsOf(r, phase, c.parts.response);
const testRows = (r: Run, c: DataContract) => phaseRows(r, c, "test");

const isSpec = (v: unknown): v is { min: number; max: number; step?: number } =>
  typeof v === "object" && v !== null && "min" in v;

function levelsOf(v: { min: number; max: number; step?: number }): number {
  const step = v.step && v.step > 0 ? v.step : 1;
  return Math.floor((v.max - v.min) / step + 1e-9) + 1;
}

/** Every value is in [min, max] and on the `min + k * step` grid. */
function expectOnGrid(values: number[], v: { min: number; max: number; step?: number }) {
  const step = v.step && v.step > 0 ? v.step : 1;
  for (const x of values) {
    expect(x).toBeGreaterThanOrEqual(v.min);
    expect(x).toBeLessThanOrEqual(v.max);
    expect(Math.abs(Math.round((x - v.min) / step) * step - (x - v.min))).toBeLessThan(1e-9);
  }
}

// -- durations -----------------------------------------------------------------------------------

export interface DurationCheckSpec {
  /** vocabulary option name, e.g. `fixation_duration_ms` */
  option: string;
  /** the part whose rows record the duration (a key of `contract.parts`, or a literal part name) */
  part: string;
  /**
   * `per_response`: one such row for every response row (fixation, iti);
   * `some`: at least one, because the screen only appears for some trials (feedback).
   */
  count: "per_response" | "some";
  /** The screen only exists when this holds; otherwise no rows are expected. Default: always. */
  activeWhen?: (eff: any) => boolean;
}

/**
 * Check of a `duration` option (PACKAGE-STANDARD 2a), written once for every such option:
 * - `0` (or an inactive screen): no such rows
 * - a number: every row records it, in every field of `contract.durationFields(option)`, and the
 *   built trials' `trial_duration` equals it
 * - `{min, max, step?}`: every recorded value lies in the range on the step grid, more than one
 *   value occurs, the fields agree, and the same seed gives the same values
 */
export function durationCheck(spec: DurationCheckSpec): Check {
  return {
    kind: "recorded-parameter",
    requires: ["parts.response"],
    fn: async (r, { contract: c, harness }) => {
      const part = (c.parts as unknown as Record<string, string>)[spec.part] ?? spec.part;
      const v = r.eff[spec.option] as DurationSpec | null | undefined;
      const rows = rowsOf(r, "test", part);
      const resp = testRows(r, c);
      const active = spec.activeWhen ? spec.activeWhen(r.eff) : true;
      if (!active || v === 0 || v === null || v === undefined) {
        expect(rows).toHaveLength(0);
        return;
      }
      if (spec.count === "per_response") expect(rows).toHaveLength(resp.length);
      else expect(rows.length).toBeGreaterThan(0);
      const fields = c.durationFields(spec.option);
      const builtDurations = trialsOf(r, part)
        .filter((t) => t.data?.phase === "test")
        .map((t) => t.trial_duration)
        .filter((d) => typeof d === "number") as number[];
      if (typeof v === "number") {
        for (const f of fields) rows.forEach((x) => expect(x[f]).toBe(v));
        builtDurations.forEach((d) => expect(d).toBe(v));
        return;
      }
      for (const f of fields)
        expectOnGrid(
          rows.map((x) => x[f]),
          v
        );
      expectOnGrid(builtDurations, v);
      // all fields describe the same sampled value
      rows.forEach((x) => fields.forEach((f) => expect(x[f]).toBe(x[fields[0]])));
      if (levelsOf(v) > 1 && rows.length >= 10) {
        expect(distinct(rows.map((x) => x[fields[0]])).length).toBeGreaterThan(1);
      }
      // seeded: the same seed reproduces the same durations
      const again = await harness.run(r.opts);
      expect(rowsOf(again, "test", part).map((x) => x[fields[0]])).toEqual(
        rows.map((x) => x[fields[0]])
      );
    },
  };
}

// -- counts --------------------------------------------------------------------------------------

function blockCounts(r: Run, c: DataContract, phase: "test" | "practice" = "test") {
  const out = byBlock(phaseRows(r, c, phase), c.fields.block);
  return [...out.entries()].sort((a, b) => a[0] - b[0]);
}

function expectedCountsPerBlock(r: Run, c: DataContract, block: number): Record<string, number> {
  const sizes = c.blockSizes(r.eff);
  const keys = c.proportionKeys(r.eff);
  const counts = c.allocate(
    keys.map((k) => r.eff.condition_proportions[k]),
    sizes[block - 1]
  );
  return Object.fromEntries(keys.map((k, i) => [k, counts[i]]));
}

function observedCountsPerBlock(r: Run, c: DataContract, block: number): Record<string, number> {
  const rows = testRows(r, c).filter((x) => x[c.fields.block] === block);
  return Object.fromEntries(
    c.proportionKeys(r.eff).map((k) => [k, rows.filter((x) => c.rowMatchesKey(x, k)).length])
  );
}

const blocksOf = (r: Run, c: DataContract) => c.blockSizes(r.eff).length;

const n_test_trials: Check = {
  kind: "behaviour",
  requires: ["parts.response"],
  fn: (r, { contract: c }) => expect(testRows(r, c)).toHaveLength(r.eff.n_test_trials),
};

const practice_trials: Check = {
  kind: "behaviour",
  requires: ["parts.response"],
  fn: (r, { contract: c }) =>
    expect(phaseRows(r, c, "practice")).toHaveLength(r.eff.practice_trials),
};

const n_blocks: Check = {
  kind: "behaviour",
  requires: ["parts.response", "fields.block", "blockSizes"],
  fn: (r, { contract: c }) => {
    const n = r.eff.n_blocks ?? 1;
    const sizes = c.blockSizes(r.eff);
    expect(sizes).toHaveLength(n);
    const seen = blockCounts(r, c);
    expect(seen.map(([b]) => b)).toEqual(Array.from({ length: n }, (_, i) => i + 1));
    expect(seen.map(([, rows]) => rows.length)).toEqual(sizes);
  },
};

const trials_per_block: Check = {
  kind: "behaviour",
  requires: ["parts.response", "fields.block", "blockSizes"],
  fn: (r, { contract: c }) => {
    const per = r.eff.trials_per_block;
    const seen = blockCounts(r, c);
    expect(seen.map(([, rows]) => rows.length)).toEqual(c.blockSizes(r.eff));
    // when the total divides evenly, every block has exactly `trials_per_block` trials
    const total = seen.reduce((a, [, rows]) => a + rows.length, 0);
    if (total % per === 0) seen.forEach(([, rows]) => expect(rows).toHaveLength(per));
    else seen.forEach(([, rows]) => expect(rows.length).toBeLessThanOrEqual(per));
  },
};

const condition_proportions: Check = {
  kind: "behaviour",
  requires: [
    "parts.response",
    "fields.block",
    "condition",
    "proportionKeys",
    "allocate",
    "blockSizes",
  ],
  fn: (r, { contract: c }) => {
    // with random order the draws are independent, so the proportions only hold in expectation
    if (r.eff.trial_order === "random") return;
    for (let b = 1; b <= blocksOf(r, c); b++) {
      expect(observedCountsPerBlock(r, c, b)).toEqual(expectedCountsPerBlock(r, c, b));
    }
  },
};

const condition_set: Check = {
  kind: "behaviour",
  requires: ["parts.response", "condition", "normaliseCondition"],
  fn: (r, { contract: c }) => {
    const fold = (xs: (string | null)[]) =>
      distinct(xs.filter((x): x is string => x !== null).map(c.normaliseCondition)).sort();
    expect(fold(testRows(r, c).map((x) => c.condition(x)))).toEqual(fold(r.eff.condition_set));
  },
};

// -- order ---------------------------------------------------------------------------------------

const conditionSeq = (rows: Row[], c: DataContract) => rows.map((x) => c.condition(x));

const trial_order: Check = {
  kind: "behaviour",
  requires: [
    "parts.response",
    "fields.block",
    "condition",
    "proportionKeys",
    "allocate",
    "blockSizes",
  ],
  fn: async (r, { contract: c, harness }) => {
    const order = r.eff.trial_order;
    const blocks = blocksOf(r, c);
    const exact = (b: number) =>
      JSON.stringify(observedCountsPerBlock(r, c, b)) ===
      JSON.stringify(expectedCountsPerBlock(r, c, b));
    const allExact = Array.from({ length: blocks }, (_, i) => i + 1).every(exact);
    if (order === "random") {
      // independent draws: proportions are only approximate (deterministic under the fixed seed)
      expect(testRows(r, c)).toHaveLength(r.eff.n_test_trials);
      if (c.proportionKeys(r.eff).length > 1) expect(allExact).toBe(false);
    } else if (order === "shuffled_list") {
      expect(allExact).toBe(true);
      // shuffled: the first block is not grouped by condition
      const seq = conditionSeq(
        testRows(r, c).filter((x) => x[c.fields.block] === 1),
        c
      );
      const runs = seq.filter((x, i) => i > 0 && x !== seq[i - 1]).length;
      if (seq.length >= 8) expect(runs).toBeGreaterThan(distinct(seq).length);
    } else if (order === "fixed_sequence") {
      // a fixed sequence does not depend on the seed
      const [a, b] = await harness.runSeeds(r.opts, ["fixed-a", "fixed-b"]);
      expect(conditionSeq(testRows(a, c), c)).toEqual(conditionSeq(testRows(b, c), c));
    }
  },
};

const MAX_RUN_SEEDS = ["seq-a", "seq-b", "seq-c", "seq-d", "seq-e"];

function longestRun(seq: unknown[]): number {
  let best = 0;
  let run = 0;
  seq.forEach((x, i) => {
    run = i > 0 && x === seq[i - 1] ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

const sequence_constraints: Check = {
  kind: "behaviour",
  requires: ["parts.response", "fields.block", "condition"],
  fn: async (r, { contract: c, harness }) => {
    const sc = r.eff.sequence_constraints as Record<string, any> | null;
    if (!sc) return;
    // several seeds: one lucky sequence would satisfy a constraint that is not applied
    const runs = [r, ...(await harness.runSeeds(r.opts, MAX_RUN_SEEDS))];
    for (const run of runs) {
      for (const [, rows] of byBlock(testRows(run, c), c.fields.block)) {
        const seq = conditionSeq(rows, c);
        for (const [key, value] of Object.entries(sc)) {
          if (key === "max_run") expect(longestRun(seq)).toBeLessThanOrEqual(value);
          else if (key === "no_immediate_repeat") {
            if (value) expect(longestRun(seq)).toBeLessThanOrEqual(1);
          } else if (c.sequenceConstraints[key]) c.sequenceConstraints[key](rows, value, c);
          else
            throw new Error(
              `no data-level check for sequence_constraints.${key}: add a handler to the contract`
            );
        }
      }
    }
  },
};

// -- response ------------------------------------------------------------------------------------

const response_window_ms: Check = {
  kind: "behaviour",
  requires: ["parts.response", "fields.timeout", "exempt"],
  optional: ["fields.response_window"],
  fn: async (r, { contract: c, harness }) => {
    const v = r.eff.response_window_ms as DurationSpec | null;
    const rows = testRows(r, c);
    const f = c.fields;
    if (f.response_window) {
      if (isSpec(v))
        expectOnGrid(
          rows.map((x) => x[f.response_window!]),
          v
        );
      else rows.forEach((x) => expect(x[f.response_window!]).toBe(v));
    }
    const built = trialsOf(r, c.parts.response).filter((t) => t.data?.phase === "test");
    built.forEach((t) => {
      if (typeof t.trial_duration === "function") return;
      if (isSpec(v)) expectOnGrid([t.trial_duration], v);
      else expect(t.trial_duration).toBe(v);
    });
    // a participant slower than the window times out; with no window nobody does
    const slow = await harness.runSlow(r.opts);
    const slowRows = testRows(slow, c).filter((x) => !c.exempt(x));
    expect(slowRows.length).toBeGreaterThan(0);
    slowRows.forEach((x) => expect(x[f.timeout!]).toBe(v !== null));
    // a fast participant does not, whatever the window (when the window is longer than the RT)
    const shortest = isSpec(v) ? v.min : v;
    if (shortest !== null && shortest > 100) {
      const fast = await harness.run(r.opts, { default: { data: { rt: 50 } } });
      testRows(fast, c)
        .filter((x) => !c.exempt(x))
        .forEach((x) => expect(x[f.timeout!]).toBe(false));
    }
  },
};

const stimulus_duration_ms: Check = {
  kind: "recorded-parameter",
  requires: ["parts.response", "fields.stimulus_duration"],
  fn: (r, { contract: c }) => {
    const v = r.eff.stimulus_duration_ms;
    testRows(r, c).forEach((x) => expect(x[c.fields.stimulus_duration!]).toBe(v));
    trialsOf(r, c.parts.response).forEach((t) => expect(t.stimulus_duration).toBe(v));
  },
};

const response_keys: Check = {
  kind: "behaviour",
  requires: ["parts.response", "fields.response", "fields.correct_response", "exempt"],
  fn: (r, { contract: c }) => {
    const keys: string[] = r.eff.response_keys;
    // other devices use buttons instead of keys
    if (r.eff.response_device && r.eff.response_device !== "keyboard") return;
    expect(trialsOf(r, c.parts.response)[0].choices).toEqual(keys);
    const lower = keys.map((k) => k.toLowerCase());
    const rows = testRows(r, c);
    const f = c.fields;
    rows
      .filter((x) => !c.exempt(x))
      .forEach((x) => expect(lower).toContain(String(x[f.correct_response]).toLowerCase()));
    lower.forEach((k) =>
      expect(rows.some((x) => String(x[f.correct_response]).toLowerCase() === k)).toBe(true)
    );
    rows
      .filter((x) => x[f.response] !== null)
      .forEach((x) => expect(lower).toContain(String(x[f.response]).toLowerCase()));
  },
};

const response_device: Check = {
  kind: "behaviour",
  requires: ["parts.response", "plugins", "fields.response"],
  optional: ["fields.response_device"],
  fn: (r, { contract: c }) => {
    const device: string = r.eff.response_device;
    const plugin = c.plugins[device];
    expect(plugin).toBeDefined();
    const f = c.fields;
    testRows(r, c).forEach((x) => {
      expect(x.trial_type).toBe(plugin);
      if (f.response_device) expect(x[f.response_device]).toBe(device);
      // keyboard plugins record the key (string), button plugins the button index (number)
      if (plugin.includes("keyboard"))
        expect(typeof x[f.response] === "string" || x[f.response] === null).toBe(true);
      if (plugin.includes("button"))
        expect(typeof x[f.response] === "number" || x[f.response] === null).toBe(true);
    });
    const choices = trialsOf(r, c.parts.response)[0].choices;
    if (plugin.includes("button") && r.eff.response_keys) {
      expect(choices).toHaveLength(r.eff.response_keys.length);
    }
  },
};

// -- feedback ------------------------------------------------------------------------------------

const trial_feedback: Check = {
  kind: "behaviour",
  requires: ["parts.response", "parts.feedback"],
  optional: ["fields.feedback_kind"],
  fn: (r, { contract: c }) => {
    const kind = c.fields.feedback_kind;
    for (const [phase, eff] of [
      ["test", r.eff],
      ["practice", r.effP],
    ] as const) {
      const fb = rowsOf(r, phase, c.parts.feedback);
      if (eff.trial_feedback === "none") expect(fb).toHaveLength(0);
      else {
        expect(fb.length).toBeGreaterThan(0);
        if (kind) fb.forEach((x) => expect(x[kind]).toBe(eff.trial_feedback));
      }
    }
  },
};

const feedback_condition: Check = {
  kind: "behaviour",
  requires: ["parts.response", "parts.feedback", "fields.correct"],
  fn: (r, { contract: c }) => {
    const fb = rowsOf(r, "test", c.parts.feedback);
    const rows = testRows(r, c);
    if (r.eff.trial_feedback === "none") return expect(fb).toHaveLength(0);
    const ok = (x: Row) => !!x[c.fields.correct];
    const n =
      r.eff.feedback_condition === "all"
        ? rows.length
        : r.eff.feedback_condition === "errors_only"
        ? rows.filter((x) => !ok(x)).length
        : rows.filter(ok).length;
    expect(fb).toHaveLength(n);
  },
};

// -- registry ------------------------------------------------------------------------------------

/** All shared checks, keyed by vocabulary option name. */
export const sharedChecks: CheckSet = {
  n_test_trials,
  practice_trials,
  n_blocks,
  trials_per_block,
  condition_proportions,
  condition_set,
  trial_order,
  sequence_constraints,
  response_window_ms,
  stimulus_duration_ms,
  fixation_duration_ms: durationCheck({
    option: "fixation_duration_ms",
    part: "fixation",
    count: "per_response",
  }),
  iti_ms: durationCheck({ option: "iti_ms", part: "iti", count: "per_response" }),
  feedback_duration_ms: durationCheck({
    option: "feedback_duration_ms",
    part: "feedback",
    count: "some",
    activeWhen: (eff) => eff.trial_feedback !== "none",
  }),
  trial_feedback,
  feedback_condition,
  response_keys,
  response_device,
};

/** Rows of one phase/part with the task filter, for packages' own checks. */
export const rowsOfTask = (r: Run, c: DataContract, phase: string, part: string) =>
  filterRows(r.rows, { task: c.task, phase, part });

export type { CheckContext };
