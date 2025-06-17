import { JsPsych, TrialType } from "jspsych"
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response"

interface PatternComparisonConfig {
  /** Array of SVG strings or URLs to use as patterns */
  patterns?: string[]
  /** Number of trials to generate */
  numTrials?: number
  /** Instructions text to display above each trial */
  instructions?: string
  /** Enable text-to-speech for instructions */
  enableTTS?: boolean
  /** Text for the "same" button */
  sameButtonText?: string
  /** Text for the "different" button */
  differentButtonText?: string
  /** Maximum time allowed per trial (in ms) */
  trialTimeout?: number
  /** Inter-trial interval (in ms) */
  interTrialInterval?: number
  /** Number of colored patterns to generate */
  numPatterns?: number
}

// Base SVG shapes without colors
const svgShapes = [
  // Lightbulb
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18.9999H15C15.5523 18.9999 16 19.4476 16 19.9999C16 20.5522 15.5523 20.9999 15 20.9999H9C8.44772 20.9999 8 20.5522 8 19.9999C8 19.4476 8.44772 18.9999 9 18.9999Z" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2C8.68629 2 6 4.68629 6 8C6 10.2913 7.21113 12.2743 9 13.4423V17C9 17.5523 9.44772 18 10 18H14C14.5523 18 15 17.5523 15 17V13.4423C16.7889 12.2743 18 10.2913 18 8C18 4.68629 15.3137 2 12 2Z" fill="FILL_COLOR" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Camera
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8.99994C15 10.6568 13.6569 11.9999 12 11.9999C10.3431 11.9999 9 10.6568 9 8.99994C9 7.34309 10.3431 5.99994 12 5.99994C13.6569 5.99994 15 7.34309 15 8.99994Z" fill="FILL_COLOR" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 20.9999H15C16.1046 20.9999 17 20.1045 17 18.9999V11.9999C17 10.8954 16.1046 9.99994 15 9.99994H9C7.89543 9.99994 7 10.8954 7 11.9999V18.9999C7 20.1045 7.89543 20.9999 9 20.9999Z" fill="FILL_COLOR" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 17L19 13" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 17L5 13" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 9L21 7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7L3 9" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Key
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 7.5C15.5 9.433 13.933 11 12 11C10.067 11 8.5 9.433 8.5 7.5C8.5 5.567 10.067 4 12 4C13.933 4 15.5 5.567 15.5 7.5Z" fill="FILL_COLOR" stroke="STROKE_COLOR" stroke-width="2"/><path d="M12 11V15.5C12 15.7761 12.2239 16 12.5 16H14.5M12 20H14.5M14.5 16V20M14.5 16H17.5C17.7761 16 18 15.7761 18 15.5V13.5C18 13.2239 17.7761 13 17.5 13H14" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Book
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 19V6.2C4 5.0799 4 4.51984 4.21799 4.09202C4.40973 3.71569 4.71569 3.40973 5.09202 3.21799C5.51984 3 6.0799 3 7.2 3H12M4 19H18.8C19.9201 19 20.4802 19 20.908 18.782C21.2843 18.5903 21.5903 18.2843 21.782 17.908C22 17.4802 22 16.9201 22 15.8V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.71569 21.2843 5.40973 20.908 5.21799C20.4802 5 19.9201 5 18.8 5H12M4 19V21M12 3V5M12 3H11M12 5H11.5M12 5H13" fill="FILL_COLOR" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Anchor
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22V8M12 8C12.5523 8 13 7.55228 13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7C11 7.55228 11.4477 8 12 8ZM9 12H15M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12" fill="FILL_COLOR" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Envelope (Mail)
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 17H21V5H3V17Z" fill="FILL_COLOR" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Gift Box
  `<svg viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M804.6 473.9v292.6c0 21.9-17.8 39.7-39.7 39.7H259.7c-21.9 0-39.7-17.8-39.7-39.7V473.9h-18.8c-21.9 0-39.7-17.8-39.7-39.7v-68.3c0-21.9 17.8-39.7 39.7-39.7h622.1c21.9 0 39.7 17.8 39.7 39.7v68.3c0 21.9-17.8 39.7-39.7 39.7z" fill="FILL_COLOR"/><path d="M764.9 832.7H259.7c-36.5 0-66.2-29.7-66.2-66.2V499.9c-32.9-3.8-58.5-31.9-58.5-65.7v-68.3c0-36.5 29.7-66.2 66.2-66.2h622.1c36.5 0 66.2 29.7 66.2 66.2v68.3c0 33.9-25.6 61.9-58.5 65.7v266.6c.1 36.5-29.6 66.2-66.1 66.2m-563.7-480c-7.3 0-13.2 5.9-13.2 13.2v68.3c0 7.3 5.9 13.2 13.2 13.2h45.2v319.1c0 7.3 5.9 13.2 13.2 13.2h505.3c7.3 0 13.2-5.9 13.2-13.2V447.4h45.2c7.3 0 13.2-5.9 13.2-13.2v-68.3c0-7.3-5.9-13.2-13.2-13.2z" fill="STROKE_COLOR"/></svg>`,

  // Flag
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 21V4L4.82843 4.82843C5.5786 5.5786 6.58582 6 7.62132 6H17C18.1046 6 19 6.89543 19 8V14C19 15.1046 18.1046 16 17 16H7.62132C6.58582 16 5.5786 16.4214 4.82843 17.1716L4 18" fill="FILL_COLOR" stroke="STROKE_COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
];

// Color palette for random selection
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D5A6BD',
  '#A569BD', '#5DADE2', '#58D68D', '#F4D03F', '#EB984E'
];

function generatePatterns(numPatterns: number = 20): string[] {
  const patterns = [];
  
  for (let i = 0; i < numPatterns; i++) {
    // Select random shape
    const shapeIndex = Math.floor(Math.random() * svgShapes.length);
    const baseShape = svgShapes[shapeIndex];
    
    // Select random colors
    const fillColor = colors[Math.floor(Math.random() * colors.length)];
    const strokeColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Replace placeholders with actual colors
    const coloredPattern = baseShape
      .replace(/FILL_COLOR/g, fillColor)
      .replace(/STROKE_COLOR/g, strokeColor);
    
    patterns.push(coloredPattern);
  }
  
  return patterns;
}

function generateTrials(config: PatternComparisonConfig) {
  // Use patterns from config or generate colored patterns
  const patterns = config.patterns || generatePatterns(config.numPatterns || 20);
  const numTrials = config.numTrials || 20;
  const trials = [];

  for (let i = 0; i < numTrials; i++) {
    // Randomly decide if patterns should be same or different
    const isSame = Math.random() < 0.5;
    
    // Select first pattern randomly
    const pattern1Index = Math.floor(Math.random() * patterns.length);
    const pattern1 = patterns[pattern1Index];
    
    // Select second pattern based on isSame
    let pattern2;
    if (isSame) {
      pattern2 = pattern1;
    } else {
      let pattern2Index;
      do {
        pattern2Index = Math.floor(Math.random() * patterns.length);
      } while (pattern2Index === pattern1Index);
      pattern2 = patterns[pattern2Index];
    }

    trials.push({
      pattern1,
      pattern2,
      correctAnswer: isSame ? 0 : 1 // 0 for same, 1 for different
    });
  }

  return trials;
}

export function createTimeline(jsPsych: JsPsych, config: PatternComparisonConfig = {}) {
  const {
    instructions = "Are these two patterns the same?",
    enableTTS = false,
    sameButtonText = "Same",
    differentButtonText = "Different",
    trialTimeout = 10000,
    interTrialInterval = 500
  } = config

  const trials = generateTrials(config)
  const timeline = []

  // Instructions screen
  timeline.push({
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <div style="max-width: 600px; margin: 0 auto; text-align: center; padding: 20px;">
        <h2>Pattern Comparison Task</h2>
        <p>You will see two patterns side by side. Your task is to decide whether they are the same or different.</p>
        <p>Respond as quickly and accurately as possible.</p>
        <p>Click the button below to start.</p>
      </div>
    `,
    choices: ['Start'],
    margin_horizontal: '10px',
    margin_vertical: '10px'
  })

  // Create trial timeline
  trials.forEach((trial, index) => {
    timeline.push({
      type: HtmlButtonResponsePlugin,
      stimulus: `
        <style>
          .pattern-comparison-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .instructions {
            font-size: 18px;
            margin-bottom: 30px;
            text-align: center;
          }
          .patterns-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 50px;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .pattern {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            border: 2px solid #ccc;
            border-radius: 10px;
            background-color: #f9f9f9;
            width: 150px;
            height: 150px;
          }
          .pattern svg {
            max-width: 100%;
            max-height: 100%;
          }
          @media (max-width: 768px) {
            .patterns-container {
              flex-direction: column;
              gap: 30px;
            }
            .pattern {
              width: 120px;
              height: 120px;
            }
            .instructions {
              font-size: 16px;
            }
          }
        </style>
        <div class="pattern-comparison-container">
          <div class="instructions">${instructions}</div>
          <div class="patterns-container">
            <div class="pattern">${trial.pattern1}</div>
            <div class="pattern">${trial.pattern2}</div>
          </div>
        </div>
      `,
      choices: [sameButtonText, differentButtonText],
      margin_horizontal: '20px',
      margin_vertical: '15px',
      button_html: function(choice, choice_index) {
        return `<button class="jspsych-btn" style="font-size: 16px; padding: 12px 24px; margin: 0 10px; min-width: 100px;">${choice}</button>`;
      },
      trial_duration: trialTimeout,
      data: {
        task: 'pattern-comparison',
        trial_number: index + 1,
        correct_answer: trial.correctAnswer,
        pattern1: trial.pattern1,
        pattern2: trial.pattern2,
        is_same: trial.correctAnswer === 0
      },
      on_finish: function(data: any) {
        data.correct = data.response === data.correct_answer
        data.reaction_time = data.rt
      },
      on_start: function() {
        if (enableTTS && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(instructions)
          speechSynthesis.speak(utterance)
        }
      }
    })

    // Inter-trial interval
    if (index < trials.length - 1) {
      timeline.push({
        type: HtmlButtonResponsePlugin,
        stimulus: '<div style="font-size: 24px; text-align: center;">+</div>',
        choices: [],
        trial_duration: interTrialInterval
      })
    }
  })

  // End screen
  timeline.push({
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <div style="text-align: center; padding: 40px;">
        <h2>Task Complete!</h2>
        <p>Thank you for participating in the pattern comparison task.</p>
      </div>
    `,
    choices: ['Continue']
  })

  return timeline
}

export const timelineUnits = {
  instructions: "Instructions for the pattern comparison task",
  trial: "Single pattern comparison trial",
  interTrialInterval: "Fixation cross between trials",
  endScreen: "Task completion screen"
}

export const utils = {
  generateTrials,
  generatePatterns,
  svgShapes, // Export the base shapes
  colors, // Export the color palette
  
  /** Calculate accuracy and reaction time statistics */
  calculatePerformance: function(data: any[]) {
    const trialData = data.filter(d => d.task === 'pattern-comparison')
    const correct = trialData.filter(d => d.correct).length
    const total = trialData.length
    const accuracy = total > 0 ? (correct / total) * 100 : 0
    
    const validRTs = trialData.filter(d => d.correct && d.rt !== null).map(d => d.rt)
    const meanRT = validRTs.length > 0 ? validRTs.reduce((a, b) => a + b, 0) / validRTs.length : null
    
    return {
      accuracy,
      meanReactionTime: meanRT,
      totalTrials: total,
      correctTrials: correct
    }
  }
}

// Default export for convenience
export default { createTimeline, timelineUnits, utils }