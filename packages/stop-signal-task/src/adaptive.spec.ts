import { initJsPsych } from "jspsych";

import { AdaptiveOptions, StopSignalTaskOptions, resolveAdaptive } from "./options";
import { StaircaseManager } from "./staircase";
import { responses, run } from "./test-helpers";
import { createTimeline } from ".";

const ALL_SUCCESS = { default: { data: { rt: 50000 } } }; // nobody responds: every stop is successful
const ALL_FAIL = { default: { data: { rt: 400 } } }; // everybody responds: every stop fails

const stops = (rows: any[], phase = "test") =>
  responses(rows, phase).filter((r) => r.condition === "stop");

const base: StopSignalTaskOptions = {
  n_blocks: 2,
  trials_per_block: 16,
  practice_trials: 8,
  break_duration_ms: 0,
};

describe("adaptive: the stop-signal-delay staircase", () => {
  it("resolves the default: 1-up/1-down, 200 ms start, 50 ms steps, 50% target, bounds 50 to 1200", () => {
    expect(resolveAdaptive({})).toEqual({
      procedure: "staircase_1up_1down",
      start_level: 200,
      step_size: { up: 50, down: 50 },
      target_accuracy: 0.5,
      bounds: [50, 1200],
      discontinue_rule: null,
      tracks: "single",
      reset: "never",
    });
  });

  it("a successful stop lengthens the delay by the up step, a failed stop shortens it by the down step", async () => {
    const up = await run({ ...base, adaptive: { start_level: 200 } }, ALL_SUCCESS);
    expect(
      stops(up.rows)
        .slice(0, 5)
        .map((r) => r.ssd)
    ).not.toContain(undefined);
    const ssd = stops(up.rows, "practice").map((r) => r.ssd);
    expect(ssd).toEqual([200, 250]); // two stop trials in 8 practice trials
    expect(stops(up.rows, "practice")[1].next_ssd).toBe(300);
    const down = await run({ ...base, adaptive: { start_level: 200 } }, ALL_FAIL);
    expect(stops(down.rows, "practice").map((r) => r.ssd)).toEqual([200, 150]);
  });

  it("step_size {up, down} and target_accuracy are one setting", async () => {
    const a = resolveAdaptive({ step_size: { up: 25, down: 50 } });
    expect(a.target_accuracy).toBeCloseTo(0.667, 3); // down / (up + down)
    const b = resolveAdaptive({ step_size: 50, target_accuracy: 0.667 });
    expect(b.step_size).toEqual({ up: 25, down: 50 }); // the larger step is step_size
    expect(resolveAdaptive({ step_size: 50, target_accuracy: 0.333 }).step_size).toEqual({
      up: 50,
      down: 25,
    });
    const { rows } = await run(
      { ...base, adaptive: { step_size: { up: 25, down: 50 } } },
      ALL_SUCCESS
    );
    const s = stops(rows, "practice");
    expect(s[1].ssd - s[0].ssd).toBe(25);
    const f = await run({ ...base, adaptive: { step_size: { up: 25, down: 50 } } }, ALL_FAIL);
    expect(stops(f.rows, "practice")[0].ssd - stops(f.rows, "practice")[1].ssd).toBe(50);
  });

  it("bounds [min, max] clamp the delay, and null on a side means no limit", async () => {
    const lo = await run({ ...base, adaptive: { bounds: [150, null] } }, ALL_FAIL);
    expect(Math.min(...stops(lo.rows, "test").map((r) => r.ssd))).toBe(150);
    const hi = await run(
      { ...base, adaptive: { start_level: 250, bounds: [null, 300] } },
      ALL_SUCCESS
    );
    expect(Math.max(...stops(hi.rows, "test").map((r) => r.ssd))).toBe(300);
    const none = await run(
      { ...base, adaptive: { bounds: [null, null], start_level: 100 } },
      ALL_FAIL
    );
    expect(Math.min(...stops(none.rows, "test").map((r) => r.ssd))).toBeLessThan(0); // nothing stops it going negative
    expect(resolveAdaptive({ bounds: [null, null] }).bounds).toEqual([null, null]);
  });

  it("staircase_1up_2down needs two successful stops in a row to lengthen the delay", async () => {
    const { rows } = await run(
      { ...base, practice_trials: 16, adaptive: { procedure: "staircase_1up_2down" } },
      ALL_SUCCESS
    );
    const s = stops(rows, "practice").map((r) => r.ssd);
    expect(s.slice(0, 4)).toEqual([200, 200, 250, 250]);
    expect(resolveAdaptive({ procedure: "staircase_1up_2down" }).target_accuracy).toBe(0.707);
  });

  it("records the staircase state on each stop trial and the full toJSON once per block", async () => {
    const { rows } = await run({ ...base, adaptive: {} }, ALL_SUCCESS);
    const s = stops(rows, "test");
    expect(s[0].staircase_id).toBe("all");
    expect(s[0].staircase_state).toMatchObject({
      procedure: "staircase",
      label: "all",
      level: s[0].next_ssd,
      trial_count: expect.any(Number),
      done: false,
    });
    expect(s[0].staircase_state).not.toHaveProperty("history");
    const last = responses(rows, "test")
      .filter((r) => r.block === 1)
      .pop();
    expect(last.staircase_final).toHaveLength(1);
    expect(last.staircase_final[0].history.length).toBeGreaterThan(0);
    expect(last.staircase_final[0].history[0]).toMatchObject({ trial: 1, correct: true });
    // go trials carry no staircase fields
    expect(responses(rows).find((r) => r.condition === "go").staircase_id).toBeNull();
  });

  describe("tracks", () => {
    it('"single": one staircase for every stop trial', async () => {
      const { rows } = await run({ ...base, adaptive: { tracks: "single" } }, ALL_SUCCESS);
      expect(new Set(stops(rows).map((r) => r.staircase_id))).toEqual(new Set(["all"]));
    });

    it('"per_condition": one independent staircase per go direction, picked by the trial', async () => {
      const { rows } = await run(
        {
          ...base,
          trials_per_block: 32,
          practice_trials: 0,
          n_blocks: 1,
          adaptive: { tracks: "per_condition", reset: "never" },
        },
        ALL_SUCCESS
      );
      const s = stops(rows);
      for (const dir of ["left", "right"]) {
        const own = s.filter((r) => r.go_stimulus === dir);
        expect(own.length).toBeGreaterThan(0);
        expect(new Set(own.map((r) => r.staircase_id))).toEqual(new Set([dir]));
        // independent: each track starts at 200 and moves 50 per own trial, whatever the other did
        expect(own.map((r) => r.ssd)).toEqual(own.map((_, i) => 200 + 50 * i));
      }
      const last = responses(rows).pop();
      expect(last.staircase_final.map((t: any) => t.label).sort()).toEqual(["left", "right"]);
    });
  });

  describe("reset", () => {
    const startOf = (rows: any[], phase: string, block: number) =>
      stops(rows, phase).find((r) => r.block === block).ssd;

    it('"never": practice carries into the test and the blocks continue', async () => {
      const { rows } = await run({ ...base, adaptive: { reset: "never" } }, ALL_SUCCESS);
      const lastPractice = stops(rows, "practice").pop();
      expect(startOf(rows, "test", 1)).toBe(lastPractice.next_ssd);
      const lastB1 = stops(rows, "test")
        .filter((r) => r.block === 1)
        .pop();
      expect(startOf(rows, "test", 2)).toBe(lastB1.next_ssd);
    });

    it('"phase": the test starts fresh from start_level, its blocks continue', async () => {
      const { rows } = await run({ ...base, adaptive: { reset: "phase" } }, ALL_SUCCESS);
      expect(startOf(rows, "test", 1)).toBe(200);
      const lastB1 = stops(rows, "test")
        .filter((r) => r.block === 1)
        .pop();
      expect(startOf(rows, "test", 2)).toBe(lastB1.next_ssd);
    });

    it('"block": every block, practice included, starts fresh', async () => {
      const { rows } = await run({ ...base, adaptive: { reset: "block" } }, ALL_SUCCESS);
      expect(startOf(rows, "practice", 1)).toBe(200);
      expect(startOf(rows, "test", 1)).toBe(200);
      expect(startOf(rows, "test", 2)).toBe(200);
    });

    it("a fresh procedure is a new staircase, not a rewind (trial_count restarts)", async () => {
      const { rows } = await run({ ...base, adaptive: { reset: "block" } }, ALL_SUCCESS);
      expect(stops(rows, "test").find((r) => r.block === 2).staircase_state.trial_count).toBe(1);
    });

    it("a practice override with a different staircase never carries into the test", async () => {
      const { rows } = await run(
        { ...base, adaptive: { reset: "never" }, practice: { adaptive: { start_level: 100 } } },
        ALL_SUCCESS
      );
      expect(stops(rows, "practice")[0].ssd).toBe(100);
      expect(startOf(rows, "test", 1)).toBe(200);
    });

    it("StaircaseManager.startBlock decides freshness", () => {
      const m = new StaircaseManager(initJsPsych());
      const cfg = resolveAdaptive({ reset: "phase" });
      const a = m.startBlock("practice", cfg);
      expect(m.startBlock("practice", cfg)).toBe(a);
      expect(m.startBlock("test", cfg)).not.toBe(a);
      expect(m.startBlock("test", null)).toBeNull();
    });
  });

  it("discontinue_rule freezes the delay once it is met, and the data say so", async () => {
    const rule: AdaptiveOptions = { discontinue_rule: { trials: 3 }, reset: "phase" };
    const { rows } = await run(
      { ...base, n_blocks: 1, trials_per_block: 24, practice_trials: 0, adaptive: rule },
      ALL_SUCCESS
    );
    const s = stops(rows);
    expect(s.map((r) => r.ssd).slice(0, 4)).toEqual([200, 250, 300, 350]);
    expect(s[2].staircase_state).toMatchObject({
      done: true,
      stop_reason: expect.stringContaining("trial"),
    });
    expect(s.slice(3).every((r) => r.ssd === 350)).toBe(true);
  });
});

describe("fixed stop-signal delays (difficulty_levels) instead of the staircase", () => {
  it("giving the levels switches the staircase off; each stop trial gets one, balanced", async () => {
    const { rows } = await run(
      {
        ...base,
        n_blocks: 1,
        trials_per_block: 40,
        practice_trials: 0,
        condition_proportions: { stop: 0.5, go: 0.5 },
        difficulty_levels: [17, 67, 117, 167],
      },
      {}
    );
    const s = stops(rows);
    expect(s).toHaveLength(20);
    for (const lv of [17, 67, 117, 167]) expect(s.filter((r) => r.ssd === lv)).toHaveLength(5);
    expect(s.every((r) => r.staircase_id === null && r.staircase_state === null)).toBe(true);
  });

  it("a { min, max, step } range draws a random delay per stop trial", async () => {
    const { rows } = await run(
      {
        ...base,
        n_blocks: 1,
        trials_per_block: 40,
        practice_trials: 0,
        difficulty_levels: { min: 100, max: 450, step: 50 },
      },
      {}
    );
    const ssd = stops(rows).map((r) => r.ssd);
    expect(new Set(ssd).size).toBeGreaterThan(1);
    ssd.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(100);
      expect(v).toBeLessThanOrEqual(450);
      expect((v - 100) % 50).toBe(0);
    });
  });

  it("a single fixed delay", async () => {
    const { rows } = await run({ ...base, difficulty_levels: [250] }, {});
    expect(
      new Set(
        stops(rows, "practice")
          .concat(stops(rows))
          .map((r) => r.ssd)
      )
    ).toEqual(new Set([250]));
  });

  it("race-model data under fixed delays: p(respond | signal) rises with the delay (the inhibition function)", async () => {
    const { rows } = await run(
      {
        ...base,
        n_blocks: 1,
        trials_per_block: 160,
        practice_trials: 0,
        condition_proportions: { stop: 0.5, go: 0.5 },
        difficulty_levels: [50, 450],
      },
      {}
    );
    const p = (ssd: number) => {
      const s = stops(rows).filter((r) => r.ssd === ssd);
      return s.filter((r) => r.stop_outcome === "failed").length / s.length;
    };
    expect(p(450)).toBeGreaterThan(p(50) + 0.3);
  });
});

describe("per-block stop proportions (a list of maps)", () => {
  it("each block takes its entry, the last repeating", async () => {
    const { rows } = await run({
      n_blocks: 4,
      trials_per_block: 20,
      practice_trials: 0,
      break_duration_ms: 0,
      condition_proportions: [
        { stop: 0.4, go: 0.6 },
        { stop: 0.2, go: 0.8 },
      ],
    });
    const nStop = (b: number) =>
      responses(rows).filter((r) => r.block === b && r.condition === "stop").length;
    expect([1, 2, 3, 4].map(nStop)).toEqual([8, 4, 4, 4]);
    expect(
      responses(rows)
        .filter((r) => r.block === 1)
        .every((r) => r.stop_probability_condition === 0.4)
    ).toBe(true);
    expect(
      responses(rows)
        .filter((r) => r.block === 3)
        .every((r) => r.stop_probability_condition === 0.2)
    ).toBe(true);
  });
});

describe("sequence constraints", () => {
  const opts = (
    sc: StopSignalTaskOptions["sequence_constraints"],
    extra: StopSignalTaskOptions = {}
  ): StopSignalTaskOptions => ({
    n_blocks: 3,
    trials_per_block: 32,
    practice_trials: 0,
    break_duration_ms: 0,
    sequence_constraints: sc,
    ...extra,
  });
  const types = (rows: any[], b: number) =>
    responses(rows)
      .filter((r) => r.block === b)
      .map((r) => r.condition);

  it("cycle_length 8 holds the proportions exactly in every 8-trial cycle", async () => {
    for (const seed of ["1", "2"]) {
      const { rows } = await run(opts({ cycle_length: 8 }), {}, seed);
      for (const b of [1, 2, 3]) {
        const t = types(rows, b);
        for (let c = 0; c < 4; c++)
          expect(t.slice(c * 8, c * 8 + 8).filter((x) => x === "stop")).toHaveLength(2);
      }
    }
  });

  it("max_run, min_gap and start_with hold within and across blocks", async () => {
    const { rows } = await run(
      opts({ max_run: { stop: 1 }, min_gap: { stop: 2 }, start_with: { go: 3 } }),
      {},
      "s"
    );
    const all = [1, 2, 3].flatMap((b) => types(rows, b));
    for (const b of [1, 2, 3]) expect(types(rows, b).slice(0, 3)).toEqual(["go", "go", "go"]);
    const stopIdx = all.map((t, i) => (t === "stop" ? i : -1)).filter((i) => i >= 0);
    for (let i = 1; i < stopIdx.length; i++) expect(stopIdx[i] - stopIdx[i - 1]).toBeGreaterThan(2);
  });

  it("no_immediate_repeat on go_direction, and max_run as one number", async () => {
    const { rows } = await run(opts({ no_immediate_repeat: ["go_direction"] }), {}, "r");
    const dirs = responses(rows)
      .filter((r) => r.block === 2)
      .map((r) => r.go_stimulus);
    for (let i = 1; i < dirs.length; i++) expect(dirs[i]).not.toBe(dirs[i - 1]);
    const again = await run(opts({ max_run: 3 }), {}, "r");
    expect(types(again.rows, 2).join("")).not.toMatch(/(stop){4}|(go){4}/);
  });

  it("an order the rules cannot satisfy throws the sequencer's error when the timeline is built", () => {
    expect(() => createTimelineOnly(opts({ max_run: { go: 1 } }))).toThrow(/max_run|run|go/i);
  });
});

function createTimelineOnly(o: StopSignalTaskOptions) {
  return createTimeline(initJsPsych(), o);
}
