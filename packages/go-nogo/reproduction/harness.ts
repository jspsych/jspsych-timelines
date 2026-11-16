/** The go/no-go harness: `@jspsych-timelines/testing`'s harness around this package's functions. */
import { createHarness } from "@jspsych-timelines/testing";
import type { Run as GenericRun } from "@jspsych-timelines/testing";

import { createTimeline } from "../src";
import { GoNogoOptions, ResolvedOptions, resolveOptions } from "../src/options";

export type Run = GenericRun<GoNogoOptions, ResolvedOptions>;

export const harness = createHarness<GoNogoOptions, ResolvedOptions>({
  createTimeline: (jsPsych, opts) => createTimeline(jsPsych, opts),
  resolve: resolveOptions,
  seed: "go-nogo-repro",
});

export const run = harness.run;

export { collectTrials, evalStimulus, rowsOf, trialsOf } from "@jspsych-timelines/testing";
