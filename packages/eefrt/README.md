# EEfRT (Effort Expenditure for Rewards Task)

The EEfRT measures willingness to expend effort for reward. On every trial the participant chooses between an easy task (30 key presses in 7 s, a small reward) and a hard task (100 presses in 21 s, a larger and varying reward), knowing the chance that the trial pays out, and then does the chosen task. The proportion of hard choices, by probability and reward, is the measure. The default configuration follows Treadway, Buckholtz, Schwartzman, Lambert & Zald (2009), *PLoS ONE*, 4(8), e6598; every option, its default and the evidence behind it is on the documentation site.

## Installation

```bash
npm install @jspsych-timelines/eefrt
```

```html
<script src="https://unpkg.com/@jspsych-timelines/eefrt"></script>
```

## Quick Start

```js
const jsPsych = initJsPsych();

const eefrt = jsPsychTimelineEefrt.createTimeline(jsPsych, {
  session_duration_min: 20,
  reward_probability: [0.12, 0.5, 0.88],
});

jsPsych.run([eefrt]);

// Scores for the test phase
jsPsychTimelineEefrt.utils.scoring.calculateScores(jsPsych.data.get());
```

## Documentation

Full reference (options, data output, scoring, translation): the `eefrt` page of the documentation site (`website/docs/reference/eefrt.mdx`).

## License

MIT
