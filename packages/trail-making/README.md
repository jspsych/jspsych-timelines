# Trail Making Test (TMT)

A jsPsych implementation of the Trail Making Test, a neuropsychological test of visual attention and task switching. Based on Reitan (1958).

## Installation

```bash
npm install @jspsych-timelines/trail-making
```

## Quick Start

```javascript
import { initJsPsych } from "jspsych";
import { createTimeline, utils } from "@jspsych-timelines/trail-making";

const jsPsych = initJsPsych({
  on_finish: () => {
    const scores = utils.scoring.getSummary(jsPsych.data.get());
    console.log(scores);
  },
});

const timeline = createTimeline(jsPsych);
jsPsych.run([timeline]);
```

## Task Description

The Trail Making Test consists of two parts:

### Part A (Numbers)
Participants connect circles containing numbers in sequential order (1→2→3→4...).

### Part B (Numbers and Letters)
Participants connect circles alternating between numbers and letters (1→A→2→B→3→C...).

Part B requires task-switching between number and letter sequences, making it more cognitively demanding than Part A.

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `showInstructions` | boolean | `true` | Show built-in instructions |
| `showPractice` | boolean | `true` | Include practice trials |
| `practiceTargets` | number | `5` | Number of targets in practice |
| `numTargetsPartA` | number | `25` | Targets in Part A |
| `numTargetsPartB` | number | `24` | Targets in Part B (should be even) |
| `canvasWidth` | number | `600` | Canvas width in pixels |
| `canvasHeight` | number | `600` | Canvas height in pixels |
| `targetRadius` | number | `25` | Circle radius in pixels |
| `minSeparation` | number | `80` | Minimum distance between targets |
| `seedPartA` | number | `null` | Random seed for Part A layout |
| `seedPartB` | number | `null` | Random seed for Part B layout |
| `skipPartA` | boolean | `false` | Skip Part A |
| `skipPartB` | boolean | `false` | Skip Part B |
| `text` | object | See below | Customizable text strings |

## Data Output

### Trial Data

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | `"trail-making"` |
| `task_version` | string | Package version |
| `part` | string | `"A"` or `"B"` |
| `phase` | string | `"practice"` or `"test"` |
| `completion_time` | number | Time to complete in ms |
| `num_errors` | number | Number of incorrect clicks |
| `total_path_distance` | number | Total path distance in pixels |
| `inter_click_times` | number[] | Times between correct clicks |
| `targets` | object[] | Target positions used |
| `clicks` | object[] | Detailed click log |

## Scoring

```javascript
import { utils } from "@jspsych-timelines/trail-making";

const scores = utils.scoring.getSummary(jsPsych.data.get());
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `partA.completionTime` | Part A completion time (ms) |
| `partA.numErrors` | Part A errors |
| `partA.pathDistance` | Part A path distance |
| `partA.meanInterClickTime` | Mean time between clicks |
| `partB.completionTime` | Part B completion time (ms) |
| `partB.numErrors` | Part B errors |
| `partB.pathDistance` | Part B path distance |
| `partB.meanInterClickTime` | Mean time between clicks |
| `differenceScore` | Part B time - Part A time |
| `ratioScore` | Part B time / Part A time |

### Derived Scores

**Difference Score (B-A):** Measures the additional time needed for task-switching. Higher scores indicate greater task-switching cost.

**Ratio Score (B/A):** Normalizes for individual differences in processing speed. Typically ranges from 2-3 in healthy adults.

## Translation

```javascript
const spanishText = {
  instruction_intro: "<p>En esta tarea, conectará círculos en orden...</p>",
  instruction_part_a: "<p>Parte A: Conecte los números en orden...</p>",
  instruction_part_b: "<p>Parte B: Alterne entre números y letras...</p>",
  continue_button: "Continuar",
  start_button: "Comenzar",
};

const timeline = createTimeline(jsPsych, { text: spanishText });
```

## Timeline Units

For custom experiments:

```javascript
import { timelineUnits } from "@jspsych-timelines/trail-making";

// Available units:
// - createInstructionTrials(config, part)
// - createPracticeInstructions(config)
// - createSpeedReminder(config)
// - createTrailTrial(config, part, phase)
// - createTransitionTrial(message, buttonLabel)
// - createCompletionTrial(jsPsych, config)
```

## Clinical Notes

### Standard Administration
- Part A: 25 targets (numbers 1-25)
- Part B: 24 targets (numbers 1-13 and letters A-L)
- Standard paper version has fixed target positions

### Age Norms
Completion times vary significantly by age and education. See Tombaugh (2004) for normative data.

### Error Handling
The original TMT requires the examiner to point out errors and have the participant correct them. This implementation provides visual error feedback (red flash) and the participant must continue from their last correct response.

## Citation

If using in research, please cite:

> Reitan, R. M. (1958). Validity of the Trail Making Test as an indicator of organic brain damage. Perceptual and Motor Skills, 8(3), 271-276.

## References

1. Reitan, R. M. (1958). Validity of the Trail Making Test as an indicator of organic brain damage. Perceptual and Motor Skills, 8(3), 271-276.
2. Tombaugh, T. N. (2004). Trail Making Test A and B: normative data stratified by age and education. Archives of Clinical Neuropsychology, 19(2), 203-214.
3. Arbuthnott, K., & Frank, J. (2000). Trail Making Test, part B as a measure of executive control: Validation using a set-switching paradigm. Journal of Clinical and Experimental Neuropsychology, 22(4), 518-528.

## License

MIT
