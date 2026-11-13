# Flanker defaults: where they come from and what was changed

The anchor is the PEBL flanker battery (S019), a recorded human decision (`specs/escalations.tsv`, 2026-11-13: PEBL chosen over the Expfactory auto pick because it is a complete reference implementation using arrows, as 6 of 9 online-sample studies do). The generated spec fills the options the anchor does not state from other studies (basis `fill`) and keeps content-component defaults at option level. D5 step 4, the **coherence check**, asks whether the assembled defaults make one working experiment. They did not in seven places. Those are changed below; nothing else differs from the spec.

What PEBL does (S019, `battery/flanker/flanker.pbl`): arrows, four trial types (congruent, incongruent, neutral dash, neutral blank), 20 repetitions of 4 types x 2 directions = 160 test trials in one block, 8 practice trials, 500 ms fixation, array until response with an 800 ms timeout, feedback in practice only (400 ms), 1000 ms ITI, shift keys (browser build: z and /).

## Defaults changed from the spec

| Option | Spec default (basis) | Package default | Reason |
|---|---|---|---|
| `trial_feedback` | `accuracy_rt` (anchor, from the content component) | `"none"`, with `practice: { trial_feedback: "accuracy_rt" }` | PEBL gives no feedback in the test phase and correct/incorrect + RT in practice. The spec's option-level default silently put feedback into the test phase. A practice default applies unless the user sets `trial_feedback` at the top level or in `practice`, so `{ trial_feedback: "none" }` really means none. |
| `n_blocks` | `10` (fill, 3/7 studies) | `1` | The fill-in comes from other studies and was never checked against the anchor. PEBL runs its 160 test trials as one block (20 repetitions of 8 cells; S012 also uses 1). Ten blocks of 16 would divide evenly, but they would add block structure PEBL does not have. |
| `rest_breaks` | `self_paced` (fill, 3/4) | `"none"` | PEBL has no breaks. With `n_blocks: 1` the option is inert anyway; it only matters once someone sets several blocks. |
| `response_device` | untyped ("auto: keyboard, mouse or touch targets") | `"keyboard"` | `auto` is not a value of the vocabulary enum and chooses at run time. Keyboard is PEBL's first choice. Mouse and touch use on-screen buttons. |
| `response_keys` | `["ArrowLeft", "ArrowRight"]` (fill, 2/11) | `["z", "/"]` | The anchor's browser keys (S135: native PEBL uses the two shift keys, the browser/Emscripten build uses z and /). The fill-in was the arrow keys; only 2 of 11 studies use it. Left/right shift cannot be told apart by jsPsych (`event.key` is `"Shift"` for both), so the native default is not expressible; see `reproduction.md`. Caveat: "/" opens quick find in some Firefox settings. |
| `condition_set` | `["congruent", "incongruent", "neutral"]` | `["congruent", "incongruent", "neutral_dash", "neutral_empty"]` | The anchor's `condition_proportions` has the keys `neutral_dash` and `neutral_empty`, so a set naming one `neutral` type disagrees with it. The package requires the two to name the same trial types (coarsely: `neutral` covers `neutral_*`) and throws otherwise. |
| `device_eligibility` | untyped (`[fullscreen]`, fill 1/3) | `"none"` | The fill-in was a display requirement, not an eligibility rule, and PEBL has no restriction. |

## Spec defaults kept, with the coherence check

| Option | Default | Source | Check |
|---|---|---|---|
| `fixation_duration_ms` | 500 | S019 | |
| `response_window_ms` | 800 | S019 | Timing adds up: the array stays until the response or until 800 ms (`stimulus_duration_ms: null`), then feedback (practice only, 400 ms), then a 1000 ms ITI. The same window applies in practice. |
| `stimulus_duration_ms` | `null` (until response) | S019 | Longer than the window is truncated by the window. |
| `iti_ms` | 1000 | S019 | |
| `feedback_duration_ms` | 400 | S019 | Only used in practice by default. |
| `feedback_condition` | `"all"` | S019 | Ignored when `trial_feedback` is `none` (test). |
| `soa_ms`, `cue_target_interval_ms` | 0, 0 | S019 (no cue; cue fill 2/3) | |
| `n_test_trials`, `practice_trials` | 160, 8 | S019 | The PEBL code comment says 12 practice trials; the code does 8 (dossier decision). 8 = one balanced pass over the 4 types x 2 directions. |
| `trial_order` | `"shuffled_list"` | S019 | A balanced list, shuffled: exact condition counts per block. |
| `condition_proportions` | .25 each over the four PEBL trial types | S019 | |
| `stimulus_set` | `{ target: "arrows", flanker: { per_side: 2 }, neutral_flanker: "dashes", cue: "none" }` | S019 | Spec default was the string `"arrows"` plus per-role components. |
| `stimulus_layout` | `{ flanker_spacing: { gap: 2, unit: "px" }, array_position: "centre_at_fixation", orientation: "horizontal" }` | S019 gap; position fill 2/3 | Spec default held the gap as the string `"{gap: 2, unit: px}"`. |
| `stimulus_size`, `stimulus_color` | 40 px, `"white on black"` | S019 | |
| `targets_per_response` | 1 | fill 2/3 | Arrows have one target per response. |
| `response_hand` | `"two_hands_index_fingers"` | fill 2/3 | PEBL uses two shift keys. Only changes the instruction text. |
| `speed_accuracy_emphasis` | `"both"` | fill 2/3 | Instruction sentence only. |
| `concurrent_task`, `attention_checks`, `screen_calibration`, `block_feedback`, `instruction_format` | `"none"`, `"none"`, `"none"`, `"none"`, `"text"` | fill | PEBL has none of the extras. |

## Choices the spec left open

- **Neutral forms.** `neutral` uses `stimulus_set.neutral_flanker` (a single form or a list used in rotation); `neutral_dash` and `neutral_empty` fix the form. Rendered forms for `straight_lines` (a vertical bar) and the no-go stimulus (a cross target between arrows) are my reading of S007 and S111 and were not checked against the papers.
- **Cue.** `stimulus_set.cue: "circles"` (two circles above and below fixation) needs `cue_target_interval_ms > 0` and the reverse; the combination of only one throws. The cue is shown for 250 ms (S068) or the interval if shorter. The cued share is set with `condition_proportions: { cued, uncued }`.
- **Instructed attention checks.** Two probes (the dossier does not give a count).
- **Degrees.** Without calibration 1 deg = 37.8 px; with `credit_card` the card gives px/mm and 57 cm viewing distance is assumed; with `virtual_chinrest` the plugin measures it.
- **Values the vocabulary lists but the package does not implement** throw an error naming the option: `concurrent_task` other than `none`, `response_device` microphone/eye_tracker/gamepad, `attention_checks` other than `none`/`instructed_items`, `device_eligibility` `browser_restricted`/`hardware_required`, `rest_breaks: "fixed_interval"`, `screen_calibration: "self_report"`, `block_feedback: "points"`, `trial_feedback` `points`/`reward_outcome`, `instruction_format` `audio`/`video`, `response_mapping_counterbalancing: "counterbalanced"`.
- **Dropped from the old package:** the interactive instruction pages (try-it trials) and the `includeNeutral` switch.
