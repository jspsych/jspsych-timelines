import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface MentalRotationOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Include practice trials before main task (default: true) */
  showPractice?: boolean;
  /** Number of practice trials (default: 4) */
  numPracticeTrials?: number;
  /** Number of trials per condition (same/different) (default: 10) */
  trialsPerCondition?: number;
  /** Grid size (default: 6 for 6x6 grid) */
  gridSize?: number;
  /** Cell size in pixels (default: 40) */
  cellSize?: number;
  /** Show feedback during practice (default: true) */
  showPracticeFeedback?: boolean;
  /** Feedback duration in ms (default: 800) */
  feedbackDuration?: number;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "practice" | "test";
  trial_index: number;
  condition: "same" | "different";
  rotation_direction: "left" | "right";
  study_matrix: number[][];
  test_matrix: number[][];
  response: "same" | "different";
  correct: boolean;
  rt: number;
  study_rt: number;
}

export interface ScoringResult {
  /** Overall accuracy (percentage) */
  accuracy: number;
  /** Accuracy on "same" trials */
  sameAccuracy: number;
  /** Accuracy on "different" trials */
  differentAccuracy: number;
  /** Average response time (ms) */
  averageRT: number;
  /** Average RT for correct trials */
  averageRTCorrect: number | null;
  /** Number of correct responses */
  numCorrect: number;
  /** Total number of trials */
  numTrials: number;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  showPractice: boolean;
  numPracticeTrials: number;
  trialsPerCondition: number;
  gridSize: number;
  cellSize: number;
  showPracticeFeedback: boolean;
  feedbackDuration: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "mental-rotation";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPractice: true,
  numPracticeTrials: 4,
  trialsPerCondition: 10,
  gridSize: 6,
  cellSize: 40,
  showPracticeFeedback: true,
  feedbackDuration: 800,
};

// -- MATRIX GENERATION UTILITIES --

/**
 * Generates a random permutation of numbers 0 to n-1
 */
function shuffleArray(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Checks if a permutation is trivially sequential or reverse sequential
 */
function isValidPermutation(perm: number[]): boolean {
  const n = perm.length;
  const sequential = Array.from({ length: n }, (_, i) => i);
  const reverseSequential = [...sequential].reverse();

  const isSequential = perm.every((v, i) => v === sequential[i]);
  const isReverse = perm.every((v, i) => v === reverseSequential[i]);

  return !isSequential && !isReverse;
}

/**
 * Generates a valid matrix pattern (one filled cell per row, non-trivial arrangement)
 * Returns a 2D array where 1 indicates filled cell, 0 indicates empty
 */
function generateMatrix(size: number): number[][] {
  let perm: number[];
  do {
    perm = shuffleArray(size);
  } while (!isValidPermutation(perm));

  // Create matrix with one filled cell per row based on permutation
  const matrix: number[][] = [];
  for (let row = 0; row < size; row++) {
    const rowArr = new Array(size).fill(0);
    rowArr[perm[row]] = 1;
    matrix.push(rowArr);
  }
  return matrix;
}

/**
 * Rotates a matrix 90 degrees to the left (counterclockwise)
 */
function rotateLeft(matrix: number[][]): number[][] {
  const n = matrix.length;
  const rotated: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push(matrix[j][n - 1 - i]);
    }
    rotated.push(row);
  }
  return rotated;
}

/**
 * Rotates a matrix 90 degrees to the right (clockwise)
 */
function rotateRight(matrix: number[][]): number[][] {
  const n = matrix.length;
  const rotated: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push(matrix[n - 1 - j][i]);
    }
    rotated.push(row);
  }
  return rotated;
}

/**
 * Generates a different matrix (not equal to the original when rotated)
 */
function generateDifferentMatrix(original: number[][], size: number): number[][] {
  let different: number[][];
  let rotatedLeft: number[][];
  let rotatedRight: number[][];

  do {
    different = generateMatrix(size);
    rotatedLeft = rotateLeft(different);
    rotatedRight = rotateRight(different);
  } while (
    matricesEqual(different, original) ||
    matricesEqual(rotatedLeft, original) ||
    matricesEqual(rotatedRight, original)
  );

  return different;
}

/**
 * Checks if two matrices are equal
 */
function matricesEqual(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
}

/**
 * Renders a matrix as HTML table
 */
function renderMatrix(matrix: number[][], cellSize: number): string {
  const size = matrix.length;
  const totalSize = size * cellSize;

  let html = `<table style="border-collapse: collapse; margin: 20px auto; background: #e0e0e0;">`;

  for (let row = 0; row < size; row++) {
    html += `<tr>`;
    for (let col = 0; col < size; col++) {
      const filled = matrix[row][col] === 1;
      const bgColor = filled ? "#ff6600" : "#e0e0e0";
      html += `<td style="width: ${cellSize}px; height: ${cellSize}px; border: 1px solid black; background: ${bgColor};"></td>`;
    }
    html += `</tr>`;
  }

  html += `</table>`;
  return html;
}

// -- TRIAL GENERATION --

interface TrialSpec {
  condition: "same" | "different";
  direction: "left" | "right";
  studyMatrix: number[][];
  testMatrix: number[][];
}

/**
 * Generates trial specifications for the task
 */
function generateTrials(
  numSame: number,
  numDifferent: number,
  gridSize: number
): TrialSpec[] {
  const trials: TrialSpec[] = [];

  // Generate "same" trials
  for (let i = 0; i < numSame; i++) {
    const studyMatrix = generateMatrix(gridSize);
    const direction: "left" | "right" = Math.random() < 0.5 ? "left" : "right";
    const testMatrix = direction === "left"
      ? rotateLeft(studyMatrix)
      : rotateRight(studyMatrix);

    trials.push({
      condition: "same",
      direction,
      studyMatrix,
      testMatrix,
    });
  }

  // Generate "different" trials
  for (let i = 0; i < numDifferent; i++) {
    const studyMatrix = generateMatrix(gridSize);
    const direction: "left" | "right" = Math.random() < 0.5 ? "left" : "right";
    const differentMatrix = generateDifferentMatrix(studyMatrix, gridSize);
    // Rotate the different matrix to make it look like a rotated version
    const testMatrix = direction === "left"
      ? rotateLeft(differentMatrix)
      : rotateRight(differentMatrix);

    trials.push({
      condition: "different",
      direction,
      studyMatrix,
      testMatrix,
    });
  }

  // Shuffle trials
  for (let i = trials.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [trials[i], trials[j]] = [trials[j], trials[i]];
  }

  return trials;
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials for the Mental Rotation task.
 */
function createInstructionTrials(
  config: ResolvedConfig,
  part: "intro" | "task" | "practice" | "test"
) {
  const timeline: any[] = [];

  if (part === "intro") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_intro,
      choices: [config.text.continue_button],
      data: {
        task: TASK_NAME,
        trial_part: "instruction",
      },
    });
  } else if (part === "task") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_task,
      choices: [config.text.continue_button],
      data: {
        task: TASK_NAME,
        trial_part: "instruction",
      },
    });
  } else if (part === "practice") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_practice,
      choices: [config.text.start_button],
      data: {
        task: TASK_NAME,
        trial_part: "instruction",
      },
    });
  } else if (part === "test") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_test,
      choices: [config.text.start_button],
      data: {
        task: TASK_NAME,
        trial_part: "instruction",
      },
    });
  }

  return { timeline };
}

/**
 * Creates a single rotation trial (study + test phases)
 */
function createRotationTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  trial: TrialSpec,
  phase: "practice" | "test",
  trialIndex: number,
  showFeedback: boolean
) {
  const timeline: any[] = [];

  // Study phase - show original matrix
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += config.text.study_prompt;
      html += renderMatrix(trial.studyMatrix, config.cellSize);
      html += `</div>`;
      return html;
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      trial_part: "study",
      phase: phase,
      trial_index: trialIndex,
    },
    on_finish: (data: any) => {
      // Store study RT for later
      jsPsych.data.get().addToLast({ study_rt: data.rt });
    },
  });

  // Test phase - show rotated/different matrix
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += config.text.test_prompt(trial.direction);
      html += renderMatrix(trial.testMatrix, config.cellSize);
      html += `</div>`;
      return html;
    },
    choices: [config.text.same_button, config.text.different_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_part: "response",
      phase: phase,
      trial_index: trialIndex,
      condition: trial.condition,
      rotation_direction: trial.direction,
      study_matrix: trial.studyMatrix,
      test_matrix: trial.testMatrix,
    },
    on_finish: (data: any) => {
      const response = data.response === 0 ? "same" : "different";
      const correct = response === trial.condition;
      jsPsych.data.get().addToLast({
        response: response,
        correct: correct,
      });
    },
  });

  // Feedback (optional)
  if (showFeedback) {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        const lastData = jsPsych.data.getLastTrialData().values()[0];
        return lastData.correct
          ? config.text.feedback_correct
          : config.text.feedback_incorrect;
      },
      choices: [],
      trial_duration: config.feedbackDuration,
      data: {
        task: TASK_NAME,
        trial_part: "feedback",
      },
    });
  }

  return { timeline };
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
      html += config.text.result_summary(scores.accuracy, scores.averageRT);
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
 * Calculates scoring metrics from the Mental Rotation task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test", trial_part: "response" })
    .values() as TrialData[];

  if (testTrials.length === 0) {
    return {
      accuracy: 0,
      sameAccuracy: 0,
      differentAccuracy: 0,
      averageRT: 0,
      averageRTCorrect: null,
      numCorrect: 0,
      numTrials: 0,
    };
  }

  const numCorrect = testTrials.filter((t) => t.correct).length;
  const accuracy = (numCorrect / testTrials.length) * 100;

  const sameTrials = testTrials.filter((t) => t.condition === "same");
  const sameCorrect = sameTrials.filter((t) => t.correct).length;
  const sameAccuracy = sameTrials.length > 0
    ? (sameCorrect / sameTrials.length) * 100
    : 0;

  const diffTrials = testTrials.filter((t) => t.condition === "different");
  const diffCorrect = diffTrials.filter((t) => t.correct).length;
  const differentAccuracy = diffTrials.length > 0
    ? (diffCorrect / diffTrials.length) * 100
    : 0;

  const rts = testTrials.map((t) => t.rt);
  const averageRT = rts.reduce((a, b) => a + b, 0) / rts.length;

  const correctRTs = testTrials.filter((t) => t.correct).map((t) => t.rt);
  const averageRTCorrect = correctRTs.length > 0
    ? correctRTs.reduce((a, b) => a + b, 0) / correctRTs.length
    : null;

  return {
    accuracy,
    sameAccuracy,
    differentAccuracy,
    averageRT,
    averageRTCorrect,
    numCorrect,
    numTrials: testTrials.length,
  };
}

/**
 * Returns a summary of the Mental Rotation task performance.
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
 * Creates the complete Mental Rotation task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const mrTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   trialsPerCondition: 10,
 * });
 * jsPsych.run([mrTimeline]);
 * ```
 *
 * @example
 * // Larger grid, more trials
 * const timeline = createTimeline(jsPsych, {
 *   gridSize: 8,
 *   trialsPerCondition: 15,
 * });
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: MentalRotationOptions = {}
) {
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

  // Practice trials
  if (config.showPractice) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "practice"));
    }

    const practiceTrials = generateTrials(
      Math.ceil(config.numPracticeTrials / 2),
      Math.floor(config.numPracticeTrials / 2),
      config.gridSize
    );

    practiceTrials.forEach((trial, i) => {
      timeline.push(
        createRotationTrial(
          jsPsych,
          config,
          trial,
          "practice",
          i + 1,
          config.showPracticeFeedback
        )
      );
    });
  }

  // Test trials
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "test"));
  }

  const testTrials = generateTrials(
    config.trialsPerCondition,
    config.trialsPerCondition,
    config.gridSize
  );

  testTrials.forEach((trial, i) => {
    timeline.push(
      createRotationTrial(jsPsych, config, trial, "test", i + 1, false)
    );
  });

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Mental Rotation experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createRotationTrial,
  createCompletionTrial,
  generateMatrix,
  rotateLeft,
  rotateRight,
  renderMatrix,
  generateTrials,
};

/**
 * Utility functions for the Mental Rotation task.
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
