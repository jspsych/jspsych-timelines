// constant shapes to use across the task
export const square = `
  <div role="img" aria-label="square"
    style="height:25vh;aspect-ratio:1;background:#000;margin:auto;"></div>`;
export const octagon = `
  <div role="img" aria-label="octagon"
    style="height:25vh;aspect-ratio:1;background:#000;margin:auto;clip-path:polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);"></div>`;
export const circle = `
  <div role="img" aria-label="circle"
    style="height:25vh;aspect-ratio:1;background:#000;border-radius:50%;margin:auto;"></div>`;

/**
 * Object with text properties used in the Go/No-Go task.
 *
 * note: coupled to the stimuli, so if you use different ones
 * ensure you change the instructions accordingly.
 */
export const trial_text = {
  // can feed HTML strings, so we can include the shapes
  instructions_pages: [
    "In this task, you will see symbols appear one at a time on the screen.",
    "When you see a circle, click the button as quickly as possible." + circle,
    "But if you see the octagon, do nothing — don't press anything." + octagon,
    "Try to be fast, but also careful. Only press when it's a circle.",
    "Continue when ready to start the practice.",
  ],

  // Default stimuli
  stimulusButton: "Click",

  //instructions button labels, empty strings give us just arrows per jsPsychInstructions
  backButton: "",
  nextButton: "",

  // go practice: coupled with the stimuli
  goPageContent: `<b>GO Trials</b><br>
  When you see the circle, click the button as quickly as possible!<br>
  Try clicking the button below to practice:`,
  goSuccess: "Perfect! You clicked quickly for the circle stimulus.",
  goFailure: "You failed to click in time for the circle stimulus.",

  // no-go practice: coupled with the stimuli
  noGoPageContent: `<b>NO-GO Trials</b><br>
  When you see the octagon, do NOT click the button!<br>
  Try waiting without clicking the button below:`,
  noGoSuccess: "Excellent! You correctly did NOT click for the octagon.",
  noGoFailure: "Remember, you should NOT click for the octagon!",

  // Practice completion page (after interactive instructions)
  practiceCompleteContent: `We now start with a short practice round to get used to the task before the real task begins.`,
  beginTaskButton: "Begin Task",

  // End of practice block page (after practice block)
  endOfPracticeContent: `Okay, now let's begin the real task!`,
  endOfPracticeButton: "Continue",

  // Block instructions
  blockBreakContent: (blockNum: number, totalBlocks: number) =>
    "<b>Block " +
    blockNum +
    " Complete!</b><br>You have completed block " +
    blockNum +
    " of " +
    totalBlocks +
    ".<br>Take a short break if needed, then click below to continue.",
  continueButton: "Continue",
  blockBreakTimerText: (seconds: number) =>
    `Next block begins in ${seconds} second${seconds !== 1 ? "s" : ""}...`,

  // Results/Debrief
  finishButton: "Finish",

  // -- COMPLETION --
  task_complete: "Task Complete",
  result_summary: (goAccuracy: number, nogoAccuracy: number, commissionErrors: number) => {
    let html = `<div class="jspsych-go-nogo-instructions">`;
    html += `<p><strong>Go Accuracy:</strong> ${(goAccuracy * 100).toFixed(1)}%</p>`;
    html += `<p><strong>No-Go Accuracy:</strong> ${(nogoAccuracy * 100).toFixed(1)}%</p>`;
    html += `<p><strong>Commission Errors:</strong> ${commissionErrors}</p>`;
    html += `</div>`;
    return html;
  },
};

export type TextConfig = typeof trial_text;
