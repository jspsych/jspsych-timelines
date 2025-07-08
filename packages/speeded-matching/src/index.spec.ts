import { JsPsych } from "jspsych";
import { createTimeline, utils, timelineUnits, trial_text, instruction_pages } from "./index";
import { test_items } from "./test-items";

// Mock jsPsych instance
const mockJsPsych = {} as JsPsych;

// Mock Web Speech API
const mockSpeechSynthesis = {
  cancel: jest.fn(),
  speak: jest.fn(),
  getVoices: jest.fn().mockReturnValue([{ name: 'Test Voice' }]),
  addEventListener: jest.fn()
};

const mockSpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  rate: 0.8,
  volume: 0.8,
  voice: null
}));

// Set up global mocks
global.speechSynthesis = mockSpeechSynthesis as any;
global.SpeechSynthesisUtterance = mockSpeechSynthesisUtterance as any;
global.window = { speechSynthesis: mockSpeechSynthesis } as any;

// Mock Math.random for predictable tests
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn();
global.Math = mockMath;

// Mock DOM methods
const mockQuerySelector = jest.fn();
const mockQuerySelectorAll = jest.fn();
const mockAddEventListener = jest.fn();
const mockClassList = {
  add: jest.fn(),
  remove: jest.fn()
};

global.document = {
  querySelector: mockQuerySelector,
  querySelectorAll: mockQuerySelectorAll
} as any;

describe("Speeded Matching Task", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMath.random.mockReturnValue(0.5);
    mockQuerySelector.mockReturnValue({
      style: { setProperty: jest.fn() }
    });
    mockQuerySelectorAll.mockReturnValue([
      { addEventListener: mockAddEventListener, classList: mockClassList },
      { addEventListener: mockAddEventListener, classList: mockClassList }
    ]);
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
      
      // Count actual speeded-matching-trial items
      const mainTrials = timeline.timeline.filter(
        (item: any) => item.data?.task === 'speeded-matching-trial'
      );
      expect(mainTrials).toHaveLength(customTrials);
    });

    it("should include instructions when show_instructions is true", () => {
      const timeline = createTimeline(mockJsPsych, { show_instructions: true });
      
      // Should contain instruction trial
      const hasInstructions = timeline.timeline.some(
        (item: any) => item.data?.task === 'instruction-pages'
      );
      expect(hasInstructions).toBe(true);
    });

    it("should include practice round when show_practice is true", () => {
      const timeline = createTimeline(mockJsPsych, { show_practice: true });
      
      // Should contain practice trials
      const hasPractice = timeline.timeline.some(
        (item: any) => item.data?.task?.includes('practice')
      );
      expect(hasPractice).toBe(true);
    });

    it("should use custom number of choices", () => {
      const customChoices = 6;
      const timeline = createTimeline(mockJsPsych, { 
        num_choices: customChoices,
        num_trials: 1,
        show_instructions: false,
        show_practice: false
      });
      
      const mainTrial = timeline.timeline.find(
        (item: any) => item.data?.task === 'speeded-matching-trial'
      );
      expect(mainTrial.choices).toHaveLength(customChoices);
    });

    it("should set custom trial timeout", () => {
      const customTimeout = 5000;
      const timeline = createTimeline(mockJsPsych, { 
        trial_timeout: customTimeout,
        num_trials: 1,
        show_instructions: false,
        show_practice: false
      });
      
      const mainTrial = timeline.timeline.find(
        (item: any) => item.data?.task === 'speeded-matching-trial'
      );
      expect(mainTrial.trial_duration).toBe(customTimeout);
    });

    it("should use custom test items", () => {
      const customItems = [
        '<svg><rect width="50" height="50" fill="red"/></svg>',
        '<svg><circle cx="25" cy="25" r="25" fill="blue"/></svg>'
      ];
      
      const timeline = createTimeline(mockJsPsych, { 
        test_items: customItems,
        num_trials: 1,
        show_instructions: false,
        show_practice: false
      });
      
      const mainTrial = timeline.timeline.find(
        (item: any) => item.data?.task === 'speeded-matching-trial'
      );
      expect(customItems).toContain(mainTrial.data.target);
    });

    it("should set custom inter-trial interval", () => {
      const customInterval = 1000;
      const timeline = createTimeline(mockJsPsych, { 
        inter_trial_interval: customInterval,
        num_trials: 2,
        show_instructions: false,
        show_practice: false
      });
      
      const intervalTrial = timeline.timeline.find(
        (item: any) => item.data?.task === 'inter-trial-interval'
      );
      expect(intervalTrial.trial_duration).toBe(customInterval);
    });

    it("should skip inter-trial interval when set to 0", () => {
      const timeline = createTimeline(mockJsPsych, { 
        inter_trial_interval: 0,
        num_trials: 2,
        show_instructions: false,
        show_practice: false
      });
      
      const intervalTrials = timeline.timeline.filter(
        (item: any) => item.data?.task === 'inter-trial-interval'
      );
      expect(intervalTrials).toHaveLength(0);
    });

    it("should include end screen", () => {
      const timeline = createTimeline(mockJsPsych, { 
        num_trials: 1,
        show_instructions: false,
        show_practice: false
      });
      
      const endScreen = timeline.timeline.find(
        (item: any) => item.data?.task === 'end-screen'
      );
      expect(endScreen).toBeDefined();
      expect(endScreen.stimulus).toContain(trial_text.task_complete_header);
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
      
      expect(trial).toHaveProperty("target");
      expect(trial).toHaveProperty("choices");
      expect(trial).toHaveProperty("correct_answer");
      expect(trial).toHaveProperty("target_index");
      expect(trial).toHaveProperty("trial_number");
    });

    it("should use default test items when none provided", () => {
      const trials = utils.generateTrials({ num_trials: 1 });
      const trial = trials[0];
      
      expect(test_items).toContain(trial.target);
      expect(trial.choices.every((choice: string) => test_items.includes(choice))).toBe(true);
    });

    it("should use custom test items", () => {
      const customItems = [
        '<svg>item1</svg>',
        '<svg>item2</svg>',
        '<svg>item3</svg>',
        '<svg>item4</svg>'
      ];
      
      const trials = utils.generateTrials({ 
        test_items: customItems,
        num_trials: 1 
      });
      
      const trial = trials[0];
      expect(customItems).toContain(trial.target);
      expect(trial.choices.every((choice: string) => customItems.includes(choice))).toBe(true);
    });

    it("should ensure target is included in choices", () => {
      const trials = utils.generateTrials({ num_trials: 5 });
      
      trials.forEach(trial => {
        expect(trial.choices).toContain(trial.target);
        expect(trial.choices[trial.correct_answer]).toBe(trial.target);
      });
    });

    it("should generate trials with variety in targets", () => {
      // Mock Math.random to return different values for variety
      const mockMath = jest.spyOn(Math, 'random');
      
      // Provide plenty of different random values for target selection and shuffling
      const randomValues = [
        0.1, 0.5, 0.9, 0.2, 0.7,  // Target indices
        0.3, 0.8, 0.4, 0.6, 0.9,  // Shuffling values
        0.2, 0.7, 0.1, 0.8, 0.4,  // More shuffling values
        0.6, 0.3, 0.9, 0.1, 0.5   // Additional values
      ];
      
      randomValues.forEach(value => {
        mockMath.mockReturnValueOnce(value);
      });
      
      try {
        const trials = utils.generateTrials({ num_trials: 5 });
        
        // Check that we get variety in targets
        const uniqueTargets = new Set(trials.map(t => t.target));
        expect(uniqueTargets.size).toBeGreaterThan(1);
      } finally {
        // Always restore the mock
        mockMath.mockRestore();
      }
    });
  });

  describe("utils.createTrialSet", () => {
    const testItems = ['item1', 'item2', 'item3', 'item4', 'item5'];

    it("should create trial set with correct structure", () => {
      const trialSet = utils.createTrialSet(testItems, 0, 4);
      
      expect(trialSet).toHaveProperty("target");
      expect(trialSet).toHaveProperty("choices");
      expect(trialSet).toHaveProperty("correct_answer");
      expect(trialSet).toHaveProperty("target_index");
    });

    it("should use specified target index", () => {
      const targetIndex = 2;
      const trialSet = utils.createTrialSet(testItems, targetIndex, 4);
      
      expect(trialSet.target).toBe(testItems[targetIndex]);
      expect(trialSet.target_index).toBe(targetIndex);
    });

    it("should create correct number of choices", () => {
      const numChoices = 3;
      const trialSet = utils.createTrialSet(testItems, 0, numChoices);
      
      expect(trialSet.choices).toHaveLength(numChoices);
    });

    it("should include target in choices", () => {
      const trialSet = utils.createTrialSet(testItems, 1, 4);
      
      expect(trialSet.choices).toContain(trialSet.target);
      expect(trialSet.choices[trialSet.correct_answer]).toBe(trialSet.target);
    });

    it("should handle invalid target index", () => {
      const trialSet = utils.createTrialSet(testItems, 999, 4);
      
      expect(trialSet.target).toBe(testItems[0]); // Should fallback to index 0
      expect(trialSet.target_index).toBe(0);
    });
  });

  describe("utils.getRandomTestItems", () => {
    const testItems = ['item1', 'item2', 'item3', 'item4', 'item5'];

    it("should return correct number of items", () => {
      const items = utils.getRandomTestItems(testItems, 3);
      expect(items).toHaveLength(3);
    });

    it("should return all items when count exceeds array length", () => {
      const items = utils.getRandomTestItems(testItems, 10);
      expect(items).toHaveLength(testItems.length);
    });

    it("should return items from original array", () => {
      const items = utils.getRandomTestItems(testItems, 2);
      items.forEach(item => {
        expect(testItems).toContain(item);
      });
    });
  });

  describe("utils.calculatePerformance", () => {
    const mockTrialData = [
      { task: 'speeded-matching-trial', correct: true, rt: 1000, target_index: 0 },
      { task: 'speeded-matching-trial', correct: false, rt: 1500, target_index: 0 },
      { task: 'speeded-matching-trial', correct: true, rt: 800, target_index: 1 },
      { task: 'speeded-matching-trial', correct: true, rt: null, target_index: 1 },
      { task: 'instruction-page', correct: true, rt: 500, target_index: 0 }, // Should be filtered out
    ];

    it("should calculate overall performance correctly", () => {
      const performance = utils.calculatePerformance(mockTrialData);
      
      expect(performance.overall.total_trials).toBe(4);
      expect(performance.overall.correct_trials).toBe(3);
      expect(performance.overall.accuracy).toBe(75);
      expect(performance.overall.mean_reaction_time).toBe(900); // (1000 + 800) / 2
    });

    it("should calculate performance by target type", () => {
      const performance = utils.calculatePerformance(mockTrialData);
      
      // Target 0: 1 correct out of 2 trials
      expect(performance.by_target[0].correct).toBe(1);
      expect(performance.by_target[0].total).toBe(2);
      expect(performance.by_target[0].reaction_times).toEqual([1000]);
      
      // Target 1: 2 correct out of 2 trials (one with null rt)
      expect(performance.by_target[1].correct).toBe(2);
      expect(performance.by_target[1].total).toBe(2);
      expect(performance.by_target[1].reaction_times).toEqual([800]);
    });

    it("should handle empty data", () => {
      const performance = utils.calculatePerformance([]);
      
      expect(performance.overall.accuracy).toBe(0);
      expect(performance.overall.mean_reaction_time).toBe(null);
      expect(performance.overall.total_trials).toBe(0);
    });

    it("should filter out non-task data", () => {
      const mixedData = [
        { task: 'speeded-matching-trial', correct: true, rt: 1000, target_index: 0 },
        { task: 'instruction-page', correct: true, rt: 500, target_index: 0 },
        { task: 'practice-demo', correct: false, rt: 2000, target_index: 0 },
      ];
      
      const performance = utils.calculatePerformance(mixedData);
      expect(performance.overall.total_trials).toBe(1);
    });
  });

  describe("utils.speakText", () => {
    beforeEach(() => {
      // Clear all mocks before each test to avoid cross-test contamination
      jest.clearAllMocks();
    });

    it("should cancel existing speech and speak new text", (done) => {
      utils.speakText("Hello world");
      
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      
      // Wait for setTimeout to execute
      setTimeout(() => {
        try {
          expect(mockSpeechSynthesisUtterance).toHaveBeenCalledWith("Hello world");
          expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
          done();
        } catch (error) {
          done(error);
        }
      }, 150);
    });

    it("should set utterance properties correctly", (done) => {
      utils.speakText("Test text");
      
      setTimeout(() => {
        try {
          // Check that SpeechSynthesisUtterance was called with the correct text
          expect(mockSpeechSynthesisUtterance).toHaveBeenCalledWith("Test text");
          const utteranceCall = mockSpeechSynthesisUtterance.mock.calls[0];
          expect(utteranceCall[0]).toBe("Test text");
          done();
        } catch (error) {
          done(error);
        }
      }, 150);
    });

    it("should not throw error when speechSynthesis is not available", () => {
      const originalWindow = global.window;
      global.window = {} as any;
      
      expect(() => utils.speakText("Test")).not.toThrow();
      
      global.window = originalWindow;
    });
  });

  describe("utils.createInstructions", () => {
    it("should create instruction trial with default pages", () => {
      const instructions = utils.createInstructions();
      
      expect(instructions.pages).toBeInstanceOf(Array);
      expect(instructions.pages.length).toBe(instruction_pages.length);
      expect(instructions.data?.task).toBe('instruction-pages');
    });

    it("should create instruction trial with custom pages", () => {
      const customPages = [
        '<div><h1>Custom Header</h1><p>Custom description</p></div>'
      ];
      
      const instructions = utils.createInstructions(customPages);
      
      expect(instructions.pages).toHaveLength(1);
      expect(instructions.pages[0]).toContain("Custom Header");
      expect(instructions.pages[0]).toContain("Custom description");
    });

    it("should handle HTML pages correctly", () => {
      const customPages = [
        '<div><h2>Strategy</h2><p>Follow these steps:</p><ul><li>Step 1</li><li>Step 2</li><li>Step 3</li></ul></div>'
      ];
      
      const instructions = utils.createInstructions(customPages);
      const page = instructions.pages[0];
      
      expect(page).toContain("Strategy");
      expect(page).toContain("Step 1");
      expect(page).toContain("Step 2");
      expect(page).toContain("Step 3");
    });
  });

  describe("utils.createPracticeRound", () => {
    it("should create practice timeline with correct structure", () => {
      const practice = utils.createPracticeRound(test_items);
      
      expect(practice).toBeInstanceOf(Array);
      expect(practice.length).toBeGreaterThan(0);
    });

    it("should include practice instruction screen", () => {
      const practice = utils.createPracticeRound(test_items);
      
      const instructionScreen = practice.find(
        (item: any) => item.data?.task === 'practice-instruction'
      );
      expect(instructionScreen).toBeDefined();
    });

    it("should include practice demonstration trials", () => {
      const practice = utils.createPracticeRound(test_items);
      
      const demoTrials = practice.filter(
        (item: any) => item.data?.task?.includes('practice')
      );
      expect(demoTrials.length).toBeGreaterThan(1);
    });

    it("should use first test item for practice", () => {
      const practice = utils.createPracticeRound(test_items);
      
      const targetDemo = practice.find(
        (item: any) => item.data?.task === 'practice-target-demo'
      );
      expect(targetDemo.stimulus).toContain(test_items[0]);
    });
  });

  describe("utils.createReadyScreen", () => {
    it("should create ready screen with correct structure", () => {
      const readyScreen = utils.createReadyScreen();
      
      expect(readyScreen).toBeDefined();
      expect(readyScreen.data.task).toBe('ready-screen');
      expect(readyScreen.stimulus).toContain(trial_text.practice_complete_header);
      expect(readyScreen.choices).toEqual([trial_text.ready_button]);
    });
  });

  describe("Exports", () => {
    it("should export trial_text configuration", () => {
      expect(trial_text).toBeDefined();
      expect(trial_text.continue_button).toBe("Continue");
      expect(trial_text.practice_header).toBe("Practice Round");
      expect(trial_text.task_complete_header).toBe("Task Complete!");
    });

    it("should export instruction_pages configuration", () => {
      expect(instruction_pages).toBeDefined();
      expect(instruction_pages).toBeInstanceOf(Array);
      expect(instruction_pages.length).toBeGreaterThan(0);
    });

    it("should export timelineUnits descriptions", () => {
      expect(timelineUnits).toBeDefined();
      expect(timelineUnits.instructions).toBeDefined();
      expect(timelineUnits.practice).toBeDefined();
      expect(timelineUnits.trial).toBeDefined();
      expect(timelineUnits.interTrialInterval).toBeDefined();
      expect(timelineUnits.endScreen).toBeDefined();
    });

    it("should export utils object with required functions", () => {
      expect(utils).toBeDefined();
      expect(typeof utils.generateTrials).toBe("function");
      expect(typeof utils.createInstructions).toBe("function");
      expect(typeof utils.createPracticeRound).toBe("function");
      expect(typeof utils.createReadyScreen).toBe("function");
      expect(typeof utils.speakText).toBe("function");
      expect(typeof utils.createTrialSet).toBe("function");
      expect(typeof utils.getRandomTestItems).toBe("function");
      expect(typeof utils.calculatePerformance).toBe("function");
    });
  });

  describe("Trial Data Structure", () => {
    it("should create trials with correct data structure", () => {
      const timeline = createTimeline(mockJsPsych, { 
        num_trials: 1,
        show_instructions: false,
        show_practice: false
      });
      
      const trial = timeline.timeline.find(
        (item: any) => item.data?.task === 'speeded-matching-trial'
      );
      
      expect(trial.data).toHaveProperty("task", "speeded-matching-trial");
      expect(trial.data).toHaveProperty("trial_number");
      expect(trial.data).toHaveProperty("correct_answer");
      expect(trial.data).toHaveProperty("target_index");
      expect(trial.data).toHaveProperty("target");
      expect(trial.data).toHaveProperty("choices");
    });

    it("should set correct trial numbers", () => {
      const timeline = createTimeline(mockJsPsych, { 
        num_trials: 3,
        show_instructions: false,
        show_practice: false
      });
      
      const trials = timeline.timeline.filter(
        (item: any) => item.data?.task === 'speeded-matching-trial'
      );
      
      trials.forEach((trial: any, index: number) => {
        expect(trial.data.trial_number).toBe(index + 1);
      });
    });
  });

  describe("Integration with test_items", () => {
    it("should use default test items when none provided", () => {
      const timeline = createTimeline(mockJsPsych, { 
        num_trials: 1,
        show_instructions: false,
        show_practice: false
      });
      
      const trial = timeline.timeline.find(
        (item: any) => item.data?.task === 'speeded-matching-trial'
      );
      
      expect(test_items).toContain(trial.data.target);
      expect(trial.data.target_index).toBeGreaterThanOrEqual(0);
      expect(trial.data.target_index).toBeLessThan(test_items.length);
    });

    it("should handle custom instruction texts", () => {
      const customInstructions = [
        '<div><h1>Custom Task</h1><p>This is a custom task</p></div>'
      ];
      
      const timeline = createTimeline(mockJsPsych, { 
        instruction_texts: customInstructions,
        show_instructions: true,
        num_trials: 1,
        show_practice: false
      });
      
      const hasCustomInstructions = timeline.timeline.some((item: any) => 
        item.pages && item.pages.some((page: string) => 
          page.includes("Custom Task")
        )
      );
      expect(hasCustomInstructions).toBe(true);
    });
  });

  describe("TTS Integration", () => {
    it("should enable TTS when requested", () => {
      const timeline = createTimeline(mockJsPsych, { 
        enable_tts: true,
        show_instructions: true,
        num_trials: 1
      });
      
      // Check that instruction trial has TTS enabled
      const hasInstructionsWithTTS = timeline.timeline.some((item: any) => 
        item.data?.task === 'instruction-pages' && (
          typeof item.on_start === 'function' || typeof item.on_load === 'function'
        )
      );
      expect(hasInstructionsWithTTS).toBe(true);
    });

    it("should disable TTS when requested", () => {
      const timeline = createTimeline(mockJsPsych, { 
        enable_tts: false,
        show_instructions: true,
        num_trials: 1
      });
      
      // Instructions should still be created but without TTS
      const hasInstructions = timeline.timeline.some((item: any) => 
        item.data?.task === 'instruction-pages'
      );
      expect(hasInstructions).toBe(true);
    });
  });
});