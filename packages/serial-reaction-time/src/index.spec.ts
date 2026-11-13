import { JsPsych, initJsPsych } from "jspsych";

import { createTimeline, timelineUnits, utils } from ".";

describe("Serial Reaction Time Task", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  describe("createTimeline", () => {
    it("should create a timeline with default config", () => {
      const timeline = createTimeline(jsPsych);
      expect(timeline).toHaveProperty("timeline");
      expect(Array.isArray(timeline.timeline)).toBe(true);
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should omit instructions when showInstructions is false", () => {
      const withInstructions = createTimeline(jsPsych, { showInstructions: true });
      const withoutInstructions = createTimeline(jsPsych, { showInstructions: false });
      expect(withoutInstructions.timeline.length).toBeLessThan(withInstructions.timeline.length);
    });

    it("should omit practice block when numPracticeTrials is 0", () => {
      const withPractice = createTimeline(jsPsych, {
        numPracticeTrials: 20,
        showInstructions: false,
      });
      const withoutPractice = createTimeline(jsPsych, {
        numPracticeTrials: 0,
        showInstructions: false,
      });
      expect(withoutPractice.timeline.length).toBeLessThan(withPractice.timeline.length);
    });

    it("should create the requested number of test blocks (with breaks between them)", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 4,
      });
      // 4 blocks + 3 breaks + 1 completion = 8
      expect(timeline.timeline.length).toBe(8);
    });

    it("should create trialsPerBlock stimulus trials in each block", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
        trialsPerBlock: 30,
      });
      const block = timeline.timeline[0] as any;
      expect(block.timeline.length).toBe(30);
    });

    it("should mark the configured block as 'random' and others as 'sequence'", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 3,
        trialsPerBlock: 4,
        randomBlockIndex: 2,
      });
      // Layout: [block1, break, block2, break, block3, completion]
      const block1 = timeline.timeline[0] as any;
      const block2 = timeline.timeline[2] as any;
      const block3 = timeline.timeline[4] as any;
      expect(block1.timeline[0].data.block_type).toBe("sequence");
      expect(block2.timeline[0].data.block_type).toBe("random");
      expect(block3.timeline[0].data.block_type).toBe("sequence");
    });

    it("should treat all blocks as sequence when randomBlockIndex is 0", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 3,
        trialsPerBlock: 4,
        randomBlockIndex: 0,
      });
      const block1 = timeline.timeline[0] as any;
      const block2 = timeline.timeline[2] as any;
      const block3 = timeline.timeline[4] as any;
      expect(block1.timeline[0].data.block_type).toBe("sequence");
      expect(block2.timeline[0].data.block_type).toBe("sequence");
      expect(block3.timeline[0].data.block_type).toBe("sequence");
    });

    it("should follow the configured sequence in sequence blocks", () => {
      const sequence = [0, 1, 2, 3, 0, 1];
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
        trialsPerBlock: 12, // two full cycles
        sequence,
        randomBlockIndex: 0,
      });
      const block = timeline.timeline[0] as any;
      const targets = block.timeline.map((t: any) => t.data.target);
      expect(targets).toEqual([...sequence, ...sequence]);
    });

    it("should infer numPositions from a custom sequence", () => {
      const sequence = [0, 1, 2, 3, 4, 5]; // 6 positions
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
        trialsPerBlock: 6,
        sequence,
        randomBlockIndex: 0,
      });
      const block = timeline.timeline[0] as any;
      const stimulusTrial = block.timeline[0];
      // Grid is one row with one cell per position
      expect(stimulusTrial.grid).toEqual([[1, 1, 1, 1, 1, 1]]);
    });

    it("should pass responseDuration through as the plugin's trial_duration", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
        trialsPerBlock: 1,
        responseDuration: 1500,
      });
      const block = timeline.timeline[0] as any;
      expect(block.timeline[0].trial_duration).toBe(1500);
    });

    it("should pass responseToStimulusInterval through as pre_target_duration", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
        trialsPerBlock: 1,
        responseToStimulusInterval: 350,
      });
      const block = timeline.timeline[0] as any;
      expect(block.timeline[0].pre_target_duration).toBe(350);
    });

    it("should set the target as [0, position] for the plugin", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
        trialsPerBlock: 4,
        sequence: [2, 0, 3, 1],
        randomBlockIndex: 0,
      });
      const block = timeline.timeline[0] as any;
      expect(block.timeline[0].target).toEqual([0, 2]);
      expect(block.timeline[1].target).toEqual([0, 0]);
      expect(block.timeline[2].target).toEqual([0, 3]);
      expect(block.timeline[3].target).toEqual([0, 1]);
    });

    it("should enable plugin feedback on practice trials with the configured duration", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 4,
        showPracticeFeedback: true,
        feedbackDuration: 600,
        numBlocks: 0,
      });
      const practiceBlock = timeline.timeline[0] as any;
      // No separate feedback trials — feedback is built into each stimulus trial.
      expect(practiceBlock.timeline.length).toBe(4);
      practiceBlock.timeline.forEach((t: any) => {
        expect(t.show_response_feedback).toBe(true);
        expect(t.feedback_duration).toBe(600);
      });
    });

    it("should disable plugin feedback on practice trials when showPracticeFeedback is false", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 4,
        showPracticeFeedback: false,
        numBlocks: 0,
      });
      const practiceBlock = timeline.timeline[0] as any;
      expect(practiceBlock.timeline.length).toBe(4);
      practiceBlock.timeline.forEach((t: any) => {
        expect(t.show_response_feedback).toBe(false);
      });
    });

    it("should not enable plugin feedback on test block trials", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
        trialsPerBlock: 4,
      });
      const testBlock = timeline.timeline[0] as any;
      testBlock.timeline.forEach((t: any) => {
        expect(t.show_response_feedback).toBe(false);
      });
    });

    it("should pass through grid and target color customizations", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        numPracticeTrials: 0,
        numBlocks: 1,
        trialsPerBlock: 1,
        gridSquareSize: 80,
        targetColor: "#ff0000",
      });
      const block = timeline.timeline[0] as any;
      expect(block.timeline[0].grid_square_size).toBe(80);
      expect(block.timeline[0].target_color).toBe("#ff0000");
    });
  });

  describe("timelineUnits", () => {
    it("createStimulusTrial sets target as [0, position] and records the position in data", () => {
      const config: any = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createStimulusTrial(config, 2, {
        task: "serial-reaction-time",
        phase: "test",
        block: 1,
        trial: 1,
        block_type: "sequence",
      });
      expect(trial.target).toEqual([0, 2]);
      expect(trial.data.target).toBe(2);
      expect(trial.data.correct_response).toBe(2);
      expect(trial.grid).toEqual([[1, 1, 1, 1]]);
    });

    it("createStimulusTrial.on_finish flattens [row, col] response to position", () => {
      const config: any = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createStimulusTrial(config, 2, {
        task: "serial-reaction-time",
        phase: "test",
        block: 1,
        trial: 1,
        block_type: "sequence",
      });

      const correctData: any = { response: [0, 2] };
      trial.on_finish(correctData);
      expect(correctData.response).toBe(2);
      expect(correctData.correct).toBe(true);

      const wrongData: any = { response: [0, 1] };
      trial.on_finish(wrongData);
      expect(wrongData.response).toBe(1);
      expect(wrongData.correct).toBe(false);

      const timeoutData: any = { response: [NaN, NaN] };
      trial.on_finish(timeoutData);
      expect(timeoutData.response).toBeNull();
      expect(timeoutData.correct).toBe(false);
    });
  });

  describe("utils.stimuli", () => {
    it("buildBlockTargets cycles the sequence to fill a sequence block", () => {
      const config: any = {
        ...utils.constants.DEFAULT_OPTIONS,
        sequence: [0, 1, 2, 3],
        trialsPerBlock: 10,
        numPositions: 4,
      };
      const targets = utils.stimuli.buildBlockTargets(config, "sequence");
      expect(targets).toEqual([0, 1, 2, 3, 0, 1, 2, 3, 0, 1]);
    });

    it("generateRandomSequence never repeats consecutively", () => {
      const seq = utils.stimuli.generateRandomSequence(200, 4);
      expect(seq.length).toBe(200);
      for (let i = 1; i < seq.length; i++) {
        expect(seq[i]).not.toBe(seq[i - 1]);
      }
    });

    it("buildGrid builds a single row with one cell per position", () => {
      expect(utils.stimuli.buildGrid(4)).toEqual([[1, 1, 1, 1]]);
      expect(utils.stimuli.buildGrid(6)).toEqual([[1, 1, 1, 1, 1, 1]]);
    });

    it("exposes the Nissen & Bullemer sequence as a 10-element array", () => {
      expect(utils.stimuli.NISSEN_BULLEMER_SEQUENCE.length).toBe(10);
      expect(Math.max(...utils.stimuli.NISSEN_BULLEMER_SEQUENCE)).toBe(3);
      expect(Math.min(...utils.stimuli.NISSEN_BULLEMER_SEQUENCE)).toBe(0);
    });
  });

  describe("utils.scoring", () => {
    it("returns zero metrics when there is no data", () => {
      const scores = utils.scoring.calculateScores(jsPsych.data.get());
      expect(scores.totalTrials).toBe(0);
      expect(scores.correctTrials).toBe(0);
      expect(scores.accuracy).toBe(0);
      expect(scores.meanRT).toBeNull();
      expect(scores.blockSummaries).toEqual([]);
      expect(scores.sequenceLearningEffectRT).toBeNull();
    });

    it("calculates accuracy and mean RT (correct trials only)", () => {
      const data = jsPsych.data.get();
      data.push({
        task: "serial-reaction-time",
        phase: "test",
        block: 1,
        target: 0,
        block_type: "sequence",
        correct: true,
        rt: 400,
      });
      data.push({
        task: "serial-reaction-time",
        phase: "test",
        block: 1,
        target: 1,
        block_type: "sequence",
        correct: true,
        rt: 500,
      });
      data.push({
        task: "serial-reaction-time",
        phase: "test",
        block: 1,
        target: 2,
        block_type: "sequence",
        correct: false,
        rt: 1200,
      });

      const scores = utils.scoring.calculateScores(data);
      expect(scores.totalTrials).toBe(3);
      expect(scores.correctTrials).toBe(2);
      expect(scores.accuracy).toBeCloseTo(2 / 3, 5);
      expect(scores.meanRT).toBe(450); // (400 + 500) / 2; incorrect excluded
    });

    it("computes the sequence learning effect from neighboring blocks", () => {
      const data = jsPsych.data.get();
      data.push({
        task: "serial-reaction-time",
        phase: "test",
        block: 1,
        target: 0,
        block_type: "sequence",
        correct: true,
        rt: 300,
      });
      data.push({
        task: "serial-reaction-time",
        phase: "test",
        block: 2,
        target: 1,
        block_type: "random",
        correct: true,
        rt: 500,
      });
      data.push({
        task: "serial-reaction-time",
        phase: "test",
        block: 3,
        target: 2,
        block_type: "sequence",
        correct: true,
        rt: 320,
      });

      const scores = utils.scoring.calculateScores(data);
      // Effect = 500 - mean(300, 320) = 500 - 310 = 190
      expect(scores.sequenceLearningEffectRT).toBe(190);
    });

    it("returns null sequence learning effect when there is no random block", () => {
      const data = jsPsych.data.get();
      data.push({
        task: "serial-reaction-time",
        phase: "test",
        block: 1,
        target: 0,
        block_type: "sequence",
        correct: true,
        rt: 300,
      });
      data.push({
        task: "serial-reaction-time",
        phase: "test",
        block: 2,
        target: 1,
        block_type: "sequence",
        correct: true,
        rt: 320,
      });

      const scores = utils.scoring.calculateScores(data);
      expect(scores.sequenceLearningEffectRT).toBeNull();
    });

    it("groups data into per-block summaries with correct types", () => {
      const data = jsPsych.data.get();
      data.push({
        task: "serial-reaction-time",
        phase: "test",
        block: 1,
        target: 0,
        block_type: "sequence",
        correct: true,
        rt: 400,
      });
      data.push({
        task: "serial-reaction-time",
        phase: "test",
        block: 1,
        target: 1,
        block_type: "sequence",
        correct: false,
        rt: 700,
      });
      data.push({
        task: "serial-reaction-time",
        phase: "test",
        block: 2,
        target: 2,
        block_type: "random",
        correct: true,
        rt: 600,
      });

      const scores = utils.scoring.calculateScores(data);
      expect(scores.blockSummaries).toHaveLength(2);

      const b1 = scores.blockSummaries.find((b) => b.block === 1)!;
      expect(b1.block_type).toBe("sequence");
      expect(b1.numTrials).toBe(2);
      expect(b1.numCorrect).toBe(1);
      expect(b1.accuracy).toBe(0.5);
      expect(b1.meanRT).toBe(400);

      const b2 = scores.blockSummaries.find((b) => b.block === 2)!;
      expect(b2.block_type).toBe("random");
      expect(b2.numCorrect).toBe(1);
      expect(b2.meanRT).toBe(600);
    });

    it("getSummary attaches taskName and version", () => {
      const summary = utils.scoring.getSummary(jsPsych.data.get());
      expect(summary.taskName).toBe(utils.constants.TASK_NAME);
      expect(summary.version).toBe(utils.constants.VERSION);
    });
  });

  describe("utils.text", () => {
    it("exposes the default text config", () => {
      expect(utils.text).toBeDefined();
      expect(typeof utils.text.task_complete).toBe("string");
    });

    it("supports partial text overrides via the text option", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: true,
        numPracticeTrials: 0,
        numBlocks: 0,
        text: { continue_button: "Siguiente" },
      });
      // First instruction trial should use the overridden continue button.
      const instructionGroup = timeline.timeline[0] as any;
      expect(instructionGroup.timeline[0].choices).toEqual(["Siguiente"]);
    });
  });
});
