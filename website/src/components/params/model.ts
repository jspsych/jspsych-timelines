/**
 * Model for the parameter reference (ParamsTable): turns a package's options schema
 * (scripts/build-package-assets.mjs) into display items, and filters them.
 */

type Json = unknown;

export type SchemaProp = {
  type?: string | string[];
  enum?: Json[];
  const?: Json;
  anyOf?: SchemaProp[];
  oneOf?: SchemaProp[];
  items?: SchemaProp;
  properties?: Record<string, SchemaProp>;
  additionalProperties?: boolean | SchemaProp;
  default?: Json;
  description?: string;
  "x-jspsych"?: {
    group?: string;
    unit?: string;
    advanced?: boolean;
    phaseOverridable?: boolean;
    absentValue?: Json;
    widget?: string;
    /** The option also takes a function (code only); the signature when the package gives one. */
    function?: string | boolean;
    /** A default that is code (a prebuilt rule), shown as written. */
    defaultCode?: string;
    evidence?: {
      observed?: { value: Json; typed?: boolean; source?: string }[];
      defaultSource?: string;
    };
  };
  "x-keys"?: string[];
  "x-function-keys"?: string[];
};

export type OptionsSchema = { properties?: Record<string, SchemaProp> };

export type ParamItem = {
  name: string;
  group: string;
  groupLabel: string;
  advanced: boolean;
  /** Short type, e.g. `ms | {min, max, step}` or `"random" | "shuffled_list"`. */
  type: string;
  /** Allowed values of an enum (for the details). */
  values: string[] | null;
  default: string;
  /** The full default, pretty-printed when it is an object. */
  defaultFull: string;
  /** First sentence of the description. */
  summary: string;
  description: string;
  phaseOverridable: boolean;
  /** What leaving the option out of the way means, e.g. `0 = doesn't happen`. */
  absent: string | null;
  defaultSource: string | null;
  /** Values seen in the literature, most common first. */
  observed: { value: string; count: number }[];
  observedTotal: number;
  sources: number;
  keys: string[] | null;
  functionKeys: string[] | null;
  /** Signature of the function the option also takes, or "" when unspecified; null if it takes none. */
  fn: string | null;
};

export const GROUPS: { id: string; label: string }[] = [
  { id: "timing", label: "Timing" },
  { id: "stimulus", label: "Stimulus" },
  { id: "design", label: "Design" },
  { id: "response", label: "Response" },
  { id: "procedure", label: "Procedure" },
  { id: "feedback", label: "Feedback" },
  { id: "instructions", label: "Instructions" },
];
const OTHER = { id: "other", label: "Other" };

const fmt = (v: Json): string =>
  v === undefined ? "—" : typeof v === "string" ? JSON.stringify(v) : JSON.stringify(v);

/** A compact one-line rendering of a value, for defaults and observed values. */
export function short(v: Json, max = 48): string {
  const s = fmt(v);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function typeOf(p: SchemaProp, depth = 0): string {
  const x = p["x-jspsych"];
  if (depth === 0 && x?.widget === "duration") {
    // the branches may be nested one level (a named DurationOrJitter type inside a wider union)
    const branches = (p.anyOf ?? p.oneOf ?? []).flatMap((b) => [b, ...(b.anyOf ?? b.oneOf ?? [])]);
    const nullable =
      [p.type ?? []].flat().includes("null") || branches.some((b) => [b.type ?? []].flat().includes("null"));
    const jitter = branches.some((b) => b.type === "object");
    return ["ms", jitter && "{min, max, step}", nullable && "null"].filter(Boolean).join(" | ");
  }
  if (p.const !== undefined) return fmt(p.const);
  if (p.enum) {
    return p.enum.length > 4 ? `${p.enum.length} values` : p.enum.map((v) => fmt(v)).join(" | ");
  }
  const alts = p.anyOf ?? p.oneOf;
  if (alts) return [...new Set(alts.map((a) => typeOf(a, depth + 1)))].join(" | ");
  const types = [p.type ?? []].flat();
  const parts = types.map((t) => {
    if (t === "array") return p.items ? `${typeOf(p.items, depth + 1)}[]` : "array";
    if (t === "object") {
      if (p.properties && depth < 1) {
        const ks = Object.keys(p.properties);
        return `{${ks.slice(0, 3).join(", ")}${ks.length > 3 ? ", …" : ""}}`;
      }
      return "map";
    }
    return t;
  });
  return parts.length ? parts.join(" | ") : "any";
}

function firstSentence(s: string): string {
  const m = s.match(/^(.+?[.;:])(\s|$)/);
  return (m ? m[1] : s).replace(/[;:]$/, ".");
}

function absentText(x: SchemaProp["x-jspsych"]): string | null {
  if (!x || !("absentValue" in x)) return null;
  if (x.absentValue === 0) return "0 = doesn’t happen";
  if (x.absentValue === null) return "null = no limit";
  if (x.absentValue === "none") return '"none" = off';
  return null;
}

const DEFAULT_SOURCES: Record<string, string> = {
  anchor: "the anchor configuration (PEBL flanker battery, S019)",
  fill: "the most common value in the literature (the anchor does not set it)",
  exception: "a documented change from the anchor (packages/flanker/DEFAULTS.md)",
};

export function itemsOf(schema: OptionsSchema): ParamItem[] {
  return Object.entries(schema.properties ?? {}).map(([name, p]) => {
    const x = p["x-jspsych"] ?? {};
    const g = GROUPS.find((gr) => gr.id === x.group) ?? OTHER;
    const observedRaw = (x.evidence?.observed ?? []).filter((o) => o.typed !== false);
    const counts = new Map<string, number>();
    for (const o of observedRaw)
      counts.set(short(o.value, 60), (counts.get(short(o.value, 60)) ?? 0) + 1);
    const description = p.description ?? "";
    return {
      name,
      group: g.id,
      groupLabel: g.label,
      advanced: x.advanced === true,
      type: x.function ? `${typeOf(p)} | function` : typeOf(p),
      values: p.enum ? p.enum.map((v) => fmt(v)) : null,
      default: x.defaultCode ?? short(p.default),
      defaultFull:
        x.defaultCode !== undefined
          ? x.defaultCode
          : p.default === undefined
          ? "—"
          : typeof p.default === "object" && p.default !== null
          ? JSON.stringify(p.default, null, 2)
          : JSON.stringify(p.default),
      summary: firstSentence(description),
      description,
      phaseOverridable: x.phaseOverridable === true,
      absent: absentText(x),
      // only the named bases are meaningful to readers; component-level bookkeeping is not shown
      defaultSource: DEFAULT_SOURCES[x.evidence?.defaultSource ?? ""] ?? null,
      observed: [...counts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      observedTotal: observedRaw.length,
      sources: new Set(observedRaw.map((o) => o.source)).size,
      keys: p["x-keys"] ?? null,
      functionKeys: p["x-function-keys"] ?? null,
      fn: x.function ? (typeof x.function === "string" ? x.function : "") : null,
    };
  });
}

export function groupsOf(items: ParamItem[]): { id: string; label: string; items: ParamItem[] }[] {
  return [...GROUPS, OTHER]
    .map((g) => ({ ...g, items: items.filter((i) => i.group === g.id) }))
    .filter((g) => g.items.length > 0);
}

/** Filter by a search query (name, type, description) and the advanced toggle. Search finds advanced options too. */
export function filterItems(items: ParamItem[], query: string, showAdvanced: boolean): ParamItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((i) => {
    if (!q) return showAdvanced || !i.advanced;
    return [i.name, i.name.replace(/_/g, " "), i.type, i.description, i.groupLabel]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

/** Render inline `code` spans in a description. */
export function inlineCode(s: string): (string | { code: string })[] {
  return s
    .split(/(`[^`]+`)/)
    .map((part) => (part.startsWith("`") ? { code: part.slice(1, -1) } : part));
}
