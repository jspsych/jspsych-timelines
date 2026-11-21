/**
 * What the shared checks need to know about the tone detection task's data (see `defineContract` in
 * `@jspsych-timelines/testing`). Everything not named here follows the standard tagging and the
 * standard part names (`response`, `iti`, `feedback`, ...). The task has no fixation, no cue and no
 * response window: the shared checks that need them are not used.
 */
import { defineContract } from "@jspsych-timelines/testing";

import type { Eff } from "./harness";

export const contract = defineContract<Eff>({
  task: "tone-detection",
  // the condition is the tone frequency, "1000_hz"
  condition: (row) => row.condition ?? null,
  proportionKeys: () => [],
  // a track ends by its own rule, so a block has no planned size under a staircase
  blockSizes: (eff) => (eff.trials_per_block ? [eff.trials_per_block] : []),
  fields: {
    // the tone detection response has no window and no stimulus-duration field on the response row
    timeout: null,
    response_window: null,
    stimulus_duration: null,
  },
  // display rows record the sampled value in the option's own field
  durationFields: (option) =>
    option === "iti_ms"
      ? ["iti"]
      : option === "feedback_duration_ms"
      ? ["feedback_duration"]
      : ["duration_ms"],
});
