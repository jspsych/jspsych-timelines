/**
 * A simulated participant for data-only simulation: a pick is always a slot (a position on the screen), never an
 * item or a correctness flag, so the pick goes through the same response code as a real click.
 *
 * The participant recognises each earlier pick as "picked" with a probability that falls with set size; an
 * unrecognised earlier pick looks new and can be chosen again (a repeat error). So repeat errors rise with set size
 * and, within a series, with the number of items already picked.
 */
import type { JsPsych } from "jspsych";

import type { Arrangement } from "./stimuli";

/** Probability that an earlier pick is recognised as picked: 0.97 at 3 items, 0.88 at 6, 0.7 at 12 (never below 0.5). */
export function recognitionProbability(setSize: number): number {
  return Math.min(1, Math.max(0.5, 1 - 0.03 * (setSize - 2)));
}

export interface SimulatedPageState {
  arrangement: Arrangement;
  /** Indices (into the series' items) already picked. */
  picked: Set<number>;
  /** A slot that cannot be clicked (enforced position rule). */
  disabled_slot: number | null;
}

/** The 0-based slot a simulated participant with the memory above clicks. */
export function simulateMemoryPick(jsPsych: JsPsych, page: SimulatedPageState): number {
  const n = page.arrangement.length;
  const m = recognitionProbability(n);
  const r = jsPsych.randomization;
  const eligible: number[] = [];
  page.arrangement.forEach((item, slot) => {
    if (slot === page.disabled_slot) return;
    if (!page.picked.has(item) || r.randomInt(0, 9999) / 10000 >= m) eligible.push(slot);
  });
  const pool =
    eligible.length > 0
      ? eligible
      : page.arrangement.map((_, s) => s).filter((s) => s !== page.disabled_slot);
  return pool[r.randomInt(0, pool.length - 1)];
}

/** The 0-based slot of a not-yet-picked item (a participant who never repeats): the walkthrough's simulation. */
export function simulateCorrectPick(jsPsych: JsPsych, page: SimulatedPageState): number {
  const slots = page.arrangement
    .map((item, slot) => ({ item, slot }))
    .filter((x) => !page.picked.has(x.item) && x.slot !== page.disabled_slot)
    .map((x) => x.slot);
  return slots[jsPsych.randomization.randomInt(0, slots.length - 1)];
}
