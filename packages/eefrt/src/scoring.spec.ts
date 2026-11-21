import { DataCollection } from "jspsych";

import { version } from "../package.json";
import { calculateScores, getSummary, payoutFor, rewardBin } from "./scoring";

const row = (o: Record<string, unknown>) => ({
  task: "eefrt",
  task_version: version,
  phase: "test",
  part: "response",
  block: 1,
  win: false,
  choice: "easy",
  choice_forced: false,
  chosen_task: "easy",
  completed: true,
  press_count: 30,
  task_duration_ms: 6000,
  reward_won: 0,
  easy_reward: 1,
  hard_reward: 2.5,
  win_probability: 0.5,
  ...o,
});

const rows = [
  // free choices
  row({ trial_index_in_block: 1, win_probability: 0.12, hard_reward: 1.24, choice: "easy" }),
  row({
    trial_index_in_block: 2,
    win_probability: 0.12,
    hard_reward: 4.3,
    choice: "hard",
    chosen_task: "hard",
    press_count: 100,
    task_duration_ms: 20000,
    completed: true,
    win: true,
    reward_won: 4.3,
  }),
  row({
    trial_index_in_block: 3,
    win_probability: 0.88,
    hard_reward: 4.3,
    choice: "hard",
    chosen_task: "hard",
    press_count: 80,
    task_duration_ms: 21000,
    completed: false,
  }),
  row({
    trial_index_in_block: 4,
    win_probability: 0.88,
    hard_reward: 2.5,
    choice: "hard",
    chosen_task: "hard",
    press_count: 100,
    task_duration_ms: 19000,
    completed: true,
    win: true,
    reward_won: 2.5,
  }),
  row({
    trial_index_in_block: 5,
    win_probability: 0.88,
    hard_reward: 1.24,
    choice: "easy",
    win: true,
    reward_won: 1,
  }),
  // the choice timed out and a task was assigned: not a free choice
  row({
    trial_index_in_block: 6,
    win_probability: 0.5,
    hard_reward: 3.5,
    choice: "none",
    choice_forced: true,
    forced_by: "timeout",
    chosen_task: "hard",
    press_count: 40,
    task_duration_ms: 21000,
    completed: false,
  }),
  // other phases and parts are never scored
  row({ trial_index_in_block: 1, phase: "practice", choice: "hard", chosen_task: "hard" }),
  { task: "eefrt", task_version: version, phase: "test", part: "choice", choice: "hard" },
  // another task's rows in the same battery
  { task: "other", phase: "test", part: "response", choice: "hard", completed: true },
];
const data = new DataCollection(rows);

describe("calculateScores", () => {
  const s = calculateScores(data);

  it("counts test trials and free choices; assigned tasks are flagged, not counted as choices", () => {
    expect(s.n_trials).toBe(6);
    expect(s.n_forced).toBe(1);
    expect(s.n_valid_choices).toBe(5);
    expect(s.n_hard_chosen).toBe(3);
    expect(s.proportion_hard).toBeCloseTo(0.6, 10);
  });

  it("proportion of hard choices by probability", () => {
    expect(s.proportion_hard_by_probability).toEqual([
      { probability: 0.12, n_valid_choices: 2, proportion_hard: 0.5 },
      { probability: 0.5, n_valid_choices: 0, proportion_hard: null },
      { probability: 0.88, n_valid_choices: 3, proportion_hard: 2 / 3 },
    ]);
  });

  it("proportion of hard choices by reward bin (thirds of the range offered) and by both", () => {
    // range 1.24..4.3: low < 2.26, mid < 3.28, high from there
    const byBin = Object.fromEntries(s.proportion_hard_by_reward_bin.map((b) => [b.bin, b]));
    expect(byBin.low).toMatchObject({ n_valid_choices: 2, proportion_hard: 0 });
    expect(byBin.mid).toMatchObject({ n_valid_choices: 1, proportion_hard: 1 });
    expect(byBin.high).toMatchObject({ n_valid_choices: 2, proportion_hard: 1 });
    expect(byBin.low.min).toBeCloseTo(1.24, 10);
    expect(byBin.high.max).toBeCloseTo(4.3, 10);
    const cell = s.proportion_hard_by_probability_and_reward_bin.find(
      (c) => c.probability === 0.88 && c.bin === "high"
    )!;
    expect(cell).toMatchObject({ n_valid_choices: 1, proportion_hard: 1 });
  });

  it("completion and press rates by the task actually done; failures are recorded, not penalised", () => {
    expect(s.n_easy_tasks).toBe(2);
    expect(s.n_hard_tasks).toBe(4);
    expect(s.n_completed).toBe(4);
    expect(s.completion_rate).toBeCloseTo(4 / 6, 10);
    expect(s.completion_rate_easy).toBe(1);
    expect(s.completion_rate_hard).toBe(0.5);
    // presses per second over the hard tasks: (100 + 80 + 100 + 40) / (20 + 21 + 19 + 21)
    expect(s.mean_press_rate_hard).toBeCloseTo(320 / 81, 10);
    expect(s.mean_press_rate_easy).toBeCloseTo(60 / 12, 10);
  });

  it("wins need completion and a win trial; expected value of the chosen task", () => {
    expect(s.n_wins).toBe(3);
    expect(s.total_reward).toBeCloseTo(7.8, 10);
    // p x reward of the task chosen, over free choices
    const ev = [0.12 * 1, 0.12 * 4.3, 0.88 * 4.3, 0.88 * 2.5, 0.88 * 1];
    expect(s.mean_expected_value_chosen).toBeCloseTo(ev.reduce((a, b) => a + b) / 5, 10);
  });

  it("the first-n measure covers the first n trials", () => {
    expect(calculateScores(data, { first_n: 2 }).proportion_hard_first_n).toBe(0.5);
    expect(calculateScores(data, { first_n: 2 }).first_n).toBe(2);
    expect(s.first_n).toBe(50);
    expect(s.proportion_hard_first_n).toBe(s.proportion_hard);
  });

  it("returns defined values for empty data: counts 0, rates and means null, never NaN", () => {
    const e = calculateScores(new DataCollection([]));
    expect(e).toMatchObject({
      n_trials: 0,
      n_forced: 0,
      n_valid_choices: 0,
      n_hard_chosen: 0,
      proportion_hard: null,
      proportion_hard_first_n: null,
      completion_rate: null,
      completion_rate_easy: null,
      completion_rate_hard: null,
      mean_press_rate_easy: null,
      mean_press_rate_hard: null,
      mean_expected_value_chosen: null,
      n_wins: 0,
      total_reward: 0,
      payout: null,
    });
    expect(e.proportion_hard_by_probability).toEqual([]);
    expect(JSON.stringify(e)).not.toContain("NaN");
    e.proportion_hard_by_reward_bin.forEach((b) => expect(b.proportion_hard).toBeNull());
  });

  it("a participant who only fails is scored, not excluded", () => {
    const failing = new DataCollection(
      [1, 2, 3].map((i) =>
        row({
          trial_index_in_block: i,
          choice: "hard",
          chosen_task: "hard",
          completed: false,
          press_count: 10,
          task_duration_ms: 21000,
        })
      )
    );
    const f = calculateScores(failing);
    expect(f.completion_rate).toBe(0);
    expect(f.proportion_hard).toBe(1);
    expect(f.total_reward).toBe(0);
    expect(Object.keys(f).some((k) => /excl|_ok$|valid$/.test(k))).toBe(false);
  });
});

describe("payout", () => {
  const test = rows.filter(
    (r) => r.phase === "test" && r.part === "response" && r.task === "eefrt"
  );
  it("percent of the total won", () => {
    expect(payoutFor("percent_of_total_5", test, undefined)).toBeCloseTo(0.39, 10);
    expect(payoutFor("percent_of_total_10", test, undefined)).toBeCloseTo(0.78, 10);
  });
  it("two random winning trials: the rewards of the paid trials", () => {
    expect(payoutFor("two_random_win_trials_paid", test, [2, 4])).toBeCloseTo(6.8, 10);
    expect(payoutFor("two_random_win_trials_paid", test, [])).toBe(0);
    expect(payoutFor("two_random_win_trials_paid", test, undefined)).toBeNull();
  });
  it("is read from the completion row, or given", () => {
    const withDone = new DataCollection([
      ...rows,
      {
        task: "eefrt",
        phase: "completion",
        part: "completion",
        payout_rule: "two_random_win_trials_paid",
        paid_trials: [2],
      },
    ]);
    expect(calculateScores(withDone).payout).toBeCloseTo(4.3, 10);
    expect(calculateScores(data, { payout_rule: "percent_of_total_10" }).payout).toBeCloseTo(
      0.78,
      10
    );
    expect(calculateScores(data).payout).toBeNull();
    expect(getSummary(data, { payout_rule: "percent_of_total_5" })).toMatchObject({
      n_trials: 6,
      payout: 0.39,
    });
  });
  it("an unknown rule gives no payout", () => {
    expect(payoutFor("fixed_noncontingent_with_deception", test, [])).toBeNull();
    expect(payoutFor(null, test, [])).toBeNull();
  });
});

describe("rewardBin", () => {
  it("thirds of the range; a single level is all low", () => {
    expect(rewardBin(1.24, 1.24, 4.3)).toBe("low");
    expect(rewardBin(2.25, 1.24, 4.3)).toBe("low");
    expect(rewardBin(2.5, 1.24, 4.3)).toBe("mid");
    expect(rewardBin(3.3, 1.24, 4.3)).toBe("high");
    expect(rewardBin(4.3, 1.24, 4.3)).toBe("high");
    expect(rewardBin(2, 2, 2)).toBe("low");
  });
});
