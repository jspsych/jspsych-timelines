/**
 * Arrow Flanker Task - Trial Components
 *
 * Functions for creating individual trial components
 */

import { JsPsych } from 'jspsych';
import jsPsychFlanker from '@jspsych-contrib/plugin-flanker';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { createFixation as createFixationStimulus, createBlank } from './stimuli';
import { ResponseKeys } from './types';
import type { TrialText } from './text';

/**
 * Create a fixation trial
 *
 * @param options - Configuration options
 * @returns jsPsych trial object
 */
export function createFixationTrial(options: {
  duration: number;
  fixation_size?: string;
  container_height?: string;
}) {
  const { duration, fixation_size, container_height } = options;

  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: createFixationStimulus({ size: fixation_size, container_height }),
    choices: 'NO_KEYS',
    trial_duration: duration,
    data: {
      task: 'flanker',
      phase: 'fixation'
    }
  };
}

/**
 * Create a flanker trial using the plugin-flanker
 *
 * @param jsPsych - JsPsych instance
 * @param options - Configuration options
 * @returns jsPsych trial object
 */
export function createFlankerTrial(
  jsPsych: JsPsych,
  options: {
    response_keys: ResponseKeys;
    response_timeout: number;
    stimulus_duration?: number | null;
    response_mode?: 'keyboard' | 'buttons';
    button_label_left?: string;
    button_label_right?: string;
    has_soa?: boolean; // Whether timeline variables include SOA
    data_labels?: any;
    num_flankers?: 4 | 6;
    flanker_arrangement?: 'horizontal' | 'vertical';
    stimulus_size?: string;
    target_flanker_separation?: string;
    container_height?: string;
  }
) {
  const {
    response_keys,
    response_timeout,
    stimulus_duration,
    response_mode = 'keyboard',
    button_label_left,
    button_label_right,
    has_soa = false,
    data_labels = {},
    num_flankers,
    flanker_arrangement,
    stimulus_size,
    target_flanker_separation,
    container_height
  } = options;

  return {
    type: jsPsychFlanker,
    target_direction: () => jsPsych.timelineVariable('direction'),
    congruency: () => jsPsych.timelineVariable('congruency'),
    soa: has_soa ? () => jsPsych.timelineVariable('soa') : 0,
    response_timeout,
    stimulus_duration: stimulus_duration !== undefined ? stimulus_duration : null,
    response_mode,
    response_keys_left: response_keys.left,
    response_keys_right: response_keys.right,
    button_label_left,
    button_label_right,
    num_flankers,
    flanker_arrangement,
    stimulus_size,
    target_flanker_separation,
    container_height,
    data: {
      task: 'flanker',
      phase: 'response',
      block_number: () => jsPsych.timelineVariable('block_number'),
      trial_number: () => jsPsych.timelineVariable('trial_number'),
      ...(has_soa ? { soa: () => jsPsych.timelineVariable('soa') } : {}),
      ...data_labels
    },
    on_finish: (data: any) => {
      // Record sequential effects by looking at previous trial data
      const previousTrials = jsPsych.data.get().filter({ task: 'flanker', phase: 'response' });
      if (previousTrials.count() > 0) {
        const lastTrial = previousTrials.last(1).values()[0];
        data.previous_congruency = lastTrial.congruency;
        data.previous_correct = lastTrial.correct;
      }
    }
  };
}

/**
 * Create an ITI (inter-trial interval) blank screen
 *
 * @param options - Configuration options
 * @returns jsPsych trial object
 */
export function createITITrial(options: {
  duration: number;
  container_height?: string;
}) {
  const { duration, container_height } = options;

  if (duration === 0) {
    return null; // Skip ITI if duration is 0
  }

  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: createBlank({ container_height }),
    choices: 'NO_KEYS',
    trial_duration: duration,
    data: {
      task: 'flanker',
      phase: 'iti'
    }
  };
}

/**
 * Create a block break screen
 *
 * @param options - Configuration options
 * @returns jsPsych trial object
 */
export function createBlockBreak(options: {
  block_number: number;
  total_blocks: number;
  duration?: number | null;
  text: TrialText;
}) {
  const { block_number, total_blocks, duration = null, text } = options;

  const message = text.block_break(block_number, total_blocks, duration);

  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div style="font-size: 20px; text-align: center;"><p>${message}</p></div>`,
    choices: duration === null ? 'ALL_KEYS' : 'NO_KEYS',
    trial_duration: duration,
    data: {
      task: 'flanker',
      phase: 'block_break',
      block_number
    }
  };
}

