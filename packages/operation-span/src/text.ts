/** Arguments of the processing-task instruction text. */
export interface ProcessingInstructionArgs {
  /** Device of the processing response. */
  device: "keyboard" | "mouse" | "touch";
  /** HTML of the label of the "true" response: a key cap or the button label. */
  true_label: string;
  /** HTML of the label of the "false" response. */
  false_label: string;
  /** Layout of the processing task. */
  display_format: "problem_then_answer_screens" | "equation_with_answer_single_screen";
  /** Label of the key or button that says "I have solved it" (two-screen format). */
  solved_label: string;
  /** Whether the problem has a time limit. */
  timed: boolean;
}

/** Arguments of the recall instruction text. */
export interface RecallInstructionArgs {
  format: "n_afc" | "free_text" | "single_response";
  order: "serial" | "free";
  omission: "blank_button" | "none" | "question_mark_key" | "skip_button";
  /** Label of the blank/skip button (empty when the handling is not a button). */
  blank_label: string;
}

/** Arguments of the walkthrough step texts. */
export interface InstructionStepArgs extends ProcessingInstructionArgs {
  /** "processing_true", "processing_false" or "recall". */
  step: "processing_true" | "processing_false" | "recall";
  /** HTML of the response that is correct for a processing step (a key cap or a button label). */
  correct_label: string;
  /** The memoranda of the recall step, in presentation order. */
  items: string[];
  recall: RecallInstructionArgs;
}

/**
 * Text for the operation span. To translate, pass a partial object with the same keys as `text`.
 * Functions that interpolate runtime values take named parameters; see each doc comment.
 */
export interface TextConfig {
  // -- instruction pages --
  /**
   * First instruction page.
   * @param r.memorandum_first true when each memorandum comes before its problem
   * @param r.items_per_memorandum problems per memorandum
   */
  instruction_intro: (r: { memorandum_first: boolean; items_per_memorandum: number }) => string;
  /** Second page: how to answer the processing task. */
  instruction_processing: (r: ProcessingInstructionArgs) => string;
  /** Third page: how to recall. */
  instruction_recall: (r: RecallInstructionArgs) => string;
  /** Emphasis sentences, by `speed_accuracy_emphasis`. `emphasis_accuracy` takes the criterion as a whole percent. */
  emphasis_speed: string;
  emphasis_accuracy: (r: { criterion_percent: number }) => string;
  emphasis_both: string;
  /** Added when `processing_read_aloud` is set. */
  read_aloud: string;
  /** Page before the interactive walkthrough. */
  instruction_demo_intro: string;
  /** Page before the static examples (`instruction_demonstration: "examples"`). */
  instruction_examples_intro: string;
  /** Explanation shown under a walkthrough step (a step of "interactive", or an example). */
  instruction_step: (r: InstructionStepArgs) => string;
  /** Hint after a wrong response in a walkthrough step; the step then repeats. Same parameters as `instruction_step`. */
  instruction_hint: (r: InstructionStepArgs) => string;
  /** Shown after the last allowed attempt: the answer, then the walkthrough moves on. */
  instruction_reveal: (r: InstructionStepArgs) => string;
  /** Brief confirmation after a correct walkthrough response. */
  instruction_correct: string;
  /** Shown before the letters-only practice. */
  practice_storage_intro: string;
  /** Shown before the processing-only practice. */
  practice_processing_intro: string;
  /** Shown before the combined practice. */
  practice_combined_intro: string;
  /** Shown before the test. */
  instruction_test_intro: string;
  /**
   * Shown when the practice criterion was missed and practice repeats.
   * @param r.accuracy processing accuracy over the criterion window (0-1)
   * @param r.criterion the required accuracy (0-1)
   */
  practice_repeat: (r: { accuracy: number; criterion: number }) => string;
  /** Shown when the practice criterion was missed with `on_fail: "end"`; the experiment ends. */
  practice_failed: string;

  // -- buttons and labels --
  continue_button: string;
  ok_button: string;
  done_button: string;
  /** Button to say the problem is solved (mouse, touch). */
  solved_button: string;
  true_button: string;
  false_button: string;
  blank_button: string;
  skip_button: string;
  clear_button: string;

  // -- processing screens --
  /** Prompt under the problem in the two-screen format. @param r.solved_label key cap or button label */
  solve_prompt: (r: { device: "keyboard" | "mouse" | "touch"; solved_label: string }) => string;
  /** Prompt under the proposed answer. */
  verify_prompt: (r: {
    device: "keyboard" | "mouse" | "touch";
    true_label: string;
    false_label: string;
  }) => string;

  // -- recall screens --
  /** Prompt above the recall input. */
  recall_prompt: (r: {
    format: "n_afc" | "free_text" | "single_response";
    order: "serial" | "free";
    set_size: number;
  }) => string;
  /** @param r.position 1-based position of the box */
  recall_box_label: (r: { position: number }) => string;

  // -- trial feedback --
  correct_feedback: string;
  incorrect_feedback: string;
  timeout_feedback: string;
  /**
   * After a recall.
   * @param r.n_correct memoranda recalled in the right position (or recalled, with free order)
   * @param r.set_size memoranda in the trial
   * @param r.math_errors processing errors in this trial (wrong or too slow), or null when the trial has no processing (letters-only practice)
   * @param r.math_accuracy running processing accuracy so far (0-1), or null
   */
  recall_feedback: (r: {
    n_correct: number;
    set_size: number;
    math_errors: number | null;
    math_accuracy: number | null;
  }) => string;
  /** @param r.items the presented memoranda in order */
  feedback_correct_answer: (r: { items: string[] }) => string;

  // -- completion --
  task_complete: string;
  /**
   * Score report (`end_of_task_feedback: "score"` or `"summary"`).
   * @param r.partial_score memoranda recalled in the correct position, summed over test trials
   * @param r.total_items memoranda presented in all test trials
   * @param r.processing_accuracy proportion of processing problems solved correctly in time, or null
   * @param r.summary true for `"summary"`
   * @param r.absolute_score summed set sizes of perfectly recalled trials
   * @param r.perfect_trials number of perfectly recalled trials
   * @param r.n_trials number of test trials
   */
  result_summary: (r: {
    partial_score: number;
    total_items: number;
    processing_accuracy: number | null;
    summary: boolean;
    absolute_score: number;
    perfect_trials: number;
    n_trials: number;
  }) => string;
}

const pct = (x: number | null) => (x === null ? "-" : `${Math.round(x * 100)}%`);

export const defaultText: TextConfig = {
  instruction_intro: ({ memorandum_first, items_per_memorandum }) => `<h2>Operation Span</h2>
    <p>This task has two parts that you do at the same time: solving math problems and remembering letters.</p>
    <p>You will see a ${
      items_per_memorandum > 1 ? "series of problems" : "math problem"
    } and a letter${
    memorandum_first ? ", starting with the letter" : ", starting with the problem"
  }, over and over. Remember the letters in the order they appear. After a few of each, you will be asked to recall the letters.</p>`,
  instruction_processing: (r) => {
    const answer =
      r.device === "keyboard"
        ? `Press ${r.true_label} if the answer shown is correct, or ${r.false_label} if it is wrong.`
        : `Click <strong>${r.true_label}</strong> if the answer shown is correct, or <strong>${r.false_label}</strong> if it is wrong.`;
    const limit = r.timed ? " There is a time limit, so work quickly." : "";
    if (r.display_format === "equation_with_answer_single_screen") {
      return `<p>Each math problem is shown with a proposed answer, for example <strong>(2 × 3) + 1 = 7</strong>. ${answer}${limit}</p>`;
    }
    const solved =
      r.device === "keyboard"
        ? `press ${r.solved_label}`
        : `click <strong>${r.solved_label}</strong>`;
    return `<p>Each math problem is shown first on its own, for example <strong>(2 × 3) + 1 = ?</strong>. Solve it in your head, then ${solved}.${limit}</p>
      <p>Then a number is shown, for example <strong>7</strong>. ${answer}</p>`;
  },
  instruction_recall: (r) => {
    const blank =
      r.omission === "blank_button" || r.omission === "skip_button"
        ? ` If you can't remember a letter, click <strong>${r.blank_label}</strong> to leave its place empty.`
        : r.omission === "question_mark_key"
        ? " If you can't remember one, press <kbd>?</kbd> to leave its place empty."
        : " Fill every place, guessing if you have to.";
    const order = r.order === "serial" ? "in the order they were shown" : "in any order";
    if (r.format === "n_afc") {
      return `<p>After the last letter, a grid of letters appears. Click the letters you saw, ${order}.${blank}</p>`;
    }
    if (r.format === "free_text") {
      return `<p>After the last letter, a row of boxes appears. Type the letters you saw, one per box, ${order}.${blank}</p>`;
    }
    return `<p>After the last letter, press the keys of the letters you saw, one at a time, ${order}.${blank}</p>`;
  },
  emphasis_speed: "<p>Answer the math problems as quickly as you can.</p>",
  emphasis_accuracy: ({ criterion_percent }) =>
    `<p>It is important that you work as quickly and accurately as you can on the math problems. Keep your math accuracy at ${criterion_percent}% or higher. You will see your accuracy during the task.</p>`,
  emphasis_both:
    "<p>Work quickly and accurately on both parts: the math problems and the letters.</p>",
  read_aloud: "<p>Read each math problem out loud as you solve it.</p>",
  instruction_demo_intro: `<p>Now let's try each part, one step at a time. A wrong answer repeats the step with a hint.</p>`,
  instruction_examples_intro: `<p>Here is what each part looks like.</p>`,
  instruction_step: (r) => {
    if (r.step === "recall") {
      return `<p>Remember these ${r.items.length} letters in order, then recall them.</p>`;
    }
    const truth = r.step === "processing_true" ? "is correct" : "is wrong";
    const how =
      r.device === "keyboard"
        ? `Press ${r.step === "processing_true" ? r.true_label : r.false_label}`
        : `Click <strong>${r.step === "processing_true" ? r.true_label : r.false_label}</strong>`;
    return `<p>Check the problem. The answer shown ${truth}. ${how}.</p>`;
  },
  instruction_hint: (r) =>
    r.step === "recall"
      ? `<p>Not quite. Try again: remember the letters in the order they were shown.</p>`
      : `<p>Not quite. Work out the problem, then decide: if the number shown is the answer, it is ${r.true_label}; if not, ${r.false_label}.</p>`,
  instruction_reveal: (r) =>
    r.step === "recall"
      ? `<p>The letters were <strong>${r.items.join(" ")}</strong>, in that order. Let's go on.</p>`
      : `<p>The correct answer here was ${r.correct_label}. Let's go on.</p>`,
  instruction_correct: "Correct!",
  practice_storage_intro: `<p>Next, a short practice in three parts: letters alone, math alone, then both together, as in the real task.</p><p>Part 1: you will see a few letters. Recall them in order.</p>`,
  practice_processing_intro: `<p>Part 2: the math problems alone, at your own pace. Your speed here sets your time limit later.</p>`,
  practice_combined_intro: `<p>Part 3: both together, as in the real task.</p>`,
  instruction_test_intro: `<p>That's the end of practice. The real task is the same, with more letters to remember each time. Remember to keep solving the math problems accurately.</p>`,
  practice_repeat: ({ accuracy, criterion }) =>
    `<p>Your math accuracy was ${pct(accuracy)}; you need ${pct(
      criterion
    )}. Let's practice the math problems again.</p>`,
  practice_failed: `<p>Thank you. The task ends here.</p>`,

  continue_button: "Continue",
  ok_button: "OK",
  done_button: "Done",
  solved_button: "Solved",
  true_button: "True",
  false_button: "False",
  blank_button: "Blank",
  skip_button: "Skip",
  clear_button: "Clear",

  solve_prompt: ({ device, solved_label }) =>
    device === "keyboard"
      ? `<p>Solve it, then press ${solved_label}.</p>`
      : `<p>Solve it, then click <strong>${solved_label}</strong>.</p>`,
  verify_prompt: ({ device, true_label, false_label }) =>
    device === "keyboard"
      ? `<p>Is this the answer? ${true_label} = true, ${false_label} = false.</p>`
      : `<p>Is this the answer?</p>`,

  recall_prompt: ({ format, order, set_size }) =>
    format === "n_afc"
      ? `Select the ${set_size} letters${order === "serial" ? " in the order shown" : ""}`
      : format === "free_text"
      ? `Type the ${set_size} letters${order === "serial" ? " in the order shown" : ""}`
      : `Press the keys of the ${set_size} letters${
          order === "serial" ? " in the order shown" : ""
        }`,
  recall_box_label: ({ position }) => `Item ${position}`,

  correct_feedback: "Correct",
  incorrect_feedback: "Incorrect",
  timeout_feedback: "Too slow",
  recall_feedback: ({ n_correct, set_size, math_errors, math_accuracy }) =>
    `<p>You recalled <strong>${n_correct}</strong> of ${set_size} correctly.</p>` +
    (math_errors === null
      ? ""
      : `<p>You made ${math_errors} math error${math_errors === 1 ? "" : "s"} on this trial.${
          math_accuracy === null ? "" : ` Math accuracy so far: ${pct(math_accuracy)}.`
        }</p>`),
  feedback_correct_answer: ({ items }) => `<p>The letters were: ${items.join(" ")}</p>`,

  task_complete: "Task complete",
  result_summary: (r) =>
    `<p>Your score: ${r.partial_score} of ${r.total_items} recalled in the correct position.${
      r.processing_accuracy === null ? "" : ` Math accuracy: ${pct(r.processing_accuracy)}.`
    }</p>` +
    (r.summary
      ? `<p>${r.perfect_trials} of ${r.n_trials} trials recalled perfectly (absolute score ${r.absolute_score}).</p>`
      : ""),
};
