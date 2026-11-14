/** The flanker harness: `@jspsych-timelines/testing`'s harness around this package's functions. */
import { createHarness } from "@jspsych-timelines/testing";
import type { Run as GenericRun } from "@jspsych-timelines/testing";

import { createTimeline } from "../src";
import { FlankerOptions, ResolvedOptions, resolveOptions } from "../src/options";

export type Run = GenericRun<FlankerOptions, ResolvedOptions>;

export const harness = createHarness<FlankerOptions, ResolvedOptions>({
  createTimeline: (jsPsych, opts) => createTimeline(jsPsych, opts),
  resolve: resolveOptions,
  seed: "flanker-repro",
  // the virtual chinrest plugin has no simulation mode; it is checked on the built timeline
  unsimulatable: ["virtual-chinrest"],
});

export const run = harness.run;

export { collectTrials, evalStimulus, rowsOf, trialsOf } from "@jspsych-timelines/testing";
