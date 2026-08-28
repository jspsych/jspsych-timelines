import "./styles.css";

import jsPsychDeviceOrientation from "@jspsych-contrib/plugin-device-orientation";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { DataCollection, JsPsych } from "jspsych";

import { version } from "../package.json";
import { TextConfig, defaultText } from "./text";

// -- TYPES --

export interface FittsCondition {
  /** Target width in pixels */
  width: number;
  /** Distance between targets in pixels */
  distance: number;
}

export interface FittsOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Require landscape orientation on mobile devices (default: true) */
  requireLandscape?: boolean;
  /** Conditions to test - array of {width, distance} (default: built-in set) */
  conditions?: FittsCondition[];
  /** Number of taps per condition (default: 10) */
  tapsPerCondition?: number;
  /** Number of repetitions per condition (default: 2) */
  repetitionsPerCondition?: number;
  /** Show practice trials (default: true) */
  showPractice?: boolean;
  /** Number of practice conditions (default: 2) */
  numPracticeConditions?: number;
  /** Target color (default: "#4A90D9" - blue) */
  targetColor?: string;
  /**
   * Opacity of the target that is not currently active, 0 to 1 (default: 0.35).
   * Set to 0 to hide the inactive target.
   */
  inactiveTargetOpacity?: number;
  /** Custom text strings for translation */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: string;
  part?: string;
  /** Index into the configured `conditions` array */
  condition_index: number;
  /** Position of this trial within its block, 1-indexed */
  trial_number: number;
  target_width: number;
  target_distance: number;
  index_of_difficulty: number;
  taps_completed: number;
  total_time: number;
  /**
   * One entry per target-to-target movement, so `taps_completed - 1` of them.
   * The interval before the first tap is initiation_time, not a movement.
   */
  movement_times: number[];
  /** Taps that missed the active target */
  errors: number;
  /** Percentage of taps that hit the active target */
  accuracy: number;
  /** Time from stimulus onset to the first tap (a reaction time, not a movement) */
  initiation_time: number;
  /**
   * Horizontal endpoint of each recorded movement, for the effective-width
   * correction. Index-aligned with movement_times.
   */
  tap_positions: number[];
}

export interface ScoringResult {
  /** Average movement time across all conditions in ms */
  averageMT: number;
  /** Overall accuracy percentage */
  accuracy: number;
  /** Throughput (bits per second) - null if not calculable */
  throughput: number | null;
  /** Total number of taps */
  totalTaps: number;
  /** Total number of errors (missed targets) */
  totalErrors: number;
  /** Performance by condition */
  conditionPerformance: Array<{
    width: number;
    distance: number;
    indexOfDifficulty: number;
    averageMT: number;
    accuracy: number;
  }>;
}

// Internal config type with text resolved
interface ResolvedConfig {
  showInstructions: boolean;
  requireLandscape: boolean;
  conditions: FittsCondition[];
  tapsPerCondition: number;
  repetitionsPerCondition: number;
  showPractice: boolean;
  numPracticeConditions: number;
  targetColor: string;
  inactiveTargetOpacity: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "fitts";
const VERSION = version;

const CSS_ROOT = "jspsych-fitts";

// Default conditions covering range of IDs
const DEFAULT_CONDITIONS: FittsCondition[] = [
  { width: 60, distance: 200 }, // ID 2.42
  { width: 40, distance: 200 }, // ID 2.81
  { width: 60, distance: 400 }, // ID 3.12
  { width: 30, distance: 200 }, // ID 3.12
  { width: 40, distance: 400 }, // ID 3.58
  { width: 30, distance: 400 }, // ID 3.94
];

const DEFAULT_OPTIONS = {
  showInstructions: true,
  requireLandscape: true,
  conditions: DEFAULT_CONDITIONS,
  tapsPerCondition: 10,
  repetitionsPerCondition: 2,
  showPractice: true,
  numPracticeConditions: 2,
  targetColor: "#4A90D9",
  inactiveTargetOpacity: 0.35,
};

// -- CONFIGURATION --

/**
 * Merges caller options over the defaults and rejects configurations that would
 * silently produce a degenerate dataset, failing loudly at construction rather
 * than at analysis.
 */
function resolveConfig(options: FittsOptions = {}): ResolvedConfig {
  const text: TextConfig = { ...defaultText, ...options.text };
  const config: ResolvedConfig = { ...DEFAULT_OPTIONS, ...options, text };

  if (!Array.isArray(config.conditions) || config.conditions.length === 0) {
    throw new Error(`[${TASK_NAME}] conditions must be a non-empty array of {width, distance}`);
  }

  // A non-positive width or distance drives calculateID to +/-Infinity, which
  // propagates into index_of_difficulty, throughput, and the results screen.
  config.conditions.forEach((condition, index) => {
    if (!condition || typeof condition !== "object") {
      throw new Error(
        `[${TASK_NAME}] conditions[${index}] must be an object with width and distance`
      );
    }
    if (!Number.isFinite(condition.width) || condition.width <= 0) {
      throw new Error(
        `[${TASK_NAME}] conditions[${index}].width must be a number > 0, got ${condition.width}`
      );
    }
    if (!Number.isFinite(condition.distance) || condition.distance <= 0) {
      throw new Error(
        `[${TASK_NAME}] conditions[${index}].distance must be a number > 0, got ${condition.distance}`
      );
    }
  });

  if (!Number.isInteger(config.tapsPerCondition) || config.tapsPerCondition < 2) {
    throw new Error(
      `[${TASK_NAME}] tapsPerCondition must be an integer >= 2, got ${config.tapsPerCondition}`
    );
  }

  // Zero repetitions leaves the scored block empty while practice still runs, so
  // the run looks complete and calculateScores returns all zeros.
  if (!Number.isInteger(config.repetitionsPerCondition) || config.repetitionsPerCondition < 1) {
    throw new Error(
      `[${TASK_NAME}] repetitionsPerCondition must be an integer >= 1, ` +
        `got ${config.repetitionsPerCondition}`
    );
  }

  if (config.showPractice) {
    if (!Number.isInteger(config.numPracticeConditions) || config.numPracticeConditions < 1) {
      throw new Error(
        `[${TASK_NAME}] numPracticeConditions must be an integer >= 1 when ` +
          `showPractice is true, got ${config.numPracticeConditions}`
      );
    }
  }

  if (
    !Number.isFinite(config.inactiveTargetOpacity) ||
    config.inactiveTargetOpacity < 0 ||
    config.inactiveTargetOpacity > 1
  ) {
    throw new Error(
      `[${TASK_NAME}] inactiveTargetOpacity must be a number between 0 and 1, ` +
        `got ${config.inactiveTargetOpacity}`
    );
  }

  if (typeof config.targetColor !== "string" || config.targetColor.trim() === "") {
    throw new Error(
      `[${TASK_NAME}] targetColor must be a non-empty CSS color string, ` +
        `got ${config.targetColor}`
    );
  }
  // targetColor is interpolated into a style="" attribute; a quote or angle
  // bracket closes the attribute and corrupts the surrounding markup.
  if (/["'<>\\]/.test(config.targetColor)) {
    throw new Error(
      `[${TASK_NAME}] targetColor must not contain quotes, angle brackets or ` +
        `backslashes, got ${config.targetColor}`
    );
  }

  return config;
}
// -- UTILITY FUNCTIONS --

/**
 * Shuffles an array using Fisher-Yates algorithm.
 */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Calculates Fitts' Index of Difficulty using the Shannon formulation.
 *
 * ID = log2(A / W + 1), where W is the target width and A is the movement
 * amplitude. `distance` is the gap between the bars' inner edges, so the
 * centre-to-centre amplitude the participant actually travels is
 * `distance + width`.
 */
function calculateID(distance: number, width: number): number {
  const amplitude = distance + width;
  return Math.log2(amplitude / width + 1);
}

/**
 * Creates HTML for the Fitts tapping display with vertical bar targets.
 * Only the active target is visible. The bars span the full height and
 * are positioned so that the distance between their inner edges equals
 * the specified distance.
 */
function createFittsHTML(
  config: ResolvedConfig,
  width: number,
  distance: number,
  activeTarget: "left" | "right"
): string {
  // Total width needed: width + distance + width
  // Center this by using calc() for positioning
  const totalWidth = width * 2 + distance;

  // Both bars stay visible so the participant can aim at the next one; only the
  // active bar is fully opaque. A tap that lands anywhere else counts as an error.
  const leftOpacity = activeTarget === "left" ? 1 : config.inactiveTargetOpacity;
  const rightOpacity = activeTarget === "right" ? 1 : config.inactiveTargetOpacity;

  return `
    <div class="fitts-container" style="
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: ${totalWidth}px;
      height: 100%;
      user-select: none;
      -webkit-user-select: none;
    ">
      <div class="fitts-target fitts-left" data-target="left" style="
        opacity: ${leftOpacity};
        position: absolute;
        left: 0;
        top: 0;
        width: ${width}px;
        height: 100%;
        background-color: ${config.targetColor};
        cursor: pointer;
      "></div>
      <div class="fitts-target fitts-right" data-target="right" style="
        opacity: ${rightOpacity};
        position: absolute;
        right: 0;
        top: 0;
        width: ${width}px;
        height: 100%;
        background-color: ${config.targetColor};
        cursor: pointer;
      "></div>
    </div>
  `;
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials.
 */
function createInstructionTrials(config: ResolvedConfig, part: "intro" | "practice" | "main") {
  let stimulus: string;
  let buttonLabel: string;

  switch (part) {
    case "intro":
      stimulus = config.text.instruction_intro;
      buttonLabel = config.text.continue_button;
      break;
    case "practice":
      stimulus = config.text.instruction_practice;
      buttonLabel = config.text.start_button;
      break;
    case "main":
      stimulus = config.text.instruction_task;
      buttonLabel = config.text.start_button;
      break;
    default:
      stimulus = "";
      buttonLabel = config.text.continue_button;
  }

  const data: Record<string, any> = { task: TASK_NAME };

  switch (part) {
    case "intro":
      data.phase = "instructions";
      break;
    case "practice":
      data.phase = "practice";
      data.part = "instruction";
      break;
    case "main":
      data.phase = "test";
      data.part = "instruction";
      break;
  }

  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [CSS_ROOT],
    stimulus: stimulus,
    choices: [buttonLabel],
    data,
  };
}

/**
 * Creates a Fitts tapping trial for a single condition.
 */
function createFittsTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  condition: FittsCondition,
  conditionIndex: number,
  trialNumber: number,
  isPractice: boolean
) {
  const id = calculateID(condition.distance, condition.width);

  return {
    type: jsPsychHtmlKeyboardResponse,
    css_classes: [CSS_ROOT],
    stimulus: () => createFittsHTML(config, condition.width, condition.distance, "left"),
    choices: "NO_KEYS",
    trial_duration: null,
    response_ends_trial: false,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: isPractice ? "practice" : "test",
      part: "response",
      condition_index: conditionIndex,
      trial_number: trialNumber,
      target_width: condition.width,
      target_distance: condition.distance,
      index_of_difficulty: id,
    },
    on_load: () => {
      const displayElement = jsPsych.getDisplayElement();
      const container = displayElement.querySelector(".fitts-container") as HTMLElement;
      const leftTarget = displayElement.querySelector(".fitts-left") as HTMLElement;
      const rightTarget = displayElement.querySelector(".fitts-right") as HTMLElement;
      const movementTimes: number[] = [];
      const tapPositions: number[] = [];
      let currentTarget: "left" | "right" = "left";
      let tapCount = 0;
      let errorCount = 0;
      let initiationTime = 0;
      let lastTapTime = performance.now();
      const startTime = performance.now();

      const updateTargetHighlight = () => {
        leftTarget.style.opacity =
          currentTarget === "left" ? "1" : String(config.inactiveTargetOpacity);
        rightTarget.style.opacity =
          currentTarget === "right" ? "1" : String(config.inactiveTargetOpacity);
      };

      // The endpoint is only recorded for analysis; hit detection is DOM-based so
      // it does not depend on layout being measurable.
      const endpointOf = (event: Event): number => {
        const touch = (event as TouchEvent).changedTouches?.[0];
        return touch ? touch.clientX : (event as MouseEvent).clientX ?? 0;
      };

      const handleTap = (event: Event) => {
        const now = performance.now();
        const hitTarget = (event.target as HTMLElement | null)?.closest?.(
          ".fitts-target"
        ) as HTMLElement | null;
        const tappedSide = hitTarget?.dataset.target;

        if (tappedSide !== currentTarget) {
          // Landed on the inactive bar or on the gap between them.
          errorCount++;
          return;
        }

        if (tapCount === 0) {
          // Onset to first tap covers reading the display and reaching for it, and
          // no amplitude applies to it: there is no target to have moved from.
          initiationTime = now - startTime;
        } else {
          movementTimes.push(now - lastTapTime);
          tapPositions.push(endpointOf(event));
        }
        lastTapTime = now;
        tapCount++;

        currentTarget = currentTarget === "left" ? "right" : "left";
        updateTargetHighlight();

        if (tapCount >= config.tapsPerCondition) {
          jsPsych.finishTrial({
            taps_completed: tapCount,
            total_time: now - startTime,
            initiation_time: initiationTime,
            movement_times: movementTimes,
            tap_positions: tapPositions,
            errors: errorCount,
            accuracy: (tapCount / (tapCount + errorCount)) * 100,
          });
        }
      };

      // Bound to the container, not the bars, so a tap that misses is still seen.
      container.addEventListener("click", handleTap);
      container.addEventListener("touchend", (e) => {
        e.preventDefault();
        handleTap(e);
      });

      updateTargetHighlight();
    },
  };
}

/**
 * Creates a block of Fitts trials.
 */
function createFittsBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  conditions: FittsCondition[],
  repetitions: number,
  isPractice: boolean
) {
  const timeline: any[] = [];

  // Each entry keeps the index of the condition it came from, so the shuffle
  // does not destroy which condition a trial belongs to.
  const allTrials: Array<{
    condition: FittsCondition;
    conditionIndex: number;
    rep: number;
  }> = [];
  for (let rep = 0; rep < repetitions; rep++) {
    conditions.forEach((condition, conditionIndex) => {
      allTrials.push({ condition, conditionIndex, rep });
    });
  }

  const shuffledTrials = shuffleArray(allTrials);

  shuffledTrials.forEach((trial, index) => {
    timeline.push(
      createFittsTrial(
        jsPsych,
        config,
        trial.condition,
        trial.conditionIndex,
        index + 1,
        isPractice
      )
    );
  });

  return { timeline };
}

/**
 * Creates the completion screen.
 */
function createCompletionTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [CSS_ROOT],
    stimulus: () => {
      const data = jsPsych.data.get();
      const scores = calculateScores(data);

      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += `<h2>${config.text.task_complete}</h2>`;
      html += config.text.result_summary(scores.averageMT, scores.accuracy, scores.throughput);
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

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics from the Fitts task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const responseTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "response" })
    .values() as TrialData[];

  if (responseTrials.length === 0) {
    return {
      averageMT: 0,
      accuracy: 0,
      throughput: null,
      totalTaps: 0,
      totalErrors: 0,
      conditionPerformance: [],
    };
  }

  // Aggregate all movement times
  const allMTs: number[] = [];
  let totalTaps = 0;
  let totalErrors = 0;

  // Group by condition for per-condition analysis
  const conditionMap = new Map<
    string,
    {
      width: number;
      distance: number;
      id: number;
      mts: number[];
      errors: number;
      taps: number;
    }
  >();

  responseTrials.forEach((trial) => {
    const key = `${trial.target_width}-${trial.target_distance}`;
    const mts = trial.movement_times || [];

    if (!conditionMap.has(key)) {
      conditionMap.set(key, {
        width: trial.target_width,
        distance: trial.target_distance,
        id: trial.index_of_difficulty,
        mts: [],
        errors: 0,
        taps: 0,
      });
    }

    const cond = conditionMap.get(key)!;
    cond.mts.push(...mts);
    cond.errors += trial.errors || 0;
    cond.taps += trial.taps_completed || 0;

    allMTs.push(...mts);
    totalTaps += trial.taps_completed || 0;
    totalErrors += trial.errors || 0;
  });

  // Average MT
  const averageMT = allMTs.length > 0 ? allMTs.reduce((a, b) => a + b, 0) / allMTs.length : 0;

  // Overall accuracy
  const accuracy = totalTaps + totalErrors > 0 ? (totalTaps / (totalTaps + totalErrors)) * 100 : 0;

  // Throughput (bits/s) = ID / MT. The effective form substitutes W_e = 4.133 *
  // SD of the endpoints in tap_positions; this uses the nominal ID and the mean
  // movement time instead, averaged across conditions.
  let throughput: number | null = null;
  if (conditionMap.size > 0 && averageMT > 0) {
    // Calculate average ID across conditions
    let totalID = 0;
    conditionMap.forEach((cond) => {
      totalID += cond.id;
    });
    const avgID = totalID / conditionMap.size;
    throughput = (avgID * 1000) / averageMT; // bits per second
  }

  // Per-condition performance
  const conditionPerformance = Array.from(conditionMap.values()).map((cond) => ({
    width: cond.width,
    distance: cond.distance,
    indexOfDifficulty: cond.id,
    averageMT: cond.mts.length > 0 ? cond.mts.reduce((a, b) => a + b, 0) / cond.mts.length : 0,
    accuracy: cond.taps + cond.errors > 0 ? (cond.taps / (cond.taps + cond.errors)) * 100 : 0,
  }));

  return {
    averageMT,
    accuracy,
    throughput,
    totalTaps,
    totalErrors,
    conditionPerformance,
  };
}

/**
 * Returns a summary of the Fitts task performance.
 */
function getSummary(data: DataCollection): ScoringResult & { taskName: string; version: string } {
  const scores = calculateScores(data);
  return {
    ...scores,
    taskName: TASK_NAME,
    version: VERSION,
  };
}

// -- MAIN EXPORT --

/**
 * Creates the complete Fitts task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const fittsTimeline = createTimeline(jsPsych, {
 *   showInstructions: true,
 *   tapsPerCondition: 10,
 * });
 * jsPsych.run([fittsTimeline]);
 * ```
 */
export function createTimeline(jsPsych: JsPsych, options: FittsOptions = {}) {
  const config = resolveConfig(options);

  const timeline: any[] = [];

  // Require landscape orientation on mobile
  if (config.requireLandscape) {
    timeline.push({
      type: jsPsychDeviceOrientation,
      css_classes: [CSS_ROOT],
      orientation: "landscape",
      message: config.text.orientation_message,
    });
  }

  // Introduction
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "intro"));
  }

  // Practice
  if (config.showPractice) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "practice"));
    }
    // Use subset of conditions for practice
    const practiceConditions = config.conditions.slice(0, config.numPracticeConditions);
    timeline.push(createFittsBlock(jsPsych, config, practiceConditions, 1, true));
  }

  // Main task
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "main"));
  }
  timeline.push(
    createFittsBlock(jsPsych, config, config.conditions, config.repetitionsPerCondition, false)
  );

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom Fitts experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createFittsTrial,
  createFittsBlock,
  createCompletionTrial,
  calculateID,
  createFittsHTML,
};

/**
 * Utility functions for the Fitts task.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  constants: {
    TASK_NAME,
    VERSION,
    DEFAULT_OPTIONS,
    DEFAULT_CONDITIONS,
  },
  text: defaultText,
};

// Re-export types
export type { TextConfig };
