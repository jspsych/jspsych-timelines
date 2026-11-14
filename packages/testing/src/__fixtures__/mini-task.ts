/**
 * A minimal task that follows the standard's data tagging and the vocabulary, used to test the
 * shared checks themselves (the flanker pilot exercises 15 of them; this task also has
 * `trials_per_block` and `sequence_constraints`). `bugs` switches on deliberate faults, to show
 * that a check fails when the option is not honoured.
 */
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import type { JsPsych } from "jspsych";

import { allocateLargestRemainder, defineContract, splitEvenly } from "../contract";
import { createHarness } from "../harness";
import type { DurationSpec } from "../types";

export interface MiniOptions {
  n_test_trials?: number;
  practice_trials?: number;
  n_blocks?: number;
  trials_per_block?: number;
  condition_proportions?: Record<string, number>;
  condition_set?: string[];
  trial_order?: "random" | "shuffled_list" | "fixed_sequence";
  sequence_constraints?: { max_run?: number; no_immediate_repeat?: boolean } | null;
  response_window_ms?: DurationSpec | null;
  stimulus_duration_ms?: number | null;
  fixation_duration_ms?: DurationSpec;
  iti_ms?: DurationSpec;
  feedback_duration_ms?: DurationSpec;
  trial_feedback?: "none" | "accuracy";
  feedback_condition?: "all" | "errors_only" | "correct_only";
  response_keys?: string[];
  response_device?: "keyboard" | "touch";
  practice?: Partial<MiniOptions>;
}

export const MINI_DEFAULTS = {
  n_test_trials: 12,
  practice_trials: 2,
  n_blocks: 2,
  condition_proportions: { a: 0.5, b: 0.5 } as Record<string, number>,
  trial_order: "shuffled_list",
  sequence_constraints: null,
  response_window_ms: 1000 as DurationSpec | null,
  stimulus_duration_ms: null,
  fixation_duration_ms: 300 as DurationSpec,
  iti_ms: 200 as DurationSpec,
  feedback_duration_ms: 300 as DurationSpec,
  trial_feedback: "none",
  feedback_condition: "all",
  response_keys: ["f", "j"],
  response_device: "keyboard",
};

export type MiniBug =
  | "ignore_n_blocks"
  | "no_feedback_for_errors"
  | "wrong_proportions"
  | "ignore_max_run"
  | "never_times_out"
  | "unseeded_jitter"
  | "jitter_off_grid"
  | "wrong_plugin";

export function resolveMini(options: MiniOptions, phase: "test" | "practice" = "test"): any {
  const { practice, ...top } = options;
  const merged: any = {
    ...MINI_DEFAULTS,
    ...(phase === "practice" ? { ...top, ...practice } : top),
  };
  if (merged.condition_set && !options.condition_proportions) {
    merged.condition_proportions = Object.fromEntries(
      merged.condition_set.map((c: string) => [c, 1 / merged.condition_set.length])
    );
  }
  merged.condition_set ??= Object.keys(merged.condition_proportions);
  if (merged.trials_per_block != null && options.n_test_trials === undefined) {
    merged.n_test_trials = undefined;
  }
  return merged;
}

function sample(jsPsych: JsPsych, d: DurationSpec, bugs: MiniBug[]): number {
  if (typeof d === "number") return d;
  if (bugs.includes("unseeded_jitter"))
    return d.min + Math.floor(Math.random() * (d.max - d.min + 1));
  const step = d.step ?? 1;
  const levels = Math.floor((d.max - d.min) / step) + 1;
  const v = d.min + jsPsych.randomization.randomInt(0, levels - 1) * step;
  return bugs.includes("jitter_off_grid") ? v + 1 : v;
}

function conditionList(jsPsych: JsPsych, o: any, n: number, bugs: MiniBug[]): string[] {
  const keys = Object.keys(o.condition_proportions);
  const weights = keys.map((k) => o.condition_proportions[k]);
  const counts = allocateLargestRemainder(
    bugs.includes("wrong_proportions") ? weights.map((w, i) => (i === 0 ? w * 2 : w)) : weights,
    n
  );
  const list = keys.flatMap((k, i) => Array(counts[i]).fill(k) as string[]);
  const sc = o.sequence_constraints;
  if (o.trial_order === "random") {
    return jsPsych.randomization.sampleWithReplacement(keys, n, weights);
  }
  if (o.trial_order === "fixed_sequence") {
    return Array.from({ length: n }, (_, i) => keys[i % keys.length]);
  }
  if (sc?.no_immediate_repeat) {
    // draw from what is left, never the condition just used (counts stay exact when possible)
    const left = Object.fromEntries(keys.map((k, i) => [k, counts[i]]));
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const open = keys.filter((k) => left[k] > 0 && k !== out[i - 1]);
      const pool = open.length ? open : keys.filter((k) => left[k] > 0);
      const k = pool[jsPsych.randomization.randomInt(0, pool.length - 1)];
      left[k]--;
      out.push(k);
    }
    return out;
  }
  if (sc?.max_run && !bugs.includes("ignore_max_run")) {
    for (let t = 0; t < 2000; t++) {
      const cand = jsPsych.randomization.shuffle(list);
      let run = 1;
      let worst = 1;
      cand.forEach((x, i) => {
        run = i > 0 && x === cand[i - 1] ? run + 1 : 1;
        worst = Math.max(worst, run);
      });
      if (worst <= sc.max_run) return cand;
    }
    throw new Error("mini-task: could not satisfy max_run");
  }
  return jsPsych.randomization.shuffle(list);
}

export function createMiniTimeline(
  jsPsych: JsPsych,
  options: MiniOptions = {},
  bugs: MiniBug[] = []
) {
  const timeline: any[] = [];
  const base = (phase: string, part: string, extra: object = {}) => ({
    task: "mini-task",
    task_version: "0.0.0",
    phase,
    part,
    ...extra,
  });
  for (const phase of ["practice", "test"] as const) {
    const o = resolveMini(options, phase);
    const touch = o.response_device === "touch";
    const keys: string[] = o.response_keys;
    const sizes =
      phase === "practice"
        ? [o.practice_trials]
        : o.trials_per_block != null && o.n_test_trials === undefined
        ? Array.from({ length: o.n_blocks ?? 1 }, () => o.trials_per_block)
        : splitEvenly(o.n_test_trials, bugs.includes("ignore_n_blocks") ? 1 : o.n_blocks);
    sizes.forEach((n, bi) => {
      if (n === 0) return;
      const block = bi + 1;
      const conds = conditionList(jsPsych, o, n, bugs);
      conds.forEach((condition, ti) => {
        const correctIndex = Object.keys(o.condition_proportions).indexOf(condition) % keys.length;
        const fix = sample(jsPsych, o.fixation_duration_ms, bugs);
        if (fix > 0) {
          timeline.push({
            type: jsPsychHtmlKeyboardResponse,
            stimulus: "+",
            choices: "NO_KEYS",
            trial_duration: fix,
            data: base(phase, "fixation", { block, duration_ms: fix, fixation_duration: fix }),
          });
        }
        const win =
          o.response_window_ms === null ? null : sample(jsPsych, o.response_window_ms, bugs);
        const data = base(phase, "response", {
          block,
          trial_in_block: ti + 1,
          condition,
          correct_response: touch ? correctIndex : keys[correctIndex],
          response_window: win,
          stimulus_duration: o.stimulus_duration_ms,
          response_device: o.response_device,
        });
        const finish = (d: any) => {
          d.timeout = d.response === null;
          d.correct =
            !d.timeout &&
            String(d.response).toLowerCase() === String(d.correct_response).toLowerCase();
        };
        timeline.push(
          touch && !bugs.includes("wrong_plugin")
            ? {
                type: jsPsychHtmlButtonResponse,
                stimulus: condition,
                choices: keys,
                trial_duration: bugs.includes("never_times_out") ? null : win,
                stimulus_duration: o.stimulus_duration_ms,
                data,
                on_finish: finish,
              }
            : {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: condition,
                choices: keys,
                trial_duration: bugs.includes("never_times_out") ? null : win,
                stimulus_duration: o.stimulus_duration_ms,
                data,
                on_finish: finish,
              }
        );
        if (o.trial_feedback !== "none") {
          const fbMs = sample(jsPsych, o.feedback_duration_ms, bugs);
          timeline.push({
            timeline: [
              {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: "feedback",
                choices: "NO_KEYS",
                trial_duration: fbMs,
                data: base(phase, "feedback", {
                  block,
                  feedback_kind: o.trial_feedback,
                  duration_ms: fbMs,
                }),
              },
            ],
            conditional_function: () => {
              const last = jsPsych.data.getLastTrialData().values()[0];
              if (o.feedback_condition === "errors_only") {
                return bugs.includes("no_feedback_for_errors") ? false : !last.correct;
              }
              return o.feedback_condition === "all" ? true : !!last.correct;
            },
          });
        }
        const iti = sample(jsPsych, o.iti_ms, bugs);
        if (iti > 0) {
          timeline.push({
            type: jsPsychHtmlKeyboardResponse,
            stimulus: "",
            choices: "NO_KEYS",
            trial_duration: iti,
            data: base(phase, "iti", { block, duration_ms: iti }),
          });
        }
      });
    });
  }
  return { timeline };
}

export const miniContract = defineContract({
  task: "mini-task",
  durationFields: (option) =>
    option === "fixation_duration_ms" ? ["duration_ms", "fixation_duration"] : ["duration_ms"],
});

export function miniHarness(bugs: MiniBug[] = []) {
  return createHarness<MiniOptions, any>({
    createTimeline: (jsPsych, options) => createMiniTimeline(jsPsych, options, bugs),
    resolve: resolveMini,
  });
}
