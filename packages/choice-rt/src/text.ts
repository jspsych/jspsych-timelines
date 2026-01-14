/**
 * Text configuration for the Choice RT task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Response button (for simple RT) */
  respond_button: string;
  /** Left button label (for 2-choice) */
  left_button: string;
  /** Right button label (for 2-choice) */
  right_button: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Simple RT instruction */
  instruction_simple: string;
  /** Choice RT instruction */
  instruction_choice: string;
  /** Practice instruction */
  instruction_practice: string;
  /** Feedback for correct response */
  feedback_correct: string;
  /** Feedback for incorrect response */
  feedback_incorrect: string;
  /** Feedback for too slow response */
  feedback_timeout: string;
  /** Feedback for anticipated response (too fast) */
  feedback_anticipated: string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (
    simpleRT: number | null,
    choiceRT: number | null,
    simpleAccuracy: number,
    choiceAccuracy: number
  ) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",
  respond_button: "RESPOND",
  left_button: "LEFT",
  right_button: "RIGHT",

  instruction_intro: `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Reaction Time Task</h2>
      <p>In this task, you will respond as quickly as possible when you see a stimulus appear.</p>
      <p>There will be two parts:</p>
      <ul>
        <li><strong>Simple RT:</strong> Press the button as soon as the stimulus appears.</li>
        <li><strong>Choice RT:</strong> Press the button that matches the stimulus location.</li>
      </ul>
      <p>Try to respond as fast and accurately as you can!</p>
    </div>
  `,

  instruction_simple: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Simple Reaction Time</h3>
      <p>Press the button as quickly as you can when you see the circle appear.</p>
      <p>Wait for the circle - don't press too early!</p>
    </div>
  `,

  instruction_choice: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Choice Reaction Time</h3>
      <p>A circle will appear on either the <strong>LEFT</strong> or <strong>RIGHT</strong> side.</p>
      <p>Press the button on the <strong>same side</strong> as the circle.</p>
      <p>Respond as quickly and accurately as possible!</p>
    </div>
  `,

  instruction_practice: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Practice</h3>
      <p>Let's try a few practice trials. You will receive feedback.</p>
    </div>
  `,

  feedback_correct: `<p style="font-size: 24px; color: green;"><strong>Correct!</strong></p>`,
  feedback_incorrect: `<p style="font-size: 24px; color: red;"><strong>Incorrect</strong></p>`,
  feedback_timeout: `<p style="font-size: 24px; color: orange;"><strong>Too slow!</strong></p>`,
  feedback_anticipated: `<p style="font-size: 24px; color: orange;"><strong>Wait for the stimulus!</strong></p>`,

  task_complete: "Task Complete",

  result_summary: (
    simpleRT: number | null,
    choiceRT: number | null,
    simpleAccuracy: number,
    choiceAccuracy: number
  ) => `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h3>Your Results</h3>
      ${simpleRT !== null ? `<p><strong>Simple RT:</strong> ${simpleRT.toFixed(0)}ms average (${simpleAccuracy.toFixed(1)}% valid)</p>` : ""}
      ${choiceRT !== null ? `<p><strong>Choice RT:</strong> ${choiceRT.toFixed(0)}ms average (${choiceAccuracy.toFixed(1)}% accuracy)</p>` : ""}
      ${simpleRT !== null && choiceRT !== null ? `<p><strong>Choice cost:</strong> ${(choiceRT - simpleRT).toFixed(0)}ms slower for choice</p>` : ""}
    </div>
  `,
};
