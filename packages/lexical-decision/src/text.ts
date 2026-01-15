/**
 * Text configuration for the Lexical Decision task.
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
  /** Word response button label */
  word_button: string;
  /** Nonword response button label */
  nonword_button: string;
  /** Fixation cross */
  fixation: string;
  /** Feedback for correct response */
  feedback_correct: string;
  /** Feedback for incorrect response */
  feedback_incorrect: string;
  /** Feedback for too slow response */
  feedback_timeout: string;
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
      <h2>Lexical Decision Task</h2>
      <p>In this task, you will see strings of letters. Your job is to decide
      as quickly and accurately as possible whether each string is a real
      English word or not.</p>
    </div>
  `,

  instruction_task: `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h3>How It Works</h3>
      <ol>
        <li>A <strong>+</strong> will appear briefly in the center of the screen</li>
        <li>Then a string of letters will appear</li>
        <li>Press <strong>Word</strong> if it is a real English word</li>
        <li>Press <strong>Nonword</strong> if it is NOT a real word</li>
        <li>Respond as <strong>quickly</strong> and <strong>accurately</strong> as possible</li>
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
      <p>You will no longer receive feedback.</p>
    </div>
  `,

  word_button: "Word",
  nonword_button: "Nonword",

  fixation: "<p style='font-size: 48px;'>+</p>",

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

  feedback_timeout: `
    <div style="max-width: 600px; margin: 0 auto;">
      <p style="font-size: 24px; color: orange;"><strong>Too slow!</strong></p>
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
