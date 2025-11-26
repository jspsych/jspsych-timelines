# BART Timeline

A jsPsych implementation of the Balloon Analogue Risk Task (BART) for measuring risk-taking behavior and decision-making under uncertainty.

## Overview

The Balloon Analogue Risk Task (BART) measures risk-taking propensity by having participants inflate virtual balloons to earn money. Each pump increases earnings but also increases the risk of the balloon exploding, which results in losing all earnings for that trial.

## Installation

### NPM

```bash
npm install @jspsych-timelines/bart
```

### CDN

```html
<script src="https://unpkg.com/@jspsych-timelines/bart"></script>
```

## API Reference

### createTimeline(jsPsych, config)

Creates a complete BART task timeline.

**Parameters:**

- `jsPsych` (JsPsych): The jsPsych instance
- `config` (BartConfig, optional): Configuration options

**Returns:** Timeline object for use with `jsPsych.run()`

### timelineUnits

Access individual components for custom timeline construction:

```javascript
const {
  createInstructions,
  createTrialBlock,
  createInterBlockBreak,
  createEndResults,
} = jsPsychTimelineBartTimeline.timelineUnits;

// Get instruction trials
const instructions = createInstructions();

// Get working trial block
const block1 = createTrialTimeline(min_pumps, max_pumps, totalTrials, trialTimeout, enableTimeout);

// Get block break screen
const blockBreak = createInterBlockBreak(jsPsych, currentBlock, totalBlocks);

// Get another block
const block2 = createTrialTimeline(min_pumps, max_pumps, totalTrials, trialTimeout, enableTimeout);

// Get end results screen
const endResults = showEndResults();

jsPsych.run([instructions, block1, blockBreak, block2, endResults]);
```

### utils

Only contains `trial_text`, the default strings used in the timeline.

## Configuration Options

### BartConfig Interface

| Parameter     | Type           | Default                | Description                                                 |
| ------------------------ | -------------- | ---------------------- | ----------------------------------------------------------- |
| `max_pumps`   | number | `20` | Maximum number of pumps before guaranteed explosion |
| `min_pumps`   | number | `1` | Minimum number of pumps before explosion is possible |
| `points_per_pump` | number | `1` | Points given per successful pump |
| `num_blocks`  | number | `3` | Number of blocks in the experiment |
| `trials_per_block` | number | `10` | Number of trials per block |

## Data Generated

### Trial Data Properties

| Property        | Type     | Description                                                                |
| --------------- | -------- | -------------------------------------------------------------------------- |
| `task`          | string   | Always `'bart'` for BART trials                                            |
| `phase`         | string   | Trial phase: `'instructions'`, `'trial'`, `'block-break'`, `'end-results'` |
| `pumps`         | number   | Number of times the balloon was pumped.                                              |
| `popped`        | boolean  | Whether the balloon popped (`true`) or was collected (`false`).                          |
| `points_earned` | number   | Points earned on this trial (0 if balloon popped).                                   |
| `total_points`  | number   | Total points after this trial (starting_total_points + points_earned).               |
| `pump_times`    | array of number  | Array of reaction times for each pump in milliseconds from trial start.              |
| `collect_time`  | number   | Reaction time for the collect action in milliseconds from trial start, or `null` if balloon popped. |

## Examples

### Basic Task

```javascript
const config = {
  max_pumps: 20,
  min_pumps: 1,
  num_blocks: 3,
  trials_per_block: 10,
};

const timeline = jsPsychTimelineBartTimeline.createTimeline(jsPsych, config);
```

## License

MIT License
