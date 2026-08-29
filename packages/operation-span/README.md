# Operation Span Task (OSPAN)

A jsPsych implementation of the Operation Span Task, a complex span measure of working memory capacity. Based on Turner & Engle (1989) and the automated version by Unsworth et al. (2005).

## Installation

```bash
npm install @jspsych-timelines/operation-span
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://unpkg.com/jspsych@8"></script>
  <script src="https://unpkg.com/@jspsych-timelines/operation-span"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych@8/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych();
  const task = jsPsychTimelineOperationSpan.createTimeline(jsPsych);
  jsPsych.run([task]);
</script>
</html>
```

## Task Description

Participants perform a dual task:
1. **Processing task:** Verify simple math equations (e.g., "(3 + 2) - 1 = 4")
2. **Memory task:** Remember letters presented after each math problem

After a sequence of math-letter pairs, participants recall all letters in order using a grid interface.

### Trial Structure

1. Set size announced (e.g., "Remember 5 letters")
2. Math problem → TRUE/FALSE response → Feedback
3. Letter displayed (800ms)
4. Repeat steps 2-3 for each letter in the set
5. Recall: Click letters in order on grid
6. Feedback showing accuracy

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `showInstructions` | boolean | `true` | Show built-in instructions |
| `setSizes` | number[] | `[3,4,5,6,7]` | Set sizes to use |
| `trialsPerSetSize` | number | `3` | Trials at each set size |
| `letterDuration` | number | `800` | Letter display time (ms) |
| `mathTimeout` | number \| null | `null` | Math response timeout (null = no timeout) |
| `mathFeedbackDuration` | number | `500` | Math feedback time (ms) |
| `recallFeedbackDuration` | number | `2000` | Recall feedback time (ms) |
| `isi` | number | `250` | Inter-stimulus interval (ms) |
| `text` | object | See below | Customizable text strings |

## Data Output

### Trial Data

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | `"operation-span"` |
| `task_version` | string | Package version |
| `trial_number` | number | Trial number |
| `set_size` | number | Letters in this trial |
| `target_letters` | string[] | Letters to remember |
| `recalled_letters` | string[] | Letters recalled |
| `letters_correct` | number | Correct in position |
| `perfect_recall` | boolean | All letters correct |
| `math_correct` | number | Correct math responses |
| `math_total` | number | Total math problems |
| `mean_math_rt` | number | Mean math RT |

## Scoring

```javascript
import { utils } from "@jspsych-timelines/operation-span";

const scores = utils.scoring.getSummary(jsPsych.data.get());
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `ospanScore` | Partial credit total (letters in correct positions) |
| `absoluteSpanScore` | Sum of set sizes for perfect trials only |
| `totalLettersCorrect` | Total letters recalled correctly |
| `totalLetters` | Total letters presented |
| `mathAccuracy` | Proportion of math problems correct |
| `meanMathRT` | Mean response time for math problems |

### Scoring Methods

**OSPAN Score (Partial Credit):**
- Count letters recalled in correct position
- Sum across all trials
- Recommended measure (Unsworth et al., 2005)

**Absolute Span Score:**
- Only count trials where ALL letters are correct
- Sum of set sizes for perfect trials
- More conservative measure

### Math Accuracy Threshold

Math accuracy should be >85% for valid data. Lower accuracy suggests participants are not engaging with the processing task.

## Translation

```javascript
const spanishText = {
  instruction_pages: [
    "<p>En esta tarea, resolverás problemas matemáticos mientras recuerdas letras.</p>",
  ],
  true_button: "VERDADERO",
  false_button: "FALSO",
  recall_prompt: "Haz clic en las letras en el orden que las viste",
  clear_button: "Borrar",
  blank_button: "Espacio",
  done_button: "Listo",
};

const timeline = createTimeline(jsPsych, { text: spanishText });
```

## Timeline Units

For custom experiments:

```javascript
import { timelineUnits } from "@jspsych-timelines/operation-span";

// Available units:
// - createInstructionTrials(config)
// - createMathTrial(jsPsych, config, problem, onFinish)
// - createLetterTrial(config, letter)
// - createRecallTrial(jsPsych, config, targetLetters, mathResults, trialNumber)
// - createOspanTrial(jsPsych, config, setSize, trialNumber)
// - createTrialBlock(jsPsych, config)
```

## Citation

If using in research, please cite:

> Unsworth, N., Heitz, R. P., Schrock, J. C., & Engle, R. W. (2005). An automated version of the operation span task. Behavior Research Methods, 37(3), 498-505.

## References

1. Turner, M. L., & Engle, R. W. (1989). Is working memory capacity task dependent? Journal of Memory and Language, 28(2), 127-154.
2. Unsworth, N., Heitz, R. P., Schrock, J. C., & Engle, R. W. (2005). An automated version of the operation span task. Behavior Research Methods, 37(3), 498-505.
3. Conway, A. R., et al. (2005). Working memory span tasks: A methodological review and user's guide. Psychonomic Bulletin & Review, 12(5), 769-786.

## License

MIT
