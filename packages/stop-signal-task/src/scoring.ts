import type { DataCollection } from "jspsych";

import { TASK_NAME, VERSION } from "./constants";

/**
 * Scores from the test phase, kept local to the package (PACKAGE-STANDARD §11: SSRT is specific to this task).
 *
 * Empty-data values: counts are 0, every mean, rate and difference is null (never NaN).
 * RTs are measured from go onset. A "failed stop" is any response on a stop trial, including one before
 * the signal appeared.
 */
export interface ScoringResult {
  /** Test response rows (go and stop). 0 if none. */
  n_trials: number;
  n_go_trials: number;
  n_stop_trials: number;
  /** Proportion of go trials with the correct key. null if no go trials. */
  go_accuracy: number | null;
  /** Proportion of go trials without a response. null if no go trials. */
  go_omission_rate: number | null;
  /** Proportion of go trials with the wrong key. null if no go trials. */
  go_choice_error_rate: number | null;
  /** Mean RT (ms) of correct go responses. null if none. */
  mean_go_rt: number | null;
  /** Median RT (ms) of correct go responses. null if none. */
  median_go_rt: number | null;
  /** p(respond | signal): the proportion of stop trials with a response. null if no stop trials. */
  p_respond_signal: number | null;
  /** 1 - p_respond_signal: successful stops. null if no stop trials. */
  stop_accuracy: number | null;
  /** Mean requested stop-signal delay over stop trials, ms. null if none. */
  mean_ssd: number | null;
  /** Mean RT of responses on stop trials (failed stops), ms. null if none. */
  failed_stop_rt: number | null;
  /**
   * SSRT, integration method with replacement of go omissions (Verbruggen et al., 2019, S001; recommended): the nth go RT minus mean SSD,
   * n = p(respond | signal) x number of go trials, over all go RTs (choice errors included) with omissions set to the maximum go RT.
   * null if there are no stop trials, no go responses, or p(respond | signal) is 0 (undefined).
   */
  ssrt_integration: number | null;
  /** The same, per block and then averaged over the blocks that have stop trials (S079; avoids bias from slowing across blocks). */
  ssrt_integration_blockwise: number | null;
  /** SSRT, mean method: mean go RT (responses only) minus mean SSD. Biased by skewed RTs (S001, S027). null if either is missing. */
  ssrt_mean: number | null;
}

const isNum = (x: unknown): x is number => typeof x === "number";
const hasRt = (t: any) => isNum(t.rt);
/** A response of any kind: a key, or a button index (which can be 0). */
const responded = (t: any) => isNum(t.rt) || (t.response !== null && t.response !== undefined);

/** Mean of a field over a collection, through DataColumn (PACKAGE-STANDARD §3); null for no values, never NaN. */
const meanOf = (c: DataCollection, field: string): number | null => {
  const col = c.select(field);
  return col.count() ? col.mean() : null;
};

/**
 * The integration method on a collection of response rows (go and stop). Go RTs include choice errors;
 * omissions take the maximum go RT; the nth RT is picked from the sorted, replaced distribution (this
 * step is the method itself and stays local). Returns null when it is undefined: no stop trials, no go RTs,
 * or no responses on stop trials.
 */
export function integrationSsrt(rows: DataCollection): number | null {
  const go = rows.filter({ condition: "go" });
  const stop = rows.filter({ condition: "stop" });
  if (!go.count() || !stop.count()) return null;
  const rts = go.filterCustom(hasRt).select("rt");
  if (!rts.count()) return null;
  const max = rts.max();
  const all = go
    .values()
    .map((t: any) => (isNum(t.rt) ? t.rt : max))
    .sort((a: number, b: number) => a - b);
  const p = stop.filterCustom(responded).count() / stop.count();
  if (p === 0) return null;
  const nth = Math.min(all.length, Math.max(1, Math.ceil(p * all.length)));
  const ssd = meanOf(
    stop.filterCustom((t: any) => isNum(t.ssd)),
    "ssd"
  );
  if (ssd === null) return null;
  return all[nth - 1] - ssd;
}

/** Scores for one phase's response rows (the package scores the test phase). */
export function scoreRows(rows: DataCollection): ScoringResult {
  const go = rows.filter({ condition: "go" });
  const stop = rows.filter({ condition: "stop" });
  const nGo = go.count();
  const nStop = stop.count();
  const goCorrect = go.filter({ correct: true });
  const goOmissions = go.filterCustom((t: any) => !responded(t)).count();
  const goErrors = go.filterCustom((t: any) => responded(t) && t.correct !== true).count();
  const failed = stop.filterCustom(responded);
  const pRespond = nStop ? failed.count() / nStop : null;
  const goCorrectRt = goCorrect.filterCustom(hasRt).select("rt");
  const meanGoRt = goCorrectRt.count() ? goCorrectRt.mean() : null;
  const meanSsd = meanOf(
    stop.filterCustom((t: any) => isNum(t.ssd)),
    "ssd"
  );
  const failedRt = meanOf(failed.filterCustom(hasRt), "rt");
  const allGoRt = meanOf(go.filterCustom(hasRt), "rt");

  // blockwise: one estimate per block that has stop trials, then their average (a handful of numbers, summed here)
  const blocks = [...new Set(stop.select("block").values)];
  const perBlock = blocks
    .map((b) => integrationSsrt(rows.filter({ block: b })))
    .filter((x): x is number => x !== null);

  const goOmissionRate = nGo ? goOmissions / nGo : null;
  const goChoiceRate = nGo ? goErrors / nGo : null;
  return {
    n_trials: rows.count(),
    n_go_trials: nGo,
    n_stop_trials: nStop,
    go_accuracy: nGo ? goCorrect.count() / nGo : null,
    go_omission_rate: goOmissionRate,
    go_choice_error_rate: goChoiceRate,
    mean_go_rt: meanGoRt,
    median_go_rt: goCorrectRt.count() ? goCorrectRt.median() : null,
    p_respond_signal: pRespond,
    stop_accuracy: pRespond === null ? null : 1 - pRespond,
    mean_ssd: meanSsd,
    failed_stop_rt: failedRt,
    ssrt_integration: integrationSsrt(rows),
    ssrt_integration_blockwise: perBlock.length
      ? perBlock.reduce((a, b) => a + b, 0) / perBlock.length
      : null,
    ssrt_mean: allGoRt !== null && meanSsd !== null ? allGoRt - meanSsd : null,
  };
}

export function calculateScores(data: DataCollection): ScoringResult {
  return scoreRows(data.filter({ task: TASK_NAME, phase: "test", part: "response" }));
}

export function getSummary(
  data: DataCollection
): ScoringResult & { task: string; version: string } {
  return { ...calculateScores(data), task: TASK_NAME, version: VERSION };
}
