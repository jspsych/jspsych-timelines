/**
 * Prebuilt response-window rules (PACKAGE-STANDARD §2a): a participant-specific deadline calibrated from
 * correct go RTs in practice, as in S207 (mean + 2 SD, or the 90th percentile of short-SOA go RTs).
 *
 * They are functions of the data so far and deterministic: practice RTs do not change once practice is
 * over, so the deadline is the same on every test trial. During practice, and until there are
 * DEADLINE_MIN_RTS correct practice go RTs, they return DEADLINE_FALLBACK_MS.
 */
import { DataCollection } from "jspsych";

import { DEADLINE_FALLBACK_MS, DEADLINE_MIN_RTS, TASK_NAME } from "./constants";
import type { OptionContext, ResponseWindowFunction } from "./options";

export interface DeadlineBounds {
  /** Lowest deadline, ms. */
  min?: number;
  /** Highest deadline, ms. */
  max?: number;
}

function practiceRts(ctx: OptionContext): number[] {
  if (ctx.phase === "practice") return [];
  return ctx.jsPsych.data
    .get()
    .filter({
      task: TASK_NAME,
      phase: "practice",
      part: "response",
      condition: "go",
      correct: true,
    })
    .select("rt")
    .values.filter((x: unknown) => typeof x === "number") as number[];
}

function rule(
  label: string,
  compute: (rts: number[]) => number,
  bounds: DeadlineBounds
): ResponseWindowFunction {
  const fn: ResponseWindowFunction = (ctx) => {
    const rts = practiceRts(ctx);
    if (rts.length < DEADLINE_MIN_RTS) return DEADLINE_FALLBACK_MS;
    let v = compute(rts);
    if (bounds.min !== undefined) v = Math.max(bounds.min, v);
    if (bounds.max !== undefined) v = Math.min(bounds.max, v);
    return Math.round(v);
  };
  fn.label = label;
  return fn;
}

/** Mean + k SD of the correct practice go RTs (S207 used k = 2). */
export function meanPlusSd(k: number, bounds: DeadlineBounds = {}): ResponseWindowFunction {
  return rule(
    `mean + ${k} SD of correct practice RTs`,
    (rts) => {
      const col = new DataCollection(rts.map((rt) => ({ rt }))).select("rt");
      return col.mean() + k * col.sd();
    },
    bounds
  );
}

/** The p-th percentile (0-100, linear interpolation) of the correct practice go RTs (S207 used 90). */
export function percentile(p: number, bounds: DeadlineBounds = {}): ResponseWindowFunction {
  return rule(
    `${p}th percentile of correct practice RTs`,
    (rts) => {
      const sorted = [...rts].sort((a, b) => a - b);
      const pos = (p / 100) * (sorted.length - 1);
      const lo = Math.floor(pos);
      const hi = Math.ceil(pos);
      return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
    },
    bounds
  );
}
