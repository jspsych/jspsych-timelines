import type { JsPsych } from "jspsych";

import {
  DEFAULT_POSITION_REPEAT_MAX,
  DEFAULT_RESHUFFLE_PROPORTION,
  INSTRUCTION_MAX_ATTEMPTS,
  INSTRUCTION_SET_SIZE,
  MAX_SET_SIZE,
  POOL_SIZE,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import {
  DEFAULT_OPTIONS,
  PHASE_OPTIONS,
  SelfOrderedPointingOptions,
  resolveOptions,
  validateOptions,
} from "./options";
import { practiceSetSizes, scheduleBlocks } from "./schedule";
import { calculateScores, getSummary } from "./scoring";
import type { ScoringResult } from "./scoring";
import { recognitionProbability, simulateCorrectPick, simulateMemoryPick } from "./simulate";
import { assignItems, buildPool, gridDims, nextArrangement } from "./stimuli";
import { TextConfig, defaultText } from "./text";
import {
  createCompletion,
  createContext,
  createDisplayTrial,
  createInstructionWalkthrough,
  createInstructions,
  createPickTrial,
  createPractice,
  createSeries,
  createTest,
  createTestIntro,
  planSeries,
} from "./trials";

export interface TrialData {
  task: string;
  task_version: string;
  phase: "instructions" | "practice" | "test" | "completion";
  /** "response" is the scorable row: one pick (one page of one series). */
  part:
    | "instruction"
    | "instruction_check"
    | "instruction_feedback"
    | "transition"
    | "iti"
    | "response"
    | "feedback"
    | "reminder"
    | "completion";
  /** Test: 1..n (one per set size in the grouped orders). Practice is block 1. */
  block?: number;
  /** Position of the series within its block, 1-based. (jsPsych owns `trial_index`, a global counter; PACKAGE-STANDARD §4.) */
  trial_index_in_block?: number;
  /** Number of the series in its phase, 1-based. */
  series?: number;
  /** Number of the series among those of its set size in the phase, 1-based. */
  set_size_trial?: number;
  /** Items in the set, which is also the number of pages in the series. */
  set_size?: number;
  /** Page within the series, 1-based. */
  choice_index?: number;
  stimulus_layout?: string;
  rearrangement_rule?: string;
  response_device?: string;
  /** The item picked (null on a timeout); `response` is the same value. */
  chosen_item_id?: string | null;
  /** The item picked on the page before (null on the first page or after a timeout). */
  previous_item_id?: string | null;
  response?: string | null;
  /** Slot picked, 1-based in reading order (row by row); null on a timeout. With free positions it is the cell of the item, not a fixed place. */
  chosen_position?: number | null;
  chosen_row?: number | null;
  chosen_col?: number | null;
  /** Item id in each slot, in slot order, on this page. */
  item_arrangement?: string[];
  /** Free-positions layout: each slot's offset inside its cell, `{u, v}` from 0 to 1. */
  item_offsets?: { u: number; v: number }[];
  /** Enforced position rule: the 1-based slot that could not be clicked on this page. */
  disabled_position?: number | null;
  /** Items already picked in the series when the page began. */
  n_picked_before?: number;
  /** The pick repeats an item already picked in the series. */
  is_repeat_error?: boolean;
  /** A new item was picked (false for a repeat and for a timeout). Feedback rows: the same value for the page. */
  correct?: boolean | null;
  /** Consecutive picks at this slot, including this one. */
  same_position_run?: number;
  /** The run exceeds `position_repeat_max` (only when `position_repeat_rule` is not "none"). */
  position_rule_violation?: boolean;
  rt?: number | null;
  timeout?: boolean;
  /** The response window in force (ms, null = none). */
  response_window?: number | null;
  /** Display rows: planned duration, ms. */
  duration_ms?: number;
  /** The blank before a page, ms (also `duration_ms` on those rows). */
  iti?: number;
  feedback_duration?: number;
  feedback_kind?: string;
  /** Walkthrough rows: "first", "new" or "last", and the 1-based attempt. */
  condition?: string;
  attempt?: number;
  revealed_item_id?: string;
}

/**
 * Builds the complete timeline: instructions, walkthrough, practice, the test (one node per block, each holding its
 * series), completion.
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: SelfOrderedPointingOptions = {}
): { timeline: any[] } {
  const ctx = createContext(jsPsych, options);
  const o = ctx.test;
  const timeline: any[] = [];
  if (o.instruction_format === "text") {
    timeline.push(createInstructions(ctx));
    if (o.instruction_demonstration === "interactive")
      timeline.push(createInstructionWalkthrough(ctx));
  }
  timeline.push(...createPractice(ctx));
  if (o.instruction_format === "text") timeline.push(createTestIntro(ctx));
  timeline.push(...createTest(ctx));
  timeline.push(createCompletion(ctx));
  return { timeline };
}

/** Factories for the individual pieces, so that a variant task can be assembled by hand. Most take the object from `createContext(jsPsych, options)`. */
export const timelineUnits = {
  createContext,
  createInstructions,
  createInstructionWalkthrough,
  createTestIntro,
  createPickTrial,
  createDisplayTrial,
  createSeries,
  planSeries,
  createPractice,
  createTest,
  createCompletion,
};

export const utils = {
  scoring: { calculateScores, getSummary },
  constants: {
    TASK_NAME,
    VERSION,
    TASK_CLASS,
    DEFAULT_OPTIONS,
    PHASE_OPTIONS,
    POOL_SIZE,
    MAX_SET_SIZE,
    INSTRUCTION_SET_SIZE,
    INSTRUCTION_MAX_ATTEMPTS,
    DEFAULT_RESHUFFLE_PROPORTION,
    DEFAULT_POSITION_REPEAT_MAX,
  },
  text: { defaultText },
  stimuli: { buildPool, assignItems, gridDims, nextArrangement },
  sequence: { scheduleBlocks, practiceSetSizes },
  simulation: { recognitionProbability, simulateMemoryPick, simulateCorrectPick },
  options: { resolveOptions, validateOptions },
};

export type { SelfOrderedPointingOptions, ScoringResult, TextConfig };
