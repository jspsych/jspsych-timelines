/**
 * Arrow Flanker Task - Stimulus Generation
 *
 * Functions for creating flanker stimulus arrays
 */

import { CongruencyType, Direction, FlankerArrangement } from './types';
import { LEFT_ARROW, RIGHT_ARROW, NEUTRAL_STIMULUS } from './constants';

/**
 * Create a flanker stimulus array
 *
 * @param direction - Target arrow direction
 * @param congruency - Trial congruency type
 * @param options - Configuration options
 * @returns HTML string for the flanker stimulus
 */
export function createFlankerStimulus(
  direction: Direction,
  congruency: CongruencyType,
  options: {
    num_flankers?: 4 | 6;
    arrangement?: FlankerArrangement;
    stimulus_size?: string;
    target_flanker_separation?: string;
    neutral_stimulus?: string;
    container_height?: string;
  } = {}
): string {
  const {
    num_flankers = 4,
    arrangement = 'horizontal',
    stimulus_size = '48px',
    target_flanker_separation = '10px',
    neutral_stimulus = NEUTRAL_STIMULUS,
    container_height = '100px'
  } = options;

  // Select target arrow
  const target = direction === 'left' ? LEFT_ARROW : RIGHT_ARROW;

  // Select flanker arrows based on congruency
  let flanker: string;
  if (congruency === 'congruent') {
    flanker = target;
  } else if (congruency === 'incongruent') {
    flanker = direction === 'left' ? RIGHT_ARROW : LEFT_ARROW;
  } else {
    // neutral
    flanker = neutral_stimulus;
  }

  // Build array
  const flankers_per_side = num_flankers / 2;
  const items: string[] = [];

  for (let i = 0; i < flankers_per_side; i++) {
    items.push(flanker);
  }
  items.push(target);
  for (let i = 0; i < flankers_per_side; i++) {
    items.push(flanker);
  }

  // Apply spacing and arrangement
  const spacing = target_flanker_separation;
  const flexDirection = arrangement === 'horizontal' ? 'row' : 'column';

  const itemsHtml = items
    .map((item, index) => {
      const isTarget = index === flankers_per_side;
      const marginStyle = getMarginStyle(index, items.length, spacing, arrangement);
      return `<div class="flanker-item ${isTarget ? 'target' : 'flanker'}" style="width: ${stimulus_size}; height: ${stimulus_size}; ${marginStyle}">${item}</div>`;
    })
    .join('');

  return `<div class="flanker-stim" style="display: flex; flex-direction: ${flexDirection}; align-items: center; justify-content: center; height: ${container_height};">${itemsHtml}</div>`;
}

/**
 * Calculate margin style for spacing between items
 */
function getMarginStyle(
  index: number,
  total: number,
  spacing: string,
  arrangement: FlankerArrangement
): string {
  const isLast = index === total - 1;
  if (isLast) return '';

  if (arrangement === 'horizontal') {
    return `margin-right: ${spacing};`;
  } else {
    return `margin-bottom: ${spacing};`;
  }
}

/**
 * Create a fixation cross
 *
 * @param options - Configuration options
 * @returns HTML string for fixation cross
 */
export function createFixation(options: {
  size?: string;
  container_height?: string;
} = {}): string {
  const { size = '24px', container_height = '100px' } = options;

  return `<div class="flanker-fixation" style="display: flex; align-items: center; justify-content: center; height: ${container_height}; font-size: ${size};">+</div>`;
}

/**
 * Create a blank screen (for ITI or ISI)
 *
 * @param options - Configuration options
 * @returns HTML string for blank screen
 */
export function createBlank(options: {
  container_height?: string;
} = {}): string {
  const { container_height = '100px' } = options;

  return `<div class="flanker-blank" style="display: flex; align-items: center; justify-content: center; height: ${container_height};"></div>`;
}
