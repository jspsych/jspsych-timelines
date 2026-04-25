import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, timelineUnits, utils } from ".";

describe("Operation Span Task", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  describe("createTimeline", () => {
    it("should create a timeline with default parameters", () => {
      const timeline = createTimeline(jsPsych);
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should include instructions when showInstructions is true", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: true });
      const instructions = timeline.timeline[0] as any;
      expect(instructions.pages).toBeDefined();
      expect(instructions.pages.length).toBe(5);
    });

    it("should exclude instructions when showInstructions is false", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: false });
      const firstItem = timeline.timeline[0] as any;
      expect(firstItem.pages).toBeUndefined();
    });

    it("should create correct number of trials based on setSizes and trialsPerSetSize", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        setSizes: [3, 4],
        trialsPerSetSize: 2,
      });

      const trialBlock = timeline.timeline[0] as any;
      // 2 set sizes × 2 trials = 4 total trials
      expect(trialBlock.timeline.length).toBe(4);
    });

    it("should use custom instruction text", () => {
      const customText = {
        instruction_pages: ["Custom page 1"],
      };
      const timeline = createTimeline(jsPsych, {
        showInstructions: true,
        text: customText,
      });

      const instructions = timeline.timeline[0] as any;
      expect(instructions.pages).toEqual(["Custom page 1"]);
    });

    it("should include completion trial at end", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: false });
      const lastItem = timeline.timeline[timeline.timeline.length - 1] as any;
      expect(lastItem.data.phase).toBe("completion");
    });
  });

  describe("utils.stimuli", () => {
    it("should have 12 default letters", () => {
      expect(utils.stimuli.DEFAULT_LETTERS.length).toBe(12);
    });

    it("should only include consonants in default letters", () => {
      const vowels = ["A", "E", "I", "O", "U"];
      const hasVowel = utils.stimuli.DEFAULT_LETTERS.some((l) =>
        vowels.includes(l)
      );
      expect(hasVowel).toBe(false);
    });

    it("should generate valid math problems", () => {
      const problem = utils.stimuli.generateMathProblem();

      expect(problem.text).toBeDefined();
      expect(problem.text).toContain("=");
      expect(typeof problem.isTrue).toBe("boolean");
      expect(typeof problem.correctAnswer).toBe("number");
      expect(typeof problem.displayAnswer).toBe("number");
    });

    it("should generate math problems with correct answers when isTrue", () => {
      // Generate several problems and check true ones
      for (let i = 0; i < 20; i++) {
        const problem = utils.stimuli.generateMathProblem();
        if (problem.isTrue) {
          expect(problem.displayAnswer).toBe(problem.correctAnswer);
        }
      }
    });

    it("should generate math problems with incorrect answers when not isTrue", () => {
      // Generate several problems and check false ones
      for (let i = 0; i < 20; i++) {
        const problem = utils.stimuli.generateMathProblem();
        if (!problem.isTrue) {
          expect(problem.displayAnswer).not.toBe(problem.correctAnswer);
        }
      }
    });
  });

  describe("utils.scoring", () => {
    it("should return zero scores for no data", () => {
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.totalTrials).toBe(0);
      expect(scores.ospanScore).toBe(0);
      expect(scores.absoluteSpanScore).toBe(0);
      expect(scores.mathAccuracy).toBe(0);
    });

    it("should calculate OSPAN score (partial credit)", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "operation-span",
        phase: "test",
        part: "recall",
        set_size: 3,
        letters_correct: 2,
        perfect_recall: false,
        math_correct: 3,
        math_total: 3,
        mean_math_rt: 1000,
      });
      dataCollection.push({
        task: "operation-span",
        phase: "test",
        part: "recall",
        set_size: 4,
        letters_correct: 4,
        perfect_recall: true,
        math_correct: 4,
        math_total: 4,
        mean_math_rt: 1200,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.ospanScore).toBe(6); // 2 + 4
    });

    it("should calculate absolute span score (perfect trials only)", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "operation-span",
        phase: "test",
        part: "recall",
        set_size: 3,
        letters_correct: 2,
        perfect_recall: false,
        math_correct: 3,
        math_total: 3,
        mean_math_rt: 1000,
      });
      dataCollection.push({
        task: "operation-span",
        phase: "test",
        part: "recall",
        set_size: 4,
        letters_correct: 4,
        perfect_recall: true,
        math_correct: 4,
        math_total: 4,
        mean_math_rt: 1200,
      });
      dataCollection.push({
        task: "operation-span",
        phase: "test",
        part: "recall",
        set_size: 5,
        letters_correct: 5,
        perfect_recall: true,
        math_correct: 5,
        math_total: 5,
        mean_math_rt: 1100,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.absoluteSpanScore).toBe(9); // 4 + 5 (only perfect trials)
    });

    it("should calculate math accuracy correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "operation-span",
        phase: "test",
        part: "recall",
        set_size: 3,
        letters_correct: 3,
        perfect_recall: true,
        math_correct: 2,
        math_total: 3,
        mean_math_rt: 1000,
      });
      dataCollection.push({
        task: "operation-span",
        phase: "test",
        part: "recall",
        set_size: 4,
        letters_correct: 4,
        perfect_recall: true,
        math_correct: 4,
        math_total: 4,
        mean_math_rt: 1200,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      // 6/7 = 0.857...
      expect(scores.mathAccuracy).toBeCloseTo(6 / 7, 2);
    });

    it("should calculate mean math RT", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "operation-span",
        phase: "test",
        part: "recall",
        set_size: 3,
        letters_correct: 3,
        perfect_recall: true,
        math_correct: 3,
        math_total: 3,
        mean_math_rt: 1000,
      });
      dataCollection.push({
        task: "operation-span",
        phase: "test",
        part: "recall",
        set_size: 4,
        letters_correct: 4,
        perfect_recall: true,
        math_correct: 4,
        math_total: 4,
        mean_math_rt: 1200,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.meanMathRT).toBe(1100);
    });

    it("should include task info in getSummary", () => {
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("operation-span");
      expect(summary.version).toBeDefined();
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("operation-span");
      expect(utils.constants.VERSION).toBeDefined();
    });

    it("should export default options", () => {
      expect(utils.constants.DEFAULT_OPTIONS.setSizes).toEqual([3, 4, 5, 6, 7]);
      expect(utils.constants.DEFAULT_OPTIONS.trialsPerSetSize).toBe(3);
      expect(utils.constants.DEFAULT_OPTIONS.letterDuration).toBe(800);
    });
  });

  describe("utils.text", () => {
    it("should export default text configuration", () => {
      expect(utils.text).toBeDefined();
      expect(utils.text.instruction_pages).toBeDefined();
      expect(utils.text.true_button).toBe("TRUE");
      expect(utils.text.false_button).toBe("FALSE");
    });

    it("should have recall feedback function", () => {
      expect(typeof utils.text.recall_feedback).toBe("function");
      expect(utils.text.recall_feedback(3, 5)).toContain("3");
      expect(utils.text.recall_feedback(3, 5)).toContain("5");
    });
  });
});
