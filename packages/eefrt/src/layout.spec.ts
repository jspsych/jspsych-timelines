import { initJsPsych } from "jspsych";

import { TASK_CLASS } from "./constants";
import {
  renderCenterText,
  renderChoice,
  renderEffort,
  renderFixation,
  renderScreen,
} from "./stimuli";
import { defaultText } from "./text";
import { createTimeline, timelineUnits } from ".";

/**
 * Layout itself cannot be measured in jsdom (the real check is the stage-position measurement in a
 * browser, PACKAGE-STANDARD section 5; reproduction/layout.config.mjs). These tests guard the structure
 * that layout relies on: every task screen puts its stage in the anchored screen wrapper, and all text
 * goes in the region below it.
 */
const P = "jspsych-timelines-eefrt";

function parse(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  return host;
}

function allTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => allTrials(t, out));
  else if (tl?.timeline) allTrials(tl.timeline, out);
  else if (tl?.type) out.push(tl);
  return out;
}

function expectAnchored(html: string) {
  const host = parse(html);
  const screens = host.querySelectorAll(`.${P}-screen`);
  expect(screens).toHaveLength(1);
  const screen = screens[0];
  expect(host.querySelectorAll(`.${P}-stage`)).toHaveLength(1);
  const stage = screen.querySelector(`:scope > .${P}-stage`)!;
  expect(stage).not.toBeNull();
  // nothing but the stage and the text region sits in the flow beside it
  for (const child of Array.from(screen.children)) {
    expect((child as HTMLElement).className).toMatch(/eefrt-(stage|below)$/);
  }
  // text lives only in the below region, which follows the stage
  expect(stage.querySelector(`.${P}-text`)).toBeNull();
  const below = screen.querySelector(`:scope > .${P}-below`);
  if (below) expect(stage.compareDocumentPosition(below) & 4).toBeTruthy(); // FOLLOWING
  return { screen, stage, below };
}

const offer = { probability: 0.5, hard_reward: 2.5, easy_reward: 1, win: true, cell: 0 };
const choiceArgs = {
  offer,
  text: defaultText,
  outcome_type: "money" as const,
  easy_presses: 30,
  hard_presses: 100,
  easy_seconds: 7,
  hard_seconds: 21,
  easy_key: "<kbd>E</kbd>",
  hard_key: "<kbd>I</kbd>",
  probability_shown: true,
};

describe("eefrt anchored stage layout", () => {
  it("every screen wraps its stage in the screen wrapper", () => {
    expectAnchored(renderFixation(defaultText));
    expectAnchored(renderCenterText("Get ready", "ready"));
    expectAnchored(renderChoice(choiceArgs));
    expectAnchored(
      renderEffort({
        progress_indicator: "progress_bar",
        required: 30,
        count: 3,
        counter_text: (c, r) => `${c} / ${r}`,
        prompt: "<p>Press</p>",
      })
    );
    expect(renderScreen("<i></i>", "")).not.toContain("eefrt-below");
  });

  it("text goes below the stage: captions, prompts and notices", () => {
    const a = expectAnchored(renderChoice({ ...choiceArgs, below: "<p>Choose the easy task</p>" }));
    expect(a.below?.textContent).toBe("Choose the easy task");
    const b = expectAnchored(
      renderEffort({
        progress_indicator: "none",
        required: 5,
        count: 0,
        counter_text: () => "",
        prompt: "<p>Press space</p>",
      })
    );
    expect(b.below?.textContent).toBe("Press space");
    expect(b.stage.textContent).toBe("");
    const c = expectAnchored(
      renderCenterText("Get ready", "ready", "<p>The hard task is assigned</p>")
    );
    expect(c.below?.textContent).toBe("The hard task is assigned");
    expect(c.stage.textContent).toBe("Get ready");
  });

  it("the fixation mark is one layer through the stage centre, the same markup on every screen that has it", () => {
    const a = parse(renderFixation(defaultText));
    expect(a.querySelectorAll(`.${P}-fixation-layer .${P}-fixation`)).toHaveLength(1);
    expect(a.querySelector(`.${P}-fixation`)!.textContent).toBe("+");
    expect(renderFixation(defaultText, "<p>x</p>")).toContain(
      `<span class="${P}-fixation">+</span>`
    );
    // no other screen draws a fixation mark
    for (const html of [renderChoice(choiceArgs), renderCenterText("Get ready")]) {
      expect(parse(html).querySelector(`.${P}-fixation`)).toBeNull();
    }
  });

  it("the choice screen holds both tasks and the chance of winning in the stage", () => {
    const { stage } = expectAnchored(renderChoice(choiceArgs));
    expect(stage.querySelectorAll(`.${P}-card`)).toHaveLength(2);
    expect(stage.querySelector(`.${P}-chance`)!.textContent).toBe("50% chance of winning");
    expect(stage.textContent).toContain("30 presses in 7 seconds");
    expect(stage.textContent).toContain("100 presses in 21 seconds");
  });

  it("the progress bar and the counter are in the stage", () => {
    const bar = expectAnchored(
      renderEffort({
        progress_indicator: "progress_bar",
        required: 10,
        count: 5,
        counter_text: () => "",
        prompt: "",
      })
    );
    expect((bar.stage.querySelector(`.${P}-bar-fill`) as HTMLElement).style.width).toBe("50%");
    const counter = expectAnchored(
      renderEffort({
        progress_indicator: "counter",
        required: 10,
        count: 5,
        counter_text: (c, r) => `${c} / ${r}`,
        prompt: "",
      })
    );
    expect(counter.stage.querySelector(`.${P}-count`)!.textContent).toBe("5 / 10");
  });

  it("every trial of the built timeline sets the task class, and every task screen is built with the wrapper", () => {
    const ctx = timelineUnits.createContext(initJsPsych(), {
      task_end_rule: "fixed_trial_count",
      n_test_trials: 1,
    });
    const { timeline } = createTimeline(initJsPsych(), {});
    for (const t of allTrials(timeline)) expect(t.css_classes).toEqual([TASK_CLASS]);
    ctx.state.plan = {
      o: ctx.test,
      offer,
      completed: true,
      reward_won: 2.5,
      chosen_task: "hard",
      choice_forced: false,
      forced_by: null,
    } as any;
    const trials = allTrials(timelineUnits.createTrialLoop(ctx, "test").timeline);
    for (const part of ["fixation", "choice", "ready", "completion_feedback", "reward_feedback"]) {
      const t = trials.find((x) => x.data?.part === part);
      expect(t).toBeDefined();
      expectAnchored(t.stimulus());
    }
  });

  it("text is body size: the stylesheet gives no text a larger size than the fixation mark's", () => {
    const css = require("fs").readFileSync(
      require("path").join(__dirname, "styles.css"),
      "utf8"
    ) as string;
    const sizes = [...css.matchAll(/font-size:\s*([^;]+);/g)].map((m) => m[1].trim());
    // the fixation mark is larger; everything else is body size (1em)
    expect(sizes.filter((s) => s !== "1em")).toEqual(["3em"]);
  });
});
