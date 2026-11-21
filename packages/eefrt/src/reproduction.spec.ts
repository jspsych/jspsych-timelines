/**
 * Literature-reproduction tests (see packages/eefrt/reproduction.md).
 *
 * The runners, the shared checks and the report come from `@jspsych-timelines/testing`. This file
 * wires the EEfRT into them (contract, adapter, fixture, tallies) and holds the tests that are
 * specific to it: defaults against the anchor (Treadway et al. 2009), and the docs-meta file.
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
import { rewardRange } from "./offers";
import { DEFAULT_OPTIONS, EefrtOptions, PHASE_OPTIONS, resolveOptions } from "./options";
import { createTimeline } from ".";

const fixture = fixtureJson as unknown as Fixture;
const reproductionDir = path.join(__dirname, "..", "reproduction");

/**
 * A short run for trying the task on the docs page. Not from a study; listed first. It keeps the
 * default instructions and the interactive walkthrough and shortens the task: 2 forced practice trials,
 * 6 test trials (a trial count in place of the 20-minute clock), smaller press requirements and shorter
 * screens (DEFAULTS.md has the measured time).
 */
const QUICK_DEMO_OPTIONS: EefrtOptions = {
  practice_trials: 2,
  task_end_rule: "fixed_trial_count",
  n_test_trials: 6,
  difficulty_levels: { easy: 10, hard: 25 },
  response_window_ms: { choice: 5000, easy: 4000, hard: 8000 },
  fixation_duration_ms: 500,
  pre_block_countdown_ms: 500,
  feedback_duration_ms: 1000,
};

export const QUICK_DEMO_PRESET = {
  id: "quick-demo",
  label: "Quick demo",
  description:
    "A short run for trying the task: the walkthrough, 2 practice trials (the easy and the hard task) and 6 test trials, with 10 and 25 presses instead of 30 and 100 and shorter screens. Not from a study.",
  options: QUICK_DEMO_OPTIONS,
};

/** Percent strings of a typed probability list ("12%") as proportions. */
const proportions = (v: string[]) => v.map((s) => parseFloat(s) / 100);

defineReproduction({
  task: "eefrt",
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
  // null = untimed choice
  addNullOptions: ["response_window_ms"],
  // level 2: the resolved option must equal the value the configuration reports
  reportedValue: (key, value, r) => {
    const e = r.eff;
    const [, role] = key.split(".");
    switch (key) {
      case "feedback_duration_ms.completion_feedback_ms":
        return [e.feedback_duration_ms, value];
      case "feedback_duration_ms.reward_feedback_ms":
        return [e.reward_feedback_duration_ms, value];
      case "response_window_ms.choice_window_ms":
        return [e.response_window_ms.choice, value];
      case "response_window_ms.easy task":
        return [e.response_window_ms.easy, value * 1000]; // the spec gives seconds
      case "response_window_ms.hard task":
        return [e.response_window_ms.hard, value * 1000];
      case "difficulty_levels.easy task":
        return [e.difficulty_levels.easy, value];
      case "difficulty_levels.hard task":
        return [e.difficulty_levels.hard, value];
      case "outcome_type.reward_medium":
        return [e.outcome_type, value === "points" ? "points" : "money"];
      case "outcome_type.reward_display_currency":
        // the currency is text; only points change the option
        return value === "points" ? [e.outcome_type, "points"] : null;
      case "reward_magnitude.easy_reward_value":
        return [e.reward_magnitude.easy, value];
      case "reward_magnitude.hard_reward_values":
        return [rewardRange(e.reward_magnitude.hard), value.hard];
      case "reward_probability":
        return [e.reward_probability, proportions(value)];
      case "response_key_mapping.effort_key_assignment":
        return [e.response_key_mapping, value];
      case "social_influence_cue":
        return [false, value]; // the package has no social cue: only `false` was adapted
      default:
        // an undotted key is compared with the resolved option of the same name
        return !role && key in e ? [(e as any)[key], value] : null;
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
          const withText = entries.filter(
            (e) => !isGap(e.adapted) && (e.adapted as any).opts?.text !== undefined
          );
          // functions (the currency and finger text) are code-only: presets leave them out, with a note
          const opts = combine(entries.map((e) => e.adapted));
          delete (opts as any).text;
          const gaps = entries.filter((e) => isGap(e.adapted)).map((e) => e.key);
          const codeOnly = withText.map((e) => e.key);
          const assumed = assumedSettings(entries.map((e) => e.adapted)).filter(
            (k) => k !== "text"
          );
          return {
            id: sc.source,
            label: sc.label ?? sc.citation,
            description:
              (sc.label_note ? `${sc.label_note} · ` : "") +
              `${sc.source_type} · ${sc.setting ?? "no setting"} · ${
                Object.keys(sc.options).length
              } spec options` +
              (gaps.length ? ` · not expressible, left out: ${gaps.join(", ")}` : "") +
              (codeOnly.length
                ? ` · code only (the text option takes functions), left out: ${codeOnly.join(", ")}`
                : "") +
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

describe("defaults reproduce the anchor (S007, Treadway et al. 2009) except the documented changes", () => {
  const s007 = fixture.study_configurations.find((s) => s.source === "S007")!.options;
  const o = resolveOptions({}, "test");

  it("matches every typed S007 key", () => {
    expect(o.fixation_duration_ms).toBe(s007.fixation_duration_ms);
    expect(o.feedback_duration_ms.completion).toBe(
      s007["feedback_duration_ms.completion_feedback_ms"]
    );
    expect(o.feedback_duration_ms.reward).toBe(s007["feedback_duration_ms.reward_feedback_ms"]);
    expect(o.pre_block_countdown_ms).toBe(s007.pre_block_countdown_ms);
    expect(o.response_window_ms.choice).toBe(s007["response_window_ms.choice_window_ms"]);
    expect(o.response_window_ms.easy).toBe(s007["response_window_ms.easy task"] * 1000);
    expect(o.response_window_ms.hard).toBe(s007["response_window_ms.hard task"] * 1000);
    expect(o.difficulty_levels).toEqual({
      easy: s007["difficulty_levels.easy task"],
      hard: s007["difficulty_levels.hard task"],
    });
    expect(o.reward_magnitude.easy).toBe(s007["reward_magnitude.easy_reward_value"]);
    expect(rewardRange(o.reward_magnitude.hard)).toEqual(
      s007["reward_magnitude.hard_reward_values"].hard
    );
    expect(o.reward_probability).toEqual(proportions(s007.reward_probability));
    expect(o.session_duration_min).toBe(s007.session_duration_min);
    expect(o.task_end_rule).toBe(s007.task_end_rule);
    expect(o.trial_order).toBe(s007.trial_order);
    expect(o.practice_trials).toBe(s007.practice_trials);
    expect(o.payout_rule).toBe(s007.payout_rule);
    expect(o.progress_indicator).toBe(s007.progress_indicator);
    expect(o.outcome_valence).toBe(s007.outcome_valence);
    expect(o.outcome_type).toBe("money");
    expect(o.pretraining).toBe(s007.pretraining);
    expect(o.missed_response_handling).toBe(s007.missed_response_handling);
  });

  it("documented changes and fills", () => {
    // the spec's fill: Inquisit's choice keys (S021); the anchor does not state any
    expect(o.response_keys).toEqual(["e", "i"]);
    // 8 levels equally spaced from 1.24 to 4.30 (S021, S017); S007 reports only the range
    expect(o.reward_magnitude.hard).toEqual({ min: 1.24, max: 4.3, n_levels: 8 });
    // the space bar for both tasks (S021, S008); S007 differs by finger, which is instruction text
    expect(o.response_key_mapping).toEqual({ easy: "space", hard: "space" });
    expect(DEFAULT_OPTIONS.device_eligibility).toBe("computer_only");
    expect(DEFAULT_OPTIONS.n_test_trials).toBe(48);
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

  it("study presets are labelled with the spec's label", () => {
    const presets = (meta as any)["x-jspsych-presets"] as any[];
    for (const sc of fixture.study_configurations) {
      const p = presets.find((x) => x.id === sc.source);
      if (!p) continue;
      expect(p.label).toBe(sc.label ?? sc.citation);
      if (sc.label_note) expect(p.description.startsWith(`${sc.label_note} · `)).toBe(true);
    }
  });

  it("the quick demo preset is listed first and runs 2 practice and 6 test trials", async () => {
    const presets = (meta as any)["x-jspsych-presets"] as any[];
    expect(presets[0]).toEqual(QUICK_DEMO_PRESET);
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("quick-demo");
    const { timeline } = createTimeline(jsPsych, QUICK_DEMO_PRESET.options);
    const { getData, expectFinished } = await simulateTimeline(timeline, "data-only", {}, jsPsych);
    await expectFinished();
    const responses = (phase: string) => getData().filter({ phase, part: "response" }).count();
    expect(responses("practice")).toBe(2);
    expect(responses("test")).toBe(6);
    // the walkthrough is on: both choices and the easy task
    expect(getData().filter({ part: "instruction_check" }).count()).toBe(3);
  });
});
