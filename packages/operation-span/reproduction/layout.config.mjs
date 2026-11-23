/**
 * Browser layout check of the operation span's stage anchoring (PACKAGE-STANDARD 5). Not part of
 * `npm test`. From this directory, after `npm run build`:
 *
 *   node ../testing/scripts/layout-check.mjs reproduction/layout.config.mjs
 *
 * It needs Chrome ($CHROME_PATH or a standard location).
 *
 * The span's trial has several parts, so the stage is whichever element the participant attends to: the
 * problem, the proposed answer, a memorandum, a feedback notice, the gap between events, and the recall
 * panel (a taller stage on the same centre). The check asserts the same centre on every kind of screen.
 */
const short = {
  set_sizes: [2],
  trials_per_condition: 1,
  practice_trials: 2,
  practice_storage_trials: 1,
  practice_combined_trials: 1,
  stimulus_duration_ms: 300,
  feedback_duration_ms: 300,
  inter_item_interval_ms: 200,
  trial_feedback: "accuracy",
  end_of_task_feedback: "score",
};

export default {
  bundle: "dist/index.browser.js",
  global: "jsPsychTimelineOperationSpan",
  stageSelector: ".jspsych-timelines-operation-span-stage",
  belowSelector: ".jspsych-timelines-operation-span-below",
  // runs in the page, so it uses nothing from this file
  screenKind: (stage, doc) =>
    !stage
      ? "text page"
      : stage.querySelector(".jspsych-timelines-operation-span-recall")
      ? "recall"
      : stage.querySelector(".jspsych-timelines-operation-span-memorandum")
      ? "memorandum"
      : stage.querySelector(".jspsych-timelines-operation-span-problem")
      ? stage.textContent.includes("?")
        ? "problem"
        : "answer"
      : stage.textContent.trim()
      ? "notice"
      : "gap",
  expectKinds: ["text page", "problem", "memorandum", "gap", "recall", "notice"],
  variants: [
    ...[
      { width: 1280, height: 800 },
      { width: 390, height: 800 },
      { width: 390, height: 430 },
    ].map((viewport) => ({
      name: `mouse, two screens ${viewport.width}x${viewport.height}`,
      viewport,
      options: short,
    })),
    ...[
      { width: 1280, height: 800 },
      { width: 390, height: 430 },
    ].map((viewport) => ({
      name: `keyboard, one screen, typed recall ${viewport.width}x${viewport.height}`,
      viewport,
      options: {
        ...short,
        processing_display_format: "equation_with_answer_single_screen",
        response_device: { processing: "keyboard", recall: "keyboard" },
        response_format: "free_text",
      },
      keys: { problem: "f" },
    })),
    // one variant per bundled memorandum set (letters are the default above), and an own set of longer words
    {
      name: "digits 390x430",
      viewport: { width: 390, height: 430 },
      options: { ...short, stimulus_set: { memorandum: { $util: "stimuli.digits" } } },
    },
    {
      name: "own word set 390x800",
      viewport: { width: 390, height: 800 },
      options: {
        ...short,
        stimulus_set: {
          memorandum: {
            name: "words",
            noun: { singular: "word", plural: "words" },
            items: [
              "apple",
              "bread",
              "chair",
              "dance",
              "eagle",
              "flame",
              "grape",
              "house",
              "ivory",
              "jelly",
              "knife",
              "lemon",
              "mouse",
              "night",
              "ocean",
              "plant",
            ],
          },
        },
      },
    },
    {
      name: "touch, memorandum first 390x800",
      viewport: { width: 390, height: 800, hasTouch: true },
      options: { ...short, response_device: "touch", memorandum_order_in_pair: "memorandum_first" },
    },
  ],
};
