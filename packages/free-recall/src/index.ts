import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface FreeRecallOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Word list to use (default: built-in list of 15 common nouns) */
  words?: string[];
  /** Duration to show each word in ms (default: 2000) */
  wordDuration?: number;
  /** Inter-stimulus interval in ms (default: 500) */
  isi?: number;
  /** Delay before recall phase in ms (default: 1000) */
  recallDelay?: number;
  /** Maximum time for recall phase in ms (default: 60000 = 1 min) */
  maxRecallTime?: number;
  /** Custom text strings for translation */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  trial_type: string;
  word?: string;
  word_index?: number;
  response?: string;
  recall_index?: number;
  is_correct?: boolean;
  is_intrusion?: boolean;
  is_repetition?: boolean;
  rt?: number;
}

export interface ScoringResult {
  /** Number of correctly recalled words */
  correctRecalls: number;
  /** Total number of words in the list */
  totalWords: number;
  /** Recall rate (proportion) */
  recallRate: number;
  /** Number of intrusions (recalled words not on list) */
  intrusions: number;
  /** Number of repetitions (same word recalled multiple times) */
  repetitions: number;
  /** Total responses made */
  totalResponses: number;
  /** List of correctly recalled words */
  recalledWords: string[];
  /** List of intrusion words */
  intrusionWords: string[];
  /** Serial position of recalled words (1-indexed position in original list) */
  serialPositions: number[];
  /** Average recall RT in ms */
  averageRecallRT: number | null;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  words: string[];
  wordDuration: number;
  isi: number;
  recallDelay: number;
  maxRecallTime: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "free-recall";
const VERSION = "0.0.1";

// Default word list - common concrete nouns
const DEFAULT_WORDS = [
  "APPLE",
  "TABLE",
  "RIVER",
  "CHAIR",
  "BREAD",
  "HOUSE",
  "CLOCK",
  "HORSE",
  "CLOUD",
  "KNIFE",
  "PLANT",
  "BEACH",
  "TIGER",
  "PIANO",
  "GRASS",
];

const DEFAULT_OPTIONS = {
  showInstructions: true,
  words: DEFAULT_WORDS,
  wordDuration: 2000,
  isi: 500,
  recallDelay: 1000,
  maxRecallTime: 60000,
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
 * Normalizes a word for comparison (uppercase, trim whitespace).
 */
function normalizeWord(word: string): string {
  return word.toUpperCase().trim();
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials.
 */
function createInstructionTrials(
  config: ResolvedConfig,
  part: "intro" | "study" | "recall"
) {
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
    case "recall":
      stimulus = config.text.instruction_recall;
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
 * Creates a study trial for a single word.
 */
function createStudyTrial(
  config: ResolvedConfig,
  word: string,
  wordIndex: number
) {
  const timeline: any[] = [];

  // Word presentation
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="text-align: center;">
        <p style="font-size: 18px; color: #666; margin-bottom: 20px;">${config.text.study_prompt}</p>
        <p style="font-size: 48px; font-weight: bold;">${word}</p>
      </div>
    `,
    choices: "NO_KEYS",
    trial_duration: config.wordDuration,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_type: "study",
      word: word,
      word_index: wordIndex,
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
 * Creates the study phase for all words.
 */
function createStudyPhase(config: ResolvedConfig, words: string[]) {
  const timeline: any[] = [];

  words.forEach((word, index) => {
    timeline.push(createStudyTrial(config, word, index + 1));
  });

  return { timeline };
}

/**
 * Creates the recall phase.
 */
function createRecallPhase(jsPsych: JsPsych, config: ResolvedConfig, words: string[]) {
  // Track recalled words
  const recalledWords: string[] = [];
  let recallIndex = 0;

  const timeline: any[] = [];

  // Delay before recall
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p style="font-size: 24px;">Get ready to recall...</p>`,
    choices: "NO_KEYS",
    trial_duration: config.recallDelay,
    data: {
      task: TASK_NAME,
      trial_type: "recall_delay",
    },
  });

  // Recall loop using timeline loop
  const recallTrial = {
    timeline: [
      {
        type: jsPsychSurveyText,
        questions: [
          {
            prompt: config.text.recall_prompt,
            placeholder: config.text.input_placeholder,
            name: "recall",
            required: false,
          },
        ],
        button_label: config.text.submit_button,
        data: {
          task: TASK_NAME,
          task_version: VERSION,
          trial_type: "recall",
        },
        on_finish: (data: any) => {
          recallIndex++;
          const response = data.response?.recall?.trim() || "";
          const normalizedResponse = normalizeWord(response);

          // Check if this is a correct recall
          const normalizedWords = words.map(normalizeWord);
          const isCorrect = normalizedWords.includes(normalizedResponse);
          const isRepetition = recalledWords.includes(normalizedResponse);
          const isIntrusion = !isCorrect && response.length > 0;

          if (response.length > 0) {
            recalledWords.push(normalizedResponse);
          }

          jsPsych.data.get().addToLast({
            response: response,
            recall_index: recallIndex,
            is_correct: isCorrect && !isRepetition,
            is_intrusion: isIntrusion,
            is_repetition: isRepetition,
          });
        },
      },
    ],
    loop_function: (data: any) => {
      const lastTrial = data.values()[0];
      const response = lastTrial.response?.recall?.trim() || "";
      // Continue if response is not empty
      return response.length > 0;
    },
  };

  timeline.push(recallTrial);

  // Done button trial
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p style="font-size: 18px;">When you're done recalling, press the button below.</p>`,
    choices: [config.text.done_button],
    data: {
      task: TASK_NAME,
      trial_type: "recall_end",
    },
    // This trial is shown when the loop exits (empty response)
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
      const scores = calculateScores(data, config.words);

      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += `<h2>${config.text.task_complete}</h2>`;
      html += config.text.result_summary(
        scores.correctRecalls,
        scores.totalWords,
        scores.intrusions,
        scores.repetitions
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
 * Calculates scoring metrics from the Free Recall task data.
 */
function calculateScores(data: DataCollection, wordList?: string[]): ScoringResult {
  const recallTrials = data
    .filter({ task: TASK_NAME, trial_type: "recall" })
    .values() as TrialData[];

  // Get word list from study trials if not provided
  if (!wordList) {
    const studyTrials = data
      .filter({ task: TASK_NAME, trial_type: "study" })
      .values() as TrialData[];
    wordList = studyTrials.map((t) => t.word || "");
  }

  const totalWords = wordList.length;

  if (recallTrials.length === 0) {
    return {
      correctRecalls: 0,
      totalWords: totalWords,
      recallRate: 0,
      intrusions: 0,
      repetitions: 0,
      totalResponses: 0,
      recalledWords: [],
      intrusionWords: [],
      serialPositions: [],
      averageRecallRT: null,
    };
  }

  // Count correct recalls, intrusions, repetitions
  const correctRecalls = recallTrials.filter((t) => t.is_correct).length;
  const intrusions = recallTrials.filter((t) => t.is_intrusion).length;
  const repetitions = recallTrials.filter((t) => t.is_repetition).length;

  // Get recalled words and intrusion words
  const recalledWords = recallTrials
    .filter((t) => t.is_correct)
    .map((t) => normalizeWord(t.response || ""));
  const intrusionWords = recallTrials
    .filter((t) => t.is_intrusion)
    .map((t) => t.response || "");

  // Calculate serial positions of recalled words
  const normalizedWordList = wordList.map(normalizeWord);
  const serialPositions = recalledWords.map(
    (word) => normalizedWordList.indexOf(word) + 1
  );

  // Calculate average RT
  const rts = recallTrials
    .filter((t) => t.rt !== undefined && t.rt !== null)
    .map((t) => t.rt as number);
  const averageRecallRT =
    rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : null;

  // Calculate recall rate
  const recallRate = totalWords > 0 ? correctRecalls / totalWords : 0;

  return {
    correctRecalls,
    totalWords,
    recallRate,
    intrusions,
    repetitions,
    totalResponses: recallTrials.length,
    recalledWords,
    intrusionWords,
    serialPositions,
    averageRecallRT,
  };
}

/**
 * Returns a summary of the Free Recall task performance.
 */
function getSummary(
  data: DataCollection,
  wordList?: string[]
): ScoringResult & { taskName: string; version: string } {
  const scores = calculateScores(data, wordList);
  return {
    ...scores,
    taskName: TASK_NAME,
    version: VERSION,
  };
}

// -- MAIN EXPORT --

/**
 * Creates the complete Free Recall task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const freeRecallTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   words: ["CAT", "DOG", "BIRD", "FISH"],
 * });
 * jsPsych.run([freeRecallTimeline]);
 * ```
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: FreeRecallOptions = {}
) {
  // Merge text with defaults
  const text: TextConfig = { ...defaultText, ...options.text };

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    text,
  };

  // Shuffle words for presentation
  const shuffledWords = shuffleArray(config.words);

  const timeline: any[] = [];

  // Introduction
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "intro"));
  }

  // Study phase
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "study"));
  }
  timeline.push(createStudyPhase(config, shuffledWords));

  // Recall phase
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "recall"));
  }
  timeline.push(createRecallPhase(jsPsych, config, shuffledWords));

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Free Recall experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createStudyTrial,
  createStudyPhase,
  createRecallPhase,
  createCompletionTrial,
  normalizeWord,
};

/**
 * Utility functions for the Free Recall task.
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
    DEFAULT_WORDS,
  },
  text: defaultText,
};

// Re-export types
export type { TextConfig };
