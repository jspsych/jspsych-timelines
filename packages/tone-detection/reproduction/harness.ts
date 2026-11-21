/** The tone detection harness: `@jspsych-timelines/testing`'s harness around this package's functions. */
import { createHarness } from "@jspsych-timelines/testing";
import type { Run as GenericRun } from "@jspsych-timelines/testing";

import { createTimeline } from "../src";
import { ResolvedOptions, ToneDetectionOptions, resolveOptions } from "../src/options";

/** What the checks read: the resolved options as they are (the package's option shapes are the vocabulary's). */
export type Eff = ResolvedOptions;

export type Run = GenericRun<ToneDetectionOptions, Eff>;

export const harness = createHarness<ToneDetectionOptions, Eff>({
  createTimeline: (jsPsych, opts) => createTimeline(jsPsych, opts),
  resolve: (opts, phase) => resolveOptions(opts, phase),
  seed: "tone-detection-repro",
  // the package's own simulated listener (a psychometric function), so staircases reverse and settle
  simulation: {},
});

export const run = harness.run;

export { collectTrials, evalStimulus, rowsOf, trialsOf } from "@jspsych-timelines/testing";
