# Flanker Task

A jsPsych implementation of the Eriksen Flanker Task for measuring inhibitory control and selective attention. Mobile-compatible with touch-friendly button responses.

## Overview

The Flanker Task presents participants with a row of five arrows. The task is to identify the direction of the center (target) arrow while ignoring the surrounding (flanker) arrows. The flanker arrows can point in the same direction as the target (congruent), the opposite direction (incongruent), or be replaced with neutral dashes.

This implementation is based on the PEBL Test Battery version of the flanker task.

## Features

- Mobile-compatible with large touch-friendly buttons
- Full translation support via text parameterization
- Practice phase with feedback
- Configurable trial counts and timing
- Scoring utilities for calculating flanker effect

## Installation

```bash
npm install @jspsych-timelines/flanker
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://unpkg.com/jspsych@8"></script>
  <script src="https://unpkg.com/@jspsych-timelines/flanker"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych@8/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych();
  const task = jsPsychTimelineFlanker.createTimeline(jsPsych);
  jsPsych.run([task]);
</script>
</html>
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `showInstructions` | boolean | `true` | Show built-in instruction screens |
| `showPracticeFeedback` | boolean | `true` | Show feedback during practice |
| `showTestFeedback` | boolean | `false` | Show feedback during test |
| `numPracticeTrials` | number | `12` | Number of practice trials |
| `numTestTrials` | number | `120` | Number of test trials |
| `numBlocks` | number | `1` | Number of test blocks |
| `fixationDuration` | number | `500` | Fixation cross duration (ms) |
| `responseDuration` | number | `2000` | Maximum response time (ms) |
| `feedbackDuration` | number | `400` | Feedback display duration (ms) |
| `interTrialInterval` | number | `1000` | Inter-trial interval (ms) |
| `includeNeutral` | boolean | `true` | Include neutral (dash) flanker trials |
| `text` | object | `defaultText` | Custom text strings for translation |

### Example with Custom Parameters

```javascript
const timeline = createTimeline(jsPsych, {
  numPracticeTrials: 6,
  numTestTrials: 60,
  numBlocks: 2,
  fixationDuration: 300,
  responseDuration: 1500,
  includeNeutral: false,
});
```

## Translation

All text can be customized for translation by providing a `text` object:

```javascript
const spanishText = {
  left_button: "Izquierda",
  right_button: "Derecha",
  continue_button: "Continuar",
  correct_feedback: "¡Correcto!",
  incorrect_feedback: "Incorrecto",
  timeout_feedback: "¡Muy lento!",
  practice_complete: "¡Práctica completa! Ahora comenzará la tarea principal.",
};

const timeline = createTimeline(jsPsych, {
  text: spanishText,
});
```

### Available Text Strings

| Key | Default | Description |
|-----|---------|-------------|
| `left_button` | "Left" | Left response button label |
| `right_button` | "Right" | Right response button label |
| `continue_button` | "Continue" | Continue button label |
| `correct_feedback` | "Correct!" | Feedback for correct responses |
| `incorrect_feedback` | "Incorrect" | Feedback for incorrect responses |
| `timeout_feedback` | "Too slow!" | Feedback for timeouts |
| `fixation` | "+" | Fixation cross character |
| `practice_complete` | "Practice complete!..." | Message after practice |
| `block_complete` | Function | Message after each block |
| `instruction_pages` | Function | Instruction page content |

## Data Output

### Trial Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | `"flanker"` |
| `task_version` | string | Package version |
| `phase` | string | `"practice"` or `"test"` |
| `block` | number | Block number (1-indexed) |
| `trial` | number | Trial within block (1-indexed) |
| `target_direction` | string | `"left"` or `"right"` |
| `congruence` | string | `"congruent"`, `"incongruent"`, or `"neutral"` |
| `correct_response` | number | Expected button index (0=left, 1=right) |
| `response` | number \| null | Participant's button press (null if timeout) |
| `correct` | boolean | Whether response was correct |
| `rt` | number \| null | Response time in ms (null if timeout) |

## Scoring

```javascript
import { utils } from "@jspsych-timelines/flanker";

const scores = utils.scoring.getSummary(jsPsych.data.get());
```

### Available Metrics

| Metric | Description | Interpretation |
|--------|-------------|----------------|
| `accuracy` | Overall accuracy (0-1) | Higher = better |
| `meanRT` | Mean RT of correct trials (ms) | Lower = faster |
| `congruentAccuracy` | Accuracy on congruent trials | Higher = better |
| `incongruentAccuracy` | Accuracy on incongruent trials | Higher = better |
| `neutralAccuracy` | Accuracy on neutral trials | Higher = better |
| `congruentRT` | Mean RT on congruent trials | Lower = faster |
| `incongruentRT` | Mean RT on incongruent trials | Lower = faster |
| `neutralRT` | Mean RT on neutral trials | Lower = faster |
| `flankerEffectRT` | RT(incongruent) - RT(congruent) | Higher = more interference |
| `flankerEffectAccuracy` | Accuracy(congruent) - Accuracy(incongruent) | Higher = more interference |
| `totalTrials` | Total number of test trials | |
| `correctTrials` | Number of correct test trials | |

## Timeline Units

For advanced customization, you can use individual timeline components:

```javascript
import { timelineUnits, utils } from "@jspsych-timelines/flanker";

// Access default text for reference
const defaultText = utils.text;

// Build custom timeline
const customTimeline = {
  timeline: [
    myCustomInstructions,
    timelineUnits.createPracticeBlock(jsPsych, config),
    timelineUnits.createTestBlock(jsPsych, config, 1),
  ],
};
```

### Available Timeline Units

- `createInstructionTrials(config)` - Instruction screens
- `createFixationTrial(config)` - Fixation cross
- `createStimulusTrial(jsPsych, config, phase, blockNumber)` - Stimulus presentation
- `createFeedbackTrial(jsPsych, config)` - Feedback display
- `createItiTrial(config)` - Inter-trial interval
- `createTransitionTrial(message, buttonLabel)` - Phase transition screen
- `createPracticeBlock(jsPsych, config)` - Complete practice block
- `createTestBlock(jsPsych, config, blockNumber)` - Complete test block

## Stimulus Utilities

```javascript
import { utils } from "@jspsych-timelines/flanker";

// Generate stimulus HTML
const html = utils.stimuli.generateStimulusHtml("left", "incongruent");

// Get trial conditions
const conditions = utils.stimuli.generateTrialVariables(true); // true = include neutral

// Access arrow SVGs
const leftArrow = utils.stimuli.LEFT_ARROW_SVG;
const rightArrow = utils.stimuli.RIGHT_ARROW_SVG;
```

## Citation

If using this task in research, please cite:

> Eriksen, B. A., & Eriksen, C. W. (1974). Effects of noise letters upon the identification of a target letter in a nonsearch task. *Perception & Psychophysics*, 16(1), 143-149.

For the PEBL implementation this is based on:

> Mueller, S. T., & Piper, B. J. (2014). The Psychology Experiment Building Language (PEBL) and PEBL Test Battery. *Journal of Neuroscience Methods*, 222, 250-259.

## References

1. Eriksen, B. A., & Eriksen, C. W. (1974). Effects of noise letters upon the identification of a target letter in a nonsearch task. Perception & Psychophysics, 16(1), 143-149.
2. Mueller, S. T., & Piper, B. J. (2014). The Psychology Experiment Building Language (PEBL) and PEBL Test Battery. Journal of Neuroscience Methods, 222, 250-259.
3. Ridderinkhof, K. R., van der Molen, M. W., & Bashore, T. R. (1995). Limits on the application of additive factors logic. Acta Psychologica, 90(1-3), 29-48.

## License

MIT
