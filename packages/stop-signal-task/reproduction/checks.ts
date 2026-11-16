/**
 * Stop-signal checks. The checks for options every package shares (counts, blocks, proportions,
 * durations, feedback, response keys and device) live in `@jspsych-timelines/testing`; the contract
 * that points them at this task's data is `./contract.ts`. This file has what is specific here:
 * the staircase (`adaptive`) replayed against the data, fixed delays, the stimulus and signal forms,
 * the practice criterion, and extra assertions on three shared options.
 */
import { Check, CheckSet, distinct, extendCheck, sharedChecks } from "@jspsych-timelines/testing";

import type { StopSignalTaskOptions } from "../src/options";
import type { Eff, Run } from "./harness";
import { evalStimulus, harness, rowsOf, trialsOf } from "./harness";

type SstCheck = Check<StopSignalTaskOptions, Eff>;

const phaseRows = (r: Run, phase: "practice" | "test") => rowsOf(r, phase, "response");
const test = (r: Run) => phaseRows(r, "test");
const stopRows = (rows: any[]) => rows.filter((x) => x.condition === "stop");
const round1 = (x: number) => Math.round(x * 10) / 10;

/** Replays the staircase from the stop rows of one phase: levels, steps, bounds, tracks and resets. */
function replayStaircase(r: Run) {
  const a = r.eff.adaptive;
  const aP = r.effP.adaptive;
  const rows = [...phaseRows(r, "practice"), ...test(r)];
  const stops = stopRows(rows);
  if (a === null) {
    stops.forEach((x) => {
      expect(x.staircase_id).toBeNull();
      expect(x.staircase_state).toBeNull();
    });
    return;
  }
  expect(stops.length).toBeGreaterThan(0);
  const last = new Map<string, any>();
  for (const x of stops) {
    const cfg = x.phase === "practice" ? aP : a;
    if (cfg === null) {
      expect(x.staircase_id).toBeNull();
      continue;
    }
    const key = x.staircase_id as string;
    // the track is the trial's go direction under per_condition, one for all otherwise
    if (cfg.tracks === "single") expect(key).toBe("all");
    else expect(key).toBe(x.go_stimulus);
    const prev = last.get(key);
    const prevCfg = prev && (prev.phase === "practice" ? aP : a);
    const same = JSON.stringify(cfg) === JSON.stringify(prevCfg);
    const fresh =
      !prev ||
      !same ||
      (cfg.reset === "block" && (prev.phase !== x.phase || prev.block !== x.block)) ||
      (cfg.reset === "phase" && prev.phase !== x.phase);
    if (fresh) {
      expect(x.ssd).toBe(cfg.start_level);
      expect(x.staircase_state.trial_count).toBe(1); // a fresh procedure, not a rewind
    } else {
      expect(x.ssd).toBeCloseTo(prev.next_ssd, 5);
    }
    const [lo, hi] = cfg.bounds;
    if (lo !== null) expect(x.ssd).toBeGreaterThanOrEqual(lo);
    if (hi !== null) expect(x.ssd).toBeLessThanOrEqual(hi);
    if (cfg.procedure === "staircase_1up_1down" && !cfg.discontinue_rule) {
      const step = x.stop_outcome === "successful" ? cfg.step_size.up : -cfg.step_size.down;
      let expected = round1(x.ssd + step);
      if (lo !== null) expected = Math.max(expected, lo);
      if (hi !== null) expected = Math.min(expected, hi);
      expect(Math.abs(x.next_ssd - expected)).toBeLessThan(0.11);
    }
    expect(x.staircase_state).toMatchObject({ procedure: "staircase", label: key });
    last.set(key, x);
  }
}

/** Checks for this task's own options. */
const own: Record<string, SstCheck> = {
  adaptive: {
    requires: ["parts.response"],
    kind: "behaviour",
    fn: (r) => {
      replayStaircase(r);
      const a = r.eff.adaptive;
      if (a === null) return;
      // the staircase itself was recorded in full once per block
      const lastRows = [...r.rows.filter((x) => x.part === "response" && "staircase_final" in x)];
      expect(lastRows.length).toBeGreaterThan(0);
      lastRows.forEach((x) => {
        expect(x.staircase_final.length).toBe(a.tracks === "per_condition" ? 2 : 1);
      });
    },
  },
  difficulty_levels: {
    requires: ["parts.response"],
    kind: "behaviour",
    fn: (r) => {
      const dl = r.eff.difficulty_levels;
      const stops = stopRows(test(r));
      if (dl === null) return;
      expect(r.eff.adaptive).toBeNull();
      stops.forEach((x) => expect(x.staircase_id).toBeNull());
      if (Array.isArray(dl)) {
        stops.forEach((x) => expect(dl).toContain(x.ssd));
        if (stops.length >= dl.length)
          dl.forEach((v) => expect(stops.some((x) => x.ssd === v)).toBe(true));
      } else {
        const step = dl.step && dl.step > 0 ? dl.step : 1;
        stops.forEach((x) => {
          expect(x.ssd).toBeGreaterThanOrEqual(dl.min);
          expect(x.ssd).toBeLessThanOrEqual(dl.max);
          expect(
            Math.abs(Math.round((x.ssd - dl.min) / step) * step - (x.ssd - dl.min))
          ).toBeLessThan(1e-9);
        });
        if (stops.length >= 10) expect(distinct(stops.map((x) => x.ssd)).length).toBeGreaterThan(1);
      }
    },
  },
  break_duration_ms: {
    requires: [],
    kind: "recorded-parameter",
    fn: (r) => {
      const v = r.eff.break_duration_ms;
      const rest = rowsOf(r, "test", "rest");
      if (v === 0 || r.eff.n_blocks === 1) {
        expect(rest).toHaveLength(0);
        return;
      }
      expect(rest).toHaveLength(r.eff.n_blocks - 1);
      rest.forEach((x) => expect(x.break_duration).toBe(v));
      trialsOf(r, "rest").forEach((t) => expect(t.enable_button_after).toBe(v ?? 0));
    },
  },
  stimulus_modality: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const m = r.eff.stimulus_modality;
      const signal = r.eff.stimulus_set.stop_signal;
      expect(signal === "tone").toBe(m === "auditory");
      test(r).forEach((x) => expect(x.stop_signal).toBe(signal));
    },
  },
  stimulus_set: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const { go, stop_signal } = r.eff.stimulus_set;
      const t = trialsOf(r, "response").find((x) => x.data.phase === "test")!;
      const html = evalStimulus(t);
      expect(html).toContain(`data-go="${go}"`);
      expect(html).toContain(`data-signal="${stop_signal}"`);
      test(r).forEach((x) => expect(x.stop_signal).toBe(stop_signal));
      expect(distinct(test(r).map((x) => x.go_stimulus)).sort()).toEqual(["left", "right"]);
    },
  },
  practice_criterion: {
    requires: [],
    kind: "behaviour",
    fn: async (r) => {
      const pc = r.eff.practice_criterion;
      const marked = r.rows.filter((x) => x.phase === "practice" && "practice_criterion_met" in x);
      if (!pc) {
        expect(marked).toHaveLength(0);
        return;
      }
      // a plausible participant passes at once
      expect(marked.length).toBeGreaterThanOrEqual(1);
      const attempts = distinct(phaseRows(r, "practice").map((x) => x.practice_attempt));
      expect(attempts.length).toBeLessThanOrEqual(pc.max_repeats + 1);
      // a participant who never responds misses it and gets the on_fail treatment
      const slow = await harness.run(r.opts, { default: { data: { rt: 50000 } } });
      const slowAttempts = distinct(phaseRows(slow, "practice").map((x) => x.practice_attempt));
      expect(slowAttempts).toHaveLength(pc.on_fail === "repeat" ? pc.max_repeats + 1 : 1);
      slow.rows
        .filter((x) => "practice_criterion_met" in x)
        .forEach((x) => expect(x.practice_criterion_met).toBe(false));
      expect(test(slow).length).toBe(pc.on_fail === "end" ? 0 : r.eff.n_test_trials);
    },
  },
  device_eligibility: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      expect(trialsOf(r, "device_check")).toHaveLength(
        r.eff.device_eligibility === "computer_only" ? 1 : 0
      );
    },
  },
  block_feedback: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const fb = rowsOf(r, "test", "block_feedback");
      expect(fb).toHaveLength(r.eff.block_feedback === "none" ? 0 : r.eff.n_blocks);
    },
  },
  performance_incentive: {
    requires: [],
    kind: "structure",
    fn: (r) => expect(r.eff.performance_incentive).toBe("none"),
  },
  population_protocol: {
    requires: [],
    kind: "structure",
    fn: (r) => expect(r.eff.population_protocol).toBe("standard"),
  },
  response_mapping_counterbalancing: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const keys = r.eff.response_keys;
      const dev = r.eff.response_device;
      test(r).forEach((x) =>
        expect(x.correct_response).toBe(
          dev === "keyboard"
            ? keys[x.go_stimulus === "left" ? 0 : 1]
            : x.go_stimulus === "left"
            ? 0
            : 1
        )
      );
    },
  },
};

export const CHECKS: CheckSet<StopSignalTaskOptions, Eff> = {
  ...sharedChecks,
  ...own,
  // the go stimulus' duration is the vocabulary's stimulus_duration_ms; the signal's is checked here
  stimulus_duration_ms: extendCheck(sharedChecks.stimulus_duration_ms, {
    fn: (r) => {
      const sig = r.eff.stop_signal_duration_ms;
      test(r).forEach((x) => expect(x.stop_signal_duration).toBe(sig));
      trialsOf(r, "response").forEach((t) => expect(t.data.stop_signal_duration).toBe(sig));
    },
  }),
  // stop trials: the signal comes at the requested delay, inside the one response trial
  response_window_ms: extendCheck(sharedChecks.response_window_ms, {
    fn: (r) => {
      const w = r.eff.response_window_ms as number;
      const built = trialsOf(r, "response").filter((t) => t.data.phase === "test");
      // one plugin trial per stimulus: the window runs from go onset and the signal is inside it
      expect(built.every((t) => t.trial_duration === w && t.response_ends_trial === true)).toBe(
        true
      );
      stopRows(test(r)).forEach((x) => {
        expect(x.ssd).toBeLessThan(w * 10); // a delay is a time within a trial
        expect(typeof x.stop_signal_shown).toBe("boolean");
      });
    },
  }),
  condition_proportions: extendCheck(sharedChecks.condition_proportions, {
    fn: (r) => {
      // the block's stop probability is recorded on every response row
      for (let b = 1; b <= r.eff.n_blocks; b++) {
        const list = r.eff.condition_proportions_by_block;
        const p = list[Math.min(b - 1, list.length - 1)];
        test(r)
          .filter((x) => x.block === b)
          .forEach((x) => expect(x.stop_probability_condition).toBeCloseTo(p.stop ?? 0, 9));
      }
    },
  }),
};
