import { JsPsych } from "jspsych"
import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { englishText, instruction_pages } from "./text";


interface GoNoGoConfig {
  goStimulus?: string
  noGoStimulus?: string
  goStimuli?: string[]
  noGoStimuli?: string[]
  buttonText?: string
  stimulusDisplayTime?: number
  responseTimeout?: number
  interTrialInterval?: number
  numBlocks?: number
  trialsPerBlock?: number
  goTrialProbability?: number
  showResultsDetails?: boolean
  colorText?: boolean
  showDebrief?: boolean
}

// Helper function to format stimulus as HTML
const createFormatStimulus = (colorText: boolean = false) => 
  (stimulus: string, isGoTrial: boolean): string => {
    const color = colorText ? (isGoTrial ? englishText.goColor : englishText.noGoColor) : 'black'
    const borderStyle = colorText ? `border: 3px solid ${color};` : ''
    
    return `
      <div class="go-nogo-container timeline-trial"><h1 id="go-nogo-stimulus" style="color: ${color}; ${borderStyle}">${stimulus}</h1></div>`
  }

const createGoInstructionTrial = (goStimulus: string, formatStimulus: (stimulus: string, isGoTrial: boolean) => string, jsPsych: JsPsych, texts = englishText) => {
  const goExample = formatStimulus(goStimulus, true)
  
  return {
    type: htmlButtonResponse,
    stimulus: `
     
            <p>${texts.goPageContent}</p>
            ${goExample}

            <div class="timeline-btn-container">
              <button id="go-nogo-btn" class="continue-btn timeline-html-btn jspsych-btn">
                ${texts.defaultButtonText}
              </button>
            </div>

          <div id="feedback-container" class="go-nogo-feedback" style="visibility: hidden;"><span>Good job!</span></div>

    `,
    choices: [],
    trial_duration: null,
    response_ends_trial: false,
    on_load: () => {
      const buttons = document.querySelectorAll(".jspsych-btn-group-grid");
      buttons.forEach((btn) => {
        if (btn.id == "jspsych-html-button-response-btngroup") {
          (btn as HTMLElement).style.display = "none";
        }
      });

      let practiceCompleted = false;
      
      function showFeedback(message: string, isCorrect: boolean) {
        const feedbackEl = document.getElementById('feedback-container');
        if (feedbackEl) {
          feedbackEl.innerHTML = message;
          feedbackEl.style.color = isCorrect ? '#28a745' : '#dc3545';
          feedbackEl.style.visibility = 'visible';
          
          setTimeout(() => {
            if (practiceCompleted) {
            jsPsych.finishTrial();
            }
          }, 2000);
        }
      }
      
      const practiceButton = document.getElementById('go-nogo-btn');
      if (practiceButton) {
        practiceButton.addEventListener('click', function() {
          if (!practiceCompleted) {
            practiceCompleted = true;
            (practiceButton as HTMLButtonElement).disabled = true;
            practiceButton.style.opacity = '0.5';
            
            showFeedback(texts.goodJobMessage, true);
          }
        });
      }
    },
    data: { task: 'go-no-go', phase: 'go-practice' }
  }
}

const createNoGoInstructionTrial = (noGoStimulus: string, formatStimulus: (stimulus: string, isGoTrial: boolean) => string, jsPsych: JsPsych, texts = englishText) => {
  const noGoExample = formatStimulus(noGoStimulus, false)
  
  return {
    type: htmlButtonResponse,
    stimulus: `
            <p>${texts.noGoPageContent}</p>
              ${noGoExample}
            <div class="timeline-btn-container jspsych-btn-group-grid">
              <button id="go-nogo-btn" class="continue-btn timeline-html-btn jspsych-btn">
                ${texts.defaultButtonText}
              </button>
            </div>

          <div id="feedback-container" class="go-nogo-feedback" style="visibility: hidden;"><span>Good job!</span></div>
    `,
    choices: [],
    trial_duration: null,
    response_ends_trial: false,
    on_load: () => {
      const buttons = document.querySelectorAll(".jspsych-btn-group-grid");
      buttons.forEach((btn) => {
        if (btn.id == "jspsych-html-button-response-btngroup") {
          (btn as HTMLElement).style.display = "none";
        }
      });

      let practiceCompleted = false;
      let clicked = false;
      let startTime = Date.now();
      
      function showFeedback(message: string, isCorrect: boolean) {
        const feedbackEl = document.getElementById('feedback-container');
        if (feedbackEl) {
          feedbackEl.innerHTML = message;
          feedbackEl.style.color = isCorrect ? '#28a745' : '#dc3545';
          feedbackEl.style.visibility = 'visible';
        }
      }
      
      function checkAndAdvance() {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= 3000 && !practiceCompleted) {
          practiceCompleted = true;
          const practiceButton = document.getElementById('go-nogo-btn');
          if (practiceButton) {
            (practiceButton as HTMLButtonElement).disabled = true;
            practiceButton.style.opacity = '0.5';
          }
          
          if (clicked) {
            showFeedback(texts.rememberNoGo, false);
          } else {
            showFeedback(texts.noGoFeedbackMessage, true);
            const readyMessage = document.getElementById('ready-message');
            if (readyMessage) {
              readyMessage.style.display = 'block';
            }
          }
          
          setTimeout(() => {
            jsPsych.finishTrial();
          }, 2000);
        }
      }
      
      const practiceButton = document.getElementById('go-nogo-btn');
      if (practiceButton) {
        practiceButton.addEventListener('click', function() {
          if (!practiceCompleted) {
            clicked = true;
            practiceCompleted = true;
            (practiceButton as HTMLButtonElement).disabled = true;
            practiceButton.style.opacity = '0.5';
            
            showFeedback(texts.rememberNoGo, false);
            
            setTimeout(() => {
              jsPsych.finishTrial();
            }, 2000);
          }
        });
      }
      
      const checkInterval = setInterval(() => {
        if (practiceCompleted) {
          clearInterval(checkInterval);
        } else {
          checkAndAdvance();
        }
      }, 100);
    },
    data: { task: 'go-no-go', phase: 'nogo-practice' }
  }
}

const createPracticeCompletionTrial = (texts = englishText) => {
  return {
    type: htmlButtonResponse,
    stimulus: `
        <div class="go-nogo-practice">
          <p>${texts.practiceCompleteContent}<p>
        </div>
    `,
    choices: [texts.beginTaskButton],
    data: { task: 'go-no-go', phase: 'practice-complete' },
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
    on_load: () => {
      // Add timeline-btn-container class to button group
      const buttonGroup = document.querySelector('.jspsych-btn-group-grid');
      if (buttonGroup) {
        buttonGroup.classList.add('timeline-btn-container');
      }
    }
  }
}

const createGoNoGoTrial = (jsPsych: JsPsych, buttonText: string, responseTimeout: number) => {
  return {
    type: htmlButtonResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: [buttonText],
    trial_duration: responseTimeout,
    response_ends_trial: true,
    data: {
      task: 'go-no-go',
      phase: 'main-trial'
    },
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="continue-btn timeline-html-btn jspsych-btn">${choice}</button>`,
    on_load: () => {
      // Add timeline-btn-container class to button group
      const buttonGroup = document.querySelector('.jspsych-btn-group-grid');
      if (buttonGroup) {
        buttonGroup.classList.add('timeline-btn-container');
      }
    },
    on_finish: (data: any) => {
      const isGoTrial = data.stimulus_type === 'go'
      const responded = data.response !== null && data.response !== undefined
      
      if (isGoTrial) {
        data.correct = responded
        data.accuracy = responded ? 1 : 0
      } else {
        data.correct = !responded
        data.accuracy = !responded ? 1 : 0
      }
      
      data.reaction_time = responded && isGoTrial && data.rt ? data.rt : null
    }
  }
}

const createInterTrialIntervalTrial = (interTrialInterval: number) => {
  return {
    type: htmlButtonResponse,
    stimulus: '',
    choices: [],
    trial_duration: interTrialInterval,
    response_ends_trial: false
  }
}

const createGenerateTrialsForBlock = (trialsPerBlock: number, goTrialProbability: number, actualGoStimuli: string[], actualNoGoStimuli: string[], formatStimulus: (stimulus: string, isGoTrial: boolean) => string) => {
  return (blockNumber: number) => {
    const trials = []
    let goTrialCount = 0
    let noGoTrialCount = 0
    
    for (let i = 0; i < trialsPerBlock; i++) {
      const randomValue = Math.random()
      const isGoTrial = randomValue < goTrialProbability
      
      let stimulus: string
      if (isGoTrial) {
        const stimulusIndex = goTrialCount % actualGoStimuli.length
        stimulus = actualGoStimuli[stimulusIndex]
        goTrialCount++
      } else {
        const stimulusIndex = noGoTrialCount % actualNoGoStimuli.length
        stimulus = actualNoGoStimuli[stimulusIndex]
        noGoTrialCount++
      }
      
      trials.push({
        stimulus: formatStimulus(stimulus, isGoTrial),
        trial_type: isGoTrial ? 'go' : 'no-go',
        correct_response: isGoTrial ? 0 : null,
        block: blockNumber
      })
    }
    return trials
  }
}

const createBlockBreak = (blockNum: number, numBlocks: number) => {
  return {
    type: htmlButtonResponse,
    stimulus: `
            <p>${englishText.blockBreakContent(blockNum, numBlocks)}</p>
    `,
    choices: [englishText.continueButton],
    data: { task: 'go-no-go', phase: 'block-break' },
    button_html: (choice, choice_index) => `<button id="block-break-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
    on_load: () => {
      // Add timeline-btn-container class to button group
      const buttonGroup = document.querySelector('.jspsych-btn-group-grid');
      if (buttonGroup) {
        buttonGroup.classList.add('timeline-btn-container');
      }
    }
  }
}

const createDebriefTrial = (jsPsych: JsPsych, showResultsDetails: boolean) => {
  return {
    type: htmlButtonResponse,
    stimulus: () => {
      if (!showResultsDetails) {
        return `
            <div class="go-nogo-debrief">
              <h2>${englishText.taskComplete}</h2>
              <p>${englishText.thankYouMessage}</p>
            </div>
        `
      }

      const allData = jsPsych.data.get()
      
      const allTrials = allData.values()
      const goNoGoTrials = allTrials.filter((trial: any) => trial.stimulus_type === englishText.stimulusTypes.go || trial.stimulus_type === englishText.stimulusTypes.noGo)
      
      let accuracy = 0
      let meanRT = 0
      
      if (goNoGoTrials.length > 0) {
        const accuracyValues = goNoGoTrials.map((trial: any) => trial.accuracy).filter((val: any) => val === 1 || val === 0)
        const numCorrect = accuracyValues.filter((val: any) => val === 1).length
        accuracy = accuracyValues.length > 0 ? Math.round((numCorrect / accuracyValues.length) * 100) : 0
        
        const goTrials = goNoGoTrials.filter((trial: any) => trial.stimulus_type === englishText.stimulusTypes.go && trial.response !== null && trial.response !== undefined)
        if (goTrials.length > 0) {
          const rtValues = goTrials.map((trial: any) => trial.rt).filter((val: any) => val !== null && val !== undefined && val > 0)
          meanRT = rtValues.length > 0 ? Math.round(rtValues.reduce((a: number, b: number) => a + b, 0) / rtValues.length) : 0
        }
      }
      
      return `
          <div class="go-nogo-debrief">
            <h2>${englishText.taskComplete}</h2>
              <p><strong>${englishText.overallAccuracy}</strong> ${accuracy}%</p>
              <p><strong>${englishText.averageResponseTime}</strong> ${meanRT}ms</p>
            <p>${englishText.thankYouMessage}</p>
          </div>
      `
    },
    choices: [englishText.finishButton],
    data: { task: 'go-no-go', phase: 'debrief' },
    button_html: (choice, choice_index) => `<button id="debrief-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
    on_load: () => {
      // Add timeline-btn-container class to button group
      const buttonGroup = document.querySelector('.jspsych-btn-group-grid');
      if (buttonGroup) {
        buttonGroup.classList.add('timeline-btn-container');
      }
    }
  }
}


export function createInstructions(instructions: string[] = instruction_pages, texts = englishText) {
  if (instructions.length === 0) {
    instructions = instruction_pages;
  }
  return {
    type: jsPsychInstructions,
    pages: instructions.map(page => `<div class="timeline-instructions"><p>${page}</p></div>`),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: 'ArrowRight',
    key_backward: 'ArrowLeft',
    button_label_previous: texts?.back_button ?? texts.back_button,
    button_label_next: texts?.next_button ?? texts.next_button,
    data: {
      task: 'go-no-go',
      phase: 'instructions'
    }
  };
}

export function createTimeline(jsPsych: JsPsych, config: GoNoGoConfig = {}) {
  const {
    goStimulus,
    noGoStimulus,
    goStimuli,
    noGoStimuli,
    buttonText = englishText.defaultButtonText,
    responseTimeout = 500,
    interTrialInterval = 500,
    numBlocks = 3,
    trialsPerBlock = 50,
    goTrialProbability = 0.75,
    showResultsDetails = false,
    colorText,
    showDebrief = false,
  } = config

  const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [englishText.defaultGoStimulus])
  const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [englishText.defaultNoGoStimulus])

  const useColors = !!colorText
  const formatStimulus = createFormatStimulus(useColors)
  
  const goNoGoTrial = createGoNoGoTrial(jsPsych, buttonText, responseTimeout)
  const interTrialIntervalTrial = createInterTrialIntervalTrial(interTrialInterval)

  const generateTrialsForBlock = createGenerateTrialsForBlock(trialsPerBlock, goTrialProbability, actualGoStimuli, actualNoGoStimuli, formatStimulus)

  // Generate blocks
  const blocks = []
  for (let blockNum = 1; blockNum <= numBlocks; blockNum++) {
    const blockTrials = generateTrialsForBlock(blockNum)
    
    // Add block trials
    const blockProcedure = {
      timeline: [goNoGoTrial, interTrialIntervalTrial],
      timeline_variables: blockTrials,
      randomize_order: true
    }
    blocks.push(blockProcedure)
    
    // Add block break page between blocks (except after last block)
    if (blockNum < numBlocks) {
      const blockBreakTrial = createBlockBreak(blockNum, numBlocks)
      blocks.push(blockBreakTrial)
    }
  }

  const timeline = [...blocks]
  
  if (showDebrief) {
    const debriefTrial = createDebriefTrial(jsPsych, showResultsDetails)
    timeline.push(debriefTrial)
  }

  return {
    timeline
  }
}

export const timelineUnits = {
  practiceTrial: (jsPsych: JsPsych, config: GoNoGoConfig = {}, texts = englishText) => {
    const {
      goStimulus,
      noGoStimulus,
      goStimuli,
      noGoStimuli,
      colorText
    } = config

    const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [texts.defaultGoStimulus])
    const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [texts.defaultNoGoStimulus])
    const useColors = !!colorText // true -> colored, false (undefined/null/false) -> black

    const formatStimulus = createFormatStimulus(useColors)

    const goInstructionTrial = createGoInstructionTrial(actualGoStimuli[0], formatStimulus, jsPsych, texts)
    const noGoInstructionTrial = createNoGoInstructionTrial(actualNoGoStimuli[0], formatStimulus, jsPsych, texts)
    const practiceCompletionTrial = createPracticeCompletionTrial(texts)
    
    return [goInstructionTrial, noGoInstructionTrial, practiceCompletionTrial]
  },
  goNoGoTrial: (jsPsych: JsPsych, config: GoNoGoConfig = {}) => {
    const {
      goStimulus,
      noGoStimulus,
      goStimuli,
      noGoStimuli,
      buttonText = englishText.defaultButtonText,
      responseTimeout = 1500,
      interTrialInterval = 500,
      trialsPerBlock = 50,
      goTrialProbability = 0.75,
      colorText
    } = config
    
    const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [englishText.defaultGoStimulus])
    const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [englishText.defaultNoGoStimulus])
    const useColors = !!colorText

    const goNoGoTrial = createGoNoGoTrial(jsPsych, buttonText, responseTimeout)
    const interTrialIntervalTrial = createInterTrialIntervalTrial(interTrialInterval)
    const generateTrialsForBlock = createGenerateTrialsForBlock(trialsPerBlock, goTrialProbability, actualGoStimuli, actualNoGoStimuli, createFormatStimulus(useColors))
    
    return { trial: goNoGoTrial, interTrialInterval: interTrialIntervalTrial, generateTrialsForBlock }
  },
  debriefTrial: (jsPsych: JsPsych, config: GoNoGoConfig = {}) => {
    const { showResultsDetails = true } = config
    return createDebriefTrial(jsPsych, showResultsDetails)
  }
}

export const utils = {}