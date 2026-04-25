/**
 * Default text strings for the Simon Task.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 */
export const defaultText = {
  // -- INSTRUCTION PAGES --
  instruction_intro: `<div class="instructions">
    <h2>Simon Task</h2>
    <p>In this task, a colored circle will appear on either the left or right side of the screen.</p>
    <p>Your job is to identify the <strong>color</strong> of the circle and ignore its position.</p>
  </div>`,

  instruction_response: (leftLabel: string, rightLabel: string) => `<div class="instructions">
    <h2>How to Respond</h2>
    <p>If the circle is <strong>${leftLabel}</strong>, tap the <strong>${leftLabel}</strong> button on the left.</p>
    <p>If the circle is <strong>${rightLabel}</strong>, tap the <strong>${rightLabel}</strong> button on the right.</p>
    <p>Respond based on the <strong>color</strong>, not the position of the circle.</p>
  </div>`,

  instruction_congruent_example: `<p>Sometimes the circle will appear on the <strong>same side</strong> as its button. This makes it easier.</p>`,

  instruction_incongruent_example: `<p>Sometimes the circle will appear on the <strong>opposite side</strong> from its button. Focus on the color!</p>`,

  instruction_practice_intro: `<div class="instructions">
    <h2>Practice</h2>
    <p>Now you will do some practice trials.</p>
    <p>Try to respond as quickly and accurately as possible.</p>
  </div>`,

  // -- BUTTON LABELS --
  continue_button: "Continue",

  // -- FEEDBACK MESSAGES --
  correct_feedback: "Correct!",
  incorrect_feedback: "Incorrect",
  timeout_feedback: "Too slow!",

  // -- FIXATION --
  fixation: "+",

  // -- PHASE TRANSITIONS --
  practice_complete:
    "Practice complete! Now you will begin the main task. Remember to respond based on the color, not the position.",
  block_complete: (blockNumber: number) =>
    `Block ${blockNumber} complete. Take a short break if needed.`,

  // -- COMPLETION --
  task_complete: "Task Complete",
  result_summary: (
    accuracy: number,
    simonEffectRT: number | null,
    meanRT: number | null
  ) => {
    let html = `<div class="instructions">`;
    html += `<p><strong>Overall Accuracy:</strong> ${(accuracy * 100).toFixed(1)}%</p>`;
    if (simonEffectRT !== null) {
      html += `<p><strong>Simon Effect (RT):</strong> ${simonEffectRT.toFixed(0)} ms</p>`;
    }
    if (meanRT !== null) {
      html += `<p><strong>Mean Response Time:</strong> ${meanRT.toFixed(0)} ms</p>`;
    }
    html += `</div>`;
    return html;
  },
};

// Export the type for use in other files
export type TextConfig = typeof defaultText;
