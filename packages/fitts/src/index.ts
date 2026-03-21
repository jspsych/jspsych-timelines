import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychDeviceOrientation from "@jspsych-contrib/plugin-device-orientation";
import { defaultText, TextConfig } from "./text";

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
  /** Custom text strings for translation */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: string;
  part?: string;
  condition_index: number;
  target_width: number;
  target_distance: number;
  index_of_difficulty: number;
  taps_completed: number;
  total_time: number;
  movement_times: number[];
  errors: number;
  accuracy: number;
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
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "fitts";
const VERSION = "0.0.1";

// Default conditions covering range of IDs
const DEFAULT_CONDITIONS: FittsCondition[] = [
  { width: 60, distance: 200 },   // ID ~2.0
  { width: 40, distance: 200 },   // ID ~2.6
  { width: 60, distance: 400 },   // ID ~3.0
  { width: 30, distance: 200 },   // ID ~3.0
  { width: 40, distance: 400 },   // ID ~3.6
  { width: 30, distance: 400 },   // ID ~4.0
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
};

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
 * Calculates Fitts' Index of Difficulty.
 * ID = log2(2 * D / W) where D = distance, W = target width
 */
function calculateID(distance: number, width: number): number {
  return Math.log2((2 * distance) / width);
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

  const leftDisplay = activeTarget === "left" ? "block" : "none";
  const rightDisplay = activeTarget === "right" ? "block" : "none";

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
        display: ${leftDisplay};
        position: absolute;
        left: 0;
        top: 0;
        width: ${width}px;
        height: 100%;
        background-color: ${config.targetColor};
        cursor: pointer;
      "></div>
      <div class="fitts-target fitts-right" data-target="right" style="
        display: ${rightDisplay};
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
function createInstructionTrials(
  config: ResolvedConfig,
  part: "intro" | "practice" | "main"
) {
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
  isPractice: boolean
) {
  const id = calculateID(condition.distance, condition.width);

  return {
    type: jsPsychHtmlKeyboardResponse,
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
      target_width: condition.width,
      target_distance: condition.distance,
      index_of_difficulty: id,
    },
    on_load: () => {
      const displayElement = jsPsych.getDisplayElement();
      const leftTarget = displayElement.querySelector(".fitts-left") as HTMLElement;
      const rightTarget = displayElement.querySelector(".fitts-right") as HTMLElement;
      const movementTimes: number[] = [];
      let currentTarget: "left" | "right" = "left";
      let tapCount = 0;
      let lastTapTime = performance.now();
      const startTime = performance.now();

      const updateTargetVisibility = () => {
        leftTarget.style.display = currentTarget === "left" ? "block" : "none";
        rightTarget.style.display = currentTarget === "right" ? "block" : "none";
      };

      const handleTap = (event: Event) => {
        const target = event.currentTarget as HTMLElement;
        const tappedSide = target.dataset.target as "left" | "right";
        const now = performance.now();

        // Only the visible target can be tapped
        if (tappedSide === currentTarget) {
          // Record movement time
          const mt = now - lastTapTime;
          movementTimes.push(mt);
          lastTapTime = now;
          tapCount++;

          // Switch target
          currentTarget = currentTarget === "left" ? "right" : "left";
          updateTargetVisibility();

          if (tapCount >= config.tapsPerCondition) {
            // Trial complete
            const totalTime = now - startTime;
            jsPsych.finishTrial({
              taps_completed: tapCount,
              total_time: totalTime,
              movement_times: movementTimes,
              errors: 0, // No errors possible with single visible target
              accuracy: 100,
            });
          }
        }
      };

      leftTarget.addEventListener("click", handleTap);
      leftTarget.addEventListener("touchend", (e) => {
        e.preventDefault();
        handleTap(e);
      });
      rightTarget.addEventListener("click", handleTap);
      rightTarget.addEventListener("touchend", (e) => {
        e.preventDefault();
        handleTap(e);
      });

      updateTargetVisibility();
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

  // Create all condition-repetition combinations
  const allTrials: Array<{ condition: FittsCondition; rep: number }> = [];
  for (let rep = 0; rep < repetitions; rep++) {
    conditions.forEach((condition) => {
      allTrials.push({ condition, rep });
    });
  }

  // Shuffle trials
  const shuffledTrials = shuffleArray(allTrials);

  shuffledTrials.forEach((trial, index) => {
    timeline.push(
      createFittsTrial(jsPsych, config, trial.condition, index + 1, isPractice)
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
    stimulus: () => {
      const data = jsPsych.data.get();
      const scores = calculateScores(data);

      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += `<h2>${config.text.task_complete}</h2>`;
      html += config.text.result_summary(
        scores.averageMT,
        scores.accuracy,
        scores.throughput
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
  const averageMT =
    allMTs.length > 0 ? allMTs.reduce((a, b) => a + b, 0) / allMTs.length : 0;

  // Overall accuracy
  const accuracy =
    totalTaps + totalErrors > 0
      ? (totalTaps / (totalTaps + totalErrors)) * 100
      : 0;

  // Calculate throughput (bits/s) using effective ID
  // Throughput = ID_e / MT where ID_e = log2(D/W_e + 1) and W_e = 4.133 * SD_x
  // For simplicity, we use the nominal ID and average MT
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
    averageMT:
      cond.mts.length > 0
        ? cond.mts.reduce((a, b) => a + b, 0) / cond.mts.length
        : 0,
    accuracy:
      cond.taps + cond.errors > 0
        ? (cond.taps / (cond.taps + cond.errors)) * 100
        : 0,
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
export function createTimeline(
  jsPsych: JsPsych,
  options: FittsOptions = {}
) {
  // Merge text with defaults
  const text: TextConfig = { ...defaultText, ...options.text };

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    text,
  };

  const timeline: any[] = [];

  // Require landscape orientation on mobile
  if (config.requireLandscape) {
    timeline.push({
      type: jsPsychDeviceOrientation,
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
    timeline.push(
      createFittsBlock(jsPsych, config, practiceConditions, 1, true)
    );
  }

  // Main task
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "main"));
  }
  timeline.push(
    createFittsBlock(
      jsPsych,
      config,
      config.conditions,
      config.repetitionsPerCondition,
      false
    )
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
