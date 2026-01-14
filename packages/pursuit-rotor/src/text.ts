/**
 * Text configuration for the Pursuit Rotor task.
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
  /** Prompt shown during trials */
  trial_prompt: (trialNum: number, totalTrials: number) => string;
  /** Practice complete message */
  practice_complete: string;
  /** Practice feedback */
  practice_feedback: (percentOnTarget: number) => string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (avgPercent: number, improvement: number | null) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",

  instruction_intro: `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Pursuit Rotor Task</h2>
      <p>In this task, you will track a moving target with your cursor. The target
      moves in a circle, and your goal is to keep your cursor on the target as
      much as possible.</p>
      <p>This task measures motor coordination and tracking ability.</p>
    </div>
  `,

  instruction_task: `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h3>How It Works</h3>
      <ul>
        <li>A <strong>red circle</strong> will move around the screen</li>
        <li>Move your cursor to <strong>stay on the target</strong></li>
        <li>When you're on the target, it will turn <strong>green</strong></li>
        <li>Try to keep the target green as much as possible</li>
        <li>Each trial lasts <strong>15 seconds</strong></li>
      </ul>
    </div>
  `,

  instruction_practice: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Practice Trial</h3>
      <p>Let's try a short practice trial to get familiar with the task.</p>
    </div>
  `,

  instruction_test: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Main Task</h3>
      <p>Now you will complete the main trials. Try to keep your cursor on the
      target as much as possible throughout each trial.</p>
    </div>
  `,

  trial_prompt: (trialNum: number, totalTrials: number) =>
    `<p>Keep your cursor on the target. Trial ${trialNum} of ${totalTrials}.</p>`,

  practice_complete: `
    <div style="max-width: 600px; margin: 0 auto;">
      <p>Practice complete! You're ready for the main task.</p>
    </div>
  `,

  practice_feedback: (percentOnTarget: number) => `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Practice Results</h3>
      <p>You kept your cursor on the target for <strong>${percentOnTarget.toFixed(1)}%</strong> of the time.</p>
    </div>
  `,

  task_complete: "Task Complete",

  result_summary: (avgPercent: number, improvement: number | null) => {
    let html = `
      <div style="max-width: 600px; margin: 0 auto;">
        <p>Average time on target: <strong>${avgPercent.toFixed(1)}%</strong></p>
    `;
    if (improvement !== null) {
      const direction = improvement >= 0 ? "improved" : "decreased";
      html += `<p>Your performance ${direction} by <strong>${Math.abs(improvement).toFixed(1)}%</strong> from first to last trial.</p>`;
    }
    html += `</div>`;
    return html;
  },
};
