import "./styles.css";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import type { JsPsych } from "jspsych";

import {
  INSTRUCTION_CORRECT_MS,
  INSTRUCTION_MAX_ATTEMPTS,
  INSTRUCTION_RECALL_SET_SIZE,
  PROCESSING_ACCURACY_TARGET,
  TASK_CLASS,
  TASK_NAME,
  TIMEOUT_NOTICE_MS,
  VERSION,
} from "./constants";
import type { DeadlineContext } from "./deadlines";
import {
  DurationOrJitter,
  OperationSpanOptions,
  ResolvedOptions,
  ResponseWindow,
  resolveOptions,
  validateOptions,
} from "./options";
import { practiceSetSizes, scheduleBlocks } from "./schedule";
import { calculateScores, scoreRecall } from "./scoring";
import { itemNouns, setName } from "./sets";
import {
  Problem,
  RecallSpec,
  RecallState,
  cls,
  drawMemoranda,
  finalItems,
  generateProblem,
  idOf,
  keyName,
  newRecallState,
  poolTexts,
  renderAnswer,
  renderMemorandum,
  renderNotice,
  renderProblem,
  renderRecallPanel,
  renderScreen,
  textBlock,
  wireRecall,
} from "./stimuli";
import {
  InstructionStepArgs,
  Nouns,
  ProcessingInstructionArgs,
  RecallInstructionArgs,
  TextConfig,
  defaultText,
} from "./text";

type Phase = "practice" | "test";
export type PracticePart = "storage" | "processing_only" | "combined";

export interface RecallOutcome {
  n_correct: number;
  set_size: number;
  presented: string[];
  /** processing errors in the trial (null: no processing) */
  math_errors: number | null;
  phase: Phase;
  practice_part?: PracticePart;
}

export interface Context {
  jsPsych: JsPsych;
  text: TextConfig;
  /** user options as given (for phase resolution) */
  user: OperationSpanOptions;
  practice: ResolvedOptions;
  test: ResolvedOptions;
  state: {
    /** processing counters of the span trial that is running */
    trial: { n: number; errors: number; timeouts: number };
    last: RecallOutcome | null;
    last_processing: { correct: boolean; timeout: boolean } | null;
    recall: RecallState;
  };
}

export function createContext(jsPsych: JsPsych, options: OperationSpanOptions = {}): Context {
  const text: TextConfig = { ...defaultText, ...options.text };
  const test = resolveOptions(options, "test");
  const practice = resolveOptions(options, "practice");
  validateOptions(test, "test");
  validateOptions(practice, "practice");
  return {
    jsPsych,
    text,
    user: options,
    practice,
    test,
    state: {
      trial: { n: 0, errors: 0, timeouts: 0 },
      last: null,
      last_processing: null,
      recall: newRecallState(),
    },
  };
}

// -- helpers ------------------------------------------------------------------------------------

const baseData = (extra: Record<string, unknown>) => ({
  task: TASK_NAME,
  task_version: VERSION,
  ...extra,
});

/** Draw a duration: the number itself, or a uniform draw from the jitter range. */
export function sampleDuration(jsPsych: JsPsych, v: DurationOrJitter): number {
  if (typeof v === "number") return v;
  const step = v.step && v.step > 0 ? v.step : 1;
  return (
    v.min + jsPsych.randomization.randomInt(0, Math.floor((v.max - v.min) / step + 1e-9)) * step
  );
}

export interface ResolvedWindow {
  value: number | null;
  rule: string;
}

/** Evaluate `response_window_ms` for one trial: the value and the rule that gave it. */
export function resolveWindow(
  jsPsych: JsPsych,
  v: ResponseWindow,
  c: DeadlineContext
): ResolvedWindow {
  if (typeof v === "function")
    return { value: v(c), rule: v.explain?.(c) ?? v.label ?? "custom function" };
  if (v === null) return { value: null, rule: "none" };
  if (typeof v === "number") return { value: v, rule: "fixed" };
  return { value: sampleDuration(jsPsych, v), rule: "jitter" };
}

/**
 * A missed deadline: no RT. (A button response of 0 is falsy, and jsPsych's simulation leaves it in place
 * when it removes the RT of a timed-out trial, so the RT is what tells.)
 */
const noResponse = (d: any) => typeof d.rt !== "number";

const buttonHtml = (choice: string) => `<button class="jspsych-btn">${choice}</button>`;

type Device = "keyboard" | "mouse" | "touch";

/** What the texts call the memoranda of `o` (the set's `noun`). */
export function nounsOf(o: ResolvedOptions): Nouns {
  const n = itemNouns(o.stimulus_set.memorandum);
  return { noun: n.singular, nouns: n.plural };
}

function processingArgs(
  ctx: Context,
  o: ResolvedOptions,
  timed: boolean
): ProcessingInstructionArgs {
  const device = o.response_device.processing as Device;
  const t = ctx.text;
  return {
    device,
    true_label: device === "keyboard" ? `<kbd>${keyName(o.response_keys[0])}</kbd>` : t.true_button,
    false_label:
      device === "keyboard" ? `<kbd>${keyName(o.response_keys[1])}</kbd>` : t.false_button,
    display_format: o.processing_display_format as ProcessingInstructionArgs["display_format"],
    solved_label: device === "keyboard" ? `<kbd>${keyName(" ")}</kbd>` : t.solved_button,
    timed,
  };
}

function recallArgs(ctx: Context, o: ResolvedOptions): RecallInstructionArgs {
  return {
    format: o.response_format as RecallInstructionArgs["format"],
    order: o.response_order as "serial" | "free",
    omission: o.recall_omission_handling,
    blank_label:
      o.recall_omission_handling === "skip_button" ? ctx.text.skip_button : ctx.text.blank_button,
    ...nounsOf(o),
  };
}

function recallSpec(o: ResolvedOptions, set_size: number): RecallSpec {
  return {
    format: o.response_format as RecallSpec["format"],
    order: o.response_order as "serial" | "free",
    omission: o.recall_omission_handling,
    set_size,
    pool: poolTexts(o),
    ...nounsOf(o),
  };
}

// -- display (no-response) trials --------------------------------------------------------------

interface DisplayArgs {
  phase: string;
  part: string;
  duration: number;
  stimulus: string | (() => string);
  data?: Record<string, unknown>;
  /** plugin `stimulus_duration` (the memorandum) */
  stimulus_duration?: number;
}

/**
 * No-response display trial (memorandum, inter-item gap, feedback, notices): the keyboard plugin with
 * `choices: "NO_KEYS"` and a fixed duration, whatever the response device (PACKAGE-STANDARD §10).
 */
export function createDisplayTrial(a: DisplayArgs) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: [TASK_CLASS],
    stimulus: a.stimulus as any,
    choices: "NO_KEYS",
    trial_duration: a.duration,
    ...(a.stimulus_duration !== undefined ? { stimulus_duration: a.stimulus_duration } : {}),
    data: baseData({ phase: a.phase, part: a.part, duration_ms: a.duration, ...(a.data ?? {}) }),
    on_finish: (d: any) => {
      delete d.stimulus; // derived HTML; the descriptive fields carry what was shown
    },
  };
}

const blankScreen = () => renderScreen("");

// -- one processing episode ----------------------------------------------------------------------

interface ProcessingArgsOf {
  ctx: Context;
  o: ResolvedOptions;
  problem: Problem;
  phase: string;
  /** row tags: the problem screen, the answer (the one row per episode) and the missed-deadline notice */
  tags: { problem: string; answer: string };
  /** data on every row of the episode */
  base: Record<string, unknown>;
  /** the response window of this episode, evaluated when its timed screen starts */
  window: () => ResolvedWindow;
  /** HTML under the answer; default: the verify prompt */
  answerBelow?: () => string;
  /** called when the episode's result is known (inside the answer row's on_finish) */
  onOutcome: (d: any, out: { correct: boolean; timeout: boolean; rt: number | null }) => void;
  /** a data-only simulation answers correctly (walkthrough) */
  simulateCorrect?: boolean;
  /** called on every row of the episode */
  finish?: (d: any) => void;
}

/**
 * One processing episode: a node holding the screens of the processing task. Two-screen format: the
 * problem (timed; ends when the participant says it is solved), then the proposed answer (untimed);
 * a missed deadline skips the answer and shows a brief notice. Single-screen format: problem and
 * answer together, timed. In every format there is exactly one `part: tags.answer` row per episode,
 * with `correct`, `timeout`, `rt` (the timed response), `response_window` and its rule.
 */
export function createProcessing(a: ProcessingArgsOf) {
  const { ctx, o, problem: p } = a;
  const t = ctx.text;
  const device = o.response_device.processing as Device;
  const keyboard = device === "keyboard";
  const twoScreen = o.processing_display_format === "problem_then_answer_screens";
  const keys = o.response_keys;
  const args = processingArgs(ctx, o, false);
  const ep = {
    window: null as number | null,
    rule: "none",
    solve_rt: null as number | null,
    timeout: false,
  };
  const windowFn = () => {
    const w = a.window();
    ep.window = w.value;
    ep.rule = w.rule;
    return w.value;
  };
  const row = (part: string, extra: Record<string, unknown> = {}) =>
    baseData({
      phase: a.phase,
      part,
      ...a.base,
      problem: p.text,
      shown_answer: p.shown,
      answer_is_true: p.is_true,
      response_device: device,
      ...extra,
    });
  const correctResponse: string | number = keyboard
    ? p.is_true
      ? keys[0]
      : keys[1]
    : p.is_true
    ? 0
    : 1;
  const chosenTrue = (d: any) =>
    keyboard ? String(d.response).toLowerCase() === keys[0].toLowerCase() : d.response === 0;
  const stamp = (d: any) => {
    d.response_window = ep.window;
    d.response_window_rule = ep.rule;
    a.finish?.(d);
  };
  const verifyPrompt = () =>
    textBlock(
      t.verify_prompt({ device, true_label: args.true_label, false_label: args.false_label })
    );
  const verifyTrial = (withAnswerShown: boolean) => ({
    type: keyboard ? jsPsychHtmlKeyboardResponse : jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () =>
      renderScreen(
        withAnswerShown ? renderProblem(p, true) : renderAnswer(p),
        a.answerBelow ? a.answerBelow() : verifyPrompt()
      ),
    ...(keyboard
      ? { choices: [...keys] }
      : { choices: [t.true_button, t.false_button], button_html: buttonHtml }),
    ...(withAnswerShown ? { trial_duration: windowFn } : {}),
    data: row(a.tags.answer, { correct_response: correctResponse }),
    ...(a.simulateCorrect
      ? { simulation_options: { data: { response: correctResponse, rt: 600 } } }
      : {}),
    on_finish: (d: any) => {
      delete d.stimulus;
      let correct: boolean;
      let timeout: boolean;
      if (withAnswerShown) {
        timeout = noResponse(d);
        if (timeout) d.response = null;
        correct = !timeout && chosenTrue(d) === p.is_true;
        d.solve_rt = d.rt;
      } else {
        timeout = false;
        correct = chosenTrue(d) === p.is_true;
        d.verify_rt = d.rt;
        d.rt = ep.solve_rt;
        d.solve_rt = ep.solve_rt;
      }
      d.timeout = timeout;
      d.correct = correct;
      stamp(d);
      a.onOutcome(d, { correct, timeout, rt: d.rt });
    },
  });

  if (!twoScreen) return { timeline: [verifyTrial(true)] };

  const solveTrial = {
    type: keyboard ? jsPsychHtmlKeyboardResponse : jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: renderScreen(
      renderProblem(p, false),
      textBlock(t.solve_prompt({ device, solved_label: args.solved_label }))
    ),
    ...(keyboard ? { choices: [" "] } : { choices: [t.solved_button], button_html: buttonHtml }),
    trial_duration: windowFn,
    data: row(a.tags.problem),
    on_finish: (d: any) => {
      delete d.stimulus;
      ep.timeout = noResponse(d);
      if (ep.timeout) d.response = null;
      ep.solve_rt = ep.timeout ? null : d.rt;
      d.timeout = ep.timeout;
      stamp(d);
    },
  };
  const missedTrial = (() => {
    const trial: any = createDisplayTrial({
      phase: a.phase,
      part: a.tags.answer,
      duration: TIMEOUT_NOTICE_MS,
      stimulus: renderScreen(renderNotice(t.timeout_feedback, "timeout")),
      data: row(a.tags.answer, {
        correct_response: correctResponse,
        timeout: true,
        correct: false,
        solve_rt: null,
      }),
    });
    const strip = trial.on_finish;
    trial.on_finish = (d: any) => {
      strip(d);
      d.rt = null;
      d.response = null;
      stamp(d);
      a.onOutcome(d, { correct: false, timeout: true, rt: null });
    };
    return trial;
  })();
  return {
    timeline: [
      solveTrial,
      { timeline: [verifyTrial(false)], conditional_function: () => !ep.timeout },
      { timeline: [missedTrial], conditional_function: () => ep.timeout },
    ],
  };
}

// -- memoranda, recall, feedback ------------------------------------------------------------------

export function createMemorandum(
  ctx: Context,
  o: ResolvedOptions,
  a: { phase: string; part: string; item: string; data: Record<string, unknown> }
) {
  const ms = sampleDuration(ctx.jsPsych, o.stimulus_duration_ms);
  return createDisplayTrial({
    phase: a.phase,
    part: a.part,
    duration: ms,
    stimulus_duration: ms,
    stimulus: renderScreen(renderMemorandum(a.item)),
    data: {
      ...a.data,
      memorandum: a.item,
      memorandum_id: idOf(o)(a.item),
      stimulus_set: setName(o.stimulus_set.memorandum),
      stimulus_duration: ms,
    },
  });
}

export function createInterItem(
  ctx: Context,
  o: ResolvedOptions,
  a: { phase: string; data: Record<string, unknown> }
) {
  const ms = sampleDuration(ctx.jsPsych, o.inter_item_interval_ms);
  if (ms <= 0) return null;
  return createDisplayTrial({
    phase: a.phase,
    part: "inter_item",
    duration: ms,
    stimulus: blankScreen(),
    data: { ...a.data, inter_item_interval: ms },
  });
}

interface RecallArgs {
  phase: string;
  part: string;
  presented: string[];
  data: Record<string, unknown>;
  /** called in on_finish after the score is known */
  onResult?: (d: any, score: ReturnType<typeof scoreRecall>) => void;
}

/**
 * The recall screen: one trial of the button plugin. The recall input (matrix, boxes or key presses) is
 * drawn inside the stage and wired in `on_load`; the plugin's Done button is the response. Under
 * data-only simulation the screen is never shown, so the simulated participant recalls correctly.
 */
export function createRecall(ctx: Context, o: ResolvedOptions, a: RecallArgs) {
  const spec = recallSpec(o, a.presented.length);
  const t = ctx.text;
  const state = ctx.state.recall;
  const id = idOf(o);
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => renderScreen(renderRecallPanel(spec, t), "", true),
    choices: [t.done_button],
    button_html: buttonHtml,
    data: baseData({
      phase: a.phase,
      part: a.part,
      set_size: a.presented.length,
      presented_items: a.presented,
      presented_item_ids: a.presented.map(id),
      stimulus_set: setName(o.stimulus_set.memorandum),
      response_order: o.response_order,
      response_format: o.response_format,
      response_device: o.response_device.recall,
      ...a.data,
    }),
    on_load: () => {
      Object.assign(state, newRecallState());
      wireRecall(state, spec, ctx.jsPsych.getDisplayElement());
    },
    on_finish: (d: any) => {
      delete d.stimulus;
      const simulated = !state.wired;
      const recalled: (string | null)[] = simulated ? [...a.presented] : finalItems(state, spec);
      state.cleanup?.();
      const score = scoreRecall(a.presented, recalled, spec.order);
      d.recall_rt = d.rt;
      d.recalled_items = recalled;
      d.recalled_item_ids = recalled.map(id);
      d.recall_correct_positions = score.correct_positions;
      d.n_correct_positions = score.n_correct;
      d.proportion_correct = a.presented.length ? score.n_correct / a.presented.length : null;
      d.perfect = score.perfect;
      d.correct = score.perfect;
      a.onResult?.(d, score);
    },
  };
}

function runningAccuracy(ctx: Context, phase: Phase, part?: PracticePart): number | null {
  const rows = ctx.jsPsych.data.get().filter({
    task: TASK_NAME,
    phase,
    part: "processing",
    ...(part ? { practice_part: part } : {}),
  });
  const n = rows.count();
  return n > 0 ? rows.filter({ correct: true }).count() / n : null;
}

export function feedbackHtml(ctx: Context, o: ResolvedOptions, out: RecallOutcome): string {
  const t = ctx.text;
  const body = t.recall_feedback({
    n_correct: out.n_correct,
    set_size: out.set_size,
    math_errors: out.math_errors,
    math_accuracy:
      out.math_errors === null
        ? null
        : runningAccuracy(ctx, out.phase, out.phase === "practice" ? out.practice_part : undefined),
  });
  return (
    body +
    (o.trial_feedback === "correct_answer"
      ? t.feedback_correct_answer({ items: out.presented, ...nounsOf(o) })
      : "")
  );
}

export function createRecallFeedback(ctx: Context, o: ResolvedOptions, phase: Phase) {
  const ms = sampleDuration(ctx.jsPsych, o.feedback_duration_ms);
  const trial: any = createDisplayTrial({
    phase,
    part: "feedback",
    duration: ms,
    stimulus: () => renderScreen(renderNotice(feedbackHtml(ctx, o, ctx.state.last!))),
    data: { feedback_kind: o.trial_feedback, feedback_duration: ms },
  });
  const strip = trial.on_finish;
  trial.on_finish = (d: any) => {
    strip(d);
    d.practice_part = ctx.state.last?.practice_part;
  };
  return {
    timeline: [trial],
    conditional_function: () => o.trial_feedback !== "none" && ctx.state.last !== null,
  };
}

/** After a processing problem in processing-only practice: correct, incorrect or too slow. */
export function createProblemFeedback(ctx: Context, o: ResolvedOptions) {
  const ms = sampleDuration(ctx.jsPsych, o.feedback_duration_ms);
  const trial: any = createDisplayTrial({
    phase: "practice",
    part: "feedback",
    duration: ms,
    stimulus: () => {
      const l = ctx.state.last_processing!;
      const kind = l.timeout ? "timeout" : l.correct ? "correct" : "incorrect";
      const txt = l.timeout
        ? ctx.text.timeout_feedback
        : l.correct
        ? ctx.text.correct_feedback
        : ctx.text.incorrect_feedback;
      return renderScreen(renderNotice(txt, kind));
    },
    data: {
      feedback_kind: o.trial_feedback,
      feedback_duration: ms,
      practice_part: "processing_only",
    },
  });
  return {
    timeline: [trial],
    conditional_function: () => o.trial_feedback !== "none" && ctx.state.last_processing !== null,
  };
}

// -- one span trial -----------------------------------------------------------------------------

export interface TrialPlan {
  phase: Phase;
  practice_part?: PracticePart;
  block: number;
  trial_index_in_block: number;
  set_size: number;
  items: string[];
  /** `processing_items_per_memorandum` problems per memorandum, in order */
  problems: Problem[];
}

export function planTrial(
  ctx: Context,
  o: ResolvedOptions,
  base: Omit<TrialPlan, "items" | "problems">,
  withProcessing: boolean
): TrialPlan {
  const k = withProcessing ? o.processing_items_per_memorandum : 0;
  return {
    ...base,
    items: drawMemoranda(ctx.jsPsych, o, base.set_size),
    problems: Array.from({ length: base.set_size * k }, () => generateProblem(ctx.jsPsych)),
  };
}

function trialData(plan: TrialPlan): Record<string, unknown> {
  return {
    practice_part: plan.practice_part,
    block: plan.block,
    trial_index_in_block: plan.trial_index_in_block,
    set_size: plan.set_size,
  };
}

/** The window of a timed processing trial of the span trial `plan`. */
function windowOf(ctx: Context, o: ResolvedOptions, plan: TrialPlan): () => ResolvedWindow {
  return () =>
    resolveWindow(ctx.jsPsych, o.response_window_ms, {
      jsPsych: ctx.jsPsych,
      phase: plan.phase,
      block: plan.phase === "test" ? plan.block : null,
      trial_index_in_block: plan.trial_index_in_block,
    });
}

/**
 * One trial of the complex span: for each memorandum, the processing problem(s) and the memorandum
 * (in `memorandum_order_in_pair` order, with `inter_item_interval_ms` between events), then recall and
 * feedback. With no processing (letters-only practice) it is a simple span.
 */
export function createSpanTrial(
  ctx: Context,
  o: ResolvedOptions,
  plan: TrialPlan,
  finish?: (d: any) => void
) {
  const k = plan.problems.length / Math.max(plan.set_size, 1);
  const hasProcessing = plan.problems.length > 0;
  const data = trialData(plan);
  const events: any[] = [];
  for (let i = 0; i < plan.set_size; i++) {
    const memorandum = createMemorandum(ctx, o, {
      phase: plan.phase,
      part: "memorandum",
      item: plan.items[i],
      data: { ...data, position: i + 1 },
    });
    const procs = plan.problems.slice(i * k, (i + 1) * k).map((p, j) =>
      createProcessing({
        ctx,
        o,
        problem: p,
        phase: plan.phase,
        tags: { problem: "processing_problem", answer: "processing" },
        base: { ...data, position: i + 1, episode: j + 1 },
        window: windowOf(ctx, o, plan),
        onOutcome: (_d, out) => {
          ctx.state.trial.n++;
          if (!out.correct) ctx.state.trial.errors++;
          if (out.timeout) ctx.state.trial.timeouts++;
          ctx.state.last_processing = { correct: out.correct, timeout: out.timeout };
        },
        finish,
      })
    );
    events.push(
      ...(o.memorandum_order_in_pair === "processing_first"
        ? [...procs, memorandum]
        : [memorandum, ...procs])
    );
  }
  const timeline: any[] = [];
  events.forEach((e, i) => {
    timeline.push(e);
    if (i < events.length - 1) {
      const gap = createInterItem(ctx, o, { phase: plan.phase, data });
      if (gap) timeline.push(gap);
    }
  });
  timeline.push(
    createRecall(ctx, o, {
      phase: plan.phase,
      part: "response",
      presented: plan.items,
      data,
      onResult: (d, score) => {
        const tr = ctx.state.trial;
        d.processing_n = tr.n;
        d.processing_errors = hasProcessing ? tr.errors : null;
        d.processing_timeouts = hasProcessing ? tr.timeouts : null;
        ctx.state.last = {
          n_correct: score.n_correct,
          set_size: plan.set_size,
          presented: plan.items,
          math_errors: hasProcessing ? tr.errors : null,
          phase: plan.phase,
          practice_part: plan.practice_part,
        };
      },
    })
  );
  timeline.push(createRecallFeedback(ctx, o, plan.phase));
  return {
    timeline,
    on_timeline_start: () => {
      ctx.state.trial = { n: 0, errors: 0, timeouts: 0 };
      ctx.state.last = null;
    },
  };
}

// -- blocks and practice -----------------------------------------------------------------------------

/** The test: one node per block, with trials as the schedule orders them. */
export function createTest(ctx: Context): any[] {
  const o = ctx.test;
  const blocks = scheduleBlocks(ctx.jsPsych, o.set_sizes, o.trials_per_condition, o.block_order);
  return blocks.map((sizes, b) => ({
    timeline: sizes.map((set_size, i) =>
      createSpanTrial(
        ctx,
        o,
        planTrial(
          ctx,
          o,
          { phase: "test", block: b + 1, trial_index_in_block: i + 1, set_size },
          true
        )
      )
    ),
  }));
}

/** Parts of the practice, in order, for `practice_structure`. */
export function practiceParts(ctx: Context): PracticePart[] {
  const {
    practice_structure: s,
    practice_trials,
    practice_storage_trials,
    practice_combined_trials,
  } = ctx.test;
  const parts: PracticePart[] = [];
  const hasProcessing = ctx.test.processing_items_per_memorandum > 0;
  if (
    (s === "storage_processing_combined" || s === "storage_processing") &&
    practice_storage_trials > 0
  )
    parts.push("storage");
  if (
    (s === "storage_processing_combined" || s === "storage_processing") &&
    practice_trials > 0 &&
    hasProcessing
  )
    parts.push("processing_only");
  if (
    (s === "storage_processing_combined" || s === "combined_only") &&
    practice_combined_trials > 0
  )
    parts.push("combined");
  return parts;
}

function practiceIntro(ctx: Context, part: PracticePart) {
  const html =
    part === "storage"
      ? ctx.text.practice_storage_intro(nounsOf(ctx.test))
      : part === "processing_only"
      ? ctx.text.practice_processing_intro
      : ctx.text.practice_combined_intro;
  return textPage(ctx, html, "instructions", "instruction");
}

/**
 * One practice part. Storage and combined: span trials at the practice set sizes. Processing-only:
 * problems alone, self-paced unless `practice.response_window_ms` is given, with per-problem feedback.
 */
export function createPracticePart(
  ctx: Context,
  part: PracticePart,
  finish?: (d: any) => void
): any {
  const o = ctx.practice;
  const user = ctx.user;
  if (part === "processing_only") {
    const n = ctx.test.practice_trials;
    const selfPaced = user.practice?.response_window_ms === undefined;
    const nodes = Array.from({ length: n }, (_, i) => {
      const problem = generateProblem(ctx.jsPsych);
      const base = { practice_part: "processing_only", block: 1, trial_index_in_block: i + 1 };
      return {
        timeline: [
          createProcessing({
            ctx,
            o,
            problem,
            phase: "practice",
            tags: { problem: "processing_problem", answer: "processing" },
            base,
            window: () =>
              selfPaced
                ? { value: null, rule: "self-paced" }
                : resolveWindow(ctx.jsPsych, o.response_window_ms, {
                    jsPsych: ctx.jsPsych,
                    phase: "practice",
                    block: null,
                    trial_index_in_block: i + 1,
                  }),
            onOutcome: (_d, out) => {
              ctx.state.last_processing = { correct: out.correct, timeout: out.timeout };
            },
            finish,
          }),
          createProblemFeedback(ctx, o),
        ],
      };
    });
    return { timeline: nodes };
  }
  const n =
    part === "storage" ? ctx.test.practice_storage_trials : ctx.test.practice_combined_trials;
  const sizes = practiceSetSizes(ctx.jsPsych, o.set_sizes, n);
  return {
    timeline: sizes.map((set_size, i) =>
      createSpanTrial(
        ctx,
        o,
        planTrial(
          ctx,
          o,
          {
            phase: "practice",
            practice_part: part,
            block: 1,
            trial_index_in_block: i + 1,
            set_size,
          },
          part === "combined"
        ),
        finish
      )
    ),
  };
}

/**
 * The whole practice: its parts in order, each with a short introduction. `practice_criterion` is checked after the
 * last part that has processing (processing-only, else combined): below the accuracy the part repeats (`on_fail:
 * "repeat"`, at most `max_repeats` times), the task continues (`"continue"`), or the experiment ends (`"end"`).
 */
export function createPractice(ctx: Context): any[] {
  const parts = practiceParts(ctx);
  const crit = ctx.test.practice_criterion;
  const gated: PracticePart | null = crit
    ? parts.includes("processing_only")
      ? "processing_only"
      : parts.includes("combined")
      ? "combined"
      : null
    : null;
  const nodes: any[] = [];
  const showText = ctx.test.instruction_format === "text";
  for (const part of parts) {
    if (showText) nodes.push(practiceIntro(ctx, part));
    if (part !== gated || !crit) {
      nodes.push(createPracticePart(ctx, part));
      continue;
    }
    const st = { attempt: 1, accuracy: null as number | null, failed: false, end: false };
    const maxRepeats = crit.max_repeats ?? 1;
    const body = createPracticePart(ctx, part, (d) => {
      d.practice_attempt = st.attempt;
    });
    nodes.push({
      timeline: [
        {
          timeline: [
            textPage(ctx, "", "instructions", "instruction", undefined, () =>
              ctx.text.practice_repeat({ accuracy: st.accuracy ?? 0, criterion: crit.accuracy })
            ),
          ],
          conditional_function: () => st.attempt > 1,
        },
        body,
      ],
      loop_function: () => {
        const rows = ctx.jsPsych.data
          .get()
          .filter({
            task: TASK_NAME,
            phase: "practice",
            part: "processing",
            practice_part: part,
            practice_attempt: st.attempt,
          })
          .values() as any[];
        const used = crit.window ? rows.slice(-crit.window) : rows;
        st.accuracy = used.length ? used.filter((r) => r.correct).length / used.length : null;
        st.failed = st.accuracy !== null && st.accuracy < crit.accuracy;
        if (!st.failed) return false;
        const action = crit.on_fail ?? "repeat";
        if (action === "repeat" && st.attempt <= maxRepeats) {
          st.attempt++;
          return true;
        }
        if (action === "end") st.end = true;
        return false;
      },
    });
    nodes.push({
      timeline: [
        {
          ...textPage(ctx, ctx.text.practice_failed, "instructions", "instruction"),
          on_finish: () => ctx.jsPsych.abortExperiment(textOnly(ctx.text.practice_failed)),
        },
      ],
      conditional_function: () => st.end,
    });
  }
  return nodes;
}

const textOnly = (html: string) => html.replace(/<[^>]*>/g, "");

// -- text pages, instructions -------------------------------------------------------------------

function textPage(
  ctx: Context,
  html: string,
  phase: string,
  part: string,
  label?: string,
  dynamic?: () => string
) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: dynamic
      ? () => `<div class="${cls("text")}">${dynamic()}</div>`
      : `<div class="${cls("text")}">${html}</div>`,
    choices: [label ?? ctx.text.continue_button],
    data: baseData({ phase, part }),
  };
}

export function createTransition(ctx: Context, html: string, phase: string, part = "transition") {
  return textPage(ctx, html, phase, part);
}

export function createInstructions(ctx: Context) {
  const o = ctx.test;
  if (o.instruction_format === "experimenter") return { timeline: [] as any[] };
  const t = ctx.text;
  const timed = o.response_window_ms !== null;
  const emphasis =
    o.speed_accuracy_emphasis === "speed"
      ? t.emphasis_speed
      : o.speed_accuracy_emphasis === "accuracy"
      ? t.emphasis_accuracy({ criterion_percent: Math.round(PROCESSING_ACCURACY_TARGET * 100) })
      : o.speed_accuracy_emphasis === "both"
      ? t.emphasis_both(nounsOf(o))
      : "";
  const pages: string[] = [];
  if (o.processing_items_per_memorandum > 0) {
    pages.push(
      t.instruction_intro({
        memorandum_first: o.memorandum_order_in_pair === "memorandum_first",
        items_per_memorandum: o.processing_items_per_memorandum,
        ...nounsOf(o),
      })
    );
    pages.push(
      t.instruction_processing(processingArgs(ctx, o, timed)) +
        (o.processing_read_aloud ? t.read_aloud : "") +
        emphasis
    );
  }
  pages.push(t.instruction_recall(recallArgs(ctx, o)));
  return { timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction")) };
}

export const createTestIntro = (ctx: Context) =>
  textPage(ctx, ctx.text.instruction_test_intro(nounsOf(ctx.test)), "instructions", "instruction");

// -- walkthrough ------------------------------------------------------------------------------------

type DemoStepName = "processing_true" | "processing_false" | "recall";

function demoArgs(
  ctx: Context,
  o: ResolvedOptions,
  step: DemoStepName,
  items: string[]
): InstructionStepArgs {
  const p = processingArgs(ctx, o, false);
  return {
    ...p,
    step,
    correct_label: step === "processing_false" ? p.false_label : p.true_label,
    items,
    recall: recallArgs(ctx, o),
    ...nounsOf(o),
  };
}

/**
 * Interactive walkthrough (PACKAGE-STANDARD §6a): a true and a false problem, answered in the task's own
 * format, then a two-item recall at task timing on the real recall input. Wrong answers get a hint and
 * repeat; after INSTRUCTION_MAX_ATTEMPTS the answer is shown. Untimed apart from the memoranda, which
 * need their task duration. Rows: `phase: "instructions"`, `part: "instruction_check"` (hints and
 * confirmations `instruction_feedback`, the problem screen and the letters `instruction_example`); never scored.
 */
export function createInstructionWalkthrough(ctx: Context) {
  const o = ctx.test;
  const mode = o.instruction_demonstration;
  if (o.instruction_format !== "text" || mode === "none") return { timeline: [] as any[] };
  const t = ctx.text;
  const hasProcessing = o.processing_items_per_memorandum > 0;
  const steps: DemoStepName[] = [
    ...(hasProcessing ? (["processing_true", "processing_false"] as const) : []),
    "recall",
  ];

  if (mode === "examples") {
    const pages: any[] = [
      textPage(ctx, t.instruction_examples_intro, "instructions", "instruction"),
    ];
    for (const step of steps) {
      const items = drawMemoranda(ctx.jsPsych, o, INSTRUCTION_RECALL_SET_SIZE);
      const p = step === "recall" ? null : generateProblem(ctx.jsPsych, step === "processing_true");
      const args = demoArgs(ctx, o, step, items);
      const stage = p
        ? renderProblem(p, true)
        : renderRecallPanel(recallSpec(o, INSTRUCTION_RECALL_SET_SIZE), t);
      pages.push({
        type: jsPsychHtmlButtonResponse,
        css_classes: [TASK_CLASS],
        stimulus: renderScreen(stage, textBlock(t.instruction_step(args)), step === "recall"),
        choices: [t.continue_button],
        data: baseData({ phase: "instructions", part: "instruction_example", condition: step }),
        on_finish: (d: any) => {
          delete d.stimulus;
        },
      });
    }
    return { timeline: pages };
  }

  const nodes: any[] = [textPage(ctx, t.instruction_demo_intro, "instructions", "instruction")];
  for (const step of steps) {
    const items =
      step === "recall" ? drawMemoranda(ctx.jsPsych, o, INSTRUCTION_RECALL_SET_SIZE) : [];
    const args = demoArgs(ctx, o, step, items);
    const state = { attempt: 0, correct: null as boolean | null };
    const stepData = { condition: step };
    const again = () => state.correct === false && state.attempt < INSTRUCTION_MAX_ATTEMPTS;
    const sub: any[] = [];

    if (step === "recall") {
      items.forEach((item, i) => {
        sub.push(
          createMemorandum(ctx, o, {
            phase: "instructions",
            part: "instruction_example",
            item,
            data: { ...stepData, position: i + 1 },
          })
        );
        if (i < items.length - 1) {
          const gap = createInterItem(ctx, o, { phase: "instructions", data: stepData });
          if (gap) sub.push(gap);
        }
      });
      sub.push(
        createRecall(ctx, o, {
          phase: "instructions",
          part: "instruction_check",
          presented: items,
          data: stepData,
          onResult: (d, score) => {
            state.attempt++;
            state.correct = score.perfect;
            d.attempt = state.attempt;
          },
        })
      );
    } else {
      const problem = generateProblem(ctx.jsPsych, step === "processing_true");
      sub.push(
        createProcessing({
          ctx,
          o,
          problem,
          phase: "instructions",
          tags: { problem: "instruction_example", answer: "instruction_check" },
          base: stepData,
          window: () => ({ value: null, rule: "untimed" }),
          answerBelow: () => textBlock(t.instruction_step(args)),
          simulateCorrect: true,
          onOutcome: (d, out) => {
            state.attempt++;
            state.correct = out.correct;
            d.attempt = state.attempt;
          },
        })
      );
    }

    const confirm = createDisplayTrial({
      phase: "instructions",
      part: "instruction_feedback",
      duration: INSTRUCTION_CORRECT_MS,
      stimulus: renderScreen(renderNotice(`<strong>${t.instruction_correct}</strong>`)),
      data: { ...stepData, feedback_kind: "correct" },
    });
    const note = (html: string, kind: string) => ({
      type: jsPsychHtmlButtonResponse,
      css_classes: [TASK_CLASS],
      stimulus: () => `<div class="${cls("text")}">${html}</div>`,
      choices: [t.continue_button],
      data: baseData({
        phase: "instructions",
        part: "instruction_feedback",
        ...stepData,
        feedback_kind: kind,
      }),
      on_finish: (d: any) => {
        delete d.stimulus;
      },
    });
    const body = {
      timeline: [
        ...sub,
        { timeline: [confirm], conditional_function: () => state.correct === true },
        { timeline: [note(t.instruction_hint(args), "hint")], conditional_function: again },
        {
          timeline: [note(t.instruction_reveal(args), "reveal")],
          conditional_function: () => state.correct === false && !again(),
        },
      ],
      on_timeline_start: () => {
        state.attempt = 0;
        state.correct = null;
      },
      loop_function: again,
    };
    if (step === "recall")
      nodes.push(textPage(ctx, t.instruction_step(args), "instructions", "instruction"));
    nodes.push(body);
  }
  return { timeline: nodes };
}

// -- completion ------------------------------------------------------------------------------------

export function createCompletion(ctx: Context) {
  const o = ctx.test;
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      const feedback = o.end_of_task_feedback;
      let body = "";
      if (feedback === "score" || feedback === "summary") {
        const s = calculateScores(ctx.jsPsych.data.get());
        body = ctx.text.result_summary({
          partial_score: s.partial_credit_load,
          total_items: s.total_items,
          processing_accuracy: s.processing_accuracy,
          summary: feedback === "summary",
          absolute_score: s.absolute_score,
          perfect_trials: s.n_perfect_trials,
          n_trials: s.n_trials,
        });
      }
      return `<div class="${cls("text")}"><h2>${ctx.text.task_complete}</h2>${body}</div>`;
    },
    choices: [ctx.text.continue_button],
    data: baseData({ phase: "completion", part: "completion" }),
  };
}
