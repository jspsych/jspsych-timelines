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
- Optional colored borders/text for visual distinction between GO/NO-GO stimuli
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

  // Create instructions and main task separately
  const instructions = jsPsychTimelineGoNogoTimeline.createInstructions(jsPsych, {});
  const practice = jsPsychTimelineGoNogoTimeline.timelineUnits.practiceTrial(jsPsych, config);
  const task = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);

  jsPsych.run([instructions, ...practice, task]);
</script>
</html>
```

## API Reference

### createTimeline(jsPsych, config)

Creates the main Go/No-Go task timeline (without instructions).

**Parameters:**
- `jsPsych` (JsPsych): The jsPsych instance
- `config` (GoNoGoConfig, optional): Configuration options

**Returns:** Timeline object containing trial blocks and debrief

**Note:** Instructions are now created separately using `createInstructions()`.

### createInstructions(jsPsych, config)

Creates the basic instruction pages for the Go/No-Go task.

**Parameters:**
- `jsPsych` (JsPsych, optional): The jsPsych instance (reserved for future use)
- `config` (object, optional): Configuration options (reserved for future use)

**Returns:** Instructions trial object with navigation-styled buttons

**Example:**
```javascript
const instructions = jsPsychTimelineGoNogoTimeline.createInstructions();
const task = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);
jsPsych.run([instructions, task]);
```

### timelineUnits

Access individual components for custom timeline construction:

```javascript
const { practiceTrial, goNoGoTrial, debriefTrial } = jsPsychTimelineGoNogoTimeline.timelineUnits;

// Get instruction trials
const instructions = practiceTrial(jsPsych, config);

// Get trial components
const { trial, interTrialInterval, generateTrialsForBlock } = goNoGoTrial(jsPsych, config);

// Get debrief trial
const debrief = debriefTrial(jsPsych, config);
```

### utils

Utility functions for data analysis:

```javascript
const { calculateAccuracy, calculateMeanRT } = jsPsychTimelineGoNogoTimeline.utils;

const goNoGoData = jsPsych.data.filter({trial_type: 'go-nogo'});
const accuracy = calculateAccuracy(goNoGoData);
const meanRT = calculateMeanRT(goNoGoData);
```

## Configuration Options

### GoNoGoConfig Interface

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `goStimulus` | string | `'Y'` | Single GO stimulus (HTML string) - for backward compatibility |
| `noGoStimulus` | string | `'X'` | Single NO-GO stimulus (HTML string) - for backward compatibility |
| `goStimuli` | string[] | `['Y']` | Array of GO stimuli (HTML strings) |
| `noGoStimuli` | string[] | `['X']` | Array of NO-GO stimuli (HTML strings) |
| `buttonText` | string | `'Click'` | Response button label |
| `colorBorders` | boolean | `false` | Apply colored borders/text to stimuli (legacy parameter) |
| `colorText` | boolean | `false` | Apply colored text/borders to stimuli |
| `responseTimeout` | number | `500` | Maximum response time (ms) |
| `interTrialInterval` | number | `500` | Time between trials (ms) |
| `numBlocks` | number | `3` | Number of blocks |
| `trialsPerBlock` | number | `50` | Trials per block |
| `goTrialProbability` | number | `0.75` | Probability of GO trials (0-1) |
| `varyStimulus` | boolean | `true` | Whether to use multiple stimuli (if available) |
| `showResultsDetails` | boolean | `true` | Show detailed results in debrief |

### Stimulus Configuration

All stimuli are treated as HTML strings, providing maximum flexibility for content and styling. You can use plain text, HTML tags, images, or complex HTML structures.

### Stimulus Types

**Text Stimuli:**
```javascript
const config = {
  goStimulus: 'GO',
  noGoStimulus: 'STOP'
};
```

**Image Stimuli (using HTML img tags):**
```javascript
const config = {
  goStimulus: '<img src="images/arrow.png" alt="GO">',
  noGoStimulus: '<img src="images/stop.png" alt="STOP">'
};
```

**Styled HTML Stimuli:**
```javascript
const config = {
  goStimulus: '<div style="font-size: 60px; color: green;">✓</div>',
  noGoStimulus: '<div style="font-size: 60px; color: red;">✗</div>'
};
```

**Complex HTML with Images and Text:**
```javascript
const config = {
  goStimulus: '<div><img src="images/arrow.png" style="width: 50px;"><br>PRESS</div>',
  noGoStimulus: '<div><img src="images/stop.png" style="width: 50px;"><br>DON\'T PRESS</div>'
};
```

### Color Behavior

**Default behavior** (`colorText: false`, `colorBorders: false`):
- **Text stimuli**: Both GO and NO-GO text appear in black
- **Image stimuli**: No colored borders are applied

When `colorText: true` or `colorBorders: true` (legacy):
- **Text stimuli**: GO text appears in green, NO-GO text appears in red
- **Image stimuli**: GO images get a green border, NO-GO images get a red border

The default behavior provides neutral stimulus presentation, while colored styling can be enabled when visual distinction is desired.

### Multiple Stimuli Support

You can provide arrays of stimuli for variety:

```javascript
const config = {
  goStimuli: ['GO', 'PRESS', '→'],
  noGoStimuli: ['STOP', 'NO-GO', '✗'],
  varyStimulus: true  // Use all stimuli in rotation
};
```

For backward compatibility, single stimulus parameters are still supported:

```javascript
const config = {
  goStimulus: 'GO',      // Will be converted to ['GO']
  noGoStimulus: 'STOP'   // Will be converted to ['STOP']
};
```

## Data Generated

### Trial Data Properties

| Property | Type | Description |
|----------|------|-------------|
| `trial_type` | string | Type of trial (`'go-nogo'`, `'instructions'`, `'debrief'`, etc.) |
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
| `'go-nogo'` | Main experimental trials |
| `'block-break'` | Block completion and break screens |
| `'debrief'` | Final results screen |

### Data Analysis

```javascript
// Get all Go/No-Go trial data
const goNoGoData = jsPsych.data.filter({trial_type: 'go-nogo'});

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

const instructions = jsPsychTimelineGoNogoTimeline.createInstructions();
const practice = jsPsychTimelineGoNogoTimeline.timelineUnits.practiceTrial(jsPsych, config);
const task = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);

jsPsych.run([instructions, ...practice, task]);
```

### Image Task

```javascript
const config = {
  goStimulus: '<img src="images/green-arrow.png" style="width: 150px; height: 150px;" alt="GO">',
  noGoStimulus: '<img src="images/red-stop.png" style="width: 150px; height: 150px;" alt="STOP">'
};

const instructions = jsPsychTimelineGoNogoTimeline.createInstructions();
const practice = jsPsychTimelineGoNogoTimeline.timelineUnits.practiceTrial(jsPsych, config);
const task = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);

jsPsych.run([instructions, ...practice, task]);
```

### Fast-Paced Task

```javascript
const config = {
  responseTimeout: 1000,     // Faster responses required
  interTrialInterval: 300,   // Shorter intervals
  goTrialProbability: 0.8,   // More GO trials
  trialsPerBlock: 40
};

const instructions = jsPsychTimelineGoNogoTimeline.createInstructions();
const practice = jsPsychTimelineGoNogoTimeline.timelineUnits.practiceTrial(jsPsych, config);
const task = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);

jsPsych.run([instructions, ...practice, task]);
```

### With Colored Styling

```javascript
// Colors are disabled by default, enable them with colorText: true
const config = {
  goStimulus: 'GO',
  noGoStimulus: 'STOP',
  colorText: true             // Enable colored text/borders
};

// For images with colored borders
const imageConfig = {
  goStimulus: '<img src="images/arrow.png" style="width: 180px; height: 180px;" alt="GO">',
  noGoStimulus: '<img src="images/stop.png" style="width: 180px; height: 180px;" alt="STOP">',
  colorText: true             // Enable colored borders
};

const instructions = jsPsychTimelineGoNogoTimeline.createInstructions();
const practice = jsPsychTimelineGoNogoTimeline.timelineUnits.practiceTrial(jsPsych, config);
const task = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);

jsPsych.run([instructions, ...practice, task]);
```

### Custom Timeline Structure

```javascript
// Create individual components
const { practiceTrial, goNoGoTrial, debriefTrial } = jsPsychTimelineGoNogoTimeline.timelineUnits;

const instructions = practiceTrial(jsPsych, config);
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
    if (data.trial_type === 'go-nogo') {
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

The timeline is now modular with separate components:

### createInstructions()
Basic instruction pages explaining the task concept.

### timelineUnits.practiceTrial()
Interactive practice trials:
1. **GO Practice**: Interactive practice with GO stimuli
2. **NO-GO Practice**: Interactive practice with NO-GO stimuli  
3. **Practice Complete**: Transition to main task

### createTimeline()
Main task blocks:
1. **Block 1**: 50 trials (or configured amount)
2. **Block 1 Complete**: Break page with progress and reminders
3. **Block 2**: 50 trials
4. **Block 2 Complete**: Break page
5. **Block 3**: 50 trials
6. **Debrief**: Final results and completion

### Recommended Setup
```javascript
const instructions = jsPsychTimelineGoNogoTimeline.createInstructions();
const practice = jsPsychTimelineGoNogoTimeline.timelineUnits.practiceTrial(jsPsych, config);
const task = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, config);

jsPsych.run([instructions, ...practice, task]);
```

Each trial block includes both GO and NO-GO trials randomized according to the configured probability (default 75% GO trials).

## License

MIT License