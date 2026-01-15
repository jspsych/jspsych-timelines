import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface AntisaccadeOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Number of trials per block (default: 24) */
  trialsPerBlock?: number;
  /** Include prosaccade (same side) blocks (default: true) */
  includeProsaccade?: boolean;
  /** Fixation duration in ms (default: 500) */
  fixationDuration?: number;
  /** Gap duration between fixation and cue in ms (default: 200) */
  gapDuration?: number;
  /** Cue duration in ms - how long the cue is visible (default: 100) */
  cueDuration?: number;
  /** Response timeout in ms (default: 1500) */
  responseTimeout?: number;
  /** Inter-trial interval in ms (default: 500) */
  iti?: number;
  /** Show practice trials (default: true) */
  showPractice?: boolean;
  /** Number of practice trials per condition (default: 4) */
  numPracticeTrials?: number;
  /** Feedback duration during practice in ms (default: 1000) */
  feedbackDuration?: number;
  /** Cue color (default: "#FFD700" - gold) */
  cueColor?: string;
  /** Cue size in pixels (default: 40) */
  cueSize?: number;
  /** Cue offset from center in pixels (default: 200) */
  cueOffset?: number;
  /** Custom text strings for translation */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  trial_type: string;
  trial_index: number;
  block_type: "prosaccade" | "antisaccade";
  cue_side: "left" | "right";
  correct_response: "left" | "right";
  response: "left" | "right" | null;
  correct: boolean;
  rt: number | null;
}

export interface ScoringResult {
  /** Antisaccade accuracy percentage */
  antisaccadeAccuracy: number;
  /** Prosaccade accuracy percentage */
  prosaccadeAccuracy: number;
  /** Total antisaccade trials */
  antisaccadeTrials: number;
  /** Total prosaccade trials */
  prosaccadeTrials: number;
  /** Number of antisaccade errors (responding to cue side instead of opposite) */
  antisaccadeErrors: number;
  /** Number of prosaccade errors */
  prosaccadeErrors: number;
  /** Average RT for correct antisaccade trials */
  antisaccadeRT: number | null;
  /** Average RT for correct prosaccade trials */
  prosaccadeRT: number | null;
  /** Cost of antisaccade vs prosaccade (RT difference) */
  rtCost: number | null;
  /** Overall accuracy */
  overallAccuracy: number;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  trialsPerBlock: number;
  includeProsaccade: boolean;
  fixationDuration: number;
  gapDuration: number;
  cueDuration: number;
  responseTimeout: number;
  iti: number;
  showPractice: boolean;
  numPracticeTrials: number;
  feedbackDuration: number;
  cueColor: string;
  cueSize: number;
  cueOffset: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "antisaccade";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  showInstructions: true,
  trialsPerBlock: 24,
  includeProsaccade: true,
  fixationDuration: 500,
  gapDuration: 200,
  cueDuration: 100,
  responseTimeout: 1500,
  iti: 500,
  showPractice: true,
  numPracticeTrials: 4,
  feedbackDuration: 1000,
  cueColor: "#FFD700",
  cueSize: 40,
  cueOffset: 200,
};

// -- UTILITY FUNCTIONS --

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates balanced trial sequence with equal left/right cues.
 */
function generateTrialSequence(numTrials: number): Array<"left" | "right"> {
  const half = Math.floor(numTrials / 2);
  const sequence: Array<"left" | "right"> = [
    ...Array(half).fill("left"),
    ...Array(numTrials - half).fill("right"),
  ];
  return shuffleArray(sequence);
}

/**
 * Creates HTML for the cue stimulus.
 * Uses percentage-based positioning for mobile compatibility.
 */
function createCueHTML(
  side: "left" | "right",
  color: string,
  size: number,
  offset: number
): string {
  // Use percentage offset for responsive positioning (offset becomes % of container width)
  const offsetPercent = side === "left" ? 25 : 75;
  return `
    <div style="position: relative; height: 100px; width: 100%; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        left: ${offsetPercent}%;
        transform: translateX(-50%);
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
  return `<p style="font-size: 48px; margin: 0;">+</p>`;
}

/**
 * Creates HTML for the response buttons.
 */
function createResponseHTML(
  leftLabel: string,
  rightLabel: string
): string {
  return `
    <div style="display: flex; justify-content: space-between; width: 400px; margin: 50px auto;">
      <div style="flex: 1;"></div>
      <div style="flex: 1;"></div>
    </div>
  `;
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials.
 */
function createInstructionTrials(
  config: ResolvedConfig,
  part: "intro" | "prosaccade" | "antisaccade" | "practice"
) {
  let stimulus: string;
  let buttonLabel: string;

  switch (part) {
    case "intro":
      stimulus = config.text.instruction_intro;
      buttonLabel = config.text.continue_button;
      break;
    case "prosaccade":
      stimulus = config.text.instruction_prosaccade;
      buttonLabel = config.text.start_button;
      break;
    case "antisaccade":
      stimulus = config.text.instruction_antisaccade;
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
 * Creates a single antisaccade trial.
 */
function createAntisaccadeTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  cueSide: "left" | "right",
  blockType: "prosaccade" | "antisaccade",
  trialIndex: number,
  isPractice: boolean
) {
  const timeline: any[] = [];

  // Fixation
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: createFixationHTML(),
    choices: "NO_KEYS",
    trial_duration: config.fixationDuration,
    data: {
      task: TASK_NAME,
      trial_type: "fixation",
    },
  });

  // Gap (blank screen)
  if (config.gapDuration > 0) {
    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: "",
      choices: "NO_KEYS",
      trial_duration: config.gapDuration,
      data: {
        task: TASK_NAME,
        trial_type: "gap",
      },
    });
  }

  // Cue
  const cueHTML = createCueHTML(cueSide, config.cueColor, config.cueSize, config.cueOffset);
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: cueHTML,
    choices: "NO_KEYS",
    trial_duration: config.cueDuration,
    data: {
      task: TASK_NAME,
      trial_type: "cue",
    },
  });

  // Response
  const correctResponse: "left" | "right" =
    blockType === "prosaccade" ? cueSide : cueSide === "left" ? "right" : "left";

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: "",
    choices: [config.text.left_button, config.text.right_button],
    trial_duration: config.responseTimeout,
    button_layout: "flex",
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_type: isPractice ? "practice" : "response",
      trial_index: trialIndex,
      block_type: blockType,
      cue_side: cueSide,
      correct_response: correctResponse,
    },
    on_finish: (data: any) => {
      let response: "left" | "right" | null = null;
      if (data.response === 0) {
        response = "left";
      } else if (data.response === 1) {
        response = "right";
      }

      const correct = response === correctResponse;

      jsPsych.data.get().addToLast({
        response: response,
        correct: correct,
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
 * Creates a block of antisaccade trials.
 */
function createTrialBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  blockType: "prosaccade" | "antisaccade",
  numTrials: number,
  isPractice: boolean
) {
  const sequence = generateTrialSequence(numTrials);
  const timeline: any[] = [];

  sequence.forEach((cueSide, index) => {
    timeline.push(
      createAntisaccadeTrial(
        jsPsych,
        config,
        cueSide,
        blockType,
        index + 1,
        isPractice
      )
    );
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
        scores.antisaccadeAccuracy,
        scores.prosaccadeAccuracy,
        scores.antisaccadeRT,
        scores.prosaccadeRT,
        scores.antisaccadeErrors
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
 * Calculates scoring metrics from the Antisaccade task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const responseTrials = data
    .filter({ task: TASK_NAME, trial_type: "response" })
    .values() as TrialData[];

  if (responseTrials.length === 0) {
    return {
      antisaccadeAccuracy: 0,
      prosaccadeAccuracy: 0,
      antisaccadeTrials: 0,
      prosaccadeTrials: 0,
      antisaccadeErrors: 0,
      prosaccadeErrors: 0,
      antisaccadeRT: null,
      prosaccadeRT: null,
      rtCost: null,
      overallAccuracy: 0,
    };
  }

  // Separate by block type
  const antisaccadeTrials = responseTrials.filter(
    (t) => t.block_type === "antisaccade"
  );
  const prosaccadeTrials = responseTrials.filter(
    (t) => t.block_type === "prosaccade"
  );

  // Calculate accuracy
  const antisaccadeCorrect = antisaccadeTrials.filter((t) => t.correct).length;
  const prosaccadeCorrect = prosaccadeTrials.filter((t) => t.correct).length;

  const antisaccadeAccuracy =
    antisaccadeTrials.length > 0
      ? (antisaccadeCorrect / antisaccadeTrials.length) * 100
      : 0;
  const prosaccadeAccuracy =
    prosaccadeTrials.length > 0
      ? (prosaccadeCorrect / prosaccadeTrials.length) * 100
      : 0;

  // Calculate errors
  const antisaccadeErrors = antisaccadeTrials.filter(
    (t) => !t.correct && t.response !== null
  ).length;
  const prosaccadeErrors = prosaccadeTrials.filter(
    (t) => !t.correct && t.response !== null
  ).length;

  // Calculate RT for correct responses
  const antisaccadeRTs = antisaccadeTrials
    .filter((t) => t.correct && t.rt !== null)
    .map((t) => t.rt as number);
  const prosaccadeRTs = prosaccadeTrials
    .filter((t) => t.correct && t.rt !== null)
    .map((t) => t.rt as number);

  const antisaccadeRT =
    antisaccadeRTs.length > 0
      ? antisaccadeRTs.reduce((a, b) => a + b, 0) / antisaccadeRTs.length
      : null;
  const prosaccadeRT =
    prosaccadeRTs.length > 0
      ? prosaccadeRTs.reduce((a, b) => a + b, 0) / prosaccadeRTs.length
      : null;

  // RT cost (antisaccade - prosaccade)
  const rtCost =
    antisaccadeRT !== null && prosaccadeRT !== null
      ? antisaccadeRT - prosaccadeRT
      : null;

  // Overall accuracy
  const totalCorrect = antisaccadeCorrect + prosaccadeCorrect;
  const overallAccuracy = (totalCorrect / responseTrials.length) * 100;

  return {
    antisaccadeAccuracy,
    prosaccadeAccuracy,
    antisaccadeTrials: antisaccadeTrials.length,
    prosaccadeTrials: prosaccadeTrials.length,
    antisaccadeErrors,
    prosaccadeErrors,
    antisaccadeRT,
    prosaccadeRT,
    rtCost,
    overallAccuracy,
  };
}

/**
 * Returns a summary of the Antisaccade task performance.
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
 * Creates the complete Antisaccade task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const antisaccadeTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   trialsPerBlock: 24,
 *   includeProsaccade: true,
 * });
 * jsPsych.run([antisaccadeTimeline]);
 * ```
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: AntisaccadeOptions = {}
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

  // Prosaccade block (same side response - control condition)
  if (config.includeProsaccade) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "prosaccade"));
    }

    if (config.showPractice) {
      if (config.showInstructions) {
        timeline.push(createInstructionTrials(config, "practice"));
      }
      timeline.push(
        createTrialBlock(jsPsych, config, "prosaccade", config.numPracticeTrials, true)
      );
    }

    timeline.push(
      createTrialBlock(jsPsych, config, "prosaccade", config.trialsPerBlock, false)
    );
  }

  // Antisaccade block (opposite side response - experimental condition)
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "antisaccade"));
  }

  if (config.showPractice) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "practice"));
    }
    timeline.push(
      createTrialBlock(jsPsych, config, "antisaccade", config.numPracticeTrials, true)
    );
  }

  timeline.push(
    createTrialBlock(jsPsych, config, "antisaccade", config.trialsPerBlock, false)
  );

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Antisaccade experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createAntisaccadeTrial,
  createTrialBlock,
  createCompletionTrial,
  generateTrialSequence,
  createCueHTML,
  createFixationHTML,
};

/**
 * Utility functions for the Antisaccade task.
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
