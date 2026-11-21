import "./styles.css";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import type { JsPsych } from "jspsych";

import {
  INSTRUCTION_CORRECT_MS,
  INSTRUCTION_MAX_ATTEMPTS,
  MAX_SESSION_TRIALS,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import { Offer, OfferStream, rewardRange, round2 } from "./offers";
import {
  EefrtOptions,
  ResolvedOptions,
  Task,
  normaliseKey,
  resolveOptions,
  sampleDuration,
  validateOptions,
} from "./options";
import EffortPressPlugin from "./plugin";
import { hasForcedRt, simulateChoice } from "./simulation";
import { P, renderCenterText, renderChoice, renderFixation } from "./stimuli";
import { TaskFacts, TextConfig, defaultText } from "./text";

export type Phase = "practice" | "test";

/** Everything one trial needs, drawn when the trial starts and filled in as it goes. */
export interface TrialPlan {
  phase: Phase;
  o: ResolvedOptions;
  /** 1-based position in the phase */
  trial_index_in_block: number;
  offer: Offer;
  /** practice: the task assigned instead of a choice */
  forced_task: Task | null;
  fixation_ms: number;
  ready_ms: number;
  completion_ms: number;
  reward_ms: number;
  /** session clock at the start of the trial, ms */
  session_elapsed_ms: number;
  // -- filled in during the trial --
  choice: Task | "none";
  choice_rt: number | null;
  choice_forced: boolean;
  forced_by: "timeout" | "practice" | null;
  chosen_task: Task | null;
  press_count: number;
  completed: boolean;
  task_duration_ms: number;
  reward_won: number;
}

export interface Context {
  jsPsych: JsPsych;
  text: TextConfig;
  /** user options as given (for phase resolution) */
  user: EefrtOptions;
  practice: ResolvedOptions;
  test: ResolvedOptions;
  state: {
    plan: TrialPlan | null;
    stream: OfferStream | null;
    /** trials started in the running phase */
    n_trials: number;
    /** sum of the durations of the screens of finished test trials, ms */
    elapsed_ms: number;
    /** performance.now() at the start of the test, for the wall-clock side of the session clock */
    wall_start: number | null;
    last_reward: number;
  };
}

export function createContext(jsPsych: JsPsych, options: EefrtOptions = {}): Context {
  const text: TextConfig = { ...defaultText, ...options.text };
  const test = resolveOptions(options, "test");
  const practice = resolveOptions(options, "practice");
  validateOptions(test);
  validateOptions(practice);
  if (test.trial_order === "fixed_sequence" && "uniform" in test.reward_magnitude.hard) {
    throw new Error(
      'eefrt: trial_order "fixed_sequence" cannot be combined with a per-trial uniform hard reward (it would draw random numbers, so the sequence would differ between participants); use "shuffled_list" or "random".'
    );
  }
  return {
    jsPsych,
    text,
    user: options,
    practice,
    test,
    state: {
      plan: null,
      stream: null,
      n_trials: 0,
      elapsed_ms: 0,
      wall_start: null,
      last_reward: 0,
    },
  };
}

// -- helpers ------------------------------------------------------------------------------------

const baseData = (extra: Record<string, unknown>) => ({
  task: TASK_NAME,
  task_version: VERSION,
  ...extra,
});

const kbd = (ctx: Context, key: string) => `<kbd>${ctx.text.key_name(normaliseKey(key))}</kbd>`;
const effortKey = (o: ResolvedOptions, task: Task) => normaliseKey(o.response_key_mapping[task]);
const percent = (p: number) => `${Math.round(p * 100)}%`;
const seconds = (ms: number) => ms / 1000;

/** The facts about the resolved options that the text functions describe. */
export function taskFacts(ctx: Context, o: ResolvedOptions = ctx.test): TaskFacts {
  const amount = (value: number) => ctx.text.amount({ value, outcome_type: outcomeKind(o) });
  const range = rewardRange(o.reward_magnitude.hard);
  const probs = [...o.reward_probability].sort((a, b) => a - b);
  const sameKey = effortKey(o, "easy") === effortKey(o, "hard");
  return {
    outcome_type: outcomeKind(o),
    easy_presses: o.difficulty_levels.easy,
    hard_presses: o.difficulty_levels.hard,
    easy_seconds: seconds(o.response_window_ms.easy),
    hard_seconds: seconds(o.response_window_ms.hard),
    easy_effort_key: kbd(ctx, o.response_key_mapping.easy),
    hard_effort_key: kbd(ctx, o.response_key_mapping.hard),
    same_effort_key: sameKey,
    easy_finger: ctx.text.finger_instruction({ task: "easy" }),
    hard_finger: ctx.text.finger_instruction({ task: "hard" }),
    easy_choice_key: kbd(ctx, o.response_keys[0]),
    hard_choice_key: kbd(ctx, o.response_keys[1]),
    easy_reward: amount(o.reward_magnitude.easy),
    hard_reward:
      range.min === range.max ? amount(range.min) : `${amount(range.min)} to ${amount(range.max)}`,
    hard_reward_varies: range.min !== range.max,
    probabilities: probs.map(percent),
    probability_shown: !(probs.length === 1 && probs[0] === 1),
    choice_seconds:
      o.response_window_ms.choice === null ? null : seconds(o.response_window_ms.choice),
    task_end_rule: o.task_end_rule,
    session_minutes: o.session_duration_min,
    n_trials: o.task_end_rule === "fixed_trial_count" ? o.n_test_trials : null,
    payout_rule: o.payout_rule,
    practice_forced_tasks: [...o.practice_forced_tasks],
    practice_trials: o.practice_trials,
    progress_indicator: o.progress_indicator,
  };
}

function outcomeKind(o: ResolvedOptions): "money" | "points" {
  return o.outcome_type === "points" ? "points" : "money";
}

function sumMs(d: { completion: number; reward: number }) {
  return d.completion + d.reward;
}

// -- plans and the session clock -----------------------------------------------------------------

/** The clock of a `fixed_time` session, ms: planned and measured durations, and never behind the wall clock. */
export function sessionClock(ctx: Context): number {
  const wall = ctx.state.wall_start === null ? 0 : performance.now() - ctx.state.wall_start;
  return Math.max(ctx.state.elapsed_ms, wall);
}

/** Time the participant spent on the screens of a finished trial, ms. */
export function planDuration(p: TrialPlan): number {
  const choice = p.forced_task !== null ? 0 : p.choice_rt ?? p.o.response_window_ms.choice ?? 0;
  return (
    p.fixation_ms +
    choice +
    p.ready_ms +
    p.task_duration_ms +
    sumMs({ completion: p.completion_ms, reward: p.reward_ms })
  );
}

function newPlan(ctx: Context, phase: Phase): TrialPlan {
  const o = phase === "practice" ? ctx.practice : ctx.test;
  const s = ctx.state;
  s.n_trials += 1;
  const R = ctx.jsPsych;
  const forced = phase === "practice" ? o.practice_forced_tasks[s.n_trials - 1] ?? null : null;
  return {
    phase,
    o,
    trial_index_in_block: s.n_trials,
    offer: s.stream!.next(),
    forced_task: forced,
    fixation_ms: sampleDuration(R, o.fixation_duration_ms),
    ready_ms: sampleDuration(R, o.pre_block_countdown_ms),
    completion_ms: sampleDuration(R, o.feedback_duration_ms.completion),
    reward_ms: sampleDuration(R, o.feedback_duration_ms.reward),
    session_elapsed_ms: phase === "test" ? Math.round(sessionClock(ctx)) : 0,
    choice: "none",
    choice_rt: null,
    choice_forced: forced !== null,
    forced_by: forced !== null ? "practice" : null,
    chosen_task: forced,
    press_count: 0,
    completed: false,
    task_duration_ms: 0,
    reward_won: 0,
  };
}

const plan = (ctx: Context): TrialPlan => ctx.state.plan!;

// -- display (no-response) trials -----------------------------------------------------------------

interface DisplayArgs {
  phase: Phase | "instructions";
  part: string;
  stimulus: () => string;
  duration: () => number;
  data?: Record<string, unknown>;
  finish?: (d: any) => void;
}

/** No-response display trial: the keyboard plugin with `choices: "NO_KEYS"` and a duration (PACKAGE-STANDARD §10). */
export function createDisplayTrial(a: DisplayArgs) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: [TASK_CLASS],
    stimulus: a.stimulus as any,
    choices: "NO_KEYS" as const,
    trial_duration: a.duration as any,
    data: baseData({
      phase: a.phase,
      part: a.part,
      ...(a.phase === "instructions" ? {} : { block: 1 }),
      ...(a.data ?? {}),
    }),
    on_finish: (d: any) => {
      delete d.stimulus; // derived HTML; the descriptive fields carry what was shown
      a.finish?.(d);
    },
  };
}

const rowFields = (p: TrialPlan) => ({
  trial_index_in_block: p.trial_index_in_block,
  win_probability: p.offer.probability,
  hard_reward: p.offer.hard_reward,
  easy_reward: p.offer.easy_reward,
});

const when = (condition: () => boolean, node: any) => ({
  timeline: [node],
  conditional_function: condition,
});

function createFixation(ctx: Context, phase: Phase) {
  return when(
    () => plan(ctx).fixation_ms > 0,
    createDisplayTrial({
      phase,
      part: "fixation",
      stimulus: () => renderFixation(ctx.text),
      duration: () => plan(ctx).fixation_ms,
      finish: (d) => {
        const p = plan(ctx);
        d.trial_index_in_block = p.trial_index_in_block;
        d.duration_ms = p.fixation_ms;
        d.fixation_duration = p.fixation_ms;
      },
    })
  );
}

// -- choice ------------------------------------------------------------------------------------

function choiceArgs(ctx: Context, o: ResolvedOptions, offer: Offer, below = "") {
  const f = taskFacts(ctx, o);
  return {
    offer,
    text: ctx.text,
    outcome_type: f.outcome_type,
    easy_presses: f.easy_presses,
    hard_presses: f.hard_presses,
    easy_seconds: f.easy_seconds,
    hard_seconds: f.hard_seconds,
    easy_key: f.easy_choice_key,
    hard_key: f.hard_choice_key,
    probability_shown: f.probability_shown,
    below,
  };
}

/** The task a choice key stands for. */
function taskOfKey(o: ResolvedOptions, key: unknown): Task | null {
  if (typeof key !== "string") return null;
  const k = key.toLowerCase();
  if (k === o.response_keys[0].toLowerCase()) return "easy";
  if (k === o.response_keys[1].toLowerCase()) return "hard";
  return null;
}

function createChoice(ctx: Context, phase: Phase) {
  const node = {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      const p = plan(ctx);
      return renderChoice(choiceArgs(ctx, p.o, p.offer));
    },
    choices: ((): string[] => [
      ...(phase === "practice" ? ctx.practice : ctx.test).response_keys,
    ]) as any,
    trial_duration: (() => plan(ctx).o.response_window_ms.choice) as any,
    data: baseData({ phase, part: "choice", block: 1 }),
    // data-only simulation: a logistic choice that rises with probability and reward (simulation.ts)
    simulation_options: () => {
      const p = plan(ctx);
      const sim = simulateChoice(ctx.jsPsych, p.offer, p.o.response_window_ms.choice);
      const key =
        sim.task === "easy"
          ? p.o.response_keys[0]
          : sim.task === "hard"
          ? p.o.response_keys[1]
          : null;
      if (hasForcedRt(ctx.jsPsych)) return key === null ? {} : { data: { response: key } };
      return { data: { response: key, rt: sim.rt } };
    },
    on_finish: (d: any) => {
      const p = plan(ctx);
      delete d.stimulus;
      // jsPsych's simulation merge can turn a null response into {}; only a key counts
      const chosen = taskOfKey(p.o, d.response);
      const timeout = chosen === null;
      if (timeout) {
        d.response = null;
        d.rt = null;
      }
      p.choice_rt = timeout ? null : d.rt;
      p.choice = chosen ?? "none";
      if (timeout) {
        p.choice_forced = true;
        p.forced_by = "timeout";
        p.chosen_task = ctx.jsPsych.randomization.sampleWithoutReplacement(
          ["easy", "hard"] as Task[],
          1
        )[0];
      } else {
        p.chosen_task = chosen;
      }
      Object.assign(d, rowFields(p), {
        timeout,
        choice: p.choice,
        choice_forced: p.choice_forced,
        forced_by: p.forced_by,
        chosen_task: p.chosen_task,
        response_window: p.o.response_window_ms.choice,
        response_keys: [...p.o.response_keys],
      });
    },
  };
  return when(() => plan(ctx).forced_task === null, node);
}

// -- ready, effort, feedback -------------------------------------------------------------------

function assignedNotice(ctx: Context, p: TrialPlan): string {
  return p.choice_forced && p.forced_by !== null
    ? `<p>${ctx.text.assigned_notice({ task: p.chosen_task!, reason: p.forced_by })}</p>`
    : "";
}

function createReady(ctx: Context, phase: Phase) {
  return when(
    () => plan(ctx).ready_ms > 0,
    createDisplayTrial({
      phase,
      part: "ready",
      stimulus: () => {
        const p = plan(ctx);
        return renderCenterText(
          ctx.text.ready_text({ task: p.chosen_task! }),
          "",
          assignedNotice(ctx, p)
        );
      },
      duration: () => plan(ctx).ready_ms,
      finish: (d) => {
        const p = plan(ctx);
        d.trial_index_in_block = p.trial_index_in_block;
        d.duration_ms = p.ready_ms;
        d.chosen_task = p.chosen_task;
      },
    })
  );
}

/** Option bundle the effort trial reads lazily for one task. */
function effortParams(ctx: Context, o: ResolvedOptions, task: Task, prompt: string) {
  return {
    keys: [effortKey(o, task)],
    required_presses: o.difficulty_levels[task],
    time_limit: o.response_window_ms[task],
    progress_indicator: o.progress_indicator,
    prompt,
    counter_text: (count: number, required: number) => ctx.text.effort_counter({ count, required }),
  };
}

function effortPrompt(ctx: Context, o: ResolvedOptions, task: Task, notice = ""): string {
  return (
    notice +
    `<p>${ctx.text.effort_prompt({
      key: kbd(ctx, o.response_key_mapping[task]),
      finger: ctx.text.finger_instruction({ task }),
      task,
    })}</p>`
  );
}

function createEffort(ctx: Context, phase: Phase) {
  const lazy =
    <K extends keyof ReturnType<typeof effortParams>>(k: K) =>
    () => {
      const p = plan(ctx);
      return effortParams(
        ctx,
        p.o,
        p.chosen_task!,
        effortPrompt(ctx, p.o, p.chosen_task!, assignedNotice(ctx, p))
      )[k];
    };
  return {
    type: EffortPressPlugin,
    css_classes: [TASK_CLASS],
    keys: lazy("keys") as any,
    required_presses: lazy("required_presses") as any,
    time_limit: lazy("time_limit") as any,
    progress_indicator: lazy("progress_indicator") as any,
    prompt: lazy("prompt") as any,
    counter_text: (count: number, required: number) => ctx.text.effort_counter({ count, required }),
    data: baseData({ phase, part: "response", block: 1 }),
    // data-only simulation: press rates drawn for the chosen task (simulation.ts)
    simulation_options: () => ({ task: plan(ctx).chosen_task! }),
    on_finish: (d: any) => {
      const p = plan(ctx);
      const task = p.chosen_task!;
      const amount = (value: number) => ctx.text.amount({ value, outcome_type: outcomeKind(p.o) });
      p.press_count = d.press_count;
      p.completed = d.completed === true;
      p.task_duration_ms =
        typeof d.task_duration_ms === "number" ? d.task_duration_ms : p.o.response_window_ms[task];
      const reward = task === "easy" ? p.offer.easy_reward : p.offer.hard_reward;
      p.reward_won = p.completed && p.offer.win ? reward : 0;
      Object.assign(d, rowFields(p), {
        win: p.offer.win,
        choice: p.choice,
        choice_forced: p.choice_forced,
        forced_by: p.forced_by,
        chosen_task: task,
        choice_rt: p.choice_rt,
        effort_key: effortKey(p.o, task),
        response_window: p.o.response_window_ms[task],
        progress_indicator: p.o.progress_indicator,
        reward_won: p.reward_won,
        reward_won_prev: ctx.state.last_reward,
        session_elapsed_ms: p.session_elapsed_ms,
        easy_reward_text: amount(p.offer.easy_reward),
        hard_reward_text: amount(p.offer.hard_reward),
      });
      delete d.time_limit;
      // the rest of the trial and the next one see this trial's reward
      ctx.state.last_reward = p.reward_won;
    },
  };
}

function createFeedback(ctx: Context, phase: Phase, stage: "completion" | "reward") {
  const part = `${stage}_feedback`;
  const ms = (p: TrialPlan) => (stage === "completion" ? p.completion_ms : p.reward_ms);
  return when(
    () => ms(plan(ctx)) > 0,
    createDisplayTrial({
      phase,
      part,
      stimulus: () => {
        const p = plan(ctx);
        if (stage === "completion") {
          return renderCenterText(
            p.completed ? ctx.text.feedback_completed : ctx.text.feedback_not_completed,
            p.completed ? "completed" : "not-completed"
          );
        }
        const amount = ctx.text.amount({ value: p.reward_won, outcome_type: outcomeKind(p.o) });
        return renderCenterText(
          p.reward_won > 0
            ? ctx.text.reward_win({ amount })
            : p.completed
            ? ctx.text.reward_no_win
            : ctx.text.reward_not_completed,
          p.reward_won > 0 ? "win" : "no-win"
        );
      },
      duration: () => ms(plan(ctx)),
      finish: (d) => {
        const p = plan(ctx);
        d.trial_index_in_block = p.trial_index_in_block;
        d.feedback_stage = stage;
        d.duration_ms = ms(p);
        d.feedback_duration = ms(p);
        if (stage === "reward") d.reward_won = p.reward_won;
      },
    })
  );
}

// -- the trial loop ------------------------------------------------------------------------------

/**
 * Trials of one phase as a loop: the plan of the next trial is drawn when the previous one ends, so the number of
 * trials need not be known in advance (a `fixed_time` session). Practice ends after `practice_trials` trials; the
 * test ends on `session_duration_min` or `n_test_trials` (and never after more than MAX_SESSION_TRIALS).
 */
export function createTrialLoop(ctx: Context, phase: Phase) {
  const o = phase === "practice" ? ctx.practice : ctx.test;
  const nodes = [
    createFixation(ctx, phase),
    createChoice(ctx, phase),
    createReady(ctx, phase),
    createEffort(ctx, phase),
    createFeedback(ctx, phase, "completion"),
    createFeedback(ctx, phase, "reward"),
  ];
  const more = (): boolean => {
    const n = ctx.state.n_trials;
    if (phase === "practice") return n < o.practice_trials;
    if (n >= MAX_SESSION_TRIALS) return false;
    if (o.task_end_rule === "fixed_trial_count") return n < o.n_test_trials;
    return sessionClock(ctx) < o.session_duration_min! * 60000;
  };
  return {
    timeline: nodes,
    on_timeline_start: () => {
      const s = ctx.state;
      s.n_trials = 0;
      s.elapsed_ms = 0;
      s.last_reward = 0;
      s.wall_start = phase === "test" ? performance.now() : null;
      // practice offers are random draws; the test follows `trial_order`
      s.stream = new OfferStream(ctx.jsPsych, o, phase === "practice" ? "random" : o.trial_order);
      s.plan = newPlan(ctx, phase);
    },
    loop_function: () => {
      const p = plan(ctx);
      if (phase === "test") ctx.state.elapsed_ms += planDuration(p);
      if (!more()) return false;
      ctx.state.plan = newPlan(ctx, phase);
      return true;
    },
  };
}

// -- instructions --------------------------------------------------------------------------------

function textPage(ctx: Context, html: string, phase: string, part: string, label?: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: `<div class="${P}-text">${html}</div>`,
    choices: [label ?? ctx.text.continue_button],
    data: baseData({ phase, part }),
  };
}

export function createInstructions(ctx: Context) {
  const o = ctx.test;
  if (o.instruction_format === "experimenter") return { timeline: [] as any[] };
  const t = ctx.text;
  const f = taskFacts(ctx, o);
  const pages = [
    t.instruction_intro(f),
    t.instruction_tasks(f),
    t.instruction_rewards(f),
    t.instruction_chance(f),
    t.instruction_choice(f),
    t.instruction_session_length(f),
    t.instruction_payout(f),
  ];
  return { timeline: pages.map((html) => textPage(ctx, html, "instructions", "instruction")) };
}

export function createPracticeIntro(ctx: Context) {
  return textPage(
    ctx,
    ctx.text.instruction_practice_intro(taskFacts(ctx, ctx.practice)),
    "instructions",
    "instruction"
  );
}

export function createTestIntro(ctx: Context) {
  return textPage(
    ctx,
    ctx.text.instruction_test_intro(taskFacts(ctx, ctx.test)),
    "instructions",
    "instruction"
  );
}

// -- walkthrough ---------------------------------------------------------------------------------

/** The illustrative offer of the walkthrough: a middle probability and a middle hard reward of the configured design. */
export function demoOffer(o: ResolvedOptions): Offer {
  const probs = [...o.reward_probability].sort((a, b) => a - b);
  const r = rewardRange(o.reward_magnitude.hard);
  return {
    probability: probs[Math.floor((probs.length - 1) / 2)],
    hard_reward: round2((r.min + r.max) / 2),
    easy_reward: o.reward_magnitude.easy,
    win: true,
    cell: null,
  };
}

type DemoStep = { kind: "choose"; wanted: Task } | { kind: "effort"; wanted: "easy" };

/**
 * Interactive walkthrough (PACKAGE-STANDARD §6a). Untimed, except that the effort step has the real time limit
 * (the time limit is part of the task). Step 1 and 2 show the real choice screen and ask for the easy, then the hard
 * choice; step 3 is the easy task with its real requirement. A wrong choice or an easy task not completed shows a hint
 * and repeats the step; after INSTRUCTION_MAX_ATTEMPTS the answer is shown and it moves on. Rows are `phase:
 * "instructions"`, `part: "instruction_check"` (hints: `instruction_feedback`) and are never scored.
 */
export function createInstructionWalkthrough(ctx: Context) {
  const o = ctx.test;
  if (o.instruction_format !== "text" || o.instruction_demonstration === "none") {
    return { timeline: [] as any[] };
  }
  const t = ctx.text;
  const f = taskFacts(ctx, o);
  const offer = demoOffer(o);
  const nodes: any[] = [textPage(ctx, t.instruction_demo_intro(f), "instructions", "instruction")];
  const steps: DemoStep[] = [
    { kind: "choose", wanted: "easy" },
    { kind: "choose", wanted: "hard" },
    { kind: "effort", wanted: "easy" },
  ];
  const caption = (html: string) => html;

  for (const step of steps) {
    const state = { attempt: 0, correct: null as boolean | null };
    const wantedKey =
      step.kind === "choose"
        ? step.wanted === "easy"
          ? f.easy_choice_key
          : f.hard_choice_key
        : "";
    const stepName = step.kind === "choose" ? `choose_${step.wanted}` : `effort_${step.wanted}`;
    const stepData = {
      phase: "instructions",
      step: stepName,
      win_probability: offer.probability,
      hard_reward: offer.hard_reward,
      easy_reward: offer.easy_reward,
    };

    let response: any;
    if (step.kind === "choose") {
      const wantedIndex = step.wanted === "easy" ? 0 : 1;
      response = {
        type: jsPsychHtmlKeyboardResponse,
        css_classes: [TASK_CLASS],
        stimulus: () =>
          renderChoice(
            choiceArgs(
              ctx,
              o,
              offer,
              caption(t.demo_choose({ wanted: step.wanted, wanted_key: wantedKey }))
            )
          ),
        choices: [...o.response_keys],
        trial_duration: null,
        data: baseData({
          ...stepData,
          part: "instruction_check",
          correct_response: o.response_keys[wantedIndex],
        }),
        // data-only simulation answers correctly
        simulation_options: { data: { response: o.response_keys[wantedIndex], rt: 800 } },
        on_finish: (d: any) => {
          delete d.stimulus;
          const chosen = taskOfKey(o, d.response);
          state.attempt++;
          state.correct = chosen === step.wanted;
          d.choice = chosen ?? "none";
          d.correct = state.correct;
          d.attempt = state.attempt;
        },
      };
    } else {
      response = {
        type: EffortPressPlugin,
        css_classes: [TASK_CLASS],
        ...effortParams(ctx, o, "easy", `<p>${t.demo_effort(f)}</p>`),
        data: baseData({ ...stepData, part: "instruction_check" }),
        simulation_options: { task: "easy", force_complete: true },
        on_finish: (d: any) => {
          state.attempt++;
          state.correct = d.completed === true;
          d.correct = state.correct;
          d.attempt = state.attempt;
          d.effort_key = effortKey(o, "easy");
          delete d.time_limit;
        },
      };
    }

    const shownChoice = (html: string) => renderChoice(choiceArgs(ctx, o, offer, html));
    const note = (html: string, kind: string) => ({
      type: jsPsychHtmlButtonResponse,
      css_classes: [TASK_CLASS],
      stimulus: () =>
        step.kind === "choose" ? shownChoice(`<p>${html}</p>`) : renderCenterText(html),
      choices: [t.continue_button],
      data: baseData({ ...stepData, part: "instruction_feedback", feedback_kind: kind }),
      on_finish: (d: any) => {
        delete d.stimulus;
      },
    });
    const confirm = createDisplayTrial({
      phase: "instructions",
      part: "instruction_feedback",
      stimulus: () =>
        step.kind === "choose"
          ? shownChoice(`<p><strong>${t.instruction_correct}</strong></p>`)
          : renderCenterText(`<strong>${t.instruction_correct}</strong>`),
      duration: () => INSTRUCTION_CORRECT_MS,
      data: { ...stepData, feedback_kind: "correct" },
    });
    const hintText =
      step.kind === "choose"
        ? t.demo_choose_hint({ wanted: step.wanted, wanted_key: wantedKey })
        : t.demo_effort_hint(f);
    const revealText =
      step.kind === "choose"
        ? t.demo_choose_reveal({ wanted: step.wanted, wanted_key: wantedKey })
        : t.demo_effort_reveal(f);
    const again = () => state.correct === false && state.attempt < INSTRUCTION_MAX_ATTEMPTS;

    nodes.push({
      timeline: [
        response,
        { timeline: [confirm], conditional_function: () => state.correct === true },
        { timeline: [note(hintText, "hint")], conditional_function: again },
        {
          timeline: [note(revealText, "reveal")],
          conditional_function: () => state.correct === false && !again(),
        },
      ],
      on_timeline_start: () => {
        state.attempt = 0;
        state.correct = null;
      },
      loop_function: again,
    });
  }
  return { timeline: nodes };
}

// -- device check and completion ---------------------------------------------------------------

function isCoarsePointerOnly(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches &&
    !window.matchMedia("(any-pointer: fine)").matches
  );
}

export function createDeviceCheck(ctx: Context) {
  return {
    timeline: [
      {
        ...textPage(
          ctx,
          `<p>${ctx.text.device_not_supported}</p>`,
          "instructions",
          "device_check",
          ctx.text.ok_button
        ),
        on_finish: () => ctx.jsPsych.abortExperiment(ctx.text.device_not_supported),
      },
    ],
    conditional_function: () => isCoarsePointerOnly(),
  };
}

/**
 * The paid trials under the payout rule: two random completed winning trials (drawn here, through
 * `jsPsych.randomization`) or none (a share of the total is not tied to trials).
 */
export function choosePaidTrials(ctx: Context, rows: any[]): number[] {
  if (ctx.test.payout_rule !== "two_random_win_trials_paid") return [];
  const won = rows.filter((r) => r.reward_won > 0).map((r) => r.trial_index_in_block as number);
  return ctx.jsPsych.randomization
    .sampleWithoutReplacement(won, Math.min(2, won.length))
    .sort((a, b) => a - b);
}

export function createCompletion(
  ctx: Context,
  calculate: (data: any, options?: { paid_trials?: number[]; payout_rule?: string }) => any
) {
  let paid: number[] = [];
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      const rows = ctx.jsPsych.data
        .get()
        .filter({ task: TASK_NAME, phase: "test", part: "response" })
        .values();
      paid = choosePaidTrials(ctx, rows);
      const s = calculate(ctx.jsPsych.data.get(), {
        paid_trials: paid,
        payout_rule: ctx.test.payout_rule,
      });
      return `<div class="${P}-text"><h2>${ctx.text.task_complete}</h2>${ctx.text.result_summary({
        n_trials: s.n_trials,
        n_hard_chosen: s.n_hard_chosen,
        n_valid_choices: s.n_valid_choices,
        proportion_hard: s.proportion_hard,
        n_completed: s.n_completed,
        n_wins: s.n_wins,
        payout: ctx.text.amount({ value: s.payout ?? 0, outcome_type: outcomeKind(ctx.test) }),
        payout_rule: ctx.test.payout_rule,
      })}</div>`;
    },
    choices: [ctx.text.continue_button],
    data: baseData({ phase: "completion", part: "completion" }),
    on_finish: (d: any) => {
      const s = calculate(ctx.jsPsych.data.get(), {
        paid_trials: paid,
        payout_rule: ctx.test.payout_rule,
      });
      d.payout_rule = ctx.test.payout_rule;
      d.paid_trials = paid;
      d.payout = s.payout;
      delete d.stimulus;
    },
  };
}
