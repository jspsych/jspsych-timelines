/**
 * Default text strings for the Trail Making Test.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 */
export const defaultText = {
  // -- INSTRUCTION PAGES --
  instruction_intro: `
    <div class="instructions">
      <h2>Trail Making Test</h2>
      <p>In this task, you will connect circles in order as quickly as possible.</p>
      <p>Click or tap on each circle in the correct sequence.</p>
    </div>
  `,

  instruction_part_a: `
    <div class="instructions">
      <h2>Part A: Numbers</h2>
      <p>Connect the circles in <strong>numerical order</strong>:</p>
      <p style="font-size: 1.2em; text-align: center;"><strong>1 → 2 → 3 → 4 → 5 ...</strong></p>
      <p>Start with 1, then click 2, then 3, and so on.</p>
    </div>
  `,

  instruction_part_b: `
    <div class="instructions">
      <h2>Part B: Numbers and Letters</h2>
      <p>Connect the circles <strong>alternating between numbers and letters</strong>:</p>
      <p style="font-size: 1.2em; text-align: center;"><strong>1 → A → 2 → B → 3 → C ...</strong></p>
      <p>Start with 1, then A, then 2, then B, and so on.</p>
    </div>
  `,

  instruction_practice: `
    <div class="instructions">
      <h2>Practice</h2>
      <p>Let's do a practice round first.</p>
      <p>If you make a mistake, the circles will flash red. Keep trying until you complete the sequence.</p>
    </div>
  `,

  instruction_speed: `
    <div class="instructions">
      <h2>Go as fast as you can!</h2>
      <p>Try to complete the trail as quickly as possible while still being accurate.</p>
      <p>Your time will be recorded.</p>
    </div>
  `,

  // -- PROMPTS DURING TRIALS --
  part_a_prompt: "<p>Connect the numbers in order: <strong>1 → 2 → 3 → 4 ...</strong></p>",
  part_b_prompt: "<p>Alternate numbers and letters: <strong>1 → A → 2 → B → 3 → C ...</strong></p>",

  practice_part_a_prompt: "<p><em>Practice:</em> Connect the numbers in order</p>",
  practice_part_b_prompt: "<p><em>Practice:</em> Alternate numbers and letters</p>",

  // -- BUTTON LABELS --
  continue_button: "Continue",
  start_button: "Start",

  // -- FEEDBACK MESSAGES --
  practice_complete: "Practice complete! Now you will do the main task.",
  part_a_complete: "Part A complete! Now you will do Part B.",
  task_complete: "Task complete! Thank you.",

  // -- RESULT DISPLAY --
  result_part_a: (time: number, errors: number) =>
    `<p><strong>Part A:</strong> ${(time / 1000).toFixed(1)} seconds, ${errors} errors</p>`,
  result_part_b: (time: number, errors: number) =>
    `<p><strong>Part B:</strong> ${(time / 1000).toFixed(1)} seconds, ${errors} errors</p>`,
  result_summary: (partATime: number | null, partBTime: number | null, differenceScore: number | null) => {
    let html = `<div class="instructions">`;
    if (partATime !== null) {
      html += `<p><strong>Part A Time:</strong> ${(partATime / 1000).toFixed(1)} seconds</p>`;
    }
    if (partBTime !== null) {
      html += `<p><strong>Part B Time:</strong> ${(partBTime / 1000).toFixed(1)} seconds</p>`;
    }
    if (differenceScore !== null) {
      html += `<p><strong>Switching Cost:</strong> ${(differenceScore / 1000).toFixed(1)} seconds</p>`;
    }
    html += `</div>`;
    return html;
  },
};

// Export the type for use in other files
export type TextConfig = typeof defaultText;
