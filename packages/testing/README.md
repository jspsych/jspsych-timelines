# @jspsych-timelines/testing

Dev-only test harness for the timeline packages (private, never published). It holds everything the literature-reproduction tests need that is not specific to one task, so the next package wires it in instead of copying it from the flanker.

| Part          | What it is                                                                                                                                 | Where                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Harness       | Build a timeline from options, run `jsPsych.simulate(..., "data-only")`, return the rows. Seeded. Row and trial filters.                   | `createHarness`, `rowsOf`, `trialsOf`, `filterRows`             |
| Fixture       | The committed record of what the literature varied (typed values per option, study configurations), generated from the task's `spec.yaml`. | `scripts/fixture-from-spec.mjs`, `Fixture`                      |
| Shared checks | Data-level checks written once for vocabulary options (counts, blocks, proportions, order, durations, feedback, keys, device).             | `sharedChecks`, `durationCheck`                                 |
| Contract      | What the package tells the shared checks about its data fields and parts.                                                                  | `defineContract`                                                |
| Runners       | Level 1 (each typed observed value alone), level 2 (each fully typed study configuration), gap classification, tallies, `reproduction.md`. | `defineReproduction`                                            |
| Layout check  | Browser check of the standard's stage anchoring (§5). Not part of `npm test`.                                                              | `scripts/layout-check.mjs`, `@jspsych-timelines/testing/layout` |

## What a new package writes

Everything under `packages/<task>/reproduction/` and one spec file. The generic parts stay here.

| File                                                                    | Contents                                                                                               | Size for the flanker            |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------- |
| `reproduction/spec-observed.json`                                       | Generated. Do not write it.                                                                            | generated                       |
| `reproduction/contract.ts`                                              | `defineContract({...})`: only what differs from the standard tagging                                   | 40 lines                        |
| `reproduction/harness.ts`                                               | `createHarness({ createTimeline, resolve })`                                                           | 20 lines                        |
| `reproduction/adapter.ts`                                               | The retyping table: how each typed spec value becomes the package's options, and which values are gaps | 280 lines, by far the most work |
| `reproduction/checks.ts`                                                | Checks for the task's own options, and extra assertions on shared ones                                 | 550 lines                       |
| `reproduction/notes.md`                                                 | Optional commentary appended to `reproduction.md`                                                      |                                 |
| `src/reproduction.spec.ts`                                              | `defineReproduction({...})` and the package's other reproduction tests (defaults against the anchor)   | 150 lines                       |
| `reproduction/expected-tallies.json`, `results.json`, `reproduction.md` | Written by `UPDATE_REPRODUCTION=1 npx jest`                                                            | generated                       |

### 1. Add the dependency

```jsonc
// packages/<task>/package.json
"devDependencies": { "@jspsych-timelines/testing": "*", ... }
```

Then `npm install` at the root, so the workspace link and lockfile are updated. Verify with `npx -y npm@10 ci --dry-run --ignore-scripts`.

### 2. Generate the fixture

The specs live in a private repository, so the package commits what it needs. Point the script at the task's spec directory (it holds `spec.yaml` and, if present, `translations.yaml`):

```
node packages/testing/scripts/fixture-from-spec.mjs \
  ../jspsych-timelines-paper/task-discovery/specs/<task> \
  packages/<task>/reproduction/spec-observed.json
```

The output has `options` (per option: the default, and per component the observed values with source, raw text, typed value, `ok`, note), `study_configurations` (`options` keyed `option` or `option.role` or `practice.option`; `fully_typed`), `defaults` (the anchor), and `translations`. Types are in `src/fixture.ts`. Regenerate when the spec changes and commit the diff.

### 3. Write the contract

The shared checks are written against the standard (§4): `task`, `phase`, `part: "response"` on the scorable trial, and the recommended part names (`fixation`, `iti`, `feedback`, `cue`, `rest`). Name the rest once:

```ts
// reproduction/contract.ts
export const contract = defineContract<ResolvedOptions>({
  task: "flanker",
  condition: (row) => row.flanker_condition,          // trial type on a response row
  normaliseCondition: (c) => (c.startsWith("neutral") ? "neutral" : c),
  proportionKeys: (eff) => Object.keys(eff.condition_proportions).filter((k) => k !== "cued"),
  exempt: (row) => row.congruency === "nogo",         // no correct response, cannot time out
  allocate: allocateCounts,                            // the package's rounding rule
  blockSizes: (eff) => splitTrials(eff.n_test_trials, eff.n_blocks),
  durationFields: (o) => (o === "fixation_duration_ms" ? ["duration_ms", "fixation_duration"] : ["duration_ms"]),
});
```

Defaults: parts `response/fixation/iti/feedback/cue/rest`; fields `block`, `correct`, `response`, `correct_response`, `rt`, `timeout`, `response_window`, `stimulus_duration`, `response_device`, `feedback_kind` (a field set to `null` says the package has none); `condition` reads `row.condition`; durations are recorded in `duration_ms`; keyboard maps to `html-keyboard-response` and mouse/touch to `html-button-response`.

Every shared check lists the contract entries it relies on (`requires`, `optional`). If an adapter lacks one, the runner stops with the entry's name instead of failing inside an assertion.

### 4. Write the adapter

The adapter retypes spec values into the package's options. The spec records some values as free text or under role keys (`stimulus_set.neutral flanker`), so this is hand-written, once, and nothing is parsed from prose. Each entry is `ok(options, companions?)` or `gap(class, reason)`:

```ts
case "feedback_duration_ms":
  return ok({ feedback_duration_ms: value }, { trial_feedback: "accuracy" }); // needs feedback to be observable
case "concurrent_task":
  return value === "none" ? ok({ concurrent_task: "none" }) : gap("plugin needed", "needs the simon-task package");
```

`companions` are settings a single value needs in order to be observable. They are the weakest layer, explicit settings override them, and they are listed as "assumed" in level 2. `createAdapterKit({ mapOptions, dropCompanion? })` gives `mergeOptions`, `combine` and `assumedSettings` for options that are maps (`stimulus_set`, `practice`).

Gap classes (the plan's): `package fix needed`, `option missing`, `plugin needed`, `dossier value wrong`, `genuinely contradictory`. A gap is reported in `reproduction.md`, not hidden.

### 5. Write the checks

`sharedChecks` has one check per vocabulary option it covers. The package's `CHECKS` is those, extended where the package adds assertions, plus checks for its own options:

```ts
export const CHECKS: CheckSet = {
  ...sharedChecks,
  condition_proportions: extendCheck(sharedChecks.condition_proportions, { fn: (r) => { /* cued/uncued */ } }),
  stimulus_set: { kind: "behaviour", requires: [], fn: (r) => { /* ... */ } },
};
```

A check is `{ kind, requires, optional?, fn(r, { contract, harness }) }` and uses jest's `expect`. `kind` says what it can see: `behaviour` (rows), `recorded-parameter` (a value arrived in data and plugin parameter; data-only simulation ignores time), `structure` (built timeline or HTML).

### 6. The spec file

```ts
// src/reproduction.spec.ts
defineReproduction({
  task: "flanker",
  dir: path.join(__dirname, "..", "reproduction"),
  fixture: fixtureJson as unknown as Fixture,
  expectedTallies: expected,
  harness, contract,
  adapter: { adapt, adaptConfig, combine, assumedSettings, subFromVariation },
  checks: CHECKS,
  addNullOptions: ["response_window_ms", "stimulus_duration_ms"], // typed null = untimed: add as a case
  reportedValue: (key, value, r) => [r.eff.x, value],             // level 2: tie dotted keys to resolved options
  onUpdate: () => { /* e.g. regenerate docs-meta presets */ },
});
```

`UPDATE_REPRODUCTION=1 npx jest` writes `expected-tallies.json`, `results.json`, `reproduction.md` (and calls `onUpdate`). A normal run asserts the tallies against the committed file, so an improvement or a regression shows up as a diff. Add the package's own tests to the same file (defaults against the anchor, docs-meta).

### 7. The layout check (optional)

```
npm run build
node ../testing/scripts/layout-check.mjs reproduction/layout.config.mjs     # from the package
```

The config module default-exports `{ bundle, global, stageSelector, belowSelector, screenKind, variants, expectKinds }`. It serves a page running `dist/index.browser.js` with each variant's options at its viewport, steps through the task (pressing `keys[kind]` on a screen kind, clicking enabled buttons), records the stage's bounding rect per screen type, and asserts the same centre (±1 px), no overlap of the text region with the stage, and response buttons inside the viewport. `screenKind(stage, doc)` is serialised into the page, so it must be self-contained. Needs Chrome (`$CHROME_PATH` or a standard location) and `puppeteer-core` (a devDependency here). See `packages/flanker/reproduction/layout.config.mjs`.

## Shared checks

| Option                                                                                                         | What it asserts                                                                                                                                                                                   | Needs from the contract                                                 |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `n_test_trials`                                                                                                | number of test response rows                                                                                                                                                                      | `parts.response`                                                        |
| `practice_trials`                                                                                              | number of practice response rows                                                                                                                                                                  | `parts.response`                                                        |
| `n_blocks`                                                                                                     | block numbers `1..n`, trials per block equal `blockSizes`                                                                                                                                         | `fields.block`, `blockSizes`                                            |
| `trials_per_block`                                                                                             | every block has that many trials                                                                                                                                                                  | `fields.block`, `blockSizes`                                            |
| `condition_proportions`                                                                                        | exact per-block counts (skipped for `random` order)                                                                                                                                               | `fields.block`, `condition`, `proportionKeys`, `allocate`, `blockSizes` |
| `condition_set`                                                                                                | the set of trial types seen                                                                                                                                                                       | `condition`, `normaliseCondition`                                       |
| `trial_order`                                                                                                  | `random`: counts only approximate; `shuffled_list`: exact counts, not grouped; `fixed_sequence`: the same under every seed                                                                        | as above                                                                |
| `sequence_constraints`                                                                                         | `max_run`, `no_immediate_repeat` in every block under six seeds; other keys through `contract.sequenceConstraints`                                                                                | `condition`, `fields.block`                                             |
| `response_window_ms`                                                                                           | recorded window and `trial_duration`; timeouts under a 50 s RT (not for exempt rows); none under 50 ms                                                                                            | `fields.timeout`, `exempt`; optional `fields.response_window`           |
| `stimulus_duration_ms`                                                                                         | recorded value and plugin parameter                                                                                                                                                               | `fields.stimulus_duration`                                              |
| `fixation_duration_ms`, `iti_ms`, `feedback_duration_ms` (and `durationCheck` for any other `duration` option) | `0`: no rows; number: recorded in every field of `durationFields`, and `trial_duration` equal; `{min,max,step}`: in range, on the step grid, more than one value, same seed gives the same values | `parts.*`, `durationFields`                                             |
| `trial_feedback`                                                                                               | feedback rows present or absent, test and practice (override), `feedback_kind`                                                                                                                    | `parts.feedback`; optional `fields.feedback_kind`                       |
| `feedback_condition`                                                                                           | number of feedback rows by correctness                                                                                                                                                            | `fields.correct`, `parts.feedback`                                      |
| `response_keys`                                                                                                | plugin `choices`; correct and given responses are among the keys                                                                                                                                  | `fields.response`, `fields.correct_response`, `exempt`                  |
| `response_device`                                                                                              | `trial_type` is the device's plugin; keys are strings, buttons are indices                                                                                                                        | `plugins`, `fields.response`; optional `fields.response_device`         |

`expectStandardTagging(run, contract)` asserts §4 on any run (every row has `task` and `task_version`, the scorable row is tagged). The checks of the testing package itself are in `src/*.spec.ts`; they run the shared checks against a small task (`src/__fixtures__/mini-task.ts`) that has deliberate faults, to show that a check fails when the option is not honoured.

## Worked example

`packages/flanker/reproduction/` and `packages/flanker/src/reproduction.spec.ts`. Of the flanker's 32 checked options, 15 come from `sharedChecks` (3 of them extended with flanker-only assertions) and 17 are flanker-only.
