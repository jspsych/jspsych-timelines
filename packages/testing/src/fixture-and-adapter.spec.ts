import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { miniAdapter } from "./__fixtures__/mini-adapter";
import { createAdapterKit, gap, isGap, ok } from "./adapter";
import { collectCases, untypedValues } from "./fixture";
import type { Fixture } from "./fixture";

const script = path.join(__dirname, "..", "scripts", "fixture-from-spec.mjs");
const specDir = path.join(__dirname, "__fixtures__", "mini-spec");

function generate(dir = specDir): Fixture {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "fixture-")), "fixture.json");
  execFileSync("node", [script, dir, out]);
  return JSON.parse(fs.readFileSync(out, "utf8"));
}

describe("fixture-from-spec", () => {
  const fixture = generate();

  it("turns a spec into the fixture shape", () => {
    expect(fixture.options.map((o) => o.name)).toEqual([
      "n_test_trials",
      "fixation_duration_ms",
      "response_window_ms",
      "trial_feedback",
    ]);
    const jitter = fixture.options[1].components[0].observed[1];
    expect(jitter).toEqual({
      source: "S2",
      raw: "300-600 step 100",
      value: { min: 300, max: 600, step: 100 },
      ok: true,
      note: "a range",
    });
    // untyped values keep their reason
    expect(untypedValues(fixture)).toEqual([
      {
        option: "n_test_trials",
        variation: "n_test_trials",
        source: "S3",
        raw: "lots",
        note: "no number given",
      },
    ]);
  });

  it("resolves YAML aliases in study configurations", () => {
    expect(fixture.study_configurations.map((s) => [s.source, s.fully_typed])).toEqual([
      ["S1", true],
      ["S2", true],
      ["S3", false],
    ]);
    expect(fixture.study_configurations[1].options.fixation_duration_ms).toEqual({
      min: 300,
      max: 600,
      step: 100,
    });
    expect(fixture.defaults).toEqual({ source: "S1", citation: "Mini defaults" });
  });

  it("carries the translations", () => {
    expect(fixture.translations).toEqual([
      {
        variation: "n_test_trials",
        raw: "lots",
        as: null,
        confidence: "low",
        flag: true,
        note: "no number given",
      },
    ]);
  });

  it("fails with a usage message without arguments", () => {
    expect(() => execFileSync("node", [script], { stdio: "pipe" })).toThrow();
  });
});

describe("collectCases", () => {
  const fixture = generate();

  it("lists each distinct typed value once, with its sources", () => {
    const { cases, observedTotal, typedTotal } = collectCases(fixture, {
      addNullOptions: ["response_window_ms"],
    });
    expect([observedTotal, typedTotal]).toEqual([10, 9]);
    expect(cases.map((c) => `${c.option}=${JSON.stringify(c.value)}`)).toEqual([
      "n_test_trials=20",
      "n_test_trials=40",
      "fixation_duration_ms=500",
      'fixation_duration_ms={"min":300,"max":600,"step":100}',
      "fixation_duration_ms=0",
      "response_window_ms=800",
      "response_window_ms=null",
      'trial_feedback="accuracy"',
      'trial_feedback="points_bank"',
    ]);
    expect(cases.find((c) => c.value === null)!.labelledAddition).toBe(true);
  });

  it("skips typed nulls unless the option is listed", () => {
    const { cases } = collectCases(fixture);
    expect(cases.some((c) => c.value === null)).toBe(false);
  });
});

describe("adapter kit", () => {
  const kit = createAdapterKit<any>({
    mapOptions: ["stimulus_set", "practice"],
    dropCompanion: (k, explicit) => k === "condition_set" && "condition_proportions" in explicit,
  });

  it("merges map options recursively and later fragments win", () => {
    expect(
      kit.mergeOptions(
        { stimulus_set: { target: "arrows", flanker: { per_side: 2 } }, n_blocks: 2 },
        { stimulus_set: { flanker: { per_side: 3 } }, n_blocks: 4 }
      )
    ).toEqual({ stimulus_set: { target: "arrows", flanker: { per_side: 3 } }, n_blocks: 4 });
  });

  it("applies companions weakest, and drops those the explicit settings contradict", () => {
    const entries = [
      ok({ feedback_duration_ms: 400 }, { trial_feedback: "accuracy", n_blocks: 3 }),
      ok({ n_blocks: 2, condition_proportions: { a: 1 } }, { condition_set: ["a", "b"] }),
      gap("plugin needed", "x"),
    ];
    expect(kit.combine(entries)).toEqual({
      trial_feedback: "accuracy",
      feedback_duration_ms: 400,
      n_blocks: 2,
      condition_proportions: { a: 1 },
    });
    expect(kit.assumedSettings(entries)).toEqual(["trial_feedback"]);
    expect(isGap(entries[2])).toBe(true);
  });

  it("the mini adapter classifies a value the task cannot express", () => {
    expect(isGap(miniAdapter.adapt("trial_feedback", "main", "points_bank"))).toBe(true);
    expect(miniAdapter.combine([miniAdapter.adapt("feedback_duration_ms", "main", 300)])).toEqual({
      trial_feedback: "accuracy",
      feedback_duration_ms: 300,
    });
  });
});
