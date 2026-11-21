/** The two-step task's harness: `@jspsych-timelines/testing`'s harness around this package's functions. */
import { createHarness } from "@jspsych-timelines/testing";
import type { Run as GenericRun } from "@jspsych-timelines/testing";

import { createTimeline } from "../src";
import { ResolvedOptions, TwoStepTaskOptions, resolveOptions } from "../src/options";

export type Run = GenericRun<TwoStepTaskOptions, ResolvedOptions>;

export const harness = createHarness<TwoStepTaskOptions, ResolvedOptions>({
  createTimeline: (jsPsych, opts) => createTimeline(jsPsych, opts),
  resolve: resolveOptions,
  seed: "two-step-task-repro",
});

export const run = harness.run;

export { collectTrials, evalStimulus, rowsOf, trialsOf } from "@jspsych-timelines/testing";
