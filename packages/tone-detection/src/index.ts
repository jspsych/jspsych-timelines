import type { JsPsych } from "jspsych";

import * as audio from "./audio";
import {
  AUDIO,
  HEADPHONE_SCREEN,
  LEVEL_UNITS,
  SIMULATION,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import { allocateLevels, buildTrackSpecs, conditionLabel, sampleDuration } from "./design";
import {
  DEFAULT_OPTIONS,
  PHASE_OPTIONS,
  ToneDetectionOptions,
  resolveAdaptive,
  resolveOptions,
  validateOptions,
} from "./options";
import { calculateScores, getSummary } from "./scoring";
import type { ScoringResult } from "./scoring";
import { probabilityCorrect } from "./simulation";
import { renderStage } from "./stimuli";
import { TextConfig, defaultText } from "./text";
import { Track } from "./track";
import {
  createBlock,
  createCompletion,
  createContext,
  createDisplayTrial,
  createHeadphoneCheck,
  createHearingCheck,
  createInstructionWalkthrough,
  createInstructions,
  createPractice,
  createPracticeIntro,
  createRestBreak,
  createTestIntro,
  createTransition,
  createVolumeCalibration,
} from "./trials";

export interface TrialData {
  task: string;
  task_version: string;
  phase: "instructions" | "practice" | "test" | "completion";
  /** "response" is the scorable row; "stimulus" is the screen where the sounds play. */
  part:
    | "instruction"
    | "instruction_example"
    | "instruction_check"
    | "instruction_feedback"
    | "hearing_check"
    | "volume_calibration"
    | "headphone_check"
    | "stimulus"
    | "response"
    | "feedback"
    | "iti"
    | "rest"
    | "transition"
    | "completion";
  /** Test: the track, 1..n over the test (practice is block 1). */
  block?: number | null;
  /** Track within its condition, 1..trials_per_condition. */
  track_id?: number;
  /** Position within the block, 1-based. (jsPsych owns `trial_index`, a global counter; PACKAGE-STANDARD §4.) */
  trial_index_in_block?: number;
  /** The same as `trial_index_in_block` (the spec's name). */
  trial_in_track?: number;
  /** 1-based attempt of the practice block (with `practice_criterion`). */
  practice_attempt?: number;
  /** The condition: the tone frequency, e.g. "1000_hz". */
  condition?: string;
  /** Frequency of the tone, Hz (also `standard_value`). */
  tone_frequency?: number;
  standard_value?: number;
  /** The level presented, in `level_unit`: dB SNR (tone re masker) with a masker, dB FS in quiet. */
  level?: number | null;
  level_unit?: "dB SNR" | "dB FS";
  /** Digital levels of the tone and the masker (null in quiet), dB FS RMS; the unit convention is in constants.ts. */
  tone_level_db?: number;
  masker_level_db?: number | null;
  /** Digital level of the calibration sound the participant set the volume with (null without a calibration screen), and the masker's (or tone's) level re it. */
  calibration_level_db?: number | null;
  level_re_calibration_db?: number | null;
  /** The step that applied, dB (`step_size` is the move down after a correct run, `step_size_up` after a wrong answer). */
  step_size?: number | null;
  step_size_up?: number;
  /** The interval that held the tone (1-based) and the one chosen (null for no answer). */
  target_interval?: number;
  response_interval?: number | null;
  n_alternatives?: number;
  /** Key (keyboard) or button index; null for no answer. */
  response?: string | number | null;
  correct_response?: string | number;
  /** ms from the end of the last interval; null for no answer. */
  rt?: number | null;
  correct?: boolean;
  /** This answer was a reversal of the staircase, and the running count. */
  is_reversal?: boolean | null;
  reversal_count?: number | null;
  /** The level the staircase will present next. */
  next_level?: number | null;
  /** Running estimate: the mean of all reversal levels so far (null before the first). */
  track_threshold?: number | null;
  /** The staircase after this trial's update (`toJSON()` without the history), with `errors` and `stop_reason`. */
  track_state?: Record<string, unknown>;
  track_done?: boolean;
  /** The last trial of a track: `toJSON()` of the whole staircase, history included. */
  track_final?: Record<string, unknown>;
  tone_duration?: number;
  tone_ramp?: number;
  inter_item_interval?: number;
  iti?: number;
  feedback_duration?: number | null;
  sound_duration?: number;
  /** State of the audio context when the sound started ("running" is a sound that could be heard); "none": no audio; "unplayed": a simulated trial. */
  audio_context_state?: string;
  /** Largest sample before the sound was scaled down to avoid clipping, and whether it was. */
  peak_before_limiting?: number | null;
  sound_limited?: boolean | null;
  response_device?: string;
  /** Volume-setting row. */
  calibration_target?: string;
  calibration_sound?: "noise" | "tone";
  calibration_plays?: number;
  device_volume_setting?: string;
  presentation_level_db?: number;
  /** Headphone screen rows: the screen, the interval of the antiphase tone, and the number correct so far. */
  headphone_screen?: string;
  antiphase_interval?: number;
  headphone_check_n_correct?: number;
  headphone_check_n_trials?: number;
  /** Hearing question: true when the participant said they had a difficulty (nobody is excluded). */
  hearing_difficulty?: boolean;
  /** Practice criterion result, on the last row of a practice attempt. */
  practice_criterion_met?: boolean;
  practice_accuracy?: number | null;
  /** instruction_check rows: attempt at the step, 1-based. */
  attempt?: number;
  replayed?: boolean;
  /** instruction_feedback rows: "correct" | "hint" | "reveal"; feedback rows: the content. */
  feedback_kind?: string;
  feedback_condition?: string;
  feedback_text?: string;
}

/**
 * Builds the complete tone detection timeline: [hearing question], instructions, volume setting, headphone check, walkthrough, practice,
 * the test (one track per condition and repetition, with a pause between), completion.
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: ToneDetectionOptions = {}
): { timeline: any[] } {
  const ctx = createContext(jsPsych, options);
  const o = ctx.test;
  const timeline: any[] = [];

  timeline.push(createHearingCheck(ctx));
  if (o.instruction_format === "text") timeline.push(createInstructions(ctx));
  timeline.push(createVolumeCalibration(ctx));
  timeline.push(createHeadphoneCheck(ctx));
  if (o.instruction_format === "text" && o.instruction_demonstration !== "none") {
    timeline.push(createInstructionWalkthrough(ctx));
  }
  timeline.push(...createPractice(ctx));

  const specs = buildTrackSpecs(jsPsych, o);
  if (o.instruction_format === "text") {
    timeline.push({
      timeline: [createTestIntro(ctx, specs.length)],
      conditional_function: () => !ctx.state.ended,
    });
  }
  specs.forEach((spec, i) => {
    const nodes: any[] = [createBlock(ctx, "test", spec)];
    if (i < specs.length - 1) nodes.push(createRestBreak(ctx, spec.block, specs.length));
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
  createHearingCheck,
  createVolumeCalibration,
  createHeadphoneCheck,
  createBlock,
  createPractice,
  createRestBreak,
  createTransition,
  createDisplayTrial,
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
    LEVEL_UNITS,
    AUDIO,
    HEADPHONE_SCREEN,
    SIMULATION,
  },
  text: { defaultText },
  /** Sound synthesis as plain functions (samples out): tones, noise, whole trials, the antiphase screen, WAV files. */
  audio: {
    renderTone: audio.renderTone,
    renderNoise: audio.renderNoise,
    renderTrialSound: audio.renderTrialSound,
    renderHeadphoneSound: audio.renderHeadphoneSound,
    renderCalibrationSound: audio.renderCalibrationSound,
    toWav: audio.toWav,
    toneAmplitude: audio.toneAmplitude,
    noiseRms: audio.noiseRms,
    levelDb: audio.levelDb,
  },
  stimuli: { renderStage },
  sequence: { buildTrackSpecs, allocateLevels, conditionLabel, sampleDuration },
  adaptive: { resolveAdaptive, Track },
  simulation: { probabilityCorrect },
  options: { resolveOptions, validateOptions },
};

export type { ToneDetectionOptions, ScoringResult, TextConfig };
