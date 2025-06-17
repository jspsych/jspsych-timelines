import { JsPsych, TrialType } from "jspsych"
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response"

interface TestCategory {
  [testName: string]: [string, string] // [original_svg, edited_svg]
}

interface PatternComparisonConfig {
  /** Array of three test categories, each containing test pairs */
  testCategories?: TestCategory[]
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
}

// Default test categories based on the PMC article methodology
const defaultTestCategories: TestCategory[] = [
  // Category 1: Simple geometric patterns
  {
    "circle_pattern": [
      `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="20" fill="#4ECDC4" stroke="#333" stroke-width="2"/></svg>`,
      `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="25" fill="#4ECDC4" stroke="#333" stroke-width="2"/></svg>`
    ],
    "square_pattern": [
      `<svg viewBox="0 0 100 100"><rect x="30" y="30" width="40" height="40" fill="#FF6B6B" stroke="#333" stroke-width="2"/></svg>`,
      `<svg viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="50" fill="#FF6B6B" stroke="#333" stroke-width="2"/></svg>`
    ]
  },
  // Category 2: Complex geometric patterns
  {
    "triangle_composition": [
      `<svg viewBox="0 0 100 100"><polygon points="50,20 30,70 70,70" fill="#45B7D1" stroke="#333" stroke-width="2"/></svg>`,
      `<svg viewBox="0 0 100 100"><polygon points="50,15 25,75 75,75" fill="#45B7D1" stroke="#333" stroke-width="2"/></svg>`
    ],
    "hexagon_pattern": [
      `<svg viewBox="0 0 100 100"><polygon points="50,10 75,30 75,70 50,90 25,70 25,30" fill="#96CEB4" stroke="#333" stroke-width="2"/></svg>`,
      `<svg viewBox="0 0 100 100"><polygon points="50,15 70,32 70,68 50,85 30,68 30,32" fill="#96CEB4" stroke="#333" stroke-width="2"/></svg>`
    ]
  },
  // Category 3: Abstract/irregular patterns
  {
    "irregular_shape": [
      `<svg viewBox="0 0 100 100"><path d="M20,50 Q30,20 50,30 Q70,10 80,40 Q90,60 70,70 Q50,80 30,70 Q10,60 20,50 Z" fill="#FFEAA7" stroke="#333" stroke-width="2"/></svg>`,
      `<svg viewBox="0 0 100 100"><path d="M25,50 Q35,25 50,35 Q65,15 75,40 Q85,65 65,70 Q50,75 35,70 Q15,65 25,50 Z" fill="#FFEAA7" stroke="#333" stroke-width="2"/></svg>`
    ],
    "organic_form": [
      `<svg viewBox="0 0 100 100"><ellipse cx="40" cy="50" rx="15" ry="25" fill="#DDA0DD" stroke="#333" stroke-width="2" transform="rotate(30 40 50)"/><ellipse cx="60" cy="50" rx="10" ry="20" fill="#DDA0DD" stroke="#333" stroke-width="2" transform="rotate(-20 60 50)"/></svg>`,
      `<svg viewBox="0 0 100 100"><ellipse cx="42" cy="48" rx="18" ry="28" fill="#DDA0DD" stroke="#333" stroke-width="2" transform="rotate(35 42 48)"/><ellipse cx="58" cy="52" rx="12" ry="22" fill="#DDA0DD" stroke="#333" stroke-width="2" transform="rotate(-25 58 52)"/></svg>`
    ]
  }
];

function generateTrials(config: PatternComparisonConfig) {
  const testCategories = config.testCategories || defaultTestCategories;
  const numTrials = config.numTrials || 20;
  const trials = [];

  for (let i = 0; i < numTrials; i++) {
    // Randomly select a category
    const categoryIndex = Math.floor(Math.random() * testCategories.length);
    const selectedCategory = testCategories[categoryIndex];
    
    // Randomly select a test within the category
    const testNames = Object.keys(selectedCategory);
    const testName = testNames[Math.floor(Math.random() * testNames.length)];
    const [originalSvg, editedSvg] = selectedCategory[testName];
    
    // Randomly decide if patterns should be same or different
    const isSame = Math.random() < 0.5;
    
    const pattern1 = originalSvg;
    const pattern2 = isSame ? originalSvg : editedSvg;

    trials.push({
      pattern1,
      pattern2,
      correctAnswer: isSame ? 0 : 1, // 0 for same, 1 for different
      categoryIndex,
      testName,
      isSame
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
        <p>Look carefully at both patterns and compare them closely.</p>
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
        category_index: trial.categoryIndex,
        test_name: trial.testName,
        is_same: trial.isSame,
        pattern1: trial.pattern1,
        pattern2: trial.pattern2
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
  defaultTestCategories,
  
  /** Calculate accuracy and reaction time statistics by category */
  calculatePerformance: function(data: any[]) {
    const trialData = data.filter(d => d.task === 'pattern-comparison')
    const correct = trialData.filter(d => d.correct).length
    const total = trialData.length
    const accuracy = total > 0 ? (correct / total) * 100 : 0
    
    const validRTs = trialData.filter(d => d.correct && d.rt !== null).map(d => d.rt)
    const meanRT = validRTs.length > 0 ? validRTs.reduce((a, b) => a + b, 0) / validRTs.length : null
    
    // Calculate performance by category
    const categoryPerformance = [0, 1, 2].map(categoryIndex => {
      const categoryTrials = trialData.filter(d => d.category_index === categoryIndex)
      const categoryCorrect = categoryTrials.filter(d => d.correct).length
      const categoryTotal = categoryTrials.length
      const categoryAccuracy = categoryTotal > 0 ? (categoryCorrect / categoryTotal) * 100 : 0
      
      const categoryValidRTs = categoryTrials.filter(d => d.correct && d.rt !== null).map(d => d.rt)
      const categoryMeanRT = categoryValidRTs.length > 0 ? 
        categoryValidRTs.reduce((a, b) => a + b, 0) / categoryValidRTs.length : null
      
      return {
        categoryIndex,
        accuracy: categoryAccuracy,
        meanReactionTime: categoryMeanRT,
        totalTrials: categoryTotal,
        correctTrials: categoryCorrect
      }
    })
    
    return {
      overall: {
        accuracy,
        meanReactionTime: meanRT,
        totalTrials: total,
        correctTrials: correct
      },
      byCategory: categoryPerformance
    }
  }
}

// Default export for convenience
export default { createTimeline, timelineUnits, utils }