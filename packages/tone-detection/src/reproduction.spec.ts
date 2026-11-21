/**
 * Literature-reproduction tests (see packages/tone-detection/reproduction.md).
 *
 * The runners, the shared checks and the report come from `@jspsych-timelines/testing`. This file wires the task into them
 * (contract, adapter, fixture, tallies) and holds the tests that are specific to it: defaults against the S012 anchor, and the docs-meta file.
 *
 *   UPDATE_REPRODUCTION=1 npx jest   rewrites expected-tallies.json, results.json, reproduction.md and the presets in docs-meta
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
  adaptConfig,
  assumedSettings,
  combine,
  expectedSteps,
  isGap,
} from "../reproduction/adapter";
import { CHECKS } from "../reproduction/checks";
import { contract } from "../reproduction/contract";
import expected from "../reproduction/expected-tallies.json";
import { harness } from "../reproduction/harness";
import fixtureJson from "../reproduction/spec-observed.json";
import { DEFAULT_OPTIONS, PHASE_OPTIONS, resolveOptions } from "./options";
import { createTimeline } from ".";

const fixture = fixtureJson as unknown as Fixture;
const reproductionDir = path.join(__dirname, "..", "reproduction");

/**
 * A short run for trying the task on the docs page. Not from a study; listed first. It keeps the default instructions, the
 * volume screen and the headphone check (3 trials), the walkthrough, and shortens practice and the test: one track that starts nearer
 * the threshold, with 3 dB steps, ending after 20 trials (see DEFAULTS.md for the measured time).
 */
export const QUICK_DEMO_PRESET = {
  id: "quick-demo",
  label: "Quick demo",
  description:
    "A short run for trying the task: the walkthrough, a volume screen, a 3-trial headphone check, 4 practice trials and one track of 20 test trials (it starts nearer the threshold and takes 3 dB steps, so that it reverses within 20 trials). Not from a study.",
  options: {
    practice_trials: 4,
    headphone_check_trials: 3,
    trials_per_condition: 1,
    adaptive: { start_level: -15, step_size: [3, 1.5], discontinue_rule: { trials: 20 } },
  },
};

defineReproduction({
  task: "tone-detection",
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
  // level 2: the resolved option must equal the value the configuration reports
  reportedValue: (key, value, r) => {
    const e = r.eff;
    const a = e.adaptive;
    switch (key) {
      case "practice.trial_feedback":
        return [r.effP.trial_feedback, value];
      case "adaptive.procedure": {
        const p = adapterModule.adaptConfigKey(key, value);
        if (isGap(p)) return null;
        const want = (p.opts as any).adaptive;
        return want === null ? [a, null] : [a?.procedure, want.procedure];
      }
      case "adaptive.start_level":
        return [a?.start_level, value];
      case "adaptive.step_size": {
        const steps = expectedSteps(value);
        return steps ? [a?.step_sizes, steps] : null;
      }
      case "adaptive.discontinue_rule":
        return [a?.discontinue_rule, { [value.criterion]: value.n }];
      case "stimulus_set.tone timbre":
        return [e.stimulus_set.tone, value];
      case "stimulus_set.masker":
        return [e.stimulus_set.masker, value];
      case "tone_frequency_hz.standard_frequency_hz":
        return [e.tone_frequency_hz, Array.isArray(value) ? value : [value]];
      case "difficulty_levels":
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
        .filter((p) => Object.keys(p.options).length >= 2),
    ];
    fs.writeFileSync(metaPath, JSON.stringify(m, null, 2) + "\n");
  },
});

// -- defaults ------------------------------------------------------------------------------------

describe("defaults reproduce the S012 anchor except the documented changes", () => {
  const s012 = fixture.study_configurations.find((s) => s.source === "S012")!.options;
  const o = resolveOptions({}, "test");
  const p = resolveOptions({}, "practice");

  it("matches every typed S012 key that was not changed", () => {
    expect(o.inter_item_interval_ms).toBe(s012.inter_item_interval_ms);
    expect(o.stimulus_duration_ms).toBe(s012.stimulus_duration_ms);
    expect(o.tone_ramp_ms).toBe(s012.tone_ramp_ms);
    expect(o.stimulus_set.masker).toBe(s012["stimulus_set.masker"]);
    expect(o.stimulus_set.tone).toBe(s012["stimulus_set.tone timbre"]);
    expect(o.tone_frequency_hz).toEqual([s012["tone_frequency_hz.standard_frequency_hz"]]);
    expect(o.task_variant).toBe(s012.task_variant);
    expect(o.trials_per_condition).toBe(s012.trials_per_condition);
    expect(o.response_device).toBe(s012.response_device);
    expect(o.headphone_check).toBe(s012.headphone_check);
    expect(o.practice_trials).toBe(s012.practice_trials);
    expect(o.volume_calibration).toBe(s012.volume_calibration);
    expect(o.feedback_condition).toBe(s012.feedback_condition);
    expect(o.progress_indicator).toBe(s012.progress_indicator);
    expect(o.trial_feedback).toBe(s012.trial_feedback);
    expect(p.trial_feedback).toBe(s012["practice.trial_feedback"]);
    expect(o.judgment_wording).toBe(s012.judgment_wording);
    expect(o.adaptive).toMatchObject({
      start_level: s012["adaptive.start_level"],
      discontinue_rule: { trials: s012["adaptive.discontinue_rule"].n },
      procedure: "staircase_1up_3down", // the spec's "3down1up"
    });
    // 1.5 dB while descending, 0.75 dB after the first error (the anchor's level trigger, -19.75 dB SNR, is not implemented)
    expect(o.adaptive!.step_sizes.map((s) => s.down)).toEqual([1.5, 0.75]);
    expect(expectedSteps(s012["adaptive.step_size"])).toEqual(o.adaptive!.step_sizes);
    expect(o.practice_criterion).toBeNull(); // the anchor has none
  });

  it("documented changes", () => {
    expect(s012["device_eligibility.device_restriction"]).toBe("browser_restricted"); // not implemented
    expect(DEFAULT_OPTIONS.device_eligibility).toBe("none");
    expect(DEFAULT_OPTIONS.performance_incentive).toBe("none"); // spec: bonus
    expect(s012.performance_incentive).toBe("bonus"); // not implemented: payment is the researcher's
    expect(DEFAULT_OPTIONS.instruction_demonstration).toBe("interactive"); // standard §6a
    expect(DEFAULT_OPTIONS.headphone_screen).toBe("antiphase_quietest_tone"); // S012: Huggins pitch, not implemented
    expect(DEFAULT_OPTIONS.participant_eligibility).toBe("none"); // spec: hearing (fill)
    expect(DEFAULT_OPTIONS.environment_instructions).toBe("quiet_room"); // spec: untyped
    expect(DEFAULT_OPTIONS.practice).toEqual({ trial_feedback: "accuracy", adaptive: null });
    expect(p.adaptive).toBeNull();
    expect(p.difficulty_levels).toEqual([-13.75]); // S012 practised at its start level
  });

  it("the data replay the anchor's design: three 40-trial tracks at 1000 Hz, white noise, a 250 ms tone with 10 ms ramps", async () => {
    const { run } = await import("./test-helpers");
    const { rows } = await run({ instruction_demonstration: "none" });
    const t = rows.filter((r) => r.phase === "test" && r.part === "response");
    expect(t).toHaveLength(120);
    expect(new Set(t.map((r) => r.tone_frequency))).toEqual(new Set([1000]));
    const stim = rows.filter((r) => r.phase === "test" && r.part === "stimulus");
    expect(new Set(stim.map((r) => r.tone_duration))).toEqual(new Set([250]));
    expect(new Set(stim.map((r) => r.tone_ramp))).toEqual(new Set([10]));
    expect(new Set(stim.map((r) => r.inter_item_interval))).toEqual(new Set([250]));
  });
});

// -- docs-meta ------------------------------------------------------------------------------------

describe("docs-meta/options.meta.json", () => {
  const optionNames = Object.keys(DEFAULT_OPTIONS)
    .filter((k) => k !== "practice" && k !== "text")
    .concat(["response_keys", "calibration_level_db"])
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
    expect(presets.length).toBeGreaterThan(3);
    for (const p of presets) {
      Object.keys(p.options).forEach((k) => expect([...optionNames, "practice"]).toContain(k));
      expect(() => createTimeline(initJsPsych(), p.options)).not.toThrow();
    }
  });

  it("the quick demo preset is listed first and runs 4 practice trials, 3 headphone trials and one track of 20 test trials that reverses", async () => {
    const presets = (meta as any)["x-jspsych-presets"] as any[];
    expect(presets[0]).toEqual(QUICK_DEMO_PRESET);
    const jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("quick");
    const { timeline } = createTimeline(jsPsych, QUICK_DEMO_PRESET.options);
    const { getData, expectFinished } = await simulateTimeline(timeline, "data-only", {}, jsPsych);
    await expectFinished();
    const responses = (phase: string) => getData().filter({ phase, part: "response" }).count();
    expect(responses("practice")).toBe(4);
    expect(responses("test")).toBe(20);
    expect(getData().filter({ part: "headphone_check" }).count()).toBe(3);
    const test = getData().filter({ phase: "test", part: "response" }).values() as any[];
    expect(test.filter((r) => r.is_reversal).length).toBeGreaterThanOrEqual(2);
  });
});
