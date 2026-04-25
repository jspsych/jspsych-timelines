import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychStopSignal from "@jspsych-contrib/plugin-stop-signal";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface StopSignalTaskOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Show feedback during practice (default: true) */
  showPracticeFeedback?: boolean;
  /** Show feedback during test (default: false) */
  showTestFeedback?: boolean;
  /** Number of practice trials (default: 24) */
  numPracticeTrials?: number;
  /** Number of test trials (default: 192) */
  numTestTrials?: number;
  /** Fixation cross duration in ms (default: 500) */
  fixationDuration?: number;
  /** Maximum response time in ms (default: 1500) */
  responseDuration?: number;
  /** Feedback display duration in ms (default: 400) */
  feedbackDuration?: number;
  /** Inter-trial interval in ms (default: 1000) */
  interTrialInterval?: number;
  /** Proportion of stop trials, 0-1 (default: 0.25) */
  stopProbability?: number;
  /** Initial stop signal delay in ms (default: 250) */
  initialSSD?: number;
  /** Step size for SSD adjustment in ms (default: 50) */
  ssdStep?: number;
  /** Minimum SSD in ms (default: 50) */
  minSSD?: number;
  /** Maximum SSD in ms (default: 800) */
  maxSSD?: number;
  /** Maximum consecutive stop trials (default: 3) */
  maxConsecutiveStop?: number;
  /** Maximum consecutive go trials (default: 5) */
  maxConsecutiveGo?: number;
  /** Stimulus width in pixels (default: 100) */
  stimulusWidth?: number;
  /** Stimulus height in pixels (default: 100) */
  stimulusHeight?: number;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "practice" | "test";
  trial_index: number;
  direction: "left" | "right";
  trial_type_sst: "go" | "stop";
  ssd: number | null;
  response: number | null;
  correct: boolean;
  rt: number | null;
  part: string;
}

export interface ScoringResult {
  goAccuracy: number;
  stopAccuracy: number;
  meanGoRT: number | null;
  goRTStandardDeviation: number | null;
  meanSSD: number | null;
  ssrt: number | null;
  commissionErrors: number;
  omissionErrors: number;
  totalGoTrials: number;
  totalStopTrials: number;
}

// Internal config type with all fields resolved
interface ResolvedConfig {
  showInstructions: boolean;
  showPracticeFeedback: boolean;
  showTestFeedback: boolean;
  numPracticeTrials: number;
  numTestTrials: number;
  fixationDuration: number;
  responseDuration: number;
  feedbackDuration: number;
  interTrialInterval: number;
  stopProbability: number;
  initialSSD: number;
  ssdStep: number;
  minSSD: number;
  maxSSD: number;
  maxConsecutiveStop: number;
  maxConsecutiveGo: number;
  stimulusWidth: number;
  stimulusHeight: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "stop-signal-task";
const VERSION = "0.0.1";

const LEFT_BUTTON_INDEX = 0;
const RIGHT_BUTTON_INDEX = 1;

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPracticeFeedback: true,
  showTestFeedback: false,
  numPracticeTrials: 24,
  numTestTrials: 192,
  fixationDuration: 500,
  responseDuration: 1500,
  feedbackDuration: 400,
  interTrialInterval: 1000,
  stopProbability: 0.25,
  initialSSD: 250,
  ssdStep: 50,
  minSSD: 50,
  maxSSD: 800,
  maxConsecutiveStop: 3,
  maxConsecutiveGo: 5,
  stimulusWidth: 100,
  stimulusHeight: 100,
};

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function standardDeviation(arr: number[]): number | null {
  if (arr.length < 2) return null;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, val) => sum + (val - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

/**
 * Creates an SVG data URI for an arrow.
 */
function createArrowSVG(direction: "left" | "right", color: string = "#1976D2"): string {
  const transform = direction === "left" ? ' transform="rotate(180 50 50)"' : "";
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="30,50 70,25 70,75" fill="${color}"${transform}/></svg>`
  )}`;
}

/**
 * Creates an SVG data URI for an arrow with a red X overlay (stop signal).
 */
function createStopArrowSVG(direction: "left" | "right"): string {
  const transform = direction === "left" ? ' transform="rotate(180 50 50)"' : "";
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="30,50 70,25 70,75" fill="#D32F2F"${transform}/><line x1="20" y1="20" x2="80" y2="80" stroke="#D32F2F" stroke-width="6"/><line x1="80" y1="20" x2="20" y2="80" stroke="#D32F2F" stroke-width="6"/></svg>`
  )}`;
}

interface TrialVariable {
  direction: "left" | "right";
  trial_type_sst: "go" | "stop";
  correct_response: number;
}

/**
 * Generates a balanced trial sequence with stop probability control
 * and consecutive-type constraints.
 */
function generateTrialSequence(
  numTrials: number,
  stopProbability: number,
  maxConsecutiveStop: number,
  maxConsecutiveGo: number
): TrialVariable[] {
  const numStopTrials = Math.round(numTrials * stopProbability);
  const numGoTrials = numTrials - numStopTrials;

  const trials: TrialVariable[] = [];

  // Generate go trials - balanced left/right
  const numGoLeft = Math.ceil(numGoTrials / 2);
  const numGoRight = numGoTrials - numGoLeft;
  for (let i = 0; i < numGoLeft; i++) {
    trials.push({
      direction: "left",
      trial_type_sst: "go",
      correct_response: LEFT_BUTTON_INDEX,
    });
  }
  for (let i = 0; i < numGoRight; i++) {
    trials.push({
      direction: "right",
      trial_type_sst: "go",
      correct_response: RIGHT_BUTTON_INDEX,
    });
  }

  // Generate stop trials - balanced left/right
  const numStopLeft = Math.ceil(numStopTrials / 2);
  const numStopRight = numStopTrials - numStopLeft;
  for (let i = 0; i < numStopLeft; i++) {
    trials.push({
      direction: "left",
      trial_type_sst: "stop",
      correct_response: LEFT_BUTTON_INDEX,
    });
  }
  for (let i = 0; i < numStopRight; i++) {
    trials.push({
      direction: "right",
      trial_type_sst: "stop",
      correct_response: RIGHT_BUTTON_INDEX,
    });
  }

  // Shuffle with constraints
  shuffleWithConstraint(trials, maxConsecutiveStop, maxConsecutiveGo);

  return trials;
}

/**
 * Shuffles an array in place, then applies constraints to limit
 * consecutive stop and go trials.
 */
function shuffleWithConstraint(
  trials: TrialVariable[],
  maxConsecutiveStop: number,
  maxConsecutiveGo: number
): void {
  // Fisher-Yates shuffle
  for (let i = trials.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [trials[i], trials[j]] = [trials[j], trials[i]];
  }

  // Apply constraint: swap violations with later trials
  const maxAttempts = trials.length * 10;
  let attempts = 0;

  for (let i = 1; i < trials.length && attempts < maxAttempts; i++) {
    // Count consecutive same type ending at position i
    let consecutiveCount = 1;
    for (let k = i - 1; k >= 0; k--) {
      if (trials[k].trial_type_sst === trials[i].trial_type_sst) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    const maxForType =
      trials[i].trial_type_sst === "stop" ? maxConsecutiveStop : maxConsecutiveGo;

    if (consecutiveCount > maxForType) {
      // Find a trial later in the array with a different type to swap
      let swapped = false;
      for (let j = i + 1; j < trials.length; j++) {
        if (trials[j].trial_type_sst !== trials[i].trial_type_sst) {
          [trials[i], trials[j]] = [trials[j], trials[i]];
          swapped = true;
          break;
        }
      }
      if (!swapped) {
        // Try swapping with an earlier trial
        for (let j = 0; j < i - maxForType; j++) {
          if (trials[j].trial_type_sst !== trials[i].trial_type_sst) {
            [trials[i], trials[j]] = [trials[j], trials[i]];
            break;
          }
        }
      }
      attempts++;
    }
  }
}

/**
 * Creates the button HTML template for response buttons.
 */
function createButtonHtml(choice: string): string {
  return `<button class="jspsych-btn">${choice}</button>`;
}

/**
 * Creates disabled button HTML for non-response trials.
 */
function createDisabledButtonHtml(choice: string): string {
  return `<button class="jspsych-btn" disabled>${choice}</button>`;
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials for the Stop Signal Task.
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

  // Page 2: How to respond
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_response,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  });

  // Page 3: Stop signal explanation
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_stop_signal,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  });

  // Page 4: Strategy advice
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_strategy,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  });

  // Page 5: Practice intro
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.instruction_practice_intro,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  });

  return { timeline };
}

/**
 * Creates a fixation trial.
 * Shows disabled buttons to prevent layout shifts.
 */
function createFixationTrial(config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"><div class="sst-fixation">${config.text.fixation}</div></div>`,
    choices: [config.text.left_button, config.text.right_button],
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
 * Creates the SSD tracker object for adaptive staircase.
 */
function createSSDTracker(config: ResolvedConfig) {
  return {
    currentSSD: config.initialSSD,
    update(successful_stop: boolean) {
      if (successful_stop) {
        // Harder: increase delay
        this.currentSSD = Math.min(this.currentSSD + config.ssdStep, config.maxSSD);
      } else {
        // Easier: decrease delay
        this.currentSSD = Math.max(this.currentSSD - config.ssdStep, config.minSSD);
      }
    },
    getSSD() {
      return this.currentSSD;
    },
  };
}

/**
 * Creates a stimulus trial for the Stop Signal Task using the stop-signal plugin.
 */
function createStimulusTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  phase: "practice" | "test",
  ssdTracker: ReturnType<typeof createSSDTracker>
) {
  let trialCounter = 0;

  return {
    type: jsPsychStopSignal,
    stimuli: () => {
      const direction = jsPsych.evaluateTimelineVariable("direction") as "left" | "right";
      const trialType = jsPsych.evaluateTimelineVariable("trial_type_sst") as "go" | "stop";

      if (trialType === "stop") {
        return [createArrowSVG(direction), createStopArrowSVG(direction)];
      } else {
        return [createArrowSVG(direction)];
      }
    },
    stimulus_width: config.stimulusWidth,
    stimulus_height: config.stimulusHeight,
    frame_delay: () => {
      const trialType = jsPsych.evaluateTimelineVariable("trial_type_sst") as "go" | "stop";
      if (trialType === "stop") {
        return ssdTracker.getSSD();
      }
      return 0;
    },
    choices: [config.text.left_button, config.text.right_button],
    button_html: createButtonHtml,
    trial_duration: config.responseDuration,
    multiple_responses: false,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: phase,
      trial_index: () => ++trialCounter,
      direction: () => jsPsych.evaluateTimelineVariable("direction"),
      trial_type_sst: () => jsPsych.evaluateTimelineVariable("trial_type_sst"),
      correct_response: () => jsPsych.evaluateTimelineVariable("correct_response"),
      part: "stimulus",
    },
    on_finish: (data: any) => {
      if (data.trial_type_sst === "stop") {
        data.ssd = ssdTracker.getSSD();
        // Successful stop: no response given
        data.correct = data.response === null;
        ssdTracker.update(data.correct);
      } else {
        data.ssd = null;
        // Go trial: correct if response matches correct_response
        data.correct = data.response === data.correct_response;
      }
    },
  };
}

/**
 * Creates a feedback trial.
 */
function createFeedbackTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().last(1).values()[0];
      let feedbackText: string;
      let feedbackClass: string;

      if (lastTrial.trial_type_sst === "stop") {
        if (lastTrial.correct) {
          feedbackText = config.text.successful_stop_feedback;
          feedbackClass = "feedback stop-success";
        } else {
          feedbackText = config.text.failed_stop_feedback;
          feedbackClass = "feedback stop-fail";
        }
      } else {
        if (lastTrial.response === null) {
          feedbackText = config.text.timeout_go_feedback;
          feedbackClass = "feedback timeout";
        } else if (lastTrial.correct) {
          feedbackText = config.text.correct_go_feedback;
          feedbackClass = "feedback correct";
        } else {
          feedbackText = config.text.incorrect_go_feedback;
          feedbackClass = "feedback incorrect";
        }
      }

      return `<div class="trial-content"><div class="${feedbackClass}">${feedbackText}</div></div>`;
    },
    choices: [config.text.left_button, config.text.right_button],
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
function createItiTrial(config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"></div>`,
    choices: [config.text.left_button, config.text.right_button],
    button_html: createDisabledButtonHtml,
    response_ends_trial: false,
    trial_duration: config.interTrialInterval,
    data: {
      task: TASK_NAME,
      part: "iti",
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
      html += config.text.result_summary(
        scores.goAccuracy,
        scores.stopAccuracy,
        scores.meanGoRT,
        scores.ssrt
      );
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
 * Creates a practice block.
 */
function createPracticeBlock(jsPsych: JsPsych, config: ResolvedConfig) {
  const trialVariables = generateTrialSequence(
    config.numPracticeTrials,
    config.stopProbability,
    config.maxConsecutiveStop,
    config.maxConsecutiveGo
  );

  const ssdTracker = createSSDTracker(config);

  const trialTimeline: any[] = [
    createFixationTrial(config),
    createStimulusTrial(jsPsych, config, "practice", ssdTracker),
  ];

  if (config.showPracticeFeedback) {
    trialTimeline.push(createFeedbackTrial(jsPsych, config));
  }

  trialTimeline.push(createItiTrial(config));

  return {
    timeline: trialTimeline,
    timeline_variables: trialVariables,
  };
}

/**
 * Creates a test block.
 */
function createTestBlock(jsPsych: JsPsych, config: ResolvedConfig) {
  const trialVariables = generateTrialSequence(
    config.numTestTrials,
    config.stopProbability,
    config.maxConsecutiveStop,
    config.maxConsecutiveGo
  );

  const ssdTracker = createSSDTracker(config);

  const trialTimeline: any[] = [
    createFixationTrial(config),
    createStimulusTrial(jsPsych, config, "test", ssdTracker),
  ];

  if (config.showTestFeedback) {
    trialTimeline.push(createFeedbackTrial(jsPsych, config));
  }

  trialTimeline.push(createItiTrial(config));

  return {
    timeline: trialTimeline,
    timeline_variables: trialVariables,
  };
}

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics from the Stop Signal Task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "stimulus" })
    .values() as TrialData[];

  if (testTrials.length === 0) {
    return {
      goAccuracy: 0,
      stopAccuracy: 0,
      meanGoRT: null,
      goRTStandardDeviation: null,
      meanSSD: null,
      ssrt: null,
      commissionErrors: 0,
      omissionErrors: 0,
      totalGoTrials: 0,
      totalStopTrials: 0,
    };
  }

  const goTrials = testTrials.filter((t) => t.trial_type_sst === "go");
  const stopTrials = testTrials.filter((t) => t.trial_type_sst === "stop");

  // Go accuracy: correct go responses / total go
  const correctGoTrials = goTrials.filter((t) => t.correct);
  const goAccuracy = goTrials.length > 0 ? correctGoTrials.length / goTrials.length : 0;

  // Stop accuracy: successful stops / total stop
  const successfulStops = stopTrials.filter((t) => t.correct);
  const stopAccuracy = stopTrials.length > 0 ? successfulStops.length / stopTrials.length : 0;

  // Mean go RT (correct go trials only)
  const goRTs = correctGoTrials
    .filter((t) => t.rt !== null)
    .map((t) => t.rt as number);
  const meanGoRT = mean(goRTs);
  const goRTStandardDeviation = standardDeviation(goRTs);

  // Mean SSD (from stop trials)
  const ssds = stopTrials
    .filter((t) => t.ssd !== null)
    .map((t) => t.ssd as number);
  const meanSSD = mean(ssds);

  // Commission errors (responses on stop trials)
  const commissionErrors = stopTrials.filter((t) => !t.correct).length;

  // Omission errors (no response on go trials)
  const omissionErrors = goTrials.filter((t) => t.response === null).length;

  // SSRT estimation using integration method
  let ssrt: number | null = null;
  if (goRTs.length > 0 && stopTrials.length > 0 && meanSSD !== null) {
    const failedStopProportion =
      stopTrials.length > 0 ? commissionErrors / stopTrials.length : 0;

    if (failedStopProportion > 0 && failedStopProportion < 1) {
      // Sort all go RTs (correct go trials)
      const sortedGoRTs = [...goRTs].sort((a, b) => a - b);
      // Find the nth RT where n = number of go RTs * proportion of failed stops
      const nthIndex = Math.round(sortedGoRTs.length * failedStopProportion) - 1;
      const clampedIndex = Math.max(0, Math.min(nthIndex, sortedGoRTs.length - 1));
      const nthRT = sortedGoRTs[clampedIndex];
      ssrt = nthRT - meanSSD;
    }
  }

  return {
    goAccuracy,
    stopAccuracy,
    meanGoRT,
    goRTStandardDeviation,
    meanSSD,
    ssrt,
    commissionErrors,
    omissionErrors,
    totalGoTrials: goTrials.length,
    totalStopTrials: stopTrials.length,
  };
}

/**
 * Returns a summary of the Stop Signal Task performance.
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
 * Creates the complete Stop Signal Task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const sstTimeline = createTimeline(jsPsych, {
 *   numTestTrials: 96,
 *   showInstructions: true,
 * });
 * jsPsych.run([sstTimeline]);
 * ```
 */
export function createTimeline(jsPsych: JsPsych, options: StopSignalTaskOptions = {}) {
  // Merge text with defaults
  const text: TextConfig = { ...defaultText, ...options.text };

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    text,
  };

  const timeline: any[] = [];

  // Instructions
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config));
  }

  // Practice
  if (config.numPracticeTrials > 0) {
    timeline.push(createPracticeBlock(jsPsych, config));
    timeline.push(
      createTransitionTrial(
        config.text.practice_complete,
        config.text.continue_button
      )
    );
  }

  // Test block
  timeline.push(createTestBlock(jsPsych, config));

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Stop Signal Task experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createFixationTrial,
  createStimulusTrial,
  createFeedbackTrial,
  createItiTrial,
  createTransitionTrial,
  createPracticeBlock,
  createTestBlock,
  createCompletionTrial,
  createSSDTracker,
};

/**
 * Utility functions for the Stop Signal Task.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  stimuli: {
    createArrowSVG,
    createStopArrowSVG,
    generateTrialSequence,
  },
  constants: {
    TASK_NAME,
    VERSION,
    DEFAULT_OPTIONS,
    LEFT_BUTTON_INDEX,
    RIGHT_BUTTON_INDEX,
  },
  text: defaultText,
};

// Re-export types
export type { TextConfig };
