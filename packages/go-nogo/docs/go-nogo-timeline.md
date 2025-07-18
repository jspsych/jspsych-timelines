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

- Interactive step-by-step instructions with practice trials
- Support for text, image, or mixed stimulus types
- Multi-block structure with break pages between blocks
- Comprehensive trial-by-trial data collection
- Automatic performance calculations (accuracy, reaction time)
- Configurable timing and stimulus parameters

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
    on_finish: () => jsPsych.data.displayData('json')
  });

  const config = {
    goStimulus: 'GO',
    noGoStimulus: 'NO-GO',
    numBlocks: 3,
    trialsPerBlock: 50
  };

  const timeline = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);
  jsPsych.run([timeline]);
</script>
</html>
```

## API Reference

### createTimeline(jsPsych, config)

Creates a complete Go/No-Go task timeline.

**Parameters:**
- `jsPsych` (JsPsych): The jsPsych instance
- `config` (GoNoGoConfig, optional): Configuration options

**Returns:** Timeline object for use with `jsPsych.run()`

### timelineUnits

Access individual components for custom timeline construction:

```javascript
const { instructionTrial, goNoGoTrial, debriefTrial } = jsPsychTimelineGoNogoTimeline.timelineUnits;

// Get instruction trials
const instructions = instructionTrial(jsPsych, config);

// Get trial components
const { trial, interTrialInterval, generateTrialsForBlock } = goNoGoTrial(jsPsych, config);

// Get debrief trial
const debrief = debriefTrial(jsPsych, config);
```

### utils

Utility functions for data analysis:

```javascript
const { calculateAccuracy, calculateMeanRT } = jsPsychTimelineGoNogoTimeline.utils;

const goNoGoData = jsPsych.data.filter({trial_type: 'go-no-go'});
const accuracy = calculateAccuracy(goNoGoData);
const meanRT = calculateMeanRT(goNoGoData);
```

## Configuration Options

### GoNoGoConfig Interface

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `goStimulus` | string | `'GO'` | GO stimulus (text or image path) |
| `noGoStimulus` | string | `'NO-GO'` | NO-GO stimulus (text or image path) |
| `buttonText` | string | `'Click'` | Response button label |
| `stimulusType` | `'text' \| 'image' \| 'mixed'` | `'mixed'` | Stimulus type (auto-detect if mixed) |
| `imageWidth` | number | `200` | Image width in pixels |
| `imageHeight` | number | `200` | Image height in pixels |
| `responseTimeout` | number | `1500` | Maximum response time (ms) |
| `interTrialInterval` | number | `500` | Time between trials (ms) |
| `numBlocks` | number | `3` | Number of blocks |
| `trialsPerBlock` | number | `50` | Trials per block |
| `goTrialProbability` | number | `0.75` | Probability of GO trials (0-1) |
| `showResultsDetails` | boolean | `true` | Show detailed results in debrief |

### Stimulus Types

**Text Stimuli:**
```javascript
const config = {
  goStimulus: 'GO',
  noGoStimulus: 'STOP',
  stimulusType: 'text'
};
```

**Image Stimuli:**
```javascript
const config = {
  goStimulus: 'images/arrow.png',
  noGoStimulus: 'images/stop.png',
  stimulusType: 'image'
};
```

**Mixed Stimuli (auto-detect):**
```javascript
const config = {
  goStimulus: 'GO',                    // Text
  noGoStimulus: 'images/stop.png',     // Image
  stimulusType: 'mixed'                // Auto-detect based on file extension
};
```

## Data Generated

### Trial Data Properties

| Property | Type | Description |
|----------|------|-------------|
| `trial_type` | string | Type of trial (`'go-no-go'`, `'instructions'`, `'debrief'`, etc.) |
| `stimulus_type` | string | `'go'` or `'no-go'` for main trials |
| `response` | number \| null | Button pressed (0) or no response (null) |
| `rt` | number \| null | Reaction time in milliseconds |
| `correct` | boolean | Whether response was correct |
| `accuracy` | number | 1 if correct, 0 if incorrect |
| `reaction_time` | number \| null | RT for GO trials only (null for NO-GO) |
| `correct_response` | number \| null | Expected response (0 for GO, null for NO-GO) |
| `block` | number | Block number (1-indexed) |

### Trial Types

| Trial Type | Description |
|------------|-------------|
| `'instructions'` | Instruction and practice trials |
| `'go-no-go'` | Main experimental trials |
| `'block-break'` | Block completion and break screens |
| `'debrief'` | Final results screen |

### Data Analysis

```javascript
// Get all Go/No-Go trial data
const goNoGoData = jsPsych.data.filter({trial_type: 'go-no-go'});

// Calculate performance metrics
const accuracy = goNoGoData.select('accuracy').mean();
const meanRT = goNoGoData.filter({stimulus_type: 'go', correct: true}).select('rt').mean();
const commissionErrors = goNoGoData.filter({stimulus_type: 'no-go', response: 0}).count();
const omissionErrors = goNoGoData.filter({stimulus_type: 'go', response: null}).count();

console.log('Performance:', {
  accuracy: Math.round(accuracy * 100) + '%',
  meanRT: Math.round(meanRT) + 'ms',
  commissionErrors,
  omissionErrors
});
```

## Examples

### Basic Text Task

```javascript
const config = {
  goStimulus: 'GO',
  noGoStimulus: 'STOP',
  numBlocks: 2,
  trialsPerBlock: 30
};

const timeline = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);
```

### Image Task

```javascript
const config = {
  goStimulus: 'images/green-arrow.png',
  noGoStimulus: 'images/red-stop.png',
  stimulusType: 'image',
  imageWidth: 150,
  imageHeight: 150
};

const timeline = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);
```

### Fast-Paced Task

```javascript
const config = {
  responseTimeout: 1000,     // Faster responses required
  interTrialInterval: 300,   // Shorter intervals
  goTrialProbability: 0.8,   // More GO trials
  trialsPerBlock: 40
};

const timeline = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);
```

### Custom Timeline Structure

```javascript
// Create individual components
const { instructionTrial, goNoGoTrial, debriefTrial } = jsPsychTimelineGoNogoTimeline.timelineUnits;

const instructions = instructionTrial(jsPsych, config);
const { trial, interTrialInterval, generateTrialsForBlock } = goNoGoTrial(jsPsych, config);
const debrief = debriefTrial(jsPsych, config);

// Custom timeline with single block
const customTimeline = {
  timeline: [
    ...instructions,
    {
      timeline: [trial, interTrialInterval],
      timeline_variables: generateTrialsForBlock(1),
      randomize_order: true
    },
    debrief
  ]
};

jsPsych.run([customTimeline]);
```

### Data Collection

```javascript
const jsPsych = initJsPsych({
  on_trial_finish: (data) => {
    // Log each Go/No-Go trial
    if (data.trial_type === 'go-no-go') {
      console.log(`Trial: ${data.stimulus_type}, Correct: ${data.correct}, RT: ${data.rt}`);
    }
  },
  on_finish: () => {
    // Save or display final data
    const data = jsPsych.data.get().json();
    // Send to server or process locally
  }
});
```

## Best Practices

### Stimulus Considerations

1. **Image Files**: Use common formats (PNG, JPG, GIF) and ensure fast loading
2. **File Paths**: Use relative paths for portability
3. **Image Size**: Default 200×200px works well; adjust for your stimuli
4. **Color Coding**: GO stimuli get green borders, NO-GO get red borders automatically

### Performance Optimization

1. **Preload Images**: Use jsPsych's preload plugin for image stimuli
```javascript
const preload = {
  type: jsPsychPreload,
  images: ['images/go.png', 'images/nogo.png']
};
```


## Timeline Structure

The complete default timeline includes:

1. **Overview Instructions**: Task introduction
2. **GO Practice**: Interactive practice with GO stimuli
3. **NO-GO Practice**: Interactive practice with NO-GO stimuli  
4. **Practice Complete**: Transition to main task
5. **Block 1**: 50 trials (or configured amount)
6. **Block 1 Complete**: Break page with progress and reminders
7. **Block 2**: 50 trials
8. **Block 2 Complete**: Break page
9. **Block 3**: 50 trials
10. **Debrief**: Final results and completion

Each block includes both GO and NO-GO trials randomized according to the configured probability (default 75% GO trials).

## License

MIT License