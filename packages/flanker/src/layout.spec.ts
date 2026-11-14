import { readFileSync } from "fs";
import { join } from "path";

import { initJsPsych } from "jspsych";

import { FlankerOptions } from "./options";
import { renderArray, renderScreen, renderStage } from "./stimuli";
import { createTimeline } from ".";

/**
 * Layout itself cannot be measured in jsdom (the real check is the stage-position measurement in
 * a browser, PACKAGE-STANDARD section 5). These tests guard the structure that layout relies on:
 * every task screen with a stimulus puts the stage in the anchored screen wrapper, and all text
 * goes in the region below it.
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
  const screens = host.querySelectorAll(".jspsych-timelines-flanker-screen");
  expect(screens).toHaveLength(1);
  const screen = screens[0];
  // the stage is a direct child of the screen wrapper, and the only stage
  expect(host.querySelectorAll(".jspsych-timelines-flanker-stage")).toHaveLength(1);
  const stage = screen.querySelector(":scope > .jspsych-timelines-flanker-stage")!;
  expect(stage).not.toBeNull();
  // no text outside stage and below-region (nothing in the flow that could move the stage)
  for (const child of Array.from(screen.children)) {
    const cls = (child as HTMLElement).className;
    expect(cls).toMatch(/flanker-(stage|below)$/);
  }
  // text lives only in the below region, which follows the stage
  expect(stage.querySelector(".jspsych-timelines-flanker-text")).toBeNull();
  const below = screen.querySelector(":scope > .jspsych-timelines-flanker-below");
  if (below) expect(stage.compareDocumentPosition(below) & 4).toBeTruthy(); // FOLLOWING
  return { screen, stage, below };
}

describe("flanker anchored stage layout", () => {
  it("renderArray and renderStage wrap the stage in the screen wrapper", () => {
    const arr = renderArray(
      {
        flankers: ["left", "left"],
        target: "right",
        size_px: 40,
        gap_px: 4,
        orientation: "horizontal",
        offset_px: 0,
        fg: "white",
        bg: "black",
      },
      '<div class="jspsych-timelines-flanker-text">hi</div>'
    );
    const a = expectAnchored(arr);
    expect(a.below?.textContent).toBe("hi");
    expect(a.stage.querySelector(".jspsych-timelines-flanker-array")).not.toBeNull();

    const b = expectAnchored(renderStage("+", "white", "black"));
    expect(b.below).toBeNull();
    expect(b.stage.textContent).toBe("+");

    expect(renderScreen("<i></i>", "")).not.toContain("flanker-below");
  });

  for (const [name, options] of [
    [
      "keyboard",
      {
        practice_trials: 2,
        n_test_trials: 2,
        iti_ms: 200,
        cue_target_interval_ms: 300,
        stimulus_set: { cue: "circles" },
        trial_feedback: "accuracy",
      },
    ],
    ["touch", { practice_trials: 2, n_test_trials: 2, iti_ms: 200, response_device: "touch" }],
  ] as [string, FlankerOptions][]) {
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
          continue; // depends on the previous response (feedback); covered by renderStage above
        }
        if (typeof html !== "string" || !html.includes("flanker-stage")) continue;
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

  it("the stylesheet anchors the stage at the vertical centre, below text region follows", () => {
    const css = readFileSync(join(__dirname, "styles.css"), "utf8");
    const rule = (sel: string) =>
      new RegExp(`${sel.replace(/[.#]/g, "\\$&")}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? "";
    const stage = rule(".jspsych-timelines-flanker .jspsych-timelines-flanker-stage");
    expect(stage).toMatch(/position:\s*absolute/);
    expect(stage).toMatch(/top:\s*50%/);
    expect(stage).toMatch(/translate\(-50%,\s*-50%\)/);
    expect(rule(".jspsych-timelines-flanker .jspsych-timelines-flanker-below")).toMatch(
      /position:\s*absolute/
    );
    // every selector is scoped under the task class
    const selectors = css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("{")
      .slice(0, -1)
      .map((s) => s.split("}").pop()!.trim())
      .filter(Boolean);
    for (const sel of selectors)
      for (const part of sel.split(","))
        expect(part.trim()).toMatch(/^\.jspsych-timelines-flanker/);
  });
});
