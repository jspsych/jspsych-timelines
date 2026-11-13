---
"@jspsych-timelines/corsi-block": minor
---

Refactored for cognitive battery consistency.

Breaking changes:
- Renamed option `text_object` to `text` (now accepts `Partial<TextConfig>`).
- Standardized `phase` data field on `"instructions" | "practice" | "test"`.

Additions:
- Interactive instructions with a looping practice trial.
- `utils.scoring.getSummary` with span and trial-level metrics.
- `task_version` recorded in all data output.
