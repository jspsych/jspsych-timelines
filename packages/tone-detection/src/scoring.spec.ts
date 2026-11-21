import { DataCollection } from "jspsych";

import { TASK_NAME, VERSION } from "./constants";
import { calculateScores, getSummary } from "./scoring";

/** A test response row. */
const row = (o: Record<string, unknown>) => ({
  task: TASK_NAME,
  phase: "test",
  part: "response",
  condition: "1000_hz",
  tone_frequency: 1000,
  block: 1,
  track_id: 1,
  level_unit: "dB SNR",
  correct: true,
  rt: 600,
  is_reversal: false,
  ...o,
});

/** A track of levels (with the reversal flags and the level that follows), starting at 10 and moving as the answers say. */
const track = (
  block: number,
  items: Array<[number, boolean, boolean]>,
  extra: Record<string, unknown> = {}
) =>
  items.map(([level, correct, is_reversal], i) =>
    row({
      block,
      track_id: block,
      level,
      correct,
      is_reversal,
      next_level: items[i + 1]?.[0] ?? level,
      trial_index_in_block: i + 1,
      ...extra,
    })
  );

describe("calculateScores", () => {
  it("returns counts of 0 and nulls (never NaN) for empty data", () => {
    const s = calculateScores(new DataCollection([]));
    expect(s).toEqual({
      n_trials: 0,
      n_tracks: 0,
      accuracy: null,
      mean_rt: null,
      threshold: null,
      threshold_mode: null,
      threshold_final: null,
      last_n_reversals: 6,
      level_unit: null,
      conditions: [],
      tracks: [],
    });
    expect(JSON.stringify(s)).not.toContain("NaN");
  });

  it("the threshold is the mean of the last n reversal levels (default 6), the mode is the most visited level, the final value the level that was next", () => {
    // 8 reversals at levels 10, 9, 8, 7, 6, 5, 4, 3 (flagged), and other trials between
    const items: Array<[number, boolean, boolean]> = [
      [10, true, true],
      [9, false, true],
      [8, true, true],
      [7, false, true],
      [6, true, true],
      [5, false, true],
      [4, true, true],
      [3, false, true],
      [3, true, false],
      [3, true, false],
    ];
    const s = calculateScores(new DataCollection(track(1, items)));
    expect(s.tracks).toHaveLength(1);
    expect(s.tracks[0].n_reversals).toBe(8);
    expect(s.tracks[0].threshold).toBe((8 + 7 + 6 + 5 + 4 + 3) / 6); // the last six reversal levels
    expect(
      calculateScores(new DataCollection(track(1, items)), { last_n_reversals: 4 }).threshold
    ).toBe((6 + 5 + 4 + 3) / 4);
    expect(s.tracks[0].threshold_mode).toBe(3); // visited three times
    expect(s.tracks[0].threshold_final).toBe(3);
    expect(s.threshold).toBe(s.tracks[0].threshold); // one condition: the headline
    expect(s.level_unit).toBe("dB SNR");
    expect(s.last_n_reversals).toBe(6);
  });

  it("uses all reversals when there are fewer than n, and null without one; counts wrong answers in the accuracy", () => {
    const few = calculateScores(
      new DataCollection(
        track(1, [
          [0, true, false],
          [-1, false, true],
          [0, true, false],
          [-1, false, true],
        ])
      )
    );
    expect(few.tracks[0].n_reversals).toBe(2);
    expect(few.tracks[0].threshold).toBe(-1);
    expect(few.accuracy).toBe(0.5);
    const none = calculateScores(
      new DataCollection(
        track(1, [
          [0, true, false],
          [0, false, false],
        ])
      )
    );
    expect(none.tracks[0].threshold).toBeNull();
    expect(none.threshold).toBeNull();
    expect(none.tracks[0].threshold_mode).toBe(0);
  });

  it("averages the thresholds of a condition's tracks (a track without a reversal is left out) and keeps conditions apart", () => {
    const a1 = track(
      1,
      [
        [-10, true, true],
        [-12, false, true],
      ],
      {}
    );
    const a2 = track(
      2,
      [
        [-14, true, true],
        [-16, false, true],
      ],
      {}
    );
    const a3 = track(
      3,
      [
        [0, true, false],
        [0, true, false],
      ],
      {}
    ); // no reversal
    const b1 = track(
      4,
      [
        [-4, true, true],
        [-6, false, true],
      ],
      { condition: "500_hz", tone_frequency: 500 }
    );
    const s = calculateScores(new DataCollection([...a1, ...a2, ...a3, ...b1]));
    expect(s.n_tracks).toBe(4);
    const [c1000, c500] = s.conditions;
    expect(c1000).toMatchObject({ condition: "1000_hz", frequency_hz: 1000, n_tracks: 3 });
    expect(c1000.threshold).toBe((-11 + -15) / 2);
    expect(c500).toMatchObject({
      condition: "500_hz",
      frequency_hz: 500,
      n_tracks: 1,
      threshold: -5,
    });
    expect(s.threshold).toBeNull(); // several conditions: no single headline
  });

  it("scores the wrong answers: accuracy and mean RT over correct answers only; a missing RT is not a zero", () => {
    const items = track(1, [
      [0, true, false],
      [1, false, false],
      [2, true, false],
      [3, false, false],
    ]);
    items[0].rt = 500;
    items[1].rt = 9999; // wrong: not in the mean RT
    items[2].rt = null as any;
    items[3].rt = 100;
    const s = calculateScores(new DataCollection(items));
    expect(s.accuracy).toBe(0.5);
    expect(s.mean_rt).toBe(500);
    expect(s.tracks[0].n_correct).toBe(2);
  });

  it("only test response rows count: practice, instructions, headphone screen and other tasks' rows are ignored", () => {
    const good = track(1, [
      [0, true, true],
      [-1, false, true],
    ]);
    const noise = [
      row({ phase: "practice", level: -50, is_reversal: true }),
      row({ phase: "instructions", part: "instruction_check", level: -50, is_reversal: true }),
      row({ part: "headphone_check", phase: "instructions", level: null }),
      row({ part: "stimulus" }),
      row({ task: "other-task", level: -99, is_reversal: true }),
    ];
    expect(calculateScores(new DataCollection([...good, ...noise]))).toEqual(
      calculateScores(new DataCollection(good))
    );
  });

  it("never excludes or flags: no field of the result is an exclusion", () => {
    const s = calculateScores(
      new DataCollection(
        track(1, [
          [0, false, false],
          [0, false, false],
        ])
      )
    );
    expect(JSON.stringify(s)).not.toMatch(/excluded|_ok|passed|valid/);
    expect(s.accuracy).toBe(0);
  });

  it("getSummary adds task and version", () => {
    expect(getSummary(new DataCollection([]))).toMatchObject({ task: TASK_NAME, version: VERSION });
  });
});
