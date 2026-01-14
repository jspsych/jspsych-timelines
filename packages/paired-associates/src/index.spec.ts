import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Paired Associates Timeline", () => {
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
      expect(timeline.timeline.length).toBeGreaterThan(3);
    });

    it("should skip instructions when showInstructions is false", () => {
      const jsPsych = initJsPsych();
      const withInstructions = createTimeline(jsPsych, { showInstructions: true });
      const withoutInstructions = createTimeline(jsPsych, { showInstructions: false });
      expect(withoutInstructions.timeline.length).toBeLessThan(
        withInstructions.timeline.length
      );
    });
  });

  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true }).timeline
      );

      expect(displayElement.innerHTML).toContain("Paired Associates");
    });
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.finalRoundCorrect).toBe(0);
      expect(scores.totalPairs).toBe(0);
      expect(scores.roundsCompleted).toBe(0);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("finalRoundCorrect");
      expect(scores).toHaveProperty("totalPairs");
      expect(scores).toHaveProperty("finalRoundAccuracy");
      expect(scores).toHaveProperty("roundsCompleted");
      expect(scores).toHaveProperty("roundsToLearn");
      expect(scores).toHaveProperty("roundPerformance");
      expect(scores).toHaveProperty("averageRTCorrect");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("paired-associates");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("paired-associates");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.studyDuration).toBe(3000);
      expect(defaults.maxRounds).toBe(3);
      expect(defaults.numOptions).toBe(4);
      expect(defaults.showFeedback).toBe(true);
    });

    it("should have default word pairs", () => {
      expect(utils.constants.DEFAULT_WORD_PAIRS.length).toBe(8);
      utils.constants.DEFAULT_WORD_PAIRS.forEach((pair) => {
        expect(pair.cue).toBeDefined();
        expect(pair.target).toBeDefined();
      });
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createStudyTrial).toBe("function");
      expect(typeof timelineUnits.createTestTrial).toBe("function");
      expect(typeof timelineUnits.createStudyPhase).toBe("function");
      expect(typeof timelineUnits.createTestPhase).toBe("function");
      expect(typeof timelineUnits.createRoundSummary).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.generateOptions).toBe("function");
    });
  });

  describe("option generation", () => {
    it("should generate correct number of options", () => {
      const allTargets = ["A", "B", "C", "D", "E", "F"];
      const options = timelineUnits.generateOptions("A", allTargets, 4);
      expect(options.length).toBe(4);
    });

    it("should include the correct answer", () => {
      const allTargets = ["A", "B", "C", "D", "E", "F"];
      const options = timelineUnits.generateOptions("A", allTargets, 4);
      expect(options).toContain("A");
    });

    it("should not include duplicates", () => {
      const allTargets = ["A", "B", "C", "D", "E", "F"];
      const options = timelineUnits.generateOptions("A", allTargets, 4);
      const unique = new Set(options);
      expect(unique.size).toBe(options.length);
    });

    it("should shuffle the options", () => {
      const allTargets = ["A", "B", "C", "D", "E", "F", "G", "H"];
      const results: string[] = [];
      for (let i = 0; i < 10; i++) {
        const options = timelineUnits.generateOptions("A", allTargets, 4);
        results.push(options.join(","));
      }
      // Not all results should be identical
      const unique = new Set(results);
      expect(unique.size).toBeGreaterThan(1);
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
    it("should accept custom word pairs", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        wordPairs: [
          { cue: "CAT", target: "DOG" },
          { cue: "SUN", target: "MOON" },
        ],
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom study duration", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        studyDuration: 5000,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom max rounds", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        maxRounds: 5,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom number of options", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numOptions: 6,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept disabled feedback", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        showFeedback: false,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("default word pairs", () => {
    it("should have unique cues", () => {
      const cues = utils.constants.DEFAULT_WORD_PAIRS.map((p) => p.cue);
      const unique = new Set(cues);
      expect(unique.size).toBe(cues.length);
    });

    it("should have unique targets", () => {
      const targets = utils.constants.DEFAULT_WORD_PAIRS.map((p) => p.target);
      const unique = new Set(targets);
      expect(unique.size).toBe(targets.length);
    });

    it("should have all uppercase words", () => {
      utils.constants.DEFAULT_WORD_PAIRS.forEach((pair) => {
        expect(pair.cue).toBe(pair.cue.toUpperCase());
        expect(pair.target).toBe(pair.target.toUpperCase());
      });
    });
  });

  describe("study phase", () => {
    it("should create study phase with correct number of trials", () => {
      const pairs = [
        { cue: "A", target: "B" },
        { cue: "C", target: "D" },
        { cue: "E", target: "F" },
      ];
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        wordPairs: pairs,
        text: utils.text,
      };
      const phase = timelineUnits.createStudyPhase(config, pairs, 1);
      expect(phase.timeline.length).toBe(3);
    });
  });

  describe("test phase", () => {
    it("should create test phase with correct number of trials", () => {
      const jsPsych = initJsPsych();
      const pairs = [
        { cue: "A", target: "B" },
        { cue: "C", target: "D" },
        { cue: "E", target: "F" },
      ];
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        wordPairs: pairs,
        text: utils.text,
      };
      const phase = timelineUnits.createTestPhase(jsPsych, config, pairs, 1);
      expect(phase.timeline.length).toBe(3);
    });
  });
});
