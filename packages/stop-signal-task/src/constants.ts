import { version } from "../package.json";

export const TASK_NAME = "stop-signal-task";
export const VERSION: string = version;
export const TASK_CLASS = "jspsych-timelines-stop-signal-task";

/** Task colours. The spec has no colour option; these paint the whole display (black, white arrows, a red signal). */
export const STAGE_FG = "#ffffff";
export const STAGE_BG = "#000000";

/** Length of the tone for the auditory stop signal when `stimulus_duration_ms.stop_signal` is null, ms (75 ms, S057). */
export const TONE_DURATION_MS = 75;
/** Frequency of the auditory stop signal, Hz (750 Hz, S057). */
export const TONE_FREQUENCY_HZ = 750;

/** Most attempts at one step of the interactive instruction walkthrough; after that the answer is shown and it moves on. */
export const INSTRUCTION_MAX_ATTEMPTS = 3;
/** How long a stop step of the walkthrough waits for a response, ms (the one timed step: withholding cannot be observed without a window). */
export const INSTRUCTION_STOP_WAIT_MS = 2500;
/** Stop-signal delay of the walkthrough's stop step, ms. */
export const INSTRUCTION_SSD_MS = 250;
/** Duration of the "Correct!" confirmation in the walkthrough, ms. */
export const INSTRUCTION_CORRECT_MS = 900;

/**
 * Checks for a usable stop-signal session. From the consensus guide (Verbruggen et al., 2019, S001, as the dossier
 * records it): at least 50 stop trials; p(respond | signal) between 0.25 and 0.75; failed-stop RTs faster than go RTs
 * (the race model's independence assumption). The go-omission (25%) and choice-error (10%) limits are package
 * conventions: the dossier only says that studies add their own thresholds on omissions and go accuracy (S026, S030, S080)
 * and gives no numbers, so these two are not from a source.
 */
export const CHECK_LIMITS = {
  p_respond_signal: [0.25, 0.75] as [number, number],
  go_omission_rate_max: 0.25,
  go_choice_error_rate_max: 0.1,
  min_stop_trials: 50,
};

/** The simulated participant used by data-only and visual simulation (an independent race model). */
export const SIMULATION = {
  /** go RT: ex-Gaussian, ms */
  go_rt: { mu: 400, sigma: 50, tau: 100 },
  /** stop-signal reaction time, mean and SD, ms */
  ssrt: { mean: 200, sd: 30 },
  /** probability of ignoring the stop signal altogether (trigger failure) */
  trigger_failure: 0.03,
  /** probability of a go omission */
  go_omission: 0.02,
  /** probability of pressing the wrong key on a go trial */
  choice_error: 0.03,
};
