## Notes on the operation span (hand-written, `reproduction/notes.md`)

### The package name and the spec's task

The spec is `complex-span`; the package is `operation-span` (PACKAGE-STANDARD §1 wants the directory, npm name and `task` field to match the task name, which here would be `complex-span`). The package keeps its published name because the anchor and the only implemented processing task are the operation span. Reading, symmetry and rotation span are the spec's deferred `processing_task` variant (`task_variant` throws for them).

### Untyped values: classes (hand-written)

| Option / raw value | Source | Class |
|---|---|---|
| `response_window_ms`: `individual_mean_plus_2.5sd` | S006, S017 | option missing in the vocabulary (the spec itself says "no typed form"); the package implements the rule as a function, `utils.deadlines.meanPlusSd(2.5)`, which is the default. A typed spec value cannot express a function, so level 2 does not run S006 (the anchor); `src/reproduction.spec.ts` ties the defaults to S006 instead. |
| `response_window_ms`: `individual_mean_plus_2sd` | S039 | the same, with `utils.deadlines.meanPlusSd(2)` (S039 also puts the memorandum on the equation's screen: `processing_display_format: "equation_and_memorandum_same_screen"`, not implemented). |
| `practice_criterion`: `optional_repeat_if_at_or_below_chance` | S033 | option missing: the participant is *offered* a repeat when at or below chance. `practice_criterion` is an accuracy gate (`repeat`, `continue`, `end`), not an offer, and "chance" depends on the recall format. |
| `instruction_format`: video then written; written or video tutorial | S026, S032 | option missing (`video_then_text`, `text_or_video`) and media needed. |

### Typed values the package does not express

- `stimulus_language` (Portuguese, Dutch, German): option missing. The package has no word or sentence lists; own words go in `stimulus_set.memorandum` as a set (which is expressible: the spec's `words` maps to a stand-in set of 16 English words, `WORD_POOL` in `reproduction/adapter.ts`, which the presets for S034 and S043 carry inline and label as a stand-in). `letters` and `digits` map to the bundled `utils.stimuli.letters` and `utils.stimuli.digits`, which presets write as `{"$util": ...}` references.
- `stimulus_set` memoranda `grid_locations` and `arrows` (symmetry and rotation span): option missing. They need spatial memoranda and a matching recall input.
- `stimulus_set` source `sentence_final_word` (reading span): option missing; needs the sentence processing task.
- `processing_display_format: equation_and_memorandum_same_screen` (S039, lab): option missing.

### Contradictions and oddities in the spec

- **`random_within_block` is typed as `random`.** The translation `blocked_random_within_block` maps to `block_order: random` and notes the loss ("lossy, the one-of-each-per-block structure is not expressible"). The vocabulary has since gained `random_within_block`, and the fixture contains no value that uses it, so the reproduction never exercises it: `src/index.spec.ts` and `reproduction/checks.ts` (`block_order`) test it directly.
- **`practice_structure` is typed as `null`.** The translations map the three structure labels (`storage_processing_combined`, `storage_processing`, `combined_only`) to `{}`, so the fixture carries no typed value although the package has the option (`practice_structure`); the labels are the package's values.
- **`practice_criterion` field names.** The spec's S036 value is `{ accuracy: 0.85, block_trials: 10 }`; `block_trials` is the translator's invention for the vocabulary's `window`. The adapter retypes it, and level 2 compares the retyped value (`reportedValue`).
- **The schema marks `practice_criterion` as requiring `procedure`** (copied from the `adaptive` bundle in `options.schema.json`); the vocabulary's fields are `accuracy`, `window`, `on_fail`, `max_repeats`.
- **`n_test_trials`, `trials_per_condition` and `set_sizes` are redundant.** The anchor's 15 is 5 x 3. The package reconciles them (derive the missing one, throw when they disagree), and level 1 gives each single `n_test_trials` value a companion `set_sizes` that makes it divisible.
- **The draft Quick demo** (`practice_trials: 4`, `n_test_trials: 12`) is not valid for this design (12 is not a multiple of the 5 set sizes) and is far over a minute (4 practice problems leave the deadline calibration without enough RTs). The package's Quick demo uses its own length options.

### Things the checks cannot show (limitations of this reproduction)

- Data-only simulation ignores time, so deadlines, memorandum durations and gaps are shown through the data fields and plugin parameters the package sets, not through measured durations. Browser timing was not verified.
- Simulated RTs are constant (400 ms), so a calibrated deadline would have SD 0; the calibration is tested on hand-built rows with variance and on a run whose simulated RTs vary (`src/deadlines.spec.ts`), not at level 1 or 2.
- jsPsych's data-only simulation of a timed-out button trial leaves `response: 0` in place (it clears only truthy responses) while setting `rt: null`; the package therefore detects a missed deadline by the missing RT.
- Recall is simulated as a correct recall: the recall screen is a custom panel wired in `on_load`, which data-only simulation does not run. The panel itself (matrix, typed boxes, key presses, omissions) is tested in jsdom (`src/recall.spec.ts`).
- `block_order: "random"` and `"random_within_block"` are checked as "differs across seeds", which is deterministic but does not test randomness.
- Level 1 adds companion settings where a single value is not observable alone (a typed recall input for a keyboard recall device or a typed format, a divisible `set_sizes` for `n_test_trials`, a stand-in word pool). The adapter lists every one; the report shows them under "Assumed".
