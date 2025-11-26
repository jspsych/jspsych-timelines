/**
 * Arrow Flanker Task - Text Configuration
 *
 * All user-facing text strings for internationalization and customization
 */

export const trial_text = {
  /**
   * Block break message
   * @param block_number - Current block number
   * @param total_blocks - Total number of blocks
   * @param duration - Duration of break (null for key press to continue)
   */
  block_break: (block_number: number, total_blocks: number, duration: number | null) => {
    return `Block ${block_number} of ${total_blocks} complete. ${
      duration === null ? 'Press any key to continue.' : 'Take a short break...'
    }`;
  }
};

export type TrialText = typeof trial_text;
