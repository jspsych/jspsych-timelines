import { startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import { version } from "../package.json";
import { createTimeline, timelineUnits, utils } from "./index";

jest.useFakeTimers();

describe("Fitts Timeline", () => {
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
      expect(withoutInstructions.timeline.length).toBeLessThan(withInstructions.timeline.length);
    });

    it("should skip practice when showPractice is false", () => {
      const jsPsych = initJsPsych();
      const withPractice = createTimeline(jsPsych, { showPractice: true });
      const withoutPractice = createTimeline(jsPsych, { showPractice: false });
      expect(withoutPractice.timeline.length).toBeLessThan(withPractice.timeline.length);
    });

    it("should include landscape orientation trial by default", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych);
      // First item should be the orientation check
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should skip landscape orientation when requireLandscape is false", () => {
      const jsPsych = initJsPsych();
      const withLandscape = createTimeline(jsPsych, { requireLandscape: true });
      const withoutLandscape = createTimeline(jsPsych, { requireLandscape: false });
      expect(withoutLandscape.timeline.length).toBeLessThan(withLandscape.timeline.length);
    });
  });

  describe("parameter validation", () => {
    const build = (options: any) => () => createTimeline(initJsPsych(), options);

    it("should accept the default configuration", () => {
      expect(build({})).not.toThrow();
    });

    it.each([
      ["empty conditions array", { conditions: [] }, /conditions must be a non-empty array/],
      ["non-array conditions", { conditions: null }, /conditions must be a non-empty array/],
      [
        "zero width",
        { conditions: [{ width: 0, distance: 200 }] },
        /conditions\[0\]\.width must be a number > 0, got 0/,
      ],
      [
        "negative width",
        { conditions: [{ width: -60, distance: 200 }] },
        /conditions\[0\]\.width must be a number > 0, got -60/,
      ],
      [
        "zero distance",
        { conditions: [{ width: 60, distance: 0 }] },
        /conditions\[0\]\.distance must be a number > 0, got 0/,
      ],
      [
        "a bad condition after a good one",
        {
          conditions: [
            { width: 60, distance: 200 },
            { width: 60, distance: -1 },
          ],
        },
        /conditions\[1\]\.distance must be a number > 0, got -1/,
      ],
      ["zero taps", { tapsPerCondition: 0 }, /tapsPerCondition must be an integer >= 2, got 0/],
      ["one tap", { tapsPerCondition: 1 }, /tapsPerCondition must be an integer >= 2, got 1/],
      [
        "negative taps",
        { tapsPerCondition: -5 },
        /tapsPerCondition must be an integer >= 2, got -5/,
      ],
      [
        "fractional taps",
        { tapsPerCondition: 2.5 },
        /tapsPerCondition must be an integer >= 2, got 2.5/,
      ],
      [
        "zero repetitions",
        { repetitionsPerCondition: 0 },
        /repetitionsPerCondition must be an integer >= 1, got 0/,
      ],
      [
        "fractional repetitions",
        { repetitionsPerCondition: 1.5 },
        /repetitionsPerCondition must be an integer >= 1, got 1.5/,
      ],
      [
        "zero practice conditions while practice is on",
        { showPractice: true, numPracticeConditions: 0 },
        /numPracticeConditions must be an integer >= 1 when showPractice is true, got 0/,
      ],
      [
        "empty targetColor",
        { targetColor: "   " },
        /targetColor must be a non-empty CSS color string/,
      ],
      [
        "targetColor that breaks out of the style attribute",
        { targetColor: 'red" onclick="alert(1)' },
        /targetColor must not contain quotes, angle brackets or backslashes/,
      ],
    ])("should reject %s", (_label, options, message) => {
      expect(build(options)).toThrow(message);
    });

    it("should name the task in every validation message", () => {
      expect(build({ tapsPerCondition: 0 })).toThrow(/^\[fitts\]/);
    });

    it("should ignore numPracticeConditions when practice is disabled", () => {
      expect(build({ showPractice: false, numPracticeConditions: 0 })).not.toThrow();
    });

    it("should allow a negative index of difficulty", () => {
      // width > 2 * distance is a valid floor-effect baseline condition, not an error.
      expect(build({ conditions: [{ width: 500, distance: 100 }] })).not.toThrow();
    });

    it("should allow numPracticeConditions above the number of conditions", () => {
      expect(build({ numPracticeConditions: 99 })).not.toThrow();
    });

    it("should accept CSS color forms that contain punctuation", () => {
      expect(build({ targetColor: "rgb(74, 144, 217)" })).not.toThrow();
      expect(build({ targetColor: "var(--fitts-target)" })).not.toThrow();
    });
  });
  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, {
          showInstructions: true,
          requireLandscape: false,
        }).timeline
      );

      expect(displayElement.innerHTML).toContain("Tapping Task");
    });
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.averageMT).toBe(0);
      expect(scores.accuracy).toBe(0);
      expect(scores.throughput).toBeNull();
      expect(scores.totalTaps).toBe(0);
      expect(scores.totalErrors).toBe(0);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("averageMT");
      expect(scores).toHaveProperty("accuracy");
      expect(scores).toHaveProperty("throughput");
      expect(scores).toHaveProperty("totalTaps");
      expect(scores).toHaveProperty("totalErrors");
      expect(scores).toHaveProperty("conditionPerformance");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("fitts");
      expect(summary.version).toBe(version);
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("fitts");
      expect(utils.constants.VERSION).toBe(version);
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
      expect(utils.constants.DEFAULT_CONDITIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.tapsPerCondition).toBe(10);
      expect(defaults.repetitionsPerCondition).toBe(2);
      expect(defaults.showPractice).toBe(true);
      expect(defaults.numPracticeConditions).toBe(2);
      expect(defaults.requireLandscape).toBe(true);
    });

    it("should have default conditions", () => {
      expect(utils.constants.DEFAULT_CONDITIONS.length).toBe(6);
      utils.constants.DEFAULT_CONDITIONS.forEach((cond) => {
        expect(cond).toHaveProperty("width");
        expect(cond).toHaveProperty("distance");
        expect(cond.width).toBeGreaterThan(0);
        expect(cond.distance).toBeGreaterThan(0);
      });
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createFittsTrial).toBe("function");
      expect(typeof timelineUnits.createFittsBlock).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.calculateID).toBe("function");
      expect(typeof timelineUnits.createFittsHTML).toBe("function");
    });
  });

  describe("index of difficulty calculation", () => {
    it("should calculate ID correctly", () => {
      // ID = log2(2D/W)
      // D=200, W=50 -> ID = log2(400/50) = log2(8) = 3
      const id = timelineUnits.calculateID(200, 50);
      expect(id).toBe(3);
    });

    it("should increase ID with distance", () => {
      const id1 = timelineUnits.calculateID(100, 50);
      const id2 = timelineUnits.calculateID(200, 50);
      expect(id2).toBeGreaterThan(id1);
    });

    it("should increase ID with smaller width", () => {
      const id1 = timelineUnits.calculateID(200, 60);
      const id2 = timelineUnits.calculateID(200, 30);
      expect(id2).toBeGreaterThan(id1);
    });
  });

  describe("Fitts HTML generation", () => {
    it("should create HTML with left and right targets", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const html = timelineUnits.createFittsHTML(config, 60, 200, "left");
      expect(html).toContain("fitts-left");
      expect(html).toContain("fitts-right");
    });

    it("should set correct target width", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const html = timelineUnits.createFittsHTML(config, 80, 200, "left");
      expect(html).toContain("width: 80px");
    });

    it("should show only the active target", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const htmlLeft = timelineUnits.createFittsHTML(config, 60, 200, "left");
      // Left target visible, right hidden
      expect(htmlLeft).toMatch(/fitts-left.*display: block/s);
      expect(htmlLeft).toMatch(/fitts-right.*display: none/s);

      const htmlRight = timelineUnits.createFittsHTML(config, 60, 200, "right");
      expect(htmlRight).toMatch(/fitts-left.*display: none/s);
      expect(htmlRight).toMatch(/fitts-right.*display: block/s);
    });

    it("should use target color from config", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        targetColor: "#FF0000",
        text: utils.text,
      };
      const html = timelineUnits.createFittsHTML(config, 60, 200, "left");
      expect(html).toContain("#FF0000");
    });
  });

  describe("text customization", () => {
    it("should use custom text when provided", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, {
          showInstructions: true,
          requireLandscape: false,
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
    it("should accept custom conditions", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        conditions: [
          { width: 40, distance: 150 },
          { width: 80, distance: 300 },
        ],
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom taps per condition", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        tapsPerCondition: 15,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom repetitions", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        repetitionsPerCondition: 3,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom target color", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        targetColor: "#FF0000",
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom number of practice conditions", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numPracticeConditions: 3,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("default text", () => {
    it("should have all required text fields", () => {
      expect(utils.text.continue_button).toBeDefined();
      expect(utils.text.start_button).toBeDefined();
      expect(utils.text.orientation_message).toBeDefined();
      expect(utils.text.instruction_intro).toBeDefined();
      expect(utils.text.instruction_practice).toBeDefined();
      expect(utils.text.instruction_task).toBeDefined();
      expect(utils.text.ready_prompt).toBeDefined();
      expect(utils.text.task_complete).toBeDefined();
      expect(typeof utils.text.result_summary).toBe("function");
    });
  });

  describe("Fitts trial creation", () => {
    it("should create Fitts trial", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createFittsTrial(
        jsPsych,
        config,
        { width: 60, distance: 200 },
        1,
        false
      );
      expect(trial).toBeDefined();
      expect(trial.data.target_width).toBe(60);
      expect(trial.data.target_distance).toBe(200);
    });

    it("should calculate ID for trial", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createFittsTrial(
        jsPsych,
        config,
        { width: 50, distance: 200 },
        1,
        false
      );
      expect(trial.data.index_of_difficulty).toBe(3); // log2(400/50) = 3
    });
  });

  describe("Fitts block creation", () => {
    it("should create block with correct number of trials", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const conditions = [
        { width: 60, distance: 200 },
        { width: 40, distance: 200 },
      ];
      const block = timelineUnits.createFittsBlock(jsPsych, config, conditions, 2, false);
      // 2 conditions * 2 repetitions = 4 trials
      expect(block.timeline.length).toBe(4);
    });
  });
});
