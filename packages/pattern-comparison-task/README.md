# pattern-comparison-task

## Overview

An assessment of processing speed. Participants are asked to quickly determine whether two stimuli are the same or not the same.

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-timelines/pattern-comparison-task">
```

### Via NPM

```
npm install @jspsych-timelines/pattern-comparison-task
```

```js
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/pattern-comparison-task"
```

## Compatibility

`@jspsych-timelines/pattern-comparison-task` requires jsPsych v8.0.0 or later.

## Documentation

### createTimeline

#### jsPsychTimelinePatternComparisonTask.createTimeline(jsPsych, { *options* }) ⇒ <code>timeline</code>

Creates a complete timeline for the pattern comparison task.

The following parameters can be specified in the **options** parameter.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| test_categories | array | Built-in categories | Custom pattern categories |
| num_trials | number | 20 | Number of trials to generate |
| prompt | string | "Are these two patterns the same?" | Instructions displayed above patterns |
| same_button_text | string | "Same" | Text for same response button |
| different_button_text | string | "Different" | Text for different response button |
| trial_timeout | number | 10000 | Maximum time per trial (ms) |
| inter_trial_interval | number | 500 | Time between trials (ms) |
| show_instructions | boolean | false | Show instruction pages before task |
| instruction_texts | array | Default instructions | Custom instruction content |

### timelineUnits

Object containing descriptions of timeline components:
- instructions: "Instructions for the pattern comparison task"
- trial: "Single pattern comparison trial"
- interTrialInterval: "Fixation cross between trials"
- endScreen: "Task completion screen"

### utils

Utility functions for pattern comparison task:
- generateTrials: Generate trial objects
- createInstructions: Create instruction timeline
- calculatePerformance: Calculate accuracy and reaction time statistics

## Author / Citation

Abdullah Hunter Farhat

If you use this task in research, please cite:
```
Farhat, A. H. (2024). Pattern Comparison Task for jsPsych [Computer software]. 
https://github.com/farhat60/jspsych-timelines/tree/main/packages/pattern-comparison-task
```