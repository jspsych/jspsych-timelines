/**
 * Default text strings for the Berg Card Sorting Test.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 */
export const defaultText = {
  // -- INSTRUCTION PAGES --
  instruction_pages: [
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Card Sorting Task</h2>
      <p>In this task, you will sort cards by matching them to one of four piles at the top of the screen.</p>
      <p>Each card has a color, shape, and number of symbols.</p>
    </div>`,
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>How to Play</h2>
      <p>The correct way to sort depends on a <strong>rule</strong>, but you won't be told what the rule is.</p>
      <p>You will need to figure out the rule based on the feedback you receive.</p>
    </div>`,
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Rule Changes</h2>
      <p>The rule may <strong>change</strong> during the task without warning.</p>
      <p>When you notice the rule has changed, try to figure out the new rule as quickly as possible.</p>
    </div>`,
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Ready?</h2>
      <p>Tap on a pile to sort each card. You will receive feedback after each choice.</p>
      <p>Try to sort as many cards correctly as you can.</p>
    </div>`,
  ],

  // -- BUTTON LABELS --
  continue_button: "Continue",
  start_button: "Start",

  // -- FEEDBACK MESSAGES --
  correct_feedback: "Correct!",
  incorrect_feedback: "Incorrect",

  // -- PROMPTS --
  sort_prompt: "Tap on a pile to sort this card",

  // -- COMPLETION --
  task_complete: "Task Complete",
  result_summary: (categoriesCompleted: number, perseverativeErrors: number, totalErrors: number) => `
    <div class="instructions">
      <h3>Your Results</h3>
      <p><strong>Categories completed:</strong> ${categoriesCompleted}</p>
      <p><strong>Perseverative errors:</strong> ${perseverativeErrors}</p>
      <p><strong>Total errors:</strong> ${totalErrors}</p>
    </div>
  `,
};

// Export the type for use in other files
export type TextConfig = typeof defaultText;
