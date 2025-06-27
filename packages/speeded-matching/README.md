# speeded-matching

## Overview

An assessment of processing speed. Participants are asked to identify which of four pictures matches the target picture at the top of the screen.

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-timelines/speeded-matching">
```

### Via NPM

```
npm install @jspsych-timelines/speeded-matching
```

```js
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/speeded-matching"
```

## Compatibility

`@jspsych-timelines/speeded-matching` requires jsPsych v8.0.0 or later.

## Documentation

### createTimeline

#### jsPsychTimelineSpeededMatching.createTimeline(jsPsych, { *options* }) ⇒ <code>timeline</code>

Creates a complete timeline for the speeded matching task with optional instructions, practice round, and main trials.

The following parameters can be specified in the **options** parameter.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| test_items | array | Built-in animal SVGs | Custom SVG strings to use as stimuli |
| num_trials | number | 20 | Number of trials to generate |
| num_choices | number | 4 | Number of choice options per trial |
| enable_tts | boolean | true | Enable text-to-speech for accessibility |
| trial_timeout | number | 10000 | Maximum time per trial (ms) |
| inter_trial_interval | number | 500 | Time between trials (ms) |
| show_instructions | boolean | true | Show instruction pages before task |
| show_practice | boolean | true | Show practice round before main task |
| instruction_texts | array | Default instructions | Custom instruction page content |


### timelineUnits

Object containing descriptions of timeline components:
- **instructions**: "Instructions for the speeded matching task"
- **practice**: "Practice round with voice instructions and demonstrations"
- **readyScreen**: "Confirmation screen before starting the main task"
- **trial**: "Single speeded matching trial with target and choice options"
- **interTrialInterval**: "Fixation cross between trials"
- **endScreen**: "Task completion screen"

### utils

Utility functions for speeded matching task:
- **generateTrials**: Generate trial objects based on configuration
- **createInstructions**: Create instruction timeline from page data
- **createPracticeRound**: Create practice round with demonstrations
- **createReadyScreen**: Create ready confirmation screen
- **speakText**: Text-to-speech function using Web Speech API
- **createTrialSet**: Create a single trial with target and distractors
- **getRandomTestItems**: Get random selection of test items
- **calculatePerformance**: Calculate accuracy and reaction time statistics

## Usage Example

```js
import { createTimeline } from "@jspsych-timelines/speeded-matching"

const jsPsych = initJsPsych();

const config = {
  num_trials: 10,
  num_choices: 4,
  enable_tts: true,
  show_instructions: true,
  show_practice: true,
  trial_timeout: 8000,
  inter_trial_interval: 750
};

const timeline = createTimeline(jsPsych, config);
jsPsych.run([timeline]);
```

## Author / Citation

Hunter Farhat

If you use this task in research, please cite:
```
Farhat, H. (2024). Speeded Matching Task for jsPsych [Computer software]. 
https://github.com/farhat60/jspsych-timelines/tree/main/packages/speeded-matching
```