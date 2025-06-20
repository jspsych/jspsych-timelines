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

interface PictureVocabConfig {
  practiceItems: {
    word: string; 
    images: string[]; // Array of SVG strings (any number)
    correctIndex: number; // Which image is correct (0-based index)
  }[]; 
  liveItems: {
    word: string;
    images: string[]; // Array of SVG strings (any number)
    correctIndex: number; // Which image is correct (0-based index)
  }[];}


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


export function createTimeline(jsPsych: JsPsych, config: PictureVocabConfig, options : {
        shuffleTrials?: boolean;
        shuffleImageChoices?: boolean;
    } = {}
): any[] {

  const welcomeScreen = {
    type: htmlButtonResponse,
    stimulus: `<p>${englishText.welcome_message}</p>`,
    choices: [englishText.begin_button]
  };

  // Instructions screen with TTS
  const instructions = {
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
  };


function makePracticeTrial(word: string, images: string[], correctIndex: number) {
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
          // Clean approach - just add classes, let CSS handle the layout
          const btnGroup = document.querySelector('.jspsych-html-button-response-btngroup') as HTMLElement;
          if (btnGroup) {
            btnGroup.classList.add('image-button-group');
            
            const buttons = btnGroup.querySelectorAll('.jspsych-btn');
            buttons.forEach(button => {
              button.classList.add('responsive-image-btn');
            });
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



  // Live trial factory
function makeLiveTrial(word: string, images: string[], correctIndex: number) {
  return {
    type: htmlButtonResponse,
    stimulus: `<p style="text-align: center; margin-bottom: 20px; font-size: 18px;">${englishText.live_instruction.replace('{word}', `<strong>${word}</strong>`)}</p>`,
    choices: images, // array of SVG strings
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
      // Clean approach - just add classes, let CSS handle the layout
      const btnGroup = document.querySelector('.jspsych-html-button-response-btngroup') as HTMLElement;
      if (btnGroup) {
        btnGroup.classList.add('image-button-group');
        
        const buttons = btnGroup.querySelectorAll('.jspsych-btn');
        buttons.forEach(button => {
          button.classList.add('responsive-image-btn');
        });
      }
    },
    on_finish: (data: any) => {
      data.correct = data.response === correctIndex;
    }
  };
}

  // Transition to live items screen
  const transition = {
    type: htmlButtonResponse,
    stimulus: `
      <p>${englishText.transition_message}</p>
      <p>${englishText.transition_reminder}</p>
      <p>${englishText.transition_action}</p>
      <p>${englishText.transition_ready}</p>
    `,
    choices: [englishText.start_button],
  };

  // Guess correct index if not manually labeled
  function autoCorrectIndex(word: string, images: string[]): number {
    const wordLower = word.toLowerCase();
    const idx = images.findIndex(svg => svg.toLowerCase().includes(wordLower));
    if (idx === -1) console.warn(`No match for '${word}'`);
    return idx >= 0 ? idx : 0;
  }


    const practiceItems = options.shuffleTrials
    ? jsPsych.randomization.shuffle(config.practiceItems)
    : config.practiceItems;

  const liveItems = options.shuffleTrials
    ? jsPsych.randomization.shuffle(config.liveItems)
    : config.liveItems;


// Practice items 
// const practiceTimeline = config.practiceItems.map(item => {
//   const correct = item.correctIndex !== undefined ? item.correctIndex : autoCorrectIndex(item.word, item.images);
//   return makePracticeTrial(item.word, item.images, correct);
// });

// Create practice trials
  const practiceTimeline = practiceItems.map(item => {
    let images = [...item.images];
    let correctIndex = item.correctIndex;
    
    // Resolve images first to get actual SVG strings
    const resolvedImages = resolveImages(images, item.word);
    
    // If images were resolved from fallback, update correctIndex
    if (images.length === 0 || !images.every(img => img && img.trim().length > 0)) {
      correctIndex = autoCorrectIndex(item.word, resolvedImages);
    }

    if (options.shuffleImageChoices) {
      const originalImage = resolvedImages[correctIndex];
      const shuffledImages = jsPsych.randomization.shuffle(resolvedImages);
      correctIndex = shuffledImages.findIndex(img => img === originalImage);
      // Pass the shuffled resolved images as the original images array for the function
      images = shuffledImages;
    } else {
      images = resolvedImages;
    }

    return makePracticeTrial(item.word, images, correctIndex);
  });

// // Live items˝
// const liveTimeline = config.liveItems.map(item => {
//   const correct = item.correctIndex !== undefined ? item.correctIndex : autoCorrectIndex(item.word, item.images);
//   return makeLiveTrial(item.word, item.images, correct);
// });

// Create live trials
  const liveTimeline = liveItems.map(item => {
    let images = [...item.images];
    let correctIndex = item.correctIndex;
    
    // Resolve images first to get actual SVG strings
    const resolvedImages = resolveImages(images, item.word);
    
    // If images were resolved from fallback, update correctIndex
    if (images.length === 0 || !images.every(img => img && img.trim().length > 0)) {
      correctIndex = autoCorrectIndex(item.word, resolvedImages);
    }

    if (options.shuffleImageChoices) {
      const originalImage = resolvedImages[correctIndex];
      const shuffledImages = jsPsych.randomization.shuffle(resolvedImages);
      correctIndex = shuffledImages.findIndex(img => img === originalImage);
      // Pass the shuffled resolved images as the original images array for the function
      images = shuffledImages;
    } else {
      images = resolvedImages;
    }

    return makeLiveTrial(item.word, images, correctIndex);
  });

  const thankYouScreen = {
    type: htmlButtonResponse,
    stimulus: `<p>${englishText.thank_you}</p>`,
    choices: [englishText.finish_button]
  }

  return [welcomeScreen, instructions, ...practiceTimeline, transition, ...liveTimeline, thankYouScreen];
}

export const timelineUnits = {}

export const utils = {}

export { images }