/**
 * Default text strings for the Flanker task.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 */
export const defaultText = {
  // -- INSTRUCTION PAGES --
  instruction_intro: `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
    <h2>Flanker Task</h2>
    <p>In this task, you will see a row of five arrows on each trial.</p>
    <p>Your job is to identify the direction of the <strong>CENTER</strong> arrow and ignore the surrounding arrows.</p>
  </div>`,

  instruction_response: (leftButton: string, rightButton: string, leftArrow: string, rightArrow: string) => `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
    <h2>How to Respond</h2>
    <p>If the center arrow points <strong>LEFT</strong> ${leftArrow}, tap the <strong>${leftButton}</strong> button.</p>
    <p>If the center arrow points <strong>RIGHT</strong> ${rightArrow}, tap the <strong>${rightButton}</strong> button.</p>
  </div>`,

  // Interactive instruction prompts
  instruction_try_right: `<p>The center arrow points <strong>RIGHT</strong>. Tap the correct button.</p>`,
  instruction_try_left: `<p>The center arrow points <strong>LEFT</strong>. Tap the correct button.</p>`,
  instruction_try_incongruent: `<p>Remember: focus on the <strong>CENTER</strong> arrow only. Tap the correct button.</p>`,

  instruction_success: "Correct!",
  instruction_failure: "That's not right. Try again!",

  instruction_practice_intro: `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
    <h2>Practice</h2>
    <p>Now you will do some practice trials.</p>
    <p>Try to respond as quickly and accurately as possible.</p>
  </div>`,

  // -- BUTTON LABELS --
  left_button: "Left",
  right_button: "Right",
  continue_button: "Continue",

  // -- FEEDBACK MESSAGES --
  correct_feedback: "Correct!",
  incorrect_feedback: "Incorrect",
  timeout_feedback: "Too slow!",

  // -- FIXATION --
  fixation: "+",

  // -- PHASE TRANSITIONS --
  practice_complete: "Practice complete! Now you will begin the main task. Remember to respond as quickly and accurately as possible.",
  block_complete: (blockNumber: number) => `Block ${blockNumber} complete. Take a short break if needed.`,

};

// Export the type for use in other files
export type TextConfig = typeof defaultText;
