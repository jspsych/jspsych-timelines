# Flanker Task

The Eriksen flanker task measures selective attention and inhibitory control: respond to a central target while ignoring flankers that point the same way (congruent), the other way (incongruent) or are neutral. The default configuration follows the PEBL flanker battery (Mueller & Piper, 2014); every option, its default and the evidence behind it is on the documentation site. Eriksen & Eriksen (1974), *Perception & Psychophysics*, 16, 143-149.

## Installation

```bash
npm install @jspsych-timelines/flanker
```

```html
<script src="https://unpkg.com/@jspsych-timelines/flanker"></script>
```

## Quick Start

```js
const jsPsych = initJsPsych();

const flanker = jsPsychTimelineFlanker.createTimeline(jsPsych, {
  n_test_trials: 96,
  response_keys: ["f", "j"],
  practice: { trial_feedback: "accuracy" },
});

jsPsych.run([flanker]);

// Scores for the test phase
jsPsychTimelineFlanker.utils.scoring.calculateScores(jsPsych.data.get());
```

## Documentation

Full reference (options, data output, scoring, translation): `docs/docs/reference/flanker.md` on the documentation site.

## License

MIT
