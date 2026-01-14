/**
 * Text configuration for the Antisaccade task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Left response button label */
  left_button: string;
  /** Right response button label */
  right_button: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Prosaccade block instruction */
  instruction_prosaccade: string;
  /** Antisaccade block instruction */
  instruction_antisaccade: string;
  /** Practice instruction */
  instruction_practice: string;
  /** Feedback for correct response */
  feedback_correct: string;
  /** Feedback for incorrect response */
  feedback_incorrect: string;
  /** Feedback for too slow response */
  feedback_timeout: string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (
    antisaccadeAccuracy: number,
    prosaccadeAccuracy: number,
    antisaccadeRT: number | null,
    prosaccadeRT: number | null,
    antisaccadeErrors: number
  ) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",
  left_button: "LEFT",
  right_button: "RIGHT",

  instruction_intro: `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Antisaccade Task</h2>
      <p>In this task, you will see a fixation cross (+) in the center of the screen.</p>
      <p>Then, a cue will appear on either the <strong>LEFT</strong> or <strong>RIGHT</strong> side.</p>
      <p>Your job is to respond based on where the cue appears.</p>
      <p>Sometimes you will respond to the <strong>SAME</strong> side as the cue.</p>
      <p>Other times you will respond to the <strong>OPPOSITE</strong> side from the cue.</p>
      <p>Pay attention to the instructions before each block.</p>
    </div>
  `,

  instruction_prosaccade: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Same Side Block</h3>
      <p>Press the button on the <strong>SAME SIDE</strong> as the cue.</p>
      <p>If you see the cue on the left, press <strong>LEFT</strong>.</p>
      <p>If you see the cue on the right, press <strong>RIGHT</strong>.</p>
    </div>
  `,

  instruction_antisaccade: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Opposite Side Block</h3>
      <p>Press the button on the <strong>OPPOSITE SIDE</strong> from the cue.</p>
      <p>If you see the cue on the left, press <strong>RIGHT</strong>.</p>
      <p>If you see the cue on the right, press <strong>LEFT</strong>.</p>
      <p>You must inhibit your natural tendency to respond to the same side!</p>
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

  task_complete: "Task Complete",

  result_summary: (
    antisaccadeAccuracy: number,
    prosaccadeAccuracy: number,
    antisaccadeRT: number | null,
    prosaccadeRT: number | null,
    antisaccadeErrors: number
  ) => `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h3>Your Results</h3>
      <p><strong>Opposite side (antisaccade):</strong> ${antisaccadeAccuracy.toFixed(1)}% accuracy${
        antisaccadeRT !== null ? `, ${antisaccadeRT.toFixed(0)}ms avg RT` : ""
      }</p>
      <p><strong>Same side (prosaccade):</strong> ${prosaccadeAccuracy.toFixed(1)}% accuracy${
        prosaccadeRT !== null ? `, ${prosaccadeRT.toFixed(0)}ms avg RT` : ""
      }</p>
      <hr>
      <p><strong>Antisaccade errors:</strong> ${antisaccadeErrors} (responses to wrong side)</p>
      <p><em>Lower errors indicate better inhibitory control.</em></p>
    </div>
  `,
};
