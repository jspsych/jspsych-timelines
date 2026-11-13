import type { Row } from "./types";

export interface RowFilter {
  task?: string;
  phase?: string;
  part?: string;
  block?: number;
  [field: string]: unknown;
}

/** Rows whose fields equal every given filter value (`undefined` filters are ignored). */
export function filterRows(rows: Row[], filter: RowFilter): Row[] {
  const entries = Object.entries(filter).filter(([, v]) => v !== undefined);
  return rows.filter((r) => entries.every(([k, v]) => r[k] === v));
}

export const distinct = <T>(xs: T[]): T[] => [...new Set(xs)];

/** Rows in the order they were recorded, grouped by `block`. */
export function byBlock(rows: Row[], field = "block"): Map<number, Row[]> {
  const out = new Map<number, Row[]>();
  for (const r of rows) {
    const b = r[field];
    if (!out.has(b)) out.set(b, []);
    out.get(b)!.push(r);
  }
  return out;
}

/** Flat list of trial parameter objects (nodes with a plugin `type`) in a built timeline. */
export function collectTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => collectTrials(t, out));
  else if (tl && tl.timeline) collectTrials(tl.timeline, out);
  else if (tl && tl.type) out.push(tl);
  return out;
}

/** The stimulus of a trial parameter object, evaluated if it is a function. */
export function evalStimulus(trial: any): string {
  return typeof trial.stimulus === "function" ? trial.stimulus() : trial.stimulus;
}
