# EEfRT defaults: where they come from and what was changed

The anchor is Treadway et al. 2009, PLoS ONE (S007), the original EEfRT, read in full by the dossier (typicality 1.0, coverage 0.9; no escalation). The Inquisit EEfRT defaults (S021) are the runner-up and agree on every value both state. The generated spec fills the options the anchor does not state from other studies (basis `fill`) and keeps content-component defaults at option level. The coherence check asks whether the assembled defaults make one working experiment. They do, with the changes below.

What the anchor does: a 1 s fixation, a choice of at most 5 s between an easy task (30 presses in 7 s, index finger, $1.00) and a hard task (100 presses in 21 s, non-dominant little finger, $1.24 to $4.30), a 1 s ready screen, the pressing with a filling bar, 2 s completion feedback and 2 s reward feedback. Each trial pays with a probability of 12%, 50% or 88% (shown before the choice, the same for both tasks), and a reward needs both a completed task and a win trial. Four practice trials (two assigned, easy then hard, and two free), a 20-minute session, one pre-randomised order for everyone, two random winning trials paid.

## Defaults changed from the spec, or filled where the spec has none

| Option | Spec default (basis) | Package default | Reason |
|---|---|---|---|
| `response_window_ms` | `{choice_window_ms: 5000, "easy task": 7, "hard task": 21}` (components; the last two in **seconds**) | `{ choice: 5000, easy: 7000, hard: 21000 }`, in ms | The spec mixes milliseconds and seconds in one option. The package takes ms throughout, as the vocabulary's `_ms` says, and the adapter converts. A number or `null` alone is the choice window (the shape the shared checks and the vocabulary expect). |
| `reward_magnitude` | `{hard_reward_values: {hard: {min: 1.24, max: 4.3}}, easy_reward_value: 1}` | `{ easy: 1, hard: { min: 1.24, max: 4.3, n_levels: 8 } }` | The range lost the design: S021 and S017 use 8 equally spaced levels, each crossed with each probability. Three typed forms hold the literature: `{ levels }`, `{ min, max, n_levels }` and `{ uniform: { min, max } }` (S014's draw per trial). **Needs human decision:** S007 reports only the range, and the Inquisit "step $0.43" does not reach $4.30 (1.24 + 7 x 0.43 = 4.25), so the equally spaced reading is this package's, rounded to cents. |
| `reward_probability` | `["12%", "50%", "88%"]` (strings) | `[0.12, 0.5, 0.88]` | Proportions, not strings with "%". `[1]` means every trial pays and no probability is shown (the "no probabilistic outcome" of the children's version, S008's review table, which the dossier does not type). |
| `trial_order` | `fixed_sequence` | `"fixed_sequence"` | Same value, but S007's pre-randomised list is not published. **Needs human decision:** the package repeats its own constant scrambled order of the probability x reward cells (a multiplicative hash of the cell index), with wins spread evenly per probability level. It draws no random numbers, so it is the same for every participant and every seed. `"shuffled_list"` shuffles each pass per participant (S014), `"random"` draws every offer independently. A fixed sequence cannot be combined with a per-trial uniform reward (that would draw random numbers). |
| `difficulty_levels` | `{"hard task": 100, "easy task": 30}` (type `list` in the vocabulary) | `{ easy: 30, hard: 100 }` | A map keyed by the task's own terms (vocabulary rule R9). |
| `response_key_mapping` | `{effort_key_assignment: {easy: "space", hard: "space"}, effort_finger_assignment: {easy: "dominant_index", hard: "nondominant_little"}}` | `{ easy: "space", hard: "space" }` (keys only) | The spec mixes key names and finger roles in one map. Keys stay in the option; the fingers are instruction text, `text.finger_instruction({ task })` (default: index finger of the dominant hand for the easy task, little finger of the non-dominant hand for the hard task, as in S007). S008's dominant little finger is a text override. |
| `response_keys` | `["E", "I"]` (fill, 1/3) | `["e", "i"]` | The choice keys, easy first. Lowercase letters (jsPsych matches case-insensitively; instructions show capitals). **Needs human decision:** the dossier does not say which key is which task in the Inquisit script. |
| `n_test_trials` | none | `48` | Used only with `task_end_rule: "fixed_trial_count"` (S017 fixes 48 trials; Inquisit's list is 48). The spec has no value. |
| `device_eligibility` | `computer_only` (fill, 2/2) | `"computer_only"` | Kept, unlike the flanker's `none`: rapid pressing needs a physical keyboard (both online studies say so). It ends the experiment on a touch-only device. |
| `outcome_type` | `"money"` (anchor); the schema's enum also holds `USD`, `EUR`, `GBP` | `"money"` (or `"points"`) | The currency is not part of the option: the schema's enum mixed the reward medium with the currency. The symbol and number format are the `amount` text function (default `$1.24`), so a currency is a translation. `points_exchanged_for_candy` and `food_portions` throw (translate the payout text instead). |
| `payout_rule` | `two_random_win_trials_paid` | same | Implemented as a computed amount: two completed winning trials are drawn through `jsPsych.randomization` at the end, and their rewards are summed (`percent_of_total_5` and `_10` take that share of everything won). It is shown on the last screen and recorded in the completion row (`paid_trials`, `payout`). The package pays nothing. `fixed_noncontingent_with_deception` throws: it is a deception for the researcher to carry out. |
| `progress_indicator` | `progress_bar` | same | The bar fills with presses (effort), not task progress. `counter` shows "presses / required"; the dossier's "bar plus counter and countdown" (S017) is one of those, not both. |
| `speed_accuracy_emphasis` | untyped (`tradeoff_explained`) | not an option | The one observed value is not a speed-accuracy emphasis but an instruction that hard choices cost trials in the time-limited session. It is the instruction page `instruction_session_length`, shown with `fixed_time`. |
| `adaptive` | `{procedure: "fixed"}` | not an option | "Fixed" is the absence of an adaptive procedure. `individually_calibrated` is deferred (below). |
| `social_influence_cue` | `false` | not an option | S008's review table only; the dossier does not describe the cue. `true` has no counterpart. |
| `instruction_demonstration` | none in the spec | `"interactive"` | **Documented exception to the anchor rule (§6a).** S007 uses text instructions. The walkthrough (below) is untimed except for the easy task's real time limit, sits before practice, is not scored and does not count toward `practice_trials`. `"none"` reproduces text-only instructions. |
| `practice_forced_tasks` | none (`practice_trials: 4`; the dossier says the first two practice trials are assigned) | `["easy", "hard"]` | The anchor's forced easy-then-hard practice. Fewer practice trials shorten the default list; a list the user gives that is longer than `practice_trials` throws. |

## Spec defaults kept, with the coherence check

| Option | Default | Source | Check |
|---|---|---|---|
| `fixation_duration_ms` | 1000 | S007, S013 | Before the choice of every trial; jitter allowed. |
| `pre_block_countdown_ms` | 1000 | S007, S021 | The ready screen before every pressing phase, not once per block (the vocabulary's name suggests once per block; the dossier's component is `ready_screen_ms`). Jitter allowed; 0 = none. |
| `feedback_duration_ms` | 2000 for the completion screen and 2000 for the reward screen | S007 | The spec's option-level default was a map of two components; a single value applies to both, `{ completion, reward }` sets them apart. |
| `session_duration_min` | 20 | S007, S013, S014, S021, S034 | Count and clock below. |
| `task_end_rule` | `"fixed_time"` | S007, S021 | One given number sets the rule (`n_test_trials` gives `fixed_trial_count`); both numbers without a rule, or a number that belongs to the other rule, throw naming both. |
| `missed_response_handling` | `"random_assignment"` | S007, S017, S021 | A missed choice is assigned a random task (`choice_forced`, `forced_by: "timeout"`). The only value. |
| `practice_trials` | 4 | S007, S021, S035 | Practice runs at the real pace and is not paid or counted in the session clock. |
| `outcome_valence`, `pretraining` | `"gain"`, `"none"` | S007 | Other values throw naming the option. |

## Time and the stop rule

**The session clock.** jsPsych has no simulated clock, so a wall-clock stop rule would never end a data-only simulation. The session clock is the larger of the wall-clock time since the test started and the sum of the durations of the finished test trials' screens (fixation, choice, ready, effort, feedback). In a browser the wall clock is never behind that sum, so it is the real elapsed time; in a data-only simulation the sum is all there is. The clock is checked before each trial starts: a trial that starts before the time is up is completed, so a session can run past the limit by up to one trial (about 30 s with a hard task). Every trial records the clock at its start (`session_elapsed_ms`). With `fixed_time`, a hard stop of 600 test trials (`MAX_SESSION_TRIALS`) means a run with tiny durations still ends; a `fixed_trial_count` session is not capped.

**The effort phase ends when the target is reached,** or at the time limit. The dossier's `task_duration_ms` is "time to target or time limit". The dossier does not say whether the original keeps the pressing screen for the full 7 or 21 s after the target. **Needs human decision.** The choice has a consequence: ending on completion makes the opportunity cost of the hard task smaller than a fixed-length screen would.

## Quick demo

`id: "quick-demo"`, listed first. It keeps the default instructions and the interactive walkthrough and shortens the task: 2 practice trials (the assigned easy and hard task), `task_end_rule: "fixed_trial_count"` with 6 test trials (the 20-minute clock would take 20 minutes), 10 and 25 presses in 4 s and 8 s instead of 30 and 100 in 7 s and 21 s, and 0.5 s fixation and ready screens with 1 s feedback. Beyond the counts it sets the stop rule and the timing and press options, because a hard trial of the real task takes up to 30 s and the walkthrough alone would use most of 3 minutes. **Measured in Chrome with a scripted prompt participant** (3 s per text page, a choice after 1.5 s, 5.5 presses per second): 105 s from the first page to the last.

## Choices the spec left open

- **Choice screen.** The chance of winning above two cards (task, reward, presses and time, choice key). Both rewards, both requirements and the key of each task are on screen, so no instruction needs to be remembered.
- **Reward feedback.** Three states: a win shows the amount, a completed task on a non-win trial says there was no win, an incomplete task says there is no reward. The two feedback screens are `part: "completion_feedback"` and `part: "reward_feedback"`.
- **Win trials.** Each offer says in advance whether the trial is a win trial. List orders balance wins within each probability level (`round(p x number of cells)` per pass, so 1, 4 and 7 of 8 cells at 12%, 50% and 88%); `random` draws them independently; a probability of 1 always wins. A win pays only with a completed task.
- **Instruction pages** (one idea each): the two tasks and their requirements and fingers; the rewards; the chance of winning; how to choose (and the window); how long the session is and that the hard task costs trials (`fixed_time`) or the number of trials; the payout.
- **Walkthrough** (`instruction_demonstration`). Each step shows the real screen drawn by the same function as the task. Step 1: the real choice screen with a middle offer of the configured design; choose the easy task. Step 2: the same screen; choose the hard task (it is not done). Step 3: the easy task with its real press count and time limit. A choice has no correct answer, so the walkthrough asks for each key by instruction and repeats the step with a hint after the wrong one (at most 3 attempts, then the answer is shown); step 3 repeats if the bar did not fill. Rows are `phase: "instructions"`, `part: "instruction_check"` (`step`, `attempt`, `correct`), plus `instruction_feedback`; neither is scored. The hard effort task is not demonstrated: it takes up to 21 s and the practice has an assigned hard trial. Under simulation every step is answered correctly at the first attempt (the effort step with `force_complete`).
- **Simulation** (`utils.simulation`, `utils.constants.SIMULATION`). The hard task is chosen with a logistic function of the win probability and of the hard reward relative to the easy one (intercept -0.2, +3.5 per unit of probability, +0.9 per unit of reward ratio above 2.77), choices take about 1.5 s and 2% are missed; press rates are drawn per trial from a normal distribution (easy 5.8 per second, sd 0.7; hard 5.3, sd 0.55) with 20% variation between presses, so about 1.5% of easy and 16% of hard tasks fail. A global `default: { data: { rt } }` simulation option overrides the choice RT.

## Deferred, with reasons

- **Per-participant calibration of the press requirements** (`adaptive.procedure: individually_calibrated`; Fervaha et al. 2013, S008). The anchor uses fixed counts, and the dossier has no figures for the calibration (which fraction of a maximal-tapping rate, over how long). A calibrated requirement would be a function option with a prebuilt helper in `utils` (§2a), and it needs the pretest below. `adaptive` is not an option; the value throws where it appears in a spec.
- **The maximal-pressing pretest** (`pretraining`, S008: 10 trials of 20 s). It gives a motor-speed covariate. Only `"none"` is implemented; the other values throw. The effort plugin could run it unchanged.
- **Loss trials** (`outcome_valence`), the **social-influence cue**, the modified EEfRT (reward per press, no choice) and the C-EEfRT (task switching as effort) are variants (spec `variants`, coverage `separate-package`).
- **Values the vocabulary lists but the package does not implement** throw an error naming the option: `outcome_type` `points_exchanged_for_candy` and `food_portions`, `outcome_valence` other than `gain`, `pretraining` other than `none`, `device_eligibility` `browser_restricted` and `hardware_required`, `payout_rule` `fixed_noncontingent_with_deception`, `instruction_format` `audio` and `video`, `instruction_demonstration` `examples`, `animated` and `guided_trial`.

## Needs human decision

1. The effort screen ends at the target (the original may keep it for the full limit).
2. The 8-level equally spaced hard reward list (S007 reports only the range).
3. The constant scrambled order used for `fixed_sequence` (S007's list is not published).
4. Which choice key is the easy task (`["e", "i"]` is the spec's fill).
5. The session ends at a trial boundary (a trial in progress when the time is up is completed).
6. `n_test_trials: 48` for `fixed_trial_count`.
7. The Quick demo changes the stop rule and the press requirements as well as the counts.
