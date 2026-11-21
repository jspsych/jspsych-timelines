/** The self-ordered pointing harness: `@jspsych-timelines/testing`'s harness around this package's functions. */
import { createHarness } from "@jspsych-timelines/testing";
import type { Run as GenericRun } from "@jspsych-timelines/testing";

import { createTimeline } from "../src";
import { ResolvedOptions, SelfOrderedPointingOptions, resolveOptions } from "../src/options";

export type Run = GenericRun<SelfOrderedPointingOptions, ResolvedOptions>;

export const harness = createHarness<SelfOrderedPointingOptions, ResolvedOptions>({
  createTimeline: (jsPsych, opts) => createTimeline(jsPsych, opts),
  resolve: resolveOptions,
  seed: "self-ordered-pointing-repro",
});

export const run = harness.run;

export { collectTrials, evalStimulus, rowsOf, trialsOf } from "@jspsych-timelines/testing";
