import type { DataCollection } from "jspsych";

import { TASK_NAME, VERSION } from "./constants";

/** Scores of one track (one staircase). A track is a block of the test. */
export interface TrackScore {
  block: number;
  track_id: number | null;
  condition: string | null;
  frequency_hz: number | null;
  n_trials: number;
  n_correct: number;
  accuracy: number | null;
  n_reversals: number;
  /** Mean level of the last `last_n_reversals` reversals (all if fewer). null if there was no reversal. */
  threshold: number | null;
  /** The mode of the levels of the track's trials (the mean of tied modes). */
  threshold_mode: number | null;
  /** The level the track would have presented next: its final value. */
  threshold_final: number | null;
}

/** Scores of one condition (one tone frequency): its tracks, averaged. */
export interface ConditionScore {
  condition: string;
  frequency_hz: number | null;
  n_tracks: number;
  n_trials: number;
  accuracy: number | null;
  /** Mean of the tracks' reversal thresholds (tracks without a reversal are left out). null if none. */
  threshold: number | null;
  threshold_mode: number | null;
  threshold_final: number | null;
}

/**
 * Scores from the test phase (kept local: the threshold from reversals is specific to adaptive psychophysics).
 *
 * Levels are in the unit of the data's `level_unit`: dB SNR with a masker, dB FS in quiet. Lower is better (a quieter tone heard).
 * Empty-data values: counts are 0, every mean, rate and threshold is null (never NaN). No participant or track is excluded or flagged:
 * the literature's usual exclusions (a track with too few reversals, an implausible threshold) are analysis decisions.
 */
export interface ScoringResult {
  n_trials: number;
  n_tracks: number;
  /** Proportion correct over the test trials. A staircase aims at its own proportion (79.4% for 3-down/1-up), not at 100%. */
  accuracy: number | null;
  /** Mean RT of correct answers, ms from the end of the last interval. null if none. */
  mean_rt: number | null;
  /** The threshold of the single condition (mean of last-n-reversal thresholds over its tracks); null when there are several conditions (see `conditions`) or no reversals. */
  threshold: number | null;
  threshold_mode: number | null;
  threshold_final: number | null;
  /** How many of the last reversals each track threshold used (the call's option; default 6). */
  last_n_reversals: number;
  level_unit: string | null;
  conditions: ConditionScore[];
  tracks: TrackScore[];
}

export interface ScoringOptions {
  /** Reversals averaged for a track's threshold. (default: 6 — S005, S012, S044; S036 and S045 use 4; an even number, Levitt 1971) */
  last_n_reversals?: number;
}

export const DEFAULT_LAST_N_REVERSALS = 6;

const isNum = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

/** Mean of a short list of derived numbers (per-track thresholds are not trial data); null for none. */
const meanOfList = (xs: number[]): number | null =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;

/** The mode of a track's levels; tied modes are averaged. */
function modeOf(levels: DataCollection): number | null {
  const col = levels.select("level");
  if (!col.count()) return null;
  const freq = col.frequencies() as Record<string, number>;
  const entries = Object.entries(freq);
  const max = Math.max(...entries.map(([, n]) => n));
  return meanOfList(entries.filter(([, n]) => n === max).map(([k]) => Number(k)));
}

export function scoreTrack(rows: DataCollection, lastN: number): TrackScore {
  const reversals = rows.filter({ is_reversal: true });
  const nRev = reversals.count();
  const last = rows.last(1).values()[0] ?? {};
  const n = rows.count();
  const nCorrect = rows.filter({ correct: true }).count();
  return {
    block: last.block ?? null,
    track_id: last.track_id ?? null,
    condition: last.condition ?? null,
    frequency_hz: last.tone_frequency ?? null,
    n_trials: n,
    n_correct: nCorrect,
    accuracy: n ? nCorrect / n : null,
    n_reversals: nRev,
    threshold: nRev ? reversals.last(lastN).select("level").mean() : null,
    threshold_mode: modeOf(rows),
    threshold_final: isNum(last.next_level) ? last.next_level : null,
  };
}

export function calculateScores(data: DataCollection, options: ScoringOptions = {}): ScoringResult {
  const lastN = options.last_n_reversals ?? DEFAULT_LAST_N_REVERSALS;
  const rows = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
  const blocks = [...new Set(rows.select("block").values as number[])];
  const tracks = blocks.map((b) => scoreTrack(rows.filter({ block: b }), lastN));

  const names = [...new Set(tracks.map((t) => t.condition).filter((c): c is string => c !== null))];
  const conditions: ConditionScore[] = names.map((condition) => {
    const own = tracks.filter((t) => t.condition === condition);
    const condRows = rows.filter({ condition });
    const n = condRows.count();
    const nCorrect = condRows.filter({ correct: true }).count();
    const pick = (f: (t: TrackScore) => number | null) =>
      meanOfList(own.map(f).filter((x): x is number => x !== null));
    return {
      condition,
      frequency_hz: own[0]?.frequency_hz ?? null,
      n_tracks: own.length,
      n_trials: n,
      accuracy: n ? nCorrect / n : null,
      threshold: pick((t) => t.threshold),
      threshold_mode: pick((t) => t.threshold_mode),
      threshold_final: pick((t) => t.threshold_final),
    };
  });

  const n = rows.count();
  const correct = rows.filter({ correct: true });
  const rt = correct.filterCustom((t: any) => isNum(t.rt)).select("rt");
  const single = conditions.length === 1 ? conditions[0] : null;
  const unit = rows.select("level_unit").values[0];
  return {
    n_trials: n,
    n_tracks: tracks.length,
    accuracy: n ? correct.count() / n : null,
    mean_rt: rt.count() ? rt.mean() : null,
    threshold: single?.threshold ?? null,
    threshold_mode: single?.threshold_mode ?? null,
    threshold_final: single?.threshold_final ?? null,
    last_n_reversals: lastN,
    level_unit: typeof unit === "string" ? unit : null,
    conditions,
    tracks,
  };
}

export function getSummary(
  data: DataCollection,
  options: ScoringOptions = {}
): ScoringResult & { task: string; version: string } {
  return { ...calculateScores(data, options), task: TASK_NAME, version: VERSION };
}
