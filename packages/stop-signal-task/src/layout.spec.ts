import { readFileSync } from "fs";
import { join } from "path";

import { initJsPsych } from "jspsych";

import { StopSignalTaskOptions } from "./options";
import { renderGoStage, renderScreen, renderStage } from "./stimuli";
import { createTimeline } from ".";

/**
 * Layout itself cannot be measured in jsdom (the real check is the stage-position measurement in
 * a browser, PACKAGE-STANDARD section 5). These tests guard the structure that layout relies on:
 * every task screen with a stimulus puts the stage in the anchored screen wrapper, all text goes in
 * the region below it, and the stop signal changes a class on the stage, not its structure.
 */
const P = "jspsych-timelines-stop-signal-task";

function allTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => allTrials(t, out));
  else if (tl?.timeline) allTrials(tl.timeline, out);
  else if (tl?.type) out.push(tl);
  return out;
}

function parse(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  return host;
}

function expectAnchored(html: string) {
  const host = parse(html);
  const screens = host.querySelectorAll(`.${P}-screen`);
  expect(screens).toHaveLength(1);
  const screen = screens[0];
  expect(host.querySelectorAll(`.${P}-stage`)).toHaveLength(1);
  const stage = screen.querySelector(`:scope > .${P}-stage`)!;
  expect(stage).not.toBeNull();
  for (const child of Array.from(screen.children)) {
    expect((child as HTMLElement).className).toMatch(/stop-signal-task-(stage|below)$/);
  }
  expect(stage.querySelector(`.${P}-text`)).toBeNull();
  const below = screen.querySelector(`:scope > .${P}-below`);
  if (below) expect(stage.compareDocumentPosition(below) & 4).toBeTruthy();
  return { screen, stage, below };
}

describe("stop-signal anchored stage layout", () => {
  it("the go stage and the plain stage wrap the stage in the screen wrapper; the signal is inside the stage", () => {
    const go = expectAnchored(
      renderGoStage("arrows", "border", "left", `<div class="${P}-text">hi</div>`)
    );
    expect(go.below?.textContent).toBe("hi");
    expect(go.stage.querySelector(`.${P}-arrow svg`)).not.toBeNull();
    expect(go.stage.querySelector(`.${P}-signal`)).not.toBeNull();
    expect((go.stage as HTMLElement).dataset.signal).toBe("border");
    const plain = expectAnchored(renderStage("+"));
    expect(plain.below).toBeNull();
    expect(renderScreen("<i></i>", "")).not.toContain("below");
  });

  it("the signal does not change the markup: only a class is added to the stage at the delay", () => {
    for (const signal of ["arrow_turns_red", "circle_turns_red", "border"] as const) {
      const before = renderGoStage("arrows_in_circle", signal, "right");
      const host = parse(before);
      const stage = host.querySelector(`.${P}-stage`)!;
      const html = stage.outerHTML;
      stage.classList.add(`${P}-signalled`);
      expect(stage.outerHTML.replace(` ${P}-signalled`, "")).toBe(html);
    }
  });

  for (const [name, options] of [
    [
      "keyboard",
      {
        practice_trials: 2,
        n_test_trials: 2,
        n_blocks: 1,
        iti_ms: 200,
        trial_feedback: "accuracy",
      },
    ],
    [
      "touch",
      { practice_trials: 2, n_test_trials: 2, n_blocks: 1, iti_ms: 200, response_device: "touch" },
    ],
  ] as [string, StopSignalTaskOptions][]) {
    it(`every stimulus screen of the ${name} timeline uses the anchored layout`, () => {
      const trials = allTrials(createTimeline(initJsPsych(), options).timeline);
      let checked = 0;
      const parts = new Set<string>();
      for (const t of trials) {
        let html: unknown;
        try {
          html = typeof t.stimulus === "function" ? t.stimulus() : t.stimulus;
        } catch {
          continue; // depends on the previous response (feedback); covered by renderStage above
        }
        if (typeof html !== "string" || !html.includes(`${P}-stage`)) continue;
        expectAnchored(html);
        parts.add(t.data?.part);
        checked++;
      }
      expect(checked).toBeGreaterThan(5);
      for (const p of [
        "fixation",
        "response",
        "iti",
        "instruction_check",
        "instruction_feedback",
      ]) {
        expect([...parts].some((x) => x === p || String(x).startsWith(p))).toBe(true);
      }
    });
  }

  it("the stylesheet anchors the stage at the vertical centre; every selector is scoped", () => {
    const css = readFileSync(join(__dirname, "styles.css"), "utf8");
    const rule = (sel: string) =>
      new RegExp(`${sel.replace(/[.#]/g, "\\$&")}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? "";
    const stage = rule(`.${P} .${P}-stage`);
    expect(stage).toMatch(/position:\s*absolute/);
    expect(stage).toMatch(/top:\s*50%/);
    expect(stage).toMatch(/translate\(-50%,\s*-50%\)/);
    expect(rule(`.${P} .${P}-below`)).toMatch(/position:\s*absolute/);
    const selectors = css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("{")
      .slice(0, -1)
      .map((s) => s.split("}").pop()!.trim())
      .filter(Boolean);
    for (const sel of selectors)
      for (const part of sel.split(",")) expect(part.trim()).toMatch(new RegExp(`^\\.${P}`));
  });
});
