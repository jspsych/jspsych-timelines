import { JsPsych } from "jspsych"
import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import { englishText, symbols } from "./text";

// Helper function to replace placeholders in text
function replaceText(template: string, ...values: (string | number)[]): string {
  let result = template;
  values.forEach(value => {
    result = result.replace('{}', String(value));
  });
  return result;
}

// Helper function to format duration with proper pluralization
function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds} ${totalSeconds === 1 ? 'second' : 'seconds'}`;
  }
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  const minuteText = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  
  if (seconds === 0) {
    return minuteText;
  } else {
    const secondText = `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
    return `${minuteText} and ${secondText}`;
  }
}


// Symbol to number mapping (Unicode symbols for cross-platform compatibility)
const SYMBOL_MAP = {
  [symbols.oneSymbol]: 1,    // Circle (hollow)
  [symbols.twoSymbol]: 2,    // Square (hollow)
  [symbols.threeSymbol]: 3,  // Triangle (hollow)
  [symbols.fourSymbol]: 4,   // Diamond (hollow)
  [symbols.fiveSymbol]: 5,   // Star (hollow)
  [symbols.sixSymbol]: 6,    // Circle (filled) - more distinct from hollow circle
  [symbols.sevenSymbol]: 7,  // X/Cross
  [symbols.eightSymbol]: 8,  // Triangle pointing down - distinct from up triangle
  [symbols.nineSymbol]: 9    // Square (filled) - distinct from hollow square
} as const;

const SYMBOLS = Object.keys(SYMBOL_MAP);
const SYMBOL_ENTRIES = Object.entries(SYMBOL_MAP);

// Generate practice items (9 items using each symbol once)
const PRACTICE_ITEMS = [
  { symbol: symbols.sixSymbol, correct: 6 },   // Filled circle -> 6
  { symbol: symbols.sevenSymbol, correct: 7 }, // X -> 7
  { symbol: symbols.threeSymbol, correct: 3 }, // Triangle up -> 3
  { symbol: symbols.nineSymbol, correct: 9 },  // Filled square -> 9
  { symbol: symbols.fiveSymbol, correct: 5 },  // Star -> 5
  { symbol: symbols.fourSymbol, correct: 4 },  // Diamond -> 4
  { symbol: symbols.oneSymbol, correct: 1 },   // Hollow circle -> 1
  { symbol: symbols.eightSymbol, correct: 8 }, // Triangle down -> 8
  { symbol: symbols.twoSymbol, correct: 2 }    // Hollow square -> 2
];

// Generate test items (random distribution of symbols)
function generateTestItems(numItems: number = 143) {
  const items = [];
  for (let i = 0; i < numItems; i++) {
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    items.push({
      symbol,
      correct: SYMBOL_MAP[symbol as keyof typeof SYMBOL_MAP]
    });
  }
  return items;
}

interface OralSymbolDigitOptions {
  testDuration?: number; // Test duration in seconds (default: 120)
  practiceRequired?: boolean; // Whether practice must be perfect to continue (default: true)
  showInstructions?: boolean; // Whether to show instruction phase (default: true)
  showResults?: boolean; // Whether to show results pages (default: true)
  numTestItems?: number; // Number of test items to generate (default: 143)
  numPracticeItems?: number; // Number of practice items (default: 9)
  maxPracticeAttempts?: number; // Maximum practice attempts before proceeding (default: 3)
  useKeyboard?: boolean; // Whether to use keyboard input (true) or on-screen buttons (false) (default: false)
}

export function createTimeline(jsPsych: JsPsych, options: OralSymbolDigitOptions = {}) {
  // Set defaults
  const config = {
    testDuration: options.testDuration ?? 120,
    practiceRequired: options.practiceRequired ?? true,
    showInstructions: options.showInstructions ?? true,
    showResults: options.showResults ?? true,
    numTestItems: options.numTestItems ?? 143,
    numPracticeItems: options.numPracticeItems ?? 9,
    maxPracticeAttempts: options.maxPracticeAttempts ?? 3,
    useKeyboard: options.useKeyboard ?? false,
    ...options
  };

  // Generate test items based on config
  const TEST_ITEMS = generateTestItems(config.numTestItems);
  
  // Generate practice items based on config
  const PRACTICE_ITEMS_DYNAMIC = generateTestItems(config.numPracticeItems);
  
  // Initialize practice attempts counter
  (window as any).practiceAttempts = 0;

  const timeline = [];

  // Instructions Phase
  const instructions = createInstructions(config);

  // Practice Loop using factory functions
  const practiceLoop = createPracticeLoop(config, jsPsych);

  // Pre-test Instructions using factory function
  const preTest = createPreTest(config);

  // Main Test using factory function
  const mainTest = createMainTest(config, jsPsych);

  // Thank You Page using factory function
  const thankYou = createThankYou();

  // Results using factory function
  const results = createResults(jsPsych);

  // Raw data display using factory function
  const dataView = createDataView(jsPsych);

  // Add phases to timeline based on config
  if (config.showInstructions) {
    timeline.push(instructions);
    timeline.push(practiceLoop);
    timeline.push(preTest);
  }
  
  timeline.push(mainTest);
  
  if (config.showResults) {
    timeline.push(thankYou);
    timeline.push(results);
  }

  return timeline;
}

// Factory functions for individual timeline components
export function createInstructions(config: any) {
  return {
    type: htmlButtonResponse,
    stimulus: `
      <div style="max-width: 800px; margin: 0 auto; text-align: left; font-size: 18px; line-height: 1.6;">
        <h2 style="text-align: center;">${englishText.instructionsTitle}</h2>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>${englishText.symbolNumberKey}</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 24px; text-align: center;">
            ${SYMBOL_ENTRIES.map(([symbol, num]) => 
              `<div style="border: 2px solid #ccc; padding: 15px; border-radius: 5px;">
                <div style="font-size: 36px; margin-bottom: 5px;">${symbol}</div>
                <div style="font-size: 20px; font-weight: bold;">${num}</div>
              </div>`
            ).join('')}
          </div>
        </div>

        <p><strong>${englishText.instructionsHeader}</strong></p>
        <p>${englishText.instructionsIntro}</p>
        <p>${replaceText(englishText.instructionsTask, config.useKeyboard ? englishText.inputMethodPressKey : englishText.inputMethodSelectNumber)}</p>
        <p>${replaceText(englishText.instructionsExample1, symbols.sixSymbol, '6', config.useKeyboard ? replaceText(englishText.inputMethodPress, '6') : replaceText(englishText.inputMethodSelect, '6'))}</p>
        <p>${replaceText(englishText.instructionsExample2, symbols.sevenSymbol, '7', config.useKeyboard ? replaceText(englishText.inputMethodPress, '7') : replaceText(englishText.inputMethodSelect, '7'))}</p>
      </div>
    `,
    choices: [englishText.continueButton]
  };
}

export function createPreTest(config: any) {
  return {
    type: htmlButtonResponse,
    stimulus: `
      <div style="max-width: 800px; margin: 0 auto; text-align: center; font-size: 18px;">
        <h2>${englishText.preTestTitle}</h2>
        
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h3>${englishText.symbolNumberKey}</h3>
          <div style="display: grid; grid-template-columns: repeat(9, 1fr); gap: 10px; font-size: 14px;">
            ${SYMBOL_ENTRIES.map(([symbol, num]) => 
              `<div style="border: 1px solid #ccc; padding: 5px; border-radius: 3px;">
                <div style="font-size: 18px;">${symbol}</div>
                <div style="font-weight: bold;">${num}</div>
              </div>`
            ).join('')}
          </div>
        </div>

        <div style="background: #fff3cd; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107;">
          <p><strong>${englishText.preTestInstructionsHeader}</strong></p>
          <ul style="text-align: left; max-width: 600px; margin: 0 auto;">
            <li>${replaceText(englishText.preTestDuration, `<strong>${formatDuration(config.testDuration)}</strong>`)}</li>
            <li>${englishText.preTestSpeed}</li>
            <li>${replaceText(englishText.preTestInput, config.useKeyboard ? englishText.inputMethodKeyboard : englishText.inputMethodButtons)}</li>
            <li>${replaceText(englishText.preTestAdvancement, config.useKeyboard ? englishText.inputMethodPressKey2 : englishText.inputMethodSelectAnswer)}</li>
            <li>${englishText.preTestTimer}</li>
          </ul>
        </div>
      </div>
    `,
    choices: [englishText.beginMainTestButton]
  };
}

export function createThankYou() {
  return {
    type: htmlButtonResponse,
    stimulus: `
      <div style="max-width: 800px; margin: 0 auto; text-align: center; font-size: 20px; padding: 50px 20px;">
        <h1 style="color: #28a745; margin-bottom: 30px;">${englishText.thankYouTitle}</h1>
        
        <div style="background: #f8f9fa; padding: 40px; border-radius: 15px; margin: 30px 0;">
          <h3 style="color: #333; margin-bottom: 20px;">${englishText.thankYouHeader}</h3>
          <p style="font-size: 18px; line-height: 1.6; color: #666;">
            ${englishText.thankYouMessage}
          </p>
          <p style="font-size: 16px; color: #888; margin-top: 20px;">
            ${englishText.thankYouNote}
          </p>
        </div>
      </div>
    `,
    choices: [englishText.viewResultsButton]
  };
}

// Factory function for practice component
export function createPractice(config: any, jsPsych: any) {
  // Generate practice items once and store them
  const PRACTICE_ITEMS_DYNAMIC = generateTestItems(config.numPracticeItems);
  
  return {
    type: htmlButtonResponse,
    stimulus: function() {
      return `
        <div style="max-width: 1000px; margin: 0 auto;">
          <!-- Fixed Header with Key -->
          <div style="position: fixed; top: 0; left: 0; right: 0; background: white; border-bottom: 2px solid #ccc; z-index: 1000; padding: 10px;">
            <div style="max-width: 1000px; margin: 0 auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <div style="display: grid; grid-template-columns: repeat(9, 1fr); gap: 8px; font-size: 12px;">
                  ${SYMBOL_ENTRIES.map(([symbol, num]) => 
                    `<div style="border: 1px solid #ccc; padding: 4px; border-radius: 3px; text-align: center;">
                      <div style="font-size: 16px;">${symbol}</div>
                      <div style="font-weight: bold;">${num}</div>
                    </div>`
                  ).join('')}
                </div>
                <div style="font-size: 20px; font-weight: bold; color: #28a745;">
                  ${englishText.practiceTitle}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Main Practice Content -->
          <div style="margin-top: 140px; text-align: center; padding: 20px;">
            <h2>${englishText.practiceHeader}</h2>
            <div id="current-item" style="margin: 30px 0;">
              <div style="font-size: 72px; margin: 40px 0; padding: 30px;" id="current-symbol">${PRACTICE_ITEMS_DYNAMIC[0].symbol}</div>
              
              ${config.useKeyboard ? `
                <!-- Keyboard input instructions -->
                <div style="margin: 20px 0;">
                  <div style="font-size: 24px; color: #007bff; font-weight: bold; margin-bottom: 10px;">${englishText.practiceKeyboardInstructions}</div>
                  <div style="font-size: 18px; color: #666; margin-bottom: 20px;">${englishText.practiceKeyboardDetail}</div>
                  <div style="font-size: 16px; color: #888; font-style: italic;">${englishText.practiceKeyboardNote}</div>
                </div>
              ` : `
                <!-- Number selection buttons -->
                <div style="margin: 20px 0;">
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; max-width: 300px; margin: 0 auto;">
                    ${[1,2,3,4,5,6,7,8,9].map(num => 
                      `<button class="num-btn" data-num="${num}" 
                               style="padding: 20px; font-size: 24px; background: #f8f9fa; border: 3px solid #ccc; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                        ${num}
                      </button>`
                    ).join('')}
                  </div>
                </div>
              `}
              
              <!-- Feedback area -->
              <div id="feedback-area" style="margin: 20px 0; min-height: 60px;">
                <div id="feedback-message" style="font-size: 24px; font-weight: bold; margin-bottom: 10px;"></div>
                <div id="feedback-detail" style="font-size: 16px; color: #666;"></div>
              </div>
            </div>
            
            <div style="margin: 20px 0;">
              <div>${replaceText(englishText.progressLabel, '<span id="progress">1</span>', config.numPracticeItems)}</div>
              <div>${replaceText(englishText.correctLabel, '<span id="correct-count">0</span>')}</div>
            </div>
          </div>
        </div>
      `;
    },
    choices: [],
    trial_duration: null,
    data: { test_part: 'practice' },
    on_load: function() {
      // Use the same practice items that were generated above
      let currentIndex = 0;
      let correctCount = 0;
      let responses: any[] = [];
      let currentItemStartTime = Date.now();
      let awaitingNext = false;
      
      const currentSymbol = document.getElementById('current-symbol')!;
      const progressSpan = document.getElementById('progress')!;
      const correctSpan = document.getElementById('correct-count')!;
      const feedbackMessage = document.getElementById('feedback-message')!;
      const feedbackDetail = document.getElementById('feedback-detail')!;

      function handleAnswer(selectedAnswer: number) {
        if (awaitingNext) return;
        
        const processingTime = Date.now() - currentItemStartTime;
        const correct = PRACTICE_ITEMS_DYNAMIC[currentIndex].correct;
        const isCorrect = selectedAnswer === correct;
        
        responses.push({
          index: currentIndex,
          symbol: PRACTICE_ITEMS_DYNAMIC[currentIndex].symbol,
          correct,
          response: selectedAnswer,
          isCorrect,
          processingTime,
          timestamp: Date.now()
        });
        
        // Show immediate feedback
        if (isCorrect) {
          correctCount++;
          correctSpan.textContent = correctCount.toString();
          feedbackMessage.textContent = englishText.feedbackCorrect;
          feedbackMessage.style.color = '#28a745';
          feedbackDetail.textContent = replaceText(englishText.feedbackDetailCorrect, PRACTICE_ITEMS_DYNAMIC[currentIndex].symbol, selectedAnswer);
        } else {
          feedbackMessage.textContent = englishText.feedbackIncorrect;
          feedbackMessage.style.color = '#dc3545';
          feedbackDetail.textContent = replaceText(englishText.feedbackDetail, PRACTICE_ITEMS_DYNAMIC[currentIndex].symbol, correct, selectedAnswer);
        }
        
        // Provide visual feedback
        if (!config.useKeyboard) {
          const btn = document.querySelector(`.num-btn[data-num="${selectedAnswer}"]`) as HTMLElement;
          if (btn) {
            btn.style.background = isCorrect ? '#28a745' : '#dc3545';
            btn.style.borderColor = isCorrect ? '#28a745' : '#dc3545';
            btn.style.color = 'white';
          }
        }
        
        awaitingNext = true;
        
        // Move to next item after delay
        setTimeout(() => {
          nextItem();
        }, 1500); // 1.5 second feedback delay
      }

      function nextItem() {
        currentIndex++;
        
        if (currentIndex >= PRACTICE_ITEMS_DYNAMIC.length) {
          // Practice complete
          const practiceData = {
            responses,
            score: correctCount,
            total: PRACTICE_ITEMS_DYNAMIC.length,
            accuracy: (correctCount / PRACTICE_ITEMS_DYNAMIC.length) * 100
          };
          
          (window as any).practiceData = practiceData;
          jsPsych.finishTrial(practiceData);
          return;
        }
        
        // Update display for next item
        currentSymbol.textContent = PRACTICE_ITEMS_DYNAMIC[currentIndex].symbol;
        progressSpan.textContent = (currentIndex + 1).toString();
        
        // Clear feedback
        feedbackMessage.textContent = '';
        feedbackDetail.textContent = '';
        
        // Reset button styles
        if (!config.useKeyboard) {
          document.querySelectorAll('.num-btn').forEach(b => {
            (b as HTMLElement).style.background = '#f8f9fa';
            (b as HTMLElement).style.borderColor = '#ccc';
            (b as HTMLElement).style.color = 'black';
          });
        }
        
        // Start timing for new item
        currentItemStartTime = Date.now();
        awaitingNext = false;
      }

      if (config.useKeyboard) {
        // Keyboard event listener
        document.addEventListener('keydown', (e) => {
          const key = e.key;
          if (key >= '1' && key <= '9' && !awaitingNext) {
            e.preventDefault();
            handleAnswer(parseInt(key));
          }
        });
      } else {
        // Button click event listeners
        document.querySelectorAll('.num-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            if (!awaitingNext) {
              const selectedAnswer = parseInt(btn.getAttribute('data-num')!);
              handleAnswer(selectedAnswer);
            }
          });
        });
      }
    },
    on_finish: function(data: any) {
      const practiceData = (window as any).practiceData || { responses: [], score: 0, total: config.numPracticeItems, accuracy: 0 };
      
      data.practice_responses = practiceData.responses;
      data.practice_score = practiceData.score;
      data.practice_total = practiceData.total;
      data.practice_accuracy = practiceData.accuracy;
      
      // Track practice attempts - increment here so loop_function sees the updated count
      const currentAttempts = (window as any).practiceAttempts || 0;
      (window as any).practiceAttempts = currentAttempts + 1;
      data.practice_attempt = (window as any).practiceAttempts;
    }
  };
}

// Factory function for practice results component
export function createPracticeResults(config: any, jsPsych: any) {
  return {
    type: htmlButtonResponse,
    stimulus: function() {
      const lastTrial = jsPsych.data.getLastTrialData().values()[0];
      const responses = lastTrial.practice_responses || [];
      const score = lastTrial.practice_score || 0;
      const total = lastTrial.practice_total || config.numPracticeItems;
      const accuracy = lastTrial.practice_accuracy || 0;
      const attempts = (window as any).practiceAttempts || 0;
      
      let feedback = `<div style="max-width: 800px; margin: 0 auto; text-align: center;">
        <h2>${replaceText(englishText.practiceResultsTitle, attempts)}</h2>
        <p>${replaceText(englishText.practiceResultsScore, `<strong>${score}</strong>`, `<strong>${total}</strong>`, `${accuracy.toFixed(1)}%`)}</p>
        <div style="margin: 20px 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">`;
      
      responses.forEach((resp: any) => {
        feedback += `<span style="padding: 8px 12px; border-radius: 5px; ${resp.isCorrect ? 'background: #d4edda; color: #155724;' : 'background: #f8d7da; color: #721c24;'} font-size: 16px;">
          ${resp.symbol} → ${resp.response} ${resp.isCorrect ? '✓' : `✗ (${resp.correct})`}
        </span>`;
      });
      
      feedback += `</div>`;
      
      if (score === total) {
        feedback += `<p style="color: green; font-weight: bold; font-size: 18px;">${englishText.practiceResultsPerfect}</p>`;
      } else if (attempts >= config.maxPracticeAttempts) {
        feedback += `<p style="color: #dc3545; font-weight: bold; font-size: 18px;">${replaceText(englishText.practiceResultsMaxAttempts, config.maxPracticeAttempts)}</p>
                     <p style="color: #666; font-size: 16px;">${replaceText(englishText.practiceResultsRemember, SYMBOL_ENTRIES.map(([symbol, num]) => `${symbol}=${num}`).join(', '))}</p>`;
      } else {
        feedback += `<p style="color: orange; font-size: 18px;">${replaceText(englishText.practiceResultsRetry, attempts, config.maxPracticeAttempts)}</p>`;
      }
      
      feedback += `</div>`;
      return feedback;
    },
    choices: function() {
      const lastTrial = jsPsych.data.getLastTrialData().values()[0];
      const attempts = (window as any).practiceAttempts || 0;
      
      // If perfect score OR reached max attempts, show "Start Main Test"
      if (lastTrial.practice_score === lastTrial.practice_total || attempts >= config.maxPracticeAttempts) {
        return [englishText.startMainTestButton];
      } else {
        return [englishText.retryButton];
      }
    },
    on_finish: function(data: any) {
      // Get the practice trial data (second to last, since this results trial is the last)
      const allTrials = jsPsych.data.get().values();
      const practiceTrialData = allTrials[allTrials.length - 2]; // Get the practice trial before this results trial
      
      data.practice_passed = practiceTrialData.practice_score === practiceTrialData.practice_total;
      data.practice_attempt = (window as any).practiceAttempts; // Just record the current attempt number
    }
  };
}

// Factory function for practice loop component
export function createPracticeLoop(config: any, jsPsych: any) {
  return {
    timeline: [createPractice(config, jsPsych), createPracticeResults(config, jsPsych)],
    loop_function: function() {
      if (!config.practiceRequired) return false; // Skip practice loop if not required
      
      const lastTrial = jsPsych.data.getLastTrialData().values()[0];
      const attempts = (window as any).practiceAttempts || 0;
      
      console.log('Practice loop check:', {
        practiceRequired: config.practiceRequired,
        practicePassed: lastTrial.practice_passed,
        attempts: attempts,
        maxAttempts: config.maxPracticeAttempts,
        shouldContinue: !lastTrial.practice_passed && attempts < config.maxPracticeAttempts
      });
      
      // Continue looping if not passed AND haven't reached max attempts yet
      return !lastTrial.practice_passed && attempts < config.maxPracticeAttempts;
    }
  };
}

// Factory function for main test component
export function createMainTest(config: any, jsPsych: any) {
  // Generate test items once and store them
  const TEST_ITEMS = generateTestItems(config.numTestItems);
  
  return {
    type: htmlButtonResponse,
    stimulus: function() {
      return `
        <div style="max-width: 1000px; margin: 0 auto;">
          <!-- Fixed Header with Key and Timer -->
          <div style="position: fixed; top: 0; left: 0; right: 0; background: white; border-bottom: 2px solid #ccc; z-index: 1000; padding: 10px;">
            <div style="max-width: 1000px; margin: 0 auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <div style="display: grid; grid-template-columns: repeat(9, 1fr); gap: 8px; font-size: 12px;">
                  ${SYMBOL_ENTRIES.map(([symbol, num]) => 
                    `<div style="border: 1px solid #ccc; padding: 4px; border-radius: 3px; text-align: center;">
                      <div style="font-size: 16px;">${symbol}</div>
                      <div style="font-weight: bold;">${num}</div>
                    </div>`
                  ).join('')}
                </div>
                <div style="font-size: 24px; font-weight: bold; color: #007bff;">
                  ${replaceText(englishText.timerLabel, `<span id="timer">${config.testDuration}</span>`)}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Main Test Content -->
          <div style="margin-top: 140px; text-align: center; padding: 20px;">
            <h2>${englishText.mainTestTitle}</h2>
            <div id="current-item" style="margin: 30px 0;">
              <div style="font-size: 72px; margin: 40px 0; padding: 30px;" id="current-symbol">${TEST_ITEMS[0].symbol}</div>
              
              ${config.useKeyboard ? `
                <!-- Keyboard input instructions -->
                <div style="margin: 20px 0;">
                  <div style="font-size: 24px; color: #007bff; font-weight: bold; margin-bottom: 10px;">${englishText.mainTestKeyboardInstructions}</div>
                  <div style="font-size: 18px; color: #666; margin-bottom: 20px;">${englishText.mainTestKeyboardDetail}</div>
                  <div style="font-size: 16px; color: #888; font-style: italic;">${englishText.mainTestKeyboardNote}</div>
                </div>
              ` : `
                <!-- Number selection buttons -->
                <div style="margin: 20px 0;">
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; max-width: 300px; margin: 0 auto;">
                    ${[1,2,3,4,5,6,7,8,9].map(num => 
                      `<button class="num-btn" data-num="${num}" 
                               style="padding: 20px; font-size: 24px; background: #f8f9fa; border: 3px solid #ccc; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                        ${num}
                      </button>`
                    ).join('')}
                  </div>
                </div>
              `}
            </div>
            
            <div style="margin: 20px 0;">
              <div>${replaceText(englishText.progressLabel, '<span id="progress">1</span>', config.numTestItems)}</div>
              <div>${replaceText(englishText.correctLabel, '<span id="correct-count">0</span>')}</div>
            </div>
          </div>
        </div>
      `;
    },
    choices: [],
    trial_duration: config.testDuration * 1000, // Convert to milliseconds
    data: { test_part: 'main_test' },
    on_load: function() {
      // Use the same test items that were generated above
      let currentIndex = 0;
      let correctCount = 0;
      let responses: any[] = [];
      let timeLeft = config.testDuration;
      let currentItemStartTime = Date.now();
      
      const timer = document.getElementById('timer')!;
      const currentSymbol = document.getElementById('current-symbol')!;
      const progressSpan = document.getElementById('progress')!;
      const correctSpan = document.getElementById('correct-count')!;
      
      // Timer countdown
      const timerInterval = setInterval(() => {
        timeLeft--;
        timer.textContent = timeLeft.toString();
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          finishTest();
        }
      }, 1000);
      
      function handleAnswer(selectedAnswer: number) {
        const processingTime = Date.now() - currentItemStartTime;
        
        // Provide visual feedback
        if (!config.useKeyboard) {
          // Highlight the button
          const btn = document.querySelector(`.num-btn[data-num="${selectedAnswer}"]`) as HTMLElement;
          if (btn) {
            btn.style.background = '#007bff';
            btn.style.borderColor = '#007bff';
            btn.style.color = 'white';
          }
        }
        
        // Process the answer and move to next item
        setTimeout(() => {
          nextItem(selectedAnswer, processingTime);
        }, 100); // Brief delay for visual feedback
      }

      if (config.useKeyboard) {
        // Keyboard event listener
        document.addEventListener('keydown', (e) => {
          const key = e.key;
          if (key >= '1' && key <= '9') {
            e.preventDefault();
            handleAnswer(parseInt(key));
          }
        });
      } else {
        // Button click event listeners
        document.querySelectorAll('.num-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const selectedAnswer = parseInt(btn.getAttribute('data-num')!);
            handleAnswer(selectedAnswer);
          });
        });
      }
      
      function nextItem(selectedAnswer: number, processingTime: number) {
        const correct = TEST_ITEMS[currentIndex].correct;
        const isCorrect = selectedAnswer === correct;
        
        responses.push({
          index: currentIndex,
          symbol: TEST_ITEMS[currentIndex].symbol,
          correct,
          response: selectedAnswer,
          isCorrect,
          processingTime,
          timestamp: Date.now()
        });
        
        if (isCorrect) {
          correctCount++;
          correctSpan.textContent = correctCount.toString();
        }
        
        currentIndex++;
        if (currentIndex >= TEST_ITEMS.length) {
          clearInterval(timerInterval);
          finishTest();
          return;
        }
        
        // Update display
        currentSymbol.textContent = TEST_ITEMS[currentIndex].symbol;
        progressSpan.textContent = (currentIndex + 1).toString();
        
        // Reset visual feedback styles and start timer for new item
        if (!config.useKeyboard) {
          document.querySelectorAll('.num-btn').forEach(b => {
            (b as HTMLElement).style.background = '#f8f9fa';
            (b as HTMLElement).style.borderColor = '#ccc';
            (b as HTMLElement).style.color = 'black';
          });
        }
        
        // Start timing for the new item
        currentItemStartTime = Date.now();
      }
      
      function finishTest() {
        // Store results in jsPsych data
        const totalAnswered = responses.length;
        const testData = {
          responses,
          total_items: totalAnswered,
          correct_count: correctCount,
          accuracy: totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0,
          time_elapsed: config.testDuration - timeLeft,
          test_part: 'main_test'
        };
        
        // Debug logging
        console.log('Finishing test with data:', testData);
        
        // Store globally as backup
        (window as any).oralSymbolDigitResults = testData;
        
        jsPsych.finishTrial(testData);
      }
    }
  };
}

// Factory function for results component
export function createResults(jsPsych: any) {
  return {
    type: htmlButtonResponse,
    stimulus: function() {
      // Try to get data from global variable first (most reliable)
      const globalData = (window as any).oralSymbolDigitResults;
      
      let correctCount = 0;
      let totalItems = 0;
      let accuracy = 0;
      let timeElapsed = 0;
      
      if (globalData) {
        correctCount = globalData.correct_count || 0;
        totalItems = globalData.total_items || 0;
        accuracy = globalData.accuracy || 0;
        timeElapsed = globalData.time_elapsed || 0;
        console.log('Using global data:', globalData);
      } else {
        // Fallback to jsPsych data
        const allTrials = jsPsych.data.get().values();
        console.log('All trials:', allTrials);
        
        // Find the main test trial by looking for the one with test_part
        let testData = allTrials.find(trial => trial.test_part === 'main_test');
        
        if (testData) {
          // Try to get data from different possible locations
          correctCount = testData.correct_count || 0;
          totalItems = testData.total_items || 0;
          accuracy = testData.accuracy || 0;
          timeElapsed = testData.time_elapsed || 0;
          
          // If still no data, check if responses array exists and calculate from it
          if (testData.responses && Array.isArray(testData.responses)) {
            totalItems = testData.responses.length;
            correctCount = testData.responses.filter((r: any) => r.isCorrect).length;
            accuracy = totalItems > 0 ? (correctCount / totalItems) * 100 : 0;
          }
        }
        
        console.log('Using jsPsych data:', testData);
      }
      
      console.log('Final results:', { correctCount, totalItems, accuracy, timeElapsed });
      
      // Calculate processing speed (items per minute)
      const itemsPerMinute = timeElapsed > 0 ? (totalItems / (timeElapsed / 60)).toFixed(1) : '0';
      
      return `
        <div style="max-width: 900px; margin: 0 auto; font-size: 18px; padding: 20px;">
          <h1 style="text-align: center; color: #333; margin-bottom: 40px;">${englishText.resultsTitle}</h1>
          
          <!-- Performance Summary -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
            <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 25px; border-radius: 15px; text-align: center;">
              <div style="font-size: 48px; font-weight: bold; margin-bottom: 10px;">${correctCount}</div>
              <div style="font-size: 16px; opacity: 0.9;">${englishText.resultsItemsCorrect}</div>
            </div>
            <div style="background: linear-gradient(135deg, #007bff, #6f42c1); color: white; padding: 25px; border-radius: 15px; text-align: center;">
              <div style="font-size: 48px; font-weight: bold; margin-bottom: 10px;">${totalItems}</div>
              <div style="font-size: 16px; opacity: 0.9;">${englishText.resultsItemsAttempted}</div>
            </div>
            <div style="background: linear-gradient(135deg, #fd7e14, #e83e8c); color: white; padding: 25px; border-radius: 15px; text-align: center;">
              <div style="font-size: 48px; font-weight: bold; margin-bottom: 10px;">${accuracy.toFixed(1)}%</div>
              <div style="font-size: 16px; opacity: 0.9;">${englishText.resultsAccuracy}</div>
            </div>
            <div style="background: linear-gradient(135deg, #6c757d, #495057); color: white; padding: 25px; border-radius: 15px; text-align: center;">
              <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">${itemsPerMinute}</div>
              <div style="font-size: 16px; opacity: 0.9;">${englishText.resultsItemsPerMinute}</div>
            </div>
          </div>
          
          <!-- Detailed Breakdown -->
          <div style="background: #f8f9fa; padding: 30px; border-radius: 15px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-bottom: 20px; text-align: center;">Test Performance Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
              <div>
                <h4 style="color: #666; margin-bottom: 15px;">Timing</h4>
                <ul style="list-style: none; padding: 0;">
                  <li style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                    <strong>Total Time:</strong> ${timeElapsed} seconds
                  </li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                    <strong>Average per Item:</strong> ${totalItems > 0 ? (timeElapsed / totalItems).toFixed(1) : '0'} seconds
                  </li>
                  <li style="padding: 8px 0;">
                    <strong>Processing Speed:</strong> ${itemsPerMinute} items/min
                  </li>
                </ul>
              </div>
              <div>
                <h4 style="color: #666; margin-bottom: 15px;">Accuracy</h4>
                <ul style="list-style: none; padding: 0;">
                  <li style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                    <strong>Correct Responses:</strong> ${correctCount}
                  </li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                    <strong>Incorrect/Skipped:</strong> ${totalItems - correctCount}
                  </li>
                  <li style="padding: 8px 0;">
                    <strong>Success Rate:</strong> ${accuracy.toFixed(1)}%
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Performance Interpretation -->
          <div style="background: ${accuracy >= 90 ? '#d4edda' : accuracy >= 70 ? '#fff3cd' : '#f8d7da'}; 
                      padding: 25px; border-radius: 15px; margin-bottom: 30px;
                      border-left: 5px solid ${accuracy >= 90 ? '#28a745' : accuracy >= 70 ? '#ffc107' : '#dc3545'};">
            <h4 style="margin-bottom: 15px; color: ${accuracy >= 90 ? '#155724' : accuracy >= 70 ? '#856404' : '#721c24'};">
              Performance Assessment
            </h4>
            <p style="margin: 0; color: ${accuracy >= 90 ? '#155724' : accuracy >= 70 ? '#856404' : '#721c24'};">
              ${accuracy >= 90 
                ? 'Excellent performance! You demonstrated strong symbol-digit processing speed and accuracy.' 
                : accuracy >= 70 
                ? 'Good performance! You showed solid symbol-digit processing abilities with room for improvement.'
                : 'This test measures processing speed. Consider practicing symbol-number associations to improve performance.'}
            </p>
          </div>
          
          <div style="text-align: center;">
            <p style="color: #666; margin-bottom: 20px;">
              Click below to view the complete data breakdown.
            </p>
          </div>
        </div>
      `;
    },
    choices: [englishText.viewCompleteDataButton]
  };
}

// Factory function for data view component
export function createDataView(jsPsych: any) {
  return {
    type: htmlButtonResponse,
    stimulus: function() {
      const allData = jsPsych.data.get().values();
      return `
        <div style="max-width: 100%; margin: 0; padding: 10px; font-family: monospace; font-size: 10px;">
          <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 0;">${JSON.stringify(allData, null, 2)}</pre>
        </div>
      `;
    },
    choices: [englishText.finishButton]
  };
}

export const timelineUnits = {
  // Data
  SYMBOL_MAP,
  PRACTICE_ITEMS,
  SYMBOLS,
  SYMBOL_ENTRIES,
  
  // Factory functions for timeline components
  createInstructions,
  createPractice,
  createPracticeResults,
  createPracticeLoop,
  createPreTest, 
  createMainTest,
  createThankYou,
  createResults,
  createDataView,
  
  // Helper functions
  generateTestItems,
  generatePracticeItems: (numItems: number) => generateTestItems(numItems)
}

export const utils = {
  // Text helpers
  replaceText,
  formatDuration,
  
  // Symbol helpers  
  getSymbolForNumber: (num: number) => SYMBOLS.find(s => SYMBOL_MAP[s as keyof typeof SYMBOL_MAP] === num),
  getNumberForSymbol: (symbol: string) => SYMBOL_MAP[symbol as keyof typeof SYMBOL_MAP],
  
  // Data generators
  generateTestItems,
  
  // Timeline factory functions (also available directly from timelineUnits)
  createInstructions,
  createPractice,
  createPracticeResults,
  createPracticeLoop,
  createPreTest,
  createMainTest,
  createThankYou,
  createResults,
  createDataView,
  
  // Constants
  SYMBOLS,
  SYMBOL_ENTRIES,
  SYMBOL_MAP,
  PRACTICE_ITEMS
}

export type { OralSymbolDigitOptions }