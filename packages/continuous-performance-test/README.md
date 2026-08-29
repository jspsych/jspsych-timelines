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
| `task_version` | string | Package version. Written on the rows that record a stimulus (`part` of `"stimulus"` or `"cue"`) and on the completion row; instruction, feedback and rest rows do not carry it |
| `phase` | string | `"instructions"`, `"practice"`, `"test"`, or `"completion"` |
| `part` | string | `"stimulus"`, `"cue"`, `"feedback"`, `"instruction"`, or `"rest"`. Absent on the `"instructions"` and `"completion"` rows |
| `trial_number` | number | Position of this trial within its block (1-indexed) |
| `stimulus_letter` | string | The letter shown |
| `stimulus_type` | string | `"target"` or `"nontarget"` |
| `is_target` | boolean | Whether a response was expected |
| `responded` | boolean | Whether participant responded |
| `rt` | number \| null | Response time (ms) |
| `correct` | boolean | Whether response was correct |
| `isi` | number | ISI used on this trial (ms) |
| `block` | number | Block number (1-indexed) |

#### Rows a run emits

Only `part: "stimulus"` rows are scored. Everything else is context.

| `phase` | `part` | When |
|---------|--------|------|
| `instructions` | — | The mode introduction, once, if `showInstructions` |
| `practice` | `instruction` | Practice preamble |
| `practice` | `cue` | AX mode only: the cue half of a practice pair |
| `practice` | `stimulus` | A practice stimulus (the probe, in AX mode) |
| `practice` | `feedback` | Per-trial practice feedback |
| `test` | `instruction` | Main-task preamble |
| `test` | `cue` | AX mode only: the cue half of a scored pair |
| `test` | `stimulus` | A scored stimulus — **the rows scoring reads** |
| `test` | `rest` | Between blocks, when `numBlocks > 1` |
| `completion` | — | The results screen |

#### Additional AX mode fields

| Field | Type | Description |
|-------|------|-------------|
| `ax_trial_type` | string | `"ax"`, `"ay"`, `"bx"`, or `"by"` |
| `ax_part` | string | `"cue"` or `"probe"` |

## Scoring

```javascript
const scores = jsPsychTimelineCPT.utils.scoring.getSummary(jsPsych.data.get());
```

`getSummary` returns the metrics below for the run as a whole, plus:

| Field | Type | Present when |
|-------|------|--------------|
| `taskName` | string | Always — `"continuous-performance-test"` |
| `version` | string | Always — the package version |
| `blockScores` | array of metric objects, one per block in order | `numBlocks > 1`. This is where the vigilance decrement below is read from |
| `axScores` | `{ ax, ay, bx, by }`, each a metric object | The run contains AX trials |

`utils.scoring.calculateScores` returns the overall metrics alone, without these.

#### Reading `axScores`

Each AX trial type holds only one class of trial: `ax` trials are all targets, and
`ay`, `bx` and `by` are all non-targets. So per type, `commissionRate` is `null` for
`ax`, `hitRate` is `null` for the other three, and `dPrime` is `null` for all four —
d-prime needs both classes and is reported at the top level instead. `meanRT` for a
type averages every response of that type, not only hits.

### Available Metrics

| Metric | Description |
|--------|-------------|
| `hits` | Number of correct responses to targets |
| `totalTargets` | Total target trials |
| `hitRate` | Hits / total targets; `null` if no target trials were shown |
| `omissionRate` | Missed targets / total targets; `null` if no target trials were shown |
| `commissions` | False alarm count |
| `totalNontargets` | Total non-target trials |
| `commissionRate` | False alarms / total non-targets; `null` if no non-target trials were shown |
| `meanRT` | Mean RT for hits (ms) |
| `rtStd` | RT standard deviation for hits |
| `dPrime` | d-prime sensitivity index (log-linear corrected) |
| `beta` | Response bias |

### Interpretation

- **High omission rate**: Inattention / lapses in vigilance
- **High commission rate**: Impulsivity / poor response inhibition
- **Low d-prime**: Poor discriminability between targets and non-targets
- **A `null` rate**: the trials it describes were never shown, which is not the same as a rate of 0
- **Decreasing hit rate across blocks**: Vigilance decrement (sustained attention failure) — compare `blockScores[i].hitRate` across `i`, which requires `numBlocks > 1`
- **In AX mode**: High BX errors suggest poor context maintenance — read `axScores.bx.commissionRate`

## Translation

Instruction, rest and results strings are HTML. Wrap copy in `cpt-instructions`
to pick up the built-in layout; every class this timeline styles is prefixed
`cpt-` and scoped to its own trials.

```javascript
const spanishText = {
  respond_button: "RESPONDER",
  // Strings that mention a configurable value are functions of that value, so the
  // button label and the target letter cannot drift out of sync with the config.
  instruction_standard: (targetLetter, respondLabel) => `
    <div class="cpt-instructions">
      <h2>Test de Rendimiento Continuo</h2>
      <p>Verás letras en la pantalla una a la vez.</p>
      <p>Toca el botón <strong>${respondLabel}</strong> cuando veas la letra <strong>${targetLetter}</strong>.</p>
      <p>No toques nada para otras letras.</p>
    </div>
  `,
  task_complete: "Tarea Completa",
};

const task = createTimeline(jsPsych, { text: spanishText });
```

### Text keys that take arguments

Most keys are plain strings. Keys whose wording depends on a configured value are
functions of that value, so a translation cannot desync from the config. Arguments
may be ignored — `() => "..."` is a valid override.

| Key | Signature |
|-----|-----------|
| `instruction_standard` | `(targetLetter, respondLabel) => string` |
| `instruction_inhibition` | `(noGoLetter, respondLabel) => string` |
| `instruction_ax` | `(cueLetter, probeLetter, respondLabel) => string` |
| `result_summary` | `(hitRate, commissionRate, dPrime, averageRT) => string` — rates may be `null` |

## Timeline Units

For custom experiments:

Every unit takes the same options object as `createTimeline` and fills in the
defaults for anything you leave out, so there is no separate config type to build.
Options are validated on the way in.

| Unit | Signature |
|------|-----------|
| `createInstructionTrials` | `(options?, part?) => trial` — `part` is `"intro"`, `"practice"` or `"main"` (default `"intro"`) |
| `createPracticeBlock` | `(jsPsych, options?) => { timeline }` — `numPracticeTrials` trials with feedback |
| `createTestBlock` | `(jsPsych, options?, block?) => { timeline }` — one block of `numTrials` trials, labelled `block` (default `1`) |
| `createRestScreen` | `(options?) => trial` |
| `createCompletionTrial` | `(jsPsych, options?) => trial` |

```javascript
import { timelineUnits, utils } from "@jspsych-timelines/continuous-performance-test";

const options = { mode: "inhibition", numTrials: 60, nontargetProbability: 0.1 };

const timeline = [
  timelineUnits.createInstructionTrials(options, "intro"),
  timelineUnits.createTestBlock(jsPsych, options, 1),
  timelineUnits.createRestScreen(options),
  timelineUnits.createTestBlock(jsPsych, options, 2),
  timelineUnits.createCompletionTrial(jsPsych, options),
];

// the same options build a bare sequence, if you are assembling trials yourself
const sequence = utils.sequence.generateTrialSequence(options, 60);
```

## Citation

If using in research, please cite the relevant variant:

> Rosvold, H. E., Mirsky, A. F., Sarason, I., Bransome Jr, E. D., & Beck, L. H. (1956). A continuous performance test of brain damage. Journal of Consulting Psychology, 20(5), 343-350.

> Conners, C. K. (2000). Conners' Continuous Performance Test II (CPT II). Multi-Health Systems.

> Servan-Schreiber, D., Cohen, J. D., & Steingard, S. (1996). Schizophrenic deficits in the processing of context: A test of a theoretical model. Archives of General Psychiatry, 53(12), 1105-1112.

## License

MIT
