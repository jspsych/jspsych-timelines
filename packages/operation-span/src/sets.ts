/**
 * Memory item sets: the items a participant remembers. A set is data, so a researcher can pass their own; the sets
 * this package bundles are exported as `utils.stimuli.<name>` and are ordinary values of the same type.
 *
 * Memory items are text. The recall input names them (typed recall, key-press recall, the click matrix's labels) and
 * the feedback and walkthrough texts list them, so an image or SVG item is rejected with an error.
 */
import { DIGITS, LETTERS } from "./constants";

/**
 * One memory item. A string is a text item. An object gives its `text` and optionally an `id`
 * (recorded as `memory_item_id`, `presented_item_ids` and `recalled_item_ids`; default: the text).
 */
export type Stimulus = string | { id?: string; text: string };

/** A set of memory items. */
export interface StimulusSet {
  /** Recorded as `stimulus_set` in the data. (default: "custom") */
  name?: string;
  /** What the instructions call one item and several ("letter", "letters"). (default: "item", "items") */
  noun?: { singular: string; plural: string };
  /** The items, in a fixed order: the order of the recall matrix. */
  items: readonly Stimulus[];
}

/** The twelve consonants of the Engle-lab automated operation span, F H J K L N P Q R S T Y (Unsworth et al. 2005, S006). */
export const letters: StimulusSet = {
  name: "letters",
  noun: { singular: "letter", plural: "letters" },
  items: LETTERS,
};

/**
 * 16 common English nouns, five letters each: a stand-in for the word lists of S034 and S043, which are not reported
 * (and were not in English). Original to this package.
 */
export const words: StimulusSet = {
  name: "words",
  noun: { singular: "word", plural: "words" },
  items: [
    "apple",
    "bread",
    "chair",
    "dance",
    "eagle",
    "flame",
    "grape",
    "house",
    "ivory",
    "jelly",
    "knife",
    "lemon",
    "mouse",
    "night",
    "ocean",
    "plant",
  ],
};

/** The digits 1-9 (S020). */
export const digits: StimulusSet = {
  name: "digits",
  noun: { singular: "digit", plural: "digits" },
  items: DIGITS,
};

// -- normalised items --------------------------------------------------------------------------------

/** A memory item as the screens use it. */
export interface Item {
  /** Stable identity, recorded in the data. */
  id: string;
  /** What is shown, and what the participant clicks or types. */
  text: string;
}

/** How recall compares an entry with an item: trimmed, case-insensitive. */
export const normText = (x: unknown) =>
  String(x ?? "")
    .trim()
    .toLowerCase();

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
  if (set.items.length === 0) out.push("the set has no items");
  set.items.forEach((s, i) => {
    if (typeof s === "string") {
      if (s.trim() === "") out.push(`item ${i + 1} is empty`);
      return;
    }
    const r = s as Record<string, unknown>;
    if (typeof r?.image === "string" || typeof r?.svg === "string") {
      out.push(
        `item ${i + 1} is an ${
          typeof r.image === "string" ? "image" : "SVG"
        }; memory items must be text, because recall names them (the matrix labels, typed and key-press recall, the feedback)`
      );
    } else if (typeof r?.text !== "string" || r.text.trim() === "") {
      out.push(`item ${i + 1} must be a string or an object with a text`);
    }
  });
  if (out.length === 0) {
    const pool = buildPool(set);
    const ids = pool.map((it) => it.id);
    const dupId = ids.find((id, i) => ids.indexOf(id) !== i);
    if (dupId !== undefined)
      out.push(`two items have the id "${dupId}"; give each item its own id`);
    const texts = pool.map((it) => normText(it.text));
    const at = texts.findIndex((t, i) => texts.indexOf(t) !== i);
    if (at >= 0) {
      const first = texts.indexOf(texts[at]);
      out.push(
        `items ${first + 1} and ${at + 1} read the same ("${pool[first].text}", "${
          pool[at].text
        }": recall ignores case and surrounding spaces); give each item its own text`
      );
    }
  }
  return out;
}

/** The whole pool of a set, in its fixed order. */
export function buildPool(set: StimulusSet): Item[] {
  return set.items.map((s): Item => {
    if (typeof s === "string") return { id: s, text: s };
    return { id: s.id ?? s.text, text: s.text };
  });
}

/** The noun the instructions use for one item of the set, and its plural. */
export function itemNouns(set: StimulusSet): { singular: string; plural: string } {
  return set.noun ?? { singular: "item", plural: "items" };
}

/** The name recorded in the data. */
export const setName = (set: StimulusSet) => set.name ?? "custom";
