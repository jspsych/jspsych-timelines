/**
 * A simulated participant for data-only and visual simulation. The choice of the hard task is a logistic
 * function of the win probability and of the hard reward relative to the easy one, so it rises with both;
 * choices take about 1.5 s and are occasionally missed. Press rates differ a little between trials
 * and between the two tasks, so some trials fail to reach the target. All draws go through
 * `jsPsych.randomization`.
 */
import type { JsPsych } from "jspsych";

import { SIMULATION } from "./constants";
import type { Offer } from "./offers";

/** A global forced RT (`jsPsych.simulate(tl, "data-only", { default: { data: { rt } } })`) wins over the model. */
export function hasForcedRt(jsPsych: JsPsych): boolean {
  const o = (jsPsych as any).simulationOptions;
  return o?.default?.data?.rt !== undefined;
}

/** Probability that the simulated participant chooses the hard task for this offer. */
export function hardChoiceProbability(
  offer: Pick<Offer, "probability" | "hard_reward" | "easy_reward">
): number {
  const c = SIMULATION.choice;
  const ratio = offer.easy_reward > 0 ? offer.hard_reward / offer.easy_reward : offer.hard_reward;
  const logit =
    c.intercept +
    c.per_probability * (offer.probability - 0.5) +
    c.per_reward_ratio * (ratio - c.reward_ratio_centre);
  return 1 / (1 + Math.exp(-logit));
}

export interface SimulatedChoice {
  /** null: no choice made in time */
  task: "easy" | "hard" | null;
  rt: number | null;
}

export function simulateChoice(
  jsPsych: JsPsych,
  offer: Offer,
  windowMs: number | null
): SimulatedChoice {
  const R = jsPsych.randomization;
  const c = SIMULATION.choice;
  const draw = R.sampleExGaussian(c.rt.mu, c.rt.sigma, 1 / c.rt.tau, true);
  const rt = Math.max(250, Math.round(draw));
  const missed = windowMs !== null && (R.sampleBernoulli(c.timeout) === 1 || rt > windowMs);
  if (missed) return { task: null, rt: null };
  return { task: R.sampleBernoulli(hardChoiceProbability(offer)) === 1 ? "hard" : "easy", rt };
}

/** Mean press rate (presses per second) of this trial: between-trial variation around the task's mean. */
export function simulatePressRate(jsPsych: JsPsych, task: "easy" | "hard"): number {
  const r = SIMULATION.press_rate[task];
  return Math.max(1, jsPsych.randomization.sampleNormal(r.mean, r.sd));
}

/**
 * Press times in ms from the start of the effort phase: gaps around 1000 / rate, until `required`
 * presses are made or `limit` ms have passed.
 */
export function simulatePressTimes(
  jsPsych: JsPsych,
  required: number,
  limit: number | null,
  rate: number,
  gapCv: number = SIMULATION.press_rate.gap_cv
): number[] {
  const R = jsPsych.randomization;
  const mean = 1000 / rate;
  const times: number[] = [];
  let t = 0;
  while (times.length < required) {
    t += Math.max(SIMULATION.press_rate.min_gap_ms, R.sampleNormal(mean, mean * gapCv));
    if (limit !== null && t > limit) break;
    times.push(Math.round(t));
  }
  return times;
}
