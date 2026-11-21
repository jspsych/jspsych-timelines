/**
 * Browser layout check of the item grid's stage anchoring (PACKAGE-STANDARD 5). Not part of `npm test`. From this
 * directory, after `npm run build`:
 *
 *   node ../testing/scripts/layout-check.mjs reproduction/layout.config.mjs
 *
 * It needs Chrome ($CHROME_PATH or a standard location).
 *
 * The stage is the plugin's button group on a pick screen (the grid of items) and the fixed-size stage element on every
 * other screen (the blank between pages, feedback, hints). The check asserts the same centre on every kind of screen,
 * that no item is clipped, and that the buttons stay in the viewport. It clicks the first enabled item of every page.
 * There is no fixation mark in this task, so no `markSelector`.
 */
const short = {
  set_sizes: [12],
  trials_per_condition: 1,
  practice_trials: 1,
  practice: { set_sizes: [4] },
  iti_ms: 100,
  feedback_duration_ms: 200,
  trial_feedback: "accuracy",
  end_of_task_feedback: "score",
};

const VIEWPORTS = [
  { width: 1280, height: 800 },
  { width: 390, height: 800 },
  { width: 390, height: 430 },
];

export default {
  bundle: "dist/index.browser.js",
  global: "jsPsychTimelineSelfOrderedPointing",
  stageSelector:
    ".jspsych-timelines-self-ordered-pointing-pick #jspsych-html-button-response-btngroup, .jspsych-timelines-self-ordered-pointing-stage",
  belowSelector: ".jspsych-timelines-self-ordered-pointing-below",
  // runs in the page, so it uses nothing from this file
  screenKind: (stage, doc) =>
    !stage
      ? "text page"
      : stage.id === "jspsych-html-button-response-btngroup"
      ? "pick"
      : stage.querySelector(".jspsych-timelines-self-ordered-pointing-demo-item")
      ? "reveal"
      : stage.textContent.trim()
      ? "notice"
      : "gap",
  expectKinds: ["text page", "pick", "gap", "notice"],
  variants: [
    ...VIEWPORTS.map((viewport) => ({
      name: `mouse, grid, set of 12, repeat reminder ${viewport.width}x${viewport.height}`,
      viewport,
      options: { ...short, position_repeat_rule: "detect_and_remind" },
    })),
    ...VIEWPORTS.slice(1).map((viewport) => ({
      name: `touch, free positions, words, set of 12 ${viewport.width}x${viewport.height}`,
      viewport: { ...viewport, hasTouch: true },
      options: {
        ...short,
        response_device: "touch",
        stimulus_layout: "free_positions_in_area",
        stimulus_set: { items: "words" },
      },
    })),
    {
      name: "enforced position rule, partial reshuffle, nonwords 390x430",
      viewport: { width: 390, height: 430 },
      options: {
        ...short,
        set_sizes: [10],
        position_repeat_rule: "enforced",
        rearrangement_rule: "partial_reshuffle_each_page",
        stimulus_set: { items: "nonwords" },
      },
    },
  ],
};
