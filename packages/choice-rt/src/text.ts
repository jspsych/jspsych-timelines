/**
 * Text configuration for the Choice RT task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Button 1 label (corresponds to stimulus color 1) */
  button_1: string;
  /** Button 2 label (corresponds to stimulus color 2) */
  button_2: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Task instruction */
  instruction_task: string;
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
  result_summary: (meanRT: number | null, accuracy: number) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",
  button_1: "BLUE",
  button_2: "ORANGE",

  instruction_intro: `
    <div class="instructions">
      <h2>Choice Reaction Time</h2>
      <p>In this task, you will see colored circles appear on the screen.</p>
      <p>Your job is to press the button that matches the color of the circle as quickly as possible.</p>
      <ul>
        <li>When you see a <strong style="color: #4A90D9;">BLUE</strong> circle, press the <strong>BLUE</strong> button.</li>
        <li>When you see an <strong style="color: #E8913A;">ORANGE</strong> circle, press the <strong>ORANGE</strong> button.</li>
      </ul>
      <p>Try to respond as fast and accurately as you can!</p>
    </div>
  `,

  instruction_task: `
    <div class="instructions">
      <h3>Get Ready</h3>
      <p>Press the button that matches the color of each circle.</p>
      <p>Respond as quickly and accurately as possible!</p>
    </div>
  `,

  instruction_practice: `
    <div class="instructions">
      <h3>Practice</h3>
      <p>Let's try a few practice trials. You will receive feedback.</p>
    </div>
  `,

  feedback_correct: "Correct!",
  feedback_incorrect: "Incorrect",
  feedback_timeout: "Too slow!",
  feedback_anticipated: "Wait for the stimulus!",

  task_complete: "Task Complete",

  result_summary: (meanRT: number | null, accuracy: number) => `
    <div class="instructions">
      <h3>Your Results</h3>
      ${meanRT !== null ? `<p><strong>Average reaction time:</strong> ${meanRT.toFixed(0)} ms</p>` : ""}
      <p><strong>Accuracy:</strong> ${accuracy.toFixed(1)}%</p>
    </div>
  `,
};
