## Notes on the stop-signal task (hand-written, `reproduction/notes.md`)

### How the spec's staircase values were read

- **`adaptive.procedure: tracking`** is not a vocabulary value. All four sources that report it use a 1-up/1-down staircase on the stop-signal delay tracking 50% successful stops, so the adapter and the default map it to `staircase_1up_1down` (DEFAULTS.md).
- **`adaptive.bounds` is one key for two components.** `ssd_min_ms` and `ssd_max_ms` both map to `adaptive.bounds`, so a study that reports both shows only the later (the maximum), and a study that reports one shows a lone number (S079's 33 ms is a minimum, S091's 1000 ms a maximum). Level 1 types them correctly by variation (`bounds_min`, `bounds_max`); level 2 has to guess from the value (below 100 ms: minimum). S085's "no maximum" is untyped because `[min, null]` cannot be written one side at a time in the spec.
- **`fixed_set`, `fixed_single`, `random_uniform_range`** are `adaptive: null` plus `difficulty_levels`. The range ("random 100-450", S014) and the 11 values 0-500 (S025) are untyped in the spec. The package accepts a `{ min, max, step }` range as well as a list, so S014's random delays are expressible; the adapter's level 1 case uses 100-450. S057's fixed single delay has no value in the dossier; the adapter assumes 250 ms and lists it under "Assumed".
- **Values the spec could not type but the package implements** (the translations predate `tracks` and `reset`): S072 `per_condition`, S082 `reset_per_phase`, S011 `reset_per_condition`, S085 without a maximum. They are run by hand in `src/reproduction.spec.ts` ("adaptive values the spec left untyped") with the same staircase replay check (levels, steps, bounds, tracks, resets). They are not in the tallies. S085's "two independent criteria" and S030's "two interleaved" staircases (a second staircase with a different target or start inside one trial type) are not expressible: `tracks` is per condition, not per criterion.

### Gaps (hand-written classes)

| Value | Class |
|---|---|
| Saccade countermanding (S007, S008): eccentricity, saccade targets, a re-lit fixation spot | plugin needed (deferred in the spec: `saccadic_response` needs a new plugin) |
| Stop-signal dual tasks (S091): a flanker, n-back or task-switching go task | plugin needed (compose with the other package; not possible inside one trial) |
| Gamified child protocol (S008, S086): story, flower, archer, dragon | option missing (`population_protocol` values are only `standard` here) |
| Go and signal forms other than arrows, arrows in a circle, a red circle or arrow, a frame and a tone | option missing (shapes, pictures, a star outline, a square in degrees, colours) |
| `device_eligibility: browser_restricted` | plugin needed (fullscreen, window size and browser checks) |
| `device_eligibility: hardware_required` (S085) | plugin needed (cannot be verified) |
| Mouse-reach responses with a cursor trajectory (S085) | the device `mouse` is two buttons; the trajectory and single-trial SSRT (`cursor_trajectory`) are option missing |
| `response_device: gamepad` (S087) | plugin needed |
| `response_mapping_counterbalancing: random_per_participant` (S011) | option missing (non-spatial stimuli) |
| Go-only practice block before the mixed practice (S011, S079, S098) | option missing (one practice block; `practice: { condition_proportions: { go: 1 } }` makes the whole practice go-only) |
| Practice criteria on RT, omissions or stop accuracy (S011, S091) | option missing (the vocabulary's `practice_criterion` has accuracy, window, on_fail, max_repeats) |
| Block-wise stop proportions as counterbalanced halves or alternating or clustered, informed (S011, S098) | expressible as a list of maps; the spec could not type them. Not in the tallies |
| Trial-type-specific ITI (S080: 1500 go, 1700 stop); exponential ITI (S030) | option missing (`iti_ms` is a number or a uniform range) |
| `performance_incentive: points_only` (S086, S029) | option missing |

### Contradictions and oddities inside the spec

- **`stimulus_duration_ms` has two components** (`go_stimulus_duration_ms` and `stop_signal_duration_ms`) under one number-valued vocabulary option. The package reads a number or `null` as the go stimulus and takes a `{ go, stop_signal }` map for both.
- **`stimulus_modality` default `{ stop signal: "visual" }`** is a map in the spec, but the vocabulary's value is an enum.
- **`practice_criterion` values** use field names that are not the vocabulary's (`go_accuracy_min`, `accuracy_min`, `stop_accuracy`, `rt_mean_max_ms`), and one is a range (`stop_accuracy: [0.3, 0.7]`). The adapter only retypes `go_accuracy_min`.
- **`strategy_instruction`** has 6 observed values, none typed: the vocabulary lists only `none`. The package implements `dont_wait`, `dont_wait_plus_tracking_explanation` and `balance_speed_and_stopping`.
- **`trial_type`** is the spec's data field for go or stop. jsPsych writes its own `trial_type` (the plugin name) on every row, so a package value would overwrite it. The package writes `condition`. The shared checks' `response_device` check reads jsPsych's `trial_type`.

### Things the checks cannot show

- The simulated participant is a race model, so the harness runs show mixed stop outcomes, and the staircase check replays real data. Level 1 runs with `simulation: {}` (the package's model); the shared timing checks pass their own forced RTs (`runSlow`, a fast run), which the package honours.
- The data-only simulator ignores time. `ssd` is the requested delay; `ssd_actual` is only measured in a browser, so the frame-level timing of the signal was seen in the layout check (the signal appears, the stage does not move) but not measured against a photodiode.
- `sequence_constraints` is checked by the shared check for `max_run` (a number) and `no_immediate_repeat`, and by `cycle_length` through the contract; the record forms (`max_run: { stop: 2 }`, `min_gap`, `max_gap`, `run_length`, `start_with`) are tested in `src/adaptive.spec.ts`, not by a shared check.

### Honesty about the tallies

- Some "checked" level 1 cases assert little: `performance_incentive: none`, `population_protocol: standard` and `go_only_practice = 0` (which adapts to no options) only read the resolved option; the `ssd < 10 x window` assertion in the response-window check is a sanity bound, not a test of timing.
- `stimulus_duration_ms` for a go stimulus with the frame signal is checked as a recorded parameter. That the signal stays visible when the go stimulus is hidden (an explicit `visibility: visible` on the frame, inside the hidden stimulus wrapper) was reasoned from CSS and not seen in a browser.
- `practice_criterion` is tested with an all-pass and an all-fail participant (`repeat`, `continue`, `end`). A fail-then-pass sequence is not tested, because the simulator cannot vary a participant's accuracy by attempt.
- The auditory signal was run once in headless Chrome (`/scratchpad` script, not committed): the audio context was running after the first click and the tone played on 3 of 4 trials; on the first trial the context had not yet been resumed, and `stop_signal_shown` is `false` there by design (the data do not claim a tone nobody heard). The tone is not browser-verified across browsers or against hardware, and level 1 only checks that `stimulus_modality: "auditory"` sets `stop_signal: "tone"`.
- The measured delay (`ssd_actual`) in headless Chrome was 93 to 95 ms for a requested 100 ms (timer half a frame early, then the next animation frame). Not verified on a physical display.
- The layout check (`reproduction/layout.config.mjs`) passes at 1280x800 and 390x800 for keyboard (red arrow and frame) and touch: the stage centre is identical on text pages' stage-less screens, fixation, go, go with the signal showing, feedback and ITI. The config has no per-variant `expectKinds`, so "go signalled" is not asserted (the touch variants click at once); it appears in the output of the keyboard variants.
