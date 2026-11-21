import {
  clickTarget,
  flushPromises,
  pressKey,
  simulateTimeline,
  startTimeline,
} from "@jspsych/test-utils";
import { JsPsych, initJsPsych } from "jspsych";

import EffortPressPlugin from "./plugin";
import { hardChoiceProbability, simulatePressTimes } from "./simulation";

const effort = (o: Record<string, unknown> = {}) => ({
  type: EffortPressPlugin,
  keys: [" "],
  required_presses: 5,
  time_limit: 4000,
  prompt: "<p>Press space</p>",
  ...o,
});

describe("effort plugin (real key presses)", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jest.useFakeTimers();
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("plugin");
  });
  afterEach(() => jest.useRealTimers());

  it("ends on the required press count, records every press, and fills the bar as it goes", async () => {
    const { displayElement, getData, expectFinished } = await startTimeline([effort()], jsPsych);
    const fill = () =>
      displayElement.querySelector<HTMLElement>(".jspsych-timelines-eefrt-bar-fill")!.style.width;
    expect(fill()).toBe("0%");
    await pressKey(" ");
    expect(fill()).toBe("20%");
    for (let i = 0; i < 3; i++) await pressKey(" ");
    expect(fill()).toBe("80%");
    await pressKey(" ");
    await expectFinished();
    const d = getData().values()[0] as any;
    expect(d).toMatchObject({ press_count: 5, completed: true, required_presses: 5 });
    expect(d.press_times).toHaveLength(5);
    expect([...d.press_times].sort((a, b) => a - b)).toEqual(d.press_times);
    expect(d.task_duration_ms).toBe(d.press_times[4]);
    expect(d.rt).toBe(d.press_times[0]);
  });

  it("ends at the time limit with the presses made so far, not completed", async () => {
    const { getData, expectFinished } = await startTimeline(
      [effort({ time_limit: 1500 })],
      jsPsych
    );
    await pressKey(" ");
    await pressKey(" ");
    jest.advanceTimersByTime(1500);
    await flushPromises();
    await expectFinished();
    const d = getData().values()[0] as any;
    expect(d).toMatchObject({ press_count: 2, completed: false, task_duration_ms: 1500 });
  });

  it("no presses at all: rt is null, never a placeholder", async () => {
    const { getData, expectFinished } = await startTimeline([effort({ time_limit: 500 })], jsPsych);
    jest.advanceTimersByTime(500);
    await flushPromises();
    await expectFinished();
    expect(getData().values()[0]).toMatchObject({
      press_count: 0,
      completed: false,
      rt: null,
      press_times: [],
    });
  });

  it("only the listed keys count, and a held key (auto-repeat) is one press", async () => {
    const { displayElement, getData, expectFinished } = await startTimeline(
      [effort({ keys: ["f"] })],
      jsPsych
    );
    await pressKey(" ");
    await pressKey("j");
    // a held key repeats keydown without keyup
    const root = jsPsych.getDisplayContainerElement();
    for (let i = 0; i < 4; i++) root.dispatchEvent(new KeyboardEvent("keydown", { key: "f" }));
    root.dispatchEvent(new KeyboardEvent("keyup", { key: "f" }));
    for (let i = 0; i < 4; i++) await pressKey("f");
    await expectFinished();
    expect((getData().values()[0] as any).press_count).toBe(5);
  });

  it("a counter replaces the bar with progress_indicator: counter, nothing with none", async () => {
    const a = await startTimeline([effort({ progress_indicator: "counter" })], jsPsych);
    expect(a.displayElement.querySelector(".jspsych-timelines-eefrt-bar")).toBeNull();
    expect(a.displayElement.querySelector(".jspsych-timelines-eefrt-count")!.textContent).toBe(
      "0 / 5"
    );
    await pressKey(" ");
    expect(a.displayElement.querySelector(".jspsych-timelines-eefrt-count")!.textContent).toBe(
      "1 / 5"
    );
    jest.advanceTimersByTime(5000);
    await flushPromises();
    const j2 = initJsPsych();
    const b = await startTimeline([effort({ progress_indicator: "none" })], j2);
    expect(b.displayElement.querySelector(".jspsych-timelines-eefrt-bar")).toBeNull();
    expect(b.displayElement.querySelector(".jspsych-timelines-eefrt-count")).toBeNull();
    expect(b.displayElement.textContent).toContain("Press space");
  });
});

describe("effort plugin (simulation)", () => {
  it("data-only: presses at the given rate, completes when fast enough", async () => {
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("sim");
    const { getData, expectFinished } = await simulateTimeline(
      [
        effort({ required_presses: 30, time_limit: 7000, simulation_options: { press_rate: 6 } }),
        effort({ required_presses: 100, time_limit: 21000, simulation_options: { press_rate: 3 } }),
      ],
      "data-only",
      {},
      jsPsych
    );
    await expectFinished();
    const [fast, slow] = getData().values() as any[];
    expect(fast).toMatchObject({ completed: true, press_count: 30 });
    expect(fast.task_duration_ms).toBeLessThan(7000);
    expect(slow).toMatchObject({ completed: false, task_duration_ms: 21000 });
    expect(slow.press_count).toBeGreaterThan(40);
    expect(slow.press_count).toBeLessThan(80);
    slow.press_times.forEach((t: number) => expect(t).toBeLessThanOrEqual(21000));
  });

  it("force_complete always reaches the target", async () => {
    const jsPsych = initJsPsych();
    const { getData, expectFinished } = await simulateTimeline(
      [
        effort({
          required_presses: 30,
          time_limit: 2000,
          simulation_options: { press_rate: 2, force_complete: true },
        }),
      ],
      "data-only",
      {},
      jsPsych
    );
    await expectFinished();
    expect((getData().values()[0] as any).completed).toBe(true);
  });

  it("simulatePressTimes stops at the limit and at the target", () => {
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("t");
    const times = simulatePressTimes(jsPsych, 1000, 5000, 5);
    expect(times.length).toBeGreaterThan(15);
    expect(times.length).toBeLessThan(35);
    expect(times[times.length - 1]).toBeLessThanOrEqual(5000);
    expect(simulatePressTimes(jsPsych, 10, null, 5)).toHaveLength(10);
  });

  it("the choice model rises with probability and reward", () => {
    const at = (probability: number, hard_reward: number) =>
      hardChoiceProbability({ probability, hard_reward, easy_reward: 1 });
    expect(at(0.88, 2.5)).toBeGreaterThan(at(0.5, 2.5));
    expect(at(0.5, 2.5)).toBeGreaterThan(at(0.12, 2.5));
    expect(at(0.5, 4.3)).toBeGreaterThan(at(0.5, 2.5));
    expect(at(0.5, 2.5)).toBeGreaterThan(at(0.5, 1.24));
    expect(at(0.12, 1.24)).toBeGreaterThan(0);
    expect(at(0.88, 4.3)).toBeLessThan(1);
  });
});
