import { JsPsych } from "jspsych"
import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { englishText, instructions_pages } from "./text";


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
  varyStimulus?: boolean
  showResultsDetails?: boolean
  colorBorders?: boolean
  colorText?: boolean
  showDebrief?: boolean
}

// Helper function to format stimulus as HTML
const createFormatStimulus = (colorText: boolean = false) => 
  (stimulus: string, isGoTrial: boolean): string => {
    const color = colorText ? (isGoTrial ? englishText.goColor : englishText.noGoColor) : 'black'
    const borderStyle = colorText ? `border: 3px solid ${color};` : ''
    
    return `
      <div style= "color: ${color}; ${borderStyle}" class="go-nogo-stimulus-content">${stimulus}</div>`
  }

const createGoInstructionTrial = (goStimulus: string, buttonText: string, formatStimulus: (stimulus: string, isGoTrial: boolean) => string, jsPsych: JsPsych) => {
  const goExample = formatStimulus(goStimulus, true)
  
  return {
    type: htmlButtonResponse,
    stimulus: `
     
            <p>${englishText.goPageContent}</p>
          
            <div class="go-nogo-stimulus-container timeline-trial">
              ${goExample}
            </div>
              <button id="practice-button" class="jspsych-btn timeline-html-btn">
                ${buttonText}
              </button>
        
          <div id="feedback-container" class="go-nogo-feedback"></div>

    `,
    choices: [],
    trial_duration: null,
    response_ends_trial: false,
    on_start: () => {
      setTimeout(() => {
        const buttons = document.querySelectorAll('.jspsych-btn');
        buttons.forEach(btn => {
          if (btn.id !== 'practice-button') {
            (btn as HTMLElement).style.display = 'none';
          }
        });
      }, 50);
    },
    on_load: () => {
      let practiceCompleted = false;
      
      function showFeedback(message: string, isCorrect: boolean) {
        const feedbackEl = document.getElementById('feedback-container');
        if (feedbackEl) {
          feedbackEl.innerHTML = message;
          feedbackEl.style.color = isCorrect ? '#28a745' : '#dc3545';
          
          setTimeout(() => {
            if (practiceCompleted) {
              jsPsych.finishTrial();
            }
          }, 2000);
        }
      }
      
      const practiceButton = document.getElementById('practice-button');
      if (practiceButton) {
        practiceButton.addEventListener('click', function() {
          if (!practiceCompleted) {
            practiceCompleted = true;
            (practiceButton as HTMLButtonElement).disabled = true;
            practiceButton.style.opacity = '0.5';
            
            showFeedback('Good job!', true);
          }
        });
      }
    },
    data: { trial_type: englishText.trialTypes.instructions }
  }
}

const createNoGoInstructionTrial = (noGoStimulus: string, buttonText: string, formatStimulus: (stimulus: string, isGoTrial: boolean) => string, jsPsych: JsPsych) => {
  const noGoExample = formatStimulus(noGoStimulus, false)
  
  return {
    type: htmlButtonResponse,
    stimulus: `
      <style>
        .go-nogo-instruction-page {
          font-size: 18px;
          line-height: 1.5;
          max-width: 600px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .go-nogo-instruction-header {
          text-align: center;
          color: #dc3545;
          margin-bottom: 20px;
        }
        .go-nogo-instruction-content {
          text-align: center;
          margin: 20px 0;
        }
        .go-nogo-instruction-action {
          color: #dc3545;
          font-weight: bold;
          font-size: 20px;
        }
        .go-nogo-trial-container {
          text-align: center;
          margin: 30px 0;
          min-height: 180px;
        }
        .go-nogo-stimulus-container {
          margin: 15px 0;
        }
        .go-nogo-feedback {
          text-align: center;
          margin: 15px 0;
          min-height: 40px;
          font-weight: bold;
          font-size: 18px;
        }
        .go-nogo-ready-message {
          text-align: center;
          margin-top: 20px;
          display: none;
        }
        .go-nogo-ready-text {
          font-weight: bold;
          color: #28a745;
        }
        @media (max-width: 768px) {
          .go-nogo-instruction-page {
            font-size: 14px;
            line-height: 1.3;
            padding: 5px 15px;
          }
          .go-nogo-instruction-header {
            font-size: 18px;
            margin-bottom: 8px;
          }
          .go-nogo-instruction-content {
            margin: 8px 0;
          }
          .go-nogo-instruction-content p {
            margin: 4px 0;
          }
          .go-nogo-instruction-action {
            font-size: 16px;
          }
          .go-nogo-trial-container {
            margin: 10px 0;
            min-height: 100px;
          }
          .go-nogo-stimulus-container {
            margin: 8px 0;
          }
          .go-nogo-feedback {
            margin: 8px 0;
            min-height: 25px;
            font-size: 14px;
          }
          .go-nogo-ready-message {
            margin-top: 10px;
          }
        }
      </style>
            <p>${englishText.noGoPageContent}</p>
          
            <div class="go-nogo-stimulus-container timeline-trial">
              ${noGoExample}
            </div>
              <button id="practice-button" class="jspsych-btn timeline-html-btn">
                ${buttonText}
              </button>
          
          <div id="feedback-container" class="go-nogo-feedback"></div>

    `,
    choices: [],
    trial_duration: null,
    response_ends_trial: false,
    on_start: () => {
      setTimeout(() => {
        const buttons = document.querySelectorAll('.jspsych-btn');
        buttons.forEach(btn => {
          if (btn.id !== 'practice-button') {
            (btn as HTMLElement).style.display = 'none';
          }
        });
      }, 50);
    },
    on_load: () => {
      let practiceCompleted = false;
      let clicked = false;
      let startTime = Date.now();
      
      function showFeedback(message: string, isCorrect: boolean) {
        const feedbackEl = document.getElementById('feedback-container');
        if (feedbackEl) {
          feedbackEl.innerHTML = message;
          feedbackEl.style.color = isCorrect ? '#28a745' : '#dc3545';
        }
      }
      
      function checkAndAdvance() {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= 3000 && !practiceCompleted) {
          practiceCompleted = true;
          const practiceButton = document.getElementById('practice-button');
          if (practiceButton) {
            (practiceButton as HTMLButtonElement).disabled = true;
            practiceButton.style.opacity = '0.5';
          }
          
          if (clicked) {
            showFeedback('Remember you are not supposed to click for NO-GO stimulus', false);
          } else {
            showFeedback(englishText.noGoFeedbackMessage, true);
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
      
      const practiceButton = document.getElementById('practice-button');
      if (practiceButton) {
        practiceButton.addEventListener('click', function() {
          if (!practiceCompleted) {
            clicked = true;
            showFeedback('Remember you are not supposed to click for NO-GO stimulus', false);
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
    data: { trial_type: englishText.trialTypes.instructions }
  }
}

const createPracticeCompletionTrial = () => {
  return {
    type: htmlButtonResponse,
    stimulus: `
      <div class="timeline-trial">
        <div class="go-nogo-practice-complete">
          <p>${englishText.practiceCompleteContent}<p>
        </div>
      </div>
    `,
    choices: [englishText.beginTaskButton],
    data: { trial_type: englishText.trialTypes.instructions },
    on_load: () => {
      // Wrap the button in timeline-html-btn class
      setTimeout(() => {
        const button = document.querySelector('.jspsych-btn');
        if (button && !button.parentElement?.classList.contains('timeline-html-btn')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'timeline-html-btn';
          button.parentNode?.insertBefore(wrapper, button);
          wrapper.appendChild(button);
        }
      }, 50);
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
      trial_type: englishText.trialTypes.goNoGo,
      stimulus_type: jsPsych.timelineVariable('trial_type'),
      correct_response: jsPsych.timelineVariable('correct_response')
    },
    on_load: () => {
      // Add global button styling (applies to practice and main trial buttons)
      if (!document.getElementById('go-nogo-global-button-styles')) {
        const style = document.createElement('style');
        style.id = 'go-nogo-global-button-styles';
        style.textContent = `
          .jspsych-btn {
            text-align: center !important;
            display: block !important;
            margin: 15px auto !important;
            padding: 12px 20px !important;
            white-space: normal !important;
            word-wrap: break-word !important;
            min-width: 120px !important;
            width: auto !important;
            max-width: 90% !important;
            line-height: 1.4 !important;
          }
          @media (max-width: 768px) {
            .jspsych-btn {
              padding: 15px 20px !important;
              font-size: 16px !important;
              min-height: 50px !important;
              width: auto !important;
              max-width: 95% !important;
              margin: 15px auto !important;
              white-space: normal !important;
              word-wrap: break-word !important;
              line-height: 1.2 !important;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Wrap main task button in timeline-html-btn class
      setTimeout(() => {
        const button = document.querySelector('.jspsych-btn');
        if (button && !button.parentElement?.classList.contains('timeline-html-btn')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'timeline-html-btn';
          button.parentNode?.insertBefore(wrapper, button);
          wrapper.appendChild(button);
        }
      }, 50);
    },
    on_finish: (data: any) => {
      const isGoTrial = data.stimulus_type === englishText.stimulusTypes.go
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
        trial_type: isGoTrial ? englishText.stimulusTypes.go : englishText.stimulusTypes.noGo,
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
    data: { trial_type: 'block-break', block: blockNum },
    on_load: () => {
      // Wrap the button in timeline-html-btn class
      setTimeout(() => {
        const button = document.querySelector('.jspsych-btn');
        if (button && !button.parentElement?.classList.contains('timeline-html-btn')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'timeline-html-btn';
          button.parentNode?.insertBefore(wrapper, button);
          wrapper.appendChild(button);
        }
      }, 50);
    }
  }
}

const createDebriefTrial = (jsPsych: JsPsych, showResultsDetails: boolean) => {
  return {
    type: htmlButtonResponse,
    stimulus: () => {
      if (!showResultsDetails) {
        return `
          <div class="timeline-trial">
            <div class="go-nogo-debrief">
              <h2>${englishText.taskComplete}</h2>
              <p>${englishText.thankYouMessage}</p>
            </div>
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
        <div class="timeline-trial">
          <div class="go-nogo-debrief">
            <h2>${englishText.taskComplete}</h2>
            <div class="go-nogo-debrief-results">
              <p><strong>${englishText.overallAccuracy}</strong> ${accuracy}%</p>
              <p><strong>${englishText.averageResponseTime}</strong> ${meanRT}ms</p>
            </div>
            <p>${englishText.thankYouMessage}</p>
          </div>
        </div>
      `
    },
    choices: [englishText.finishButton],
    data: { trial_type: englishText.trialTypes.debrief },
    on_load: () => {
      // Wrap the button in timeline-html-btn class
      setTimeout(() => {
        const button = document.querySelector('.jspsych-btn');
        if (button && !button.parentElement?.classList.contains('timeline-html-btn')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'timeline-html-btn';
          button.parentNode?.insertBefore(wrapper, button);
          wrapper.appendChild(button);
        }
      }, 50);
    }
  }
}


export function createInstructions(_jsPsych?: JsPsych, _config: any = {}) {
  // Use default instruction pages - config parameter reserved for future use
  const pages = instructions_pages;
  
  return {
    type: jsPsychInstructions,
    pages: pages.map(page => `
      <div class="timeline-trial">
        <div class="instructions-container"><p>${page}</p></div>
      </div>
    `),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: 'ArrowRight',
    key_backward: 'ArrowLeft',
    button_label_previous: '',
    button_label_next: '',
    data: {
      task: 'go-nogo',
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
    colorBorders,
    colorText,
    showDebrief = false,
  } = config

  // Handle backward compatibility for single stimulus parameters
  const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [englishText.defaultGoStimulus])
  const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [englishText.defaultNoGoStimulus])
  
  // Handle backward compatibility for colorBorders parameter
  const useColors = colorText !== undefined ? colorText : (colorBorders !== undefined ? colorBorders : false)
  
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
  practiceTrial: (jsPsych: JsPsych, config: GoNoGoConfig = {}) => {
    const {
      goStimulus,
      noGoStimulus,
      goStimuli,
      noGoStimuli,
      buttonText = englishText.defaultButtonText,
      colorBorders,
      colorText
    } = config

    const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [englishText.defaultGoStimulus])
    const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [englishText.defaultNoGoStimulus])
    const useColors = colorText !== undefined ? colorText : (colorBorders !== undefined ? colorBorders : false)
    
    const formatStimulus = createFormatStimulus(useColors)
    
    const goInstructionTrial = createGoInstructionTrial(actualGoStimuli[0], buttonText, formatStimulus, jsPsych)
    const noGoInstructionTrial = createNoGoInstructionTrial(actualNoGoStimuli[0], buttonText, formatStimulus, jsPsych)
    const practiceCompletionTrial = createPracticeCompletionTrial()
    
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
      colorBorders,
      colorText
    } = config
    
    const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [englishText.defaultGoStimulus])
    const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [englishText.defaultNoGoStimulus])
    const useColors = colorText !== undefined ? colorText : (colorBorders !== undefined ? colorBorders : false)
    
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

export const utils = {
  calculateAccuracy: (data: any) => {
    const goNoGoData = data.filter({ trial_type: englishText.trialTypes.goNoGo })
    return goNoGoData.select(englishText.dataProperties.accuracy).mean()
  },
  
  calculateMeanRT: (data: any) => {
    const goTrials = data.filter({ trial_type: englishText.trialTypes.goNoGo, stimulus_type: englishText.stimulusTypes.go })
    return goTrials.select(englishText.dataProperties.rt).mean()
  }
}