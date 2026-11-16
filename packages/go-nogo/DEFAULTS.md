# Go/no-go defaults: where they come from and what was changed

The anchor is the Expfactory go_nogo task (S022, MIT, the only jsPsych reference implementation), chosen by the spec generator without escalation (typicality .96, lead .94). The generated spec fills the options the anchor does not state (basis `fill`) and leaves the feedback options at component level (`null`). D5 step 4, the **coherence check**, asks whether the assembled defaults make one working experiment. They do not in the places below; nothing else differs from the spec.

What Expfactory does (S022): one coloured square per trial (orange or blue; which one is "go" is drawn per participant), go probability 0.9, 350 test trials in one block, 10 practice trials at go probability 0.5 with feedback (1000 ms), stimulus 750 ms, response window 1000 to 1500 ms (jittered), no ITI, no test feedback, spacebar.

## Defaults changed from the spec

| Option | Spec default (basis) | Package default | Reason |
|---|---|---|---|
| `trial_order` | `random` (anchor) | `"shuffled_list"` | **Needs human decision.** `random` means independent draws, so a block can have no no-go trial and the proportions are only approximate: with the anchor's 0.9 and the Quick demo's 12 or 20 trials, about 28% (12 trials) of runs would show no no-go trial at all. The standard asks for exact counts per block (largest remainder), which `shuffled_list` gives and which is what Expfactory's list-based design does in effect. `trial_order: "random"` reproduces independent draws. |
| `condition_proportions` | `0.9` (a scalar `go_probability`) | `{ go: 0.9, nogo: 0.1 }` | The vocabulary wants a map keyed by trial type. A single key is accepted and the other is the rest (`{ go: 0.8 }`). Per-block lists of maps are not implemented. |
| `practice` (default) | practice go probability 0.5 and practice feedback content `null` (component default) | `{ trial_feedback: "accuracy", condition_proportions: { go: 0.5, nogo: 0.5 } }` | Expfactory shows correct/incorrect feedback in practice only (1000 ms) and uses equal proportions there (S022). The spec records the feedback content as `null`; correct/incorrect without RT is the reading, and it follows the standard's "no RT in default feedback". A value set at the top level or in `practice` replaces the matching default, so `{ trial_feedback: "none" }` means none anywhere. |
| `feedback_condition` | `null` (component default) | `"all"` | Ignored when `trial_feedback` is `none` (the test). In practice, correct and incorrect are both shown (S022); S175's errors-only feedback is available. |
| `sequence_constraints` | `{}` (anchor: random) | `{}` | Kept, but note the scope: at the top level it applies to the test only. See the next table. |
| `response_keys` | not in the spec (`response_device: keyboard`, raw "spacebar") | `[" "]` | A key option is needed to name the key in the instructions and to run a single-key task on other keys. The space bar is the anchor's key and a named key (allowed). |
| `stimulus_layout` | free text (`"center"`) | `"center"`, with values `center`, `top_center`, `random_2x2_grid` | The spec has no value list. The names are this package's, made from the three layouts the dossier describes that can be drawn (S022, S046, S028). |
| `inter_trial_display` | free text (`"blank"`) | `"blank"`, with values `blank`, `fixation_cross` | Same: the spec's "placeholder grid with stars" (S028) is not implemented and throws. |
| `stimulus_set` | free text (`"coloured squares (orange/blue)"`) | `{ go: blue square, nogo: orange square }`, with `stimulus_role_assignment: "random_per_participant"` | The spec's type `stimulus-set` has no structure. The package uses a map keyed by trial type (`go`, `nogo`) of shapes, colours or text, as the vocabulary suggests. |
| `single_task_blocks` | `none` | `"none"` | Kept. The values `before_dual`, `after_dual`, `interleaved` are named for dual-task designs; here they place one go-only block (16 trials, S183) before the test, after it, or before each test block. |

## Fill-in values kept, with the coherence check

| Option | Default | Source | Check |
|---|---|---|---|
| `response_window_ms` | `{ min: 1000, max: 1500 }` | S022 | The window is sampled per trial and recorded as `response_window`. The stimulus (750 ms) is shorter than the shortest window, so the stimulus goes off and the trial continues until the window ends. `stimulus_duration_ms` longer than the shortest window throws. |
| `trial_termination_rule` | `"fixed_duration"` | fill, 1/2 (S028; S169 says `response_or_timeout`) | Expfactory does not say. Fixed duration matches a response window longer than the stimulus: a response does not end the trial. |
| `speed_accuracy_emphasis` | `"speed"` | fill, 1/2 (S157; S017 says both) | Only the instruction sentence ("Respond as quickly as you can"). The other studies that state it say speed and accuracy. |
| `feedback_duration_ms` | 1000 | S022 | Used in practice only by default (S022's practice feedback). |
| `stimulus_duration_ms` | 750 | S022 | |
| `iti_ms` | 0 | S022 | The trial is its own interval: the window is 1000 to 1500 ms long and the next stimulus follows at once. |
| `n_test_trials`, `n_blocks`, `practice_trials` | 350, 1, 10 | S022 | 350 at 0.9 gives exactly 315 go and 35 no-go. |
| `block_feedback`, `response_acknowledgement`, `rule_reminder`, `pre_block_countdown_ms`, `stimulus_modality`, `response_device` | `none`, `none`, `none`, 0, `visual`, `keyboard` | S022 | |
| `instruction_demonstration` | `"interactive"` | exception (PACKAGE-STANDARD §6a) | One untimed step per stimulus: go, then no-go, then the rest alternating; a no-go step waits 2.5 s. |

## Fixed values the spec has no option for

| Value | Setting | Source |
|---|---|---|
| Size of the stimulus | 100 px | the reference implementations draw large shapes; no study states a size |
| Go-only baseline block | 16 trials | S183 (the one study with baseline blocks) |
| Walkthrough no-go wait | 2500 ms | PACKAGE-STANDARD §6a |
| Response acknowledgement | 150 ms | S028 |
| Deadline helpers' fallback | 1250 ms, and at least 5 correct go practice RTs | the middle of the default window range; PACKAGE-STANDARD §2a asks for a fixed default during practice, which here is a range. **Needs human decision:** 1250 ms is a choice. |
| d' correction | rates of 0 or 1 become 1/(2n) and 1 - 1/(2n) (Macmillan and Kaplan, 1985) | the standard asks that the correction be named and identical across packages |

## Scope of `sequence_constraints`

The rules in the literature order the test sequence (S157 and S207). At the top level, `sequence_constraints` therefore applies to the test only; practice is unconstrained unless `practice.sequence_constraints` is set. This departs from the standard's precedence (a top-level value applies to every phase): with the practice default of 10 trials at 0.5 go, `min_gap: { nogo: 3 }` cannot be satisfied (5 no-go trials need 17 trials), so applying it would make any constrained configuration throw. **Needs human decision** whether the standard should say this for orders in general.
