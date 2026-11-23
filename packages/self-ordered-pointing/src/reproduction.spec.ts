/**
 * Literature-reproduction tests (see packages/self-ordered-pointing/reproduction.md).
 *
 * The runners, the shared checks and the report come from `@jspsych-timelines/testing`. This file wires
 * the task into them (contract, adapter, fixture, tallies) and holds the tests specific to it: defaults against the
 * TaskBeacon anchor (S019), and the docs-meta file.
 *
 *   UPDATE_REPRODUCTION=1 npx jest   rewrites expected-tallies.json, results.json, reproduction.md
 *                                    and the presets in docs-meta
 */
import * as fs from "fs";
import * as path from "path";

import { defineReproduction, resolveUtilRefs, toUtilRefs } from "@jspsych-timelines/testing";
import type { Fixture, Tallies } from "@jspsych-timelines/testing";
import { simulateTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import meta from "../docs-meta/options.meta.json";
import * as adapterModule from "../reproduction/adapter";
import {
  POSITION_RULES,
  adaptConfig,
  assumedSettings,
  combine,
  isGap,
} from "../reproduction/adapter";
import { CHECKS } from "../reproduction/checks";
import { contract } from "../reproduction/contract";
import expected from "../reproduction/expected-tallies.json";
import { harness } from "../reproduction/harness";
import fixtureJson from "../reproduction/spec-observed.json";
import { DEFAULT_OPTIONS, PHASE_OPTIONS, resolveOptions } from "./options";
import { createTimeline, utils } from ".";

const fixture = fixtureJson as unknown as Fixture;
const reproductionDir = path.join(__dirname, "..", "reproduction");

/** What a preset's items are: the package's bundled set stands in for the study's own items (PACKAGE-STANDARD §12). */
const itemsNote = (opts: any): string => {
  const set = opts?.stimulus_set?.items;
  if (!set) return "";
  return set === utils.stimuli.representationalDrawings
    ? " · items: substitute drawings (the package's outline drawings from Lucide), not the study's own pictures"
    : ` · items: the package's ${set.name.replace(/_/g, " ")}, not the study's own`;
};

/** A short run for trying the task on the docs page. Not from a study; listed first. */
export const QUICK_DEMO_PRESET = {
  id: "quick-demo",
  label: "Quick demo",
  description:
    "A short run for trying the task: the walkthrough, 2 practice sets of 3 items, then 2 test sets (4 and 6 items, one each). Not from a study.",
  options: {
    practice_trials: 2,
    set_sizes: [4, 6],
    trials_per_condition: 1,
  },
};

const POSITION_BY_RULE: Record<string, string> = Object.fromEntries(
  Object.entries(POSITION_RULES).map(([k, v]) => [k, v.position_repeat_rule as string])
);

defineReproduction({
  task: "self-ordered-pointing",
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
  addNullOptions: ["response_window_ms"],
  utils: utils as any,
  // level 2: `practice.set_sizes.practice_set_size` is one practice size, which is practice's `set_sizes`
  checkedOption: (key) => key.replace(/^practice\./, "").split(".")[0],
  reportedValue: (key, value, r) => {
    const e = r.eff as any;
    switch (key) {
      case "set_sizes.set_sizes":
        return [e.set_sizes, value];
      case "practice.set_sizes.practice_set_size":
        return [(r.effP as any).set_sizes, [value]];
      case "stimulus_set.item_stimulus_set":
        return [e.stimulus_set.items.name, value];
      case "stimulus_set.item_pool_across_set_sizes":
        return [e.stimulus_set.pool, value];
      case "sequence_constraints":
        return [
          e.position_repeat_rule,
          value && typeof value === "object" ? POSITION_BY_RULE[value.untranslated] : "none",
        ];
      case "adaptive.procedure":
        return [e.adaptive, null];
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
          const gaps = entries.filter((e) => isGap(e.adapted)).map((e) => e.key);
          const assumed = assumedSettings(entries.map((e) => e.adapted));
          return {
            expressible,
            id: sc.source,
            label: sc.label ?? sc.citation,
            description:
              (sc.label_note ? `${sc.label_note} · ` : "") +
              `${sc.source_type} · ${sc.setting ?? "no setting"} · ${
                Object.keys(sc.options).length
              } spec options` +
              (gaps.length ? ` · not expressible, left out: ${gaps.join(", ")}` : "") +
              (assumed.length ? ` · assumed, not reported: ${assumed.join(", ")}` : "") +
              itemsNote(opts),
            // JSON: a bundled stimulus set is written as a reference the docs theme resolves
            options: toUtilRefs(opts, utils as any),
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

describe("defaults reproduce the TaskBeacon anchor (S019) except the documented changes", () => {
  const s019 = fixture.study_configurations.find((s) => s.source === "S019")!.options;
  const o = resolveOptions({}, "test");

  it("matches every typed S019 key that was not changed", () => {
    expect(o.block_order).toBe(s019.block_order);
    expect(o.error_correction_procedure).toBe(s019.error_correction_procedure);
    expect(o.iti_ms).toBe(s019.iti_ms);
    expect(o.practice_trials).toBe(s019.practice_trials);
    expect(o.rearrangement_rule).toBe(s019.rearrangement_rule);
    expect(o.response_device).toBe(s019.response_device);
    expect(o.response_window_ms).toBe(s019.response_window_ms);
    expect(o.set_sizes).toEqual(s019["set_sizes.set_sizes"]);
    expect(o.stimulus_layout).toBe(s019.stimulus_layout);
    expect(o.stimulus_set.pool).toBe(s019["stimulus_set.item_pool_across_set_sizes"]);
    expect(o.stimulus_set.items.name).toBe(s019["stimulus_set.item_stimulus_set"]);
    expect(o.trial_feedback).toBe(s019.trial_feedback);
    expect(o.trials_per_condition).toBe(s019.trials_per_condition);
    expect(o.position_repeat_rule).toBe("none"); // s019.sequence_constraints is null
    expect(o.adaptive).toBeNull(); // s019 "fixed"
  });

  it("documented changes", () => {
    expect(o.population_protocol).toBe("standard"); // spec fill: "child" (a fill, not evidence)
    expect(DEFAULT_OPTIONS.practice).toEqual({ set_sizes: [3], trial_feedback: "accuracy" });
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
      expect(() =>
        createTimeline(initJsPsych(), resolveUtilRefs(p.options, utils as any))
      ).not.toThrow();
    }
  });

  it("the quick demo preset is listed first and runs the practice and test series it promises", async () => {
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
    expect(count("practice", "response")).toBe(6); // 2 series of 3 items
    expect(count("test", "response")).toBe(10); // one series of 4 and one of 6
    // the default instructions include the interactive walkthrough
    expect(count("instructions", "instruction_check")).toBe(3);
  });
});
