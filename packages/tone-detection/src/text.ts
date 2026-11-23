/**
 * Arguments of the walkthrough texts. The caption of a step says what is heard as configured: with a masker, noise
 * with a tone in one interval; in quiet, silence with a tone in one interval.
 */
export interface WalkthroughArgs {
  /** number of intervals in a trial: 2 or 3 */
  n_intervals: number;
  /** the interval that holds the tone, 1-based */
  target_interval: number;
  /** whether a masker plays (the other intervals are then noise only, otherwise silent) */
  masker: boolean;
  /** the response that names an interval: HTML (a key cap, or the button label) for interval `i`, 1-based */
  response_for: (interval: number) => string;
  device: "keyboard" | "mouse" | "touch";
  /** "just_detectable" | "comfortable" is not needed here; frequency of the tone in Hz */
  frequency_hz: number;
}

/**
 * Text for the tone detection task. To translate, pass a partial object with the same keys as `text`.
 * Functions that interpolate runtime values take named parameters; see each doc comment.
 */
export interface TextConfig {
  // -- instruction pages --
  /**
   * First instruction page.
   * @param r.n_intervals number of intervals in a trial (2 or 3)
   * @param r.masker      whether a noise masker plays
   */
  instruction_intro: (r: { n_intervals: number; masker: boolean }) => string;
  /** Page about the listening environment (`environment_instructions: "quiet_room"`). */
  instruction_environment: string;
  /**
   * How to respond.
   * @param r.device      "keyboard" | "mouse" | "touch"
   * @param r.n_intervals number of intervals
   * @param r.responses   HTML labels of the responses for intervals 1..n (key caps or button labels)
   */
  instruction_response: (r: {
    device: "keyboard" | "mouse" | "touch";
    n_intervals: number;
    responses: string[];
  }) => string;
  /** Advice page: what to do when the tone cannot be heard. */
  instruction_guess: string;
  /** Page before the interactive walkthrough. */
  instruction_demo_intro: string;
  /** Page before the listening examples (`instruction_demonstration: "examples"`). */
  instruction_examples_intro: string;
  /** Caption of the listening example: where the tone is. */
  instruction_listen: (r: WalkthroughArgs) => string;
  /** Caption of a walkthrough step: what to listen for and how to answer. */
  instruction_step: (r: WalkthroughArgs) => string;
  /** Hint after a wrong response in a walkthrough step; the step then plays again. */
  instruction_hint: (r: WalkthroughArgs) => string;
  /** Shown after the last allowed attempt: the answer, then the walkthrough moves on. */
  instruction_reveal: (r: WalkthroughArgs) => string;
  /** Brief confirmation after a correct walkthrough response. */
  instruction_correct: string;
  /** Page before practice: what changes. */
  instruction_practice_intro: string;
  /** Page before the main task. */
  instruction_test_intro: (r: { n_tracks: number }) => string;
  /** Shown after practice that missed `practice_criterion`, before it repeats. */
  practice_repeat: string;
  /** Shown after practice that missed `practice_criterion` with `on_fail: "end"`. */
  practice_ended: string;

  // -- hearing question (`participant_eligibility: "hearing"`) --
  hearing_question: string;
  hearing_no_difficulty: string;
  hearing_some_difficulty: string;

  // -- volume setting (`volume_calibration: "participant_adjusted"`) --
  /**
   * The page that plays the calibration sound.
   * @param r.target  "just_detectable" (set the volume until the sound is only just audible) | "comfortable"
   * @param r.sound   "noise" | "tone": what plays
   */
  calibration_page: (r: {
    target: "just_detectable" | "comfortable";
    sound: "noise" | "tone";
  }) => string;
  calibration_play: string;
  calibration_stop: string;
  calibration_done: string;

  // -- headphone screen (`headphone_check: "screening_task"`) --
  headphone_intro: string;
  /** @param r.n_trials number of screening trials */
  headphone_instructions: (r: { n_trials: number }) => string;
  /** Under the stage while the three tones play. */
  headphone_listen: string;
  /** Under the stage when the answer is asked. */
  headphone_question: (r: {
    responses: string[];
    device: "keyboard" | "mouse" | "touch";
  }) => string;
  headphone_done: string;

  // -- trial text --
  /** Under the stage while the sounds play. */
  listen: string;
  /** Under the stage when the answer is asked. */
  response_prompt: (r: {
    device: "keyboard" | "mouse" | "touch";
    n_intervals: number;
    responses: string[];
  }) => string;
  /** @param r.interval 1-based number shown in the marker of that interval */
  interval_label: (r: { interval: number }) => string;
  /** `progress_indicator: "counter"`. `of` is the planned number of trials, or null when the track ends by another rule. */
  progress: (r: { trial: number; of: number | null }) => string;

  // -- buttons --
  continue_button: string;
  /** Replay button of a listening example. */
  replay_button: string;

  // -- trial feedback --
  correct_feedback: string;
  incorrect_feedback: string;

  // -- between tracks and at the end --
  /** @param r.track track just finished (1-based) @param r.n_tracks total tracks */
  track_complete: (r: { track: number; n_tracks: number }) => string;
  task_complete: string;
  /**
   * @param r.threshold   threshold of the single condition in its level unit, or null when there are several conditions or no reversals
   * @param r.level_unit  "dB SNR" | "dB FS"
   * @param r.n_trials    test trials
   * @param r.accuracy    proportion correct over the test trials (0-1), or null
   */
  result_summary: (r: {
    threshold: number | null;
    level_unit: string;
    n_trials: number;
    accuracy: number | null;
  }) => string;
}

const act = (device: "keyboard" | "mouse" | "touch") =>
  device === "keyboard" ? "press" : device === "touch" ? "tap" : "click";

const list = (items: string[]) =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;

const heard = (r: WalkthroughArgs) =>
  r.masker
    ? `You will hear noise in every interval, and a short beep of ${r.frequency_hz} Hz in one of them.`
    : `The intervals are silent, except one that has a short beep of ${r.frequency_hz} Hz.`;

export const defaultText: TextConfig = {
  instruction_intro: (r) => `<h2>Tone Detection</h2>
    <p>This task measures the quietest sound you can hear. You will listen through headphones.</p>
    <p>On each trial you hear ${r.n_intervals} intervals one after another, marked 1 to ${
    r.n_intervals
  } on the screen. ${
    r.masker
      ? "Each interval is filled with a noise like a hiss. One of them also contains a short beep."
      : "One of them contains a short beep; the others are silent."
  } Your job is to say which interval contained the beep.</p>`,
  instruction_environment: `<h2>Before You Start</h2>
    <p>Use <strong>headphones</strong> and sit in a <strong>quiet place</strong>. Turn off anything that could make a sound, such as notifications.</p>
    <p>Do not change the volume once you have set it in the next steps.</p>`,
  instruction_response: (r) => `<h2>How to Respond</h2>
    <p>After the last interval, ${act(
      r.device
    )} the number of the interval that contained the beep: ${list(
    r.responses.map((x) => `<strong>${x}</strong>`)
  )}.</p>
    <p>You can only answer after all ${r.n_intervals} intervals have played.</p>`,
  instruction_guess: `<h2>When You Are Not Sure</h2>
    <p>The beep gets quieter as you do well, so many trials will be hard. When you cannot hear it, <strong>guess</strong>: always give an answer.</p>`,
  instruction_demo_intro: `<h2>Let's Listen</h2>
    <p>First you will hear some examples where the beep is easy to hear. Answer each one as you would in the task.</p>
    <p>If you answer wrongly, you will get a hint and hear the example again.</p>`,
  instruction_examples_intro: `<h2>Examples</h2>
    <p>First you will hear an example where the beep is easy to hear. You can play it as often as you like.</p>`,
  instruction_listen: (r) =>
    `<p>Listen: the beep is in <strong>interval ${r.target_interval}</strong>. ${heard(r)}</p>`,
  instruction_step: (r) =>
    `<p>${heard(r)} ${act(r.device)[0].toUpperCase()}${act(r.device).slice(
      1
    )} the number of the interval with the beep.</p>`,
  instruction_hint: (r) =>
    `<p>Not quite. The beep was in <strong>interval ${r.target_interval}</strong>: ${act(
      r.device
    )} ${r.response_for(r.target_interval)}.</p><p>Listen again.</p>`,
  instruction_reveal: (r) =>
    `<p>For this one the beep was in interval ${r.target_interval}: ${act(
      r.device
    )} ${r.response_for(r.target_interval)}. Let's move on.</p>`,
  instruction_correct: "Correct!",
  instruction_practice_intro: `<h2>Practice</h2>
    <p>Now some practice. From here the trials run at the pace of the real task, and the beeps are quieter than in the examples.</p>
    <p>You will be told whether each answer is correct. The main task starts after the practice.</p>`,
  instruction_test_intro: (r) => `<h2>Main Task</h2>
    <p>Now the main task begins. You will do ${r.n_tracks} ${
    r.n_tracks === 1 ? "run" : "runs"
  }. The beep gets quieter as you answer correctly and louder when you make a mistake, and there is no feedback.</p>`,
  practice_repeat: `<h2>Practice Again</h2><p>Let's practice once more. Listen for the beep in each trial.</p>`,
  practice_ended: `<h2>Practice Not Passed</h2><p>The task ends here. Thank you.</p>`,

  hearing_question: `<h2>Your Hearing</h2><p>Do you have any known difficulty with your hearing?</p>`,
  hearing_no_difficulty: "No",
  hearing_some_difficulty: "Yes",

  calibration_page: (r) =>
    `<h2>Set the Volume</h2>
    <p>${r.sound === "noise" ? "A soft noise is playing." : "A soft beep is playing."} ${
      r.target === "just_detectable"
        ? "Adjust the volume of your device until you can <strong>just</strong> hear it: as quiet as you can make it while still hearing it."
        : "Adjust the volume of your device until it is <strong>comfortable</strong>."
    }</p>
    <p>Then press Continue. Do not change the volume afterwards.</p>`,
  calibration_play: "Play sound",
  calibration_stop: "Stop sound",
  calibration_done: "Continue",

  headphone_intro: `<h2>Headphone Check</h2>`,
  headphone_instructions: (r) =>
    `<p>This checks that you are wearing headphones. You will hear three tones, ${r.n_trials} times. Each time, say which tone was the <strong>quietest</strong>.</p>`,
  headphone_listen: "Listen to the three tones.",
  headphone_question: (r) =>
    `Which tone was the quietest? ${act(r.device)[0].toUpperCase()}${act(r.device).slice(1)} ${list(
      r.responses
    )}.`,
  headphone_done: `<h2>Headphone Check Done</h2><p>Thank you. Keep your headphones on for the rest of the task.</p>`,

  listen: "Listen.",
  response_prompt: (r) =>
    `Which interval contained the beep? ${act(r.device)[0].toUpperCase()}${act(r.device).slice(
      1
    )} ${list(r.responses)}.`,
  interval_label: (r) => String(r.interval),
  progress: (r) => (r.of === null ? `Trial ${r.trial}` : `Progress: ${r.trial}/${r.of}`),

  continue_button: "Continue",
  replay_button: "Listen again",

  correct_feedback: "Correct",
  incorrect_feedback: "Wrong",

  track_complete: (r) => `Run ${r.track} of ${r.n_tracks} complete. Take a short break if needed.`,
  task_complete: "Task Complete",
  result_summary: (r) => {
    let html = "";
    if (r.threshold !== null)
      html += `<p><strong>Threshold:</strong> ${r.threshold.toFixed(1)} ${r.level_unit}</p>`;
    if (r.accuracy !== null)
      html += `<p><strong>Correct:</strong> ${(r.accuracy * 100).toFixed(0)}% of ${
        r.n_trials
      } trials</p>`;
    return html;
  },
};
