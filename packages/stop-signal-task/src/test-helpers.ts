import { simulateTimeline } from "@jspsych/test-utils";
import { JsPsych, initJsPsych } from "jspsych";

import { StopSignalTaskOptions } from "./options";
import { createTimeline } from ".";

export async function run(
  options: StopSignalTaskOptions,
  simulation: Record<string, any> = {},
  seed = "sst"
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
