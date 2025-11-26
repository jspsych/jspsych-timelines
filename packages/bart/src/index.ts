import { JsPsych } from "jspsych";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import BartPlugin from "@jspsych-contrib/plugin-bart";
import { trial_text } from "./text";

/**
 * Creates instruction pages with configurable text
 * Uses the jsPsych instructions plugin with simple HTML strings
 */
function createInstructions(text_object: typeof trial_text = trial_text) {
  return {
    type: jsPsychInstructions,
    pages: text_object.instruction_pages.map(
      (page) => `<div class="instructions-container"><p>${page}</p></div>`,
    ),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: "ArrowRight",
    key_backward: "ArrowLeft",
    button_label_previous: text_object.back_button,
    button_label_next: text_object.next_button,
    data: {
      task: "bart",
      phase: "instructions",
    },
    css_classes: ["bart-container"]
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
  text: typeof trial_text = trial_text,
) {
  const instructions = {
    type: HtmlButtonResponsePlugin,
    stimulus: () => {
      const data = jsPsych.data.get().filter({ task: "bart" });
      const totalPoints = data.select("points_earned").sum();

      return text.block_break_message(
        currentBlock,
        totalBlocks,
        totalPoints,
      );
    },
    choices: [trial_text.continue_button],
    button_html: (choice: string) =>
      `<button class="jspsych-btn continue-button">${choice}</button>`,
    data: {
      task: "bart",
      phase: "block-break",
    },
    css_classes: ["bart-container"]
  };

  return instructions;
}

/**
 * Creates the end results screen with configurable text
 * Displays total earnings across all blocks for this given task
 */
function createEndResults(jsPsych: JsPsych, text: typeof trial_text) {
  const endResults = {
    type: HtmlButtonResponsePlugin,
    stimulus: () => {
      const data = jsPsych.data.get().filter({ task: "bart" });
      const totalPoints = data.select("points_earned").sum();

      return text.end_result_message(totalPoints);
    },
    choices: [trial_text.finish_button],
    button_html: (choice: string) =>
      `<button class="jspsych-btn continue-button">${choice}</button>`,
    data: {
      task: "bart",
      phase: "end-results",
    },
    css_classes: ["bart-container"]
  };
  return endResults;
}

/**
 * Generates a trial block consisting of multiple BART trials
 */
function createTrialBlock(
  maxPumps: number,
  minPumps: number,
  trialsPerBlock: number,
  trialTimeout?: number,
  enableTimeout?: boolean,
  text: typeof trial_text = trial_text,
) {
  const generatePopThreshold = () => {
    return Math.floor(Math.random() * (maxPumps - minPumps + 1)) + minPumps;
  };

  let totalPoints = 0;
  const trials = [];
  for (let i = 0; i < trialsPerBlock; i++) {
    const trial = {
      type: BartPlugin,
      pop_threshold: generatePopThreshold(),
      starting_total_points: () => totalPoints,
      pump_button_label: text.pump_button,
      collect_button_label: text.collect_button,
      on_finish: (data: any) => {
        totalPoints = data.total_points;
      },
      data: {
        task: "bart",
        phase: "trial",
      },
      css_classes: ["bart-container"],
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
    num_blocks = 3, 
    trials_per_block = 10, 
    trial_timeout = 15000,
    enable_timeout = true, 
    show_instructions = true, 
    show_end_results = true,
    text_object = trial_text,
  }: {
    max_pumps?: number;
    min_pumps?: number;
    num_blocks?: number; 
    trials_per_block?: number; 
    trial_timeout?: number; 
    enable_timeout?: boolean; 
    show_instructions?: boolean; 
    show_end_results?: boolean; 
    text_object?: typeof trial_text; 
  } = {},
) {
  text_object = { ...trial_text, ...text_object };

  const trials = [];

  if (show_instructions) {
    const instructions = createInstructions(text_object);
    trials.push(instructions);
  }

  // Create block structure
  for (let block = 1; block <= num_blocks; block++) {
    const trial = createTrialBlock(
      max_pumps,
      min_pumps,
      trials_per_block,
      trial_timeout,
      enable_timeout,
      text_object,
    );
    trials.push(trial);
    
    // Add break screen between blocks (but not after the last block)
    if (block < num_blocks) {
      const blockBreak = createInterBlockBreak(jsPsych, block, num_blocks, text_object);
      trials.push(blockBreak);
    }
  }

  if (show_end_results) {
    const endResults = createEndResults(jsPsych, text_object);
    trials.push(endResults);
  }

  const bart_timeline = {
    timeline: trials,
  };
  return bart_timeline;
}
export const timelineUnits = {
  createInterBlockBreak,
  createEndResults,
  createInstructions,
  createTrialBlock,
};

export const utils = {};
