# @jspsych-timelines/fitts

Fitts' Law reciprocal tapping task, measuring motor control and the speed-accuracy tradeoff.

## Overview

Two vertical bars are shown, one on each side of the screen. The active bar is fully opaque; the participant taps it, the highlight moves to the other bar, and they tap back and forth. Target width and the distance between the bars vary by condition, so the task sweeps a range of difficulty.

Each condition has an **index of difficulty** (ID), and movement time rises roughly linearly with it:

```
ID = log2(A / W + 1)     A = amplitude (centre to centre), W = target width
```

The bars sit flush at the edges of a container `2W + distance` wide, so the `distance` you configure is the gap between their **inner edges** and the amplitude the participant actually travels is `distance + width`. The timeline does that conversion for you.

A tap that lands on the dimmed bar, or in the gap between bars, is recorded as an error and the highlight does not move — so accuracy is measured rather than assumed.

## Installation

```
npm install @jspsych-timelines/fitts
```

or via CDN:

```html
<script src="https://unpkg.com/@jspsych-timelines/fitts"></script>
```

## Quick Start

```javascript
import { initJsPsych } from "jspsych";
import { createTimeline, utils } from "@jspsych-timelines/fitts";

const jsPsych = initJsPsych({
  on_finish: () => {
    console.log(utils.scoring.getSummary(jsPsych.data.get()));
  },
});

jsPsych.run([createTimeline(jsPsych)]);
```

`createTimeline` takes the jsPsych instance first and an options object second.

## Parameters

| option | type | default | description |
| --- | --- | --- | --- |
| `showInstructions` | `boolean` | `true` | Show the built-in instruction screens |
| `requireLandscape` | `boolean` | `true` | Gate the task behind a landscape-orientation check |
| `allowOrientationSkip` | `boolean` | `false` | Offer a button to continue past that check |
| `conditions` | `FittsCondition[]` | 6 built-in | Each `{ width, distance }` in pixels |
| `tapsPerCondition` | `number` | `10` | Taps required to finish one trial; must be at least 2 |
| `repetitionsPerCondition` | `number` | `2` | How many times each condition appears in the scored block |
| `showPractice` | `boolean` | `true` | Run a practice block before the scored one |
| `numPracticeConditions` | `number` | `2` | How many of `conditions` the practice block uses |
| `targetColor` | `string` | `"#4A90D9"` | Fill color of both bars |
| `inactiveTargetOpacity` | `number` | `0.35` | Opacity of the bar that is not active |
| `text` | `Partial<TextConfig>` | built-in | Overrides for any display string |

`createTimeline` throws on a configuration that cannot produce usable data — an empty `conditions` array, a non-positive `width` or `distance`, fewer than 2 taps, fewer than 1 repetition, or an opacity outside 0–1. It deliberately accepts a target wider than the amplitude, which is a valid floor-effect baseline.

### Default conditions

| width | distance | ID |
| --- | --- | --- |
| 60 | 200 | 2.42 |
| 40 | 200 | 2.81 |
| 60 | 400 | 3.12 |
| 30 | 200 | 3.12 |
| 40 | 400 | 3.58 |
| 30 | 400 | 3.94 |

### Orientation check

The check uses the Screen Orientation API where available and falls back to `window.innerWidth > window.innerHeight`. That fallback reports portrait for a tall desktop browser window, and with `allowOrientationSkip: false` there is no way past it. Enable the skip button for desktop or mixed-device studies:

```javascript
createTimeline(jsPsych, { allowOrientationSkip: true });
```

## Data

One row per tapping trial, with `part: "response"`:

| field | description |
| --- | --- |
| `task` | `"fitts"` |
| `task_version` | package version |
| `phase` | `"practice"` or `"test"` |
| `part` | `"response"` |
| `condition_index` | index into the `conditions` array |
| `trial_number` | position within the block, 1-indexed |
| `target_width` | target width in pixels |
| `target_distance` | inner-edge gap in pixels |
| `index_of_difficulty` | ID for this condition |
| `taps_completed` | successful taps, equal to `tapsPerCondition` |
| `errors` | taps that missed the active target |
| `accuracy` | `taps / (taps + errors) * 100` |
| `initiation_time` | onset to first tap, in ms |
| `total_time` | onset to last tap, in ms |
| `movement_times` | one entry per target-to-target movement |
| `tap_positions` | horizontal endpoint of each movement |

`movement_times` and `tap_positions` both have `taps_completed - 1` entries and are index-aligned: entry *i* of each describes the same movement. The first tap has no target to have moved from, so its interval is `initiation_time` — a reaction time — and it is deliberately excluded from `movement_times` rather than averaged in with real movements.

`tap_positions` records where each tap landed, which is what the effective-width correction `W_e = 4.133 × SD(x)` needs.

### Phase and part values

These are the pairs a full run emits:

| phase | part |
| --- | --- |
| `instructions` | `orientation` |
| `instructions` | `instruction` |
| `practice` | `instruction` |
| `practice` | `response` |
| `test` | `instruction` |
| `test` | `response` |
| `completion` | *(none)* |

## Scoring

```javascript
import { utils } from "@jspsych-timelines/fitts";

const scores = utils.scoring.getSummary(jsPsych.data.get());
```

Scoring reads only rows with `phase: "test"`, so practice never contributes.

| field | description |
| --- | --- |
| `averageMT` | mean movement time in ms |
| `accuracy` | overall percentage of taps that hit |
| `throughput` | mean ID divided by mean movement time, in bits/s; `null` when not calculable |
| `totalTaps` | successful taps across the scored block |
| `totalErrors` | missed taps across the scored block |
| `conditionPerformance` | per condition: `width`, `distance`, `indexOfDifficulty`, `averageMT`, `accuracy` |

`utils.scoring.calculateID(distance, width)` is exported if you want to compute the ID of a condition yourself.

## Translation

Every display string lives in one object, so a language swap needs nothing else:

```javascript
createTimeline(jsPsych, {
  text: {
    continue_button: "Continuer",
    start_button: "Commencer",
    task_complete: "Tâche terminée",
  },
});
```

| key | type |
| --- | --- |
| `continue_button` | `string` |
| `start_button` | `string` |
| `orientation_message` | `string` |
| `orientation_skip_button` | `string` |
| `instruction_intro` | `string` |
| `instruction_practice` | `string` |
| `instruction_task` | `string` |
| `task_complete` | `string` |
| `result_summary` | `(averageMT, accuracy, throughput) => string` |

`result_summary` is a function of the values it reports rather than a template with placeholders, so a translation can reorder the clauses or drop a value entirely. `throughput` is `null` when it could not be computed.

```javascript
createTimeline(jsPsych, {
  text: {
    result_summary: (averageMT, accuracy, throughput) =>
      `<p>${accuracy.toFixed(0)}% correct, ${averageMT.toFixed(0)}ms per movement</p>`,
  },
});
```

## Timeline units

`timelineUnits` holds the pieces that can be placed in a timeline:

```javascript
import { timelineUnits } from "@jspsych-timelines/fitts";

timelineUnits.createInstructionTrials(config, "intro");
timelineUnits.createFittsTrial(jsPsych, config, condition, conditionIndex, trialNumber, isPractice);
timelineUnits.createFittsBlock(jsPsych, config, conditions, repetitions, isPractice);
timelineUnits.createCompletionTrial(jsPsych, config);
```

Helpers that are not timeline units live on `utils`: `utils.scoring.calculateID` and `utils.display.createFittsHTML`.

## Styling

All rules are scoped under `jspsych-fitts`. The bars are positioned with inline styles because their geometry is computed per condition; `targetColor` and `inactiveTargetOpacity` control their appearance.

## License

MIT
