import { readFileSync } from "fs";
import { join } from "path";

import { initJsPsych } from "jspsych";

import { TwoStepTaskOptions } from "./options";
import { renderFixation, renderMessage, renderPair, renderStage } from "./stimuli";
import { createTimeline } from ".";

/**
 * Layout itself cannot be measured in jsdom (the real check is the stage-position measurement in
 * a browser, PACKAGE-STANDARD section 5; see reproduction/layout.config.mjs). These tests guard the
 * structure that layout relies on: every task screen puts the stage in the anchored screen wrapper,
 * and all text goes in the region below it.
 */
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
  const screens = host.querySelectorAll(".ts-screen");
  expect(screens).toHaveLength(1);
  const screen = screens[0];
  expect(host.querySelectorAll(".ts-stage")).toHaveLength(1);
  const stage = screen.querySelector(":scope > .ts-stage")!;
  expect(stage).not.toBeNull();
  // nothing in the flow besides the stage and the below-region
  for (const child of Array.from(screen.children)) {
    expect((child as HTMLElement).className).toMatch(/^ts-(stage|below)$/);
  }
  // text lives only in the below region, which follows the stage (statements of a check question are options)
  expect(stage.querySelector(".ts-text")).toBeNull();
  const below = screen.querySelector(":scope > .ts-below");
  if (below) expect(stage.compareDocumentPosition(below) & 4).toBeTruthy(); // FOLLOWING
  return { screen, stage, below };
}

describe("two-step-task anchored stage layout", () => {
  it("renderPair, renderStage, renderFixation and renderMessage wrap the stage in the screen wrapper", () => {
    const a = expectAnchored(
      renderPair({
        left: "<i>L</i>",
        right: "<i>R</i>",
        chosen: "left",
        framing: "abstract_symbols",
        state: "red",
        below: '<div class="ts-text">hi</div>',
      })
    );
    expect(a.below?.textContent).toBe("hi");
    expect(a.stage.querySelectorAll(".ts-item")).toHaveLength(2);
    expect(a.stage.querySelector(".ts-chosen")?.getAttribute("data-side")).toBe("left");
    expect(a.stage.querySelector(".ts-dim")?.getAttribute("data-side")).toBe("right");
    expect(expectAnchored(renderStage("", "abstract_symbols", null)).below).toBeNull();
    expect(expectAnchored(renderFixation("abstract_symbols", "+")).stage.textContent).toBe("+");
    expect(
      expectAnchored(renderMessage("abstract_symbols", null, "Too slow")).stage.textContent
    ).toBe("Too slow");
  });

  it("paints the whole display with the state's colour, and a planet under the spaceship framing", () => {
    expect(renderStage("", "abstract_symbols", "red")).toContain("background:#3a1520");
    expect(renderStage("", "abstract_symbols", null)).toContain("background:#17181d");
    expect(renderStage("", "spaceship_planet_alien", "blue")).toContain("radial-gradient");
    expect(renderStage("", "abstract_symbols", "blue")).not.toContain("radial-gradient");
  });

  for (const [name, options] of [
    [
      "default framing",
      {
        practice_trials: 2,
        n_test_trials: 2,
        iti_ms: 200,
        fixation_duration_ms: 300,
        contingency_disclosure: "full",
      },
    ],
    [
      "spaceship framing",
      {
        practice_trials: 2,
        n_test_trials: 2,
        instruction_framing: "spaceship_planet_alien",
        manipulation_check: "questionnaire",
      },
    ],
  ] as [string, TwoStepTaskOptions][]) {
    it(`every stimulus screen of the ${name} timeline uses the anchored layout`, () => {
      const jsPsych = initJsPsych();
      const trials = allTrials(createTimeline(jsPsych, options).timeline);
      let checked = 0;
      const parts = new Set<string>();
      for (const t of trials) {
        let html: unknown;
        try {
          html = typeof t.stimulus === "function" ? t.stimulus() : t.stimulus;
        } catch {
          continue; // depends on the previous choice (second stage, outcome); covered by the renderers above
        }
        if (typeof html !== "string" || !html.includes("ts-stage")) continue;
        expectAnchored(html);
        parts.add(t.data?.part);
        checked++;
      }
      expect(checked).toBeGreaterThan(8);
      for (const p of [
        "choice",
        "iti",
        "instruction_check",
        "instruction_feedback",
        "instruction_example",
      ]) {
        expect(parts.has(p)).toBe(true);
      }
    });
  }

  it("every state-dependent screen is anchored too (second stage, acknowledgement, outcome, timeout)", async () => {
    const { simulateTimeline } = await import("@jspsych/test-utils");
    const jsPsych = initJsPsych();
    const { timeline } = createTimeline(jsPsych, {
      practice_trials: 0,
      n_test_trials: 3,
      n_blocks: 1,
    });
    // run the timeline, and look at the html each display trial was given
    const seen: string[] = [];
    for (const t of allTrials(timeline)) {
      if (typeof t.stimulus === "function") {
        const f = t.stimulus;
        t.stimulus = () => {
          const html = f();
          if (typeof html === "string" && html.includes("ts-stage")) seen.push(html);
          return html;
        };
      }
    }
    const { expectFinished } = await simulateTimeline(
      timeline,
      "data-only",
      { default: { data: { rt: 400 } } },
      jsPsych
    );
    await expectFinished();
    expect(seen.length).toBeGreaterThan(20);
    seen.forEach(expectAnchored);
    expect(seen.some((h) => h.includes("ts-outcome"))).toBe(true);
    expect(seen.some((h) => h.includes("ts-chosen"))).toBe(true);
  });

  it("the outcome screen puts the text below the stage and uses body-size text", async () => {
    const { simulateTimeline } = await import("@jspsych/test-utils");
    const jsPsych = initJsPsych();
    const { timeline } = createTimeline(jsPsych, {
      practice_trials: 0,
      n_test_trials: 1,
      n_blocks: 1,
    });
    let outcome = "";
    for (const t of allTrials(timeline)) {
      if (t.data?.part === "feedback" && typeof t.stimulus === "function") {
        const f = t.stimulus;
        t.stimulus = () => (outcome = f());
      }
    }
    const { expectFinished } = await simulateTimeline(
      timeline,
      "data-only",
      { default: { data: { rt: 400 } } },
      jsPsych
    );
    await expectFinished();
    const { below } = expectAnchored(outcome);
    expect(below?.textContent).toMatch(/(You got a coin|No coin)Coins: \d+/);
  });

  it("the stylesheet anchors the stage at the vertical centre, and every selector is scoped", () => {
    const css = readFileSync(join(__dirname, "styles.css"), "utf8");
    const rule = (sel: string) =>
      new RegExp(`${sel.replace(/[.#]/g, "\\$&")}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? "";
    const stage = rule(".jspsych-timelines-two-step-task .ts-stage");
    expect(stage).toMatch(/position:\s*absolute/);
    expect(stage).toMatch(/top:\s*50%/);
    expect(stage).toMatch(/translate\(-50%,\s*-50%\)/);
    expect(rule(".jspsych-timelines-two-step-task .ts-below")).toMatch(/position:\s*absolute/);
    const selectors = css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("{")
      .slice(0, -1)
      .map((s) => s.split("}").pop()!.trim())
      .filter(Boolean);
    for (const sel of selectors)
      for (const part of sel.split(","))
        expect(part.trim()).toMatch(/^\.jspsych-timelines-two-step-task/);
    // text has one size: nothing but the fixation mark sets a larger one
    const sizes = [...css.matchAll(/font-size:\s*([^;]+);/g)].map((m) => m[1].trim());
    expect(sizes.filter((s) => !/^1em/.test(s))).toEqual(["3em"]);
  });
});
