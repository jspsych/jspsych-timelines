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
  showDebrief?: boolean
}

// Helper function to create stimulus HTML
const createStimulusHTML = (html?: string, isGoTrial?: boolean): string => {
  const id = isGoTrial ? 'go-stimulus' : 'nogo-stimulus'
  
  if (html) {
    return `<div id="${id}-container" class="go-nogo-container timeline-trial">${html}</div>`
  }
  
  return `
    <div id="${id}-container" class="go-nogo-container timeline-trial"><h1 id="${id}" class="go-nogo-stimulus">${isGoTrial ? 'Y' : 'X'}</h1></div>`
}

const createGoInstructionTrial = (goStimulus: string, texts = englishText) => {
  const goExample = createStimulusHTML(goStimulus, true)
  
  return [
    {
      type: htmlButtonResponse,
      stimulus: `
        <p>${texts.goPageContent}</p>
        ${goExample}
        <div class="go-nogo-feedback" style="visibility: hidden;">${texts.goodJobMessage}</div>
      `,
      choices: [texts.defaultButtonText],
      data: { task: 'go-no-go', phase: 'go-practice' },
      button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="jspsych-btn timeline-html-btn">${choice}</button>`,
    },
    {
      type: htmlButtonResponse,
      stimulus: `
        <p>${texts.goPageContent}</p>
        ${goExample}
        <div class="go-nogo-feedback" style="color: #28a745;">${texts.goodJobMessage}</div>
      `,
      choices: [texts.defaultButtonText],
      trial_duration: 2000,
      response_ends_trial: false,
      data: { task: 'go-no-go', phase: 'go-practice-feedback' },
      button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="jspsych-btn timeline-html-btn" style="opacity: 0.5;" disabled>${choice}</button>`,
    }
  ]
}

const createNoGoInstructionTrial = (noGoStimulus: string, texts = englishText) => {
  const noGoExample = createStimulusHTML(noGoStimulus, false)
  
  // Create a timeline to hold the practice trials
  // This will allow us to conditionally push trials to show feedback later
  const practiceNoGoTimeline = []
  
  const practiceTask = {
    type: htmlButtonResponse,
    stimulus: `
      <p>${texts.noGoPageContent}</p>
      ${noGoExample}
      <div class="go-nogo-feedback" style="visibility: hidden;">${texts.noGoFeedbackMessage}</div>
    `,
    choices: [texts.defaultButtonText],
    trial_duration: 3000,
    data: { task: 'go-no-go', phase: 'nogo-practice' },
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
    on_finish: (data: any) => {
      // if null (no response), push correct feedback, else push incorrect feedback
      data.response === null ? practiceNoGoTimeline.push(correctFeedback) : practiceNoGoTimeline.push(incorrectFeedback)
        }
      }
      
  const correctFeedback = {
    type: htmlButtonResponse,
    stimulus: `
      <p>${texts.noGoPageContent}</p>
      ${noGoExample}
      <div class="go-nogo-feedback" style="color: #28a745;">${texts.noGoFeedbackMessage}</div>
    `,
    choices: [texts.defaultButtonText],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: 'go-no-go', phase: 'nogo-practice-feedback-correct' },
    button_html: (choice) => `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn" style="opacity: 0.5;" disabled>${choice}</button>`,
  }
  
  const incorrectFeedback = {
    type: htmlButtonResponse,
    stimulus: `
            <p>${texts.noGoPageContent}</p>
              ${noGoExample}
      <div class="go-nogo-feedback" style="color: #dc3545;">${texts.rememberNoGo}</div>
    `,
    choices: [texts.defaultButtonText],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: 'go-no-go', phase: 'nogo-practice-feedback-incorrect' },
    button_html: (choice) => `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn" style="opacity: 0.5;" disabled>${choice}</button>`,
  }

  practiceNoGoTimeline.push(practiceTask)
  return { timeline: practiceNoGoTimeline }
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

const createGenerateTrialsForBlock = (trialsPerBlock: number, goTrialProbability: number, actualGoStimuli: string[], actualNoGoStimuli: string[]) => {
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
        stimulus: createStimulusHTML(stimulus, isGoTrial),
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
    showDebrief = false,
  } = config

  const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [englishText.defaultGoStimulus])
  const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [englishText.defaultNoGoStimulus])
  
  const goNoGoTrial = createGoNoGoTrial(jsPsych, buttonText, responseTimeout)
  const interTrialIntervalTrial = createInterTrialIntervalTrial(interTrialInterval)

  const generateTrialsForBlock = createGenerateTrialsForBlock(trialsPerBlock, goTrialProbability, actualGoStimuli, actualNoGoStimuli)

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
      noGoStimuli
    } = config

    const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [texts.defaultGoStimulus])
    const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [texts.defaultNoGoStimulus])

    const goInstructionTrial = createGoInstructionTrial(actualGoStimuli[0], jsPsych, texts)
    const noGoInstructionTrial = createNoGoInstructionTrial(actualNoGoStimuli[0], jsPsych, texts)
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
      goTrialProbability = 0.75
    } = config
    
    const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [englishText.defaultGoStimulus])
    const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [englishText.defaultNoGoStimulus])

    const goNoGoTrial = createGoNoGoTrial(jsPsych, buttonText, responseTimeout)
    const interTrialIntervalTrial = createInterTrialIntervalTrial(interTrialInterval)
    const generateTrialsForBlock = createGenerateTrialsForBlock(trialsPerBlock, goTrialProbability, actualGoStimuli, actualNoGoStimuli)
    
    return { trial: goNoGoTrial, interTrialInterval: interTrialIntervalTrial, generateTrialsForBlock }
  },
  debriefTrial: (jsPsych: JsPsych, config: GoNoGoConfig = {}) => {
    const { showResultsDetails = true } = config
    return createDebriefTrial(jsPsych, showResultsDetails)
  }
}

export const utils = {}