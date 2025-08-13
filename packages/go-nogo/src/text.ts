export const instruction_pages = [
    "In this task, you will see symbols appear one at a time on the screen. <img src='go-nogo.gif' alt='Go/No-Go task instructions gif'>",
    "When you see a 'go' stimulus, click the button as quickly as possible. <h2>Y</h2>",
    "But if you see the No-Go symbol, do nothing — don’t press anything. <h2>X</h2>",
    "Try to be fast, but also careful. Only press when it’s a Go.",
    "Continue when ready to start the practice.",
]


export const trial_text = {
  // Default stimuli
  defaultGoStimulus: 'Y',
  defaultNoGoStimulus: 'X',
  defaultButtonText: 'Click',

  // Instructions
  instructionText: 'In this task, you will see different stimuli appear on the screen.',
  goTrialInstructions: 'When you see a \'go\' stimulus, click the button as quickly as possible.',
  noGoTrialInstructions: 'When you see a \'no go\' stimulus, do NOT click the button.',
  generalInstructions: 'Try to respond as quickly and accurately as possible.',
  startPrompt: 'Click "Start" when you\'re ready to begin.',
  startButton: 'Start',
  
  // Multi-page Instructions
  // Page 1: Overview
  overviewText: 'In this task, you will see different stimuli appear on the screen.',
  overviewPrompt: 'Click to start below.',
  nextButton: 'Next',
  
  // Page 2: GO Practice
  goPageContent: 
  `<b>GO Trials</b><br>When you see this stimulus, click the button as quickly as possible!<br>Try clicking the button below to practice:`,
  gotItButton: 'Got it!',
  goFeedbackMessage: 'Perfect! You clicked quickly for the GO stimulus.',
  goodJobMessage: 'Good job!',
  goFailureMessage: 'You failed to click in time. Please try again!',
  
  // Page 3: NO-GO Practice  

  noGoPageContent:
  `<b>NO-GO Trials</b><br>When you see this stimulus, do NOT click the button!<br>Try waiting without clicking the button below:`,
  rememberNoGo: 'Remember, you should NOT click for the NO-GO stimulus!',
  noGoFeedbackMessage: 'Excellent! You correctly did NOT click for the NO-GO stimulus.',
  readyToStart: 'Now you understand the task.',
  
  // Practice completion page

  practiceCompleteContent: '<b>Practice Complete!</b><br>Great job! You have completed the practice session and are ready to begin the actual task.',
  beginTaskButton: 'Begin Task',
  
  // Block instructions

  blockBreakContent: (blockNum: number, totalBlocks: number) => '<b>Block ' + blockNum + ' Complete!</b><br>You have completed block ' + blockNum + ' of ' + totalBlocks + '.<br>Take a short break if needed, then click below to continue.',
  blockContinuePrompt: (blockNum: number) => `Click below to continue to block ${blockNum + 1}.`,

  continueButton: 'Continue',
  
  // Results/Debrief
  
  taskComplete: 'Task Complete!',
  overallAccuracy: 'Overall Accuracy:',
  averageResponseTime: 'Average Response Time (GO trials):',
  thankYouMessage: 'Thank you for completing the Go/No-Go task!',
  finishButton: 'Finish',
  
  // Alt text for images
  goStimulusAlt: 'GO stimulus',
  noGoStimulusAlt: 'NO-GO stimulus',
  
  // CSS colors
  goColor: 'green',
  noGoColor: 'red',

  //button labels
  back_button: 'Back',
  next_button: 'Next',
  
  // Trial types (used in data)
  trialTypes: {
    instructions: 'instructions',
    goNoGo: 'go-nogo',
    blockInstructions: 'block-instructions',
    debrief: 'debrief'
  },
  
  // Stimulus types (used in data)
  stimulusTypes: {
    go: 'go',
    noGo: 'no-go'
  },
  
  // Timeline unit names
  timelineUnits: {
    instructionTrial: 'instructions',
    goNoGoTrial: 'go-nogo-trial',
    debriefTrial: 'debrief'
  },
  
  // Data property names
  dataProperties: {
    accuracy: 'accuracy',
    rt: 'rt'
  }
}