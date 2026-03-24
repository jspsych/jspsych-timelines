import { initJsPsych } from "jspsych";
import { startTimeline } from "@jspsych/test-utils";
import { createTimeline, utils, timelineUnits } from "./index";

jest.useFakeTimers();

describe("Task Switching", () => {
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
        numTrials: 60,
        numPracticeTrials: 8,
        fixationDuration: 300,
      });
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
    });

    it("should create a timeline in cued mode", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { mode: "cued" });
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
    });

    it("should create a timeline in alternating mode", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { mode: "alternating" });
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
      expect(displayElement.innerHTML).toContain("Task Switching");
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
    it("should include practice when showPractice is true", () => {
      const jsPsych = initJsPsych();
      const withPractice = createTimeline(jsPsych, {
        showPractice: true,
        showInstructions: false,
      });
      const withoutPractice = createTimeline(jsPsych, {
        showPractice: false,
        showInstructions: false,
      });
      expect(withoutPractice.timeline.length).toBeLessThan(
        withPractice.timeline.length
      );
    });

    it("should skip practice when numPracticeTrials is 0", () => {
      const jsPsych = initJsPsych();
      const withPractice = createTimeline(jsPsych, {
        numPracticeTrials: 16,
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

  describe("cued sequence generation", () => {
    it("should generate the requested number of trials", () => {
      const sequence = utils.sequence.generateCuedSequence(
        80,
        0.5,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );
      expect(sequence.length).toBe(80);
    });

    it("should have first trial with switch_type 'first'", () => {
      const sequence = utils.sequence.generateCuedSequence(
        20,
        0.5,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );
      expect(sequence[0].switch_type).toBe("first");
      expect(sequence[0].previous_task).toBeNull();
    });

    it("should respect proportionSwitch", () => {
      const sequence = utils.sequence.generateCuedSequence(
        101, // 1 first + 100 others
        0.5,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );
      const switchTrials = sequence.filter((t) => t.switch_type === "switch");
      const repeatTrials = sequence.filter((t) => t.switch_type === "repeat");
      // 100 non-first trials, 50% switch = 50
      expect(switchTrials.length).toBe(50);
      expect(repeatTrials.length).toBe(50);
    });

    it("should only use valid stimuli", () => {
      const sequence = utils.sequence.generateCuedSequence(
        50,
        0.5,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );
      sequence.forEach((t) => {
        expect(utils.constants.DEFAULT_STIMULI).toContain(t.stimulus_number);
      });
    });

    it("should assign correct tasks on switch trials", () => {
      const sequence = utils.sequence.generateCuedSequence(
        50,
        0.5,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );
      for (let i = 1; i < sequence.length; i++) {
        if (sequence[i].switch_type === "switch") {
          expect(sequence[i].current_task).not.toBe(sequence[i].previous_task);
        } else if (sequence[i].switch_type === "repeat") {
          expect(sequence[i].current_task).toBe(sequence[i].previous_task);
        }
      }
    });

    it("should assign correct response labels", () => {
      const sequence = utils.sequence.generateCuedSequence(
        50,
        0.5,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );
      sequence.forEach((t) => {
        if (t.current_task === "magnitude") {
          if (t.stimulus_number < 5) {
            expect(t.correct_response).toBe("LOW");
          } else {
            expect(t.correct_response).toBe("HIGH");
          }
        } else {
          if (t.stimulus_number % 2 === 0) {
            expect(t.correct_response).toBe("EVEN");
          } else {
            expect(t.correct_response).toBe("ODD");
          }
        }
      });
    });
  });

  describe("alternating sequence generation", () => {
    it("should generate the requested number of trials", () => {
      const sequence = utils.sequence.generateAlternatingSequence(
        80,
        2,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );
      expect(sequence.length).toBe(80);
    });

    it("should follow AABB pattern with run length 2", () => {
      const sequence = utils.sequence.generateAlternatingSequence(
        20,
        2,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );

      // After the first trial, tasks should alternate in pairs
      for (let i = 2; i < sequence.length; i += 2) {
        // Each pair should be the same task
        if (i + 1 < sequence.length) {
          expect(sequence[i].current_task).toBe(sequence[i + 1]?.current_task);
        }
        // Adjacent pairs should be different tasks
        if (i >= 2) {
          expect(sequence[i].current_task).not.toBe(sequence[i - 1].current_task);
        }
      }
    });

    it("should mark first trial of each run as switch", () => {
      const sequence = utils.sequence.generateAlternatingSequence(
        20,
        2,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );

      // First trial is "first"
      expect(sequence[0].switch_type).toBe("first");

      // In AABB with runLength=2: positions 0,1 = first run, 2,3 = second run, etc.
      // Position 2 should be "switch" (task changes), position 3 should be "repeat"
      for (let i = 1; i < sequence.length; i++) {
        if (sequence[i].current_task !== sequence[i - 1].current_task) {
          expect(sequence[i].switch_type).toBe("switch");
        } else {
          expect(sequence[i].switch_type).toBe("repeat");
        }
      }
    });

    it("should support custom run lengths", () => {
      const sequence = utils.sequence.generateAlternatingSequence(
        30,
        3,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );

      // With run length 3: AAA BBB AAA BBB ...
      const firstTask = sequence[0].current_task;
      expect(sequence[1].current_task).toBe(firstTask);
      expect(sequence[2].current_task).toBe(firstTask);
      // Position 3 should switch
      expect(sequence[3].current_task).not.toBe(firstTask);
      expect(sequence[4].current_task).not.toBe(firstTask);
      expect(sequence[5].current_task).not.toBe(firstTask);
    });
  });

  describe("button labels change based on task", () => {
    it("should use LOW/HIGH for magnitude task in sequence", () => {
      const sequence = utils.sequence.generateCuedSequence(
        50,
        0.5,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );
      const magnitudeTrials = sequence.filter((t) => t.current_task === "magnitude");
      magnitudeTrials.forEach((t) => {
        expect(["LOW", "HIGH"]).toContain(t.correct_response);
      });
    });

    it("should use ODD/EVEN for parity task in sequence", () => {
      const sequence = utils.sequence.generateCuedSequence(
        50,
        0.5,
        utils.constants.DEFAULT_STIMULI,
        utils.text
      );
      const parityTrials = sequence.filter((t) => t.current_task === "parity");
      parityTrials.forEach((t) => {
        expect(["ODD", "EVEN"]).toContain(t.correct_response);
      });
    });
  });

  describe("scoring functions", () => {
    it("should handle empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.accuracy).toBe(0);
      expect(scores.meanRT).toBeNull();
      expect(scores.switchRT).toBeNull();
      expect(scores.repeatRT).toBeNull();
      expect(scores.switchAccuracy).toBe(0);
      expect(scores.repeatAccuracy).toBe(0);
      expect(scores.switchCostRT).toBeNull();
      expect(scores.switchCostAccuracy).toBe(0);
      expect(scores.magnitudeRT).toBeNull();
      expect(scores.parityRT).toBeNull();
      expect(scores.magnitudeAccuracy).toBe(0);
      expect(scores.parityAccuracy).toBe(0);
      expect(scores.totalTrials).toBe(0);
      expect(scores.correctTrials).toBe(0);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("accuracy");
      expect(scores).toHaveProperty("meanRT");
      expect(scores).toHaveProperty("switchRT");
      expect(scores).toHaveProperty("repeatRT");
      expect(scores).toHaveProperty("switchAccuracy");
      expect(scores).toHaveProperty("repeatAccuracy");
      expect(scores).toHaveProperty("switchCostRT");
      expect(scores).toHaveProperty("switchCostAccuracy");
      expect(scores).toHaveProperty("magnitudeRT");
      expect(scores).toHaveProperty("parityRT");
      expect(scores).toHaveProperty("magnitudeAccuracy");
      expect(scores).toHaveProperty("parityAccuracy");
      expect(scores).toHaveProperty("totalTrials");
      expect(scores).toHaveProperty("correctTrials");
    });
  });

  describe("getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("task-switching");
      expect(summary.version).toBe("0.0.1");
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

  describe("text customization", () => {
    it("should use custom text when provided", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, {
          showInstructions: true,
          text: {
            instruction_intro: "<p>Custom task switching intro</p>",
            continue_button: "Next",
          },
        }).timeline
      );

      expect(displayElement.innerHTML).toContain("Custom task switching intro");
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

    it("should use custom button labels in sequence generation", () => {
      const customText = { ...utils.text, button_low: "SMALL", button_high: "BIG" };
      const sequence = utils.sequence.generateCuedSequence(
        50,
        0.5,
        utils.constants.DEFAULT_STIMULI,
        customText
      );
      const magnitudeTrials = sequence.filter((t) => t.current_task === "magnitude");
      magnitudeTrials.forEach((t) => {
        expect(["SMALL", "BIG"]).toContain(t.correct_response);
      });
    });
  });

  describe("constants export", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("task-switching");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
      expect(utils.constants.DEFAULT_STIMULI).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.numTrials).toBe(80);
      expect(defaults.numPracticeTrials).toBe(16);
      expect(defaults.fixationDuration).toBe(500);
      expect(defaults.responseTimeout).toBe(3000);
      expect(defaults.feedbackDuration).toBe(500);
      expect(defaults.iti).toBe(200);
      expect(defaults.csiDuration).toBe(500);
      expect(defaults.proportionSwitch).toBe(0.5);
      expect(defaults.runLength).toBe(2);
      expect(defaults.mode).toBe("cued");
    });

    it("should have valid default stimuli", () => {
      const stimuli = utils.constants.DEFAULT_STIMULI;
      expect(stimuli.length).toBe(8);
      expect(stimuli).toContain(1);
      expect(stimuli).toContain(9);
      expect(stimuli).not.toContain(5);
      expect(stimuli).not.toContain(0);
    });
  });

  describe("timeline units export", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createFixationTrial).toBe("function");
      expect(typeof timelineUnits.createCueTrial).toBe("function");
      expect(typeof timelineUnits.createCuedStimulusTrial).toBe("function");
      expect(typeof timelineUnits.createAlternatingStimulusTrial).toBe("function");
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
      expect(utils.text.start_button).toBeDefined();
      expect(utils.text.fixation).toBeDefined();
      expect(utils.text.cue_magnitude).toBeDefined();
      expect(utils.text.cue_parity).toBeDefined();
      expect(utils.text.button_low).toBeDefined();
      expect(utils.text.button_high).toBeDefined();
      expect(utils.text.button_odd).toBeDefined();
      expect(utils.text.button_even).toBeDefined();
      expect(utils.text.instruction_intro).toBeDefined();
      expect(utils.text.instruction_magnitude).toBeDefined();
      expect(utils.text.instruction_parity).toBeDefined();
      expect(utils.text.instruction_practice).toBeDefined();
      expect(utils.text.instruction_task).toBeDefined();
      expect(utils.text.feedback_correct).toBeDefined();
      expect(utils.text.feedback_incorrect).toBeDefined();
      expect(utils.text.feedback_timeout).toBeDefined();
      expect(utils.text.task_complete).toBeDefined();
      expect(typeof utils.text.result_summary).toBe("function");
      expect(typeof utils.text.rest_message).toBe("function");
    });
  });
});
