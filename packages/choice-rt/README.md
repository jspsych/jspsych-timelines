# @jspsych-timelines/choice-rt

## Overview

A two-alternative choice reaction time timeline for jsPsych. On each trial a fixation cross is shown for a random foreperiod, then a colored circle appears and the participant presses the button matching its color. Responses faster than `minValidRT` are recorded as anticipations rather than as fast correct responses. The timeline includes optional instructions, an optional practice block with per-trial feedback, and a results screen reporting mean RT and accuracy.

## Loading

### Via CDN

```html
<script src="https://unpkg.com/@jspsych-timelines/choice-rt"></script>
```

This exposes the global `jsPsychTimelineChoiceRT`. Styles are bundled into the script, so there is no separate stylesheet to load.

### Via npm

```bash
npm install @jspsych-timelines/choice-rt
```

```javascript
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/choice-rt";
```

## Compatibility

`@jspsych-timelines/choice-rt` requires jsPsych v8.0.0 or later.

## Quick Start

```javascript
import { initJsPsych } from "jspsych";
import { createTimeline, utils } from "@jspsych-timelines/choice-rt";

const jsPsych = initJsPsych({
  on_finish: () => console.log(utils.scoring.getSummary(jsPsych.data.get())),
});

const timeline = createTimeline(jsPsych, {
  numTrials: 40,
  numPracticeTrials: 8,
  responseTimeout: 2000,
});

jsPsych.run([timeline]);
```

## Documentation

### createTimeline

#### jsPsychTimelineChoiceRT.createTimeline(jsPsych, { _options_ }) ⇒ <code>timeline</code>

Creates a complete choice RT timeline: optional instructions, an optional practice block of `numPracticeTrials` trials with per-trial feedback, then `numTrials` scored trials, then a results screen. Each trial is a fixation screen, a response screen, and an inter-trial interval; practice trials add a feedback screen.

The stimulus sequence is balanced between the two colors. On an odd trial count the extra trial goes to a color chosen at random rather than always to the same one.

The following parameters can be specified in the **options** parameter.

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `numTrials` | number | `20` | Number of scored trials. |
| `showInstructions` | boolean | `true` | Include the instruction screens. |
| `showPractice` | boolean | `true` | Include the practice block with per-trial feedback. |
| `numPracticeTrials` | number | `5` | Practice trials, when `showPractice` is on. |
| `feedbackDuration` | number | `1000` | Practice feedback duration in ms. |
| `foreperiodMin` | number | `500` | Minimum foreperiod (fixation to stimulus) in ms. |
| `foreperiodMax` | number | `1500` | Maximum foreperiod in ms. |
| `responseTimeout` | number | `1500` | Response window in ms; no response is recorded as a timeout. |
| `iti` | number | `500` | Inter-trial interval in ms. |
| `minValidRT` | number | `100` | Responses faster than this are recorded as anticipations. |
| `stimulusColor1` | string | `"#4A90D9"` | Color mapped to button 1. |
| `stimulusColor2` | string | `"#E8913A"` | Color mapped to button 2. |
| `stimulusSize` | number | `60` | Stimulus diameter in pixels. |
| `text` | object | `{}` | Partial override of the default strings. |

`createTimeline` throws on a configuration that would produce a plausible-looking but degenerate dataset rather than an obvious failure: a `numTrials` that is not an integer of at least 1, an inverted foreperiod range, a negative duration, a `responseTimeout` that is not positive, a `minValidRT` at or above `responseTimeout` — which would mark every response as anticipated — and, when `showPractice` is on, a `numPracticeTrials` below 1.

#### Changing the colors

The button labels are language, so they live in the text object rather than being derived from the colors. Change both together:

```javascript
const timeline = createTimeline(jsPsych, {
  stimulusColor1: "#2E7D32",
  stimulusColor2: "#C62828",
  text: { button_1: "GREEN", button_2: "RED" },
});
```

The instruction screen names whatever colors and labels it is given; it does not hardcode the defaults.

### timelineUnits

Individual components, for building a custom timeline.

| Function | Signature |
| --- | --- |
| `createInstructionTrials` | `(config, part)` → trial object |
| `createChoiceRTTrial` | `(jsPsych, config, stimulusType, trialNumber, isPractice)` → timeline object |
| `createTrialBlock` | `(jsPsych, config, numTrials, isPractice)` → timeline object |
| `createCompletionTrial` | `(jsPsych, config)` → trial object |
| `generateForeperiod` | `(min, max)` → number |
| `generateStimulusSequence` | `(numTrials)` → `Array<1 \| 2>` |
| `createStimulusHTML` | `(color, size)` → string |
| `createFixationHTML` | `()` → string |

`config` is a fully resolved options object — spread `utils.constants.DEFAULT_OPTIONS` and add `text`. Note that these units skip the validation `createTimeline` performs, and that `part` is one of `"intro"`, `"practice"` or `"task"`.

### utils

| Member | Description |
| --- | --- |
| `utils.text` | Default text strings; pass a partial override as `text` to `createTimeline`. |
| `utils.constants` | `{ TASK_NAME: "choice-rt", VERSION, DEFAULT_OPTIONS }`. |
| `utils.scoring.calculateScores(data)` | Returns a `ScoringResult` for the `phase: "test"` response trials. |
| `utils.scoring.getSummary(data)` | As above, plus `taskName` and `version`. |

`ScoringResult` reports `meanRT`, `rtStd`, `accuracy`, `totalTrials`, `correctTrials`, `incorrectTrials`, `anticipatedResponses` and `timeoutResponses`. The four counts partition `totalTrials`. Accuracy divides `correctTrials` by the trials that produced a usable response, so anticipations and timeouts are excluded from the denominator rather than counted as errors. `meanRT`, `rtStd` and `accuracy` are `number | null` and are `null` when their denominator is empty, since the measure is undefined rather than zero for a participant who never responded validly — `rtStd` also requires at least two correct trials.

### Text

Every participant-visible string lives in one object, so a translation is a single argument. Text that varies with a value is a function of that value.

| Key | Type |
| --- | --- |
| `continue_button` | string |
| `start_button` | string |
| `button_1` | string |
| `button_2` | string |
| `instruction_intro` | `(color1, color2, label1, label2)` → string |
| `instruction_task` | string |
| `instruction_practice` | string |
| `feedback_correct` | string |
| `feedback_incorrect` | string |
| `feedback_timeout` | string |
| `feedback_anticipated` | string |
| `task_complete` | string |
| `result_summary` | `(meanRT, accuracy)` → string |

```javascript
const timeline = createTimeline(jsPsych, {
  text: {
    continue_button: "Continuer",
    start_button: "Commencer",
    button_1: "BLEU",
    button_2: "ORANGE",
    instruction_intro: (color1, color2, label1, label2) => `
      <p>Appuyez sur le bouton correspondant à la couleur du cercle.</p>
      <ul>
        <li><strong style="color: ${color1};">${label1}</strong></li>
        <li><strong style="color: ${color2};">${label2}</strong></li>
      </ul>`,
    result_summary: (meanRT, accuracy) =>
      accuracy === null ? "<p>Terminé</p>" : `<p>Précision : ${accuracy.toFixed(1)}%</p>`,
  },
});
```

Both functions may ignore their arguments — `() => "Respond now"` is a valid override. `meanRT` and `accuracy` are `null` when the participant produced no trial to compute them from, so a custom `result_summary` must handle that.

### Data

Every row carries `task: "choice-rt"`, `task_version`, `phase` and `part`. A full run with instructions and practice emits these kinds:

| `phase` | `part` |
| --- | --- |
| `instructions` | `instruction` |
| `practice` | `instruction`, `foreperiod`, `response`, `feedback`, `iti` |
| `test` | `instruction`, `foreperiod`, `response`, `iti` |
| `completion` | `results` |

The scored rows are `phase: "test"`, `part: "response"`:

| Field | Type | Description |
| --- | --- | --- |
| `trial_number` | number | Position within its own block, from 1. |
| `stimulus_type` | `1 \| 2` | Which color was shown. |
| `response` | `1 \| 2 \| null` | Button pressed; `null` on timeout. |
| `correct` | boolean | Response matched the stimulus and was not anticipated. |
| `anticipated` | boolean | RT below `minValidRT`. |
| `foreperiod` | number | Fixation duration for that trial, in ms. |
| `rt` | `number \| null` | Response time in ms; `null` on timeout. |

`stimulus` and `trial_index` are reserved: jsPsych and the underlying plugin write them after the timeline's own `data`, so `stimulus` holds the rendered HTML and `trial_index` the experiment-wide position. Use `stimulus_type` and `trial_number`.

### Styling

Every rule ships scoped under `.jspsych-choice-rt`, which the timeline adds to the display element via `css_classes` for its own trials only, and every class is prefixed `jspsych-choice-rt-`. Nothing here restyles other tasks in a composed battery. To restyle the task, target the prefixed classes.

Runnable example: [`examples/`](./examples).

## Author / Citation

Josh de Leeuw
