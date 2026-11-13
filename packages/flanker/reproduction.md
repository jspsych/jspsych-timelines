# Reproduction of the literature values

How much of what the flanker literature varied can this package express, and does each setting show up in the data? The source is the generated spec (`specs/flanker/spec.yaml`, vocabulary `2026-11-13-std-final`). The checks are in `src/reproduction.spec.ts`; the retyping table is `reproduction/adapter.ts`; the fixture is `reproduction/spec-observed.json`. The tallies below come from `reproduction/results.json` and are asserted against `reproduction/expected-tallies.json` on every test run (`UPDATE_REPRODUCTION=1 npx jest` regenerates both and the presets in `docs-meta`).

## Numbers

**Observed values.** The spec lists 224 observed values over the 32 options; 213 are typed, 11 are not.

| | Rows | Distinct (option, component, value) |
|---|---|---|
| Observed values | 224 | |
| Untyped by the spec, not attempted | 11 | |
| Typed with value `null` (absent: "no cue", "none"), skipped by the brief's rule | 10 | |
| Typed with value `null` that mean "until response" or "untimed", **added** as a labelled addition (`response_window_ms`, `stimulus_duration_ms`: S007, S008, S068, S019) | 6 | 2 |
| Cases in level 1 (typed, non-null, plus the 6 additions) | 203 | 134 |
| Expressible and checked | 198 (97.5%) | 129 (96.3%) |
| Not expressible | 5 | 5 |

Of all 224 rows, 198 (88.4%) are expressible and checked. The 129 checked cases split by what the check can see:

| Check kind | Cases | What it asserts |
|---|---|---|
| Behaviour | 92 | Counts per phase and block, exact condition counts, rows present or absent, timeouts under forced slow RTs, keys, mapping across seeds, abort on a touch-only device |
| Recorded parameter | 25 | A duration or interval (fixation, ITI, feedback, SOA, stimulus duration) equals the value in the data row and in the plugin parameter. Both come from one variable and the data-only simulator ignores time, so this proves the value arrived, not that the browser times it. |
| Structure | 12 | The rendered HTML or built timeline contains it: colours, item size in px/deg/height fraction, instruction sentence, calibration plugin and its parameters |

Not checkable in data-only simulation, only structurally: `screen_calibration` `credit_card` and `virtual_chinrest` (the virtual chinrest plugin has no `simulate`, so the test removes it before simulating and inspects the built node), and real stimulus timing for every duration.

**Study configurations.** 22 configurations, 14 fully typed. Level 2 builds each fully typed one with all its options at once, simulates it and runs the check of every option it names.

| | Configurations |
|---|---|
| Fully typed (spec flag) | 14 of 22 |
| Fully expressible and all values checked | 10 of 14 (71%) |
| Expressible except one value | 4 (S060, S119: concurrent Simon task; S069: pictures; S135: shift keys) |

The 8 configurations the spec marks not fully typed are not part of level 2. Six of them (S008, S015, S019, S068, S104, S111) still have presets in `docs-meta` with the untyped keys left out; S016, S134 and S135 have too few options to be useful presets.

Companion settings that a configuration needed but did not state (counted as expressible, listed because they are assumptions): S060 gives `feedback_condition` and `feedback_duration_ms` but no feedback content, so `trial_feedback: "accuracy"` is assumed; S119 gives `rest_breaks: self_paced` but no `n_blocks`, so 3 blocks are assumed. S060 also needs letter targets for its counterbalancing; the letters are in its `stimulus_set`.

## Gaps

Classes: package fix needed, option missing, plugin needed, dossier value wrong, genuinely contradictory.

### Typed values the package cannot express (5 cases)

| Option / value | Source | Class | Why |
|---|---|---|---|
| `concurrent_task: interleaved_trials` | S060 | plugin needed | Interleaving with a Simon task needs the `simon-task` package. The dossier itself calls interleaving a timeline-unit. The package throws. |
| `concurrent_task: alternating_blocks` | S119 | plugin needed | Same. |
| `response_keys: [left shift, right shift]` | S135 | plugin needed (jsPsych core) | The keyboard listener matches `event.key`, which is `"Shift"` for both. Needs `event.code` support upstream. |
| `stimulus_set: pictures (neutral target, valenced distractor pictures; location task)` | S069 | option missing | A different variant: picture stimuli and a location judgement. Out of scope for the arrow/letter array. |
| `response_hand: one-handed vs two-handed (coded across 45 studies)` | S028 | dossier value wrong | A coding of studies in a review, not a setting anyone chose. |

### Untyped values (11 rows, not attempted)

| Option / raw value | Source | Class |
|---|---|---|
| `feedback_duration_ms`: min 1000 then keypress | S008 | option missing (a minimum duration followed by self-paced dismissal) |
| `iti_ms`: fixed 5000 ms trial incl. 2000 ms fixation | S111 | option missing (a fixed `trial_duration_ms`; ITI cannot be separated from the response window) |
| `response_window_ms`: individualized from practice mean RT (-1 SD speed / +1 SD both / +3 SD accuracy) | S104 | option missing (an `adaptive` procedure `rt_based`, applied between phases) |
| `soa_ms`: flankers precede target, magnitude not given | S132 | dossier value wrong (direction only; the package takes a signed `soa_ms`) |
| `condition_proportions`: item-specific, MC items 75 % congruent, MI items 25 % | S061 | option missing (proportions that depend on an item set) |
| `response_device`: auto (keyboard, mouse or touch targets) | S019 | option missing (`auto` is not in the vocabulary enum; default is keyboard) |
| `device_eligibility`: fullscreen | S013 | option missing (`fullscreen_required` would be a new vocabulary value) |
| `device_eligibility`: aspect ratio >= 1.6, landscape | S008 | option missing (`screen_geometry_required`) |
| `trial_feedback`: rule reminder after errors | S015 | option missing (`rule_reminder`) |
| `instruction_format`: video then written | S068 | option missing (`video_and_text`) and plugin needed (media) |
| `speed_accuracy_emphasis`: blocked speed / accuracy / both | S104 | option missing (a per-block list) |

### Contradictions inside the spec

- **S019, practice feedback.** The configuration lists `practice.trial_feedback: accuracy` and `trial_feedback_content: accuracy_rt`. The dossier's own translation note says `accuracy` is a placeholder and PEBL shows correct/incorrect plus RT. Class: dossier value wrong. The package uses `accuracy_rt` for practice (the preset drops the placeholder).
- **S019, `condition_set` against `condition_proportions`.** The set says `[congruent, incongruent, neutral]`, the proportions have `neutral_dash` and `neutral_empty`. Not contradictory once `neutral` is read as covering both, which is what the package's rule does; the spec has no way to say so. Class: package fix (a coarse/fine rule), not a value error.
- **S012 / S004 `condition_proportions` with `warning cue: none`** is null; the dossier notes a cue rate of 0 cannot be written as a trial-type proportion. The package keeps the cue factor separate (`stimulus_set.cue`, `cue_target_interval_ms`, `condition_proportions.cued`).

### Things the checks cannot show (limitations of this reproduction)

- Data-only simulation ignores time, so response windows, stimulus durations, SOAs and the like are shown through the data fields and plugin parameters the package sets, not through measured durations. Browser timing was not verified.
- The `random` trial order check asserts that block counts are not exactly balanced, with a fixed seed. It is deterministic but does not test randomness.
- Level 1 adds companion settings where a single value is not observable alone (feedback on for a feedback duration, letters for a two-targets value, a cue form for a cue interval). The adapter lists every one.
- For `condition_proportions`, S007's 0.33 x 3 is normalised and allocated by largest remainder (240 per type in 720 trials). S068's "congruent ~0.5, independent random per trial" is covered by `trial_order: random` as a separate value.
