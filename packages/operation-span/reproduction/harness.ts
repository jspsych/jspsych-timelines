/** The operation span harness: `@jspsych-timelines/testing`'s harness around this package's functions. */
import { createHarness } from "@jspsych-timelines/testing";
import type { Run as GenericRun } from "@jspsych-timelines/testing";

import { createTimeline } from "../src";
import { OperationSpanOptions, ResolvedOptions, resolveOptions } from "../src/options";

export type Run = GenericRun<OperationSpanOptions, ResolvedOptions>;

export const harness = createHarness<OperationSpanOptions, ResolvedOptions>({
  createTimeline: (jsPsych, opts) => createTimeline(jsPsych, opts),
  resolve: resolveOptions,
  seed: "operation-span-repro",
});

export const run = harness.run;

export { collectTrials, evalStimulus, rowsOf, trialsOf } from "@jspsych-timelines/testing";
