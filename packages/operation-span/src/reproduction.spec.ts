/**
 * Literature-reproduction tests (see packages/operation-span/reproduction.md).
 *
 * The runners, the shared checks and the report come from `@jspsych-timelines/testing`. This file wires
 * the operation span into them (contract, adapter, fixture, tallies) and holds the tests specific to the
 * span: defaults against the Unsworth et al. 2005 anchor, and the docs-meta file.
 *
 *   UPDATE_REPRODUCTION=1 npx jest   rewrites expected-tallies.json, results.json, reproduction.md
 *                                    and the presets in docs-meta
 */
import * as fs from "fs";
import * as path from "path";

import { defineReproduction } from "@jspsych-timelines/testing";
import type { Fixture, Tallies } from "@jspsych-timelines/testing";
import { simulateTimeline } from "@jspsych/test-utils";
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

/** A short run for trying the task on the docs page. Not from a study; listed first. */
export const QUICK_DEMO_PRESET = {
  id: "quick-demo",
  label: "Quick demo",
  description:
    "A short run for trying the task: the walkthrough, 2 letters-only, 6 processing-only and 2 combined practice trials, then 4 test trials (set sizes 2 and 3, twice each). Not from a study.",
  options: {
    practice_trials: 6,
    practice_storage_trials: 2,
    practice_combined_trials: 2,
    set_sizes: [2, 3],
    trials_per_condition: 2,
  },
};

defineReproduction({
  task: "operation-span",
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
  // the `null`s of the pacing-rule component name a rule (fixed deadline), not an untimed task
  nullExcludedVariations: ["processing_pacing_rule"],
  // level 2: the resolved option must equal the value the configuration reports
  reportedValue: (key, value, r) => {
    const e = r.eff as any;
    switch (key) {
      case "practice_trials.processing_practice_trials":
        return [e.practice_trials, value];
      case "response_device.processing task":
        return [e.response_device.processing, value];
      case "response_device.recall_input_mode":
        return [e.response_device.recall, value];
      case "response_window_ms.processing_deadline_ms":
        return [e.response_window_ms, value];
      case "stimulus_duration_ms.memorandum":
        return [e.stimulus_duration_ms, value];
      case "stimulus_set.memorandum_type":
        return value === "words"
          ? [typeof e.stimulus_set.memorandum, "object"]
          : [e.stimulus_set.memorandum, value];
      case "practice_criterion":
        return [e.practice_criterion, { accuracy: value.accuracy, window: value.block_trials }];
      case "stimulus_set.memorandum":
        return [e.stimulus_set.memorandum_source, value];
      default:
        return null;
    }
  },
  // regenerate the presets in docs-meta: the quick demo first, then the study configurations
  onUpdate: () => {
    const metaPath = path.join(reproductionDir, "..", "docs-meta", "options.meta.json");
    const m = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    m["x-jspsych-presets"] = [
      QUICK_DEMO_PRESET,
      ...fixture.study_configurations
        .map((sc) => {
          const entries = adaptConfig(sc.options);
          const opts = combine(entries.map((e) => e.adapted));
          const expressible = entries.filter((e) => !isGap(e.adapted)).length;
          // the calibrated deadline is the package default and code-only: say so instead of "not expressible"
          const calibrated = entries.some(
            (e) => isGap(e.adapted) && e.key.startsWith("response_window_ms.")
          );
          const gaps = entries
            .filter((e) => isGap(e.adapted) && !e.key.startsWith("response_window_ms."))
            .map((e) => e.key);
          const assumed = assumedSettings(entries.map((e) => e.adapted));
          const standIn = typeof (opts as any).stimulus_set?.memorandum === "object";
          return {
            expressible,
            id: sc.source,
            label: sc.label ?? sc.citation,
            description:
              (sc.label_note ? `${sc.label_note} · ` : "") +
              `${sc.source_type} · ${sc.setting ?? "no setting"} · ${
                Object.keys(sc.options).length
              } spec options` +
              (calibrated
                ? " · uses a calibrated deadline (mean + SD of the practice RTs): the package default, code-only, so not set here"
                : "") +
              (gaps.length ? ` · not expressible, left out: ${gaps.join(", ")}` : "") +
              (standIn ? " · the word pool is a stand-in: supply your own words" : "") +
              (assumed.length ? ` · assumed, not reported: ${assumed.join(", ")}` : ""),
            options: opts,
          };
        })
        // at least one value the study reported (assumed companion settings do not count; PACKAGE-STANDARD §12)
        .filter((p) => p.expressible >= 1)
        .map(({ expressible: _e, ...p }) => p),
    ];
    fs.writeFileSync(metaPath, JSON.stringify(m, null, 2) + "\n");
  },
});

// -- defaults ------------------------------------------------------------------------------------

describe("defaults reproduce the automated operation span anchor (S006) except the documented changes", () => {
  const s006 = fixture.study_configurations.find((s) => s.source === "S006")!.options;
  const o = resolveOptions({}, "test");
  const p = resolveOptions({}, "practice");

  it("matches every typed S006 key that was not changed", () => {
    expect(o.block_order).toBe(s006.block_order);
    expect(o.feedback_duration_ms).toBe(s006.feedback_duration_ms);
    expect(o.memorandum_order_in_pair).toBe(s006.memorandum_order_in_pair);
    expect(o.n_test_trials).toBe(s006.n_test_trials);
    expect(o.practice_trials).toBe(s006["practice_trials.processing_practice_trials"]);
    expect(o.processing_display_format).toBe(s006.processing_display_format);
    expect(o.processing_items_per_memorandum).toBe(s006.processing_items_per_memorandum);
    expect(o.processing_read_aloud).toBe(s006.processing_read_aloud);
    expect(o.recall_omission_handling).toBe(s006.recall_omission_handling);
    expect(o.response_device.processing).toBe(s006["response_device.processing task"]);
    expect(o.response_device.recall).toBe(s006["response_device.recall_input_mode"]);
    expect(o.response_format).toBe(s006.response_format);
    expect(o.response_order).toBe(s006.response_order);
    expect(o.set_sizes).toEqual(s006.set_sizes);
    expect(o.speed_accuracy_emphasis).toBe(s006.speed_accuracy_emphasis);
    expect(o.stimulus_duration_ms).toBe(s006["stimulus_duration_ms.memorandum"]);
    expect(o.stimulus_set.memorandum).toBe(s006["stimulus_set.memorandum_type"]);
    expect(o.stimulus_set.memorandum_source).toBe(s006["stimulus_set.memorandum"]);
    expect(o.trial_feedback).toBe(s006.trial_feedback);
    expect(o.trials_per_condition).toBe(s006.trials_per_condition);
  });

  it("the processing deadline is the anchor's calibrated rule, mean + 2.5 SD (untyped in the spec)", () => {
    expect(s006["response_window_ms.processing task"]).toEqual({
      untranslated: "individual_mean_plus_2.5sd",
    });
    expect(typeof o.response_window_ms).toBe("function");
    expect((o.response_window_ms as any).label).toBe("mean + 2.5 SD of correct practice RTs");
  });

  it("documented changes", () => {
    expect(o.inter_item_interval_ms).toBe(0); // spec fill: 500 (one jsPsych implementation, S020)
    expect(o.stimulus_language).toBeNull(); // spec fill: "Portuguese" (word materials)
    expect(p.set_sizes).toEqual([2]); // S006 combined practice: three trials of set size 2
    expect(DEFAULT_OPTIONS.practice_combined_trials).toBe(3);
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

  it("no preset carries a function (the calibrated deadline is code-only)", () => {
    for (const p of (meta as any)["x-jspsych-presets"] as any[]) {
      expect(JSON.stringify(p.options)).not.toContain("function");
      expect(typeof p.options.response_window_ms === "function").toBe(false);
    }
  });

  it("the quick demo preset is listed first and runs the practice and test trials it promises", async () => {
    const presets = (meta as any)["x-jspsych-presets"] as any[];
    expect(presets[0]).toEqual(QUICK_DEMO_PRESET);
    const jsPsych = initJsPsych();
    const { timeline } = createTimeline(jsPsych, QUICK_DEMO_PRESET.options);
    const { getData, expectFinished } = await simulateTimeline(
      timeline,
      "data-only",
      { default: { data: { rt: 400 } } },
      jsPsych
    );
    await expectFinished();
    const count = (phase: string, part: string) => getData().filter({ phase, part }).count();
    expect(count("practice", "response")).toBe(4); // 2 letters-only + 2 combined
    expect(
      getData()
        .filter({ phase: "practice", part: "processing", practice_part: "processing_only" })
        .count()
    ).toBe(6);
    expect(count("test", "response")).toBe(4);
    // the default instructions include the interactive walkthrough
    expect(count("instructions", "instruction_check")).toBe(3);
  });
});
