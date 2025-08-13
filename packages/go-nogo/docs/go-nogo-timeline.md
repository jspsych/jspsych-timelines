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
- [Best Practices](#best-practices)

## Overview

The Go/No-Go task measures response inhibition by requiring participants to respond quickly to "go" stimuli while withholding responses to "no-go" stimuli.

### Features

- Interactive practice trials with automatic retry logic
- Support for single stimuli or arrays of stimuli (cycled in sequence)
- Multi-block structure with break pages
- Comprehensive data collection and automatic performance calculation
- Configurable timing, stimulus, and text parameters
- Built-in debrief screen with accuracy and reaction time summaries

## Installation

### NPM
```bash
npm install @jspsych-timelines/go-nogo
```

### CDN
```html
<script src="https://unpkg.com/@jspsych-timelines/go-nogo"></script>
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

  const timeline = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);
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
const { createPractice, createDebrief } = jsPsychTimelineGoNogoTimeline.timelineUnits;

// Custom practice trials
const practice = createPractice({ go_practice_timeout: 15000 });

// Custom debrief
const debrief = createDebrief(jsPsych);
```

### utils

Utility functions:

```javascript
const { createStimulusHTML } = jsPsychTimelineGoNogoTimeline.utils;

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
| `go_stimulus` | string | `'Y'` | Single GO stimulus |
| `nogo_stimulus` | string | `'X'` | Single NO-GO stimulus |
| `go_stimuli` | string[] | - | Array of GO stimuli (rotates through) |
| `nogo_stimuli` | string[] | - | Array of NO-GO stimuli (rotates through) |
| `button_text` | string | `'Click'` | Response button label |
| `go_practice_timeout` | number | `10000` | GO practice timeout (ms) |
| `nogo_practice_timeout` | number | `3000` | NO-GO practice timeout (ms) |
| **Text Configuration** |
| `instructions_array` | string[] | default | Custom instruction pages |
| `text_object` | object | trial_text | Custom text/UI strings |

### Stimulus Configuration

All stimuli accept HTML strings for maximum flexibility:

**Text Stimuli:**
```javascript
const config = {
  go_stimulus: 'GO',
  nogo_stimulus: 'STOP'
};
```

**HTML Stimuli:**
```javascript
const config = {
  go_stimulus: '<div style="color: green; font-size: 48px;">→</div>',
  nogo_stimulus: '<div style="color: red; font-size: 48px;">✋</div>'
};
```

**Image Stimuli:**
```javascript
const config = {
  go_stimulus: '<img src="images/go-arrow.png" style="width: 200px;">',
  nogo_stimulus: '<img src="images/stop-sign.png" style="width: 200px;">'
};
```

**Multiple Stimuli (Sequential Cycling):**
```javascript
const config = {
  go_stimuli: ['GO', 'PRESS', '→'],      // Cycles: GO, PRESS, →, GO, PRESS, →...
  nogo_stimuli: ['STOP', 'NO-GO', '✋']  // Cycles: STOP, NO-GO, ✋, STOP, NO-GO, ✋...
};
```

## Data Generated

### Trial Data Properties

| Property | Type | Description |
|----------|------|-------------|
| `task` | string | Always `'go-nogo'` |
| `phase` | string | `'instructions'`, `'practice'`, `'main-trial'`, `'debrief'`, etc. |
| `is_go_trial` | boolean | `true` for GO trials, `false` for NO-GO trials |
| `response` | number \| null | Button pressed (0) or no response (null) |
| `rt` | number \| null | Reaction time in milliseconds |
| `correct` | boolean | Whether response was correct |
| `block_number` | number | Block number (1-indexed) |
| `page` | string | `'go'`, `'nogo'`, `'isi'`, etc. |

### Correct Response Logic

- **GO trials**: Correct if `response === 0` (button pressed)
- **NO-GO trials**: Correct if `response === null` (no button press)

### Data Filtering Examples

```javascript
// Get all main experimental trials
const mainTrials = jsPsych.data.filter({ task: 'go-nogo', phase: 'main-trial' });

// Calculate accuracy
const accuracy = mainTrials.select('correct').mean();

// Get GO trials with responses
const goTrialsWithResponse = mainTrials.filter({ is_go_trial: true, response: 0 });
const meanGoRT = goTrialsWithResponse.select('rt').mean();

// Count errors
const commissionErrors = mainTrials.filter({ is_go_trial: false, response: 0 }).count();
const omissionErrors = mainTrials.filter({ is_go_trial: true, response: null }).count();
```

## Examples

### Minimal Setup
```javascript
const jsPsych = initJsPsych();
const timeline = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych);
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

const timeline = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);
jsPsych.run(timeline);
```

### Custom Stimuli and Timing
```javascript
const config = {
  go_stimulus: '<div style="color: green; font-size: 60px;">✓</div>',
  nogo_stimulus: '<div style="color: red; font-size: 60px;">✗</div>',
  trial_timeout: 1000,
  isi_timeout: 300,
  button_text: 'PRESS'
};

const timeline = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);
jsPsych.run(timeline);
```

### Modular Timeline Construction
```javascript
const instructions = jsPsychTimelineGoNogoTimeline.createInstructions();
const practice = jsPsychTimelineGoNogoTimeline.timelineUnits.createPractice({
  go_practice_timeout: 15000,
  nogo_practice_timeout: 5000
});

const mainTask = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, {
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

## Best Practices

### Stimulus Design
1. **Keep stimuli simple and easily distinguishable**
2. **Use consistent sizing** (200x200px works well for images)
3. **Test stimulus visibility** across different devices/screens
4. **Preload images** if using image stimuli

### Timing Considerations
1. **Standard timing**: 500-1000ms response window
2. **ISI**: 300-1000ms between trials
3. **Practice timing**: Longer timeouts (10s GO, 3s NO-GO) for learning

### Performance Optimization
```javascript
// Preload images before starting
const preload = {
  type: jsPsychPreload,
  images: ['images/go.png', 'images/nogo.png']
};

jsPsych.run([preload, timeline]);
```

### Error Handling
```javascript
// Validate probability input
const config = {
  probability: Math.max(0, Math.min(1, userInput)) // Clamp to 0-1
};
```

## Timeline Structure

The complete timeline when all options are enabled:

1. **Instructions**: Basic task explanation
2. **GO Practice**: Interactive GO stimulus practice with retry logic  
3. **NO-GO Practice**: Interactive NO-GO stimulus practice with retry logic
4. **Practice Complete**: Transition screen
5. **Block 1**: Main experimental trials
6. **Block Break** (if multiple blocks)
7. **Block 2**: Main experimental trials  
8. **Debrief**: Results summary with accuracy and mean RT

Each block contains randomized GO/NO-GO trials according to the specified probability, with stimuli cycling through arrays if provided.

## Authors

Caroline Griem, A. Hunter Farhat

## License

MIT License