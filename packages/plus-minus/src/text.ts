/**
 * Text configuration for the Plus-Minus task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Addition block instruction */
  instruction_add: string;
  /** Subtraction block instruction */
  instruction_subtract: string;
  /** Alternating block instruction */
  instruction_alternate: string;
  /** Practice instruction */
  instruction_practice: string;
  /** Feedback for correct response */
  feedback_correct: string;
  /** Feedback for incorrect response */
  feedback_incorrect: string;
  /** Block complete message */
  block_complete: (blockName: string, time: number) => string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (addTime: number, subTime: number, altTime: number, switchCost: number) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",

  instruction_intro: `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Plus-Minus Task</h2>
      <p>In this task, you will see numbers and perform simple arithmetic.</p>
      <p>You will complete three blocks:</p>
      <ol>
        <li><strong>Addition block:</strong> Add 3 to each number</li>
        <li><strong>Subtraction block:</strong> Subtract 3 from each number</li>
        <li><strong>Alternating block:</strong> Switch between adding and subtracting 3</li>
      </ol>
      <p>Work as quickly and accurately as possible.</p>
    </div>
  `,

  instruction_add: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Addition Block</h3>
      <p>For each number, <strong>add 3</strong> and type your answer.</p>
      <p>Work as quickly and accurately as possible.</p>
    </div>
  `,

  instruction_subtract: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Subtraction Block</h3>
      <p>For each number, <strong>subtract 3</strong> and type your answer.</p>
      <p>Work as quickly and accurately as possible.</p>
    </div>
  `,

  instruction_alternate: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Alternating Block</h3>
      <p>Now you will <strong>alternate</strong> between adding and subtracting 3.</p>
      <p>The first number: <strong>ADD 3</strong></p>
      <p>The second number: <strong>SUBTRACT 3</strong></p>
      <p>The third number: <strong>ADD 3</strong></p>
      <p>And so on...</p>
      <p>Work as quickly and accurately as possible.</p>
    </div>
  `,

  instruction_practice: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Practice</h3>
      <p>Let's try a few practice trials first.</p>
    </div>
  `,

  feedback_correct: `<p style="font-size: 24px; color: green;"><strong>Correct!</strong></p>`,

  feedback_incorrect: `<p style="font-size: 24px; color: red;"><strong>Incorrect</strong></p>`,

  block_complete: (blockName: string, time: number) => `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>${blockName} Complete</h3>
      <p>Time: <strong>${(time / 1000).toFixed(2)} seconds</strong></p>
    </div>
  `,

  task_complete: "Task Complete",

  result_summary: (addTime: number, subTime: number, altTime: number, switchCost: number) => `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h3>Your Results</h3>
      <p>Addition block: <strong>${(addTime / 1000).toFixed(2)}s</strong></p>
      <p>Subtraction block: <strong>${(subTime / 1000).toFixed(2)}s</strong></p>
      <p>Alternating block: <strong>${(altTime / 1000).toFixed(2)}s</strong></p>
      <hr>
      <p>Switch cost: <strong>${(switchCost / 1000).toFixed(2)}s</strong></p>
      <p style="font-size: 12px; color: #666;">(Alternating time minus average of single-task times)</p>
    </div>
  `,
};
