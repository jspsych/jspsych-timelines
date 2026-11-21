# Two-step task defaults: where they come from and what was changed

The anchor is the Expfactory two-stage-decision task (S024, `experiment.js`, MIT): the spec's automatic pick (typicality .75, coverage .86, lead .36 over Daw et al. 2011, `escalate: false`). The generated spec fills the options the anchor does not report from other sources (basis `fill`). D5 step 4, the coherence check, asked whether the assembled defaults make one working experiment; they do, with the changes below.

What Expfactory does (S024): abstract symbols, 50 practice and 200 test trials in 2 blocks of 100, 2000 ms for each of the two choices, the chosen option shown for 1000 ms, an outcome of 500 ms, a 1000 ms ITI, arrow keys, 70/30 transitions, reward probabilities that start uniform in 0.25 to 0.75 and walk with SD 0.025 inside those bounds (a step that would cross a bound is reversed), a missed trial is skipped.

## Defaults changed from the spec, or typed by the package

| Option | Spec default (basis) | Package default | Reason |
|---|---|---|---|
| `reward_schedule` | the string `"{sd: 0.025, lower: 0.25, upper: 0.75, boundary: reverse_step}"` plus `walk_generated_per_participant` (components) | `{ kind: "random_walk", sd: 0.025, bounds: [0.25, 0.75], boundary: "reverse_step" }` | The spec's value is walk parameters inside a string. The package takes the typed form the translator proposed (`kind`, `sd`, `bounds`, `boundary`), without its `start`: starting values already have a home in `reward_probability`, and two homes for one thing would be a contradiction to detect. Only `random_walk` is implemented; the other kinds (`block_alternating`, `pregenerated_walk_sets`) throw. **Needs human decision:** the anchor reverses a step that would cross a bound (`reverse_step`), but 4 of the 5 walks in the spec reflect (Daw et al. 2011, S025, S029, S047). The default follows the anchor, as the standard asks; `reflect` is one value away. |
| `reward_probability` | `{ state_1: { option_1, option_2 }, state_2: { ... } }`, each a uniform draw from 0.25 to 0.75 | `{ red: { option_1, option_2 }, blue: { ... } }`, the same ranges | Readable keys that name the states by the colour of their screen. **Needs human decision:** the spec's `state_1` / `state_2` and `option_1` / `option_2` are placeholders; `red` and `blue` are the package's states, `option_1` and `option_2` the two options of a state. Leaves are a number, or `{ min, max }` for a uniform draw once per run of trials. A starting value outside `reward_schedule.bounds` throws. |
| `sequence_constraints` | `{}` (anchor: independent per trial) | `null` | `null` is the absent value of the standard; `{}` is accepted and means the same. Ordering rules are not implemented (any rule throws): the only rule in the sources (S026, resample until the realised common share is in [0.6, 0.8]) has no key in the typed form. |
| `response_acknowledgement_ms` (new) | none: the anchor's selection display (1000 ms) is the raw value of `response_acknowledgement` | `1000` | A duration the spec records as the raw value of an enum. The translator proposes `response_acknowledgement_ms`. The Quick demo needs to shorten it. A duration (number, or jitter range), recorded as `response_acknowledgement`. |
| `instruction_demonstration` | none in the spec (added by PACKAGE-STANDARD 6a) | `"interactive"` | The documented exception to the anchor rule (6a). The task has no correct answer, so the walkthrough asks for what the pages said, with the task's own screens and keys: which key chooses which side (a scripted first and second choice), and, by `contingency_disclosure`, where each first-stage option usually leads (`full`) or whether the transitions and reward chances are fixed (`partial`). `"none"` reproduces text-only instructions. |
| `n_test_trials`, `n_blocks`, `trials_per_block` | 200, 2, 100 | same | Three options for one design: any one sets the others, two set the third, three must agree (a contradiction throws). The spec's alternative is 201 (Daw: the first trial has no predecessor); 200 is the anchor's. |

## Spec defaults kept, with the coherence check

| Option | Default | Source | Check |
|---|---|---|---|
| `feedback_duration_ms` | 500 | S024 | The outcome (a coin, or no coin). 0 skips the display. |
| `fixation_duration_ms` | 0 | S024 | The one source with a fixation (S134) has jittered 2000 to 4000 ms before each stage; the package has it before the first stage only. |
| `iti_ms` | 1000 | S024 | |
| `response_window_ms` | 2000 | S024 | For each of the two choices. A trial that is missed ends after the "too slow" message. |
| `timeout_message_ms` | 1500 | fill, S025 (1/2) | The anchor does not report it. |
| `common_transition_prob` | 0.7 | S024 | Task-specific option. |
| `missed_response_handling` | `"skip_trial"` | S024 | The walk moves on. `"repeat_trial"` re-runs the same trial, with the same probabilities and outcomes, **up to 5 repeats** (a package constant, `MAX_TRIAL_REPEATS`): without a limit, a participant who never answers would see one trial for ever. The sources' limit is an abort after N missed trials (S026), a performance gate, which the package does not have. |
| `option_side_assignment` | `"random_per_trial"` | fill, 3/5 | `"fixed"`: one assignment per participant, drawn at random. `"counterbalanced"`: each option is on the left in half the trials of a block. |
| `response_keys` | `["ArrowLeft", "ArrowRight"]` | S024 | Named keys, no punctuation. |
| `practice_trials` | 50 | S024 | **Needs human decision:** 50 practice trials (Daw, Expfactory) are about 4 minutes at the anchor's pace; online studies use 20 to 25 (S025, S047, S022, S138). The anchor value is kept as the standard asks. |
| `comprehension_check`, `fullscreen_enforcement`, `manipulation_check`, `rest_breaks`, `population_protocol` | `"none"`, `"none"`, `"none"`, `"none"`, `"standard"` | S024 | Only `none` / `standard` for the first four: `quiz`, `fullscreen`, ... throw. `manipulation_check: "questionnaire"` and `rest_breaks: "self_paced"` are implemented. |
| `response_acknowledgement` | `"highlight"` | S024 | The chosen option is outlined and the other dimmed. `keypress_mark` throws. |
| `running_score_display` | `"running_total"` | fill, S025 (1/2) | Coins of the phase; practice coins are counted apart. |
| `contingency_disclosure` | `"partial"` | fill, S007 (1/4) | Told that each option mostly leads to one state, not which. The walkthrough shows one scripted transition (to practise the keys), so a participant sees one option lead to its state before practice. |
| `instruction_format`, `instruction_framing` | `"text"`, `"abstract_symbols"` | S024 | `spaceship_planet_alien` is also drawn; the other two cover stories throw. |

## The Quick demo

`practice_trials: 4`, `n_test_trials: 24`, `n_blocks: 1`, plus **two timing settings** (`response_acknowledgement_ms: 400`, `iti_ms: 300`). The standard (section 12) says a quick demo sets only count options. This task needs both: a trial is two choices, two highlights, an outcome and an ITI, about 5 seconds at the anchor's pace, so 24 trials alone would take 2 minutes without them. 24 test trials show the task but cannot show a model-based effect (the split-half reliability of the indices is poor under 100 trials), which the description says. Measured in Chrome with a scripted participant that reads each instruction page for 4 seconds, takes 1.5 seconds on each walkthrough step and responds after 650 ms: **126 seconds** from the first page to the end screen (Chrome, 1280 x 800), against the 3-minute limit; a participant who reads each page for 8 seconds would need about 160.
