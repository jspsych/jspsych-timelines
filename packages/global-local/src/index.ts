import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface GlobalLocalOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Include practice trials before each block (default: true) */
  showPractice?: boolean;
  /** Number of practice trials per block (default: 4) */
  numPracticeTrials?: number;
  /** Number of trials per block (default: 24) */
  trialsPerBlock?: number;
  /** Include global-only block (default: true) */
  includeGlobalBlock?: boolean;
  /** Include local-only block (default: true) */
  includeLocalBlock?: boolean;
  /** Duration of fixation cross in ms (default: 500) */
  fixationDuration?: number;
  /** Maximum response time in ms, null for unlimited (default: 2500) */
  responseTimeout?: number | null;
  /** Show feedback during practice (default: true) */
  showPracticeFeedback?: boolean;
  /** Feedback duration in ms (default: 500) */
  feedbackDuration?: number;
  /** Size of the global letter in pixels (default: 180) */
  globalSize?: number;
  /** Font size for local letters in pixels (default: 18) */
  localFontSize?: number;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "practice" | "test";
  block: "global" | "local";
  trial_index: number;
  global_letter: "H" | "S";
  local_letter: "H" | "S";
  congruency: "congruent" | "incongruent";
  target_letter: "H" | "S";
  response: "H" | "S" | null;
  correct: boolean;
  rt: number | null;
  timeout: boolean;
}

export interface ScoringResult {
  /** Average RT for global trials (ms) */
  globalRT: number | null;
  /** Average RT for local trials (ms) */
  localRT: number | null;
  /** Accuracy for global trials */
  globalAccuracy: number;
  /** Accuracy for local trials */
  localAccuracy: number;
  /** Average RT for congruent trials */
  congruentRT: number | null;
  /** Average RT for incongruent trials */
  incongruentRT: number | null;
  /** Interference effect (incongruent - congruent RT) */
  interferenceEffect: number | null;
  /** Accuracy for congruent trials */
  congruentAccuracy: number;
  /** Accuracy for incongruent trials */
  incongruentAccuracy: number;
  /** Overall accuracy */
  overallAccuracy: number;
  /** Total trials */
  numTrials: number;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  showPractice: boolean;
  numPracticeTrials: number;
  trialsPerBlock: number;
  includeGlobalBlock: boolean;
  includeLocalBlock: boolean;
  fixationDuration: number;
  responseTimeout: number | null;
  showPracticeFeedback: boolean;
  feedbackDuration: number;
  globalSize: number;
  localFontSize: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "global-local";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPractice: true,
  numPracticeTrials: 4,
  trialsPerBlock: 24,
  includeGlobalBlock: true,
  includeLocalBlock: true,
  fixationDuration: 500,
  responseTimeout: 2500,
  showPracticeFeedback: true,
  feedbackDuration: 500,
  globalSize: 180,
  localFontSize: 18,
};

// Letter patterns for H and S (5x5 grid)
const LETTER_PATTERNS: Record<"H" | "S", number[][]> = {
  H: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  S: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
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
 * Creates disabled button HTML for non-response trials.
 * Buttons are visible but non-interactive to prevent layout shifts.
 */
function createDisabledButtonHtml(choice: string): string {
  return `<button class="jspsych-btn" disabled>${choice}</button>`;
}

/**
 * Creates HTML for a Navon figure (large letter made of small letters).
 */
function createNavonFigure(
  globalLetter: "H" | "S",
  localLetter: "H" | "S",
  globalSize: number,
  localFontSize: number
): string {
  const pattern = LETTER_PATTERNS[globalLetter];
  const cellSize = globalSize / 5;

  let html = `<div style="display: inline-grid; grid-template-columns: repeat(5, ${cellSize}px); grid-template-rows: repeat(5, ${cellSize}px); font-family: monospace; font-size: ${localFontSize}px; font-weight: bold; line-height: ${cellSize}px; text-align: center;">`;

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (pattern[row][col] === 1) {
        html += `<div style="display: flex; align-items: center; justify-content: center;">${localLetter}</div>`;
      } else {
        html += `<div></div>`;
      }
    }
  }

  html += `</div>`;
  return html;
}

// -- TRIAL GENERATION --

interface TrialSpec {
  globalLetter: "H" | "S";
  localLetter: "H" | "S";
  congruency: "congruent" | "incongruent";
}

/**
 * Generates trial specifications for a block.
 */
function generateTrials(numTrials: number): TrialSpec[] {
  const trials: TrialSpec[] = [];

  // Create balanced trial types
  const congruentH: TrialSpec = { globalLetter: "H", localLetter: "H", congruency: "congruent" };
  const congruentS: TrialSpec = { globalLetter: "S", localLetter: "S", congruency: "congruent" };
  const incongruentHS: TrialSpec = { globalLetter: "H", localLetter: "S", congruency: "incongruent" };
  const incongruentSH: TrialSpec = { globalLetter: "S", localLetter: "H", congruency: "incongruent" };

  const trialTypes = [congruentH, congruentS, incongruentHS, incongruentSH];
  const trialsPerType = Math.floor(numTrials / 4);

  for (const type of trialTypes) {
    for (let i = 0; i < trialsPerType; i++) {
      trials.push({ ...type });
    }
  }

  // Fill remaining trials
  while (trials.length < numTrials) {
    trials.push({ ...trialTypes[trials.length % 4] });
  }

  return shuffleArray(trials);
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials.
 */
function createInstructionTrials(
  config: ResolvedConfig,
  section: "intro" | "global" | "local" | "practice"
) {
  const timeline: any[] = [];

  let stimulus: string;
  let buttonLabel: string;

  switch (section) {
    case "intro":
      stimulus = config.text.instruction_intro;
      buttonLabel = config.text.continue_button;
      break;
    case "global":
      stimulus = config.text.instruction_global;
      buttonLabel = config.text.start_button;
      break;
    case "local":
      stimulus = config.text.instruction_local;
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

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: stimulus,
    choices: [buttonLabel],
    data: {
      task: TASK_NAME,
      part: "instruction",
    },
  });

  return { timeline };
}

/**
 * Creates a single global-local trial.
 */
function createGlobalLocalTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  trial: TrialSpec,
  block: "global" | "local",
  phase: "practice" | "test",
  trialIndex: number,
  showFeedback: boolean
) {
  const targetLetter = block === "global" ? trial.globalLetter : trial.localLetter;

  const timeline: any[] = [];

  // Fixation cross
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"><p style="font-size: 48px;">+</p></div>`,
    choices: [config.text.letter_h_button, config.text.letter_s_button],
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.fixationDuration,
    data: {
      task: TASK_NAME,
      part: "fixation",
    },
  });

  // Stimulus presentation
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const navon = createNavonFigure(
        trial.globalLetter,
        trial.localLetter,
        config.globalSize,
        config.localFontSize
      );
      const cue = block === "global" ? "LARGE letter" : "SMALL letters";
      return `
        <div class="trial-content" style="flex-direction: column;">
          <div style="margin-bottom: 20px; font-size: 16px; color: #666;">
            Focus on the <strong>${cue}</strong>
          </div>
          ${navon}
        </div>
      `;
    },
    choices: [config.text.letter_h_button, config.text.letter_s_button],
    trial_duration: config.responseTimeout,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      part: "response",
      phase: phase,
      block: block,
      trial_index: trialIndex,
      global_letter: trial.globalLetter,
      local_letter: trial.localLetter,
      congruency: trial.congruency,
      target_letter: targetLetter,
    },
    on_finish: (data: any) => {
      let response: "H" | "S" | null = null;
      let timeout = false;

      if (data.response === null) {
        timeout = true;
      } else {
        response = data.response === 0 ? "H" : "S";
      }

      const correct = !timeout && response === targetLetter;

      jsPsych.data.get().addToLast({
        response: response,
        correct: correct,
        timeout: timeout,
      });
    },
  });

  // Feedback (optional)
  if (showFeedback) {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        const lastData = jsPsych.data.getLastTrialData().values()[0];
        if (lastData.timeout) {
          return `<div class="trial-content"><p class="feedback timeout">${config.text.feedback_timeout}</p></div>`;
        }
        return lastData.correct
          ? `<div class="trial-content"><p class="feedback correct">${config.text.feedback_correct}</p></div>`
          : `<div class="trial-content"><p class="feedback incorrect">${config.text.feedback_incorrect}</p></div>`;
      },
      choices: [config.text.letter_h_button, config.text.letter_s_button],
      button_html: createDisabledButtonHtml,
      response_ends_trial: false,
      trial_duration: config.feedbackDuration,
      data: {
        task: TASK_NAME,
        part: "feedback",
      },
    });
  }

  return { timeline };
}

/**
 * Creates a block of trials.
 */
function createBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  blockType: "global" | "local",
  phase: "practice" | "test"
) {
  const numTrials = phase === "practice" ? config.numPracticeTrials : config.trialsPerBlock;
  const trials = generateTrials(numTrials);
  const showFeedback = phase === "practice" && config.showPracticeFeedback;

  const timeline: any[] = [];

  trials.forEach((trial, i) => {
    timeline.push(
      createGlobalLocalTrial(
        jsPsych,
        config,
        trial,
        blockType,
        phase,
        i + 1,
        showFeedback
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
        scores.globalRT ?? 0,
        scores.localRT ?? 0,
        scores.globalAccuracy,
        scores.localAccuracy,
        scores.congruentRT ?? 0,
        scores.incongruentRT ?? 0
      );
      html += `</div>`;
      return html;
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      part: "completion",
    },
  };
}

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics from the Global-Local task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "response" })
    .values() as TrialData[];

  if (testTrials.length === 0) {
    return {
      globalRT: null,
      localRT: null,
      globalAccuracy: 0,
      localAccuracy: 0,
      congruentRT: null,
      incongruentRT: null,
      interferenceEffect: null,
      congruentAccuracy: 0,
      incongruentAccuracy: 0,
      overallAccuracy: 0,
      numTrials: 0,
    };
  }

  const nonTimeoutTrials = testTrials.filter((t) => !t.timeout);

  // By block
  const globalTrials = nonTimeoutTrials.filter((t) => t.block === "global");
  const localTrials = nonTimeoutTrials.filter((t) => t.block === "local");

  const globalRTs = globalTrials.filter((t) => t.correct).map((t) => t.rt as number);
  const localRTs = localTrials.filter((t) => t.correct).map((t) => t.rt as number);

  const globalRT = globalRTs.length > 0
    ? globalRTs.reduce((a, b) => a + b, 0) / globalRTs.length
    : null;
  const localRT = localRTs.length > 0
    ? localRTs.reduce((a, b) => a + b, 0) / localRTs.length
    : null;

  const globalAccuracy = globalTrials.length > 0
    ? (globalTrials.filter((t) => t.correct).length / globalTrials.length) * 100
    : 0;
  const localAccuracy = localTrials.length > 0
    ? (localTrials.filter((t) => t.correct).length / localTrials.length) * 100
    : 0;

  // By congruency
  const congruentTrials = nonTimeoutTrials.filter((t) => t.congruency === "congruent");
  const incongruentTrials = nonTimeoutTrials.filter((t) => t.congruency === "incongruent");

  const congruentRTs = congruentTrials.filter((t) => t.correct).map((t) => t.rt as number);
  const incongruentRTs = incongruentTrials.filter((t) => t.correct).map((t) => t.rt as number);

  const congruentRT = congruentRTs.length > 0
    ? congruentRTs.reduce((a, b) => a + b, 0) / congruentRTs.length
    : null;
  const incongruentRT = incongruentRTs.length > 0
    ? incongruentRTs.reduce((a, b) => a + b, 0) / incongruentRTs.length
    : null;

  const interferenceEffect =
    congruentRT !== null && incongruentRT !== null
      ? incongruentRT - congruentRT
      : null;

  const congruentAccuracy = congruentTrials.length > 0
    ? (congruentTrials.filter((t) => t.correct).length / congruentTrials.length) * 100
    : 0;
  const incongruentAccuracy = incongruentTrials.length > 0
    ? (incongruentTrials.filter((t) => t.correct).length / incongruentTrials.length) * 100
    : 0;

  const overallAccuracy = nonTimeoutTrials.length > 0
    ? (nonTimeoutTrials.filter((t) => t.correct).length / nonTimeoutTrials.length) * 100
    : 0;

  return {
    globalRT,
    localRT,
    globalAccuracy,
    localAccuracy,
    congruentRT,
    incongruentRT,
    interferenceEffect,
    congruentAccuracy,
    incongruentAccuracy,
    overallAccuracy,
    numTrials: testTrials.length,
  };
}

/**
 * Returns a summary of the Global-Local task performance.
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
 * Creates the complete Global-Local task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const glTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   trialsPerBlock: 24,
 * });
 * jsPsych.run([glTimeline]);
 * ```
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: GlobalLocalOptions = {}
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

  // Global Block
  if (config.includeGlobalBlock) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "global"));
    }
    if (config.showPractice) {
      timeline.push(createInstructionTrials(config, "practice"));
      timeline.push(createBlock(jsPsych, config, "global", "practice"));
    }
    timeline.push(createBlock(jsPsych, config, "global", "test"));
  }

  // Local Block
  if (config.includeLocalBlock) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "local"));
    }
    if (config.showPractice) {
      timeline.push(createInstructionTrials(config, "practice"));
      timeline.push(createBlock(jsPsych, config, "local", "practice"));
    }
    timeline.push(createBlock(jsPsych, config, "local", "test"));
  }

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Global-Local experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createGlobalLocalTrial,
  createBlock,
  createCompletionTrial,
  generateTrials,
  createNavonFigure,
};

/**
 * Utility functions for the Global-Local task.
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
    LETTER_PATTERNS,
  },
  text: defaultText,
};

// Re-export types
export type { TextConfig };
