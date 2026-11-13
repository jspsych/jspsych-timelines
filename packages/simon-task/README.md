# Simon Task

A jsPsych implementation of the Simon Task, measuring spatial stimulus-response compatibility and cognitive control. Colored stimuli appear at lateralized positions, and participants respond based on color while ignoring position. The Simon effect emerges when stimulus position conflicts with the response button location.

## Installation

```bash
npm install @jspsych-timelines/simon-task
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/jspsych@8"></script>
  <script src="https://unpkg.com/@jspsych-timelines/simon-task"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych@8/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych();
  const task = jsPsychTimelineSimonTask.createTimeline(jsPsych);
  jsPsych.run([task]);
</script>
</html>
```

## Task Description

On each trial, a colored circle (e.g., red or blue) appears on either the left or right side of the screen. Participants respond by tapping the button matching the stimulus color, ignoring where the circle appears.

- **Congruent trials**: The stimulus appears on the same side as its response button (e.g., red circle on the left, where the RED button is).
- **Incongruent trials**: The stimulus appears on the opposite side from its response button (e.g., red circle on the right, but the RED button is on the left).
- **Neutral trials** (optional): The stimulus appears at screen center.

The **Simon effect** is the difference in RT (and accuracy) between incongruent and congruent trials, reflecting the cost of overriding an automatic spatial response tendency.

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `showInstructions` | boolean | `true` | Show built-in instruction screens |
| `showPracticeFeedback` | boolean | `true` | Show feedback during practice |
| `showTestFeedback` | boolean | `false` | Show feedback during test |
| `numPracticeTrials` | number | `12` | Number of practice trials (set to 0 to skip) |
| `numTestTrials` | number | `100` | Number of test trials |
| `numBlocks` | number | `1` | Number of test blocks (rest screens between blocks) |
| `fixationDuration` | number | `500` | Fixation cross duration (ms) |
| `responseDuration` | number | `2000` | Maximum response time (ms) |
| `feedbackDuration` | number | `400` | Feedback display duration (ms) |
| `interTrialInterval` | number | `1000` | Inter-trial interval (ms) |
| `includeNeutral` | boolean | `false` | Include neutral (center) position trials |
| `proportionCongruent` | number | `0.5` | Proportion of congruent trials (0-1) |
| `maxConsecutiveSameType` | number | `4` | Maximum consecutive trials of the same congruency type |
| `stimulusFeatures` | array | See below | Two stimulus features defining colors and button mapping |
| `text` | object | See below | Customizable text strings |

### Stimulus Features

Default stimulus features:

```javascript
[
  { value: "#D32F2F", label: "RED", side: "left" },
  { value: "#1976D2", label: "BLUE", side: "right" }
]
```

Each feature has:
- `value`: CSS color string for the stimulus circle
- `label`: Button label text
- `side`: Which side ("left" or "right") the response button is on

## Examples

### Standard Simon Task

```javascript
const task = jsPsychTimelineSimonTask.createTimeline(jsPsych, {
  numTestTrials: 120,
  numBlocks: 2,
});
```

### With neutral trials

```javascript
const task = jsPsychTimelineSimonTask.createTimeline(jsPsych, {
  includeNeutral: true,
  numTestTrials: 150,
});
```

### Mostly congruent (proportion manipulation)

```javascript
const task = jsPsychTimelineSimonTask.createTimeline(jsPsych, {
  proportionCongruent: 0.75,
  numTestTrials: 200,
});
```

### Custom colors

```javascript
const task = jsPsychTimelineSimonTask.createTimeline(jsPsych, {
  stimulusFeatures: [
    { value: "#4CAF50", label: "GREEN", side: "left" },
    { value: "#FF9800", label: "ORANGE", side: "right" },
  ],
});
```

## Data Output

### Trial Data

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | `"simon-task"` |
| `task_version` | string | Package version |
| `phase` | string | `"instructions"`, `"practice"`, `"test"`, or `"completion"` |
| `part` | string | `"fixation"`, `"stimulus"`, `"feedback"`, `"iti"`, `"rest"` |
| `block` | number | Block number (1-indexed) |
| `trial` | number | Trial number within the block |
| `stimulus_color` | string | CSS color of the stimulus |
| `stimulus_label` | string | Label of the stimulus color (e.g., "RED") |
| `stimulus_side` | string | Position where stimulus appeared: `"left"`, `"right"`, or `"center"` |
| `congruence` | string | `"congruent"`, `"incongruent"`, or `"neutral"` |
| `correct_response` | number | Expected button index (0 = left, 1 = right) |
| `response` | number \| null | Participant's button index |
| `correct` | boolean | Whether response was correct |
| `rt` | number \| null | Response time (ms) |

## Scoring

```javascript
const scores = jsPsychTimelineSimonTask.utils.scoring.getSummary(jsPsych.data.get());
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `accuracy` | Overall proportion correct |
| `meanRT` | Mean RT for correct trials (ms) |
| `congruentAccuracy` | Accuracy on congruent trials |
| `incongruentAccuracy` | Accuracy on incongruent trials |
| `neutralAccuracy` | Accuracy on neutral trials (null if none) |
| `congruentRT` | Mean RT for correct congruent trials |
| `incongruentRT` | Mean RT for correct incongruent trials |
| `neutralRT` | Mean RT for correct neutral trials (null if none) |
| `simonEffectRT` | Incongruent RT - Congruent RT |
| `simonEffectAccuracy` | Congruent accuracy - Incongruent accuracy |
| `facilitationRT` | Neutral RT - Congruent RT (null if no neutral) |
| `interferenceRT` | Incongruent RT - Neutral RT (null if no neutral) |
| `totalTrials` | Total number of test trials |
| `correctTrials` | Number of correct test trials |

### Interpretation

- **Positive Simon effect (RT)**: Typical spatial interference; incongruent trials are slower
- **Simon effect magnitude**: Typically 20-40 ms in healthy adults
- **Facilitation vs. interference**: With neutral trials, decompose the Simon effect into facilitation (congruent faster than neutral) and interference (incongruent slower than neutral)
- **Proportion congruent effect**: Larger Simon effect with mostly-congruent blocks; reflects strategic control adjustments

## Translation

```javascript
const spanishText = {
  instruction_intro: `<div class="instructions">
    <h2>Tarea de Simon</h2>
    <p>En esta tarea, aparecera un circulo de color a la izquierda o derecha de la pantalla.</p>
    <p>Tu trabajo es identificar el <strong>color</strong> del circulo e ignorar su posicion.</p>
  </div>`,
  continue_button: "Continuar",
  correct_feedback: "Correcto!",
  incorrect_feedback: "Incorrecto",
  timeout_feedback: "Muy lento!",
};

const task = jsPsychTimelineSimonTask.createTimeline(jsPsych, { text: spanishText });
```

## Timeline Units

For custom experiments:

```javascript
import { timelineUnits } from "@jspsych-timelines/simon-task";

// Available units:
// - createInstructionTrials(config)
// - createFixationTrial(config)
// - createStimulusTrial(jsPsych, config, phase, blockNumber)
// - createFeedbackTrial(jsPsych, config)
// - createItiTrial(config)
// - createRestScreen(config, blockNumber)
// - createTransitionTrial(message, buttonLabel)
// - createPracticeBlock(jsPsych, config)
// - createTestBlock(jsPsych, config, blockNumber)
// - createCompletionTrial(jsPsych, config)
```

## Citation

If using in research, please cite:

> Simon, J. R. (1969). Reactions toward the source of stimulation. Journal of Experimental Psychology, 81(1), 174-176.

> Simon, J. R., & Rudell, A. P. (1967). Auditory S-R compatibility: The effect of an irrelevant cue on information processing. Journal of Applied Psychology, 51(3), 300-304.

## License

MIT
