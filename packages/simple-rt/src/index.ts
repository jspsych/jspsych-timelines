import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface SimpleRTOptions {
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
  /** Stimulus color (default: "#4A90D9" - blue) */
  stimulusColor?: string;
  /** Stimulus size in pixels (default: 60) */
  stimulusSize?: number;
  /** Custom text strings for translation */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: string;
  part: string;
  trial_index: number;
  foreperiod: number;
  response: "respond" | null;
  correct: boolean;
  anticipated: boolean;
  rt: number | null;
}

export interface ScoringResult {
  /** Average RT for valid trials */
  meanRT: number | null;
  /** Standard deviation of RT for valid trials */
  rtStd: number | null;
  /** Accuracy (percentage of valid, non-anticipated responses) */
  accuracy: number;
  /** Total number of trials */
  totalTrials: number;
  /** Number of valid (correct) trials */
  validTrials: number;
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
  stimulusColor: string;
  stimulusSize: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "simple-rt";
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
  stimulusColor: "#4A90D9",
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

  const data: Record<string, any> = { task: TASK_NAME };
  switch (part) {
    case "intro":
      data.phase = "instructions";
      break;
    case "practice":
      data.phase = "practice";
      data.part = "instruction";
      break;
    case "task":
      data.phase = "test";
      data.part = "instruction";
      break;
  }

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: stimulus,
    choices: [buttonLabel],
    data,
  };
}

/**
 * Creates a simple RT trial.
 */
function createSimpleRTTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  trialIndex: number,
  isPractice: boolean
) {
  const foreperiod = generateForeperiod(config.foreperiodMin, config.foreperiodMax);
  const timeline: any[] = [];

  // Fixation / foreperiod - button is active to detect anticipation
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: createFixationHTML(),
    choices: [config.text.respond_button],
    trial_duration: foreperiod,
    response_ends_trial: true,
    data: {
      task: TASK_NAME,
      phase: isPractice ? "practice" : "test",
      part: "foreperiod",
      foreperiod: foreperiod,
    },
    on_finish: (data: any) => {
      // If they responded during foreperiod, it's anticipated
      if (data.response !== null) {
        jsPsych.data.get().addToLast({
          anticipated: true,
        });
      }
    },
  });

  // Check if anticipated and skip stimulus if so
  const stimulusTrial = {
    timeline: [
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: createStimulusHTML(config.stimulusColor, config.stimulusSize),
        choices: [config.text.respond_button],
        trial_duration: config.responseTimeout,
        response_ends_trial: true,
        data: {
          task: TASK_NAME,
          task_version: VERSION,
          phase: isPractice ? "practice" : "test",
          part: "response",
          trial_index: trialIndex,
          foreperiod: foreperiod,
        },
        on_finish: (data: any) => {
          const responded = data.response !== null;
          const anticipated = data.rt !== null && data.rt < config.minValidRT;
          const correct = responded && !anticipated;

          jsPsych.data.get().addToLast({
            response: responded ? "respond" : null,
            correct: correct,
            anticipated: anticipated,
          });
        },
      },
    ],
    conditional_function: () => {
      // Only show stimulus if they didn't anticipate during foreperiod
      const lastTrial = jsPsych.data.getLastTrialData().values()[0];
      return !lastTrial.anticipated;
    },
  };
  timeline.push(stimulusTrial);

  // Feedback (practice only)
  if (isPractice) {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        const trials = jsPsych.data.get().last(2).values();
        const foreperiodTrial = trials.find((t: any) => t.trial_type === "foreperiod");
        const responseTrial = trials.find(
          (t: any) => t.trial_type === "practice" || t.trial_type === "response"
        );

        if (foreperiodTrial?.anticipated) {
          return `<div class="trial-content"><p class="feedback timeout">${config.text.feedback_anticipated}</p></div>`;
        }
        if (!responseTrial || responseTrial.response === null) {
          return `<div class="trial-content"><p class="feedback timeout">${config.text.feedback_timeout}</p></div>`;
        }
        if (responseTrial.anticipated) {
          return `<div class="trial-content"><p class="feedback timeout">${config.text.feedback_anticipated}</p></div>`;
        }
        return `<div class="trial-content"><p class="feedback correct">${config.text.feedback_correct}</p></div>`;
      },
      choices: [config.text.respond_button],
      button_html: createDisabledButtonHtml,
      response_ends_trial: false,
      trial_duration: config.feedbackDuration,
      data: {
        task: TASK_NAME,
        phase: "practice",
        part: "feedback",
      },
    });
  }

  // ITI
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"></div>`,
    choices: [config.text.respond_button],
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.iti,
    data: {
      task: TASK_NAME,
      phase: isPractice ? "practice" : "test",
      part: "iti",
    },
  });

  return { timeline };
}

/**
 * Creates a block of simple RT trials.
 */
function createTrialBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  numTrials: number,
  isPractice: boolean
) {
  const timeline: any[] = [];

  for (let i = 0; i < numTrials; i++) {
    timeline.push(createSimpleRTTrial(jsPsych, config, i + 1, isPractice));
  }

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
      phase: "completion",
    },
  };
}

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics from the Simple RT task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const responseTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "response" })
    .values() as TrialData[];

  if (responseTrials.length === 0) {
    return {
      meanRT: null,
      rtStd: null,
      accuracy: 0,
      totalTrials: 0,
      validTrials: 0,
      anticipatedResponses: 0,
      timeoutResponses: 0,
    };
  }

  // Valid trials: responded and not anticipated
  const validTrials = responseTrials.filter(
    (t) => t.rt !== null && !t.anticipated
  );
  const validRTs = validTrials.map((t) => t.rt as number);

  const meanRT =
    validRTs.length > 0
      ? validRTs.reduce((a, b) => a + b, 0) / validRTs.length
      : null;
  const rtStd = calculateStd(validRTs);

  // Accuracy: percentage of valid responses
  const accuracy =
    responseTrials.length > 0
      ? (validTrials.length / responseTrials.length) * 100
      : 0;

  // Anticipated and timeout counts
  const anticipatedResponses = responseTrials.filter((t) => t.anticipated).length;
  const timeoutResponses = responseTrials.filter((t) => t.rt === null).length;

  return {
    meanRT,
    rtStd,
    accuracy,
    totalTrials: responseTrials.length,
    validTrials: validTrials.length,
    anticipatedResponses,
    timeoutResponses,
  };
}

/**
 * Returns a summary of the Simple RT task performance.
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
 * Creates the complete Simple RT task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const simpleRTTimeline = createTimeline(jsPsych, {
 *   numTrials: 20,
 *   showInstructions: true,
 * });
 * jsPsych.run([simpleRTTimeline]);
 * ```
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: SimpleRTOptions = {}
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
 * Timeline units that can be used to create custom Simple RT experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createSimpleRTTrial,
  createTrialBlock,
  createCompletionTrial,
  generateForeperiod,
  createStimulusHTML,
  createFixationHTML,
};

/**
 * Utility functions for the Simple RT task.
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
