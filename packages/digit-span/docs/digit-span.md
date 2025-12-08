# Digit Span Task

A comprehensive implementation of the digit span working memory task for jsPsych. This task assesses working memory capacity by presenting sequences of digits that participants must recall either in the same order (forward span) or in reverse order (backward span).

## Overview

The digit span task presents participants with sequences of single digits (1-9) displayed one at a time. After viewing the complete sequence, participants use an on-screen number pad to enter their response. The task supports both forward and backward conditions and configurable sequence generation.

## Parameters

### Configuration Parameters

Parameters can be passed to the `createTimeline()` function:

```js
import { createTimeline } from '@jspsych-timelines/digit-span';

const timeline = createTimeline(jsPsych, {
  includeForward: true,
  includeBackward: true,
  startingSpan: 3
});
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
`includeForward` | boolean | `true` | Whether to include forward span trials
`includeBackward` | boolean | `true` | Whether to include backward span trials  
`startingSpan` | number | `3` | Initial sequence length
`maxSpan` | number | `9` | Maximum sequence length
`trialsPerSpan` | number | `2` | Number of trials at each span length
`digitPresentationTime` | number | `1000` | Duration to display each digit (ms)
`betweenDigitDelay` | number | `500` | Delay between digits (ms)
`responseTimeLimit` | number | `30000` | Maximum time for response (ms)
`trial_sequence` | Array | - | Custom sequence of 'forward'/'backward' trials

### Usage with jsPsych

The digit span timeline can be added to your jsPsych experiment:

```js
import { createTimeline } from '@jspsych-timelines/digit-span';

// Create the timeline
const digitSpanTimeline = createTimeline(jsPsych, {
  startingSpan: 4,
  maxSpan: 8
});

// Add to your experiment
const timeline = [
  // ... other trials
  ...digitSpanTimeline,
  // ... more trials
];

jsPsych.run(timeline);
```

## Data Generated

The timeline generates different data depending on the trial phase:

### Instructions Phase
Name | Type | Value
-----|------|------
`task` | string | `'digit-span'`
`phase` | string | `'instructions'`

### Digit Presentation Phase  
Name | Type | Value
-----|------|------
`task` | string | `'digit-span'`
`phase` | string | `'digit-presentation'`
`trial_duration` | number | Duration digit was displayed

### Recall Phase
Name | Type | Value
-----|------|------
`task` | string | `'digit-span'`
`phase` | string | `'recall'`
`condition` | string | `'forward'` or `'backward'`
`span` | number | Length of digit sequence
`target_sequence` | number[] | Correct sequence expected
`response_sequence` | number[] | Digits entered by participant
`correct` | boolean | Whether response was correct
`trial_index` | number | Index of current trial in sequence
`rt` | number | Response time in milliseconds

### Feedback Phase
Name | Type | Value
-----|------|------
`task` | string | `'digit-span'`
`phase` | string | `'feedback'`

### Results Phase
Name | Type | Value
-----|------|------
`task` | string | `'digit-span'`
`phase` | string | `'results'`

## Exported Functions

The package exports several utility functions for creating custom trial sequences:

### createTimeline(jsPsych, config)

Main function that creates the digit span timeline.

**Parameters:**
- `jsPsych` (JsPsych): Required jsPsych instance
- `config` (DigitSpanConfig): Configuration object (see Parameters section)

**Returns:** Array of jsPsych timeline objects

### createAlternatingSequence(length)

Creates a sequence that alternates between forward and backward trials.

**Parameters:**
- `length` (number): Total number of trials

**Returns:** Array of 'forward'/'backward' strings

**Example:**
```js
const sequence = createAlternatingSequence(6); 
// Returns: ['forward', 'backward', 'forward', 'backward', 'forward', 'backward']
```

### createBlockedSequence(forwardTrials, backwardTrials)

Creates a sequence with all forward trials first, then all backward trials.

**Parameters:**
- `forwardTrials` (number): Number of forward trials
- `backwardTrials` (number): Number of backward trials

**Returns:** Array of 'forward'/'backward' strings

### createRandomSequence(length, forwardProbability)

Creates a random sequence of trial types.

**Parameters:**
- `length` (number): Total number of trials
- `forwardProbability` (number): Probability of forward trial (0-1, default: 0.5)

**Returns:** Array of 'forward'/'backward' strings

### createBalancedRandomSequence(totalTrials)

Creates a randomized sequence with equal numbers of forward and backward trials.

**Parameters:**
- `totalTrials` (number): Total number of trials

**Returns:** Array of 'forward'/'backward' strings

## Examples

### Basic Usage
```js
import { createTimeline } from '@jspsych-timelines/digit-span';

// Simple forward-only digit span
const forwardOnlyTimeline = createTimeline(jsPsych, {
  includeBackward: false,
  startingSpan: 3,
  maxSpan: 7
});
```

### Custom Trial Sequence
```js
import { createTimeline, createBalancedRandomSequence } from '@jspsych-timelines/digit-span';

// Create balanced random sequence
const customSequence = createBalancedRandomSequence(12);

const timeline = createTimeline(jsPsych, {
  trial_sequence: customSequence,
  digitPresentationTime: 800,
  betweenDigitDelay: 300
});
```


## Features

- **Forward and Backward Conditions**: Test both forward recall (same order) and backward recall (reverse order)
- **Adaptive Difficulty**: Sequences start short and can increase in length based on performance
- **Mobile-Optimized Interface**: Responsive number pad that works well on touch devices
- **Flexible Trial Sequencing**: Multiple options for controlling the order of forward/backward trials
- **Comprehensive Data Collection**: Detailed trial-by-trial data including response accuracy and timing
- **Customizable Presentation**: Configurable timing parameters for digit display and inter-digit delays
- **Feedback Display**: Shows correct vs. incorrect responses with target and participant sequences

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+


