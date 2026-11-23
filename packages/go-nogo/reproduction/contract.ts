import { defineContract } from "@jspsych-timelines/testing";
/**
 * What the shared checks need to know about the go/no-go data (see `defineContract` in
 * `@jspsych-timelines/testing`). Everything not named here follows the standard tagging and the
 * standard part names (`response`, `iti`, `feedback`, ...).
 */
import { allocate } from "@jspsych/sequencer";

import type { ResolvedOptions } from "../src/options";
import { splitTrials } from "../src/sequence";

export const contract = defineContract<ResolvedOptions>({
  task: "go-nogo",
  // the trial type is `condition`: go | nogo (| go_control in baseline blocks, which has no block)
  condition: (row) => row.condition ?? null,
  proportionKeys: (eff) => Object.keys(eff.condition_proportions),
  // no-go trials have no correct response and no response to time out
  exempt: (row) => row.condition === "nogo",
  // @jspsych/sequencer's largest-remainder allocation
  allocate: (weights, n) => allocate(weights, n),
  blockSizes: (eff) => splitTrials(eff.n_test_trials, eff.n_blocks),
  // iti and feedback rows record the sampled value twice: `duration_ms` and `iti` / `feedback_duration`
  durationFields: (option) =>
    option === "iti_ms"
      ? ["duration_ms", "iti"]
      : option === "feedback_duration_ms"
      ? ["duration_ms", "feedback_duration"]
      : ["duration_ms"],
  // the neighbour rules hold across block boundaries (sequenceBlocks); `cycle_length` and
  // `balanced_transitions` are checked in checks.ts
  sequenceAcrossBlocks: true,
});
