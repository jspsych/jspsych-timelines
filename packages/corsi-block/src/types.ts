/**
 * Corsi Block Task - Type Definitions
 *
 * Based on standard Corsi Block tapping task methodology
 */

import type { TextConfig } from "./text";

/**
 * Block positioning configuration
 */
export interface BlockPosition {
  x: number;
  y: number;
}

/**
 * Stop rule for discontinuation
 */
export type StopRule = "both-trials" | "consecutive-errors";

/**
 * Sequence generation mode
 */
export type SequenceGeneration = "fixed" | "random";

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

  /** Duration the blocks are shown before the sequence begins (ms) */
  pre_stim_duration?: number;

  /**
   * Pause between the end of the sequence and the response screen (ms).
   *
   * The screen is blank for this interval. jsPsych clears the display before
   * the gap, so the board cannot be left visible while responses are disabled.
   */
  post_sequence_delay?: number;

  /** Inter-trial delay: blank pause between trials (ms) */
  inter_trial_delay?: number;

  // === Visual Parameters ===
  /** Block color configuration */
  block_colors?: BlockColors;

  /**
   * Background color of the block display area, `null` to inherit page background.
   */
  background_color?: string | null;

  /** Click feedback duration (ms) */
  click_feedback_duration?: number;

  /** Display width */
  display_width?: string;

  /** Display height */
  display_height?: string;

  /** Block size as percentage of display */
  block_size?: number;

  // === Interaction Parameters ===
  /**
   * How many times the participant may attempt the instruction practice before
   * the task continues regardless. If `null`, the practice will repeat indefinitely
   * until the participant succeeds.
   */
  max_practice_attempts?: number | null;

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
  /** Custom text for internationalization */
  text?: Partial<TextConfig>;

  // === Data Parameters ===
  /** Custom data labels added to all trials */
  data_labels?: DataLabels;
}

/** reserve specific data labels that cannot be overriden by the user */
export type ReservedDataField =
  | "task"
  | "task_version"
  | "phase"
  | "part"
  | "sequence_length"
  | "trial_in_length";

export type DataLabels = { [key: string]: any } & {
  [K in ReservedDataField]?: never;
};
