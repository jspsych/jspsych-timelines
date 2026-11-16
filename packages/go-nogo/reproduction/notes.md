## Notes on the go/no-go (hand-written, `reproduction/notes.md`)

### Sequence constraints

- **S157** (`max_run: { nogo: 2 }`, `min_gap: { nogo: 3 }`, `trial_order: fixed_sequence`) and **S207** (`run_length: { go: [1, 3, 5] }`) are both level 1 cases and S157 is a level 2 configuration. The shared check runs six seeds, checks the neighbour rules over the whole test sequence (so across block boundaries), and the spec's "tests that catch" block shows it fails when the rules are dropped (`src/reproduction.spec.ts`). `balanced_transitions` and `cycle_length` have no shared data check; `src/sequence.spec.ts` covers them.
- With `min_gap: { nogo: 3 }`, `max_run: { nogo: 2 }` is vacuous (no two no-go trials are within 3 trials). The spec's translation note says the two rules are "slightly inconsistent as worded". What S157 probably means, at least three go trials between no-go runs of at most two, is not expressible: `min_gap` is between two trials of a condition, not between runs.
- `run_length: { go: [1, 3, 5] }` cannot give the default 90% go (315 go trials in at most 88 runs of at most 5 needs 36 runs of 5 at most 180). The adapter adds `condition_proportions: { go: 0.75, nogo: 0.25 }` as an assumed companion. The sequencer proves such a configuration infeasible and the package throws at `createTimeline` naming the rule.
- `trial_order: "fixed_sequence"` with constraints gives every participant the same order, from a fixed-seed generator (not `jsPsych.randomization`); without constraints it spreads the trial types evenly.
- Whether the 1/3/5 runs of S207 come in a fixed or a random order is not stated; the package draws them at random under `shuffled_list` and fixes them under `fixed_sequence`.

### No-response trials

- A no-go trial is correct when there is no response in the window. Rows record `responded`, `timeout` (no response in the window, so true for a correct no-go), `correct`, and `response_window` (the sampled window).
- Data-only simulation: jsPsych's default participant responds on every trial, so every no-go is a commission error. No-go trials ask for the named simulation options `nogo`; pass `{ default: ..., nogo: { data: { response: null, rt: null } } }` to withhold. The walkthrough's no-go steps always withhold.
- Level 1 checks run under the default simulation (so errors exist to test feedback conditions); the shared `response_window_ms` check skips no-go rows, which cannot time out.

### Untyped values: classes (hand-written)

| Option / raw value | Source | Class |
|---|---|---|
| `pre_block_countdown_ms`: a countdown, length not given | S028 | dossier value wrong (the duration is missing; the option takes ms) |
| `response_window_ms`: participant-specific deadline (mean + 2 SD or 90th percentile of short-SOA go RT) | S207 | expressible in code with `utils.deadlines.meanPlusSd(2)` / `percentile(90)`; not typed by the spec, and code-only options are left out of presets |
| `single_task_blocks`: go-only control block, position not stated | S183 | package option exists (`before_dual`, `after_dual`, `interleaved`); the dossier does not say which |
| `stimulus_role_assignment`: new stimulus set each block | S017 | option missing (a per-block stimulus set) |
| `stimulus_role_assignment`: rule switches between runs | S169 | option missing (a rule switch between blocks) |
| `response_device`: spacebar or mouse click | S054 | option missing (a list of devices) |

### Contradictions inside the spec

- **S022, `go_mapping_change_between_blocks` against `stimulus_role_assignment`.** One vocabulary enum, `stimulus_role_assignment`, takes two variations: "does the go mapping change between blocks" (S022: none, read as `fixed`) and "how stimuli are assigned to roles across participants" (S022: `random_per_participant`). The configuration holds both. The adapter reads "none" or "fixed" for the first as "never changes between blocks", which the package always honours, and keeps `random_per_participant` for the second. Class: genuinely contradictory as typed.

### Things the checks cannot show

- Data-only simulation ignores time, so windows, durations and the fixation cross shown after the stimulus are shown through data fields and plugin parameters, not measured durations. The browser layout check (`reproduction/layout.config.mjs`) passes on the built bundle: the stage centre is identical on every screen type, at 1280 and 390 px wide, for keyboard, 2x2 grid and touch.
- The `random` trial-order check asserts that block counts are not exactly balanced under some seed.
- The picture stimuli (faces, line drawings, emoticons, a 3D room) are gaps: `stimulus_set` draws shapes and text.
