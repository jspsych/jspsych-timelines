import type { JsPsych } from "jspsych";

import {
  INSTRUCTION_CORRECT_MS,
  INSTRUCTION_MAX_ATTEMPTS,
  OPTION_IDS,
  SHIP_IDS,
  SIMULATION,
  STATE_IDS,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import {
  DEFAULT_OPTIONS,
  PHASE_OPTIONS,
  ResolvedOptions,
  TwoStepTaskOptions,
  resolveOptions,
  validateOptions,
} from "./options";
import { buildSchedule, generateWalk, splitTrials, stepProbability } from "./schedule";
import type { TrialPlan } from "./schedule";
import { calculateScores, getSummary, trialTable } from "./scoring";
import type { ScoringResult, TrialRecord } from "./scoring";
import { HybridAgent, getSimulatedAgent, setSimulatedAgent } from "./simulation";
import { renderCoin, renderOption, renderPair, renderShip, renderState } from "./stimuli";
import { TextConfig, defaultText } from "./text";
import {
  blockSizes,
  createBlock,
  createCompletion,
  createContext,
  createDisplayTrial,
  createInstructionWalkthrough,
  createInstructions,
  createPracticeIntro,
  createQuestionnaire,
  createRestBreak,
  createSchedule,
  createTestIntro,
  createTransition,
  createTrial,
  keyName,
} from "./trials";

export interface TrialData {
  task: string;
  task_version: string;
  phase: "instructions" | "practice" | "test" | "completion";
  /**
   * `response` is the scorable row: one per trial attempt, with both choices, the transition, the reward and the
   * schedule. `choice` is the raw row of each choice (`stage` 1 or 2).
   */
  part:
    | "instruction"
    | "instruction_example"
    | "instruction_check"
    | "instruction_feedback"
    | "fixation"
    | "choice"
    | "acknowledgement"
    | "feedback"
    | "timeout_message"
    | "response"
    | "iti"
    | "rest"
    | "manipulation_check_intro"
    | "manipulation_check"
    | "transition"
    | "completion";
  /** 1..n (practice is block 1). */
  block?: number | null;
  /** Position within the block, 1-based. (jsPsych owns `trial_index`, a global counter; PACKAGE-STANDARD 4.) */
  trial_index_in_block?: number;
  /** 1 on the first attempt at a trial; more when a missed trial is repeated (`missed_response_handling: "repeat_trial"`). */
  attempt?: number;
  /** `choice`, `acknowledgement`, `timeout_message` rows: the stage (1 or 2). */
  stage?: 1 | 2 | null;
  /** The trial's transition, `common` or `rare` (null if the first choice was missed). */
  condition?: "common" | "rare" | null;
  transition?: "common" | "rare" | null;
  /** The transition drawn for the trial, also when the first choice was missed and it did not happen. */
  planned_transition?: "common" | "rare";
  /** The first-stage option chosen, `A` or `B` (identity, not side). */
  stage1_choice?: "A" | "B" | null;
  stage1_key?: string | null;
  stage1_side?: "left" | "right" | null;
  stage1_rt?: number | null;
  /** The first-stage option that was on the left. */
  stage1_left?: "A" | "B";
  /** The state reached, `red` or `blue`. */
  stage2_state?: "red" | "blue" | null;
  stage2_choice?: "option_1" | "option_2" | null;
  stage2_key?: string | null;
  stage2_side?: "left" | "right" | null;
  stage2_rt?: number | null;
  stage2_left?: "option_1" | "option_2" | null;
  /** 1 if the chosen second-stage option paid a coin, else 0; null when a choice was missed. */
  reward?: 0 | 1 | null;
  /** The reward probability of each second-stage option on this trial, by state and option. */
  reward_probs?: Record<string, Record<string, number>>;
  /** The schedule's description, e.g. "random_walk sd=0.025 bounds=[0.25,0.75] boundary=reverse_step". */
  reward_walk?: string;
  common_transition_prob?: number;
  missed?: boolean;
  /** 1 or 2: the stage whose choice was missed. */
  missed_stage?: 1 | 2 | null;
  /** `choice` rows: the options on screen, the chosen one, its side. */
  left?: string;
  right?: string;
  choice?: string | null;
  side?: "left" | "right" | null;
  state?: "red" | "blue" | null;
  /** `response` rows: the first choice's key and RT (`choice` rows: the choice's own). */
  response?: string | null;
  rt?: number | null;
  timeout?: boolean;
  response_window?: number | null;
  /** Planned duration of a display row, ms. */
  duration_ms?: number;
  fixation_duration?: number;
  iti?: number;
  feedback_duration?: number;
  /** `feedback` rows: the coins earned so far in the phase when `running_score_display` is `running_total`, else null. */
  running_total?: number | null;
  response_acknowledgement?: number;
  timeout_message?: number;
  feedback_kind?: string;
  /** instruction_check rows: the step, the correct key, whether the answer was right, and the attempt. */
  step?: string;
  correct_response?: string;
  correct?: boolean;
  /** manipulation_check rows. */
  ship?: "A" | "B";
  answer?: "red" | "blue" | null;
  common_state?: "red" | "blue";
}

/**
 * Builds the complete two-step task timeline: instructions and walkthrough, practice, main blocks (with optional
 * breaks), an optional questionnaire, and a completion screen. All random draws (transitions, reward walk,
 * rewards, sides, jittered durations) are made now, through `jsPsych.randomization`.
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: TwoStepTaskOptions = {}
): { timeline: any[] } {
  const ctx = createContext(jsPsych, options);
  const o = ctx.test;
  const timeline: any[] = [];
  const instructed = o.instruction_format === "text";

  if (instructed) {
    timeline.push(createInstructions(ctx));
    if (o.instruction_demonstration !== "none") timeline.push(createInstructionWalkthrough(ctx));
  }
  if (o.practice_trials > 0) {
    if (instructed) timeline.push(createPracticeIntro(ctx));
    timeline.push(createBlock(ctx, "practice", 1, createSchedule(ctx, "practice")));
  }
  if (instructed) timeline.push(createTestIntro(ctx));

  const plans = createSchedule(ctx, "test");
  let start = 0;
  blockSizes(o).forEach((n, i) => {
    const block = i + 1;
    timeline.push(createBlock(ctx, "test", block, plans.slice(start, start + n)));
    start += n;
    if (o.rest_breaks === "self_paced" && block < o.n_blocks)
      timeline.push(createRestBreak(ctx, block));
  });

  if (o.manipulation_check === "questionnaire") timeline.push(createQuestionnaire(ctx));
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
  createSchedule,
  createBlock,
  createTrial,
  createDisplayTrial,
  createTransition,
  createRestBreak,
  createQuestionnaire,
  createCompletion: (ctx: ReturnType<typeof createContext>) =>
    createCompletion(ctx, calculateScores),
};

export const utils = {
  scoring: { calculateScores, getSummary, trialTable },
  constants: {
    TASK_NAME,
    VERSION,
    TASK_CLASS,
    DEFAULT_OPTIONS,
    PHASE_OPTIONS,
    SHIP_IDS,
    STATE_IDS,
    OPTION_IDS,
    INSTRUCTION_MAX_ATTEMPTS,
    INSTRUCTION_CORRECT_MS,
    SIMULATION,
  },
  text: { defaultText },
  stimuli: { renderShip, renderOption, renderState, renderCoin, renderPair, keyName },
  schedule: { buildSchedule, generateWalk, stepProbability, splitTrials },
  simulation: { setSimulatedAgent, getSimulatedAgent, HybridAgent },
  options: { resolveOptions, validateOptions },
};

export type {
  ResolvedOptions,
  ScoringResult,
  TextConfig,
  TrialPlan,
  TrialRecord,
  TwoStepTaskOptions,
};
