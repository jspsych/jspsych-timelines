import {
  clickTarget,
  flushPromises,
  pressKey,
  simulateTimeline,
  startTimeline,
} from "@jspsych/test-utils";
import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { INSTRUCTION_MAX_ATTEMPTS } from "./constants";
import { TwoStepTaskOptions } from "./options";
import { calculateScores } from "./scoring";
import { createTimeline, timelineUnits, utils } from ".";

function allTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => allTrials(t, out));
  else if (tl?.timeline) allTrials(tl.timeline, out);
  else if (tl?.type) out.push(tl);
  return out;
}

async function run(jsPsych: JsPsych, options: TwoStepTaskOptions) {
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

  it("is the default, comes after the instruction pages and before practice", async () => {
    const rows = await run(jsPsych, { practice_trials: 2, n_test_trials: 2 });
    expect(checks(rows).map((r) => r.step)).toEqual([
      "first_choice",
      "second_choice",
      "statement_transitions",
      "statement_drift",
    ]);
    const idx = (f: (r: any) => boolean) => rows.findIndex(f);
    expect(idx((r) => r.part === "instruction_check")).toBeGreaterThan(
      idx((r) => r.part === "instruction")
    );
    expect(idx((r) => r.part === "instruction_check")).toBeLessThan(
      idx((r) => r.phase === "practice")
    );
    // the scripted outcome is a static example
    expect(rows.filter((r) => r.part === "instruction_example")).toHaveLength(1);
  });

  it("teaches the structure by contingency_disclosure", async () => {
    const steps = async (level: any) =>
      checks(
        await run(initJsPsych(), {
          practice_trials: 0,
          n_test_trials: 2,
          contingency_disclosure: level,
        })
      ).map((r) => r.step);
    expect(await steps("none")).toEqual(["first_choice", "second_choice"]);
    expect(await steps("partial")).toEqual([
      "first_choice",
      "second_choice",
      "statement_transitions",
      "statement_drift",
    ]);
    expect(await steps("full")).toEqual([
      "first_choice",
      "second_choice",
      "mapping_A",
      "mapping_B",
      "statement_drift",
    ]);
  });

  it("answers correctly at the first attempt under simulation, is tagged, and alternates the sides", async () => {
    const rows = await run(jsPsych, {
      practice_trials: 0,
      n_test_trials: 2,
      contingency_disclosure: "full",
    });
    const c = checks(rows);
    c.forEach((r) => {
      expect(r.phase).toBe("instructions");
      expect(r.correct).toBe(true);
      expect(r.attempt).toBe(1);
    });
    // left, right, right, left, right: both keys are taught
    expect(c.map((r) => r.correct_response)).toEqual([
      "ArrowLeft",
      "ArrowRight",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
    ]);
    expect(
      rows.filter((r) => r.part === "instruction_feedback" && r.feedback_kind === "correct")
    ).toHaveLength(5);
  });

  it("is not scored and does not look like a task response", async () => {
    await run(jsPsych, { practice_trials: 0, n_test_trials: 4 });
    const before = calculateScores(jsPsych.data.get());
    expect(before.n_trials).toBe(4);
    const bad = {
      task: "two-step-task",
      phase: "instructions",
      part: "instruction_check",
      correct: false,
      stage1_choice: "A",
      rt: 5,
    };
    const withBad = new DataCollection([...(jsPsych.data.get().values() as any[]), bad]);
    expect(calculateScores(withBad)).toEqual(before);
  });

  it("is skipped for none and experimenter, and the instruction pages go with experimenter", async () => {
    expect(
      checks(
        await run(jsPsych, {
          instruction_demonstration: "none",
          practice_trials: 0,
          n_test_trials: 2,
        })
      )
    ).toHaveLength(0);
    const rows = await run(initJsPsych(), {
      instruction_format: "experimenter",
      practice_trials: 2,
      n_test_trials: 2,
    });
    expect(checks(rows)).toHaveLength(0);
    expect(rows.filter((r) => r.part === "instruction")).toHaveLength(0);
  });

  it("the page before practice says that trials run at the real pace and that the main task follows", async () => {
    const rows = await run(jsPsych, { practice_trials: 2, n_test_trials: 2 });
    const { timeline } = createTimeline(initJsPsych(), { practice_trials: 2, n_test_trials: 2 });
    const pages = allTrials(timeline).filter(
      (t) => t.data?.part === "instruction" && typeof t.stimulus === "string"
    );
    const text = pages.map((t) => t.stimulus).join(" ");
    expect(text).toMatch(/pace of the real task/);
    expect(text).toMatch(/main task starts/);
    expect(text).toMatch(/practice are not counted/);
    expect(rows.length).toBeGreaterThan(0);
  });

  describe("real run", () => {
    const base: TwoStepTaskOptions = {
      practice_trials: 0,
      n_test_trials: 2,
      contingency_disclosure: "none",
    };
    const keysOf = (tl: any) =>
      allTrials(tl)
        .filter((t) => t.data?.part === "instruction_check")
        .map((t) => t.data.correct_response);
    const wrongOf = (right: string) => (right === "ArrowLeft" ? "ArrowRight" : "ArrowLeft");

    afterEach(() => jest.useRealTimers());

    it("repeats a step with a hint after a wrong answer, then advances", async () => {
      jest.useFakeTimers();
      const ctx = timelineUnits.createContext(jsPsych, base);
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const [k1, k2] = keysOf(wt);
      const { displayElement, getData } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!); // intro page
      expect(displayElement.querySelectorAll(".ts-item")).toHaveLength(2);
      expect(displayElement.innerHTML).toContain("<kbd>left arrow</kbd>");

      await pressKey(wrongOf(k1));
      expect(displayElement.textContent).toContain("That was the other one");
      await clickTarget(displayElement.querySelector("button")!);
      // the same step again
      expect(displayElement.textContent).toContain("Choose the symbol on the left");
      await pressKey(k1);
      expect(displayElement.textContent).toContain("Correct!");
      jest.advanceTimersByTime(1000);
      await flushPromises();
      // the second step: the other key
      expect(displayElement.textContent).toContain("Choose the symbol on the right");
      expect(k2).toBe("ArrowRight");
      const rows = checks(getData().values() as any[]);
      expect(rows.map((r) => [r.step, r.attempt, r.correct])).toEqual([
        ["first_choice", 1, false],
        ["first_choice", 2, true],
      ]);
    });

    it(`shows the answer after ${INSTRUCTION_MAX_ATTEMPTS} wrong attempts and moves on`, async () => {
      jest.useFakeTimers();
      const ctx = timelineUnits.createContext(jsPsych, base);
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const [k1] = keysOf(wt);
      const { displayElement, getData } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!);
      for (let i = 0; i < INSTRUCTION_MAX_ATTEMPTS; i++) {
        await pressKey(wrongOf(k1));
        if (i < INSTRUCTION_MAX_ATTEMPTS - 1)
          expect(displayElement.textContent).toContain("That was the other one");
        else expect(displayElement.textContent).toContain("to choose the symbol on the left");
        await clickTarget(displayElement.querySelector("button")!);
      }
      expect(displayElement.textContent).toContain("Choose the symbol on the right");
      const rows = checks(getData().values() as any[]);
      expect(rows.map((r) => r.attempt)).toEqual([1, 2, 3]);
      expect(rows.every((r) => r.step === "first_choice" && r.correct === false)).toBe(true);
    });

    it("follows the keys, the framing and the disclosure under a non-default configuration", async () => {
      const ctx = timelineUnits.createContext(jsPsych, {
        ...base,
        response_keys: ["f", "j"],
        stimulus_set: utils.stimuli.spaceshipPlanetAlien,
        contingency_disclosure: "full",
      });
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      expect(keysOf(wt)).toEqual(["f", "j", "j", "f", "j"]);
      const { displayElement } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!);
      const html = () => displayElement.innerHTML;
      expect(displayElement.textContent).toContain("Choose the spaceship on the left");
      expect(html()).toContain("<kbd>F</kbd>");
      expect(html()).not.toContain("ArrowLeft");
      // the real stimulus of the framing: the drawn rocket and saucer, not the abstract symbols
      expect(html()).toContain("#ff8c42");
      expect(html()).not.toContain('#ffd166" stroke-width="12"');
    });

    it("names the key in words and takes the words from the framing", async () => {
      const ctx = timelineUnits.createContext(jsPsych, {
        ...base,
        response_keys: ["ArrowLeft", "ArrowRight"],
      });
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const { displayElement } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!);
      expect(displayElement.innerHTML).toContain("<kbd>left arrow</kbd>");
      expect(displayElement.innerHTML).not.toContain("ArrowLeft");
    });

    it("the mapping question for a ship is answered with the state it usually leads to", async () => {
      const ctx = timelineUnits.createContext(jsPsych, { ...base, contingency_disclosure: "full" });
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const trials = allTrials(wt).filter(
        (t) => t.data?.step?.startsWith("mapping_") && t.data.part === "instruction_check"
      );
      expect(trials.map((t) => t.data.step)).toEqual(["mapping_A", "mapping_B"]);
      // A usually goes to red, shown on the right; B to blue, shown on the left
      expect(trials[0].stimulus()).toMatch(/data-side="right"[^>]*>[\s\S]*#b23a48/);
      expect(trials[0].data.correct_response).toBe("ArrowRight");
      expect(trials[1].data.correct_response).toBe("ArrowLeft");
      expect(trials[0].stimulus()).toContain("Which screen does the ring usually take you to?");
      // the prompt does not give the answer away: both keys are named, neither side is
      expect(trials[0].stimulus()).toContain(
        "<kbd>left arrow</kbd> for the one on the left, or <kbd>right arrow</kbd> for the one on the right"
      );
    });
  });

  it("the captions use the framing words", async () => {
    const seen: any[] = [];
    const { timeline } = createTimeline(jsPsych, {
      practice_trials: 0,
      n_test_trials: 2,
      stimulus_set: utils.stimuli.spaceshipPlanetAlien,
      text: {
        step_first: (r) => {
          seen.push(r);
          return "x";
        },
      },
    });
    await jsPsych.simulate(timeline, "data-only");
    expect(seen[0].words.first).toBe("spaceship");
    expect(seen[0].side).toBe("left");
    expect(seen[0].key).toBe("left arrow");
  });
});
