import type { JsPsych } from "jspsych";

import {
  ATTENTION_CHECK_PROBES,
  CUE_DURATION_MS,
  DEFAULT_PX_PER_DEG,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import {
  DEFAULT_OPTIONS,
  FlankerOptions,
  PHASE_OPTIONS,
  resolveOptions,
  validateOptions,
} from "./options";
import { calculateScores, getSummary } from "./scoring";
import type { ScoringResult } from "./scoring";
import { allocateCounts, buildTrialSpecs } from "./sequence";
import { renderArray, renderGlyph } from "./stimuli";
import { TextConfig, defaultText } from "./text";
import {
  createAttentionChecks,
  createBlock,
  createBlockFeedback,
  createCalibration,
  createCompletion,
  createContext,
  createCue,
  createDeviceCheck,
  createDisplayTrial,
  createFeedback,
  createFixation,
  createInstructions,
  createIti,
  createPracticeIntro,
  createPreview,
  createResponseTrial,
  createRestBreak,
  createTestIntro,
  createTransition,
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
    | "calibration"
    | "device_check"
    | "attention_check"
    | "fixation"
    | "cue"
    | "preview"
    | "response"
    | "feedback"
    | "iti"
    | "block_feedback"
    | "rest"
    | "transition"
    | "completion";
  /** 1..n (practice is block 1). */
  block?: number | null;
  /** Position within the block, 1-based. (The spec's `trial_index`; renamed because jsPsych owns `trial_index`.) */
  trial_in_block?: number;
  congruency?: "congruent" | "incongruent" | "neutral" | "nogo";
  /** congruent | incongruent | neutral_dash | neutral_empty | neutral_<form> | nogo */
  flanker_condition?: string;
  target?: string;
  flankers?: string;
  flankers_per_side?: number;
  /** Key (keyboard) or button index; null for nogo. */
  correct_response?: string | number | null;
  correct?: boolean;
  timeout?: boolean;
  flanker_distance?: number;
  flanker_distance_unit?: "px" | "deg";
  flanker_target_soa?: number;
  /** ms, or null for until response */
  stimulus_duration?: number | null;
  response_window?: number | null;
  cued?: boolean | null;
  cue_target_interval?: number;
  response_device?: string;
  /** Planned duration of a display row (fixation, cue, preview, feedback, iti), ms. */
  duration_ms?: number;
  fixation_duration?: number;
  /** Feedback rows: content, condition and the text shown. */
  feedback_kind?: string;
  feedback_condition?: string;
  feedback_text?: string;
  rt?: number | null;
  response?: string | number | null;
}

/**
 * Builds the complete flanker timeline: [calibration], [device check], instructions, [attention
 * checks], practice, test blocks (with optional block feedback and breaks), completion.
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: FlankerOptions = {}
): { timeline: any[] } {
  const ctx = createContext(jsPsych, options);
  const o = ctx.test;
  const timeline: any[] = [];

  if (o.device_eligibility === "computer_only") timeline.push(createDeviceCheck(ctx));
  if (o.screen_calibration === "credit_card" || o.screen_calibration === "virtual_chinrest") {
    timeline.push(createCalibration(ctx));
  }
  if (o.instruction_format === "text") timeline.push(createInstructions(ctx));
  if (o.attention_checks === "instructed_items") timeline.push(createAttentionChecks(ctx));

  if (o.practice_trials > 0) {
    if (o.instruction_format === "text") timeline.push(createPracticeIntro(ctx));
    timeline.push(createBlock(ctx, "practice", 1, o.practice_trials));
  }
  if (o.instruction_format === "text") timeline.push(createTestIntro(ctx));

  splitTrials(o.n_test_trials, o.n_blocks).forEach((n, i) => {
    const block = i + 1;
    timeline.push(createBlock(ctx, "test", block, n));
    if (o.block_feedback !== "none") timeline.push(createBlockFeedback(ctx, block));
    if (o.rest_breaks === "self_paced" && block < o.n_blocks)
      timeline.push(createRestBreak(ctx, block));
  });

  timeline.push(createCompletion(ctx, calculateScores));
  return { timeline };
}

/** Factories for the individual pieces, so that a variant task can be assembled by hand. Most take the object from `createContext(jsPsych, options)`. */
export const timelineUnits = {
  createContext,
  createInstructions,
  createPracticeIntro,
  createTestIntro,
  createDeviceCheck,
  createCalibration,
  createAttentionChecks,
  createFixation,
  createCue,
  createPreview,
  createResponseTrial,
  createFeedback,
  createIti,
  createDisplayTrial,
  createTrialSequence,
  createBlock,
  createBlockFeedback,
  createRestBreak,
  createTransition,
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
    CUE_DURATION_MS,
    ATTENTION_CHECK_PROBES,
    DEFAULT_PX_PER_DEG,
  },
  text: { defaultText },
  stimuli: { renderArray, renderGlyph },
  sequence: { buildTrialSpecs, allocateCounts, splitTrials },
  options: { resolveOptions, validateOptions },
};

export type { FlankerOptions, ScoringResult, TextConfig };
