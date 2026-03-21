import { JsPsych, DataCollection } from "jspsych";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import BartPlugin from "@jspsych-contrib/plugin-bart";
import { trial_text, defaultText, TextConfig } from "./text";

// -- CONSTANTS --
const TASK_NAME = "bart";
const VERSION = "0.1.0";

/**
 * Creates interactive instructions with practice trials.
 * Users must actually pump and collect a balloon to proceed.
 */
function createInteractiveInstructions(jsPsych: JsPsych, texts: TextConfig = trial_text) {
  const introPage = {
    type: HtmlButtonResponsePlugin,
    stimulus: texts.instruction_intro,
    choices: [texts.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  const pumpExplanation = {
    type: HtmlButtonResponsePlugin,
    stimulus: texts.instruction_pump,
    choices: [texts.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  const collectExplanation = {
    type: HtmlButtonResponsePlugin,
    stimulus: texts.instruction_collect,
    choices: [texts.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  // Interactive practice trial - safe balloon (high pop threshold)
  const practiceTryPrompt = {
    type: HtmlButtonResponsePlugin,
    stimulus: texts.instruction_try_pump,
    choices: [texts.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  const practiceBalloon = {
    type: BartPlugin,
    pop_threshold: 100, // Safe - won't pop during practice
    points_per_pump: 1,
    starting_total_points: 0,
    pump_button_label: texts.pump_button,
    collect_button_label: texts.collect_button,
    current_value_label: texts.current_value_label,
    total_points_label: texts.total_points_label,
    point_display_format: texts.point_display_format,
    total_points_format: texts.total_points_format,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "practice",
      part: "instruction",
    },
  };

  const practiceSuccess = {
    type: HtmlButtonResponsePlugin,
    stimulus: () => `<div class="feedback correct"><p>${texts.instruction_pump_success}</p></div>`,
    choices: [texts.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  // Practice with risk - balloon that can pop
  const practiceIntro = {
    type: HtmlButtonResponsePlugin,
    stimulus: texts.instruction_practice_intro,
    choices: [texts.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  const practiceWithRisk = {
    type: BartPlugin,
    pop_threshold: 10, // Lower threshold - can pop
    points_per_pump: 1,
    starting_total_points: 0,
    pump_button_label: texts.pump_button,
    collect_button_label: texts.collect_button,
    current_value_label: texts.current_value_label,
    total_points_label: texts.total_points_label,
    point_display_format: texts.point_display_format,
    total_points_format: texts.total_points_format,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "practice",
      part: "instruction",
    },
  };

  const practiceFeedback = {
    type: HtmlButtonResponsePlugin,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().filter({ phase: "practice", part: "instruction" }).last(1).values()[0];
      if (lastTrial && lastTrial.popped) {
        return `<div class="feedback incorrect"><p>${texts.instruction_pump_popped}</p></div>`;
      }
      return `<div class="feedback correct"><p>${texts.instruction_pump_success}</p></div>`;
    },
    choices: [texts.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
    },
  };

  return {
    timeline: [
      introPage,
      pumpExplanation,
      collectExplanation,
      practiceTryPrompt,
      practiceBalloon,
      practiceSuccess,
      practiceIntro,
      practiceWithRisk,
      practiceFeedback,
    ],
  };
}

/**
 * Creates an inter-block break screen with configurable text
 * Displays current block number, total blocks, and total earnings so far
 */
function createInterBlockBreak(
  jsPsych: JsPsych,
  currentBlock: number,
  totalBlocks: number,
  texts: TextConfig = trial_text,
) {
  const instructions = {
    type: HtmlButtonResponsePlugin,
    stimulus: () => {
      const data = jsPsych.data.get().filter({ task: TASK_NAME });
      const totalPoints = data.select("points_earned").sum();

      return `<div class="block-break" >${texts.block_break_message(
        currentBlock,
        totalBlocks,
        totalPoints,
      )}</div>`;
    },
    choices: [texts.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "block-break",
    },
  };

  return instructions;
}

/**
 * Creates the end results screen with configurable text
 * Displays total earnings across all blocks for this given task
 */
function createEndResults(jsPsych: JsPsych, texts: TextConfig) {
  const endResults = {
    type: HtmlButtonResponsePlugin,
    stimulus: () => {
      const data = jsPsych.data.get().filter({ task: TASK_NAME });
      const totalPoints = data.select("points_earned").sum();

      return `<div class="end-results" >${texts.end_result_message(totalPoints)}</div>`;
    },
    choices: [texts.finish_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "completion",
    },
  };
  return endResults;
}

/**
 * Generates a trial block consisting of multiple BART trials
 */
function createTrialBlock(
  maxPumps: number,
  minPumps: number,
  pointsPerPump: number,
  totalTrials: number,
  texts: TextConfig = trial_text,
) {
  const generatePopThreshold = () => {
    return Math.floor(Math.random() * (maxPumps - minPumps + 1)) + minPumps;
  };

  let totalPoints = 0;
  const trials = [];
  for (let i = 0; i < totalTrials; i++) {
    const trial = {
      type: BartPlugin,
      pop_threshold: generatePopThreshold(),
      points_per_pump: pointsPerPump,
      starting_total_points: () => totalPoints,
      pump_button_label: texts.pump_button,
      collect_button_label: texts.collect_button,
      current_value_label: texts.current_value_label,
      total_points_label: texts.total_points_label,
      point_display_format: texts.point_display_format,
      total_points_format: texts.total_points_format,
      on_finish: (data: any) => {
        totalPoints = data.total_points;
      },
      data: {
        task: TASK_NAME,
        task_version: VERSION,
        phase: "test",
      },
    }
    trials.push(trial);
  }
  return trials;
}

export function createTimeline(
  jsPsych: JsPsych,
  {
    max_pumps = 20,
    min_pumps = 1,
    points_per_pump = 1,
    num_blocks = 3,
    trials_per_block = 10,
    show_instructions = true,
    show_end_results = true,
    text = {},
  }: {
    max_pumps?: number;
    min_pumps?: number;
    points_per_pump?: number;
    num_blocks?: number;
    trials_per_block?: number;
    trial_timeout?: number;
    enable_timeout?: boolean;
    show_instructions?: boolean;
    show_end_results?: boolean;
    text?: Partial<TextConfig>;
  } = {},
) {
  const mergedText = { ...trial_text, ...text };

  const trials = [];

  if (show_instructions) {
    const instructions = createInteractiveInstructions(jsPsych, mergedText);
    trials.push(instructions);
  }

  // Create block structure
  for (let block = 1; block <= num_blocks; block++) {
    const trial = createTrialBlock(
      max_pumps,
      min_pumps,
      points_per_pump,
      trials_per_block,
      mergedText,
    );
    trials.push(trial);

    // Add break screen between blocks (but not after the last block)
    if (block < num_blocks) {
      const blockBreak = createInterBlockBreak(jsPsych, block, num_blocks, mergedText);
      trials.push(blockBreak);
    }
  }

  if (show_end_results) {
    const endResults = createEndResults(jsPsych, mergedText);
    trials.push(endResults);
  }

  const bart_timeline = {
    timeline: trials,
  };
  return bart_timeline;
}

// -- SCORING FUNCTIONS --

interface ScoringResult {
  totalPoints: number;
  totalTrials: number;
  poppedTrials: number;
  collectedTrials: number;
  popRate: number;
  avgPumpsBeforePop: number;
  avgPumpsBeforeCollect: number;
  adjustedAvgPumps: number;  // Average pumps on non-popped trials (standard BART measure)
}

/**
 * Calculate scoring metrics from BART data
 */
function calculateScores(data: DataCollection): ScoringResult {
  const trialData = data
    .filter({ task: TASK_NAME, phase: "test" })
    .values() as any[];

  if (trialData.length === 0) {
    return {
      totalPoints: 0,
      totalTrials: 0,
      poppedTrials: 0,
      collectedTrials: 0,
      popRate: 0,
      avgPumpsBeforePop: 0,
      avgPumpsBeforeCollect: 0,
      adjustedAvgPumps: 0,
    };
  }

  const poppedTrials = trialData.filter((t) => t.popped === true);
  const collectedTrials = trialData.filter((t) => t.popped === false);

  const totalPoints = trialData.reduce((sum, t) => sum + (t.points_earned || 0), 0);
  const popRate = poppedTrials.length / trialData.length;

  const avgPumpsBeforePop = poppedTrials.length > 0
    ? poppedTrials.reduce((sum, t) => sum + t.pumps, 0) / poppedTrials.length
    : 0;

  const avgPumpsBeforeCollect = collectedTrials.length > 0
    ? collectedTrials.reduce((sum, t) => sum + t.pumps, 0) / collectedTrials.length
    : 0;

  // Adjusted average pumps (standard BART measure) - only counts non-popped trials
  const adjustedAvgPumps = avgPumpsBeforeCollect;

  return {
    totalPoints,
    totalTrials: trialData.length,
    poppedTrials: poppedTrials.length,
    collectedTrials: collectedTrials.length,
    popRate,
    avgPumpsBeforePop: Math.round(avgPumpsBeforePop * 100) / 100,
    avgPumpsBeforeCollect: Math.round(avgPumpsBeforeCollect * 100) / 100,
    adjustedAvgPumps: Math.round(adjustedAvgPumps * 100) / 100,
  };
}

/**
 * Get summary of BART performance
 */
function getSummary(data: DataCollection): ScoringResult & { taskName: string; version: string } {
  const scores = calculateScores(data);
  return {
    ...scores,
    taskName: TASK_NAME,
    version: VERSION,
  };
}

export const timelineUnits = {
  createInterBlockBreak,
  createEndResults,
  createInteractiveInstructions,
  createTrialBlock,
};

export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  trial_text,
  constants: {
    TASK_NAME,
    VERSION,
  },
  text: defaultText,
};

// Re-export types for TypeScript users
export type { TextConfig } from "./text";
