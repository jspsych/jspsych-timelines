/**
 * Harness: build a timeline from options, run it with `jsPsych.simulate(..., "data-only")` and
 * return the rows. Runs are seeded, so a configuration gives the same rows every time.
 */
import { simulateTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";
import type { JsPsych } from "jspsych";

import { collectTrials, filterRows } from "./rows";
import type { Phase, Row } from "./types";

export interface Run<O = any, E = any> {
  /** the options as given */
  opts: O;
  /** resolved options for the test phase and for the practice phase */
  eff: E;
  effP: E;
  /** the timeline as built (before unsimulatable nodes are removed) */
  built: { timeline: any[] };
  rows: Row[];
  jsPsych: JsPsych;
}

export interface HarnessConfig<O = any, E = any> {
  /** the package's `createTimeline` */
  createTimeline: (jsPsych: JsPsych, options: O) => { timeline: any[] };
  /** the package's option resolution (defaults, practice overrides, absence normalisation) */
  resolve: (options: O, phase: Phase) => E;
  /** simulation options for jsPsych's test utils; default: every trial responds after 400 ms */
  simulation?: Record<string, any>;
  /** seed used when a run does not name one */
  seed?: string;
  /** plugin names (`type.info.name`) with no simulation mode: removed before simulating */
  unsimulatable?: string[];
}

export type RunFn<O = any, E = any> = (
  options: O,
  simulation?: Record<string, any>,
  seed?: string
) => Promise<Run<O, E>>;

export interface Harness<O = any, E = any> {
  config: HarnessConfig<O, E>;
  run: RunFn<O, E>;
  /** run the same options under several seeds */
  runSeeds: (options: O, seeds: string[], simulation?: Record<string, any>) => Promise<Run<O, E>[]>;
  /** a run in which every participant is slower than `rt` ms (to provoke timeouts) */
  runSlow: (options: O, rt?: number) => Promise<Run<O, E>>;
}

export const DEFAULT_SIMULATION = { default: { data: { rt: 400 } } };

export function createHarness<O = any, E = any>(config: HarnessConfig<O, E>): Harness<O, E> {
  const run: RunFn<O, E> = async (options, simulation, seed) => {
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed(seed ?? config.seed ?? "reproduction");
    const built = config.createTimeline(jsPsych, options);
    const skip = config.unsimulatable ?? [];
    const runnable = built.timeline.filter(
      (n: any) => !(n.type && skip.includes(n.type.info?.name))
    );
    const { getData, expectFinished } = await simulateTimeline(
      runnable,
      "data-only",
      simulation ?? config.simulation ?? DEFAULT_SIMULATION,
      jsPsych
    );
    await expectFinished();
    return {
      opts: options,
      eff: config.resolve(options, "test"),
      effP: config.resolve(options, "practice"),
      built,
      rows: getData().values() as Row[],
      jsPsych,
    };
  };
  return {
    config,
    run,
    runSeeds: (options, seeds, simulation) =>
      Promise.all(seeds.map((s) => run(options, simulation, s))),
    runSlow: (options, rt = 50000) => run(options, { default: { data: { rt } } }),
  };
}

/** Rows of one phase and part (the scorable trial is `rowsOf(r, "test", "response")`). */
export const rowsOf = (r: Pick<Run, "rows">, phase: string, part: string): Row[] =>
  filterRows(r.rows, { phase, part });

/** Trial parameter objects of one part in the built timeline, e.g. to read `trial_duration`. */
export const trialsOf = (r: Pick<Run, "built">, part: string): any[] =>
  collectTrials(r.built.timeline).filter((t) => t.data?.part === part);
