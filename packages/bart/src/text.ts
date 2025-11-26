/*
 * This is an array of HTML strings for instruction pages displayed before the actual trials.
 * Researchers can modify these instructions to change the task description, add new instruction
 * pages, or translate to different languages.
 *
 * Each string should contain valid HTML that will be displayed as an instruction page.
 * You can add more pages by adding more strings to the array, or modify existing pages
 * by editing the HTML content.
 */
const instruction_pages = [
  "<b>In this task, you will inflate a balloon to earn money.</b>",
  "Click <b>Pump</b> to inflate the balloon and earn money with each pump.",
  "Click <b>Collect</b> to save your money and end the round.",
  "If the balloon pops, you lose the money for that round!",
  "Work quickly but carefully - you have limited time per trial.",
  "Click below to start the task.",
];

/** Object containing configurable text used in the BART timeline. */
export const trial_text = {
  // Instruction messages
  // Instruction pages buttons text, these will always have arrows < and >
  // these do not work right now due to CSS fixed position, might fix later
  next_button: "",
  back_button: "",
  instruction_pages: instruction_pages,

  // Task completion messages
  task_complete_header: "Task Complete!",
  task_complete_message: "Thank you for participating in the balloon task.",

  // BART specific text
  pump_button: "Pump",
  collect_button: "Collect",
  continue_button: "Continue",
  start_button: "Start",
  finish_button: "Finish",

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