/**
 * Screens. The pictures come from the stimulus set (`src/sets.ts`): a set is data, and these helpers draw any set,
 * bundled or the researcher's own. Every task screen puts its stage in the anchored screen wrapper
 * (PACKAGE-STANDARD 5): the stage sits at the vertical centre of the display, and text and buttons live in the
 * region below it.
 */
import type { OptionId, StateId } from "./options";
import type { ShipId } from "./schedule";
import { prepareSet } from "./sets";
import type { Item, PreparedSet, TwoStepStimulusSet } from "./sets";

const SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s-]+$/;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A set, prepared (defaults filled in, keyed by role). */
const P = (set: TwoStepStimulusSet | PreparedSet): PreparedSet =>
  "words" in set && "first" in set ? (set as PreparedSet) : prepareSet(set as TwoStepStimulusSet);

/** One picture of a set, in a box of `size` px. `data-item` carries its id. */
export function renderItem(item: Item, size = 96): string {
  const box = `width:${size}px;height:${size}px`;
  const id = ` data-item="${escapeHtml(item.id)}"`;
  if (item.kind === "svg") return `<span class="ts-pic"${id} style="${box}">${item.content}</span>`;
  if (item.kind === "image")
    return `<span class="ts-pic"${id} style="${box}"><img src="${escapeHtml(
      item.content
    )}" alt=""></span>`;
  return `<span class="ts-pic ts-pic-text"${id} style="min-width:${size}px;height:${size}px;font-size:${Math.round(
    size * 0.3
  )}px">${escapeHtml(item.content)}</span>`;
}

/** A first-stage option (`A` or `B`) of a set. */
export function renderShip(set: TwoStepStimulusSet | PreparedSet, ship: ShipId, size = 96): string {
  return renderItem(P(set).first[ship], size);
}

/** An option of a state. */
export function renderOption(
  set: TwoStepStimulusSet | PreparedSet,
  state: StateId,
  option: OptionId,
  size = 96
): string {
  return renderItem(P(set).states[state].items[option], size);
}

/** The state as one picture (a planet, or a coloured square). */
export function renderState(
  set: TwoStepStimulusSet | PreparedSet,
  state: StateId,
  size = 96
): string {
  return renderItem(P(set).states[state].picture, size);
}

/** The outcome picture: the reward (a coin), or no reward (an empty slot). */
export function renderCoin(
  set: TwoStepStimulusSet | PreparedSet,
  rewarded: boolean,
  size = 40
): string {
  const r = P(set).reward;
  return renderItem(rewarded ? r.rewarded : r.unrewarded, size);
}

// -- screens ------------------------------------------------------------------------------------

/**
 * Paints the whole jsPsych display (not a box around the stage): jsPsych puts `css_classes` on
 * `.jspsych-content`, so the rule reaches the display element through `:has()` and goes away with the
 * trial's content.
 */
export function paintDisplay(set: TwoStepStimulusSet | PreparedSet, state: StateId | null): string {
  const p = P(set);
  const colors = colorsFor(p, state);
  for (const c of [colors.bg, colors.fg]) {
    if (!SAFE_COLOR.test(c)) throw new Error(`two-step-task: unsupported colour "${c}".`);
  }
  const s = state === null ? null : p.states[state];
  const horizon =
    s !== null && s.horizon
      ? `radial-gradient(ellipse 130% 30% at 50% 108%, ${s.color} 0 62%, transparent 64%), `
      : "";
  return `<style>.jspsych-display-element:has(.jspsych-timelines-two-step-task){background:${horizon}${colors.bg};color:${colors.fg};}</style>`;
}

/** The colours of a screen: the state's, or the first stage's. */
export function colorsFor(set: TwoStepStimulusSet | PreparedSet, state: StateId | null) {
  const p = P(set);
  return state === null
    ? { bg: p.bg, fg: p.fg }
    : { bg: p.states[state].bg, fg: p.states[state].fg };
}

/** Anchored screen: the stage, and below it the optional region for text. */
export function renderScreen(stage: string, below = ""): string {
  const region = below ? `<div class="ts-below">${below}</div>` : "";
  return `<div class="ts-screen">${stage}${region}</div>`;
}

export function renderStage(
  inner: string,
  set: TwoStepStimulusSet | PreparedSet,
  state: StateId | null,
  below = ""
): string {
  return (
    paintDisplay(set, state) +
    renderScreen(`<div class="ts-stage"><div class="ts-center">${inner}</div></div>`, below)
  );
}

/** Two items side by side (the options of a stage). `chosen` highlights one and dims the other. */
export function renderPair(a: {
  left: string;
  right: string;
  chosen?: "left" | "right" | null;
  set: TwoStepStimulusSet | PreparedSet;
  state: StateId | null;
  below?: string;
}): string {
  const cell = (side: "left" | "right", html: string) => {
    const cls =
      a.chosen == null ? "ts-item" : a.chosen === side ? "ts-item ts-chosen" : "ts-item ts-dim";
    return `<div class="${cls}" data-side="${side}">${html}</div>`;
  };
  return renderStage(
    `<div class="ts-pair">${cell("left", a.left)}${cell("right", a.right)}</div>`,
    a.set,
    a.state,
    a.below ?? ""
  );
}

/** The fixation mark, on the stage centre. */
export function renderFixation(set: TwoStepStimulusSet | PreparedSet, mark: string): string {
  return renderStage(`<span class="ts-fixation">${mark}</span>`, set, null);
}

/** A message in the stage (the "too slow" screen). */
export function renderMessage(
  set: TwoStepStimulusSet | PreparedSet,
  state: StateId | null,
  text: string
): string {
  return renderStage(`<div class="ts-message">${text}</div>`, set, state);
}
