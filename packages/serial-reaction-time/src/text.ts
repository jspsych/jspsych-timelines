/**
 * Default text strings for the Serial Reaction Time Task.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 */
export const defaultText = {
  // -- INSTRUCTION PAGES --
  instruction_intro: `<div class="instructions">
    <h2>Reaction Time Task</h2>
    <p>You will see a row of boxes on the screen.</p>
    <p>On each trial, one box will light up.</p>
    <p>Tap the lit box as fast as you can.</p>
  </div>`,

  instruction_practice_intro: `<div class="instructions">
    <h2>Practice</h2>
    <p>You will start with a few practice trials.</p>
    <p>Tap the lit box as quickly as possible.</p>
  </div>`,

  // -- BUTTON LABELS --
  continue_button: "Continue",
  start_button: "Start",

  // -- PHASE TRANSITIONS --
  practice_complete: `<div class="instructions">
    <p>Practice complete.</p>
    <p>The main task will start now. Try to respond as quickly and accurately as possible.</p>
  </div>`,

  block_break: (blockNumber: number, totalBlocks: number) => `<div class="transition">
    <h3>Break</h3>
    <p>Block ${blockNumber} of ${totalBlocks} complete.</p>
    <p>Take a short break if you need one. Tap the button when you are ready to continue.</p>
  </div>`,

  // -- COMPLETION --
  task_complete: "Task Complete",
  result_summary: (
    overallAccuracy: number,
    overallMeanRT: number | null,
    sequenceLearningEffect: number | null
  ) => {
    let html = `<div class="instructions">`;
    html += `<p><strong>Overall Accuracy:</strong> ${(overallAccuracy * 100).toFixed(1)}%</p>`;
    if (overallMeanRT !== null) {
      html += `<p><strong>Mean Response Time:</strong> ${overallMeanRT.toFixed(0)} ms</p>`;
    }
    if (sequenceLearningEffect !== null) {
      html += `<p><strong>Sequence Learning Effect:</strong> ${sequenceLearningEffect.toFixed(0)} ms</p>`;
      html += `<p style="font-size: 0.9em; color: #666;">(slower RT on the random block compared to neighboring sequence blocks)</p>`;
    }
    html += `</div>`;
    return html;
  },
};

// Export the type for use in other files
export type TextConfig = typeof defaultText;
