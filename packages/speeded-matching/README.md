# speeded-matching

## Overview

An assessment of processing speed. Participants are asked to identify which of a set of pictures matches the target picture shown at the top of the screen.

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-timelines/speeded-matching"></script>
<link rel="stylesheet" href="https://unpkg.com/@jspsych-timelines/speeded-matching/dist/css/styles.css">
```

### Via NPM

```sh
npm install @jspsych-timelines/speeded-matching
```

```js
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/speeded-matching"
import "@jspsych-timelines/speeded-matching/styles.css"
```

## Compatibility

`@jspsych-timelines/speeded-matching` requires jsPsych v8.0.0 or later.

## Documentation

### createTimeline

#### `createTimeline(jsPsych, options)` ⇒ `{ timeline }`

Creates a complete timeline for the speeded matching task with optional instructions, practice round, and main trials.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `test_items` | `string[]` | Built-in animal SVGs | HTML strings (e.g. SVGs) to use as stimuli |
| `num_trials` | `number` | `20` | Number of main task trials |
| `num_choices` | `number` | `4` | Number of choice options per trial. If changed, also update `trial_text.instruction_pages` — the default instructions name a specific number. |
| `trial_timeout` | `number` | `undefined` | Maximum response time per trial in ms. If omitted, trials wait indefinitely. |
| `inter_trial_interval` | `number` | `undefined` | Duration of the fixation cross shown between trials in ms. Omit or set to 0 to skip. |
| `show_instructions` | `boolean` | `true` | Show instruction pages before the main task |
| `show_practice` | `boolean` | `true` | Show a practice round before the main task |
| `practice_rounds` | `number` | `1` | Number of practice trials to run |
| `practice_target_duration` | `number` | `3000` | Duration in ms to display the target stimulus during the practice demo |
| `show_end_screen` | `boolean` | `true` | Show a completion screen after the main task. Set to `false` when embedding in a larger study with a custom debrief. |
| `trial_text` | `TrialText` | See below | Partial object to override any default text strings |

### Trial data

Each trial records the following fields in addition to standard jsPsych fields (`rt`, `response`, etc.):

| Field | Description |
|-------|-------------|
| `task` | Trial type identifier (e.g. `'speeded-matching-trial'`, `'practice-choices-demo'`, `'inter-trial-interval'`) |
| `phase` | Phase the trial belongs to: `'instructions'`, `'practice'`, `'main'`, or `'end'` |
| `correct` | `true` if the participant selected the matching picture (main and practice trials only) |
| `correct_answer` | Index of the correct choice button |
| `trial_number` | Trial number within the main task (main trials only) |
| `target_index` | Index of the target item within `test_items` |

### Customizing text (`trial_text`)

Pass a partial `TrialText` object to override any subset of the default strings. All keys are optional.

```js
const timeline = createTimeline(jsPsych, {
  trial_text: {
    instruction_pages: [
      "<b>You will see a picture at the top.</b>",
      "Below it, you will see six pictures.",   // updated for num_choices: 6
      "Click on the picture that matches.",
      "Work quickly but carefully.",
      "Let's practice first."
    ],
    practice_header: "Lookie here!",
    practice_complete_header: "Tada!",
    task_complete_header: "Nice!",
    task_complete_message: "Good job.",
  }
})
```

Default text values:

| Key | Default |
|-----|---------|
| `instruction_pages` | 5-page English instructions array |
| `continue_button` | `"Continue"` |
| `ready_button` | `"I'm Ready"` |
| `end_button` | `"End"` |
| `next_button` | `""` (arrow inherited from plugin) |
| `back_button` | `""` (arrow inherited from plugin) |
| `task_complete_header` | `"Task Complete!"` |
| `task_complete_message` | `"Thank you for participating in the speeded matching task."` |
| `practice_header` | `"Practice Round"` |
| `practice_intro_message` | `"We'll now do a practice round to show you how the task works."` |
| `practice_look_instruction` | `"Look at this picture"` |
| `practice_tap_instruction` | `"Tap the matching picture below"` |
| `practice_complete_header` | `"Are you ready?"` |
| `practice_complete_message` | `"Practice complete! Ready for the full test?"` |
| `main_task_prompt` | `"Tap the matching picture below"` |
| `fixation_cross` | `"+"` |

### timelineUnits

Exported object of internal builder functions, useful for composing custom timelines or writing tests.

| Export | Description |
|--------|-------------|
| `createInstructions(pages, next, back)` | Creates the jsPsych instructions trial |
| `createPracticeRound(items, num_choices, rounds, target_duration, text)` | Creates the full practice phase timeline array |
| `createReadyScreen(text)` | Creates the post-practice confirmation screen |
| `createTrialSet(items, target_index, num_choices)` | Generates one trial's target and shuffled choices |
| `generateTrials(config)` | Generates the full array of main task trial objects |

### utils

| Export | Description |
|--------|-------------|
| `defaultText` | The full default text object, useful as a base for `trial_text` overrides |
| `test_items` | The built-in array of animal SVG strings |
| `calculatePerformance(data)` | Computes accuracy and mean RT from jsPsych data records |

## Usage Example

```js
import { createTimeline } from "@jspsych-timelines/speeded-matching"
import "@jspsych-timelines/speeded-matching/styles.css"

const jsPsych = initJsPsych();

const timeline = createTimeline(jsPsych, {
  num_trials: 20,
  num_choices: 4,
  trial_timeout: 8000,
  inter_trial_interval: 500,
  show_instructions: true,
  show_practice: true,
  practice_rounds: 1,
});

jsPsych.run([timeline]);
```

## Author

Abdullah Hunter Farhat ([@farhat60](https://github.com/farhat60))
