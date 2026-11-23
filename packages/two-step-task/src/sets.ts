import { ABSTRACT, REWARD, SPACE, drawing } from "./drawings";
/**
 * Stimulus sets: the pictures of the task in their roles, and the words the instructions use for them. A set is
 * data, so a researcher can pass their own; the sets this package bundles are exported as `utils.stimuli.<name>`
 * and are ordinary values of the same type (PACKAGE-STANDARD 2a).
 *
 * Roles. `first_stage[0]` is first-stage option `A` and `first_stage[1]` is `B`. `states[0]` is the state `A`
 * usually leads to (recorded as `red`), `states[1]` the one `B` usually leads to (`blue`). Each state's
 * `items[0]` and `items[1]` are its options `option_1` and `option_2`. The role names key `reward_probability`
 * and the data; the set's own ids are recorded beside them (`stage1_item_id`, `stage2_state_id`, ...).
 */
import type { OptionId, StateId } from "./options";
import type { ShipId } from "./schedule";

/**
 * One picture. A string is a text item. An object gives exactly one of `text`, `image` (a URL) or `svg` (SVG
 * markup), an optional `id` (recorded in the data; default: the text, or "<set name>-<role>"), and an optional
 * `name`: how a sentence of the instructions names it ("the rocket"; first-stage options only).
 */
export type Stimulus =
  | string
  | { id?: string; name?: string; text: string; image?: never; svg?: never }
  | { id?: string; name?: string; image: string; text?: never; svg?: never }
  | { id?: string; name?: string; svg: string; text?: never; image?: never };

/** What the instructions call one thing of a kind, and several. */
export interface Noun {
  singular: string;
  plural: string;
}

/** A second-stage state: its two options, and how its screen looks. */
export interface StimulusState {
  /** Recorded as `stage2_state_id`. (default: "<set name>-state-1" / "-state-2") */
  id?: string;
  /** How a sentence names the state ("the red planet"). (default: "the first screen" / "the second screen", with the set's state noun) */
  name?: string;
  /** The two options of the state: `option_1`, `option_2`. */
  items: readonly [Stimulus, Stimulus];
  /** The state as one picture, in the questions about where each first-stage option leads. (default: a square in `color`) */
  picture?: Stimulus;
  /** Colour of the whole display on the state's screens (CSS colour). (default: dark red / dark blue) */
  background?: string;
  /** Colour of the text on those screens. (default: "#f1f5f9") */
  foreground?: string;
  /** The state's own colour: the default picture, and the horizon. (default: "#b23a48" / "#3a6ea5") */
  color?: string;
  /** Draw a planet's curve in `color` along the bottom of the display. (default: false) */
  horizon?: boolean;
}

/** The pictures of the task in their roles, and the words for them. */
export interface TwoStepStimulusSet {
  /** Recorded as `stimulus_set` in the data. (default: "custom") */
  name?: string;
  /**
   * What the instructions call a first-stage option, a second-stage option, a state and the reward ("spaceship",
   * "alien", "planet", "coin"). (default: "picture" or "word" by the kind of items, "screen", "coin")
   */
  noun?: { first?: Noun; second?: Noun; state?: Noun; reward?: Noun };
  /** The two first-stage options: `A`, `B`. */
  first_stage: readonly [Stimulus, Stimulus];
  /** The two second-stage states: the one `A` usually leads to (`red`), the one `B` usually leads to (`blue`). */
  states: readonly [StimulusState, StimulusState];
  /** The outcome pictures. (default: a coin, and an empty slot) */
  reward?: { rewarded: Stimulus; unrewarded: Stimulus };
  /** Colour of the display on the first-stage screens and between trials. (default: "#17181d") */
  background?: string;
  /** Colour of the text on those screens. (default: "#f1f5f9") */
  foreground?: string;
}

const svgItem = (id: string, inner: string, name?: string): Stimulus => ({
  id,
  ...(name ? { name } : {}),
  svg: drawing(inner),
});

/** Plain symbols on coloured screens: a ring and a cross; a circle and a square, a triangle and a diamond. */
export const abstractSymbols: TwoStepStimulusSet = {
  name: "abstract_symbols",
  noun: {
    first: { singular: "symbol", plural: "symbols" },
    second: { singular: "symbol", plural: "symbols" },
    state: { singular: "screen", plural: "screens" },
    reward: { singular: "coin", plural: "coins" },
  },
  first_stage: [
    svgItem("ring", ABSTRACT.ring, "the ring"),
    svgItem("cross", ABSTRACT.cross, "the cross"),
  ],
  states: [
    {
      id: "red_screen",
      name: "the red screen",
      items: [svgItem("circle", ABSTRACT.circle), svgItem("square", ABSTRACT.square)],
      picture: svgItem("red_screen", ABSTRACT.red_screen),
      background: "#3a1520",
      foreground: "#f1f5f9",
      color: "#b23a48",
    },
    {
      id: "blue_screen",
      name: "the blue screen",
      items: [svgItem("triangle", ABSTRACT.triangle), svgItem("diamond", ABSTRACT.diamond)],
      picture: svgItem("blue_screen", ABSTRACT.blue_screen),
      background: "#102a4c",
      foreground: "#f1f5f9",
      color: "#3a6ea5",
    },
  ],
  reward: {
    rewarded: svgItem("coin", REWARD.coin),
    unrewarded: svgItem("no_coin", REWARD.no_coin),
  },
  background: "#17181d",
  foreground: "#f1f5f9",
};

/** Two spaceships (a rocket and a flying saucer), two planets, and two aliens on each planet. */
export const spaceshipPlanetAlien: TwoStepStimulusSet = {
  name: "spaceship_planet_alien",
  noun: {
    first: { singular: "spaceship", plural: "spaceships" },
    second: { singular: "alien", plural: "aliens" },
    state: { singular: "planet", plural: "planets" },
    reward: { singular: "coin", plural: "coins" },
  },
  first_stage: [
    svgItem("rocket", SPACE.rocket, "the rocket"),
    svgItem("saucer", SPACE.saucer, "the flying saucer"),
  ],
  states: [
    {
      id: "red_planet",
      name: "the red planet",
      items: [
        svgItem("green_alien", SPACE.green_alien),
        svgItem("yellow_alien", SPACE.yellow_alien),
      ],
      picture: svgItem("red_planet", SPACE.red_planet),
      background: "#3a1520",
      foreground: "#f1f5f9",
      color: "#b23a48",
      horizon: true,
    },
    {
      id: "blue_planet",
      name: "the blue planet",
      items: [svgItem("pink_alien", SPACE.pink_alien), svgItem("purple_alien", SPACE.purple_alien)],
      picture: svgItem("blue_planet", SPACE.blue_planet),
      background: "#102a4c",
      foreground: "#f1f5f9",
      color: "#3a6ea5",
      horizon: true,
    },
  ],
  reward: {
    rewarded: svgItem("coin", REWARD.coin),
    unrewarded: svgItem("no_coin", REWARD.no_coin),
  },
  background: "#17181d",
  foreground: "#f1f5f9",
};

/** The bundled sets, as `utils.stimuli`. */
export const stimuli = { abstractSymbols, spaceshipPlanetAlien };

// -- normalised set -------------------------------------------------------------------------------

/** A picture as the screens use it. */
export interface Item {
  /** Stable identity, recorded in the data. */
  id: string;
  kind: "text" | "image" | "svg";
  /** The text, the image URL or the SVG markup. */
  content: string;
  /** How a sentence names it, if the set says. */
  name?: string;
}

/** The words the instructions use for the parts of the task, taken from the set. */
export interface FramingWords {
  /** a first-stage option, singular and plural (a spaceship) */
  first: string;
  first_plural: string;
  /** a second-stage option (an alien) */
  second: string;
  second_plural: string;
  /** a second-stage state (a planet) */
  state: string;
  state_plural: string;
  /** the reward (a coin) */
  reward: string;
  reward_plural: string;
  /** how a first-stage option is named in a sentence, by option (`A`, `B`) */
  first_name: Record<ShipId, string>;
  /** how a state is named in a sentence, by state (`red`, `blue`) */
  state_name: Record<StateId, string>;
}

export interface PreparedState {
  id: string;
  items: Record<OptionId, Item>;
  picture: Item;
  bg: string;
  fg: string;
  color: string;
  horizon: boolean;
}

/** A set with every default filled in, keyed by the task's roles. */
export interface PreparedSet {
  name: string;
  words: FramingWords;
  first: Record<ShipId, Item>;
  states: Record<StateId, PreparedState>;
  reward: { rewarded: Item; unrewarded: Item };
  bg: string;
  fg: string;
}

const ROLE_COLORS: Record<StateId, { bg: string; color: string }> = {
  red: { bg: "#3a1520", color: "#b23a48" },
  blue: { bg: "#102a4c", color: "#3a6ea5" },
};
const SPACE_BG = "#17181d";
const TEXT_FG = "#f1f5f9";
const STATE_ROLES = ["red", "blue"] as const;
const SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s-]+$/;
const ORDINAL = ["first", "second"];

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function toItem(s: Stimulus, fallbackId: string): Item {
  if (typeof s === "string") return { id: s, kind: "text", content: s };
  const kind = typeof s.text === "string" ? "text" : typeof s.image === "string" ? "image" : "svg";
  const content = (kind === "text" ? s.text : kind === "image" ? s.image : s.svg) as string;
  return {
    id: s.id ?? (kind === "text" ? content : fallbackId),
    kind,
    content,
    ...(s.name ? { name: s.name } : {}),
  };
}

const squarePicture = (id: string, color: string): Item => ({
  id,
  kind: "svg",
  content: drawing(`<rect x="14" y="14" width="72" height="72" rx="6" fill="${color}"/>`),
});

const isTextItem = (s: Stimulus) => typeof s === "string" || typeof s.text === "string";

function defaultNoun(items: readonly Stimulus[]): Noun {
  return items.every(isTextItem)
    ? { singular: "word", plural: "words" }
    : { singular: "picture", plural: "pictures" };
}

const prepared = new WeakMap<object, PreparedSet>();

/** The set with its defaults filled in and keyed by role. Call `setProblems` first: this assumes a valid set. */
export function prepareSet(set: TwoStepStimulusSet): PreparedSet {
  const hit = prepared.get(set);
  if (hit) return hit;
  const name = set.name ?? "custom";
  const noun = set.noun ?? {};
  const secondItems = set.states.flatMap((s) => s.items);
  const first = noun.first ?? defaultNoun(set.first_stage);
  const second = noun.second ?? defaultNoun(secondItems);
  const state = noun.state ?? { singular: "screen", plural: "screens" };
  const reward = noun.reward ?? { singular: "coin", plural: "coins" };
  const firstItems = {
    A: toItem(set.first_stage[0], `${name}-first-1`),
    B: toItem(set.first_stage[1], `${name}-first-2`),
  };
  const states = {} as Record<StateId, PreparedState>;
  STATE_ROLES.forEach((role, j) => {
    const s = set.states[j];
    const color = s.color ?? ROLE_COLORS[role].color;
    const id = s.id ?? `${name}-state-${j + 1}`;
    states[role] = {
      id,
      items: {
        option_1: toItem(s.items[0], `${name}-state-${j + 1}-option-1`),
        option_2: toItem(s.items[1], `${name}-state-${j + 1}-option-2`),
      },
      picture: s.picture ? toItem(s.picture, id) : squarePicture(id, color),
      bg: s.background ?? ROLE_COLORS[role].bg,
      fg: s.foreground ?? TEXT_FG,
      color,
      horizon: s.horizon === true,
    };
  });
  const out: PreparedSet = {
    name,
    words: {
      first: first.singular,
      first_plural: first.plural,
      second: second.singular,
      second_plural: second.plural,
      state: state.singular,
      state_plural: state.plural,
      reward: reward.singular,
      reward_plural: reward.plural,
      first_name: {
        A: firstItems.A.name ?? `the ${ORDINAL[0]} ${first.singular}`,
        B: firstItems.B.name ?? `the ${ORDINAL[1]} ${first.singular}`,
      },
      state_name: {
        red: set.states[0].name ?? `the ${ORDINAL[0]} ${state.singular}`,
        blue: set.states[1].name ?? `the ${ORDINAL[1]} ${state.singular}`,
      },
    },
    first: firstItems,
    states,
    reward: {
      rewarded: set.reward
        ? toItem(set.reward.rewarded, `${name}-reward`)
        : DEFAULT_REWARD.rewarded,
      unrewarded: set.reward
        ? toItem(set.reward.unrewarded, `${name}-no-reward`)
        : DEFAULT_REWARD.unrewarded,
    },
    bg: set.background ?? SPACE_BG,
    fg: set.foreground ?? TEXT_FG,
  };
  prepared.set(set, out);
  return out;
}

const DEFAULT_REWARD = {
  rewarded: { id: "coin", kind: "svg", content: drawing(REWARD.coin) } as Item,
  unrewarded: { id: "no_coin", kind: "svg", content: drawing(REWARD.no_coin) } as Item,
};

// -- validation -----------------------------------------------------------------------------------

function itemProblem(where: string, s: unknown): string | null {
  if (typeof s === "string") return s.length ? null : `${where} is an empty string`;
  if (!isObject(s)) return `${where} must be a string or an object with one of text, image or svg`;
  const given = ["text", "image", "svg"].filter((k) => typeof s[k] === "string");
  if (given.length !== 1) return `${where} must give exactly one of text, image or svg`;
  if (s.id !== undefined && (typeof s.id !== "string" || !s.id))
    return `${where}.id must be a non-empty string`;
  return null;
}

function pairProblems(where: string, v: unknown): string[] {
  if (!Array.isArray(v) || v.length !== 2) return [`${where} must be a list of exactly two items`];
  return v.map((s, i) => itemProblem(`${where}[${i}]`, s)).filter((p): p is string => p !== null);
}

function colorProblem(where: string, v: unknown): string | null {
  if (v === undefined) return null;
  return typeof v === "string" && SAFE_COLOR.test(v)
    ? null
    : `${where} must be a CSS colour ("#3a1520", "rgb(58, 21, 32)", "darkred")`;
}

/** Problems with a set, as messages (empty when it is usable). */
export function setProblems(set: unknown): string[] {
  if (typeof set === "string")
    return [
      `"${set}" is a name, not a set; pass a set such as utils.stimuli.abstractSymbols or utils.stimuli.spaceshipPlanetAlien, or your own`,
    ];
  if (!isObject(set))
    return [
      "must be a stimulus set: { name?, noun?, first_stage: [two items], states: [two states], reward? }",
    ];
  const out: string[] = [];
  out.push(...pairProblems("first_stage", set.first_stage));
  if (!Array.isArray(set.states) || set.states.length !== 2) {
    out.push("states must be a list of exactly two states, each { items: [two items], ... }");
  } else {
    set.states.forEach((s: unknown, j: number) => {
      if (!isObject(s)) return void out.push(`states[${j}] must be an object with items`);
      out.push(...pairProblems(`states[${j}].items`, s.items));
      if (s.picture !== undefined) {
        const p = itemProblem(`states[${j}].picture`, s.picture);
        if (p) out.push(p);
      }
      for (const k of ["background", "foreground", "color"]) {
        const p = colorProblem(`states[${j}].${k}`, s[k]);
        if (p) out.push(p);
      }
    });
  }
  if (set.reward !== undefined) {
    if (!isObject(set.reward)) out.push("reward must be { rewarded, unrewarded }");
    else
      for (const k of ["rewarded", "unrewarded"]) {
        const p = itemProblem(`reward.${k}`, set.reward[k]);
        if (p) out.push(p);
      }
  }
  for (const k of ["background", "foreground"]) {
    const p = colorProblem(k, set[k]);
    if (p) out.push(p);
  }
  if (set.noun !== undefined) {
    if (!isObject(set.noun)) out.push("noun must be { first?, second?, state?, reward? }");
    else
      for (const [k, v] of Object.entries(set.noun)) {
        if (!["first", "second", "state", "reward"].includes(k))
          out.push(`noun.${k} is not a role (first, second, state, reward)`);
        else if (!isObject(v) || typeof v.singular !== "string" || typeof v.plural !== "string")
          out.push(`noun.${k} must be { singular, plural }`);
      }
  }
  if (out.length === 0) {
    const p = prepareSet(set as unknown as TwoStepStimulusSet);
    const ids = [
      p.first.A.id,
      p.first.B.id,
      ...STATE_ROLES.flatMap((r) => [p.states[r].items.option_1.id, p.states[r].items.option_2.id]),
    ];
    const dup = ids.find((id, i) => ids.indexOf(id) !== i);
    if (dup !== undefined) out.push(`two items have the id "${dup}"; give each item its own id`);
    if (p.states.red.id === p.states.blue.id)
      out.push(`the two states have the id "${p.states.red.id}"; give each state its own id`);
  }
  return out;
}
