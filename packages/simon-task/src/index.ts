import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export interface StimulusFeature {
  /** Color value (CSS color string, e.g., "#D32F2F") */
  value: string;
  /** Display label for the button (e.g., "RED") */
  label: string;
  /** Which side this feature's button is on: "left" or "right" */
  side: "left" | "right";
}

export interface SimonTaskOptions {
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Show feedback during practice (default: true) */
  showPracticeFeedback?: boolean;
  /** Show feedback during test (default: false) */
  showTestFeedback?: boolean;
  /** Number of practice trials (default: 12) */
  numPracticeTrials?: number;
  /** Number of test trials (default: 100) */
  numTestTrials?: number;
  /** Number of test blocks (default: 1) */
  numBlocks?: number;
  /** Fixation cross duration in ms (default: 500) */
  fixationDuration?: number;
  /** Maximum response time in ms (default: 2000) */
  responseDuration?: number;
  /** Feedback display duration in ms (default: 400) */
  feedbackDuration?: number;
  /** Inter-trial interval in ms (default: 1000) */
  interTrialInterval?: number;
  /** Include neutral (center) position trials (default: false) */
  includeNeutral?: boolean;
  /** Proportion of congruent trials, 0-1 (default: 0.5) */
  proportionCongruent?: number;
  /** Maximum consecutive trials of the same congruency type (default: 4) */
  maxConsecutiveSameType?: number;
  /** Stimulus features defining the two response options */
  stimulusFeatures?: [StimulusFeature, StimulusFeature];
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "practice" | "test";
  block: number;
  trial: number;
  stimulus_color: string;
  stimulus_label: string;
  stimulus_side: "left" | "right" | "center";
  congruence: "congruent" | "incongruent" | "neutral";
  correct_response: number;
  response: number | null;
  correct: boolean;
  rt: number | null;
}

export interface ScoringResult {
  accuracy: number;
  meanRT: number | null;
  congruentAccuracy: number;
  incongruentAccuracy: number;
  neutralAccuracy: number | null;
  congruentRT: number | null;
  incongruentRT: number | null;
  neutralRT: number | null;
  simonEffectRT: number | null;
  simonEffectAccuracy: number;
  facilitationRT: number | null;
  interferenceRT: number | null;
  totalTrials: number;
  correctTrials: number;
}

// Internal config type with all fields resolved
interface ResolvedConfig {
  showInstructions: boolean;
  showPracticeFeedback: boolean;
  showTestFeedback: boolean;
  numPracticeTrials: number;
  numTestTrials: number;
  numBlocks: number;
  fixationDuration: number;
  responseDuration: number;
  feedbackDuration: number;
  interTrialInterval: number;
  includeNeutral: boolean;
  proportionCongruent: number;
  maxConsecutiveSameType: number;
  stimulusFeatures: [StimulusFeature, StimulusFeature];
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "simon-task";
const VERSION = "0.0.1";

const LEFT_BUTTON_INDEX = 0;
const RIGHT_BUTTON_INDEX = 1;

const DEFAULT_STIMULUS_FEATURES: [StimulusFeature, StimulusFeature] = [
  { value: "#D32F2F", label: "RED", side: "left" },
  { value: "#1976D2", label: "BLUE", side: "right" },
];

const DEFAULT_OPTIONS = {
  showInstructions: true,
  showPracticeFeedback: true,
  showTestFeedback: false,
  numPracticeTrials: 12,
  numTestTrials: 100,
  numBlocks: 1,
  fixationDuration: 500,
  responseDuration: 2000,
  feedbackDuration: 400,
  interTrialInterval: 1000,
  includeNeutral: false,
  proportionCongruent: 0.5,
  maxConsecutiveSameType: 4,
  stimulusFeatures: DEFAULT_STIMULUS_FEATURES,
};

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Gets the button index for a given side.
 */
function buttonIndexForSide(side: "left" | "right"): number {
  return side === "left" ? LEFT_BUTTON_INDEX : RIGHT_BUTTON_INDEX;
}

/**
 * Returns the feature assigned to the left side.
 */
function getLeftFeature(features: [StimulusFeature, StimulusFeature]): StimulusFeature {
  return features[0].side === "left" ? features[0] : features[1];
}

/**
 * Returns the feature assigned to the right side.
 */
function getRightFeature(features: [StimulusFeature, StimulusFeature]): StimulusFeature {
  return features[0].side === "right" ? features[0] : features[1];
}

/**
 * Generates the stimulus HTML for a Simon trial.
 * Shows a colored circle at the specified lateral position.
 */
function generateStimulusHtml(
  color: string,
  position: "left" | "right" | "center"
): string {
  let leftPercent: string;
  if (position === "left") {
    leftPercent = "25%";
  } else if (position === "right") {
    leftPercent = "75%";
  } else {
    leftPercent = "50%";
  }

  return `
    <div class="trial-content">
      <div class="simon-container">
        <div class="simon-stimulus" style="left: ${leftPercent}; background-color: ${color};"></div>
      </div>
    </div>
  `;
}

interface TrialVariable {
  stimulus_color: string;
  stimulus_label: string;
  stimulus_side: "left" | "right" | "center";
  congruence: "congruent" | "incongruent" | "neutral";
  correct_response: number;
}

/**
 * Generates all possible trial condition combinations.
 */
function generateTrialConditions(
  features: [StimulusFeature, StimulusFeature],
  includeNeutral: boolean
): TrialVariable[] {
  const conditions: TrialVariable[] = [];

  for (const feature of features) {
    // Congruent: stimulus appears on the same side as its button
    conditions.push({
      stimulus_color: feature.value,
      stimulus_label: feature.label,
      stimulus_side: feature.side,
      congruence: "congruent",
      correct_response: buttonIndexForSide(feature.side),
    });

    // Incongruent: stimulus appears on the opposite side from its button
    const oppositeSide = feature.side === "left" ? "right" : "left";
    conditions.push({
      stimulus_color: feature.value,
      stimulus_label: feature.label,
      stimulus_side: oppositeSide,
      congruence: "incongruent",
      correct_response: buttonIndexForSide(feature.side),
    });

    // Neutral: stimulus appears at center
    if (includeNeutral) {
      conditions.push({
        stimulus_color: feature.value,
        stimulus_label: feature.label,
        stimulus_side: "center",
        congruence: "neutral",
        correct_response: buttonIndexForSide(feature.side),
      });
    }
  }

  return conditions;
}

/**
 * Generates a balanced trial sequence with congruency proportion control
 * and consecutive-type constraints.
 */
function generateTrialSequence(
  features: [StimulusFeature, StimulusFeature],
  numTrials: number,
  proportionCongruent: number,
  includeNeutral: boolean,
  maxConsecutiveSameType: number
): TrialVariable[] {
  const conditions = generateTrialConditions(features, includeNeutral);

  const congruent = conditions.filter((c) => c.congruence === "congruent");
  const incongruent = conditions.filter((c) => c.congruence === "incongruent");
  const neutral = conditions.filter((c) => c.congruence === "neutral");

  let numCongruent: number;
  let numIncongruent: number;
  let numNeutral: number;

  if (includeNeutral) {
    // Split: proportionCongruent for congruent, same for incongruent, rest for neutral
    // Default even three-way split when proportionCongruent is 0.5 is not ideal;
    // use 1/3 each as a more natural three-way default
    const proportionIncongruent = proportionCongruent;
    const proportionNeutralCalc = 1 - proportionCongruent - proportionIncongruent;
    if (proportionNeutralCalc < 0) {
      // If proportions don't leave room for neutral, split evenly
      numCongruent = Math.round(numTrials / 3);
      numIncongruent = Math.round(numTrials / 3);
      numNeutral = numTrials - numCongruent - numIncongruent;
    } else {
      numCongruent = Math.round(numTrials * proportionCongruent);
      numNeutral = Math.round(numTrials * proportionNeutralCalc);
      numIncongruent = numTrials - numCongruent - numNeutral;
    }
  } else {
    numCongruent = Math.round(numTrials * proportionCongruent);
    numIncongruent = numTrials - numCongruent;
    numNeutral = 0;
  }

  // Fill trial list by cycling through conditions of each type
  const trials: TrialVariable[] = [];

  for (let i = 0; i < numCongruent; i++) {
    trials.push({ ...congruent[i % congruent.length] });
  }
  for (let i = 0; i < numIncongruent; i++) {
    trials.push({ ...incongruent[i % incongruent.length] });
  }
  for (let i = 0; i < numNeutral; i++) {
    trials.push({ ...neutral[i % neutral.length] });
  }

  // Shuffle with constraint on consecutive same congruency type
  shuffleWithConstraint(trials, maxConsecutiveSameType);

  return trials;
}

/**
 * Shuffles an array in place, then applies a constraint to limit
 * consecutive trials of the same congruency type.
 */
function shuffleWithConstraint(
  trials: TrialVariable[],
  maxConsecutive: number
): void {
  // Fisher-Yates shuffle
  for (let i = trials.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [trials[i], trials[j]] = [trials[j], trials[i]];
  }

  // Apply constraint: swap violations with later trials
  const maxAttempts = trials.length * 10;
  let attempts = 0;

  for (let i = maxConsecutive; i < trials.length && attempts < maxAttempts; i++) {
    // Check if the last maxConsecutive+1 trials all share the same congruence
    let allSame = true;
    for (let k = i - maxConsecutive; k < i; k++) {
      if (trials[k].congruence !== trials[i].congruence) {
        allSame = false;
        break;
      }
    }

    if (allSame) {
      // Find a trial later in the array with a different congruence to swap
      let swapped = false;
      for (let j = i + 1; j < trials.length; j++) {
        if (trials[j].congruence !== trials[i].congruence) {
          [trials[i], trials[j]] = [trials[j], trials[i]];
          swapped = true;
          break;
        }
      }
      if (!swapped) {
        // Try swapping with an earlier trial
        for (let j = 0; j < i - maxConsecutive; j++) {
          if (trials[j].congruence !== trials[i].congruence) {
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
 * Creates instruction trials for the Simon task.
 */
function createInstructionTrials(config: ResolvedConfig) {
  const timeline: any[] = [];
  const leftFeature = getLeftFeature(config.stimulusFeatures);
  const rightFeature = getRightFeature(config.stimulusFeatures);

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
    stimulus: config.text.instruction_response(leftFeature.label, rightFeature.label),
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  });

  // Page 3: Congruent example
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="instructions">
      ${config.text.instruction_congruent_example}
      ${generateStimulusHtml(leftFeature.value, "left")}
    </div>`,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "instructions",
      part: "instruction",
    },
  });

  // Page 4: Incongruent example
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="instructions">
      ${config.text.instruction_incongruent_example}
      ${generateStimulusHtml(leftFeature.value, "right")}
    </div>`,
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
  const leftFeature = getLeftFeature(config.stimulusFeatures);
  const rightFeature = getRightFeature(config.stimulusFeatures);

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"><div class="simon-container"><div class="simon-fixation">${config.text.fixation}</div></div></div>`,
    choices: [leftFeature.label, rightFeature.label],
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
 * Creates a stimulus trial for the Simon task.
 */
function createStimulusTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  phase: "practice" | "test",
  blockNumber: number
) {
  const leftFeature = getLeftFeature(config.stimulusFeatures);
  const rightFeature = getRightFeature(config.stimulusFeatures);
  let trialCounter = 0;

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const color = jsPsych.evaluateTimelineVariable("stimulus_color") as string;
      const side = jsPsych.evaluateTimelineVariable("stimulus_side") as "left" | "right" | "center";
      return generateStimulusHtml(color, side);
    },
    choices: [leftFeature.label, rightFeature.label],
    button_html: createButtonHtml,
    trial_duration: config.responseDuration,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: phase,
      block: blockNumber,
      trial: () => ++trialCounter,
      stimulus_color: () => jsPsych.evaluateTimelineVariable("stimulus_color"),
      stimulus_label: () => jsPsych.evaluateTimelineVariable("stimulus_label"),
      stimulus_side: () => jsPsych.evaluateTimelineVariable("stimulus_side"),
      congruence: () => jsPsych.evaluateTimelineVariable("congruence"),
      correct_response: () => jsPsych.evaluateTimelineVariable("correct_response"),
      part: "stimulus",
    },
    on_finish: (data: any) => {
      data.correct = data.response === data.correct_response;
    },
  };
}

/**
 * Creates a feedback trial.
 */
function createFeedbackTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  const leftFeature = getLeftFeature(config.stimulusFeatures);
  const rightFeature = getRightFeature(config.stimulusFeatures);

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().last(1).values()[0];
      let feedbackText: string;
      let feedbackClass: string;

      if (lastTrial.response === null) {
        feedbackText = config.text.timeout_feedback;
        feedbackClass = "feedback timeout";
      } else if (lastTrial.correct) {
        feedbackText = config.text.correct_feedback;
        feedbackClass = "feedback correct";
      } else {
        feedbackText = config.text.incorrect_feedback;
        feedbackClass = "feedback incorrect";
      }

      return `<div class="trial-content"><div class="${feedbackClass}">${feedbackText}</div></div>`;
    },
    choices: [leftFeature.label, rightFeature.label],
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
  const leftFeature = getLeftFeature(config.stimulusFeatures);
  const rightFeature = getRightFeature(config.stimulusFeatures);

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="trial-content"></div>`,
    choices: [leftFeature.label, rightFeature.label],
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
 * Creates a rest screen between blocks.
 */
function createRestScreen(config: ResolvedConfig, blockNumber: number) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="instructions"><p>${config.text.block_complete(blockNumber)}</p></div>`,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "test",
      part: "rest",
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
      html += config.text.result_summary(scores.accuracy, scores.simonEffectRT, scores.meanRT);
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
    config.stimulusFeatures,
    config.numPracticeTrials,
    config.proportionCongruent,
    config.includeNeutral,
    config.maxConsecutiveSameType
  );

  const trialTimeline: any[] = [
    createFixationTrial(config),
    createStimulusTrial(jsPsych, config, "practice", 1),
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
function createTestBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  blockNumber: number
) {
  const trialsPerBlock = Math.ceil(config.numTestTrials / config.numBlocks);

  const trialVariables = generateTrialSequence(
    config.stimulusFeatures,
    trialsPerBlock,
    config.proportionCongruent,
    config.includeNeutral,
    config.maxConsecutiveSameType
  );

  const trialTimeline: any[] = [
    createFixationTrial(config),
    createStimulusTrial(jsPsych, config, "test", blockNumber),
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
 * Calculates scoring metrics from the Simon task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "stimulus" })
    .values() as TrialData[];

  if (testTrials.length === 0) {
    return {
      accuracy: 0,
      meanRT: null,
      congruentAccuracy: 0,
      incongruentAccuracy: 0,
      neutralAccuracy: null,
      congruentRT: null,
      incongruentRT: null,
      neutralRT: null,
      simonEffectRT: null,
      simonEffectAccuracy: 0,
      facilitationRT: null,
      interferenceRT: null,
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

  // By condition
  const congruentTrials = testTrials.filter((t) => t.congruence === "congruent");
  const incongruentTrials = testTrials.filter(
    (t) => t.congruence === "incongruent"
  );
  const neutralTrials = testTrials.filter((t) => t.congruence === "neutral");

  const congruentAccuracy =
    congruentTrials.length > 0
      ? congruentTrials.filter((t) => t.correct).length / congruentTrials.length
      : 0;
  const incongruentAccuracy =
    incongruentTrials.length > 0
      ? incongruentTrials.filter((t) => t.correct).length /
        incongruentTrials.length
      : 0;
  const neutralAccuracy =
    neutralTrials.length > 0
      ? neutralTrials.filter((t) => t.correct).length / neutralTrials.length
      : null;

  const congruentRT = mean(
    congruentTrials
      .filter((t) => t.correct && t.rt !== null)
      .map((t) => t.rt as number)
  );
  const incongruentRT = mean(
    incongruentTrials
      .filter((t) => t.correct && t.rt !== null)
      .map((t) => t.rt as number)
  );
  const neutralRT =
    neutralTrials.length > 0
      ? mean(
          neutralTrials
            .filter((t) => t.correct && t.rt !== null)
            .map((t) => t.rt as number)
        )
      : null;

  // Simon effect
  const simonEffectRT =
    incongruentRT !== null && congruentRT !== null
      ? incongruentRT - congruentRT
      : null;
  const simonEffectAccuracy = congruentAccuracy - incongruentAccuracy;

  // Facilitation and interference (only meaningful with neutral)
  const facilitationRT =
    neutralRT !== null && congruentRT !== null
      ? neutralRT - congruentRT
      : null;
  const interferenceRT =
    neutralRT !== null && incongruentRT !== null
      ? incongruentRT - neutralRT
      : null;

  return {
    accuracy,
    meanRT,
    congruentAccuracy,
    incongruentAccuracy,
    neutralAccuracy,
    congruentRT,
    incongruentRT,
    neutralRT,
    simonEffectRT,
    simonEffectAccuracy,
    facilitationRT,
    interferenceRT,
    totalTrials: testTrials.length,
    correctTrials: correctTrials.length,
  };
}

/**
 * Returns a summary of the Simon task performance.
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
 * Creates the complete Simon Task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const simonTimeline = createTimeline(jsPsych, {
 *   numTestTrials: 60,
 *   showInstructions: true,
 * });
 * jsPsych.run([simonTimeline]);
 * ```
 */
export function createTimeline(jsPsych: JsPsych, options: SimonTaskOptions = {}) {
  // Merge text with defaults
  const text: TextConfig = { ...defaultText, ...options.text };

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    stimulusFeatures: options.stimulusFeatures || DEFAULT_STIMULUS_FEATURES,
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
 * Timeline units that can be used to create custom Simon task experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createFixationTrial,
  createStimulusTrial,
  createFeedbackTrial,
  createItiTrial,
  createRestScreen,
  createTransitionTrial,
  createPracticeBlock,
  createTestBlock,
  createCompletionTrial,
};

/**
 * Utility functions for the Simon task.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  stimuli: {
    generateStimulusHtml,
    generateTrialConditions,
    generateTrialSequence,
  },
  constants: {
    TASK_NAME,
    VERSION,
    DEFAULT_OPTIONS,
    DEFAULT_STIMULUS_FEATURES,
    LEFT_BUTTON_INDEX,
    RIGHT_BUTTON_INDEX,
  },
  text: defaultText,
};

// Re-export types
export type { TextConfig };
