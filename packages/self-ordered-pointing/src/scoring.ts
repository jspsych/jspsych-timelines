import { DataCollection } from "jspsych";

import { TASK_NAME, VERSION } from "./constants";

/** Errors in one set size. */
export interface SetSizeScore {
  set_size: number;
  /** Test series of this set size. */
  n_series: number;
  /** Picks that repeated an item already picked in the series. */
  errors: number;
  /** errors / n_series */
  mean_errors_per_series: number;
}

/** Share of picks that were repeats at one choice number (page within the series). */
export interface ChoiceOrderScore {
  /** 1-based page within the series. */
  choice_index: number;
  n_picks: number;
  errors: number;
  /** errors / n_picks; null when there were no picks. */
  error_rate: number | null;
}

/**
 * Scores from the test phase. Empty-data values: counts and sums are 0, every mean, rate and
 * proportion is null (never NaN), lists are empty. Nothing is judged: no exclusion flags.
 */
export interface ScoringResult {
  /** Test series (one per set-size run). 0 if none. */
  n_series: number;
  /** Test pages (scorable rows). 0 if none. */
  n_pages: number;
  /** Pages on which an item was picked (pages without a timeout). 0 if none. */
  n_picks: number;
  /** Pages with no pick because the response window ran out. 0 if none. */
  n_timeouts: number;
  /** Repeat errors summed over series and set sizes (Ross et al. 2007's recommended score). 0 if none. */
  total_errors: number;
  /** total_errors / n_series. null if no series. */
  mean_errors_per_series: number | null;
  /** Errors per set size, ascending set size. Empty if none. */
  errors_by_set_size: SetSizeScore[];
  /** Repeat rate by page within the series, ascending page. Empty if none. */
  error_rate_by_choice_order: ChoiceOrderScore[];
  /** Proportion of picks that were new items. null if no picks. */
  mean_accuracy: number | null;
  /** Mean over series of the correct picks before the first repeat (a series with no repeat counts all its correct picks, so a timeout lowers it). null if no series. */
  span_before_first_error: number | null;
  /** The largest set size with at least one series in which every page picked a new item (no repeat, no timeout). null if none. */
  max_set_size_completed: number | null;
  /** Repeats of the item picked on the page just before. 0 if none. */
  perseverative_errors: number;
  /** Mean RT (ms) of the picks. null if none. */
  mean_rt: number | null;
  /** Picks that broke `position_repeat_max` (with the rule on, or counted anyway as a measure). 0 if none. */
  n_position_repeat_violations: number;
}

/** Group rows by series (set-size run) in order of appearance. */
function bySeries(rows: any[]): Map<number, any[]> {
  const m = new Map<number, any[]>();
  for (const r of rows) {
    const k = r.series as number;
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(r);
  }
  return m;
}

export function calculateScores(data: DataCollection): ScoringResult {
  const rows = data.filter({ task: TASK_NAME, phase: "test", part: "response" }).values() as any[];
  const picks = rows.filter((r) => !r.timeout);
  const series = bySeries(rows);
  const errors = rows.filter((r) => r.is_repeat_error === true);
  const sizes = [...new Set(rows.map((r) => r.set_size as number))].sort((a, b) => a - b);
  const errors_by_set_size: SetSizeScore[] = sizes.map((s) => {
    const inSize = [...series.values()].filter((p) => p[0].set_size === s);
    const e = inSize.reduce((a, p) => a + p.filter((r) => r.is_repeat_error === true).length, 0);
    return {
      set_size: s,
      n_series: inSize.length,
      errors: e,
      mean_errors_per_series: inSize.length > 0 ? e / inSize.length : 0,
    };
  });
  const maxChoice = rows.reduce((a, r) => Math.max(a, r.choice_index ?? 0), 0);
  const error_rate_by_choice_order: ChoiceOrderScore[] = [];
  for (let c = 1; c <= maxChoice; c++) {
    const at = picks.filter((r) => r.choice_index === c);
    if (at.length === 0) continue;
    const e = at.filter((r) => r.is_repeat_error === true).length;
    error_rate_by_choice_order.push({
      choice_index: c,
      n_picks: at.length,
      errors: e,
      error_rate: e / at.length,
    });
  }
  // correct picks before the first repeat; a series with no repeat counts all its correct picks
  const spans = [...series.values()].map((p) => {
    const ordered = [...p].sort((a, b) => a.choice_index - b.choice_index);
    const first = ordered.findIndex((r) => r.is_repeat_error === true);
    return (first < 0 ? ordered : ordered.slice(0, first)).filter((r) => r.correct === true).length;
  });
  // completed: every page of the series picked a new item (a repeat or a timeout means it was not)
  const clean = [...series.values()]
    .filter((p) => p.every((r) => r.correct === true))
    .map((p) => p[0].set_size as number);
  const rtRows = data
    .filter({ task: TASK_NAME, phase: "test", part: "response" })
    .filterCustom((r: any) => typeof r.rt === "number");
  return {
    n_series: series.size,
    n_pages: rows.length,
    n_picks: picks.length,
    n_timeouts: rows.length - picks.length,
    total_errors: errors.length,
    mean_errors_per_series: series.size > 0 ? errors.length / series.size : null,
    errors_by_set_size,
    error_rate_by_choice_order,
    mean_accuracy:
      picks.length > 0
        ? picks.filter((r) => r.is_repeat_error !== true).length / picks.length
        : null,
    span_before_first_error:
      spans.length > 0
        ? new DataCollection(spans.map((span) => ({ span }))).select("span").mean()
        : null,
    max_set_size_completed: clean.length > 0 ? Math.max(...clean) : null,
    perseverative_errors: errors.filter(
      (r) => r.previous_item_id != null && r.chosen_item_id === r.previous_item_id
    ).length,
    mean_rt: rtRows.count() > 0 ? rtRows.select("rt").mean() : null,
    n_position_repeat_violations: rows.filter((r) => r.position_rule_violation === true).length,
  };
}

export function getSummary(
  data: DataCollection
): ScoringResult & { task: string; version: string } {
  return { ...calculateScores(data), task: TASK_NAME, version: VERSION };
}
