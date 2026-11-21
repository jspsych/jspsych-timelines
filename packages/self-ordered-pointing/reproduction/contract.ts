/**
 * What the shared checks need to know about the self-ordered pointing data (see `defineContract` in
 * `@jspsych-timelines/testing`).
 *
 * The scorable row (`part: "response"`) is one pick: one page of one series. The literature's "trial" is the series,
 * so `practice_trials` (series) counts the first page of each series. The response of the shared `response_device`
 * check is the slot (`chosen_position`, a number or null), because the button plugin records an index and `response`
 * holds the item id. There is no key response, so the shared `response_keys` check has no case here.
 */
import { defineContract } from "@jspsych-timelines/testing";

import type { ResolvedOptions } from "../src/options";

export const contract = defineContract<ResolvedOptions>({
  task: "self-ordered-pointing",
  parts: { response: "response", feedback: "feedback", iti: "iti" },
  fields: {
    response: "chosen_position",
    response_window: "response_window",
    stimulus_duration: null,
  },
  // the trial type is the set size
  condition: (row) => (row.set_size === undefined ? null : String(row.set_size)),
  scope: {
    // `practice_trials` counts series, not pages
    practice_trials: { part: "response", filter: (row) => row.choice_index === 1 },
  },
});
