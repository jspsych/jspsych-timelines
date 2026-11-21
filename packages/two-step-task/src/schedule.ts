/**
 * The generated part of the task: the transitions, the drifting reward probabilities, the rewards and
 * the sides of the options. Everything is drawn when the timeline is built, through
 * `jsPsych.randomization`, so a seeded run has the same schedule whatever the participant (or the
 * simulated agent) chooses, and the schedule is recorded in the data.
 */
import type { JsPsych } from "jspsych";

import { OPTION_IDS, SHIP_IDS, STATE_IDS } from "./constants";
import type {
  OptionId,
  ProbabilitySpec,
  ResolvedOptions,
  RewardSchedule,
  StateId,
} from "./options";

export type Probabilities = Record<StateId, Record<OptionId, number>>;
export type Rewards = Record<StateId, Record<OptionId, boolean>>;
export type ShipId = (typeof SHIP_IDS)[number];

/** Everything that is decided in advance about one trial. */
export interface TrialPlan {
  /** 1-based position in the run of trials of the phase (the unit the walk advances in) */
  index: number;
  /** is the transition the common one? */
  common: boolean;
  /** the reward probability of each second-stage option on this trial */
  probs: Probabilities;
  /** would each option reward the participant on this trial? (drawn from `probs`) */
  rewards: Rewards;
  /** the first-stage option shown on the left */
  ship_left: ShipId;
  /** the option shown on the left in each state */
  alien_left: Record<StateId, OptionId>;
}

/** A uniform draw in [0, 1) from jsPsych.randomization. */
export function uniform(jsPsych: JsPsych): number {
  return jsPsych.randomization.randomInt(0, 2 ** 30 - 1) / 2 ** 30;
}

/** A starting probability: the number, or a uniform draw from the range. */
export function drawStart(jsPsych: JsPsych, v: ProbabilitySpec): number {
  return typeof v === "number" ? v : v.min + uniform(jsPsych) * (v.max - v.min);
}

/**
 * One step of the walk, with the bound rule applied. `reflect` folds a step that crosses a bound back
 * inside (repeatedly, in case the excess is large). `reverse_step` takes the opposite step when the
 * step would cross a bound, as the Expfactory two-stage-decision code does; if even that crosses (a
 * step larger than the range), the value is clamped.
 */
export function stepProbability(
  p: number,
  step: number,
  bounds: [number, number],
  boundary: "reflect" | "reverse_step"
): number {
  const [lo, hi] = bounds;
  let next = p + step;
  if (boundary === "reverse_step") {
    if (next < lo || next > hi) next = p - step;
    return Math.min(hi, Math.max(lo, next));
  }
  for (let i = 0; i < 100 && (next < lo || next > hi); i++) {
    if (next > hi) next = 2 * hi - next;
    if (next < lo) next = 2 * lo - next;
  }
  return Math.min(hi, Math.max(lo, next));
}

/** The probabilities of `n` consecutive trials: `start` on the first, then one step per trial. */
export function generateWalk(
  jsPsych: JsPsych,
  start: Probabilities,
  schedule: Extract<RewardSchedule, { kind: "random_walk" }>,
  n: number
): Probabilities[] {
  const out: Probabilities[] = [];
  let cur = start;
  for (let t = 0; t < n; t++) {
    if (t > 0) {
      const next: any = {};
      for (const s of STATE_IDS) {
        next[s] = {};
        for (const o of OPTION_IDS) {
          const step = jsPsych.randomization.sampleNormal(0, schedule.sd);
          next[s][o] = stepProbability(cur[s][o], step, schedule.bounds, schedule.boundary);
        }
      }
      cur = next;
    }
    out.push(cur);
  }
  return out;
}

/** The sides of the options for `n` trials. */
function drawSides(
  jsPsych: JsPsych,
  mode: ResolvedOptions["option_side_assignment"],
  n: number,
  blockSizes: number[]
): boolean[] {
  // true = the first option (ship A, option_1) is on the left
  const R = jsPsych.randomization;
  if (mode === "fixed") return new Array(n).fill(R.sampleBernoulli(0.5) === 1);
  if (mode === "counterbalanced") {
    const out: boolean[] = [];
    for (const size of blockSizes) {
      const half = Math.floor(size / 2);
      const flags = R.shuffle([
        ...new Array(half).fill(true),
        ...new Array(half).fill(false),
        ...(size % 2 ? [R.sampleBernoulli(0.5) === 1] : []),
      ]) as boolean[];
      out.push(...flags);
    }
    return out;
  }
  return Array.from({ length: n }, () => R.sampleBernoulli(0.5) === 1);
}

/**
 * The plans of `n` trials of one phase. `block_sizes` (summing to `n`) only matters for balancing the
 * sides within a block. The order of draws is fixed (start values, walk, sides, then per trial: transition,
 * rewards), so the schedule of a seed depends on the options that define it (counts, probabilities, walk, side
 * assignment, `common_transition_prob`) and on nothing the participant does.
 */
export function buildSchedule(
  jsPsych: JsPsych,
  o: ResolvedOptions,
  n: number,
  block_sizes: number[] = [n]
): TrialPlan[] {
  const schedule = o.reward_schedule as Extract<RewardSchedule, { kind: "random_walk" }>;
  const start: any = {};
  for (const s of STATE_IDS) {
    start[s] = {};
    for (const opt of OPTION_IDS) start[s][opt] = drawStart(jsPsych, o.reward_probability[s][opt]);
  }
  const walk = generateWalk(jsPsych, start, schedule, n);
  const R = jsPsych.randomization;
  const shipSides = drawSides(jsPsych, o.option_side_assignment, n, block_sizes);
  const alienSides: Record<StateId, boolean[]> = {
    red: drawSides(jsPsych, o.option_side_assignment, n, block_sizes),
    blue: drawSides(jsPsych, o.option_side_assignment, n, block_sizes),
  };
  return walk.map((probs, t) => {
    const common = R.sampleBernoulli(o.common_transition_prob) === 1;
    const rewards: any = {};
    for (const s of STATE_IDS) {
      rewards[s] = {};
      for (const opt of OPTION_IDS) rewards[s][opt] = R.sampleBernoulli(probs[s][opt]) === 1;
    }
    return {
      index: t + 1,
      common,
      probs,
      rewards,
      ship_left: shipSides[t] ? "A" : "B",
      alien_left: {
        red: alienSides.red[t] ? "option_1" : "option_2",
        blue: alienSides.blue[t] ? "option_1" : "option_2",
      },
    } as TrialPlan;
  });
}

/** Split `total` into `parts` near-equal integers; the remainder goes to the first blocks. */
export function splitTrials(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const extra = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
}
