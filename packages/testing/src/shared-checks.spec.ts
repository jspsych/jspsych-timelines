import { miniContract, miniHarness } from "./__fixtures__/mini-task";
import type { MiniBug, MiniOptions } from "./__fixtures__/mini-task";
import { expectStandardTagging } from "./checks/schema";
import { sharedChecks } from "./checks/shared";
import { missingContract } from "./checks/types";
import { defineContract } from "./contract";
import { rowsOf } from "./harness";

async function apply(option: string, options: MiniOptions, bugs: MiniBug[] = []) {
  const harness = miniHarness(bugs);
  const r = await harness.run(options);
  return () =>
    Promise.resolve().then(() => sharedChecks[option].fn(r, { contract: miniContract, harness }));
}

/** the option's check passes on a faithful task and fails on one with the fault */
async function passes(option: string, options: MiniOptions) {
  await expect((await apply(option, options))()).resolves.toBeUndefined();
}
async function catches(option: string, options: MiniOptions, bug: MiniBug) {
  await expect((await apply(option, options, [bug]))()).rejects.toThrow();
}

describe("shared checks pass on a task that honours the option", () => {
  const big = { n_test_trials: 24, n_blocks: 2 };
  const cases: [string, MiniOptions][] = [
    ["n_test_trials", { n_test_trials: 10 }],
    ["practice_trials", { practice_trials: 3 }],
    ["practice_trials", { practice_trials: 0 }],
    ["n_blocks", { n_test_trials: 11, n_blocks: 3 }],
    ["trials_per_block", { trials_per_block: 5, n_blocks: 3 }],
    ["condition_proportions", { ...big, condition_proportions: { a: 0.25, b: 0.75 } }],
    [
      "condition_proportions",
      { n_test_trials: 17, n_blocks: 2, condition_proportions: { a: 1, b: 1, c: 1 } },
    ],
    ["condition_set", { condition_set: ["a", "b", "c"] }],
    ["trial_order", { ...big, trial_order: "shuffled_list" }],
    ["trial_order", { ...big, trial_order: "random" }],
    ["trial_order", { ...big, trial_order: "fixed_sequence" }],
    ["sequence_constraints", { ...big, sequence_constraints: { max_run: 2 } }],
    ["sequence_constraints", { ...big, sequence_constraints: { no_immediate_repeat: true } }],
    ["response_window_ms", { response_window_ms: 800 }],
    ["response_window_ms", { response_window_ms: null }],
    ["response_window_ms", { response_window_ms: { min: 600, max: 900, step: 100 } }],
    ["stimulus_duration_ms", { stimulus_duration_ms: 200 }],
    ["fixation_duration_ms", { fixation_duration_ms: 0 }],
    ["fixation_duration_ms", { fixation_duration_ms: 450 }],
    [
      "fixation_duration_ms",
      { n_test_trials: 24, fixation_duration_ms: { min: 200, max: 500, step: 50 } },
    ],
    ["fixation_duration_ms", { n_test_trials: 24, fixation_duration_ms: { min: 200, max: 300 } }],
    ["iti_ms", { iti_ms: 0 }],
    ["iti_ms", { iti_ms: 650 }],
    ["iti_ms", { n_test_trials: 24, iti_ms: { min: 500, max: 900, step: 100 } }],
    ["feedback_duration_ms", { trial_feedback: "accuracy", feedback_duration_ms: 700 }],
    ["feedback_duration_ms", { trial_feedback: "none", feedback_duration_ms: 700 }],
    ["trial_feedback", { trial_feedback: "accuracy" }],
    ["trial_feedback", { trial_feedback: "none", practice: { trial_feedback: "accuracy" } }],
    ["feedback_condition", { trial_feedback: "accuracy", feedback_condition: "errors_only" }],
    ["feedback_condition", { trial_feedback: "accuracy", feedback_condition: "correct_only" }],
    ["feedback_condition", { trial_feedback: "accuracy", feedback_condition: "all" }],
    ["response_keys", { response_keys: ["d", "k"] }],
    ["response_device", { response_device: "keyboard" }],
    ["response_device", { response_device: "touch" }],
  ];
  for (const [option, options] of cases) {
    it(`${option} ${JSON.stringify(options)}`, () => passes(option, options));
  }
});

describe("shared checks fail when the option is not honoured", () => {
  const cases: [string, MiniOptions, MiniBug][] = [
    ["n_blocks", { n_test_trials: 12, n_blocks: 3 }, "ignore_n_blocks"],
    [
      "condition_proportions",
      { n_test_trials: 24, condition_proportions: { a: 0.25, b: 0.75 } },
      "wrong_proportions",
    ],
    [
      "sequence_constraints",
      { n_test_trials: 24, sequence_constraints: { max_run: 2 } },
      "ignore_max_run",
    ],
    ["response_window_ms", { response_window_ms: 800 }, "never_times_out"],
    [
      "fixation_duration_ms",
      { n_test_trials: 24, fixation_duration_ms: { min: 200, max: 500, step: 50 } },
      "unseeded_jitter",
    ],
    [
      "fixation_duration_ms",
      { n_test_trials: 24, fixation_duration_ms: { min: 200, max: 500, step: 50 } },
      "jitter_off_grid",
    ],
    [
      "feedback_condition",
      { trial_feedback: "accuracy", feedback_condition: "errors_only" },
      "no_feedback_for_errors",
    ],
    ["response_device", { response_device: "touch" }, "wrong_plugin"],
  ];
  for (const [option, options, bug] of cases) {
    it(`${option} catches ${bug}`, () => catches(option, options, bug));
  }
});

describe("data contract", () => {
  it("reports contract entries an adapter does not provide", () => {
    const c = defineContract({ task: "mini-task", fields: { timeout: null } });
    expect(missingContract(sharedChecks.response_window_ms, c)).toEqual(["fields.timeout"]);
    expect(missingContract(sharedChecks.response_window_ms, miniContract)).toEqual([]);
  });

  it("every shared check declares what it needs, and the standard contract provides it", () => {
    for (const [name, check] of Object.entries(sharedChecks)) {
      expect(check.requires.length).toBeGreaterThan(0);
      expect([name, missingContract(check, miniContract)]).toEqual([name, []]);
    }
  });

  it("standard tagging holds for the mini task", async () => {
    const r = await miniHarness().run({ trial_feedback: "accuracy" });
    expectStandardTagging(r, miniContract, "0.0.0");
    expect(rowsOf(r, "test", "response")).toHaveLength(12);
  });

  it("runs are seeded: the same seed gives the same rows", async () => {
    const h = miniHarness();
    const opts: MiniOptions = {
      n_test_trials: 20,
      fixation_duration_ms: { min: 100, max: 900, step: 100 },
    };
    const [a, b, c] = await h.runSeeds(opts, ["x", "x", "y"]);
    const fix = (r: any) => rowsOf(r, "test", "fixation").map((x) => x.duration_ms);
    expect(fix(a)).toEqual(fix(b));
    expect(fix(a)).not.toEqual(fix(c));
  });
});
