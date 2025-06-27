# pattern-comparison-task

An assessment of processing speed. Participants are asked to quickly determine whether two stimuli are the same or not the same.

## Parameters

### Initialization Parameters

Initialization parameters can be set when calling `initJsPsych()`

```js
initJsPsych({
  timelines: [
    {type: jsPsychTimelinePatternComparisonTask, params: {...}}
  ]
})
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
test_categories | array | Built-in categories | Custom pattern categories to use
num_trials | number | 20 | Number of trials to generate
prompt | string | "Are these two patterns the same?" | Instructions text displayed above patterns
enable_tts | boolean | false | Enable text-to-speech for accessibility
same_button_text | string | "Same" | Text for the same response button
different_button_text | string | "Different" | Text for the different response button
trial_timeout | number | 10000 | Maximum time allowed per trial (ms)
inter_trial_interval | number | 500 | Time between trials (ms)
show_instructions | boolean | false | Show instruction pages before task
instruction_texts | array | Default instructions | Custom instruction page content

### Trial Parameters

Trial parameters can be set when adding the timeline to a trial object.

```js
var trial = {
  type: jsPsych...,
  timelines: [
    {type: jsPsychTimelinePatternComparisonTask, params: {...}}
  ]
}
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
Same as above | | |

## Data Generated

Name | Type | Value
-----|------|------
task | string | "pattern-comparison"
trial_number | number | Sequential trial number
correct_answer | number | 0 = same, 1 = different
response | number | Participant's response
correct | boolean | Whether response was correct
rt | number | Reaction time in milliseconds
category_index | number | Index of pattern category used
test_name | string | Name of specific pattern
is_same | boolean | Whether patterns were identical
pattern1 | string | SVG string of first pattern
pattern2 | string | SVG string of second pattern

## Functions

Utility functions available in the utils export.

### generateTrials(config)

Generates trial objects based on configuration.

### createInstructions(pages, enableTTS)

Creates instruction timeline from page data.

### speakText(text)

Uses Web Speech API for text-to-speech.

### calculatePerformance(data)

Calculates accuracy and reaction time statistics from trial data.