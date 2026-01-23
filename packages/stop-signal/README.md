# stop-signal

## Overview

An implementation of a stop signal task with on-screen buttons and arrows. 

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-timelines/stop-signal">
```

### Via NPM

```
npm install @jspsych-timelines/stop-signal
```

```js
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/stop-signal"
```

## Compatibility

`stop-signal` requires jsPsych v8.0.0 or later.

## Documentation

### createTimeline

#### jsPsychTimelineStopSignal.createTimeline(jsPsych, { *options* }) ⇒ <code>timeline</code>
This timeline displays a series of tasks where the user is tasked with pressing buttons that correspond to arrows shown on the screen, but have to stop their response whenever a red X is shown. 

The following parameters can be specified in the **options** parameter.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| buttons | String[] | ['Left', 'Right'] | The text that will be shown on the buttons |
| image_width | number | 200 | The image width |
| image_height | number | null | The image height. The default value will scale the image based on the width. | 
| current_delay | number | 500 | The initial delay (in ms) between when the arrow and stop signal is shown. |
| delay_adaptive | boolean | true | If the delay will increase for every successful stop and decrease for every unsuccessful stop. |
| delay_change | number | 50 | The amount by which the delay will change (in ms) if it is adaptive. |
| min_delay | number | 20 | The minimum possible delay (in ms). |
| max_delay | number | 980 | The maximum possible delay (in ms). |
| trial_duration | number | 1000 | The total time (in ms) each trial will take. |
| total_trials | number | 16 | The total number of trials. |
| stop_percent | number | 0.25 | The percent of the trials that will have stop signals. |


### timelineUnits

None at this time

### utils

None at this time

## Author / Citation

This timeline was created by [Becca Bogstad](https://github.com/beccaTurtle) and [Josh de Leeuw](https://github.com/jodeleeuw).