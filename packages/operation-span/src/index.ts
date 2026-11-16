import type { JsPsych } from "jspsych";

import {
  DIGITS,
  FALLBACK_DEADLINE_MS,
  GRID_COLUMNS,
  INSTRUCTION_MAX_ATTEMPTS,
  LETTERS,
  MIN_CALIBRATION_ROWS,
  PROCESSING_ACCURACY_TARGET,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import {
  DeadlineBounds,
  DeadlineContext,
  DeadlineFunction,
  calibrationRts,
  deadlines,
} from "./deadlines";
import {
  DEFAULT_OPTIONS,
  OperationSpanOptions,
  PHASE_OPTIONS,
  resolveOptions,
  validateOptions,
} from "./options";
import { fixedOrder, practiceSetSizes, scheduleBlocks } from "./schedule";
import { calculateScores, getSummary, scoreRecall } from "./scoring";
import type { ScoringResult } from "./scoring";
import { generateProblem, memorandumPool } from "./stimuli";
import { TextConfig, defaultText } from "./text";
import {
  createCompletion,
  createContext,
  createInstructionWalkthrough,
  createInstructions,
  createInterItem,
  createMemorandum,
  createPractice,
  createPracticePart,
  createProblemFeedback,
  createProcessing,
  createRecall,
  createRecallFeedback,
  createSpanTrial,
  createTest,
  createTestIntro,
  createTransition,
  planTrial,
  resolveWindow,
} from "./trials";

export interface TrialData {
  task: string;
  task_version: string;
  phase: "instructions" | "practice" | "test" | "completion";
  /** "response" is the scorable row: the recall of one span trial. */
  part:
    | "instruction"
    | "instruction_example"
    | "instruction_check"
    | "instruction_feedback"
    | "memorandum"
    | "inter_item"
    | "processing_problem"
    | "processing"
    | "response"
    | "feedback"
    | "completion";
  /** Practice rows: "storage" (letters only), "processing_only" or "combined". */
  practice_part?: "storage" | "processing_only" | "combined";
  /** Test: 1..n. Practice is block 1. */
  block?: number;
  /** Position within the block, 1-based. (jsPsych owns `trial_index`, a global counter; PACKAGE-STANDARD §4.) */
  trial_index_in_block?: number;
  set_size?: number;
  /** memorandum rows: the item and its 1-based position; processing rows: the position of the memorandum step and the problem within it. */
  memorandum?: string;
  position?: number;
  episode?: number;
  // processing rows
  problem?: string;
  shown_answer?: number;
  answer_is_true?: boolean;
  /** processing and response rows. */
  response_device?: string;
  correct_response?: string | number;
  /** The timed response (ms): the solve time in the two-screen format. null on a timeout. */
  rt?: number | null;
  solve_rt?: number | null;
  /** Two-screen format: RT of the true/false verification. */
  verify_rt?: number;
  response?: string | number | null;
  /** Processing rows: deadline missed (a speed error). */
  timeout?: boolean;
  /** Processing rows: verification right and in time. Response rows: every position right. */
  correct?: boolean;
  /** The deadline in force (ms, null = none) and the rule that gave it. */
  response_window?: number | null;
  response_window_rule?: string;
  practice_attempt?: number;
  // response (recall) rows
  presented_items?: string[];
  recalled_items?: (string | null)[];
  recall_correct_positions?: boolean[];
  n_correct_positions?: number;
  proportion_correct?: number | null;
  perfect?: boolean;
  recall_rt?: number | null;
  response_order?: string;
  response_format?: string;
  stimulus_duration?: number;
  processing_n?: number;
  processing_errors?: number | null;
  processing_timeouts?: number | null;
  /** Display rows: planned duration, ms. */
  duration_ms?: number;
  inter_item_interval?: number;
  feedback_duration?: number;
  /** feedback and instruction_feedback rows */
  feedback_kind?: string;
  /** walkthrough rows: "processing_true" | "processing_false" | "recall", and the 1-based attempt. */
  condition?: string;
  attempt?: number;
}

/**
 * Builds the complete timeline: instructions, walkthrough, practice (letters only, processing only,
 * combined), the test blocks, completion.
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: OperationSpanOptions = {}
): { timeline: any[] } {
  const ctx = createContext(jsPsych, options);
  const o = ctx.test;
  const timeline: any[] = [];
  if (o.instruction_format === "text") {
    timeline.push(createInstructions(ctx));
    if (o.instruction_demonstration !== "none") timeline.push(createInstructionWalkthrough(ctx));
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
  createTransition,
  createMemorandum,
  createInterItem,
  createProcessing,
  createRecall,
  createRecallFeedback,
  createProblemFeedback,
  createSpanTrial,
  planTrial,
  createPracticePart,
  createPractice,
  createTest,
  createCompletion,
};

export const utils = {
  scoring: { calculateScores, getSummary, scoreRecall },
  constants: {
    TASK_NAME,
    VERSION,
    TASK_CLASS,
    DEFAULT_OPTIONS,
    PHASE_OPTIONS,
    LETTERS,
    DIGITS,
    GRID_COLUMNS,
    PROCESSING_ACCURACY_TARGET,
    FALLBACK_DEADLINE_MS,
    MIN_CALIBRATION_ROWS,
    INSTRUCTION_MAX_ATTEMPTS,
  },
  text: { defaultText },
  deadlines: { ...deadlines, calibrationRts, resolve: resolveWindow },
  stimuli: { generateProblem, memorandumPool },
  sequence: { scheduleBlocks, fixedOrder, practiceSetSizes },
  options: { resolveOptions, validateOptions },
};

export type {
  OperationSpanOptions,
  ScoringResult,
  TextConfig,
  DeadlineFunction,
  DeadlineContext,
  DeadlineBounds,
};
