import "./styles.css";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import type { JsPsych } from "jspsych";

import {
  COMMON_STATE,
  INSTRUCTION_CORRECT_MS,
  INSTRUCTION_MAX_ATTEMPTS,
  MAX_TRIAL_REPEATS,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import {
  DurationOrJitter,
  OptionId,
  ResolvedOptions,
  StateId,
  TwoStepTaskOptions,
  resolveOptions,
  validateOptions,
} from "./options";
import { ShipId, TrialPlan, buildSchedule, splitTrials } from "./schedule";
import { prepareSet } from "./sets";
import type { PreparedSet } from "./sets";
import { HybridAgent, hasForcedRt } from "./simulation";
import {
  colorsFor,
  paintDisplay,
  renderCoin,
  renderFixation,
  renderMessage,
  renderOption,
  renderPair,
  renderScreen,
  renderShip,
  renderStage,
  renderState,
} from "./stimuli";
import { FramingWords, TextConfig, defaultText } from "./text";

type Phase = "practice" | "test";
type Side = "left" | "right";

// -- state --------------------------------------------------------------------------------------

/** What has happened so far in the trial being run (one attempt). */
export interface TrialState {
  plan: TrialPlan;
  attempt: number;
  stage1: { choice: ShipId | null; key: string | null; side: Side | null; rt: number | null };
  state: StateId | null;
  transition: "common" | "rare" | null;
  stage2: { choice: OptionId | null; key: string | null; side: Side | null; rt: number | null };
  reward: 0 | 1 | null;
  missed_stage: 1 | 2 | null;
  /** simulated answers, drawn once per trial run */
  sim: {
    1: { response: string | null; rt: number | null } | null;
    2: { response: string | null; rt: number | null } | null;
  };
}

export interface Context {
  jsPsych: JsPsych;
  text: TextConfig;
  user: TwoStepTaskOptions;
  practice: ResolvedOptions;
  test: ResolvedOptions;
  words: FramingWords;
  state: { total: Record<Phase, number> };
  agent: HybridAgent;
}

export function createContext(jsPsych: JsPsych, options: TwoStepTaskOptions = {}): Context {
  const text: TextConfig = { ...defaultText, ...options.text };
  const test = resolveOptions(options, "test");
  const practice = resolveOptions(options, "practice");
  validateOptions(test);
  validateOptions(practice);
  const set = prepareSet(test.stimulus_set);
  return {
    jsPsych,
    text,
    user: options,
    practice,
    test,
    words: text.framing_words({ words: set.words, set: set.name }),
    state: { total: { practice: 0, test: 0 } },
    agent: new HybridAgent(jsPsych, test.common_transition_prob),
  };
}

// -- helpers ------------------------------------------------------------------------------------

const baseData = (extra: Record<string, unknown>) => ({
  task: TASK_NAME,
  task_version: VERSION,
  ...extra,
});

const KEY_NAMES: Record<string, string> = {
  " ": "space",
  ArrowLeft: "left arrow",
  ArrowRight: "right arrow",
  ArrowUp: "up arrow",
  ArrowDown: "down arrow",
  Enter: "Enter",
};

/** How a key is named to the participant: letters in capitals, named keys in words. */
export function keyName(key: string): string {
  return KEY_NAMES[key] ?? (key.length === 1 ? key.toUpperCase() : key);
}

/** A duration: the number, or a draw from the jitter range (in `step` increments). */
export function sampleDuration(jsPsych: JsPsych, v: DurationOrJitter): number {
  if (typeof v === "number") return v;
  const step = v.step ?? 1;
  return v.min + step * jsPsych.randomization.randomInt(0, Math.floor((v.max - v.min) / step));
}

const other = <T extends string>(a: T, pair: readonly [T, T]): T =>
  a === pair[0] ? pair[1] : pair[0];
const SHIPS = ["A", "B"] as const;
const OPTIONS = ["option_1", "option_2"] as const;
const STATES = ["red", "blue"] as const;

/** The stimulus set of the run, with its defaults filled in and keyed by role. */
const setOf = (o: ResolvedOptions): PreparedSet => prepareSet(o.stimulus_set);

function sideOfKey(o: ResolvedOptions, key: string | null): Side | null {
  if (key === null) return null;
  return key.toLowerCase() === o.response_keys[0].toLowerCase() ? "left" : "right";
}

/** The label of a walkthrough key. */
const keyLabel = (o: ResolvedOptions, side: Side) =>
  keyName(o.response_keys[side === "left" ? 0 : 1]);

const textHtml = (html: string) => `<div class="ts-text">${html}</div>`;

/** The key a simulated participant presses for `side`. */
const keyForSide = (o: ResolvedOptions, side: Side) => o.response_keys[side === "left" ? 0 : 1];

function newTrialState(plan: TrialPlan): TrialState {
  return {
    plan,
    attempt: 0,
    stage1: { choice: null, key: null, side: null, rt: null },
    state: null,
    transition: null,
    stage2: { choice: null, key: null, side: null, rt: null },
    reward: null,
    missed_stage: null,
    sim: { 1: null, 2: null },
  };
}

// -- screens of one trial ----------------------------------------------------------------------

function shipsHtml(o: ResolvedOptions, plan: TrialPlan, chosen: Side | null = null, below = "") {
  const left = plan.ship_left;
  const right = other(left, SHIPS);
  return renderPair({
    left: renderShip(setOf(o), left),
    right: renderShip(setOf(o), right),
    chosen,
    set: setOf(o),
    state: null,
    below,
  });
}

function optionsHtml(
  o: ResolvedOptions,
  plan: TrialPlan,
  state: StateId,
  chosen: Side | null = null,
  below = ""
) {
  const left = plan.alien_left[state];
  const right = other(left, OPTIONS);
  return renderPair({
    left: renderOption(setOf(o), state, left),
    right: renderOption(setOf(o), state, right),
    chosen,
    set: setOf(o),
    state,
    below,
  });
}

// -- display (no-response) trials ---------------------------------------------------------------

interface DisplayArgs {
  phase: string;
  part: string;
  block?: number | null;
  stimulus: string | (() => string);
  duration: number;
  data?: Record<string, unknown>;
  on_finish?: (d: any) => void;
}

/** No-response display trial: the keyboard plugin with `choices: "NO_KEYS"` and a fixed duration (PACKAGE-STANDARD 10). */
export function createDisplayTrial(a: DisplayArgs) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: [TASK_CLASS],
    stimulus: a.stimulus as any,
    choices: "NO_KEYS",
    trial_duration: a.duration,
    data: baseData({
      phase: a.phase,
      part: a.part,
      block: a.block ?? null,
      duration_ms: a.duration,
      ...(a.data ?? {}),
    }),
    on_finish: (d: any) => {
      delete d.stimulus; // derived HTML; the descriptive fields carry what was shown
      a.on_finish?.(d);
    },
  };
}

// -- one trial ----------------------------------------------------------------------------------

interface Durations {
  fixation: number;
  iti: number;
  feedback: number;
  acknowledgement_1: number;
  acknowledgement_2: number;
  timeout_message: number;
  window: number | null;
}

function drawDurations(jsPsych: JsPsych, o: ResolvedOptions): Durations {
  return {
    fixation: sampleDuration(jsPsych, o.fixation_duration_ms),
    iti: sampleDuration(jsPsych, o.iti_ms),
    feedback: sampleDuration(jsPsych, o.feedback_duration_ms),
    acknowledgement_1: sampleDuration(jsPsych, o.response_acknowledgement_ms),
    acknowledgement_2: sampleDuration(jsPsych, o.response_acknowledgement_ms),
    timeout_message: sampleDuration(jsPsych, o.timeout_message_ms),
    window: o.response_window_ms === null ? null : sampleDuration(jsPsych, o.response_window_ms),
  };
}

export function scheduleLabel(o: ResolvedOptions): string {
  const s = o.reward_schedule as Extract<
    ResolvedOptions["reward_schedule"],
    { kind: "random_walk" }
  >;
  return `random_walk sd=${s.sd} bounds=[${s.bounds[0]},${s.bounds[1]}] boundary=${s.boundary}`;
}

interface TrialArgs {
  ctx: Context;
  o: ResolvedOptions;
  phase: Phase;
  block: number;
  trial_index_in_block: number;
  plan: TrialPlan;
}

/** The part of the trial's data that every row of the trial carries. */
function trialKey(a: TrialArgs, st: TrialState) {
  return {
    phase: a.phase,
    block: a.block,
    trial_index_in_block: a.trial_index_in_block,
    attempt: st.attempt,
  };
}

function createChoice(a: TrialArgs, st: TrialState, d: Durations, stage: 1 | 2) {
  const { ctx, o, plan } = a;
  const keys = [...o.response_keys];
  const idsOnScreen = () => {
    if (stage === 1) return { left: plan.ship_left, right: other(plan.ship_left, SHIPS) };
    const left = plan.alien_left[st.state as StateId];
    return { left, right: other(left, OPTIONS) };
  };
  return {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => (stage === 1 ? shipsHtml(o, plan) : optionsHtml(o, plan, st.state as StateId)),
    choices: keys,
    trial_duration: d.window,
    data: baseData({
      phase: a.phase,
      part: "choice",
      stage,
      block: a.block,
      trial_index_in_block: a.trial_index_in_block,
      response_window: d.window,
    }),
    on_start: () => {
      if (stage === 1) {
        // a new attempt at this trial: nothing from an earlier attempt carries over
        Object.assign(st, newTrialState(plan), { attempt: st.attempt + 1 });
      }
    },
    on_finish: (row: any) => {
      delete row.stimulus;
      // jsPsych's simulation merge can turn a null response into {}; only a key counts
      const key: string | null = typeof row.response === "string" ? row.response : null;
      const side = sideOfKey(o, key);
      const ids = idsOnScreen();
      const choice = side === null ? null : ((side === "left" ? ids.left : ids.right) as any);
      row.response = key;
      row.rt = key === null ? null : row.rt;
      row.timeout = key === null;
      row.attempt = st.attempt;
      row.side = side;
      row.left = ids.left;
      row.right = ids.right;
      row.choice = choice;
      row.state = stage === 1 ? null : st.state;
      // the pictures, by the set's own ids
      const set = setOf(o);
      const itemId = (role: string) =>
        stage === 1
          ? set.first[role as ShipId].id
          : set.states[st.state as StateId].items[role as OptionId].id;
      row.stimulus_set = set.name;
      row.state_id = stage === 1 ? null : set.states[st.state as StateId].id;
      row.left_item_id = itemId(ids.left);
      row.right_item_id = itemId(ids.right);
      row.chosen_item_id = choice === null ? null : itemId(choice);
      row.condition = st.transition;
      if (stage === 1) {
        st.stage1 = { choice, key, side, rt: row.rt };
        if (choice === null) {
          st.missed_stage = 1;
        } else {
          const common = COMMON_STATE[choice as ShipId];
          st.state = plan.common ? common : other(common, STATES);
          st.transition = plan.common ? "common" : "rare";
          row.condition = st.transition;
        }
      } else {
        st.stage2 = { choice, key, side, rt: row.rt };
        if (choice === null) {
          st.missed_stage = 2;
        } else {
          const reward = plan.rewards[st.state as StateId][choice as OptionId] ? 1 : 0;
          st.reward = reward;
          ctx.state.total[a.phase] += reward;
          ctx.agent.update(
            st.stage1.choice as ShipId,
            st.state as StateId,
            choice as OptionId,
            reward
          );
        }
      }
    },
    // data-only simulation: a hybrid learner (see simulation.ts)
    simulation_options: () => {
      if (hasForcedRt(ctx.jsPsych)) return {};
      if (st.sim[stage] === null) {
        let side: Side;
        if (stage === 1) {
          const ship = ctx.agent.chooseFirst();
          side = plan.ship_left === ship ? "left" : "right";
        } else {
          const option = ctx.agent.chooseSecond(st.state as StateId);
          side = plan.alien_left[st.state as StateId] === option ? "left" : "right";
        }
        const rt = ctx.agent.rt(stage === 2 && st.transition === "rare");
        const missed = d.window !== null && rt > d.window;
        st.sim[stage] = missed
          ? { response: null, rt: null }
          : { response: keyForSide(o, side), rt };
      }
      return { data: st.sim[stage]! };
    },
  };
}

function createAcknowledgement(a: TrialArgs, st: TrialState, ms: number, stage: 1 | 2) {
  const { o, plan } = a;
  return createDisplayTrial({
    phase: a.phase,
    part: "acknowledgement",
    block: a.block,
    stimulus: () => {
      const side = (stage === 1 ? st.stage1.side : st.stage2.side) as Side;
      return stage === 1
        ? shipsHtml(o, plan, side)
        : optionsHtml(o, plan, st.state as StateId, side);
    },
    duration: ms,
    data: { stage, trial_index_in_block: a.trial_index_in_block, response_acknowledgement: ms },
    on_finish: (row) => {
      row.attempt = st.attempt;
    },
  });
}

function outcomeHtml(
  ctx: Context,
  o: ResolvedOptions,
  st: TrialState,
  phase: Phase,
  captionHtml?: string
): string {
  const t = ctx.text;
  const rewarded = st.reward === 1;
  const side = st.stage2.side as Side;
  const left = st.plan.alien_left[st.state as StateId];
  const id = side === "left" ? left : other(left, OPTIONS);
  const total =
    o.running_score_display === "running_total"
      ? `<p>${t.running_total({ words: ctx.words, total: ctx.state.total[phase] })}</p>`
      : "";
  const caption =
    captionHtml ??
    `<div class="ts-text"><p class="ts-outcome-text">${
      rewarded ? t.outcome_coin({ words: ctx.words }) : t.outcome_none({ words: ctx.words })
    }</p>${total}</div>`;
  return renderStage(
    `<div class="ts-outcome">${renderOption(
      setOf(o),
      st.state as StateId,
      id as OptionId,
      72
    )}${renderCoin(setOf(o), rewarded, 40)}</div>`,
    setOf(o),
    st.state,
    caption
  );
}

function createOutcome(a: TrialArgs, st: TrialState, ms: number) {
  return createDisplayTrial({
    phase: a.phase,
    part: "feedback",
    block: a.block,
    stimulus: () => outcomeHtml(a.ctx, a.o, st, a.phase),
    duration: ms,
    data: {
      trial_index_in_block: a.trial_index_in_block,
      feedback_duration: ms,
      feedback_kind: "outcome",
    },
    on_finish: (row) => {
      row.attempt = st.attempt;
      row.reward = st.reward;
      row.running_total =
        a.o.running_score_display === "running_total" ? a.ctx.state.total[a.phase] : null;
    },
  });
}

function createTimeoutMessage(a: TrialArgs, st: TrialState, ms: number) {
  return createDisplayTrial({
    phase: a.phase,
    part: "timeout_message",
    block: a.block,
    stimulus: () =>
      renderMessage(setOf(a.o), st.missed_stage === 2 ? st.state : null, a.ctx.text.too_slow),
    duration: ms,
    data: { trial_index_in_block: a.trial_index_in_block, timeout_message: ms },
    on_finish: (row) => {
      row.attempt = st.attempt;
      row.stage = st.missed_stage;
    },
  });
}

/**
 * The scorable row of the trial (`part: "response"`): one row per trial attempt, written after the
 * trial's last display. It carries what the analyses of the task need (the spec's data fields) and
 * is a no-display trial of zero duration. `response` and `rt` are the first-stage choice's.
 */
function createSummary(a: TrialArgs, st: TrialState, d: Durations) {
  const { o, plan } = a;
  return {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: [TASK_CLASS],
    // a blank, painted display (as the ITI): an empty one could flash the page colour for a frame
    stimulus: renderStage("", setOf(o), null),
    choices: "NO_KEYS",
    trial_duration: 0,
    data: baseData({
      phase: a.phase,
      part: "response",
      block: a.block,
      trial_index_in_block: a.trial_index_in_block,
      response_window: d.window,
      common_transition_prob: o.common_transition_prob,
      reward_walk: scheduleLabel(o),
    }),
    on_finish: (row: any) => {
      delete row.stimulus;
      const missed = st.missed_stage !== null;
      row.attempt = st.attempt;
      row.condition = st.transition;
      row.stage1_choice = st.stage1.choice;
      row.stage1_key = st.stage1.key;
      row.stage1_side = st.stage1.side;
      row.stage1_rt = st.stage1.rt;
      row.stage1_left = plan.ship_left;
      row.stage2_state = st.state;
      row.transition = st.transition;
      row.stage2_choice = st.stage2.choice;
      row.stage2_key = st.stage2.key;
      row.stage2_side = st.stage2.side;
      row.stage2_rt = st.stage2.rt;
      row.stage2_left = st.state === null ? null : plan.alien_left[st.state];
      // the pictures, by the set's own ids
      const set = setOf(o);
      row.stimulus_set = set.name;
      row.stage1_item_id = st.stage1.choice === null ? null : set.first[st.stage1.choice].id;
      row.stage2_state_id = st.state === null ? null : set.states[st.state].id;
      row.stage2_item_id =
        st.state === null || st.stage2.choice === null
          ? null
          : set.states[st.state].items[st.stage2.choice].id;
      row.reward = st.reward;
      row.reward_probs = plan.probs;
      row.planned_transition = plan.common ? "common" : "rare";
      row.missed = missed;
      row.missed_stage = st.missed_stage;
      // the trial's first choice, so a battery-wide filter on `response` rows finds a response and an RT
      row.response = st.stage1.key;
      row.rt = st.stage1.rt;
      row.timeout = missed;
    },
  };
}

/** All trials of one task trial: fixation, choice 1, acknowledgement, choice 2, acknowledgement, outcome, summary row, ITI. */
export function createTrial(a: TrialArgs) {
  const { ctx, o } = a;
  const d = drawDurations(ctx.jsPsych, o);
  const st = newTrialState(a.plan);
  const ack = o.response_acknowledgement === "highlight";
  const nodes: any[] = [];
  if (d.fixation > 0) {
    nodes.push(
      createDisplayTrial({
        phase: a.phase,
        part: "fixation",
        block: a.block,
        stimulus: renderFixation(setOf(o), ctx.text.fixation),
        duration: d.fixation,
        data: { trial_index_in_block: a.trial_index_in_block, fixation_duration: d.fixation },
      })
    );
  }
  nodes.push(createChoice(a, st, d, 1));
  if (ack && d.acknowledgement_1 > 0) {
    nodes.push({
      timeline: [createAcknowledgement(a, st, d.acknowledgement_1, 1)],
      conditional_function: () => st.stage1.choice !== null,
    });
  }
  const second: any[] = [createChoice(a, st, d, 2)];
  if (ack && d.acknowledgement_2 > 0) {
    second.push({
      timeline: [createAcknowledgement(a, st, d.acknowledgement_2, 2)],
      conditional_function: () => st.stage2.choice !== null,
    });
  }
  if (d.feedback > 0) {
    second.push({
      timeline: [createOutcome(a, st, d.feedback)],
      conditional_function: () => st.stage2.choice !== null,
    });
  }
  nodes.push({ timeline: second, conditional_function: () => st.stage1.choice !== null });
  if (d.timeout_message > 0) {
    nodes.push({
      timeline: [createTimeoutMessage(a, st, d.timeout_message)],
      conditional_function: () => st.missed_stage !== null,
    });
  }
  nodes.push(createSummary(a, st, d));
  if (d.iti > 0) {
    nodes.push(
      createDisplayTrial({
        phase: a.phase,
        part: "iti",
        block: a.block,
        stimulus: renderStage("", setOf(o), null),
        duration: d.iti,
        data: { trial_index_in_block: a.trial_index_in_block, iti: d.iti },
      })
    );
  }
  const repeat = o.missed_response_handling === "repeat_trial";
  return {
    timeline: nodes,
    loop_function: () => repeat && st.missed_stage !== null && st.attempt <= MAX_TRIAL_REPEATS,
  };
}

/** The trials of one block, from the plans of its trials. */
export function createBlock(ctx: Context, phase: Phase, block: number, plans: TrialPlan[]) {
  const o = phase === "practice" ? ctx.practice : ctx.test;
  return {
    timeline: plans.map((plan, i) =>
      createTrial({ ctx, o, phase, block, trial_index_in_block: i + 1, plan })
    ),
  };
}

/** The block sizes of the main phase. */
export function blockSizes(o: ResolvedOptions): number[] {
  return splitTrials(o.n_test_trials, o.n_blocks);
}

/** The generated schedule of a phase, drawn now from `jsPsych.randomization`. */
export function createSchedule(ctx: Context, phase: Phase): TrialPlan[] {
  const o = phase === "practice" ? ctx.practice : ctx.test;
  return phase === "practice"
    ? buildSchedule(ctx.jsPsych, o, o.practice_trials)
    : buildSchedule(ctx.jsPsych, o, o.n_test_trials, blockSizes(o));
}

// -- instruction pages ---------------------------------------------------------------------------

function textPage(ctx: Context, html: string, phase: string, part: string, label?: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: textHtml(html),
    choices: [label ?? ctx.text.continue_button],
    data: baseData({ phase, part }),
    on_finish: (d: any) => {
      delete d.stimulus;
    },
  };
}

export function createTransition(ctx: Context, html: string, phase: string, part = "transition") {
  return textPage(ctx, html, phase, part);
}

export function createInstructions(ctx: Context) {
  const o = ctx.test;
  if (o.instruction_format === "experimenter") return { timeline: [] as any[] };
  const t = ctx.text;
  const words = ctx.words;
  const pages = [
    t.instruction_intro({ words }),
    t.instruction_response({
      words,
      left_key: keyName(o.response_keys[0]),
      right_key: keyName(o.response_keys[1]),
      repeat_missed: o.missed_response_handling === "repeat_trial",
      sides_vary: o.option_side_assignment !== "fixed",
      window_seconds:
        o.response_window_ms === null
          ? null
          : typeof o.response_window_ms === "number"
          ? o.response_window_ms / 1000
          : o.response_window_ms.max / 1000,
    }),
  ];
  if (o.contingency_disclosure !== "none") {
    pages.push(
      t.instruction_transitions({
        words,
        common_percent: Math.round(o.common_transition_prob * 100),
        mapping: o.contingency_disclosure === "full",
      }),
      t.instruction_drift({ words })
    );
  }
  return { timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction")) };
}

// -- instruction walkthrough ---------------------------------------------------------------------

/** One step of the walkthrough: a screen, and the side to choose. */
interface Step {
  id: string;
  /** the screen, with a caption in the region below the stage */
  render: (captionHtml: string) => string;
  side: Side;
  prompt: string;
  hint: string;
  reveal: string;
}

const statement = (html: string) => `<div class="ts-statement">${html}</div>`;

/** The scripted trial of the walkthrough: ship A on the left, the common transition, and a coin. */
function demoPlan(): TrialPlan {
  const probs = {
    red: { option_1: 0.5, option_2: 0.5 },
    blue: { option_1: 0.5, option_2: 0.5 },
  };
  const rewards = {
    red: { option_1: true, option_2: true },
    blue: { option_1: true, option_2: true },
  };
  return {
    index: 0,
    common: true,
    probs,
    rewards,
    ship_left: "A",
    alien_left: { red: "option_1", blue: "option_1" },
  };
}

export function demoSteps(ctx: Context): Step[] {
  const o = ctx.test;
  const t = ctx.text;
  const words = ctx.words;
  const set = setOf(o);
  const plan = demoPlan();
  const key = (side: Side) => keyLabel(o, side);
  const steps: Step[] = [];

  const s1 = { words, side: "left" as Side, key: key("left") };
  steps.push({
    id: "first_choice",
    render: (cap) => shipsHtml(o, plan, null, cap),
    side: "left",
    prompt: t.step_first(s1),
    hint: t.step_first_hint(s1),
    reveal: t.step_first_reveal(s1),
  });

  const stateName = words.state_name.red;
  const s2 = { words, side: "right" as Side, key: key("right"), state_name: stateName };
  steps.push({
    id: "second_choice",
    render: (cap) => optionsHtml(o, plan, "red", null, cap),
    side: "right",
    prompt: t.step_second(s2),
    hint: t.step_second_hint(s2),
    reveal: t.step_second_reveal(s2),
  });

  if (o.contingency_disclosure === "full") {
    // where does each first-stage option usually lead? The answer alternates between the sides.
    SHIPS.forEach((ship, i) => {
      const side: Side = i === 0 ? "right" : "left";
      const common = COMMON_STATE[ship];
      const names = { first_name: words.first_name[ship], state_name: words.state_name[common] };
      const a = { words, side, key: key(side), ...names };
      const q = {
        words,
        first_name: names.first_name,
        left_key: key("left"),
        right_key: key("right"),
      };
      const picture = `<span class="ts-inline">${renderShip(set, ship, 40)}</span> `;
      const pair = (cap: string) => {
        const left = side === "left" ? common : other(common, STATES);
        const right = other(left, STATES);
        return renderPair({
          left: renderState(set, left),
          right: renderState(set, right),
          set,
          state: null,
          below: cap,
        });
      };
      steps.push({
        id: `mapping_${ship}`,
        render: (cap) => pair(cap),
        side,
        prompt: picture + t.check_mapping(q),
        hint: picture + t.check_mapping_hint(a),
        reveal: picture + t.check_mapping_reveal(a),
      });
    });
  } else if (o.contingency_disclosure === "partial") {
    const side: Side = "left";
    const a = { words, side, key: key(side) };
    const q = { words, left_key: key("left"), right_key: key("right") };
    steps.push({
      id: "statement_transitions",
      render: (cap) =>
        renderPair({
          left: statement(t.statement_transitions_true({ words })),
          right: statement(t.statement_transitions_false({ words })),
          set,
          state: null,
          below: cap,
        }),
      side,
      prompt: t.check_statement(q),
      hint: t.check_statement_hint(a),
      reveal: t.check_statement_reveal(a),
    });
  }
  if (o.contingency_disclosure !== "none") {
    const side: Side = "right";
    const a = { words, side, key: key(side) };
    const q = { words, left_key: key("left"), right_key: key("right") };
    steps.push({
      id: "statement_drift",
      render: (cap) =>
        renderPair({
          left: statement(t.statement_drift_false({ words })),
          right: statement(t.statement_drift_true({ words })),
          set,
          state: null,
          below: cap,
        }),
      side,
      prompt: t.check_statement(q),
      hint: t.check_statement_hint(a),
      reveal: t.check_statement_reveal(a),
    });
  }
  return steps;
}

/**
 * Interactive walkthrough (PACKAGE-STANDARD 6a) for a task without a correct answer. The choices
 * of the task have none, so the steps ask for what the instructions just said: which key chooses
 * which side (a scripted first and second choice, drawn with the task's own screens and answered with
 * its keys), and, by `contingency_disclosure`, where each first-stage option usually leads
 * (`full`) or whether the transitions and the reward chances are fixed (`partial`). A wrong
 * answer shows a hint and repeats the step; after INSTRUCTION_MAX_ATTEMPTS the answer is shown and it moves
 * on. Rows are `phase: "instructions"`, `part: "instruction_check"` (hints and confirmations:
 * `instruction_feedback`) and are never scored.
 */
export function createInstructionWalkthrough(ctx: Context) {
  const o = ctx.test;
  if (o.instruction_format !== "text" || o.instruction_demonstration === "none") {
    return { timeline: [] as any[] };
  }
  const t = ctx.text;
  const nodes: any[] = [
    textPage(ctx, t.instruction_demo_intro({ words: ctx.words }), "instructions", "instruction"),
  ];
  const steps = demoSteps(ctx);
  const plan = demoPlan();

  steps.forEach((step) => {
    const state = { attempt: 0, correct: null as boolean | null };
    const correctKey = keyForSide(o, step.side);
    const shown = (html: string) => step.render(textHtml(html));
    const stepData = { phase: "instructions", step: step.id };

    const response = {
      type: jsPsychHtmlKeyboardResponse,
      css_classes: [TASK_CLASS],
      stimulus: () => shown(step.prompt),
      choices: [...o.response_keys],
      data: baseData({ ...stepData, part: "instruction_check", correct_response: correctKey }),
      // data-only simulation answers correctly
      simulation_options: { data: { response: correctKey, rt: 600 } },
      on_finish: (d: any) => {
        const key = typeof d.response === "string" ? d.response : null;
        const correct = key !== null && key.toLowerCase() === correctKey.toLowerCase();
        state.attempt++;
        state.correct = correct;
        delete d.stimulus;
        d.response = key;
        d.timeout = key === null;
        d.correct = correct;
        d.attempt = state.attempt;
      },
    };
    const confirm = createDisplayTrial({
      phase: "instructions",
      part: "instruction_feedback",
      stimulus: () => shown(`<p><strong>${t.instruction_correct}</strong></p>`),
      duration: INSTRUCTION_CORRECT_MS,
      data: { ...stepData, feedback_kind: "correct" },
    });
    const note = (html: string, kind: string) => ({
      type: jsPsychHtmlButtonResponse,
      css_classes: [TASK_CLASS],
      stimulus: () => shown(`<p>${html}</p>`),
      choices: [t.continue_button],
      data: baseData({ ...stepData, part: "instruction_feedback", feedback_kind: kind }),
      on_finish: (d: any) => {
        delete d.stimulus;
      },
    });
    const again = () => state.correct === false && state.attempt < INSTRUCTION_MAX_ATTEMPTS;
    nodes.push({
      timeline: [
        response,
        { timeline: [confirm], conditional_function: () => state.correct === true },
        { timeline: [note(step.hint, "hint")], conditional_function: again },
        {
          timeline: [note(step.reveal, "reveal")],
          conditional_function: () => state.correct === false && !again(),
        },
      ],
      on_timeline_start: () => {
        state.attempt = 0;
        state.correct = null;
      },
      loop_function: again,
    });

    // after the second choice of the scripted trial: show the outcome (untimed, with a sentence to read)
    if (step.id === "second_choice") {
      nodes.push({
        type: jsPsychHtmlButtonResponse,
        css_classes: [TASK_CLASS],
        stimulus: () => {
          const st = newTrialState(plan);
          st.state = "red";
          st.stage2.side = "right";
          st.reward = 1;
          return outcomeHtml(
            ctx,
            o,
            st,
            "test",
            textHtml(`<p>${t.step_outcome({ words: ctx.words })}</p>`)
          );
        },
        choices: [t.continue_button],
        data: baseData({ phase: "instructions", part: "instruction_example", step: "outcome" }),
        on_finish: (d: any) => {
          delete d.stimulus;
        },
      });
    }
  });
  return { timeline: nodes };
}

export function createPracticeIntro(ctx: Context) {
  return textPage(
    ctx,
    ctx.text.instruction_practice_intro({
      words: ctx.words,
      timed: ctx.practice.response_window_ms !== null,
      sides_vary: ctx.practice.option_side_assignment !== "fixed",
    }),
    "instructions",
    "instruction"
  );
}

export function createTestIntro(ctx: Context) {
  return textPage(
    ctx,
    ctx.text.instruction_test_intro({ words: ctx.words }),
    "instructions",
    "instruction"
  );
}

// -- breaks, questionnaire, completion -------------------------------------------------------------

export function createRestBreak(ctx: Context, block: number) {
  return textPage(
    ctx,
    ctx.text.block_complete({ block, n_blocks: ctx.test.n_blocks }),
    "test",
    "rest"
  );
}

/** `manipulation_check: "questionnaire"`: for each first-stage option, which state it mostly led to. */
export function createQuestionnaire(ctx: Context) {
  const o = ctx.test;
  const set = setOf(o);
  const t = ctx.text;
  const trials = SHIPS.map((ship, i) => {
    const common = COMMON_STATE[ship];
    // the true answer alternates between the sides
    const trueSide: Side = i === 0 ? "left" : "right";
    const left = trueSide === "left" ? common : other(common, STATES);
    const caption = `<div class="ts-text"><p><span class="ts-inline">${renderShip(
      set,
      ship,
      40
    )}</span> ${t.questionnaire_question({
      words: ctx.words,
      first_name: ctx.words.first_name[ship],
      left_key: keyLabel(o, "left"),
      right_key: keyLabel(o, "right"),
    })}</p></div>`;
    return {
      type: jsPsychHtmlKeyboardResponse,
      css_classes: [TASK_CLASS],
      stimulus: renderPair({
        left: renderState(set, left),
        right: renderState(set, other(left, STATES)),
        set,
        state: null,
        below: caption,
      }),
      choices: [...o.response_keys],
      data: baseData({ phase: "test", part: "manipulation_check", ship }),
      on_finish: (d: any) => {
        const key = typeof d.response === "string" ? d.response : null;
        const side = sideOfKey(o, key);
        const answer = side === null ? null : side === "left" ? left : other(left, STATES);
        delete d.stimulus;
        d.response = key;
        d.rt = key === null ? null : d.rt;
        d.answer = answer;
        d.common_state = common;
        d.stimulus_set = set.name;
        d.item_id = set.first[ship].id;
        d.answer_state_id = answer === null ? null : set.states[answer].id;
        d.correct = answer === common;
      },
    };
  });
  return {
    timeline: [textPage(ctx, t.questionnaire_intro, "test", "manipulation_check_intro"), ...trials],
  };
}

export function createCompletion(ctx: Context, calculate: (data: any) => any) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      const s = calculate(ctx.jsPsych.data.get());
      return textHtml(
        `<h2>${ctx.text.task_complete}</h2>${ctx.text.result_summary({
          words: ctx.words,
          coins: s.total_reward,
          n_trials: s.n_trials,
          n_missed: s.n_missed,
        })}`
      );
    },
    choices: [ctx.text.continue_button],
    data: baseData({ phase: "completion", part: "completion" }),
    on_finish: (d: any) => {
      delete d.stimulus;
    },
  };
}

export { colorsFor, paintDisplay, renderScreen };
