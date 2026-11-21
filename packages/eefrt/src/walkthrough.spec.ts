import {
  clickTarget,
  flushPromises,
  pressKey,
  simulateTimeline,
  startTimeline,
} from "@jspsych/test-utils";
import { JsPsych, initJsPsych } from "jspsych";

import { INSTRUCTION_CORRECT_MS, INSTRUCTION_MAX_ATTEMPTS } from "./constants";
import { EefrtOptions } from "./options";
import { calculateScores } from "./scoring";
import { createTimeline, timelineUnits } from ".";

async function run(jsPsych: JsPsych, options: EefrtOptions) {
  const { timeline } = createTimeline(jsPsych, options);
  const { getData, expectFinished } = await simulateTimeline(timeline, "data-only", {}, jsPsych);
  await expectFinished();
  return getData().values() as any[];
}

const checks = (rows: any[]) => rows.filter((r) => r.part === "instruction_check");

describe("instruction walkthrough (interactive)", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("walk");
  });

  it("is the default: choose the easy task, choose the hard task, do the easy task; before practice", async () => {
    const rows = await run(jsPsych, { task_end_rule: "fixed_trial_count", n_test_trials: 2 });
    expect(checks(rows).map((r) => r.step)).toEqual(["choose_easy", "choose_hard", "effort_easy"]);
    const idx = (f: (r: any) => boolean) => rows.findIndex(f);
    expect(idx((r) => r.part === "instruction_check")).toBeGreaterThan(
      idx((r) => r.part === "instruction")
    );
    expect(idx((r) => r.part === "instruction_check")).toBeLessThan(
      idx((r) => r.phase === "practice")
    );
  });

  it("answers correctly at the first attempt under simulation, and is tagged and never scored", async () => {
    const rows = await run(jsPsych, { task_end_rule: "fixed_trial_count", n_test_trials: 2 });
    const c = checks(rows);
    c.forEach((r) => {
      expect(r.phase).toBe("instructions");
      expect(r.correct).toBe(true);
      expect(r.attempt).toBe(1);
      expect(r.task).toBe("eefrt");
    });
    expect(c.map((r) => r.choice).slice(0, 2)).toEqual(["easy", "hard"]);
    expect(c[2]).toMatchObject({ completed: true, press_count: 30, required_presses: 30 });
    // hint and confirmation rows are instruction_feedback
    expect(
      rows.filter((r) => r.part === "instruction_feedback").every((r) => r.phase === "instructions")
    ).toBe(true);
    // the scores see none of it
    const s = calculateScores(jsPsych.data.get());
    expect(s.n_trials).toBe(2);
  });

  it("the walkthrough does not count toward practice_trials", async () => {
    const rows = await run(jsPsych, {
      practice_trials: 2,
      task_end_rule: "fixed_trial_count",
      n_test_trials: 2,
    });
    expect(rows.filter((r) => r.phase === "practice" && r.part === "response")).toHaveLength(2);
    expect(checks(rows)).toHaveLength(3);
  });

  it("is skipped for none and experimenter, and throws for unsupported values", async () => {
    const base: EefrtOptions = { task_end_rule: "fixed_trial_count", n_test_trials: 2 };
    expect(checks(await run(jsPsych, { ...base, instruction_demonstration: "none" }))).toHaveLength(
      0
    );
    expect(
      checks(await run(initJsPsych(), { ...base, instruction_format: "experimenter" }))
    ).toHaveLength(0);
    for (const v of ["examples", "animated", "guided_trial"] as const) {
      expect(() => createTimeline(initJsPsych(), { instruction_demonstration: v })).toThrow(
        new RegExp(`instruction_demonstration.*${v}`)
      );
    }
  });

  describe("real run (key presses)", () => {
    const base: EefrtOptions = {
      practice_trials: 0,
      response_keys: ["f", "j"],
      response_key_mapping: { easy: "a", hard: "a" },
      difficulty_levels: { easy: 4, hard: 6 },
      response_window_ms: { easy: 3000, hard: 5000 },
      reward_probability: [0.5],
      reward_magnitude: { easy: 1, hard: { levels: [3] } },
    };
    afterEach(() => jest.useRealTimers());
    const text = (el: HTMLElement) => el.textContent ?? "";

    async function start() {
      jest.useFakeTimers();
      const ctx = timelineUnits.createContext(jsPsych, base);
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const started = await startTimeline([wt], jsPsych);
      await clickTarget(started.displayElement.querySelector("button")!); // the intro page
      return started;
    }

    it("shows the real choice screen as configured, with a caption naming the key", async () => {
      const { displayElement } = await start();
      expect(displayElement.querySelector(".jspsych-timelines-eefrt-choice")).not.toBeNull();
      const html = displayElement.innerHTML;
      expect(html).toContain("Choose the <strong>easy</strong> task: press <kbd>F</kbd>");
      // the demo offer is a middle one of the configured design
      expect(html).toContain("50% chance of winning");
      expect(html).toContain("$3.00");
      expect(html).toContain("4 presses in 3 seconds");
      expect(html).toContain("6 presses in 5 seconds");
    });

    it("repeats a step with a hint after a wrong choice, then advances; the hard step asks for the other key", async () => {
      const { displayElement, getData } = await start();
      await pressKey("j"); // the hard task, when the easy one was asked for
      expect(text(displayElement)).toContain("That chose the hard task");
      expect(text(displayElement)).toContain("F");
      await clickTarget(displayElement.querySelector("button")!);
      expect(displayElement.innerHTML).toContain("Choose the <strong>easy</strong> task");
      await pressKey("f");
      expect(text(displayElement)).toContain("Good!");
      jest.advanceTimersByTime(INSTRUCTION_CORRECT_MS + 100);
      await flushPromises();
      expect(displayElement.innerHTML).toContain(
        "Choose the <strong>hard</strong> task: press <kbd>J</kbd>"
      );
      expect(displayElement.innerHTML).toContain("You will not have to do it now");
      const rows = checks(getData().values() as any[]);
      expect(rows.map((r) => [r.step, r.attempt, r.correct])).toEqual([
        ["choose_easy", 1, false],
        ["choose_easy", 2, true],
      ]);
    });

    it(`shows the answer after ${INSTRUCTION_MAX_ATTEMPTS} wrong attempts and moves on`, async () => {
      const { displayElement, getData } = await start();
      for (let i = 0; i < INSTRUCTION_MAX_ATTEMPTS; i++) {
        await pressKey("j");
        if (i === INSTRUCTION_MAX_ATTEMPTS - 1)
          expect(text(displayElement)).toContain("On to the next step");
        else expect(text(displayElement)).toContain("This time press");
        await clickTarget(displayElement.querySelector("button")!);
      }
      expect(displayElement.innerHTML).toContain("Choose the <strong>hard</strong> task");
      const rows = checks(getData().values() as any[]);
      expect(rows.map((r) => r.attempt)).toEqual([1, 2, 3]);
      expect(rows.every((r) => r.step === "choose_easy" && r.correct === false)).toBe(true);
    });

    it("the effort step is the easy task with its real requirement and limit; not completing shows a hint", async () => {
      const { displayElement, getData } = await start();
      await pressKey("f");
      jest.advanceTimersByTime(INSTRUCTION_CORRECT_MS + 100);
      await flushPromises();
      await pressKey("j");
      jest.advanceTimersByTime(INSTRUCTION_CORRECT_MS + 100);
      await flushPromises();
      // now the effort step: the bar and the prompt
      expect(displayElement.querySelector(".jspsych-timelines-eefrt-bar")).not.toBeNull();
      expect(text(displayElement)).toContain("Try the easy task: press A 4 times in 3 seconds");
      await pressKey("a");
      await pressKey("a");
      jest.advanceTimersByTime(3000);
      await flushPromises();
      expect(text(displayElement)).toContain("The bar did not fill in time");
      await clickTarget(displayElement.querySelector("button")!);
      for (let i = 0; i < 4; i++) await pressKey("a");
      expect(text(displayElement)).toContain("Good!");
      const rows = checks(getData().values() as any[]).filter((r) => r.step === "effort_easy");
      expect(rows.map((r) => [r.attempt, r.correct, r.press_count])).toEqual([
        [1, false, 2],
        [2, true, 4],
      ]);
    });
  });
});
