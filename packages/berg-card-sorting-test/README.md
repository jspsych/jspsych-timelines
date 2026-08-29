# Berg Card Sorting Test (BCST)

A jsPsych implementation of the Berg Card Sorting Test, a measure of cognitive flexibility, set-shifting, and perseveration. This is a variant of the Wisconsin Card Sorting Test (WCST).

## Installation

```bash
npm install @jspsych-timelines/berg-card-sorting-test
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/jspsych@8"></script>
  <script src="https://unpkg.com/@jspsych-timelines/berg-card-sorting-test"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych@8/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych();
  const task = jsPsychTimelineBergCardSortingTest.createTimeline(jsPsych);
  jsPsych.run([task]);
</script>
</html>
```

## Task Description

Participants sort cards by matching a stimulus card to one of four reference cards. The matching rule (color, shape, or number) changes without warning once the participant gives `runLength` consecutive correct responses. Participants must learn each rule through trial-and-error feedback.

The task ends when `numCategories` rules have been completed, or when the deck runs out — whichever comes first. A participant who never finds a rule sorts the whole deck.

### Reference Cards

Four fixed reference cards are displayed:

1. 1 red triangle
2. 2 green stars
3. 3 yellow crosses
4. 4 blue circles

### Stimulus Cards

A 64-card deck containing all combinations of:

- Colors: red, green, yellow, blue
- Shapes: triangle, star, cross, circle
- Numbers: 1, 2, 3, 4

### Rules

Rules cycle in fixed order: **Color → Shape → Number → Color → ...**

## Parameters

All parameters are optional.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `showInstructions` | boolean | `true` | Show built-in instruction screens |
| `showFeedback` | boolean | `true` | Show feedback after each response |
| `showResults` | boolean | `true` | Show the participant a results screen at the end. Turn this off in a composed battery |
| `feedbackDuration` | number | `500` | Feedback display duration (ms) |
| `runLength` | number | `10` | Consecutive correct responses that complete a category and shift the rule |
| `numCategories` | number | `6` | Categories to complete before ending |
| `deckRepeats` | number | `2` | Times to cycle through the 64-card deck |
| `useCanonicalOrder` | boolean | `false` | Use Berg's original card order instead of shuffling |
| `text` | object | See [Translation](#translation) | Text strings, merged over the defaults |

`feedbackDuration` must be a finite number `>= 0`; `runLength`, `numCategories` and `deckRepeats` must be integers `>= 1`. `createTimeline` throws on anything else rather than running a degenerate task.

## Data Output

### Trial Data

Recorded on every sorting trial (`phase: "test"`, `part: "sorting"`):

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | `"berg-card-sorting-test"` |
| `task_version` | string | Package version |
| `trial_number` | number | Trial number (1-indexed) |
| `stimulus_color` | string | Stimulus card color |
| `stimulus_shape` | string | Stimulus card shape |
| `stimulus_number` | number | Stimulus card number |
| `response` | number | Selected reference card (0-3) |
| `rt` | number | Response time (ms) |
| `current_rule` | string | Rule in force on this trial |
| `perseverated_to` | string \| null | Principle a perseverative response repeats on this trial. See [Perseveration scoring](#perseveration-scoring) |
| `correct` | boolean | Whether the response matched `current_rule` |
| `is_perseverative` | boolean | Whether the response matched `perseverated_to` |
| `consecutive_correct` | number | Streak this trial reached, including the trial that completes a category |
| `categories_completed` | number | Categories completed after this trial |

### Phase and part values

| `phase` | `part` | Emitted by |
|---------|--------|------------|
| `instructions` | — | The instruction screens |
| `test` | `sorting` | Each card the participant sorts |
| `test` | `feedback` | The feedback screen after each sort |
| `completion` | — | The results screen |

Only sorting rows carry the fields in the table above; the other rows carry `task` and `phase` alone.

## Scoring

```javascript
import { utils } from "@jspsych-timelines/berg-card-sorting-test";

const scores = utils.scoring.getSummary(jsPsych.data.get());
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `taskName` | `"berg-card-sorting-test"` |
| `version` | Package version |
| `totalTrials` | Total cards sorted |
| `totalCorrect` | Correct responses |
| `totalErrors` | Incorrect responses |
| `accuracy` | Proportion correct, or `null` if nothing was sorted |
| `categoriesCompleted` | Categories achieved |
| `trialsToFirstCategory` | Trials taken to complete the first category, or `null` if none was |
| `perseverativeResponses` | Responses matching the perseverated-to principle, correct or not |
| `perseverativeErrors` | The subset of those that were incorrect |
| `nonPerseverativeErrors` | Errors that did not repeat the perseverated-to principle |
| `percentPerseverativeErrors` | Perseverative errors as a percentage of all errors, or `null` if there were no errors |
| `conceptualLevelResponses` | Every correct response occurring in a run of three or more |
| `failureToMaintainSet` | Errors breaking a run of five or more correct *within* a category |
| `meanRT` | Mean RT over correct trials, or `null` if there were none |

A measure that is undefined for a participant is reported as `null` rather than `0`, so it cannot be confused with a real zero on the same scale.

### Perseveration scoring

A perseverative response repeats the **perseverated-to principle** — the rule the participant is still sorting by after it has stopped being correct.

- Once a category has been completed, the principle is the rule that was just completed.
- Before any category is completed there is no previously-correct rule, so the principle is seeded from the participant's own behavior: three consecutive responses matching a single non-current dimension. A sort matching two dimensions at once identifies neither and breaks the run.

This follows Heaton's scoring and matters for the participants the measure exists to detect: someone who never completes a category has no "previous rule", and scoring perseveration against one would report zero for the most perseverative profile there is.

`is_perseverative` records the match alone, so a response can be perseverative *and* correct when a card happens to match both principles. That is why `perseverativeResponses` and `perseverativeErrors` are separate numbers.

## Translation

Pass a `text` object; it is merged over the defaults, so partial objects are fine.

```javascript
import { createTimeline } from "@jspsych-timelines/berg-card-sorting-test";

const spanishText = {
  instruction_pages: [
    "<div class='bcst-instructions'><p>En esta tarea, clasificarás cartas...</p></div>",
    // ... more pages
  ],
  continue_button: "Continuar",
  back_button: "Atrás",
  correct_feedback: "¡Correcto!",
  incorrect_feedback: "Incorrecto",
  sort_prompt: "Toca una pila para clasificar esta carta",
  task_complete: "Tarea completada",
  result_summary: (categoriesCompleted, perseverativeErrors, totalErrors) =>
    `<p>Categorías: ${categoriesCompleted}</p>`,
};

const timeline = createTimeline(jsPsych, { text: spanishText });
```

Every key is a string except `result_summary`, which is a function of the values it displays. The default text object is available as `utils.text`.

## Timeline Units

Each unit takes the same options object as `createTimeline` and resolves its own defaults, so a unit can be used on its own:

```javascript
import { timelineUnits } from "@jspsych-timelines/berg-card-sorting-test";

// createInstructionTrials(options?)
// createFeedbackTrial(jsPsych, options?)
// createTrialBlock(jsPsych, options?)
// createCompletionTrial(jsPsych, options?)

const block = timelineUnits.createTrialBlock(jsPsych, { runLength: 4, numCategories: 3 });
jsPsych.run([block]);
```

## Styling

Every rule ships scoped under `.jspsych-berg-card-sorting-test`, which the timeline adds to the display element on each of its trials, so the stylesheet cannot affect another task in a composed battery. To restyle the task, write rules under that same root.

## Citation

If using in research, please cite:

> Berg, E. A. (1948). A simple objective technique for measuring flexibility in thinking. Journal of General Psychology, 39, 15-22.

## References

1. Berg, E. A. (1948). A simple objective technique for measuring flexibility in thinking. Journal of General Psychology, 39, 15-22.
2. Heaton, R. K. (1981). A manual for the Wisconsin Card Sorting Test. Odessa, FL: Psychological Assessment Resources.
3. Mueller, S. T. (2014). The PEBL Manual. Available at http://pebl.sf.net

## License

MIT
