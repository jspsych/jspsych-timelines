import { JsPsych } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
// Note: This package doesn't use external text files yet
const instruction_pages = [
  "In this task, you will see different stimuli appear on the screen.",
  "When you see a 'go' stimulus, click the button as quickly as possible.\nWhen you see a 'no go' stimulus, do NOT click the button.",
  "Try to respond as quickly and accurately as possible.",
  "Click 'Start' when you're ready to begin.",
];

const trial_text = {
  go_stimulus: 'GO',
  nogo_stimulus: 'STOP',
  button_text: 'Click',
  back_button: 'Back',
  next_button: 'Next',
  go_practice_instructions: '<b>Go Trial</b><br>You should click when you see this',
  nogo_practice_instructions: '<b>No-Go Trial</b><br>You should NOT click when you see this',
  go_feedback: 'Good Job, You clicked!',
  nogo_feedback_correct: 'Excellent! You correctly did NOT click!',
  nogo_feedback_incorrect: 'Remember, you should NOT click for this stimulus!'
};

function createInstructions(instructions = instruction_pages, texts = trial_text) {
  return {
    type: jsPsychInstructions,
    pages: instructions.map(page => `<div class="timeline-instructions"><p>${page}</p></div>`),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: 'ArrowRight',
    key_backward: 'ArrowLeft',
    button_label_previous: texts?.back_button ?? trial_text.back_button,
    button_label_next: texts?.next_button ?? trial_text.next_button,
    data: {
      task: 'go-no-go',
      phase: 'instructions'
    }
  };
}

export function createTimeline({
  go_stimulus = null,
  nogo_stimulus = null,
  go_stimuli = null,
  nogo_stimuli = null,
  total_trials = 40,
  go_probability = 0.75,
  stimulus_duration = 1000,
  response_timeout = 1000,
  isi_duration = 500,
  include_instructions = false,
  instructions = instruction_pages,
  texts = trial_text
}: {
  go_stimulus?: string,
  nogo_stimulus?: string,
  go_stimuli?: string[],
  nogo_stimuli?: string[],
  total_trials?: number,
  go_probability?: number,
  stimulus_duration?: number,
  response_timeout?: number,
  isi_duration?: number,
  include_instructions?: boolean,
  instructions?: typeof instruction_pages,
  texts?: typeof trial_text
} = {}) {

  // Determine effective stimuli
  const effective_go_stimuli = go_stimuli || (go_stimulus ? [go_stimulus] : [texts?.go_stimulus ?? trial_text.go_stimulus]);
  const effective_nogo_stimuli = nogo_stimuli || (nogo_stimulus ? [nogo_stimulus] : [texts?.nogo_stimulus ?? trial_text.nogo_stimulus]);
  const effective_button_text = texts?.button_text ?? trial_text.button_text;

  // Generate trial sequence
  const trials = [];
  let go_count = 0;
  let nogo_count = 0;

  for (let i = 0; i < total_trials; i++) {
    const is_go_trial = Math.random() < go_probability;
    
    let stimulus: string;
    if (is_go_trial) {
      stimulus = effective_go_stimuli[go_count % effective_go_stimuli.length];
      go_count++;
    } else {
      stimulus = effective_nogo_stimuli[nogo_count % effective_nogo_stimuli.length];
      nogo_count++;
    }

    trials.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: `<div class="go-nogo-stimulus">${stimulus}</div>`,
      choices: [effective_button_text],
      trial_duration: response_timeout,
      response_ends_trial: true,
      button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="timeline-html-btn jspsych-btn">${choice}</button>`,
      on_load: function() {
        // Add class to the default jspsych button group wrapper
        const buttonGroup = document.querySelector('.jspsych-html-button-response-btngroup');
        if (buttonGroup) {
          buttonGroup.classList.add('timeline-btn-container');
        }
      },
      data: {
        trial_number: i + 1,
        total_trials: total_trials,
        task: 'go-no-go',
        phase: 'trial',
        stimulus_type: is_go_trial ? 'go' : 'nogo',
        correct_response: is_go_trial ? 0 : null, // 0 = button press, null = no response
        stimulus: stimulus
      },
      on_finish: function(data: any) {
        const is_go_trial = data.stimulus_type === 'go';
        const responded = data.response !== null;
        
        if (is_go_trial) {
          data.correct = responded;
        } else {
          data.correct = !responded;
        }
      }
    });

    // Add ISI trial
    if (i < total_trials - 1) {
      trials.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: '',
        choices: [],
        trial_duration: isi_duration,
        response_ends_trial: false,
        data: {
          task: 'go-no-go',
          phase: 'isi'
        }
      });
    }
  }

  // Create the main task timeline
  const task_timeline = {
    timeline: trials
  };

  // Return complete timeline with or without instructions
  if (include_instructions) {
    const instruction_timeline = createInstructions(instructions, texts);
    
    const nested_timeline = {
      timeline: [instruction_timeline, task_timeline]
    };
    return nested_timeline;
  } else {
    return task_timeline;
  }
}

// Create a GO practice trial
export function createGoPractice(feedback_duration = 2000, texts = trial_text) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.go_practice_instructions}</p>
      <div class="go-nogo-stimulus">${texts.go_stimulus}</div>
      <p id="practice-feedback" style="visibility: hidden; color: #28a745;">${texts.go_feedback}</p>
    `,
    choices: [texts.button_text],
    response_ends_trial: false,
    trial_duration: null,
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="timeline-html-btn jspsych-btn">${choice}</button>`,
    on_load: function() {
      const buttonGroup = document.querySelector('.jspsych-html-button-response-btngroup');
      if (buttonGroup) {
        buttonGroup.classList.add('timeline-btn-container');
      }
      
      // Add click handler
      const button = document.getElementById('go-nogo-btn');
      if (button) {
        button.addEventListener('click', function() {
          // Show feedback
          const feedback = document.getElementById('practice-feedback');
          if (feedback) {
            feedback.style.visibility = 'visible';
          }
          
          // Disable button
          button.disabled = true;
          
          // Advance after feedback duration
          setTimeout(() => {
            jsPsych.finishTrial();
          }, feedback_duration);
        });
      }
    },
    data: {
      task: 'go-no-go',
      phase: 'practice',
      stimulus_type: 'go'
    }
  };
}

// Create a NO-GO practice trial
export function createNoGoPractice(feedback_duration = 2000, texts = trial_text) {
  let clicked = false;
  let feedbackShown = false;
  
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.nogo_practice_instructions}</p>
      <div class="go-nogo-stimulus">${texts.nogo_stimulus}</div>
      <p id="practice-feedback-correct" style="visibility: hidden; color: #28a745;">${texts.nogo_feedback_correct}</p>
      <p id="practice-feedback-incorrect" style="visibility: hidden; color: #dc3545;">${texts.nogo_feedback_incorrect}</p>
    `,
    choices: [texts.button_text],
    response_ends_trial: false,
    trial_duration: 3000 + feedback_duration, // 3 seconds to wait + feedback time
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="timeline-html-btn jspsych-btn">${choice}</button>`,
    on_load: function() {
      const buttonGroup = document.querySelector('.jspsych-html-button-response-btngroup');
      if (buttonGroup) {
        buttonGroup.classList.add('timeline-btn-container');
      }
      
      const button = document.getElementById('go-nogo-btn');
      if (button) {
        button.addEventListener('click', function() {
          if (!feedbackShown) {
            clicked = true;
            feedbackShown = true;
            
            // Show incorrect feedback
            const feedback = document.getElementById('practice-feedback-incorrect');
            if (feedback) {
              feedback.style.visibility = 'visible';
            }
            
            // Disable button
            button.disabled = true;
            
            // Advance after feedback duration
            setTimeout(() => {
              jsPsych.finishTrial();
            }, feedback_duration);
          }
        });
      }
      
      // Show correct feedback if no click after 3 seconds
      setTimeout(() => {
        if (!clicked && !feedbackShown) {
          feedbackShown = true;
          const feedback = document.getElementById('practice-feedback-correct');
          if (feedback) {
            feedback.style.visibility = 'visible';
          }
          
          // Disable button
          if (button) {
            button.disabled = true;
          }
          
          // Advance after feedback duration
          setTimeout(() => {
            jsPsych.finishTrial();
          }, feedback_duration);
        }
      }, 3000);
    },
    data: {
      task: 'go-no-go',
      phase: 'practice',
      stimulus_type: 'nogo'
    }
  };
}

// Create a practice timeline with both types
export function createPracticeTimeline({
  feedback_duration = 2000,
  texts = trial_text
}: {
  feedback_duration?: number,
  texts?: typeof trial_text
} = {}) {
  return {
    timeline: [
      createGoPractice(feedback_duration, texts),
      createNoGoPractice(feedback_duration, texts),
      createGoPractice(feedback_duration, texts),
      createNoGoPractice(feedback_duration, texts)
    ]
  };
}

// Export individual components for custom use
export { createInstructions, createGoPractice, createNoGoPractice };

// Export default timeline creator
export default createTimeline;

export const timelineUnits = {
  createPracticeTimeline,
  createGoPractice,
  createNoGoPractice,
  createTimeline,
};

export const utils = {
  createInstructions
};