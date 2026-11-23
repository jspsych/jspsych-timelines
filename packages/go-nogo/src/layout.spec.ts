import { readFileSync } from "fs";
import { join } from "path";

import { initJsPsych } from "jspsych";

import { GoNogoOptions } from "./options";
import { renderScreen, renderStage, renderStimulusScreen } from "./stimuli";
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
  const screens = host.querySelectorAll(".jspsych-timelines-go-nogo-screen");
  expect(screens).toHaveLength(1);
  const screen = screens[0];
  expect(host.querySelectorAll(".jspsych-timelines-go-nogo-stage")).toHaveLength(1);
  const stage = screen.querySelector(":scope > .jspsych-timelines-go-nogo-stage")!;
  expect(stage).not.toBeNull();
  for (const child of Array.from(screen.children)) {
    expect((child as HTMLElement).className).toMatch(/go-nogo-(stage|below)$/);
  }
  expect(stage.querySelector(".jspsych-timelines-go-nogo-text")).toBeNull();
  const below = screen.querySelector(":scope > .jspsych-timelines-go-nogo-below");
  if (below) expect(stage.compareDocumentPosition(below) & 4).toBeTruthy();
  return { screen, stage, below };
}

describe("go-nogo anchored stage layout", () => {
  it("renderStimulusScreen and renderStage wrap the stage in the screen wrapper", () => {
    for (const loc of ["center", "top_center", "top_left", "bottom_right"] as const) {
      const a = expectAnchored(
        renderStimulusScreen(
          "<svg></svg>",
          loc,
          '<div class="jspsych-timelines-go-nogo-text">hi</div>'
        )
      );
      expect(a.below?.textContent).toBe("hi");
      expect(a.stage.querySelectorAll("svg")).toHaveLength(1);
    }
    const grid = parse(renderStimulusScreen("<svg></svg>", "bottom_left"));
    expect(grid.querySelectorAll(".jspsych-timelines-go-nogo-cell")).toHaveLength(4);
    const b = expectAnchored(renderStage("+"));
    expect(b.below).toBeNull();
    expect(renderScreen("<i></i>", "")).not.toContain("go-nogo-below");
  });

  for (const [name, options] of [
    [
      "keyboard",
      {
        practice_trials: 2,
        n_test_trials: 2,
        iti_ms: 200,
        trial_feedback: "accuracy",
        pre_block_countdown_ms: 300,
        rule_reminder: "on_screen",
        inter_trial_display: "fixation_cross",
      },
    ],
    [
      "touch",
      {
        practice_trials: 2,
        n_test_trials: 2,
        iti_ms: 200,
        response_device: "touch",
        stimulus_layout: "random_2x2_grid",
      },
    ],
  ] as [string, GoNogoOptions][]) {
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
        if (typeof html !== "string" || !html.includes("go-nogo-stage")) continue;
        expectAnchored(html);
        parts.add(t.data?.part);
        checked++;
      }
      expect(checked).toBeGreaterThan(5);
      for (const p of ["response", "iti", "instruction_check", "instruction_feedback"]) {
        expect([...parts].some((x) => x === p || String(x).startsWith(p))).toBe(true);
      }
    });
  }

  it("keeps the rule reminder and the fixation cross out of the stage (they ride in the prompt)", () => {
    const t = allTrials(
      createTimeline(initJsPsych(), {
        practice_trials: 0,
        n_test_trials: 2,
        rule_reminder: "on_screen",
        inter_trial_display: "fixation_cross",
      }).timeline
    ).find((x) => x.data?.part === "response");
    expect(t.prompt).toContain("go-nogo-below");
    expect(t.prompt).toContain("go-nogo-bgfix");
    expect(parse(t.stimulus).querySelector(".jspsych-timelines-go-nogo-text")).toBeNull();
  });

  it("the stylesheet anchors the stage at the vertical centre; every selector is scoped", () => {
    const css = readFileSync(join(__dirname, "styles.css"), "utf8");
    const rule = (sel: string) =>
      new RegExp(`${sel.replace(/[.#]/g, "\\$&")}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? "";
    const stage = rule(".jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-stage");
    expect(stage).toMatch(/position:\s*absolute/);
    expect(stage).toMatch(/top:\s*50%/);
    expect(stage).toMatch(/translate\(-50%,\s*-50%\)/);
    expect(rule(".jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-below")).toMatch(
      /position:\s*absolute/
    );
    const selectors = css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("{")
      .slice(0, -1)
      .map((s) => s.split("}").pop()!.trim())
      .filter(Boolean);
    for (const sel of selectors)
      for (const part of sel.split(","))
        expect(part.trim()).toMatch(/^\.jspsych-timelines-go-nogo/);
  });
});
