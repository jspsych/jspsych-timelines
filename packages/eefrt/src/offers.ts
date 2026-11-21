/**
 * The offers: which win probability and hard reward each trial shows, and whether the trial is a win
 * trial. Every random draw goes through `jsPsych.randomization` (PACKAGE-STANDARD §3); `fixed_sequence`
 * draws nothing.
 */
import type { JsPsych } from "jspsych";

import type { HardRewards, ResolvedOptions } from "./options";

export interface Offer {
  /** chance that the trial pays if the task is completed, 0..1 */
  probability: number;
  hard_reward: number;
  easy_reward: number;
  /** the trial is a win trial: completing the task earns the reward */
  win: boolean;
  /** index of the probability x reward cell this offer comes from (null with a per-trial uniform reward draw) */
  cell: number | null;
}

export const round2 = (x: number) => Math.round(x * 100) / 100;

/** The discrete hard-reward levels, or `null` when a reward is drawn fresh on every trial. */
export function rewardLevels(h: HardRewards): number[] | null {
  if ("levels" in h) return [...h.levels];
  if ("uniform" in h) return null;
  if (h.n_levels === 1) return [round2(h.min)];
  return Array.from({ length: h.n_levels }, (_, i) =>
    round2(h.min + ((h.max - h.min) * i) / (h.n_levels - 1))
  );
}

/** Smallest and largest hard reward the options can offer. */
export function rewardRange(h: HardRewards): { min: number; max: number } {
  if ("levels" in h) return { min: Math.min(...h.levels), max: Math.max(...h.levels) };
  if ("uniform" in h) return h.uniform;
  return { min: h.min, max: h.max };
}

/**
 * A fixed scrambled order of `n` cells, the same for every participant and every run. The order the
 * original studies used ("pre-randomised, the same for all", S007) is not published, so this is
 * the package's own constant: cells sorted by a multiplicative hash of their index. No random numbers.
 */
export function fixedOrder(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i)
    .map((i) => ({ i, key: Math.imul(i + 1, 2654435761) >>> 0 }))
    .sort((a, b) => a.key - b.key || a.i - b.i)
    .map((x) => x.i);
}

/**
 * Wins in a fixed sequence: of the n-th offer of a probability level (0-based), a win if the running
 * share of wins crosses a whole number, so the level's rate is as close to its probability as the
 * count allows and wins are spread evenly. `floor(x + .5)` rounds half up.
 */
export function fixedWin(probability: number, occurrence: number): boolean {
  return (
    Math.floor((occurrence + 1) * probability + 0.5) > Math.floor(occurrence * probability + 0.5)
  );
}

type OfferOptions = Pick<ResolvedOptions, "reward_probability" | "reward_magnitude">;
export type OfferOrder = ResolvedOptions["trial_order"];

/**
 * A lazily generated stream of offers. `shuffled_list` and `fixed_sequence` go through the cells
 * (every probability crossed with every hard-reward level) one pass at a time; `random` draws each
 * offer on its own. With a per-trial uniform reward a pass has one cell per probability.
 */
export class OfferStream {
  private queue: Offer[] = [];
  private occurrence: number[];
  private readonly levels: number[] | null;

  constructor(
    private readonly jsPsych: JsPsych,
    private readonly o: OfferOptions,
    private readonly order: OfferOrder
  ) {
    this.levels = rewardLevels(o.reward_magnitude.hard);
    this.occurrence = o.reward_probability.map(() => 0);
  }

  private drawReward(): number {
    const h = this.o.reward_magnitude.hard;
    if ("uniform" in h) {
      return (
        this.jsPsych.randomization.randomInt(
          Math.round(h.uniform.min * 100),
          Math.round(h.uniform.max * 100)
        ) / 100
      );
    }
    throw new Error("eefrt: drawReward called for a list of levels");
  }

  private make(pi: number, ri: number | null, win: boolean): Offer {
    const nR = this.levels?.length ?? 1;
    return {
      probability: this.o.reward_probability[pi],
      hard_reward: this.levels && ri !== null ? this.levels[ri] : this.drawReward(),
      easy_reward: this.o.reward_magnitude.easy,
      win,
      cell: ri === null ? null : pi * nR + ri,
    };
  }

  private fillPass(): void {
    const R = this.jsPsych.randomization;
    const P = this.o.reward_probability;
    const nR = this.levels?.length ?? 1;
    const cells: Array<{ pi: number; ri: number | null }> = [];
    for (let pi = 0; pi < P.length; pi++)
      for (let ri = 0; ri < nR; ri++) cells.push({ pi, ri: this.levels ? ri : null });
    const order =
      this.order === "fixed_sequence"
        ? fixedOrder(cells.length)
        : R.shuffle(cells.map((_, i) => i));

    // wins: balanced within each probability level where the level has several cells
    const flags: boolean[][] = P.map((p) => {
      if (this.order === "fixed_sequence") return [];
      if (nR === 1) return [R.sampleBernoulli(p) === 1];
      const k = Math.round(p * nR);
      return R.shuffle([...Array(k).fill(true), ...Array(nR - k).fill(false)]) as boolean[];
    });
    for (const idx of order) {
      const { pi, ri } = cells[idx];
      let win: boolean;
      if (this.order === "fixed_sequence") win = fixedWin(P[pi], this.occurrence[pi]++);
      else win = flags[pi][ri ?? 0];
      this.queue.push(this.make(pi, ri, win));
    }
  }

  next(): Offer {
    if (this.order === "random") {
      const R = this.jsPsych.randomization;
      const P = this.o.reward_probability;
      const pi = R.randomInt(0, P.length - 1);
      const ri = this.levels ? R.randomInt(0, this.levels.length - 1) : null;
      return this.make(pi, ri, R.sampleBernoulli(P[pi]) === 1);
    }
    if (this.queue.length === 0) this.fillPass();
    return this.queue.shift()!;
  }
}
