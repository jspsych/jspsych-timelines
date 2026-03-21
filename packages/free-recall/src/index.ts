import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychFreeRecallResponse from "@jspsych-contrib/plugin-free-recall-response";
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
  phase: string;
  part?: string;
  word?: string;
  word_index?: number;
  /** For recall trial: array of recalled words with timing */
  responses?: Array<{ word: string; rt: number }>;
  /** Total time for recall phase */
  rt?: number;
}

/** Processed recall response with correctness info */
export interface ProcessedRecallResponse {
  word: string;
  rt: number;
  is_correct: boolean;
  is_intrusion: boolean;
  is_repetition: boolean;
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

  const data: Record<string, any> = { task: TASK_NAME };

  switch (part) {
    case "intro":
      data.phase = "instructions";
      break;
    case "study":
      data.phase = "study";
      data.part = "instruction";
      break;
    case "recall":
      data.phase = "test";
      data.part = "instruction";
      break;
  }

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: stimulus,
    choices: [buttonLabel],
    data,
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
      phase: "study",
      part: "presentation",
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
      phase: "study",
      part: "isi",
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
  const timeline: any[] = [];

  // Delay before recall
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p style="font-size: 24px;">Get ready to recall...</p>`,
    choices: "NO_KEYS",
    trial_duration: config.recallDelay,
    data: {
      task: TASK_NAME,
      phase: "test",
      part: "delay",
    },
  });

  // Recall trial using custom plugin
  timeline.push({
    type: jsPsychFreeRecallResponse,
    prompt: config.text.recall_prompt,
    add_button_label: config.text.add_button,
    done_button_label: config.text.done_button,
    placeholder: config.text.input_placeholder,
    words_list_label: config.text.words_list_label,
    trial_duration: config.maxRecallTime,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "test",
      part: "recall",
    },
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
      phase: "completion",
    },
  };
}

// -- SCORING FUNCTIONS --

/**
 * Processes raw recall responses to determine correctness.
 */
function processRecallResponses(
  responses: Array<{ word: string; rt: number }>,
  wordList: string[]
): ProcessedRecallResponse[] {
  const normalizedWordList = wordList.map(normalizeWord);
  const seenWords: string[] = [];

  return responses.map((r) => {
    const normalizedWord = normalizeWord(r.word);
    const isCorrect = normalizedWordList.includes(normalizedWord);
    const isRepetition = seenWords.includes(normalizedWord);
    const isIntrusion = !isCorrect && r.word.length > 0;

    seenWords.push(normalizedWord);

    return {
      word: r.word,
      rt: r.rt,
      is_correct: isCorrect && !isRepetition,
      is_intrusion: isIntrusion,
      is_repetition: isRepetition,
    };
  });
}

/**
 * Calculates scoring metrics from the Free Recall task data.
 */
function calculateScores(data: DataCollection, wordList?: string[]): ScoringResult {
  const recallTrial = data
    .filter({ task: TASK_NAME, phase: "test", part: "recall" })
    .values()[0] as TrialData | undefined;

  // Get word list from study trials if not provided
  if (!wordList) {
    const studyTrials = data
      .filter({ task: TASK_NAME, phase: "study", part: "presentation" })
      .values() as TrialData[];
    wordList = studyTrials.map((t) => t.word || "");
  }

  const totalWords = wordList.length;

  if (!recallTrial || !recallTrial.responses || recallTrial.responses.length === 0) {
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

  // Process the responses
  const processed = processRecallResponses(recallTrial.responses, wordList);

  // Count correct recalls, intrusions, repetitions
  const correctRecalls = processed.filter((r) => r.is_correct).length;
  const intrusions = processed.filter((r) => r.is_intrusion).length;
  const repetitions = processed.filter((r) => r.is_repetition).length;

  // Get recalled words and intrusion words
  const recalledWords = processed
    .filter((r) => r.is_correct)
    .map((r) => normalizeWord(r.word));
  const intrusionWords = processed
    .filter((r) => r.is_intrusion)
    .map((r) => r.word);

  // Calculate serial positions of recalled words
  const normalizedWordList = wordList.map(normalizeWord);
  const serialPositions = recalledWords.map(
    (word) => normalizedWordList.indexOf(word) + 1
  );

  // Calculate average RT (time between adding each word)
  const rts = processed.map((r) => r.rt);
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
    totalResponses: processed.length,
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
    processRecallResponses,
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
