import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, timelineUnits, utils } from ".";

describe("Digit Span Task", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  describe("createTimeline", () => {
    it("should create timeline with default config", () => {
      const timeline = createTimeline(jsPsych);

      expect(timeline).toHaveProperty("timeline");
      expect(Array.isArray(timeline.timeline)).toBe(true);
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should create timeline for forward mode only", () => {
      const timeline = createTimeline(jsPsych, { mode: "forward" });

      expect(timeline).toHaveProperty("timeline");
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should create timeline for backward mode only", () => {
      const timeline = createTimeline(jsPsych, { mode: "backward" });

      expect(timeline).toHaveProperty("timeline");
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should create timeline for both modes", () => {
      const forward = createTimeline(jsPsych, { mode: "forward", showInstructions: false });
      const both = createTimeline(jsPsych, { mode: "both", showInstructions: false });

      // Both modes should have more timeline items than forward only
      expect(both.timeline.length).toBeGreaterThan(forward.timeline.length);
    });

    it("should create timeline without instructions when showInstructions is false", () => {
      const withInstructions = createTimeline(jsPsych, { showInstructions: true });
      const withoutInstructions = createTimeline(jsPsych, { showInstructions: false });

      expect(withoutInstructions.timeline.length).toBeLessThan(withInstructions.timeline.length);
    });

    it("should include transition between forward and backward when mode is both", () => {
      const timeline = createTimeline(jsPsych, {
        mode: "both",
        showInstructions: false,
        numPracticeTrials: 0,
      });

      // Look for the transition trial between modes
      const hasTransition = timeline.timeline.some((item: any) => {
        if (item.type && item.data?.trial_type === "transition") {
          return true;
        }
        return false;
      });

      expect(hasTransition).toBe(true);
    });

    it("should skip practice block when numPracticeTrials is 0", () => {
      const withPractice = createTimeline(jsPsych, {
        numPracticeTrials: 2,
        showInstructions: false,
        mode: "forward",
      });
      const withoutPractice = createTimeline(jsPsych, {
        numPracticeTrials: 0,
        showInstructions: false,
        mode: "forward",
      });

      // Without practice should have fewer timeline items
      expect(withoutPractice.timeline.length).toBeLessThan(withPractice.timeline.length);
    });
  });

  describe("timelineUnits", () => {
    const mockConfig = {
      mode: "forward" as const,
      showInstructions: true,
      showFeedback: true,
      numPracticeTrials: 2,
      numTestTrials: 14,
      startingSpan: 4,
      minSpan: 2,
      maxSpan: 10,
      practiceSpan: 3,
      readyDuration: 800,
      digitDuration: 1000,
      feedbackDuration: 1500,
      interTrialInterval: 1500,
      text: utils.text,
    };

    it("should create interactive instructions for forward mode", () => {
      const instructions = timelineUnits.createInteractiveInstructions(jsPsych, mockConfig, "forward");

      expect(instructions).toHaveProperty("timeline");
      expect(Array.isArray(instructions.timeline)).toBe(true);
      expect(instructions.timeline.length).toBeGreaterThan(0);
    });

    it("should create interactive instructions for backward mode", () => {
      const instructions = timelineUnits.createInteractiveInstructions(jsPsych, mockConfig, "backward");

      expect(instructions).toHaveProperty("timeline");
      expect(Array.isArray(instructions.timeline)).toBe(true);
    });

    it("should create ready trial with correct duration", () => {
      const ready = timelineUnits.createReadyTrial(mockConfig);

      expect(ready).toHaveProperty("type");
      expect(ready).toHaveProperty("trial_duration");
      expect(ready.trial_duration).toBe(800);
      expect(ready.data.trial_type).toBe("ready");
    });

    it("should create digit presentation trials", () => {
      const digits = [3, 7, 2];
      const trials = timelineUnits.createDigitPresentationTrials(digits, mockConfig);

      expect(Array.isArray(trials)).toBe(true);
      expect(trials.length).toBe(3);
      trials.forEach((trial, i) => {
        expect(trial.trial_duration).toBe(1000);
        expect(trial.data.digit).toBe(digits[i]);
      });
    });

    it("should create response trial for forward mode", () => {
      const response = timelineUnits.createResponseTrial(
        jsPsych,
        mockConfig,
        "forward",
        [3, 7],
        "test",
        1,
        2
      );

      expect(response).toHaveProperty("type");
      expect(response.data.phase).toBe("test");
      expect(response.data.mode).toBe("forward");
      expect(response.data.span_length).toBe(2);
      expect(response.data.correct_response).toBe("37");
    });

    it("should create response trial for backward mode with reversed response", () => {
      const response = timelineUnits.createResponseTrial(
        jsPsych,
        mockConfig,
        "backward",
        [3, 7],
        "test",
        1,
        2
      );

      expect(response.data.mode).toBe("backward");
      expect(response.data.correct_response).toBe("73"); // Reversed
    });

    it("should create feedback trial", () => {
      const feedback = timelineUnits.createFeedbackTrial(jsPsych, mockConfig);

      expect(feedback).toHaveProperty("type");
      expect(feedback).toHaveProperty("stimulus");
      expect(typeof feedback.stimulus).toBe("function");
      expect(feedback.trial_duration).toBe(1500);
    });

    it("should create ITI trial with correct duration", () => {
      const iti = timelineUnits.createItiTrial(mockConfig);

      expect(iti).toHaveProperty("type");
      expect(iti.trial_duration).toBe(1500);
      expect(iti.data.trial_type).toBe("iti");
    });

    it("should create transition trial", () => {
      const transition = timelineUnits.createTransitionTrial("Test message", "Continue");

      expect(transition).toHaveProperty("type");
      expect(transition).toHaveProperty("stimulus");
      expect(transition.stimulus).toContain("Test message");
      expect(transition.choices).toEqual(["Continue"]);
    });

    it("should create practice block", () => {
      const practice = timelineUnits.createPracticeBlock(jsPsych, mockConfig, "forward");

      expect(practice).toHaveProperty("timeline");
      expect(Array.isArray(practice.timeline)).toBe(true);
    });

    it("should create test block", () => {
      const test = timelineUnits.createTestBlock(jsPsych, mockConfig, "forward");

      expect(test).toHaveProperty("timeline");
      expect(test).toHaveProperty("loop_function");
      expect(typeof test.loop_function).toBe("function");
    });
  });

  describe("utils.digits", () => {
    it("should generate digit sequence of correct length", () => {
      const sequence = utils.digits.generateDigitSequence(5);

      expect(Array.isArray(sequence)).toBe(true);
      expect(sequence.length).toBe(5);
    });

    it("should generate unique digits (no repeats)", () => {
      const sequence = utils.digits.generateDigitSequence(10);

      const uniqueDigits = new Set(sequence);
      expect(uniqueDigits.size).toBe(10);
    });

    it("should only contain digits 0-9", () => {
      const sequence = utils.digits.generateDigitSequence(10);

      sequence.forEach((digit) => {
        expect(digit).toBeGreaterThanOrEqual(0);
        expect(digit).toBeLessThanOrEqual(9);
      });
    });

    it("should format digit sequence with dashes", () => {
      const formatted = utils.digits.formatDigitSequence([3, 7, 2]);

      expect(formatted).toBe("3-7-2");
    });

    it("should calculate next span correctly on correct response", () => {
      const nextSpan = utils.digits.getNextSpanLength(4, true, 2, 10);

      expect(nextSpan).toBe(5); // Increase by 1
    });

    it("should calculate next span correctly on incorrect response", () => {
      const nextSpan = utils.digits.getNextSpanLength(4, false, 2, 10);

      expect(nextSpan).toBe(3); // Decrease by 1
    });

    it("should not exceed max span", () => {
      const nextSpan = utils.digits.getNextSpanLength(10, true, 2, 10);

      expect(nextSpan).toBe(10); // Stays at max
    });

    it("should not go below min span", () => {
      const nextSpan = utils.digits.getNextSpanLength(2, false, 2, 10);

      expect(nextSpan).toBe(2); // Stays at min
    });
  });

  describe("utils.scoring", () => {
    it("should return empty scores for no data", () => {
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.forwardMaxSpan).toBeNull();
      expect(scores.backwardMaxSpan).toBeNull();
      expect(scores.forwardTotalCorrect).toBe(0);
      expect(scores.backwardTotalCorrect).toBe(0);
    });

    it("should calculate forward scores correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "digit-span",
        phase: "test",
        mode: "forward",
        trial_type: "response",
        span_length: 4,
        correct: true,
      });
      dataCollection.push({
        task: "digit-span",
        phase: "test",
        mode: "forward",
        trial_type: "response",
        span_length: 5,
        correct: true,
      });
      dataCollection.push({
        task: "digit-span",
        phase: "test",
        mode: "forward",
        trial_type: "response",
        span_length: 6,
        correct: false,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.forwardMaxSpan).toBe(5);
      expect(scores.forwardTotalCorrect).toBe(2);
      expect(scores.forwardTrials).toBe(3);
      expect(scores.forwardMeanSpan).toBe(4.5); // (4 + 5) / 2
    });

    it("should calculate backward scores correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "digit-span",
        phase: "test",
        mode: "backward",
        trial_type: "response",
        span_length: 3,
        correct: true,
      });
      dataCollection.push({
        task: "digit-span",
        phase: "test",
        mode: "backward",
        trial_type: "response",
        span_length: 4,
        correct: true,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.backwardMaxSpan).toBe(4);
      expect(scores.backwardTotalCorrect).toBe(2);
      expect(scores.backwardTrials).toBe(2);
    });

    it("should include task info in getSummary", () => {
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary).toHaveProperty("taskName", "digit-span");
      expect(summary).toHaveProperty("version");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("digit-span");
      expect(utils.constants.VERSION).toBeDefined();
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have correct default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;

      expect(defaults.mode).toBe("forward");
      expect(defaults.showInstructions).toBe(true);
      expect(defaults.showFeedback).toBe(true);
      expect(defaults.numPracticeTrials).toBe(2);
      expect(defaults.numTestTrials).toBe(14);
      expect(defaults.startingSpan).toBe(4);
      expect(defaults.minSpan).toBe(2);
      expect(defaults.maxSpan).toBe(10);
      expect(defaults.practiceSpan).toBe(3);
      expect(defaults.readyDuration).toBe(800);
      expect(defaults.digitDuration).toBe(1000);
      expect(defaults.feedbackDuration).toBe(1500);
      expect(defaults.interTrialInterval).toBe(1500);
    });
  });

  describe("utils.text", () => {
    it("should export default text configuration", () => {
      expect(utils.text).toBeDefined();
      expect(utils.text.continue_button).toBe("Continue");
      expect(utils.text.clear_button).toBe("Clear");
      expect(utils.text.done_button).toBe("Done");
      expect(utils.text.ready_prompt).toBe("Ready");
      expect(utils.text.correct_feedback).toBeDefined();
      expect(typeof utils.text.incorrect_feedback).toBe("function");
    });

    it("should have instruction text strings", () => {
      expect(utils.text.instruction_intro_forward).toBeDefined();
      expect(utils.text.instruction_response_forward).toBeDefined();
      expect(utils.text.instruction_intro_backward).toBeDefined();
      expect(utils.text.instruction_try_forward).toBeDefined();
      expect(utils.text.instruction_try_backward).toBeDefined();
      expect(utils.text.instruction_success).toBeDefined();
      expect(utils.text.instruction_failure).toBeDefined();
    });

    it("should have phase transition text", () => {
      expect(utils.text.practice_complete_forward).toBeDefined();
      expect(utils.text.practice_complete_backward).toBeDefined();
      expect(utils.text.forward_complete).toBeDefined();
    });
  });
});
