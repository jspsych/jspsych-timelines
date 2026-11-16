import type { JsPsych } from "jspsych";

import { SIMULATION, TASK_CLASS, TASK_NAME, VERSION } from "./constants";
import { allocateTypes, buildBlockSpecs, constraintsFor, sampleDuration } from "./design";
import {
  DEFAULT_OPTIONS,
  PHASE_OPTIONS,
  StopSignalTaskOptions,
  resolveAdaptive,
  resolveOptions,
  validateOptions,
} from "./options";
import { calculateScores, getSummary, integrationSsrt } from "./scoring";
import type { ScoringResult } from "./scoring";
import { simulateRace } from "./simulation";
import { StaircaseManager, StaircaseSet } from "./staircase";
import { renderArrow, renderGoStage } from "./stimuli";
import { TextConfig, defaultText } from "./text";
import {
  createBlock,
  createBlockFeedback,
  createCompletion,
  createContext,
  createDeviceCheck,
  createDisplayTrial,
  createFeedback,
  createFixation,
  createInstructionWalkthrough,
  createInstructions,
  createIti,
  createPractice,
  createPracticeIntro,
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
    | "instruction_example"
    | "instruction_check"
    | "instruction_feedback"
    | "device_check"
    | "fixation"
    | "response"
    | "feedback"
    | "iti"
    | "block_feedback"
    | "rest"
    | "transition"
    | "completion";
  /** 1..n (practice is block 1). */
  block?: number | null;
  /** Position within the block, 1-based. (jsPsych owns `trial_index`, a global counter; PACKAGE-STANDARD §4.) */
  trial_index_in_block?: number;
  /** 1-based attempt of the practice block (with `practice_criterion`). */
  practice_attempt?: number;
  /** Trial type: "go" | "stop". (Named `condition`: `trial_type` is jsPsych's own column, the plugin name.) On instruction rows: the step shown. */
  condition?: "go" | "stop";
  /** Direction of the go arrow: "left" | "right". */
  go_stimulus?: "left" | "right";
  /** Key (keyboard) or button index of the correct response to the go arrow. */
  correct_response?: string | number;
  /** Key or button index pressed; null for no response. */
  response?: string | number | null;
  /** ms from go onset; null for no response. */
  rt?: number | null;
  /** go: correct key; stop: no response (a successful stop). */
  correct?: boolean;
  /** No response before the window ended. */
  timeout?: boolean;
  /** Requested stop-signal delay in ms (stop trials). */
  ssd?: number | null;
  /** Measured delay in ms, to the display frame (null in a simulated run, which draws nothing). */
  ssd_actual?: number | null;
  /** The signal appeared (false when the response came first). */
  stop_signal_shown?: boolean | null;
  /** "successful" | "failed" for stop trials, "na" for go trials. */
  stop_outcome?: "successful" | "failed" | "na";
  /** Which staircase picked the delay ("all", "left", "right"); null for fixed delays and go trials. */
  staircase_id?: string | null;
  /** The staircase after this trial's update (`toJSON()` without the history). */
  staircase_state?: Record<string, unknown> | null;
  /** The delay the staircase will use next. */
  next_ssd?: number | null;
  /** Last trial of a block: `toJSON()` of every staircase, history included. */
  staircase_final?: Array<Record<string, unknown>>;
  /** The stop proportion of the block (0-1). */
  stop_probability_condition?: number | null;
  stop_signal?: string;
  response_window?: number | null;
  stimulus_duration?: number | null;
  stop_signal_duration?: number | null;
  response_device?: string;
  /** Planned duration of a display row (fixation, feedback, iti), ms. */
  duration_ms?: number;
  fixation_duration?: number;
  iti?: number;
  feedback_duration?: number;
  break_duration?: number | null;
  /** Practice criterion result, on the last row of a practice attempt. */
  practice_criterion_met?: boolean;
  practice_go_accuracy?: number | null;
  /** instruction_check rows: attempt at the step, 1-based. */
  attempt?: number;
  /** instruction_feedback rows: "correct" | "hint" | "reveal"; feedback rows: the content. */
  feedback_kind?: string;
  feedback_condition?: string;
  feedback_text?: string;
}

/**
 * Builds the complete stop-signal timeline: [device check], instructions (with walkthrough), practice (with an
 * optional criterion), test blocks (with block feedback and breaks), completion.
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: StopSignalTaskOptions = {}
): { timeline: any[] } {
  const ctx = createContext(jsPsych, options);
  const o = ctx.test;
  const timeline: any[] = [];

  if (o.device_eligibility === "computer_only") timeline.push(createDeviceCheck(ctx));
  if (o.instruction_format === "text") timeline.push(createInstructions(ctx));
  if (o.instruction_format === "text" && o.instruction_demonstration !== "none") {
    timeline.push(createInstructionWalkthrough(ctx));
  }
  timeline.push(...createPractice(ctx));
  if (o.instruction_format === "text") {
    timeline.push({
      timeline: [createTestIntro(ctx)],
      conditional_function: () => !ctx.state.ended,
    });
  }

  splitTrials(o.n_test_trials, o.n_blocks).forEach((n, i) => {
    const block = i + 1;
    const nodes: any[] = [createBlock(ctx, "test", block, n)];
    if (o.block_feedback !== "none") nodes.push(createBlockFeedback(ctx, block));
    if (o.break_duration_ms !== 0 && block < o.n_blocks) nodes.push(createRestBreak(ctx, block));
    timeline.push({ timeline: nodes, conditional_function: () => !ctx.state.ended });
  });

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
  createDeviceCheck,
  createFixation,
  createResponseTrial,
  createFeedback,
  createIti,
  createDisplayTrial,
  createTrialSequence,
  createBlock,
  createPractice,
  createBlockFeedback,
  createRestBreak,
  createTransition,
  createCompletion: (ctx: ReturnType<typeof createContext>) =>
    createCompletion(ctx, calculateScores),
};

export const utils = {
  scoring: { calculateScores, getSummary, integrationSsrt },
  constants: {
    TASK_NAME,
    VERSION,
    TASK_CLASS,
    DEFAULT_OPTIONS,
    PHASE_OPTIONS,
    SIMULATION,
  },
  text: { defaultText },
  stimuli: { renderArrow, renderGoStage },
  sequence: { buildBlockSpecs, allocateTypes, constraintsFor, splitTrials, sampleDuration },
  adaptive: { resolveAdaptive, StaircaseSet, StaircaseManager },
  simulation: { simulateRace },
  options: { resolveOptions, validateOptions },
};

export type { StopSignalTaskOptions, ScoringResult, TextConfig };
