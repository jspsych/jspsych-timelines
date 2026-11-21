import { initJsPsych } from "jspsych";

import {
  DEFAULT_OPTIONS,
  EefrtOptions,
  normaliseKey,
  resolveOptions,
  sampleDuration,
  validateOptions,
} from "./options";
import { createTimeline } from ".";

const build = (o: EefrtOptions) => () => createTimeline(initJsPsych(), o);

describe("resolveOptions", () => {
  it("returns the anchor's defaults", () => {
    const o = resolveOptions({});
    expect(o.response_window_ms).toEqual({ choice: 5000, easy: 7000, hard: 21000 });
    expect(o.feedback_duration_ms).toEqual({ completion: 2000, reward: 2000 });
    expect(o.difficulty_levels).toEqual({ easy: 30, hard: 100 });
    expect(o.task_end_rule).toBe("fixed_time");
    expect(o.session_duration_min).toBe(20);
    expect(o.reward_probability).toEqual([0.12, 0.5, 0.88]);
    expect(DEFAULT_OPTIONS.practice).toEqual({});
  });

  it("merges map options key by key and takes a number or null as the choice window", () => {
    expect(resolveOptions({ response_window_ms: { easy: 5000 } }).response_window_ms).toEqual({
      choice: 5000,
      easy: 5000,
      hard: 21000,
    });
    expect(resolveOptions({ response_window_ms: null }).response_window_ms.choice).toBeNull();
    expect(resolveOptions({ response_window_ms: 3000 }).response_window_ms).toEqual({
      choice: 3000,
      easy: 7000,
      hard: 21000,
    });
    expect(resolveOptions({ feedback_duration_ms: 500 }).feedback_duration_ms).toEqual({
      completion: 500,
      reward: 500,
    });
    expect(resolveOptions({ feedback_duration_ms: { reward: 700 } }).feedback_duration_ms).toEqual({
      completion: 2000,
      reward: 700,
    });
    expect(
      resolveOptions({ feedback_duration_ms: { min: 500, max: 900, step: 100 } })
        .feedback_duration_ms.completion
    ).toEqual({
      min: 500,
      max: 900,
      step: 100,
    });
    expect(resolveOptions({ difficulty_levels: { hard: 98 } }).difficulty_levels).toEqual({
      easy: 30,
      hard: 98,
    });
    expect(resolveOptions({ reward_magnitude: { easy: 0.5 } }).reward_magnitude.hard).toEqual({
      min: 1.24,
      max: 4.3,
      n_levels: 8,
    });
  });

  it("practice overrides win over the top level, which wins over the default", () => {
    const user: EefrtOptions = {
      fixation_duration_ms: 400,
      pre_block_countdown_ms: 300,
      practice: { fixation_duration_ms: 100, response_window_ms: { easy: 9000 } },
    };
    const p = resolveOptions(user, "practice");
    expect(p.fixation_duration_ms).toBe(100);
    expect(p.pre_block_countdown_ms).toBe(300);
    expect(p.response_window_ms.easy).toBe(9000);
    const t = resolveOptions(user, "test");
    expect(t.fixation_duration_ms).toBe(400);
    expect(t.response_window_ms.easy).toBe(7000);
  });

  describe("the stop rule", () => {
    it("is inferred from the one number that is given", () => {
      expect(resolveOptions({ n_test_trials: 12 }).task_end_rule).toBe("fixed_trial_count");
      expect(resolveOptions({ session_duration_min: 5 }).task_end_rule).toBe("fixed_time");
      expect(resolveOptions({}).task_end_rule).toBe("fixed_time");
    });
    it("throws when the numbers and the rule disagree, naming both", () => {
      expect(() => resolveOptions({ n_test_trials: 12, session_duration_min: 5 })).toThrow(
        /session_duration_min and n_test_trials/
      );
      expect(() => resolveOptions({ task_end_rule: "fixed_time", n_test_trials: 12 })).toThrow(
        /n_test_trials.*fixed_time/
      );
      expect(() =>
        resolveOptions({ task_end_rule: "fixed_trial_count", session_duration_min: 12 })
      ).toThrow(/session_duration_min.*fixed_trial_count/);
    });
    it("accepts both numbers when the rule says which one counts", () => {
      expect(
        resolveOptions({ task_end_rule: "fixed_trial_count", n_test_trials: 7 }).n_test_trials
      ).toBe(7);
    });
    it("rejects an open-ended session", () => {
      expect(build({ session_duration_min: null })).toThrow(/session_duration_min/);
      expect(build({ task_end_rule: "fixed_time", session_duration_min: 0 })).toThrow(
        /more than 0/
      );
      expect(build({ n_test_trials: 0 })).toThrow(/n_test_trials/);
    });
  });
});

describe("validateOptions", () => {
  it("throws on values that are not implemented, naming the option", () => {
    expect(build({ outcome_valence: "gain_and_loss" })).toThrow(/outcome_valence.*gain_and_loss/);
    expect(build({ outcome_type: "food_portions" })).toThrow(/outcome_type.*food_portions/);
    expect(build({ pretraining: "familiarization" })).toThrow(/pretraining/);
    expect(build({ payout_rule: "fixed_noncontingent_with_deception" })).toThrow(/payout_rule/);
    expect(build({ instruction_demonstration: "examples" })).toThrow(/instruction_demonstration/);
    expect(build({ instruction_format: "video" })).toThrow(/instruction_format/);
    expect(build({ device_eligibility: "hardware_required" })).toThrow(/device_eligibility/);
  });

  it("throws on an effort limit that never ends, naming the option", () => {
    expect(build({ response_window_ms: { hard: null as any } })).toThrow(
      /response_window_ms\.hard/
    );
    expect(build({ response_window_ms: { easy: 0 } })).toThrow(/response_window_ms\.easy/);
    // an untimed choice is fine
    expect(build({ response_window_ms: null })).not.toThrow();
  });

  it("checks the shapes of the typed maps", () => {
    expect(build({ reward_probability: [12, 50] })).toThrow(/reward_probability/);
    expect(build({ reward_probability: [] })).toThrow(/reward_probability/);
    expect(build({ reward_probability: [0] })).toThrow(/reward_probability/);
    expect(build({ reward_magnitude: { hard: { levels: [] } } })).toThrow(/levels/);
    expect(build({ reward_magnitude: { hard: { min: 3, max: 1, n_levels: 4 } } })).toThrow(
      /n_levels/
    );
    expect(build({ reward_magnitude: { hard: { uniform: { min: 3, max: 1 } } } })).toThrow(
      /uniform/
    );
    expect(build({ reward_magnitude: { hard: { foo: 1 } as any } })).toThrow(
      /reward_magnitude\.hard/
    );
    expect(build({ difficulty_levels: { easy: 0 } })).toThrow(/difficulty_levels\.easy/);
    expect(build({ difficulty_levels: { hard: 2.5 } })).toThrow(/difficulty_levels\.hard/);
  });

  it("checks keys and the practice assignments", () => {
    expect(build({ response_keys: ["e"] as any })).toThrow(/response_keys/);
    expect(build({ response_keys: ["e", "E"] })).toThrow(/two different keys/);
    expect(build({ response_keys: ["e", "i"], response_key_mapping: { easy: "I" } })).toThrow(
      /effort key/
    );
    expect(build({ practice_trials: 1, practice_forced_tasks: ["easy", "hard"] })).toThrow(
      /practice_forced_tasks/
    );
    // the default assignments are cut to the number of practice trials
    expect(resolveOptions({ practice_trials: 1 }).practice_forced_tasks).toEqual(["easy"]);
    expect(resolveOptions({ practice_trials: 0 }).practice_forced_tasks).toEqual([]);
    expect(build({ practice_trials: 1 })).not.toThrow();
    expect(build({ practice_trials: 1, practice_forced_tasks: ["hard"] })).not.toThrow();
    expect(build({ practice_forced_tasks: ["medium" as any] })).toThrow(/practice_forced_tasks/);
  });

  it("a fixed sequence cannot be combined with a fresh uniform draw per trial", () => {
    expect(
      build({
        trial_order: "fixed_sequence",
        reward_magnitude: { hard: { uniform: { min: 1, max: 4 } } },
      })
    ).toThrow(/fixed_sequence/);
    expect(
      build({
        trial_order: "shuffled_list",
        reward_magnitude: { hard: { uniform: { min: 1, max: 4 } } },
      })
    ).not.toThrow();
  });

  it("validateOptions also runs on the practice phase", () => {
    expect(() =>
      validateOptions(
        resolveOptions({ practice: { response_window_ms: { easy: -1 } } }, "practice")
      )
    ).toThrow(/response_window_ms\.easy/);
  });
});

describe("helpers", () => {
  it("names the space bar", () => {
    expect(normaliseKey("space")).toBe(" ");
    expect(normaliseKey("Space")).toBe(" ");
    expect(normaliseKey("f")).toBe("f");
  });

  it("samples a jittered duration on its grid, through jsPsych's seeded randomisation", () => {
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("jitter");
    const draws = Array.from({ length: 60 }, () =>
      sampleDuration(jsPsych, { min: 500, max: 900, step: 100 })
    );
    draws.forEach((d) => expect([500, 600, 700, 800, 900]).toContain(d));
    expect(new Set(draws).size).toBeGreaterThan(1);
    expect(sampleDuration(jsPsych, 750)).toBe(750);
    jsPsych.randomization.setSeed("jitter");
    expect(
      Array.from({ length: 60 }, () => sampleDuration(jsPsych, { min: 500, max: 900, step: 100 }))
    ).toEqual(draws);
  });
});
