/**
 * Operation span checks. The checks for options every package shares (counts, durations, feedback,
 * response keys and device) live in `@jspsych-timelines/testing`; the contract that points them at the
 * span's data (the processing and memorandum parts) is `./contract.ts`. This file has what is specific
 * to the span: set-size schedules and block order, the memoranda, the display format, the recall input,
 * the practice criterion, and additional assertions on the processing deadline and device.
 */
import {
  Check,
  CheckSet,
  distinct,
  durationCheck,
  extendCheck,
  sharedChecks,
} from "@jspsych-timelines/testing";

import type { OperationSpanOptions, ResolvedOptions } from "../src/options";
import { setSizeLists } from "../src/options";
import { scoreRecall } from "../src/scoring";
import { buildPool } from "../src/sets";
import { evalStimulus, rowsOf, trialsOf } from "./harness";
import type { Run } from "./harness";

type SpanCheck = Check<OperationSpanOptions, ResolvedOptions>;

const test = (r: Run) => rowsOf(r, "test", "response");
const sizes = (r: Run) => test(r).map((x) => x.set_size as number);
const blocks = (r: Run) => {
  const out = new Map<number, number[]>();
  for (const x of test(r)) out.set(x.block, [...(out.get(x.block) ?? []), x.set_size]);
  return [...out.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
};
const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
const nondecreasing = (xs: number[]) => xs.every((x, i) => i === 0 || x >= xs[i - 1]);

/** The test rows of the first span trial, in order (memoranda, problems, recall), without gaps. */
function firstTrial(r: Run) {
  return r.rows.filter(
    (x) =>
      x.phase === "test" &&
      x.block === 1 &&
      x.trial_index_in_block === 1 &&
      ["memorandum", "processing_problem", "processing", "response"].includes(x.part)
  );
}

const instructionHtml = (r: Run) =>
  rowsOf(r, "instructions", "instruction")
    .map((x) => x.stimulus as string)
    .join(" ");

const spanOnly: Record<string, SpanCheck> = {
  stimulus_language: {
    // the only implemented value is null: no verbal material of a language is used
    requires: [],
    kind: "structure",
    fn: (r) => expect(r.eff.stimulus_language).toBeNull(),
  },
  stimulus_set: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const set = r.eff.stimulus_set.memorandum;
      const items = buildPool(set);
      const pool = items.map((it) => it.text);
      const ids = items.map((it) => it.id);
      const name = set.name ?? "custom";
      const mem = rowsOf(r, "test", "memorandum");
      expect(mem.length).toBe(sizes(r).reduce((a, b) => a + b, 0));
      mem.forEach((x) => {
        expect(pool).toContain(x.memorandum);
        expect(ids).toContain(x.memorandum_id);
        expect(x.stimulus_set).toBe(name);
      });
      test(r).forEach((x) => {
        expect(x.stimulus_set).toBe(name);
        x.presented_item_ids.forEach((id: string) => expect(ids).toContain(id));
        x.presented_items.forEach((p: string) => expect(pool).toContain(p));
        // different memoranda within a trial
        expect(distinct(x.presented_items)).toHaveLength(x.set_size);
      });
      // the recall input offers the pool (n_afc)
      if (r.eff.response_format === "n_afc") {
        const html = evalStimulus(trialsOf(r, "response")[0]);
        pool.forEach((p: string) => expect(html).toContain(`data-item="${p}"`));
      }
    },
  },
  processing_display_format: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const two = r.eff.processing_display_format === "problem_then_answer_screens";
      const proc = rowsOf(r, "test", "processing");
      const problems = rowsOf(r, "test", "processing_problem");
      expect(proc.length).toBeGreaterThan(0);
      if (two) {
        // every episode has a problem screen; the answer screen is skipped after a missed deadline
        expect(problems).toHaveLength(proc.length);
        proc.filter((x) => !x.timeout).forEach((x) => expect(x.verify_rt).not.toBeUndefined());
        expect(evalStimulus(trialsOf(r, "processing_problem")[0])).toContain("= ?");
      } else {
        expect(problems).toHaveLength(0);
        expect(evalStimulus(trialsOf(r, "processing")[0])).toMatch(/= <strong>\d+<\/strong> \?/);
      }
    },
  },
  block_order: {
    requires: [],
    kind: "behaviour",
    fn: async (r, { harness: h }) => {
      const order = r.eff.block_order;
      const lists = setSizeLists(r.eff.set_sizes);
      const reps = r.eff.trials_per_condition;
      const bs = blocks(r);
      if (order === "random_within_block") {
        expect(bs).toHaveLength(reps);
        bs.forEach((b) => expect(sorted(b)).toEqual(sorted(lists[0])));
      } else {
        expect(bs).toHaveLength(lists.length);
      }
      if (order === "ascending") bs.forEach((b) => expect(nondecreasing(b)).toBe(true));
      if (order === "descending")
        bs.forEach((b) => expect(nondecreasing([...b].reverse())).toBe(true));
      const seeds = await h.runSeeds(r.opts, ["order-a", "order-b", "order-c"]);
      const seqs = [r, ...seeds].map((x) => JSON.stringify(blocks(x)));
      if (order === "fixed" || order === "ascending" || order === "descending") {
        expect(distinct(seqs)).toHaveLength(1); // the same for every participant
      } else if (lists.flat().length * reps >= 6) {
        expect(distinct(seqs).length).toBeGreaterThan(1); // random per participant
      }
      // the same set sizes in the same numbers under every order
      expect(sorted(bs.flat())).toEqual(
        sorted(lists.flatMap((l) => l.flatMap((s) => Array(reps).fill(s))))
      );
    },
  },
  set_sizes: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const lists = setSizeLists(r.eff.set_sizes);
      const reps = r.eff.trials_per_condition;
      expect(test(r)).toHaveLength(lists.flat().length * reps);
      if (r.eff.block_order === "random_within_block" || lists.length === 1) {
        lists[0].forEach((s) => expect(sizes(r).filter((x) => x === s)).toHaveLength(reps));
        sizes(r).forEach((s) => expect(lists[0]).toContain(s));
      } else {
        // per-block lists: block i holds only its own sizes, each `reps` times
        blocks(r).forEach((b, i) => {
          expect(sorted(b)).toEqual(sorted(lists[i].flatMap((s) => Array(reps).fill(s))));
        });
      }
      // each trial presents exactly set_size memoranda
      test(r).forEach((x) => expect(x.presented_items).toHaveLength(x.set_size));
    },
  },
  trials_per_condition: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const reps = r.eff.trials_per_condition;
      for (const s of distinct(sizes(r)))
        expect(sizes(r).filter((x) => x === s)).toHaveLength(reps);
      expect(test(r)).toHaveLength(r.eff.n_test_trials);
    },
  },
  memorandum_order_in_pair: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const t = firstTrial(r);
      const first = t[0].part;
      const lastBeforeRecall = t[t.length - 2].part;
      if (r.eff.memorandum_order_in_pair === "processing_first") {
        expect(["processing_problem", "processing"]).toContain(first);
        expect(lastBeforeRecall).toBe("memorandum");
      } else {
        expect(first).toBe("memorandum");
        expect(["processing_problem", "processing"]).toContain(lastBeforeRecall);
      }
    },
  },
  processing_items_per_memorandum: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const k = r.eff.processing_items_per_memorandum;
      for (const x of test(r)) {
        const proc = rowsOf(r, "test", "processing").filter(
          (p) => p.block === x.block && p.trial_index_in_block === x.trial_index_in_block
        );
        expect(proc).toHaveLength(x.set_size * k);
        expect(x.processing_n).toBe(x.set_size * k);
      }
    },
  },
  task_variant: {
    requires: [],
    kind: "structure",
    fn: (r) => expect(r.eff.task_variant).toBe("operation_span"),
  },
  response_format: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const f = r.eff.response_format;
      const trial = trialsOf(r, "response")[0];
      const html = evalStimulus(trial);
      test(r).forEach((x) => expect(x.response_format).toBe(f));
      expect(html.includes("-grid")).toBe(f === "n_afc");
      expect(html.includes("-box")).toBe(f === "free_text");
      expect(html.includes("-slot")).toBe(f !== "free_text");
      // the recall input has one place per memorandum
      const places = f === "free_text" ? /<input[^>]*-box/g : /class="[^"]*-slot"/g;
      expect(html.match(places)).toHaveLength(trial.data.set_size);
    },
  },
  response_order: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const o = r.eff.response_order as "serial" | "free";
      test(r).forEach((x) => expect(x.response_order).toBe(o));
      // the order rule is the scoring rule: a reversed recall is right only with free order
      const p = ["F", "H", "J"];
      expect(scoreRecall(p, [...p].reverse(), o).perfect).toBe(o === "free");
      expect(scoreRecall(p, p, o).perfect).toBe(true);
      expect(evalStimulus(trialsOf(r, "response")[0]).includes("in the order shown")).toBe(
        o === "serial"
      );
    },
  },
  recall_omission_handling: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const v = r.eff.recall_omission_handling;
      const html = evalStimulus(trialsOf(r, "response")[0]);
      expect(html.includes('data-action="blank"')).toBe(
        v === "blank_button" || v === "skip_button"
      );
      if (v === "blank_button") expect(html).toContain(">Blank<");
      if (v === "skip_button") expect(html).toContain(">Skip<");
      // the instruction page that explains recall names the way to leave a place empty
      const page = instructionHtml(r);
      if (v === "question_mark_key") expect(page).toContain("<kbd>?</kbd>");
      if (v === "none") expect(page).toContain("Fill every place");
    },
  },
  practice_criterion: {
    requires: [],
    kind: "behaviour",
    fn: async (r, { harness: h }) => {
      const c = r.eff.practice_criterion!;
      const only = (x: Run) =>
        rowsOf(x, "practice", "processing").filter((p) => p.practice_part === "processing_only");
      // a criterion no random responder meets: practice repeats up to max_repeats (default 1) times
      const hard = await h.run({
        ...r.opts,
        practice_criterion: { ...c, accuracy: 1, on_fail: "repeat" },
      });
      expect(distinct(only(hard).map((x) => x.practice_attempt))).toEqual([1, 2]);
      expect(only(hard)).toHaveLength(2 * r.eff.practice_trials);
      // on_fail "continue" never repeats, and the test still runs
      const cont = await h.run({
        ...r.opts,
        practice_criterion: { ...c, accuracy: 1, on_fail: "continue" },
      });
      expect(only(cont)).toHaveLength(r.eff.practice_trials);
      expect(test(cont)).toHaveLength(r.eff.n_test_trials);
    },
  },
  practice_structure: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const s = r.eff.practice_structure;
      const parts = distinct(rowsOf(r, "practice", "response").map((x) => x.practice_part));
      const proc = rowsOf(r, "practice", "processing").map((x) => x.practice_part);
      const withStorage = s === "storage_processing_combined" || s === "storage_processing";
      expect(parts.includes("storage")).toBe(withStorage);
      expect(parts.includes("combined")).toBe(
        s === "storage_processing_combined" || s === "combined_only"
      );
      expect(proc.includes("processing_only")).toBe(withStorage);
    },
  },
  end_of_task_feedback: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const v = r.eff.end_of_task_feedback;
      const html = evalStimulus(trialsOf(r, "completion")[0]);
      expect(html.includes("Your score")).toBe(v === "score" || v === "summary");
      expect(html.includes("absolute score")).toBe(v === "summary");
    },
  },
  instruction_format: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const n = rowsOf(r, "instructions", "instruction").length;
      if (r.eff.instruction_format === "experimenter") expect(n).toBe(0);
      else expect(n).toBeGreaterThan(0);
    },
  },
  speed_accuracy_emphasis: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const html = instructionHtml(r);
      const v = r.eff.speed_accuracy_emphasis;
      expect(html.includes("85%")).toBe(v === "accuracy");
      expect(html.includes("quickly and accurately on both")).toBe(v === "both");
      expect(html.includes("as quickly as you can.")).toBe(v === "speed");
    },
  },
  processing_read_aloud: {
    requires: [],
    kind: "structure",
    fn: (r) => expect(instructionHtml(r).includes("out loud")).toBe(r.eff.processing_read_aloud),
  },
};

/** Additional assertions on shared options. */
const extended: CheckSet<OperationSpanOptions, ResolvedOptions> = {
  response_window_ms: extendCheck(sharedChecks.response_window_ms, {
    fn: (r) => {
      const proc = rowsOf(r, "test", "processing");
      const v = r.eff.response_window_ms;
      const rules = distinct(proc.map((x) => x.response_window_rule));
      // every processing row records the deadline in force and the rule that gave it
      expect(rules).toHaveLength(1);
      if (typeof v === "function") {
        // a helper's label, then how it applied (the number of practice RTs, or the fallback)
        expect(rules[0].startsWith(v.label ?? "custom function")).toBe(true);
        return;
      }
      expect(rules[0]).toBe(v === null ? "none" : typeof v === "number" ? "fixed" : "jitter");
      // the processing-only practice is self-paced (it calibrates the deadline)
      rowsOf(r, "practice", "processing")
        .filter((x) => x.practice_part === "processing_only")
        .forEach((x) => {
          expect(x.response_window).toBeNull();
          expect(x.response_window_rule).toBe("self-paced");
        });
    },
  }),
  response_device: extendCheck(sharedChecks.response_device, {
    fn: (r) => {
      // recall is the button plugin with the Done button, whatever the input
      const recall = r.eff.response_device.recall;
      test(r).forEach((x) => {
        expect(x.response_device).toBe(recall);
        expect(x.trial_type).toBe("html-button-response");
      });
    },
  }),
};

export const CHECKS: CheckSet<OperationSpanOptions, ResolvedOptions> = {
  ...sharedChecks,
  // gaps between events inside a trial: rows of part `inter_item`, none when the interval is 0
  inter_item_interval_ms: durationCheck({
    option: "inter_item_interval_ms",
    part: "inter_item",
    count: "some",
  }),
  ...extended,
  ...spanOnly,
};
