import { version } from "../package.json";

export const TASK_NAME = "go-nogo";
export const VERSION: string = version;
export const TASK_CLASS = "jspsych-timelines-go-nogo";

/** Size of the stimulus, px. The spec has no size option; the reference implementations draw large (about 100 px) shapes. */
export const STIMULUS_SIZE_PX = 100;
/** Trials in one go-only baseline block (`single_task_blocks`): 16, as in the one study that reports it (S183). */
export const BASELINE_TRIALS = 16;
/** Seed of the generator used for a `fixed_sequence` order with constraints, so every participant gets the same sequence. */
export const FIXED_SEQUENCE_SEED = 20240611;
/** Deadline helpers: the fixed deadline used in practice and until enough practice RTs exist, ms (the middle of the default 1000-1500 ms range). */
export const DEADLINE_FALLBACK_MS = 1250;
/** Fewest usable practice RTs a deadline helper needs before it calibrates. */
export const DEADLINE_MIN_RTS = 5;

/** Most attempts at one step of the interactive instruction walkthrough; after that the answer is shown and it moves on. */
export const INSTRUCTION_MAX_ATTEMPTS = 3;
/** How long a no-go walkthrough step waits for a response, ms (the one timed step: withholding cannot be observed without a window). */
export const INSTRUCTION_NOGO_WAIT_MS = 2500;
/** Duration of the "Correct!" confirmation in the walkthrough, ms. */
export const INSTRUCTION_CORRECT_MS = 900;
/** How long the response acknowledgement (highlight, mark) stays on the stimulus, ms (PEBL: 150 ms, S028). */
export const ACKNOWLEDGE_MS = 150;
