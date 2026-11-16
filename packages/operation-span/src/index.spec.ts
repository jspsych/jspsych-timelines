import { readFileSync, readdirSync } from "fs";
import { join } from "path";

import { simulateTimeline } from "@jspsych/test-utils";
import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { PROCESSING_ACCURACY_CRITERION } from "./constants";
import { OperationSpanOptions, resolveOptions } from "./options";
import { calculateScores, scoreRecall } from "./scoring";
import { createTimeline, timelineUnits, utils } from ".";

async function run(
  jsPsych: JsPsych,
  options: OperationSpanOptions,
  simulation: Record<string, any> = { default: { data: { rt: 400 } } }
) {
  const { timeline } = createTimeline(jsPsych, options);
  const { getData, expectFinished } = await simulateTimeline(
    timeline,
    "data-only",
    simulation,
    jsPsych
  );
  await expectFinished();
  return getData().values() as any[];
}

const of = (rows: any[], phase: string, part: string, extra: Record<string, unknown> = {}) =>
  rows.filter(
    (r) =>
      r.phase === phase && r.part === part && Object.entries(extra).every(([k, v]) => r[k] === v)
  );

const SMALL: OperationSpanOptions = {
  set_sizes: [2, 3],
  trials_per_condition: 2,
  instruction_demonstration: "none",
};

describe("createTimeline", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("ospan");
  });

  it("with the defaults runs the anchor's design: 4 + 15 + 3 practice trials, 15 test trials", async () => {
    const rows = await run(jsPsych, { instruction_demonstration: "none" });
    expect(of(rows, "practice", "response", { practice_part: "storage" })).toHaveLength(4);
    expect(of(rows, "practice", "processing", { practice_part: "processing_only" })).toHaveLength(
      15
    );
    expect(of(rows, "practice", "response", { practice_part: "combined" })).toHaveLength(3);
    const test = of(rows, "test", "response");
    expect(test).toHaveLength(15);
    // 3 trials of each of the set sizes 3-7, in one block
    for (const s of [3, 4, 5, 6, 7]) expect(test.filter((r) => r.set_size === s)).toHaveLength(3);
    expect(new Set(test.map((r) => r.block))).toEqual(new Set([1]));
    // one problem per memorandum, one memorandum per position
    expect(of(rows, "test", "processing")).toHaveLength(75);
    expect(of(rows, "test", "memorandum")).toHaveLength(75);
    expect(rows.filter((r) => r.part === "completion")).toHaveLength(1);
  });

  it("tags every row with task and version, never writes trial_index_in_block outside the standard, and the scorable row carries the scores", async () => {
    const rows = await run(jsPsych, SMALL);
    rows.forEach((r) => {
      expect(r.task).toBe("operation-span");
      expect(r.task_version).toBe(utils.constants.VERSION);
    });
    const t = of(rows, "test", "response")[0];
    expect(t).toMatchObject({
      phase: "test",
      part: "response",
      block: 1,
      trial_index_in_block: 1,
      correct: true,
      perfect: true,
      proportion_correct: 1,
    });
    expect(t.presented_items).toHaveLength(t.set_size);
    expect(t.recall_correct_positions).toEqual(t.presented_items.map(() => true));
    expect(Object.keys(t)).toEqual(
      expect.arrayContaining(["set_size", "presented_items", "recalled_items", "recall_rt"])
    );
  });

  it("respects a non-default configuration: per-block lists, single-screen format, two problems per memorandum, memorandum first", async () => {
    const rows = await run(jsPsych, {
      ...SMALL,
      set_sizes: [[2], [3, 4]],
      trials_per_condition: 2,
      processing_display_format: "equation_with_answer_single_screen",
      processing_items_per_memorandum: 2,
      memorandum_order_in_pair: "memorandum_first",
      practice_structure: "combined_only",
      practice_combined_trials: 2,
    });
    const test = of(rows, "test", "response");
    expect(test.map((r) => [r.block, r.set_size].join(":")).sort()).toEqual([
      "1:2",
      "1:2",
      "2:3",
      "2:3",
      "2:4",
      "2:4",
    ]);
    expect(of(rows, "test", "processing_problem")).toHaveLength(0);
    expect(of(rows, "test", "processing")).toHaveLength(2 * (2 * 2) + 2 * (3 * 2) + 2 * (4 * 2));
    expect(of(rows, "practice", "response").map((r) => r.practice_part)).toEqual([
      "combined",
      "combined",
    ]);
  });

  it("random_within_block makes trials_per_condition blocks, each holding every set size once", async () => {
    const rows = await run(jsPsych, {
      ...SMALL,
      set_sizes: [2, 3, 4],
      trials_per_condition: 4,
      block_order: "random_within_block",
    });
    const test = of(rows, "test", "response");
    expect(new Set(test.map((r) => r.block)).size).toBe(4);
    for (let b = 1; b <= 4; b++) {
      expect(
        test
          .filter((r) => r.block === b)
          .map((r) => r.set_size)
          .sort()
      ).toEqual([2, 3, 4]);
    }
    // random within the block: not always ascending
    const orders = [1, 2, 3, 4].map((b) =>
      test
        .filter((r) => r.block === b)
        .map((r) => r.set_size)
        .join("")
    );
    expect(new Set(orders).size).toBeGreaterThan(1);
  });

  it("writes exactly one processing row per episode in both display formats, also after a missed deadline", async () => {
    for (const fmt of [
      "problem_then_answer_screens",
      "equation_with_answer_single_screen",
    ] as const) {
      const j = initJsPsych();
      j.randomization.setSeed("miss");
      // every response takes longer than the 1 s window: all test episodes time out
      const rows = await run(
        j,
        {
          ...SMALL,
          processing_display_format: fmt,
          response_window_ms: 1000,
          practice_structure: "none",
        },
        { default: { data: { rt: 5000 } } }
      );
      const proc = of(rows, "test", "processing");
      expect(proc).toHaveLength(2 * (2 + 3));
      proc.forEach((r) =>
        expect(r).toMatchObject({ timeout: true, correct: false, rt: null, response_window: 1000 })
      );
      // the recall still follows
      expect(of(rows, "test", "response")).toHaveLength(4);
      expect(of(rows, "test", "response")[0].processing_timeouts).toBe(
        of(rows, "test", "response")[0].set_size
      );
    }
  });

  it("response_window_ms null is untimed", async () => {
    const rows = await run(jsPsych, { ...SMALL, response_window_ms: null });
    of(rows, "test", "processing").forEach((r) => {
      expect(r.response_window).toBeNull();
      expect(r.response_window_rule).toBe("none");
      expect(r.timeout).toBe(false);
    });
  });

  it("a jittered feedback duration is sampled per trial and recorded", async () => {
    const rows = await run(jsPsych, {
      ...SMALL,
      feedback_duration_ms: { min: 500, max: 1500, step: 250 },
    });
    const fb = of(rows, "test", "feedback");
    expect(fb).toHaveLength(4);
    fb.forEach((r) => {
      expect([500, 750, 1000, 1250, 1500]).toContain(r.feedback_duration);
      expect(r.duration_ms).toBe(r.feedback_duration);
    });
  });

  it("inter-item gaps appear between events, not before the recall", async () => {
    const rows = await run(jsPsych, {
      ...SMALL,
      inter_item_interval_ms: 300,
      set_sizes: [2],
      trials_per_condition: 1,
      practice_structure: "none",
    });
    const trial = rows.filter(
      (r) =>
        r.phase === "test" &&
        r.part !== "feedback" &&
        r.part !== "completion" &&
        r.part !== "instruction"
    );
    const parts = trial.map((r) => r.part);
    // problem screen, problem answer, gap, memorandum, gap, problem screen, answer, gap, memorandum, recall
    expect(parts.filter((p) => p === "inter_item")).toHaveLength(3);
    expect(parts[parts.length - 1]).toBe("response");
    expect(parts[parts.length - 2]).not.toBe("inter_item");
  });

  it("feedback: accuracy shows recall and math errors, correct_answer adds the sequence, none shows nothing", async () => {
    const rows = await run(jsPsych, {
      ...SMALL,
      trial_feedback: "correct_answer",
      feedback_duration_ms: 100,
    });
    const fb = of(rows, "test", "feedback");
    expect(fb).toHaveLength(4);
    expect(fb[0].feedback_kind).toBe("correct_answer");
    const j2 = initJsPsych();
    const none = await run(j2, { ...SMALL, trial_feedback: "none" });
    expect(none.filter((r) => r.part === "feedback")).toHaveLength(0);
    // the practice default is the same as the test default: feedback in both
    expect(of(rows, "practice", "feedback").length).toBeGreaterThan(0);
  });

  it("end_of_task_feedback shows the score on the last screen", async () => {
    const { timeline } = createTimeline(jsPsych, { ...SMALL, end_of_task_feedback: "summary" });
    const { getData, displayElement, expectFinished } = (await simulateTimeline(
      timeline,
      "data-only",
      { default: { data: { rt: 400 } } },
      jsPsych
    )) as any;
    await expectFinished();
    const completion = getData().filter({ part: "completion" }).values()[0];
    expect(completion.stimulus).toContain("Your score");
    expect(completion.stimulus).toContain("absolute score");
    void displayElement;
  });

  it("instruction_format experimenter skips instruction pages and the walkthrough", async () => {
    const rows = await run(jsPsych, {
      instruction_format: "experimenter",
      set_sizes: [2],
      trials_per_condition: 1,
    });
    expect(rows.filter((r) => r.phase === "instructions")).toHaveLength(0);
  });

  it("translated text is used", async () => {
    const rows = await run(jsPsych, {
      ...SMALL,
      text: { instruction_test_intro: "<p>PRUEBA</p>", continue_button: "Seguir" },
    });
    expect(
      of(rows, "instructions", "instruction")
        .map((r) => r.stimulus)
        .join("")
    ).toContain("PRUEBA");
  });
});

describe("options", () => {
  it("n_test_trials, set_sizes and trials_per_condition are reconciled", () => {
    expect(resolveOptions({}).n_test_trials).toBe(15);
    expect(resolveOptions({ set_sizes: [2, 3, 4, 5] }).n_test_trials).toBe(12); // S043
    expect(resolveOptions({ n_test_trials: 18, set_sizes: [8] }).trials_per_condition).toBe(18); // S045
    expect(
      resolveOptions({ set_sizes: [3, 4, 5, 6, 7, 8, 9], trials_per_condition: 2 }).n_test_trials
    ).toBe(14); // S011
    expect(
      resolveOptions({ set_sizes: [[2], [3, 4]], trials_per_condition: 2 }).n_test_trials
    ).toBe(6);
    expect(() => resolveOptions({ n_test_trials: 12 })).toThrow(
      /n_test_trials \(12\) is not a multiple of the number of set sizes \(5/
    );
    expect(() => resolveOptions({ n_test_trials: 12, trials_per_condition: 3 })).toThrow(
      /n_test_trials \(12\) and trials_per_condition \(3\) disagree/
    );
    expect(resolveOptions({ n_test_trials: 15, trials_per_condition: 3 }).n_test_trials).toBe(15);
  });

  it("practice: user practice > user top level > package practice default > package default", () => {
    expect(resolveOptions({}, "practice").trial_feedback).toBe("accuracy");
    expect(resolveOptions({ trial_feedback: "none" }, "practice").trial_feedback).toBe("none");
    expect(
      resolveOptions(
        { trial_feedback: "none", practice: { trial_feedback: "correct_answer" } },
        "practice"
      ).trial_feedback
    ).toBe("correct_answer");
    // test-only options: the top-level set sizes never leak into practice
    expect(resolveOptions({ set_sizes: [6, 7] }, "practice").set_sizes).toEqual([2]);
    expect(
      resolveOptions({ set_sizes: [6, 7], practice: { set_sizes: [3] } }, "practice").set_sizes
    ).toEqual([3]);
    expect(resolveOptions({ stimulus_duration_ms: 1000 }, "practice").stimulus_duration_ms).toBe(
      1000
    );
  });

  it("a single response_device applies to both responses; a map sets them separately", () => {
    expect(resolveOptions({ response_device: "touch" }).response_device).toEqual({
      processing: "touch",
      recall: "touch",
    });
    expect(resolveOptions({ response_device: { recall: "keyboard" } }).response_device).toEqual({
      processing: "mouse",
      recall: "keyboard",
    });
  });

  const cases: Array<[string, OperationSpanOptions, RegExp]> = [
    [
      "unimplemented task_variant",
      { task_variant: "reading_span" },
      /task_variant: "reading_span" is not implemented/,
    ],
    [
      "unimplemented display format",
      { processing_display_format: "equation_and_memorandum_same_screen" },
      /processing_display_format/,
    ],
    [
      "unimplemented block_order",
      { block_order: "counterbalanced" },
      /block_order: "counterbalanced"/,
    ],
    ["language", { stimulus_language: "German" }, /stimulus_language: "German"/],
    [
      "sentence-final word",
      { stimulus_set: { memorandum_source: "sentence_final_word" } },
      /memorandum_source/,
    ],
    ["audio instructions", { instruction_format: "audio" }, /instruction_format: "audio"/],
    ["RT feedback", { trial_feedback: "accuracy_rt" }, /trial_feedback: "accuracy_rt"/],
    ["microphone", { response_device: "microphone" }, /response_device.processing: "microphone"/],
    [
      "click matrix with the keyboard",
      { response_device: "keyboard" },
      /n_afc.*needs response_device recall "mouse" or "touch"/,
    ],
    [
      "typed recall with the mouse",
      { response_format: "free_text" },
      /free_text.*needs response_device recall "keyboard"/,
    ],
    [
      "? key without a keyboard",
      { recall_omission_handling: "question_mark_key" },
      /question_mark_key/,
    ],
    [
      "no memorandum duration",
      { stimulus_duration_ms: null as any },
      /stimulus_duration_ms must be a duration/,
    ],
    [
      "set size beyond the pool",
      { set_sizes: [13] },
      /needs 13 different memoranda but the pool has 12/,
    ],
    [
      "random_within_block with per-block lists",
      { set_sizes: [[2], [3]], block_order: "random_within_block" },
      /contradictory/,
    ],
    ["bad criterion", { practice_criterion: { accuracy: 2 } }, /practice_criterion.accuracy/],
    [
      "single keypress needs single characters",
      {
        response_device: { recall: "keyboard" },
        response_format: "single_response",
        stimulus_set: { memorandum: { words: ["apple", "bread"] } },
        set_sizes: [2],
      },
      /single-character/,
    ],
  ];
  it.each(cases)("throws on %s, naming the option", (_n, options, re) => {
    expect(() => createTimeline(initJsPsych(), options)).toThrow(re);
  });
});

describe("scoring", () => {
  const recall = (set_size: number, n: number, over: Record<string, unknown> = {}) => ({
    task: "operation-span",
    phase: "test",
    part: "response",
    set_size,
    n_correct_positions: n,
    proportion_correct: n / set_size,
    correct: n === set_size,
    ...over,
  });
  const proc = (correct: boolean, timeout = false, rt: number | null = 1000) => ({
    task: "operation-span",
    phase: "test",
    part: "processing",
    correct,
    timeout,
    rt: timeout ? null : rt,
  });

  it("is zero or null on empty data (never NaN)", () => {
    const s = calculateScores(new DataCollection([]));
    expect(s).toEqual({
      n_trials: 0,
      total_items: 0,
      partial_credit_load: 0,
      partial_credit_unit: null,
      absolute_score: 0,
      n_perfect_trials: 0,
      all_or_nothing_unit: null,
      n_processing: 0,
      accuracy_errors: 0,
      speed_errors: 0,
      processing_errors: 0,
      processing_accuracy: null,
      meets_processing_criterion: null,
      mean_processing_rt: null,
    });
  });

  it("computes partial credit (load and unit), absolute score and processing accuracy on hand-built rows", () => {
    const data = new DataCollection([
      recall(3, 3),
      recall(4, 2),
      recall(5, 5),
      recall(6, 0),
      proc(true, false, 800),
      proc(true, false, 1200),
      proc(false),
      proc(false, true),
      // never scored: practice, instructions, other tasks
      { ...recall(3, 0), phase: "practice" },
      { ...recall(7, 7), task: "other" },
      { ...proc(false), phase: "instructions", part: "instruction_check" },
    ]);
    const s = calculateScores(data);
    expect(s.n_trials).toBe(4);
    expect(s.total_items).toBe(18);
    expect(s.partial_credit_load).toBe(10);
    expect(s.partial_credit_unit).toBeCloseTo((1 + 0.5 + 1 + 0) / 4);
    expect(s.absolute_score).toBe(8);
    expect(s.n_perfect_trials).toBe(2);
    expect(s.all_or_nothing_unit).toBe(0.5);
    expect(s.n_processing).toBe(4);
    expect(s.speed_errors).toBe(1);
    expect(s.accuracy_errors).toBe(1);
    expect(s.processing_errors).toBe(2);
    expect(s.processing_accuracy).toBe(0.5);
    expect(s.meets_processing_criterion).toBe(false);
    expect(s.mean_processing_rt).toBe(1000);
  });

  it("the processing criterion is 85% by default and can be set", () => {
    expect(PROCESSING_ACCURACY_CRITERION).toBe(0.85);
    const rows = [
      ...Array(17)
        .fill(0)
        .map(() => proc(true)),
      proc(false),
      proc(false),
      proc(true),
    ];
    expect(calculateScores(new DataCollection(rows)).processing_accuracy).toBeCloseTo(18 / 20);
    expect(calculateScores(new DataCollection(rows)).meets_processing_criterion).toBe(true);
    expect(
      calculateScores(new DataCollection(rows), { processing_criterion: 0.95 })
        .meets_processing_criterion
    ).toBe(false);
  });

  it("scoreRecall: serial needs the right position, free needs the item; blanks never match", () => {
    const p = ["F", "H", "J"];
    expect(scoreRecall(p, ["F", "H", "J"], "serial")).toMatchObject({
      n_correct: 3,
      perfect: true,
    });
    expect(scoreRecall(p, ["F", "J", "H"], "serial")).toMatchObject({
      n_correct: 1,
      perfect: false,
      correct_positions: [true, false, false],
    });
    expect(scoreRecall(p, ["F", "J", "H"], "free")).toMatchObject({ n_correct: 3, perfect: true });
    expect(scoreRecall(p, ["F", null, "J"], "serial").correct_positions).toEqual([
      true,
      false,
      true,
    ]);
    expect(scoreRecall(p, ["f", "h", "j"], "serial").perfect).toBe(true); // typed recall is case-insensitive
    expect(scoreRecall(p, ["F", "F", "F"], "free").n_correct).toBe(1); // an entry counts once
  });
});

describe("timelineUnits and utils", () => {
  it("export the pieces and the helpers", () => {
    expect(Object.keys(timelineUnits)).toEqual(
      expect.arrayContaining([
        "createContext",
        "createInstructions",
        "createInstructionWalkthrough",
        "createProcessing",
        "createRecall",
        "createSpanTrial",
        "createPractice",
        "createTest",
        "createCompletion",
      ])
    );
    expect(Object.keys(utils)).toEqual(
      expect.arrayContaining([
        "scoring",
        "constants",
        "text",
        "deadlines",
        "stimuli",
        "sequence",
        "options",
      ])
    );
    expect(utils.constants.DEFAULT_OPTIONS.response_window_ms).toBeInstanceOf(Function);
  });

  it("stimulus generators: problems are integer, non-negative and half true", () => {
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("problems");
    const ps = Array.from({ length: 400 }, () => utils.stimuli.generateProblem(jsPsych));
    ps.forEach((p) => {
      expect(Number.isInteger(p.value) && p.value >= 0).toBe(true);
      expect(p.is_true).toBe(p.shown === p.value);
      expect(p.shown).toBeGreaterThanOrEqual(0);
      expect(p.text).toMatch(/^\(\d+ [×÷+−] \d+\) [+−] \d+$/);
    });
    const trues = ps.filter((p) => p.is_true).length;
    expect(trues).toBeGreaterThan(150);
    expect(trues).toBeLessThan(250);
  });
});

describe("source", () => {
  it("uses no Math.random", () => {
    for (const f of readdirSync(__dirname).filter(
      (n) => n.endsWith(".ts") && !n.endsWith(".spec.ts")
    )) {
      expect(readFileSync(join(__dirname, f), "utf8")).not.toContain("Math.random");
    }
  });
});
