import "./styles.css";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import type { JsPsych } from "jspsych";

import {
  INSTRUCTION_CORRECT_MS,
  INSTRUCTION_MAX_ATTEMPTS,
  INSTRUCTION_SET_SIZE,
  PICK_CLASS,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import {
  DurationOrJitter,
  ResolvedOptions,
  SelfOrderedPointingOptions,
  checkPool,
  resolveOptions,
  validateOptions,
} from "./options";
import { practiceSetSizes, scheduleBlocks } from "./schedule";
import { calculateScores } from "./scoring";
import { simulateCorrectPick, simulateMemoryPick } from "./simulate";
import {
  Arrangement,
  Item,
  ItemAssignment,
  Jitter,
  assignItems,
  buildPool,
  cls,
  drawJitter,
  gridDims,
  itemButtonHtml,
  itemNouns,
  nextArrangement,
  renderItem,
  renderNotice,
  renderPickScreen,
  renderScreen,
  sampleDuration,
  slotRowCol,
  textBlock,
} from "./stimuli";
import { InstructionArgs, StepArgs, TextConfig, TextItems, defaultText } from "./text";

type Phase = "practice" | "test";

export interface Context {
  jsPsych: JsPsych;
  text: TextConfig;
  /** user options as given (for phase resolution) */
  user: SelfOrderedPointingOptions;
  practice: ResolvedOptions;
  test: ResolvedOptions;
  /** Which items each set gets. */
  items: ItemAssignment;
  nouns: { singular: string; plural: string };
}

/** Resolve and validate the options of both phases and assign the items. Most factories take this object. */
export function createContext(jsPsych: JsPsych, options: SelfOrderedPointingOptions = {}): Context {
  const text: TextConfig = { ...defaultText, ...options.text };
  const test = resolveOptions(options, "test");
  const practice = resolveOptions(options, "practice");
  validateOptions(test, "test");
  validateOptions(practice, "practice");
  const walkthrough =
    test.instruction_format === "text" && test.instruction_demonstration === "interactive"
      ? INSTRUCTION_SET_SIZE
      : 0;
  checkPool(test, practice, walkthrough);
  const items = assignItems(
    buildPool(test.stimulus_set.items),
    test.stimulus_set.pool,
    walkthrough,
    test.practice_trials > 0 ? practice.set_sizes : [],
    test.set_sizes
  );
  return {
    jsPsych,
    text,
    user: options,
    practice,
    test,
    items,
    nouns: itemNouns(test.stimulus_set.items),
  };
}

// -- helpers ------------------------------------------------------------------------------------

const baseData = (extra: Record<string, unknown>) => ({
  task: TASK_NAME,
  task_version: VERSION,
  ...extra,
});

const textItems = (ctx: Context, o: ResolvedOptions): TextItems => ({
  noun: ctx.nouns.singular,
  nouns: ctx.nouns.plural,
  verb: o.response_device === "touch" ? "tap" : "click",
});

/** Seconds of a fixed response window; null when untimed or jittered. */
const limitSeconds = (o: ResolvedOptions): number | null =>
  typeof o.response_window_ms === "number" ? o.response_window_ms / 1000 : null;

export function instructionArgs(ctx: Context, o: ResolvedOptions): InstructionArgs {
  return {
    ...textItems(ctx, o),
    position_rule: o.position_repeat_rule,
    position_max: o.position_repeat_max,
    limit_seconds: limitSeconds(o),
    timed: o.response_window_ms !== null,
    free_positions: o.stimulus_layout === "free_positions_in_area",
    partial_reshuffle: o.rearrangement_rule === "partial_reshuffle_each_page",
  };
}

// -- display (no-response) trials --------------------------------------------------------------

interface DisplayArgs {
  phase: string;
  part: string;
  duration: number;
  stage: string;
  below?: string;
  data?: Record<string, unknown>;
}

/**
 * No-response display trial (the blank between pages, feedback, confirmations): the keyboard plugin with
 * `choices: "NO_KEYS"` and a fixed duration, whatever the response device (PACKAGE-STANDARD §10). Its stage is
 * the same size and place as the item grid.
 */
export function createDisplayTrial(a: DisplayArgs) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: [TASK_CLASS],
    stimulus: renderScreen(a.stage, a.below ?? ""),
    choices: "NO_KEYS",
    trial_duration: a.duration,
    data: baseData({
      phase: a.phase,
      part: a.part,
      duration_ms: a.duration,
      ...(a.data ?? {}),
    }),
    on_finish: (d: any) => {
      delete d.stimulus; // derived HTML; the descriptive fields carry what was shown
    },
  };
}

// -- text pages ----------------------------------------------------------------------------------

function textPage(
  ctx: Context,
  html: string,
  phase: string,
  part: string,
  data: Record<string, unknown> = {}
) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: textBlock(html),
    choices: [ctx.text.continue_button],
    data: baseData({ phase, part, ...data }),
    on_finish: (d: any) => {
      delete d.stimulus;
    },
  };
}

// -- series state and the pick page ----------------------------------------------------------------

/** What the participant has done so far in the series that is running. */
export interface SeriesState {
  /** Indices (into the series' items) picked so far, without repeats. */
  picked: Set<number>;
  /** The slot clicked on each page so far (null: the page timed out). */
  slots: (number | null)[];
  /** Id of the item picked on the page before, null after a timeout or on page 1. */
  prev_item: string | null;
  /** The arrangement of the page before. */
  prev_arrangement: Arrangement | null;
  /** Repeat errors so far. */
  errors: number;
  /** The result of the last page, for the feedback and reminder nodes. */
  last: PickOutcome | null;
}

export interface PickOutcome {
  timeout: boolean;
  repeat: boolean;
  correct: boolean;
  violation: boolean;
  item_id: string | null;
  slot: number | null;
}

export const newSeriesState = (): SeriesState => ({
  picked: new Set(),
  slots: [],
  prev_item: null,
  prev_arrangement: null,
  errors: 0,
  last: null,
});

/** What one page shows: the arrangement, the free-position offsets, and a slot that cannot be clicked. */
export interface PagePlan {
  arrangement: Arrangement;
  jitter?: Jitter[];
  disabled_slot: number | null;
}

/** The slot the enforced rule switches off: the one picked on each of the last `max` pages. */
export function forbiddenSlot(o: ResolvedOptions, state: SeriesState): number | null {
  if (o.position_repeat_rule !== "enforced") return null;
  const m = o.position_repeat_max;
  if (state.slots.length < m) return null;
  const last = state.slots.slice(-m);
  return last.every((s) => s !== null && s === last[0]) ? last[0] : null;
}

/** Consecutive picks at `slot` ending with the newest, counting `slot` itself as the newest. */
export function positionRun(slots: (number | null)[], slot: number): number {
  let run = 1;
  for (let i = slots.length - 1; i >= 0 && slots[i] === slot; i--) run++;
  return run;
}

/**
 * Draw the plan of the next page. Draws are made when the page starts, from the arrangement of the page before
 * (the partial reshuffle depends on it). Under the enforced rule, when the switched-off slot holds the only item
 * left to pick, that item swaps places with its neighbour so the page can be completed.
 */
export function planPage(
  jsPsych: JsPsych,
  o: ResolvedOptions,
  items: Item[],
  state: SeriesState
): PagePlan {
  const n = items.length;
  const arrangement = nextArrangement(
    jsPsych,
    n,
    o.rearrangement_rule,
    o.reshuffle_proportion,
    state.prev_arrangement
  );
  const disabled = forbiddenSlot(o, state);
  if (disabled !== null) {
    const open = arrangement
      .map((item, slot) => ({ item, slot }))
      .filter((x) => !state.picked.has(x.item));
    if (open.length === 1 && open[0].slot === disabled) {
      const other = (disabled + 1) % n;
      [arrangement[disabled], arrangement[other]] = [arrangement[other], arrangement[disabled]];
    }
  }
  state.prev_arrangement = arrangement;
  return {
    arrangement,
    jitter: o.stimulus_layout === "free_positions_in_area" ? drawJitter(jsPsych, n) : undefined,
    disabled_slot: disabled,
  };
}

interface PickArgs {
  ctx: Context;
  o: ResolvedOptions;
  items: Item[];
  state: SeriesState;
  phase: string;
  part: string;
  /** data on the row, known when the timeline is built */
  data: Record<string, unknown>;
  /** text under the grid, evaluated when the page starts */
  below?: () => string;
  /** a data-only simulation never repeats (the walkthrough) */
  simulateCorrect?: boolean;
  /** called when the page ends, with the row and the outcome */
  onOutcome?: (d: any, out: PickOutcome) => void;
}

/**
 * One page: the items in a grid of buttons, one pick. The plugin's button group is the stage, so the grid is
 * anchored at the vertical centre. The response is the button's index, which is the slot; the item and the
 * history come from it in `on_finish`, whether the click was real or simulated.
 */
export function createPickTrial(a: PickArgs) {
  const { ctx, o, items, state } = a;
  const n = items.length;
  const { rows, cols } = gridDims(n);
  const free = o.stimulus_layout === "free_positions_in_area";
  let plan: PagePlan | null = null;
  const ensure = (): PagePlan => {
    if (!plan) plan = planPage(ctx.jsPsych, o, items, state);
    return plan;
  };
  const windowRec = { value: null as number | null };
  const aria = (slot: number) => ctx.text.item_button_label({ position: slot + 1 });

  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS, PICK_CLASS, ...(free ? [cls("free")] : [])],
    stimulus: () => {
      ensure();
      return renderPickScreen(a.below ? a.below() : "");
    },
    choices: () => ensure().arrangement.map((i) => items[i].id),
    button_html: (_choice: string, slot: number) => {
      const p = ensure();
      return itemButtonHtml({
        item: items[p.arrangement[slot]],
        slot,
        n,
        aria_label: aria(slot),
        jitter: p.jitter?.[slot],
        disabled: p.disabled_slot === slot,
      });
    },
    button_layout: "grid",
    grid_columns: cols,
    grid_rows: rows,
    trial_duration: () => {
      windowRec.value =
        o.response_window_ms === null ? null : sampleDuration(ctx.jsPsych, o.response_window_ms);
      return windowRec.value;
    },
    data: baseData({
      phase: a.phase,
      part: a.part,
      set_size: n,
      stimulus_set: o.stimulus_set.items.name ?? "custom",
      stimulus_layout: o.stimulus_layout,
      rearrangement_rule: o.rearrangement_rule,
      response_device: o.response_device,
      ...a.data,
    }),
    on_load: () => {
      const g = document.getElementById("jspsych-html-button-response-btngroup");
      if (g) {
        g.style.setProperty("--cols", String(cols));
        g.style.setProperty("--rows", String(rows));
      }
    },
    // data-only simulation: a slot, from a participant with a memory that gets worse with set size
    simulation_options: () => {
      const p = ensure();
      const page = {
        arrangement: p.arrangement,
        picked: state.picked,
        disabled_slot: p.disabled_slot,
      };
      return {
        data: {
          response: a.simulateCorrect
            ? simulateCorrectPick(ctx.jsPsych, page)
            : simulateMemoryPick(ctx.jsPsych, page),
        },
      };
    },
    on_finish: (d: any) => {
      const p = ensure();
      delete d.stimulus;
      // a missed window has no RT (a simulated one keeps button index 0, so the RT is what tells)
      const timeout = typeof d.rt !== "number";
      const slot: number | null = timeout ? null : (d.response as number);
      const itemIndex = slot === null ? null : p.arrangement[slot];
      const item = itemIndex === null ? null : items[itemIndex];
      const repeat = itemIndex !== null && state.picked.has(itemIndex);
      const run = slot === null ? 0 : positionRun(state.slots, slot);
      const violation =
        slot !== null && o.position_repeat_rule !== "none" && run > o.position_repeat_max;
      const { row, col } = slot === null ? { row: null, col: null } : slotRowCol(slot, n);

      d.response = item ? item.id : null;
      if (timeout) d.rt = null;
      d.timeout = timeout;
      d.response_window = windowRec.value;
      d.chosen_item_id = item ? item.id : null;
      d.previous_item_id = state.prev_item;
      d.chosen_position = slot === null ? null : slot + 1;
      d.chosen_row = row;
      d.chosen_col = col;
      d.item_arrangement = p.arrangement.map((i) => items[i].id);
      if (p.jitter) d.item_offsets = p.jitter;
      d.disabled_position = p.disabled_slot === null ? null : p.disabled_slot + 1;
      d.n_picked_before = state.picked.size;
      d.is_repeat_error = repeat;
      d.correct = !timeout && !repeat;
      d.same_position_run = run;
      d.position_rule_violation = violation;

      const out: PickOutcome = {
        timeout,
        repeat,
        correct: !timeout && !repeat,
        violation,
        item_id: item ? item.id : null,
        slot,
      };
      if (itemIndex !== null && !repeat) state.picked.add(itemIndex);
      if (repeat) state.errors++;
      state.slots.push(slot);
      state.prev_item = item ? item.id : null;
      state.last = out;
      plan = null;
      a.onOutcome?.(d, out);
    },
  };
}

// -- series -----------------------------------------------------------------------------------------

export interface SeriesPlan {
  phase: Phase;
  block: number;
  /** 1-based position of the series in its block (the literature's "trial" number within a set size, for grouped orders). */
  trial_index_in_block: number;
  /** 1-based number of the series in its phase. */
  series: number;
  set_size: number;
  /** 1-based number of the series among those of its set size in the phase. */
  set_size_trial: number;
  n_series: number;
  items: Item[];
}

/**
 * One series: the page that opens it, then `set_size` pages, each with its blank, pick and (when configured)
 * feedback and reminder. The state of what has been picked is reset when the series starts.
 */
export function createSeries(ctx: Context, o: ResolvedOptions, s: SeriesPlan) {
  const t = ctx.text;
  const state = newSeriesState();
  const phase = s.phase;
  const rowData = {
    block: s.block,
    trial_index_in_block: s.trial_index_in_block,
    series: s.series,
    set_size_trial: s.set_size_trial,
  };
  const ti = textItems(ctx, o);
  const pages: any[] = [];
  for (let k = 0; k < s.set_size; k++) {
    const nodes: any[] = [];
    if (o.iti_ms !== 0) {
      const iti = sampleDuration(ctx.jsPsych, o.iti_ms);
      nodes.push(
        createDisplayTrial({
          phase,
          part: "iti",
          duration: iti,
          stage: "",
          data: { ...rowData, set_size: s.set_size, choice_index: k + 1, iti },
        })
      );
    }
    nodes.push(
      createPickTrial({
        ctx,
        o,
        items: s.items,
        state,
        phase,
        part: "response",
        data: { ...rowData, choice_index: k + 1 },
      })
    );
    if (o.trial_feedback === "accuracy") {
      const ms = sampleDuration(ctx.jsPsych, o.feedback_duration_ms);
      nodes.push({
        timeline: [
          {
            ...createDisplayTrial({
              phase,
              part: "feedback",
              duration: ms,
              stage: "",
              data: {
                ...rowData,
                set_size: s.set_size,
                choice_index: k + 1,
                feedback_kind: "accuracy",
                feedback_duration: ms,
              },
            }),
            stimulus: () =>
              renderScreen(
                renderNotice(
                  `<strong>${state.last?.repeat ? t.feedback_repeat : t.feedback_new}</strong>`,
                  state.last?.repeat ? "repeat" : "new"
                )
              ),
            on_finish: (d: any) => {
              delete d.stimulus;
              d.correct = state.last?.correct ?? null;
            },
          },
        ],
        conditional_function: () => state.last !== null && !state.last.timeout,
      });
    }
    if (o.position_repeat_rule === "detect_and_remind") {
      nodes.push({
        timeline: [
          textPage(
            ctx,
            t.position_reminder({
              noun: ti.noun,
              nouns: ti.nouns,
              position_max: o.position_repeat_max,
            }),
            phase,
            "reminder",
            { ...rowData, set_size: s.set_size, choice_index: k + 1 }
          ),
        ],
        conditional_function: () => state.last?.violation === true,
      });
    }
    pages.push({ timeline: nodes });
  }
  return {
    timeline: [
      textPage(
        ctx,
        t.series_intro({
          ...ti,
          phase,
          series: s.series,
          n_series: s.n_series,
          set_size: s.set_size,
        }),
        phase,
        "transition",
        { ...rowData, set_size: s.set_size }
      ),
      ...pages,
    ],
    on_timeline_start: () => {
      Object.assign(state, newSeriesState());
    },
  };
}

// -- phases -----------------------------------------------------------------------------------------

/** The series of one phase, in order: block structure, set sizes, counters. */
export function planSeries(ctx: Context, phase: Phase): SeriesPlan[] {
  const o = phase === "test" ? ctx.test : ctx.practice;
  let blocks: number[][];
  if (phase === "test") {
    blocks = scheduleBlocks(ctx.jsPsych, o.set_sizes, o.trials_per_condition, o.block_order);
  } else {
    blocks =
      o.practice_trials > 0 ? [practiceSetSizes(ctx.jsPsych, o.set_sizes, o.practice_trials)] : [];
  }
  const total = blocks.reduce((a, b) => a + b.length, 0);
  const perSize = new Map<number, number>();
  const plans: SeriesPlan[] = [];
  let series = 0;
  blocks.forEach((sizes, b) => {
    sizes.forEach((size, i) => {
      series++;
      const k = (perSize.get(size) ?? 0) + 1;
      perSize.set(size, k);
      const items = (phase === "test" ? ctx.items.test : ctx.items.practice).get(size);
      if (!items) throw new Error(`self-ordered-pointing: no items assigned to set size ${size}.`);
      plans.push({
        phase,
        block: b + 1,
        trial_index_in_block: i + 1,
        series,
        set_size: size,
        set_size_trial: k,
        n_series: total,
        items,
      });
    });
  });
  return plans;
}

export function createInstructions(ctx: Context) {
  const o = ctx.test;
  if (o.instruction_format === "experimenter") return { timeline: [] as any[] };
  const t = ctx.text;
  const a = instructionArgs(ctx, o);
  const pages = [t.instruction_intro(a), t.instruction_rule(a)];
  if (o.position_repeat_rule !== "none") pages.push(t.instruction_position_rule(a));
  if (o.response_window_ms !== null) pages.push(t.instruction_time_limit(a));
  return {
    timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction")),
  };
}

const phaseIntroArgs = (ctx: Context, o: ResolvedOptions, plans: SeriesPlan[], after: boolean) => ({
  ...textItems(ctx, o),
  n_series: plans.length,
  set_sizes: [...new Set(plans.map((p) => p.set_size))].sort((a, b) => a - b),
  feedback: o.trial_feedback === "accuracy",
  after_practice: after,
});

export function createPractice(ctx: Context) {
  const o = ctx.practice;
  const plans = planSeries(ctx, "practice");
  if (plans.length === 0) return [] as any[];
  const nodes: any[] = [];
  if (ctx.test.instruction_format === "text")
    nodes.push(
      textPage(
        ctx,
        ctx.text.practice_intro(phaseIntroArgs(ctx, o, plans, false)),
        "instructions",
        "instruction"
      )
    );
  nodes.push(...plans.map((p) => createSeries(ctx, o, p)));
  return nodes;
}

export function createTestIntro(ctx: Context, plans: SeriesPlan[] = planSeries(ctx, "test")) {
  return textPage(
    ctx,
    ctx.text.test_intro(phaseIntroArgs(ctx, ctx.test, plans, ctx.test.practice_trials > 0)),
    "instructions",
    "instruction"
  );
}

/** The test: one node per block, each holding its series. */
export function createTest(ctx: Context, plans: SeriesPlan[] = planSeries(ctx, "test")) {
  const blocks = new Map<number, SeriesPlan[]>();
  for (const p of plans) blocks.set(p.block, [...(blocks.get(p.block) ?? []), p]);
  return [...blocks.values()].map((b) => ({
    timeline: b.map((p) => createSeries(ctx, ctx.test, p)),
  }));
}

// -- walkthrough ------------------------------------------------------------------------------------

type StepName = "first" | "new" | "last";

/**
 * Interactive walkthrough (PACKAGE-STANDARD §6a): a set of three of the task's own items on the task's own grid,
 * real picks. A repeat gets a hint and the step repeats with the items moved again; after INSTRUCTION_MAX_ATTEMPTS the
 * unpicked item is shown and the walkthrough moves on. Rows: `phase: "instructions"`, `part: "instruction_check"`
 * (hints and confirmations `instruction_feedback`); never scored.
 */
export function createInstructionWalkthrough(ctx: Context) {
  const o = ctx.test;
  if (o.instruction_format !== "text" || o.instruction_demonstration !== "interactive")
    return { timeline: [] as any[] };
  const t = ctx.text;
  const items = ctx.items.walkthrough;
  const state = newSeriesState();
  // the walkthrough is untimed and has no position rule (PACKAGE-STANDARD §6a); the items, grid and response are the task's
  const wo: ResolvedOptions = { ...o, response_window_ms: null, position_repeat_rule: "none" };
  const ti = textItems(ctx, o);
  const stepArgs = (step: StepName): StepArgs => ({
    ...ti,
    step,
    set_size: items.length,
    n_picked: state.picked.size,
    partial_reshuffle: o.rearrangement_rule === "partial_reshuffle_each_page",
  });
  const stepNames: StepName[] = ["first", "new", "last"];
  const nodes: any[] = [textPage(ctx, t.instruction_demo_intro(ti), "instructions", "instruction")];
  for (const step of stepNames) {
    const st = { attempt: 0, correct: null as boolean | null };
    const again = () => st.correct === false && st.attempt < INSTRUCTION_MAX_ATTEMPTS;
    const pick = createPickTrial({
      ctx,
      o: wo,
      items,
      state,
      phase: "instructions",
      part: "instruction_check",
      data: { condition: step },
      below: () => textBlock(t.instruction_step(stepArgs(step))),
      simulateCorrect: true,
      onOutcome: (d, out) => {
        st.attempt++;
        st.correct = out.correct;
        d.attempt = st.attempt;
      },
    });
    const confirm = createDisplayTrial({
      phase: "instructions",
      part: "instruction_feedback",
      duration: INSTRUCTION_CORRECT_MS,
      stage: renderNotice(`<strong>${t.instruction_correct}</strong>`),
      data: { condition: step, feedback_kind: "correct" },
    });
    // hints and reveals put everything in the stage (a text region under it would have no room in a short window)
    const note = (stage: () => string, kind: string) => ({
      type: jsPsychHtmlButtonResponse,
      css_classes: [TASK_CLASS],
      stimulus: () => renderScreen(stage()),
      choices: [t.continue_button],
      data: baseData({
        phase: "instructions",
        part: "instruction_feedback",
        condition: step,
        feedback_kind: kind,
      }),
      on_finish: (d: any) => {
        delete d.stimulus;
      },
    });
    const reveal = note(() => {
      const left = items.findIndex((_, i) => !state.picked.has(i));
      return (
        `<div class="${cls("reveal")}"><div class="${cls("demo-item")}">${renderItem(
          items[left]
        )}</div>` +
        renderNotice(t.instruction_reveal(stepArgs(step))) +
        `</div>`
      );
    }, "reveal");
    const revealOnFinish = reveal.on_finish;
    reveal.on_finish = (d: any) => {
      // the answer was shown: count that item as picked so the walkthrough can go on
      const left = items.findIndex((_, i) => !state.picked.has(i));
      if (left >= 0) {
        state.picked.add(left);
        d.revealed_item_id = items[left].id;
      }
      revealOnFinish(d);
    };
    nodes.push({
      timeline: [
        pick,
        { timeline: [confirm], conditional_function: () => st.correct === true },
        {
          timeline: [note(() => renderNotice(t.instruction_hint(stepArgs(step))), "hint")],
          conditional_function: again,
        },
        {
          timeline: [reveal],
          conditional_function: () => st.correct === false && !again(),
        },
      ],
      on_timeline_start: () => {
        st.attempt = 0;
        st.correct = null;
      },
      loop_function: again,
    });
  }
  nodes.push(textPage(ctx, t.instruction_demo_done(ti), "instructions", "instruction"));
  return {
    timeline: nodes,
    on_timeline_start: () => {
      Object.assign(state, newSeriesState());
    },
  };
}

// -- completion ------------------------------------------------------------------------------------

export function createCompletion(ctx: Context) {
  const o = ctx.test;
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      let body = "";
      if (o.end_of_task_feedback === "score") {
        const s = calculateScores(ctx.jsPsych.data.get());
        body = ctx.text.result_summary({
          total_errors: s.total_errors,
          n_series: s.n_series,
          by_set_size: s.errors_by_set_size.map((x) => ({
            set_size: x.set_size,
            errors: x.errors,
          })),
        });
      }
      return textBlock(`<h2>${ctx.text.task_complete}</h2>${body}`);
    },
    choices: [ctx.text.continue_button],
    data: baseData({ phase: "completion", part: "completion" }),
    on_finish: (d: any) => {
      delete d.stimulus;
    },
  };
}

export type { DurationOrJitter };
