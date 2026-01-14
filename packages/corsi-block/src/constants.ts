/**
 * Corsi Block Task - Constants
 *
 * Default parameter values based on standard Corsi Block methodology
 */

import { CorsiBlockConfig, BlockPosition } from './types';

/**
 * Default block positions approximating the original Corsi block layout
 * Coordinates are percentages of display width/height
 */
export const DEFAULT_BLOCKS: BlockPosition[] = [
  { y: 80, x: 45 },
  { y: 94, x: 80 },
  { y: 70, x: 20 },
  { y: 60, x: 70 },
  { y: 50, x: 35 },
  { y: 40, x: 6 },
  { y: 45, x: 94 },
  { y: 25, x: 60 },
  { y: 6, x: 47 },
];

/**
 * Default configuration values based on standard Corsi Block parameters
 */
export const DEFAULT_CONFIG: Required<Omit<CorsiBlockConfig, 'text_object' | 'data_labels' | 'blocks'>> = {
  // Temporal parameters
  stimulus_duration: 1000,  // Standard: 1000ms
  inter_stimulus_interval: 1000,  // Standard: 1000ms
  isi_mode: 'fixed',
  post_sequence_delay: 500,  // Standard: 500ms
  inter_trial_delay: 1500,  // Standard: 1500ms
  response_timeout: null,  // Standard: None (infinite)

  // Visual parameters
  block_colors: {
    inactive: '#0066cc',  // Blue
    active: '#ffcc00',    // Yellow
    correct: '#00ff00',   // Green
    incorrect: '#ff0000'  // Red
  },
  background_color: '#000000',  // Black
  click_feedback_duration: 200,  // Standard: ~200ms flash
  display_width: '400px',
  display_height: '400px',
  block_size: 12,

  // Interaction parameters
  input_modality: 'touchscreen',
  sequence_initiation: 'auto',
  allow_correction: false,

  // Algorithm parameters
  starting_length: 2,  // Standard: 2 blocks
  trials_per_length: 2,  // Standard: 2 trials
  stop_rule: 'both-trials',  // Standard: fail both trials
  consecutive_errors_threshold: 3,
  sequence_generation: 'fixed',
  allow_repeats: false,  // Standard: no immediate repeats
  max_length: 9  // Standard: typically tests up to 9
};
