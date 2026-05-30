# Stroop Task Timeline

A jsPsych implementation of the classic Stroop task for measuring cognitive interference and response inhibition.

## Overview

The Stroop task presents color words (e.g., RED, BLUE) written in ink that either matches or conflicts with the word's meaning. Participants respond with the ink color, not the word. The difference in response time between congruent and incongruent trials is the Stroop effect.

## Installation  

### NPM

```bash
npm install @jspsych-timelines/stroop-task
```

### CDN

```html
<script src="https://unpkg.com/@jspsych-timelines/stroop-task"></script>
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
} = jsPsychTimelineStroopTask.timelineComponents;
```

### utils

Contains `generateStimuli(jsPsych, colorNames, colorValues, congruent_trials, incongruent_trials)`, which generates the set of Stroop stimuli for a given color array and trial counts. `colorNames` are the button label strings; `colorValues` are the corresponding CSS color values used to render the stimulus text.

## Configuration Options

### StroopConfig Interface

| Parameter | Type | Default | Description |
| ---------------------------------- | ------- | ---------------------- | --------------------------------------------------------- |
| `congruent_practice_trials` | number | `2` | Number of congruent practice trials |
| `incongruent_practice_trials` | number | `2` | Number of incongruent practice trials |
| `practice_trial_timeout` | number | `2000` | Maximum response time per practice trial in milliseconds |
| `congruent_main_trials` | number | `4` | Number of congruent trials in the main experiment |
| `incongruent_main_trials` | number | `4` | Number of incongruent trials in the main experiment |
| `trial_timeout` | number | `2000` | Maximum response time per main trial in milliseconds |
| `fixation_duration` | object | `{ min: 300, max: 1500 }` | Duration range for the fixation cross in milliseconds |
| `show_practice_feedback` | boolean | `true` | Whether to show correct/incorrect feedback after practice trials |
| `include_fixation` | boolean | `true` | Whether to show a fixation cross before each trial |
| `randomize_fixation_duration` | boolean | `true` | Whether to randomize fixation duration within the specified range |
| `show_instructions` | boolean | `true` | Whether to show the instruction screens |
| `show_results` | boolean | `true` | Whether to show a results summary at the end |
| `number_of_rows` | number | `2` | Number of rows in the response button grid |
| `number_of_columns` | number | `2` | Number of columns in the response button grid |
| `choice_of_colors` | string[] | `['RED', 'GREEN', 'BLUE', 'YELLOW']` | Color names used as button labels and word stimuli |
| `choice_of_color_values` | string[] | `null` | CSS color values for rendering stimulus text, one per entry in `choice_of_colors`. If `null`, color names are lowercased and used directly. |
| `trial_text` | object | `defaultText` | Partial override of text for instructions, feedback, fixation, and results screens |

## Data Generated

### Trial Data Properties

| Property | Type | Description |
| ---------------- | ------- | ------------------------------------------------------------------ |
| `task` | string | Always `'stroop'` for all trials in this timeline |
| `page` | string | Trial type: `'instructions'`, `'fixation'`, `'word'`, `'feedback'`, `'practice_debrief'`, or `'results'` |
| `phase` | string | `'practice'` or `'test'` for stimulus trials |
| `word` | string | The color word displayed (e.g., `'RED'`) |
| `color` | string | The CSS color value used to render the word (from `choice_of_color_values`, or lowercased `choice_of_colors` if not set) |
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

### Custom Color Values

Use `choice_of_color_values` when button labels don't map directly to CSS color names, or if you'd like variants of colors to appear under general colors. 

```javascript
const timeline = createTimeline(jsPsych, {
  choice_of_colors: ['Rouge', 'Bleu', 'Vert'],
  choice_of_color_values: ['red', 'blue', 'green'],
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
  practice_trial_timeout: 3000,
  trial_timeout: 2000,
});

jsPsych.run([timeline]);
```

### Custom Text

```javascript
const timeline = createTimeline(jsPsych, {
  trial_text: {
    fixation: "●",
    correct_feedback: "<p>Correct!</p>",
    finish_button: "Done",
  },
});

jsPsych.run([timeline]);
```

## License

MIT License
