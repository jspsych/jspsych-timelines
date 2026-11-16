import {
  clickTarget,
  flushPromises,
  pressKey,
  simulateTimeline,
  startTimeline,
} from "@jspsych/test-utils";
import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { INSTRUCTION_MAX_ATTEMPTS, INSTRUCTION_NOGO_WAIT_MS } from "./constants";
import { GoNogoOptions } from "./options";
import { calculateScores } from "./scoring";
import { createTimeline, timelineUnits } from ".";

function allTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => allTrials(t, out));
  else if (tl?.timeline) allTrials(tl.timeline, out);
  else if (tl?.type) out.push(tl);
  return out;
}

async function run(jsPsych: JsPsych, options: GoNogoOptions) {
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

  it("is the default: a go step then a no-go step, before practice, after the instruction pages", async () => {
    const rows = await run(jsPsych, { n_test_trials: 4 });
    expect(checks(rows).map((r) => r.condition)).toEqual(["go", "nogo"]);
    const idx = (f: (r: any) => boolean) => rows.findIndex(f);
    expect(idx((r) => r.part === "instruction_check")).toBeGreaterThan(
      idx((r) => r.part === "instruction")
    );
    expect(idx((r) => r.part === "instruction_check")).toBeLessThan(
      idx((r) => r.phase === "practice")
    );
  });

  it("answers correctly at the first attempt under simulation (withholding on no-go) and is tagged", async () => {
    const rows = await run(jsPsych, {});
    const c = checks(rows);
    c.forEach((r) => {
      expect(r.phase).toBe("instructions");
      expect(r.correct).toBe(true);
      expect(r.attempt).toBe(1);
    });
    expect(c[0]).toMatchObject({ condition: "go", correct_response: " ", responded: true });
    expect(c[1]).toMatchObject({
      condition: "nogo",
      correct_response: null,
      responded: false,
      response: null,
    });
    expect(
      rows.filter((r) => r.part === "instruction_feedback" && r.feedback_kind === "correct")
    ).toHaveLength(2);
  });

  it("has one step per stimulus, alternating go and no-go", async () => {
    const rows = await run(jsPsych, {
      stimulus_role_assignment: "fixed",
      stimulus_set: { go: [{ text: "A" }, { text: "B" }, { text: "C" }], nogo: { text: "X" } },
    });
    expect(checks(rows).map((r) => r.stimulus)).toEqual(["A", "X", "B", "C"]);
  });

  it("is not scored", async () => {
    await run(jsPsych, { n_test_trials: 6 });
    const before = calculateScores(jsPsych.data.get());
    expect(before.n_trials).toBe(6);
    const bad = {
      task: "go-nogo",
      phase: "instructions",
      part: "instruction_check",
      condition: "nogo",
      responded: true,
      correct: false,
      rt: 5,
    };
    expect(
      calculateScores(new DataCollection([...(jsPsych.data.get().values() as any[]), bad]))
    ).toEqual(before);
  });

  it("is skipped for none and experimenter, static for examples, and throws for unsupported values", async () => {
    expect(checks(await run(jsPsych, { instruction_demonstration: "none" }))).toHaveLength(0);
    expect(checks(await run(initJsPsych(), { instruction_format: "experimenter" }))).toHaveLength(
      0
    );
    const rows = await run(initJsPsych(), { instruction_demonstration: "examples" });
    expect(checks(rows)).toHaveLength(0);
    expect(rows.filter((r) => r.part === "instruction_example").map((r) => r.condition)).toEqual([
      "go",
      "nogo",
    ]);
    for (const v of ["animated", "guided_trial"] as const) {
      expect(() => createTimeline(initJsPsych(), { instruction_demonstration: v })).toThrow(
        new RegExp(`instruction_demonstration.*${v}`)
      );
    }
  });

  describe("real run", () => {
    const base: GoNogoOptions = { practice_trials: 0, stimulus_role_assignment: "fixed" };
    const step = (tl: any, condition: string) =>
      allTrials(tl).find(
        (t) => t.data?.part === "instruction_check" && t.data.condition === condition
      );
    afterEach(() => jest.useRealTimers());

    it("repeats a go step with a hint after a wrong answer (no response), then advances", async () => {
      jest.useFakeTimers();
      // the go step is untimed, so a wrong answer is another key
      const ctx = timelineUnits.createContext(jsPsych, base);
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const { displayElement, getData } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!); // intro page
      expect(displayElement.querySelector(".jspsych-timelines-go-nogo-item svg")).not.toBeNull();
      expect(displayElement.innerHTML).toContain("<kbd>the space bar</kbd>");
      await pressKey(" ");
      expect(displayElement.textContent).toContain("Correct!");
      jest.advanceTimersByTime(1000);
      await flushPromises();
      // no-go step: responding is wrong
      expect(displayElement.textContent).toContain("Do not respond");
      await pressKey(" ");
      expect(displayElement.textContent).toContain("Let's try again");
      await clickTarget(displayElement.querySelector("button")!);
      expect(displayElement.textContent).toContain("Do not respond"); // same step again
      const rows = checks(getData().values() as any[]);
      expect(rows.map((r) => [r.condition, r.attempt, r.correct])).toEqual([
        ["go", 1, true],
        ["nogo", 1, false],
      ]);
    });

    it("a no-go step waits, and not responding is correct", async () => {
      jest.useFakeTimers();
      const ctx = timelineUnits.createContext(jsPsych, {
        ...base,
        stimulus_set: { go: { text: "A" }, nogo: { text: "X" } },
      });
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const { displayElement, getData } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!);
      await pressKey(" ");
      jest.advanceTimersByTime(1000);
      await flushPromises();
      expect(displayElement.textContent).toContain("Do not respond");
      jest.advanceTimersByTime(INSTRUCTION_NOGO_WAIT_MS + 10);
      await flushPromises();
      expect(displayElement.textContent).toContain("Correct!");
      const rows = checks(getData().values() as any[]);
      expect(rows[1]).toMatchObject({ condition: "nogo", correct: true, responded: false });
    });

    it(`shows the answer after ${INSTRUCTION_MAX_ATTEMPTS} wrong attempts and moves on`, async () => {
      jest.useFakeTimers();
      const ctx = timelineUnits.createContext(jsPsych, {
        ...base,
        stimulus_set: { go: { text: "A" }, nogo: { text: "X" } },
      });
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      const { displayElement, getData } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!);
      await pressKey(" ");
      jest.advanceTimersByTime(1000);
      await flushPromises();
      for (let i = 0; i < INSTRUCTION_MAX_ATTEMPTS; i++) {
        await pressKey(" "); // responding to no-go
        expect(displayElement.textContent).toContain(
          i < INSTRUCTION_MAX_ATTEMPTS - 1 ? "Let's try again" : "Let's move on"
        );
        await clickTarget(displayElement.querySelector("button")!);
      }
      const rows = checks(getData().values() as any[]).filter((r) => r.condition === "nogo");
      expect(rows.map((r) => r.attempt)).toEqual([1, 2, 3]);
      expect(rows.every((r) => r.correct === false)).toBe(true);
    });

    it("follows the key, the stimuli and the touch device", async () => {
      const ctx = timelineUnits.createContext(jsPsych, {
        ...base,
        response_keys: ["j"],
        stimulus_set: {
          go: { shape: "circle", color: "green" },
          nogo: { shape: "cross", color: "red" },
        },
      });
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      expect(step(wt, "go").data.correct_response).toBe("j");
      const { displayElement } = await startTimeline([wt], jsPsych);
      await clickTarget(displayElement.querySelector("button")!);
      expect(displayElement.innerHTML).toContain("<kbd>J</kbd>");
      expect(displayElement.textContent).toContain("green circle");
      expect(displayElement.innerHTML).toContain('fill="green"');

      const touch = timelineUnits.createInstructionWalkthrough(
        timelineUnits.createContext(initJsPsych(), { ...base, response_device: "touch" })
      );
      expect(step(touch, "go").data.correct_response).toBe(0);
      const js2 = initJsPsych();
      const { displayElement: d2 } = await startTimeline([touch], js2);
      await clickTarget(d2.querySelector("button")!);
      expect(Array.from(d2.querySelectorAll(".jspsych-btn")).map((b) => b.textContent)).toEqual([
        "Respond",
      ]);
      expect(d2.textContent).toContain("tap");
      expect(d2.textContent).not.toContain("press");
    });

    it("names the space bar and arrow keys in words", async () => {
      const ctx = timelineUnits.createContext(jsPsych, { ...base, response_keys: ["ArrowUp"] });
      const { displayElement } = await startTimeline(
        [timelineUnits.createInstructionWalkthrough(ctx)],
        jsPsych
      );
      await clickTarget(displayElement.querySelector("button")!);
      expect(displayElement.innerHTML).toContain("<kbd>the up arrow</kbd>");
      expect(displayElement.innerHTML).not.toContain("ArrowUp");
    });

    it("makes the no-go step a timed wait with no key as the correct answer", () => {
      const ctx = timelineUnits.createContext(jsPsych, base);
      const wt = timelineUnits.createInstructionWalkthrough(ctx);
      expect(step(wt, "nogo").data.correct_response).toBeNull();
      expect(step(wt, "nogo").trial_duration).toBe(INSTRUCTION_NOGO_WAIT_MS);
      expect(step(wt, "go").trial_duration).toBeNull();
    });
  });
});
