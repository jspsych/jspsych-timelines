**@jspsych-timelines/hearts-and-flowers**

---

# hearts-and-flowers

## Overview

Implementation of the hearts and flowers task, which tests executive function.
In each trial, participants are shown a stimulus on one side of the screen. There are only
two types of stimuli, and participants are taught and expected to respond to
one type by pressing the button on the same side as it (traditionally a
heart), and to the other by pressing the button on the opposite side
(traditionally a flower), as quickly as possible.

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-timelines/hearts-and-flowers">
```

### Via NPM

```
npm install @jspsych-timelines/hearts-and-flowers
```

```js
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/hearts-and-flowers";
```

## Compatibility

`@jspsych-timelines/hearts-and-flowers` requires jsPsych v8.0.0 or later.

## Documentation

### `createTimeline()` Documentation

#### Function: createTimeline()

> **createTimeline**(`jsPsych`, `options`): `object`

Generates a timeline with the given options that constitute a hearts
and flowers task.

##### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `options` | `Partial`\<[`CreateTimelineOptions`](#interface-createtimelineoptions)\> | The options object that includes the number of trials, the weights for how often each type of stimulus appears, the weights for how often the stimulus appears on each side, the stimulus information containing the name and source of each stimulus type, whether to include a demo section or not, and the instruction text at the beginning and end of the experiment. |

##### Returns

`object`

The main timeline object.

---

#### Interface: CreateTimelineOptions

Define and export the interface for the `options` parameter in [createTimeline](#function-createtimeline).

##### Properties

| Property | Type | Default value | Description |
| -------- | ---- | ------------- | ----------- |
| <a id="n_trials"></a> `n_trials` | `number` | `20` | The number of trials to include in the experiment. |
| <a id="side_weights"></a> `side_weights` | \[`number`, `number`\] | `[1, 1]` | The weights for how often the stimulus appears on each side [left, right]. |
| <a id="target_side_weights"></a> `target_side_weights` | \[`number`, `number`\] | `[1, 1]` | The weights for how often each type of stimulus appears, defined by their target side [same, opposite]. |
| <a id="fixation_duration_function"></a> `fixation_duration_function` | () => `number` | `() => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0]` | The function that returns a random fixation duration from a list of possible durations. |
| <a id="stimulus_options"></a> `stimulus_options` | `Partial`\<[`StimulusOptions`](#interface-stimulusoptions)\> | `{ same_side_stimulus_name: "heart", same_side_stimulus_src: heartIconSvg, opposite_side_stimulus_name: "flower", opposite_side_stimulus_src: flowerIconSvg }` | The options object that includes the name and source of each stimulus type. |
| <a id="text_options"></a> `text_options` | `Partial`\<[`TextOptions`](#interface-textoptions)\> | See [TextOptions](#interface-textoptions) | The text object that contains all display strings within the timeline. |
| <a id="demo"></a> `demo` | `boolean` | `true` | Whether to include a demo section or not. |
| <a id="end_instruction"></a> `end_instruction` | `boolean` | `true` | Whether to show the end instruction screen. |
| <a id="end_instruction_duration"></a> `end_instruction_duration` | `number` | `4000` | The duration of time to show the end instruction screen, in milliseconds. |

---

#### Interface: StimulusOptions

Define and export the interface for the `stimulus_options` property in [CreateTimelineOptions](#interface-createtimelineoptions).

##### Properties

| Property | Type | Default value | Description |
| -------- | ---- | ------------- | ----------- |
| <a id="same_side_stimulus_name"></a> `same_side_stimulus_name` | `string` | `"heart"` | The name of the stimulus to be displayed when the target side is the same side. |
| <a id="same_side_stimulus_src"></a> `same_side_stimulus_src` | `string` | `heartIconSvg` | The source of the stimulus to be displayed when the target side is the same side. |
| <a id="opposite_side_stimulus_name"></a> `opposite_side_stimulus_name` | `string` | `"flower"` | The name of the stimulus to be displayed when the target side is the opposite side. |
| <a id="opposite_side_stimulus_src"></a> `opposite_side_stimulus_src` | `string` | `flowerIconSvg` | The source of the stimulus to be displayed when the target side is the opposite side. |

---

#### Interface: TextOptions

Define and export the interface for the `text_options` property in [CreateTimelineOptions](#interface-createtimelineoptions).

##### Properties

| Property | Type | Default value | Description |
| -------- | ---- | ------------- | ----------- |
| <a id="start_instructions_text"></a> `start_instructions_text` | `string` | `"Time to play!"` | The instruction text at the beginning of the experiment. |
| <a id="start_instructions_button_text"></a> `start_instructions_button_text` | `string` | `"Start"` | The button text to proceed from the start instructions. |
| <a id="format_instructions"></a> `format_instructions` | `(stimulus_name: string, side: string) => string` | `(stimulus_name, side) => \`When you see a \${stimulus_name}, press the button on the \${side} side.\`` | The instruction text for the demo section. |
| <a id="format_gametype_announcement"></a> `format_gametype_announcement` | `(name: string) => string` | `(name) => \`This is the \${name} game. Here's how you play it.\`` | The announcement text for the start of each gametype section. |
| <a id="gametype_announcement_button_text"></a> `gametype_announcement_button_text` | `string` | `"OK"` | The button text to proceed from the gametype announcement. |
| <a id="fixation_text"></a> `fixation_text` | `string` | `"+"` | The fixation cross text. This will automatically be wrapped in a `<div>` with the class `jspsych-hearts-and-flowers-fixation`. |
| <a id="format_feedback"></a> `format_feedback` | `(correct: boolean) => string` | `(correct) => correct ? "Great job!" : "Try again."` | The feedback text after each demo trial. |
| <a id="end_instructions_text"></a> `end_instructions_text` | `string` | `"Great job! You're all done."` | The instruction text at the end of the experiment. |

---

### `timelineUnits` Documentation

#### createGametypeTrial()

> **createGametypeTrial**: (`stimulusName`, `format_gametype_announcement`, `gametype_announcement_button_text`) => `object`

Trial that announces the demo game type.

##### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `stimulusName` | `string` | The name of the stimulus to be demoed. |
| `format_gametype_announcement` | `(name: string) => string` | Function to format the gametype announcement text. |
| `gametype_announcement_button_text` | `string` | The button text to proceed from the gametype announcement. |

##### Returns

`object`

Plugin object displaying the name of the stimulus to be demoed.

---

#### createTrial()

> **createTrial**: (`jsPsych`, `stimulusInfo`, `instruction`) => `object`

Trial that shows the stimulus and collects the response.

##### Parameters

| Parameter | Type | Default value | Description |
| --------- | ---- | ------------- | ----------- |
| `jsPsych` | `JsPsych` | `undefined` | The jsPsych object that runs the experiment. |
| `stimulusInfo` | [`StimulusInfo`](#interface-stimulusinfo) | `undefined` | The stimulus information object that describes the name of the stimulus and its source. |
| `instruction` | `boolean` | `false` | Whether to include instruction text teaching participants how to respond or not. |

##### Returns

`object`

Plugin object displaying the stimulus and collecting the response.

---

#### Interface: StimulusInfo

Interface for the stimulus information object that describes the name and source of the stimulus for both target sides.

##### Properties

| Property | Type | Default value | Description |
| -------- | ---- | ------------- | ----------- |
| <a id="same"></a> `same` | `SameStimulusInfo` & `object` | `{ stimulus_name: "heart", stimulus_src: heartIconSvg, target_side: "same" }` | The stimulus information object for the same target side. |
| <a id="opposite"></a> `opposite` | `SameStimulusInfo` & `object` | `{ stimulus_name: "flower", stimulus_src: flowerIconSvg, target_side: "opposite" }` | The stimulus information object for the opposite target side. |

---

#### createFeedbackTrial()

> **createFeedbackTrial**: (`jsPsych`, `format_feedback`) => `object`

Trial that shows feedback after each demo trial.

##### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `format_feedback` | `(correct: boolean) => string` | Function to format the feedback text based on correctness. |

##### Returns

`object`

jsPsychHtmlKeyboardResponse object displaying feedback after each demo trial that depends on whether the participant answered correctly.

---

#### createFixationTrial()

> **createFixationTrial**: (`jsPsych`, `fixationDurationFunction`, `fixation_text`) => `object`

Trial that shows a fixation cross.

##### Parameters

| Parameter | Type | Default value | Description |
| --------- | ---- | ------------- | ----------- |
| `jsPsych` | `JsPsych` | `undefined` | The jsPsych object that runs the experiment. |
| `fixationDurationFunction` | () => `number` | `undefined` | The function that returns a random fixation duration from a list of possible durations. |
| `fixation_text` | `string` | `"+"` | The fixation text to display. |

##### Returns

`object`

Plugin object displaying a fixation cross for a random duration.

---

#### createDemoSubTimeline()

> **createDemoSubTimeline**: (`jsPsych`, `targetSide`, `stimulusInfo`, `format_feedback`, `format_gametype_announcement`, `gametype_announcement_button_text`) => `object`

Creates a demo subtimeline.

##### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `targetSide` | `"both"` \| keyof StimulusInfo | The side of the target stimulus. |
| `stimulusInfo` | [`StimulusInfo`](#interface-stimulusinfo) | The stimulus information object that describes the name of the stimulus and its source. |
| `format_feedback` | `(correct: boolean) => string` | Function to format the feedback text. |
| `format_gametype_announcement` | `(name: string) => string` | Function to format the gametype announcement text. |
| `gametype_announcement_button_text` | `string` | The button text to proceed from the gametype announcement. |

##### Returns

`object`

A subtimeline that includes a demo trial with stimulus on the left, a demo trial with stimulus on the right, or both.

---

#### createTrialsSubTimeline()

> **createTrialsSubTimeline**: (`jsPsych`, `options`) => `object`

Creates a subtimeline with a set number of trials.

##### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `options` | `Partial`\<[`CreateTrialsSubTimelineOptions`](#interface-createtrialssubtimelineoptions)\> | The options object that includes what kinds of trials to include [same\|opposte\|both], the number of trials, the weights for how often each type of stimulus appears, the weights for how often the stimulus appears on each side, and the stimulus information containing the name and source of each stimulus type. |

##### Returns

`object`

A subtimeline with a set number of trials with the specified options.

---

#### Interface: CreateTrialsSubTimelineOptions

Interface for the options parameter in [createTrialsSubTimeline](#createtrialssubtimeline).

##### Properties

| Property | Type | Default value | Description |
| -------- | ---- | ------------- | ----------- |
| <a id="target_side"></a> `target_side` | `"both"` \| `"same"` \| `"opposite"` | `"both"` | The side of the target stimulus [same\|opposite\|both]. |
| <a id="n_trials"></a> `n_trials` | `number` | `20` | The number of trials to include in the experiment. |
| <a id="target_side_weights"></a> `target_side_weights` | \[`number`, `number`\] | `[1, 1]` | The weights for how often each type of stimulus appears, defined by their target side [same, opposite]. |
| <a id="side_weights"></a> `side_weights` | \[`number`, `number`\] | `[1, 1]` | The weights for how often the stimulus appears on each side [left, right]. |
| <a id="fixation_duration_function"></a> `fixation_duration_function` | () => `number` | `() => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0]` | The function that returns a random fixation duration from a list of possible durations. |
| <a id="stimulus_info"></a> `stimulus_info` | [`StimulusInfo`](#interface-stimulusinfo) | `{ same_side_stimulus_name: "heart", same_side_stimulus_src: heartIconSvg, opposite_side_stimulus_name: "flower", opposite_side_stimulus_src: flowerIconSvg }` | The stimulus information object that describes the name and source of the stimulus. |
| <a id="text_options"></a> `text_options` | [`TextOptions`](#interface-textoptions) | See [TextOptions](#interface-textoptions) | The text object that contains all display strings within the timeline. |

---

### `utils` Documentation

#### generateStimulus()

> **generateStimulus**: (`targetSide`, `stimulusSide`, `stimulusInfo`, `instruction?`) => `string`

Generates the stimulus HTML for a given trial.

##### Parameters

| Parameter | Type | Default value | Description |
| --------- | ---- | ------------- | ----------- |
| `targetSide` | `"same"` \| `"opposite"` | `undefined` | The side of the target stimulus [same\|opposite]. |
| `stimulusSide` | `"left"` \| `"right"` | `undefined` | The side of the stimulus to be displayed [left\|right]. |
| `stimulusInfo` | [`StimulusInfo`](#interface-stimulusinfo) | `undefined` | The stimulus information object that describes the name and source of the stimulus. |
| `instruction?` | `boolean` | `false` | Whether to include instruction text teaching participants how to respond. |

##### Returns

`string`

HTML string representing the stimulus.

---

#### getCorrectResponse()

> **getCorrectResponse**: (`targetSide`, `stimulusSide`) => `"left"` \| `"right"`

Computes the correct response index.

##### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `targetSide` | `"same"` \| `"opposite"` | The side of the target stimulus [same\|opposite]. |
| `stimulusSide` | `"left"` \| `"right"` | The side of the stimulus to be displayed [left\|right]. |

##### Returns

`"left"` \| `"right"`

The correct response index.