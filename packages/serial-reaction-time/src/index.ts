import "./styles.css";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychSerialReactionTimeMouse from "@jspsych/plugin-serial-reaction-time-mouse";
import { DataCollection, JsPsych } from "jspsych";

import { TextConfig, defaultText } from "./text";

// -- TYPES --

export interface SerialReactionTimeOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Show feedback during practice (default: true) */
  showPracticeFeedback?: boolean;
  /** Number of practice trials (default: 20) */
  numPracticeTrials?: number;
  /** Number of test blocks (default: 6) */
  numBlocks?: number;
  /** Number of trials per test block (default: 100) */
  trialsPerBlock?: number;
  /**
   * Number of stimulus positions (default: 4).
   * Only used when no custom `sequence` is provided. If you provide a `sequence`,
   * `numPositions` is inferred from `Math.max(...sequence) + 1`.
   */
  numPositions?: number;
  /**
   * The repeating sequence used in sequence blocks, as 0-indexed position numbers.
   * Default: the classic 10-element Nissen & Bullemer (1987) sequence
   * `[3, 1, 2, 0, 2, 1, 3, 2, 1, 0]` (corresponds to positions 4-2-3-1-3-2-4-3-2-1).
   */
  sequence?: number[];
  /**
   * Which block (1-indexed) uses a random sequence instead of the repeating one.
   * Used to estimate the sequence learning effect by comparing RT against
   * neighboring sequence blocks. Set to `0` (or any value > `numBlocks`) to
   * disable the random block. Default: 5.
   */
  randomBlockIndex?: number;
  /**
   * Maximum response time in ms. `null` means no time limit (the trial waits
   * until a response is given). Default: `null`.
   */
  responseDuration?: number | null;
  /**
   * Time in ms between a response and the appearance of the next stimulus
   * (response-to-stimulus interval). The empty grid is shown during this period.
   * Default: 250.
   */
  responseToStimulusInterval?: number;
  /**
   * Time in ms to display the plugin's built-in response feedback (clicked cell
   * flashes green if correct, red if incorrect) during the practice phase.
   * Ignored when `showPracticeFeedback` is false. Default: 400.
   */
  feedbackDuration?: number;
  /**
   * If true, participants can click any cell (not only the target). The trial
   * still records `correct` based on whether the clicked cell matched the
   * target. If false, only the target cell is clickable. Default: true.
   */
  allowNontargetResponses?: boolean;
  /** Pixel size of each grid cell, passed through to the plugin. Default: 100. */
  gridSquareSize?: number;
  /** Background color of the lit (target) cell. Default: "#333". */
  targetColor?: string;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "practice" | "test";
  block: number;
  trial: number;
  block_type: "sequence" | "random";
  target: number;
  correct_response: number;
  response: number | null;
  correct: boolean;
  rt: number | null;
}

export interface BlockSummary {
  block: number;
  block_type: "sequence" | "random";
  numTrials: number;
  numCorrect: number;
  accuracy: number;
  meanRT: number | null;
}

export interface ScoringResult {
  totalTrials: number;
  correctTrials: number;
  accuracy: number;
  meanRT: number | null;
  blockSummaries: BlockSummary[];
  sequenceLearningEffectRT: number | null;
}

interface ResolvedConfig {
  showInstructions: boolean;
  showPracticeFeedback: boolean;
  numPracticeTrials: number;
  numBlocks: number;
  trialsPerBlock: number;
  numPositions: number;
  sequence: number[];
  randomBlockIndex: number;
  responseDuration: number | null;
  responseToStimulusInterval: number;
  feedbackDuration: number;
  allowNontargetResponses: boolean;
  gridSquareSize: number;
  targetColor: string;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "serial-reaction-time";
const VERSION = "0.0.1";

/**
 * Classic Nissen & Bullemer (1987) sequence in 0-indexed positions.
 * Original: 4-2-3-1-3-2-4-3-2-1 (1-indexed) → 3-1-2-0-2-1-3-2-1-0 (0-indexed).
 */
const NISSEN_BULLEMER_SEQUENCE = [3, 1, 2, 0, 2, 1, 3, 2, 1, 0];

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPracticeFeedback: true,
  numPracticeTrials: 20,
  numBlocks: 6,
  trialsPerBlock: 100,
  numPositions: 4,
  sequence: NISSEN_BULLEMER_SEQUENCE,
  randomBlockIndex: 5,
  responseDuration: null as number | null,
  responseToStimulusInterval: 250,
  feedbackDuration: 400,
  allowNontargetResponses: true,
  gridSquareSize: 100,
  targetColor: "#333",
};

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Generates a random sequence of `length` positions, with the constraint that
 * no two consecutive positions are the same.
 */
function generateRandomSequence(length: number, numPositions: number): number[] {
  const out: number[] = [];
  let prev = -1;
  for (let i = 0; i < length; i++) {
    let next = Math.floor(Math.random() * numPositions);
    while (next === prev && numPositions > 1) {
      next = Math.floor(Math.random() * numPositions);
    }
    out.push(next);
    prev = next;
  }
  return out;
}

/**
 * Builds the sequence of target positions for a block.
 * - Sequence blocks repeat `config.sequence` until `trialsPerBlock` is reached.
 * - Random blocks generate fresh random positions with no immediate repeats.
 */
function buildBlockTargets(config: ResolvedConfig, blockType: "sequence" | "random"): number[] {
  if (blockType === "random") {
    return generateRandomSequence(config.trialsPerBlock, config.numPositions);
  }
  const out: number[] = [];
  for (let i = 0; i < config.trialsPerBlock; i++) {
    out.push(config.sequence[i % config.sequence.length]);
  }
  return out;
}

/**
 * Builds the single-row grid passed to the SRTT mouse plugin.
 */
function buildGrid(numPositions: number): number[][] {
  return [Array.from({ length: numPositions }, () => 1)];
}

// -- TIMELINE UNITS --

/**
 * Creates instruction screens for the SRTT.
 */
function createInstructionTrials(config: ResolvedConfig) {
  return {
    timeline: [
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: config.text.instruction_intro,
        choices: [config.text.continue_button],
        data: { task: TASK_NAME, part: "instruction" },
      },
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: config.text.instruction_practice_intro,
        choices: [config.text.start_button],
        data: { task: TASK_NAME, part: "instruction" },
      },
    ],
  };
}

/**
 * Creates a single SRTT stimulus trial. Uses the @jspsych/plugin-serial-reaction-time-mouse
 * plugin to render a row of grid cells with one cell highlighted as the target.
 *
 * When `showFeedback` is true, the plugin flashes the clicked cell green
 * (correct) or red (incorrect) for `config.feedbackDuration` ms before the
 * trial ends.
 *
 * The plugin records `target` and `response` as `[row, column]` pairs; this
 * wrapper flattens them to 0-indexed position numbers in `on_finish` so the
 * data shape matches the package's standard `TrialData` interface.
 */
function createStimulusTrial(
  config: ResolvedConfig,
  target: number,
  trialData: Omit<
    TrialData,
    "task_version" | "target" | "correct_response" | "response" | "correct" | "rt"
  >,
  showFeedback: boolean = false
) {
  return {
    type: jsPsychSerialReactionTimeMouse,
    grid: buildGrid(config.numPositions),
    target: [0, target],
    grid_square_size: config.gridSquareSize,
    target_color: config.targetColor,
    pre_target_duration: config.responseToStimulusInterval,
    trial_duration: config.responseDuration,
    allow_nontarget_responses: config.allowNontargetResponses,
    show_response_feedback: showFeedback,
    feedback_duration: config.feedbackDuration,
    data: {
      ...trialData,
      task_version: VERSION,
      target,
      correct_response: target,
    },
    on_finish: (data: any) => {
      // The plugin records response as [row, column]; flatten to a 0-indexed
      // position. A timeout (no response) leaves the row/column as NaN/null —
      // detect that and record null instead.
      if (Array.isArray(data.response) && Number.isInteger(data.response[1])) {
        data.response = data.response[1];
      } else {
        data.response = null;
      }
      data.correct = data.response === target;
    },
  };
}

/**
 * Creates a between-block break screen.
 */
function createBlockBreak(config: ResolvedConfig, blockNumber: number, totalBlocks: number) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.block_break(blockNumber, totalBlocks),
    choices: [config.text.continue_button],
    data: { task: TASK_NAME, part: "block_break" },
  };
}

/**
 * Creates a transition screen between phases.
 */
function createTransitionTrial(message: string, buttonLabel: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: message,
    choices: [buttonLabel],
    data: { task: TASK_NAME, part: "transition" },
  };
}

/**
 * Creates a practice block. Targets are drawn from the configured sequence so
 * participants encounter the same statistics they will see in test blocks.
 * When `showPracticeFeedback` is true, each practice trial uses the plugin's
 * built-in color-coded feedback (green/red flash on the clicked cell).
 */
function createPracticeBlock(config: ResolvedConfig) {
  const timeline: any[] = [];
  for (let t = 0; t < config.numPracticeTrials; t++) {
    const target = config.sequence[t % config.sequence.length];
    timeline.push(
      createStimulusTrial(
        config,
        target,
        {
          task: TASK_NAME,
          phase: "practice",
          block: 0,
          trial: t + 1,
          block_type: "sequence",
        },
        config.showPracticeFeedback
      )
    );
  }
  return { timeline };
}

/**
 * Creates a single test block of stimulus trials. `blockType` controls whether
 * targets follow the repeating sequence or are randomly generated.
 */
function createTestBlock(
  config: ResolvedConfig,
  blockNumber: number,
  blockType: "sequence" | "random"
) {
  const targets = buildBlockTargets(config, blockType);
  const timeline = targets.map((target, t) =>
    createStimulusTrial(config, target, {
      task: TASK_NAME,
      phase: "test",
      block: blockNumber,
      trial: t + 1,
      block_type: blockType,
    })
  );
  return { timeline };
}

/**
 * Creates the completion screen with a results summary.
 */
function createCompletionTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const scores = calculateScores(jsPsych.data.get(), config);
      let html = `<div class="instructions"><h2>${config.text.task_complete}</h2>`;
      html += config.text.result_summary(
        scores.accuracy,
        scores.meanRT,
        scores.sequenceLearningEffectRT
      );
      html += `</div>`;
      return html;
    },
    choices: [config.text.continue_button],
    data: { task: TASK_NAME, task_version: VERSION, phase: "completion" },
  };
}

// -- SCORING FUNCTIONS --

/**
 * Returns true if the given block index is a random (transfer) block.
 */
function isRandomBlock(blockNumber: number, randomBlockIndex: number): boolean {
  return randomBlockIndex > 0 && blockNumber === randomBlockIndex;
}

/**
 * Calculates per-block and overall scoring metrics, including the sequence
 * learning effect (RT_random - mean(RT_adjacent_sequence_blocks)).
 */
function calculateScores(
  data: DataCollection,
  config?: { randomBlockIndex?: number }
): ScoringResult {
  const randomBlockIndex = config?.randomBlockIndex ?? DEFAULT_OPTIONS.randomBlockIndex;
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test" })
    .values()
    .filter((t: any) => typeof t.target === "number") as TrialData[];

  if (testTrials.length === 0) {
    return {
      totalTrials: 0,
      correctTrials: 0,
      accuracy: 0,
      meanRT: null,
      blockSummaries: [],
      sequenceLearningEffectRT: null,
    };
  }

  const correct = testTrials.filter((t) => t.correct);
  const accuracy = correct.length / testTrials.length;
  const meanRT = mean(
    correct.filter((t) => t.rt !== null && t.rt !== undefined).map((t) => t.rt as number)
  );

  // Per-block summaries
  const blockNumbers = Array.from(new Set(testTrials.map((t) => t.block))).sort((a, b) => a - b);
  const blockSummaries: BlockSummary[] = blockNumbers.map((blockNumber) => {
    const blockTrials = testTrials.filter((t) => t.block === blockNumber);
    const blockCorrect = blockTrials.filter((t) => t.correct);
    const blockType: "sequence" | "random" =
      blockTrials[0]?.block_type ??
      (isRandomBlock(blockNumber, randomBlockIndex) ? "random" : "sequence");
    return {
      block: blockNumber,
      block_type: blockType,
      numTrials: blockTrials.length,
      numCorrect: blockCorrect.length,
      accuracy: blockTrials.length === 0 ? 0 : blockCorrect.length / blockTrials.length,
      meanRT: mean(
        blockCorrect.filter((t) => t.rt !== null && t.rt !== undefined).map((t) => t.rt as number)
      ),
    };
  });

  // Sequence learning effect: RT on the random block minus mean of neighboring
  // sequence blocks (block before and after, if both exist and are sequence
  // blocks). Returns null if we don't have the data to compute it.
  let sequenceLearningEffectRT: number | null = null;
  const randomSummary = blockSummaries.find((b) => b.block_type === "random");
  if (randomSummary && randomSummary.meanRT !== null) {
    const neighbors = blockSummaries
      .filter(
        (b) =>
          b.block_type === "sequence" &&
          (b.block === randomSummary.block - 1 || b.block === randomSummary.block + 1) &&
          b.meanRT !== null
      )
      .map((b) => b.meanRT as number);
    if (neighbors.length > 0) {
      const neighborMean = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
      sequenceLearningEffectRT = randomSummary.meanRT - neighborMean;
    }
  }

  return {
    totalTrials: testTrials.length,
    correctTrials: correct.length,
    accuracy,
    meanRT,
    blockSummaries,
    sequenceLearningEffectRT,
  };
}

/**
 * Returns a complete summary of task performance with task identification.
 */
function getSummary(
  data: DataCollection,
  config?: { randomBlockIndex?: number }
): ScoringResult & { taskName: string; version: string } {
  return {
    ...calculateScores(data, config),
    taskName: TASK_NAME,
    version: VERSION,
  };
}

// -- MAIN EXPORT --

/**
 * Creates the complete Serial Reaction Time Task timeline.
 *
 * On each trial, a row of cells is shown and one cell "lights up". The
 * participant clicks/taps the lit cell as quickly as possible. In sequence
 * blocks the targets follow a repeating sequence (default: the classic
 * 10-element Nissen & Bullemer sequence); in the configured random block,
 * targets are randomly generated. The RT difference between the random block
 * and adjacent sequence blocks indexes implicit sequence learning.
 *
 * Built on top of `@jspsych/plugin-serial-reaction-time-mouse`.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const srtt = createTimeline(jsPsych, {
 *   numBlocks: 4,
 *   trialsPerBlock: 80,
 *   randomBlockIndex: 3,
 * });
 * jsPsych.run([srtt]);
 * ```
 */
export function createTimeline(jsPsych: JsPsych, options: SerialReactionTimeOptions = {}) {
  const text: TextConfig = { ...defaultText, ...options.text };

  // If a custom sequence is provided, infer numPositions from it (taking the
  // max of the user-supplied numPositions and the inferred value, in case the
  // user wants extra unused positions for whatever reason).
  const sequence = options.sequence ?? DEFAULT_OPTIONS.sequence;
  const inferredPositions = Math.max(...sequence) + 1;
  const numPositions = Math.max(
    options.numPositions ?? DEFAULT_OPTIONS.numPositions,
    inferredPositions
  );

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    sequence,
    numPositions,
    text,
  };

  const timeline: any[] = [];

  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config));
  }

  if (config.numPracticeTrials > 0) {
    timeline.push(createPracticeBlock(config));
    timeline.push(
      createTransitionTrial(config.text.practice_complete, config.text.continue_button)
    );
  }

  for (let block = 1; block <= config.numBlocks; block++) {
    if (block > 1) {
      timeline.push(createBlockBreak(config, block - 1, config.numBlocks));
    }
    const blockType: "sequence" | "random" = isRandomBlock(block, config.randomBlockIndex)
      ? "random"
      : "sequence";
    timeline.push(createTestBlock(config, block, blockType));
  }

  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units for building custom SRTT experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createStimulusTrial,
  createBlockBreak,
  createTransitionTrial,
  createPracticeBlock,
  createTestBlock,
  createCompletionTrial,
};

/**
 * Utility functions for the SRTT.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  stimuli: {
    buildBlockTargets,
    buildGrid,
    generateRandomSequence,
    NISSEN_BULLEMER_SEQUENCE,
  },
  constants: {
    TASK_NAME,
    VERSION,
    DEFAULT_OPTIONS,
  },
  text: defaultText,
};

export type { TextConfig };
