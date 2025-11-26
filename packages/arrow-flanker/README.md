# arrow-flanker

## Overview

A comprehensive implementation of the Eriksen Flanker Task using arrow stimuli for jsPsych. Measures selective attention and response inhibition by requiring participants to respond to a central target arrow while ignoring flanking arrows. Supports extensive parameterization for research applications including temporal manipulation (SOA), spatial configuration, congruency ratio control, sequential effects tracking, and multiple block designs.

## Loading

### Via NPM

```bash
npm install @jspsych-timelines/arrow-flanker
```

```js
import { createTimeline } from '@jspsych-timelines/arrow-flanker'
```

### In browser

```html
<script src="https://unpkg.com/@jspsych-timelines/arrow-flanker"></script>
```

## Compatibility

`@jspsych-timelines/arrow-flanker` requires:
- jsPsych v8.0.0 or later
- `@jspsych-contrib/plugin-flanker` v1.0.0 or later (peer dependency)

## Documentation

### createTimeline

#### jsPsychTimelineArrowFlankerTask.createTimeline(jsPsych, { *options* }) ⇒ <code>timeline</code>

Creates a complete Arrow Flanker Task timeline with configurable parameters for research applications.

**Basic usage:**
```javascript
const jsPsych = initJsPsych();

const timeline = jsPsychTimelineArrowFlankerTask.createTimeline(jsPsych, {
  fixation_duration: 500,
  num_trials: 24
});

jsPsych.run(timeline.timeline);
```

**Advanced usage (SOA manipulation):**
```javascript
const timeline = jsPsychTimelineArrowFlankerTask.createTimeline(jsPsych, {
  soa: [-200, -100, 0, 100, 200],  // Temporal manipulation
  stimulus_duration: 100,
  congruency_ratio: { congruent: 30, incongruent: 70 },
  track_sequence_effects: true,
  num_blocks: 4,
  num_trials: 84
});
```

The following parameters can be specified in the **options** parameter.

#### Temporal Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `soa` | number \| number[] \| {min, max} | `0` | Stimulus Onset Asynchrony (ms). Controls timing between flanker and target onset. Single value, array of values to sample, or range object. |
| `stimulus_duration` | number \| null | `null` | Stimulus display duration (ms). `null` = response-terminated |
| `fixation_duration` | number | `500` | Fixation cross duration (ms) |
| `iti_duration` | number | `0` | Inter-trial interval (ms) |
| `response_timeout` | number | `1500` | Maximum response time allowed (ms) |

#### Spatial Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `stimulus_size` | string | `'48px'` | Size of individual arrow elements |
| `target_flanker_separation` | string | `'10px'` | Space between target and flankers |
| `fixation_size` | string | `'24px'` | Size of fixation cross |
| `stimulus_container_height` | string | `'100px'` | Container height to prevent layout shifts |
| `flanker_arrangement` | 'horizontal' \| 'vertical' | `'horizontal'` | Orientation of flanker array |
| `num_flankers` | 4 \| 6 | `4` | Number of flankers (creates 5 or 7-item arrays) |

#### Design Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_neutral` | boolean | `false` | Include neutral trials with non-directional flankers |
| `neutral_stimulus` | string | (dash SVG) | Custom SVG for neutral flanker stimulus |
| `block_design` | 'mixed' \| 'blocked' | `'mixed'` | Trial presentation order (randomized or grouped) |
| `congruency_ratio` | object | `{congruent: 1, incongruent: 1}` | Relative proportions of trial types. E.g., `{congruent: 25, incongruent: 75}` |
| `track_sequence_effects` | boolean | `false` | Add previous trial information for CSE analysis |
| `num_blocks` | number | `1` | Number of experimental blocks |
| `num_trials` | number | `12` | Number of trials per block |
| `block_break_duration` | number \| null | `null` | Block break duration (ms). `null` shows continue button |

#### Response Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `response_keys` | object | `{left: ['ArrowLeft'], right: ['ArrowRight']}` | Response key mapping for left/right |
| `data_labels` | object | `{}` | Custom data labels added to all trials |

#### Legacy Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `n` | number | - | Alias for `num_trials` (backward compatibility) |

### timelineUnits

Building blocks for custom timeline construction:

- **`createFixationTrial(options)`**: Creates a fixation cross trial
- **`createFlankerTrial(jsPsych, options)`**: Creates a flanker stimulus trial with response collection
- **`createITITrial(options)`**: Creates an inter-trial interval blank screen
- **`createBlockBreak(options)`**: Creates a block break screen

**Example:**
```javascript
const fixation = jsPsychTimelineArrowFlankerTask.timelineUnits.createFixationTrial({
  duration: 500
});
```

### Exported utilities

Additional functions for advanced customization:

- **`generateTrialVariables(jsPsych, options)`**: Generates timeline variables for a block
- **`createFlankerStimulus(direction, congruency, options)`**: Creates HTML for a flanker stimulus array
- **`mergeConfig(userConfig, defaults)`**: Merges configurations

## Data

Each trial records the following data:

| Name | Type | Description |
|------|------|-------------|
| `task` | string | Always 'flanker' |
| `phase` | string | 'response', 'fixation', 'iti', or 'block_break' |
| `direction` | string | Target direction: 'left' or 'right' |
| `congruency` | string | Trial type: 'congruent', 'incongruent', or 'neutral' |
| `soa` | number | SOA value for this trial (ms) |
| `block_number` | number | Current block number |
| `trial_number` | number | Trial number within block |
| `previous_congruency` | string | Previous trial congruency (if `track_sequence_effects: true`) |
| `previous_direction` | string | Previous trial direction (if `track_sequence_effects: true`) |
| `rt` | number | Reaction time (ms) |
| `response` | string | Key pressed |
| `correct` | boolean | Response accuracy |

## Examples

Complete working examples are available in the [examples directory](examples/):

- **[Basic Usage](examples/index.html)** - Simple flanker task with default settings
- **[SOA Manipulation](examples/advanced-soa.html)** - Temporal dynamics research with multiple SOA values
- **[Congruency Ratio](examples/congruency-ratio.html)** - Global control manipulation (high vs low conflict)
- **[Neutral Trials](examples/neutral-trials.html)** - Separate facilitation from interference
- **[Sequential Effects](examples/sequential-effects.html)** - Congruency Sequence Effect (Gratton effect)

See [examples/README.md](examples/README.md) for detailed descriptions and research applications.

## Research Applications

This package supports investigating:

1. **Response Competition** - Use SOA manipulation to isolate response selection stage
2. **Perceptual Filtering** - Small separations + brief durations test visual processing
3. **Cognitive Control Adaptation** - Sequential effects tracking enables CSE analysis
4. **Global vs Local Control** - Congruency ratio manipulation tests proactive control
5. **Temporal Dynamics** - SOA arrays reveal time course of interference

## Author / Citation

**Author:** Josh de Leeuw
**GitHub:** [@jodeleeuw](https://github.com/jodeleeuw)

If you use this package in your research, please cite:

```
Eriksen, B. A., & Eriksen, C. W. (1974). Effects of noise letters upon the
identification of a target letter in a nonsearch task. Perception & Psychophysics,
16(1), 143-149.
```
