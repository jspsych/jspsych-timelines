import { simulateTimeline } from "@jspsych/test-utils";
import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { version } from "../package.json";
import { MAX_TRIAL_REPEATS } from "./constants";
import { DEFAULT_OPTIONS, TwoStepTaskOptions, resolveOptions, validateOptions } from "./options";
import { buildSchedule, generateWalk, splitTrials, stepProbability } from "./schedule";
import { calculateScores, getSummary, trialTable } from "./scoring";
import { prepareSet } from "./sets";
import { setSimulatedAgent } from "./simulation";
import { defaultText } from "./text";
import { createTimeline, timelineUnits, utils } from ".";

jest.setTimeout(60000);

async function simulate(
  jsPsych: JsPsych,
  options: TwoStepTaskOptions,
  sim: Record<string, any> = { default: { data: { rt: 400 } } }
) {
  const { timeline } = createTimeline(jsPsych, options);
  const { getData, expectFinished } = await simulateTimeline(timeline, "data-only", sim, jsPsych);
  await expectFinished();
  return getData().values() as any[];
}

function allTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => allTrials(t, out));
  else if (tl?.timeline) allTrials(tl.timeline, out);
  else if (tl?.type) out.push(tl);
  return out;
}

const responses = (rows: any[], phase = "test") =>
  rows.filter((r) => r.phase === phase && r.part === "response");

describe("two-step-task", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("unit");
    setSimulatedAgent(null);
  });

  describe("createTimeline", () => {
    it("builds the default timeline: 50 practice and 200 test trials in 2 blocks", async () => {
      const rows = await simulate(jsPsych, {});
      expect(responses(rows, "practice")).toHaveLength(50);
      expect(responses(rows)).toHaveLength(200);
      expect(new Set(responses(rows).map((r) => r.block))).toEqual(new Set([1, 2]));
      expect(responses(rows).filter((r) => r.block === 1)).toHaveLength(100);
      expect(rows[rows.length - 1].part).toBe("completion");
    });

    it("builds a non-default timeline: counts, keys, framing, breaks, questionnaire", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 3,
        n_test_trials: 9,
        n_blocks: 3,
        response_keys: ["f", "j"],
        stimulus_set: utils.stimuli.spaceshipPlanetAlien,
        rest_breaks: "self_paced",
        manipulation_check: "questionnaire",
        feedback_duration_ms: 0,
        fixation_duration_ms: 300,
      });
      expect(responses(rows, "practice")).toHaveLength(3);
      expect(responses(rows).map((r) => r.block)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
      expect(rows.filter((r) => r.part === "rest")).toHaveLength(2);
      expect(rows.filter((r) => r.part === "manipulation_check")).toHaveLength(2);
      expect(rows.filter((r) => r.part === "feedback")).toHaveLength(0);
      expect(rows.filter((r) => r.phase === "test" && r.part === "fixation")).toHaveLength(9);
      expect(new Set(rows.filter((r) => r.part === "choice").map((r) => r.response))).toEqual(
        new Set(["f", "j"])
      );
    });

    it("tags every row with task and task_version; scorable rows have phase and part", async () => {
      const rows = await simulate(jsPsych, { practice_trials: 2, n_test_trials: 4, n_blocks: 1 });
      for (const r of rows) {
        expect(r.task).toBe("two-step-task");
        expect(r.task_version).toBe(version);
      }
      expect(utils.constants.VERSION).toBe(version);
      for (const r of responses(rows)) {
        expect(["practice", "test"]).toContain(r.phase);
        expect(r.trial_index_in_block).toBeGreaterThan(0);
      }
    });

    it("never writes a column that jsPsych owns", () => {
      const reserved = ["trial_type", "trial_index", "time_elapsed", "plugin_version"];
      const { timeline } = createTimeline(jsPsych, { practice_trials: 2, n_test_trials: 2 });
      for (const t of allTrials(timeline)) {
        for (const k of reserved) expect(Object.keys(t.data ?? {})).not.toContain(k);
      }
    });

    it("sets the task class on every trial", () => {
      const { timeline } = createTimeline(jsPsych, { practice_trials: 2, n_test_trials: 2 });
      const trials = allTrials(timeline);
      expect(trials.length).toBeGreaterThan(20);
      for (const t of trials) expect(t.css_classes).toEqual(["jspsych-timelines-two-step-task"]);
    });

    it("uses no Math.random", () => {
      // the source is scanned in the repository's lint step; here the schedule is drawn from the seeded generator
      const a = buildSchedule(initJsPsych(), resolveOptions({}), 5);
      expect(a).toHaveLength(5);
    });
  });

  describe("rows of one trial", () => {
    it("writes the choices, the transition and the reward on the response row", async () => {
      const rows = await simulate(jsPsych, { practice_trials: 0, n_test_trials: 6, n_blocks: 1 });
      const r = responses(rows);
      expect(r).toHaveLength(6);
      for (const x of r) {
        expect(["A", "B"]).toContain(x.stage1_choice);
        expect(["common", "rare"]).toContain(x.transition);
        expect(x.condition).toBe(x.transition);
        const usual = x.stage1_choice === "A" ? "red" : "blue";
        const unusual = usual === "red" ? "blue" : "red";
        expect(x.stage2_state).toBe(x.transition === "common" ? usual : unusual);
        expect(["option_1", "option_2"]).toContain(x.stage2_choice);
        expect([0, 1]).toContain(x.reward);
        expect(x.missed).toBe(false);
        expect(x.missed_stage).toBeNull();
        expect(x.stage1_rt).toBe(400);
        expect(x.stage2_rt).toBe(400);
        // the first choice is also the row's own response, so battery-wide filters find a response
        expect(x.response).toBe(x.stage1_key);
        expect(x.rt).toBe(x.stage1_rt);
        // the schedule is on the row
        expect(Object.keys(x.reward_probs)).toEqual(["red", "blue"]);
        expect(x.reward_walk).toContain("reverse_step");
        expect(x).not.toHaveProperty("correct");
        expect(x).not.toHaveProperty("correct_response");
      }
    });

    it("writes one choice row per stage, with the options on screen", async () => {
      const rows = await simulate(jsPsych, { practice_trials: 0, n_test_trials: 4, n_blocks: 1 });
      const choices = rows.filter((r) => r.part === "choice");
      expect(choices.map((c) => c.stage)).toEqual([1, 2, 1, 2, 1, 2, 1, 2]);
      for (const c of choices) {
        expect([c.left, c.right].sort()).toEqual(
          c.stage === 1 ? ["A", "B"] : ["option_1", "option_2"]
        );
        expect(c.choice).toBe(c.side === "left" ? c.left : c.right);
      }
      // the stage-2 choice carries the state, the stage-1 choice does not
      expect(choices.filter((c) => c.stage === 1).every((c) => c.state === null)).toBe(true);
      expect(
        choices.filter((c) => c.stage === 2).every((c) => ["red", "blue"].includes(c.state))
      ).toBe(true);
    });

    it("records a missed first choice as missed, with null response and rt, and no second stage", async () => {
      const rows = await simulate(
        jsPsych,
        { practice_trials: 0, n_test_trials: 5, n_blocks: 1 },
        { default: { data: { rt: 50000 } } }
      );
      const r = responses(rows);
      expect(r).toHaveLength(5);
      for (const x of r) {
        expect(x).toMatchObject({
          missed: true,
          missed_stage: 1,
          response: null,
          rt: null,
          stage1_choice: null,
          stage2_state: null,
          stage2_choice: null,
          reward: null,
          transition: null,
          timeout: true,
        });
        // the transition that was drawn is still recorded
        expect(["common", "rare"]).toContain(x.planned_transition);
      }
      const choices = rows.filter((c) => c.part === "choice");
      expect(choices.every((c) => c.stage === 1 && c.response === null && c.rt === null)).toBe(
        true
      );
      expect(rows.filter((c) => c.part === "timeout_message")).toHaveLength(5);
      expect(rows.filter((c) => c.part === "feedback")).toHaveLength(0);
    });

    it("skip_trial moves on after a miss; repeat_trial repeats the same trial, with the same schedule, up to the cap", async () => {
      const slow = { default: { data: { rt: 50000 } } };
      const skip = responses(
        await simulate(
          jsPsych,
          { practice_trials: 0, n_test_trials: 3, missed_response_handling: "skip_trial" },
          slow
        )
      );
      expect(skip).toHaveLength(3);
      jsPsych = initJsPsych();
      jsPsych.randomization.setSeed("unit");
      const rep = responses(
        await simulate(
          jsPsych,
          {
            practice_trials: 0,
            n_test_trials: 3,
            n_blocks: 1,
            missed_response_handling: "repeat_trial",
          },
          slow
        )
      );
      expect(rep).toHaveLength(3 * (1 + MAX_TRIAL_REPEATS));
      const first = rep.filter((x) => x.trial_index_in_block === 1);
      expect(first.map((x) => x.attempt)).toEqual([1, 2, 3, 4, 5, 6]);
      // the same trial: same probabilities, same planned transition
      expect(new Set(first.map((x) => JSON.stringify(x.reward_probs))).size).toBe(1);
      expect(new Set(first.map((x) => x.planned_transition)).size).toBe(1);
    });

    it("repeat_trial runs on to the next trial when the repeat is answered", async () => {
      // nobody misses a choice, so no trial is repeated
      const rows = await simulate(
        jsPsych,
        {
          practice_trials: 0,
          n_test_trials: 2,
          n_blocks: 1,
          missed_response_handling: "repeat_trial",
        },
        { default: { data: { rt: 400 } } }
      );
      expect(responses(rows)).toHaveLength(2);
      expect(responses(rows).every((x) => x.attempt === 1 && !x.missed)).toBe(true);
    });

    describe("a participant who is sometimes too slow (the simulated learner with a window near its RT)", () => {
      const sometimes = async (handling: "skip_trial" | "repeat_trial") => {
        const p = initJsPsych();
        p.randomization.setSeed("misses-" + handling);
        const { timeline } = createTimeline(p, {
          instruction_format: "experimenter",
          practice_trials: 0,
          n_test_trials: 80,
          n_blocks: 1,
          response_window_ms: 560,
          missed_response_handling: handling,
        });
        const { getData, expectFinished } = await simulateTimeline(timeline, "data-only", {}, p);
        await expectFinished();
        return getData().values() as any[];
      };

      it("skip_trial: a missed second stage has no reward, no outcome display, and the next trial goes on", async () => {
        const rows = await sometimes("skip_trial");
        const r = responses(rows);
        expect(r).toHaveLength(80);
        const stage1 = r.filter((x) => x.missed_stage === 1);
        const stage2 = r.filter((x) => x.missed_stage === 2);
        const done = r.filter((x) => !x.missed);
        expect(stage1.length).toBeGreaterThan(3);
        expect(stage2.length).toBeGreaterThan(3);
        expect(done.length).toBeGreaterThan(3);
        for (const x of stage2) {
          // the first choice and the transition happened; the second choice did not
          expect(x.stage1_choice).not.toBeNull();
          expect(x.transition).not.toBeNull();
          expect(x.stage2_state).not.toBeNull();
          expect(x).toMatchObject({
            stage2_choice: null,
            stage2_rt: null,
            reward: null,
            timeout: true,
          });
        }
        // an outcome is shown for completed trials only; the "too slow" message for the others
        expect(rows.filter((x) => x.part === "feedback")).toHaveLength(done.length);
        expect(rows.filter((x) => x.part === "timeout_message")).toHaveLength(80 - done.length);
        expect(rows.filter((x) => x.part === "timeout_message" && x.stage === 2)).toHaveLength(
          stage2.length
        );
        // a miss ends the trial: no second-stage choice after a stage-1 miss
        const choiceRows = rows.filter((x) => x.part === "choice" && x.stage === 2);
        expect(choiceRows).toHaveLength(80 - stage1.length);
      });

      it("repeat_trial: a trial missed at either stage is run again, and the repeat can be answered", async () => {
        const rows = await sometimes("repeat_trial");
        const r = responses(rows);
        const repeats = r.filter((x) => x.attempt > 1);
        expect(repeats.length).toBeGreaterThan(3);
        // some repeated trials end up completed
        expect(repeats.some((x) => !x.missed)).toBe(true);
        // every trial number ends with a completed attempt, or the cap
        const last = new Map<number, any>();
        r.forEach((x) => last.set(x.trial_index_in_block, x));
        expect(last.size).toBe(80);
        for (const x of last.values())
          expect(!x.missed || x.attempt === 1 + MAX_TRIAL_REPEATS).toBe(true);
        // the same trial keeps its schedule across attempts
        const first = r.filter((x) => x.trial_index_in_block === repeats[0].trial_index_in_block);
        expect(new Set(first.map((x) => JSON.stringify(x.reward_probs))).size).toBe(1);
        expect(new Set(first.map((x) => x.planned_transition)).size).toBe(1);
        // scores count the attempts, and the completed trials
        const s = calculateScores(new DataCollection(r));
        expect(s.n_trials).toBe(r.length);
        expect(s.n_completed + s.n_missed).toBe(r.length);
        expect(s.n_missed).toBe(r.filter((x) => x.missed).length);
      });
    });

    it("response rows record the window and the walk", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 0,
        n_test_trials: 2,
        response_window_ms: 1500,
        reward_schedule: { kind: "random_walk", sd: 0.05, bounds: [0.2, 0.8], boundary: "reflect" },
      });
      for (const x of responses(rows)) {
        expect(x.response_window).toBe(1500);
        expect(x.reward_walk).toBe("random_walk sd=0.05 bounds=[0.2,0.8] boundary=reflect");
        expect(x.common_transition_prob).toBe(0.7);
      }
      for (const c of rows.filter((x) => x.part === "choice")) expect(c.response_window).toBe(1500);
    });
  });

  describe("schedule", () => {
    it("is identical for a seed, whatever the participant does, and records the walk", async () => {
      const run = async (rt: number) => {
        const p = initJsPsych();
        p.randomization.setSeed("same");
        return responses(
          await simulate(
            p,
            { practice_trials: 0, n_test_trials: 30 },
            { default: { data: { rt } } }
          )
        );
      };
      const a = await run(400);
      const b = await run(900);
      expect(a.map((x) => x.reward_probs)).toEqual(b.map((x) => x.reward_probs));
      expect(a.map((x) => x.planned_transition)).toEqual(b.map((x) => x.planned_transition));
      const other = initJsPsych();
      other.randomization.setSeed("different");
      const c = responses(await simulate(other, { practice_trials: 0, n_test_trials: 30 }));
      expect(c.map((x) => x.reward_probs)).not.toEqual(a.map((x) => x.reward_probs));
    });

    it("does not depend on durations, jitter or the instructions", async () => {
      const probs = async (o: TwoStepTaskOptions) => {
        const p = initJsPsych();
        p.randomization.setSeed("independent");
        return responses(await simulate(p, { practice_trials: 3, n_test_trials: 12, ...o })).map(
          (x) => [x.reward_probs, x.planned_transition, x.stage1_left]
        );
      };
      const plain = await probs({});
      expect(
        await probs({
          iti_ms: { min: 100, max: 900 },
          fixation_duration_ms: { min: 200, max: 500 },
        })
      ).toEqual(plain);
      expect(await probs({ instruction_format: "experimenter", feedback_duration_ms: 0 })).toEqual(
        plain
      );
    });

    it("the reward walk stays within its bounds and steps with the schedule's SD", () => {
      const o = resolveOptions({ n_test_trials: 400 });
      const plans = buildSchedule(jsPsych, o, 400);
      const steps: number[] = [];
      plans.forEach((p, i) => {
        for (const s of ["red", "blue"] as const)
          for (const k of ["option_1", "option_2"] as const) {
            expect(p.probs[s][k]).toBeGreaterThanOrEqual(0.25);
            expect(p.probs[s][k]).toBeLessThanOrEqual(0.75);
            if (i > 0) steps.push(p.probs[s][k] - plans[i - 1].probs[s][k]);
          }
      });
      const m = steps.reduce((a, b) => a + b, 0) / steps.length;
      const sd = Math.sqrt(steps.reduce((a, b) => a + (b - m) ** 2, 0) / (steps.length - 1));
      expect(sd).toBeGreaterThan(0.02);
      expect(sd).toBeLessThan(0.03);
    });

    it("reflect folds a step back inside; reverse_step takes the opposite step", () => {
      const bounds: [number, number] = [0.25, 0.75];
      expect(stepProbability(0.74, 0.03, bounds, "reflect")).toBeCloseTo(0.73, 10);
      expect(stepProbability(0.26, -0.03, bounds, "reflect")).toBeCloseTo(0.27, 10);
      expect(stepProbability(0.74, 0.03, bounds, "reverse_step")).toBeCloseTo(0.71, 10);
      expect(stepProbability(0.26, -0.03, bounds, "reverse_step")).toBeCloseTo(0.29, 10);
      // a step that stays inside is taken as it is
      expect(stepProbability(0.5, 0.02, bounds, "reflect")).toBeCloseTo(0.52, 10);
      expect(stepProbability(0.5, -0.02, bounds, "reverse_step")).toBeCloseTo(0.48, 10);
      // the two rules differ exactly at the bounds
      expect(stepProbability(0.74, 0.03, bounds, "reflect")).not.toBeCloseTo(
        stepProbability(0.74, 0.03, bounds, "reverse_step"),
        3
      );
      // a huge step is folded repeatedly, or clamped
      expect(stepProbability(0.5, 2, bounds, "reflect")).toBeGreaterThanOrEqual(0.25);
      expect(stepProbability(0.5, 2, bounds, "reflect")).toBeLessThanOrEqual(0.75);
      expect(stepProbability(0.5, 2, bounds, "reverse_step")).toBe(0.25);
    });

    it("starts from the given probabilities or a uniform draw from the range", () => {
      const o = resolveOptions({
        reward_probability: { red: { option_1: 0.25, option_2: { min: 0.4, max: 0.6 } } },
      });
      const starts = Array.from({ length: 20 }, () => buildSchedule(jsPsych, o, 1)[0].probs);
      expect(starts.every((p) => p.red.option_1 === 0.25)).toBe(true);
      expect(starts.every((p) => p.red.option_2 >= 0.4 && p.red.option_2 <= 0.6)).toBe(true);
      // blue is the default range 0.25-0.75: the draws differ and fill it
      const blue = starts.map((p) => p.blue.option_1);
      expect(new Set(blue).size).toBeGreaterThan(15);
      expect(Math.min(...blue)).toBeGreaterThanOrEqual(0.25);
      expect(Math.max(...blue)).toBeLessThanOrEqual(0.75);
    });

    it("draws the realised rewards from the probabilities and the transitions from common_transition_prob", () => {
      const o = resolveOptions({ common_transition_prob: 0.8 });
      const plans = buildSchedule(jsPsych, o, 1000);
      const common = plans.filter((p) => p.common).length / plans.length;
      expect(common).toBeGreaterThan(0.76);
      expect(common).toBeLessThan(0.84);
      const meanP = plans.reduce((a, p) => a + p.probs.red.option_1, 0) / plans.length;
      const rewarded = plans.filter((p) => p.rewards.red.option_1).length / plans.length;
      expect(Math.abs(rewarded - meanP)).toBeLessThan(0.06);
    });

    it("balances the sides within a block when counterbalanced, and fixes them when fixed", () => {
      const counter = buildSchedule(
        jsPsych,
        resolveOptions({ option_side_assignment: "counterbalanced" }),
        10,
        [5, 5]
      );
      expect(counter.slice(0, 5).filter((p) => p.ship_left === "A").length).toBeGreaterThanOrEqual(
        2
      );
      expect(counter.slice(0, 5).filter((p) => p.ship_left === "A").length).toBeLessThanOrEqual(3);
      expect(counter.slice(5).filter((p) => p.ship_left === "A").length).toBeGreaterThanOrEqual(2);
      const fixed = buildSchedule(jsPsych, resolveOptions({ option_side_assignment: "fixed" }), 12);
      expect(new Set(fixed.map((p) => p.ship_left)).size).toBe(1);
      expect(new Set(fixed.map((p) => p.alien_left.red)).size).toBe(1);
    });

    it("splitTrials gives the remainder to the first blocks", () => {
      expect(splitTrials(201, 3)).toEqual([67, 67, 67]);
      expect(splitTrials(10, 4)).toEqual([3, 3, 2, 2]);
    });

    it("generateWalk starts at the start values", () => {
      const start = {
        red: { option_1: 0.3, option_2: 0.4 },
        blue: { option_1: 0.5, option_2: 0.6 },
      };
      const walk = generateWalk(
        jsPsych,
        start,
        { kind: "random_walk", sd: 0.025, bounds: [0.25, 0.75], boundary: "reflect" },
        3
      );
      expect(walk[0]).toEqual(start);
      expect(walk).toHaveLength(3);
    });
  });

  describe("durations", () => {
    it("samples jittered durations per trial from the seeded generator and records them", async () => {
      const options: TwoStepTaskOptions = {
        practice_trials: 0,
        n_test_trials: 20,
        iti_ms: { min: 1000, max: 2000, step: 250 },
        fixation_duration_ms: { min: 200, max: 400, step: 100 },
        response_acknowledgement_ms: 300,
      };
      const a = await simulate(jsPsych, options);
      const iti = a.filter((r) => r.part === "iti").map((r) => r.iti);
      expect(iti).toHaveLength(20);
      iti.forEach((x) => expect([1000, 1250, 1500, 1750, 2000]).toContain(x));
      expect(new Set(iti).size).toBeGreaterThan(1);
      a.filter((r) => r.part === "iti").forEach((r) => expect(r.duration_ms).toBe(r.iti));
      a.filter((r) => r.part === "fixation").forEach((r) =>
        expect([200, 300, 400]).toContain(r.fixation_duration)
      );
      a.filter((r) => r.part === "acknowledgement").forEach((r) =>
        expect(r.response_acknowledgement).toBe(300)
      );
      const again = initJsPsych();
      again.randomization.setSeed("unit");
      const b = await simulate(again, options);
      expect(b.filter((r) => r.part === "iti").map((r) => r.iti)).toEqual(iti);
    });

    it("0 removes the display; the outcome shows the running total", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 0,
        n_test_trials: 6,
        iti_ms: 0,
        response_acknowledgement_ms: 0,
      });
      expect(rows.filter((r) => r.part === "iti")).toHaveLength(0);
      expect(rows.filter((r) => r.part === "acknowledgement")).toHaveLength(0);
      const fb = rows.filter((r) => r.part === "feedback");
      expect(fb.map((r) => r.running_total)).toEqual(
        fb.map((_, i) => fb.slice(0, i + 1).reduce((a, r) => a + r.reward, 0))
      );
    });

    it("practice coins are counted apart from the main task", async () => {
      const rows = await simulate(jsPsych, { practice_trials: 8, n_test_trials: 4 });
      const test = rows.filter((r) => r.phase === "test" && r.part === "feedback");
      const sum = test.reduce((a, r) => a + r.reward, 0);
      expect(test[test.length - 1].running_total).toBe(sum);
    });
  });

  describe("options", () => {
    it("reconciles n_test_trials, n_blocks and trials_per_block", () => {
      expect(resolveOptions({})).toMatchObject({
        n_test_trials: 200,
        n_blocks: 2,
        trials_per_block: 100,
      });
      expect(resolveOptions({ n_test_trials: 125 })).toMatchObject({
        n_blocks: 2,
        trials_per_block: 63,
      });
      expect(resolveOptions({ trials_per_block: 67 })).toMatchObject({
        n_test_trials: 134,
        n_blocks: 2,
      });
      expect(resolveOptions({ n_blocks: 3 })).toMatchObject({
        n_test_trials: 200,
        trials_per_block: 67,
      });
      expect(resolveOptions({ n_blocks: 3, trials_per_block: 67 })).toMatchObject({
        n_test_trials: 201,
      });
      expect(resolveOptions({ n_test_trials: 201, trials_per_block: 67 })).toMatchObject({
        n_blocks: 3,
      });
      expect(
        resolveOptions({ n_test_trials: 201, n_blocks: 3, trials_per_block: 67 })
      ).toMatchObject({
        n_blocks: 3,
      });
      expect(() =>
        resolveOptions({ n_test_trials: 200, n_blocks: 3, trials_per_block: 67 })
      ).toThrow(/n_test_trials.*n_blocks.*trials_per_block.*disagree/);
      expect(() => resolveOptions({ n_test_trials: 125, trials_per_block: 50 })).toThrow(
        /multiple/
      );
    });

    it("practice overrides: user practice > user top level > package default", () => {
      const p = (o: TwoStepTaskOptions) => resolveOptions(o, "practice");
      expect(p({ iti_ms: 700 }).iti_ms).toBe(700);
      expect(p({ iti_ms: 700, practice: { iti_ms: 100 } }).iti_ms).toBe(100);
      expect(resolveOptions({ iti_ms: 700, practice: { iti_ms: 100 } }).iti_ms).toBe(700);
      expect(p({}).iti_ms).toBe(DEFAULT_OPTIONS.iti_ms);
      // the counts describe the main phase
      expect(p({ n_test_trials: 20 }).n_blocks).toBe(1);
    });

    it("a practice override changes the practice trials only", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 3,
        n_test_trials: 3,
        response_acknowledgement: "highlight",
        practice: { response_acknowledgement: "none", feedback_duration_ms: 0 },
      });
      expect(
        rows.filter((r) => r.phase === "practice" && r.part === "acknowledgement")
      ).toHaveLength(0);
      expect(rows.filter((r) => r.phase === "practice" && r.part === "feedback")).toHaveLength(0);
      expect(rows.filter((r) => r.phase === "test" && r.part === "acknowledgement")).toHaveLength(
        6
      );
    });

    it("throws on values that are not implemented, naming the option", () => {
      const bad: Array<[TwoStepTaskOptions, RegExp]> = [
        [{ comprehension_check: "quiz" }, /comprehension_check.*quiz/],
        [{ fullscreen_enforcement: "fullscreen" }, /fullscreen_enforcement/],
        [{ manipulation_check: "debrief" }, /manipulation_check/],
        [{ rest_breaks: "fixed_interval" }, /rest_breaks/],
        [{ response_acknowledgement: "keypress_mark" }, /response_acknowledgement/],
        [{ instruction_format: "audio" }, /instruction_format/],
        [{ instruction_framing: "spaceship_planet_alien" } as any, /replaced by stimulus_set/],
        [{ stimulus_set: "spaceship_planet_alien" } as any, /stimulus_set.*is a name, not a set/],
        [{ population_protocol: "child" }, /population_protocol/],
        [{ missed_response_handling: "none" }, /missed_response_handling/],
        [{ reward_schedule: { kind: "block_alternating" } }, /reward_schedule.*block_alternating/],
        [
          { reward_schedule: { kind: "pregenerated_walk_sets" } },
          /reward_schedule.*pregenerated_walk_sets/,
        ],
        [{ sequence_constraints: { max_run: 3 } }, /sequence_constraints/],
      ];
      for (const [o, re] of bad) expect(() => createTimeline(initJsPsych(), o)).toThrow(re);
      expect(() => createTimeline(initJsPsych(), { sequence_constraints: {} })).not.toThrow();
    });

    it("throws on contradictions", () => {
      const walk = {
        kind: "random_walk" as const,
        sd: 0.025,
        bounds: [0.25, 0.75] as [number, number],
        boundary: "reflect" as const,
      };
      expect(() => validateOptions(resolveOptions({ common_transition_prob: 1.2 }))).toThrow(
        /common_transition_prob/
      );
      expect(() => validateOptions(resolveOptions({ response_keys: ["a"] }))).toThrow(
        /response_keys/
      );
      expect(() => validateOptions(resolveOptions({ response_keys: ["a", "a"] }))).toThrow(
        /response_keys/
      );
      expect(() =>
        validateOptions(
          resolveOptions({ reward_schedule: walk, reward_probability: { red: { option_1: 0.9 } } })
        )
      ).toThrow(/reward_probability.red.option_1.*outside.*bounds/);
      expect(() =>
        validateOptions(resolveOptions({ reward_schedule: { ...walk, boundary: "bounce" as any } }))
      ).toThrow(/boundary/);
      expect(() =>
        validateOptions(resolveOptions({ reward_schedule: { ...walk, sd: 0 } }))
      ).toThrow(/sd/);
      expect(() =>
        validateOptions(
          resolveOptions({ reward_probability: { blue: { option_2: { min: 0.6, max: 0.5 } } } })
        )
      ).toThrow(/reward_probability.blue.option_2/);
    });

    it("typed reward_schedule: reflect and reverse_step", () => {
      const o = resolveOptions({
        reward_schedule: {
          kind: "random_walk",
          sd: 0.0275,
          bounds: [0.25, 0.75],
          boundary: "reflect",
        },
      });
      expect(() => validateOptions(o)).not.toThrow();
      expect(DEFAULT_OPTIONS.reward_schedule).toEqual({
        kind: "random_walk",
        sd: 0.025,
        bounds: [0.25, 0.75],
        boundary: "reverse_step",
      });
    });

    it("merges a partial reward_probability over the default, state by state", () => {
      const o = resolveOptions({ reward_probability: { red: { option_2: 0.3 } } });
      expect(o.reward_probability.red).toEqual({
        option_1: { min: 0.25, max: 0.75 },
        option_2: 0.3,
      });
      expect(o.reward_probability.blue).toEqual(DEFAULT_OPTIONS.reward_probability.blue);
    });
  });

  describe("sides and keys", () => {
    it("shows the options on both sides when random, one side when fixed", async () => {
      const random = responses(await simulate(jsPsych, { practice_trials: 0, n_test_trials: 40 }));
      expect(new Set(random.map((x) => x.stage1_left)).size).toBe(2);
      const fixed = responses(
        await simulate(initJsPsych(), {
          practice_trials: 0,
          n_test_trials: 40,
          option_side_assignment: "fixed",
        })
      );
      expect(new Set(fixed.map((x) => x.stage1_left)).size).toBe(1);
    });

    it("the choice is the option on the side of the key pressed", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 0,
        n_test_trials: 10,
        response_keys: ["z", "m"],
      });
      for (const c of rows.filter((r) => r.part === "choice")) {
        expect(c.side).toBe(c.response === "z" ? "left" : "right");
        expect(c.choice).toBe(c.side === "left" ? c.left : c.right);
      }
    });
  });

  describe("questionnaire", () => {
    it("asks where each first-stage option usually leads and records whether the answer was right", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 0,
        n_test_trials: 2,
        manipulation_check: "questionnaire",
      });
      const q = rows.filter((r) => r.part === "manipulation_check");
      expect(q.map((r) => [r.ship, r.common_state])).toEqual([
        ["A", "red"],
        ["B", "blue"],
      ]);
      q.forEach((r) => expect(r.correct).toBe(r.answer === r.common_state));
      // the question names both keys
      const { timeline } = createTimeline(initJsPsych(), {
        practice_trials: 0,
        n_test_trials: 1,
        manipulation_check: "questionnaire",
        response_keys: ["f", "j"],
      });
      const html = allTrials(timeline)
        .filter((t) => t.data?.part === "manipulation_check")
        .map((t) => t.stimulus)
        .join("");
      expect(html).toContain(
        "<kbd>F</kbd> for the one on the left, or <kbd>J</kbd> for the one on the right"
      );
    });
  });

  describe("scoring", () => {
    const row = (o: Record<string, unknown>) => ({
      task: "two-step-task",
      task_version: version,
      phase: "test",
      part: "response",
      block: 1,
      attempt: 1,
      missed: false,
      missed_stage: null,
      ...o,
    });
    const trial = (
      choice: "A" | "B" | null,
      transition: "common" | "rare",
      reward: 0 | 1 | null,
      o: Record<string, unknown> = {}
    ) =>
      row({
        stage1_choice: choice,
        stage1_rt: choice ? 500 : null,
        transition: choice ? transition : null,
        stage2_state: choice ? "red" : null,
        stage2_choice: choice ? "option_1" : null,
        stage2_rt: choice ? (transition === "rare" ? 700 : 600) : null,
        reward,
        reward_probs: {
          red: { option_1: 0.7, option_2: 0.3 },
          blue: { option_1: 0.5, option_2: 0.5 },
        },
        ...o,
      });

    it("returns zeros for counts and null for everything else on empty data", () => {
      const s = calculateScores(new DataCollection([]));
      expect(s.n_trials).toBe(0);
      expect(s.n_completed).toBe(0);
      expect(s.n_missed).toBe(0);
      expect(s.total_reward).toBe(0);
      expect(s.n_stay_pairs).toBe(0);
      for (const k of [
        "reward_rate",
        "common_transition_rate",
        "stage1_mean_rt",
        "stage2_mean_rt",
        "stage2_best_option_rate",
        "stay_probability",
        "stay_common_rewarded",
        "stay_common_unrewarded",
        "stay_rare_rewarded",
        "stay_rare_unrewarded",
        "mf_index",
        "mb_index",
        "mb_rt_index",
      ] as const)
        expect(s[k]).toBeNull();
      expect(Object.values(s).some((v) => typeof v === "number" && Number.isNaN(v))).toBe(false);
    });

    it("computes the four stay probabilities, the indices and the counts on hand-built rows", () => {
      // block 1: A stays after common+reward, switches after rare+no reward, stays after rare+reward,
      // switches after common+no reward, then the next trial is missed (pairs with it are dropped)
      const rows = [
        trial("A", "common", 1), // -> next A: stay, common rewarded
        trial("A", "rare", 0), //   -> next B: switch, rare unrewarded
        trial("B", "rare", 1), //   -> next B: stay, rare rewarded
        trial("B", "common", 0), // -> next A: switch, common unrewarded
        trial("A", "common", 1), // -> next is missed: dropped
        trial(null, "common", null, { missed: true, missed_stage: 1 }),
        trial("A", "common", 1), // after a miss: this pair crosses the block boundary: dropped
        trial("A", "common", 1, { block: 2 }), // -> A: stay, common rewarded
        trial("A", "rare", 1, { block: 2 }), //   -> B: switch, rare rewarded (cell now has stay 1 and switch 0)
        trial("B", "common", 0, { block: 2 }),
      ];
      const s = calculateScores(new DataCollection(rows));
      expect(s.n_trials).toBe(10);
      expect(s.n_missed).toBe(1);
      expect(s.n_missed_stage_1).toBe(1);
      expect(s.n_completed).toBe(9);
      // pairs: (1,2) (2,3) (3,4) (4,5) (8,9) (9,10); with the missed one and the block boundary dropped
      expect(s.n_stay_pairs).toBe(6);
      expect(s.stay_common_rewarded).toBe(1); // (1,2) stay and (8,9) stay
      expect(s.n_stay_common_rewarded).toBe(2);
      expect(s.stay_rare_unrewarded).toBe(0); // (2,3): A -> B
      expect(s.n_stay_rare_unrewarded).toBe(1);
      expect(s.stay_rare_rewarded).toBe(0.5); // (3,4) B -> B stay and (9,10) A -> B switch
      expect(s.n_stay_rare_rewarded).toBe(2);
      expect(s.stay_common_unrewarded).toBe(0); // (4,5): B -> A
      expect(s.n_stay_common_unrewarded).toBe(1);
      expect(s.stay_probability).toBeCloseTo(3 / 6, 10);
      // mf: mean of (rewarded - unrewarded) over the transitions: ((1 + .5) - (0 + 0)) / 2
      expect(s.mf_index).toBeCloseTo(0.75, 10);
      // mb: ((common rewarded - common unrewarded) - (rare rewarded - rare unrewarded)) / 2
      expect(s.mb_index).toBeCloseTo((1 - 0 - (0.5 - 0)) / 2, 10);
      expect(s.total_reward).toBe(6);
      expect(s.reward_rate).toBeCloseTo(6 / 9, 10);
      expect(s.common_transition_rate).toBeCloseTo(6 / 9, 10);
      expect(s.stage1_mean_rt).toBe(500);
      // second-stage RT after rare minus after common: 700 - 600
      expect(s.mb_rt_index).toBe(100);
    });

    it("leaves an index null when a cell has no pairs", () => {
      const rows = [trial("A", "common", 1), trial("A", "common", 1), trial("A", "common", 0)];
      const s = calculateScores(new DataCollection(rows));
      expect(s.n_stay_pairs).toBe(2);
      expect(s.stay_common_rewarded).toBe(1);
      expect(s.stay_common_unrewarded).toBeNull();
      expect(s.mf_index).toBeNull();
      expect(s.mb_index).toBeNull();
      expect(s.mb_rt_index).toBeNull();
    });

    it("counts a missed second stage and scores the rest; repeated attempts are not stay pairs", () => {
      const rows = [
        trial("A", "common", 1),
        trial("B", "common", null, {
          missed: true,
          missed_stage: 2,
          stage2_choice: null,
          stage2_rt: null,
        }),
        trial("B", "common", 1, { attempt: 2 }),
        trial("B", "common", 0),
      ];
      const s = calculateScores(new DataCollection(rows));
      expect(s.n_missed_stage_2).toBe(1);
      expect(s.n_missed).toBe(1);
      // only (3,4) is a pair: both complete
      expect(s.n_stay_pairs).toBe(1);
      expect(s.stay_common_rewarded).toBe(1);
    });

    it("ignores practice rows and other tasks, and reports how often the better option was chosen", () => {
      const rows = [
        trial("A", "common", 1),
        trial("A", "common", 1), // option_1 of red has the higher probability: best
        trial("A", "common", 1, { stage2_choice: "option_2" }), // not best
        { ...trial("A", "common", 1, { stage2_choice: "option_2" }), phase: "practice" },
        { ...trial("A", "common", 1), task: "other" },
      ];
      const s = calculateScores(new DataCollection(rows as any));
      expect(s.n_trials).toBe(3);
      expect(s.stage2_best_option_rate).toBeCloseTo(2 / 3, 10);
    });

    it("trialTable and getSummary", () => {
      const data = new DataCollection([trial("A", "common", 1)]);
      expect(trialTable(data)).toHaveLength(1);
      expect(getSummary(data)).toMatchObject({ task: "two-step-task", version, n_trials: 1 });
    });

    it("never excludes or flags on performance: no *_ok or excluded fields", () => {
      const s = calculateScores(new DataCollection([]));
      for (const k of Object.keys(s)) expect(k).not.toMatch(/(_ok|excluded|exclude|threshold)/);
    });
  });

  describe("simulated participant", () => {
    const longRun = async (agent: Parameters<typeof setSimulatedAgent>[0], seed: string) => {
      setSimulatedAgent(agent);
      const p = initJsPsych();
      p.randomization.setSeed(seed);
      const { timeline } = createTimeline(p, {
        instruction_format: "experimenter",
        practice_trials: 0,
        n_test_trials: 800,
        n_blocks: 1,
        iti_ms: 0,
        response_acknowledgement_ms: 0,
        feedback_duration_ms: 0,
      });
      const { getData, expectFinished } = await simulateTimeline(timeline, "data-only", {}, p);
      await expectFinished();
      return calculateScores(getData() as any);
    };

    afterEach(() => setSimulatedAgent(null));

    it("a model-based learner stays after common rewards and rare non-rewards: positive MB index, more than MF", async () => {
      const s = await longRun({ w: 1, beta: 6, alpha: 0.5 }, "mb");
      expect(s.n_stay_pairs).toBeGreaterThan(700);
      expect(s.mb_index!).toBeGreaterThan(0.1);
      expect(s.stay_common_rewarded!).toBeGreaterThan(s.stay_rare_rewarded!);
      expect(s.stay_rare_unrewarded!).toBeGreaterThan(s.stay_common_unrewarded!);
      expect(s.mb_index!).toBeGreaterThan(s.mf_index!);
    });

    it("a model-free learner stays after any reward: positive MF index, MB index near zero", async () => {
      const s = await longRun({ w: 0, beta: 6, alpha: 0.5 }, "mf");
      expect(s.mf_index!).toBeGreaterThan(0.1);
      expect(Math.abs(s.mb_index!)).toBeLessThan(0.15);
      expect(s.mf_index!).toBeGreaterThan(s.mb_index!);
    });

    it("the default learner shows both effects, and slower second-stage RTs after rare transitions", async () => {
      const s = await longRun(null, "hybrid");
      expect(s.mf_index!).toBeGreaterThan(0);
      expect(s.mb_index!).toBeGreaterThan(0);
      expect(s.mb_rt_index!).toBeGreaterThan(20);
      expect(s.stage2_best_option_rate!).toBeGreaterThan(0.5);
      expect(s.reward_rate!).toBeGreaterThan(0.45);
    });

    it("a global forced RT wins over the simulated learner (choices are then random)", async () => {
      const rows = await simulate(initJsPsych(), { practice_trials: 0, n_test_trials: 10 });
      for (const x of responses(rows)) expect(x.stage1_rt).toBe(400);
    });
  });

  describe("instruction text follows the configuration", () => {
    const pages = (o: TwoStepTaskOptions) => {
      const { timeline } = createTimeline(initJsPsych(), {
        practice_trials: 2,
        n_test_trials: 2,
        ...o,
      });
      return allTrials(timeline)
        .filter((t) => t.data?.part === "instruction" && typeof t.stimulus === "string")
        .map((t) => t.stimulus as string)
        .join("\n");
    };

    it("says what happens to a slow trial, by missed_response_handling", () => {
      expect(pages({})).toContain("the trial is skipped");
      expect(pages({ missed_response_handling: "repeat_trial" })).toContain(
        "you get the same trial again"
      );
      expect(pages({ missed_response_handling: "repeat_trial" })).not.toContain("is skipped");
      // no window: nothing about being too slow
      expect(pages({ response_window_ms: null })).not.toContain("too slow");
      expect(pages({ response_window_ms: null })).not.toContain("limited time");
      expect(pages({})).toContain("limited time");
    });

    it("says that the options change places only when they do", () => {
      expect(pages({})).toContain("not always on the same side");
      expect(pages({})).toContain("change places");
      const fixed = pages({ option_side_assignment: "fixed" });
      expect(fixed).not.toContain("same side");
      expect(fixed).not.toContain("change places");
      expect(fixed).toContain("pace of the real task");
    });

    it("reads correctly for the set, with the right article", () => {
      for (const set of [utils.stimuli.abstractSymbols, utils.stimuli.spaceshipPlanetAlien]) {
        const text = pages({ stimulus_set: set, contingency_disclosure: "full" });
        expect(text).not.toMatch(/\ban (symbol|spaceship|coin)/i);
        expect(text).not.toMatch(/\ba (alien|apple)/i);
        expect(text).toContain(
          set === utils.stimuli.abstractSymbols
            ? "How likely the symbols are"
            : "How likely the aliens are"
        );
      }
      expect(pages({ stimulus_set: utils.stimuli.spaceshipPlanetAlien })).toContain(
        "one of two planets: the red planet or the blue planet"
      );
    });

    it("the framing words come from the set, and a translation can change them", () => {
      const seen: any[] = [];
      const { timeline } = createTimeline(initJsPsych(), {
        practice_trials: 0,
        n_test_trials: 1,
        stimulus_set: utils.stimuli.spaceshipPlanetAlien,
        text: {
          framing_words: (r) => {
            seen.push(r);
            return { ...r.words, first: "ruimteschip" };
          },
        },
      });
      expect(seen[0].set).toBe("spaceship_planet_alien");
      expect(seen[0].words.state_name.red).toBe("the red planet");
      expect(seen[0].words.first_name.A).toBe("the rocket");
      expect(JSON.stringify(allTrials(timeline).map((t) => t.stimulus ?? ""))).toContain(
        "to choose the ruimteschip on the left"
      );
    });

    it("the default framing words pass the set's words through", () => {
      const words = { ...prepareSet(utils.stimuli.abstractSymbols).words };
      expect(defaultText.framing_words({ words, set: "abstract_symbols" })).toBe(words);
      // a translation that changes one word for every set
      const { timeline } = createTimeline(initJsPsych(), {
        practice_trials: 0,
        n_test_trials: 1,
        text: {
          framing_words: ({ words: w }) => ({ ...w, first: "teken" }),
        },
      });
      expect(JSON.stringify(allTrials(timeline).map((t) => t.stimulus ?? ""))).toContain(
        "to choose the teken on the left"
      );
    });
  });

  describe("stimulus sets are data", () => {
    /** A researcher's own set: images for the first stage, text for one state, an svg for the reward. */
    const fruit = {
      name: "fruit_market",
      noun: {
        first: { singular: "market", plural: "markets" },
        second: { singular: "fruit", plural: "fruits" },
        state: { singular: "stall", plural: "stalls" },
        reward: { singular: "apple", plural: "apples" },
      },
      first_stage: [
        { id: "north", name: "the north market", image: "img/north.png" },
        { id: "south", name: "the south market", image: "img/south.png" },
      ],
      states: [
        { id: "green_stall", name: "the green stall", items: ["pear", "plum"], color: "#2a7" },
        {
          id: "orange_stall",
          name: "the orange stall",
          items: [
            { id: "fig", image: "img/fig.png" },
            { id: "lime", image: "img/lime.png" },
          ],
          background: "#4a2a10",
        },
      ],
      reward: {
        rewarded: {
          id: "apple",
          svg: "<svg viewBox='0 0 10 10'><circle cx='5' cy='5' r='4'/></svg>",
        },
        unrewarded: { id: "none", text: "-" },
      },
    } as const;

    it("the bundled sets are values of the option's type, and the default is one of them", () => {
      expect(DEFAULT_OPTIONS.stimulus_set).toBe(utils.stimuli.abstractSymbols);
      for (const set of [utils.stimuli.abstractSymbols, utils.stimuli.spaceshipPlanetAlien])
        expect(utils.stimuli.setProblems(set)).toEqual([]);
      expect(utils.stimuli.abstractSymbols.name).toBe("abstract_symbols");
      expect(utils.stimuli.spaceshipPlanetAlien.name).toBe("spaceship_planet_alien");
    });

    it("runs a researcher's own set and records its name and the ids of the pictures chosen", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 0,
        n_test_trials: 20,
        n_blocks: 1,
        stimulus_set: fruit as any,
        manipulation_check: "questionnaire",
      });
      const resp = responses(rows).filter((r) => !r.missed);
      expect(resp.length).toBeGreaterThan(10);
      const second: Record<string, string[]> = {
        red: ["pear", "plum"],
        blue: ["fig", "lime"],
      };
      for (const r of resp) {
        expect(r.stimulus_set).toBe("fruit_market");
        expect(r.stage1_item_id).toBe(r.stage1_choice === "A" ? "north" : "south");
        expect(r.stage2_state_id).toBe(r.stage2_state === "red" ? "green_stall" : "orange_stall");
        expect(r.stage2_item_id).toBe(
          second[r.stage2_state][r.stage2_choice === "option_1" ? 0 : 1]
        );
      }
      const choices = rows.filter((r) => r.part === "choice" && r.phase === "test");
      for (const c of choices) {
        expect(c.stimulus_set).toBe("fruit_market");
        expect([c.left_item_id, c.right_item_id]).toContain(c.chosen_item_id ?? c.left_item_id);
        if (c.stage === 1) expect(c.state_id).toBeNull();
        else expect(["green_stall", "orange_stall"]).toContain(c.state_id);
      }
      const mc = rows.filter((r) => r.part === "manipulation_check");
      expect(mc.map((r) => r.item_id)).toEqual(["north", "south"]);
    });

    it("draws the researcher's pictures and takes the instruction words from the set", () => {
      const { timeline } = createTimeline(initJsPsych(), {
        practice_trials: 0,
        n_test_trials: 2,
        stimulus_set: fruit as any,
        contingency_disclosure: "full",
      });
      const html = JSON.stringify(
        allTrials(timeline).map((t) => {
          try {
            return typeof t.stimulus === "function" ? t.stimulus() : t.stimulus ?? "";
          } catch {
            return "";
          }
        })
      );
      expect(html).toContain("img/north.png");
      expect(html).toContain("one of two stalls: the green stall or the orange stall");
      expect(html).toContain("may give you an apple");
      expect(html).toContain("The north market usually takes you to the green stall");
      expect(html).toContain("Collect as many apples as you can");
      expect(html).not.toMatch(/spaceship|symbol|planet|alien|\bcoin/);
    });

    it("fills in ids, nouns and names a set leaves out", () => {
      const p = prepareSet({
        first_stage: [{ svg: "<svg></svg>" }, { svg: "<svg></svg>" }],
        states: [{ items: ["a", "b"] }, { items: ["c", "d"] }],
      });
      expect(p.name).toBe("custom");
      expect([p.first.A.id, p.first.B.id]).toEqual(["custom-first-1", "custom-first-2"]);
      expect([p.states.red.id, p.states.blue.id]).toEqual(["custom-state-1", "custom-state-2"]);
      expect(p.states.red.items.option_1.id).toBe("a");
      expect(p.words.first).toBe("picture");
      expect(p.words.second).toBe("word");
      expect(p.words.first_name.A).toBe("the first picture");
      expect(p.words.state_name.blue).toBe("the second screen");
      expect(p.words.reward).toBe("coin");
    });

    it("throws on a set it cannot use, saying what is wrong", () => {
      const base = utils.stimuli.abstractSymbols;
      const bad: Array<[unknown, RegExp]> = [
        [
          { ...base, first_stage: [base.first_stage[0]] },
          /first_stage must be a list of exactly two/,
        ],
        [{ ...base, states: [base.states[0]] }, /states must be a list of exactly two states/],
        [
          { ...base, first_stage: [{ text: "x", image: "y.png" }, "z"] },
          /first_stage\[0\] must give exactly one of text, image or svg/,
        ],
        [
          { ...base, first_stage: [{ id: "circle", text: "x" }, "z"] },
          /two items have the id "circle"/,
        ],
        [
          { ...base, states: [{ ...base.states[0], background: "red;}body{x:y" }, base.states[1]] },
          /states\[0\]\.background must be a CSS colour/,
        ],
        [{ ...base, noun: { first: "ship" } }, /noun\.first must be \{ singular, plural \}/],
        [
          { ...base, states: [base.states[0], { ...base.states[1], id: "red_screen" }] },
          /two states have the id/,
        ],
      ];
      for (const [set, msg] of bad) {
        expect(() => createTimeline(initJsPsych(), { stimulus_set: set as any })).toThrow(
          /two-step-task: stimulus_set:/
        );
        expect(() => createTimeline(initJsPsych(), { stimulus_set: set as any })).toThrow(msg);
      }
    });
  });

  describe("text and exports", () => {
    it("merges translated text over the defaults and passes the framing words and key names", async () => {
      const seen: any[] = [];
      const { timeline } = createTimeline(jsPsych, {
        practice_trials: 0,
        n_test_trials: 1,
        response_keys: ["ArrowLeft", "ArrowRight"],
        text: {
          instruction_response: (r) => {
            seen.push(r);
            return "<p>Gedrückt: " + r.left_key + "</p>";
          },
          continue_button: "Weiter",
        },
      });
      const html = JSON.stringify(allTrials(timeline).map((t) => t.stimulus ?? ""));
      expect(html).toContain("Gedrückt: left arrow");
      expect(seen[0]).toMatchObject({
        left_key: "left arrow",
        right_key: "right arrow",
        window_seconds: 2,
      });
      expect(allTrials(timeline).some((t) => (t.choices ?? [])[0] === "Weiter")).toBe(true);
      // a default text is still there
      expect(defaultText.too_slow).toBe("Too slow");
    });

    it("exports the four things of the standard", () => {
      expect(typeof createTimeline).toBe("function");
      expect(Object.keys(timelineUnits)).toEqual(
        expect.arrayContaining([
          "createInstructions",
          "createInstructionWalkthrough",
          "createBlock",
          "createCompletion",
        ])
      );
      expect(Object.keys(utils)).toEqual(
        expect.arrayContaining([
          "scoring",
          "constants",
          "text",
          "stimuli",
          "schedule",
          "simulation",
        ])
      );
      expect(utils.constants.DEFAULT_OPTIONS).toBe(DEFAULT_OPTIONS);
      expect(utils.constants.TASK_NAME).toBe("two-step-task");
    });

    it("timelineUnits build pieces by hand", async () => {
      const ctx = timelineUnits.createContext(jsPsych, {
        practice_trials: 0,
        n_test_trials: 2,
        n_blocks: 1,
      });
      const plans = timelineUnits.createSchedule(ctx, "test");
      expect(plans).toHaveLength(2);
      const block = timelineUnits.createBlock(ctx, "test", 1, plans);
      const { getData, expectFinished } = await simulateTimeline(
        [block, timelineUnits.createCompletion(ctx)],
        "data-only",
        { default: { data: { rt: 400 } } },
        jsPsych
      );
      await expectFinished();
      expect(getData().filter({ part: "response" }).count()).toBe(2);
    });
  });
});
