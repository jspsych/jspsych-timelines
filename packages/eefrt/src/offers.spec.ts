import { initJsPsych } from "jspsych";

import { OfferStream, fixedOrder, fixedWin, rewardLevels, rewardRange } from "./offers";
import { DEFAULT_OPTIONS } from "./options";

const base = {
  reward_probability: DEFAULT_OPTIONS.reward_probability,
  reward_magnitude: DEFAULT_OPTIONS.reward_magnitude,
};

function jsPsychWithSeed(seed: string) {
  const jsPsych = initJsPsych();
  jsPsych.randomization.setSeed(seed);
  return jsPsych;
}

describe("reward levels", () => {
  it("8 equally spaced levels from 1.24 to 4.30, rounded to cents, end points exact", () => {
    const levels = rewardLevels({ min: 1.24, max: 4.3, n_levels: 8 })!;
    expect(levels).toEqual([1.24, 1.68, 2.11, 2.55, 2.99, 3.43, 3.86, 4.3]);
  });
  it("a list is used as given, one level is the minimum, a uniform draw has none", () => {
    expect(rewardLevels({ levels: [1, 2, 4] })).toEqual([1, 2, 4]);
    expect(rewardLevels({ min: 2, max: 2, n_levels: 1 })).toEqual([2]);
    expect(rewardLevels({ uniform: { min: 1, max: 2 } })).toBeNull();
  });
  it("ranges", () => {
    expect(rewardRange({ levels: [3, 1, 2] })).toEqual({ min: 1, max: 3 });
    expect(rewardRange({ uniform: { min: 1, max: 2 } })).toEqual({ min: 1, max: 2 });
    expect(rewardRange({ min: 1, max: 2, n_levels: 3 })).toEqual({ min: 1, max: 2 });
  });
});

describe("fixed order and wins", () => {
  it("fixedOrder is a permutation, always the same, and not the identity", () => {
    const a = fixedOrder(24);
    expect([...a].sort((x, y) => x - y)).toEqual(Array.from({ length: 24 }, (_, i) => i));
    expect(fixedOrder(24)).toEqual(a);
    expect(a).not.toEqual(Array.from({ length: 24 }, (_, i) => i));
  });
  it("fixedWin spreads wins at the level's rate", () => {
    for (const p of [0.12, 0.5, 0.88]) {
      const wins = Array.from({ length: 100 }, (_, i) => fixedWin(p, i)).filter(Boolean).length;
      expect(wins).toBe(Math.round(100 * p));
    }
  });
});

describe("OfferStream", () => {
  const pass = (order: "fixed_sequence" | "shuffled_list" | "random", seed = "s", n = 24) => {
    const s = new OfferStream(jsPsychWithSeed(seed), base, order);
    return Array.from({ length: n }, () => s.next());
  };

  it("a pass of a list order holds every probability x reward cell once", () => {
    for (const order of ["fixed_sequence", "shuffled_list"] as const) {
      const cells = pass(order).map((o) => `${o.probability}/${o.hard_reward}`);
      expect(new Set(cells).size).toBe(24);
    }
  });

  it("shuffled_list balances the wins within each probability level and differs between seeds", () => {
    const offers = pass("shuffled_list");
    for (const [p, wins] of [
      [0.12, 1],
      [0.5, 4],
      [0.88, 7],
    ] as const) {
      expect(offers.filter((o) => o.probability === p && o.win)).toHaveLength(wins);
    }
    expect(pass("shuffled_list", "other").map((o) => o.cell)).not.toEqual(
      offers.map((o) => o.cell)
    );
  });

  it("fixed_sequence is the same for every seed and draws no random numbers", () => {
    // a jsPsych whose randomisation throws on any use
    const noRandom = {
      randomization: new Proxy(
        {},
        {
          get: (_t, k) => {
            throw new Error(`random draw: ${String(k)}`);
          },
        }
      ),
    } as any;
    const s = new OfferStream(noRandom, base, "fixed_sequence");
    const offers = Array.from({ length: 60 }, () => s.next());
    expect(offers).toEqual(pass("fixed_sequence", "another seed", 60));
  });

  it("random draws each offer on its own: levels from the list, wins near the rate", () => {
    const offers = pass("random", "r", 600);
    const levels = new Set(rewardLevels(DEFAULT_OPTIONS.reward_magnitude.hard));
    offers.forEach((o) => expect(levels.has(o.hard_reward)).toBe(true));
    const at = (p: number) => offers.filter((o) => o.probability === p);
    for (const p of [0.12, 0.5, 0.88]) {
      expect(Math.abs(at(p).filter((o) => o.win).length / at(p).length - p)).toBeLessThan(0.12);
    }
  });

  it("a uniform reward is drawn fresh, to cents, within the range", () => {
    const s = new OfferStream(
      jsPsychWithSeed("u"),
      { ...base, reward_magnitude: { easy: 1, hard: { uniform: { min: 1.24, max: 4.3 } } } },
      "shuffled_list"
    );
    const offers = Array.from({ length: 90 }, () => s.next());
    offers.forEach((o) => {
      expect(o.hard_reward).toBeGreaterThanOrEqual(1.24);
      expect(o.hard_reward).toBeLessThanOrEqual(4.3);
      expect(Math.abs(o.hard_reward * 100 - Math.round(o.hard_reward * 100))).toBeLessThan(1e-6);
      expect(o.cell).toBeNull();
    });
    expect(new Set(offers.map((o) => o.hard_reward)).size).toBeGreaterThan(30);
    // each pass has one offer per probability
    expect(new Set(offers.slice(0, 3).map((o) => o.probability)).size).toBe(3);
  });

  it("a single probability of 1 always wins", () => {
    const s = new OfferStream(
      jsPsychWithSeed("c"),
      { ...base, reward_probability: [1] },
      "shuffled_list"
    );
    Array.from({ length: 30 }, () => s.next()).forEach((o) => expect(o.win).toBe(true));
  });
});
