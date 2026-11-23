/**
 * Browser layout check of the stop-signal task's stage anchoring (PACKAGE-STANDARD 5). Not part of
 * `npm test`. From this directory, after `npm run build`:
 *
 *   node ../testing/scripts/layout-check.mjs reproduction/layout.config.mjs
 *
 * It needs Chrome ($CHROME_PATH or a standard location). Nobody presses a key on a go screen in the
 * keyboard variants, so every trial runs to the end of its window and the stop signal comes on
 * ("go signalled" is the stage with the signal showing). The static examples stand in for the walkthrough.
 */
const options = {
  n_test_trials: 8,
  n_blocks: 1,
  practice_trials: 4,
  condition_proportions: { stop: 0.5, go: 0.5 },
  iti_ms: 200,
  fixation_duration_ms: 250,
  response_window_ms: 800,
  trial_feedback: "accuracy",
  feedback_duration_ms: 300,
  instruction_demonstration: "examples",
  block_feedback: "none",
  difficulty_levels: [200],
};

export default {
  bundle: "dist/index.browser.js",
  global: "jsPsychTimelineStopSignalTask",
  stageSelector: ".jspsych-timelines-stop-signal-task-stage",
  belowSelector: ".jspsych-timelines-stop-signal-task-below",
  // runs in the page, so it uses nothing from this file
  screenKind: (stage, doc) =>
    !stage
      ? "text page"
      : stage.classList.contains("jspsych-timelines-stop-signal-task-signalled")
      ? "go signalled"
      : doc.querySelector(".jspsych-timelines-stop-signal-task-go")
      ? "go"
      : doc.querySelector(".jspsych-timelines-stop-signal-task-feedback")
      ? "feedback"
      : stage.textContent.trim()
      ? "fixation"
      : "iti",
  // "go signalled" is seen in the keyboard variants only (the touch variants click at once); the
  // config has one expectKinds for all variants, so it is not listed here. Check the output for it.
  expectKinds: ["text page", "fixation", "go", "feedback", "iti"],
  maxMs: 90000,
  variants: [
    ...[
      { width: 1280, height: 800 },
      { width: 390, height: 800 },
    ].flatMap((viewport) => [
      {
        name: `keyboard, red arrow ${viewport.width}x${viewport.height}`,
        viewport,
        options,
      },
      {
        name: `keyboard, frame ${viewport.width}x${viewport.height}`,
        viewport,
        options: { ...options, stimulus_set: { stop_signal: "border" } },
      },
      {
        // the buttons are clicked at once, so the signal is not seen here
        name: `touch ${viewport.width}x${viewport.height}`,
        viewport: { ...viewport, hasTouch: true },
        options: { ...options, response_device: "touch" },
      },
    ]),
  ],
};
