/**
 * Literature-reproduction checks (see packages/flanker/reproduction.md).
 *
 * Level 1: every distinct typed observed value in the generated spec, built as one setting (plus the
 *          companions it needs to be observable) and simulated with data-only simulation.
 * Level 2: every fully typed study configuration, built with all its options at once.
 * The tallies are asserted against reproduction/expected-tallies.json and written to
 * reproduction/results.json, from which reproduction.md is produced.
 */
import * as fs from "fs";
import * as path from "path";

import { initJsPsych } from "jspsych";

import meta from "../docs-meta/options.meta.json";
import {
  Adapted,
  adapt,
  adaptConfig,
  combine,
  isGap,
  subFromRole,
  subFromVariation,
} from "../reproduction/adapter";
import { CHECKS } from "../reproduction/checks";
import expected from "../reproduction/expected-tallies.json";
import { run } from "../reproduction/harness";
import fixture from "../reproduction/spec-observed.json";
import { DEFAULT_OPTIONS, PHASE_OPTIONS, resolveOptions } from "./options";
import { createTimeline } from ".";

interface Case {
  option: string;
  sub: string;
  variation: string;
  value: any;
  sources: string[];
  labelledAddition: boolean;
}

// -- collect the distinct typed observed values -----------------------------------------------------

const ADD_NULL_OPTIONS = ["response_window_ms", "stimulus_duration_ms"]; // null = untimed / until response
const cases: Case[] = [];
let observedTotal = 0;
let typedTotal = 0;
for (const o of fixture.options as any[]) {
  const seen = new Map<string, Case>();
  for (const c of o.components) {
    for (const ob of c.observed) {
      observedTotal++;
      if (ob.ok) typedTotal++;
      const keep = ob.ok && ob.value !== null;
      const addition =
        ob.ok &&
        ob.value === null &&
        ADD_NULL_OPTIONS.includes(o.name) &&
        c.variation !== "deadline_rule";
      if (!keep && !addition) continue;
      const key = `${c.variation}|${JSON.stringify(ob.value)}`;
      const hit = seen.get(key);
      if (hit) hit.sources.push(ob.source);
      else {
        const k: Case = {
          option: o.name,
          sub: subFromVariation(o.name, c.variation),
          variation: c.variation,
          value: ob.value,
          sources: [ob.source],
          labelledAddition: addition,
        };
        seen.set(key, k);
        cases.push(k);
      }
    }
  }
}

const results = {
  level1: [] as any[],
  level2: [] as any[],
};

// -- level 1 -------------------------------------------------------------------------------------

describe("level 1: observed values", () => {
  for (const c of cases) {
    const label = `${c.option}/${c.variation} = ${JSON.stringify(c.value)} (${c.sources.join(
      ","
    )})`;
    it(label, async () => {
      const a: Adapted = adapt(c.option, c.sub, c.value);
      if (isGap(a)) {
        results.level1.push({ ...c, status: "not expressible", gap: a.gap, reason: a.reason });
        return;
      }
      const opts = combine([a]);
      const check = CHECKS[c.option];
      expect(check).toBeDefined();
      const r = await run(opts);
      await check.fn(r);
      results.level1.push({ ...c, status: "checked", kind: check.kind, options: opts });
    });
  }
});

// -- level 2 -------------------------------------------------------------------------------------

const configs = (fixture.study_configurations as any[]).filter((s) => s.fully_typed);

describe("level 2: fully typed study configurations", () => {
  for (const s of configs) {
    it(`${s.source}: ${s.citation}`, async () => {
      const entries = adaptConfig(s.options);
      const gaps = entries.filter((e) => isGap(e.adapted));
      const opts = combine(entries.map((e) => e.adapted));
      const r = await run(opts);
      const options = [
        ...new Set(
          entries
            .filter((e) => !isGap(e.adapted))
            .map((e) =>
              e.key.startsWith("practice.") || e.key.startsWith("trial_feedback.")
                ? "trial_feedback"
                : e.key.split(".")[0]
            )
        ),
      ];
      const checked: string[] = [];
      for (const name of options) {
        await CHECKS[name].fn(r);
        checked.push(name);
      }
      results.level2.push({
        source: s.source,
        citation: s.citation,
        n_options: s.n_options,
        n_keys: entries.length,
        keys_expressible: entries.length - gaps.length,
        gaps: gaps.map((g) => ({ key: g.key, ...(g.adapted as any) })),
        checked_options: checked,
        assumed_companions: Object.keys(opts).filter(
          (k) =>
            !entries.some(
              (e) =>
                e.key.split(".")[0] === k ||
                (e.key === "practice.trial_feedback" && k === "practice")
            )
        ),
      });
    });
  }
});

// -- defaults ------------------------------------------------------------------------------------

describe("defaults reproduce the PEBL anchor (S019) except the documented changes", () => {
  const s019 = (fixture.study_configurations as any[]).find((s) => s.source === "S019").options;
  const o = resolveOptions({}, "test");
  const p = resolveOptions({}, "practice");

  it("matches every typed S019 key that was not changed", () => {
    expect(o.condition_proportions).toEqual(
      s019["condition_proportions.condition_proportions"] && {
        congruent: 0.25,
        incongruent: 0.25,
        neutral_dash: 0.25,
        neutral_empty: 0.25,
      }
    );
    expect(o.feedback_condition).toBe(s019.feedback_condition);
    expect(o.feedback_duration_ms).toBe(s019.feedback_duration_ms);
    expect(o.fixation_duration_ms).toBe(s019.fixation_duration_ms);
    expect(o.iti_ms).toBe(s019.iti_ms);
    expect(o.n_test_trials).toBe(s019.n_test_trials);
    expect(o.practice_trials).toBe(s019.practice_trials);
    expect(o.response_window_ms).toBe(s019["response_window_ms.response_deadline_ms"]);
    expect(o.soa_ms).toBe(s019.soa_ms);
    expect(o.stimulus_color).toBe(s019.stimulus_color);
    expect(o.stimulus_duration_ms).toBe(s019.stimulus_duration_ms);
    expect(o.stimulus_layout.flanker_spacing).toEqual({ gap: 2, unit: "px" });
    expect(o.stimulus_set.flanker?.per_side).toBe(s019["stimulus_set.flanker"]);
    expect(o.stimulus_set.target).toBe(s019["stimulus_set.stimulus_set"]);
    expect(o.stimulus_size).toEqual(s019.stimulus_size);
    expect(o.trial_order).toBe(s019.trial_order);
    // test phase: no feedback (trial_feedback_by_phase: none)
    expect(o.trial_feedback).toBe(s019["trial_feedback.trial_feedback_by_phase"]);
  });

  it("documented changes", () => {
    expect(p.trial_feedback).toBe("accuracy_rt"); // content component; spec's practice.trial_feedback "accuracy" is a placeholder
    expect(s019["practice.trial_feedback"]).toBe("accuracy");
    expect(o.response_device).toBe("keyboard"); // spec: auto (untyped)
    expect(o.condition_set).toEqual(["congruent", "incongruent", "neutral_dash", "neutral_empty"]); // spec: [c, i, neutral]
    expect(DEFAULT_OPTIONS.n_blocks).toBe(1); // spec fill-in: 10
  });
});

// -- docs-meta ------------------------------------------------------------------------------------

describe("docs-meta/options.meta.json", () => {
  const optionNames = Object.keys(DEFAULT_OPTIONS)
    .filter((k) => k !== "practice")
    .sort();

  it("has one property per option, with the package's names", () => {
    const props = Object.keys((meta as any).properties)
      .filter((k) => k !== "practice" && k !== "text")
      .sort();
    expect(props).toEqual(optionNames);
    expect(Object.keys((meta as any).properties)).toEqual(
      expect.arrayContaining(["practice", "text"])
    );
  });

  it("marks exactly the honoured options as overridable in practice", () => {
    const flagged = Object.entries((meta as any).properties)
      .filter(([, v]: any) => v["x-jspsych"].phaseOverridable)
      .map(([k]) => k)
      .sort();
    expect(flagged).toEqual([...PHASE_OPTIONS].sort());
  });

  it("presets only use option names and values the package accepts", () => {
    const presets = (meta as any)["x-jspsych-presets"] as any[];
    expect(presets.length).toBeGreaterThan(5);
    for (const p of presets) {
      Object.keys(p.options).forEach((k) => expect([...optionNames, "practice"]).toContain(k));
      expect(() => createTimeline(initJsPsych(), p.options)).not.toThrow();
    }
  });
});

// -- tallies -------------------------------------------------------------------------------------

afterAll(() => {
  const l1 = results.level1;
  const tallies = {
    observed_values_total: observedTotal,
    typed_values_total: typedTotal,
    level1_distinct_cases: l1.length,
    level1_checked: l1.filter((x) => x.status === "checked").length,
    level1_not_expressible: l1.filter((x) => x.status === "not expressible").length,
    level1_labelled_additions: l1.filter((x) => x.labelledAddition).length,
    level2_configs: results.level2.length,
    level2_fully_expressible: results.level2.filter((x) => x.gaps.length === 0).length,
  };
  if (process.env.UPDATE_REPRODUCTION) {
    const dir = path.join(__dirname, "..", "reproduction");
    fs.writeFileSync(
      path.join(dir, "expected-tallies.json"),
      JSON.stringify(tallies, null, 2) + "\n"
    );
    fs.writeFileSync(
      path.join(dir, "results.json"),
      JSON.stringify({ tallies, ...results }, null, 2) + "\n"
    );
    // regenerate the presets in docs-meta from the study configurations (dotted keys retyped)
    const metaPath = path.join(dir, "..", "docs-meta", "options.meta.json");
    const m = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    m["x-jspsych-presets"] = (fixture.study_configurations as any[])
      .map((sc) => {
        const entries = adaptConfig(sc.options);
        const opts = combine(entries.map((e) => e.adapted));
        const gaps = entries.filter((e) => isGap(e.adapted)).map((e) => e.key);
        return {
          id: sc.source,
          label: sc.citation,
          description:
            `${sc.source_type} · ${sc.setting ?? "no setting"} · ${
              Object.keys(sc.options).length
            } spec options` +
            (gaps.length ? ` · not expressible, left out: ${gaps.join(", ")}` : ""),
          options: opts,
        };
      })
      .filter((p) => Object.keys(p.options).length >= 3 || p.id === "S069");
    fs.writeFileSync(metaPath, JSON.stringify(m, null, 2) + "\n");
  } else {
    expect(tallies).toEqual(expected);
  }
});
