import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Lexical Decision Timeline", () => {
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

    it("should create correct number of test trials", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numWordTrials: 5,
        numNonwordTrials: 5,
        showInstructions: false,
        showPractice: false,
      });
      // 10 trials + 1 completion = 11
      expect(timeline.timeline.length).toBe(11);
    });

    it("should use default 20+20 trials when not specified", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
      });
      // 40 trials + 1 completion = 41
      expect(timeline.timeline.length).toBe(41);
    });
  });

  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true }).timeline
      );

      expect(displayElement.innerHTML).toContain("Lexical Decision");
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
      expect(scores).toHaveProperty("wordAccuracy");
      expect(scores).toHaveProperty("nonwordAccuracy");
      expect(scores).toHaveProperty("averageRT");
      expect(scores).toHaveProperty("averageRTWord");
      expect(scores).toHaveProperty("averageRTNonword");
      expect(scores).toHaveProperty("dPrime");
      expect(scores).toHaveProperty("numCorrect");
      expect(scores).toHaveProperty("numTrials");
      expect(scores).toHaveProperty("numTimeouts");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("lexical-decision");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("lexical-decision");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.numWordTrials).toBe(20);
      expect(defaults.numNonwordTrials).toBe(20);
      expect(defaults.fixationDuration).toBe(500);
      expect(defaults.responseTimeout).toBe(3000);
    });

    it("should have default word lists", () => {
      expect(utils.constants.DEFAULT_WORDS.length).toBe(40);
      expect(utils.constants.DEFAULT_NONWORDS.length).toBe(40);
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createLexicalTrial).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.generateTrials).toBe("function");
    });
  });

  describe("trial generation", () => {
    it("should generate correct number of trials", () => {
      const trials = timelineUnits.generateTrials(
        utils.constants.DEFAULT_WORDS,
        utils.constants.DEFAULT_NONWORDS,
        10,
        10
      );
      expect(trials.length).toBe(20);
    });

    it("should generate correct distribution of trial types", () => {
      const trials = timelineUnits.generateTrials(
        utils.constants.DEFAULT_WORDS,
        utils.constants.DEFAULT_NONWORDS,
        10,
        10
      );
      const wordTrials = trials.filter((t) => t.type === "word");
      const nonwordTrials = trials.filter((t) => t.type === "nonword");
      expect(wordTrials.length).toBe(10);
      expect(nonwordTrials.length).toBe(10);
    });

    it("should use stimuli from provided lists", () => {
      const words = ["CAT", "DOG"];
      const nonwords = ["CAF", "DOK"];
      const trials = timelineUnits.generateTrials(words, nonwords, 2, 2);

      const wordStimuli = trials
        .filter((t) => t.type === "word")
        .map((t) => t.stimulus);
      const nonwordStimuli = trials
        .filter((t) => t.type === "nonword")
        .map((t) => t.stimulus);

      wordStimuli.forEach((s) => expect(words).toContain(s));
      nonwordStimuli.forEach((s) => expect(nonwords).toContain(s));
    });

    it("should shuffle trials", () => {
      // Generate multiple times and check that order varies
      const results: string[] = [];
      for (let i = 0; i < 10; i++) {
        const trials = timelineUnits.generateTrials(
          utils.constants.DEFAULT_WORDS,
          utils.constants.DEFAULT_NONWORDS,
          5,
          5
        );
        results.push(trials.map((t) => t.stimulus).join(","));
      }
      // Not all results should be identical (extremely unlikely with shuffling)
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
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
    it("should accept custom word lists", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        words: ["TEST", "WORD"],
        nonwords: ["TAST", "WURD"],
        numWordTrials: 2,
        numNonwordTrials: 2,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom fixation duration", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        fixationDuration: 1000,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom response timeout", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        responseTimeout: 5000,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept null response timeout for unlimited", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        responseTimeout: null,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom practice trial count", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numPracticeTrials: 10,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("default word lists", () => {
    it("should have all uppercase words", () => {
      utils.constants.DEFAULT_WORDS.forEach((word) => {
        expect(word).toBe(word.toUpperCase());
      });
    });

    it("should have all uppercase nonwords", () => {
      utils.constants.DEFAULT_NONWORDS.forEach((nonword) => {
        expect(nonword).toBe(nonword.toUpperCase());
      });
    });

    it("should have same number of words and nonwords", () => {
      expect(utils.constants.DEFAULT_WORDS.length).toBe(
        utils.constants.DEFAULT_NONWORDS.length
      );
    });
  });
});
