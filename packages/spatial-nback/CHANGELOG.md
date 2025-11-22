# @jspsych-timelines/spatial-nback

## 0.3.0

### Minor Changes

- 799ce2f: Add createGridHTML utility function

  New utility function to generate HTML for spatial n-back grids. This allows users to create custom grid-based trials using plugins like html-button-response.

  Features:

  - Custom grid dimensions (rows/cols)
  - Custom cell size (pixels or default 12vh)
  - Optional cell highlighting with custom color
  - Exported in utils object

## 0.2.0

### Minor Changes

- b676e03: Add jsPsych parameter to timeline functions

  BREAKING CHANGE: All timeline creation functions now require a jsPsych instance as the first parameter. This aligns the API with other timeline packages.

  - `createTimeline(options)` → `createTimeline(jsPsych, options)`
  - `createPracticeTimeline(options)` → `createPracticeTimeline(jsPsych, options)`
  - `createMultiLevelNBackTimeline(options)` → `createMultiLevelNBackTimeline(jsPsych, options)`
  - `presetConfigurations.easy()` → `presetConfigurations.easy(jsPsych)`

  Additional changes:

  - Fixed tsconfig to properly resolve external @jspsych-contrib dependency
  - Added test for custom prompt parameter

## 0.1.0

### Minor Changes

- f6231c3: Spatial-nback timeline with full support for all devices.
