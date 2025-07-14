import { JsPsych, TrialType } from "jspsych"
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
  /** Enable text-to-speech for instructions and prompts */
  enable_tts?: boolean
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
  // TTS Configuration
  tts_method?: 'google' | 'system'
  tts_rate?: number
  tts_pitch?: number
  tts_volume?: number
  tts_lang?: string
}

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
    enable_tts = false,
    same_button_text = trial_text.same_button,
    different_button_text = trial_text.different_button,
    trial_timeout = 10000,
    inter_trial_interval = 500,
    show_instructions = false,
    instruction_texts = instruction_pages,
    tts_method = 'google',
    tts_rate = 1.0,
    tts_pitch = 1.0,
    tts_volume = 1.0,
    tts_lang = 'ar-SA'
  } = config

  const ttsOptions = {
    method: tts_method,
    rate: tts_rate,
    pitch: tts_pitch,
    volume: tts_volume,
    lang: tts_lang
  }

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
        // Stop any ongoing speech when trial ends
        stopAllSpeech();
      },
      on_start: function() {
        if (enable_tts) {
          speakText(prompt, ttsOptions);
        }
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
    const detailed_instructions = createInstructions(instruction_texts, enable_tts, ttsOptions);
    
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
  speakText,
  calculatePerformance
}

// Export text configuration for external use
export { trial_text, instruction_pages, createInstructions }

// Default export for convenience
export default { createTimeline, timelineUnits, utils }