---
"@jspsych-timelines/go-nogo": minor
---

Refactored for cognitive battery consistency. Scoring now counts only go/no-go rows, where fixation and ISI screens were inflating `totalTrials` and `overallAccuracy`; styles are namespaced under `.jspsych-go-nogo` instead of restyling jsPsych core globally; the fixation cross and the stimulus are centred in the same box; fixation and ISI screens no longer accept responses that scoring discards; `createTimelineVariables` keeps the result of its shuffle; and `createTimeline` validates its options.

Breaking: removed `button_opacity_during_fixation` (never read) and four unused text keys (use `task_complete` and `result_summary`); `createFixation` and `createISIBlank` now take `jsPsych` as their first argument; `utils.text` is gone in favour of `utils.trial_text`; CSS classes are prefixed `jspsych-go-nogo-`; and `createTimeline` throws on values it previously accepted, such as `num_blocks: 0`.
