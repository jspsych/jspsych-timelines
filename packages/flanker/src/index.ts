import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface FlankerOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Show feedback during practice (default: true) */
  showPracticeFeedback?: boolean;
  /** Show feedback during test (default: false) */
  showTestFeedback?: boolean;
  /** Number of practice trials (default: 12) */
  numPracticeTrials?: number;
  /** Number of test trials (default: 120) */
  numTestTrials?: number;
  /** Number of test blocks (default: 1) */
  numBlocks?: number;
  /** Fixation cross duration in ms (default: 500) */
  fixationDuration?: number;
  /** Maximum response time in ms (default: 2000) */
  responseDuration?: number;
  /** Feedback display duration in ms (default: 400) */
  feedbackDuration?: number;
  /** Inter-trial interval in ms (default: 1000) */
  interTrialInterval?: number;
  /** Include neutral (dash) flanker trials (default: true) */
  includeNeutral?: boolean;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "practice" | "test";
  block: number;
  trial: number;
  target_direction: "left" | "right";
  congruence: "congruent" | "incongruent" | "neutral";
  stimulus: string;
  correct_response: number;
  response: number | null;
  correct: boolean;
  rt: number | null;
}

export interface ScoringResult {
  accuracy: number;
  meanRT: number | null;
  congruentAccuracy: number;
  incongruentAccuracy: number;
  neutralAccuracy: number | null;
  congruentRT: number | null;
  incongruentRT: number | null;
  neutralRT: number | null;
  flankerEffectRT: number | null;
  flankerEffectAccuracy: number;
  totalTrials: number;
  correctTrials: number;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  showPracticeFeedback: boolean;
  showTestFeedback: boolean;
  numPracticeTrials: number;
  numTestTrials: number;
  numBlocks: number;
  fixationDuration: number;
  responseDuration: number;
  feedbackDuration: number;
  interTrialInterval: number;
  includeNeutral: boolean;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "flanker";
const VERSION = "0.0.1";

const LEFT_ARROW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 48 48"><path fill="black" d="M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z"/></svg>`;
const RIGHT_ARROW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 48 48"><path fill="black" d="m24 40-2.1-2.15L34.25 25.5H8v-3h26.25L21.9 10.15 24 8l16 16Z"/></svg>`;
const NEUTRAL_STIMULUS = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 48 48"><rect fill="black" x="8" y="22.5" width="32" height="3"/></svg>`;

// Button indices: 0 = left, 1 = right
const LEFT_BUTTON_INDEX = 0;
const RIGHT_BUTTON_INDEX = 1;

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPracticeFeedback: true,
  showTestFeedback: false,
  numPracticeTrials: 12,
  numTestTrials: 120,
  numBlocks: 1,
  fixationDuration: 500,
  responseDuration: 2000, // Longer for touch responses
  feedbackDuration: 400,
  interTrialInterval: 1000,
  includeNeutral: true,
};

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Generates the stimulus HTML for a flanker trial.
 */
function generateStimulusHtml(
  targetDirection: "left" | "right",
  congruence: "congruent" | "incongruent" | "neutral"
): string {
  let flankerHtml: string;
  const targetHtml = targetDirection === "left" ? LEFT_ARROW_SVG : RIGHT_ARROW_SVG;

  if (congruence === "congruent") {
    flankerHtml = targetHtml;
  } else if (congruence === "incongruent") {
    flankerHtml = targetDirection === "left" ? RIGHT_ARROW_SVG : LEFT_ARROW_SVG;
  } else {
    flankerHtml = NEUTRAL_STIMULUS;
  }

  return `
    <div class="trial-content">
      <div class="stimulus-container">
        <span>${flankerHtml}</span>
        <span>${flankerHtml}</span>
        <span>${targetHtml}</span>
        <span>${flankerHtml}</span>
        <span>${flankerHtml}</span>
      </div>
    </div>
  `;
}

/**
 * Generates trial variables for the flanker task.
 */
function generateTrialVariables(
  includeNeutral: boolean
): Array<{ target_direction: "left" | "right"; congruence: "congruent" | "incongruent" | "neutral" }> {
  const conditions: Array<{ target_direction: "left" | "right"; congruence: "congruent" | "incongruent" | "neutral" }> = [
    { target_direction: "left", congruence: "congruent" },
    { target_direction: "left", congruence: "incongruent" },
    { target_direction: "right", congruence: "congruent" },
    { target_direction: "right", congruence: "incongruent" },
  ];

  if (includeNeutral) {
    conditions.push(
      { target_direction: "left", congruence: "neutral" },
      { target_direction: "right", congruence: "neutral" }
    );
  }

  return conditions;
}

/**
 * Creates the button HTML template for response buttons.
 * Uses default jsPsych button styling.
 */
function createButtonHtml(choice: string): string {
  return `<button class="jspsych-btn">${choice}</button>`;
}

/**
 * Creates disabled button HTML for non-response trials.
 * Buttons are visible but non-interactive to prevent layout shifts.
 */
function createDisabledButtonHtml(choice: string): string {
  return `<button class="jspsych-btn" disabled>${choice}</button>`;
}

// -- TIMELINE UNITS --

/**
 * Creates an interactive instruction trial where the user must respond correctly.
 * If they respond incorrectly, they see feedback and must try again.
 */
function createInteractiveInstructionTrial(
  config: ResolvedConfig,
  stimulus: string,
  prompt: string,
  correctButtonIndex: number
) {
  const timeline: any[] = [];

  const instructionTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div class="instructions">
        ${prompt}
        <div style="margin: 20px 0;">${stimulus}</div>
      </div>
    `,
    choices: [config.text.left_button, config.text.right_button],
    button_html: createButtonHtml,
    data: {
      task: TASK_NAME,
      part: "instruction",
      correct_response: correctButtonIndex,
    },
    on_finish: (data: any) => {
      data.correct = data.response === correctButtonIndex;
      if (data.correct) {
        timeline.push(successFeedback);
      } else {
        timeline.push(failureFeedback);
        timeline.push(instructionTrial); // Retry on failure
      }
    },
  };

  const successFeedback = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="instructions">
        ${prompt}
        <div style="margin: 20px 0;">${stimulus}</div>
        <p class="feedback correct">${config.text.instruction_success}</p>
      </div>
    `,
    choices: "NO_KEYS",
    trial_duration: 1000,
    data: {
      task: TASK_NAME,
      part: "instruction_feedback",
    },
  };

  const failureFeedback = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="instructions">
        ${prompt}
        <div style="margin: 20px 0;">${stimulus}</div>
        <p class="feedback incorrect">${config.text.instruction_failure}</p>
      </div>
    `,
    choices: "NO_KEYS",
    trial_duration: 1500,
    data: {
      task: TASK_NAME,
      part: "instruction_feedback",
    },
  };

  timeline.push(instructionTrial);
  return { timeline };
}

/**
 * Creates instruction trials for the flanker task.
 * Instructions are interactive - users must respond correctly to proceed.
 */
function createInstructionTrials(config: ResolvedConfig) {
  const timeline: any[] = [];

  // Page 1: Introduction (static)
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_intro,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      part: "instruction",
    },
  });

  // Page 2: How to respond (static)
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_response(
      config.text.left_button,
      config.text.right_button,
      LEFT_ARROW_SVG,
      RIGHT_ARROW_SVG
    ),
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      part: "instruction",
    },
  });

  // Page 3: Interactive - congruent right (easy example)
  timeline.push(
    createInteractiveInstructionTrial(
      config,
      generateStimulusHtml("right", "congruent"),
      config.text.instruction_try_right,
      RIGHT_BUTTON_INDEX
    )
  );

  // Page 4: Interactive - congruent left
  timeline.push(
    createInteractiveInstructionTrial(
      config,
      generateStimulusHtml("left", "congruent"),
      config.text.instruction_try_left,
      LEFT_BUTTON_INDEX
    )
  );

  // Page 5: Interactive - incongruent (harder example)
  timeline.push(
    createInteractiveInstructionTrial(
      config,
      generateStimulusHtml("right", "incongruent"),
      config.text.instruction_try_incongruent,
      RIGHT_BUTTON_INDEX
    )
  );

  // Page 6: Practice intro (static)
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_practice_intro,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      part: "instruction",
    },
  });

  return { timeline };
}

/**
 * Creates a fixation trial.
 * Shows disabled buttons to prevent layout shifts.
 */
function createFixationTrial(config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"><div class="fixation">${config.text.fixation}</div></div>`,
    choices: [config.text.left_button, config.text.right_button],
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.fixationDuration,
    data: {
      task: TASK_NAME,
      part: "fixation",
    },
  };
}

/**
 * Creates a stimulus trial for the flanker task.
 */
function createStimulusTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  phase: "practice" | "test",
  blockNumber: number
) {
  let trialCounter = 0;

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const targetDirection = jsPsych.evaluateTimelineVariable("target_direction") as "left" | "right";
      const congruence = jsPsych.evaluateTimelineVariable("congruence") as "congruent" | "incongruent" | "neutral";
      return generateStimulusHtml(targetDirection, congruence);
    },
    choices: [config.text.left_button, config.text.right_button],
    button_html: createButtonHtml,
    trial_duration: config.responseDuration,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: phase,
      block: blockNumber,
      trial: () => ++trialCounter,
      target_direction: () => jsPsych.evaluateTimelineVariable("target_direction"),
      congruence: () => jsPsych.evaluateTimelineVariable("congruence"),
      correct_response: () => {
        const targetDirection = jsPsych.evaluateTimelineVariable("target_direction") as "left" | "right";
        return targetDirection === "left" ? LEFT_BUTTON_INDEX : RIGHT_BUTTON_INDEX;
      },
      part: "stimulus",
    },
    on_finish: (data: any) => {
      data.correct = data.response === data.correct_response;
    },
  };
}

/**
 * Creates a feedback trial.
 * Shows disabled buttons to prevent layout shifts.
 */
function createFeedbackTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().last(1).values()[0];
      let feedbackText: string;
      let feedbackClass: string;

      if (lastTrial.response === null) {
        feedbackText = config.text.timeout_feedback;
        feedbackClass = "feedback timeout";
      } else if (lastTrial.correct) {
        feedbackText = config.text.correct_feedback;
        feedbackClass = "feedback correct";
      } else {
        feedbackText = config.text.incorrect_feedback;
        feedbackClass = "feedback incorrect";
      }

      return `<div class="trial-content"><div class="${feedbackClass}">${feedbackText}</div></div>`;
    },
    choices: [config.text.left_button, config.text.right_button],
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.feedbackDuration,
    data: {
      task: TASK_NAME,
      part: "feedback",
    },
  };
}

/**
 * Creates an ITI (inter-trial interval) trial.
 * Shows disabled buttons to prevent layout shifts.
 */
function createItiTrial(config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"></div>`,
    choices: [config.text.left_button, config.text.right_button],
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.interTrialInterval,
    data: {
      task: TASK_NAME,
      part: "iti",
    },
  };
}

/**
 * Creates a transition screen between phases.
 */
function createTransitionTrial(message: string, buttonLabel: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="transition"><p>${message}</p></div>`,
    choices: [buttonLabel],
    data: {
      task: TASK_NAME,
      part: "transition",
    },
  };
}

/**
 * Creates a practice block.
 */
function createPracticeBlock(jsPsych: JsPsych, config: ResolvedConfig) {
  const trialVariables = generateTrialVariables(config.includeNeutral);
  const numConditions = trialVariables.length;
  const repetitions = Math.ceil(config.numPracticeTrials / numConditions);

  const trialTimeline: any[] = [
    createFixationTrial(config),
    createStimulusTrial(jsPsych, config, "practice", 1),
  ];

  if (config.showPracticeFeedback) {
    trialTimeline.push(createFeedbackTrial(jsPsych, config));
  }

  trialTimeline.push(createItiTrial(config));

  return {
    timeline: trialTimeline,
    timeline_variables: trialVariables,
    sample: {
      type: "fixed-repetitions" as const,
      size: repetitions,
    },
  };
}

/**
 * Creates a test block.
 */
function createTestBlock(jsPsych: JsPsych, config: ResolvedConfig, blockNumber: number) {
  const trialVariables = generateTrialVariables(config.includeNeutral);
  const numConditions = trialVariables.length;
  const trialsPerBlock = Math.ceil(config.numTestTrials / config.numBlocks);
  const repetitions = Math.ceil(trialsPerBlock / numConditions);

  const trialTimeline: any[] = [
    createFixationTrial(config),
    createStimulusTrial(jsPsych, config, "test", blockNumber),
  ];

  if (config.showTestFeedback) {
    trialTimeline.push(createFeedbackTrial(jsPsych, config));
  }

  trialTimeline.push(createItiTrial(config));

  return {
    timeline: trialTimeline,
    timeline_variables: trialVariables,
    sample: {
      type: "fixed-repetitions" as const,
      size: repetitions,
    },
  };
}

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics from the flanker task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "stimulus" })
    .values() as TrialData[];

  if (testTrials.length === 0) {
    return {
      accuracy: 0,
      meanRT: null,
      congruentAccuracy: 0,
      incongruentAccuracy: 0,
      neutralAccuracy: null,
      congruentRT: null,
      incongruentRT: null,
      neutralRT: null,
      flankerEffectRT: null,
      flankerEffectAccuracy: 0,
      totalTrials: 0,
      correctTrials: 0,
    };
  }

  const correctTrials = testTrials.filter((t) => t.correct);
  const accuracy = correctTrials.length / testTrials.length;
  const correctRTs = correctTrials.filter((t) => t.rt !== null).map((t) => t.rt as number);
  const meanRT = mean(correctRTs);

  // By condition
  const congruentTrials = testTrials.filter((t) => t.congruence === "congruent");
  const incongruentTrials = testTrials.filter((t) => t.congruence === "incongruent");
  const neutralTrials = testTrials.filter((t) => t.congruence === "neutral");

  const congruentAccuracy = congruentTrials.length > 0
    ? congruentTrials.filter((t) => t.correct).length / congruentTrials.length
    : 0;
  const incongruentAccuracy = incongruentTrials.length > 0
    ? incongruentTrials.filter((t) => t.correct).length / incongruentTrials.length
    : 0;
  const neutralAccuracy = neutralTrials.length > 0
    ? neutralTrials.filter((t) => t.correct).length / neutralTrials.length
    : null;

  const congruentRT = mean(
    congruentTrials.filter((t) => t.correct && t.rt !== null).map((t) => t.rt as number)
  );
  const incongruentRT = mean(
    incongruentTrials.filter((t) => t.correct && t.rt !== null).map((t) => t.rt as number)
  );
  const neutralRT = neutralTrials.length > 0
    ? mean(neutralTrials.filter((t) => t.correct && t.rt !== null).map((t) => t.rt as number))
    : null;

  // Flanker effect
  const flankerEffectRT =
    incongruentRT !== null && congruentRT !== null ? incongruentRT - congruentRT : null;
  const flankerEffectAccuracy = congruentAccuracy - incongruentAccuracy;

  return {
    accuracy,
    meanRT,
    congruentAccuracy,
    incongruentAccuracy,
    neutralAccuracy,
    congruentRT,
    incongruentRT,
    neutralRT,
    flankerEffectRT,
    flankerEffectAccuracy,
    totalTrials: testTrials.length,
    correctTrials: correctTrials.length,
  };
}

/**
 * Returns a summary of the flanker task performance.
 */
function getSummary(data: DataCollection): ScoringResult & { taskName: string; version: string } {
  const scores = calculateScores(data);
  return {
    ...scores,
    taskName: TASK_NAME,
    version: VERSION,
  };
}

// -- MAIN EXPORT --

/**
 * Creates the complete Eriksen Flanker Task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const flankerTimeline = createTimeline(jsPsych, {
 *   numTestTrials: 60,
 *   showInstructions: true,
 * });
 * jsPsych.run([flankerTimeline]);
 * ```
 *
 * @example
 * // With Spanish translation
 * const spanishText = {
 *   left_button: "Izquierda",
 *   right_button: "Derecha",
 *   continue_button: "Continuar",
 *   correct_feedback: "¡Correcto!",
 *   incorrect_feedback: "Incorrecto",
 *   timeout_feedback: "¡Muy lento!",
 * };
 * const timeline = createTimeline(jsPsych, { text: spanishText });
 */
export function createTimeline(jsPsych: JsPsych, options: FlankerOptions = {}) {
  // Merge text with defaults
  const text: TextConfig = { ...defaultText, ...options.text };

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    text,
  };

  const timeline: any[] = [];

  // Instructions
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config));
  }

  // Practice
  if (config.numPracticeTrials > 0) {
    timeline.push(createPracticeBlock(jsPsych, config));
    timeline.push(
      createTransitionTrial(
        config.text.practice_complete,
        config.text.continue_button
      )
    );
  }

  // Test blocks
  for (let block = 1; block <= config.numBlocks; block++) {
    if (block > 1) {
      timeline.push(
        createTransitionTrial(
          config.text.block_complete(block - 1),
          config.text.continue_button
        )
      );
    }
    timeline.push(createTestBlock(jsPsych, config, block));
  }

  return { timeline };
}

/**
 * Timeline units that can be used to create custom flanker experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createInteractiveInstructionTrial,
  createFixationTrial,
  createStimulusTrial,
  createFeedbackTrial,
  createItiTrial,
  createTransitionTrial,
  createPracticeBlock,
  createTestBlock,
};

/**
 * Utility functions for the flanker task.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  stimuli: {
    generateStimulusHtml,
    generateTrialVariables,
    LEFT_ARROW_SVG,
    RIGHT_ARROW_SVG,
    NEUTRAL_STIMULUS,
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
