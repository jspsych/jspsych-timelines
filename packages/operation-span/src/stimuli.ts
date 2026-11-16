/**
 * Stimulus generation and rendering. Everything a participant sees is drawn here, by the same
 * functions in the task and in the walkthrough (PACKAGE-STANDARD §6a).
 */
import type { JsPsych } from "jspsych";

import { DIGITS, GRID_COLUMNS, LETTERS, TASK_CLASS } from "./constants";
import type { ResolvedOptions } from "./options";
import type { TextConfig } from "./text";

export const cls = (name: string) => `${TASK_CLASS}-${name}`;

// -- processing problems -----------------------------------------------------------------------

export interface Problem {
  /** The problem as shown, e.g. "(2 × 3) + 1". */
  text: string;
  /** Its value. */
  value: number;
  /** The proposed answer. */
  shown: number;
  /** Whether the proposed answer is the value. */
  is_true: boolean;
}

/**
 * An Engle-lab style problem, "(a op b) op c", with a proposed answer that is correct on half the
 * problems and otherwise 1 or 2 away from the value. Integer intermediate results; values are never negative.
 */
export function generateProblem(jsPsych: JsPsych, isTrue?: boolean): Problem {
  const r = jsPsych.randomization;
  const op1 = r.sampleWithoutReplacement(["×", "÷", "+", "−"], 1)[0];
  let a: number, b: number, v1: number;
  if (op1 === "×") {
    a = r.randomInt(1, 9);
    b = r.randomInt(1, 9);
    v1 = a * b;
  } else if (op1 === "÷") {
    b = r.randomInt(2, 9);
    v1 = r.randomInt(1, 9);
    a = b * v1;
  } else if (op1 === "+") {
    a = r.randomInt(1, 9);
    b = r.randomInt(1, 9);
    v1 = a + b;
  } else {
    a = r.randomInt(2, 9);
    b = r.randomInt(1, a - 1);
    v1 = a - b;
  }
  const op2 = r.sampleWithoutReplacement(["+", "−"], 1)[0];
  const c = op2 === "+" ? r.randomInt(1, 9) : r.randomInt(1, Math.min(9, v1));
  const value = op2 === "+" ? v1 + c : v1 - c;
  const truth = isTrue ?? r.sampleBernoulli(0.5) === 1;
  let shown = value;
  if (!truth) {
    const offsets = [-2, -1, 1, 2].filter((d) => value + d >= 0);
    shown = value + r.sampleWithoutReplacement(offsets, 1)[0];
  }
  return { text: `(${a} ${op1} ${b}) ${op2} ${c}`, value, shown, is_true: truth };
}

// -- memoranda -----------------------------------------------------------------------------------

/** The pool memoranda are drawn from. */
export function memorandumPool(o: ResolvedOptions): string[] {
  const m = o.stimulus_set.memorandum ?? "letters";
  if (m === "letters") return [...LETTERS];
  if (m === "digits") return [...DIGITS];
  return [...m.words];
}

/** `n` different memoranda in random order. */
export function drawMemoranda(jsPsych: JsPsych, o: ResolvedOptions, n: number): string[] {
  return jsPsych.randomization.sampleWithoutReplacement(memorandumPool(o), n);
}

// -- screens -------------------------------------------------------------------------------------

/**
 * One task screen. The stage is the anchored element (PACKAGE-STANDARD §5): it is always centred on
 * the display, whatever else is on the screen; text and the plugin's button group go below it.
 * `wide` is the recall panel, a taller stage on the same centre.
 */
export function renderScreen(stage: string, below = "", wide = false): string {
  return (
    `<div class="${cls("screen")}${wide ? ` ${cls("screen-recall")}` : ""}">` +
    `<div class="${cls("stage")}">${stage}</div>` +
    (below ? `<div class="${cls("below")}">${below}</div>` : "") +
    `</div>`
  );
}

export const textBlock = (html: string) => `<div class="${cls("text")}">${html}</div>`;

export const renderProblem = (p: Problem, withAnswer: boolean): string =>
  `<div class="${cls("problem")}">${p.text} ${
    withAnswer ? `= <strong>${p.shown}</strong> ?` : "= ?"
  }</div>`;

export const renderAnswer = (p: Problem): string =>
  `<div class="${cls("problem")}"><strong>${p.shown}</strong></div>`;

export const renderMemorandum = (item: string): string =>
  `<div class="${cls("memorandum")}">${item}</div>`;

export const renderNotice = (html: string, kind = ""): string =>
  `<div class="${cls("notice")} ${kind}">${html}</div>`;

// -- key names -----------------------------------------------------------------------------------

/** How a key is named to the participant: letters in capitals, named keys in words. */
const KEY_NAMES: Record<string, string> = {
  " ": "space",
  ArrowLeft: "left arrow",
  ArrowRight: "right arrow",
  ArrowUp: "up arrow",
  ArrowDown: "down arrow",
  Enter: "Enter",
};

export function keyName(key: string): string {
  return KEY_NAMES[key] ?? (key.length === 1 ? key.toUpperCase() : key);
}

// -- recall -------------------------------------------------------------------------------------

export interface RecallSpec {
  format: "n_afc" | "free_text" | "single_response";
  order: "serial" | "free";
  omission: "blank_button" | "none" | "question_mark_key" | "skip_button";
  set_size: number;
  /** The pool shown in the matrix (n_afc). */
  pool: string[];
}

/** Recall panel (the stage of a recall screen): prompt, entered items, input. */
export function renderRecallPanel(spec: RecallSpec, text: TextConfig): string {
  const prompt = `<div class="${cls("recall-prompt")}">${text.recall_prompt({
    format: spec.format,
    order: spec.order,
    set_size: spec.set_size,
  })}</div>`;
  const blankLabel = spec.omission === "skip_button" ? text.skip_button : text.blank_button;
  const blankButton =
    spec.omission === "blank_button" || spec.omission === "skip_button"
      ? `<button type="button" class="${cls("control")}" data-action="blank">${blankLabel}</button>`
      : "";
  const clearButton = `<button type="button" class="${cls("control")}" data-action="clear">${
    text.clear_button
  }</button>`;
  if (spec.format === "free_text") {
    const boxes = Array.from(
      { length: spec.set_size },
      (_, i) =>
        `<input type="text" class="${cls(
          "box"
        )}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${text.recall_box_label(
          { position: i + 1 }
        )}" data-i="${i}">`
    ).join("");
    return `<div class="${cls("recall")}">${prompt}<div class="${cls("boxes")}">${boxes}</div>${
      blankButton ? `<div class="${cls("controls")}">${blankButton}</div>` : ""
    }</div>`;
  }
  const slots = Array.from(
    { length: spec.set_size },
    (_, i) => `<span class="${cls("slot")}" data-i="${i}">&nbsp;</span>`
  ).join("");
  const grid =
    spec.format === "n_afc"
      ? `<div class="${cls(
          "grid"
        )}" style="grid-template-columns: repeat(${GRID_COLUMNS}, minmax(0, 1fr));">${spec.pool
          .map((x) => `<button type="button" class="${cls("key")}" data-item="${x}">${x}</button>`)
          .join("")}</div>`
      : "";
  return `<div class="${cls("recall")}">${prompt}<div class="${cls(
    "slots"
  )}">${slots}</div>${grid}<div class="${cls(
    "controls"
  )}">${blankButton}${clearButton}</div></div>`;
}

/** What the recall wiring keeps while a recall screen is on. */
export interface RecallState {
  /** The entered items so far (null = a blank), for the matrix and key-press formats. */
  items: (string | null)[];
  /** Typed formats read the boxes at the end. */
  read: (() => (string | null)[]) | null;
  /** True once the screen was wired (it was shown in a browser; a data-only simulation never wires it). */
  wired: boolean;
  /** True once the participant has touched the input. */
  touched: boolean;
  cleanup: (() => void) | null;
}

export const newRecallState = (): RecallState => ({
  items: [],
  read: null,
  wired: false,
  touched: false,
  cleanup: null,
});

const norm = (x: unknown) =>
  String(x ?? "")
    .trim()
    .toLowerCase();

/** Final entered items: one per memorandum, null for an omission. */
export function finalItems(state: RecallState, spec: RecallSpec): (string | null)[] {
  const raw = state.read ? state.read() : state.items;
  return Array.from({ length: spec.set_size }, (_, i) => {
    const v = raw[i];
    return v === undefined || v === null || norm(v) === "" || norm(v) === "?"
      ? null
      : String(v).trim();
  });
}

/**
 * Wire the recall panel after the screen is on (`on_load`). The plugin's button group holds the Done
 * button; this enables and disables it and, for key-press recall, presses it when the last item is in.
 */
export function wireRecall(state: RecallState, spec: RecallSpec): void {
  const root = document.querySelector(`.${cls("recall")}`) as HTMLElement | null;
  if (!root) return;
  state.wired = true;
  const done = document.querySelector(
    "#jspsych-html-button-response-btngroup button"
  ) as HTMLButtonElement | null;
  const needsAll = spec.omission === "none";
  const filled = () =>
    (state.read ? state.read() : state.items).filter((x) => x !== null && norm(x) !== "").length;
  const refreshDone = () => {
    if (done) done.disabled = needsAll && filled() < spec.set_size;
  };
  refreshDone();
  state.touched = false;
  const cleanups: Array<() => void> = [];

  if (spec.format === "free_text") {
    const boxes = Array.from(root.querySelectorAll<HTMLInputElement>(`.${cls("box")}`));
    state.read = () => boxes.map((b) => b.value);
    boxes[0]?.focus();
    boxes.forEach((b, i) => {
      b.addEventListener("input", () => {
        state.touched = true;
        refreshDone();
      });
      b.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (i < boxes.length - 1) boxes[i + 1].focus();
          else if (done && !done.disabled) done.click();
        }
      });
    });
    root.querySelector('[data-action="blank"]')?.addEventListener("click", () => {
      state.touched = true;
      const active = boxes.findIndex((b) => b === document.activeElement);
      const next = boxes[Math.min((active < 0 ? 0 : active) + 1, boxes.length - 1)];
      next?.focus();
    });
  } else {
    state.items = [];
    const slots = Array.from(root.querySelectorAll<HTMLElement>(`.${cls("slot")}`));
    const keys = Array.from(root.querySelectorAll<HTMLButtonElement>(`.${cls("key")}`));
    const paint = () => {
      slots.forEach((s, i) => {
        const v = state.items[i];
        s.innerHTML = v === undefined ? "&nbsp;" : v === null ? "&mdash;" : v;
        s.classList.toggle("filled", v !== undefined);
      });
      const used = new Set(state.items.filter((x): x is string => x !== null).map(norm));
      keys.forEach((k) => {
        k.disabled = used.has(norm(k.dataset.item)) || state.items.length >= spec.set_size;
      });
      refreshDone();
    };
    const push = (v: string | null) => {
      if (state.items.length >= spec.set_size) return;
      state.touched = true;
      state.items.push(v);
      paint();
      if (spec.format === "single_response" && state.items.length >= spec.set_size) done?.click();
    };
    keys.forEach((k) => k.addEventListener("click", () => push(k.dataset.item ?? null)));
    root.querySelector('[data-action="blank"]')?.addEventListener("click", () => push(null));
    root.querySelector('[data-action="clear"]')?.addEventListener("click", () => {
      state.touched = true;
      state.items = [];
      paint();
    });
    if (spec.format === "single_response") {
      const pool = new Map(spec.pool.map((x) => [norm(x), x]));
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Backspace") {
          state.items.pop();
          paint();
        } else if (e.key === "?" && spec.omission === "question_mark_key") push(null);
        else if (pool.has(norm(e.key)) && !state.items.some((x) => norm(x) === norm(e.key)))
          push(pool.get(norm(e.key))!);
      };
      document.addEventListener("keydown", onKey);
      cleanups.push(() => document.removeEventListener("keydown", onKey));
    }
    paint();
  }
  state.cleanup = () => cleanups.forEach((f) => f());
}
