import { initJsPsych } from "jspsych";

import { MAX_TRIALS_PER_TRACK, SIMULATION } from "./constants";
import { DEFAULT_ADAPTIVE, resolveAdaptive, resolveOptions } from "./options";
import { calculateScores } from "./scoring";
import { probabilityCorrect } from "./simulation";
import { responses, run } from "./test-helpers";
import { Track } from "./track";

const jsPsych = initJsPsych();
const track = (over: Parameters<typeof resolveAdaptive>[0] = {}, ignoreStop = false) =>
  new Track(jsPsych, resolveAdaptive(over, true), "t", ignoreStop);

/** Feed a list of answers (1 = correct) and return the levels presented. */
const feed = (t: Track, answers: number[]) =>
  answers.map((a) => (t.update(a === 1).level, t.level));

describe("the 3-down/1-up staircase in dB (S012)", () => {
  it("starts at -13.75, steps 1.5 dB down after three correct answers, and up after one wrong answer", () => {
    const t = track();
    expect(t.level).toBe(-13.75);
    t.update(true);
    t.update(true);
    expect(t.level).toBe(-13.75); // two correct are not enough
    t.update(true);
    expect(t.level).toBe(-15.25); // harder: quieter tone
    t.update(false);
    // the first reversal came on this wrong answer: from now on the 0.75 dB step
    expect(t.staircase.reversals).toBe(1);
    expect(t.level).toBe(-14.5);
  });

  it("switches from 1.5 to 0.75 dB at the first reversal and counts reversals", () => {
    const t = track();
    const log: number[] = [];
    // down (1.5) after each run of three; the first wrong answer is a reversal and the step is 0.75 from then on; a move in the
    // other direction is a reversal whichever way it goes (up to down counts too)
    for (const a of [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0]) {
      t.update(a === 1);
      log.push(t.level);
    }
    expect(log).toEqual([
      -13.75, -13.75, -15.25, -15.25, -15.25, -16.75, -16, -16, -16, -16.75, -16,
    ]);
    expect(t.staircase.reversals).toBe(3);
    expect(t.staircase.reversal_levels).toEqual([-16.75, -16, -16.75]);
  });

  it("the converged level is where p(correct) = 0.794: a simulated listener ends near its threshold", () => {
    const j = initJsPsych();
    j.randomization.setSeed("converge");
    const th = SIMULATION.threshold_snr_db;
    const estimates: number[] = [];
    for (let rep = 0; rep < 30; rep++) {
      const t = new Track(j, resolveAdaptive({ discontinue_rule: { trials: 60 } }, true), "c");
      while (!t.done) {
        const p = probabilityCorrect(t.level, 3, true);
        t.update(j.randomization.randomInt(0, 1_000_000) / 1_000_000 < p);
      }
      const e = t.estimate(6);
      if (e !== null) estimates.push(e);
    }
    const mean = estimates.reduce((a, b) => a + b, 0) / estimates.length;
    // the level with p = 0.794 for the simulated psychometric function
    let target = th;
    while (probabilityCorrect(target, 3, true) < 0.794) target += 0.01;
    expect(mean).toBeGreaterThan(target - 2);
    expect(mean).toBeLessThan(target + 2);
  });
});

describe("step schedules, bounds and the other procedures", () => {
  it("a list of steps is indexed by reversals (a reversal move already uses the next entry); the last entry repeats", () => {
    const t = track({ step_size: [4, 2, 1], procedure: "staircase_1up_1down" });
    const levels: number[] = [];
    for (const a of [1, 0, 1, 0, 1, 0]) {
      t.update(a === 1);
      levels.push(t.level);
    }
    // down 4; wrong: reversal 1, up 2; correct: reversal 2, down 1 (the schedule's last entry); and so on
    expect(levels).toEqual([-17.75, -15.75, -16.75, -15.75, -16.75, -15.75]);
    expect(t.staircase.reversals).toBe(5);
  });

  it("resolves steps: number, {up, down}, and the target they imply", () => {
    expect(resolveAdaptive({ step_size: 2 }, true).step_sizes).toEqual([{ up: 2, down: 2 }]);
    const weighted = resolveAdaptive(
      { procedure: "staircase_1up_1down", step_size: { up: 6, down: 2 } },
      true
    );
    expect(weighted.target_accuracy).toBe(0.75); // S031: down 2, up 6
    expect(
      resolveAdaptive(
        { procedure: "staircase_1up_1down", step_size: 3, target_accuracy: 0.75 },
        true
      ).step_sizes
    ).toEqual([{ up: 3, down: 1 }]);
    expect(DEFAULT_ADAPTIVE.target_accuracy).toBe(0.794);
    expect(resolveAdaptive({ procedure: "staircase_1up_2down" }, true).target_accuracy).toBe(0.707);
  });

  it("clamps at the bounds", () => {
    const t = track({ start_level: -59, bounds: [-60, 10], step_size: 5 });
    feed(t, [1, 1, 1]);
    expect(t.level).toBe(-60);
    const u = track({ start_level: 9, bounds: [-60, 10], step_size: 5 });
    u.update(false);
    expect(u.level).toBe(10);
  });

  it("the default start level, bounds and step depend on whether there is a masker", () => {
    expect(resolveAdaptive({}, true)).toMatchObject({ start_level: -13.75, bounds: [-60, 10] });
    expect(resolveAdaptive({}, false)).toMatchObject({ start_level: -30, bounds: [-100, -6] });
  });
});

describe("stop rules", () => {
  it("trials: core's rule ends the track after 40 answers, and update() on a done track throws", () => {
    const t = track();
    for (let i = 0; i < 40; i++) t.update(true);
    expect(t.done).toBe(true);
    expect(t.stopReason).toBe("trials");
    expect(() => t.update(true)).toThrow(/already done/);
  });

  it("reversals: ends after n reversals", () => {
    const t = track({ discontinue_rule: { reversals: 3 } });
    let i = 0;
    while (!t.done && i++ < 200) t.update(i % 4 !== 0); // 3 correct, 1 wrong, ...
    expect(t.stopReason).toBe("reversals");
    expect(t.staircase.reversals).toBe(3);
  });

  it("mistakes (the package's own rule: core has none): ends after n wrong answers in the track", () => {
    const t = track({ discontinue_rule: { mistakes: 4 } });
    const answers = [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0];
    for (const a of answers) if (!t.done) t.update(a === 1);
    expect(t.stopReason).toBe("mistakes");
    expect(t.trialCount).toBe(11); // the fourth wrong answer is trial 11
    expect((t.compact() as any).errors).toBe(4);
  });

  it("a hard cap ends a track whose rule never fires", () => {
    const t = track({ discontinue_rule: { mistakes: 100000 } });
    for (let i = 0; i < MAX_TRIALS_PER_TRACK; i++) t.update(true);
    expect(t.done).toBe(true);
    expect(t.stopReason).toBe("cap");
  });

  it("a practice staircase ignores the stop rules (its length is practice_trials)", () => {
    const t = track({ discontinue_rule: { trials: 3 } }, true);
    for (let i = 0; i < 10; i++) t.update(true);
    expect(t.done).toBe(false);
  });

  it("estimate is the mean of the last n reversal levels (null before the first)", () => {
    const t = track();
    expect(t.estimate()).toBeNull();
    for (const a of [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0]) t.update(a === 1);
    expect(t.staircase.reversals).toBe(5);
    const lv = t.staircase.reversal_levels;
    expect(t.estimate()).toBeCloseTo(lv.reduce((a, b) => a + b, 0) / 5, 6);
    expect(t.estimate(2)).toBeCloseTo((lv[3] + lv[4]) / 2, 6);
  });
});

describe("the track in the data", () => {
  it("every test row has the spec's data fields; the last row of a track carries the whole staircase", async () => {
    const { rows } = await run({
      trials_per_condition: 2,
      adaptive: { discontinue_rule: { trials: 20 } },
      practice_trials: 0,
    });
    const test = responses(rows);
    expect(test).toHaveLength(40);
    for (const r of test) {
      for (const f of [
        "track_id",
        "trial_in_track",
        "condition",
        "standard_value",
        "level",
        "step_size",
        "target_interval",
        "response_interval",
        "n_alternatives",
        "correct",
        "rt",
        "is_reversal",
        "reversal_count",
        "track_threshold",
        "next_level",
        "track_state",
      ]) {
        expect(r).toHaveProperty(f);
      }
      expect(r.n_alternatives).toBe(3);
      expect(r.level_unit).toBe("dB SNR");
    }
    const lasts = test.filter((r) => r.track_final);
    expect(lasts).toHaveLength(2);
    for (const last of lasts) {
      expect(last.trial_index_in_block).toBe(20);
      expect(last.track_final.history).toHaveLength(20);
      expect(last.track_final.stop_reason).toBe("trials");
      // the data replay: levels and reversal flags equal the staircase's history
      const own = test.filter((r) => r.block === last.block);
      expect(own.map((r) => r.level)).toEqual(last.track_final.history.map((h: any) => h.level));
      expect(own.map((r) => r.is_reversal)).toEqual(
        last.track_final.history.map((h: any) => h.reversal)
      );
      expect(own.map((r) => r.next_level)).toEqual(
        last.track_final.history.map((h: any) => h.next_level)
      );
    }
    expect(test.filter((r) => r.track_id === 1)).toHaveLength(20);
    expect(test.filter((r) => r.track_id === 2)).toHaveLength(20);
  });

  it("the score from the rows equals the staircase's own estimate", async () => {
    const { rows, data } = await run({
      trials_per_condition: 1,
      adaptive: { discontinue_rule: { trials: 40 } },
      practice_trials: 0,
    });
    const last = responses(rows).find((r) => r.track_final)!;
    const scores = calculateScores(data);
    const own = (last.track_final as any).reversal_levels as number[];
    expect(own.length).toBeGreaterThan(0);
    const lastSix = own.slice(-6);
    expect(scores.tracks[0].threshold).toBeCloseTo(
      lastSix.reduce((a, b) => a + b, 0) / lastSix.length,
      6
    );
    expect(scores.tracks[0].n_reversals).toBe(own.length);
  });

  it("practice at fixed levels uses the staircase's start level; a practice staircase has no stop rule", () => {
    const o = resolveOptions({ adaptive: { start_level: -10 } }, "practice");
    // the user's top-level adaptive flows into practice (precedence), a staircase of practice_trials trials
    expect(o.adaptive?.start_level).toBe(-10);
    const d = resolveOptions({}, "practice");
    expect(d.adaptive).toBeNull();
    expect(d.difficulty_levels).toEqual([-13.75]);
    const q = resolveOptions({ stimulus_set: { masker: "none" } }, "practice");
    expect(q.difficulty_levels).toEqual([-30]);
  });
});
