/**
 * What the shared checks need to know about the flanker's data (see `defineContract` in
 * `@jspsych-timelines/testing`). Everything not named here follows the standard tagging and the
 * standard part names (`response`, `fixation`, `iti`, `feedback`, ...).
 */
import { defineContract } from "@jspsych-timelines/testing";

import type { ResolvedOptions } from "../src/options";
import { allocateCounts } from "../src/sequence";
import { splitTrials } from "../src/trials";

const CUE_FACTORS = ["cued", "uncued"];

export const coarse = (c: string) => (c.startsWith("neutral") ? "neutral" : c);

export const contract = defineContract<ResolvedOptions>({
  task: "flanker",
  // the trial type is `flanker_condition`; `neutral_dash` and `neutral_empty` count as `neutral`
  condition: (row) => row.flanker_condition ?? null,
  normaliseCondition: coarse,
  // `cued` and `uncued` are an orthogonal factor, not trial types
  proportionKeys: (eff) =>
    Object.keys(eff.condition_proportions).filter((k) => !CUE_FACTORS.includes(k)),
  rowMatchesKey: (row, key) =>
    key === "neutral" ? row.congruency === "neutral" : row.flanker_condition === key,
  // no-go trials have no correct response and no response to time out
  exempt: (row) => row.congruency === "nogo",
  // the package's own rounding rule and block split
  allocate: allocateCounts,
  blockSizes: (eff) => splitTrials(eff.n_test_trials, eff.n_blocks),
  // fixation rows record the sampled value twice: `duration_ms` and `fixation_duration`
  durationFields: (option) =>
    option === "fixation_duration_ms" ? ["duration_ms", "fixation_duration"] : ["duration_ms"],
});
