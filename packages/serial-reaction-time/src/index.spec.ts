import { JsPsych, initJsPsych } from 'jspsych';
import { createTimeline, STANDARD_SEQUENCES, PRESETS, RSI_VALUES } from '.';

describe('Serial Reaction Time Task', () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  describe('createTimeline', () => {
    it('should return a timeline', () => {
      const timeline = createTimeline(jsPsych);
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it('should create timeline with default parameters', () => {
      const timeline = createTimeline(jsPsych);
      expect(timeline).toBeDefined();
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it('should support custom sequence', () => {
      const timeline = createTimeline(jsPsych, {
        sequence: {
          sequence: STANDARD_SEQUENCES.REED_JOHNSON_SOC,
          length: 12,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support SOC structure', () => {
      const timeline = createTimeline(jsPsych, {
        sequence: {
          structure: 'SOC',
          sequence: STANDARD_SEQUENCES.REED_JOHNSON_SOC,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support probabilistic sequences', () => {
      const timeline = createTimeline(jsPsych, {
        sequence: {
          structure: 'probabilistic',
          probability_ratio: [0.8, 0.2],
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support ASRT structure', () => {
      const timeline = createTimeline(jsPsych, {
        sequence: {
          structure: 'ASRT',
        },
        metrics: {
          calculate_triplet_frequencies: true,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support custom RSI values', () => {
      const timeline = createTimeline(jsPsych, {
        timing: {
          rsi: RSI_VALUES.IMPLICIT_0MS,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support RSI = 0 for implicit learning', () => {
      const timeline = createTimeline(jsPsych, {
        timing: {
          rsi: 0,
        },
        learning_condition: 'implicit',
      });
      expect(timeline).toBeDefined();
    });

    it('should support RSI = 250 for optimal learning', () => {
      const timeline = createTimeline(jsPsych, {
        timing: {
          rsi: 250,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support keyboard modality', () => {
      const timeline = createTimeline(jsPsych, {
        response: {
          modality: 'keyboard',
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support mouse modality', () => {
      const timeline = createTimeline(jsPsych, {
        response: {
          modality: 'mouse',
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support custom block structure', () => {
      const timeline = createTimeline(jsPsych, {
        blocks: {
          num_training_blocks: 10,
          trials_per_block: 120,
          num_random_blocks: 2,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support random block placement at end', () => {
      const timeline = createTimeline(jsPsych, {
        blocks: {
          random_block_placement: 'end',
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support random block placement at beginning', () => {
      const timeline = createTimeline(jsPsych, {
        blocks: {
          random_block_placement: 'beginning',
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support sandwich design', () => {
      const timeline = createTimeline(jsPsych, {
        blocks: {
          random_block_placement: 'sandwich',
          num_random_blocks: 2,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support dual-task condition', () => {
      const timeline = createTimeline(jsPsych, {
        dual_task: {
          enabled: true,
          tone_frequencies: [1000, 1000],
          tones_per_block: 30,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support awareness assessment', () => {
      const timeline = createTimeline(jsPsych, {
        awareness: {
          enabled: true,
          assessment_types: ['free-recall'],
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support recognition test', () => {
      const timeline = createTimeline(jsPsych, {
        awareness: {
          enabled: true,
          assessment_types: ['recognition'],
          recognition_fragments: 8,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support explicit learning condition', () => {
      const timeline = createTimeline(jsPsych, {
        learning_condition: 'explicit',
      });
      expect(timeline).toBeDefined();
    });

    it('should support implicit learning condition', () => {
      const timeline = createTimeline(jsPsych, {
        learning_condition: 'implicit',
      });
      expect(timeline).toBeDefined();
    });

    it('should support custom stimulus configuration', () => {
      const timeline = createTimeline(jsPsych, {
        stimulus: {
          num_locations: 6,
          grid_square_size: 120,
          target_color: '#FF0000',
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support feedback display', () => {
      const timeline = createTimeline(jsPsych, {
        timing: {
          show_response_feedback: true,
          feedback_duration: 300,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support trial duration limit', () => {
      const timeline = createTimeline(jsPsych, {
        timing: {
          trial_duration: 2000,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support Nissen & Bullemer preset', () => {
      const timeline = createTimeline(jsPsych, {
        ...PRESETS.NISSEN_BULLEMER_1987,
      });
      expect(timeline).toBeDefined();
    });

    it('should support SOC standard preset', () => {
      const timeline = createTimeline(jsPsych, {
        ...PRESETS.SOC_STANDARD,
      });
      expect(timeline).toBeDefined();
    });

    it('should support purely implicit preset', () => {
      const timeline = createTimeline(jsPsych, {
        ...PRESETS.PURELY_IMPLICIT,
      });
      expect(timeline).toBeDefined();
    });

    it('should support ASRT standard preset', () => {
      const timeline = createTimeline(jsPsych, {
        ...PRESETS.ASRT_STANDARD,
      });
      expect(timeline).toBeDefined();
    });

    it('should support dual-task preset', () => {
      const timeline = createTimeline(jsPsych, {
        ...PRESETS.DUAL_TASK,
      });
      expect(timeline).toBeDefined();
    });

    it('should support custom text configuration', () => {
      const timeline = createTimeline(jsPsych, {
        text_object: {
          continue_button: 'Next',
          submit_button: 'Done',
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support custom data labels', () => {
      const timeline = createTimeline(jsPsych, {
        data_labels: {
          task: 'my-srt',
          condition: 'experimental',
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support show progress setting', () => {
      const timeline = createTimeline(jsPsych, {
        show_progress: true,
      });
      expect(timeline).toBeDefined();
    });

    it('should support custom prompt', () => {
      const timeline = createTimeline(jsPsych, {
        prompt: '<p>Press the corresponding key as quickly as possible</p>',
      });
      expect(timeline).toBeDefined();
    });

    it('should support learning metrics calculation', () => {
      const timeline = createTimeline(jsPsych, {
        metrics: {
          calculate_rt_difference: true,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support triplet frequency calculation', () => {
      const timeline = createTimeline(jsPsych, {
        sequence: {
          structure: 'ASRT',
        },
        metrics: {
          calculate_triplet_frequencies: true,
        },
      });
      expect(timeline).toBeDefined();
    });

    it('should support chunk boundary tracking', () => {
      const timeline = createTimeline(jsPsych, {
        metrics: {
          track_chunk_boundaries: true,
          chunk_size: 3,
        },
      });
      expect(timeline).toBeDefined();
    });
  });

  describe('Standard Sequences', () => {
    it('should have Nissen & Bullemer sequence', () => {
      expect(STANDARD_SEQUENCES.NISSEN_BULLEMER).toBeDefined();
      expect(STANDARD_SEQUENCES.NISSEN_BULLEMER.length).toBe(10);
    });

    it('should have Reed & Johnson SOC sequence', () => {
      expect(STANDARD_SEQUENCES.REED_JOHNSON_SOC).toBeDefined();
      expect(STANDARD_SEQUENCES.REED_JOHNSON_SOC.length).toBe(12);
    });

    it('should have unique sequence', () => {
      expect(STANDARD_SEQUENCES.UNIQUE_SEQUENCE).toBeDefined();
    });

    it('should have ambiguous sequence', () => {
      expect(STANDARD_SEQUENCES.AMBIGUOUS_SEQUENCE).toBeDefined();
    });

    it('should have ASRT pattern', () => {
      expect(STANDARD_SEQUENCES.ASRT_PATTERN).toBeDefined();
    });
  });

  describe('Presets', () => {
    it('should have Nissen & Bullemer 1987 preset', () => {
      expect(PRESETS.NISSEN_BULLEMER_1987).toBeDefined();
    });

    it('should have SOC standard preset', () => {
      expect(PRESETS.SOC_STANDARD).toBeDefined();
    });

    it('should have purely implicit preset', () => {
      expect(PRESETS.PURELY_IMPLICIT).toBeDefined();
    });

    it('should have ASRT standard preset', () => {
      expect(PRESETS.ASRT_STANDARD).toBeDefined();
    });

    it('should have dual-task preset', () => {
      expect(PRESETS.DUAL_TASK).toBeDefined();
    });
  });

  describe('RSI Values', () => {
    it('should have implicit 0ms value', () => {
      expect(RSI_VALUES.IMPLICIT_0MS).toBe(0);
    });

    it('should have optimal 250ms value', () => {
      expect(RSI_VALUES.OPTIMAL_250MS).toBe(250);
    });

    it('should have original 500ms value', () => {
      expect(RSI_VALUES.ORIGINAL_500MS).toBe(500);
    });

    it('should have extended 750ms value', () => {
      expect(RSI_VALUES.EXTENDED_750MS).toBe(750);
    });
  });
});
