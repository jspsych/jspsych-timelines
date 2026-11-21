/**
 * A simulated listener for data-only simulation: a psychometric function of level with a guess rate of 1/n_intervals and a lapse
 * rate (logistic in dB), so staircases reverse and settle near the threshold, as the stop-signal task's race model does for its
 * staircase. A global forced RT (`jsPsych.simulate(tl, "data-only", { default: { data: { rt } } })`) wins over this model.
 */
import type { JsPsych } from "jspsych";

import { SIMULATION } from "./constants";

/** A global forced RT replaces the model's. */
export function hasForcedRt(jsPsych: JsPsych): boolean {
  const o = (jsPsych as any).simulationOptions;
  return o?.default?.data?.rt !== undefined;
}

const draw = (jsPsych: JsPsych) => jsPsych.randomization.randomInt(0, 1_000_000) / 1_000_000;

/** Probability of a correct answer at `level` (dB SNR with a masker, dB FS in quiet). */
export function probabilityCorrect(level: number, n_intervals: number, masker: boolean): number {
  const threshold = masker ? SIMULATION.threshold_snr_db : SIMULATION.threshold_quiet_db;
  const guess = 1 / n_intervals;
  const f = 1 / (1 + Math.exp(-(level - threshold) / SIMULATION.slope_db));
  return guess + (1 - guess - SIMULATION.lapse_rate) * f;
}

export interface SimulatedAnswer {
  /** 1-based interval chosen */
  response_interval: number;
  rt: number;
}

export function simulateListener(
  jsPsych: JsPsych,
  trial: { level: number; n_intervals: number; target_interval: number; masker: boolean }
): SimulatedAnswer {
  const R = jsPsych.randomization;
  const correct = draw(jsPsych) < probabilityCorrect(trial.level, trial.n_intervals, trial.masker);
  let response = trial.target_interval;
  if (!correct) {
    const others = Array.from({ length: trial.n_intervals }, (_, i) => i + 1).filter(
      (i) => i !== trial.target_interval
    );
    response = others[R.randomInt(0, others.length - 1)];
  }
  const rt = Math.max(
    150,
    Math.round(
      R.sampleExGaussian(SIMULATION.rt.mu, SIMULATION.rt.sigma, 1 / SIMULATION.rt.tau, true)
    )
  );
  return { response_interval: response, rt };
}

/** A simulated listener answers correctly (the walkthrough, which data-only simulation answers correctly). */
export const answerCorrectly = (target_interval: number): SimulatedAnswer => ({
  response_interval: target_interval,
  rt: 600,
});

/** The headphone screen: mostly correct, with errors, so scoring is tested on wrong answers too. */
export function simulateHeadphoneAnswer(
  jsPsych: JsPsych,
  target_interval: number,
  n_intervals: number
): SimulatedAnswer {
  const R = jsPsych.randomization;
  const correct = draw(jsPsych) < SIMULATION.headphone_accuracy;
  const others = Array.from({ length: n_intervals }, (_, i) => i + 1).filter(
    (i) => i !== target_interval
  );
  return {
    response_interval: correct ? target_interval : others[R.randomInt(0, others.length - 1)],
    rt: Math.max(
      150,
      Math.round(
        R.sampleExGaussian(SIMULATION.rt.mu, SIMULATION.rt.sigma, 1 / SIMULATION.rt.tau, true)
      )
    ),
  };
}
