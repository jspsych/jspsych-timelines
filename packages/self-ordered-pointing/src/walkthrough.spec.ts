import { clickTarget, flushPromises, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { INSTRUCTION_MAX_ATTEMPTS, INSTRUCTION_SET_SIZE } from "./constants";
import { SelfOrderedPointingOptions } from "./options";
import { calculateScores } from "./scoring";
import { createTimeline, timelineUnits } from ".";

async function run(jsPsych: JsPsych, options: SelfOrderedPointingOptions) {
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
const SMALL: SelfOrderedPointingOptions = { set_sizes: [3], trials_per_condition: 1 };

describe("instruction walkthrough (interactive)", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("walk");
  });

  it("is the default: three picks on a set of three, before practice", async () => {
    const rows = await run(jsPsych, { ...SMALL, practice_trials: 1 });
    expect(checks(rows).map((r) => r.condition)).toEqual(["first", "new", "last"]);
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
    expect(c).toHaveLength(INSTRUCTION_SET_SIZE);
    c.forEach((r) => {
      expect(r).toMatchObject({
        phase: "instructions",
        correct: true,
        attempt: 1,
        is_repeat_error: false,
        set_size: 3,
      });
    });
    // the three picks are the three different items
    expect(new Set(c.map((r) => r.chosen_item_id)).size).toBe(3);
  });

  it("is not scored", async () => {
    await run(jsPsych, { ...SMALL });
    const before = calculateScores(jsPsych.data.get());
    const bad = {
      task: "self-ordered-pointing",
      phase: "instructions",
      part: "instruction_check",
      is_repeat_error: true,
      correct: false,
      rt: 5,
      set_size: 3,
      series: 1,
    };
    expect(
      calculateScores(new DataCollection([...(jsPsych.data.get().values() as any[]), bad]))
    ).toEqual(before);
    expect(before.n_series).toBe(1);
  });

  it("is skipped for none and experimenter, and throws for unsupported values", async () => {
    expect(
      checks(await run(jsPsych, { ...SMALL, instruction_demonstration: "none" }))
    ).toHaveLength(0);
    jsPsych = initJsPsych();
    expect(
      checks(await run(jsPsych, { ...SMALL, instruction_format: "experimenter" }))
    ).toHaveLength(0);
    for (const v of ["examples", "animated", "guided_trial"] as const) {
      expect(() => createTimeline(initJsPsych(), { instruction_demonstration: v })).toThrow(
        new RegExp(`instruction_demonstration.*${v}`)
      );
    }
  });

  it("is untimed and has no position rule, whatever the task has", async () => {
    const rows = await run(jsPsych, {
      ...SMALL,
      response_window_ms: 1500,
      position_repeat_rule: "enforced",
    });
    const c = checks(rows);
    expect(c).toHaveLength(3);
    c.forEach((r) => {
      expect(r.response_window).toBeNull();
      expect(r.timeout).toBe(false);
      expect(r.position_rule_violation).toBe(false);
      expect(r.disabled_position).toBeNull();
    });
  });

  it("uses the walkthrough's own items, which the practice and the test never use under distinct pools", async () => {
    const rows = await run(jsPsych, {
      ...SMALL,
      practice_trials: 1,
      stimulus_set: { pool: "distinct_per_set_size" },
    });
    const walk = new Set(checks(rows).flatMap((r) => r.item_arrangement));
    const rest = new Set(
      rows.filter((r) => r.part === "response").flatMap((r) => r.item_arrangement)
    );
    walk.forEach((id) => expect(rest.has(id)).toBe(false));
  });

  describe("real run", () => {
    afterEach(() => jest.useRealTimers());
    const walk = async (options: SelfOrderedPointingOptions) => {
      jest.useFakeTimers();
      const ctx = timelineUnits.createContext(jsPsych, options);
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const started = await startTimeline([wt], jsPsych);
      await clickTarget(started.displayElement.querySelector("button")!); // intro page
      return started;
    };
    const item = (el: HTMLElement, id: string) =>
      el.querySelector<HTMLElement>(`button[data-item="${id}"]`)!;
    const anyEnabled = (el: HTMLElement) =>
      el.querySelector<HTMLElement>(".jspsych-btn:not([disabled])")!;
    const confirm = async () => {
      jest.advanceTimersByTime(1000);
      await flushPromises();
    };

    it("repeats a step with a hint after a repeat, and the real items move again", async () => {
      const { displayElement, getData } = await walk(SMALL);
      expect(displayElement.textContent).toContain("Pick any design.");
      const grids: string[][] = [];
      const order = () =>
        Array.from(displayElement.querySelectorAll("button[data-item]")).map(
          (b) => b.getAttribute("data-item")!
        );
      grids.push(order());
      await clickTarget(anyEnabled(displayElement));
      await confirm();
      const first = (getData().values() as any[])[1].chosen_item_id; // the first pick (row 0 is the intro page)
      expect(displayElement.textContent).toContain("have moved");
      grids.push(order());
      await clickTarget(item(displayElement, first)); // a repeat
      expect(displayElement.textContent).toContain("already picked that design");
      await clickTarget(anyEnabled(displayElement)); // continue
      // the same step again, the items moved
      expect(displayElement.textContent).toContain("have moved");
      grids.push(order());
      expect(grids[2].join()).not.toBe(grids[1].join());
      const fresh = order().find((id) => id !== first)!;
      await clickTarget(item(displayElement, fresh));
      await confirm();
      const rows = checks(getData().values() as any[]);
      expect(rows.map((r) => [r.condition, r.attempt, r.correct, r.is_repeat_error])).toEqual([
        ["first", 1, true, false],
        ["new", 1, false, true],
        ["new", 2, true, false],
      ]);
      expect(displayElement.textContent).toContain("You have picked 2 of 3");
    });

    it(`shows the item that was not picked after ${INSTRUCTION_MAX_ATTEMPTS} repeats and moves on`, async () => {
      const { displayElement, getData } = await walk(SMALL);
      await clickTarget(anyEnabled(displayElement));
      await confirm();
      const first = (getData().values() as any[])[1].chosen_item_id;
      for (let i = 0; i < INSTRUCTION_MAX_ATTEMPTS; i++) {
        await clickTarget(item(displayElement, first));
        if (i < INSTRUCTION_MAX_ATTEMPTS - 1) {
          expect(displayElement.textContent).toContain("already picked");
          await clickTarget(anyEnabled(displayElement));
        }
      }
      // the answer is shown with the item that was not picked
      expect(displayElement.textContent).toContain("had not picked yet");
      expect(displayElement.querySelector("svg")).not.toBeNull();
      await clickTarget(anyEnabled(displayElement));
      // next step: the last item, with two picked (the revealed one counts)
      expect(displayElement.textContent).toContain("You have picked 2 of 3");
      const rows = checks(getData().values() as any[]);
      expect(rows.filter((r) => r.condition === "new").map((r) => r.attempt)).toEqual([1, 2, 3]);
      const feedback = (getData().values() as any[]).filter(
        (r) => r.part === "instruction_feedback"
      );
      expect(feedback.map((r) => r.feedback_kind)).toEqual(["correct", "hint", "hint", "reveal"]);
    });

    it("describes the stimulus and the response as configured: words, touch, partial reshuffle", async () => {
      const { displayElement } = await walk({
        ...SMALL,
        stimulus_set: { items: "words" },
        response_device: "touch",
        rearrangement_rule: "partial_reshuffle_each_page",
      });
      expect(displayElement.textContent).toContain("Pick any word.");
      expect(displayElement.textContent).not.toContain("design");
      // only some of the items move between pages, and the caption of the next step and the hint say so
      await clickTarget(displayElement.querySelector<HTMLElement>(".jspsych-btn:not([disabled])")!);
      jest.advanceTimersByTime(1000);
      await flushPromises();
      expect(displayElement.textContent).toContain("Some of the words have moved");
      const first = checks(jsPsych.data.get().values() as any[])[0];
      await clickTarget(
        displayElement.querySelector<HTMLElement>(`button[data-item="${first.chosen_item_id}"]`)!
      );
      expect(displayElement.textContent).toContain("Some of the words will move again");
      // the demo items are words, drawn by the same function as the task
      const words = Array.from(displayElement.querySelectorAll("button[data-item]")).map(
        (b) => b.textContent
      );
      expect(words.every((w) => /^[a-z]+$/.test(w!))).toBe(true);
      const ctx = timelineUnits.createContext(jsPsych, {
        stimulus_set: { items: "words" },
        response_device: "touch",
        rearrangement_rule: "partial_reshuffle_each_page",
      });
      const pages = timelineUnits
        .createInstructions(ctx)
        .timeline.map((p: any) => p.stimulus as string)
        .join(" ");
      expect(pages).toContain("Tap one word");
      expect(pages).toContain("some of the words move");
      expect(pages).not.toMatch(/click|design/);
    });

    it("the instruction pages follow the resolved options: nothing describes the default design", () => {
      const ctx = timelineUnits.createContext(jsPsych, {
        stimulus_set: { items: "nonwords" },
        response_window_ms: 4000,
        position_repeat_rule: "enforced",
        position_repeat_max: 1,
      });
      const pages = timelineUnits
        .createInstructions(ctx)
        .timeline.map((p: any) => p.stimulus as string);
      const all = pages.join(" ");
      expect(all).toContain("made-up words");
      expect(all).toContain("time limit of 4 seconds");
      expect(all).toContain("switched off");
      expect(all).not.toContain("designs");
      // and a free-position task does not talk about slots
      expect(pages).toHaveLength(4);
    });
  });
});
