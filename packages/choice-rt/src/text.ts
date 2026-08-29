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
  /**
   * Introduction instruction, as a function of the stimulus colors and the
   * button labels
   */
  instruction_intro: (color1: string, color2: string, label1: string, label2: string) => string;
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
  result_summary: (meanRT: number | null, accuracy: number | null) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",
  button_1: "BLUE",
  button_2: "ORANGE",

  instruction_intro: (color1, color2, label1, label2) => `
    <div class="jspsych-choice-rt-instructions">
      <h2>Choice Reaction Time</h2>
      <p>In this task, you will see colored circles appear on the screen.</p>
      <p>Your job is to press the button that matches the color of the circle as quickly as possible.</p>
      <ul>
        <li>When the circle is <strong style="color: ${color1};">${label1}</strong>, press the <strong>${label1}</strong> button.</li>
        <li>When the circle is <strong style="color: ${color2};">${label2}</strong>, press the <strong>${label2}</strong> button.</li>
      </ul>
      <p>Try to respond as fast and accurately as you can!</p>
    </div>
  `,

  instruction_task: `
    <div class="jspsych-choice-rt-instructions">
      <h3>Get Ready</h3>
      <p>Press the button that matches the color of each circle.</p>
      <p>Respond as quickly and accurately as possible!</p>
    </div>
  `,

  instruction_practice: `
    <div class="jspsych-choice-rt-instructions">
      <h3>Practice</h3>
      <p>Let's try a few practice trials. You will receive feedback.</p>
    </div>
  `,

  feedback_correct: "Correct!",
  feedback_incorrect: "Incorrect",
  feedback_timeout: "Too slow!",
  feedback_anticipated: "Wait for the stimulus!",

  task_complete: "Task Complete",

  result_summary: (meanRT: number | null, accuracy: number | null) => `
    <div class="jspsych-choice-rt-instructions">
      <h3>Your Results</h3>
      ${
        meanRT !== null
          ? `<p><strong>Average reaction time:</strong> ${meanRT.toFixed(0)} ms</p>`
          : ""
      }
      ${accuracy !== null ? `<p><strong>Accuracy:</strong> ${accuracy.toFixed(1)}%</p>` : ""}
    </div>
  `,
};
