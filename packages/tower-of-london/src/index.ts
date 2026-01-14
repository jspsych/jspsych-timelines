import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychTowerOfLondon from "@jspsych-contrib/plugin-tower-of-london";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface PuzzleConfig {
  /** Starting configuration of balls on pegs */
  start_state: string[][];
  /** Goal configuration to achieve */
  goal_state: string[][];
  /** Optimal number of moves for this puzzle */
  optimal_moves: number;
  /** Optional difficulty label */
  difficulty?: string;
}

export interface TowerOfLondonOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Include practice trial before main task (default: true) */
  showPractice?: boolean;
  /** Practice puzzle configuration (uses default if not specified) */
  practicePuzzle?: PuzzleConfig;
  /** Test puzzles to present. Uses default set if not specified. */
  puzzles?: PuzzleConfig[];
  /** Peg capacities [left, middle, right]. Default: [3, 3, 3] */
  pegCapacities?: [number, number, number];
  /** Canvas width in pixels (default: 500) */
  canvasWidth?: number;
  /** Canvas height in pixels (default: 400) */
  canvasHeight?: number;
  /** Ball radius in pixels (default: 30) */
  ballRadius?: number;
  /** Maximum moves allowed per puzzle. Set to null for unlimited. (default: null) */
  maxMoves?: number | null;
  /** Time limit per puzzle in ms. Set to null for unlimited. (default: null) */
  timeLimit?: number | null;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "practice" | "test";
  puzzle_index: number;
  difficulty: string | null;
  solved: boolean;
  num_moves: number;
  optimal_moves: number;
  optimal: boolean | null;
  rt: number;
  moves: Array<{
    from: number;
    to: number;
    ball: string;
    time: number;
  }>;
  start_state: string[][];
  goal_state: string[][];
  final_state: string[][];
}

export interface ScoringResult {
  /** Number of puzzles solved */
  puzzlesSolved: number;
  /** Total number of puzzles */
  totalPuzzles: number;
  /** Percentage of puzzles solved */
  percentSolved: number;
  /** Number of puzzles solved optimally */
  optimalSolutions: number;
  /** Average moves for solved puzzles */
  averageMoves: number | null;
  /** Average moves above optimal for solved puzzles */
  averageMovesAboveOptimal: number | null;
  /** Total time in ms */
  totalTime: number;
  /** Average time per puzzle in ms */
  averageTime: number;
  /** Breakdown by difficulty */
  byDifficulty: Record<
    string,
    {
      solved: number;
      total: number;
      optimalSolutions: number;
      averageMoves: number | null;
    }
  >;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  showPractice: boolean;
  practicePuzzle: PuzzleConfig;
  puzzles: PuzzleConfig[];
  pegCapacities: [number, number, number];
  canvasWidth: number;
  canvasHeight: number;
  ballRadius: number;
  maxMoves: number | null;
  timeLimit: number | null;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "tower-of-london";
const VERSION = "0.0.1";

// Standard TOL puzzles with increasing difficulty
const DEFAULT_PUZZLES: PuzzleConfig[] = [
  // 2-move puzzles
  {
    start_state: [["red", "green", "blue"], [], []],
    goal_state: [["red", "green"], ["blue"], []],
    optimal_moves: 2,
    difficulty: "easy",
  },
  {
    start_state: [["red", "green", "blue"], [], []],
    goal_state: [["red"], ["green"], ["blue"]],
    optimal_moves: 2,
    difficulty: "easy",
  },
  // 3-move puzzles
  {
    start_state: [["red", "green", "blue"], [], []],
    goal_state: [["red"], ["blue"], ["green"]],
    optimal_moves: 3,
    difficulty: "medium",
  },
  {
    start_state: [["red", "green", "blue"], [], []],
    goal_state: [[], ["red", "green"], ["blue"]],
    optimal_moves: 3,
    difficulty: "medium",
  },
  // 4-move puzzles
  {
    start_state: [["red", "green", "blue"], [], []],
    goal_state: [[], ["blue", "green"], ["red"]],
    optimal_moves: 4,
    difficulty: "medium",
  },
  {
    start_state: [["red", "green", "blue"], [], []],
    goal_state: [["blue"], [], ["red", "green"]],
    optimal_moves: 4,
    difficulty: "medium",
  },
  // 5-move puzzles
  {
    start_state: [["red", "green", "blue"], [], []],
    goal_state: [[], ["blue", "red"], ["green"]],
    optimal_moves: 5,
    difficulty: "hard",
  },
  {
    start_state: [["red", "green", "blue"], [], []],
    goal_state: [["blue"], ["red"], ["green"]],
    optimal_moves: 5,
    difficulty: "hard",
  },
  // 6-move puzzles
  {
    start_state: [["red", "green", "blue"], [], []],
    goal_state: [["green"], ["blue"], ["red"]],
    optimal_moves: 6,
    difficulty: "hard",
  },
  {
    start_state: [["red", "green", "blue"], [], []],
    goal_state: [[], ["green", "blue"], ["red"]],
    optimal_moves: 6,
    difficulty: "hard",
  },
];

const DEFAULT_PRACTICE_PUZZLE: PuzzleConfig = {
  start_state: [["red", "green", "blue"], [], []],
  goal_state: [["red", "green"], [], ["blue"]],
  optimal_moves: 2,
  difficulty: "practice",
};

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPractice: true,
  practicePuzzle: DEFAULT_PRACTICE_PUZZLE,
  puzzles: DEFAULT_PUZZLES,
  pegCapacities: [3, 3, 3] as [number, number, number],
  canvasWidth: 500,
  canvasHeight: 400,
  ballRadius: 30,
  maxMoves: null,
  timeLimit: null,
};

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials for the Tower of London task.
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
        trial_type: "instruction",
      },
    });
  } else if (part === "task") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_task,
      choices: [config.text.continue_button],
      data: {
        task: TASK_NAME,
        trial_type: "instruction",
      },
    });
  } else if (part === "practice") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_practice,
      choices: [config.text.start_button],
      data: {
        task: TASK_NAME,
        trial_type: "instruction",
      },
    });
  } else if (part === "test") {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: config.text.instruction_test,
      choices: [config.text.start_button],
      data: {
        task: TASK_NAME,
        trial_type: "instruction",
      },
    });
  }

  return { timeline };
}

/**
 * Creates a Tower of London puzzle trial.
 */
function createPuzzleTrial(
  config: ResolvedConfig,
  puzzle: PuzzleConfig,
  phase: "practice" | "test",
  puzzleIndex: number
) {
  return {
    type: jsPsychTowerOfLondon,
    start_state: puzzle.start_state,
    goal_state: puzzle.goal_state,
    optimal_moves: puzzle.optimal_moves,
    peg_capacities: config.pegCapacities,
    canvas_width: config.canvasWidth,
    canvas_height: config.canvasHeight,
    ball_radius: config.ballRadius,
    max_moves: config.maxMoves,
    time_limit: config.timeLimit,
    prompt: config.text.trial_prompt,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: phase,
      puzzle_index: puzzleIndex,
      difficulty: puzzle.difficulty || null,
      optimal_moves: puzzle.optimal_moves,
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
      if (data.solved) {
        return config.text.practice_feedback_solved(
          data.num_moves,
          config.practicePuzzle.optimal_moves
        );
      } else {
        return config.text.practice_feedback_not_solved;
      }
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      trial_type: "feedback",
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
      html += config.text.result_summary(
        scores.puzzlesSolved,
        scores.totalPuzzles,
        scores.averageMoves ?? 0
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
 * Calculates scoring metrics from the Tower of London task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test" })
    .values() as TrialData[];

  const solved = testTrials.filter((t) => t.solved);
  const puzzlesSolved = solved.length;
  const totalPuzzles = testTrials.length;
  const percentSolved = totalPuzzles > 0 ? (puzzlesSolved / totalPuzzles) * 100 : 0;

  const optimalSolutions = solved.filter(
    (t) => t.optimal === true || t.num_moves === t.optimal_moves
  ).length;

  const solvedMoves = solved.map((t) => t.num_moves);
  const averageMoves = mean(solvedMoves);

  const movesAboveOptimal = solved.map((t) => t.num_moves - t.optimal_moves);
  const averageMovesAboveOptimal = mean(movesAboveOptimal);

  const times = testTrials.map((t) => t.rt);
  const totalTime = times.reduce((a, b) => a + b, 0);
  const averageTime = totalPuzzles > 0 ? totalTime / totalPuzzles : 0;

  // Breakdown by difficulty
  const byDifficulty: ScoringResult["byDifficulty"] = {};
  const difficulties = [...new Set(testTrials.map((t) => t.difficulty || "unknown"))];

  for (const diff of difficulties) {
    const diffTrials = testTrials.filter((t) => (t.difficulty || "unknown") === diff);
    const diffSolved = diffTrials.filter((t) => t.solved);
    const diffOptimal = diffSolved.filter(
      (t) => t.optimal === true || t.num_moves === t.optimal_moves
    ).length;
    const diffMoves = diffSolved.map((t) => t.num_moves);

    byDifficulty[diff] = {
      solved: diffSolved.length,
      total: diffTrials.length,
      optimalSolutions: diffOptimal,
      averageMoves: mean(diffMoves),
    };
  }

  return {
    puzzlesSolved,
    totalPuzzles,
    percentSolved,
    optimalSolutions,
    averageMoves,
    averageMovesAboveOptimal,
    totalTime,
    averageTime,
    byDifficulty,
  };
}

/**
 * Returns a summary of the Tower of London task performance.
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
 * Creates the complete Tower of London task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const tolTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   showPractice: true,
 * });
 * jsPsych.run([tolTimeline]);
 * ```
 *
 * @example
 * // Custom puzzles
 * const timeline = createTimeline(jsPsych, {
 *   puzzles: [
 *     {
 *       start_state: [["red", "green", "blue"], [], []],
 *       goal_state: [["blue"], ["green"], ["red"]],
 *       optimal_moves: 5,
 *       difficulty: "custom",
 *     },
 *   ],
 * });
 *
 * @example
 * // Classic TOL with restricted capacities
 * const timeline = createTimeline(jsPsych, {
 *   pegCapacities: [1, 2, 3],
 * });
 */
export function createTimeline(jsPsych: JsPsych, options: TowerOfLondonOptions = {}) {
  // Merge text with defaults
  const text: TextConfig = { ...defaultText, ...options.text };

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    text,
    practicePuzzle: options.practicePuzzle ?? DEFAULT_PRACTICE_PUZZLE,
    puzzles: options.puzzles ?? DEFAULT_PUZZLES,
    pegCapacities: options.pegCapacities ?? DEFAULT_OPTIONS.pegCapacities,
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
    timeline.push(createPuzzleTrial(config, config.practicePuzzle, "practice", 0));
    timeline.push(createPracticeFeedback(jsPsych, config));
  }

  // Test trials
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "test"));
  }

  config.puzzles.forEach((puzzle, index) => {
    timeline.push(createPuzzleTrial(config, puzzle, "test", index));
  });

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Tower of London experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createPuzzleTrial,
  createPracticeFeedback,
  createCompletionTrial,
};

/**
 * Utility functions for the Tower of London task.
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
    DEFAULT_PUZZLES,
    DEFAULT_PRACTICE_PUZZLE,
  },
  text: defaultText,
};

// Re-export types
export type { TextConfig };
