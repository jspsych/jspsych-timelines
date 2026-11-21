## Notes on the two-step task (hand-written, `reproduction/notes.md`)

### Untyped and untyped-by-design values: classes (hand-written)

| Option / raw value | Source | Class |
|---|---|---|
| `iti_ms`: randomized, mean about 1 TR | S007 | option missing (a jitter given by its mean; the package takes `{ min, max, step }`) |
| `sequence_constraints`: resample until the realised common share is in [0.6, 0.8] | S026 | option missing (`realized_proportion_bounds`; the package draws transitions independently and has no ordering rules for them) |
| `response_keys`: button box, touch | S007, S062 | option missing (`response_device` is not an option of this spec; the package is keyboard only) |
| `missed_response_handling.missed_trial_abort_threshold`: 6 | S026 | not built on purpose (an abort after N missed trials is a performance gate; the package records misses and never stops the task) |
| `fullscreen_enforcement`: browser focus monitoring | S022 | option missing (`focus_logging` is not a value) |
| `practice_trials.training_sequence`: staged, observe-only | S025, S011, S029, S134 | option missing (the walkthrough is one design; staged practice and observe-only demonstrations are not options) |
| `rest_breaks`: break screens that state the progress | S022 | option missing (break content) |

### Typed values the package does not express

- `reward_schedule`: `pregenerated_walk_sets` (S026, S062) and `block_alternating` (S013): kinds the typed schedule names and that throw when used. A fixed set of walks would need the researcher's walks as input; block alternation is a different design (reward contingencies that switch between blocks).
- `comprehension_check`: `quiz`, `quiz_with_repeat`: the interactive walkthrough already asks check questions and repeats them (PACKAGE-STANDARD 6a). A quiz of the sources' own items (3 to 10 items, S011, S022, S026, S120, S138) would be a separate option; the loop caps and exclusion rules of the sources are not built.
- `instruction_framing`: `magic_carpet_mountain_genie` (S033, S120), `ship_island_chest` (S047): other cover stories, not drawn. `abstract_symbols` and `spaceship_planet_alien` are.
- `instruction_format: audio` (S022), `population_protocol: child` (S022: a bundle of a 3 s deadline, audio, a tutorial and progress breaks; the parts are separate options).

### Things the checks cannot show (limitations of this reproduction)

- Data-only simulation ignores time, so response windows, the highlight and outcome durations and the ITI are shown through the data fields and plugin parameters the package sets, not through measured durations. The Quick demo's duration was measured in Chrome (see DEFAULTS.md).
- The `response_acknowledgement` durations of the sources (1000, 500, 1500 ms; "selection display") are recorded by the spec as the raw value of a variation whose typed value is `highlight`, so level 1 has one case for them, and the study presets cannot carry the duration. `response_acknowledgement_ms` is a package option that the spec does not have.
- `reward_schedule` is retyped from the spec's strings (`{sd: 0.025, lower: 0.25, upper: 0.75, boundary: reflect}`) by a table in `adapter.ts` of the three walks the dossier reports; nothing is parsed from the text. The spec's `state_1` / `state_2` are read as the red and the blue state.
- The reward-schedule check asserts that every probability stays within the bounds and that the SD of the steps is within 40% of the schedule's. The difference between `reflect` and `reverse_step` is not visible in rows at that resolution; the two rules are tested directly in `src/index.spec.ts` (`stepProbability`).
- The task has no correct response, so the contract sets `correct` and `correct_response` to `null`, and the shared `response_keys` check reads the key presses on the `choice` rows alone. `reproduction/checks.ts` extends it with which side each key chooses. The shared count checks read one row per trial, which is why the scorable `response` row is a trial summary and the raw choices are `choice` rows.
- Level 1 adds a short run (4 practice and 40 test trials) as a companion to each single value, so the checks that need rows run quickly. Whole study configurations (level 2) keep their own length, up to 1200 trials (S013).
