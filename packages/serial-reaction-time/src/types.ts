/**
 * Serial Reaction Time Task - Type Definitions
 *
 * Based on comprehensive SRT methodology from Nissen & Bullemer (1987)
 * and subsequent research spanning 35+ years
 */

import type { TrialText } from './text';

/**
 * Response modality
 */
export type ResponseModality = 'keyboard' | 'mouse';

/**
 * Sequence structure type
 */
export type SequenceStructure = 'FOC' | 'SOC' | 'deterministic' | 'probabilistic' | 'ASRT';

/**
 * Spatial arrangement of stimulus locations
 */
export type SpatialArrangement = 'horizontal' | 'vertical' | 'grid' | 'circular';

/**
 * Response mapping type
 */
export type ResponseMapping = 'compatible' | 'incompatible';

/**
 * Hand configuration for keyboard responses
 */
export type HandConfiguration = 'unimanual' | 'bimanual';

/**
 * Learning condition
 */
export type LearningCondition = 'implicit' | 'explicit' | 'incidental';

/**
 * Random block placement strategy
 */
export type RandomBlockPlacement = 'beginning' | 'middle' | 'end' | 'alternating' | 'sandwich';

/**
 * Stop rule for multi-session designs
 */
export type StopRule = 'fixed-blocks' | 'performance-threshold';

/**
 * Awareness assessment type
 */
export type AwarenessAssessment = 'free-recall' | 'recognition' | 'prediction' | 'generation' | 'process-dissociation';

/**
 * Configuration for stimulus locations and grid
 */
export interface StimulusConfig {
  /** Number of stimulus locations (3-9, default 4) */
  num_locations?: number;

  /** Spatial arrangement of locations */
  arrangement?: SpatialArrangement;

  /** Custom grid configuration (overrides arrangement) */
  grid?: number[][];

  /** Square size in pixels */
  grid_square_size?: number;

  /** Target color */
  target_color?: string;

  /** Fade duration for target appearance (ms) */
  fade_duration?: number | null;
}

/**
 * Configuration for response parameters
 */
export interface ResponseConfig {
  /** Response modality */
  modality?: ResponseModality;

  /** Key choices for keyboard response (matches grid structure) */
  choices?: string[][];

  /** Response mapping type */
  mapping?: ResponseMapping;

  /** Hand configuration for keyboard */
  hand_config?: HandConfiguration;

  /** Allow nontarget responses (mouse only) */
  allow_nontarget_responses?: boolean;
}

/**
 * Configuration for sequence parameters
 */
export interface SequenceConfig {
  /** Sequence structure type */
  structure?: SequenceStructure;

  /** Sequence length (5-16, default 10-12) */
  length?: number;

  /** Specific sequence to use (overrides random generation) */
  sequence?: number[];

  /** Allow immediate repeats (same location twice in a row) */
  allow_repeats?: boolean;

  /** Probability ratio for probabilistic sequences [sequential, random] */
  probability_ratio?: [number, number];

  /** ASRT pattern for alternating serial reaction time task */
  asrt_pattern?: number[];
}

/**
 * Configuration for timing parameters
 */
export interface TimingConfig {
  /** Response-stimulus interval (0-750ms, default 250ms) */
  rsi?: number;

  /** Pre-target duration (display grid before target) */
  pre_target_duration?: number;

  /** Trial duration (max time for response) */
  trial_duration?: number | null;

  /** Feedback duration (ms) */
  feedback_duration?: number;

  /** Show response feedback */
  show_response_feedback?: boolean;
}

/**
 * Configuration for block structure
 */
export interface BlockConfig {
  /** Number of training blocks */
  num_training_blocks?: number;

  /** Trials per block */
  trials_per_block?: number;

  /** Number of random probe blocks */
  num_random_blocks?: number;

  /** Random block placement strategy */
  random_block_placement?: RandomBlockPlacement;

  /** Specific random block positions (e.g., [0, 5, 10] for blocks 0, 5, 10) */
  random_block_positions?: number[];
}

/**
 * Configuration for dual-task conditions
 */
export interface DualTaskConfig {
  /** Enable dual task */
  enabled?: boolean;

  /** Tone frequency in Hz [low, high] */
  tone_frequencies?: [number, number];

  /** Tone duration (ms) */
  tone_duration?: number;

  /** Tones per block */
  tones_per_block?: number;

  /** Prompt for tone counting */
  counting_prompt?: string;
}

/**
 * Configuration for awareness assessment
 */
export interface AwarenessConfig {
  /** Enable awareness assessment */
  enabled?: boolean;

  /** Types of awareness tests to administer */
  assessment_types?: AwarenessAssessment[];

  /** Recognition test: number of fragments to show */
  recognition_fragments?: number;

  /** Recognition test: fragment length */
  recognition_fragment_length?: number;

  /** Generation test: number of sequences to generate */
  generation_trials?: number;

  /** Process dissociation: number of inclusion trials */
  inclusion_trials?: number;

  /** Process dissociation: number of exclusion trials */
  exclusion_trials?: number;
}

/**
 * Configuration for learning metrics and data collection
 */
export interface MetricsConfig {
  /** Calculate and store RT differences (sequential - random) */
  calculate_rt_difference?: boolean;

  /** Calculate triplet frequencies (for ASRT) */
  calculate_triplet_frequencies?: boolean;

  /** Track within-chunk vs between-chunk RTs */
  track_chunk_boundaries?: boolean;

  /** Chunk size for chunk analysis */
  chunk_size?: number;
}

/**
 * Comprehensive configuration for Serial Reaction Time Task
 */
export interface SerialReactionTimeConfig {
  // === Core Components ===
  /** Stimulus configuration */
  stimulus?: StimulusConfig;

  /** Response configuration */
  response?: ResponseConfig;

  /** Sequence configuration */
  sequence?: SequenceConfig;

  /** Timing configuration */
  timing?: TimingConfig;

  /** Block structure configuration */
  blocks?: BlockConfig;

  /** Dual-task configuration */
  dual_task?: DualTaskConfig;

  /** Awareness assessment configuration */
  awareness?: AwarenessConfig;

  /** Learning metrics configuration */
  metrics?: MetricsConfig;

  // === General Parameters ===
  /** Learning condition */
  learning_condition?: LearningCondition;

  /** Instructions to show before task */
  instructions?: string;

  /** Show progress between blocks */
  show_progress?: boolean;

  /** Custom text object for internationalization */
  text_object?: Partial<TrialText>;

  /** Custom data labels added to all trials */
  data_labels?: {
    task?: string;
    condition?: string;
    [key: string]: any;
  };

  /** Prompt to display during trials */
  prompt?: string | null;
}

/**
 * Trial data structure
 */
export interface SRTTrialData {
  /** Trial type: 'sequential' or 'random' */
  block_type: 'sequential' | 'random';

  /** Block number */
  block_number: number;

  /** Trial number within block */
  trial_number: number;

  /** Target location */
  target: number[] | number;

  /** Response */
  response: string | number[];

  /** Response time */
  rt: number;

  /** Correct response */
  correct: boolean;

  /** Sequence position (for sequential blocks) */
  sequence_position?: number;

  /** Previous target (for transition analysis) */
  previous_target?: number[] | number;

  /** Triplet context (for ASRT) */
  triplet?: string;

  /** Dual task response (if applicable) */
  tone_count?: number;
}

/**
 * Summary data structure
 */
export interface SRTSummaryData {
  /** Mean RT for sequential blocks */
  mean_rt_sequential: number;

  /** Mean RT for random blocks */
  mean_rt_random: number;

  /** RT difference (learning index) */
  rt_difference: number;

  /** Mean accuracy for sequential blocks */
  mean_accuracy_sequential: number;

  /** Mean accuracy for random blocks */
  mean_accuracy_random: number;

  /** Total trials completed */
  total_trials: number;

  /** Awareness measure (if assessed) */
  awareness_score?: number;
}
