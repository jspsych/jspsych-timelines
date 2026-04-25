/**
 * Text configuration for the Global-Local task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Global block instruction */
  instruction_global: string;
  /** Local block instruction */
  instruction_local: string;
  /** Mixed block instruction */
  instruction_mixed: string;
  /** Practice instruction */
  instruction_practice: string;
  /** First letter button (H) */
  letter_h_button: string;
  /** Second letter button (S) */
  letter_s_button: string;
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
    globalRT: number,
    localRT: number,
    globalAcc: number,
    localAcc: number,
    congruentRT: number,
    incongruentRT: number
  ) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",

  instruction_intro: `
    <div class="instructions">
      <h2>Global-Local Task</h2>
      <p>In this task, you will see large letters made up of smaller letters.</p>
      <p>For example, a large <strong>H</strong> might be made of small <strong>S</strong> letters.</p>
      <p>Your job is to identify either the <strong>large letter</strong> (global) or the <strong>small letters</strong> (local), depending on the instructions.</p>
    </div>
  `,

  instruction_global: `
    <div class="instructions">
      <h3>Global Block</h3>
      <p>Focus on the <strong>LARGE letter</strong> (the overall shape).</p>
      <p>Ignore the small letters that make up the shape.</p>
      <p>Press <strong>H</strong> or <strong>S</strong> based on the large letter you see.</p>
    </div>
  `,

  instruction_local: `
    <div class="instructions">
      <h3>Local Block</h3>
      <p>Focus on the <strong>SMALL letters</strong> that make up the shape.</p>
      <p>Ignore the overall large letter shape.</p>
      <p>Press <strong>H</strong> or <strong>S</strong> based on the small letters you see.</p>
    </div>
  `,

  instruction_mixed: `
    <div class="instructions">
      <h3>Mixed Block</h3>
      <p>In this block, you will switch between focusing on the <strong>large letter</strong> and the <strong>small letters</strong>.</p>
      <p>A cue will tell you which to focus on before each trial.</p>
    </div>
  `,

  instruction_practice: `
    <div class="instructions">
      <h3>Practice</h3>
      <p>Let's try a few practice trials. You will receive feedback.</p>
    </div>
  `,

  letter_h_button: "H",
  letter_s_button: "S",

  feedback_correct: `<p style="font-size: 24px; color: green;"><strong>Correct!</strong></p>`,
  feedback_incorrect: `<p style="font-size: 24px; color: red;"><strong>Incorrect</strong></p>`,
  feedback_timeout: `<p style="font-size: 24px; color: orange;"><strong>Too slow!</strong></p>`,

  task_complete: "Task Complete",

  result_summary: (
    globalRT: number,
    localRT: number,
    globalAcc: number,
    localAcc: number,
    congruentRT: number,
    incongruentRT: number
  ) => `
    <div class="instructions">
      <h3>Your Results</h3>
      <p><strong>Global trials:</strong> ${globalAcc.toFixed(1)}% accuracy, ${(globalRT / 1000).toFixed(2)}s avg RT</p>
      <p><strong>Local trials:</strong> ${localAcc.toFixed(1)}% accuracy, ${(localRT / 1000).toFixed(2)}s avg RT</p>
      <hr>
      <p><strong>Congruent trials:</strong> ${(congruentRT / 1000).toFixed(2)}s avg RT</p>
      <p><strong>Incongruent trials:</strong> ${(incongruentRT / 1000).toFixed(2)}s avg RT</p>
      <p><strong>Interference effect:</strong> ${((incongruentRT - congruentRT) / 1000).toFixed(2)}s</p>
    </div>
  `,
};
