# @jspsych-timelines/go-nogo

## Overview

A complete Go/No-Go task implementation for jsPsych measuring response inhibition and sustained attention. Includes interactive practice, configurable parameters, and comprehensive data collection.

## Loading

### NPM
```bash
npm install @jspsych-timelines/go-nogo
```

### CDN (Browser)
```html
<script src="https://unpkg.com/@jspsych-timelines/go-nogo"></script>
```

### Basic Usage
```javascript
const jsPsych = initJsPsych();

// Complete timeline with instructions and practice
const instructions = jsPsychTimelineGoNogoTimeline.createInstructions();
const practice = jsPsychTimelineGoNogoTimeline.timelineUnits.createPractice();
const task = jsPsychTimelineGoNogoTimeline.createTimeline(jsPsych, {
  num_blocks: 2,
  num_trials: 30,
  show_debrief: true
});

jsPsych.run([instructions, practice, task]);
```

## Compatibility

`@jspsych-timelines/go-nogo` requires jsPsych v8.0.0 or later.

## Documentation

### createTimeline(jsPsych, config)

Creates the main Go/No-Go task timeline with experimental blocks, optional practice, and debrief.

**Parameters:**
- `jsPsych` (JsPsych): Active jsPsych instance
- `config` (GoNoGoConfig, optional): Configuration options

**Returns:** Timeline object with experimental blocks

### createInstructions(instructions?, texts?)

Creates instruction pages for the Go/No-Go task.

**Parameters:**
- `instructions` (string[], optional): Custom instruction pages
- `texts` (object, optional): Custom text configuration

**Returns:** Instructions trial object

### timelineUnits

Building blocks for custom timeline construction:

- `createPractice(config?)`: Interactive practice trials (GO + NO-GO + completion)
- `createDebrief(jsPsych, config?)`: Results summary trial

### utils

Utility functions:
- `createStimulusHTML(html, isGoTrial)`: Format stimulus HTML

## Configuration Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `show_instructions` | boolean | `false` | Include instructions at start |
| `show_practice` | boolean | `false` | Include practice trials |
| `show_debrief` | boolean | `false` | Show results summary at end |
| `num_blocks` | number | `3` | Number of experimental blocks |
| `num_trials` | number | `50` | Trials per block |
| `trial_timeout` | number | `500` | Max response time (ms) |
| `isi_timeout` | number | `500` | Inter-stimulus interval (ms) |
| `probability` | number | `0.75` | Probability of GO trials (0-1) |
| `go_stimulus` | string | `'Y'` | Single GO stimulus |
| `nogo_stimulus` | string | `'X'` | Single NO-GO stimulus |
| `go_stimuli` | string[] | - | Array of GO stimuli (overrides go_stimulus) |
| `nogo_stimuli` | string[] | - | Array of NO-GO stimuli (overrides nogo_stimulus) |
| `button_text` | string | `'Click'` | Response button label |
| `go_practice_timeout` | number | `10000` | GO practice trial timeout (ms) |
| `nogo_practice_timeout` | number | `3000` | NO-GO practice trial timeout (ms) |
| `instructions_array` | string[] | default pages | Custom instruction pages |
| `text_object` | object | trial_text | Custom text configuration |

## Authors / Citation

**Author:** Caroline Griem
**GitHub:** [@caroline-griem](https://github.com/caroline-griem)

**Author:** Abdullah Hunter Farhat  
**Also known as:** A. Hunter Farhat  
**ORCID:** [0009-0008-7042-469X](https://orcid.org/0009-0008-7042-469X)  
**GitHub:** [@farhat60](https://github.com/farhat60)
