import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface IowaGamblingOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Total number of trials (default: 100) */
  numTrials?: number;
  /** Starting loan amount (default: 2000) */
  startingLoan?: number;
  /** Show borrowed amount display (default: true) */
  showLoan?: boolean;
  /** Win feedback display duration in ms (default: 2000) */
  winDisplayDuration?: number;
  /** Loss feedback display duration in ms (default: 2000) */
  lossDisplayDuration?: number;
  /** Inter-trial interval in ms (default: 500) */
  interTrialInterval?: number;
  /** Currency symbol (default: "$") */
  currencySymbol?: string;
  /** Custom text strings for translation. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  trial_number: number;
  block: number;
  deck_selected: string;
  deck_index: number;
  win_amount: number;
  loss_amount: number;
  net_amount: number;
  total_score: number;
  rt: number | null;
}

export interface ScoringResult {
  taskName: string;
  version: string;
  totalTrials: number;
  finalScore: number;
  netScore: number;
  deckACounts: number;
  deckBCounts: number;
  deckCCounts: number;
  deckDCounts: number;
  advantageousSelections: number;
  disadvantageousSelections: number;
  netScoreByBlock: number[];
  meanRT: number | null;
}

// Internal config type
interface ResolvedConfig {
  showInstructions: boolean;
  numTrials: number;
  startingLoan: number;
  showLoan: boolean;
  winDisplayDuration: number;
  lossDisplayDuration: number;
  interTrialInterval: number;
  currencySymbol: string;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "iowa-gambling";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  showInstructions: true,
  numTrials: 100,
  startingLoan: 2000,
  showLoan: true,
  winDisplayDuration: 2000,
  lossDisplayDuration: 2000,
  interTrialInterval: 500,
  currencySymbol: "$",
};

// Deck reward amounts (per card)
const DECK_REWARDS = {
  A: 100,
  B: 100,
  C: 50,
  D: 50,
};

// Penalty schedules (40-card cycles) based on Bechara et al. (1994)
const PENALTY_SCHEDULES = {
  A: [
    0, 0, 150, 0, 300, 0, 200, 0, 250, 350,
    0, 350, 0, 250, 200, 0, 300, 150, 0, 0,
    0, 300, 0, 350, 0, 200, 250, 150, 0, 0,
    350, 200, 250, 0, 0, 0, 150, 300, 0, 0,
  ],
  B: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1250,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1250,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1250,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1250,
  ],
  C: [
    0, 0, 50, 0, 50, 0, 50, 0, 50, 50,
    0, 25, 75, 0, 0, 0, 25, 75, 0, 50,
    0, 0, 0, 50, 25, 50, 0, 0, 75, 50,
    0, 0, 0, 25, 25, 0, 75, 0, 0, 50,
  ],
  D: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 250,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 250,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 250,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 250,
  ],
};

type DeckName = "A" | "B" | "C" | "D";
const DECK_NAMES: DeckName[] = ["A", "B", "C", "D"];

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Generates HTML for the deck selection display.
 */
function generateDecksHtml(
  config: ResolvedConfig,
  totalScore: number,
  trialNumber: number
): string {
  const scoreClass = totalScore >= 0 ? "positive" : "negative";
  const loanDisplay = config.showLoan
    ? `<div class="igt-score-item">
        <span class="igt-score-label">${config.text.borrowed_label}</span>
        <span class="igt-score-value">${config.currencySymbol}${config.startingLoan}</span>
      </div>`
    : "";

  return `
    <div class="igt-container">
      <div class="igt-trial-counter">
        ${config.text.trial_label(trialNumber, config.numTrials)}
      </div>
      <p class="igt-prompt">${config.text.select_deck_prompt}</p>
      <div class="igt-score-display">
        <div class="igt-score-item">
          <span class="igt-score-label">${config.text.total_label}</span>
          <span class="igt-score-value ${scoreClass}">${config.currencySymbol}${totalScore}</span>
        </div>
        ${loanDisplay}
      </div>
    </div>
  `;
}

/**
 * Generates HTML for the feedback display.
 */
function generateFeedbackHtml(
  config: ResolvedConfig,
  winAmount: number,
  lossAmount: number
): string {
  const netAmount = winAmount - lossAmount;
  const netClass = netAmount >= 0 ? "positive" : "negative";
  const netMessage =
    netAmount >= 0
      ? config.text.net_win_message(netAmount, config.currencySymbol)
      : config.text.net_loss_message(netAmount, config.currencySymbol);

  const lossHtml =
    lossAmount > 0
      ? `<div class="igt-feedback-loss">${config.text.loss_message(lossAmount, config.currencySymbol)}</div>`
      : `<div class="igt-feedback-loss" style="color: #666;">${config.text.no_loss_message}</div>`;

  return `
    <div class="igt-feedback">
      <div class="igt-feedback-win">${config.text.win_message(winAmount, config.currencySymbol)}</div>
      ${lossHtml}
      <div class="igt-feedback-net ${netClass}">${netMessage}</div>
    </div>
  `;
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials.
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
 * Creates the main trial block with deck selection and feedback.
 */
function createTrialBlock(jsPsych: JsPsych, config: ResolvedConfig) {
  // State that persists across trials
  const state = {
    totalScore: config.startingLoan,
    deckPositions: { A: 0, B: 0, C: 0, D: 0 } as Record<DeckName, number>,
    trialNumber: 0,
    lastWin: 0,
    lastLoss: 0,
    lastDeck: "" as DeckName,
  };

  const trialTimeline: any[] = [];

  // Deck selection trial
  trialTimeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      return generateDecksHtml(config, state.totalScore, state.trialNumber + 1);
    },
    choices: config.text.deck_labels,
    button_html: (choice: string, index: number) => {
      const deckName = DECK_NAMES[index];
      return `<button class="jspsych-btn" style="padding: 0; border: none; background: none;">
        <div class="igt-deck">
          <span class="igt-deck-label">${choice}</span>
        </div>
      </button>`;
    },
    data: () => ({
      task: TASK_NAME,
      task_version: VERSION,
      trial_number: state.trialNumber + 1,
      block: Math.floor(state.trialNumber / 20) + 1,
      phase: "test",
      part: "selection",
    }),
    on_finish: (data: any) => {
      const deckIndex = data.response;
      const deckName = DECK_NAMES[deckIndex];

      // Calculate win and loss
      const winAmount = DECK_REWARDS[deckName];
      const penaltySchedule = PENALTY_SCHEDULES[deckName];
      const deckPosition = state.deckPositions[deckName];
      const lossAmount = penaltySchedule[deckPosition % penaltySchedule.length];

      // Update state
      state.deckPositions[deckName]++;
      const netAmount = winAmount - lossAmount;
      state.totalScore += netAmount;
      state.lastWin = winAmount;
      state.lastLoss = lossAmount;
      state.lastDeck = deckName;

      // Record data
      data.deck_selected = deckName;
      data.deck_index = deckIndex;
      data.win_amount = winAmount;
      data.loss_amount = lossAmount;
      data.net_amount = netAmount;
      data.total_score = state.totalScore;
    },
  });

  // Feedback trial
  trialTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      return generateFeedbackHtml(config, state.lastWin, state.lastLoss);
    },
    choices: "NO_KEYS",
    trial_duration: () => {
      // Show longer if there's a loss
      return state.lastLoss > 0
        ? config.winDisplayDuration + config.lossDisplayDuration
        : config.winDisplayDuration;
    },
    data: {
      task: TASK_NAME,
      phase: "test",
      part: "feedback",
    },
  });

  // ITI
  trialTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "",
    choices: "NO_KEYS",
    trial_duration: config.interTrialInterval,
    data: {
      task: TASK_NAME,
      phase: "test",
      part: "iti",
    },
    on_finish: () => {
      state.trialNumber++;
    },
  });

  return {
    timeline: trialTimeline,
    loop_function: () => {
      return state.trialNumber < config.numTrials;
    },
  };
}

/**
 * Creates the completion trial.
 */
function createCompletionTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const data = jsPsych.data.get();
      const scores = calculateScores(data, config.startingLoan);
      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += `<h2>${config.text.task_complete}</h2>`;
      html += config.text.result_summary(scores.finalScore, scores.netScore, scores.advantageousSelections);
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
 * Calculates scoring metrics from the Iowa Gambling Task data.
 */
function calculateScores(data: DataCollection, startingLoan: number = 2000): ScoringResult {
  const trials = data
    .filter({ task: TASK_NAME, phase: "test", part: "selection" })
    .values() as TrialData[];

  if (trials.length === 0) {
    return {
      taskName: TASK_NAME,
      version: VERSION,
      totalTrials: 0,
      finalScore: startingLoan,
      netScore: 0,
      deckACounts: 0,
      deckBCounts: 0,
      deckCCounts: 0,
      deckDCounts: 0,
      advantageousSelections: 0,
      disadvantageousSelections: 0,
      netScoreByBlock: [],
      meanRT: null,
    };
  }

  // Final score
  const lastTrial = trials[trials.length - 1];
  const finalScore = lastTrial.total_score;
  const netScore = finalScore - startingLoan;

  // Deck counts
  const deckCounts = { A: 0, B: 0, C: 0, D: 0 };
  for (const trial of trials) {
    deckCounts[trial.deck_selected as DeckName]++;
  }

  const advantageousSelections = deckCounts.C + deckCounts.D;
  const disadvantageousSelections = deckCounts.A + deckCounts.B;

  // Block scores (every 20 trials)
  const netScoreByBlock: number[] = [];
  for (let block = 0; block < 5; block++) {
    const blockTrials = trials.slice(block * 20, (block + 1) * 20);
    if (blockTrials.length > 0) {
      const blockAdvantage =
        blockTrials.filter((t) => t.deck_selected === "C" || t.deck_selected === "D").length;
      const blockDisadvantage =
        blockTrials.filter((t) => t.deck_selected === "A" || t.deck_selected === "B").length;
      netScoreByBlock.push(blockAdvantage - blockDisadvantage);
    }
  }

  // Mean RT
  const rts = trials.filter((t) => t.rt !== null).map((t) => t.rt as number);
  const meanRT = mean(rts);

  return {
    taskName: TASK_NAME,
    version: VERSION,
    totalTrials: trials.length,
    finalScore,
    netScore,
    deckACounts: deckCounts.A,
    deckBCounts: deckCounts.B,
    deckCCounts: deckCounts.C,
    deckDCounts: deckCounts.D,
    advantageousSelections,
    disadvantageousSelections,
    netScoreByBlock,
    meanRT,
  };
}

/**
 * Returns a summary of the Iowa Gambling Task performance.
 */
function getSummary(data: DataCollection, startingLoan: number = 2000): ScoringResult {
  return calculateScores(data, startingLoan);
}

// -- MAIN EXPORT --

/**
 * Creates the complete Iowa Gambling Task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const igtTimeline = createTimeline(jsPsych, {
 *   numTrials: 100,
 *   showInstructions: true,
 * });
 * jsPsych.run([igtTimeline]);
 * ```
 */
export function createTimeline(jsPsych: JsPsych, options: IowaGamblingOptions = {}) {
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

  // Completion
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units for custom experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createTrialBlock,
  createCompletionTrial,
};

/**
 * Utility functions for the Iowa Gambling Task.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  stimuli: {
    generateDecksHtml,
    generateFeedbackHtml,
    DECK_REWARDS,
    PENALTY_SCHEDULES,
    DECK_NAMES,
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
