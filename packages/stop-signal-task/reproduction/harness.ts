/** The stop-signal harness: `@jspsych-timelines/testing`'s harness around this package's functions. */
import { createHarness } from "@jspsych-timelines/testing";
import type { Run as GenericRun } from "@jspsych-timelines/testing";

import { createTimeline } from "../src";
import {
  ResolvedOptions,
  StopSignalTaskOptions,
  TrialTypeProportions,
  resolveOptions,
} from "../src/options";

/**
 * What the shared checks and this package's checks read: the resolved options, with the three
 * options whose resolved shape differs from the vocabulary's simple form given in it.
 *  - `stimulus_duration_ms` is the go stimulus' duration (the vocabulary's number); the signal's is
 *    `stop_signal_duration_ms`
 *  - `condition_proportions` is the first block's map; `condition_proportions_by_block` is the list
 *  - `sequence_constraints` is `{}` when there are none (the shape the spec reports)
 */
export type Eff = Omit<
  ResolvedOptions,
  "stimulus_duration_ms" | "condition_proportions" | "sequence_constraints"
> & {
  stimulus_duration_ms: number | null;
  stop_signal_duration_ms: number | null;
  condition_proportions: TrialTypeProportions;
  condition_proportions_by_block: TrialTypeProportions[];
  sequence_constraints: NonNullable<ResolvedOptions["sequence_constraints"]>;
};

export function toEff(o: ResolvedOptions): Eff {
  return {
    ...o,
    stimulus_duration_ms: o.stimulus_duration_ms.go,
    stop_signal_duration_ms: o.stimulus_duration_ms.stop_signal,
    condition_proportions: o.condition_proportions[0],
    condition_proportions_by_block: o.condition_proportions,
    sequence_constraints: o.sequence_constraints ?? {},
  };
}

export type Run = GenericRun<StopSignalTaskOptions, Eff>;

export const harness = createHarness<StopSignalTaskOptions, Eff>({
  createTimeline: (jsPsych, opts) => createTimeline(jsPsych, opts),
  resolve: (opts, phase) => toEff(resolveOptions(opts, phase)),
  seed: "stop-signal-repro",
  // the package's own race-model simulation (stop outcomes depend on the staircase); the shared
  // timing checks pass their own forced RTs, which the package honours
  simulation: {},
});

export const run = harness.run;

export { collectTrials, evalStimulus, rowsOf, trialsOf } from "@jspsych-timelines/testing";
