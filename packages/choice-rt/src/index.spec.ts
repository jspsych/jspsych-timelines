import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

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
      expect(withoutInstructions.timeline.length).toBeLessThan(
        withInstructions.timeline.length
      );
    });

    it("should skip practice when showPractice is false", () => {
      const jsPsych = initJsPsych();
      const withPractice = createTimeline(jsPsych, { showPractice: true });
      const withoutPractice = createTimeline(jsPsych, { showPractice: false });
      expect(withoutPractice.timeline.length).toBeLessThan(
        withPractice.timeline.length
      );
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
      expect(scores.accuracy).toBe(0);
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
            instruction_intro: "<p>Custom intro text</p>",
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
      expect(utils.text.instruction_intro).toBeDefined();
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
