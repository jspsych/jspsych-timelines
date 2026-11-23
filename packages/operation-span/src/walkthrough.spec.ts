import {
  clickTarget,
  flushPromises,
  pressKey,
  simulateTimeline,
  startTimeline,
} from "@jspsych/test-utils";
import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { INSTRUCTION_MAX_ATTEMPTS } from "./constants";
import { OperationSpanOptions } from "./options";
import { calculateScores } from "./scoring";
import { createTimeline, timelineUnits } from ".";

async function run(jsPsych: JsPsych, options: OperationSpanOptions) {
  const { timeline } = createTimeline(jsPsych, options);
  const { getData, expectFinished } = await simulateTimeline(
    timeline,
    "data-only",
    { default: { data: { rt: 400 } } },
    jsPsych
  );
  await expectFinished();
  return getData().values() as any[];
}

const checks = (rows: any[]) => rows.filter((r) => r.part === "instruction_check");
const SMALL: OperationSpanOptions = {
  set_sizes: [2],
  trials_per_condition: 1,
  practice_structure: "none",
};

describe("instruction walkthrough (interactive)", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("walk");
  });

  it("is the default: a true problem, a false problem, then a two-item recall, before practice", async () => {
    const rows = await run(jsPsych, {
      ...SMALL,
      practice_structure: "combined_only",
      practice_combined_trials: 1,
    });
    expect(checks(rows).map((r) => r.condition)).toEqual([
      "processing_true",
      "processing_false",
      "recall",
    ]);
    const idx = (f: (r: any) => boolean) => rows.findIndex(f);
    expect(idx((r) => r.part === "instruction_check")).toBeGreaterThan(
      idx((r) => r.part === "instruction")
    );
    expect(idx((r) => r.part === "instruction_check")).toBeLessThan(
      idx((r) => r.phase === "practice")
    );
  });

  it("answers correctly at the first attempt under simulation and is tagged", async () => {
    const c = checks(await run(jsPsych, SMALL));
    c.forEach((r) => {
      expect(r.phase).toBe("instructions");
      expect(r.correct).toBe(true);
      expect(r.attempt).toBe(1);
    });
    expect(c[0]).toMatchObject({ answer_is_true: true, correct_response: 0 }); // True button
    expect(c[1]).toMatchObject({ answer_is_true: false, correct_response: 1 }); // False button
    expect(c[2].presented_items).toHaveLength(2);
    expect(c[2].recalled_items).toEqual(c[2].presented_items);
  });

  it("uses the real memory items at task timing and the real recall input", async () => {
    const rows = await run(jsPsych, { ...SMALL, stimulus_duration_ms: 1100 });
    const demo = rows.filter(
      (r) =>
        r.phase === "instructions" && r.part === "instruction_example" && r.condition === "recall"
    );
    expect(demo).toHaveLength(2);
    demo.forEach((r) => expect(r).toMatchObject({ duration_ms: 1100, stimulus_duration: 1100 }));
    expect(checks(rows)[2]).toMatchObject({ response_format: "n_afc", response_order: "serial" });
  });

  it("is not scored", async () => {
    await run(jsPsych, { ...SMALL });
    const before = calculateScores(jsPsych.data.get());
    const bad = {
      task: "operation-span",
      phase: "instructions",
      part: "instruction_check",
      correct: false,
      rt: 5,
      set_size: 9,
      n_correct_positions: 0,
    };
    expect(
      calculateScores(new DataCollection([...(jsPsych.data.get().values() as any[]), bad]))
    ).toEqual(before);
    expect(before.n_trials).toBe(1);
  });

  it("is skipped for none and experimenter, static for examples, and throws for unsupported values", async () => {
    expect(
      checks(await run(jsPsych, { ...SMALL, instruction_demonstration: "none" }))
    ).toHaveLength(0);
    jsPsych = initJsPsych();
    expect(
      checks(await run(jsPsych, { ...SMALL, instruction_format: "experimenter" }))
    ).toHaveLength(0);
    jsPsych = initJsPsych();
    const rows = await run(jsPsych, { ...SMALL, instruction_demonstration: "examples" });
    expect(checks(rows)).toHaveLength(0);
    expect(rows.filter((r) => r.part === "instruction_example").map((r) => r.condition)).toEqual([
      "processing_true",
      "processing_false",
      "recall",
    ]);
    for (const v of ["animated", "guided_trial"] as const) {
      expect(() => createTimeline(initJsPsych(), { instruction_demonstration: v })).toThrow(
        new RegExp(`instruction_demonstration.*${v}`)
      );
    }
  });

  it("a span with no processing has only the recall step", async () => {
    const rows = await run(jsPsych, { ...SMALL, processing_items_per_memory_item: 0 });
    expect(checks(rows).map((r) => r.condition)).toEqual(["recall"]);
  });

  describe("real run", () => {
    const base: OperationSpanOptions = { ...SMALL, stimulus_duration_ms: 50 };
    afterEach(() => jest.useRealTimers());
    const button = (el: HTMLElement, label: string) =>
      Array.from(el.querySelectorAll("button")).find((b) => b.textContent === label) as HTMLElement;
    const walk = async (options: OperationSpanOptions) => {
      const ctx = timelineUnits.createContext(jsPsych, options);
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const started = await startTimeline([wt], jsPsych);
      await clickTarget(started.displayElement.querySelector("button")!); // intro page
      return started;
    };

    it("shows the problem, then the answer, and repeats a step with a hint after a wrong answer", async () => {
      const { displayElement, getData } = await walk(base);
      expect(displayElement.textContent).toMatch(/\(\d+ [×÷+−] \d+\) [+−] \d+ = \?/);
      expect(displayElement.textContent).toContain("Solved");
      await clickTarget(button(displayElement, "Solved"));
      // the answer screen: the true step wants True
      expect(displayElement.textContent).toContain("is correct");
      await clickTarget(button(displayElement, "False"));
      expect(displayElement.textContent).toContain("Not quite");
      await clickTarget(displayElement.querySelector("button")!);
      // the same step again, now right
      expect(displayElement.textContent).toMatch(/= \?/);
      await clickTarget(button(displayElement, "Solved"));
      jest.useFakeTimers();
      await clickTarget(button(displayElement, "True"));
      expect(displayElement.textContent).toContain("Correct!");
      jest.advanceTimersByTime(1000);
      await flushPromises();
      const rows = checks(getData().values() as any[]);
      expect(rows.map((r) => [r.condition, r.attempt, r.correct])).toEqual([
        ["processing_true", 1, false],
        ["processing_true", 2, true],
      ]);
    });

    it(`shows the answer after ${INSTRUCTION_MAX_ATTEMPTS} wrong attempts and moves on to the false problem`, async () => {
      const { displayElement, getData } = await walk(base);
      for (let i = 0; i < INSTRUCTION_MAX_ATTEMPTS; i++) {
        await clickTarget(button(displayElement, "Solved"));
        await clickTarget(button(displayElement, "False"));
        if (i < INSTRUCTION_MAX_ATTEMPTS - 1)
          expect(displayElement.textContent).toContain("Not quite");
        else expect(displayElement.textContent).toContain("Let's go on");
        await clickTarget(displayElement.querySelector("button")!);
      }
      // next step: the false problem
      await clickTarget(button(displayElement, "Solved"));
      expect(displayElement.textContent).toContain("is wrong");
      const rows = checks(getData().values() as any[]);
      expect(rows.map((r) => r.attempt)).toEqual([1, 2, 3]);
      expect(rows.every((r) => r.condition === "processing_true" && r.correct === false)).toBe(
        true
      );
    });

    it("follows the device and keys: keyboard keys named in words, space to say solved", async () => {
      const { displayElement } = await walk({
        ...base,
        response_device: { processing: "keyboard", recall: "mouse" },
        response_keys: ["a", "l"],
      });
      expect(displayElement.innerHTML).toContain("<kbd>space</kbd>");
      await pressKey(" ");
      expect(displayElement.innerHTML).toContain("<kbd>A</kbd>");
      expect(displayElement.innerHTML).not.toContain("<kbd>F</kbd>");
      await pressKey("a");
      jest.useFakeTimers();
      await flushPromises();
    });

    it("the recall step: blank recall repeats with a hint, a correct recall on the real grid passes", async () => {
      jest.useFakeTimers();
      const ctx = timelineUnits.createContext(jsPsych, {
        ...base,
        processing_items_per_memory_item: 0,
      });
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const { displayElement, getData } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!); // demo intro
      await clickTarget(displayElement.querySelector("button")!); // step text
      // two memory items at 50 ms
      const shown: string[] = [];
      for (let i = 0; i < 2; i++) {
        shown.push(displayElement.textContent!.trim());
        jest.advanceTimersByTime(60);
        await flushPromises();
      }
      expect(displayElement.querySelector(".jspsych-timelines-operation-span-grid")).not.toBeNull();
      await clickTarget(button(displayElement, "Done")); // nothing entered
      expect(displayElement.textContent).toContain("Not quite");
      await clickTarget(displayElement.querySelector("button")!);
      // second attempt: the same letters, then enter them in order
      const again: string[] = [];
      for (let i = 0; i < 2; i++) {
        again.push(displayElement.textContent!.trim());
        jest.advanceTimersByTime(60);
        await flushPromises();
      }
      expect(again).toEqual(shown);
      for (const letter of again) await clickTarget(button(displayElement, letter));
      await clickTarget(button(displayElement, "Done"));
      expect(displayElement.textContent).toContain("Correct!");
      const rows = checks(getData().values() as any[]);
      expect(rows.map((r) => [r.attempt, r.correct])).toEqual([
        [1, false],
        [2, true],
      ]);
      expect(rows[1].recalled_items).toEqual(shown);
    });
  });
});
