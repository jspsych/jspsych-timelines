/** What the instruction texts say about the configured items and response. */
export interface TextItems {
  /** One item as the participant calls it: "design", "word", "picture". */
  noun: string;
  /** The same in the plural. */
  nouns: string;
  /** What the participant does to pick: "click" with a mouse, "tap" on a touch screen. */
  verb: string;
}

/** Arguments of the instruction pages. */
export interface InstructionArgs extends TextItems {
  /** The position-repeat rule: "none", "instructed", "enforced" or "detect_and_remind". */
  position_rule: "none" | "instructed" | "enforced" | "detect_and_remind";
  /** The most picks at one screen position in a row. */
  position_max: number;
  /** Seconds each pick may take, a whole or fractional number; null when untimed or jittered. */
  limit_seconds: number | null;
  /** True when each pick has a time limit (fixed or jittered). */
  timed: boolean;
  /** True when items sit at free positions, not in grid slots. */
  free_positions: boolean;
  /** True when only some of the items move between pages. */
  partial_reshuffle: boolean;
}

/** Arguments of the walkthrough step texts. */
export interface StepArgs extends TextItems {
  /** "first": any pick is right; "new": one of the others; "last": the one that is left. */
  step: "first" | "new" | "last";
  /** Number of items in the walkthrough's set. */
  set_size: number;
  /** Number of items picked so far in the walkthrough's set. */
  n_picked: number;
}

/** Arguments of the page that opens a series. */
export interface SeriesIntroArgs extends TextItems {
  phase: "practice" | "test";
  /** 1-based number of the series in its phase. */
  series: number;
  /** Series in the phase. */
  n_series: number;
  /** Items in the set. */
  set_size: number;
}

/** Arguments of the page before the practice and of the page before the test. */
export interface PhaseIntroArgs extends TextItems {
  /** Series the phase has. */
  n_series: number;
  /** Set sizes of the phase, in order of first use. */
  set_sizes: number[];
  /** True when a message follows each pick. */
  feedback: boolean;
  /** True when a practice phase came before (test intro only). */
  after_practice: boolean;
}

/** Arguments of the end-of-task result. */
export interface ResultArgs {
  /** Repeat errors in all test series. */
  total_errors: number;
  /** Test series done. */
  n_series: number;
  /** Errors per set size, in set-size order. */
  by_set_size: { set_size: number; errors: number }[];
}

/**
 * Text for self-ordered pointing. To translate, pass a partial object with the same keys as `text`.
 * Functions that interpolate runtime values take named parameters; see each doc comment.
 */
export interface TextConfig {
  // -- instruction pages --
  /** First page: what is on the screen and how to respond. */
  instruction_intro: (r: InstructionArgs) => string;
  /** Second page: pick a different item every time; positions change. */
  instruction_rule: (r: InstructionArgs) => string;
  /** Page about repeating a screen position (only when `position_repeat_rule` is not "none"). */
  instruction_position_rule: (r: InstructionArgs) => string;
  /** Page about the time limit (only when `response_window_ms` is not null). */
  instruction_time_limit: (r: InstructionArgs) => string;
  /** Page before the interactive walkthrough. */
  instruction_demo_intro: (r: TextItems) => string;
  /** Explanation shown under a walkthrough step. */
  instruction_step: (r: StepArgs) => string;
  /** Hint after a repeat in a walkthrough step; the step then repeats. */
  instruction_hint: (r: StepArgs) => string;
  /** Shown after the last allowed attempt, under the item the participant had not picked. */
  instruction_reveal: (r: StepArgs) => string;
  /** Brief confirmation after a correct walkthrough pick. */
  instruction_correct: string;
  /** Page after the walkthrough. */
  instruction_demo_done: (r: TextItems) => string;
  /** Page before the practice: what changes (real pace, messages, the main task follows). */
  practice_intro: (r: PhaseIntroArgs) => string;
  /** Page before the test. */
  test_intro: (r: PhaseIntroArgs) => string;

  // -- series and pages --
  /** The page that opens each series. */
  series_intro: (r: SeriesIntroArgs) => string;
  /** Message after a new pick (`trial_feedback: "accuracy"`). */
  feedback_new: string;
  /** Message after a repeat (`trial_feedback: "accuracy"`). */
  feedback_repeat: string;
  /** Reminder after a pick that broke the position limit (`position_repeat_rule: "detect_and_remind"`). */
  position_reminder: (r: { noun: string; nouns: string; position_max: number }) => string;
  /** Accessible name of an item button; `position` is its 1-based slot. */
  item_button_label: (r: { position: number }) => string;

  // -- buttons and completion --
  continue_button: string;
  task_complete: string;
  /** Result shown with `end_of_task_feedback: "score"`. */
  result_summary: (r: ResultArgs) => string;
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const defaultText: TextConfig = {
  instruction_intro: (r) =>
    `<h2>Self-ordered pointing</h2>` +
    `<p>On each screen you will see several ${r.nouns} at once.</p>` +
    `<p>${capital(r.verb)} one ${r.noun} on each screen.</p>`,
  instruction_rule: (r) =>
    `<p>Pick a ${r.noun} you have <strong>not picked before</strong> in this set. After every pick the screen changes, ` +
    `${
      r.partial_reshuffle
        ? `and some of the ${r.nouns} move to new places`
        : `and the ${r.nouns} move to new places`
    }, so remember which ${r.nouns} you have picked, not where they were.</p>` +
    `<p>When you have picked every ${r.noun} in the set once, the set is done and the next one begins.</p>`,
  instruction_position_rule: (r) =>
    r.position_rule === "enforced"
      ? `<p>Do not rely on screen position. A ${r.noun} in the same position as your last ${
          r.position_max === 1 ? "pick" : `${r.position_max} picks`
        } ` + `cannot be picked again: that position is switched off for one screen.</p>`
      : r.position_rule === "detect_and_remind"
      ? `<p>Do not rely on screen position. Try not to pick the same position more than ${r.position_max} times in a row. ` +
        `If you do, you will see a reminder.</p>`
      : `<p>Do not rely on screen position. Do not pick the same position more than ${r.position_max} times in a row.</p>`,
  instruction_time_limit: (r) =>
    r.limit_seconds !== null
      ? `<p>Each pick has a time limit of ${r.limit_seconds} seconds. If time runs out, the screen moves on without a pick.</p>`
      : `<p>Each pick has a time limit. If time runs out, the screen moves on without a pick.</p>`,
  instruction_demo_intro: (r) =>
    `<p>Let us try it with a small set of three ${r.nouns}. Do exactly what each message says.</p>`,
  instruction_step: (r) =>
    r.step === "first"
      ? `Pick any ${r.noun}.`
      : r.step === "new"
      ? `The ${r.nouns} have moved. Pick a ${r.noun} you have not picked yet.`
      : `You have picked ${r.n_picked} of ${r.set_size}. Pick the ${r.noun} that is left.`,
  instruction_hint: (r) =>
    `<p>You already picked that ${r.noun}. Pick one you have <strong>not</strong> picked yet. The ${r.nouns} will move again.</p>`,
  instruction_reveal: (r) =>
    `<p>This is the ${r.noun} you had not picked yet. In the task, pick a new one each time.</p>`,
  instruction_correct: "Correct",
  instruction_demo_done: (r) =>
    `<p>That was one set. In the task the sets are bigger, and you pick every ${r.noun} in a set once.</p>`,
  practice_intro: (r) =>
    `<h2>Practice</h2>` +
    `<p>Now you will practice with ${r.n_series} ${
      r.n_series === 1 ? "set" : "sets"
    } of ${r.set_sizes.join(", ")} ${r.nouns}.</p>` +
    `<p>${
      r.feedback
        ? `After each pick you will see whether it was new or a repeat. `
        : `You will not see a message after each pick. `
    }These sets run at the pace of the real task, and the main task follows.</p>`,
  test_intro: (r) =>
    `<h2>Main task</h2>` +
    `<p>${
      r.after_practice ? "Practice is over. " : ""
    }The main task starts now, at the same pace. ` +
    `You will do ${r.n_series} ${r.n_series === 1 ? "set" : "sets"}, with ${r.set_sizes.join(
      ", "
    )} ${r.nouns} ${r.set_sizes.length > 1 ? "in the sets" : "in each set"}. ` +
    `${
      r.feedback
        ? "After each pick you will see whether it was new or a repeat."
        : "You will not see a message after each pick."
    }</p>` +
    `<p>Pick a ${r.noun} you have not picked before in the set.</p>`,

  series_intro: (r) =>
    `<h2>${r.phase === "practice" ? "Practice set" : "Set"} ${r.series} of ${r.n_series}</h2>` +
    `<p>This set has ${r.set_size} ${r.nouns}. Pick each one once.</p>`,
  feedback_new: "New",
  feedback_repeat: "Picked before",
  position_reminder: (r) =>
    `<p>Reminder: do not pick the same position more than ${r.position_max} times in a row. ` +
    `Remember the ${r.nouns} you picked, not where they were.</p>`,
  item_button_label: (r) => `Item ${r.position}`,

  continue_button: "Continue",
  task_complete: "Task complete",
  result_summary: (r) =>
    `<p>Repeat errors: ${r.total_errors} in ${r.n_series} ${
      r.n_series === 1 ? "set" : "sets"
    }.</p>` +
    (r.by_set_size.length > 1
      ? `<p>${r.by_set_size.map((s) => `${s.set_size} items: ${s.errors}`).join("; ")}.</p>`
      : ""),
};
