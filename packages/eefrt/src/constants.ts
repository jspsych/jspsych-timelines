import { version } from "../package.json";

export const TASK_NAME = "eefrt";
export const VERSION: string = version;
export const TASK_CLASS = "jspsych-timelines-eefrt";

/** Name of the effort plugin written to `trial_type` by jsPsych. */
export const EFFORT_PLUGIN_NAME = "eefrt-effort";

/** Most attempts at one step of the interactive instruction walkthrough; after that the answer is shown and it moves on. */
export const INSTRUCTION_MAX_ATTEMPTS = 3;
/** Duration of the "Correct!" confirmation in the walkthrough, ms. */
export const INSTRUCTION_CORRECT_MS = 900;

/**
 * Hard stop on the number of test trials in a session, whatever the clock says. The session clock
 * (see `trials.ts`) ends a `fixed_time` session; this makes sure a run with tiny durations cannot go on forever.
 */
export const MAX_SESSION_TRIALS = 600;

/**
 * Hard-task rewards between the "low" and "mid" and between the "mid" and "high" bin (thirds of the
 * range the session offers); Ohmann et al. 2022 binned $1.24-$4.30 at 2.30 and 3.30 (S008).
 */
export const REWARD_BINS = ["low", "mid", "high"] as const;

/** Trials of the "first n" analysis window several studies use to equalise trial numbers in a time-limited session (S007, S034). */
export const FIRST_N_TRIALS = 50;

/** The simulated participant: a logistic choice model and per-task press rates (see `simulation.ts`). */
export const SIMULATION = {
  choice: {
    /** log-odds of choosing the hard task at probability .5 and a hard reward 2.77 times the easy one */
    intercept: -0.2,
    /** per unit of win probability above .5 */
    per_probability: 3.5,
    /** per unit of (hard reward / easy reward) above 2.77 (the mean of 1.24..4.30 over $1) */
    per_reward_ratio: 0.9,
    reward_ratio_centre: 2.77,
    /** chance of not choosing in time when there is a window (the task then assigns one at random) */
    timeout: 0.02,
    /** ex-Gaussian choice RT, ms */
    rt: { mu: 1100, sigma: 250, tau: 500 },
  },
  /** presses per second: mean and between-trial sd; within a trial the gaps vary by `gap_cv` */
  press_rate: {
    easy: { mean: 5.8, sd: 0.7 },
    hard: { mean: 5.3, sd: 0.55 },
    gap_cv: 0.2,
    min_gap_ms: 60,
  },
} as const;
