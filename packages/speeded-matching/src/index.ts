import { JsPsych, TrialType } from "jspsych"
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response"
import { test_items } from "./test-items"
import { trial_text, instruction_pages } from "./text"

interface SpeedMatchingConfig {
  /** Array of test items (animal SVGs) to use as stimuli */
  test_items?: string[]
  /** Number of trials to generate */
  num_trials?: number
  /** Number of choice options per trial (default 4) */
  num_choices?: number
  /** Enable text-to-speech for instructions and prompts */
  enable_tts?: boolean
  /** Maximum time allowed per trial (in ms) */
  trial_timeout?: number
  /** Inter-trial interval (in ms) */
  inter_trial_interval?: number
  /** Show instruction pages before the task */
  show_instructions?: boolean
  /** Show practice round before main task */
  show_practice?: boolean
  /** Custom instruction texts */
  instruction_texts?: typeof instruction_pages
}

/**
 * Function to provide text-to-speech functionality
 * Researchers can modify speech settings like rate and volume
 */
function speakText(text: string) {
  if ('speechSynthesis' in window) {
    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Wait a brief moment for cancel to take effect
    setTimeout(() => {
      // Create and speak the utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.volume = 0.8;
      utterance.voice = speechSynthesis.getVoices()[0] || null; // Use first available voice
      speechSynthesis.speak(utterance);
    }, 100);
  }
}

/**
 * Function to get a random selection of test items for creating choice sets
 * This ensures variety in the stimuli presented to participants
 */
function getRandomTestItems(items: string[], count: number = 4): string[] {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, items.length));
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
 * Creates instruction pages with configurable text and TTS support
 * Based on the pattern-comparison-task implementation
 */
function createInstructions(instruction_pages_data = instruction_pages, enable_tts = false) {
  const instruction_timeline = [];

  // Create each instruction page as a separate trial
  instruction_pages_data.forEach((page_data, page_index) => {

    // Build page text for TTS - combine all text elements
    const page_text = [
      page_data.header,
      page_data.header2,
      page_data.description,
      page_data.task_explanation,
      page_data.performance_note,
      page_data.strategy_title,
      page_data.strategy_intro,
      ...(page_data.strategy_points || []),
      page_data.start_prompt,
    ].filter(Boolean).join(' '); // Remove undefined strings by filtering out falsy values

    instruction_timeline.push({
      type: HtmlButtonResponsePlugin,
      stimulus: `
        <div class="speeded-matching-instructions-container">
          <h1>${page_data.header || ""}</h1>
          <h2>${page_data.header2 || ""}</h2>
          <p>${page_data.description || ""}</p>
          <p>${page_data.task_explanation || ""}</p>
          <p class="performance-note">${page_data.performance_note || ""}</p>
          ${page_data.strategy_title ? `<h2>${page_data.strategy_title}</h2>` : ""}
          ${page_data.strategy_intro ? `<p>${page_data.strategy_intro}</p>` : ""}
          ${page_data.strategy_points ? `
            <ul>
              ${page_data.strategy_points.map(point => `<li>${point}</li>`).join('')}
            </ul>
          ` : ""}
          ${page_data.start_prompt ? `<p class="start-prompt">${page_data.start_prompt}</p>` : ""}
        </div>
      `,
      choices: page_data.buttons,
      margin_horizontal: '15px',
      margin_vertical: '10px',
      button_html: function(choice, choice_index) {
        // Check if custom button HTML is provided for this page
        if ('button_html' in page_data && page_data.button_html && page_data.button_html[choice_index]) {
          return page_data.button_html[choice_index].replace('{choice}', choice);
        }
        // Default button styling
        return `<button class="jspsych-btn speeded-matching-continue-button">${choice}</button>`;
      },
      ...(enable_tts && {
        on_start: function() {
          // Stop any ongoing speech first
          speechSynthesis.cancel();
            // Speak the page text
            if (page_text.trim()) {
            speakText(page_text);
            }
        }
      }),
      on_finish: function(data: any) {
        // Stop speech when moving to next page
        speechSynthesis.cancel();
      },
      data: {
        page_index: page_index,
        task: 'instruction-page'
      }
    });
  });

  return {
    timeline: instruction_timeline
  };
}

/**
 * Creates a practice round with voice instructions and visual demonstrations
 * This helps participants understand the task before the actual trials
 */
function createPracticeRound(items: string[], enable_tts: boolean = false) {
  const practice_timeline = [];
  
  // Create a practice trial set using the first test item
  const practice_set = createTrialSet(items, 0, 4);
  
  // Practice instruction screen
  practice_timeline.push({
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <div class="practice-container">
        <h2>${trial_text.practice_header}</h2>
        <p class="practice-instruction">${trial_text.practice_intro_message}</p>
      </div>
    `,
    choices: [trial_text.continue_button],
    button_html: function(choice) {
      return `<button class="jspsych-btn speeded-matching-continue-button">${choice}</button>`;
    },
    data: {
      task: 'practice-instruction'
    }
  });

  // Practice trial with voice instruction "Look at this picture"
  practice_timeline.push({
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <div class="speeded-matching-container">
        <div class="task-instructions">
          <p>${trial_text.practice_look_instruction}</p>
        </div>
        <div class="target-container">
          <div class="target-stimulus flash">
            ${practice_set.target}
          </div>
        </div>
      </div>
    `,
    choices: [],
    trial_duration: 3000, // Show for 3 seconds
    on_start: function() {
      if (enable_tts) {
        // Wait for voices to load if needed
        if (speechSynthesis.getVoices().length === 0) {
          speechSynthesis.addEventListener('voiceschanged', () => {
            speakText(trial_text.practice_look_instruction);
          }, { once: true });
        } else {
          speakText(trial_text.practice_look_instruction);
        }
      }
    },
    data: {
      task: 'practice-target-demo'
    }
  });

  // Practice trial with voice instruction "We are going to tap the picture down here"
  practice_timeline.push({
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <div class="speeded-matching-container">
        <div class="task-instructions">
          <p>${trial_text.practice_tap_instruction}</p>
        </div>
        <div class="target-container">
          <div class="target-stimulus">
            ${practice_set.target}
          </div>
        </div>
      </div>
    `,
    choices: practice_set.choices.map((_, i) => i.toString()),
    button_html: function(choice, choice_index) {
      return `<button class="jspsych-btn choice-option" data-choice="${choice_index}">${practice_set.choices[choice_index]}</button>`;
    },
    trial_duration: 4000, // Show for 4 seconds
    on_start: function() {
      if (enable_tts) {
        // Wait for voices to load if needed
        if (speechSynthesis.getVoices().length === 0) {
          speechSynthesis.addEventListener('voiceschanged', () => {
            speakText(trial_text.practice_tap_instruction);
          }, { once: true });
        } else {
          speakText(trial_text.practice_tap_instruction);
        }
      }
    },
    on_load: function() {
      // Set CSS custom property for number of choices for dynamic sizing
      const btnGroup = document.querySelector('.jspsych-btn-group, #jspsych-html-button-response-btngroup') as HTMLElement;
      if (btnGroup) {
        btnGroup.style.setProperty('--num-choices', practice_set.choices.length.toString());
      }
      
      // Add flashing animation for practice demo (1.5 seconds total)
      setTimeout(() => {
        const buttons = document.querySelectorAll('.choice-option');
        buttons.forEach(button => {
          button.classList.add('flash-choices');
          // Remove flash class after 1.5 seconds
          setTimeout(() => {
            button.classList.remove('flash-choices');
          }, 1500);
        });
      }, 500);
    },
    data: {
      task: 'practice-choices-demo'
    }
  });

  return practice_timeline;
}

/**
 * Creates ready screen asking if user is ready for the actual test
 */
function createReadyScreen() {
  return {
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <div class="ready-screen">
        <h2>${trial_text.practice_complete_header}</h2>
        <p>${trial_text.practice_complete_message}</p>
      </div>
    `,
    choices: [trial_text.ready_button],
    button_html: function(choice) {
      return `<button class="jspsych-btn speeded-matching-continue-button">${choice}</button>`;
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
    enable_tts = true,
    trial_timeout = 10000,
    inter_trial_interval = 500,
    show_instructions = true,
    show_practice = true,
    instruction_texts = instruction_pages
  } = config;

  const items = config.test_items || test_items;
  const trials = generateTrials(config);
  const timeline = [];

  // Add instructions if requested
  if (show_instructions) {
    const instructions = createInstructions(instruction_texts, enable_tts);
    timeline.push(instructions);
  }

  // Add practice round if requested
  if (show_practice) {
    const practice_round = createPracticeRound(items, enable_tts);
    practice_round.forEach(trial => timeline.push(trial));
    
    // Add ready screen after practice
    timeline.push(createReadyScreen());
  }

  // Create main task trials
  trials.forEach((trial, index) => {
    // Main trial
    timeline.push({
      type: HtmlButtonResponsePlugin,
      stimulus: `
        <div class="speeded-matching-container">
          <div class="task-instructions">
            <p>${trial_text.main_task_prompt}</p>
          </div>
          <div class="target-container">
            <div class="target-stimulus">
              ${trial.target}
            </div>
          </div>
        </div>
      `,
      choices: trial.choices.map((_, i) => i.toString()),
      button_html: function(choice, choice_index) {
        return `<button class="jspsych-btn choice-option" data-choice="${choice_index}">${trial.choices[choice_index]}</button>`;
      },
      trial_duration: trial_timeout,
      on_load: function() {
        // Set CSS custom property for number of choices for dynamic sizing
        const btnGroup = document.querySelector('.jspsych-btn-group, #jspsych-html-button-response-btngroup') as HTMLElement;
        if (btnGroup) {
          btnGroup.style.setProperty('--num-choices', trial.choices.length.toString());
        }
        
        // Add click handlers for visual feedback
        const choices = document.querySelectorAll('.choice-option');
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
        
        // Stop any ongoing speech when trial ends
        speechSynthesis.cancel();
      }
    });
    
    // Inter-trial interval (fixation cross)
    if (inter_trial_interval > 0 && index < trials.length - 1) {
      timeline.push({
        type: HtmlButtonResponsePlugin,
        stimulus: `<div class="speeded-matching-fixation">${trial_text.fixation_cross}</div>`,
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
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <div class="speeded-matching-end-screen">
        <h2>${trial_text.task_complete_header}</h2>
        <p>${trial_text.task_complete_message}</p>
      </div>
    `,
    choices: [trial_text.end_button],
    button_html: function(choice) {
      return `<button class="jspsych-btn speeded-matching-continue-button">${choice}</button>`;
    },
    data: {
      task: 'end-screen'
    }
  });

  return {
    timeline: timeline
  };
}

export const timelineUnits = {
  instructions: "Instructions for the speeded matching task",
  practice: "Practice round with voice instructions and demonstrations", 
  readyScreen: "Confirmation screen before starting the main task",
  trial: "Single speeded matching trial with target and choice options",
  interTrialInterval: "Fixation cross between trials",
  endScreen: "Task completion screen"
}

export const utils = {
  generateTrials,
  createInstructions,
  createPracticeRound,
  createReadyScreen,
  speakText,
  createTrialSet,
  getRandomTestItems,
  /** Calculate accuracy and reaction time statistics */
  calculatePerformance: function(data: any[]) {
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
}

// Export text and test items for external use
export { trial_text, instruction_pages, test_items, createInstructions }

// Default export for convenience
export default { createTimeline, timelineUnits, utils }