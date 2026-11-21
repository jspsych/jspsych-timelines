import { simulateTimeline } from "@jspsych/test-utils";
import { JsPsych, initJsPsych } from "jspsych";

import { ToneDetectionOptions } from "./options";
import { createTimeline } from ".";

export async function run(
  options: ToneDetectionOptions,
  simulation: Record<string, any> = {},
  seed = "td"
) {
  const jsPsych: JsPsych = initJsPsych();
  jsPsych.randomization.setSeed(seed);
  const { timeline } = createTimeline(jsPsych, options);
  const { getData, expectFinished } = await simulateTimeline(
    timeline,
    "data-only",
    simulation,
    jsPsych
  );
  await expectFinished();
  return { rows: getData().values() as any[], data: getData(), jsPsych };
}

export const responses = (rows: any[], phase = "test") =>
  rows.filter((r) => r.phase === phase && r.part === "response");

/** A short, fast configuration for tests: one track of 12 trials, a few practice trials. */
export const SHORT: ToneDetectionOptions = {
  trials_per_condition: 1,
  practice_trials: 4,
  adaptive: { discontinue_rule: { trials: 12 } },
};
