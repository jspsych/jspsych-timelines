import "./styles.css";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychVirtualChinrest from "@jspsych/plugin-virtual-chinrest";
import type { JsPsych } from "jspsych";

import {
  ATTENTION_CHECK_PROBES,
  CUE_DURATION_MS,
  DEFAULT_PX_PER_DEG,
  TASK_CLASS,
  TASK_NAME,
  VERSION,
} from "./constants";
import {
  DEFAULT_OPTIONS,
  FlankerOptions,
  ResolvedOptions,
  resolveOptions,
  validateOptions,
} from "./options";
import { Mapping, TrialSpec, buildTrialSpecs } from "./sequence";
import { Glyph, parseColors, renderArray, renderGlyph, renderStage, toPx } from "./stimuli";
import { TextConfig, defaultText } from "./text";

type Phase = "practice" | "test";

export interface Outcome {
  correct: boolean;
  timeout: boolean;
  rt: number | null;
  correct_label: string;
}

export interface Context {
  jsPsych: JsPsych;
  text: TextConfig;
  /** user options as given (for phase resolution) */
  user: FlankerOptions;
  practice: ResolvedOptions;
  test: ResolvedOptions;
  state: { last: Outcome | null; px_per_deg: number | null };
  /** group -> response index for a letter task, fixed per participant unless within_participant */
  base_mapping: Mapping;
}

export function createContext(jsPsych: JsPsych, options: FlankerOptions = {}): Context {
  const text: TextConfig = { ...defaultText, ...options.text };
  const test = resolveOptions(options, "test");
  const practice = resolveOptions(options, "practice");
  validateOptions(test);
  validateOptions(practice);
  const letters = test.stimulus_set.target !== "arrows";
  for (const o of [test, practice]) {
    const t = o.stimulus_set.target;
    if (t !== "arrows" && t !== undefined) {
      if (t.letters.length !== 2 || t.letters.some((g) => g.length !== o.targets_per_response)) {
        throw new Error(
          "flanker: stimulus_set.target.letters needs two groups, each with targets_per_response letters."
        );
      }
    } else if (o.targets_per_response !== 1) {
      throw new Error("flanker: targets_per_response 2 needs letters as target.");
    }
  }
  let response_of_group: [number, number] = [0, 1];
  if (letters && test.response_mapping_counterbalancing === "random_per_participant") {
    response_of_group = jsPsych.randomization.shuffle([0, 1]) as [number, number];
  }
  return {
    jsPsych,
    text,
    user: options,
    practice,
    test,
    state: { last: null, px_per_deg: null },
    base_mapping: { response_of_group },
  };
}

// -- helpers ------------------------------------------------------------------------------------

const baseData = (extra: Record<string, unknown>) => ({
  task: TASK_NAME,
  task_version: VERSION,
  ...extra,
});

function isKeyboard(o: ResolvedOptions) {
  return o.response_device === "keyboard";
}

function mappingFor(ctx: Context, phase: Phase, block: number): Mapping {
  const o = ctx.test;
  if (o.stimulus_set.target === "arrows") return { response_of_group: [0, 1] };
  const [a, b] = ctx.base_mapping.response_of_group;
  if (
    o.response_mapping_counterbalancing === "within_participant" &&
    phase === "test" &&
    block % 2 === 0
  ) {
    return { response_of_group: [b, a] };
  }
  return { response_of_group: [a, b] };
}

function groupText(o: ResolvedOptions, g: 0 | 1): string {
  const t = o.stimulus_set.target;
  if (t === "arrows" || t === undefined) return g === 0 ? "left" : "right";
  return t.letters[g].join(" / ");
}

function groupHtml(o: ResolvedOptions, g: 0 | 1, size = 28): string {
  const t = o.stimulus_set.target;
  if (t === "arrows" || t === undefined) return renderGlyph(g === 0 ? "left" : "right", size);
  return `<strong>${t.letters[g].join(" / ")}</strong>`;
}

/** Labels of the two responses: key names or button labels (response index order). */
function responseLabels(ctx: Context, o: ResolvedOptions, mapping: Mapping): [string, string] {
  const labels: [string, string] = ["", ""];
  ([0, 1] as const).forEach((g) => {
    const r = mapping.response_of_group[g];
    if (isKeyboard(o)) {
      labels[r] = o.response_keys[r];
    } else if (o.stimulus_set.target === "arrows" || o.stimulus_set.target === undefined) {
      labels[r] = r === 0 ? ctx.text.left_button : ctx.text.right_button;
    } else {
      labels[r] = groupText(o, g);
    }
  });
  return labels;
}

function pxPerDeg(ctx: Context): number {
  return ctx.state.px_per_deg ?? DEFAULT_PX_PER_DEG;
}

function viewportHeight(): number {
  return typeof window !== "undefined" ? window.innerHeight : 768;
}

// -- display (no-response) trials --------------------------------------------------------------

interface DisplayArgs {
  ctx: Context;
  o: ResolvedOptions;
  phase: string;
  part: string;
  block?: number;
  stimulus: string | (() => string);
  duration: number;
  data?: Record<string, unknown>;
}

/**
 * No-response display trial (fixation, cue, ITI, feedback): the keyboard plugin with
 * `choices: "NO_KEYS"` and a fixed duration, whatever the response device (PACKAGE-STANDARD §10).
 */
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
    },
  };
}

export function createFixation(
  ctx: Context,
  o: ResolvedOptions,
  phase: Phase,
  block: number,
  ms: number
) {
  const { fg, bg } = parseColors(o.stimulus_color);
  return createDisplayTrial({
    ctx,
    o,
    phase,
    part: "fixation",
    block,
    duration: ms,
    stimulus: renderStage(
      `<span class="jspsych-timelines-flanker-fixation">${ctx.text.fixation}</span>`,
      fg,
      bg
    ),
    data: { fixation_duration: ms },
  });
}

export function createCue(ctx: Context, o: ResolvedOptions, phase: Phase, block: number) {
  const { fg, bg } = parseColors(o.stimulus_color);
  const interval = o.cue_target_interval_ms;
  const cueMs = Math.min(CUE_DURATION_MS, interval);
  const fix = `<span class="jspsych-timelines-flanker-fixation">${ctx.text.fixation}</span>`;
  const nodes: any[] = [
    createDisplayTrial({
      ctx,
      o,
      phase,
      part: "cue",
      block,
      duration: cueMs,
      stimulus: renderStage(
        `<div class="jspsych-timelines-flanker-cue"><span class="dot"></span>${fix}<span class="dot"></span></div>`,
        fg,
        bg
      ),
      data: { cue_target_interval: interval },
    }),
  ];
  if (interval > cueMs) {
    nodes.push(
      createDisplayTrial({
        ctx,
        o,
        phase,
        part: "cue",
        block,
        duration: interval - cueMs,
        stimulus: renderStage(fix, fg, bg),
        data: { cue_gap: true, cue_target_interval: interval },
      })
    );
  }
  return nodes;
}

export function createIti(ctx: Context, o: ResolvedOptions, phase: Phase, block: number) {
  const { fg, bg } = parseColors(o.stimulus_color);
  return createDisplayTrial({
    ctx,
    o,
    phase,
    part: "iti",
    block,
    duration: o.iti_ms,
    stimulus: renderStage("", fg, bg),
  });
}

// -- stimulus array ---------------------------------------------------------------------------

function arrayHtml(
  ctx: Context,
  o: ResolvedOptions,
  spec: TrialSpec,
  hide: "flankers" | "target" | null
): string {
  const { fg, bg } = parseColors(o.stimulus_color);
  const ppd = pxPerDeg(ctx);
  const size = toPx(o.stimulus_size.value, o.stimulus_size.unit, ppd, viewportHeight());
  const gap = toPx(spec.gap, spec.gap_unit, ppd, viewportHeight());
  const pos = o.stimulus_layout.array_position ?? "centre_at_fixation";
  const offset = pos === "above_fixation" ? -2 * size : pos === "below_fixation" ? 2 * size : 0;
  return renderArray({
    flankers: new Array(spec.per_side).fill(spec.flanker as Glyph),
    target: spec.target,
    size_px: size,
    gap_px: gap,
    orientation: o.stimulus_layout.orientation ?? "horizontal",
    offset_px: offset,
    fg,
    bg,
    hide,
  });
}

export function createPreview(
  ctx: Context,
  o: ResolvedOptions,
  spec: TrialSpec,
  phase: Phase,
  block: number
) {
  const soa = o.soa_ms;
  return createDisplayTrial({
    ctx,
    o,
    phase,
    part: "preview",
    block,
    duration: Math.abs(soa),
    stimulus: () => arrayHtml(ctx, o, spec, soa < 0 ? "target" : "flankers"),
    data: { flanker_target_soa: soa },
  });
}

/** The scorable trial: one row per trial with `phase`, `part: "response"`. */
export function createResponseTrial(
  ctx: Context,
  o: ResolvedOptions,
  spec: TrialSpec,
  phase: Phase,
  block: number,
  trialInBlock: number
) {
  const mapping = mappingFor(ctx, phase, block);
  const labels = responseLabels(ctx, o, mapping);
  const keyboard = isKeyboard(o);
  const nogo = spec.congruency === "nogo";
  const correctIndex = mapping.response_of_group[spec.group];
  const correctResponse: string | number | null = nogo
    ? null
    : keyboard
    ? o.response_keys[correctIndex]
    : correctIndex;
  const flankerLabel = spec.flanker;
  const targetLabel = spec.target;

  const data = baseData({
    phase,
    part: "response",
    block,
    trial_in_block: trialInBlock,
    congruency: spec.congruency,
    flanker_condition: spec.flanker_condition,
    target: targetLabel,
    flankers: flankerLabel,
    flankers_per_side: spec.per_side,
    correct_response: correctResponse,
    flanker_distance: spec.gap,
    flanker_distance_unit: spec.gap_unit,
    flanker_target_soa: o.soa_ms,
    stimulus_duration: o.stimulus_duration_ms,
    response_window: o.response_window_ms,
    cued: spec.cued,
    cue_target_interval: spec.cued ? o.cue_target_interval_ms : 0,
    response_device: o.response_device,
  });

  const onFinish = (d: any) => {
    const timeout = d.response === null || d.response === undefined;
    let correct: boolean;
    if (nogo) correct = timeout;
    else if (timeout) correct = false;
    else if (keyboard)
      correct = String(d.response).toLowerCase() === String(correctResponse).toLowerCase();
    else correct = d.response === correctResponse;
    delete d.stimulus;
    d.timeout = timeout;
    d.correct = correct;
    ctx.state.last = {
      correct,
      timeout,
      rt: timeout ? null : d.rt,
      correct_label: nogo ? "" : labels[correctIndex],
    };
  };

  const common = {
    css_classes: [TASK_CLASS],
    stimulus: () => arrayHtml(ctx, o, spec, null),
    stimulus_duration: o.stimulus_duration_ms,
    trial_duration: o.response_window_ms,
    data,
    on_finish: onFinish,
  };
  if (keyboard) {
    return { type: jsPsychHtmlKeyboardResponse, choices: [...o.response_keys], ...common };
  }
  return {
    type: jsPsychHtmlButtonResponse,
    choices: [...labels],
    button_html: (choice: string) => `<button class="jspsych-btn">${choice}</button>`,
    response_ends_trial: true,
    ...common,
  };
}

// -- feedback ---------------------------------------------------------------------------------

export function feedbackText(ctx: Context, o: ResolvedOptions, out: Outcome): string {
  const t = ctx.text;
  const acc = out.timeout
    ? t.timeout_feedback
    : out.correct
    ? t.correct_feedback
    : t.incorrect_feedback;
  switch (o.trial_feedback) {
    case "accuracy":
      return acc;
    case "rt":
      return out.rt !== null ? t.feedback_rt({ rt: out.rt }) : t.timeout_feedback;
    case "accuracy_rt":
      return out.rt !== null ? `${acc} — ${t.feedback_rt({ rt: out.rt })}` : acc;
    case "correct_answer":
      return out.correct || out.correct_label === ""
        ? acc
        : `${acc}. ${t.feedback_correct_answer({ answer: out.correct_label })}`;
    default:
      return "";
  }
}

export function shouldShowFeedback(o: ResolvedOptions, out: Outcome | null): boolean {
  if (o.trial_feedback === "none" || out === null) return false;
  switch (o.feedback_condition) {
    case "errors_only":
      return !out.correct;
    case "correct_only":
      return out.correct;
    default:
      return true;
  }
}

export function createFeedback(ctx: Context, o: ResolvedOptions, phase: Phase, block: number) {
  const { fg, bg } = parseColors(o.stimulus_color);
  const trial: any = createDisplayTrial({
    ctx,
    o,
    phase,
    part: "feedback",
    block,
    duration: o.feedback_duration_ms,
    stimulus: () => {
      const out = ctx.state.last!;
      const cls = out.timeout ? "timeout" : out.correct ? "correct" : "incorrect";
      return renderStage(
        `<div class="jspsych-timelines-flanker-feedback ${cls}">${feedbackText(ctx, o, out)}</div>`,
        fg,
        bg
      );
    },
  });
  trial.data.feedback_kind = o.trial_feedback;
  trial.data.feedback_condition = o.feedback_condition;
  const strip = trial.on_finish;
  trial.on_finish = (d: any) => {
    strip(d);
    d.feedback_text = feedbackText(ctx, o, ctx.state.last!);
  };
  return { timeline: [trial], conditional_function: () => shouldShowFeedback(o, ctx.state.last) };
}

// -- trial and block ---------------------------------------------------------------------------

/** All trials of one stimulus presentation: fixation, cue, preview, response, feedback, ITI. */
export function createTrialSequence(
  ctx: Context,
  o: ResolvedOptions,
  spec: TrialSpec,
  phase: Phase,
  block: number,
  trialInBlock: number
) {
  const tl: any[] = [];
  if (spec.fixation_ms > 0) tl.push(createFixation(ctx, o, phase, block, spec.fixation_ms));
  if (spec.cued) tl.push(...createCue(ctx, o, phase, block));
  if (o.soa_ms !== 0) tl.push(createPreview(ctx, o, spec, phase, block));
  tl.push(createResponseTrial(ctx, o, spec, phase, block, trialInBlock));
  if (o.trial_feedback !== "none") tl.push(createFeedback(ctx, o, phase, block));
  if (o.iti_ms > 0) tl.push(createIti(ctx, o, phase, block));
  return { timeline: tl };
}

export function createBlock(ctx: Context, phase: Phase, block: number, nTrials: number) {
  const o = phase === "practice" ? ctx.practice : ctx.test;
  const specs = buildTrialSpecs({ jsPsych: ctx.jsPsych, o }, nTrials);
  return {
    timeline: specs.map((s, i) => createTrialSequence(ctx, o, s, phase, block, i + 1)),
  };
}

/** Split `total` into `parts` near-equal integers; the remainder goes to the first blocks. */
export function splitTrials(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const extra = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
}

// -- instructions and transitions ----------------------------------------------------------------

function textPage(ctx: Context, html: string, phase: string, part: string, label?: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: `<div class="jspsych-timelines-flanker-text">${html}</div>`,
    choices: [label ?? ctx.text.continue_button],
    data: baseData({ phase, part }),
  };
}

export function createTransition(ctx: Context, html: string, phase: string, part = "transition") {
  return textPage(ctx, `<p>${html}</p>`, phase, part);
}

export function createInstructions(ctx: Context) {
  const o = ctx.test;
  if (o.instruction_format === "experimenter") return { timeline: [] as any[] };
  const t = ctx.text;
  const letters = o.stimulus_set.target !== "arrows";
  const mapping = mappingFor(ctx, "test", 1);
  const labels = responseLabels(ctx, o, mapping);
  // left/right response index order -> which target group
  const groupOfResponse = (r: number): 0 | 1 => (mapping.response_of_group[0] === r ? 0 : 1);
  const keyLabel = (r: number) =>
    isKeyboard(o)
      ? `<kbd>${o.response_keys[r] === " " ? "space" : o.response_keys[r]}</kbd>`
      : labels[r];
  const pages: string[] = [];
  pages.push(letters ? t.instruction_intro_letters : t.instruction_intro_arrows);
  const emphasis =
    o.speed_accuracy_emphasis === "speed"
      ? t.emphasis_speed
      : o.speed_accuracy_emphasis === "accuracy"
      ? t.emphasis_accuracy
      : o.speed_accuracy_emphasis === "both"
      ? t.emphasis_both
      : "";
  const hand =
    o.response_hand === "one_hand_dominant"
      ? t.hand_one_hand_dominant
      : t.hand_two_hands_index_fingers;
  pages.push(
    t.instruction_response({
      device: o.response_device as "keyboard" | "mouse" | "touch",
      left_response: keyLabel(0),
      right_response: keyLabel(1),
      left_target: groupHtml(o, groupOfResponse(0)),
      right_target: groupHtml(o, groupOfResponse(1)),
    }) +
      (isKeyboard(o) ? `<p>${hand}</p>` : "") +
      (emphasis ? `<p>${emphasis}</p>` : "")
  );
  const timeline = pages.map((p) => textPage(ctx, p, "instructions", "instruction"));
  return { timeline };
}

export function createPracticeIntro(ctx: Context) {
  return textPage(ctx, ctx.text.instruction_practice_intro, "instructions", "instruction");
}

export function createTestIntro(ctx: Context) {
  return textPage(ctx, ctx.text.instruction_test_intro, "instructions", "instruction");
}

// -- block feedback, breaks ----------------------------------------------------------------------

export function createBlockFeedback(ctx: Context, block: number) {
  const o = ctx.test;
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      const rows = ctx.jsPsych.data
        .get()
        .filter({ task: TASK_NAME, phase: "test", part: "response", block });
      const n = rows.count();
      const correct = rows.filter({ correct: true });
      const rts = correct.filterCustom((t: any) => t.congruency !== "nogo").select("rt");
      return `<div class="jspsych-timelines-flanker-text">${ctx.text.block_feedback({
        block,
        n_blocks: o.n_blocks,
        accuracy: n > 0 ? correct.count() / n : 0,
        mean_rt: rts.count() > 0 ? rts.mean() : null,
        kind: o.block_feedback as "accuracy" | "rt" | "accuracy_rt" | "progress",
      })}</div>`;
    },
    choices: [ctx.text.continue_button],
    data: baseData({ phase: "test", part: "block_feedback", block }),
  };
}

export function createRestBreak(ctx: Context, block: number) {
  return {
    ...textPage(ctx, `<p>${ctx.text.block_complete(block)}</p>`, "test", "rest"),
    data: baseData({ phase: "test", part: "rest", block }),
  };
}

// -- checks ------------------------------------------------------------------------------------

export function createAttentionChecks(ctx: Context) {
  const o = ctx.test;
  const probes: any[] = [];
  const mapping = mappingFor(ctx, "test", 1);
  const labels = responseLabels(ctx, o, mapping);
  for (let i = 0; i < ATTENTION_CHECK_PROBES; i++) {
    const r = i % 2; // alternate between the two responses
    const key = o.response_keys[r];
    const common = {
      css_classes: [TASK_CLASS],
      stimulus: `<div class="jspsych-timelines-flanker-text">${ctx.text.attention_check_prompt({
        response_label: labels[r],
      })}</div>`,
      data: baseData({
        phase: "instructions",
        part: "attention_check",
        probe: i + 1,
        correct_response: isKeyboard(o) ? key : r,
      }),
      on_finish: (d: any) => {
        d.correct = isKeyboard(o)
          ? String(d.response).toLowerCase() === key.toLowerCase()
          : d.response === r;
      },
    };
    probes.push(
      isKeyboard(o)
        ? { type: jsPsychHtmlKeyboardResponse, choices: [...o.response_keys], ...common }
        : { type: jsPsychHtmlButtonResponse, choices: [...labels], ...common }
    );
  }
  return { timeline: probes };
}

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

export function createCalibration(ctx: Context) {
  const card = ctx.test.screen_calibration === "credit_card";
  return {
    type: jsPsychVirtualChinrest,
    css_classes: [TASK_CLASS],
    blindspot_reps: card ? 0 : 5,
    resize_units: "none" as const,
    data: baseData({
      phase: "instructions",
      part: "calibration",
      calibration: ctx.test.screen_calibration,
    }),
    on_finish: (d: any) => {
      // px per degree: measured with the blind spot, or from the card width assuming 57 cm viewing distance
      if (typeof d.px2deg === "number") ctx.state.px_per_deg = d.px2deg;
      else if (typeof d.px2mm === "number") ctx.state.px_per_deg = d.px2mm * 9.96;
    },
  };
}

// -- completion --------------------------------------------------------------------------------

export function createCompletion(ctx: Context, calculate: (data: any) => any) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [TASK_CLASS],
    stimulus: () => {
      const s = calculate(ctx.jsPsych.data.get());
      return `<div class="jspsych-timelines-flanker-text"><h2>${
        ctx.text.task_complete
      }</h2>${ctx.text.result_summary({
        accuracy: s.accuracy,
        mean_rt: s.mean_rt,
        flanker_effect_rt: s.flanker_effect_rt,
      })}</div>`;
    },
    choices: [ctx.text.continue_button],
    data: baseData({ phase: "completion", part: "completion" }),
  };
}

export { DEFAULT_OPTIONS };
