# Iowa Gambling Task

A jsPsych implementation of the Iowa Gambling Task (IGT), a measure of decision-making under uncertainty and risk-taking behavior. Based on Bechara et al. (1994).

## Installation

```bash
npm install @jspsych-timelines/iowa-gambling
```

## Quick Start

```javascript
import { initJsPsych } from "jspsych";
import { createTimeline, utils } from "@jspsych-timelines/iowa-gambling";

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

Participants select cards from four decks (A, B, C, D) over 100 trials. Each selection results in winning money, and sometimes also losing money. The goal is to maximize winnings.

### Deck Structure

| Deck | Type | Reward | Penalty Pattern | Net per 40 cards |
|------|------|--------|-----------------|------------------|
| A | Disadvantageous | $100 | Frequent small | -$1000 |
| B | Disadvantageous | $100 | Infrequent large | -$1000 |
| C | Advantageous | $50 | Frequent small | +$1000 |
| D | Advantageous | $50 | Infrequent large | +$1000 |

Healthy participants typically learn to prefer decks C and D over time.

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `showInstructions` | boolean | `true` | Show built-in instructions |
| `numTrials` | number | `100` | Total number of trials |
| `startingLoan` | number | `2000` | Initial loan amount |
| `showLoan` | boolean | `true` | Display borrowed amount |
| `winDisplayDuration` | number | `2000` | Win feedback duration (ms) |
| `lossDisplayDuration` | number | `2000` | Loss feedback duration (ms) |
| `interTrialInterval` | number | `500` | ITI duration (ms) |
| `currencySymbol` | string | `"$"` | Currency symbol |
| `text` | object | See below | Customizable text strings |

## Data Output

### Trial Data

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | `"iowa-gambling"` |
| `task_version` | string | Package version |
| `trial_number` | number | Trial number (1-100) |
| `block` | number | Block number (1-5) |
| `deck_selected` | string | Deck chosen (A-D) |
| `deck_index` | number | Deck index (0-3) |
| `win_amount` | number | Money won |
| `loss_amount` | number | Money lost |
| `net_amount` | number | Net gain/loss |
| `total_score` | number | Running total |
| `rt` | number | Response time (ms) |

## Scoring

```javascript
import { utils } from "@jspsych-timelines/iowa-gambling";

const scores = utils.scoring.getSummary(jsPsych.data.get());
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `finalScore` | Final money amount |
| `netScore` | Score minus starting loan |
| `deckACounts` - `deckDCounts` | Selections per deck |
| `advantageousSelections` | C + D selections |
| `disadvantageousSelections` | A + B selections |
| `netScoreByBlock` | (C+D) - (A+B) per 20 trials |
| `meanRT` | Mean response time |

### Interpretation

- **Positive netScore**: Participant earned money overall
- **Increasing netScoreByBlock**: Learning to prefer good decks
- **advantageousSelections > disadvantageousSelections**: Successful learning

## Translation

```javascript
const spanishText = {
  instruction_pages: [
    "<p>En este juego, seleccionarás cartas de cuatro mazos...</p>",
  ],
  deck_labels: ["A", "B", "C", "D"],
  win_message: (amount, symbol) => `¡Ganaste ${symbol}${amount}!`,
  loss_message: (amount, symbol) => `Perdiste ${symbol}${amount}`,
  total_label: "Total",
  currencySymbol: "€",
};

const timeline = createTimeline(jsPsych, { text: spanishText });
```

## Timeline Units

For custom experiments:

```javascript
import { timelineUnits } from "@jspsych-timelines/iowa-gambling";

// Available units:
// - createInstructionTrials(config)
// - createTrialBlock(jsPsych, config)
// - createCompletionTrial(jsPsych, config)
```

## Citation

If using in research, please cite:

> Bechara, A., Damasio, A. R., Damasio, H., & Anderson, S. W. (1994). Insensitivity to future consequences following damage to human prefrontal cortex. Cognition, 50(1-3), 7-15.

## References

1. Bechara, A., Damasio, A. R., Damasio, H., & Anderson, S. W. (1994). Insensitivity to future consequences following damage to human prefrontal cortex. Cognition, 50(1-3), 7-15.
2. Bechara, A., Damasio, H., Tranel, D., & Damasio, A. R. (1997). Deciding advantageously before knowing the advantageous strategy. Science, 275(5304), 1293-1295.
3. Mueller, S. T. (2014). The PEBL Manual. Available at http://pebl.sf.net

## License

MIT
