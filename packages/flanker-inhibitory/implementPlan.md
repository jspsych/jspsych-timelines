We are going to implement four things (speaktext function, createinstructions function and text.ts, styles.css) into this timeline project, some of which may already be implemented but we must edit them to match our desired standardized outcome and current project. Do not unnecessarily edit these implementations as they are standardized across multiple projects, only edit if necessary to add some project-specific functionality or style. For css ids and classes, comb the project's id's and classes to see if anything resembles what we have in the imported styles.css file (at the end of this file) and change it to match the imported file. We are trying to standardize styles, variables, and CSS here. If you make any notable or breaking changes make sure to alert me and describe them in detail. If there is a separate TTS object in text.ts or anything anywhere that you are unsure of what to do with just ask me, but with separate TTS objects we probably want them replaced and fully automated using our speakText function.

First, createInstructions() function that makes an instructions trial using jsPsychInstructions and supports TTS. This function will need the timeline to have a few parameters added to the config:

    // ===== TEXT-TO-SPEECH CONFIGURATION =====
    enable_tts: true, // Enable text-to-speech functionality
    tts_method: 'google', // Preferred TTS method: 'google', 'system'
    tts_rate: 1.0, // Speech rate (0.1 to 10)
    tts_pitch: 1.0, // Speech pitch (0 to 2)
    tts_volume: 1.0, // Speech volume (0 to 1)
    tts_lang: 'ar-SA', // Language code for TTS
};

in index.ts:
  // TTS Configuration
  enable_tts?: boolean; // Enable text-to-speech functionality
  tts_method?: 'google' | 'system'; // Preferred TTS method (default: 'google')
  tts_rate?: number; // Speech rate (0.1 to 10, default: 0.8)
  tts_pitch?: number; // Speech pitch (0 to 2, default: 1.0)
  tts_volume?: number; // Speech volume (0 to 1, default: 0.8)
  tts_lang?: string; // Language code for TTS

 If this does not exist in the project, add it, and then go to index.html and add it there as well and make sure it is set by default to the above config in index.ts and index.html. Additionally, a text.ts file is required with specific variables: instruction_pages and trial_text. We have standardized these variable names so if there is similar objects or variables change them to match our format or just create new array instruction_pages and object trial_text.

If there is an existing speakText() function or any other speaking function, just replace it with what we have and make sure to go through every trial object and rewrite the speakText call to be similar to the one in our createInstructions. 

Implementation for speakText and createInstructions():

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


Implementation for text.ts file, you can add text placeholders and objects specific to the project we are working on. You should probably go through the index.ts file and make sure every piece of text is customizable through text.ts 

/* This file contains the configurable text used in the speeded matching timeline.
 * Researchers can modify these texts to change the language or instructions.
 */

export const trial_text = {
    // Instruction pages buttons text, these will always have arrows < and >
    // these do not work right now due to CSS fixed position, might fix later
    next_button: "",
    back_button: "", 

    (MESSAGE TO CLAUDE: THE FOLLOWING TEXT ITEMS MAY OR MAY NOT EXIST IN THIS PROJECT. IF THEY DO NOT EXIST OR MATCH ANYTHING SIMILAR, REMOVE THEM. OTHERWISE KEEP THEM WITH THE SAME NAMING SCHEME.)

    // Task completion messages
    task_complete_header: "Task Complete!",
    task_complete_message: "Thank you for participating in the speeded matching task.",
    
    // Practice phase text
    practice_header: "Practice Round",
    practice_intro_message: "We'll now do a practice round to show you how the task works.",
    practice_look_instruction: "Look at this picture",
    practice_tap_instruction: "Tap the matching picture below",
    practice_complete_header: "Are you ready?",
    practice_complete_message: "Practice complete! Ready for the full test?",
    
    // Main task instructions
    main_task_prompt: "Tap the matching picture below",
    
    // Fixation and inter-trial
    fixation_cross: "+",
    
    // Feedback messages (optional)
    correct_feedback: "Correct!",
    incorrect_feedback: "Try again",
    
    // Timing messages
    too_slow_message: "Please respond faster",
}

/* 
 * This is an array of HTML strings for instruction pages displayed before the actual trials.
 * Researchers can modify these instructions to change the task description, add new instruction 
 * pages, or translate to different languages.
 * 
 * Each string should contain valid HTML that will be displayed as an instruction page.
 * You can add more pages by adding more strings to the array, or modify existing pages
 * by editing the HTML content.
 */
(MESSAGE TO CLAUDE: WHATEVER THE CONTENT OF EACH PAGE IS FOR THE CURRENT PROJECT, IF ITS TOO LONG OR INCLUDES UNNECESSARY INFO TO THE PARTICIPANT (SUCH AS THE EXPERIMENTS NAME OR ANYTHING OTHER THAN WHAT THE PARTICIPANT NEEDS TO KNOW TO DO THE EXPERIMENT) THEN SIMPLIFY. APPROACH TO REWRITE INSTRUCTIONS: MORE PAGES WITH SHORT TEXT RATHER THAN LONG PARAGRAPHS OR BULLET POINTS.)
export const instruction_pages = [
    "<b>You will see a picture at the top.</b>",
    "Below it, you will see four pictures.",
    "Click on the picture that matches the one at the top.",
    "Work quickly but carefully.",
    "Let's practice first."
];



Now, we will implement a standardized styles.css. This file may have extraneous styles not specific to our current timeline project (such as choice-options and whatnot). Remove these styles if they do not match anything in our current timeline project. If there are additional styles in the project that are not in this styles.css file, add them exactly as they are and do not change anything unneccesarily. Additionally, if there are any class names for instructions or trials that are here but not in the index.ts trials, you should probably add them to that trial's HTML. For example, for any html button response plugin usage, you should add       button_html: (choice) => `<button class="jspsych-btn continue-button">${choice}</button>`,
 so that the styles will apply to the buttons. Do similar things for instructions container or anything that is in our styles.css but not in the index.ts if applicable. Be careful not to mess up things, if unsure just prompt me to decide on things even. Oh and if you change any HTML you should probably check the speakText functions again on what HTML and CSS containers they are querying and make sure you change those if necessary too.

Here is the imported styles.css:

/* GENERAL STYLES */

h1, h2, h3 {
    line-height: 1.6;
    margin: 3vmin;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    max-width: 100%;
    box-sizing: border-box;
}

p {
    margin: 5vmin 1vmin;
    font-size: clamp(15px, 8vmin, 40px);
    line-height: 1.6;    
    /* Prevent horizontal overflow */
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    max-width: 100%;
    box-sizing: border-box;
}

/* Styles for any normal HTML button */
.continue-button {
    /* background-color: #3498db;
    color: white;
    border: none; */
    padding: clamp(15px, 6vmin, 35px) clamp(15px, 8vmin, 40px);
    font-size: clamp(15px, 6vmin, 35px);
    border-radius: 1vmin;
    cursor: pointer;
    margin: 2vmin;
    margin-top: 10vh;
    transition: background-color 0.3s;
    min-height: 48px;
    
    /* Disable double-click zoom */
    touch-action: manipulation !important;
    user-select: none !important;
}

/* INSTRUCTIONS TRIAL STYLES */

.instructions-container {
    max-width: 90vw; /* Limit width for better readability */
    margin: 0 auto; /* Center the container */
    padding: 2vmin; /* Add some padding */
    box-sizing: border-box; /* Include padding in width calculations */
    overflow-x: hidden; /* Prevent horizontal overflow */
}

/* Mobile-friendly instruction navigation buttons */
.jspsych-instructions-nav {
    display: flex;
    gap: 25vw;
    justify-content: center;
    margin-top: auto;
    padding: clamp(20px, 5vmin, 40px) !important;
    min-height: clamp(20px, 50vmin, 250px);
    align-items: flex-end;
}

/* Instruction navigation button styles */
.jspsych-instructions-nav .jspsych-btn {
    background-color: #fff;
    color: #000;
    width: 20vmin;
    height: 20vmin;
    border: 3px solid #ccc;
    border-radius: 50%;
    font-size: clamp(15px, 7vmin, 35px);
    cursor: pointer;
    min-height: 100px;
    min-width: 100px;
    font-weight: 600;

    /* Disable double-click zoom */
    touch-action: manipulation !important;
    user-select: none !important;
}

.jspsych-instructions-nav .jspsych-btn:active {
    background-color: #f0f0f0;
    border-color: #999;
}

.jspsych-instructions-nav .jspsych-btn:disabled {
    visibility: hidden;  /* Keeps the space but hides the button */
}

/* PRACTICE TRIAL STYLES */

/* pre-practice and post-practice round pages */
.practice-instructions, .ready-screen {
    max-width: 90vw; /* Limit width for better readability */
    margin: 0 auto; /* Center the container */
    padding: 2vmin; /* Add some padding */
    box-sizing: border-box; /* Include padding in width calculations */
    overflow-x: hidden; /* Prevent horizontal overflow */
    padding-bottom: 5vh;
}

/* EXPERIMENT TRIAL STYLES */

/* Fixation cross (inter-trial), set to invisible by default */
.fixation {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8vmin;
    color: #ffffff; /* White color for invisibility */
    font-weight: bold;
    min-height: 20vmin;
}
.trial-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    font-family: Arial, sans-serif;
    padding: 2vmin;
}

/* Task instructions in trial container, text on top. Usually there is none. */
.task-instructions {
    text-align: center;
    p {
        font-size: clamp(15px, 6vmin, 35px);
        margin: 2vmin;
    }
}

/* Target stimulus*/
.target-stimulus {
    width: 30vmin;
    height: 30vmin;
    border: 3.5px solid #000000bd;
    border-radius: 2vmin;
    background-color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2vmin 3vmin rgba(0, 0, 0, 0.15);
    margin: 2vmin;
    svg {
        width: 100%;
        height: 100%;
    }
}

.target-stimulus.flash {
    animation: flash-border 0.75s ease-in-out 3;
}

@keyframes flash-border {
    0%, 100% { 
        border-color: #2c3e50; 
        box-shadow: 0 2vmin 3vmin rgba(0, 0, 0, 0.15);
    }
    50% { 
        border-color: #e74c3c; 
        box-shadow: 0 2vmin 4vmin rgba(231, 76, 60, 0.4);
    }
}

/* Button layout - flexible responsive grid */
#jspsych-html-button-response-btngroup {
    display: flex;
    flex-wrap: wrap;
    gap: 2vmin;
    max-width: 95vw;
    margin: 3vmin auto;
    justify-content: center;
    align-items: center;
}


/* Choice buttons - dynamic sizing based on available space */
.choice-option {
    border: 2px solid #bdc3c7;
    border-radius: 2vmin;
    background-color: white !important;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer !important;
    transition: all 0.3s ease;
    box-shadow: 0 1vmin 2vmin rgba(0, 0, 0, 0.1);
    padding: 1.5vmin;
    margin: 2px 5px;
    /* Disable double-click zoom */
    touch-action: manipulation !important;
    user-select: none !important;
    /* Fix the flexbox sizing */
    flex: 0 0 auto;  /* Don't grow, don't shrink, use basis */
    flex-basis: clamp(20vmin, calc(163vmin / var(--num-choices, 4)), 90vmin);
    height: clamp(20vmin, calc(80vh / var(--num-choices, 4)), 33vmin);

    /* Container-linked SVG scaling */
    svg {
        width: 100%;
        height: 100%;
    }
}

/* Hover effect for choice options, only visible on desktop */
.choice-option:hover {
    border-color: #3498db;
    transform: translateY(-0.5vmin);
    box-shadow: 0 2vmin 3vmin rgba(0, 0, 0, 0.15);
}

/* Flashing for practice round */
.choice-option.flash-choices {
    animation: flash-choices 1s ease-in-out infinite;
}

@keyframes flash-choices {
    0%, 100% { 
        border-color: #bdc3c7; 
        box-shadow: 0 1vmin 2vmin rgba(0, 0, 0, 0.1);
    }
    50% { 
        border-color: #f39c12; 
        box-shadow: 0 2vmin 3vmin rgba(243, 156, 18, 0.3);
    }
}

/* Styles for tablets */
@media (max-width: 768px) {
    .jspsych-instructions-nav {
        position: fixed;
        bottom: 30vmin;
        left: 50%;
        transform: translateX(-50%);
    }
    
    /* Add padding to prevent content from going under fixed buttons */
    .instructions-container {
        padding-bottom: 45vmin; /* 30vmin for button position + 5vmin safety */
    }

    /* Experiment-specific, adjusting sizes of images */
    .target-stimulus {
        width: 35vmin;
        height: 35vmin;

    }
    .choice-option {
        height: clamp(20vmin, calc(85vh / var(--num-choices, 4)), 30vh);
        flex-basis: clamp(15vmin, calc(165vw / var(--num-choices, 4)), 43vw);
        /* width: clamp(30vmin, calc(150vw / var(--num-choices, 4)), 43vmin); */
        /* aspect-ratio: 1;*/
    }


}

/* Styles for phones to override tablet */
@media (max-width: 480px) {    
    /* Smaller padding for phone to allow more text */
    .instructions-container {
        padding-bottom: 40vmin;
    }
    .target-container {
        margin-bottom: 4vmin; /* Adjusted for better spacing on small screens */
    }
    /* Experiment-specific, adjusting sizes of images */
    .target-stimulus {
        width: 45vmin;
        height: 45vmin;
    }
}

/* Landscape mode adjustments */
@media (orientation: landscape) {
    .jspsych-instructions-nav {
        bottom: 3vh;
        gap: 30vw;
    }
    .target-container {
    margin-bottom: 1vmin;
    }
    .target-stimulus {
        width: 30vmin;
        height: 30vmin;
        border: 4px solid #000000bd;
    }
    .choice-option {
        margin: 0;
        flex-basis: clamp(15vmin, calc(85vw / var(--num-choices, 4)), 25vw) !important;
        height: clamp(15vmin, calc(135vh / var(--num-choices, 4)), 35vmin) !important;
        margin: -10px 2px;
    }
}