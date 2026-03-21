/**
 * Text configuration for the Fitts task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Message shown when device needs to be rotated to landscape */
  orientation_message: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Practice instruction */
  instruction_practice: string;
  /** Main task instruction */
  instruction_task: string;
  /** Ready prompt before each trial */
  ready_prompt: string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (
    averageMT: number,
    accuracy: number,
    throughput: number | null
  ) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",

  orientation_message: `<p style="font-size: 24px;">Please rotate your device to <strong>landscape</strong> mode to continue.</p>`,

  instruction_intro: `
    <div class="instructions">
      <h2>Tapping Task</h2>
      <p>In this task, you will tap on targets as quickly as possible.</p>
      <p>A target bar will appear on either the left or right side of the screen.</p>
      <p>Tap the bar, and a new one will appear on the opposite side.</p>
      <p>The targets will vary in size and distance apart.</p>
      <p>Try to tap as <strong>quickly</strong> as you can!</p>
    </div>
  `,

  instruction_practice: `
    <div class="instructions">
      <h3>Practice</h3>
      <p>Let's try a few practice trials to get used to the task.</p>
    </div>
  `,

  instruction_task: `
    <div class="instructions">
      <h3>Main Task</h3>
      <p>Now you will complete the main task.</p>
      <p>Tap each target as quickly as you can.</p>
    </div>
  `,

  ready_prompt: "Tap to start",

  task_complete: "Task Complete",

  result_summary: (
    averageMT: number,
    accuracy: number,
    throughput: number | null
  ) => `
    <div class="instructions">
      <h3>Your Results</h3>
      <p><strong>Average movement time:</strong> ${averageMT.toFixed(0)}ms</p>
      <p><strong>Accuracy:</strong> ${accuracy.toFixed(1)}%</p>
      ${throughput !== null ? `<p><strong>Throughput:</strong> ${throughput.toFixed(2)} bits/s</p>` : ""}
    </div>
  `,
};
