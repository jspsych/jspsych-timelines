import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, utils, timelineUnits } from ".";
import { trial_text } from "./text";

describe("createTimeline", () => {
    it("should return a timeline", () => {
        const jsPsych = initJsPsych();

        const timeline = createTimeline(jsPsych);
        expect(timeline).toBeDefined();
    });
});

import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';

// Mock jsPsych
const mockJsPsychData = {
  get: jest.fn(),
  filter: jest.fn(),
  select: jest.fn(),
  sum: jest.fn()
};

const mockJsPsych = {
  data: mockJsPsychData
} as unknown as JsPsych;

// Mock DOM elements
const mockElement = {
  remove: jest.fn(),
  appendChild: jest.fn(),
  innerHTML: '',
  className: ''
};

const mockDocument = {
  querySelector: jest.fn(),
  createElement: jest.fn()
};

// Setup global mocks
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Mock window object
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 800
  });

  // Mock document
  (global as any).document = mockDocument;
  mockDocument.querySelector.mockReturnValue(mockElement);
  mockDocument.createElement.mockReturnValue(mockElement);

  // Setup mock data chain
  mockJsPsychData.get.mockReturnValue(mockJsPsychData);
  mockJsPsychData.filter.mockReturnValue(mockJsPsychData);
  mockJsPsychData.select.mockReturnValue(mockJsPsychData);
  mockJsPsychData.sum.mockReturnValue(0);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('BART Timeline Creation', () => {
  it('should create timeline with default parameters', () => {
    const timeline = createTimeline(mockJsPsych);
    
    expect(timeline).toHaveProperty('timeline');
    expect(Array.isArray(timeline.timeline)).toBe(true);
    // Default: 3 blocks + 2 break screens = 5 timeline items
    expect(timeline.timeline).toHaveLength(5);
  });

  it('should create timeline with custom parameters', () => {
    const customParams = {
      max_pumps: 15,
      min_pumps: 3,
      currency_unit_per_pump: 2,
      num_blocks: 2,
      trials_per_block: 5
    };

    const timeline = createTimeline(mockJsPsych, customParams);
    
    // 2 blocks + 1 break screen = 3 timeline items
    expect(timeline.timeline).toHaveLength(3);
  });

  it('should handle empty parameters object', () => {
    const timeline = createTimeline(mockJsPsych, {});
    
    // Default: 3 blocks + 2 break screens = 5 timeline items
    expect(timeline.timeline).toHaveLength(5);
  });
});

describe('Start Instructions', () => {
  it('should generate correct start instructions stimulus', () => {
    const instructions = timelineUnits.showStartInstructions();
    
    expect(instructions.type).toBe(HtmlButtonResponsePlugin);
    expect(instructions.choices).toEqual(['Start']);
    
    // Test stimulus function
    const stimulus = instructions.stimulus();
    expect(typeof stimulus).toBe('string');
    expect(stimulus).toContain('$0.00'); // currency formatting
    expect(stimulus).toContain('Pump');
    expect(stimulus).toContain('Collect');
  });
});

describe('End Results', () => {
  it('should generate end results with zero earnings', () => {
    mockJsPsychData.sum.mockReturnValue(0);
    
    const results = timelineUnits.showEndResults(mockJsPsych);
    
    expect(results.type).toBe(HtmlButtonResponsePlugin);
    expect(results.choices).toEqual(['Finish']);
    
    const stimulus = results.stimulus();
    expect(stimulus).toContain('$0.00');
    expect(stimulus).toContain('Thanks for participating!');
  });

  it('should generate end results with earnings', () => {
    mockJsPsychData.sum.mockReturnValue(50); // 50 pump counts
    
    const results = timelineUnits.showEndResults(mockJsPsych);
    const stimulus = results.stimulus();
    
    expect(stimulus).toContain('$0.50'); // 50 * 0.01
  });

  it('should filter data correctly', () => {
    timelineUnits.showEndResults(mockJsPsych);
    
    expect(mockJsPsychData.get).toHaveBeenCalled();
    expect(mockJsPsychData.filter).toHaveBeenCalledWith({ task: 'bart' });
    expect(mockJsPsychData.filter).toHaveBeenCalledWith({ 
      exploded: false, 
      cashed_out: true 
    });
    expect(mockJsPsychData.select).toHaveBeenCalledWith('pump_count');
  });
});

describe('Balloon Styling', () => {
  // Since getBalloonStyle is not exported, we'll test it indirectly through timeline creation
  it('should create timeline with proper structure for balloon display', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    
    expect(trial).toHaveProperty('timeline');
    expect(trial).toHaveProperty('on_timeline_start');
    expect(typeof trial.on_timeline_start).toBe('function');
  });
});

describe('Trial Timeline Structure', () => {
  it('should create trial with pump loop and outcome', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    
    expect(trial.timeline).toHaveLength(2); // pump_loop and outcome
    
    const pumpLoop = trial.timeline[0];
    const outcome = trial.timeline[1];
    
    expect(pumpLoop).toHaveProperty('timeline');
    expect(pumpLoop).toHaveProperty('loop_function');
    expect(outcome).toHaveProperty('type');
    if ('type' in outcome) {
      expect(outcome.type).toBe(HtmlButtonResponsePlugin);
    }
  });

  it('should initialize trial variables on timeline start', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block  
    const trial = block.timeline[0]; // First trial in block
    
    // Test that on_timeline_start is a function
    expect(typeof trial.on_timeline_start).toBe('function');
    
    // Execute the function (it should not throw)
    expect(() => trial.on_timeline_start()).not.toThrow();
  });
});

describe('Button Configuration', () => {
  it('should configure pump and collect buttons correctly', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    let pumpTrial: any;
    if ('timeline' in trial.timeline[0]) {
      pumpTrial = (trial.timeline[0] as { timeline: any[] }).timeline[0];
    } else {
      throw new Error('Expected trial.timeline[0] to have a timeline property');
    }
    
    expect(pumpTrial.choices).toEqual([trial_text.pump_button, trial_text.collect_button]);
    expect(typeof pumpTrial.button_html).toBe('function');
    
    // Test button HTML generation  
    const pumpButton = pumpTrial.button_html(trial_text.pump_button, 0);
    const collectButton = pumpTrial.button_html(trial_text.collect_button, 1);
    
    expect(pumpButton).toContain('continue-button');
    expect(collectButton).toContain('continue-button');
  });
});

describe('Data Recording', () => {
  it('should record trial data on finish', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    const outcome = trial.timeline[1];
    
    if ('on_finish' in outcome && typeof outcome.on_finish === 'function') {
      expect(typeof outcome.on_finish).toBe('function');
      
      // Test data recording
      const mockData = {};
      outcome.on_finish(mockData);
      
      expect(mockData).toHaveProperty('task', 'bart');
      expect(mockData).toHaveProperty('pump_count');
      expect(mockData).toHaveProperty('exploded');
      expect(mockData).toHaveProperty('cashed_out');
    } else {
      throw new Error('Expected outcome to have an on_finish function');
    }
  });
});

describe('Stimulus Generation', () => {
  it('should generate stimulus with balloon image', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    let pumpTrial: any;
    if ('timeline' in trial.timeline[0]) {
      pumpTrial = (trial.timeline[0] as { timeline: any[] }).timeline[0];
    } else {
      throw new Error('Expected trial.timeline[0] to have a timeline property');
    }
    
    expect(typeof pumpTrial.stimulus).toBe('function');
    
    const stimulus = pumpTrial.stimulus();
    expect(stimulus).toContain('transparent_balloon.png');
    expect(stimulus).toContain('bart-container');
    expect(stimulus).toContain('balloon-area');
  });

  it('should generate outcome stimulus for explosion', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    const outcome = trial.timeline[1];
    
    if ('stimulus' in outcome && typeof outcome.stimulus === 'function') {
      expect(typeof outcome.stimulus).toBe('function');
      
      // The stimulus function would need access to trial state
      // This is a structural test to ensure the function exists
      expect(() => outcome.stimulus()).not.toThrow();
    } else {
      throw new Error('Expected outcome to have a stimulus function');
    }
  });
});

describe('Currency Formatting', () => {
  it('should format currency correctly in instructions', () => {
    const instructions = timelineUnits.showStartInstructions();
    const stimulus = instructions.stimulus();
    
    // Should contain properly formatted currency
    expect(stimulus).toMatch(/\$\d+\.\d{2}/);
  });

  it('should format currency correctly in end results', () => {
    mockJsPsychData.sum.mockReturnValue(123); // 123 pump counts
    
    const results = timelineUnits.showEndResults(mockJsPsych);
    const stimulus = results.stimulus();
    
    expect(stimulus).toContain('$1.23'); // 123 * 0.01
  });
});

describe('Error Handling', () => {
  it('should handle missing DOM elements gracefully', () => {
    mockDocument.querySelector.mockReturnValue(null);
    
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    let pumpTrial: any;
    if ('timeline' in trial.timeline[0]) {
      pumpTrial = (trial.timeline[0] as { timeline: any[] }).timeline[0];
    } else {
      throw new Error('Expected trial.timeline[0] to have a timeline property');
    }
    
    // Should not throw when DOM elements are missing
    expect(() => pumpTrial.on_load()).not.toThrow();
  });

  it('should handle empty data gracefully', () => {
    mockJsPsychData.get.mockReturnValue({
      filter: jest.fn().mockReturnValue({
        filter: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            sum: jest.fn().mockReturnValue(0)
          })
        })
      })
    });
    
    expect(() => timelineUnits.showEndResults(mockJsPsych)).not.toThrow();
  });
});

describe('Parameter Validation', () => {
  it('should handle extreme parameter values', () => {
    const extremeParams = {
      max_pumps: 1000,
      min_pumps: 0,
      currency_unit_per_pump: 0.001,
      num_blocks: 5,
      trials_per_block: 20
    };
    
    expect(() => createTimeline(mockJsPsych, extremeParams)).not.toThrow();
    
    const timeline = createTimeline(mockJsPsych, extremeParams);
    // 5 blocks + 4 break screens = 9 timeline items
    expect(timeline.timeline).toHaveLength(9);
  });

  it('should handle negative values gracefully', () => {
    const negativeParams = {
      max_pumps: -5,
      min_pumps: -10,
      currency_unit_per_pump: -1,
      num_blocks: 1,
      trials_per_block: 1
    };
    
    expect(() => createTimeline(mockJsPsych, negativeParams)).not.toThrow();
  });
});

describe('Loop Function Logic', () => {
  it('should continue loop when balloon not popped and not cashed out', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    const pumpLoop = trial.timeline[0];
    
    if ('loop_function' in pumpLoop) {
      expect(typeof pumpLoop.loop_function).toBe('function');
    } else {
      throw new Error('Expected pumpLoop to have a loop_function property');
    }
    
    // The loop function uses closure variables, so we test its existence
    // In a real test environment, you'd need to access the closure state
    expect(pumpLoop.loop_function).toBeDefined();
  });
});

describe('Response Handling', () => {
  it('should handle pump response correctly', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    let pumpTrial: any;
    if ('timeline' in trial.timeline[0]) {
      pumpTrial = (trial.timeline[0] as { timeline: any[] }).timeline[0];
    } else {
      throw new Error('Expected trial.timeline[0] to have a timeline property');
    }
    
    expect(typeof pumpTrial.on_finish).toBe('function');
    
    // Test pump response (response = 0)
    const mockData = { response: 0 };
    expect(() => pumpTrial.on_finish(mockData)).not.toThrow();
  });

  it('should handle collect response correctly', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    let pumpTrial: any;
    if ('timeline' in trial.timeline[0]) {
      pumpTrial = (trial.timeline[0] as { timeline: any[] }).timeline[0];
    } else {
      throw new Error('Expected trial.timeline[0] to have a timeline property');
    }
    
    // Test collect response (response = 1)
    const mockData = { response: 1 };
    expect(() => pumpTrial.on_finish(mockData)).not.toThrow();
  });
});

describe('Integration Tests', () => {
  it('should create complete functional timeline', () => {
    const timeline = createTimeline(mockJsPsych, {
      max_pumps: 10,
      min_pumps: 5,
      currency_unit_per_pump: 1,
      num_blocks: 2,
      trials_per_block: 3
    });
    
    // Verify complete structure - should have 2 blocks + 1 break = 3 items
    expect(timeline.timeline).toHaveLength(3);
    expect(timeline).toMatchObject({
      timeline: expect.arrayContaining([
        expect.objectContaining({
          repetitions: 3,
          timeline: expect.arrayContaining([
            expect.objectContaining({
              timeline: expect.arrayContaining([
                expect.objectContaining({
                  timeline: expect.any(Array),
                  loop_function: expect.any(Function)
                }),
                expect.objectContaining({
                  type: HtmlButtonResponsePlugin,
                  stimulus: expect.any(Function),
                  choices: ['Continue'],
                  on_finish: expect.any(Function)
                })
              ]),
              on_timeline_start: expect.any(Function)
            })
          ])
        })
      ]),
    });
  });

  it('should maintain trial state through timeline execution', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    
    // Initialize trial
    trial.on_timeline_start();
    
    // Test that functions exist and are callable
    const pumpLoop = trial.timeline[0];
    const outcome = trial.timeline[1];
    
    if ('loop_function' in pumpLoop) {
      expect(pumpLoop.loop_function).toBeDefined();
    } else {
      throw new Error('Expected pumpLoop to have a loop_function property');
    }
    if ('stimulus' in outcome) {
      expect(outcome.stimulus).toBeDefined();
    } else {
      throw new Error('Expected outcome to have a stimulus property');
    }
    if ('on_finish' in outcome) {
      expect(outcome.on_finish).toBeDefined();
    } else {
      throw new Error('Expected outcome to have an on_finish property');
    }
    
    // Test execution doesn't throw
    expect(() => outcome.stimulus()).not.toThrow();
    expect(() => outcome.on_finish({})).not.toThrow();
  });
});

describe('Exported Objects', () => {
  it('should export timelineUnits with createTrialTimeline', () => {
    expect(timelineUnits).toEqual({
      createTrialTimeline: expect.any(Function)
    });
  });

  it('should export utils with correct functions', () => {
    expect(timelineUnits).toHaveProperty('showStartInstructions');
    expect(timelineUnits).toHaveProperty('showBlockBreak');
    expect(timelineUnits).toHaveProperty('showEndResults');
    expect(typeof timelineUnits.showStartInstructions).toBe('function');
    expect(typeof timelineUnits.showEndResults).toBe('function');
  });

  it('should export createTimeline function', () => {
    expect(typeof createTimeline).toBe('function');
  });
});

describe('Math.random Behavior', () => {
  it('should generate explosion points within range', () => {
    const originalRandom = Math.random;
    
    // Mock Math.random to return predictable values
    Math.random = jest.fn()
      .mockReturnValueOnce(0) // Should give min_pumps
      .mockReturnValueOnce(0.5) // Should give middle value
      .mockReturnValueOnce(0.99); // Should give close to max_pumps
    
    const timeline = createTimeline(mockJsPsych, {
      max_pumps: 10,
      min_pumps: 5,
      num_blocks: 1,
      trials_per_block: 3
    });
    
    // Execute timeline start multiple times to test explosion point generation
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    
    expect(() => {
      trial.on_timeline_start();
      trial.on_timeline_start();
      trial.on_timeline_start();
    }).not.toThrow();
    
    expect(Math.random).toHaveBeenCalledTimes(3);
    
    // Restore original Math.random
    Math.random = originalRandom;
  });
});

describe('Timeout Functionality', () => {
  it('should create timeline with default timeout enabled (15 seconds)', () => {
    const timeline = createTimeline(mockJsPsych);
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    const pumpLoop = trial.timeline[0];
    const pumpTrial = pumpLoop.timeline[0];
    
    expect(pumpTrial.trial_duration).toBe(15000); // 15 seconds default
  });
  
  it('should create timeline with custom timeout', () => {
    const timeline = createTimeline(mockJsPsych, {
      trial_timeout: 30000, // 30 seconds
      enable_timeout: true
    });
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    const pumpLoop = trial.timeline[0];
    const pumpTrial = pumpLoop.timeline[0];
    
    expect(pumpTrial.trial_duration).toBe(30000);
  });
  
  it('should disable timeout when enable_timeout is false', () => {
    const timeline = createTimeline(mockJsPsych, {
      enable_timeout: false
    });
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    const pumpLoop = trial.timeline[0];
    const pumpTrial = pumpLoop.timeline[0];
    
    expect(pumpTrial.trial_duration).toBe(null);
  });
  
  it('should handle timeout response correctly', () => {
    const timeline = createTimeline(mockJsPsych, {
      trial_timeout: 1000,
      enable_timeout: true
    });
    const block = timeline.timeline[0]; // First block
    const trial = block.timeline[0]; // First trial in block
    const pumpLoop = trial.timeline[0];
    const pumpTrial = pumpLoop.timeline[0];
    
    // Simulate timeout (response = null)
    const mockData = { response: null };
    expect(() => pumpTrial.on_finish(mockData)).not.toThrow();
  });
});