import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

// Helper to click button by text
function clickButton(displayElement: HTMLElement, text: string) {
  const buttons = displayElement.querySelectorAll("button");
  for (const button of buttons) {
    if (button.textContent?.includes(text)) {
      button.click();
      return;
    }
  }
  throw new Error(`Button with text "${text}" not found`);
}

// Helper to advance through instruction screens
async function advanceThroughInstructions(displayElement: HTMLElement, count: number = 1) {
  for (let i = 0; i < count; i++) {
    clickButton(displayElement, "Continue");
    await Promise.resolve();
    jest.runAllTimers();
  }
}

describe("Tower of London Timeline", () => {
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
      // Should have intro + task + practice + test instructions + practice + puzzles + completion
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

    it("should use custom puzzles when provided", () => {
      const jsPsych = initJsPsych();
      const customPuzzles = [
        {
          start_state: [["red"], ["green"], ["blue"]],
          goal_state: [["blue"], ["green"], ["red"]],
          optimal_moves: 4,
        },
      ];
      const timeline = createTimeline(jsPsych, {
        puzzles: customPuzzles,
        showInstructions: false,
        showPractice: false,
      });
      // Should have 1 puzzle + completion
      expect(timeline.timeline.length).toBe(2);
    });

    it("should use default puzzles when none provided", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
      });
      // Should have default puzzles (10) + completion
      expect(timeline.timeline.length).toBe(11);
    });
  });

  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true }).timeline
      );

      expect(displayElement.innerHTML).toContain("Tower of London");
    });

    // Note: Tests that run actual puzzle trials require canvas support
    // which jsdom doesn't provide without additional setup.
    // Canvas rendering is tested in the plugin's own test suite.
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.puzzlesSolved).toBe(0);
      expect(scores.totalPuzzles).toBe(0);
      expect(scores.percentSolved).toBe(0);
    });

    it("should calculate correct percentages", () => {
      // Test the percentage calculation logic
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      // With empty data, should be 0%
      expect(scores.percentSolved).toBe(0);
      expect(scores.averageMoves).toBeNull();
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      // Check structure
      expect(scores).toHaveProperty("puzzlesSolved");
      expect(scores).toHaveProperty("totalPuzzles");
      expect(scores).toHaveProperty("percentSolved");
      expect(scores).toHaveProperty("optimalSolutions");
      expect(scores).toHaveProperty("averageMoves");
      expect(scores).toHaveProperty("averageMovesAboveOptimal");
      expect(scores).toHaveProperty("totalTime");
      expect(scores).toHaveProperty("averageTime");
      expect(scores).toHaveProperty("byDifficulty");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("tower-of-london");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("tower-of-london");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_PUZZLES).toBeDefined();
      expect(utils.constants.DEFAULT_PUZZLES.length).toBe(10);
      expect(utils.constants.DEFAULT_PRACTICE_PUZZLE).toBeDefined();
    });

    it("should have valid default puzzles", () => {
      for (const puzzle of utils.constants.DEFAULT_PUZZLES) {
        expect(puzzle.start_state).toBeDefined();
        expect(puzzle.goal_state).toBeDefined();
        expect(puzzle.optimal_moves).toBeGreaterThan(0);
        expect(puzzle.difficulty).toBeDefined();
      }
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createPuzzleTrial).toBe("function");
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

      // Timeline should still be created successfully
      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("puzzle configuration", () => {
    it("should accept custom practice puzzle", () => {
      const jsPsych = initJsPsych();
      const customPractice = {
        start_state: [["blue"], ["green"], ["red"]],
        goal_state: [["red"], ["green"], ["blue"]],
        optimal_moves: 3,
      };
      const timeline = createTimeline(jsPsych, {
        practicePuzzle: customPractice,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom peg capacities", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        pegCapacities: [1, 2, 3],
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept time limit", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        timeLimit: 30000,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept max moves", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        maxMoves: 20,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });
});
