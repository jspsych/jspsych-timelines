import { JsPsych } from "jspsych"
import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { instruction_pages, trial_text } from "./text";

// Global audio reference for stopping Google TTS
let currentGoogleAudio: HTMLAudioElement | null = null;

/**
 * Intelligent TTS with user preference support
 * Tries user's preferred method first, then the other method as fallback
 */
async function speakText(text: string, options: { lang?: string, volume?: number, method?: 'google' | 'system' } = {}) {
  // Stop any current speech first and wait for it to stop
  stopAllSpeech();
  
  const preferredMethod = options.method || 'google';
  
  // Try preferred method first
  try {
    if (preferredMethod === 'google') {
      await speakWithGoogleTTS(text, options.lang || 'en');
      return;
    } else {
      await speakWithSystemTTS(text, options);
      return;
    }
  } catch (preferredSpeechError) {
    // Preferred method failed, continue to try all methods
    console.log(preferredSpeechError)
  }
  
  // Try Google TTS regardless
  stopAllSpeech();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    await speakWithGoogleTTS(text, options.lang || 'en');
    return;
  } catch (googleError) {
    // Google failed, continue to system
  }
  
  // Try system TTS as final fallback
  stopAllSpeech();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    await speakWithSystemTTS(text, options);
    return;
  } catch (systemError) {
    console.warn('🔊 TTS unavailable');
  }
}

/**
 * Stop all speech including Google TTS audio - aggressively stops everything
 */
function stopAllSpeech() {
  // Stop system TTS aggressively
  if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      speechSynthesis.pause();
      speechSynthesis.resume();
      speechSynthesis.cancel();
  }
  
  // Stop Google TTS audio aggressively
  if (currentGoogleAudio) {
    try {
      currentGoogleAudio.pause();
      currentGoogleAudio.currentTime = 0; // Reset to beginning
      currentGoogleAudio.src = ''; // Clear source to stop loading
    } catch (e) {
      // Ignore errors, just ensure we clear the reference
    }
    currentGoogleAudio = null;
  }
}

/**
 * Simple system TTS function 
 * Browser will automatically select the best voice for the specified language
 */
function speakWithSystemTTS(text: string, options: { rate?: number, volume?: number, pitch?: number, lang?: string } = {}) {
  return new Promise<void>((resolve, reject) => {
    if ('speechSynthesis' in window) {
      // Create and speak the utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options with defaults
      utterance.rate = options.rate ?? 0.8;
      utterance.volume = options.volume ?? 0.8;
      utterance.pitch = options.pitch ?? 1.0;
      
      // Set language if provided (browser will pick best voice)
      if (options.lang) {
        utterance.lang = options.lang;
      }
      
      // Add event listeners
      utterance.onstart = () => resolve();
      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'synthesis-failed') {
          reject(new Error(e.error)); // Reject on critical errors
        } else {
          resolve(); // Don't fail on minor errors since this is a fallback
        }
      };
      
      speechSynthesis.speak(utterance);
    } else {
      reject(new Error('speechSynthesis not supported'));
    }
  });
}

/**
 * Default TTS using Google Translate
 * This works by creating an audio element that plays Google's TTS service
 */
function speakWithGoogleTTS(text: string, lang: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      // Convert language code to simple 2-letter format for Google
      const googleLang = lang ? lang.substring(0, 2).toLowerCase() : 'en';
      // Create Google Translate TTS URL
      const encodedText = encodeURIComponent(text);
      const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${googleLang}&client=tw-ob&q=${encodedText}`;
      
      // Create and play audio
      const audio = new Audio(googleTTSUrl);
      
      // Store reference to current audio for stopping immediately
      currentGoogleAudio = audio;
      
      audio.oncanplay = () => {
        // Check if we were cancelled while loading
        if (currentGoogleAudio !== audio) {
          audio.pause();
          reject(new Error('Cancelled while loading'));
          return;
        }
        audio.play().then(resolve).catch(reject);
      };
      
      audio.onended = () => {
        // Only clear if this is still the current audio
        if (currentGoogleAudio === audio) {
          currentGoogleAudio = null;
        }
        resolve();
      };
      
      audio.onerror = (e) => {
        // Always try to pause and clear, even on error
        audio.pause();
        if (currentGoogleAudio === audio) {
          currentGoogleAudio = null;
        }
        reject(new Error('Google TTS failed'));
      };
      
      // Load the audio
      audio.load();
      
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to extract text from HTML for TTS
function extractTextFromHtml(htmlString: string): string {
  // Use DOMParser for robust HTML to text extraction
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() || '';
}

/**
 * Creates instruction pages with configurable text and TTS support
 * Uses the jsPsych instructions plugin with simple HTML strings
 */
function createInstructions(instruction_pages_data = instruction_pages, enable_tts = false, ttsOptions = {}) {
  // Closure variable to store the handler for cleanup
  let handleButtonClick: ((event: Event) => void) | null = null;

  return {
    type: jsPsychInstructions,
    pages: instruction_pages_data.map(page => `<div class="instructions-container"><p>${page}</p></div>`),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: 'ArrowRight',
    key_backward: 'ArrowLeft',
    button_label_previous: trial_text.back_button,
    button_label_next: trial_text.next_button,
    on_start: function() {
      stopAllSpeech();
    },
    on_load: function() {
      if (enable_tts) {
        // Function to speak current page content
        const speakCurrentPage = () => {
          const instructionsContent = document.querySelector('.instructions-container');
          if (instructionsContent) {
            const pageText = extractTextFromHtml(instructionsContent.innerHTML);
            if (pageText.trim()) {
              speakText(pageText, ttsOptions);
            }
          }
        };

        // Use closure variable for handler
        handleButtonClick = (event: Event) => {
          const target = event.target as HTMLElement;
          if (target && (target.id === 'jspsych-instructions-next' || target.id === 'jspsych-instructions-back')) {
            stopAllSpeech();
            // Wait longer to ensure speech has stopped before starting new speech
            setTimeout(speakCurrentPage, 100);
          }
        };

        // Add single event listener to document
        document.addEventListener('click', handleButtonClick);

        // Speak initial page
        setTimeout(speakCurrentPage, 100);
      }
    },
    on_finish: function(data: any) {
      stopAllSpeech();
      // Clean up event listener using closure variable
      if (handleButtonClick) {
        document.removeEventListener('click', handleButtonClick);
        handleButtonClick = null;
      }
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
  maxSpan?: number;
  trialsPerSpan?: number;
  digitPresentationTime?: number;
  betweenDigitDelay?: number;
  responseTimeLimit?: number;
  // Trial sequence configuration
  trial_sequence?: ('forward' | 'backward')[];
  // TTS Configuration
  enable_tts?: boolean; // Enable text-to-speech functionality
  tts_method?: 'google' | 'system'; // Preferred TTS method (default: 'google')
  tts_rate?: number; // Speech rate (0.1 to 10, default: 0.8)
  tts_pitch?: number; // Speech pitch (0 to 2, default: 1.0)
  tts_volume?: number; // Speech volume (0 to 1, default: 0.8)
  tts_lang?: string; // Language code for TTS
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
    maxSpan = 9,
    trialsPerSpan = 2,
    digitPresentationTime = 1000,
    betweenDigitDelay = 500,
    responseTimeLimit = 30000,
    // Trial sequence configuration
    trial_sequence,
    // TTS Configuration
    enable_tts = true,
    tts_method = 'google',
    tts_rate = 1.0,
    tts_pitch = 1.0,
    tts_volume = 1.0,
    tts_lang = 'en-US'
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

  const instructions = createInstructions(instruction_pages, enable_tts, {
    method: tts_method,
    lang: tts_lang,
    volume: tts_volume,
    rate: tts_rate,
    pitch: tts_pitch
  });



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