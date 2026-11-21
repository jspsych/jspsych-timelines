/**
 * Browser layout check of the two-step task's stage anchoring (PACKAGE-STANDARD 5). Not part of
 * `npm test`. From this directory, after `npm run build`:
 *
 *   node ../testing/scripts/layout-check.mjs reproduction/layout.config.mjs
 *
 * It needs Chrome ($CHROME_PATH or a standard location).
 */
const options = {
  practice_trials: 2,
  n_test_trials: 3,
  n_blocks: 1,
  iti_ms: 300,
  feedback_duration_ms: 400,
  response_acknowledgement_ms: 300,
  fixation_duration_ms: 300,
  timeout_message_ms: 400,
  manipulation_check: "questionnaire",
  rest_breaks: "none",
};

export default {
  bundle: "dist/index.browser.js",
  global: "jsPsychTimelineTwoStepTask",
  stageSelector: ".ts-stage",
  belowSelector: ".ts-below",
  // the fixation mark must not move between screens
  markSelector: ".ts-fixation",
  // runs in the page, so it uses nothing from this file
  screenKind: (stage, doc) =>
    !stage
      ? "text page"
      : doc.querySelector(".ts-statement")
      ? "question"
      : doc.querySelector(".ts-outcome")
      ? "outcome"
      : doc.querySelector(".ts-message")
      ? "message"
      : doc.querySelector(".ts-fixation")
      ? "fixation"
      : doc.querySelector(".ts-chosen")
      ? "highlight"
      : doc.querySelector(".ts-pair")
      ? "choice"
      : "iti",
  expectKinds: ["text page", "fixation", "choice", "highlight", "outcome", "question"],
  variants: [
    ...[
      { width: 1280, height: 800 },
      { width: 390, height: 800 },
      { width: 1280, height: 430 },
    ].flatMap((viewport) => [
      {
        name: `abstract symbols ${viewport.width}x${viewport.height}`,
        viewport,
        options: { ...options, contingency_disclosure: "partial" },
        keys: { choice: "ArrowLeft", question: "ArrowLeft" },
      },
      {
        name: `spaceships, full disclosure ${viewport.width}x${viewport.height}`,
        viewport,
        options: {
          ...options,
          instruction_framing: "spaceship_planet_alien",
          contingency_disclosure: "full",
        },
        keys: { choice: "ArrowRight", question: "ArrowRight" },
      },
    ]),
  ],
};
