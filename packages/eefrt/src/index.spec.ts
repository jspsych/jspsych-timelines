import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { version } from "../package.json";
import { MAX_SESSION_TRIALS } from "./constants";
import { EefrtOptions, resolveOptions } from "./options";
import { calculateScores } from "./scoring";
import { responses, run } from "./test-helpers";
import { TextConfig } from "./text";
import { createTimeline, timelineUnits, utils } from ".";

const parts = (rows: any[], phase: string, part: string) =>
  rows.filter((r) => r.phase === phase && r.part === part);

function allTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => allTrials(t, out));
  else if (tl?.timeline) allTrials(tl.timeline, out);
  else if (tl?.type) out.push(tl);
  return out;
}

describe("eefrt", () => {
  describe("createTimeline with the defaults (Treadway et al. 2009)", () => {
    it("runs in data-only simulation and ends: 4 practice trials, a 20-minute test, one completion row", async () => {
      const { rows } = await run({});
      expect(responses(rows, "practice")).toHaveLength(4);
      const test = responses(rows);
      expect(test.length).toBeGreaterThan(30);
      expect(test.length).toBeLessThan(MAX_SESSION_TRIALS);
      // every trial of the test started inside the 20 minutes, and the next would not have
      const starts = test.map((r) => r.session_elapsed_ms);
      starts.forEach((s) => expect(s).toBeLessThan(20 * 60000));
      expect(starts[starts.length - 1]).toBeGreaterThan(20 * 60000 - 60000);
      expect(rows.filter((r) => r.part === "completion")).toHaveLength(1);
      // one scorable row per trial; the choice, ready and feedback screens have their own rows
      for (const part of [
        "fixation",
        "choice",
        "ready",
        "completion_feedback",
        "reward_feedback",
      ]) {
        expect(parts(rows, "test", part).length).toBe(test.length);
      }
    });

    it("a test trial: fixation, choice, ready, effort, completion feedback, reward feedback, in that order", async () => {
      const { rows } = await run({
        practice_trials: 0,
        task_end_rule: "fixed_trial_count",
        n_test_trials: 2,
      });
      const order = rows.filter((r) => r.phase === "test").map((r) => r.part);
      expect(order.slice(0, 6)).toEqual([
        "fixation",
        "choice",
        "ready",
        "response",
        "completion_feedback",
        "reward_feedback",
      ]);
      expect(order).toHaveLength(12);
    });

    it("the first two practice trials are assigned (easy, then hard), then the participant chooses", async () => {
      const { rows } = await run({ practice_trials: 4 });
      const p = responses(rows, "practice");
      expect(p.map((r) => [r.choice, r.choice_forced, r.forced_by, r.chosen_task])).toEqual([
        ["none", true, "practice", "easy"],
        ["none", true, "practice", "hard"],
        expect.arrayContaining([expect.stringMatching(/easy|hard/), false, null]),
        expect.arrayContaining([expect.stringMatching(/easy|hard/), false, null]),
      ]);
      // only the free trials have a choice row
      expect(parts(rows, "practice", "choice")).toHaveLength(2);
    });

    it("tags every row with task and task_version, and the scorable row with phase and part", async () => {
      const { rows } = await run({ task_end_rule: "fixed_trial_count", n_test_trials: 3 });
      rows.forEach((r) => {
        expect(r.task).toBe("eefrt");
        expect(r.task_version).toBe(version);
      });
      responses(rows).forEach((r) => {
        expect(r).toMatchObject({ phase: "test", part: "response", block: 1 });
        expect(typeof r.trial_index_in_block).toBe("number");
      });
      expect(responses(rows).map((r) => r.trial_index_in_block)).toEqual([1, 2, 3]);
      // jsPsych's columns are never written by the package
      for (const t of allTrials(createTimeline(initJsPsych(), {}).timeline)) {
        for (const k of ["trial_type", "trial_index", "time_elapsed", "plugin_version"]) {
          expect(t.data ?? {}).not.toHaveProperty(k);
        }
      }
    });

    it("the response row carries the offer, the choice, the effort and the outcome", async () => {
      const { rows } = await run({
        practice_trials: 0,
        task_end_rule: "fixed_trial_count",
        n_test_trials: 8,
      });
      for (const r of responses(rows)) {
        expect([0.12, 0.5, 0.88]).toContain(r.win_probability);
        expect(r.easy_reward).toBe(1);
        expect(r.hard_reward).toBeGreaterThanOrEqual(1.24);
        expect(r.hard_reward).toBeLessThanOrEqual(4.3);
        expect(typeof r.win).toBe("boolean");
        expect(["easy", "hard", "none"]).toContain(r.choice);
        expect(["easy", "hard"]).toContain(r.chosen_task);
        expect(r.required_presses).toBe(r.chosen_task === "easy" ? 30 : 100);
        expect(r.press_times).toHaveLength(r.press_count);
        expect(r.reward_won).toBe(
          r.completed && r.win ? (r.chosen_task === "easy" ? 1 : r.hard_reward) : 0
        );
        expect(r.effort_key).toBe(" ");
        expect(r).not.toHaveProperty("correct");
        expect(r).not.toHaveProperty("stimulus");
      }
      // the reward of the previous trial
      const rs = responses(rows);
      rs.slice(1).forEach((r, i) => expect(r.reward_won_prev).toBe(rs[i].reward_won));
      expect(rs[0].reward_won_prev).toBe(0);
    });
  });

  describe("the session clock", () => {
    it("ends a fixed_time session when the simulated time is up, whatever the clock on the wall says", async () => {
      const short = await run({ session_duration_min: 3, practice_trials: 0 });
      const long = await run({ session_duration_min: 9, practice_trials: 0 });
      const s = responses(short.rows);
      const l = responses(long.rows);
      expect(s.length).toBeGreaterThan(2);
      expect(l.length).toBeGreaterThan(s.length * 2);
      s.forEach((r) => expect(r.session_elapsed_ms).toBeLessThan(3 * 60000));
      // the clock adds up the durations of the screens: 3 minutes is not reached after fewer than 3 trials
      const done = s[s.length - 1].session_elapsed_ms;
      expect(done).toBeGreaterThan(3 * 60000 - 45000);
    });

    it("terminates even if every screen is as short as it can be", async () => {
      const { rows } = await run({
        session_duration_min: 2,
        practice_trials: 0,
        fixation_duration_ms: 0,
        pre_block_countdown_ms: 0,
        feedback_duration_ms: 0,
        response_window_ms: { choice: 1000, easy: 1000, hard: 1000 },
        difficulty_levels: { easy: 3, hard: 3 },
      });
      const n = responses(rows).length;
      expect(n).toBeGreaterThan(10);
      expect(n).toBeLessThanOrEqual(MAX_SESSION_TRIALS);
      expect(parts(rows, "test", "fixation")).toHaveLength(0);
      expect(parts(rows, "test", "ready")).toHaveLength(0);
      expect(parts(rows, "test", "completion_feedback")).toHaveLength(0);
    });

    it("a fixed trial count ends on the count, whatever the time", async () => {
      const { rows } = await run({ n_test_trials: 7 });
      expect(responses(rows)).toHaveLength(7);
      expect(resolveOptions({ n_test_trials: 7 }).task_end_rule).toBe("fixed_trial_count");
    });

    it("the clock never runs behind the wall clock", async () => {
      const ctx = timelineUnits.createContext(initJsPsych(), {});
      ctx.state.wall_start = performance.now() - 5000;
      ctx.state.elapsed_ms = 1000;
      expect(utils.constants.MAX_SESSION_TRIALS).toBe(MAX_SESSION_TRIALS);
      // max(1000, ~5000)
      const { sessionClock } = await import("./trials");
      expect(sessionClock(ctx)).toBeGreaterThanOrEqual(5000);
    });
  });

  describe("a non-default configuration", () => {
    const options: EefrtOptions = {
      task_end_rule: "fixed_trial_count",
      n_test_trials: 10,
      practice_trials: 3,
      practice_forced_tasks: ["hard"],
      reward_probability: [0.25, 1],
      reward_magnitude: { easy: 2, hard: { levels: [3, 4, 5] } },
      difficulty_levels: { easy: 12, hard: 40 },
      response_window_ms: { choice: 6000, easy: 4000, hard: 9000 },
      response_keys: ["f", "j"],
      response_key_mapping: { easy: "a", hard: "s" },
      fixation_duration_ms: { min: 200, max: 400, step: 100 },
      pre_block_countdown_ms: 0,
      feedback_duration_ms: { completion: 0, reward: 700 },
      progress_indicator: "counter",
      outcome_type: "points",
      payout_rule: "percent_of_total_10",
      trial_order: "shuffled_list",
      device_eligibility: "none",
    };

    it("honours each option in the data", async () => {
      const { rows } = await run(options);
      const test = responses(rows);
      expect(test).toHaveLength(10);
      expect(responses(rows, "practice")).toHaveLength(3);
      expect(parts(rows, "practice", "response")[0]).toMatchObject({
        chosen_task: "hard",
        forced_by: "practice",
      });
      expect(parts(rows, "test", "ready")).toHaveLength(0);
      expect(parts(rows, "test", "completion_feedback")).toHaveLength(0);
      const reward = parts(rows, "test", "reward_feedback");
      expect(reward).toHaveLength(10);
      reward.forEach((r) => expect(r.feedback_duration).toBe(700));
      parts(rows, "test", "fixation").forEach((r) => {
        expect([200, 300, 400]).toContain(r.fixation_duration);
        expect(r.duration_ms).toBe(r.fixation_duration);
      });
      test.forEach((r) => {
        expect([0.25, 1]).toContain(r.win_probability);
        expect(r.easy_reward).toBe(2);
        expect([3, 4, 5]).toContain(r.hard_reward);
        expect(r.required_presses).toBe(r.chosen_task === "easy" ? 12 : 40);
        expect(r.response_window).toBe(r.chosen_task === "easy" ? 4000 : 9000);
        expect(r.effort_key).toBe(r.chosen_task === "easy" ? "a" : "s");
        expect(r.progress_indicator).toBe("counter");
        expect(r.hard_reward_text).toMatch(/^[345] points$/);
      });
      parts(rows, "test", "choice").forEach((r) => {
        expect(r.response_window).toBe(6000);
        expect(r.response_keys).toEqual(["f", "j"]);
        expect(["f", "j", null]).toContain(r.response);
      });
      const done = rows.find((r) => r.part === "completion");
      expect(done.payout_rule).toBe("percent_of_total_10");
      expect(done.paid_trials).toEqual([]);
    });

    it("probability 1 means every completed task pays", async () => {
      const { rows } = await run({ ...options, n_test_trials: 24 });
      const certain = responses(rows).filter((r) => r.win_probability === 1);
      expect(certain.length).toBeGreaterThan(3);
      certain.forEach((r) => expect(r.win).toBe(true));
    });

    it("test and practice follow their own overrides", async () => {
      const { rows } = await run({
        practice_trials: 3,
        task_end_rule: "fixed_trial_count",
        n_test_trials: 2,
        fixation_duration_ms: 500,
        practice: { fixation_duration_ms: 100, difficulty_levels: { easy: 5, hard: 9 } },
      });
      parts(rows, "practice", "fixation").forEach((r) => expect(r.fixation_duration).toBe(100));
      parts(rows, "test", "fixation").forEach((r) => expect(r.fixation_duration).toBe(500));
      responses(rows, "practice").forEach((r) =>
        expect(r.required_presses).toBe(r.chosen_task === "easy" ? 5 : 9)
      );
      responses(rows).forEach((r) =>
        expect(r.required_presses).toBe(r.chosen_task === "easy" ? 30 : 100)
      );
    });

    it("no practice, experimenter-led instructions: no instruction rows", async () => {
      const { rows } = await run({
        practice_trials: 0,
        instruction_format: "experimenter",
        task_end_rule: "fixed_trial_count",
        n_test_trials: 2,
      });
      expect(rows.filter((r) => r.phase === "instructions")).toHaveLength(0);
      expect(rows.filter((r) => r.phase === "practice")).toHaveLength(0);
      expect(responses(rows)).toHaveLength(2);
    });

    it("an untimed choice has no choice timeouts", async () => {
      const { rows } = await run(
        { ...options, response_window_ms: null },
        { default: { data: { rt: 50000 } } }
      );
      parts(rows, "test", "choice").forEach((r) => {
        expect(r.timeout).toBe(false);
        expect(r.response_window).toBeNull();
      });
    });
  });

  describe("timeouts: no choice in time", () => {
    it("records null response and null rt, assigns a task at random and flags the trial", async () => {
      const { rows } = await run(
        { practice_trials: 0, task_end_rule: "fixed_trial_count", n_test_trials: 30 },
        { default: { data: { rt: 50000 } } }
      );
      const choice = parts(rows, "test", "choice");
      expect(choice).toHaveLength(30);
      choice.forEach((r) => {
        expect(r).toMatchObject({ timeout: true, response: null, rt: null, choice: "none" });
      });
      const test = responses(rows);
      test.forEach((r) => {
        expect(r).toMatchObject({
          choice: "none",
          choice_forced: true,
          forced_by: "timeout",
          choice_rt: null,
        });
      });
      // both tasks are drawn
      expect(new Set(test.map((r) => r.chosen_task)).size).toBe(2);
      // forced trials are flagged and left out of the choice proportions
      const s = calculateScores(new DataCollection(rows));
      expect(s.n_forced).toBe(30);
      expect(s.n_valid_choices).toBe(0);
      expect(s.proportion_hard).toBeNull();
    });

    it("the choice is drawn once per trial (jsPsych may evaluate simulation_options more than once)", async () => {
      const sim = await import("./simulation");
      const spy = jest.spyOn(sim, "simulateChoice");
      try {
        const { rows } = await run({
          practice_trials: 0,
          task_end_rule: "fixed_trial_count",
          n_test_trials: 12,
        });
        expect(spy.mock.calls.length).toBe(parts(rows, "test", "choice").length);
      } finally {
        spy.mockRestore();
      }
    });

    it("a fast participant never times out", async () => {
      const { rows } = await run(
        { practice_trials: 0, task_end_rule: "fixed_trial_count", n_test_trials: 10 },
        { default: { data: { rt: 300 } } }
      );
      parts(rows, "test", "choice").forEach((r) => {
        expect(r.timeout).toBe(false);
        expect(r.rt).toBe(300);
      });
      responses(rows).forEach((r) => expect(r.choice_forced).toBe(false));
    });

    it("the simulated participant sometimes misses the window", async () => {
      const { rows } = await run({
        practice_trials: 0,
        task_end_rule: "fixed_trial_count",
        n_test_trials: 400,
      });
      const missed = responses(rows).filter((r) => r.choice_forced);
      expect(missed.length).toBeGreaterThan(0);
      expect(missed.length).toBeLessThan(40);
      missed.forEach((r) => expect(r.forced_by).toBe("timeout"));
    });
  });

  describe("the simulated participant", () => {
    const options: EefrtOptions = {
      practice_trials: 0,
      task_end_rule: "fixed_trial_count",
      n_test_trials: 900,
      trial_order: "random",
    };
    let scores: ReturnType<typeof calculateScores>;
    let rows: any[];
    beforeAll(async () => {
      ({ rows } = await run(options, {}, "effects"));
      // a trial count is its own limit: more than MAX_SESSION_TRIALS is honoured
      expect(responses(rows)).toHaveLength(900);
      scores = calculateScores(new DataCollection(rows));
    });

    it("chooses the hard task more often with a higher win probability", () => {
      const p = Object.fromEntries(
        scores.proportion_hard_by_probability.map((x) => [x.probability, x.proportion_hard!])
      );
      expect(p[0.88]).toBeGreaterThan(p[0.5]);
      expect(p[0.5]).toBeGreaterThan(p[0.12]);
      expect(p[0.88] - p[0.12]).toBeGreaterThan(0.3);
    });

    it("chooses the hard task more often with a higher hard reward", () => {
      const b = Object.fromEntries(
        scores.proportion_hard_by_reward_bin.map((x) => [x.bin, x.proportion_hard!])
      );
      expect(b.high).toBeGreaterThan(b.mid);
      expect(b.mid).toBeGreaterThan(b.low);
      // the sign of the slopes, over free choices
      const free = responses(rows).filter((r) => r.choice !== "none");
      const corr = (x: number[], y: number[]) => {
        const n = x.length;
        const mx = x.reduce((a, b) => a + b) / n;
        const my = y.reduce((a, b) => a + b) / n;
        return (
          x.reduce((a, v, i) => a + (v - mx) * (y[i] - my), 0) /
          Math.sqrt(
            x.reduce((a, v) => a + (v - mx) ** 2, 0) * y.reduce((a, v) => a + (v - my) ** 2, 0)
          )
        );
      };
      const hard = free.map((r) => (r.choice === "hard" ? 1 : 0));
      expect(
        corr(
          free.map((r) => r.win_probability),
          hard
        )
      ).toBeGreaterThan(0.2);
      expect(
        corr(
          free.map((r) => r.hard_reward),
          hard
        )
      ).toBeGreaterThan(0.1);
    });

    it("presses at plausible rates and sometimes fails", () => {
      expect(scores.completion_rate).toBeGreaterThan(0.75);
      expect(scores.completion_rate).toBeLessThan(0.99);
      expect(scores.completion_rate_easy!).toBeGreaterThan(scores.completion_rate_hard!);
      expect(scores.mean_press_rate_easy!).toBeGreaterThan(4.5);
      expect(scores.mean_press_rate_easy!).toBeLessThan(7);
      expect(scores.mean_press_rate_hard!).toBeGreaterThan(4);
      expect(scores.mean_press_rate_hard!).toBeLessThan(6.5);
      const failed = responses(rows).filter((r) => !r.completed);
      expect(failed.length).toBeGreaterThan(0);
      failed.forEach((r) => {
        expect(r.press_count).toBeLessThan(r.required_presses);
        expect(r.task_duration_ms).toBe(r.response_window);
        expect(r.reward_won).toBe(0);
      });
    });
  });

  describe("instruction text follows the resolved options", () => {
    const pages = (o: EefrtOptions) => {
      const ctx = timelineUnits.createContext(initJsPsych(), o);
      return allTrials(timelineUnits.createInstructions(ctx).timeline)
        .map((t) => t.stimulus as string)
        .join("\n");
    };
    const intro = (o: EefrtOptions, which: "createPracticeIntro" | "createTestIntro") => {
      const ctx = timelineUnits.createContext(initJsPsych(), o);
      return (timelineUnits[which](ctx) as any).stimulus as string;
    };

    it("default: the anchor's numbers and the space bar", () => {
      const t = pages({});
      expect(t).toContain("30 presses in 7 seconds");
      expect(t).toContain("100 presses in 21 seconds");
      expect(t).toContain("<kbd>space</kbd>");
      expect(t).toContain("$1.00");
      expect(t).toContain("$1.24 to $4.30");
      expect(t).toContain("12%, 50% and 88%");
      expect(t).toContain("<kbd>E</kbd>");
      expect(t).toContain("5 seconds to choose");
      expect(t).toContain("20 minutes");
      expect(t).toContain("two of the trials you won");
      expect(t).toContain("index finger of your dominant hand");
      expect(t).toContain("little finger of your non-dominant hand");
    });

    it("a non-default design is described as configured", () => {
      const t = pages({
        task_end_rule: "fixed_trial_count",
        n_test_trials: 36,
        difficulty_levels: { easy: 12, hard: 40 },
        response_window_ms: { choice: null, easy: 4000, hard: 9500 },
        response_keys: ["f", "j"],
        response_key_mapping: { easy: "a", hard: "l" },
        reward_magnitude: { easy: 2, hard: { levels: [3, 5] } },
        reward_probability: [0.25, 0.75],
        outcome_type: "points",
        payout_rule: "percent_of_total_5",
      });
      expect(t).toContain("press <kbd>A</kbd> 12 times in 4 seconds");
      expect(t).toContain("press <kbd>L</kbd> 40 times in 9.5 seconds");
      expect(t).toContain("<kbd>F</kbd>");
      expect(t).toContain("<kbd>J</kbd>");
      expect(t).toContain("2 points");
      expect(t).toContain("3 points to 5 points");
      expect(t).toContain("25% and 75%");
      expect(t).toContain("There are 36 trials");
      expect(t).toContain("5% of the total");
      expect(t).toContain("Take your time");
      // nothing of the default design survives
      for (const stale of [
        "30 presses",
        "100 presses",
        "7 seconds",
        "21 seconds",
        "20 minutes",
        "12%",
        "88%",
        "$",
        "5 seconds to choose",
        "two of the trials",
      ]) {
        expect(t).not.toContain(stale);
      }
    });

    it("a single hard reward and a certain win drop the sentences about them", () => {
      const t = pages({ reward_magnitude: { hard: { levels: [3] } }, reward_probability: [1] });
      expect(t).toContain("The hard task is worth $3.00");
      expect(t).not.toContain("changes from trial to trial");
      expect(t).toContain("You win the reward whenever you complete the task");
      expect(t).not.toContain("chance that the trial pays");
    });

    it("the practice and test introductions say what changes", () => {
      const p = intro(
        { practice_trials: 4, response_window_ms: { choice: 3000 } },
        "createPracticeIntro"
      );
      expect(p).toContain("real pace");
      expect(p).toContain("3 seconds to choose");
      expect(p).toContain("assigned to you (easy and hard)");
      expect(p).toContain("main task starts after the 4 practice trials");
      expect(
        intro({ practice_trials: 2, practice_forced_tasks: [] }, "createPracticeIntro")
      ).not.toContain("assigned to you");
      const t = intro({ n_test_trials: 9 }, "createTestIntro");
      expect(t).toContain("There are 9 trials");
      expect(intro({ session_duration_min: 12 }, "createTestIntro")).toContain("12 minutes");
    });

    it("translatable: the currency, the finger instructions and the key names follow `text`", () => {
      const text: Partial<TextConfig> = {
        amount: ({ value }) => `${value.toFixed(2).replace(".", ",")} €`,
        finger_instruction: ({ task }) =>
          task === "easy" ? "mit dem Zeigefinger" : "mit dem kleinen Finger",
        key_name: (k) => (k === " " ? "Leertaste" : k.toUpperCase()),
      };
      const t = pages({ text });
      expect(t).toContain("1,00 €");
      expect(t).toContain("1,24 € to 4,30 €");
      expect(t).toContain("mit dem Zeigefinger");
      expect(t).toContain("<kbd>Leertaste</kbd>");
      expect(t).not.toContain("$");
    });
  });

  describe("choice and effort screens follow the options", () => {
    it("the choice screen shows the offer, the requirement of each task and the keys; no chance line for a certain win", async () => {
      const ctx = timelineUnits.createContext(initJsPsych(), {
        difficulty_levels: { easy: 12, hard: 40 },
        response_window_ms: { easy: 4000, hard: 9000 },
        response_keys: ["f", "j"],
      });
      ctx.state.plan = {
        o: ctx.test,
        offer: { probability: 0.5, hard_reward: 3.1, easy_reward: 1, win: true, cell: 0 },
      } as any;
      const choice = allTrials(timelineUnits.createTrialLoop(ctx, "test").timeline).find(
        (t) => t.data.part === "choice"
      );
      const html = choice.stimulus();
      expect(html).toContain("50% chance of winning");
      expect(html).toContain("12 presses in 4 seconds");
      expect(html).toContain("40 presses in 9 seconds");
      expect(html).toContain("$3.10");
      expect(html).toContain("<kbd>F</kbd>");
      expect(html).toContain("<kbd>J</kbd>");
      const certain = timelineUnits.createContext(initJsPsych(), { reward_probability: [1] });
      certain.state.plan = {
        o: certain.test,
        offer: { probability: 1, hard_reward: 3.1, easy_reward: 1, win: true, cell: 0 },
      } as any;
      const html1 = allTrials(timelineUnits.createTrialLoop(certain, "test").timeline)
        .find((t) => t.data.part === "choice")
        .stimulus();
      expect(html1).not.toContain("chance of winning");
    });
  });

  describe("units and utils", () => {
    it("exports createTimeline, timelineUnits and utils", () => {
      expect(typeof createTimeline).toBe("function");
      for (const k of [
        "createContext",
        "createInstructions",
        "createInstructionWalkthrough",
        "createTrialLoop",
        "createCompletion",
        "createDeviceCheck",
      ]) {
        expect(typeof (timelineUnits as any)[k]).toBe("function");
      }
      expect(utils.constants.TASK_NAME).toBe("eefrt");
      expect(utils.constants.VERSION).toBe(version);
      expect(utils.constants.DEFAULT_OPTIONS.session_duration_min).toBe(20);
      expect(typeof utils.text.defaultText.amount).toBe("function");
      expect(typeof utils.scoring.calculateScores).toBe("function");
    });

    it("every trial sets the task's css class", () => {
      const { timeline } = createTimeline(initJsPsych(), {});
      for (const t of allTrials(timeline))
        expect(t.css_classes).toEqual(["jspsych-timelines-eefrt"]);
    });

    it("the completion screen reports the headline numbers and the payout", async () => {
      const jsPsych: JsPsych = initJsPsych();
      jsPsych.randomization.setSeed("done");
      const { rows } = await run({
        practice_trials: 0,
        task_end_rule: "fixed_trial_count",
        n_test_trials: 40,
      });
      const done = rows.find((r) => r.part === "completion");
      const wins = responses(rows).filter((r) => r.reward_won > 0);
      expect(done.paid_trials.length).toBe(Math.min(2, wins.length));
      expect(done.payout).toBeCloseTo(
        wins
          .filter((r) => done.paid_trials.includes(r.trial_index_in_block))
          .reduce((a, r) => a + r.reward_won, 0),
        10
      );
    });
  });
});
