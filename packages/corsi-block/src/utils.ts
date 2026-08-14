/**
 * Corsi Block Task - Utilities
 *
 * Helper functions for sequence generation and configuration
 */

import { JsPsych } from "jspsych";

import { DEFAULT_BLOCKS, DEFAULT_CONFIG } from "./constants";
import { BlockPosition, CorsiBlockConfig, SequenceGeneration } from "./types";

/**
 * Merge user config with defaults
 */
export function mergeConfig(
  userConfig: CorsiBlockConfig,
  defaults: typeof DEFAULT_CONFIG
): typeof DEFAULT_CONFIG & { blocks: BlockPosition[] } {
  const merged: any = { ...defaults };

  // Merge block colors if provided
  if (userConfig.block_colors) {
    merged.block_colors = {
      ...defaults.block_colors,
      ...userConfig.block_colors,
    };
  }

  // Copy all other top-level properties
  Object.keys(userConfig).forEach((key) => {
    if (key !== "block_colors" && key !== "text" && key !== "data_labels" && key !== "blocks") {
      if (userConfig[key] !== undefined) {
        merged[key] = userConfig[key];
      }
    }
  });

  // Set blocks
  merged.blocks = userConfig.blocks || DEFAULT_BLOCKS;

  return merged;
}

/**
 * Generate a single random sequence of block indices.
 *
 * `numBlocks` must be at least 2 when `allowRepeats` is false, otherwise there
 * is no legal next block and the rejection loop below cannot terminate.
 */
export function generateSequence(
  jsPsych: JsPsych,
  length: number,
  numBlocks: number,
  allowRepeats: boolean
): number[] {
  // validateConfig handles this, but we check here too in case this is called separately
  if (!allowRepeats && numBlocks < 2) {
    throw new Error(
      `[corsi-block] generating a sequence without immediate repeats requires at least 2 blocks, got ${numBlocks}`
    );
  }

  const sequence: number[] = [];
  for (let i = 0; i < length; i++) {
    let nextBlock: number;
    if (!allowRepeats && sequence.length > 0) {
      // Ensure no immediate repeats
      do {
        nextBlock = jsPsych.randomization.randomInt(0, numBlocks - 1);
      } while (nextBlock === sequence[sequence.length - 1]);
    } else {
      nextBlock = jsPsych.randomization.randomInt(0, numBlocks - 1);
    }
    sequence.push(nextBlock);
  }

  return sequence;
}

/**
 * Fixed sequences for standard Corsi Block task
 * These are carefully designed to avoid geometric patterns
 */
export const STANDARD_SEQUENCES: number[][] = [
  // Length 2
  [2, 4],
  [5, 8],

  // Length 3
  [6, 2, 8],
  [4, 7, 3],

  // Length 4
  [6, 1, 5, 8],
  [4, 2, 7, 3],

  // Length 5
  [4, 2, 8, 6, 5],
  [6, 1, 5, 8, 3],

  // Length 6
  [5, 7, 4, 6, 1, 8],
  [3, 8, 2, 5, 4, 6],

  // Length 7
  [5, 8, 1, 4, 6, 3, 7],
  [3, 1, 8, 4, 7, 2, 5],

  // Length 8
  [5, 2, 1, 8, 6, 4, 7, 3],
  [4, 7, 3, 6, 1, 5, 2, 8],

  // Length 9
  [4, 1, 3, 6, 2, 8, 5, 7, 0],
  [6, 4, 8, 1, 5, 2, 7, 0, 3],
];

/** number of fixed sequences `STANDARD_SEQUENCES` provides at each length */
export const FIXED_SEQUENCES_PER_LENGTH = 2;

/** lowest sequence length `STANDARD_SEQUENCES` covers */
export const FIXED_MIN_LENGTH = 2;

/** highest sequence length `STANDARD_SEQUENCES` covers */
export const FIXED_MAX_LENGTH =
  FIXED_MIN_LENGTH + STANDARD_SEQUENCES.length / FIXED_SEQUENCES_PER_LENGTH - 1;

/** number of blocks the indices in `STANDARD_SEQUENCES` require */
export const FIXED_REQUIRED_BLOCKS =
  Math.max(...STANDARD_SEQUENCES.map((sequence) => Math.max(...sequence))) + 1;

/**
 * Position of the fixed sequence for a given length and trial.
 *
 * STANDARD_SEQUENCES is a flat list of FIXED_SEQUENCES_PER_LENGTH sequences per
 * length, starting at FIXED_MIN_LENGTH. The stride is the number of sequences
 * the table stores per length, *not* the configured trials_per_length.
 */
function fixedSequenceIndex(length: number, trial: number): number {
  return (length - FIXED_MIN_LENGTH) * FIXED_SEQUENCES_PER_LENGTH + trial;
}

/**
 * Get sequences for a specific length.
 *
 * With `generation: 'fixed'` every sequence comes from STANDARD_SEQUENCES, so
 * two runs of the same config produce identical sequences.
 */
export function getSequencesForLength(
  jsPsych: JsPsych,
  length: number,
  trialsPerLength: number,
  numBlocks: number,
  generation: SequenceGeneration,
  allowRepeats: boolean
): number[][] {
  const sequences: number[][] = [];

  for (let trial = 0; trial < trialsPerLength; trial++) {
    if (generation === "fixed") {
      const fixedSequence = STANDARD_SEQUENCES[fixedSequenceIndex(length, trial)];
      if (!fixedSequence) {
        throw new Error(
          `[corsi-block] no fixed sequence available for length ${length}, trial ${trial + 1}`
        );
      }
      sequences.push(fixedSequence.slice());
    } else {
      sequences.push(generateSequence(jsPsych, length, numBlocks, allowRepeats));
    }
  }

  return sequences;
}

/**
 * reject configurations that would produce invalid/degenerate datasets,
 * always failing loudly at construction rather than silently.
 */
export function validateConfig(config: typeof DEFAULT_CONFIG & { blocks: BlockPosition[] }): void {
  const requireInt = (name: string, value: number, min: number) => {
    if (!Number.isInteger(value) || value < min) {
      throw new Error(`[corsi-block] ${name} must be an integer >= ${min}, got ${value}`);
    }
  };

  const requireDuration = (name: string, value: number) => {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new Error(
        `[corsi-block] ${name} must be a duration in milliseconds >= 0, got ${value}`
      );
    }
  };

  // -- Sequence length range --
  requireInt("starting_length", config.starting_length, 1);
  requireInt("max_length", config.max_length, 1);
  if (config.max_length < config.starting_length) {
    throw new Error(
      `[corsi-block] max_length (${config.max_length}) must be >= starting_length ` +
        `(${config.starting_length}); as given, no trials would be generated`
    );
  }

  // -- Trial counts --
  requireInt("trials_per_length", config.trials_per_length, 1);
  requireInt("consecutive_errors_threshold", config.consecutive_errors_threshold, 1);
  if (config.max_practice_attempts !== null) {
    requireInt("max_practice_attempts", config.max_practice_attempts, 1);
  }

  // -- Block layout --
  if (!Array.isArray(config.blocks) || config.blocks.length < 2) {
    throw new Error(
      `[corsi-block] blocks must contain at least 2 positions, got ` +
        `${Array.isArray(config.blocks) ? config.blocks.length : typeof config.blocks}`
    );
  }

  // -- Timing --
  requireDuration("stimulus_duration", config.stimulus_duration);
  requireDuration("inter_stimulus_interval", config.inter_stimulus_interval);
  requireDuration("post_sequence_delay", config.post_sequence_delay);
  requireDuration("inter_trial_delay", config.inter_trial_delay);
  requireDuration("click_feedback_duration", config.click_feedback_duration);

  if (config.response_timeout !== null) {
    if (typeof config.response_timeout !== "number" || config.response_timeout <= 0) {
      throw new Error(
        `[corsi-block] response_timeout must be null (no limit) or a positive number of ` +
          `milliseconds, got ${config.response_timeout}`
      );
    }
  }

  // -- Display --
  if (typeof config.block_size !== "number" || config.block_size <= 0 || config.block_size > 100) {
    throw new Error(
      `[corsi-block] block_size is a percentage of the display and must be > 0 and <= 100, ` +
        `got ${config.block_size}`
    );
  }

  // -- Fixed sequence coverage --
  // STANDARD_SEQUENCES is a fixed table; a request it cannot satisfy would
  // otherwise fall through to random sequences, silently invalidating a study
  // that reported using fixed ones.
  if (config.sequence_generation === "fixed") {
    const useRandom = `Use sequence_generation: 'random'.`;

    if (config.trials_per_length > FIXED_SEQUENCES_PER_LENGTH) {
      throw new Error(
        `[corsi-block] sequence_generation 'fixed' provides ${FIXED_SEQUENCES_PER_LENGTH} sequences ` +
          `per length, so trials_per_length may be at most ${FIXED_SEQUENCES_PER_LENGTH}, ` +
          `got ${config.trials_per_length}. ${useRandom}`
      );
    }

    if (config.starting_length < FIXED_MIN_LENGTH || config.max_length > FIXED_MAX_LENGTH) {
      throw new Error(
        `[corsi-block] sequence_generation 'fixed' covers sequence lengths ` +
          `${FIXED_MIN_LENGTH}-${FIXED_MAX_LENGTH}, got ${config.starting_length}-${config.max_length}. ` +
          `${useRandom}`
      );
    }

    if (config.blocks.length < FIXED_REQUIRED_BLOCKS) {
      throw new Error(
        `[corsi-block] sequence_generation 'fixed' uses block indices up to ${
          FIXED_REQUIRED_BLOCKS - 1
        }, ` +
          `so it requires at least ${FIXED_REQUIRED_BLOCKS} blocks, got ${config.blocks.length}. ${useRandom}`
      );
    }
  }
}

/**
 * Calculate Euclidean distance between two blocks
 */
export function calculateDistance(block1: BlockPosition, block2: BlockPosition): number {
  const dx = block2.x - block1.x;
  const dy = block2.y - block1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate ISI based on distance if using distance-based mode
 * Uses a simple linear scaling: base ISI + (distance * scale factor)
 */
export function calculateDistanceBasedISI(
  block1: BlockPosition,
  block2: BlockPosition,
  baseISI: number,
  scaleFactor: number = 0.5
): number {
  const distance = calculateDistance(block1, block2);
  return Math.round(baseISI + distance * scaleFactor);
}
