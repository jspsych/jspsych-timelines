import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface TaskSwitchingOptions {
  /** Variant: "cued" shows explicit cue, "alternating" uses AABB pattern (default: "cued") */
  mode?: "cued" | "alternating";
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Number of test trials (default: 80) */
  numTrials?: number;
  /** Include practice block (default: true) */
  showPractice?: boolean;
  /** Number of practice trials (default: 16) */
  numPracticeTrials?: number;
  /** Feedback duration in ms (default: 500) */
  feedbackDuration?: number;
  /** Digit stimuli to use (default: [1,2,3,4,6,7,8,9]) */
  stimuli?: number[];
  /** Cue-stimulus interval in ms, cued mode only (default: 500) */
  csiDuration?: number;
  /** Pre-cue fixation duration in ms (default: 500) */
  fixationDuration?: number;
  /** Maximum response time in ms (default: 3000) */
  responseTimeout?: number;
  /** Inter-trial interval in ms (default: 200) */
  iti?: number;
  /** Proportion of switch trials, 0-1 (default: 0.5) */
  proportionSwitch?: number;
  /** Run length for alternating mode (default: 2) */
  runLength?: number;
  /** Number of test blocks (default: 1) */
  numBlocks?: number;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialVariable {
  stimulus_number: number;
  current_task: "magnitude" | "parity";
  previous_task: "magnitude" | "parity" | null;
  switch_type: "switch" | "repeat" | "first";
  correct_response: string;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "instructions" | "practice" | "test" | "completion";
  part: "fixation" | "cue" | "stimulus" | "feedback" | "iti";
  stimulus_number: number;
  current_task: "magnitude" | "parity";
  previous_task: "magnitude" | "parity" | null;
  switch_type: "switch" | "repeat" | "first";
  correct_response: string;
  correct: boolean;
  rt: number | null;
  block: number;
}

export interface ScoringResult {
  accuracy: number;
  meanRT: number | null;
  switchRT: number | null;
  repeatRT: number | null;
  switchAccuracy: number;
  repeatAccuracy: number;
  switchCostRT: number | null;
  switchCostAccuracy: number;
  magnitudeRT: number | null;
  parityRT: number | null;
  magnitudeAccuracy: number;
  parityAccuracy: number;
  totalTrials: number;
  correctTrials: number;
  blocks?: BlockScoringResult[];
}

export interface BlockScoringResult {
  block: number;
  switchRT: number | null;
  repeatRT: number | null;
  switchAccuracy: number;
  repeatAccuracy: number;
  switchCostRT: number | null;
}

// Internal config type with all fields resolved
interface ResolvedConfig {
  mode: "cued" | "alternating";
  showInstructions: boolean;
  numTrials: number;
  showPractice: boolean;
  numPracticeTrials: number;
  feedbackDuration: number;
  stimuli: number[];
  csiDuration: number;
  fixationDuration: number;
  responseTimeout: number;
  iti: number;
  proportionSwitch: number;
  runLength: number;
  numBlocks: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "task-switching";
const VERSION = "0.0.1";

const DEFAULT_STIMULI = [1, 2, 3, 4, 6, 7, 8, 9];

const DEFAULT_OPTIONS = {
  mode: "cued" as const,
  showInstructions: true,
  numTrials: 80,
  showPractice: true,
  numPracticeTrials: 16,
  feedbackDuration: 500,
  stimuli: DEFAULT_STIMULI,
  csiDuration: 500,
  fixationDuration: 500,
  responseTimeout: 3000,
  iti: 200,
  proportionSwitch: 0.5,
  runLength: 2,
  numBlocks: 1,
};

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Determines the correct response label for a given digit and task.
 */
function getCorrectResponse(
  digit: number,
  task: "magnitude" | "parity",
  text: TextConfig
): string {
  if (task === "magnitude") {
    return digit < 5 ? text.button_low : text.button_high;
  } else {
    return digit % 2 === 0 ? text.button_even : text.button_odd;
  }
}

/**
 * Returns the button labels for a given task.
 */
function getButtonLabels(task: "magnitude" | "parity", text: TextConfig): [string, string] {
  if (task === "magnitude") {
    return [text.button_low, text.button_high];
  } else {
    return [text.button_odd, text.button_even];
  }
}

/**
 * Gets the cue text for a given task.
 */
function getCueText(task: "magnitude" | "parity", text: TextConfig): string {
  return task === "magnitude" ? text.cue_magnitude : text.cue_parity;
}

/**
 * Generates a trial sequence for cued mode.
 * Controls proportion of switch trials and limits consecutive same switch_type.
 */
function generateCuedSequence(
  numTrials: number,
  proportionSwitch: number,
  stimuli: number[],
  text: TextConfig
): TrialVariable[] {
  const trials: TrialVariable[] = [];

  // Determine switch/repeat assignments (first trial is always "first")
  const numSwitch = Math.round((numTrials - 1) * proportionSwitch);
  const numRepeat = numTrials - 1 - numSwitch;

  // Create switch type array for trials 2..N
  const switchTypes: ("switch" | "repeat")[] = [];
  for (let i = 0; i < numSwitch; i++) switchTypes.push("switch");
  for (let i = 0; i < numRepeat; i++) switchTypes.push("repeat");

  // Shuffle with max 4 consecutive same type constraint
  shuffleWithConstraint(switchTypes, 4);

  // Pick first task randomly
  const tasks: ("magnitude" | "parity")[] = ["magnitude", "parity"];
  let currentTask = tasks[Math.floor(Math.random() * 2)];

  // First trial
  const firstDigit = stimuli[Math.floor(Math.random() * stimuli.length)];
  trials.push({
    stimulus_number: firstDigit,
    current_task: currentTask,
    previous_task: null,
    switch_type: "first",
    correct_response: getCorrectResponse(firstDigit, currentTask, text),
  });

  // Remaining trials
  for (let i = 0; i < switchTypes.length; i++) {
    const previousTask = currentTask;
    if (switchTypes[i] === "switch") {
      currentTask = currentTask === "magnitude" ? "parity" : "magnitude";
    }
    const digit = stimuli[Math.floor(Math.random() * stimuli.length)];
    trials.push({
      stimulus_number: digit,
      current_task: currentTask,
      previous_task: previousTask,
      switch_type: switchTypes[i],
      correct_response: getCorrectResponse(digit, currentTask, text),
    });
  }

  return trials;
}

/**
 * Generates a trial sequence for alternating mode.
 * Tasks alternate in runs of runLength (e.g., AABB pattern).
 */
function generateAlternatingSequence(
  numTrials: number,
  runLength: number,
  stimuli: number[],
  text: TextConfig
): TrialVariable[] {
  const trials: TrialVariable[] = [];
  const tasks: ("magnitude" | "parity")[] = ["magnitude", "parity"];

  // Start with a random task
  let taskIndex = Math.floor(Math.random() * 2);
  let positionInRun = 0;

  for (let i = 0; i < numTrials; i++) {
    const currentTask = tasks[taskIndex];
    const digit = stimuli[Math.floor(Math.random() * stimuli.length)];

    let previousTask: "magnitude" | "parity" | null = null;
    let switchType: "switch" | "repeat" | "first" = "first";

    if (i > 0) {
      previousTask = trials[i - 1].current_task;
      switchType = currentTask !== previousTask ? "switch" : "repeat";
    }

    trials.push({
      stimulus_number: digit,
      current_task: currentTask,
      previous_task: previousTask,
      switch_type: switchType,
      correct_response: getCorrectResponse(digit, currentTask, text),
    });

    positionInRun++;
    if (positionInRun >= runLength) {
      positionInRun = 0;
      taskIndex = (taskIndex + 1) % 2;
    }
  }

  return trials;
}

/**
 * Shuffles an array in place, then applies a constraint to limit
 * consecutive elements of the same value.
 */
function shuffleWithConstraint<T>(arr: T[], maxConsecutive: number): void {
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // Apply constraint: swap violations with later elements
  const maxAttempts = arr.length * 10;
  let attempts = 0;

  for (let i = maxConsecutive; i < arr.length && attempts < maxAttempts; i++) {
    let allSame = true;
    for (let k = i - maxConsecutive; k < i; k++) {
      if (arr[k] !== arr[i]) {
        allSame = false;
        break;
      }
    }

    if (allSame) {
      let swapped = false;
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j] !== arr[i]) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swapped = true;
          break;
        }
      }
      if (!swapped) {
        for (let j = 0; j < i - maxConsecutive; j++) {
          if (arr[j] !== arr[i]) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            break;
          }
        }
      }
      attempts++;
    }
  }
}

/**
 * Creates disabled button HTML for non-response trials.
 */
function createDisabledButtonHtml(choice: string): string {
  return `<button class="jspsych-btn" disabled>${choice}</button>`;
}

/**
 * Creates the button HTML template for response buttons.
 */
function createButtonHtml(choice: string): string {
  return `<button class="jspsych-btn">${choice}</button>`;
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials for the Task Switching paradigm.
 */
function createInstructionTrials(config: ResolvedConfig) {
  const timeline: any[] = [];

  // Page 1: Introduction
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_intro,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  });

  // Page 2: Magnitude task
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_magnitude,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  });

  // Page 3: Parity task
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_parity,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  });

  // Page 4: Practice intro
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_practice,
    choices: [config.text.start_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  });

  return { timeline };
}

/**
 * Creates a fixation trial with disabled buttons showing upcoming task labels.
 */
function createFixationTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig
) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"><div class="ts-fixation">${config.text.fixation}</div></div>`,
    choices: () => {
      const currentTask = jsPsych.evaluateTimelineVariable("current_task") as "magnitude" | "parity";
      return getButtonLabels(currentTask, config.text);
    },
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.fixationDuration,
    data: {
      task: TASK_NAME,
      part: "fixation",
    },
  };
}

/**
 * Creates a cue trial (cued mode only).
 * Shows the task cue with disabled buttons.
 */
function createCueTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig
) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const currentTask = jsPsych.evaluateTimelineVariable("current_task") as "magnitude" | "parity";
      const cueText = getCueText(currentTask, config.text);
      return `<div class="trial-content"><div class="ts-cue">${cueText}</div></div>`;
    },
    choices: () => {
      const currentTask = jsPsych.evaluateTimelineVariable("current_task") as "magnitude" | "parity";
      return getButtonLabels(currentTask, config.text);
    },
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.csiDuration,
    data: {
      task: TASK_NAME,
      part: "cue",
    },
  };
}

/**
 * Creates a stimulus trial for cued mode.
 */
function createCuedStimulusTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  phase: "practice" | "test",
  blockNumber: number
) {
  let trialCounter = 0;

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const digit = jsPsych.evaluateTimelineVariable("stimulus_number") as number;
      return `<div class="trial-content"><div class="ts-stimulus">${digit}</div></div>`;
    },
    choices: () => {
      const currentTask = jsPsych.evaluateTimelineVariable("current_task") as "magnitude" | "parity";
      return getButtonLabels(currentTask, config.text);
    },
    button_html: createButtonHtml,
    trial_duration: config.responseTimeout,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: phase,
      block: blockNumber,
      trial: () => ++trialCounter,
      stimulus_number: () => jsPsych.evaluateTimelineVariable("stimulus_number"),
      current_task: () => jsPsych.evaluateTimelineVariable("current_task"),
      previous_task: () => jsPsych.evaluateTimelineVariable("previous_task"),
      switch_type: () => jsPsych.evaluateTimelineVariable("switch_type"),
      correct_response: () => jsPsych.evaluateTimelineVariable("correct_response"),
      part: "stimulus",
    },
    on_finish: (data: any) => {
      if (data.response === null) {
        data.correct = false;
      } else {
        const currentTask = data.current_task as "magnitude" | "parity";
        const labels = getButtonLabels(currentTask, config.text);
        const chosenLabel = labels[data.response];
        data.correct = chosenLabel === data.correct_response;
      }
    },
  };
}

/**
 * Creates a stimulus trial for alternating mode.
 * Shows a task label above the digit.
 */
function createAlternatingStimulusTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  phase: "practice" | "test",
  blockNumber: number
) {
  let trialCounter = 0;

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const digit = jsPsych.evaluateTimelineVariable("stimulus_number") as number;
      const currentTask = jsPsych.evaluateTimelineVariable("current_task") as "magnitude" | "parity";
      const taskLabel = getCueText(currentTask, config.text);
      return `<div class="trial-content"><div><div class="ts-task-label">${taskLabel}</div><div class="ts-stimulus">${digit}</div></div></div>`;
    },
    choices: () => {
      const currentTask = jsPsych.evaluateTimelineVariable("current_task") as "magnitude" | "parity";
      return getButtonLabels(currentTask, config.text);
    },
    button_html: createButtonHtml,
    trial_duration: config.responseTimeout,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: phase,
      block: blockNumber,
      trial: () => ++trialCounter,
      stimulus_number: () => jsPsych.evaluateTimelineVariable("stimulus_number"),
      current_task: () => jsPsych.evaluateTimelineVariable("current_task"),
      previous_task: () => jsPsych.evaluateTimelineVariable("previous_task"),
      switch_type: () => jsPsych.evaluateTimelineVariable("switch_type"),
      correct_response: () => jsPsych.evaluateTimelineVariable("correct_response"),
      part: "stimulus",
    },
    on_finish: (data: any) => {
      if (data.response === null) {
        data.correct = false;
      } else {
        const currentTask = data.current_task as "magnitude" | "parity";
        const labels = getButtonLabels(currentTask, config.text);
        const chosenLabel = labels[data.response];
        data.correct = chosenLabel === data.correct_response;
      }
    },
  };
}

/**
 * Creates a feedback trial.
 */
function createFeedbackTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig
) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().last(1).values()[0];
      let feedbackText: string;
      let feedbackClass: string;

      if (lastTrial.response === null) {
        feedbackText = config.text.feedback_timeout;
        feedbackClass = "feedback timeout";
      } else if (lastTrial.correct) {
        feedbackText = config.text.feedback_correct;
        feedbackClass = "feedback correct";
      } else {
        feedbackText = config.text.feedback_incorrect;
        feedbackClass = "feedback incorrect";
      }

      return `<div class="trial-content"><div class="${feedbackClass}">${feedbackText}</div></div>`;
    },
    choices: () => {
      const currentTask = jsPsych.evaluateTimelineVariable("current_task") as "magnitude" | "parity";
      return getButtonLabels(currentTask, config.text);
    },
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.feedbackDuration,
    data: {
      task: TASK_NAME,
      part: "feedback",
    },
  };
}

/**
 * Creates an ITI (inter-trial interval) trial.
 */
function createItiTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig
) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"></div>`,
    choices: () => {
      const currentTask = jsPsych.evaluateTimelineVariable("current_task") as "magnitude" | "parity";
      return getButtonLabels(currentTask, config.text);
    },
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.iti,
    data: {
      task: TASK_NAME,
      part: "iti",
    },
  };
}

/**
 * Creates a rest screen between blocks.
 */
function createRestScreen(config: ResolvedConfig, blockNumber: number) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="instructions"><p>${config.text.rest_message(blockNumber)}</p></div>`,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "test",
      part: "rest",
    },
  };
}

/**
 * Creates a transition screen between phases.
 */
function createTransitionTrial(message: string, buttonLabel: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="instructions"><p>${message}</p></div>`,
    choices: [buttonLabel],
    data: {
      task: TASK_NAME,
      part: "transition",
    },
  };
}

/**
 * Creates a completion screen showing results.
 */
function createCompletionTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const data = jsPsych.data.get();
      const scores = calculateScores(data);

      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += `<h2>${config.text.task_complete}</h2>`;
      html += config.text.result_summary(scores.accuracy, scores.switchCostRT, scores.meanRT);
      html += `</div>`;
      return html;
    },
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "completion",
    },
  };
}

/**
 * Creates a practice block.
 */
function createPracticeBlock(jsPsych: JsPsych, config: ResolvedConfig) {
  const trialVariables =
    config.mode === "cued"
      ? generateCuedSequence(config.numPracticeTrials, config.proportionSwitch, config.stimuli, config.text)
      : generateAlternatingSequence(config.numPracticeTrials, config.runLength, config.stimuli, config.text);

  const trialTimeline: any[] = [createFixationTrial(jsPsych, config)];

  if (config.mode === "cued") {
    trialTimeline.push(createCueTrial(jsPsych, config));
    trialTimeline.push(createCuedStimulusTrial(jsPsych, config, "practice", 1));
  } else {
    trialTimeline.push(createAlternatingStimulusTrial(jsPsych, config, "practice", 1));
  }

  trialTimeline.push(createFeedbackTrial(jsPsych, config));
  trialTimeline.push(createItiTrial(jsPsych, config));

  return {
    timeline: trialTimeline,
    timeline_variables: trialVariables,
  };
}

/**
 * Creates a test block.
 */
function createTestBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  blockNumber: number
) {
  const trialsPerBlock = Math.ceil(config.numTrials / config.numBlocks);

  const trialVariables =
    config.mode === "cued"
      ? generateCuedSequence(trialsPerBlock, config.proportionSwitch, config.stimuli, config.text)
      : generateAlternatingSequence(trialsPerBlock, config.runLength, config.stimuli, config.text);

  const trialTimeline: any[] = [createFixationTrial(jsPsych, config)];

  if (config.mode === "cued") {
    trialTimeline.push(createCueTrial(jsPsych, config));
    trialTimeline.push(createCuedStimulusTrial(jsPsych, config, "test", blockNumber));
  } else {
    trialTimeline.push(createAlternatingStimulusTrial(jsPsych, config, "test", blockNumber));
  }

  trialTimeline.push(createItiTrial(jsPsych, config));

  return {
    timeline: trialTimeline,
    timeline_variables: trialVariables,
  };
}

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics from the Task Switching data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "stimulus" })
    .values() as TrialData[];

  if (testTrials.length === 0) {
    return {
      accuracy: 0,
      meanRT: null,
      switchRT: null,
      repeatRT: null,
      switchAccuracy: 0,
      repeatAccuracy: 0,
      switchCostRT: null,
      switchCostAccuracy: 0,
      magnitudeRT: null,
      parityRT: null,
      magnitudeAccuracy: 0,
      parityAccuracy: 0,
      totalTrials: 0,
      correctTrials: 0,
    };
  }

  const correctTrials = testTrials.filter((t) => t.correct);
  const accuracy = correctTrials.length / testTrials.length;
  const correctRTs = correctTrials
    .filter((t) => t.rt !== null)
    .map((t) => t.rt as number);
  const meanRT = mean(correctRTs);

  // By switch type (excluding "first" trials)
  const switchTrials = testTrials.filter((t) => t.switch_type === "switch");
  const repeatTrials = testTrials.filter((t) => t.switch_type === "repeat");

  const switchAccuracy =
    switchTrials.length > 0
      ? switchTrials.filter((t) => t.correct).length / switchTrials.length
      : 0;
  const repeatAccuracy =
    repeatTrials.length > 0
      ? repeatTrials.filter((t) => t.correct).length / repeatTrials.length
      : 0;

  const switchRT = mean(
    switchTrials
      .filter((t) => t.correct && t.rt !== null)
      .map((t) => t.rt as number)
  );
  const repeatRT = mean(
    repeatTrials
      .filter((t) => t.correct && t.rt !== null)
      .map((t) => t.rt as number)
  );

  const switchCostRT =
    switchRT !== null && repeatRT !== null ? switchRT - repeatRT : null;
  const switchCostAccuracy = repeatAccuracy - switchAccuracy;

  // By task type
  const magnitudeTrials = testTrials.filter((t) => t.current_task === "magnitude");
  const parityTrials = testTrials.filter((t) => t.current_task === "parity");

  const magnitudeAccuracy =
    magnitudeTrials.length > 0
      ? magnitudeTrials.filter((t) => t.correct).length / magnitudeTrials.length
      : 0;
  const parityAccuracy =
    parityTrials.length > 0
      ? parityTrials.filter((t) => t.correct).length / parityTrials.length
      : 0;

  const magnitudeRT = mean(
    magnitudeTrials
      .filter((t) => t.correct && t.rt !== null)
      .map((t) => t.rt as number)
  );
  const parityRT = mean(
    parityTrials
      .filter((t) => t.correct && t.rt !== null)
      .map((t) => t.rt as number)
  );

  // Per-block breakdown
  const result: ScoringResult = {
    accuracy,
    meanRT,
    switchRT,
    repeatRT,
    switchAccuracy,
    repeatAccuracy,
    switchCostRT,
    switchCostAccuracy,
    magnitudeRT,
    parityRT,
    magnitudeAccuracy,
    parityAccuracy,
    totalTrials: testTrials.length,
    correctTrials: correctTrials.length,
  };

  // Add per-block breakdown if multiple blocks
  const blockNumbers = [...new Set(testTrials.map((t) => t.block))];
  if (blockNumbers.length > 1) {
    result.blocks = blockNumbers.map((blockNum) => {
      const blockTrials = testTrials.filter((t) => t.block === blockNum);
      const blockSwitch = blockTrials.filter((t) => t.switch_type === "switch");
      const blockRepeat = blockTrials.filter((t) => t.switch_type === "repeat");

      const bSwitchRT = mean(
        blockSwitch.filter((t) => t.correct && t.rt !== null).map((t) => t.rt as number)
      );
      const bRepeatRT = mean(
        blockRepeat.filter((t) => t.correct && t.rt !== null).map((t) => t.rt as number)
      );

      return {
        block: blockNum,
        switchRT: bSwitchRT,
        repeatRT: bRepeatRT,
        switchAccuracy:
          blockSwitch.length > 0
            ? blockSwitch.filter((t) => t.correct).length / blockSwitch.length
            : 0,
        repeatAccuracy:
          blockRepeat.length > 0
            ? blockRepeat.filter((t) => t.correct).length / blockRepeat.length
            : 0,
        switchCostRT:
          bSwitchRT !== null && bRepeatRT !== null ? bSwitchRT - bRepeatRT : null,
      };
    });
  }

  return result;
}

/**
 * Returns a summary of the Task Switching performance.
 */
function getSummary(
  data: DataCollection
): ScoringResult & { taskName: string; version: string } {
  const scores = calculateScores(data);
  return {
    ...scores,
    taskName: TASK_NAME,
    version: VERSION,
  };
}

// -- MAIN EXPORT --

/**
 * Creates the complete Task Switching timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const taskSwitching = createTimeline(jsPsych, {
 *   mode: "cued",
 *   numTrials: 80,
 * });
 * jsPsych.run([taskSwitching]);
 * ```
 */
export function createTimeline(jsPsych: JsPsych, options: TaskSwitchingOptions = {}) {
  // Merge text with defaults
  const text: TextConfig = { ...defaultText, ...options.text };

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    stimuli: options.stimuli || DEFAULT_STIMULI,
    text,
  };

  const timeline: any[] = [];

  // Instructions
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config));
  }

  // Practice
  if (config.showPractice && config.numPracticeTrials > 0) {
    timeline.push(createPracticeBlock(jsPsych, config));
    timeline.push(
      createTransitionTrial(
        config.text.instruction_task.replace(/<[^>]*>/g, "").trim(),
        config.text.start_button
      )
    );
  }

  // Test blocks
  for (let block = 1; block <= config.numBlocks; block++) {
    if (block > 1) {
      timeline.push(createRestScreen(config, block - 1));
    }
    timeline.push(createTestBlock(jsPsych, config, block));
  }

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Task Switching experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createFixationTrial,
  createCueTrial,
  createCuedStimulusTrial,
  createAlternatingStimulusTrial,
  createFeedbackTrial,
  createItiTrial,
  createRestScreen,
  createTransitionTrial,
  createPracticeBlock,
  createTestBlock,
  createCompletionTrial,
};

/**
 * Utility functions for the Task Switching paradigm.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  sequence: {
    generateCuedSequence,
    generateAlternatingSequence,
  },
  constants: {
    TASK_NAME,
    VERSION,
    DEFAULT_OPTIONS,
    DEFAULT_STIMULI,
  },
  text: defaultText,
};

// Re-export types
export type { TextConfig };
