/**
 * Default text strings for the BART task.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 */
export const trial_text = {
  // -- INSTRUCTION PAGES --
  instruction_intro: `<div class="instructions">
    <h2>Balloon Task</h2>
    <p>In this task, you will inflate balloons to earn points.</p>
    <p>Each pump adds points to the balloon's value, but pump too much and it will pop!</p>
  </div>`,

  instruction_pump: `<div class="instructions">
    <h2>Pumping the Balloon</h2>
    <p>Click the <strong>Pump</strong> button to inflate the balloon.</p>
    <p>Each pump increases the balloon's value.</p>
  </div>`,

  instruction_collect: `<div class="instructions">
    <h2>Collecting Points</h2>
    <p>Click the <strong>Collect</strong> button to save your points and end the round.</p>
    <p>If you don't collect before the balloon pops, you lose all points for that round!</p>
  </div>`,

  // -- INTERACTIVE INSTRUCTION PROMPTS --
  instruction_try_pump: `<p>Try pumping the balloon a few times, then collect your points.</p>`,
  instruction_pump_success: "You collected your points!",
  instruction_pump_popped: "The balloon popped! In the real task, you would lose those points.",

  instruction_practice_intro: `<div class="instructions">
    <h2>Practice</h2>
    <p>Now try a practice round. Pump the balloon to earn points, but collect before it pops!</p>
    <p>Remember: the more you pump, the more you can earn - but the risk of popping increases.</p>
  </div>`,

  // Task completion messages
  task_complete_header: "Task Complete!",
  task_complete_message: "Thank you for participating in the balloon task.",

  // BART specific text
  pump_button: "Pump",
  collect_button: "Collect",
  continue_button: "Continue",
  start_button: "Start",
  finish_button: "Finish",
  current_value_label: "Balloon value",
  total_points_label: "Total Points",
  point_display_format: (points: number) => `${points} points`,
  total_points_format: (points: number) => `${points}`,

  // Trial feedback messages
  balloon_popped_message: "The balloon exploded. You earned nothing this round.",
  collected_message: "You collected",
  timeout_message: "Time limit reached - earnings automatically collected.",
  total_earnings_message: "Total earnings across all rounds:",
  current_earnings_message: "Current total earnings:",
  possible_earnings_message: "Possible earnings this round:",

  // Block break messages
  block_break_message: (currentBlock: number, totalBlocks: number, totalPoints: number) => `
<div class="instructions-container">
  <p>You have completed block ${currentBlock} of ${totalBlocks}.</p>
  <p>Current total earnings: <strong>${totalPoints}</strong></p>
  <p>Take a break if you need one, then click Continue when ready for the next block.</p>
</div>`,

  // Final results
  end_result_message: (points: number) => `
<div class="instructions-container">
  <p>You earned a total of <strong>${points}</strong> points!</p>
  <p>Thanks for participating!</p>
</div>`,
};

// Aliases for consistency with other packages
export const defaultText = trial_text;
export type TextConfig = typeof trial_text;