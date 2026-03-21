/**
 * Text configuration for the Tower of London task.
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
  trial_prompt: string;
  /** Practice complete message */
  practice_complete: string;
  /** Practice feedback - solved */
  practice_feedback_solved: (moves: number, optimal: number) => string;
  /** Practice feedback - not solved */
  practice_feedback_not_solved: string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (solved: number, total: number, avgMoves: number) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",

  instruction_intro: `
    <div class="instructions">
      <h2>Tower of London Task</h2>
      <p>In this task, you will see colored balls arranged on pegs. Your goal is to
      rearrange the balls to match a target configuration shown on the screen.</p>
    </div>
  `,

  instruction_task: `
    <div class="instructions">
      <h3>How to Play</h3>
      <ul>
        <li><strong>Click a peg</strong> with balls to select the top ball</li>
        <li><strong>Click another peg</strong> to move the ball there</li>
        <li>You can only move the <strong>top ball</strong> on each peg</li>
        <li>Each peg has a <strong>maximum capacity</strong> (shown by dots)</li>
        <li>Try to match the goal configuration in as <strong>few moves</strong> as possible</li>
      </ul>
    </div>
  `,

  instruction_practice: `
    <div class="instructions">
      <h3>Practice Trial</h3>
      <p>Let's try a practice puzzle to get familiar with the task.</p>
    </div>
  `,

  instruction_test: `
    <div class="instructions">
      <h3>Main Task</h3>
      <p>Now you will complete a series of puzzles. Try to solve each one in as few
      moves as possible.</p>
      <p>Each puzzle will end automatically when you reach the goal.</p>
    </div>
  `,

  trial_prompt: "<p>Move the balls to match the goal configuration.</p>",

  practice_complete: `
    <div class="instructions">
      <p>Practice complete! You're ready for the main task.</p>
    </div>
  `,

  practice_feedback_solved: (moves: number, optimal: number) => `
    <div class="instructions">
      <h3>Puzzle Solved!</h3>
      <p>You completed the puzzle in <strong>${moves} ${moves === 1 ? "move" : "moves"}</strong>.</p>
      ${moves === optimal
        ? "<p>That's the optimal solution!</p>"
        : `<p>The optimal solution uses ${optimal} ${optimal === 1 ? "move" : "moves"}.</p>`
      }
    </div>
  `,

  practice_feedback_not_solved: `
    <div class="instructions">
      <h3>Time's Up</h3>
      <p>Don't worry - this was just for practice. Let's continue.</p>
    </div>
  `,

  task_complete: "Task Complete",

  result_summary: (solved: number, total: number, avgMoves: number) => `
    <div class="instructions">
      <p>You solved <strong>${solved} out of ${total}</strong> puzzles.</p>
      <p>Average moves per solved puzzle: <strong>${avgMoves.toFixed(1)}</strong></p>
    </div>
  `,
};
