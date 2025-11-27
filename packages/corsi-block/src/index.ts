/**
 * Corsi Block Task for jsPsych
 *
 * A comprehensive implementation of the Corsi Block Tapping Task.
 * Supports extensive parameterization for research applications including:
 * - Temporal manipulation (stimulus duration, ISI, delays)
 * - Visual configuration (colors, sizes)
 * - Algorithm control (starting length, stop rules, sequence generation)
 * - Multiple input modalities
 *
 * @module @jspsych-timelines/corsi-block
 */

import { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { CorsiBlockConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import { mergeConfig, getSequencesForLength } from './utils';
import { createDisplayTrial, createInputTrial, createStartTrial } from './trials';
import { trial_text } from './text';

/**
 * Create a complete Corsi Block Task timeline
 *
 * @param jsPsych - JsPsych instance
 * @param config - Configuration options (optional)
 * @returns Timeline object ready for jsPsych.run()
 *
 * @example
 * // Basic usage with defaults
 * const timeline = createTimeline(jsPsych);
 *
 * @example
 * // Custom configuration
 * const timeline = createTimeline(jsPsych, {
 *   starting_length: 3,
 *   trials_per_length: 3,
 *   max_length: 8,
 *   stimulus_duration: 750,
 *   block_colors: {
 *     inactive: '#555555',
 *     active: '#ff0000'
 *   }
 * });
 */
export function createTimeline(
  jsPsych: JsPsych,
  config: CorsiBlockConfig = {}
): any {
  // Merge with defaults
  const fullConfig = mergeConfig(config, DEFAULT_CONFIG);

  // Merge text configuration
  const text = { ...trial_text, ...config.text_object };

  // Main timeline
  const timeline: any[] = [];

  // Generate all trials for all lengths upfront
  for (let length = fullConfig.starting_length; length <= fullConfig.max_length; length++) {
    // Generate sequences for this length
    const sequences = getSequencesForLength(
      jsPsych,
      length,
      fullConfig.trials_per_length,
      fullConfig.blocks.length,
      fullConfig.sequence_generation,
      fullConfig.allow_repeats
    );

    // Create timeline variables for this length
    const trial_variables = sequences.map((sequence, index) => ({
      sequence,
      sequence_length: length,
      trial_index: index
    }));

    // Build trial sequence
    const trialSequence: any[] = [];

    // Display trial
    trialSequence.push(
      createDisplayTrial(jsPsych, {
        blocks: fullConfig.blocks,
        stimulus_duration: fullConfig.stimulus_duration,
        inter_stimulus_interval: fullConfig.inter_stimulus_interval,
        pre_stim_duration: 500,
        inter_trial_delay: 0,
        block_colors: {
          inactive: fullConfig.block_colors.inactive,
          active: fullConfig.block_colors.active
        },
        background_color: fullConfig.background_color,
        display_width: fullConfig.display_width,
        display_height: fullConfig.display_height,
        block_size: fullConfig.block_size,
        prompt: text.display_prompt,
        data_labels: config.data_labels
      })
    );

    // Input trial
    trialSequence.push(
      createInputTrial(jsPsych, {
        blocks: fullConfig.blocks,
        post_sequence_delay: fullConfig.post_sequence_delay,
        inter_trial_delay: fullConfig.inter_trial_delay,
        response_timeout: fullConfig.response_timeout,
        click_feedback_duration: fullConfig.click_feedback_duration,
        block_colors: {
          inactive: fullConfig.block_colors.inactive,
          active: fullConfig.block_colors.active,
          correct: fullConfig.block_colors.correct || '#00ff00',
          incorrect: fullConfig.block_colors.incorrect || '#ff0000'
        },
        background_color: fullConfig.background_color,
        display_width: fullConfig.display_width,
        display_height: fullConfig.display_height,
        block_size: fullConfig.block_size,
        prompt: text.input_prompt,
        data_labels: config.data_labels
      })
    );

    // Create conditional timeline for this length
    const lengthNode = {
      timeline: [{
        timeline: trialSequence,
        timeline_variables: trial_variables
      }],
      conditional_function: () => {
        // Always run the first length
        if (length === fullConfig.starting_length) {
          return true;
        }

        // Check performance at previous length
        const previousLength = length - 1;
        const previousTrials = jsPsych.data.get().filter({
          task: 'corsi-block',
          phase: 'input',
          sequence_length: previousLength
        });

        // If no previous trials, skip this length
        if (previousTrials.count() === 0) {
          return false;
        }

        // Count failures at previous length
        const failures = previousTrials.filter({ correct: false }).count();

        // Stop rule: both-trials
        if (fullConfig.stop_rule === 'both-trials') {
          // Continue if not all trials failed
          if (failures < fullConfig.trials_per_length) {
            return true;
          } else {
            // Failed all trials - calculate span and stop
            const span = previousLength;
            jsPsych.data.addProperties({ corsi_span: span });
            return false;
          }
        }

        // Stop rule: consecutive-errors
        if (fullConfig.stop_rule === 'consecutive-errors') {
          // Count recent consecutive errors
          const recentTrials = jsPsych.data.get().filter({
            task: 'corsi-block',
            phase: 'input'
          }).last(fullConfig.consecutive_errors_threshold);

          if (recentTrials.count() >= fullConfig.consecutive_errors_threshold) {
            const allFailed = recentTrials.filter({ correct: false }).count() === fullConfig.consecutive_errors_threshold;
            if (allFailed) {
              const span = previousLength;
              jsPsych.data.addProperties({ corsi_span: span });
              return false;
            }
          }
        }

        return true;
      }
    };

    timeline.push(lengthNode);
  }

  // Add final span calculation if reached max length
  timeline.push({
    timeline: [{
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '',
      trial_duration: 0,
      on_start: () => {
        // Check if span was already set (by failure)
        const data = jsPsych.data.get().values()[0];
        if (!data.corsi_span) {
          // Reached max length successfully
          jsPsych.data.addProperties({ corsi_span: fullConfig.max_length });
        }
      }
    }]
  });

  // Prepend start instruction if using button initiation
  if (fullConfig.sequence_initiation === 'button') {
    timeline.unshift(createStartTrial(text));
  }

  return {
    timeline
  };
}

/**
 * Exported utilities for advanced customization
 */
export const utils = {
  createDisplayTrial,
  createInputTrial,
  createStartTrial
};

// Re-export types for TypeScript users
export type { CorsiBlockConfig } from './types';
