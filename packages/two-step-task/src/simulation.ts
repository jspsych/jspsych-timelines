/**
 * A simulated participant for data-only and visual simulation: a hybrid learner that mixes model-based
 * and model-free first-stage values (Daw et al., 2011, in a simplified form: TD(1) model-free values,
 * one learning rate, softmax choice). With `w` near 1 it stays after a rewarded common transition and
 * after an unrewarded rare one (the model-based pattern); with `w` near 0 it stays after any reward
 * (the model-free pattern). After a rare transition its second-stage RT is longer.
 *
 * The agent only drives simulated runs. A global forced RT
 * (`jsPsych.simulate(tl, "data-only", { default: { data: { rt } } })`) wins over it.
 */
import type { JsPsych } from "jspsych";

import { COMMON_STATE, OPTION_IDS, SHIP_IDS, SIMULATION, STATE_IDS } from "./constants";
import type { OptionId, StateId } from "./options";
import type { ShipId } from "./schedule";

export interface AgentParams {
  /** weight of the model-based values (0 = model-free, 1 = model-based) */
  w: number;
  /** learning rate */
  alpha: number;
  /** softmax inverse temperature */
  beta: number;
  rt: { mu: number; sigma: number; tau: number };
  /** extra second-stage RT after a rare transition, ms */
  rare_rt_cost: number;
}

let params: AgentParams = { ...SIMULATION };

/**
 * Set the parameters of the simulated participant (for every timeline built afterwards, until called again).
 * `null` restores the defaults.
 */
export function setSimulatedAgent(p: Partial<AgentParams> | null): void {
  params = { ...SIMULATION, ...(p ?? {}) };
}

export function getSimulatedAgent(): AgentParams {
  return params;
}

/** A global forced RT wins over the model. */
export function hasForcedRt(jsPsych: JsPsych): boolean {
  const o = (jsPsych as any).simulationOptions;
  return o?.default?.data?.rt !== undefined;
}

export class HybridAgent {
  /** model-free value of each first-stage option */
  q1: Record<ShipId, number> = { A: 0.5, B: 0.5 };
  /** value of each second-stage option */
  q2: Record<StateId, Record<OptionId, number>> = {
    red: { option_1: 0.5, option_2: 0.5 },
    blue: { option_1: 0.5, option_2: 0.5 },
  };

  constructor(private jsPsych: JsPsych, private commonProb: number) {}

  private draw(): number {
    return this.jsPsych.randomization.randomInt(0, 2 ** 30 - 1) / 2 ** 30;
  }

  /** Probability of choosing the first of two options with values (a, b). */
  private softmax(a: number, b: number): number {
    return 1 / (1 + Math.exp(-params.beta * (a - b)));
  }

  private best(state: StateId): number {
    return Math.max(this.q2[state].option_1, this.q2[state].option_2);
  }

  /** The model-based value of a first-stage option, from the second-stage values and the transition model. */
  mbValue(ship: ShipId): number {
    const common = COMMON_STATE[ship];
    const rare: StateId = common === "red" ? "blue" : "red";
    return this.commonProb * this.best(common) + (1 - this.commonProb) * this.best(rare);
  }

  value(ship: ShipId): number {
    return params.w * this.mbValue(ship) + (1 - params.w) * this.q1[ship];
  }

  chooseFirst(): ShipId {
    return this.draw() < this.softmax(this.value("A"), this.value("B")) ? "A" : "B";
  }

  chooseSecond(state: StateId): OptionId {
    const q = this.q2[state];
    return this.draw() < this.softmax(q.option_1, q.option_2) ? "option_1" : "option_2";
  }

  /** Learn from a finished trial. */
  update(ship: ShipId, state: StateId, option: OptionId, reward: number): void {
    this.q2[state][option] += params.alpha * (reward - this.q2[state][option]);
    this.q1[ship] += params.alpha * (reward - this.q1[ship]);
  }

  /** A response time in ms (ex-Gaussian), longer after a rare transition at the second stage. */
  rt(rare = false): number {
    const { mu, sigma, tau } = params.rt;
    const base = this.jsPsych.randomization.sampleExGaussian(mu, sigma, 1 / tau, true);
    return Math.round(Math.max(150, base + (rare ? params.rare_rt_cost : 0)));
  }
}

export { OPTION_IDS, SHIP_IDS, STATE_IDS };
