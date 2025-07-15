import { JsPsych } from "jspsych"
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, instruction_pages } from "./text";

//console.log("jsPsych experiment loading...");

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
      data.task = 'bart';
      data.phase = 'instructions';
    }
  };
}


   function getBalloonStyle(pump_count: number) {
     // Use fixed max sizes to prevent overflow and shifts
     const maxBalloonHeightVh = 50; // max 50% viewport height
     const baseHeightPx = 100;
     const growthPerPumpPx = 10; // less aggressive growth to prevent overflow
     
     // Calculate height capped at maxBalloonHeightVh of viewport height
     const maxBalloonHeightPx = window.innerHeight * (maxBalloonHeightVh / 100);
     const estimatedHeightPx = baseHeightPx + pump_count * growthPerPumpPx;
     const finalHeightPx = Math.min(estimatedHeightPx, maxBalloonHeightPx);
     
     // Scale capped to avoid huge transforms
     const scale = 1 + pump_count * 0.02; // slower scale growth
     const cappedScale = Math.min(scale, 1.5);

     return `
       height: ${finalHeightPx}px;
       transform: scale(${cappedScale});
       transform-origin: bottom center;
       width: auto;
     `;
   }

   //generate start instructions
   function showStartInstructions(enable_tts = false, ttsOptions = {}) {
   // console.log("showStartInstructions called");
    let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
     });

     let currency_unit_per_pump = .01;

     const stimulus = `
         <div class="instructions-container">
         <p>In this task, you will inflate a balloon to earn money.</p>
         <p>Click <strong>${trial_text.pump_button}</strong> to inflate the balloon and earn <strong>${USDollar.format(.01*currency_unit_per_pump)}</strong> per pump.</p>
         <p>Click <strong>${trial_text.collect_button}</strong> to save your money and end the round.</p>
         <p>If the balloon pops, you lose the money for that round!</p>
          <p>Click below to start the task.</p>
         </div>
       `;

  const instructions = {
    type: HtmlButtonResponsePlugin,
    
     stimulus: () => {
       return stimulus;
     },
    choices: [trial_text.start_button],
    button_html: (choice: string) => `<button class="jspsych-btn continue-button">${choice}</button>`,
    on_load: function() {
      if (enable_tts) {
        const instructionsContent = document.querySelector('.instructions-container');
        if (instructionsContent) {
          const pageText = extractTextFromHtml(instructionsContent.innerHTML);
          if (pageText.trim()) {
            speakText(pageText, ttsOptions);
          }
        }
      }
    },
    on_finish: function(data: any) {
      stopAllSpeech();
      data.task = 'bart';
      data.phase = 'instructions';
    }
  }
  return instructions;
   }

      //generate block break screen
   function showBlockBreak(jsPsych: JsPsych, currentBlock: number, totalBlocks: number, enable_tts = false, ttsOptions = {}) {
   let USDollar = new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD'
     });

 const instructions = {
   type: HtmlButtonResponsePlugin,
   
    stimulus: () => {
      // Calculate earnings dynamically when stimulus is displayed
      const data = jsPsych.data.get().filter({ task: 'bart' });
      const totalPoints = data.filter({ exploded: false, cashed_out: true }).select('pump_count').sum();
      
      return `<div class="instructions-container">
      <p>${trial_text.block_complete_message} ${currentBlock} of ${totalBlocks}.</p>
      <p>${trial_text.current_earnings_message} <strong>${USDollar.format(totalPoints * 0.01)}</strong></p>
      <p>${trial_text.take_break_message}</p>
      </div>`;
    },
   choices: [trial_text.continue_button],
   button_html: (choice: string) => `<button class="jspsych-btn continue-button">${choice}</button>`,
   on_load: function() {
     if (enable_tts) {
       const instructionsContent = document.querySelector('.instructions-container');
       if (instructionsContent) {
         const pageText = extractTextFromHtml(instructionsContent.innerHTML);
         if (pageText.trim()) {
           speakText(pageText, ttsOptions);
         }
       }
     }
   },
   on_finish: function(data: any) {
     stopAllSpeech();
     data.task = 'bart';
     data.phase = 'block-break';
   }
 }
 return instructions;
  }

      //generate end results
   function showEndResults(jsPsych: JsPsych, enable_tts = false, ttsOptions = {}) {

    let USDollar = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
      });
    
   // console.log("showEndResults called");
       const data = jsPsych.data.get().filter({ task: 'bart' });
       const totalPoints = data.filter({ exploded: false, cashed_out: true }).select('pump_count').sum();

     const stimulus = 
     `<div class="instructions-container">
      <p>${trial_text.final_earnings_message} <strong>${USDollar.format(totalPoints * 0.01)}</strong>!</p>
      <p>${trial_text.thanks_message}</p>
      </div>`;

  const instructions = {
    type: HtmlButtonResponsePlugin,
    
     stimulus: () => {
       return stimulus;
     },
    choices: [trial_text.finish_button],
    button_html: (choice: string) => `<button class="jspsych-btn continue-button">${choice}</button>`,
    on_load: function() {
      if (enable_tts) {
        const instructionsContent = document.querySelector('.instructions-container');
        if (instructionsContent) {
          const pageText = extractTextFromHtml(instructionsContent.innerHTML);
          if (pageText.trim()) {
            speakText(pageText, ttsOptions);
          }
        }
      }
    },
    on_finish: function(data: any) {
      stopAllSpeech();
      data.task = 'bart';
      data.phase = 'end-results';
    }
  }
  return instructions;
   }



function createTrialTimeline(jsPsych: JsPsych, max_pumps: number, min_pumps: number, currency_unit_per_pump: number, trial_timeout?: number, enable_timeout?: boolean) {
    
// const explosion_range = max_pumps - min_pumps;
//       //const explosion_point = Math.floor(Math.random() * explosion_range) + MIN_PUMPS;
//     const explosion_point = 10; // fixed explosion point for testing
//      let pump_count = 0;
//      let balloon_popped = false;
//      let cashed_out = false;


    let pump_count: number;
    let balloon_popped: boolean;
    let cashed_out: boolean;
    let timed_out: boolean;
    let explosion_point: number;

     let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
     });

    
    const pump_loop = {
       timeline: [{
         type: HtmlButtonResponsePlugin,
         stimulus: () => {
           const style = getBalloonStyle(pump_count);
           return `
             <div class="trial-container">
               <div class="bart-container">
                 <div class="balloon-area">
                   <img src="images/transparent_balloon.png" style="${style}" />
                 </div>
               </div>
             </div>
           `;
         },
         on_load: () => {
           // Remove old earnings-text if any
           const oldEarnings = document.querySelector('.earnings-text');
           if (oldEarnings) oldEarnings.remove();

           const earningsText = document.createElement('div');
           earningsText.className = 'earnings-text';
             earningsText.innerHTML = `${trial_text.possible_earnings_message} <strong>${USDollar.format(pump_count * currency_unit_per_pump * 0.01)}</strong>`;

           const content = document.querySelector('.jspsych-content');
           if (content) {
             content.appendChild(earningsText);
           }
         },
         choices: [trial_text.pump_button, trial_text.collect_button],
         trial_duration: enable_timeout ? trial_timeout : null,
         button_html: (choice: string) => {
              if (choice === trial_text.pump_button) {
                 return `<button class="jspsych-btn continue-button">${choice}</button>`;
              } else {
                 return `<button class="jspsych-btn continue-button">${choice}</button>`;
              }
         },
         on_finish: (data: any) => {
           if (data.response === 0) {
             pump_count++;
             if (pump_count >= explosion_point) {
               balloon_popped = true;
             }
           } else if (data.response === 1) {
             cashed_out = true;
           } else if (data.response === null && enable_timeout) {
             // Timeout occurred - auto collect
             cashed_out = true;
             timed_out = true;
           }
         }
       }],
       loop_function: () => !balloon_popped && !cashed_out
     };

               const outcome = {
       type: HtmlButtonResponsePlugin,
       stimulus: () => {
         const style = getBalloonStyle(pump_count);
         if (balloon_popped) {
           return `
<div class="trial-container">
                <div class="bart-container">
               <div class="balloon-area">
                 <img src="images/transparent_popped_balloon.png" style="${style}" />
               </div>
             </div>
               <div class="task-instructions">
                 <p><strong>POP!</strong> ${trial_text.balloon_popped_message}</p>
                 <p>${trial_text.total_earnings_message} <strong>${USDollar.format(.01* jsPsych.data.get().filter({ task: 'bart', exploded: false, cashed_out: true }).select('pump_count').sum())}</strong></p>
               </div>
             </div>
           `;
         } else {
           const total_points = pump_count + jsPsych.data.get().filter({ task: 'bart', exploded: false, cashed_out: true }).select('pump_count').sum();
           const total_money = total_points * currency_unit_per_pump * 0.01;
           
           const timeoutMessage = timed_out ? `<p><em>${trial_text.timeout_message}</em></p>` : '';

           return `
           <div class="trial-container">
             <div class="task-instructions">
             <p>${trial_text.collected_message} <strong>${USDollar.format(.01*pump_count)}</strong> this round.</p>
             ${timeoutMessage}
             <p>${trial_text.total_earnings_message} <strong>${USDollar.format(total_money)}</strong></p>
             </div>
           </div>
           `;
         }
       },
       choices: [trial_text.continue_button],
       button_html: (choice: string) => `<button class="jspsych-btn continue-button">${choice}</button>`,
       on_finish: (data: any) => {
         data.task = 'bart';
         data.phase = 'trial';
         //data.trial_num = trial + 1;
         data.pump_count = pump_count;
         data.exploded = balloon_popped;
         data.cashed_out = cashed_out;
       }
     };

    const singleTrial = {
        timeline: [pump_loop, outcome],
        on_timeline_start: () => {
      pump_count = 0;
      balloon_popped = false;
      cashed_out = false;
      timed_out = false;
      explosion_point = Math.floor(Math.random() * (max_pumps - min_pumps)) + min_pumps;
    }
        
    };
    return singleTrial;
}

export function createTimeline(jsPsych:JsPsych, { 
    max_pumps = 20,
    min_pumps = 1,
    currency_unit_per_pump = 1, //eg 1 cent per pump
    num_blocks = 3, // number of blocks in the experiment
    trials_per_block = 10, // number of trials per block
    trial_timeout = 15000, // timeout per trial in milliseconds (15 seconds default)
    enable_timeout = true, // whether to enable auto timeout
    // ===== TEXT-TO-SPEECH CONFIGURATION =====
    enable_tts = true, // Enable text-to-speech functionality
    tts_method = 'google', // Preferred TTS method: 'google', 'system'
    tts_rate = 1.0, // Speech rate (0.1 to 10)
    tts_pitch = 1.0, // Speech pitch (0 to 2)
    tts_volume = 1.0, // Speech volume (0 to 1)
    tts_lang = 'en-US', // Language code for TTS

} : {
    max_pumps?: number,
    min_pumps?: number,
    currency_unit_per_pump?: number, // eg 1 cent per pump
    num_blocks?: number, // number of blocks in the experiment
    trials_per_block?: number, // number of trials per block
    trial_timeout?: number, // timeout per trial in milliseconds
    enable_timeout?: boolean, // whether to enable auto timeout
    // TTS Configuration
    enable_tts?: boolean, // Enable text-to-speech functionality
    tts_method?: 'google' | 'system', // Preferred TTS method (default: 'google')
    tts_rate?: number, // Speech rate (0.1 to 10, default: 1.0)
    tts_pitch?: number, // Speech pitch (0 to 2, default: 1.0)
    tts_volume?: number, // Speech volume (0 to 1, default: 1.0)
    tts_lang?: string, // Language code for TTS
} = {})
{ 
    //jsPsych = jsPsych;

    // Create TTS options object
    const ttsOptions = {
        method: tts_method,
        rate: tts_rate,
        pitch: tts_pitch,
        volume: tts_volume,
        lang: tts_lang
    };

    const trial = createTrialTimeline(jsPsych, max_pumps, min_pumps, currency_unit_per_pump, trial_timeout, enable_timeout);
    
    // Create block structure
    const blocks = [];
    for (let block = 1; block <= num_blocks; block++) {
        // Add trials for this block
        const blockTimeline = {
            timeline: [trial],
            repetitions: trials_per_block,
        };
        blocks.push(blockTimeline);
        
        // Add break screen between blocks (but not after the last block)
        if (block < num_blocks) {
            const blockBreak = showBlockBreak(jsPsych, block, num_blocks, enable_tts, ttsOptions);
            blocks.push(blockBreak);
        }
    }
    
    const bart_timeline = {
        timeline: blocks
    }
     return bart_timeline;;

};
export const timelineUnits = {
    createTrialTimeline
}

export const utils = {
    showStartInstructions,
    showBlockBreak,
    showEndResults,
    createInstructions
}