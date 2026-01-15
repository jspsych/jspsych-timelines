import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface ChoiceRTOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Number of trials (default: 20) */
  numTrials?: number;
  /** Minimum foreperiod (warning to stimulus) in ms (default: 500) */
  foreperiodMin?: number;
  /** Maximum foreperiod in ms (default: 1500) */
  foreperiodMax?: number;
  /** Response timeout in ms (default: 1500) */
  responseTimeout?: number;
  /** Inter-trial interval in ms (default: 500) */
  iti?: number;
  /** Minimum RT to be considered valid (not anticipated) in ms (default: 100) */
  minValidRT?: number;
  /** Show practice trials (default: true) */
  showPractice?: boolean;
  /** Number of practice trials (default: 5) */
  numPracticeTrials?: number;
  /** Feedback duration during practice in ms (default: 1000) */
  feedbackDuration?: number;
  /** Stimulus color 1 - mapped to button 1 (default: "#4A90D9" - blue) */
  stimulusColor1?: string;
  /** Stimulus color 2 - mapped to button 2 (default: "#E8913A" - orange) */
  stimulusColor2?: string;
  /** Stimulus size in pixels (default: 60) */
  stimulusSize?: number;
  /** Custom text strings for translation */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  trial_part: string;
  trial_index: number;
  foreperiod: number;
  stimulus: 1 | 2;
  response: 1 | 2 | null;
  correct: boolean;
  anticipated: boolean;
  rt: number | null;
}

export interface ScoringResult {
  /** Average RT for correct trials */
  meanRT: number | null;
  /** Standard deviation of RT for correct trials */
  rtStd: number | null;
  /** Accuracy (percentage of correct, non-anticipated responses) */
  accuracy: number;
  /** Total number of trials */
  totalTrials: number;
  /** Number of correct trials */
  correctTrials: number;
  /** Number of incorrect trials */
  incorrectTrials: number;
  /** Number of anticipated responses */
  anticipatedResponses: number;
  /** Number of timeout responses */
  timeoutResponses: number;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  numTrials: number;
  foreperiodMin: number;
  foreperiodMax: number;
  responseTimeout: number;
  iti: number;
  minValidRT: number;
  showPractice: boolean;
  numPracticeTrials: number;
  feedbackDuration: number;
  stimulusColor1: string;
  stimulusColor2: string;
  stimulusSize: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "choice-rt";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  showInstructions: true,
  numTrials: 20,
  foreperiodMin: 500,
  foreperiodMax: 1500,
  responseTimeout: 1500,
  iti: 500,
  minValidRT: 100,
  showPractice: true,
  numPracticeTrials: 5,
  feedbackDuration: 1000,
  stimulusColor1: "#4A90D9",
  stimulusColor2: "#E8913A",
  stimulusSize: 60,
};

// -- UTILITY FUNCTIONS --

/**
 * Creates disabled button HTML for non-response trials.
 * Buttons are visible but non-interactive to prevent layout shifts.
 */
function createDisabledButtonHtml(choice: string): string {
  return `<button class="jspsych-btn" disabled>${choice}</button>`;
}

/**
 * Generates a random foreperiod within the specified range.
 */
function generateForeperiod(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates balanced trial sequence for choice RT.
 */
function generateStimulusSequence(numTrials: number): Array<1 | 2> {
  const half = Math.floor(numTrials / 2);
  const sequence: Array<1 | 2> = [
    ...Array(half).fill(1),
    ...Array(numTrials - half).fill(2),
  ];
  // Shuffle
  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  }
  return sequence;
}

/**
 * Creates HTML for the stimulus circle.
 */
function createStimulusHTML(color: string, size: number): string {
  return `
    <div class="trial-content">
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${color};
      "></div>
    </div>
  `;
}

/**
 * Creates HTML for the fixation cross.
 */
function createFixationHTML(): string {
  return `<div class="trial-content"><p style="font-size: 48px; margin: 0;">+</p></div>`;
}

/**
 * Calculates standard deviation.
 */
function calculateStd(values: number[]): number | null {
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials.
 */
function createInstructionTrials(
  config: ResolvedConfig,
  part: "intro" | "task" | "practice"
) {
  let stimulus: string;
  let buttonLabel: string;

  switch (part) {
    case "intro":
      stimulus = config.text.instruction_intro;
      buttonLabel = config.text.continue_button;
      break;
    case "task":
      stimulus = config.text.instruction_task;
      buttonLabel = config.text.start_button;
      break;
    case "practice":
      stimulus = config.text.instruction_practice;
      buttonLabel = config.text.start_button;
      break;
    default:
      stimulus = "";
      buttonLabel = config.text.continue_button;
  }

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: stimulus,
    choices: [buttonLabel],
    data: {
      task: TASK_NAME,
      trial_part: "instruction",
    },
  };
}

/**
 * Creates a choice RT trial.
 */
function createChoiceRTTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  stimulusType: 1 | 2,
  trialIndex: number,
  isPractice: boolean
) {
  const foreperiod = generateForeperiod(config.foreperiodMin, config.foreperiodMax);
  const stimulusColor = stimulusType === 1 ? config.stimulusColor1 : config.stimulusColor2;
  const timeline: any[] = [];

  // Fixation / foreperiod - buttons are disabled
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: createFixationHTML(),
    choices: [config.text.button_1, config.text.button_2],
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: foreperiod,
    data: {
      task: TASK_NAME,
      trial_part: "foreperiod",
      foreperiod: foreperiod,
    },
  });

  // Stimulus with choice
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: createStimulusHTML(stimulusColor, config.stimulusSize),
    choices: [config.text.button_1, config.text.button_2],
    trial_duration: config.responseTimeout,
    response_ends_trial: true,
    button_html: (choice: string) => {
      return `<button class="jspsych-btn" style="margin: 0 20px;">${choice}</button>`;
    },
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_part: isPractice ? "practice" : "response",
      trial_index: trialIndex,
      foreperiod: foreperiod,
      stimulus: stimulusType,
    },
    on_finish: (data: any) => {
      let response: 1 | 2 | null = null;
      if (data.response === 0) {
        response = 1;
      } else if (data.response === 1) {
        response = 2;
      }

      const correct = response === stimulusType;
      const anticipated = data.rt !== null && data.rt < config.minValidRT;

      jsPsych.data.get().addToLast({
        response: response,
        correct: correct && !anticipated,
        anticipated: anticipated,
      });
    },
  });

  // Feedback (practice only)
  if (isPractice) {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        const lastData = jsPsych.data.getLastTrialData().values()[0];
        if (lastData.response === null) {
          return `<div class="trial-content"><p class="feedback timeout">${config.text.feedback_timeout}</p></div>`;
        }
        if (lastData.anticipated) {
          return `<div class="trial-content"><p class="feedback incorrect">${config.text.feedback_anticipated}</p></div>`;
        }
        return lastData.correct
          ? `<div class="trial-content"><p class="feedback correct">${config.text.feedback_correct}</p></div>`
          : `<div class="trial-content"><p class="feedback incorrect">${config.text.feedback_incorrect}</p></div>`;
      },
      choices: [config.text.button_1, config.text.button_2],
      button_html: createDisabledButtonHtml,
      response_ends_trial: false,
      trial_duration: config.feedbackDuration,
      data: {
        task: TASK_NAME,
        trial_part: "feedback",
      },
    });
  }

  // ITI
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"></div>`,
    choices: [config.text.button_1, config.text.button_2],
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.iti,
    data: {
      task: TASK_NAME,
      trial_part: "iti",
    },
  });

  return { timeline };
}

/**
 * Creates a block of choice RT trials.
 */
function createTrialBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  numTrials: number,
  isPractice: boolean
) {
  const sequence = generateStimulusSequence(numTrials);
  const timeline: any[] = [];

  sequence.forEach((stimulusType, index) => {
    timeline.push(createChoiceRTTrial(jsPsych, config, stimulusType, index + 1, isPractice));
  });

  return { timeline };
}

/**
 * Creates the completion screen.
 */
function createCompletionTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const data = jsPsych.data.get();
      const scores = calculateScores(data);

      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += `<h2>${config.text.task_complete}</h2>`;
      html += config.text.result_summary(scores.meanRT, scores.accuracy);
      html += `</div>`;
      return html;
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_part: "completion",
    },
  };
}

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics from the Choice RT task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const responseTrials = data
    .filter({ task: TASK_NAME, trial_part: "response" })
    .values() as TrialData[];

  if (responseTrials.length === 0) {
    return {
      meanRT: null,
      rtStd: null,
      accuracy: 0,
      totalTrials: 0,
      correctTrials: 0,
      incorrectTrials: 0,
      anticipatedResponses: 0,
      timeoutResponses: 0,
    };
  }

  // Correct trials: correct and not anticipated
  const correctTrials = responseTrials.filter(
    (t) => t.correct && t.rt !== null && !t.anticipated
  );
  const correctRTs = correctTrials.map((t) => t.rt as number);

  const meanRT =
    correctRTs.length > 0
      ? correctRTs.reduce((a, b) => a + b, 0) / correctRTs.length
      : null;
  const rtStd = calculateStd(correctRTs);

  // Accuracy: percentage of correct responses
  const accuracy =
    responseTrials.length > 0
      ? (correctTrials.length / responseTrials.length) * 100
      : 0;

  // Incorrect, anticipated, and timeout counts
  const incorrectTrials = responseTrials.filter(
    (t) => !t.correct && t.rt !== null && !t.anticipated
  ).length;
  const anticipatedResponses = responseTrials.filter((t) => t.anticipated).length;
  const timeoutResponses = responseTrials.filter((t) => t.rt === null).length;

  return {
    meanRT,
    rtStd,
    accuracy,
    totalTrials: responseTrials.length,
    correctTrials: correctTrials.length,
    incorrectTrials,
    anticipatedResponses,
    timeoutResponses,
  };
}

/**
 * Returns a summary of the Choice RT task performance.
 */
function getSummary(
  data: DataCollection
): ScoringResult & { taskName: string; version: string } {
  const scores = calculateScores(data);
  return {
    ...scores,
    taskName: TASK_NAME,
    version: VERSION,
  };
}

// -- MAIN EXPORT --

/**
 * Creates the complete Choice RT task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const choiceRTTimeline = createTimeline(jsPsych, {
 *   numTrials: 20,
 *   showInstructions: true,
 * });
 * jsPsych.run([choiceRTTimeline]);
 * ```
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: ChoiceRTOptions = {}
) {
  // Merge text with defaults
  const text: TextConfig = { ...defaultText, ...options.text };

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    text,
  };

  const timeline: any[] = [];

  // Introduction
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "intro"));
  }

  // Practice
  if (config.showPractice) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "practice"));
    }
    timeline.push(createTrialBlock(jsPsych, config, config.numPracticeTrials, true));
  }

  // Main task
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "task"));
  }
  timeline.push(createTrialBlock(jsPsych, config, config.numTrials, false));

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Choice RT experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createChoiceRTTrial,
  createTrialBlock,
  createCompletionTrial,
  generateForeperiod,
  generateStimulusSequence,
  createStimulusHTML,
  createFixationHTML,
};

/**
 * Utility functions for the Choice RT task.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  constants: {
    TASK_NAME,
    VERSION,
    DEFAULT_OPTIONS,
  },
  text: defaultText,
};

// Re-export types
export type { TextConfig };
