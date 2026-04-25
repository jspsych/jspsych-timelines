import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Continuous Performance Test", () => {
  describe("createTimeline", () => {
    it("should create a timeline object for standard mode", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { mode: "standard" });
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should create a timeline object for inhibition mode", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { mode: "inhibition" });
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should create a timeline object for ax mode", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { mode: "ax" });
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should default to standard mode", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych);
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("instructions vary by mode", () => {
    it("should show standard instructions for standard mode", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { mode: "standard", showInstructions: true }).timeline
      );
      expect(displayElement.innerHTML).toContain("Continuous Performance Test");
      expect(displayElement.innerHTML).toContain("target letter");
    });

    it("should show inhibition instructions for inhibition mode", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { mode: "inhibition", showInstructions: true }).timeline
      );
      expect(displayElement.innerHTML).toContain("every");
      expect(displayElement.innerHTML).toContain("not");
    });

    it("should show AX instructions for ax mode", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { mode: "ax", showInstructions: true }).timeline
      );
      expect(displayElement.innerHTML).toContain("cue");
      expect(displayElement.innerHTML).toContain("probe");
    });
  });

  describe("practice configuration", () => {
    it("should include practice when showPractice is true", () => {
      const jsPsych = initJsPsych();
      const withPractice = createTimeline(jsPsych, { showPractice: true });
      const withoutPractice = createTimeline(jsPsych, { showPractice: false });
      expect(withoutPractice.timeline.length).toBeLessThan(
        withPractice.timeline.length
      );
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

  describe("trial sequence generation - standard mode", () => {
    it("should generate correct number of trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "standard" as const,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      expect(sequence.length).toBe(100);
    });

    it("should have correct proportion of targets", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "standard" as const,
        targetProbability: 0.2,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      const targetCount = sequence.filter((s) => s.isTarget).length;
      expect(targetCount).toBe(20);
    });

    it("should have target letter for target trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "standard" as const,
        targetLetter: "X",
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 50);
      const targets = sequence.filter((s) => s.isTarget);
      targets.forEach((t) => {
        expect(t.letter).toBe("X");
      });
    });

    it("should not use target letter for non-target trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "standard" as const,
        targetLetter: "X",
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 50);
      const nontargets = sequence.filter((s) => !s.isTarget);
      nontargets.forEach((t) => {
        expect(t.letter).not.toBe("X");
      });
    });
  });

  describe("trial sequence generation - inhibition mode", () => {
    it("should generate correct number of trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "inhibition" as const,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      expect(sequence.length).toBe(100);
    });

    it("should have correct proportion of nontargets (no-go)", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "inhibition" as const,
        nontargetProbability: 0.1,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      const nontargetCount = sequence.filter((s) => !s.isTarget).length;
      expect(nontargetCount).toBe(10);
    });
  });

  describe("trial sequence generation - AX mode", () => {
    it("should generate correct number of trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "ax" as const,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      expect(sequence.length).toBe(100);
    });

    it("should generate correct AX trial types", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "ax" as const,
        axProbability: 0.4,
        ayProbability: 0.2,
        bxProbability: 0.2,
        byProbability: 0.2,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      const axCount = sequence.filter((s) => s.trialType === "ax").length;
      const ayCount = sequence.filter((s) => s.trialType === "ay").length;
      const bxCount = sequence.filter((s) => s.trialType === "bx").length;
      const byCount = sequence.filter((s) => s.trialType === "by").length;

      expect(axCount).toBe(40);
      expect(ayCount).toBe(20);
      expect(bxCount).toBe(20);
      // BY gets remainder
      expect(byCount).toBe(20);
    });

    it("should only have AX trials marked as targets", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "ax" as const,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 50);
      const axTrials = sequence.filter((s) => s.trialType === "ax");
      const nonAxTrials = sequence.filter((s) => s.trialType !== "ax");

      axTrials.forEach((t) => expect(t.isTarget).toBe(true));
      nonAxTrials.forEach((t) => expect(t.isTarget).toBe(false));
    });

    it("should have correct cue and probe letters for AX trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "ax" as const,
        cueLetter: "A",
        probeLetter: "X",
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 50);
      const axTrials = sequence.filter((s) => s.trialType === "ax");

      axTrials.forEach((t) => {
        expect(t.cue).toBe("A");
        expect(t.probe).toBe("X");
      });
    });
  });

  describe("scoring functions", () => {
    it("should handle empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.hits).toBe(0);
      expect(scores.totalTargets).toBe(0);
      expect(scores.hitRate).toBe(0);
      expect(scores.omissionRate).toBe(0);
      expect(scores.commissions).toBe(0);
      expect(scores.commissionRate).toBe(0);
      expect(scores.meanRT).toBeNull();
      expect(scores.rtStd).toBeNull();
      expect(scores.dPrime).toBeNull();
      expect(scores.beta).toBeNull();
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("hits");
      expect(scores).toHaveProperty("totalTargets");
      expect(scores).toHaveProperty("hitRate");
      expect(scores).toHaveProperty("omissionRate");
      expect(scores).toHaveProperty("commissions");
      expect(scores).toHaveProperty("totalNontargets");
      expect(scores).toHaveProperty("commissionRate");
      expect(scores).toHaveProperty("meanRT");
      expect(scores).toHaveProperty("rtStd");
      expect(scores).toHaveProperty("dPrime");
      expect(scores).toHaveProperty("beta");
    });
  });

  describe("getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("continuous-performance-test");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("ISI generation", () => {
    it("should use fixed ISI when isiMin equals isiMax", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        isiMin: 1000,
        isiMax: 1000,
        numTrials: 5,
        showInstructions: false,
        showPractice: false,
      });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept isiSet parameter", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        isiSet: [500, 1000, 1500],
        numTrials: 5,
        showInstructions: false,
        showPractice: false,
      });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept isiMin/isiMax range", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        isiMin: 500,
        isiMax: 1500,
        numTrials: 5,
        showInstructions: false,
        showPractice: false,
      });
      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("text customization", () => {
    it("should use custom text when provided", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, {
          showInstructions: true,
          text: {
            instruction_standard: "<p>Custom intro text</p>",
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

  describe("constants export", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("continuous-performance-test");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.mode).toBe("standard");
      expect(defaults.numTrials).toBe(100);
      expect(defaults.stimulusDuration).toBe(250);
      expect(defaults.isiMin).toBe(1000);
      expect(defaults.isiMax).toBe(1000);
      expect(defaults.targetProbability).toBe(0.2);
      expect(defaults.nontargetProbability).toBe(0.1);
      expect(defaults.showPractice).toBe(true);
      expect(defaults.numPracticeTrials).toBe(10);
    });
  });

  describe("timeline units export", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createPracticeBlock).toBe("function");
      expect(typeof timelineUnits.createTestBlock).toBe("function");
      expect(typeof timelineUnits.createRestScreen).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
    });
  });

  describe("default text", () => {
    it("should have all required text fields", () => {
      expect(utils.text.continue_button).toBeDefined();
      expect(utils.text.start_button).toBeDefined();
      expect(utils.text.instruction_standard).toBeDefined();
      expect(utils.text.instruction_inhibition).toBeDefined();
      expect(utils.text.instruction_ax).toBeDefined();
      expect(utils.text.instruction_practice).toBeDefined();
      expect(utils.text.instruction_task).toBeDefined();
      expect(utils.text.rest_screen).toBeDefined();
      expect(utils.text.feedback_hit).toBeDefined();
      expect(utils.text.feedback_false_alarm).toBeDefined();
      expect(utils.text.feedback_miss).toBeDefined();
      expect(utils.text.feedback_correct_rejection).toBeDefined();
      expect(utils.text.task_complete).toBeDefined();
      expect(typeof utils.text.result_summary).toBe("function");
    });
  });

  describe("block configuration", () => {
    it("should create multiple blocks with rest screens", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numBlocks: 3,
        numTrials: 30,
        showInstructions: false,
        showPractice: false,
      });
      // 3 test blocks + 2 rest screens + 1 completion = 6
      expect(timeline.timeline.length).toBe(6);
    });

    it("should create single block without rest screens", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numBlocks: 1,
        numTrials: 30,
        showInstructions: false,
        showPractice: false,
      });
      // 1 test block + 1 completion = 2
      expect(timeline.timeline.length).toBe(2);
    });
  });

  describe("configuration options", () => {
    it("should accept custom number of trials", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { numTrials: 50 });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom stimulus duration", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { stimulusDuration: 500 });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom target letter", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { targetLetter: "Z" });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom number of practice trials", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { numPracticeTrials: 5 });
      expect(timeline.timeline).toBeDefined();
    });
  });
});
