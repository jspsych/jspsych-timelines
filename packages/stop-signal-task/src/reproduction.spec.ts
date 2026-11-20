/**
 * Literature-reproduction tests (see packages/stop-signal-task/reproduction.md).
 *
 * The runners, the shared checks and the report come from `@jspsych-timelines/testing`. This file
 * wires the task into them (contract, adapter, fixture, tallies) and holds the tests that are
 * specific to it: defaults against the STOP-IT anchor, values the spec could not type but the
 * package implements, and the docs-meta file.
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
const QUICK_DEMO_PRESET = {
  id: "quick-demo",
  label: "Quick demo",
  description:
    "A short run for trying the task: the walkthrough, 8 practice trials and 16 test trials (2 stop trials in every 8). Not from a study.",
  options: { practice_trials: 8, n_test_trials: 16, n_blocks: 1 },
};

// null = until response (go stimulus, signal) / self-paced (break)
const ADD_NULL_OPTIONS = ["stimulus_duration_ms", "break_duration_ms"];

defineReproduction({
  task: "stop-signal-task",
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
    const e = r.eff;
    const a = e.adaptive;
    const rounded = (x: number) => Math.round(x * 1e6) / 1e6;
    if (key === "practice_criterion") {
      // the spec types it with its own field names; the package's go accuracy is its go_accuracy_min
      const pc = e.practice_criterion;
      return [
        pc && { go_accuracy_min: pc.accuracy, on_fail: pc.on_fail },
        value && { go_accuracy_min: value.go_accuracy_min, on_fail: value.on_fail },
      ];
    }
    switch (key) {
      case "practice.trial_feedback":
        return [r.effP.trial_feedback, value];
      case "adaptive.procedure":
        return value === "tracking" ? [a?.procedure, "staircase_1up_1down"] : [a, null]; // fixed delays: no staircase
      case "adaptive.start_level":
        return [a?.start_level, value];
      case "adaptive.step_size":
        // a number is the larger of the two steps; {up, down} is stated in full
        return typeof value === "number"
          ? [Math.max(a!.step_size.up, a!.step_size.down), value]
          : [a?.step_size, value];
      case "adaptive.target_accuracy":
        return [a?.target_accuracy, value];
      case "adaptive.bounds":
        // [min, max]; a side the study does not report is null and is not compared
        return [
          (value as (number | null)[]).map((v, i) => (v === null ? null : a?.bounds[i])),
          value,
        ];
      case "condition_proportions.stop_signal_probability":
        return [rounded(e.condition_proportions.stop as number), value];
      case "stimulus_duration_ms.go_stimulus_duration_ms":
        return [e.stimulus_duration_ms, value];
      case "stimulus_duration_ms.stop signal":
        return [e.stop_signal_duration_ms, value];
      case "stimulus_modality.stop signal":
        return [e.stimulus_modality, value];
      case "practice_trials.practice_trials":
        return [e.practice_trials, value];
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

describe("defaults reproduce the STOP-IT anchor (S010) except the documented changes", () => {
  const s010 = fixture.study_configurations.find((s) => s.source === "S010")!.options;
  const o = resolveOptions({}, "test");
  const p = resolveOptions({}, "practice");

  it("matches every typed S010 key that was not changed", () => {
    expect(o.break_duration_ms).toBe(s010.break_duration_ms);
    expect(o.feedback_duration_ms).toBe(s010.feedback_duration_ms);
    expect(o.fixation_duration_ms).toBe(s010.fixation_duration_ms);
    expect(o.iti_ms).toBe(s010.iti_ms);
    expect(o.response_window_ms).toBe(s010.response_window_ms);
    expect(o.stimulus_duration_ms.go).toBe(s010["stimulus_duration_ms.go_stimulus_duration_ms"]);
    expect(o.stimulus_duration_ms.stop_signal).toBe(s010["stimulus_duration_ms.stop signal"]);
    expect(o.stimulus_modality).toBe(s010["stimulus_modality.stop signal"]);
    expect(o.condition_proportions[0].stop).toBe(
      s010["condition_proportions.stop_signal_probability"]
    );
    expect(o.n_blocks).toBe(s010.n_blocks);
    expect(o.trials_per_block).toBe(s010.trials_per_block);
    expect(o.sequence_constraints).toEqual(s010.sequence_constraints);
    expect(o.response_device).toBe(s010.response_device);
    expect(o.response_keys).toEqual(s010.response_keys);
    expect(o.response_mapping_counterbalancing).toBe(s010.response_mapping_counterbalancing);
    expect(o.adaptive).toMatchObject({
      start_level: s010["adaptive.start_level"],
      target_accuracy: s010["adaptive.target_accuracy"],
      bounds: s010["adaptive.bounds"], // [ssd_min_ms, ssd_max_ms]
      tracks: "single",
      reset: "never", // "continuous"
    });
    expect(Math.max(o.adaptive!.step_size.up, o.adaptive!.step_size.down)).toBe(
      s010["adaptive.step_size"]
    );
    expect(o.practice_criterion).toBeNull(); // practice_criterion: null
    expect(o.practice_trials).toBe(s010["practice_trials.practice_trials"]);
    expect(o.block_feedback).toBe(s010.block_feedback);
    expect(o.performance_incentive).toBe(s010.performance_incentive);
    expect(o.trial_feedback).toBe(s010.trial_feedback);
    expect(p.trial_feedback).toBe(s010["practice.trial_feedback"]);
    expect(o.population_protocol).toBe(s010.population_protocol);
    expect(o.strategy_instruction).toBe("dont_wait_plus_tracking_explanation"); // raw dont_wait_plus_tracking_explanation
  });

  it("documented changes", () => {
    expect(DEFAULT_OPTIONS.device_eligibility).toBe("none"); // spec: browser_restricted (not implemented; DEFAULTS.md)
    expect(s010.device_eligibility).toBe("browser_restricted");
    expect(DEFAULT_OPTIONS.instruction_demonstration).toBe("interactive"); // standard §6a
    expect(s010["adaptive.procedure"]).toBe("tracking"); // mapped to staircase_1up_1down
    expect(o.adaptive!.procedure).toBe("staircase_1up_1down");
  });
});

// -- values the spec could not type, expressed by hand --------------------------------------------

describe("adaptive values the spec left untyped (the translations predate tracks and reset)", () => {
  // S072: one staircase per condition; S082: reset per phase; S011: reset per condition (a block-wise reset here)
  const cases: Array<[string, any]> = [
    ["S072 per_condition", { adaptive: { tracks: "per_condition", start_level: 200 } }],
    [
      "S082 reset_per_phase",
      {
        adaptive: {
          reset: "phase",
          start_level: 250,
          step_size: { up: 25, down: 50 },
          target_accuracy: 0.667,
        },
      },
    ],
    [
      "S011 reset per condition (as reset per block)",
      { adaptive: { reset: "block", start_level: 250, bounds: [0, 850] } },
    ],
    ["S085 no upper bound", { adaptive: { bounds: [33.3, null], step_size: 33.3 } }],
  ];
  for (const [name, options] of cases) {
    it(`${name}: replays against the data`, async () => {
      const r = await harness.run({
        n_blocks: 2,
        trials_per_block: 32,
        practice_trials: 8,
        ...options,
      });
      await CHECKS.adaptive.fn(r, { contract, harness });
    });
  }
});

// -- docs-meta ------------------------------------------------------------------------------------

describe("docs-meta/options.meta.json", () => {
  const optionNames = Object.keys(DEFAULT_OPTIONS)
    .filter((k) => k !== "practice" && k !== "text")
    .concat(["n_test_trials", "text"])
    .filter((k) => k !== "text")
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

  it("the quick demo preset is listed first and runs 8 practice and 16 test trials", async () => {
    const presets = (meta as any)["x-jspsych-presets"] as any[];
    expect(presets[0]).toEqual(QUICK_DEMO_PRESET);
    const jsPsych = initJsPsych();
    const { timeline } = createTimeline(jsPsych, QUICK_DEMO_PRESET.options);
    const { getData, expectFinished } = await simulateTimeline(timeline, "data-only", {}, jsPsych);
    await expectFinished();
    const responses = (phase: string) => getData().filter({ phase, part: "response" }).count();
    expect(responses("practice")).toBe(8);
    expect(responses("test")).toBe(16);
    const stops = getData().filter({ phase: "test", part: "response", condition: "stop" }).count();
    expect(stops).toBe(4);
  });
});
