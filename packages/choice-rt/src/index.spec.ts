import { readFileSync } from "fs";
import { join } from "path";

import { simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import { createTimeline, timelineUnits, utils } from "./index";

jest.useFakeTimers();

describe("Choice RT Timeline", () => {
  describe("createTimeline", () => {
    it("should create a timeline object", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych);
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should include instructions when showInstructions is true", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { showInstructions: true });
      expect(timeline.timeline.length).toBeGreaterThan(2);
    });

    it("should skip instructions when showInstructions is false", () => {
      const jsPsych = initJsPsych();
      const withInstructions = createTimeline(jsPsych, { showInstructions: true });
      const withoutInstructions = createTimeline(jsPsych, { showInstructions: false });
      expect(withoutInstructions.timeline.length).toBeLessThan(withInstructions.timeline.length);
    });

    it("should skip practice when showPractice is false", () => {
      const jsPsych = initJsPsych();
      const withPractice = createTimeline(jsPsych, { showPractice: true });
      const withoutPractice = createTimeline(jsPsych, { showPractice: false });
      expect(withoutPractice.timeline.length).toBeLessThan(withPractice.timeline.length);
    });
  });

  describe("recorded data", () => {
    // data-only simulation runs every trial through the real plugin and through
    // jsPsych's result processing, which is where reserved keys get overwritten
    const runTask = async (options = {}) => {
      const jsPsych = initJsPsych();
      // the whole node, not node.timeline: the timeline-level `data` that
      // stamps task_version onto every row lives on the node itself
      const { getData } = await simulateTimeline(
        [
          createTimeline(jsPsych, {
            numTrials: 4,
            numPracticeTrials: 2,
            showInstructions: false,
            ...options,
          }),
        ],
        "data-only",
        {},
        jsPsych
      );
      return getData();
    };

    it("should record the stimulus type as 1 or 2, not the stimulus HTML", async () => {
      const data = await runTask();
      const rows = data.filter({ task: "choice-rt", phase: "test", part: "response" }).values();

      expect(rows).toHaveLength(4);
      expect(rows.map((r: any) => r.stimulus_type).sort()).toEqual([1, 1, 2, 2]);
      for (const row of rows) {
        expect(typeof (row as any).stimulus_type).toBe("number");
      }
    });

    it("should number trials within the block, restarting for the test phase", async () => {
      const data = await runTask();
      const practice = data
        .filter({ task: "choice-rt", phase: "practice", part: "response" })
        .values();
      const test = data.filter({ task: "choice-rt", phase: "test", part: "response" }).values();

      expect(practice.map((r: any) => r.trial_number)).toEqual([1, 2]);
      expect(test.map((r: any) => r.trial_number)).toEqual([1, 2, 3, 4]);
    });

    it("should not use jsPsych's reserved trial_index for the block position", async () => {
      const data = await runTask();
      const test = data.filter({ task: "choice-rt", phase: "test", part: "response" }).values();

      // jsPsych overwrites trial_index with the experiment-wide position, so the
      // two must not be the same field
      expect(test.map((r: any) => r.trial_index)).not.toEqual([1, 2, 3, 4]);
      expect(test.every((r: any) => r.trial_index > r.trial_number)).toBe(true);
    });

    it("should stamp task and task_version on every row", async () => {
      const data = await runTask({ showInstructions: true });
      const rows = data.values();

      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect((row as any).task).toBe("choice-rt");
        expect((row as any).task_version).toBe(utils.constants.VERSION);
      }
    });

    it("should label every row with a phase and a part", async () => {
      const data = await runTask({ showInstructions: true });

      for (const row of data.values()) {
        expect(typeof (row as any).phase).toBe("string");
        expect(typeof (row as any).part).toBe("string");
      }
    });

    it("should emit the documented phase and part values", async () => {
      const data = await runTask({ showInstructions: true });
      const kinds = new Set(data.values().map((r: any) => `${r.phase}/${r.part}`));

      expect(kinds).toEqual(
        new Set([
          "instructions/instruction",
          "practice/instruction",
          "practice/foreperiod",
          "practice/response",
          "practice/feedback",
          "practice/iti",
          "test/instruction",
          "test/foreperiod",
          "test/response",
          "test/iti",
          "completion/results",
        ])
      );
    });

    it("should record the foreperiod on every response row", async () => {
      const data = await runTask({ foreperiodMin: 400, foreperiodMax: 900 });
      const rows = data.filter({ task: "choice-rt", phase: "test", part: "response" }).values();

      for (const row of rows) {
        expect((row as any).foreperiod).toBeGreaterThanOrEqual(400);
        expect((row as any).foreperiod).toBeLessThanOrEqual(900);
      }
    });
  });

  describe("validation", () => {
    it("should accept the default configuration", () => {
      const jsPsych = initJsPsych();
      expect(() => createTimeline(jsPsych)).not.toThrow();
    });

    it.each([0, -1, 2.5, NaN])("should reject numTrials of %p", (numTrials) => {
      const jsPsych = initJsPsych();
      expect(() => createTimeline(jsPsych, { numTrials })).toThrow(
        /\[choice-rt\] numTrials must be an integer >= 1/
      );
    });

    it("should reject an inverted foreperiod range", () => {
      const jsPsych = initJsPsych();
      expect(() => createTimeline(jsPsych, { foreperiodMin: 1500, foreperiodMax: 500 })).toThrow(
        /foreperiodMax \(500\) must be >= foreperiodMin \(1500\)/
      );
    });

    it("should accept a foreperiod range with equal bounds", () => {
      const jsPsych = initJsPsych();
      expect(() =>
        createTimeline(jsPsych, { foreperiodMin: 800, foreperiodMax: 800 })
      ).not.toThrow();
    });

    it.each([
      ["foreperiodMin", { foreperiodMin: -200 }],
      ["foreperiodMax", { foreperiodMax: -1 }],
      ["iti", { iti: -500 }],
      ["minValidRT", { minValidRT: -1 }],
    ])("should reject a negative %s", (name, options) => {
      const jsPsych = initJsPsych();
      expect(() => createTimeline(jsPsych, options)).toThrow(
        new RegExp(`\\[choice-rt\\] ${name} must be a non-negative number of milliseconds`)
      );
    });

    it.each([0, -100, Infinity])("should reject a responseTimeout of %p", (responseTimeout) => {
      const jsPsych = initJsPsych();
      expect(() => createTimeline(jsPsych, { responseTimeout })).toThrow(
        /responseTimeout must be a positive number of milliseconds/
      );
    });

    it("should reject minValidRT at or above responseTimeout", () => {
      const jsPsych = initJsPsych();
      expect(() => createTimeline(jsPsych, { minValidRT: 1500, responseTimeout: 1500 })).toThrow(
        /every response would be counted as anticipated/
      );
    });

    it.each([0, -60])("should reject a stimulusSize of %p", (stimulusSize) => {
      const jsPsych = initJsPsych();
      expect(() => createTimeline(jsPsych, { stimulusSize })).toThrow(
        /stimulusSize must be a positive number of pixels/
      );
    });

    it("should reject numPracticeTrials below 1 when practice is shown", () => {
      const jsPsych = initJsPsych();
      expect(() => createTimeline(jsPsych, { showPractice: true, numPracticeTrials: 0 })).toThrow(
        /\[choice-rt\] numPracticeTrials must be an integer >= 1/
      );
    });

    it("should reject a negative feedbackDuration when practice is shown", () => {
      const jsPsych = initJsPsych();
      expect(() => createTimeline(jsPsych, { showPractice: true, feedbackDuration: -1 })).toThrow(
        /\[choice-rt\] feedbackDuration must be a non-negative number/
      );
    });

    it("should ignore practice parameters when practice is not shown", () => {
      const jsPsych = initJsPsych();
      expect(() =>
        createTimeline(jsPsych, {
          showPractice: false,
          numPracticeTrials: 0,
          feedbackDuration: -1,
        })
      ).not.toThrow();
    });
  });

  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true }).timeline
      );

      expect(displayElement.innerHTML).toContain("Choice Reaction Time");
    });
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.meanRT).toBeNull();
      expect(scores.rtStd).toBeNull();
      expect(scores.accuracy).toBeNull();
      expect(scores.totalTrials).toBe(0);
      expect(scores.correctTrials).toBe(0);
      expect(scores.incorrectTrials).toBe(0);
      expect(scores.anticipatedResponses).toBe(0);
      expect(scores.timeoutResponses).toBe(0);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("meanRT");
      expect(scores).toHaveProperty("rtStd");
      expect(scores).toHaveProperty("accuracy");
      expect(scores).toHaveProperty("totalTrials");
      expect(scores).toHaveProperty("correctTrials");
      expect(scores).toHaveProperty("incorrectTrials");
      expect(scores).toHaveProperty("anticipatedResponses");
      expect(scores).toHaveProperty("timeoutResponses");
    });
  });

  describe("accuracy", () => {
    const pushResponse = (jsPsych: any, row: Record<string, unknown>) =>
      jsPsych.data.get().push({
        task: "choice-rt",
        phase: "test",
        part: "response",
        ...row,
      });

    const correct = { correct: true, anticipated: false, rt: 400 };
    const incorrect = { correct: false, anticipated: false, rt: 450 };
    const anticipated = { correct: false, anticipated: true, rt: 50 };
    const timeout = { correct: false, anticipated: false, rt: null };

    it("should exclude anticipated and timed-out trials from the denominator", () => {
      const jsPsych = initJsPsych();
      pushResponse(jsPsych, correct);
      pushResponse(jsPsych, correct);
      pushResponse(jsPsych, incorrect);
      pushResponse(jsPsych, anticipated);
      pushResponse(jsPsych, timeout);

      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      // 2 of the 3 valid trials, not 2 of 5
      expect(scores.accuracy).toBeCloseTo(66.667, 2);
      expect(scores.totalTrials).toBe(5);
      expect(scores.correctTrials).toBe(2);
      expect(scores.incorrectTrials).toBe(1);
      expect(scores.anticipatedResponses).toBe(1);
      expect(scores.timeoutResponses).toBe(1);
    });

    it("should report 0 when the participant responded validly and got them all wrong", () => {
      const jsPsych = initJsPsych();
      pushResponse(jsPsych, incorrect);
      pushResponse(jsPsych, incorrect);

      // a real 0 must survive: guarding on the computed value would null this out
      expect(utils.scoring.calculateScores(jsPsych.data.get()).accuracy).toBe(0);
    });

    it("should report null when no valid trial exists", () => {
      const jsPsych = initJsPsych();
      pushResponse(jsPsych, anticipated);
      pushResponse(jsPsych, timeout);

      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.accuracy).toBeNull();
      expect(scores.totalTrials).toBe(2);
      expect(scores.correctTrials).toBe(0);
    });

    it("should report 100 when every valid trial is correct", () => {
      const jsPsych = initJsPsych();
      pushResponse(jsPsych, correct);
      pushResponse(jsPsych, anticipated);

      expect(utils.scoring.calculateScores(jsPsych.data.get()).accuracy).toBe(100);
    });

    it("should partition every response trial into exactly one category", () => {
      const jsPsych = initJsPsych();
      for (const row of [correct, incorrect, anticipated, timeout, correct]) {
        pushResponse(jsPsych, row);
      }

      const s = utils.scoring.calculateScores(jsPsych.data.get());

      expect(
        s.correctTrials + s.incorrectTrials + s.anticipatedResponses + s.timeoutResponses
      ).toBe(s.totalTrials);
    });

    it("should ignore practice trials and other tasks", () => {
      const jsPsych = initJsPsych();
      pushResponse(jsPsych, correct);
      pushResponse(jsPsych, { ...incorrect, phase: "practice" });
      pushResponse(jsPsych, { ...incorrect, task: "some-other-task" });

      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.totalTrials).toBe(1);
      expect(scores.accuracy).toBe(100);
    });

    it("should omit the accuracy line from the results screen when it is null", () => {
      expect(utils.text.result_summary(null, null)).not.toContain("Accuracy");
      expect(utils.text.result_summary(420, 0)).toContain("0.0%");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("choice-rt");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("choice-rt");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.numTrials).toBe(20);
      expect(defaults.foreperiodMin).toBe(500);
      expect(defaults.foreperiodMax).toBe(1500);
      expect(defaults.responseTimeout).toBe(1500);
      expect(defaults.minValidRT).toBe(100);
      expect(defaults.stimulusColor1).toBe("#4A90D9");
      expect(defaults.stimulusColor2).toBe("#E8913A");
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createChoiceRTTrial).toBe("function");
      expect(typeof timelineUnits.createTrialBlock).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.generateForeperiod).toBe("function");
      expect(typeof timelineUnits.generateStimulusSequence).toBe("function");
      expect(typeof timelineUnits.createStimulusHTML).toBe("function");
      expect(typeof timelineUnits.createFixationHTML).toBe("function");
    });
  });

  describe("foreperiod generation", () => {
    it("should generate foreperiod within range", () => {
      for (let i = 0; i < 100; i++) {
        const foreperiod = timelineUnits.generateForeperiod(500, 1500);
        expect(foreperiod).toBeGreaterThanOrEqual(500);
        expect(foreperiod).toBeLessThanOrEqual(1500);
      }
    });

    it("should vary foreperiods", () => {
      const foreperiods: number[] = [];
      for (let i = 0; i < 20; i++) {
        foreperiods.push(timelineUnits.generateForeperiod(500, 1500));
      }
      const unique = new Set(foreperiods);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe("stimulus sequence generation", () => {
    it("should generate correct number of trials", () => {
      const sequence = timelineUnits.generateStimulusSequence(20);
      expect(sequence.length).toBe(20);
    });

    it("should have balanced stimulus types", () => {
      const sequence = timelineUnits.generateStimulusSequence(20);
      const count1 = sequence.filter((s) => s === 1).length;
      const count2 = sequence.filter((s) => s === 2).length;
      expect(count1).toBe(10);
      expect(count2).toBe(10);
    });

    it("should stay within one trial of balanced for any count", () => {
      for (const n of [1, 2, 3, 5, 8, 9, 20, 21]) {
        const sequence = timelineUnits.generateStimulusSequence(n);
        const count1 = sequence.filter((s) => s === 1).length;
        const count2 = sequence.filter((s) => s === 2).length;

        expect(sequence).toHaveLength(n);
        expect(count1 + count2).toBe(n);
        expect(Math.abs(count1 - count2)).toBeLessThanOrEqual(1);
      }
    });

    it("should give the extra trial of an odd count to either color", () => {
      const counts = new Set<number>();
      for (let i = 0; i < 200; i++) {
        counts.add(timelineUnits.generateStimulusSequence(5).filter((s) => s === 1).length);
      }

      // the remainder always going to color 2 would make this {2}
      expect(counts).toEqual(new Set([2, 3]));
    });

    it("should not favor one color across many single-trial sequences", () => {
      const drawn = new Set<number>();
      for (let i = 0; i < 200; i++) {
        drawn.add(timelineUnits.generateStimulusSequence(1)[0]);
      }

      expect(drawn).toEqual(new Set([1, 2]));
    });

    it("should be reproducible under a seeded Math.random", () => {
      const jsPsych = initJsPsych();
      const realRandom = Math.random;
      try {
        jsPsych.randomization.setSeed("choice-rt-seed");
        const first = timelineUnits.generateStimulusSequence(9).join(",");
        jsPsych.randomization.setSeed("choice-rt-seed");
        const second = timelineUnits.generateStimulusSequence(9).join(",");

        expect(second).toBe(first);
      } finally {
        Math.random = realRandom;
      }
    });

    it("should shuffle the sequence", () => {
      const results: string[] = [];
      for (let i = 0; i < 10; i++) {
        const sequence = timelineUnits.generateStimulusSequence(10);
        results.push(sequence.join(","));
      }
      const unique = new Set(results);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe("stimulus HTML generation", () => {
    it("should create stimulus with correct color", () => {
      const html = timelineUnits.createStimulusHTML("#FF0000", 60);
      expect(html).toContain("background-color: #FF0000");
    });

    it("should create stimulus with correct size", () => {
      const html = timelineUnits.createStimulusHTML("#FF0000", 80);
      expect(html).toContain("width: 80px");
      expect(html).toContain("height: 80px");
    });
  });

  describe("fixation HTML generation", () => {
    it("should create fixation cross", () => {
      const html = timelineUnits.createFixationHTML();
      expect(html).toContain("+");
    });
  });

  describe("text customization", () => {
    it("should use custom text when provided", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, {
          showInstructions: true,
          text: {
            instruction_intro: () => "<p>Custom intro text</p>",
            continue_button: "Next",
          },
        }).timeline
      );

      expect(displayElement.innerHTML).toContain("Custom intro text");
      expect(displayElement.innerHTML).toContain("Next");
    });

    it("should merge partial text with defaults", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        text: {
          continue_button: "Custom Continue",
        },
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("instruction text", () => {
    const introOf = async (options: any) => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true, ...options }).timeline
      );
      return displayElement.innerHTML;
    };

    it("should show the configured colors and button labels", async () => {
      const html = await introOf({
        stimulusColor1: "#00FF00",
        stimulusColor2: "#FF0000",
        text: { button_1: "GREEN", button_2: "RED" },
      });

      expect(html).toContain("#00FF00");
      expect(html).toContain("#FF0000");
      expect(html).toContain("GREEN");
      expect(html).toContain("RED");
    });

    it("should not fall back to the default colors or labels", async () => {
      const html = await introOf({
        stimulusColor1: "#00FF00",
        stimulusColor2: "#FF0000",
        text: { button_1: "GREEN", button_2: "RED" },
      });

      for (const stale of ["#4A90D9", "#E8913A", "BLUE", "ORANGE"]) {
        expect(html).not.toContain(stale);
      }
    });

    it("should pair each color with its own button label", async () => {
      const html = await introOf({
        stimulusColor1: "#00FF00",
        stimulusColor2: "#FF0000",
        text: { button_1: "GREEN", button_2: "RED" },
      });
      const items = html.match(/<li>[\s\S]*?<\/li>/g) ?? [];

      // color 1 maps to button 1: a swap here tells the participant to press
      // the wrong button and nothing else in the run contradicts it
      expect(items).toHaveLength(2);
      expect(items.find((item) => item.includes("#00FF00"))).toContain("GREEN");
      expect(items.find((item) => item.includes("#FF0000"))).toContain("RED");
    });

    it("should describe the stimulus the participant will actually see", async () => {
      const jsPsych = initJsPsych();
      const options = {
        stimulusColor1: "#123456",
        stimulusColor2: "#654321",
        text: { button_1: "ONE", button_2: "TWO" },
      };
      const intro = await introOf(options);
      const stimulus = timelineUnits.createStimulusHTML("#123456", 60);

      // the color named in the instructions is the color the trial renders
      expect(intro).toContain("#123456");
      expect(stimulus).toContain("background-color: #123456");
    });

    it("should let a translator ignore the arguments entirely", () => {
      expect(utils.text.instruction_intro("#000", "#fff", "A", "B")).toContain("A");
      const translated: any = () => "<p>Appuyez sur le bouton</p>";
      expect(translated("#000", "#fff", "A", "B")).toBe("<p>Appuyez sur le bouton</p>");
    });
  });

  describe("configuration options", () => {
    it("should accept custom number of trials", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numTrials: 10,
      });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom foreperiod range", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        foreperiodMin: 300,
        foreperiodMax: 800,
      });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom response timeout", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        responseTimeout: 2000,
      });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom stimulus colors", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        stimulusColor1: "#00FF00",
        stimulusColor2: "#FF0000",
      });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom stimulus size", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        stimulusSize: 80,
      });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom min valid RT", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        minValidRT: 150,
      });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom ITI", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        iti: 750,
      });
      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("default text", () => {
    it("should have all required text fields", () => {
      expect(utils.text.continue_button).toBeDefined();
      expect(utils.text.start_button).toBeDefined();
      expect(utils.text.button_1).toBeDefined();
      expect(utils.text.button_2).toBeDefined();
      expect(typeof utils.text.instruction_intro).toBe("function");
      expect(utils.text.instruction_task).toBeDefined();
      expect(utils.text.instruction_practice).toBeDefined();
      expect(utils.text.feedback_correct).toBeDefined();
      expect(utils.text.feedback_incorrect).toBeDefined();
      expect(utils.text.feedback_timeout).toBeDefined();
      expect(utils.text.feedback_anticipated).toBeDefined();
      expect(utils.text.task_complete).toBeDefined();
      expect(typeof utils.text.result_summary).toBe("function");
    });
  });

  describe("choice RT trial creation", () => {
    it("should create choice RT trial with stimulus type 1", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createChoiceRTTrial(jsPsych, config, 1, 1, false);
      expect(trial.timeline).toBeDefined();
    });

    it("should create choice RT trial with stimulus type 2", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createChoiceRTTrial(jsPsych, config, 2, 1, false);
      expect(trial.timeline).toBeDefined();
    });
  });

  describe("block creation", () => {
    it("should create trial block with correct number of trials", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const block = timelineUnits.createTrialBlock(jsPsych, config, 10, false);
      expect(block.timeline.length).toBe(10);
    });
  });
});

/* jsdom has no cascade for the injected stylesheet and no layout engine, so these
   assert against the stylesheet text that ships and against the class tokens the
   source emits, not computed styles. */
describe("styles", () => {
  const ROOT = "jspsych-choice-rt";

  const css = readFileSync(join(__dirname, "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  const selectors = [...css.matchAll(/([^{}]+)\{/g)]
    .map((match) => match[1].trim())
    .filter((selector) => selector.length > 0 && !selector.startsWith("@"))
    .flatMap((selector) => selector.split(",").map((part) => part.trim()))
    .filter((selector) => selector.length > 0);

  const flatten = (node: any): any[] => (node.timeline ? node.timeline.flatMap(flatten) : [node]);

  it("should define at least one rule", () => {
    // guards the tests below from passing on an empty parse
    expect(selectors.length).toBeGreaterThan(5);
  });

  it("should scope every rule under the timeline root", () => {
    const unscoped = selectors.filter((selector) => !selector.startsWith(`.${ROOT}`));
    expect(unscoped).toEqual([]);
  });

  it("should not reach outside the timeline's own DOM", () => {
    const escapes = selectors.filter((selector) =>
      // element selectors are fine as descendants of the root, which the test
      // above already requires; these are the tokens that escape it entirely
      /(^|\s)(body|html|\*)(\s|$)|\.(jspsych-content|jspsych-display-element)\b/.test(selector)
    );
    expect(escapes).toEqual([]);
  });

  it("should prefix every class the source emits", () => {
    const sources = ["index.ts", "text.ts"].map((file) =>
      readFileSync(join(__dirname, file), "utf8")
    );
    const emitted = sources.flatMap((source) =>
      [...source.matchAll(/class=["']([^"']+)["']/g)].flatMap((m) => m[1].split(/\s+/))
    );

    expect(emitted.length).toBeGreaterThan(0);
    emitted.forEach((token) => {
      // jspsych-btn is the plugin's own class, re-emitted so its styling applies
      expect(token === "jspsych-btn" || token.startsWith(ROOT)).toBe(true);
    });
  });

  it("should put the scoping root on every trial the timeline produces", () => {
    const jsPsych = initJsPsych();
    const trials = flatten(
      createTimeline(jsPsych, { numTrials: 2, numPracticeTrials: 1, showInstructions: true })
    );

    // 3 instruction screens, 1 practice trial (4 screens), 2 test trials
    // (3 screens each), 1 completion screen
    expect(trials.length).toBe(14);
    trials.forEach((trial) => {
      expect(trial.css_classes).toContain(ROOT);
    });
  });

  it("should render the same button markup on every screen of a trial", () => {
    const jsPsych = initJsPsych();
    const config = { ...utils.constants.DEFAULT_OPTIONS, text: utils.text };
    const screens = flatten(timelineUnits.createChoiceRTTrial(jsPsych, config, 1, 1, true));

    // a screen that styles its buttons inline moves them relative to the
    // screens that do not - at the moment the stimulus appears and RT starts
    const markup = screens.map((screen: any) =>
      screen.button_html
        ? screen.button_html("BLUE", 0)
        : '<button class="jspsych-btn">BLUE</button>'
    );

    expect(markup.length).toBe(4);
    markup.forEach((html: string) => {
      expect(html).toContain('class="jspsych-btn"');
      expect(html).not.toContain("style=");
    });
  });
});
