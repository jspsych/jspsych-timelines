import { 
  createTimeline, 
  createAlternatingSequence, 
  createBlockedSequence, 
  createRandomSequence, 
  createBalancedRandomSequence 
} from './index';
import { initJsPsych } from 'jspsych';

// Mock DOM and audio for TTS testing
const mockAudio = {
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  currentTime: 0,
  src: ''
};

// Mock HTMLAudioElement
(global as any).Audio = jest.fn(() => mockAudio);

// Mock document methods
Object.defineProperty(global, 'document', {
  value: {
    getElementById: jest.fn((id) => ({
      textContent: '',
      innerHTML: ''
    })),
    querySelector: jest.fn(() => ({
      innerHTML: '<p>Test content</p>'
    })),
    querySelectorAll: jest.fn(() => []),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    createElement: jest.fn(() => ({})),
    body: { textContent: 'Test content' }
  }
});

// Mock DOMParser
(global as any).DOMParser = jest.fn(() => ({
  parseFromString: jest.fn(() => ({
    body: { textContent: 'Test content' }
  }))
}));

// Mock speechSynthesis
Object.defineProperty(global, 'speechSynthesis', {
  value: {
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn()
  }
});

// Mock SpeechSynthesisUtterance
(global as any).SpeechSynthesisUtterance = jest.fn(() => ({
  rate: 1,
  volume: 1,
  pitch: 1,
  lang: '',
  onstart: null,
  onend: null,
  onerror: null
}));

describe('Helper Functions', () => {
  describe('createAlternatingSequence', () => {
    test('creates alternating sequence correctly', () => {
      expect(createAlternatingSequence(0)).toEqual([]);
      expect(createAlternatingSequence(1)).toEqual(['forward']);
      expect(createAlternatingSequence(2)).toEqual(['forward', 'backward']);
      expect(createAlternatingSequence(4)).toEqual(['forward', 'backward', 'forward', 'backward']);
      expect(createAlternatingSequence(5)).toEqual(['forward', 'backward', 'forward', 'backward', 'forward']);
    });

    test('handles edge cases', () => {
      expect(createAlternatingSequence(-1)).toEqual([]);
      expect(createAlternatingSequence(100).length).toBe(100);
    });
  });

  describe('createBlockedSequence', () => {
    test('creates blocked sequence correctly', () => {
      expect(createBlockedSequence(0, 0)).toEqual([]);
      expect(createBlockedSequence(2, 0)).toEqual(['forward', 'forward']);
      expect(createBlockedSequence(0, 2)).toEqual(['backward', 'backward']);
      expect(createBlockedSequence(2, 3)).toEqual(['forward', 'forward', 'backward', 'backward', 'backward']);
    });

    test('handles negative values', () => {
      expect(createBlockedSequence(-1, 2)).toEqual(['backward', 'backward']);
      expect(createBlockedSequence(2, -1)).toEqual(['forward', 'forward']);
    });
  });

  describe('createRandomSequence', () => {
    test('creates sequence of correct length', () => {
      expect(createRandomSequence(0).length).toBe(0);
      expect(createRandomSequence(5).length).toBe(5);
      expect(createRandomSequence(100).length).toBe(100);
    });

    test('respects probability parameter', () => {
      const sequence1 = createRandomSequence(1000, 0);
      const sequence2 = createRandomSequence(1000, 1);
      
      expect(sequence1.every(trial => trial === 'backward')).toBe(true);
      expect(sequence2.every(trial => trial === 'forward')).toBe(true);
    });

    test('handles edge probabilities', () => {
      expect(() => createRandomSequence(10, -0.1)).not.toThrow();
      expect(() => createRandomSequence(10, 1.1)).not.toThrow();
    });
  });

  describe('createBalancedRandomSequence', () => {
    test('creates balanced sequence', () => {
      const sequence = createBalancedRandomSequence(10);
      const forwardCount = sequence.filter(trial => trial === 'forward').length;
      const backwardCount = sequence.filter(trial => trial === 'backward').length;
      
      expect(sequence.length).toBe(10);
      expect(forwardCount).toBe(5);
      expect(backwardCount).toBe(5);
    });

    test('handles odd numbers', () => {
      const sequence = createBalancedRandomSequence(11);
      const forwardCount = sequence.filter(trial => trial === 'forward').length;
      const backwardCount = sequence.filter(trial => trial === 'backward').length;
      
      expect(sequence.length).toBe(11);
      expect(Math.abs(forwardCount - backwardCount)).toBeLessThanOrEqual(1);
    });

    test('handles edge cases', () => {
      expect(createBalancedRandomSequence(0)).toEqual([]);
      expect(createBalancedRandomSequence(1).length).toBe(1);
    });
  });
});

describe('createTimeline', () => {
  let jsPsych: any;

  beforeEach(() => {
    jsPsych = initJsPsych();
    jest.clearAllMocks();
  });

  describe('Default Configuration', () => {
    test('creates timeline with default parameters', () => {
      const timeline = createTimeline(jsPsych);
      expect(timeline).toBeDefined();
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBe(3); // instructions, trials, results
    });

    test('uses default trial sequence when none provided', () => {
      const timeline = createTimeline(jsPsych, {});
      expect(timeline).toBeDefined();
    });
  });

  describe('Trial Sequence Configuration', () => {
    test('accepts custom trial sequence', () => {
      const customSequence: ('forward' | 'backward')[] = ['forward', 'backward', 'forward'];
      const timeline = createTimeline(jsPsych, { trial_sequence: customSequence });
      expect(timeline).toBeDefined();
    });

    test('handles empty trial sequence', () => {
      const timeline = createTimeline(jsPsych, { trial_sequence: [] });
      expect(timeline).toBeDefined();
    });

    test('handles single trial sequence', () => {
      const timeline = createTimeline(jsPsych, { trial_sequence: ['forward'] });
      expect(timeline).toBeDefined();
    });

    test('handles long trial sequence', () => {
      const longSequence = Array(100).fill('forward').concat(Array(100).fill('backward'));
      const timeline = createTimeline(jsPsych, { trial_sequence: longSequence });
      expect(timeline).toBeDefined();
    });

    test('works with helper function sequences', () => {
      const timeline1 = createTimeline(jsPsych, { 
        trial_sequence: createAlternatingSequence(6) 
      });
      const timeline2 = createTimeline(jsPsych, { 
        trial_sequence: createBlockedSequence(3, 3) 
      });
      const timeline3 = createTimeline(jsPsych, { 
        trial_sequence: createBalancedRandomSequence(8) 
      });
      
      expect(timeline1).toBeDefined();
      expect(timeline2).toBeDefined();
      expect(timeline3).toBeDefined();
    });
  });

  describe('includeForward/includeBackward Configuration', () => {
    test('forward only configuration', () => {
      const timeline = createTimeline(jsPsych, { 
        includeForward: true, 
        includeBackward: false 
      });
      expect(timeline).toBeDefined();
    });

    test('backward only configuration', () => {
      const timeline = createTimeline(jsPsych, { 
        includeForward: false, 
        includeBackward: true 
      });
      expect(timeline).toBeDefined();
    });

    test('both conditions disabled', () => {
      const timeline = createTimeline(jsPsych, { 
        includeForward: false, 
        includeBackward: false 
      });
      expect(timeline).toBeDefined();
    });

    test('explicit both conditions enabled', () => {
      const timeline = createTimeline(jsPsych, { 
        includeForward: true, 
        includeBackward: true 
      });
      expect(timeline).toBeDefined();
    });
  });

  describe('Span Configuration', () => {
    test('custom span range', () => {
      const timeline = createTimeline(jsPsych, { 
        startingSpan: 2, 
        maxSpan: 8 
      });
      expect(timeline).toBeDefined();
    });

    test('single digit span', () => {
      const timeline = createTimeline(jsPsych, { 
        startingSpan: 1, 
        maxSpan: 1 
      });
      expect(timeline).toBeDefined();
    });

    test('large span range', () => {
      const timeline = createTimeline(jsPsych, { 
        startingSpan: 10, 
        maxSpan: 15 
      });
      expect(timeline).toBeDefined();
    });

    test('invalid span range (starting > max)', () => {
      const timeline = createTimeline(jsPsych, { 
        startingSpan: 8, 
        maxSpan: 5 
      });
      expect(timeline).toBeDefined(); // Should still work, just might behave oddly
    });

    test('zero span values', () => {
      const timeline = createTimeline(jsPsych, { 
        startingSpan: 0, 
        maxSpan: 0 
      });
      expect(timeline).toBeDefined();
    });

    test('negative span values', () => {
      const timeline = createTimeline(jsPsych, { 
        startingSpan: -1, 
        maxSpan: -5 
      });
      expect(timeline).toBeDefined();
    });
  });

  describe('Timing Configuration', () => {
    test('custom digit presentation timing', () => {
      const timeline = createTimeline(jsPsych, { 
        digitPresentationTime: 500,
        betweenDigitDelay: 250 
      });
      expect(timeline).toBeDefined();
    });

    test('zero timing values', () => {
      const timeline = createTimeline(jsPsych, { 
        digitPresentationTime: 0,
        betweenDigitDelay: 0 
      });
      expect(timeline).toBeDefined();
    });

    test('very long timing values', () => {
      const timeline = createTimeline(jsPsych, { 
        digitPresentationTime: 10000,
        betweenDigitDelay: 5000,
        responseTimeLimit: 60000 
      });
      expect(timeline).toBeDefined();
    });

    test('negative timing values', () => {
      const timeline = createTimeline(jsPsych, { 
        digitPresentationTime: -100,
        betweenDigitDelay: -50 
      });
      expect(timeline).toBeDefined();
    });
  });

  describe('TTS Configuration', () => {
    test('TTS enabled with default settings', () => {
      const timeline = createTimeline(jsPsych, { enable_tts: true });
      expect(timeline).toBeDefined();
    });

    test('TTS disabled', () => {
      const timeline = createTimeline(jsPsych, { enable_tts: false });
      expect(timeline).toBeDefined();
    });

    test('Google TTS method', () => {
      const timeline = createTimeline(jsPsych, { 
        enable_tts: true, 
        tts_method: 'google' 
      });
      expect(timeline).toBeDefined();
    });

    test('System TTS method', () => {
      const timeline = createTimeline(jsPsych, { 
        enable_tts: true, 
        tts_method: 'system' 
      });
      expect(timeline).toBeDefined();
    });

    test('custom TTS parameters', () => {
      const timeline = createTimeline(jsPsych, { 
        enable_tts: true,
        tts_rate: 0.5,
        tts_pitch: 1.5,
        tts_volume: 0.7,
        tts_lang: 'es-ES'
      });
      expect(timeline).toBeDefined();
    });

    test('extreme TTS parameter values', () => {
      const timeline = createTimeline(jsPsych, { 
        enable_tts: true,
        tts_rate: 10,
        tts_pitch: 2,
        tts_volume: 1,
        tts_lang: 'invalid-lang'
      });
      expect(timeline).toBeDefined();
    });

    test('negative TTS parameter values', () => {
      const timeline = createTimeline(jsPsych, { 
        enable_tts: true,
        tts_rate: -1,
        tts_pitch: -1,
        tts_volume: -1
      });
      expect(timeline).toBeDefined();
    });
  });

  describe('Complex Configuration Combinations', () => {
    test('minimal configuration', () => {
      const timeline = createTimeline(jsPsych, { 
        trial_sequence: ['forward'],
        startingSpan: 1,
        digitPresentationTime: 100,
        enable_tts: false
      });
      expect(timeline).toBeDefined();
    });

    test('maximal configuration', () => {
      const timeline = createTimeline(jsPsych, { 
        trial_sequence: createBalancedRandomSequence(20),
        includeForward: true,
        includeBackward: true,
        startingSpan: 5,
        maxSpan: 12,
        trialsPerSpan: 3,
        digitPresentationTime: 2000,
        betweenDigitDelay: 1000,
        responseTimeLimit: 45000,
        enable_tts: true,
        tts_method: 'google',
        tts_rate: 0.8,
        tts_pitch: 1.2,
        tts_volume: 0.9,
        tts_lang: 'en-GB'
      });
      expect(timeline).toBeDefined();
    });

    test('conflicting configurations', () => {
      // Trial sequence overrides include flags
      const timeline = createTimeline(jsPsych, { 
        trial_sequence: ['backward', 'backward'],
        includeForward: true,
        includeBackward: false
      });
      expect(timeline).toBeDefined();
    });

    test('empty configuration object', () => {
      const timeline = createTimeline(jsPsych, {});
      expect(timeline).toBeDefined();
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    test('undefined jsPsych parameter', () => {
      expect(() => createTimeline(undefined as any)).toThrow();
    });

    test('null jsPsych parameter', () => {
      expect(() => createTimeline(null as any)).toThrow();
    });

    test('invalid jsPsych object', () => {
      expect(() => createTimeline({} as any)).not.toThrow();
    });

    test('undefined config parameter', () => {
      const timeline = createTimeline(jsPsych, undefined);
      expect(timeline).toBeDefined();
    });

    test('null config parameter', () => {
      const timeline = createTimeline(jsPsych, null as any);
      expect(timeline).toBeDefined();
    });

    test('config with unknown properties', () => {
      const timeline = createTimeline(jsPsych, { 
        unknownProperty: 'value',
        anotherUnknown: 123
      } as any);
      expect(timeline).toBeDefined();
    });
  });

  describe('Timeline Structure Validation', () => {
    test('timeline has correct structure', () => {
      const timeline = createTimeline(jsPsych);
      
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBe(3);
      
      // Check instructions
      expect(timeline[0]).toHaveProperty('type');
      expect(timeline[0]).toHaveProperty('pages');
      
      // Check main trial timeline
      expect(timeline[1]).toHaveProperty('timeline');
      expect(timeline[1]).toHaveProperty('loop_function');
      
      // Check results
      expect(timeline[2]).toHaveProperty('type');
      expect(timeline[2]).toHaveProperty('stimulus');
    });

    test('trial timeline contains required elements', () => {
      const timeline = createTimeline(jsPsych);
      const trialTimeline = timeline[1];
      
      if ('timeline' in trialTimeline) {
        expect(trialTimeline.timeline).toBeDefined();
        expect(Array.isArray(trialTimeline.timeline)).toBe(true);
        expect(trialTimeline.timeline.length).toBeGreaterThan(0);
      } else {
        // If not, fail the test
        throw new Error('trialTimeline does not have a timeline property');
      }
    });

    test('instructions have TTS configuration applied', () => {
      const timeline = createTimeline(jsPsych, { enable_tts: true });
      const instructions = timeline[0];
      
      expect(instructions).toHaveProperty('on_load');
      expect(instructions).toHaveProperty('on_finish');
    });
  });

  describe('Data Collection Validation', () => {
    test('trials have required data fields', () => {
      const timeline = createTimeline(jsPsych, { 
        trial_sequence: ['forward', 'backward'] 
      });
      
      // This is a structural test - actual data collection would need integration testing
      expect(timeline).toBeDefined();
    });
  });

  describe('Memory and Performance', () => {
    test('handles large number of trials', () => {
      const largeSequence = Array(1000).fill('forward');
      expect(() => {
        createTimeline(jsPsych, { trial_sequence: largeSequence });
      }).not.toThrow();
    });

    test('handles rapid succession calls', () => {
      for (let i = 0; i < 100; i++) {
        expect(() => {
          createTimeline(jsPsych, { trial_sequence: ['forward'] });
        }).not.toThrow();
      }
    });
  });

  describe('Backward Compatibility', () => {
    test('old-style configuration still works', () => {
      const timeline = createTimeline(jsPsych, { 
        includeForward: true,
        includeBackward: true,
        startingSpan: 3,
        maxSpan: 7
      });
      expect(timeline).toBeDefined();
    });

    test('mixed old and new style configuration', () => {
      const timeline = createTimeline(jsPsych, { 
        trial_sequence: ['forward', 'backward'],
        includeForward: false, // Should be ignored due to trial_sequence
        startingSpan: 4
      });
      expect(timeline).toBeDefined();
    });
  });
});

describe('Integration Tests', () => {
  let jsPsych: any;

  beforeEach(() => {
    jsPsych = initJsPsych();
    jest.clearAllMocks();
  });

  test('timeline can be run by jsPsych', () => {
    const timeline = createTimeline(jsPsych, { 
      trial_sequence: ['forward'],
      digitPresentationTime: 100 
    });
    
    // Mock jsPsych.run to test integration
    jsPsych.run = jest.fn();
    
    expect(() => {
      jsPsych.run(timeline);
    }).not.toThrow();
    
    expect(jsPsych.run).toHaveBeenCalledWith(timeline);
  });

  test('multiple timelines can be created simultaneously', () => {
    const timeline1 = createTimeline(jsPsych, { trial_sequence: ['forward'] });
    const timeline2 = createTimeline(jsPsych, { trial_sequence: ['backward'] });
    const timeline3 = createTimeline(jsPsych, { trial_sequence: ['forward', 'backward'] });
    
    expect(timeline1).toBeDefined();
    expect(timeline2).toBeDefined();
    expect(timeline3).toBeDefined();
    
    // Ensure they are independent
    expect(timeline1).not.toBe(timeline2);
    expect(timeline2).not.toBe(timeline3);
  });
});

describe('Real-world Scenarios', () => {
  let jsPsych: any;

  beforeEach(() => {
    jsPsych = initJsPsych();
    jest.clearAllMocks();
  });

  test('typical research study configuration', () => {
    const timeline = createTimeline(jsPsych, {
      trial_sequence: createBlockedSequence(10, 10),
      startingSpan: 3,
      digitPresentationTime: 1000,
      betweenDigitDelay: 500,
      enable_tts: false
    });
    expect(timeline).toBeDefined();
  });

  test('accessibility study with TTS', () => {
    const timeline = createTimeline(jsPsych, {
      trial_sequence: createAlternatingSequence(16),
      enable_tts: true,
      tts_method: 'system',
      tts_rate: 0.7,
      tts_volume: 1.0
    });
    expect(timeline).toBeDefined();
  });

  test('pilot study configuration', () => {
    const timeline = createTimeline(jsPsych, {
      trial_sequence: ['forward', 'backward'],
      startingSpan: 2,
      digitPresentationTime: 1500,
      responseTimeLimit: 10000
    });
    expect(timeline).toBeDefined();
  });

  test('developmental study configuration', () => {
    const timeline = createTimeline(jsPsych, {
      trial_sequence: Array(8).fill('forward'), // Only forward for children
      startingSpan: 2,
      digitPresentationTime: 2000,
      betweenDigitDelay: 1000,
      enable_tts: true
    });
    expect(timeline).toBeDefined();
  });

  test('clinical assessment configuration', () => {
    const timeline = createTimeline(jsPsych, {
      trial_sequence: createBalancedRandomSequence(30),
      startingSpan: 3,
      maxSpan: 9,
      digitPresentationTime: 1000,
      responseTimeLimit: 30000,
      enable_tts: false
    });
    expect(timeline).toBeDefined();
  });
});