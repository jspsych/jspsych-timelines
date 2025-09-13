# Columbia Card Task

The Columbia Card Task measures risk preferences through choices in a card game where participants decide how many cards to flip from a deck containing both gain and loss cards.

## Usage

```js
import { createTimeline } from "@jspsych-timelines/columbia-card"

const jsPsych = initJsPsych()
const { timeline } = createTimeline(jsPsych, {
  show_instructions: true,
  show_practice: true,
  num_blocks: 3,
  num_trials: 5,
  show_debrief: true
})

jsPsych.run(timeline)
```

## Parameters

### createTimeline Parameters

Parameter | Type | Default Value | Description
----------|------|---------------|------------
show_instructions | boolean | false | Whether to include instructions at the start
show_practice | boolean | false | Whether to include practice rounds
num_blocks | number | 3 | Number of experimental blocks
num_trials | number | 5 | Number of trials per block
show_debrief | boolean | false | Whether to show debrief at the end
show_block_summary | boolean | true | Whether to show points summary between blocks
num_cards | number | 32 | Number of cards in the grid
num_loss_cards | number | 3 | Number of loss cards
grid_columns | number | 8 | Number of columns in card grid
card_width | number | 60 | Card width in pixels
card_height | number | 80 | Card height in pixels
flip_duration | number | 300 | Card flip animation duration in ms
loss_value | number | -250 | Points lost per loss card
gain_value | number | 10 | Points gained per gain card
starting_score | number | 0 | Starting score for each trial
practice_num_cards | number | 16 | Cards in practice rounds
practice_num_loss_cards | number | 2 | Loss cards in practice
practice_gain_value | number | 5 | Points gained in practice
practice_loss_value | number | -50 | Points lost in practice
instructions_array | string[] | - | Custom instruction pages
text_object | object | trial_text | Text configuration object

## Data Generated

Name | Type | Value
-----|------|------
task | string | "columbia-card"
phase | string | "instructions", "practice", "practice-trial", "main-trial", "block-break-N", "debrief"
block_number | number | Block number (1-indexed for main trials)
trial_number | number | Trial number within block (1-indexed)
total_points | number | Points earned in the trial
total_clicks | number | Number of cards flipped
cumulative_points | number | Total points across all completed trials
block_cumulative_points | number | Total points within the current block

## Functions

### createTimeline(jsPsych, config)

Creates the complete Columbia Card Task timeline including instructions, practice, main trials, block breaks, and debrief.

### timelineUnits.createInstructions(instructions, texts)

Creates instruction pages for the task.

### timelineUnits.createPractice(config)

Creates practice trials with introduction and completion screens.

### timelineUnits.createDebrief(jsPsych, texts)

Creates the final debrief screen with performance summary and risk-taking analysis.

### utils.createColumbiaCardTrial(config, texts, blockNumber, trialNumber, jsPsych)

Creates a single Columbia Card Task trial.

### utils.createBlockBreak(jsPsych, blockNum, num_blocks, texts, showBlockSummary)

Creates a break screen between blocks with optional performance summary.

### utils.createPracticeCompletion(texts)

Creates the practice completion screen.