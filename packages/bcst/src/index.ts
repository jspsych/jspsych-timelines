import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface BcstOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Show feedback after each response (default: true) */
  showFeedback?: boolean;
  /** Feedback display duration in ms (default: 500) */
  feedbackDuration?: number;
  /** Number of consecutive correct responses to trigger rule change (default: 10) */
  runLength?: number;
  /** Number of categories (rule shifts) to complete before ending (default: 6) */
  numCategories?: number;
  /** Number of times to cycle through the 64-card deck (default: 2) */
  deckRepeats?: number;
  /** Use Berg's original canonical card order (default: false = random) */
  useCanonicalOrder?: boolean;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  trial_number: number;
  stimulus_color: string;
  stimulus_shape: string;
  stimulus_number: number;
  response: number | null;
  current_rule: string;
  previous_rule: string | null;
  correct: boolean;
  is_perseverative: boolean;
  consecutive_correct: number;
  categories_completed: number;
  rt: number | null;
}

export interface ScoringResult {
  taskName: string;
  version: string;
  totalTrials: number;
  totalCorrect: number;
  totalErrors: number;
  accuracy: number;
  categoriesCompleted: number;
  trialsToFirstCategory: number | null;
  perseverativeResponses: number;
  perseverativeErrors: number;
  nonPerseverativeErrors: number;
  percentPerseverativeErrors: number;
  conceptualLevelResponses: number;
  failureToMaintainSet: number;
  meanRT: number | null;
}

// Internal config type with resolved text
interface ResolvedConfig {
  showInstructions: boolean;
  showFeedback: boolean;
  feedbackDuration: number;
  runLength: number;
  numCategories: number;
  deckRepeats: number;
  useCanonicalOrder: boolean;
  text: TextConfig;
}

// Card type
interface Card {
  color: "red" | "green" | "yellow" | "blue";
  shape: "triangle" | "star" | "cross" | "circle";
  number: 1 | 2 | 3 | 4;
}

// Rule type
type Rule = "color" | "shape" | "number";

// -- CONSTANTS --

const TASK_NAME = "bcst";
const VERSION = "0.0.1";

const COLORS: Card["color"][] = ["red", "green", "yellow", "blue"];
const SHAPES: Card["shape"][] = ["triangle", "star", "cross", "circle"];
const NUMBERS: Card["number"][] = [1, 2, 3, 4];

// Reference cards (fixed, one of each combination)
const REFERENCE_CARDS: Card[] = [
  { color: "red", shape: "triangle", number: 1 },
  { color: "green", shape: "star", number: 2 },
  { color: "yellow", shape: "cross", number: 3 },
  { color: "blue", shape: "circle", number: 4 },
];

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showFeedback: true,
  feedbackDuration: 500,
  runLength: 10,
  numCategories: 6,
  deckRepeats: 2,
  useCanonicalOrder: false,
};

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Generates the full 64-card deck.
 */
function generateDeck(): Card[] {
  const deck: Card[] = [];
  for (const color of COLORS) {
    for (const shape of SHAPES) {
      for (const number of NUMBERS) {
        deck.push({ color, shape, number });
      }
    }
  }
  return deck;
}

/**
 * Shuffles an array using Fisher-Yates algorithm.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates the stimulus deck based on configuration.
 */
function generateStimulusDeck(config: ResolvedConfig): Card[] {
  const baseDeck = generateDeck();
  let deck: Card[] = [];

  for (let i = 0; i < config.deckRepeats; i++) {
    deck = deck.concat(config.useCanonicalOrder ? baseDeck : shuffleArray(baseDeck));
  }

  return deck;
}

/**
 * Generates HTML for a card display.
 */
function generateCardHtml(card: Card, isStimulus: boolean = false): string {
  const shapes = Array(card.number)
    .fill(null)
    .map(() => `<div class="bcst-shape ${card.shape} bcst-${card.color}"></div>`)
    .join("");

  return `
    <div class="bcst-card ${isStimulus ? "stimulus" : "reference"}">
      ${shapes}
    </div>
  `;
}

/**
 * Generates HTML for all reference cards as buttons.
 */
function generateReferenceCardsHtml(): string {
  return `
    <div class="bcst-reference-cards">
      ${REFERENCE_CARDS.map((card, index) => generateCardHtml(card)).join("")}
    </div>
  `;
}

/**
 * Checks if a response matches the stimulus on a given dimension.
 */
function matchesDimension(stimulus: Card, referenceIndex: number, dimension: Rule): boolean {
  const reference = REFERENCE_CARDS[referenceIndex];
  return stimulus[dimension] === reference[dimension];
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials using the instructions plugin.
 */
function createInstructionTrials(config: ResolvedConfig) {
  return {
    type: jsPsychInstructions,
    pages: config.text.instruction_pages,
    show_clickable_nav: true,
    button_label_next: config.text.continue_button,
    button_label_previous: "Back",
    data: {
      task: TASK_NAME,
      phase: "instructions",
    },
  };
}

/**
 * Creates a feedback trial.
 */
function createFeedbackTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().last(1).values()[0];
      const feedbackText = lastTrial.correct
        ? config.text.correct_feedback
        : config.text.incorrect_feedback;
      const feedbackClass = lastTrial.correct ? "feedback correct" : "feedback incorrect";

      return `<div class="${feedbackClass}">${feedbackText}</div>`;
    },
    choices: "NO_KEYS",
    trial_duration: config.feedbackDuration,
    data: {
      task: TASK_NAME,
      phase: "test",
      part: "feedback",
    },
  };
}

/**
 * Creates the main trial block using loop_function for stopping.
 */
function createTrialBlock(jsPsych: JsPsych, config: ResolvedConfig) {
  const deck = generateStimulusDeck(config);
  const rules: Rule[] = ["color", "shape", "number"];

  // State object that persists across trials
  const state = {
    currentRuleIndex: 0,
    previousRule: null as Rule | null,
    consecutiveCorrect: 0,
    categoriesCompleted: 0,
    trialNumber: 0,
    cardIndex: 0,
  };

  const trialTimeline: any[] = [];

  // Sorting trial
  trialTimeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const stimulus = deck[state.cardIndex];
      return `
        <div class="bcst-container">
          <div class="bcst-stimulus-area">
            ${generateCardHtml(stimulus, true)}
            <p class="bcst-prompt">${config.text.sort_prompt}</p>
          </div>
        </div>
      `;
    },
    choices: ["", "", "", ""],
    button_html: (choice: string, index: number) =>
      `<button class="jspsych-btn" style="padding: 0; border: none; background: none;">${generateCardHtml(REFERENCE_CARDS[index])}</button>`,
    data: () => {
      const stimulus = deck[state.cardIndex];
      const currentRule = rules[state.currentRuleIndex];
      return {
        task: TASK_NAME,
        task_version: VERSION,
        trial_number: state.trialNumber + 1,
        stimulus_color: stimulus.color,
        stimulus_shape: stimulus.shape,
        stimulus_number: stimulus.number,
        current_rule: currentRule,
        previous_rule: state.previousRule,
        phase: "test",
        part: "sorting",
      };
    },
    on_finish: (data: any) => {
      const stimulus = deck[state.cardIndex];
      const currentRule = rules[state.currentRuleIndex];
      const response = data.response;

      // Check if correct on current rule
      data.correct = matchesDimension(stimulus, response, currentRule);

      // Check if perseverative (matches previous rule but not current)
      if (state.previousRule !== null) {
        const matchesPrevious = matchesDimension(stimulus, response, state.previousRule);
        data.is_perseverative = matchesPrevious && !data.correct;
      } else {
        data.is_perseverative = false;
      }

      // Update state
      if (data.correct) {
        state.consecutiveCorrect++;
        if (state.consecutiveCorrect >= config.runLength) {
          // Rule change
          state.previousRule = currentRule;
          state.currentRuleIndex = (state.currentRuleIndex + 1) % rules.length;
          state.consecutiveCorrect = 0;
          state.categoriesCompleted++;
        }
      } else {
        state.consecutiveCorrect = 0;
      }

      data.consecutive_correct = state.consecutiveCorrect;
      data.categories_completed = state.categoriesCompleted;

      // Advance to next card
      state.trialNumber++;
      state.cardIndex++;
    },
  });

  // Feedback trial
  if (config.showFeedback) {
    trialTimeline.push(createFeedbackTrial(jsPsych, config));
  }

  return {
    timeline: trialTimeline,
    loop_function: () => {
      // Stop if we've completed enough categories
      if (state.categoriesCompleted >= config.numCategories) {
        return false;
      }
      // Stop if we've run out of cards
      if (state.cardIndex >= deck.length) {
        return false;
      }
      return true;
    },
  };
}

/**
 * Creates a completion message trial.
 */
function createCompletionTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const data = jsPsych.data.get();
      const scores = calculateScores(data);
      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += `<h2>${config.text.task_complete}</h2>`;
      html += config.text.result_summary(scores.categoriesCompleted, scores.perseverativeErrors, scores.totalErrors);
      html += `</div>`;
      return html;
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "completion",
    },
  };
}

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics from the BCST data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const trials = data
    .filter({ task: TASK_NAME, phase: "test", part: "sorting" })
    .values() as TrialData[];

  if (trials.length === 0) {
    return {
      taskName: TASK_NAME,
      version: VERSION,
      totalTrials: 0,
      totalCorrect: 0,
      totalErrors: 0,
      accuracy: 0,
      categoriesCompleted: 0,
      trialsToFirstCategory: null,
      perseverativeResponses: 0,
      perseverativeErrors: 0,
      nonPerseverativeErrors: 0,
      percentPerseverativeErrors: 0,
      conceptualLevelResponses: 0,
      failureToMaintainSet: 0,
      meanRT: null,
    };
  }

  const totalTrials = trials.length;
  const correctTrials = trials.filter((t) => t.correct);
  const totalCorrect = correctTrials.length;
  const totalErrors = totalTrials - totalCorrect;
  const accuracy = totalCorrect / totalTrials;

  // Categories
  const lastTrial = trials[trials.length - 1];
  const categoriesCompleted = lastTrial.categories_completed;

  // Trials to first category
  const firstCategoryTrial = trials.find((t) => t.categories_completed === 1);
  const trialsToFirstCategory = firstCategoryTrial
    ? trials.indexOf(firstCategoryTrial) + 1
    : null;

  // Perseveration
  const perseverativeResponses = trials.filter((t) => t.is_perseverative).length;
  const perseverativeErrors = trials.filter((t) => t.is_perseverative && !t.correct).length;
  const nonPerseverativeErrors = totalErrors - perseverativeErrors;

  const percentPerseverativeErrors =
    totalErrors > 0 ? (perseverativeErrors / totalErrors) * 100 : 0;

  // Conceptual level responses (runs of 3+ correct)
  let conceptualLevelResponses = 0;
  let currentRun = 0;
  for (const trial of trials) {
    if (trial.correct) {
      currentRun++;
      if (currentRun >= 3) {
        conceptualLevelResponses++;
      }
    } else {
      currentRun = 0;
    }
  }

  // Failure to maintain set (errors after 5+ consecutive correct)
  let failureToMaintainSet = 0;
  currentRun = 0;
  for (const trial of trials) {
    if (trial.correct) {
      currentRun++;
    } else {
      if (currentRun >= 5) {
        failureToMaintainSet++;
      }
      currentRun = 0;
    }
  }

  // Mean RT
  const correctRTs = correctTrials.filter((t) => t.rt !== null).map((t) => t.rt as number);
  const meanRT = mean(correctRTs);

  return {
    taskName: TASK_NAME,
    version: VERSION,
    totalTrials,
    totalCorrect,
    totalErrors,
    accuracy,
    categoriesCompleted,
    trialsToFirstCategory,
    perseverativeResponses,
    perseverativeErrors,
    nonPerseverativeErrors,
    percentPerseverativeErrors,
    conceptualLevelResponses,
    failureToMaintainSet,
    meanRT,
  };
}

/**
 * Returns a summary of the BCST performance.
 */
function getSummary(data: DataCollection): ScoringResult {
  return calculateScores(data);
}

// -- MAIN EXPORT --

/**
 * Creates the complete Berg Card Sorting Test timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const bcstTimeline = createTimeline(jsPsych, {
 *   numCategories: 6,
 *   showInstructions: true,
 * });
 * jsPsych.run([bcstTimeline]);
 * ```
 */
export function createTimeline(jsPsych: JsPsych, options: BcstOptions = {}) {
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
    timeline.push(createInstructionTrials(config));
  }

  // Main trial block
  timeline.push(createTrialBlock(jsPsych, config));

  // Completion message
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom BCST experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createFeedbackTrial,
  createTrialBlock,
  createCompletionTrial,
};

/**
 * Utility functions for the BCST.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  stimuli: {
    generateDeck,
    generateCardHtml,
    generateReferenceCardsHtml,
    REFERENCE_CARDS,
    COLORS,
    SHAPES,
    NUMBERS,
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
