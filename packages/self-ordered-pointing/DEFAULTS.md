# Self-ordered pointing defaults: where they come from and what was changed

The task is the spec's "Self-ordered pointing task" (`specs/self-ordered-pointing`). The spec's anchor is the TaskBeacon reference implementation (S019, MIT; PsychoPy, with a browser companion S020), which the dossier says agrees with Inquisit's SOPT (S024, proprietary, parameters only) and with the most detailed lab paper (Geva et al. 2016, S010): 6, 8, 10 and 12 items, three series each, increasing load, positions reshuffled on every page, untimed, no feedback. `escalate: false`; no human decision was recorded. The canonical paper (Petrides & Milner 1982, S005) was only available as an abstract.

What the anchor does: each series shows the same N items on N successive pages in a grid of fixed slots; the participant clicks an item they have not picked yet; positions reshuffle on every page (consecutive arrangements never identical); a 250 ms blank separates pages (the reference implementation's own digital adaptation, no paper reports one); no practice, no feedback, no marks on picked items; set sizes run in ascending blocks; the first N items of one pool are reused across set sizes (nested). Errors are reselections.

## Vocabulary used here

A **series** is one run through a set (N pages), which the literature calls a "trial". A **page** is one screen and one scorable row (`part: "response"`). `trials_per_condition` counts series; `practice_trials` counts practice series. `block` is one set size in the grouped orders (`ascending`, `descending`, `fixed`), one block of every series under `random`, and `trials_per_condition` blocks of one series per size under `random_within_block`. `trial_index_in_block` is the position of the series in its block, which in the grouped orders is the spec's "trial (series) number within set size" (`set_size_trial` carries that number for every order).

## Needs human decision

| Item | Package value | Why it is open |
|---|---|---|
| `reshuffle_proportion` (task-specific) | 0.5, and at least two items move | `partial_reshuffle_each_page` is S014's "the order of some of the items was rearranged". The paper gives no number. |
| `feedback_duration_ms` | 800 | The spec has no such option (no SOPT shows feedback). The vocabulary option exists for practice feedback, so the package needs a value; nothing in the dossier supports one. |
| Practice default `trial_feedback: "accuracy"` | "New" / "Picked before" after each pick in practice, nothing in the test | S019 shows no feedback and no practice. Practice exists (default 0 series) to learn the rule, and a hint after a repeat is what the walkthrough teaches, so practice repeats the signal. S024's practice feedback is not documented. |
| `block_order: "random"` | One block holding every series in random order | S040's flagged translation ("eight randomized blocks", 4 sizes x 2 trials) could also mean each series is its own block, or every block holds every size once (`random_within_block`). The dossier does not say; both other readings are available as options. |
| The position rule when it is not enforced | `"none"` by default | S019 and S054 have no rule; S010 instructs it, S055 enforces it, S024 detects strategies. The thresholds of S024 are not published, so `detect_and_remind` reminds when the run exceeds `position_repeat_max` (2). |

## Defaults changed from the spec

| Option | Spec default (basis) | Package default | Reason |
|---|---|---|---|
| `population_protocol` | `"child"` (fill, 2/3) | `"standard"` | The anchor is the adult protocol. The fill is a majority of the three typed values, and two of them are preschool studies; the child protocol (picture cards, pre-training, discontinue rule) is not implemented and throws. |
| `instruction_language` | `"Chinese"` (anchor) | not an option | Languages are the `text` option in every package. No translation is bundled, so the English default is not the anchor's language; the study presets that name a language leave it out and the report lists it as a gap. |
| `adaptive` | `{ procedure: "fixed" }` (components) | `null` | "fixed" is not in the schema's `adaptive.procedure` enum; PACKAGE-STANDARD §2a writes a bundle switched off as `null`. IRT-CAT (S040) and ascending-until-fail (S056) throw. |
| `sequence_constraints` | `null` | `position_repeat_rule: "none"` | `sequence_constraints` orders generated trials; the rule here constrains the participant's picks, so it is a task-specific option (see below). |
| `stimulus_set` | `"abstract_designs"` (anchor) | `{ items: utils.stimuli.abstractDesigns, pool: "nested_first_n" }` | The spec has two components under `stimulus_set` (the items and the pool across set sizes); the package keys them `items` and `pool` (PACKAGE-STANDARD §2a: task vocabulary in values). The designs are this package's own (below). |
| `error_correction_procedure` | `"none"` | `"none"` | Kept. The other values throw. |

## Spec defaults kept

| Option | Default | Source | Check |
|---|---|---|---|
| `iti_ms` | 250 | S019 | The blank before every page, including the first of a series. Rows `part: "iti"`. |
| `response_window_ms` | `null` | S012, S014, S040, S019 | Untimed. A window records a miss as no pick. |
| `stimulus_layout` | `"fixed_grid_slots"` | S019, S014, S010 | Rows and columns follow the set size (6: 2 x 3, 8: 2 x 4, 10: 2 x 5, 12: 3 x 4). |
| `rearrangement_rule` | `"full_reshuffle_each_page"` | S019 and three more | A page's arrangement is never the one before. S019 rejects identical consecutive orders by retrying; the package rotates a repeated draw by one slot instead (no retry loop, PACKAGE-STANDARD §3). |
| `block_order` | `"ascending"` | S019, S024, S053, S054 | |
| `set_sizes`, `trials_per_condition` | [6, 8, 10, 12], 3 | S019, S024; S010 adds 4 | 12 series, 108 pages. |
| `response_device` | `"mouse"` | S019, S040 | `"touch"` is the same click handler, with "tap" in the instructions. |
| `practice_trials` | 0 | S019 | The anchor has none. S024 and S054 use 2, S053 3: those are study presets. The walkthrough still teaches the rule. |
| `practice.set_sizes` | [3] | S054 | S053 uses 4, S056 2. |
| `trial_feedback` | `"none"` | S019 | |
| `adaptive`, `error_correction_procedure` | `null`, `"none"` | S019, S024 | |

## Task-specific options (not in the vocabulary)

- `position_repeat_rule` (`"none"`, `"instructed"`, `"enforced"`, `"detect_and_remind"`) and `position_repeat_max` (2). The spec could not type the studies' rule (S010 instructed, S055 enforced, S024 detects) because `sequence_constraints` orders generated trials. Implemented on the fixed grid only: `"enforced"` switches the position of the last `max` picks off for one page (and moves the only item left out of that slot so the page can be completed); `"detect_and_remind"` allows the pick and shows a reminder page; `"instructed"` adds an instruction page. Not exercised by the generated reproduction fixture (its values are untyped); covered by `src/index.spec.ts`.
- `reshuffle_proportion` (above).
- Deferred: "terminate the set after repeated errors" (S056): the count is not given and the only study that uses it is the preschool protocol, which is not implemented.

## Stimuli

`stimulus_set.items` is a stimulus set (data), not a name: the bundled sets are `utils.stimuli.*` and a researcher's own set has the same shape (PACKAGE-STANDARD §2a). Presets and shared links write a bundled set as `{"$util": "stimuli.<name>"}`, which the docs theme resolves. The spec's values map to the bundled sets in `reproduction/adapter.ts` (`STIMULUS_SETS`).

The designs of Petrides & Milner 1982 have an unclear licence, so the default items are the package's own: 48 Attneave-style random polygons (7 to 10 vertices at jittered equal angles, radius 0.38 to 1.0 of the box), generated once with a seeded generator and committed in `src/shapes.ts`, picked farthest-first by a radial signature so the first N are the N most distinct (nested pools use the first N). Words are 48 common concrete nouns and nonwords 48 pronounceable strings, both hand-made (`src/wordlists.ts`). The MIT reference implementations (S019, S020) were read for parameters only.

**Representational drawings (needs human decision).** S024 (Inquisit, proprietary), S055 and S056 used drawings. No normed picture set with an open licence was found (MultiPic's site states no licence; Snodgrass-Vanderwart style sets are research-use only), so `utils.stimuli.representationalDrawings` is 48 outline drawings from Lucide (lucide-static 1.78.0, ISC; none of the Feather-derived icons, which carry an MIT notice too), committed in `src/drawings.ts` with the licence. They are icon-style, not normed. The order is round-robin over seven categories (animals, food, tools, household, vehicles, clothing, other), so a set of the first 12 spans them all. The presets of these three studies use this set and say in their description that the drawings are substitutes.

The abstract-design pool is a fixed order, not drawn per participant: the reference implementation uses one fixed seed for every participant (`seed_mode same_across_sub`), so the items are the same for everyone, and only positions are random (through `jsPsych.randomization`, so `setSeed` reproduces a run).

## Walkthrough, practice, Quick demo

The interactive walkthrough (PACKAGE-STANDARD §6a, a documented exception to evidence-anchored defaults) uses a set of three of the task's own items on its own grid: pick any item; the items move; pick one you have not picked yet; pick the one that is left. A repeat shows a hint and the step repeats (items moved again), up to 3 times; then the item that was not picked is shown and counted as picked. Under `distinct_per_set_size` the walkthrough items are not used in practice or test.

The Quick demo (first preset): the walkthrough, 2 practice series of 3 items, 2 test series (4 and 6 items). It only shortens the task: `practice_trials: 2`, `set_sizes: [4, 6]`, `trials_per_condition: 1`. Measured in headless Chrome at 390 x 800 with a click every 1.5 s (reading time of the text pages not included) it took 65 s; with about 5 s of reading on each of the 12 text pages and a little longer on the larger sets it is about 2 minutes, under the 3-minute limit. It sets no timing or stop-rule options.

## Notes on the standard

- No exclusion on performance: `total_errors` and the other measures are reported, never judged. The literature (Ross et al. 2007) gives reliabilities, not a cutoff.
- `practice_criterion` is not an option (the spec has none for this task).
- Feedback shows no response time. The task has no speed feedback.
