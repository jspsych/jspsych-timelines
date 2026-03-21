/**
 * Text configuration for the Simple RT task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Response button label */
  respond_button: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Task instruction */
  instruction_task: string;
  /** Practice instruction */
  instruction_practice: string;
  /** Feedback for correct response */
  feedback_correct: string;
  /** Feedback for too slow response */
  feedback_timeout: string;
  /** Feedback for anticipated response (too fast) */
  feedback_anticipated: string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (meanRT: number | null, accuracy: number) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",
  respond_button: "RESPOND",

  instruction_intro: `
    <div class="instructions">
      <h2>Simple Reaction Time</h2>
      <p>In this task, you will respond as quickly as possible when you see a circle appear on the screen.</p>
      <p>Press the button as soon as you see the circle. Try to be as fast as you can!</p>
      <p>But wait for the circle to appear - don't press too early.</p>
    </div>
  `,

  instruction_task: `
    <div class="instructions">
      <h3>Get Ready</h3>
      <p>Press the button as quickly as you can when the circle appears.</p>
      <p>Wait for the circle - don't press too early!</p>
    </div>
  `,

  instruction_practice: `
    <div class="instructions">
      <h3>Practice</h3>
      <p>Let's try a few practice trials. You will receive feedback.</p>
    </div>
  `,

  feedback_correct: "Correct!",
  feedback_timeout: "Too slow!",
  feedback_anticipated: "Wait for the stimulus!",

  task_complete: "Task Complete",

  result_summary: (meanRT: number | null, accuracy: number) => `
    <div class="instructions">
      <h3>Your Results</h3>
      ${meanRT !== null ? `<p><strong>Average reaction time:</strong> ${meanRT.toFixed(0)} ms</p>` : ""}
      <p><strong>Valid responses:</strong> ${accuracy.toFixed(1)}%</p>
    </div>
  `,
};
