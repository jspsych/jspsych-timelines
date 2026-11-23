/**
 * Options are JSON wherever they leave code (site presets, the URL hash, the docs editor), so a value a package
 * exports under `utils` (a bundled stimulus set) is written there as a reference: `{"$util": "stimuli.words"}`.
 * The docs theme's runner resolves references against the bundle's `utils` before `createTimeline`; these two
 * functions do the same in Node, for writing presets and for testing them (PACKAGE-STANDARD §2a).
 */

export const UTIL_REF_KEY = "$util";

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  if (isPlainObject(a) && isPlainObject(b)) {
    const ka = Object.keys(a).filter((k) => a[k] !== undefined);
    const kb = Object.keys(b).filter((k) => b[k] !== undefined);
    return ka.length === kb.length && ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

/** Every non-function object or array exported under `utils`, with its dotted path ("stimuli.words"). */
export function utilExports(utils: Record<string, unknown>): { path: string; value: unknown }[] {
  const out: { path: string; value: unknown }[] = [];
  const walk = (v: unknown, path: string, depth: number) => {
    if (depth > 4 || typeof v !== "object" || v === null) return;
    if (path) out.push({ path, value: v });
    if (Array.isArray(v)) return;
    for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k, depth + 1);
  };
  walk(utils, "", 0);
  return out;
}

/**
 * Replace every value in `options` that is one of the given `utils` exports (the same object, or a deep-equal copy)
 * with a reference to it. Only exports under the `namespaces` are considered (default: "stimuli"), so a constant that
 * happens to equal an option value is not turned into a reference.
 */
export function toUtilRefs<T>(
  options: T,
  utils: Record<string, unknown>,
  namespaces = ["stimuli"]
): T {
  const candidates = utilExports(utils).filter(
    (e) => namespaces.some((n) => e.path.startsWith(`${n}.`)) && !Array.isArray(e.value)
  );
  const swap = (v: unknown): unknown => {
    if (typeof v !== "object" || v === null) return v;
    const hit =
      candidates.find((c) => c.value === v) ?? candidates.find((c) => deepEqual(c.value, v));
    if (hit) return { [UTIL_REF_KEY]: hit.path };
    if (Array.isArray(v)) return v.map(swap);
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)]));
  };
  return swap(options) as T;
}

/** Replace every `{"$util": "a.b"}` in `options` with `utils.a.b`; throw on a reference the package does not export. */
export function resolveUtilRefs<T>(options: T, utils: Record<string, unknown>): T {
  const resolve = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(resolve);
    if (!isPlainObject(v)) return v;
    const keys = Object.keys(v);
    if (keys.length === 1 && keys[0] === UTIL_REF_KEY && typeof v[UTIL_REF_KEY] === "string") {
      const path = v[UTIL_REF_KEY] as string;
      let target: unknown = utils;
      for (const k of path.split(".")) {
        target =
          isPlainObject(target) && Object.prototype.hasOwnProperty.call(target, k)
            ? target[k]
            : undefined;
      }
      if (target === undefined)
        throw new Error(`An option refers to utils.${path}, which this package does not export.`);
      return target;
    }
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x)]));
  };
  return resolve(options) as T;
}
