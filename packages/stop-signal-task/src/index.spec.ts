import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { TASK_NAME, VERSION } from "./constants";
import {
  DEFAULT_OPTIONS,
  PHASE_OPTIONS,
  StopSignalTaskOptions,
  resolveAdaptive,
  resolveOptions,
} from "./options";
import { calculateScores, getSummary, integrationSsrt } from "./scoring";
import { responses, run } from "./test-helpers";
import { createTimeline, timelineUnits, utils } from ".";

describe("createTimeline", () => {
  it("returns a timeline and runs with the defaults: 32 practice and 4 x 64 test trials", async () => {
    const { rows } = await run({});
    expect(responses(rows, "practice")).toHaveLength(32);
    expect(responses(rows, "test")).toHaveLength(256);
    const test = responses(rows);
    for (const b of [1, 2, 3, 4]) {
      const blk = test.filter((r) => r.block === b);
      expect(blk).toHaveLength(64);
      expect(blk.filter((r) => r.condition === "stop")).toHaveLength(16); // 0.25 x 64, exact
      expect(blk.map((r) => r.trial_index_in_block)).toEqual(
        Array.from({ length: 64 }, (_, i) => i + 1)
      );
    }
  });

  it("builds a non-default configuration: 2 blocks, 0.4 stop trials, fixed delays, no practice", async () => {
    const { rows } = await run({
      n_blocks: 2,
      trials_per_block: 20,
      practice_trials: 0,
      condition_proportions: { stop: 0.4, go: 0.6 },
      difficulty_levels: [100, 200],
    });
    expect(responses(rows, "practice")).toHaveLength(0);
    const test = responses(rows);
    expect(test).toHaveLength(40);
    expect(test.filter((r) => r.condition === "stop")).toHaveLength(16);
    expect(new Set(test.filter((r) => r.condition === "stop").map((r) => r.ssd))).toEqual(
      new Set([100, 200])
    );
  });

  it("tags every row with task and task_version, and the scorable row with phase and part", async () => {
    const { rows } = await run({
      n_test_trials: 16,
      n_blocks: 1,
      practice_trials: 8,
      trial_feedback: "accuracy",
    });
    for (const r of rows) {
      expect(r.task).toBe(TASK_NAME);
      expect(r.task_version).toBe(VERSION);
    }
    for (const r of rows.filter((x) => x.part === "response")) {
      expect(["practice", "test"]).toContain(r.phase);
      expect(r.trial_type).toBe("html-keyboard-response"); // jsPsych's own column is not overwritten
      expect(["go", "stop"]).toContain(r.condition);
    }
    expect(rows.some((r) => "trial_index_in_block" in r && "trial_index" in r)).toBe(true);
    const parts = new Set(rows.map((r) => r.part));
    for (const p of [
      "instruction",
      "instruction_check",
      "instruction_feedback",
      "fixation",
      "response",
      "feedback",
      "iti",
      "block_feedback",
      "completion",
    ]) {
      expect(parts.has(p)).toBe(true);
    }
  });

  it("is deterministic under a seed", async () => {
    const strip = (rows: any[]) =>
      rows.map((r) => [r.condition, r.go_stimulus, r.ssd, r.rt, r.response]);
    const a = await run({ n_test_trials: 24, n_blocks: 1, practice_trials: 0 }, {}, "same");
    const b = await run({ n_test_trials: 24, n_blocks: 1, practice_trials: 0 }, {}, "same");
    expect(strip(a.rows)).toEqual(strip(b.rows));
  });

  it("timelineUnits and utils expose the factories and helpers", () => {
    for (const k of [
      "createContext",
      "createInstructions",
      "createBlock",
      "createPractice",
      "createResponseTrial",
      "createCompletion",
    ]) {
      expect(typeof (timelineUnits as any)[k]).toBe("function");
    }
    expect(utils.constants.TASK_NAME).toBe("stop-signal-task");
    expect(utils.constants.DEFAULT_OPTIONS).toBe(DEFAULT_OPTIONS);
    expect(typeof utils.scoring.calculateScores).toBe("function");
    expect(typeof utils.text.defaultText.instruction_intro).toBe("string");
  });
});

describe("the stop signal inside one plugin trial", () => {
  it("a stop trial is one response row with the requested delay, and the signal timer is armed on load", () => {
    const jsPsych = initJsPsych();
    const ctx = timelineUnits.createContext(jsPsych, { response_window_ms: 1000 });
    const spec = {
      trial_type: "stop" as const,
      go_direction: "left" as const,
      fixation_ms: 0,
      iti_ms: 0,
      feedback_ms: 0,
      fixed_ssd: 300,
    };
    const trial = timelineUnits.createResponseTrial(
      { ...ctx, test: { ...ctx.test, adaptive: null, difficulty_levels: [300] } },
      { ...ctx.test, adaptive: null, difficulty_levels: [300] },
      spec,
      "test",
      1,
      1
    );
    expect(trial.trial_duration).toBe(1000); // the window runs from go onset; the signal comes inside it
    expect(trial.response_ends_trial).toBe(true);
    expect(trial.data).toMatchObject({
      condition: "stop",
      go_stimulus: "left",
      correct_response: "ArrowLeft",
      part: "response",
      phase: "test",
    });
    const html = trial.stimulus();
    expect(html).toContain('data-signal="arrow_turns_red"');
    expect(typeof trial.on_load).toBe("function");
  });

  it("records ssd, ssd_actual (null without a screen), outcome and whether the signal appeared", async () => {
    const { rows } = await run({ n_test_trials: 32, n_blocks: 1, practice_trials: 0 });
    const stop = responses(rows).filter((r) => r.condition === "stop");
    expect(stop.length).toBe(8);
    for (const r of stop) {
      expect(typeof r.ssd).toBe("number");
      expect(r.ssd_actual).toBeNull();
      expect(["successful", "failed"]).toContain(r.stop_outcome);
      expect(r.correct).toBe(r.stop_outcome === "successful");
      expect(r.stop_signal_shown).toBe(r.rt === null || r.rt >= r.ssd);
    }
    for (const r of responses(rows).filter((x) => x.condition === "go")) {
      expect(r.ssd).toBeNull();
      expect(r.stop_outcome).toBe("na");
    }
  });
});

describe("simulation (an independent race model)", () => {
  it("gives plausible data: p(respond | signal) near .5, SSRT near the simulated 200 ms, failed stops faster than go", async () => {
    for (const seed of ["a", "b", "c"]) {
      const { data } = await run({}, {}, seed);
      const s = calculateScores(data);
      expect(s.p_respond_signal).toBeGreaterThan(0.35);
      expect(s.p_respond_signal).toBeLessThan(0.65);
      expect(s.ssrt_integration!).toBeGreaterThan(140);
      expect(s.ssrt_integration!).toBeLessThan(260);
      expect(s.mean_go_rt!).toBeGreaterThan(380);
      expect(s.mean_go_rt!).toBeLessThan(600);
      expect(s.failed_stop_rt!).toBeLessThan(s.mean_go_rt!);
      expect(s.checks).toMatchObject({
        stop_accuracy_ok: true,
        race_model_ok: true,
        go_omissions_ok: true,
      });
    }
  });

  it("a forced global RT overrides the model (50 s: every stop is successful, every go a timeout)", async () => {
    const { rows } = await run(
      { n_test_trials: 16, n_blocks: 1, practice_trials: 0 },
      { default: { data: { rt: 50000 } } }
    );
    for (const r of responses(rows)) {
      expect(r.timeout).toBe(true);
      expect(r.correct).toBe(r.condition === "stop");
    }
  });
});

describe("walkthrough under a forced global RT", () => {
  it("still answers correctly: the forced RT applies to the task's trials, not to the walkthrough", async () => {
    for (const rt of [400, 50000]) {
      const { rows } = await run(
        { n_test_trials: 8, n_blocks: 1, practice_trials: 0 },
        { default: { data: { rt } } }
      );
      const checks = rows.filter((r) => r.part === "instruction_check");
      expect(checks.map((r) => r.correct)).toEqual([true, true, true]);
      expect(checks.map((r) => r.attempt)).toEqual([1, 1, 1]);
      expect(checks.map((r) => r.response)).toEqual(["ArrowLeft", "ArrowRight", null]);
    }
  });
});

describe("scoring", () => {
  const row = (
    condition: "go" | "stop",
    rt: number | null,
    ssd: number | null,
    extra: any = {}
  ) => ({
    task: TASK_NAME,
    phase: "test",
    part: "response",
    condition,
    rt,
    response: rt === null ? null : "ArrowLeft",
    ssd,
    block: 1,
    correct: condition === "go" ? rt !== null && !extra.wrong : rt === null,
    ...extra,
  });

  it("returns counts of 0 and nulls (never NaN) for empty data", () => {
    const s = calculateScores(new DataCollection([]));
    expect(s.n_trials).toBe(0);
    expect(s.n_stop_trials).toBe(0);
    for (const k of [
      "go_accuracy",
      "mean_go_rt",
      "p_respond_signal",
      "mean_ssd",
      "ssrt_integration",
      "ssrt_integration_blockwise",
      "ssrt_mean",
      "failed_stop_rt",
    ]) {
      expect((s as any)[k]).toBeNull();
    }
    expect(s.checks).toEqual({
      stop_accuracy_ok: null,
      race_model_ok: null,
      go_omissions_ok: null,
      go_choice_errors_ok: null,
      enough_stop_trials: false,
    });
    expect(JSON.stringify(s)).not.toContain("NaN");
  });

  it("integration method with omission replacement, on a hand-built session", () => {
    // 10 go trials: nine responses 300..460 step 20, one omission (replaced by the maximum, 460);
    // 4 stop trials, 2 failed: p = .5, n = 5, the 5th of the replaced distribution is 380; mean SSD 225
    const go = [300, 320, 340, 360, 380, 400, 420, 440, 460].map((rt) => row("go", rt, null));
    go.push(row("go", null, null));
    const stop = [
      row("stop", 350, 200),
      row("stop", null, 200),
      row("stop", 380, 250),
      row("stop", null, 250),
    ];
    const data = new DataCollection([...go, ...stop]);
    const s = calculateScores(data);
    expect(s.p_respond_signal).toBe(0.5);
    expect(s.mean_ssd).toBe(225);
    expect(s.ssrt_integration).toBe(380 - 225);
    expect(s.mean_go_rt).toBe(380);
    // mean method: all go responses (mean 380) minus mean SSD
    expect(s.ssrt_mean).toBe(380 - 225);
    expect(s.failed_stop_rt).toBe(365);
    expect(s.go_omission_rate).toBe(0.1);
    expect(s.checks.race_model_ok).toBe(true);
    expect(s.checks.enough_stop_trials).toBe(false);
  });

  it("counts choice errors in the go distribution, and a response before the signal as a failed stop", () => {
    const rows: any[] = [
      row("go", 400, null),
      row("go", 500, null, { wrong: true }),
      row("go", 600, null),
      row("go", 700, null),
    ];
    rows.push(row("stop", 150, 200), row("stop", null, 200));
    const s = calculateScores(new DataCollection(rows));
    expect(s.go_choice_error_rate).toBe(0.25);
    expect(s.p_respond_signal).toBe(0.5);
    // n = .5 x 4 = 2: the 2nd of [400, 500, 600, 700] = 500; mean SSD 200
    expect(s.ssrt_integration).toBe(300);
  });

  it("blockwise integration averages per-block estimates; practice and instruction rows are never scored", () => {
    const block = (b: number, rts: number[], ssd: number) => [
      ...rts.map((rt) => row("go", rt, null, { block: b })),
      row("stop", rts[0] - 100, ssd, { block: b }),
      row("stop", null, ssd, { block: b }),
    ];
    const rows = [...block(1, [400, 500, 600, 700], 200), ...block(2, [500, 600, 700, 800], 300)];
    const practice = { ...row("go", 1, null), phase: "practice" };
    const check = { ...row("go", 1, null), phase: "instructions", part: "instruction_check" };
    const s = calculateScores(new DataCollection([...rows, practice, check]));
    // each block: p = .5, n = 2: 500 - 200 and 600 - 300
    expect(s.ssrt_integration_blockwise).toBe(300);
    expect(s.n_trials).toBe(rows.length);
  });

  it("integrationSsrt is null when it is undefined: no stop trials, or nobody ever responds on stop trials", () => {
    expect(integrationSsrt(new DataCollection([row("go", 400, null)]))).toBeNull();
    expect(
      integrationSsrt(new DataCollection([row("go", 400, null), row("stop", null, 200)]))
    ).toBeNull();
  });

  it("getSummary adds task and version", () => {
    expect(getSummary(new DataCollection([]))).toMatchObject({ task: TASK_NAME, version: VERSION });
  });
});

describe("resolveOptions", () => {
  it("applies practice precedence: user practice > user top level > package practice default > default", () => {
    expect(resolveOptions({}, "practice").trial_feedback).toBe("accuracy");
    expect(resolveOptions({}, "test").trial_feedback).toBe("none");
    expect(resolveOptions({ trial_feedback: "none" }, "practice").trial_feedback).toBe("none");
    expect(
      resolveOptions(
        { trial_feedback: "rt", practice: { trial_feedback: "accuracy_rt" } },
        "practice"
      ).trial_feedback
    ).toBe("accuracy_rt");
    expect(resolveOptions({ practice: { iti_ms: 100 } }, "practice").iti_ms).toBe(100);
    expect(resolveOptions({ practice: { iti_ms: 100 } }, "test").iti_ms).toBe(500);
  });

  it("reconciles the count options", () => {
    const r = (o: StopSignalTaskOptions) => resolveOptions(o);
    expect(r({}).n_test_trials).toBe(256);
    expect(r({ n_test_trials: 16, n_blocks: 1 })).toMatchObject({
      n_blocks: 1,
      trials_per_block: 16,
    });
    expect(r({ trials_per_block: 10 }).n_test_trials).toBe(40);
    expect(r({ n_test_trials: 100, trials_per_block: 25 }).n_blocks).toBe(4);
    expect(() => r({ n_test_trials: 100, n_blocks: 4, trials_per_block: 30 })).toThrow(
      /contradicts/
    );
  });

  it("gives a single map as a list of one, and normalises proportions", () => {
    expect(
      resolveOptions({ condition_proportions: { stop: 1, go: 3 } }).condition_proportions
    ).toEqual([{ stop: 0.25, go: 0.75 }]);
    expect(resolveOptions({ condition_proportions: { go: 1 } }).condition_proportions).toEqual([
      { stop: 0, go: 1 },
    ]);
  });

  it("the default cycle rule is dropped where it does not fit, and a cycle_length that does not fit throws", () => {
    expect(resolveOptions({}).sequence_constraints).toEqual({ cycle_length: 8 });
    expect(
      resolveOptions({ condition_proportions: { stop: 0.2, go: 0.8 }, trials_per_block: 60 })
        .sequence_constraints
    ).toBeNull();
    expect(resolveOptions({ n_test_trials: 12, n_blocks: 1 }).sequence_constraints).toBeNull();
    expect(resolveOptions({ sequence_constraints: null }).sequence_constraints).toBeNull();
    expect(() =>
      createTimeline(initJsPsych(), {
        sequence_constraints: { cycle_length: 8 },
        condition_proportions: { stop: 0.2, go: 0.8 },
      })
    ).toThrow(/cycle_length/);
  });

  it("the phase overrides listed in PHASE_OPTIONS are real options", () => {
    for (const k of PHASE_OPTIONS) expect(k in DEFAULT_OPTIONS).toBe(true);
  });
});

describe("contradictions and unimplemented values throw, naming the option", () => {
  const build = (o: StopSignalTaskOptions) => () => createTimeline(initJsPsych(), o);
  it.each<[string, StopSignalTaskOptions, RegExp]>([
    ["response_window_ms null", { response_window_ms: null }, /response_window_ms/],
    ["modality audiovisual", { stimulus_modality: "audiovisual" }, /stimulus_modality/],
    ["response_device gamepad", { response_device: "gamepad" }, /response_device/],
    [
      "device_eligibility browser_restricted",
      { device_eligibility: "browser_restricted" },
      /device_eligibility/,
    ],
    ["population_protocol child", { population_protocol: "child" }, /population_protocol/],
    ["performance_incentive bonus", { performance_incentive: "bonus" }, /performance_incentive/],
    ["trial_feedback points", { trial_feedback: "points" }, /trial_feedback/],
    [
      "counterbalancing",
      { response_mapping_counterbalancing: "random_per_participant" },
      /response_mapping_counterbalancing/,
    ],
    [
      "instruction_demonstration animated",
      { instruction_demonstration: "animated" },
      /instruction_demonstration/,
    ],
    ["adaptive.procedure quest", { adaptive: { procedure: "quest" } }, /adaptive\.procedure/],
    [
      "adaptive and difficulty_levels",
      { adaptive: {}, difficulty_levels: [100] },
      /adaptive and difficulty_levels/,
    ],
    [
      "tracking explanation without a staircase",
      {
        adaptive: null,
        difficulty_levels: [100],
        strategy_instruction: "dont_wait_plus_tracking_explanation",
      },
      /strategy_instruction/,
    ],
    ["stop trials without a delay rule", { adaptive: null }, /stop-signal delay/],
    [
      "tone with a visual modality",
      { stimulus_modality: "visual", stimulus_set: { stop_signal: "tone" } },
      /contradict/,
    ],
    [
      "circle signal on plain arrows",
      { stimulus_set: { go: "arrows", stop_signal: "circle_turns_red" } },
      /arrows_in_circle/,
    ],
    ["red arrow gone before the signal", { stimulus_duration_ms: 150 }, /stimulus_duration_ms\.go/],
    ["one key", { response_keys: ["a"] }, /response_keys/],
    [
      "criterion without practice",
      { practice_trials: 0, practice_criterion: { accuracy: 0.8 } },
      /practice_criterion/,
    ],
    [
      "unknown trial type",
      { condition_proportions: { stop: 0.5, nogo: 0.5 } as any },
      /unknown trial type/,
    ],
    ["unknown sequence rule", { sequence_constraints: { max_runs: 2 } as any }, /unknown rule/],
    [
      "touch device on a computer-only task",
      { response_device: "touch", device_eligibility: "computer_only" },
      /contradicts/,
    ],
  ])("%s", (_name, options, re) => {
    expect(build(options)).toThrow(re);
  });

  it("adaptive field contradictions", () => {
    expect(() =>
      resolveAdaptive({ step_size: { up: 25, down: 50 }, target_accuracy: 0.5 })
    ).toThrow(/contradict/);
    expect(() =>
      resolveAdaptive({ procedure: "staircase_1up_2down", target_accuracy: 0.5 })
    ).toThrow(/contradicts/);
    expect(() => resolveAdaptive({ start_level: 10, bounds: [50, 1200] })).toThrow(/outside/);
    expect(() => resolveAdaptive({ bounds: [500, 100] })).toThrow(/min < max/);
  });
});
