# Spatial N-Back Timeline

A deployable spatial grid n-back timeline for jsPsych. This module provides a flexible implementation of the spatial n-back task, supporting custom grid sizes, n-back levels, feedback, and more.

## Overview

The spatial n-back task is a working memory assessment where participants view a sequence of stimuli appearing in different positions on a grid. The task requires participants to identify when the current stimulus position matches the position from n trials ago. This implementation provides a complete, customizable timeline that can be easily integrated into jsPsych experiments.

## Installation

### Via npm
```bash
npm install @jspsych-timelines/spatial-nback
```

### Via CDN
```html
<script src="https://unpkg.com/@jspsych-timelines/spatial-nback"></script>
```

## Basic Usage

### Simple Implementation
```javascript
import { initJsPsych } from 'jspsych';
import { createTimeline } from '@jspsych-timelines/spatial-nback';

const jsPsych = initJsPsych({
  on_finish: function() {
    jsPsych.data.displayData();
  }
});

const timeline = createTimeline({
  n_back: 2,
  total_trials: 30,
  target_percentage: 40,
  include_instructions: true
});

jsPsych.run(timeline);
```

### With Custom Configuration
```javascript
const customTimeline = createTimeline({
  rows: 4,
  cols: 4,
  n_back: 3,
  total_trials: 50,
  target_percentage: 30,
  stimulus_duration: 500,
  isi_duration: 1000,
  show_feedback_text: true,
  show_feedback_border: true,
  cell_size: 120,
  stimulus_color: "#FF5722",
  include_instructions: true
});
```

### With Custom Text Object
```javascript
const customTexts = {
  prompt: "Press YES if the position matches {n_back} steps back (trial {trial}/{total})",
  button: ["YES", "NO"],
  correct: "Great job!",
  incorrect: "Try again!",
  next_button: "Continue",
  back_button: "Previous"
};

const timelineWithCustomTexts = createTimeline({
  n_back: 2,
  total_trials: 20,
  texts: customTexts,
  include_instructions: true
});
```

## Parameters

### Core Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **rows** | number | 3 | Number of rows in the grid |
| **cols** | number | 3 | Number of columns in the grid |
| **n_back** | number | 1 | The n-back level (how many trials back to match) |
| **total_trials** | number | 20 | Total number of trials in the timeline |
| **target_percentage** | number | 40 | Percentage of trials that should be targets |

### Timing Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **stimulus_duration** | number | 750 | Duration (ms) the stimulus is displayed |
| **isi_duration** | number | 500 | Inter-stimulus interval (ms) between trials |
| **feedback_duration** | number | 0 | Duration (ms) of feedback display when enabled |

### Visual Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **cell_size** | number | null | Size (px) of each grid cell (null = responsive) |
| **stimulus_color** | string | "#2196F3" | Color of the stimulus square |
| **correct_color** | string | "#4CAF50" | Color for correct feedback |
| **incorrect_color** | string | "#F44336" | Color for incorrect feedback |

### Feedback Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **show_feedback_text** | boolean | false | Whether to show text feedback after each trial |
| **show_feedback_border** | boolean | false | Whether to highlight the grid border for feedback |

### Text & Instructions

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **prompt** | string | "Click the MATCH button..." | Instructions template for each trial |
| **buttons** | string[] | ["O", "X"] | Array of button text strings. First button is "match", second is "no match" |
| **include_instructions** | boolean | false | Whether to include instruction pages at the start |
| **instruction_texts** | string[] | See text.ts | Custom instruction pages |
| **texts** | object | trial_text | Custom text object containing prompt, buttons, and other text elements |

## Data Generated

In addition to the default data collected by jsPsych, this timeline records the following data for each trial:

| Name | Type | Value |
|------|------|-------|
| **trial_number** | number | The trial index (1-based) |
| **n_back** | number | The n-back level for the timeline |
| **total_trials** | number | Total number of trials in the timeline |
| **task** | string | "spatial-nback" |
| **phase** | string | "trial" or "instructions" |
| **response** | string/number | Participant's response (if applicable) |
| **rt** | number | Response time in milliseconds |

## Functions

### createTimeline(params)
Creates a spatial n-back timeline with the specified parameters.

**Parameters:**
- `params` (object): Configuration object with parameters described above

**Returns:** A jsPsych timeline object

### createPracticeTimeline(params)
Creates a short practice timeline optimized for learning the task.

**Default Configuration:**
- 6 trials total
- 50% target percentage
- Feedback enabled (text and border)
- Instructions disabled by default

**Parameters:**
- `params` (object): Same as createTimeline, overrides practice defaults

**Returns:** A jsPsych timeline object

### createMultiLevelNBackTimeline(params)
Creates a timeline with multiple n-back levels for progressive difficulty.

**Parameters:**
- `n_backs` (number[]): Array of n-back levels (default: [1, 2])
- `trials_per_level` (number): Trials per level (default: 20)
- `randomize_levels` (boolean): Randomize level order (default: false)
- Additional parameters from createTimeline

**Returns:** A jsPsych timeline object

## Utility Functions

### presetConfigurations
Pre-configured timelines for common use cases:

```javascript
import { presetConfigurations } from '@jspsych-timelines/spatial-nback';

// Easy: 1-back, 20 trials, feedback enabled
const easy = presetConfigurations.easy();

// Medium: 2-back, 30 trials, no feedback
const medium = presetConfigurations.medium();

// Hard: 3-back, 4x4 grid, 40 trials
const hard = presetConfigurations.hard();

// Research: Multi-level 1-3 back, 50 trials each
const research = presetConfigurations.research();
```

### generateNBackSequence(total_trials, n_back, target_percentage, rows, cols)
Generates the sequence of positions and target flags for the task.

**Parameters:**
- `total_trials` (number): Total number of trials
- `n_back` (number): N-back level
- `target_percentage` (number): Percentage of target trials
- `rows` (number): Grid rows
- `cols` (number): Grid columns

**Returns:** Object with `positions` and `is_target` arrays

### createInstructions(instruction_pages)
Creates instruction pages. Takes an array of strings.

**Parameters:**
- `instruction_pages` (string[]): Array of instruction HTML strings

**Returns:** A jsPsych instructions trial object with a page for each string.

## Examples

### Basic 2-Back Task
```javascript
const timeline = createTimeline({
  n_back: 2,
  total_trials: 30,
  target_percentage: 40,
  include_instructions: true
});
```

### Research Protocol with Multiple Levels
```javascript
const timeline = createMultiLevelNBackTimeline({
  n_backs: [1, 2, 3],
  trials_per_level: 50,
  target_percentage: 40,
  show_feedback_text: false,
  randomize_levels: true
});
```

### Version with Feedback
```javascript
const timeline = createTimeline({
  n_back: 1,
  total_trials: 20,
  include_instructions: true,
  show_feedback_text: true,
  show_feedback_border: true
});
```

### High Difficulty Configuration
```javascript
const timeline = createTimeline({
  n_back: 3,
  rows: 4,
  cols: 4,
  total_trials: 60,
  target_percentage: 30,
  stimulus_duration: 500,
  isi_duration: 1500,
  cell_size: 100
});
```

## Integration with jsPsych

### Running with Other Trials
```javascript
const experiment = [
  // Welcome screen
  {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<h1>Welcome to the Spatial N-Back Task</h1>',
    choices: ['Continue']
  },
  
  // Practice trials
  createPracticeTimeline({
    show_feedback_text: true
  }),
  
  // Main task
  createTimeline({
    n_back: 2,
    total_trials: 100,
    target_percentage: 40
  }),
  
  // Debrief
  {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<h2>Task Complete!</h2><p>Thank you for participating.</p>',
    choices: ['Finish']
  }
];

jsPsych.run(experiment);
```

### Data Collection
```javascript
const jsPsych = initJsPsych({
  on_finish: function() {
    // Get all spatial n-back data
    const nbackData = jsPsych.data.get().filter({task: 'spatial-nback'});
    
    // Calculate performance metrics
    const accuracy = nbackData.filter({phase: 'trial'}).select('correct').mean();
    const rt = nbackData.filter({phase: 'trial'}).select('rt').mean();
    
    console.log(`Accuracy: ${accuracy}, Mean RT: ${rt}`);
    
    // Save data
    jsPsych.data.get().localSave('csv', 'spatial-nback-data.csv');
  }
});
```

## Troubleshooting

### Common Issues

**Grid not displaying correctly:**
- Verify CSS imports are included
- Check container dimensions
- Ensure cell_size parameter is appropriate

**Performance issues:**
- Reduce grid size for better performance (can override auto-size using cell_size)
- Decrease stimulus_duration for faster trials
- Consider disabling feedback for production use

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Basic functionality supported

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

**IEEE Style:**
```
A. H. Farhat, "@jspsych-timelines/spatial-nback: A deployable spatial grid n-back timeline for jsPsych," Version 0.0.2, GitHub, 2024. [Online]. Available: https://github.com/jspsych/jspsych-timelines/tree/main/packages/spatial-nback
```

### Why Citations Matter

Citations help demonstrate that this software is used and valued by the research community, which:
- Supports continued development and maintenance
- Helps with funding applications and career advancement
- Enables tracking of research impact
- Builds a network of researchers using similar tools

### Contributing

If you use this timeline and find it helpful, please consider:
- Citing it in your publications
- Reporting bugs or suggesting improvements
- Contributing code or documentation
- Sharing your experience with the community

---

See [src/index.ts](src/index.ts) for implementation details.
