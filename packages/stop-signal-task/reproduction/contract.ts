/**
 * What the shared checks need to know about the stop-signal task's data (see `defineContract` in
 * `@jspsych-timelines/testing`). Everything not named here follows the standard tagging and the
 * standard part names (`response`, `fixation`, `iti`, `feedback`, ...).
 */
import { defineContract } from "@jspsych-timelines/testing";

import { allocateTypes } from "../src/design";
import { splitTrials } from "../src/options";
import type { Eff } from "./harness";

export const contract = defineContract<Eff>({
  task: "stop-signal-task",
  // the trial type is `condition` ("go" | "stop"); jsPsych owns `trial_type`
  condition: (row) => row.condition ?? null,
  proportionKeys: () => ["stop", "go"],
  // per-block stop proportions: block b takes its entry, the last repeating (PACKAGE-STANDARD §2a)
  proportionsFor: (eff, block) =>
    eff.condition_proportions_by_block[
      Math.min(block - 1, eff.condition_proportions_by_block.length - 1)
    ] as Record<string, number>,
  // a stop trial has no correct response but still has a window; nothing is exempt from timing
  exempt: () => false,
  allocate: (weights, n) => {
    const { stop, go } = allocateTypes({ stop: weights[0], go: weights[1] }, n);
    return [stop, go];
  },
  blockSizes: (eff) => splitTrials(eff.n_test_trials, eff.n_blocks),
  // display rows record the sampled value twice: `duration_ms` and the option's own field
  durationFields: (option) =>
    option === "fixation_duration_ms"
      ? ["duration_ms", "fixation_duration"]
      : option === "iti_ms"
      ? ["duration_ms", "iti"]
      : option === "feedback_duration_ms"
      ? ["duration_ms", "feedback_duration"]
      : ["duration_ms"],
  sequenceConstraints: {
    // every cycle of n trials holds the block's stop proportion exactly
    cycle_length: (blockRows, n) => {
      const p = blockRows[0].stop_probability_condition as number;
      for (let i = 0; i + n <= blockRows.length; i += n) {
        const stops = blockRows.slice(i, i + n).filter((r) => r.condition === "stop").length;
        expect(stops).toBe(Math.round(p * n));
      }
    },
  },
});
