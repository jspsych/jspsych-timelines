// Prebuild step. For each package listed in docs-packages.json:
//   1. builds the package from the monorepo (so previews show the PR's code, not npm's);
//   2. copies dist/index.browser.js -> static/bundles/<task>/index.browser.js;
//   3. generates src/schemas/<task>.schema.json from the exported <Task>Options type,
//      then merges optional packages/<task>/docs-meta/options.meta.json.
// Pass --skip-build to reuse existing dist/ folders. Pass task names to limit the run.
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createGenerator } from "ts-json-schema-generator";

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, "..");
const repo = resolve(site, "..");
const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const only = args.filter((a) => !a.startsWith("--"));

const pascal = (s) =>
  s
    .split("-")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("");
const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);

/** Deep-merge `src` into `dst`; arrays and scalars in `src` replace. */
export function deepMerge(dst, src) {
  const out = { ...dst };
  for (const [k, v] of Object.entries(src)) {
    out[k] = isObject(v) && isObject(out[k]) ? deepMerge(out[k], v) : v;
  }
  return out;
}

/**
 * Doc comments follow PACKAGE-STANDARD §2: "Text (default: X)". Turn the trailing
 * "(default: X)" into a schema `default` when the generator didn't get an @default tag.
 */
function liftDefault(prop) {
  if (typeof prop.description !== "string") return;
  // the last "(default: ...)" running to the end; the value may itself contain parentheses
  const d = prop.description.trimEnd();
  const at = d.lastIndexOf("(default:");
  if (at < 0 || !d.endsWith(")")) return;
  prop.description = d.slice(0, at).trim();
  const text = d.slice(at + "(default:".length, -1).trim();
  if (prop.default !== undefined) return;
  // "value — source": keep the source out of the value
  const raw = text.split(/\s+—\s+/)[0].trim();
  // a code default (a function such as utils.deadlines.meanPlusSd(2.5)) is shown as written
  if (/^[A-Za-z_$][\w$.]*\(.*\)$/.test(raw)) {
    prop["x-jspsych"] = { ...(prop["x-jspsych"] ?? {}), defaultCode: raw };
    return;
  }
  try {
    prop.default = JSON.parse(raw);
  } catch {
    if (/^".*"$|^'.*'$/.test(raw)) prop.default = raw.slice(1, -1);
    else if (/^-?[\d.]+\s*\w*$/.test(raw)) prop.default = parseFloat(raw);
  }
}

/**
 * Object options typed as `Partial<typeof defaults>` (the `text` option) come out as a huge
 * object of string literals and function types. A form can't edit functions and the literals are
 * defaults, not constraints, so reduce them to a string map and keep the key lists as
 * `x-keys` / `x-function-keys` for the docs page.
 */
function simplifyObjectProp(prop) {
  if (prop.type !== "object" || !isObject(prop.properties)) return;
  const entries = Object.entries(prop.properties);
  if (!entries.length || !entries.every(([, v]) => v.type === "string" || v.$comment)) return;
  prop["x-keys"] = entries.filter(([, v]) => v.type === "string").map(([k]) => k);
  prop["x-function-keys"] = entries.filter(([, v]) => v.type !== "string").map(([k]) => k);
  prop.additionalProperties = { type: "string" };
  prop.default = {};
  delete prop.properties;
}

/** Move an `@acceptsFunction` tag to `x-jspsych.function` (the signature, or true). */
function markFunctionOption(prop) {
  if (!("acceptsFunction" in prop)) return;
  const sig = typeof prop.acceptsFunction === "string" ? prop.acceptsFunction.trim() : "";
  prop["x-jspsych"] = { ...(prop["x-jspsych"] ?? {}), function: sig || true };
  delete prop.acceptsFunction;
  // a callable interface (a rule with `label` / `explain` properties) survives "hide" as an object of just
  // those properties: it is the function, not a value a form could edit
  const alts = prop.anyOf ?? prop.oneOf;
  if (Array.isArray(alts)) {
    const kept = alts.filter(
      (b) =>
        !(
          b.type === "object" &&
          isObject(b.properties) &&
          Object.keys(b.properties).every((k) => k === "label" || k === "explain")
        )
    );
    if (prop.anyOf) prop.anyOf = kept;
    else prop.oneOf = kept;
  }
}

export function generateSchema(task, optionsType) {
  const pkgDir = join(repo, "packages", task);
  const generator = createGenerator({
    path: join(pkgDir, "src/index.ts"),
    tsconfig: join(pkgDir, "tsconfig.json"),
    type: optionsType,
    expose: "none",
    topRef: false,
    skipTypeCheck: true,
    additionalProperties: false,
    jsDoc: "extended",
    // function types (rule options, text functions) can't be edited in a form; hiding them also keeps the
    // generator out of their parameter types (the JsPsych class in a rule's context makes it throw)
    functions: "hide",
    // `@acceptsFunction <signature>` on an option says it also takes a function (PACKAGE-STANDARD §2a)
    extraTags: ["acceptsFunction"],
  });
  const schema = JSON.parse(JSON.stringify(generator.createSchema(optionsType)));
  for (const prop of Object.values(schema.properties ?? {})) {
    markFunctionOption(prop);
    simplifyObjectProp(prop);
    liftDefault(prop);
  }
  return schema;
}

/**
 * The package's DEFAULT_OPTIONS is the source of truth for defaults (doc comments are prose and
 * may not parse). Load the built CommonJS entry with a minimal `window` stub (jsPsych touches
 * `window` at import) and set `default` on every schema property it covers.
 */
export function applyPackageDefaults(schema, pkgDir) {
  const entry = join(pkgDir, "dist/index.cjs");
  if (!existsSync(entry)) return 0;
  globalThis.window = globalThis.window || {};
  const mod = createRequire(import.meta.url)(entry);
  const defaults = mod?.utils?.constants?.DEFAULT_OPTIONS;
  if (!isObject(defaults)) return 0;
  let n = 0;
  for (const [name, value] of Object.entries(defaults)) {
    if (name === "text" || !schema.properties?.[name] || typeof value === "function") continue;
    const prop = schema.properties[name];
    prop.default = value;
    // Map options keyed by task terms (Record<string, T>) can come out as `additionalProperties: false`
    // with no listed properties, which would reject every key: infer the value type from the default.
    if (
      isObject(value) &&
      prop.type === "object" &&
      !isObject(prop.properties) &&
      prop.additionalProperties === false
    ) {
      const kinds = new Set(
        Object.values(value).map((v) =>
          v === null ? "null" : Array.isArray(v) ? "array" : typeof v
        )
      );
      prop.additionalProperties =
        kinds.size === 1 && ["number", "string", "boolean"].includes([...kinds][0])
          ? { type: [...kinds][0] }
          : true;
    }
    n++;
  }
  return n;
}

/**
 * Bundled stimulus sets (PACKAGE-STANDARD §2a): a value exported under `utils.stimuli` is data, too big for a form
 * and the URL, so options name it with a `{"$util": "stimuli.<name>"}` reference that the docs theme resolves.
 * Where a default (top level, or one level down in a bundle such as `stimulus_set.items`) is one of these exports,
 * the default becomes its reference and the schema becomes an enum of all the bundled sets' references (the form
 * shows a select; code can still pass a researcher's own set, which the description says).
 */
export function applyUtilRefs(schema, pkgDir) {
  const entry = join(pkgDir, "dist/index.cjs");
  if (!existsSync(entry)) return 0;
  globalThis.window = globalThis.window || {};
  const mod = createRequire(import.meta.url)(entry);
  const sets = mod?.utils?.stimuli;
  if (!isObject(sets)) return 0;
  const refs = Object.entries(sets)
    .filter(([, v]) => isObject(v) && Array.isArray(v.items))
    .map(([k, v]) => ({ ref: { $util: `stimuli.${k}` }, value: v }));
  const refOf = (v) => refs.find((r) => r.value === v)?.ref;
  const defaults = mod?.utils?.constants?.DEFAULT_OPTIONS ?? {};
  let n = 0;
  const rewrite = (prop, def) => {
    const ref = refOf(def);
    if (!ref) return false;
    for (const k of [
      "anyOf",
      "oneOf",
      "type",
      "properties",
      "items",
      "required",
      "additionalProperties",
      "$ref",
    ])
      delete prop[k];
    prop.enum = refs.map((r) => r.ref);
    prop.default = ref;
    prop["x-jspsych"] = { ...(prop["x-jspsych"] ?? {}), utilRefs: true };
    n++;
    return true;
  };
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    const def = defaults[name];
    if (rewrite(prop, def)) continue;
    if (isObject(def) && isObject(prop.properties)) {
      let changed = false;
      for (const [sub, subProp] of Object.entries(prop.properties))
        changed = rewrite(subProp, def[sub]) || changed;
      if (changed && isObject(prop.default)) {
        prop.default = Object.fromEntries(
          Object.entries(prop.default).map(([k, v]) => [k, refOf(def[k]) ?? v])
        );
      }
    }
  }
  return n;
}

export function mergeMeta(schema, meta) {
  const out = { ...schema, properties: { ...schema.properties } };
  for (const [name, extra] of Object.entries(meta.properties ?? {})) {
    if (!out.properties[name]) {
      console.warn(`  warning: options.meta.json names unknown option "${name}"`);
      continue;
    }
    // Only the meta's `x-jspsych` object is merged (deep) into the generated property.
    out.properties[name] = deepMerge(out.properties[name], {
      "x-jspsych": extra?.["x-jspsych"] ?? {},
    });
  }
  if (meta["x-jspsych-spec"]) out["x-jspsych-spec"] = meta["x-jspsych-spec"]; // provenance, passed through
  if (meta["x-jspsych-presets"]) out["x-jspsych-presets"] = meta["x-jspsych-presets"]; // replace
  return out;
}

function globalNameOf(pkgJson, pkgDir) {
  // Standard packages (§10) set it in tsup.config.ts via makeTimelineConfig("..."); older ones pass --global-name.
  const tsupConfig = join(pkgDir, "tsup.config.ts");
  if (existsSync(tsupConfig)) {
    const c = /makeTimelineConfig\(\s*["'`]([^"'`]+)["'`]/.exec(readFileSync(tsupConfig, "utf8"));
    if (c) return c[1];
  }
  const m = /--global-name\s+(\S+)/.exec(pkgJson.scripts?.build ?? "");
  if (!m) throw new Error(`${pkgJson.name}: no global name in tsup.config.ts or the build script`);
  return m[1];
}

const { packages } = JSON.parse(readFileSync(join(site, "docs-packages.json"), "utf8"));
const manifest = {};

for (const entry of packages) {
  const { task } = entry;
  if (only.length && !only.includes(task)) continue;
  const pkgDir = join(repo, "packages", task);
  const pkgJson = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  console.log(`[${task}]`);

  if (!skipBuild) {
    console.log("  building package");
    execSync("npm run build", { cwd: pkgDir, stdio: "inherit" });
  }
  const bundleSrc = join(pkgDir, "dist/index.browser.js");
  if (!existsSync(bundleSrc)) throw new Error(`${bundleSrc} missing (build failed?)`);
  const bundleDir = join(site, "static/bundles", task);
  mkdirSync(bundleDir, { recursive: true });
  copyFileSync(bundleSrc, join(bundleDir, "index.browser.js"));

  const optionsType = entry.optionsType ?? `${pascal(task)}Options`;
  let schema = generateSchema(task, optionsType);
  const nDefaults = applyPackageDefaults(schema, pkgDir);
  console.log(`  defaults from DEFAULT_OPTIONS: ${nDefaults}`);
  const nRefs = applyUtilRefs(schema, pkgDir);
  if (nRefs) console.log(`  stimulus-set options as $util references: ${nRefs}`);
  const metaPath = join(pkgDir, "docs-meta/options.meta.json");
  if (existsSync(metaPath)) {
    schema = mergeMeta(schema, JSON.parse(readFileSync(metaPath, "utf8")));
    console.log("  merged docs-meta/options.meta.json");
  }
  mkdirSync(join(site, "src/schemas"), { recursive: true });
  writeFileSync(
    join(site, "src/schemas", `${task}.schema.json`),
    JSON.stringify(schema, null, 2) + "\n"
  );
  manifest[task] = {
    globalName: entry.globalName ?? globalNameOf(pkgJson, pkgDir),
    version: pkgJson.version,
    optionsType,
  };
  console.log(`  ${Object.keys(schema.properties ?? {}).length} options`);
}

if (!only.length) {
  mkdirSync(join(site, "src/schemas"), { recursive: true });
  writeFileSync(join(site, "src/schemas/manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}
