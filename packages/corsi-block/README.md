# Corsi Block Task

A comprehensive implementation of the Corsi Block Tapping Task for jsPsych.

## Overview

This timeline implements the classic Corsi Block Tapping Task, a widely used measure of visuospatial working memory. The task presents a sequence of blocks that light up one at a time, and participants must reproduce the sequence by clicking the blocks in the correct order.

The timeline includes adaptive difficulty: sequences start at a given length and increase as the participant succeeds. The task ends when the participant fails according to the configured stop rule (e.g., failing both trials at a given length).

## Installation

```bash
npm install @jspsych-timelines/corsi-block
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://unpkg.com/jspsych@8"></script>
  <script src="https://unpkg.com/@jspsych-timelines/corsi-block"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych@8/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych();
  const task = jsPsychTimelineCorsiBlock.createTimeline(jsPsych);
  jsPsych.run([task]);
</script>
</html>
```

### Custom Configuration

```javascript
const timeline = createTimeline(jsPsych, {
  // Temporal parameters
  stimulus_duration: 750,              // How long each block lights up
  inter_stimulus_interval: 1000,       // Pause between blocks
  pre_stim_duration: 500,              // Blocks shown before the sequence starts
  post_sequence_delay: 500,            // Blank pause before the response screen
  inter_trial_delay: 1500,             // Blank pause between trials

  // Visual parameters
  block_colors: {
    inactive: '#0066cc',               // Blue
    active: '#ffcc00',                 // Yellow
    correct: '#00ff00',                // Green feedback
    incorrect: '#ff0000'               // Red feedback
  },
  background_color: '#1a1a1a',         // Block display background (null = inherit)
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
| `pre_stim_duration` | number | 500 | How long the blocks are shown before the sequence starts (ms) |
| `post_sequence_delay` | number | 500 | Blank pause between the sequence ending and the response screen (ms) |
| `inter_trial_delay` | number | 1500 | Blank pause between trials (ms) |

### Visual Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `block_colors.inactive` | string | '#0066cc' | Color of inactive blocks |
| `block_colors.active` | string | '#ffcc00' | Color when block is highlighted |
| `block_colors.correct` | string | '#00ff00' | Color for correct feedback |
| `block_colors.incorrect` | string | '#ff0000' | Color for incorrect feedback |
| `background_color` | string \| null | null | Background colour of the block display area; `null` inherits the page background |
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
| `sequence_generation` | 'fixed' \| 'random' | 'fixed' | Use fixed sequences or random (see below) |
| `allow_repeats` | boolean | false | Allow same block twice in a row |

#### Fixed sequences

With the default `sequence_generation: 'fixed'`, every sequence comes from a
standard table, so two runs of the same configuration present identical
sequences. The table holds **2 sequences per length for lengths 2-9**, indexing
the default 9-block layout.

A configuration the table cannot cover throws at `createTimeline` rather than
quietly substituting random sequences. Use `sequence_generation: 'random'` if
you need any of the following:

- more than 2 `trials_per_length`
- a `starting_length` below 2 or a `max_length` above 9
- a custom `blocks` layout with fewer than 9 blocks

### Other Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `blocks` | BlockPosition[] | Default 9-block layout | Custom block positions |
| `max_practice_attempts` | number \| null | null | Attempts allowed at the instruction practice before the task continues anyway; `null` repeats until passed |
| `text` | Partial<TextConfig> | English defaults | Custom text for internationalization |
| `data_labels` | object | {} | Custom fields added to every trial the timeline records (see below) |

#### Reserved data fields

`data_labels` cannot supply `task`, `task_version`, `phase`, `part`,
`sequence_length` or `trial_in_length`. The timeline always writes those itself,
and TypeScript rejects them.

They are reserved because the adaptive stop rules and the scoring functions
query the recorded data by `task`, `phase` and `part`. Replacing one would not
just relabel a row — it would make those queries match nothing, ending the task
after the first sequence length and reporting a span with no trials behind it.

## Data

The timeline records the following data for each trial:

- `task`: 'corsi-block'
- `phase`: 'display' or 'input'
- `sequence_length`: Length of the sequence
- `trial_in_length`: Index of the trial within the current length (0-based)
  Not `trial_index`, which is written by jsPsych already under that name
- `sequence`: Array of block indices shown
- `response`: Array of block indices clicked (input trials only)
- `correct`: Whether response was correct (input trials only)
- `rt`: Array of response times (input trials only)

Practice trials (`phase: 'practice'`) additionally record:

- `practice_attempt`: Which attempt at the instruction practice this was (1-based)

Whether the participant ever passed the practice is derivable: a `phase: 'practice'` 
row with `correct: true`. By default the practice repeats until
that happens. If you set `max_practice_attempts`, a participant can reach the
task without ever passing, so check this before analysing.

At the end of the task, a single empty `phase: 'scoring'` trial records the result:

- `corsi_span`: The longest sequence length reproduced correctly, or `null` if
  no length was passed. 

## Scoring

```javascript
import { utils } from '@jspsych-timelines/corsi-block';

const scores = utils.scoring.getSummary(jsPsych.data.get());
console.log(scores);
// {
//   span: 5,              // Corsi span achieved
//   totalTrials: 8,       // Total input trials
//   correctTrials: 6,     // Correct trials
//   accuracy: 0.75,       // Proportion correct
//   maxLengthAttempted: 6,
//   taskName: 'corsi-block',
//   version: '0.1.0'
// }
```

## Accessing Results

```javascript
// Get the final Corsi span
const span = utils.scoring.getSummary(jsPsych.data.get()).span;

// ...or read the scoring row directly
const scoringRow = jsPsych.data.get().filter({ task: 'corsi-block', phase: 'scoring' });
const spanFromData = scoringRow.values()[0].corsi_span;

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
