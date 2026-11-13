# @jspsych-timelines/bart

## Overview

A deployable Balloon Analogue Risk Task (BART) timeline for jsPsych. Participants inflate virtual balloons to earn points: each pump raises the balloon's value but also the risk of it exploding, which forfeits everything earned on that trial. The timeline includes interactive instructions with two practice balloons, blocked trials with break screens, and a results screen.

## Loading

### Via CDN

```html
<script src="https://unpkg.com/@jspsych-timelines/bart"></script>
```

This exposes the global `jsPsychTimelineBart`. Styles are bundled into the script, so there is no separate stylesheet to load.

### Via npm

```bash
npm install @jspsych-timelines/bart
```

```javascript
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/bart";
```

## Compatibility

`bart` requires jsPsych v8.0.0 or later.

## Quick Start

```javascript
import { initJsPsych } from "jspsych";
import { createTimeline, utils } from "@jspsych-timelines/bart";

const jsPsych = initJsPsych({
  on_finish: () => console.log(utils.scoring.getSummary(jsPsych.data.get())),
});

const timeline = createTimeline(jsPsych, {
  num_blocks: 3,
  trials_per_block: 10,
  max_pumps: 20,
});

jsPsych.run([timeline]);
```

## Documentation

### createTimeline

#### jsPsychTimelineBart.createTimeline(jsPsych, { _options_ }) ⇒ <code>timeline</code>

Creates a complete BART timeline: optional instructions with two practice balloons, then `num_blocks` blocks of `trials_per_block` balloons separated by break screens, then an optional results screen.

The following parameters can be specified in the **options** parameter.

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `max_pumps` | number | `20` | Upper bound of the random pop threshold. Also calibrates balloon growth so it fills its container at this pump count. |
| `min_pumps` | number | `1` | Lower bound of the random pop threshold. |
| `points_per_pump` | number | `1` | Points added to the balloon's value per pump. |
| `num_blocks` | number | `3` | Number of blocks. |
| `trials_per_block` | number | `10` | Balloons per block. |
| `show_instructions` | boolean | `true` | Include instructions and the two practice balloons. |
| `show_end_results` | boolean | `true` | Include the results screen. |
| `text` | object | `{}` | Partial override of the default strings. |

Each trial's pop threshold is drawn uniformly from `[min_pumps, max_pumps]`. `createTimeline` throws if these are not integers, if `max_pumps < min_pumps`, or if any count is below 1 — these otherwise produce a plausible-looking but degenerate dataset rather than an obvious failure.

### timelineUnits

Individual components, for building a custom timeline.

| Function | Signature |
| --- | --- |
| `createInteractiveInstructions` | `(jsPsych, texts?, pointsPerPump?, maxPumps?)` → timeline object |
| `createTrialBlock` | `(maxPumps, minPumps, pointsPerPump, totalTrials, texts?)` → array of trials |
| `createInterBlockBreak` | `(jsPsych, currentBlock, totalBlocks, texts?)` → trial object |
| `createEndResults` | `(jsPsych, texts)` → trial object |

Note that `createTrialBlock` takes `maxPumps` before `minPumps`, and returns a plain array rather than a timeline object.

### utils

| Member | Description |
| --- | --- |
| `utils.text` | Default text strings; pass a partial override as `text` to `createTimeline`. |
| `utils.constants` | `{ TASK_NAME: "bart", VERSION }`. |
| `utils.scoring.calculateScores(data)` | Returns a `ScoringResult` for the `phase: "test"` trials. |
| `utils.scoring.getSummary(data)` | As above, plus `taskName` and `version`. |

`ScoringResult` reports `totalPoints`, `totalTrials`, `poppedTrials`, `collectedTrials`, `popRate`, `avgPumpsBeforePop`, `avgPumpsBeforeCollect` and `adjustedAvgPumps`. The three averages are `number | null` and are `null` when their denominator is empty, since the average is undefined rather than zero for a participant who never collected.

Full API reference, data fields and styling hooks: [`docs/bart-timeline.md`](./docs/bart-timeline.md). Runnable examples: [`examples/`](./examples).

## Author / Citation

Caroline Griem
