/**
 * The set-size schedule of the test: which set size each trial has, in which block, in what order.
 */
import type { JsPsych } from "jspsych";

import type { BlockOrder } from "./options";
import { setSizeLists } from "./options";

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * The "fixed" order of `levels` in repetition `rep`: an interleaved permutation (stride k, the smallest
 * integer from 2 up that is coprime with the number of levels), shifted each repetition. It does not
 * use random numbers, so every participant gets the same order.
 */
export function fixedOrder(levels: number[], rep: number): number[] {
  const m = levels.length;
  const sorted = [...levels].sort((a, b) => a - b);
  let k = 2;
  while (k < m && gcd(k, m) !== 1) k++;
  if (m < 3) k = 1;
  return sorted.map((_, j) => sorted[(j * k + rep) % m]);
}

/**
 * Set sizes per block, in presentation order.
 * - flat levels: "random" one block of all trials shuffled; "random_within_block" `reps` blocks, each level once, shuffled;
 *   "fixed" one block in `fixedOrder` repetitions; "ascending"/"descending" one block, levels grouped.
 * - per-block lists: each block holds each of its levels `reps` times, ordered by `order` within the block.
 */
export function scheduleBlocks(
  jsPsych: JsPsych,
  setSizes: number[] | number[][],
  reps: number,
  order: BlockOrder
): number[][] {
  const r = jsPsych.randomization;
  const nested = Array.isArray(setSizes[0]);
  const lists = setSizeLists(setSizes);
  const arrange = (levels: number[]): number[] => {
    const sorted = [...levels].sort((a, b) => a - b);
    switch (order) {
      case "random":
        return r.shuffle(Array.from({ length: reps }, () => levels).flat());
      case "fixed":
        return Array.from({ length: reps }, (_, i) => fixedOrder(levels, i)).flat();
      case "ascending":
        return sorted.flatMap((l) => Array(reps).fill(l));
      case "descending":
        return sorted.reverse().flatMap((l) => Array(reps).fill(l));
      default:
        throw new Error(`operation-span: block_order "${order}" is not implemented.`);
    }
  };
  if (!nested && order === "random_within_block") {
    return Array.from({ length: reps }, () => r.shuffle([...lists[0]]));
  }
  return lists.map(arrange);
}

/** Practice set sizes for `n` trials: the list cycled in a shuffled order. */
export function practiceSetSizes(
  jsPsych: JsPsych,
  setSizes: number[] | number[][],
  n: number
): number[] {
  const levels = setSizeLists(setSizes).flat();
  const out: number[] = [];
  while (out.length < n) out.push(...jsPsych.randomization.shuffle([...levels]));
  return out.slice(0, n);
}
