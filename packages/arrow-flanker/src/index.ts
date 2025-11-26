/**
 * Arrow Flanker Task for jsPsych
 *
 * A comprehensive implementation of the Eriksen Flanker Task using arrow stimuli.
 * Supports extensive parameterization for research applications including:
 * - Temporal manipulation (SOA)
 * - Spatial configuration
 * - Congruency ratio control
 * - Sequential effects tracking
 * - Multiple block designs
 *
 * @module @jspsych-timelines/arrow-flanker
 */

import { JsPsych } from 'jspsych';
import { ArrowFlankerConfig } from './types';
import { DEFAULT_CONFIG, DEFAULT_RESPONSE_KEYS } from './constants';
import { generateTrialVariables, mergeConfig } from './utils';
import {
  createFixationTrial,
  createFlankerTrial,
  createITITrial,
  createBlockBreak
} from './trials';

/**
 * Create a complete Arrow Flanker Task timeline
 *
 * @param jsPsych - JsPsych instance
 * @param config - Configuration options (optional)
 * @returns Timeline object ready for jsPsych.run()
 *
 * @example
 * // Basic usage (backward compatible)
 * const timeline = createTimeline(jsPsych, {
 *   fixation_duration: 500,
 *   num_trials: 12
 * });
 *
 * @example
 * // Advanced usage with SOA and congruency manipulation
 * const timeline = createTimeline(jsPsych, {
 *   soa: [-200, 0, 200],
 *   stimulus_duration: 100,
 *   congruency_ratio: { congruent: 25, incongruent: 75 },
 *   track_sequence_effects: true,
 *   num_blocks: 4,
 *   num_trials: 48
 * });
 */
export function createTimeline(
  jsPsych: JsPsych,
  config: ArrowFlankerConfig = {}
): any {
  // Handle backward compatibility with 'n' parameter
  if (config.n !== undefined && config.num_trials === undefined) {
    config.num_trials = config.n;
  }

  // Merge with defaults
  const fullConfig = mergeConfig(config, DEFAULT_CONFIG);

  // Setup response keys
  const response_keys = config.response_keys || DEFAULT_RESPONSE_KEYS;

  // Create main timeline
  const timeline: any[] = [];

  // Generate blocks
  for (let block = 1; block <= fullConfig.num_blocks; block++) {
    // Generate trial variables for this block
    const trial_variables = generateTrialVariables(jsPsych, {
      num_trials: fullConfig.num_trials,
      congruency_ratio: fullConfig.congruency_ratio,
      include_neutral: fullConfig.include_neutral,
      soa_config: config.soa,
      track_sequence_effects: fullConfig.track_sequence_effects,
      control_repetitions: config.control_repetitions,
      block_number: block
    });

    // Create trial sequence: fixation -> stimulus -> ITI
    const trial_sequence: any[] = [];

    // Fixation
    trial_sequence.push(
      createFixationTrial({
        duration: fullConfig.fixation_duration,
        fixation_size: fullConfig.fixation_size,
        container_height: fullConfig.stimulus_container_height
      })
    );

    // Flanker stimulus
    trial_sequence.push(
      createFlankerTrial(jsPsych, {
        response_keys,
        response_timeout: fullConfig.response_timeout,
        stimulus_duration: fullConfig.stimulus_duration,
        response_mode: fullConfig.response_mode === 'keyboard' ? 'keyboard' : 'buttons',
        data_labels: config.data_labels,
        num_flankers: fullConfig.num_flankers,
        flanker_arrangement: fullConfig.flanker_arrangement,
        stimulus_size: fullConfig.stimulus_size,
        target_flanker_separation: fullConfig.target_flanker_separation,
        container_height: fullConfig.stimulus_container_height
      })
    );

    // ITI
    const iti_trial = createITITrial({
      duration: fullConfig.iti_duration,
      container_height: fullConfig.stimulus_container_height
    });
    if (iti_trial !== null) {
      trial_sequence.push(iti_trial);
    }

    // Create block procedure
    const block_procedure = {
      timeline: trial_sequence,
      timeline_variables: trial_variables,
      randomize_order: fullConfig.block_design === 'mixed'
    };

    timeline.push(block_procedure);

    // Add block break between blocks (except after last block)
    if (block < fullConfig.num_blocks) {
      timeline.push(
        createBlockBreak({
          block_number: block,
          total_blocks: fullConfig.num_blocks,
          duration: fullConfig.block_break_duration
        })
      );
    }
  }

  return {
    timeline
  };
}

/**
 * Exported trial components for advanced customization
 */
export const timelineUnits = {
  createFixationTrial,
  createFlankerTrial,
  createITITrial,
  createBlockBreak
};

/**
 * Exported utilities for advanced usage
 */
export { generateTrialVariables, mergeConfig } from './utils';
export * from './types';
export * from './constants';
