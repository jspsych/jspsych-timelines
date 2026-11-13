/**
 * Runners for literature reproduction.
 *
 * Level 1: every distinct typed observed value in the fixture, built as one setting (plus the
 *          companions it needs to be observable) and simulated with data-only simulation.
 * Level 2: every fully typed study configuration, built with all its options at once.
 *
 * Values the package cannot express are classified as gaps (see `GapClass`) and skipped. The
 * tallies are asserted against the committed `expected-tallies.json`, so a regression or an
 * improvement shows up as a diff; `UPDATE_REPRODUCTION=1` rewrites `expected-tallies.json`,
 * `results.json` and `reproduction.md`.
 *
 * Call `defineReproduction` from a spec file in the package (`src/reproduction.spec.ts`).
 */
import * as fs from "fs";
import * as path from "path";

import { isGap } from "./adapter";
import type { Adapted, ConfigEntry, ReproductionAdapter } from "./adapter";
import type { CheckSet } from "./checks/types";
import { missingContract } from "./checks/types";
import type { DataContract } from "./contract";
import { collectCases } from "./fixture";
import type { Case, Fixture, StudyConfiguration } from "./fixture";
import type { Harness, Run } from "./harness";
import { writeReproductionMd } from "./report";
import type { CheckKind, GapClass } from "./types";

export interface Tallies {
  observed_values_total: number;
  typed_values_total: number;
  level1_distinct_cases: number;
  level1_checked: number;
  level1_not_expressible: number;
  level1_labelled_additions: number;
  level2_configs: number;
  level2_fully_expressible: number;
}

export interface Level1Result extends Omit<Case, "phase"> {
  status: "checked" | "not expressible";
  kind?: CheckKind;
  options?: any;
  gap?: GapClass;
  reason?: string;
}

export interface Level2Result {
  source: string;
  citation: string;
  n_options: number;
  n_keys: number;
  keys_expressible: number;
  gaps: { key: string; gap: GapClass; reason: string }[];
  checked_options: string[];
  assumed: string[];
  tied_to_reported_value: number;
}

export interface ReproductionResults {
  tallies: Tallies;
  level1: Level1Result[];
  level2: Level2Result[];
}

export interface ReproductionConfig<O = any, E = any> {
  /** task name, for the report */
  task: string;
  /** the package's `reproduction/` directory: `expected-tallies.json` and `results.json` live here */
  dir: string;
  fixture: Fixture;
  /** the committed `expected-tallies.json` */
  expectedTallies: Tallies;
  harness: Harness<O, E>;
  contract: DataContract<E>;
  adapter: ReproductionAdapter<O>;
  /** one check per option name: `{ ...sharedChecks, ...packageChecks }` */
  checks: CheckSet<O, E>;
  /** options whose typed `null` means untimed and is added as a labelled case (default: none) */
  addNullOptions?: string[];
  nullExcludedVariations?: string[];
  /**
   * Level 2: the value a configuration key resolved to, paired with the value it reports.
   * Keys without a dot are paired with `r.eff[key]` by default; this handles the dotted ones.
   * Return `null` when the key cannot be compared one-to-one.
   */
  reportedValue?: (
    key: string,
    value: any,
    r: Run<O, E>,
    config: StudyConfiguration
  ) => [actual: any, expected: any] | null;
  /** Level 2: the option whose check covers a configuration key. Default: the part before the dot. */
  checkedOption?: (key: string) => string;
  /** Path of `reproduction.md`; default: next to `dir`. */
  reportPath?: string;
  /** Hand-written commentary appended to the report; default: `<dir>/notes.md` if it exists. */
  notesPath?: string;
  /** Called with the results when `UPDATE_REPRODUCTION` is set (e.g. to regenerate presets). */
  onUpdate?: (results: ReproductionResults) => void;
  /** Default: `process.env.UPDATE_REPRODUCTION` is set. */
  update?: boolean;
}

const defaultCheckedOption = (key: string) =>
  key.startsWith("practice.") ? key.slice("practice.".length) : key.split(".")[0];

function runCheck(config: ReproductionConfig, option: string) {
  const check = config.checks[option];
  if (!check) throw new Error(`no check for option "${option}": write one or extend the adapter`);
  const missing = missingContract(check, config.contract);
  if (missing.length) {
    throw new Error(
      `the check for "${option}" needs contract entries the adapter does not provide: ${missing.join(
        ", "
      )}`
    );
  }
  return check;
}

export function defineReproduction<O = any, E = any>(config: ReproductionConfig<O, E>) {
  const { fixture, adapter, harness, contract } = config;
  const { cases, observedTotal, typedTotal } = collectCases(fixture, {
    addNullOptions: config.addNullOptions,
    nullExcludedVariations: config.nullExcludedVariations,
    subFromVariation: adapter.subFromVariation,
  });
  const results: Omit<ReproductionResults, "tallies"> = { level1: [], level2: [] };

  describe("level 1: observed values", () => {
    for (const c of cases) {
      const label = `${c.option}/${c.variation} = ${JSON.stringify(c.value)} (${c.sources.join(
        ","
      )})`;
      it(label, async () => {
        const { phase, ...rest } = c;
        const a: Adapted<O> = adapter.adapt(c.option, c.sub, c.value, phase);
        if (isGap(a)) {
          results.level1.push({ ...rest, status: "not expressible", gap: a.gap, reason: a.reason });
          return;
        }
        const opts = adapter.combine([a]);
        const check = runCheck(config, c.option);
        const r = await harness.run(opts);
        await check.fn(r, { contract, harness });
        const kind = typeof check.kind === "function" ? check.kind(c.sub) : check.kind;
        results.level1.push({ ...rest, status: "checked", kind, options: opts });
      });
    }
  });

  const configs = fixture.study_configurations.filter((s) => s.fully_typed);

  describe("level 2: fully typed study configurations", () => {
    for (const s of configs) {
      it(`${s.source}: ${s.citation}`, async () => {
        const entries: ConfigEntry<O>[] = adapter.adaptConfig(s.options);
        const gaps = entries.filter((e) => isGap(e.adapted));
        const opts = adapter.combine(entries.map((e) => e.adapted));
        const r = await harness.run(opts);
        // the resolved option must equal the value the configuration reports
        let tied = 0;
        for (const { key, adapted } of entries) {
          if (isGap(adapted)) continue;
          const pair = key.includes(".")
            ? config.reportedValue?.(key, s.options[key], r, s) ?? null
            : [(r.eff as any)[key], s.options[key]];
          if (pair) {
            expect(pair[0]).toEqual(pair[1]);
            tied++;
          }
        }
        if (entries.some((e) => !isGap(e.adapted))) expect(tied).toBeGreaterThan(0);
        const names = [
          ...new Set(
            entries
              .filter((e) => !isGap(e.adapted))
              .map((e) => (config.checkedOption ?? defaultCheckedOption)(e.key))
          ),
        ];
        const checked: string[] = [];
        for (const name of names) {
          await runCheck(config, name).fn(r, { contract, harness });
          checked.push(name);
        }
        results.level2.push({
          source: s.source,
          citation: s.citation,
          n_options: s.n_options,
          n_keys: entries.length,
          keys_expressible: entries.length - gaps.length,
          gaps: gaps.map((g) => ({ key: g.key, ...(g.adapted as any) })),
          checked_options: checked,
          assumed: adapter.assumedSettings(entries.map((e) => e.adapted)),
          tied_to_reported_value: tied,
        });
      });
    }
  });

  afterAll(() => {
    const l1 = results.level1;
    const tallies: Tallies = {
      observed_values_total: observedTotal,
      typed_values_total: typedTotal,
      level1_distinct_cases: l1.length,
      level1_checked: l1.filter((x) => x.status === "checked").length,
      level1_not_expressible: l1.filter((x) => x.status === "not expressible").length,
      level1_labelled_additions: l1.filter((x) => x.labelledAddition).length,
      level2_configs: results.level2.length,
      level2_fully_expressible: results.level2.filter((x) => x.gaps.length === 0).length,
    };
    const update = config.update ?? !!process.env.UPDATE_REPRODUCTION;
    if (!update) {
      expect(tallies).toEqual(config.expectedTallies);
      return;
    }
    const all: ReproductionResults = { tallies, ...results };
    fs.writeFileSync(
      path.join(config.dir, "expected-tallies.json"),
      JSON.stringify(tallies, null, 2) + "\n"
    );
    fs.writeFileSync(path.join(config.dir, "results.json"), JSON.stringify(all, null, 2) + "\n");
    const notesPath = config.notesPath ?? path.join(config.dir, "notes.md");
    writeReproductionMd({
      task: config.task,
      fixture,
      results: all,
      reportPath: config.reportPath ?? path.join(config.dir, "..", "reproduction.md"),
      notes: fs.existsSync(notesPath) ? fs.readFileSync(notesPath, "utf8") : undefined,
    });
    config.onUpdate?.(all);
  });

  return { cases, results };
}
