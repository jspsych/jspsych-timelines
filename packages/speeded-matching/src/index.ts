import { JsPsych } from "jspsych"
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response"
import jsPsychInstructions from "@jspsych/plugin-instructions"
import { test_items } from "./test-items"
import { defaultText, TrialText } from "./text"

interface SpeedMatchingConfig {
  /** Array of test items (animal SVGs) to use as stimuli */
  test_items?: string[]
  /** Number of trials to generate */
  num_trials?: number
  /** Number of choice options per trial (default 4) */
  num_choices?: number
  /** Maximum time allowed per trial (in ms) */
  trial_timeout?: number
  /** Inter-trial interval (in ms) */
  inter_trial_interval?: number
  /** Show instruction pages before the task */
  show_instructions?: boolean
  /** Show practice round before main task */
  show_practice?: boolean
  /** Number of practice rounds to show (default 1) */
  practice_rounds?: number
  /** Custom text overrides */
  trial_text?: TrialText
}

/**
 * Function to create a trial set with one target and distractors
 * items: array of item strings (e.g., SVGs)
 * target_index: index of the item to use as target
 * num_choices: total number of choices to present (default 4)
 * Returns an object with target and choices array
 */
function createTrialSet(items: string[], target_index: number = 0, num_choices: number = 4) {
  if (target_index >= items.length) {
    target_index = 0; // fallback to first item
  }
  
  const target = items[target_index];
  const others = items.filter((_, index) => index !== target_index);
  const shuffled_others = others.sort(() => 0.5 - Math.random());
  
  // Create choices array with target and distractors
  const choices = [target, ...shuffled_others.slice(0, num_choices - 1)];
  const shuffled_choices = choices.sort(() => 0.5 - Math.random());
  
  // Find where the target ended up after shuffling
  const correct_choice_index = shuffled_choices.findIndex(choice => choice === target);
  
  return {
    target: target,
    choices: shuffled_choices,
    correct_answer: correct_choice_index,
    target_index: target_index
  };
}

/**
 * Creates instruction pages with configurable text content
 * Uses the jsPsych instructions plugin with simple HTML strings
 */
function createInstructions(instruction_pages: string[], next_button: string = "", back_button: string = "") {
  return {
    type: jsPsychInstructions,
    pages: instruction_pages.map(page => `<div class="jspsych-speeded-matching-instructions-container"><p>${page}</p></div>`),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: 'ArrowRight',
    key_backward: 'ArrowLeft',
    button_label_previous: back_button,
    button_label_next: next_button,
    data: {
      task: 'instruction-pages'
    },
    on_finish: function(data: any) {
      data.phase = 'instructions';
    }
  };
}

/**
 * Creates practice rounds with voice instructions and visual demonstrations
 * This helps participants understand the task before the actual trials
 */
function createPracticeRound(items: string[], num_choices: number = 4, practice_rounds: number = 1, text: typeof defaultText = defaultText) {
  const practice_timeline = [];

  // Practice instruction screen
  practice_timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div class="jspsych-speeded-matching-practice-container">
        <h2>${text.practice_header}</h2>
        <p class="jspsych-speeded-matching-practice-instruction">${text.practice_intro_message}</p>
      </div>
    `,
    choices: [text.continue_button],
    button_html: function(choice) {
      return `<button class="jspsych-btn jspsych-speeded-matching-continue-button">${choice}</button>`;
    },
    data: {
      task: 'practice-instruction'
    }
  });

  // Create multiple practice rounds
  for (let round = 0; round < practice_rounds; round++) {
    // Create a practice trial set using different target each round
    const target_index = round % items.length;
    const practice_set = createTrialSet(items, target_index, num_choices);
    
    // Practice trial with voice instruction practice_look_instruction
    practice_timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <div class="jspsych-speeded-matching-trial-container">
          <div class="jspsych-speeded-matching-task-instructions">
            <p>${text.practice_look_instruction}</p>
          </div>
          <div class="jspsych-speeded-matching-target-container">
            <div class="jspsych-speeded-matching-target-stimulus jspsych-speeded-matching-flash">
              ${practice_set.target}
            </div>
          </div>
        </div>
      `,
      choices: [],
      trial_duration: 3000, // Show for 3 seconds
      on_start: function() {},
      data: {
        task: 'practice-target-demo',
        practice_round: round + 1
      }
    });

    // Practice trial with voice instruction "We are going to tap the picture down here"
    practice_timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <div class="jspsych-speeded-matching-trial-container">
          <div class="jspsych-speeded-matching-task-instructions">
            <p>${text.practice_tap_instruction}</p>
          </div>
          <div class="jspsych-speeded-matching-target-container">
            <div class="jspsych-speeded-matching-target-stimulus">
              ${practice_set.target}
            </div>
          </div>
        </div>
      `,
      choices: practice_set.choices.map((_, i) => i.toString()),
      button_html: function(choice, choice_index) {
        const isCorrect = choice_index === practice_set.correct_answer;
        const disabled = !isCorrect ? 'disabled' : '';
        const disabledClass = !isCorrect ? 'jspsych-speeded-matching-disabled-choice' : '';
        return `<button class="jspsych-btn jspsych-speeded-matching-choice-option ${disabledClass}" data-choice="${choice_index}" ${disabled}>${practice_set.choices[choice_index]}</button>`;
      },
      // No trial duration - only ends when correct choice is clicked
      response_ends_trial: true,
      css_classes: ['jspsych-speeded-matching-practice-trial'],
      on_start: function() {},
      on_load: function() {
        // Set CSS custom property for number of choices for dynamic sizing
        const btnGroup = document.querySelector('#jspsych-html-button-response-btngroup') as HTMLElement;
        if (btnGroup) {
          btnGroup.style.setProperty('--num-choices', practice_set.choices.length.toString());
        }

        // Add flashing animation for practice demo
        setTimeout(() => {
          const buttons = document.querySelectorAll('.jspsych-speeded-matching-choice-option:not(.jspsych-speeded-matching-disabled-choice)');
          buttons.forEach(button => {
            button.classList.add('jspsych-speeded-matching-flash-choices');
          });
        }, 500);

        // Disable incorrect choices by preventing click events
        setTimeout(() => {
          const incorrectButtons = document.querySelectorAll('.jspsych-speeded-matching-choice-option.jspsych-speeded-matching-disabled-choice');
          incorrectButtons.forEach(button => {
            button.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }, true);
          });
        }, 100);
      },
      on_finish: function(data: any) {
        // Mark if they selected the correct answer
        data.correct = data.response === practice_set.correct_answer;
        data.practice_round = round + 1;
        data.correct_answer = practice_set.correct_answer;
      },
      data: {
        task: 'practice-choices-demo',
        practice_round: round + 1,
        correct_answer: practice_set.correct_answer
      }
    });
  }

  return practice_timeline;
}

/**
 * Creates ready screen asking if user is ready for the actual test
 */
function createReadyScreen(text: typeof defaultText = defaultText) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div class="jspsych-speeded-matching-ready-screen">
        <h2>${text.practice_complete_header}</h2>
        <p>${text.practice_complete_message}</p>
      </div>
    `,
    choices: [text.ready_button],
    button_html: function(choice) {
      return `<button class="jspsych-btn jspsych-speeded-matching-continue-button">${choice}</button>`;
    },
    data: {
      task: 'ready-screen'
    }
  };
}

/**
 * Generates trials for the main speeded matching task
 * Each trial presents a target and multiple choice options
 */
function generateTrials(config: SpeedMatchingConfig) {
  const items = config.test_items || test_items;
  const num_trials = config.num_trials || 20;
  const num_choices = config.num_choices || 4;
  const trials = [];

  for (let i = 0; i < num_trials; i++) {
    // Randomly select a target item
    const target_index = Math.floor(Math.random() * items.length);
    const trial_set = createTrialSet(items, target_index, num_choices);
    
    trials.push({
      target: trial_set.target,
      choices: trial_set.choices,
      correct_answer: trial_set.correct_answer,
      target_index: trial_set.target_index,
      trial_number: i + 1
    });
  }

  return trials;
}

/**
 * Main function to create the complete speeded matching timeline
 * Includes instructions, practice, and test phases based on configuration
 */
export function createTimeline(jsPsych: JsPsych, config: SpeedMatchingConfig = {}) {
  const {
    trial_timeout,
    inter_trial_interval,
    show_instructions = true,
    show_practice = true,
    practice_rounds = 1,
    num_choices = 4,
  } = config;

  const text = { ...defaultText, ...config.trial_text };

  const items = config.test_items || test_items;
  const trials = generateTrials(config);
  const timeline = [];

  // Add instructions if requested
  if (show_instructions) {
    const instructions = createInstructions(text.instruction_pages, text.next_button, text.back_button);
    timeline.push(instructions);
  }

  // Add practice round if requested
  if (show_practice) {
    const practice_round = createPracticeRound(items, num_choices, practice_rounds, text);
    practice_round.forEach(trial => timeline.push(trial));

    // Add ready screen after practice
    timeline.push(createReadyScreen(text));
  }

  // Create main task trials
  trials.forEach((trial, index) => {
    // Create the main trial object
    const mainTrial: any = {
      type: jsPsychHtmlButtonResponse,
      css_classes: ['jspsych-speeded-matching-trial'],
      stimulus: `
        <div class="jspsych-speeded-matching-trial-container">
          <div class="jspsych-speeded-matching-task-instructions">
            <p>${text.main_task_prompt}</p>
          </div>
          <div class="jspsych-speeded-matching-target-container">
            <div class="jspsych-speeded-matching-target-stimulus">
              ${trial.target}
            </div>
          </div>
        </div>
      `,
      choices: trial.choices.map((_, i) => i.toString()),
      button_html: function(choice, choice_index) {
        return `<button class="jspsych-btn jspsych-speeded-matching-choice-option" data-choice="${choice_index}">${trial.choices[choice_index]}</button>`;
      },
      on_load: function() {
        // Set CSS custom property for number of choices for dynamic sizing
        const btnGroup = document.querySelector('#jspsych-html-button-response-btngroup') as HTMLElement;
        if (btnGroup) {
          btnGroup.style.setProperty('--num-choices', trial.choices.length.toString());
        }

        // Add click handlers for visual feedback
        const choices = document.querySelectorAll('.jspsych-speeded-matching-choice-option');
        choices.forEach((choice, index) => {
          choice.addEventListener('click', function() {
            choice.classList.add('selected');
          });
        });
      },
      data: {
        task: 'speeded-matching-trial',
        trial_number: trial.trial_number,
        correct_answer: trial.correct_answer,
        target_index: trial.target_index,
        target: trial.target,
        choices: trial.choices
      },
      on_finish: function(data: any) {
        // Calculate accuracy and response time
        data.correct = data.response === data.correct_answer;
        data.reaction_time = data.rt;
      }
    };

    // Only add trial_duration if trial_timeout is defined and not null
    if (trial_timeout !== undefined && trial_timeout !== null) {
      mainTrial.trial_duration = trial_timeout;
    }

    timeline.push(mainTrial);
    
    // Inter-trial interval (fixation cross) - only if defined and > 0
    if (inter_trial_interval !== undefined && inter_trial_interval > 0 && index < trials.length - 1) {
      timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: `<div class="jspsych-speeded-matching-fixation">${text.fixation_cross}</div>`,
        choices: [],
        trial_duration: inter_trial_interval,
        data: {
          task: 'inter-trial-interval'
        }
      });
    }
  });

  // End screen
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div class="jspsych-speeded-matching-end-screen">
        <h2>${text.task_complete_header}</h2>
        <p>${text.task_complete_message}</p>
      </div>
    `,
    choices: [text.end_button],
    button_html: function(choice) {
      return `<button class="jspsych-btn jspsych-speeded-matching-continue-button">${choice}</button>`;
    },
    data: {
      task: 'end-screen'
    }
  });

  return {
    timeline: timeline
  };
}

// TODO: weave this into a proper feedback trial
/**
 * Function to calculate accuracy and reaction time statistics 
 * just for exporting with utils
*/
function calculatePerformance(data: any[]) {
    const trial_data = data.filter(d => d.task === 'speeded-matching-trial');
    const correct = trial_data.filter(d => d.correct).length;
    const total = trial_data.length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    
    const valid_rts = trial_data.filter(d => d.correct && d.rt !== null).map(d => d.rt);
    const mean_rt = valid_rts.length > 0 ? valid_rts.reduce((a, b) => a + b, 0) / valid_rts.length : null;
    
    // Calculate performance by target type
    const target_performance = {};
    trial_data.forEach(trial => {
      const target_index = trial.target_index;
      if (!target_performance[target_index]) {
        target_performance[target_index] = {
          correct: 0,
          total: 0,
          reaction_times: []
        };
      }
      target_performance[target_index].total++;
      if (trial.correct) {
        target_performance[target_index].correct++;
        if (trial.rt !== null) {
          target_performance[target_index].reaction_times.push(trial.rt);
        }
      }
    });
    
    return {
      overall: {
        accuracy,
        mean_reaction_time: mean_rt,
        total_trials: total,
        correct_trials: correct
      },
      by_target: target_performance
    };
  }

/**
 * Namespaced access to building blocks for advanced composition and testing.
 */
export const timelineUnits = {
  generateTrials,
  createInstructions,
  createPracticeRound,
  createReadyScreen,
  createTrialSet
}

/**
 * Namespaced access to utility functions for advanced usage and testing.
 */
export const utils = {
  defaultText,
  test_items,
  calculatePerformance
}