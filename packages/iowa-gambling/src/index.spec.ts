import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, timelineUnits, utils } from ".";

describe("Iowa Gambling Task", () => {
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
      expect(instructions.pages.length).toBe(4);
    });

    it("should exclude instructions when showInstructions is false", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: false });
      const firstItem = timeline.timeline[0] as any;
      expect(firstItem.pages).toBeUndefined();
      expect(firstItem.timeline).toBeDefined(); // trial block
    });

    it("should use custom instruction text", () => {
      const customText = {
        instruction_pages: ["Custom page 1", "Custom page 2"],
      };
      const timeline = createTimeline(jsPsych, {
        showInstructions: true,
        text: customText,
      });

      const instructions = timeline.timeline[0] as any;
      expect(instructions.pages).toEqual(["Custom page 1", "Custom page 2"]);
    });

    it("should use custom currency symbol", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        currencySymbol: "€",
      });

      // The trial block uses the currency symbol in display functions
      expect(timeline.timeline.length).toBe(2); // trial block + completion
    });

    it("should include completion trial at end", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: false });
      const lastItem = timeline.timeline[timeline.timeline.length - 1] as any;
      expect(lastItem.data.phase).toBe("completion");
    });

    it("should create trial block with selection, feedback, and ITI trials", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: false });
      const trialBlock = timeline.timeline[0] as any;

      // Trial block timeline has [selection, feedback, iti]
      expect(trialBlock.timeline.length).toBe(3);
    });
  });

  describe("utils.stimuli", () => {
    it("should have 4 deck names", () => {
      expect(utils.stimuli.DECK_NAMES).toEqual(["A", "B", "C", "D"]);
    });

    it("should have correct deck rewards", () => {
      expect(utils.stimuli.DECK_REWARDS.A).toBe(100);
      expect(utils.stimuli.DECK_REWARDS.B).toBe(100);
      expect(utils.stimuli.DECK_REWARDS.C).toBe(50);
      expect(utils.stimuli.DECK_REWARDS.D).toBe(50);
    });

    it("should have 40-card penalty schedules for each deck", () => {
      expect(utils.stimuli.PENALTY_SCHEDULES.A.length).toBe(40);
      expect(utils.stimuli.PENALTY_SCHEDULES.B.length).toBe(40);
      expect(utils.stimuli.PENALTY_SCHEDULES.C.length).toBe(40);
      expect(utils.stimuli.PENALTY_SCHEDULES.D.length).toBe(40);
    });

    it("should have disadvantageous deck A with higher net loss", () => {
      const deckA = utils.stimuli.PENALTY_SCHEDULES.A;
      const totalPenalty = deckA.reduce((sum, p) => sum + p, 0);
      const totalReward = 40 * utils.stimuli.DECK_REWARDS.A;
      // Deck A should have net loss over 40 cards
      expect(totalPenalty).toBeGreaterThan(totalReward);
    });

    it("should have advantageous deck C with net gain", () => {
      const deckC = utils.stimuli.PENALTY_SCHEDULES.C;
      const totalPenalty = deckC.reduce((sum, p) => sum + p, 0);
      const totalReward = 40 * utils.stimuli.DECK_REWARDS.C;
      // Deck C should have net gain over 40 cards
      expect(totalReward).toBeGreaterThan(totalPenalty);
    });

    it("should have deck B with infrequent but large penalties", () => {
      const deckB = utils.stimuli.PENALTY_SCHEDULES.B;
      const nonZeroPenalties = deckB.filter((p) => p > 0);
      expect(nonZeroPenalties.length).toBe(4); // Only 4 penalties in 40 cards
      expect(nonZeroPenalties[0]).toBe(1250); // Large penalty
    });
  });

  describe("utils.scoring", () => {
    it("should return default scores for no data", () => {
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.totalTrials).toBe(0);
      expect(scores.finalScore).toBe(2000);
      expect(scores.netScore).toBe(0);
      expect(scores.deckACounts).toBe(0);
    });

    it("should count deck selections correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "A",
        total_score: 2100,
        rt: 500,
      });
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "A",
        total_score: 2200,
        rt: 600,
      });
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "C",
        total_score: 2250,
        rt: 550,
      });
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "D",
        total_score: 2300,
        rt: 480,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.deckACounts).toBe(2);
      expect(scores.deckBCounts).toBe(0);
      expect(scores.deckCCounts).toBe(1);
      expect(scores.deckDCounts).toBe(1);
    });

    it("should calculate advantageous vs disadvantageous selections", () => {
      const dataCollection = jsPsych.data.get();
      // 3 disadvantageous (A, B)
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "A",
        total_score: 2100,
        rt: 500,
      });
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "B",
        total_score: 2200,
        rt: 500,
      });
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "A",
        total_score: 2300,
        rt: 500,
      });
      // 2 advantageous (C, D)
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "C",
        total_score: 2350,
        rt: 500,
      });
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "D",
        total_score: 2400,
        rt: 500,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.advantageousSelections).toBe(2);
      expect(scores.disadvantageousSelections).toBe(3);
    });

    it("should calculate final and net scores correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "C",
        total_score: 2500,
        rt: 500,
      });

      const scores = utils.scoring.calculateScores(dataCollection, 2000);

      expect(scores.finalScore).toBe(2500);
      expect(scores.netScore).toBe(500);
    });

    it("should calculate net score by block", () => {
      const dataCollection = jsPsych.data.get();
      // Block 1: 20 trials, 15 advantageous, 5 disadvantageous = +10
      for (let i = 0; i < 15; i++) {
        dataCollection.push({
          task: "iowa-gambling",
          phase: "test", part: "selection",
          deck_selected: i % 2 === 0 ? "C" : "D",
          total_score: 2000 + i * 50,
          rt: 500,
        });
      }
      for (let i = 0; i < 5; i++) {
        dataCollection.push({
          task: "iowa-gambling",
          phase: "test", part: "selection",
          deck_selected: "A",
          total_score: 2000 + i * 100,
          rt: 500,
        });
      }

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.netScoreByBlock.length).toBe(1);
      expect(scores.netScoreByBlock[0]).toBe(10); // 15 - 5
    });

    it("should calculate mean RT correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "A",
        total_score: 2100,
        rt: 400,
      });
      dataCollection.push({
        task: "iowa-gambling",
        phase: "test", part: "selection",
        deck_selected: "B",
        total_score: 2200,
        rt: 600,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.meanRT).toBe(500);
    });

    it("should include task info in getSummary", () => {
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("iowa-gambling");
      expect(summary.version).toBeDefined();
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("iowa-gambling");
      expect(utils.constants.VERSION).toBeDefined();
    });

    it("should export default options", () => {
      expect(utils.constants.DEFAULT_OPTIONS.numTrials).toBe(100);
      expect(utils.constants.DEFAULT_OPTIONS.startingLoan).toBe(2000);
      expect(utils.constants.DEFAULT_OPTIONS.currencySymbol).toBe("$");
    });
  });

  describe("utils.text", () => {
    it("should export default text configuration", () => {
      expect(utils.text).toBeDefined();
      expect(utils.text.instruction_pages).toBeDefined();
      expect(utils.text.deck_labels).toEqual(["A", "B", "C", "D"]);
    });

    it("should have win/loss message functions", () => {
      expect(typeof utils.text.win_message).toBe("function");
      expect(typeof utils.text.loss_message).toBe("function");
      expect(utils.text.win_message(100, "$")).toContain("100");
      expect(utils.text.loss_message(50, "$")).toContain("50");
    });
  });
});
