# Stroop Task Timeline

A jsPsych implementation of the classic Stroop task for measuring cognitive interference and response inhibition.

## Overview

The Stroop task presents color words (e.g., RED, BLUE) written in ink that either matches or conflicts with the word's meaning. Participants respond with the ink color, not the word. The difference in response time between congruent and incongruent trials is the Stroop effect.

## Installation

### NPM

```bash
npm install @jspsych-timeline/stroop-task-timeline
```

### CDN

```html
<script src="https://unpkg.com/@jspsych-timeline/stroop-task-timeline"></script>
```

## API Reference

### createTimeline(jsPsych, config)

Creates a complete Stroop task timeline.

**Parameters:**

- `jsPsych` (JsPsych): The jsPsych instance
- `config` (StroopConfig, optional): Configuration options

**Returns:** Timeline object for use with `jsPsych.run()`

### timelineComponents

Access individual components for custom timeline construction:

```javascript
const {
  createInstructions,
  createFixation,
  createStroopTrials,
  createPracticeFeedback,
  createPracticeDebrief,
  createResults,
} = jsPsychTimelineStroopTaskTimeline.timelineComponents;
```

### utils

Contains `generateStimuli`, which generates the set of Stroop stimuli for a given color array and trial counts.

## Configuration Options

### StroopConfig Interface

| Parameter | Type | Default | Description |
| ---------------------------------- | ------- | ---------------------- | --------------------------------------------------------- |
| `congruent_practice_trials` | number | `2` | Number of congruent practice trials |
| `incongruent_practice_trials` | number | `2` | Number of incongruent practice trials |
| `congruent_main_trials` | number | `4` | Number of congruent trials in the main experiment |
| `incongruent_main_trials` | number | `4` | Number of incongruent trials in the main experiment |
| `trial_timeout` | number | `2000` | Maximum response time per trial in milliseconds |
| `fixation_duration` | object | `{ min: 300, max: 1500 }` | Duration range for the fixation cross in milliseconds |
| `show_practice_feedback` | boolean | `true` | Whether to show correct/incorrect feedback after practice trials |
| `include_fixation` | boolean | `true` | Whether to show a fixation cross before each trial |
| `randomize_fixation_duration` | boolean | `true` | Whether to randomize fixation duration within the specified range |
| `show_instructions` | boolean | `true` | Whether to show the instruction screens |
| `show_results` | boolean | `true` | Whether to show a results summary at the end |
| `number_of_rows` | number | `2` | Number of rows in the response button grid |
| `number_of_columns` | number | `2` | Number of columns in the response button grid |
| `choice_of_colors` | string[] | `['RED', 'GREEN', 'BLUE', 'YELLOW']` | Color names to use as stimuli and response options |
| `text` | object | `defaultText` | Custom text for instructions, feedback, and results screens |

## Data Generated

### Trial Data Properties

| Property | Type | Description |
| ---------------- | ------- | ------------------------------------------------------------------ |
| `task` | string | Always `'stroop'` for all trials in this timeline |
| `page` | string | Trial type: `'instructions'`, `'fixation'`, `'word'`, `'feedback'`, `'practice_debrief'`, or `'results'` |
| `phase` | string | `'practice'` or `'test'` for stimulus trials |
| `word` | string | The color word displayed (e.g., `'RED'`) |
| `color` | string | The ink color of the word as a lowercase CSS color name (e.g., `'blue'`) |
| `correct_response` | number | Index of the correct response button in the `choice_of_colors` array |
| `congruent` | boolean | Whether the word and ink color match |
| `response` | number | Index of the button the participant clicked, or `null` on timeout |
| `correct` | boolean | Whether the response matched the correct response |
| `rt` | number | Response time in milliseconds from stimulus onset, or `null` on timeout |

## Examples

### Basic Task

```javascript
const timeline = createTimeline(jsPsych);

jsPsych.run([timeline]);
```

### Custom Color Set

```javascript
const timeline = createTimeline(jsPsych, {
  choice_of_colors: ['RED', 'GREEN', 'BLUE'],
  number_of_rows: 1,
  number_of_columns: 3,
});

jsPsych.run([timeline]);
```

### Longer Experiment

```javascript
const timeline = createTimeline(jsPsych, {
  congruent_practice_trials: 4,
  incongruent_practice_trials: 4,
  congruent_main_trials: 20,
  incongruent_main_trials: 20,
  trial_timeout: 3000,
});

jsPsych.run([timeline]);
```

### Filtering Data After the Experiment

```javascript
// Get only main experiment trials
const mainTrials = jsPsych.data.get().filter({ task: 'stroop', page: 'word', phase: 'test' });

// Get congruent trials only
const congruent = mainTrials.filter({ congruent: true });

// Calculate mean RT for correct incongruent trials
const incongruentRT = mainTrials.filter({ congruent: false, correct: true }).select('rt').mean();
```

## License

MIT License
