/**
 * Items, grids and arrangements. Everything the screens draw comes from here, so the walkthrough, practice
 * and test render items and take picks with the same code.
 */
import type { JsPsych } from "jspsych";

import { PICK_CLASS, TASK_CLASS } from "./constants";
import type { DurationOrJitter, ResolvedOptions } from "./options";
import type { Item } from "./sets";

export const cls = (name: string) => `${TASK_CLASS}-${name}`;

// -- items ----------------------------------------------------------------------------------------

export type { Item } from "./sets";
export { buildPool, itemNouns } from "./sets";

/** Which items each context (walkthrough, practice size, test size) gets. */
export interface ItemAssignment {
  walkthrough: Item[];
  practice: Map<number, Item[]>;
  test: Map<number, Item[]>;
}

/**
 * Assign items from the pool. "nested_first_n": every set is the first N of the pool. "distinct_per_set_size":
 * consecutive slices, one per context, so no item appears in two set sizes (and practice and walkthrough
 * never share items with the test).
 */
export function assignItems(
  pool: Item[],
  rule: "nested_first_n" | "distinct_per_set_size",
  walkthroughSize: number,
  practiceSizes: number[],
  testSizes: number[]
): ItemAssignment {
  const out: ItemAssignment = { walkthrough: [], practice: new Map(), test: new Map() };
  let at = 0;
  const take = (n: number) => {
    if (rule === "nested_first_n") return pool.slice(0, n);
    const slice = pool.slice(at, at + n);
    at += n;
    return slice;
  };
  if (walkthroughSize > 0) out.walkthrough = take(walkthroughSize);
  for (const n of new Set(practiceSizes)) out.practice.set(n, take(n));
  for (const n of new Set(testSizes)) out.test.set(n, take(n));
  return out;
}

// -- grid -----------------------------------------------------------------------------------------

const ROWS: Record<number, number> = {
  2: 1,
  3: 1,
  4: 2,
  5: 2,
  6: 2,
  7: 2,
  8: 2,
  9: 3,
  10: 2,
  11: 3,
  12: 3,
};

/** Rows and columns of the grid for `n` items: 6 -> 2 x 3, 8 -> 2 x 4, 10 -> 2 x 5, 12 -> 3 x 4. */
export function gridDims(n: number): { rows: number; cols: number } {
  const rows = ROWS[n] ?? Math.ceil(n / 5);
  return { rows, cols: Math.ceil(n / rows) };
}

/** 1-based row and column of a 0-based slot. */
export function slotRowCol(slot: number, n: number): { row: number; col: number } {
  const { cols } = gridDims(n);
  return { row: Math.floor(slot / cols) + 1, col: (slot % cols) + 1 };
}

// -- arrangements ----------------------------------------------------------------------------------

/** An arrangement lists, for each slot, the index of the item (into the series' items) that sits there. */
export type Arrangement = number[];

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const sameArrangement = (a: Arrangement, b: Arrangement) => a.every((x, i) => x === b[i]);

/**
 * The arrangement of the next page. First page of a series: a random order. "full_reshuffle_each_page":
 * a new random order that is never the one before (if the draw repeats it, it is rotated by one slot).
 * "partial_reshuffle_each_page": `proportion` of the slots (at least two) are picked at random and their
 * items move one place along a cycle, so each moves; the rest stay where they were.
 */
export function nextArrangement(
  jsPsych: JsPsych,
  n: number,
  rule: ResolvedOptions["rearrangement_rule"],
  proportion: number,
  prev: Arrangement | null
): Arrangement {
  const r = jsPsych.randomization;
  if (rule === "partial_reshuffle_each_page" && prev) {
    const k = Math.min(n, Math.max(2, Math.round(n * proportion)));
    const slots: number[] = r.sampleWithoutReplacement(range(n), k);
    const next = [...prev];
    slots.forEach((s, j) => {
      next[s] = prev[slots[(j + 1) % k]];
    });
    return next;
  }
  const fresh: Arrangement = r.shuffle(range(n));
  if (prev && sameArrangement(fresh, prev)) return [...fresh.slice(1), fresh[0]];
  return fresh;
}

/** A position inside a cell, as fractions (0-1) of the free space the item has in it. */
export interface Jitter {
  u: number;
  v: number;
}

/** Random offsets of each item inside its own cell (for the free-positions layout). */
export function drawJitter(jsPsych: JsPsych, n: number): Jitter[] {
  const f = () => jsPsych.randomization.randomInt(0, 100) / 100;
  return range(n).map(() => ({ u: f(), v: f() }));
}

/** Draw a duration: the number itself, or a uniform draw from the jitter range (PACKAGE-STANDARD §2a). */
export function sampleDuration(jsPsych: JsPsych, v: DurationOrJitter): number {
  if (typeof v === "number") return v;
  const step = v.step && v.step > 0 ? v.step : 1;
  return (
    v.min + jsPsych.randomization.randomInt(0, Math.floor((v.max - v.min) / step + 1e-9)) * step
  );
}

// -- rendering -------------------------------------------------------------------------------------

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The content of an item button. */
export function renderItem(item: Item): string {
  // the markup is the set author's own; the button carries the accessible name
  if (item.kind === "svg")
    return item.content.replace(/^\s*<svg\b/i, '<svg aria-hidden="true" focusable="false"');
  if (item.kind === "image") return `<img src="${esc(item.content)}" alt="" draggable="false">`;
  return `<span class="${cls("item-text")}">${esc(item.content)}</span>`;
}

/**
 * One item button of the plugin's button group (the grid is the stage; the plugin adds `data-choice` and the click handler).
 * `jitter` places it freely in its cell (free-positions layout); `disabled` removes the slot for the page (enforced position rule).
 */
export function itemButtonHtml(a: {
  item: Item;
  slot: number;
  n: number;
  aria_label: string;
  jitter?: Jitter;
  disabled?: boolean;
}): string {
  const { row, col } = slotRowCol(a.slot, a.n);
  const style = a.jitter
    ? ` style="--row:${row - 1};--col:${col - 1};--u:${a.jitter.u};--v:${a.jitter.v}"`
    : "";
  return `<button class="jspsych-btn ${cls("item")}" data-item="${esc(
    a.item.id
  )}" aria-label="${esc(a.aria_label)}"${style}${a.disabled ? " disabled" : ""}>${renderItem(
    a.item
  )}</button>`;
}

export const textBlock = (html: string) => `<div class="${cls("text")}">${html}</div>`;
export const renderNotice = (html: string, kind = "") =>
  `<div class="${cls("notice")} ${kind}">${html}</div>`;

/**
 * A screen with a stage. `stage` is drawn in the fixed-size stage at the vertical centre, `below` under it.
 * Pick screens have no stage element: the plugin's button group is the stage, so only `below` is drawn.
 */
export function renderScreen(stage: string, below = ""): string {
  return (
    `<div class="${cls("screen")}">` +
    `<div class="${cls("stage")}">${stage}</div>` +
    (below ? `<div class="${cls("below")}">${below}</div>` : "") +
    `</div>`
  );
}

export function renderPickScreen(below = ""): string {
  return (
    `<div class="${cls("screen")}">` +
    (below ? `<div class="${cls("below")}">${below}</div>` : "") +
    `</div>`
  );
}

export { PICK_CLASS };
