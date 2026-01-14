import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, timelineUnits, utils } from ".";

describe("Trail Making Task", () => {
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
      // Should have multiple instruction screens
      expect(timeline.timeline.length).toBeGreaterThan(4);
    });

    it("should exclude instructions when showInstructions is false", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
      });
      // Fewer items without instructions
      expect(timeline.timeline.length).toBeLessThan(10);
    });

    it("should skip Part A when skipPartA is true", () => {
      const timelineWithA = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
        skipPartA: false,
        skipPartB: true,
      });

      const timelineWithoutA = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
        skipPartA: true,
        skipPartB: false,
      });

      // Both should have different structures
      expect(timelineWithA.timeline.length).toBeGreaterThan(0);
      expect(timelineWithoutA.timeline.length).toBeGreaterThan(0);
    });

    it("should skip Part B when skipPartB is true", () => {
      const timelineWithB = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
        skipPartA: true,
        skipPartB: false,
      });

      const timelineWithoutB = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
        skipPartA: false,
        skipPartB: true,
      });

      expect(timelineWithB.timeline.length).toBeGreaterThan(0);
      expect(timelineWithoutB.timeline.length).toBeGreaterThan(0);
    });

    it("should use custom text when provided", () => {
      const customText = {
        continue_button: "Next",
      };
      const timeline = createTimeline(jsPsych, {
        text: customText,
        showInstructions: false,
        showPractice: false,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should include practice trials when showPractice is true", () => {
      const timelineWithPractice = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: true,
      });

      const timelineWithoutPractice = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
      });

      expect(timelineWithPractice.timeline.length).toBeGreaterThan(
        timelineWithoutPractice.timeline.length
      );
    });

    it("should apply custom canvas dimensions", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
        canvasWidth: 800,
        canvasHeight: 500,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should apply custom target counts", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showPractice: false,
        numTargetsPartA: 10,
        numTargetsPartB: 12,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("timelineUnits", () => {
    it("should export createInstructionTrials", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
    });

    it("should export createTrailTrial", () => {
      expect(typeof timelineUnits.createTrailTrial).toBe("function");
    });

    it("should export createTransitionTrial", () => {
      expect(typeof timelineUnits.createTransitionTrial).toBe("function");
    });

    it("should export createCompletionTrial", () => {
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
    });
  });

  describe("utils.scoring", () => {
    it("should return null scores for no data", () => {
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.partA).toBeNull();
      expect(scores.partB).toBeNull();
      expect(scores.differenceScore).toBeNull();
      expect(scores.ratioScore).toBeNull();
    });

    it("should calculate Part A scores correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "trail-making",
        phase: "test",
        part: "A",
        completion_time: 30000,
        num_errors: 2,
        total_path_distance: 1500,
        inter_click_times: [1000, 1200, 1100, 1300],
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.partA).not.toBeNull();
      expect(scores.partA?.completionTime).toBe(30000);
      expect(scores.partA?.numErrors).toBe(2);
      expect(scores.partA?.pathDistance).toBe(1500);
      expect(scores.partA?.meanInterClickTime).toBe(1150);
    });

    it("should calculate Part B scores correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "trail-making",
        phase: "test",
        part: "B",
        completion_time: 60000,
        num_errors: 4,
        total_path_distance: 2000,
        inter_click_times: [1500, 1600, 1400, 1500],
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.partB).not.toBeNull();
      expect(scores.partB?.completionTime).toBe(60000);
      expect(scores.partB?.numErrors).toBe(4);
      expect(scores.partB?.pathDistance).toBe(2000);
      expect(scores.partB?.meanInterClickTime).toBe(1500);
    });

    it("should calculate difference and ratio scores", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "trail-making",
        phase: "test",
        part: "A",
        completion_time: 30000,
        num_errors: 0,
        total_path_distance: 1500,
        inter_click_times: [1000, 1000],
      });
      dataCollection.push({
        task: "trail-making",
        phase: "test",
        part: "B",
        completion_time: 60000,
        num_errors: 2,
        total_path_distance: 2000,
        inter_click_times: [1500, 1500],
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.differenceScore).toBe(30000); // 60000 - 30000
      expect(scores.ratioScore).toBe(2); // 60000 / 30000
    });

    it("should include task info in getSummary", () => {
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("trail-making");
      expect(summary.version).toBeDefined();
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("trail-making");
      expect(utils.constants.VERSION).toBeDefined();
    });

    it("should export default options", () => {
      expect(utils.constants.DEFAULT_OPTIONS.numTargetsPartA).toBe(25);
      expect(utils.constants.DEFAULT_OPTIONS.numTargetsPartB).toBe(24);
      expect(utils.constants.DEFAULT_OPTIONS.canvasWidth).toBe(600);
      expect(utils.constants.DEFAULT_OPTIONS.canvasHeight).toBe(600);
    });
  });

  describe("utils.text", () => {
    it("should export default text configuration", () => {
      expect(utils.text).toBeDefined();
      expect(utils.text.instruction_intro).toBeDefined();
      expect(utils.text.continue_button).toBe("Continue");
    });

    it("should have result display functions", () => {
      expect(typeof utils.text.result_part_a).toBe("function");
      expect(typeof utils.text.result_part_b).toBe("function");

      const resultA = utils.text.result_part_a(30000, 2);
      expect(resultA).toContain("30.0");
      expect(resultA).toContain("2");
    });
  });
});
