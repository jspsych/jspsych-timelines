import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Oddball Timeline", () => {
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

      expect(displayElement.innerHTML).toContain("Oddball Task");
    });
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.hits).toBe(0);
      expect(scores.totalTargets).toBe(0);
      expect(scores.hitRate).toBe(0);
      expect(scores.falseAlarms).toBe(0);
      expect(scores.dPrime).toBeNull();
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("hits");
      expect(scores).toHaveProperty("totalTargets");
      expect(scores).toHaveProperty("hitRate");
      expect(scores).toHaveProperty("falseAlarms");
      expect(scores).toHaveProperty("totalStandards");
      expect(scores).toHaveProperty("falseAlarmRate");
      expect(scores).toHaveProperty("misses");
      expect(scores).toHaveProperty("correctRejections");
      expect(scores).toHaveProperty("dPrime");
      expect(scores).toHaveProperty("averageRTHits");
      expect(scores).toHaveProperty("accuracy");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("oddball");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("oddball");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.numTrials).toBe(100);
      expect(defaults.targetProportion).toBe(0.2);
      expect(defaults.stimulusDuration).toBe(500);
      expect(defaults.isi).toBe(1000);
      expect(defaults.responseTimeout).toBe(1000);
      expect(defaults.showPractice).toBe(true);
      expect(defaults.numPracticeTrials).toBe(10);
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createOddballTrial).toBe("function");
      expect(typeof timelineUnits.createOddballBlock).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.generateTrialSequence).toBe("function");
      expect(typeof timelineUnits.createStimulusHTML).toBe("function");
    });
  });

  describe("trial sequence generation", () => {
    it("should generate correct number of trials", () => {
      const sequence = timelineUnits.generateTrialSequence(100, 0.2);
      expect(sequence.length).toBe(100);
    });

    it("should have correct proportion of targets", () => {
      const sequence = timelineUnits.generateTrialSequence(100, 0.2);
      const targetCount = sequence.filter((s) => s === "target").length;
      expect(targetCount).toBe(20);
    });

    it("should have correct proportion of standards", () => {
      const sequence = timelineUnits.generateTrialSequence(100, 0.2);
      const standardCount = sequence.filter((s) => s === "standard").length;
      expect(standardCount).toBe(80);
    });

    it("should shuffle the sequence", () => {
      // Generate multiple sequences and check they're not all identical
      const results: string[] = [];
      for (let i = 0; i < 10; i++) {
        const sequence = timelineUnits.generateTrialSequence(20, 0.2);
        results.push(sequence.join(","));
      }
      const unique = new Set(results);
      expect(unique.size).toBeGreaterThan(1);
    });

    it("should handle edge case of 0% targets", () => {
      const sequence = timelineUnits.generateTrialSequence(10, 0);
      const targetCount = sequence.filter((s) => s === "target").length;
      expect(targetCount).toBe(0);
      expect(sequence.length).toBe(10);
    });

    it("should handle edge case of 100% targets", () => {
      const sequence = timelineUnits.generateTrialSequence(10, 1);
      const targetCount = sequence.filter((s) => s === "target").length;
      expect(targetCount).toBe(10);
    });
  });

  describe("stimulus HTML generation", () => {
    it("should create circle HTML with correct color", () => {
      const html = timelineUnits.createStimulusHTML("#FF0000", 100);
      expect(html).toContain("background-color: #FF0000");
      expect(html).toContain("border-radius: 50%");
    });

    it("should create circle HTML with correct size", () => {
      const html = timelineUnits.createStimulusHTML("#FF0000", 150);
      expect(html).toContain("width: 150px");
      expect(html).toContain("height: 150px");
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
        numTrials: 50,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom target proportion", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        targetProportion: 0.1,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom stimulus duration", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        stimulusDuration: 1000,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom colors", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        standardColor: "#00FF00",
        targetColor: "#FFFF00",
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom stimulus size", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        stimulusSize: 200,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom ISI", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        isi: 500,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom number of practice trials", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numPracticeTrials: 5,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("default text", () => {
    it("should have all required text fields", () => {
      expect(utils.text.continue_button).toBeDefined();
      expect(utils.text.start_button).toBeDefined();
      expect(utils.text.respond_button).toBeDefined();
      expect(utils.text.instruction_intro).toBeDefined();
      expect(utils.text.instruction_practice).toBeDefined();
      expect(utils.text.instruction_task).toBeDefined();
      expect(utils.text.feedback_hit).toBeDefined();
      expect(utils.text.feedback_false_alarm).toBeDefined();
      expect(utils.text.feedback_miss).toBeDefined();
      expect(utils.text.feedback_correct_rejection).toBeDefined();
      expect(utils.text.task_complete).toBeDefined();
      expect(typeof utils.text.result_summary).toBe("function");
    });
  });

  describe("oddball trial creation", () => {
    it("should create standard trial", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createOddballTrial(
        jsPsych,
        config,
        "standard",
        1,
        false
      );
      expect(trial.timeline).toBeDefined();
      expect(trial.timeline.length).toBe(2); // fixation + stimulus
    });

    it("should create target trial", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createOddballTrial(
        jsPsych,
        config,
        "target",
        1,
        false
      );
      expect(trial.timeline).toBeDefined();
      expect(trial.timeline.length).toBe(2); // fixation + stimulus
    });

    it("should include feedback for practice trials", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createOddballTrial(
        jsPsych,
        config,
        "target",
        1,
        true
      );
      expect(trial.timeline.length).toBe(3); // fixation + stimulus + feedback
    });
  });

  describe("oddball block creation", () => {
    it("should create block with correct number of trials", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const block = timelineUnits.createOddballBlock(jsPsych, config, 10, false);
      expect(block.timeline.length).toBe(10);
    });
  });
});
