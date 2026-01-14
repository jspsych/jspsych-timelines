# Corsi Block Task

A comprehensive implementation of the Corsi Block Tapping Task for jsPsych.

## Overview

This timeline implements the classic Corsi Block Tapping Task, a widely used measure of visuospatial working memory. The task presents a sequence of blocks that light up one at a time, and participants must reproduce the sequence by clicking the blocks in the correct order.

The timeline includes adaptive difficulty: sequences start at a given length and increase as the participant succeeds. The task ends when the participant fails according to the configured stop rule (e.g., failing both trials at a given length).

## Installation

```bash
npm install @jspsych-timelines/corsi-block
```

## Usage

### Basic Example

```javascript
import { initJsPsych } from 'jspsych';
import { createTimeline } from '@jspsych-timelines/corsi-block';

const jsPsych = initJsPsych();

const timeline = createTimeline(jsPsych);

jsPsych.run(timeline.timeline);
```

### Custom Configuration

```javascript
const timeline = createTimeline(jsPsych, {
  // Temporal parameters
  stimulus_duration: 750,              // How long each block lights up
  inter_stimulus_interval: 1000,       // Pause between blocks
  post_sequence_delay: 500,            // Delay before response enabled
  inter_trial_delay: 1500,             // Pause between trials
  response_timeout: 60000,             // Max time for response (ms)

  // Visual parameters
  block_colors: {
    inactive: '#0066cc',               // Blue
    active: '#ffcc00',                 // Yellow
    correct: '#00ff00',                // Green feedback
    incorrect: '#ff0000'               // Red feedback
  },
  background_color: '#000000',         // Black background
  display_width: '500px',
  display_height: '500px',
  block_size: 15,                      // Percentage of display

  // Algorithm parameters
  starting_length: 2,                  // Starting sequence length
  trials_per_length: 2,                // Trials at each length
  max_length: 9,                       // Maximum sequence length
  stop_rule: 'both-trials',            // 'both-trials' or 'consecutive-errors'
  sequence_generation: 'fixed',        // 'fixed' or 'random'
  allow_repeats: false                 // Allow same block twice in row
});
```

## Configuration Parameters

### Temporal Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `stimulus_duration` | number | 1000 | Duration each block remains highlighted (ms) |
| `inter_stimulus_interval` | number | 1000 | Pause between blocks in sequence (ms) |
| `post_sequence_delay` | number | 500 | Delay after sequence before response enabled (ms) |
| `inter_trial_delay` | number | 1500 | Pause between trials (ms) |
| `response_timeout` | number \| null | null | Maximum time for response (ms), null = no limit |

### Visual Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `block_colors.inactive` | string | '#0066cc' | Color of inactive blocks |
| `block_colors.active` | string | '#ffcc00' | Color when block is highlighted |
| `block_colors.correct` | string | '#00ff00' | Color for correct feedback |
| `block_colors.incorrect` | string | '#ff0000' | Color for incorrect feedback |
| `background_color` | string | '#000000' | Background color |
| `display_width` | string | '400px' | Width of display area |
| `display_height` | string | '400px' | Height of display area |
| `block_size` | number | 12 | Size of blocks as % of display |
| `click_feedback_duration` | number | 200 | Duration of click feedback flash (ms) |

### Algorithm Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `starting_length` | number | 2 | Starting sequence length |
| `trials_per_length` | number | 2 | Number of trials at each length |
| `max_length` | number | 9 | Maximum sequence length |
| `stop_rule` | 'both-trials' \| 'consecutive-errors' | 'both-trials' | When to stop the task |
| `consecutive_errors_threshold` | number | 3 | Errors needed for consecutive-errors rule |
| `sequence_generation` | 'fixed' \| 'random' | 'fixed' | Use fixed sequences or random |
| `allow_repeats` | boolean | false | Allow same block twice in a row |

### Other Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `blocks` | BlockPosition[] | Default 9-block layout | Custom block positions |
| `input_modality` | 'touchscreen' \| 'mouse' | 'touchscreen' | Input method (cosmetic) |
| `sequence_initiation` | 'auto' \| 'button' | 'auto' | Start automatically or with button |
| `text_object` | Partial<TrialText> | English defaults | Custom text for internationalization |
| `data_labels` | object | {} | Custom data labels for all trials |

## Data

The timeline records the following data for each trial:

- `task`: 'corsi-block'
- `phase`: 'display' or 'input'
- `sequence_length`: Length of the sequence
- `trial_index`: Index of trial at current length
- `sequence`: Array of block indices shown
- `response`: Array of block indices clicked (input trials only)
- `correct`: Whether response was correct (input trials only)
- `rt`: Array of response times (input trials only)

At the end of the task, the calculated span is added to the data:

- `corsi_span`: The highest sequence length successfully completed

## Accessing Results

```javascript
// Get the final Corsi span
const data = jsPsych.data.get();
const span = data.values()[0].corsi_span;

// Get all trial data
const allTrials = jsPsych.data.get().filter({ task: 'corsi-block' });

// Get only input trials
const inputTrials = jsPsych.data.get().filter({
  task: 'corsi-block',
  phase: 'input'
});
```

## Common Configurations

This implementation supports flexible parameterization. Commonly reported parameters in the literature include:

- **Timing**: 1000ms stimulus, 1000ms ISI, 500ms delays
- **Colors**: Blue/Yellow for high contrast
- **Algorithm**: Start at 2, 2 trials per length, stop when both trials fail
- **Sequences**: Fixed pseudorandom sequences to ensure consistent difficulty

## License

MIT
