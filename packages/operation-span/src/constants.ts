import { version } from "../package.json";

export const TASK_NAME = "operation-span";
export const VERSION: string = version;
export const TASK_CLASS = "jspsych-timelines-operation-span";

/**
 * Letters used as memoranda: the twelve consonants of the Engle-lab automated span (F H J K L N P Q R S T Y),
 * shown in the 4 x 3 recall matrix (Unsworth et al. 2005, S006).
 */
export const LETTERS: readonly string[] = [
  "F",
  "H",
  "J",
  "K",
  "L",
  "N",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "Y",
];
/** Digits as memoranda (S020). */
export const DIGITS: readonly string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
/** Columns of the recall matrix (S006: a 4 x 3 matrix, so 4 columns). */
export const GRID_COLUMNS = 4;

/** Processing accuracy that the anchor asks participants to keep and uses as an exclusion criterion (S006, S007). */
export const PROCESSING_ACCURACY_CRITERION = 0.85;
/**
 * The fixed deadline (ms) the calibrated-deadline helpers return while they have too few practice RTs.
 * It is the spec's `response_window_ms` fill value (6000 ms, 2 of 6 fixed-deadline values; S021, S026).
 */
export const FALLBACK_DEADLINE_MS = 6000;
/** Fewest usable correct practice RTs a calibrated deadline needs (PACKAGE-STANDARD §2a). */
export const MIN_CALIBRATION_ROWS = 5;
/** How long the "too slow" screen shows after a processing deadline is missed in the two-screen format, ms. */
export const TIMEOUT_NOTICE_MS = 600;

/** Most attempts at one step of the interactive walkthrough; after that the answer is shown and it moves on. */
export const INSTRUCTION_MAX_ATTEMPTS = 3;
/** Duration of the "Correct!" confirmation in the walkthrough, ms. */
export const INSTRUCTION_CORRECT_MS = 900;
/** Set size of the walkthrough's recall step. */
export const INSTRUCTION_RECALL_SET_SIZE = 2;
