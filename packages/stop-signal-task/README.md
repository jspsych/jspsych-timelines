# Stop-Signal Task

The stop-signal (countermanding) task measures response inhibition: participants respond quickly to an arrow, but on a minority of trials a stop signal appears shortly after it and they must withhold the response. The stop-signal delay follows a staircase that keeps stopping at about 50% success, and the stop-signal reaction time (SSRT) is estimated with the integration method. The default configuration follows the STOP-IT task (Verbruggen et al., 2008) and the consensus guide of Verbruggen et al. (2019), *eLife*, 8, e46323; every option, its default and the evidence behind it is on the documentation site. Logan & Cowan (1984), *J. Exp. Psychol. Hum. Percept. Perform.*, 10, 276-291.

## Installation

```bash
npm install @jspsych-timelines/stop-signal-task
```

```html
<script src="https://unpkg.com/@jspsych-timelines/stop-signal-task"></script>
```

The package needs jsPsych 8.4.0 or later (`jsPsych.adaptive`).

## Quick Start

```js
const jsPsych = initJsPsych();

const sst = jsPsychTimelineStopSignalTask.createTimeline(jsPsych, {
  n_blocks: 4,
  trials_per_block: 64,
  adaptive: { start_level: 200, step_size: 50, bounds: [50, 1200] },
});

jsPsych.run([sst]);

// SSRT (integration method with replacement of go omissions), the mean method and the usual checks
jsPsychTimelineStopSignalTask.utils.scoring.calculateScores(jsPsych.data.get());
```

Fixed delays instead of the staircase: `difficulty_levels: [17, 67, 117, 167]`.

## Documentation

Full reference (options, data output, scoring, translation): `website/docs/reference/stop-signal-task.mdx` on the documentation site.

## License

MIT
