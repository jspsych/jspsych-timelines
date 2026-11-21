/**
 * EEfRT checks. The checks for options every package shares (counts, durations) live in
 * `@jspsych-timelines/testing`; the contract that points them at the EEfRT's data is `./contract.ts`.
 * This file has what is specific to the EEfRT:
 *
 * - checks for the EEfRT's own options (reward and probability levels, stop rule, effort keys, payout, ...)
 * - additional assertions on shared options (`response_window_ms`: the effort time limits;
 *   `feedback_duration_ms`: the reward screen)
 * - a replacement for the shared `response_keys` check. It reads `correct_response`, and a choice between
 *   an easy and a hard task has no correct response (logged in DEFAULTS.md and the friction notes).
 */
import {
  Check,
  CheckSet,
  distinct,
  durationCheck,
  extendCheck,
  sharedChecks,
} from "@jspsych-timelines/testing";

import { rewardLevels, rewardRange } from "../src/offers";
import { normaliseKey } from "../src/options";
import type { EefrtOptions } from "../src/options";
import { defaultText } from "../src/text";
import { collectTrials, rowsOf, run, trialsOf } from "./harness";
import type { Eff, Run } from "./harness";

type EefrtCheck = Check<EefrtOptions, Eff>;

const test = (r: Run) => rowsOf(r, "test", "response");
const choices = (r: Run) => rowsOf(r, "test", "choice");

/** Whole session: practice, test and completion all ran. */
const ran = (r: Run) => {
  expect(test(r).length).toBeGreaterThan(0);
  expect(rowsOf(r, "completion", "completion")).toHaveLength(1);
};

/** Text the participant is shown, from the options the run was built with (a `text` override wins). */
const textOf = (r: Run) => ({ ...defaultText, ...(r.opts.text ?? {}) });

const eefrtOnly: Record<string, EefrtCheck> = {
  session_duration_min: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      ran(r);
      expect(r.eff.task_end_rule).toBe("fixed_time");
      const limit = r.eff.session_duration_min! * 60000;
      const rows = test(r);
      const starts = rows.map((x) => x.session_elapsed_ms as number);
      // a trial that starts before the time is up is completed; none starts after it
      starts.forEach((s) => expect(s).toBeLessThan(limit));
      starts.slice(1).forEach((s, i) => expect(s).toBeGreaterThanOrEqual(starts[i]));
      // and the session did not stop early: the last trial started within one trial's length of the limit
      const longestTrial = 8000 + r.eff.response_window_ms.hard + 4500 + 2000;
      expect(starts[starts.length - 1]).toBeGreaterThan(limit - longestTrial);
      expect(rows.length).toBeGreaterThan(1);
    },
  },
  task_end_rule: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      ran(r);
      if (r.eff.task_end_rule === "fixed_trial_count") {
        expect(test(r)).toHaveLength(r.eff.n_test_trials);
      } else {
        const limit = r.eff.session_duration_min! * 60000;
        test(r).forEach((x) => expect(x.session_elapsed_ms).toBeLessThan(limit));
        expect(test(r).length).toBeGreaterThan(1);
      }
    },
  },
  difficulty_levels: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const rows = test(r);
      expect(distinct(rows.map((x) => x.chosen_task)).sort()).toEqual(["easy", "hard"]);
      for (const x of rows) {
        expect(x.required_presses).toBe(r.eff.difficulty_levels[x.chosen_task as "easy" | "hard"]);
        expect(x.press_count).toBeLessThanOrEqual(x.required_presses);
        // the task ends on the target: completed means every required press was made
        expect(x.completed).toBe(x.press_count === x.required_presses);
        expect(x.press_times).toHaveLength(x.press_count);
      }
    },
  },
  outcome_type: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const t = textOf(r);
      const kind = r.eff.outcome_type === "points" ? "points" : "money";
      for (const x of test(r)) {
        expect(x.easy_reward_text).toBe(t.amount({ value: x.easy_reward, outcome_type: kind }));
        expect(x.hard_reward_text).toBe(t.amount({ value: x.hard_reward, outcome_type: kind }));
      }
      // the amounts reach the screens the participant sees
      const stimuli = collectTrials(r.built.timeline).filter((tr) => tr.data?.part === "choice");
      expect(stimuli.length).toBeGreaterThan(0);
    },
  },
  outcome_valence: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      expect(r.eff.outcome_valence).toBe("gain");
      test(r).forEach((x) => expect(x.reward_won).toBeGreaterThanOrEqual(0));
    },
  },
  reward_magnitude: {
    requires: [],
    kind: "behaviour",
    fn: async (r) => {
      const rows = [...test(r), ...rowsOf(r, "practice", "response")];
      const { easy, hard } = r.eff.reward_magnitude;
      rows.forEach((x) => expect(x.easy_reward).toBe(easy));
      const levels = rewardLevels(hard);
      const range = rewardRange(hard);
      const testHard = test(r).map((x) => x.hard_reward as number);
      if (levels) {
        // discrete levels: every offered amount is a level, and every level is offered
        testHard.forEach((v) => expect(levels).toContain(v));
        expect(distinct(testHard).sort((a, b) => a - b)).toEqual(
          [...new Set(levels)].sort((a, b) => a - b)
        );
      } else {
        // a fresh draw per trial: within the range, to cents, more than a few distinct values
        testHard.forEach((v) => {
          expect(v).toBeGreaterThanOrEqual(range.min);
          expect(v).toBeLessThanOrEqual(range.max);
          expect(Math.abs(Math.round(v * 100) - v * 100)).toBeLessThan(1e-6);
        });
        expect(distinct(testHard).length).toBeGreaterThan(8);
      }
      testHard.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(range.min);
        expect(v).toBeLessThanOrEqual(range.max);
      });
    },
  },
  reward_probability: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const rows = test(r);
      const levels = r.eff.reward_probability;
      rows.forEach((x) => expect(levels).toContain(x.win_probability));
      expect(distinct(rows.map((x) => x.win_probability)).sort()).toEqual(
        [...new Set(levels)].sort()
      );
      // win trials occur at roughly each level's rate (loose: a few dozen trials)
      for (const p of levels) {
        const at = rows.filter((x) => x.win_probability === p);
        if (at.length < 8) continue;
        const rate = at.filter((x) => x.win).length / at.length;
        expect(Math.abs(rate - p)).toBeLessThan(0.3);
      }
    },
  },
  trial_order: {
    requires: [],
    kind: "behaviour",
    fn: async (r) => {
      const offers = (x: Run) =>
        test(x).map((row) => [row.win_probability, row.hard_reward, row.win].join("/"));
      const other = await run(r.opts, undefined, "another-seed");
      const a = offers(r);
      const b = offers(other);
      const n = Math.min(a.length, b.length);
      if (r.eff.trial_order === "fixed_sequence") {
        // the same list for every participant: no random numbers are drawn for it
        expect(a.slice(0, n)).toEqual(b.slice(0, n));
      } else {
        expect(a.slice(0, n)).not.toEqual(b.slice(0, n));
      }
      if (r.eff.trial_order !== "random") {
        // list orders go through every probability x reward cell once per pass
        const levels = rewardLevels(r.eff.reward_magnitude.hard);
        const cells = r.eff.reward_probability.length * (levels?.length ?? 1);
        if (levels && test(r).length >= cells) {
          const pass = test(r)
            .slice(0, cells)
            .map((row) => `${row.win_probability}/${row.hard_reward}`);
          expect(distinct(pass)).toHaveLength(cells);
        }
      }
    },
  },
  missed_response_handling: {
    requires: [],
    kind: "behaviour",
    fn: async (r) => {
      expect(r.eff.missed_response_handling).toBe("random_assignment");
      if (r.eff.response_window_ms.choice === null) return;
      // a participant who is too slow to choose is assigned a task at random, and the trial is flagged
      const slow = await run(r.opts, { default: { data: { rt: 50000 } } });
      const rows = test(slow);
      rows.forEach((x) => {
        expect(x.choice).toBe("none");
        expect(x.choice_forced).toBe(true);
        expect(x.forced_by).toBe("timeout");
        expect(["easy", "hard"]).toContain(x.chosen_task);
        expect(x.choice_rt).toBeNull();
      });
      choices(slow).forEach((x) => {
        expect(x.timeout).toBe(true);
        expect(x.response).toBeNull();
        expect(x.rt).toBeNull();
      });
      if (rows.length >= 20) expect(distinct(rows.map((x) => x.chosen_task))).toHaveLength(2);
      // a free choice is not flagged
      test(r)
        .filter((x) => x.choice !== "none")
        .forEach((x) => expect(x.choice_forced).toBe(false));
    },
  },
  response_key_mapping: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const keys = r.eff.response_key_mapping;
      for (const x of test(r)) {
        expect(x.effort_key).toBe(normaliseKey(keys[x.chosen_task as "easy" | "hard"]));
      }
      // the finger instructions are text: both tasks' phrases appear on the instruction pages
      const t = textOf(r);
      const pages = collectTrials(r.built.timeline)
        .filter((tr) => tr.data?.part === "instruction")
        .map((tr) => tr.stimulus as string)
        .join(" ");
      for (const task of ["easy", "hard"] as const) {
        expect(pages).toContain(t.finger_instruction({ task }));
      }
    },
  },
  progress_indicator: {
    requires: [],
    kind: "recorded-parameter",
    fn: (r) => {
      test(r).forEach((x) => expect(x.progress_indicator).toBe(r.eff.progress_indicator));
    },
  },
  payout_rule: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const done = rowsOf(r, "completion", "completion")[0];
      expect(done.payout_rule).toBe(r.eff.payout_rule);
      const won = test(r).filter((x) => x.reward_won > 0);
      const total = won.reduce((a, x) => a + x.reward_won, 0);
      if (r.eff.payout_rule === "two_random_win_trials_paid") {
        expect(done.paid_trials.length).toBe(Math.min(2, won.length));
        const wonIndex = won.map((x) => x.trial_index_in_block);
        done.paid_trials.forEach((i: number) => expect(wonIndex).toContain(i));
        const paid = won
          .filter((x) => done.paid_trials.includes(x.trial_index_in_block))
          .reduce((a, x) => a + x.reward_won, 0);
        expect(done.payout).toBeCloseTo(paid, 6);
      } else {
        const share = r.eff.payout_rule === "percent_of_total_5" ? 0.05 : 0.1;
        expect(done.paid_trials).toEqual([]);
        expect(done.payout).toBeCloseTo(total * share, 2);
      }
    },
  },
  device_eligibility: {
    requires: [],
    kind: "structure",
    fn: async (r) => {
      const checks = trialsOf(r, "device_check");
      if (r.eff.device_eligibility === "none") return expect(checks).toHaveLength(0);
      expect(checks).toHaveLength(1);
      // desktop: passes silently
      expect(rowsOf(r, "instructions", "device_check")).toHaveLength(0);
      expect(test(r).length).toBeGreaterThan(0);
      // touch-only device: message, then the experiment ends
      const mm = (window as any).matchMedia;
      (window as any).matchMedia = (q: string) => ({ matches: q.includes("coarse") });
      try {
        const phone = await run(r.opts);
        expect(rowsOf(phone, "instructions", "device_check")).toHaveLength(1);
        expect(test(phone)).toHaveLength(0);
      } finally {
        (window as any).matchMedia = mm;
      }
    },
  },
  pretraining: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      expect(r.eff.pretraining).toBe("none");
      // no phase before the instructions other than the instructions and their walkthrough
      expect(distinct(r.rows.map((x) => x.phase)).sort()).toEqual(
        ["completion", "instructions", "practice", "test"].sort()
      );
    },
  },
  adaptive: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      // fixed requirements: nothing changes with performance
      for (const task of ["easy", "hard"] as const) {
        const req = distinct(
          test(r)
            .filter((x) => x.chosen_task === task)
            .map((x) => x.required_presses)
        );
        expect(req).toEqual([r.eff.difficulty_levels[task]]);
      }
    },
  },
  social_influence_cue: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      // the package has no social cue: no row says anything about one
      r.rows.forEach((x) => expect(Object.keys(x).some((k) => k.includes("social"))).toBe(false));
      expect(test(r).length).toBeGreaterThan(0);
    },
  },
  pre_block_countdown_ms: durationCheck({
    option: "pre_block_countdown_ms",
    part: "ready",
    count: "per_response",
  }),
};

/** Shared checks, re-pointed at the EEfRT or extended with assertions only it can make. */
const shared: Record<string, EefrtCheck> = {
  practice_trials: extendCheck(sharedChecks.practice_trials, {
    fn: (r) => {
      // the first practice trials are assigned, then free choices
      const practice = rowsOf(r, "practice", "response");
      const forced = r.effP.practice_forced_tasks;
      practice.slice(0, forced.length).forEach((x, i) => {
        expect(x.choice_forced).toBe(true);
        expect(x.forced_by).toBe("practice");
        expect(x.chosen_task).toBe(forced[i]);
      });
      expect(rowsOf(r, "practice", "choice")).toHaveLength(
        practice.length - Math.min(forced.length, practice.length)
      );
    },
  }),
  // the vocabulary's window is the choice window (scoped to the choice rows in the contract); the
  // effort time limits are checked here
  response_window_ms: extendCheck(sharedChecks.response_window_ms, {
    fn: (r) => {
      const w = r.eff.response_window_ms;
      for (const x of test(r)) {
        const limit = w[x.chosen_task as "easy" | "hard"];
        expect(x.response_window).toBe(limit);
        expect(x.task_duration_ms).toBeLessThanOrEqual(limit);
        if (!x.completed) expect(x.task_duration_ms).toBe(limit);
        x.press_times.forEach((t: number) => expect(t).toBeLessThanOrEqual(limit));
      }
      // completion and failure both occur at the default press rates only sometimes; at least some tasks are completed
      expect(test(r).some((x) => x.completed)).toBe(true);
    },
  }),
  // two feedback screens: the completion screen is the shared check, the reward screen is checked here
  feedback_duration_ms: extendCheck(
    durationCheck({
      option: "feedback_duration_ms",
      part: "completion_feedback",
      count: "per_response",
    }),
    {
      fn: (r, ctx) =>
        durationCheck({
          option: "reward_feedback_duration_ms",
          part: "reward_feedback",
          count: "per_response",
        }).fn(r, ctx),
    }
  ),
  // the shared check reads `correct_response`, which a choice between two tasks does not have
  response_keys: {
    kind: "behaviour",
    requires: ["parts.response"],
    fn: (r) => {
      const keys = r.eff.response_keys;
      const trial = trialsOf(r, "choice").find((t) => t.data?.phase === "test")!;
      const given = typeof trial.choices === "function" ? trial.choices() : trial.choices;
      expect(given).toEqual(keys);
      choices(r).forEach((x) => {
        expect(x.response_keys).toEqual(keys);
        const lower = keys.map((k) => k.toLowerCase());
        const task =
          x.response === null ? "none" : x.response.toLowerCase() === lower[0] ? "easy" : "hard";
        // a key press is one of the two choice keys (jsPsych matches them case-insensitively)
        if (x.response !== null) expect(lower).toContain(x.response.toLowerCase());
        expect(x.choice).toBe(task);
      });
      // the instructions name the keys
      const pages = collectTrials(r.built.timeline)
        .filter((t) => t.data?.part === "instruction")
        .map((t) => t.stimulus as string)
        .join(" ");
      for (const k of keys) expect(pages).toContain(textOf(r).key_name(k));
    },
  },
};

export const CHECKS: CheckSet<EefrtOptions, Eff> = {
  ...sharedChecks,
  ...shared,
  ...eefrtOnly,
};
