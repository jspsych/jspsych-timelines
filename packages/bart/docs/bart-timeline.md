# BART Timeline

A jsPsych implementation of the Balloon Analogue Risk Task (BART) for measuring risk-taking behavior and decision-making under uncertainty.

## Overview

The Balloon Analogue Risk Task (BART) measures risk-taking propensity by having participants inflate virtual balloons to earn points. Each pump increases the balloon's value but also increases the risk of it exploding, which forfeits all points for that trial.

The timeline produces interactive instructions with two practice balloons, then `num_blocks` blocks of `trials_per_block` balloons each, with a break screen between blocks and a results screen at the end.

## Installation

### NPM

```bash
npm install @jspsych-timelines/bart
```

```javascript
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/bart";
```

### CDN

```html
<script src="https://unpkg.com/@jspsych-timelines/bart"></script>
```

The browser build exposes the global `jsPsychTimelineBart`. Styles are bundled into the
script, so there is no separate stylesheet to load.

## API Reference

### createTimeline(jsPsych, config)

Creates a complete BART task timeline.

**Parameters:**

- `jsPsych` (JsPsych): the jsPsych instance
- `config` (object, optional): see [Configuration Options](#configuration-options)

**Returns:** a timeline object for use with `jsPsych.run()`

```javascript
const jsPsych = initJsPsych();
const timeline = createTimeline(jsPsych, { num_blocks: 3, trials_per_block: 10 });
jsPsych.run([timeline]);
```

`createTimeline` validates its numeric options and throws at construction rather than
producing a degenerate dataset. See [Validation](#validation).

### timelineUnits

Individual components, for building a custom timeline. Note that `createTrialBlock`
takes `maxPumps` **before** `minPumps`.

```javascript
const {
  createInteractiveInstructions,
  createTrialBlock,
  createInterBlockBreak,
  createEndResults,
} = jsPsychTimelineBart.timelineUnits;

const texts = jsPsychTimelineBart.utils.text;

// Instructions with two practice balloons.
// pointsPerPump and maxPumps should match what you pass to createTrialBlock.
const instructions = createInteractiveInstructions(jsPsych, texts, 1, 20);

// A block of trials. Returns an array, not a timeline object.
const block1 = createTrialBlock(20, 1, 1, 10, texts);

// Break screen between blocks.
const blockBreak = createInterBlockBreak(jsPsych, 1, 2, texts);

const block2 = createTrialBlock(20, 1, 1, 10, texts);

// Results screen.
const endResults = createEndResults(jsPsych, texts);

jsPsych.run([instructions, ...block1, blockBreak, ...block2, endResults]);
```

| Function | Signature |
| --- | --- |
| `createInteractiveInstructions` | `(jsPsych, texts?, pointsPerPump?, maxPumps?)` → timeline object |
| `createTrialBlock` | `(maxPumps, minPumps, pointsPerPump, totalTrials, texts?)` → array of trials |
| `createInterBlockBreak` | `(jsPsych, currentBlock, totalBlocks, texts?)` → trial object |
| `createEndResults` | `(jsPsych, texts)` → trial object |

### utils

```javascript
utils.text; // default strings; see Text Configuration
utils.constants; // { TASK_NAME: "bart", VERSION }
utils.scoring.calculateScores(data); // → ScoringResult
utils.scoring.getSummary(data); // → ScoringResult & { taskName, version }
```

Both scoring functions read `phase: "test"` trials only, so practice balloons never
contribute to the scores.

```javascript
const jsPsych = initJsPsych({
  on_finish: () => console.log(utils.scoring.getSummary(jsPsych.data.get())),
});
```

## Configuration Options

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `max_pumps` | number | `20` | Upper bound of the random pop threshold. Also passed to the plugin to calibrate balloon growth, so the balloon fills its container at this pump count. |
| `min_pumps` | number | `1` | Lower bound of the random pop threshold. |
| `points_per_pump` | number | `1` | Points added to the balloon's value per pump. |
| `num_blocks` | number | `3` | Number of blocks. |
| `trials_per_block` | number | `10` | Balloons per block. |
| `show_instructions` | boolean | `true` | Include instructions and the two practice balloons. |
| `show_end_results` | boolean | `true` | Include the results screen. |
| `text` | object | `{}` | Partial override of the default strings. See [Text Configuration](#text-configuration). |

Each trial's pop threshold is drawn uniformly from `[min_pumps, max_pumps]`. A balloon
pops on the pump that reaches its threshold.

### Validation

`createTimeline` throws if:

- `min_pumps` is not an integer `>= 1`
- `max_pumps` is not an integer `>= min_pumps`
- `num_blocks` is not an integer `>= 1`
- `trials_per_block` is not an integer `>= 1`

These otherwise fail silently. An inverted range yields thresholds unrelated to either
bound, and `min_pumps: 0` pops every balloon on the first pump, producing data that looks
like extreme risk aversion.

## Text Configuration

Pass a partial `text` object to override any default string. Keys not supplied keep
their defaults.

```javascript
createTimeline(jsPsych, {
  text: {
    pump_button: "Inflar",
    collect_button: "Recoger",
  },
});
```

| Key | Type |
| --- | --- |
| `instruction_intro` | string (HTML) |
| `instruction_pump` | string (HTML) |
| `instruction_collect` | string (HTML) |
| `instruction_try_pump` | string (HTML) |
| `instruction_pump_success` | string |
| `instruction_pump_popped` | string |
| `instruction_practice_intro` | string (HTML) |
| `pump_button` | string |
| `collect_button` | string |
| `continue_button` | string |
| `finish_button` | string |
| `current_value_label` | string |
| `total_points_label` | string |
| `point_display_format` | `(points) => string` |
| `total_points_format` | `(points) => string` |
| `block_break_message` | `(currentBlock, totalBlocks, totalPoints) => string` |
| `task_complete` | string |
| `result_summary` | `(totalPoints, popRate, adjustedAvgPumps) => string` |

Three instruction strings name a button by its label, and the label lives under a
separate key. Override one without the other and the instructions will describe a button
that no longer exists:

- `instruction_pump` ↔ `pump_button`
- `instruction_collect` ↔ `collect_button`
- `block_break_message` ↔ `continue_button`

`result_summary` receives `adjustedAvgPumps` as `number | null`; it is `null` when no
balloon was ever collected. Guard before formatting.

## Data Generated

### Fields added by this timeline

| Property | Type | Description |
| --- | --- | --- |
| `task` | string | Always `'bart'`. |
| `task_version` | string | Package version that produced the row. |
| `phase` | string | One of `'instructions'`, `'practice'`, `'test'`, `'block-break'`, `'completion'`. |
| `part` | string | `'instruction'` on the two practice balloons only. |

Filter on `{ task: 'bart', phase: 'test' }` for the scored trials. `'practice'` rows are
the two instruction balloons and are excluded from all scoring.

### Fields added by the BART plugin

Present on `'practice'` and `'test'` rows.

| Property | Type | Description |
| --- | --- | --- |
| `pumps` | number | Number of times the balloon was pumped. |
| `popped` | boolean | Whether the balloon popped (`true`) or was collected (`false`). |
| `points_earned` | number | Points earned on this trial, `0` if the balloon popped. |
| `total_points` | number | `starting_total_points + points_earned`. |
| `pump_times` | number[] | Time of each pump, in ms from trial start. |
| `collect_time` | number \| null | Time of the collect action in ms from trial start, `null` if the balloon popped. |

### ScoringResult

Returned by `utils.scoring.calculateScores`.

| Property | Type | Description |
| --- | --- | --- |
| `totalPoints` | number | Sum of `points_earned` across test trials. |
| `totalTrials` | number | Number of test trials. |
| `poppedTrials` | number | Test trials that popped. |
| `collectedTrials` | number | Test trials that were collected. |
| `popRate` | number | `poppedTrials / totalTrials`. |
| `avgPumpsBeforePop` | number \| null | Mean pumps on popped trials; `null` if none popped. |
| `avgPumpsBeforeCollect` | number \| null | Mean pumps on collected trials; `null` if none collected. |
| `adjustedAvgPumps` | number \| null | Standard BART measure: mean pumps on non-popped trials; `null` if none collected. |

The averages are `null`, not `0`, when their denominator is empty. Reporting `0` for a
participant who never collected would read as maximally risk-averse when the behavior was
the opposite; in the BART literature the measure is simply undefined.

## Styling

All rules ship inside the bundle and are namespaced to this timeline. Trials carry the
`jspsych-bart` class on the jsPsych display element, and every selector targeting jsPsych
or plugin DOM is scoped under it, so nothing leaks into other tasks in the same
experiment.

| Class | Applied to |
| --- | --- |
| `jspsych-bart` | Display element, for the duration of this timeline's trials. |
| `jspsych-bart-instructions` | Instruction and results containers. |
| `jspsych-bart-instructions-container` | Break and results message containers. |
| `jspsych-bart-instructions-title` | Headings inside the above. |
| `jspsych-bart-feedback` | Practice feedback wrapper. |
| `jspsych-bart-feedback-correct` / `-incorrect` | Practice feedback outcome. |
| `jspsych-bart-block-break` | Break screen wrapper. |

## Examples

### Basic task

```javascript
const jsPsych = initJsPsych();

const timeline = jsPsychTimelineBart.createTimeline(jsPsych, {
  max_pumps: 20,
  min_pumps: 1,
  num_blocks: 3,
  trials_per_block: 10,
});

jsPsych.run([timeline]);
```

### Cash framing

Points as cents, formatted as dollars. Note that `result_summary` must guard the `null`
case.

```javascript
const timeline = jsPsychTimelineBart.createTimeline(jsPsych, {
  points_per_pump: 25,
  text: {
    pump_button: "Pump Balloon",
    collect_button: "Collect Cash",
    current_value_label: "Current Cash",
    total_points_label: "Total Cash",
    point_display_format: (points) => `$${(points / 100).toFixed(2)}`,
    total_points_format: (points) => `$${(points / 100).toFixed(2)}`,
    result_summary: (totalPoints, popRate, adjustedAvgPumps) => `
      <p>You earned $${(totalPoints / 100).toFixed(2)}.</p>
      <p>You popped ${(popRate * 100).toFixed(0)}% of your balloons${
        adjustedAvgPumps === null
          ? "."
          : `, averaging ${adjustedAvgPumps.toFixed(1)} pumps on the ones you cashed out.`
      }</p>`,
  },
});
```

Runnable versions of both are in [`examples/`](../examples).

## License

MIT License
