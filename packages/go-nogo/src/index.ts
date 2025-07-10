import { JsPsych } from "jspsych"
import htmlButtonResponse from "@jspsych/plugin-html-button-response";


interface GoNoGoConfig {
  goStimuli?: string[]
  noGoStimuli?: string[]
  buttonText?: string
  stimulusDisplayTime?: number
  responseTimeout?: number
  interTrialInterval?: number
  numTrials?: number
  goTrialProbability?: number
  varyStimulus?: boolean
  showResultsDetails?: boolean
}

export function createTimeline(jsPsych: JsPsych, config: GoNoGoConfig = {}) {
  const {
    goStimuli = ['GO', 'X', 'O'],
    noGoStimuli = ['NO-GO', 'Y', 'Z'],
    buttonText = 'Click',
    responseTimeout = 1500,
    interTrialInterval = 500,
    numTrials = 100,
    goTrialProbability = 0.7,
    varyStimulus = true,
    showResultsDetails = true
  } = config

  // Override stimuli based on varyStimulus setting
  const actualGoStimuli = varyStimulus ? goStimuli : ['GO']
  const actualNoGoStimuli = varyStimulus ? noGoStimuli : ['NO GO']
  
  const generateTrials = () => {
    const trials = []
    let goTrialCount = 0
    let noGoTrialCount = 0
    
    for (let i = 0; i < numTrials; i++) {
      const randomValue = Math.random()
      const isGoTrial = randomValue < goTrialProbability
      
      // Use separate counters for go and no-go stimuli to ensure variety
      let stimulus
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
        stimulus: `<div style="font-size: 48px; font-weight: bold; color: ${isGoTrial ? 'green' : 'red'}">${stimulus}</div>`,
        trial_type: isGoTrial ? 'go' : 'no-go',
        correct_response: isGoTrial ? 0 : null
      })
    }
    return trials
  }

  const trials = generateTrials()

  const instructionTrial = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h2>Go/No-Go Task Instructions</h2>
        <p>In this task, you will see different stimuli appear on the screen.</p>
        <p><strong>GO trials:</strong> When you see a green stimulus, click the button as quickly as possible.</p>
        <p><strong>NO-GO trials:</strong> When you see a red stimulus, do NOT click the button.</p>
        <p>Try to respond as quickly and accurately as possible.</p>
        <p>Click "Start" when you're ready to begin.</p>
      </div>
    `,
    choices: ['Start'],
    data: { trial_type: 'instructions' }
  }

  const goNoGoTrial = {
    type: htmlButtonResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: [buttonText],
    trial_duration: responseTimeout,
    response_ends_trial: true,
    data: {
      trial_type: 'go-no-go',
      stimulus_type: jsPsych.timelineVariable('trial_type'),
      correct_response: jsPsych.timelineVariable('correct_response')
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

  const interTrialIntervalTrial = {
    type: htmlButtonResponse,
    stimulus: '',
    choices: [],
    trial_duration: interTrialInterval,
    response_ends_trial: false
  }

  const trialProcedure = {
    timeline: [goNoGoTrial, interTrialIntervalTrial],
    timeline_variables: trials,
    randomize_order: true
  }

  const debriefTrial = {
    type: htmlButtonResponse,
    stimulus: () => {
      if (!showResultsDetails) {
        return `
          <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
            <h2>Task Complete!</h2>
            <p>Thank you for completing the Go/No-Go task!</p>
          </div>
        `
      }

      const allData = jsPsych.data.get()
      
      // Get all trials that have stimulus_type defined (go-no-go trials)
      const allTrials = allData.values()
      const goNoGoTrials = allTrials.filter((trial: any) => trial.stimulus_type === 'go' || trial.stimulus_type === 'no-go')
      
      let accuracy = 0
      let meanRT = 0
      
      if (goNoGoTrials.length > 0) {
        // Calculate overall accuracy
        const accuracyValues = goNoGoTrials.map((trial: any) => trial.accuracy).filter((val: any) => val === 1 || val === 0)
        const numCorrect = accuracyValues.filter((val: any) => val === 1).length
        accuracy = accuracyValues.length > 0 ? Math.round((numCorrect / accuracyValues.length) * 100) : 0
        
        // Calculate mean reaction time for GO trials that were responded to
        const goTrials = goNoGoTrials.filter((trial: any) => trial.stimulus_type === 'go' && trial.response !== null && trial.response !== undefined)
        if (goTrials.length > 0) {
          const rtValues = goTrials.map((trial: any) => trial.rt).filter((val: any) => val !== null && val !== undefined && val > 0)
          meanRT = rtValues.length > 0 ? Math.round(rtValues.reduce((a: number, b: number) => a + b, 0) / rtValues.length) : 0
        }
      }
      
      return `
        <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
          <h2>Task Complete!</h2>
          <p><strong>Overall Accuracy:</strong> ${accuracy}%</p>
          <p><strong>Average Response Time (GO trials):</strong> ${meanRT}ms</p>
          <p>Thank you for completing the Go/No-Go task!</p>
        </div>
      `
    },
    choices: ['Finish'],
    data: { trial_type: 'debrief' }
  }

  return {
    timeline: [instructionTrial, trialProcedure, debriefTrial]
  }
}

export const timelineUnits = {
  instructionTrial: 'instructions',
  goNoGoTrial: 'go-no-go-trial',
  debriefTrial: 'debrief'
}

export const utils = {
  calculateAccuracy: (data: any) => {
    const goNoGoData = data.filter({ trial_type: 'go-no-go' })
    return goNoGoData.select('accuracy').mean()
  },
  
  calculateMeanRT: (data: any) => {
    const goTrials = data.filter({ trial_type: 'go-no-go', stimulus_type: 'go' })
    return goTrials.select('rt').mean()
  }
}