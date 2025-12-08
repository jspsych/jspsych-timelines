# Go/No-Go Timeline

A jsPsych implementation of the Go/No-Go task for measuring response inhibition and sustained attention.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Configuration Options](#configuration-options)
- [Data Generated](#data-generated)
- [Examples](#examples)

## Overview

The Go/No-Go task measures response inhibition by requiring participants to respond quickly to "go" stimuli while withholding responses to "no-go" stimuli.

## Installation

### NPM
```bash
npm install @jspsych-timelines/go-nogo
```

### CDN
```html
<script src="https://unpkg.com/@jspsych-timelines/go-nogo"></script>
```

### Optional CSS Styling

This package includes optional CSS files for enhanced mobile-friendly styling and responsive design:

#### Option 1: NPM/Bundler
```javascript
import '@jspsych-timelines/go-nogo/styles.css';
```

#### Option 2: CDN/HTML
```html
<link rel="stylesheet" href="https://unpkg.com/@jspsych-timelines/go-nogo/dist/css/styles.css">
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/jspsych"></script>
  <script src="https://unpkg.com/@jspsych-timelines/go-nogo"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych({
    on_finish: () => jsPsych.data.displayData()
  });

  const config = {
    show_instructions: true,
    show_practice: true,
    show_debrief: true,
    num_blocks: 2,
    num_trials: 30
  };

  const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych, config);
  jsPsych.run(timeline);
</script>
</html>
```

## API Reference

### createTimeline(jsPsych, config)

Creates the complete Go/No-Go task timeline.

**Parameters:**
- `jsPsych` (JsPsych): The jsPsych instance
- `config` (GoNoGoConfig, optional): Configuration options

**Returns:** Timeline object ready for `jsPsych.run()`

### createInstructions(instructions?, texts?)

Creates standalone instruction pages.

**Parameters:**
- `instructions` (string[], optional): Custom instruction pages 
- `texts` (object, optional): Custom text configuration

**Returns:** Instructions trial object

### timelineUnits

Access individual components:

```javascript
const { createPractice, createDebrief } = jsPsychTimelineGoNoGo.timelineUnits;

// Custom practice trials
const practice = createPractice({ go_practice_timeout: 15000 });

// Custom debrief
const debrief = createDebrief(jsPsych);
```

### utils

Utility functions:

```javascript
const { createStimulusHTML } = jsPsychTimelineGoNoGo.utils;

// Format stimulus HTML
const goHtml = createStimulusHTML('GO', true);
const nogoHtml = createStimulusHTML('STOP', false);
```

## Configuration Options

### GoNoGoConfig Interface

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **General Configuration** |
| `show_instructions` | boolean | `false` | Include instruction pages |
| `show_practice` | boolean | `false` | Include practice trials |  
| `show_debrief` | boolean | `false` | Show results summary |
| `num_blocks` | number | `3` | Number of experimental blocks |
| `num_trials` | number | `50` | Trials per block |
| `trial_timeout` | number | `500` | Maximum response time (ms) |
| `isi_timeout` | number | `500` | Inter-stimulus interval (ms) |
| `probability` | number | `0.75` | Probability of GO trials (0-1) |
| **Stimulus Configuration** |
| `go_stimulus` | HTML_STRING | `square` | Single GO stimulus |
| `nogo_stimulus` | HTML_STRING | `circle` | Single NO-GO stimulus |
| `go_stimuli` | HTML_STRING[] | - | Array of GO stimuli (rotates through) |
| `nogo_stimuli` | HTML_STRING[] | - | Array of NO-GO stimuli (rotates through) |
| `go_practice_timeout` | number | `10000` | GO practice timeout (ms) |
| `nogo_practice_timeout` | number | `3000` | NO-GO practice timeout (ms) |
| **Text Configuration** |
| `text_object` | object | trial_text | Custom text/UI strings |

## Data Generated

### Trial Data Properties

| Property | Type | Description |
|----------|------|-------------|
| `task` | string | Always `'go-nogo'` |
| `phase` | string | `'instructions'`, `'practice'`, `'main-trial'`, `'debrief'`, etc. |
| `is_go_trial` | boolean | `true` for GO trials, `false` for NO-GO trials |
| `response` | number \| `null` | Button pressed (0) or no response (`null`) |
| `rt` | number \| `null` | Reaction time in milliseconds |
| `correct` | boolean | Whether response was correct |
| `block_number` | number | Block number (1-indexed) |
| `page` | string | `'go'`, `'nogo'`, `'isi'`, etc. |

## Examples

### Minimal Setup
```javascript
const jsPsych = initJsPsych();
const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych);
jsPsych.run(timeline);
```

### Complete Task with Practice
```javascript
const config = {
  show_instructions: true,
  show_practice: true,
  show_debrief: true,
  num_blocks: 2,
  num_trials: 40,
  probability: 0.8
};

const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych, config);
jsPsych.run(timeline);
```

### Custom Stimuli and Timing
```javascript
const config = {
  go_stimulus: '<span style="color: green; font-size: 60px;">✓</span>',
  nogo_stimulus: '<span style="color: red; font-size: 60px;">✗</span>',
  trial_timeout: 1000,
  isi_timeout: 300,
};

const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych, config);
jsPsych.run(timeline);
```

### Modular Timeline Construction
```javascript
const instructions = jsPsychTimelineGoNoGo.createInstructions();
const practice = jsPsychTimelineGoNoGo.timelineUnits.createPractice({
  go_practice_timeout: 15000,
  nogo_practice_timeout: 5000
});

const mainTask = jsPsychTimelineGoNoGo.createTimeline(jsPsych, {
  show_instructions: false,  // Already included above
  show_practice: false,      // Already included above
  show_debrief: true
});

jsPsych.run([instructions, ...practice, mainTask]);
```

### Data Collection and Analysis
```javascript
const jsPsych = initJsPsych({
  on_finish: () => {
    const data = jsPsych.data.filter({ task: 'go-nogo', phase: 'main-trial' });
    
    const results = {
      accuracy: Math.round(data.select('correct').mean() * 100),
      meanRT: Math.round(data.filter({ is_go_trial: true, response: 0 }).select('rt').mean()),
      commissionErrors: data.filter({ is_go_trial: false, response: 0 }).count(),
      omissionErrors: data.filter({ is_go_trial: true, response: null }).count()
    };
    
    console.log('Go/No-Go Results:', results);
  }
});
```

## Authors

Caroline Griem, A. Hunter Farhat

## License

MIT License