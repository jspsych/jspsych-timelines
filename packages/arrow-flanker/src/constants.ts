/**
 * Arrow Flanker Task - Constants
 *
 * SVG definitions and default parameter values
 */

import { ArrowFlankerConfig, ResponseKeys } from './types';

/**
 * Left-pointing arrow SVG (48x48)
 */
export const LEFT_ARROW = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path fill="black" d="M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z"/></svg>`;

/**
 * Right-pointing arrow SVG (48x48)
 */
export const RIGHT_ARROW = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path fill="black" d="m24 40-2.1-2.15L34.25 25.5H8v-3h26.25L21.9 10.15 24 8l16 16Z"/></svg>`;

/**
 * Neutral stimulus (horizontal line/dash)
 */
export const NEUTRAL_STIMULUS = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><rect x="12" y="22.5" width="24" height="3" fill="black"/></svg>`;

/**
 * Default response keys
 */
export const DEFAULT_RESPONSE_KEYS: ResponseKeys = {
  left: ['ArrowLeft'],
  right: ['ArrowRight']
};

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Required<Omit<ArrowFlankerConfig, 'neutral_stimulus' | 'control_repetitions' | 'response_keys' | 'data_labels' | 'n' | 'collect_trajectory'>> = {
  // Temporal parameters
  soa: 0,  // Simultaneous presentation (standard)
  stimulus_duration: null,  // Response-terminated
  fixation_duration: 500,
  iti_duration: 0,
  response_timeout: 1500,

  // Spatial parameters
  stimulus_size: '48px',
  target_flanker_separation: '10px',
  fixation_size: '24px',
  stimulus_container_height: '100px',
  flanker_arrangement: 'horizontal',
  num_flankers: 4,

  // Design parameters
  include_neutral: false,
  block_design: 'mixed',
  congruency_ratio: {
    congruent: 1,
    incongruent: 1,
    neutral: 0
  },
  track_sequence_effects: false,
  num_blocks: 1,
  num_trials: 12,
  block_break_duration: null,

  // Response parameters
  response_mode: 'keyboard'
};
