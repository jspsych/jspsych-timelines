# timeline-hearts-and-flowers

## Overview

Implementation of the hearts and flowers task, which tests executive function.

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-timelines/timeline-hearts-and-flowers">
```

### Via NPM

```
npm install @jspsych-timelines/timeline-hearts-and-flowers
```

```js
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/timeline-hearts-and-flowers"
```

## Compatibility

`@jspsych-timelines/timeline-hearts-and-flowers` requires jsPsych v8.0.0 or later.

## Documentation

### createTimeline

#### jsPsychTimelineHeartsAndFlowers.createTimeline(jsPsych, { *options* }) ⇒ <code>timeline</code>
This timeline shows a sequence of hearts and flowers trials. In each trial, participants are shown a stimulus on one side of the screen. There are only two types of stimuli, and participants are taught and expected to respond to one type by pressing the button on the same side as it (traditionally a heart), and to the other by pressing the button on the opposite side (traditionally a flower), as quickly as possible.

The following parameters can be specified in the **options** parameter.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| n_trials | number | 20 | Number of hearts and flowers trials in the experiment (excluding demo trials). |
| side_weights | Array<{left_weight: number, right_weight: number}> | [1, 1] | Weights for the stimulus showing up on the left and right side respectively. |
| target_side_weights | Array<{same_weight: number, opposite_weight: number}> | [1, 1] | Weights for the stimulus with the same-side button as its target (hearts) and the stimulus with the opposite-side button as its target (flowers) respectively. |
| stimulus_options | Object<{<br>same_side_stimulus_name: string,<br>same_side_stimulus_src: string,<br>opposite_side_stimulus_name: string,<br>opposite_side_stimulus_src: string<br>}> | stimulus_options: {<br>same_side_stimulus_name: "heart",<br>same_side_stimulus_src: heartIconSvg,<br>opposite_side_stimulus_name: "flower",<br>opposite_side_stimulus_src: flowerIconSvg<br>} | Object containing information about the name and source of the stimulus with the same-side button as its target (traditionally hearts) and the stimulus with the opposite-side button (traditionally flowers) as its target respectively. |
| demo | boolean | true | Whether to include demo section teaching the participant how to respond to the two different stimulus types. |
| start_instruction_text | string | "Time to play!" | Text to display before real trials start. |
| end_instruction_text | string | "Great job! You're all done." | Text to display after all trials have been completed. |


### timelineUnits

#### jsPsychTimelineHeartsAndFlowers.timelineUnits.createGametypeTrial(stimulusName: string) ⇒ <code>trial</code>
This function takes in the name of the stimulus to be displayed (e.g. "heart" or "flower") and displays text that announces the next trial(s) to be of that type.

#### jsPsychTimelineHeartsAndFlowers.timelineUnits.createTrial(jsPsych, { *stimulusInfo* }, instruction) ⇒ <code>trial</code>
This function takes in the jsPsych object of the experiment, a stimulusInfo object containing the name of source for each stimulus type, a boolean flag for whether instructional text will be displayed, and creates a trial based on these options.

#### jsPsychTimelineHeartsAndFlowers.timelineUnits.createFeedbackTrial(jsPsych) ⇒ <code>trial</code>
This function takes in the jsPsych object of the experiment and displays feedback text based on whether the previous trial was answered correctly.

#### jsPsychTimelineHeartsAndFlowers.timelineUnits.createFixationTrial(jsPsych) ⇒ <code>trial</code>
This function takes in the jsPsych object of the experiment and creates a fixation trial of random duration between 100ms and 1000ms.

#### jsPsychTimelineHeartsAndFlowers.timelineUnits.createDemoSubTimeline(jsPsych, targetSide, { *stimulusInfo* }) ⇒ <code>timeline</code>
This function takes in the jsPsych object of the experiment, a string determining the type of stimulus to be demoed ("same" side, "opposite" side or "both") and a stimulusInfo object that describes the name and source for each type of stimulus, then returns a timeline that represents a demo section demoing the specified stimulus types.

#### jsPsychTimelineHeartsAndFlowers.timelineUnits.createTrialSubTimeline(jsPsych, { *options* }) ⇒ <code>timeline</code>
This function takes in the jsPsych object of the experiment and the options given, which include the stimulus types to be included ("same" side, "opposite" side, or "both), the number of trials, the weights for each type of stimulus, the weights for how often the stimulus shows up on the left or right side of the screen, and a stimulus_info object that describes the name and source of the stimuli.

### utils

#### jsPsychTimelineHeartsAndFlowers.utils.generateStimulus(targetSide, stimulusSide, { *stimulusInfo* }, instruction) ⇒ HTML
This function takes in a type of stimulus with its corresponding target side, the side where the stimulus will show up, a stimulusInfo object that describes the name and source of the stimuli, and a boolean flag for whether to show an instruction text teaching the participant which side's button to choose.

#### jsPsychTimelineHeartsAndFlowers.utils.getCorrectResponse(targetSide, stimulusSide) ⇒ string
This function takes in a stimulus's target side ("same" or "opposite"), the side of the screen that the stimulus showed up on ("left" or "right"), and returns the correct side to choose ("left" or "right").

## Author / Citation

Cherrie Chang