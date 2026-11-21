# Tone Detection

Pure-tone detection in noise or in quiet, the basic measurement of auditory psychophysics: on each trial the participant listens to two or three marked intervals and says which one held a short tone. A staircase in dB makes the tone quieter after correct answers and louder after mistakes, and the threshold is the mean level of the last reversals. The default configuration follows the online tone-in-noise protocol of Zhao, Brown, Holt & Dick (2022), *Trends in Hearing*: a 1000 Hz, 250 ms tone with 10 ms ramps in white noise, three intervals, a 3-down/1-up staircase in dB SNR, a volume-setting screen and a headphone check. Sounds are synthesised in the browser (no audio files). Every option, its default and the evidence behind it is on the documentation site.

## Installation

```bash
npm install @jspsych-timelines/tone-detection
```

```html
<script src="https://unpkg.com/@jspsych-timelines/tone-detection"></script>
```

The package needs jsPsych 8.4.0 or later (`jsPsych.adaptive`) and a browser with the Web Audio API.

## Quick Start

```js
const jsPsych = initJsPsych();

const task = jsPsychTimelineToneDetection.createTimeline(jsPsych, {
  tone_frequency_hz: [500, 1000, 2000],
  trials_per_condition: 3,
});

jsPsych.run([task]);

// the threshold of each frequency (mean of the last 6 reversals of its tracks); exclusions are left to the analysis
jsPsychTimelineToneDetection.utils.scoring.calculateScores(jsPsych.data.get());
```

Detection in quiet: `stimulus_set: { masker: "none" }`. Two intervals: `task_variant: "2I-2AFC_which_contains_tone"`.

## Documentation

Full reference (options, data output, scoring, translation): `website/docs/reference/tone-detection.mdx` on the documentation site.

## License

MIT
