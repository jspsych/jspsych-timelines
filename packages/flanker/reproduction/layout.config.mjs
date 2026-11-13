/**
 * Browser layout check of the flanker's stage anchoring (PACKAGE-STANDARD 5). Not part of
 * `npm test`. From this directory, after `npm run build`:
 *
 *   node ../testing/scripts/layout-check.mjs reproduction/layout.config.mjs
 *
 * It needs Chrome ($CHROME_PATH or a standard location).
 */
const options = {
  n_test_trials: 4,
  practice_trials: 3,
  iti_ms: 300,
  trial_feedback: "accuracy",
  feedback_duration_ms: 400,
  feedback_condition: "all",
  practice: { trial_feedback: "accuracy_rt" },
};

export default {
  bundle: "dist/index.browser.js",
  global: "jsPsychTimelineFlanker",
  stageSelector: ".jspsych-timelines-flanker-stage",
  belowSelector: ".jspsych-timelines-flanker-below",
  // runs in the page, so it uses nothing from this file
  screenKind: (stage, doc) =>
    !stage
      ? "text page"
      : doc.querySelector(".jspsych-timelines-flanker-array")
      ? "array"
      : doc.querySelector(".jspsych-timelines-flanker-feedback")
      ? "feedback"
      : doc.querySelector(".dot")
      ? "cue"
      : stage.textContent.trim()
      ? "fixation"
      : "iti",
  expectKinds: ["text page", "fixation", "array", "feedback", "iti"],
  variants: [
    ...[
      { width: 1280, height: 800 },
      { width: 390, height: 800 },
    ].flatMap((viewport) => [
      {
        name: `keyboard ${viewport.width}x${viewport.height}`,
        viewport,
        options: { ...options, cue_target_interval_ms: 300, stimulus_set: { cue: "circles" } },
        keys: { array: "z" },
      },
      {
        name: `touch ${viewport.width}x${viewport.height}`,
        viewport: { ...viewport, hasTouch: true },
        options: { ...options, response_device: "touch" },
      },
    ]),
  ],
};
