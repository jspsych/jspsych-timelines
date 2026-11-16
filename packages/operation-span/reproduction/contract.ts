/**
 * What the shared checks need to know about the operation span's data (see `defineContract` in
 * `@jspsych-timelines/testing`).
 *
 * The scorable row (`part: "response"`) is the recall of one span trial. The processing task and the
 * memoranda are other parts of the same trial, so the options that belong to them are routed with
 * `scope`: the deadline and the device of the processing task read the `processing` rows (the one row
 * per episode, in every display format), and the memorandum duration reads the `memorandum` rows.
 */
import { defineContract } from "@jspsych-timelines/testing";

import type { ResolvedOptions } from "../src/options";

const timedPart = (eff: ResolvedOptions) =>
  eff.processing_display_format === "problem_then_answer_screens"
    ? "processing_problem"
    : "processing";

export const contract = defineContract<ResolvedOptions>({
  task: "operation-span",
  parts: { response: "response", feedback: "feedback" },
  // the processing rows record the deadline in force and whether it was missed
  fields: { response_window: "response_window", stimulus_duration: "stimulus_duration" },
  // the trial type is the set size
  condition: (row) => (row.set_size === undefined ? null : String(row.set_size)),
  scope: {
    response_window_ms: {
      part: "processing",
      builtPart: timedPart,
      value: (eff) => eff.response_window_ms,
    },
    stimulus_duration_ms: { part: "memorandum" },
    // a missed deadline is answered by a notice (a display trial), not by a response screen
    response_device: {
      part: "processing",
      filter: (row) => !row.timeout,
      value: (eff) => eff.response_device.processing,
    },
    response_keys: { part: "processing", filter: (row) => !row.timeout },
    // `practice_trials` counts the processing-only practice problems
    practice_trials: {
      part: "processing",
      filter: (row) => row.practice_part === "processing_only",
    },
  },
});
