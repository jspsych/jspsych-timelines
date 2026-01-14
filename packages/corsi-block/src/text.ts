/**
 * Text configuration for Corsi Block Task
 * Supports internationalization and customization
 */

export interface TrialText {
  display_prompt: string;
  input_prompt: string;
  button_text: string;
  block_break_text: (block: number, total: number) => string;
}

/**
 * Default English text
 */
export const trial_text: TrialText = {
  display_prompt: 'Watch the sequence',
  input_prompt: 'Tap the blocks in the same order',
  button_text: 'Start',
  block_break_text: (block: number, total: number) =>
    `Block ${block} of ${total} complete. Press any key to continue.`
};
