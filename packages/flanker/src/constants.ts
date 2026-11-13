import { version } from "../package.json";

export const TASK_NAME = "flanker";
export const VERSION: string = version;
export const TASK_CLASS = "jspsych-timelines-flanker";

/** Cue duration in ms; the spec records 250 ms (S068) but has no option for it, so it is fixed. */
export const CUE_DURATION_MS = 250;
/** Number of instructed-response probes for attention_checks: "instructed_items" (count not stated in the dossier). */
export const ATTENTION_CHECK_PROBES = 2;
/** Pixels per degree assumed when "deg" is used without screen calibration (1 cm at 57 cm viewing distance, 96 dpi). */
export const DEFAULT_PX_PER_DEG = 37.8;

/** Most attempts at one step of the interactive instruction walkthrough; after that the answer is shown and it moves on. */
export const INSTRUCTION_MAX_ATTEMPTS = 3;
/** How long a no-go walkthrough step waits for a response, ms (the one timed step: withholding cannot be observed without a window). */
export const INSTRUCTION_NOGO_WAIT_MS = 2500;
/** Duration of the "Correct!" confirmation in the walkthrough, ms. */
export const INSTRUCTION_CORRECT_MS = 900;
