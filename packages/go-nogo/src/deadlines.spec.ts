import { simulateTimeline } from "@jspsych/test-utils";
import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { DEADLINE_FALLBACK_MS } from "./constants";
import { createTimeline, utils } from ".";

const { meanPlusSd, percentile } = utils.deadlines;

function ctxWith(rts: number[], phase: "practice" | "test" = "test") {
  const base = {
    task: "go-nogo",
    phase: "practice",
    part: "response",
    condition: "go",
    correct: true,
  };
  const rows = [
    ...rts.map((rt) => ({ ...base, rt })),
    // rows that must not count
    { ...base, correct: false, rt: 5000 },
    { ...base, condition: "nogo", rt: 5000 },
    { ...base, phase: "test", rt: 5000 },
    { ...base, task: "other", rt: 5000 },
  ];
  const jsPsych = { data: { get: () => new DataCollection(rows) } } as unknown as JsPsych;
  return { jsPsych, phase, block: 1, trial_index_in_block: 1 };
}

describe("deadline helpers (utils.deadlines)", () => {
  const rts = [400, 450, 500, 550, 600, 650];

  it("returns the fixed default during practice and with fewer than 5 usable practice RTs", () => {
    expect(meanPlusSd(2.5)(ctxWith(rts, "practice"))).toBe(DEADLINE_FALLBACK_MS);
    expect(meanPlusSd(2.5)(ctxWith([400, 450, 500, 550]))).toBe(DEADLINE_FALLBACK_MS);
    expect(percentile(90)(ctxWith([]))).toBe(DEADLINE_FALLBACK_MS);
  });

  it("mean + k SD of correct practice go RTs only", () => {
    // mean 525, sd 93.54
    expect(meanPlusSd(2)(ctxWith(rts))).toBe(Math.round(525 + 2 * 93.5414));
    expect(meanPlusSd(0)(ctxWith(rts))).toBe(525);
  });

  it("percentile with linear interpolation", () => {
    expect(percentile(50)(ctxWith(rts))).toBe(525);
    expect(percentile(90)(ctxWith(rts))).toBe(Math.round(600 + 0.5 * 50));
    expect(percentile(100)(ctxWith(rts))).toBe(650);
  });

  it("bounds clamp the deadline", () => {
    expect(meanPlusSd(2, { max: 600 })(ctxWith(rts))).toBe(600);
    expect(meanPlusSd(0, { min: 800 })(ctxWith(rts))).toBe(800);
  });

  it("is deterministic: the same data gives the same value", () => {
    const c = ctxWith(rts);
    expect(meanPlusSd(2.5)(c)).toBe(meanPlusSd(2.5)(c));
  });

  it("carries a readable label", () => {
    expect(meanPlusSd(2.5).label).toBe("mean + 2.5 SD of correct practice RTs");
    expect(percentile(90).label).toBe("90th percentile of correct practice RTs");
  });

  it("is used as the response window: fallback in practice, calibrated in test, recorded with its label", async () => {
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("deadline");
    const { timeline } = createTimeline(jsPsych, {
      practice_trials: 20,
      n_test_trials: 6,
      instruction_format: "experimenter",
      response_window_ms: meanPlusSd(2.5, { min: 900, max: 1100 }),
    });
    const { getData, expectFinished } = await simulateTimeline(
      timeline,
      "data-only",
      { default: { data: { rt: 400 } } },
      jsPsych
    );
    await expectFinished();
    const rows = getData().values() as any[];
    const resp = rows.filter((r) => r.part === "response");
    resp
      .filter((r) => r.phase === "practice")
      .forEach((r) => expect(r.response_window).toBe(DEADLINE_FALLBACK_MS));
    // practice RTs are all 400, so mean + 2.5 SD = 400, raised to the lower bound
    resp.filter((r) => r.phase === "test").forEach((r) => expect(r.response_window).toBe(900));
    resp.forEach((r) =>
      expect(r.response_window_rule).toBe("mean + 2.5 SD of correct practice RTs")
    );
  });
});
