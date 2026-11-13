import type { DataContract } from "../contract";
import type { Harness, Run } from "../harness";
import type { CheckKind } from "../types";

export interface CheckContext<O = any, E = any> {
  contract: DataContract<E>;
  harness: Harness<O, E>;
}

/**
 * One check of one option. It reads the resolved option from the run (`r.eff`, `r.effP`) and asserts
 * that it took effect in the simulated rows or in the built timeline. Used by level 1 (one value)
 * and level 2 (a whole study configuration). Assertions are jest's `expect`.
 */
export interface Check<O = any, E = any> {
  kind: CheckKind | ((sub: string) => CheckKind);
  /**
   * Contract entries the check relies on, as paths into the `DataContract`
   * (`"fields.block"`, `"parts.fixation"`). A `null` or missing entry means the package does not
   * provide it, and the runner reports that before running the check.
   */
  requires: string[];
  /** Contract entries that sharpen the check when present; it still runs without them. */
  optional?: string[];
  fn: (r: Run<O, E>, ctx: CheckContext<O, E>) => void | Promise<void>;
}

export type CheckSet<O = any, E = any> = Record<string, Check<O, E>>;

export function lookup(obj: any, path: string): unknown {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/** The `requires` entries the contract does not provide. */
export function missingContract(check: Check, contract: DataContract): string[] {
  return check.requires.filter((p) => {
    const v = lookup(contract, p);
    return v === null || v === undefined;
  });
}

/** A check that runs `base` and then `extra` (a package's additional assertions on a shared option). */
export function extendCheck<O, E>(
  base: Check<O, E>,
  extra: Pick<Check<O, E>, "fn"> & Partial<Pick<Check<O, E>, "requires" | "optional">>
): Check<O, E> {
  return {
    kind: base.kind,
    requires: [...base.requires, ...(extra.requires ?? [])],
    optional: [...(base.optional ?? []), ...(extra.optional ?? [])],
    fn: async (r, ctx) => {
      await base.fn(r, ctx);
      await extra.fn(r, ctx);
    },
  };
}
