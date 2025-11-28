/**
 * Serial Reaction Time Task - Utility Functions
 *
 * Sequence generation, randomization, and metrics calculation
 */

import { JsPsych } from 'jspsych';
import type { SerialReactionTimeConfig, SRTSummaryData } from './types';
import { DEFAULT_CONFIG } from './constants';

/**
 * Deep merge two configuration objects
 */
export function mergeConfig(
  config: SerialReactionTimeConfig,
  defaults: Required<SerialReactionTimeConfig>
): Required<SerialReactionTimeConfig> {
  return {
    stimulus: { ...defaults.stimulus, ...config.stimulus },
    response: { ...defaults.response, ...config.response },
    sequence: { ...defaults.sequence, ...config.sequence },
    timing: { ...defaults.timing, ...config.timing },
    blocks: { ...defaults.blocks, ...config.blocks },
    dual_task: { ...defaults.dual_task, ...config.dual_task },
    awareness: { ...defaults.awareness, ...config.awareness },
    metrics: { ...defaults.metrics, ...config.metrics },
    learning_condition: config.learning_condition ?? defaults.learning_condition,
    instructions: config.instructions ?? defaults.instructions,
    show_progress: config.show_progress ?? defaults.show_progress,
    text_object: { ...defaults.text_object, ...config.text_object },
    data_labels: { ...defaults.data_labels, ...config.data_labels },
    prompt: config.prompt ?? defaults.prompt,
  };
}

/**
 * Generate a random sequence of target locations
 */
export function generateRandomSequence(
  jsPsych: JsPsych,
  length: number,
  numLocations: number,
  allowRepeats: boolean = false
): number[] {
  const sequence: number[] = [];

  for (let i = 0; i < length; i++) {
    let target: number;

    if (allowRepeats) {
      target = jsPsych.randomization.randomInt(0, numLocations - 1);
    } else {
      // Avoid immediate repeats
      do {
        target = jsPsych.randomization.randomInt(0, numLocations - 1);
      } while (sequence.length > 0 && target === sequence[sequence.length - 1]);
    }

    sequence.push(target);
  }

  return sequence;
}

/**
 * Generate an ASRT sequence (Alternating Serial Reaction Time)
 * Pattern positions alternate with random positions
 */
export function generateASRTSequence(
  jsPsych: JsPsych,
  pattern: number[],
  totalTrials: number,
  numLocations: number
): number[] {
  const sequence: number[] = [];
  let patternIndex = 0;

  for (let i = 0; i < totalTrials; i++) {
    if (i % 2 === 0) {
      // Pattern position
      sequence.push(pattern[patternIndex % pattern.length]);
      patternIndex++;
    } else {
      // Random position
      const randomTarget = jsPsych.randomization.randomInt(0, numLocations - 1);
      sequence.push(randomTarget);
    }
  }

  return sequence;
}

/**
 * Generate a probabilistic sequence
 * Mixes sequential pattern with random deviants based on probability ratio
 */
export function generateProbabilisticSequence(
  jsPsych: JsPsych,
  baseSequence: number[],
  totalTrials: number,
  numLocations: number,
  probabilityRatio: [number, number]
): number[] {
  const sequence: number[] = [];
  const [seqProb, randProb] = probabilityRatio;
  let sequenceIndex = 0;

  for (let i = 0; i < totalTrials; i++) {
    const rand = Math.random();

    if (rand < seqProb) {
      // Use sequential pattern
      sequence.push(baseSequence[sequenceIndex % baseSequence.length]);
      sequenceIndex++;
    } else {
      // Use random deviant
      const randomTarget = jsPsych.randomization.randomInt(0, numLocations - 1);
      sequence.push(randomTarget);
    }
  }

  return sequence;
}

/**
 * Check if a sequence is First-Order Conditional (FOC)
 * Each element uniquely predicts the next
 */
export function isFirstOrderConditional(sequence: number[]): boolean {
  const transitions = new Map<number, Set<number>>();

  for (let i = 0; i < sequence.length - 1; i++) {
    const current = sequence[i];
    const next = sequence[i + 1];

    if (!transitions.has(current)) {
      transitions.set(current, new Set());
    }

    transitions.get(current)!.add(next);
  }

  // Check if all transitions are unique
  for (const [_, nextSet] of transitions) {
    if (nextSet.size > 1) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a sequence is Second-Order Conditional (SOC)
 * Requires two previous elements to predict the next
 */
export function isSecondOrderConditional(sequence: number[]): boolean {
  if (isFirstOrderConditional(sequence)) {
    return false; // FOC, not SOC
  }

  const transitions = new Map<string, Set<number>>();

  for (let i = 0; i < sequence.length - 2; i++) {
    const bigram = `${sequence[i]}-${sequence[i + 1]}`;
    const next = sequence[i + 2];

    if (!transitions.has(bigram)) {
      transitions.set(bigram, new Set());
    }

    transitions.get(bigram)!.add(next);
  }

  // Check if all second-order transitions are unique
  for (const [_, nextSet] of transitions) {
    if (nextSet.size > 1) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate triplet for ASRT analysis
 * Returns triplet type (e.g., "1-2-3" or "high-freq" vs "low-freq")
 */
export function getTriplet(
  sequence: number[],
  position: number,
  asrtPattern: number[]
): { triplet: string; frequency: 'high' | 'low' } {
  if (position < 2) {
    return { triplet: 'N/A', frequency: 'high' };
  }

  const triplet = [
    sequence[position - 2],
    sequence[position - 1],
    sequence[position],
  ];
  const tripletString = triplet.join('-');

  // Check if it's a repetition (e.g., 1-1-1) or trill (e.g., 1-2-1)
  if (triplet[0] === triplet[1] || triplet[1] === triplet[2]) {
    return { triplet: tripletString, frequency: 'high' }; // Exclude from analysis
  }

  // For ASRT, high-frequency triplets have pattern elements at positions 0 and 2
  // Check if this matches the expected pattern structure
  const isHighFreq = isASRTHighFrequencyTriplet(triplet, position, asrtPattern);

  return {
    triplet: tripletString,
    frequency: isHighFreq ? 'high' : 'low',
  };
}

/**
 * Check if triplet is high-frequency in ASRT
 */
function isASRTHighFrequencyTriplet(
  triplet: number[],
  position: number,
  asrtPattern: number[]
): boolean {
  // In ASRT, pattern positions are even (0, 2, 4, ...)
  // High-frequency triplets have pattern elements at positions 0 and 2
  const pos0IsPattern = (position - 2) % 2 === 0;
  const pos2IsPattern = position % 2 === 0;

  return pos0IsPattern && pos2IsPattern;
}

/**
 * Calculate learning metrics from collected data
 */
export function calculateLearningMetrics(jsPsych: JsPsych): SRTSummaryData {
  const allData = jsPsych.data.get().filter({ task: 'srt', phase: 'trial' });

  const sequentialData = allData.filter({ block_type: 'sequential' });
  const randomData = allData.filter({ block_type: 'random' });

  // Calculate mean RTs
  const mean_rt_sequential =
    sequentialData.count() > 0 ? sequentialData.select('rt').mean() : 0;
  const mean_rt_random = randomData.count() > 0 ? randomData.select('rt').mean() : 0;

  // Calculate RT difference (learning index)
  const rt_difference = mean_rt_random - mean_rt_sequential;

  // Calculate accuracies
  const mean_accuracy_sequential =
    sequentialData.count() > 0
      ? sequentialData.filter({ correct: true }).count() / sequentialData.count()
      : 0;
  const mean_accuracy_random =
    randomData.count() > 0
      ? randomData.filter({ correct: true }).count() / randomData.count()
      : 0;

  return {
    mean_rt_sequential,
    mean_rt_random,
    rt_difference,
    mean_accuracy_sequential,
    mean_accuracy_random,
    total_trials: allData.count(),
  };
}

/**
 * Calculate triplet frequencies for ASRT analysis
 */
export function calculateTripletFrequencies(
  jsPsych: JsPsych
): { high_freq_rt: number; low_freq_rt: number; learning_index: number } {
  const allData = jsPsych.data
    .get()
    .filter({ task: 'srt', phase: 'trial', block_type: 'sequential' });

  const highFreqData = allData.filter({ triplet_frequency: 'high' });
  const lowFreqData = allData.filter({ triplet_frequency: 'low' });

  const high_freq_rt = highFreqData.count() > 0 ? highFreqData.select('rt').mean() : 0;
  const low_freq_rt = lowFreqData.count() > 0 ? lowFreqData.select('rt').mean() : 0;

  const learning_index = low_freq_rt - high_freq_rt;

  return {
    high_freq_rt,
    low_freq_rt,
    learning_index,
  };
}

/**
 * Determine grid dimensions from grid array
 */
export function getGridDimensions(grid: number[][]): { rows: number; cols: number } {
  return {
    rows: grid.length,
    cols: grid[0]?.length ?? 0,
  };
}

/**
 * Convert linear target position to grid coordinates
 */
export function targetToGridCoordinates(
  target: number,
  grid: number[][]
): [number, number] {
  let count = 0;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 1) {
        if (count === target) {
          return [row, col];
        }
        count++;
      }
    }
  }

  return [0, 0]; // Fallback
}

/**
 * Get number of active locations in grid
 */
export function getNumLocations(grid: number[][]): number {
  let count = 0;

  for (const row of grid) {
    for (const cell of row) {
      if (cell === 1) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Determine random block positions based on placement strategy
 */
export function determineRandomBlockPositions(
  totalBlocks: number,
  numRandomBlocks: number,
  placement: 'beginning' | 'middle' | 'end' | 'alternating' | 'sandwich',
  customPositions?: number[]
): number[] {
  if (customPositions && customPositions.length > 0) {
    return customPositions;
  }

  const positions: number[] = [];

  switch (placement) {
    case 'beginning':
      for (let i = 0; i < numRandomBlocks; i++) {
        positions.push(i);
      }
      break;

    case 'end':
      for (let i = 0; i < numRandomBlocks; i++) {
        positions.push(totalBlocks - numRandomBlocks + i);
      }
      break;

    case 'middle':
      const middleStart = Math.floor((totalBlocks - numRandomBlocks) / 2);
      for (let i = 0; i < numRandomBlocks; i++) {
        positions.push(middleStart + i);
      }
      break;

    case 'alternating':
      // Alternate between sequential and random
      const interval = Math.floor(totalBlocks / numRandomBlocks);
      for (let i = 0; i < numRandomBlocks; i++) {
        positions.push(i * interval);
      }
      break;

    case 'sandwich':
      // First block is random, last block is random, middle blocks sequential
      if (numRandomBlocks >= 2) {
        positions.push(0);
        positions.push(totalBlocks - 1);
        // Add remaining random blocks in the middle
        for (let i = 2; i < numRandomBlocks; i++) {
          const middlePos = Math.floor(totalBlocks / 2);
          positions.push(middlePos);
        }
      }
      break;
  }

  return positions.sort((a, b) => a - b);
}
