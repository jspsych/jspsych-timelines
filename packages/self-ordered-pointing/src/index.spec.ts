import { clickTarget, flushPromises, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { DEFAULT_OPTIONS, SelfOrderedPointingOptions, resolveOptions } from "./options";
import { calculateScores } from "./scoring";
import { stimuli } from "./sets";
import { recognitionProbability } from "./simulate";
import { assignItems, buildPool, gridDims, nextArrangement } from "./stimuli";
import { newSeriesState, planPage } from "./trials";
import { createTimeline, timelineUnits, utils } from ".";

async function run(
  jsPsych: JsPsych,
  options: SelfOrderedPointingOptions,
  simulation: Record<string, any> = { default: { data: { rt: 400 } } }
) {
  const { timeline } = createTimeline(jsPsych, options);
  const { getData, expectFinished } = await simulateTimeline(
    timeline,
    "data-only",
    simulation,
    jsPsych
  );
  await expectFinished();
  return getData().values() as any[];
}

const of = (rows: any[], phase: string, part: string, extra: Record<string, unknown> = {}) =>
  rows.filter(
    (r) =>
      r.phase === phase && r.part === part && Object.entries(extra).every(([k, v]) => r[k] === v)
  );

/** Group the rows by series. */
const seriesRows = (rows: any[]) => {
  const m = new Map<number, any[]>();
  for (const r of rows) m.set(r.series, [...(m.get(r.series) ?? []), r]);
  return [...m.values()];
};

/** Recompute, from the picks alone, what a correct row is: the history of the series is all that matters. */
function expectConsistentSeries(s: any[]) {
  const seen = new Set<string>();
  s.forEach((r, i) => {
    expect(r.choice_index).toBe(i + 1);
    if (r.timeout) {
      expect(r.response).toBeNull();
      expect(r.chosen_item_id).toBeNull();
      return;
    }
    // the item is what sat in the clicked slot
    expect(r.item_arrangement[r.chosen_position - 1]).toBe(r.chosen_item_id);
    expect(r.response).toBe(r.chosen_item_id);
    const repeat = seen.has(r.chosen_item_id);
    expect(r.is_repeat_error).toBe(repeat);
    expect(r.correct).toBe(!repeat);
    expect(r.n_picked_before).toBe(seen.size);
    seen.add(r.chosen_item_id);
  });
}

describe("createTimeline", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("sopt");
  });

  it("with the defaults runs the anchor's design: 6, 8, 10, 12 items, three series each, ascending, no practice", async () => {
    const rows = await run(jsPsych, { instruction_demonstration: "none" });
    expect(of(rows, "practice", "response")).toHaveLength(0);
    const test = of(rows, "test", "response");
    expect(test).toHaveLength(3 * (6 + 8 + 10 + 12));
    const series = seriesRows(test);
    expect(series).toHaveLength(12);
    // ascending: one block per set size, three series each
    expect(series.map((s) => s[0].set_size)).toEqual([6, 6, 6, 8, 8, 8, 10, 10, 10, 12, 12, 12]);
    expect(series.map((s) => s[0].block)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
    expect(series.map((s) => s[0].trial_index_in_block)).toEqual([
      1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3,
    ]);
    expect(series.map((s) => s[0].set_size_trial)).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]);
    // one page per item, one blank before each page, no feedback
    series.forEach((s) => {
      expect(s).toHaveLength(s[0].set_size);
      expectConsistentSeries(s);
    });
    expect(of(rows, "test", "iti")).toHaveLength(test.length);
    expect(of(rows, "test", "iti").every((r) => r.duration_ms === 250 && r.iti === 250)).toBe(true);
    expect(of(rows, "test", "feedback")).toHaveLength(0);
    expect(of(rows, "test", "transition")).toHaveLength(12);
    expect(rows.filter((r) => r.part === "completion")).toHaveLength(1);
  });

  it("tags every row with task and version, and writes no column that jsPsych owns", async () => {
    const rows = await run(jsPsych, {
      set_sizes: [3],
      trials_per_condition: 1,
      practice_trials: 1,
    });
    rows.forEach((r) => {
      expect(r.task).toBe("self-ordered-pointing");
      expect(r.task_version).toBe(utils.constants.VERSION);
    });
    // the trial objects' own data never name jsPsych's columns
    const flat: any[] = [];
    const walk = (n: any) => {
      if (Array.isArray(n)) n.forEach(walk);
      else if (n?.timeline) walk(n.timeline);
      else if (n?.type) flat.push(n);
    };
    walk(createTimeline(initJsPsych(), { set_sizes: [3], practice_trials: 1 }).timeline);
    for (const t of flat)
      for (const k of ["trial_type", "trial_index", "time_elapsed", "plugin_version"])
        expect(Object.keys(t.data ?? {})).not.toContain(k);
    const t = of(rows, "test", "response")[0];
    expect(t).toMatchObject({
      phase: "test",
      part: "response",
      block: 1,
      trial_index_in_block: 1,
      series: 1,
      set_size: 3,
      choice_index: 1,
      stimulus_layout: "fixed_grid_slots",
      response_device: "mouse",
      is_repeat_error: false,
      correct: true,
      previous_item_id: null,
      same_position_run: 1,
      position_rule_violation: false,
      timeout: false,
    });
    expect(t.chosen_row).toBe(1);
    expect(t.item_arrangement).toHaveLength(3);
  });

  it("respects a non-default configuration: words, partial reshuffle, descending, jittered blank, feedback, free positions", async () => {
    const rows = await run(jsPsych, {
      instruction_demonstration: "none",
      set_sizes: [3, 5],
      trials_per_condition: 2,
      block_order: "descending",
      stimulus_set: { items: stimuli.words, pool: "distinct_per_set_size" },
      rearrangement_rule: "partial_reshuffle_each_page",
      iti_ms: { min: 100, max: 300, step: 50 },
      stimulus_layout: "free_positions_in_area",
      trial_feedback: "accuracy",
      feedback_duration_ms: 400,
      response_device: "touch",
      practice_trials: 1,
    });
    const test = of(rows, "test", "response");
    expect(seriesRows(test).map((s) => s[0].set_size)).toEqual([5, 5, 3, 3]);
    test.forEach((r) => {
      expect(r.item_arrangement.every((id: string) => /^[a-z]+$/.test(id))).toBe(true);
      expect(r.item_offsets).toHaveLength(r.set_size);
      expect(r.response_device).toBe("touch");
    });
    const iti = of(rows, "test", "iti").map((r) => r.duration_ms);
    iti.forEach((d) => expect([100, 150, 200, 250, 300]).toContain(d));
    expect(new Set(iti).size).toBeGreaterThan(1);
    expect(of(rows, "test", "feedback").length).toBeGreaterThan(0);
    of(rows, "test", "feedback").forEach((r) => {
      expect(r.feedback_kind).toBe("accuracy");
      expect(r.feedback_duration).toBe(400);
    });
    // distinct pools: the items of 3 and 5 do not overlap
    const ids = (n: number) =>
      new Set(test.filter((r) => r.set_size === n).flatMap((r) => r.item_arrangement));
    ids(3).forEach((id) => expect(ids(5).has(id)).toBe(false));
  });

  it("random_within_block gives trials_per_condition blocks of one series of each size; random is one block", async () => {
    const a = of(
      await run(jsPsych, {
        instruction_demonstration: "none",
        set_sizes: [2, 3, 4],
        trials_per_condition: 3,
        block_order: "random_within_block",
      }),
      "test",
      "response"
    );
    const blocks = new Map<number, number[]>();
    for (const s of seriesRows(a))
      blocks.set(s[0].block, [...(blocks.get(s[0].block) ?? []), s[0].set_size]);
    expect([...blocks.keys()]).toEqual([1, 2, 3]);
    for (const b of blocks.values()) expect([...b].sort()).toEqual([2, 3, 4]);
    jsPsych = initJsPsych();
    const b = of(
      await run(jsPsych, {
        instruction_demonstration: "none",
        set_sizes: [2, 3, 4],
        trials_per_condition: 3,
        block_order: "random",
      }),
      "test",
      "response"
    );
    expect(new Set(b.map((r) => r.block))).toEqual(new Set([1]));
    expect(seriesRows(b)).toHaveLength(9);
  });

  it("practice uses practice.set_sizes, never the test's, and its feedback defaults to accuracy", async () => {
    const rows = await run(jsPsych, {
      instruction_demonstration: "none",
      set_sizes: [4],
      trials_per_condition: 1,
      practice_trials: 3,
    });
    const p = of(rows, "practice", "response");
    expect(seriesRows(p).map((s) => s[0].set_size)).toEqual([3, 3, 3]);
    expect(of(rows, "practice", "feedback").length).toBeGreaterThan(0);
    expect(of(rows, "test", "feedback")).toHaveLength(0);
    // practice rows are not in the test's scores
    expect(calculateScores(jsPsych.data.get()).n_series).toBe(1);
    // precedence: the user's top-level value wins over the package practice default, the user's practice value over both
    expect(resolveOptions({ trial_feedback: "none" }, "practice").trial_feedback).toBe("none");
    expect(
      resolveOptions(
        { trial_feedback: "none", practice: { trial_feedback: "accuracy" } },
        "practice"
      ).trial_feedback
    ).toBe("accuracy");
    expect(resolveOptions({ set_sizes: [9] }, "practice").set_sizes).toEqual([3]);
    expect(resolveOptions({ practice: { set_sizes: [5] } }, "practice").set_sizes).toEqual([5]);
    expect(resolveOptions({ block_order: "random" }, "practice").block_order).toBe("ascending");
  });

  it("a response window records timeouts as no pick, and the item stays unpicked", async () => {
    const rows = await run(
      jsPsych,
      {
        instruction_demonstration: "none",
        set_sizes: [3],
        trials_per_condition: 2,
        response_window_ms: 1500,
      },
      { default: { data: { rt: 50000 } } }
    );
    const test = of(rows, "test", "response");
    expect(test).toHaveLength(6);
    test.forEach((r) => {
      expect(r).toMatchObject({
        timeout: true,
        response: null,
        rt: null,
        chosen_item_id: null,
        chosen_position: null,
        is_repeat_error: false,
        correct: false,
        response_window: 1500,
      });
    });
    const s = calculateScores(jsPsych.data.get());
    expect(s).toMatchObject({
      n_pages: 6,
      n_picks: 0,
      n_timeouts: 6,
      total_errors: 0,
      mean_accuracy: null,
      mean_rt: null,
    });
  });

  it("throws on unimplemented or contradictory values, naming the option", () => {
    const bad = (o: SelfOrderedPointingOptions, re: RegExp) =>
      expect(() => createTimeline(initJsPsych(), o)).toThrow(re);
    bad(
      { stimulus_set: { items: "words" as any } },
      /stimulus_set\.items: "words" is not a stimulus set/
    );
    bad(
      { stimulus_set: { items: [{ text: "a", image: "b.png" } as any, "c"] } },
      /item 1 must be a string or give exactly one of text, image or svg/
    );
    bad({ stimulus_set: { items: ["a", "a", "b"] }, set_sizes: [3] }, /two items have the id "a"/);
    bad({ population_protocol: "child" }, /population_protocol.*child/);
    bad({ adaptive: { procedure: "irt_cat" } as any }, /adaptive/);
    bad({ response_device: "keyboard" }, /response_device.*keyboard/);
    bad({ error_correction_procedure: "retry" }, /error_correction_procedure.*retry/);
    bad({ block_order: "counterbalanced" }, /block_order.*counterbalanced/);
    bad({ trial_feedback: "accuracy_rt" }, /trial_feedback.*accuracy_rt/);
    bad({ set_sizes: [13] }, /set_sizes/);
    bad({ set_sizes: [6, 6] }, /set_sizes/);
    bad({ response_window_ms: 0 }, /response_window_ms/);
    bad({ iti_ms: null as any }, /iti_ms/);
    bad({ trials_per_condition: 0 }, /trials_per_condition/);
    bad({ reshuffle_proportion: 0 }, /reshuffle_proportion/);
    bad(
      { position_repeat_rule: "enforced", stimulus_layout: "free_positions_in_area" },
      /position_repeat_rule.*stimulus_layout/
    );
    bad({ stimulus_set: { items: ["a", "b", "c"] }, set_sizes: [6] }, /needs 6 different items/);
    bad(
      { stimulus_set: { pool: "distinct_per_set_size" }, set_sizes: [6, 8, 10, 12, 4, 5, 7] },
      /needs \d+ different items/
    );
    bad({ instruction_demonstration: "animated" }, /instruction_demonstration.*animated/);
  });

  it("end_of_task_feedback: score reports errors by set size on the last page", async () => {
    const rows = await run(jsPsych, {
      instruction_demonstration: "none",
      set_sizes: [3, 4],
      trials_per_condition: 1,
      end_of_task_feedback: "score",
    });
    const done = rows.find((r) => r.part === "completion");
    expect(done).toBeDefined();
    const ctx = timelineUnits.createContext(initJsPsych(), { end_of_task_feedback: "score" });
    const html = (timelineUnits.createCompletion(ctx) as any).stimulus();
    expect(html).toContain("Repeat errors");
  });
});

describe("the pick is a position, and the history decides correctness", () => {
  it("simulated and real clicks go through the same response code", async () => {
    // real clicks: always the first slot, on a three-item set
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("real");
    const { timeline } = createTimeline(jsPsych, {
      instruction_demonstration: "none",
      set_sizes: [4],
      trials_per_condition: 1,
      iti_ms: 0,
    });
    const { displayElement, getData } = await startTimeline(timeline, jsPsych);
    const press = async () => {
      const btns = Array.from(
        displayElement.querySelectorAll<HTMLElement>(".jspsych-btn:not([disabled])")
      );
      if (btns.length) await clickTarget(btns[0]);
    };
    // instruction pages, test intro, series intro, four picks, completion
    for (let i = 0; i < 12; i++) await press();
    const real = of(getData().values() as any[], "test", "response");
    expect(real).toHaveLength(4);
    expectConsistentSeries(real);
    // each click was on slot 1, so the item is whatever sat there
    real.forEach((r) => expect(r.chosen_position).toBe(1));
    // slot 1 changes item between pages, so some pages repeat and some do not; the rows still agree with the history
    const sim = of(
      await run(initJsPsych(), {
        instruction_demonstration: "none",
        set_sizes: [4],
        trials_per_condition: 1,
      }),
      "test",
      "response"
    );
    expectConsistentSeries(sim);
    // the same fields on both
    expect(Object.keys(sim[0]).sort()).toEqual(Object.keys(real[0]).sort());
  });

  it("repeat errors rise with set size for the simulated participant", async () => {
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("memory");
    const rows = await run(jsPsych, {
      instruction_demonstration: "none",
      set_sizes: [4, 8, 12],
      trials_per_condition: 20,
      iti_ms: 0,
    });
    const s = calculateScores(jsPsych.data.get());
    const by = Object.fromEntries(
      s.errors_by_set_size.map((x) => [x.set_size, x.mean_errors_per_series])
    );
    expect(by[4]).toBeLessThan(by[8]);
    expect(by[8]).toBeLessThan(by[12]);
    expect(by[12]).toBeGreaterThan(1);
    // late pages hold more picked items, so they repeat more often than early ones
    const rate = s.error_rate_by_choice_order;
    expect(rate[rate.length - 1].error_rate!).toBeGreaterThan(rate[0].error_rate!);
    expect(rate[0].error_rate).toBe(0); // the first page cannot repeat
    expect(recognitionProbability(12)).toBeLessThan(recognitionProbability(4));
    seriesRows(of(rows, "test", "response")).forEach(expectConsistentSeries);
  });

  it("is seeded: the same seed gives the same picks", async () => {
    const go = async () => {
      const j = initJsPsych();
      j.randomization.setSeed("again");
      return of(
        await run(j, {
          instruction_demonstration: "none",
          set_sizes: [6],
          trials_per_condition: 2,
        }),
        "test",
        "response"
      ).map((r) => [r.chosen_position, r.item_arrangement.join()]);
    };
    expect(await go()).toEqual(await go());
  });
});

describe("position-repeat rules", () => {
  const clickFirst = async (options: SelfOrderedPointingOptions) => {
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("rule");
    const { timeline } = createTimeline(jsPsych, {
      instruction_demonstration: "none",
      iti_ms: 0,
      trials_per_condition: 1,
      ...options,
    });
    const { displayElement, getData } = await startTimeline(timeline, jsPsych);
    for (let i = 0; i < 80; i++) {
      const btns = Array.from(
        displayElement.querySelectorAll<HTMLElement>(".jspsych-btn:not([disabled])")
      );
      if (!btns.length) break;
      await clickTarget(btns[0]);
      await flushPromises();
    }
    return { rows: getData().values() as any[], displayElement };
  };

  it("enforced: the position of the last two picks is switched off on the next page", async () => {
    const { rows } = await clickFirst({
      set_sizes: [8],
      position_repeat_rule: "enforced",
      position_repeat_max: 2,
    });
    const test = of(rows, "test", "response");
    expect(test).toHaveLength(8);
    test.forEach((r) => {
      expect(r.same_position_run).toBeLessThanOrEqual(2);
      expect(r.position_rule_violation).toBe(false);
    });
    // clicking the first enabled slot every time: slot 1, 1, then 2 (1 is off), 1, 1, 2, ...
    expect(test.slice(0, 4).map((r) => r.chosen_position)).toEqual([1, 1, 2, 1]);
    expect(test[2].disabled_position).toBe(1);
    expect(test[0].disabled_position).toBeNull();
  });

  it("enforced: the page can always be completed (the only item left is moved out of the switched-off slot)", () => {
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("swap");
    const o = resolveOptions({ position_repeat_rule: "enforced", position_repeat_max: 2 }, "test");
    for (let i = 0; i < 40; i++) {
      const items = buildPool(stimuli.abstractDesigns).slice(0, 3);
      const state = newSeriesState();
      state.picked = new Set([0, 1]);
      state.slots = [0, 0];
      const plan = planPage(jsPsych, o, items, state);
      expect(plan.disabled_slot).toBe(0);
      expect(plan.arrangement[0]).not.toBe(2); // item 2 is the only one left
    }
  });

  it("detect_and_remind: the pick that breaks the limit is allowed and followed by a reminder", async () => {
    const { rows } = await clickFirst({
      set_sizes: [6],
      position_repeat_rule: "detect_and_remind",
    });
    const test = of(rows, "test", "response");
    const violations = test.filter((r) => r.position_rule_violation);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].same_position_run).toBe(3);
    violations.forEach((r) => expect(r.same_position_run).toBeGreaterThan(2));
    expect(of(rows, "test", "reminder")).toHaveLength(violations.length);
  });

  it("instructed: only the instructions change (a page naming the limit); nothing is enforced or reminded", async () => {
    const { rows } = await clickFirst({ set_sizes: [6], position_repeat_rule: "instructed" });
    const test = of(rows, "test", "response");
    expect(of(rows, "test", "reminder")).toHaveLength(0);
    test.forEach((r) => expect(r.disabled_position).toBeNull());
    expect(test.some((r) => r.position_rule_violation)).toBe(true);
    const pages = timelineUnits
      .createInstructions(
        timelineUnits.createContext(initJsPsych(), {
          position_repeat_rule: "instructed",
          position_repeat_max: 3,
        })
      )
      .timeline.map((p: any) => p.stimulus as string);
    expect(pages.some((p: string) => /more than 3 times in a row/.test(p))).toBe(true);
    const none = timelineUnits.createInstructions(
      timelineUnits.createContext(initJsPsych(), {})
    ).timeline;
    expect(none.map((p: any) => p.stimulus).join(" ")).not.toMatch(/same position/);
  });
});

describe("arrangements", () => {
  const jsPsych = initJsPsych();
  jsPsych.randomization.setSeed("arr");

  it("a full reshuffle is never the arrangement before, even for two items", () => {
    let prev = nextArrangement(jsPsych, 2, "full_reshuffle_each_page", 0.5, null);
    for (let i = 0; i < 60; i++) {
      const next = nextArrangement(jsPsych, 2, "full_reshuffle_each_page", 0.5, prev);
      expect(next).not.toEqual(prev);
      prev = next;
    }
  });

  it("a partial reshuffle moves exactly the configured share of the items, at least two", () => {
    for (const [n, p, k] of [
      [6, 0.5, 3],
      [10, 0.5, 5],
      [12, 0.25, 3],
      [6, 0.1, 2],
      [4, 1, 4],
    ] as const) {
      let prev = nextArrangement(jsPsych, n, "partial_reshuffle_each_page", p, null);
      for (let i = 0; i < 20; i++) {
        const next = nextArrangement(jsPsych, n, "partial_reshuffle_each_page", p, prev);
        expect(next.filter((x, j) => x !== prev[j])).toHaveLength(k);
        expect([...next].sort()).toEqual([...prev].sort());
        prev = next;
      }
    }
  });

  it("grids: 6 is 2 x 3, 10 is 2 x 5, 12 is 3 x 4", () => {
    expect(gridDims(6)).toEqual({ rows: 2, cols: 3 });
    expect(gridDims(10)).toEqual({ rows: 2, cols: 5 });
    expect(gridDims(12)).toEqual({ rows: 3, cols: 4 });
    for (let n = 2; n <= 12; n++) {
      const g = gridDims(n);
      expect(g.rows * g.cols).toBeGreaterThanOrEqual(n);
    }
  });

  it("pools: nested sets are the first N; distinct sets do not overlap", () => {
    const pool = buildPool(stimuli.abstractDesigns);
    expect(pool).toHaveLength(48);
    expect(new Set(pool.map((i) => i.id)).size).toBe(48);
    const nested = assignItems(pool, "nested_first_n", 3, [3], [6, 12]);
    expect(nested.test.get(6)!.map((i) => i.id)).toEqual(
      nested.test
        .get(12)!
        .slice(0, 6)
        .map((i) => i.id)
    );
    const distinct = assignItems(pool, "distinct_per_set_size", 3, [3], [6, 12]);
    const all = [
      ...distinct.walkthrough,
      ...distinct.practice.get(3)!,
      ...distinct.test.get(6)!,
      ...distinct.test.get(12)!,
    ];
    expect(new Set(all.map((i) => i.id)).size).toBe(3 + 3 + 6 + 12);
  });
});

describe("utils.scoring.calculateScores", () => {
  const row = (extra: Record<string, unknown>) => ({
    task: "self-ordered-pointing",
    phase: "test",
    part: "response",
    timeout: false,
    rt: 1000,
    ...extra,
  });
  // series 1 (set of 3): new, repeat of the item picked just before, new. series 2 (set of 4): all new, one timeout.
  const rows = [
    row({
      series: 1,
      set_size: 3,
      choice_index: 1,
      chosen_item_id: "a",
      previous_item_id: null,
      is_repeat_error: false,
      correct: true,
    }),
    row({
      series: 1,
      set_size: 3,
      choice_index: 2,
      chosen_item_id: "a",
      previous_item_id: "a",
      is_repeat_error: true,
      correct: false,
    }),
    row({
      series: 1,
      set_size: 3,
      choice_index: 3,
      chosen_item_id: "b",
      previous_item_id: "a",
      is_repeat_error: false,
      correct: true,
    }),
    row({
      series: 2,
      set_size: 4,
      choice_index: 1,
      chosen_item_id: "a",
      previous_item_id: null,
      is_repeat_error: false,
      correct: true,
    }),
    row({
      series: 2,
      set_size: 4,
      choice_index: 2,
      chosen_item_id: "b",
      previous_item_id: "a",
      is_repeat_error: false,
      correct: true,
      rt: 3000,
    }),
    row({
      series: 2,
      set_size: 4,
      choice_index: 3,
      chosen_item_id: null,
      previous_item_id: "b",
      is_repeat_error: false,
      correct: false,
      timeout: true,
      rt: null,
    }),
    row({
      series: 2,
      set_size: 4,
      choice_index: 4,
      chosen_item_id: "c",
      previous_item_id: null,
      is_repeat_error: false,
      correct: true,
      position_rule_violation: true,
    }),
    // series 3 (set of 2): both new, nothing else
    row({
      series: 3,
      set_size: 2,
      choice_index: 1,
      chosen_item_id: "a",
      previous_item_id: null,
      is_repeat_error: false,
      correct: true,
    }),
    row({
      series: 3,
      set_size: 2,
      choice_index: 2,
      chosen_item_id: "b",
      previous_item_id: "a",
      is_repeat_error: false,
      correct: true,
    }),
    // never scored: practice, walkthrough, another task, a feedback row
    {
      ...row({ series: 9, set_size: 5, choice_index: 1, is_repeat_error: true }),
      phase: "practice",
    },
    {
      ...row({ is_repeat_error: true, correct: false }),
      phase: "instructions",
      part: "instruction_check",
    },
    { ...row({ series: 9, set_size: 5, choice_index: 1, is_repeat_error: true }), task: "other" },
    { ...row({ series: 1, set_size: 3 }), part: "feedback" },
  ];
  const s = calculateScores(new DataCollection(rows));

  it("counts errors, in total and by set size", () => {
    expect(s).toMatchObject({
      n_series: 3,
      n_pages: 9,
      n_picks: 8,
      n_timeouts: 1,
      total_errors: 1,
    });
    expect(s.mean_errors_per_series).toBeCloseTo(1 / 3);
    expect(s.errors_by_set_size).toEqual([
      { set_size: 2, n_series: 1, errors: 0, mean_errors_per_series: 0 },
      { set_size: 3, n_series: 1, errors: 1, mean_errors_per_series: 1 },
      { set_size: 4, n_series: 1, errors: 0, mean_errors_per_series: 0 },
    ]);
  });

  it("scores accuracy, span before the first error, the largest clean set and perseveration", () => {
    expect(s.mean_accuracy).toBeCloseTo(7 / 8);
    // series 1: one correct pick before the first repeat; series 2: its three correct picks (the timeout is no repeat
    // but is no correct pick); series 3: both
    expect(s.span_before_first_error).toBeCloseTo((1 + 3 + 2) / 3);
    // series 2 has a timeout, so it was not completed: the largest completed set size is the clean series of 2
    expect(s.max_set_size_completed).toBe(2);
    expect(s.perseverative_errors).toBe(1);
    expect(s.mean_rt).toBeCloseTo((1000 * 7 + 3000) / 8);
    expect(s.n_position_repeat_violations).toBe(1);
  });

  it("error rate by choice order skips timeouts and has the page number", () => {
    expect(s.error_rate_by_choice_order).toEqual([
      { choice_index: 1, n_picks: 3, errors: 0, error_rate: 0 },
      { choice_index: 2, n_picks: 3, errors: 1, error_rate: 1 / 3 },
      { choice_index: 3, n_picks: 1, errors: 0, error_rate: 0 },
      { choice_index: 4, n_picks: 1, errors: 0, error_rate: 0 },
    ]);
  });

  it("is well defined for empty data: counts 0, means null, lists empty, never NaN", () => {
    const e = calculateScores(new DataCollection([]));
    expect(e).toEqual({
      n_series: 0,
      n_pages: 0,
      n_picks: 0,
      n_timeouts: 0,
      total_errors: 0,
      mean_errors_per_series: null,
      errors_by_set_size: [],
      error_rate_by_choice_order: [],
      mean_accuracy: null,
      span_before_first_error: null,
      max_set_size_completed: null,
      perseverative_errors: 0,
      mean_rt: null,
      n_position_repeat_violations: 0,
    });
    expect(utils.scoring.getSummary(new DataCollection([])).task).toBe("self-ordered-pointing");
  });

  it("max_set_size_completed is null when every series has an error or a timeout", () => {
    const only = calculateScores(new DataCollection(rows.slice(0, 3)));
    expect(only.max_set_size_completed).toBeNull();
    // a timeout is no repeat, but the series is not completed either
    expect(calculateScores(new DataCollection(rows.slice(3, 7))).max_set_size_completed).toBeNull();
  });
});

describe("the page before the test", () => {
  const intro = (options: SelfOrderedPointingOptions) => {
    const jsPsych = initJsPsych();
    const { timeline } = createTimeline(jsPsych, options);
    const flat: any[] = [];
    const walk = (n: any) => {
      if (Array.isArray(n)) n.forEach(walk);
      else if (n?.timeline) walk(n.timeline);
      else if (n?.type) flat.push(n);
    };
    walk(timeline);
    return flat.filter((t) => /Main task/.test(typeof t.stimulus === "string" ? t.stimulus : ""));
  };

  it("lists the set sizes of the test in order, however they are ordered, and says what the test has", () => {
    const pages = intro({ set_sizes: [12, 6, 9], trials_per_condition: 2, block_order: "random" });
    expect(pages).toHaveLength(1);
    expect(pages[0].stimulus).toContain("You will do 6 sets, with 6, 9, 12 designs in the sets");
    expect(pages[0].stimulus).not.toContain("Practice is over");
    expect(pages[0].stimulus).toContain("You will not see a message after each pick");
  });

  it("follows practice when there is one, and says whether messages follow each pick", () => {
    const pages = intro({ set_sizes: [4], practice_trials: 1, trial_feedback: "accuracy" });
    expect(pages[0].stimulus).toContain(
      "Practice is over. The main task starts now, at the same pace."
    );
    expect(pages[0].stimulus).toContain(
      "After each pick you will see whether it was new or a repeat"
    );
  });
});

describe("exports", () => {
  it("exposes defaults, text and the unit factories", () => {
    expect(utils.constants.DEFAULT_OPTIONS).toBe(DEFAULT_OPTIONS);
    expect(Object.keys(utils.text.defaultText)).toContain("instruction_rule");
    expect(Object.keys(timelineUnits)).toEqual(
      expect.arrayContaining(["createPickTrial", "createSeries", "createInstructionWalkthrough"])
    );
  });
});
