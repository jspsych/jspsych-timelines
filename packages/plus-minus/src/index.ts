import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface PlusMinusOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Include practice trials before each block (default: true) */
  showPractice?: boolean;
  /** Number of practice trials per block (default: 3) */
  numPracticeTrials?: number;
  /** Number of trials per block (default: 30) */
  trialsPerBlock?: number;
  /** The number to add/subtract (default: 3) */
  operand?: number;
  /** Minimum starting number (default: 10) */
  minNumber?: number;
  /** Maximum starting number (default: 99) */
  maxNumber?: number;
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
  block: "add" | "subtract" | "alternate";
  trial_index: number;
  stimulus: number;
  operation: "add" | "subtract";
  correct_answer: number;
  response: number | null;
  correct: boolean;
  rt: number;
}

export interface BlockData {
  block: "add" | "subtract" | "alternate";
  total_time: number;
  num_correct: number;
  num_trials: number;
  accuracy: number;
}

export interface ScoringResult {
  /** Time for addition block (ms) */
  addBlockTime: number;
  /** Time for subtraction block (ms) */
  subtractBlockTime: number;
  /** Time for alternating block (ms) */
  alternateBlockTime: number;
  /** Switch cost: alternating - average(add, subtract) */
  switchCost: number;
  /** Accuracy for addition block */
  addAccuracy: number;
  /** Accuracy for subtraction block */
  subtractAccuracy: number;
  /** Accuracy for alternating block */
  alternateAccuracy: number;
  /** Overall accuracy */
  overallAccuracy: number;
  /** Block-level data */
  blockData: BlockData[];
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  showPractice: boolean;
  numPracticeTrials: number;
  trialsPerBlock: number;
  operand: number;
  minNumber: number;
  maxNumber: number;
  showPracticeFeedback: boolean;
  feedbackDuration: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "plus-minus";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPractice: true,
  numPracticeTrials: 3,
  trialsPerBlock: 30,
  operand: 3,
  minNumber: 10,
  maxNumber: 99,
  showPracticeFeedback: true,
  feedbackDuration: 500,
};

// -- UTILITY FUNCTIONS --

/**
 * Generates a random integer between min and max (inclusive).
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates an array of random numbers for a block.
 */
function generateNumbers(count: number, min: number, max: number): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    numbers.push(randomInt(min, max));
  }
  return numbers;
}

/**
 * Creates HTML for a number pad input.
 */
function createNumberPadHTML(stimulus: number, operation: "add" | "subtract", operand: number): string {
  const opSymbol = operation === "add" ? "+" : "−";
  const opLabel = operation === "add" ? "ADD" : "SUBTRACT";

  return `
    <div style="max-width: 400px; margin: 0 auto; text-align: center;">
      <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
        <strong>${opLabel} ${operand}</strong>
      </div>
      <div style="font-size: 48px; margin-bottom: 20px; font-family: monospace;">
        ${stimulus} ${opSymbol} ${operand} = ?
      </div>
      <div id="response-display" style="font-size: 36px; height: 50px; border: 2px solid #333; margin-bottom: 15px; line-height: 50px; font-family: monospace; background: #f9f9f9;">
        &nbsp;
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 240px; margin: 0 auto;">
        <button type="button" class="numpad-btn" data-value="1" style="padding: 15px; font-size: 24px; cursor: pointer;">1</button>
        <button type="button" class="numpad-btn" data-value="2" style="padding: 15px; font-size: 24px; cursor: pointer;">2</button>
        <button type="button" class="numpad-btn" data-value="3" style="padding: 15px; font-size: 24px; cursor: pointer;">3</button>
        <button type="button" class="numpad-btn" data-value="4" style="padding: 15px; font-size: 24px; cursor: pointer;">4</button>
        <button type="button" class="numpad-btn" data-value="5" style="padding: 15px; font-size: 24px; cursor: pointer;">5</button>
        <button type="button" class="numpad-btn" data-value="6" style="padding: 15px; font-size: 24px; cursor: pointer;">6</button>
        <button type="button" class="numpad-btn" data-value="7" style="padding: 15px; font-size: 24px; cursor: pointer;">7</button>
        <button type="button" class="numpad-btn" data-value="8" style="padding: 15px; font-size: 24px; cursor: pointer;">8</button>
        <button type="button" class="numpad-btn" data-value="9" style="padding: 15px; font-size: 24px; cursor: pointer;">9</button>
        <button type="button" class="numpad-btn" data-value="clear" style="padding: 15px; font-size: 18px; cursor: pointer;">Clear</button>
        <button type="button" class="numpad-btn" data-value="0" style="padding: 15px; font-size: 24px; cursor: pointer;">0</button>
        <button type="button" class="numpad-btn" data-value="submit" style="padding: 15px; font-size: 18px; cursor: pointer; background: #4CAF50; color: white;">OK</button>
      </div>
    </div>
  `;
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials.
 */
function createInstructionTrials(
  config: ResolvedConfig,
  section: "intro" | "add" | "subtract" | "alternate" | "practice"
) {
  const timeline: any[] = [];

  let stimulus: string;
  let buttonLabel: string;

  switch (section) {
    case "intro":
      stimulus = config.text.instruction_intro;
      buttonLabel = config.text.continue_button;
      break;
    case "add":
      stimulus = config.text.instruction_add;
      buttonLabel = config.text.start_button;
      break;
    case "subtract":
      stimulus = config.text.instruction_subtract;
      buttonLabel = config.text.start_button;
      break;
    case "alternate":
      stimulus = config.text.instruction_alternate;
      buttonLabel = config.text.start_button;
      break;
    case "practice":
      stimulus = config.text.instruction_practice;
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
      part: "instruction",
    },
  });

  return { timeline };
}

/**
 * Creates a single arithmetic trial with number pad input.
 */
function createArithmeticTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  stimulus: number,
  operation: "add" | "subtract",
  block: "add" | "subtract" | "alternate",
  phase: "practice" | "test",
  trialIndex: number,
  showFeedback: boolean
) {
  const correctAnswer = operation === "add"
    ? stimulus + config.operand
    : stimulus - config.operand;

  const timeline: any[] = [];

  // Main trial with number pad
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: createNumberPadHTML(stimulus, operation, config.operand),
    choices: [], // No standard buttons - we use custom handling
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      part: "response",
      phase: phase,
      block: block,
      trial_index: trialIndex,
      stimulus: stimulus,
      operation: operation,
      correct_answer: correctAnswer,
    },
    on_load: () => {
      let currentResponse = "";
      const display = document.getElementById("response-display");
      const buttons = document.querySelectorAll(".numpad-btn");
      const startTime = performance.now();

      buttons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const value = (e.target as HTMLElement).getAttribute("data-value");

          if (value === "clear") {
            currentResponse = "";
          } else if (value === "submit") {
            if (currentResponse.length > 0) {
              const rt = performance.now() - startTime;
              const response = parseInt(currentResponse, 10);
              const correct = response === correctAnswer;

              jsPsych.finishTrial({
                response: response,
                correct: correct,
                rt: rt,
              });
            }
          } else if (currentResponse.length < 3) {
            currentResponse += value;
          }

          if (display) {
            display.textContent = currentResponse || "\u00A0";
          }
        });
      });
    },
    on_finish: (data: any) => {
      // Data is already set by the on_load handler
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
        part: "feedback",
      },
    });
  }

  return { timeline };
}

/**
 * Creates a block of trials.
 */
function createBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  blockType: "add" | "subtract" | "alternate",
  phase: "practice" | "test"
) {
  const numTrials = phase === "practice" ? config.numPracticeTrials : config.trialsPerBlock;
  const numbers = generateNumbers(numTrials, config.minNumber, config.maxNumber);
  const showFeedback = phase === "practice" && config.showPracticeFeedback;

  const timeline: any[] = [];

  numbers.forEach((num, i) => {
    let operation: "add" | "subtract";

    if (blockType === "add") {
      operation = "add";
    } else if (blockType === "subtract") {
      operation = "subtract";
    } else {
      // Alternating: even indices add, odd indices subtract
      operation = i % 2 === 0 ? "add" : "subtract";
    }

    timeline.push(
      createArithmeticTrial(
        jsPsych,
        config,
        num,
        operation,
        blockType,
        phase,
        i + 1,
        showFeedback
      )
    );
  });

  return { timeline };
}

/**
 * Creates a block summary screen.
 */
function createBlockSummary(jsPsych: JsPsych, config: ResolvedConfig, blockType: "add" | "subtract" | "alternate") {
  const blockNames = {
    add: "Addition Block",
    subtract: "Subtraction Block",
    alternate: "Alternating Block",
  };

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const blockTrials = jsPsych.data
        .get()
        .filter({ task: TASK_NAME, phase: "test", block: blockType, part: "response" })
        .values();

      const totalTime = blockTrials.reduce((sum: number, t: any) => sum + t.rt, 0);

      return config.text.block_complete(blockNames[blockType], totalTime);
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      part: "block_summary",
      block: blockType,
    },
  };
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
        scores.addBlockTime,
        scores.subtractBlockTime,
        scores.alternateBlockTime,
        scores.switchCost
      );
      html += `</div>`;
      return html;
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      part: "completion",
    },
  };
}

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics from the Plus-Minus task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const getBlockData = (block: "add" | "subtract" | "alternate"): BlockData => {
    const trials = data
      .filter({ task: TASK_NAME, phase: "test", block: block, part: "response" })
      .values() as TrialData[];

    const totalTime = trials.reduce((sum, t) => sum + t.rt, 0);
    const numCorrect = trials.filter((t) => t.correct).length;
    const numTrials = trials.length;
    const accuracy = numTrials > 0 ? (numCorrect / numTrials) * 100 : 0;

    return {
      block,
      total_time: totalTime,
      num_correct: numCorrect,
      num_trials: numTrials,
      accuracy,
    };
  };

  const addData = getBlockData("add");
  const subtractData = getBlockData("subtract");
  const alternateData = getBlockData("alternate");

  const avgSingleTaskTime = (addData.total_time + subtractData.total_time) / 2;
  const switchCost = alternateData.total_time - avgSingleTaskTime;

  const allTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "response" })
    .values() as TrialData[];
  const overallAccuracy = allTrials.length > 0
    ? (allTrials.filter((t) => t.correct).length / allTrials.length) * 100
    : 0;

  return {
    addBlockTime: addData.total_time,
    subtractBlockTime: subtractData.total_time,
    alternateBlockTime: alternateData.total_time,
    switchCost,
    addAccuracy: addData.accuracy,
    subtractAccuracy: subtractData.accuracy,
    alternateAccuracy: alternateData.accuracy,
    overallAccuracy,
    blockData: [addData, subtractData, alternateData],
  };
}

/**
 * Returns a summary of the Plus-Minus task performance.
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
 * Creates the complete Plus-Minus task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const pmTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   trialsPerBlock: 30,
 * });
 * jsPsych.run([pmTimeline]);
 * ```
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: PlusMinusOptions = {}
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

  // Addition Block
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "add"));
  }
  if (config.showPractice) {
    timeline.push(createInstructionTrials(config, "practice"));
    timeline.push(createBlock(jsPsych, config, "add", "practice"));
  }
  timeline.push(createBlock(jsPsych, config, "add", "test"));
  timeline.push(createBlockSummary(jsPsych, config, "add"));

  // Subtraction Block
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "subtract"));
  }
  if (config.showPractice) {
    timeline.push(createInstructionTrials(config, "practice"));
    timeline.push(createBlock(jsPsych, config, "subtract", "practice"));
  }
  timeline.push(createBlock(jsPsych, config, "subtract", "test"));
  timeline.push(createBlockSummary(jsPsych, config, "subtract"));

  // Alternating Block
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "alternate"));
  }
  if (config.showPractice) {
    timeline.push(createInstructionTrials(config, "practice"));
    timeline.push(createBlock(jsPsych, config, "alternate", "practice"));
  }
  timeline.push(createBlock(jsPsych, config, "alternate", "test"));
  timeline.push(createBlockSummary(jsPsych, config, "alternate"));

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Plus-Minus experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createArithmeticTrial,
  createBlock,
  createBlockSummary,
  createCompletionTrial,
  generateNumbers,
};

/**
 * Utility functions for the Plus-Minus task.
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
