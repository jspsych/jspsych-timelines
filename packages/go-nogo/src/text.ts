// constant shapes to use across the task
export const square = `
  <div role="img" aria-label="Go square"
    style="height:25vh;aspect-ratio:1;background:#000;margin:auto;"></div>`;
export const circle = `
  <div role="img" aria-label="No-Go circle"
    style="height:25vh;aspect-ratio:1;background:#000;border-radius:50%;margin:auto;"></div>`;

/**
 * Object with text properties used in the Go/No-Go task.
 */
export const trial_text = {
  // Instruction pages
  instructions_pages: [
    "In this task, you will see symbols appear one at a time on the screen.",
    "When you see a square, click the button as quickly as possible." + square,
    "But if you see the circle, do nothing — don't press anything." + circle,
    "Try to be fast, but also careful. Only press when it's a square.",
    "Continue when ready to start the practice.",
  ],

  // Default stimuli
  stimulusButton: 'Click',

  //instructions button labels, empty strings give us just arrows per jsPsychInstructions
  backButton: '',
  nextButton: '',

  // Page 1: GO Practice
  goPageContent: 
  `<b>GO Trials</b><br>
  When you see the square, click the button as quickly as possible!<br>
  Try clicking the button below to practice:`,
  goSuccess: 'Perfect! You clicked quickly for the square stimulus.',
  goFailure: 'You failed to click in time for the square stimulus.',

  // Page 2: NO-GO Practice  
  noGoPageContent:
  `<b>NO-GO Trials</b><br>
  When you see the circle, do NOT click the button!<br>
  Try waiting without clicking the button below:`,
  noGoSuccess: 'Excellent! You correctly did NOT click for the circle.',
  noGoFailure: 'Remember, you should NOT click for the circle!',

  // Practice completion page
  practiceCompleteContent:
  `<b>Practice Complete!</b><br>
  Great job! You have completed the practice session and are ready to begin the actual task.`,
  beginTaskButton: 'Begin Task',

  // Block instructions
  blockBreakContent: (blockNum: number, totalBlocks: number) => '<b>Block ' + blockNum + ' Complete!</b><br>You have completed block ' + blockNum + ' of ' + totalBlocks + '.<br>Take a short break if needed, then click below to continue.',
  continueButton: 'Continue',

  // Results/Debrief
  debriefContent: (accuracy: number, meanRT: number) => `
    <div class="go-nogo-debrief">
      <p>Thank you for completing the Go/No-Go task!</p>
      <p><strong>Overall Accuracy:</strong> ${accuracy}%</p>
      <p><strong>Average Response Time (GO trials):</strong> ${meanRT}ms</p>
    </div>`,
  thankYouMessage: 'Thank you for completing the Go/No-Go task!',
  overallAccuracy: 'Overall Accuracy:',
  averageResponseTime: 'Average Response Time (GO trials):',
  finishButton: 'Finish',
}