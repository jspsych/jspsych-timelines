# Digit Span Task

A jsPsych implementation of the Digit Span Task for measuring working memory capacity and short-term memory. Mobile-compatible with touch-friendly button responses.

## Overview

The Digit Span Task presents participants with sequences of digits one at a time. After the sequence is complete, participants must recall the digits either in the same order (forward span) or in reverse order (backward span). The task uses a staircase algorithm to adaptively adjust difficulty.

This implementation is based on the PEBL Test Battery version of the digit span task.

## Features

- Mobile-compatible with touch-friendly number pad
- Forward and backward span modes (or both)
- Staircase adaptive algorithm for difficulty adjustment
- Full translation support via text parameterization
- Practice phase with feedback
- Configurable trial counts and timing
- Scoring utilities for calculating span metrics

## Installation

```bash
npm install @jspsych-timelines/digit-span
```

## Quick Start

```javascript
import { initJsPsych } from "jspsych";
import { createTimeline, utils } from "@jspsych-timelines/digit-span";

const jsPsych = initJsPsych({
  on_finish: () => {
    const scores = utils.scoring.getSummary(jsPsych.data.get());
    console.log("Results:", scores);
  },
});

const timeline = createTimeline(jsPsych);
jsPsych.run([timeline]);
```

### Using CDN

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://unpkg.com/jspsych"></script>
  <script src="https://unpkg.com/@jspsych/plugin-html-button-response"></script>
  <script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response"></script>
  <script src="https://unpkg.com/@jspsych-timelines/digit-span"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych();
  const task = jsPsychTimelineDigitSpan.createTimeline(jsPsych);
  jsPsych.run([task]);
</script>
</html>
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | string | `"forward"` | Task mode: `"forward"`, `"backward"`, or `"both"` |
| `showInstructions` | boolean | `true` | Show built-in instruction screens |
| `showFeedback` | boolean | `true` | Show feedback after each trial |
| `numPracticeTrials` | number | `2` | Number of practice trials per mode |
| `numTestTrials` | number | `14` | Number of test trials per mode |
| `startingSpan` | number | `4` | Initial span length for test trials |
| `minSpan` | number | `2` | Minimum span length |
| `maxSpan` | number | `10` | Maximum span length |
| `practiceSpan` | number | `3` | Span length for practice trials |
| `readyDuration` | number | `800` | Ready signal duration (ms) |
| `digitDuration` | number | `1000` | Each digit display duration (ms) |
| `feedbackDuration` | number | `1500` | Feedback display duration (ms) |
| `interTrialInterval` | number | `1500` | Inter-trial interval (ms) |
| `text` | object | `defaultText` | Custom text strings for translation |

### Example with Custom Parameters

```javascript
const timeline = createTimeline(jsPsych, {
  mode: "both",
  numPracticeTrials: 2,
  numTestTrials: 14,
  startingSpan: 4,
  minSpan: 2,
  maxSpan: 10,
});
```

## Translation

All text can be customized for translation by providing a `text` object:

```javascript
const spanishText = {
  continue_button: "Continuar",
  clear_button: "Borrar",
  done_button: "Listo",
  ready_prompt: "Listo",
  response_prompt: "Ingrese los d\u00edgitos:",
  response_prompt_backward: "Ingrese los d\u00edgitos en orden INVERSO:",
  correct_feedback: "\u00a1Correcto!",
  incorrect_feedback: (correct) => `Incorrecto. La respuesta correcta era: ${correct}`,
  practice_complete_forward: "\u00a1Pr\u00e1ctica completa! Ahora comenzar\u00e1 la tarea principal.",
};

const timeline = createTimeline(jsPsych, {
  text: spanishText,
});
```

### Available Text Strings

| Key | Default | Description |
|-----|---------|-------------|
| `instruction_pages_forward` | array | Forward mode instruction pages |
| `instruction_pages_backward` | array | Backward mode instruction pages |
| `continue_button` | "Continue" | Continue button label |
| `clear_button` | "Clear" | Clear button label |
| `done_button` | "Done" | Done button label |
| `ready_prompt` | "Ready" | Ready signal text |
| `response_prompt` | "Enter the digits:" | Forward mode prompt |
| `response_prompt_backward` | "Enter the digits in REVERSE order:" | Backward mode prompt |
| `correct_feedback` | "Correct!" | Feedback for correct responses |
| `incorrect_feedback` | Function | Feedback for incorrect responses (receives correct answer) |
| `practice_complete_forward` | String | Message after forward practice |
| `practice_complete_backward` | String | Message after backward practice |
| `forward_complete` | String | Message after forward test block |

## Data Output

### Trial Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | `"digit-span"` |
| `task_version` | string | Package version |
| `phase` | string | `"practice"` or `"test"` |
| `mode` | string | `"forward"` or `"backward"` |
| `trial` | number | Trial number (1-indexed) |
| `span_length` | number | Number of digits in this trial |
| `presented_digits` | string | Digits shown (e.g., "3-7-2-9") |
| `correct_response` | string | Expected response (e.g., "3729" or "9273") |
| `response` | string | Participant's response |
| `correct` | boolean | Whether response was correct |
| `rt` | number | Response time in ms |

## Scoring

```javascript
import { utils } from "@jspsych-timelines/digit-span";

const scores = utils.scoring.getSummary(jsPsych.data.get());
```

### Available Metrics

| Metric | Description | Interpretation |
|--------|-------------|----------------|
| `forwardMaxSpan` | Maximum span achieved (forward) | Higher = better |
| `backwardMaxSpan` | Maximum span achieved (backward) | Higher = better |
| `forwardTotalCorrect` | Total correct (forward) | Higher = better |
| `backwardTotalCorrect` | Total correct (backward) | Higher = better |
| `forwardMeanSpan` | Mean span on correct trials (forward) | Higher = better |
| `backwardMeanSpan` | Mean span on correct trials (backward) | Higher = better |
| `forwardTrials` | Total forward test trials | |
| `backwardTrials` | Total backward test trials | |

## Timeline Units

For advanced customization, you can use individual timeline components:

```javascript
import { timelineUnits, utils } from "@jspsych-timelines/digit-span";

// Access default text for reference
const defaultText = utils.text;

// Available units:
// - createInstructionTrials(config, mode)
// - createReadyTrial(config)
// - createDigitPresentationTrials(digits, config)
// - createResponseTrial(jsPsych, config, mode, digits, phase, trialNum, spanLength)
// - createFeedbackTrial(jsPsych, config)
// - createItiTrial(config)
// - createTransitionTrial(message, buttonLabel)
// - createSingleTrial(jsPsych, config, mode, spanLength, phase, trialNum)
// - createPracticeBlock(jsPsych, config, mode)
// - createTestBlock(jsPsych, config, mode)
```

## Utility Functions

```javascript
import { utils } from "@jspsych-timelines/digit-span";

// Generate random digit sequence
const digits = utils.digits.generateDigitSequence(5); // [3, 7, 2, 9, 1]

// Format for display
const formatted = utils.digits.formatDigitSequence(digits); // "3-7-2-9-1"

// Staircase algorithm
const nextSpan = utils.digits.getNextSpanLength(4, true, 2, 10); // 5 (correct -> increase)
```

## Citation

If using this task in research, please cite:

> Wechsler, D. (1939). The measurement of adult intelligence. Williams & Wilkins.

For the PEBL implementation this is based on:

> Mueller, S. T., & Piper, B. J. (2014). The Psychology Experiment Building Language (PEBL) and PEBL Test Battery. *Journal of Neuroscience Methods*, 222, 250-259.

## References

1. Wechsler, D. (1939). The measurement of adult intelligence. Williams & Wilkins.
2. Woods, D. L., et al. (2011). Improving digit span assessment of short-term verbal memory. Journal of Clinical and Experimental Neuropsychology, 33(1), 101-111.
3. Mueller, S. T., & Piper, B. J. (2014). The Psychology Experiment Building Language (PEBL) and PEBL Test Battery. Journal of Neuroscience Methods, 222, 250-259.

## License

MIT
