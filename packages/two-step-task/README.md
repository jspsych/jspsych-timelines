# Two-Step Task

The two-step (two-stage) Markov decision task separates model-based from model-free control of choice. On each trial the participant chooses one of two first-stage options, which usually (70% of the time) leads to one of two second-stage states and sometimes to the other; there they choose again, and the option may pay a coin with a probability that drifts slowly over trials. Whether a participant repeats their first choice after a rewarded trial depends on the transition they saw, to the extent that they use the task's structure. The default configuration follows the Expfactory two-stage-decision task; every option, its default and the evidence behind it is on the documentation site. Daw, Gershman, Seymour, Dayan & Dolan (2011), *Neuron*, 69, 1204-1215.

## Installation

```bash
npm install @jspsych-timelines/two-step-task
```

```html
<script src="https://unpkg.com/@jspsych-timelines/two-step-task"></script>
```

## Quick Start

```js
const jsPsych = initJsPsych();

const task = jsPsychTimelineTwoStepTask.createTimeline(jsPsych, {
  n_test_trials: 200,
  common_transition_prob: 0.7,
  reward_schedule: { kind: "random_walk", sd: 0.025, bounds: [0.25, 0.75], boundary: "reflect" },
});

jsPsych.run([task]);

// Stay probabilities by previous reward and transition, MB and MF indices
jsPsychTimelineTwoStepTask.utils.scoring.calculateScores(jsPsych.data.get());
```

## Documentation

Full reference (options, data output, scoring, translation): `website/docs/reference/two-step-task.mdx` on the documentation site.

## License

MIT
