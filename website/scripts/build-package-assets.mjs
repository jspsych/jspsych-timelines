// Prebuild step. For each package listed in docs-packages.json:
//   1. builds the package from the monorepo (so previews show the PR's code, not npm's);
//   2. copies dist/index.browser.js -> static/bundles/<task>/index.browser.js;
//   3. generates src/schemas/<task>.schema.json from the exported <Task>Options type,
//      then merges optional packages/<task>/docs-meta/options.meta.json.
// Pass --skip-build to reuse existing dist/ folders. Pass task names to limit the run.
import {execSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createGenerator} from 'ts-json-schema-generator';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const repo = resolve(site, '..');
const args = process.argv.slice(2);
const skipBuild = args.includes('--skip-build');
const only = args.filter((a) => !a.startsWith('--'));

const pascal = (s) => s.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** Deep-merge `src` into `dst`; arrays and scalars in `src` replace. */
export function deepMerge(dst, src) {
  const out = {...dst};
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
  if (typeof prop.description !== 'string') return;
  const m = prop.description.match(/\s*\(default:\s*([^)]*)\)\s*$/);
  if (!m) return;
  prop.description = prop.description.slice(0, m.index).trim();
  if (prop.default !== undefined) return;
  const raw = m[1].trim();
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
  if (prop.type !== 'object' || !isObject(prop.properties)) return;
  const entries = Object.entries(prop.properties);
  if (!entries.length || !entries.every(([, v]) => v.type === 'string' || v.$comment)) return;
  prop['x-keys'] = entries.filter(([, v]) => v.type === 'string').map(([k]) => k);
  prop['x-function-keys'] = entries.filter(([, v]) => v.type !== 'string').map(([k]) => k);
  prop.additionalProperties = {type: 'string'};
  prop.default = {};
  delete prop.properties;
}

export function generateSchema(task, optionsType) {
  const pkgDir = join(repo, 'packages', task);
  const generator = createGenerator({
    path: join(pkgDir, 'src/index.ts'),
    tsconfig: join(pkgDir, 'tsconfig.json'),
    type: optionsType,
    expose: 'none',
    topRef: false,
    skipTypeCheck: true,
    additionalProperties: false,
    jsDoc: 'extended',
  });
  const schema = JSON.parse(JSON.stringify(generator.createSchema(optionsType)));
  for (const prop of Object.values(schema.properties ?? {})) {
    simplifyObjectProp(prop);
    liftDefault(prop);
  }
  return schema;
}

export function mergeMeta(schema, meta) {
  const out = {...schema, properties: {...schema.properties}};
  for (const [name, extra] of Object.entries(meta.properties ?? {})) {
    if (!out.properties[name]) {
      console.warn(`  warning: options.meta.json names unknown option "${name}"`);
      continue;
    }
    // Only the meta's `x-jspsych` object is merged (deep) into the generated property.
    out.properties[name] = deepMerge(out.properties[name], {'x-jspsych': extra?.['x-jspsych'] ?? {}});
  }
  if (meta['x-jspsych-spec']) out['x-jspsych-spec'] = meta['x-jspsych-spec']; // provenance, passed through
  if (meta['x-jspsych-presets']) out['x-jspsych-presets'] = meta['x-jspsych-presets']; // replace
  return out;
}

function globalNameOf(pkgJson) {
  const m = /--global-name\s+(\S+)/.exec(pkgJson.scripts?.build ?? '');
  if (!m) throw new Error(`${pkgJson.name}: no --global-name in build script`);
  return m[1];
}

const {packages} = JSON.parse(readFileSync(join(site, 'docs-packages.json'), 'utf8'));
const manifest = {};

for (const entry of packages) {
  const {task} = entry;
  if (only.length && !only.includes(task)) continue;
  const pkgDir = join(repo, 'packages', task);
  const pkgJson = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  console.log(`[${task}]`);

  if (!skipBuild) {
    console.log('  building package');
    execSync('npm run build', {cwd: pkgDir, stdio: 'inherit'});
  }
  const bundleSrc = join(pkgDir, 'dist/index.browser.js');
  if (!existsSync(bundleSrc)) throw new Error(`${bundleSrc} missing (build failed?)`);
  const bundleDir = join(site, 'static/bundles', task);
  mkdirSync(bundleDir, {recursive: true});
  copyFileSync(bundleSrc, join(bundleDir, 'index.browser.js'));

  const optionsType = entry.optionsType ?? `${pascal(task)}Options`;
  let schema = generateSchema(task, optionsType);
  const metaPath = join(pkgDir, 'docs-meta/options.meta.json');
  if (existsSync(metaPath)) {
    schema = mergeMeta(schema, JSON.parse(readFileSync(metaPath, 'utf8')));
    console.log('  merged docs-meta/options.meta.json');
  }
  mkdirSync(join(site, 'src/schemas'), {recursive: true});
  writeFileSync(join(site, 'src/schemas', `${task}.schema.json`), JSON.stringify(schema, null, 2) + '\n');
  manifest[task] = {
    globalName: entry.globalName ?? globalNameOf(pkgJson),
    version: pkgJson.version,
    optionsType,
  };
  console.log(`  ${Object.keys(schema.properties ?? {}).length} options`);
}

if (!only.length) {
  mkdirSync(join(site, 'src/schemas'), {recursive: true});
  writeFileSync(join(site, 'src/schemas/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
}
