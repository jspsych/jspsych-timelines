# jspsych-timelines
Shareable, configurable timelines for jsPsych experiments.


## Structure

Each timeline module exports a `createTimeline()` method. This method returns an object with a `timeline` property that can be inserted into a jsPsych timeline.

```js
const task = jsPsychTimelineModule.createTimeline(jsPsych, {options})
jsPsych.run([task])
```

Timeline modules may also export a `timelineUnits` objects and a `utils` object. 

The `timelineUnits` object contains functions that create smaller units of a timeline than the main `createTimeline()` method. For example, if the main timeline contains two phases (e.g., memorization and test) then there could be `timelineUnits.createTestTimeline()` and `timelineUnits.createMemorizationTimeline()`. These functions could then be used for assembling the overall task in a different way than `createTimeline()` allows. There are no constraints on what kinds of timeline creation methods can be exported in `timelineUnits`, other than the requirement that all methods return an object that can be added to a jsPsych timeline. Some modules may export methods to create units as small as a single trial, while others export no methods at all.

The `utils` object contains miscellaneous functions that may be useful when using the module. For example, if a task requires creating a complex stimulus that can be procedurally generated there could be a `utils.createStimulus()` method that returns HTML. Or if there is a task that involves a particular scoring system like a questionnaire with validated indicies then there could be a `utils.generateScore()` method. There are no constraints on what methods can be exported as part of the `utils` object.
