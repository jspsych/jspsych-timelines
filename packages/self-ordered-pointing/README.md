# Self-ordered pointing

Self-ordered pointing measures working memory for one's own earlier choices, and monitoring. A set of N items is shown on N successive screens, in new places each time; on every screen the participant points to an item they have not picked before in the set. A repeat is an error, and errors rise with set size. The default configuration follows the TaskBeacon reference implementation (6, 8, 10 and 12 items, three series each, untimed), after Petrides & Milner (1982), *Neuropsychologia*, 20, 249-262. The items are a stimulus set: the bundled sets (`utils.stimuli.abstractDesigns`, the default; `representationalDrawings`, outline drawings from Lucide; `words`; `nonwords`) or your own text, images or SVG. Every option, its default and the evidence behind it is on the documentation site.

## Installation

```bash
npm install @jspsych-timelines/self-ordered-pointing
```

```html
<script src="https://unpkg.com/@jspsych-timelines/self-ordered-pointing"></script>
```

## Quick Start

```js
const jsPsych = initJsPsych();

const sopt = jsPsychTimelineSelfOrderedPointing.createTimeline(jsPsych, {
  set_sizes: [6, 9, 12],
  trials_per_condition: 3,
  response_device: "touch",
});

jsPsych.run([sopt]);

// Scores for the test phase (total repeat errors, errors by set size, ...)
jsPsychTimelineSelfOrderedPointing.utils.scoring.calculateScores(jsPsych.data.get());
```

## Documentation

Full reference (options, data output, scoring, translation): `website/docs/reference/self-ordered-pointing.mdx` on the documentation site.

## License

MIT

The outline drawings in `src/drawings.ts` are from [Lucide](https://lucide.dev) and are under the ISC License; the notice is in that file and in the built bundle.
