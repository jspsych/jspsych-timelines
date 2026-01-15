import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface ChoiceRTOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Include simple RT block (default: true) */
  includeSimpleRT?: boolean;
  /** Include choice RT block (default: true) */
  includeChoiceRT?: boolean;
  /** Number of trials per block (default: 20) */
  trialsPerBlock?: number;
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
  /** Stimulus offset from center for choice RT in pixels (default: 150) */
  stimulusOffset?: number;
  /** Custom text strings for translation */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  trial_type: string;
  block_type: "simple" | "choice";
  trial_index: number;
  foreperiod: number;
  stimulus_side?: "left" | "right" | "center";
  response?: "left" | "right" | "center" | null;
  correct: boolean;
  anticipated: boolean;
  rt: number | null;
}

export interface ScoringResult {
  /** Average RT for valid simple RT trials */
  simpleRT: number | null;
  /** Average RT for correct choice RT trials */
  choiceRT: number | null;
  /** RT difference (choice - simple) */
  choiceCost: number | null;
  /** Simple RT accuracy (non-anticipated, non-timeout) */
  simpleAccuracy: number;
  /** Choice RT accuracy */
  choiceAccuracy: number;
  /** Total simple RT trials */
  simpleTrials: number;
  /** Total choice RT trials */
  choiceTrials: number;
  /** Number of anticipated responses in simple RT */
  anticipatedResponses: number;
  /** Number of timeout responses */
  timeoutResponses: number;
  /** Standard deviation of simple RT */
  simpleRTStd: number | null;
  /** Standard deviation of choice RT */
  choiceRTStd: number | null;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  includeSimpleRT: boolean;
  includeChoiceRT: boolean;
  trialsPerBlock: number;
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
  stimulusOffset: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "choice-rt";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  showInstructions: true,
  includeSimpleRT: true,
  includeChoiceRT: true,
  trialsPerBlock: 20,
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
  stimulusOffset: 150,
};

// -- UTILITY FUNCTIONS --

/**
 * Generates a random foreperiod within the specified range.
 */
function generateForeperiod(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates balanced trial sequence for choice RT.
 */
function generateChoiceSequence(numTrials: number): Array<"left" | "right"> {
  const half = Math.floor(numTrials / 2);
  const sequence: Array<"left" | "right"> = [
    ...Array(half).fill("left"),
    ...Array(numTrials - half).fill("right"),
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
function createStimulusHTML(
  color: string,
  size: number,
  side: "left" | "right" | "center",
  offset: number
): string {
  let position = "margin: 0 auto;";
  if (side === "left") {
    position = `margin-right: ${offset * 2}px;`;
  } else if (side === "right") {
    position = `margin-left: ${offset * 2}px;`;
  }

  return `
    <div style="display: flex; justify-content: center; align-items: center; height: 150px;">
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${color};
        ${position}
      "></div>
    </div>
  `;
}

/**
 * Creates HTML for the fixation cross.
 */
function createFixationHTML(): string {
  return `<div style="height: 150px; display: flex; justify-content: center; align-items: center;"><p style="font-size: 48px; margin: 0;">+</p></div>`;
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
  part: "intro" | "simple" | "choice" | "practice"
) {
  let stimulus: string;
  let buttonLabel: string;

  switch (part) {
    case "intro":
      stimulus = config.text.instruction_intro;
      buttonLabel = config.text.continue_button;
      break;
    case "simple":
      stimulus = config.text.instruction_simple;
      buttonLabel = config.text.start_button;
      break;
    case "choice":
      stimulus = config.text.instruction_choice;
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
      trial_type: "instruction",
    },
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

  // Fixation / foreperiod
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: createFixationHTML(),
    choices: [config.text.respond_button],
    trial_duration: foreperiod,
    response_ends_trial: true,
    data: {
      task: TASK_NAME,
      trial_type: "foreperiod",
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
        stimulus: createStimulusHTML(
          config.stimulusColor,
          config.stimulusSize,
          "center",
          config.stimulusOffset
        ),
        choices: [config.text.respond_button],
        trial_duration: config.responseTimeout,
        response_ends_trial: true,
        data: {
          task: TASK_NAME,
          task_version: VERSION,
          trial_type: isPractice ? "practice" : "response",
          block_type: "simple",
          trial_index: trialIndex,
          foreperiod: foreperiod,
          stimulus_side: "center",
        },
        on_finish: (data: any) => {
          const responded = data.response !== null;
          const anticipated = data.rt !== null && data.rt < config.minValidRT;
          const correct = responded && !anticipated;

          jsPsych.data.get().addToLast({
            response: responded ? "center" : null,
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
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        const trials = jsPsych.data.get().last(2).values();
        const foreperiodTrial = trials.find((t: any) => t.trial_type === "foreperiod");
        const responseTrial = trials.find(
          (t: any) => t.trial_type === "practice" || t.trial_type === "response"
        );

        if (foreperiodTrial?.anticipated) {
          return config.text.feedback_anticipated;
        }
        if (!responseTrial || responseTrial.response === null) {
          return config.text.feedback_timeout;
        }
        if (responseTrial.anticipated) {
          return config.text.feedback_anticipated;
        }
        return config.text.feedback_correct;
      },
      choices: "NO_KEYS",
      trial_duration: config.feedbackDuration,
      data: {
        task: TASK_NAME,
        trial_type: "feedback",
      },
    });
  }

  // ITI
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "",
    choices: "NO_KEYS",
    trial_duration: config.iti,
    data: {
      task: TASK_NAME,
      trial_type: "iti",
    },
  });

  return { timeline };
}

/**
 * Creates a choice RT trial.
 */
function createChoiceRTTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  stimulusSide: "left" | "right",
  trialIndex: number,
  isPractice: boolean
) {
  const foreperiod = generateForeperiod(config.foreperiodMin, config.foreperiodMax);
  const timeline: any[] = [];

  // Fixation / foreperiod
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: createFixationHTML(),
    choices: "NO_KEYS",
    trial_duration: foreperiod,
    data: {
      task: TASK_NAME,
      trial_type: "foreperiod",
      foreperiod: foreperiod,
    },
  });

  // Stimulus with choice
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: createStimulusHTML(
      config.stimulusColor,
      config.stimulusSize,
      stimulusSide,
      config.stimulusOffset
    ),
    choices: [config.text.left_button, config.text.right_button],
    trial_duration: config.responseTimeout,
    response_ends_trial: true,
    button_html: (choice: string) => {
      return `<button class="jspsych-btn" style="margin: 0 50px;">${choice}</button>`;
    },
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_type: isPractice ? "practice" : "response",
      block_type: "choice",
      trial_index: trialIndex,
      foreperiod: foreperiod,
      stimulus_side: stimulusSide,
    },
    on_finish: (data: any) => {
      let response: "left" | "right" | null = null;
      if (data.response === 0) {
        response = "left";
      } else if (data.response === 1) {
        response = "right";
      }

      const correct = response === stimulusSide;
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
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        const lastData = jsPsych.data.getLastTrialData().values()[0];
        if (lastData.response === null) {
          return config.text.feedback_timeout;
        }
        if (lastData.anticipated) {
          return config.text.feedback_anticipated;
        }
        return lastData.correct
          ? config.text.feedback_correct
          : config.text.feedback_incorrect;
      },
      choices: "NO_KEYS",
      trial_duration: config.feedbackDuration,
      data: {
        task: TASK_NAME,
        trial_type: "feedback",
      },
    });
  }

  // ITI
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "",
    choices: "NO_KEYS",
    trial_duration: config.iti,
    data: {
      task: TASK_NAME,
      trial_type: "iti",
    },
  });

  return { timeline };
}

/**
 * Creates a block of simple RT trials.
 */
function createSimpleRTBlock(
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
 * Creates a block of choice RT trials.
 */
function createChoiceRTBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  numTrials: number,
  isPractice: boolean
) {
  const sequence = generateChoiceSequence(numTrials);
  const timeline: any[] = [];

  sequence.forEach((side, index) => {
    timeline.push(createChoiceRTTrial(jsPsych, config, side, index + 1, isPractice));
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
      html += config.text.result_summary(
        scores.simpleRT,
        scores.choiceRT,
        scores.simpleAccuracy,
        scores.choiceAccuracy
      );
      html += `</div>`;
      return html;
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_type: "completion",
    },
  };
}

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics from the Choice RT task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const responseTrials = data
    .filter({ task: TASK_NAME, trial_type: "response" })
    .values() as TrialData[];

  if (responseTrials.length === 0) {
    return {
      simpleRT: null,
      choiceRT: null,
      choiceCost: null,
      simpleAccuracy: 0,
      choiceAccuracy: 0,
      simpleTrials: 0,
      choiceTrials: 0,
      anticipatedResponses: 0,
      timeoutResponses: 0,
      simpleRTStd: null,
      choiceRTStd: null,
    };
  }

  // Separate by block type
  const simpleTrials = responseTrials.filter((t) => t.block_type === "simple");
  const choiceTrials = responseTrials.filter((t) => t.block_type === "choice");

  // Simple RT: valid = responded, not anticipated
  const validSimpleTrials = simpleTrials.filter(
    (t) => t.rt !== null && !t.anticipated
  );
  const simpleRTs = validSimpleTrials.map((t) => t.rt as number);
  const simpleRT =
    simpleRTs.length > 0
      ? simpleRTs.reduce((a, b) => a + b, 0) / simpleRTs.length
      : null;
  const simpleRTStd = calculateStd(simpleRTs);

  // Choice RT: correct responses
  const correctChoiceTrials = choiceTrials.filter(
    (t) => t.correct && t.rt !== null && !t.anticipated
  );
  const choiceRTs = correctChoiceTrials.map((t) => t.rt as number);
  const choiceRT =
    choiceRTs.length > 0
      ? choiceRTs.reduce((a, b) => a + b, 0) / choiceRTs.length
      : null;
  const choiceRTStd = calculateStd(choiceRTs);

  // Accuracy
  const simpleAccuracy =
    simpleTrials.length > 0
      ? (validSimpleTrials.length / simpleTrials.length) * 100
      : 0;
  const choiceAccuracy =
    choiceTrials.length > 0
      ? (correctChoiceTrials.length / choiceTrials.length) * 100
      : 0;

  // Anticipated and timeout
  const anticipatedResponses = responseTrials.filter((t) => t.anticipated).length;
  const timeoutResponses = responseTrials.filter((t) => t.rt === null).length;

  // Choice cost
  const choiceCost =
    simpleRT !== null && choiceRT !== null ? choiceRT - simpleRT : null;

  return {
    simpleRT,
    choiceRT,
    choiceCost,
    simpleAccuracy,
    choiceAccuracy,
    simpleTrials: simpleTrials.length,
    choiceTrials: choiceTrials.length,
    anticipatedResponses,
    timeoutResponses,
    simpleRTStd,
    choiceRTStd,
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
 *   showInstructions: true,
 *   trialsPerBlock: 20,
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

  // Simple RT block
  if (config.includeSimpleRT) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "simple"));
    }

    if (config.showPractice) {
      if (config.showInstructions) {
        timeline.push(createInstructionTrials(config, "practice"));
      }
      timeline.push(
        createSimpleRTBlock(jsPsych, config, config.numPracticeTrials, true)
      );
    }

    timeline.push(
      createSimpleRTBlock(jsPsych, config, config.trialsPerBlock, false)
    );
  }

  // Choice RT block
  if (config.includeChoiceRT) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "choice"));
    }

    if (config.showPractice) {
      if (config.showInstructions) {
        timeline.push(createInstructionTrials(config, "practice"));
      }
      timeline.push(
        createChoiceRTBlock(jsPsych, config, config.numPracticeTrials, true)
      );
    }

    timeline.push(
      createChoiceRTBlock(jsPsych, config, config.trialsPerBlock, false)
    );
  }

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Choice RT experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createSimpleRTTrial,
  createChoiceRTTrial,
  createSimpleRTBlock,
  createChoiceRTBlock,
  createCompletionTrial,
  generateForeperiod,
  generateChoiceSequence,
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
