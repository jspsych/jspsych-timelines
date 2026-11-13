---
"@jspsych-timelines/bart": minor
---

Refactored for cognitive battery consistency.

Breaking changes:
- Renamed option `text_object` to `text` (now accepts `Partial<TextConfig>`).
- Renamed data field `phase: "trial"` to `phase: "test"`.
- Renamed data field `phase: "end-results"` to `phase: "completion"`.
- Removed dependency on `@jspsych/plugin-instructions`; instructions are now built from `html-button-response` trials with optional interactive practice.

Additions:
- `utils.scoring.calculateScores` / `getSummary` (totalPoints, popRate, adjustedAvgPumps).
- `task_version` recorded in all data output.
