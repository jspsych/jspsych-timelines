# speeded-matching

An assessment of processing speed. Participants are asked to identify which of four pictures matches the target picture at the top of the screen.

## Parameters

### Initialization Parameters

Initialization parameters can be set when calling `createTimeline()`

```js
import { createTimeline } from "@jspsych-timelines/speeded-matching"

const timeline = createTimeline(jsPsych, {
  num_trials: 10,
  enable_tts: true,
  // ... other options
})
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
test_items | array | Built-in animal SVGs | Custom SVG strings to use as stimuli
num_trials | number | 20 | Number of trials to generate
num_choices | number | 4 | Number of choice options per trial
enable_tts | boolean | true | Enable text-to-speech for accessibility
trial_timeout | number | 10000 | Maximum time per trial (ms)
inter_trial_interval | number | 500 | Time between trials (ms)
show_instructions | boolean | true | Show instruction pages before task
show_practice | boolean | true | Show practice round before main task
instruction_texts | array | Default instructions | Custom instruction page content

### Trial Parameters

Trial parameters are the same as initialization parameters. The timeline can be used directly in jsPsych.

```js
import { createTimeline } from "@jspsych-timelines/speeded-matching"

const timeline = createTimeline(jsPsych, config);
jsPsych.run([timeline]);
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
Same as initialization parameters above | | |

## Data Generated

The following data is collected for each trial:

Name | Type | Value
-----|------|------
task | string | Trial type: 'speeded-matching-trial', 'instruction-page', 'practice-target-demo', 'practice-choices-demo', 'ready-screen', 'inter-trial-interval', 'end-screen'
trial_number | number | Sequential trial number (for main trials)
correct_answer | number | Index of the correct choice option
target_index | number | Index of target stimulus in test_items array
target | string | SVG string of the target stimulus
choices | array | Array of SVG strings for choice options
response | number | Participant's selected choice index
correct | boolean | Whether the response was correct
reaction_time | number | Response time in milliseconds (same as rt)
rt | number | jsPsych standard reaction time field

## Functions

Utility functions available in the utils export.

### generateTrials(config)

Generates trial objects based on configuration parameters.

### createInstructions(pages, enableTTS)

Creates instruction timeline from page data with optional text-to-speech.

### createPracticeRound(items, enableTTS)

Creates practice round with demonstrations and voice instructions.

### createReadyScreen()

Creates ready confirmation screen after practice.

### speakText(text)

Uses Web Speech API for text-to-speech functionality.

### createTrialSet(items, targetIndex, numChoices)

Creates a single trial with target and distractors.

### getRandomTestItems(items, count)

Gets random selection of test items for variety.

### calculatePerformance(data)

Calculates accuracy and reaction time statistics from trial data. Returns overall performance metrics and per-target breakdown.

