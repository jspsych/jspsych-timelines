import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createTimeline, timelineUnits, utils } from './index';
import { symbols, englishText } from './text';

// Mock jsPsych
const mockJsPsych = {
  data: {
    get: jest.fn(() => ({
      values: jest.fn(() => [])
    })),
    getLastTrialData: jest.fn(() => ({
      values: jest.fn(() => [{}])
    }))
  },
  finishTrial: jest.fn()
} as any;

describe('Oral Symbol Digit Timeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any global state
    (global as any).window = {
      practiceAttempts: 0,
      practiceData: null,
      oralSymbolDigitResults: null
    };
  });

  describe('Constants and Mappings', () => {
    it('should have correct symbol-number mappings', () => {
      const { SYMBOL_MAP } = timelineUnits;
      
      expect(SYMBOL_MAP[symbols.oneSymbol]).toBe(1);
      expect(SYMBOL_MAP[symbols.twoSymbol]).toBe(2);
      expect(SYMBOL_MAP[symbols.threeSymbol]).toBe(3);
      expect(SYMBOL_MAP[symbols.fourSymbol]).toBe(4);
      expect(SYMBOL_MAP[symbols.fiveSymbol]).toBe(5);
      expect(SYMBOL_MAP[symbols.sixSymbol]).toBe(6);
      expect(SYMBOL_MAP[symbols.sevenSymbol]).toBe(7);
      expect(SYMBOL_MAP[symbols.eightSymbol]).toBe(8);
      expect(SYMBOL_MAP[symbols.nineSymbol]).toBe(9);
    });

    it('should have all symbols in SYMBOLS array', () => {
      const { SYMBOLS } = timelineUnits;
      
      expect(SYMBOLS).toHaveLength(9);
      expect(SYMBOLS).toContain(symbols.oneSymbol);
      expect(SYMBOLS).toContain(symbols.nineSymbol);
    });

    it('should have correct symbol entries', () => {
      const { SYMBOL_ENTRIES } = timelineUnits;
      
      expect(SYMBOL_ENTRIES).toHaveLength(9);
      expect(SYMBOL_ENTRIES[0]).toEqual([symbols.oneSymbol, 1]);
      expect(SYMBOL_ENTRIES[8]).toEqual([symbols.nineSymbol, 9]);
    });

    it('should have practice items with correct structure', () => {
      const { PRACTICE_ITEMS } = timelineUnits;
      
      expect(PRACTICE_ITEMS).toHaveLength(9);
      PRACTICE_ITEMS.forEach(item => {
        expect(item).toHaveProperty('symbol');
        expect(item).toHaveProperty('correct');
        expect(typeof item.symbol).toBe('string');
        expect(typeof item.correct).toBe('number');
        expect(item.correct).toBeGreaterThanOrEqual(1);
        expect(item.correct).toBeLessThanOrEqual(9);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('replaceText', () => {
      it('should replace single placeholder', () => {
        const result = utils.replaceText('Hello {}', 'World');
        expect(result).toBe('Hello World');
      });

      it('should replace multiple placeholders in order', () => {
        const result = utils.replaceText('Hello {} and {}', 'World', 'Universe');
        expect(result).toBe('Hello World and Universe');
      });

      it('should handle numbers as replacements', () => {
        const result = utils.replaceText('You scored {} out of {}', 5, 10);
        expect(result).toBe('You scored 5 out of 10');
      });

      it('should handle empty string if no placeholders', () => {
        const result = utils.replaceText('No placeholders here', 'unused');
        expect(result).toBe('No placeholders here');
      });
    });

    describe('formatDuration', () => {
      it('should format seconds less than 60', () => {
        expect(utils.formatDuration(30)).toBe('30 seconds');
        expect(utils.formatDuration(1)).toBe('1 second');
        expect(utils.formatDuration(59)).toBe('59 seconds');
      });

      it('should format minutes without seconds', () => {
        expect(utils.formatDuration(60)).toBe('1 minute');
        expect(utils.formatDuration(120)).toBe('2 minutes');
        expect(utils.formatDuration(300)).toBe('5 minutes');
      });

      it('should format minutes with seconds', () => {
        expect(utils.formatDuration(61)).toBe('1 minute and 1 second');
        expect(utils.formatDuration(65)).toBe('1 minute and 5 seconds');
        expect(utils.formatDuration(125)).toBe('2 minutes and 5 seconds');
      });
    });
  });

  describe('Test Item Generation', () => {
    it('should generate correct number of test items', () => {
      const items = utils.generateTestItems(50);
      expect(items).toHaveLength(50);
    });

    it('should generate test items with correct structure', () => {
      const items = utils.generateTestItems(10);
      
      items.forEach(item => {
        expect(item).toHaveProperty('symbol');
        expect(item).toHaveProperty('correct');
        expect(typeof item.symbol).toBe('string');
        expect(typeof item.correct).toBe('number');
        expect(item.correct).toBeGreaterThanOrEqual(1);
        expect(item.correct).toBeLessThanOrEqual(9);
      });
    });

    it('should generate items with symbols from SYMBOL_MAP', () => {
      const items = utils.generateTestItems(20);
      const { SYMBOL_MAP } = timelineUnits;
      
      items.forEach(item => {
        expect(SYMBOL_MAP).toHaveProperty(item.symbol);
        expect(SYMBOL_MAP[item.symbol as keyof typeof SYMBOL_MAP]).toBe(item.correct);
      });
    });

    it('should generate random distribution', () => {
      const items = utils.generateTestItems(100);
      const symbolCounts = items.reduce((counts, item) => {
        counts[item.symbol] = (counts[item.symbol] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      // Should have some distribution across different symbols
      const uniqueSymbols = Object.keys(symbolCounts);
      expect(uniqueSymbols.length).toBeGreaterThan(1);
    });
  });

  describe('Utility Functions', () => {
    describe('getSymbolForNumber', () => {
      it('should return correct symbol for valid numbers', () => {
        expect(utils.getSymbolForNumber(1)).toBe(symbols.oneSymbol);
        expect(utils.getSymbolForNumber(5)).toBe(symbols.fiveSymbol);
        expect(utils.getSymbolForNumber(9)).toBe(symbols.nineSymbol);
      });

      it('should return undefined for invalid numbers', () => {
        expect(utils.getSymbolForNumber(0)).toBeUndefined();
        expect(utils.getSymbolForNumber(10)).toBeUndefined();
        expect(utils.getSymbolForNumber(-1)).toBeUndefined();
      });
    });

    describe('getNumberForSymbol', () => {
      it('should return correct number for valid symbols', () => {
        expect(utils.getNumberForSymbol(symbols.oneSymbol)).toBe(1);
        expect(utils.getNumberForSymbol(symbols.fiveSymbol)).toBe(5);
        expect(utils.getNumberForSymbol(symbols.nineSymbol)).toBe(9);
      });

      it('should return undefined for invalid symbols', () => {
        expect(utils.getNumberForSymbol('invalid')).toBeUndefined();
        expect(utils.getNumberForSymbol('')).toBeUndefined();
      });
    });
  });

  describe('Timeline Factory Functions', () => {
    const defaultConfig = {
      testDuration: 120,
      practiceRequired: true,
      showInstructions: true,
      showResults: true,
      numTestItems: 143,
      numPracticeItems: 9,
      maxPracticeAttempts: 3,
      useKeyboard: false
    };

    describe('createInstructions', () => {
      it('should create instructions trial with correct structure', () => {
        const instructions = timelineUnits.createInstructions(defaultConfig);
        
        expect(instructions).toHaveProperty('stimulus');
        expect(instructions).toHaveProperty('choices');
        expect(instructions.choices).toEqual([englishText.continueButton]);
        expect(typeof instructions.stimulus).toBe('string');
        expect(instructions.stimulus).toContain(englishText.instructionsTitle);
      });

      it('should include symbol-number key in stimulus', () => {
        const instructions = timelineUnits.createInstructions(defaultConfig);
        
        expect(instructions.stimulus).toContain(symbols.oneSymbol);
        expect(instructions.stimulus).toContain(symbols.nineSymbol);
        expect(instructions.stimulus).toContain('1');
        expect(instructions.stimulus).toContain('9');
      });

      it('should adapt instructions for keyboard vs button input', () => {
        const keyboardInstructions = timelineUnits.createInstructions({...defaultConfig, useKeyboard: true});
        const buttonInstructions = timelineUnits.createInstructions({...defaultConfig, useKeyboard: false});
        
        expect(keyboardInstructions.stimulus).toContain(englishText.inputMethodPressKey);
        expect(buttonInstructions.stimulus).toContain(englishText.inputMethodSelectNumber);
      });
    });

    describe('createPreTest', () => {
      it('should create pre-test trial with correct structure', () => {
        const preTest = timelineUnits.createPreTest(defaultConfig);
        
        expect(preTest).toHaveProperty('stimulus');
        expect(preTest).toHaveProperty('choices');
        expect(preTest.choices).toEqual([englishText.beginMainTestButton]);
        expect(typeof preTest.stimulus).toBe('string');
        expect(preTest.stimulus).toContain(englishText.preTestTitle);
      });

      it('should include test duration in stimulus', () => {
        const preTest = timelineUnits.createPreTest(defaultConfig);
        
        expect(preTest.stimulus).toContain('2 minutes');
      });

      it('should adapt for keyboard vs button input', () => {
        const keyboardPreTest = timelineUnits.createPreTest({...defaultConfig, useKeyboard: true});
        const buttonPreTest = timelineUnits.createPreTest({...defaultConfig, useKeyboard: false});
        
        expect(keyboardPreTest.stimulus).toContain(englishText.inputMethodKeyboard);
        expect(buttonPreTest.stimulus).toContain(englishText.inputMethodButtons);
      });
    });

    describe('createThankYou', () => {
      it('should create thank you trial with correct structure', () => {
        const thankYou = timelineUnits.createThankYou();
        
        expect(thankYou).toHaveProperty('stimulus');
        expect(thankYou).toHaveProperty('choices');
        expect(thankYou.choices).toEqual([englishText.viewResultsButton]);
        expect(typeof thankYou.stimulus).toBe('string');
        expect(thankYou.stimulus).toContain(englishText.thankYouTitle);
      });
    });

    describe('createPractice', () => {
      it('should create practice trial with correct structure', () => {
        const practice = timelineUnits.createPractice(defaultConfig, mockJsPsych);
        
        expect(practice).toHaveProperty('stimulus');
        expect(practice).toHaveProperty('choices');
        expect(practice).toHaveProperty('on_load');
        expect(practice).toHaveProperty('on_finish');
        expect(practice).toHaveProperty('data');
        expect(practice.data).toEqual({ test_part: 'practice' });
        expect(practice.choices).toEqual([]);
      });

      it('should generate practice items with correct length', () => {
        const customConfig = {...defaultConfig, numPracticeItems: 5};
        const practice = timelineUnits.createPractice(customConfig, mockJsPsych);
        
        expect(typeof practice.stimulus).toBe('function');
        const stimulus = practice.stimulus();
        expect(typeof stimulus).toBe('string');
      });
    });

    describe('createPracticeResults', () => {
      it('should create practice results trial with correct structure', () => {
        const practiceResults = timelineUnits.createPracticeResults(defaultConfig, mockJsPsych);
        
        expect(practiceResults).toHaveProperty('stimulus');
        expect(practiceResults).toHaveProperty('choices');
        expect(practiceResults).toHaveProperty('on_finish');
        expect(typeof practiceResults.stimulus).toBe('function');
        expect(typeof practiceResults.choices).toBe('function');
      });
    });

    describe('createMainTest', () => {
      it('should create main test trial with correct structure', () => {
        const mainTest = timelineUnits.createMainTest(defaultConfig, mockJsPsych);
        
        expect(mainTest).toHaveProperty('stimulus');
        expect(mainTest).toHaveProperty('choices');
        expect(mainTest).toHaveProperty('on_load');
        expect(mainTest).toHaveProperty('trial_duration');
        expect(mainTest).toHaveProperty('data');
        expect(mainTest.data).toEqual({ test_part: 'main_test' });
        expect(mainTest.choices).toEqual([]);
        expect(mainTest.trial_duration).toBe(defaultConfig.testDuration * 1000);
      });

      it('should use correct trial duration', () => {
        const customConfig = {...defaultConfig, testDuration: 60};
        const mainTest = timelineUnits.createMainTest(customConfig, mockJsPsych);
        
        expect(mainTest.trial_duration).toBe(60000);
      });
    });

    describe('createResults', () => {
      it('should create results trial with correct structure', () => {
        const results = timelineUnits.createResults(mockJsPsych);
        
        expect(results).toHaveProperty('stimulus');
        expect(results).toHaveProperty('choices');
        expect(results.choices).toEqual([englishText.viewCompleteDataButton]);
        expect(typeof results.stimulus).toBe('function');
      });
    });

    describe('createDataView', () => {
      it('should create data view trial with correct structure', () => {
        const dataView = timelineUnits.createDataView(mockJsPsych);
        
        expect(dataView).toHaveProperty('stimulus');
        expect(dataView).toHaveProperty('choices');
        expect(dataView.choices).toEqual([englishText.finishButton]);
        expect(typeof dataView.stimulus).toBe('function');
      });
    });
  });

  describe('createTimeline', () => {
    it('should create timeline with default configuration', () => {
      const timeline = createTimeline(mockJsPsych);
      
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBeGreaterThan(0);
    });

    it('should create timeline with custom configuration', () => {
      const config = {
        testDuration: 60,
        practiceRequired: false,
        showInstructions: false,
        showResults: false,
        numTestItems: 50,
        numPracticeItems: 5,
        maxPracticeAttempts: 2,
        useKeyboard: true
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBeGreaterThan(0);
    });

    it('should include instructions and practice when showInstructions is true', () => {
      const timeline = createTimeline(mockJsPsych, { showInstructions: true });
      
      // Should have more than just the main test
      expect(timeline.length).toBeGreaterThan(1);
    });

    it('should skip instructions when showInstructions is false', () => {
      const timeline = createTimeline(mockJsPsych, { 
        showInstructions: false,
        showResults: false 
      });
      
      // Should have only main test
      expect(timeline.length).toBe(1);
    });

    it('should include results when showResults is true', () => {
      const timeline = createTimeline(mockJsPsych, { 
        showInstructions: false,
        showResults: true 
      });
      
      // Should have main test + thank you + results
      expect(timeline.length).toBe(3);
    });

    it('should apply default values for missing config options', () => {
      const partialConfig = {
        testDuration: 30
      };
      
      const timeline = createTimeline(mockJsPsych, partialConfig);
      
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBeGreaterThan(0);
    });

    it('should merge provided config with defaults', () => {
      const config = {
        testDuration: 180,
        numTestItems: 200
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      expect(Array.isArray(timeline)).toBe(true);
      // Should still create timeline even with custom values
      expect(timeline.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should export all required functions and constants', () => {
      expect(typeof createTimeline).toBe('function');
      expect(typeof timelineUnits).toBe('object');
      expect(typeof utils).toBe('object');
      
      // Check timelineUnits exports
      expect(timelineUnits).toHaveProperty('SYMBOL_MAP');
      expect(timelineUnits).toHaveProperty('PRACTICE_ITEMS');
      expect(timelineUnits).toHaveProperty('SYMBOLS');
      expect(timelineUnits).toHaveProperty('SYMBOL_ENTRIES');
      expect(timelineUnits).toHaveProperty('createInstructions');
      expect(timelineUnits).toHaveProperty('createMainTest');
      
      // Check utils exports
      expect(utils).toHaveProperty('replaceText');
      expect(utils).toHaveProperty('formatDuration');
      expect(utils).toHaveProperty('getSymbolForNumber');
      expect(utils).toHaveProperty('getNumberForSymbol');
      expect(utils).toHaveProperty('generateTestItems');
    });

    it('should handle edge cases in configuration', () => {
      const edgeConfig = {
        testDuration: 0,
        numTestItems: 0,
        numPracticeItems: 0,
        maxPracticeAttempts: 0
      };
      
      // Should not throw error
      expect(() => createTimeline(mockJsPsych, edgeConfig)).not.toThrow();
    });

    it('should handle empty configuration', () => {
      // Should not throw error with empty config
      expect(() => createTimeline(mockJsPsych, {})).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing jsPsych parameter', () => {
      // Should not throw error with null jsPsych
      expect(() => createTimeline(null as any)).not.toThrow();
    });

    it('should handle invalid configuration types', () => {
      const invalidConfig = {
        testDuration: 'invalid',
        numTestItems: 'invalid',
        practiceRequired: 'invalid'
      } as any;
      
      // Should not throw error
      expect(() => createTimeline(mockJsPsych, invalidConfig)).not.toThrow();
    });
  });
});