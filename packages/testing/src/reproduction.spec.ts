/** `defineReproduction` end to end on the mini task: levels 1 and 2, gaps, tallies, report. */
import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { miniAdapter } from "./__fixtures__/mini-adapter";
import { miniContract, miniHarness } from "./__fixtures__/mini-task";
import { sharedChecks } from "./checks/shared";
import type { Fixture } from "./fixture";
import { renderReproductionMd } from "./report";
import { defineReproduction } from "./reproduction";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "repro-"));
execFileSync("node", [
  path.join(__dirname, "..", "scripts", "fixture-from-spec.mjs"),
  path.join(__dirname, "__fixtures__", "mini-spec"),
  path.join(tmp, "fixture.json"),
]);
const fixture: Fixture = JSON.parse(fs.readFileSync(path.join(tmp, "fixture.json"), "utf8"));

const expectedTallies = {
  observed_values_total: 10,
  typed_values_total: 9,
  level1_distinct_cases: 9,
  level1_checked: 8,
  level1_not_expressible: 1,
  level1_labelled_additions: 1,
  level2_configs: 2,
  level2_fully_expressible: 1,
};

const { results } = defineReproduction({
  task: "mini-task",
  dir: tmp,
  fixture,
  expectedTallies,
  harness: miniHarness(),
  contract: miniContract,
  adapter: miniAdapter,
  checks: sharedChecks,
  addNullOptions: ["response_window_ms"],
  update: false,
});

describe("reproduction report", () => {
  // runs after the level 1 and level 2 tests above (jest runs them in order)
  it("is rendered from the results", () => {
    const tallies = expectedTallies;
    const md = renderReproductionMd({
      task: "mini-task",
      fixture,
      results: { tallies, level1: results.level1, level2: results.level2 },
      reportPath: path.join(tmp, "reproduction.md"),
      notes: "## Notes\n\nhand-written",
    });
    expect(md).toContain("# Reproduction of the literature values");
    expect(md).toContain(
      "The spec lists 10 observed values over the 4 options; 9 are typed, 1 are not."
    );
    expect(md).toContain("| Expressible and checked | 8");
    expect(md).toContain("`trial_feedback: points_bank` | S2 | option missing");
    expect(md).toContain("| S1 | Mini et al. 2020 | 4 | 4 | 2 |");
    expect(md).toContain("`trial_feedback`");
    expect(md).toContain("`n_test_trials`: lots | S3 | no number given");
    expect(md.trim().endsWith("hand-written")).toBe(true);
  });

  it("classified the gap and ran level 2 on every fully typed configuration", () => {
    expect(results.level1.filter((x) => x.status === "not expressible")).toHaveLength(1);
    expect(results.level2.map((x) => [x.source, x.gaps.length])).toEqual([
      ["S1", 0],
      ["S2", 1],
    ]);
    expect(results.level2[0].checked_options).toEqual([
      "n_test_trials",
      "fixation_duration_ms",
      "response_window_ms",
      "trial_feedback",
    ]);
  });
});
