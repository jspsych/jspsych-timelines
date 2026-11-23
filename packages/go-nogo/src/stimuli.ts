import type { ResolvedItem, StimulusLayout } from "./options";
import type { TextConfig } from "./text";

const SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s-]+$/;

export function checkColor(color: string): string {
  if (!SAFE_COLOR.test(color))
    throw new Error(`go-nogo: unsupported colour "${color}" in stimulus_set.`);
  return color;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Identifier of a stimulus in the data (see `StimulusItem`). */
export function stimulusId(item: ResolvedItem): string {
  return item.id;
}

/** Name of a stimulus in the instructions: its given id, "blue square", the text, or "picture". */
export function stimulusName(item: ResolvedItem, text: TextConfig): string {
  if (item.named) return item.id;
  if (item.text !== undefined) return item.text;
  if (item.shape !== undefined) {
    const shape = text.shape_names[item.shape];
    return item.color ? text.stimulus_name({ color: item.color, shape }) : shape;
  }
  return text.picture_name;
}

/** "blue square or orange square". */
export function namesOf(items: ResolvedItem[], text: TextConfig): string {
  return items.map((i) => stimulusName(i, text)).join(` ${text.list_or} `);
}

/** SVG, picture or text for one stimulus, `size` px. */
export function renderItem(item: ResolvedItem, size: number): string {
  if (item.image !== undefined) {
    return `<img class="jspsych-timelines-go-nogo-picture" src="${escapeHtml(
      item.image
    )}" alt="${escapeHtml(item.id)}" style="width:${size}px;height:${size}px">`;
  }
  if (item.svg !== undefined) {
    return `<span class="jspsych-timelines-go-nogo-picture" role="img" aria-label="${escapeHtml(
      item.id
    )}" style="width:${size}px;height:${size}px">${item.svg}</span>`;
  }
  const color = checkColor(item.color ?? "currentColor");
  if (item.text !== undefined) {
    return `<span class="jspsych-timelines-go-nogo-letter" style="font-size:${Math.round(
      size * 0.7
    )}px;color:${color}">${escapeHtml(item.text)}</span>`;
  }
  const shape = item.shape ?? "square";
  let inner: string;
  switch (shape) {
    case "square":
      inner = `<rect x="6" y="6" width="36" height="36" fill="${color}"/>`;
      break;
    case "circle":
      inner = `<circle cx="24" cy="24" r="19" fill="${color}"/>`;
      break;
    case "triangle":
      inner = `<path d="M24 5 44 41H4Z" fill="${color}"/>`;
      break;
    case "diamond":
      inner = `<path d="M24 4 44 24 24 44 4 24Z" fill="${color}"/>`;
      break;
    case "cross":
      inner = `<path d="M10 10 38 38M38 10 10 38" stroke="${color}" stroke-width="5" fill="none"/>`;
      break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="${escapeHtml(
    item.id
  )}">${inner}</svg>`;
}

export type Location =
  | "center"
  | "top_center"
  | "top_left"
  | "top_right"
  | "bottom_left"
  | "bottom_right";

export const GRID_CELLS: Location[] = ["top_left", "top_right", "bottom_left", "bottom_right"];

/** The locations a layout can use. */
export function locationsOf(layout: StimulusLayout): Location[] {
  return layout === "random_2x2_grid"
    ? GRID_CELLS
    : [layout === "top_center" ? "top_center" : "center"];
}

/**
 * Anchored screen layout (PACKAGE-STANDARD section 5): the stage sits at the vertical centre of the
 * display on every task screen. Text (and the plugin's button group) belong to the region below it and
 * never move it. `below` is the optional HTML for that region.
 */
export function renderScreen(stage: string, below = ""): string {
  const region = below ? `<div class="jspsych-timelines-go-nogo-below">${below}</div>` : "";
  return `<div class="jspsych-timelines-go-nogo-screen">${stage}${region}</div>`;
}

/** The stage with one stimulus at `location`. */
export function renderStimulusScreen(
  itemHtml: string,
  location: Location,
  below = "",
  ackClass = ""
): string {
  const grid = location !== "center" && location !== "top_center";
  const body = grid
    ? GRID_CELLS.map(
        (c) =>
          `<div class="jspsych-timelines-go-nogo-cell">${
            c === location
              ? `<div class="jspsych-timelines-go-nogo-item ${ackClass}">${itemHtml}</div>`
              : ""
          }</div>`
      ).join("")
    : `<div class="jspsych-timelines-go-nogo-item ${ackClass}">${itemHtml}</div>`;
  const stage = `<div class="jspsych-timelines-go-nogo-stage" data-location="${location}"><div class="jspsych-timelines-go-nogo-field ${
    grid ? "grid" : ""
  }" data-location="${location}">${body}</div></div>`;
  return renderScreen(stage, below);
}

/** Stage with centred text or a fixation cross (feedback, ITI, countdown). */
export function renderStage(inner: string, below = ""): string {
  const stage = `<div class="jspsych-timelines-go-nogo-stage"><div class="jspsych-timelines-go-nogo-center">${inner}</div></div>`;
  return renderScreen(stage, below);
}

/**
 * Fixation cross drawn behind a response trial's `prompt`: it is visible only after the stimulus is
 * hidden (see styles.css), so the screen keeps a fixation point when the stimulus ends before the window does.
 */
export function backgroundFixation(cross: string): string {
  return `<div class="jspsych-timelines-go-nogo-bgfix">${cross}</div>`;
}
