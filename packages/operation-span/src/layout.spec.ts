import { readFileSync } from "fs";
import { join } from "path";

import { initJsPsych } from "jspsych";

import { OperationSpanOptions } from "./options";
import { renderRecallPanel, renderScreen } from "./stimuli";
import { defaultText } from "./text";
import { createTimeline, utils } from ".";

/**
 * Layout itself cannot be measured in jsdom (the real check is the stage-position measurement in a
 * browser, PACKAGE-STANDARD section 5, reproduction/layout.config.mjs). These tests guard the structure
 * the layout relies on: every task screen puts one stage in the anchored screen wrapper, and all text
 * goes in the region below it. The recall panel is the same wrapper with the taller-stage modifier.
 */
function allTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => allTrials(t, out));
  else if (tl?.timeline) allTrials(tl.timeline, out);
  else if (tl?.type) out.push(tl);
  return out;
}

const parse = (html: string) => {
  const host = document.createElement("div");
  host.innerHTML = html;
  return host;
};

function expectAnchored(html: string) {
  const host = parse(html);
  const screens = host.querySelectorAll(".jspsych-timelines-operation-span-screen");
  expect(screens).toHaveLength(1);
  const screen = screens[0];
  expect(host.querySelectorAll(".jspsych-timelines-operation-span-stage")).toHaveLength(1);
  const stage = screen.querySelector(":scope > .jspsych-timelines-operation-span-stage")!;
  expect(stage).not.toBeNull();
  // nothing but the stage and the region below it, so nothing in the flow can move the stage
  for (const child of Array.from(screen.children)) {
    expect((child as HTMLElement).className).toMatch(/operation-span-(stage|below)$/);
  }
  expect(stage.querySelector(".jspsych-timelines-operation-span-text")).toBeNull();
  const below = screen.querySelector(":scope > .jspsych-timelines-operation-span-below");
  if (below) expect(stage.compareDocumentPosition(below) & 4).toBeTruthy(); // FOLLOWING
  return { screen, stage, below };
}

describe("operation span anchored stage layout", () => {
  it("renderScreen wraps the stage in the screen wrapper; the recall panel is a taller stage on the same wrapper", () => {
    const a = expectAnchored(
      renderScreen("<b>7</b>", "<div class='jspsych-timelines-operation-span-text'>hi</div>")
    );
    expect(a.below?.textContent).toBe("hi");
    expect(a.screen.className).not.toContain("screen-recall");
    const b = expectAnchored(renderScreen("F", ""));
    expect(b.below).toBeNull();
    const panel = renderRecallPanel(
      {
        format: "n_afc",
        order: "serial",
        omission: "blank_button",
        set_size: 3,
        pool: ["F", "H", "J"],
        noun: "letter",
        nouns: "letters",
      },
      defaultText
    );
    const c = expectAnchored(renderScreen(panel, "", true));
    expect(c.screen.className).toContain("jspsych-timelines-operation-span-screen-recall");
    // the controls of the matrix are inside the stage; the Done button is the plugin's, below it
    expect(c.stage.querySelectorAll(".jspsych-timelines-operation-span-key")).toHaveLength(3);
    expect(c.stage.querySelector('[data-action="blank"]')).not.toBeNull();
    // the matrix keys and controls are not `.jspsych-btn`, so the layout driver reaches the plugin's Done button
    expect(c.stage.querySelector(".jspsych-btn")).toBeNull();
  });

  for (const [name, options] of [
    ["mouse, two-screen, matrix recall", { set_sizes: [2], trials_per_condition: 1 }],
    [
      "keyboard, single-screen, typed recall",
      {
        set_sizes: [2],
        trials_per_condition: 1,
        processing_display_format: "equation_with_answer_single_screen",
        response_device: { processing: "keyboard", recall: "keyboard" },
        response_format: "free_text",
        inter_item_interval_ms: 200,
      },
    ],
    [
      "digits",
      {
        set_sizes: [2],
        trials_per_condition: 1,
        stimulus_set: utils.stimuli.digits,
      },
    ],
    [
      "touch, memory item first",
      {
        set_sizes: [2],
        trials_per_condition: 1,
        response_device: "touch",
        order_in_pair: "memory_item_first",
        inter_item_interval_ms: 200,
      },
    ],
  ] as [string, OperationSpanOptions][]) {
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
          continue; // depends on the previous trial (feedback); covered by renderScreen above
        }
        if (typeof html !== "string" || !html.includes("operation-span-stage")) continue;
        expectAnchored(html);
        parts.add(t.data?.part);
        checked++;
      }
      expect(checked).toBeGreaterThan(8);
      const need = [
        "memory_item",
        "processing",
        "response",
        "instruction_check",
        "instruction_example",
      ];
      if (options.inter_item_interval_ms) need.push("inter_item");
      for (const p of need) expect([...parts]).toContain(p);
    });
  }

  it("the stylesheet anchors the stage at the vertical centre, the recall panel is taller on the same centre", () => {
    const css = readFileSync(join(__dirname, "styles.css"), "utf8");
    const rule = (sel: string) =>
      new RegExp(`${sel.replace(/[.#]/g, "\\$&")}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? "";
    const stage = rule(".jspsych-timelines-operation-span .jspsych-timelines-operation-span-stage");
    expect(stage).toMatch(/position:\s*absolute/);
    expect(stage).toMatch(/top:\s*50%/);
    expect(stage).toMatch(/translate\(-50%,\s*-50%\)/);
    expect(stage).toMatch(/height:\s*var\(--ospan-stage-h\)/);
    expect(
      rule(".jspsych-timelines-operation-span .jspsych-timelines-operation-span-screen-recall")
    ).toMatch(/--ospan-stage-h:\s*var\(--ospan-recall-h\)/);
    expect(
      rule(".jspsych-timelines-operation-span .jspsych-timelines-operation-span-below")
    ).toMatch(/position:\s*absolute/);
    // every selector is scoped under the task class
    const selectors = css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("{")
      .slice(0, -1)
      .map((s) => s.split("}").pop()!.trim())
      .filter((s) => s && !s.startsWith("@media"));
    for (const sel of selectors)
      for (const part of sel.split(","))
        expect(part.trim()).toMatch(/^\.jspsych-timelines-operation-span/);
  });
});
