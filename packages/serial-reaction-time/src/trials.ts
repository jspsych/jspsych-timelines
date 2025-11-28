/**
 * Serial Reaction Time Task - Trial Creation Functions
 *
 * Functions for creating different trial types in the SRT paradigm
 */

import { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychSurveyText from '@jspsych/plugin-survey-text';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import type { TrialText } from './text';

/**
 * Create instruction trial
 */
export function createInstructionTrial(
  text: string,
  continueKey: string = 'ANY'
): any {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: text,
    choices: continueKey,
  };
}

/**
 * Create block transition/break trial
 */
export function createBlockTransitionTrial(
  text: TrialText,
  currentBlock: number,
  totalBlocks: number,
  showProgress: boolean
): any {
  let stimulus = text.block_transition;

  if (showProgress) {
    const progressText = text.progress_message
      .replace('{current}', currentBlock.toString())
      .replace('{total}', totalBlocks.toString());
    stimulus = stimulus.replace('</div>', progressText + '</div>');
  }

  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus,
    choices: 'ALL_KEYS',
  };
}

/**
 * Create SRT trial (delegates to keyboard or mouse plugin based on modality)
 */
export function createSRTTrial(
  jsPsych: JsPsych,
  options: {
    grid: number[][];
    grid_square_size: number;
    target_color: string;
    fade_duration: number | null;
    pre_target_duration: number;
    trial_duration: number | null;
    show_response_feedback: boolean;
    feedback_duration: number;
    choices?: string[][];
    allow_nontarget_responses?: boolean;
    prompt: string | null;
    response_modality: 'keyboard' | 'mouse';
    data: any;
  }
): any {
  const baseTrial = {
    grid: options.grid,
    grid_square_size: options.grid_square_size,
    target: () => jsPsych.timelineVariable('target'),
    target_color: options.target_color,
    fade_duration: options.fade_duration,
    pre_target_duration: options.pre_target_duration,
    trial_duration: options.trial_duration,
    prompt: options.prompt,
    data: options.data,
  };

  if (options.response_modality === 'keyboard') {
    return {
      ...baseTrial,
      type: 'jsPsychSerialReactionTime',
      choices: options.choices,
      response_ends_trial: true,
      show_response_feedback: options.show_response_feedback,
      feedback_duration: options.feedback_duration,
    };
  } else {
    return {
      ...baseTrial,
      type: 'jsPsychSerialReactionTimeMouse',
      response_ends_trial: true,
      allow_nontarget_responses: options.allow_nontarget_responses ?? false,
    };
  }
}

/**
 * Create RSI delay trial (blank interval between response and next stimulus)
 */
export function createRSITrial(rsi: number): any {
  if (rsi === 0) {
    return null; // No delay
  }

  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '',
    choices: 'NO_KEYS',
    trial_duration: rsi,
  };
}

/**
 * Create dual-task tone counting prompt trial
 */
export function createToneCountingTrial(text: TrialText): any {
  return {
    type: jsPsychSurveyText,
    questions: [
      {
        prompt: text.tone_counting_prompt,
        name: 'tone_count',
        required: true,
      },
    ],
    data: {
      task: 'srt',
      phase: 'tone-counting',
    },
  };
}

/**
 * Create free recall awareness trial
 */
export function createFreeRecallTrial(text: TrialText): any {
  return {
    type: jsPsychSurveyText,
    preamble: text.free_recall_instructions,
    questions: [
      {
        prompt: 'Describe any patterns you noticed:',
        name: 'free_recall',
        rows: 5,
        columns: 60,
      },
    ],
    data: {
      task: 'srt',
      phase: 'awareness-free-recall',
    },
  };
}

/**
 * Create recognition test trial
 */
export function createRecognitionTrial(
  jsPsych: JsPsych,
  fragment: number[],
  isOld: boolean
): any {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div style="max-width: 600px; margin: auto;">
        <p>Sequence: <strong>${fragment.join(' - ')}</strong></p>
        <p>Did this sequence appear in the task?</p>
      </div>
    `,
    choices: ['Old', 'New'],
    data: {
      task: 'srt',
      phase: 'awareness-recognition',
      fragment: fragment,
      is_old: isOld,
      correct_response: isOld ? 0 : 1,
    },
    on_finish: (data: any) => {
      data.correct = data.response === data.correct_response;
    },
  };
}

/**
 * Create generation trial (for Process Dissociation Procedure)
 */
export function createGenerationTrial(
  jsPsych: JsPsych,
  condition: 'inclusion' | 'exclusion',
  text: TrialText,
  numTrials: number,
  grid: number[][],
  grid_square_size: number,
  choices: string[][]
): any {
  const instructions =
    condition === 'inclusion'
      ? text.generation_inclusion_instructions
      : text.generation_exclusion_instructions;

  return {
    timeline: [
      // Instructions
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: instructions,
        choices: 'ALL_KEYS',
      },
      // Generation trials
      {
        timeline: [
          {
            type: 'jsPsychSerialReactionTime',
            grid: grid,
            grid_square_size: grid_square_size,
            target: () => jsPsych.timelineVariable('target'),
            choices: choices,
            show_response_feedback: false,
            pre_target_duration: 0,
            trial_duration: null,
            response_ends_trial: true,
            data: {
              task: 'srt',
              phase: `awareness-generation-${condition}`,
              trial_number: () => jsPsych.timelineVariable('trial_number'),
            },
          },
        ],
        timeline_variables: Array.from({ length: numTrials }, (_, i) => ({
          target: null, // Will be filled by participant's free generation
          trial_number: i,
        })),
      },
    ],
  };
}

/**
 * Create prediction trial
 */
export function createPredictionTrial(
  jsPsych: JsPsych,
  sequence: number[],
  grid: number[][],
  grid_square_size: number,
  choices: string[][]
): any {
  return {
    type: 'jsPsychSerialReactionTime',
    grid: grid,
    grid_square_size: grid_square_size,
    target: () => jsPsych.timelineVariable('target'),
    choices: choices,
    show_response_feedback: true,
    feedback_duration: 500,
    pre_target_duration: 1000, // Show grid, then participant predicts
    trial_duration: null,
    response_ends_trial: true,
    data: {
      task: 'srt',
      phase: 'awareness-prediction',
    },
  };
}

/**
 * Create results/feedback trial
 */
export function createResultsTrial(
  text: TrialText,
  summaryData?: {
    mean_rt_sequential: number;
    mean_rt_random: number;
    rt_difference: number;
  }
): any {
  let stimulus = text.feedback_message;

  if (summaryData) {
    stimulus += `
      <div style="max-width: 600px; margin: auto; text-align: left;">
        <h3>Performance Summary</h3>
        <p><strong>Sequential blocks:</strong> ${Math.round(summaryData.mean_rt_sequential)} ms average RT</p>
        <p><strong>Random blocks:</strong> ${Math.round(summaryData.mean_rt_random)} ms average RT</p>
        <p><strong>Learning effect:</strong> ${Math.round(summaryData.rt_difference)} ms faster for sequential</p>
      </div>
    `;
  }

  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus,
    choices: 'ALL_KEYS',
  };
}

/**
 * Play tone (for dual-task condition)
 */
export function playTone(
  audioContext: AudioContext,
  frequency: number,
  duration: number
): void {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration / 1000
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
}
