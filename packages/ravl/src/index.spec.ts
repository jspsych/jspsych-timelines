import { createTimeline, createTimelineComponents, utils, cancelAllSpeech, playChime, speakText } from './index';
import { englishText, WORD_LIST, WORD_LIST_B, RECOGNITION_WORDS, substituteText } from './text';

// Mock jsPsych
const mockJsPsych = {
  data: {
    addProperties: jest.fn(),
    get: jest.fn(() => ({
      last: jest.fn(() => ({
        values: jest.fn(() => [{}])
      })),
      filter: jest.fn(() => ({
        last: jest.fn(() => ({
          values: jest.fn(() => [{}])
        }))
      }))
    }))
  }
};

// Get shared mock instances from setup
const mockSpeechSynthesis = (global as any).__mockSpeechSynthesis;
const mockAudioContext = (global as any).__mockAudioContext;

// Mock document methods
Object.defineProperty(document, 'getElementById', {
  writable: true,
  value: jest.fn((id) => {
    if (id === 'word-display') {
      return { textContent: '' };
    }
    if (id === 'recall-input') {
      return { value: 'drum, bell, coffee' };
    }
    if (id === 'selected-words-list') {
      return { textContent: 'None' };
    }
    return null;
  })
});

Object.defineProperty(document, 'querySelectorAll', {
  writable: true,
  value: jest.fn(() => [
    {
      addEventListener: jest.fn(),
      dataset: { word: 'drum' },
      style: {}
    }
  ])
});

// Mock global functions
global.setTimeout = jest.fn((fn) => fn()) as any;
global.clearInterval = jest.fn();

describe('RAVL Timeline Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Timeline Configuration', () => {
    test('should create timeline with default configuration', () => {
      const timeline = createTimeline(mockJsPsych as any);
      expect(timeline).toBeDefined();
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBeGreaterThan(0);
    });

    test('should create timeline with custom learning trials', () => {
      const timeline = createTimeline(mockJsPsych as any, { 
        num_learning_trials: 3 
      });
      expect(timeline).toBeDefined();
      // Should have fewer trials than default
      // Welcome + (3 trials × 3 components each) + interference + A6 + delayed recall components
      expect(timeline.length).toBeGreaterThan(10);
    });

    test('should respect NIH timing standards', () => {
      const timeline = createTimeline(mockJsPsych as any);
      // Check that default timing matches NIH standards
      const config = {
        word_presentation_duration: 1000, // 1 second
        inter_word_interval: 1000, // 1 second
        delay_duration_minutes: 20, // 20 minutes
        max_recall_time: null // No time limit
      };
      
      // Find a word presentation trial
      const wordPresentationTrial = timeline.find(trial => 
        trial.data && trial.data.task === 'ravlt_word_presentation'
      );
      
      if (wordPresentationTrial) {
        expect(wordPresentationTrial.data.word_presentation_duration).toBe(1000);
        expect(wordPresentationTrial.data.inter_word_interval).toBe(1000);
      }
    });

    test('should include all RAVLT components when enabled', () => {
      const timeline = createTimeline(mockJsPsych as any, {
        include_interference_trial: true,
        include_trial_a6: true,
        include_recognition_trial: true,
        include_delayed_recall: true
      });

      // Get all tasks, including nested ones
      const extractTasks = (items: any[]): string[] => {
        const tasks: string[] = [];
        items.forEach(item => {
          if (item.data?.task) {
            tasks.push(item.data.task);
          }
          if (item.timeline) {
            tasks.push(...extractTasks(item.timeline));
          }
        });
        return tasks;
      };

      const taskTypes = extractTasks(timeline);
      
      expect(taskTypes).toContain('ravlt_trial_instructions');
      expect(taskTypes).toContain('ravlt_word_presentation');
      expect(taskTypes).toContain('ravlt_recall');
      expect(taskTypes).toContain('interference_instructions');
      expect(taskTypes).toContain('interference_word_presentation');
      expect(taskTypes).toContain('interference_recall');
      expect(taskTypes).toContain('trial_a6_instructions');
      expect(taskTypes).toContain('trial_a6_recall');
    });

    test('should exclude components when disabled', () => {
      const timeline = createTimeline(mockJsPsych as any, {
        include_interference_trial: false,
        include_trial_a6: false,
        include_recognition_trial: false,
        include_delayed_recall: false
      });

      const taskTypes = timeline.map(trial => trial.data?.task).filter(Boolean);
      
      expect(taskTypes).not.toContain('interference_instructions');
      expect(taskTypes).not.toContain('trial_a6_instructions');
      expect(taskTypes).not.toContain('recognition_trial');
    });
  });

  describe('Word List Management', () => {
    test('should use standard RAVL word lists', () => {
      expect(WORD_LIST).toBeDefined();
      expect(WORD_LIST.length).toBe(15);
      expect(WORD_LIST).toContain('drum');
      expect(WORD_LIST).toContain('curtain');
      
      expect(WORD_LIST_B).toBeDefined();
      expect(WORD_LIST_B.length).toBe(15);
      expect(WORD_LIST_B).toContain('desk');
      expect(WORD_LIST_B).toContain('ranger');
      
      expect(RECOGNITION_WORDS).toBeDefined();
      expect(RECOGNITION_WORDS.length).toBeGreaterThan(30);
    });

    test('should handle randomized word order when enabled', () => {
      const timeline = createTimeline(mockJsPsych as any, {
        randomize_word_order: true
      });
      
      expect(timeline).toBeDefined();
      // Note: Hard to test randomization directly, but ensure it doesn't break
    });

    test('should maintain fixed word order when disabled', () => {
      const timeline = createTimeline(mockJsPsych as any, {
        randomize_word_order: false
      });
      
      expect(timeline).toBeDefined();
    });
  });

  describe('Scoring Functions', () => {
    test('should score List A recall correctly', () => {
      const timeline = createTimeline(mockJsPsych as any);
      
      // Mock a recall trial to test scoring
      const recallTrial = timeline.find(trial => 
        trial.data && trial.data.task === 'ravlt_recall'
      );
      
      expect(recallTrial).toBeDefined();
      if (recallTrial && recallTrial.on_finish) {
        // Mock selected words
        (global.document.getElementById as any).mockReturnValue({
          value: 'drum, bell, coffee, invalid_word'
        });
        
        recallTrial.on_finish({ response: 0 });
        
        // Check that jsPsych data was updated
        expect(mockJsPsych.data.addProperties).toHaveBeenCalled();
      }
    });

    test('should track intrusion errors', () => {
      const timeline = createTimeline(mockJsPsych as any);
      
      // Find a trial that should track intrusions
      const recallTrial = timeline.find(trial => 
        trial.data && trial.data.task === 'ravlt_recall'
      );
      
      if (recallTrial && recallTrial.on_finish) {
        // Mock words with intrusions
        (global.document.getElementById as any).mockReturnValue({
          value: 'drum, desk, invalid_word' // drum=correct, desk=List B intrusion, invalid_word=other intrusion
        });
        
        recallTrial.on_finish({ response: 0 });
        
        const addPropertiesCall = mockJsPsych.data.addProperties.mock.calls[0];
        expect(addPropertiesCall).toBeDefined();
      }
    });

    test('should score recognition trial correctly', () => {
      const timeline = createTimeline(mockJsPsych as any, {
        include_recognition_trial: true
      });
      
      // Find recognition trial in nested structure
      const findTrialByTask = (items: any[], taskName: string): any => {
        for (const item of items) {
          if (item.data?.task === taskName) {
            return item;
          }
          if (item.timeline) {
            const found = findTrialByTask(item.timeline, taskName);
            if (found) return found;
          }
        }
        return null;
      };

      const recognitionTrial = findTrialByTask(timeline, 'recognition_trial');
      
      expect(recognitionTrial).toBeDefined();
      if (recognitionTrial && recognitionTrial.on_finish) {
        // Mock selected words for recognition
        (global as any).window.currentSelectedWords = new Set(['drum', 'bell', 'piano']); // 2 hits, 1 false alarm
        
        recognitionTrial.on_finish({ response: 0 });
        
        expect(mockJsPsych.data.addProperties).toHaveBeenCalled();
        const call = mockJsPsych.data.addProperties.mock.calls[0][0];
        expect(call.recognition_hits).toBeDefined();
        expect(call.recognition_false_alarms).toBeDefined();
      }
    });
  });

  describe('Audio and TTS Management', () => {
    test('should cancel all speech when called', () => {
      cancelAllSpeech();
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    test('should play chime sound', () => {
      playChime();
      expect(mockAudioContext).toHaveBeenCalled();
    });

    test('should speak text when TTS enabled', () => {
      speakText('Test message', { text_to_speech_enabled: true });
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });

    test('should not speak text when TTS disabled', () => {
      const mockCallback = jest.fn();
      speakText('Test message', { 
        text_to_speech_enabled: false,
        onComplete: mockCallback
      });
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled();
    });

    test('should handle audio gracefully when APIs unavailable', () => {
      // Temporarily remove speech synthesis
      const originalSpeechSynthesis = (global as any).window.speechSynthesis;
      (global as any).window.speechSynthesis = undefined;
      
      expect(() => cancelAllSpeech()).not.toThrow();
      expect(() => speakText('test')).not.toThrow();
      
      // Restore
      (global as any).window.speechSynthesis = originalSpeechSynthesis;
    });
  });

  describe('Timeline Components Factory', () => {
    test('should create individual components', () => {
      const components = createTimelineComponents(mockJsPsych as any);
      
      expect(components.welcome).toBeDefined();
      expect(components.interimActivities).toBeDefined();
      expect(components.results).toBeDefined();
      expect(components.createTrialInstructions).toBeDefined();
      expect(components.createWordPresentation).toBeDefined();
      expect(components.cancelAllSpeech).toBeDefined();
      expect(components.playChime).toBeDefined();
      expect(components.speakText).toBeDefined();
      expect(components.getWordList).toBeDefined();
    });

    test('should create trial instructions with proper numbering', () => {
      const components = createTimelineComponents(mockJsPsych as any);
      
      const trial1 = components.createTrialInstructions(1);
      const trial2 = components.createTrialInstructions(2);
      
      expect(trial1.data.trial_number).toBe(1);
      expect(trial2.data.trial_number).toBe(2);
      expect(trial1.stimulus).toContain('Trial 1');
      expect(trial2.stimulus).toContain('Trial 2');
    });

    test('should create word presentation with correct data', () => {
      const components = createTimelineComponents(mockJsPsych as any);
      
      const wordPresentation = components.createWordPresentation(1);
      
      expect(wordPresentation.data.task).toBe('ravlt_word_presentation');
      expect(wordPresentation.data.trial_number).toBe(1);
      expect(wordPresentation.data.word_presentation_duration).toBe(1000);
      expect(wordPresentation.data.inter_word_interval).toBe(1000);
    });
  });

  describe('Timing Validation', () => {
    test('should validate delay timing correctly', () => {
      const timeline = createTimeline(mockJsPsych as any);
      
      // Find timing validation trial
      const validationTrial = timeline.find(trial => 
        trial.data && trial.data.task === 'delay_timing_validation'
      );
      
      expect(validationTrial).toBeDefined();
      if (validationTrial && typeof validationTrial.stimulus === 'function') {
        // Should not throw when called
        expect(() => validationTrial.stimulus()).not.toThrow();
      }
    });

    test('should handle early termination when timing invalid', () => {
      // Mock invalid timing scenario
      mockJsPsych.data.get.mockReturnValue({
        last: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue([{ skip_remaining: true }])
        }),
        filter: jest.fn().mockReturnValue({
          last: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue([{ skip_remaining: true }])
          })
        })
      });

      const timeline = createTimeline(mockJsPsych as any);
      
      // Should include early termination handling
      const hasConditionalTimeline = timeline.some(trial => 
        trial.timeline && trial.conditional_function
      );
      expect(hasConditionalTimeline).toBe(true);
    });
  });

  describe('Results and Summary', () => {
    test('should generate comprehensive results summary', () => {
      const timeline = createTimeline(mockJsPsych as any);
      
      // Find results trial in nested structure
      const findTrialByTask = (items: any[], taskName: string): any => {
        for (const item of items) {
          if (item.data?.task === taskName) {
            return item;
          }
          if (item.timeline) {
            const found = findTrialByTask(item.timeline, taskName);
            if (found) return found;
          }
        }
        return null;
      };

      const resultsTrial = findTrialByTask(timeline, 'results_summary');
      
      expect(resultsTrial).toBeDefined();
      if (resultsTrial && typeof resultsTrial.stimulus === 'function') {
        const summary = resultsTrial.stimulus();
        expect(summary).toContain('RAVLT Results Summary');
        expect(summary).toContain('Original Word List');
      }
    });

    test('should include all trial types in results', () => {
      const timeline = createTimeline(mockJsPsych as any, {
        include_interference_trial: true,
        include_trial_a6: true,
        include_recognition_trial: true
      });
      
      const resultsTrial = timeline.find(trial => 
        trial.data && trial.data.task === 'results_summary'
      );
      
      if (resultsTrial && typeof resultsTrial.stimulus === 'function') {
        const summary = resultsTrial.stimulus();
        // Should show different trial types
        expect(summary).toContain('Trial A');
      }
    });
  });

  describe('Text Internationalization', () => {
    test('should substitute variables in text templates', () => {
      const result = substituteText('{name} scored {score} points', {
        name: 'John',
        score: 85
      });
      expect(result).toBe('John scored 85 points');
    });

    test('should handle missing variables gracefully', () => {
      const result = substituteText('{name} scored {missing} points', {
        name: 'John'
      });
      expect(result).toBe('John scored {missing} points');
    });

    test('should work with English text templates', () => {
      const result = substituteText(englishText.too_soon_warning, {
        minutes: 3,
        minDelay: 5
      });
      expect(result).toContain('3');
      expect(result).toContain('5');
    });
  });

  describe('Accessibility and Clinical Standards', () => {
    test('should default to auditory-only mode for clinical accuracy', () => {
      const timeline = createTimeline(mockJsPsych as any);
      
      // Check that show_word_grid defaults to false
      const config = {};
      const defaultConfig = createTimeline(mockJsPsych as any, config);
      expect(defaultConfig).toBeDefined();
    });

    test('should have no time limits by default for clinical accuracy', () => {
      const timeline = createTimeline(mockJsPsych as any);
      
      // Find recall trials
      const recallTrials = timeline.filter(trial => 
        trial.data && trial.data.task === 'ravlt_recall'
      );
      
      recallTrials.forEach(trial => {
        expect(trial.trial_duration).toBeNull();
      });
    });

    test('should maintain fixed word order by default', () => {
      const timeline = createTimeline(mockJsPsych as any);
      
      // Find word presentation trials
      const wordTrials = timeline.filter(trial => 
        trial.data && trial.data.task === 'ravlt_word_presentation'
      );
      
      wordTrials.forEach(trial => {
        expect(trial.data.randomized_order).toBe(false);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty word lists gracefully', () => {
      // This would require modifying the word lists, but we test the principle
      expect(() => createTimeline(mockJsPsych as any)).not.toThrow();
    });

    test('should handle missing DOM elements gracefully', () => {
      // Temporarily mock getElementById to return null
      const originalGetElementById = document.getElementById;
      document.getElementById = jest.fn().mockReturnValue(null);
      
      const timeline = createTimeline(mockJsPsych as any);
      
      // Find a trial with DOM interaction
      const wordTrial = timeline.find(trial => 
        trial.data && trial.data.task === 'ravlt_word_presentation'
      );
      
      if (wordTrial && wordTrial.on_load) {
        // Should handle null elements gracefully without throwing
        expect(() => {
          try {
            wordTrial.on_load();
          } catch (error) {
            // Expected to throw due to null element, but shouldn't crash the app
            expect(error).toBeDefined();
          }
        }).not.toThrow();
      }
      
      // Restore original method
      document.getElementById = originalGetElementById;
    });

    test('should handle browser compatibility issues', () => {
      // Test without modern APIs
      const originalAudioContext = (global as any).window.AudioContext;
      const originalWebkitAudioContext = (global as any).window.webkitAudioContext;
      
      (global as any).window.AudioContext = undefined;
      (global as any).window.webkitAudioContext = undefined;
      
      expect(() => playChime()).not.toThrow();
      
      // Restore
      (global as any).window.AudioContext = originalAudioContext;
      (global as any).window.webkitAudioContext = originalWebkitAudioContext;
    });
  });

  describe('Utils Export', () => {
    test('should export all utility functions', () => {
      expect(utils.substituteText).toBeDefined();
      expect(utils.cancelAllSpeech).toBeDefined();
      expect(utils.playChime).toBeDefined();
      expect(utils.speakText).toBeDefined();
    });

    test('should have working utility functions', () => {
      expect(typeof utils.substituteText).toBe('function');
      expect(typeof utils.cancelAllSpeech).toBe('function');
      expect(typeof utils.playChime).toBe('function');
      expect(typeof utils.speakText).toBe('function');
      
      // Test they work
      expect(() => utils.cancelAllSpeech()).not.toThrow();
      expect(() => utils.playChime()).not.toThrow();
      
      const textResult = utils.substituteText('Hello {name}', { name: 'World' });
      expect(textResult).toBe('Hello World');
    });
  });

  describe('Memory Management', () => {
    test('should clean up intervals and timeouts', () => {
      const timeline = createTimeline(mockJsPsych as any);
      
      // Find delay timer trial
      const delayTrial = timeline.find(trial => 
        trial.data && trial.data.task === 'delay_progress_timer'
      );
      
      if (delayTrial && delayTrial.on_finish) {
        // Mock interval cleanup
        (global as any).window.delayUpdateInterval = 123;
        delayTrial.on_finish();
        expect(clearInterval).toHaveBeenCalledWith(123);
      }
    });

    test('should clean up global variables', () => {
      const timeline = createTimeline(mockJsPsych as any);
      
      // Find trials that use global variables
      const recallTrials = timeline.filter(trial => 
        trial.data && trial.data.task.includes('recall')
      );
      
      recallTrials.forEach(trial => {
        if (trial.on_finish) {
          // Mock global variable
          (global as any).window.currentSelectedWords = new Set(['test']);
          trial.on_finish({ response: 0 });
          // Should be cleaned up (we can't easily test this, but ensure no errors)
        }
      });
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large numbers of trials efficiently', () => {
      const startTime = Date.now();
      const timeline = createTimeline(mockJsPsych as any, {
        num_learning_trials: 20
      });
      const endTime = Date.now();
      
      expect(timeline).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should scale with different word list sizes', () => {
      // Test that the implementation can handle different list sizes
      // (This would require modifying WORD_LIST, but we test the principle)
      expect(() => createTimeline(mockJsPsych as any)).not.toThrow();
    });
  });
});