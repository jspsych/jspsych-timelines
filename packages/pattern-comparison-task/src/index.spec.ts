import { JsPsych } from "jspsych";
import { createTimeline, utils, timelineUnits, trial_text, instruction_pages } from "./index";
import { test_categories } from "./test-categories";

// Mock jsPsych instance
const mockJsPsych = {} as JsPsych;

// Mock Math.random for predictable tests
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn();
global.Math = mockMath;

describe("Pattern Comparison Task", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMath.random.mockReturnValue(0.5);
  });

  describe("createTimeline", () => {
    it("should create a basic timeline with default configuration", () => {
      const timeline = createTimeline(mockJsPsych);
      
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeInstanceOf(Array);
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should create timeline with custom number of trials", () => {
      const customTrials = 5;
      const timeline = createTimeline(mockJsPsych, { num_trials: customTrials });
      
      // Timeline should have (trials * 2 - 1) + 1 = trials + inter-trial intervals + end screen
      // For 5 trials: 5 trials + 4 inter-trial intervals + 1 end screen = 10 items
      expect(timeline.timeline).toHaveLength(10);
    });

    it("should include instructions when show_instructions is true", () => {
      const timeline = createTimeline(mockJsPsych, { show_instructions: true });
      
      expect(timeline.timeline).toHaveLength(2); // instructions + main task
      expect(timeline.timeline[0].timeline).toBeDefined(); // instructions timeline
      expect(timeline.timeline[1].timeline).toBeDefined(); // main task timeline
    });

    it("should use custom button text", () => {
      const customConfig = {
        same_button_text: "Identical",
        different_button_text: "Not Identical",
        num_trials: 1
      };
      const timeline = createTimeline(mockJsPsych, customConfig);
      
      const firstTrial = timeline.timeline[0];
      expect(firstTrial.choices).toEqual(["Identical", "Not Identical"]);
    });

    it("should use custom prompt text", () => {
      const customPrompt = "Do these patterns match?";
      const timeline = createTimeline(mockJsPsych, { 
        prompt: customPrompt,
        num_trials: 1 
      });
      
      const firstTrial = timeline.timeline[0];
      expect(firstTrial.stimulus).toContain(customPrompt);
    });

    it("should set custom trial timeout", () => {
      const customTimeout = 5000;
      const timeline = createTimeline(mockJsPsych, { 
        trial_timeout: customTimeout,
        num_trials: 1 
      });
      
      const firstTrial = timeline.timeline[0];
      expect(firstTrial.trial_duration).toBe(customTimeout);
    });

    it("should handle custom test categories", () => {
      const customCategories = [
        {
          "test_shape": [
            '<svg><rect width="100" height="100" fill="red"/></svg>',
            '<svg><rect width="100" height="100" fill="blue"/></svg>'
          ]
        }
      ];
      
      const timeline = createTimeline(mockJsPsych, { 
        test_categories: customCategories,
        num_trials: 1 
      });
      
      const firstTrial = timeline.timeline[0];
      expect(firstTrial.data.category_index).toBe(0);
      expect(firstTrial.data.test_name).toBe("test_shape");
    });
  });

  describe("utils.generateTrials", () => {
    it("should generate the correct number of trials", () => {
      const trials = utils.generateTrials({ num_trials: 10 });
      expect(trials).toHaveLength(10);
    });

    it("should generate trials with required properties", () => {
      const trials = utils.generateTrials({ num_trials: 1 });
      const trial = trials[0];
      
      expect(trial).toHaveProperty("pattern1");
      expect(trial).toHaveProperty("pattern2");
      expect(trial).toHaveProperty("correct_answer");
      expect(trial).toHaveProperty("category_index");
      expect(trial).toHaveProperty("test_name");
      expect(trial).toHaveProperty("is_same");
    });

    it("should generate 'same' trials when patterns are identical", () => {
      mockMath.random.mockReturnValue(0.3); // < 0.5, so is_same = true
      
      const trials = utils.generateTrials({ num_trials: 1 });
      const trial = trials[0];
      
      expect(trial.is_same).toBe(true);
      expect(trial.correct_answer).toBe(0);
      expect(trial.pattern1).toBe(trial.pattern2);
    });

    it("should generate 'different' trials when patterns differ", () => {
      mockMath.random.mockReturnValue(0.7); // > 0.5, so is_same = false
      
      const trials = utils.generateTrials({ num_trials: 1 });
      const trial = trials[0];
      
      expect(trial.is_same).toBe(false);
      expect(trial.correct_answer).toBe(1);
      expect(trial.pattern1).not.toBe(trial.pattern2);
    });

    it("should use custom test categories", () => {
      const customCategories = [
        {
          "custom_test": [
            '<svg>original</svg>',
            '<svg>modified</svg>'
          ]
        }
      ];
      
      const trials = utils.generateTrials({ 
        test_categories: customCategories,
        num_trials: 1 
      });
      
      expect(trials[0].test_name).toBe("custom_test");
      expect(trials[0].category_index).toBe(0);
    });
  });

  describe("utils.calculatePerformance", () => {
    const mockTrialData = [
      { task: 'pattern-comparison', correct: true, rt: 1000, category_index: 0 },
      { task: 'pattern-comparison', correct: false, rt: 1500, category_index: 0 },
      { task: 'pattern-comparison', correct: true, rt: 800, category_index: 1 },
      { task: 'pattern-comparison', correct: true, rt: null, category_index: 1 },
      { task: 'instruction-page', correct: true, rt: 500, category_index: 0 }, // Should be filtered out
    ];

    it("should calculate overall performance correctly", () => {
      const performance = utils.calculatePerformance(mockTrialData);
      
      expect(performance.overall.total_trials).toBe(4);
      expect(performance.overall.correct_trials).toBe(3);
      expect(performance.overall.accuracy).toBe(75);
      expect(performance.overall.mean_reaction_time).toBe(900); // (1000 + 800) / 2
    });

    it("should calculate performance by category", () => {
      const performance = utils.calculatePerformance(mockTrialData);
      
      // Category 0: 1 correct out of 2 trials
      expect(performance.by_category[0].accuracy).toBe(50);
      expect(performance.by_category[0].total_trials).toBe(2);
      expect(performance.by_category[0].correct_trials).toBe(1);
      expect(performance.by_category[0].mean_reaction_time).toBe(1000);
      
      // Category 1: 2 correct out of 2 trials (one with null rt)
      expect(performance.by_category[1].accuracy).toBe(100);
      expect(performance.by_category[1].total_trials).toBe(2);
      expect(performance.by_category[1].correct_trials).toBe(2);
      expect(performance.by_category[1].mean_reaction_time).toBe(800); // Only non-null rt
    });

    it("should handle empty data", () => {
      const performance = utils.calculatePerformance([]);
      
      expect(performance.overall.accuracy).toBe(0);
      expect(performance.overall.mean_reaction_time).toBe(null);
      expect(performance.overall.total_trials).toBe(0);
    });

    it("should filter out non-task data", () => {
      const mixedData = [
        { task: 'pattern-comparison', correct: true, rt: 1000, category_index: 0 },
        { task: 'instruction-page', correct: true, rt: 500, category_index: 0 },
        { task: 'something-else', correct: false, rt: 2000, category_index: 0 },
      ];
      
      const performance = utils.calculatePerformance(mixedData);
      expect(performance.overall.total_trials).toBe(1);
    });
  });

  describe("utils.createInstructions", () => {
    it("should create instruction configuration with default pages", () => {
      const instructions = utils.createInstructions();
      
      expect(instructions.pages).toBeInstanceOf(Array);
      expect(instructions.pages.length).toBe(instruction_pages.length);
      expect(instructions.type).toBeDefined();
    });

    it("should create instruction configuration with custom pages", () => {
      const customPages = [
        "<h2>Custom Header</h2><p>Custom description</p>"
      ];
      
      const instructions = utils.createInstructions(customPages);
      
      expect(instructions.pages).toHaveLength(1);
      expect(instructions.pages[0]).toContain("Custom Header");
      expect(instructions.pages[0]).toContain("Custom description");
    });

    it("should handle pages with strategy points", () => {
      const customPages = [
        "<section><h3>Strategy</h3><ul><li>Step 1</li><li>Step 2</li><li>Step 3</li></ul></section>"
      ];
      
      const instructions = utils.createInstructions(customPages);
      const page = instructions.pages[0];
      
      expect(page).toContain("Strategy");
      expect(page).toContain("Step 1");
      expect(page).toContain("Step 2");
      expect(page).toContain("Step 3");
    });

    it("should handle missing optional fields gracefully", () => {
      const minimalPages = [
        ""
      ];
      
      const instructions = utils.createInstructions(minimalPages);
      expect(instructions.pages).toHaveLength(1);
      expect(instructions.pages[0]).toBeDefined();
    });
  });

  describe("Exports", () => {
    it("should export trial_text configuration", () => {
      expect(trial_text).toBeDefined();
      expect(trial_text.same_button).toBe("Same");
      expect(trial_text.different_button).toBe("Different");
      expect(trial_text.prompt).toBe("Are these two patterns the same?");
    });

    it("should export instruction_pages configuration", () => {
      expect(instruction_pages).toBeDefined();
      expect(instruction_pages).toBeInstanceOf(Array);
      expect(instruction_pages.length).toBeGreaterThan(0);
    });

    it("should export timelineUnits descriptions", () => {
      expect(timelineUnits).toBeDefined();
      expect(timelineUnits.instructions).toBeDefined();
      expect(timelineUnits.trial).toBeDefined();
      expect(timelineUnits.interTrialInterval).toBeDefined();
      expect(timelineUnits.endScreen).toBeDefined();
    });

    it("should export utils object with required functions", () => {
      expect(utils).toBeDefined();
      expect(typeof utils.generateTrials).toBe("function");
      expect(typeof utils.createInstructions).toBe("function");
      expect(typeof utils.calculatePerformance).toBe("function");
    });
  });

  describe("Trial Data Structure", () => {
    it("should create trials with correct data structure", () => {
      const timeline = createTimeline(mockJsPsych, { num_trials: 1 });
      const trial = timeline.timeline[0];
      
      expect(trial.data).toHaveProperty("task", "pattern-comparison");
      expect(trial.data).toHaveProperty("trial_number", 1);
      expect(trial.data).toHaveProperty("correct_answer");
      expect(trial.data).toHaveProperty("category_index");
      expect(trial.data).toHaveProperty("test_name");
      expect(trial.data).toHaveProperty("is_same");
      expect(trial.data).toHaveProperty("pattern1");
      expect(trial.data).toHaveProperty("pattern2");
    });

    it("should set correct answer based on trial type", () => {
      // Test same trial
      mockMath.random.mockReturnValue(0.3); // is_same = true
      let timeline = createTimeline(mockJsPsych, { num_trials: 1 });
      expect(timeline.timeline[0].data.correct_answer).toBe(0);
      
      // Test different trial
      mockMath.random.mockReturnValue(0.7); // is_same = false
      timeline = createTimeline(mockJsPsych, { num_trials: 1 });
      expect(timeline.timeline[0].data.correct_answer).toBe(1);
    });
  });

  describe("Integration with test_categories", () => {
    it("should use default test categories when none provided", () => {
      const timeline = createTimeline(mockJsPsych, { num_trials: 1 });
      const trial = timeline.timeline[0];
      
      expect(trial.data.category_index).toBeGreaterThanOrEqual(0);
      expect(trial.data.category_index).toBeLessThan(test_categories.length);
      expect(trial.data.test_name).toBeDefined();
    });
  });
});