# Continuous Performance Test (CPT)

A jsPsych implementation of the Continuous Performance Test, a measure of sustained attention, vigilance, and response inhibition. Supports three major CPT variants through parameterization: standard (Rosvold/TOVA-style), inhibition (Conners CPT-style), and AX-CPT.

## Installation

```bash
npm install @jspsych-timelines/continuous-performance-test
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/jspsych@8"></script>
  <script src="https://unpkg.com/@jspsych-timelines/continuous-performance-test"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych@8/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych();
  const task = jsPsychTimelineCPT.createTimeline(jsPsych);
  jsPsych.run([task]);
</script>
</html>
```

## Task Description

Letters appear one at a time on screen. Participants tap a button to respond or withhold based on the task rules. The three modes implement different CPT paradigms:

### Standard Mode (default)

Respond only when the target letter (default: "X") appears. All other letters require withholding. The target is rare (~20% of trials). This is a classic vigilance/sustained attention task.

### Inhibition Mode

Respond to every letter *except* the designated non-target (default: "X"). The non-target is rare (~10% of trials). This emphasizes response inhibition — participants build a prepotent "go" response and must occasionally suppress it.

### AX Mode

Respond only when the probe letter "X" appears immediately after the cue letter "A". Other combinations (AY, BX, BY) require withholding. This adds context-maintenance and working memory demands.

## Parameters

### Core Parameters (all modes)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | string | `"standard"` | CPT variant: `"standard"`, `"inhibition"`, or `"ax"` |
| `showInstructions` | boolean | `true` | Show built-in instructions |
| `numTrials` | number | `100` | Total number of trials (in AX mode, number of cue-probe pairs) |
| `stimulusDuration` | number | `250` | Duration stimulus is visible (ms) |
| `isiMin` | number | `1000` | Minimum inter-stimulus interval (ms) |
| `isiMax` | number | `1000` | Maximum ISI (ms); if equal to isiMin, ISI is fixed |
| `isiSet` | number[] | `null` | If provided, overrides isiMin/isiMax; ISI sampled from this set |
| `showFixation` | boolean | `true` | Show fixation cross during ISI |
| `showPractice` | boolean | `true` | Include practice trials |
| `numPracticeTrials` | number | `10` | Number of practice trials |
| `feedbackDuration` | number | `1000` | Feedback display duration during practice (ms) |
| `numBlocks` | number | `1` | Number of test blocks (rest screens between blocks) |
| `text` | object | See below | Customizable text strings |

### Standard Mode Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `targetLetter` | string | `"X"` | The target stimulus to respond to |
| `targetProbability` | number | `0.2` | Proportion of trials that are targets |
| `stimuliPool` | string[] | `["A"-"O"]` | Non-target letter pool |

### Inhibition Mode Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `targetLetter` | string | `"X"` | The non-target stimulus to withhold for |
| `nontargetProbability` | number | `0.1` | Proportion of no-go trials |
| `stimuliPool` | string[] | `["A"-"O"]` | Go stimulus letter pool |

### AX Mode Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cueLetter` | string | `"A"` | Cue that signals a potential target |
| `probeLetter` | string | `"X"` | Target probe (respond only after cue) |
| `axProbability` | number | `0.4` | Proportion of AX (target) trials |
| `ayProbability` | number | `0.2` | Proportion of AY trials |
| `bxProbability` | number | `0.2` | Proportion of BX trials |
| `byProbability` | number | `0.2` | Proportion of BY trials |
| `cueDelay` | number | `1000` | Delay between cue and probe (ms) |
| `nonCueLetters` | string[] | `["B"-"H"]` | Non-cue letter pool |
| `nonProbeLetters` | string[] | `["K"-"Q"]` | Non-probe letter pool |

## Examples

### Conners-style CPT (inhibition with variable ISI)

```javascript
const task = jsPsychTimelineCPT.createTimeline(jsPsych, {
  mode: "inhibition",
  numTrials: 360,
  isiSet: [1000, 2000, 4000],
  numBlocks: 6,
});
```

### AX-CPT with longer cue-probe delay

```javascript
const task = jsPsychTimelineCPT.createTimeline(jsPsych, {
  mode: "ax",
  numTrials: 120,
  cueDelay: 3000,
  numBlocks: 4,
});
```

### Short screening version

```javascript
const task = jsPsychTimelineCPT.createTimeline(jsPsych, {
  mode: "standard",
  numTrials: 50,
  numPracticeTrials: 5,
});
```

## Data Output

### Trial Data

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | `"continuous-performance-test"` |
| `task_version` | string | Package version |
| `phase` | string | `"practice"`, `"test"`, or `"completion"` |
| `part` | string | `"stimulus"`, `"cue"`, `"feedback"`, or `"rest"` |
| `trial_index` | number | Trial number within the block |
| `stimulus_letter` | string | The letter shown |
| `stimulus_type` | string | `"target"` or `"nontarget"` |
| `is_target` | boolean | Whether a response was expected |
| `responded` | boolean | Whether participant responded |
| `rt` | number \| null | Response time (ms) |
| `correct` | boolean | Whether response was correct |
| `isi` | number | ISI used on this trial (ms) |
| `block` | number | Block number (1-indexed) |

#### Additional AX mode fields

| Field | Type | Description |
|-------|------|-------------|
| `ax_trial_type` | string | `"ax"`, `"ay"`, `"bx"`, or `"by"` |
| `ax_part` | string | `"cue"` or `"probe"` |

## Scoring

```javascript
const scores = jsPsychTimelineCPT.utils.scoring.getSummary(jsPsych.data.get());
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `hits` | Number of correct responses to targets |
| `totalTargets` | Total target trials |
| `hitRate` | Hits / total targets |
| `omissionRate` | Missed targets / total targets |
| `commissions` | False alarm count |
| `totalNontargets` | Total non-target trials |
| `commissionRate` | False alarms / total non-targets |
| `meanRT` | Mean RT for hits (ms) |
| `rtStd` | RT standard deviation for hits |
| `dPrime` | d-prime sensitivity index (log-linear corrected) |
| `beta` | Response bias |

### Interpretation

- **High omission rate**: Inattention / lapses in vigilance
- **High commission rate**: Impulsivity / poor response inhibition
- **Low d-prime**: Poor discriminability between targets and non-targets
- **Decreasing hit rate across blocks**: Vigilance decrement (sustained attention failure)
- **In AX mode**: High BX errors suggest poor context maintenance

## Translation

```javascript
const spanishText = {
  respond_button: "RESPONDER",
  instruction_standard: `
    <div class="instructions">
      <h2>Test de Rendimiento Continuo</h2>
      <p>Verás letras en la pantalla una a la vez.</p>
      <p>Toca el botón <strong>RESPONDER</strong> cuando veas la letra <strong>X</strong>.</p>
      <p>No toques nada para otras letras.</p>
    </div>
  `,
  task_complete: "Tarea Completa",
};

const task = createTimeline(jsPsych, { text: spanishText });
```

## Timeline Units

For custom experiments:

```javascript
import { timelineUnits } from "@jspsych-timelines/continuous-performance-test";

// Available units:
// - createInstructionTrials(config, mode)
// - createPracticeBlock(jsPsych, config)
// - createTestBlock(jsPsych, config, trialSequence, blockNum)
// - createRestScreen(config)
// - createCompletionTrial(jsPsych, config)
```

## Citation

If using in research, please cite the relevant variant:

> Rosvold, H. E., Mirsky, A. F., Sarason, I., Bransome Jr, E. D., & Beck, L. H. (1956). A continuous performance test of brain damage. Journal of Consulting Psychology, 20(5), 343-350.

> Conners, C. K. (2000). Conners' Continuous Performance Test II (CPT II). Multi-Health Systems.

> Servan-Schreiber, D., Cohen, J. D., & Steingard, S. (1996). Schizophrenic deficits in the processing of context: A test of a theoretical model. Archives of General Psychiatry, 53(12), 1105-1112.

## License

MIT
