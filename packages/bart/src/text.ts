/**
 * Default text strings for the BART task.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 *
 * COUPLED KEYS - these must be edited in pairs. Three instruction strings name a
 * button by its label, and the label itself lives under a separate key. Change one
 * without the other and the instructions will tell the participant to click a
 * button that does not exist:
 *
 *   instruction_pump      <-> pump_button      ("Pump")
 *   instruction_collect   <-> collect_button   ("Collect")
 *   block_break_message   <-> continue_button  ("Continue")
 */
export const trial_text = {
  // -- INSTRUCTION PAGES --
  instruction_intro: `<div class="jspsych-bart-instructions">
    <h2 class="jspsych-bart-instructions-title">Balloon Task</h2>
    <p>In this task, you will inflate balloons to earn points.</p>
    <p>Each pump adds points to the balloon's value, but pump too much and it will pop!</p>
  </div>`,

  instruction_pump: `<div class="jspsych-bart-instructions">
    <h2 class="jspsych-bart-instructions-title">Pumping the Balloon</h2>
    <p>Click the <strong>Pump</strong> button to inflate the balloon.</p>
    <p>Each pump increases the balloon's value.</p>
  </div>`,

  instruction_collect: `<div class="jspsych-bart-instructions">
    <h2 class="jspsych-bart-instructions-title">Collecting Points</h2>
    <p>Click the <strong>Collect</strong> button to save your points and end the round.</p>
    <p>If you don't collect before the balloon pops, you lose all points for that round!</p>
  </div>`,

  // -- INTERACTIVE INSTRUCTION PROMPTS --
  instruction_try_pump: `<p>Try pumping the balloon a few times, then collect your points.</p>`,
  instruction_pump_success: "You collected your points!",
  instruction_pump_popped: "The balloon popped! In the real task, you would lose those points.",

  instruction_practice_intro: `<div class="jspsych-bart-instructions">
    <h2 class="jspsych-bart-instructions-title">Practice</h2>
    <p>Now try a practice round. Pump the balloon to earn points, but collect before it pops!</p>
    <p>Remember: the more you pump, the more you can earn - but the risk of popping increases.</p>
  </div>`,

  // BART specific text
  pump_button: "Pump",
  collect_button: "Collect",
  continue_button: "Continue",
  finish_button: "Finish",
  current_value_label: "Balloon value",
  total_points_label: "Total Points",
  point_display_format: (points: number) => `${points} points`,
  total_points_format: (points: number) => `${points}`,

  // Block break messages
  block_break_message: (currentBlock: number, totalBlocks: number, totalPoints: number) => `
<div class="jspsych-bart-instructions-container">
  <p>You have completed block ${currentBlock} of ${totalBlocks}.</p>
  <p>Current total earnings: <strong>${totalPoints}</strong></p>
  <p>Take a break if you need one, then click Continue when ready for the next block.</p>
</div>`,

  // -- COMPLETION --
  task_complete: "Task Complete",
  // adjustedAvgPumps is null when no balloon was ever collected, in which case the
  // average is undefined rather than zero.
  result_summary: (totalPoints: number, popRate: number, adjustedAvgPumps: number | null) => `
    <div class="jspsych-bart-instructions">
      <h3 class="jspsych-bart-instructions-title">Your Results</h3>
      <p><strong>Total points:</strong> ${totalPoints}</p>
      <p><strong>Pop rate:</strong> ${(popRate * 100).toFixed(1)}%</p>
      <p><strong>Average pumps (collected):</strong> ${
        adjustedAvgPumps === null
          ? "not available - no balloons collected"
          : adjustedAvgPumps.toFixed(1)
      }</p>
    </div>
  `,
};

export type TextConfig = typeof trial_text;
