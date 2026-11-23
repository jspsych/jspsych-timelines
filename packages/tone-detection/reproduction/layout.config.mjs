/**
 * Browser layout check of the tone detection task's stage anchoring (PACKAGE-STANDARD 5). Not part of
 * `npm test`. From this directory, after `npm run build`:
 *
 *   node ../testing/scripts/layout-check.mjs reproduction/layout.config.mjs
 *
 * It needs Chrome ($CHROME_PATH or a standard location). The stage holds the interval markers, drawn the same
 * way on every screen of a trial (listening, response, feedback, pause), so `markSelector` is the first marker:
 * it must not move. Response screens get a key press (keyboard variants), or the check clicks the buttons (mouse, touch).
 * The check clicks every enabled button, so the volume page's sound button is not a `jspsych-btn`.
 */
const options = {
  trials_per_condition: 1,
  practice_trials: 3,
  adaptive: { discontinue_rule: { trials: 4 } },
  headphone_check_trials: 1,
  trial_feedback: "accuracy",
  feedback_duration_ms: 300,
  iti_ms: 200,
  inter_item_interval_ms: 100,
  stimulus_duration_ms: 100,
};

export default {
  bundle: "dist/index.browser.js",
  global: "jsPsychTimelineToneDetection",
  stageSelector: ".jspsych-timelines-tone-detection-stage",
  belowSelector: ".jspsych-timelines-tone-detection-below",
  markSelector: ".jspsych-timelines-tone-detection-marker",
  // runs in the page, so it uses nothing from this file
  screenKind: (stage, doc) => {
    if (!stage) return "text page";
    const below = doc.querySelector(".jspsych-timelines-tone-detection-below");
    if (doc.querySelector(".jspsych-timelines-tone-detection-feedback")) return "feedback";
    const t = below ? below.textContent.trim() : "";
    if (!below) return "pause";
    if (/^Listen/.test(t)) return "listening";
    if (/^Which (interval|tone)/.test(t)) return "response";
    return "caption";
  },
  expectKinds: ["text page", "listening", "response", "feedback", "pause"],
  maxMs: 150000,
  variants: [
    ...[
      { width: 1280, height: 800 },
      { width: 390, height: 800 },
    ].flatMap((viewport) => [
      {
        name: `keyboard ${viewport.width}x${viewport.height}`,
        viewport,
        options,
        keys: { response: "1", caption: "1" },
      },
      {
        name: `mouse ${viewport.width}x${viewport.height}`,
        viewport,
        options: { ...options, response_device: "mouse" },
      },
      {
        name: `touch ${viewport.width}x${viewport.height}`,
        viewport: { ...viewport, hasTouch: true },
        options: { ...options, response_device: "touch" },
      },
    ]),
  ],
};
