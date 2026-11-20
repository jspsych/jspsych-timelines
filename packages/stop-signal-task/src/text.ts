export type StopSignalForm = "arrow_turns_red" | "circle_turns_red" | "border" | "tone";

export interface InstructionStepArgs {
  /** "go" | "stop" */
  condition: "go" | "stop";
  device: "keyboard" | "mouse" | "touch";
  /** HTML naming the correct response for a go step (key cap or button label); empty for "stop" */
  response: string;
  signal: StopSignalForm;
}

export interface StrategyArgs {
  signal: StopSignalForm;
}

/**
 * Text for the stop-signal task. To translate, pass a partial object with the same keys as `text`.
 * Functions that interpolate runtime values take named parameters; see each doc comment.
 */
export interface TextConfig {
  // -- instruction pages --
  /** First instruction page. */
  instruction_intro: string;
  /**
   * Second instruction page: how to respond to the go arrow.
   * @param r.device         "keyboard" | "mouse" | "touch"
   * @param r.left_response  label of the response for a left arrow (key name or button label)
   * @param r.right_response label of the response for a right arrow
   * @param r.left_arrow     HTML of a left arrow
   * @param r.right_arrow    HTML of a right arrow
   */
  instruction_response: (r: {
    device: "keyboard" | "mouse" | "touch";
    left_response: string;
    right_response: string;
    left_arrow: string;
    right_arrow: string;
  }) => string;
  /**
   * Third instruction page: the stop signal.
   * @param r.signal "arrow_turns_red" | "circle_turns_red" | "border" | "tone"
   */
  instruction_stop: (r: { signal: StopSignalForm }) => string;
  /**
   * Strategy sentences, by `strategy_instruction`. "dont_wait" asks participants not to wait for the signal;
   * "dont_wait_plus_tracking_explanation" adds that the signal appears later when they stop well and earlier
   * when they do not; "balance_speed_and_stopping" asks for a balance.
   */
  strategy_dont_wait: string;
  /** @param r.target_accuracy the stopping rate the staircase aims for (0-1), e.g. 0.5 */
  strategy_tracking_explanation: (r: { target_accuracy: number }) => string;
  strategy_balance: string;
  /** Heading of the strategy page, which follows the stop-signal page when `strategy_instruction` is set. */
  strategy_heading: string;
  /** Page before the interactive walkthrough (`instruction_demonstration: "interactive"`). */
  instruction_demo_intro: string;
  /** Page before the static examples (`instruction_demonstration: "examples"`). */
  instruction_examples_intro: string;
  /** Explanation shown under a walkthrough stimulus (a step of "interactive", or an example). */
  instruction_step: (r: InstructionStepArgs) => string;
  /** Hint after a wrong response in a walkthrough step; the step then repeats. Same parameters as `instruction_step`. */
  instruction_hint: (r: InstructionStepArgs) => string;
  /** Shown after the last allowed attempt: the answer, then the walkthrough moves on. */
  instruction_reveal: (r: InstructionStepArgs) => string;
  /** Brief confirmation after a correct walkthrough response. */
  instruction_correct: string;
  /** Shown before practice. */
  instruction_practice_intro: string;
  /** Shown before the test, after practice (or after the instructions when practice_trials is 0). */
  instruction_test_intro: string;
  /** Shown after practice that missed `practice_criterion`, before it repeats. */
  practice_repeat: string;
  /** Shown after practice that missed `practice_criterion` with `on_fail: "end"`. */
  practice_ended: string;

  // -- buttons --
  left_button: string;
  right_button: string;
  continue_button: string;
  ok_button: string;

  // -- trial feedback --
  correct_feedback: string;
  incorrect_feedback: string;
  /** Go trial without a response. */
  timeout_feedback: string;
  /** Stop trial with a response: the participant should have held back. */
  stop_failed_feedback: string;
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
   * @param r.block          block just finished
   * @param r.n_blocks       total blocks
   * @param r.go_accuracy    proportion of go trials answered correctly (0-1), or null
   * @param r.mean_go_rt     mean go RT in ms, or null
   * @param r.stop_accuracy  proportion of stop trials without a response (0-1), or null when the block had none
   * @param r.kind           "accuracy" | "rt" | "accuracy_rt" | "progress"
   */
  block_feedback: (r: {
    block: number;
    n_blocks: number;
    go_accuracy: number | null;
    mean_go_rt: number | null;
    stop_accuracy: number | null;
    kind: "accuracy" | "rt" | "accuracy_rt" | "progress";
  }) => string;
  /** Added to block feedback when the participant stopped on more than 60 % of the stop trials (probably waiting for the signal). */
  tip_waiting: string;
  /** Added to block feedback when the participant stopped on fewer than 40 % of the stop trials. */
  tip_stop_more: string;

  // -- checks --
  device_not_supported: string;

  // -- completion --
  task_complete: string;
  /**
   * @param r.go_accuracy   proportion of go trials answered correctly (0-1), or null
   * @param r.mean_go_rt    mean go RT in ms, or null
   * @param r.stop_accuracy proportion of successful stops (0-1), or null
   */
  result_summary: (r: {
    go_accuracy: number | null;
    mean_go_rt: number | null;
    stop_accuracy: number | null;
  }) => string;
}

const signalSentence = (signal: StopSignalForm): string => {
  switch (signal) {
    case "arrow_turns_red":
      return 'the arrow turns <strong style="color:#e53935">red</strong>';
    case "circle_turns_red":
      return 'the circle around the arrow turns <strong style="color:#e53935">red</strong>';
    case "border":
      return 'a <strong style="color:#4d8dff">blue frame</strong> appears around the arrow';
    case "tone":
      return "you hear a <strong>beep</strong>";
  }
};

export const defaultText: TextConfig = {
  instruction_intro: `<h2>Stop-Signal Task</h2>
    <p>On each trial an arrow appears. It points to the left or to the right.</p>
    <p>Your main job is to respond to the direction of the arrow as quickly and accurately as you can.</p>`,
  instruction_response: (r) => {
    const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
    return `<h2>How to Respond</h2>
    <p>Arrow pointing left ${r.left_arrow}: ${act} <strong>${r.left_response}</strong>.</p>
    <p>Arrow pointing right ${r.right_arrow}: ${act} <strong>${r.right_response}</strong>.</p>`;
  },
  instruction_stop: (r) => `<h2>The Stop Signal</h2>
    <p>On some trials, shortly after the arrow appears, ${signalSentence(r.signal)}.</p>
    <p>When that happens, <strong>do not respond</strong>: try to stop yourself.</p>
    <p>You will not always be able to stop, and that is fine. The signal comes on a minority of trials.</p>`,
  strategy_dont_wait: `<p>Do <strong>not</strong> wait for the stop signal. Respond to the arrow as quickly as you can, and only try to stop when the signal appears.</p>`,
  strategy_tracking_explanation: (r) =>
    `<p>The signal appears later in the trial when you are good at stopping and earlier when you are not, so stopping is equally hard for everyone. You will succeed on about ${Math.round(
      r.target_accuracy * 100
    )}% of the stop trials.</p>`,
  strategy_balance: `<p>Both matter: respond quickly to the arrow, and try to stop when the signal appears.</p>`,
  strategy_heading: `<h2>Speed and Stopping</h2>`,
  instruction_demo_intro: `<h2>Let's Try It</h2>
    <p>Here are a few examples of what you will see. Respond to each one as you would in the task.</p>
    <p>There is no time limit for the arrows. If you respond incorrectly, you will get a hint and try again.</p>`,
  instruction_examples_intro: `<h2>Examples</h2>
    <p>Here are a few examples of what you will see, with the correct response for each.</p>`,
  instruction_step: (r) => {
    const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
    return r.condition === "go"
      ? `<p>Respond to the arrow: ${act} <strong>${r.response}</strong>.</p>`
      : `<p>Respond to the arrow, but watch for the signal: ${signalSentence(
          r.signal
        )}. When it appears, do <strong>not</strong> respond. Just wait.</p>`;
  },
  instruction_hint: (r) => {
    const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
    return r.condition === "go"
      ? `<p>Not quite. ${act[0].toUpperCase()}${act.slice(1)} <strong>${
          r.response
        }</strong> for this arrow.</p><p>Let's try again.</p>`
      : `<p>You responded after the signal appeared. When ${signalSentence(
          r.signal
        )}, do <strong>not</strong> respond.</p><p>Let's try again.</p>`;
  },
  instruction_reveal: (r) => {
    const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
    return r.condition === "go"
      ? `<p>For this one, ${act} <strong>${r.response}</strong>. Let's move on.</p>`
      : `<p>When the signal appears, do not respond at all. Let's move on.</p>`;
  },
  instruction_correct: "Correct!",
  instruction_practice_intro: `<h2>Practice</h2><p>Now some practice at the pace of the real task. The main task starts after the practice.</p>`,
  instruction_test_intro: `<h2>Main Task</h2><p>Now the main task begins.</p>`,
  practice_repeat: `<h2>Practice Again</h2><p>Let's practice once more. Respond to the arrows quickly and accurately.</p>`,
  practice_ended: `<h2>Practice Not Passed</h2><p>The task ends here. Thank you.</p>`,

  left_button: "Left",
  right_button: "Right",
  continue_button: "Continue",
  ok_button: "OK",

  correct_feedback: "Correct",
  incorrect_feedback: "Incorrect",
  timeout_feedback: "Too slow!",
  stop_failed_feedback: "You should not respond when the signal appears",
  feedback_rt: (r) => `${Math.round(r.rt)} ms`,
  feedback_correct_answer: (r) => `Correct answer: ${r.answer}`,

  fixation: "+",

  block_complete: (blockNumber) => `Block ${blockNumber} complete. Take a short break if needed.`,
  block_feedback: (r) => {
    const parts: string[] = [`Block ${r.block} of ${r.n_blocks} complete.`];
    if ((r.kind === "accuracy" || r.kind === "accuracy_rt") && r.go_accuracy !== null) {
      parts.push(`Arrow trials answered correctly: ${Math.round(r.go_accuracy * 100)}%`);
    }
    if ((r.kind === "accuracy" || r.kind === "accuracy_rt") && r.stop_accuracy !== null) {
      parts.push(`Successful stops: ${Math.round(r.stop_accuracy * 100)}%`);
    }
    if ((r.kind === "rt" || r.kind === "accuracy_rt") && r.mean_go_rt !== null) {
      parts.push(`Mean response time to arrows: ${Math.round(r.mean_go_rt)} ms`);
    }
    return parts.map((p) => `<p>${p}</p>`).join("");
  },
  tip_waiting:
    "Remember: do not wait for the stop signal. Respond to the arrow as fast as you can.",
  tip_stop_more: "Try harder to stop when the signal appears.",

  device_not_supported:
    "This task needs a laptop or desktop computer. Please return on a computer.",

  task_complete: "Task Complete",
  result_summary: (r) => {
    let html = "";
    if (r.go_accuracy !== null)
      html += `<p><strong>Arrow trials correct:</strong> ${(r.go_accuracy * 100).toFixed(1)}%</p>`;
    if (r.mean_go_rt !== null)
      html += `<p><strong>Mean response time to arrows:</strong> ${r.mean_go_rt.toFixed(0)} ms</p>`;
    if (r.stop_accuracy !== null)
      html += `<p><strong>Successful stops:</strong> ${(r.stop_accuracy * 100).toFixed(1)}%</p>`;
    return html;
  },
};
