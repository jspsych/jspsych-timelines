import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Free Recall Timeline", () => {
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
  });

  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true }).timeline
      );

      expect(displayElement.innerHTML).toContain("Free Recall Task");
    });
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.correctRecalls).toBe(0);
      expect(scores.totalWords).toBe(0);
      expect(scores.intrusions).toBe(0);
      expect(scores.repetitions).toBe(0);
      expect(scores.recalledWords).toEqual([]);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("correctRecalls");
      expect(scores).toHaveProperty("totalWords");
      expect(scores).toHaveProperty("recallRate");
      expect(scores).toHaveProperty("intrusions");
      expect(scores).toHaveProperty("repetitions");
      expect(scores).toHaveProperty("totalResponses");
      expect(scores).toHaveProperty("recalledWords");
      expect(scores).toHaveProperty("intrusionWords");
      expect(scores).toHaveProperty("serialPositions");
      expect(scores).toHaveProperty("averageRecallRT");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("free-recall");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("free-recall");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
      expect(utils.constants.DEFAULT_WORDS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.wordDuration).toBe(2000);
      expect(defaults.isi).toBe(500);
      expect(defaults.recallDelay).toBe(1000);
      expect(defaults.maxRecallTime).toBe(60000);
      expect(defaults.showInstructions).toBe(true);
    });

    it("should have default word list", () => {
      expect(utils.constants.DEFAULT_WORDS.length).toBe(15);
      utils.constants.DEFAULT_WORDS.forEach((word) => {
        expect(typeof word).toBe("string");
        expect(word.length).toBeGreaterThan(0);
      });
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createStudyTrial).toBe("function");
      expect(typeof timelineUnits.createStudyPhase).toBe("function");
      expect(typeof timelineUnits.createRecallPhase).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.normalizeWord).toBe("function");
    });
  });

  describe("word normalization", () => {
    it("should convert to uppercase", () => {
      expect(timelineUnits.normalizeWord("apple")).toBe("APPLE");
    });

    it("should trim whitespace", () => {
      expect(timelineUnits.normalizeWord("  apple  ")).toBe("APPLE");
    });

    it("should handle mixed case", () => {
      expect(timelineUnits.normalizeWord("ApPlE")).toBe("APPLE");
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
    it("should accept custom word list", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        words: ["CAT", "DOG", "BIRD"],
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom word duration", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        wordDuration: 3000,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom ISI", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        isi: 1000,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom recall delay", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        recallDelay: 2000,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom max recall time", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        maxRecallTime: 90000,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("default text", () => {
    it("should have all required text fields", () => {
      expect(utils.text.continue_button).toBeDefined();
      expect(utils.text.start_button).toBeDefined();
      expect(utils.text.submit_button).toBeDefined();
      expect(utils.text.done_button).toBeDefined();
      expect(utils.text.instruction_intro).toBeDefined();
      expect(utils.text.instruction_study).toBeDefined();
      expect(utils.text.instruction_recall).toBeDefined();
      expect(utils.text.input_placeholder).toBeDefined();
      expect(utils.text.study_prompt).toBeDefined();
      expect(utils.text.recall_prompt).toBeDefined();
      expect(utils.text.task_complete).toBeDefined();
      expect(typeof utils.text.result_summary).toBe("function");
    });
  });

  describe("study trial creation", () => {
    it("should create study trial with word", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createStudyTrial(config, "APPLE", 1);
      expect(trial.timeline).toBeDefined();
      expect(trial.timeline.length).toBe(2); // word + ISI
    });
  });

  describe("study phase creation", () => {
    it("should create study phase with correct number of trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const words = ["APPLE", "TABLE", "RIVER"];
      const phase = timelineUnits.createStudyPhase(config, words);
      expect(phase.timeline.length).toBe(3);
    });
  });

  describe("recall phase creation", () => {
    it("should create recall phase", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const words = ["APPLE", "TABLE", "RIVER"];
      const phase = timelineUnits.createRecallPhase(jsPsych, config, words);
      expect(phase.timeline).toBeDefined();
      expect(phase.timeline.length).toBeGreaterThan(0);
    });
  });

  describe("default word list", () => {
    it("should have unique words", () => {
      const words = utils.constants.DEFAULT_WORDS;
      const unique = new Set(words);
      expect(unique.size).toBe(words.length);
    });

    it("should have all uppercase words", () => {
      utils.constants.DEFAULT_WORDS.forEach((word) => {
        expect(word).toBe(word.toUpperCase());
      });
    });
  });
});
