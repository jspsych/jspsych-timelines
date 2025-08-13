import { JsPsych } from "jspsych"
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, instruction_pages } from "./text";


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
/**
 * Creates a set of instructions for the Go/No-Go task.
 * 
 * @param {string[]} instructions - Array of instruction pages to display.
 * @param {object} texts - Text configuration object containing messages and labels.
 * @returns {object} jsPsychInstructions trial object.
 */
export function createInstructions(instructions: string[] = instruction_pages, texts = trial_text) {
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
    data: { task: 'go-nogo', phase: 'instructions' }
  };
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

/**
 * Creates a Go instruction trial with practice and infinite retry logic.
 * 
 * This function creates a dynamic timeline that teaches users how to respond to "go" stimuli.
 * Users must click the button within 10 seconds to proceed. If they fail to click in time,
 * they receive failure feedback and the trial repeats until they succeed.
 * 
 * @param goStimulus - The stimulus content to display (can be text or HTML)
 * @param texts - Text configuration object containing all messages and labels
 * 
 * @returns A timeline object containing:
 *   - Practice task with 10-second timeout
 *   - Success feedback (if clicked in time)
 *   - Failure feedback + retry loop (if timeout occurs)
 */
const createGoInstructionTrial = (goStimulus: string, texts = trial_text) => {
  const goExample = createStimulusHTML(goStimulus, true)
  
  // Create a timeline to hold the practice trials
  // This will allow us to conditionally push trials for retry logic
  const practiceGoTimeline = []
  
  const practiceTask = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.goPageContent}</p>
      ${goExample}
      <div class="go-nogo-feedback" style="visibility: hidden;">${texts.goodJobMessage}</div>
    `,
    choices: [texts.defaultButtonText],
    trial_duration: 10000, // 10 seconds timeout
    data: { task: 'go-nogo', phase: 'go-practice' },
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="jspsych-btn timeline-html-btn">${choice}</button>`,
    on_finish: (data: any) => {
      if (data.response !== null) {
        // They clicked - show success feedback
        practiceGoTimeline.push(successFeedback)
      } else {
        // They failed to click in time - show failure feedback then retry
        practiceGoTimeline.push(failureFeedback)
        practiceGoTimeline.push(practiceTask) // infinite retying until they succeed in clicking.
      }
    }
  }
  
  const successFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.goPageContent}</p>
      ${goExample}
      <div class="go-nogo-feedback" style="color: #28a745;">${texts.goodJobMessage}</div>
    `,
    choices: [texts.defaultButtonText],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: 'go-nogo', phase: 'practice', page: 'success' },
    //disabled button to signify click
    button_html: (choice) => `<button id="go-nogo-btn" class="jspsych-btn timeline-html-btn" style="opacity: 0.5;" disabled>${choice}</button>`,
  }
  
  const failureFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.goPageContent}</p>
      ${goExample}
      <div class="go-nogo-feedback" style="color: #dc3545;">${texts.goFailureMessage}</div>
    `,
    choices: [texts.defaultButtonText],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: 'go-nogo', phase: 'practice', page: 'failure' },
    //disabled button to signify click
    button_html: (choice) => `<button id="go-nogo-btn" class="jspsych-btn timeline-html-btn" style="opacity: 0.5;" disabled>${choice}</button>`,
  }

  practiceGoTimeline.push(practiceTask)
  return { timeline: practiceGoTimeline }
}

/**
 * Creates a No-Go instruction trial with practice and infinite retry logic.
 * 
 * This function creates a dynamic timeline that teaches users how to respond to "no-go" stimuli.
 * Users must resist clicking the button for 3 seconds to proceed. If they click the button,
 * they receive failure feedback and the trial repeats until they succeed.
 * 
 * @param noGoStimulus - The stimulus content to display (can be text or HTML)
 * @param texts - Text configuration object containing all messages and labels
 * 
 * @returns A timeline object containing:
 *   - Practice task with 3-second duration and button available
 *   - Success feedback (if they resist clicking)
 *   - Failure feedback + retry loop (if they click)
 */
const createNoGoInstructionTrial = (noGoStimulus: string, texts = trial_text) => {
  const noGoExample = createStimulusHTML(noGoStimulus, false)
  
  // Create a timeline to hold the practice trials
  // This will allow us to conditionally push trials to show feedback later
  const practiceNoGoTimeline = []

  const practiceTask = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.noGoPageContent}</p>
      ${noGoExample}
      <div class="go-nogo-feedback" style="visibility: hidden;">${texts.noGoFeedbackMessage}</div>
    `,
    choices: [texts.defaultButtonText],
    trial_duration: 3000,
    data: { task: 'go-nogo', phase: 'nogo-practice' },
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
    on_finish: (data: any) => {
      if (data.response === null) {
        // They correctly didn't click - show success feedback
        practiceNoGoTimeline.push(correctFeedback)
      } else {
        // They failed by clicking - show failure feedback then retry
        practiceNoGoTimeline.push(incorrectFeedback)
        practiceNoGoTimeline.push(practiceTask) // infinite retrying until they succeed by not clicking
      }
    }
  }
  
  const correctFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.noGoPageContent}</p>
      ${noGoExample}
      <div class="go-nogo-feedback" style="color: #28a745;">${texts.noGoFeedbackMessage}</div>
    `,
    choices: [texts.defaultButtonText],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: 'go-nogo', phase: 'nogo-practice-feedback-correct' },
    //disabled button to signify click
    button_html: (choice) => `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn" style="opacity: 0.5;" disabled>${choice}</button>`,
  }
  
  const incorrectFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.noGoPageContent}</p>
      ${noGoExample}
      <div class="go-nogo-feedback" style="color: #dc3545;">${texts.rememberNoGo}</div>
    `,
    choices: [texts.defaultButtonText],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: 'go-nogo', phase: 'practice', page: 'failure' },
    //disabled button to signify click
    button_html: (choice) => `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn" style="opacity: 0.5;" disabled>${choice}</button>`,
  }

  practiceNoGoTimeline.push(practiceTask)
  return { timeline: practiceNoGoTimeline }
}

const createPracticeCompletionTrial = (texts = trial_text) => {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="go-nogo-practice">
          <p>${texts.practiceCompleteContent}<p>
        </div>
    `,
    choices: [texts.beginTaskButton],
    data: { task: 'go-nogo', phase: 'practice', page: 'completion' },
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
  }
}

const createGoNoGoTrial = (jsPsych: JsPsych, buttonText: string, responseTimeout: number) => {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: [buttonText],
    trial_duration: responseTimeout,
    response_ends_trial: true,
    data: {
      task: 'go-nogo',
      phase: 'main-trial',
      is_go_trial: jsPsych.timelineVariable('is_go_trial'),
      block_number: jsPsych.timelineVariable('block_number'),
    },
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="continue-btn timeline-html-btn jspsych-btn">${choice}</button>`,
    on_finish: (data: any) => {
      data.correct = (data.is_go_trial && data.response === 0) || (!data.is_go_trial && data.response === null);
    }
  }
}

const createInterTrialIntervalTrial = (interTrialInterval: number) => {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class="fixation" style="font-size:60px;">+</div>',
    choices: [],
    trial_duration: interTrialInterval,
    response_ends_trial: false,
    data: {
      task: 'go-nogo', // unified task label
      phase: 'main',
      page: 'isi'
    },
  }
}

// This function generates trials for a block based on the specified parameters
// It creates a mix of go and no-go trials according to the specified probabilities and stimuli
// It returns a FUNCTION that can be called with a block number to generate the trials for that block.
// what is going on with higher order functions here brooooo
// OK so it creates timeline VARIABLES, not createGenereateTrialsForBlock
const createTimelineVariables = (jsPsych: JsPsych, blockNumber: number, trialsPerBlock: number, goTrialProbability: number, actualGoStimuli: string[], actualNoGoStimuli: string[]) => {
    const trials: any[] = []
    
    // Calculate exact counts
    const numGoTrials = Math.round(trialsPerBlock * goTrialProbability)
    const numNoGoTrials = trialsPerBlock - numGoTrials

    // Create fixed array of trial types
    const trialTypes = Array(numGoTrials).fill(true).concat(Array(numNoGoTrials).fill(false))
    // Shuffle trial types
    jsPsych.randomization.shuffle(trialTypes)

    let goTrialCount = 0
    let noGoTrialCount = 0

    for (let i = 0; i < trialTypes.length; i++) {
      const isGoTrial = trialTypes[i]
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
        is_go_trial: isGoTrial,
        block_number: blockNumber,
        task: 'go-nogo',
        phase: 'main-trial',
        page: isGoTrial ? 'go' : 'nogo'
      })
    }
    return trials
}

const createBlockBreak = (blockNum: number, numBlocks: number) => {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
            <p>${trial_text.blockBreakContent(blockNum, numBlocks)}</p>
    `,
    choices: [trial_text.continueButton],
    data: { task: 'go-nogo', phase: 'block-break' },
    button_html: (choice) => `<button id="block-break-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
  }
}

const createDebriefTrial = (jsPsych: JsPsych, showResultsDetails: boolean) => {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      if (!showResultsDetails) {
        return `
            <div class="go-nogo-debrief">
              <h2>${trial_text.taskComplete}</h2>
              <p>${trial_text.thankYouMessage}</p>
            </div>
        `
      }

      const allData = jsPsych.data.get()
      
      const allTrials = allData.values()
      const goNoGoTrials = allTrials.filter((trial: any) => trial.stimulus_type === trial_text.stimulusTypes.go || trial.stimulus_type === trial_text.stimulusTypes.noGo)
      
      let accuracy = 0
      let meanRT = 0
      
      if (goNoGoTrials.length > 0) {
        const accuracyValues = goNoGoTrials.map((trial: any) => trial.accuracy).filter((val: any) => val === 1 || val === 0)
        const numCorrect = accuracyValues.filter((val: any) => val === 1).length
        accuracy = accuracyValues.length > 0 ? Math.round((numCorrect / accuracyValues.length) * 100) : 0
        
        const goTrials = goNoGoTrials.filter((trial: any) => trial.stimulus_type === trial_text.stimulusTypes.go && trial.response !== null && trial.response !== undefined)
        if (goTrials.length > 0) {
          const rtValues = goTrials.map((trial: any) => trial.rt).filter((val: any) => val !== null && val !== undefined && val > 0)
          meanRT = rtValues.length > 0 ? Math.round(rtValues.reduce((a: number, b: number) => a + b, 0) / rtValues.length) : 0
        }
      }
      
      return `
          <div class="go-nogo-debrief">
            <h2>${trial_text.taskComplete}</h2>
              <p><strong>${trial_text.overallAccuracy}</strong> ${accuracy}%</p>
              <p><strong>${trial_text.averageResponseTime}</strong> ${meanRT}ms</p>
            <p>${trial_text.thankYouMessage}</p>
          </div>
      `
    },
    choices: [trial_text.finishButton],
    data: { task: 'go-nogo', phase: 'debrief' },
    button_html: (choice, choice_index) => `<button id="debrief-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
  }
}

export function createTimeline(jsPsych: JsPsych, config: GoNoGoConfig = {}) {
  const {
    goStimulus,
    noGoStimulus,
    goStimuli,
    noGoStimuli,
    buttonText = trial_text.defaultButtonText,
    responseTimeout = 500,
    interTrialInterval = 500,
    numBlocks = 3,
    trialsPerBlock = 50,
    goTrialProbability = 0.75,
    showResultsDetails = false,
    showDebrief = false,
  } = config

  const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [trial_text.defaultGoStimulus])
  const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [trial_text.defaultNoGoStimulus])
  
  const goNoGoTrial = createGoNoGoTrial(jsPsych, buttonText, responseTimeout)
  const interTrialIntervalTrial = createInterTrialIntervalTrial(interTrialInterval)

  // Generate blocks
  const blocks = []
  for (let blockNum = 1; blockNum <= numBlocks; blockNum++) {
    const blockTrials = createTimelineVariables(jsPsych, blockNum, trialsPerBlock, goTrialProbability, actualGoStimuli, actualNoGoStimuli)

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
  practiceTrial: (jsPsych: JsPsych, config: GoNoGoConfig = {}, texts = trial_text) => {
    const {
      goStimulus,
      noGoStimulus,
      goStimuli,
      noGoStimuli
    } = config

    const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [texts.defaultGoStimulus])
    const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [texts.defaultNoGoStimulus])

    const goInstructionTrial = createGoInstructionTrial(actualGoStimuli[0], texts)
    const noGoInstructionTrial = createNoGoInstructionTrial(actualNoGoStimuli[0], texts)
    const practiceCompletionTrial = createPracticeCompletionTrial(texts)
    
    return [goInstructionTrial, noGoInstructionTrial, practiceCompletionTrial]
  },
  goNoGoTrial: (jsPsych: JsPsych, config: GoNoGoConfig = {}) => {
    const {
      goStimulus,
      noGoStimulus,
      goStimuli,
      noGoStimuli,
      buttonText = trial_text.defaultButtonText,
      responseTimeout = 1500,
      interTrialInterval = 500,
      trialsPerBlock = 50,
      goTrialProbability = 0.75
    } = config
    
    const actualGoStimuli = goStimuli || (goStimulus ? [goStimulus] : [trial_text.defaultGoStimulus])
    const actualNoGoStimuli = noGoStimuli || (noGoStimulus ? [noGoStimulus] : [trial_text.defaultNoGoStimulus])

    const goNoGoTrial = createGoNoGoTrial(jsPsych, buttonText, responseTimeout)
    const interTrialIntervalTrial = createInterTrialIntervalTrial(interTrialInterval)
    const generateTrialsForBlock = createTimelineVariables(jsPsych, 1, trialsPerBlock, goTrialProbability, actualGoStimuli, actualNoGoStimuli)
    
    return { trial: goNoGoTrial, interTrialInterval: interTrialIntervalTrial, generateTrialsForBlock }
  },
  debriefTrial: (jsPsych: JsPsych, config: GoNoGoConfig = {}) => {
    const { showResultsDetails = true } = config
    return createDebriefTrial(jsPsych, showResultsDetails)
  }
}

export const utils = {}