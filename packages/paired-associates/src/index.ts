import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface WordPair {
  cue: string;
  target: string;
}

export interface PairedAssociatesOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Custom word pairs to use (default: built-in list) */
  wordPairs?: WordPair[];
  /** Duration to show each pair during study in ms (default: 3000) */
  studyDuration?: number;
  /** Inter-stimulus interval in ms (default: 500) */
  isi?: number;
  /** Maximum number of learning rounds (default: 3) */
  maxRounds?: number;
  /** Continue until all pairs are learned (default: true) */
  learnToCriterion?: boolean;
  /** Show feedback during test (default: true) */
  showFeedback?: boolean;
  /** Feedback duration in ms (default: 1500) */
  feedbackDuration?: number;
  /** Number of response options during test (default: 4) */
  numOptions?: number;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "study" | "test";
  round: number;
  trial_index: number;
  cue: string;
  target: string;
  response?: string;
  correct?: boolean;
  rt?: number;
  options?: string[];
}

export interface ScoringResult {
  /** Number of pairs correctly recalled in final round */
  finalRoundCorrect: number;
  /** Total number of pairs */
  totalPairs: number;
  /** Final round accuracy percentage */
  finalRoundAccuracy: number;
  /** Number of rounds completed */
  roundsCompleted: number;
  /** Rounds needed to learn all pairs (null if not achieved) */
  roundsToLearn: number | null;
  /** Performance by round */
  roundPerformance: Array<{ round: number; correct: number; total: number }>;
  /** Average RT for correct responses */
  averageRTCorrect: number | null;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  wordPairs: WordPair[];
  studyDuration: number;
  isi: number;
  maxRounds: number;
  learnToCriterion: boolean;
  showFeedback: boolean;
  feedbackDuration: number;
  numOptions: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "paired-associates";
const VERSION = "0.0.1";

// Default word pairs - unrelated concrete nouns
const DEFAULT_WORD_PAIRS: WordPair[] = [
  { cue: "APPLE", target: "RIVER" },
  { cue: "CHAIR", target: "CLOCK" },
  { cue: "BREAD", target: "TIGER" },
  { cue: "HORSE", target: "PIANO" },
  { cue: "STONE", target: "DREAM" },
  { cue: "CLOUD", target: "KNIFE" },
  { cue: "TABLE", target: "BEACH" },
  { cue: "HEART", target: "GRASS" },
];

const DEFAULT_OPTIONS = {
  showInstructions: true,
  wordPairs: DEFAULT_WORD_PAIRS,
  studyDuration: 3000,
  isi: 500,
  maxRounds: 3,
  learnToCriterion: true,
  showFeedback: true,
  feedbackDuration: 1500,
  numOptions: 4,
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
 * Generates distractor options for a test trial.
 */
function generateOptions(
  correctTarget: string,
  allTargets: string[],
  numOptions: number
): string[] {
  const distractors = allTargets.filter((t) => t !== correctTarget);
  const shuffledDistractors = shuffleArray(distractors);
  const selectedDistractors = shuffledDistractors.slice(0, numOptions - 1);

  const options = [correctTarget, ...selectedDistractors];
  return shuffleArray(options);
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials.
 */
function createInstructionTrials(
  config: ResolvedConfig,
  part: "intro" | "study" | "test"
) {
  const timeline: any[] = [];

  let stimulus: string;
  let buttonLabel: string;

  switch (part) {
    case "intro":
      stimulus = config.text.instruction_intro;
      buttonLabel = config.text.continue_button;
      break;
    case "study":
      stimulus = config.text.instruction_study;
      buttonLabel = config.text.start_button;
      break;
    case "test":
      stimulus = config.text.instruction_test;
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
      trial_type: "instruction",
    },
  });

  return { timeline };
}

/**
 * Creates a study trial for a word pair.
 */
function createStudyTrial(
  config: ResolvedConfig,
  pair: WordPair,
  round: number,
  trialIndex: number
) {
  const timeline: any[] = [];

  // Show the pair
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: config.text.study_pair(pair.cue, pair.target),
    choices: "NO_KEYS",
    trial_duration: config.studyDuration,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_type: "study",
      phase: "study",
      round: round,
      trial_index: trialIndex,
      cue: pair.cue,
      target: pair.target,
    },
  });

  // ISI
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "",
    choices: "NO_KEYS",
    trial_duration: config.isi,
    data: {
      task: TASK_NAME,
      trial_type: "isi",
    },
  });

  return { timeline };
}

/**
 * Creates a test trial for a word pair.
 */
function createTestTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  pair: WordPair,
  allTargets: string[],
  round: number,
  trialIndex: number
) {
  const options = generateOptions(pair.target, allTargets, config.numOptions);

  const timeline: any[] = [];

  // Test trial
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.test_cue(pair.cue),
    choices: options,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_type: "response",
      phase: "test",
      round: round,
      trial_index: trialIndex,
      cue: pair.cue,
      target: pair.target,
      options: options,
    },
    on_finish: (data: any) => {
      const response = options[data.response];
      const correct = response === pair.target;
      jsPsych.data.get().addToLast({
        response: response,
        correct: correct,
      });
    },
  });

  // Feedback (optional)
  if (config.showFeedback) {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        const lastData = jsPsych.data.getLastTrialData().values()[0];
        return lastData.correct
          ? config.text.feedback_correct
          : config.text.feedback_incorrect(pair.target);
      },
      choices: [],
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
 * Creates a round summary screen.
 */
function createRoundSummary(jsPsych: JsPsych, config: ResolvedConfig, round: number) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const roundTrials = jsPsych.data
        .get()
        .filter({ task: TASK_NAME, phase: "test", round: round, trial_type: "response" })
        .values();

      const correct = roundTrials.filter((t: any) => t.correct).length;
      const total = roundTrials.length;

      return config.text.round_complete(round, correct, total);
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      trial_type: "round_summary",
      round: round,
    },
  };
}

/**
 * Creates a study phase for all pairs.
 */
function createStudyPhase(
  config: ResolvedConfig,
  pairs: WordPair[],
  round: number
) {
  const shuffledPairs = shuffleArray(pairs);
  const timeline: any[] = [];

  shuffledPairs.forEach((pair, i) => {
    timeline.push(createStudyTrial(config, pair, round, i + 1));
  });

  return { timeline };
}

/**
 * Creates a test phase for all pairs.
 */
function createTestPhase(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  pairs: WordPair[],
  round: number
) {
  const shuffledPairs = shuffleArray(pairs);
  const allTargets = pairs.map((p) => p.target);
  const timeline: any[] = [];

  shuffledPairs.forEach((pair, i) => {
    timeline.push(createTestTrial(jsPsych, config, pair, allTargets, round, i + 1));
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
        scores.finalRoundCorrect,
        scores.totalPairs,
        scores.roundsToLearn
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
 * Calculates scoring metrics from the Paired Associates task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test", trial_type: "response" })
    .values() as TrialData[];

  if (testTrials.length === 0) {
    return {
      finalRoundCorrect: 0,
      totalPairs: 0,
      finalRoundAccuracy: 0,
      roundsCompleted: 0,
      roundsToLearn: null,
      roundPerformance: [],
      averageRTCorrect: null,
    };
  }

  // Get unique rounds
  const rounds = [...new Set(testTrials.map((t) => t.round))].sort((a, b) => a - b);
  const roundsCompleted = rounds.length;

  // Calculate per-round performance
  const roundPerformance = rounds.map((round) => {
    const roundTrials = testTrials.filter((t) => t.round === round);
    const correct = roundTrials.filter((t) => t.correct).length;
    return { round, correct, total: roundTrials.length };
  });

  // Final round stats
  const finalRound = rounds[rounds.length - 1];
  const finalRoundTrials = testTrials.filter((t) => t.round === finalRound);
  const finalRoundCorrect = finalRoundTrials.filter((t) => t.correct).length;
  const totalPairs = finalRoundTrials.length;
  const finalRoundAccuracy = totalPairs > 0 ? (finalRoundCorrect / totalPairs) * 100 : 0;

  // Rounds to learn (first round with 100% accuracy)
  let roundsToLearn: number | null = null;
  for (const perf of roundPerformance) {
    if (perf.correct === perf.total) {
      roundsToLearn = perf.round;
      break;
    }
  }

  // Average RT for correct responses
  const correctRTs = testTrials
    .filter((t) => t.correct && t.rt !== undefined)
    .map((t) => t.rt as number);
  const averageRTCorrect = correctRTs.length > 0
    ? correctRTs.reduce((a, b) => a + b, 0) / correctRTs.length
    : null;

  return {
    finalRoundCorrect,
    totalPairs,
    finalRoundAccuracy,
    roundsCompleted,
    roundsToLearn,
    roundPerformance,
    averageRTCorrect,
  };
}

/**
 * Returns a summary of the Paired Associates task performance.
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
 * Creates the complete Paired Associates task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const paTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   maxRounds: 3,
 * });
 * jsPsych.run([paTimeline]);
 * ```
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: PairedAssociatesOptions = {}
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

  // Create rounds
  for (let round = 1; round <= config.maxRounds; round++) {
    // Study phase instruction (for first round or if learning to criterion)
    if (config.showInstructions && round === 1) {
      timeline.push(createInstructionTrials(config, "study"));
    }

    // Study phase
    timeline.push(createStudyPhase(config, config.wordPairs, round));

    // Test phase instruction (for first round)
    if (config.showInstructions && round === 1) {
      timeline.push(createInstructionTrials(config, "test"));
    }

    // Test phase
    timeline.push(createTestPhase(jsPsych, config, config.wordPairs, round));

    // Round summary (except for last round if learn to criterion)
    if (round < config.maxRounds) {
      timeline.push(createRoundSummary(jsPsych, config, round));

      // Conditional: only continue if not all correct (when learning to criterion)
      if (config.learnToCriterion) {
        // Add conditional logic node
        timeline.push({
          timeline: [
            // Study phase for next round
            createStudyPhase(config, config.wordPairs, round + 1),
            // Test phase for next round
            createTestPhase(jsPsych, config, config.wordPairs, round + 1),
          ],
          conditional_function: () => {
            const roundTrials = jsPsych.data
              .get()
              .filter({ task: TASK_NAME, phase: "test", round: round, trial_type: "response" })
              .values();
            const allCorrect = roundTrials.every((t: any) => t.correct);
            return !allCorrect; // Continue if not all correct
          },
        });
        break; // Exit the for loop - conditional handles remaining rounds
      }
    }
  }

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Paired Associates experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createStudyTrial,
  createTestTrial,
  createStudyPhase,
  createTestPhase,
  createRoundSummary,
  createCompletionTrial,
  generateOptions,
};

/**
 * Utility functions for the Paired Associates task.
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
    DEFAULT_WORD_PAIRS,
  },
  text: defaultText,
};

// Re-export types
export type { TextConfig };
