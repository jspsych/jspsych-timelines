/**
 * Text configuration for Corsi Block Task
 * Supports internationalization and customization
 */

export interface TrialText {
  // -- INSTRUCTION PAGES --
  instruction_intro: string;
  instruction_watch: string;
  instruction_tap: string;

  // -- INTERACTIVE INSTRUCTION PROMPTS --
  instruction_try_watch: string;
  instruction_try_tap: string;
  instruction_success: string;
  instruction_failure: string;

  // -- TRIAL PROMPTS --
  display_prompt: string;
  input_prompt: string;
  button_text: string;
  continue_button: string;
  block_break_text: (block: number, total: number) => string;
}

/**
 * Default English text
 */
export const defaultText: TrialText = {
  // -- INSTRUCTION PAGES --
  instruction_intro: `<div class="instructions">
    <h2>Block Tapping Task</h2>
    <p>In this task, you will see blocks light up in a sequence.</p>
    <p>Your job is to remember the sequence and tap the blocks in the same order.</p>
  </div>`,

  instruction_watch: `<div class="instructions">
    <h2>Watch the Sequence</h2>
    <p>First, watch carefully as the blocks light up one by one.</p>
    <p>Pay attention to the order in which they light up.</p>
  </div>`,

  instruction_tap: `<div class="instructions">
    <h2>Tap the Blocks</h2>
    <p>After the sequence finishes, tap the blocks in the same order.</p>
    <p>The sequences will get longer as you progress.</p>
  </div>`,

  // -- INTERACTIVE INSTRUCTION PROMPTS --
  instruction_try_watch: `<p>Watch the sequence below. Pay attention to which blocks light up.</p>`,
  instruction_try_tap: `<p>Now tap the blocks in the same order you just saw.</p>`,
  instruction_success: "Correct! You're ready to begin.",
  instruction_failure: "That wasn't quite right. Let's try again.",

  // -- TRIAL PROMPTS --
  display_prompt: 'Watch the sequence',
  input_prompt: 'Tap the blocks in the same order',
  button_text: 'Start',
  continue_button: 'Continue',
  block_break_text: (block: number, total: number) =>
    `Block ${block} of ${total} complete. Press any key to continue.`
};

// Alias for consistency with other packages
export type TextConfig = TrialText;

// Keep old export name for backwards compatibility
export const trial_text = defaultText;
