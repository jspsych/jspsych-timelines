import type { StateId } from "./options";
import type { ShipId } from "./schedule";

/** The words the instructions use for the parts of the task, which depend on `instruction_framing`. */
export interface FramingWords {
  /** a first-stage option, singular and plural (a spaceship) */
  first: string;
  first_plural: string;
  /** a second-stage option (an alien) */
  second: string;
  second_plural: string;
  /** a second-stage state (a planet) */
  state: string;
  state_plural: string;
  /** how a first-stage option is named in a sentence, by option (`A`, `B`) */
  first_name: Record<ShipId, string>;
  /** how a state is named in a sentence, by colour */
  state_name: Record<StateId, string>;
}

/** What the walkthrough steps say about a step. */
export interface StepArgs {
  words: FramingWords;
  /** the side to choose, and the key for it ("left arrow", "F") */
  side: "left" | "right";
  key: string;
}

/**
 * Text for the two-step task. To translate, pass a partial object with the same keys as `text`.
 * Functions that interpolate runtime values take named parameters; see each doc comment.
 */
export interface TextConfig {
  /**
   * Words for the parts of the task, by `instruction_framing` (`abstract_symbols`, `spaceship_planet_alien`). A
   * translation returns the words for both.
   * @param r.framing the cover story
   */
  framing_words: (r: { framing: "abstract_symbols" | "spaceship_planet_alien" }) => FramingWords;

  // -- instruction pages --
  /** First page: what the task is. */
  instruction_intro: (r: { words: FramingWords }) => string;
  /**
   * Second page: how to respond.
   * @param r.left_key  name of the key for the left option ("left arrow", "F")
   * @param r.right_key name of the key for the right option
   * @param r.window_seconds time allowed for each choice in seconds, or null for no limit
   * @param r.repeat_missed true when a missed trial is run again (`missed_response_handling: "repeat_trial"`), false when it is skipped
   * @param r.sides_vary false when the options keep their sides (`option_side_assignment: "fixed"`)
   */
  instruction_response: (r: {
    words: FramingWords;
    left_key: string;
    right_key: string;
    window_seconds: number | null;
    repeat_missed: boolean;
    sides_vary: boolean;
  }) => string;
  /**
   * Page on the transition structure (`contingency_disclosure: "partial"` or `"full"`).
   * @param r.common_percent chance, in percent, of the usual transition
   * @param r.mapping true when the page also says which state each first-stage option usually leads to (`full`)
   */
  instruction_transitions: (r: {
    words: FramingWords;
    common_percent: number;
    mapping: boolean;
  }) => string;
  /** Page on the reward chances changing slowly (`partial` or `full`). */
  instruction_drift: (r: { words: FramingWords }) => string;
  /** Page before the interactive walkthrough. */
  instruction_demo_intro: (r: { words: FramingWords }) => string;
  /**
   * Shown before practice: what changes, and that the main task follows.
   * @param r.timed true when each choice has a time limit
   * @param r.sides_vary false when the options keep their sides
   */
  instruction_practice_intro: (r: {
    words: FramingWords;
    timed: boolean;
    sides_vary: boolean;
  }) => string;
  /** Shown before the main task, after practice (or after the instructions when there is no practice). */
  instruction_test_intro: string;

  // -- walkthrough steps (each has a prompt, a hint after a wrong answer, and the answer after the last attempt) --
  /** Choosing a first-stage option. */
  step_first: (r: StepArgs) => string;
  step_first_hint: (r: StepArgs) => string;
  step_first_reveal: (r: StepArgs) => string;
  /** Choosing a second-stage option, on the state the first choice led to. */
  step_second: (r: StepArgs & { state_name: string }) => string;
  step_second_hint: (r: StepArgs & { state_name: string }) => string;
  step_second_reveal: (r: StepArgs & { state_name: string }) => string;
  /** The outcome of the scripted choice. */
  step_outcome: (r: { words: FramingWords }) => string;
  /**
   * Check of the structure (`full`): where a first-stage option usually leads. The two states are shown, one on
   * each side. The prompt does not say which side is right.
   * @param r.first_name how the option is named ("the rocket")
   * @param r.left_key, r.right_key names of the two keys
   */
  check_mapping: (r: {
    words: FramingWords;
    first_name: string;
    left_key: string;
    right_key: string;
  }) => string;
  /** After a wrong answer: the answer is on `side`, chosen with `key`; `state_name` is the state it usually leads to. */
  check_mapping_hint: (r: StepArgs & { first_name: string; state_name: string }) => string;
  /** After the last allowed attempt. */
  check_mapping_reveal: (r: StepArgs & { first_name: string; state_name: string }) => string;
  /** Check of the structure (`partial`) and of the reward chances: two sentences are shown, one on each side; choose the true one. */
  check_statement: (r: { words: FramingWords; left_key: string; right_key: string }) => string;
  check_statement_hint: (r: { words: FramingWords; side: "left" | "right"; key: string }) => string;
  check_statement_reveal: (r: {
    words: FramingWords;
    side: "left" | "right";
    key: string;
  }) => string;
  /** The true and the false statement about the transitions. */
  statement_transitions_true: (r: { words: FramingWords }) => string;
  statement_transitions_false: (r: { words: FramingWords }) => string;
  /** The true and the false statement about the reward chances. */
  statement_drift_true: (r: { words: FramingWords }) => string;
  statement_drift_false: (r: { words: FramingWords }) => string;
  /** Brief confirmation after a correct walkthrough answer. */
  instruction_correct: string;

  // -- buttons --
  continue_button: string;

  // -- trials --
  fixation: string;
  too_slow: string;
  /** Under the outcome. */
  outcome_coin: string;
  outcome_none: string;
  /** @param r.total coins earned so far */
  running_total: (r: { total: number }) => string;

  // -- breaks, questionnaire, end --
  /** @param r.block block just finished, r.n_blocks number of blocks */
  block_complete: (r: { block: number; n_blocks: number }) => string;
  questionnaire_intro: string;
  /**
   * The questionnaire question, with the two states shown one on each side.
   * @param r.first_name the option ("the rocket"), r.words the framing words, r.left_key and r.right_key the key names
   */
  questionnaire_question: (r: {
    words: FramingWords;
    first_name: string;
    left_key: string;
    right_key: string;
  }) => string;
  task_complete: string;
  /** @param r.coins coins earned in the main task, r.n_trials trials, r.n_missed missed trials */
  result_summary: (r: { coins: number; n_trials: number; n_missed: number }) => string;
}

const abstract: FramingWords = {
  first: "symbol",
  first_plural: "symbols",
  second: "symbol",
  second_plural: "symbols",
  state: "screen",
  state_plural: "screens",
  first_name: { A: "the ring", B: "the cross" },
  state_name: { red: "the red screen", blue: "the blue screen" },
};

const spaceship: FramingWords = {
  first: "spaceship",
  first_plural: "spaceships",
  second: "alien",
  second_plural: "aliens",
  state: "planet",
  state_plural: "planets",
  first_name: { A: "the rocket", B: "the flying saucer" },
  state_name: { red: "the red planet", blue: "the blue planet" },
};

const sideOf = (s: "left" | "right") => s;

export const defaultText: TextConfig = {
  framing_words: ({ framing }) => (framing === "abstract_symbols" ? abstract : spaceship),

  instruction_intro: ({ words: w }) =>
    `<p>In this task you collect coins. Every trial has two steps. In the first step you choose one of two ${w.first_plural}. It takes you to one of two ${w.state_plural}, a red one or a blue one. There you choose one of two ${w.second_plural}, and the ${w.second} you choose may give you a coin.</p><p>Collect as many coins as you can.</p>`,
  instruction_response: ({
    words: w,
    left_key,
    right_key,
    window_seconds,
    repeat_missed,
    sides_vary,
  }) =>
    `<p>Press <kbd>${left_key}</kbd> to choose the ${
      w.first
    } on the left, and <kbd>${right_key}</kbd> to choose the one on the right. You use the same two keys for the ${
      w.second_plural
    }.${
      sides_vary
        ? ` The two options are not always on the same side, so look before you choose.`
        : ""
    }</p>${
      window_seconds === null
        ? ""
        : `<p>You have ${window_seconds} ${
            window_seconds === 1 ? "second" : "seconds"
          } for each choice. If you are too slow, ${
            repeat_missed ? "you get the same trial again" : "the trial is skipped"
          }.</p>`
    }`,
  instruction_transitions: ({ words: w, common_percent, mapping }) =>
    `<p>Each ${w.first} usually takes you to the same ${
      w.state
    }: about ${common_percent} times out of 100. The rest of the time it takes you to the other ${
      w.state
    }.</p>${
      mapping
        ? `<p>${cap(w.first_name.A)} usually takes you to ${w.state_name.red}. ${cap(
            w.first_name.B
          )} usually takes you to ${w.state_name.blue}.</p>`
        : `<p>You will have to find out which ${w.state} each ${w.first} usually takes you to.</p>`
    }`,
  instruction_drift: ({ words: w }) =>
    `<p>How likely the ${w.second_plural} are to give a coin changes slowly during the task. One that is good now may get worse later, and one that is poor now may get better. Keep an eye on which ones give coins.</p>`,
  instruction_demo_intro: ({ words: w }) =>
    `<p>Let's try one trial. You will choose a ${w.first}, see where it takes you, and then choose one of two ${w.second_plural}. This trial is for learning the keys, so which one you choose does not matter.</p>`,
  instruction_practice_intro: ({ timed, sides_vary }) =>
    `<p>Now you will practice. The trials run at the pace of the real task${
      timed ? `: you have a limited time for each choice` : ""
    }${
      sides_vary
        ? `${
            timed ? ", and" : ": "
          } the two options of each choice change places from trial to trial`
        : ""
    }. The coins you get in practice are not counted.</p><p>When practice is over, the main task starts.</p>`,
  instruction_test_intro: `<p>Practice is over. Now the main task starts. Collect as many coins as you can.</p>`,

  step_first: ({ words: w, side, key }) =>
    `Choose the ${w.first} on the ${sideOf(side)}: press <kbd>${key}</kbd>.`,
  step_first_hint: ({ words: w, side, key }) =>
    `That was the other one. Choose the ${w.first} on the ${side}: press <kbd>${key}</kbd>.`,
  step_first_reveal: ({ words: w, side, key }) =>
    `Press <kbd>${key}</kbd> to choose the ${w.first} on the ${side}.`,
  step_second: ({ words: w, side, key, state_name }) =>
    `The ${w.first} took you to ${state_name}. Choose the ${w.second} on the ${side}: press <kbd>${key}</kbd>.`,
  step_second_hint: ({ words: w, side, key }) =>
    `That was the other one. Choose the ${w.second} on the ${side}: press <kbd>${key}</kbd>.`,
  step_second_reveal: ({ words: w, side, key }) =>
    `Press <kbd>${key}</kbd> to choose the ${w.second} on the ${side}.`,
  step_outcome: ({ words: w }) => `This ${w.second} gave you a coin. Not every choice does.`,

  check_mapping: ({ words: w, first_name, left_key, right_key }) =>
    `Which ${w.state} does ${first_name} usually take you to? Press <kbd>${left_key}</kbd> for the one on the left, or <kbd>${right_key}</kbd> for the one on the right.`,
  check_mapping_hint: ({ first_name, state_name, side, key }) =>
    `Not quite: ${first_name} usually takes you to ${state_name}. It is on the ${side}: press <kbd>${key}</kbd>.`,
  check_mapping_reveal: ({ first_name, state_name }) =>
    `${cap(first_name)} usually takes you to ${state_name}.`,
  check_statement: ({ left_key, right_key }) =>
    `Which sentence is true? Press <kbd>${left_key}</kbd> for the one on the left, or <kbd>${right_key}</kbd> for the one on the right.`,
  check_statement_hint: ({ side, key }) =>
    `Not quite. The true sentence is on the ${side}: press <kbd>${key}</kbd>.`,
  check_statement_reveal: ({ side }) => `The true sentence is the one on the ${side}.`,
  statement_transitions_true: ({ words: w }) =>
    `A ${w.first} usually takes you to the same ${w.state}, but not always.`,
  statement_transitions_false: ({ words: w }) =>
    `A ${w.first} takes you to either ${w.state} equally often.`,
  statement_drift_true: ({ words: w }) =>
    `How likely the ${w.second_plural} are to give a coin changes slowly.`,
  statement_drift_false: ({ words: w }) =>
    `How likely the ${w.second_plural} are to give a coin never changes.`,
  instruction_correct: "Correct!",

  continue_button: "Continue",

  fixation: "+",
  too_slow: "Too slow",
  outcome_coin: "You got a coin",
  outcome_none: "No coin",
  running_total: ({ total }) => `Coins: ${total}`,

  block_complete: ({ block, n_blocks }) =>
    `<p>You have finished block ${block} of ${n_blocks}. Take a short break if you like.</p>`,
  questionnaire_intro: `<p>One last question about the task.</p>`,
  questionnaire_question: ({ words: w, first_name, left_key, right_key }) =>
    `Which ${w.state} did ${first_name} take you to most of the time? Press <kbd>${left_key}</kbd> for the one on the left, or <kbd>${right_key}</kbd> for the one on the right.`,
  task_complete: "Task complete",
  result_summary: ({ coins, n_trials, n_missed }) =>
    `<p>You collected ${coins} coins in ${n_trials} trials${
      n_missed > 0 ? ` (${n_missed} ${n_missed === 1 ? "trial was" : "trials were"} missed)` : ""
    }.</p>`,
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
