import { version } from "../package.json";

export const TASK_NAME = "self-ordered-pointing";
export const VERSION: string = version;
export const TASK_CLASS = "jspsych-timelines-self-ordered-pointing";
/** Added to the display element on the screens whose stage is the item grid (the plugin's button group). */
export const PICK_CLASS = `${TASK_CLASS}-pick`;

/** Most items in the built-in pools (abstract designs, words, nonwords). */
export const POOL_SIZE = 48;
/** Largest grid the layout is built for. */
export const MAX_SET_SIZE = 12;

/** Set size of the interactive walkthrough. */
export const INSTRUCTION_SET_SIZE = 3;
/** Most attempts at one step of the walkthrough; after that the answer is shown and it moves on. */
export const INSTRUCTION_MAX_ATTEMPTS = 3;
/** Duration of the "Correct" confirmation in the walkthrough, ms. */
export const INSTRUCTION_CORRECT_MS = 900;

/** Fraction of the items that move after a choice under `partial_reshuffle_each_page`. */
export const DEFAULT_RESHUFFLE_PROPORTION = 0.5;
/** Most consecutive picks at one screen position that the instructed / enforced rule allows (Petrides & Milner style: 2). */
export const DEFAULT_POSITION_REPEAT_MAX = 2;
