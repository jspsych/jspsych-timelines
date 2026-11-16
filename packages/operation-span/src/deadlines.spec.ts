import { simulateTimeline } from "@jspsych/test-utils";
import { DataCollection, initJsPsych } from "jspsych";

import { FALLBACK_DEADLINE_MS, MIN_CALIBRATION_ROWS } from "./constants";
import { DeadlineContext } from "./deadlines";
import { createTimeline, utils } from ".";

const { deadlines } = utils;

const row = (rt: number | null, over: Record<string, unknown> = {}) => ({
  task: "operation-span",
  phase: "practice",
  part: "processing",
  practice_part: "processing_only",
  correct: true,
  rt,
  ...over,
});
const fake = (rows: any[]) => ({ data: { get: () => new DataCollection(rows) } } as any);
const ctx = (rows: any[], phase: "practice" | "test" = "test"): DeadlineContext => ({
  jsPsych: fake(rows),
  phase,
  block: 1,
  trial_index_in_block: 1,
});

// RTs with real variance: mean 2000, sample SD = sqrt(250000) = 500 (n - 1 denominator)
const RTS = [1500, 2000, 2500, 1500, 2500, 2000, 1500, 2500];
const mean = 2000;
const sd = Math.sqrt(RTS.reduce((a, x) => a + (x - mean) ** 2, 0) / (RTS.length - 1));

describe("utils.deadlines", () => {
  it("meanPlusSd(2.5) is the mean + 2.5 sample SDs of the correct processing-only practice RTs", () => {
    const f = deadlines.meanPlusSd(2.5);
    expect(f(ctx(RTS.map((x) => row(x))))).toBe(Math.round(mean + 2.5 * sd));
    expect(f.label).toBe("mean + 2.5 SD of correct practice RTs");
    expect(deadlines.meanPlusSd(2)(ctx(RTS.map((x) => row(x))))).toBe(Math.round(mean + 2 * sd));
  });

  it("reads only correct processing-only practice rows of this task that have an RT", () => {
    const f = deadlines.meanPlusSd(2.5);
    const good = RTS.map((x) => row(x));
    const noise = [
      row(9000, { correct: false }), // an error
      row(9000, { rt: null as any, timeout: true }), // a miss
      row(9000, { practice_part: "combined" }), // combined practice is already timed
      row(9000, { phase: "test" }),
      row(9000, { task: "flanker" }),
      row(9000, { part: "processing_problem" }),
    ];
    expect(f(ctx([...noise, ...good]))).toBe(f(ctx(good)));
  });

  it("returns the fixed 6000 ms with fewer than 5 usable RTs", () => {
    expect(MIN_CALIBRATION_ROWS).toBe(5);
    const f = deadlines.meanPlusSd(2.5);
    expect(f(ctx([]))).toBe(FALLBACK_DEADLINE_MS);
    expect(f(ctx(RTS.slice(0, 4).map((x) => row(x))))).toBe(6000);
    expect(f(ctx(RTS.slice(0, 5).map((x) => row(x))))).not.toBe(6000);
    // wrong-answer rows do not count towards the 5
    expect(f(ctx([...RTS.slice(0, 4).map((x) => row(x)), row(3000, { correct: false })]))).toBe(
      6000
    );
  });

  it("bounds clamp the calibrated value and the fallback", () => {
    const rows = RTS.map((x) => row(x));
    expect(deadlines.meanPlusSd(2.5, { max: 3000 })(ctx(rows))).toBe(3000);
    expect(deadlines.meanPlusSd(2.5, { min: 5000 })(ctx(rows))).toBe(5000);
    expect(deadlines.meanPlusSd(2.5, { max: 4000 })(ctx([]))).toBe(4000);
    expect(deadlines.meanPlusSd(2.5, { min: 7000 })(ctx([]))).toBe(7000);
    expect(deadlines.meanPlusSd(2.5, { max: 3000 }).label).toContain("bounded");
  });

  it("percentile interpolates", () => {
    const rows = [1000, 2000, 3000, 4000, 5000].map((x) => row(x));
    expect(deadlines.percentile(50)(ctx(rows))).toBe(3000);
    expect(deadlines.percentile(90)(ctx(rows))).toBe(4600);
    expect(deadlines.percentile(100)(ctx(rows))).toBe(5000);
    expect(deadlines.percentile(95, { max: 4000 })(ctx(rows))).toBe(4000);
    expect(deadlines.percentile(95)(ctx([]))).toBe(6000);
    expect(deadlines.percentile(95).label).toBe("95th percentile of correct practice RTs");
  });

  it("is deterministic: the same data gives the same value on every call, and test rows do not change it", () => {
    const f = deadlines.meanPlusSd(2.5);
    const practice = RTS.map((x) => row(x));
    const a = f(ctx(practice));
    const testRows = [
      row(8000, { phase: "test" }),
      row(100, { phase: "test", part: "processing" }),
    ];
    expect([
      f(ctx(practice)),
      f(ctx([...practice, ...testRows])),
      f(ctx([...testRows, ...practice])),
    ]).toEqual([a, a, a]);
  });

  it("calibration() reports n, mean and SD", () => {
    expect(deadlines.calibration(fake(RTS.map((x) => row(x))))).toEqual({ n: 8, mean, sd });
    expect(deadlines.calibration(fake([]))).toEqual({ n: 0, mean: null, sd: null });
  });
});

describe("the calibrated deadline in a run", () => {
  /** simulated RTs that vary, so the SD is not 0 */
  async function runVarying(options: any) {
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("calib");
    let n = 0;
    const { timeline } = createTimeline(jsPsych, {
      set_sizes: [2, 3],
      trials_per_condition: 2,
      instruction_demonstration: "none",
      ...options,
    });
    const { getData, expectFinished } = await simulateTimeline(
      timeline,
      "data-only",
      { default: { data: { rt: () => 300 + 40 * (n++ % 7), response: undefined } } },
      jsPsych
    );
    await expectFinished();
    return getData().values() as any[];
  }

  it("is the default: self-paced processing-only practice, then mean + 2.5 SD recorded with its label on every combined-practice and test problem", async () => {
    // a keyboard responder answers with a valid key; accuracy is random, so give it many practice problems
    const rows = await runVarying({ practice_trials: 60 });
    const practice = rows.filter(
      (r) =>
        r.phase === "practice" && r.part === "processing" && r.practice_part === "processing_only"
    );
    expect(practice).toHaveLength(60);
    practice.forEach((r) => {
      expect(r.response_window).toBeNull();
      expect(r.response_window_rule).toBe("self-paced");
    });
    const rts = practice.filter((r) => r.correct).map((r) => r.rt as number);
    expect(rts.length).toBeGreaterThanOrEqual(5);
    const m = rts.reduce((a, b) => a + b, 0) / rts.length;
    const s = Math.sqrt(rts.reduce((a, x) => a + (x - m) ** 2, 0) / (rts.length - 1));
    expect(s).toBeGreaterThan(0);
    const expected = Math.round(m + 2.5 * s);
    const timed = rows.filter(
      (r) => r.part === "processing" && (r.phase === "test" || r.practice_part === "combined")
    );
    expect(timed.length).toBeGreaterThan(10);
    timed.forEach((r) => {
      expect(r.response_window).toBe(expected); // fixed once practice is over
      expect(r.response_window_rule).toBe("mean + 2.5 SD of correct practice RTs");
    });
  });

  it("falls back to 6000 ms when practice gave too few correct RTs, and says so in the data", async () => {
    const rows = await runVarying({ practice_trials: 2 });
    const timed = rows.filter((r) => r.part === "processing" && r.phase === "test");
    timed.forEach((r) => expect(r.response_window).toBe(6000));
  });

  it("a custom function is called with the context, once per timed trial, and recorded", async () => {
    const seen: DeadlineContext[] = [];
    const rows = await runVarying({
      practice_structure: "none",
      response_window_ms: Object.assign(
        (c: DeadlineContext) => {
          seen.push(c);
          return 5000 + c.trial_index_in_block;
        },
        { label: "5 s plus the trial number" }
      ),
    });
    const timed = rows.filter((r) => r.part === "processing" && r.phase === "test");
    expect(timed).toHaveLength(10);
    expect(seen).toHaveLength(10); // once per timed trial, not per row
    seen.forEach((c) =>
      expect(Object.keys(c).sort()).toEqual(["block", "jsPsych", "phase", "trial_index_in_block"])
    );
    timed.forEach((r) => {
      expect(r.response_window).toBe(5000 + r.trial_index_in_block);
      expect(r.response_window_rule).toBe("5 s plus the trial number");
    });
  });

  it("practice.response_window_ms times the processing-only practice too", async () => {
    const rows = await runVarying({
      response_window_ms: 4000,
      practice: { response_window_ms: 3000 },
      practice_trials: 5,
    });
    rows
      .filter((r) => r.phase === "practice" && r.part === "processing")
      .forEach((r) => expect(r.response_window).toBe(3000));
    rows
      .filter((r) => r.phase === "test" && r.part === "processing")
      .forEach((r) => expect(r.response_window).toBe(4000));
  });
});
