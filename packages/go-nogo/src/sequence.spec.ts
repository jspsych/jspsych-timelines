import * as fs from "fs";
import * as path from "path";

import { JsPsych, initJsPsych } from "jspsych";

import { GoNogoOptions, SequenceConstraints } from "./options";
import { fixedRng } from "./sequence";
import { createTimeline } from ".";

/** The trial types of the scored test trials, per block, from the built timeline (no simulation needed). */
function blocksOf(
  jsPsych: JsPsych,
  options: GoNogoOptions,
  phase: "test" | "practice" = "test"
): string[][] {
  const { timeline } = createTimeline(jsPsych, { instruction_format: "experimenter", ...options });
  const found: Record<number, string[]> = {};
  const walk = (n: any) => {
    if (Array.isArray(n)) n.forEach(walk);
    else if (n?.timeline) walk(n.timeline);
    else if (
      n?.data?.part === "response" &&
      n.data.phase === phase &&
      n.data.condition !== "go_control"
    ) {
      (found[n.data.block] ??= []).push(n.data.condition);
    }
  };
  walk(timeline);
  return Object.keys(found)
    .map(Number)
    .sort((a, b) => a - b)
    .map((b) => found[b]);
}

// -- independent checkers (not the sequencer's own) ----------------------------------------------

function runs(seq: string[]): Array<{ value: string; length: number }> {
  const out: Array<{ value: string; length: number }> = [];
  for (const x of seq) {
    if (out.length && out[out.length - 1].value === x) out[out.length - 1].length++;
    else out.push({ value: x, length: 1 });
  }
  return out;
}

const maxRunOf = (seq: string[], v: string) =>
  Math.max(
    0,
    ...runs(seq)
      .filter((r) => r.value === v)
      .map((r) => r.length)
  );

/** Smallest number of other trials between two trials of `v`. */
function smallestGap(seq: string[], v: string): number {
  const idx = seq.flatMap((x, i) => (x === v ? [i] : []));
  return idx.length < 2 ? Infinity : Math.min(...idx.slice(1).map((i, k) => i - idx[k] - 1));
}

function largestGap(seq: string[], v: string): number {
  const idx = seq.flatMap((x, i) => (x === v ? [i] : []));
  return idx.length < 2 ? 0 : Math.max(...idx.slice(1).map((i, k) => i - idx[k] - 1));
}

const S157: SequenceConstraints = { max_run: { nogo: 2 }, min_gap: { nogo: 3 } };

describe("sequence_constraints (typed form, through @jspsych/sequencer)", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("seq");
  });

  const base = (extra: GoNogoOptions): GoNogoOptions => ({ practice_trials: 0, ...extra });

  it("S157: at most 2 consecutive no-go and at least 3 go between them, exact counts, in every block", () => {
    const blocks = blocksOf(
      jsPsych,
      base({
        n_test_trials: 150,
        n_blocks: 3,
        condition_proportions: { go: 0.82, nogo: 0.18 },
        sequence_constraints: S157,
      })
    );
    expect(blocks).toHaveLength(3);
    blocks.forEach((seq) => {
      expect(seq).toHaveLength(50);
      expect(seq.filter((x) => x === "nogo")).toHaveLength(9);
      expect(maxRunOf(seq, "nogo")).toBeLessThanOrEqual(2);
      expect(smallestGap(seq, "nogo")).toBeGreaterThanOrEqual(3);
    });
  });

  it("neighbour rules hold across block boundaries", () => {
    for (const seed of ["a", "b", "c", "d", "e", "f"]) {
      const js = initJsPsych();
      js.randomization.setSeed(seed);
      const blocks = blocksOf(
        js,
        base({
          n_test_trials: 60,
          n_blocks: 6,
          condition_proportions: { go: 0.7, nogo: 0.3 },
          sequence_constraints: { min_gap: { nogo: 2 }, max_run: { go: 4 } },
        })
      );
      const all = blocks.flat();
      expect(smallestGap(all, "nogo")).toBeGreaterThanOrEqual(2);
      expect(maxRunOf(all, "go")).toBeLessThanOrEqual(4);
    }
  });

  it("S207: runs of 1, 3 or 5 go between no-go trials (run_length)", () => {
    const blocks = blocksOf(
      jsPsych,
      base({
        n_test_trials: 96,
        n_blocks: 1,
        condition_proportions: { go: 0.75, nogo: 0.25 },
        sequence_constraints: { run_length: { go: [1, 3, 5] } },
      })
    );
    const seq = blocks[0];
    expect(seq.filter((x) => x === "nogo")).toHaveLength(24);
    const goRuns = runs(seq).filter((r) => r.value === "go");
    // the last run of the sequence is exempt (it has no no-go after it)
    goRuns.slice(0, -1).forEach((r) => expect([1, 3, 5]).toContain(r.length));
  });

  it("run_length across several blocks: the runs that complete in the whole sequence are 1, 3 or 5", () => {
    const blocks = blocksOf(
      jsPsych,
      base({
        n_test_trials: 96,
        n_blocks: 3,
        condition_proportions: { go: 0.75, nogo: 0.25 },
        sequence_constraints: { run_length: { go: [1, 3, 5] } },
      })
    );
    const goRuns = runs(blocks.flat()).filter((r) => r.value === "go");
    goRuns.slice(0, -1).forEach((r) => expect([1, 3, 5]).toContain(r.length));
  });

  it("throws, naming the rule, when run_length cannot give the proportions (go .9 needs runs of 9)", () => {
    const t0 = Date.now();
    expect(() =>
      createTimeline(
        jsPsych,
        base({ n_test_trials: 100, sequence_constraints: { run_length: { go: [1, 3, 5] } } })
      )
    ).toThrow(/sequence_constraints cannot be satisfied.*run/i);
    expect(Date.now() - t0).toBeLessThan(8000);
  });

  it("throws when min_gap needs more go trials than the block has (practice default proportions)", () => {
    expect(() =>
      createTimeline(
        jsPsych,
        base({ practice_trials: 10, n_test_trials: 20, practice: { sequence_constraints: S157 } })
      )
    ).toThrow(/sequence_constraints cannot be satisfied/);
  });

  it("applies the rules to the test only unless practice sets its own", () => {
    const opts = base({
      practice_trials: 30,
      n_test_trials: 60,
      sequence_constraints: S157,
      condition_proportions: { go: 0.8, nogo: 0.2 },
    });
    const practice = blocksOf(jsPsych, opts, "practice")[0];
    const test = blocksOf(initJsPsych(), opts)[0];
    expect(smallestGap(test, "nogo")).toBeGreaterThanOrEqual(3);
    // the practice block is not constrained: with 6 no-go among 30 trials a shuffled list almost surely
    // has a smaller gap under at least one of several seeds
    const gaps = ["p1", "p2", "p3", "p4", "p5", "p6"].map((s) => {
      const js = initJsPsych();
      js.randomization.setSeed(s);
      return smallestGap(blocksOf(js, opts, "practice")[0], "nogo");
    });
    expect(Math.min(...gaps)).toBeLessThan(3);
    expect(practice).toHaveLength(30);
    const constrained = blocksOf(
      initJsPsych(),
      { ...opts, practice: { sequence_constraints: S157 } },
      "practice"
    )[0];
    expect(smallestGap(constrained, "nogo")).toBeGreaterThanOrEqual(3);
  });

  it("fixed_sequence with constraints gives the same order to every participant, and obeys the rules", () => {
    const opts = base({
      n_test_trials: 100,
      n_blocks: 2,
      trial_order: "fixed_sequence",
      condition_proportions: { go: 0.8, nogo: 0.2 },
      sequence_constraints: S157,
    });
    const seqs = ["x", "y", "z"].map((s) => {
      const js = initJsPsych();
      js.randomization.setSeed(s);
      return blocksOf(js, opts);
    });
    expect(seqs[1]).toEqual(seqs[0]);
    expect(seqs[2]).toEqual(seqs[0]);
    seqs[0].forEach((seq) => {
      expect(maxRunOf(seq, "nogo")).toBeLessThanOrEqual(2);
      expect(smallestGap(seq, "nogo")).toBeGreaterThanOrEqual(3);
    });
    expect(fixedRng()()).toBe(fixedRng()());
  });

  it("fixed_sequence without constraints spreads the no-go trials evenly, the same for everyone", () => {
    const opts = base({
      n_test_trials: 20,
      trial_order: "fixed_sequence",
      condition_proportions: { go: 0.8, nogo: 0.2 },
    });
    const a = blocksOf(jsPsych, opts)[0];
    const js = initJsPsych();
    js.randomization.setSeed("other");
    expect(blocksOf(js, opts)[0]).toEqual(a);
    expect(a.filter((x) => x === "nogo")).toHaveLength(4);
    expect(smallestGap(a, "nogo")).toBeGreaterThanOrEqual(3);
  });

  it("random order (independent draws) also takes constraints", () => {
    for (const seed of ["r1", "r2", "r3"]) {
      const js = initJsPsych();
      js.randomization.setSeed(seed);
      const seq = blocksOf(
        js,
        base({
          n_test_trials: 80,
          trial_order: "random",
          condition_proportions: { go: 0.8, nogo: 0.2 },
          sequence_constraints: { max_run: { nogo: 1 }, min_gap: { nogo: 2 } },
        })
      )[0];
      expect(seq).toHaveLength(80);
      expect(maxRunOf(seq, "nogo")).toBeLessThanOrEqual(1);
      expect(smallestGap(seq, "nogo")).toBeGreaterThanOrEqual(2);
    }
  });

  it("max_run as a single number limits every trial type", () => {
    const seq = blocksOf(
      jsPsych,
      base({
        n_test_trials: 60,
        condition_proportions: { go: 0.5, nogo: 0.5 },
        sequence_constraints: { max_run: 2 },
      })
    )[0];
    expect(maxRunOf(seq, "go")).toBeLessThanOrEqual(2);
    expect(maxRunOf(seq, "nogo")).toBeLessThanOrEqual(2);
  });

  it("max_gap: no-go trials are at most n trials apart", () => {
    const seq = blocksOf(
      jsPsych,
      base({
        n_test_trials: 60,
        condition_proportions: { go: 0.8, nogo: 0.2 },
        sequence_constraints: { max_gap: { nogo: 6 } },
      })
    )[0];
    expect(largestGap(seq, "nogo")).toBeLessThanOrEqual(6);
  });

  it("start_with: each block starts with n go trials", () => {
    const blocks = blocksOf(
      jsPsych,
      base({
        n_test_trials: 60,
        n_blocks: 3,
        condition_proportions: { go: 0.6, nogo: 0.4 },
        sequence_constraints: { start_with: { go: 5 } },
      })
    );
    blocks.forEach((seq) => expect(seq.slice(0, 5)).toEqual(Array(5).fill("go")));
  });

  it("no_immediate_repeat: true alternates the trial types; a list of fields constrains stimuli", () => {
    const alt = blocksOf(
      jsPsych,
      base({
        n_test_trials: 20,
        condition_proportions: { go: 0.5, nogo: 0.5 },
        sequence_constraints: { no_immediate_repeat: true },
      })
    )[0];
    expect(maxRunOf(alt, "go")).toBe(1);
    expect(maxRunOf(alt, "nogo")).toBe(1);

    const { timeline } = createTimeline(jsPsych, {
      instruction_format: "experimenter",
      practice_trials: 0,
      n_test_trials: 60,
      stimulus_role_assignment: "fixed",
      condition_proportions: { go: 0.5, nogo: 0.5 },
      stimulus_set: { go: [{ text: "A" }, { text: "B" }, { text: "C" }], nogo: { text: "X" } },
      sequence_constraints: { no_immediate_repeat: ["stimulus"], min_gap: { nogo: 1 } },
    });
    const stimuli: string[] = [];
    const walk = (n: any) => {
      if (Array.isArray(n)) n.forEach(walk);
      else if (n?.timeline) walk(n.timeline);
      else if (n?.data?.part === "response")
        stimuli.push(n.stimulus.includes("X") ? "X" : n.stimulus);
    };
    walk(timeline);
    // the stimulus id is in the data of the response trial
    const ids: string[] = [];
    const walk2 = (n: any) => {
      if (Array.isArray(n)) n.forEach(walk2);
      else if (n?.timeline) walk2(n.timeline);
      else if (n?.data?.part === "response") ids.push(n.data.stimulus);
    };
    walk2(timeline);
    expect(ids).toHaveLength(60);
    ids.slice(1).forEach((x, i) => expect(x).not.toBe(ids[i]));
  });

  it("balanced_transitions: each trial type follows each trial type about equally often", () => {
    const seq = blocksOf(
      jsPsych,
      base({
        n_test_trials: 80,
        condition_proportions: { go: 0.5, nogo: 0.5 },
        sequence_constraints: { balanced_transitions: true },
      })
    )[0];
    const counts: Record<string, number> = {};
    seq.slice(1).forEach((x, i) => {
      const k = `${seq[i]}>${x}`;
      counts[k] = (counts[k] ?? 0) + 1;
    });
    const v = Object.values(counts);
    expect(v).toHaveLength(4);
    expect(Math.max(...v) - Math.min(...v)).toBeLessThanOrEqual(Math.ceil(80 * 0.1));
  });

  it("cycle_length: every consecutive chunk of n trials holds the proportions exactly", () => {
    const blocks = blocksOf(
      jsPsych,
      base({
        n_test_trials: 80,
        n_blocks: 2,
        condition_proportions: { go: 0.75, nogo: 0.25 },
        sequence_constraints: { cycle_length: 8, min_gap: { nogo: 1 } },
      })
    );
    blocks.forEach((seq) => {
      expect(seq).toHaveLength(40);
      for (let i = 0; i < 40; i += 8) {
        expect(seq.slice(i, i + 8).filter((x) => x === "nogo")).toHaveLength(2);
      }
      expect(smallestGap(seq, "nogo")).toBeGreaterThanOrEqual(1);
    });
  });

  it("rejects unknown rules, unknown trial types, malformed values and impossible combinations", () => {
    const bad = (sc: any, re: RegExp, extra: GoNogoOptions = {}) =>
      expect(() =>
        createTimeline(jsPsych, base({ n_test_trials: 20, sequence_constraints: sc, ...extra }))
      ).toThrow(re);
    bad({ max_streak: 2 }, /unknown rule max_streak/);
    bad({ max_run: { stop: 2 } }, /unknown trial type "stop"/);
    bad({ min_gap: { nogo: -1 } }, /min_gap.nogo/);
    bad({ run_length: { go: [] } }, /run_length.go/);
    bad({ start_with: { go: 2, nogo: 1 } }, /start_with names one trial type/);
    bad({ no_immediate_repeat: ["colour"] }, /unknown trial field/);
    bad({ cycle_length: 1 }, /cycle_length/);
    bad({ cycle_length: 4 }, /independent draws/, { trial_order: "random" });
    bad({ min_gap: { nogo: 3 } }, /cannot be satisfied/, {
      condition_proportions: { go: 0.5, nogo: 0.5 },
    });
  });

  it("the package source has no Math.random call (every draw goes through jsPsych.randomization)", () => {
    const dir = __dirname;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && !f.endsWith(".spec.ts"));
    expect(files.length).toBeGreaterThan(5);
    files.forEach((f) => {
      const code = fs
        .readFileSync(path.join(dir, f), "utf8")
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "");
      expect(code).not.toMatch(/Math\.random\s*\(/);
    });
  });

  it("the same seed gives the same order, another seed another", () => {
    const opts = base({
      n_test_trials: 60,
      condition_proportions: { go: 0.6, nogo: 0.4 },
      sequence_constraints: { max_run: { nogo: 2 } },
    });
    const order = (seed: string) => {
      const js = initJsPsych();
      js.randomization.setSeed(seed);
      return blocksOf(js, opts)[0].join();
    };
    expect(order("s1")).toBe(order("s1"));
    expect(order("s1")).not.toBe(order("s2"));
  });
});
