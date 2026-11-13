# @jspsych-timelines/stop-signal-task

A jsPsych timeline for the Stop Signal Task, measuring response inhibition and impulse control.

## Overview

Participants see arrows pointing left or right and must press the matching direction button. On a proportion of trials (~25%), a stop signal appears after a variable delay, and participants must withhold their response. An adaptive staircase adjusts the stop signal delay (SSD) to converge on ~50% stopping accuracy, enabling valid SSRT estimation.

## Installation

```bash
npm install @jspsych-timelines/stop-signal-task
```

## Usage

```javascript
import { createTimeline } from "@jspsych-timelines/stop-signal-task";

const jsPsych = initJsPsych();
const timeline = createTimeline(jsPsych, {
  numTestTrials: 192,
  showInstructions: true,
});
jsPsych.run([timeline]);
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showInstructions` | boolean | `true` | Show built-in instruction screens |
| `showPracticeFeedback` | boolean | `true` | Show feedback during practice |
| `showTestFeedback` | boolean | `false` | Show feedback during test |
| `numPracticeTrials` | number | `24` | Number of practice trials |
| `numTestTrials` | number | `192` | Number of test trials |
| `fixationDuration` | number | `500` | Fixation cross duration (ms) |
| `responseDuration` | number | `1500` | Maximum response time (ms) |
| `feedbackDuration` | number | `400` | Feedback display duration (ms) |
| `interTrialInterval` | number | `1000` | Inter-trial interval (ms) |
| `stopProbability` | number | `0.25` | Proportion of stop trials |
| `initialSSD` | number | `250` | Initial stop signal delay (ms) |
| `ssdStep` | number | `50` | SSD adjustment step size (ms) |
| `minSSD` | number | `50` | Minimum SSD (ms) |
| `maxSSD` | number | `800` | Maximum SSD (ms) |
| `maxConsecutiveStop` | number | `3` | Max consecutive stop trials |
| `maxConsecutiveGo` | number | `5` | Max consecutive go trials |
| `text` | object | - | Custom text strings for translation |

## Scoring

Access scores via `utils.scoring.getSummary(data)`:

- **goAccuracy**: Correct go responses / total go trials
- **stopAccuracy**: Successful stops / total stop trials
- **meanGoRT**: Mean reaction time on correct go trials
- **goRTStandardDeviation**: SD of go trial reaction times
- **meanSSD**: Average stop signal delay
- **ssrt**: Stop Signal Reaction Time (integration method)
- **commissionErrors**: Responses on stop trials
- **omissionErrors**: No response on go trials

## License

MIT
