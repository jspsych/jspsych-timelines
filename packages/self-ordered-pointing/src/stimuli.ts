/**
 * Items, grids and arrangements. Everything the screens draw comes from here, so the walkthrough, practice
 * and test render items and take picks with the same code.
 */
import type { JsPsych } from "jspsych";

import { PICK_CLASS, TASK_CLASS } from "./constants";
import type { DurationOrJitter, ItemSet, ResolvedOptions } from "./options";
import { DESIGN_PATHS } from "./shapes";
import { NONWORDS, WORDS } from "./wordlists";

export const cls = (name: string) => `${TASK_CLASS}-${name}`;

// -- items ----------------------------------------------------------------------------------------

export interface Item {
  /** Stable identity, recorded as `chosen_item_id`. */
  id: string;
  kind: "design" | "text" | "image";
  /** SVG path (design), the text (text), or the URL (image). */
  content: string;
}

/** The whole pool of an item set, in its fixed order. */
export function buildPool(set: ItemSet): Item[] {
  if (set === "abstract_designs") {
    return DESIGN_PATHS.map((d, i) => ({
      id: `design-${String(i + 1).padStart(2, "0")}`,
      kind: "design",
      content: d,
    }));
  }
  if (set === "words") return WORDS.map((w) => ({ id: w, kind: "text", content: w }));
  if (set === "nonwords") return NONWORDS.map((w) => ({ id: w, kind: "text", content: w }));
  if (typeof set === "object" && "words" in set)
    return set.words.map((w) => ({ id: w, kind: "text", content: w }));
  if (typeof set === "object" && "images" in set)
    return set.images.map((u, i) => ({ id: `image-${i + 1}`, kind: "image", content: u }));
  throw new Error(
    `self-ordered-pointing: stimulus_set.items: ${JSON.stringify(set)} is not implemented.`
  );
}

/** The noun the instructions use for one item of the set, and its plural. */
export function itemNouns(set: ItemSet): { singular: string; plural: string } {
  if (set === "abstract_designs") return { singular: "design", plural: "designs" };
  if (set === "words" || (typeof set === "object" && "words" in set))
    return { singular: "word", plural: "words" };
  if (set === "nonwords") return { singular: "made-up word", plural: "made-up words" };
  return { singular: "picture", plural: "pictures" };
}

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
  if (item.kind === "design")
    return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="${item.content}" fill="currentColor"/></svg>`;
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
