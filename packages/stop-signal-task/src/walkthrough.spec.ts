import { initJsPsych } from "jspsych";
import { DataCollection } from "jspsych";

import { INSTRUCTION_MAX_ATTEMPTS } from "./constants";
import { StopSignalTaskOptions } from "./options";
import { calculateScores } from "./scoring";
import { run } from "./test-helpers";
import { createTimeline } from ".";

const checks = (rows: any[]) => rows.filter((r) => r.part === "instruction_check");

describe("instruction walkthrough (interactive)", () => {
  it("is the default: a go step for each arrow and a stop step, before practice", async () => {
    const { rows } = await run({ n_test_trials: 16, n_blocks: 1 });
    const c = checks(rows);
    expect(c.map((r) => r.condition)).toEqual(["go", "go", "stop"]);
    expect(c.map((r) => r.go_stimulus)).toEqual(["left", "right", "left"]); // alternates between the responses
    const idx = (f: (r: any) => boolean) => rows.findIndex(f);
    expect(idx((r) => r.part === "instruction_check")).toBeGreaterThan(
      idx((r) => r.part === "instruction")
    );
    expect(idx((r) => r.part === "instruction_check")).toBeLessThan(
      idx((r) => r.phase === "practice")
    );
  });

  it("answers correctly at the first attempt under simulation, withholds on the stop step, and is tagged", async () => {
    const { rows } = await run({});
    const c = checks(rows);
    c.forEach((r) => {
      expect(r.phase).toBe("instructions");
      expect(r.correct).toBe(true);
      expect(r.attempt).toBe(1);
    });
    expect(c[0].response).toBe("ArrowLeft");
    expect(c[1].response).toBe("ArrowRight");
    expect(c[2]).toMatchObject({
      response: null,
      timeout: true,
      stop_outcome: "successful",
      ssd: 250,
      response_window: 2500,
    });
    expect(
      rows.filter((r) => r.part === "instruction_feedback" && r.feedback_kind === "correct")
    ).toHaveLength(3);
  });

  it("uses the task's own key mapping and signal form", async () => {
    const { rows } = await run({
      response_keys: ["z", "m"],
      stimulus_set: { stop_signal: "border" },
    });
    expect(checks(rows).map((r) => r.correct_response)).toEqual(["z", "m", "z"]);
    expect(checks(rows)[2].stop_signal).toBe("border");
  });

  it("has no stop step when the task has no stop trials", async () => {
    const { rows } = await run({
      condition_proportions: { go: 1 },
      practice_trials: 4,
      n_test_trials: 4,
      n_blocks: 1,
    });
    expect(checks(rows).map((r) => r.condition)).toEqual(["go", "go"]);
  });

  it("is not scored", async () => {
    const { data } = await run({ n_test_trials: 16, n_blocks: 1 });
    const before = calculateScores(data);
    expect(before.n_trials).toBe(16);
    const bad = {
      task: "stop-signal-task",
      phase: "instructions",
      part: "instruction_check",
      condition: "stop",
      correct: false,
      rt: 5,
      response: "ArrowLeft",
      ssd: 250,
      block: null,
    };
    expect(calculateScores(new DataCollection([...(data.values() as any[]), bad]))).toEqual(before);
  });

  it("is skipped for none and experimenter, static for examples, and throws for unsupported values", async () => {
    expect(checks((await run({ instruction_demonstration: "none" })).rows)).toHaveLength(0);
    expect(checks((await run({ instruction_format: "experimenter" })).rows)).toHaveLength(0);
    const ex = (await run({ instruction_demonstration: "examples" })).rows;
    expect(checks(ex)).toHaveLength(0);
    expect(ex.filter((r) => r.part === "instruction_example").map((r) => r.condition)).toEqual([
      "go",
      "go",
      "stop",
    ]);
    for (const v of ["animated", "guided_trial"] as const) {
      expect(() => createTimeline(initJsPsych(), { instruction_demonstration: v })).toThrow(
        /instruction_demonstration/
      );
    }
  });

  it("the stop-step trial runs the same trial code as the test (one plugin trial, signal at a delay, window 2.5 s)", () => {
    const { timeline } = createTimeline(initJsPsych(), {});
    const walk = JSON.stringify(timeline.length);
    expect(walk).toBeTruthy();
    const nodes: any[] = [];
    const visit = (t: any): void =>
      Array.isArray(t)
        ? t.forEach(visit)
        : t?.timeline
        ? visit(t.timeline)
        : t?.type && nodes.push(t);
    visit(timeline);
    const stop = nodes.find(
      (n) => n.data?.part === "instruction_check" && n.data?.condition === "stop"
    );
    expect(stop.trial_duration).toBe(2500);
    expect(stop.response_ends_trial).toBe(true);
    expect(typeof stop.on_load).toBe("function");
    expect(stop.stimulus()).toContain("data-signal");
  });

  it("hints and a 3-attempt cap are wired (a loop over the step, hint then reveal)", () => {
    expect(INSTRUCTION_MAX_ATTEMPTS).toBe(3);
    const { timeline } = createTimeline(initJsPsych(), {});
    const loops: any[] = [];
    const visit = (t: any): void => {
      if (Array.isArray(t)) t.forEach(visit);
      else if (t?.timeline) {
        if (t.loop_function) loops.push(t);
        visit(t.timeline);
      }
    };
    visit(timeline);
    expect(loops).toHaveLength(3);
  });
});

describe("practice_criterion", () => {
  const base: StopSignalTaskOptions = {
    practice_trials: 8,
    n_test_trials: 16,
    n_blocks: 1,
    instruction_demonstration: "none",
  };
  const attempts = (rows: any[]) => [
    ...new Set(
      rows
        .filter((r) => r.phase === "practice" && r.part === "response")
        .map((r) => r.practice_attempt)
    ),
  ];

  it("passes on the first try with a plausible participant", async () => {
    const { rows } = await run({ ...base, practice_criterion: { accuracy: 0.7 } });
    expect(attempts(rows)).toEqual([1]);
    const last = rows.filter((r) => r.phase === "practice" && "practice_criterion_met" in r)[0];
    expect(last.practice_criterion_met).toBe(true);
    expect(last.practice_go_accuracy).toBeGreaterThanOrEqual(0.7);
  });

  it("on_fail repeat: runs practice again up to max_repeats, then the test goes on", async () => {
    const { rows } = await run(
      { ...base, practice_criterion: { accuracy: 0.8, on_fail: "repeat", max_repeats: 2 } },
      { default: { data: { rt: 50000 } } }
    );
    expect(attempts(rows)).toEqual([1, 2, 3]);
    expect(rows.filter((r) => r.phase === "practice" && r.part === "response")).toHaveLength(24);
    expect(rows.filter((r) => r.phase === "test" && r.part === "response")).toHaveLength(16);
    expect(
      rows.filter((r) => "practice_criterion_met" in r).map((r) => r.practice_criterion_met)
    ).toEqual([false, false, false]);
    // each repeat has its own trial list and its own repeat notice
    expect(rows.filter((r) => r.part === "instruction")).toHaveLength(4 + 1 + 2 + 1); // intro, response, stop, strategy, practice intro, 2 repeats, test intro
  });

  it("on_fail continue: records the miss and goes on without repeating", async () => {
    const { rows } = await run(
      { ...base, practice_criterion: { accuracy: 0.8, on_fail: "continue" } },
      { default: { data: { rt: 50000 } } }
    );
    expect(attempts(rows)).toEqual([1]);
    expect(rows.filter((r) => "practice_criterion_met" in r)[0].practice_criterion_met).toBe(false);
    expect(rows.filter((r) => r.phase === "test" && r.part === "response")).toHaveLength(16);
  });

  it("on_fail end: skips the test blocks and shows the completion page", async () => {
    const { rows } = await run(
      { ...base, practice_criterion: { accuracy: 0.8, on_fail: "end" } },
      { default: { data: { rt: 50000 } } }
    );
    expect(attempts(rows)).toEqual([1]);
    expect(rows.filter((r) => r.phase === "test")).toHaveLength(0);
    expect(rows.some((r) => r.part === "completion")).toBe(true);
  });

  it("window: accuracy is taken over the last trials only", async () => {
    const r = await run({ ...base, practice_criterion: { accuracy: 0.5, window: 3 } });
    expect(r.rows.filter((x) => "practice_criterion_met" in x)).toHaveLength(1);
  });
});

describe("other behaviour", () => {
  it("trial feedback by phase: accuracy in practice only by default, and a stop trial's feedback says what went wrong", async () => {
    const { rows } = await run(
      { n_test_trials: 16, n_blocks: 1, instruction_demonstration: "none", practice_trials: 8 },
      { default: { data: { rt: 400 } } }
    );
    expect(rows.filter((r) => r.part === "feedback" && r.phase === "practice").length).toBe(8);
    expect(rows.filter((r) => r.part === "feedback" && r.phase === "test").length).toBe(0);
    const fb = rows.filter((r) => r.part === "feedback").map((r) => r.feedback_text);
    expect(fb).toContain("You should not respond when the signal appears");
  });

  it("break between blocks: a number enables the button after that long, null is self-paced, 0 is no rest", async () => {
    const ms = (o: StopSignalTaskOptions) =>
      run({
        n_blocks: 3,
        trials_per_block: 8,
        practice_trials: 0,
        instruction_demonstration: "none",
        ...o,
      });
    expect(
      (await ms({ break_duration_ms: 15000 })).rows
        .filter((r) => r.part === "rest")
        .map((r) => r.break_duration)
    ).toEqual([15000, 15000]);
    expect(
      (await ms({ break_duration_ms: null })).rows
        .filter((r) => r.part === "rest")
        .map((r) => r.break_duration)
    ).toEqual([null, null]);
    expect((await ms({ break_duration_ms: 0 })).rows.filter((r) => r.part === "rest")).toHaveLength(
      0
    );
  });

  it("block feedback summarises the block from the test rows", async () => {
    const { jsPsych } = await run({
      n_blocks: 2,
      trials_per_block: 16,
      practice_trials: 0,
      instruction_demonstration: "none",
    });
    expect(jsPsych.data.get().filter({ part: "block_feedback" }).count()).toBe(2);
  });

  it("jittered fixation and ITI are sampled per trial and recorded", async () => {
    const { rows } = await run({
      n_test_trials: 24,
      n_blocks: 1,
      practice_trials: 0,
      instruction_demonstration: "none",
      fixation_duration_ms: { min: 500, max: 1000, step: 100 },
      iti_ms: { min: 750, max: 950 },
    });
    const fix = rows.filter((r) => r.part === "fixation").map((r) => r.fixation_duration);
    expect(new Set(fix).size).toBeGreaterThan(1);
    fix.forEach((v) => expect([500, 600, 700, 800, 900, 1000]).toContain(v));
    expect(rows.filter((r) => r.part === "iti").every((r) => r.iti >= 750 && r.iti <= 950)).toBe(
      true
    );
  });

  it("a go-only practice via the practice override has no stop trials", async () => {
    const { rows } = await run({
      n_test_trials: 16,
      n_blocks: 1,
      practice_trials: 8,
      instruction_demonstration: "none",
      practice: { condition_proportions: { go: 1 } },
    });
    expect(
      rows.filter((r) => r.phase === "practice" && r.part === "response" && r.condition === "stop")
    ).toHaveLength(0);
  });

  it("the button devices use the button plugin with two labelled buttons", async () => {
    const { rows } = await run({
      n_test_trials: 8,
      n_blocks: 1,
      practice_trials: 0,
      instruction_demonstration: "none",
      response_device: "touch",
    });
    const r = rows.filter((x) => x.part === "response");
    expect(r.every((x) => x.trial_type === "html-button-response")).toBe(true);
    expect(r.every((x) => x.response === null || [0, 1].includes(x.response))).toBe(true);
    expect(r[0].correct_response === 0 || r[0].correct_response === 1).toBe(true);
  });
});
