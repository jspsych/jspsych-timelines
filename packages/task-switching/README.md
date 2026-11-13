# Task Switching

A jsPsych implementation of the Task Switching paradigm, measuring cognitive flexibility and switch costs. Participants classify single digits on two dimensions (magnitude and parity), with task cues indicating which classification to perform. The switch cost is the RT/accuracy difference between switch trials and repeat trials.

## Installation

```bash
npm install @jspsych-timelines/task-switching
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/jspsych@8"></script>
  <script src="https://unpkg.com/@jspsych-timelines/task-switching"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych@8/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych();
  const task = jsPsychTimelineTaskSwitching.createTimeline(jsPsych);
  jsPsych.run([task]);
</script>
</html>
```

## Task Description

On each trial, a single digit (1-9, excluding 5) appears. Participants classify the digit on one of two dimensions:

- **Magnitude**: Is the digit LOW (1-4) or HIGH (6-7-8-9)?
- **Parity**: Is the digit ODD or EVEN?

A cue tells participants which task to perform. The **switch cost** emerges when comparing trials where the task changed (switch) versus stayed the same (repeat).

### Two Modes

**Cued mode** (default): An explicit cue ("SIZE" or "ODD/EVEN") appears before the digit, indicating which task to perform.

**Alternating mode**: Tasks alternate in a predictable AABB pattern (configurable run length). A small task label appears above the digit.

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | `"cued"` \| `"alternating"` | `"cued"` | Task variant |
| `showInstructions` | boolean | `true` | Show built-in instruction screens |
| `numTrials` | number | `80` | Number of test trials |
| `showPractice` | boolean | `true` | Include practice block |
| `numPracticeTrials` | number | `16` | Number of practice trials |
| `feedbackDuration` | number | `500` | Feedback display duration (ms) |
| `stimuli` | number[] | `[1,2,3,4,6,7,8,9]` | Digit stimuli |
| `csiDuration` | number | `500` | Cue-stimulus interval (ms), cued mode only |
| `fixationDuration` | number | `500` | Pre-cue fixation duration (ms) |
| `responseTimeout` | number | `3000` | Maximum response time (ms) |
| `iti` | number | `200` | Inter-trial interval (ms) |
| `proportionSwitch` | number | `0.5` | Proportion of switch trials (0-1) |
| `runLength` | number | `2` | Run length for alternating mode |
| `numBlocks` | number | `1` | Number of test blocks |
| `text` | object | See below | Customizable text strings |

## Examples

### Standard Cued Task Switching

```javascript
const task = jsPsychTimelineTaskSwitching.createTimeline(jsPsych, {
  mode: "cued",
  numTrials: 120,
  numBlocks: 2,
});
```

### Alternating Runs

```javascript
const task = jsPsychTimelineTaskSwitching.createTimeline(jsPsych, {
  mode: "alternating",
  runLength: 2,
  numTrials: 120,
});
```

### Mostly Repeat (low switch proportion)

```javascript
const task = jsPsychTimelineTaskSwitching.createTimeline(jsPsych, {
  proportionSwitch: 0.25,
  numTrials: 160,
});
```

## Data Output

### Trial Data

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | `"task-switching"` |
| `task_version` | string | Package version |
| `phase` | string | `"instructions"`, `"practice"`, `"test"`, or `"completion"` |
| `part` | string | `"fixation"`, `"cue"`, `"stimulus"`, `"feedback"`, `"iti"` |
| `block` | number | Block number (1-indexed) |
| `stimulus_number` | number | The digit shown |
| `current_task` | string | `"magnitude"` or `"parity"` |
| `previous_task` | string \| null | Previous trial's task |
| `switch_type` | string | `"switch"`, `"repeat"`, or `"first"` |
| `correct_response` | string | Expected button label |
| `correct` | boolean | Whether response was correct |
| `rt` | number \| null | Response time (ms) |

## Scoring

```javascript
const scores = jsPsychTimelineTaskSwitching.utils.scoring.getSummary(jsPsych.data.get());
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `accuracy` | Overall proportion correct |
| `meanRT` | Mean RT for correct trials (ms) |
| `switchRT` | Mean RT for correct switch trials |
| `repeatRT` | Mean RT for correct repeat trials |
| `switchAccuracy` | Accuracy on switch trials |
| `repeatAccuracy` | Accuracy on repeat trials |
| `switchCostRT` | switchRT - repeatRT |
| `switchCostAccuracy` | repeatAccuracy - switchAccuracy |
| `magnitudeRT` | Mean RT for magnitude task trials |
| `parityRT` | Mean RT for parity task trials |
| `magnitudeAccuracy` | Accuracy on magnitude trials |
| `parityAccuracy` | Accuracy on parity trials |
| `totalTrials` | Total number of test trials |
| `correctTrials` | Number of correct test trials |
| `blocks` | Per-block breakdown (if numBlocks > 1) |

### Interpretation

- **Positive switch cost (RT)**: Typical finding; switch trials are slower than repeat trials
- **Switch cost magnitude**: Typically 100-300 ms depending on preparation time
- **CSI manipulation**: Longer cue-stimulus intervals reduce (but rarely eliminate) switch costs
- **Task asymmetry**: Different switch costs for switching to magnitude vs. parity may indicate task difficulty differences

## Translation

```javascript
const spanishText = {
  instruction_intro: `<div class="instructions">
    <h2>Cambio de Tarea</h2>
    <p>En esta tarea, veras digitos individuales (1-9, excluyendo 5).</p>
  </div>`,
  continue_button: "Continuar",
  start_button: "Comenzar",
  button_low: "BAJO",
  button_high: "ALTO",
  button_odd: "IMPAR",
  button_even: "PAR",
  cue_magnitude: "TAMANO",
  cue_parity: "PAR/IMPAR",
  feedback_correct: "Correcto!",
  feedback_incorrect: "Incorrecto",
  feedback_timeout: "Muy lento!",
};

const task = jsPsychTimelineTaskSwitching.createTimeline(jsPsych, { text: spanishText });
```

## Timeline Units

For custom experiments:

```javascript
import { timelineUnits } from "@jspsych-timelines/task-switching";

// Available units:
// - createInstructionTrials(config)
// - createFixationTrial(jsPsych, config)
// - createCueTrial(jsPsych, config)
// - createCuedStimulusTrial(jsPsych, config, phase, blockNumber)
// - createAlternatingStimulusTrial(jsPsych, config, phase, blockNumber)
// - createFeedbackTrial(jsPsych, config)
// - createItiTrial(jsPsych, config)
// - createRestScreen(config, blockNumber)
// - createTransitionTrial(message, buttonLabel)
// - createPracticeBlock(jsPsych, config)
// - createTestBlock(jsPsych, config, blockNumber)
// - createCompletionTrial(jsPsych, config)
```

## Citation

If using in research, please cite:

> Monsell, S. (2003). Task switching. Trends in Cognitive Sciences, 7(3), 134-140.

> Meiran, N. (1996). Reconfiguration of processing mode prior to task performance. Journal of Experimental Psychology: Learning, Memory, and Cognition, 22(6), 1423-1442.

## License

MIT
