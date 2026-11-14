/**
 * Adapter kit. A package's adapter turns the fixture's typed values into its own options. The
 * values come from the generated spec; the package writes the retyping table by hand (the spec
 * records some values as free text or under role keys). Every entry is either an options fragment
 * or a classified gap. Nothing is parsed from prose.
 */
import type { GapClass } from "./types";

export type Adapted<O = any> = { opts: O; companions?: O } | { gap: GapClass; reason: string };

export const isGap = (a: Adapted): a is { gap: GapClass; reason: string } => "gap" in a;

export const gap = (g: GapClass, reason: string): { gap: GapClass; reason: string } => ({
  gap: g,
  reason,
});

/**
 * An option fragment. `companions` are settings the value needs to be observable (feedback on for a
 * feedback duration, a cue form for a cue interval); explicit settings override them.
 */
export const ok = <O>(opts: O, companions?: O): Adapted<O> => ({ opts, companions });

export interface ConfigEntry<O = any> {
  key: string;
  adapted: Adapted<O>;
}

export interface AdapterKitConfig {
  /** options that hold maps; fragments for them are merged key by key (recursively) */
  mapOptions: string[];
  /**
   * A companion is dropped when this returns true (e.g. a companion `condition_set` when the
   * explicit settings already give `condition_proportions`). Companions for keys the explicit
   * settings give are always dropped, except for map options, which merge.
   */
  dropCompanion?: (key: string, explicit: Record<string, any>) => boolean;
}

const isPlain = (v: unknown): v is Record<string, any> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function deepMerge(a: any, b: any): any {
  if (!isPlain(a) || !isPlain(b)) return b;
  const out: any = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in a ? deepMerge(a[k], v) : v;
  return out;
}

export function createAdapterKit<O extends Record<string, any> = any>(cfg: AdapterKitConfig) {
  /** Merge option fragments; map options merge recursively. Later fragments win. */
  function mergeOptions(...parts: O[]): O {
    const out: any = {};
    for (const p of parts) {
      for (const [k, v] of Object.entries(p)) {
        out[k] = cfg.mapOptions.includes(k) && k in out ? deepMerge(out[k], v) : v;
      }
    }
    return out;
  }

  const primaries = (entries: Adapted<O>[]) =>
    entries.filter((e): e is { opts: O; companions?: O } => !isGap(e));

  /** Combine adapted entries: companions first (weakest), then the explicit settings in order. */
  function combine(entries: Adapted<O>[]): O {
    const ps = primaries(entries);
    const explicit = mergeOptions(...ps.map((e) => e.opts));
    const comps: O[] = [];
    for (const e of ps) {
      if (!e.companions) continue;
      const c: any = { ...e.companions };
      for (const k of Object.keys(c)) {
        if (cfg.dropCompanion?.(k, explicit)) delete c[k];
        else if (!cfg.mapOptions.includes(k) && k in explicit) delete c[k];
      }
      comps.push(c);
    }
    return mergeOptions(...comps, explicit);
  }

  /** Paths (`option`, or `option.key` for map options) that `combine` added beyond what the entries state. */
  function assumedSettings(entries: Adapted<O>[]): string[] {
    const explicit: any = mergeOptions(...primaries(entries).map((e) => e.opts));
    const full: any = combine(entries);
    const out: string[] = [];
    for (const [k, v] of Object.entries(full)) {
      if (cfg.mapOptions.includes(k) && isPlain(v) && k !== "practice") {
        for (const sub of Object.keys(v)) {
          if (!explicit[k] || !(sub in explicit[k])) out.push(`${k}.${sub}`);
        }
      } else if (!(k in explicit)) out.push(k);
    }
    return out;
  }

  return { mergeOptions, combine, assumedSettings };
}

/** The adapter a package hands to `defineReproduction`. */
export interface ReproductionAdapter<O = any> {
  /** Retype one observed value (option, component sub-key, typed value, phase). */
  adapt: (option: string, sub: string, value: any, phase?: string | null) => Adapted<O>;
  /** Retype a whole study configuration (dotted keys such as `stimulus_set.flanker`). */
  adaptConfig: (options: Record<string, any>) => ConfigEntry<O>[];
  combine: (entries: Adapted<O>[]) => O;
  assumedSettings: (entries: Adapted<O>[]) => string[];
  /** Canonical sub-key of an option's component, from the fixture's `variation`. Default: `main`. */
  subFromVariation?: (option: string, variation: string) => string;
}
