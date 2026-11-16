import type { DataCollection } from "jspsych";

import { CHECK_LIMITS, TASK_NAME, VERSION } from "./constants";

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
  /** The usual checks of a stop-signal session (see CHECK_LIMITS); null where the measure is missing. */
  checks: {
    /** p(respond | signal) between 0.25 and 0.75 */
    stop_accuracy_ok: boolean | null;
    /** mean failed-stop RT faster than mean go RT: the race model's independence assumption holds on average */
    race_model_ok: boolean | null;
    /** go omissions at most 25 % */
    go_omissions_ok: boolean | null;
    /** go choice errors at most 10 % */
    go_choice_errors_ok: boolean | null;
    /** at least 50 stop trials (fewer make SSRT unreliable) */
    enough_stop_trials: boolean;
  };
}

const mean = (xs: number[]): number | null =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;

const median = (xs: number[]): number | null => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

interface Row {
  trial_type: "go" | "stop";
  correct: boolean;
  rt: number | null;
  response: unknown;
  ssd: number | null;
  block: number;
}

const toRows = (col: DataCollection): Row[] =>
  col.values().map((t: any) => ({
    trial_type: t.condition,
    correct: t.correct === true,
    rt: typeof t.rt === "number" ? t.rt : null,
    response: t.response,
    ssd: typeof t.ssd === "number" ? t.ssd : null,
    block: t.block,
  }));

/**
 * The integration method on one set of rows. Go RTs include choice errors; omissions take the maximum go RT.
 * Returns null when it is undefined (no stop trials, no go RTs, or no responses on stop trials).
 */
export function integrationSsrt(rows: Row[]): number | null {
  const go = rows.filter((r) => r.trial_type === "go");
  const stop = rows.filter((r) => r.trial_type === "stop");
  if (!go.length || !stop.length) return null;
  const rts = go.filter((r) => r.rt !== null).map((r) => r.rt as number);
  if (!rts.length) return null;
  const max = Math.max(...rts);
  const all = go.map((r) => (r.rt !== null ? r.rt : max)).sort((a, b) => a - b);
  const p = stop.filter((r) => r.rt !== null || r.response !== null).length / stop.length;
  if (p === 0) return null;
  const nth = Math.min(all.length, Math.max(1, Math.ceil(p * all.length)));
  const ssd = mean(stop.filter((r) => r.ssd !== null).map((r) => r.ssd as number));
  if (ssd === null) return null;
  return all[nth - 1] - ssd;
}

/** Scores for one phase's rows (the package scores the test phase). */
export function scoreRows(rows: Row[]): ScoringResult {
  const go = rows.filter((r) => r.trial_type === "go");
  const stop = rows.filter((r) => r.trial_type === "stop");
  const responded = (r: Row) => r.rt !== null || r.response !== null;
  const goCorrect = go.filter((r) => r.correct);
  const goOmissions = go.filter((r) => !responded(r));
  const goErrors = go.filter((r) => responded(r) && !r.correct);
  const failed = stop.filter(responded);
  const pRespond = stop.length ? failed.length / stop.length : null;
  const meanGoRt = mean(goCorrect.filter((r) => r.rt !== null).map((r) => r.rt as number));
  const meanSsd = mean(stop.filter((r) => r.ssd !== null).map((r) => r.ssd as number));
  const failedRt = mean(failed.filter((r) => r.rt !== null).map((r) => r.rt as number));
  const allGoRt = mean(go.filter((r) => r.rt !== null).map((r) => r.rt as number));

  const blocks = [...new Set(stop.map((r) => r.block))];
  const perBlock = blocks
    .map((b) => integrationSsrt(rows.filter((r) => r.block === b)))
    .filter((x): x is number => x !== null);

  const goOmissionRate = go.length ? goOmissions.length / go.length : null;
  const goChoiceRate = go.length ? goErrors.length / go.length : null;
  const [lo, hi] = CHECK_LIMITS.p_respond_signal;
  return {
    n_trials: rows.length,
    n_go_trials: go.length,
    n_stop_trials: stop.length,
    go_accuracy: go.length ? goCorrect.length / go.length : null,
    go_omission_rate: goOmissionRate,
    go_choice_error_rate: goChoiceRate,
    mean_go_rt: meanGoRt,
    median_go_rt: median(goCorrect.filter((r) => r.rt !== null).map((r) => r.rt as number)),
    p_respond_signal: pRespond,
    stop_accuracy: pRespond === null ? null : 1 - pRespond,
    mean_ssd: meanSsd,
    failed_stop_rt: failedRt,
    ssrt_integration: integrationSsrt(rows),
    ssrt_integration_blockwise: perBlock.length ? mean(perBlock) : null,
    ssrt_mean: allGoRt !== null && meanSsd !== null ? allGoRt - meanSsd : null,
    checks: {
      stop_accuracy_ok: pRespond === null ? null : pRespond >= lo && pRespond <= hi,
      race_model_ok: failedRt !== null && allGoRt !== null ? failedRt < allGoRt : null,
      go_omissions_ok:
        goOmissionRate === null ? null : goOmissionRate <= CHECK_LIMITS.go_omission_rate_max,
      go_choice_errors_ok:
        goChoiceRate === null ? null : goChoiceRate <= CHECK_LIMITS.go_choice_error_rate_max,
      enough_stop_trials: stop.length >= CHECK_LIMITS.min_stop_trials,
    },
  };
}

export function calculateScores(data: DataCollection): ScoringResult {
  const test = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
  return scoreRows(toRows(test));
}

export function getSummary(
  data: DataCollection
): ScoringResult & { task: string; version: string } {
  return { ...calculateScores(data), task: TASK_NAME, version: VERSION };
}
