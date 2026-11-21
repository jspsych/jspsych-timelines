/**
 * Options for the tone detection timeline.
 *
 * Every default below states its source. The anchor is the online tone-in-noise protocol of Zhao, Brown, Holt & Dick
 * (2022, S012), chosen by the spec generator (coverage 0.77, lead 0.40, no escalation). Defaults that differ from the
 * generated spec are listed with reasons in packages/tone-detection/DEFAULTS.md.
 *
 * Levels: every level is in dB re digital full scale as an RMS level (see `LEVEL_UNITS` in constants.ts). The tracked
 * level is the tone's level re the masker (dB SNR) when there is a masker, and the tone's level in dB FS in quiet.
 */
import {
  DEFAULT_MASKER_LEVEL_DB,
  DEFAULT_QUIET_CALIBRATION_DB,
  DEFAULT_SENSATION_LEVEL_DB,
} from "./constants";
import type { TextConfig } from "./text";

// -- value types --------------------------------------------------------------------------------

/** Fixed duration, or a uniform jitter range sampled in `step` increments. */
export type DurationSpec = number | { min: number; max: number; step?: number };

export type TaskVariant =
  | "3I-3AFC_which_contains_tone"
  | "2I-2AFC_which_contains_tone"
  | "3I-3AFC_oddity"
  | "2I-2AFC_which_higher"
  | "standard_then_comparison_louder_softer"
  | "same_different"
  | "AXB"
  | "2I-2AFC_tone_sequences_oddity";

export type ToneForm =
  | "pure_tone"
  | "harmonic_complex"
  | "inharmonic_complex"
  | "musical_instrument_note";
export type MaskerForm = "white_noise" | "threshold_equalizing_noise_lowpass_6kHz" | "none";

export interface ToneDetectionStimulusSet {
  /** The tone. Only `pure_tone` is synthesised. (default: "pure_tone", S012; also harmonic and inharmonic complexes, instrument notes) */
  tone?: ToneForm;
  /**
   * The masker: `"white_noise"` (the anchor), or `"none"` for detection in quiet, where the tracked level is the tone's level in dB FS.
   * The low-pass threshold-equalizing noise (S044) is not implemented. (default: "white_noise", S012)
   */
  masker?: MaskerForm;
}

/**
 * When a track ends. Core's `jsPsych.adaptive` rules (`trials`, `reversals`, `consecutive_failures`, `failures_at_level`, `ceiling`)
 * plus `mistakes`, which the package counts itself: total wrong answers in the track (core has no such rule).
 */
export interface DiscontinueRule {
  /** Stop after this many trials. (default: 40, S012) */
  trials?: number;
  /** Stop after this many reversals (S005 uses 6 or 8, S044 10). */
  reversals?: number;
  consecutive_failures?: number;
  failures_at_level?: number;
  ceiling?: number;
  /** Stop after this many wrong answers in the track (S036: 4, S045: 3). Counted by the package. */
  mistakes?: number;
}

export type StepSizeSpec = number | { up: number; down: number };

/**
 * The staircase (`jsPsych.adaptive`), one fresh staircase per track. Levels are in dB: the unit is dB SNR with a masker, dB FS in quiet.
 * A correct run moves the level down (harder), a wrong answer moves it up (easier).
 */
export interface AdaptiveOptions {
  /**
   * The rule, named by how many correct answers in a row make the task harder (`down`) with one wrong answer making it easier (`1up`):
   * `staircase_1up_1down` (50%, or the `target_accuracy` the steps imply), `staircase_1up_2down` (70.7%) and
   * `staircase_1up_3down` (79.4%, the dossier's "3down1up"). Other vocabulary values are not implemented.
   * (default: "staircase_1up_3down" — S012; S005 uses 2down1up, S036 a weighted 1down3up)
   */
  procedure?:
    | "staircase_1up_1down"
    | "staircase_1up_2down"
    | "staircase_1up_3down"
    | "ascending_discontinue"
    | "quest"
    | "rt_based";
  /**
   * Level of the first trial, dB. (default: -13.75 dB SNR with a masker — S012; -30 dB FS in quiet — the package's choice, see DEFAULTS.md)
   */
  start_level?: number;
  /**
   * Step in dB: a number (both directions), `{ up, down }` (up = after a wrong answer, down = after a correct run), or a list of these
   * indexed by the number of reversals so far (the first entry until the first reversal, the second after it, ...; the last entry from then on).
   * With `staircase_1up_1down`, `{ up, down }` steps imply a target of up / (up + down) (S031: down 2 and up 6 give 75%).
   * (default: [1.5, 0.75] — S012; the anchor also switches at -19.75 dB SNR, which is not implemented, see DEFAULTS.md)
   */
  step_size?: StepSizeSpec | StepSizeSpec[];
  /** The proportion correct the staircase converges on, for `staircase_1up_1down` with a single step size. (default: implied by the procedure) */
  target_accuracy?: number;
  /** `[min, max]` of the level in dB; null on a side means no limit. (default: [-60, 10] dB SNR, [-100, -6] dB FS in quiet — the package's choice: no clipping) */
  bounds?: [number | null, number | null];
  /** When a track ends; null throws (a track needs an end). (default: { trials: 40 } — S012) */
  discontinue_rule?: DiscontinueRule | null;
  /** Each track is its own staircase: only "per_condition" is implemented (one fresh staircase per track). (default: "per_condition") */
  tracks?: "single" | "per_condition";
  /** Each track starts at `start_level`: only "block" is implemented (a track is a block). (default: "block") */
  reset?: "never" | "block" | "phase";
}

export interface PracticeCriterion {
  /** Minimum proportion of correct answers over the window. (default: 0.8 when a criterion is given) */
  accuracy?: number;
  /** Number of most recent practice trials the accuracy is computed over; null = the whole practice block. (default: null) */
  window?: number | null;
  /** `"repeat"` runs practice again, `"continue"` goes on to the test, `"end"` skips the test. (default: "repeat") */
  on_fail?: "repeat" | "continue" | "end";
  /** Most repeats before the task continues. (default: 2) */
  max_repeats?: number;
}

export interface ToneDetectionOptions {
  // -- timing --
  /** Silence between successive intervals within a trial; 0 = none. (default: 250 — S012; 500 in S005, 200 in S044, 800 in S059) */
  inter_item_interval_ms?: DurationSpec;
  /** Duration of the tone, including its ramps. Must be a number: a tone has to end. (default: 250 — S012, S005; 100 to 500 in others) */
  stimulus_duration_ms?: DurationSpec | null;
  /** Rise and fall time of the tone (raised cosine); 0 = none. (default: 10 — S012; 20 in S036) */
  tone_ramp_ms?: DurationSpec;
  /** Blank interval after the trial (and its feedback); 0 = none. `{min, max, step}` draws a jitter. (default: 500 — the package's choice; the spec has no value) */
  iti_ms?: DurationSpec;
  /** How long trial feedback stays on screen. (default: 1000 — S012 practice feedback) */
  feedback_duration_ms?: DurationSpec;

  // -- stimulus --
  /**
   * Level of the masker, dB re full scale (RMS). With `volume_calibration: "participant_adjusted"` the calibration sound plays at
   * `calibration_level_db`, 40 dB below this by default, which is the anchor's "+40 dB re the just-detectable noise level".
   * Not used in quiet: giving it with `stimulus_set.masker: "none"` throws. (default: -20 — the package's choice; the anchor states only the 40 dB)
   */
  presentation_level_db?: number;
  /** Stimulus material: `tone` and `masker`. */
  stimulus_set?: ToneDetectionStimulusSet;
  /**
   * Frequency of the tone, Hz. A list is a set of conditions: each frequency is tested in its own tracks
   * (`trials_per_condition` of them), in the order of `block_order`. Frequency roving is not implemented.
   * (default: 1000 — S012; lists of 3 or 6 frequencies in S031, S045, S036)
   */
  tone_frequency_hz?: number | number[];

  // -- design --
  /**
   * The order of the conditions (frequencies) in each round of tracks. `random_within_block`: each round has every condition once, in
   * random order (S036). `fixed`: in the order given. `ascending` and `descending`: by frequency. Other values are not implemented.
   * Has no effect with one frequency. (default: "random_within_block" — S036; the spec's fill value)
   */
  block_order?:
    | "fixed"
    | "random"
    | "counterbalanced"
    | "ascending"
    | "descending"
    | "alternating"
    | "random_within_block";
  /**
   * Fixed levels in dB (dB SNR with a masker, dB FS in quiet) instead of a staircase: each trial of a block gets one, balanced over the list
   * (the constant-stimuli method). Giving it without `adaptive` switches the staircase off; giving both is an error.
   * (default: null — the staircase. In practice: the start level of the staircase, S012)
   */
  difficulty_levels?: number[] | null;
  /**
   * Which paradigm: `3I-3AFC_which_contains_tone` (the anchor) or `2I-2AFC_which_contains_tone` (S044): detection, in noise or in quiet.
   * The discrimination and oddity variants are not implemented. (default: "3I-3AFC_which_contains_tone" — S012)
   */
  task_variant?: TaskVariant;
  /** Tracks per condition (S012: three 40-trial tracks). Each track is a block. (default: 3 — S012; S044 4, S005 1) */
  trials_per_condition?: number;
  /** Trials in each block of a fixed-level test (`adaptive: null`); not used with a staircase, where the stop rule ends the track. (default: null) */
  trials_per_block?: number | null;

  // -- response --
  /** "keyboard" keys; "mouse" and "touch" use buttons labelled with the interval numbers. Others are not implemented. (default: "keyboard" — S012) */
  response_device?: "keyboard" | "mouse" | "touch" | "microphone" | "eye_tracker" | "gamepad";
  /** One key per interval, in order. (default: ["1", "2", "3"] for three intervals, ["1", "2"] for two — S012 presses 1, 2 or 3) */
  response_keys?: string[];

  // -- adaptive procedure --
  /**
   * The staircase, or null for fixed levels (`difficulty_levels`). Fields you leave out take the defaults of `AdaptiveOptions`.
   * The track (`toJSON()`) is recorded in the data. (default: { procedure: "staircase_1up_3down", start_level: -13.75, step_size: [1.5, 0.75],
   * bounds: [-60, 10], discontinue_rule: { trials: 40 } } — S012)
   */
  adaptive?: AdaptiveOptions | null;

  // -- procedure --
  /** Only "none" is implemented (the anchor restricts the browser, which a timeline cannot enforce). (default: "none"; spec: "browser_restricted", see DEFAULTS.md) */
  device_eligibility?: "none" | "computer_only" | "browser_restricted" | "hardware_required";
  /**
   * Headphone screening. `"screening_task"` plays the screen named by `headphone_screen`; the number correct is recorded and nobody is excluded.
   * `"self_report"` is not implemented. (default: "screening_task" — S012, S044, S013)
   */
  headphone_check?: "none" | "self_report" | "screening_task";
  /**
   * Which screen. `"antiphase_quietest_tone"`: three tones, one of them 6 dB quieter, one in antiphase between the ears; the quietest is
   * the attenuated tone over headphones, the antiphase tone over loudspeakers (Woods et al., 2017; S044). `"huggins_pitch"` (S012) and
   * `"antiphase_plus_NoSpi_chirp"` (S013) are not implemented. (default: "antiphase_quietest_tone" — the anchor's Huggins pitch is not implemented)
   */
  headphone_screen?: "antiphase_quietest_tone" | "huggins_pitch" | "antiphase_plus_NoSpi_chirp";
  /** Trials of the headphone screen. (default: 6 — S012, S013) */
  headphone_check_trials?: number;
  /** Self-report hearing question; the answer is recorded and nobody is excluded. (default: "none"; spec: "hearing", see DEFAULTS.md) */
  participant_eligibility?: "none" | "vision" | "hearing" | "clinical" | "fasting";
  /** Accuracy criterion for practice: below it practice repeats (or continues, or ends the task). (default: null — none in S012; S005's lab version uses 6 correct in a row) */
  practice_criterion?: PracticeCriterion | null;
  /** Practice trials before the test; 0 = none. One block at fixed levels. (default: 6 — S012) */
  practice_trials?: number;
  /**
   * The volume-setting screen. `"participant_adjusted"`: a sound plays and the participant sets the volume of their device (the page cannot read it);
   * `"none"` and `"fixed_level"` skip it. Other values are not implemented. (default: "participant_adjusted" — S012)
   */
  volume_calibration?:
    | "none"
    | "fixed_level"
    | "participant_adjusted"
    | "calibrated_spl"
    | "intensity_workup";
  /**
   * Digital level of the calibration sound, dB FS: the participant sets the device volume until it is just detectable (or comfortable).
   * Default: `presentation_level_db` - 40 with a masker (the calibration sound is the masker; the anchor's "+40 dB re just-detectable"), -60 in quiet
   * (the calibration sound is the tone). Needs `volume_calibration: "participant_adjusted"`.
   */
  calibration_level_db?: number;
  /** What the participant sets the volume to: `just_detectable` (S012) or `comfortable` (S013, S044). (default: "just_detectable" — S012) */
  calibration_target?: "just_detectable" | "comfortable";

  // -- feedback --
  /** On which trials trial feedback is shown. Ignored when `trial_feedback` is "none". (default: "all" — S012, S044) */
  feedback_condition?: "all" | "errors_only" | "correct_only";
  /** Only "none" is implemented. (default: "none"; spec: "bonus", see DEFAULTS.md) */
  performance_incentive?: "none" | "bonus" | "points_only" | "fixed_payment";
  /** `counter` shows "Progress: x/40" under the stage (S012); `none`. `progress_bar` is not implemented. (default: "counter" — S012) */
  progress_indicator?: "none" | "counter" | "progress_bar";
  /** What trial feedback shows. (default: "none" — S012 gives feedback in practice only; practice default below) */
  trial_feedback?:
    | "none"
    | "accuracy"
    | "rt"
    | "accuracy_rt"
    | "points"
    | "reward_outcome"
    | "correct_answer";

  // -- instructions --
  /** `quiet_room` adds a page about headphones and a quiet place. `no_aids` is not implemented. (default: "quiet_room" — S044, S031; see DEFAULTS.md) */
  environment_instructions?: "none" | "quiet_room" | "no_aids";
  /** The wording of the judgment. Only "which_interval_contains_tone" is implemented (it goes with the two detection variants). (default: "which_interval_contains_tone" — S012) */
  judgment_wording?:
    | "which_interval_contains_tone"
    | "which_higher_in_pitch"
    | "comparison_louder_or_softer";
  /** "text" shows instruction pages; "experimenter" shows none. Others are not implemented. (default: "text") */
  instruction_format?: "text" | "audio" | "video" | "experimenter";
  /**
   * Walkthrough of the instructions, before practice (PACKAGE-STANDARD §6a). "interactive": a listening example (the tone is in a named interval,
   * played again on request), then check steps with the tone in different intervals, at a clearly audible level and with the task's own
   * sound code and response mapping; a wrong answer gives a hint and plays it again (at most 3 attempts). "examples": the listening example only. "none".
   * (default: "interactive" — a documented exception to the evidence-anchored defaults (PACKAGE-STANDARD §6a).)
   */
  instruction_demonstration?: "none" | "examples" | "animated" | "guided_trial" | "interactive";

  // -- phase overrides and text --
  /**
   * Overrides for the practice phase. Honoured: trial_feedback, feedback_condition, feedback_duration_ms, iti_ms, inter_item_interval_ms,
   * stimulus_duration_ms, tone_ramp_ms, presentation_level_db, adaptive, difficulty_levels, progress_indicator. Other keys are ignored in practice.
   * (default: { trial_feedback: "accuracy", adaptive: null } — S012: practice at a fixed level, the staircase's start level, with feedback. It
   * applies unless the key is set at the top level or in `practice`.)
   */
  practice?: Partial<ToneDetectionOptions>;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

/** Options that can differ between practice and test (the keys `practice` honours). */
export const PHASE_OPTIONS = [
  "trial_feedback",
  "feedback_condition",
  "feedback_duration_ms",
  "iti_ms",
  "inter_item_interval_ms",
  "stimulus_duration_ms",
  "tone_ramp_ms",
  "presentation_level_db",
  "adaptive",
  "difficulty_levels",
  "progress_indicator",
] as const;

export type PhaseOptionKey = (typeof PHASE_OPTIONS)[number];

/** The staircase with every field filled. */
export interface ResolvedAdaptive {
  procedure: "staircase_1up_1down" | "staircase_1up_2down" | "staircase_1up_3down";
  start_level: number;
  /** step sizes by number of reversals (the last repeats), each `{ up, down }` in dB */
  step_sizes: Array<{ up: number; down: number }>;
  target_accuracy: number;
  bounds: [number | null, number | null];
  discontinue_rule: DiscontinueRule | null;
  tracks: "per_condition";
  reset: "block";
}

export type ResolvedOptions = Required<
  Omit<
    ToneDetectionOptions,
    | "practice"
    | "text"
    | "adaptive"
    | "stimulus_set"
    | "difficulty_levels"
    | "practice_criterion"
    | "tone_frequency_hz"
    | "response_keys"
    | "calibration_level_db"
    | "presentation_level_db"
  >
> & {
  adaptive: ResolvedAdaptive | null;
  difficulty_levels: number[] | null;
  stimulus_set: Required<ToneDetectionStimulusSet>;
  /** the conditions: one tone frequency each, in the order given */
  tone_frequency_hz: number[];
  response_keys: string[];
  presentation_level_db: number;
  /** null when the volume is not calibrated */
  calibration_level_db: number | null;
  practice_criterion: Required<PracticeCriterion> | null;
  /** intervals per trial: 3 or 2 */
  n_intervals: number;
  /** "dB SNR" with a masker, "dB FS" in quiet */
  level_unit: "dB SNR" | "dB FS";
};

export const DEFAULT_ADAPTIVE: ResolvedAdaptive = {
  procedure: "staircase_1up_3down",
  start_level: -13.75,
  step_sizes: [
    { up: 1.5, down: 1.5 },
    { up: 0.75, down: 0.75 },
  ],
  target_accuracy: 0.794,
  bounds: [-60, 10],
  discontinue_rule: { trials: 40 },
  tracks: "per_condition",
  reset: "block",
};

/** The staircase defaults in quiet, where the level is the tone's level in dB FS. */
export const DEFAULT_ADAPTIVE_QUIET = { start_level: -30, bounds: [-100, -6] as [number, number] };

export const DEFAULT_PRACTICE_CRITERION: Required<PracticeCriterion> = {
  accuracy: 0.8,
  window: null,
  on_fail: "repeat",
  max_repeats: 2,
};

export const DEFAULT_OPTIONS: Omit<
  ResolvedOptions,
  "difficulty_levels" | "calibration_level_db" | "response_keys" | "n_intervals" | "level_unit"
> & {
  difficulty_levels: null;
  practice: Partial<ToneDetectionOptions>;
} = {
  inter_item_interval_ms: 250,
  stimulus_duration_ms: 250,
  tone_ramp_ms: 10,
  iti_ms: 500,
  feedback_duration_ms: 1000,
  presentation_level_db: DEFAULT_MASKER_LEVEL_DB,
  stimulus_set: { tone: "pure_tone", masker: "white_noise" },
  tone_frequency_hz: [1000],
  block_order: "random_within_block",
  difficulty_levels: null,
  task_variant: "3I-3AFC_which_contains_tone",
  trials_per_condition: 3,
  trials_per_block: null,
  response_device: "keyboard",
  adaptive: DEFAULT_ADAPTIVE,
  device_eligibility: "none",
  headphone_check: "screening_task",
  headphone_screen: "antiphase_quietest_tone",
  headphone_check_trials: 6,
  participant_eligibility: "none",
  practice_criterion: null,
  practice_trials: 6,
  volume_calibration: "participant_adjusted",
  calibration_target: "just_detectable",
  feedback_condition: "all",
  performance_incentive: "none",
  progress_indicator: "counter",
  trial_feedback: "none",
  environment_instructions: "quiet_room",
  judgment_wording: "which_interval_contains_tone",
  instruction_format: "text",
  instruction_demonstration: "interactive",
  practice: { trial_feedback: "accuracy", adaptive: null },
};

// -- resolution ---------------------------------------------------------------------------------

/** Values the package cannot honour: [option, values, reason]. They throw naming the option. */
const NOT_IMPLEMENTED: Array<[keyof ResolvedOptions, string[], string]> = [
  [
    "task_variant",
    [
      "3I-3AFC_oddity",
      "2I-2AFC_which_higher",
      "standard_then_comparison_louder_softer",
      "same_different",
      "AXB",
      "2I-2AFC_tone_sequences_oddity",
    ],
    "only the two detection variants are implemented; discrimination and oddity trials need a standard and a comparison tone and a log-frequency or log-intensity level",
  ],
  [
    "judgment_wording",
    ["which_higher_in_pitch", "comparison_louder_or_softer"],
    "it goes with the discrimination variants, which are not implemented",
  ],
  [
    "response_device",
    ["microphone", "eye_tracker", "gamepad"],
    "only keyboard, mouse and touch (buttons) are implemented",
  ],
  [
    "device_eligibility",
    ["computer_only", "browser_restricted", "hardware_required"],
    "no device or browser check is implemented",
  ],
  ["headphone_check", ["self_report"], 'use "screening_task" or "none"'],
  [
    "headphone_screen",
    ["huggins_pitch", "antiphase_plus_NoSpi_chirp"],
    'only "antiphase_quietest_tone" is implemented (the Huggins pitch and NoSpi chirp stimuli need an FFT-built binaural noise)',
  ],
  [
    "participant_eligibility",
    ["vision", "clinical", "fasting"],
    'only "hearing" (a self-report question) is implemented',
  ],
  [
    "volume_calibration",
    ["calibrated_spl", "intensity_workup"],
    "absolute levels cannot be set in a browser; use participant_adjusted",
  ],
  [
    "performance_incentive",
    ["bonus", "points_only", "fixed_payment"],
    "incentives are not implemented",
  ],
  ["progress_indicator", ["progress_bar"], 'use "counter" or "none"'],
  ["environment_instructions", ["no_aids"], 'only "quiet_room" is implemented'],
  [
    "instruction_format",
    ["audio", "video"],
    "no media is bundled; supply your own instruction trials",
  ],
  [
    "instruction_demonstration",
    ["animated", "guided_trial"],
    "use interactive (real sounds, repeat until correct), examples or none",
  ],
  [
    "trial_feedback",
    ["rt", "accuracy_rt", "points", "reward_outcome", "correct_answer"],
    'use "accuracy" or "none"; a tone detection trial has no response time to give back, and no points',
  ],
  [
    "block_order",
    ["random", "counterbalanced", "alternating"],
    'use "random_within_block", "fixed", "ascending" or "descending": a track is a block, and every condition is tested the same number of times',
  ],
];

const isObj = (v: unknown): v is Record<string, any> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const round3 = (x: number) => Math.round(x * 1000) / 1000;

const NATURAL_TARGET: Record<string, number> = {
  staircase_1up_1down: 0.5,
  staircase_1up_2down: 0.707,
  staircase_1up_3down: 0.794,
};

const PROCEDURES = Object.keys(NATURAL_TARGET);

/** Block sizes helper kept for symmetry with the other packages: `total` over `parts`. */
export function splitTrials(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const extra = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
}

/** One step entry as `{ up, down }` and the target it implies. A number is the larger step when a target is given (1up_1down). */
function resolveStep(
  raw: StepSizeSpec,
  procedure: ResolvedAdaptive["procedure"],
  given: number | undefined
): { step: { up: number; down: number }; target: number } {
  const natural = NATURAL_TARGET[procedure];
  if (typeof raw === "number") {
    if (!(raw > 0)) throw new Error("tone-detection: adaptive.step_size must be > 0.");
    if (procedure === "staircase_1up_1down" && given !== undefined) {
      if (!(given > 0 && given < 1)) {
        throw new Error("tone-detection: adaptive.target_accuracy must be between 0 and 1.");
      }
      // equilibrium: p x down = (1 - p) x up, with `down` the step after a correct answer
      const down = given > 0.5 ? raw * ((1 - given) / given) : raw;
      const up = given > 0.5 ? raw : raw * (given / (1 - given));
      return { step: { up: round3(up), down: round3(down) }, target: given };
    }
    if (given !== undefined && Math.abs(given - natural) > 0.02) {
      throw new Error(
        `tone-detection: adaptive.target_accuracy ${given} contradicts adaptive.procedure "${procedure}", which converges near ${natural}.`
      );
    }
    return { step: { up: raw, down: raw }, target: given ?? natural };
  }
  if (!isObj(raw) || !(raw.up > 0) || !(raw.down > 0)) {
    throw new Error("tone-detection: adaptive.step_size { up, down } must both be > 0.");
  }
  if (procedure === "staircase_1up_1down") {
    const implied = raw.up / (raw.up + raw.down);
    if (given !== undefined && Math.abs(given - implied) > 0.02) {
      throw new Error(
        `tone-detection: adaptive.step_size { up: ${raw.up}, down: ${
          raw.down
        } } and target_accuracy ${given} contradict each other (the steps imply ${implied.toFixed(
          3
        )}; p x down must equal (1 - p) x up).`
      );
    }
    return { step: { up: raw.up, down: raw.down }, target: given ?? round3(implied) };
  }
  if (raw.up !== raw.down) {
    throw new Error(
      `tone-detection: adaptive.procedure "${procedure}" needs equal up and down steps.`
    );
  }
  if (given !== undefined && Math.abs(given - natural) > 0.02) {
    throw new Error(
      `tone-detection: adaptive.target_accuracy ${given} contradicts adaptive.procedure "${procedure}", which converges near ${natural}.`
    );
  }
  return { step: { up: raw.up, down: raw.down }, target: given ?? natural };
}

/** Resolve the `adaptive` bundle: defaults (which depend on whether there is a masker), steps, target, bounds. */
export function resolveAdaptive(user: AdaptiveOptions, masker: boolean): ResolvedAdaptive {
  const procedure = user.procedure ?? DEFAULT_ADAPTIVE.procedure;
  if (!PROCEDURES.includes(procedure)) {
    throw new Error(
      `tone-detection: adaptive.procedure: "${procedure}" is not implemented (use staircase_1up_1down, staircase_1up_2down or staircase_1up_3down; the dossier's "3down1up" is staircase_1up_3down).`
    );
  }
  const proc = procedure as ResolvedAdaptive["procedure"];
  const rawSteps = Array.isArray(user.step_size)
    ? user.step_size
    : user.step_size !== undefined
    ? [user.step_size]
    : DEFAULT_ADAPTIVE.step_sizes.map((s) => s.up);
  if (rawSteps.length === 0)
    throw new Error("tone-detection: adaptive.step_size must not be an empty list.");
  const resolved = rawSteps.map((s, i) =>
    resolveStep(s, proc, i === rawSteps.length - 1 ? user.target_accuracy : undefined)
  );
  const bounds = user.bounds ?? (masker ? DEFAULT_ADAPTIVE.bounds : DEFAULT_ADAPTIVE_QUIET.bounds);
  if (!Array.isArray(bounds) || bounds.length !== 2) {
    throw new Error("tone-detection: adaptive.bounds must be [min, max] (null for no limit).");
  }
  const start =
    user.start_level ??
    (masker ? DEFAULT_ADAPTIVE.start_level : DEFAULT_ADAPTIVE_QUIET.start_level);
  if (typeof start !== "number" || !Number.isFinite(start)) {
    throw new Error("tone-detection: adaptive.start_level must be a number (dB).");
  }
  if (bounds[0] !== null && bounds[1] !== null && !(bounds[0] < bounds[1])) {
    throw new Error("tone-detection: adaptive.bounds must have min < max.");
  }
  if ((bounds[0] !== null && start < bounds[0]) || (bounds[1] !== null && start > bounds[1])) {
    throw new Error(
      `tone-detection: adaptive.start_level ${start} is outside adaptive.bounds [${bounds[0]}, ${bounds[1]}].`
    );
  }
  const tracks = user.tracks ?? "per_condition";
  const reset = user.reset ?? "block";
  if (tracks !== "per_condition") {
    throw new Error(
      'tone-detection: adaptive.tracks: "single" is not implemented: every track is its own staircase ("per_condition").'
    );
  }
  if (reset !== "block") {
    throw new Error(
      `tone-detection: adaptive.reset: "${reset}" is not implemented: every track starts at start_level ("block").`
    );
  }
  const rule =
    user.discontinue_rule === undefined ? DEFAULT_ADAPTIVE.discontinue_rule : user.discontinue_rule;
  return {
    procedure: proc,
    start_level: start,
    step_sizes: resolved.map((r) => r.step),
    target_accuracy: round3(resolved[resolved.length - 1].target),
    bounds: [bounds[0] ?? null, bounds[1] ?? null],
    discontinue_rule: rule,
    tracks: "per_condition",
    reset: "block",
  };
}

/**
 * Resolve user options into complete options for one phase. Pairs that describe the same thing reconcile here:
 * `difficulty_levels` alone switches the staircase off; `headphone_screen` alone switches the screening on; `response_keys` follow the
 * number of intervals; the calibration level follows the masker level.
 */
export function resolveOptions(
  user: ToneDetectionOptions = {},
  phase: "practice" | "test" = "test"
): ResolvedOptions {
  const { practice, text: _text, ...top } = user;
  const topKeys = new Set(Object.keys(top).filter((k) => (top as any)[k] !== undefined));
  let layer: Partial<ToneDetectionOptions> = { ...top };

  if (phase === "practice") {
    const practiceKeys = new Set(Object.keys(practice ?? {}));
    const defaultPractice: Partial<ToneDetectionOptions> = {};
    for (const [k, v] of Object.entries(DEFAULT_OPTIONS.practice)) {
      if (!topKeys.has(k) && !practiceKeys.has(k)) (defaultPractice as any)[k] = v;
    }
    layer = { ...layer, ...defaultPractice, ...(practice ?? {}) };
  }

  const merged: any = { ...DEFAULT_OPTIONS };
  delete merged.practice;
  for (const [k, v] of Object.entries(layer)) if (v !== undefined) merged[k] = v;

  // -- the paradigm: number of intervals
  const variant: TaskVariant = merged.task_variant;
  merged.n_intervals = variant === "2I-2AFC_which_contains_tone" ? 2 : 3;

  // -- stimulus set: the masker decides the unit of the level
  const set = top.stimulus_set ?? {};
  merged.stimulus_set = {
    tone: set.tone ?? DEFAULT_OPTIONS.stimulus_set.tone,
    masker: set.masker ?? DEFAULT_OPTIONS.stimulus_set.masker,
  };
  const masker = merged.stimulus_set.masker !== "none";
  merged.level_unit = masker ? "dB SNR" : "dB FS";

  // -- frequencies: a number is one condition, a list is several
  const f = layer.tone_frequency_hz ?? DEFAULT_OPTIONS.tone_frequency_hz;
  merged.tone_frequency_hz = Array.isArray(f) ? [...f] : [f];

  // -- staircase or fixed levels. Layers, highest precedence first: the user's practice values (practice phase), the user's top level,
  // the package's practice default. The first layer that says anything about the level decides.
  const layers: Array<Partial<ToneDetectionOptions>> =
    phase === "practice" ? [practice ?? {}, top, DEFAULT_OPTIONS.practice] : [top];
  let fixed: boolean | null = null;
  let levels: number[] | null = null;
  let adaptiveInput: AdaptiveOptions = {};
  for (const l of layers) {
    const hasA = l.adaptive !== undefined;
    const hasL = l.difficulty_levels !== undefined && l.difficulty_levels !== null;
    if (!hasA && !hasL) continue;
    if (hasA && hasL && l.adaptive !== null) {
      throw new Error(
        "tone-detection: adaptive and difficulty_levels both set the level of the tone; give one (adaptive: null with difficulty_levels is fixed levels)."
      );
    }
    fixed = hasL || l.adaptive === null;
    if (hasL) levels = l.difficulty_levels as number[];
    else if (isObj(l.adaptive)) adaptiveInput = l.adaptive;
    break;
  }
  if (fixed === null) fixed = false;
  if (fixed) {
    merged.adaptive = null;
    if (levels === null && phase === "practice") {
      // fixed practice without a list: the test's start level (S012 practised at its start level), or the test's own fixed levels
      const testFixed = top.adaptive === null || (top.difficulty_levels ?? null) !== null;
      levels = testFixed
        ? top.difficulty_levels ?? null
        : [resolveAdaptive(isObj(top.adaptive) ? top.adaptive : {}, masker).start_level];
    }
    merged.difficulty_levels = levels;
  } else {
    merged.adaptive = resolveAdaptive(adaptiveInput, masker);
    merged.difficulty_levels = null;
  }

  // -- levels
  merged.presentation_level_db =
    layer.presentation_level_db ?? DEFAULT_OPTIONS.presentation_level_db;

  // -- response keys follow the number of intervals
  merged.response_keys =
    top.response_keys ?? Array.from({ length: merged.n_intervals }, (_, i) => String(i + 1));

  // -- headphone screen and check set each other when only one is given
  if (top.headphone_screen !== undefined && top.headphone_check === undefined) {
    merged.headphone_check = "screening_task";
  }

  // -- calibration level follows the masker (the calibration sound is the masker) or is a fixed default (the tone, in quiet)
  const calGiven = top.calibration_level_db;
  merged.calibration_level_db =
    merged.volume_calibration === "participant_adjusted"
      ? calGiven ??
        (masker
          ? merged.presentation_level_db - DEFAULT_SENSATION_LEVEL_DB
          : DEFAULT_QUIET_CALIBRATION_DB)
      : null;

  // -- practice criterion
  const pc = layer.practice_criterion;
  merged.practice_criterion =
    pc === undefined || pc === null
      ? null
      : {
          accuracy: pc.accuracy ?? DEFAULT_PRACTICE_CRITERION.accuracy,
          window: pc.window === undefined ? DEFAULT_PRACTICE_CRITERION.window : pc.window,
          on_fail: pc.on_fail ?? DEFAULT_PRACTICE_CRITERION.on_fail,
          max_repeats: pc.max_repeats ?? DEFAULT_PRACTICE_CRITERION.max_repeats,
        };
  return merged as ResolvedOptions;
}

const checkDuration = (name: string, d: DurationSpec, allowZero: boolean) => {
  const lo = typeof d === "number" ? d : d?.min;
  const hi = typeof d === "number" ? d : d?.max;
  if (
    typeof lo !== "number" ||
    typeof hi !== "number" ||
    !Number.isFinite(lo) ||
    !Number.isFinite(hi) ||
    hi < lo ||
    lo < 0 ||
    (!allowZero && lo === 0)
  ) {
    throw new Error(
      `tone-detection: ${name} must be a number of ms${
        allowZero ? " >= 0" : " > 0"
      }, or { min, max } with min <= max.`
    );
  }
};

const minOf = (d: DurationSpec) => (typeof d === "number" ? d : d.min);

/** Throw on values the package cannot honour or combinations that contradict each other. */
export function validateOptions(
  o: ResolvedOptions,
  user: ToneDetectionOptions = {},
  phase: "practice" | "test" = "test"
): void {
  for (const [key, values, why] of NOT_IMPLEMENTED) {
    if (values.includes(o[key] as string)) {
      throw new Error(`tone-detection: ${key}: "${o[key]}" is not implemented (${why}).`);
    }
  }
  if (o.stimulus_set.tone !== "pure_tone") {
    throw new Error(
      `tone-detection: stimulus_set.tone: "${o.stimulus_set.tone}" is not implemented (only pure_tone is synthesised).`
    );
  }
  if (o.stimulus_set.masker === "threshold_equalizing_noise_lowpass_6kHz") {
    throw new Error(
      'tone-detection: stimulus_set.masker: "threshold_equalizing_noise_lowpass_6kHz" is not implemented (only white_noise, or none for quiet).'
    );
  }
  if (o.stimulus_set.masker !== "white_noise" && o.stimulus_set.masker !== "none") {
    throw new Error(
      `tone-detection: stimulus_set.masker: unknown value "${o.stimulus_set.masker}".`
    );
  }
  const masker = o.stimulus_set.masker !== "none";

  if (o.stimulus_duration_ms === null) {
    throw new Error(
      "tone-detection: stimulus_duration_ms must be a duration: a tone has to end, so null is not possible."
    );
  }
  checkDuration("stimulus_duration_ms", o.stimulus_duration_ms, false);
  checkDuration("inter_item_interval_ms", o.inter_item_interval_ms, true);
  checkDuration("tone_ramp_ms", o.tone_ramp_ms, true);
  checkDuration("iti_ms", o.iti_ms, true);
  checkDuration("feedback_duration_ms", o.feedback_duration_ms, true);
  const maxRamp = typeof o.tone_ramp_ms === "number" ? o.tone_ramp_ms : o.tone_ramp_ms.max;
  if (2 * maxRamp > minOf(o.stimulus_duration_ms)) {
    throw new Error(
      "tone-detection: tone_ramp_ms: the two ramps must fit inside stimulus_duration_ms (2 x ramp <= duration)."
    );
  }

  if (
    !Array.isArray(o.tone_frequency_hz) ||
    o.tone_frequency_hz.length === 0 ||
    o.tone_frequency_hz.some((f) => typeof f !== "number" || !(f >= 20 && f <= 20000))
  ) {
    throw new Error(
      "tone-detection: tone_frequency_hz must be a frequency, or a list of frequencies, between 20 and 20000 Hz."
    );
  }
  if (new Set(o.tone_frequency_hz).size !== o.tone_frequency_hz.length) {
    throw new Error(
      "tone-detection: tone_frequency_hz names a frequency twice; each frequency is one condition."
    );
  }
  if (!Number.isInteger(o.trials_per_condition) || o.trials_per_condition < 1) {
    throw new Error("tone-detection: trials_per_condition must be a positive integer.");
  }
  if (
    !(
      typeof o.presentation_level_db === "number" &&
      Number.isFinite(o.presentation_level_db) &&
      o.presentation_level_db <= 0
    )
  ) {
    throw new Error(
      "tone-detection: presentation_level_db must be a number <= 0 (dB re full scale)."
    );
  }
  if (!masker && user.presentation_level_db !== undefined && phase === "test") {
    throw new Error(
      'tone-detection: presentation_level_db is the level of the masker, and stimulus_set.masker is "none" (detection in quiet): the tone\'s level is the tracked level (adaptive.start_level or difficulty_levels).'
    );
  }

  // -- response
  if (!Array.isArray(o.response_keys) || o.response_keys.length !== o.n_intervals) {
    throw new Error(
      `tone-detection: response_keys must list one key per interval (${o.n_intervals} for task_variant "${o.task_variant}").`
    );
  }
  if (new Set(o.response_keys).size !== o.response_keys.length) {
    throw new Error("tone-detection: response_keys must be distinct.");
  }

  // -- level: staircase or fixed levels
  if (o.adaptive === null) {
    const dl = o.difficulty_levels;
    if (
      !Array.isArray(dl) ||
      dl.length === 0 ||
      dl.some((v) => typeof v !== "number" || !Number.isFinite(v))
    ) {
      throw new Error(
        "tone-detection: with adaptive: null the level needs difficulty_levels: a list of levels in dB (dB SNR with a masker, dB FS in quiet)."
      );
    }
    if (phase === "test") {
      if (
        !(
          typeof o.trials_per_block === "number" &&
          Number.isInteger(o.trials_per_block) &&
          o.trials_per_block >= 1
        )
      ) {
        throw new Error(
          "tone-detection: fixed levels (adaptive: null) need trials_per_block: the number of trials in each track."
        );
      }
    }
  } else {
    if (o.adaptive.discontinue_rule === null && phase === "test") {
      throw new Error(
        "tone-detection: adaptive.discontinue_rule must be given: a track with no end rule would never finish (use { trials: 40 } or { reversals: 8 })."
      );
    }
    const rule = o.adaptive.discontinue_rule;
    if (rule) {
      const known = [
        "trials",
        "reversals",
        "consecutive_failures",
        "failures_at_level",
        "ceiling",
        "mistakes",
      ];
      const unknown = Object.keys(rule).filter((k) => !known.includes(k));
      if (unknown.length) {
        throw new Error(
          `tone-detection: adaptive.discontinue_rule: unknown rule ${unknown.join(
            ", "
          )} (known: ${known.join(", ")}).`
        );
      }
      for (const k of Object.keys(rule)) {
        const v = (rule as any)[k];
        if (!Number.isInteger(v) || v < 1) {
          throw new Error(
            `tone-detection: adaptive.discontinue_rule.${k} must be a positive integer.`
          );
        }
      }
      if (Object.keys(rule).length === 0 && phase === "test") {
        throw new Error(
          "tone-detection: adaptive.discontinue_rule is empty: a track needs an end rule."
        );
      }
    }
    // the tone and the masker must fit inside full scale at the loudest allowed level
    const upper = o.adaptive.bounds[1];
    if (masker && upper !== null) {
      const sd = Math.pow(10, o.presentation_level_db / 20) / Math.SQRT2;
      const toneAmp = Math.pow(10, (o.presentation_level_db + upper) / 20);
      if (toneAmp + 4.5 * sd > 1) {
        throw new Error(
          `tone-detection: adaptive.bounds: the loudest tone (${upper} dB SNR) on a masker of ${o.presentation_level_db} dB FS would clip; lower the upper bound or presentation_level_db.`
        );
      }
    }
    if (!masker && (o.adaptive.bounds[1] === null || o.adaptive.bounds[1] > 0)) {
      throw new Error(
        "tone-detection: adaptive.bounds: in quiet the level is in dB FS and must have an upper bound <= 0."
      );
    }
  }
  if (o.difficulty_levels) {
    for (const v of o.difficulty_levels) {
      if (!masker && v > 0)
        throw new Error(
          "tone-detection: difficulty_levels: levels in quiet are in dB FS and must be <= 0."
        );
      if (masker) {
        const sd = Math.pow(10, o.presentation_level_db / 20) / Math.SQRT2;
        if (Math.pow(10, (o.presentation_level_db + v) / 20) + 4.5 * sd > 1) {
          throw new Error(
            `tone-detection: difficulty_levels: ${v} dB SNR on a masker of ${o.presentation_level_db} dB FS would clip.`
          );
        }
      }
    }
  }

  // -- procedure
  if (!Number.isInteger(o.practice_trials) || o.practice_trials < 0) {
    throw new Error("tone-detection: practice_trials must be an integer >= 0.");
  }
  if (!Number.isInteger(o.headphone_check_trials) || o.headphone_check_trials < 1) {
    throw new Error("tone-detection: headphone_check_trials must be a positive integer.");
  }
  if (o.volume_calibration !== "participant_adjusted") {
    if (user.calibration_level_db !== undefined) {
      throw new Error(
        `tone-detection: calibration_level_db is the level of the volume-setting sound, but volume_calibration is "${o.volume_calibration}" (no volume-setting screen).`
      );
    }
    if (user.calibration_target !== undefined) {
      throw new Error(
        `tone-detection: calibration_target needs volume_calibration "participant_adjusted", not "${o.volume_calibration}".`
      );
    }
  } else if (
    o.calibration_level_db !== null &&
    !(Number.isFinite(o.calibration_level_db) && o.calibration_level_db <= 0)
  ) {
    throw new Error(
      "tone-detection: calibration_level_db must be a number <= 0 (dB re full scale)."
    );
  }
  if (user.headphone_screen !== undefined && user.headphone_check === "none") {
    throw new Error(
      'tone-detection: headphone_screen names a screen, but headphone_check is "none".'
    );
  }
  const pc = o.practice_criterion;
  if (pc) {
    if (!(pc.accuracy > 0 && pc.accuracy <= 1))
      throw new Error("tone-detection: practice_criterion.accuracy must be in (0, 1].");
    if (pc.window !== null && !(pc.window >= 1))
      throw new Error("tone-detection: practice_criterion.window must be >= 1 or null.");
    if (!["repeat", "continue", "end"].includes(pc.on_fail)) {
      throw new Error(
        'tone-detection: practice_criterion.on_fail must be "repeat", "continue" or "end".'
      );
    }
    if (!(pc.max_repeats >= 0) || !Number.isInteger(pc.max_repeats)) {
      throw new Error("tone-detection: practice_criterion.max_repeats must be an integer >= 0.");
    }
    if (phase === "test" && o.practice_trials === 0) {
      throw new Error("tone-detection: practice_criterion needs practice_trials > 0.");
    }
  }
}
