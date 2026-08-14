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

import jsPsychCorsiBlocks from "@jspsych-contrib/plugin-corsi-blocks";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { DataCollection, JsPsych } from "jspsych";

import { CSS_ROOT_CLASS, DEFAULT_BLOCKS, DEFAULT_CONFIG } from "./constants";
import { TextConfig, defaultText } from "./text";
import { createDisplayTrial, createInputTrial, createStartTrial } from "./trials";
import { CorsiBlockConfig } from "./types";
import { getSequencesForLength, mergeConfig, validateConfig } from "./utils";

// -- CONSTANTS --
const TASK_NAME = "corsi-block";
const VERSION = "0.1.0";

/**
 * Creates interactive instructions with a practice trial.
 *
 * The practice repeats until the participant reproduces the sequence, or until
 * `max_practice_attempts` is reached. Without that cap a participant who cannot
 * do the task is stuck before the experiment starts, with no way forward.
 */
function createInteractiveInstructions(jsPsych: JsPsych, config: any, text: TextConfig) {
  const maxAttempts: number | null = config.max_practice_attempts;
  let practiceAttempt = 1;

  /** The practice response just given, if there is one. */
  const lastPracticeResponse = () =>
    jsPsych.data
      .get()
      .filter({ task: TASK_NAME, phase: "practice", part: "instruction" })
      .last(1)
      .values()[0];

  const attemptsRemain = () => maxAttempts === null || practiceAttempt < maxAttempts;

  const introPage = {
    type: jsPsychHtmlButtonResponse,
    stimulus: text.instruction_intro,
    choices: [text.continue_button],
    css_classes: [CSS_ROOT_CLASS],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  const watchExplanation = {
    type: jsPsychHtmlButtonResponse,
    stimulus: text.instruction_watch,
    choices: [text.continue_button],
    css_classes: [CSS_ROOT_CLASS],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  const tapExplanation = {
    type: jsPsychHtmlButtonResponse,
    stimulus: text.instruction_tap,
    choices: [text.continue_button],
    css_classes: [CSS_ROOT_CLASS],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  // Practice sequence - 2 blocks
  const practiceSequence = [0, 3]; // Use blocks at indices 0 and 3

  const practiceWatchPrompt = {
    type: jsPsychHtmlButtonResponse,
    stimulus: text.instruction_try_watch,
    choices: [text.continue_button],
    css_classes: [CSS_ROOT_CLASS],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  const practiceDisplay = {
    type: jsPsychCorsiBlocks,
    mode: "display",
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
    css_classes: [CSS_ROOT_CLASS],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "practice",
      part: "instruction",
      practice_attempt: () => practiceAttempt,
    },
  };

  const practiceTapPrompt = {
    type: jsPsychHtmlButtonResponse,
    stimulus: text.instruction_try_tap,
    choices: [text.continue_button],
    css_classes: [CSS_ROOT_CLASS],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  const practiceInput = {
    type: jsPsychCorsiBlocks,
    mode: "input",
    sequence: practiceSequence,
    blocks: config.blocks || DEFAULT_BLOCKS,
    post_sequence_delay: config.post_sequence_delay,
    inter_trial_delay: 0,
    response_timeout: null, // No timeout for practice
    response_animation_duration: config.click_feedback_duration,
    block_color: config.block_colors.inactive,
    highlight_color: config.block_colors.active,
    correct_color: config.block_colors.correct || "#00ff00",
    incorrect_color: config.block_colors.incorrect || "#ff0000",
    background_color: config.background_color,
    display_width: config.display_width,
    display_height: config.display_height,
    block_size: config.block_size,
    prompt: text.input_prompt,
    css_classes: [CSS_ROOT_CLASS],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "practice",
      part: "instruction",
      practice_attempt: () => practiceAttempt,
    },
  };

  const practiceFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const lastTrial = lastPracticeResponse();
      if (lastTrial && lastTrial.correct) {
        return `<div class="jspsych-corsi-block-feedback jspsych-corsi-block-feedback-correct"><p>${text.instruction_success}</p></div>`;
      }
      // Don't promise another try when this was the last one
      const message = attemptsRemain()
        ? text.instruction_failure
        : text.instruction_practice_exhausted;
      return `<div class="jspsych-corsi-block-feedback jspsych-corsi-block-feedback-incorrect"><p>${message}</p></div>`;
    },
    choices: [text.continue_button],
    css_classes: [CSS_ROOT_CLASS],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  // Create a looping practice that retries if incorrect
  const practiceLoop = {
    timeline: [
      practiceWatchPrompt,
      practiceDisplay,
      practiceTapPrompt,
      practiceInput,
      practiceFeedback,
    ],
    loop_function: () => {
      const lastInputTrial = lastPracticeResponse();

      if (!lastInputTrial || lastInputTrial.correct) {
        return false;
      }

      if (!attemptsRemain()) {
        return false;
      }

      practiceAttempt += 1;
      return true;
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
export function createTimeline(jsPsych: JsPsych, config: CorsiBlockConfig = {}): any {
  const fullConfig = mergeConfig(config, DEFAULT_CONFIG);
  validateConfig(fullConfig);

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
      trial_in_length: index,
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
          active: fullConfig.block_colors.active,
        },
        background_color: fullConfig.background_color,
        display_width: fullConfig.display_width,
        display_height: fullConfig.display_height,
        block_size: fullConfig.block_size,
        prompt: text.display_prompt,
        task_version: VERSION,
        data_labels: config.data_labels,
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
          correct: fullConfig.block_colors.correct || "#00ff00",
          incorrect: fullConfig.block_colors.incorrect || "#ff0000",
        },
        background_color: fullConfig.background_color,
        display_width: fullConfig.display_width,
        display_height: fullConfig.display_height,
        block_size: fullConfig.block_size,
        prompt: text.input_prompt,
        task_version: VERSION,
        data_labels: config.data_labels,
      })
    );

    // Create conditional timeline for this length
    const lengthNode = {
      timeline: [
        {
          timeline: trialSequence,
          timeline_variables: trial_variables,
        },
      ],
      conditional_function: () => {
        // Always run the first length
        if (length === fullConfig.starting_length) {
          return true;
        }

        // Check performance at previous length
        const previousLength = length - 1;
        const previousTrials = jsPsych.data.get().filter({
          task: "corsi-block",
          phase: "test",
          part: "response",
          sequence_length: previousLength,
        });

        // If no previous trials, skip this length
        if (previousTrials.count() === 0) {
          return false;
        }

        // Count failures at previous length
        const failures = previousTrials.filter({ correct: false }).count();

        // Stop rule: both-trials. Stop once every trial at the previous length
        // was failed.
        if (fullConfig.stop_rule === "both-trials") {
          return failures < fullConfig.trials_per_length;
        }

        // Stop rule: consecutive-errors
        if (fullConfig.stop_rule === "consecutive-errors") {
          // Count recent consecutive errors
          const recentTrials = jsPsych.data
            .get()
            .filter({
              task: "corsi-block",
              phase: "test",
              part: "response",
            })
            .last(fullConfig.consecutive_errors_threshold);

          if (recentTrials.count() >= fullConfig.consecutive_errors_threshold) {
            const allFailed =
              recentTrials.filter({ correct: false }).count() ===
              fullConfig.consecutive_errors_threshold;
            if (allFailed) {
              return false;
            }
          }
        }

        return true;
      },
    };

    timeline.push(lengthNode);
  }

  // trial with nothing, only serves to record the span in data.
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "",
    choices: "NO_KEYS",
    trial_duration: 0,
    css_classes: [CSS_ROOT_CLASS],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "scoring",
    },
    on_finish: (data: any) => {
      data.corsi_span = calculateSpan(jsPsych.data.get());
    },
  });

  return {
    timeline,
  };
}

// -- SCORING FUNCTIONS --

interface ScoringResult {
  /** Longest sequence length reproduced correctly, or null if none was */
  span: number | null;
  totalTrials: number;
  correctTrials: number;
  /** Proportion of response trials correct, or null if there were none */
  accuracy: number | null;
  /** Longest sequence length presented, or null if none was */
  maxLengthAttempted: number | null;
}

/**
 * calculates the corsi span: the longest sequence length the participant
 * reproduced correctly at least once.
 *
 * @returns corsi span, null if all trials were failed.
 */
function calculateSpan(data: DataCollection): number | null {
  const passedTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "response", correct: true })
    .values() as any[];

  if (passedTrials.length === 0) {
    return null;
  }

  return Math.max(...passedTrials.map((trial) => trial.sequence_length));
}

/**
 * Calculate scoring metrics from Corsi Block data
 */
function calculateScores(data: DataCollection): ScoringResult {
  const inputTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "response" })
    .values() as any[];

  if (inputTrials.length === 0) {
    return {
      span: null,
      totalTrials: 0,
      correctTrials: 0,
      accuracy: null,
      maxLengthAttempted: null,
    };
  }

  const correctTrials = inputTrials.filter((trial) => trial.correct);

  return {
    span: calculateSpan(data),
    totalTrials: inputTrials.length,
    correctTrials: correctTrials.length,
    accuracy: correctTrials.length / inputTrials.length,
    maxLengthAttempted: Math.max(...inputTrials.map((trial) => trial.sequence_length)),
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
export type { CorsiBlockConfig } from "./types";
export type { TextConfig } from "./text";
