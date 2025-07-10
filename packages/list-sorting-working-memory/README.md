# list-sorting-working-memory

## Overview

An implementation of the List Sorting Working Memory Task.

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-timelines/list-sorting-working-memory">
```

### Via NPM

```
npm install @jspsych-timelines/list-sorting-working-memory
```

```js
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/list-sorting-working-memory"
```

## Compatibility

`@jspsych-timelines/list-sorting-working-memory` requires jsPsych v8.0.0 or later.

## Documentation
### `createTimeline()` Documentation



#### Function: createTimeline()

> **createTimeline**(`jsPsych`, `options`): `Object`[]

Create a timeline for the List Sorting Working Memory task.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych instance of the experiment timeline. |
| `options` | [`lswmTimelineOptions`](#interface-lswmtimelineoptions) | Options for the List Sorting Working Memory Test timeline. |

##### Returns

`Object`[]

An array of List Sorting Working Memory sections that make up a List Sorting Working Memory Test experiment timeline.

***



#### Interface: lswmTimelineOptions

Options for [createTimeline](#function-createtimeline).

##### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="stimulus_set_list"></a> `stimulus_set_list?` | [`lswmStimulusSet`](#interface-lswmstimulusset)[] | `{@link DEFAULT_LIVE_STIMULI}` | The list of stimulus sets to be used in the List Sorting Working Memory Test. |
| <a id="dimensions_sequence"></a> `dimensions_sequence?` | `number`[] | [1, 2, ..., len(`stimulus_set_list`)] | The sequence of dimensions (1-list, 2-list, etc.) for the List Sorting Working Memory Test. |
| <a id="n_live_max_attempts"></a> `n_live_max_attempts?` | `number` | `2` | The maximum number of attempts allowed for each live trial sequence in the List Sorting Working Memory Test. |
| <a id="practice_stimulus_set_list"></a> `practice_stimulus_set_list?` | `Map`\<`number`, [`lswmStimulusSet`](#interface-lswmstimulusset)[][]\> | Randomly sampling the stimuli sets for each section to form `n_practice_sequences` number of practice trial sequences for each section. | Allow users to manually input the practice stimuli used for each dimension/section of the List Sorting Working Memory experiment timeline by providing a map from dimension value to the practice stimulus sets for that dimension. Each key is a dimension (e.g. 1, 2, etc.) and the value is an array of arrays of stimulus sets that form the practice stimuli used for the List Sorting Working Memory section of that dimension. |
| <a id="n_practice_sequences"></a> `n_practice_sequences?` | `number` | `2` | The number of practice trial sequences for each dimension/section of the List Sorting Working Memory experiment timeline. |
| <a id="n_practice_max_attempts"></a> `n_practice_max_attempts?` | `number` | `n_live_max_attempts` | The maximum number of attempts allowed for each practice trial sequence in the List Sorting Working Memory Test. |

***



#### Interface: lswmStimulusSet

Interface for a set of stimuli that form a category (e.g. animals, foods) in the List Sorting Working Memory Test experiment timeline.
Each stimulus set has a stimulus_set_name, which is used to identify the stimuli category.
Each stimulus set also has a stimulus_set field, which is an array of stimulus objects that follow the [lswmStimulus](#interface-lswmstimulus) interface.
The stimulus objects in each set are grouped in arrays, where each array represents a group of stimuli that are of similar size, e.g. `[lemon, apple, peach]`.

##### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="stimulus_set_name"></a> `stimulus_set_name` | `string` | The name of the stimulus set, e.g. "animals", "foods", etc. |
| <a id="stimulus_set"></a> `stimulus_set` | [`lswmStimulus`](#interface-lswmstimulus)[][] | An array of arrays of stimulus objects, where each array represents a group of stimuli that are of similar size. |

***



#### Interface: lswmStimulus

Interface for each stimulus in the List Sorting Working Memory Test experiment timeline.
Each stimulus object has a name, image code/file, and audio file.
The stimulus_set_id is optional and can be used to group stimuli in sets.

##### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="stimulus_name"></a> `stimulus_name` | `string` | The name of the stimulus, e.g. "lemon", "apple", "peach". |
| <a id="stimulus_image"></a> `stimulus_image` | `string` | The SVG code, image file path or URL of the stimulus, e.g. `"images/lemon.png"`. |
| <a id="stimulus_audio"></a> `stimulus_audio` | `string` | The audio file path or URL of the stimulus, e.g. `"audio/lemon.mp3"`. |
| <a id="stimulus_set_id"></a> `stimulus_set_id?` | `string` | The ID of the stimulus set this stimulus belongs to, e.g. "animals", "foods", etc. |

***



### `timelineUnits` Documentation



#### lswmTrialSequence()

> **lswmTrialSequence**: (`jsPsych`, `options`) => `any`[]

Create a sequence of List Sorting Working Memory Test trials.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych instance of the experiment timeline. |
| `options` | [`lswmTrialSequenceOptions`](#interface-lswmtrialsequenceoptions) | Options for the List Sorting Working Memory Test trial sequence. |

##### Returns

`any`[]

An array of List Sorting Working Memory Test trials.

***



#### Interface: lswmTrialSequenceOptions

Options for [lswmTrialSequence](#lswmtrialsequence).

##### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="dimension"></a> `dimension` | `number` | `undefined` | The number of categories in the List Sorting Working Memory Test trial sequence, e.g. 1 for one-list, 2 for two-list, etc. |
| <a id="stimulus_set_list"></a> `stimulus_set_list` | [`lswmStimulusSet`](#interface-lswmstimulusset)[] | `undefined` | The list of stimulus sets to be used in the List Sorting Working Memory Test trial sequence. |
| <a id="sequence_length"></a> `sequence_length?` | `number` | All stimuli in `stimulus_set_list` will be used without replacement. | The number of stimuli to sample in the List Sorting Working Memory Test trial sequence. |
| <a id="task"></a> `task?` | `"live"` \| `"practice"` | `"live"` | The task type, either "practice" or "live". |
| <a id="max_attempts"></a> `max_attempts?` | `number` | `2` | The maximum number of attempts allowed for the practice trial. |

***



#### lswmTrialSequenceRetryLoop()

> **lswmTrialSequenceRetryLoop**: (`jsPsych`, `options`) => `any`[]

Wrapper for [lswmTrialSequence](#lswmtrialsequence) that creates a retry loop for each List Sorting Working Memory Test trial sequence.
For each trial sequence length, the participant is allowed to retry up to `max_attempts` times if they do not get all answers correct for the sequence.
In each retry, a new set of stimuli is sampled from the `stimulus_set_list`.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych instance of the experiment timeline. |
| `options` | [`lswmTrialSequenceOptions`](#interface-lswmtrialsequenceoptions) | Options for the List Sorting Working Memory Test trial sequence wrapper. |

##### Returns

`any`[]

A timeline containing a List Sorting Working Memory Test trial sequence that recursively pushes a new trial sequence of the same length to the timeline upon participant's failure of the trial sequence, tracking the number of attempts.

***



#### lswmSection()

> **lswmSection**: (`jsPsych`, `options`) => `any`[]

Create a section of the list sorting working memory task.
Each section consists of multiple List Sorting Working Memory trial sequences.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych instance of the experiment timeline. |
| `options` | [`lswmTrialSectionOptions`](#interface-lswmtrialsectionoptions) | Options for a List Sorting Working Memory Test section. |

##### Returns

`any`[]

An array of List Sorting Working Memory Test trial sequences that make up one section.
***

#### Interface: lswmTrialSectionOptions

Options for [lswmSection](#lswmsection).

##### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="dimension"></a> `dimension` | `number` | `undefined` | The number of categories in the List Sorting Working Memory Test section, e.g. 1 for one-list, 2 for two-list, etc. |
| <a id="stimulus_set_list"></a> `stimulus_set_list` | [`lswmStimulusSet`](#interface-lswmstimulusset)[] | `undefined` | The list of stimulus sets to be used in the List Sorting Working Memory Test section. |
| <a id="sample_size_sequence"></a> `sample_size_sequence?` | `number`[] | `[2, 3, 4, 5, 6, 7].` | The sequence of sample sizes for each trial sequence in the section. |
| <a id="excluded_sets"></a> `excluded_sets?` | (`string` \| `number`)[] | Empty `Set()` | The list of stimulus set names or indices to exclude from the section. |
| <a id="max_attempts"></a> `max_attempts?` | `number` | `2` | The maximum number of attempts allowed for each trial sequence in the section. |

***



### `utils` Documentation



#### DEFAULT\_LIVE\_STIMULI

> **DEFAULT\_LIVE\_STIMULI**: [`lswmStimulusSet`](#interface-lswmstimulusset)[]

#### DEFAULT\_PRACTICE\_STIMULI

> **DEFAULT\_PRACTICE\_STIMULI**: `Map`\<`number`, [`lswmStimulusSet`](#interface-lswmstimulusset)[][]\>

#### nListPracticeInstructionText()

> **nListPracticeInstructionText**: (`stimulusSetList`, `practice?`) => `string`

Generate instruction text for a practice section in the List Sorting Working Memory Test.

##### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `stimulusSetList` | [`lswmStimulusSet`](#interface-lswmstimulusset)[] | `undefined` | The list of stimulus sets to be used in the section. This is used to determine the number of categories and dynamically generate the instruction text. |
| `practice?` | `boolean` | `true` | Whether this is a practice section. If true, the instruction text will be tailored for practice. |

##### Returns

`string`

The instruction text.

***



#### cleanExcludedSets()

> **cleanExcludedSets**: (`stimulus_set_list`, `excluded_sets`) => `void`

Modifies a list of stimulus sets in-place to exclude any sets that are specified in the `excluded_sets` array.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stimulus_set_list` | [`lswmStimulusSet`](#interface-lswmstimulusset)[] | The list of stimulus sets to filter. |
| `excluded_sets` | (`string` \| `number`)[] | An array of strings or numbers representing the names or indices of the stimulus sets to exclude. |

##### Returns

`void`

***



#### getRandomSubarray()

> **getRandomSubarray**: (`array`, `sample_size`) => `any`[]

Get a random subarray of a given size from an array.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `array` | `any`[] | The array to sample from. |
| `sample_size` | `number` | The number of elements to sample. |

##### Returns

`any`[]

A randomly sampled subarray of size = `sample_size`.

***



#### flattenStimulusSetList()

> **flattenStimulusSetList**: (`stimulus_set_subarray`) => `object` & [`lswmStimulus`](#interface-lswmstimulus)[][]

Flatten a list of stimulus sets into an array of stimulus groups, each group containing stimuli of one category and of similar size.
Each stimulus in each group records its name, image, audio, set ID, and index within the set, which denotes its position in the sequence in terms of size.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stimulus_set_subarray` | [`lswmStimulusSet`](#interface-lswmstimulusset)[] | An array of stimulus sets, where each set contains groups of stimuli. |

##### Returns

`object` & [`lswmStimulus`](#interface-lswmstimulus)[][]

The flattened array of stimulus groups.

***



#### sampleStimulusAcrossSets()

> **sampleStimulusAcrossSets**: (`stimulus_set_list`, `sample_size`) => `object`[]

Sample a specified number of stimuli across different sets, ensuring that each set is sampled roughly the same number of times via round-robin sampling.
Within each set, stimuli of similar size do not get sampled more than once.

##### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `stimulus_set_list` | `object`[][] | `undefined` | The list of stimulus groups, where each group contains stimuli of one category and of similar size. |
| `sample_size` | `number` | `1` | The number of stimuli to sample across all sets. Defaults to 1 if not provided. |

##### Returns

`object`[]

An array of sampled stimuli.

***



#### preloadTrial()

> **preloadTrial**: () => `object`

Automatically find all preloadable audio and/or image files for the List Sorting Working Memory Test and preloads them.

##### Returns

`object`

A jsPsych trial object that preloads audio and/or image files for the List Sorting Working Memory Test.

***



#### instructionTrial()

> **instructionTrial**: (`instruction_text`, `button_text?`) => `object`

Trial that displays an instruction text and a button to continue (customizable text).

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `instruction_text` | `string` | The text to display in the instruction trial. |
| `button_text?` | `string` | The text to display on the button. |

##### Returns

`object`

A jsPsych trial object for displaying instructions.

***



#### lswmTrial()

> **lswmTrial**: (`jsPsych`, `sampledSetIds`, `task`) => `object`

Trial for displaying one stimulus in the List Sorting Working Memory Test.
Displays the stimulus image with the stimulus name printed at the bottom and automatically plays the stimulus audio.

##### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | `undefined` | The jsPsych instance of the experiment timeline. |
| `sampledSetIds` | `Set`\<`string`\> | `...` | A set of sampled stimulus set IDs for this trial, used to track which sets are used in the List Sorting Working Memory Test trial sequence this trial belongs to. |
| `task` | `"live"` \| `"practice"` | `"live"` | The task type, either "practice" or "live". |

##### Returns

`object`

A jsPsych trial object for displaying a single stimulus in the List Sorting Working Memory Test.

***



#### answerTrial()

> **answerTrial**: (`trialSequenceStimuli`, `task`) => `object`

##### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `trialSequenceStimuli` | `object`[] | `undefined` | The array of stimuli displayed in the trial sequence. |
| `task` | `"live"` \| `"practice"` | `"live"` | The task type, either "practice" or "live". |

##### Returns

`object`

A jsPsych trial object for the participant to provide answers to a List Sorting Working Memory Test trial sequence.

***



#### practiceFeedbackTrial()

> **practiceFeedbackTrial**: (`jsPsych`, `getAttempts`, `max_attempts`) => `object`

Trial for providing feedback after a practice trial in the List Sorting Working Memory Test.

##### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | `undefined` | The jsPsych instance of the experiment timeline. |
| `getAttempts` | () => `number` | `undefined` | A function that returns the number of attempts made so far in the practice trial. |
| `max_attempts` | `number` | `2` | The maximum number of attempts allowed for the practice trial. |

##### Returns

`object`

A jsPsych trial object for providing feedback after a practice trial in the List Sorting Working Memory Test.
***

## Author / Citation

Cherrie Chang