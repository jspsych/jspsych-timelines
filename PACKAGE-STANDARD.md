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

  The sampled value **MUST** be written into the trial's data, so analyses can use the actual duration. The data field is the option's name without `_ms`, in milliseconds: `fixation_duration_ms` → `fixation_duration: 734`, `iti_ms` → `iti`, `feedback_duration_ms` → `feedback_duration`, `cue_target_interval_ms` → `cue_target_interval`. This matches jsPsych's own fields (`rt`, `trial_duration`), which are in milliseconds without a suffix. Absent values still follow the absence rule: `0` means it doesn't happen, and `null` means no limit. Lists of fixed levels (e.g. SOAs of 100, 300, 500 as conditions) are design factors, not jitter, and belong in a task-specific option.
- **Rules are functions, not strings.** When a value is computed during the session, the option takes a function, never a special string or a rule object (no `"mean+2.5sd"`). The function is called at the start of each trial that uses the option, with a context object, and returns the value. It is not handed any particular data: it reads what it needs itself, usually with `jsPsych.data.get().filter(...)`, so a rule can depend on practice RTs, on earlier test trials, or on nothing in the data at all.

  ```ts
  // context: { jsPsych, phase, block, trial_index_in_block }
  response_window_ms: utils.deadlines.meanPlusSd(2.5)        // prebuilt
  response_window_ms: ({ jsPsych }) =>                        // anything else
    jsPsych.data.get().filter({ phase: "practice", part: "response", correct: true }).select("rt").median() + 200
  ```

  The case in the specs is a response deadline set from practice (complex span's automated operation span, Unsworth et al. 2005: practice mean + 2.5 SD; also single studies in go/no-go and flanker).
  - The package **MUST** export prebuilt helpers for the rules its studies use, under a `utils` key (e.g. `utils.deadlines.meanPlusSd(k)`, `percentile(p)`, with `{ min, max }` bounds). Each package writes its own; they are a few lines, so there is no shared package for them. A helper decides which rows it uses (for a deadline, the package's correct practice responses) and what to return before it has them: the deadline helpers return the package's fixed default until the rows they read exist, i.e. while there are fewer than 5 usable practice RTs (so during practice, and when practice is skipped or short). Prebuilt helpers **MUST** be deterministic given the data so far, since they run on every trial: the same data gives the same value (a calibrated deadline stays fixed once practice is over). A custom function may do anything, including random draws through `jsPsych.randomization`, which are then drawn anew on each trial.
  - The data **MUST** record the value used on every trial (for a deadline, `response_window`, per the duration-field rule). Prebuilt helpers carry a readable label (e.g. "mean + 2.5 SD of correct practice RTs"), which is recorded with it.
  - The option's doc comment carries `@acceptsFunction <signature>` (e.g. `@acceptsFunction (ctx: { jsPsych, phase, block, trial_index_in_block }) => number`), so the docs site shows that it takes a function; the context's `jsPsych` is typed `JsPsych`.
  - Function values are code-only: the docs form and shareable URLs do not edit them, and presets that reproduce such a study leave the option out, with a note. When the anchor's rule is a function, the default is that helper and the parameter reference shows it as code.
- **Absence is a value, typed by meaning.** There are no on/off booleans like `show_fixation`.

  | Kind | Absent value | Example |
  |---|---|---|
  | Enum | `"none"` | `trial_feedback: "none"` |
  | Limit whose absence means "no limit" | `null` (as jsPsych's `trial_duration: null`) | `response_window_ms: null` |
  | Event whose absence means "doesn't happen" | `0` | `fixation_duration_ms: 0` |
  | Bundle switched off | `null` | `adaptive: null` |

  `undefined` (option not given) always means "use the default". A task that cannot run without the value (a go/no-go or stop trial needs a finite response window to end) **MUST** throw on the absent value, naming the option, rather than run trials that never end.
- **Phase overrides, not phase names.** There are no `practice_feedback` / `test_feedback` pairs. A package that has a practice phase **MUST** accept `practice?: Partial<<Task>Options>`, whose values override the main options during practice: `{ trial_feedback: "none", practice: { trial_feedback: "accuracy" } }`. `practice_trials` is a separate count, not a phase override. `practice` is therefore a reserved option name. A package may have its own practice defaults (e.g. feedback in practice only). Precedence, highest first: the user's `practice` value, the user's top-level value, the package's practice default, the package's default. So `{ trial_feedback: "none" }` really means no feedback anywhere, and the package's practice default only fills in what the user left unset.
- **Test-design options don't flow into practice.** Options that describe the test's design rather than how a trial looks (`sequence_constraints`, `set_sizes`; the vocabulary marks them `practice_inherits: false`, the schema `x-jspsych.testOnly`) apply to the test only when given at the top level. Practice uses them only when they are given inside `practice`. A short practice block usually can't satisfy a test's run or gap rules, and practice in the anchor studies uses its own set sizes.
- **Whether `adaptive` runs in practice is the package's decision.** A staircase that keeps the task at a working difficulty (stop-signal's SSD) usually runs in practice too and may carry into the test. A staircase that measures a threshold (tone detection) usually doesn't: practice then uses fixed levels. The option's doc comment and DEFAULTS.md say which. Either way, a `discontinue_rule` never ends practice, and a user's `practice.adaptive` always wins.
- **Count options set each other.** `n_test_trials`, `n_blocks` and `trials_per_block` describe one thing. Given one, the package derives the others from its defaults. Given two, it derives the third. Given all three, they must agree (`n_test_trials = n_blocks × trials_per_block`), or `createTimeline` throws, naming them. A task whose test ends on a stop rule instead (a staircase that ends after N reversals, a session that runs for a fixed time) says so on its docs page, and its counts are maxima.
- **Task vocabulary goes in values, not names.** Options that cover several stimulus kinds or trial types take a map keyed by the task's own terms, not a cross-task role list: `stimulus_set: { cue: …, target: … }`, `condition_proportions: { stop: 0.25, go: 0.75 }`.
- **Stimulus sets are data, not names.** When a task draws its items from a set (pictures, designs, words, letters to remember), the option takes the set itself, not an enum of set names. A researcher passes their own set, and the sets the package bundles are values of the same type, exported as `utils.stimuli.<camelCaseName>`: `stimulus_set: { items: utils.stimuli.representationalDrawings }`.
  - A set is `{ name?, noun?, items }`. `name` is recorded in the data, and is `"custom"` when not given. `noun` (`{ singular, plural }`) is what the instructions call the items, so the text follows the set (§6a). The default noun follows the kind of items. A plain array of items is accepted as a set with no name. Each item is a string (a text item), or an object with exactly one of `text`, `image` (a URL) or `svg` (markup), and an optional `id`. The id is what the data records for the item, so it **MUST** be stable. The default id is the text, or the set name and the item's position. Duplicate ids throw.
  - The default is a bundled set, the anchor's or the package's own stand-in for it. A bundled set **MUST** have a licence that allows redistribution, kept with the data in the source file and in the built bundle (a `@license` comment). Where the literature's sets have no such licence, the package bundles an open substitute, and DEFAULTS.md and the docs page say it is not the studies' set.
  - JSON (presets, the URL hash, the docs editor) can't hold a set. There a bundled set is a reference, `{"$util": "stimuli.representationalDrawings"}`. The docs theme resolves it against the bundle's `utils` before `createTimeline`, the Code view prints `utils.stimuli.representationalDrawings`, and the site's schema offers the bundled sets as a select. The site build does this for any default that is a `utils.stimuli` export. The package does nothing for references: `createTimeline` only ever sees sets. The adapter maps the spec's set names (`representational_drawings`) to the bundled sets, and the reproduction tooling writes them back as references (`toUtilRefs` in `@jspsych-timelines/testing`).
  - This is for sets of items. A stimulus that is generated or drawn from parameters (an arrow, a tone, a flanker array) stays an enum of kinds plus its parameters.
- **Crossed factors are a map of maps.** In `condition_proportions`, numbers mean one factor: `{ congruent: 0.5, incongruent: 0.5 }`. Objects mean independent factors, fully crossed, each keyed by the task's own factor name: `{ congruency: { congruent: 0.5, incongruent: 0.5 }, cue: { cued: 0.5, uncued: 0.5 } }`. A map **MUST NOT** mix numbers and objects. Counts are exact per factor within a block (largest remainder); the factors are crossed by assigning each factor's levels independently.
- **Per-block schedules are lists.** An option whose value changes from block to block takes a list, one entry per block: `condition_proportions: [{ stop: 0.4, go: 0.6 }, { stop: 0.2, go: 0.8 }]`. The list never sets the number of blocks; `n_blocks` (or its default) does. With fewer entries than blocks, the last entry repeats; with more, `createTimeline` throws. `block_order: "random_within_block"` means each block holds every level once, in random order (e.g. one trial of each set size).
- **Contradictions throw.** When two options say different things (e.g. `condition_set` and `condition_proportions` name different trial types), `createTimeline` **MUST** throw an error naming both, rather than pick one silently. When only one of a related pair is given, it sets the other (e.g. `condition_set` alone means equal proportions over that set).
- **Sequence constraints have one typed form.** `sequence_constraints` holds ordering rules that apply within each block, and across block boundaries for the neighbour rules (runs, gaps, repeats). `<condition>` is a key of `condition_proportions` (or of one factor's map). Omitted keys mean no constraint.

  ```ts
  sequence_constraints?: {
    max_run?: number | Record<string, number>;   // at most n consecutive trials of the same condition, or of each listed condition
    min_gap?: Record<string, number>;            // at least n other trials between two trials of that condition
    max_gap?: Record<string, number>;            // at most n other trials between two trials of that condition
    run_length?: Record<string, number[]>;       // runs of that condition only have these lengths (go runs of 1, 3 or 5)
    start_with?: Record<string, number>;         // each block starts with n trials of that condition
    no_immediate_repeat?: true | string[];       // no condition repeats on consecutive trials, or none of these trial fields does
    balanced_transitions?: true;                 // each condition follows each condition equally often (within 1)
    cycle_length?: number;                       // every consecutive n trials hold the block's proportions exactly
  } | null;
  ```

  Packages implement these with `@jspsych/sequencer` (§11): each key maps onto one of its rules (`maxRun`, `minGap`, `maxGap`, `runLength`, `startWith`, `noRepeat`, `balancedTransitions`; `cycle_length` is `sequenceBlocks` over chunks). An order the rules can't satisfy throws the sequencer's error, which names the rule, when the timeline is built. A rule that isn't in this list is a vocabulary proposal, not a task-specific key.
- **Bundle only what is configured as a unit.** An adaptive procedure is one `adaptive` option (`procedure`, `start_level`, `step_size`, `target_accuracy`, `bounds`, `discontinue_rule`, `tracks`, `reset`), built with `jsPsych.adaptive` (core since 8.4.0). `bounds` is `[min, max]`, with `null` for no limit on that side. `tracks: "per_condition"` keeps one independent procedure per condition and the trial's condition picks it. "Condition" is the trial's level of one factor, which the package names in the option's doc comment and on its docs page: by default the `condition` data field; for the stop-signal task, the go stimulus (one delay per direction, as in STOP-IT), since `condition` there is go or stop and only stop trials have a delay; `reset` (`"never"`, `"block"`, `"phase"`) starts the level again from `start_level` by creating a fresh procedure. A practice criterion is likewise one `practice_criterion` object: `{ accuracy, window, on_fail: "repeat" | "continue" | "end", max_repeats }`. Settings that are changed one at a time stay flat: `trial_feedback`, `feedback_condition` and `feedback_duration_ms` are separate options.
- **Response = device + format.** `response_device` takes `keyboard`, `mouse`, `touch`, `microphone`, `eye_tracker` or `gamepad`. `response_format` takes `single_response`, `n_afc`, `rating`, `free_text`, `location` or `none`. Modality is not an option; it is implied by these two. What the participant judges (detection vs localization) changes the measure, so it is a `task_variant`, not a response option.
- **No response time in feedback by default.** A default for `trial_feedback` (in practice or test) **MUST NOT** show the participant their response time: `accuracy` instead of `accuracy_rt`, and nothing RT-based instead of `rt`. Practice is for learning the rule, and an RT readout pushes speed before the mapping is learned. Show RT by default only when knowing their RT is part of the task itself (e.g. a task that trains or rewards speed against a target), and record that reason in `DEFAULTS.md`. Users can still choose `accuracy_rt`, and presets that reproduce a study keep its feedback. The spec generator applies this (basis `no_rt_feedback`, with the study's value kept as `replaced`).
- **Default keys are letters.** A default for `response_keys` (or any key option) **MUST** use letters, digits, space or named keys such as `ArrowLeft`, never punctuation: instructions that say "press /" or "press ." are hard to read. When the anchor's keys are punctuation, the default is the most common readable key set in the literature (the spec generator does this, with basis `readable_keys`). Users can still set any key, and presets that reproduce a study keep its keys. Instructions **MUST** name keys readably: letters in capitals, named keys in words ("left arrow", "space"), never the raw `event.key` value.
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

Task-specific helpers (stimulus generators, sequence builders) go in additional namespaced keys (`utils.stimuli`, `utils.sequence`). `utils.stimuli` also holds the bundled stimulus sets (§2a), as values beside the render helpers. The defaults object is `DEFAULT_OPTIONS` everywhere — not `DEFAULT_CONFIG`.

`calculateScores` **MUST** accept a `DataCollection` and **MUST** return a well-defined `ScoringResult` interface with a documented value for the empty-data case (`0` for counts, `null` for means — never `NaN`).

**No exclusion on performance.** A package **MUST NOT** judge a participant or session by performance: no exclusion options, gates, `excluded` or `*_ok` flags, and no thresholds such as "go omissions at most 25%" or "processing accuracy at least 85%". Choosing exclusions is a data-processing decision. The score reports the measures those rules need (accuracy, omission and error rates, trial counts), and the docs page names the literature's usual criteria as analysis guidance. A `practice_criterion` that repeats practice is procedure, not exclusion, and is allowed. Its default is `null` (practice runs once, whatever the accuracy) in every package, even when the anchor study used a criterion. This is an exception to the anchor rule of §2a. A study's criterion goes in that study's preset, and DEFAULTS.md names it. An accuracy target in the instructions (complex span's "keep math accuracy at 85%") is instruction text, not a rule the package applies.

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

Constrained orders (exact counts, run limits, gaps, balanced transitions) **MUST** use `@jspsych/sequencer`, not a hand-written retry loop. It takes its random numbers from an `rng` option; pass one drawn from `jsPsych.randomization`, so the order goes through the same path as every other draw:

```ts
import { allocate, maxRun, sequence } from "@jspsych/sequencer";

const rng = () => jsPsych.randomization.randomInt(0, 2 ** 30 - 1) / 2 ** 30;
const counts = allocate(condition_proportions, n_trials); // exact counts, largest remainder
const order = sequence(trials, [maxRun({ key: "condition", max: 3 })], { rng });
```

Seeding is not the reason for this rule. `jsPsych.randomization.setSeed()` replaces the global `Math.random` with a seeded generator, so for now a stray `Math.random()` call is seeded too. The rule exists for three other reasons:

- **One auditable path.** Every random draw goes through a named core function, so a reviewer can find all of a package's randomness with one search and see what kind of draw each one is.
- **No copies of core.** A hand-rolled draw is almost always a copy of a core function. Copies drift and pick up the usual mistakes, such as the biased `sort(() => Math.random() - 0.5)` shuffle.
- **Independence from how seeding works.** Packages should not rely on the global override. If core ever seeds a private generator instead of replacing `Math.random`, code using `jsPsych.randomization.*` stays reproducible, and code calling `Math.random()` silently stops being reproducible.

There are currently 42 `Math.random()` call sites across 24 packages, including a byte-identical Fisher-Yates `shuffleArray` copy-pasted into 13 of them — every one of which is `jsPsych.randomization.shuffle`.

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

`instruction`, `fixation`, `cue`, `stimulus`, `choice`, `feedback`, `iti`, `transition`, `rest`, `screening`, `calibration`, `completion`

Prefer `iti` over `isi` or `delay`; prefer `instruction` over `intro` or `announcement`. Tasks with genuinely novel trial types (`digit_presentation`, `math_feedback`, `round_summary`) **SHOULD** name them descriptively rather than forcing a poor fit.

Likewise `phase` **SHOULD** be one of `instructions`, `practice`, `test`, `completion`, plus `study` for tasks with a distinct encoding stage.

Packages **MUST NOT** write a column jsPsych writes on every row: `trial_type` (the plugin name), `trial_index` (a counter over the whole experiment), `time_elapsed` and `plugin_version`. A package value would overwrite jsPsych's, or be overwritten, and either way analyses that rely on the column break silently (the stop-signal pilot's `trial_type: "stop"` made `trial_type` checks score nothing). The trial's condition is `condition`; the spec generator renames a spec's `trial_type` field to `condition`, and fails on any other reserved name. A package that records a trial's position within its block names it `trial_index_in_block` (1-based) and writes it on the scorable row next to `block` (1…n). The spec generator renames the `trial_index` that some measures list as a needed field.

**Tasks without a correct answer.** Where no response is right or wrong (a reward-learning choice, effort-based choice, preference), the package writes no `correct` or `correct_response` field. It doesn't write a placeholder value either. Scoring reports the task's own measures (stay probabilities, choice proportions). Where correctness depends on the participant's own history (self-ordered pointing: a repeat is an error), `correct` is computed from that history and recorded like any other.

**Several responses in one trial.** When one trial holds several responses (two-step's two stages; EEfRT's choice, then the effort), the scorable row is still one row per trial, `part: "response"`. It is written after the trial's last screen and carries every response the trial needs for scoring, named by stage (`choice_1`, `rt_1`, `choice_2`, `rt_2`). Its `response` and `rt` are those of the trial's first decision, so a battery-wide filter still finds a response and an RT. The single screens may write raw rows with their own part (`part: "choice"`, plus a field naming the stage). A trial missed at its first stage still writes its scorable row, with `null` responses.

**Units between a trial and a block.** Some tasks group trials into a unit of their own: a self-ordered-pointing series (one pick per page until every item has been picked), a span task's list. The scorable row is still the smallest response (a page, an item). The row records the unit and its position in it (`series`, `choice_index`, both 1-based). `block` and `trial_index_in_block` keep their meaning: `trial_index_in_block` counts scorable rows within the block. Count options (`practice_trials`, `n_test_trials`) count the task's literature unit (series, lists) when that is how studies report them. The option's doc comment says which, and the reproduction contract names the counting unit.

**Screening and calibration rows** (a headphone check, a volume setting, a press-rate calibration) use `part` values `screening` and `calibration`, with a field naming which. They are never scorable and never exclude anyone (§2a): the result is recorded, and the task goes on.

Every scorable row of the test phase is `phase: "test", part: "response"`, including rows of a baseline or single-condition block (go/no-go's go-only baseline). A field separates them (go/no-go's `baseline_block`), and scoring filters on it. A battery-wide filter then still finds every response.

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

5. A task with a centred stimulus **MUST** put it in a fixed-size stage anchored at the vertical centre of the display on **every** task screen (fixation, cue, stimulus, feedback, ITI, instruction and hint screens alike). jsPsych centres `.jspsych-content` as a whole, so extra text or a plugin button group below the stimulus would otherwise shift it. Anchor the stage independently of its siblings (e.g. `position: absolute; top: 50%; transform: translate(-50%, -50%)` inside a full-height content box, or a full-height grid with `minmax(0, 1fr) auto minmax(0, 1fr)` rows). Accompanying text and the response/continue button group go in a region below the stage that does not move it, scrolls if long, and keeps the buttons visible in a short (about 430 px) run area. An interactive panel that replaces the stimulus (complex span's recall grid, a rating scale) may use a taller stage, provided it shares the stimulus stage's centre and the text and buttons below still fit the short run area. Short text in that region (captions, hints, feedback) **MUST** be centred under the stimulus (`text-align: center`, preferably with `text-wrap: balance`); only full-page instructions without a stage are left-aligned. The task colours (`stimulus_color`) paint the whole display, not a box around the stage. Verify with a browser check that records the stage's bounding rect on each screen type (and at a narrow and a wide viewport) and asserts the same centre (±1 px); keep a jsdom test that every stimulus screen uses the anchored wrapper. The browser check also fails when anything inside the stage reaches past its edges (it would be clipped), and, with `markSelector`, when the fixation mark moves between screens. A stimulus that does not fit the default stage (a vertical array, an array shifted off fixation) gets a taller stage with the same centre.

6. **Tasks without a visual stimulus** (auditory tasks) still anchor whatever is on screen during a trial (interval markers, a listening icon) in the stage, and the layout check uses it as `markSelector`. Sound is generated in code or loaded from the package, played through `jsPsych.pluginAPI.audioContext()`, and started only after a click (the browser blocks audio until then). Each trial records whether the audio context was running (`audio_context_state`). Levels are stated in dB re full scale (RMS; 0 dB is a full-scale sine), and the docs page says how participants set their volume. Data-only simulation and jsdom tests must not need audio.
7. **Text has one size: the body size.** Feedback ("Correct", "Too slow"), notices, block and end-of-task summaries, captions and hints use the same font size as the instruction pages. Only stimuli and the fixation mark are larger. Emphasis comes from weight or colour, not size. An inline stimulus in a sentence (an arrow in "press ← for left") is aligned with `vertical-align: middle`.

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
  - A wrong response shows a short hint saying why it was wrong, then the step repeats. After 3 attempts the hint gives the answer and the walkthrough moves on, so nobody gets stuck.
  - The walkthrough is untimed, at the participant's own pace, except for stimuli whose duration is part of the task (complex span's memoranda, a briefly flashed target), which keep their real duration. It covers each condition the task uses (e.g. congruent, incongruent, neutral, no-go). A step whose correct answer is to withhold a response (no-go, stop) is the exception: it waits a fixed time (2.5 s), and no response by then is correct.
  - The examples alternate between the responses, so each response is taught.
- **All instruction text follows the resolved options.** Instruction pages, captions and hints **MUST** describe the task as configured, not the default design. Text functions therefore take the resolved options (or the values derived from them). With blank flankers, the caption says there is nothing on the sides. With letter stimuli, it names only the letter shown, not the whole response set. A page doesn't say "a missed trial is skipped" when `missed_response_handling` repeats it, or "the options change places" when sides are fixed. Test the text under at least one non-default configuration.
- **One idea per page.** An instruction page explains one thing. Advice on how to do the task (balancing speed against stopping, keeping math accuracy up) goes on its own page after the rules, not at the end of them.
- **When no response is right.** In a task without a correct answer (§4), the walkthrough checks what the pages just explained, with real stimuli and keys: "which planet does this ship usually go to?", "press the key for the hard task". The same hint, repeat and 3-attempt rules apply. The "correct" answer is what the instructions said, not a task answer, and such rows are `part: "instruction_check"` like any other.
- **Sounds.** In an auditory task, the walkthrough first plays each kind of sound at a clearly audible level, with a "Listen again" button, before any check step. Captions describe what is heard.
- **Then practice.** The walkthrough comes before practice and is separate from it. It doesn't count toward `practice_trials`. Practice then runs at real timing, with the practice overrides. The page before practice **MUST** say what changes: trials now run at the real task's pace, and the main task starts after practice. A task practised in parts (complex span: letters, then math, then both) says so up front and names each part as it starts.
- **Data.** Walkthrough rows are tagged `phase: "instructions"` and `part: "instruction_check"`. They record `correct` and the attempt number, and are never scored. Hint screens are `part: "instruction_feedback"`; static example pages (`"examples"`) are `part: "instruction_example"`.
- **Experimenter-led.** With `instruction_format: "experimenter"`, the walkthrough and instruction pages are skipped.
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

### Simulation

Tests run the task with `jsPsych.simulate(..., "data-only")`, which by default responds on every trial, records a button index of `0` on a timed-out button trial, and never runs a trial's `on_load`. A package **MUST** make that simulation produce plausible data:

- **Withheld responses.** A trial whose correct answer is to withhold a response (no-go, stop) **MUST** be simulatable as withheld. Either the package simulates it itself (the stop-signal race model in `simulation_options`), or the trial names its simulation options after its condition (`simulation_options: "nogo"`), so a test passes `{ nogo: { data: { response: null, rt: null } } }`.
- **Timeouts.** When a simulated or real trial times out, the package's data **MUST** record `response: null` and `rt: null`, never the plugin's placeholder (a button trial's `0`).
- **Custom screens.** A trial whose response is collected by code in `on_load` (a recall grid, a typed answer) is never run by data-only simulation, so its simulated answer comes from `simulation_options.data`. It **SHOULD** draw answers that include errors, so scoring is tested on wrong answers too, and hand-built rows **MUST** test scoring of wrong answers either way. Such a screen is a candidate for a jsPsych plugin (§11).
- **Custom responses.** A response that no core plugin collects (many key presses towards a target, a hold) is better built as a small plugin inside the package, exported as `utils.plugins.<Name>`, with its own `simulate`, than as an `on_load` screen: data-only simulation doesn't run `on_load`, and `on_load` can't end the trial. If it would be useful outside the package, it is a candidate for jsPsych or contrib (§11).
- **Time-limited tasks.** A stop rule based on time (a session that runs for 20 minutes) **MUST** end under data-only simulation, where screens take no wall time. The package keeps its own session clock: the larger of wall time and the summed durations of the screens shown (planned durations plus simulated RTs). Record it on each scorable row (`session_elapsed`).
- **Behaviour models.** Where the score is an effect of the design (model-based vs model-free stays, choosing the hard task more often at higher rewards, more repeat errors at larger set sizes), the package's simulation **MUST** produce that effect, and a test checks its sign over enough simulated trials. A simulation that answers at random can't test scoring.
- **Plans before the trial.** jsPsych evaluates a trial's function parameters (`stimulus`, `choices`, `trial_duration`) before its `on_start`. Draw per-trial plans when the timeline is built, or lazily inside those functions; don't rely on `on_start` having run.
- **Walkthrough.** The walkthrough answers correctly in data-only mode (§6a).

### Literature reproduction and layout

Every package built from a generated spec **MUST** use the shared dev-only package `@jspsych-timelines/testing` to test that its options reproduce what the literature varied. It is a `devDependency` and is never published. Packages **MUST NOT** carry their own copy of the harness, the runners or the checks for shared options.

- **Fixture.** `reproduction/spec-observed.json` is the committed record of the task's observed values and study configurations. It is generated from the task's `spec.yaml` and `translations.yaml` with `packages/testing/scripts/fixture-from-spec.mjs <spec-dir> <out.json>`, never copied by hand. The specs live in a private repository, so each package commits what it needs.
- **Level 1 and level 2.** All runs are seeded.
  - Level 1 builds each distinct typed observed value on its own, plus any companion settings needed to make it observable. It simulates the result with `jsPsych.simulate(..., "data-only")` and runs that option's check.
  - Level 2 builds each fully typed study configuration with all its options at once. It ties the resolved options to the values the study reports, then runs the check of every option the study names.
- **Checks.**
  - **Shared checks.** Vocabulary options whose effect shows in the standard data fields (§4) use the shared checks of `@jspsych-timelines/testing`:
    - counts: `n_test_trials`, `practice_trials`, `n_blocks`, `trials_per_block`;
    - design: `condition_proportions`, `condition_set`, `trial_order`, `sequence_constraints`;
    - timing: `response_window_ms`, `stimulus_duration_ms`, and the `duration` options such as `fixation_duration_ms`, `iti_ms` and `feedback_duration_ms` (including jitter range, step and seeding);
    - feedback and response: `trial_feedback`, `feedback_condition`, `response_keys`, `response_device`.
  - **What the package supplies.**
    - a data contract (`reproduction/contract.ts`) that names the fields and parts the shared checks read;
    - an adapter (`reproduction/adapter.ts`) that converts spec values into its options;
    - its own checks (`reproduction/checks.ts`) for task-specific options.
  - **No weakening.** A package **MUST NOT** weaken a shared check; it adds assertions with `extendCheck`. A task without a correct answer sets `fields: { correct: null, correct_response: null }` in its contract, and the shared checks then work from the responses alone. When the responses are on rows other than the scorable one (a `choice` part), `scope` points the check at them. If a shared check still assumes something the task can't meet, fix the check in `@jspsych-timelines/testing` rather than replacing it in the package.
  - **Raw values.** The adapter gets the dossier's raw values next to each typed value (`adapt(..., { raws })`, `adaptConfig(options, { raw })`), for detail the typed value lost (a level count, a per-trial draw). It reads detail from them, never the value itself.
- **Gaps.** A typed value the package can't express is classified, not skipped silently: package fix needed, option missing, plugin needed, dossier value wrong, or genuinely contradictory.
- **Tallies.** The counts (observed, typed, level 1 checked and not expressible, level 2 fully expressible) are asserted against the committed `reproduction/expected-tallies.json`, so a regression or an improvement shows up as a diff.
  - `UPDATE_REPRODUCTION=1 npx jest` rewrites the tallies, `reproduction/results.json` and `reproduction.md`. A package with bundled stimulus sets passes its `utils` to `defineReproduction`, so `results.json` writes them as `$util` references instead of whole sets.
  - `reproduction.md` is generated. Hand-written commentary goes in `reproduction/notes.md`.
- **Layout.** A package with a centred stimulus (§5) **MUST** have `reproduction/layout.config.mjs` and pass the browser layout check of `@jspsych-timelines/testing` before release. Run it after building with `node ../testing/scripts/layout-check.mjs reproduction/layout.config.mjs`. Variant options are JSON, so a bundled stimulus set is a `$util` reference there too, and a package with several bundled sets checks each of them once.
  - The check passes when the stage centre is identical (±1 px) on every screen type, at a narrow and a wide viewport, for each response device.
  - The check moves through the task by pressing keys and clicking the first enabled `.jspsych-btn` on each screen. Put the button that advances first, or give other buttons (e.g. "Listen again") a class of their own.
  - It needs Chrome, so it isn't part of `npm test`. The jsdom test of the anchored wrapper (§5) is.

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

The extreme-rate correction stays local but **MUST** be the same, and named the same, in every package that computes d′: the 1/(2n) correction (Macmillan & Kaplan, 1985), which replaces a rate of 0 with 1/(2n) and a rate of 1 with 1 − 1/(2n), n being the number of trials the rate is over, and leaves other rates alone. Name it `"1/(2n)"` in docs and comments. `oddball` and `continuous-performance-test` currently label theirs "log-linear" while applying `(count + 0.5)/(total + 1)` only when the rate is exactly 0 or 1. That is neither method: the log-linear correction (Hautus, 1995) applies `(count + 0.5)/(total + 1)` to every rate, and Macmillan & Kaplan's is 1/(2n). Both packages move to 1/(2n).

### Where shared code goes

For each piece of shared logic, ask whether an ordinary jsPsych experiment, with no timeline package, would want it.

- **Yes → jsPsych core, or a standalone `@jspsych/*` library.** Examples: adaptive staircases (`jsPsych.adaptive`, in core since 8.4.0) and constrained sequence generation (`@jspsych/sequencer`, a dependency-free library in its own repo, jspsych/sequencer). Packages that need a core addition wait for, or build against a pre-release of, the jsPsych version that has it.
- **Only meaningful with the options vocabulary → `@jspsych-timelines/core`.** This is the one shared package in this repo. It is deliberately small: the vocabulary's TypeScript types, `resolveOptions` (defaults, practice overrides, absence normalization), and data tagging. It contains **no** timeline units. Common pieces such as fixation, feedback and practice loops are built in each package; if one is truly needed everywhere, it becomes a jsPsych plugin.
- **Specialized → an established library** (e.g. `simple-statistics`, above).
- **Task-specific → the package.**

There is still **no** general `@jspsych-timelines/utils` package. The one other shared package is `@jspsych-timelines/testing`. It is private and dev-only, and a package's `src/` never imports it (§9).

---

## 12. Documentation

Documentation is split between a thin package README, which is the npm landing page, and the documentation site, which is canonical for the full reference.

### Documentation site

The site is a Docusaurus project at `website/` in the repository root, built on `@jspsych/docusaurus-preset` and `@jspsych/docusaurus-theme`, following the layout established in `jspsych-multiplayer`. It is **not** an npm workspace — it keeps its own `package-lock.json` — and is built by `website-preview.yml` on pull requests touching `website/**`, `packages/**` or `vocabulary/**`, and deployed by `website-deploy.yml` on merge to `main`. A package with a page is listed in `website/docs-packages.json`.

Every package **MUST** have a reference page at `website/docs/reference/<task-name>.mdx` containing:

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

### Presets and the quick demo

The interactive example on the reference page (`TimelineExample`) offers a Preset menu, read from `x-jspsych-presets` in `docs-meta/options.meta.json`.

- **The first preset MUST be a quick demo,** with `id: "quick-demo"` and `label: "Quick demo"`. It exists so that a reader can try the whole task, walkthrough to end screen. It **MUST** take at most 3 minutes for someone who responds promptly. Check this by running it in the browser once, and say how long it took in DEFAULTS.md. It is not from a study, and its description says so.
- **It only shortens the task.** It keeps the default instructions, including the interactive walkthrough (§6a), and sets the vocabulary's count options to small values. If counts alone can't bring it under 3 minutes, it may also shorten what sets the task's length or pace: a staircase's stop rule or start level, a session's time limit, an effort target, an ITI. It never changes what is being measured, and DEFAULTS.md lists each such setting. Typical settings are `practice_trials: 4`, `n_test_trials: 12` and `n_blocks: 1`. A task without those options uses its own length options, such as list length or number of rounds. The values **MUST** be valid for the task's design, for example a multiple of the number of conditions when proportions must be exact.
- **The other presets are the study configurations** from the spec, after them. Each is labelled with the spec's `label`, in one format for every package: "Surname et al. 2024, Journal" ("Surname" for one author, "Surname & Surname" for two; the full journal title; the print year when there is one; a preprint names its server, e.g. "PsyArXiv"; two configurations from one paper are numbered "(1)", "(2)"). A software reference implementation is labelled with its name, e.g. "PsyToolkit letter flanker"; a note such as a licence or commit goes in the description (`label_note`). Don't write labels by hand: the spec generator makes them from the DOI record.
- **A study preset needs at least one reported value that changes what runs.** A study whose expressible values all equal the package defaults, or that has none, gets no preset. One value is enough: a study that reports only its stimulus set (words where the default is designs) gets a preset.
- **A preset says what it substitutes.** When a preset sets a bundled stimulus set, its description says the items are the package's, not the study's own. When the set stands in for one the study used and the package could not bundle (licensed drawings, say), it says the items are substitutes. Presets are JSON, so a bundled set is written as a `$util` reference (§2a).
- **Regeneration MUST keep it.** Whatever code rewrites the presets (for flanker, the `onUpdate` of its reproduction test) puts the quick demo first and never drops it.
- **A test MUST cover it.** The test checks that the quick demo is listed first, simulates it with `jsPsych.simulate(..., "data-only")`, and checks the practice and test trial counts it promises.
- **The page text** under "Try it" points readers to "Quick demo" in the Preset menu.

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
- [ ] Literature reproduction wired to `@jspsych-timelines/testing`: fixture generated, tallies committed, `reproduction.md` regenerated
- [ ] Layout check passes (packages with a centred stimulus), including the clipping check and, with a fixation mark, `markSelector`
- [ ] All text is body size (§5); walkthrough captions match a non-default configuration; the page before practice says what changes (§6a)
- [ ] Study presets use the spec's `label` (§12)
- [ ] Stimulus sets are data: bundled sets in `utils.stimuli`, a researcher's own set accepted, licence kept with each bundled set (§2a); presets name the substitutes (§12)
- [ ] Instruction text tested under a non-default configuration (§6a); a task without a correct answer writes no `correct` field (§4)
- [ ] Simulation produces the task's main effect, checked by a test; time-based stop rules end under simulation (§9)
- [ ] The Quick demo's non-count settings, if any, are listed in DEFAULTS.md (§12)
- [ ] `npx prettier --check "packages/<name>/src/**/*.ts"` passes
- [ ] `npm pack --dry-run -w @jspsych-timelines/<name>` contains only intended files
- [ ] `main`, `module`, `exports`, and `unpkg` all point at files the build actually produces
- [ ] No `Math.random()` in `src/`; no hand-rolled `mean`/`shuffle`
- [ ] Every CSS selector is scoped under `.jspsych-timelines-<name>`; no generic mobile CSS
- [ ] Every trial sets `css_classes`
- [ ] `task_version` is imported from `package.json`
- [ ] The scorable trial is tagged `phase: "practice" | "test"` and `part: "response"`
- [ ] No jsPsych-owned column (`trial_type`, `trial_index`, `time_elapsed`, `plugin_version`) is written by the package
- [ ] Scoring reports measures and never excludes or flags participants on performance
- [ ] Withhold trials can be simulated as withheld; timeouts record `response: null`
- [ ] Site reference page exists at `website/docs/reference/<name>.mdx` and the package is listed in `website/docs-packages.json`
- [ ] The first preset is the tested "Quick demo", runs in 3 minutes or less (§12)
- [ ] README is thin and links to the site
- [ ] `examples/index.html` runs against a fresh build
- [ ] A changeset exists
- [ ] Composed smoke test: this timeline plus two others in one experiment, styling and data intact
