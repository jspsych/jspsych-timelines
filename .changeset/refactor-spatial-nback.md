---
"@jspsych-timelines/spatial-nback": minor
---

Refactored for cognitive battery consistency.

Breaking changes:
- Renamed data field `phase: "trial"` to `phase: "test"`.
- Added `phase: "completion"` for the end screen.

Additions:
- `text` option for translation (`Partial<TextConfig>`).
- `utils.scoring` with d-prime, hit rate, false alarm rate, RT metrics.
- `task_version` recorded in all data output.
