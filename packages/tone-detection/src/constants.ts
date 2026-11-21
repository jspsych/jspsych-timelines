import { version } from "../package.json";

export const TASK_NAME = "tone-detection";
export const VERSION: string = version;
export const TASK_CLASS = "jspsych-timelines-tone-detection";

/**
 * How levels are stated (the package's one convention).
 *
 * Every level is in dB re digital full scale (dB FS), as an RMS level: 0 dB FS is the RMS of a full-scale sine wave
 * (peak amplitude 1). A tone at L dB FS has peak amplitude 10^(L/20); noise at L dB FS has RMS 10^(L/20) / sqrt(2).
 * An SNR is the difference of the two levels, so a tone at -10 dB SNR re a masker at -20 dB FS is at -30 dB FS.
 * The browser cannot know the device volume, so nothing here is dB SPL or dB HL.
 */
export const LEVEL_UNITS = { snr: "dB SNR", full_scale: "dB FS" } as const;
export type LevelUnit = (typeof LEVEL_UNITS)[keyof typeof LEVEL_UNITS];

/** Sine whose peak is 1 has RMS 1/sqrt(2); the level convention above. */
export const SINE_RMS_AT_FULL_SCALE = Math.SQRT1_2;

/** Task constants for the sounds the package plays that are not options. */
export const AUDIO = {
  /** Noise before the first interval of a trial (the masker is on while the intervals play), ms. */
  masker_lead_ms: 300,
  /** Fade of the masker at its start and end, ms. */
  masker_fade_ms: 20,
  /** The sound starts this long after the trial starts, so the audio clock has time to begin, ms. */
  start_delay_ms: 50,
  /** The masker is kept this many standard deviations inside full scale when levels are checked (noise peaks reach about 4.5). */
  noise_peak_sd: 4.5,
  /** The calibration noise is looped for this long before it repeats, s (white noise has no audible seam). */
  calibration_loop_s: 4,
} as const;

/** Default level of the masker, dB FS (RMS). The anchor states it only relative to the participant's threshold. */
export const DEFAULT_MASKER_LEVEL_DB = -20;
/** The anchor's masker is 40 dB above the participant's just-detectable noise level (S012). */
export const DEFAULT_SENSATION_LEVEL_DB = 40;
/** Digital level of the calibration sound in quiet (no masker to derive it from), dB FS. */
export const DEFAULT_QUIET_CALIBRATION_DB = -60;
/** The tone of a walkthrough trial is this far above the masker (dB SNR): clearly audible. */
export const WALKTHROUGH_SNR_DB = 6;
/** In quiet the walkthrough tone is this far above the calibration sound, dB. */
export const WALKTHROUGH_QUIET_RE_CALIBRATION_DB = 36;
/** Practice and walkthrough use the start level of the staircase by default (S012 practised at its start level). */

/** The headphone screen (Woods et al., 2017, as used in S044 and S013). */
export const HEADPHONE_SCREEN = {
  frequency_hz: 200,
  tone_ms: 1000,
  ramp_ms: 20,
  gap_ms: 500,
  /** the target is this much quieter than the two other tones, dB */
  target_attenuation_db: 6,
  level_db: -24,
} as const;

/** Most trials one track may run when its stop rule has not ended it (a safety net), recorded as stop_reason "cap". */
export const MAX_TRIALS_PER_TRACK = 200;

/** Most attempts at one step of the interactive walkthrough; after that the answer is given and it moves on. */
export const INSTRUCTION_MAX_ATTEMPTS = 3;
/** Duration of the "Correct!" confirmation in the walkthrough, ms. */
export const INSTRUCTION_CORRECT_MS = 900;

/**
 * The simulated listener used by data-only simulation: a psychometric function of level with a guess rate of
 * 1/n_intervals and a lapse rate, so staircases reverse and converge.
 */
export const SIMULATION = {
  /** level at which the unlapsed observer is at its 50% point between guessing and perfect, with a masker (dB SNR) */
  threshold_snr_db: -21,
  /** the same in quiet (dB FS) */
  threshold_quiet_db: -60,
  /** logistic scale, dB */
  slope_db: 1.5,
  lapse_rate: 0.02,
  /** response time after the last sound, ms: ex-Gaussian */
  rt: { mu: 500, sigma: 80, tau: 300 },
  /** headphone screen: probability of a correct answer (a listener wearing headphones, mostly) */
  headphone_accuracy: 0.9,
};
