import type { JsPsych } from "jspsych";

import type { DurationSpec, ResolvedOptions } from "./options";

/** Draw one duration: a number is itself; `{ min, max, step }` is uniform on the step grid (through jsPsych.randomization). */
export function sampleDuration(jsPsych: JsPsych, d: DurationSpec): number {
  if (typeof d === "number") return d;
  const step = d.step && d.step > 0 ? d.step : 1;
  const k = jsPsych.randomization.randomInt(0, Math.floor((d.max - d.min) / step + 1e-9));
  return d.min + k * step;
}

/** The label of a condition (one tone frequency) in the data. */
export const conditionLabel = (frequency_hz: number): string => `${frequency_hz}_hz`;

export interface TrackSpec {
  /** 1..n over the whole test */
  block: number;
  /** 1..trials_per_condition within the condition */
  track_id: number;
  condition: string;
  frequency_hz: number;
}

/**
 * The tracks of the test. Round r holds one track of every condition; the conditions are in the order of `block_order`
 * (`random_within_block`: shuffled in each round; `fixed`: as given; `ascending` / `descending`: by frequency).
 */
export function buildTrackSpecs(jsPsych: JsPsych, o: ResolvedOptions): TrackSpec[] {
  const out: TrackSpec[] = [];
  for (let round = 1; round <= o.trials_per_condition; round++) {
    let order = [...o.tone_frequency_hz];
    switch (o.block_order) {
      case "random_within_block":
        order = jsPsych.randomization.shuffle(order);
        break;
      case "ascending":
        order.sort((a, b) => a - b);
        break;
      case "descending":
        order.sort((a, b) => b - a);
        break;
      default:
        break; // fixed
    }
    for (const f of order) {
      out.push({
        block: out.length + 1,
        track_id: round,
        condition: conditionLabel(f),
        frequency_hz: f,
      });
    }
  }
  return out;
}

/** `n` levels from `levels`, balanced (each used n / length times; the remainder drawn without replacement), in random order. */
export function allocateLevels(jsPsych: JsPsych, levels: number[], n: number): number[] {
  const R = jsPsych.randomization;
  const each = Math.floor(n / levels.length);
  const rest = n - each * levels.length;
  const list = [
    ...(each > 0 ? levels.flatMap((l) => Array.from({ length: each }, () => l)) : []),
    ...(rest > 0 ? R.sampleWithoutReplacement(levels, rest) : []),
  ];
  return R.shuffle(list);
}

/** Total trials of the staircase tracks when the stop rule is a trial count, else null. */
export function plannedTrials(
  o: ResolvedOptions,
  phase: "practice" | "test",
  practiceTrials: number
): number | null {
  if (phase === "practice") return practiceTrials;
  if (o.adaptive === null) return o.trials_per_block;
  return o.adaptive.discontinue_rule?.trials ?? null;
}
