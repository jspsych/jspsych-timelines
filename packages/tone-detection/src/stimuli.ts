import { TASK_CLASS } from "./constants";

/** CSS class names of the task's parts (scoped under TASK_CLASS in styles.css). */
export const CLS = {
  stage: `${TASK_CLASS}-stage`,
  screen: `${TASK_CLASS}-screen`,
  below: `${TASK_CLASS}-below`,
  markers: `${TASK_CLASS}-markers`,
  marker: `${TASK_CLASS}-marker`,
  lit: `${TASK_CLASS}-lit`,
  text: `${TASK_CLASS}-text`,
  feedback: `${TASK_CLASS}-feedback`,
  sound: `${TASK_CLASS}-sound`,
};

/**
 * Anchored screen layout (PACKAGE-STANDARD section 5): the stage sits at the vertical centre of the display on every task screen.
 * Text (and the plugin's button group) belong to the region below it and never move it. `below` is the optional HTML for that region.
 */
export function renderScreen(stage: string, below = ""): string {
  const region = below ? `<div class="${CLS.below}">${below}</div>` : "";
  return `<div class="${CLS.screen}">${stage}${region}</div>`;
}

/**
 * The stage: one marker per interval, drawn the same way on every screen of a trial (listening, response, feedback, pause), so the
 * markers never move. `lit` is the interval to show as playing (1-based), or null. `extra` is HTML for inside the stage (a sound button).
 */
export function renderStage(
  labels: string[],
  below = "",
  lit: number | null = null,
  extra = ""
): string {
  const markers = labels
    .map(
      (label, i) =>
        `<span class="${CLS.marker}${lit === i + 1 ? ` ${CLS.lit}` : ""}" data-interval="${
          i + 1
        }">${label}</span>`
    )
    .join("");
  const stage = `<div class="${CLS.stage}"><div class="${CLS.markers}">${markers}</div>${extra}</div>`;
  return renderScreen(stage, below);
}

/** A text block for the region below the stage or for a full-page instruction. */
export const textBlock = (html: string) => `<div class="${CLS.text}">${html}</div>`;
