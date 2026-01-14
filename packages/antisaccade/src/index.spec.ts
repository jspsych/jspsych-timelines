import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Antisaccade Timeline", () => {
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

    it("should skip prosaccade block when includeProsaccade is false", () => {
      const jsPsych = initJsPsych();
      const withProsaccade = createTimeline(jsPsych, { includeProsaccade: true });
      const withoutProsaccade = createTimeline(jsPsych, { includeProsaccade: false });
      expect(withoutProsaccade.timeline.length).toBeLessThan(
        withProsaccade.timeline.length
      );
    });

    it("should skip practice when showPractice is false", () => {
      const jsPsych = initJsPsych();
      const withPractice = createTimeline(jsPsych, { showPractice: true });
      const withoutPractice = createTimeline(jsPsych, { showPractice: false });
      expect(withoutPractice.timeline.length).toBeLessThan(
        withPractice.timeline.length
      );
    });
  });

  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true }).timeline
      );

      expect(displayElement.innerHTML).toContain("Antisaccade Task");
    });
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.antisaccadeAccuracy).toBe(0);
      expect(scores.prosaccadeAccuracy).toBe(0);
      expect(scores.antisaccadeTrials).toBe(0);
      expect(scores.prosaccadeTrials).toBe(0);
      expect(scores.antisaccadeRT).toBeNull();
      expect(scores.prosaccadeRT).toBeNull();
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("antisaccadeAccuracy");
      expect(scores).toHaveProperty("prosaccadeAccuracy");
      expect(scores).toHaveProperty("antisaccadeTrials");
      expect(scores).toHaveProperty("prosaccadeTrials");
      expect(scores).toHaveProperty("antisaccadeErrors");
      expect(scores).toHaveProperty("prosaccadeErrors");
      expect(scores).toHaveProperty("antisaccadeRT");
      expect(scores).toHaveProperty("prosaccadeRT");
      expect(scores).toHaveProperty("rtCost");
      expect(scores).toHaveProperty("overallAccuracy");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("antisaccade");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("antisaccade");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.trialsPerBlock).toBe(24);
      expect(defaults.includeProsaccade).toBe(true);
      expect(defaults.fixationDuration).toBe(500);
      expect(defaults.gapDuration).toBe(200);
      expect(defaults.cueDuration).toBe(100);
      expect(defaults.responseTimeout).toBe(1500);
      expect(defaults.showPractice).toBe(true);
      expect(defaults.numPracticeTrials).toBe(4);
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createAntisaccadeTrial).toBe("function");
      expect(typeof timelineUnits.createTrialBlock).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.generateTrialSequence).toBe("function");
      expect(typeof timelineUnits.createCueHTML).toBe("function");
      expect(typeof timelineUnits.createFixationHTML).toBe("function");
    });
  });

  describe("trial sequence generation", () => {
    it("should generate correct number of trials", () => {
      const sequence = timelineUnits.generateTrialSequence(24);
      expect(sequence.length).toBe(24);
    });

    it("should have balanced left/right cues", () => {
      const sequence = timelineUnits.generateTrialSequence(24);
      const leftCount = sequence.filter((s) => s === "left").length;
      const rightCount = sequence.filter((s) => s === "right").length;
      expect(leftCount).toBe(12);
      expect(rightCount).toBe(12);
    });

    it("should shuffle the sequence", () => {
      // Generate multiple sequences and check they're not all identical
      const results: string[] = [];
      for (let i = 0; i < 10; i++) {
        const sequence = timelineUnits.generateTrialSequence(10);
        results.push(sequence.join(","));
      }
      const unique = new Set(results);
      expect(unique.size).toBeGreaterThan(1);
    });

    it("should handle odd number of trials", () => {
      const sequence = timelineUnits.generateTrialSequence(11);
      expect(sequence.length).toBe(11);
      const leftCount = sequence.filter((s) => s === "left").length;
      const rightCount = sequence.filter((s) => s === "right").length;
      // Either 5-6 or 6-5 distribution
      expect(leftCount + rightCount).toBe(11);
      expect(Math.abs(leftCount - rightCount)).toBeLessThanOrEqual(1);
    });
  });

  describe("cue HTML generation", () => {
    it("should create cue HTML with correct color", () => {
      const html = timelineUnits.createCueHTML("left", "#FF0000", 40, 200);
      expect(html).toContain("background-color: #FF0000");
    });

    it("should create cue HTML with correct size", () => {
      const html = timelineUnits.createCueHTML("left", "#FF0000", 50, 200);
      expect(html).toContain("width: 50px");
      expect(html).toContain("height: 50px");
    });

    it("should position left cue on left side", () => {
      const html = timelineUnits.createCueHTML("left", "#FF0000", 40, 200);
      expect(html).toContain("-200px");
    });

    it("should position right cue on right side", () => {
      const html = timelineUnits.createCueHTML("right", "#FF0000", 40, 200);
      expect(html).toContain("200px");
    });
  });

  describe("fixation HTML generation", () => {
    it("should create fixation cross", () => {
      const html = timelineUnits.createFixationHTML();
      expect(html).toContain("+");
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
    it("should accept custom trials per block", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        trialsPerBlock: 12,
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

    it("should accept custom gap duration", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        gapDuration: 300,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom cue duration", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        cueDuration: 200,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom response timeout", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        responseTimeout: 2000,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom cue color", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        cueColor: "#00FF00",
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom cue size", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        cueSize: 60,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom cue offset", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        cueOffset: 300,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom ITI", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        iti: 750,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom number of practice trials", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numPracticeTrials: 8,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("default text", () => {
    it("should have all required text fields", () => {
      expect(utils.text.continue_button).toBeDefined();
      expect(utils.text.start_button).toBeDefined();
      expect(utils.text.left_button).toBeDefined();
      expect(utils.text.right_button).toBeDefined();
      expect(utils.text.instruction_intro).toBeDefined();
      expect(utils.text.instruction_prosaccade).toBeDefined();
      expect(utils.text.instruction_antisaccade).toBeDefined();
      expect(utils.text.instruction_practice).toBeDefined();
      expect(utils.text.feedback_correct).toBeDefined();
      expect(utils.text.feedback_incorrect).toBeDefined();
      expect(utils.text.feedback_timeout).toBeDefined();
      expect(utils.text.task_complete).toBeDefined();
      expect(typeof utils.text.result_summary).toBe("function");
    });
  });

  describe("antisaccade trial creation", () => {
    it("should create prosaccade trial with correct response on same side", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createAntisaccadeTrial(
        jsPsych,
        config,
        "left",
        "prosaccade",
        1,
        false
      );
      expect(trial.timeline).toBeDefined();
      // Check that correct_response is same as cue_side for prosaccade
      const responseTrial = trial.timeline.find(
        (t: any) => t.data && t.data.correct_response
      );
      expect(responseTrial.data.correct_response).toBe("left");
    });

    it("should create antisaccade trial with correct response on opposite side", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createAntisaccadeTrial(
        jsPsych,
        config,
        "left",
        "antisaccade",
        1,
        false
      );
      expect(trial.timeline).toBeDefined();
      // Check that correct_response is opposite of cue_side for antisaccade
      const responseTrial = trial.timeline.find(
        (t: any) => t.data && t.data.correct_response
      );
      expect(responseTrial.data.correct_response).toBe("right");
    });

    it("should include feedback for practice trials", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const practiceTrial = timelineUnits.createAntisaccadeTrial(
        jsPsych,
        config,
        "left",
        "antisaccade",
        1,
        true
      );
      const nonPracticeTrial = timelineUnits.createAntisaccadeTrial(
        jsPsych,
        config,
        "left",
        "antisaccade",
        1,
        false
      );
      // Practice trial should have more timeline items due to feedback
      expect(practiceTrial.timeline.length).toBeGreaterThan(
        nonPracticeTrial.timeline.length
      );
    });
  });

  describe("trial block creation", () => {
    it("should create block with correct number of trials", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const block = timelineUnits.createTrialBlock(
        jsPsych,
        config,
        "antisaccade",
        12,
        false
      );
      expect(block.timeline.length).toBe(12);
    });
  });
});
