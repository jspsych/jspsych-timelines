/**
 * Prebuilt, deterministic rules for `response_window_ms` (PACKAGE-STANDARD §2a, "Rules are functions").
 *
 * A rule is called at the start of every timed processing trial with `{ jsPsych, phase, block,
 * trial_index_in_block }`. These helpers read the correct processing-only practice RTs from
 * `jsPsych.data` themselves, so the same data always gives the same value: once practice is over the
 * deadline stays fixed. Until there are `MIN_CALIBRATION_ROWS` usable RTs they return
 * `FALLBACK_DEADLINE_MS`.
 */
import type { JsPsych } from "jspsych";

import { FALLBACK_DEADLINE_MS, MIN_CALIBRATION_ROWS, TASK_NAME } from "./constants";

export interface DeadlineContext {
  jsPsych: JsPsych;
  phase: "practice" | "test";
  /** Block number of the trial, or null in practice. */
  block: number | null;
  /** 1-based position of the span trial within its block (or of the practice item within its part). */
  trial_index_in_block: number;
}

/** A computed value for `response_window_ms`: ms, or null for no limit. `label` is recorded as `response_window_rule`. */
export type DeadlineFunction = ((ctx: DeadlineContext) => number | null) & { label?: string };

export interface DeadlineBounds {
  /** Lowest deadline returned (ms). */
  min?: number;
  /** Highest deadline returned (ms). */
  max?: number;
}

/** The practice RTs a calibrated deadline is computed from: correct processing-only practice responses with an RT. */
export function calibrationRts(jsPsych: JsPsych): number[] {
  return jsPsych.data
    .get()
    .filter({
      task: TASK_NAME,
      phase: "practice",
      part: "processing",
      practice_part: "processing_only",
      correct: true,
    })
    .filterCustom((r: any) => typeof r.rt === "number")
    .select("rt")
    .values.slice();
}

function clamp(v: number, b: DeadlineBounds): number {
  let out = v;
  if (b.min !== undefined) out = Math.max(out, b.min);
  if (b.max !== undefined) out = Math.min(out, b.max);
  return out;
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
/** Sample SD (n - 1), as jsPsych's `DataColumn.sd()`. */
function sd(xs: number[]): number {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1));
}
/** Linear-interpolation percentile, p in [0, 100]. */
function percentileOf(xs: number[], p: number): number {
  const s = xs.slice().sort((a, b) => a - b);
  const pos = (p / 100) * (s.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

function make(
  label: string,
  f: (rts: number[]) => number,
  bounds: DeadlineBounds
): DeadlineFunction {
  const fn: DeadlineFunction = ({ jsPsych }) => {
    const rts = calibrationRts(jsPsych);
    if (rts.length < MIN_CALIBRATION_ROWS) return clamp(FALLBACK_DEADLINE_MS, bounds);
    return Math.round(clamp(f(rts), bounds));
  };
  fn.label = label + (bounds.min !== undefined || bounds.max !== undefined ? " (bounded)" : "");
  return fn;
}

export const deadlines = {
  /**
   * Mean + `k` sample SDs of the correct processing-only practice RTs: the anchor's calibrated deadline with
   * `k = 2.5` (Unsworth et al. 2005; also PsyToolkit), or `k = 2` (S039).
   */
  meanPlusSd: (k: number, bounds: DeadlineBounds = {}): DeadlineFunction =>
    make(`mean + ${k} SD of correct practice RTs`, (rts) => mean(rts) + k * sd(rts), bounds),
  /** The `p`-th percentile (0-100) of the correct processing-only practice RTs. */
  percentile: (p: number, bounds: DeadlineBounds = {}): DeadlineFunction =>
    make(`${p}th percentile of correct practice RTs`, (rts) => percentileOf(rts, p), bounds),
  /** Number, mean and SD of the practice RTs the helpers would use now (for reports and checks). */
  calibration: (jsPsych: JsPsych) => {
    const rts = calibrationRts(jsPsych);
    return {
      n: rts.length,
      mean: rts.length ? mean(rts) : null,
      sd: rts.length > 1 ? sd(rts) : null,
    };
  },
};
