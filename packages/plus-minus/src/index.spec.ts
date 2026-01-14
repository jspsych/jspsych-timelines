import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Plus-Minus Timeline", () => {
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
      expect(timeline.timeline.length).toBeGreaterThan(10);
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

    it("should create three blocks plus completion", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
        trialsPerBlock: 5,
      });
      // 3 blocks (wrapped) + 3 block summaries + 1 completion = 7
      expect(timeline.timeline.length).toBe(7);
    });
  });

  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true }).timeline
      );

      expect(displayElement.innerHTML).toContain("Plus-Minus");
    });
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.addBlockTime).toBe(0);
      expect(scores.subtractBlockTime).toBe(0);
      expect(scores.alternateBlockTime).toBe(0);
      expect(scores.switchCost).toBe(0);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("addBlockTime");
      expect(scores).toHaveProperty("subtractBlockTime");
      expect(scores).toHaveProperty("alternateBlockTime");
      expect(scores).toHaveProperty("switchCost");
      expect(scores).toHaveProperty("addAccuracy");
      expect(scores).toHaveProperty("subtractAccuracy");
      expect(scores).toHaveProperty("alternateAccuracy");
      expect(scores).toHaveProperty("overallAccuracy");
      expect(scores).toHaveProperty("blockData");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("plus-minus");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("plus-minus");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.trialsPerBlock).toBe(30);
      expect(defaults.operand).toBe(3);
      expect(defaults.minNumber).toBe(10);
      expect(defaults.maxNumber).toBe(99);
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createArithmeticTrial).toBe("function");
      expect(typeof timelineUnits.createBlock).toBe("function");
      expect(typeof timelineUnits.createBlockSummary).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.generateNumbers).toBe("function");
    });
  });

  describe("number generation", () => {
    it("should generate correct number of values", () => {
      const numbers = timelineUnits.generateNumbers(10, 10, 99);
      expect(numbers.length).toBe(10);
    });

    it("should generate numbers within range", () => {
      const numbers = timelineUnits.generateNumbers(100, 20, 50);
      numbers.forEach((n) => {
        expect(n).toBeGreaterThanOrEqual(20);
        expect(n).toBeLessThanOrEqual(50);
      });
    });

    it("should generate varied numbers", () => {
      const numbers = timelineUnits.generateNumbers(30, 10, 99);
      const unique = new Set(numbers);
      // With 30 numbers from range 10-99, should have reasonable variety
      expect(unique.size).toBeGreaterThan(10);
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
    it("should accept custom operand", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        operand: 5,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom number range", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        minNumber: 20,
        maxNumber: 80,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom trials per block", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        trialsPerBlock: 15,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom practice trial count", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numPracticeTrials: 5,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("block structure", () => {
    it("should create blocks with correct structure", () => {
      const jsPsych = initJsPsych();
      const config = {
        showInstructions: true,
        showPractice: true,
        numPracticeTrials: 3,
        trialsPerBlock: 30,
        operand: 3,
        minNumber: 10,
        maxNumber: 99,
        showPracticeFeedback: true,
        feedbackDuration: 500,
        text: utils.text,
      };

      const block = timelineUnits.createBlock(jsPsych, config, "add", "test");
      expect(block.timeline).toBeDefined();
      expect(block.timeline.length).toBe(30);
    });

    it("should create practice blocks with fewer trials", () => {
      const jsPsych = initJsPsych();
      const config = {
        showInstructions: true,
        showPractice: true,
        numPracticeTrials: 3,
        trialsPerBlock: 30,
        operand: 3,
        minNumber: 10,
        maxNumber: 99,
        showPracticeFeedback: true,
        feedbackDuration: 500,
        text: utils.text,
      };

      const block = timelineUnits.createBlock(jsPsych, config, "subtract", "practice");
      expect(block.timeline.length).toBe(3);
    });
  });
});
