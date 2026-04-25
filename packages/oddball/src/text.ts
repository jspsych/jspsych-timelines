/**
 * Text configuration for the Oddball task.
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
  /** Practice instruction */
  instruction_practice: string;
  /** Main task instruction */
  instruction_task: string;
  /** Feedback for correct response (hit) */
  feedback_hit: string;
  /** Feedback for incorrect response (false alarm) */
  feedback_false_alarm: string;
  /** Feedback for missed target */
  feedback_miss: string;
  /** Feedback for correct rejection */
  feedback_correct_rejection: string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (
    hitRate: number,
    falseAlarmRate: number,
    dPrime: number | null,
    averageRT: number | null
  ) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",
  respond_button: "Respond",

  instruction_intro: `
    <div class="instructions">
      <h2>Oddball Task</h2>
      <p>In this task, you will see colored circles appear on the screen.</p>
      <p>Most circles will be one color (the <strong>standard</strong>).</p>
      <p>Occasionally, a different colored circle will appear (the <strong>target</strong>).</p>
      <p>Your job is to press the button <strong>only when you see the target</strong>.</p>
      <p>Do not respond to the standard circles.</p>
    </div>
  `,

  instruction_practice: `
    <div class="instructions">
      <h3>Practice</h3>
      <p>Let's try a few practice trials. You will receive feedback.</p>
      <p>Remember: Only respond to the <strong>target</strong> (different color).</p>
    </div>
  `,

  instruction_task: `
    <div class="instructions">
      <h3>Main Task</h3>
      <p>Now you will complete the main task.</p>
      <p>Remember: Only respond to the <strong>target</strong> color.</p>
      <p>Try to respond as quickly and accurately as possible.</p>
    </div>
  `,

  feedback_hit: `<p style="font-size: 24px; color: green;"><strong>Correct!</strong></p>`,
  feedback_false_alarm: `<p style="font-size: 24px; color: red;"><strong>Incorrect - That was not a target</strong></p>`,
  feedback_miss: `<p style="font-size: 24px; color: orange;"><strong>Missed - That was a target</strong></p>`,
  feedback_correct_rejection: `<p style="font-size: 24px; color: green;"><strong>Correct - No response needed</strong></p>`,

  task_complete: "Task Complete",

  result_summary: (
    hitRate: number,
    falseAlarmRate: number,
    dPrime: number | null,
    averageRT: number | null
  ) => `
    <div class="instructions">
      <h3>Your Results</h3>
      <p><strong>Hit rate:</strong> ${(hitRate * 100).toFixed(1)}% (targets correctly detected)</p>
      <p><strong>False alarm rate:</strong> ${(falseAlarmRate * 100).toFixed(1)}% (standards incorrectly responded to)</p>
      ${dPrime !== null ? `<p><strong>Sensitivity (d'):</strong> ${dPrime.toFixed(2)}</p>` : ""}
      ${averageRT !== null ? `<p><strong>Average RT:</strong> ${averageRT.toFixed(0)}ms</p>` : ""}
    </div>
  `,
};
