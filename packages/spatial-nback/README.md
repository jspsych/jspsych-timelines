# @jspsych-timelines/spatial-nback

## Overview

A deployable spatial n-back timeline for jsPsych experiments. The spatial n-back task is a working memory test where participants must remember the position of stimuli across trials and identify when the current position matches the position from n trials ago.

## Loading

### Via CDN
```html
<script src="https://unpkg.com/@jspsych-timelines/spatial-nback"></script>
```

### Via npm
```bash
npm install @jspsych-timelines/spatial-nback
```

```javascript
import { createTimeline } from '@jspsych-timelines/spatial-nback';
```

## Compatibility

`spatial-nback` requires jsPsych v8.0.0 or later.

## Quick Start

### Basic Usage

```javascript
import { initJsPsych } from 'jspsych';
import { createTimeline } from '@jspsych-timelines/spatial-nback';

const jsPsych = initJsPsych({
  on_finish: function() {
    jsPsych.data.displayData();
  }
});

// Create a basic 1-back task with instructions
const timeline = createTimeline(jsPsych, {
  n_back: 1,
  total_trials: 20,
  target_percentage: 40,
  include_instructions: true,
  show_feedback_text: true
});

jsPsych.run(timeline);
```

### Practice Session

```javascript
import { createPracticeTimeline } from '@jspsych-timelines/spatial-nback';

// Short practice with feedback
const practiceTimeline = createPracticeTimeline(jsPsych, {
  n_back: 1,
  include_instructions: true
});

jsPsych.run(practiceTimeline);
```

### Using Presets

```javascript
import { presetConfigurations } from '@jspsych-timelines/spatial-nback';

// Easy configuration (1-back, 20 trials, feedback enabled)
const easyTask = presetConfigurations.easy(jsPsych);

// Research configuration (multi-level 1-3 back, 50 trials each)
const researchTask = presetConfigurations.research(jsPsych);
```

## Documentation

### createTimeline

#### createTimeline(jsPsych, options) ⇒ <code>timeline</code>
Creates a spatial n-back timeline with the specified parameters.

**Key Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| n_back | number | 1 | The n-back level (trials to remember back) |
| total_trials | number | 20 | Total number of trials |
| target_percentage | number | 40 | Percentage of trials that are targets |
| rows | number | 3 | Grid rows |
| cols | number | 3 | Grid columns |
| stimulus_duration | number | 750 | How long the cell stays highlighted, in ms |
| isi_duration | number | 500 | Blank interval after the stimulus, in ms |
| feedback_duration | number | 0 | Extra time held for feedback, in ms |
| show_feedback_text | boolean | false | Show correctness feedback |
| show_feedback_border | boolean | false | Outline the grid in the feedback color |
| cell_size | number \| null | null | Cell size in px; `null` uses a viewport-relative size |
| prompt | function \| null | null | `(n_back, trial_number, total_trials) => string`; `null` uses `texts.prompt` |
| buttons | string[] \| null | null | Response button labels; `null` uses `texts.button` |
| stimulus_color | string | "#2196F3" | Highlight color |
| correct_color | string | "#4CAF50" | Correct feedback color |
| incorrect_color | string | "#F44336" | Incorrect feedback color |
| include_instructions | boolean | false | Include instruction pages |
| show_completion | boolean | true | Append the results screen |
| instruction_texts | string[] | instruction_pages | Instruction page HTML |
| texts | object | trial_text | Text object for prompts, buttons and the results screen |

### timelineUnits

- **createPracticeTimeline(jsPsych, options)** - Creates a short practice version (5 trials with feedback, plus a results screen)
- **createMultiLevelNBackTimeline(jsPsych, options)** - Creates a timeline with multiple n-back levels and one results screen at the end
- **createInstructions(instruction_pages, texts)** - Creates the instruction pages trial
- **createCompletionTrial(jsPsych, texts)** - Creates the results screen

### utils

- **scoring.calculateScores(data)** - Accuracy, hit and false-alarm rates, RTs and d' from a DataCollection
- **scoring.getSummary(data)** - The same, plus task name and version
- **constants** - `TASK_NAME` and `VERSION`
- **text** - The default text object
- **presetConfigurations** - Pre-configured timelines (easy, medium, hard, research)
- **generateNBackSequence(total_trials, n_back, target_percentage, rows, cols)** - Generate stimulus sequences
- **createGridHTML(options)** - Render a static grid as an HTML string

## Author / Citation

**Author:** Abdullah Hunter Farhat  
**Also known as:** A. Hunter Farhat  
**ORCID:** [0009-0008-7042-469X](https://orcid.org/0009-0008-7042-469X)  
**GitHub:** [@farhat60](https://github.com/farhat60)