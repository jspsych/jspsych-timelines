import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface OperationSpanOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Show practice trials (default: true) */
  showPractice?: boolean;
  /** Set sizes to use (default: [3, 4, 5, 6, 7]) */
  setSizes?: number[];
  /** Number of trials per set size (default: 3) */
  trialsPerSetSize?: number;
  /** Letter display duration in ms (default: 800) */
  letterDuration?: number;
  /** Math problem timeout in ms (default: null = no timeout) */
  mathTimeout?: number | null;
  /** Math feedback duration in ms (default: 500) */
  mathFeedbackDuration?: number;
  /** Recall feedback duration in ms (default: 2000) */
  recallFeedbackDuration?: number;
  /** ISI between letter and next math (default: 250) */
  isi?: number;
  /** Custom text strings for translation. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  trial_number: number;
  set_size: number;
  target_letters: string[];
  recalled_letters: string[];
  letters_correct: number;
  perfect_recall: boolean;
  math_problems: MathProblemResult[];
  math_correct: number;
  math_total: number;
  mean_math_rt: number | null;
}

interface MathProblem {
  text: string;
  displayAnswer: number;
  correctAnswer: number;
  isTrue: boolean;
}

interface MathProblemResult extends MathProblem {
  response: boolean | null;
  correct: boolean;
  rt: number | null;
}

export interface ScoringResult {
  taskName: string;
  version: string;
  totalTrials: number;
  ospanScore: number;
  absoluteSpanScore: number;
  totalLettersCorrect: number;
  totalLetters: number;
  mathAccuracy: number;
  meanMathRT: number | null;
}

// Internal config type
interface ResolvedConfig {
  showInstructions: boolean;
  showPractice: boolean;
  setSizes: number[];
  trialsPerSetSize: number;
  letterDuration: number;
  mathTimeout: number | null;
  mathFeedbackDuration: number;
  recallFeedbackDuration: number;
  isi: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "operation-span";
const VERSION = "0.0.1";

// Letters used for memory task (consonants only, no vowels)
const DEFAULT_LETTERS = ["F", "H", "J", "K", "L", "N", "P", "Q", "R", "S", "T", "Y"];

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPractice: true,
  setSizes: [3, 4, 5, 6, 7],
  trialsPerSetSize: 3,
  letterDuration: 800,
  mathTimeout: null,
  mathFeedbackDuration: 500,
  recallFeedbackDuration: 2000,
  isi: 250,
};

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function sampleWithoutReplacement<T>(array: T[], n: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, n);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a math problem.
 */
function generateMathProblem(): MathProblem {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  const c = randInt(1, 9);
  const op1 = Math.random() < 0.5 ? "+" : "-";
  const op2 = Math.random() < 0.5 ? "+" : "-";

  // Calculate correct answer
  let result = a;
  result = op1 === "+" ? result + b : result - b;
  result = op2 === "+" ? result + c : result - c;

  const correctAnswer = result;
  const isTrue = Math.random() < 0.5;

  // Generate display answer (correct or off by 1-3)
  let displayAnswer: number;
  if (isTrue) {
    displayAnswer = correctAnswer;
  } else {
    const offset = randInt(1, 3) * (Math.random() < 0.5 ? 1 : -1);
    displayAnswer = correctAnswer + offset;
  }

  return {
    text: `(${a} ${op1} ${b}) ${op2} ${c} = ${displayAnswer}`,
    displayAnswer,
    correctAnswer,
    isTrue,
  };
}

/**
 * Generates the recall grid HTML.
 */
function generateRecallGridHtml(
  config: ResolvedConfig,
  selectedLetters: string[],
  disabledLetters: string[]
): string {
  const gridButtons = DEFAULT_LETTERS.map((letter) => {
    const isDisabled = disabledLetters.includes(letter);
    const disabledAttr = isDisabled ? "disabled" : "";
    return `<button class="ospan-recall-btn" data-letter="${letter}" ${disabledAttr}>${letter}</button>`;
  }).join("");

  const responseDisplay = selectedLetters.length > 0
    ? selectedLetters.map((l) =>
        `<span class="ospan-response-letter ${l === "_" ? "blank" : ""}">${l === "_" ? "?" : l}</span>`
      ).join("")
    : '<span style="color: #999;">Click letters above</span>';

  return `
    <div class="ospan-recall-container">
      <p class="ospan-prompt">${config.text.recall_prompt}</p>
      <div class="ospan-recall-grid">
        ${gridButtons}
      </div>
      <div class="ospan-response-display">
        ${responseDisplay}
      </div>
      <div class="ospan-controls">
        <button class="ospan-control-btn clear">${config.text.clear_button}</button>
        <button class="ospan-control-btn blank">${config.text.blank_button}</button>
        <button class="ospan-control-btn done">${config.text.done_button}</button>
      </div>
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
      trial_part: "instruction",
    },
  };
}

/**
 * Creates a math problem trial.
 */
function createMathTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  problem: MathProblem,
  onFinish: (result: MathProblemResult) => void
) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div class="ospan-container">
        <div class="ospan-math">${problem.text}</div>
        <p class="ospan-math-prompt">Is this correct?</p>
      </div>
    `,
    choices: [config.text.true_button, config.text.false_button],
    trial_duration: config.mathTimeout,
    data: {
      task: TASK_NAME,
      trial_part: "math",
    },
    on_finish: (data: any) => {
      const response = data.response === null ? null : data.response === 0;
      const correct = response === problem.isTrue;

      onFinish({
        ...problem,
        response,
        correct,
        rt: data.rt,
      });
    },
  };
}

/**
 * Creates a math feedback trial.
 */
function createMathFeedbackTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  getResult: () => MathProblemResult
) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      const result = getResult();
      let feedbackText: string;
      let feedbackClass: string;

      if (result.response === null) {
        feedbackText = config.text.timeout_feedback;
        feedbackClass = "incorrect";
      } else if (result.correct) {
        feedbackText = config.text.correct_feedback;
        feedbackClass = "correct";
      } else {
        feedbackText = config.text.incorrect_feedback;
        feedbackClass = "incorrect";
      }

      return `<div class="ospan-feedback ${feedbackClass}">${feedbackText}</div>`;
    },
    choices: "NO_KEYS",
    trial_duration: config.mathFeedbackDuration,
    data: {
      task: TASK_NAME,
      trial_part: "math_feedback",
    },
  };
}

/**
 * Creates a letter display trial.
 */
function createLetterTrial(config: ResolvedConfig, letter: string) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="ospan-container">
        <div class="ospan-letter">${letter}</div>
      </div>
    `,
    choices: "NO_KEYS",
    trial_duration: config.letterDuration,
    data: {
      task: TASK_NAME,
      trial_part: "letter",
      letter: letter,
    },
  };
}

/**
 * Creates an ISI trial.
 */
function createIsiTrial(config: ResolvedConfig) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "",
    choices: "NO_KEYS",
    trial_duration: config.isi,
    data: {
      task: TASK_NAME,
      trial_part: "isi",
    },
  };
}

/**
 * Creates the recall phase using a custom approach.
 * Uses on_load to set up event listeners for the interactive grid.
 */
function createRecallTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  targetLetters: string[],
  mathResults: MathProblemResult[],
  trialNumber: number
) {
  let selectedLetters: string[] = [];

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => generateRecallGridHtml(config, selectedLetters, []),
    choices: [], // No choices - we handle clicks manually
    button_html: () => "", // No buttons
    trial_duration: null,
    response_ends_trial: false,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      trial_part: "recall",
      trial_number: trialNumber,
      set_size: targetLetters.length,
      target_letters: targetLetters,
    },
    on_load: () => {
      const container = document.querySelector(".ospan-recall-container");
      if (!container) return;

      const updateDisplay = () => {
        const displayArea = container.querySelector(".ospan-response-display");
        if (displayArea) {
          displayArea.innerHTML = selectedLetters.length > 0
            ? selectedLetters.map((l) =>
                `<span class="ospan-response-letter ${l === "_" ? "blank" : ""}">${l === "_" ? "?" : l}</span>`
              ).join("")
            : '<span style="color: #999;">Click letters above</span>';
        }
      };

      // Letter button clicks
      container.querySelectorAll(".ospan-recall-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const letter = (e.target as HTMLElement).dataset.letter;
          if (letter && selectedLetters.length < targetLetters.length) {
            selectedLetters.push(letter);
            updateDisplay();
          }
        });
      });

      // Clear button
      container.querySelector(".ospan-control-btn.clear")?.addEventListener("click", () => {
        selectedLetters = [];
        updateDisplay();
      });

      // Blank button
      container.querySelector(".ospan-control-btn.blank")?.addEventListener("click", () => {
        if (selectedLetters.length < targetLetters.length) {
          selectedLetters.push("_");
          updateDisplay();
        }
      });

      // Done button
      container.querySelector(".ospan-control-btn.done")?.addEventListener("click", () => {
        jsPsych.finishTrial({
          recalled_letters: selectedLetters,
        });
      });
    },
    on_finish: (data: any) => {
      const recalled = data.recalled_letters || selectedLetters;

      // Score: count letters in correct positions
      let lettersCorrect = 0;
      for (let i = 0; i < targetLetters.length; i++) {
        if (i < recalled.length && recalled[i] === targetLetters[i]) {
          lettersCorrect++;
        }
      }

      const perfectRecall = lettersCorrect === targetLetters.length;

      // Math results
      const mathCorrect = mathResults.filter((r) => r.correct).length;
      const mathRTs = mathResults.filter((r) => r.rt !== null).map((r) => r.rt as number);
      const meanMathRt = mean(mathRTs);

      data.recalled_letters = recalled;
      data.letters_correct = lettersCorrect;
      data.perfect_recall = perfectRecall;
      data.math_problems = mathResults;
      data.math_correct = mathCorrect;
      data.math_total = mathResults.length;
      data.mean_math_rt = meanMathRt;
    },
  };
}

/**
 * Creates recall feedback trial.
 */
function createRecallFeedbackTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().filter({ trial_part: "recall" }).last(1).values()[0];
      const lettersCorrect = lastTrial?.letters_correct || 0;
      const totalLetters = lastTrial?.set_size || 0;
      const mathCorrect = lastTrial?.math_correct || 0;
      const mathTotal = lastTrial?.math_total || 0;

      return `
        <div class="ospan-results">
          <div class="ospan-results-letters">
            ${config.text.recall_feedback(lettersCorrect, totalLetters)}
          </div>
          <div class="ospan-results-math">
            ${config.text.math_feedback(mathCorrect, mathTotal)}
          </div>
        </div>
      `;
    },
    choices: "NO_KEYS",
    trial_duration: config.recallFeedbackDuration,
    data: {
      task: TASK_NAME,
      trial_part: "recall_feedback",
    },
  };
}

/**
 * Creates a single OSPAN trial (set size N).
 */
function createOspanTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  setSize: number,
  trialNumber: number
) {
  // Select letters for this trial
  const targetLetters = sampleWithoutReplacement(DEFAULT_LETTERS, setSize);

  // Generate math problems
  const mathProblems = Array(setSize).fill(null).map(() => generateMathProblem());

  // Store math results
  const mathResults: MathProblemResult[] = [];

  const timeline: any[] = [];

  // Set size announcement
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class="ospan-announcement">${config.text.set_size_announcement(setSize)}</div>`,
    choices: "NO_KEYS",
    trial_duration: 1500,
    data: {
      task: TASK_NAME,
      trial_part: "announcement",
    },
  });

  // Interleaved math-letter pairs
  for (let i = 0; i < setSize; i++) {
    // Math problem
    timeline.push(
      createMathTrial(jsPsych, config, mathProblems[i], (result) => {
        mathResults.push(result);
      })
    );

    // Math feedback
    timeline.push(
      createMathFeedbackTrial(jsPsych, config, () => mathResults[mathResults.length - 1])
    );

    // Letter
    timeline.push(createLetterTrial(config, targetLetters[i]));

    // ISI (except after last letter)
    if (i < setSize - 1) {
      timeline.push(createIsiTrial(config));
    }
  }

  // Recall phase
  timeline.push(createRecallTrial(jsPsych, config, targetLetters, mathResults, trialNumber));

  // Recall feedback
  timeline.push(createRecallFeedbackTrial(jsPsych, config));

  return { timeline };
}

/**
 * Creates the main trial block.
 */
function createTrialBlock(jsPsych: JsPsych, config: ResolvedConfig) {
  // Generate trial sequence
  const trials: number[] = [];
  for (const setSize of config.setSizes) {
    for (let i = 0; i < config.trialsPerSetSize; i++) {
      trials.push(setSize);
    }
  }

  // Shuffle trial order
  const shuffledTrials = shuffleArray(trials);

  // Create timeline
  const timeline: any[] = [];
  shuffledTrials.forEach((setSize, index) => {
    timeline.push(createOspanTrial(jsPsych, config, setSize, index + 1));
  });

  return { timeline };
}

/**
 * Creates the completion trial.
 */
function createCompletionTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const scores = calculateScores(jsPsych.data.get());
      return `
        <div class="ospan-container">
          <h2>${config.text.task_complete}</h2>
          <div style="font-size: 20px; margin-top: 20px;">
            ${config.text.final_score(scores.ospanScore, scores.mathAccuracy)}
          </div>
        </div>
      `;
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      trial_part: "completion",
    },
  };
}

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics from the Operation Span data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const trials = data
    .filter({ task: TASK_NAME, trial_part: "recall" })
    .values() as TrialData[];

  if (trials.length === 0) {
    return {
      taskName: TASK_NAME,
      version: VERSION,
      totalTrials: 0,
      ospanScore: 0,
      absoluteSpanScore: 0,
      totalLettersCorrect: 0,
      totalLetters: 0,
      mathAccuracy: 0,
      meanMathRT: null,
    };
  }

  // Partial credit score (OSPAN score)
  const ospanScore = trials.reduce((sum, t) => sum + t.letters_correct, 0);

  // Absolute span score (sum of set sizes for perfect trials)
  const absoluteSpanScore = trials
    .filter((t) => t.perfect_recall)
    .reduce((sum, t) => sum + t.set_size, 0);

  // Total letters
  const totalLettersCorrect = ospanScore;
  const totalLetters = trials.reduce((sum, t) => sum + t.set_size, 0);

  // Math accuracy
  const totalMathCorrect = trials.reduce((sum, t) => sum + t.math_correct, 0);
  const totalMathProblems = trials.reduce((sum, t) => sum + t.math_total, 0);
  const mathAccuracy = totalMathProblems > 0 ? totalMathCorrect / totalMathProblems : 0;

  // Mean math RT
  const allMathRTs: number[] = [];
  for (const trial of trials) {
    if (trial.mean_math_rt !== null) {
      allMathRTs.push(trial.mean_math_rt);
    }
  }
  const meanMathRT = mean(allMathRTs);

  return {
    taskName: TASK_NAME,
    version: VERSION,
    totalTrials: trials.length,
    ospanScore,
    absoluteSpanScore,
    totalLettersCorrect,
    totalLetters,
    mathAccuracy,
    meanMathRT,
  };
}

/**
 * Returns a summary of the Operation Span performance.
 */
function getSummary(data: DataCollection): ScoringResult {
  return calculateScores(data);
}

// -- MAIN EXPORT --

/**
 * Creates the complete Operation Span Task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const ospanTimeline = createTimeline(jsPsych, {
 *   setSizes: [3, 4, 5],
 *   trialsPerSetSize: 2,
 * });
 * jsPsych.run([ospanTimeline]);
 * ```
 */
export function createTimeline(jsPsych: JsPsych, options: OperationSpanOptions = {}) {
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
  createMathTrial,
  createMathFeedbackTrial,
  createLetterTrial,
  createRecallTrial,
  createRecallFeedbackTrial,
  createOspanTrial,
  createTrialBlock,
  createCompletionTrial,
};

/**
 * Utility functions for the Operation Span Task.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  stimuli: {
    generateMathProblem,
    generateRecallGridHtml,
    DEFAULT_LETTERS,
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
