/**
 * Literature-reproduction tests (see packages/go-nogo/reproduction.md).
 *
 * The runners, the shared checks and the report come from `@jspsych-timelines/testing`. This file wires the
 * go/no-go into them (contract, adapter, fixture, tallies) and holds the tests that are specific to this
 * package: defaults against the Expfactory anchor, and the docs-meta file.
 *
 *   UPDATE_REPRODUCTION=1 npx jest   rewrites expected-tallies.json, results.json, reproduction.md
 *                                    and the presets in docs-meta
 */
import * as fs from "fs";
import * as path from "path";

import { createHarness, defineReproduction } from "@jspsych-timelines/testing";
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
import {
  DEFAULT_OPTIONS,
  GoNogoOptions,
  PHASE_OPTIONS,
  ResolvedOptions,
  resolveOptions,
} from "./options";
import { createTimeline } from ".";

const fixture = fixtureJson as unknown as Fixture;
const reproductionDir = path.join(__dirname, "..", "reproduction");

/** A short run for trying the task on the docs page. Not from a study; listed first. */
const QUICK_DEMO_PRESET = {
  id: "quick-demo",
  label: "Quick demo",
  description:
    "A short run for trying the task: the walkthrough, 6 practice trials and 20 test trials. Not from a study.",
  options: { practice_trials: 6, n_test_trials: 20, n_blocks: 1 },
};

// null = untimed / until response
const ADD_NULL_OPTIONS = ["response_window_ms", "stimulus_duration_ms"];

defineReproduction({
  task: "go-nogo",
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
  nullExcludedVariations: ["response_deadline_rule"],
  // level 2: the study's configuration keys carry `practice.` / `test.` prefixes and role names
  checkedOption: (key) => key.replace(/^(practice|test)\./, "").split(".")[0],
  // level 2: the resolved option must equal the value the configuration reports
  reportedValue: (key, value, r) => {
    const e = r.eff as any;
    const p = r.effP as any;
    switch (key) {
      case "condition_proportions.go_probability":
        return [e.condition_proportions.go, value];
      case "practice.condition_proportions.practice_go_probability":
        return [p.condition_proportions.go, value];
      case "practice.feedback_duration_ms":
        return [p.feedback_duration_ms, value];
      case "response_window_ms.response_window_ms":
        return [e.response_window_ms, value];
      case "stimulus_set.go":
        return [e.stimulus_set.go.length, value];
      case "stimulus_set.nogo":
        return [e.stimulus_set.nogo.length, value];
      case "stimulus_role_assignment.stimulus_role_assignment":
        return [e.stimulus_role_assignment, value];
      case "test.trial_feedback.trial_feedback_test":
        return [e.trial_feedback, value];
      case "test.feedback_condition.trial_feedback_test":
        return [e.feedback_condition, value];
      case "stimulus_layout":
        // the spec writes the layout in words
        return [
          e.stimulus_layout,
          { "top centre": "top_center", "random cell of a 2x2 grid": "random_2x2_grid" }[
            value as string
          ] ?? value,
        ];
      default:
        return null; // free-text stimulus sets and the go-mapping change are checked in the option checks
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
            id: sc.source + (sc.setting === "tablet" ? "-tablet" : ""),
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
        .filter((p) => Object.keys(p.options).length >= 2),
    ];
    fs.writeFileSync(metaPath, JSON.stringify(m, null, 2) + "\n");
  },
});

// -- defaults ------------------------------------------------------------------------------------

describe("defaults reproduce the Expfactory anchor (S022) except the documented changes", () => {
  const s022 = fixture.study_configurations.find((s) => s.source === "S022")!.options;
  const o = resolveOptions({}, "test");
  const p = resolveOptions({}, "practice");

  it("matches every typed S022 key that was not changed", () => {
    expect(o.block_feedback).toBe(s022.block_feedback);
    expect(o.condition_proportions.go).toBe(s022["condition_proportions.go_probability"]);
    expect(o.inter_trial_display).toBe(s022.inter_trial_display);
    expect(o.iti_ms).toBe(s022.iti_ms);
    expect(o.n_blocks).toBe(s022.n_blocks);
    expect(o.n_test_trials).toBe(s022.n_test_trials);
    expect(p.condition_proportions.go).toBe(
      s022["practice.condition_proportions.practice_go_probability"]
    );
    expect(p.feedback_duration_ms).toBe(s022["practice.feedback_duration_ms"]);
    expect(o.practice_trials).toBe(s022.practice_trials);
    expect(o.pre_block_countdown_ms).toBe(s022.pre_block_countdown_ms);
    expect(o.response_acknowledgement).toBe(s022.response_acknowledgement);
    expect(o.response_device).toBe(s022.response_device);
    expect(o.response_window_ms).toEqual(s022["response_window_ms.response_window_ms"]);
    expect(o.rule_reminder).toBe(s022.rule_reminder);
    expect(o.sequence_constraints).toEqual(s022.sequence_constraints);
    expect(o.single_task_blocks).toBe(s022.single_task_blocks);
    expect(o.stimulus_duration_ms).toBe(s022.stimulus_duration_ms);
    expect(o.stimulus_layout).toBe(s022.stimulus_layout);
    expect(o.stimulus_modality).toBe(s022.stimulus_modality);
    expect(o.stimulus_role_assignment).toBe(
      s022["stimulus_role_assignment.stimulus_role_assignment"]
    );
    expect(o.stimulus_set.go).toHaveLength(s022["stimulus_set.go"]);
    expect(o.stimulus_set.nogo).toHaveLength(s022["stimulus_set.nogo"]);
    expect(o.trial_feedback).toBe(s022["test.trial_feedback.trial_feedback_test"]);
  });

  it("documented changes", () => {
    // spec: random; the dossier's own locator is a shuffled list with exact counts (DEFAULTS.md)
    expect(s022.trial_order).toBe("random");
    expect(o.trial_order).toBe("shuffled_list");
    // spec has no practice default for the feedback content (null); correct/incorrect, no RT
    expect(p.trial_feedback).toBe("accuracy");
    // the spec's fill-in values
    expect(DEFAULT_OPTIONS.trial_termination_rule).toBe("fixed_duration");
    expect(DEFAULT_OPTIONS.speed_accuracy_emphasis).toBe("speed");
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

  it("the quick demo preset is listed first and runs 6 practice and 20 test trials, with no-go trials", async () => {
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
    const responses = (phase: string) => getData().filter({ phase, part: "response" });
    expect(responses("practice").count()).toBe(6);
    expect(responses("test").count()).toBe(20);
    // exact counts: both trial types appear in the short test
    expect(responses("test").filter({ condition: "nogo" }).count()).toBe(2);
    expect(responses("practice").filter({ condition: "nogo" }).count()).toBeGreaterThan(0);
  });
});

// -- extra cases the literature does not type -----------------------------------------------------------

describe("untimed and unconstrained cases", () => {
  it("response_window_ms: null (response ends the trial, go trials only) passes the shared check", async () => {
    const opts: GoNogoOptions = {
      response_window_ms: null,
      trial_termination_rule: "response_or_timeout",
      condition_proportions: { go: 1 },
      n_test_trials: 20,
    };
    const r = await harness.run(opts);
    await CHECKS.response_window_ms.fn(r, { contract, harness });
    rowsOfTest(r).forEach((x) => expect(x.response_window).toBeNull());
  });

  it("stimulus_duration_ms: null (stimulus stays until the trial ends) passes the shared check", async () => {
    const r = await harness.run({ stimulus_duration_ms: null });
    await CHECKS.stimulus_duration_ms.fn(r, { contract, harness });
  });
});

const rowsOfTest = (r: { rows: any[] }) =>
  r.rows.filter((x) => x.phase === "test" && x.part === "response");

describe("the sequence_constraints check catches a package that ignores the rules", () => {
  // the same harness, with the rules dropped before the timeline is built
  const ignoring = createHarness<GoNogoOptions, ResolvedOptions>({
    createTimeline: (jsPsych, opts) =>
      createTimeline(jsPsych, { ...opts, sequence_constraints: {} }),
    resolve: (opts, phase) => resolveOptions(opts, phase),
    seed: "go-nogo-repro",
  });
  const cases: [string, GoNogoOptions][] = [
    [
      "max_run by trial type",
      {
        condition_proportions: { go: 0.5, nogo: 0.5 },
        sequence_constraints: { max_run: { nogo: 2 } },
      },
    ],
    ["min_gap", { sequence_constraints: { min_gap: { nogo: 3 } } }],
    [
      "run_length",
      {
        condition_proportions: { go: 0.75, nogo: 0.25 },
        sequence_constraints: { run_length: { go: [1, 3, 5] } },
      },
    ],
    ["max_gap", { sequence_constraints: { max_gap: { nogo: 12 } } }],
    ["start_with", { n_blocks: 2, sequence_constraints: { start_with: { go: 12 } } }],
  ];
  for (const [name, opts] of cases) {
    it(`${name}: passes when honoured, fails when ignored`, async () => {
      const honoured = await harness.run(opts);
      await CHECKS.sequence_constraints.fn(honoured, { contract, harness });
      const ignored = await ignoring.run(opts);
      await expect(
        Promise.resolve(CHECKS.sequence_constraints.fn(ignored, { contract, harness: ignoring }))
      ).rejects.toThrow();
    });
  }
});
