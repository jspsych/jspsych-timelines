/**
 * Corsi Block Task - Type Definitions
 *
 * Based on standard Corsi Block tapping task methodology
 */

import type { TrialText } from './text';

/**
 * Block positioning configuration
 */
export interface BlockPosition {
  x: number;
  y: number;
}

/**
 * ISI mode configuration
 */
export type ISIMode = 'fixed' | 'distance-based';

/**
 * Sequence initiation mode
 */
export type SequenceInitiation = 'auto' | 'button';

/**
 * Stop rule for discontinuation
 */
export type StopRule = 'both-trials' | 'consecutive-errors';

/**
 * Sequence generation mode
 */
export type SequenceGeneration = 'fixed' | 'random';

/**
 * Input modality
 */
export type InputModality = 'touchscreen' | 'mouse';

/**
 * Block color configuration
 */
export interface BlockColors {
  inactive: string;
  active: string;
  correct?: string;
  incorrect?: string;
}

/**
 * Comprehensive configuration for Corsi Block Task
 */
export interface CorsiBlockConfig {
  // === Temporal Parameters ===
  /** Duration that a block remains highlighted (ms) */
  stimulus_duration?: number;

  /** Inter-stimulus interval: pause between blocks (ms) */
  inter_stimulus_interval?: number;

  /** ISI mode: fixed time or distance-based */
  isi_mode?: ISIMode;

  /** Post-sequence delay: pause after sequence before response enabled (ms) */
  post_sequence_delay?: number;

  /** Inter-trial delay: pause between trials (ms) */
  inter_trial_delay?: number;

  /** Response timeout: max time for response (ms). null = no limit */
  response_timeout?: number | null;

  // === Visual Parameters ===
  /** Block color configuration */
  block_colors?: BlockColors;

  /** Background color */
  background_color?: string;

  /** Click feedback duration (ms) */
  click_feedback_duration?: number;

  /** Display width */
  display_width?: string;

  /** Display height */
  display_height?: string;

  /** Block size as percentage of display */
  block_size?: number;

  // === Interaction Parameters ===
  /** Input modality */
  input_modality?: InputModality;

  /** Sequence initiation mode */
  sequence_initiation?: SequenceInitiation;

  /** Allow correction/undo */
  allow_correction?: boolean;

  // === Algorithm Parameters ===
  /** Starting sequence length */
  starting_length?: number;

  /** Trials per length */
  trials_per_length?: number;

  /** Discontinuation rule */
  stop_rule?: StopRule;

  /** Number of consecutive errors for stop rule */
  consecutive_errors_threshold?: number;

  /** Sequence generation mode */
  sequence_generation?: SequenceGeneration;

  /** Allow immediate repeats (same block twice in a row) */
  allow_repeats?: boolean;

  /** Maximum sequence length to test */
  max_length?: number;

  /** Custom block positions (overrides default) */
  blocks?: BlockPosition[];

  // === Text Configuration ===
  /** Custom text object for internationalization */
  text_object?: Partial<TrialText>;

  // === Data Parameters ===
  /** Custom data labels added to all trials */
  data_labels?: {
    task?: string;
    condition?: string;
    [key: string]: any;
  };
}

/**
 * Trial result data
 */
export interface CorsiTrialResult {
  sequence_length: number;
  trial_number: number;
  sequence: number[];
  response: number[];
  correct: boolean;
  rt: number[];
  span?: number;  // Calculated span (if this was the final trial)
}
