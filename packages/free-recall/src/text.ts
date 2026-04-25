/**
 * Text configuration for the Free Recall task.
 * All text strings can be customized for translation or modification.
 */
export interface TextConfig {
  /** Continue button label */
  continue_button: string;
  /** Start button label */
  start_button: string;
  /** Add word button label */
  add_button: string;
  /** Done recalling button label */
  done_button: string;
  /** Introduction instruction */
  instruction_intro: string;
  /** Study phase instruction */
  instruction_study: string;
  /** Recall phase instruction */
  instruction_recall: string;
  /** Input placeholder text */
  input_placeholder: string;
  /** Text shown during word presentation */
  study_prompt: string;
  /** Recall prompt shown during recall phase */
  recall_prompt: string;
  /** Label for the recalled words list */
  words_list_label: string;
  /** Task complete header */
  task_complete: string;
  /** Results summary */
  result_summary: (
    correctRecalls: number,
    totalWords: number,
    intrusions: number,
    repetitions: number
  ) => string;
}

export const defaultText: TextConfig = {
  continue_button: "Continue",
  start_button: "Start",
  add_button: "Add",
  done_button: "Done",

  instruction_intro: `
    <div class="instructions">
      <h2>Free Recall Task</h2>
      <p>In this task, you will see a list of words presented one at a time.</p>
      <p>Try to remember as many words as you can.</p>
      <p>After all words have been shown, you will type in as many words as you can remember.</p>
      <p>You can recall the words in any order.</p>
    </div>
  `,

  instruction_study: `
    <div class="instructions">
      <h3>Study Phase</h3>
      <p>Watch carefully! Words will appear one at a time.</p>
      <p>Try to remember each word.</p>
    </div>
  `,

  instruction_recall: `
    <div class="instructions">
      <h3>Recall Phase</h3>
      <p>Type each word you remember, one at a time.</p>
      <p>Press <strong>Add</strong> after each word (or press Enter).</p>
      <p>When you can't remember any more, press <strong>Done</strong>.</p>
    </div>
  `,

  input_placeholder: "Type a word...",

  study_prompt: "Remember this word:",

  recall_prompt: "<p>Type the words you remember, one at a time.</p>",

  words_list_label: "Words recalled:",

  task_complete: "Task Complete",

  result_summary: (
    correctRecalls: number,
    totalWords: number,
    intrusions: number,
    repetitions: number
  ) => `
    <div class="instructions">
      <h3>Your Results</h3>
      <p><strong>Words recalled:</strong> ${correctRecalls} out of ${totalWords}</p>
      <p><strong>Recall rate:</strong> ${((correctRecalls / totalWords) * 100).toFixed(1)}%</p>
      ${intrusions > 0 ? `<p><strong>Intrusions:</strong> ${intrusions} (words not on the list)</p>` : ""}
      ${repetitions > 0 ? `<p><strong>Repetitions:</strong> ${repetitions} (words recalled more than once)</p>` : ""}
    </div>
  `,
};
