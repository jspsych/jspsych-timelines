#!/usr/bin/env node

/**
 * Generate a package's committed reproduction fixture from a task's generated spec.
 *
 *   node scripts/fixture-from-spec.mjs <spec-dir> <out.json>
 *   node scripts/fixture-from-spec.mjs ../../../jspsych-timelines-paper/task-discovery/specs/flanker \
 *        ../flanker/reproduction/spec-observed.json
 *
 * <spec-dir> holds `spec.yaml` (and, if present, `translations.yaml`). The specs live in a private
 * repository, so the package commits the output; this script is the only thing that reads the
 * private path. The shape of the output is `Fixture` in `src/fixture.ts`.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

import YAML from "yaml";

const [specDirArg, outArg] = process.argv.slice(2);
if (!specDirArg || !outArg) {
  console.error("usage: fixture-from-spec.mjs <spec-dir> <out.json>");
  process.exit(2);
}
const specDir = resolve(specDirArg);
const specFile = join(specDir, "spec.yaml");
if (!existsSync(specFile)) {
  console.error(`no spec.yaml in ${specDir}`);
  process.exit(2);
}

// merge keys (<<) and anchors appear in generated specs
const load = (file) => YAML.parse(readFileSync(file, "utf8"), { merge: true });
const spec = load(specFile);

const fixture = {
  spec: `specs/${spec.task ?? basename(specDir)}/spec.yaml (jspsych-timelines-paper, vocabulary ${
    spec.vocabulary
  })`,
  options: spec.options.map((o) => ({
    name: o.name,
    default: o.default,
    components: (o.components ?? []).map((c) => ({
      variation: c.variation,
      role: c.role ?? null,
      phase: c.phase ?? null,
      field: c.field ?? null,
      observed: (c.observed ?? []).map((ob) => ({
        source: ob.source,
        raw: ob.raw,
        value: ob.value ?? null,
        ok: !!ob.ok,
        note: ob.translation?.note ?? null,
      })),
    })),
  })),
  study_configurations: (spec.study_configurations ?? []).map((s) => ({
    source: s.source,
    citation: s.citation,
    doi: s.doi ?? null,
    source_type: s.source_type,
    setting: s.setting ?? null,
    n_options: s.n_options,
    fully_typed: !!s.fully_typed,
    options: s.options,
  })),
  defaults: spec.defaults?.anchor ?? {},
};

const translationsFile = join(specDir, "translations.yaml");
if (existsSync(translationsFile)) {
  const t = load(translationsFile);
  fixture.translations = (t.entries ?? []).map((e) => ({
    variation: e.variation,
    raw: e.raw,
    as: e.as ?? null,
    confidence: e.confidence ?? null,
    flag: !!e.flag,
    note: e.note ?? null,
  }));
}

writeFileSync(resolve(outArg), JSON.stringify(fixture, null, 1) + "\n");
const typed = fixture.options
  .flatMap((o) => o.components.flatMap((c) => c.observed))
  .filter((x) => x.ok).length;
const total = fixture.options.flatMap((o) => o.components.flatMap((c) => c.observed)).length;
console.log(
  `${outArg}: ${fixture.options.length} options, ${typed}/${total} observed values typed, ` +
    `${fixture.study_configurations.length} study configurations ` +
    `(${fixture.study_configurations.filter((s) => s.fully_typed).length} fully typed)`
);
