/**
 * Literature-reproduction tests (see packages/flanker/reproduction.md).
 *
 * The runners, the shared checks and the report come from `@jspsych-timelines/testing`. This file
 * wires the flanker into them (contract, adapter, fixture, tallies) and holds the tests that are
 * specific to the flanker: defaults against the PEBL anchor, and the docs-meta file.
 *
 *   UPDATE_REPRODUCTION=1 npx jest   rewrites expected-tallies.json, results.json, reproduction.md
 *                                    and the presets in docs-meta
 */
import * as fs from "fs";
import * as path from "path";

import { defineReproduction } from "@jspsych-timelines/testing";
import type { Fixture, ReproductionResults, Tallies } from "@jspsych-timelines/testing";
import { initJsPsych } from "jspsych";

import meta from "../docs-meta/options.meta.json";
import * as adapterModule from "../reproduction/adapter";
import { adaptConfig, assumedSettings, combine, isGap } from "../reproduction/adapter";
import { CHECKS } from "../reproduction/checks";
import { contract } from "../reproduction/contract";
import expected from "../reproduction/expected-tallies.json";
import { harness } from "../reproduction/harness";
import fixtureJson from "../reproduction/spec-observed.json";
import { DEFAULT_OPTIONS, PHASE_OPTIONS, resolveOptions } from "./options";
import { createTimeline } from ".";

const fixture = fixtureJson as unknown as Fixture;
const reproductionDir = path.join(__dirname, "..", "reproduction");

// null = untimed / until response
const ADD_NULL_OPTIONS = ["response_window_ms", "stimulus_duration_ms"];

defineReproduction({
  task: "flanker",
  dir: reproductionDir,
  fixture,
  expectedTallies: expected as Tallies,
  harness,
  contract,
  adapter: {
    adapt: adapterModule.adapt,
    adaptConfig,
    combine,
    assumedSettings,
    subFromVariation: adapterModule.subFromVariation,
  },
  checks: CHECKS,
  addNullOptions: ADD_NULL_OPTIONS,
  nullExcludedVariations: ["deadline_rule"],
  // level 2: the resolved option must equal the value the configuration reports
  reportedValue: (key, value, r, s) => {
    const e = r.eff as any;
    const [opt, role] = key.split(".");
    if (key === "stimulus_set.flanker")
      return [
        e.stimulus_set.flanker.per_side,
        typeof value === "number" ? value : value.flanker.per_side,
      ];
    if (key === "stimulus_set.neutral flanker") return null; // compared as glyphs in the check
    if (key === "stimulus_set.stimulus_set" && value === "arrows")
      return [e.stimulus_set.target, "arrows"];
    if (role === "response_deadline_ms") return [e[opt], value];
    if (role === "condition_proportions") return [e[opt], value];
    if (key === "cue_target_interval_ms.warning cue") return [e[opt], value];
    if (
      key === "trial_feedback.trial_feedback_content" &&
      !("trial_feedback.trial_feedback_by_phase" in s.options)
    )
      return [e.trial_feedback, value];
    return null;
  },
  // regenerate the presets in docs-meta from the study configurations (dotted keys retyped)
  onUpdate: () => {
    const metaPath = path.join(reproductionDir, "..", "docs-meta", "options.meta.json");
    const m = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    m["x-jspsych-presets"] = fixture.study_configurations
      .map((sc) => {
        const entries = adaptConfig(sc.options);
        const opts = combine(entries.map((e) => e.adapted));
        const gaps = entries.filter((e) => isGap(e.adapted)).map((e) => e.key);
        const assumed = assumedSettings(entries.map((e) => e.adapted));
        return {
          id: sc.source,
          label: sc.citation,
          description:
            `${sc.source_type} · ${sc.setting ?? "no setting"} · ${
              Object.keys(sc.options).length
            } spec options` +
            (gaps.length ? ` · not expressible, left out: ${gaps.join(", ")}` : "") +
            (assumed.length ? ` · assumed, not reported: ${assumed.join(", ")}` : ""),
          options: opts,
        };
      })
      .filter((p) => Object.keys(p.options).length >= 3 || p.id === "S069");
    fs.writeFileSync(metaPath, JSON.stringify(m, null, 2) + "\n");
  },
});

// -- defaults ------------------------------------------------------------------------------------

describe("defaults reproduce the PEBL anchor (S019) except the documented changes", () => {
  const s019 = fixture.study_configurations.find((s) => s.source === "S019")!.options;
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
