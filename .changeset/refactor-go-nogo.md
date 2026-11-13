---
"@jspsych-timelines/go-nogo": minor
---

Refactored for cognitive battery consistency.

Breaking changes:
- Renamed option `text_object` to `text` (now accepts `Partial<TextConfig>`).
- Renamed data field `page` to `part` on instruction and trial records.

Additions:
- `utils.scoring` with go/nogo accuracy, commission and omission errors.
- `task_version` recorded in all data output.
