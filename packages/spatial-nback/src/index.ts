import { initJsPsych, JsPsych } from "jspsych"
import jsPsychPluginSpatialNback from "@jspsych-contrib/plugin-spatial-nback";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, instruction_pages } from "./text";

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
      data.task = 'spatial-nback';
      data.phase = 'instructions';
    }
  };
}

// Generate stimulus sequence for n-back task
function generateNBackSequence(total_trials: number, n_back: number, target_percentage: number, rows: number, cols: number) {
    const positions: Array<{row: number, col: number}> = [];
    const is_target: boolean[] = [];
    
    // Generate first n trials (cannot be targets)
    for (let i = 0; i < n_back; i++) {
        positions.push({
            row: Math.floor(Math.random() * rows),
            col: Math.floor(Math.random() * cols)
        });
        is_target.push(false);
    }
    
    // Calculate number of targets to place
    const n_targets = Math.round((target_percentage / 100) * (total_trials - n_back));
    let targets_placed = 0;
    
    // Generate remaining trials with targets
    for (let i = n_back; i < total_trials; i++) {
        const can_be_target = targets_placed < n_targets;
        const should_be_target = can_be_target && Math.random() < 0.5;
        
        if (should_be_target) {
            // Make this a target trial (same position as n trials back)
            positions.push({
                row: positions[i - n_back].row,
                col: positions[i - n_back].col
            });
            is_target.push(true);
            targets_placed++;
        } else {
            // Generate non-target position
            let new_position: {row: number, col: number};
            do {
                new_position = {
                    row: Math.floor(Math.random() * rows),
                    col: Math.floor(Math.random() * cols)
                };
            } while (
                new_position.row === positions[i - n_back].row &&
                new_position.col === positions[i - n_back].col
            );
            positions.push(new_position);
            is_target.push(false);
        }
    }
    
    return { positions, is_target };
}

export function createTimeline({
    rows = 3,
    cols = 3,
    n_back = 1,
    total_trials = 20,
    target_percentage = 25,
    stimulus_duration = 750,
    isi_duration = 250,
    feedback_duration = 1000,
    show_feedback_text = false,
    show_feedback_border = false,
    show_feedback_no_click = false,
    feedback_wait_no_click = true,
    cell_size = 150,
    prompt = trial_text.prompt,
    button_text = trial_text.button,
    stimulus_color = "#2196F3",
    correct_color = "#4CAF50",
    incorrect_color = "#F44336",
    include_instructions = false,
    randomize_trials = false,
    instruction_texts = instruction_pages,
    // TTS Configuration
    enable_tts = false,
    tts_method = 'google',
    tts_rate = 1.0,
    tts_pitch = 1.0,
    tts_volume = 1.0,
    tts_lang = 'en-US'
}: {
    rows?: number,
    cols?: number,
    n_back?: number,
    total_trials?: number,
    target_percentage?: number,
    stimulus_duration?: number,
    isi_duration?: number,
    feedback_duration?: number,
    show_feedback_text?: boolean,
    show_feedback_border?: boolean,
    show_feedback_no_click?: boolean,
    feedback_wait_no_click?: boolean,
    cell_size?: number,
    prompt?: string,
    button_text?: string,
    stimulus_color?: string,
    correct_color?: string,
    incorrect_color?: string,
    include_instructions?: boolean,
    randomize_trials?: boolean,
    instruction_texts?: typeof instruction_pages,
    // TTS Configuration
    enable_tts?: boolean,
    tts_method?: 'google' | 'system',
    tts_rate?: number,
    tts_pitch?: number,
    tts_volume?: number,
    tts_lang?: string
} = {}) {

    const ttsOptions = {
        method: tts_method,
        rate: tts_rate,
        pitch: tts_pitch,
        volume: tts_volume,
        lang: tts_lang
    };

    // Generate the sequence
    const sequence = generateNBackSequence(total_trials, n_back, target_percentage, rows, cols);
    
    // Create individual trial objects
    const trials = [];
    for (let i = 0; i < total_trials; i++) {
        const trial_instructions = prompt
            .replace(/{n_back}/g, n_back.toString())
            .replace(/{plural}/g, n_back > 1 ? 's' : '')
            .replace(/{trial}/g, (i + 1).toString())
            .replace(/{total}/g, total_trials.toString());

        trials.push({
            type: jsPsychPluginSpatialNback,
            rows: rows,
            cols: cols,
            stimulus_row: sequence.positions[i].row,
            stimulus_col: sequence.positions[i].col,
            is_target: sequence.is_target[i],
            stimulus_duration: stimulus_duration,
            isi_duration: isi_duration,
            feedback_duration: feedback_duration,
            show_feedback_text: show_feedback_text,
            show_feedback_border: show_feedback_border,
            show_feedback_no_click: show_feedback_no_click,
            feedback_wait_no_click: feedback_wait_no_click,
            cell_size: cell_size,
            instructions: trial_instructions,
            button_text: button_text,
            stimulus_color: stimulus_color,
            correct_color: correct_color,
            incorrect_color: incorrect_color,
            data: {
                trial_number: i + 1,
                n_back: n_back,
                total_trials: total_trials,
                task: 'spatial-nback',
                phase: 'trial'
            }
        });
    }

    // Create the main task timeline
    const task_timeline = {
        timeline: trials,
        randomize_order: randomize_trials
    };

    // Return complete timeline with or without instructions
    if (include_instructions) {
        const instructions = createInstructions(instruction_texts, enable_tts, ttsOptions);
        
        const nested_timeline = {
            timeline: [instructions, task_timeline]
        };
        return nested_timeline;

    } else {
        return task_timeline;
    }
}

// Create a practice timeline with fewer trials
export function createPracticeTimeline(options: Parameters<typeof createTimeline>[0] = {}) {
    return createTimeline({
        ...options,
        total_trials: 6,
        target_percentage: 50,
        show_feedback_text: true,
        show_feedback_border: true,
        include_instructions: true
    });
}

// Create multiple n-back levels timeline
export function createMultiLevelNBackTimeline({
    n_backs = [1, 2],
    trials_per_level = 20,
    randomize_levels = false,
    ...sharedOptions
}: {
    n_backs?: number[],
    trials_per_level?: number,
    randomize_levels?: boolean,
} & Parameters<typeof createTimeline>[0] = {}) {
    
    const level_timelines = n_backs.map(level => {
        return createTimeline({
            ...sharedOptions,
            n_back: level,
            total_trials: trials_per_level,
            include_instructions: false
        });
    });

    return {
        timeline: level_timelines,
        randomize_order: randomize_levels
    };
}

// Utility functions for common configurations
export const presetConfigurations = {
    easy: () => createTimeline({
        n_back: 1,
        total_trials: 20,
        target_percentage: 30,
        show_feedback_text: true
    }),
    
    medium: () => createTimeline({
        n_back: 2,
        total_trials: 30,
        target_percentage: 25,
        show_feedback_text: false
    }),
    
    hard: () => createTimeline({
        n_back: 3,
        total_trials: 40,
        target_percentage: 20,
        show_feedback_text: false,
        rows: 4,
        cols: 4
    }),

    research: () => createMultiLevelNBackTimeline({
        n_backs: [1, 2, 3],
        trials_per_level: 50,
        target_percentage: 25,
        show_feedback_text: false,
        randomize_levels: true
    })
};

// Export individual components for custom use
export { createInstructions, generateNBackSequence };

// Export default timeline creator
export default createTimeline;

export const timelineUnits = {
    createPracticeTimeline,
    createTimeline,
    createMultiLevelNBackTimeline,
};

export const utils = {
    presetConfigurations,
    generateNBackSequence,
    createInstructions
}