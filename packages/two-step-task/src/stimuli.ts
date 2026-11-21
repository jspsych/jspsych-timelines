/**
 * Drawings and screens. All shapes are simple and original (SVG, no external art). Two framings:
 * `abstract_symbols` (plain symbols on coloured screens) and `spaceship_planet_alien`.
 * Every task screen puts its stage in the anchored screen wrapper (PACKAGE-STANDARD 5): the stage
 * sits at the vertical centre of the display, and text and buttons live in the region below it.
 */
import type { Framing, OptionId, StateId } from "./options";
import type { ShipId } from "./schedule";

const SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s-]+$/;

/** Colours of the display: space, and the tint of each state's screen. */
export const COLORS = {
  space: { bg: "#17181d", fg: "#f1f5f9" },
  red: { bg: "#3a1520", fg: "#f1f5f9", planet: "#b23a48" },
  blue: { bg: "#102a4c", fg: "#f1f5f9", planet: "#3a6ea5" },
};

function svg(inner: string, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;
}

/** The framings that are drawn. */
type Drawn = Extract<Framing, "abstract_symbols" | "spaceship_planet_alien">;

const SHIPS: Record<Drawn, Record<ShipId, string>> = {
  abstract_symbols: {
    A: `<circle cx="50" cy="50" r="32" fill="none" stroke="#ffd166" stroke-width="12"/>`,
    B: `<path d="M50 14v72M14 50h72" stroke="#06d6a0" stroke-width="14" stroke-linecap="butt"/>`,
  },
  spaceship_planet_alien: {
    A: `<path d="M50 8C64 24 68 44 66 68H34C32 44 36 24 50 8Z" fill="#ff8c42"/><path d="M34 52 20 76l14-4ZM66 52l14 24-14-4Z" fill="#d1495b"/><circle cx="50" cy="42" r="8" fill="#f1f5f9"/><path d="M42 68h16l-8 22Z" fill="#ffd166"/>`,
    B: `<ellipse cx="50" cy="60" rx="42" ry="14" fill="#2ec4b6"/><path d="M30 56C32 30 68 30 70 56Z" fill="#a8dadc"/><circle cx="26" cy="62" r="3" fill="#ffd166"/><circle cx="50" cy="66" r="3" fill="#ffd166"/><circle cx="74" cy="62" r="3" fill="#ffd166"/>`,
  },
};

const OPTIONS: Record<Drawn, Record<StateId, Record<OptionId, string>>> = {
  abstract_symbols: {
    red: {
      option_1: `<circle cx="50" cy="50" r="34" fill="#ffd6a5"/>`,
      option_2: `<rect x="18" y="18" width="64" height="64" fill="#caffbf"/>`,
    },
    blue: {
      option_1: `<path d="M50 14 88 82H12Z" fill="#bdb2ff"/>`,
      option_2: `<path d="M50 10 90 50 50 90 10 50Z" fill="#9bf6ff"/>`,
    },
  },
  spaceship_planet_alien: {
    red: {
      option_1: `<circle cx="50" cy="54" r="34" fill="#7bd88f"/><circle cx="50" cy="50" r="12" fill="#f1f5f9"/><circle cx="50" cy="50" r="5" fill="#16202e"/>`,
      option_2: `<rect x="20" y="24" width="60" height="58" rx="8" fill="#ffd166"/><circle cx="38" cy="46" r="6" fill="#16202e"/><circle cx="62" cy="46" r="6" fill="#16202e"/><rect x="38" y="64" width="24" height="5" fill="#16202e"/><path d="M50 24V10" stroke="#ffd166" stroke-width="5"/>`,
    },
    blue: {
      option_1: `<path d="M50 14 90 84H10Z" fill="#ff8fab"/><circle cx="40" cy="62" r="6" fill="#16202e"/><circle cx="60" cy="62" r="6" fill="#16202e"/><path d="M38 14 30 4M62 14 70 4" stroke="#ff8fab" stroke-width="5"/>`,
      option_2: `<ellipse cx="50" cy="54" rx="26" ry="38" fill="#b388eb"/><circle cx="38" cy="44" r="5" fill="#f1f5f9"/><circle cx="62" cy="44" r="5" fill="#f1f5f9"/><circle cx="50" cy="62" r="5" fill="#f1f5f9"/>`,
    },
  },
};

export function renderShip(framing: Framing, ship: ShipId, size = 96): string {
  return svg(SHIPS[framing as Drawn][ship], size);
}

export function renderOption(
  framing: Framing,
  state: StateId,
  option: OptionId,
  size = 96
): string {
  return svg(OPTIONS[framing as Drawn][state][option], size);
}

/** The state as a picture: a planet, or a coloured square. */
export function renderState(framing: Framing, state: StateId, size = 96): string {
  const c = COLORS[state].planet;
  return framing === "spaceship_planet_alien"
    ? svg(
        `<circle cx="50" cy="50" r="38" fill="${c}"/><ellipse cx="50" cy="52" rx="48" ry="10" fill="none" stroke="#f1f5f9" stroke-width="3" opacity=".7"/>`,
        size
      )
    : svg(`<rect x="14" y="14" width="72" height="72" rx="6" fill="${c}"/>`, size);
}

/** A coin (reward), or an empty slot (no reward). */
export function renderCoin(rewarded: boolean, size = 40): string {
  return rewarded
    ? svg(
        `<circle cx="50" cy="50" r="42" fill="#f4c430" stroke="#b8860b" stroke-width="6"/><circle cx="50" cy="50" r="26" fill="none" stroke="#b8860b" stroke-width="5"/>`,
        size
      )
    : svg(
        `<circle cx="50" cy="50" r="40" fill="none" stroke="#94a3b8" stroke-width="6" stroke-dasharray="10 8"/><path d="M26 74 74 26" stroke="#94a3b8" stroke-width="6"/>`,
        size
      );
}

// -- screens ------------------------------------------------------------------------------------

/**
 * Paints the whole jsPsych display (not a box around the stage): jsPsych puts `css_classes` on
 * `.jspsych-content`, so the rule reaches the display element through `:has()` and goes away with the
 * trial's content.
 */
export function paintDisplay(
  colors: { bg: string; fg: string },
  framing: Framing,
  state: StateId | null
): string {
  for (const c of [colors.bg, colors.fg]) {
    if (!SAFE_COLOR.test(c)) throw new Error(`two-step-task: unsupported colour "${c}".`);
  }
  const planet =
    state !== null && framing === "spaceship_planet_alien"
      ? `radial-gradient(ellipse 130% 30% at 50% 108%, ${COLORS[state].planet} 0 62%, transparent 64%), `
      : "";
  return `<style>.jspsych-display-element:has(.jspsych-timelines-two-step-task){background:${planet}${colors.bg};color:${colors.fg};}</style>`;
}

/** The colours of a screen: the state's tint, or space. */
export function colorsFor(state: StateId | null) {
  return state === null ? COLORS.space : COLORS[state];
}

/** Anchored screen: the stage, and below it the optional region for text. */
export function renderScreen(stage: string, below = ""): string {
  const region = below ? `<div class="ts-below">${below}</div>` : "";
  return `<div class="ts-screen">${stage}${region}</div>`;
}

export function renderStage(
  inner: string,
  framing: Framing,
  state: StateId | null,
  below = ""
): string {
  return (
    paintDisplay(colorsFor(state), framing, state) +
    renderScreen(`<div class="ts-stage"><div class="ts-center">${inner}</div></div>`, below)
  );
}

/** Two items side by side (the options of a stage). `chosen` highlights one and dims the other. */
export function renderPair(a: {
  left: string;
  right: string;
  chosen?: "left" | "right" | null;
  framing: Framing;
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
    a.framing,
    a.state,
    a.below ?? ""
  );
}

/** The fixation mark, on the stage centre. */
export function renderFixation(framing: Framing, mark: string): string {
  return renderStage(`<span class="ts-fixation">${mark}</span>`, framing, null);
}

/** A message in the stage (the "too slow" screen). */
export function renderMessage(framing: Framing, state: StateId | null, text: string): string {
  return renderStage(`<div class="ts-message">${text}</div>`, framing, state);
}
