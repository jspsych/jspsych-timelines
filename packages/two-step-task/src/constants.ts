import { version } from "../package.json";

export const TASK_NAME = "two-step-task";
export const VERSION: string = version;
export const TASK_CLASS = "jspsych-timelines-two-step-task";

/** The two first-stage options (data: `stage1_choice`). Option A usually leads to the red state, B to the blue one. */
export const SHIP_IDS = ["A", "B"] as const;
/** The two second-stage states, named by the colour of their screen (data: `stage2_state`). */
export const STATE_IDS = ["red", "blue"] as const;
/** The two options of each state (data: `stage2_choice` is `option_1` or `option_2`). */
export const OPTION_IDS = ["option_1", "option_2"] as const;
/** The state each first-stage option usually leads to. */
export const COMMON_STATE = { A: "red", B: "blue" } as const;

/** Most attempts at one step of the interactive instruction walkthrough; after that the answer is shown and it moves on. */
export const INSTRUCTION_MAX_ATTEMPTS = 3;
/** Duration of the "Correct!" confirmation in the walkthrough, ms. */
export const INSTRUCTION_CORRECT_MS = 900;
/** How long the walkthrough shows the coin (or no coin) after its scripted second-stage choice, ms. */
export const INSTRUCTION_OUTCOME_MS = 1200;

/**
 * With `missed_response_handling: "repeat_trial"`, a trial that is missed again and again is skipped after this many
 * repeats. The literature's cap is an abort after N missed trials (a performance gate, not built in), and without a
 * cap a participant who never answers would repeat one trial for ever.
 */
export const MAX_TRIAL_REPEATS = 5;

/** The simulated participant (a hybrid model-based / model-free learner) used by data-only and visual simulation. */
export const SIMULATION = {
  /** weight of the model-based values in the first-stage choice (0 = model-free, 1 = model-based) */
  w: 0.5,
  /** learning rate */
  alpha: 0.4,
  /** softmax inverse temperature */
  beta: 4,
  /** ex-Gaussian RT (ms): mu, sigma, tau */
  rt: { mu: 450, sigma: 60, tau: 120 },
  /** extra second-stage RT after a rare transition, ms (the RT signature of model-based control) */
  rare_rt_cost: 80,
};
