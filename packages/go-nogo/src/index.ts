import { JsPsych } from "jspsych"
import htmlButtonResponse from "@jspsych/plugin-html-button-response";


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
    goStimulus = 'GO',
    noGoStimulus = 'NO-GO',
    buttonText = 'Click',
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
    const color = isGoTrial ? 'green' : 'red'
    
    if (isImagePath(stimulus)) {
      return `<img src="${stimulus}" style="width: ${imageWidth}px; height: ${imageHeight}px; border: 3px solid ${color}; object-fit: contain;" alt="${isGoTrial ? 'GO' : 'NO-GO'} stimulus" />`
    } else {
      return `<div style="font-size: 48px; font-weight: bold; color: ${color}">${stimulus}</div>`
    }
  }
  
  const instructionTrial = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h2>Go/No-Go Task Instructions</h2>
        <p>In this task, you will see different stimuli appear on the screen.</p>
        <p><strong>GO trials:</strong> When you see a green stimulus (text or image with green border), click the button as quickly as possible.</p>
        <p><strong>NO-GO trials:</strong> When you see a red stimulus (text or image with red border), do NOT click the button.</p>
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

  const generateTrialsForBlock = (blockNumber: number) => {
    const trials = []
    
    for (let i = 0; i < trialsPerBlock; i++) {
      const randomValue = Math.random()
      const isGoTrial = randomValue < goTrialProbability
      
      // Use single stimulus for each trial type
      const stimulus = isGoTrial ? goStimulus : noGoStimulus
      
      trials.push({
        stimulus: formatStimulus(stimulus, isGoTrial),
        trial_type: isGoTrial ? 'go' : 'no-go',
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
            <h2>Block ${blockNum} of ${numBlocks}</h2>
            <p>Take a short break if needed.</p>
            <p>Remember:</p>
            <p><strong>GO trials:</strong> When you see a green stimulus (text or image with green border), click the button as quickly as possible.</p>
            <p><strong>NO-GO trials:</strong> When you see a red stimulus (text or image with red border), do NOT click the button.</p>
            <p>Click "Continue" when you're ready to continue.</p>
          </div>
        `,
        choices: ['Continue'],
        data: { trial_type: 'block-instructions', block: blockNum }
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
    timeline: [instructionTrial, ...blocks, debriefTrial]
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