export interface InstructionStepArgs {
  condition: "congruent" | "incongruent" | "neutral" | "nogo";
  device: "keyboard" | "mouse" | "touch";
  target: string;
  response: string;
}

/**
 * Text for the flanker task. To translate, pass a partial object with the same keys as `text`.
 * Functions that interpolate runtime values take named parameters; see each doc comment.
 */
export interface TextConfig {
  // -- instruction pages --
  /** First instruction page when the target is an arrow. */
  instruction_intro_arrows: string;
  /** First instruction page when the target is a letter. */
  instruction_intro_letters: string;
  /**
   * Second instruction page: how to respond.
   * @param r.device        "keyboard" | "mouse" | "touch"
   * @param r.left_response  label of the left response (key name or button label)
   * @param r.right_response label of the right response
   * @param r.left_target    HTML of the target(s) that belong to the left response (an arrow or letters)
   * @param r.right_target   HTML of the target(s) that belong to the right response
   */
  instruction_response: (r: {
    device: "keyboard" | "mouse" | "touch";
    left_response: string;
    right_response: string;
    left_target: string;
    right_target: string;
  }) => string;
  /** Page before the interactive walkthrough (`instruction_demonstration: "interactive"`). */
  instruction_demo_intro: string;
  /** Page before the static examples (`instruction_demonstration: "examples"`). */
  instruction_examples_intro: string;
  /**
   * Explanation shown under a walkthrough stimulus (a step of "interactive", or an example).
   * @param r.condition "congruent" | "incongruent" | "neutral" | "nogo"
   * @param r.device    "keyboard" | "mouse" | "touch"
   * @param r.target    HTML of the target(s) of the correct response (empty for "nogo")
   * @param r.response  label of the correct response: key or button (empty for "nogo")
   */
  instruction_step: (r: InstructionStepArgs) => string;
  /** Hint after a wrong response in a walkthrough step; the step then repeats. Same parameters as `instruction_step`. */
  instruction_hint: (r: InstructionStepArgs) => string;
  /** Shown after the last allowed attempt: the answer, then the walkthrough moves on. */
  instruction_reveal: (r: InstructionStepArgs) => string;
  /** Brief confirmation after a correct walkthrough response. */
  instruction_correct: string;
  /** Sentence about the hand(s) used, by `response_hand`. */
  hand_two_hands_index_fingers: string;
  hand_one_hand_dominant: string;
  /** Emphasis sentences, by `speed_accuracy_emphasis`. */
  emphasis_speed: string;
  emphasis_accuracy: string;
  emphasis_both: string;
  /** Shown before practice. */
  instruction_practice_intro: string;
  /** Shown before the test, after practice (or after the instructions when practice_trials is 0). */
  instruction_test_intro: string;

  // -- buttons --
  left_button: string;
  right_button: string;
  continue_button: string;
  ok_button: string;

  // -- trial feedback --
  correct_feedback: string;
  incorrect_feedback: string;
  timeout_feedback: string;
  /** @param r.rt reaction time in ms */
  feedback_rt: (r: { rt: number }) => string;
  /** @param r.answer label of the correct response */
  feedback_correct_answer: (r: { answer: string }) => string;

  // -- fixation --
  fixation: string;

  // -- breaks and block feedback --
  /** @param blockNumber the block that just ended */
  block_complete: (blockNumber: number) => string;
  /**
   * @param r.block      block just finished
   * @param r.n_blocks   total blocks
   * @param r.accuracy   proportion correct in the block (0-1)
   * @param r.mean_rt    mean correct RT in ms, or null
   * @param r.kind       "accuracy" | "rt" | "accuracy_rt" | "progress"
   */
  block_feedback: (r: {
    block: number;
    n_blocks: number;
    accuracy: number;
    mean_rt: number | null;
    kind: "accuracy" | "rt" | "accuracy_rt" | "progress";
  }) => string;

  // -- checks --
  /** @param r.response_label label of the response to give */
  attention_check_prompt: (r: { response_label: string }) => string;
  device_not_supported: string;

  // -- completion --
  task_complete: string;
  /**
   * @param r.accuracy         overall test accuracy (0-1), or null
   * @param r.mean_rt          mean correct RT in ms, or null
   * @param r.flanker_effect_rt incongruent minus congruent mean correct RT in ms, or null
   */
  result_summary: (r: {
    accuracy: number | null;
    mean_rt: number | null;
    flanker_effect_rt: number | null;
  }) => string;
}

export const defaultText: TextConfig = {
  instruction_intro_arrows: `<h2>Flanker Task</h2>
    <p>On each trial you will see a row of arrows.</p>
    <p>Your job is to identify the direction of the <strong>CENTER</strong> arrow and ignore the others.</p>`,
  instruction_intro_letters: `<h2>Flanker Task</h2>
    <p>On each trial you will see a row of letters.</p>
    <p>Your job is to identify the <strong>CENTER</strong> letter and ignore the others.</p>`,
  instruction_response: (r) =>
    r.device === "keyboard"
      ? `<h2>How to Respond</h2>
    <p>Center ${r.left_target}: press <strong>${r.left_response}</strong>.</p>
    <p>Center ${r.right_target}: press <strong>${r.right_response}</strong>.</p>`
      : `<h2>How to Respond</h2>
    <p>Center ${r.left_target}: ${r.device === "touch" ? "tap" : "click"} <strong>${
          r.left_response
        }</strong>.</p>
    <p>Center ${r.right_target}: ${r.device === "touch" ? "tap" : "click"} <strong>${
          r.right_response
        }</strong>.</p>`,
  instruction_demo_intro: `<h2>Let's Try It</h2>
    <p>Here are a few examples of what you will see. Respond to each one as you would in the task.</p>
    <p>There is no time limit here. If you respond incorrectly, you will get a hint and try again.</p>`,
  instruction_examples_intro: `<h2>Examples</h2>
    <p>Here are a few examples of what you will see, with the correct response for each.</p>`,
  instruction_step: (r) => {
    const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
    switch (r.condition) {
      case "congruent":
        return `<p>The items on the sides are the same as the center one. The center is ${r.target}, so ${act} <strong>${r.response}</strong>.</p>`;
      case "neutral":
        return `<p>The items on the sides are different from the center one, but they give no hint. The center is ${r.target}, so ${act} <strong>${r.response}</strong>.</p>`;
      case "incongruent":
        return `<p>The items on the sides are different from the center one. Ignore them. The center is ${r.target}, so ${act} <strong>${r.response}</strong>.</p>`;
      case "nogo":
        return `<p>The center item is a cross. When you see a cross, do <strong>not</strong> respond. Just wait.</p>`;
    }
  },
  instruction_hint: (r) => {
    const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
    switch (r.condition) {
      case "incongruent":
        return `<p>That is the response for the items on the sides. Respond to the <strong>center</strong> one: it is ${r.target}, so ${act} <strong>${r.response}</strong>.</p><p>Let's try again.</p>`;
      case "nogo":
        return `<p>A cross means do <strong>not</strong> respond. Wait until it disappears.</p><p>Let's try again.</p>`;
      default:
        return `<p>Not quite. Look at the <strong>center</strong> item: it is ${r.target}, so ${act} <strong>${r.response}</strong>.</p><p>Let's try again.</p>`;
    }
  },
  instruction_reveal: (r) => {
    const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
    return r.condition === "nogo"
      ? `<p>With a cross, do not respond at all. Let's move on.</p>`
      : `<p>For this one, ${act} <strong>${r.response}</strong>. Let's move on.</p>`;
  },
  instruction_correct: "Correct!",
  hand_two_hands_index_fingers: "Use the index finger of each hand, one for each response.",
  hand_one_hand_dominant: "Use your dominant hand for both responses.",
  emphasis_speed: "Respond as quickly as you can.",
  emphasis_accuracy: "Try to be as accurate as you can.",
  emphasis_both: "Respond as quickly and as accurately as you can.",
  instruction_practice_intro: `<h2>Practice</h2><p>First, a few practice trials.</p>`,
  instruction_test_intro: `<h2>Main Task</h2><p>Now the main task begins.</p>`,

  left_button: "Left",
  right_button: "Right",
  continue_button: "Continue",
  ok_button: "OK",

  correct_feedback: "Correct",
  incorrect_feedback: "Incorrect",
  timeout_feedback: "Too slow!",
  feedback_rt: (r) => `${Math.round(r.rt)} ms`,
  feedback_correct_answer: (r) => `Correct answer: ${r.answer}`,

  fixation: "+",

  block_complete: (blockNumber) => `Block ${blockNumber} complete. Take a short break if needed.`,
  block_feedback: (r) => {
    const parts: string[] = [`Block ${r.block} of ${r.n_blocks} complete.`];
    if (r.kind === "accuracy" || r.kind === "accuracy_rt") {
      parts.push(`Accuracy: ${Math.round(r.accuracy * 100)}%`);
    }
    if ((r.kind === "rt" || r.kind === "accuracy_rt") && r.mean_rt !== null) {
      parts.push(`Mean response time: ${Math.round(r.mean_rt)} ms`);
    }
    return parts.map((p) => `<p>${p}</p>`).join("");
  },

  attention_check_prompt: (r) =>
    `<p>Attention check: please respond with <strong>${r.response_label}</strong>.</p>`,
  device_not_supported:
    "This task needs a laptop or desktop computer. Please return on a computer.",

  task_complete: "Task Complete",
  result_summary: (r) => {
    let html = "";
    if (r.accuracy !== null)
      html += `<p><strong>Accuracy:</strong> ${(r.accuracy * 100).toFixed(1)}%</p>`;
    if (r.flanker_effect_rt !== null) {
      html += `<p><strong>Flanker effect (RT):</strong> ${r.flanker_effect_rt.toFixed(0)} ms</p>`;
    }
    if (r.mean_rt !== null)
      html += `<p><strong>Mean response time:</strong> ${r.mean_rt.toFixed(0)} ms</p>`;
    return html;
  },
};
