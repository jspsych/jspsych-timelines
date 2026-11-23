import {
  SequenceError,
  allocate,
  balancedTransitions,
  maxGap,
  maxRun,
  minGap,
  noRepeat,
  runLength,
  sequenceBlocks,
  startWith,
} from "@jspsych/sequencer";
import type { SequenceConstraint } from "@jspsych/sequencer";
import type { JsPsych } from "jspsych";

import { BASELINE_TRIALS, FIXED_SEQUENCE_SEED } from "./constants";
import { SEQUENCE_KEYS } from "./options";
import type {
  DurationOrJitter,
  GoNogoCondition,
  ResolvedItem,
  ResolvedOptions,
  SequenceConstraints,
} from "./options";
import { locationsOf, stimulusId } from "./stimuli";
import type { Location } from "./stimuli";

/** Everything needed to render and score one trial. */
export interface TrialSpec {
  /** "go", "nogo", or "go_control" in a go-only baseline block. */
  condition: GoNogoCondition | "go_control";
  item: ResolvedItem;
  /** Identifier of the stimulus in the data. */
  stimulus: string;
  stimulus_location: Location;
}

/** Fields of a trial that `sequence_constraints.no_immediate_repeat` can name. */
export const TRIAL_FIELDS = ["condition", "stimulus", "stimulus_location"];

/** A random source for @jspsych/sequencer drawn through jsPsych.randomization (PACKAGE-STANDARD §3). */
export const sequencerRng = (jsPsych: JsPsych) => () =>
  jsPsych.randomization.randomInt(0, 2 ** 30 - 1) / 2 ** 30;

/** Deterministic generator (mulberry32) for `fixed_sequence` orders: the same sequence for every participant. */
export function fixedRng(seed: number = FIXED_SEQUENCE_SEED): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function expandDuration(d: DurationOrJitter): number[] {
  if (typeof d === "number") return [d];
  const step = d.step && d.step > 0 ? d.step : 1;
  const out: number[] = [];
  for (let v = d.min; v <= d.max + 1e-9; v += step) out.push(v);
  return out;
}

const CONDITIONS: GoNogoCondition[] = ["go", "nogo"];

// -- sequence_constraints -> @jspsych/sequencer ---------------------------------------------------

function recordOf<T>(
  rule: string,
  v: unknown,
  check: (x: unknown) => boolean,
  what: string
): Record<string, T> {
  if (v === null || typeof v !== "object" || Array.isArray(v)) {
    throw new Error(
      `go-nogo: sequence_constraints.${rule} must be a map from trial type to ${what}.`
    );
  }
  for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
    if (!CONDITIONS.includes(k as GoNogoCondition)) {
      throw new Error(
        `go-nogo: sequence_constraints.${rule}: unknown trial type "${k}" (use go or nogo).`
      );
    }
    if (!check(x)) throw new Error(`go-nogo: sequence_constraints.${rule}.${k} must be ${what}.`);
  }
  return v as Record<string, T>;
}

const isCount = (x: unknown) => typeof x === "number" && Number.isInteger(x) && x >= 0;

/**
 * Map the typed `sequence_constraints` (PACKAGE-STANDARD §2a) onto sequencer rules over the trial type. Unknown
 * keys and malformed values throw. `start_with` is returned separately: it applies to the first trials of each
 * block, so the caller decides which chunks get it.
 */
export function toConstraints(sc: SequenceConstraints | null | undefined): {
  rules: SequenceConstraint<TrialSpec>[];
  start: SequenceConstraint<TrialSpec> | null;
  cycle_length: number | null;
} {
  const rules: SequenceConstraint<TrialSpec>[] = [];
  let start: SequenceConstraint<TrialSpec> | null = null;
  let cycle: number | null = null;
  if (!sc) return { rules, start, cycle_length: cycle };
  const unknown = Object.keys(sc).filter((k) => !(SEQUENCE_KEYS as readonly string[]).includes(k));
  if (unknown.length) {
    throw new Error(
      `go-nogo: sequence_constraints: unknown rule ${unknown.join(
        ", "
      )} (rules: ${SEQUENCE_KEYS.join(", ")}).`
    );
  }
  const key = "condition";
  if (sc.max_run !== undefined) {
    if (typeof sc.max_run === "number") {
      if (!(sc.max_run >= 1))
        throw new Error("go-nogo: sequence_constraints.max_run must be at least 1.");
      rules.push(maxRun({ key, max: sc.max_run }));
    } else {
      const m = recordOf<number>(
        "max_run",
        sc.max_run,
        (x) => typeof x === "number" && x >= 1,
        "a number of at least 1"
      );
      for (const [c, n] of Object.entries(m)) rules.push(maxRun({ key, values: [c], max: n }));
    }
  }
  if (sc.min_gap !== undefined) {
    const m = recordOf<number>("min_gap", sc.min_gap, isCount, "a whole number");
    for (const [c, n] of Object.entries(m)) rules.push(minGap({ key, values: [c], gap: n }));
  }
  if (sc.max_gap !== undefined) {
    const m = recordOf<number>("max_gap", sc.max_gap, isCount, "a whole number");
    for (const [c, n] of Object.entries(m)) rules.push(maxGap({ key, values: [c], gap: n }));
  }
  if (sc.run_length !== undefined) {
    const m = recordOf<number[]>(
      "run_length",
      sc.run_length,
      (x) => Array.isArray(x) && x.length > 0 && x.every((n) => Number.isInteger(n) && n >= 1),
      "a list of run lengths"
    );
    for (const [c, a] of Object.entries(m)) rules.push(runLength({ key, values: [c], allowed: a }));
  }
  if (sc.start_with !== undefined) {
    const m = recordOf<number>(
      "start_with",
      sc.start_with,
      (x) => isCount(x) && (x as number) >= 1,
      "a whole number"
    );
    const entries = Object.entries(m);
    if (entries.length !== 1) {
      throw new Error("go-nogo: sequence_constraints.start_with names one trial type.");
    }
    start = startWith({ key, values: [entries[0][0]], count: entries[0][1] });
  }
  if (sc.no_immediate_repeat !== undefined) {
    const v = sc.no_immediate_repeat as unknown;
    if (v === true) rules.push(noRepeat({ key }));
    else if (Array.isArray(v)) {
      for (const f of v) {
        if (!TRIAL_FIELDS.includes(f)) {
          throw new Error(
            `go-nogo: sequence_constraints.no_immediate_repeat: unknown trial field "${f}" (fields: ${TRIAL_FIELDS.join(
              ", "
            )}).`
          );
        }
        rules.push(noRepeat({ key: f }));
      }
    } else if (v !== false) {
      throw new Error(
        "go-nogo: sequence_constraints.no_immediate_repeat must be true or a list of trial fields."
      );
    }
  }
  if (sc.balanced_transitions !== undefined && (sc.balanced_transitions as unknown) !== false) {
    rules.push(balancedTransitions({ key }));
  }
  if (sc.cycle_length !== undefined) {
    if (!(Number.isInteger(sc.cycle_length) && sc.cycle_length >= 2)) {
      throw new Error(
        "go-nogo: sequence_constraints.cycle_length must be a whole number of at least 2."
      );
    }
    cycle = sc.cycle_length;
  }
  return { rules, start, cycle_length: cycle };
}

// -- trial specs --------------------------------------------------------------------------------

interface Ctx {
  jsPsych: JsPsych;
  o: ResolvedOptions;
  /** the stimulus sets after role assignment (defaults to `o.stimulus_set`) */
  stimulus_set?: { go: ResolvedItem[]; nogo: ResolvedItem[] };
}

/** Cycles through a (shuffled) list of items, reshuffling at each pass, so uses are balanced. */
class Deck<T> {
  private i = 0;
  private list: T[];
  constructor(private base: T[], private shuffle: (x: T[]) => T[]) {
    this.list = shuffle([...base]);
  }
  next(): T {
    if (this.i >= this.list.length) {
      this.list = this.shuffle([...this.base]);
      this.i = 0;
    }
    return this.list[this.i++];
  }
}

function combosOf(
  cond: TrialSpec["condition"],
  items: ResolvedItem[],
  locations: Location[]
): TrialSpec[] {
  const out: TrialSpec[] = [];
  for (const item of items)
    for (const loc of locations)
      out.push({ condition: cond, item, stimulus: stimulusId(item), stimulus_location: loc });
  return out;
}

/** Trial type of each of `n` trials in a deterministic, evenly spread order (`fixed_sequence`). */
function spread(counts: number[], n: number): number[] {
  const placed = counts.map(() => 0);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    let best = -1;
    let bestScore = -Infinity;
    counts.forEach((c, k) => {
      if (placed[k] >= c) return;
      const score = ((i + 0.5) * c) / n - placed[k];
      if (score > bestScore + 1e-12) {
        best = k;
        bestScore = score;
      }
    });
    placed[best]++;
    out.push(best);
  }
  return out;
}

/**
 * Build the trials of consecutive blocks. Counts per trial type are exact per block (largest remainder)
 * except for `trial_order: "random"`, which draws each trial independently. The stimulus and its location
 * are balanced within the block. With `sequence_constraints`, `@jspsych/sequencer` orders the trials; the
 * neighbour rules look across block boundaries. An order the rules cannot satisfy throws the sequencer's
 * error, which names the rule.
 */
export function buildBlocks(
  ctx: Ctx,
  sizes: number[],
  constraints: SequenceConstraints | null
): TrialSpec[][] {
  const { jsPsych, o } = ctx;
  const R = jsPsych.randomization;
  const set = ctx.stimulus_set ?? o.stimulus_set;
  const locations = locationsOf(o.stimulus_layout);
  const order = o.trial_order;
  const present = CONDITIONS.filter((c) => o.condition_proportions[c] > 0);
  const weights = present.map((c) => o.condition_proportions[c]);
  const { rules, start, cycle_length } = toConstraints(constraints);
  const constrained = rules.length > 0 || start !== null || cycle_length !== null;
  if (cycle_length !== null && order === "random") {
    throw new Error(
      'go-nogo: sequence_constraints.cycle_length needs exact proportions, but trial_order is "random" (independent draws).'
    );
  }
  const shuffle = <T>(x: T[]) => (order === "fixed_sequence" ? x : R.shuffle(x));
  const pools = new Map(
    present.map((c) => [c, combosOf(c, set[c], locations)] as [GoNogoCondition, TrialSpec[]])
  );
  const poolFor = (c: GoNogoCondition) => pools.get(c)!;

  // one source per chunk (a block, or `cycle_length` trials of a block)
  interface Chunk {
    block: number;
    first: boolean;
    source: TrialSpec[] | { n: number; draw(): TrialSpec };
  }
  const chunks: Chunk[] = [];
  sizes.forEach((n, b) => {
    const decks = new Map(present.map((c) => [c, new Deck(poolFor(c), shuffle)] as const));
    const parts = cycle_length ? chunkSizes(n, cycle_length) : [n];
    parts.forEach((m, k) => {
      if (order === "random") {
        // independent draws over (trial type x stimulus x location), weighted by the type's proportion
        const pool: TrialSpec[] = [];
        const w: number[] = [];
        present.forEach((c, i) => {
          const list = poolFor(c);
          list.forEach((t) => {
            pool.push(t);
            w.push(weights[i] / list.length);
          });
        });
        // drawn through jsPsych.randomization (@jspsych/sequencer's `sampler` also takes `rng` while `sequence()` runs, but
        // an unconstrained block is not drawn inside `sequence()`)
        const source = {
          n: m,
          draw: () => R.sampleWithReplacement(pool, 1, w)[0],
        };
        chunks.push({ block: b, first: k === 0, source });
        return;
      }
      const counts = allocate(weights, m);
      const list: TrialSpec[] = [];
      if (order === "fixed_sequence" && !constrained) {
        for (const i of spread(counts, m)) list.push(decks.get(present[i])!.next());
      } else {
        present.forEach((c, i) => {
          for (let j = 0; j < counts[i]; j++) list.push(decks.get(c)!.next());
        });
      }
      chunks.push({ block: b, first: k === 0, source: list });
    });
  });

  const rng = order === "fixed_sequence" ? fixedRng() : sequencerRng(jsPsych);
  const rulesFor = (i: number) => (start && chunks[i].first ? [...rules, start] : rules);
  let ordered: TrialSpec[][];
  if (!constrained) {
    ordered = chunks.map((c) =>
      Array.isArray(c.source)
        ? order === "fixed_sequence"
          ? c.source
          : R.shuffle(c.source)
        : sampleAll(c.source)
    );
  } else {
    try {
      ordered = sequenceBlocks(
        chunks.map((c) => c.source),
        rulesFor,
        { rng }
      );
    } catch (e) {
      if (e instanceof SequenceError) {
        throw new Error(
          `go-nogo: sequence_constraints cannot be satisfied for ${sizes.join(
            "+"
          )} trials with proportions ${JSON.stringify(o.condition_proportions)}: ${e.message}`
        );
      }
      throw e;
    }
  }
  // regroup chunks into blocks
  const blocks: TrialSpec[][] = sizes.map(() => []);
  chunks.forEach((c, i) => blocks[c.block].push(...ordered[i]));
  return blocks;
}

function sampleAll<T>(s: { n: number; draw(): T }): T[] {
  return Array.from({ length: s.n }, () => s.draw());
}

/** `n` split into chunks of `size`, the last one shorter if `n` is not a multiple. */
export function chunkSizes(n: number, size: number): number[] {
  const out: number[] = [];
  for (let left = n; left > 0; left -= size) out.push(Math.min(size, left));
  return out;
}

/** The `BASELINE_TRIALS` go trials of a go-only baseline block (`condition: "go_control"`). */
export function buildBaselineBlock(ctx: Ctx): TrialSpec[] {
  const { jsPsych, o } = ctx;
  const set = ctx.stimulus_set ?? o.stimulus_set;
  const locations = locationsOf(o.stimulus_layout);
  const deck = new Deck(combosOf("go_control", set.go, locations), (x) =>
    jsPsych.randomization.shuffle(x)
  );
  return Array.from({ length: BASELINE_TRIALS }, () => deck.next());
}

/** Split `total` into `parts` near-equal integers; the remainder goes to the first blocks. */
export function splitTrials(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const extra = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
}

/** Sampled value from a duration spec (a number, or a jitter range) through jsPsych.randomization. */
export function sampleDuration(jsPsych: JsPsych, d: DurationOrJitter): number {
  const values = expandDuration(d);
  return values.length === 1
    ? values[0]
    : jsPsych.randomization.sampleWithReplacement(values, 1)[0];
}
