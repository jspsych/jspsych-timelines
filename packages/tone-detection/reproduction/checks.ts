/**
 * Tone detection checks. The checks for options every package shares (practice trial count, feedback, device) live in
 * `@jspsych-timelines/testing`; the contract that points them at this task's data is `./contract.ts`. This file has what is
 * specific here: the timing of the sounds, the stimulus set, the conditions and tracks, the staircase replayed against the data,
 * the screens before the task (volume, headphones, hearing) and the instruction wording.
 */
import { Check, CheckSet, distinct, sharedChecks } from "@jspsych-timelines/testing";

import { AUDIO } from "../src/constants";
import { resolveOptions } from "../src/options";
import type { ToneDetectionOptions } from "../src/options";
import type { Eff, Run } from "./harness";
import { rowsOf } from "./harness";

type TdCheck = Check<ToneDetectionOptions, Eff>;

const test = (r: Run) => rowsOf(r, "test", "response");
const stimulus = (r: Run, phase: "test" | "practice" = "test") => rowsOf(r, phase, "stimulus");
const blocksOf = (rows: any[]) => distinct(rows.map((x) => x.block));
const inBlock = (rows: any[], b: number) => rows.filter((x) => x.block === b);

/** The values of a duration option are numbers or `{ min, max, step }`: every recorded value is on its grid. */
function expectOnGrid(values: number[], v: number | { min: number; max: number; step?: number }) {
  if (typeof v === "number") return values.forEach((x) => expect(x).toBe(v));
  const step = v.step && v.step > 0 ? v.step : 1;
  values.forEach((x) => {
    expect(x).toBeGreaterThanOrEqual(v.min);
    expect(x).toBeLessThanOrEqual(v.max);
    expect(Math.abs(Math.round((x - v.min) / step) * step - (x - v.min))).toBeLessThan(1e-9);
  });
}

/** Timing of the sound rows: the recorded value, in the practice and the test. */
const timing = (option: keyof Eff, field: string): TdCheck => ({
  kind: "recorded-parameter",
  requires: ["parts.response"],
  fn: (r) => {
    const v = r.eff[option] as number | { min: number; max: number; step?: number };
    const rows = stimulus(r);
    expect(rows.length).toBeGreaterThan(0);
    expectOnGrid(
      rows.map((x) => x[field]),
      v
    );
    // the practice follows the same value unless it is overridden
    const vp = r.effP[option] as typeof v;
    expectOnGrid(
      stimulus(r, "practice").map((x) => x[field]),
      vp
    );
    // the sound is the lead-in, the intervals and the gaps between them
    rows.forEach((x) =>
      expect(x.sound_duration).toBe(
        AUDIO.masker_lead_ms +
          r.eff.n_intervals * x.tone_duration +
          (r.eff.n_intervals - 1) * x.inter_item_interval
      )
    );
  },
});

/** An independent replay of the staircase rule over the answers in one track's rows. */
function replayTrack(rows: any[], cfg: NonNullable<Eff["adaptive"]>) {
  const nDown =
    cfg.procedure === "staircase_1up_3down" ? 3 : cfg.procedure === "staircase_1up_2down" ? 2 : 1;
  let level = cfg.start_level;
  let run = 0;
  let last: "up" | "down" | null = null;
  let reversals = 0;
  const [lo, hi] = cfg.bounds;
  rows.forEach((x, i) => {
    expect(x.level).toBeCloseTo(level, 6);
    expect(x.trial_index_in_block).toBe(i + 1);
    if (lo !== null) expect(x.level).toBeGreaterThanOrEqual(lo);
    if (hi !== null) expect(x.level).toBeLessThanOrEqual(hi);
    let move: "up" | "down" | null = null;
    if (x.correct) {
      run++;
      if (run >= nDown) {
        move = "down";
        run = 0;
      }
    } else {
      run = 0;
      move = "up";
    }
    let reversal = false;
    if (move && last !== null && move !== last) {
      reversal = true;
      reversals++;
    }
    if (move) {
      const step = cfg.step_sizes[Math.min(reversals, cfg.step_sizes.length - 1)];
      level = level + (move === "up" ? step.up : -step.down);
      level = Math.round(level * 1e10) / 1e10;
      if (lo !== null) level = Math.max(level, lo);
      if (hi !== null) level = Math.min(level, hi);
      last = move;
    }
    expect(x.is_reversal).toBe(reversal);
    expect(x.reversal_count).toBe(reversals);
    expect(x.next_level).toBeCloseTo(level, 6);
    expect(x.n_alternatives).toBe(x.n_alternatives);
  });
  return { reversals };
}

/** Does the track end where its stop rule says? */
function expectStopRule(rows: any[], cfg: NonNullable<Eff["adaptive"]>) {
  const rule = cfg.discontinue_rule!;
  const n = rows.length;
  const errors = rows.filter((x) => !x.correct).length;
  if (rule.trials !== undefined) {
    expect(n).toBeLessThanOrEqual(rule.trials);
  }
  if (rule.reversals !== undefined) {
    const lastRev = rows[n - 1].reversal_count;
    expect(lastRev).toBeLessThanOrEqual(rule.reversals);
  }
  if (rule.mistakes !== undefined) expect(errors).toBeLessThanOrEqual(rule.mistakes);
  // it stopped because a rule fired: the last row says so
  const last = rows[n - 1];
  expect(last.track_done).toBe(true);
  expect(typeof last.track_final.stop_reason).toBe("string");
  const reason = last.track_final.stop_reason as string;
  if (reason === "trials") expect(n).toBe(rule.trials);
  if (reason === "reversals") expect(last.reversal_count).toBe(rule.reversals);
  if (reason === "mistakes") expect(errors).toBe(rule.mistakes);
  rows.slice(0, -1).forEach((x) => expect(x.track_done).toBe(false));
}

const own: Record<string, TdCheck> = {
  inter_item_interval_ms: timing("inter_item_interval_ms", "inter_item_interval"),
  stimulus_duration_ms: timing("stimulus_duration_ms", "tone_duration"),
  tone_ramp_ms: timing("tone_ramp_ms", "tone_ramp"),

  stimulus_set: {
    kind: "behaviour",
    requires: ["parts.response"],
    fn: (r) => {
      const masker = r.eff.stimulus_set.masker;
      const rows = test(r);
      const stim = stimulus(r);
      expect(r.eff.stimulus_set.tone).toBe("pure_tone");
      stim.forEach((x) => expect(x.tone_frequency).toBe(x.tone_frequency));
      if (masker === "none") {
        rows.forEach((x) => expect(x.masker_level_db).toBeNull());
        rows.forEach((x) => expect(x.level_unit).toBe("dB FS"));
        rows.forEach((x) => expect(x.tone_level_db).toBe(x.level));
      } else {
        rows.forEach((x) => expect(x.masker_level_db).toBe(r.eff.presentation_level_db));
        rows.forEach((x) => expect(x.level_unit).toBe("dB SNR"));
        // the tone's digital level is the masker's plus the SNR
        rows.forEach((x) => expect(x.tone_level_db).toBeCloseTo(x.masker_level_db + x.level, 6));
      }
    },
  },

  tone_frequency_hz: {
    kind: "behaviour",
    requires: ["parts.response"],
    fn: (r) => {
      const f = r.eff.tone_frequency_hz;
      const rows = test(r);
      expect(distinct(rows.map((x) => x.tone_frequency)).sort((a, b) => a - b)).toEqual(
        [...f].sort((a, b) => a - b)
      );
      rows.forEach((x) => {
        expect(x.condition).toBe(`${x.tone_frequency}_hz`);
        expect(x.standard_value).toBe(x.tone_frequency);
      });
      // every frequency is tested in the same number of tracks
      for (const hz of f) {
        const blocks = blocksOf(rows.filter((x) => x.tone_frequency === hz));
        expect(blocks).toHaveLength(r.eff.trials_per_condition);
      }
      stimulus(r).forEach((x) => expect(f).toContain(x.tone_frequency));
    },
  },

  block_order: {
    kind: "behaviour",
    requires: ["parts.response"],
    fn: (r) => {
      const f = r.eff.tone_frequency_hz;
      const rows = test(r);
      const order = blocksOf(rows).map((b) => inBlock(rows, b)[0].tone_frequency as number);
      expect(order).toHaveLength(f.length * r.eff.trials_per_condition);
      for (let round = 0; round < r.eff.trials_per_condition; round++) {
        const slice = order.slice(round * f.length, (round + 1) * f.length);
        expect([...slice].sort((a, b) => a - b)).toEqual([...f].sort((a, b) => a - b));
        if (r.eff.block_order === "fixed") expect(slice).toEqual(f);
        if (r.eff.block_order === "ascending") expect(slice).toEqual([...f].sort((a, b) => a - b));
        if (r.eff.block_order === "descending") expect(slice).toEqual([...f].sort((a, b) => b - a));
      }
    },
  },

  task_variant: {
    kind: "behaviour",
    requires: ["parts.response"],
    fn: (r) => {
      const n = r.eff.task_variant === "2I-2AFC_which_contains_tone" ? 2 : 3;
      expect(r.eff.n_intervals).toBe(n);
      expect(r.eff.response_keys).toHaveLength(n);
      const rows = test(r);
      rows.forEach((x) => {
        expect(x.n_alternatives).toBe(n);
        expect(x.target_interval).toBeGreaterThanOrEqual(1);
        expect(x.target_interval).toBeLessThanOrEqual(n);
      });
      // every interval holds the tone sometimes
      if (rows.length >= 20)
        expect(distinct(rows.map((x) => x.target_interval)).sort()).toEqual(
          Array.from({ length: n }, (_, i) => i + 1)
        );
    },
  },

  trials_per_condition: {
    kind: "behaviour",
    requires: ["parts.response"],
    fn: (r) => {
      const rows = test(r);
      const blocks = blocksOf(rows);
      expect(blocks).toHaveLength(r.eff.tone_frequency_hz.length * r.eff.trials_per_condition);
      rows.forEach((x) => expect(x.track_id).toBeGreaterThanOrEqual(1));
      expect(distinct(rows.map((x) => x.track_id)).sort()).toEqual(
        Array.from({ length: r.eff.trials_per_condition }, (_, i) => i + 1)
      );
    },
  },

  adaptive: {
    kind: "behaviour",
    requires: ["parts.response"],
    fn: (r) => {
      const a = r.eff.adaptive;
      const rows = test(r);
      const blocks = blocksOf(rows);
      if (a === null) {
        // fixed levels: every trial's level is one of the list, balanced within each block; no reversals
        const dl = r.eff.difficulty_levels!;
        for (const b of blocks) {
          const rb = inBlock(rows, b);
          expect(rb).toHaveLength(r.eff.trials_per_block as number);
          rb.forEach((x) => {
            expect(dl).toContain(x.level);
            expect(x.is_reversal).toBeNull();
            expect(x.next_level).toBeNull();
          });
          const counts = dl.map((l) => rb.filter((x) => x.level === l).length);
          expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
        }
        return;
      }
      expect(rows.length).toBeGreaterThan(0);
      for (const b of blocks) {
        const rb = inBlock(rows, b);
        // a fresh staircase for every track
        expect(rb[0].level).toBe(a.start_level);
        replayTrack(rb, a);
        expectStopRule(rb, a);
        // the whole staircase was recorded once, on the last row, and agrees with the rows
        const last = rb[rb.length - 1];
        const h = last.track_final.history as any[];
        expect(h).toHaveLength(rb.length);
        expect(h.map((e) => e.level)).toEqual(rb.map((x) => x.level));
        expect(h.map((e) => e.correct)).toEqual(rb.map((x) => x.correct));
        expect(last.track_final.config.step_sizes).toEqual(a.step_sizes);
        rb.slice(0, -1).forEach((x) => expect(x.track_final).toBeUndefined());
      }
      // practice: fixed levels (the staircase's start level) unless a staircase is given
      const p = rowsOf(r, "practice", "response");
      const ap = r.effP.adaptive;
      if (ap === null) p.forEach((x) => expect(r.effP.difficulty_levels).toContain(x.level));
      else if (p.length) replayTrack(p, ap);
    },
  },

  device_eligibility: {
    kind: "behaviour",
    requires: ["parts.response"],
    // "none": the task runs on any device; nothing is checked or blocked
    fn: (r) => {
      expect(r.eff.device_eligibility).toBe("none");
      expect(test(r).length).toBeGreaterThan(0);
    },
  },

  headphone_check: {
    kind: "behaviour",
    requires: ["parts.response"],
    fn: (r) => {
      const h = rowsOf(r, "instructions", "headphone_check");
      if (r.eff.headphone_check === "none") return expect(h).toHaveLength(0);
      expect(h).toHaveLength(r.eff.headphone_check_trials);
      h.forEach((x, i) => {
        expect(x.headphone_check_n_trials).toBe(i + 1);
        expect(x.headphone_screen).toBe(r.eff.headphone_screen);
        expect(x.antiphase_interval).not.toBe(x.target_interval);
      });
      // nobody is excluded: the task goes on whatever the count
      expect(test(r).length).toBeGreaterThan(0);
    },
  },

  participant_eligibility: {
    kind: "behaviour",
    requires: ["parts.response"],
    fn: (r) => {
      const q = rowsOf(r, "instructions", "hearing_check");
      if (r.eff.participant_eligibility === "hearing") {
        expect(q).toHaveLength(1);
        expect(typeof q[0].hearing_difficulty).toBe("boolean");
      } else expect(q).toHaveLength(0);
      expect(test(r).length).toBeGreaterThan(0); // an answer excludes nobody
    },
  },

  volume_calibration: {
    kind: "behaviour",
    requires: ["parts.response"],
    fn: (r) => {
      const v = rowsOf(r, "instructions", "volume_calibration");
      if (r.eff.volume_calibration !== "participant_adjusted") return expect(v).toHaveLength(0);
      expect(v).toHaveLength(1);
      expect(v[0].calibration_level_db).toBe(r.eff.calibration_level_db);
      expect(v[0].calibration_target).toBe(r.eff.calibration_target);
      // the masker (or the tone's level in quiet) is recorded re the calibration sound
      if (r.eff.stimulus_set.masker !== "none") {
        test(r).forEach((x) =>
          expect(x.level_re_calibration_db).toBeCloseTo(
            r.eff.presentation_level_db - (r.eff.calibration_level_db as number),
            6
          )
        );
      }
    },
  },

  progress_indicator: {
    kind: "structure",
    requires: ["parts.response"],
    fn: (r) => {
      const rows = stimulus(r);
      if (r.eff.progress_indicator === "none")
        return rows.forEach((x) => expect(x.progress_text).toBeNull());
      rows.forEach((x) => expect(x.progress_text).toMatch(/^(Progress: \d+\/\d+|Trial \d+)$/));
      // the counter runs 1..n within each track
      for (const b of blocksOf(rows)) {
        const nums = inBlock(rows, b).map((x) =>
          Number(String(x.progress_text).match(/(\d+)(\/|$)/)![1])
        );
        expect(nums).toEqual(nums.map((_, i) => i + 1));
      }
    },
  },

  environment_instructions: {
    kind: "structure",
    requires: [],
    fn: (r) => {
      const pages = rowsOf(r, "instructions", "instruction").map((x) => String(x.stimulus));
      const has = pages.some((p) => /quiet place/.test(p) && /headphones/.test(p));
      expect(has).toBe(r.eff.environment_instructions === "quiet_room");
    },
  },

  judgment_wording: {
    kind: "structure",
    requires: [],
    fn: (r) => {
      const pages = rowsOf(r, "instructions", "instruction").map((x) => String(x.stimulus));
      expect(pages.some((p) => /say which interval contained the beep/.test(p))).toBe(true);
    },
  },
};

export const CHECKS: CheckSet<ToneDetectionOptions, Eff> = {
  ...sharedChecks,
  ...own,
};

export { resolveOptions };
