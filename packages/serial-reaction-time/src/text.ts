/**
 * Serial Reaction Time Task - Text Configuration
 *
 * Supports internationalization and custom text
 */

/**
 * Text configuration interface
 */
export interface TrialText {
  /** Instructions for implicit learning condition */
  instructions_implicit: string;

  /** Instructions for explicit learning condition */
  instructions_explicit: string;

  /** Instructions for dual-task condition */
  instructions_dual_task: string;

  /** Block transition message */
  block_transition: string;

  /** Progress message template (use {current} and {total}) */
  progress_message: string;

  /** Free recall instructions */
  free_recall_instructions: string;

  /** Recognition test instructions */
  recognition_instructions: string;

  /** Generation test instructions (inclusion) */
  generation_inclusion_instructions: string;

  /** Generation test instructions (exclusion) */
  generation_exclusion_instructions: string;

  /** Prediction test instructions */
  prediction_instructions: string;

  /** Feedback message template */
  feedback_message: string;

  /** Tone counting prompt */
  tone_counting_prompt: string;

  /** Continue button text */
  continue_button: string;

  /** Submit button text */
  submit_button: string;

  /** Correct feedback */
  correct_feedback: string;

  /** Incorrect feedback */
  incorrect_feedback: string;
}

/**
 * Default English text
 */
export const trial_text: TrialText = {
  instructions_implicit: `
    <div style="max-width: 600px; margin: auto;">
      <h2>Serial Reaction Time Task</h2>
      <p>In this task, a square will appear in one of several locations on the screen.</p>
      <p>Your job is to respond as <strong>quickly and accurately</strong> as possible by pressing the key that corresponds to the location of the highlighted square.</p>
      <p>The task will consist of several blocks of trials. You may take a short break between blocks.</p>
      <p><em>Press any key to begin.</em></p>
    </div>
  `,

  instructions_explicit: `
    <div style="max-width: 600px; margin: auto;">
      <h2>Serial Reaction Time Task</h2>
      <p>In this task, a square will appear in one of several locations on the screen.</p>
      <p>Your job is to respond as <strong>quickly and accurately</strong> as possible by pressing the key that corresponds to the location of the highlighted square.</p>
      <p><strong>Important:</strong> The locations follow a repeating sequence. Try to discover and learn this pattern to respond more quickly.</p>
      <p>The task will consist of several blocks of trials. You may take a short break between blocks.</p>
      <p><em>Press any key to begin.</em></p>
    </div>
  `,

  instructions_dual_task: `
    <div style="max-width: 600px; margin: auto;">
      <h2>Serial Reaction Time Task with Tone Counting</h2>
      <p>In this task, a square will appear in one of several locations on the screen.</p>
      <p>Your job is to respond as <strong>quickly and accurately</strong> as possible by pressing the key that corresponds to the location of the highlighted square.</p>
      <p><strong>Secondary Task:</strong> While performing the main task, you will hear tones of different pitches. Please count the <strong>high-pitched</strong> tones. At the end of each block, you will be asked to report how many high tones you heard.</p>
      <p>Both tasks are important. Try to perform well on both.</p>
      <p><em>Press any key to begin.</em></p>
    </div>
  `,

  block_transition: `
    <div style="max-width: 600px; margin: auto;">
      <h2>Take a Break</h2>
      <p>You have completed this block of trials.</p>
      <p>You may take a short break if needed.</p>
      <p><em>Press any key when you are ready to continue.</em></p>
    </div>
  `,

  progress_message: `
    <p>Block {current} of {total} complete</p>
  `,

  free_recall_instructions: `
    <div style="max-width: 600px; margin: auto;">
      <h2>Pattern Recall</h2>
      <p>Did you notice any patterns or regularities in the locations where the squares appeared?</p>
      <p>If so, please describe what you noticed in the text box below. Be as specific as possible.</p>
      <p>If you did not notice any patterns, you may leave the box empty.</p>
    </div>
  `,

  recognition_instructions: `
    <div style="max-width: 600px; margin: auto;">
      <h2>Pattern Recognition</h2>
      <p>You will now see several short sequences of locations.</p>
      <p>For each sequence, please indicate whether you think it appeared during the task you just completed.</p>
      <p>Choose "Old" if you think you saw this sequence, or "New" if you think you did not.</p>
      <p><em>Press any key to begin.</em></p>
    </div>
  `,

  generation_inclusion_instructions: `
    <div style="max-width: 600px; margin: auto;">
      <h2>Sequence Generation - Inclusion</h2>
      <p>Please generate a sequence of responses by pressing the keys freely.</p>
      <p><strong>Try to reproduce the pattern from the task you just completed.</strong></p>
      <p>Generate responses that match what you remember from the task as closely as possible.</p>
      <p><em>Press any key to begin.</em></p>
    </div>
  `,

  generation_exclusion_instructions: `
    <div style="max-width: 600px; margin: auto;">
      <h2>Sequence Generation - Exclusion</h2>
      <p>Please generate a sequence of responses by pressing the keys freely.</p>
      <p><strong>Try to avoid reproducing the pattern from the task.</strong></p>
      <p>Generate responses that are different from what you remember. Do not recreate the sequence from the task.</p>
      <p><em>Press any key to begin.</em></p>
    </div>
  `,

  prediction_instructions: `
    <div style="max-width: 600px; margin: auto;">
      <h2>Prediction Task</h2>
      <p>In this task, you will see a sequence of highlighted squares.</p>
      <p>Before each square appears, try to predict which location will be highlighted next by pressing the corresponding key.</p>
      <p><em>Press any key to begin.</em></p>
    </div>
  `,

  feedback_message: `
    <div style="max-width: 600px; margin: auto;">
      <h2>Task Complete</h2>
      <p>Thank you for completing the Serial Reaction Time Task!</p>
    </div>
  `,

  tone_counting_prompt: 'How many high-pitched tones did you hear?',

  continue_button: 'Continue',

  submit_button: 'Submit',

  correct_feedback: 'Correct!',

  incorrect_feedback: 'Incorrect',
};
