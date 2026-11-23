import type { DataCollection } from "jspsych";

import { TASK_NAME, VERSION } from "./constants";

const norm = (x: unknown) =>
  String(x ?? "")
    .trim()
    .toLowerCase();

export interface RecallScore {
  /** One boolean per presented position. */
  correct_positions: boolean[];
  /** Number of true entries. */
  n_correct: number;
  /** Every position correct. */
  perfect: boolean;
}

/**
 * Score one recall. "serial": position i is correct when the item entered at i is the item presented at i.
 * "free": position i counts when the item presented at i was entered anywhere (each entry counts once).
 * Omissions are null and never match.
 */
export function scoreRecall(
  presented: string[],
  recalled: (string | null)[],
  order: "serial" | "free"
): RecallScore {
  let correct: boolean[];
  if (order === "serial") {
    correct = presented.map(
      (p, i) => recalled[i] !== null && recalled[i] !== undefined && norm(recalled[i]) === norm(p)
    );
  } else {
    const pool = recalled.filter((x): x is string => x !== null && x !== undefined).map(norm);
    correct = presented.map((p) => {
      const at = pool.indexOf(norm(p));
      if (at < 0) return false;
      pool.splice(at, 1);
      return true;
    });
  }
  const n = correct.filter(Boolean).length;
  return {
    correct_positions: correct,
    n_correct: n,
    perfect: n === presented.length && presented.length > 0,
  };
}

/**
 * Scores from the test phase. Empty-data values: counts and sums are 0, every mean, rate and
 * proportion is null (never NaN). Processing accuracy counts timeouts (speed errors) as errors.
 */
export interface ScoringResult {
  /** Test recall rows. 0 if none. */
  n_trials: number;
  /** Memory items presented in the test, summed over trials. 0 if none. */
  total_items: number;
  /** Partial-credit load (Engle-lab "partial score"): memory items recalled in the correct position, summed over trials. 0 if none. */
  partial_credit_load: number;
  /** Partial-credit unit (Conway et al. 2005): mean over trials of the proportion of memory items correct. null if no trials. Recommended primary DV. */
  partial_credit_unit: number | null;
  /** Absolute score (all-or-nothing load): summed set sizes of the perfectly recalled trials. 0 if none. */
  absolute_score: number;
  /** Trials recalled perfectly. 0 if none. */
  n_perfect_trials: number;
  /** All-or-nothing unit: proportion of trials recalled perfectly. null if no trials. */
  all_or_nothing_unit: number | null;
  /** Processing problems in the test (every episode, including timeouts). 0 if none. */
  n_processing: number;
  /** Wrong verifications. 0 if none. */
  accuracy_errors: number;
  /** Deadline misses. 0 if none. */
  speed_errors: number;
  /** Speed plus accuracy errors. 0 if none. */
  processing_errors: number;
  /** Proportion of processing problems solved correctly and in time. null if none. */
  processing_accuracy: number | null;
  /** Mean RT (ms) of the timed processing response on correct problems. null if none. */
  mean_processing_rt: number | null;
}

export function calculateScores(data: DataCollection): ScoringResult {
  const recall = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
  const proc = data.filter({ task: TASK_NAME, phase: "test", part: "processing" });
  const n = recall.count();
  const sumOf = (col: DataCollection, field: string) =>
    col.count() > 0 ? col.select(field).sum() : 0;
  const totalItems = sumOf(recall, "set_size");
  const load = sumOf(recall, "n_correct_positions");
  const perfect = recall.filter({ correct: true });
  const nProc = proc.count();
  const nCorrect = proc.filter({ correct: true }).count();
  const speed = proc.filter({ timeout: true }).count();
  const rts = proc.filter({ correct: true }).filterCustom((r: any) => typeof r.rt === "number");
  return {
    n_trials: n,
    total_items: totalItems,
    partial_credit_load: load,
    partial_credit_unit: n > 0 ? sumOf(recall, "proportion_correct") / n : null,
    absolute_score: sumOf(perfect, "set_size"),
    n_perfect_trials: perfect.count(),
    all_or_nothing_unit: n > 0 ? perfect.count() / n : null,
    n_processing: nProc,
    accuracy_errors: nProc - nCorrect - speed,
    speed_errors: speed,
    processing_errors: nProc - nCorrect,
    processing_accuracy: nProc > 0 ? nCorrect / nProc : null,
    mean_processing_rt: rts.count() > 0 ? rts.select("rt").mean() : null,
  };
}

export function getSummary(
  data: DataCollection
): ScoringResult & { task: string; version: string } {
  return { ...calculateScores(data), task: TASK_NAME, version: VERSION };
}
