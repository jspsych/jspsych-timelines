import { JsPsych } from "jspsych"
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, instruction_pages } from "./text";


interface GoNoGoConfig {
  //general configuration
  show_instructions?: boolean
  show_practice?: boolean
  num_blocks?: number
  num_trials?: number
  trial_timeout?: number
  isi_timeout?: number
  probability?: number
  show_debrief?: boolean
  //stimuli configuration
  go_stimulus?: string
  nogo_stimulus?: string
  go_stimuli?: string[]
  nogo_stimuli?: string[]
  button_text?: string
  //texts
  instructions_array?: string[]
  text_object?: typeof trial_text
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
 * @param go_stimulus - The stimulus content to display (can be text or HTML)
 * @param texts - Text configuration object containing all messages and labels
 * 
 * @returns A timeline object containing:
 *   - Practice task with 10-second timeout
 *   - Success feedback (if clicked in time)
 *   - Failure feedback + retry loop (if timeout occurs)
 */
const createGoInstructionTrial = (go_stimulus: string, texts = trial_text) => {
  const goExample = createStimulusHTML(go_stimulus, true)
  
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
 * @param nogo_stimulus - The stimulus content to display (can be text or HTML)
 * @param texts - Text configuration object containing all messages and labels
 * 
 * @returns A timeline object containing:
 *   - Practice task with 3-second duration and button available
 *   - Success feedback (if they resist clicking)
 *   - Failure feedback + retry loop (if they click)
 */
const createNoGoInstructionTrial = (nogo_stimulus: string, texts = trial_text) => {
  const noGoExample = createStimulusHTML(nogo_stimulus, false)
  
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
    data: { task: 'go-nogo', phase: 'practice', page: 'success' },
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
          <p>${texts.practiceCompleteContent}</p>
        </div>
    `,
    choices: [texts.beginTaskButton],
    data: { task: 'go-nogo', phase: 'practice', page: 'completion' },
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
  }
}

const createGoNoGoTrial = (jsPsych: JsPsych, button_text: string, trial_timeout: number) => {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: [button_text],
    trial_duration: trial_timeout,
    response_ends_trial: true,
    data: {
      task: 'go-nogo',
      phase: 'main-trial',
      is_go_trial: jsPsych.timelineVariable('is_go_trial'),
      block_number: jsPsych.timelineVariable('block_number'),
      page: jsPsych.timelineVariable('page'),
    },
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="continue-btn timeline-html-btn jspsych-btn">${choice}</button>`,
    on_finish: (data: any) => {
      data.correct = (data.is_go_trial && data.response === 0) || (!data.is_go_trial && data.response === null);
    }
  }
}

const createisi_timeoutTrial = (isi_timeout: number) => {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class="fixation" style="font-size:60px;">+</div>',
    choices: [],
    trial_duration: isi_timeout,
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
const createTimelineVariables = (jsPsych: JsPsych, blockNumber: number, num_trials: number, probability: number, actualGoStimuli: string[], actualNoGoStimuli: string[]) => {
    const trials: any[] = []
    
    // Calculate exact counts
    const numGoTrials = Math.round(num_trials * probability)
    const numNoGoTrials = num_trials - numGoTrials

    // Validate inputs
    if (numGoTrials < 0 || numNoGoTrials < 0) {
        throw new Error(`Invalid trial configuration: probability (${probability}) results in ${numGoTrials} go trials and ${numNoGoTrials} no-go trials for ${num_trials} total trials. Both must be non-negative.`)
    }

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
        task: 'go-nogo',
        phase: 'main-trial',
        page: isGoTrial ? 'go' : 'nogo',
        block_number: blockNumber,
      })
    }
    return trials
}

const createBlockBreak = (blockNum: number, num_blocks: number) => {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
            <p>${trial_text.blockBreakContent(blockNum, num_blocks)}</p>
    `,
    choices: [trial_text.continueButton],
    data: { task: 'go-nogo', phase: 'block-break'+ blockNum, block_number: blockNum },
    button_html: (choice) => `<button id="block-break-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
  }
}

const createDebrief = (jsPsych: JsPsych) => {
  // Calculate stats when trial starts, not when displayed
  const calculateStats = () => {
    const allTrials = jsPsych.data.get().filter({ task: 'go-nogo', phase: 'main-trial' }).values()
    
    if (allTrials.length === 0) return { accuracy: 0, meanRT: 0 }
    
    // Calculate accuracy (percentage of correct responses)
    const correctTrials = allTrials.filter((trial: any) => trial.correct === true)
    const accuracy = Math.round((correctTrials.length / allTrials.length) * 100)
    
    // Calculate mean RT for GO trials where response was made
    const goTrialsWithResponse = allTrials.filter((trial: any) => 
      trial.is_go_trial === true && trial.response !== null && trial.rt > 0
    )
    const meanRT = goTrialsWithResponse.length > 0 
      ? Math.round(goTrialsWithResponse.reduce((sum: number, trial: any) => sum + trial.rt, 0) / goTrialsWithResponse.length)
      : 0
    
    return { accuracy, meanRT }
  }

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const { accuracy, meanRT } = calculateStats()
      
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

export function createTimeline(
  jsPsych: JsPsych,
  config: GoNoGoConfig = {}
) {
  const {
    // general
    show_instructions = false,
    show_practice = false,
    num_blocks = 3,
    num_trials = 50,
    trial_timeout = 500,
    isi_timeout = 500,
    probability = 0.75,
    show_debrief = false,
    // stimuli
    go_stimulus = trial_text.defaultGoStimulus,
    nogo_stimulus = trial_text.defaultNoGoStimulus,
    go_stimuli,
    nogo_stimuli,
    button_text = trial_text.defaultButtonText,
    // texts
    instructions_array: instructions = instruction_pages,
    text_object: texts = trial_text,
  } = config
  
  const timeline = []

  if (show_instructions) {
    timeline.push(createInstructions(instructions, texts))
  }

  if (show_practice) {
    const practiceTrials = createPractice({
      go_stimulus,
      nogo_stimulus,
      go_stimuli,
      nogo_stimuli,
      text_object: texts
    })
    timeline.push(practiceTrials)
  }

  const actualGoStimuli = go_stimuli?.length ? go_stimuli : [go_stimulus]
  const actualNoGoStimuli = nogo_stimuli?.length ? nogo_stimuli : [nogo_stimulus]
  
  const goNoGoTrial = createGoNoGoTrial(jsPsych, button_text, trial_timeout)
  const isi_timeoutTrial = createisi_timeoutTrial(isi_timeout)

  // Generate blocks
  const blocks = []
  for (let blockNum = 1; blockNum <= num_blocks; blockNum++) {
    const blockTrials = createTimelineVariables(jsPsych, blockNum, num_trials, probability, actualGoStimuli, actualNoGoStimuli)

    // Add block trials
    const blockProcedure = {
      timeline: [goNoGoTrial, isi_timeoutTrial],
      timeline_variables: blockTrials,
      randomize_order: true
    }
    blocks.push(blockProcedure)
    
    // Add block break page between blocks (except after last block)
    if (blockNum < num_blocks) {
      const blockBreakTrial = createBlockBreak(blockNum, num_blocks)
      blocks.push(blockBreakTrial)
    }
  }

  timeline.push([...blocks])

  if (show_debrief) {
    const debriefTrial = createDebrief(jsPsych)
    timeline.push(debriefTrial)
  }

  return {
    timeline
  }
}

// This function creates a practice timeline for the Go/No-Go task
function createPractice(config: GoNoGoConfig = {}): any[] {
  const {
    go_stimulus = trial_text.defaultGoStimulus,
    nogo_stimulus = trial_text.defaultNoGoStimulus,
    go_stimuli,
    nogo_stimuli,
    text_object: texts = trial_text
  } = config

  const actualGoStimuli = go_stimuli?.length ? go_stimuli : [go_stimulus]
  const actualNoGoStimuli = nogo_stimuli?.length ? nogo_stimuli : [nogo_stimulus]

  return [
    createGoInstructionTrial(actualGoStimuli[0], texts),
    createNoGoInstructionTrial(actualNoGoStimuli[0], texts),
    createPracticeCompletionTrial(texts)
  ]
}

export const timelineUnits = {
  createPractice,
  createDebrief
}

export const utils = {}