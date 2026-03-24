/**
 * Default text strings for the Stop Signal Task.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 */
export const defaultText = {
  // -- INSTRUCTION PAGES --
  instruction_intro: `<div class="instructions">
    <h2>Stop Signal Task</h2>
    <p>In this task, you will see an arrow pointing left or right.</p>
    <p>Your job is to press the button matching the direction of the arrow as quickly as possible.</p>
  </div>`,

  instruction_response: `<div class="instructions">
    <h2>How to Respond</h2>
    <p>If the arrow points <strong>left</strong>, press the <strong>LEFT</strong> button.</p>
    <p>If the arrow points <strong>right</strong>, press the <strong>RIGHT</strong> button.</p>
    <p>Try to respond as quickly and accurately as possible.</p>
  </div>`,

  instruction_stop_signal: `<div class="instructions">
    <h2>Stop Signal</h2>
    <p>On some trials, the arrow will turn <strong style="color: #D32F2F;">red</strong> shortly after appearing.</p>
    <p>When this happens, try to <strong>stop yourself</strong> from pressing any button.</p>
    <p>It will not always be possible to stop. Just do your best.</p>
  </div>`,

  instruction_strategy: `<div class="instructions">
    <h2>Important</h2>
    <p>Do not wait for the stop signal to appear before responding.</p>
    <p>Always try to respond quickly on every trial, and stop if you see the signal.</p>
  </div>`,

  instruction_practice_intro: `<div class="instructions">
    <h2>Practice</h2>
    <p>Now you will do some practice trials.</p>
    <p>Remember: respond quickly to the arrow direction, but stop if the arrow turns red.</p>
  </div>`,

  // -- BUTTON LABELS --
  continue_button: "Continue",
  left_button: "LEFT",
  right_button: "RIGHT",

  // -- FEEDBACK MESSAGES --
  correct_go_feedback: "Correct!",
  incorrect_go_feedback: "Incorrect",
  timeout_go_feedback: "Too slow!",
  successful_stop_feedback: "Good stop!",
  failed_stop_feedback: "Try to stop!",

  // -- FIXATION --
  fixation: "+",

  // -- PHASE TRANSITIONS --
  practice_complete:
    "Practice complete! Now you will begin the main task. Remember to respond quickly and stop when you see the red signal.",

  // -- COMPLETION --
  task_complete: "Task Complete",
  result_summary: (
    goAccuracy: number,
    stopAccuracy: number,
    meanGoRT: number | null,
    ssrt: number | null
  ) => {
    let html = `<div class="instructions">`;
    html += `<p><strong>Go Accuracy:</strong> ${(goAccuracy * 100).toFixed(1)}%</p>`;
    html += `<p><strong>Stop Accuracy:</strong> ${(stopAccuracy * 100).toFixed(1)}%</p>`;
    if (meanGoRT !== null) {
      html += `<p><strong>Mean Go Response Time:</strong> ${meanGoRT.toFixed(0)} ms</p>`;
    }
    if (ssrt !== null) {
      html += `<p><strong>Stop Signal Reaction Time:</strong> ${ssrt.toFixed(0)} ms</p>`;
    }
    html += `</div>`;
    return html;
  },
};

// Export the type for use in other files
export type TextConfig = typeof defaultText;
