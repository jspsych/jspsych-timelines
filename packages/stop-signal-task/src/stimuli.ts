import { STAGE_BG, STAGE_FG, TASK_CLASS } from "./constants";
import type { GoForm, StopSignalForm } from "./options";

const ARROW_RIGHT_PATH = "m24 40-2.1-2.15L34.25 25.5H8v-3h26.25L21.9 10.15 24 8l16 16Z";
const ARROW_LEFT_PATH = "M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z";

/** CSS class names of the task's parts (scoped under TASK_CLASS in styles.css). */
export const CLS = {
  stage: `${TASK_CLASS}-stage`,
  center: `${TASK_CLASS}-center`,
  screen: `${TASK_CLASS}-screen`,
  below: `${TASK_CLASS}-below`,
  go: `${TASK_CLASS}-go`,
  ring: `${TASK_CLASS}-ring`,
  arrow: `${TASK_CLASS}-arrow`,
  signal: `${TASK_CLASS}-signal`,
  signalled: `${TASK_CLASS}-signalled`,
  text: `${TASK_CLASS}-text`,
  fixation: `${TASK_CLASS}-fixation`,
  feedback: `${TASK_CLASS}-feedback`,
};

export const ARROW_SIZE_PX = 72;

/** An arrow as inline SVG (it takes the text colour, so it can turn red). */
export function renderArrow(direction: "left" | "right", size = ARROW_SIZE_PX): string {
  const path = direction === "left" ? ARROW_LEFT_PATH : ARROW_RIGHT_PATH;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48"><g fill="currentColor"><path d="${path}"/></g></svg>`;
}

/**
 * Anchored screen layout (PACKAGE-STANDARD section 5): the stage sits at the vertical centre of the
 * display on every task screen. Text (and the plugin's button group) belong to the region below it and
 * never move it. `below` is the optional HTML for that region.
 */
export function renderScreen(stage: string, below = ""): string {
  const region = below ? `<div class="${CLS.below}">${below}</div>` : "";
  return `<div class="${CLS.screen}">${stage}${region}</div>`;
}

const SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s-]+$/;

/**
 * The task colours paint the whole jsPsych display (not a box around the stage). jsPsych puts
 * `css_classes` on `.jspsych-content`, so the rule reaches the display element through `:has()`; it is
 * removed with the trial's content. Instruction pages carry no such rule and keep the page colours.
 */
export function paintDisplay(fg = STAGE_FG, bg = STAGE_BG): string {
  if (!SAFE_COLOR.test(fg) || !SAFE_COLOR.test(bg))
    throw new Error("stop-signal-task: bad colour.");
  return `<style>.jspsych-display-element:has(.${TASK_CLASS}){background:${bg};color:${fg};}</style>`;
}

/** Stage with centred content (fixation, feedback, blank). Fixed size: see styles.css. */
export function renderStage(inner: string, below = ""): string {
  const stage = `<div class="${CLS.stage}"><div class="${CLS.center}">${inner}</div></div>`;
  return paintDisplay() + renderScreen(stage, below);
}

/**
 * The go stimulus: an arrow, plain or inside a circle. The stop signal is part of the same stage so that
 * nothing moves when it comes: the trial script adds the class `signalled` to the stage at the stop-signal delay.
 * `data-signal` tells the stylesheet which part changes (the arrow or the circle turn red; a frame appears).
 */
export function renderGoStage(
  go: GoForm,
  signal: StopSignalForm,
  direction: "left" | "right",
  below = ""
): string {
  const stage = `<div class="${CLS.stage}" data-signal="${signal}" data-go="${go}">
    <div class="${CLS.center}"><div class="${CLS.go}"><span class="${
    CLS.ring
  }"></span><span class="${CLS.arrow}">${renderArrow(direction)}</span></div></div>
    <div class="${CLS.signal}"></div>
  </div>`;
  return paintDisplay() + renderScreen(stage, below);
}
