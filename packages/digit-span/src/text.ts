/**
 * Default text strings for the Digit Span task.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 */
export const defaultText = {
  // -- INSTRUCTION PAGES --
  instruction_intro_forward: `<div class="instructions">
    <h2>Digit Span - Forward</h2>
    <p>In this task, you will see a series of digits presented one at a time.</p>
    <p>Your job is to <strong>remember the digits</strong> and enter them in the <strong>same order</strong> they were shown.</p>
  </div>`,

  instruction_response_forward: `<div class="instructions">
    <h2>How to Respond</h2>
    <p>After the digits are shown, a number pad will appear.</p>
    <p>Tap the digits in the <strong>same order</strong> you saw them.</p>
    <p>Use <strong>Clear</strong> to correct mistakes, then tap <strong>Done</strong> when finished.</p>
  </div>`,

  instruction_intro_backward: `<div class="instructions">
    <h2>Digit Span - Backward</h2>
    <p>Now you will do a similar task, but with a twist.</p>
    <p>This time, enter the digits in <strong>REVERSE order</strong> (backwards).</p>
  </div>`,

  instruction_example_backward: `<div class="instructions">
    <h2>Example</h2>
    <p>If you see: <strong>3</strong> then <strong>7</strong> then <strong>2</strong></p>
    <p>You should enter: <strong>2-7-3</strong> (reversed)</p>
  </div>`,

  // -- INTERACTIVE INSTRUCTION PROMPTS --
  instruction_try_forward: `<p>Let's do a practice round. Watch the digits carefully, then enter them in the same order.</p>`,
  instruction_try_backward: `<p>Let's do a practice round. Watch the digits carefully, then enter them in REVERSE order.</p>`,
  instruction_success: "Correct! Now let's move on to the real task.",
  instruction_failure: "That wasn't quite right. Let's try the practice again.",

  // Legacy instruction pages (kept for backward compatibility)
  instruction_pages_forward: [
    `<div class="instructions">
      <h2>Digit Span - Forward</h2>
      <p>In this task, you will see a series of digits presented one at a time.</p>
      <p>Your job is to <strong>remember the digits</strong> and enter them in the <strong>same order</strong> they were shown.</p>
    </div>`,
    `<div class="instructions">
      <h2>How to Respond</h2>
      <p>After the digits are shown, a number pad will appear.</p>
      <p>Tap the digits in the <strong>same order</strong> you saw them.</p>
      <p>Use <strong>Clear</strong> to correct mistakes, then tap <strong>Done</strong> when finished.</p>
    </div>`,
    `<div class="instructions">
      <h2>Example</h2>
      <p>If you see: <strong>3</strong> then <strong>7</strong> then <strong>2</strong></p>
      <p>You should enter: <strong>3-7-2</strong></p>
    </div>`,
    `<div class="instructions">
      <h2>Practice</h2>
      <p>You will start with some practice trials.</p>
      <p>Try to remember as many digits as possible!</p>
    </div>`,
  ],

  instruction_pages_backward: [
    `<div class="instructions">
      <h2>Digit Span - Backward</h2>
      <p>Now you will do a similar task, but with a twist.</p>
      <p>This time, enter the digits in <strong>REVERSE order</strong> (backwards).</p>
    </div>`,
    `<div class="instructions">
      <h2>Example</h2>
      <p>If you see: <strong>3</strong> then <strong>7</strong> then <strong>2</strong></p>
      <p>You should enter: <strong>2-7-3</strong> (reversed)</p>
    </div>`,
    `<div class="instructions">
      <h2>Practice</h2>
      <p>You will start with some practice trials for the backward version.</p>
      <p>Remember: enter digits in REVERSE order!</p>
    </div>`,
  ],

  // -- BUTTON LABELS --
  continue_button: "Continue",
  clear_button: "Clear",
  done_button: "Done",

  // -- TRIAL PROMPTS --
  ready_prompt: "Ready",
  response_prompt: "Enter the digits:",
  response_prompt_backward: "Enter the digits in REVERSE order:",

  // -- FEEDBACK MESSAGES --
  correct_feedback: "Correct!",
  incorrect_feedback: (correctAnswer: string) =>
    `Incorrect. The correct answer was: ${correctAnswer}`,

  // -- PHASE TRANSITIONS --
  practice_complete_forward:
    "Practice complete! Now you will begin the main task. Try to remember as many digits as possible.",
  practice_complete_backward:
    "Practice complete! Now you will begin the main backward task. Remember to enter digits in REVERSE order.",
  forward_complete:
    "Forward digit span complete! Next you will do the backward version.",
  task_complete: "Task Complete",
  result_summary: (forwardMaxSpan: number | null, backwardMaxSpan: number | null, totalCorrect: number) => `
    <div class="instructions">
      <h3>Your Results</h3>
      ${forwardMaxSpan !== null ? `<p><strong>Forward span:</strong> ${forwardMaxSpan}</p>` : ""}
      ${backwardMaxSpan !== null ? `<p><strong>Backward span:</strong> ${backwardMaxSpan}</p>` : ""}
      <p><strong>Total correct:</strong> ${totalCorrect}</p>
    </div>
  `,
};

// Export the type for use in other files
export type TextConfig = typeof defaultText;
