/** The EEfRT harness: `@jspsych-timelines/testing`'s harness around this package's functions. */
import { createHarness } from "@jspsych-timelines/testing";
import type { Run as GenericRun } from "@jspsych-timelines/testing";

import { createTimeline } from "../src";
import { DurationSpec, EefrtOptions, ResolvedOptions, resolveOptions } from "../src/options";

/**
 * What the shared checks and this package's checks read: the resolved options, with the feedback
 * duration split in two. The task has two feedback screens (completion and reward), recorded under
 * two parts, and the shared duration check reads one option per part:
 *  - `feedback_duration_ms` is the completion screen's duration (the vocabulary's number or jitter range)
 *  - `reward_feedback_duration_ms` is the reward screen's
 */
export type Eff = Omit<ResolvedOptions, "feedback_duration_ms"> & {
  feedback_duration_ms: DurationSpec;
  reward_feedback_duration_ms: DurationSpec;
};

export function toEff(o: ResolvedOptions): Eff {
  return {
    ...o,
    feedback_duration_ms: o.feedback_duration_ms.completion,
    reward_feedback_duration_ms: o.feedback_duration_ms.reward,
  };
}

export type Run = GenericRun<EefrtOptions, Eff>;

export const harness = createHarness<EefrtOptions, Eff>({
  createTimeline: (jsPsych, opts) => createTimeline(jsPsych, opts),
  resolve: (opts, phase) => toEff(resolveOptions(opts, phase)),
  seed: "eefrt-repro",
  // the package's own participant model (choices rise with reward and probability, press rates
  // with some failures); the shared timing checks pass their own forced RTs, which the choice honours
  simulation: {},
});

export const run = harness.run;

export { collectTrials, evalStimulus, rowsOf, trialsOf } from "@jspsych-timelines/testing";
