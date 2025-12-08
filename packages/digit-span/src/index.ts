import { JsPsych } from "jspsych"
import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { instruction_pages, trial_text } from "./text";


/**
 * Creates instruction pages
 * Uses the jsPsych instructions plugin with simple HTML strings
 */
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
      data.task = 'digit-span';
      data.phase = 'instructions';
    }
  };
}

// Helper functions for creating trial sequences
export function createAlternatingSequence(length: number): ('forward' | 'backward')[] {
  const sequence: ('forward' | 'backward')[] = [];
  for (let i = 0; i < length; i++) {
    sequence.push(i % 2 === 0 ? 'forward' : 'backward');
  }
  return sequence;
}

export function createBlockedSequence(forwardTrials: number, backwardTrials: number): ('forward' | 'backward')[] {
  const sequence: ('forward' | 'backward')[] = [];
  // Add all forward trials first
  for (let i = 0; i < forwardTrials; i++) {
    sequence.push('forward');
  }
  // Then add all backward trials
  for (let i = 0; i < backwardTrials; i++) {
    sequence.push('backward');
  }
  return sequence;
}

export function createRandomSequence(length: number, forwardProbability: number = 0.5): ('forward' | 'backward')[] {
  const sequence: ('forward' | 'backward')[] = [];
  for (let i = 0; i < length; i++) {
    sequence.push(Math.random() < forwardProbability ? 'forward' : 'backward');
  }
  return sequence;
}

export function createBalancedRandomSequence(totalTrials: number): ('forward' | 'backward')[] {
  const forwardTrials = Math.floor(totalTrials / 2);
  const backwardTrials = totalTrials - forwardTrials;
  
  const sequence: ('forward' | 'backward')[] = [];
  for (let i = 0; i < forwardTrials; i++) sequence.push('forward');
  for (let i = 0; i < backwardTrials; i++) sequence.push('backward');
  
  // Shuffle the sequence
  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  }
  
  return sequence;
}

interface DigitSpanConfig {
  includeForward?: boolean;
  includeBackward?: boolean;
  startingSpan?: number;
  digitPresentationTime?: number;
  betweenDigitDelay?: number;
  // Trial sequence configuration
  trial_sequence?: ('forward' | 'backward')[];
}

export function createTimeline(jsPsych: JsPsych, config: DigitSpanConfig = {}) {
  // Validate jsPsych parameter
  if (!jsPsych) {
    throw new Error('jsPsych parameter is required');
  }

  // Ensure config is an object (handle null case)
  const safeConfig = config || {};

  const {
    includeForward = true,
    includeBackward = true,
    startingSpan = 3,
    digitPresentationTime = 1000,
    betweenDigitDelay = 500,
    // Trial sequence configuration
    trial_sequence
  } = safeConfig;

  // Generate default trial sequence if not provided
  const finalTrialSequence = trial_sequence || (() => {
    if (includeForward && includeBackward) {
      return createAlternatingSequence(10); // Default to 10 alternating trials
    } else if (includeForward) {
      return Array(5).fill('forward') as ('forward' | 'backward')[];
    } else {
      return Array(5).fill('backward') as ('forward' | 'backward')[];
    }
  })();

  let currentTrialIndex = 0;
  let currentSpan = startingSpan;
  let trialsCompleted = 0;
  let correctTrials = 0;
  let forwardSpanScore = 0;
  let backwardSpanScore = 0;

  function generateDigitSequence(length: number): number[] {
    const digits = [];
    for (let i = 0; i < length; i++) {
      digits.push(Math.floor(Math.random() * 9) + 1);
    }
    return digits;
  }

  const instructions = createInstructions(instruction_pages);



  // Create a single trial that will be looped
  const singleTrialTimeline = {
    timeline: [
      {
        timeline: [{
          type: htmlButtonResponse,
          stimulus: function() {
            const digits = (window as any).currentTrialDigits;
            const index = (window as any).currentDigitIndex;
            return `<div class="digit-display">${digits[index]}</div>`;
          },
          choices: [],
          trial_duration: digitPresentationTime,
          post_trial_gap: betweenDigitDelay,
          on_start: function() {
            // Generate digits only on the first presentation
            if ((window as any).currentDigitIndex === undefined) {
              const digits = generateDigitSequence(currentSpan);
              (window as any).currentTrialDigits = digits;
              (window as any).currentDigitIndex = 0;
            }
          },
          on_finish: function(data: any) {
            (window as any).currentDigitIndex++;
            data.task = 'digit-span';
            data.phase = 'digit-presentation';
          }
        }],
        timeline_variables: function() {
          const variables = [];
          for (let i = 0; i < currentSpan; i++) {
            variables.push({ digit_index: i });
          }
          return variables;
        }(),
        on_timeline_start: function() {
          // Reset for new sequence
          (window as any).currentDigitIndex = 0;
          const digits = generateDigitSequence(currentSpan);
          (window as any).currentTrialDigits = digits;
        }
      },
      {
        type: htmlButtonResponse,
        choices: [],
        stimulus: function() {
          const currentCondition = finalTrialSequence[currentTrialIndex] || 'forward';
          const headerText = currentCondition === 'forward' ? trial_text.recall_header_forward : trial_text.recall_header_backward;
          const instructionText = currentCondition === 'forward' ? trial_text.recall_instruction_forward : trial_text.recall_instruction_backward;
          
          return `
            <div class="recall-container">
              <h3>${headerText}</h3>
              <p>${instructionText}</p>
              <div class="response-display">
                <span id="entered-digits">${trial_text.recall_placeholder}</span>
              </div>
              <style>
                @media screen and (max-width: 480px) {
                  .mobile-number-grid {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    gap: 4vw !important;
                    width: 95vw !important;
                    margin: 2vh auto !important;
                  }
                  .mobile-number-row {
                    display: flex !important;
                    gap: 4vw !important;
                    justify-content: center !important;
                  }
                  .mobile-number-button {
                    width: 25vw !important;
                    height: 25vw !important;
                    min-width: 25vw !important;
                    min-height: 25vw !important;
                    max-width: 25vw !important;
                    max-height: 25vw !important;
                    background-color: #4CAF50 !important;
                    color: white !important;
                    font-size: 8vw !important;
                    font-weight: bold !important;
                    border: 2px solid #2E7D32 !important;
                    border-radius: 12px !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-sizing: border-box !important;
                    cursor: pointer !important;
                    touch-action: manipulation !important;
                    user-select: none !important;
                  }
                  .mobile-action-button {
                    width: 35vw !important;
                    height: 10vh !important;
                    min-width: 35vw !important;
                    min-height: 10vh !important;
                    max-width: 35vw !important;
                    max-height: 10vh !important;
                    background-color: #FF9800 !important;
                    color: white !important;
                    font-size: 4vw !important;
                    font-weight: bold !important;
                    border: 2px solid #F57C00 !important;
                    border-radius: 10px !important;
                    margin: 0 2vw !important;
                    padding: 0 !important;
                    box-sizing: border-box !important;
                    cursor: pointer !important;
                    touch-action: manipulation !important;
                    user-select: none !important;
                  }
                }
              </style>
              <div class="number-grid mobile-number-grid">
                <div class="number-row mobile-number-row">
                  <button onclick="addDigit(1)" class="number-button mobile-number-button">1</button>
                  <button onclick="addDigit(2)" class="number-button mobile-number-button">2</button>
                  <button onclick="addDigit(3)" class="number-button mobile-number-button">3</button>
                </div>
                <div class="number-row mobile-number-row">
                  <button onclick="addDigit(4)" class="number-button mobile-number-button">4</button>
                  <button onclick="addDigit(5)" class="number-button mobile-number-button">5</button>
                  <button onclick="addDigit(6)" class="number-button mobile-number-button">6</button>
                </div>
                <div class="number-row mobile-number-row">
                  <button onclick="addDigit(7)" class="number-button mobile-number-button">7</button>
                  <button onclick="addDigit(8)" class="number-button mobile-number-button">8</button>
                  <button onclick="addDigit(9)" class="number-button mobile-number-button">9</button>
                </div>
                <div class="action-buttons mobile-number-row" style="margin-top: 5vh; gap: 6vw !important;">
                  <button onclick="clearDigits()" class="number-button clear-button mobile-action-button">${trial_text.clear_button}</button>
                  <button onclick="submitResponse()" class="number-button submit-button mobile-action-button">${trial_text.submit_button}</button>
                </div>
              </div>
            </div>
          `;
        },
        on_load: function() {
          let enteredDigits: number[] = [];
          
          // Define global functions for button handling
          (window as any).addDigit = function(digit: number) {
            if (enteredDigits.length < currentSpan) {
              enteredDigits.push(digit);
              document.getElementById('entered-digits')!.textContent = enteredDigits.join(' ');
            }
          };
          
          (window as any).clearDigits = function() {
            enteredDigits = [];
            document.getElementById('entered-digits')!.textContent = 'Click numbers below...';
          };
          
          (window as any).submitResponse = function() {
            const currentCondition = finalTrialSequence[currentTrialIndex] || 'forward';
            jsPsych.finishTrial({
              response: 'submit',
              entered_digits: [...enteredDigits],
              digits_shown: (window as any).currentTrialDigits,
              condition: currentCondition,
              span: currentSpan
            });
          };
        },
        on_finish: function(data: any) {
          const digits = data.digits_shown || (window as any).currentTrialDigits;
          const enteredDigits = data.entered_digits || [];
          const currentCondition = finalTrialSequence[currentTrialIndex] || 'forward';
          
          let correctSequence = currentCondition === 'forward' ? digits : [...digits].reverse();
          let correct = enteredDigits.length === correctSequence.length && 
                       enteredDigits.every((digit: number, index: number) => digit === correctSequence[index]);
          
          data.correct = correct;
          data.target_sequence = correctSequence;
          data.response_sequence = enteredDigits;
          data.condition = currentCondition;
          data.trial_index = currentTrialIndex;
          data.task = 'digit-span';
          data.phase = 'recall';
          
          if (correct) {
            correctTrials++;
            if (currentCondition === 'forward') {
              forwardSpanScore = Math.max(forwardSpanScore, currentSpan);
            } else {
              backwardSpanScore = Math.max(backwardSpanScore, currentSpan);
            }
          }
          
          trialsCompleted++;
          currentTrialIndex++;
        }
      },
      {
        type: htmlButtonResponse,
        stimulus: function() {
          const lastTrial = jsPsych.data.get().last(1).values()[0];
          const correct = lastTrial.correct;
          const targetSequence = lastTrial.target_sequence || [];
          const responseSequence = lastTrial.response_sequence || [];
          
          return `
            <div class="feedback-container">
              <h3 class="${correct ? 'feedback-correct' : 'feedback-incorrect'}">${correct ? trial_text.correct_feedback : trial_text.incorrect_feedback}</h3>
              <p><strong>${trial_text.target_label}</strong> ${targetSequence.join(' ')}</p>
              <p><strong>${trial_text.response_label}</strong> ${responseSequence.join(' ')}</p>
            </div>
          `;
        },
        choices: [trial_text.continue_button],
        button_html: (choice: string) => `<button class="jspsych-btn continue-button">${choice}</button>`,
        trial_duration: 3000,
        on_finish: function(data: any) {
          data.task = 'digit-span';
          data.phase = 'feedback';
        }
      }
    ],
    loop_function: function() {
      // Continue until we've completed all trials in the sequence
      return currentTrialIndex < finalTrialSequence.length;
    }
  };

  const results = {
    type: htmlButtonResponse,
    stimulus: function() {
      return `
        <div class="results-container">
          <h2>${trial_text.task_complete_header}</h2>
          <p><strong>${trial_text.forward_span_score}</strong> ${forwardSpanScore}</p>
          <p><strong>${trial_text.backward_span_score}</strong> ${backwardSpanScore}</p>
          <p><strong>${trial_text.total_score}</strong> ${forwardSpanScore + backwardSpanScore}</p>
          <p>${trial_text.task_complete_message}</p>
        </div>
      `;
    },
    choices: [trial_text.finish_button],
    button_html: (choice: string) => `<button class="jspsych-btn continue-button">${choice}</button>`,
    on_finish: function(data: any) {
      data.task = 'digit-span';
      data.phase = 'results';
    }
  };

  const timeline = [instructions, singleTrialTimeline, results];
  
  return timeline;
}

export const timelineUnits = {}

export const utils = {}