export const englishText = {
  // Default stimuli
  defaultGoStimulus: 'GO',
  defaultNoGoStimulus: 'NO-GO',
  defaultButtonText: 'Click',
  
  // Instructions
  instructionText: 'In this task, you will see different stimuli appear on the screen.',
  goTrialInstructions: 'When you see a green stimulus (text or image with green border), click the button as quickly as possible.',
  noGoTrialInstructions: 'When you see a red stimulus (text or image with red border), do NOT click the button.',
  generalInstructions: 'Try to respond as quickly and accurately as possible.',
  startPrompt: 'Click "Start" when you\'re ready to begin.',
  startButton: 'Start',
  
  // Multi-page Instructions
  // Page 1: Overview
  overviewText: 'In this task, you will see different stimuli appear on the screen.',
  overviewPrompt: 'Click to start below.',
  nextButton: 'Next',
  
  // Page 2: GO Practice
  goPageTitle: 'GO Trials',
  goPageText: 'When you see this stimulus:',
  goPageAction: '→ Click the button as quickly as possible!',
  goPageInstructions: 'Try clicking the button below to practice:',
  gotItButton: 'Got it!',
  goFeedbackMessage: 'Perfect! You clicked quickly for the GO stimulus.',
  
  // Page 3: NO-GO Practice  
  noGoPageTitle: 'NO-GO Trials',
  noGoPageText: 'When you see this stimulus:',
  noGoPageAction: '→ Do NOT click the button!',
  noGoPageInstructions: 'Try waiting without clicking the button below:',
  waitButton: 'Wait 3 seconds...',
  noGoFeedbackMessage: 'Excellent! You correctly did NOT click for the NO-GO stimulus.',
  readyToStart: 'Great! Now you understand the task.',
  
  // Practice completion page
  practiceCompleteTitle: 'Practice Complete!',
  practiceCompleteMessage: 'Great job! You have completed the practice session and are ready to begin the actual task.',
  startTaskPrompt: 'Click the button below to start the Go/No-Go task.',
  beginTaskButton: 'Begin Task',
  
  // Block instructions
  blockHeader: (blockNum: number, totalBlocks: number) => `Block ${blockNum} of ${totalBlocks}`,
  blockBreakText: 'Take a short break if needed.',
  blockReminder: 'Remember:',
  blockContinuePrompt: 'Click "Continue" when you\'re ready to continue.',
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
  
  // Trial types (used in data)
  trialTypes: {
    instructions: 'instructions',
    goNoGo: 'go-no-go',
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
    goNoGoTrial: 'go-no-go-trial',
    debriefTrial: 'debrief'
  },
  
  // Data property names
  dataProperties: {
    accuracy: 'accuracy',
    rt: 'rt'
  }
}