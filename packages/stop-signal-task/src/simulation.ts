/**
 * A simulated participant for data-only and visual simulation: an independent race between a go
 * process and a stop process (Logan & Cowan, 1984). The go RT is ex-Gaussian; the stop process
 * finishes SSRT ms after the signal. A response is made on a stop trial when the go process wins
 * (or, rarely, when the stop process is not triggered). So the staircase converges where it should and
 * failed-stop RTs are faster than go RTs, which is what the scoring's checks look for.
 */
import type { JsPsych } from "jspsych";

import { SIMULATION } from "./constants";

export interface SimulatedResponse {
  rt: number | null;
  /** index of the response (0 = left-arrow response), or null for no response */
  response_index: 0 | 1 | null;
}

/** A global forced RT (`jsPsych.simulate(tl, "data-only", { default: { data: { rt } } })`) wins over this model. */
export function hasForcedRt(jsPsych: JsPsych): boolean {
  const o = (jsPsych as any).simulationOptions;
  return o?.default?.data?.rt !== undefined;
}

export function simulateRace(
  jsPsych: JsPsych,
  trial: { trial_type: "go" | "stop"; ssd: number | null; direction: "left" | "right" },
  window_ms: number
): SimulatedResponse {
  const R = jsPsych.randomization;
  const correct = trial.direction === "left" ? 0 : 1;
  const draw = () => R.randomInt(0, 1_000_000) / 1_000_000;
  const goRt = Math.round(
    R.sampleExGaussian(SIMULATION.go_rt.mu, SIMULATION.go_rt.sigma, 1 / SIMULATION.go_rt.tau, true)
  );
  const pick = (): 0 | 1 =>
    draw() < SIMULATION.choice_error ? ((1 - correct) as 0 | 1) : (correct as 0 | 1);
  if (trial.trial_type === "go") {
    if (draw() < SIMULATION.go_omission || goRt > window_ms)
      return { rt: null, response_index: null };
    return { rt: goRt, response_index: pick() };
  }
  const ssrt = Math.max(50, R.sampleNormal(SIMULATION.ssrt.mean, SIMULATION.ssrt.sd));
  const stopFinishes = (trial.ssd ?? 0) + ssrt;
  const triggerFailure = draw() < SIMULATION.trigger_failure;
  if ((triggerFailure || goRt < stopFinishes) && goRt <= window_ms) {
    return { rt: goRt, response_index: pick() };
  }
  return { rt: null, response_index: null };
}
