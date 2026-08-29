# @jspsych-timelines/go-nogo

## Overview

A Go/No-Go task for jsPsych, measuring response inhibition and sustained attention. Participants respond as fast as they can to a Go stimulus and withhold responding to a No-Go stimulus. The package provides interactive instructions, an optional practice block, configurable experimental blocks with breaks, and a scored debrief.

## Loading

### NPM

```bash
npm install @jspsych-timelines/go-nogo
```

```javascript
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/go-nogo";
```

### CDN (Browser)

```html
<script src="https://unpkg.com/@jspsych-timelines/go-nogo"></script>
```

The browser build exposes everything on the global `jsPsychTimelineGoNoGo`.

## Styling

There is nothing to load. The stylesheet is bundled into the package and applied automatically when it is imported.

Every rule is scoped under `.jspsych-go-nogo`, a class the package adds to its own trials, so the styles cannot affect other tasks in a composed battery. Class names the package writes into the DOM are prefixed `jspsych-go-nogo-*` and can be targeted from your own stylesheet:

```css
.jspsych-go-nogo .jspsych-go-nogo-fixation {
  color: #666;
} 
```

Available hooks: `-instructions`, `-stimulus`, `-fixation`, `-isi-blank`, `-transition`, `-block-break`, `-debrief`, `-feedback`, `-feedback-correct`, `-feedback-incorrect`.

## Basic Usage

```javascript
const jsPsych = initJsPsych();

const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych, {
  show_instructions: true,
  show_practice: true,
  show_debrief: true,
  num_blocks: 2,
  num_trials: 30,
});

jsPsych.run(timeline);
```

## Compatibility

Requires jsPsych v8.0.0 or later.

## API

### createTimeline(jsPsych, config)

Builds the complete timeline: optional instructions, optional practice block, `num_blocks` experimental blocks separated by breaks, and an optional debrief.

- `jsPsych` (JsPsych) — active jsPsych instance
- `config` (GoNoGoConfig, optional) — see [Configuration](#configuration)

Returns `{ timeline }`, ready to pass to `jsPsych.run()`.

Invalid configuration throws at construction rather than producing an unusable dataset. See [Validation](#validation).

### createInstructions(instructions?, texts?)

Standalone instruction pages, using `@jspsych/plugin-instructions`. Both arguments are optional; they default to the pages and labels in the text config.

```javascript
const instructions = jsPsychTimelineGoNoGo.createInstructions();
```

### timelineUnits

Individual trial factories, for building a custom timeline:

| Unit | Purpose |
| --- | --- |
| `createInstructions(pages?, texts?)` | Instruction pages |
| `createPractice(config?)` | Interactive Go + No-Go examples with feedback, then a completion screen |
| `createGoPractice(stimulus, texts?, timeout?)` | Go example; repeats until the participant responds in time |
| `createNoGoPractice(stimulus, texts?, timeout?)` | No-Go example; repeats until the participant withholds |
| `createPracticeCompletion(texts?)` | Screen shown after the interactive examples |
| `createGoNoGo(jsPsych, buttonText, trialTimeout, stimulusDuration?)` | One scored stimulus trial |
| `createFixation(jsPsych, duration, buttonText, showButton?, height?, size?)` | Fixation cross |
| `createISIBlank(jsPsych, duration, buttonText, showButton?, height?)` | Blank inter-stimulus screen |
| `createBlockBreak(blockNum, numBlocks, duration?, texts?)` | Between-block break |
| `createEndOfPractice(texts?)` | Screen shown after the practice block |
| `createDebrief(jsPsych, texts?)` | Scored summary screen |

```javascript
const { createPractice, createDebrief } = jsPsychTimelineGoNoGo.timelineUnits;

const practice = createPractice({ go_practice_timeout: 15000 });
const task = jsPsychTimelineGoNoGo.createTimeline(jsPsych, {
  show_instructions: false,
  show_practice: false,
});

jsPsych.run([...practice, task]);
```

### utils

| Member | Purpose |
| --- | --- |
| `utils.scoring.calculateScores(data)` | Scores a `DataCollection`; see [Scoring](#scoring) |
| `utils.scoring.getSummary(data)` | Same, plus `taskName` and `version` |
| `utils.createStimulusHTML(html, isGoTrial, height?)` | Wraps stimulus content in the standard container |
| `utils.createTimelineVariables(jsPsych, block, nTrials, probability, goStimuli, nogoStimuli, height?)` | Generates one block's shuffled trial list |
| `utils.text` | The default text object |
| `utils.shapes` | The built-in `circle`, `octagon` and `square` stimuli |
| `utils.constants` | `TASK_NAME` and `VERSION` |

TypeScript users can also import the `TextConfig` and `ScoringResult` types.

## Configuration

All options are optional.

### Structure

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `show_instructions` | boolean | `false` | Include the interactive Go/No-Go examples |
| `show_practice` | boolean | `false` | Include a practice block in the main task format |
| `show_debrief` | boolean | `false` | Show the scored summary at the end |
| `num_blocks` | number | `3` | Number of experimental blocks |
| `num_trials` | number | `50` | Trials per experimental block |
| `num_practice_trials` | number | `10` | Trials in the practice block |
| `probability` | number | `0.75` | Proportion of Go trials in each experimental block |
| `practice_probability` | number | `0.75` | Proportion of Go trials in the practice block |

### Timing (milliseconds)

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `trial_timeout` | number | `500` | Response window for a stimulus trial |
| `stimulus_duration` | number \| null | `null` | How long the stimulus stays visible. `null` keeps it up until the response or `trial_timeout` |
| `fixation_duration` | number | `500` | Fixation cross before each stimulus |
| `isi_duration` | number | `0` | Blank screen after each stimulus |
| `block_break_duration` | number \| null | `null` | Break length. `null` shows a continue button; a number shows a countdown |
| `go_practice_timeout` | number | `10000` | Response window in the Go example |
| `nogo_practice_timeout` | number | `3000` | Withholding window in the No-Go example |

### Stimuli and appearance

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `go_stimulus` | string | `utils.shapes.circle` | Single Go stimulus, as an HTML string |
| `nogo_stimulus` | string | `utils.shapes.octagon` | Single No-Go stimulus, as an HTML string |
| `go_stimuli` | string[] | — | Several Go stimuli, rotated through. Overrides `go_stimulus` |
| `nogo_stimuli` | string[] | — | Several No-Go stimuli, rotated through. Overrides `nogo_stimulus` |
| `stimulus_container_height` | string | `"25vh"` | Height reserved for the stimulus, so the button does not shift between screens |
| `fixation_size` | string | `"3em"` | Font size of the fixation cross |
| `show_button_during_fixation` | boolean | `true` | Show the response button, disabled, during fixation and ISI. Reserves its layout space without accepting a response |

### Text

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | Partial\<TextConfig\> | `{}` | Overrides merged over `utils.text` |

Every participant-facing string lives in the text object, so a different language needs only a `text` override:

```javascript
const timeline = jsPsychTimelineGoNoGo.createTimeline(jsPsych, {
  text: {
    stimulusButton: "Klicken",
    finishButton: "Fertig",
    continueButton: "Weiter",
  },
});
```

> **Coupled to the stimuli.** Seven strings name the default shapes — `instructions_pages`, `goPageContent`, `goSuccess`, `goFailure`, `noGoPageContent`, `noGoSuccess`, `noGoFailure`. They are not derived from `go_stimulus`/`nogo_stimulus`, so changing a stimulus without also overriding these leaves the practice screens describing a shape the participant is not shown. Nothing warns about this.

## Validation

Invalid configuration throws immediately, prefixed `[go-nogo]`:

- `num_blocks`, `num_trials`, `num_practice_trials` must be integers `>= 1`
- `probability` and `practice_probability` must be between `0` and `1` inclusive
- durations must be non-negative; `stimulus_duration` and `block_break_duration` may also be `null`

`probability` of exactly `0` or `1` is allowed: a pure block is a valid design, for instance an all-Go block measuring simple RT as a baseline for the mixed blocks. Rounding can also produce a pure block at extreme values — `0.96` over 10 trials gives 10 Go and 0 No-Go.

## Data

Every row carries `task: "go-nogo"`, and `phase` identifies the section:

| `phase` | `part` values |
| --- | --- |
| `instructions` | `go-practice`, `nogo-practice`, `success`, `failure`, `completion` |
| `practice` | `fixation`, `go`, `nogo`, `isi-blank`, `end-of-practice` |
| `test` | `fixation`, `go`, `nogo`, `isi-blank`, `block-break` |
| `completion` | — (the debrief) |

Scored stimulus rows (`part` of `go` or `nogo`) add:

| Field | Type | Description |
| --- | --- | --- |
| `task_version` | string | Package version that produced the row |
| `is_go_trial` | boolean | `true` on Go trials |
| `block_number` | number | 1-indexed; `0` for the practice block |
| `response` | number \| null | `0` if the button was pressed, `null` otherwise |
| `rt` | number \| null | Response time in ms, `null` if no response |
| `correct` | boolean | Pressed on a Go trial, or withheld on a No-Go trial |

`fixation`, `isi-blank` and `block-break` rows are timing screens and are excluded from scoring.

```javascript
const scored = jsPsych.data.get().filter({ task: "go-nogo", phase: "test" });
```

## Scoring

```javascript
const summary = jsPsychTimelineGoNoGo.utils.scoring.getSummary(jsPsych.data.get());
```

Scores only `phase: "test"` rows with a `part` of `go` or `nogo`, so practice and timing screens never enter the totals.

| Field | Description |
| --- | --- |
| `goAccuracy` | Proportion of Go trials responded to correctly |
| `nogoAccuracy` | Proportion of No-Go trials correctly withheld |
| `overallAccuracy` | Proportion of all scored trials correct |
| `meanGoRT` | Mean RT over correct Go trials, in ms, rounded |
| `totalTrials`, `goTrials`, `nogoTrials` | Trial counts |
| `correctGoTrials`, `correctNogoTrials` | Correct counts |
| `commissionErrors` | False alarms: responded on a No-Go trial |
| `omissionErrors` | Misses: failed to respond on a Go trial |
| `taskName`, `version` | `getSummary` only |

> **Zero means "no data" as well as zero.** An accuracy is `0` when its trial type was never presented, and `meanGoRT` is `0` when no Go trial was answered correctly. Check the matching count — `goTrials`, `nogoTrials`, `totalTrials`, `correctGoTrials` — before reading these as measurements.

## Authors / Citation

**Author:** Caroline Griem (GitHub: [@caroline-griem](https://github.com/caroline-griem))

**Author:** Abdullah Hunter Farhat (GitHub: [@farhat60](https://github.com/farhat60))
