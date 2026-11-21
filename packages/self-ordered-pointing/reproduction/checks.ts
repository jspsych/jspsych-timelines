/**
 * Self-ordered pointing checks. The checks for options every package shares (the blank between pages, the response
 * window, feedback, the response device, the practice count) live in `@jspsych-timelines/testing`; the contract that
 * points them at this task's data is `./contract.ts`. This file has what is specific to the task: set sizes and block
 * order, the items and their pool rule, the layout, the rearrangement rule, the position-repeat rule, and the options
 * that only accept one value.
 *
 * The shared `response_keys` check is not used: the response is a position on screen, not a key, and the package has no
 * key option (logged in the friction report).
 */
import { Check, CheckSet, distinct, sharedChecks } from "@jspsych-timelines/testing";

import type { ResolvedOptions, SelfOrderedPointingOptions } from "../src/options";
import { gridDims } from "../src/stimuli";
import { rowsOf } from "./harness";
import type { Run } from "./harness";

type SoptCheck = Check<SelfOrderedPointingOptions, ResolvedOptions>;

const test = (r: Run) => rowsOf(r, "test", "response");
const practice = (r: Run) => rowsOf(r, "practice", "response");
const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);

/** Rows grouped by series, in order. */
function seriesOf(rows: any[]): any[][] {
  const m = new Map<number, any[]>();
  for (const x of rows) m.set(x.series, [...(m.get(x.series) ?? []), x]);
  return [...m.values()].map((s) => s.sort((a, b) => a.choice_index - b.choice_index));
}

const sizeOfSeries = (s: any[]) => s[0].set_size as number;

/** A series is complete: set_size pages, numbered 1..n, every pick a slot of the grid. */
function expectCompleteSeries(rows: any[]) {
  for (const s of seriesOf(rows)) {
    expect(s).toHaveLength(sizeOfSeries(s));
    expect(s.map((x) => x.choice_index)).toEqual(s.map((_, i) => i + 1));
    s.forEach((x) => {
      expect(x.item_arrangement).toHaveLength(x.set_size);
      expect(distinct(x.item_arrangement)).toHaveLength(x.set_size);
    });
  }
}

const itemKind = (id: string) =>
  id.startsWith("design-") ? "design" : id.startsWith("image-") ? "image" : "text";

const spanOnly: Record<string, SoptCheck> = {
  set_sizes: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const sizes = distinct(test(r).map((x) => x.set_size as number));
      expect(sorted(sizes)).toEqual(sorted(r.eff.set_sizes));
      expectCompleteSeries(test(r));
      // practice set sizes come from `practice.set_sizes`, never from the test's
      if (r.effP.practice_trials > 0 || practice(r).length > 0) {
        const p = distinct(practice(r).map((x) => x.set_size as number));
        p.forEach((s) => expect(r.effP.set_sizes).toContain(s));
        expectCompleteSeries(practice(r));
      }
    },
  },
  trials_per_condition: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      for (const size of r.eff.set_sizes) {
        const series = seriesOf(test(r).filter((x) => x.set_size === size));
        expect(series).toHaveLength(r.eff.trials_per_condition);
        expect(series.map((s) => s[0].set_size_trial)).toEqual(
          Array.from({ length: r.eff.trials_per_condition }, (_, i) => i + 1)
        );
      }
    },
  },
  block_order: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const series = seriesOf(test(r));
      const sizes = series.map(sizeOfSeries);
      const blocks = new Map<number, number[]>();
      for (const s of series)
        blocks.set(s[0].block, [...(blocks.get(s[0].block) ?? []), sizeOfSeries(s)]);
      const reps = r.eff.trials_per_condition;
      const asc = sorted(r.eff.set_sizes);
      switch (r.eff.block_order) {
        case "ascending":
          expect(sizes).toEqual(asc.flatMap((s) => Array(reps).fill(s)));
          expect([...blocks.values()]).toEqual(asc.map((s) => Array(reps).fill(s)));
          break;
        case "descending":
          expect(sizes).toEqual([...asc].reverse().flatMap((s) => Array(reps).fill(s)));
          break;
        case "fixed":
          expect(sizes).toEqual(r.eff.set_sizes.flatMap((s) => Array(reps).fill(s)));
          break;
        case "random":
          expect(blocks.size).toBe(1);
          expect(sorted(sizes)).toEqual(sorted(asc.flatMap((s) => Array(reps).fill(s))));
          break;
        case "random_within_block":
          expect(blocks.size).toBe(reps);
          for (const b of blocks.values()) expect(sorted(b)).toEqual(asc);
          break;
        default:
          throw new Error(`unexpected block_order ${r.eff.block_order}`);
      }
      // trial_index_in_block counts the series within their block
      for (const s of series) {
        const b = blocks.get(s[0].block)!;
        expect(s[0].trial_index_in_block).toBeGreaterThanOrEqual(1);
        expect(s[0].trial_index_in_block).toBeLessThanOrEqual(b.length);
      }
    },
  },
  stimulus_layout: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const rows = test(r);
      rows.forEach((x) => {
        expect(x.stimulus_layout).toBe(r.eff.stimulus_layout);
        if (r.eff.stimulus_layout === "free_positions_in_area") {
          expect(x.item_offsets).toHaveLength(x.set_size);
        } else {
          expect(x.item_offsets).toBeUndefined();
          const { rows: nr, cols } = gridDims(x.set_size);
          expect(x.chosen_row).toBeLessThanOrEqual(nr);
          expect(x.chosen_col).toBeLessThanOrEqual(cols);
          expect((x.chosen_row - 1) * cols + x.chosen_col).toBe(x.chosen_position);
        }
      });
    },
  },
  stimulus_set: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const { items, pool } = r.eff.stimulus_set;
      const kind =
        typeof items === "object"
          ? "words" in items
            ? "text"
            : "image"
          : items === "abstract_designs"
          ? "design"
          : "text";
      const bySize = new Map<number, Set<string>>();
      for (const x of test(r)) {
        x.item_arrangement.forEach((id: string) => expect(itemKind(id)).toBe(kind));
        const s = bySize.get(x.set_size) ?? new Set<string>();
        x.item_arrangement.forEach((id: string) => s.add(id));
        bySize.set(x.set_size, s);
      }
      for (const [size, set] of bySize) expect(set.size).toBe(size);
      if (typeof items === "string" && items !== "abstract_designs")
        for (const set of bySize.values()) set.forEach((id) => expect(id).toMatch(/^[a-z]+$/));
      const sets = [...bySize.entries()].sort((a, b) => a[0] - b[0]);
      if (pool === "nested_first_n") {
        // each smaller set is contained in the next larger one
        for (let i = 1; i < sets.length; i++)
          sets[i - 1][1].forEach((id) => expect(sets[i][1]).toContain(id));
      } else {
        // no item appears in two set sizes
        const all = sets.flatMap(([, s]) => [...s]);
        expect(distinct(all)).toHaveLength(all.length);
      }
      // the arrangement is a permutation of the series' items on every page
      const ids = (x: any) => [...(x.item_arrangement as string[])].sort();
      for (const s of seriesOf(test(r))) s.forEach((x) => expect(ids(x)).toEqual(ids(s[0])));
    },
  },
  rearrangement_rule: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      for (const s of seriesOf(test(r))) {
        for (let i = 1; i < s.length; i++) {
          const a: string[] = s[i - 1].item_arrangement;
          const b: string[] = s[i].item_arrangement;
          const moved = b.filter((id, k) => id !== a[k]).length;
          // never the arrangement of the page before
          expect(moved).toBeGreaterThan(0);
          if (r.eff.rearrangement_rule === "partial_reshuffle_each_page") {
            const k = Math.min(
              b.length,
              Math.max(2, Math.round(b.length * r.eff.reshuffle_proportion))
            );
            expect(moved).toBe(k);
          }
        }
      }
    },
  },
  sequence_constraints: {
    // the spec's untyped "position repetition rule", as the task-specific `position_repeat_rule`
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const rule = r.eff.position_repeat_rule;
      const max = r.eff.position_repeat_max;
      const rows = test(r);
      rows.forEach((x) => {
        expect(x.disabled_position === null || rule === "enforced").toBe(true);
        expect(x.position_rule_violation).toBe(rule !== "none" && x.same_position_run > max);
        // a run is never longer than the picks before it in the series
        expect(x.same_position_run).toBeLessThanOrEqual(x.choice_index);
        if (rule === "enforced") expect(x.same_position_run).toBeLessThanOrEqual(max);
      });
      const reminders = rowsOf(r, "test", "reminder");
      expect(reminders.length).toBe(
        rule === "detect_and_remind" ? rows.filter((x) => x.position_rule_violation).length : 0
      );
    },
  },
  adaptive: {
    // only a fixed schedule is implemented
    requires: [],
    kind: "structure",
    fn: (r) => {
      expect(r.eff.adaptive).toBeNull();
      expectCompleteSeries(test(r));
    },
  },
  error_correction_procedure: {
    // "none": a repeat never ends or repeats the series: every series has exactly set_size pages
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      expect(r.eff.error_correction_procedure).toBe("none");
      expectCompleteSeries(test(r));
    },
  },
  population_protocol: {
    requires: [],
    kind: "structure",
    fn: (r) => expect(r.eff.population_protocol).toBe("standard"),
  },
};

export const CHECKS: CheckSet<SelfOrderedPointingOptions, ResolvedOptions> = {
  ...sharedChecks,
  ...spanOnly,
};
