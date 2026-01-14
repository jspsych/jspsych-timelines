import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Mental Rotation Timeline", () => {
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
        trialsPerCondition: 5,
        showInstructions: false,
        showPractice: false,
      });
      // 10 trials total (5 same + 5 different) + 1 completion = 11
      expect(timeline.timeline.length).toBe(11);
    });

    it("should use default 10 trials per condition when not specified", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
      });
      // 20 trials total + 1 completion = 21
      expect(timeline.timeline.length).toBe(21);
    });
  });

  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true }).timeline
      );

      expect(displayElement.innerHTML).toContain("Mental Rotation");
    });
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.accuracy).toBe(0);
      expect(scores.numTrials).toBe(0);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("accuracy");
      expect(scores).toHaveProperty("sameAccuracy");
      expect(scores).toHaveProperty("differentAccuracy");
      expect(scores).toHaveProperty("averageRT");
      expect(scores).toHaveProperty("averageRTCorrect");
      expect(scores).toHaveProperty("numCorrect");
      expect(scores).toHaveProperty("numTrials");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("mental-rotation");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("mental-rotation");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.trialsPerCondition).toBe(10);
      expect(defaults.gridSize).toBe(6);
      expect(defaults.cellSize).toBe(40);
      expect(defaults.numPracticeTrials).toBe(4);
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createRotationTrial).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.generateMatrix).toBe("function");
      expect(typeof timelineUnits.rotateLeft).toBe("function");
      expect(typeof timelineUnits.rotateRight).toBe("function");
    });
  });

  describe("matrix generation", () => {
    it("should generate a valid matrix with one cell per row", () => {
      const matrix = timelineUnits.generateMatrix(6);
      expect(matrix.length).toBe(6);
      matrix.forEach((row) => {
        expect(row.length).toBe(6);
        expect(row.filter((cell) => cell === 1).length).toBe(1);
      });
    });

    it("should generate matrices with one cell per column", () => {
      const matrix = timelineUnits.generateMatrix(6);
      for (let col = 0; col < 6; col++) {
        let count = 0;
        for (let row = 0; row < 6; row++) {
          if (matrix[row][col] === 1) count++;
        }
        expect(count).toBe(1);
      }
    });
  });

  describe("matrix rotation", () => {
    it("should rotate matrix 90 degrees left correctly", () => {
      const original = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ];
      const rotated = timelineUnits.rotateLeft(original);
      expect(rotated).toEqual([
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0],
      ]);
    });

    it("should rotate matrix 90 degrees right correctly", () => {
      const original = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ];
      const rotated = timelineUnits.rotateRight(original);
      expect(rotated).toEqual([
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0],
      ]);
    });

    it("should return to original after 4 left rotations", () => {
      const original = timelineUnits.generateMatrix(6);
      let rotated = original;
      for (let i = 0; i < 4; i++) {
        rotated = timelineUnits.rotateLeft(rotated);
      }
      expect(rotated).toEqual(original);
    });

    it("should return to original after 4 right rotations", () => {
      const original = timelineUnits.generateMatrix(6);
      let rotated = original;
      for (let i = 0; i < 4; i++) {
        rotated = timelineUnits.rotateRight(rotated);
      }
      expect(rotated).toEqual(original);
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
    it("should accept custom grid size", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        gridSize: 8,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom cell size", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        cellSize: 50,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom trials per condition", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        trialsPerCondition: 15,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom practice trial count", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numPracticeTrials: 6,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("trial generation", () => {
    it("should generate correct number of trials", () => {
      const trials = timelineUnits.generateTrials(5, 5, 6);
      expect(trials.length).toBe(10);
    });

    it("should generate correct condition distribution", () => {
      const trials = timelineUnits.generateTrials(5, 5, 6);
      const sameTrials = trials.filter((t) => t.condition === "same");
      const diffTrials = trials.filter((t) => t.condition === "different");
      expect(sameTrials.length).toBe(5);
      expect(diffTrials.length).toBe(5);
    });

    it("should generate trials with valid matrices", () => {
      const trials = timelineUnits.generateTrials(3, 3, 6);
      trials.forEach((trial) => {
        expect(trial.studyMatrix.length).toBe(6);
        expect(trial.testMatrix.length).toBe(6);
        expect(trial.direction).toMatch(/^(left|right)$/);
      });
    });
  });

  describe("renderMatrix", () => {
    it("should render matrix as HTML table", () => {
      const matrix = [
        [1, 0],
        [0, 1],
      ];
      const html = timelineUnits.renderMatrix(matrix, 40);
      expect(html).toContain("<table");
      expect(html).toContain("<tr>");
      expect(html).toContain("<td");
      expect(html).toContain("#ff6600"); // filled cell color
    });
  });
});
