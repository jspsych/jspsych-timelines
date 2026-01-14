import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface LexicalDecisionOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Include practice trials before main task (default: true) */
  showPractice?: boolean;
  /** Number of practice trials (default: 6) */
  numPracticeTrials?: number;
  /** Custom list of words to use (default: built-in list) */
  words?: string[];
  /** Custom list of nonwords to use (default: built-in list) */
  nonwords?: string[];
  /** Number of word trials in main task (default: 20) */
  numWordTrials?: number;
  /** Number of nonword trials in main task (default: 20) */
  numNonwordTrials?: number;
  /** Duration of fixation cross in ms (default: 500) */
  fixationDuration?: number;
  /** Maximum response time in ms, null for unlimited (default: 3000) */
  responseTimeout?: number | null;
  /** Show feedback during practice (default: true) */
  showPracticeFeedback?: boolean;
  /** Feedback duration in ms (default: 500) */
  feedbackDuration?: number;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "practice" | "test";
  trial_index: number;
  stimulus: string;
  stimulus_type: "word" | "nonword";
  response: "word" | "nonword" | null;
  correct: boolean;
  rt: number | null;
  timeout: boolean;
}

export interface ScoringResult {
  /** Overall accuracy (percentage) */
  accuracy: number;
  /** Accuracy on word trials */
  wordAccuracy: number;
  /** Accuracy on nonword trials */
  nonwordAccuracy: number;
  /** Average response time for all trials (ms) */
  averageRT: number | null;
  /** Average RT for correct word trials */
  averageRTWord: number | null;
  /** Average RT for correct nonword trials */
  averageRTNonword: number | null;
  /** d-prime (sensitivity measure) */
  dPrime: number | null;
  /** Number of correct responses */
  numCorrect: number;
  /** Total number of trials */
  numTrials: number;
  /** Number of timeout trials */
  numTimeouts: number;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  showPractice: boolean;
  numPracticeTrials: number;
  words: string[];
  nonwords: string[];
  numWordTrials: number;
  numNonwordTrials: number;
  fixationDuration: number;
  responseTimeout: number | null;
  showPracticeFeedback: boolean;
  feedbackDuration: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "lexical-decision";
const VERSION = "0.0.1";

// Default word list - common English words
const DEFAULT_WORDS = [
  "APPLE", "BRAIN", "CHAIR", "DANCE", "EAGLE",
  "FLOOR", "GRAPE", "HORSE", "IVORY", "JUICE",
  "KNIFE", "LEMON", "MONEY", "NORTH", "OCEAN",
  "PIANO", "QUEEN", "RIVER", "STONE", "TIGER",
  "URBAN", "VOICE", "WHEAT", "YOUTH", "ZEBRA",
  "BEACH", "CLOUD", "DREAM", "EARTH", "FLAME",
  "GIANT", "HEART", "IMAGE", "JEWEL", "KNEEL",
  "LIGHT", "MUSIC", "NIGHT", "OPERA", "PEACE",
];

// Default nonword list - created by modifying real words
const DEFAULT_NONWORDS = [
  "ABBLE", "BRANE", "CHAID", "DENCE", "EADLE",
  "FLOIR", "GRABE", "HARSE", "IVARY", "JUECE",
  "KNIGE", "LEMUN", "MANEY", "NARTH", "OCEON",
  "PIENO", "QUEAN", "REVER", "STANE", "TEGER",
  "URBEN", "VOIKE", "WHELT", "YOOTH", "ZIBRA",
  "BEECH", "CLOID", "DREEM", "EURTH", "FLOME",
  "GEANT", "HEERT", "IMOGE", "JOWEL", "KNEIL",
  "LEGHT", "MESIC", "NEGHT", "OPARA", "PEECE",
];

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPractice: true,
  numPracticeTrials: 6,
  words: DEFAULT_WORDS,
  nonwords: DEFAULT_NONWORDS,
  numWordTrials: 20,
  numNonwordTrials: 20,
  fixationDuration: 500,
  responseTimeout: 3000,
  showPracticeFeedback: true,
  feedbackDuration: 500,
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
 * Samples n items from an array without replacement.
 */
function sampleArray<T>(arr: T[], n: number): T[] {
  const shuffled = shuffleArray(arr);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/**
 * Calculates d-prime from hit rate and false alarm rate.
 */
function calculateDPrime(hitRate: number, falseAlarmRate: number): number | null {
  // Correct for floor/ceiling effects
  const correctedHitRate = Math.max(0.01, Math.min(0.99, hitRate));
  const correctedFARate = Math.max(0.01, Math.min(0.99, falseAlarmRate));

  // Z-score transformation (inverse normal CDF approximation)
  const zHit = inverseNormalCDF(correctedHitRate);
  const zFA = inverseNormalCDF(correctedFARate);

  if (zHit === null || zFA === null) return null;

  return zHit - zFA;
}

/**
 * Approximation of inverse normal CDF using rational approximation.
 */
function inverseNormalCDF(p: number): number | null {
  if (p <= 0 || p >= 1) return null;

  // Rational approximation for central region
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0,
    -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0,
    3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number, x: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    x =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    x =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    x =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  return x;
}

// -- TRIAL GENERATION --

interface TrialSpec {
  stimulus: string;
  type: "word" | "nonword";
}

/**
 * Generates trial specifications for the task.
 */
function generateTrials(
  words: string[],
  nonwords: string[],
  numWords: number,
  numNonwords: number
): TrialSpec[] {
  const selectedWords = sampleArray(words, numWords);
  const selectedNonwords = sampleArray(nonwords, numNonwords);

  const trials: TrialSpec[] = [
    ...selectedWords.map((w) => ({ stimulus: w, type: "word" as const })),
    ...selectedNonwords.map((n) => ({ stimulus: n, type: "nonword" as const })),
  ];

  return shuffleArray(trials);
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials for the Lexical Decision task.
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
 * Creates a single lexical decision trial (fixation + stimulus + response).
 */
function createLexicalTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  trial: TrialSpec,
  phase: "practice" | "test",
  trialIndex: number,
  showFeedback: boolean
) {
  const timeline: any[] = [];

  // Fixation cross
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: config.text.fixation,
    choices: "NO_KEYS",
    trial_duration: config.fixationDuration,
    data: {
      task: TASK_NAME,
      trial_type: "fixation",
    },
  });

  // Stimulus presentation with response
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p style="font-size: 48px; font-family: monospace; letter-spacing: 4px;">${trial.stimulus}</p>`,
    choices: [config.text.word_button, config.text.nonword_button],
    trial_duration: config.responseTimeout,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_type: "response",
      phase: phase,
      trial_index: trialIndex,
      stimulus: trial.stimulus,
      stimulus_type: trial.type,
    },
    on_finish: (data: any) => {
      let response: "word" | "nonword" | null = null;
      let timeout = false;

      if (data.response === null) {
        timeout = true;
      } else {
        response = data.response === 0 ? "word" : "nonword";
      }

      const correct = !timeout && response === trial.type;

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
          return config.text.feedback_timeout;
        }
        return lastData.correct
          ? config.text.feedback_correct
          : config.text.feedback_incorrect;
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
        scores.accuracy,
        scores.averageRT ?? 0
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
 * Calculates scoring metrics from the Lexical Decision task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test", trial_type: "response" })
    .values() as TrialData[];

  if (testTrials.length === 0) {
    return {
      accuracy: 0,
      wordAccuracy: 0,
      nonwordAccuracy: 0,
      averageRT: null,
      averageRTWord: null,
      averageRTNonword: null,
      dPrime: null,
      numCorrect: 0,
      numTrials: 0,
      numTimeouts: 0,
    };
  }

  const nonTimeoutTrials = testTrials.filter((t) => !t.timeout);
  const numTimeouts = testTrials.filter((t) => t.timeout).length;
  const numCorrect = nonTimeoutTrials.filter((t) => t.correct).length;
  const accuracy =
    nonTimeoutTrials.length > 0
      ? (numCorrect / nonTimeoutTrials.length) * 100
      : 0;

  // Word accuracy (hit rate)
  const wordTrials = nonTimeoutTrials.filter((t) => t.stimulus_type === "word");
  const wordCorrect = wordTrials.filter((t) => t.correct).length;
  const wordAccuracy =
    wordTrials.length > 0 ? (wordCorrect / wordTrials.length) * 100 : 0;
  const hitRate = wordTrials.length > 0 ? wordCorrect / wordTrials.length : 0;

  // Nonword accuracy (correct rejection rate)
  const nonwordTrials = nonTimeoutTrials.filter(
    (t) => t.stimulus_type === "nonword"
  );
  const nonwordCorrect = nonwordTrials.filter((t) => t.correct).length;
  const nonwordAccuracy =
    nonwordTrials.length > 0 ? (nonwordCorrect / nonwordTrials.length) * 100 : 0;

  // False alarm rate = saying "word" to nonwords
  const falseAlarms = nonwordTrials.filter(
    (t) => t.response === "word"
  ).length;
  const falseAlarmRate =
    nonwordTrials.length > 0 ? falseAlarms / nonwordTrials.length : 0;

  // d-prime
  const dPrime = calculateDPrime(hitRate, falseAlarmRate);

  // Response times
  const allRTs = nonTimeoutTrials
    .filter((t) => t.rt !== null)
    .map((t) => t.rt as number);
  const averageRT =
    allRTs.length > 0 ? allRTs.reduce((a, b) => a + b, 0) / allRTs.length : null;

  const wordRTs = wordTrials
    .filter((t) => t.correct && t.rt !== null)
    .map((t) => t.rt as number);
  const averageRTWord =
    wordRTs.length > 0
      ? wordRTs.reduce((a, b) => a + b, 0) / wordRTs.length
      : null;

  const nonwordRTs = nonwordTrials
    .filter((t) => t.correct && t.rt !== null)
    .map((t) => t.rt as number);
  const averageRTNonword =
    nonwordRTs.length > 0
      ? nonwordRTs.reduce((a, b) => a + b, 0) / nonwordRTs.length
      : null;

  return {
    accuracy,
    wordAccuracy,
    nonwordAccuracy,
    averageRT,
    averageRTWord,
    averageRTNonword,
    dPrime,
    numCorrect,
    numTrials: testTrials.length,
    numTimeouts,
  };
}

/**
 * Returns a summary of the Lexical Decision task performance.
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
 * Creates the complete Lexical Decision task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const ldTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   numWordTrials: 20,
 *   numNonwordTrials: 20,
 * });
 * jsPsych.run([ldTimeline]);
 * ```
 *
 * @example
 * // Custom word lists
 * const timeline = createTimeline(jsPsych, {
 *   words: ["CAT", "DOG", "HOUSE"],
 *   nonwords: ["CAF", "DOK", "HOURE"],
 *   numWordTrials: 3,
 *   numNonwordTrials: 3,
 * });
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: LexicalDecisionOptions = {}
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
      config.words,
      config.nonwords,
      Math.ceil(config.numPracticeTrials / 2),
      Math.floor(config.numPracticeTrials / 2)
    );

    practiceTrials.forEach((trial, i) => {
      timeline.push(
        createLexicalTrial(
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
    config.words,
    config.nonwords,
    config.numWordTrials,
    config.numNonwordTrials
  );

  testTrials.forEach((trial, i) => {
    timeline.push(
      createLexicalTrial(jsPsych, config, trial, "test", i + 1, false)
    );
  });

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Lexical Decision experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createLexicalTrial,
  createCompletionTrial,
  generateTrials,
};

/**
 * Utility functions for the Lexical Decision task.
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
    DEFAULT_NONWORDS,
  },
  text: defaultText,
};

// Re-export types
export type { TextConfig };
