/**
 * Text configuration for the Paired Associates task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Study phase instruction */
  instruction_study: string;
  /** Test phase instruction */
  instruction_test: string;
  /** Study pair display template */
  study_pair: (cue: string, target: string) => string;
  /** Test cue display template */
  test_cue: (cue: string) => string;
  /** Feedback for correct response */
  feedback_correct: string;
  /** Feedback for incorrect response */
  feedback_incorrect: (correctAnswer: string) => string;
  /** Round complete message */
  round_complete: (round: number, correct: number, total: number) => string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (
    totalCorrect: number,
    totalTrials: number,
    roundsToLearn: number | null
  ) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",

  instruction_intro: `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Paired Associates Task</h2>
      <p>In this task, you will learn pairs of words.</p>
      <p>First, you will see word pairs one at a time. Try to remember which words go together.</p>
      <p>Then, you will be tested: you'll see one word and need to choose its partner from a list.</p>
    </div>
  `,

  instruction_study: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Study Phase</h3>
      <p>You will now see word pairs. Try to remember which words are paired together.</p>
      <p>Pay attention - you will be tested on these pairs!</p>
    </div>
  `,

  instruction_test: `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Test Phase</h3>
      <p>Now you will be tested on the word pairs.</p>
      <p>For each word shown, select the word that was paired with it.</p>
    </div>
  `,

  study_pair: (cue: string, target: string) => `
    <div style="font-size: 36px; margin: 40px 0;">
      <span style="color: #333;">${cue}</span>
      <span style="margin: 0 20px; color: #999;">—</span>
      <span style="color: #333;">${target}</span>
    </div>
  `,

  test_cue: (cue: string) => `
    <div style="margin-bottom: 30px;">
      <p style="font-size: 18px; color: #666;">Which word was paired with:</p>
      <p style="font-size: 36px; font-weight: bold;">${cue}</p>
    </div>
  `,

  feedback_correct: `<p style="font-size: 24px; color: green;"><strong>Correct!</strong></p>`,

  feedback_incorrect: (correctAnswer: string) => `
    <div>
      <p style="font-size: 24px; color: red;"><strong>Incorrect</strong></p>
      <p style="font-size: 18px;">The correct answer was: <strong>${correctAnswer}</strong></p>
    </div>
  `,

  round_complete: (round: number, correct: number, total: number) => `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3>Round ${round} Complete</h3>
      <p>You got <strong>${correct} out of ${total}</strong> correct.</p>
      ${correct === total
        ? "<p style='color: green;'>Perfect! You've learned all the pairs.</p>"
        : "<p>Let's try again with the pairs you missed.</p>"
      }
    </div>
  `,

  task_complete: "Task Complete",

  result_summary: (
    totalCorrect: number,
    totalTrials: number,
    roundsToLearn: number | null
  ) => `
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h3>Your Results</h3>
      <p>Final accuracy: <strong>${totalCorrect} / ${totalTrials}</strong> pairs correct</p>
      ${roundsToLearn !== null
        ? `<p>Rounds to learn all pairs: <strong>${roundsToLearn}</strong></p>`
        : "<p>Maximum rounds reached.</p>"
      }
    </div>
  `,
};
