/**
 * Corsi Block Task - Utilities
 *
 * Helper functions for sequence generation and configuration
 */

import { JsPsych } from 'jspsych';
import { CorsiBlockConfig, BlockPosition, SequenceGeneration } from './types';
import { DEFAULT_CONFIG, DEFAULT_BLOCKS } from './constants';

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
      ...userConfig.block_colors
    };
  }

  // Copy all other top-level properties
  Object.keys(userConfig).forEach(key => {
    if (key !== 'block_colors' && key !== 'text_object' && key !== 'data_labels' && key !== 'blocks') {
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
 * Generate a single sequence of block indices
 */
export function generateSequence(
  jsPsych: JsPsych,
  length: number,
  numBlocks: number,
  mode: SequenceGeneration,
  allowRepeats: boolean,
  fixedSequences?: number[][]
): number[] {
  if (mode === 'fixed' && fixedSequences && fixedSequences[length - 2]) {
    // Use fixed sequence if available (length-2 because array is 0-indexed starting from length 2)
    return fixedSequences[length - 2].slice();
  }

  // Generate random sequence
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
  [6, 4, 8, 1, 5, 2, 7, 0, 3]
];

/**
 * Get sequences for a specific length
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

  for (let i = 0; i < trialsPerLength; i++) {
    const sequenceIndex = (length - 2) * trialsPerLength + i;
    const fixedSequence = STANDARD_SEQUENCES[sequenceIndex];

    sequences.push(
      generateSequence(
        jsPsych,
        length,
        numBlocks,
        generation,
        allowRepeats,
        generation === 'fixed' ? [fixedSequence] : undefined
      )
    );
  }

  return sequences;
}

/**
 * Calculate Euclidean distance between two blocks
 */
export function calculateDistance(
  block1: BlockPosition,
  block2: BlockPosition
): number {
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
  return Math.round(baseISI + (distance * scaleFactor));
}
