import type { JsPsych } from "jspsych";

import type {
  DurationOrJitter,
  FlankerCondition,
  NeutralFlankerForm,
  ResolvedOptions,
} from "./options";
import { neutralGlyph } from "./stimuli";
import type { Glyph } from "./stimuli";

export type Congruency = "congruent" | "incongruent" | "neutral" | "nogo";

/** Everything needed to render and score one trial. */
export interface TrialSpec {
  /** The generated trial type; `neutral` is resolved to a form (neutral_dash, neutral_empty, ...). */
  flanker_condition: string;
  congruency: Congruency;
  /** Response group the target belongs to (0 or 1). For nogo: the group the flanker arrows point to. */
  group: 0 | 1;
  target: Glyph;
  flanker: Glyph;
  per_side: number;
  gap: number;
  gap_unit: "px" | "deg";
  cued: boolean | null;
  fixation_ms: number;
}

export interface Mapping {
  /** response index (0 = first key/button) used for each target group */
  response_of_group: [number, number];
}

/** Largest-remainder allocation of `n` items to normalised weights; ties go to the earlier entry. */
export function allocateCounts(weights: number[], n: number): number[] {
  const total = weights.reduce((a, b) => a + b, 0);
  if (!(total > 0)) throw new Error("flanker: condition proportions must sum to more than 0.");
  const exact = weights.map((w) => (w / total) * n);
  const counts = exact.map(Math.floor);
  let left = n - counts.reduce((a, b) => a + b, 0);
  const order = exact
    .map((e, i) => ({ i, r: e - Math.floor(e) }))
    .sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) counts[order[k].i]++;
  return counts;
}

export function expandDuration(d: DurationOrJitter): number[] {
  if (typeof d === "number") return [d];
  const step = d.step && d.step > 0 ? d.step : 1;
  const out: number[] = [];
  for (let v = d.min; v <= d.max + 1e-9; v += step) out.push(v);
  return out;
}

const NEUTRAL_LETTERS = ["S", "X", "O", "Z", "T"];

export function nonTargetLetter(groups: string[][]): string {
  const used = new Set(groups.flat().map((l) => l.toUpperCase()));
  return NEUTRAL_LETTERS.find((l) => !used.has(l)) ?? "#";
}

interface Ctx {
  jsPsych: JsPsych;
  o: ResolvedOptions;
}

function balanced<T>(ctx: Ctx, values: T[], n: number, shuffle: boolean): T[] {
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(values[i % values.length]);
  return shuffle ? ctx.jsPsych.randomization.shuffle(out) : out;
}

/**
 * Build `n` trial specs for one block. Counts per trial type are exact (largest remainder over the
 * normalised proportions); direction, flanker count and spacing are balanced within the block.
 */
export function buildTrialSpecs(ctx: Ctx, n: number): TrialSpec[] {
  const { jsPsych, o } = ctx;
  const R = jsPsych.randomization;
  const props = o.condition_proportions;
  const conds = (Object.keys(props) as Array<keyof typeof props>).filter(
    (k) => k !== "cued" && k !== "uncued" && (props[k] ?? 0) > 0
  ) as FlankerCondition[];
  const weights = conds.map((c) => props[c] as number);
  const order = o.trial_order;
  const target = o.stimulus_set.target ?? "arrows";
  const letters = target === "arrows" ? null : target.letters;
  const perSides = ((): number[] => {
    const p = o.stimulus_set.flanker?.per_side ?? 2;
    return Array.isArray(p) ? p : [p];
  })();
  const spacing = o.stimulus_layout.flanker_spacing ?? { gap: 0, unit: "px" as const };
  const gaps =
    spacing === "adjacent" ? [0] : Array.isArray(spacing.gap) ? spacing.gap : [spacing.gap];
  const gapUnit: "px" | "deg" = spacing === "adjacent" ? "px" : spacing.unit;
  const neutralForms = ((): NeutralFlankerForm[] => {
    const f = o.stimulus_set.neutral_flanker ?? "dashes";
    return Array.isArray(f) ? f : [f];
  })();
  let neutralCounter = 0;
  const spare = letters ? nonTargetLetter(letters) : "S";

  // condition per trial
  let condList: FlankerCondition[];
  if (order === "random") {
    condList = R.sampleWithReplacement(conds, n, weights) as FlankerCondition[];
  } else {
    const counts = allocateCounts(weights, n);
    condList = [];
    if (order === "fixed_sequence") {
      const left = [...counts];
      while (left.some((c) => c > 0)) {
        conds.forEach((c, i) => {
          if (left[i] > 0) {
            condList.push(c);
            left[i]--;
          }
        });
      }
    } else {
      conds.forEach((c, i) => {
        for (let k = 0; k < counts[i]; k++) condList.push(c);
      });
    }
  }

  const shuffle = order === "shuffled_list";
  const rnd = order === "random";

  // direction within condition
  const groups: Array<0 | 1> = new Array(n);
  const byCond = new Map<FlankerCondition, number[]>();
  condList.forEach((c, i) => byCond.set(c, [...(byCond.get(c) ?? []), i]));
  byCond.forEach((idx) => {
    const dirs = rnd
      ? idx.map(() => R.randomInt(0, 1) as 0 | 1)
      : (balanced(ctx, [0, 1] as Array<0 | 1>, idx.length, shuffle) as Array<0 | 1>);
    idx.forEach((i, k) => (groups[i] = dirs[k]));
  });

  const sides = rnd
    ? condList.map(() => R.sampleWithReplacement(perSides, 1)[0])
    : balanced(ctx, perSides, n, shuffle);
  const gapList = rnd
    ? condList.map(() => R.sampleWithReplacement(gaps, 1)[0])
    : balanced(ctx, gaps, n, shuffle);

  // cue factor
  let cuedList: Array<boolean | null> = new Array(n).fill(null);
  if ((o.stimulus_set.cue ?? "none") !== "none") {
    const pc = props.cued ?? (props.uncued === undefined ? 1 : 0);
    const pu = props.uncued ?? 0;
    if (rnd) {
      cuedList = condList.map(
        () => R.sampleWithReplacement([true, false], 1, [pc || 1e-9, pu || 1e-9])[0]
      );
    } else {
      const [nc] = allocateCounts([pc, pu], n);
      const flags = [...new Array(nc).fill(true), ...new Array(n - nc).fill(false)];
      cuedList = shuffle ? R.shuffle(flags) : flags;
    }
  }

  const fixations = expandDuration(o.fixation_duration_ms);

  // letter picks (balanced within group)
  const pickLetter = (g: 0 | 1, k: number): string => {
    const grp = letters![g];
    return grp[k % grp.length];
  };
  const letterCounter = [0, 0];

  const specs: TrialSpec[] = condList.map((c, i) => {
    const g = groups[i];
    const congruency: Congruency =
      c === "congruent"
        ? "congruent"
        : c === "incongruent"
        ? "incongruent"
        : c === "nogo"
        ? "nogo"
        : "neutral";
    let tgt: Glyph;
    let flank: Glyph;
    let cond: string = c;
    const form: NeutralFlankerForm =
      c === "neutral_dash"
        ? "dashes"
        : c === "neutral_empty"
        ? "blank"
        : neutralForms[neutralCounter++ % neutralForms.length];
    if (c === "neutral") cond = `neutral_${form}`;
    if (letters) {
      const k = letterCounter[g]++;
      const grp = letters[g];
      const rndLetter = rnd ? grp[R.randomInt(0, grp.length - 1)] : pickLetter(g, k);
      const other = letters[g === 0 ? 1 : 0];
      if (congruency === "nogo") {
        tgt = "cross";
        flank = other[0];
      } else {
        tgt = rndLetter;
        flank =
          congruency === "congruent"
            ? tgt
            : congruency === "incongruent"
            ? other[R.randomInt(0, other.length - 1)]
            : neutralGlyph(form, spare);
      }
    } else {
      const arrow = g === 0 ? "left" : "right";
      const opposite = g === 0 ? "right" : "left";
      if (congruency === "nogo") {
        tgt = "cross";
        flank = arrow;
      } else {
        tgt = arrow;
        flank =
          congruency === "congruent"
            ? arrow
            : congruency === "incongruent"
            ? opposite
            : neutralGlyph(form, spare);
      }
    }
    return {
      flanker_condition: cond,
      congruency,
      group: g,
      target: tgt,
      flanker: flank,
      per_side: sides[i],
      gap: gapList[i],
      gap_unit: gapUnit,
      cued: cuedList[i],
      fixation_ms: R.sampleWithReplacement(fixations, 1)[0],
    };
  });

  if (order === "shuffled_list") return R.shuffle(specs);
  return specs;
}

/**
 * One deterministic spec for the instruction walkthrough: the first flanker count and spacing, the
 * first letter of the target group, and the given neutral form. `group` picks the correct response.
 */
export function buildDemoSpec(
  o: ResolvedOptions,
  flanker_condition: string,
  form: NeutralFlankerForm,
  group: 0 | 1
): TrialSpec {
  const congruency: Congruency = flanker_condition.startsWith("neutral")
    ? "neutral"
    : (flanker_condition as Congruency);
  const target = o.stimulus_set.target ?? "arrows";
  const letters = target === "arrows" ? null : target.letters;
  const p = o.stimulus_set.flanker?.per_side ?? 2;
  const per_side = Array.isArray(p) ? p[0] : p;
  const spacing = o.stimulus_layout.flanker_spacing ?? { gap: 0, unit: "px" as const };
  const gap =
    spacing === "adjacent" ? 0 : Array.isArray(spacing.gap) ? spacing.gap[0] : spacing.gap;
  const gap_unit: "px" | "deg" = spacing === "adjacent" ? "px" : spacing.unit;
  const other = group === 0 ? 1 : 0;
  let tgt: Glyph;
  let flank: Glyph;
  if (letters) {
    tgt = letters[group][0];
    flank =
      congruency === "nogo"
        ? letters[other][0]
        : congruency === "congruent"
        ? tgt
        : congruency === "incongruent"
        ? letters[other][0]
        : neutralGlyph(form, nonTargetLetter(letters));
    if (congruency === "nogo") tgt = "cross";
  } else {
    const arrow = group === 0 ? "left" : "right";
    tgt = congruency === "nogo" ? "cross" : arrow;
    flank =
      congruency === "incongruent"
        ? group === 0
          ? "right"
          : "left"
        : congruency === "neutral"
        ? neutralGlyph(form, "S")
        : arrow;
  }
  return {
    flanker_condition,
    congruency,
    group,
    target: tgt,
    flanker: flank,
    per_side,
    gap,
    gap_unit,
    cued: null,
    fixation_ms: 0,
  };
}
