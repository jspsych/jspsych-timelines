/**
 * Literature-reproduction tests (see packages/two-step-task/reproduction.md).
 *
 * The runners, the shared checks and the report come from `@jspsych-timelines/testing`. This file
 * wires the two-step task into them (contract, adapter, fixture, tallies) and holds the tests that are
 * specific to this package: defaults against the Expfactory anchor, and the docs-meta file.
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
import {
  WALKS,
  adaptConfig,
  assumedSettings,
  combine,
  isGap,
  retypeProbabilities,
} from "../reproduction/adapter";
import { CHECKS } from "../reproduction/checks";
import { contract } from "../reproduction/contract";
import expected from "../reproduction/expected-tallies.json";
import { harness } from "../reproduction/harness";
import fixtureJson from "../reproduction/spec-observed.json";
import { DEFAULT_OPTIONS, PHASE_OPTIONS, resolveOptions } from "./options";
import { createTimeline } from ".";

jest.setTimeout(120000);

const fixture = fixtureJson as unknown as Fixture;
const reproductionDir = path.join(__dirname, "..", "reproduction");

/** A short run for trying the task on the docs page. Not from a study; listed first. */
export const QUICK_DEMO_PRESET = {
  id: "quick-demo",
  label: "Quick demo",
  description:
    "A short run for trying the task: the walkthrough, 4 practice trials and 24 test trials, at a faster pace (shorter highlight and inter-trial interval). Not from a study.",
  options: {
    practice_trials: 4,
    n_test_trials: 24,
    n_blocks: 1,
    response_acknowledgement_ms: 400,
    iti_ms: 300,
  },
};

// null = untimed (S013, S062)
const ADD_NULL_OPTIONS = ["response_window_ms"];

defineReproduction({
  task: "two-step-task",
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
  // level 2: the resolved option must equal the value the configuration reports
  reportedValue: (key, value, r) => {
    const e = r.eff as any;
    switch (key) {
      case "reward_probability":
        return [
          e.reward_probability,
          { ...DEFAULT_OPTIONS.reward_probability, ...retypeProbabilities(value) },
        ];
      case "reward_schedule.reward_walk":
        return [e.reward_schedule, WALKS[value]];
      case "reward_schedule.reward_schedule":
        return [e.reward_schedule.kind, "random_walk"];
      case "missed_response_handling.missed_response_handling":
        return [e.missed_response_handling, value];
      case "practice_trials.practice_trials":
        return [e.practice_trials, value];
      case "sequence_constraints":
        return [e.sequence_constraints ?? {}, value];
      case "missed_response_handling.missed_trial_abort_threshold":
        return null;
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
          const gaps = entries.filter((e) => isGap(e.adapted)).map((e) => e.key);
          const assumed = assumedSettings(entries.map((e) => e.adapted));
          return {
            id: sc.source,
            label: sc.label ?? sc.citation,
            description:
              (sc.label_note ? `${sc.label_note} · ` : "") +
              `${sc.source_type} · ${sc.setting ?? "no setting"} · ${
                Object.keys(sc.options).length
              } spec options` +
              (gaps.length ? ` · not expressible, left out: ${gaps.join(", ")}` : "") +
              (assumed.length ? ` · assumed, not reported: ${assumed.join(", ")}` : ""),
            options: opts,
          };
        })
        .filter((p) => Object.keys(p.options).length >= 3),
    ];
    fs.writeFileSync(metaPath, JSON.stringify(m, null, 2) + "\n");
  },
});

// -- defaults ------------------------------------------------------------------------------------

describe("defaults reproduce the Expfactory anchor (S024) except the documented changes", () => {
  const s024 = fixture.study_configurations.find((s) => s.source === "S024")!.options;
  const o = resolveOptions({}, "test");

  it("matches every typed S024 key", () => {
    expect(o.common_transition_prob).toBe(s024.common_transition_prob);
    expect(o.comprehension_check).toBe(s024.comprehension_check);
    expect(o.feedback_duration_ms).toBe(s024.feedback_duration_ms);
    expect(o.fixation_duration_ms).toBe(s024.fixation_duration_ms);
    expect(o.fullscreen_enforcement).toBe(s024.fullscreen_enforcement);
    expect(o.instruction_format).toBe(s024.instruction_format);
    expect(o.instruction_framing).toBe(s024.instruction_framing);
    expect(o.iti_ms).toBe(s024.iti_ms);
    expect(o.manipulation_check).toBe(s024.manipulation_check);
    expect(o.missed_response_handling).toBe(
      s024["missed_response_handling.missed_response_handling"]
    );
    expect(o.n_blocks).toBe(s024.n_blocks);
    expect(o.n_test_trials).toBe(s024.n_test_trials);
    expect(o.population_protocol).toBe(s024.population_protocol);
    expect(o.practice_trials).toBe(s024["practice_trials.practice_trials"]);
    expect(o.response_acknowledgement).toBe(s024.response_acknowledgement);
    expect(o.response_keys).toEqual(s024.response_keys);
    expect(o.response_window_ms).toBe(s024.response_window_ms);
    expect(o.rest_breaks).toBe(s024.rest_breaks);
    expect(o.trials_per_block).toBe(s024.trials_per_block);
    expect(o.reward_probability).toEqual(
      retypeProbabilities(s024.reward_probability) && {
        red: { option_1: { min: 0.25, max: 0.75 }, option_2: { min: 0.25, max: 0.75 } },
        blue: { option_1: { min: 0.25, max: 0.75 }, option_2: { min: 0.25, max: 0.75 } },
      }
    );
    expect(o.reward_schedule).toEqual(WALKS[s024["reward_schedule.reward_walk"]]);
    expect(o.sequence_constraints ?? {}).toEqual(s024.sequence_constraints);
  });

  it("documented gaps and fill-ins", () => {
    // not reported by the anchor: filled from the sources that report them
    expect(o.timeout_message_ms).toBe(1500); // S025
    expect(o.running_score_display).toBe("running_total"); // S025
    expect(o.contingency_disclosure).toBe("partial"); // S007
    expect(o.option_side_assignment).toBe("random_per_trial"); // S007, S120
    expect(o.response_acknowledgement_ms).toBe(1000); // selection display of S024, as a duration
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

  it("the quick demo preset is listed first and runs 4 practice and 24 test trials", async () => {
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
    const responses = (phase: string) => getData().filter({ phase, part: "response" }).count();
    expect(responses("practice")).toBe(4);
    expect(responses("test")).toBe(24);
  });
});
