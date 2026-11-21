import type { JsPsych } from "jspsych";

import {
  ACKNOWLEDGE_MS,
  BASELINE_TRIALS,
  DEADLINE_FALLBACK_MS,
  DEADLINE_MIN_RTS,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import * as deadlines from "./deadlines";
import {
  DEFAULT_OPTIONS,
  GoNogoOptions,
  PHASE_OPTIONS,
  resolveOptions,
  validateOptions,
} from "./options";
import { calculateScores, getSummary } from "./scoring";
import type { ScoringResult } from "./scoring";
import { buildBaselineBlock, buildBlocks, toConstraints } from "./sequence";
import { renderItem } from "./stimuli";
import { TextConfig, defaultText } from "./text";
import {
  buildPhaseBlocks,
  createBaselineBlock,
  createBlock,
  createBlockFeedback,
  createCompletion,
  createContext,
  createCountdown,
  createDisplayTrial,
  createFeedback,
  createInstructionWalkthrough,
  createInstructions,
  createIti,
  createPracticeIntro,
  createResponseTrial,
  createTestIntro,
  createTrialSequence,
  splitTrials,
} from "./trials";

export interface TrialData {
  task: string;
  task_version: string;
  phase: "instructions" | "practice" | "test" | "completion";
  /** "response" is the scorable row. */
  part:
    | "instruction"
    | "instruction_example"
    | "instruction_check"
    | "instruction_feedback"
    | "response"
    | "feedback"
    | "iti"
    | "transition"
    | "block_feedback"
    | "completion";
  /** Countdown rows (`part: "transition"`): what the screen is, `"countdown"`. */
  transition?: string;
  /** 1..n (practice is block 1); null for go-only baseline blocks and for rows outside a block. */
  block?: number | null;
  /** Position within the block, 1-based. (jsPsych owns `trial_index`, a global counter; PACKAGE-STANDARD §4.) */
  trial_index_in_block?: number;
  /** go | nogo | go_control (go-only baseline block). */
  condition?: string;
  /** Identifier of the stimulus shown: its label, "<shape>_<color>", or its text. */
  stimulus?: string;
  /** center | top_center | top_left | top_right | bottom_left | bottom_right */
  stimulus_location?: string;
  /** Baseline rows: which go-only block (1..). */
  baseline_block?: number;
  /** Key (keyboard) or button index; null for nogo. */
  correct_response?: string | number | null;
  /** true if a key or button was pressed in the window. */
  responded?: boolean;
  /** Go: responded. No-go: did not respond. */
  correct?: boolean;
  /** No response in the response window (on a no-go trial this is the correct outcome). */
  timeout?: boolean;
  /** The response window of this trial, ms, or null for none. */
  response_window?: number | null;
  /** The label of a computed window rule, e.g. "mean + 2.5 SD of correct practice RTs". */
  response_window_rule?: string;
  /** ms, or null for until the end of the trial */
  stimulus_duration?: number | null;
  trial_termination?: string;
  response_device?: string;
  /** Planned duration of a display row (iti, feedback, countdown), ms. */
  duration_ms?: number;
  /** ITI rows: the sampled value, ms. */
  iti?: number;
  /** Feedback rows: the sampled value, ms; content, condition and the text shown. */
  feedback_duration?: number;
  feedback_kind?: string;
  feedback_condition?: string;
  feedback_text?: string;
  /** instruction_check rows: 1-based attempt at this step. */
  attempt?: number;
  rt?: number | null;
  response?: string | number | null;
}

/**
 * Builds the complete go/no-go timeline: instructions and walkthrough, practice, test blocks (with optional
 * go-only baseline blocks, block feedback), completion.
 */
export function createTimeline(jsPsych: JsPsych, options: GoNogoOptions = {}): { timeline: any[] } {
  const ctx = createContext(jsPsych, options);
  const o = ctx.test;
  const timeline: any[] = [];

  if (o.instruction_format === "text") timeline.push(createInstructions(ctx));
  if (o.instruction_format === "text" && o.instruction_demonstration !== "none") {
    timeline.push(createInstructionWalkthrough(ctx));
  }

  if (o.practice_trials > 0) {
    if (o.instruction_format === "text") timeline.push(createPracticeIntro(ctx));
    const [specs] = buildPhaseBlocks(ctx, "practice", [o.practice_trials]);
    timeline.push(createBlock(ctx, "practice", 1, specs));
  }
  if (o.instruction_format === "text") timeline.push(createTestIntro(ctx));

  const sizes = splitTrials(o.n_test_trials, o.n_blocks);
  const specs = buildPhaseBlocks(ctx, "test", sizes);
  let baseline = 0;
  if (o.single_task_blocks === "before_dual") timeline.push(createBaselineBlock(ctx, ++baseline));
  sizes.forEach((_, i) => {
    const block = i + 1;
    if (o.single_task_blocks === "interleaved") timeline.push(createBaselineBlock(ctx, ++baseline));
    timeline.push(createBlock(ctx, "test", block, specs[i]));
    if (o.block_feedback !== "none") timeline.push(createBlockFeedback(ctx, block));
  });
  if (o.single_task_blocks === "after_dual") timeline.push(createBaselineBlock(ctx, ++baseline));

  timeline.push(createCompletion(ctx, calculateScores));
  return { timeline };
}

/** Factories for the individual pieces, so that a variant task can be assembled by hand. Most take the object from `createContext(jsPsych, options)`. */
export const timelineUnits = {
  createContext,
  createInstructions,
  createInstructionWalkthrough,
  createPracticeIntro,
  createTestIntro,
  createResponseTrial,
  createFeedback,
  createIti,
  createCountdown,
  createDisplayTrial,
  createTrialSequence,
  createBlock,
  createBaselineBlock,
  createBlockFeedback,
  createCompletion: (ctx: ReturnType<typeof createContext>) =>
    createCompletion(ctx, calculateScores),
};

export const utils = {
  scoring: { calculateScores, getSummary },
  constants: {
    TASK_NAME,
    VERSION,
    TASK_CLASS,
    DEFAULT_OPTIONS,
    PHASE_OPTIONS,
    BASELINE_TRIALS,
    ACKNOWLEDGE_MS,
    DEADLINE_FALLBACK_MS,
    DEADLINE_MIN_RTS,
  },
  text: { defaultText },
  stimuli: { renderItem },
  sequence: { buildBlocks, buildBaselineBlock, toConstraints, splitTrials },
  deadlines,
  options: { resolveOptions, validateOptions },
};

export type { GoNogoOptions, ScoringResult, TextConfig };
