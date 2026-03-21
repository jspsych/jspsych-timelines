import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychPursuitRotor from "@jspsych-contrib/plugin-pursuit-rotor";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface PursuitRotorOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Include practice trial before main task (default: true) */
  showPractice?: boolean;
  /** Duration of practice trial in ms (default: 5000) */
  practiceDuration?: number;
  /** Number of test trials (default: 4) */
  numTrials?: number;
  /** Duration of each test trial in ms (default: 15000) */
  trialDuration?: number;
  /** Radius of circular path in pixels (default: 150) */
  pathRadius?: number;
  /** Radius of target circle in pixels (default: 25) */
  targetRadius?: number;
  /** Rotation speed in rotations per second (default: 0.125) */
  rotationSpeed?: number;
  /** Direction of rotation: 'clockwise' or 'counterclockwise' (default: 'clockwise') */
  rotationDirection?: "clockwise" | "counterclockwise";
  /** Canvas width in pixels (default: 500) */
  canvasWidth?: number;
  /** Canvas height in pixels (default: 500) */
  canvasHeight?: number;
  /** Whether to show the circular path guide (default: true) */
  showPath?: boolean;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "practice" | "test";
  trial_index: number;
  time_on_target: number;
  percent_on_target: number;
  mean_deviation: number | null;
  trial_duration: number;
  samples: Array<{
    time: number;
    target_x: number;
    target_y: number;
    cursor_x: number | null;
    cursor_y: number | null;
    on_target: boolean;
    deviation: number | null;
  }>;
}

export interface ScoringResult {
  /** Average percent time on target across all test trials */
  averagePercentOnTarget: number;
  /** Average mean deviation from target center */
  averageMeanDeviation: number | null;
  /** Total time on target across all test trials (ms) */
  totalTimeOnTarget: number;
  /** Total trial time (ms) */
  totalTrialTime: number;
  /** Percent on target for each trial */
  trialPerformance: number[];
  /** Improvement from first to last trial (percentage points) */
  improvement: number | null;
  /** Learning curve slope (positive = improvement) */
  learningSlope: number | null;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  showPractice: boolean;
  practiceDuration: number;
  numTrials: number;
  trialDuration: number;
  pathRadius: number;
  targetRadius: number;
  rotationSpeed: number;
  rotationDirection: "clockwise" | "counterclockwise";
  canvasWidth: number;
  canvasHeight: number;
  showPath: boolean;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "pursuit-rotor";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPractice: true,
  practiceDuration: 5000,
  numTrials: 4,
  trialDuration: 15000,
  pathRadius: 150,
  targetRadius: 25,
  rotationSpeed: 0.125,
  rotationDirection: "clockwise" as const,
  canvasWidth: 500,
  canvasHeight: 500,
  showPath: true,
};

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function linearRegression(y: number[]): { slope: number; intercept: number } | null {
  if (y.length < 2) return null;
  const x = y.map((_, i) => i);
  const n = y.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials for the Pursuit Rotor task.
 */
function createInstructionTrials(config: ResolvedConfig, part: "intro" | "task" | "practice" | "test") {
  const timeline: any[] = [];

  if (part === "intro") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_intro,
      choices: [config.text.continue_button],
      data: {
        task: TASK_NAME,
        phase: "instructions",
        part: "instruction",
      },
    });
  } else if (part === "task") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_task,
      choices: [config.text.continue_button],
      data: {
        task: TASK_NAME,
        phase: "instructions",
        part: "instruction",
      },
    });
  } else if (part === "practice") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_practice,
      choices: [config.text.start_button],
      data: {
        task: TASK_NAME,
        phase: "instructions",
        part: "instruction",
      },
    });
  } else if (part === "test") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_test,
      choices: [config.text.start_button],
      data: {
        task: TASK_NAME,
        phase: "instructions",
        part: "instruction",
      },
    });
  }

  return { timeline };
}

/**
 * Creates a pursuit rotor trial.
 */
function createRotorTrial(
  config: ResolvedConfig,
  phase: "practice" | "test",
  trialIndex: number,
  totalTrials: number
) {
  const duration = phase === "practice" ? config.practiceDuration : config.trialDuration;

  return {
    type: jsPsychPursuitRotor,
    trial_duration: duration,
    path_radius: config.pathRadius,
    target_radius: config.targetRadius,
    rotation_speed: config.rotationSpeed,
    rotation_direction: config.rotationDirection,
    canvas_width: config.canvasWidth,
    canvas_height: config.canvasHeight,
    show_path: config.showPath,
    prompt: config.text.trial_prompt(trialIndex, totalTrials),
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: phase,
      trial_index: trialIndex,
    },
  };
}

/**
 * Creates a practice feedback trial.
 */
function createPracticeFeedback(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const data = jsPsych.data.getLastTrialData().values()[0];
      return config.text.practice_feedback(data.percent_on_target);
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "practice",
      part: "feedback",
    },
  };
}

/**
 * Creates a completion screen showing results.
 */
function createCompletionTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const data = jsPsych.data.get();
      const scores = calculateScores(data);

      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += `<h2>${config.text.task_complete}</h2>`;
      html += config.text.result_summary(scores.averagePercentOnTarget, scores.improvement);
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
 * Calculates scoring metrics from the Pursuit Rotor task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test" })
    .values() as TrialData[];

  const trialPerformance = testTrials.map((t) => t.percent_on_target);
  const timeOnTargets = testTrials.map((t) => t.time_on_target);
  const trialDurations = testTrials.map((t) => t.trial_duration);
  const deviations = testTrials
    .map((t) => t.mean_deviation)
    .filter((d): d is number => d !== null);

  const averagePercentOnTarget = mean(trialPerformance) ?? 0;
  const averageMeanDeviation = mean(deviations);
  const totalTimeOnTarget = timeOnTargets.reduce((a, b) => a + b, 0);
  const totalTrialTime = trialDurations.reduce((a, b) => a + b, 0);

  // Calculate improvement (last - first)
  let improvement: number | null = null;
  if (trialPerformance.length >= 2) {
    improvement =
      trialPerformance[trialPerformance.length - 1] - trialPerformance[0];
  }

  // Calculate learning slope
  const regression = linearRegression(trialPerformance);
  const learningSlope = regression?.slope ?? null;

  return {
    averagePercentOnTarget,
    averageMeanDeviation,
    totalTimeOnTarget,
    totalTrialTime,
    trialPerformance,
    improvement,
    learningSlope,
  };
}

/**
 * Returns a summary of the Pursuit Rotor task performance.
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
 * Creates the complete Pursuit Rotor task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const prTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   numTrials: 4,
 * });
 * jsPsych.run([prTimeline]);
 * ```
 *
 * @example
 * // Faster rotation, more trials
 * const timeline = createTimeline(jsPsych, {
 *   rotationSpeed: 0.2,
 *   numTrials: 8,
 * });
 */
export function createTimeline(jsPsych: JsPsych, options: PursuitRotorOptions = {}) {
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
    timeline.push(createInstructionTrials(config, "intro"));
    timeline.push(createInstructionTrials(config, "task"));
  }

  // Practice
  if (config.showPractice) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "practice"));
    }
    timeline.push(createRotorTrial(config, "practice", 1, 1));
    timeline.push(createPracticeFeedback(jsPsych, config));
  }

  // Test trials
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "test"));
  }

  for (let i = 0; i < config.numTrials; i++) {
    timeline.push(createRotorTrial(config, "test", i + 1, config.numTrials));
  }

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Pursuit Rotor experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createRotorTrial,
  createPracticeFeedback,
  createCompletionTrial,
};

/**
 * Utility functions for the Pursuit Rotor task.
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
