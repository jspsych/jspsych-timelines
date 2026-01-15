/**
 * Text configuration for the Mental Rotation task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Task explanation */
  instruction_task: string;
  /** Practice instruction */
  instruction_practice: string;
  /** Test phase instruction */
  instruction_test: string;
  /** Same response button label */
  same_button: string;
  /** Different response button label */
  different_button: string;
  /** Study phase prompt */
  study_prompt: string;
  /** Test phase prompt showing rotation direction */
  test_prompt: (direction: "left" | "right") => string;
  /** Feedback for correct response */
  feedback_correct: string;
  /** Feedback for incorrect response */
  feedback_incorrect: string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (accuracy: number, avgRT: number) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",

  instruction_intro: `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Mental Rotation Task</h2>
      <p>In this task, you will see patterns on a grid. Your job is to decide if
      two patterns are the same after a rotation, or if they are different.</p>
    </div>
  `,

  instruction_task: `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h3>How It Works</h3>
      <ol>
        <li>First, you will see a <strong>pattern</strong> on a grid</li>
        <li>Remember this pattern, then press Continue</li>
        <li>Next, you will see a <strong>second pattern</strong></li>
        <li>The second pattern is either the <strong>same</strong> pattern rotated
        90 degrees, or a <strong>different</strong> pattern</li>
        <li>Press <strong>Same</strong> if it matches the original after rotation</li>
        <li>Press <strong>Different</strong> if it does not match</li>
      </ol>
    </div>
  `,

  instruction_practice: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Practice Trials</h3>
      <p>Let's try a few practice trials to get familiar with the task.</p>
      <p>You will receive feedback after each response.</p>
    </div>
  `,

  instruction_test: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Main Task</h3>
      <p>Now you will complete the main trials. Work as quickly and accurately as possible.</p>
    </div>
  `,

  same_button: "Same",
  different_button: "Different",

  study_prompt: "<p>Study this pattern, then press Continue.</p>",
  test_prompt: (direction) =>
    `<p>Is this the same pattern rotated 90° to the ${direction}?</p>`,

  feedback_correct: `
    <div style="max-width: 600px; margin: 0 auto;">
      <p style="font-size: 24px; color: green;"><strong>Correct!</strong></p>
    </div>
  `,

  feedback_incorrect: `
    <div style="max-width: 600px; margin: 0 auto;">
      <p style="font-size: 24px; color: red;"><strong>Incorrect</strong></p>
    </div>
  `,

  task_complete: "Task Complete",

  result_summary: (accuracy: number, avgRT: number) => `
    <div style="max-width: 600px; margin: 0 auto;">
      <p>Accuracy: <strong>${accuracy.toFixed(1)}%</strong></p>
      <p>Average response time: <strong>${(avgRT / 1000).toFixed(2)} seconds</strong></p>
    </div>
  `,
};
