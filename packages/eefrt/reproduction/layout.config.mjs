/**
 * Browser layout check of the EEfRT's stage anchoring (PACKAGE-STANDARD 5). Not part of `npm test`.
 * From this directory, after `npm run build`:
 *
 *   node ../testing/scripts/layout-check.mjs reproduction/layout.config.mjs
 *
 * It needs Chrome ($CHROME_PATH or a standard location). The options shrink the task (a few presses,
 * short screens) so that the check steps through every screen type in under a minute.
 */
const options = {
  practice_trials: 2, // the first two are assigned: an easy and a hard effort screen
  task_end_rule: "fixed_trial_count",
  n_test_trials: 2,
  difficulty_levels: { easy: 5, hard: 8 },
  response_window_ms: { choice: 4000, easy: 5000, hard: 6000 },
  fixation_duration_ms: 300,
  pre_block_countdown_ms: 300,
  feedback_duration_ms: 400,
};

export default {
  bundle: "dist/index.browser.js",
  global: "jsPsychTimelineEefrt",
  stageSelector: ".jspsych-timelines-eefrt-stage",
  belowSelector: ".jspsych-timelines-eefrt-below",
  // the fixation mark must not move between screens that show it
  markSelector: ".jspsych-timelines-eefrt-fixation",
  maxMs: 120000,
  // runs in the page, so it uses nothing from this file
  screenKind: (stage, doc) =>
    !stage
      ? "text page"
      : doc.querySelector(".jspsych-timelines-eefrt-choice")
      ? "choice"
      : doc.querySelector(".jspsych-timelines-eefrt-effort")
      ? "effort"
      : doc.querySelector(".jspsych-timelines-eefrt-fixation-layer")
      ? "fixation"
      : doc.querySelector(".ready")
      ? "ready"
      : doc.querySelector(".completed, .not-completed")
      ? "completion feedback"
      : "reward feedback",
  expectKinds: [
    "text page",
    "fixation",
    "choice",
    "ready",
    "effort",
    "completion feedback",
    "reward feedback",
  ],
  variants: [
    ...[
      { width: 1280, height: 800 },
      { width: 390, height: 800 },
      { width: 1024, height: 430 },
    ].flatMap((viewport) => [
      {
        name: `progress bar ${viewport.width}x${viewport.height}`,
        viewport,
        options,
        keys: { choice: "e", effort: " " },
      },
    ]),
    {
      name: "counter, points, 2 effort keys 1280x800",
      viewport: { width: 1280, height: 800 },
      options: {
        ...options,
        progress_indicator: "counter",
        outcome_type: "points",
        response_key_mapping: { easy: "f", hard: "j" },
      },
      keys: { choice: "e", effort: "f" },
    },
  ],
};
