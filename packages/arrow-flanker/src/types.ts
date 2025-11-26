/**
 * Arrow Flanker Task - Type Definitions
 *
 * Comprehensive parameter interface based on Eriksen Flanker Task methodology
 */

/**
 * Trial congruency status
 */
export type CongruencyType = 'congruent' | 'incongruent' | 'neutral';

/**
 * Direction of target arrow
 */
export type Direction = 'left' | 'right';

/**
 * Flanker arrangement configuration
 */
export type FlankerArrangement = 'horizontal' | 'vertical';

/**
 * Block design structure
 */
export type BlockDesign = 'mixed' | 'blocked';

/**
 * Response mode
 */
export type ResponseMode = 'keyboard' | 'mouse-tracking';

/**
 * Stimulus Onset Asynchrony configuration
 * - number: fixed SOA in milliseconds
 * - number[]: randomly sample from these SOA values
 * - { min, max }: continuous random sampling range
 */
export type SOAConfig = number | number[] | { min: number; max: number };

/**
 * Congruency ratio configuration for global control manipulation
 */
export interface CongruencyRatio {
  congruent: number;
  incongruent: number;
  neutral?: number;
}

/**
 * Repetition control for sequential effects
 */
export interface RepetitionControl {
  flanker?: boolean;  // Control flanker identity repetition
  target?: boolean;   // Control target direction repetition
  response?: boolean; // Control response repetition
}

/**
 * Response key configuration
 */
export interface ResponseKeys {
  left: string[];
  right: string[];
}

/**
 * Comprehensive configuration for Arrow Flanker Task
 */
export interface ArrowFlankerConfig {
  // === Temporal Parameters (P.2) ===
  /** Stimulus Onset Asynchrony: time delay between flanker onset and target onset (ms) */
  soa?: SOAConfig;

  /** Duration to display the complete stimulus array (ms). null = response-terminated */
  stimulus_duration?: number | null;

  /** Duration to display fixation cross (ms) */
  fixation_duration?: number;

  /** Inter-trial interval: time between trials (ms) */
  iti_duration?: number;

  /** Maximum time allowed for response (ms) */
  response_timeout?: number;

  // === Spatial Parameters (P.1) ===
  /** Size of individual stimulus elements (e.g., "48px", "1.5dva") */
  stimulus_size?: string;

  /** Distance between target and nearest flanker (e.g., "10px", "1.0dva") */
  target_flanker_separation?: string;

  /** Size of fixation cross (e.g., "24px", "0.45dva") */
  fixation_size?: string;

  /** Height of stimulus container to prevent layout shifts */
  stimulus_container_height?: string;

  /** Arrangement of flankers relative to target */
  flanker_arrangement?: FlankerArrangement;

  /** Number of flanker items (4 creates 5-item array, 6 creates 7-item array) */
  num_flankers?: 4 | 6;

  // === Design Parameters (D.1, D.2, D.3) ===
  /** Include neutral trials (flankers are non-directional) */
  include_neutral?: boolean;

  /** Custom SVG for neutral flanker stimulus */
  neutral_stimulus?: string;

  /** Block structure: mixed (randomized) or blocked (grouped by condition) */
  block_design?: BlockDesign;

  /** Congruency proportion for global control manipulation (values are relative weights) */
  congruency_ratio?: CongruencyRatio;

  /** Enable tracking of sequential effects (Congruency Sequence Effect / Gratton effect) */
  track_sequence_effects?: boolean;

  /** Control stimulus repetitions for sequential effects analysis */
  control_repetitions?: RepetitionControl;

  /** Number of experimental blocks */
  num_blocks?: number;

  /** Number of trials per block */
  num_trials?: number;

  /** Duration of block breaks (ms). null = button to continue */
  block_break_duration?: number | null;

  // === Response Parameters (M.2) ===
  /** Response mode */
  response_mode?: ResponseMode;

  /** Custom response key mapping */
  response_keys?: ResponseKeys;

  /** Collect mouse trajectory data (requires response_mode: 'mouse-tracking') */
  collect_trajectory?: boolean;

  // === Data Parameters ===
  /** Custom data labels added to all trials */
  data_labels?: {
    task?: string;
    condition?: string;
    [key: string]: any;
  };

  // === Backward Compatibility ===
  /** Legacy parameter: total number of trials (use num_trials instead) */
  n?: number;
}

/**
 * Timeline variable for a single trial
 */
export interface FlankerTrialVariable {
  direction: Direction;
  congruency: CongruencyType;
  soa?: number;
  block_number?: number;
  trial_number?: number;
  previous_congruency?: CongruencyType;
  previous_direction?: Direction;
  previous_response?: string;
}
