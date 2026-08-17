# Go/No-Go Timeline

A jsPsych implementation of the Go/No-Go task for measuring response inhibition and sustained attention.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Trial Structure](#trial-structure)
- [API Reference](#api-reference)
- [Configuration Options](#configuration-options)
- [Validation](#validation)
- [Data Generated](#data-generated)
- [Scoring](#scoring)
- [Styling](#styling)
- [Examples](#examples)

## Overview

The Go/No-Go task measures response inhibition by requiring participants to respond quickly to a Go stimulus while withholding responses to a No-Go stimulus. Go trials are the majority (75% by default), which builds a prepotent tendency to respond; the No-Go trials then measure the ability to suppress it.

The two error types are reported separately:

- **Commission errors** (false alarms) — responding on a No-Go trial. The inhibition measure.
- **Omission errors** (misses) — failing to respond on a Go trial. Usually an attention or engagement measure.

## Installation

### NPM

```bash
npm install @jspsych-timelines/go-nogo
```

### CDN

```html
<script src="https://unpkg.com/@jspsych-timelines/go-nogo"></script>
```

Styles are bundled into the package and applied on import. There is no separate CSS file to load.

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/jspsych@8"></script>
  <script src="https://unpkg.com/@jspsych-timelines/go-nogo"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych@8/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych({
    on_finish: () => jsPsych.data.displayData()
  });

  const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych, {
    show_instructions: true,
    show_practice: true,
    show_debrief: true,
    num_blocks: 2,
    num_trials: 30
  });

  jsPsych.run(timeline);
</script>
</html>
```

## Trial Structure

With every section enabled, `createTimeline` produces:

1. **Instructions** (`show_instructions`) — an interactive Go example, then a No-Go example. Each repeats until the participant gets it right, then a completion screen.
2. **Practice block** (`show_practice`) — `num_practice_trials` trials in the same format as the main task, followed by an end-of-practice screen.
3. **Experimental blocks** — `num_blocks` blocks of `num_trials` trials, separated by breaks.
4. **Debrief** (`show_debrief`) — Go accuracy, No-Go accuracy and commission errors.

Each stimulus trial is three screens:

```
fixation (fixation_duration)  →  stimulus (trial_timeout)  →  blank (isi_duration)
```

The fixation and blank screens reserve the same `stimulus_container_height` as the stimulus so nothing shifts, and their response button is rendered disabled — a response there would land on a row that scoring does not read.

## API Reference

### createTimeline(jsPsych, config)

Creates the complete Go/No-Go task timeline.

**Parameters**

- `jsPsych` (JsPsych) — the jsPsych instance
- `config` (GoNoGoConfig, optional) — see [Configuration Options](#configuration-options)

**Returns** `{ timeline }`, ready for `jsPsych.run()`.

### createInstructions(instructions?, texts?)

Creates standalone instruction pages. Both arguments are optional and default to the text config.

```javascript
const instructions = jsPsychTimelineGoNoGo.createInstructions();

// or with your own pages
const custom = jsPsychTimelineGoNoGo.createInstructions([
  "Press the button when you see the circle.",
  "Do nothing when you see the octagon."
]);
```

### timelineUnits

```javascript
const { createPractice, createDebrief } = jsPsychTimelineGoNoGo.timelineUnits;

const practice = createPractice({ go_practice_timeout: 15000 });
const debrief = createDebrief(jsPsych);
```

| Unit | Signature |
| --- | --- |
| `createInstructions` | `(pages?, texts?)` |
| `createPractice` | `({ go_stimulus?, nogo_stimulus?, go_stimuli?, nogo_stimuli?, texts?, go_practice_timeout?, nogo_practice_timeout? })` |
| `createGoPractice` | `(stimulus, texts?, timeout?)` |
| `createNoGoPractice` | `(stimulus, texts?, timeout?)` |
| `createPracticeCompletion` | `(texts?)` |
| `createEndOfPractice` | `(texts?)` |
| `createGoNoGo` | `(jsPsych, buttonText, trialTimeout, stimulusDuration?)` |
| `createFixation` | `(jsPsych, duration, buttonText, showButton?, height?, fixationSize?)` |
| `createISIBlank` | `(jsPsych, duration, buttonText, showButton?, height?)` |
| `createBlockBreak` | `(blockNum, numBlocks, duration?, texts?)` |
| `createDebrief` | `(jsPsych, texts?)` |

`createPractice` returns an **array** of timeline nodes, so spread it when composing:

```javascript
const practice = jsPsychTimelineGoNoGo.timelineUnits.createPractice();
const mainTask = jsPsychTimelineGoNoGo.createTimeline(jsPsych, { show_practice: false });

jsPsych.run([...practice, mainTask]);
```

### utils

```javascript
const { scoring, createStimulusHTML, shapes, trial_text, constants } =
  jsPsychTimelineGoNoGo.utils;

const goHtml = createStimulusHTML("GO", true);
const nogoHtml = createStimulusHTML("STOP", false);
const summary = scoring.getSummary(jsPsych.data.get());
```

| Member | Purpose |
| --- | --- |
| `utils.scoring.calculateScores(data)` | Score a `DataCollection` |
| `utils.scoring.getSummary(data)` | Score, plus `taskName` and `version` |
| `utils.createStimulusHTML(html, isGoTrial, height?)` | Wrap stimulus content in the standard container |
| `utils.createTimelineVariables(...)` | Generate one block's shuffled trial list |
| `utils.shapes` | `circle`, `octagon`, `square` |
| `utils.trial_text` | Default text object |
| `utils.constants` | `TASK_NAME`, `VERSION` |

TypeScript users can import the `TextConfig` and `ScoringResult` types.

## Configuration Options

### Structure

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `show_instructions` | boolean | `false` | Include the interactive examples |
| `show_practice` | boolean | `false` | Include a practice block |
| `show_debrief` | boolean | `false` | Show the scored summary |
| `num_blocks` | number | `3` | Experimental blocks |
| `num_trials` | number | `50` | Trials per experimental block |
| `num_practice_trials` | number | `10` | Trials in the practice block |
| `probability` | number | `0.75` | Proportion of Go trials, experimental blocks |
| `practice_probability` | number | `0.75` | Proportion of Go trials, practice block |

### Timing (milliseconds)

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `trial_timeout` | number | `500` | Response window for a stimulus trial |
| `stimulus_duration` | number \| null | `null` | Time the stimulus stays visible; `null` means until response or timeout |
| `fixation_duration` | number | `500` | Fixation cross before each stimulus |
| `isi_duration` | number | `0` | Blank screen after each stimulus |
| `block_break_duration` | number \| null | `null` | `null` for a continue button, a number for a countdown |
| `go_practice_timeout` | number | `10000` | Response window in the Go example |
| `nogo_practice_timeout` | number | `3000` | Withholding window in the No-Go example |

`stimulus_duration` is independent of `trial_timeout`: set it to `200` with a `trial_timeout` of `1000` to flash the stimulus briefly while still accepting a response for a full second.

### Stimuli and appearance

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `go_stimulus` | HTML string | `utils.shapes.circle` | Single Go stimulus |
| `nogo_stimulus` | HTML string | `utils.shapes.octagon` | Single No-Go stimulus |
| `go_stimuli` | HTML string[] | — | Several Go stimuli, rotated. Overrides `go_stimulus` |
| `nogo_stimuli` | HTML string[] | — | Several No-Go stimuli, rotated. Overrides `nogo_stimulus` |
| `stimulus_container_height` | string | `"25vh"` | Height reserved for the stimulus |
| `fixation_size` | string | `"3em"` | Fixation cross font size |
| `show_button_during_fixation` | boolean | `true` | Render the button, disabled, on fixation and ISI screens |

### Text

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | Partial\<TextConfig\> | `{}` | Merged over `utils.trial_text` |

Seven strings name the default shapes and are **not** derived from the stimulus options: `instructions_pages`, `goPageContent`, `goSuccess`, `goFailure`, `noGoPageContent`, `noGoSuccess`, `noGoFailure`. Override them alongside any stimulus change, or the practice screens will describe a shape the participant is not being shown.

## Validation

`createTimeline` throws on invalid configuration rather than producing an unusable dataset. Messages are prefixed `[go-nogo]`.

| Rule | Example failure |
| --- | --- |
| `num_blocks` integer `>= 1` | `num_blocks: 0` |
| `num_trials` integer `>= 1` | `num_trials: 10.5` |
| `num_practice_trials` integer `>= 1`, when `show_practice` | `num_practice_trials: 0` |
| `probability` in `[0, 1]` | `probability: 1.5`, `NaN` |
| `practice_probability` in `[0, 1]`, when `show_practice` | `practice_probability: -0.1` |
| Durations non-negative | `fixation_duration: -1` |
| `stimulus_duration`, `block_break_duration` non-negative or `null` | `stimulus_duration: -1` |

`probability` of exactly `0` or `1` is permitted. A pure block is a legitimate design — an all-Go block gives simple RT as a baseline for the mixed blocks — and rounding produces one at extreme values anyway (`0.96` over 10 trials yields 10 Go, 0 No-Go).

## Data Generated

Every row carries `task: "go-nogo"`. `phase` marks the section and `part` the screen:

| `phase` | `part` |
| --- | --- |
| `instructions` | `go-practice`, `nogo-practice`, `success`, `failure`, `completion` |
| `practice` | `fixation`, `go`, `nogo`, `isi-blank`, `end-of-practice` |
| `test` | `fixation`, `go`, `nogo`, `isi-blank`, `block-break` |
| `completion` | *(none)* — the debrief |

### Scored trial fields

Rows with a `part` of `go` or `nogo`:

| Property | Type | Description |
| --- | --- | --- |
| `task` | string | Always `"go-nogo"` |
| `task_version` | string | Package version that produced the row |
| `phase` | string | `"practice"` or `"test"` |
| `part` | string | `"go"` or `"nogo"` |
| `is_go_trial` | boolean | `true` on Go trials |
| `block_number` | number | 1-indexed; `0` for the practice block |
| `response` | number \| null | `0` if pressed, `null` if not |
| `rt` | number \| null | Response time in ms |
| `correct` | boolean | Pressed on Go, or withheld on No-Go |

Plus the fields jsPsych adds to every row: `trial_type`, `trial_index`, `plugin_version`, `time_elapsed`.

`fixation`, `isi-blank` and `block-break` rows are timing screens. They carry `task`, `task_version`, `phase` and `part` but no `is_go_trial` or `correct`, and are excluded from scoring.

## Scoring

```javascript
const jsPsych = initJsPsych({
  on_finish: () => {
    const summary = jsPsychTimelineGoNoGo.utils.scoring.getSummary(jsPsych.data.get());
    console.log("Go/No-Go Results:", summary);
  }
});
```

| Field | Description |
| --- | --- |
| `goAccuracy` | Correct Go responses / Go trials |
| `nogoAccuracy` | Correct withholds / No-Go trials |
| `overallAccuracy` | Correct / all scored trials |
| `meanGoRT` | Mean RT over correct Go trials, rounded |
| `totalTrials` | Scored trials |
| `goTrials`, `nogoTrials` | Counts by type |
| `correctGoTrials`, `correctNogoTrials` | Correct counts by type |
| `commissionErrors` | Responded on a No-Go trial |
| `omissionErrors` | Failed to respond on a Go trial |
| `taskName`, `version` | `getSummary` only |

Only `phase: "test"` rows with a `part` of `go` or `nogo` are counted, so practice trials and timing screens never enter the totals.

**Zero is ambiguous.** An accuracy is `0` both when the participant got everything wrong and when that trial type was never presented; `meanGoRT` is `0` both for a real mean of zero and when no Go trial was answered correctly. Check the corresponding count first:

```javascript
const s = jsPsychTimelineGoNoGo.utils.scoring.getSummary(jsPsych.data.get());
const nogoAccuracy = s.nogoTrials > 0 ? s.nogoAccuracy : null;
const meanRT = s.correctGoTrials > 0 ? s.meanGoRT : null;
```

## Styling

Styles are bundled and applied on import. Every rule is scoped under `.jspsych-go-nogo`, a class added to this package's trials and removed when each trial ends, so nothing leaks into other tasks.

Classes written into the DOM, all prefixed, available as hooks:

| Class | Element |
| --- | --- |
| `.jspsych-go-nogo-instructions` | Instruction and result text container |
| `.jspsych-go-nogo-stimulus` | Stimulus container |
| `.jspsych-go-nogo-fixation` | Fixation cross |
| `.jspsych-go-nogo-isi-blank` | Blank ISI screen |
| `.jspsych-go-nogo-transition` | Practice completion and end-of-practice screens |
| `.jspsych-go-nogo-block-break` | Between-block break |
| `.jspsych-go-nogo-debrief` | Debrief container |
| `.jspsych-go-nogo-feedback` | Practice feedback line |
| `.jspsych-go-nogo-feedback-correct` | Correct feedback |
| `.jspsych-go-nogo-feedback-incorrect` | Incorrect feedback |

To restyle, load your own sheet after the package:

```css
.jspsych-go-nogo .jspsych-go-nogo-fixation {
  color: #666;
}
```

## Examples

### Minimal

```javascript
const jsPsych = initJsPsych();
const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych);
jsPsych.run(timeline);
```

### Full task with practice

```javascript
const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych, {
  show_instructions: true,
  show_practice: true,
  show_debrief: true,
  num_blocks: 2,
  num_trials: 40,
  probability: 0.8
});

jsPsych.run(timeline);
```

### Custom stimuli and timing

```javascript
const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych, {
  go_stimulus: '<span style="color: green; font-size: 60px;">&#10003;</span>',
  nogo_stimulus: '<span style="color: red; font-size: 60px;">&#10007;</span>',
  trial_timeout: 1000,
  stimulus_duration: 200,
  fixation_duration: 400,
  isi_duration: 300,
  // the practice text names the default shapes, so override it to match
  text: {
    goPageContent: "<b>GO Trials</b><br>When you see the check mark, click as fast as you can!",
    goSuccess: "Perfect! You clicked quickly for the check mark.",
    goFailure: "You failed to click in time for the check mark.",
    noGoPageContent: "<b>NO-GO Trials</b><br>When you see the cross, do NOT click!",
    noGoSuccess: "Excellent! You correctly did NOT click for the cross.",
    noGoFailure: "Remember, you should NOT click for the cross!"
  }
});

jsPsych.run(timeline);
```

### Rotating through several stimuli

```javascript
const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych, {
  go_stimuli: [
    jsPsychTimelineGoNoGo.utils.shapes.circle,
    jsPsychTimelineGoNoGo.utils.shapes.square
  ],
  nogo_stimuli: [jsPsychTimelineGoNoGo.utils.shapes.octagon],
  num_trials: 40
});

jsPsych.run(timeline);
```

### Timed block breaks

```javascript
const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych, {
  num_blocks: 3,
  block_break_duration: 15000  // 15s countdown instead of a continue button
});

jsPsych.run(timeline);
```

### Modular timeline construction

```javascript
const instructions = jsPsychTimelineGoNoGo.createInstructions();
const practice = jsPsychTimelineGoNoGo.timelineUnits.createPractice({
  go_practice_timeout: 15000,
  nogo_practice_timeout: 5000
});

const mainTask = jsPsychTimelineGoNoGo.createTimeline(jsPsych, {
  show_instructions: false,  // included above
  show_practice: false,      // included above
  show_debrief: true
});

jsPsych.run([instructions, ...practice, mainTask]);
```

## Authors

Caroline Griem, A. Hunter Farhat

## License

MIT License
