/**
 * Screen markup. Every task screen is a fixed-size stage anchored at the vertical centre of the display
 * (PACKAGE-STANDARD §5); text and the plugin's button group sit in the region below it and never move it.
 * All text is body size; only the fixation mark is larger.
 */
import type { Offer } from "./offers";
import type { TextConfig } from "./text";

export const P = "jspsych-timelines-eefrt";

/** Stage and the optional text region below it. */
export function renderScreen(stage: string, below = ""): string {
  const region = below ? `<div class="${P}-below"><div class="${P}-text">${below}</div></div>` : "";
  return `<div class="${P}-screen"><div class="${P}-stage">${stage}</div>${region}</div>`;
}

/** The fixation mark, on its own layer through the stage centre. */
export function renderFixation(text: TextConfig, below = ""): string {
  return renderScreen(
    `<div class="${P}-fixation-layer"><span class="${P}-fixation">${text.fixation}</span></div>`,
    below
  );
}

/** A line of text centred in the stage (ready screen, feedback). */
export function renderCenterText(html: string, kind = "", below = ""): string {
  return renderScreen(`<div class="${P}-center ${kind}">${html}</div>`, below);
}

export interface ChoiceArgs {
  offer: Offer;
  text: TextConfig;
  outcome_type: "money" | "points";
  /** presses and seconds per task */
  easy_presses: number;
  hard_presses: number;
  easy_seconds: number;
  hard_seconds: number;
  /** HTML of the choice keys */
  easy_key: string;
  hard_key: string;
  probability_shown: boolean;
  /** text for the region below the stage (walkthrough caption) */
  below?: string;
}

/** The choice screen: the chance of winning, then the easy and hard cards side by side. */
export function renderChoice(a: ChoiceArgs): string {
  const t = a.text;
  const card = (task: "easy" | "hard") => {
    const amount = t.amount({
      value: task === "easy" ? a.offer.easy_reward : a.offer.hard_reward,
      outcome_type: a.outcome_type,
    });
    return (
      `<div class="${P}-card" data-task="${task}">` +
      `<div class="${P}-card-title">${t.task_title({ task })}</div>` +
      `<div class="${P}-card-reward">${t.reward_line({ amount })}</div>` +
      `<div class="${P}-card-effort">${t.effort_requirement({
        presses: task === "easy" ? a.easy_presses : a.hard_presses,
        seconds: task === "easy" ? a.easy_seconds : a.hard_seconds,
      })}</div>` +
      `<div class="${P}-card-key">${t.choice_key_label({
        key: task === "easy" ? a.easy_key : a.hard_key,
      })}</div></div>`
    );
  };
  const chance = a.probability_shown
    ? `<div class="${P}-chance">${t.win_probability({ probability: a.offer.probability })}</div>`
    : `<div class="${P}-chance"></div>`;
  return renderScreen(
    `<div class="${P}-choice">${chance}<div class="${P}-cards">${card("easy")}${card(
      "hard"
    )}</div></div>`,
    a.below ?? ""
  );
}

export type ProgressIndicator = "none" | "counter" | "progress_bar";

/** The effort screen: a bar that fills (or a counter, or nothing) in the stage, the prompt below. */
export function renderEffort(a: {
  progress_indicator: ProgressIndicator;
  required: number;
  count: number;
  counter_text: (count: number, required: number) => string;
  prompt: string;
}): string {
  const pct = Math.min(100, (100 * a.count) / a.required);
  const bar =
    a.progress_indicator === "progress_bar"
      ? `<div class="${P}-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${a.required}" aria-valuenow="${a.count}"><div class="${P}-bar-fill" style="width:${pct}%"></div></div>`
      : "";
  const counter =
    a.progress_indicator === "counter"
      ? `<div class="${P}-count">${a.counter_text(a.count, a.required)}</div>`
      : "";
  return renderScreen(`<div class="${P}-effort">${bar}${counter}</div>`, a.prompt);
}

/** Update an effort screen in place after a press. */
export function updateEffort(
  root: ParentNode,
  a: {
    progress_indicator: ProgressIndicator;
    required: number;
    count: number;
    counter_text: (count: number, required: number) => string;
  }
): void {
  const fill = root.querySelector<HTMLElement>(`.${P}-bar-fill`);
  if (fill) fill.style.width = `${Math.min(100, (100 * a.count) / a.required)}%`;
  const bar = root.querySelector<HTMLElement>(`.${P}-bar`);
  if (bar) bar.setAttribute("aria-valuenow", String(a.count));
  const count = root.querySelector<HTMLElement>(`.${P}-count`);
  if (count) count.textContent = a.counter_text(a.count, a.required);
}
