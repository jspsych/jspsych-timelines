/**
 * Arrow Flanker Task - Utility Functions
 *
 * Helper functions for timeline generation and configuration
 */

import { JsPsych } from 'jspsych';
import {
  CongruencyType,
  Direction,
  FlankerTrialVariable,
  CongruencyRatio,
  SOAConfig,
  RepetitionControl
} from './types';

/**
 * Generate timeline variables for a block of trials
 *
 * @param jsPsych - JsPsych instance for randomization
 * @param options - Configuration options
 * @returns Array of timeline variables
 */
export function generateTrialVariables(
  jsPsych: JsPsych,
  options: {
    num_trials: number;
    congruency_ratio: CongruencyRatio;
    include_neutral: boolean;
    soa_config?: SOAConfig;
    track_sequence_effects?: boolean;
    control_repetitions?: RepetitionControl;
    block_number?: number;
  }
): FlankerTrialVariable[] {
  const {
    num_trials,
    congruency_ratio,
    include_neutral,
    soa_config,
    track_sequence_effects = false,
    control_repetitions,
    block_number = 1
  } = options;

  // Calculate trial counts based on ratios
  const trialCounts = calculateTrialCounts(num_trials, congruency_ratio, include_neutral);

  // Generate base trial pool
  const trials: FlankerTrialVariable[] = [];

  // Congruent trials
  for (let i = 0; i < trialCounts.congruent; i++) {
    const direction: Direction = i % 2 === 0 ? 'left' : 'right';
    trials.push({
      direction,
      congruency: 'congruent',
      block_number
    });
  }

  // Incongruent trials
  for (let i = 0; i < trialCounts.incongruent; i++) {
    const direction: Direction = i % 2 === 0 ? 'left' : 'right';
    trials.push({
      direction,
      congruency: 'incongruent',
      block_number
    });
  }

  // Neutral trials
  if (include_neutral && trialCounts.neutral > 0) {
    for (let i = 0; i < trialCounts.neutral; i++) {
      const direction: Direction = i % 2 === 0 ? 'left' : 'right';
      trials.push({
        direction,
        congruency: 'neutral',
        block_number
      });
    }
  }

  // Shuffle trials
  let shuffledTrials = jsPsych.randomization.shuffle(trials);

  // Apply repetition controls if specified
  if (control_repetitions) {
    shuffledTrials = applyRepetitionControl(jsPsych, shuffledTrials, control_repetitions);
  }

  // Assign SOA values
  if (soa_config !== undefined) {
    shuffledTrials = assignSOAValues(jsPsych, shuffledTrials, soa_config);
  }

  // Add trial numbers
  shuffledTrials.forEach((trial, index) => {
    trial.trial_number = index + 1;
  });

  return shuffledTrials;
}

/**
 * Calculate trial counts based on congruency ratios
 */
function calculateTrialCounts(
  num_trials: number,
  ratio: CongruencyRatio,
  include_neutral: boolean
): { congruent: number; incongruent: number; neutral: number } {
  const total_weight =
    ratio.congruent + ratio.incongruent + (include_neutral ? ratio.neutral || 0 : 0);

  const congruent = Math.round((ratio.congruent / total_weight) * num_trials);
  const incongruent = Math.round((ratio.incongruent / total_weight) * num_trials);
  const neutral = include_neutral && ratio.neutral
    ? num_trials - congruent - incongruent
    : 0;

  return { congruent, incongruent, neutral };
}

/**
 * Assign SOA values to trials
 */
function assignSOAValues(
  jsPsych: JsPsych,
  trials: FlankerTrialVariable[],
  soa_config: SOAConfig
): FlankerTrialVariable[] {
  if (typeof soa_config === 'number') {
    // Fixed SOA
    return trials.map(trial => ({ ...trial, soa: soa_config }));
  } else if (Array.isArray(soa_config)) {
    // Sample from array
    return trials.map(trial => ({
      ...trial,
      soa: jsPsych.randomization.sampleWithReplacement(soa_config, 1)[0]
    }));
  } else {
    // Random range
    return trials.map(trial => ({
      ...trial,
      soa: Math.floor(Math.random() * (soa_config.max - soa_config.min + 1)) + soa_config.min
    }));
  }
}

/**
 * Apply repetition control to trial sequence
 *
 * This is a simplified implementation - can be extended for more sophisticated control
 */
function applyRepetitionControl(
  jsPsych: JsPsych,
  trials: FlankerTrialVariable[],
  control: RepetitionControl
): FlankerTrialVariable[] {
  // For now, just shuffle - more sophisticated algorithms can be implemented
  // to avoid/ensure specific repetition patterns
  return jsPsych.randomization.shuffle(trials);
}

/**
 * Sample SOA value based on configuration
 *
 * @param jsPsych - JsPsych instance
 * @param soa_config - SOA configuration
 * @returns Sampled SOA value in milliseconds
 */
export function sampleSOA(jsPsych: JsPsych, soa_config: SOAConfig): number {
  if (typeof soa_config === 'number') {
    return soa_config;
  } else if (Array.isArray(soa_config)) {
    return jsPsych.randomization.sampleWithReplacement(soa_config, 1)[0];
  } else {
    return Math.floor(Math.random() * (soa_config.max - soa_config.min + 1)) + soa_config.min;
  }
}

/**
 * Merge user configuration with defaults
 *
 * @param userConfig - User-provided configuration
 * @param defaults - Default configuration
 * @returns Merged configuration
 */
export function mergeConfig<T extends Record<string, any>>(
  userConfig: Partial<T>,
  defaults: T
): T {
  return { ...defaults, ...userConfig };
}

