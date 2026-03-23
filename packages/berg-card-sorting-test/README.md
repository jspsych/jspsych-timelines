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
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
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

Participants sort cards by matching a stimulus card to one of four reference cards. The matching rule (color, shape, or number) changes without warning after 10 consecutive correct responses. Participants must learn the rule through trial-and-error feedback.

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

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `showInstructions` | boolean | `true` | Show built-in instruction screens |
| `showFeedback` | boolean | `true` | Show feedback after each response |
| `feedbackDuration` | number | `500` | Feedback display duration (ms) |
| `runLength` | number | `10` | Consecutive correct to trigger rule change |
| `numCategories` | number | `6` | Categories to complete before ending |
| `deckRepeats` | number | `2` | Times to cycle through deck |
| `useCanonicalOrder` | boolean | `false` | Use Berg's original card order |
| `text` | object | See below | Customizable text strings |

## Data Output

### Trial Data

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | `"berg-card-sorting-test"` |
| `task_version` | string | Package version |
| `trial_number` | number | Trial number (1-indexed) |
| `stimulus_color` | string | Stimulus card color |
| `stimulus_shape` | string | Stimulus card shape |
| `stimulus_number` | number | Stimulus card number |
| `response` | number | Selected reference card (0-3) |
| `current_rule` | string | Active matching rule |
| `previous_rule` | string \| null | Previous rule |
| `correct` | boolean | Whether response was correct |
| `is_perseverative` | boolean | Matches previous rule |
| `consecutive_correct` | number | Current correct streak |
| `categories_completed` | number | Rule shifts completed |
| `rt` | number | Response time (ms) |

## Scoring

```javascript
import { utils } from "@jspsych-timelines/berg-card-sorting-test";

const scores = utils.scoring.getSummary(jsPsych.data.get());
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `totalTrials` | Total cards sorted |
| `totalCorrect` | Correct responses |
| `totalErrors` | Incorrect responses |
| `accuracy` | Proportion correct |
| `categoriesCompleted` | Rule shifts achieved (max 6) |
| `trialsToFirstCategory` | Trials to first rule shift |
| `perseverativeResponses` | Responses matching previous rule |
| `perseverativeErrors` | Incorrect perseverative responses |
| `nonPerseverativeErrors` | Other errors |
| `percentPerseverativeErrors` | Perseveration percentage |
| `conceptualLevelResponses` | Responses in 3+ correct runs |
| `failureToMaintainSet` | Errors after 5+ correct |
| `meanRT` | Mean RT for correct trials |

## Translation

```javascript
const spanishText = {
  instruction_pages: [
    "<p>En esta tarea, clasificarás cartas...</p>",
    // ... more pages
  ],
  correct_feedback: "¡Correcto!",
  incorrect_feedback: "Incorrecto",
  continue_button: "Continuar",
};

const timeline = createTimeline(jsPsych, { text: spanishText });
```

## Timeline Units

For custom experiments:

```javascript
import { timelineUnits } from "@jspsych-timelines/berg-card-sorting-test";

// Available units:
// - createInstructionTrials(config)
// - createFeedbackTrial(jsPsych, config)
// - createTrialBlock(jsPsych, config)
// - createCompletionTrial(config)
```

## Citation

If using in research, please cite:

> Berg, E. A. (1948). A simple objective technique for measuring flexibility in thinking. Journal of General Psychology, 39, 15-22.

## References

1. Berg, E. A. (1948). A simple objective technique for measuring flexibility in thinking. Journal of General Psychology, 39, 15-22.
2. Heaton, R. K. (1981). A manual for the Wisconsin Card Sorting Test. Odessa, FL: Psychological Assessment Resources.
3. Mueller, S. T. (2014). The PEBL Manual. Available at http://pebl.sf.net

## License

MIT
