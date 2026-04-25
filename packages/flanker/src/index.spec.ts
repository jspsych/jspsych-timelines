import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, timelineUnits, utils } from ".";

describe("Flanker Task", () => {
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

    it("should create timeline without instructions when showInstructions is false", () => {
      const withInstructions = createTimeline(jsPsych, { showInstructions: true });
      const withoutInstructions = createTimeline(jsPsych, { showInstructions: false });

      expect(withoutInstructions.timeline.length).toBeLessThan(withInstructions.timeline.length);
    });

    it("should create timeline without practice when numPracticeTrials is 0", () => {
      const withPractice = createTimeline(jsPsych, { numPracticeTrials: 12, showInstructions: false });
      const withoutPractice = createTimeline(jsPsych, { numPracticeTrials: 0, showInstructions: false });

      expect(withoutPractice.timeline.length).toBeLessThan(withPractice.timeline.length);
    });

    it("should support custom number of blocks", () => {
      const singleBlock = createTimeline(jsPsych, {
        numBlocks: 1,
        showInstructions: false,
        numPracticeTrials: 0
      });
      const multipleBlocks = createTimeline(jsPsych, {
        numBlocks: 3,
        showInstructions: false,
        numPracticeTrials: 0
      });

      // Multiple blocks should have more timeline items (blocks + transition screens)
      expect(multipleBlocks.timeline.length).toBeGreaterThan(singleBlock.timeline.length);
    });

    it("should apply custom fixationDuration to fixation trials", () => {
      const config = {
        fixationDuration: 1000,
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
      };
      const timeline = createTimeline(jsPsych, config);

      // The test block has timeline with fixation as first element
      const testBlock = timeline.timeline[0] as any;
      const fixationTrial = testBlock.timeline[0];

      expect(fixationTrial.trial_duration).toBe(1000);
    });

    it("should apply custom responseDuration to stimulus trials", () => {
      const config = {
        responseDuration: 3000,
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
      };
      const timeline = createTimeline(jsPsych, config);

      const testBlock = timeline.timeline[0] as any;
      const stimulusTrial = testBlock.timeline[1];

      expect(stimulusTrial.trial_duration).toBe(3000);
    });

    it("should apply custom interTrialInterval to ITI trials", () => {
      const config = {
        interTrialInterval: 1500,
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
        showTestFeedback: false,
      };
      const timeline = createTimeline(jsPsych, config);

      const testBlock = timeline.timeline[0] as any;
      // Without feedback: [fixation, stimulus, iti]
      const itiTrial = testBlock.timeline[2];

      expect(itiTrial.trial_duration).toBe(1500);
    });

    it("should apply custom feedbackDuration when feedback is shown", () => {
      const config = {
        feedbackDuration: 800,
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
        showTestFeedback: true,
      };
      const timeline = createTimeline(jsPsych, config);

      const testBlock = timeline.timeline[0] as any;
      // With feedback: [fixation, stimulus, feedback, iti]
      const feedbackTrial = testBlock.timeline[2];

      expect(feedbackTrial.trial_duration).toBe(800);
    });

    it("should exclude neutral trials from timeline_variables when includeNeutral is false", () => {
      const config = {
        includeNeutral: false,
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
      };
      const timeline = createTimeline(jsPsych, config);

      const testBlock = timeline.timeline[0] as any;
      const hasNeutral = testBlock.timeline_variables.some(
        (v: any) => v.congruence === "neutral"
      );

      expect(hasNeutral).toBe(false);
      expect(testBlock.timeline_variables.length).toBe(4); // 2 congruent + 2 incongruent
    });

    it("should include neutral trials in timeline_variables when includeNeutral is true", () => {
      const config = {
        includeNeutral: true,
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
      };
      const timeline = createTimeline(jsPsych, config);

      const testBlock = timeline.timeline[0] as any;
      const hasNeutral = testBlock.timeline_variables.some(
        (v: any) => v.congruence === "neutral"
      );

      expect(hasNeutral).toBe(true);
      expect(testBlock.timeline_variables.length).toBe(6); // 2 congruent + 2 incongruent + 2 neutral
    });

    it("should use custom button labels in stimulus trials", () => {
      const config = {
        text: {
          left_button: "Izquierda",
          right_button: "Derecha",
        },
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
      };
      const timeline = createTimeline(jsPsych, config);

      const testBlock = timeline.timeline[0] as any;
      const stimulusTrial = testBlock.timeline[1];

      expect(stimulusTrial.choices).toEqual(["Izquierda", "Derecha"]);
    });

    it("should include feedback trial in test block when showTestFeedback is true", () => {
      const config = {
        showTestFeedback: true,
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
      };
      const timeline = createTimeline(jsPsych, config);

      const testBlock = timeline.timeline[0] as any;
      // With feedback: [fixation, stimulus, feedback, iti]
      expect(testBlock.timeline.length).toBe(4);
      expect(testBlock.timeline[2].data.part).toBe("feedback");
    });

    it("should exclude feedback trial from test block when showTestFeedback is false", () => {
      const config = {
        showTestFeedback: false,
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
      };
      const timeline = createTimeline(jsPsych, config);

      const testBlock = timeline.timeline[0] as any;
      // Without feedback: [fixation, stimulus, iti]
      expect(testBlock.timeline.length).toBe(3);
      const trialTypes = testBlock.timeline.map((t: any) => t.data.part);
      expect(trialTypes).not.toContain("feedback");
    });

    it("should include feedback trial in practice block when showPracticeFeedback is true", () => {
      const config = {
        showPracticeFeedback: true,
        showInstructions: false,
        numPracticeTrials: 6,
        numBlocks: 1,
      };
      const timeline = createTimeline(jsPsych, config);

      // First element is practice block, then transition, then test block
      const practiceBlock = timeline.timeline[0] as any;
      // With feedback: [fixation, stimulus, feedback, iti]
      expect(practiceBlock.timeline.length).toBe(4);
      expect(practiceBlock.timeline[2].data.part).toBe("feedback");
    });

    it("should exclude feedback trial from practice block when showPracticeFeedback is false", () => {
      const config = {
        showPracticeFeedback: false,
        showInstructions: false,
        numPracticeTrials: 6,
        numBlocks: 1,
      };
      const timeline = createTimeline(jsPsych, config);

      const practiceBlock = timeline.timeline[0] as any;
      // Without feedback: [fixation, stimulus, iti]
      expect(practiceBlock.timeline.length).toBe(3);
      const trialTypes = practiceBlock.timeline.map((t: any) => t.data.part);
      expect(trialTypes).not.toContain("feedback");
    });

    it("should set correct sample size based on numTestTrials", () => {
      const config = {
        numTestTrials: 60,
        includeNeutral: true, // 6 conditions
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
      };
      const timeline = createTimeline(jsPsych, config);

      const testBlock = timeline.timeline[0] as any;
      // 60 trials / 6 conditions = 10 repetitions
      expect(testBlock.sample.size).toBe(10);
    });

    it("should set correct sample size for practice based on numPracticeTrials", () => {
      const config = {
        numPracticeTrials: 12,
        includeNeutral: true, // 6 conditions
        showInstructions: false,
        numBlocks: 1,
      };
      const timeline = createTimeline(jsPsych, config);

      const practiceBlock = timeline.timeline[0] as any;
      // 12 trials / 6 conditions = 2 repetitions
      expect(practiceBlock.sample.size).toBe(2);
    });

    it("should create correct number of test blocks with transitions", () => {
      const config = {
        numBlocks: 3,
        showInstructions: false,
        numPracticeTrials: 0,
      };
      const timeline = createTimeline(jsPsych, config);

      // 3 blocks + 2 transition screens between them + 1 completion trial = 6 items
      // Block 1, Transition, Block 2, Transition, Block 3, Completion
      expect(timeline.timeline.length).toBe(6);

      // Verify block numbers in data
      const block1 = timeline.timeline[0] as any;
      const block2 = timeline.timeline[2] as any;
      const block3 = timeline.timeline[4] as any;

      expect(block1.timeline[1].data.block).toBe(1);
      expect(block2.timeline[1].data.block).toBe(2);
      expect(block3.timeline[1].data.block).toBe(3);
    });
  });

  describe("timelineUnits", () => {
    const mockConfig = {
      showInstructions: true,
      showPracticeFeedback: true,
      showTestFeedback: false,
      numPracticeTrials: 12,
      numTestTrials: 120,
      numBlocks: 1,
      fixationDuration: 500,
      responseDuration: 2000,
      feedbackDuration: 400,
      interTrialInterval: 1000,
      includeNeutral: true,
      text: utils.text,
    };

    it("should create instruction trials", () => {
      const instructions = timelineUnits.createInstructionTrials(mockConfig);

      expect(instructions).toHaveProperty("timeline");
      expect(Array.isArray(instructions.timeline)).toBe(true);
      expect(instructions.timeline.length).toBeGreaterThan(0);
    });

    it("should create fixation trial with correct duration", () => {
      const fixation = timelineUnits.createFixationTrial(mockConfig);

      expect(fixation).toHaveProperty("type");
      expect(fixation).toHaveProperty("trial_duration");
      expect(fixation.trial_duration).toBe(500);
      expect(fixation.data.part).toBe("fixation");
    });

    it("should create stimulus trial", () => {
      const stimulus = timelineUnits.createStimulusTrial(jsPsych, mockConfig, "test", 1);

      expect(stimulus).toHaveProperty("type");
      expect(stimulus).toHaveProperty("choices");
      expect(stimulus.choices).toHaveLength(2);
      expect(stimulus.trial_duration).toBe(2000);
      expect(stimulus.data.phase).toBe("test");
      expect(stimulus.data.block).toBe(1);
    });

    it("should create feedback trial", () => {
      const feedback = timelineUnits.createFeedbackTrial(jsPsych, mockConfig);

      expect(feedback).toHaveProperty("type");
      expect(feedback).toHaveProperty("stimulus");
      expect(typeof feedback.stimulus).toBe("function");
      expect(feedback.trial_duration).toBe(400);
    });

    it("should create ITI trial with correct duration", () => {
      const iti = timelineUnits.createItiTrial(mockConfig);

      expect(iti).toHaveProperty("type");
      expect(iti.trial_duration).toBe(1000);
      expect(iti.data.part).toBe("iti");
    });

    it("should create transition trial", () => {
      const transition = timelineUnits.createTransitionTrial("Test message", "Continue");

      expect(transition).toHaveProperty("type");
      expect(transition).toHaveProperty("stimulus");
      expect(transition.stimulus).toContain("Test message");
      expect(transition.choices).toEqual(["Continue"]);
    });

    it("should create practice block", () => {
      const practiceBlock = timelineUnits.createPracticeBlock(jsPsych, mockConfig);

      expect(practiceBlock).toHaveProperty("timeline");
      expect(practiceBlock).toHaveProperty("timeline_variables");
      expect(practiceBlock).toHaveProperty("sample");
      expect(Array.isArray(practiceBlock.timeline_variables)).toBe(true);
    });

    it("should create test block", () => {
      const testBlock = timelineUnits.createTestBlock(jsPsych, mockConfig, 1);

      expect(testBlock).toHaveProperty("timeline");
      expect(testBlock).toHaveProperty("timeline_variables");
      expect(testBlock).toHaveProperty("sample");
      expect(testBlock.sample.type).toBe("fixed-repetitions");
    });
  });

  describe("utils.stimuli", () => {
    it("should generate congruent left stimulus", () => {
      const html = utils.stimuli.generateStimulusHtml("left", "congruent");

      expect(html).toContain("stimulus-container");
      // Should contain SVG elements for the 5 arrows
      expect(html).toContain("svg");
    });

    it("should generate incongruent right stimulus", () => {
      const html = utils.stimuli.generateStimulusHtml("right", "incongruent");

      expect(html).toContain("stimulus-container");
    });

    it("should generate neutral stimulus", () => {
      const html = utils.stimuli.generateStimulusHtml("left", "neutral");

      expect(html).toContain("stimulus-container");
      expect(html).toContain("—"); // Neutral dash
    });

    it("should generate trial variables with neutral trials", () => {
      const variables = utils.stimuli.generateTrialVariables(true);

      expect(Array.isArray(variables)).toBe(true);
      expect(variables.length).toBe(6); // 2 congruent + 2 incongruent + 2 neutral
      expect(variables.some(v => v.congruence === "neutral")).toBe(true);
    });

    it("should generate trial variables without neutral trials", () => {
      const variables = utils.stimuli.generateTrialVariables(false);

      expect(Array.isArray(variables)).toBe(true);
      expect(variables.length).toBe(4); // 2 congruent + 2 incongruent
      expect(variables.some(v => v.congruence === "neutral")).toBe(false);
    });

    it("should export SVG constants", () => {
      expect(utils.stimuli.LEFT_ARROW_SVG).toContain("svg");
      expect(utils.stimuli.RIGHT_ARROW_SVG).toContain("svg");
      expect(utils.stimuli.NEUTRAL_STIMULUS).toContain("—");
    });
  });

  describe("utils.scoring", () => {
    it("should return empty scores for no data", () => {
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.accuracy).toBe(0);
      expect(scores.meanRT).toBeNull();
      expect(scores.totalTrials).toBe(0);
      expect(scores.flankerEffectRT).toBeNull();
    });

    it("should calculate scores correctly with test data", () => {
      // Add mock test trial data
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "flanker",
        phase: "test",
        part: "stimulus",
        congruence: "congruent",
        correct: true,
        rt: 400,
      });
      dataCollection.push({
        task: "flanker",
        phase: "test",
        part: "stimulus",
        congruence: "congruent",
        correct: true,
        rt: 450,
      });
      dataCollection.push({
        task: "flanker",
        phase: "test",
        part: "stimulus",
        congruence: "incongruent",
        correct: true,
        rt: 550,
      });
      dataCollection.push({
        task: "flanker",
        phase: "test",
        part: "stimulus",
        congruence: "incongruent",
        correct: false,
        rt: 600,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.totalTrials).toBe(4);
      expect(scores.correctTrials).toBe(3);
      expect(scores.accuracy).toBe(0.75);
      expect(scores.congruentAccuracy).toBe(1.0);
      expect(scores.incongruentAccuracy).toBe(0.5);
      expect(scores.congruentRT).toBe(425); // (400 + 450) / 2
      expect(scores.incongruentRT).toBe(550); // Only correct trial
      expect(scores.flankerEffectRT).toBe(125); // 550 - 425
      expect(scores.flankerEffectAccuracy).toBe(0.5); // 1.0 - 0.5
    });

    it("should calculate neutral trial scores when present", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "flanker",
        phase: "test",
        part: "stimulus",
        congruence: "neutral",
        correct: true,
        rt: 480,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.neutralAccuracy).toBe(1.0);
      expect(scores.neutralRT).toBe(480);
    });

    it("should return null neutral scores when no neutral trials", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "flanker",
        phase: "test",
        part: "stimulus",
        congruence: "congruent",
        correct: true,
        rt: 400,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.neutralAccuracy).toBeNull();
      expect(scores.neutralRT).toBeNull();
    });

    it("should include task info in getSummary", () => {
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary).toHaveProperty("taskName", "flanker");
      expect(summary).toHaveProperty("version");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("flanker");
      expect(utils.constants.VERSION).toBeDefined();
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have correct default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;

      expect(defaults.showInstructions).toBe(true);
      expect(defaults.showPracticeFeedback).toBe(true);
      expect(defaults.showTestFeedback).toBe(false);
      expect(defaults.numPracticeTrials).toBe(12);
      expect(defaults.numTestTrials).toBe(120);
      expect(defaults.numBlocks).toBe(1);
      expect(defaults.fixationDuration).toBe(500);
      expect(defaults.responseDuration).toBe(2000);
      expect(defaults.feedbackDuration).toBe(400);
      expect(defaults.interTrialInterval).toBe(1000);
      expect(defaults.includeNeutral).toBe(true);
    });
  });

  describe("utils.text", () => {
    it("should export default text configuration", () => {
      expect(utils.text).toBeDefined();
      expect(utils.text.left_button).toBe("Left");
      expect(utils.text.right_button).toBe("Right");
      expect(utils.text.continue_button).toBe("Continue");
      expect(utils.text.correct_feedback).toBeDefined();
      expect(utils.text.incorrect_feedback).toBeDefined();
      expect(utils.text.timeout_feedback).toBeDefined();
      expect(utils.text.fixation).toBe("+");
    });

    it("should have instruction text strings", () => {
      expect(utils.text.instruction_intro).toBeDefined();
      expect(typeof utils.text.instruction_response).toBe("function");
      expect(utils.text.instruction_try_right).toBeDefined();
      expect(utils.text.instruction_try_left).toBeDefined();
      expect(utils.text.instruction_try_incongruent).toBeDefined();
      expect(utils.text.instruction_success).toBeDefined();
      expect(utils.text.instruction_failure).toBeDefined();
    });
  });
});
