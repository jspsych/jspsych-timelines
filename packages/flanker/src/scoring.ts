import type { DataCollection } from "jspsych";

import { TASK_NAME, VERSION } from "./constants";

/**
 * Scores from the test phase. Empty-data values: counts are 0, every mean, rate and difference is null
 * (never NaN). Accuracy counts timeouts as errors; RTs use correct, non-nogo trials only.
 */
export interface ScoringResult {
  /** Test response rows (all conditions). 0 if none. */
  n_trials: number;
  /** Correct test responses. 0 if none. */
  n_correct: number;
  /** Test trials with no response before the window ended. 0 if none. */
  n_timeouts: number;
  /** Proportion correct over all test trials. null if no trials. */
  accuracy: number | null;
  /** Mean RT (ms) of correct responses. null if none. */
  mean_rt: number | null;
  congruent_accuracy: number | null;
  incongruent_accuracy: number | null;
  neutral_accuracy: number | null;
  nogo_accuracy: number | null;
  congruent_rt: number | null;
  incongruent_rt: number | null;
  neutral_rt: number | null;
  /** Mean correct RT incongruent minus congruent (ms). null unless both exist. Primary DV. */
  flanker_effect_rt: number | null;
  /** Error rate incongruent minus congruent. null unless both exist. Primary DV. */
  flanker_effect_errors: number | null;
}

export function calculateScores(data: DataCollection): ScoringResult {
  const test = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
  const meanOrNull = (col: DataCollection, field: string): number | null => {
    const sel = col.select(field);
    return sel.count() > 0 ? sel.mean() : null;
  };
  const accuracyOf = (col: DataCollection): number | null =>
    col.count() > 0 ? col.filter({ correct: true }).count() / col.count() : null;
  const byCongruency = (congruency: string) => test.filter({ congruency });
  const rtOf = (congruency: string) =>
    meanOrNull(byCongruency(congruency).filter({ correct: true }), "rt");

  const n = test.count();
  const congruentAcc = accuracyOf(byCongruency("congruent"));
  const incongruentAcc = accuracyOf(byCongruency("incongruent"));
  const congruentRt = rtOf("congruent");
  const incongruentRt = rtOf("incongruent");
  const rtCorrect = test
    .filter({ correct: true })
    .filterCustom((t: any) => t.congruency !== "nogo");

  return {
    n_trials: n,
    n_correct: test.filter({ correct: true }).count(),
    n_timeouts: test.filter({ timeout: true }).count(),
    accuracy: accuracyOf(test),
    mean_rt: meanOrNull(rtCorrect, "rt"),
    congruent_accuracy: congruentAcc,
    incongruent_accuracy: incongruentAcc,
    neutral_accuracy: accuracyOf(byCongruency("neutral")),
    nogo_accuracy: accuracyOf(byCongruency("nogo")),
    congruent_rt: congruentRt,
    incongruent_rt: incongruentRt,
    neutral_rt: rtOf("neutral"),
    flanker_effect_rt:
      congruentRt !== null && incongruentRt !== null ? incongruentRt - congruentRt : null,
    flanker_effect_errors:
      congruentAcc !== null && incongruentAcc !== null ? congruentAcc - incongruentAcc : null,
  };
}

export function getSummary(
  data: DataCollection
): ScoringResult & { task: string; version: string } {
  return { ...calculateScores(data), task: TASK_NAME, version: VERSION };
}
