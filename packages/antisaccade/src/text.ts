/**
 * Text configuration for the Antisaccade task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Left response button label */
  left_button: string;
  /** Right response button label */
  right_button: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Prosaccade block instruction */
  instruction_prosaccade: string;
  /** Antisaccade block instruction */
  instruction_antisaccade: string;
  /** Practice instruction */
  instruction_practice: string;
  /** Feedback for correct response */
  feedback_correct: string;
  /** Feedback for incorrect response */
  feedback_incorrect: string;
  /** Feedback for too slow response */
  feedback_timeout: string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (
    antisaccadeAccuracy: number,
    prosaccadeAccuracy: number,
    antisaccadeRT: number | null,
    prosaccadeRT: number | null,
    antisaccadeErrors: number
  ) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",
  left_button: "LEFT",
  right_button: "RIGHT",

  instruction_intro: `
    <div class="instructions">
      <h2>Antisaccade Task</h2>
      <p>A dot will flash on the <strong>LEFT</strong> or <strong>RIGHT</strong> side of the screen.</p>
      <p>Your job is to press a button based on where the dot appears.</p>
      <p>Pay attention to the instructions before each block.</p>
    </div>
  `,

  instruction_prosaccade: `
    <div class="instructions">
      <h3>Same Side Block</h3>
      <p>Press the button on the <strong>SAME SIDE</strong> as the dot.</p>
      <ul>
        <li>Dot on left → Press <strong>LEFT</strong></li>
        <li>Dot on right → Press <strong>RIGHT</strong></li>
      </ul>
    </div>
  `,

  instruction_antisaccade: `
    <div class="instructions">
      <h3>Opposite Side Block</h3>
      <p>Press the button on the <strong>OPPOSITE SIDE</strong> from the dot.</p>
      <ul>
        <li>Dot on left → Press <strong>RIGHT</strong></li>
        <li>Dot on right → Press <strong>LEFT</strong></li>
      </ul>
      <p>Resist the urge to respond toward the dot!</p>
    </div>
  `,

  instruction_practice: `
    <div class="instructions">
      <h3>Practice</h3>
      <p>Try a few practice trials first. You'll see feedback after each response.</p>
    </div>
  `,

  feedback_correct: `<p style="font-size: 24px; color: green;"><strong>Correct!</strong></p>`,
  feedback_incorrect: `<p style="font-size: 24px; color: red;"><strong>Incorrect</strong></p>`,
  feedback_timeout: `<p style="font-size: 24px; color: orange;"><strong>Too slow!</strong></p>`,

  task_complete: "Task Complete",

  result_summary: (
    antisaccadeAccuracy: number,
    prosaccadeAccuracy: number,
    antisaccadeRT: number | null,
    prosaccadeRT: number | null,
    antisaccadeErrors: number
  ) => `
    <div class="instructions">
      <h3>Your Results</h3>
      <p><strong>Opposite side:</strong> ${antisaccadeAccuracy.toFixed(1)}% correct${
        antisaccadeRT !== null ? ` (${antisaccadeRT.toFixed(0)}ms avg)` : ""
      }</p>
      <p><strong>Same side:</strong> ${prosaccadeAccuracy.toFixed(1)}% correct${
        prosaccadeRT !== null ? ` (${prosaccadeRT.toFixed(0)}ms avg)` : ""
      }</p>
    </div>
  `,
};
