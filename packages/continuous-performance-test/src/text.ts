/**
 * Text configuration for the Continuous Performance Test.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Introduction instruction for standard mode */
  instruction_standard: string;
  /** Introduction instruction for inhibition mode */
  instruction_inhibition: string;
  /** Introduction instruction for AX mode */
  instruction_ax: string;
  /** Practice instruction */
  instruction_practice: string;
  /** Main task instruction */
  instruction_task: string;
  /** Respond button label */
  respond_button: string;
  /** Rest screen text */
  rest_screen: string;
  /** Feedback for correct response (hit) */
  feedback_hit: string;
  /** Feedback for incorrect response (false alarm / commission) */
  feedback_false_alarm: string;
  /** Feedback for missed target (omission) */
  feedback_miss: string;
  /** Feedback for correct rejection */
  feedback_correct_rejection: string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (
    hitRate: number,
    commissionRate: number,
    dPrime: number | null,
    averageRT: number | null
  ) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",
  respond_button: "RESPOND",

  instruction_standard: `
    <div class="instructions">
      <h2>Continuous Performance Test</h2>
      <p>In this task, letters will appear one at a time on the screen.</p>
      <p>Tap the <strong>RESPOND</strong> button when you see the target letter <strong>X</strong>.</p>
      <p>Do <strong>not</strong> tap for any other letter.</p>
      <p>Try to respond as quickly and accurately as possible.</p>
    </div>
  `,

  instruction_inhibition: `
    <div class="instructions">
      <h2>Continuous Performance Test</h2>
      <p>In this task, letters will appear one at a time on the screen.</p>
      <p>Tap the <strong>RESPOND</strong> button for <strong>every</strong> letter you see.</p>
      <p>Do <strong>not</strong> tap when you see the letter <strong>X</strong>.</p>
      <p>Try to respond as quickly and accurately as possible.</p>
    </div>
  `,

  instruction_ax: `
    <div class="instructions">
      <h2>Continuous Performance Test</h2>
      <p>In this task, letters will appear in pairs: a <strong>cue</strong> followed by a <strong>probe</strong>.</p>
      <p>Tap the <strong>RESPOND</strong> button only when you see the letter <strong>X</strong> after the letter <strong>A</strong>.</p>
      <p>Do <strong>not</strong> tap for any other combination.</p>
      <p>Try to respond as quickly and accurately as possible.</p>
    </div>
  `,

  instruction_practice: `
    <div class="instructions">
      <h3>Practice</h3>
      <p>Let's try a few practice trials. You will receive feedback after each response.</p>
    </div>
  `,

  instruction_task: `
    <div class="instructions">
      <h3>Main Task</h3>
      <p>Now you will complete the main task. There will be no feedback.</p>
      <p>Try to respond as quickly and accurately as possible.</p>
    </div>
  `,

  rest_screen: `
    <div class="instructions">
      <h3>Rest</h3>
      <p>Take a short break. Press the button when you are ready to continue.</p>
    </div>
  `,

  feedback_hit: `<p style="font-size: 24px; color: green;"><strong>Correct!</strong></p>`,
  feedback_false_alarm: `<p style="font-size: 24px; color: red;"><strong>Incorrect - Do not respond to that stimulus</strong></p>`,
  feedback_miss: `<p style="font-size: 24px; color: orange;"><strong>Missed - You should have responded</strong></p>`,
  feedback_correct_rejection: `<p style="font-size: 24px; color: green;"><strong>Correct - No response needed</strong></p>`,

  task_complete: "Task Complete",

  result_summary: (
    hitRate: number,
    commissionRate: number,
    dPrime: number | null,
    averageRT: number | null
  ) => `
    <div class="instructions">
      <h3>Your Results</h3>
      <p><strong>Hit rate:</strong> ${(hitRate * 100).toFixed(1)}%</p>
      <p><strong>Commission rate:</strong> ${(commissionRate * 100).toFixed(1)}%</p>
      ${dPrime !== null ? `<p><strong>Sensitivity (d'):</strong> ${dPrime.toFixed(2)}</p>` : ""}
      ${averageRT !== null ? `<p><strong>Average RT:</strong> ${averageRT.toFixed(0)}ms</p>` : ""}
    </div>
  `,
};
