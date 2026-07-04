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
const timeline = createTimeline({
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
const practiceTimeline = createPracticeTimeline({
  n_back: 1,
  include_instructions: true
});

jsPsych.run(practiceTimeline);
```

### Using Presets

```javascript
import { presetConfigurations } from '@jspsych-timelines/spatial-nback';

// Easy configuration (1-back, 20 trials, feedback enabled)
const easyTask = presetConfigurations.easy();

// Research configuration (multi-level 1-3 back, 50 trials each)
const researchTask = presetConfigurations.research();
```

## Documentation

### createTimeline

#### createTimeline(options) ⇒ <code>timeline</code>
Creates a spatial n-back timeline with the specified parameters.

**Key Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| n_back | number | 1 | The n-back level (trials to remember back) |
| total_trials | number | 20 | Total number of trials |
| target_percentage | number | 40 | Percentage of trials that are targets |
| rows | number | 3 | Grid rows |
| cols | number | 3 | Grid columns |
| include_instructions | boolean | false | Include instruction pages |
| show_feedback_text | boolean | false | Show correctness feedback |

### timelineUnits

- **createPracticeTimeline(options)** - Creates a short practice version (6 trials, feedback enabled)
- **createMultiLevelNBackTimeline(options)** - Creates timeline with multiple n-back levels

### utils

- **presetConfigurations** - Pre-configured timelines (easy, medium, hard, research)
- **generateNBackSequence()** - Generate stimulus sequences
- **createInstructions()** - Create instruction pages with optional TTS

## Author / Citation

**Author:** Abdullah Hunter Farhat  
**Also known as:** A. Hunter Farhat  
**ORCID:** [0009-0008-7042-469X](https://orcid.org/0009-0008-7042-469X)  
**GitHub:** [@farhat60](https://github.com/farhat60)

### How to Cite

If you use this timeline in academic work, please cite it as:

**APA Style:**
```
Farhat, A. H. (2024). @jspsych-timelines/spatial-nback: A deployable spatial grid n-back timeline for jsPsych (Version 0.0.2) [Software]. GitHub. https://github.com/jspsych/jspsych-timelines/tree/main/packages/spatial-nback
```

**BibTeX:**
```bibtex
@software{farhat2024spatial,
  author = {Farhat, Abdullah Hunter},
  title = {{@jspsych-timelines/spatial-nback: A deployable spatial grid n-back timeline for jsPsych}},
  url = {https://github.com/jspsych/jspsych-timelines/tree/main/packages/spatial-nback},
  version = {0.0.2},
  year = {2024}
}
```

Citations help demonstrate that this software is used and valued, which supports continued development and maintenance.