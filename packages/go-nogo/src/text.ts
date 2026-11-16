import type { StimulusShape } from "./options";

export interface InstructionStepArgs {
  /** "go" | "nogo" */
  condition: "go" | "nogo";
  device: "keyboard" | "mouse" | "touch";
  /** HTML of the stimulus of this step is drawn above; its name, e.g. "blue square". */
  stimulus_name: string;
  /** label of the go response: key name or button label */
  response: string;
}

/**
 * Text for the go/no-go task. To translate, pass a partial object with the same keys as `text`.
 * Functions that interpolate runtime values take named parameters; see each doc comment.
 */
export interface TextConfig {
  // -- instruction pages --
  /**
   * First instruction page.
   * @param r.go_stimuli    HTML of the go stimuli, drawn small
   * @param r.nogo_stimuli  HTML of the no-go stimuli, drawn small
   * @param r.go_names      names of the go stimuli ("blue square"), joined with "or"
   * @param r.nogo_names    names of the no-go stimuli
   */
  instruction_intro: (r: {
    go_stimuli: string;
    nogo_stimuli: string;
    go_names: string;
    nogo_names: string;
  }) => string;
  /**
   * Second instruction page: how to respond.
   * @param r.device    "keyboard" | "mouse" | "touch"
   * @param r.response  label of the response: key name or button label
   */
  instruction_response: (r: { device: "keyboard" | "mouse" | "touch"; response: string }) => string;
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
  /** Emphasis sentences, by `speed_accuracy_emphasis`. */
  emphasis_speed: string;
  emphasis_accuracy: string;
  emphasis_both: string;
  /**
   * Reminder under the stimulus (`rule_reminder: "on_screen"`).
   * @param r.go_names    names of the go stimuli
   * @param r.nogo_names  names of the no-go stimuli
   * @param r.response    label of the response
   * @param r.device      "keyboard" | "mouse" | "touch"
   */
  rule_reminder: (r: {
    go_names: string;
    nogo_names: string;
    response: string;
    device: "keyboard" | "mouse" | "touch";
  }) => string;
  /** Shown before practice. */
  instruction_practice_intro: string;
  /** Shown before the test, after practice (or after the instructions when practice_trials is 0). */
  instruction_test_intro: string;
  /** Shown before a go-only baseline block (`single_task_blocks`). */
  instruction_baseline_intro: string;

  // -- shapes, joined lists --
  /** Names of the shapes, used with a colour to name a stimulus ("blue square"). */
  shape_names: Record<StimulusShape, string>;
  /** Joins several names: "blue square or green circle". */
  list_or: string;
  /**
   * Name of a stimulus made of a colour and a shape.
   * @param r.color  the colour as given in the stimulus
   * @param r.shape  the translated shape name
   */
  stimulus_name: (r: { color: string; shape: string }) => string;

  // -- buttons --
  /** Label of the response button for the mouse and touch devices. */
  go_button: string;
  continue_button: string;

  // -- trial feedback --
  correct_feedback: string;
  /** Wrong response: a response to a no-go stimulus. */
  incorrect_feedback: string;
  /** No response to a go stimulus. */
  timeout_feedback: string;
  /** @param r.rt reaction time in ms */
  feedback_rt: (r: { rt: number }) => string;
  /** Shown after a response to a no-go stimulus under `trial_feedback: "correct_answer"`. */
  feedback_correct_nogo: string;
  /** @param r.response label of the response to a go stimulus */
  feedback_correct_go: (r: { response: string }) => string;

  // -- screens --
  fixation: string;
  /** Shown during `pre_block_countdown_ms`. @param r.phase "practice" | "test"  @param r.block block number */
  countdown: (r: { phase: "practice" | "test"; block: number }) => string;
  /**
   * @param r.block      block just finished
   * @param r.n_blocks   total blocks
   * @param r.accuracy   proportion correct in the block (0-1), or null
   * @param r.mean_rt    mean correct go RT in ms, or null
   * @param r.kind       "accuracy" | "rt" | "accuracy_rt" | "progress"
   */
  block_feedback: (r: {
    block: number;
    n_blocks: number;
    accuracy: number | null;
    mean_rt: number | null;
    kind: "accuracy" | "rt" | "accuracy_rt" | "progress";
  }) => string;

  // -- completion --
  task_complete: string;
  /**
   * @param r.commission_error_rate  proportion of no-go trials with a response, or null
   * @param r.omission_error_rate    proportion of go trials without a response, or null
   * @param r.mean_correct_go_rt     mean RT of correct go responses in ms, or null
   */
  result_summary: (r: {
    commission_error_rate: number | null;
    omission_error_rate: number | null;
    mean_correct_go_rt: number | null;
  }) => string;
}

const act = (device: "keyboard" | "mouse" | "touch") =>
  device === "keyboard" ? "press" : device === "touch" ? "tap" : "click";

export const defaultText: TextConfig = {
  instruction_intro: (r) => `<h2>Go/No-go Task</h2>
    <p>On each trial one shape will appear on the screen.</p>
    <p>When you see ${r.go_stimuli} (${r.go_names}), <strong>respond</strong>.</p>
    <p>When you see ${r.nogo_stimuli} (${r.nogo_names}), <strong>do not respond</strong>.</p>`,
  instruction_response: (r) =>
    `<h2>How to Respond</h2><p>To respond, ${act(r.device)} <strong>${r.response}</strong>.</p>
    <p>If you should not respond, simply wait until the next shape.</p>`,
  instruction_demo_intro: `<h2>Let's Try It</h2>
    <p>Here are the shapes you will see. Respond to each one as you would in the task.</p>
    <p>There is no time limit when you should respond. If you respond incorrectly, you will get a hint and try again.</p>`,
  instruction_examples_intro: `<h2>Examples</h2>
    <p>Here are the shapes you will see, with the correct response for each.</p>`,
  instruction_step: (r) =>
    r.condition === "go"
      ? `<p>This is a ${r.stimulus_name}. Respond: ${act(r.device)} <strong>${
          r.response
        }</strong>.</p>`
      : `<p>This is a ${r.stimulus_name}. Do <strong>not</strong> respond. Just wait.</p>`,
  instruction_hint: (r) =>
    r.condition === "go"
      ? `<p>Not quite. A ${r.stimulus_name} means respond: ${act(r.device)} <strong>${
          r.response
        }</strong>.</p><p>Let's try again.</p>`
      : `<p>A ${r.stimulus_name} means do <strong>not</strong> respond. Wait until it disappears.</p><p>Let's try again.</p>`,
  instruction_reveal: (r) =>
    r.condition === "go"
      ? `<p>For a ${r.stimulus_name}, ${act(r.device)} <strong>${
          r.response
        }</strong>. Let's move on.</p>`
      : `<p>With a ${r.stimulus_name}, do not respond at all. Let's move on.</p>`,
  instruction_correct: "Correct!",
  emphasis_speed: "Respond as quickly as you can.",
  emphasis_accuracy: "Try to be as accurate as you can.",
  emphasis_both: "Respond as quickly and as accurately as you can.",
  rule_reminder: (r) =>
    `${act(r.device) === "press" ? "Press" : act(r.device) === "tap" ? "Tap" : "Click"} ${
      r.response
    } for ${r.go_names}. Do not respond to ${r.nogo_names}.`,
  instruction_practice_intro: `<h2>Practice</h2><p>First, a few practice trials.</p>`,
  instruction_test_intro: `<h2>Main Task</h2><p>Now the main task begins.</p>`,
  instruction_baseline_intro: `<h2>Go-only Block</h2><p>In this block every shape is a go shape: respond to each one.</p>`,

  shape_names: {
    square: "square",
    circle: "circle",
    triangle: "triangle",
    diamond: "diamond",
    cross: "cross",
  },
  list_or: "or",
  stimulus_name: (r) => `${r.color} ${r.shape}`,

  go_button: "Respond",
  continue_button: "Continue",

  correct_feedback: "Correct",
  incorrect_feedback: "Incorrect",
  timeout_feedback: "Too slow!",
  feedback_rt: (r) => `${Math.round(r.rt)} ms`,
  feedback_correct_nogo: "Do not respond to this one",
  feedback_correct_go: (r) => `Respond with ${r.response}`,

  fixation: "+",
  countdown: () => "Get ready...",
  block_feedback: (r) => {
    const parts: string[] = [`Block ${r.block} of ${r.n_blocks} complete.`];
    if ((r.kind === "accuracy" || r.kind === "accuracy_rt") && r.accuracy !== null) {
      parts.push(`Accuracy: ${Math.round(r.accuracy * 100)}%`);
    }
    if ((r.kind === "rt" || r.kind === "accuracy_rt") && r.mean_rt !== null) {
      parts.push(`Mean response time: ${Math.round(r.mean_rt)} ms`);
    }
    return parts.map((p) => `<p>${p}</p>`).join("");
  },

  task_complete: "Task Complete",
  result_summary: (r) => {
    let html = "";
    if (r.commission_error_rate !== null)
      html += `<p><strong>Responses to no-go shapes:</strong> ${(
        r.commission_error_rate * 100
      ).toFixed(1)}%</p>`;
    if (r.omission_error_rate !== null)
      html += `<p><strong>Missed go shapes:</strong> ${(r.omission_error_rate * 100).toFixed(
        1
      )}%</p>`;
    if (r.mean_correct_go_rt !== null)
      html += `<p><strong>Mean response time:</strong> ${r.mean_correct_go_rt.toFixed(0)} ms</p>`;
    return html;
  },
};
