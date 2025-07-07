import { JsPsych } from "jspsych";
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import { trial_text, instruction_pages, tts_config, tts_text } from './text';
import { layered_stimuli, fish_only, arrow_only, custom_stimulus } from './stimuli';

// ============================================================================
// TTS (TEXT-TO-SPEECH) UTILITIES
// ============================================================================

// Global TTS state management
let currentUtterance: SpeechSynthesisUtterance | null = null;
let speechQueue: string[] = [];
let speechEnabled = false;

// Initialize TTS functionality
export function initializeTTS(config = tts_config) {
  speechEnabled = 'speechSynthesis' in window;
  
  if (!speechEnabled) {
    console.warn('Text-to-Speech not supported in this browser');
    return false;
  }
  
  // Stop any existing speech
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  return true;
}

// Get available voices
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  return speechSynthesis.getVoices();
}

// Create speech utterance with configuration
export function createUtterance(text: string, config = tts_config): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Apply voice settings
  utterance.rate = config.rate;
  utterance.pitch = config.pitch;
  utterance.volume = config.volume;
  utterance.lang = config.lang;
  
  // Set voice if specified
  if (config.voice_name) {
    const voices = getAvailableVoices();
    const selectedVoice = voices.find(voice => 
      voice.name.includes(config.voice_name) || voice.lang === config.lang
    );
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }
  
  return utterance;
}

// Stop current speech
export function stopSpeech() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
  speechQueue = [];
}

// Speak text with delay and configuration
export function speakText(text: string, config = tts_config, delay = config.speech_delay): Promise<void> {
  return new Promise((resolve) => {
    if (!speechEnabled || !text.trim()) {
      resolve();
      return;
    }
    
    setTimeout(() => {
      // Stop any current speech
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      currentUtterance = createUtterance(text, config);
      
      currentUtterance.onend = () => {
        currentUtterance = null;
        resolve();
      };
      
      currentUtterance.onerror = () => {
        currentUtterance = null;
        resolve();
      };
      
      speechSynthesis.speak(currentUtterance);
    }, delay);
  });
}

// Speak instruction page content
export function speakInstructionPage(pageContent: string, config = tts_config): Promise<void> {
  if (!config.speak_instructions) {
    return Promise.resolve();
  }
  
  // Remove HTML tags and clean up text for speech
  const cleanText = pageContent
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize any sequence of whitespace (including those left by the previous replace) to a single space
    .trim();
  
  return speakText(cleanText, config);
}

// Speak trial prompt
export function speakTrialPrompt(config = tts_config): Promise<void> {
  if (!config.speak_prompts) {
    return Promise.resolve();
  }
  
  return speakText(tts_text.trial_prompt_spoken, config);
}

// Speak feedback
export function speakFeedback(isCorrect: boolean, config = tts_config): Promise<void> {
  if (!config.speak_feedback) {
    return Promise.resolve();
  }
  
  const feedbackText = isCorrect ? tts_text.correct_spoken : tts_text.incorrect_spoken;
  return speakText(feedbackText, config);
}

// Add keyboard listener for speech control
export function addSpeechControls(config = tts_config) {
  if (!config.allow_skip) return undefined;
  
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === 'Space' && speechSynthesis.speaking) {
      event.preventDefault();
      stopSpeech();
    }
  };
  
  document.addEventListener('keydown', handleKeyPress);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyPress);
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
  
  // TTS Configuration
  enable_tts?: boolean; // Enable text-to-speech functionality
  tts_voice?: string; // Voice name to use for TTS
  tts_rate?: number; // Speech rate (0.1 to 10)
  tts_pitch?: number; // Speech pitch (0 to 2)
  tts_volume?: number; // Speech volume (0 to 1)
  tts_lang?: string; // Language code for TTS
  speak_instructions?: boolean; // Speak instruction pages
  speak_prompts?: boolean; // Speak trial prompts
  speak_feedback?: boolean; // Speak feedback messages
  auto_speak?: boolean; // Automatically start speaking when content loads
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
    
    // TTS configuration
    enable_tts = false,
    tts_voice = tts_config.voice_name,
    tts_rate = tts_config.rate,
    tts_pitch = tts_config.pitch,
    tts_volume = tts_config.volume,
    tts_lang = tts_config.lang,
    speak_instructions = tts_config.speak_instructions,
    speak_prompts = tts_config.speak_prompts,
    speak_feedback = tts_config.speak_feedback,
    auto_speak = tts_config.auto_speak_on_load,
  } = config;

  // Initialize TTS if enabled
  let ttsSettings = { ...tts_config };
  let speechCleanup: (() => void) | undefined;
  
  if (enable_tts) {
    ttsSettings = {
      ...tts_config,
      voice_name: tts_voice,
      rate: tts_rate,
      pitch: tts_pitch,
      volume: tts_volume,
      lang: tts_lang,
      speak_instructions,
      speak_prompts,
      speak_feedback,
      auto_speak_on_load: auto_speak,
    };
    
    const ttsInitialized = initializeTTS(ttsSettings);
    if (ttsInitialized) {
      speechCleanup = addSpeechControls(ttsSettings);
    }
  }

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
    instruction_pages.forEach((page, index) => {
      timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: `
          <div class="flanker-instructions">
            ${page.header ? `<h1>${page.header}</h1>` : ''}
            ${page.header2 ? `<h2>${page.header2}</h2>` : ''}
            ${page.description ? `<p>${page.description}</p>` : ''}
            ${page.task_explanation ? `<p>${page.task_explanation}</p>` : ''}
            ${page.performance_note ? `<p class="performance-note">${page.performance_note}</p>` : ''}
            ${page.strategy_title ? `<h2>${page.strategy_title}</h2>` : ''}
            ${page.strategy_intro ? `<p>${page.strategy_intro}</p>` : ''}
            ${page.strategy_points ? `
              <ul>
                ${page.strategy_points.map(point => `<li>${point}</li>`).join('')}
              </ul>
            ` : ''}
            ${page.start_prompt ? `<p class="start-prompt">${page.start_prompt}</p>` : ''}
            ${enable_tts && ttsSettings.allow_skip ? `<p class="speech-controls">${tts_text.speech_controls_note}</p>` : ''}
          </div>
        `,
        choices: page.buttons || [trial_text.continue_button],
        data: { task: 'instructions', page: index + 1 },
        on_load: enable_tts ? function() {
          if (index === 0) {
            // Speak welcome message for first page
            speakText(tts_text.welcome_spoken, ttsSettings);
          } else if (index === 1) {
            // Speak task explanation for second page
            speakText(tts_text.task_explanation_spoken, ttsSettings);
          } else if (index === 2) {
            // Speak directions for third page
            speakText(tts_text.directions_spoken, ttsSettings);
          }
        } : undefined
      });
    });
  }

  // Practice
  if (show_practice) {
    // Practice intro
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <div class="flanker-instructions">
          <h2>${trial_text.practice_header}</h2>
          <p>${trial_text.practice_intro_message}</p>
          ${enable_tts && ttsSettings.allow_skip ? `<p class="speech-controls">${tts_text.speech_controls_note}</p>` : ''}
        </div>
      `,
      choices: [trial_text.start_button],
      data: { task: 'practice-intro' },
      on_load: enable_tts ? function() {
        speakText(tts_text.practice_start_spoken, ttsSettings);
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
        data: { task: 'fixation', phase: 'practice' }
      };

      // Practice trial
      const practice_trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
          const direction = jsPsych.evaluateTimelineVariable('direction');
          const congruent = jsPsych.evaluateTimelineVariable('congruent');
          return `
            <div class="flanker-trial">
              <div class="trial-prompt">${trial_text.main_task_prompt}</div>
              ${createPracticeStim(direction, congruent, stimuli, stimuli_amount)}
            </div>
          `;
        },
        choices: [trial_text.left_button, trial_text.right_button],
        data: {
          task: 'flanker',
          phase: 'practice',
          direction: jsPsych.timelineVariable('direction'),
          congruent: jsPsych.timelineVariable('congruent')
        },
        on_load: enable_tts ? function() {
          if (ttsSettings.speak_prompts) {
            speakTrialPrompt(ttsSettings);
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
        data: { task: 'feedback', phase: 'practice' },
        on_load: enable_tts ? function() {
          if (ttsSettings.speak_feedback) {
            const last_trial = jsPsych.data.get().last(1).values()[0];
            speakFeedback(last_trial.correct, ttsSettings);
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
        const practice_data = jsPsych.data.get().filter({task: 'flanker', phase: 'practice'}).values();
        const performance = calculatePerformance(practice_data);
        
        return `
          <div class="flanker-instructions">
            <h2>${trial_text.practice_complete_header}</h2>
            <p>${trial_text.practice_complete_message}</p>
            <p>${trial_text.accuracy_label} ${performance.accuracy.toFixed(1)}%</p>
            ${enable_tts && ttsSettings.allow_skip ? `<p class="speech-controls">${tts_text.speech_controls_note}</p>` : ''}
          </div>
        `;
      },
      choices: [trial_text.continue_button],
      data: { task: 'practice-complete' },
      on_load: enable_tts ? function() {
        speakText(tts_text.practice_complete_spoken, ttsSettings);
      } : undefined
    });
  }

  // Main task
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div class="flanker-instructions">
        <h2>${trial_text.main_task_header}</h2>
        <p>${trial_text.main_task_intro}</p>
        ${enable_tts && ttsSettings.allow_skip ? `<p class="speech-controls">${tts_text.speech_controls_note}</p>` : ''}
      </div>
    `,
    choices: [trial_text.ready_button],
    data: { task: 'main-intro' },
    on_load: enable_tts ? function() {
      speakText(tts_text.main_task_start_spoken, ttsSettings);
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
      data: { task: 'fixation', phase: 'main' }
    };

    // Main trial
    const flanker_trial = {
      type: jsPsychHtmlButtonResponse,
      stimulus: function() {
        const direction = jsPsych.evaluateTimelineVariable('direction');
        const congruent = jsPsych.evaluateTimelineVariable('congruent');
        return `
          <div class="flanker-trial">
            <div class="trial-prompt">${trial_text.main_task_prompt}</div>
            ${createFlankerStim(direction, congruent, stimuli, stimuli_amount)}
          </div>
        `;
      },
      choices: [trial_text.left_button, trial_text.right_button],
      data: {
        task: 'flanker',
        phase: 'main',
        direction: jsPsych.timelineVariable('direction'),
        congruent: jsPsych.timelineVariable('congruent')
      },
      on_load: enable_tts ? function() {
        if (ttsSettings.speak_prompts) {
          speakTrialPrompt(ttsSettings);
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
        <div class="flanker-instructions">
          <h2>${trial_text.task_complete_header}</h2>
          <p>${trial_text.task_complete_message}</p>
          <div class="performance-summary">
            <h3>${trial_text.performance_title}</h3>
            <p>${trial_text.accuracy_label} ${performance.accuracy.toFixed(1)}%</p>
            <p>${trial_text.response_time_label} ${performance.mean_rt.toFixed(0)}ms</p>
          </div>
          ${enable_tts && ttsSettings.allow_skip ? `<p class="speech-controls">${tts_text.speech_controls_note}</p>` : ''}
        </div>
      `;
    },
    choices: [trial_text.end_button],
    data: { task: 'complete' },
    on_load: enable_tts ? function() {
      if (ttsSettings.speak_completion) {
        speakText(tts_text.task_complete_spoken, ttsSettings);
      }
    } : undefined,
    on_finish: function() {
      // Cleanup speech controls when task is complete
      if (speechCleanup) {
        speechCleanup();
      }
      stopSpeech();
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
  
  // TTS utilities
  initializeTTS,
  speakText,
  stopSpeech,
  getAvailableVoices,
  speakInstructionPage,
  speakTrialPrompt,
  speakFeedback,
  addSpeechControls
};

// Export text for external use
export { trial_text, instruction_pages, tts_config, tts_text } from './text';

// Default export
export default { createTimeline, timelineUnits, utils };