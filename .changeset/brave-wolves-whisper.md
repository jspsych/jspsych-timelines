---
"@jspsych-timelines/spatial-nback": minor
---

Add jsPsych parameter to timeline functions

BREAKING CHANGE: All timeline creation functions now require a jsPsych instance as the first parameter. This aligns the API with other timeline packages.

- `createTimeline(options)` → `createTimeline(jsPsych, options)`
- `createPracticeTimeline(options)` → `createPracticeTimeline(jsPsych, options)`
- `createMultiLevelNBackTimeline(options)` → `createMultiLevelNBackTimeline(jsPsych, options)`
- `presetConfigurations.easy()` → `presetConfigurations.easy(jsPsych)`

Additional changes:
- Fixed tsconfig to properly resolve external @jspsych-contrib dependency
- Added test for custom prompt parameter
