/**
 * Browser layout check of the go/no-go's stage anchoring (PACKAGE-STANDARD 5). Not part of
 * `npm test`. From this directory, after `npm run build`:
 *
 *   node ../testing/scripts/layout-check.mjs reproduction/layout.config.mjs
 *
 * It needs Chrome ($CHROME_PATH or a standard location).
 */
const options = {
  n_test_trials: 4,
  practice_trials: 3,
  condition_proportions: { go: 0.5, nogo: 0.5 },
  iti_ms: 300,
  trial_feedback: "accuracy",
  feedback_duration_ms: 400,
  feedback_condition: "all",
  stimulus_duration_ms: 300,
  response_window_ms: 600,
  inter_trial_display: "fixation_cross",
  rule_reminder: "on_screen",
  pre_block_countdown_ms: 300,
};

const STAR =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5 61 39H97L68 60 79 95 50 74 21 95 32 60 3 39H39Z" fill="#2a7"/></svg>';
const RING =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#c40" stroke-width="12"/></svg>';

export default {
  bundle: "dist/index.browser.js",
  global: "jsPsychTimelineGoNogo",
  stageSelector: ".jspsych-timelines-go-nogo-stage",
  belowSelector: ".jspsych-timelines-go-nogo-below",
  // runs in the page, so it uses nothing from this file
  screenKind: (stage, doc) =>
    !stage
      ? "text page"
      : doc.querySelector(".jspsych-timelines-go-nogo-item")
      ? "stimulus"
      : doc.querySelector(".jspsych-timelines-go-nogo-feedback")
      ? "feedback"
      : stage.textContent.trim()
      ? "fixation"
      : "iti",
  expectKinds: ["text page", "stimulus", "feedback", "fixation"],
  variants: [
    ...[
      { width: 1280, height: 800 },
      { width: 390, height: 800 },
    ].flatMap((viewport) => [
      {
        name: `keyboard ${viewport.width}x${viewport.height}`,
        viewport,
        options,
        keys: { stimulus: " " },
      },
      {
        name: `grid ${viewport.width}x${viewport.height}`,
        viewport,
        options: { ...options, stimulus_layout: "random_2x2_grid" },
        keys: { stimulus: " " },
      },
      {
        // a researcher's own pictures (SVG items), drawn at the stimulus size
        name: `own svg items ${viewport.width}x${viewport.height}`,
        viewport,
        options: {
          ...options,
          stimulus_set: {
            go: { id: "star", svg: STAR },
            nogo: { id: "ring", svg: RING },
          },
        },
        keys: { stimulus: " " },
      },
      {
        name: `touch ${viewport.width}x${viewport.height}`,
        viewport: { ...viewport, hasTouch: true },
        options: { ...options, response_device: "touch", stimulus_layout: "top_center" },
      },
    ]),
  ],
};
