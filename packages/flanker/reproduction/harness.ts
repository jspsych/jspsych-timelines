import { simulateTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import { createTimeline } from "../src";
import { FlankerOptions, ResolvedOptions, resolveOptions } from "../src/options";

export interface Run {
  opts: FlankerOptions;
  /** resolved test and practice options */
  eff: ResolvedOptions;
  effP: ResolvedOptions;
  /** the timeline as built (before calibration nodes are removed for simulation) */
  built: { timeline: any[] };
  rows: any[];
  jsPsych: ReturnType<typeof initJsPsych>;
}

/** Flat list of trial parameter objects (nodes with a plugin `type`) in a built timeline. */
export function collectTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => collectTrials(t, out));
  else if (tl && tl.timeline) collectTrials(tl.timeline, out);
  else if (tl && tl.type) out.push(tl);
  return out;
}

export function evalStimulus(trial: any): string {
  return typeof trial.stimulus === "function" ? trial.stimulus() : trial.stimulus;
}

const NO_SIMULATE = ["virtual-chinrest"];

export async function run(
  opts: FlankerOptions,
  sim: Record<string, any> = { default: { data: { rt: 400 } } },
  seed = "flanker-repro"
): Promise<Run> {
  const jsPsych = initJsPsych();
  jsPsych.randomization.setSeed(seed);
  const built = createTimeline(jsPsych, opts);
  // the virtual chinrest plugin has no simulation mode; it is checked on the built timeline
  const runnable = built.timeline.filter(
    (n: any) => !(n.type && NO_SIMULATE.includes(n.type.info?.name))
  );
  const { getData, expectFinished } = await simulateTimeline(runnable, "data-only", sim, jsPsych);
  await expectFinished();
  return {
    opts,
    eff: resolveOptions(opts, "test"),
    effP: resolveOptions(opts, "practice"),
    built,
    rows: getData().values() as any[],
    jsPsych,
  };
}

export const rowsOf = (r: Run, phase: string, part: string) =>
  r.rows.filter((x) => x.phase === phase && x.part === part);
