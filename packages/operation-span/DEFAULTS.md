# Operation span defaults: where they come from and what was changed

The task is the spec's "complex span" (`specs/complex-span`); the package keeps the published name `operation-span`, because the anchor is the automated operation span of Unsworth, Heitz, Schrock and Engle (2005, S006; Engle lab), summarised for the family by Redick et al. (2012, S008) with the procedural recommendations of Conway et al. (2005, S007). Reading, symmetry and rotation span are the spec's deferred `processing_task` variant: `task_variant` accepts only `"operation_span"` and throws naming the others.

The spec marked the anchor `escalate: true` (reason: `processing_pacing_rule`, decision `null`). The pacing rule and the items below were reviewed: the maintainer accepted these defaults on 2026-11-16. Everything else follows the anchor, with the changes listed here.

What the anchor does (S006, dossier `canonical_design`): three practice parts (letters only; 15 processing problems, self-paced, whose mean and SD set the time limit; 3 combined trials of set size 2), then 15 test trials (3 each of set sizes 3-7, random order per participant). Each trial alternates a problem ("(2 x 3) + 1 = ?", solved in the head, click, then a true/false answer screen) with a letter shown for 800 ms, then a 4 x 3 letter matrix for serial recall with blank and clear buttons. The problem screen is timed at mean + 2.5 SD of the practice solution times; the answer screen is not (S017, after Unsworth's clarification). Feedback after each trial (letters recalled, math errors, running math accuracy) for 2000 ms. Partial-credit scoring; participants below 85% processing accuracy are excluded.

## Decided after review (2026-11-16)

| Item | Package default | Why it is open |
|---|---|---|
| **Processing pacing rule** (`response_window_ms`) | `utils.deadlines.meanPlusSd(2.5)`: mean + 2.5 SD of the correct processing-only practice RTs, 6000 ms until there are 5 usable RTs | The spec's escalation. The anchor (S006, S017) individualizes the deadline; two of the three online studies that give a number use a fixed one (6, 7 or 10 s), and S007 warns that generous fixed deadlines let fast processors rehearse. The spec had no typed form for the rule, so its option-level default was the fill value 6000. The rule is implemented as a function (PACKAGE-STANDARD §2a), is the default (anchor wins), and `response_window_ms: 6000` reproduces the fixed-deadline camp. A human should confirm anchor over fill. |
| **Fallback deadline** | 6000 ms | Used until 5 correct processing-only practice RTs exist (for example with `practice_trials: 4`). 6000 ms is the spec's fill value (2 of 6 fixed deadlines). The anchor has no fallback because its practice always yields enough RTs. |
| **Which phases the calibrated deadline times** | The processing-only practice is self-paced; the combined practice and the test use the calibrated deadline | S006 computes the limit from the processing-only practice; the dossier does not state whether the combined practice is timed. The package times it (the limit is then in force for the first time under combined load, as in the test). With a fixed `response_window_ms` the processing-only practice is still self-paced unless `practice.response_window_ms` is given. |
| **Letters-only practice** | 4 trials, set sizes from `practice.set_sizes` (default 2) | The dossier gives only PsyToolkit's "4 sets of 2-3 letters" (S017). |
| **Practice processing accuracy** | Reported (`processing_accuracy`), never judged | The anchor (S006, S007) excludes participants below 85% math accuracy after the fact. The package reports `processing_accuracy` and leaves exclusion to the analysis (PACKAGE-STANDARD §2, `utils`). `practice_criterion` (S036 uses 85% over 10 trials) is available and off by default. |
| **`end_of_task_feedback`** | `"none"` | The spec has no typed value for the anchor (S027 shows percentage success at the end). |

## Defaults changed from the spec

| Option | Spec default (basis) | Package default | Reason |
|---|---|---|---|
| `response_window_ms` | `6000` (fill, 2/6) from the component `processing_deadline_ms`; the anchor's rule untyped | the calibrated-deadline function (above) | The anchor's rule has no typed form; PACKAGE-STANDARD §2a makes computed values functions with prebuilt helpers. |
| `inter_item_interval_ms` | `500` (fill, 1/2: one jsPsych implementation, S020) | `0` | The anchor shows the next event immediately after the previous one, and S007 recommends no free time between events (free time allows rehearsal). A 500 ms gap would also lengthen every trial by up to 7 s. |
| `stimulus_language` | `"Portuguese"` (fill, 2/4) | `null` | The default material is letters and equations, which have no language. The spec's values (Dutch, German, Portuguese) belong to word and sentence materials, for which the package has no lists; any value throws naming the option, and own words go in `stimulus_set.memorandum` as a set. |
| `instruction_format` | `null` (the fill, "video then written", is untyped) | `"text"` | Video needs media; `"experimenter"` skips the pages. |
| `trial_feedback` | `"accuracy"` (anchor) | `"accuracy"` in practice and test | Kept. The content is the anchor's (letters recalled, math errors, running math accuracy), with no response time (PACKAGE-STANDARD §2a). `"correct_answer"` adds the presented sequence. |
| `practice_trials` | `15` (anchor, component `processing_practice_trials`) | `15` | Kept, with a precise meaning: processing-only practice problems. The spec has no option for the other practice parts, so the package adds `practice_structure`, `practice_storage_trials` and `practice_combined_trials` (task-specific, from the dossier's `phase_structure`). |
| `end_of_task_feedback` | `null` (anchor, untyped) | `"none"` | Absence of the enum. |
| `set_sizes` in practice | n/a | `[2]` (`practice: { set_sizes: [2] }`) | S006: three practice trials of set size 2. The top-level `set_sizes` are the test loads and never leak into practice (see the report on the precedence rule). |

## Spec defaults kept, with the coherence check

| Option | Default | Source | Check |
|---|---|---|---|
| `feedback_duration_ms` | 2000 | S006 Fig. 1 | Shown after every recall (and after each problem in processing-only practice). |
| `stimulus_duration_ms` | 800 | S006 | The memorandum, one letter at a time. |
| `stimulus_set.memorandum` | `utils.stimuli.letters` | S006 (also S028) | The 12 consonants of the Engle-lab task (F H J K L N P Q R S T Y). The spec's `memorandum_type` values map to sets: `letters` and `digits` (S020) to the bundled `utils.stimuli.letters` and `utils.stimuli.digits`; `words` (S034, S043) to no bundled set (see "Memorandum sets" below); `grid_locations` and `arrows` are spatial and not implemented. |
| `block_order` | `"random"` | S006 | One block of 15 trials, set sizes shuffled per participant. `"random_within_block"` gives `trials_per_condition` blocks of one trial per set size. |
| `n_test_trials`, `set_sizes`, `trials_per_condition` | 15, [3-7], 3 | S006 | Consistent: 5 x 3 = 15. The three are reconciled; a contradiction throws. |
| `memorandum_order_in_pair` | `"processing_first"` | S006 | The last event before recall is a letter (the recency item). |
| `processing_items_per_memorandum` | 1 | S006 | |
| `processing_display_format` | `"problem_then_answer_screens"` | S006 p. 502 | Timing: the problem screen is timed and ends when the participant says it is solved (a click, or the space bar with the keyboard); the answer screen is untimed. |
| `response_device`, `response_format` | `{ processing: "mouse", recall: "mouse" }`, `"n_afc"` | S006 | The 12-letter click matrix (4 x 3) with blank and clear buttons; Done submits. |
| `response_order`, `recall_omission_handling` | `"serial"`, `"blank_button"` | S006 | A blank keeps later items in their serial position. |
| `speed_accuracy_emphasis` | `"accuracy"` | S006 | Instruction text: keep math accuracy at 85% or higher. The 85% is `utils.constants.PROCESSING_ACCURACY_TARGET`. |
| `processing_read_aloud` | `false` | S006 | A boolean in the spec; it only adds an instruction sentence (it cannot be verified online). |
| `practice_criterion` | `null` | S006 has none | S036's `{ accuracy: .85, window: 10 }` is a study preset. |
| `instruction_demonstration` | `"interactive"` | PACKAGE-STANDARD §6a | A documented exception to evidence-anchored defaults. |
| `response_keys` | `["f", "j"]` (true, false) | not in the spec | Letters, one per hand (PACKAGE-STANDARD §2a); only used when the processing device is the keyboard. The dossier names F/J and a/l without counts. |

## Memorandum sets (PACKAGE-STANDARD §2a)

`stimulus_set.memorandum` takes a set, `{ name?, noun?, items }`, or a plain array of items. The bundled sets are values of the same type: `utils.stimuli.letters`, `utils.stimuli.digits` and the stand-in `utils.stimuli.words`. All are short lists original to the package (characters, common nouns), so no licence question arises.

- **Text only.** An item is a string or `{ text, id? }`. `image` and `svg` items throw: recall names the memoranda (the matrix buttons show them, typed and key-press recall match entries against their text, and the feedback and walkthrough texts list them), and no study in the spec used pictorial memoranda (the spatial ones, `grid_locations` and `arrows`, need a location display, not pictures). Supporting pictures would mean a matrix-only mode and an HTML rendering of items in every text that lists them.
- **Ids.** The default id is the text. Rows record the text (`memorandum`, `presented_items`, `recalled_items`, as before) and the id (`memorandum_id`, `presented_item_ids`, `recalled_item_ids`; a typed entry that names no item has a `null` id). Scoring compares texts as before (trimmed, case-insensitive), so two items whose texts differ only in case or surrounding spaces throw, as do duplicate ids.
- **Name and noun.** `name` is recorded as `stimulus_set` on memorandum and recall rows (`"custom"` without one). `noun` is what the instructions, the recall prompt and the feedback call the items; a set without one is called "item"/"items" (not "word", as in self-ordered pointing: a researcher's set here is as likely to be consonants or digits as words).
- **Recall matrix.** It shows the whole set in the order of `items`, `GRID_COLUMNS` (4) to a row, as the Engle-lab matrix does. A long set makes a tall matrix; the layout check includes a 16-word set at 390 x 800.
- **Size.** The set needs at least as many items as the largest set size (test and practice) and at least 2 when the walkthrough runs; key-press recall needs one-character items.
- **Words.** `utils.stimuli.words` is a stand-in: 16 common English nouns original to the package. The two studies that used words (S034, S043) do not report their lists, and the spec's word-related languages (Portuguese, Dutch, German) show that an English list does not reproduce them. Their presets use this set (a `$util` reference, so the docs form can offer it) and say in the description that it is a stand-in; a researcher supplies their own list.
