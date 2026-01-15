import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface OddballOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Total number of trials (default: 100) */
  numTrials?: number;
  /** Proportion of target (oddball) trials (default: 0.2 = 20%) */
  targetProportion?: number;
  /** Stimulus display duration in ms (default: 500) */
  stimulusDuration?: number;
  /** Inter-stimulus interval in ms (default: 1000) */
  isi?: number;
  /** Response timeout in ms - time allowed to respond (default: 1000) */
  responseTimeout?: number;
  /** Show practice trials (default: true) */
  showPractice?: boolean;
  /** Number of practice trials (default: 10) */
  numPracticeTrials?: number;
  /** Feedback duration during practice in ms (default: 1000) */
  feedbackDuration?: number;
  /** Standard stimulus color (default: "#4A90D9" - blue) */
  standardColor?: string;
  /** Target/oddball stimulus color (default: "#D94A4A" - red) */
  targetColor?: string;
  /** Stimulus size in pixels (default: 100) */
  stimulusSize?: number;
  /** Custom text strings for translation */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  trial_type: string;
  trial_index: number;
  stimulus_type: "standard" | "target";
  responded: boolean;
  rt: number | null;
  correct: boolean;
}

export interface ScoringResult {
  /** Number of targets correctly detected (hits) */
  hits: number;
  /** Number of targets presented */
  totalTargets: number;
  /** Hit rate (hits / total targets) */
  hitRate: number;
  /** Number of false alarms (responded to standards) */
  falseAlarms: number;
  /** Number of standards presented */
  totalStandards: number;
  /** False alarm rate (false alarms / total standards) */
  falseAlarmRate: number;
  /** Number of misses (failed to respond to targets) */
  misses: number;
  /** Number of correct rejections (correctly ignored standards) */
  correctRejections: number;
  /** d-prime sensitivity index (null if calculation not possible) */
  dPrime: number | null;
  /** Average reaction time for hits in ms */
  averageRTHits: number | null;
  /** Total accuracy percentage */
  accuracy: number;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  numTrials: number;
  targetProportion: number;
  stimulusDuration: number;
  isi: number;
  responseTimeout: number;
  showPractice: boolean;
  numPracticeTrials: number;
  feedbackDuration: number;
  standardColor: string;
  targetColor: string;
  stimulusSize: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "oddball";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  showInstructions: true,
  numTrials: 100,
  targetProportion: 0.2,
  stimulusDuration: 500,
  isi: 1000,
  responseTimeout: 1000,
  showPractice: true,
  numPracticeTrials: 10,
  feedbackDuration: 1000,
  standardColor: "#4A90D9",
  targetColor: "#D94A4A",
  stimulusSize: 100,
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
 * Generates trial sequence with specified target proportion.
 */
function generateTrialSequence(
  numTrials: number,
  targetProportion: number
): Array<"standard" | "target"> {
  const numTargets = Math.round(numTrials * targetProportion);
  const numStandards = numTrials - numTargets;

  const sequence: Array<"standard" | "target"> = [
    ...Array(numTargets).fill("target"),
    ...Array(numStandards).fill("standard"),
  ];

  return shuffleArray(sequence);
}

/**
 * Creates disabled button HTML for non-response trials.
 * Buttons are visible but non-interactive to prevent layout shifts.
 */
function createDisabledButtonHtml(choice: string): string {
  return `<button class="jspsych-btn" disabled>${choice}</button>`;
}

/**
 * Creates CSS for the stimulus circle.
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
 * Calculates d-prime from hit rate and false alarm rate.
 * Applies correction for extreme values (0 or 1).
 */
function calculateDPrime(
  hitRate: number,
  falseAlarmRate: number,
  nTargets: number,
  nStandards: number
): number | null {
  if (nTargets === 0 || nStandards === 0) {
    return null;
  }

  // Apply log-linear correction for extreme values
  let adjustedHitRate = hitRate;
  let adjustedFARate = falseAlarmRate;

  // Correction: (hits + 0.5) / (targets + 1)
  if (hitRate === 0 || hitRate === 1) {
    const hits = hitRate * nTargets;
    adjustedHitRate = (hits + 0.5) / (nTargets + 1);
  }

  if (falseAlarmRate === 0 || falseAlarmRate === 1) {
    const fa = falseAlarmRate * nStandards;
    adjustedFARate = (fa + 0.5) / (nStandards + 1);
  }

  // Calculate z-scores using approximation of inverse normal CDF
  const zHit = inverseNormalCDF(adjustedHitRate);
  const zFA = inverseNormalCDF(adjustedFARate);

  return zHit - zFA;
}

/**
 * Approximation of inverse normal CDF (probit function).
 * Uses Abramowitz and Stegun approximation.
 */
function inverseNormalCDF(p: number): number {
  // Clamp p to avoid edge cases
  p = Math.max(0.0001, Math.min(0.9999, p));

  const a1 = -3.969683028665376e1;
  const a2 = 2.209460984245205e2;
  const a3 = -2.759285104469687e2;
  const a4 = 1.383577518672690e2;
  const a5 = -3.066479806614716e1;
  const a6 = 2.506628277459239e0;

  const b1 = -5.447609879822406e1;
  const b2 = 1.615858368580409e2;
  const b3 = -1.556989798598866e2;
  const b4 = 6.680131188771972e1;
  const b5 = -1.328068155288572e1;

  const c1 = -7.784894002430293e-3;
  const c2 = -3.223964580411365e-1;
  const c3 = -2.400758277161838e0;
  const c4 = -2.549732539343734e0;
  const c5 = 4.374664141464968e0;
  const c6 = 2.938163982698783e0;

  const d1 = 7.784695709041462e-3;
  const d2 = 3.224671290700398e-1;
  const d3 = 2.445134137142996e0;
  const d4 = 3.754408661907416e0;

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  }
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials.
 */
function createInstructionTrials(
  config: ResolvedConfig,
  part: "intro" | "practice" | "main"
) {
  let stimulus: string;
  let buttonLabel: string;

  switch (part) {
    case "intro":
      stimulus = config.text.instruction_intro;
      buttonLabel = config.text.continue_button;
      break;
    case "practice":
      stimulus = config.text.instruction_practice;
      buttonLabel = config.text.start_button;
      break;
    case "main":
      stimulus = config.text.instruction_main;
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
 * Creates a single oddball trial.
 */
function createOddballTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  stimulusType: "standard" | "target",
  trialIndex: number,
  isPractice: boolean
) {
  const timeline: any[] = [];

  // Fixation cross / ISI
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"><p style="font-size: 48px;">+</p></div>`,
    choices: [config.text.respond_button],
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.isi,
    data: {
      task: TASK_NAME,
      trial_type: "fixation",
    },
  });

  // Stimulus
  const isTarget = stimulusType === "target";
  const stimulusColor = isTarget ? config.targetColor : config.standardColor;
  const stimulusHTML = createStimulusHTML(stimulusColor, config.stimulusSize);

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: stimulusHTML,
    choices: [config.text.respond_button],
    trial_duration: config.stimulusDuration + config.responseTimeout,
    response_ends_trial: true,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_type: isPractice ? "practice" : "response",
      trial_index: trialIndex,
      stimulus_type: stimulusType,
    },
    on_finish: (data: any) => {
      const responded = data.response !== null;
      const correct = isTarget ? responded : !responded;

      jsPsych.data.get().addToLast({
        responded: responded,
        correct: correct,
      });
    },
  });

  // Feedback (practice only)
  if (isPractice) {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        const lastData = jsPsych.data.getLastTrialData().values()[0];
        const responded = lastData.responded;
        const isTargetTrial = lastData.stimulus_type === "target";

        if (isTargetTrial && responded) {
          return `<div class="trial-content"><p class="feedback correct">${config.text.feedback_hit}</p></div>`;
        } else if (isTargetTrial && !responded) {
          return `<div class="trial-content"><p class="feedback incorrect">${config.text.feedback_miss}</p></div>`;
        } else if (!isTargetTrial && responded) {
          return `<div class="trial-content"><p class="feedback incorrect">${config.text.feedback_false_alarm}</p></div>`;
        } else {
          return `<div class="trial-content"><p class="feedback correct">${config.text.feedback_correct_rejection}</p></div>`;
        }
      },
      choices: [config.text.respond_button],
      button_html: createDisabledButtonHtml,
      response_ends_trial: false,
      trial_duration: config.feedbackDuration,
      data: {
        task: TASK_NAME,
        trial_type: "feedback",
      },
    });
  }

  return { timeline };
}

/**
 * Creates a block of oddball trials.
 */
function createOddballBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  numTrials: number,
  isPractice: boolean
) {
  const sequence = generateTrialSequence(numTrials, config.targetProportion);
  const timeline: any[] = [];

  sequence.forEach((stimulusType, index) => {
    timeline.push(
      createOddballTrial(jsPsych, config, stimulusType, index + 1, isPractice)
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
        scores.hitRate,
        scores.falseAlarmRate,
        scores.dPrime,
        scores.averageRTHits
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
 * Calculates scoring metrics from the Oddball task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const responseTrials = data
    .filter({ task: TASK_NAME, trial_type: "response" })
    .values() as TrialData[];

  if (responseTrials.length === 0) {
    return {
      hits: 0,
      totalTargets: 0,
      hitRate: 0,
      falseAlarms: 0,
      totalStandards: 0,
      falseAlarmRate: 0,
      misses: 0,
      correctRejections: 0,
      dPrime: null,
      averageRTHits: null,
      accuracy: 0,
    };
  }

  const targetTrials = responseTrials.filter((t) => t.stimulus_type === "target");
  const standardTrials = responseTrials.filter((t) => t.stimulus_type === "standard");

  const hits = targetTrials.filter((t) => t.responded).length;
  const misses = targetTrials.filter((t) => !t.responded).length;
  const falseAlarms = standardTrials.filter((t) => t.responded).length;
  const correctRejections = standardTrials.filter((t) => !t.responded).length;

  const totalTargets = targetTrials.length;
  const totalStandards = standardTrials.length;

  const hitRate = totalTargets > 0 ? hits / totalTargets : 0;
  const falseAlarmRate = totalStandards > 0 ? falseAlarms / totalStandards : 0;

  // Calculate d-prime
  const dPrime = calculateDPrime(hitRate, falseAlarmRate, totalTargets, totalStandards);

  // Average RT for hits
  const hitRTs = targetTrials
    .filter((t) => t.responded && t.rt !== null)
    .map((t) => t.rt as number);
  const averageRTHits = hitRTs.length > 0
    ? hitRTs.reduce((a, b) => a + b, 0) / hitRTs.length
    : null;

  // Total accuracy
  const totalCorrect = hits + correctRejections;
  const accuracy = (totalCorrect / responseTrials.length) * 100;

  return {
    hits,
    totalTargets,
    hitRate,
    falseAlarms,
    totalStandards,
    falseAlarmRate,
    misses,
    correctRejections,
    dPrime,
    averageRTHits,
    accuracy,
  };
}

/**
 * Returns a summary of the Oddball task performance.
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
 * Creates the complete Oddball task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const oddballTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   numTrials: 100,
 *   targetProportion: 0.2,
 * });
 * jsPsych.run([oddballTimeline]);
 * ```
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: OddballOptions = {}
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
    timeline.push(
      createOddballBlock(jsPsych, config, config.numPracticeTrials, true)
    );
  }

  // Main task
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "main"));
  }
  timeline.push(createOddballBlock(jsPsych, config, config.numTrials, false));

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Oddball experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createOddballTrial,
  createOddballBlock,
  createCompletionTrial,
  generateTrialSequence,
  createStimulusHTML,
};

/**
 * Utility functions for the Oddball task.
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
