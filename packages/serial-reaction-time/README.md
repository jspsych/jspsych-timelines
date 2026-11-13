# Serial Reaction Time Task

A jsPsych implementation of the Serial Reaction Time Task (SRTT; Nissen & Bullemer, 1987) for measuring implicit sequence learning.

## Overview

A row of boxes is shown on the screen. On each trial, one box "lights up" and the participant taps it as quickly as possible. In *sequence* blocks, the targets follow a deterministic repeating sequence; in a designated *random* block, targets are generated randomly with no immediate repeats. Implicit sequence learning is indexed by the increase in reaction time on the random block relative to neighboring sequence blocks.

This implementation wraps [`@jspsych/plugin-serial-reaction-time-mouse`](https://www.jspsych.org/latest/plugins/serial-reaction-time-mouse/) for the stimulus trials. Participants tap or click the lit cell — Nissen & Bullemer's original setup used a panel of physical buttons that lit up, so this is closer to the original than a keyboard-mapped variant and works on touch devices.

## Features

- Tap/click-based responses — no keyboard required
- Built on top of the official `@jspsych/plugin-serial-reaction-time-mouse` plugin
- Default 10-element Nissen & Bullemer (1987) sequence; provide any custom sequence
- Configurable number of blocks, trials per block, and random transfer block
- Sequence learning effect calculated automatically from block-level RTs
- Full translation support via text parameterization

## Installation

```bash
npm install @jspsych-timelines/serial-reaction-time
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/jspsych@8"></script>
  <script src="https://unpkg.com/@jspsych-timelines/serial-reaction-time"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych@8/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych();
  const task = jsPsychTimelineSerialReactionTime.createTimeline(jsPsych);
  jsPsych.run([task]);
</script>
</html>
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `showInstructions` | boolean | `true` | Show built-in instruction screens |
| `showPracticeFeedback` | boolean | `true` | Show correct/incorrect feedback during practice |
| `numPracticeTrials` | number | `20` | Number of practice trials |
| `numBlocks` | number | `6` | Number of test blocks |
| `trialsPerBlock` | number | `100` | Trials per test block |
| `numPositions` | number | `4` | Number of stimulus boxes (inferred from `sequence` if larger) |
| `sequence` | number[] | Nissen & Bullemer 10-element sequence | 0-indexed positions used in sequence blocks |
| `randomBlockIndex` | number | `5` | 1-indexed block number that uses random targets. `0` disables. |
| `responseDuration` | number \| null | `null` | Maximum response time in ms; `null` = no limit |
| `responseToStimulusInterval` | number | `250` | Time (ms) the empty grid is shown before the next target appears (passed through as the plugin's `pre_target_duration`) |
| `feedbackDuration` | number | `400` | Duration (ms) of the plugin's built-in color-coded feedback during practice (clicked cell flashes green/red) |
| `allowNontargetResponses` | boolean | `true` | If true, participants can click any cell (errors are recorded). If false, only the target cell is clickable. |
| `gridSquareSize` | number | `100` | Pixel size of each grid cell |
| `targetColor` | string | `"#333"` | Background color of the lit target cell |
| `text` | object | `defaultText` | Custom text strings for translation |

### Default sequence

The default sequence is the classic 10-element Nissen & Bullemer (1987) repeating pattern, expressed as 0-indexed positions:

```
[3, 1, 2, 0, 2, 1, 3, 2, 1, 0]
```

(Equivalent to `4-2-3-1-3-2-4-3-2-1` in the original 1-indexed positions.)

### Custom sequences

```javascript
const timeline = createTimeline(jsPsych, {
  sequence: [0, 2, 1, 3, 2, 0, 3, 1, 2, 1, 0, 3], // 12-element SOC sequence
  numBlocks: 8,
  trialsPerBlock: 96, // 8 cycles per block
  randomBlockIndex: 7,
});
```

`numPositions` is inferred from the maximum value in `sequence`, so a 6-position task just needs a sequence with values up to `5`.

## Translation

```javascript
const spanishText = {
  continue_button: "Continuar",
  start_button: "Comenzar",
  task_complete: "Tarea Completa",
};

const timeline = createTimeline(jsPsych, { text: spanishText });
```

See `utils.text` for the full set of translatable strings.

## Data Output

### Stimulus trial fields

| Field | Type | Description |
|---|---|---|
| `task` | string | `"serial-reaction-time"` |
| `task_version` | string | Package version |
| `phase` | string | `"practice"` or `"test"` |
| `block` | number | Test block number (1-indexed); `0` for practice |
| `trial` | number | Trial within block (1-indexed) |
| `block_type` | string | `"sequence"` or `"random"` |
| `target` | number | 0-indexed position of the target box |
| `correct_response` | number | Same as `target` |
| `response` | number \| null | Index of the box the participant tapped (null on timeout) |
| `correct` | boolean | Whether response matched the target |
| `rt` | number \| null | Response time in ms (null on timeout) |

## Scoring

```javascript
import { utils } from "@jspsych-timelines/serial-reaction-time";

const summary = utils.scoring.getSummary(jsPsych.data.get());
```

### Available metrics

| Metric | Description |
|---|---|
| `totalTrials` | Total number of test trials |
| `correctTrials` | Number of correct test trials |
| `accuracy` | Overall accuracy (0–1) |
| `meanRT` | Mean RT across correct test trials (ms) |
| `blockSummaries` | Array of `{ block, block_type, numTrials, numCorrect, accuracy, meanRT }` |
| `sequenceLearningEffectRT` | RT(random block) − mean RT(adjacent sequence blocks). Higher = stronger implicit learning. `null` if uncomputable. |

## Timeline Units

For custom compositions you can use the lower-level pieces:

```javascript
import { timelineUnits } from "@jspsych-timelines/serial-reaction-time";

const customTimeline = {
  timeline: [
    timelineUnits.createPracticeBlock(config),
    timelineUnits.createTestBlock(config, 1, "sequence"),
    timelineUnits.createTestBlock(config, 2, "random"),
  ],
};
```

### Available units

- `createInstructionTrials(config)` — instruction screens
- `createStimulusTrial(config, target, trialData, showFeedback?)` — single SRTT trial with one lit cell (uses the SRT mouse plugin); pass `true` for `showFeedback` to enable the plugin's color-coded response feedback
- `createBlockBreak(config, blockNumber, totalBlocks)` — between-block break
- `createTransitionTrial(message, buttonLabel)` — phase transition
- `createPracticeBlock(config)` — full practice block (uses plugin's built-in feedback when `config.showPracticeFeedback` is true)
- `createTestBlock(config, blockNumber, blockType)` — full test block
- `createCompletionTrial(jsPsych, config)` — completion screen with summary

## Citation

> Nissen, M. J., & Bullemer, P. (1987). Attentional requirements of learning: Evidence from performance measures. *Cognitive Psychology*, 19(1), 1–32.

## References

1. Nissen, M. J., & Bullemer, P. (1987). Attentional requirements of learning: Evidence from performance measures. *Cognitive Psychology*, 19(1), 1–32.
2. Reed, J., & Johnson, P. (1994). Assessing implicit learning with indirect tests: Determining what is learned about sequence structure. *Journal of Experimental Psychology: Learning, Memory, and Cognition*, 20(3), 585–594.
3. Robertson, E. M. (2007). The serial reaction time task: Implicit motor skill learning? *Journal of Neuroscience*, 27(38), 10073–10075.

## License

MIT
