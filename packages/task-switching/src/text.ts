/**
 * Default text strings for the Task Switching paradigm.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 */
export const defaultText = {
  // -- BUTTON LABELS --
  continue_button: "Continue",
  start_button: "Start",

  // -- FIXATION --
  fixation: "+",

  // -- CUE LABELS --
  cue_magnitude: "SIZE",
  cue_parity: "ODD/EVEN",

  // -- RESPONSE BUTTON LABELS --
  button_low: "LOW",
  button_high: "HIGH",
  button_odd: "ODD",
  button_even: "EVEN",

  // -- INSTRUCTION PAGES --
  instruction_intro: `<div class="instructions">
    <h2>Task Switching</h2>
    <p>In this task, you will see single digits (1-9, excluding 5).</p>
    <p>On each trial, you will classify the digit on one of two dimensions depending on a cue.</p>
  </div>`,

  instruction_magnitude: `<div class="instructions">
    <h2>Size Task</h2>
    <p>When the cue says <strong>SIZE</strong>, judge whether the digit is:</p>
    <ul>
      <li><strong>LOW</strong> (1, 2, 3, 4)</li>
      <li><strong>HIGH</strong> (6, 7, 8, 9)</li>
    </ul>
  </div>`,

  instruction_parity: `<div class="instructions">
    <h2>Odd/Even Task</h2>
    <p>When the cue says <strong>ODD/EVEN</strong>, judge whether the digit is:</p>
    <ul>
      <li><strong>ODD</strong> (1, 3, 7, 9)</li>
      <li><strong>EVEN</strong> (2, 4, 6, 8)</li>
    </ul>
  </div>`,

  instruction_practice: `<div class="instructions">
    <h2>Practice</h2>
    <p>Now you will do some practice trials with feedback.</p>
    <p>Try to respond as quickly and accurately as possible.</p>
  </div>`,

  instruction_task: `<div class="instructions">
    <p>Practice is complete. Now you will begin the main task.</p>
    <p>There will be no feedback. Respond as quickly and accurately as possible.</p>
  </div>`,

  // -- FEEDBACK MESSAGES --
  feedback_correct: "Correct!",
  feedback_incorrect: "Incorrect",
  feedback_timeout: "Too slow!",

  // -- COMPLETION --
  task_complete: "Task Complete",
  result_summary: (
    accuracy: number,
    switchCostRT: number | null,
    meanRT: number | null
  ) => {
    let html = `<div class="instructions">`;
    html += `<p><strong>Overall Accuracy:</strong> ${(accuracy * 100).toFixed(1)}%</p>`;
    if (switchCostRT !== null) {
      html += `<p><strong>Switch Cost (RT):</strong> ${switchCostRT.toFixed(0)} ms</p>`;
    }
    if (meanRT !== null) {
      html += `<p><strong>Mean Response Time:</strong> ${meanRT.toFixed(0)} ms</p>`;
    }
    html += `</div>`;
    return html;
  },

  // -- REST BETWEEN BLOCKS --
  rest_message: (blockNumber: number) =>
    `Block ${blockNumber} complete. Take a short break if needed.`,
};

// Export the type for use in other files
export type TextConfig = typeof defaultText;
