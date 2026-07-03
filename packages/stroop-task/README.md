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

Individual components for custom timeline construction:

```javascript
const {
  createInstructions,
  createFixation,
  createStroopTrials,
  createPracticeFeedback,
  createPracticeDebrief,
  createResults,
} = jsPsychTimelineStroopTask.timelineUnits;
```

- `createInstructions(instructionsText, colors?)` — creates the instruction pages trial
- `createFixation(fixationDuration, fixationText)` — creates a fixation cross trial
- `createStroopTrials(jsPsych, StroopTrialOptions)` — creates a block of Stroop trials with optional fixation and feedback; see [StroopTrialOptions](#strooptrialoptions) below
- `createPracticeFeedback(jsPsych, selectedColors, correctText, incorrectText, continueBtnText, feedbackTimeout?)` — creates a practice feedback trial
- `createPracticeDebrief(practiceDebriefText, continueBtnText)` — creates the screen between practice and main experiment
- `createResults(jsPsych, text, finishButtonText?)` — creates the results summary screen

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
| `randomize_fixation_duration` | boolean | `true` | Whether to randomize fixation duration within the specified range |
| `include_fixation` | boolean | `true` | Whether to show a fixation cross before each trial |
| `show_practice_feedback` | boolean | `true` | Whether to show correct/incorrect feedback after practice trials |
| `feedback_timeout` | number | `2000` | Duration in milliseconds that practice feedback is displayed before auto-advancing |
| `show_instructions` | boolean | `true` | Whether to show the instruction screens |
| `show_results` | boolean | `true` | Whether to show a results summary at the end |
| `number_of_rows` | number | `2` | Number of rows in the response button grid |
| `number_of_columns` | number | `2` | Number of columns in the response button grid |
| `colors` | string[] | `['RED', 'GREEN', 'BLUE', 'YELLOW']` | Color names used as button labels and word stimuli |
| `color_values` | string[] \| null | `null` | CSS color values for rendering stimulus text, one per entry in `colors`. If `null`, color names are lowercased and used directly. |
| `trial_text` | object | `defaultText` | Partial override of any text content; see [trial_text keys](#trial_text-keys) below |

### trial_text keys

Pass any subset of these keys to `trial_text` to override the defaults:

| Key | Type | Description |
| ------------------- | ------ | --------------------------------------------------------- |
| `instructions` | `(string \| ((colors?: string[]) => string))[]` | Array of instruction pages. Each entry is an HTML string or a function that receives the `colors` array and returns an HTML string. |
| `correct_feedback` | string | HTML shown after a correct practice response. Use `%ANSWER%` as a placeholder for the correct color name. |
| `incorrect_feedback` | string | HTML shown after an incorrect practice response. Use `%ANSWER%` as a placeholder for the correct color name. |
| `continue_button` | string | Label for the continue button on the feedback screen. Default: `"Continue"` |
| `practice_debrief` | string | HTML content for the screen shown between practice and the main experiment. |
| `fixation` | string | Content rendered inside the fixation element. Default: `"+"` |
| `response_button_html` | `(choice: string, choice_index: number) => string` | Function returning the HTML for each response button. |
| `start_button` | string | Label for the button that starts the main experiment after the practice debrief. Default: `"Start"` |
| `finish_button` | string | Label for the button on the results screen. Default: `"Finish"` |
| `results` | string | HTML template for the results screen. Supports placeholders: `%congruentAccuracy%`, `%congruentRt%`, `%incongruentAccuracy%`, `%incongruentRt%`, `%stroopEffect%` |

### StroopTrialOptions Interface

Used with `timelineComponents.createStroopTrials`:

| Parameter | Type | Default | Description |
| ----------------------------- | ------- | ---------------------- | --------------------------------------------------------- |
| `trial_variables` | StroopStimulus[] | *(required)* | Stimuli to present, typically from `utils.generateStimuli` |
| `is_practice` | boolean | *(required)* | Marks the block as practice (`true`) or main (`false`) |
| `trial_timeout` | number | `2000` | Maximum response time per trial in milliseconds |
| `number_of_rows` | number | `2` | Number of rows in the response button grid |
| `number_of_columns` | number | `2` | Number of columns in the response button grid |
| `colors` | string[] | `['RED', 'GREEN', 'BLUE', 'YELLOW']` | Color names for response buttons |
| `include_fixation` | boolean | `true` | Whether to show a fixation cross before each trial |
| `randomize_fixation_duration` | boolean | `true` | Whether to randomize fixation duration within the specified range |
| `fixation_duration` | object | `{ min: 300, max: 1500 }` | Duration range for the fixation cross in milliseconds |
| `show_practice_feedback` | boolean | `true` | Whether to show feedback after each trial (only applies when `is_practice` is `true`) |
| `feedback_timeout` | number | `2000` | Duration in milliseconds that practice feedback is displayed before auto-advancing |
| `text` | object | `defaultText` | Text content for feedback and other messages |

## Data Generated

### Trial Data Properties

| Property | Type | Description |
| ------------------- | ------- | ------------------------------------------------------------------ |
| `task` | string | Always `'stroop'` for all trials in this timeline |
| `page` | string | Trial type: `'instructions'`, `'fixation'`, `'word'`, `'feedback'`, `'practice_debrief'`, or `'results'` |
| `phase` | string | `'practice'` or `'test'` for stimulus trials |
| `word` | string | The color word displayed (e.g., `'RED'`) |
| `color` | string | The CSS color value used to render the word (from `color_values`, or lowercased `colors` if not set) |
| `correct_response` | number | Index of the correct response button in the `colors` array |
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
  colors: ['RED', 'GREEN', 'BLUE'],
  number_of_rows: 1,
  number_of_columns: 3,
});

jsPsych.run([timeline]);
```

### Custom Color Values

Use `color_values` when button labels don't map directly to CSS color names, or when you want pastel/custom shades to display under standard color names.

```javascript
const timeline = createTimeline(jsPsych, {
  colors: ['Rouge', 'Bleu', 'Vert'],
  color_values: ['red', 'blue', 'green'],
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
    incorrect_feedback: "<p>Incorrect. The correct answer was %ANSWER%.</p>",
    finish_button: "Done",
  },
});

jsPsych.run([timeline]);
```

## License

MIT License

## Author / Citation

Vishnu Lakshman
