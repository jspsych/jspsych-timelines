## Notes on the flanker (hand-written, `reproduction/notes.md`)

### Untyped values: classes (hand-written)

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
