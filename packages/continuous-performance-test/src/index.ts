import "./styles.css";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import { DataCollection, JsPsych } from "jspsych";

import { version } from "../package.json";
import { TextConfig, defaultText } from "./text";

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
  isiSet?: number[] | null;
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
  /** Position of this trial within its block, 1-indexed */
  trial_number: number;
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
  /** Hit rate (hits / total targets), or null when there were no target trials */
  hitRate: number | null;
  /** Omission rate (missed targets / total targets), or null when there were no target trials */
  omissionRate: number | null;
  /** Number of commission errors (false alarms) */
  commissions: number;
  /** Total number of non-targets */
  totalNontargets: number;
  /** Commission rate (false alarms / total non-targets), or null when there were no non-target trials */
  commissionRate: number | null;
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

// Added to the display element via `css_classes` on every trial this package
// creates, so the stylesheet can scope rules that target jsPsych-owned DOM
// without reaching trials belonging to other tasks.
const CSS_ROOT = "jspsych-continuous-performance-test";
// Read from package.json so it cannot drift from the published version.
const VERSION = version;

// Longest run of each stimulus class the sequence generators aim for. Standard and
// AX mode make the responded-to stimulus the rare one; inhibition mode inverts that,
// so its limits are written against the go/no-go split rather than reused.
const MAX_CONSECUTIVE_TARGETS = 3;
const MAX_CONSECUTIVE_NONTARGETS = 8;
const MAX_CONSECUTIVE_GO = 8;
const MAX_CONSECUTIVE_NOGO = 2;

// How much room a feasible run limit is given above the minimum the composition
// allows. At exactly the minimum only near-periodic arrangements survive.
const RUN_LIMIT_HEADROOM = 2;

// Random swaps per trial applied when mixing an arrangement.
const MIX_SWEEPS = 4;

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
  return `<div class="cpt-trial-content"><span class="cpt-stimulus">${letter}</span></div>`;
}

/**
 * Creates the fixation cross HTML.
 */
function createFixationHTML(): string {
  return `<div class="cpt-trial-content"><span class="cpt-fixation">+</span></div>`;
}

/**
 * replaces the stimulus with the fixation cross once it's been shown for
 * `stimulusDuration`, leaving the rest of the trial as the ISI.
 *
 * timer is set by pluginAPI so jsPsych always cancels at the end of the trial,
 * avoiding a desync between when the probe stops watching and the end of a trial.
 */
function scheduleStimulusOffset(jsPsych: JsPsych, config: ResolvedConfig): void {
  const stimulus = jsPsych
    .getDisplayElement()
    ?.querySelector("#jspsych-html-button-response-stimulus");
  if (!stimulus) return;

  jsPsych.pluginAPI.setTimeout(() => {
    stimulus.innerHTML = config.showFixation ? createFixationHTML() : createBlankHTML();
  }, config.stimulusDuration);
}

/**
 * Creates blank HTML for the ISI period.
 */
function createBlankHTML(): string {
  return `<div class="cpt-trial-content"></div>`;
}

/**
 * Smallest maximum run length that `count` items of one class can be held to,
 * given `others` items of the other class available to break them up. The other
 * class creates at most `others + 1` gaps to distribute this class across.
 */
function minFeasibleRun(count: number, others: number): number {
  return count === 0 ? 0 : Math.ceil(count / (others + 1));
}

/**
 * Raises a desired run limit to one the trial composition can actually satisfy.
 *
 * Holding a class to exactly its minimum feasible run leaves so few valid
 * arrangements that the sequence becomes periodic and predictable, so a feasible
 * limit is given room above the minimum.
 */
function feasibleRunLimit(count: number, others: number, desired: number): number {
  return Math.max(desired, minFeasibleRun(count, others) * RUN_LIMIT_HEADROOM);
}

/**
 * True when no run of either class exceeds its limit.
 */
function runsWithinLimits(plan: boolean[], maxTargetRun: number, maxNontargetRun: number): boolean {
  let run = 0;
  let current: boolean | null = null;
  for (const isTarget of plan) {
    run = isTarget === current ? run + 1 : 1;
    current = isTarget;
    if (run > (isTarget ? maxTargetRun : maxNontargetRun)) return false;
  }
  return true;
}

/**
 * Builds one arrangement satisfying both run limits, choosing each position from
 * the classes that still have trials left and cannot strand the remainder.
 *
 * Returns null when the limits are unsatisfiable for this composition.
 */
function seedArrangement(
  numTargets: number,
  numNontargets: number,
  maxTargetRun: number,
  maxNontargetRun: number
): boolean[] | null {
  const plan: boolean[] = [];
  let targetsLeft = numTargets;
  let nontargetsLeft = numNontargets;
  let inTargetRun = false;
  let run = 0;

  while (targetsLeft > 0 || nontargetsLeft > 0) {
    // Length this position would give the current run for each choice.
    const targetRun = inTargetRun ? run + 1 : 1;
    const nontargetRun = inTargetRun ? 1 : run + 1;

    // A choice is only allowed if what remains can still be arranged: the leftover
    // trials of each class have to fit in the runs the other class can separate.
    const canTakeTarget =
      targetsLeft > 0 &&
      targetRun <= maxTargetRun &&
      targetsLeft - 1 <= maxTargetRun - targetRun + maxTargetRun * nontargetsLeft &&
      nontargetsLeft <= maxNontargetRun * targetsLeft;
    const canTakeNontarget =
      nontargetsLeft > 0 &&
      nontargetRun <= maxNontargetRun &&
      nontargetsLeft - 1 <= maxNontargetRun - nontargetRun + maxNontargetRun * targetsLeft &&
      targetsLeft <= maxTargetRun * nontargetsLeft;

    let takeTarget: boolean;
    if (canTakeTarget && canTakeNontarget) {
      // Weight by what is left so the classes stay proportionally mixed.
      takeTarget = Math.random() * (targetsLeft + nontargetsLeft) < targetsLeft;
    } else if (canTakeTarget) {
      takeTarget = true;
    } else if (canTakeNontarget) {
      takeTarget = false;
    } else {
      return null;
    }

    plan.push(takeTarget);
    run = takeTarget === inTargetRun ? run + 1 : 1;
    inTargetRun = takeTarget;
    if (takeTarget) targetsLeft--;
    else nontargetsLeft--;
  }

  return plan;
}

/**
 * Removes the seed's ordering bias by swapping pairs at random and keeping only
 * the swaps that leave both run limits satisfied. Swapping preserves the trial
 * counts exactly, so only the arrangement changes.
 */
function mixArrangement(plan: boolean[], maxTargetRun: number, maxNontargetRun: number): void {
  const swaps = plan.length * MIX_SWEEPS;
  for (let s = 0; s < swaps; s++) {
    const i = Math.floor(Math.random() * plan.length);
    const j = Math.floor(Math.random() * plan.length);
    if (plan[i] === plan[j]) continue;
    [plan[i], plan[j]] = [plan[j], plan[i]];
    if (!runsWithinLimits(plan, maxTargetRun, maxNontargetRun)) {
      [plan[i], plan[j]] = [plan[j], plan[i]];
    }
  }
}

/**
 * Returns a random permutation of `sequence` in which no more than
 * `desiredTargetRun` targets and no more than `desiredNontargetRun` non-targets
 * appear consecutively.
 *
 * Each limit is raised first to something the trial composition can satisfy, so a
 * limit written for one mode's proportions cannot silently mangle another's.
 */
function constrainSequence<T>(
  sequence: T[],
  isTarget: (item: T) => boolean,
  desiredTargetRun: number,
  desiredNontargetRun: number
): T[] {
  const targets = shuffleArray(sequence.filter((item) => isTarget(item)));
  const nontargets = shuffleArray(sequence.filter((item) => !isTarget(item)));

  const maxTargetRun = feasibleRunLimit(targets.length, nontargets.length, desiredTargetRun);
  const maxNontargetRun = feasibleRunLimit(nontargets.length, targets.length, desiredNontargetRun);

  const plan = seedArrangement(targets.length, nontargets.length, maxTargetRun, maxNontargetRun);
  if (plan === null) {
    throw new Error(
      `[${TASK_NAME}] cannot arrange ${targets.length} target and ${nontargets.length} ` +
        `non-target trials with runs of at most ${maxTargetRun} and ${maxNontargetRun}`
    );
  }
  mixArrangement(plan, maxTargetRun, maxNontargetRun);

  let nextTarget = 0;
  let nextNontarget = 0;
  return plan.map((takeTarget) =>
    takeTarget ? targets[nextTarget++] : nontargets[nextNontarget++]
  );
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
    ...Array(numTargets)
      .fill(null)
      .map(() => ({ letter: targetLetter, isTarget: true })),
    ...Array(numNontargets)
      .fill(null)
      .map(() => ({
        letter: randomChoice(nontargetPool),
        isTarget: false,
      })),
  ];

  return constrainSequence(
    sequence,
    (item) => item.isTarget,
    MAX_CONSECUTIVE_TARGETS,
    MAX_CONSECUTIVE_NONTARGETS
  );
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
    ...Array(numNogo)
      .fill(null)
      .map(() => ({ letter: targetLetter, isTarget: false })),
    ...Array(numGo)
      .fill(null)
      .map(() => ({
        letter: randomChoice(goPool),
        isTarget: true,
      })),
  ];

  // isTarget marks the frequent go stimulus here, so the limits are the go/no-go
  // pair rather than the rare-target pair the other modes use.
  return constrainSequence(
    sequence,
    (item) => item.isTarget,
    MAX_CONSECUTIVE_GO,
    MAX_CONSECUTIVE_NOGO
  );
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

  const sequence: Array<{ cue: string; probe: string; trialType: AXTrialType; isTarget: boolean }> =
    [
      ...Array(numAX)
        .fill(null)
        .map(() => ({
          cue: cueLetter,
          probe: probeLetter,
          trialType: "ax" as AXTrialType,
          isTarget: true,
        })),
      ...Array(numAY)
        .fill(null)
        .map(() => ({
          cue: cueLetter,
          probe: randomChoice(nonProbeLetters),
          trialType: "ay" as AXTrialType,
          isTarget: false,
        })),
      ...Array(numBX)
        .fill(null)
        .map(() => ({
          cue: randomChoice(nonCueLetters),
          probe: probeLetter,
          trialType: "bx" as AXTrialType,
          isTarget: false,
        })),
      ...Array(numBY)
        .fill(null)
        .map(() => ({
          cue: randomChoice(nonCueLetters),
          probe: randomChoice(nonProbeLetters),
          trialType: "by" as AXTrialType,
          isTarget: false,
        })),
    ];

  return constrainSequence(
    sequence,
    (item) => item.isTarget,
    MAX_CONSECUTIVE_TARGETS,
    MAX_CONSECUTIVE_NONTARGETS
  );
}

/**
 * Unified sequence generator that dispatches based on mode.
 */
function generateSequence(
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
  const a4 = 1.38357751867269e2;
  const a5 = -3.066479806614716e1;
  const a6 = 2.506628277459239;

  const b1 = -5.447609879822406e1;
  const b2 = 1.615858368580409e2;
  const b3 = -1.556989798598866e2;
  const b4 = 6.680131188771972e1;
  const b5 = -1.328068155288572e1;

  const c1 = -7.784894002430293e-3;
  const c2 = -3.223964580411365e-1;
  const c3 = -2.400758277161838;
  const c4 = -2.549732539343734;
  const c5 = 4.374664141464968;
  const c6 = 2.938163982698783;

  const d1 = 7.784695709041462e-3;
  const d2 = 3.224671290700398e-1;
  const d3 = 2.445134137142996;
  const d4 = 3.754408661907416;

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
  hits: number,
  nTargets: number,
  falseAlarms: number,
  nNontargets: number
): { dPrime: number | null; beta: number | null } {
  // d-prime is undefined without both kinds of trial to compare
  if (nTargets === 0 || nNontargets === 0) {
    return { dPrime: null, beta: null };
  }

  const hitRate = hits / nTargets;
  const falseAlarmRate = falseAlarms / nNontargets;

  // Log-linear correction: (count + 0.5) / (total + 1)
  let adjustedHR = hitRate;
  let adjustedFAR = falseAlarmRate;

  if (hitRate === 0 || hitRate === 1) {
    adjustedHR = (hits + 0.5) / (nTargets + 1);
  }

  if (falseAlarmRate === 0 || falseAlarmRate === 1) {
    adjustedFAR = (falseAlarms + 0.5) / (nNontargets + 1);
  }

  const zHit = inverseNormalCDF(adjustedHR);
  const zFA = inverseNormalCDF(adjustedFAR);

  const dPrime = zHit - zFA;

  // Beta = exp(-0.5 * (zFA^2 - zHit^2))
  const beta = Math.exp(-0.5 * (zFA * zFA - zHit * zHit));

  return { dPrime, beta };
}

/**
 * reject configurations that would produce invalid/degenerate datasets,
 * always failing loudly at construction rather than silently.
 */
function validateConfig(config: ResolvedConfig): void {
  for (const [name, value] of [
    ["numTrials", config.numTrials],
    ["numBlocks", config.numBlocks],
  ] as const) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`[${TASK_NAME}] ${name} must be an integer >= 1, got ${value}`);
    }
  }

  if (!Number.isFinite(config.stimulusDuration) || config.stimulusDuration < 1) {
    throw new Error(
      `[${TASK_NAME}] stimulusDuration must be a finite number >= 1, got ${config.stimulusDuration}`
    );
  }

  if (config.numBlocks > config.numTrials) {
    throw new Error(
      `[${TASK_NAME}] numBlocks (${config.numBlocks}) cannot exceed numTrials ` +
        `(${config.numTrials}); every block must contain at least one trial`
    );
  }

  if (config.isiSet !== null) {
    if (!Array.isArray(config.isiSet) || config.isiSet.length === 0) {
      throw new Error(`[${TASK_NAME}] isiSet must be a non-empty array of durations`);
    }
    config.isiSet.forEach((isi, i) => {
      if (!Number.isFinite(isi) || isi < 0) {
        throw new Error(`[${TASK_NAME}] isiSet[${i}] must be a finite number >= 0, got ${isi}`);
      }
    });
  } else {
    for (const [name, value] of [
      ["isiMin", config.isiMin],
      ["isiMax", config.isiMax],
    ] as const) {
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`[${TASK_NAME}] ${name} must be a finite number >= 0, got ${value}`);
      }
    }
    if (config.isiMax < config.isiMin) {
      throw new Error(
        `[${TASK_NAME}] isiMax must be >= isiMin (${config.isiMin}), got ${config.isiMax}`
      );
    }
  }

  if (config.showPractice) {
    if (!Number.isInteger(config.numPracticeTrials) || config.numPracticeTrials < 1) {
      throw new Error(
        `[${TASK_NAME}] numPracticeTrials must be an integer >= 1, got ${config.numPracticeTrials}`
      );
    }
    if (!Number.isFinite(config.feedbackDuration) || config.feedbackDuration < 1) {
      throw new Error(
        `[${TASK_NAME}] feedbackDuration must be a finite number >= 1, got ${config.feedbackDuration}`
      );
    }
  }

  if (config.mode === "standard" || config.mode === "inhibition") {
    if (typeof config.targetLetter !== "string" || config.targetLetter.length === 0) {
      throw new Error(
        `[${TASK_NAME}] targetLetter must be a non-empty string, got ${JSON.stringify(
          config.targetLetter
        )}`
      );
    }
    if (!Array.isArray(config.stimuliPool) || config.stimuliPool.length === 0) {
      throw new Error(`[${TASK_NAME}] stimuliPool must be a non-empty array of letters`);
    }
    if (config.stimuliPool.some((l) => typeof l !== "string" || l.length === 0)) {
      throw new Error(`[${TASK_NAME}] stimuliPool must contain only non-empty strings`);
    }

    const probabilityName =
      config.mode === "standard" ? "targetProbability" : "nontargetProbability";
    const probability =
      config.mode === "standard" ? config.targetProbability : config.nontargetProbability;
    // rejects NaN and Infinity as well as values outside [0, 1]
    if (!(probability >= 0) || !(probability <= 1)) {
      throw new Error(
        `[${TASK_NAME}] ${probabilityName} must be a probability between 0 and 1, got ${probability}`
      );
    }

    // the pool supplies the letters that are not the target letter, so it only has
    // to be non-degenerate when the sequence actually draws from it.
    const numFromPool = config.numTrials - Math.round(config.numTrials * probability);
    if (numFromPool > 0 && config.stimuliPool.every((l) => l === config.targetLetter)) {
      throw new Error(
        `[${TASK_NAME}] stimuliPool must contain at least one letter other than ` +
          `targetLetter ("${config.targetLetter}")`
      );
    }
  }

  if (config.mode === "ax") {
    for (const [name, value] of [
      ["cueLetter", config.cueLetter],
      ["probeLetter", config.probeLetter],
    ] as const) {
      if (typeof value !== "string" || value.length === 0) {
        throw new Error(
          `[${TASK_NAME}] ${name} must be a non-empty string, got ${JSON.stringify(value)}`
        );
      }
    }

    for (const [name, value] of [
      ["axProbability", config.axProbability],
      ["ayProbability", config.ayProbability],
      ["bxProbability", config.bxProbability],
      ["byProbability", config.byProbability],
    ] as const) {
      // rejects NaN and Infinity as well as values outside [0, 1]
      if (!(value >= 0) || !(value <= 1)) {
        throw new Error(
          `[${TASK_NAME}] ${name} must be a probability between 0 and 1, got ${value}`
        );
      }
    }

    const sum =
      config.axProbability + config.ayProbability + config.bxProbability + config.byProbability;
    if (Math.abs(sum - 1) > 1e-9) {
      throw new Error(
        `[${TASK_NAME}] axProbability, ayProbability, bxProbability and byProbability ` +
          `must sum to 1, got ${sum}`
      );
    }

    // Rounding each probability independently can still overshoot numTrials on short
    // runs (BY takes the remainder and would go negative), so check the counts the
    // generator will actually derive.
    const numAX = Math.round(config.numTrials * config.axProbability);
    const numAY = Math.round(config.numTrials * config.ayProbability);
    const numBX = Math.round(config.numTrials * config.bxProbability);
    const numBY = config.numTrials - numAX - numAY - numBX;
    if (numBY < 0) {
      throw new Error(
        `[${TASK_NAME}] the AX trial-type probabilities round to more than numTrials ` +
          `(${config.numTrials}) at this trial count: ax=${numAX}, ay=${numAY}, ` +
          `bx=${numBX} leaves ${numBY} for by. Increase numTrials or adjust the probabilities`
      );
    }

    for (const [name, pool, needed] of [
      ["nonCueLetters", config.nonCueLetters, numBX > 0 || numBY > 0],
      ["nonProbeLetters", config.nonProbeLetters, numAY > 0 || numBY > 0],
    ] as const) {
      if (!needed) continue;
      if (!Array.isArray(pool) || pool.length === 0) {
        throw new Error(`[${TASK_NAME}] ${name} must be a non-empty array of letters`);
      }
      if (pool.some((l) => typeof l !== "string" || l.length === 0)) {
        throw new Error(`[${TASK_NAME}] ${name} must contain only non-empty strings`);
      }
    }

    if (!Number.isFinite(config.cueDelay) || config.cueDelay < 1) {
      throw new Error(
        `[${TASK_NAME}] cueDelay must be a finite number >= 1, got ${config.cueDelay}`
      );
    }
    // The cue is swapped for a fixation after stimulusDuration, which only happens
    // while the cue trial is still on screen.
    if (config.cueDelay < config.stimulusDuration) {
      throw new Error(
        `[${TASK_NAME}] cueDelay must be >= stimulusDuration ` +
          `(${config.stimulusDuration}), got ${config.cueDelay}`
      );
    }
  }
}

/**
 * Builds a trial sequence for `numTrials` trials under `options`.
 *
 * Takes the same options object as `createTimeline`, so a researcher assembling a
 * custom timeline does not need the internal resolved-config shape.
 */
function generateTrialSequence(options: CPTOptions = {}, numTrials?: number) {
  const config = resolveConfig(options);
  return generateSequence(config, numTrials ?? config.numTrials);
}

/**
 * Merges caller options over the defaults and validates the result.
 *
 * Every public entry point takes `CPTOptions` and resolves here, so a researcher
 * never has to assemble a fully populated config by hand.
 */
function resolveConfig(options: CPTOptions = {}): ResolvedConfig {
  const text: TextConfig = { ...defaultText, ...options.text };
  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    isiSet: options.isiSet ?? DEFAULT_OPTIONS.isiSet,
    text,
  };
  validateConfig(config);
  return config;
}

// -- TIMELINE UNITS --

/**
 * Creates instruction trials.
 */
function createInstructionTrials(
  options: CPTOptions = {},
  part: "intro" | "practice" | "main" = "intro"
) {
  const config = resolveConfig(options);
  let stimulus: string;
  let buttonLabel: string;

  switch (part) {
    case "intro":
      switch (config.mode) {
        case "standard":
          stimulus = config.text.instruction_standard(
            config.targetLetter,
            config.text.respond_button
          );
          break;
        case "inhibition":
          stimulus = config.text.instruction_inhibition(
            config.targetLetter,
            config.text.respond_button
          );
          break;
        case "ax":
          stimulus = config.text.instruction_ax(
            config.cueLetter,
            config.probeLetter,
            config.text.respond_button
          );
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
    css_classes: [CSS_ROOT],
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
    css_classes: [CSS_ROOT],
    stimulus: createStimulusHTML(trialInfo.letter),
    choices: [config.text.respond_button],
    trial_duration: config.stimulusDuration + currentISI,
    response_ends_trial: false,
    on_load: () => scheduleStimulusOffset(jsPsych, config),
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: isPractice ? "practice" : "test",
      part: "stimulus",
      trial_number: trialIndex,
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
      css_classes: [CSS_ROOT],
      stimulus: () => {
        const lastData = jsPsych.data.getLastTrialData().values()[0];
        const responded = lastData.responded;
        const isTargetTrial = lastData.is_target;

        if (isTargetTrial && responded) {
          return `<div class="cpt-trial-content"><div class="cpt-feedback cpt-feedback-correct">${config.text.feedback_hit}</div></div>`;
        } else if (isTargetTrial && !responded) {
          return `<div class="cpt-trial-content"><div class="cpt-feedback cpt-feedback-incorrect">${config.text.feedback_miss}</div></div>`;
        } else if (!isTargetTrial && responded) {
          return `<div class="cpt-trial-content"><div class="cpt-feedback cpt-feedback-incorrect">${config.text.feedback_false_alarm}</div></div>`;
        } else {
          return `<div class="cpt-trial-content"><div class="cpt-feedback cpt-feedback-correct">${config.text.feedback_correct_rejection}</div></div>`;
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
    css_classes: [CSS_ROOT],
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
      trial_number: trialIndex,
      stimulus_letter: trialInfo.cue,
      ax_trial_type: trialInfo.trialType,
      ax_part: "cue",
      block: block,
    },
    on_load: () => scheduleStimulusOffset(jsPsych, config),
  });

  // Probe trial - this is the scored response
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    css_classes: [CSS_ROOT],
    stimulus: createStimulusHTML(trialInfo.probe),
    choices: [config.text.respond_button],
    trial_duration: config.stimulusDuration + currentISI,
    response_ends_trial: false,
    on_load: () => scheduleStimulusOffset(jsPsych, config),
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: isPractice ? "practice" : "test",
      part: "stimulus",
      trial_number: trialIndex,
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
      css_classes: [CSS_ROOT],
      stimulus: () => {
        const lastData = jsPsych.data.getLastTrialData().values()[0];
        const responded = lastData.responded;
        const isTargetTrial = lastData.is_target;

        if (isTargetTrial && responded) {
          return `<div class="cpt-trial-content"><div class="cpt-feedback cpt-feedback-correct">${config.text.feedback_hit}</div></div>`;
        } else if (isTargetTrial && !responded) {
          return `<div class="cpt-trial-content"><div class="cpt-feedback cpt-feedback-incorrect">${config.text.feedback_miss}</div></div>`;
        } else if (!isTargetTrial && responded) {
          return `<div class="cpt-trial-content"><div class="cpt-feedback cpt-feedback-incorrect">${config.text.feedback_false_alarm}</div></div>`;
        } else {
          return `<div class="cpt-trial-content"><div class="cpt-feedback cpt-feedback-correct">${config.text.feedback_correct_rejection}</div></div>`;
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
function createPracticeBlock(jsPsych: JsPsych, options: CPTOptions = {}) {
  const config = resolveConfig(options);
  const sequence = generateSequence(config, config.numPracticeTrials);
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
function createTestBlock(jsPsych: JsPsych, options: CPTOptions = {}, block = 1) {
  const config = resolveConfig(options);
  const sequence = generateSequence(config, config.numTrials);
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
function createRestScreen(options: CPTOptions = {}) {
  const config = resolveConfig(options);
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [CSS_ROOT],
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
function createCompletionTrial(jsPsych: JsPsych, options: CPTOptions = {}) {
  const config = resolveConfig(options);
  return {
    type: jsPsychHtmlButtonResponse,
    css_classes: [CSS_ROOT],
    stimulus: () => {
      const data = jsPsych.data.get();
      const scores = calculateScores(data);

      let html = `<div class="cpt-instructions">`;
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
 * Builds a ScoringResult from one set of target and non-target trials.
 *
 * A rate is null when the trials it describes do not exist. Zero is a real value
 * on the same scale — a hit rate of 0 means every target was missed — so reporting
 * 0 for "no targets were shown" would conflate opposite outcomes.
 *
 * `rtSource` selects which responses feed the RT statistics: the overall and
 * per-block summaries describe hits, while a per-AX-type summary describes every
 * response of that type, since a single AX type contains only one trial class.
 */
function summarizeTrials(
  targetTrials: TrialData[],
  nontargetTrials: TrialData[],
  options: { rtSource: "hits" | "all" }
): ScoringResult {
  const totalTargets = targetTrials.length;
  const totalNontargets = nontargetTrials.length;

  const hits = targetTrials.filter((t) => t.responded).length;
  const misses = totalTargets - hits;
  const commissions = nontargetTrials.filter((t) => t.responded).length;

  // Null whenever one class is absent, which is also what makes d-prime null for a
  // single AX trial type: those hold only targets or only non-targets.
  const { dPrime, beta } = calculateDPrimeAndBeta(hits, totalTargets, commissions, totalNontargets);

  const rtTrials =
    options.rtSource === "hits" ? targetTrials : [...targetTrials, ...nontargetTrials];
  const rts = rtTrials.filter((t) => t.responded && t.rt !== null).map((t) => t.rt as number);

  return {
    hits,
    totalTargets,
    hitRate: totalTargets > 0 ? hits / totalTargets : null,
    omissionRate: totalTargets > 0 ? misses / totalTargets : null,
    commissions,
    totalNontargets,
    commissionRate: totalNontargets > 0 ? commissions / totalNontargets : null,
    meanRT: rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : null,
    rtStd: calculateStd(rts),
    dPrime,
    beta,
  };
}

/**
 * Calculates scoring metrics from the CPT task data.
 */
function calculateScores(data: DataCollection): ScoringResult {
  const responseTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "stimulus" })
    .values() as TrialData[];

  return summarizeTrials(
    responseTrials.filter((t) => t.is_target),
    responseTrials.filter((t) => !t.is_target),
    { rtSource: "hits" }
  );
}

/**
 * Computes per-block scores for vigilance decrement analysis.
 */
function computeBlockScores(data: DataCollection): ScoringResult[] {
  const responseTrials = data
    .filter({ task: TASK_NAME, phase: "test", part: "stimulus" })
    .values() as TrialData[];

  const blocks = new Set(responseTrials.map((t) => t.block).filter((b) => b !== undefined));
  const blockNumbers = Array.from(blocks).sort((a, b) => (a as number) - (b as number));

  return blockNumbers.map((blockNum) => {
    const blockTrials = responseTrials.filter((t) => t.block === blockNum);
    return summarizeTrials(
      blockTrials.filter((t) => t.is_target),
      blockTrials.filter((t) => !t.is_target),
      { rtSource: "hits" }
    );
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

    // d-prime needs both trial classes, which a single AX type never has; it is
    // reported at the overall level instead.
    result[tt] = summarizeTrials(
      trials.filter((t) => t.is_target),
      trials.filter((t) => !t.is_target),
      { rtSource: "all" }
    );
  }

  return result as Record<AXTrialType, ScoringResult>;
}

/**
 * Returns a full summary of the CPT performance.
 */
function getSummary(data: DataCollection): ScoringResult & {
  taskName: string;
  version: string;
  blockScores?: ScoringResult[];
  axScores?: Record<AXTrialType, ScoringResult>;
} {
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
export function createTimeline(jsPsych: JsPsych, options: CPTOptions = {}) {
  const config = resolveConfig(options);

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
    timeline.push(createTestBlock(jsPsych, config, 1));
  } else {
    const trialsPerBlock = Math.floor(config.numTrials / config.numBlocks);
    const remainder = config.numTrials % config.numBlocks;

    for (let b = 0; b < config.numBlocks; b++) {
      const blockTrials = trialsPerBlock + (b < remainder ? 1 : 0);
      // Each block is built as a standalone one-block run of its own trial count.
      timeline.push(
        createTestBlock(jsPsych, { ...config, numTrials: blockTrials, numBlocks: 1 }, b + 1)
      );

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
