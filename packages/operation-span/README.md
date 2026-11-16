# Operation Span (complex span)

The automated operation span measures working memory capacity: the participant alternates between checking math problems and remembering letters, then recalls the letters in order. Its score is the number of letters recalled in the correct position (partial credit), with a processing-accuracy criterion (85%) and a time limit set from the participant's own practice speed. The default configuration follows Unsworth, Heitz, Schrock & Engle (2005), *Behavior Research Methods*, 37, 498-505; every option, its default and the evidence behind it is on the documentation site.

## Installation

```bash
npm install @jspsych-timelines/operation-span
```

```html
<script src="https://unpkg.com/@jspsych-timelines/operation-span"></script>
```

## Quick Start

```js
const jsPsych = initJsPsych();

const ospan = jsPsychTimelineOperationSpan.createTimeline(jsPsych, {
  set_sizes: [2, 3, 4, 5],
  trials_per_condition: 3,
  response_window_ms: 6000, // a fixed deadline instead of the calibrated default
});

jsPsych.run([ospan]);

// Scores for the test phase
jsPsychTimelineOperationSpan.utils.scoring.calculateScores(jsPsych.data.get());
```

The default processing deadline is computed from practice: `utils.deadlines.meanPlusSd(2.5)` is mean + 2.5 SD of the participant's correct processing-only practice RTs. Pass your own function for another rule.

## Documentation

Full reference (options, data output, scoring, translation): `website/docs/reference/operation-span.mdx` on the documentation site.

## License

MIT
