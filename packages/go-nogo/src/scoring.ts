import type { DataCollection } from "jspsych";
import { probit } from "simple-statistics";

import { TASK_NAME, VERSION } from "./constants";

export interface BlockScore {
  block: number;
  n_trials: number;
  commission_error_rate: number | null;
  omission_error_rate: number | null;
  mean_correct_go_rt: number | null;
}

/**
 * Scores from the test phase (go and no-go trials; go-only baseline trials, `condition: "go_control"`, are
 * scored separately). Empty-data values: counts are 0, every mean, rate, SD and d' is null (never NaN).
 * A hit is a response to a go trial, an omission a go trial without a response, a commission error (false
 * alarm) a response to a no-go trial, a correct rejection a no-go trial without one.
 */
export interface ScoringResult {
  /** Test trials with a go or no-go stimulus. 0 if none. */
  n_trials: number;
  n_go: number;
  n_nogo: number;
  hits: number;
  omissions: number;
  commissions: number;
  correct_rejections: number;
  /** Proportion of no-go trials with a response. null if no no-go trials. Primary DV. */
  commission_error_rate: number | null;
  /** Proportion of go trials without a response. null if no go trials. Primary DV. */
  omission_error_rate: number | null;
  /** Proportion of no-go trials without a response (1 - commission_error_rate). null if no no-go trials. */
  nogo_accuracy: number | null;
  /** Proportion of all go and no-go trials answered correctly. null if no trials. */
  accuracy: number | null;
  /** Mean RT (ms) of correct go responses. null if none. Primary DV. */
  mean_correct_go_rt: number | null;
  /** SD of the RTs of correct go responses. null if fewer than 2. */
  go_rt_sd: number | null;
  /** Mean RT (ms) of commission errors (responses to no-go trials). null if none. */
  false_alarm_rt: number | null;
  /** d' = z(hit rate) - z(false alarm rate), with the extreme-rate correction below. null unless both trial types exist. */
  d_prime: number | null;
  /** Criterion c = -(z(hit rate) + z(false alarm rate)) / 2. null unless both trial types exist. Positive: conservative (fewer responses). */
  criterion_c: number | null;
  /**
   * Rates of exactly 0 or 1 are replaced by 1/(2n) and 1 - 1/(2n) (n = number of go or no-go trials), the
   * Macmillan and Kaplan (1985) adjustment, before z-transformation. Other rates are left alone.
   */
  d_prime_correction: "macmillan_kaplan";
  /** Go-only baseline trials (`single_task_blocks`). 0 if none. */
  baseline_n_trials: number;
  /** Mean RT (ms) of responses in go-only baseline blocks. null if none. */
  baseline_mean_rt: number | null;
  /** The same rates and mean RT per test block (the errors-and-RT-by-block measure). */
  by_block: BlockScore[];
}

function adjust(rate: number, n: number): number {
  if (rate <= 0) return 1 / (2 * n);
  if (rate >= 1) return 1 - 1 / (2 * n);
  return rate;
}

export function calculateScores(data: DataCollection): ScoringResult {
  const test = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
  const go = test.filter({ condition: "go" });
  const nogo = test.filter({ condition: "nogo" });
  const baseline = test.filter({ condition: "go_control" });
  const meanOrNull = (col: DataCollection): number | null =>
    col.count() > 0 ? (col.select("rt").mean() as number) : null;

  const rates = (g: DataCollection, n: DataCollection) => {
    const hits = g.filter({ responded: true });
    const commissions = n.filter({ responded: true });
    return {
      hits,
      commissions,
      commission_error_rate: n.count() > 0 ? commissions.count() / n.count() : null,
      omission_error_rate: g.count() > 0 ? (g.count() - hits.count()) / g.count() : null,
      mean_correct_go_rt: meanOrNull(hits),
    };
  };
  const r = rates(go, nogo);
  const nGo = go.count();
  const nNogo = nogo.count();
  const hitRate = nGo > 0 ? r.hits.count() / nGo : null;
  const faRate = nNogo > 0 ? r.commissions.count() / nNogo : null;
  let dPrime: number | null = null;
  let criterion: number | null = null;
  if (hitRate !== null && faRate !== null) {
    const zh = probit(adjust(hitRate, nGo));
    const zf = probit(adjust(faRate, nNogo));
    dPrime = zh - zf;
    criterion = -(zh + zf) / 2;
  }
  const n = nGo + nNogo;
  const baselineResponded = baseline.filter({ responded: true });

  const blocks = Array.from(
    new Set(
      test
        .filterCustom((t: any) => t.condition === "go" || t.condition === "nogo")
        .select("block")
        .values.filter((b: unknown) => typeof b === "number") as number[]
    )
  ).sort((a, b) => a - b);

  return {
    n_trials: n,
    n_go: nGo,
    n_nogo: nNogo,
    hits: r.hits.count(),
    omissions: nGo - r.hits.count(),
    commissions: r.commissions.count(),
    correct_rejections: nNogo - r.commissions.count(),
    commission_error_rate: r.commission_error_rate,
    omission_error_rate: r.omission_error_rate,
    nogo_accuracy: r.commission_error_rate === null ? null : 1 - r.commission_error_rate,
    accuracy: n > 0 ? (r.hits.count() + nNogo - r.commissions.count()) / n : null,
    mean_correct_go_rt: r.mean_correct_go_rt,
    go_rt_sd: r.hits.count() > 1 ? (r.hits.select("rt").sd() as number) : null,
    false_alarm_rt: meanOrNull(r.commissions),
    d_prime: dPrime,
    criterion_c: criterion,
    d_prime_correction: "macmillan_kaplan",
    baseline_n_trials: baseline.count(),
    baseline_mean_rt: meanOrNull(baselineResponded),
    by_block: blocks.map((block) => {
      const b = rates(go.filter({ block }), nogo.filter({ block }));
      return {
        block,
        n_trials: go.filter({ block }).count() + nogo.filter({ block }).count(),
        commission_error_rate: b.commission_error_rate,
        omission_error_rate: b.omission_error_rate,
        mean_correct_go_rt: b.mean_correct_go_rt,
      };
    }),
  };
}

export function getSummary(
  data: DataCollection
): ScoringResult & { task: string; version: string } {
  return { ...calculateScores(data), task: TASK_NAME, version: VERSION };
}
