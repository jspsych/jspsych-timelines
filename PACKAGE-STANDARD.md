# Timeline Package Standard

This document defines what every package in `packages/` must look like. It exists so that timelines from this repository can be **composed** — a researcher should be able to drop five different tasks into one experiment and have them coexist without styling conflicts, data collisions, or surprises about reproducibility.

Anything marked **MUST** is required for a package to be published. **SHOULD** items are strong defaults; deviating is fine if the package documentation explains why.

The governing principle, from which several rules below follow: **if a capability is broadly useful, it belongs in jsPsych core, not here.** A timeline package should contain the task, and nothing that every task would want.

---

## 1. Package layout

Every package **MUST** have exactly this structure:

```
packages/<task-name>/
  package.json
  tsconfig.json
  tsup.config.ts
  jest.config.cjs
  README.md
  examples/
    index.html
  src/
    index.ts          # public API: createTimeline, timelineUnits, utils
    text.ts           # defaultText + TextConfig
    styles.css        # all styling, scoped (see §5)
    index.spec.ts     # tests
```

Additional `src/*.ts` modules (`constants.ts`, `trials.ts`, `scoring.ts`, `types.ts`) are encouraged once `index.ts` exceeds roughly 600 lines. `corsi-block` is the current example of a split layout.

**MUST NOT** include a `docs/` directory. Long-form documentation lives in the documentation site (§12), not in the package. The five existing per-package `docs/` directories (`bart`, `columbia-card`, `digit-span`, `go-nogo`, `spatial-nback`) are unlinked orphans at wildly different completeness — 51 to 390 lines — and are to be deleted, their content folded into the site.

`<task-name>` **MUST** be the kebab-case task name and **MUST** match the npm package name (`@jspsych-timelines/<task-name>`), the directory name, the documentation site page, and the `task` field written into the data (§4).

---

## 2. Public API

`src/index.ts` **MUST** export exactly these four things, and **SHOULD NOT** export anything else beyond types:

```ts
export function createTimeline(jsPsych: JsPsych, options: <Task>Options = {}): { timeline: any[] }
export const timelineUnits = { /* trial + block factories */ }
export const utils = { scoring, constants, text, /* task-specific helpers */ }
export type { TextConfig }
```

### `createTimeline`

The signature is `(jsPsych, options)` where `options` is a **single named interface with all-optional properties**, not inline destructured defaults.

```ts
export interface FlankerOptions {
  /** Number of test trials (default: 120) */
  n_test_trials?: number;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export function createTimeline(jsPsych: JsPsych, options: FlankerOptions = {}) { ... }
```

- The interface **MUST** be named `<Task>Options` and be exported.
- The parameter **MUST** be named `options` (not `config`).
- Option names **MUST** be snake_case, like jsPsych's own plugin parameters (`trial_duration`) and the data fields. Shared concepts **MUST** use the vocabulary name (§2a).
- Every property **MUST** be optional and **MUST** carry a doc comment stating its default. These comments are the source text for the site's parameter table.
- Defaults **MUST** live in an exported `DEFAULT_OPTIONS` object, not scattered in the signature.
- The return type **MUST NOT** be `any`.

`bart`, `go-nogo`, `columbia-card`, and `spatial-nback` still use destructured defaults, and `corsi-block` uses `config: CorsiBlockConfig` returning `any`; these should be converted.

### 2a. Options vocabulary

Options that mean the same thing in different tasks **MUST** have the same name, type and absent value in every package, so a researcher who learns one package has learned most of the others. The shared vocabulary is `vocabulary/vocabulary.yaml` (148 parameters, derived from the literature for 79 RDoC tasks). Its rules are in `vocabulary/RULES.md`. A task-specific option follows the same conventions under its own snake_case name.

- **Names.** Use the vocabulary's name when the option is one of its concepts, e.g. `response_window_ms`, `iti_ms`, `practice_trials`, `trial_feedback`, `condition_proportions`, `response_device`. Units are in the name (`_ms`), never in the value.
- **Durations can be jittered.** Every `_ms` option has vocabulary type `duration`, which is a `DurationSpec`:
  - either a number of milliseconds;
  - or `{ min, max, step? }`, sampled per trial, uniformly from `min`, `min + step`, … up to `max`, using `jsPsych.randomization` (§3). `step` defaults to 1 ms.

  The sampled value **MUST** be written into the trial's data (e.g. `fixation_duration: 734`), so analyses can use the actual duration. Absent values still follow the absence rule: `0` means it doesn't happen, and `null` means no limit. Lists of fixed levels (e.g. SOAs of 100, 300, 500 as conditions) are design factors, not jitter, and belong in a task-specific option.
- **Absence is a value, typed by meaning.** There are no on/off booleans like `show_fixation`.

  | Kind | Absent value | Example |
  |---|---|---|
  | Enum | `"none"` | `trial_feedback: "none"` |
  | Limit whose absence means "no limit" | `null` (as jsPsych's `trial_duration: null`) | `response_window_ms: null` |
  | Event whose absence means "doesn't happen" | `0` | `fixation_duration_ms: 0` |
  | Bundle switched off | `null` | `adaptive: null` |

  `undefined` (option not given) always means "use the default".
- **Phase overrides, not phase names.** There are no `practice_feedback` / `test_feedback` pairs. A package that has a practice phase **MUST** accept `practice?: Partial<<Task>Options>`, whose values override the main options during practice: `{ trial_feedback: "none", practice: { trial_feedback: "accuracy" } }`. `practice_trials` is a separate count, not a phase override. `practice` is therefore a reserved option name.
- **Task vocabulary goes in values, not names.** Options that cover several stimulus kinds or trial types take a map keyed by the task's own terms, not a cross-task role list: `stimulus_set: { cue: …, target: … }`, `condition_proportions: { stop: 0.25, go: 0.75 }`.
- **Bundle only what is configured as a unit.** An adaptive procedure is one `adaptive` option (`procedure`, `start_level`, `step_size`, `target_accuracy`, `bounds`, `discontinue_rule`), passed whole to the staircase helper. Settings that are changed one at a time stay flat: `trial_feedback`, `feedback_condition` and `feedback_duration_ms` are separate options.
- **Response = device + format.** `response_device` takes `keyboard`, `mouse`, `touch`, `microphone`, `eye_tracker` or `gamepad`. `response_format` takes `single_response`, `n_afc`, `rating`, `free_text`, `location` or `none`. Modality is not an option; it is implied by these two. What the participant judges (detection vs localization) changes the measure, so it is a `task_variant`, not a response option.
- **Defaults are evidence-based and documented.** Every option's doc comment states its default *and where it came from*: the anchor configuration (a cited study or reference implementation), the most common value in recent online studies, or a recorded human decision. The package's generated spec (`spec.yaml`) is the source.

### `timelineUnits`

A flat object of factory functions that build the individual pieces of the timeline, so that researchers can reassemble a variant task. Names **SHOULD** follow `create<Thing>` and cover at minimum the instruction, stimulus, and completion pieces.

### `utils`

**MUST** contain:

| Key         | Contents                                                                         |
| ----------- | -------------------------------------------------------------------------------- |
| `scoring`   | `{ calculateScores(data: DataCollection): ScoringResult, getSummary(data): ... }` |
| `constants` | `{ TASK_NAME, VERSION, DEFAULT_OPTIONS, ...task constants }`                      |
| `text`      | `{ defaultText }`                                                                |

Task-specific helpers (stimulus generators, sequence builders) go in additional namespaced keys (`utils.stimuli`, `utils.sequence`). The defaults object is `DEFAULT_OPTIONS` everywhere — not `DEFAULT_CONFIG`.

`calculateScores` **MUST** accept a `DataCollection` and **MUST** return a well-defined `ScoringResult` interface with a documented value for the empty-data case (`0` for counts, `null` for means — never `NaN`).

---

## 3. Use jsPsych core

Most of what these packages hand-roll already exists upstream. A helper duplicated across packages is a signal to reach for core, not to write it again.

### Randomness

**MUST** use `jsPsych.randomization.*` for every random draw. **MUST NOT** call `Math.random()`.

```ts
// no
const j = Math.floor(Math.random() * (i + 1));

// yes
const order = jsPsych.randomization.shuffle(conditions);
const isi = jsPsych.randomization.randomInt(400, 800);
```

Core provides `shuffle`, `shuffleNoRepeats`, `shuffleAlternateGroups`, `sampleWithReplacement`, `sampleWithoutReplacement`, `repeat`, `randomInt`, `sampleNormal`, `sampleExGaussian`, and more.

This is not stylistic. `jsPsych.randomization.setSeed()` seeds jsPsych's generator only; `Math.random()` ignores it. A timeline that reaches for `Math.random()` silently makes the whole experiment non-reproducible, including the parts contributed by other packages. There are currently 42 `Math.random()` call sites across 24 packages, including a byte-identical Fisher-Yates `shuffleArray` copy-pasted into 13 of them — every one of which is `jsPsych.randomization.shuffle`.

### Summary statistics

**MUST** use `DataColumn` methods rather than computing over `.values()` by hand. Core provides `mean()`, `median()`, `sd()`, `variance()`, `sum()`, `min()`, `max()`, `count()`, and `frequencies()`.

```ts
// no
const rts = trials.filter(t => t.correct).map(t => t.rt);
const meanRT = rts.reduce((a, b) => a + b, 0) / rts.length;

// yes
const meanRT = data
  .filter({ task: TASK_NAME, phase: "test", part: "response", correct: true })
  .select("rt")
  .mean();
```

A local `mean` helper appears in 12 packages. All of them are `DataColumn.mean()`.

### When core doesn't have it

If a helper is broadly useful and core lacks it, the norm is to **open an issue upstream**, not to add it here. If it is specialized enough that core is the wrong home, take it from an established library (§11).

---

## 4. Data schema

Composed batteries are only analyzable if every package tags its data compatibly. The required floor is deliberately small; above it, a common vocabulary is encouraged but not enforced.

### Required

Every trial a package adds **MUST** write:

| Field          | Type   | Value                                                      |
| -------------- | ------ | ---------------------------------------------------------- |
| `task`         | string | the package's `TASK_NAME`, identical to the directory name |
| `task_version` | string | the package version (§7)                                   |

The **scorable trial** — the one row per trial that carries the participant's response — **MUST** additionally be tagged:

```ts
data: {
  task: TASK_NAME,
  task_version: VERSION,
  phase: "practice" | "test",   // required values
  part: "response",             // required value
}
```

This is the contract that makes a battery-wide analysis a single filter:

```ts
data.filter({ phase: "test", part: "response" })
```

`part: "response"` names the row by what makes it scorable, which stays correct whether the task uses one combined trial (flanker, simon-task) or a separate presentation trial followed by a response trial (digit-span, operation-span, free-recall). Packages are currently split 25/15 between `"response"` and `"stimulus"`; the 15 need converting.

### Recommended

Other trials **SHOULD** draw their `part` value from this vocabulary where one fits:

`instruction`, `fixation`, `cue`, `stimulus`, `feedback`, `iti`, `transition`, `rest`, `completion`

Prefer `iti` over `isi` or `delay`; prefer `instruction` over `intro` or `announcement`. Tasks with genuinely novel trial types (`digit_presentation`, `math_feedback`, `round_summary`) **SHOULD** name them descriptively rather than forcing a poor fit.

Likewise `phase` **SHOULD** be one of `instructions`, `practice`, `test`, `completion`, plus `study` for tasks with a distinct encoding stage.

### Always

- The `TrialData` interface **MUST** accurately describe what the package writes. Today it is declared `"practice" | "test"` in most packages while the code writes `"instructions"` (49×), `"completion"` (21×), and `"debrief"`.
- Every `part` value a package uses **MUST** be documented on its site reference page (§12).
- Scoring functions **MUST** filter on `{ task: TASK_NAME, phase, part }` — never on `last(1)` or an unqualified filter, both of which pick up other packages' trials in a battery. `packages/flanker/src/index.ts:394` (`jsPsych.data.get().last(1)`) is the pattern to avoid.

---

## 5. Styling

**This is the rule that makes composition work, and the one most widely violated today.**

Every package injects its stylesheet into the same document (`import "./styles.css"` + `--inject-style`). Unscoped rules therefore apply to *every* task in the battery, and the last-loaded package wins.

### Required

1. Every trial **MUST** set `css_classes: [TASK_CLASS]` where `TASK_CLASS = "jspsych-timelines-<task-name>"`. jsPsych adds these classes to the display element for the duration of the trial and removes them afterwards, so they scope everything the plugin renders — including the button group.

2. Every selector in `styles.css` **MUST** be nested under that class.

```css
/* no — applies to every task in the battery */
.instructions { max-width: 600px; }
#jspsych-html-button-response-btngroup { position: fixed; bottom: 0; }

/* yes */
.jspsych-timelines-flanker .instructions { max-width: 600px; }
.jspsych-timelines-flanker #jspsych-html-button-response-btngroup { position: fixed; bottom: 0; }
```

3. A package **MUST NOT** restyle bare jsPsych framework selectors (`.jspsych-content`, `.jspsych-btn`, `.jspsych-display-element`, `#jspsych-html-button-response-btngroup`) outside its own scope class.

4. A package **MUST NOT** ship generic touch/mobile styling. That now lives upstream (§11).

5. A task with a centred stimulus **MUST** put it in a fixed-size stage anchored at the vertical centre of the display on **every** task screen (fixation, cue, stimulus, feedback, ITI, instruction and hint screens alike). jsPsych centres `.jspsych-content` as a whole, so extra text or a plugin button group below the stimulus would otherwise shift it. Anchor the stage independently of its siblings (e.g. `position: absolute; top: 50%; transform: translate(-50%, -50%)` inside a full-height content box, or a full-height grid with `minmax(0, 1fr) auto minmax(0, 1fr)` rows). Accompanying text and the response/continue button group go in a region below the stage that does not move it, scrolls if long, and keeps the buttons visible in a short (about 430 px) run area. The task colours (`stimulus_color`) paint the whole display, not a box around the stage. Verify with a browser check that records the stage's bounding rect on each screen type (and at a narrow and a wide viewport) and asserts the same centre (±1 px); keep a jsdom test that every stimulus screen uses the anchored wrapper.

### Why

Current selector overlap across the new packages:

| Selector           | Packages defining it |
| ------------------ | -------------------- |
| `.instructions`    | 26                   |
| `.jspsych-content` | 23                   |
| `.feedback`        | 22                   |
| `.jspsych-btn`     | 12                   |
| `.trial-content`   | 10                   |

Concretely, `packages/simon-task/src/styles.css` sets, outside any media query:

```css
#jspsych-html-button-response-btngroup:has(.jspsych-btn + .jspsych-btn) {
  display: flex; justify-content: space-between; width: 80vw; max-width: 600px;
}
```

Load `simon-task` and `flanker` in the same experiment and flanker's buttons get spread to 80vw.

---

## 6. Text and translation

`src/text.ts` **MUST** export `defaultText` and a `TextConfig` type. `createTimeline` **MUST** accept `text?: Partial<TextConfig>` and merge it over the defaults.

Declare the interface explicitly and annotate the constant:

```ts
export interface TextConfig {
  instruction_intro: string;
  block_complete: (blockNumber: number) => string;
}

export const defaultText: TextConfig = { ... };
```

not `export type TextConfig = typeof defaultText`. The explicit form makes the translatable surface a deliberate, reviewable declaration and catches an incomplete `defaultText` at compile time. Both forms are currently in use, roughly half and half.

### Interpolated values

Values that interpolate runtime data **are functions**, not placeholder strings. This keeps full expressive power for pluralization and conditional phrasing, and keeps the types checkable.

Because a translator must reproduce a call signature, the signature is part of the public API and **MUST** be disciplined:

- Parameters **MUST** be named descriptively, and the function **MUST** carry a doc comment naming each one.
- A function **SHOULD NOT** take more than three parameters. Beyond that, take a single named object so translators are not tracking positional order.

```ts
/**
 * @param leftButton  label of the left response button
 * @param rightButton label of the right response button
 */
instruction_buttons: (leftButton: string, rightButton: string) => `...`,

// More than three values — use an object:
result_summary: (r: { accuracy: number; meanRT: number; effect: number }) => `...`,
```

`packages/flanker/src/text.ts` currently has a four-positional-parameter function (`instruction_response`) that should be converted to the object form.

Keys **SHOULD** be `snake_case` and grouped by section with comments.

---

## 6a. Instructions

Instructions **SHOULD** be interactive and use the task's real stimuli wherever that is reasonable. Participants learn a task far better by doing it than by reading about it.

- **Default.** `instruction_demonstration` defaults to `"interactive"`. This is a deliberate exception to the evidence-anchored defaults of §2a, since most published implementations use text-only instructions. The other values (`"none"`, `"examples"`, …) stay available for reproducing a study's procedure.
- **Real stimuli, same code.** Walkthrough screens **MUST** render stimuli with the same functions, and accept responses with the same mapping, as the test trials. Instructions then stay correct under any configuration: other stimulus sets, other keys, a touch device, practice overrides. Don't hard-code example images or key names in instruction text. Interpolate them (§6).
- **Repeat until correct.** Each demo step shows a real stimulus, explains what to do, and waits for the response.
  - A wrong response shows a short hint saying why it was wrong, then the step repeats.
  - The walkthrough is untimed, at the participant's own pace, and covers each condition the task uses (e.g. congruent, incongruent, neutral, no-go).
- **Then practice.** The walkthrough comes before practice and is separate from it. It doesn't count toward `practice_trials`. Practice then runs at real timing, with the practice overrides.
- **Data.** Walkthrough rows are tagged `phase: "instructions"` and `part: "instruction_check"`. They record `correct` and the attempt number, and are never scored.
- **When it isn't reasonable.** Some tasks can't usefully demonstrate with real stimuli: a game-like social task, a minutes-long vigilance wait, a choice with real money. These simply don't offer `"interactive"`. Their default stays evidence-based, and nothing more needs saying.
- **Simulation.** The walkthrough **MUST** work under `jsPsych.simulate()` by answering correctly in data-only mode, so the literature-reproduction tests run through it.

---

## 7. Versioning

**MUST NOT** hardcode the version:

```ts
const VERSION = "0.0.1";   // wrong — drifts on the first release
```

All 23 new packages do this while their changesets are `minor` bumps, so every package would record `task_version: "0.0.1"` while publishing as `0.1.0`, and drift further with each release.

**MUST** import it from `package.json`, which is the pattern the official jsPsych plugins use — the bundler inlines it at build time (`var version = "2.1.0";` in the published plugin output):

```ts
import { version } from "../package.json";
export const VERSION = version;
```

This requires `"resolveJsonModule": true`, which the shared tsconfig (§8) provides.

---

## 8. TypeScript configuration

Every package's `tsconfig.json` **MUST** be exactly:

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

The root `tsconfig.base.json` is:

```json
{
  "extends": "@jspsych/config/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "resolveJsonModule": true
  }
}
```

`strict` is deliberately on, overriding the `@jspsych/config` default. Scoring code handles `number | null` constantly — `rt` is nullable in every task — and strict mode is what catches the resulting arithmetic bugs. The 16 hand-rolled configs in the new packages already set it and the code compiles clean; the four older packages may need fixes when converted.

There are currently **eight** distinct tsconfig variants across the repo, differing in `target` (`ESNext` vs `ES2020` vs `ES6`), `moduleResolution` (`bundler` vs `node`), and `strict`.

**MUST NOT** extend `@jspsych/config/tsconfig.contrib.json`. That config is for the `jspsych-contrib` monorepo and maps `@jspsych-contrib/* → ../*/src`, i.e. to sibling directories in *this* repo, which are timelines rather than plugins. Because `makePackageConfig` derives jest's `moduleNameMapper` from the tsconfig `paths`, this mapping also breaks tests — which is why `packages/bart/jest.config.cjs` contains a hand-written hack to strip it back out. Three packages currently extend it.

---

## 9. Testing

`jest.config.cjs` **MUST** be exactly:

```js
const baseConfig = require("@jspsych/config/jest").makePackageConfig(__dirname);

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};
```

There are currently three incompatible setups: this one (6 packages), the same with a per-package `src/__mocks__/styleMock.js` (1 package), and a hand-rolled `preset: "ts-jest"` config that bypasses `@jspsych/config` entirely (16 packages). The third loses the monorepo module mapping and drags in its own `jest`/`ts-jest`/`@jspsych/test-utils` devDependencies.

CSS is mocked with `identity-obj-proxy` from the root devDependencies. Delete the per-package `src/__mocks__/styleMock.js` files.

Tests **MUST** cover, at minimum:

- `createTimeline` returns a timeline with the expected trial count for default options and for at least one non-default configuration
- `utils.scoring.calculateScores` on a hand-built `DataCollection`, including the empty case
- Any non-trivial task logic (adaptive staircases, sequence constraints, d′ and SSRT computation)

**CI must run them.** The test step is currently commented out in both `.github/workflows/build.yml` and `.github/workflows/release.yml`, which is why two failing `flanker` assertions are on the branch right now.

---

## 10. Build and packaging

### `package.json`

```jsonc
{
  "name": "@jspsych-timelines/<task-name>",
  "version": "0.0.1",
  "description": "<One sentence. Rendered into the root README table.>",
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "unpkg": "dist/index.browser.js",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist", "src"],
  "scripts": {
    "build": "tsup",
    "test": "jest"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jspsych/jspsych-timelines.git",
    "directory": "packages/<task-name>"
  },
  "homepage": "https://github.com/jspsych/jspsych-timelines/tree/main/packages/<task-name>#readme",
  "bugs": { "url": "https://github.com/jspsych/jspsych-timelines/issues" },
  "keywords": ["jsPsych", "<task>", "<domain>", "..."],
  "author": { "name": "...", "url": "https://github.com/..." },
  "license": "MIT",
  "peerDependencies": { "jspsych": ">=8.3.0" },
  "dependencies": { "@jspsych/plugin-...": "^2.1.0" },
  "devDependencies": { "@jspsych/config": "^3.2.2", "jspsych": "^8.3.0", "tsup": "^8.2.4", "typescript": "^5.5.4" }
}
```

Notes on the fields that are currently wrong somewhere:

- **`main` / `module` / `exports`.** With `"type": "module"`, tsup emits `dist/index.js` (ESM), `dist/index.cjs` (CJS), and the IIFE build. It never emits `index.mjs`. Five packages — including the new `corsi-block` and `digit-span` — declare `main: "dist/index.mjs"`, a file that does not exist, so `import` of those packages fails outright. No package currently declares `module` or `exports`.
- **`unpkg`.** `dist/index.browser.js`, everywhere. This is the jsPsych ecosystem convention, not a local choice — `@jspsych/config/gulp.js:69` globs `packages/*/dist/index.browser.js` and its example-rewriting regex matches that exact path. What must change is the *mechanism*: the shared `tsup.config.ts` owns the naming, replacing a 200-character inline `node -e` rename duplicated across 23 package.json files. That duplication is what let `columbia-card` and `spatial-nback` drift out of sync with their `unpkg` field, so both currently advertise a CDN URL that 404s.
- **`peerDependencies`.** `jspsych >=8.3.0`, because the mobile stylesheet ships in that release (§11). Bump the constraint to whatever version actually carries it.
- **`files`.** Only one package declares it today, so the rest publish `src/index.spec.ts`, `tsconfig.json`, `jest.config.cjs`, and `examples/` to npm — `npm pack` on `flanker` is 17 files and 456 kB unpacked. `["dist", "src"]` keeps source maps resolvable; use `["dist"]` if you'd rather not ship source.
- **`homepage`.** Must be the `tree/main` form. `bart` (`/bart/README.md`) and `go-nogo` (`/@jspsych-timelines/go-nogo/README.md`) are not URLs; `corsi-block`, `digit-span`, and six others use a `github.com/.../packages/<name>` form that 404s.
- **`description`** is required — `update-readme.js` renders it into the root README table.
- **`repository.directory`** is required and must be `packages/<task-name>`; several packages say just `"packages"` or omit it.
- **Dependencies must be real.** Plugins go in `dependencies`, `jspsych` in `peerDependencies` only. Currently: four packages declare `@jspsych/plugin-html-keyboard-response` without importing it, `plus-minus` declares an unused `@jspsych/plugin-survey-text`, `hearts-and-flowers` has `http-server` as a runtime dependency, `spatial-nback` has a case-variant self-alias `"jsPsych": "npm:jspsych@^8.2.1"`, and `digit-span` puts its plugins in `peerDependencies` while all 22 others use `dependencies`.

### `tsup.config.ts`

The build **MUST** be a `tsup.config.ts` extending a shared root config, not an inline CLI string duplicated across every package:

```ts
// packages/<task-name>/tsup.config.ts
import { makeTimelineConfig } from "../../tsup.base";
export default makeTimelineConfig("jsPsychTimeline<TaskName>");
```

The shared factory owns the format list, sourcemaps, `.d.ts` emission, treeshaking, style injection, and the `index.browser.js` output name, so build behavior cannot drift package by package.

The IIFE global **MUST** be `jsPsychTimeline<TaskName>` in PascalCase.

### No-response display trials

Fixation, ITI, cue and feedback trials — anything with no response — **MUST** use `htmlKeyboardResponse` with `choices: "NO_KEYS"` and a `trial_duration`. This holds whatever the task's response device is. **MUST NOT** use `htmlButtonResponse` with disabled or hidden placeholder buttons. That needs CSS hacks to hide the buttons, and the button plugin also crashes in data-only simulation when `choices` is empty.

The old reason for placeholder buttons was that a touch task's layout would shift between button and no-button screens. That is a layout problem, so it gets a layout fix. The opt-in `jspsych-mobile.css` button bar (§11) is `position: fixed`, so its presence doesn't move the stimulus. If a package still sees a shift, it reserves the space with scoped CSS on the display trial (§5), not with fake buttons.

---

## 11. Upstream and external dependencies

Duplicated helpers are resolved by pushing them out of this repo, not by adding a shared package here.

### To jsPsych core

Two changes are queued upstream. **The battery release depends on them**, so this repo waits for the jsPsych release that carries both.

**`jspsych.css` — touch target defaults.** `.jspsych-btn` is currently `font-size: 14px; padding: 8px 12px`, well under a 44px touch target. The sizing declarations duplicated across 26 packages (`min-height: 60px`, `min-width: 120px`, `font-size: 18px`) move into core as defaults under `@media (pointer: coarse)`. There is precedent: core already guards its hover style with `@media (hover: hover)` for issue #977.

**`jspsych-mobile.css` — opt-in layout.** The more radical changes stay opt-in via a new stylesheet loaded alongside `jspsych.css`: the fixed bottom button bar (`position: fixed; bottom/left/right: 0; padding: 16px; background: inherit`, plus `display: flex; gap: 16px` on the button group and `flex: 1; max-width: 200px` on the buttons) and the `.jspsych-content { padding-bottom: 100px }` that compensates for it. These appear in 27 and 22 packages respectively.

Once both land, packages carry **no** generic mobile CSS. Only genuinely task-specific rules remain, scoped per §5 — `simon-task`'s `justify-content: space-between`, `digit-span`'s numpad sizing.

### To an external library

Signal-detection math is specialized enough that jsPsych core is the wrong home. The four packages that need it (`oddball`, `continuous-performance-test`, `lexical-decision`, `spatial-nback`) **MUST** take the quantile function from `simple-statistics` — zero dependencies, ISC, tree-shakeable, actively maintained:

```ts
import { probit } from "simple-statistics";

function dPrime(hitRate: number, faRate: number): number {
  return probit(hitRate) - probit(faRate);
}
```

Only `probit` and its `inverseErrorFunction` dependency land in the bundle. `d′`, `β`, and criterion stay as local two-line functions.

The extreme-rate correction policy stays local but **MUST** be named accurately and identically across the four. `oddball` and `continuous-performance-test` currently both label theirs "log-linear" while applying `(count + 0.5)/(total + 1)` only when the rate is exactly 0 or 1 — that is the Macmillan & Kaplan approach, not Hautus's log-linear correction, which adds 0.5 to all cells unconditionally.

### Where shared code goes

For each piece of shared logic, ask whether an ordinary jsPsych experiment, with no timeline package, would want it.

- **Yes → jsPsych core.** Examples: adaptive staircases (a new core module), constrained sequence generation (exact proportions per block, `max_run`, `min_gap`) and jittered durations (both in `jsPsych.randomization`). Packages that need these wait for, or build against a pre-release of, the jsPsych version that has them.
- **Only meaningful with the options vocabulary → `@jspsych-timelines/core`.** This is the one shared package in this repo. It is deliberately small: the vocabulary's TypeScript types, `resolveOptions` (defaults, practice overrides, absence normalization), and data tagging. It contains **no** timeline units. Common pieces such as fixation, feedback and practice loops are built in each package; if one is truly needed everywhere, it becomes a jsPsych plugin.
- **Specialized → an established library** (e.g. `simple-statistics`, above).
- **Task-specific → the package.**

There is still **no** general `@jspsych-timelines/utils` package.

---

## 12. Documentation

Documentation is split between a thin package README, which is the npm landing page, and the documentation site, which is canonical for the full reference.

### Documentation site

The site is a Docusaurus project at `docs/` in the repository root, built on `@jspsych/docusaurus-preset` and `@jspsych/docusaurus-theme`, following the layout established in `jspsych-multiplayer`. It is **not** an npm workspace — it keeps its own `package-lock.json` — and is deployed by a `publish-docs.yml` workflow that builds on pull requests touching `docs/**` and deploys on merge to `main`.

Every package **MUST** have a reference page at `docs/docs/reference/<task-name>.md` containing:

```markdown
## Overview            # what the task measures, canonical citation
## Installation        # npm + CDN
## Quick Start         # minimal runnable snippet
## Task Description    # trial structure, conditions
## Parameters          # table: name | type | default | description — every option
## Examples            # 2-3 configurations beyond the default
## Data Output         # every field, and every phase/part value the package uses
## Scoring             # every ScoringResult metric, with interpretation
## Translation         # how to pass `text`, and the full key list
## Timeline Units      # every timelineUnits export
## References
```

The page **MUST** be registered in `docs/sidebars.ts`.

### Package README

The README is deliberately short — roughly 40 lines — and **MUST** contain only:

```markdown
# <Human-Readable Task Name>

<One paragraph: what the task measures, and the canonical citation.>

## Installation        # npm + CDN
## Quick Start         # minimal runnable snippet
## Documentation       # link to the site reference page
## License
```

It **MUST NOT** duplicate the parameter, data, or scoring tables. Those live in one place, and this is not it.

Twelve of the new packages have no README at all (`choice-rt`, `fitts`, `free-recall`, `global-local`, `lexical-decision`, `mental-rotation`, `oddball`, `paired-associates`, `plus-minus`, `pursuit-rotor`, `simple-rt`, `tower-of-london`) — their npm pages are blank, and `update-readme.js` links every package to `packages/<name>/README.md` unconditionally, so the repo front page carries twelve broken links.

### Examples

`examples/index.html` **MUST** load the local build for development and carry a commented-out unpkg line for the published form, as `packages/flanker/examples/index.html` does. Any script reference **MUST** match the actual build output; five examples currently reference `dist/index.global.js`, and two of those packages no longer produce it.

---

## 13. Release

Every new or changed package **MUST** have a changeset before merge:

```bash
npm run changeset
```

- New packages: `minor` (from `0.0.1` → `0.1.0`).
- Changes to existing packages: `patch` for fixes, `minor` for new options, `major` for breaking changes to `createTimeline`'s signature or the data schema.

Five new packages on the current branch have no changeset (`berg-card-sorting-test`, `digit-span`, `flanker`, `iowa-gambling`, `operation-span`) and would be silently skipped by the release workflow.

The first battery release is gated on the jsPsych release carrying the §11 CSS changes. Sequence: land both core PRs → jsPsych release → bump `peerDependencies` and the `jspsych` devDependency across all packages → strip the now-redundant mobile CSS → publish.

---

## 14. Pre-merge checklist

- [ ] `npm run build -ws` succeeds
- [ ] `npm test` passes
- [ ] `npx prettier --check "packages/<name>/src/**/*.ts"` passes
- [ ] `npm pack --dry-run -w @jspsych-timelines/<name>` contains only intended files
- [ ] `main`, `module`, `exports`, and `unpkg` all point at files the build actually produces
- [ ] No `Math.random()` in `src/`; no hand-rolled `mean`/`shuffle`
- [ ] Every CSS selector is scoped under `.jspsych-timelines-<name>`; no generic mobile CSS
- [ ] Every trial sets `css_classes`
- [ ] `task_version` is imported from `package.json`
- [ ] The scorable trial is tagged `phase: "practice" | "test"` and `part: "response"`
- [ ] Site reference page exists and is registered in `docs/sidebars.ts`
- [ ] README is thin and links to the site
- [ ] `examples/index.html` runs against a fresh build
- [ ] A changeset exists
- [ ] Composed smoke test: this timeline plus two others in one experiment, styling and data intact
