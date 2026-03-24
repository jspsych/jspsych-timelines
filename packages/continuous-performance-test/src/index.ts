import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export type CPTMode = "standard" | "inhibition" | "ax";

export type AXTrialType = "ax" | "ay" | "bx" | "by";

export interface CPTOptions {
  /** Task mode: "standard", "inhibition", or "ax" (default: "standard") */
  mode?: CPTMode;
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Total number of trials (default: 100) */
  numTrials?: number;
  /** Stimulus display duration in ms (default: 250) */
  stimulusDuration?: number;
  /** Minimum ISI in ms, used when isiSet is not provided (default: 1000) */
  isiMin?: number;
  /** Maximum ISI in ms, used when isiSet is not provided (default: 1000) */
  isiMax?: number;
  /** Set of ISI values to randomly sample from; overrides isiMin/isiMax */
  isiSet?: number[];
  /** Show fixation cross during ISI (default: true) */
  showFixation?: boolean;
  /** Target probability for standard mode (default: 0.2) */
  targetProbability?: number;
  /** Non-target probability for inhibition mode (default: 0.1) */
  nontargetProbability?: number;
  /** AX trial probability for AX mode (default: 0.4) */
  axProbability?: number;
  /** AY trial probability for AX mode (default: 0.2) */
  ayProbability?: number;
  /** BX trial probability for AX mode (default: 0.2) */
  bxProbability?: number;
  /** BY trial probability for AX mode (default: 0.2) */
  byProbability?: number;
  /** Delay between cue and probe in AX mode in ms (default: 1000) */
  cueDelay?: number;
  /** Target letter for standard/inhibition modes (default: "X") */
  targetLetter?: string;
  /** Stimulus pool for non-target letters (default: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"]) */
  stimuliPool?: string[];
  /** Cue letter for AX mode (default: "A") */
  cueLetter?: string;
  /** Probe letter for AX mode (default: "X") */
  probeLetter?: string;
  /** Non-cue letters for AX mode (default: ["B","C","D","E","F","G","H"]) */
  nonCueLetters?: string[];
  /** Non-probe letters for AX mode (default: ["K","L","M","N","O","P","Q"]) */
  nonProbeLetters?: string[];
  /** Show practice trials (default: true) */
  showPractice?: boolean;
  /** Number of practice trials (default: 10) */
  numPracticeTrials?: number;
  /** Feedback duration during practice in ms (default: 1000) */
  feedbackDuration?: number;
  /** Number of blocks to divide the test into (default: 1) */
  numBlocks?: number;
  /** Custom text strings for translation */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: string;
  part: string;
  trial_index: number;
  stimulus_letter: string;
  stimulus_type: "target" | "nontarget";
  is_target: boolean;
  responded: boolean;
  rt: number | null;
  correct: boolean;
  isi: number;
  block?: number;
  ax_trial_type?: AXTrialType;
  ax_part?: "cue" | "probe";
}

export interface ScoringResult {
  /** Number of hits (correct responses to targets) */
  hits: number;
  /** Total number of targets */
  totalTargets: number;
  /** Hit rate (hits / total targets) */
  hitRate: number;
  /** Omission rate (missed targets / total targets) */
  omissionRate: number;
  /** Number of commission errors (false alarms) */
  commissions: number;
  /** Total number of non-targets */
  totalNontargets: number;
  /** Commission rate (false alarms / total non-targets) */
  commissionRate: number;
  /** Mean RT for hits in ms */
  meanRT: number | null;
  /** Standard deviation of RT for hits */
  rtStd: number | null;
  /** d-prime sensitivity index */
  dPrime: number | null;
  /** Response bias (beta) */
  beta: number | null;
}

// Internal config type with text resolved
interface ResolvedConfig {
  mode: CPTMode;
  showInstructions: boolean;
  numTrials: number;
  stimulusDuration: number;
  isiMin: number;
  isiMax: number;
  isiSet: number[] | null;
  showFixation: boolean;
  targetProbability: number;
  nontargetProbability: number;
  axProbability: number;
  ayProbability: number;
  bxProbability: number;
  byProbability: number;
  cueDelay: number;
  targetLetter: string;
  stimuliPool: string[];
  cueLetter: string;
  probeLetter: string;
  nonCueLetters: string[];
  nonProbeLetters: string[];
  showPractice: boolean;
  numPracticeTrials: number;
  feedbackDuration: number;
  numBlocks: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "continuous-performance-test";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  mode: "standard" as CPTMode,
  showInstructions: true,
  numTrials: 100,
  stimulusDuration: 250,
  isiMin: 1000,
  isiMax: 1000,
  isiSet: null as number[] | null,
  showFixation: true,
  targetProbability: 0.2,
  nontargetProbability: 0.1,
  axProbability: 0.4,
  ayProbability: 0.2,
  bxProbability: 0.2,
  byProbability: 0.2,
  cueDelay: 1000,
  targetLetter: "X",
  stimuliPool: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"],
  cueLetter: "A",
  probeLetter: "X",
  nonCueLetters: ["B", "C", "D", "E", "F", "G", "H"],
  nonProbeLetters: ["K", "L", "M", "N", "O", "P", "Q"],
  showPractice: true,
  numPracticeTrials: 10,
  feedbackDuration: 1000,
  numBlocks: 1,
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
 * Picks a random element from an array.
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates an ISI value based on config.
 */
function generateISI(config: ResolvedConfig): number {
  if (config.isiSet && config.isiSet.length > 0) {
    return randomChoice(config.isiSet);
  }
  if (config.isiMin === config.isiMax) {
    return config.isiMin;
  }
  return Math.floor(Math.random() * (config.isiMax - config.isiMin + 1)) + config.isiMin;
}

/**
 * Creates the stimulus HTML for a letter.
 */
function createStimulusHTML(letter: string): string {
  return `<div class="trial-content"><span class="cpt-stimulus">${letter}</span></div>`;
}

/**
 * Creates the fixation cross HTML.
 */
function createFixationHTML(): string {
  return `<div class="trial-content"><span class="cpt-fixation">+</span></div>`;
}

/**
 * Creates blank HTML for the ISI period.
 */
function createBlankHTML(): string {
  return `<div class="trial-content"></div>`;
}

/**
 * Constrains a sequence so that no more than maxConsecutiveTargets targets
 * appear in a row and no more than maxConsecutiveNontargets nontargets in a row.
 */
function constrainSequence<T>(
  sequence: T[],
  isTarget: (item: T) => boolean,
  maxConsecutiveTargets: number = 3,
  maxConsecutiveNontargets: number = 8
): T[] {
  const result = [...sequence];
  const maxAttempts = result.length * 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    let valid = true;
    let consecutiveTargets = 0;
    let consecutiveNontargets = 0;
    let problemIndex = -1;

    for (let i = 0; i < result.length; i++) {
      if (isTarget(result[i])) {
        consecutiveTargets++;
        consecutiveNontargets = 0;
      } else {
        consecutiveNontargets++;
        consecutiveTargets = 0;
      }

      if (consecutiveTargets > maxConsecutiveTargets || consecutiveNontargets > maxConsecutiveNontargets) {
        valid = false;
        problemIndex = i;
        break;
      }
    }

    if (valid) break;

    // Swap the problem element with a random one
    const swapIdx = Math.floor(Math.random() * result.length);
    if (swapIdx !== problemIndex) {
      [result[problemIndex], result[swapIdx]] = [result[swapIdx], result[problemIndex]];
    }
    attempts++;
  }

  return result;
}

/**
 * Generates a trial sequence for standard mode.
 */
function generateStandardSequence(
  numTrials: number,
  targetProbability: number,
  targetLetter: string,
  stimuliPool: string[]
): Array<{ letter: string; isTarget: boolean }> {
  const numTargets = Math.round(numTrials * targetProbability);
  const numNontargets = numTrials - numTargets;

  // Filter target from pool for nontarget selection
  const nontargetPool = stimuliPool.filter((l) => l !== targetLetter);

  const sequence: Array<{ letter: string; isTarget: boolean }> = [
    ...Array(numTargets).fill(null).map(() => ({ letter: targetLetter, isTarget: true })),
    ...Array(numNontargets).fill(null).map(() => ({
      letter: randomChoice(nontargetPool),
      isTarget: false,
    })),
  ];

  const shuffled = shuffleArray(sequence);
  return constrainSequence(shuffled, (item) => item.isTarget);
}

/**
 * Generates a trial sequence for inhibition mode.
 */
function generateInhibitionSequence(
  numTrials: number,
  nontargetProbability: number,
  targetLetter: string,
  stimuliPool: string[]
): Array<{ letter: string; isTarget: boolean }> {
  const numNogo = Math.round(numTrials * nontargetProbability);
  const numGo = numTrials - numNogo;

  const goPool = stimuliPool.filter((l) => l !== targetLetter);

  const sequence: Array<{ letter: string; isTarget: boolean }> = [
    // In inhibition mode, the nogo stimulus is the "nontarget" (do not respond)
    // and everything else is a "target" (respond)
    ...Array(numNogo).fill(null).map(() => ({ letter: targetLetter, isTarget: false })),
    ...Array(numGo).fill(null).map(() => ({
      letter: randomChoice(goPool),
      isTarget: true,
    })),
  ];

  const shuffled = shuffleArray(sequence);
  return constrainSequence(shuffled, (item) => item.isTarget);
}

/**
 * Generates a trial sequence for AX mode.
 * Returns pairs of [cue, probe].
 */
function generateAXSequence(
  numTrials: number,
  axProb: number,
  ayProb: number,
  bxProb: number,
  byProb: number,
  cueLetter: string,
  probeLetter: string,
  nonCueLetters: string[],
  nonProbeLetters: string[]
): Array<{ cue: string; probe: string; trialType: AXTrialType; isTarget: boolean }> {
  const numAX = Math.round(numTrials * axProb);
  const numAY = Math.round(numTrials * ayProb);
  const numBX = Math.round(numTrials * bxProb);
  // Remainder goes to BY to ensure we hit numTrials exactly
  const numBY = numTrials - numAX - numAY - numBX;

  const sequence: Array<{ cue: string; probe: string; trialType: AXTrialType; isTarget: boolean }> = [
    ...Array(numAX).fill(null).map(() => ({
      cue: cueLetter,
      probe: probeLetter,
      trialType: "ax" as AXTrialType,
      isTarget: true,
    })),
    ...Array(numAY).fill(null).map(() => ({
      cue: cueLetter,
      probe: randomChoice(nonProbeLetters),
      trialType: "ay" as AXTrialType,
      isTarget: false,
    })),
    ...Array(numBX).fill(null).map(() => ({
      cue: randomChoice(nonCueLetters),
      probe: probeLetter,
      trialType: "bx" as AXTrialType,
      isTarget: false,
    })),
    ...Array(numBY).fill(null).map(() => ({
      cue: randomChoice(nonCueLetters),
      probe: randomChoice(nonProbeLetters),
      trialType: "by" as AXTrialType,
      isTarget: false,
    })),
  ];

  const shuffled = shuffleArray(sequence);
  return constrainSequence(shuffled, (item) => item.isTarget);
}

/**
 * Unified sequence generator that dispatches based on mode.
 */
function generateTrialSequence(
  config: ResolvedConfig,
  numTrials: number
): Array<{
  letter?: string;
  isTarget: boolean;
  cue?: string;
  probe?: string;
  trialType?: AXTrialType;
}> {
  switch (config.mode) {
    case "standard":
      return generateStandardSequence(
        numTrials,
        config.targetProbability,
        config.targetLetter,
        config.stimuliPool
      );
    case "inhibition":
      return generateInhibitionSequence(
        numTrials,
        config.nontargetProbability,
        config.targetLetter,
        config.stimuliPool
      );
    case "ax":
      return generateAXSequence(
        numTrials,
        config.axProbability,
        config.ayProbability,
        config.bxProbability,
        config.byProbability,
        config.cueLetter,
        config.probeLetter,
        config.nonCueLetters,
        config.nonProbeLetters
      );
  }
}

/**
 * Approximation of inverse normal CDF (probit function).
 * Uses Abramowitz and Stegun approximation.
 */
function inverseNormalCDF(p: number): number {
  p = Math.max(0.0001, Math.min(0.9999, p));

  const a1 = -3.969683028665376e1;
  const a2 = 2.209460984245205e2;
  const a3 = -2.759285104469687e2;
  const a4 = 1.383577518672690e2;
  const a5 = -3.066479806614716e1;
  const a6 = 2.506628277459239e0;

  const b1 = -5.447609879822406e1;
  const b2 = 1.615858368580409e2;
  const b3 = -1.556989798598866e2;
  const b4 = 6.680131188771972e1;
  const b5 = -1.328068155288572e1;

  const c1 = -7.784894002430293e-3;
  const c2 = -3.223964580411365e-1;
  const c3 = -2.400758277161838e0;
  const c4 = -2.549732539343734e0;
  const c5 = 4.374664141464968e0;
  const c6 = 2.938163982698783e0;

  const d1 = 7.784695709041462e-3;
  const d2 = 3.224671290700398e-1;
  const d3 = 2.445134137142996e0;
  const d4 = 3.754408661907416e0;

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    const r = q * q;
    return (
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  }
}

/**
 * Calculates standard deviation.
 */
function calculateStd(values: number[]): number | null {
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates d-prime and beta from hit rate and false alarm rate.
 * Uses log-linear correction for extreme values.
 */
function calculateDPrimeAndBeta(
  hitRate: number,
  falseAlarmRate: number,
  nTargets: number,
  nNontargets: number
): { dPrime: number | null; beta: number | null } {
  if (nTargets === 0 || nNontargets === 0) {
    return { dPrime: null, beta: null };
  }

  // Log-linear correction: (count + 0.5) / (total + 1)
  let adjustedHR = hitRate;
  let adjustedFAR = falseAlarmRate;

  if (hitRate === 0 || hitRate === 1) {
    const hits = hitRate * nTargets;
    adjustedHR = (hits + 0.5) / (nTargets + 1);
  }

  if (falseAlarmRate === 0 || falseAlarmRate === 1) {
    const fa = falseAlarmRate * nNontargets;
    adjustedFAR = (fa + 0.5) / (nNontargets + 1);
  }

  const zHit = inverseNormalCDF(adjustedHR);
  const zFA = inverseNormalCDF(adjustedFAR);

  const dPrime = zHit - zFA;

  // Beta = exp(-0.5 * (zFA^2 - zHit^2))
  const beta = Math.exp(-0.5 * (zFA * zFA - zHit * zHit));

  return { dPrime, beta };
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
      switch (config.mode) {
        case "standard":
          stimulus = config.text.instruction_standard;
          break;
        case "inhibition":
          stimulus = config.text.instruction_inhibition;
          break;
        case "ax":
          stimulus = config.text.instruction_ax;
          break;
      }
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
 * Creates a single CPT stimulus trial (standard or inhibition mode).
 */
function createStandardTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  trialInfo: { letter: string; isTarget: boolean },
  trialIndex: number,
  isPractice: boolean,
  block: number
) {
  const timeline: any[] = [];
  const currentISI = generateISI(config);

  // Stimulus trial: show letter for stimulusDuration, then blank/fixation for ISI
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: createStimulusHTML(trialInfo.letter),
    choices: [config.text.respond_button],
    trial_duration: config.stimulusDuration + currentISI,
    response_ends_trial: false,
    on_load: () => {
      // Show fixation or blank after stimulus disappears
      setTimeout(() => {
        const stimDisplay = document.querySelector("#jspsych-html-button-response-stimulus");
        if (stimDisplay) {
          stimDisplay.innerHTML = config.showFixation ? createFixationHTML() : "";
        }
      }, config.stimulusDuration);
    },
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: isPractice ? "practice" : "test",
      part: "stimulus",
      trial_index: trialIndex,
      stimulus_letter: trialInfo.letter,
      stimulus_type: trialInfo.isTarget ? "target" : "nontarget",
      is_target: trialInfo.isTarget,
      isi: currentISI,
      block: block,
    },
    on_finish: (data: any) => {
      const responded = data.response !== null;
      const correct = trialInfo.isTarget ? responded : !responded;

      jsPsych.data.get().addToLast({
        responded: responded,
        correct: correct,
      });
    },
  });

  // Feedback (practice only)
  if (isPractice) {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        const lastData = jsPsych.data.getLastTrialData().values()[0];
        const responded = lastData.responded;
        const isTargetTrial = lastData.is_target;

        if (isTargetTrial && responded) {
          return `<div class="trial-content"><div class="feedback correct">${config.text.feedback_hit}</div></div>`;
        } else if (isTargetTrial && !responded) {
          return `<div class="trial-content"><div class="feedback incorrect">${config.text.feedback_miss}</div></div>`;
        } else if (!isTargetTrial && responded) {
          return `<div class="trial-content"><div class="feedback incorrect">${config.text.feedback_false_alarm}</div></div>`;
        } else {
          return `<div class="trial-content"><div class="feedback correct">${config.text.feedback_correct_rejection}</div></div>`;
        }
      },
      choices: [config.text.respond_button],
      button_html: (choice: string) => `<button class="jspsych-btn" disabled>${choice}</button>`,
      trial_duration: config.feedbackDuration,
      response_ends_trial: false,
      data: {
        task: TASK_NAME,
        phase: "practice",
        part: "feedback",
      },
    });
  }

  return { timeline };
}

/**
 * Creates a single AX-CPT trial pair (cue + probe).
 */
function createAXTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  trialInfo: { cue: string; probe: string; trialType: AXTrialType; isTarget: boolean },
  trialIndex: number,
  isPractice: boolean,
  block: number
) {
  const timeline: any[] = [];
  const currentISI = generateISI(config);

  // Cue trial - responses during cue are not scored
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: createStimulusHTML(trialInfo.cue),
    choices: [config.text.respond_button],
    button_html: (choice: string) => `<button class="jspsych-btn" disabled>${choice}</button>`,
    trial_duration: config.cueDelay,
    response_ends_trial: false,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: isPractice ? "practice" : "test",
      part: "cue",
      trial_index: trialIndex,
      stimulus_letter: trialInfo.cue,
      ax_trial_type: trialInfo.trialType,
      ax_part: "cue",
      block: block,
    },
    on_load: () => {
      setTimeout(() => {
        const stimDisplay = document.querySelector("#jspsych-html-button-response-stimulus");
        if (stimDisplay) {
          stimDisplay.innerHTML = config.showFixation ? createFixationHTML() : "";
        }
      }, config.stimulusDuration);
    },
  });

  // Probe trial - this is the scored response
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: createStimulusHTML(trialInfo.probe),
    choices: [config.text.respond_button],
    trial_duration: config.stimulusDuration + currentISI,
    response_ends_trial: false,
    on_load: () => {
      setTimeout(() => {
        const stimDisplay = document.querySelector("#jspsych-html-button-response-stimulus");
        if (stimDisplay) {
          stimDisplay.innerHTML = config.showFixation ? createFixationHTML() : "";
        }
      }, config.stimulusDuration);
    },
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: isPractice ? "practice" : "test",
      part: "stimulus",
      trial_index: trialIndex,
      stimulus_letter: trialInfo.probe,
      stimulus_type: trialInfo.isTarget ? "target" : "nontarget",
      is_target: trialInfo.isTarget,
      ax_trial_type: trialInfo.trialType,
      ax_part: "probe",
      isi: currentISI,
      block: block,
    },
    on_finish: (data: any) => {
      const responded = data.response !== null;
      const correct = trialInfo.isTarget ? responded : !responded;

      jsPsych.data.get().addToLast({
        responded: responded,
        correct: correct,
      });
    },
  });

  // Feedback (practice only)
  if (isPractice) {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        const lastData = jsPsych.data.getLastTrialData().values()[0];
        const responded = lastData.responded;
        const isTargetTrial = lastData.is_target;

        if (isTargetTrial && responded) {
          return `<div class="trial-content"><div class="feedback correct">${config.text.feedback_hit}</div></div>`;
        } else if (isTargetTrial && !responded) {
          return `<div class="trial-content"><div class="feedback incorrect">${config.text.feedback_miss}</div></div>`;
        } else if (!isTargetTrial && responded) {
          return `<div class="trial-content"><div class="feedback incorrect">${config.text.feedback_false_alarm}</div></div>`;
        } else {
          return `<div class="trial-content"><div class="feedback correct">${config.text.feedback_correct_rejection}</div></div>`;
        }
      },
      choices: [config.text.respond_button],
      button_html: (choice: string) => `<button class="jspsych-btn" disabled>${choice}</button>`,
      trial_duration: config.feedbackDuration,
      response_ends_trial: false,
      data: {
        task: TASK_NAME,
        phase: "practice",
        part: "feedback",
      },
    });
  }

  return { timeline };
}

/**
 * Creates a practice block.
 */
function createPracticeBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig
) {
  const sequence = generateTrialSequence(config, config.numPracticeTrials);
  const timeline: any[] = [];

  sequence.forEach((trialInfo, index) => {
    if (config.mode === "ax" && "cue" in trialInfo) {
      timeline.push(
        createAXTrial(
          jsPsych,
          config,
          trialInfo as { cue: string; probe: string; trialType: AXTrialType; isTarget: boolean },
          index + 1,
          true,
          1
        )
      );
    } else {
      timeline.push(
        createStandardTrial(
          jsPsych,
          config,
          trialInfo as { letter: string; isTarget: boolean },
          index + 1,
          true,
          1
        )
      );
    }
  });

  return { timeline };
}

/**
 * Creates a test block.
 */
function createTestBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  numTrials: number,
  block: number
) {
  const sequence = generateTrialSequence(config, numTrials);
  const timeline: any[] = [];

  sequence.forEach((trialInfo, index) => {
    if (config.mode === "ax" && "cue" in trialInfo) {
      timeline.push(
        createAXTrial(
          jsPsych,
          config,
          trialInfo as { cue: string; probe: string; trialType: AXTrialType; isTarget: boolean },
          index + 1,
          false,
          block
        )
      );
    } else {
      timeline.push(
        createStandardTrial(
          jsPsych,
          config,
          trialInfo as { letter: string; isTarget: boolean },
          index + 1,
          false,
          block
        )
      );
    }
  });

  return { timeline };
}

/**
 * Creates a rest screen between blocks.
 */
function createRestScreen(config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: config.text.rest_screen,
    choices: [config.text.continue_button],
    data: {
      task: TASK_NAME,
      phase: "test",
      part: "rest",
    },
  };
}

/**
 * Creates the completion trial.
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
        scores.hitRate,
        scores.commissionRate,
        scores.dPrime,
        scores.meanRT
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
 * Calculates scoring metrics from the CPT task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const responseTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "stimulus" })
    .values() as TrialData[];

  if (responseTrials.length === 0) {
    return {
      hits: 0,
      totalTargets: 0,
      hitRate: 0,
      omissionRate: 0,
      commissions: 0,
      totalNontargets: 0,
      commissionRate: 0,
      meanRT: null,
      rtStd: null,
      dPrime: null,
      beta: null,
    };
  }

  const targetTrials = responseTrials.filter((t) => t.is_target);
  const nontargetTrials = responseTrials.filter((t) => !t.is_target);

  const hits = targetTrials.filter((t) => t.responded).length;
  const misses = targetTrials.length - hits;
  const commissions = nontargetTrials.filter((t) => t.responded).length;

  const totalTargets = targetTrials.length;
  const totalNontargets = nontargetTrials.length;

  const hitRate = totalTargets > 0 ? hits / totalTargets : 0;
  const omissionRate = totalTargets > 0 ? misses / totalTargets : 0;
  const commissionRate = totalNontargets > 0 ? commissions / totalNontargets : 0;

  // d-prime and beta
  const { dPrime, beta } = calculateDPrimeAndBeta(
    hitRate,
    commissionRate,
    totalTargets,
    totalNontargets
  );

  // Mean RT and std for hits
  const hitRTs = targetTrials
    .filter((t) => t.responded && t.rt !== null)
    .map((t) => t.rt as number);

  const meanRT =
    hitRTs.length > 0
      ? hitRTs.reduce((a, b) => a + b, 0) / hitRTs.length
      : null;

  const rtStd = calculateStd(hitRTs);

  return {
    hits,
    totalTargets,
    hitRate,
    omissionRate,
    commissions,
    totalNontargets,
    commissionRate,
    meanRT,
    rtStd,
    dPrime,
    beta,
  };
}

/**
 * Computes per-block scores for vigilance decrement analysis.
 */
function computeBlockScores(data: DataCollection): ScoringResult[] {
  const responseTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "stimulus" })
    .values() as TrialData[];

  if (responseTrials.length === 0) return [];

  const blocks = new Set(responseTrials.map((t) => t.block).filter((b) => b !== undefined));
  const blockNumbers = Array.from(blocks).sort((a, b) => (a as number) - (b as number));

  return blockNumbers.map((blockNum) => {
    const blockTrials = responseTrials.filter((t) => t.block === blockNum);
    const targetTrials = blockTrials.filter((t) => t.is_target);
    const nontargetTrials = blockTrials.filter((t) => !t.is_target);

    const hits = targetTrials.filter((t) => t.responded).length;
    const misses = targetTrials.length - hits;
    const commissions = nontargetTrials.filter((t) => t.responded).length;

    const totalTargets = targetTrials.length;
    const totalNontargets = nontargetTrials.length;

    const hitRate = totalTargets > 0 ? hits / totalTargets : 0;
    const omissionRate = totalTargets > 0 ? misses / totalTargets : 0;
    const commissionRate = totalNontargets > 0 ? commissions / totalNontargets : 0;

    const { dPrime, beta } = calculateDPrimeAndBeta(
      hitRate,
      commissionRate,
      totalTargets,
      totalNontargets
    );

    const hitRTs = targetTrials
      .filter((t) => t.responded && t.rt !== null)
      .map((t) => t.rt as number);

    const meanRT =
      hitRTs.length > 0
        ? hitRTs.reduce((a, b) => a + b, 0) / hitRTs.length
        : null;

    const rtStd = calculateStd(hitRTs);

    return {
      hits,
      totalTargets,
      hitRate,
      omissionRate,
      commissions,
      totalNontargets,
      commissionRate,
      meanRT,
      rtStd,
      dPrime,
      beta,
    };
  });
}

/**
 * Computes scores separately for each AX trial type.
 */
function computeAXScores(data: DataCollection): Record<AXTrialType, ScoringResult> {
  const trialTypes: AXTrialType[] = ["ax", "ay", "bx", "by"];
  const result: Record<string, ScoringResult> = {};

  for (const tt of trialTypes) {
    const trials = data
      .filter({ task: TASK_NAME, phase: "test", part: "stimulus", ax_trial_type: tt })
      .values() as TrialData[];

    if (trials.length === 0) {
      result[tt] = {
        hits: 0,
        totalTargets: 0,
        hitRate: 0,
        omissionRate: 0,
        commissions: 0,
        totalNontargets: 0,
        commissionRate: 0,
        meanRT: null,
        rtStd: null,
        dPrime: null,
        beta: null,
      };
      continue;
    }

    const targetTrials = trials.filter((t) => t.is_target);
    const nontargetTrials = trials.filter((t) => !t.is_target);

    const hits = targetTrials.filter((t) => t.responded).length;
    const misses = targetTrials.length - hits;
    const commissions = nontargetTrials.filter((t) => t.responded).length;

    const totalTargets = targetTrials.length;
    const totalNontargets = nontargetTrials.length;

    const hitRate = totalTargets > 0 ? hits / totalTargets : 0;
    const omissionRate = totalTargets > 0 ? misses / totalTargets : 0;
    const commissionRate = totalNontargets > 0 ? commissions / totalNontargets : 0;

    const respondedTrials = trials.filter((t) => t.responded && t.rt !== null);
    const rts = respondedTrials.map((t) => t.rt as number);

    const meanRT =
      rts.length > 0
        ? rts.reduce((a, b) => a + b, 0) / rts.length
        : null;

    const rtStd = calculateStd(rts);

    // d-prime for AX is computed at the overall level, not per-type
    result[tt] = {
      hits,
      totalTargets,
      hitRate,
      omissionRate,
      commissions,
      totalNontargets,
      commissionRate,
      meanRT,
      rtStd,
      dPrime: null,
      beta: null,
    };
  }

  return result as Record<AXTrialType, ScoringResult>;
}

/**
 * Returns a full summary of the CPT performance.
 */
function getSummary(
  data: DataCollection
): ScoringResult & { taskName: string; version: string; blockScores?: ScoringResult[]; axScores?: Record<AXTrialType, ScoringResult> } {
  const scores = calculateScores(data);
  const blockScores = computeBlockScores(data);

  const responseTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "stimulus" })
    .values() as TrialData[];

  const hasAX = responseTrials.some((t) => t.ax_trial_type !== undefined);

  const result: any = {
    ...scores,
    taskName: TASK_NAME,
    version: VERSION,
  };

  if (blockScores.length > 1) {
    result.blockScores = blockScores;
  }

  if (hasAX) {
    result.axScores = computeAXScores(data);
  }

  return result;
}

// -- MAIN EXPORT --

/**
 * Creates the complete CPT task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const cptTimeline = createTimeline(jsPsych, {
 *   mode: "standard",
 *   numTrials: 100,
 * });
 * jsPsych.run([cptTimeline]);
 * ```
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: CPTOptions = {}
) {
  // Merge text with defaults
  const text: TextConfig = { ...defaultText, ...options.text };

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    isiSet: options.isiSet ?? DEFAULT_OPTIONS.isiSet,
    text,
  };

  const timeline: any[] = [];

  // Introduction
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "intro"));
  }

  // Practice
  if (config.showPractice) {
    if (config.showInstructions) {
      timeline.push(createInstructionTrials(config, "practice"));
    }
    timeline.push(createPracticeBlock(jsPsych, config));
  }

  // Main task
  if (config.showInstructions) {
    timeline.push(createInstructionTrials(config, "main"));
  }

  if (config.numBlocks <= 1) {
    timeline.push(createTestBlock(jsPsych, config, config.numTrials, 1));
  } else {
    const trialsPerBlock = Math.floor(config.numTrials / config.numBlocks);
    const remainder = config.numTrials % config.numBlocks;

    for (let b = 0; b < config.numBlocks; b++) {
      const blockTrials = trialsPerBlock + (b < remainder ? 1 : 0);
      timeline.push(createTestBlock(jsPsych, config, blockTrials, b + 1));

      // Rest screen between blocks (not after the last block)
      if (b < config.numBlocks - 1) {
        timeline.push(createRestScreen(config));
      }
    }
  }

  // Completion screen
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Timeline units that can be used to create custom CPT experiments.
 */
export const timelineUnits = {
  createInstructionTrials,
  createPracticeBlock,
  createTestBlock,
  createRestScreen,
  createCompletionTrial,
};

/**
 * Utility functions for the CPT task.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  sequence: {
    generateTrialSequence,
  },
  constants: {
    TASK_NAME,
    VERSION,
    DEFAULT_OPTIONS,
  },
  text: defaultText,
};

// Re-export types
export type { TextConfig };
