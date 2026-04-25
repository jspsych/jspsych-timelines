import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Pursuit Rotor Timeline", () => {
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
      expect(timeline.timeline.length).toBeGreaterThan(5);
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
      expect(withoutPractice.timeline.length).toBeLessThan(withPractice.timeline.length);
    });

    it("should create correct number of test trials", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numTrials: 6,
        showInstructions: false,
        showPractice: false,
      });
      // Should have 6 trials + completion
      expect(timeline.timeline.length).toBe(7);
    });

    it("should use default 4 trials when numTrials not specified", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
      });
      // Should have 4 trials + completion
      expect(timeline.timeline.length).toBe(5);
    });
  });

  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true }).timeline
      );

      expect(displayElement.innerHTML).toContain("Pursuit Rotor");
    });
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.averagePercentOnTarget).toBe(0);
      expect(scores.totalTimeOnTarget).toBe(0);
      expect(scores.trialPerformance).toEqual([]);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("averagePercentOnTarget");
      expect(scores).toHaveProperty("averageMeanDeviation");
      expect(scores).toHaveProperty("totalTimeOnTarget");
      expect(scores).toHaveProperty("totalTrialTime");
      expect(scores).toHaveProperty("trialPerformance");
      expect(scores).toHaveProperty("improvement");
      expect(scores).toHaveProperty("learningSlope");
    });

    it("should return null improvement with insufficient trials", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.improvement).toBeNull();
      expect(scores.learningSlope).toBeNull();
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("pursuit-rotor");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("pursuit-rotor");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.numTrials).toBe(4);
      expect(defaults.trialDuration).toBe(15000);
      expect(defaults.practiceDuration).toBe(5000);
      expect(defaults.rotationSpeed).toBe(0.125);
      expect(defaults.pathRadius).toBe(150);
      expect(defaults.targetRadius).toBe(25);
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createRotorTrial).toBe("function");
      expect(typeof timelineUnits.createPracticeFeedback).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
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
    it("should accept custom rotation speed", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        rotationSpeed: 0.25,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom path radius", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        pathRadius: 200,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom target radius", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        targetRadius: 30,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept counterclockwise rotation", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        rotationDirection: "counterclockwise",
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom trial duration", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        trialDuration: 20000,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom canvas dimensions", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        canvasWidth: 600,
        canvasHeight: 600,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });
});
