/**
 * Trial lists: how many stop and go trials each block holds, in what order, with which go direction,
 * and (for fixed delays) which stop-signal delay. All draws go through `jsPsych.randomization`;
 * constrained orders use @jspsych/sequencer (PACKAGE-STANDARD §2a, §3).
 */
import {
  allocate,
  balancedTransitions,
  expand,
  maxGap,
  maxRun,
  minGap,
  noRepeat,
  runLength,
  sequence,
  sequenceBlocks,
  startWith,
} from "@jspsych/sequencer";
import type { SequenceConstraint } from "@jspsych/sequencer";
import type { JsPsych } from "jspsych";

import type {
  DurationSpec,
  ResolvedOptions,
  SequenceConstraints,
  TrialType,
  TrialTypeProportions,
} from "./options";

export type Direction = "left" | "right";

/** Everything needed to render and score one trial (the stop-signal delay of a staircase is decided at run time). */
export interface TrialSpec {
  trial_type: TrialType;
  go_direction: Direction;
  fixation_ms: number;
  iti_ms: number;
  feedback_ms: number;
  /** stop trials with fixed delays: the delay in ms; null for go trials and for the staircase */
  fixed_ssd: number | null;
}

/** A random source for @jspsych/sequencer drawn through jsPsych.randomization (PACKAGE-STANDARD §3). */
export const sequencerRng = (jsPsych: JsPsych) => () =>
  jsPsych.randomization.randomInt(0, 2 ** 30 - 1) / 2 ** 30;

/** Draw one duration: a number is itself; `{ min, max, step }` is uniform on the step grid. */
export function sampleDuration(jsPsych: JsPsych, d: DurationSpec): number {
  if (typeof d === "number") return d;
  const step = d.step && d.step > 0 ? d.step : 1;
  const k = jsPsych.randomization.randomInt(0, Math.floor((d.max - d.min) / step + 1e-9));
  return d.min + k * step;
}

/** The sequencer rules for `sequence_constraints` (without `cycle_length`, which cuts the block into chunks). */
export function constraintsFor(sc: SequenceConstraints | null): SequenceConstraint<TrialSpec>[] {
  const out: SequenceConstraint<TrialSpec>[] = [];
  if (!sc) return out;
  const key = "trial_type";
  if (sc.max_run !== undefined) {
    if (typeof sc.max_run === "number") out.push(maxRun<TrialSpec>({ key, max: sc.max_run }));
    else {
      for (const [c, max] of Object.entries(sc.max_run)) {
        out.push(maxRun<TrialSpec>({ key, values: [c], max }));
      }
    }
  }
  for (const [c, gap] of Object.entries(sc.min_gap ?? {})) {
    out.push(minGap<TrialSpec>({ key, values: [c], gap }));
  }
  for (const [c, gap] of Object.entries(sc.max_gap ?? {})) {
    out.push(maxGap<TrialSpec>({ key, values: [c], gap }));
  }
  for (const [c, allowed] of Object.entries(sc.run_length ?? {})) {
    out.push(runLength<TrialSpec>({ key, values: [c], allowed }));
  }
  for (const [c, count] of Object.entries(sc.start_with ?? {})) {
    out.push(startWith<TrialSpec>({ key, values: [c], count }));
  }
  if (sc.no_immediate_repeat === true) out.push(noRepeat<TrialSpec>({ key }));
  else if (Array.isArray(sc.no_immediate_repeat)) {
    for (const f of sc.no_immediate_repeat) {
      // a trial type ("stop") or a trial field ("go_direction")
      if (f === "go" || f === "stop") out.push(noRepeat<TrialSpec>({ key, values: [f] }));
      else out.push(noRepeat<TrialSpec>({ key: f }));
    }
  }
  if (sc.balanced_transitions) out.push(balancedTransitions<TrialSpec>({ key }));
  return out;
}

/** Exact counts of [stop, go] in `n` trials (largest remainder). */
export function allocateTypes(p: TrialTypeProportions, n: number): { stop: number; go: number } {
  const [stop, go] = allocate([p.stop ?? 0, p.go ?? 0], n);
  return { stop, go };
}

/**
 * Build the trial list of one block. `p` is the block's proportions. Counts are exact per block
 * (and per cycle when `cycle_length` is set); go direction is balanced within each trial type.
 * `after` is the previous block, so run and gap rules hold across the boundary.
 */
export function buildBlockSpecs(
  jsPsych: JsPsych,
  o: ResolvedOptions,
  n: number,
  p: TrialTypeProportions,
  after: TrialSpec[] = []
): TrialSpec[] {
  const R = jsPsych.randomization;
  const sc = o.sequence_constraints;
  const cycle = sc?.cycle_length;
  const rng = sequencerRng(jsPsych);

  const counts = allocateTypes(p, n);
  // trial types, in cycles when asked
  let types: TrialType[][];
  if (cycle !== undefined) {
    if (!(Number.isInteger(cycle) && cycle >= 1) || n % cycle !== 0) {
      throw new Error(
        `stop-signal-task: sequence_constraints.cycle_length ${cycle} does not divide the ${n} trials of a block.`
      );
    }
    const perCycle = allocate([p.stop ?? 0, p.go ?? 0], cycle);
    const exact = (p.stop ?? 0) * cycle;
    if (Math.abs(exact - Math.round(exact)) > 1e-9) {
      throw new Error(
        `stop-signal-task: sequence_constraints.cycle_length ${cycle} cannot hold the proportions { stop: ${p.stop}, go: ${p.go} } exactly (${exact} stop trials per cycle).`
      );
    }
    types = Array.from({ length: n / cycle }, () => expand<TrialType>(["stop", "go"], perCycle));
  } else {
    types = [expand<TrialType>(["stop", "go"], [counts.stop, counts.go])];
  }

  // direction balanced within each trial type; delays for fixed sets balanced over stop trials
  const flat = types.flat();
  const nStop = flat.filter((t) => t === "stop").length;
  const nGo = flat.length - nStop;
  const dirs = (k: number): Direction[] =>
    R.shuffle(expand<Direction>(["left", "right"], allocate([1, 1], k)));
  // balanced within each trial type; a rule on go_direction needs one balanced list over all trials
  const overall =
    Array.isArray(sc?.no_immediate_repeat) && sc!.no_immediate_repeat.includes("go_direction");
  const allDirs = overall ? dirs(flat.length) : [];
  const stopDirs = overall ? allDirs.slice(0, nStop) : dirs(nStop);
  const goDirs = overall ? allDirs.slice(nStop) : dirs(nGo);
  const dl = o.difficulty_levels;
  let stopSsds: Array<number | null>;
  if (dl === null) stopSsds = new Array(nStop).fill(null);
  else if (Array.isArray(dl)) {
    const each = allocate(
      dl.map(() => 1),
      nStop
    );
    stopSsds = R.shuffle(expand<number>(dl, each));
  } else {
    stopSsds = Array.from({ length: nStop }, () => sampleDuration(jsPsych, dl));
  }
  let si = 0;
  let gi = 0;
  const make = (t: TrialType): TrialSpec => ({
    trial_type: t,
    go_direction: t === "stop" ? stopDirs[si] : goDirs[gi],
    fixation_ms: sampleDuration(jsPsych, o.fixation_duration_ms),
    iti_ms: sampleDuration(jsPsych, o.iti_ms),
    feedback_ms: sampleDuration(jsPsych, o.feedback_duration_ms),
    fixed_ssd: t === "stop" ? stopSsds[si++] : (gi++, null),
  });
  const chunks: TrialSpec[][] = types.map((c) => c.map(make));

  const rules = constraintsFor(sc);
  const opts = { rng, after };
  if (cycle !== undefined) {
    // one chunk per cycle; each chunk is shuffled under the rules, earlier chunks count as `after`
    return sequenceBlocks(chunks, rules, opts).flat();
  }
  if (rules.length === 0) return R.shuffle(chunks[0]);
  return sequence(chunks[0], rules, opts);
}
