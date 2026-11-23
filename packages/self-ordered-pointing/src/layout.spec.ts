import { initJsPsych } from "jspsych";

import { SelfOrderedPointingOptions } from "./options";
import { stimuli } from "./sets";
import { itemButtonHtml, renderPickScreen, renderScreen } from "./stimuli";
import { createTimeline } from ".";

/**
 * Layout itself cannot be measured in jsdom (the real check is the stage-position measurement in a browser,
 * PACKAGE-STANDARD section 5, reproduction/layout.config.mjs). These tests guard the structure the layout relies on:
 * a screen with a stage puts one stage in the anchored wrapper and all text in the region below it; a pick screen has
 * no stage element (the plugin's button group is the stage) and carries the pick class on the display element.
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
const evalStim = (t: any) => (typeof t.stimulus === "function" ? t.stimulus() : t.stimulus);

describe("anchored stage layout", () => {
  it("renderScreen wraps one stage in the screen wrapper, text only below it", () => {
    const host = parse(
      renderScreen(
        "<b>New</b>",
        "<div class='jspsych-timelines-self-ordered-pointing-text'>hi</div>"
      )
    );
    const screen = host.querySelector(".jspsych-timelines-self-ordered-pointing-screen")!;
    expect(host.querySelectorAll(".jspsych-timelines-self-ordered-pointing-stage")).toHaveLength(1);
    for (const child of Array.from(screen.children))
      expect((child as HTMLElement).className).toMatch(/self-ordered-pointing-(stage|below)$/);
    expect(
      screen.querySelector(
        ".jspsych-timelines-self-ordered-pointing-stage .jspsych-timelines-self-ordered-pointing-text"
      )
    ).toBeNull();
  });

  it("a pick screen has no stage element, only the text region", () => {
    const host = parse(renderPickScreen("<p>x</p>"));
    expect(host.querySelectorAll(".jspsych-timelines-self-ordered-pointing-stage")).toHaveLength(0);
    expect(host.querySelectorAll(".jspsych-timelines-self-ordered-pointing-below")).toHaveLength(1);
  });

  it("item buttons are `.jspsych-btn` (the layout driver reaches them) and carry their id and an accessible name", () => {
    const b = parse(
      itemButtonHtml({
        item: {
          id: "design-01",
          kind: "svg",
          content: '<svg viewBox="0 0 100 100"><path d="M0 0Z"/></svg>',
        },
        slot: 4,
        n: 6,
        aria_label: "Item 5",
      })
    ).querySelector("button")!;
    expect(b.className).toContain("jspsych-btn");
    expect(b.getAttribute("data-item")).toBe("design-01");
    expect(b.getAttribute("aria-label")).toBe("Item 5");
    expect(b.querySelector("svg")).not.toBeNull();
    const free = parse(
      itemButtonHtml({
        item: { id: "a", kind: "text", content: "a" },
        slot: 4,
        n: 6,
        aria_label: "x",
        jitter: { u: 0.5, v: 0.25 },
      })
    ).querySelector("button")!;
    expect(free.getAttribute("style")).toBe("--row:1;--col:1;--u:0.5;--v:0.25");
    expect(
      parse(
        itemButtonHtml({
          item: { id: "a", kind: "text", content: "a" },
          slot: 0,
          n: 6,
          aria_label: "x",
          disabled: true,
        })
      )
        .querySelector("button")!
        .hasAttribute("disabled")
    ).toBe(true);
  });

  for (const [name, options] of [
    [
      "mouse, designs, practice with feedback",
      { set_sizes: [4], trials_per_condition: 1, practice_trials: 1 },
    ],
    [
      "touch, words, free positions, all rules",
      {
        set_sizes: [5],
        trials_per_condition: 1,
        practice_trials: 1,
        response_device: "touch",
        stimulus_layout: "free_positions_in_area",
        stimulus_set: { items: stimuli.words },
        response_window_ms: 3000,
        end_of_task_feedback: "score",
      },
    ],
    [
      "detect and remind",
      {
        set_sizes: [4],
        trials_per_condition: 1,
        position_repeat_rule: "detect_and_remind",
        trial_feedback: "accuracy",
      },
    ],
  ] as [string, SelfOrderedPointingOptions][]) {
    it(`every task screen is anchored: ${name}`, () => {
      const { timeline } = createTimeline(initJsPsych(), options);
      const trials = allTrials(timeline);
      expect(trials.length).toBeGreaterThan(10);
      for (const t of trials) {
        expect(t.css_classes).toContain("jspsych-timelines-self-ordered-pointing");
        const part = t.data?.part;
        const isPick = (t.css_classes as string[]).includes(
          "jspsych-timelines-self-ordered-pointing-pick"
        );
        const html: string = isPick ? "" : evalStim(t);
        if (isPick) {
          expect(["response", "instruction_check"]).toContain(part);
          expect(t.button_layout).toBe("grid");
        } else if (part === "iti" || part === "feedback" || part === "instruction_feedback") {
          const host = parse(html);
          expect(
            host.querySelectorAll(".jspsych-timelines-self-ordered-pointing-stage")
          ).toHaveLength(1);
        } else {
          // text pages: one text block, no stage
          expect(
            parse(html).querySelectorAll(".jspsych-timelines-self-ordered-pointing-stage")
          ).toHaveLength(0);
        }
      }
    });
  }
});
