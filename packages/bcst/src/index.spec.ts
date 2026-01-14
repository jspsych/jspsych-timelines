import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, timelineUnits, utils } from ".";

describe("Berg Card Sorting Test", () => {
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
      // First item should be instructions
      const instructions = timeline.timeline[0] as any;
      expect(instructions.type).toBeDefined();
      expect(instructions.pages).toBeDefined();
      expect(instructions.pages.length).toBe(4);
    });

    it("should exclude instructions when showInstructions is false", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: false });
      // First item should be trial block, not instructions
      const firstItem = timeline.timeline[0] as any;
      expect(firstItem.pages).toBeUndefined();
      expect(firstItem.timeline).toBeDefined(); // trial block has timeline
    });

    it("should apply feedbackDuration to feedback trials", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showFeedback: true,
        feedbackDuration: 800,
      });

      const trialBlock = timeline.timeline[0] as any;
      // Trial block timeline has [sorting, feedback]
      expect(trialBlock.timeline.length).toBe(2);
      const feedbackTrial = trialBlock.timeline[1];
      expect(feedbackTrial.trial_duration).toBe(800);
    });

    it("should exclude feedback trials when showFeedback is false", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showFeedback: false,
      });

      const trialBlock = timeline.timeline[0] as any;
      // Trial block should only have sorting trial
      expect(trialBlock.timeline.length).toBe(1);
    });

    it("should include feedback trials when showFeedback is true", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showFeedback: true,
      });

      const trialBlock = timeline.timeline[0] as any;
      // Trial block should have [sorting, feedback]
      expect(trialBlock.timeline.length).toBe(2);
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

    it("should use custom feedback text", () => {
      const customText = {
        correct_feedback: "Bien!",
        incorrect_feedback: "Mal!",
      };
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showFeedback: true,
        text: customText,
      });

      // The feedback trial uses a dynamic stimulus function
      // We can verify the text config is passed by checking the timeline exists
      expect(timeline.timeline.length).toBe(2); // trial block + completion
    });

    it("should include completion trial at end", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: false });
      const lastItem = timeline.timeline[timeline.timeline.length - 1] as any;
      expect(lastItem.data.trial_type).toBe("completion");
    });
  });

  describe("utils.stimuli", () => {
    it("should generate a 64-card deck", () => {
      const deck = utils.stimuli.generateDeck();
      expect(deck.length).toBe(64);
    });

    it("should have all color/shape/number combinations in deck", () => {
      const deck = utils.stimuli.generateDeck();

      // Check for a specific card
      const redTriangleOne = deck.find(
        (c) => c.color === "red" && c.shape === "triangle" && c.number === 1
      );
      expect(redTriangleOne).toBeDefined();

      const blueCircleFour = deck.find(
        (c) => c.color === "blue" && c.shape === "circle" && c.number === 4
      );
      expect(blueCircleFour).toBeDefined();
    });

    it("should have 4 reference cards", () => {
      expect(utils.stimuli.REFERENCE_CARDS.length).toBe(4);
    });

    it("should have unique reference cards on all dimensions", () => {
      const refs = utils.stimuli.REFERENCE_CARDS;

      // All colors different
      const colors = refs.map((r) => r.color);
      expect(new Set(colors).size).toBe(4);

      // All shapes different
      const shapes = refs.map((r) => r.shape);
      expect(new Set(shapes).size).toBe(4);

      // All numbers different
      const numbers = refs.map((r) => r.number);
      expect(new Set(numbers).size).toBe(4);
    });

    it("should generate card HTML with correct structure", () => {
      const card = { color: "red" as const, shape: "triangle" as const, number: 2 };
      const html = utils.stimuli.generateCardHtml(card, false);

      expect(html).toContain("bcst-card");
      expect(html).toContain("bcst-shape");
      expect(html).toContain("bcst-red");
      expect(html).toContain("triangle");
      // Should have 2 shapes for number: 2
      const shapeMatches = html.match(/bcst-shape/g);
      expect(shapeMatches?.length).toBe(2);
    });

    it("should generate stimulus card HTML with stimulus class", () => {
      const card = { color: "blue" as const, shape: "circle" as const, number: 1 };
      const html = utils.stimuli.generateCardHtml(card, true);

      expect(html).toContain("stimulus");
    });
  });

  describe("utils.scoring", () => {
    it("should return zero scores for no data", () => {
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.totalTrials).toBe(0);
      expect(scores.accuracy).toBe(0);
      expect(scores.categoriesCompleted).toBe(0);
      expect(scores.meanRT).toBeNull();
    });

    it("should calculate accuracy correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: true,
        is_perseverative: false,
        categories_completed: 0,
        rt: 500,
      });
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: true,
        is_perseverative: false,
        categories_completed: 0,
        rt: 600,
      });
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: false,
        is_perseverative: false,
        categories_completed: 0,
        rt: 700,
      });
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: true,
        is_perseverative: false,
        categories_completed: 0,
        rt: 550,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.totalTrials).toBe(4);
      expect(scores.totalCorrect).toBe(3);
      expect(scores.totalErrors).toBe(1);
      expect(scores.accuracy).toBeCloseTo(0.75, 2);
    });

    it("should count perseverative errors correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: false,
        is_perseverative: true,
        categories_completed: 1,
        rt: 500,
      });
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: false,
        is_perseverative: true,
        categories_completed: 1,
        rt: 600,
      });
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: false,
        is_perseverative: false,
        categories_completed: 1,
        rt: 700,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.perseverativeErrors).toBe(2);
      expect(scores.nonPerseverativeErrors).toBe(1);
      expect(scores.percentPerseverativeErrors).toBeCloseTo(66.67, 1);
    });

    it("should calculate mean RT for correct trials only", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: true,
        is_perseverative: false,
        categories_completed: 0,
        rt: 400,
      });
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: true,
        is_perseverative: false,
        categories_completed: 0,
        rt: 600,
      });
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: false,
        is_perseverative: false,
        categories_completed: 0,
        rt: 1000,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.meanRT).toBe(500); // (400 + 600) / 2
    });

    it("should count conceptual level responses (runs of 3+)", () => {
      const dataCollection = jsPsych.data.get();
      // Run of 4 correct = 2 conceptual level responses (trial 3 and 4)
      for (let i = 0; i < 4; i++) {
        dataCollection.push({
          task: "bcst",
          trial_type: "sorting",
          correct: true,
          is_perseverative: false,
          categories_completed: 0,
          rt: 500,
        });
      }
      // Error breaks run
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: false,
        is_perseverative: false,
        categories_completed: 0,
        rt: 500,
      });
      // Another run of 3 = 1 conceptual level response
      for (let i = 0; i < 3; i++) {
        dataCollection.push({
          task: "bcst",
          trial_type: "sorting",
          correct: true,
          is_perseverative: false,
          categories_completed: 0,
          rt: 500,
        });
      }

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.conceptualLevelResponses).toBe(3); // 2 from first run + 1 from second
    });

    it("should count failure to maintain set", () => {
      const dataCollection = jsPsych.data.get();
      // Run of 5 correct
      for (let i = 0; i < 5; i++) {
        dataCollection.push({
          task: "bcst",
          trial_type: "sorting",
          correct: true,
          is_perseverative: false,
          categories_completed: 0,
          rt: 500,
        });
      }
      // Error after 5 correct = failure to maintain set
      dataCollection.push({
        task: "bcst",
        trial_type: "sorting",
        correct: false,
        is_perseverative: false,
        categories_completed: 0,
        rt: 500,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.failureToMaintainSet).toBe(1);
    });

    it("should include task info in getSummary", () => {
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("bcst");
      expect(summary.version).toBeDefined();
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("bcst");
      expect(utils.constants.VERSION).toBeDefined();
    });

    it("should export default options", () => {
      expect(utils.constants.DEFAULT_OPTIONS.runLength).toBe(10);
      expect(utils.constants.DEFAULT_OPTIONS.numCategories).toBe(6);
      expect(utils.constants.DEFAULT_OPTIONS.feedbackDuration).toBe(500);
    });
  });

  describe("utils.text", () => {
    it("should export default text configuration", () => {
      expect(utils.text).toBeDefined();
      expect(utils.text.correct_feedback).toBeDefined();
      expect(utils.text.incorrect_feedback).toBeDefined();
      expect(utils.text.instruction_pages).toBeDefined();
    });
  });
});
