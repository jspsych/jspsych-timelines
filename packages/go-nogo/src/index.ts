import { JsPsych } from "jspsych"
import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import { englishText } from "./text";


interface GoNoGoConfig {
  goStimulus?: string
  noGoStimulus?: string
  buttonText?: string
  stimulusDisplayTime?: number
  responseTimeout?: number
  interTrialInterval?: number
  numBlocks?: number
  trialsPerBlock?: number
  goTrialProbability?: number
  showResultsDetails?: boolean
  stimulusType?: 'text' | 'image' | 'mixed'
  imageWidth?: number
  imageHeight?: number
}

export function createTimeline(jsPsych: JsPsych, config: GoNoGoConfig = {}) {
  const {
    goStimulus = englishText.defaultGoStimulus,
    noGoStimulus = englishText.defaultNoGoStimulus,
    buttonText = englishText.defaultButtonText,
    responseTimeout = 1500,
    interTrialInterval = 500,
    numBlocks = 3,
    trialsPerBlock = 50,
    goTrialProbability = 0.75,
    showResultsDetails = true,
    stimulusType = 'mixed',
    imageWidth = 200,
    imageHeight = 200
  } = config

  // Use single stimuli directly
  
  // Helper function to detect if stimulus is an image path
  const isImagePath = (stimulus: string): boolean => {
    if (stimulusType === 'text') return false
    if (stimulusType === 'image') return true
    // For 'mixed' type, detect based on file extension
    const imageExtensions = /\.(jpg|jpeg|png|gif|svg|webp)$/i
    return imageExtensions.test(stimulus)
  }
  
  // Helper function to format stimulus as HTML
  const formatStimulus = (stimulus: string, isGoTrial: boolean): string => {
    const color = isGoTrial ? englishText.goColor : englishText.noGoColor
    
    if (isImagePath(stimulus)) {
      return `<img src="${stimulus}" style="width: ${imageWidth}px; height: ${imageHeight}px; border: 3px solid ${color}; object-fit: contain;" alt="${isGoTrial ? englishText.goStimulusAlt : englishText.noGoStimulusAlt}" />`
    } else {
      return `<div style="font-size: 48px; font-weight: bold; color: ${color}">${stimulus}</div>`
    }
  }
  
  const createOverviewInstructionTrial = () => {
    return {
      type: htmlButtonResponse,
      stimulus: `
        <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto; text-align: center;">
          <p>${englishText.overviewText}</p>
          <p>${englishText.overviewPrompt}</p>
        </div>
      `,
      choices: [englishText.nextButton],
      data: { trial_type: englishText.trialTypes.instructions }
    }
  }

  const createGoInstructionTrial = () => {
    const goExample = formatStimulus(goStimulus, true)
    
    return {
      type: htmlButtonResponse,
      stimulus: `
        <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
          <h2 style="text-align: center; color: #28a745;">${englishText.goPageTitle}</h2>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>${englishText.goPageText}</p>
            <p style="color: #28a745; font-weight: bold; font-size: 20px;">${englishText.goPageAction}</p>
            <p style="margin: 20px 0;">${englishText.goPageInstructions}</p>
          </div>
          
          <div id="trial-container" style="text-align: center; margin: 40px 0; min-height: 200px;">
            <div style="margin: 20px 0;">
              ${goExample}
            </div>
            <button id="practice-button" class="jspsych-btn" style="margin: 10px 0;">
              ${buttonText}
            </button>
          </div>
          
          <div id="feedback-container" style="text-align: center; margin: 20px 0; min-height: 50px; font-weight: bold; font-size: 18px;"></div>
        </div>
      `,
      choices: [],
      trial_duration: null,
      response_ends_trial: false,
      on_start: () => {
        // Hide jsPsych navigation immediately
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
                // Manually end trial
                jsPsych.finishTrial();
              }
            }, 2000);
          }
        }
        
        // Set up practice button click handler
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

  const createNoGoInstructionTrial = () => {
    const noGoExample = formatStimulus(noGoStimulus, false)
    
    return {
      type: htmlButtonResponse,
      stimulus: `
        <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
          <h2 style="text-align: center; color: #dc3545;">${englishText.noGoPageTitle}</h2>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>${englishText.noGoPageText}</p>
            <p style="color: #dc3545; font-weight: bold; font-size: 20px;">${englishText.noGoPageAction}</p>
            <p style="margin: 20px 0;">${englishText.noGoPageInstructions}</p>
          </div>
          
          <div id="trial-container" style="text-align: center; margin: 40px 0; min-height: 200px;">
            <div style="margin: 20px 0;">
              ${noGoExample}
            </div>
            <button id="practice-button" class="jspsych-btn" style="margin: 10px 0;">
              ${buttonText}
            </button>
          </div>
          
          <div id="feedback-container" style="text-align: center; margin: 20px 0; min-height: 50px; font-weight: bold; font-size: 18px;"></div>
          
          <div id="ready-message" style="text-align: center; margin-top: 30px; display: none;">
            <p style="font-weight: bold; color: #28a745;">${englishText.readyToStart}</p>
          </div>
        </div>
      `,
      choices: [],
      trial_duration: null,
      response_ends_trial: false,
      on_start: () => {
        // Hide jsPsych navigation immediately
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
              // Show ready message
              const readyMessage = document.getElementById('ready-message');
              if (readyMessage) {
                readyMessage.style.display = 'block';
              }
            }
            
            // Auto-advance after showing feedback
            setTimeout(() => {
              jsPsych.finishTrial();
            }, 2000);
          }
        }
        
        // Set up practice button click handler
        const practiceButton = document.getElementById('practice-button');
        if (practiceButton) {
          practiceButton.addEventListener('click', function() {
            if (!practiceCompleted) {
              clicked = true;
              showFeedback('Remember you are not supposed to click for NO-GO stimulus', false);
            }
          });
        }
        
        // Check every 100ms if 3 seconds have passed
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
        <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto; text-align: center;">
          <h2 style="color: #28a745; margin-bottom: 30px;">${englishText.practiceCompleteTitle}</h2>
          
          <div style="margin: 40px 0;">
            <p style="font-size: 20px; margin-bottom: 20px;">${englishText.practiceCompleteMessage}</p>
            <p style="font-size: 18px; margin-bottom: 30px;">${englishText.startTaskPrompt}</p>
          </div>
        </div>
      `,
      choices: [englishText.beginTaskButton],
      data: { trial_type: englishText.trialTypes.instructions }
    }
  }
  
  const overviewInstructionTrial = createOverviewInstructionTrial()
  const goInstructionTrial = createGoInstructionTrial()
  const noGoInstructionTrial = createNoGoInstructionTrial()
  const practiceCompletionTrial = createPracticeCompletionTrial()

  const goNoGoTrial = {
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

  const interTrialIntervalTrial = {
    type: htmlButtonResponse,
    stimulus: '',
    choices: [],
    trial_duration: interTrialInterval,
    response_ends_trial: false
  }

  const generateTrialsForBlock = (blockNumber: number) => {
    const trials = []
    
    for (let i = 0; i < trialsPerBlock; i++) {
      const randomValue = Math.random()
      const isGoTrial = randomValue < goTrialProbability
      
      // Use single stimulus for each trial type
      const stimulus = isGoTrial ? goStimulus : noGoStimulus
      
      trials.push({
        stimulus: formatStimulus(stimulus, isGoTrial),
        trial_type: isGoTrial ? englishText.stimulusTypes.go : englishText.stimulusTypes.noGo,
        correct_response: isGoTrial ? 0 : null,
        block: blockNumber
      })
    }
    return trials
  }

  // Generate blocks
  const blocks = []
  for (let blockNum = 1; blockNum <= numBlocks; blockNum++) {
    const blockTrials = generateTrialsForBlock(blockNum)
    
    // Add block instructions (except for first block)
    if (blockNum > 1) {
      const blockInstructionTrial = {
        type: htmlButtonResponse,
        stimulus: `
          <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
            <h2>${englishText.blockHeader(blockNum, numBlocks)}</h2>
            <p>${englishText.blockBreakText}</p>
            <p>${englishText.blockReminder}</p>
            <p><strong>GO trials:</strong> ${englishText.goTrialInstructions}</p>
            <p><strong>NO-GO trials:</strong> ${englishText.noGoTrialInstructions}</p>
            <p>${englishText.blockContinuePrompt}</p>
          </div>
        `,
        choices: [englishText.continueButton],
        data: { trial_type: englishText.trialTypes.blockInstructions, block: blockNum }
      }
      blocks.push(blockInstructionTrial)
    }
    
    // Add block trials
    const blockProcedure = {
      timeline: [goNoGoTrial, interTrialIntervalTrial],
      timeline_variables: blockTrials,
      randomize_order: true
    }
    blocks.push(blockProcedure)
  }

  // Trials are already defined above

  const debriefTrial = {
    type: htmlButtonResponse,
    stimulus: () => {
      if (!showResultsDetails) {
        return `
          <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
            <h2>${englishText.taskComplete}</h2>
            <p>${englishText.thankYouMessage}</p>
          </div>
        `
      }

      const allData = jsPsych.data.get()
      
      // Get all trials that have stimulus_type defined (go-no-go trials)
      const allTrials = allData.values()
      const goNoGoTrials = allTrials.filter((trial: any) => trial.stimulus_type === englishText.stimulusTypes.go || trial.stimulus_type === englishText.stimulusTypes.noGo)
      
      let accuracy = 0
      let meanRT = 0
      
      if (goNoGoTrials.length > 0) {
        // Calculate overall accuracy
        const accuracyValues = goNoGoTrials.map((trial: any) => trial.accuracy).filter((val: any) => val === 1 || val === 0)
        const numCorrect = accuracyValues.filter((val: any) => val === 1).length
        accuracy = accuracyValues.length > 0 ? Math.round((numCorrect / accuracyValues.length) * 100) : 0
        
        // Calculate mean reaction time for GO trials that were responded to
        const goTrials = goNoGoTrials.filter((trial: any) => trial.stimulus_type === englishText.stimulusTypes.go && trial.response !== null && trial.response !== undefined)
        if (goTrials.length > 0) {
          const rtValues = goTrials.map((trial: any) => trial.rt).filter((val: any) => val !== null && val !== undefined && val > 0)
          meanRT = rtValues.length > 0 ? Math.round(rtValues.reduce((a: number, b: number) => a + b, 0) / rtValues.length) : 0
        }
      }
      
      return `
        <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
          <h2>${englishText.taskComplete}</h2>
          <p><strong>${englishText.overallAccuracy}</strong> ${accuracy}%</p>
          <p><strong>${englishText.averageResponseTime}</strong> ${meanRT}ms</p>
          <p>${englishText.thankYouMessage}</p>
        </div>
      `
    },
    choices: [englishText.finishButton],
    data: { trial_type: englishText.trialTypes.debrief }
  }

  return {
    timeline: [overviewInstructionTrial, goInstructionTrial, noGoInstructionTrial, practiceCompletionTrial, ...blocks, debriefTrial]
  }
}

export const timelineUnits = {
  instructionTrial: englishText.timelineUnits.instructionTrial,
  goNoGoTrial: englishText.timelineUnits.goNoGoTrial,
  debriefTrial: englishText.timelineUnits.debriefTrial
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