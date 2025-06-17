import { JsPsych } from "jspsych"

interface PatternComparisonConfig {
  numTrials?: number;
  stimulusDuration?: number;
  fixationDuration?: number;
  numPracticeTrials?: number;
  showFeedback?: boolean;
  patterns?: Array<{ left: string; right: string; correct_response: string }>;
  showPromptText?: boolean;
  promptText?: string;
  enableAudio?: boolean;
  useMobileButtons?: boolean;
  sameButtonText?: string;
  differentButtonText?: string;
  sameButtonKey?: string;
  differentButtonKey?: string;
}

// SVG patterns from SVG Repo styled with CSS
const svgShapes = [
  // Star
  `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 100px; height: 100px;">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>`,
  // Heart
  `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 100px; height: 100px;">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>`,
  // Diamond
  `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 100px; height: 100px;">
    <path d="M6,2L18,2L22,8L12,22L2,8L6,2M12.5,7H18.5L17,4H14L12.5,7M6.5,7H11.5L10,4H7L6.5,7M7.5,9L10.5,15.5L11.5,9H7.5M12.5,9L13.5,15.5L16.5,9H12.5M5.8,9L10,19L7.5,9H5.8M18.2,9L16.5,9L14,19L18.2,9Z"/>
  </svg>`,
  // Circle with pattern
  `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 100px; height: 100px;">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="8" cy="8" r="1.5"/>
    <circle cx="16" cy="8" r="1.5"/>
    <circle cx="8" cy="16" r="1.5"/>
    <circle cx="16" cy="16" r="1.5"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>`,
  // Flower
  `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 100px; height: 100px;">
    <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,5A3,3 0 0,1 22,8A3,3 0 0,1 19,11H13A3,3 0 0,1 10,8A3,3 0 0,1 13,5H19M5,13A3,3 0 0,1 8,16A3,3 0 0,1 5,19H11A3,3 0 0,1 14,16A3,3 0 0,1 11,13H5Z"/>
  </svg>`,
  // Triangle
  `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 100px; height: 100px;">
    <path d="M12,2L22,20H2L12,2M12,6L6,18H18L12,6Z"/>
  </svg>`,
  // Hexagon
  `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 100px; height: 100px;">
    <path d="M17.5,3.5L22,12L17.5,20.5H6.5L2,12L6.5,3.5H17.5Z"/>
  </svg>`,
  // Cross
  `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 100px; height: 100px;">
    <path d="M11,2V7H16V10H11V15H16V18H11V23H8V18H3V15H8V10H3V7H8V2H11Z"/>
  </svg>`
];

const colors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal  
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#FFB347', // Orange
  '#87CEEB', // Sky Blue
  '#F0A3FF', // Bright Pink
  '#0075DC'  // Bright Blue
];

// Text-to-speech utility
function speakText(text: string, enableAudio: boolean = false) {
  if (!enableAudio || !('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech
  speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.8;
  utterance.pitch = 1;
  utterance.volume = 0.8;
  speechSynthesis.speak(utterance);
}

function generateSVGPattern(shapeIndex?: number, colorIndex?: number) {
  const shape = shapeIndex !== undefined ? svgShapes[shapeIndex] : svgShapes[Math.floor(Math.random() * svgShapes.length)];
  const color = colorIndex !== undefined ? colors[colorIndex] : colors[Math.floor(Math.random() * colors.length)];
  return `<div style="color: ${color};">${shape}</div>`;
}

function generateDefaultPatterns() {
  const patterns = [];
  
  // Generate same patterns (same shape and color)
  for (let i = 0; i < 45; i++) {
    const shapeIndex = Math.floor(Math.random() * svgShapes.length);
    const colorIndex = Math.floor(Math.random() * colors.length);
    const pattern = generateSVGPattern(shapeIndex, colorIndex);
    
    patterns.push({
      left: pattern,
      right: pattern,
      correct_response: 's'
    });
  }
  
  // Generate different patterns
  for (let i = 0; i < 45; i++) {
    const leftShapeIndex = Math.floor(Math.random() * svgShapes.length);
    const leftColorIndex = Math.floor(Math.random() * colors.length);
    
    let rightShapeIndex, rightColorIndex;
    
    // Randomly decide if we change shape, color, or both
    const changeType = Math.random();
    if (changeType < 0.33) {
      // Change only shape
      rightShapeIndex = (leftShapeIndex + 1 + Math.floor(Math.random() * (svgShapes.length - 1))) % svgShapes.length;
      rightColorIndex = leftColorIndex;
    } else if (changeType < 0.66) {
      // Change only color
      rightShapeIndex = leftShapeIndex;
      rightColorIndex = (leftColorIndex + 1 + Math.floor(Math.random() * (colors.length - 1))) % colors.length;
    } else {
      // Change both shape and color
      rightShapeIndex = (leftShapeIndex + 1 + Math.floor(Math.random() * (svgShapes.length - 1))) % svgShapes.length;
      rightColorIndex = (leftColorIndex + 1 + Math.floor(Math.random() * (colors.length - 1))) % colors.length;
    }
    
    patterns.push({
      left: generateSVGPattern(leftShapeIndex, leftColorIndex),
      right: generateSVGPattern(rightShapeIndex, rightColorIndex),
      correct_response: 'd'
    });
  }
  
  return patterns;
}

export function createTimeline(jsPsych: JsPsych, config: PatternComparisonConfig = {}) {
  const {
    numTrials = 90,
    stimulusDuration = 30000,
    fixationDuration = 500,
    numPracticeTrials = 6,
    showFeedback = true,
    patterns = generateDefaultPatterns(),
    showPromptText = true,
    promptText = "Are these the same?",
    enableAudio = false,
    useMobileButtons = true,
    sameButtonText = "Yes",
    differentButtonText = "No",
    sameButtonKey = 's',
    differentButtonKey = 'd'
  } = config;

  const timeline = [];

  // Common CSS for mobile responsiveness
  const responsiveCSS = `
    <style>
      .pattern-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 20px;
      }
      
      @media (min-width: 768px) {
        .pattern-container {
          flex-direction: row;
          justify-content: center;
          gap: 60px;
        }
      }
      
      .pattern-box {
        border: 3px solid #333;
        padding: 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        min-width: 150px;
        min-height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .pattern-label {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 15px;
        text-align: center;
      }
      
      @media (min-width: 768px) {
        .pattern-label {
          font-size: 24px;
        }
      }
      
      .prompt-text {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin: 20px 0;
        text-align: center;
      }
      
      @media (min-width: 768px) {
        .prompt-text {
          font-size: 28px;
          margin: 30px 0;
        }
      }
      
      .button-container {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 30px;
        width: 100%;
        max-width: 400px;
      }
      
      @media (min-width: 768px) {
        .button-container {
          flex-direction: row;
          justify-content: center;
          gap: 30px;
          max-width: none;
        }
      }
      
      .response-button {
        background: #007bff;
        color: white;
        border: none;
        padding: 15px 30px;
        font-size: 18px;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        min-height: 60px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      .response-button:hover {
        background: #0056b3;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      }
      
      .response-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      .same-button {
        background: #28a745;
      }
      
      .same-button:hover {
        background: #1e7e34;
      }
      
      .different-button {
        background: #dc3545;
      }
      
      .different-button:hover {
        background: #c82333;
      }
      
      .instructions-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
        font-size: 16px;
        line-height: 1.5;
      }
      
      @media (min-width: 768px) {
        .instructions-container {
          font-size: 18px;
        }
      }
      
      .keyboard-instructions {
        display: ${useMobileButtons ? 'none' : 'block'};
      }
      
      .button-instructions {
        display: ${useMobileButtons ? 'block' : 'none'};
      }
    </style>
  `;

  // Instructions
  const instructionsText = `
    Pattern Comparison Test. In this test, you will see pairs of patterns displayed side by side. 
    Your task is to determine whether the two patterns are exactly the same or different. 
    Pay attention to both the shape and the color of the patterns.
  `;

  const instructions = {
    type: useMobileButtons ? 'html-button-response' : 'html-keyboard-response',
    stimulus: `
      ${responsiveCSS}
      <div class="instructions-container">
        <h1>Pattern Comparison Test</h1>
        <p>In this test, you will see pairs of patterns displayed side by side.</p>
        <p>Your task is to determine whether the two patterns are <strong>exactly the same</strong> or <strong>different</strong>.</p>
        <p>Pay attention to both the <strong>shape</strong> and the <strong>color</strong> of the patterns.</p>
        <br>
        <div style="font-size: 20px; background: #f0f0f0; padding: 20px; border-radius: 10px;">
          <div class="keyboard-instructions">
            <p><strong>Press '${sameButtonKey.toUpperCase()}'</strong> if the patterns are the SAME (identical shape AND color)</p>
            <p><strong>Press '${differentButtonKey.toUpperCase()}'</strong> if the patterns are DIFFERENT (different shape OR color)</p>
          </div>
          <div class="button-instructions">
            <p><strong>Press "${sameButtonText}"</strong> if the patterns are the SAME (identical shape AND color)</p>
            <p><strong>Press "${differentButtonText}"</strong> if the patterns are DIFFERENT (different shape OR color)</p>
          </div>
        </div>
        <br>
        <p>Please respond as quickly and accurately as possible.</p>
        <p style="margin-top: 30px;"><em>${useMobileButtons ? 'Tap "Continue" to start the practice trials' : 'Press any key to start the practice trials'}</em></p>
      </div>
    `,
    ...(useMobileButtons ? {
      choices: ['Continue'],
      button_html: '<button class="response-button" style="margin-top: 20px;">%choice%</button>'
    } : {
      choices: "ALL_KEYS"
    }),
    data: { task: 'pattern-comparison', phase: 'instructions' },
    on_start: function() {
      if (enableAudio) {
        setTimeout(() => speakText(instructionsText, enableAudio), 100);
      }
    }
  };

  // Practice instructions
  const practiceInstructionsText = `
    Practice Trials. Let's start with a few practice trials to get familiar with the task. 
    You will receive feedback after each practice trial.
  `;

  const practiceInstructions = {
    type: useMobileButtons ? 'html-button-response' : 'html-keyboard-response',
    stimulus: `
      ${responsiveCSS}
      <div class="instructions-container">
        <h2>Practice Trials</h2>
        <p>Let's start with a few practice trials to get familiar with the task.</p>
        <p>You will receive feedback after each practice trial.</p>
        <p style="background: #f0f0f0; padding: 15px; border-radius: 10px;">
          <span class="keyboard-instructions">Remember: Press <strong>'${sameButtonKey.toUpperCase()}'</strong> for SAME, <strong>'${differentButtonKey.toUpperCase()}'</strong> for DIFFERENT</span>
          <span class="button-instructions">Remember: Press <strong>"${sameButtonText}"</strong> for SAME, <strong>"${differentButtonText}"</strong> for DIFFERENT</span>
        </p>
        <p style="margin-top: 30px;"><em>${useMobileButtons ? 'Tap "Begin" to start' : 'Press any key to begin'}</em></p>
      </div>
    `,
    ...(useMobileButtons ? {
      choices: ['Begin'],
      button_html: '<button class="response-button" style="margin-top: 20px;">%choice%</button>'
    } : {
      choices: "ALL_KEYS"
    }),
    data: { task: 'pattern-comparison', phase: 'practice-instructions' },
    on_start: function() {
      if (enableAudio) {
        setTimeout(() => speakText(practiceInstructionsText, enableAudio), 100);
      }
    }
  };

  // Practice trial
  const practiceTrial = {
    type: useMobileButtons ? 'html-button-response' : 'html-keyboard-response',
    stimulus: jsPsych.timelineVariable('stimulus'),
    ...(useMobileButtons ? {
      choices: [sameButtonText, differentButtonText],
      button_html: (choice: string, choice_index: number) => {
        const buttonClass = choice_index === 0 ? 'same-button' : 'different-button';
        return `<button class="response-button ${buttonClass}">${choice}</button>`;
      }
    } : {
      choices: [sameButtonKey, differentButtonKey]
    }),
    data: jsPsych.timelineVariable('data'),
    on_start: function() {
      if (enableAudio && showPromptText) {
        setTimeout(() => speakText(promptText, enableAudio), 100);
      }
    },
    on_finish: function(data: any) {
      if (useMobileButtons) {
        data.response = data.response === 0 ? sameButtonKey : differentButtonKey;
      }
      data.correct = data.response === data.correct_response;
    }
  };

  // Practice feedback
  const practiceFeedback = {
    type: useMobileButtons ? 'html-button-response' : 'html-keyboard-response',
    stimulus: function() {
      const lastTrial = jsPsych.data.getLastTrialData().values()[0];
      if (lastTrial.correct) {
        return `
          ${responsiveCSS}
          <div style="text-align: center; font-size: 24px; color: green; padding: 40px;">
            <p>✓ Correct!</p>
            <p style="font-size: 16px; margin-top: 20px;">${useMobileButtons ? 'Tap "Continue" to proceed' : 'Press any key to continue'}</p>
          </div>
        `;
      } else {
        const correctKey = lastTrial.correct_response === sameButtonKey ? sameButtonText : differentButtonText;
        return `
          ${responsiveCSS}
          <div style="text-align: center; font-size: 24px; color: red; padding: 40px;">
            <p>✗ Incorrect</p>
            <p style="font-size: 16px;">The correct answer was: ${correctKey}</p>
            <p style="font-size: 16px; margin-top: 20px;">${useMobileButtons ? 'Tap "Continue" to proceed' : 'Press any key to continue'}</p>
          </div>
        `;
      }
    },
    ...(useMobileButtons ? {
      choices: ['Continue'],
      button_html: '<button class="response-button" style="margin-top: 20px;">%choice%</button>'
    } : {
      choices: "ALL_KEYS"
    }),
    trial_duration: useMobileButtons ? null : 2500,
    data: { task: 'pattern-comparison', phase: 'practice-feedback' }
  };

  // Practice block
  const practiceBlock = {
    timeline: showFeedback ? [practiceTrial, practiceFeedback] : [practiceTrial],
    timeline_variables: patterns.slice(0, numPracticeTrials).map(pattern => ({
      stimulus: createPatternStimulus(pattern, showPromptText, promptText),
      data: {
        task: 'pattern-comparison',
        phase: 'practice',
        correct_response: pattern.correct_response
      }
    }))
  };

  // Main test instructions
  const testInstructionsText = `
    Main Test. Great! Now you'll begin the main test. 
    There will be no feedback, and you should work as quickly and accurately as possible.
  `;

  const testInstructions = {
    type: useMobileButtons ? 'html-button-response' : 'html-keyboard-response',
    stimulus: `
      ${responsiveCSS}
      <div class="instructions-container">
        <h2>Main Test</h2>
        <p>Great! Now you'll begin the main test.</p>
        <p>There will be no feedback, and you should work as quickly and accurately as possible.</p>
        <p style="background: #f0f0f0; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <span class="keyboard-instructions"><strong>'${sameButtonKey.toUpperCase()}'</strong> for SAME (identical shape and color)<br><strong>'${differentButtonKey.toUpperCase()}'</strong> for DIFFERENT (different shape or color)</span>
          <span class="button-instructions"><strong>"${sameButtonText}"</strong> for SAME (identical shape and color)<br><strong>"${differentButtonText}"</strong> for DIFFERENT (different shape or color)</span>
        </p>
        <p style="margin-top: 30px;"><em>${useMobileButtons ? 'Tap "Begin Test" to start' : 'Press any key to begin the test'}</em></p>
      </div>
    `,
    ...(useMobileButtons ? {
      choices: ['Begin Test'],
      button_html: '<button class="response-button" style="margin-top: 20px;">%choice%</button>'
    } : {
      choices: "ALL_KEYS"
    }),
    data: { task: 'pattern-comparison', phase: 'test-instructions' },
    on_start: function() {
      if (enableAudio) {
        setTimeout(() => speakText(testInstructionsText, enableAudio), 100);
      }
    }
  };

  // Fixation cross
  const fixation = {
    type: 'html-keyboard-response',
    stimulus: `${responsiveCSS}<div style="font-size: 60px; text-align: center; padding: 100px;">+</div>`,
    choices: "NO_KEYS",
    trial_duration: fixationDuration,
    data: { task: 'pattern-comparison', phase: 'fixation' }
  };

  // Main test trial
  const testTrial = {
    type: useMobileButtons ? 'html-button-response' : 'html-keyboard-response',
    stimulus: jsPsych.timelineVariable('stimulus'),
    ...(useMobileButtons ? {
      choices: [sameButtonText, differentButtonText],
      button_html: (choice: string, choice_index: number) => {
        const buttonClass = choice_index === 0 ? 'same-button' : 'different-button';
        return `<button class="response-button ${buttonClass}">${choice}</button>`;
      }
    } : {
      choices: [sameButtonKey, differentButtonKey]
    }),
    data: jsPsych.timelineVariable('data'),
    on_start: function() {
      if (enableAudio && showPromptText) {
        setTimeout(() => speakText(promptText, enableAudio), 100);
      }
    },
    on_finish: function(data: any) {
      if (useMobileButtons) {
        data.response = data.response === 0 ? sameButtonKey : differentButtonKey;
      }
      data.correct = data.response === data.correct_response;
    }
  };

  // Test block
  const testBlock = {
    timeline: fixationDuration > 0 ? [fixation, testTrial] : [testTrial],
    timeline_variables: patterns.slice(numPracticeTrials, numPracticeTrials + numTrials).map(pattern => ({
      stimulus: createPatternStimulus(pattern, showPromptText, promptText),
      data: {
        task: 'pattern-comparison',
        phase: 'test',
        correct_response: pattern.correct_response
      }
    })),
    randomize_order: true
  };

  // Build timeline
  timeline.push(instructions);
  
  if (numPracticeTrials > 0) {
    timeline.push(practiceInstructions, practiceBlock);
  }
  
  timeline.push(testInstructions, testBlock);
  
  return timeline;
}

function createPatternStimulus(pattern: { left: string; right: string }, showPromptText: boolean = true, promptText: string = "Are these the same?") {
  return `
    <div style="width: 100%; max-width: 1000px; margin: 0 auto; padding: 20px;">
      ${showPromptText ? `<div class="prompt-text">${promptText}</div>` : ''}
      <div class="pattern-container">
        <div style="text-align: center;">
          <div class="pattern-label">Pattern 1</div>
          <div class="pattern-box">
            ${pattern.left}
          </div>
        </div>
        <div style="text-align: center;">
          <div class="pattern-label">Pattern 2</div>
          <div class="pattern-box">
            ${pattern.right}
          </div>
        </div>
      </div>
      <div class="button-container" style="justify-content: center; align-items: center;">
      </div>
    </div>
  `;
}

export const timelineUnits = {
  instructions: 'instructions',
  practiceInstructions: 'practice-instructions', 
  practice: 'practice',
  testInstructions: 'test-instructions',
  main: 'main'
}

export const utils = {
  generateSVGPattern,
  generateDefaultPatterns,
  createPatternStimulus,
  speakText,
  calculateAccuracy: (data: any[]) => {
    const testTrials = data.filter(trial => trial.phase === 'test' || trial.phase === 'practice');
    const correct = testTrials.filter(trial => trial.correct).length;
    return testTrials.length > 0 ? (correct / testTrials.length) * 100 : 0;
  },
  calculateAverageRT: (data: any[]) => {
    const testTrials = data.filter(trial => (trial.phase === 'test' || trial.phase === 'practice') && trial.correct);
    if (testTrials.length === 0) return 0;
    const rts = testTrials.map(trial => trial.rt);
    return rts.reduce((sum, rt) => sum + rt, 0) / rts.length;
  },
  getTrialsByPhase: (data: any[], phase: string) => {
    return data.filter(trial => trial.phase === phase);
  }
}

// Export constants for external use
export const constants = {
  svgShapes,
  colors,
  defaultConfig: {
    numTrials: 90,
    stimulusDuration: 30000,
    fixationDuration: 500,
    numPracticeTrials: 6,
    showFeedback: true,
    showPromptText: true,
    promptText: "Are these the same?",
    enableAudio: false,
    useMobileButtons: true,
    sameButtonText: "Yes",
    differentButtonText: "No",
    sameButtonKey: 's',
    differentButtonKey: 'd'
  }
}