import type { JsPsych } from "jspsych";

import {
  EFFORT_PLUGIN_NAME,
  FIRST_N_TRIALS,
  MAX_SESSION_TRIALS,
  REWARD_BINS,
  SIMULATION,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import { OfferStream, fixedOrder, fixedWin, rewardLevels, rewardRange } from "./offers";
import {
  DEFAULT_OPTIONS,
  EefrtOptions,
  PHASE_OPTIONS,
  normaliseKey,
  resolveOptions,
  validateOptions,
} from "./options";
import EffortPressPlugin from "./plugin";
import { calculateScores, getSummary, payoutFor, rewardBin } from "./scoring";
import type { ScoringResult } from "./scoring";
import { hardChoiceProbability, simulateChoice, simulatePressTimes } from "./simulation";
import { renderChoice, renderEffort, renderFixation } from "./stimuli";
import { TextConfig, defaultText } from "./text";
import {
  createCompletion,
  createContext,
  createDeviceCheck,
  createDisplayTrial,
  createInstructionWalkthrough,
  createInstructions,
  createPracticeIntro,
  createTestIntro,
  createTrialLoop,
  taskFacts,
} from "./trials";

export interface TrialData {
  task: string;
  task_version: string;
  phase: "instructions" | "practice" | "test" | "completion";
  /** "response" is the scorable row: the effort phase, carrying the offer, the choice and the outcome. */
  part:
    | "instruction"
    | "instruction_check"
    | "instruction_feedback"
    | "device_check"
    | "fixation"
    | "choice"
    | "ready"
    | "response"
    | "completion_feedback"
    | "reward_feedback"
    | "completion";
  /** 1 in practice and in the test (the task has no blocks). */
  block?: number;
  /** Position within the phase, 1-based. (jsPsych owns `trial_index`, a global counter; PACKAGE-STANDARD §4.) */
  trial_index_in_block?: number;
  /** Offer: chance that the trial pays, and the two rewards on offer. */
  win_probability?: number;
  hard_reward?: number;
  easy_reward?: number;
  /** response rows: the trial is a win trial (completing the task pays). */
  win?: boolean;
  /** "easy" | "hard" chosen, or "none" when no choice was made (timeout, or the task was assigned in practice). */
  choice?: "easy" | "hard" | "none";
  /** the task was assigned: at random after no choice in time, or as a practice assignment. */
  choice_forced?: boolean;
  forced_by?: "timeout" | "practice" | null;
  /** the task actually done, after any assignment. */
  chosen_task?: "easy" | "hard";
  choice_rt?: number | null;
  /** choice rows: whether no key was pressed in the window. */
  timeout?: boolean;
  /** choice rows: the choice window; response rows: the time allowed for the presses; both ms, null = untimed. */
  response_window?: number | null;
  required_presses?: number;
  press_count?: number;
  /** ms from the start of the effort screen. */
  press_times?: number[];
  effort_key?: string;
  completed?: boolean;
  task_duration_ms?: number;
  reward_won?: number;
  reward_won_prev?: number;
  /** the session clock at the start of the trial, ms. */
  session_elapsed_ms?: number;
  /** feedback rows */
  feedback_stage?: "completion" | "reward";
  /** display rows: planned duration, ms. */
  duration_ms?: number;
  fixation_duration?: number;
  feedback_duration?: number;
  /** instruction_check rows */
  step?: string;
  attempt?: number;
  correct?: boolean;
  /** completion row */
  payout_rule?: string;
  paid_trials?: number[];
  payout?: number | null;
  rt?: number | null;
  response?: string | null;
}

/**
 * Builds the complete EEfRT timeline: [device check], instructions, walkthrough, practice, test (until
 * the session time is up or the trial count is reached), completion.
 */
export function createTimeline(jsPsych: JsPsych, options: EefrtOptions = {}): { timeline: any[] } {
  const ctx = createContext(jsPsych, options);
  const o = ctx.test;
  const timeline: any[] = [];

  if (o.device_eligibility === "computer_only") timeline.push(createDeviceCheck(ctx));
  if (o.instruction_format === "text") timeline.push(createInstructions(ctx));
  if (o.instruction_format === "text" && o.instruction_demonstration !== "none") {
    timeline.push(createInstructionWalkthrough(ctx));
  }
  if (o.practice_trials > 0) {
    if (o.instruction_format === "text") timeline.push(createPracticeIntro(ctx));
    timeline.push(createTrialLoop(ctx, "practice"));
  }
  if (o.instruction_format === "text") timeline.push(createTestIntro(ctx));
  timeline.push(createTrialLoop(ctx, "test"));
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
  createDisplayTrial,
  createTrialLoop,
  createCompletion: (ctx: ReturnType<typeof createContext>) =>
    createCompletion(ctx, calculateScores),
};

export const utils = {
  scoring: { calculateScores, getSummary, payoutFor, rewardBin },
  constants: {
    TASK_NAME,
    VERSION,
    TASK_CLASS,
    DEFAULT_OPTIONS,
    PHASE_OPTIONS,
    EFFORT_PLUGIN_NAME,
    FIRST_N_TRIALS,
    MAX_SESSION_TRIALS,
    REWARD_BINS,
    SIMULATION,
  },
  text: { defaultText },
  stimuli: { renderChoice, renderEffort, renderFixation },
  offers: { OfferStream, rewardLevels, rewardRange, fixedOrder, fixedWin },
  options: { resolveOptions, validateOptions, normaliseKey, taskFacts },
  simulation: { hardChoiceProbability, simulateChoice, simulatePressTimes },
  plugins: { EffortPressPlugin },
};

export type { EefrtOptions, ScoringResult, TextConfig };
