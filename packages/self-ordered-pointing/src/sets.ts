/**
 * Stimulus sets: the items a participant picks from. A set is data, so a researcher can pass their own; the sets
 * this package bundles are exported as `utils.stimuli.<name>` and are ordinary values of the same type.
 */
import { DRAWINGS, drawingSvg } from "./drawings";
import { DESIGN_PATHS } from "./shapes";
import { NONWORDS, WORDS } from "./wordlists";

/**
 * One item. A string is a text item. An object gives exactly one of `text`, `image` (a URL) or `svg` (SVG markup),
 * and optionally an `id` (recorded as `chosen_item_id`; default: the text, or "<set name>-<position>").
 */
export type Stimulus =
  | string
  | { id?: string; text: string; image?: never; svg?: never }
  | { id?: string; image: string; text?: never; svg?: never }
  | { id?: string; svg: string; text?: never; image?: never };

/** A set of items to pick from. */
export interface StimulusSet {
  /** Recorded as `stimulus_set` in the data. (default: "custom") */
  name?: string;
  /** What the instructions call one item and several ("design", "designs"). (default: "word"/"words" for a set of text items, "picture"/"pictures" otherwise) */
  noun?: { singular: string; plural: string };
  /** The items, in a fixed order (a nested pool uses the first N). */
  items: readonly Stimulus[];
}

/** 48 random polygons (Attneave style), original to this package (see `src/shapes.ts`). */
export const abstractDesigns: StimulusSet = {
  name: "abstract_designs",
  noun: { singular: "design", plural: "designs" },
  items: DESIGN_PATHS.map((d, i) => ({
    id: `design-${String(i + 1).padStart(2, "0")}`,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${d}" fill="currentColor"/></svg>`,
  })),
};

/** 48 outline drawings of nameable everyday objects, from Lucide (ISC licence; see `src/drawings.ts`). */
export const representationalDrawings: StimulusSet = {
  name: "representational_drawings",
  noun: { singular: "picture", plural: "pictures" },
  items: DRAWINGS.map((d) => ({ id: d.name, svg: drawingSvg(d.body) })),
};

/** 48 common concrete nouns (`src/wordlists.ts`). */
export const words: StimulusSet = {
  name: "words",
  noun: { singular: "word", plural: "words" },
  items: WORDS,
};

/** 48 pronounceable nonwords (`src/wordlists.ts`). */
export const nonwords: StimulusSet = {
  name: "nonwords",
  noun: { singular: "made-up word", plural: "made-up words" },
  items: NONWORDS,
};

/** The bundled sets, as `utils.stimuli`. */
export const stimuli = { abstractDesigns, representationalDrawings, words, nonwords };

// -- normalised items --------------------------------------------------------------------------------

/** An item as the screens use it. */
export interface Item {
  /** Stable identity, recorded as `chosen_item_id`. */
  id: string;
  kind: "text" | "image" | "svg";
  /** The text, the image URL or the SVG markup. */
  content: string;
}

/** Whether a value is a stimulus set (or a bare array of items, accepted as a set without a name). */
export function asStimulusSet(v: unknown): StimulusSet | null {
  if (Array.isArray(v)) return { items: v as Stimulus[] };
  if (typeof v === "object" && v !== null && Array.isArray((v as StimulusSet).items))
    return v as StimulusSet;
  return null;
}

/** Problems with a set, as messages (empty when it is usable). */
export function setProblems(set: StimulusSet): string[] {
  const out: string[] = [];
  set.items.forEach((s, i) => {
    if (typeof s === "string") return;
    const given = ["text", "image", "svg"].filter(
      (k) => typeof (s as Record<string, unknown>)?.[k] === "string"
    );
    if (given.length !== 1)
      out.push(`item ${i + 1} must be a string or give exactly one of text, image or svg`);
  });
  if (out.length === 0) {
    const ids = buildPool(set).map((it) => it.id);
    const dup = ids.find((id, i) => ids.indexOf(id) !== i);
    if (dup !== undefined) out.push(`two items have the id "${dup}"; give each item its own id`);
  }
  return out;
}

/** The whole pool of a set, in its fixed order. */
export function buildPool(set: StimulusSet): Item[] {
  const name = set.name ?? "custom";
  return set.items.map((s, i): Item => {
    if (typeof s === "string") return { id: s, kind: "text", content: s };
    const kind =
      "text" in s && typeof s.text === "string"
        ? "text"
        : "image" in s && s.image
        ? "image"
        : "svg";
    const content = (kind === "text" ? s.text : kind === "image" ? s.image : s.svg) as string;
    return { id: s.id ?? (kind === "text" ? content : `${name}-${i + 1}`), kind, content };
  });
}

/** The noun the instructions use for one item of the set, and its plural. */
export function itemNouns(set: StimulusSet): { singular: string; plural: string } {
  if (set.noun) return set.noun;
  const allText = set.items.every((s) => typeof s === "string" || "text" in s);
  return allText
    ? { singular: "word", plural: "words" }
    : { singular: "picture", plural: "pictures" };
}
