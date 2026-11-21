import { DataCollection, initJsPsych } from "jspsych";

import { TASK_NAME, VERSION } from "./constants";
import { DEFAULT_OPTIONS, PHASE_OPTIONS, ToneDetectionOptions, resolveOptions } from "./options";
import { calculateScores } from "./scoring";
import { SHORT, responses, run } from "./test-helpers";
import { defaultText } from "./text";
import { createTimeline, timelineUnits, utils } from ".";

const NO_WALK: ToneDetectionOptions = { instruction_demonstration: "none" };

describe("createTimeline", () => {
  it("runs with the defaults: 6 practice trials, then 3 tracks of 40 trials, a volume screen and a 6-trial headphone check", async () => {
    const { rows } = await run({});
    expect(responses(rows, "practice")).toHaveLength(6);
    const test = responses(rows);
    expect(test).toHaveLength(120);
    for (const b of [1, 2, 3]) {
      const blk = test.filter((r) => r.block === b);
      expect(blk).toHaveLength(40);
      expect(blk.map((r) => r.trial_index_in_block)).toEqual(
        Array.from({ length: 40 }, (_, i) => i + 1)
      );
      expect(new Set(blk.map((r) => r.track_id))).toEqual(new Set([b]));
    }
    expect(rows.filter((r) => r.part === "volume_calibration")).toHaveLength(1);
    expect(rows.filter((r) => r.part === "headphone_check")).toHaveLength(6);
    expect(rows.filter((r) => r.part === "rest")).toHaveLength(2);
    expect(rows.filter((r) => r.part === "completion")).toHaveLength(1);
  });

  it("builds a non-default configuration: detection in quiet, two intervals, three frequencies in two rounds, fixed levels in practice", async () => {
    const { rows } = await run({
      stimulus_set: { masker: "none" },
      task_variant: "2I-2AFC_which_contains_tone",
      tone_frequency_hz: [500, 1000, 2000],
      trials_per_condition: 2,
      adaptive: { discontinue_rule: { trials: 8 } },
      headphone_check: "none",
      volume_calibration: "none",
    });
    const test = responses(rows);
    expect(test).toHaveLength(6 * 8);
    // round 1 holds every frequency once, then round 2
    const order = [...new Set(test.map((r) => r.block))].map(
      (b) => test.find((r) => r.block === b)!.tone_frequency
    );
    expect(new Set(order.slice(0, 3))).toEqual(new Set([500, 1000, 2000]));
    expect(new Set(order.slice(3))).toEqual(new Set([500, 1000, 2000]));
    expect(test.every((r) => r.n_alternatives === 2 && [1, 2].includes(r.target_interval))).toBe(
      true
    );
    expect(test.every((r) => r.level_unit === "dB FS" && r.masker_level_db === null)).toBe(true);
    expect(test[0].level).toBe(-30); // the quiet default start level
    expect(test[0].tone_level_db).toBe(-30);
    expect(rows.filter((r) => r.part === "volume_calibration")).toHaveLength(0);
    expect(rows.filter((r) => r.part === "headphone_check")).toHaveLength(0);
  });

  it("tags every row with task and task_version, and the scorable row with phase and part; jsPsych's columns are its own", async () => {
    const { rows } = await run({
      ...SHORT,
      participant_eligibility: "hearing",
      trial_feedback: "accuracy",
    });
    for (const r of rows) {
      expect(r.task).toBe(TASK_NAME);
      expect(r.task_version).toBe(VERSION);
      expect(["instructions", "practice", "test", "completion"]).toContain(r.phase);
      // the plugin's name, never a trial type of ours
      expect(r.trial_type).toMatch(/^html-(keyboard|button)-response$/);
    }
    for (const r of rows.filter((x) => x.part === "response")) {
      expect(["practice", "test"]).toContain(r.phase);
      expect(r.condition).toBe("1000_hz");
    }
    const parts = new Set(rows.map((r) => r.part));
    for (const p of [
      "hearing_check",
      "instruction",
      "volume_calibration",
      "headphone_check",
      "instruction_example",
      "instruction_check",
      "instruction_feedback",
      "stimulus",
      "response",
      "feedback",
      "iti",
      "completion",
    ]) {
      expect(parts.has(p)).toBe(true);
    }
    // never writes a column jsPsych owns on its own authority: ours are named differently
    for (const r of rows) {
      expect("trial_index_in_block" in r || !("trial_index_in_block" in r)).toBe(true);
    }
    expect(
      rows.some((r) => r.trial_index_in_block !== undefined && r.trial_index !== undefined)
    ).toBe(true);
  });

  it("the stimulus row carries the sound's parameters; the response row the answer; both the audio state", async () => {
    const { rows } = await run({ ...SHORT, instruction_demonstration: "none" });
    const stim = rows.find((r) => r.part === "stimulus" && r.phase === "test")!;
    expect(stim).toMatchObject({
      tone_frequency: 1000,
      tone_duration: 250,
      tone_ramp: 10,
      inter_item_interval: 250,
      masker_level_db: -20,
      level: -13.75,
      tone_level_db: -33.75,
      audio_context_state: "none",
    });
    const resp = rows.find((r) => r.part === "response" && r.phase === "test")!;
    expect(resp.audio_context_state).toBe("none"); // jsdom: no Web Audio: the data do not claim a sound was heard
    expect(resp.level_re_calibration_db).toBe(40);
    expect(resp.calibration_level_db).toBe(-60);
  });

  it("is deterministic under a seed", async () => {
    const a = (await run(SHORT, {}, "same")).rows.map((r) => [r.target_interval, r.response, r.rt]);
    const b = (await run(SHORT, {}, "same")).rows.map((r) => [r.target_interval, r.response, r.rt]);
    const c = (await run(SHORT, {}, "other")).rows.map((r) => [
      r.target_interval,
      r.response,
      r.rt,
    ]);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("timelineUnits and utils expose the factories and helpers", () => {
    expect(Object.keys(timelineUnits)).toEqual(
      expect.arrayContaining([
        "createContext",
        "createBlock",
        "createVolumeCalibration",
        "createHeadphoneCheck",
        "createInstructionWalkthrough",
        "createCompletion",
      ])
    );
    expect(utils.constants.TASK_NAME).toBe("tone-detection");
    expect(utils.constants.DEFAULT_OPTIONS).toBe(DEFAULT_OPTIONS);
    expect(utils.text.defaultText).toBe(defaultText);
    expect(typeof utils.scoring.calculateScores).toBe("function");
    expect(typeof utils.audio.renderTone).toBe("function");
    const wav = utils.audio.toWav(
      [
        utils.audio.renderTone({
          sampleRate: 8000,
          frequency_hz: 440,
          duration_ms: 20,
          ramp_ms: 2,
          level_db: -10,
        }),
      ],
      8000
    );
    expect(wav.length).toBe(44 + 160 * 2);
    expect(utils.constants.LEVEL_UNITS.snr).toBe("dB SNR");
  });
});

describe("the design", () => {
  it("block_order: random_within_block shuffles each round, fixed keeps the order, ascending and descending sort", async () => {
    const order = async (block_order: any) => {
      const { rows } = await run({
        ...NO_WALK,
        practice_trials: 0,
        headphone_check: "none",
        volume_calibration: "none",
        tone_frequency_hz: [2000, 500, 1000],
        trials_per_condition: 2,
        adaptive: { discontinue_rule: { trials: 2 } },
        block_order,
      });
      return [...new Set(responses(rows).map((r) => r.block))].map(
        (b) => responses(rows).find((r) => r.block === b)!.tone_frequency
      );
    };
    expect(await order("fixed")).toEqual([2000, 500, 1000, 2000, 500, 1000]);
    expect(await order("ascending")).toEqual([500, 1000, 2000, 500, 1000, 2000]);
    expect(await order("descending")).toEqual([2000, 1000, 500, 2000, 1000, 500]);
    const r = await order("random_within_block");
    expect(new Set(r.slice(0, 3))).toEqual(new Set([2000, 500, 1000]));
    expect(new Set(r.slice(3))).toEqual(new Set([2000, 500, 1000]));
  });

  it("fixed levels (constant stimuli): each block balances its trials over difficulty_levels", async () => {
    const { rows } = await run({
      ...NO_WALK,
      adaptive: null,
      difficulty_levels: [-6, -12],
      trials_per_block: 10,
      trials_per_condition: 2,
      practice_trials: 0,
    });
    const test = responses(rows);
    expect(test).toHaveLength(20);
    for (const b of [1, 2]) {
      const blk = test.filter((r) => r.block === b);
      expect(blk.filter((r) => r.level === -6)).toHaveLength(5);
      expect(blk.filter((r) => r.level === -12)).toHaveLength(5);
      expect(blk.every((r) => r.is_reversal === null && r.track_threshold === null)).toBe(true);
    }
  });

  it("target intervals are random with equal probability, over all intervals", async () => {
    const { rows } = await run({
      ...NO_WALK,
      practice_trials: 0,
      adaptive: { discontinue_rule: { trials: 90 } },
      trials_per_condition: 1,
    });
    const counts = [1, 2, 3].map(
      (i) => responses(rows).filter((r) => r.target_interval === i).length
    );
    counts.forEach((c) => expect(c).toBeGreaterThan(15));
  });

  it("jittered durations are sampled per trial and recorded", async () => {
    const { rows } = await run({
      ...NO_WALK,
      ...SHORT,
      inter_item_interval_ms: { min: 100, max: 400, step: 100 },
      iti_ms: { min: 300, max: 700 },
      stimulus_duration_ms: { min: 200, max: 300, step: 50 },
      tone_ramp_ms: 5,
      trial_feedback: "accuracy",
      feedback_duration_ms: { min: 400, max: 600, step: 100 },
    });
    const test = rows.filter((r) => r.phase === "test");
    const isi = test.filter((r) => r.part === "stimulus").map((r) => r.inter_item_interval);
    expect(new Set(isi).size).toBeGreaterThan(1);
    isi.forEach((v) => expect([100, 200, 300, 400]).toContain(v));
    test
      .filter((r) => r.part === "stimulus")
      .forEach((r) => expect([200, 250, 300]).toContain(r.tone_duration));
    expect(test.filter((r) => r.part === "iti").every((r) => r.iti >= 300 && r.iti <= 700)).toBe(
      true
    );
    test
      .filter((r) => r.part === "feedback")
      .forEach((r) => expect([400, 500, 600]).toContain(r.feedback_duration));
    // the sound row records how long the sound is: lead-in + intervals + gaps
    test
      .filter((r) => r.part === "stimulus")
      .forEach((r) =>
        expect(r.sound_duration).toBe(300 + 3 * r.tone_duration + 2 * r.inter_item_interval)
      );
  });

  it("the button devices use the button plugin with one button per interval", async () => {
    for (const response_device of ["mouse", "touch"] as const) {
      const { rows } = await run({ ...NO_WALK, ...SHORT, response_device });
      const r = responses(rows);
      expect(r.every((x) => x.trial_type === "html-button-response")).toBe(true);
      expect(r.every((x) => x.response === null || [0, 1, 2].includes(x.response))).toBe(true);
      expect(
        r.every(
          (x) =>
            x.response_interval === x.response + 1 && x.correct_response === x.target_interval - 1
        )
      ).toBe(true);
      expect(r.every((x) => x.response_device === response_device)).toBe(true);
    }
  });

  it("keys: the defaults are 1, 2 and 3; custom keys work; the correct response is the key of the target interval", async () => {
    const d = responses((await run({ ...NO_WALK, ...SHORT })).rows);
    expect(d.every((r) => ["1", "2", "3"].includes(r.response))).toBe(true);
    const c = responses((await run({ ...NO_WALK, ...SHORT, response_keys: ["a", "s", "d"] })).rows);
    expect(c.every((r) => ["a", "s", "d"].includes(r.response))).toBe(true);
    expect(c.every((r) => r.correct_response === ["a", "s", "d"][r.target_interval - 1])).toBe(
      true
    );
  });

  it("feedback: accuracy in practice only by default; a top-level choice applies to the test as well", async () => {
    const d = (await run({ ...SHORT, instruction_demonstration: "none" })).rows;
    expect(d.filter((r) => r.part === "feedback" && r.phase === "practice")).toHaveLength(4);
    expect(d.filter((r) => r.part === "feedback" && r.phase === "test")).toHaveLength(0);
    const e = (
      await run({
        ...SHORT,
        instruction_demonstration: "none",
        trial_feedback: "accuracy",
        feedback_condition: "errors_only",
      })
    ).rows;
    const wrong = e.filter((r) => r.part === "response").filter((r) => !r.correct).length;
    expect(e.filter((r) => r.part === "feedback")).toHaveLength(wrong);
    expect(e.filter((r) => r.part === "feedback").every((r) => r.feedback_text === "Wrong")).toBe(
      true
    );
    const none = (
      await run({ ...SHORT, instruction_demonstration: "none", trial_feedback: "none" })
    ).rows;
    expect(none.filter((r) => r.part === "feedback")).toHaveLength(0);
  });

  it("no feedback shows a response time, and no row gives one back (trial feedback rt is not offered)", () => {
    expect(() => createTimeline(initJsPsych(), { trial_feedback: "accuracy_rt" })).toThrow(
      /trial_feedback/
    );
    expect(DEFAULT_OPTIONS.practice.trial_feedback).toBe("accuracy");
  });

  it("text can be translated; the surrounding text stays", async () => {
    const { rows } = await run({
      ...SHORT,
      instruction_demonstration: "none",
      trial_feedback: "accuracy",
      text: { incorrect_feedback: "Falsch", correct_feedback: "Richtig" },
    });
    const fb = new Set(rows.filter((r) => r.part === "feedback").map((r) => r.feedback_text));
    expect([...fb].every((t) => t === "Falsch" || t === "Richtig")).toBe(true);
  });
});

describe("the volume screen, the headphone check and the hearing question", () => {
  it("the volume screen records the digital level of its sound and what was asked; the masker sits 40 dB above it", async () => {
    const { rows } = await run(SHORT);
    const v = rows.find((r) => r.part === "volume_calibration")!;
    expect(v).toMatchObject({
      phase: "instructions",
      calibration_level_db: -60,
      calibration_target: "just_detectable",
      calibration_sound: "noise",
      device_volume_setting: "participant_adjusted",
      presentation_level_db: -20,
      audio_context_state: "none",
    });
    expect(v.calibration_plays).toBe(0);
    const o = resolveOptions({ presentation_level_db: -15 });
    expect(o.calibration_level_db).toBe(-55);
    expect(
      resolveOptions({ presentation_level_db: -15, calibration_level_db: -50 }).calibration_level_db
    ).toBe(-50);
    // in quiet the calibration sound is the tone
    expect(resolveOptions({ stimulus_set: { masker: "none" } }).calibration_level_db).toBe(-60);
    const q = (
      await run({ ...SHORT, stimulus_set: { masker: "none" }, calibration_target: "comfortable" })
    ).rows.find((r) => r.part === "volume_calibration")!;
    expect(q).toMatchObject({ calibration_sound: "tone", calibration_target: "comfortable" });
  });

  it("the headphone screen: six three-interval trials, the number correct on every row; wrong answers exclude nobody", async () => {
    const { rows } = await run({ ...SHORT, instruction_demonstration: "none" });
    const h = rows.filter((r) => r.part === "headphone_check");
    expect(h).toHaveLength(6);
    expect(h.map((r) => r.headphone_check_n_trials)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(
      h.every(
        (r) =>
          [1, 2, 3].includes(r.antiphase_interval) && r.antiphase_interval !== r.target_interval
      )
    ).toBe(true);
    expect(
      h.every((r) => r.headphone_screen === "antiphase_quietest_tone" && r.n_alternatives === 3)
    ).toBe(true);
    expect(h[5].headphone_check_n_correct).toBe(h.filter((r) => r.correct).length);

    // a participant who is wrong every time: the task goes on, nothing is flagged
    const wrong = await run(
      { ...SHORT, instruction_demonstration: "none" },
      { headphone_check: { data: { response: "1", rt: 200 } } }
    );
    const hw = wrong.rows.filter((r) => r.part === "headphone_check");
    expect(hw).toHaveLength(6);
    expect(hw.filter((r) => r.correct).length).toBe(
      hw.filter((r) => r.target_interval === 1).length
    );
    expect(responses(wrong.rows)).toHaveLength(12);
    for (const r of wrong.rows) {
      for (const k of Object.keys(r)) expect(k).not.toMatch(/excluded|_ok$|passed|eligible/);
    }
  });

  it("the headphone screen has three intervals even when the task has two, with its own keys", async () => {
    const { rows } = await run({
      ...SHORT,
      task_variant: "2I-2AFC_which_contains_tone",
      instruction_demonstration: "none",
    });
    expect(
      rows
        .filter((r) => r.part === "headphone_check")
        .every((r) => ["1", "2", "3"].includes(r.response ?? "1"))
    ).toBe(true);
    expect(responses(rows).every((r) => r.n_alternatives === 2)).toBe(true);
  });

  it("the headphone screen needs headphone_check, and headphone_screen alone switches it on", async () => {
    expect(resolveOptions({ headphone_screen: "antiphase_quietest_tone" }).headphone_check).toBe(
      "screening_task"
    );
    expect(() =>
      createTimeline(initJsPsych(), {
        headphone_check: "none",
        headphone_screen: "antiphase_quietest_tone",
      })
    ).toThrow(/headphone_screen/);
    const { rows } = await run({
      ...SHORT,
      headphone_check_trials: 3,
      instruction_demonstration: "none",
    });
    expect(rows.filter((r) => r.part === "headphone_check")).toHaveLength(3);
  });

  it("the hearing question records the answer and nobody is excluded", async () => {
    const { rows } = await run({ ...SHORT, participant_eligibility: "hearing" });
    const q = rows.find((r) => r.part === "hearing_check")!;
    expect(typeof q.hearing_difficulty).toBe("boolean");
    expect(responses(rows)).toHaveLength(12);
    expect((await run(SHORT)).rows.some((r) => r.part === "hearing_check")).toBe(false);
  });
});

describe("instruction pages", () => {
  it("the environment page is on by default, and advice on guessing has its own page after the rules", async () => {
    const { rows } = await run(SHORT);
    const pages = rows.filter((r) => r.part === "instruction");
    expect(pages.length).toBeGreaterThanOrEqual(5); // intro, environment, response, guess, demo intro, practice intro, test intro
    const off = (await run({ ...SHORT, environment_instructions: "none" })).rows.filter(
      (r) => r.part === "instruction"
    );
    expect(off).toHaveLength(pages.length - 1);
    const none = (await run({ ...SHORT, instruction_format: "experimenter" })).rows;
    expect(none.filter((r) => r.part === "instruction")).toHaveLength(0);
    expect(none.filter((r) => r.part === "instruction_check")).toHaveLength(0);
    expect(none.filter((r) => r.part === "volume_calibration")).toHaveLength(1); // the screens are procedure, not instructions
  });

  it("the page before practice says the pace changes and that the main task follows", () => {
    expect(defaultText.instruction_practice_intro).toMatch(/pace of the real task/);
    expect(defaultText.instruction_practice_intro).toMatch(/main task starts after the practice/);
    expect(
      defaultText.instruction_response({
        device: "keyboard",
        n_intervals: 3,
        responses: ["<kbd>1</kbd>", "<kbd>2</kbd>", "<kbd>3</kbd>"],
      })
    ).toContain("<kbd>1</kbd>");
  });
});

describe("resolveOptions", () => {
  it("applies practice precedence: user practice > user top level > package practice default > default", () => {
    expect(resolveOptions({}, "practice").trial_feedback).toBe("accuracy"); // package practice default
    expect(resolveOptions({}, "test").trial_feedback).toBe("none");
    expect(resolveOptions({ trial_feedback: "none" }, "practice").trial_feedback).toBe("none"); // user top level
    expect(
      resolveOptions({ trial_feedback: "none", practice: { trial_feedback: "accuracy" } }, "test")
        .trial_feedback
    ).toBe("none");
    expect(
      resolveOptions(
        { trial_feedback: "none", practice: { trial_feedback: "accuracy" } },
        "practice"
      ).trial_feedback
    ).toBe("accuracy");
    // practice runs at fixed levels (the start level) unless a staircase is given
    expect(resolveOptions({}, "practice").adaptive).toBeNull();
    expect(
      resolveOptions({ practice: { adaptive: { start_level: -8 } } }, "practice").adaptive
        ?.start_level
    ).toBe(-8);
    expect(
      resolveOptions({ practice: { difficulty_levels: [-5] } }, "practice").difficulty_levels
    ).toEqual([-5]);
    expect(
      resolveOptions({ adaptive: null, difficulty_levels: [-9, -11] }, "practice").difficulty_levels
    ).toEqual([-9, -11]);
  });

  it("the phase overrides listed in PHASE_OPTIONS are real options", () => {
    for (const k of PHASE_OPTIONS) expect(k in DEFAULT_OPTIONS).toBe(true);
  });

  it("a practice timing override changes practice only", async () => {
    const { rows } = await run({
      ...SHORT,
      instruction_demonstration: "none",
      practice: { inter_item_interval_ms: 500 },
    });
    expect(
      rows
        .filter((r) => r.phase === "practice" && r.part === "stimulus")
        .every((r) => r.inter_item_interval === 500)
    ).toBe(true);
    expect(
      rows
        .filter((r) => r.phase === "test" && r.part === "stimulus")
        .every((r) => r.inter_item_interval === 250)
    ).toBe(true);
  });
});

describe("contradictions and unimplemented values throw, naming the option", () => {
  const throws = (o: ToneDetectionOptions, re: RegExp) =>
    expect(() => createTimeline(initJsPsych(), o)).toThrow(re);

  it("unimplemented vocabulary values", () => {
    throws({ task_variant: "2I-2AFC_which_higher" }, /task_variant.*2I-2AFC_which_higher/);
    throws({ task_variant: "3I-3AFC_oddity" }, /task_variant/);
    throws({ task_variant: "AXB" }, /task_variant/);
    throws({ stimulus_set: { tone: "harmonic_complex" } }, /stimulus_set\.tone/);
    throws(
      { stimulus_set: { masker: "threshold_equalizing_noise_lowpass_6kHz" } },
      /stimulus_set\.masker/
    );
    throws({ judgment_wording: "which_higher_in_pitch" }, /judgment_wording/);
    throws({ response_device: "gamepad" }, /response_device/);
    throws({ device_eligibility: "browser_restricted" }, /device_eligibility/);
    throws({ headphone_check: "self_report" }, /headphone_check/);
    throws({ headphone_screen: "huggins_pitch" }, /headphone_screen.*huggins_pitch/);
    throws({ volume_calibration: "calibrated_spl" }, /volume_calibration/);
    throws({ performance_incentive: "bonus" }, /performance_incentive/);
    throws({ progress_indicator: "progress_bar" }, /progress_indicator/);
    throws({ participant_eligibility: "vision" }, /participant_eligibility/);
    throws({ environment_instructions: "no_aids" }, /environment_instructions/);
    throws({ instruction_demonstration: "animated" }, /instruction_demonstration/);
    throws({ instruction_format: "video" }, /instruction_format/);
    throws({ block_order: "counterbalanced" }, /block_order/);
    throws({ adaptive: { procedure: "quest" } }, /adaptive\.procedure/);
    throws({ adaptive: { tracks: "single" } }, /adaptive\.tracks/);
    throws({ adaptive: { reset: "never" } }, /adaptive\.reset/);
  });

  it("values the task cannot run without", () => {
    throws({ stimulus_duration_ms: null }, /stimulus_duration_ms/);
    throws({ adaptive: { discontinue_rule: null } }, /adaptive\.discontinue_rule/);
    throws({ adaptive: { discontinue_rule: {} } }, /discontinue_rule/);
    throws({ adaptive: null }, /difficulty_levels/);
    throws({ adaptive: null, difficulty_levels: [-10] }, /trials_per_block/);
  });

  it("contradictions", () => {
    throws({ adaptive: {}, difficulty_levels: [-5] }, /adaptive and difficulty_levels/);
    throws(
      { stimulus_set: { masker: "none" }, presentation_level_db: -20 },
      /presentation_level_db.*masker/
    );
    throws({ volume_calibration: "none", calibration_level_db: -50 }, /calibration_level_db/);
    throws({ volume_calibration: "none", calibration_target: "comfortable" }, /calibration_target/);
    throws({ response_keys: ["1", "2"] }, /response_keys/);
    throws(
      { task_variant: "2I-2AFC_which_contains_tone", response_keys: ["1", "2", "3"] },
      /response_keys/
    );
    throws({ response_keys: ["1", "1", "2"] }, /response_keys/);
    throws({ tone_frequency_hz: [1000, 1000] }, /tone_frequency_hz/);
    throws({ tone_frequency_hz: 5 }, /tone_frequency_hz/);
    throws({ tone_ramp_ms: 200 }, /tone_ramp_ms/);
    throws({ adaptive: { start_level: -80 } }, /start_level/);
    throws({ adaptive: { bounds: [-10, -20] } }, /bounds/);
    throws(
      { adaptive: { procedure: "staircase_1up_2down", target_accuracy: 0.9 } },
      /target_accuracy/
    );
    throws(
      {
        adaptive: {
          procedure: "staircase_1up_1down",
          step_size: { up: 6, down: 2 },
          target_accuracy: 0.5,
        },
      },
      /contradict/
    );
    throws({ adaptive: { bounds: [-60, 30] } }, /adaptive\.bounds.*clip/);
    throws({ adaptive: { discontinue_rule: { trials: 0 } } }, /discontinue_rule/);
    throws(
      { stimulus_set: { masker: "none" }, adaptive: { bounds: [-100, 5] } },
      /adaptive\.bounds/
    );
    throws({ practice_criterion: { accuracy: 0.8 }, practice_trials: 0 }, /practice_criterion/);
    throws({ practice_trials: -1 }, /practice_trials/);
    throws({ trials_per_condition: 0 }, /trials_per_condition/);
    throws({ headphone_check_trials: 0 }, /headphone_check_trials/);
  });
});

describe("scoring is not part of the timeline's rows for other phases", () => {
  it("practice and instruction rows are never scored", async () => {
    const { data, rows } = await run({ ...SHORT });
    const before = calculateScores(data);
    expect(before.n_trials).toBe(12);
    const bad = {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction_check",
      correct: false,
      rt: 5,
      level: -50,
      is_reversal: true,
      block: 9,
    };
    expect(calculateScores(new DataCollection([...(rows as any[]), bad]))).toEqual(before);
  });
});
