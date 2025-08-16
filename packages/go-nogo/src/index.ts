import { JsPsych } from "jspsych"
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, instruction_pages } from "./text";


/**
 * Configuration options for the Go/No-Go timeline and helpers.
 * Defaults shown reflect the values used in createTimeline unless overridden.
 *
 * @property {boolean} [show_instructions=false] Whether to include the instructions pages at the start.
 * @property {boolean} [show_practice=false] Whether to include the interactive practice section.
 * @property {number}  [num_blocks=3] Number of experimental blocks.
 * @property {number}  [num_trials=50] Trials per block.
 * @property {number}  [trial_timeout=500] Stimulus/button trial duration in milliseconds.
 * @property {number}  [isi_timeout=500] Inter-stimulus interval (fixation) in milliseconds.
 * @property {number}  [probability=0.75] Probability of a Go trial in each block (0..1).
 * @property {boolean} [show_debrief=false] Whether to append the debrief summary at the end.
 *
 * Stimulus configuration
 * @property {string}   [go_stimulus=trial_text.defaultGoStimulus] Single Go stimulus (used when go_stimuli is not provided).
 * @property {string}   [nogo_stimulus=trial_text.defaultNoGoStimulus] Single No-Go stimulus (used when nogo_stimuli is not provided).
 * @property {string[]} [go_stimuli] Optional list of Go stimuli to rotate through.
 * @property {string[]} [nogo_stimuli] Optional list of No-Go stimuli to rotate through.
 * @property {string}   [button_text=trial_text.defaultButtonText] Label for the response button during trials.
 * @property {number}   [go_practice_timeout=10000] Duration of Go practice trial.
 * @property {number}   [nogo_practice_timeout=3000] Duration of No-Go practice trial.
 *
 * Texts
 * @property {string[]}            [instructions_array=instruction_pages] Pages for the instructions screen.
 * @property {typeof trial_text}   [text_object=trial_text] Text/config object with UI strings.
 */
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
  go_practice_timeout?: number
  nogo_practice_timeout?: number
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

/**
 * Wrap stimulus content in a standardized container for Go/No-Go trials.
 *
 * @param html The stimulus HTML or text (already formatted).
 * @param isGoTrial Whether this stimulus represents a Go (true) or No-Go (false) trial.
 * @returns HTML string for inclusion in a jsPsych stimulus field.
 */
const createStimulusHTML = (html: string, isGoTrial: boolean): string => {
  const id = isGoTrial ? 'go-stimulus' : 'nogo-stimulus'
  return `<div id="${id}-container" class="go-nogo-container timeline-trial" style="font-size: 3em; margin: 1em 0;">${html}</div>`
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
const createGoPractice = (go_stimulus: string, texts = trial_text, timeout: number = 10000) => {
  const go_html = createStimulusHTML(go_stimulus, true)
  
  // Create a timeline to hold the practice trials
  // This will allow us to conditionally push trials for retry logic
  const practiceGoTimeline = []
  
  const practiceTask = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.goPageContent}</p>
      ${go_html}
      <div class="go-nogo-feedback" style="visibility: hidden;">${texts.goodJobMessage}</div>
    `,
    choices: [texts.defaultButtonText],
    trial_duration: timeout, // default 10 seconds
    data: { task: 'go-nogo', phase: 'go-practice' },
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="jspsych-btn timeline-html-btn">${choice}</button>`,
    on_finish: (data: any) => {
      if (data.response !== null) {
        // They clicked - show success feedback
        data.correct = true // They clicked on go trial
        practiceGoTimeline.push(successFeedback)
      } else {
        // They failed to click in time - show failure feedback then retry
        data.correct = false // They did not click on go trial
        practiceGoTimeline.push(failureFeedback)
        practiceGoTimeline.push(practiceTask) // infinite retying until they succeed in clicking.
      }
    }
  }
  
  const successFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.goPageContent}</p>
      ${go_html}
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
      ${go_html}
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
const createNoGoPractice = (nogo_stimulus: string, texts = trial_text, timeout: number = 3000) => {
  const nogo_html = createStimulusHTML(nogo_stimulus, false)
  
  // Create a timeline to hold the practice trials
  // This will allow us to conditionally push trials to show feedback later
  const practiceNoGoTimeline = []

  const practiceTask = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.noGoPageContent}</p>
      ${nogo_html}
      <div class="go-nogo-feedback" style="visibility: hidden;">${texts.noGoFeedbackMessage}</div>
    `,
    choices: [texts.defaultButtonText],
    trial_duration: timeout,
    data: { task: 'go-nogo', phase: 'nogo-practice' },
    button_html: (choice, choice_index) => `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
    on_finish: (data: any) => {
      if (data.response === null) {
        // They correctly didn't click - show success feedback
        data.correct = true // They didn't click on no go trial
        practiceNoGoTimeline.push(correctFeedback)
      } else {
        // They failed by clicking - show failure feedback then retry
        data.correct = false // They clicked on no go trial
        practiceNoGoTimeline.push(incorrectFeedback)
        practiceNoGoTimeline.push(practiceTask) // infinite retrying until they succeed by not clicking
      }
    }
  }
  
  const correctFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.noGoPageContent}</p>
      ${nogo_html}
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
      ${nogo_html}
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

/**
 * Create a small completion screen at the end of practice.
 *
 * @param texts Text configuration to render labels.
 * @returns A jsPsych trial for the practice completion screen.
 */
const createPracticeCompletion = (texts = trial_text) => {
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

/**
 * Factory for the main Go/No-Go trial (stimulus + response button).
 *
 * @param jsPsych Active jsPsych instance (for timeline variables and data).
 * @param button_text Label for the response button.
 * @param trial_timeout Trial duration in milliseconds.
 * @returns A jsPsych trial definition to be used within a procedure.
 */
const createGoNoGo = (jsPsych: JsPsych, button_text: string, trial_timeout: number) => {
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

/**
 * Creates an inter-stimulus interval (ISI) fixation screen.
 *
 * @param isi_timeout Duration (ms) to show the fixation.
 * @returns A non-responsive jsPsych trial showing a fixation cross.
 */
const createISIFixation = (isi_timeout: number, button_text: string) => {
  return {
    // Use button plugin so we can provide button_html
    type: jsPsychHtmlButtonResponse,
    stimulus: '<div class="fixation" style="font-size: 3em; margin: 1em 0;">+</div>',
    choices: [button_text],
    trial_duration: isi_timeout,
    response_ends_trial: false,
    data: {
      task: 'go-nogo',
      phase: 'main',
      page: 'isi'
    },
    // Hidden and disabled button to keep layout consistent with createGoNoGo but non-interactive
    button_html: (choice) =>
      `<button id="isi-btn" class="continue-btn timeline-html-btn jspsych-btn is-disabled"
               style="visibility: hidden;" disabled>${choice}</button>`,
  }
}

// This function generates timelineVariables for a block based on the specified parameters
// It creates a mix of go and no-go trials according to the specified probabilities and stimuli
/**
 * Generate timeline variables for a single block.
 * Ensures the requested Go/No-Go ratio and rotates through provided stimuli.
 *
 * @param jsPsych Active jsPsych instance (for randomization helper).
 * @param blockNumber 1-based block index.
 * @param num_trials Number of trials to generate for the block.
 * @param probability Probability of a Go trial (0..1).
 * @param actualGoStimuli List of Go stimuli used in rotation order.
 * @param actualNoGoStimuli List of No-Go stimuli used in rotation order.
 * @returns An array of timeline_variables entries consumed by createGoNoGo.
 */
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

/**
 * Insert a short break screen between blocks.
 *
 * @param blockNum 1-based index of the block that just finished.
 * @param num_blocks Total number of blocks.
 * @returns A jsPsychHtmlButtonResponse screen prompting to continue.
 */
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

/**
 * Create the end-of-experiment debrief screen showing accuracy and mean RT.
 *
 * @param jsPsych Active jsPsych instance from which results are derived.
 * @returns A jsPsych trial object for the debrief.
 */
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

/**
 * High-level factory that assembles the full Go/No-Go jsPsych timeline.
 *
 * Example:
 * const { timeline } = createTimeline(jsPsych, { num_blocks: 2, probability: 0.8, show_debrief: true })
 * jsPsych.run(timeline)
 *
 * @param jsPsych Active jsPsych instance.
 * @param config Partial configuration overriding defaults; see GoNoGoConfig.
 * @returns An object with a `timeline` array ready for jsPsych.run.
 */
export function createTimeline(
  jsPsych: JsPsych,
  {
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
    go_practice_timeout = 10000,
    nogo_practice_timeout = 3000,
    // texts
    instructions_array: instructions = instruction_pages,
    text_object: texts = trial_text,
  } : GoNoGoConfig = {})
  
  
  {
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
      text_object: texts,
      go_practice_timeout,
      nogo_practice_timeout
    })
    timeline.push(practiceTrials)
  }

  const actualGoStimuli = go_stimuli?.length ? go_stimuli : [go_stimulus]
  const actualNoGoStimuli = nogo_stimuli?.length ? nogo_stimuli : [nogo_stimulus]
  
  const goNoGoTrial = createGoNoGo(jsPsych, button_text, trial_timeout)
  const isi_timeoutTrial = createISIFixation(isi_timeout, button_text)

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

/**
 * Create the practice section (Go, No-Go, then a short completion screen).
 *
 * @param config Partial configuration to select sample stimuli and texts.
 * @returns An array of practice timeline segments to be inserted into the main timeline.
 */
function createPractice({
    go_stimulus = trial_text.defaultGoStimulus,
    nogo_stimulus = trial_text.defaultNoGoStimulus,
    go_stimuli,
    nogo_stimuli,
    text_object: texts = trial_text,
    go_practice_timeout = 10000,
    nogo_practice_timeout = 3000
  } : GoNoGoConfig = {}) {
  
  const actual_go_stimuli = go_stimuli?.length ? go_stimuli : [go_stimulus]
  const actual_nogo_stimuli = nogo_stimuli?.length ? nogo_stimuli : [nogo_stimulus]

  return [
    createGoPractice(actual_go_stimuli[0], texts, go_practice_timeout),
    createNoGoPractice(actual_nogo_stimuli[0], texts, nogo_practice_timeout),
    createPracticeCompletion(texts)
  ]
}

/**
 * Namespaced access to building blocks for advanced composition and testing.
 */
export const timelineUnits = {
  createInstructions,
  createPractice,
  createDebrief
}

/**
 * Utility exports used by consumers and tests.
 */
export const utils = {
  createStimulusHTML
}