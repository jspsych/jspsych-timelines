/**
 * Text configuration for the Fitts task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Practice instruction */
  instruction_practice: string;
  /** Main task instruction */
  instruction_main: string;
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

  instruction_intro: `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Fitts Tapping Task</h2>
      <p>In this task, you will tap on targets as quickly and accurately as possible.</p>
      <p>Two targets will appear on the screen. Tap back and forth between them.</p>
      <p>The targets will vary in size and distance apart.</p>
      <p>Try to be both <strong>fast</strong> and <strong>accurate</strong>!</p>
    </div>
  `,

  instruction_practice: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Practice</h3>
      <p>Let's try a few practice trials to get used to the task.</p>
    </div>
  `,

  instruction_main: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Main Task</h3>
      <p>Now you will complete the main task.</p>
      <p>Tap between the targets as quickly and accurately as you can.</p>
    </div>
  `,

  ready_prompt: "Tap to start",

  task_complete: "Task Complete",

  result_summary: (
    averageMT: number,
    accuracy: number,
    throughput: number | null
  ) => `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h3>Your Results</h3>
      <p><strong>Average movement time:</strong> ${averageMT.toFixed(0)}ms</p>
      <p><strong>Accuracy:</strong> ${accuracy.toFixed(1)}%</p>
      ${throughput !== null ? `<p><strong>Throughput:</strong> ${throughput.toFixed(2)} bits/s</p>` : ""}
    </div>
  `,
};
