# Granularity and naming rules for the cross-task vocabulary

**Status.** Final, decided 2026-11-13. The decisions and their evidence are in `OPEN-RULES.md`.

**Purpose.** These rules say what counts as one parameter, what it's called, and how a dossier variation
maps onto it. They bind the reconciliation run and any later standardization.

Terms:
- **Parameter:** an entry in `vocabulary.yaml`.
- **Variation:** a row in `input/variations.tsv`, written `task::name`.
- **Option:** what a package exposes as a `<Task>Options` property.

---

## A. General rules

**R1. One parameter per independently settable axis.** If a user could change A without changing B, A
and B are two parameters. Exception: a bundle (R16) groups axes that are always configured together.

**R2. Absence is a value, not a switch.** There is no extra boolean such as `fixation_shown`. How absence
is written depends on the type:

| Type | Absent value | Examples |
|---|---|---|
| Enum | `"none"` (a documented member of the value list) | `trial_feedback: "none"` |
| Limit or duration whose absence means *unbounded* | `null` (as jsPsych's `trial_duration: null`) | `response_window_ms: null` (untimed), `stimulus_duration_ms: null` (until response) |
| Duration or count whose absence means *doesn't happen* | `0` | `fixation_duration_ms: 0`, `practice_trials: 0` |
| Bundle (object-valued parameter) switched off | `null` | `adaptive: null` |

`undefined` (option not given) always means "use the package default". Strings that dossiers recorded in
numeric fields, such as `"until_response"` or `"none"`, are written as `null` in the vocabulary.

**R3. Counts are separated by what is counted.** `n_test_trials`, `trials_per_block`, `n_blocks`,
`trials_per_condition` and `practice_trials` are distinct parameters.

**R4. One parameter per kind of check.** `attention_checks`, `comprehension_check`, `headphone_check`,
`audio_check`, `screen_calibration`, `volume_calibration` and `device_eligibility` are separate.

**R5. Variants are values.** A named variant of a task, or a change to what the task measures, maps to
`task_variant` (TEMPLATE rule 8). It is not a parameter of its own.

**R6. Deadline = window = time limit.** These all map to `response_window_ms`, with `null` meaning untimed.

**R7. The layer follows what the parameter changes** (TEMPLATE rule 4), not where the dossier filed it.

**R8. What counts as shared.** Two variations from different tasks are the same parameter when a package
author would give them the same option name with the same meaning. They count as the same even if the
values or units differ by task. A shared parameter must appear in at least 2 tasks. A variation that only
partly matches maps as `narrower` or `overlapping`, not as task-specific.

**R9. Map keys use the task's own names.** When a parameter's value is a map over stimuli or conditions,
the keys are the task's own names: `{ cue: …, target: … }`, `{ stop: 0.25, go: 0.75 }`. The vocabulary has
no cross-task list of roles or conditions.

## B. Phase

**R10. Phase is a qualifier, not part of the name.** A variation that applies to one phase maps to the
phase-agnostic parameter, with the `phase` column set to `practice`, `training` or `test`. Examples:
`trial_feedback_practice`, `practice_feedback_duration_ms` and `training_iti_ms`.

`all` or an empty value means the variation applies to every phase. In packages this becomes one override
block: `practice: { trial_feedback: "accuracy" }`.

`practice_trials` is not a phase version of `n_test_trials`. It stays a separate count (R3).

## C. Specific concepts

**R11. Trial feedback is content first.**

| Parameter | Meaning |
|---|---|
| `trial_feedback` | What is shown: `none`, `accuracy`, `rt`, `accuracy_rt`, `points`, `reward_outcome`, `correct_answer`, … |
| `feedback_condition` | On which trials: `all`, `errors_only`, `correct_only`. Ignored when `trial_feedback` is `none`. |
| `feedback_duration_ms` | How long feedback is shown |
| `feedback_delay_ms` | Gap between the response and the feedback |

Some feedback concepts stay separate: `block_feedback`, `end_of_task_feedback` and `timeout_feedback`.

RT-only feedback is `trial_feedback: "rt"`. A separate `rt_feedback` parameter exists only where RT
feedback is set independently of accuracy feedback.

**R12. Stimulus material is one generic `stimulus_set`.**
- In a task with several kinds of stimulus, the value is a map keyed by the task's own names (R9).
- A variation that varies only part of the set maps to `stimulus_set` as `narrower`. Examples: a cue
  form, flanker form or distractor set.
- For such variations, the `note` column records the task's role word as free text, e.g. `role: cue`.
- Attribute parameters stay separate, because they're independently settable (R1): `stimulus_size`,
  `stimulus_color`, `stimulus_language`, `stimulus_eccentricity` and `stimulus_modality`. A role-specific
  attribute, such as `target_size`, maps to the attribute parameter as `narrower`, with `role:` in the
  note.
- Per-role durations, such as `cue_duration_ms`, are timing parameters and are unaffected by this rule.

**R13. Trial-type proportions are one `condition_proportions` map.**
- The map is keyed by the task's own trial-type names (R9).
- A variation giving a single event's rate maps as `narrower`. Examples: `stop_signal_probability`,
  `target_proportion`, `lure_proportion`, `catch_trial_proportion` and P(go).
- The exception is `cue_validity_proportion`, which stays its own parameter. It is conditional on cued
  trials.

**R14. The response is described by device plus format.**
- **`response_device`:** `keyboard`, `mouse`, `touch`, `microphone`, `eye_tracker` or `gamepad`.
- **`response_format`:** the shape of the response. Values are `single_response` (go/no-go,
  detection), `n_afc` (with a count), `rating` (scale points or slider), `free_text`, `location` and
  `none` (passive).
- **Modality is implied** by device plus format and is not a parameter. A dossier variation about
  modality maps to `response_device` as `overlapping`. Examples: spoken vs typed, `vocal_response`,
  saccadic vs manual.
- **What is judged is not a format.** Detection vs localization, change vs localization, recall vs
  recognition, and same/different vs higher/lower are task-specific or `task_variant` (R5).
- **Split mixed variations.** A variation that mixes a format with a judgement is split. For example,
  `change-detection-tasks::judgement_type` splits into `response_format` plus a task-specific
  judgement.
- **Response keys stay separate:** `response_keys`, `response_key_mapping` and
  `response_mapping_counterbalancing`.

**R15. Ordering uses four parameters.**

| Parameter | Meaning | Values |
|---|---|---|
| `block_composition` | What each block contains. A list when the session has several kinds of block. | `mixed`, `single_condition`, `alternating_runs` |
| `block_order` | The order of blocks or conditions across the session | `fixed`, `random`, `counterbalanced`, `ascending`, `descending`, `alternating` |
| `trial_order` | How trials are ordered within a block | `random`, `shuffled_list`, `fixed_sequence` |
| `sequence_constraints` | A map of constraints using the task's own names (R9) | Recurring keys are `max_run`, `min_gap` and `no_immediate_repeat`. Other constraints are free text. |

A fixed schedule of levels, such as set sizes in ascending order, is `block_order`.

Recall order (serial vs free) is a response rule, not ordering. It is task-specific or a shared
`recall_order` parameter in the response layer.

**R16. Load and adaptive procedures.**
- **`set_sizes`** is always a list; a single load is `[6]`. Span list lengths are set sizes. N-back's
  level of *n* is not a set size, and keeps a task-specific name.
- **`adaptive`** is a bundle. Its value can be passed whole to a shared helper. Its fields are:
  - `procedure`: `staircase_1up_1down`, `staircase_1up_2down`, `staircase_1up_3down`,
    `ascending_discontinue`, `quest` or `rt_based`
  - `start_level`: in the task's own unit
  - `step_size`: a number, or `{ up, down }`
  - `target_accuracy`
  - `bounds`: `[min, max]`
  - `discontinue_rule`
- **What counts as adaptive.** Anything whose next level depends on performance belongs in `adaptive`,
  including ascend-until-failure.
- **Overrides.** A practice override replaces the whole bundle, e.g. `practice: { adaptive: null }`.
- **Removed parameters.** `load_progression_rule` and separate `adaptive_*` parameters do not exist.

## D. Bundles and field mapping

**R17. Bundles.** A bundle is a parameter with `type: object` and a `fields:` list in `vocabulary.yaml`.
Only groups that are configured and overridden as a unit become bundles. At present the only bundle is
`adaptive`.

A variation that sets one field maps to `<bundle>.<field>`, e.g. `countermanding::ssd_step_ms` →
`adaptive.step_size`. Per-field counts across tasks then still work.

## E. Mapping file conventions

`mapping.tsv` has the header `uid	canonical	relation	action	split_into	merge_with	phase	note`.

**`canonical`** is a parameter name or `<bundle>.<field>`. It is empty for `task-specific`.

**`relation`** takes one of these values:

| Relation | Meaning |
|---|---|
| `equivalent` | Same concept, same scope |
| `narrower` | The variation covers part of the parameter: one role, one event, one phase-specific aspect |
| `broader` | The variation bundles more than the parameter. Usually paired with `action: split`. |
| `overlapping` | Partial overlap in both directions |
| `task-specific` | No counterpart in another task |

**`action`** is `keep`, `split` or `merge`:
- **`split`:** lists the targets in `split_into`, separated by `;`. A target is a canonical or
  `task:<new_name>`.
- **`merge`:** names the other uid(s) from the same task in `merge_with`.

**`phase`** is `practice`, `training`, `test` or empty (R10).

**`note`** holds free text. It carries `role: <word>` where R12 applies. It also holds the reason for any
judgement that isn't obvious.
