import type { NeutralFlankerForm, StimulusSizeUnit } from "./options";

/** Glyph labels used in the data (`target`, `flankers`). */
export type Glyph = string;

const ARROW_RIGHT_PATH = "m24 40-2.1-2.15L34.25 25.5H8v-3h26.25L21.9 10.15 24 8l16 16Z";
const ARROW_LEFT_PATH = "M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z";

function svg(inner: string, size: number, rotate = 0): string {
  const t = rotate ? ` transform="rotate(${rotate} 24 24)"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48"><g fill="currentColor"${t}>${inner}</g></svg>`;
}

/** The labels `renderGlyph` draws as shapes; any other label is drawn as text (a letter). */
export const GLYPH_NAMES = [
  "left",
  "right",
  "up",
  "dash",
  "line",
  "square",
  "plus",
  "diamond",
  "cross",
  "blank",
];

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
  /** HTML of a fixation mark kept on screen while the array is shown (arrays shifted off fixation) */
  fixation?: string;
  /** vertical shift of that fixation mark from the stage centre, px (see fixationLayer) */
  fixation_dy?: number;
}

const STAGE_PADDING = 20; // styles.css .jspsych-timelines-flanker-stage padding

/**
 * A fixation mark centred on the stage and shifted by `dy` px. The fixation screen and an array
 * screen that keeps the fixation use this same markup, so the mark does not move between them.
 */
export function fixationLayer(html: string, dy = 0): string {
  const t = dy ? ` style="transform:translateY(${dy}px);"` : "";
  return `<div class="jspsych-timelines-flanker-fixation-layer"${t}>${html}</div>`;
}

/**
 * Stage height that fits an array of `extent_px` shifted by `array_dy` and a fixation mark of
 * `size_px` shifted by `fixation_dy`, both around the stage centre (which stays the display centre).
 */
export function stageHeightFor(
  extent_px: number,
  array_dy: number,
  size_px: number,
  fixation_dy: number
) {
  return (
    2 * Math.max(Math.abs(array_dy) + extent_px / 2, Math.abs(fixation_dy) + size_px / 2) +
    2 * STAGE_PADDING
  );
}

/**
 * Anchored screen layout (PACKAGE-STANDARD section 5): the stage sits at the vertical centre of
 * the display on every task screen. Text (and the plugin's button group) belong to the region
 * below it and never move it. `below` is the optional HTML for that region.
 */
export function renderScreen(stage: string, below = "", min_stage_px = 0): string {
  const region = below ? `<div class="jspsych-timelines-flanker-below">${below}</div>` : "";
  // A stimulus taller than the default stage (a vertical array, or one shifted above or below
  // fixation) gets a taller stage, still centred, so it is never clipped.
  const style =
    min_stage_px > 0
      ? ` style="--flanker-stage-h: max(min(280px, 40vh), ${Math.ceil(min_stage_px)}px);"`
      : "";
  return `<div class="jspsych-timelines-flanker-screen"${style}>${stage}${region}</div>`;
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
  const fixation = a.fixation ? fixationLayer(a.fixation, a.fixation_dy ?? 0) : "";
  const stage = `<div class="jspsych-timelines-flanker-stage">${fixation}
    <div class="jspsych-timelines-flanker-array" data-orientation="${a.orientation}" style="flex-direction:${dir};gap:${a.gap_px}px;transform:translateY(${a.offset_px}px);">${items}</div>
  </div>`;
  const n = 2 * a.flankers.length + 1;
  const extent = a.orientation === "vertical" ? n * a.size_px + (n - 1) * a.gap_px : a.size_px;
  const needed = stageHeightFor(
    extent,
    a.offset_px,
    a.size_px,
    a.fixation ? a.fixation_dy ?? 0 : 0
  );
  return paintDisplay(a.fg, a.bg) + renderScreen(stage, below, needed);
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
export function renderStage(
  inner: string,
  fg: string,
  bg: string,
  below = "",
  min_stage_px = 0
): string {
  const stage = `<div class="jspsych-timelines-flanker-stage"><div class="jspsych-timelines-flanker-center">${inner}</div></div>`;
  return paintDisplay(fg, bg) + renderScreen(stage, below, min_stage_px);
}
