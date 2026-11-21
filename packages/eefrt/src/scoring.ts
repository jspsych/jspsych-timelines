/**
 * Scoring. There is no correct choice in this task, so §4's `correct` has no counterpart: the measures
 * are the proportion of hard-task choices (over free choices, by probability and by reward level) and
 * completion of the chosen task. No participant is judged or excluded here; the documentation names the
 * literature's usual exclusions as analysis guidance (PACKAGE-STANDARD §2).
 *
 * Empty data: counts are 0, proportions, rates and means are `null`, never NaN.
 */
import type { DataCollection } from "jspsych";

import { FIRST_N_TRIALS, REWARD_BINS, TASK_NAME } from "./constants";

export type RewardBin = (typeof REWARD_BINS)[number];

export interface ProportionBy {
  /** number of free (not randomly assigned) choices in the group */
  n_valid_choices: number;
  proportion_hard: number | null;
}

export interface ScoringResult {
  /** test trials (rows of `part: "response"`) */
  n_trials: number;
  /** trials whose task was assigned at random after no choice in time (`choice_forced`) */
  n_forced: number;
  /** trials with a free choice */
  n_valid_choices: number;
  n_hard_chosen: number;
  /** hard choices / free choices (null with no free choice) */
  proportion_hard: number | null;
  /** the same over the first `first_n` trials (S007 and S034 analyse the first 50) */
  proportion_hard_first_n: number | null;
  first_n: number;
  proportion_hard_by_probability: Array<{ probability: number } & ProportionBy>;
  /** low, mid and high thirds of the range of hard rewards offered in the test */
  proportion_hard_by_reward_bin: Array<{ bin: RewardBin; min: number; max: number } & ProportionBy>;
  proportion_hard_by_probability_and_reward_bin: Array<
    { probability: number; bin: RewardBin } & ProportionBy
  >;
  /** mean of probability x reward of the chosen task over free choices (null with none) */
  mean_expected_value_chosen: number | null;
  /** tasks actually done (chosen or assigned) and how many were completed */
  n_easy_tasks: number;
  n_hard_tasks: number;
  n_completed: number;
  completion_rate: number | null;
  completion_rate_easy: number | null;
  completion_rate_hard: number | null;
  /** presses per second of the effort phase, over tasks of that kind (null with none) */
  mean_press_rate_easy: number | null;
  mean_press_rate_hard: number | null;
  /** trials won: the task was completed and the trial was a win trial */
  n_wins: number;
  /** sum of the rewards won in the test */
  total_reward: number;
  /** earnings under the payout rule (null when it cannot be worked out from the data given) */
  payout: number | null;
  payout_rule: string | null;
}

export interface ScoreOptions {
  /** the paid trials (their `trial_index_in_block`), for `two_random_win_trials_paid`; default: read from the completion row */
  paid_trials?: number[];
  /** default: read from the completion row */
  payout_rule?: string;
  /** window of the first-n measure (default 50) */
  first_n?: number;
}

const ratio = (a: number, b: number) => (b > 0 ? a / b : null);

/** Which third of [min, max] a hard reward falls in. */
export function rewardBin(value: number, min: number, max: number): RewardBin {
  if (!(max > min)) return "low";
  const third = (max - min) / 3;
  return value < min + third ? "low" : value < min + 2 * third ? "mid" : "high";
}

export function payoutFor(
  rule: string | null | undefined,
  rows: any[],
  paid: number[] | undefined
): number | null {
  if (!rule) return null;
  const total = rows.reduce((a, r) => a + (r.reward_won ?? 0), 0);
  if (rule === "percent_of_total_5") return Math.round(total * 5) / 100;
  if (rule === "percent_of_total_10") return Math.round(total * 10) / 100;
  if (rule === "two_random_win_trials_paid") {
    if (paid === undefined) return null;
    return paid.reduce(
      (a, i) => a + (rows.find((r) => r.trial_index_in_block === i)?.reward_won ?? 0),
      0
    );
  }
  return null;
}

/** Scores of the test phase. */
export function calculateScores(data: DataCollection, options: ScoreOptions = {}): ScoringResult {
  const first_n = options.first_n ?? FIRST_N_TRIALS;
  const trials = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
  const rows = trials.values() as any[];
  const free = trials.filterCustom((r: any) => r.choice === "easy" || r.choice === "hard");
  const hard = (c: DataCollection) => c.filter({ choice: "hard" }).count();
  const prop = (c: DataCollection): ProportionBy => ({
    n_valid_choices: c.count(),
    proportion_hard: ratio(hard(c), c.count()),
  });

  const probabilities = [...new Set(rows.map((r) => r.win_probability as number))].sort(
    (a, b) => a - b
  );
  const rewards = rows.map((r) => r.hard_reward as number);
  const lo = rewards.length ? Math.min(...rewards) : 0;
  const hi = rewards.length ? Math.max(...rewards) : 0;
  const third = (hi - lo) / 3;
  const inBin = (bin: RewardBin) => (r: any) => rewardBin(r.hard_reward, lo, hi) === bin;
  const binRange = (bin: RewardBin) => {
    const i = REWARD_BINS.indexOf(bin);
    return { min: lo + i * third, max: i === 2 ? hi : lo + (i + 1) * third };
  };

  const done = (task: "easy" | "hard") => trials.filter({ chosen_task: task });
  const completionRate = (c: DataCollection) =>
    ratio(c.filter({ completed: true }).count(), c.count());
  const pressRate = (c: DataCollection) => {
    const usable = c.filterCustom((r: any) => r.task_duration_ms > 0);
    if (usable.count() === 0) return null;
    return usable.select("press_count").sum() / (usable.select("task_duration_ms").sum() / 1000);
  };

  const completion = data.filter({ task: TASK_NAME, part: "completion" }).values()[0] as any;
  const rule = options.payout_rule ?? completion?.payout_rule ?? null;
  const paid = options.paid_trials ?? completion?.paid_trials;
  const chosenEv = free
    .values()
    .map((r: any) => r.win_probability * (r.choice === "hard" ? r.hard_reward : r.easy_reward));
  const firstN = free.filterCustom((r: any) => r.trial_index_in_block <= first_n);

  return {
    n_trials: trials.count(),
    n_forced: trials.filter({ choice_forced: true }).count(),
    n_valid_choices: free.count(),
    n_hard_chosen: hard(free),
    proportion_hard: ratio(hard(free), free.count()),
    proportion_hard_first_n: ratio(hard(firstN), firstN.count()),
    first_n,
    proportion_hard_by_probability: probabilities.map((p) => ({
      probability: p,
      ...prop(free.filter({ win_probability: p })),
    })),
    proportion_hard_by_reward_bin: REWARD_BINS.map((bin) => ({
      bin,
      ...binRange(bin),
      ...prop(free.filterCustom(inBin(bin))),
    })),
    proportion_hard_by_probability_and_reward_bin: probabilities.flatMap((p) =>
      REWARD_BINS.map((bin) => ({
        probability: p,
        bin,
        ...prop(free.filter({ win_probability: p }).filterCustom(inBin(bin))),
      }))
    ),
    mean_expected_value_chosen: chosenEv.length
      ? chosenEv.reduce((a: number, b: number) => a + b, 0) / chosenEv.length
      : null,
    n_easy_tasks: done("easy").count(),
    n_hard_tasks: done("hard").count(),
    n_completed: trials.filter({ completed: true }).count(),
    completion_rate: completionRate(trials),
    completion_rate_easy: completionRate(done("easy")),
    completion_rate_hard: completionRate(done("hard")),
    mean_press_rate_easy: pressRate(done("easy")),
    mean_press_rate_hard: pressRate(done("hard")),
    n_wins: trials.filterCustom((r: any) => r.reward_won > 0).count(),
    total_reward: Math.round(rows.reduce((a, r) => a + (r.reward_won ?? 0), 0) * 100) / 100,
    payout: payoutFor(rule, rows, paid),
    payout_rule: rule,
  };
}

/** A short summary: the headline measures only. */
export function getSummary(data: DataCollection, options: ScoreOptions = {}) {
  const s = calculateScores(data, options);
  return {
    n_trials: s.n_trials,
    proportion_hard: s.proportion_hard,
    proportion_hard_first_n: s.proportion_hard_first_n,
    completion_rate: s.completion_rate,
    completion_rate_hard: s.completion_rate_hard,
    total_reward: s.total_reward,
    payout: s.payout,
  };
}
