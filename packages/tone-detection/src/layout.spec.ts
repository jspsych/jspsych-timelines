import { flushPromises, pressKey, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import { renderScreen, renderStage } from "./stimuli";
import { createTimeline } from ".";

/**
 * Layout itself cannot be measured in jsdom (the real check is the stage-position measurement in a browser, PACKAGE-STANDARD section 5).
 * These tests guard the structure that layout relies on: every task screen puts the stage in the anchored screen wrapper, the interval
 * markers are the same on every screen of a trial, all text goes in the region below the stage, and the sound changes a class on a
 * marker, not the structure.
 */
const P = "jspsych-timelines-tone-detection";

const strip = (h: string) => h.replace(new RegExp(` ${P}-lit`, "g"), "");

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
    expect((child as HTMLElement).className).toMatch(/tone-detection-(stage|below)$/);
  }
  expect(stage.querySelector(`.${P}-text`)).toBeNull();
  const below = screen.querySelector(`:scope > .${P}-below`);
  if (below) expect(stage.compareDocumentPosition(below) & 4).toBeTruthy();
  return { screen, stage, below };
}

const markersOf = (host: ParentNode) =>
  Array.from(host.querySelectorAll(`.${P}-marker`)).map((m) => m.textContent);

describe("tone detection anchored stage layout", () => {
  it("the stage holds one marker per interval and nothing else; text goes below", () => {
    const s = expectAnchored(renderStage(["1", "2", "3"], `<div class="${P}-text">hi</div>`));
    expect(markersOf(s.stage)).toEqual(["1", "2", "3"]);
    expect(s.below?.textContent).toBe("hi");
    expect(expectAnchored(renderStage(["1", "2"])).below).toBeNull();
    expect(renderScreen("<i></i>", "")).not.toContain("below");
  });

  it("lighting an interval changes a class on its marker, not the structure", () => {
    const plain = parse(renderStage(["1", "2", "3"]));
    const lit = parse(renderStage(["1", "2", "3"], "", 2));
    expect(lit.querySelectorAll(`.${P}-lit`)).toHaveLength(1);
    expect(lit.querySelector(`.${P}-lit`)!.getAttribute("data-interval")).toBe("2");
    const strip = (h: HTMLElement) => h.innerHTML.replace(new RegExp(` ${P}-lit`, "g"), "");
    expect(strip(lit)).toBe(strip(plain));
  });

  it("every screen of a real trial (listening, answer, feedback, pause) draws the same markers in the anchored wrapper", async () => {
    jest.useFakeTimers();
    const jsPsych = initJsPsych();
    const { timeline } = createTimeline(jsPsych, {
      instruction_format: "experimenter",
      volume_calibration: "none",
      headphone_check: "none",
      practice_trials: 0,
      trials_per_condition: 1,
      adaptive: { discontinue_rule: { trials: 2 } },
      trial_feedback: "accuracy",
      iti_ms: 200,
      feedback_duration_ms: 300,
    });
    const { displayElement, expectRunning, expectFinished } = await startTimeline(
      [timeline],
      jsPsych
    );
    await expectRunning();
    const seen: Array<{ kind: string; html: string }> = [];
    const snap = (kind: string) => seen.push({ kind, html: displayElement.innerHTML });
    // listening: the sound screen has no keys; wait for it, then answer, then feedback, then the pause
    const first = displayElement.innerHTML;
    snap("listen");
    expect(first).toContain(`${P}-stage`);
    // the markers follow the intervals: after the lead-in (300 ms) and the start delay (50 ms) interval 1 is lit, in the same stage
    await jest.advanceTimersByTimeAsync(400);
    const litNow = displayElement.querySelectorAll(`.${P}-lit`);
    expect(litNow).toHaveLength(1);
    expect(litNow[0].getAttribute("data-interval")).toBe("1");
    expect(strip(displayElement.innerHTML)).toBe(strip(first));
    await jest.advanceTimersByTimeAsync(300 + 3 * 250 + 2 * 250 + 60 - 400);
    snap("response");
    await pressKey("1");
    await flushPromises();
    snap("feedback");
    await jest.advanceTimersByTimeAsync(310);
    snap("pause");
    await jest.advanceTimersByTimeAsync(210);
    jest.useRealTimers();
    expect(seen.map((s) => s.kind)).toEqual(["listen", "response", "feedback", "pause"]);
    for (const s of seen) {
      const host = parse(s.html);
      expect(host.querySelectorAll(`.${P}-screen`)).toHaveLength(1);
      expect(markersOf(host)).toEqual(["1", "2", "3"]);
      const stage = host.querySelector(`.${P}-stage`)!;
      expect(strip(stage.outerHTML)).toBe(
        strip(parse(seen[0].html).querySelector(`.${P}-stage`)!.outerHTML)
      );
    }
    expect(seen[0].html).toContain("Listen.");
    expect(seen[1].html).toContain("Which interval contained the beep?");
    expect(seen[1].html).toContain("Progress: 1/2");
    expect(parse(seen[2].html).querySelector(`.${P}-below .${P}-feedback`)).not.toBeNull();
    expect(parse(seen[3].html).querySelector(`.${P}-below`)).toBeNull();
    void expectFinished;
  });

  it("text pages carry no stage (full-page, left-aligned) and the sound button is not a jspsych-btn", () => {
    const { timeline } = createTimeline(initJsPsych(), {});
    const trials: any[] = [];
    const visit = (t: any): void =>
      Array.isArray(t)
        ? t.forEach(visit)
        : t?.timeline
        ? visit(t.timeline)
        : t?.type && trials.push(t);
    visit(timeline);
    const instr = trials.find((t) => t.data?.part === "instruction");
    expect(instr.stimulus).toContain(`${P}-text`);
    expect(instr.stimulus).not.toContain(`${P}-stage`);
    const vol = trials.find((t) => t.data?.part === "volume_calibration");
    expect(vol.stimulus).toContain(`${P}-sound`);
    expect(vol.stimulus).not.toContain("jspsych-btn");
  });
});
