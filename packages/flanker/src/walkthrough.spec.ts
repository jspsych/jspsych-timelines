import {
  clickTarget,
  flushPromises,
  pressKey,
  simulateTimeline,
  startTimeline,
} from "@jspsych/test-utils";
import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { INSTRUCTION_MAX_ATTEMPTS } from "./constants";
import { FlankerOptions } from "./options";
import { calculateScores } from "./scoring";
import { createTimeline, timelineUnits } from ".";

function allTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => allTrials(t, out));
  else if (tl?.timeline) allTrials(tl.timeline, out);
  else if (tl?.type) out.push(tl);
  return out;
}

async function run(jsPsych: JsPsych, options: FlankerOptions) {
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

describe("instruction walkthrough (interactive)", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("walk");
  });

  it("is the default and covers every condition in the default condition_set, in teaching order", async () => {
    const rows = await run(jsPsych, { n_test_trials: 4 });
    expect(checks(rows).map((r) => r.condition)).toEqual([
      "congruent",
      "neutral_dash",
      "neutral_empty",
      "incongruent",
    ]);
    // instruction_check rows come after the instruction pages and before practice
    const idx = (f: (r: any) => boolean) => rows.findIndex(f);
    expect(idx((r) => r.part === "instruction_check")).toBeGreaterThan(
      idx((r) => r.part === "instruction")
    );
    expect(idx((r) => r.part === "instruction_check")).toBeLessThan(
      idx((r) => r.phase === "practice")
    );
  });

  it("answers correctly at the first attempt under simulation and is tagged", async () => {
    const rows = await run(jsPsych, { condition_set: ["congruent", "incongruent", "nogo"] });
    const c = checks(rows);
    expect(c.map((r) => r.condition)).toEqual(["congruent", "incongruent", "nogo"]);
    c.forEach((r) => {
      expect(r.phase).toBe("instructions");
      expect(r.correct).toBe(true);
      expect(r.attempt).toBe(1);
    });
    expect(c[2]).toMatchObject({ correct_response: null, timeout: true });
    expect(c[0].correct_response).toBe("z");
    expect(c[1].correct_response).toBe("/"); // targets alternate between the two responses
    expect(
      rows.filter((r) => r.part === "instruction_feedback" && r.feedback_kind === "correct")
    ).toHaveLength(3);
  });

  it("covers neutral forms given as a list, one step each", async () => {
    const rows = await run(jsPsych, {
      condition_set: ["incongruent", "neutral", "congruent"],
      stimulus_set: { neutral_flanker: ["squares", "plus_signs"] },
    });
    expect(checks(rows).map((r) => r.condition)).toEqual([
      "congruent",
      "neutral_squares",
      "neutral_plus_signs",
      "incongruent",
    ]);
  });

  it("is not scored", async () => {
    await run(jsPsych, { n_test_trials: 6 });
    const before = calculateScores(jsPsych.data.get());
    expect(before.n_trials).toBe(6);
    const bad = {
      task: "flanker",
      phase: "instructions",
      part: "instruction_check",
      congruency: "incongruent",
      correct: false,
      rt: 5,
    };
    const withBad = new DataCollection([...(jsPsych.data.get().values() as any[]), bad]);
    expect(calculateScores(withBad)).toEqual(before);
  });

  it("is skipped for none and experimenter, static for examples, and throws for unsupported values", async () => {
    expect(checks(await run(jsPsych, { instruction_demonstration: "none" }))).toHaveLength(0);
    jsPsych = initJsPsych();
    expect(checks(await run(jsPsych, { instruction_format: "experimenter" }))).toHaveLength(0);
    jsPsych = initJsPsych();
    const rows = await run(jsPsych, { instruction_demonstration: "examples" });
    expect(checks(rows)).toHaveLength(0);
    expect(rows.filter((r) => r.part === "instruction_example").map((r) => r.condition)).toEqual([
      "congruent",
      "neutral_dash",
      "neutral_empty",
      "incongruent",
    ]);
    for (const v of ["animated", "guided_trial"] as const) {
      expect(() => createTimeline(initJsPsych(), { instruction_demonstration: v })).toThrow(
        new RegExp(`instruction_demonstration.*${v}`)
      );
    }
  });

  describe("real run", () => {
    const base: FlankerOptions = {
      condition_set: ["congruent", "incongruent"],
      practice_trials: 0,
    };
    const keys = (tl: any) =>
      allTrials(tl)
        .filter((t) => t.data?.part === "instruction_check")
        .map((t) => t.data.correct_response);
    const wrongOf = (right: string) => (right === "z" ? "/" : "z");

    afterEach(() => jest.useRealTimers());

    it("repeats a step with a hint after a wrong answer, then advances", async () => {
      jest.useFakeTimers();
      const ctx = timelineUnits.createContext(jsPsych, base);
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const [k1, k2] = keys(wt);
      const { displayElement, getData } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!); // intro page
      expect(displayElement.querySelector(".jspsych-timelines-flanker-array")).not.toBeNull();
      expect(displayElement.innerHTML).toContain("<kbd>" + k1 + "</kbd>");

      await pressKey(wrongOf(k1));
      expect(displayElement.textContent).toContain("Let's try again");
      await clickTarget(displayElement.querySelector("button")!);
      // same step again
      expect(displayElement.innerHTML).toContain("<kbd>" + k1 + "</kbd>");
      await pressKey(k1);
      expect(displayElement.textContent).toContain("Correct!");
      jest.advanceTimersByTime(1000);
      await flushPromises();
      // next step: incongruent, other key
      expect(displayElement.innerHTML).toContain("<kbd>" + k2 + "</kbd>");
      const rows = checks(getData().values() as any[]);
      expect(rows.map((r) => [r.condition, r.attempt, r.correct])).toEqual([
        ["congruent", 1, false],
        ["congruent", 2, true],
      ]);
    });

    it(`shows the answer after ${INSTRUCTION_MAX_ATTEMPTS} wrong attempts and moves on`, async () => {
      jest.useFakeTimers();
      const ctx = timelineUnits.createContext(jsPsych, base);
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const [k1, k2] = keys(wt);
      const { displayElement, getData } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!);
      for (let i = 0; i < INSTRUCTION_MAX_ATTEMPTS; i++) {
        await pressKey(wrongOf(k1));
        if (i < INSTRUCTION_MAX_ATTEMPTS - 1) {
          expect(displayElement.textContent).toContain("Let's try again");
        } else {
          expect(displayElement.textContent).toContain("Let's move on");
          expect(displayElement.innerHTML).toContain("<kbd>" + k1 + "</kbd>");
        }
        await clickTarget(displayElement.querySelector("button")!);
      }
      expect(displayElement.innerHTML).toContain("<kbd>" + k2 + "</kbd>");
      const rows = checks(getData().values() as any[]);
      expect(rows.map((r) => r.attempt)).toEqual([1, 2, 3]);
      expect(rows.every((r) => r.condition === "congruent" && r.correct === false)).toBe(true);
    });

    it("follows the keys and the letter set", async () => {
      const ctx = timelineUnits.createContext(jsPsych, {
        ...base,
        response_keys: ["a", "l"],
        stimulus_set: { target: { letters: [["H"], ["S"]] }, neutral_flanker: "dashes" },
      });
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      expect(keys(wt)).toEqual(["a", "l"]);
      const { displayElement } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!);
      expect(displayElement.textContent).toContain("The center is H");
      expect(displayElement.innerHTML).toContain("<kbd>a</kbd>");
      expect(displayElement.innerHTML).not.toContain("<kbd>z</kbd>");
    });

    it("uses buttons on a touch device", async () => {
      const ctx = timelineUnits.createContext(jsPsych, { ...base, response_device: "touch" });
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      expect(keys(wt)).toEqual([0, 1]);
      const { displayElement } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!);
      const buttons = Array.from(displayElement.querySelectorAll(".jspsych-btn")).map(
        (b) => b.textContent
      );
      expect(buttons).toEqual(["Left", "Right"]);
      expect(displayElement.textContent).toContain("tap");
      expect(displayElement.textContent).not.toContain("press");
    });

    it("uses the task colours and the real stimulus array", async () => {
      const ctx = timelineUnits.createContext(jsPsych, {
        ...base,
        stimulus_color: "black on white",
      });
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const { displayElement } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!);
      expect(displayElement.querySelectorAll(".jspsych-timelines-flanker-item")).toHaveLength(5);
      expect(displayElement.innerHTML).toContain("background:white;color:black");
    });

    it("makes the no-go step a timed wait with no key as the correct answer", () => {
      const ctx = timelineUnits.createContext(jsPsych, { ...base, condition_set: ["nogo"] });
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const step = allTrials(wt).find((t) => t.data?.part === "instruction_check");
      expect(step.data.correct_response).toBeNull();
      expect(step.trial_duration).toBeGreaterThan(0);
    });
  });
});
