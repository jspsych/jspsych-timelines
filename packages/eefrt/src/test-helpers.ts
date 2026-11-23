import { simulateTimeline } from "@jspsych/test-utils";
import { JsPsych, initJsPsych } from "jspsych";

import { EefrtOptions } from "./options";
import { createTimeline } from ".";

/** Run the timeline under data-only simulation (the package's own participant model) and return the rows. */
export async function run(
  options: EefrtOptions,
  simulation: Record<string, any> = {},
  seed = "eefrt"
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
