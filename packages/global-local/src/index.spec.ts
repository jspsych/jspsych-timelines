import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Global-Local Timeline", () => {
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

    it("should create both blocks by default", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
      });
      // 2 blocks (wrapped) + 1 completion = 3
      expect(timeline.timeline.length).toBe(3);
    });

    it("should skip global block when includeGlobalBlock is false", () => {
      const jsPsych = initJsPsych();
      const withGlobal = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
        includeGlobalBlock: true,
      });
      const withoutGlobal = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
        includeGlobalBlock: false,
      });
      expect(withoutGlobal.timeline.length).toBeLessThan(withGlobal.timeline.length);
    });
  });

  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true }).timeline
      );

      expect(displayElement.innerHTML).toContain("Global-Local");
    });
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.globalRT).toBeNull();
      expect(scores.localRT).toBeNull();
      expect(scores.globalAccuracy).toBe(0);
      expect(scores.localAccuracy).toBe(0);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("globalRT");
      expect(scores).toHaveProperty("localRT");
      expect(scores).toHaveProperty("globalAccuracy");
      expect(scores).toHaveProperty("localAccuracy");
      expect(scores).toHaveProperty("congruentRT");
      expect(scores).toHaveProperty("incongruentRT");
      expect(scores).toHaveProperty("interferenceEffect");
      expect(scores).toHaveProperty("overallAccuracy");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("global-local");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("global-local");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.trialsPerBlock).toBe(24);
      expect(defaults.fixationDuration).toBe(500);
      expect(defaults.responseTimeout).toBe(2500);
      expect(defaults.globalSize).toBe(180);
      expect(defaults.localFontSize).toBe(18);
    });

    it("should have letter patterns", () => {
      expect(utils.constants.LETTER_PATTERNS.H).toBeDefined();
      expect(utils.constants.LETTER_PATTERNS.S).toBeDefined();
      expect(utils.constants.LETTER_PATTERNS.H.length).toBe(5);
      expect(utils.constants.LETTER_PATTERNS.S.length).toBe(5);
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createGlobalLocalTrial).toBe("function");
      expect(typeof timelineUnits.createBlock).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.generateTrials).toBe("function");
      expect(typeof timelineUnits.createNavonFigure).toBe("function");
    });
  });

  describe("trial generation", () => {
    it("should generate correct number of trials", () => {
      const trials = timelineUnits.generateTrials(24);
      expect(trials.length).toBe(24);
    });

    it("should generate balanced trial types", () => {
      const trials = timelineUnits.generateTrials(24);
      const congruent = trials.filter((t) => t.congruency === "congruent");
      const incongruent = trials.filter((t) => t.congruency === "incongruent");
      expect(congruent.length).toBe(12);
      expect(incongruent.length).toBe(12);
    });

    it("should generate balanced global letters", () => {
      const trials = timelineUnits.generateTrials(24);
      const globalH = trials.filter((t) => t.globalLetter === "H");
      const globalS = trials.filter((t) => t.globalLetter === "S");
      expect(globalH.length).toBe(12);
      expect(globalS.length).toBe(12);
    });
  });

  describe("Navon figure generation", () => {
    it("should create HTML for Navon figure", () => {
      const html = timelineUnits.createNavonFigure("H", "S", 180, 18);
      expect(html).toContain("grid");
      expect(html).toContain("S"); // Local letter appears in the grid
    });

    it("should create different figures for different combinations", () => {
      const hh = timelineUnits.createNavonFigure("H", "H", 180, 18);
      const hs = timelineUnits.createNavonFigure("H", "S", 180, 18);
      const sh = timelineUnits.createNavonFigure("S", "H", 180, 18);
      const ss = timelineUnits.createNavonFigure("S", "S", 180, 18);

      // All should be different
      expect(new Set([hh, hs, sh, ss]).size).toBe(4);
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
    it("should accept custom global size", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        globalSize: 200,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom local font size", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        localFontSize: 24,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom trials per block", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        trialsPerBlock: 16,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom response timeout", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        responseTimeout: 3000,
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
  });

  describe("block structure", () => {
    it("should create blocks with correct structure", () => {
      const jsPsych = initJsPsych();
      const config = {
        showInstructions: true,
        showPractice: true,
        numPracticeTrials: 4,
        trialsPerBlock: 24,
        includeGlobalBlock: true,
        includeLocalBlock: true,
        fixationDuration: 500,
        responseTimeout: 2500,
        showPracticeFeedback: true,
        feedbackDuration: 500,
        globalSize: 180,
        localFontSize: 18,
        text: utils.text,
      };

      const block = timelineUnits.createBlock(jsPsych, config, "global", "test");
      expect(block.timeline).toBeDefined();
      expect(block.timeline.length).toBe(24);
    });

    it("should create practice blocks with fewer trials", () => {
      const jsPsych = initJsPsych();
      const config = {
        showInstructions: true,
        showPractice: true,
        numPracticeTrials: 4,
        trialsPerBlock: 24,
        includeGlobalBlock: true,
        includeLocalBlock: true,
        fixationDuration: 500,
        responseTimeout: 2500,
        showPracticeFeedback: true,
        feedbackDuration: 500,
        globalSize: 180,
        localFontSize: 18,
        text: utils.text,
      };

      const block = timelineUnits.createBlock(jsPsych, config, "local", "practice");
      expect(block.timeline.length).toBe(4);
    });
  });
});
