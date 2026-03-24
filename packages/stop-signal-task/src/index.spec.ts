import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Stop Signal Task", () => {
  describe("createTimeline", () => {
    it("should create a timeline object with default params", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych);
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should create a timeline with custom options", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numTestTrials: 96,
        numPracticeTrials: 12,
        fixationDuration: 300,
      });
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("instructions", () => {
    it("should show instructions when enabled", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true }).timeline
      );
      expect(displayElement.innerHTML).toContain("Stop Signal Task");
      expect(displayElement.innerHTML).toContain("arrow");
    });

    it("should skip instructions when disabled", () => {
      const jsPsych = initJsPsych();
      const withInstructions = createTimeline(jsPsych, {
        showInstructions: true,
      });
      const withoutInstructions = createTimeline(jsPsych, {
        showInstructions: false,
      });
      expect(withoutInstructions.timeline.length).toBeLessThan(
        withInstructions.timeline.length
      );
    });
  });

  describe("practice configuration", () => {
    it("should include practice when numPracticeTrials > 0", () => {
      const jsPsych = initJsPsych();
      const withPractice = createTimeline(jsPsych, {
        numPracticeTrials: 12,
        showInstructions: false,
      });
      const withoutPractice = createTimeline(jsPsych, {
        numPracticeTrials: 0,
        showInstructions: false,
      });
      expect(withoutPractice.timeline.length).toBeLessThan(
        withPractice.timeline.length
      );
    });
  });

  describe("trial sequence generation", () => {
    it("should generate the requested number of trials", () => {
      const sequence = utils.stimuli.generateTrialSequence(100, 0.25, 3, 5);
      expect(sequence.length).toBe(100);
    });

    it("should respect stopProbability", () => {
      const sequence = utils.stimuli.generateTrialSequence(100, 0.25, 100, 100);
      const stopTrials = sequence.filter((t) => t.trial_type_sst === "stop");
      expect(stopTrials.length).toBe(25);
    });

    it("should balance left and right directions for go trials", () => {
      const sequence = utils.stimuli.generateTrialSequence(100, 0.25, 100, 100);
      const goTrials = sequence.filter((t) => t.trial_type_sst === "go");
      const goLeft = goTrials.filter((t) => t.direction === "left");
      const goRight = goTrials.filter((t) => t.direction === "right");
      // Should be approximately balanced (within 1 due to rounding)
      expect(Math.abs(goLeft.length - goRight.length)).toBeLessThanOrEqual(1);
    });

    it("should balance left and right directions for stop trials", () => {
      const sequence = utils.stimuli.generateTrialSequence(100, 0.25, 100, 100);
      const stopTrials = sequence.filter((t) => t.trial_type_sst === "stop");
      const stopLeft = stopTrials.filter((t) => t.direction === "left");
      const stopRight = stopTrials.filter((t) => t.direction === "right");
      expect(Math.abs(stopLeft.length - stopRight.length)).toBeLessThanOrEqual(1);
    });

    it("should respect maxConsecutiveStop constraint", () => {
      const maxConsecutiveStop = 3;
      const sequence = utils.stimuli.generateTrialSequence(
        100,
        0.25,
        maxConsecutiveStop,
        100
      );

      let consecutiveCount = 1;
      for (let i = 1; i < sequence.length; i++) {
        if (
          sequence[i].trial_type_sst === "stop" &&
          sequence[i - 1].trial_type_sst === "stop"
        ) {
          consecutiveCount++;
          expect(consecutiveCount).toBeLessThanOrEqual(maxConsecutiveStop);
        } else if (sequence[i].trial_type_sst === "stop") {
          consecutiveCount = 1;
        } else {
          consecutiveCount = 1;
        }
      }
    });

    it("should respect maxConsecutiveGo constraint", () => {
      const maxConsecutiveGo = 5;
      const sequence = utils.stimuli.generateTrialSequence(
        100,
        0.25,
        100,
        maxConsecutiveGo
      );

      let consecutiveCount = 1;
      for (let i = 1; i < sequence.length; i++) {
        if (
          sequence[i].trial_type_sst === "go" &&
          sequence[i - 1].trial_type_sst === "go"
        ) {
          consecutiveCount++;
          expect(consecutiveCount).toBeLessThanOrEqual(maxConsecutiveGo);
        } else if (sequence[i].trial_type_sst === "go") {
          consecutiveCount = 1;
        } else {
          consecutiveCount = 1;
        }
      }
    });

    it("should assign correct button indices", () => {
      const sequence = utils.stimuli.generateTrialSequence(100, 0.25, 3, 5);
      sequence.forEach((t) => {
        if (t.direction === "left") {
          expect(t.correct_response).toBe(utils.constants.LEFT_BUTTON_INDEX);
        } else {
          expect(t.correct_response).toBe(utils.constants.RIGHT_BUTTON_INDEX);
        }
      });
    });
  });

  describe("stimulus SVG generation", () => {
    it("should create arrow SVG data URIs", () => {
      const leftArrow = utils.stimuli.createArrowSVG("left");
      const rightArrow = utils.stimuli.createArrowSVG("right");
      expect(leftArrow).toContain("data:image/svg+xml,");
      expect(rightArrow).toContain("data:image/svg+xml,");
      expect(leftArrow).toContain("polygon");
      expect(rightArrow).toContain("polygon");
    });

    it("should create left arrow with rotation transform", () => {
      const leftArrow = utils.stimuli.createArrowSVG("left");
      expect(leftArrow).toContain("rotate");
    });

    it("should create right arrow without rotation transform", () => {
      const rightArrow = utils.stimuli.createArrowSVG("right");
      expect(rightArrow).not.toContain("rotate");
    });

    it("should create stop signal arrows with red color and X overlay", () => {
      const stopLeft = utils.stimuli.createStopArrowSVG("left");
      const stopRight = utils.stimuli.createStopArrowSVG("right");
      expect(stopLeft).toContain("data:image/svg+xml,");
      expect(stopRight).toContain("data:image/svg+xml,");
      expect(stopLeft).toContain("D32F2F");
      expect(stopRight).toContain("D32F2F");
      expect(stopLeft).toContain("line");
      expect(stopRight).toContain("line");
    });

    it("should accept custom colors for arrows", () => {
      const arrow = utils.stimuli.createArrowSVG("right", "#00FF00");
      expect(arrow).toContain("00FF00");
    });
  });

  describe("adaptive SSD tracker", () => {
    it("should start at initialSSD", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const tracker = timelineUnits.createSSDTracker(config);
      expect(tracker.getSSD()).toBe(250);
    });

    it("should increase SSD after successful stop", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const tracker = timelineUnits.createSSDTracker(config);
      const initialSSD = tracker.getSSD();
      tracker.update(true);
      expect(tracker.getSSD()).toBe(initialSSD + 50);
    });

    it("should decrease SSD after failed stop", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const tracker = timelineUnits.createSSDTracker(config);
      const initialSSD = tracker.getSSD();
      tracker.update(false);
      expect(tracker.getSSD()).toBe(initialSSD - 50);
    });

    it("should clamp SSD at maxSSD", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        initialSSD: 780,
        text: utils.text,
      };
      const tracker = timelineUnits.createSSDTracker(config);
      tracker.update(true); // 780 + 50 = 830, clamped to 800
      expect(tracker.getSSD()).toBe(800);
    });

    it("should clamp SSD at minSSD", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        initialSSD: 70,
        text: utils.text,
      };
      const tracker = timelineUnits.createSSDTracker(config);
      tracker.update(false); // 70 - 50 = 20, clamped to 50
      expect(tracker.getSSD()).toBe(50);
    });

    it("should use custom step size", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        ssdStep: 25,
        text: utils.text,
      };
      const tracker = timelineUnits.createSSDTracker(config);
      const initialSSD = tracker.getSSD();
      tracker.update(true);
      expect(tracker.getSSD()).toBe(initialSSD + 25);
    });
  });

  describe("scoring functions", () => {
    it("should handle empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.goAccuracy).toBe(0);
      expect(scores.stopAccuracy).toBe(0);
      expect(scores.meanGoRT).toBeNull();
      expect(scores.goRTStandardDeviation).toBeNull();
      expect(scores.meanSSD).toBeNull();
      expect(scores.ssrt).toBeNull();
      expect(scores.commissionErrors).toBe(0);
      expect(scores.omissionErrors).toBe(0);
      expect(scores.totalGoTrials).toBe(0);
      expect(scores.totalStopTrials).toBe(0);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("goAccuracy");
      expect(scores).toHaveProperty("stopAccuracy");
      expect(scores).toHaveProperty("meanGoRT");
      expect(scores).toHaveProperty("goRTStandardDeviation");
      expect(scores).toHaveProperty("meanSSD");
      expect(scores).toHaveProperty("ssrt");
      expect(scores).toHaveProperty("commissionErrors");
      expect(scores).toHaveProperty("omissionErrors");
      expect(scores).toHaveProperty("totalGoTrials");
      expect(scores).toHaveProperty("totalStopTrials");
    });
  });

  describe("getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("stop-signal-task");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("text customization", () => {
    it("should use custom text when provided", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, {
          showInstructions: true,
          text: {
            instruction_intro: "<p>Custom SST intro text</p>",
            continue_button: "Next",
          },
        }).timeline
      );

      expect(displayElement.innerHTML).toContain("Custom SST intro text");
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

  describe("constants export", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("stop-signal-task");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.numTestTrials).toBe(192);
      expect(defaults.numPracticeTrials).toBe(24);
      expect(defaults.fixationDuration).toBe(500);
      expect(defaults.responseDuration).toBe(1500);
      expect(defaults.feedbackDuration).toBe(400);
      expect(defaults.interTrialInterval).toBe(1000);
      expect(defaults.stopProbability).toBe(0.25);
      expect(defaults.initialSSD).toBe(250);
      expect(defaults.ssdStep).toBe(50);
      expect(defaults.minSSD).toBe(50);
      expect(defaults.maxSSD).toBe(800);
      expect(defaults.maxConsecutiveStop).toBe(3);
      expect(defaults.maxConsecutiveGo).toBe(5);
    });
  });

  describe("timeline units export", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createFixationTrial).toBe("function");
      expect(typeof timelineUnits.createStimulusTrial).toBe("function");
      expect(typeof timelineUnits.createFeedbackTrial).toBe("function");
      expect(typeof timelineUnits.createItiTrial).toBe("function");
      expect(typeof timelineUnits.createTransitionTrial).toBe("function");
      expect(typeof timelineUnits.createPracticeBlock).toBe("function");
      expect(typeof timelineUnits.createTestBlock).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.createSSDTracker).toBe("function");
    });
  });

  describe("default text", () => {
    it("should have all required text fields", () => {
      expect(utils.text.continue_button).toBeDefined();
      expect(utils.text.left_button).toBeDefined();
      expect(utils.text.right_button).toBeDefined();
      expect(utils.text.instruction_intro).toBeDefined();
      expect(utils.text.instruction_response).toBeDefined();
      expect(utils.text.instruction_stop_signal).toBeDefined();
      expect(utils.text.instruction_strategy).toBeDefined();
      expect(utils.text.instruction_practice_intro).toBeDefined();
      expect(utils.text.correct_go_feedback).toBeDefined();
      expect(utils.text.incorrect_go_feedback).toBeDefined();
      expect(utils.text.timeout_go_feedback).toBeDefined();
      expect(utils.text.successful_stop_feedback).toBeDefined();
      expect(utils.text.failed_stop_feedback).toBeDefined();
      expect(utils.text.fixation).toBeDefined();
      expect(utils.text.practice_complete).toBeDefined();
      expect(utils.text.task_complete).toBeDefined();
      expect(typeof utils.text.result_summary).toBe("function");
    });
  });
});
