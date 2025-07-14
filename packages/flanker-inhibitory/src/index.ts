import { JsPsych } from "jspsych";
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychInstructions from '@jspsych/plugin-instructions';
import { trial_text, instruction_pages } from './text';
import { layered_stimuli, fish_only, arrow_only, custom_stimulus } from './stimuli';

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
 * Defaultl TTS using Google Translate
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

/**
 * Creates instruction pages with configurable text and TTS support
 * Uses the jsPsych instructions plugin with simple HTML strings
 */
// Helper function to extract text from HTML for TTS
function extractTextFromHtml(htmlString: string): string {
  // Use DOMParser for robust HTML to text extraction
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() || '';
}

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
      data.phase = 'instructions';
    }
  };
}

// ============================================================================
// SVG UTILITIES
// ============================================================================

// Robust SVG flipping with proper alignment handling
function flipSVG(svgString: string): string {
  if (!svgString || typeof svgString !== 'string') return svgString;
  
  // Check if SVG already contains a flip transform
  const hasExistingTransform = svgString.includes('matrix(-1,') || 
                              svgString.includes('matrix(-1 ') ||
                              svgString.includes('scaleX(-1)') ||
                              svgString.includes('scale(-1');
  
  // If already flipped, remove the flip transform to restore original orientation
  if (hasExistingTransform) {
    return svgString
      .replace(/transform="matrix\(-1,\s*0,\s*0,\s*1,\s*0,\s*0\)"/g, '')
      .replace(/transform="matrix\(-1\s+0\s+0\s+1\s+0\s+0\)"/g, '')
      .replace(/transform="scaleX\(-1\)"/g, '')
      .replace(/transform="scale\(-1,\s*1\)"/g, '')
      .replace(/transform="scale\(-1\s+1\)"/g, '')
      .replace(/style="[^"]*transform:\s*scaleX\(-1\)[^"]*"/g, (match) => {
        return match.replace(/transform:\s*scaleX\(-1\);?/, '').replace(/style=""/, '');
      });
  }
  
  // Parse SVG to get dimensions for proper transform calculation
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
  const widthMatch = svgString.match(/width="([^"]+)"/);
  
  let translateX = 0;
  if (viewBoxMatch) {
    const viewBox = viewBoxMatch[1].split(/\s+/);
    if (viewBox.length >= 3) {
      translateX = parseFloat(viewBox[2]) || 0; // width from viewBox
    }
  } else if (widthMatch) {
    translateX = parseFloat(widthMatch[1]) || 0;
  }
  
  // Apply proper SVG transform that maintains alignment
  if (translateX > 0) {
    // Insert transform into the SVG element itself for better precision
    return svgString.replace(
      /<svg([^>]*)>/,
      `<svg$1><g transform="scale(-1,1) translate(-${translateX},0)">`
    ).replace(/<\/svg>$/, '</g></svg>');
  } else {
    // Fallback to CSS transform with inline-block container
    return `<span style="display: inline-block; transform: scaleX(-1);">${svgString}</span>`;
  }
}

// Simple SVG layering using CSS
function layerSVGs(svgArray: string[], flip: boolean = false): string {
  if (!svgArray || !Array.isArray(svgArray) || svgArray.length === 0) return '';
  if (svgArray.length === 1) return flip ? flipSVG(svgArray[0]) : svgArray[0];
  
  // Layer SVGs using CSS positioning, flip each SVG individually if needed
  return `<span style="position: relative; display: inline-block;">
    ${svgArray.map((svg, index) => 
      `<span style="position: ${index === 0 ? 'relative' : 'absolute'}; top: 0; left: 0;">${flip ? flipSVG(svg) : svg}</span>`
    ).join('')}
  </span>`;
}

// Simplified stimulus processing
function processStimuli(stimuli: { left?: string[], right?: string[] } | string[] | { left: string, right: string }) {
  // If already processed (has left/right strings), return as-is
  if (stimuli && typeof stimuli === 'object' && !Array.isArray(stimuli) && 
      typeof stimuli.left === 'string' && typeof stimuli.right === 'string') {
    return stimuli as { left: string, right: string };
  }
  
  // If simple array, treat as right-facing and generate left by flipping
  if (Array.isArray(stimuli)) {
    return {
      right: layerSVGs(stimuli, false),
      left: layerSVGs(stimuli, true)
    };
  }
  
  // If object with arrays
  if (stimuli && typeof stimuli === 'object') {
    const obj = stimuli as { left?: string[], right?: string[] };
    if (obj.left && obj.right) {
      return {
        left: layerSVGs(obj.left, false),
        right: layerSVGs(obj.right, false)
      };
    } else if (obj.right) {
      return {
        right: layerSVGs(obj.right, false),
        left: layerSVGs(obj.right, true)
      };
    } else if (obj.left) {
      return {
        left: layerSVGs(obj.left, false),
        right: layerSVGs(obj.left, true)
      };
    }
  }
  
  // Default fallback
  return {
    right: layerSVGs(layered_stimuli, false),
    left: layerSVGs(layered_stimuli, true)
  };
}

// Pre-processed stimuli for convenience (lazy-loaded)
export const default_stimuli = processStimuli(layered_stimuli);
export const fish_stimuli = processStimuli(fish_only);
export const arrow_stimuli = processStimuli(arrow_only);

// ============================================================================
// STIMULUS CREATION FUNCTIONS
// ============================================================================

export function createFlankerStim(direction, congruent, stimuli: string[] | { left?: string[]; right?: string[] } | { left: string; right: string } = layered_stimuli, stimuli_amount: number = 5) {
  // Ensure stimuli_amount is valid (odd number ≥3)
  let safeAmount = typeof stimuli_amount === 'number' && !isNaN(stimuli_amount) && isFinite(stimuli_amount) ? stimuli_amount : 5;
  const validAmount = Math.max(3, safeAmount % 2 === 0 ? safeAmount + 1 : safeAmount);
  const halfFlankers = Math.floor(validAmount / 2);
  
  // Process stimuli
  const processedStimuli = processStimuli(stimuli);
  const center = processedStimuli[direction];
  const flanker = congruent ? processedStimuli[direction] : processedStimuli[direction === 'left' ? 'right' : 'left'];
  
  let html = `<div class="flanker-stim" style="--stimuli-count: ${validAmount};">`;
  
  // Add left flankers
  for (let i = 0; i < halfFlankers; i++) {
    html += `<span>${flanker}</span>`;
  }
  
  // Add center stimulus
  html += `<span class="center">${center}</span>`;
  
  // Add right flankers
  for (let i = 0; i < halfFlankers; i++) {
    html += `<span>${flanker}</span>`;
  }
  
  html += `</div>`;
  return html;
}

export function createPracticeStim(direction, congruent, stimuli: string[] | { left?: string[]; right?: string[] } | { left: string; right: string } = layered_stimuli, stimuli_amount: number = 5) {
  // Ensure stimuli_amount is valid (odd number ≥3)
  let safeAmount = typeof stimuli_amount === 'number' && !isNaN(stimuli_amount) && isFinite(stimuli_amount) ? stimuli_amount : 5;
  const validAmount = Math.max(3, safeAmount % 2 === 0 ? safeAmount + 1 : safeAmount);
  const halfFlankers = Math.floor(validAmount / 2);
  
  // Process stimuli
  const processedStimuli = processStimuli(stimuli);
  const center = processedStimuli[direction];
  const flanker = congruent ? processedStimuli[direction] : processedStimuli[direction === 'left' ? 'right' : 'left'];
  
  let html = `<div class="flanker-stim practice" style="--stimuli-count: ${validAmount};">`;
  
  // Add left flankers
  for (let i = 0; i < halfFlankers; i++) {
    html += `<span>${flanker}</span>`;
  }
  
  // Add center stimulus with highlighting
  html += `<span class="center highlighted">${center}</span>`;
  
  // Add right flankers
  for (let i = 0; i < halfFlankers; i++) {
    html += `<span>${flanker}</span>`;
  }
  
  html += `</div>`;
  return html;
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface FlankerConfig {
  stimuli_type?: 'fish' | 'arrow' | 'layered' | 'custom';
  svg?: string[]; // Override parameter - array of SVGs to layer
  stimuli_amount?: number; // Number of stimuli in flanker display (default: 5, must be odd ≥3)
  fixation_duration?: number;
  show_instructions?: boolean;
  show_practice?: boolean;
  num_practice?: number;
  num_trials?: number;
  
  // Simplified TTS Configuration
  enable_tts?: boolean; // Enable text-to-speech functionality
  tts_method?: 'google' | 'system'; // Preferred TTS method (default: 'google')
  tts_rate?: number; // Speech rate (0.1 to 10, default: 0.8)
  tts_pitch?: number; // Speech pitch (0 to 2, default: 1.0)
  tts_volume?: number; // Speech volume (0 to 1, default: 0.8)
  tts_lang?: string; // Language code for TTS
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculatePerformance(data: any[]) {
  const trial_data = data.filter(d => d.task === 'flanker');
  
  if (trial_data.length === 0) {
    return { accuracy: 0, mean_rt: 0, total_trials: 0 };
  }
  
  const correct_trials = trial_data.filter(d => d.correct);
  const accuracy = (correct_trials.length / trial_data.length) * 100;
  const mean_rt = correct_trials.length > 0 
    ? correct_trials.reduce((sum, d) => sum + d.rt, 0) / correct_trials.length 
    : 0;
  
  return {
    accuracy,
    mean_rt,
    total_trials: trial_data.length,
    correct_trials: correct_trials.length
  };
}

// ============================================================================
// MAIN TIMELINE FUNCTION
// ============================================================================

export function createTimeline(jsPsych: JsPsych, config: FlankerConfig = {}) {
  const {
    stimuli_type = 'layered',
    svg,
    stimuli_amount = 5,
    fixation_duration = 500,
    show_instructions = true,
    show_practice = true,
    num_practice = 8,
    num_trials = 20,
    enable_tts = false,
    tts_method = 'google',
    tts_rate = 0.8,
    tts_pitch = 1.0,
    tts_volume = 0.8,
    tts_lang,
  } = config;

  // Create TTS options object
  const ttsOptions = {
    rate: tts_rate,
    volume: tts_volume,
    pitch: tts_pitch,
    lang: tts_lang,
    method: tts_method
  };

  // Determine which stimuli to use based on priority:
  // 1. svg override parameter (highest priority)
  // 2. stimuli_type selection
  let stimuli;
  if (svg) {
    stimuli = processStimuli(svg); // Process the SVG override array to handle flipping
  } else if (stimuli_type === 'custom') {
    stimuli = processStimuli(custom_stimulus);
  } else if (stimuli_type === 'arrow') {
    stimuli = arrow_stimuli;
  } else if (stimuli_type === 'fish') {
    stimuli = fish_stimuli;
  } else {
    stimuli = default_stimuli; // layered by default
  }
  const timeline = [];

  // Instructions
  if (show_instructions) {
    timeline.push(createInstructions(instruction_pages, enable_tts, ttsOptions));
  }

  // Practice
  if (show_practice) {
    // Practice intro
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <div class="practice-instructions">
          <p>${trial_text.practice_intro}</p>
        </div>
      `,
      choices: [trial_text.start_button],
      button_html: (choice) => `<button class="jspsych-btn continue-button">${choice}</button>`,
      data: {
        task: 'practice-intro',
        phase: 'practice'
      },
      on_load: enable_tts ? function() {
        const content = document.querySelector('.practice-instructions');
        if (content) {
          speakText(extractTextFromHtml(content.innerHTML), ttsOptions);
        }
      } : undefined
    });

    // Only add practice trials if num_practice > 0
    if (num_practice > 0) {
      // Practice trials
      const practice_variables = [
        {direction: 'left', congruent: true},
        {direction: 'left', congruent: false},
        {direction: 'right', congruent: true},
        {direction: 'right', congruent: false},
      ];

      const practice_trials = jsPsych.randomization.repeat(practice_variables, Math.floor(num_practice/4))
        .concat(jsPsych.randomization.sampleWithoutReplacement(practice_variables, num_practice%4));

      // Fixation
      const practice_fixation = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `<div class="fixation">${trial_text.fixation_cross}</div>`,
        choices: [],
        trial_duration: fixation_duration,
        data: { 
          task: 'fixation', 
          phase: 'practice' 
        }
      };

      // Practice trial
      const practice_trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
          const direction = jsPsych.evaluateTimelineVariable('direction');
          const congruent = jsPsych.evaluateTimelineVariable('congruent');
          return `
            <div class="trial-container">
              <div class="flanker-trial">
                <div class="trial-prompt">${trial_text.main_task_prompt}</div>
                ${createPracticeStim(direction, congruent, stimuli, stimuli_amount)}
              </div>
            </div>
          `;
        },
        choices: [trial_text.left_button, trial_text.right_button],
        button_html: (choice) => `<button class="jspsych-btn continue-button">${choice}</button>`,
        data: {
          task: 'flanker',
          phase: 'practice',
          direction: jsPsych.timelineVariable('direction'),
          congruent: jsPsych.timelineVariable('congruent')
        },
        on_load: enable_tts ? function() {
          const prompt = document.querySelector('.trial-prompt');
          if (prompt) {
            speakText(extractTextFromHtml(prompt.innerHTML), ttsOptions);
          }
        } : undefined,
        on_finish: function(data: any) {
          const correct_response = data.direction === 'left' ? 0 : 1;
          data.correct = data.response === correct_response;
        }
      };

      // Feedback
      const practice_feedback = {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
          const last_trial = jsPsych.data.get().last(1).values()[0];
          const feedback = last_trial.correct ? trial_text.correct_feedback : trial_text.incorrect_feedback;
          return `<div class="feedback ${last_trial.correct ? 'correct' : 'incorrect'}">${feedback}</div>`;
        },
        choices: [],
        trial_duration: 1000,
        data: { 
          task: 'feedback', 
          phase: 'practice' 
        },
        on_load: enable_tts ? function() {
          const feedback = document.querySelector('.feedback');
          if (feedback) {
            speakText(extractTextFromHtml(feedback.innerHTML), ttsOptions);
          }
        } : undefined
      };

      // Practice timeline
      timeline.push({
        timeline: [practice_fixation, practice_trial, practice_feedback],
        timeline_variables: practice_trials,
        randomize_order: true
      });
    }

    // Practice completion
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        
        return `
          <div class="practice-instructions">
            <p>${trial_text.practice_outro}</p>
          </div>
        `;
      },
      choices: [trial_text.continue_button],
      button_html: (choice) => `<button class="jspsych-btn continue-button">${choice}</button>`,
      data: { 
        task: 'practice-complete',
        phase: 'practice' 
      },
      on_load: enable_tts ? function() {
        const content = document.querySelector('.practice-instructions');
        if (content) {
          speakText(extractTextFromHtml(content.innerHTML), ttsOptions);
        }
      } : undefined
    });
  }

  // Main task
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div class="ready-screen">
        <p>${trial_text.main_task_intro}</p>
      </div>
    `,
    choices: [trial_text.ready_button],
    button_html: (choice) => `<button class="jspsych-btn continue-button">${choice}</button>`,
    data: { 
      task: 'main-intro',
      phase: 'main' 
    },
    on_load: enable_tts ? function() {
      const content = document.querySelector('.ready-screen');
      if (content) {
        speakText(extractTextFromHtml(content.innerHTML), ttsOptions);
      }
    } : undefined
  });

  // Main trials - only add if num_trials > 0
  if (num_trials > 0) {
    const trial_variables = [
      {direction: 'left', congruent: true},
      {direction: 'left', congruent: false},
      {direction: 'right', congruent: true},
      {direction: 'right', congruent: false},
    ];

    const main_trials = jsPsych.randomization.repeat(trial_variables, Math.floor(num_trials/4))
      .concat(jsPsych.randomization.sampleWithoutReplacement(trial_variables, num_trials%4));

    // Fixation
    const fixation = {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<div class="fixation">${trial_text.fixation_cross}</div>`,
      choices: [],
      trial_duration: fixation_duration,
      data: { 
        task: 'fixation', 
        phase: 'main' 
      }
    };

    // Main trial
    const flanker_trial = {
      type: jsPsychHtmlButtonResponse,
      stimulus: function() {
        const direction = jsPsych.evaluateTimelineVariable('direction');
        const congruent = jsPsych.evaluateTimelineVariable('congruent');
        return `
          <div class="trial-container">
            <div class="flanker-trial">
              <div class="trial-prompt">${trial_text.main_task_prompt}</div>
              ${createFlankerStim(direction, congruent, stimuli, stimuli_amount)}
            </div>
          </div>
        `;
      },
      choices: [trial_text.left_button, trial_text.right_button],
      button_html: (choice) => `<button class="jspsych-btn continue-button">${choice}</button>`,
      data: {
        task: 'flanker',
        phase: 'main',
        direction: jsPsych.timelineVariable('direction'),
        congruent: jsPsych.timelineVariable('congruent')
      },
      on_load: enable_tts ? function() {
        const prompt = document.querySelector('.trial-prompt');
        if (prompt) {
          speakText(extractTextFromHtml(prompt.innerHTML), ttsOptions);
        }
      } : undefined,
      on_finish: function(data: any) {
        const correct_response = data.direction === 'left' ? 0 : 1;
        data.correct = data.response === correct_response;
      }
    };

    // Main task timeline
    timeline.push({
      timeline: [fixation, flanker_trial],
      timeline_variables: main_trials,
      randomize_order: true
    });
  }

  // Completion
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const main_data = jsPsych.data.get().filter({task: 'flanker', phase: 'main'}).values();
      const performance = calculatePerformance(main_data);
      
      return `
        <div class="ready-screen">
          <p>${trial_text.task_complete}</p>
          <div class="performance-summary">
            <h3>${trial_text.performance_title}</h3>
            <p>${trial_text.accuracy_label} ${performance.accuracy.toFixed(1)}%</p>
            <p>${trial_text.response_time_label} ${performance.mean_rt.toFixed(0)}ms</p>
          </div>
        </div>
      `;
    },
    choices: [trial_text.end_button],
    button_html: (choice) => `<button class="jspsych-btn continue-button">${choice}</button>`,
    data: { 
      task: 'complete',
      phase: 'completion' 
    },
    on_load: enable_tts ? function() {
      const content = document.querySelector('.ready-screen');
      if (content) {
        speakText(extractTextFromHtml(content.innerHTML), ttsOptions);
      }
    } : undefined,
    on_finish: function() {
      stopAllSpeech();
    }
  });

  return {
    timeline: timeline
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const timelineUnits = {
  instructions: "Instructions for the flanker inhibitory control task",
  practice: "Practice trials with feedback",
  main: "Main flanker task trials",
  completion: "Task completion screen"
};

export const utils = {
  calculatePerformance,
  createFlankerStim,
  createPracticeStim,
  createInstructions,
  speakText
};

// Export text and createInstructions for external use
export { trial_text, instruction_pages } from './text';
export { createInstructions };

// Default export
export default { createTimeline, timelineUnits, utils };