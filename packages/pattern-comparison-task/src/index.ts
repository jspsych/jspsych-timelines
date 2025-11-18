import { JsPsych } from "jspsych"
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response"
import jsPsychInstructions from "@jspsych/plugin-instructions"
import { test_categories } from "./test-categories"
import { trial_text, instruction_pages } from "./text"

interface PatternComparisonConfig {
  /** Array of test categories, each containing test pairs */
  test_categories?: any[]
  /** Number of trials to generate */
  num_trials?: number
  /** Instructions text to display above each trial */
  prompt?: string
  /** Text for the "same" button */
  same_button_text?: string
  /** Text for the "different" button */
  different_button_text?: string
  /** Maximum time allowed per trial (in ms) */
  trial_timeout?: number
  /** Inter-trial interval (in ms) */
  inter_trial_interval?: number
  /** Show instruction pages before the task */
  show_instructions?: boolean
  /** Custom instruction texts */
  instruction_texts?: typeof instruction_pages
}
function createInstructions(instruction_pages_data = instruction_pages) {
  return {
    type: jsPsychInstructions,
    pages: instruction_pages_data.map(page => `<div class="instructions-container"><p>${page}</p></div>`),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: 'ArrowRight',
    key_backward: 'ArrowLeft',
    button_label_previous: trial_text.back_button,
    button_label_next: trial_text.next_button,
    on_finish: function(data: any) {
      data.phase = 'instructions';
    }
  };
}

function generateTrials(config: PatternComparisonConfig) {
  const test_svg = config.test_categories || test_categories;
  const num_trials = config.num_trials || 20;
  const trials = [];

  for (let i = 0; i < num_trials; i++) {
    // Randomly select a category
    const category_index = Math.floor(Math.random() * test_svg.length);
    const selected_category = test_svg[category_index];
    
    // Randomly select a test within the category
    const test_names = Object.keys(selected_category);
    const test_name = test_names[Math.floor(Math.random() * test_names.length)];
    const [original_svg, edited_svg] = selected_category[test_name];
    
    // Randomly decide if patterns should be same or different
    const is_same = Math.random() < 0.5;
    
    const pattern1 = original_svg;
    const pattern2 = is_same ? original_svg : edited_svg;

    trials.push({
      pattern1,
      pattern2,
      correct_answer: is_same ? 0 : 1, // 0 for same, 1 for different
      category_index,
      test_name,
      is_same
    });
  }

  return trials;
}

export function createTimeline(jsPsych: JsPsych, config: PatternComparisonConfig = {}) {
  const {
    prompt = trial_text.prompt,
    same_button_text = trial_text.same_button,
    different_button_text = trial_text.different_button,
    trial_timeout = 10000,
    inter_trial_interval = 500,
    show_instructions = false,
    instruction_texts = instruction_pages
  } = config

  const trials = generateTrials(config)
  const timeline = []


  // Create trial timeline
  trials.forEach((trial, index) => {
    timeline.push({
      type: HtmlButtonResponsePlugin,
      stimulus: `
        <div class="pattern-comparison-container">
          <div class="pattern-instructions">${prompt}</div>
          <div class="patterns-container">
            <div class="pattern">${trial.pattern1}</div>
            <div class="pattern">${trial.pattern2}</div>
          </div>
        </div>
      `,
      choices: [same_button_text, different_button_text],
      margin_horizontal: '20px',
      margin_vertical: '15px',
      button_html: function(choice, choice_index) {
        return `<button class="jspsych-btn continue-button pattern-trial-button">${choice}</button>`;
      },
      trial_duration: trial_timeout,
      data: {
        task: 'pattern-comparison',
        trial_number: index + 1,
        correct_answer: trial.correct_answer,
        category_index: trial.category_index,
        test_name: trial.test_name,
        is_same: trial.is_same,
        pattern1: trial.pattern1,
        pattern2: trial.pattern2
      },
      on_finish: function(data: any) {
        data.correct = data.response === data.correct_answer
        data.reaction_time = data.rt
      }
    })

    // Inter-trial interval
    if (index < trials.length - 1) {
      timeline.push({
        type: HtmlButtonResponsePlugin,
        stimulus: `<div class="pattern-fixation">${trial_text.fixation_cross}</div>`,
        choices: [],
        trial_duration: inter_trial_interval
      })
    }
  })

  // End screen
  timeline.push({
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <div class="pattern-end-screen">
        <h2>${trial_text.task_complete_header}</h2>
        <p>${trial_text.task_complete_message}</p>
      </div>
    `,
    choices: ["End"],
    button_html: function(choice, choice_HTML) { //this is supposed to return the HTML for the each respective button.
      return `<button class="jspsych-btn continue-button pattern-continue-button">${choice}</button>`;
    }
  })

  // Create the main task timeline
  const task_timeline = {
    timeline: timeline
  };

  // Return complete timeline with or without detailed instructions
  if (show_instructions) {
    const detailed_instructions = createInstructions(instruction_texts);
    
    const nested_timeline = {
      timeline: [detailed_instructions, task_timeline]
    };
    return nested_timeline;

  } else {
    return task_timeline;
  }
}

/** Calculate accuracy and reaction time statistics by category */
function calculatePerformance(data: any[]) {
  const trial_data = data.filter(d => d.task === 'pattern-comparison')
  const correct = trial_data.filter(d => d.correct).length
  const total = trial_data.length
  const accuracy = total > 0 ? (correct / total) * 100 : 0
  
  const valid_rts = trial_data.filter(d => d.correct && d.rt !== null).map(d => d.rt)
  const mean_rt = valid_rts.length > 0 ? valid_rts.reduce((a, b) => a + b, 0) / valid_rts.length : null
  
  // Calculate performance by category
  const category_performance = [0, 1, 2].map(category_index => {
    const category_trials = trial_data.filter(d => d.category_index === category_index)
    const category_correct = category_trials.filter(d => d.correct).length
    const category_total = category_trials.length
    const category_accuracy = category_total > 0 ? (category_correct / category_total) * 100 : 0
    
    const category_valid_rts = category_trials.filter(d => d.correct && d.rt !== null).map(d => d.rt)
    const category_mean_rt = category_valid_rts.length > 0 ? 
      category_valid_rts.reduce((a, b) => a + b, 0) / category_valid_rts.length : null
    
    return {
      category_index,
      accuracy: category_accuracy,
      mean_reaction_time: category_mean_rt,
      total_trials: category_total,
      correct_trials: category_correct
    }
  })
  
  return {
    overall: {
      accuracy,
      mean_reaction_time: mean_rt,
      total_trials: total,
      correct_trials: correct
    },
    by_category: category_performance
  }
}

//gotta check standardization of these exports

export const timelineUnits = {
  instructions: "Instructions for the pattern comparison task",
  trial: "Single pattern comparison trial",
  interTrialInterval: "Fixation cross between trials",
  endScreen: "Task completion screen"
}

export const utils = {
  generateTrials,
  createInstructions,
  calculatePerformance
}

// Export text configuration for external use
export { trial_text, instruction_pages, createInstructions }

// Default export for convenience
export default { createTimeline, timelineUnits, utils }