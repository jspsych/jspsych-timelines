/**
 * Translatable text (PACKAGE-STANDARD §6). Strings that depend on the configuration are functions of the
 * resolved options (`TaskFacts`), so instructions never describe the default design when the task is
 * configured differently. Key names and amounts arrive ready-made: keys as `<kbd>` markup, amounts through
 * the `amount` function below, which is where a currency symbol or number format is translated.
 */

export type EffortTask = "easy" | "hard";

/** What the resolved options say, for the text functions. Strings marked HTML are ready-made markup. */
export interface TaskFacts {
  outcome_type: "money" | "points";
  /** presses required, per task */
  easy_presses: number;
  hard_presses: number;
  /** time allowed to complete the presses, in seconds (may be fractional) */
  easy_seconds: number;
  hard_seconds: number;
  /** HTML: the key pressed during the effort phase */
  easy_effort_key: string;
  hard_effort_key: string;
  /** the same key presses both tasks */
  same_effort_key: boolean;
  /** which finger presses, from `finger_instruction` ("with the index finger of your dominant hand") */
  easy_finger: string;
  hard_finger: string;
  /** HTML: the choice keys */
  easy_choice_key: string;
  hard_choice_key: string;
  /** the easy reward, formatted with `amount` */
  easy_reward: string;
  /** the hard reward as formatted text: one amount, a range ("$1.24 to $4.30") or a list */
  hard_reward: string;
  /** the hard reward differs from trial to trial */
  hard_reward_varies: boolean;
  /** win probabilities as percentages, ascending: ["12%", "50%", "88%"] */
  probabilities: string[];
  /** false when every trial pays (`reward_probability: [1]`) and no probability is shown */
  probability_shown: boolean;
  /** choice window in seconds, null if untimed */
  choice_seconds: number | null;
  task_end_rule: "fixed_time" | "fixed_trial_count";
  session_minutes: number | null;
  n_trials: number | null;
  payout_rule: "two_random_win_trials_paid" | "percent_of_total_5" | "percent_of_total_10" | string;
  /** the tasks assigned on the first practice trials, in order */
  practice_forced_tasks: EffortTask[];
  practice_trials: number;
  /** the progress shown while pressing: bar, counter or nothing */
  progress_indicator: "none" | "counter" | "progress_bar";
}

export interface ResultSummary {
  n_trials: number;
  n_hard_chosen: number;
  n_valid_choices: number;
  proportion_hard: number | null;
  n_completed: number;
  n_wins: number;
  /** earnings under the payout rule, formatted with `amount` */
  payout: string;
  payout_rule: string;
}

export interface TextConfig {
  // -- buttons and fixed marks --
  continue_button: string;
  ok_button: string;
  fixation: string;

  // -- amounts (the currency and the number format are translatable text) --
  /**
   * An amount of the reward. Default: dollars with two decimals for money ("$1.24"), the number and the word
   * for points ("100 points").
   * @param a.value the amount
   * @param a.outcome_type "money" or "points"
   */
  amount: (a: { value: number; outcome_type: "money" | "points" }) => string;
  /**
   * How a key is named to the participant: letters in capitals, named keys in words.
   * @param key the key as jsPsych names it (event.key)
   */
  key_name: (key: string) => string;

  // -- choice, ready, effort and feedback screens --
  /** @param a.task "easy" or "hard" */
  task_title: (a: { task: EffortTask }) => string;
  /** @param a.probability the chance that the trial pays, as a proportion */
  win_probability: (a: { probability: number }) => string;
  /**
   * @param a.presses presses required
   * @param a.seconds time allowed, in seconds
   */
  effort_requirement: (a: { presses: number; seconds: number }) => string;
  /** @param a.key the choice key (HTML) */
  choice_key_label: (a: { key: string }) => string;
  /** The reward line on a choice card. @param a.amount the formatted amount */
  reward_line: (a: { amount: string }) => string;
  /** The ready screen. @param a.task the task that follows */
  ready_text: (a: { task: EffortTask }) => string;
  /** Under the effort bar. @param a.key the effort key (HTML) @param a.finger the finger text @param a.task the task */
  effort_prompt: (a: { key: string; finger: string; task: EffortTask }) => string;
  /** Instead of the bar, with `progress_indicator: "counter"`. */
  effort_counter: (a: { count: number; required: number }) => string;
  /**
   * Which finger presses. Finger assignment is an instruction, not an option: translate or replace this to
   * describe your design (S008 used the dominant little finger for the hard task, S007 the non-dominant one).
   * @param a.task "easy" or "hard"
   */
  finger_instruction: (a: { task: EffortTask }) => string;
  /** Shown with the ready and effort screens when the task was assigned. @param a.task the assigned task @param a.reason why */
  assigned_notice: (a: { task: EffortTask; reason: "timeout" | "practice" }) => string;
  feedback_completed: string;
  feedback_not_completed: string;
  /** @param a.amount the formatted reward */
  reward_win: (a: { amount: string }) => string;
  reward_no_win: string;
  reward_not_completed: string;

  // -- instructions (one idea per page) --
  instruction_intro: (f: TaskFacts) => string;
  instruction_tasks: (f: TaskFacts) => string;
  instruction_rewards: (f: TaskFacts) => string;
  instruction_chance: (f: TaskFacts) => string;
  instruction_choice: (f: TaskFacts) => string;
  instruction_session_length: (f: TaskFacts) => string;
  instruction_payout: (f: TaskFacts) => string;
  instruction_demo_intro: (f: TaskFacts) => string;
  instruction_practice_intro: (f: TaskFacts) => string;
  instruction_test_intro: (f: TaskFacts) => string;

  // -- walkthrough --
  demo_choose: (a: { wanted: EffortTask; wanted_key: string }) => string;
  demo_choose_hint: (a: { wanted: EffortTask; wanted_key: string }) => string;
  demo_choose_reveal: (a: { wanted: EffortTask; wanted_key: string }) => string;
  demo_effort: (f: TaskFacts) => string;
  demo_effort_hint: (f: TaskFacts) => string;
  demo_effort_reveal: (f: TaskFacts) => string;
  instruction_correct: string;

  // -- device and completion --
  device_not_supported: string;
  task_complete: string;
  result_summary: (r: ResultSummary) => string;
}

const NAMED_KEYS: Record<string, string> = {
  " ": "space",
  ArrowLeft: "left arrow",
  ArrowRight: "right arrow",
  ArrowUp: "up arrow",
  ArrowDown: "down arrow",
  Enter: "Enter",
};

const joinList = (xs: string[]) =>
  xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
const secs = (s: number) =>
  `${Number.isInteger(s) ? s : s.toFixed(1)} ${plural(s, "second", "seconds")}`;
const presses = (n: number) => `${n} ${plural(n, "press", "presses")}`;

export const defaultText: TextConfig = {
  continue_button: "Continue",
  ok_button: "OK",
  fixation: "+",

  amount: ({ value, outcome_type }) =>
    outcome_type === "points"
      ? `${Number.isInteger(value) ? value : value.toFixed(2)} ${value === 1 ? "point" : "points"}`
      : `$${value.toFixed(2)}`,
  key_name: (key) => NAMED_KEYS[key] ?? (key.length === 1 ? key.toUpperCase() : key),

  task_title: ({ task }) => (task === "easy" ? "Easy task" : "Hard task"),
  win_probability: ({ probability }) => `${Math.round(probability * 100)}% chance of winning`,
  effort_requirement: ({ presses: n, seconds }) => `${presses(n)} in ${secs(seconds)}`,
  choice_key_label: ({ key }) => `Press ${key}`,
  reward_line: ({ amount }) => `Reward: ${amount}`,
  ready_text: ({ task }) => (task === "easy" ? "Get ready: easy task" : "Get ready: hard task"),
  effort_prompt: ({ key, finger }) => `Press ${key} as fast as you can, ${finger}.`,
  effort_counter: ({ count, required }) => `${count} / ${required}`,
  finger_instruction: ({ task }) =>
    task === "easy"
      ? "with the index finger of your dominant hand"
      : "with the little finger of your non-dominant hand",
  assigned_notice: ({ task, reason }) =>
    reason === "timeout"
      ? `You did not choose in time, so the ${task} task was picked for you.`
      : `The ${task} task is assigned on this trial.`,
  feedback_completed: "Task completed",
  feedback_not_completed: "Task not completed",
  reward_win: ({ amount }) => `You win ${amount}`,
  reward_no_win: "No win on this trial",
  reward_not_completed: "No reward: the task was not completed",

  instruction_intro: (f) =>
    `<p>On every trial you choose between two tasks, an easy one and a hard one. Both are the same kind of task: press a key again and again, as fast as you can, to fill a bar. The easy task needs fewer presses than the hard task and pays less.</p>`,
  instruction_tasks: (f) =>
    f.same_effort_key
      ? `<p>Both tasks use the same key, ${f.easy_effort_key}.</p>` +
        `<p><strong>Easy task:</strong> ${presses(f.easy_presses)} in ${secs(f.easy_seconds)}, ${
          f.easy_finger
        }.</p>` +
        `<p><strong>Hard task:</strong> ${presses(f.hard_presses)} in ${secs(f.hard_seconds)}, ${
          f.hard_finger
        }.</p>`
      : `<p><strong>Easy task:</strong> press ${f.easy_effort_key} ${
          f.easy_presses
        } times in ${secs(f.easy_seconds)}, ${f.easy_finger}.</p>` +
        `<p><strong>Hard task:</strong> press ${f.hard_effort_key} ${
          f.hard_presses
        } times in ${secs(f.hard_seconds)}, ${f.hard_finger}.</p>`,
  instruction_rewards: (f) =>
    `<p>Completing a task can win a reward. The easy task is worth ${f.easy_reward}. ` +
    (f.hard_reward_varies
      ? `The hard task is worth more, and its value changes from trial to trial: ${f.hard_reward}.</p>`
      : `The hard task is worth ${f.hard_reward}.</p>`),
  instruction_chance: (f) =>
    f.probability_shown
      ? `<p>Winning is not certain. Before you choose, you are told the chance that the trial pays out (${joinList(
          f.probabilities
        )}). The chance is the same for both tasks. You win only if you complete the task <em>and</em> the trial turns out to be a winning trial.</p>`
      : `<p>You win the reward whenever you complete the task.</p>`,
  instruction_choice: (f) =>
    `<p>Choose the easy task by pressing ${f.easy_choice_key} and the hard task by pressing ${f.hard_choice_key}.` +
    (f.choice_seconds === null
      ? ` Take your time to choose.</p>`
      : ` You have ${secs(
          f.choice_seconds
        )} to choose. If you do not choose in time, the computer picks a task at random for that trial.</p>`),
  instruction_session_length: (f) =>
    f.task_end_rule === "fixed_time"
      ? `<p>The task lasts ${f.session_minutes} ${plural(
          f.session_minutes ?? 0,
          "minute",
          "minutes"
        )} in total. The hard task takes longer than the easy task, so choosing it means fewer trials in that time. The task ends when the time is up.</p>`
      : `<p>There are ${f.n_trials} trials in all.</p>`,
  instruction_payout: (f) =>
    f.payout_rule === "percent_of_total_5"
      ? `<p>At the end you receive 5% of the total you won.</p>`
      : f.payout_rule === "percent_of_total_10"
      ? `<p>At the end you receive 10% of the total you won.</p>`
      : `<p>At the end, two of the trials you won are picked at random, and you receive the rewards of those two trials.</p>`,
  instruction_demo_intro: () =>
    `<p>Next you try the parts of a trial, one at a time: choosing, and then the easy task. Nothing here is rewarded.</p>`,
  instruction_practice_intro: (f) =>
    `<p>Now you practise. From here on, trials run at the real pace of the task: a fixation mark, the choice` +
    (f.choice_seconds === null ? `` : ` (${secs(f.choice_seconds)} to choose)`) +
    `, a ready screen, and then the pressing.</p>` +
    (f.practice_forced_tasks.length > 0
      ? `<p>On the first ${plural(
          f.practice_forced_tasks.length,
          "practice trial",
          `${f.practice_forced_tasks.length} practice trials`
        )} the task is assigned to you (${joinList(
          f.practice_forced_tasks
        )}), so you feel both. After that you choose.</p>`
      : ``) +
    `<p>Practice rewards are not paid. The main task starts after the ${
      f.practice_trials
    } practice ${plural(f.practice_trials, "trial", "trials")}.</p>`,
  instruction_test_intro: (f) =>
    `<p>The practice is over. Now the main task begins. ` +
    (f.task_end_rule === "fixed_time"
      ? `It runs for ${f.session_minutes} ${plural(f.session_minutes ?? 0, "minute", "minutes")}.`
      : `There are ${f.n_trials} trials.`) +
    ` Rewards now count.</p>`,

  demo_choose: ({ wanted, wanted_key }) =>
    `Choose the <strong>${wanted}</strong> task: press ${wanted_key}.` +
    (wanted === "hard" ? ` You will not have to do it now.` : ``),
  demo_choose_hint: ({ wanted, wanted_key }) =>
    `That chose the ${
      wanted === "easy" ? "hard" : "easy"
    } task. This time press ${wanted_key} to choose the <strong>${wanted}</strong> task.`,
  demo_choose_reveal: ({ wanted, wanted_key }) =>
    `The ${wanted} task is chosen with ${wanted_key}. On to the next step.`,
  demo_effort: (f) =>
    `Try the easy task: press ${f.easy_effort_key} ${f.easy_presses} times in ${secs(
      f.easy_seconds
    )}, ${f.easy_finger}.`,
  demo_effort_hint: (f) =>
    `The bar did not fill in time. Press ${f.easy_effort_key} faster: ${presses(
      f.easy_presses
    )} in ${secs(f.easy_seconds)}.`,
  demo_effort_reveal: () => `That is fine. You will practise the tasks next.`,
  instruction_correct: "Good!",

  device_not_supported:
    "This task needs a physical keyboard for rapid key pressing. Please open it on a computer.",
  task_complete: "Task complete",
  result_summary: (r) =>
    `<p>You completed ${r.n_completed} of ${r.n_trials} trials and won on ${r.n_wins}.</p>` +
    (r.proportion_hard !== null
      ? `<p>You chose the hard task on ${Math.round(
          r.proportion_hard * 100
        )}% of the trials you chose (${r.n_hard_chosen} of ${r.n_valid_choices}).</p>`
      : ``) +
    `<p>${
      r.payout_rule === "percent_of_total_5"
        ? "5% of your total"
        : r.payout_rule === "percent_of_total_10"
        ? "10% of your total"
        : "Two winning trials picked at random"
    }: ${r.payout}.</p>`,
};
