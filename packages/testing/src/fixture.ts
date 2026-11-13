/**
 * The reproduction fixture: what the literature varied for one task, committed with the package as
 * `reproduction/spec-observed.json`. It is generated from the task's `spec.yaml` (and
 * `translations.yaml`) by `scripts/fixture-from-spec.mjs`, so packages do not hand-copy it.
 *
 * The specs live in a private repository, so each package keeps a committed copy of the part it
 * needs. This file defines its shape and turns it into the level 1 cases.
 */

/** One value a source used for an option, with the value typed by the spec. */
export interface ObservedValue {
  /** study or implementation id, e.g. `S019` */
  source: string;
  /** the value as the dossier reports it */
  raw: unknown;
  /** the typed value in the vocabulary's terms; `null` is a typed value (absent) when `ok` is true */
  value: unknown;
  /** true if the spec could type the value; false values are counted but not attempted */
  ok: boolean;
  /** the translator's note, or why the value stayed untyped */
  note: string | null;
}

/** One dossier variation that feeds an option (an option can combine several: roles, phases, parts). */
export interface FixtureComponent {
  variation: string;
  role: string | null;
  phase: string | null;
  /** for bundle options (`adaptive.<field>`) */
  field: string | null;
  observed: ObservedValue[];
}

export interface FixtureOption {
  /** vocabulary name for shared options, the dossier's name for task-specific ones */
  name: string;
  default: { value: unknown; basis: string; source?: string; raw?: unknown; [k: string]: unknown };
  components: FixtureComponent[];
}

/** The option values one study or reference implementation reports, in option names. */
export interface StudyConfiguration {
  source: string;
  citation: string;
  doi: string | null;
  source_type: string;
  setting: string | null;
  n_options: number;
  /** every value in `options` is typed: only these are level 2 cases */
  fully_typed: boolean;
  /** `option` or `option.role` (component role) or `practice.option` -> typed value */
  options: Record<string, any>;
}

export interface TranslationEntry {
  variation: string;
  raw: unknown;
  /** option name (or `practice.<option>`) -> typed value; `null`: no faithful typed form */
  as: Record<string, any> | null;
  confidence: string;
  flag: boolean;
  note: string | null;
}

export interface Fixture {
  /** where it came from: spec path, vocabulary version */
  spec: string;
  options: FixtureOption[];
  study_configurations: StudyConfiguration[];
  /** the D5 anchor: the study whose values are the defaults */
  defaults: Record<string, any>;
  translations?: TranslationEntry[];
}

/** A level 1 case: one distinct typed value of one component of one option. */
export interface Case {
  option: string;
  /** canonical sub-key of the component (`main` unless the option combines several) */
  sub: string;
  variation: string;
  phase: string | null;
  value: any;
  /** the studies that used this value */
  sources: string[];
  /** a `null` that means "no limit" for an option listed in `addNullOptions` */
  labelledAddition: boolean;
}

export interface CaseOptions {
  /** options whose typed `null` means "until response / untimed" and is added as a case */
  addNullOptions?: string[];
  /** variations of those options whose `null` is not such an absence (e.g. a rule name) */
  nullExcludedVariations?: string[];
  subFromVariation?: (option: string, variation: string) => string;
}

export interface Cases {
  cases: Case[];
  observedTotal: number;
  typedTotal: number;
}

/**
 * The distinct typed values to check at level 1. A typed `null` is skipped (it states absence,
 * which is the default), except for the `addNullOptions`, where `null` means untimed.
 */
export function collectCases(fixture: Fixture, opts: CaseOptions = {}): Cases {
  const addNull = opts.addNullOptions ?? [];
  const excluded = opts.nullExcludedVariations ?? [];
  const sub = opts.subFromVariation ?? (() => "main");
  const cases: Case[] = [];
  let observedTotal = 0;
  let typedTotal = 0;
  for (const o of fixture.options) {
    const seen = new Map<string, Case>();
    for (const c of o.components) {
      for (const ob of c.observed) {
        observedTotal++;
        if (ob.ok) typedTotal++;
        const keep = ob.ok && ob.value !== null;
        const addition =
          ob.ok && ob.value === null && addNull.includes(o.name) && !excluded.includes(c.variation);
        if (!keep && !addition) continue;
        const key = `${c.variation}|${JSON.stringify(ob.value)}`;
        const hit = seen.get(key);
        if (hit) hit.sources.push(ob.source);
        else {
          const k: Case = {
            option: o.name,
            sub: sub(o.name, c.variation),
            variation: c.variation,
            phase: c.phase,
            value: ob.value,
            sources: [ob.source],
            labelledAddition: addition,
          };
          seen.set(key, k);
          cases.push(k);
        }
      }
    }
  }
  return { cases, observedTotal, typedTotal };
}

/** The observed values the spec could not type (counted in the tallies, not attempted). */
export function untypedValues(fixture: Fixture) {
  const out: {
    option: string;
    variation: string;
    source: string;
    raw: unknown;
    note: string | null;
  }[] = [];
  for (const o of fixture.options)
    for (const c of o.components)
      for (const ob of c.observed)
        if (!ob.ok)
          out.push({
            option: o.name,
            variation: c.variation,
            source: ob.source,
            raw: ob.raw,
            note: ob.note,
          });
  return out;
}
