# Stroop Task Timeline

## Overview

A comprehensive jsPsych timeline implementation of the classic Stroop task. This package provides a complete experiment including instructions, practice trials, main trials, and results display. The Stroop task measures cognitive interference by presenting color words (RED, GREEN, BLUE, YELLOW is the default) in matching or non-matching ink colors.

## Loading

```javascript
import { createTimeline } from '@jspsych-timeline/stroop-task-timeline';
```

## Compatibility

`stroop-task-timeline` requires jsPsych v8.0.0 or later.

## Documentation

### createTimeline

#### createTimeline(jsPsych, options) ⇒ <code>timeline</code>

Creates a complete Stroop task timeline with customizable parameters. The timeline includes welcome/instructions, practice trials with optional feedback, main experiment trials, and results display.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `practice_trials_per_condition` | number | 2 | Number of practice trials per condition (congruent/incongruent) |
| `congruent_main_trials` | number | 4 | Number of congruent trials in main experiment |
| `incongruent_main_trials` | number | 4 | Number of incongruent trials in main experiment |
| `trial_timeout` | number | 3000 | Maximum time (ms) allowed per trial |
| `fixation_duration` | object | `{min: 300, max: 1500}` | Duration range for fixation cross |
| `show_practice_feedback` | boolean | true | Whether to show feedback during practice |
| `include_fixation` | boolean | true | Whether to include fixation cross between trials |
| `show_welcome_and_instructions` | boolean | true | Whether to show welcome and instruction screens |
| `show_results` | boolean | true | Whether to show results at the end |
| `randomise_main_trial_condition_order` | boolean | true | Whether to randomize main trial order |
| `randomise_practice_trial_condition_order` | boolean | true | Whether to randomize practice trial order |
| `randomise_fixation_duration` | boolean | true | Whether to randomize fixation duration |
| `number_of_rows` | number | 2 | Number of rows for response button grid |
| `number_of_columns` | number | 2 | Number of columns for response button grid |
| `choice_of_colors` | string[] | `['RED', 'GREEN', 'BLUE', 'YELLOW']` | Colors to use in the task |

**Example Usage:**
```javascript
const jsPsych = initJsPsych();

const timeline = createTimeline(jsPsych, {
  practice_trials_per_condition: 3,
  congruent_main_trials: 6,
  incongruent_main_trials: 6,
  trial_timeout: 2500,
  choice_of_colors: ['RED', 'GREEN', 'BLUE']
});

jsPsych.run(timeline);
```

### timelineComponents

Individual timeline components available for custom timeline building:

- `createWelcomeAndInstructions(choiceOfColors)` - Creates welcome and instruction screens
- `createFixation(duration, randomize)` - Creates fixation cross trial
- `createStroopTrial(jsPsych, stimulus, isPractice, trialTimeout, numberOfRows, numberOfColumns, choiceOfColors)` - Creates individual Stroop trial
- `createPracticeFeedback(jsPsych, selectedColors)` - Creates practice feedback screen
- `createPracticeDebrief()` - Creates practice completion screen
- `createResults(jsPsych)` - Creates results display screen

### utils

Utility functions for custom implementations:

- `resetState()` - Resets internal state tracking
- `generateStimuli(selectedColors)` - Generates all possible stimulus combinations
- `shuffleArray(array)` - Shuffles array elements randomly

**Types:**
- `StroopStimulus` - Interface for stimulus objects
- `TrialData` - Interface for trial data
- `StroopState` - Interface for internal state tracking

## Features

- **Configurable colors**: Use any subset of RED, GREEN, BLUE, YELLOW
- **Flexible trial structure**: Customizable practice and main trial counts
- **Responsive design**: Button grid layout adapts to screen size
- **Performance tracking**: Automatic calculation of Stroop effect
- **Data export**: Built-in data download functionality
- **Feedback system**: Optional practice trial feedback

## Data Output

The timeline generates data for each trial including:
- Response time (rt)
- Accuracy (correct)
- Stimulus word and color
- Congruency (congruent/incongruent)
- Trial type (practice/response)

Results include:
- Congruent vs incongruent accuracy
- Mean response times
- Stroop effect calculation (incongruent RT - congruent RT)

## Author / Citation

Vishnu Lakshman