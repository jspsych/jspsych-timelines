/**
 * Corsi Block Task - Trial Components
 *
 * Functions for creating individual trial components
 */

import { JsPsych } from 'jspsych';
import jsPsychCorsiBlocks from '@jspsych-contrib/plugin-corsi-blocks';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import type { TrialText } from './text';
import type { BlockPosition } from './types';

/**
 * Create a display trial (show sequence)
 */
export function createDisplayTrial(jsPsych: JsPsych, options: {
  blocks: BlockPosition[];
  stimulus_duration: number;
  inter_stimulus_interval: number;
  pre_stim_duration: number;
  inter_trial_delay: number;
  block_colors: {
    inactive: string;
    active: string;
  };
  background_color: string;
  display_width: string;
  display_height: string;
  block_size: number;
  prompt?: string;
  data_labels?: any;
}) {
  return {
    type: jsPsychCorsiBlocks,
    mode: 'display',
    sequence: () => jsPsych.timelineVariable('sequence'),
    blocks: options.blocks,
    sequence_block_duration: options.stimulus_duration,
    sequence_gap_duration: options.inter_stimulus_interval,
    pre_stim_duration: options.pre_stim_duration,
    inter_trial_delay: options.inter_trial_delay,
    block_color: options.block_colors.inactive,
    highlight_color: options.block_colors.active,
    background_color: options.background_color,
    display_width: options.display_width,
    display_height: options.display_height,
    block_size: options.block_size,
    prompt: options.prompt,
    data: {
      task: 'corsi-block',
      phase: 'display',
      sequence_length: () => jsPsych.timelineVariable('sequence_length'),
      trial_index: () => jsPsych.timelineVariable('trial_index'),
      ...options.data_labels
    }
  };
}

/**
 * Create an input trial (collect response)
 */
export function createInputTrial(jsPsych: JsPsych, options: {
  blocks: BlockPosition[];
  post_sequence_delay: number;
  inter_trial_delay: number;
  response_timeout: number | null;
  click_feedback_duration: number;
  block_colors: {
    inactive: string;
    active: string;
    correct: string;
    incorrect: string;
  };
  background_color: string;
  display_width: string;
  display_height: string;
  block_size: number;
  prompt?: string;
  data_labels?: any;
}) {
  return {
    type: jsPsychCorsiBlocks,
    mode: 'input',
    sequence: () => jsPsych.timelineVariable('sequence'),
    blocks: options.blocks,
    post_sequence_delay: options.post_sequence_delay,
    inter_trial_delay: options.inter_trial_delay,
    response_timeout: options.response_timeout,
    response_animation_duration: options.click_feedback_duration,
    block_color: options.block_colors.inactive,
    highlight_color: options.block_colors.active,
    correct_color: options.block_colors.correct,
    incorrect_color: options.block_colors.incorrect,
    background_color: options.background_color,
    display_width: options.display_width,
    display_height: options.display_height,
    block_size: options.block_size,
    prompt: options.prompt,
    data: {
      task: 'corsi-block',
      phase: 'input',
      sequence_length: () => jsPsych.timelineVariable('sequence_length'),
      trial_index: () => jsPsych.timelineVariable('trial_index'),
      ...options.data_labels
    }
  };
}

/**
 * Create a start button trial
 */
export function createStartTrial(text: TrialText) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div style="font-size: 20px; text-align: center;">
      <p>${text.display_prompt}</p>
      <p style="font-size: 16px; margin-top: 20px;">Press any key when ready</p>
    </div>`,
    choices: 'ALL_KEYS',
    data: {
      task: 'corsi-block',
      phase: 'instruction'
    }
  };
}

/**
 * Create a break between levels
 */
export function createLevelBreak(options: {
  current_length: number;
  text?: string;
}) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div style="font-size: 20px; text-align: center;">
      <p>${options.text || `Level ${options.current_length - 1} complete`}</p>
      <p style="font-size: 16px; margin-top: 20px;">Press any key to continue</p>
    </div>`,
    choices: 'ALL_KEYS',
    data: {
      task: 'corsi-block',
      phase: 'break',
      previous_length: options.current_length - 1
    }
  };
}
