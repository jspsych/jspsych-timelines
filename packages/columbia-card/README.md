# columbia-card

## Overview

The Columbia Card Task measures risk preferences through choices in a card game.

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-timelines/columbia-card">
```

### Via NPM

```
npm install @jspsych-timelines/columbia-card
```

```js
import { createTimeline, timelineUnits, utils } from "@jspsych-timelines/columbia-card"
```

## Compatibility

`@jspsych-timelines/columbia-card` requires jsPsych v8.0.0 or later.

## Documentation

### createTimeline

#### jsPsychTimelineColumbiaCard.createTimeline(jsPsych, { *options* }) ⇒ <code>timeline</code>
Generates a complete Columbia Card Task timeline including instructions, practice, main trials, block breaks, and debrief.

The following parameters can be specified in the **options** parameter.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| show_instructions | boolean | false | Whether to include instructions at the start |
| show_practice | boolean | false | Whether to include practice rounds |
| num_blocks | number | 3 | Number of experimental blocks |
| num_trials | number | 5 | Number of trials per block |
| show_debrief | boolean | false | Whether to show debrief at the end |
| show_block_summary | boolean | true | Whether to show points summary between blocks |
| num_cards | number | 32 | Number of cards in the grid |
| num_loss_cards | number | 3 | Number of loss cards |
| grid_columns | number | 8 | Number of columns in card grid |
| card_width | number | 60 | Card width in pixels |
| card_height | number | 80 | Card height in pixels |
| flip_duration | number | 300 | Card flip animation duration in ms |
| loss_value | number | -250 | Points lost per loss card |
| gain_value | number | 10 | Points gained per gain card |
| starting_score | number | 0 | Starting score for each trial |
| practice_num_cards | number | 16 | Cards in practice rounds |
| practice_num_loss_cards | number | 2 | Loss cards in practice |
| practice_gain_value | number | 5 | Points gained in practice |
| practice_loss_value | number | -50 | Points lost in practice |
| instructions_array | string[] | - | Custom instruction pages |
| text_object | object | trial_text | Text configuration object |


### timelineUnits


### utils

## Author / Citation

A. Hunter Farhat