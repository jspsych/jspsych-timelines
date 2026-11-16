# Go/No-go Task

The go/no-go task measures response inhibition and sustained attention: respond to frequent "go" stimuli and withhold the response to rare "no-go" stimuli. Errors of commission (responding to a no-go stimulus), errors of omission, go RT and d' are the usual measures. The default configuration follows the Experiment Factory go_nogo task (Sochat et al., 2016); every option, its default and the evidence behind it is on the documentation site. Gomez, Ratcliff & Perea (2007), *Journal of Experimental Psychology: General*, 136, 389-413.

## Installation

```bash
npm install @jspsych-timelines/go-nogo
```

```html
<script src="https://unpkg.com/@jspsych-timelines/go-nogo"></script>
```

## Quick Start

```js
const jsPsych = initJsPsych();

const goNogo = jsPsychTimelineGoNogo.createTimeline(jsPsych, {
  n_test_trials: 150,
  condition_proportions: { go: 0.82, nogo: 0.18 },
  sequence_constraints: { max_run: { nogo: 2 }, min_gap: { nogo: 3 } },
});

jsPsych.run([goNogo]);

// Commission and omission errors, go RT and d' for the test phase
jsPsychTimelineGoNogo.utils.scoring.calculateScores(jsPsych.data.get());
```

## Documentation

Full reference (options, data output, scoring, translation): `website/docs/reference/go-nogo.mdx` on the documentation site.

## License

MIT
