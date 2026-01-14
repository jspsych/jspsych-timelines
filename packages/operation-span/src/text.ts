/**
 * Default text strings for the Operation Span Task.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 */
export const defaultText = {
  // -- INSTRUCTION PAGES --
  instruction_pages: [
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Memory and Math Task</h2>
      <p>In this task, you will solve math problems while remembering letters.</p>
      <p>This measures how well you can do two things at once.</p>
    </div>`,
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Math Problems</h2>
      <p>You will see math equations like:</p>
      <p style="text-align: center; font-size: 24px;">(3 + 2) - 1 = 4</p>
      <p>Decide if the answer shown is <strong>TRUE</strong> or <strong>FALSE</strong>.</p>
      <p>Try to respond quickly and accurately!</p>
    </div>`,
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Remember Letters</h2>
      <p>After each math problem, a letter will appear briefly.</p>
      <p style="text-align: center; font-size: 48px; margin: 20px;">F</p>
      <p>Remember the letter! You'll need to recall it later.</p>
    </div>`,
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Recall Phase</h2>
      <p>After several math-letter pairs, you'll see a grid of letters.</p>
      <p>Click the letters <strong>in the order you saw them</strong>.</p>
      <p>If you forget a letter, use the <strong>Blank</strong> button.</p>
    </div>`,
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Ready?</h2>
      <p>Remember:</p>
      <ul>
        <li>Answer the math problems quickly and accurately</li>
        <li>Remember the letters in order</li>
      </ul>
      <p>Good luck!</p>
    </div>`,
  ],

  // -- BUTTON LABELS --
  continue_button: "Continue",
  start_button: "Start",
  true_button: "TRUE",
  false_button: "FALSE",

  // -- RECALL INTERFACE --
  recall_prompt: "Click the letters in the order you saw them",
  clear_button: "Clear",
  blank_button: "Blank",
  done_button: "Done",

  // -- FEEDBACK --
  correct_feedback: "Correct!",
  incorrect_feedback: "Incorrect",
  timeout_feedback: "Too slow!",

  // -- TRIAL INFO --
  set_size_announcement: (size: number) => `Remember ${size} letters`,
  recall_feedback: (correct: number, total: number) =>
    `You recalled ${correct} of ${total} letters correctly.`,
  math_feedback: (correct: number, total: number) =>
    `Math: ${correct}/${total} correct`,

  // -- COMPLETION --
  task_complete: "Task complete. Thank you!",
  final_score: (ospanScore: number, mathAccuracy: number) =>
    `Your memory score: ${ospanScore}<br>Math accuracy: ${Math.round(mathAccuracy * 100)}%`,
};

// Export the type for use in other files
export type TextConfig = typeof defaultText;
