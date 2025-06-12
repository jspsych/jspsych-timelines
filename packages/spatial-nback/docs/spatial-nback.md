# spatial-nback

A deployable spatial n-back timeline for jsPsych. This module provides a flexible implementation of the spatial n-back task, supporting custom grid sizes, n-back levels, feedback, and more.

## Parameters

### Initialization Parameters

Initialization parameters can be set when calling `initJsPsych()`:

```js
initJsPsych({
  timelines: [
    {type: jsPsychTimelineSpatialNback, params: {...}}
  ]
})
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
rows | number | 3 | Number of rows in the grid
cols | number | 3 | Number of columns in the grid
n_back_level | number | 1 | The n-back level (how many trials back to match)
total_trials | number | 20 | Total number of trials in the timeline
target_percentage | number | 25 | Percentage of trials that are targets
stimulus_duration | number | 750 | Duration (ms) the stimulus is shown
isi_duration | number | 250 | Inter-stimulus interval (ms)
feedback_duration | number | 1000 | Duration (ms) of feedback display
show_feedback | boolean | false | Whether to show feedback after each trial
show_feedback_border | boolean | false | Whether to highlight the grid border for feedback
showFeedbackNoResponse | boolean | false | Show feedback if no response is made
feedbackWaitNoResponse | boolean | true | Wait for feedback even if no response
cell_size | number | 150 | Size (px) of each grid cell
instructions_trial | string | "Click the button when the position matches the one from {n} trial(s) ago" | Instructions template for each trial
button_text | string | "MATCH" | Text for the match button
stimulus_color | string | "#2196F3" | Color of the stimulus square
correct_color | string | "#4CAF50" | Color for correct feedback
incorrect_color | string | "#F44336" | Color for incorrect feedback
include_instructions | boolean | false | Whether to include instructions at the start
randomize_trials | boolean | false | Randomize the order of trials

### Trial Parameters

Trial parameters can be set when adding the timeline to a trial object:

```js
var trial = {
  type: jsPsych..., // your jsPsych plugin type
  timelines: [
    {type: jsPsychTimelineSpatialNback, params: {...}}
  ]
}
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
See above | | | (All initialization parameters can also be set per trial)

## Data Generated

Name | Type | Value
-----|------|------
trial_number | number | The trial index (1-based)
n_back_level | number | The n-back level for the timeline
total_trials | number | Total number of trials in the timeline
task | string | "spatial-nback"
response | string/number | Participant's response (if applicable)
rt | number | Response time in ms

## Functions

The following functions/utilities are exported for custom use:

### createSpatialNBackTimeline(params)
Creates a spatial n-back timeline with the specified parameters.

### createPracticeTimeline(params)
Creates a short practice timeline (6 trials, 33% targets, feedback enabled).

### createMultiLevelNBackTimeline(params)
Creates a timeline with multiple n-back levels (e.g., 1-back, 2-back, 3-back).

### presetConfigurations
Predefined configurations:
- `easy()`
- `medium()`
- `hard()`
- `research()`

### generateNBackSequence(total_trials, n_back_level, target_percentage, rows, cols)
Generates the sequence of positions and target flags for the task.

### instrictions_template
Default instructions template object.

---

See [src/index.ts](src/index.ts) for implementation details.