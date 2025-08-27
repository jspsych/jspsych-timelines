/**
 * Instruction pages array for the Go/No-Go task. Every string is a new page.
 */
export const instruction_pages = [
    "In this task, you will see symbols appear one at a time on the screen.",
    "When you see a 'go' stimulus, click the button as quickly as possible. <h2>Y</h2>",
    "But if you see the No-Go symbol, do nothing — don’t press anything. <h2>X</h2>",
    "Try to be fast, but also careful. Only press when it’s a Go.",
    "Continue when ready to start the practice.",
]

/**
 * Object with text properties used in the Go/No-Go task.
 */
export const trial_text = {
  // Default stimuli
  defaultGoStimulus: 'Y',
  defaultNoGoStimulus: 'X',
  defaultButtonText: 'Click',

  // Page 1: GO Practice
  goPageContent: 
  `<b>GO Trials</b><br>
  When you see this stimulus, click the button as quickly as possible!<br>
  Try clicking the button below to practice:`,
  goSuccess: 'Good job!',
  goFailure: 'You failed to click in time. Please try again!',
  
  // Page 2: NO-GO Practice  
  noGoPageContent:
  `<b>NO-GO Trials</b><br>
  When you see this stimulus, do NOT click the button!<br>
  Try waiting without clicking the button below:`,
  NoGoSuccess: 'Excellent! You correctly did NOT click for the NO-GO stimulus.',
  NoGoFailure: 'Remember, you should NOT click for the NO-GO stimulus!',
  
  // Practice completion page
  practiceCompleteContent:
  `<b>Practice Complete!</b><br>
  Great job! You have completed the practice session and are ready to begin the actual task.`,
  beginTaskButton: 'Begin Task',
  
  // Block instructions
  blockBreakContent: (blockNum: number, totalBlocks: number) => '<b>Block ' + blockNum + ' Complete!</b><br>You have completed block ' + blockNum + ' of ' + totalBlocks + '.<br>Take a short break if needed, then click below to continue.',
  continueButton: 'Continue',
  
  // Results/Debrief
  thankYouMessage: 'Thank you for completing the Go/No-Go task!',
  overallAccuracy: 'Overall Accuracy:',
  averageResponseTime: 'Average Response Time (GO trials):',
  finishButton: 'Finish',

  //button labels, empty strings give us just arrows per jsPsychInstructions
  back_button: '',
  next_button: ''
}