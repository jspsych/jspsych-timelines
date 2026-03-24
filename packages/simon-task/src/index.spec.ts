import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Simon Task", () => {
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
        numTestTrials: 60,
        numPracticeTrials: 8,
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
      expect(displayElement.innerHTML).toContain("Simon Task");
      expect(displayElement.innerHTML).toContain("color");
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

  describe("trial conditions generation", () => {
    it("should generate congruent and incongruent conditions without neutral", () => {
      const conditions = utils.stimuli.generateTrialConditions(
        utils.constants.DEFAULT_STIMULUS_FEATURES,
        false
      );
      // 2 features x 2 conditions (congruent, incongruent) = 4
      expect(conditions.length).toBe(4);
      const congruent = conditions.filter((c) => c.congruence === "congruent");
      const incongruent = conditions.filter(
        (c) => c.congruence === "incongruent"
      );
      expect(congruent.length).toBe(2);
      expect(incongruent.length).toBe(2);
    });

    it("should include neutral conditions when requested", () => {
      const conditions = utils.stimuli.generateTrialConditions(
        utils.constants.DEFAULT_STIMULUS_FEATURES,
        true
      );
      // 2 features x 3 conditions (congruent, incongruent, neutral) = 6
      expect(conditions.length).toBe(6);
      const neutral = conditions.filter((c) => c.congruence === "neutral");
      expect(neutral.length).toBe(2);
    });

    it("should assign correct response buttons based on feature side", () => {
      const conditions = utils.stimuli.generateTrialConditions(
        utils.constants.DEFAULT_STIMULUS_FEATURES,
        false
      );

      // RED is left (button index 0), BLUE is right (button index 1)
      const redTrials = conditions.filter((c) => c.stimulus_label === "RED");
      redTrials.forEach((t) => {
        expect(t.correct_response).toBe(utils.constants.LEFT_BUTTON_INDEX);
      });

      const blueTrials = conditions.filter((c) => c.stimulus_label === "BLUE");
      blueTrials.forEach((t) => {
        expect(t.correct_response).toBe(utils.constants.RIGHT_BUTTON_INDEX);
      });
    });

    it("should place congruent stimuli on same side as their button", () => {
      const conditions = utils.stimuli.generateTrialConditions(
        utils.constants.DEFAULT_STIMULUS_FEATURES,
        false
      );
      const congruent = conditions.filter((c) => c.congruence === "congruent");

      // RED is left-side feature, so congruent RED should appear on left
      const redCongruent = congruent.find((c) => c.stimulus_label === "RED");
      expect(redCongruent!.stimulus_side).toBe("left");

      // BLUE is right-side feature, so congruent BLUE should appear on right
      const blueCongruent = congruent.find((c) => c.stimulus_label === "BLUE");
      expect(blueCongruent!.stimulus_side).toBe("right");
    });

    it("should place incongruent stimuli on opposite side from their button", () => {
      const conditions = utils.stimuli.generateTrialConditions(
        utils.constants.DEFAULT_STIMULUS_FEATURES,
        false
      );
      const incongruent = conditions.filter(
        (c) => c.congruence === "incongruent"
      );

      const redIncongruent = incongruent.find(
        (c) => c.stimulus_label === "RED"
      );
      expect(redIncongruent!.stimulus_side).toBe("right");

      const blueIncongruent = incongruent.find(
        (c) => c.stimulus_label === "BLUE"
      );
      expect(blueIncongruent!.stimulus_side).toBe("left");
    });

    it("should place neutral stimuli at center", () => {
      const conditions = utils.stimuli.generateTrialConditions(
        utils.constants.DEFAULT_STIMULUS_FEATURES,
        true
      );
      const neutral = conditions.filter((c) => c.congruence === "neutral");
      neutral.forEach((t) => {
        expect(t.stimulus_side).toBe("center");
      });
    });
  });

  describe("trial sequence generation", () => {
    it("should generate the requested number of trials", () => {
      const sequence = utils.stimuli.generateTrialSequence(
        utils.constants.DEFAULT_STIMULUS_FEATURES,
        100,
        0.5,
        false,
        4
      );
      expect(sequence.length).toBe(100);
    });

    it("should respect proportionCongruent", () => {
      const sequence = utils.stimuli.generateTrialSequence(
        utils.constants.DEFAULT_STIMULUS_FEATURES,
        100,
        0.75,
        false,
        100 // no constraint for this test
      );
      const congruent = sequence.filter((t) => t.congruence === "congruent");
      expect(congruent.length).toBe(75);
    });

    it("should include all three congruency types when neutral is enabled", () => {
      const sequence = utils.stimuli.generateTrialSequence(
        utils.constants.DEFAULT_STIMULUS_FEATURES,
        90,
        0.33,
        true,
        100
      );
      const congruent = sequence.filter((t) => t.congruence === "congruent");
      const incongruent = sequence.filter(
        (t) => t.congruence === "incongruent"
      );
      const neutral = sequence.filter((t) => t.congruence === "neutral");

      expect(congruent.length).toBeGreaterThan(0);
      expect(incongruent.length).toBeGreaterThan(0);
      expect(neutral.length).toBeGreaterThan(0);
      expect(congruent.length + incongruent.length + neutral.length).toBe(90);
    });

    it("should respect maxConsecutiveSameType constraint", () => {
      const maxConsecutive = 3;
      const sequence = utils.stimuli.generateTrialSequence(
        utils.constants.DEFAULT_STIMULUS_FEATURES,
        100,
        0.5,
        false,
        maxConsecutive
      );

      // Check no more than maxConsecutive consecutive same congruence
      let consecutiveCount = 1;
      for (let i = 1; i < sequence.length; i++) {
        if (sequence[i].congruence === sequence[i - 1].congruence) {
          consecutiveCount++;
          expect(consecutiveCount).toBeLessThanOrEqual(maxConsecutive);
        } else {
          consecutiveCount = 1;
        }
      }
    });
  });

  describe("scoring functions", () => {
    it("should handle empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.accuracy).toBe(0);
      expect(scores.meanRT).toBeNull();
      expect(scores.congruentAccuracy).toBe(0);
      expect(scores.incongruentAccuracy).toBe(0);
      expect(scores.neutralAccuracy).toBeNull();
      expect(scores.congruentRT).toBeNull();
      expect(scores.incongruentRT).toBeNull();
      expect(scores.neutralRT).toBeNull();
      expect(scores.simonEffectRT).toBeNull();
      expect(scores.simonEffectAccuracy).toBe(0);
      expect(scores.facilitationRT).toBeNull();
      expect(scores.interferenceRT).toBeNull();
      expect(scores.totalTrials).toBe(0);
      expect(scores.correctTrials).toBe(0);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("accuracy");
      expect(scores).toHaveProperty("meanRT");
      expect(scores).toHaveProperty("congruentAccuracy");
      expect(scores).toHaveProperty("incongruentAccuracy");
      expect(scores).toHaveProperty("neutralAccuracy");
      expect(scores).toHaveProperty("congruentRT");
      expect(scores).toHaveProperty("incongruentRT");
      expect(scores).toHaveProperty("neutralRT");
      expect(scores).toHaveProperty("simonEffectRT");
      expect(scores).toHaveProperty("simonEffectAccuracy");
      expect(scores).toHaveProperty("facilitationRT");
      expect(scores).toHaveProperty("interferenceRT");
      expect(scores).toHaveProperty("totalTrials");
      expect(scores).toHaveProperty("correctTrials");
    });
  });

  describe("getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("simon-task");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("block configuration", () => {
    it("should create multiple blocks with rest screens", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numBlocks: 3,
        numTestTrials: 30,
        showInstructions: false,
        numPracticeTrials: 0,
      });
      // 3 test blocks + 2 rest screens + 1 completion = 6
      expect(timeline.timeline.length).toBe(6);
    });

    it("should create single block without rest screens", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numBlocks: 1,
        numTestTrials: 30,
        showInstructions: false,
        numPracticeTrials: 0,
      });
      // 1 test block + 1 completion = 2
      expect(timeline.timeline.length).toBe(2);
    });
  });

  describe("text customization", () => {
    it("should use custom text when provided", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, {
          showInstructions: true,
          text: {
            instruction_intro: "<p>Custom Simon intro text</p>",
            continue_button: "Next",
          },
        }).timeline
      );

      expect(displayElement.innerHTML).toContain("Custom Simon intro text");
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
      expect(utils.constants.TASK_NAME).toBe("simon-task");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
      expect(utils.constants.DEFAULT_STIMULUS_FEATURES).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.numTestTrials).toBe(100);
      expect(defaults.numPracticeTrials).toBe(12);
      expect(defaults.fixationDuration).toBe(500);
      expect(defaults.responseDuration).toBe(2000);
      expect(defaults.feedbackDuration).toBe(400);
      expect(defaults.interTrialInterval).toBe(1000);
      expect(defaults.includeNeutral).toBe(false);
      expect(defaults.proportionCongruent).toBe(0.5);
      expect(defaults.maxConsecutiveSameType).toBe(4);
    });

    it("should have valid default stimulus features", () => {
      const features = utils.constants.DEFAULT_STIMULUS_FEATURES;
      expect(features.length).toBe(2);
      expect(features[0].label).toBe("RED");
      expect(features[0].side).toBe("left");
      expect(features[1].label).toBe("BLUE");
      expect(features[1].side).toBe("right");
    });
  });

  describe("timeline units export", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createFixationTrial).toBe("function");
      expect(typeof timelineUnits.createStimulusTrial).toBe("function");
      expect(typeof timelineUnits.createFeedbackTrial).toBe("function");
      expect(typeof timelineUnits.createItiTrial).toBe("function");
      expect(typeof timelineUnits.createRestScreen).toBe("function");
      expect(typeof timelineUnits.createTransitionTrial).toBe("function");
      expect(typeof timelineUnits.createPracticeBlock).toBe("function");
      expect(typeof timelineUnits.createTestBlock).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
    });
  });

  describe("default text", () => {
    it("should have all required text fields", () => {
      expect(utils.text.continue_button).toBeDefined();
      expect(utils.text.instruction_intro).toBeDefined();
      expect(typeof utils.text.instruction_response).toBe("function");
      expect(utils.text.instruction_congruent_example).toBeDefined();
      expect(utils.text.instruction_incongruent_example).toBeDefined();
      expect(utils.text.instruction_practice_intro).toBeDefined();
      expect(utils.text.correct_feedback).toBeDefined();
      expect(utils.text.incorrect_feedback).toBeDefined();
      expect(utils.text.timeout_feedback).toBeDefined();
      expect(utils.text.fixation).toBeDefined();
      expect(utils.text.practice_complete).toBeDefined();
      expect(typeof utils.text.block_complete).toBe("function");
      expect(utils.text.task_complete).toBeDefined();
      expect(typeof utils.text.result_summary).toBe("function");
    });
  });

  describe("stimulus HTML generation", () => {
    it("should generate HTML with correct position for left", () => {
      const html = utils.stimuli.generateStimulusHtml("#D32F2F", "left");
      expect(html).toContain("left: 25%");
      expect(html).toContain("background-color: #D32F2F");
      expect(html).toContain("simon-stimulus");
    });

    it("should generate HTML with correct position for right", () => {
      const html = utils.stimuli.generateStimulusHtml("#1976D2", "right");
      expect(html).toContain("left: 75%");
      expect(html).toContain("background-color: #1976D2");
    });

    it("should generate HTML with correct position for center", () => {
      const html = utils.stimuli.generateStimulusHtml("#D32F2F", "center");
      expect(html).toContain("left: 50%");
    });
  });
});
