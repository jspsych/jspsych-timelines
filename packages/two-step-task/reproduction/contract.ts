/**
 * What the shared checks need to know about the two-step task's data (see `defineContract` in
 * `@jspsych-timelines/testing`). The scorable row is the trial's `response` row (one per trial
 * attempt); the raw choices are `choice` rows. The task has no correct answer (`correct` and
 * `correct_response` are null), so the shared `response_keys` check reads the key presses alone.
 */
import { defineContract } from "@jspsych-timelines/testing";

import type { ResolvedOptions } from "../src/options";
import { splitTrials } from "../src/schedule";

const DURATION_FIELDS: Record<string, string[]> = {
  fixation_duration_ms: ["duration_ms", "fixation_duration"],
  iti_ms: ["duration_ms", "iti"],
  feedback_duration_ms: ["duration_ms", "feedback_duration"],
  timeout_message_ms: ["duration_ms", "timeout_message"],
  response_acknowledgement_ms: ["duration_ms", "response_acknowledgement"],
};

export const contract = defineContract<ResolvedOptions>({
  task: "two-step-task",
  // the trial's condition is its transition (common or rare)
  condition: (row) => row.condition ?? null,
  blockSizes: (eff) => splitTrials(eff.n_test_trials, eff.n_blocks),
  durationFields: (option) => DURATION_FIELDS[option] ?? ["duration_ms"],
  fields: { correct: null, correct_response: null },
  // the window is recorded on the response row, and set on the `choice` trials
  scope: {
    response_window_ms: { part: "response", builtPart: () => "choice" },
    // the keys are pressed on the `choice` screens, one row per stage
    response_keys: { part: "choice" },
  },
});
