import * as fs from "fs";
import * as path from "path";

import {
  clickTarget,
  flushPromises,
  pressKey,
  simulateTimeline,
  startTimeline,
} from "@jspsych/test-utils";
import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { version } from "../package.json";
import { DEFAULT_OPTIONS, FlankerOptions, resolveOptions, validateOptions } from "./options";
import { allocateCounts, buildTrialSpecs } from "./sequence";
import { createTimeline, timelineUnits, utils } from ".";

async function simulate(
  jsPsych: JsPsych,
  options: FlankerOptions,
  sim: Record<string, any> = { default: { data: { rt: 400 } } }
) {
  const { timeline } = createTimeline(jsPsych, options);
  const { getData, expectFinished } = await simulateTimeline(timeline, "data-only", sim, jsPsych);
  await expectFinished();
  return getData().values() as any[];
}

const row = (o: Record<string, unknown>) => ({
  task: "flanker",
  task_version: version,
  phase: "test",
  part: "response",
  ...o,
});

function allTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => allTrials(t, out));
  else if (tl?.timeline) allTrials(tl.timeline, out);
  else if (tl?.type) out.push(tl);
  return out;
}

describe("flanker", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("unit");
  });

  describe("createTimeline", () => {
    it("builds with default options and runs the PEBL defaults: 8 practice and 160 test trials", async () => {
      const rows = await simulate(jsPsych, {});
      const count = (phase: string, part: string) =>
        rows.filter((r) => r.phase === phase && r.part === part).length;
      expect(count("practice", "response")).toBe(8);
      expect(count("test", "response")).toBe(160);
      // PEBL: feedback in practice only
      expect(count("practice", "feedback")).toBe(8);
      expect(count("test", "feedback")).toBe(0);
      expect(count("test", "fixation")).toBe(160);
      expect(count("test", "iti")).toBe(160);
      expect(rows.filter((r) => r.part === "completion")).toHaveLength(1);
    });

    it("builds a non-default configuration", async () => {
      const rows = await simulate(jsPsych, {
        n_test_trials: 24,
        n_blocks: 3,
        practice_trials: 0,
        condition_set: ["congruent", "incongruent"],
        rest_breaks: "self_paced",
        block_feedback: "accuracy",
        trial_feedback: "accuracy",
        feedback_condition: "errors_only",
        instruction_format: "experimenter",
      });
      const test = rows.filter((r) => r.phase === "test" && r.part === "response");
      expect(test).toHaveLength(24);
      expect(rows.filter((r) => r.phase === "practice")).toHaveLength(0);
      expect(rows.filter((r) => r.part === "instruction")).toHaveLength(0);
      expect(rows.filter((r) => r.part === "rest")).toHaveLength(2);
      expect(rows.filter((r) => r.part === "block_feedback")).toHaveLength(3);
      expect(rows.filter((r) => r.part === "feedback")).toHaveLength(
        test.filter((r) => !r.correct).length
      );
    });

    it("tags every row with task and task_version, and every trial with the scoped class", async () => {
      const options: FlankerOptions = {
        n_test_trials: 8,
        practice_trials: 4,
        cue_target_interval_ms: 500,
        stimulus_set: { cue: "circles" },
        soa_ms: -100,
        attention_checks: "instructed_items",
        device_eligibility: "computer_only",
        block_feedback: "rt",
        trial_feedback: "accuracy",
      };
      const rows = await simulate(jsPsych, options);
      rows.forEach((r) => {
        expect(r.task).toBe("flanker");
        expect(r.task_version).toBe(version);
        expect(["instructions", "practice", "test", "completion"]).toContain(r.phase);
      });
      expect(utils.constants.VERSION).toBe(version);
      const trials = allTrials(createTimeline(initJsPsych(), options).timeline);
      expect(trials.length).toBeGreaterThan(20);
      trials.forEach((t) => expect(t.css_classes).toEqual(["jspsych-timelines-flanker"]));
    });

    it("display trials use the keyboard plugin with NO_KEYS for every response device (§10)", () => {
      for (const response_device of ["keyboard", "touch"] as const) {
        const trials = allTrials(createTimeline(jsPsych, { response_device }).timeline);
        for (const part of ["fixation", "iti"]) {
          const t = trials.find((x) => x.data.part === part);
          expect(t.choices).toBe("NO_KEYS");
          expect(t.button_html).toBeUndefined();
          expect(typeof t.trial_duration).toBe("number");
        }
      }
    });

    it("paints the task colours on the whole display, not a box", () => {
      const trials = allTrials(
        createTimeline(jsPsych, { stimulus_color: "white on black" }).timeline
      );
      const fixation = trials.find((t) => t.data.part === "fixation");
      expect(fixation.stimulus).toContain(
        ".jspsych-display-element:has(.jspsych-timelines-flanker){background:black;color:white;}"
      );
      expect(fixation.stimulus).not.toMatch(/stage" style="[^"]*background/);
      expect(() => createTimeline(jsPsych, { stimulus_color: "red;} body{x on black" })).toThrow();
    });

    it("uses translated text", async () => {
      const rows = await simulate(jsPsych, {
        n_test_trials: 4,
        practice_trials: 0,
        text: { instruction_intro_arrows: "<p>Hola</p>", continue_button: "Continuar" },
      });
      expect(rows.find((r) => r.part === "instruction").stimulus).toContain("Hola");
    });
  });

  describe("real run (plugin trial code, not simulation)", () => {
    const base: FlankerOptions = {
      instruction_format: "experimenter",
      practice_trials: 0,
      n_test_trials: 2,
      fixation_duration_ms: 0,
      iti_ms: 0,
      condition_set: ["congruent", "incongruent"],
    };

    it("renders the array, takes a key press and scores it", async () => {
      const { timeline } = createTimeline(jsPsych, base);
      const { displayElement, getData, expectFinished } = await startTimeline(timeline, jsPsych);
      for (let i = 0; i < 2; i++) {
        expect(displayElement.querySelector(".jspsych-timelines-flanker-array")).not.toBeNull();
        expect(displayElement.querySelectorAll(".jspsych-timelines-flanker-item")).toHaveLength(5);
        expect(displayElement.querySelector(".jspsych-btn")).toBeNull();
        const key = allTrials(timeline).filter((t) => t.data.part === "response")[i].data
          .correct_response;
        await pressKey(key);
      }
      expect(displayElement.textContent).toContain("Task Complete");
      const rows = getData().filter({ part: "response" }).values() as any[];
      expect(rows.map((r) => r.correct)).toEqual([true, true]);
      expect(rows.every((r) => r.timeout === false && typeof r.rt === "number")).toBe(true);
      expect(displayElement.textContent).toContain("100.0%");
      await clickTarget(displayElement.querySelector("button")!);
      await expectFinished();
    });

    it("touch: no buttons on display screens, response buttons on the array", async () => {
      jest.useFakeTimers();
      const { timeline } = createTimeline(jsPsych, {
        ...base,
        response_device: "touch",
        fixation_duration_ms: 500,
      });
      const { displayElement } = await startTimeline(timeline, jsPsych);
      expect(displayElement.querySelector(".jspsych-timelines-flanker-stage")).not.toBeNull();
      expect(displayElement.querySelectorAll(".jspsych-btn")).toHaveLength(0);
      jest.advanceTimersByTime(600);
      await flushPromises();
      jest.useRealTimers();
      expect(displayElement.querySelectorAll(".jspsych-btn")).toHaveLength(2);
    });

    it("times out when no response arrives within the window", async () => {
      jest.useFakeTimers();
      const { timeline } = createTimeline(jsPsych, {
        ...base,
        n_test_trials: 1,
        response_window_ms: 300,
      });
      const { getData } = await startTimeline(timeline, jsPsych);
      jest.advanceTimersByTime(400);
      await flushPromises();
      jest.useRealTimers();
      const rows = getData().filter({ part: "response" }).values() as any[];
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ response: null, timeout: true, correct: false });
    });
  });

  describe("options", () => {
    it("has a default for every option and the documented practice override", () => {
      expect(DEFAULT_OPTIONS.trial_feedback).toBe("none");
      expect(DEFAULT_OPTIONS.practice).toEqual({ trial_feedback: "accuracy_rt" });
      expect(DEFAULT_OPTIONS.response_window_ms).toBe(800);
      expect(DEFAULT_OPTIONS.n_blocks).toBe(1);
      expect(utils.constants.DEFAULT_OPTIONS).toBe(DEFAULT_OPTIONS);
    });

    it("practice overrides win; the default practice feedback yields to the user's top-level value", () => {
      expect(resolveOptions({}, "practice").trial_feedback).toBe("accuracy_rt");
      expect(resolveOptions({}, "test").trial_feedback).toBe("none");
      expect(resolveOptions({ trial_feedback: "none" }, "practice").trial_feedback).toBe("none");
      expect(resolveOptions({ trial_feedback: "accuracy" }, "practice").trial_feedback).toBe(
        "accuracy"
      );
      expect(
        resolveOptions(
          { trial_feedback: "accuracy", practice: { trial_feedback: "rt" } },
          "practice"
        ).trial_feedback
      ).toBe("rt");
      expect(
        resolveOptions({ practice: { response_window_ms: null } }, "practice").response_window_ms
      ).toBeNull();
      expect(
        resolveOptions({ practice: { response_window_ms: null } }, "test").response_window_ms
      ).toBe(800);
    });

    it("merges map options key by key", () => {
      const o = resolveOptions({
        stimulus_set: { cue: "circles" },
        stimulus_layout: { orientation: "vertical" },
      });
      expect(o.stimulus_set.target).toBe("arrows");
      expect(o.stimulus_set.flanker).toEqual({ per_side: 2 });
      expect(o.stimulus_set.cue).toBe("circles");
      expect(o.stimulus_layout.flanker_spacing).toEqual({ gap: 2, unit: "px" });
      expect(o.stimulus_layout.orientation).toBe("vertical");
    });

    it("reconciles condition_set and condition_proportions", () => {
      const fromSet = resolveOptions({ condition_set: ["congruent", "incongruent"] });
      expect(fromSet.condition_proportions).toEqual({ congruent: 1, incongruent: 1 });
      const fromProps = resolveOptions({
        condition_proportions: { congruent: 0.75, incongruent: 0.25 },
      });
      expect(fromProps.condition_set).toEqual(["congruent", "incongruent"]);
      expect(() =>
        resolveOptions({
          condition_set: ["congruent"],
          condition_proportions: { congruent: 0.5, incongruent: 0.5 },
        })
      ).toThrow(/different trial types/);
      // neutral covers its forms
      expect(() =>
        resolveOptions({
          condition_set: ["congruent", "incongruent", "neutral"],
          condition_proportions: {
            congruent: 0.25,
            incongruent: 0.25,
            neutral_dash: 0.25,
            neutral_empty: 0.25,
          },
        })
      ).not.toThrow();
    });

    it("throws on vocabulary values the package does not implement", () => {
      const bad: FlankerOptions[] = [
        { concurrent_task: "interleaved_trials" },
        { response_device: "microphone" },
        { attention_checks: "catch_trials" },
        { device_eligibility: "hardware_required" },
        { rest_breaks: "fixed_interval" },
        { screen_calibration: "self_report" },
        { block_feedback: "points" },
        { trial_feedback: "reward_outcome" },
        { instruction_format: "video" },
        { response_mapping_counterbalancing: "counterbalanced" },
      ];
      bad.forEach((o) => expect(() => createTimeline(jsPsych, o)).toThrow(/not implemented/));
    });

    it("throws on contradictory settings", () => {
      expect(() => createTimeline(jsPsych, { response_keys: ["a"] })).toThrow(/two keys/);
      expect(() =>
        createTimeline(jsPsych, { condition_set: ["congruent", "nogo"], response_window_ms: null })
      ).toThrow(/nogo/);
      expect(() => createTimeline(jsPsych, { cue_target_interval_ms: 500 })).toThrow(/cue/);
      expect(() => createTimeline(jsPsych, { stimulus_set: { cue: "circles" } })).toThrow(/cue/);
      expect(() => createTimeline(jsPsych, { targets_per_response: 2 })).toThrow(/letters/);
      expect(() =>
        createTimeline(jsPsych, { device_eligibility: "computer_only", response_device: "touch" })
      ).toThrow();
      expect(() => validateOptions(resolveOptions({ n_blocks: 0 }))).toThrow(/n_blocks/);
    });
  });

  describe("sequence", () => {
    it("allocates exact counts by largest remainder and normalises proportions", () => {
      expect(allocateCounts([0.25, 0.25, 0.25, 0.25], 160)).toEqual([40, 40, 40, 40]);
      expect(allocateCounts([0.33, 0.33, 0.33], 10)).toEqual([4, 3, 3]);
      expect(allocateCounts([1, 1], 5)).toEqual([3, 2]);
      expect(allocateCounts([0.75, 0.25], 7)).toEqual([5, 2]);
      expect(allocateCounts([0.5, 0.5], 0)).toEqual([0, 0]);
      expect(() => allocateCounts([0, 0], 4)).toThrow();
    });

    it("hits n_test_trials exactly across blocks, with exact proportions in each block", async () => {
      const rows = await simulate(jsPsych, {
        n_test_trials: 101,
        n_blocks: 4,
        condition_set: ["congruent", "incongruent"],
        practice_trials: 0,
        fixation_duration_ms: 0,
        iti_ms: 0,
      });
      const test = rows.filter((r) => r.part === "response");
      expect(test).toHaveLength(101);
      [26, 25, 25, 25].forEach((n, i) => {
        const b = test.filter((r) => r.block === i + 1);
        expect(b).toHaveLength(n);
        const c = b.filter((r) => r.congruency === "congruent").length;
        expect([Math.floor(n / 2), Math.ceil(n / 2)]).toContain(c);
      });
    });

    it("balances target direction within each condition", () => {
      const o = resolveOptions({ condition_set: ["congruent", "incongruent"], n_test_trials: 40 });
      const specs = buildTrialSpecs({ jsPsych, o }, 40);
      for (const cond of ["congruent", "incongruent"]) {
        const g = specs.filter((s) => s.flanker_condition === cond);
        expect(g.filter((s) => s.group === 0)).toHaveLength(g.length / 2);
      }
    });

    it("congruent flankers equal the target; incongruent ones point the other way; neutral ones are neutral", () => {
      const o = resolveOptions({
        n_test_trials: 80,
        condition_set: ["congruent", "incongruent", "neutral_dash", "neutral_empty"],
      });
      buildTrialSpecs({ jsPsych, o }, 80).forEach((s) => {
        if (s.congruency === "congruent") expect(s.flanker).toBe(s.target);
        if (s.congruency === "incongruent")
          expect(s.flanker).toBe(s.target === "left" ? "right" : "left");
        if (s.flanker_condition === "neutral_dash") expect(s.flanker).toBe("dash");
        if (s.flanker_condition === "neutral_empty") expect(s.flanker).toBe("blank");
      });
    });

    it("letters: incongruent flankers come from the other response group", () => {
      const o = resolveOptions({
        stimulus_set: {
          target: {
            letters: [
              ["X", "C"],
              ["V", "B"],
            ],
          },
        },
        targets_per_response: 2,
        condition_set: ["congruent", "incongruent"],
      });
      buildTrialSpecs({ jsPsych, o }, 40).forEach((s) => {
        const groups = [
          ["X", "C"],
          ["V", "B"],
        ];
        expect(groups[s.group]).toContain(s.target);
        if (s.congruency === "incongruent")
          expect(groups[s.group === 0 ? 1 : 0]).toContain(s.flanker);
        else expect(s.flanker).toBe(s.target);
      });
    });

    it("fixed_sequence cycles through the conditions without shuffling", () => {
      const o = resolveOptions({
        condition_set: ["congruent", "incongruent"],
        trial_order: "fixed_sequence",
      });
      const seq = buildTrialSpecs({ jsPsych, o }, 6).map((s) => s.flanker_condition);
      expect(seq).toEqual([
        "congruent",
        "incongruent",
        "congruent",
        "incongruent",
        "congruent",
        "incongruent",
      ]);
    });

    it("random order draws conditions independently (proportions only approximate)", () => {
      const o = resolveOptions({
        condition_set: ["congruent", "incongruent"],
        trial_order: "random",
      });
      const specs = buildTrialSpecs({ jsPsych, o }, 200);
      const c = specs.filter((s) => s.congruency === "congruent").length;
      expect(c).toBeGreaterThan(60);
      expect(c).toBeLessThan(140);
    });

    it("jittered fixation draws from the grid and the seed makes it reproducible", () => {
      const o = resolveOptions({ fixation_duration_ms: { min: 500, max: 950, step: 50 } });
      const a = buildTrialSpecs({ jsPsych, o }, 30).map((s) => s.fixation_ms);
      a.forEach((v) => expect((v - 500) % 50).toBe(0));
      const j2 = initJsPsych();
      j2.randomization.setSeed("unit");
      const b = buildTrialSpecs({ jsPsych: j2, o }, 30).map((s) => s.fixation_ms);
      expect(b).toEqual(a);
    });

    it("never calls Math.random", () => {
      const dir = __dirname;
      for (const f of fs
        .readdirSync(dir)
        .filter((x) => x.endsWith(".ts") && !x.endsWith(".spec.ts"))) {
        expect(fs.readFileSync(path.join(dir, f), "utf8")).not.toMatch(/Math\.random/);
      }
    });
  });

  describe("response trial", () => {
    const first = (opts: FlankerOptions) =>
      allTrials(createTimeline(jsPsych, opts).timeline).find((t) => t.data.part === "response");

    it("scores correct, incorrect, timeout and nogo", () => {
      const t = first({ practice_trials: 0 });
      const d: any = { response: t.data.correct_response };
      t.on_finish(d);
      expect(d).toMatchObject({ correct: true, timeout: false });
      const wrong: any = { response: t.data.correct_response === "z" ? "/" : "z" };
      t.on_finish(wrong);
      expect(wrong).toMatchObject({ correct: false, timeout: false });
      const miss: any = { response: null };
      t.on_finish(miss);
      expect(miss).toMatchObject({ correct: false, timeout: true });

      const nogoTl = createTimeline(jsPsych, {
        condition_set: ["nogo"],
        n_test_trials: 2,
        practice_trials: 0,
      });
      const n = allTrials(nogoTl.timeline).find((x) => x.data.part === "response");
      expect(n.data.correct_response).toBeNull();
      const held: any = { response: null };
      n.on_finish(held);
      expect(held).toMatchObject({ correct: true, timeout: true });
      const pressed: any = { response: "z" };
      n.on_finish(pressed);
      expect(pressed.correct).toBe(false);
    });

    it("maps responses to keys (keyboard) or button indices (touch)", () => {
      const kb = first({ response_keys: ["x", "."], practice_trials: 0 });
      expect(kb.choices).toEqual(["x", "."]);
      expect(["x", "."]).toContain(kb.data.correct_response);
      const tc = first({ response_device: "touch", practice_trials: 0 });
      expect([0, 1]).toContain(tc.data.correct_response);
      expect(tc.choices).toEqual(["Left", "Right"]);
    });
  });

  describe("utils.scoring", () => {
    it("computes scores from hand-built data", () => {
      const rows = [
        row({ congruency: "congruent", correct: true, timeout: false, rt: 400 }),
        row({ congruency: "congruent", correct: true, timeout: false, rt: 440 }),
        row({ congruency: "incongruent", correct: true, timeout: false, rt: 500 }),
        row({ congruency: "incongruent", correct: false, timeout: false, rt: 450 }),
        row({ congruency: "neutral", correct: true, timeout: false, rt: 430 }),
        row({ congruency: "neutral", correct: false, timeout: true, rt: null }),
        row({ congruency: "nogo", correct: true, timeout: true, rt: null }),
        row({
          phase: "practice",
          congruency: "congruent",
          correct: false,
          timeout: false,
          rt: 999,
        }),
        {
          task: "other",
          phase: "test",
          part: "response",
          congruency: "congruent",
          correct: false,
          rt: 1,
        },
      ];
      const s = utils.scoring.calculateScores(new DataCollection(rows));
      expect(s.n_trials).toBe(7);
      expect(s.n_correct).toBe(5);
      expect(s.n_timeouts).toBe(2);
      expect(s.accuracy).toBeCloseTo(5 / 7);
      expect(s.congruent_rt).toBe(420);
      expect(s.incongruent_rt).toBe(500);
      expect(s.neutral_rt).toBe(430);
      expect(s.mean_rt).toBeCloseTo((400 + 440 + 500 + 430) / 4);
      expect(s.flanker_effect_rt).toBe(80);
      expect(s.congruent_accuracy).toBe(1);
      expect(s.incongruent_accuracy).toBe(0.5);
      expect(s.flanker_effect_errors).toBe(0.5);
      expect(s.neutral_accuracy).toBe(0.5);
      expect(s.nogo_accuracy).toBe(1);
      expect(utils.scoring.getSummary(new DataCollection(rows))).toMatchObject({
        task: "flanker",
        version,
      });
    });

    it("returns 0 for counts and null for everything else on empty data", () => {
      const s = utils.scoring.calculateScores(new DataCollection([]));
      expect(s).toEqual({
        n_trials: 0,
        n_correct: 0,
        n_timeouts: 0,
        accuracy: null,
        mean_rt: null,
        congruent_accuracy: null,
        incongruent_accuracy: null,
        neutral_accuracy: null,
        nogo_accuracy: null,
        congruent_rt: null,
        incongruent_rt: null,
        neutral_rt: null,
        flanker_effect_rt: null,
        flanker_effect_errors: null,
      });
      Object.values(s).forEach((v) => expect(Number.isNaN(v)).toBe(false));
    });

    it("has no RT effect when a condition has no correct trials", () => {
      const s = utils.scoring.calculateScores(
        new DataCollection([
          row({ congruency: "congruent", correct: true, rt: 400 }),
          row({ congruency: "incongruent", correct: false, rt: 450 }),
        ])
      );
      expect(s.incongruent_rt).toBeNull();
      expect(s.flanker_effect_rt).toBeNull();
      expect(s.flanker_effect_errors).toBe(1);
    });
  });

  describe("timelineUnits and utils", () => {
    it("exports the factories and helpers the standard names", () => {
      expect(Object.keys(timelineUnits)).toEqual(
        expect.arrayContaining([
          "createInstructions",
          "createFixation",
          "createResponseTrial",
          "createFeedback",
          "createIti",
          "createCompletion",
          "createBlock",
        ])
      );
      expect(utils.constants.TASK_NAME).toBe("flanker");
      expect(utils.text.defaultText.left_button).toBe("Left");
    });

    it("lets a researcher assemble a single block from units", async () => {
      const ctx = timelineUnits.createContext(jsPsych, { n_test_trials: 6 });
      const block = timelineUnits.createBlock(ctx, "test", 1, 6);
      const { getData, expectFinished } = await simulateTimeline([block], "data-only", {}, jsPsych);
      await expectFinished();
      expect(getData().filter({ part: "response" }).count()).toBe(6);
    });
  });

  describe("styles", () => {
    it("scopes every selector under the task class", () => {
      const css = fs
        .readFileSync(path.join(__dirname, "styles.css"), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "");
      const selectors = css
        .split("}")
        .map((b) => b.split("{")[0].trim())
        .filter(Boolean)
        .flatMap((s) => s.split(","))
        .map((s) => s.trim());
      expect(selectors.length).toBeGreaterThan(5);
      selectors.forEach((s) => expect(s.startsWith(".jspsych-timelines-flanker")).toBe(true));
    });
  });
});
