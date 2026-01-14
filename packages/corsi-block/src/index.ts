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

import "./styles.css";
import { JsPsych, DataCollection } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychCorsiBlocks from '@jspsych-contrib/plugin-corsi-blocks';
import { CorsiBlockConfig } from './types';
import { DEFAULT_CONFIG, DEFAULT_BLOCKS } from './constants';
import { mergeConfig, getSequencesForLength } from './utils';
import { createDisplayTrial, createInputTrial, createStartTrial } from './trials';
import { defaultText, TextConfig } from './text';

// -- CONSTANTS --
const TASK_NAME = 'corsi-block';
const VERSION = '0.1.0';

/**
 * Creates interactive instructions with a practice trial.
 * Users must watch a sequence and tap the blocks correctly to proceed.
 */
function createInteractiveInstructions(jsPsych: JsPsych, config: any, text: TextConfig) {
  const introPage = {
    type: jsPsychHtmlButtonResponse,
    stimulus: text.instruction_intro,
    choices: [text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: 'instructions',
    },
  };

  const watchExplanation = {
    type: jsPsychHtmlButtonResponse,
    stimulus: text.instruction_watch,
    choices: [text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: 'instructions',
    },
  };

  const tapExplanation = {
    type: jsPsychHtmlButtonResponse,
    stimulus: text.instruction_tap,
    choices: [text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: 'instructions',
    },
  };

  // Practice sequence - 2 blocks
  const practiceSequence = [0, 3]; // Use blocks at indices 0 and 3

  const practiceWatchPrompt = {
    type: jsPsychHtmlButtonResponse,
    stimulus: text.instruction_try_watch,
    choices: [text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: 'instructions',
    },
  };

  const practiceDisplay = {
    type: jsPsychCorsiBlocks,
    mode: 'display',
    sequence: practiceSequence,
    blocks: config.blocks || DEFAULT_BLOCKS,
    sequence_block_duration: config.stimulus_duration,
    sequence_gap_duration: config.inter_stimulus_interval,
    pre_stim_duration: 500,
    inter_trial_delay: 0,
    block_color: config.block_colors.inactive,
    highlight_color: config.block_colors.active,
    background_color: config.background_color,
    display_width: config.display_width,
    display_height: config.display_height,
    block_size: config.block_size,
    prompt: text.display_prompt,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: 'instructions-practice',
    },
  };

  const practiceTapPrompt = {
    type: jsPsychHtmlButtonResponse,
    stimulus: text.instruction_try_tap,
    choices: [text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: 'instructions',
    },
  };

  const practiceInput = {
    type: jsPsychCorsiBlocks,
    mode: 'input',
    sequence: practiceSequence,
    blocks: config.blocks || DEFAULT_BLOCKS,
    post_sequence_delay: config.post_sequence_delay,
    inter_trial_delay: 0,
    response_timeout: null, // No timeout for practice
    response_animation_duration: config.click_feedback_duration,
    block_color: config.block_colors.inactive,
    highlight_color: config.block_colors.active,
    correct_color: config.block_colors.correct || '#00ff00',
    incorrect_color: config.block_colors.incorrect || '#ff0000',
    background_color: config.background_color,
    display_width: config.display_width,
    display_height: config.display_height,
    block_size: config.block_size,
    prompt: text.input_prompt,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: 'instructions-practice',
    },
  };

  const practiceFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().filter({ phase: 'instructions-practice' }).last(1).values()[0];
      if (lastTrial && lastTrial.correct) {
        return `<div class="feedback correct"><p>${text.instruction_success}</p></div>`;
      }
      return `<div class="feedback incorrect"><p>${text.instruction_failure}</p></div>`;
    },
    choices: [text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: 'instructions',
    },
  };

  // Create a looping practice that retries if incorrect
  const practiceLoop = {
    timeline: [practiceWatchPrompt, practiceDisplay, practiceTapPrompt, practiceInput, practiceFeedback],
    loop_function: () => {
      const lastInputTrial = jsPsych.data.get().filter({ phase: 'instructions-practice', task: TASK_NAME }).last(1).values()[0];
      // Continue looping if incorrect
      return lastInputTrial && !lastInputTrial.correct;
    },
  };

  return {
    timeline: [introPage, watchExplanation, tapExplanation, practiceLoop],
  };
}

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
  const text = { ...defaultText, ...config.text };

  // Main timeline
  const timeline: any[] = [];

  // Add interactive instructions at the beginning
  timeline.push(createInteractiveInstructions(jsPsych, fullConfig, text));

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
        data_labels: { task_version: VERSION, ...config.data_labels }
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
        data_labels: { task_version: VERSION, ...config.data_labels }
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

  return {
    timeline
  };
}

// -- SCORING FUNCTIONS --

interface ScoringResult {
  span: number | null;
  totalTrials: number;
  correctTrials: number;
  accuracy: number;
  maxLengthAttempted: number;
}

/**
 * Calculate scoring metrics from Corsi Block data
 */
function calculateScores(data: DataCollection): ScoringResult {
  const inputTrials = data
    .filter({ task: TASK_NAME, phase: 'input' })
    .values() as any[];

  if (inputTrials.length === 0) {
    return {
      span: null,
      totalTrials: 0,
      correctTrials: 0,
      accuracy: 0,
      maxLengthAttempted: 0,
    };
  }

  const correctTrials = inputTrials.filter((t) => t.correct);
  const totalTrials = inputTrials.length;
  const accuracy = correctTrials.length / totalTrials;
  const maxLengthAttempted = Math.max(...inputTrials.map((t) => t.sequence_length));

  // Get span from data (set by the task on completion)
  const allData = data.values();
  const span = allData.length > 0 && allData[0].corsi_span ? allData[0].corsi_span : null;

  return {
    span,
    totalTrials,
    correctTrials: correctTrials.length,
    accuracy,
    maxLengthAttempted,
  };
}

/**
 * Get summary of Corsi Block performance
 */
function getSummary(data: DataCollection): ScoringResult & { taskName: string; version: string } {
  const scores = calculateScores(data);
  return {
    ...scores,
    taskName: TASK_NAME,
    version: VERSION,
  };
}

/**
 * Timeline units for custom experiment building
 */
export const timelineUnits = {
  createDisplayTrial,
  createInputTrial,
  createStartTrial,
  createInteractiveInstructions,
};

/**
 * Utility functions
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  trials: {
    createDisplayTrial,
    createInputTrial,
    createStartTrial,
  },
  constants: {
    TASK_NAME,
    VERSION,
    DEFAULT_CONFIG,
  },
  text: defaultText,
};

// Re-export types for TypeScript users
export type { CorsiBlockConfig } from './types';
export type { TextConfig } from './text';
