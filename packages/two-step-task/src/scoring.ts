import type { DataCollection } from "jspsych";

import { TASK_NAME, VERSION } from "./constants";

/**
 * One trial of the main task (or of practice), joined from its rows. A task trial has two choices, so
 * its data is in a `choice` row for each stage and in one `response` row for the trial; this is the
 * response row.
 */
export interface TrialRecord {
  block: number | null;
  trial_index_in_block: number | null;
  attempt: number;
  stage1_choice: "A" | "B" | null;
  stage1_rt: number | null;
  stage2_state: "red" | "blue" | null;
  transition: "common" | "rare" | null;
  stage2_choice: "option_1" | "option_2" | null;
  stage2_rt: number | null;
  reward: 0 | 1 | null;
  reward_probs: Record<string, Record<string, number>> | null;
  missed: boolean;
  missed_stage: 1 | 2 | null;
}

/**
 * Scores from the test phase. Empty-data values: counts are 0, every mean, rate and index is null
 * (never NaN). Nothing here excludes a participant or a trial for how they performed; the counts
 * (`n_missed`, ...) are for the analyst's own criteria.
 */
export interface ScoringResult {
  /** Test response rows, one per trial attempt (a repeated trial counts once per attempt). 0 if none. */
  n_trials: number;
  /** Trials in which both choices were made. 0 if none. */
  n_completed: number;
  /** Trials with a missed choice (either stage). 0 if none. */
  n_missed: number;
  n_missed_stage_1: number;
  n_missed_stage_2: number;
  /** Coins earned (sum of `reward` over completed trials). 0 if none. */
  total_reward: number;
  /** Mean reward per completed trial. null if none. */
  reward_rate: number | null;
  /** Share of common transitions among the trials in which one occurred. null if none. */
  common_transition_rate: number | null;
  /** Mean RT of first-stage choices, ms. null if none. */
  stage1_mean_rt: number | null;
  /** Mean RT of second-stage choices, ms. null if none. */
  stage2_mean_rt: number | null;
  /** Share of second-stage choices of the option with the higher current reward probability (ties left out). null if none. */
  stage2_best_option_rate: number | null;
  /** Pairs of consecutive trials (same block, no missed choice in either) that the stay measures use. 0 if none. */
  n_stay_pairs: number;
  /** Probability of repeating the first-stage choice on the next trial, over all pairs. null if none. */
  stay_probability: number | null;
  /** Stay probability after a rewarded trial with a common transition. null if there is no such pair. */
  stay_common_rewarded: number | null;
  stay_common_unrewarded: number | null;
  stay_rare_rewarded: number | null;
  stay_rare_unrewarded: number | null;
  /** Number of pairs behind each of the four stay probabilities. */
  n_stay_common_rewarded: number;
  n_stay_common_unrewarded: number;
  n_stay_rare_rewarded: number;
  n_stay_rare_unrewarded: number;
  /**
   * Model-free index: the effect of the previous reward on staying, (stay | rewarded) minus (stay | unrewarded),
   * averaged over the two transitions. null unless all four cells have pairs.
   */
  mf_index: number | null;
  /**
   * Model-based index: the reward by transition interaction on staying,
   * ((common rewarded - common unrewarded) - (rare rewarded - rare unrewarded)) / 2. Positive when the
   * participant uses the transition structure. null unless all four cells have pairs.
   */
  mb_index: number | null;
  /** Mean second-stage RT after rare minus after common transitions, ms (the RT index of Shahar et al., 2019). null unless both exist. */
  mb_rt_index: number | null;
}

/** One record per `response` row of `phase`, in the order they were recorded. */
export function trialTable(
  data: DataCollection,
  phase: "practice" | "test" = "test"
): TrialRecord[] {
  return data
    .filter({ task: TASK_NAME, phase, part: "response" })
    .values()
    .map((r: any) => ({
      block: r.block ?? null,
      trial_index_in_block: r.trial_index_in_block ?? null,
      attempt: r.attempt ?? 1,
      stage1_choice: r.stage1_choice ?? null,
      stage1_rt: r.stage1_rt ?? null,
      stage2_state: r.stage2_state ?? null,
      transition: r.transition ?? null,
      stage2_choice: r.stage2_choice ?? null,
      stage2_rt: r.stage2_rt ?? null,
      reward: r.reward ?? null,
      reward_probs: r.reward_probs ?? null,
      missed: r.missed === true,
      missed_stage: r.missed_stage ?? null,
    }));
}

/** Mean of derived 0/1 indicators (the stay measures); column means use DataColumn.mean() instead. */
const mean = (xs: number[]): number | null =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;

/** Mean of a column over the rows that pass `keep` and have a value in `field`; null if none. */
function columnMean(
  rows: DataCollection,
  field: string,
  keep: (r: any) => boolean = () => true
): number | null {
  const col = rows.filterCustom((r: any) => keep(r) && typeof r[field] === "number").select(field);
  return col.count() > 0 ? col.mean() : null;
}

/** The best option of a state by its current reward probability, or null when they are equal. */
function bestOption(probs: Record<string, number> | undefined): string | null {
  if (!probs || probs.option_1 === probs.option_2) return null;
  return probs.option_1 > probs.option_2 ? "option_1" : "option_2";
}

export function calculateScores(data: DataCollection): ScoringResult {
  const trials = trialTable(data, "test");
  const done = trials.filter((t) => !t.missed);

  // stay pairs: consecutive records of the same block, neither with a missed choice
  const cells = {
    common_rewarded: [] as number[],
    common_unrewarded: [] as number[],
    rare_rewarded: [] as number[],
    rare_unrewarded: [] as number[],
  };
  const all: number[] = [];
  for (let i = 0; i + 1 < trials.length; i++) {
    const a = trials[i];
    const b = trials[i + 1];
    if (a.missed || b.missed || a.block !== b.block) continue;
    if (!a.stage1_choice || !b.stage1_choice || a.transition === null || a.reward === null)
      continue;
    const stay = a.stage1_choice === b.stage1_choice ? 1 : 0;
    all.push(stay);
    cells[`${a.transition}_${a.reward ? "rewarded" : "unrewarded"}` as keyof typeof cells].push(
      stay
    );
  }
  const cell = (k: keyof typeof cells) => mean(cells[k]);
  const cr = cell("common_rewarded");
  const cu = cell("common_unrewarded");
  const rr = cell("rare_rewarded");
  const ru = cell("rare_unrewarded");
  const full = cr !== null && cu !== null && rr !== null && ru !== null;

  const rows = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
  const completed = (r: any) => r.missed !== true;
  const rtAfter = (kind: "common" | "rare") =>
    columnMean(rows, "stage2_rt", (r) => completed(r) && r.transition === kind);
  const rtRare = rtAfter("rare");
  const rtCommon = rtAfter("common");

  const withTransition = trials.filter((t) => t.transition !== null);
  const judged = done
    .map((t) => ({ best: bestOption(t.reward_probs?.[t.stage2_state ?? ""]), t }))
    .filter((x) => x.best !== null);

  return {
    n_trials: trials.length,
    n_completed: done.length,
    n_missed: trials.length - done.length,
    n_missed_stage_1: trials.filter((t) => t.missed_stage === 1).length,
    n_missed_stage_2: trials.filter((t) => t.missed_stage === 2).length,
    total_reward: done.filter((t) => t.reward === 1).length,
    reward_rate: columnMean(rows, "reward", completed),
    common_transition_rate: withTransition.length
      ? withTransition.filter((t) => t.transition === "common").length / withTransition.length
      : null,
    stage1_mean_rt: columnMean(rows, "stage1_rt"),
    stage2_mean_rt: columnMean(rows, "stage2_rt", completed),
    stage2_best_option_rate: judged.length
      ? judged.filter((x) => x.t.stage2_choice === x.best).length / judged.length
      : null,
    n_stay_pairs: all.length,
    stay_probability: mean(all),
    stay_common_rewarded: cr,
    stay_common_unrewarded: cu,
    stay_rare_rewarded: rr,
    stay_rare_unrewarded: ru,
    n_stay_common_rewarded: cells.common_rewarded.length,
    n_stay_common_unrewarded: cells.common_unrewarded.length,
    n_stay_rare_rewarded: cells.rare_rewarded.length,
    n_stay_rare_unrewarded: cells.rare_unrewarded.length,
    mf_index: full ? (cr! + rr! - cu! - ru!) / 2 : null,
    mb_index: full ? (cr! - cu! - rr! + ru!) / 2 : null,
    mb_rt_index: rtRare !== null && rtCommon !== null ? rtRare - rtCommon : null,
  };
}

export function getSummary(
  data: DataCollection
): ScoringResult & { task: string; version: string } {
  return { ...calculateScores(data), task: TASK_NAME, version: VERSION };
}
