# Go/No-go Task

The go/no-go task measures response inhibition and sustained attention: respond to frequent "go" stimuli and withhold the response to rare "no-go" stimuli. Errors of commission (responding to a no-go stimulus), errors of omission, go RT and d' are the usual measures. The default configuration follows the Experiment Factory go_nogo task (Sochat et al., 2016; cited from memory, verify); every option, its default and the evidence behind it is on the documentation site. A methods reference to check before citing: Gomez, Ratcliff & Perea (2007), *Journal of Experimental Psychology: General*, 136, 389-413 (listed as unread in the dossier).

The default stimuli are a blue and an orange square, drawn by the package. `stimulus_set: { go, nogo }` takes your own: shapes in colours, text, images (URLs) or SVG markup, each with an optional `id` that is recorded as `stimulus`.

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
