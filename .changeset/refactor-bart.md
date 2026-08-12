---
"@jspsych-timelines/bart": minor
---

Refactored for cognitive battery consistency. Styles are now namespaced to the timeline instead of overriding jsPsych core globally, `max_pumps` and `points_per_pump` are passed through to the plugin, the break screen no longer counts practice earnings, and `createTimeline` validates its numeric options.

Breaking: removed ten unused text keys (including `end_result_message` — use `result_summary`), removed the unimplemented `trial_timeout`/`enable_timeout` options, removed `utils.trial_text` in favour of `utils.text`, and the `ScoringResult` averages are now `number | null` when their denominator is empty.
