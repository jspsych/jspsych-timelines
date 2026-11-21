/**
 * The set-size schedule of the test: which set size each series has, in which block, in what order.
 */
import type { JsPsych } from "jspsych";

import type { BlockOrder } from "./options";

/**
 * Set sizes per block, in presentation order. A "series" is one run through a set.
 * - "ascending" / "descending": one block per set size, `reps` series each.
 * - "fixed": the same, in the order the sizes were listed.
 * - "random": one block holding all `reps` x sizes series in random order.
 * - "random_within_block": `reps` blocks, each holding every size once, in random order.
 */
export function scheduleBlocks(
  jsPsych: JsPsych,
  sizes: number[],
  reps: number,
  order: BlockOrder
): number[][] {
  const r = jsPsych.randomization;
  const grouped = (levels: number[]) => levels.map((s) => Array(reps).fill(s) as number[]);
  switch (order) {
    case "ascending":
      return grouped([...sizes].sort((a, b) => a - b));
    case "descending":
      return grouped([...sizes].sort((a, b) => b - a));
    case "fixed":
      return grouped([...sizes]);
    case "random":
      return [r.shuffle(Array.from({ length: reps }, () => sizes).flat())];
    case "random_within_block":
      return Array.from({ length: reps }, () => r.shuffle([...sizes]));
    default:
      throw new Error(`self-ordered-pointing: block_order "${order}" is not implemented.`);
  }
}

/** Set sizes of `n` practice series: the list cycled, each cycle in a shuffled order. */
export function practiceSetSizes(jsPsych: JsPsych, sizes: number[], n: number): number[] {
  const out: number[] = [];
  while (out.length < n) out.push(...jsPsych.randomization.shuffle([...sizes]));
  return out.slice(0, n);
}
