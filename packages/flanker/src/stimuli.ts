import type { NeutralFlankerForm, StimulusSizeUnit } from "./options";

/** Glyph labels used in the data (`target`, `flankers`). */
export type Glyph = string;

const ARROW_RIGHT_PATH = "m24 40-2.1-2.15L34.25 25.5H8v-3h26.25L21.9 10.15 24 8l16 16Z";
const ARROW_LEFT_PATH = "M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z";

function svg(inner: string, size: number, rotate = 0): string {
  const t = rotate ? ` transform="rotate(${rotate} 24 24)"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48"><g fill="currentColor"${t}>${inner}</g></svg>`;
}

/** HTML for one array item. Unknown labels are rendered as text (letters). */
export function renderGlyph(glyph: Glyph, size: number): string {
  switch (glyph) {
    case "left":
      return svg(`<path d="${ARROW_LEFT_PATH}"/>`, size);
    case "right":
      return svg(`<path d="${ARROW_RIGHT_PATH}"/>`, size);
    case "up":
      return svg(`<path d="${ARROW_RIGHT_PATH}"/>`, size, -90);
    case "dash":
      return svg(`<rect x="8" y="22.5" width="32" height="3"/>`, size);
    case "line":
      return svg(`<rect x="22.5" y="8" width="3" height="32"/>`, size);
    case "square":
      return svg(`<rect x="12" y="12" width="24" height="24"/>`, size);
    case "plus":
      return svg(
        `<rect x="8" y="22.5" width="32" height="3"/><rect x="22.5" y="8" width="3" height="32"/>`,
        size
      );
    case "diamond":
      return svg(`<path d="M24 8 40 24 24 40 8 24Z"/>`, size);
    case "cross":
      return svg(
        `<path d="M12 12 36 36M36 12 12 36" stroke="currentColor" stroke-width="3.5" fill="none"/>`,
        size
      );
    case "blank":
      return "";
    default:
      return `<span class="letter" style="font-size:${size}px">${glyph}</span>`;
  }
}

/** Glyph label for a neutral flanker form. `letter` is used for "unmapped_letter". */
export function neutralGlyph(form: NeutralFlankerForm, letter: string): Glyph {
  switch (form) {
    case "dashes":
      return "dash";
    case "blank":
      return "blank";
    case "straight_lines":
      return "line";
    case "squares":
      return "square";
    case "plus_signs":
      return "plus";
    case "diamonds":
      return "diamond";
    case "vertical_arrows":
      return "up";
    case "unmapped_letter":
      return letter;
  }
}

export function toPx(
  value: number,
  unit: StimulusSizeUnit | "px" | "deg",
  pxPerDeg: number,
  viewportHeight: number
): number {
  if (unit === "deg") return value * pxPerDeg;
  if (unit === "screen_height_fraction") return value * viewportHeight;
  return value;
}

export interface ArrayRender {
  /** flanker glyphs for the near-to-far positions on each side; length = per_side */
  flankers: Glyph[];
  target: Glyph;
  size_px: number;
  gap_px: number;
  orientation: "horizontal" | "vertical";
  offset_px: number;
  fg: string;
  bg: string;
  /** hide flankers (positive SOA preview) or target (negative SOA preview) but keep the layout */
  hide?: "flankers" | "target" | null;
}

/**
 * Anchored screen layout (PACKAGE-STANDARD section 5): the stage sits at the vertical centre of
 * the display on every task screen. Text (and the plugin's button group) belong to the region
 * below it and never move it. `below` is the optional HTML for that region.
 */
export function renderScreen(stage: string, below = ""): string {
  const region = below ? `<div class="jspsych-timelines-flanker-below">${below}</div>` : "";
  return `<div class="jspsych-timelines-flanker-screen">${stage}${region}</div>`;
}

/** HTML of the whole stimulus panel, plus optional text for the region below the stage. */
export function renderArray(a: ArrayRender, below = ""): string {
  const cell = (g: Glyph, hidden: boolean) =>
    `<span class="jspsych-timelines-flanker-item" style="width:${a.size_px}px;height:${
      a.size_px
    }px;${hidden ? "visibility:hidden;" : ""}">${renderGlyph(g, a.size_px)}</span>`;
  const hideF = a.hide === "flankers";
  const hideT = a.hide === "target";
  const items = [
    ...[...a.flankers].reverse().map((g) => cell(g, hideF)),
    cell(a.target, hideT),
    ...a.flankers.map((g) => cell(g, hideF)),
  ].join("");
  const dir = a.orientation === "vertical" ? "column" : "row";
  const stage = `<div class="jspsych-timelines-flanker-stage">
    <div class="jspsych-timelines-flanker-array" data-orientation="${a.orientation}" style="flex-direction:${dir};gap:${a.gap_px}px;transform:translateY(${a.offset_px}px);">${items}</div>
  </div>`;
  return paintDisplay(a.fg, a.bg) + renderScreen(stage, below);
}

/** Parse "<fg> on <bg>"; falls back to white on black. */
export function parseColors(spec: string): { fg: string; bg: string } {
  const m = /^\s*(.+?)\s+on\s+(.+?)\s*$/i.exec(spec);
  if (!m)
    throw new Error(`flanker: stimulus_color must look like "white on black", got "${spec}".`);
  return { fg: m[1], bg: m[2] };
}

const SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s-]+$/;

/**
 * The task colours (`stimulus_color`, e.g. "white on black") paint the whole jsPsych display for
 * the stimulus screens, not just the stage box. That avoids a coloured rectangle on a page of a
 * different colour. jsPsych puts `css_classes` on `.jspsych-content`, so the rule reaches the
 * display element through `:has()`; it is removed with the trial's content. Instruction pages
 * carry no such rule and keep the page colours.
 */
export function paintDisplay(fg: string, bg: string): string {
  if (!SAFE_COLOR.test(fg) || !SAFE_COLOR.test(bg))
    throw new Error(`flanker: unsupported colour in stimulus_color ("${fg}" on "${bg}").`);
  return `<style>.jspsych-display-element:has(.jspsych-timelines-flanker){background:${bg};color:${fg};}</style>`;
}

/** Stage with a centred text/shape (fixation, feedback, cue). Fixed size: see styles.css. */
export function renderStage(inner: string, fg: string, bg: string, below = ""): string {
  const stage = `<div class="jspsych-timelines-flanker-stage"><div class="jspsych-timelines-flanker-center">${inner}</div></div>`;
  return paintDisplay(fg, bg) + renderScreen(stage, below);
}
