/**
 * Serial Reaction Time Task - Constants and Default Values
 *
 * Standard configurations based on literature
 */

import type { SerialReactionTimeConfig } from './types';

/**
 * Famous sequences from the SRT literature
 */
export const STANDARD_SEQUENCES = {
  /**
   * Nissen & Bullemer (1987) original 10-element sequence
   * Hybrid sequence with some unique and some repeated elements
   */
  NISSEN_BULLEMER: [3, 1, 2, 0, 2, 1, 3, 2, 1, 0],

  /**
   * Reed & Johnson (1994) 12-element second-order conditional sequence
   * Each element requires knowledge of previous two positions to predict
   */
  REED_JOHNSON_SOC: [2, 3, 1, 2, 0, 1, 0, 3, 2, 1, 3, 0],

  /**
   * Alternative SOC sequence commonly used
   */
  SOC_ALTERNATIVE: [1, 3, 0, 1, 2, 0, 2, 3, 1, 0, 3, 2],

  /**
   * Cohen, Ivry, & Keele (1990) unique sequence
   * Each position appears exactly once
   */
  UNIQUE_SEQUENCE: [0, 3, 2, 4, 1],

  /**
   * Cohen, Ivry, & Keele (1990) ambiguous sequence
   * All positions repeat in different orders
   */
  AMBIGUOUS_SEQUENCE: [1, 0, 2, 1, 2, 0],

  /**
   * Baird & Stewart (2018) 9-element sequence
   * Specifically designed to evade explicit awareness
   */
  BAIRD_STEWART: [2, 1, 3, 0, 2, 3, 1, 0, 3],

  /**
   * ASRT pattern for Howard & Howard (1997)
   * Alternating pattern and random: 1r3r2r4r (where r = random)
   * Pattern positions are 0, 2, 4, 6...
   */
  ASRT_PATTERN: [0, 2, 1, 3],
};

/**
 * Default grid configurations for common spatial arrangements
 */
export const DEFAULT_GRIDS = {
  /** Standard 4-location horizontal array */
  HORIZONTAL_4: [[1, 1, 1, 1]],

  /** 6-location horizontal array */
  HORIZONTAL_6: [[1, 1, 1, 1, 1, 1]],

  /** 4-location vertical array */
  VERTICAL_4: [[1], [1], [1], [1]],

  /** 3x3 grid (9 locations) */
  GRID_3X3: [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],

  /** 2x2 grid (4 locations) */
  GRID_2X2: [
    [1, 1],
    [1, 1],
  ],
};

/**
 * Default key choices for common configurations
 */
export const DEFAULT_CHOICES = {
  /** Standard 4-location keyboard mapping (numerical keys) */
  HORIZONTAL_4_NUMERIC: [['3', '5', '7', '9']],

  /** Standard 4-location keyboard mapping (QWERTY) */
  HORIZONTAL_4_QWERTY: [['d', 'f', 'j', 'k']],

  /** 6-location mapping */
  HORIZONTAL_6: [['s', 'd', 'f', 'j', 'k', 'l']],

  /** Vertical 4-location */
  VERTICAL_4: [['d'], ['f'], ['j'], ['k']],

  /** 3x3 grid (numpad mapping) */
  GRID_3X3: [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
  ],

  /** 2x2 grid */
  GRID_2X2: [
    ['e', 'r'],
    ['d', 'f'],
  ],
};

/**
 * Default configuration values
 * Based on most commonly reported parameters in literature
 */
export const DEFAULT_CONFIG: Required<SerialReactionTimeConfig> = {
  // === Stimulus Configuration ===
  stimulus: {
    num_locations: 4,
    arrangement: 'horizontal',
    grid: DEFAULT_GRIDS.HORIZONTAL_4,
    grid_square_size: 100,
    target_color: '#999',
    fade_duration: null,
  },

  // === Response Configuration ===
  response: {
    modality: 'keyboard',
    choices: DEFAULT_CHOICES.HORIZONTAL_4_NUMERIC,
    mapping: 'compatible',
    hand_config: 'bimanual',
    allow_nontarget_responses: false,
  },

  // === Sequence Configuration ===
  sequence: {
    structure: 'deterministic',
    length: 10,
    sequence: STANDARD_SEQUENCES.NISSEN_BULLEMER,
    allow_repeats: false,
    probability_ratio: [0.8, 0.2],
    asrt_pattern: STANDARD_SEQUENCES.ASRT_PATTERN,
  },

  // === Timing Configuration ===
  timing: {
    rsi: 250,
    pre_target_duration: 0,
    trial_duration: null,
    feedback_duration: 200,
    show_response_feedback: false,
  },

  // === Block Configuration ===
  blocks: {
    num_training_blocks: 8,
    trials_per_block: 100,
    num_random_blocks: 2,
    random_block_placement: 'end',
    random_block_positions: [],
  },

  // === Dual Task Configuration ===
  dual_task: {
    enabled: false,
    tone_frequencies: [800, 1200],
    tone_duration: 500,
    tones_per_block: 30,
    counting_prompt: 'How many high tones did you hear?',
  },

  // === Awareness Configuration ===
  awareness: {
    enabled: false,
    assessment_types: ['free-recall'],
    recognition_fragments: 8,
    recognition_fragment_length: 3,
    generation_trials: 10,
    inclusion_trials: 10,
    exclusion_trials: 10,
  },

  // === Metrics Configuration ===
  metrics: {
    calculate_rt_difference: true,
    calculate_triplet_frequencies: false,
    track_chunk_boundaries: false,
    chunk_size: 3,
  },

  // === General Parameters ===
  learning_condition: 'implicit',
  instructions: '',
  show_progress: true,
  text_object: {},
  data_labels: {},
  prompt: null,
};

/**
 * Common configuration presets
 */
export const PRESETS = {
  /**
   * Nissen & Bullemer (1987) replication
   * Original SRT task parameters
   */
  NISSEN_BULLEMER_1987: {
    sequence: {
      structure: 'deterministic' as const,
      sequence: STANDARD_SEQUENCES.NISSEN_BULLEMER,
      length: 10,
    },
    timing: {
      rsi: 500,
      show_response_feedback: true,
      feedback_duration: 200,
    },
    blocks: {
      num_training_blocks: 4,
      trials_per_block: 100,
      num_random_blocks: 1,
      random_block_placement: 'end' as const,
    },
  },

  /**
   * Reed & Johnson (1994) SOC configuration
   */
  SOC_STANDARD: {
    sequence: {
      structure: 'SOC' as const,
      sequence: STANDARD_SEQUENCES.REED_JOHNSON_SOC,
      length: 12,
    },
    timing: {
      rsi: 250,
    },
  },

  /**
   * Destrebecqz & Cleeremans (2001) implicit learning
   * RSI = 0 for purely implicit learning
   */
  PURELY_IMPLICIT: {
    timing: {
      rsi: 0,
    },
    learning_condition: 'implicit' as const,
  },

  /**
   * Howard & Howard (1997) ASRT configuration
   */
  ASRT_STANDARD: {
    sequence: {
      structure: 'ASRT' as const,
      asrt_pattern: STANDARD_SEQUENCES.ASRT_PATTERN,
    },
    blocks: {
      num_training_blocks: 20,
      trials_per_block: 85,
      num_random_blocks: 0,
    },
    metrics: {
      calculate_triplet_frequencies: true,
    },
  },

  /**
   * Dual-task variant (Nissen & Bullemer Exp 2)
   */
  DUAL_TASK: {
    dual_task: {
      enabled: true,
      tone_frequencies: [1000, 1000],
      tone_duration: 500,
      tones_per_block: 30,
    },
  },
};

/**
 * Probability ratios for probabilistic sequences
 */
export const PROBABILITY_RATIOS = {
  /** 60% sequential, 40% deviant */
  RATIO_60_40: [0.6, 0.4] as [number, number],

  /** 80% sequential, 20% random */
  RATIO_80_20: [0.8, 0.2] as [number, number],

  /** 85% sequential, 15% deviant */
  RATIO_85_15: [0.85, 0.15] as [number, number],

  /** ASRT high-frequency vs low-frequency triplet ratio */
  ASRT_RATIO: [0.625, 0.375] as [number, number],
};

/**
 * RSI values and their theoretical implications
 */
export const RSI_VALUES = {
  /** Prevents anticipatory processes, inhibits explicit awareness */
  IMPLICIT_0MS: 0,

  /** Optimal for implicit learning */
  OPTIMAL_250MS: 250,

  /** Original Nissen & Bullemer value */
  ORIGINAL_500MS: 500,

  /** Extended interval, reduces learning */
  EXTENDED_750MS: 750,
};
