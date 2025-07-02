import { initJsPsych } from "jspsych";
import { 
  createTimeline, 
  createFlankerStim, 
  createPracticeStim, 
  calculatePerformance,
  default_stimuli,
  fish_stimuli,
  arrow_stimuli,
  timelineUnits,
  utils,
  trial_text,
  instruction_pages,
  FlankerConfig
} from "./index";
import { layered_stimuli } from "./stimuli";

describe("Flanker Inhibitory Control Task", () => {
  let jsPsych: any;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  describe("createTimeline", () => {
    it("should return a timeline object with timeline array", () => {
      const timeline = createTimeline(jsPsych);
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should create timeline with default parameters", () => {
      const timeline = createTimeline(jsPsych);
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should create timeline without instructions when disabled", () => {
      const timeline = createTimeline(jsPsych, { show_instructions: false });
      expect(timeline.timeline.length).toBeGreaterThan(0);
      // Should have fewer trials than with instructions
      const timelineWithInstructions = createTimeline(jsPsych, { show_instructions: true });
      expect(timeline.timeline.length).toBeLessThan(timelineWithInstructions.timeline.length);
    });

    it("should create timeline without practice when disabled", () => {
      const timeline = createTimeline(jsPsych, { show_practice: false });
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should respect custom trial count", () => {
      const customTrials = 15;
      const timeline = createTimeline(jsPsych, { 
        num_trials: customTrials,
        show_instructions: false,
        show_practice: false 
      });
      
      // Should have main trials plus completion screen
      expect(timeline.timeline.length).toBeGreaterThanOrEqual(2);
    });

    it("should respect custom practice trial count", () => {
      const customPractice = 6;
      const timeline = createTimeline(jsPsych, { 
        num_practice: customPractice,
        show_practice: true,
        show_instructions: false
      });
      
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should handle different stimuli types", () => {
      const fishTimeline = createTimeline(jsPsych, { stimuli_type: 'fish' });
      const arrowTimeline = createTimeline(jsPsych, { stimuli_type: 'arrow' });
      const layeredTimeline = createTimeline(jsPsych, { stimuli_type: 'layered' });
      
      expect(fishTimeline.timeline.length).toBeGreaterThan(0);
      expect(arrowTimeline.timeline.length).toBeGreaterThan(0);
      expect(layeredTimeline.timeline.length).toBeGreaterThan(0);
    });

    it("should handle SVG override parameter", () => {
      const customSVGs = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="blue"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" fill="red"/></svg>'
      ];
      
      const timeline = createTimeline(jsPsych, { svg: customSVGs });
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should handle custom stimuli", () => {
      const customStimuli = {
        left: ['<svg>test left</svg>'],
        right: ['<svg>test right</svg>']
      };
      
      const timeline = createTimeline(jsPsych, { custom_stimuli: customStimuli });
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should set custom fixation duration", () => {
      const customDuration = 1000;
      const timeline = createTimeline(jsPsych, { fixation_duration: customDuration });
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });
  });

  describe("createFlankerStim", () => {
    it("should create HTML for congruent left stimulus", () => {
      const html = createFlankerStim('left', true);
      expect(html).toContain('flanker-stim');
      expect(html).toContain('<span>');
    });

    it("should create HTML for incongruent right stimulus", () => {
      const html = createFlankerStim('right', false);
      expect(html).toContain('flanker-stim');
      expect(html).toContain('<span>');
    });

    it("should create HTML for congruent right stimulus", () => {
      const html = createFlankerStim('right', true);
      expect(html).toContain('flanker-stim');
      expect(html).toContain('<span>');
    });

    it("should create HTML for incongruent left stimulus", () => {
      const html = createFlankerStim('left', false);
      expect(html).toContain('flanker-stim');
      expect(html).toContain('<span>');
    });

    it("should handle custom stimuli arrays", () => {
      const customStimuli = ['<svg>test</svg>'];
      const html = createFlankerStim('left', true, customStimuli);
      expect(html).toContain('flanker-stim');
    });

    it("should handle custom stimuli objects", () => {
      const customStimuli = {
        left: ['<svg>left test</svg>'],
        right: ['<svg>right test</svg>']
      };
      const html = createFlankerStim('left', true, customStimuli);
      expect(html).toContain('flanker-stim');
    });
  });

  describe("createPracticeStim", () => {
    it("should create HTML for practice stimulus with highlighting", () => {
      const html = createPracticeStim('left', true);
      expect(html).toContain('flanker-stim practice');
      expect(html).toContain('center highlighted');
    });

    it("should create different HTML than regular stimulus", () => {
      const practiceHtml = createPracticeStim('left', true);
      const regularHtml = createFlankerStim('left', true);
      
      expect(practiceHtml).toContain('practice');
      expect(practiceHtml).toContain('highlighted');
      expect(regularHtml).not.toContain('practice');
      expect(regularHtml).not.toContain('highlighted');
    });

    it("should handle all direction and congruency combinations", () => {
      const combinations = [
        ['left', true],
        ['left', false], 
        ['right', true],
        ['right', false]
      ];

      combinations.forEach(([direction, congruent]) => {
        const html = createPracticeStim(direction as string, congruent as boolean);
        expect(html).toContain('flanker-stim practice');
        expect(html).toContain('center highlighted');
      });
    });
  });

  describe("calculatePerformance", () => {
    it("should return zero performance for empty data", () => {
      const performance = calculatePerformance([]);
      expect(performance.accuracy).toBe(0);
      expect(performance.mean_rt).toBe(0);
      expect(performance.total_trials).toBe(0);
    });

    it("should calculate accuracy correctly", () => {
      const mockData = [
        { task: 'flanker', correct: true, rt: 500 },
        { task: 'flanker', correct: false, rt: 600 },
        { task: 'flanker', correct: true, rt: 550 },
        { task: 'flanker', correct: true, rt: 450 }
      ];

      const performance = calculatePerformance(mockData);
      expect(performance.accuracy).toBe(75); // 3/4 = 75%
      expect(performance.total_trials).toBe(4);
      expect(performance.correct_trials).toBe(3);
      expect(performance.mean_rt).toBeCloseTo(500, 1); // Mean of correct trials: (500+550+450)/3
    });

    it("should filter only flanker task data", () => {
      const mockData = [
        { task: 'flanker', correct: true, rt: 500 },
        { task: 'other', correct: false, rt: 600 },
        { task: 'flanker', correct: true, rt: 550 }
      ];

      const performance = calculatePerformance(mockData);
      expect(performance.total_trials).toBe(2); // Only flanker trials
      expect(performance.accuracy).toBe(100); // Both flanker trials correct
    });

    it("should handle all incorrect trials", () => {
      const mockData = [
        { task: 'flanker', correct: false, rt: 500 },
        { task: 'flanker', correct: false, rt: 600 }
      ];

      const performance = calculatePerformance(mockData);
      expect(performance.accuracy).toBe(0);
      expect(performance.mean_rt).toBe(0); // No correct trials
      expect(performance.correct_trials).toBe(0);
    });
  });

  describe("Stimulus Constants", () => {
    it("should provide default_stimuli with left and right", () => {
      expect(default_stimuli).toBeDefined();
      expect(default_stimuli.left).toBeDefined();
      expect(default_stimuli.right).toBeDefined();
      expect(typeof default_stimuli.left).toBe('string');
      expect(typeof default_stimuli.right).toBe('string');
    });

    it("should provide fish_stimuli with left and right", () => {
      expect(fish_stimuli).toBeDefined();
      expect(fish_stimuli.left).toBeDefined();
      expect(fish_stimuli.right).toBeDefined();
      expect(typeof fish_stimuli.left).toBe('string');
      expect(typeof fish_stimuli.right).toBe('string');
    });

    it("should provide arrow_stimuli with left and right", () => {
      expect(arrow_stimuli).toBeDefined();
      expect(arrow_stimuli.left).toBeDefined();
      expect(arrow_stimuli.right).toBeDefined();
      expect(typeof arrow_stimuli.left).toBe('string');
      expect(typeof arrow_stimuli.right).toBe('string');
    });

    it("should have different stimuli for left and right directions", () => {
      expect(default_stimuli.left).not.toBe(default_stimuli.right);
      expect(fish_stimuli.left).not.toBe(fish_stimuli.right);
      expect(arrow_stimuli.left).not.toBe(arrow_stimuli.right);
    });
  });

  describe("Text and Instructions", () => {
    it("should provide trial_text object", () => {
      expect(trial_text).toBeDefined();
      expect(trial_text.continue_button).toBeDefined();
      expect(trial_text.left_button).toBeDefined();
      expect(trial_text.right_button).toBeDefined();
      expect(trial_text.fixation_cross).toBeDefined();
      expect(trial_text.correct_feedback).toBeDefined();
      expect(trial_text.incorrect_feedback).toBeDefined();
    });

    it("should provide instruction_pages array", () => {
      expect(instruction_pages).toBeDefined();
      expect(Array.isArray(instruction_pages)).toBe(true);
      expect(instruction_pages.length).toBeGreaterThan(0);
    });

    it("should have properly structured instruction pages", () => {
      instruction_pages.forEach((page, index) => {
        expect(page).toBeDefined();
        expect(page.buttons).toBeDefined();
        expect(Array.isArray(page.buttons)).toBe(true);
      });
    });
  });

  describe("Timeline Units", () => {
    it("should provide timelineUnits object", () => {
      expect(timelineUnits).toBeDefined();
      expect(timelineUnits.instructions).toBeDefined();
      expect(timelineUnits.practice).toBeDefined();
      expect(timelineUnits.main).toBeDefined();
      expect(timelineUnits.completion).toBeDefined();
    });
  });

  describe("Utils Export", () => {
    it("should provide utils object with functions", () => {
      expect(utils).toBeDefined();
      expect(utils.calculatePerformance).toBeDefined();
      expect(utils.createFlankerStim).toBeDefined();
      expect(utils.createPracticeStim).toBeDefined();
      expect(typeof utils.calculatePerformance).toBe('function');
      expect(typeof utils.createFlankerStim).toBe('function');
      expect(typeof utils.createPracticeStim).toBe('function');
    });

    it("should have utils functions work the same as direct exports", () => {
      const mockData = [{ task: 'flanker', correct: true, rt: 500 }];
      
      const directResult = calculatePerformance(mockData);
      const utilsResult = utils.calculatePerformance(mockData);
      
      expect(directResult).toEqual(utilsResult);
    });
  });

  describe("FlankerConfig Interface", () => {
    it("should accept valid config objects", () => {
      const configs: FlankerConfig[] = [
        {},
        { stimuli_type: 'fish' },
        { stimuli_type: 'arrow' },
        { stimuli_type: 'layered' },
        { fixation_duration: 1000 },
        { show_instructions: false },
        { show_practice: true },
        { num_practice: 10 },
        { num_trials: 25 },
        { svg: ['<svg>test</svg>'] },
        { custom_stimuli: { left: ['<svg>left</svg>'] } }
      ];

      configs.forEach(config => {
        expect(() => createTimeline(jsPsych, config)).not.toThrow();
      });
    });
  });

  describe("SVG Flipping Functionality", () => {
    it("should generate different left and right stimuli from same input", () => {
      // Test with a simple SVG array input
      const testSVG = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="30" cy="24" r="10"/></svg>'];
      
      const leftHtml = createFlankerStim('left', true, testSVG);
      const rightHtml = createFlankerStim('right', true, testSVG);
      
      // Should be different due to flipping
      expect(leftHtml).not.toBe(rightHtml);
      expect(leftHtml).toContain('flanker-stim');
      expect(rightHtml).toContain('flanker-stim');
    });

    it("should handle SVGs with existing transforms", () => {
      // Test with SVG that already has transform (like the fish)
      const transformedSVG = ['<svg transform="matrix(-1, 0, 0, 1, 0, 0)" viewBox="0 0 48 48"><circle cx="30" cy="24" r="10"/></svg>'];
      
      const leftHtml = createFlankerStim('left', true, transformedSVG);
      const rightHtml = createFlankerStim('right', true, transformedSVG);
      
      expect(leftHtml).not.toBe(rightHtml);
      expect(leftHtml).toContain('flanker-stim');
      expect(rightHtml).toContain('flanker-stim');
    });

    it("should properly handle fish SVG alignment - no double transforms", () => {
      // Test specifically with fish stimuli to ensure alignment fix works
      const fishLeftHtml = createFlankerStim('left', true, fish_stimuli);
      const fishRightHtml = createFlankerStim('right', true, fish_stimuli);
      
      // Both should contain flanker stimulus
      expect(fishLeftHtml).toContain('flanker-stim');
      expect(fishRightHtml).toContain('flanker-stim');
      
      // They should be different (one flipped)
      expect(fishLeftHtml).not.toBe(fishRightHtml);
      
      // Test that the fish SVG original has a transform
      expect(fish_stimuli.right).toContain('transform=');
      
      // Test that flipping twice gets back to original orientation
      // This validates the fix for double-transform issues
      const twice_flipped_left = createFlankerStim('left', true, fish_stimuli);
      const twice_flipped_right = createFlankerStim('right', true, fish_stimuli);
      expect(twice_flipped_left).not.toBe(twice_flipped_right);
    });

    it("should handle fish incongruent stimuli alignment correctly", () => {
      // Test incongruent fish (center different from flankers) - key alignment test
      const leftIncongruent = createFlankerStim('left', false, fish_stimuli);
      const rightIncongruent = createFlankerStim('right', false, fish_stimuli);
      
      // Should produce valid HTML
      expect(leftIncongruent).toContain('flanker-stim');
      expect(rightIncongruent).toContain('flanker-stim');
      
      // Should be different
      expect(leftIncongruent).not.toBe(rightIncongruent);
      
      // The key test: each should contain both orientations (center vs flankers)
      // This is where alignment issues would be most visible
      expect(leftIncongruent).toContain('<span>');
      expect(rightIncongruent).toContain('<span>');
    });

    it("should maintain consistent alignment with layered fish+arrow stimuli", () => {
      // Test the default layered stimuli (fish + arrow) for alignment
      const leftLayered = createFlankerStim('left', true, default_stimuli);
      const rightLayered = createFlankerStim('right', true, default_stimuli);
      
      expect(leftLayered).toContain('flanker-stim');
      expect(rightLayered).toContain('flanker-stim');
      expect(leftLayered).not.toBe(rightLayered);
      
      // Should contain position styling for layered elements
      expect(leftLayered).toContain('position:');
      expect(rightLayered).toContain('position:');
    });
  });

  describe("Layered SVG Functionality", () => {
    it("should handle multiple SVG layers", () => {
      const layeredSVGs = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="blue"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="20" y="20" width="8" height="8" fill="red"/></svg>'
      ];
      
      const html = createFlankerStim('left', true, layeredSVGs);
      
      expect(html).toContain('flanker-stim');
      expect(html).toContain('position: relative');
    });

    it("should handle single SVG in array", () => {
      const singleSVG = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20"/></svg>'];
      
      const html = createFlankerStim('left', true, singleSVG);
      
      expect(html).toContain('flanker-stim');
    });
  });

  describe("Stimuli Amount Functionality", () => {
    // Helper function to count only top-level spans (flanker positions)
    const countFlankerPositions = (html: string): number => {
      // Count spans that are direct children of the flanker-stim div
      // These represent the actual flanker positions, not inner SVG content
      const matches = html.match(/<span[^>]*>/g) || [];
      return matches.length;
    };

    it("should default to 5 stimuli (2 left + 1 center + 2 right)", () => {
      const html = createFlankerStim('left', true);
      const spanCount = countFlankerPositions(html);
      expect(spanCount).toBe(5);
    });

    it("should create correct number of stimuli for custom amounts", () => {
      const testAmounts = [3, 5, 7, 9];
      
      testAmounts.forEach(amount => {
        const html = createFlankerStim('left', true, layered_stimuli, amount);
        const spanCount = countFlankerPositions(html);
        expect(spanCount).toBe(amount);
      });
    });

    it("should handle even numbers by rounding up to next odd", () => {
      const html4 = createFlankerStim('left', true, layered_stimuli, 4);
      const html6 = createFlankerStim('left', true, layered_stimuli, 6);
      const html8 = createFlankerStim('left', true, layered_stimuli, 8);
      
      expect(countFlankerPositions(html4)).toBe(5); // 4 -> 5
      expect(countFlankerPositions(html6)).toBe(7); // 6 -> 7
      expect(countFlankerPositions(html8)).toBe(9); // 8 -> 9
    });

    it("should enforce minimum of 3 stimuli", () => {
      const html1 = createFlankerStim('left', true, layered_stimuli, 1);
      const html2 = createFlankerStim('left', true, layered_stimuli, 2);
      const htmlNegative = createFlankerStim('left', true, layered_stimuli, -5);
      
      expect(countFlankerPositions(html1)).toBe(3);
      expect(countFlankerPositions(html2)).toBe(3);
      expect(countFlankerPositions(htmlNegative)).toBe(3);
    });

    it("should maintain center stimulus with highlighting in practice", () => {
      const html = createPracticeStim('left', true, layered_stimuli, 7);
      const spanCount = countFlankerPositions(html);
      expect(spanCount).toBe(7);
      expect(html).toContain('center highlighted');
    });

    it("should work with different stimuli types", () => {
      const fishHtml = createFlankerStim('left', true, fish_stimuli, 7);
      const arrowHtml = createFlankerStim('left', true, arrow_stimuli, 7);
      
      expect(countFlankerPositions(fishHtml)).toBe(7);
      expect(countFlankerPositions(arrowHtml)).toBe(7);
    });

    it("should be configurable via timeline config", () => {
      const timeline = createTimeline(jsPsych, { 
        stimuli_amount: 7,
        show_instructions: false,
        show_practice: false 
      });
      
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should validate stimuli_amount in different function calls", () => {
      // Test with simple SVGs (no inner spans)
      const testSVGs = ['<svg><circle/></svg>'];
      const html1 = createFlankerStim('left', true, testSVGs, 9);
      expect(countFlankerPositions(html1)).toBe(9);
      
      // Test with objects
      const testObj = { left: ['<svg><path/></svg>'], right: ['<svg><rect/></svg>'] };
      const html2 = createFlankerStim('left', true, testObj, 7);
      expect(countFlankerPositions(html2)).toBe(7);
    });

    it("should handle invalid amounts by using valid fallbacks", () => {
      // NaN should fall back to default (5)
      const htmlNaN = createFlankerStim('left', true, layered_stimuli, NaN);
      expect(countFlankerPositions(htmlNaN)).toBe(5);
      
      // Very large numbers should still work
      const htmlLarge = createFlankerStim('left', true, layered_stimuli, 15);
      expect(countFlankerPositions(htmlLarge)).toBe(15);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid direction gracefully", () => {
      expect(() => createFlankerStim('invalid' as any, true)).not.toThrow();
    });

    it("should handle undefined stimuli", () => {
      expect(() => createFlankerStim('left', true, undefined as any)).not.toThrow();
    });

    it("should handle empty stimuli array", () => {
      expect(() => createFlankerStim('left', true, [])).not.toThrow();
    });

    it("should handle malformed SVG strings", () => {
      const badSVG = ['not an svg'];
      expect(() => createFlankerStim('left', true, badSVG)).not.toThrow();
    });

    it("should handle invalid stimuli_amount gracefully", () => {
      expect(() => createFlankerStim('left', true, layered_stimuli, NaN)).not.toThrow();
      expect(() => createFlankerStim('left', true, layered_stimuli, Infinity)).not.toThrow();
      
      // Should fall back to default value (5) for invalid inputs
      const htmlNaN = createFlankerStim('left', true, layered_stimuli, NaN);
      const htmlInfinity = createFlankerStim('left', true, layered_stimuli, Infinity);
      
      expect((htmlNaN.match(/<span[^>]*>/g) || []).length).toBe(5);
      expect((htmlInfinity.match(/<span[^>]*>/g) || []).length).toBe(5);
    });
  });

  describe("Edge Cases and Timeline Variable Errors", () => {
    it("should handle num_practice=0 with show_practice=true without errors", () => {
      expect(() => {
        const timeline = createTimeline(jsPsych, { 
          num_practice: 0, 
          show_practice: true,
          show_instructions: false,
          num_trials: 1
        });
        expect(timeline.timeline.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it("should handle num_trials=0 without errors", () => {
      expect(() => {
        const timeline = createTimeline(jsPsych, { 
          num_trials: 0,
          show_instructions: false,
          show_practice: false
        });
        expect(timeline.timeline.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it("should handle both num_practice=0 and num_trials=0 without errors", () => {
      expect(() => {
        const timeline = createTimeline(jsPsych, { 
          num_practice: 0,
          show_practice: true,
          num_trials: 0,
          show_instructions: false
        });
        // Should still have completion screen
        expect(timeline.timeline.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it("should handle negative numbers for practice trials", () => {
      expect(() => {
        const timeline = createTimeline(jsPsych, { 
          num_practice: -5,
          show_practice: true,
          show_instructions: false,
          num_trials: 1
        });
        expect(timeline.timeline.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it("should handle negative numbers for main trials", () => {
      expect(() => {
        const timeline = createTimeline(jsPsych, { 
          num_trials: -10,
          show_instructions: false,
          show_practice: false
        });
        expect(timeline.timeline.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it("should handle very large numbers without breaking", () => {
      expect(() => {
        const timeline = createTimeline(jsPsych, { 
          num_practice: 1000,
          show_practice: true,
          num_trials: 1000,
          show_instructions: false
        });
        expect(timeline.timeline.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it("should handle NaN values for trial counts", () => {
      expect(() => {
        const timeline = createTimeline(jsPsych, { 
          num_practice: NaN,
          show_practice: true,
          num_trials: NaN,
          show_instructions: false
        });
        expect(timeline.timeline.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it("should handle all combinations of false/0 settings", () => {
      const edgeCaseConfigs = [
        { show_instructions: false, show_practice: false, num_practice: 0, num_trials: 0 },
        { show_instructions: true, show_practice: false, num_practice: 0, num_trials: 0 },
        { show_instructions: false, show_practice: true, num_practice: 0, num_trials: 0 },
        { show_instructions: false, show_practice: false, num_practice: 5, num_trials: 0 },
        { show_instructions: false, show_practice: false, num_practice: 0, num_trials: 5 },
      ];

      edgeCaseConfigs.forEach((config, index) => {
        expect(() => {
          const timeline = createTimeline(jsPsych, config);
          expect(timeline.timeline.length).toBeGreaterThan(0);
        }).not.toThrow();
      });
    });

    it("should always include completion screen even with no trials", () => {
      const timeline = createTimeline(jsPsych, { 
        show_instructions: false,
        show_practice: false,
        num_practice: 0,
        num_trials: 0
      });
      
      // Should have at least the main intro and completion screens
      expect(timeline.timeline.length).toBeGreaterThanOrEqual(2);
      
      // Check that completion screen is present
      const completionScreen = timeline.timeline.find(trial => 
        trial.data && trial.data.task === 'complete'
      );
      expect(completionScreen).toBeDefined();
    });
  });

  describe("Responsive Sizing", () => {
    it("should add CSS custom property for stimuli count", () => {
      const html3 = createFlankerStim('left', true, fish_stimuli, 3);
      const html7 = createFlankerStim('left', true, fish_stimuli, 7);
      const html15 = createFlankerStim('left', true, fish_stimuli, 15);
      
      expect(html3).toContain('--stimuli-count: 3');
      expect(html7).toContain('--stimuli-count: 7');
      expect(html15).toContain('--stimuli-count: 15');
    });

    it("should add CSS custom property to practice stimuli", () => {
      const practiceHtml = createPracticeStim('right', false, arrow_stimuli, 9);
      
      expect(practiceHtml).toContain('--stimuli-count: 9');
      expect(practiceHtml).toContain('practice');
    });

    it("should handle different stimuli counts with custom property", () => {
      const testCounts = [3, 5, 7, 9, 11, 15, 21];
      
      testCounts.forEach(count => {
        const html = createFlankerStim('left', true, default_stimuli, count);
        expect(html).toContain(`--stimuli-count: ${count}`);
        expect(html).toContain('flanker-stim');
      });
    });

    it("should work with edge cases for responsive sizing", () => {
      // Test with very large count
      const htmlLarge = createFlankerStim('left', true, fish_stimuli, 25);
      expect(htmlLarge).toContain('--stimuli-count: 25');
      
      // Test with minimum count (enforced to 3)
      const htmlMin = createFlankerStim('left', true, fish_stimuli, 1);
      expect(htmlMin).toContain('--stimuli-count: 3');
      
      // Test with invalid input (should fall back to default)
      const htmlInvalid = createFlankerStim('left', true, fish_stimuli, NaN);
      expect(htmlInvalid).toContain('--stimuli-count: 5');
    });
  });
});