import { JsPsych } from "jspsych";
import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import ImageButtonResponsePlugin from "@jspsych/plugin-image-button-response";

import PreloadPlugin from "@jspsych/plugin-preload";
import { englishText } from "./text";
import { images } from "./images";

// Helper function to resolve images - use provided images or fallback to images.ts
function resolveImages(providedImages: string[], word?: string): string[] {
  // If valid images are provided, use them
  if (providedImages && providedImages.length > 0 && providedImages.every(img => img && img.trim().length > 0)) {
    return providedImages;
  }
  
  // Otherwise, try to find images from images.ts based on the word
  if (word) {
    const wordLower = word.toLowerCase();
    const matchingKeys = Object.keys(images).filter(key => 
      key.toLowerCase().includes(wordLower) || wordLower.includes(key.toLowerCase().replace('svg', ''))
    );
    
    if (matchingKeys.length > 0) {
      return matchingKeys.map(key => images[key as keyof typeof images]);
    }
  }
  
  // Final fallback - use first few images from images.ts
  const imageKeys = Object.keys(images);
  return imageKeys.slice(0, Math.min(4, imageKeys.length)).map(key => images[key as keyof typeof images]);
}

// SVG validation function
function validateSvg(svgString: string): boolean {
  if (!svgString || typeof svgString !== 'string') {
    return false;
  }
  
  const trimmed = svgString.trim();
  
  // Check if it's a complete SVG element
  if (trimmed.startsWith('<svg') && trimmed.endsWith('</svg>')) {
    // Basic validation - check for balanced svg tags
    const openSvgCount = (trimmed.match(/<svg[^>]*>/g) || []).length;
    const closeSvgCount = (trimmed.match(/<\/svg>/g) || []).length;
    return openSvgCount === closeSvgCount && openSvgCount === 1;
  }
  
  // Check if it's SVG content that can be wrapped
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    // Basic check for valid XML-like structure
    try {
      // Simple tag balance check
      const openTags = (trimmed.match(/<[^\/][^>]*>/g) || []).length;
      const closeTags = (trimmed.match(/<\/[^>]*>/g) || []).length;
      const selfClosingTags = (trimmed.match(/<[^>]*\/>/g) || []).length;
      
      // For self-closing tags, each counts as both open and close
      return openTags === closeTags + selfClosingTags;
    } catch (error) {
      return false;
    }
  }
  
  return false;
}

// Enhanced image resolution with validation
function resolveAndValidateImages(providedImages: string[], word?: string): string[] {
  const validImages: string[] = [];
  const invalidImages: string[] = [];
  
  // Validate provided images
  if (providedImages && providedImages.length > 0) {
    providedImages.forEach((img, index) => {
      if (img && img.trim().length > 0 && validateSvg(img)) {
        validImages.push(img);
      } else {
        invalidImages.push(`Image ${index}: ${img ? 'Invalid SVG format' : 'Empty/null image'}`);
      }
    });
    
    // Log validation errors
    if (invalidImages.length > 0) {
      console.warn(`Picture Vocab Timeline - Invalid images detected for word "${word || 'unknown'}":`, invalidImages);
    }
    
    // If we have enough valid images, use them
    if (validImages.length > 0) {
      // If we don't have enough valid images, fill with fallbacks
      if (validImages.length < 2) {
        console.warn(`Picture Vocab Timeline - Only ${validImages.length} valid image(s) for word "${word || 'unknown'}". Adding fallback images.`);
        const fallbackImages = getFallbackImages(word, 4 - validImages.length);
        return [...validImages, ...fallbackImages];
      }
      return validImages;
    }
  }
  
  // Fall back to automatic resolution if no valid images
  if (invalidImages.length > 0) {
    console.warn(`Picture Vocab Timeline - No valid images provided for word "${word || 'unknown'}". Using fallback images.`);
  }
  
  return getFallbackImages(word, 4);
}


// Global TTS enabled flag and queue
let enabledGlobal = false;
let userActivated = false;
let speechQueue: Array<{text: string, onComplete?: () => void}> = [];
let isSpeaking = false;

// Helper function to cancel all speech synthesis
function cancelAllSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  speechQueue = [];
  isSpeaking = false;
}

// Process the next item in the speech queue
function processNextSpeech(): void {
  console.log('TTS: processNextSpeech called, isSpeaking:', isSpeaking, 'queue length:', speechQueue.length);
  if (isSpeaking || speechQueue.length === 0) {
    return;
  }

  const { text, onComplete } = speechQueue.shift()!;
  isSpeaking = true;

  console.log('TTS: Now speaking from queue:', text);
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.8;
  utterance.pitch = 1.0;
  utterance.volume = 0.9;
  
  utterance.onstart = () => {
    console.log('TTS: Successfully started speaking:', text);
  };
  
  utterance.onend = () => {
    console.log('TTS: Finished speaking:', text);
    isSpeaking = false;
    if (onComplete) {
      onComplete();
    }
    // Process next item in queue after a short delay
    setTimeout(processNextSpeech, 300);
  };
  
  utterance.onerror = (event) => {
    console.warn('TTS: Speech error:', event.error, 'for text:', text);
    isSpeaking = false;
    if (onComplete) {
      onComplete();
    }
    // Process next item in queue after a short delay
    setTimeout(processNextSpeech, 300);
  };
  
  // Force reload voices and use a specific voice
  window.speechSynthesis.cancel(); // Clear any stuck speech
  
  const voices = window.speechSynthesis.getVoices();
  console.log('TTS: Available voices:', voices.length);
  
  // Try to use a system voice explicitly
  const systemVoice = voices.find(v => v.localService && v.lang.startsWith('en')) || voices[0];
  if (systemVoice) {
    utterance.voice = systemVoice;
    console.log('TTS: Using system voice:', systemVoice.name);
  }
  
  // Try to speak
  console.log('TTS: Attempting to speak:', text);
  console.log('TTS: speechSynthesis.speaking:', window.speechSynthesis.speaking);
  console.log('TTS: speechSynthesis.pending:', window.speechSynthesis.pending);
  
  try {
    window.speechSynthesis.speak(utterance);
    console.log('TTS: speak() called successfully');
    
    // Check status after a short delay
    setTimeout(() => {
      console.log('TTS: After 100ms - speaking:', window.speechSynthesis.speaking, 'pending:', window.speechSynthesis.pending);
    }, 100);
  } catch (error) {
    console.error('TTS: Error calling speak():', error);
  }
}

// Text-to-speech function with queue system
function speakText(text: string, delay: number = 1500, onComplete?: () => void): void {
  if (!enabledGlobal || !userActivated) {
    console.log('TTS: Disabled or no user activation yet');
    if (onComplete) {
      setTimeout(onComplete, delay);
    }
    return;
  }
  
  if (!window.speechSynthesis) {
    console.log('TTS: Speech synthesis not available');
    if (onComplete) {
      setTimeout(onComplete, delay);
    }
    return;
  }
  
  // Clean HTML tags from text for TTS
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (cleanText.length === 0) {
    console.log('TTS: No text to speak after cleaning');
    if (onComplete) {
      setTimeout(onComplete, delay);
    }
    return;
  }

  console.log('TTS: Adding to queue after delay:', cleanText);
  console.log('TTS: Current queue length:', speechQueue.length, 'isSpeaking:', isSpeaking);
  
  // Add to queue with delay
  setTimeout(() => {
    speechQueue.push({ text: cleanText, onComplete });
    console.log('TTS: Added to queue, new length:', speechQueue.length);
    processNextSpeech();
  }, delay);
}

// Helper function to get fallback images
function getFallbackImages(word?: string, count: number = 4): string[] {
  if (word) {
    const wordLower = word.toLowerCase();
    const matchingKeys = Object.keys(images).filter(key => 
      key.toLowerCase().includes(wordLower) || wordLower.includes(key.toLowerCase().replace('svg', ''))
    );
    
    if (matchingKeys.length > 0) {
      const matchedImages = matchingKeys.map(key => images[key as keyof typeof images]);
      if (matchedImages.length >= count) {
        return matchedImages.slice(0, count);
      }
      // If not enough matched images, fill with random ones
      const remainingKeys = Object.keys(images).filter(key => !matchingKeys.includes(key));
      const additionalImages = remainingKeys.slice(0, count - matchedImages.length)
        .map(key => images[key as keyof typeof images]);
      return [...matchedImages, ...additionalImages];
    }
  }
  
  // Final fallback - use first few images from images.ts
  const imageKeys = Object.keys(images);
  return imageKeys.slice(0, Math.min(count, imageKeys.length)).map(key => images[key as keyof typeof images]);
}

interface PictureVocabItem {
  word: string;
  images: string[]; // Array of SVG strings (any number)
  correctIndex: number; // Which image is correct (0-based index)
}

interface PictureVocabConfig {
  practiceItems: PictureVocabItem[];
  liveItems: PictureVocabItem[];
}

interface PictureVocabOptions {
  practiceItems?: PictureVocabItem[];
  liveItems?: PictureVocabItem[];
  shuffleTrials?: boolean;
  shuffleImageChoices?: boolean;
  text_to_speech_enabled?: boolean;
}


function createSvgImageButton(choice: string, choice_index: number) {
  if (choice.trim().startsWith('<svg')) {
    return `<button class="jspsych-btn responsive-image-btn" style="
      margin: 8px; 
      background-color: #f0f0f0;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 140px;
      height: 140px;
      flex: 0 0 140px;
    " onmouseover="this.style.backgroundColor='#e0e0e0'; this.style.borderColor='#999';" onmouseout="this.style.backgroundColor='#f0f0f0'; this.style.borderColor='#ddd';">
      <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow: hidden;">
        <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
          ${choice}
        </div>
      </div>
    </button>`;
  }

  const commonViewBoxes = [
    "0 0 24 24",
    "0 0 100 100",
    "0 0 256 256",
    "0 0 512 512",
    "0 0 1024 1024"
  ];

  const viewBox = commonViewBoxes[1]; // 0 0 100 100

  return `<button class="jspsych-btn responsive-image-btn" style="
    margin: 8px; 
    background-color: #f0f0f0;
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 140px;
    height: 140px;
    flex: 0 0 140px;
  " onmouseover="this.style.backgroundColor='#e0e0e0'; this.style.borderColor='#999';" onmouseout="this.style.backgroundColor='#f0f0f0'; this.style.borderColor='#ddd';">
    <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
      <svg width="80" height="80" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%; max-height:100%; fill: #333; stroke: #333; stroke-width: 1;">
        ${choice}
      </svg>
    </div>
  </button>`;
}


// Timeline Unit Factories
export function createWelcomeScreen() {
  return {
    type: htmlButtonResponse,
    stimulus: `<p>${englishText.welcome_message}</p>`,
    choices: [englishText.begin_button],
    on_finish: () => {
      // User has clicked the begin button - now TTS is allowed
      userActivated = true;
      console.log('TTS: User activation established, TTS now enabled');
      
      // Test basic TTS immediately
      if (enabledGlobal && window.speechSynthesis) {
        console.log('TTS: Testing basic speech synthesis...');
        const testUtterance = new SpeechSynthesisUtterance('test');
        testUtterance.onstart = () => console.log('TTS: Basic test started');
        testUtterance.onend = () => console.log('TTS: Basic test ended');
        testUtterance.onerror = (e) => console.log('TTS: Basic test error:', e.error);
        window.speechSynthesis.speak(testUtterance);
      }
    }
  };
}

export function createInstructionsScreen() {
  return {
    type: htmlButtonResponse,
    stimulus: `
      <p>${englishText.instructions_hearing}</p>
      <p>${englishText.instructions_tap}</p>
      <p>${englishText.instructions_difficulty}</p>
      <p>${englishText.instructions_replay}</p>
      <p>${englishText.instructions_back}</p>
      <p>${englishText.instructions_ready}</p>
    `,
    choices: [englishText.next_button],
    on_finish: () => {
      // Ensure user activation is set
      userActivated = true;
      console.log('TTS: User activation confirmed on instructions');
    }
  };
}

export function createTransitionScreen() {
  return {
    type: htmlButtonResponse,
    stimulus: `
      <p>${englishText.transition_message}</p>
      <p>${englishText.transition_reminder}</p>
      <p>${englishText.transition_action}</p>
      <p>${englishText.transition_ready}</p>
    `,
    choices: [englishText.start_button]
  };
}

export function createThankYouScreen() {
  return {
    type: htmlButtonResponse,
    stimulus: `<p>${englishText.thank_you}</p>`,
    choices: [englishText.finish_button]
  };
}

export function createPracticeTrial(jsPsych: JsPsych, word: string, images: string[], correctIndex: number, enableTTS: boolean = false) {
  let attempts = 0;

  return {
    timeline: [
      {
        type: htmlButtonResponse,
        stimulus: `<p>${englishText.practice_intro.replace('{word}', word)}</p>`,
        choices: images,
        button_html: createSvgImageButton,
        data: { trial_id: 'practice-choice' },
        on_load: () => {
          const btnGroup = document.querySelector('.jspsych-html-button-response-btngroup') as HTMLElement;
          if (btnGroup) {
            btnGroup.classList.add('image-button-group');
            
            const buttons = btnGroup.querySelectorAll('.jspsych-btn');
            buttons.forEach(button => {
              button.classList.add('responsive-image-btn');
            });
          }
          
          // Speak the word automatically if TTS is enabled
          if (enableTTS) {
            console.log('TTS: Practice trial loaded, will speak word:', word);
            speakText(word, 2000); // Wait 2 seconds for page to load and avoid conflicts
          }
        },
        on_finish: (data: any) => {
          attempts++;
          data.correct = data.response === correctIndex;
        }
      },
      {
        type: htmlButtonResponse,
        stimulus: () => {
          const lastChoiceTrial = jsPsych.data.get().filter({ trial_id: 'practice-choice' }).last(1).values()[0];
          return lastChoiceTrial && lastChoiceTrial.correct
            ? `<p>${englishText.practice_correct.replace('{word}', word)}</p>`
            : `<p>${englishText.practice_incorrect.replace('{word}', word)}</p>`;
        },
        choices: () => {
          const lastChoiceTrial = jsPsych.data.get().filter({ trial_id: 'practice-choice' }).last(1).values()[0];
          return lastChoiceTrial && lastChoiceTrial.correct ? [englishText.next_button] : [englishText.try_again_button];
        }
      }
    ],
    loop_function: () => {
      const lastChoiceTrial = jsPsych.data.get().filter({ trial_id: 'practice-choice' }).last(1).values()[0];
      return attempts < 3 && lastChoiceTrial && !lastChoiceTrial.correct;
    }
  };
}

export function createLiveTrial(word: string, images: string[], correctIndex: number, enableTTS: boolean = false) {
  return {
    type: htmlButtonResponse,
    stimulus: `<p style="text-align: center; margin-bottom: 20px; font-size: 18px;">${englishText.live_instruction.replace('{word}', `<strong>${word}</strong>`)}</p>`,
    choices: images,
    button_html: (choice: string, index: number) => {
      return `
        <button class="jspsych-btn responsive-image-btn" style="
          background-color: #f0f0f0;
          border: 2px solid #ddd;
          border-radius: 8px;
          padding: 10px;
          margin: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 140px;
          height: 140px;
          flex: 0 0 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        " onmouseover="this.style.backgroundColor='#e0e0e0'; this.style.borderColor='#999';" onmouseout="this.style.backgroundColor='#f0f0f0'; this.style.borderColor='#ddd';">
          <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
            ${choice}
          </div>
        </button>`;
    },
    on_load: () => {
      const btnGroup = document.querySelector('.jspsych-html-button-response-btngroup') as HTMLElement;
      if (btnGroup) {
        btnGroup.classList.add('image-button-group');
        
        const buttons = btnGroup.querySelectorAll('.jspsych-btn');
        buttons.forEach(button => {
          button.classList.add('responsive-image-btn');
        });
      }
      
      // Speak the word automatically if TTS is enabled
      if (enableTTS) {
        console.log('TTS: Live trial loaded, will speak word:', word);
        speakText(word, 2000); // Wait 2 seconds for page to load and avoid conflicts
      }
    },
    on_finish: (data: any) => {
      data.correct = data.response === correctIndex;
    }
  };
}

export function createTimeline(jsPsych: JsPsych, config?: PictureVocabConfig, options: PictureVocabOptions = {}): any[] {
  // Handle both old and new parameter patterns for backward compatibility
  let finalConfig: PictureVocabConfig;
  let finalOptions: PictureVocabOptions;

  if (config && ('practiceItems' in config || 'liveItems' in config)) {
    // New pattern: createTimeline(jsPsych, config, options)
    finalConfig = config;
    finalOptions = options;
  } else {
    // Old pattern: createTimeline(jsPsych, options) where first param contains everything
    finalOptions = (config as PictureVocabOptions) || {};
    finalConfig = {
      practiceItems: finalOptions.practiceItems || [],
      liveItems: finalOptions.liveItems || []
    };
  }

  // Default configuration based on index.html example
  const defaultConfig: PictureVocabConfig = {
    practiceItems: [
      {
        word: "banana",
        images: [images.bananaSVG, images.appleSVG, images.orangeSVG, images.grapeSVG],
        correctIndex: 0
      },
      {
        word: "spoon",
        images: [images.forkSVG, images.spoonSVG, images.knifeSVG, images.plateSVG],
        correctIndex: 1
      }
    ],
    liveItems: [
      {
        word: "dog",
        images: [images.catSVG, images.dogSVG, images.fishSVG, images.birdSVG],
        correctIndex: 1
      },
      {
        word: "apple",
        images: [images.appleSVG, images.orangeSVG, images.bananaSVG, images.grapeSVG],
        correctIndex: 0
      }
    ]
  };

  // Merge provided config with defaults
  const mergedConfig: PictureVocabConfig = {
    practiceItems: finalConfig.practiceItems.length > 0 ? finalConfig.practiceItems : defaultConfig.practiceItems,
    liveItems: finalConfig.liveItems.length > 0 ? finalConfig.liveItems : defaultConfig.liveItems
  };

  // Set global TTS enabled flag based on options
  enabledGlobal = finalOptions.text_to_speech_enabled || true;

  const welcomeScreen = createWelcomeScreen();

  const instructions = createInstructionsScreen();



  const transition = createTransitionScreen();

  // Guess correct index if not manually labeled
  function autoCorrectIndex(word: string, images: string[]): number {
    const wordLower = word.toLowerCase();
    const idx = images.findIndex(svg => svg.toLowerCase().includes(wordLower));
    if (idx === -1) console.warn(`No match for '${word}'`);
    return idx >= 0 ? idx : 0;
  }


    const practiceItems = finalOptions.shuffleTrials
    ? jsPsych.randomization.shuffle(mergedConfig.practiceItems)
    : mergedConfig.practiceItems;

  const liveItems = finalOptions.shuffleTrials
    ? jsPsych.randomization.shuffle(mergedConfig.liveItems)
    : mergedConfig.liveItems;


// Practice items 
// const practiceTimeline = config.practiceItems.map(item => {
//   const correct = item.correctIndex !== undefined ? item.correctIndex : autoCorrectIndex(item.word, item.images);
//   return makePracticeTrial(item.word, item.images, correct);
// });

// Create practice trials
  const practiceTimeline = practiceItems.map(item => {
    let images = [...item.images];
    let correctIndex = item.correctIndex;
    
    // Resolve and validate images first to get actual SVG strings
    const resolvedImages = resolveAndValidateImages(images, item.word);
    
    // If images were resolved from fallback, update correctIndex
    if (images.length === 0 || !images.every(img => img && img.trim().length > 0)) {
      correctIndex = autoCorrectIndex(item.word, resolvedImages);
    }

    if (finalOptions.shuffleImageChoices) {
      const originalImage = resolvedImages[correctIndex];
      const shuffledImages = jsPsych.randomization.shuffle(resolvedImages);
      correctIndex = shuffledImages.findIndex(img => img === originalImage);
      // Pass the shuffled resolved images as the original images array for the function
      images = shuffledImages;
    } else {
      images = resolvedImages;
    }

    return createPracticeTrial(jsPsych, item.word, images, correctIndex, finalOptions.text_to_speech_enabled || true);
  });


// Create live trials
  const liveTimeline = liveItems.map(item => {
    let images = [...item.images];
    let correctIndex = item.correctIndex;
    
    // Resolve and validate images first to get actual SVG strings
    const resolvedImages = resolveAndValidateImages(images, item.word);
    
    // If images were resolved from fallback, update correctIndex
    if (images.length === 0 || !images.every(img => img && img.trim().length > 0)) {
      correctIndex = autoCorrectIndex(item.word, resolvedImages);
    }

    if (finalOptions.shuffleImageChoices) {
      const originalImage = resolvedImages[correctIndex];
      const shuffledImages = jsPsych.randomization.shuffle(resolvedImages);
      correctIndex = shuffledImages.findIndex(img => img === originalImage);
      // Pass the shuffled resolved images as the original images array for the function
      images = shuffledImages;
    } else {
      images = resolvedImages;
    }

    return createLiveTrial(item.word, images, correctIndex, finalOptions.text_to_speech_enabled || true);
  });

  const thankYouScreen = createThankYouScreen();

  return [welcomeScreen, instructions, ...practiceTimeline, transition, ...liveTimeline, thankYouScreen];
}

export const timelineUnits = {
  createWelcomeScreen,
  createInstructionsScreen,
  createTransitionScreen,
  createThankYouScreen,
  createPracticeTrial,
  createLiveTrial
}


export const utils = {
  validateSvg,
  resolveAndValidateImages,
  getFallbackImages,
  speakText
}

export { images }