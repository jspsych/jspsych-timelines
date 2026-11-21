## Notes on tone detection (hand-written, `reproduction/notes.md`)

### How the spec's values were read

- **`adaptive.procedure` is `3down1up`, `2down1up` or `weighted_1down_3up` in the spec,** none of them a vocabulary value (`staircase_1up_1down`, `staircase_1up_2down`, `staircase_1up_3down`). The generated schema's own default for `procedure` is the string `3down1up`, which the schema's enum rejects. The adapter and the default map `3down1up` to `staircase_1up_3down` (one wrong answer makes the task easier, three correct answers in a row make it harder, so "1up, 3down") and `2down1up` to `staircase_1up_2down`. This is the reverse of the stop-signal package's reading of the same names, where "up" and "down" are about the stop-signal delay and not about the tracked level being easier or harder; the vocabulary does not say which. `weighted_1down_3up` is `staircase_1up_1down` with up steps three times the down steps (75% correct).
- **`adaptive.step_size` is a schedule object with prose steps** (`"1.5 dB descent"`, `"x sqrt2"`). The adapter matches the three dB schedules whole (S012, S044, S031) and turns them into a list indexed by reversals (S012 `[1.5, 0.75]`, S044 `[8, 8, 2, 2, 0.5]`) or `{ up, down }` steps (S031); the multiplicative schedules (S005, S036) act on a Hz or % difference and are gaps. S012's schedule also switches at -19.75 dB SNR, which core's `step_sizes` cannot do (it switches on the number of reversals only). The package implements the switch after the first reversal; the level trigger is listed as not implemented in DEFAULTS.md and is not tested.
- **`adaptive.stopping_rule` is `{ criterion, n }`** with `criterion` one of `trials`, `reversals`, `mistakes`. Core's `stop` takes `{ trials, reversals, ... }`, so the adapter writes `{ [criterion]: n }`. `mistakes` (total wrong answers in the track: S036 and S045) is not a core rule (core has `consecutive_failures` and `failures_at_level`), so the package counts it itself.
- **`adaptive.psychophysical_method: constant_stimuli`** (S013, S059) is `adaptive: null` with `difficulty_levels` and `trials_per_block` as companions. The levels themselves are typed as `{ n_levels, spacing, range, reps_per_level }` with the range in prose ("amplitude 0.5 +/- 0.04 steps", "F0 shift 0.05-3.2 Hz"), which are in units this package's dB level cannot take, so `difficulty_levels` is a gap and S013 and S059 are not fully expressible.
- **`tone_frequency_hz` as a list** (S031, S036, S045) is read as a set of conditions (each tested in its own tracks), not as one frequency per block as the translations say: with one entry per block the number of conditions and the number of blocks would be the same number, and `trials_per_condition` (S012: three tracks) would have no meaning. See DEFAULTS.md.
- **`block_order: random_within_block`** (S036) is each round of tracks holding every condition once, in random order. S044's "one condition blocked, the others intermixed" is untyped.
- **`stimulus_set` roles** are `tone timbre` and `masker` in the spec; the package's are `tone` and `masker` (the standard names the task's own terms, without spaces).
- **`presentation_level_db.masker`** (`+40 dB re participant's just-detectable noise level`, S012; `6 dB below calibration sound`, S044) is untyped. In S012 the participant set the volume of the device against a fixed digital noise, so it is a plain digital level: the package states it as dB FS and adds `calibration_level_db` (DEFAULTS.md).

### Gaps (hand-written classes)

| Value | Class |
|---|---|
| Frequency and intensity discrimination, oddity, same/different, AXB trials (`task_variant`, `judgment_wording`, multiplicative steps, Hz or % start levels, level roving) | option missing: these need a standard and a comparison tone and a level in a log-frequency or log-intensity unit; the staircase and the audio code would carry over, the trial would not |
| Complex tones, instrument notes, threshold-equalizing noise (`stimulus_set`) | option missing: only pure tones and white noise are synthesised |
| Constant-stimuli levels in amplitude steps or F0 shifts (`difficulty_levels`) | option missing: the package takes levels in dB |
| Frequency roving (`tone_frequency_hz`: quarter octave, one octave, a log-uniform range) | option missing: the anchor does not rove; it needs a typed form (centre, range in octaves, distribution) |
| `device_eligibility: browser_restricted`, `hardware_required` | plugin needed: a device and browser check; a headphone requirement cannot be verified (the headphone screen is the check) |
| `performance_incentive: bonus` | option missing: payment is the researcher's |
| Huggins pitch headphone screen (S012), antiphase plus NoSpi chirp (S013) | option missing: the antiphase screen of Woods et al. is implemented (the antiphase variant S044 uses); Huggins pitch needs an FFT-built binaural noise |

### What the checks cannot see

Data-only simulation ignores time and plays no sound. The timing checks prove that the sampled durations are recorded and that the recorded sound length is the lead-in, the intervals and the gaps; they do not prove that the browser plays them that way. The audio itself (level, SNR, ramps, antiphase) is tested on the synthesised samples in `src/audio.spec.ts`. Playing in a browser was tried in headless Chrome and in a sandboxed iframe (DEFAULTS.md).
