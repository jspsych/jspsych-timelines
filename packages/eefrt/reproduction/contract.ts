/**
 * What the shared checks need to know about the EEfRT's data (see `defineContract` in
 * `@jspsych-timelines/testing`).
 *
 * The scorable row (`part: "response"`) is the effort phase of one trial; it carries the offer, the
 * choice and the outcome. The choice has its own row (`part: "choice"`), and the response window of the
 * vocabulary (the time allowed to choose) is read from it. The task has two feedback screens, so
 * `parts.feedback` names the completion screen and the reward screen is checked separately.
 *
 * There is no correct answer (§4's `correct`), no condition proportions and no blocks, so the checks
 * that read them (`condition_proportions`, `n_blocks`, ...) are not used; `fields.correct` points at the
 * nearest field, `completed`.
 */
import { defineContract } from "@jspsych-timelines/testing";

import type { Eff } from "./harness";

export const contract = defineContract<Eff>({
  task: "eefrt",
  parts: { response: "response", feedback: "completion_feedback" },
  fields: {
    correct: "completed",
    // a choice between two tasks has no correct response: the key check reads the presses alone
    correct_response: null,
    timeout: "timeout",
    response_window: "response_window",
    stimulus_duration: null as any,
    response_device: null as any,
    feedback_kind: null as any,
  },
  blockSizes: (eff) => [eff.n_test_trials],
  // the sampled duration is recorded twice on fixation and feedback rows: `duration_ms` and the option's own field
  durationFields: (option) =>
    option === "fixation_duration_ms"
      ? ["duration_ms", "fixation_duration"]
      : option === "feedback_duration_ms" || option === "reward_feedback_duration_ms"
      ? ["duration_ms", "feedback_duration"]
      : ["duration_ms"],
  // the vocabulary's response window is the time to choose, read from the choice rows
  scope: {
    response_window_ms: { part: "choice", value: (eff) => eff.response_window_ms.choice },
    // the choice keys are pressed on the `choice` screens
    response_keys: { part: "choice" },
  },
});
