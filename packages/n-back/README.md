# n-back

## Overview

A timeline for the nback task

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-timelines/n-back">
```

### Via NPM

```
npm install @jspsych-timelines/n-back
```

```js
import { createTimeline } from "@jspsych-timelines/n-back"
```

## Compatibility

`@jspsych-timelines/n-back` requires jsPsych v8.0.0 or later.

## Documentation

### createTimeline

#### jsPsychTimelineNBack.createTimeline(jsPsych, { *options* }) ⇒ <code>timeline</code>
This timeline describes an N-back task setup that is customizable based on several parameters, allowing researchers to control the level of difficulty, timing, and data output format.

| Parameter           | Type                      | Default       | Description                                                                                   |
|---------------------|---------------------------|---------------|-----------------------------------------------------------------------------------------------|
| `stimuli`           | `any`                     |               | Stimuli array used in the N-back task, which can be customized based on the experiment needs. |
| `keyboard_response` | `string`                  | `"n"`     | Key used by participants to respond during trials.                                            |
| `trial_duration`    | `number`                  | `1000` ms     | Duration of each trial in milliseconds.                                                       |
| `post_trial_gap`    | `number`                  | `500` ms      | Gap between trials in milliseconds.                                                           |
| `fixation_duration` | `number`                  | `500` ms      | Duration of the fixation cross before each trial.                                             |
| `n`                 | `number`                  | `2`           | Level of N-back, determining how many trials back the participant should remember.            |
| `num_trials`        | `number`                  | `20`          | Total number of trials in the experiment.                                                     |
| `rep_ratio`         | `number`                  | `0.2`         | Probability that a stimulus will repeat in the N-back sequence, affecting task difficulty.     |
| `debrief`           | `boolean`                 | `false`       | Whether to show a debrief screen at the end of the task.                                      |
| `return_accuracy`   | `boolean`                 | `false`       | Whether to return participant accuracy as part of the output data.                            |
| `data_output`       | `"none"`, `"json"`, `"csv"` | `"none"`    | Specifies the format for saving output data, if any.                                          |

## Reference for Standard Performance

### Standard N-back Task Performance

The following table summarizes the standard performance (accuracy and reaction times) for control subjects in the 1-back, 2-back, and 3-back tasks, as reported by Harvey et al. (2004).

| Condition | Accuracy (%)      | Reaction Time (ms)         |
|-----------|-------------------|----------------------------|
| 1-back    | 96.5 (±3.6)       | 749.3 (±199.0)             |
| 2-back    | 85.6 (±8.8)       | 1005.5 (±247.2)            |
| 3-back    | 80.0 (±7.4)       | 1049.5 (±214.8)            |

with a sample size of 22 individuals. 

## Reference

Harvey, P. O., Le Bastard, G., Pochon, J. B., Levy, R., Allilaire, J. F., Dubois, B., & Fossati, P. (2004). Executive functions and updating of the contents of working memory in unipolar depression. Journal of Psychiatric Research, 38(6), 567–576. https://doi.org/10.1016/j.jpsychires.2004.03.003

## Author 

Feng Wan

