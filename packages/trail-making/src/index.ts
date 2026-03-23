import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychTrailMaking from "@jspsych-contrib/plugin-trail-making";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface TrailMakingOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Include practice trials before each part (default: true) */
  showPractice?: boolean;
  /** Number of targets in practice trials (default: 5) */
  practiceTargets?: number;
  /** Number of targets in Part A (default: 25) */
  numTargetsPartA?: number;
  /** Number of targets in Part B (default: 24, should be even) */
  numTargetsPartB?: number;
  /** Canvas width in pixels (default: 600) */
  canvasWidth?: number;
  /** Canvas height in pixels (default: 600) */
  canvasHeight?: number;
  /** Target circle radius in pixels (default: 25) */
  targetRadius?: number;
  /** Minimum distance between targets in pixels (default: 80) */
  minSeparation?: number;
  /** Random seed for Part A layout (default: null = random) */
  seedPartA?: number | null;
  /** Random seed for Part B layout (default: null = random) */
  seedPartB?: number | null;
  /** Skip Part A and only run Part B (default: false) */
  skipPartA?: boolean;
  /** Skip Part B and only run Part A (default: false) */
  skipPartB?: boolean;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  part: "A" | "B";
  phase: "practice" | "test";
  test_type: string;
  targets: Array<{ x: number; y: number; label: string }>;
  clicks: Array<{
    target_index: number | null;
    label: string | null;
    time: number;
    x: number;
    y: number;
    correct: boolean;
  }>;
  completion_time: number;
  num_errors: number;
  total_path_distance: number;
  inter_click_times: number[];
}

export interface ScoringResult {
  partA: {
    completionTime: number | null;
    numErrors: number;
    pathDistance: number | null;
    meanInterClickTime: number | null;
  } | null;
  partB: {
    completionTime: number | null;
    numErrors: number;
    pathDistance: number | null;
    meanInterClickTime: number | null;
  } | null;
  /** Part B time minus Part A time (measure of task-switching cost) */
  differenceScore: number | null;
  /** Part B time divided by Part A time */
  ratioScore: number | null;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  showPractice: boolean;
  practiceTargets: number;
  numTargetsPartA: number;
  numTargetsPartB: number;
  canvasWidth: number;
  canvasHeight: number;
  targetRadius: number;
  minSeparation: number;
  seedPartA: number | null;
  seedPartB: number | null;
  skipPartA: boolean;
  skipPartB: boolean;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "trail-making";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPractice: true,
  practiceTargets: 5,
  numTargetsPartA: 25,
  numTargetsPartB: 24,
  canvasWidth: 600,
  canvasHeight: 600,
  targetRadius: 25,
  minSeparation: 80,
  seedPartA: null,
  seedPartB: null,
  skipPartA: false,
  skipPartB: false,
};

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials for the trail making task.
 */
function createInstructionTrials(config: ResolvedConfig, part: "intro" | "A" | "B") {
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
  } else if (part === "A") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_part_a,
      choices: [config.text.continue_button],
      data: {
        task: TASK_NAME,
        phase: "instructions",
        part: "instruction",
      },
    });
  } else if (part === "B") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_part_b,
      choices: [config.text.continue_button],
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
 * Creates a practice instruction screen.
 */
function createPracticeInstructions(config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_practice,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  };
}

/**
 * Creates a speed reminder screen.
 */
function createSpeedReminder(config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_speed,
    choices: [config.text.start_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  };
}

/**
 * Creates a trail-making trial using the plugin.
 */
function createTrailTrial(
  config: ResolvedConfig,
  part: "A" | "B",
  phase: "practice" | "test"
) {
  const isPractice = phase === "practice";
  const testType = part === "A" ? "A" : "B";
  const numTargets = isPractice
    ? config.practiceTargets
    : part === "A"
    ? config.numTargetsPartA
    : config.numTargetsPartB;
  const seed = part === "A" ? config.seedPartA : config.seedPartB;

  return {
    type: jsPsychTrailMaking,
    test_type: testType,
    num_targets: numTargets,
    canvas_width: config.canvasWidth,
    canvas_height: config.canvasHeight,
    target_radius: config.targetRadius,
    min_separation: config.minSeparation,
    seed: isPractice ? (seed !== null ? seed + 1000 : null) : seed,
    prompt: isPractice
      ? part === "A"
        ? config.text.practice_part_a_prompt
        : config.text.practice_part_b_prompt
      : part === "A"
      ? config.text.part_a_prompt
      : config.text.part_b_prompt,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      part: part,
      phase: phase,
    },
  };
}

/**
 * Creates a transition screen between parts.
 */
function createTransitionTrial(message: string, buttonLabel: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div style="max-width: 600px; margin: 0 auto;"><p>${message}</p></div>`,
    choices: [buttonLabel],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "transition",
    },
  };
}

/**
 * Creates a completion screen showing results.
 */
function createCompletionTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig
) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const data = jsPsych.data.get();
      const scores = calculateScores(data);

      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += `<h2>${config.text.task_complete}</h2>`;
      html += config.text.result_summary(
        scores.partA?.completionTime ?? null,
        scores.partB?.completionTime ?? null,
        scores.differenceScore
      );
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
 * Calculates scoring metrics from the trail making task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test" })
    .values() as TrialData[];

  const partATrials = testTrials.filter((t) => t.part === "A");
  const partBTrials = testTrials.filter((t) => t.part === "B");

  let partA: ScoringResult["partA"] = null;
  let partB: ScoringResult["partB"] = null;

  if (partATrials.length > 0) {
    const trial = partATrials[0];
    partA = {
      completionTime: trial.completion_time,
      numErrors: trial.num_errors,
      pathDistance: trial.total_path_distance,
      meanInterClickTime: mean(trial.inter_click_times),
    };
  }

  if (partBTrials.length > 0) {
    const trial = partBTrials[0];
    partB = {
      completionTime: trial.completion_time,
      numErrors: trial.num_errors,
      pathDistance: trial.total_path_distance,
      meanInterClickTime: mean(trial.inter_click_times),
    };
  }

  // Calculate derived scores
  let differenceScore: number | null = null;
  let ratioScore: number | null = null;

  if (
    partA !== null &&
    partB !== null &&
    partA.completionTime !== null &&
    partB.completionTime !== null
  ) {
    differenceScore = partB.completionTime - partA.completionTime;
    ratioScore = partB.completionTime / partA.completionTime;
  }

  return {
    partA,
    partB,
    differenceScore,
    ratioScore,
  };
}

/**
 * Returns a summary of the trail making task performance.
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
 * Creates the complete Trail Making Test timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const tmtTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   showPractice: true,
 * });
 * jsPsych.run([tmtTimeline]);
 * ```
 *
 * @example
 * // Run only Part B
 * const timeline = createTimeline(jsPsych, { skipPartA: true });
 *
 * @example
 * // With Spanish translation
 * const spanishText = {
 *   continue_button: "Continuar",
 *   instruction_intro: "<p>En esta tarea, conectará círculos en orden...</p>",
 * };
 * const timeline = createTimeline(jsPsych, { text: spanishText });
 */
export function createTimeline(jsPsych: JsPsych, options: TrailMakingOptions = {}) {
  // Merge text with defaults
  const text: TextConfig = { ...defaultText, ...options.text };

  // Auto-scale canvas to fit viewport if user hasn't set explicit dimensions
  let resolvedOptions = { ...options };
  if (options.canvasWidth === undefined && options.canvasHeight === undefined) {
    const vw = typeof window !== "undefined" ? window.innerWidth : 600;
    const vh = typeof window !== "undefined" ? window.innerHeight : 600;
    // Use the smaller dimension, leave room for prompt text and padding
    const maxSize = Math.min(600, vw - 32, vh - 120);
    if (maxSize < 600) {
      const scale = maxSize / 600;
      resolvedOptions.canvasWidth = maxSize;
      resolvedOptions.canvasHeight = maxSize;
      if (options.targetRadius === undefined) {
        resolvedOptions.targetRadius = Math.round(25 * scale);
      }
      if (options.minSeparation === undefined) {
        resolvedOptions.minSeparation = Math.round(80 * scale);
      }
    }
  }

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...resolvedOptions,
    text,
  };

  const timeline: any[] = [];

  // Instructions intro
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "intro"));
  }

  // Part A
  if (!config.skipPartA) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "A"));
    }

    if (config.showPractice) {
      timeline.push(createPracticeInstructions(config));
      timeline.push(createTrailTrial(config, "A", "practice"));
      timeline.push(
        createTransitionTrial(
          config.text.practice_complete,
          config.text.continue_button
        )
      );
    }

    timeline.push(createSpeedReminder(config));
    timeline.push(createTrailTrial(config, "A", "test"));

    if (!config.skipPartB) {
      timeline.push(
        createTransitionTrial(
          config.text.part_a_complete,
          config.text.continue_button
        )
      );
    }
  }

  // Part B
  if (!config.skipPartB) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "B"));
    }

    if (config.showPractice) {
      timeline.push(createPracticeInstructions(config));
      timeline.push(createTrailTrial(config, "B", "practice"));
      timeline.push(
        createTransitionTrial(
          config.text.practice_complete,
          config.text.continue_button
        )
      );
    }

    timeline.push(createSpeedReminder(config));
    timeline.push(createTrailTrial(config, "B", "test"));
  }

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom trail making experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createPracticeInstructions,
  createSpeedReminder,
  createTrailTrial,
  createTransitionTrial,
  createCompletionTrial,
};

/**
 * Utility functions for the trail making task.
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
