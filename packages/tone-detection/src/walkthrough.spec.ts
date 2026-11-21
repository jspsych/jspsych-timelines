import { initJsPsych } from "jspsych";

import { INSTRUCTION_MAX_ATTEMPTS } from "./constants";
import { calculateScores } from "./scoring";
import { SHORT, run } from "./test-helpers";
import { defaultText } from "./text";
import { walkthroughTargets } from "./trials";
import { createTimeline } from ".";

const checks = (rows: any[]) => rows.filter((r) => r.part === "instruction_check");
const base = { ...SHORT, headphone_check: "none" as const };

describe("instruction walkthrough (interactive)", () => {
  it("is the default: a listening example, then a check step for each of two other intervals, before practice", async () => {
    const { rows } = await run(base);
    const c = checks(rows);
    expect(c.map((r) => r.target_interval)).toEqual(walkthroughTargets(3).steps);
    expect(
      rows.filter((r) => r.part === "instruction_example").map((r) => r.target_interval)
    ).toEqual([2]);
    // the listening example plays at 2, the steps at 3 and 1: every response is taught, alternating
    const idx = (f: (r: any) => boolean) => rows.findIndex(f);
    expect(idx((r) => r.part === "instruction_example")).toBeGreaterThan(
      idx((r) => r.part === "instruction")
    );
    expect(idx((r) => r.part === "instruction_check")).toBeLessThan(
      idx((r) => r.phase === "practice")
    );
  });

  it("answers correctly at the first attempt under simulation, and is tagged and never scored", async () => {
    const { rows, data } = await run(base);
    const c = checks(rows);
    c.forEach((r) => {
      expect(r.phase).toBe("instructions");
      expect(r.correct).toBe(true);
      expect(r.attempt).toBe(1);
      expect(r.response_interval).toBe(r.target_interval);
    });
    expect(
      rows.filter((r) => r.part === "instruction_feedback" && r.feedback_kind === "correct")
    ).toHaveLength(2);
    expect(calculateScores(data).n_trials).toBe(12);
  });

  it("the walkthrough's tone is clearly audible: 6 dB above the masker, or 36 dB above the calibration sound in quiet", async () => {
    const { rows } = await run(base);
    const stim = rows.filter((r) => r.part === "stimulus" && r.phase === "instructions");
    expect(
      stim.every((r) => r.level === 6 && r.masker_level_db === -20 && r.tone_level_db === -14)
    ).toBe(true);
    const q = await run({ ...base, stimulus_set: { masker: "none" } });
    const sq = q.rows.filter((r) => r.part === "stimulus" && r.phase === "instructions");
    expect(sq.every((r) => r.level === -24 && r.masker_level_db === null)).toBe(true);
  });

  it("a wrong answer gives a hint and plays it again; three wrong answers give the answer and move on", async () => {
    // always pressing 1: step 1 (target 3) is wrong, step 2 (target 1) is right
    const { rows } = await run(base, { instruction_check: { data: { response: "1", rt: 300 } } });
    const c = checks(rows);
    expect(c.map((r) => [r.target_interval, r.correct, r.attempt])).toEqual([
      [3, false, 1],
      [3, false, 2],
      [3, false, 3],
      [1, true, 1],
    ]);
    const fb = rows.filter((r) => r.part === "instruction_feedback").map((r) => r.feedback_kind);
    expect(fb).toEqual(["hint", "hint", "reveal", "correct"]);
    expect(INSTRUCTION_MAX_ATTEMPTS).toBe(3);
    // each attempt played the sound again
    expect(rows.filter((r) => r.part === "stimulus" && r.phase === "instructions")).toHaveLength(
      1 + 4
    );
  });

  it("uses the task's own key mapping, and the captions describe the sounds as configured", async () => {
    const { rows } = await run({ ...base, response_keys: ["a", "s", "d"] });
    expect(checks(rows).map((r) => r.correct_response)).toEqual(["d", "a"]);
    const w = (masker: boolean) => ({
      n_intervals: 3,
      target_interval: 2,
      masker,
      response_for: (i: number) => `<kbd>${i}</kbd>`,
      device: "keyboard" as const,
      frequency_hz: 440,
    });
    expect(defaultText.instruction_step(w(true))).toContain("noise");
    expect(defaultText.instruction_step(w(true))).toContain("440 Hz");
    expect(defaultText.instruction_step(w(false))).not.toContain("noise");
    expect(defaultText.instruction_step(w(false))).toContain("silent");
    expect(defaultText.instruction_listen(w(true))).toContain("interval 2");
  });

  it("with two intervals the steps are intervals 2 and 1 and the example is interval 1", async () => {
    const { rows } = await run({ ...base, task_variant: "2I-2AFC_which_contains_tone" });
    expect(checks(rows).map((r) => r.target_interval)).toEqual([2, 1]);
    expect(
      rows.filter((r) => r.part === "instruction_example").map((r) => r.target_interval)
    ).toEqual([1]);
  });

  it("is skipped for none and experimenter, only the listening example for examples, and throws for unsupported values", async () => {
    expect(checks((await run({ ...base, instruction_demonstration: "none" })).rows)).toHaveLength(
      0
    );
    expect(
      (await run({ ...base, instruction_demonstration: "none" })).rows.filter(
        (r) => r.part === "instruction_example"
      )
    ).toHaveLength(0);
    expect(checks((await run({ ...base, instruction_format: "experimenter" })).rows)).toHaveLength(
      0
    );
    const ex = (await run({ ...base, instruction_demonstration: "examples" })).rows;
    expect(checks(ex)).toHaveLength(0);
    expect(ex.filter((r) => r.part === "instruction_example")).toHaveLength(1);
    for (const v of ["animated", "guided_trial"] as const) {
      expect(() => createTimeline(initJsPsych(), { instruction_demonstration: v })).toThrow(
        /instruction_demonstration/
      );
    }
  });

  it("runs the task's own trial code: the same sound builder, in the same stage, as the test", () => {
    const { timeline } = createTimeline(initJsPsych(), base);
    const nodes: any[] = [];
    const visit = (t: any): void =>
      Array.isArray(t)
        ? t.forEach(visit)
        : t?.timeline
        ? visit(t.timeline)
        : t?.type && nodes.push(t);
    visit(timeline);
    const pres = nodes.filter((n) => n.data?.part === "stimulus");
    const walk = pres.find((n) => n.data.phase === "instructions");
    const test = pres.find((n) => n.data.phase === "test");
    expect(walk.choices).toBe("NO_KEYS");
    expect(typeof walk.on_load).toBe("function");
    expect(walk.on_load.toString()).toBe(test.on_load.toString());
    const loops = nodes.length; // the structure is walked above; loops are on the timeline nodes
    expect(loops).toBeGreaterThan(0);
  });

  it("the listening example can be replayed: a Listen again button loops over the sound", () => {
    const { timeline } = createTimeline(initJsPsych(), base);
    const loops: any[] = [];
    const visit = (t: any): void => {
      if (Array.isArray(t)) t.forEach(visit);
      else if (t?.timeline) {
        if (t.loop_function) loops.push(t);
        visit(t.timeline);
      }
    };
    visit(timeline);
    // the listening example, the two check steps, 3 tracks' ... the tracks are loops too: example + 2 steps + practice + test (1 track)
    expect(loops.length).toBeGreaterThanOrEqual(5);
    const example = loops[0];
    const listenNote = example.timeline.find((n: any) => n.data?.part === "instruction_example");
    expect(listenNote.choices).toEqual([defaultText.continue_button, defaultText.replay_button]);
    const data = (response: number) => ({ last: () => ({ values: () => [{ response }] }) });
    expect(example.loop_function(data(1))).toBe(true); // Listen again
    expect(example.loop_function(data(0))).toBe(false); // Continue
  });
});

describe("practice_criterion", () => {
  const withCrit = (c: any, extra: any = {}) => ({
    ...SHORT,
    practice_trials: 6,
    headphone_check: "none" as const,
    instruction_demonstration: "none" as const,
    practice_criterion: c,
    ...extra,
  });
  const attempts = (rows: any[]) => [
    ...new Set(
      rows
        .filter((r) => r.phase === "practice" && r.part === "response")
        .map((r) => r.practice_attempt)
    ),
  ];

  it("passes on the first try for an accurate listener", async () => {
    const { rows } = await run(withCrit({ accuracy: 0.5 }));
    expect(attempts(rows)).toEqual([1]);
    expect(rows.filter((r) => "practice_criterion_met" in r)[0].practice_criterion_met).toBe(true);
  });

  it("on_fail repeat: runs practice again up to max_repeats, then the test goes on", async () => {
    const { rows } = await run(withCrit({ accuracy: 1, on_fail: "repeat", max_repeats: 2 }), {
      response: { data: { response: "9", rt: 300 } },
    });
    // an answer that is no key is no answer: wrong every time
    expect(attempts(rows)).toEqual([1, 2, 3]);
    expect(rows.filter((r) => r.phase === "practice" && r.part === "response")).toHaveLength(18);
    expect(rows.filter((r) => r.phase === "test" && r.part === "response")).toHaveLength(12);
    expect(
      rows.filter((r) => "practice_criterion_met" in r).map((r) => r.practice_criterion_met)
    ).toEqual([false, false, false]);
    // intro, environment, response, guess, practice intro, test intro, and one notice for each of the 2 repeats
    expect(rows.filter((r) => r.part === "instruction")).toHaveLength(6 + 2);
  });

  it("on_fail continue records the miss and goes on; end skips the test", async () => {
    const cont = await run(withCrit({ accuracy: 1, on_fail: "continue" }), {
      response: { data: { response: "9", rt: 300 } },
    });
    expect(attempts(cont.rows)).toEqual([1]);
    expect(cont.rows.filter((r) => "practice_criterion_met" in r)[0].practice_criterion_met).toBe(
      false
    );
    expect(cont.rows.filter((r) => r.phase === "test" && r.part === "response")).toHaveLength(12);
    const end = await run(withCrit({ accuracy: 1, on_fail: "end" }), {
      response: { data: { response: "9", rt: 300 } },
    });
    expect(end.rows.filter((r) => r.phase === "test")).toHaveLength(0);
    expect(end.rows.some((r) => r.part === "completion")).toBe(true);
  });

  it("window: accuracy over the last trials only; the criterion's accuracy is recorded", async () => {
    const r = await run(withCrit({ accuracy: 0.5, window: 3 }));
    const row = r.rows.filter((x) => "practice_criterion_met" in x)[0];
    expect(Number.isInteger(Math.round(row.practice_accuracy * 3 * 1e9) / 1e9)).toBe(true); // k correct of the last 3
  });
});
