import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, timelineUnits, utils } from ".";

describe("BART Task", () => {
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

    it("should create timeline without instructions when show_instructions is false", () => {
      const withInstructions = createTimeline(jsPsych, { show_instructions: true });
      const withoutInstructions = createTimeline(jsPsych, { show_instructions: false });

      expect(withoutInstructions.timeline.length).toBeLessThan(withInstructions.timeline.length);
    });

    it("should create correct number of blocks with inter-block breaks", () => {
      const timeline = createTimeline(jsPsych, {
        num_blocks: 3,
        trials_per_block: 5,
        show_instructions: false,
        show_end_results: false,
      });

      // Structure: [block1_trials[], break, block2_trials[], break, block3_trials[]]
      // 3 blocks + 2 breaks = 5 items
      expect(timeline.timeline.length).toBe(5);

      // Verify blocks are arrays of trials
      const block1 = timeline.timeline[0] as any[];
      const block2 = timeline.timeline[2] as any[];
      const block3 = timeline.timeline[4] as any[];

      expect(Array.isArray(block1)).toBe(true);
      expect(Array.isArray(block2)).toBe(true);
      expect(Array.isArray(block3)).toBe(true);

      // Verify breaks are between blocks
      const break1 = timeline.timeline[1] as any;
      const break2 = timeline.timeline[3] as any;
      expect(break1.data.phase).toBe("block-break");
      expect(break2.data.phase).toBe("block-break");
    });

    it("should create correct number of trials per block", () => {
      const timeline = createTimeline(jsPsych, {
        num_blocks: 2,
        trials_per_block: 7,
        show_instructions: false,
        show_end_results: false,
      });

      const block1 = timeline.timeline[0] as any[];
      const block2 = timeline.timeline[2] as any[];

      expect(block1.length).toBe(7);
      expect(block2.length).toBe(7);

      // Verify each trial has correct phase
      block1.forEach((trial) => {
        expect(trial.data.phase).toBe("trial");
      });
    });

    it("should apply points_per_pump to all trials", () => {
      const timeline = createTimeline(jsPsych, {
        points_per_pump: 5,
        num_blocks: 1,
        trials_per_block: 3,
        show_instructions: false,
        show_end_results: false,
      });

      const block = timeline.timeline[0] as any[];
      block.forEach((trial) => {
        expect(trial.points_per_pump).toBe(5);
      });
    });

    it("should set pop_threshold within min_pumps and max_pumps range", () => {
      const timeline = createTimeline(jsPsych, {
        min_pumps: 5,
        max_pumps: 10,
        num_blocks: 1,
        trials_per_block: 20,
        show_instructions: false,
        show_end_results: false,
      });

      const block = timeline.timeline[0] as any[];
      block.forEach((trial) => {
        expect(trial.pop_threshold).toBeGreaterThanOrEqual(5);
        expect(trial.pop_threshold).toBeLessThanOrEqual(10);
      });
    });

    it("should include end results screen when show_end_results is true", () => {
      const timeline = createTimeline(jsPsych, {
        num_blocks: 1,
        trials_per_block: 3,
        show_instructions: false,
        show_end_results: true,
      });

      // Structure: [block_trials[], end_results]
      const lastItem = timeline.timeline[timeline.timeline.length - 1] as any;
      expect(lastItem.data.phase).toBe("end-results");
      expect(typeof lastItem.stimulus).toBe("function");
    });

    it("should exclude end results screen when show_end_results is false", () => {
      const timeline = createTimeline(jsPsych, {
        num_blocks: 1,
        trials_per_block: 3,
        show_instructions: false,
        show_end_results: false,
      });

      // Only the block should be present
      expect(timeline.timeline.length).toBe(1);
      expect(Array.isArray(timeline.timeline[0])).toBe(true);
    });

    it("should apply custom button labels to trials", () => {
      const timeline = createTimeline(jsPsych, {
        text: {
          pump_button: "Inflar",
          collect_button: "Recoger",
        },
        num_blocks: 1,
        trials_per_block: 2,
        show_instructions: false,
        show_end_results: false,
      });

      const block = timeline.timeline[0] as any[];
      block.forEach((trial) => {
        expect(trial.pump_button_label).toBe("Inflar");
        expect(trial.collect_button_label).toBe("Recoger");
      });
    });
  });

  describe("timelineUnits", () => {
    it("should create interactive instructions", () => {
      const instructions = timelineUnits.createInteractiveInstructions(jsPsych);

      expect(instructions).toHaveProperty("timeline");
      expect(Array.isArray(instructions.timeline)).toBe(true);
      expect(instructions.timeline.length).toBeGreaterThan(0);
    });

    it("should create trial block", () => {
      // createTrialBlock(maxPumps, minPumps, pointsPerPump, totalTrials, texts) returns array of trials
      const trials = timelineUnits.createTrialBlock(10, 3, 1, 3, utils.text);

      expect(Array.isArray(trials)).toBe(true);
      expect(trials.length).toBe(3);
      trials.forEach((trial) => {
        expect(trial).toHaveProperty("type");
        expect(trial.data.task).toBe("bart");
        expect(trial.data.phase).toBe("trial");
      });
    });

    it("should create inter-block break", () => {
      const breakTrial = timelineUnits.createInterBlockBreak(1, 3);

      expect(breakTrial).toHaveProperty("type");
      expect(breakTrial).toHaveProperty("stimulus");
      expect(breakTrial).toHaveProperty("choices");
    });

    it("should create end results screen", () => {
      const results = timelineUnits.createEndResults(jsPsych, utils.text);

      expect(results).toHaveProperty("type");
      expect(results).toHaveProperty("stimulus");
      expect(typeof results.stimulus).toBe("function");
    });
  });

  describe("utils.scoring", () => {
    it("should return empty scores for no data", () => {
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.totalTrials).toBe(0);
      expect(scores.totalPoints).toBe(0);
      expect(scores.poppedTrials).toBe(0);
      expect(scores.collectedTrials).toBe(0);
    });

    it("should calculate scores correctly with trial data", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "bart",
        phase: "trial",
        points_earned: 5,
        pumps: 5,
        popped: false,
      });
      dataCollection.push({
        task: "bart",
        phase: "trial",
        points_earned: 0,
        pumps: 8,
        popped: true,
      });
      dataCollection.push({
        task: "bart",
        phase: "trial",
        points_earned: 3,
        pumps: 3,
        popped: false,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.totalTrials).toBe(3);
      expect(scores.totalPoints).toBe(8); // 5 + 0 + 3
      expect(scores.poppedTrials).toBe(1);
      expect(scores.collectedTrials).toBe(2);
    });

    it("should include task info in getSummary", () => {
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary).toHaveProperty("taskName", "bart");
      expect(summary).toHaveProperty("version");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("bart");
      expect(utils.constants.VERSION).toBeDefined();
    });
  });

  describe("utils.text", () => {
    it("should export default text configuration", () => {
      expect(utils.text).toBeDefined();
      expect(utils.text.pump_button).toBeDefined();
      expect(utils.text.collect_button).toBeDefined();
      expect(utils.text.continue_button).toBeDefined();
    });

    it("should have instruction text strings", () => {
      expect(utils.text.instruction_intro).toBeDefined();
      expect(utils.text.instruction_pump).toBeDefined();
      expect(utils.text.instruction_collect).toBeDefined();
      expect(utils.text.instruction_try_pump).toBeDefined();
      expect(utils.text.instruction_pump_success).toBeDefined();
    });
  });
});
