import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { defaultText, TextConfig } from "./text";

// -- TYPES --

export type DigitSpanMode = "forward" | "backward" | "both";

export interface DigitSpanOptions {
  /** Task mode: "forward", "backward", or "both" (default: "forward") */
  mode?: DigitSpanMode;
  /** Show built-in instruction screens (default: true) */
  showInstructions?: boolean;
  /** Show feedback after each trial (default: true) */
  showFeedback?: boolean;
  /** Number of practice trials (default: 2) */
  numPracticeTrials?: number;
  /** Number of test trials per mode (default: 14) */
  numTestTrials?: number;
  /** Starting span length (default: 4) */
  startingSpan?: number;
  /** Minimum span length (default: 2) */
  minSpan?: number;
  /** Maximum span length (default: 10) */
  maxSpan?: number;
  /** Span length for practice trials (default: 3) */
  practiceSpan?: number;
  /** Ready signal duration in ms (default: 800) */
  readyDuration?: number;
  /** Each digit display duration in ms (default: 1000) */
  digitDuration?: number;
  /** Feedback display duration in ms (default: 1500) */
  feedbackDuration?: number;
  /** Inter-trial interval in ms (default: 1500) */
  interTrialInterval?: number;
  /** Custom text strings for translation */
  text?: Partial<TextConfig>;
}

export interface TrialData {
  task: string;
  task_version: string;
  phase: "practice" | "test";
  mode: "forward" | "backward";
  trial: number;
  span_length: number;
  presented_digits: string;
  correct_response: string;
  response: string;
  correct: boolean;
  rt: number | null;
}

export interface ScoringResult {
  maxSpan: number;
  totalCorrect: number;
  meanSpan: number | null;
  totalTrials: number;
}

export interface FullScoringResult {
  forwardMaxSpan: number | null;
  backwardMaxSpan: number | null;
  forwardTotalCorrect: number;
  backwardTotalCorrect: number;
  forwardMeanSpan: number | null;
  backwardMeanSpan: number | null;
  forwardTrials: number;
  backwardTrials: number;
}

// Internal config type with text resolved
interface ResolvedConfig {
  mode: DigitSpanMode;
  showInstructions: boolean;
  showFeedback: boolean;
  numPracticeTrials: number;
  numTestTrials: number;
  startingSpan: number;
  minSpan: number;
  maxSpan: number;
  practiceSpan: number;
  readyDuration: number;
  digitDuration: number;
  feedbackDuration: number;
  interTrialInterval: number;
  text: TextConfig;
}

// -- CONSTANTS --

const TASK_NAME = "digit-span";
const VERSION = "0.0.1";

const DEFAULT_OPTIONS = {
  mode: "forward" as DigitSpanMode,
  showInstructions: true,
  showFeedback: true,
  numPracticeTrials: 2,
  numTestTrials: 14,
  startingSpan: 4,
  minSpan: 2,
  maxSpan: 10,
  practiceSpan: 3,
  readyDuration: 800,
  digitDuration: 1000,
  feedbackDuration: 1500,
  interTrialInterval: 1500,
};

// -- UTILITY FUNCTIONS --

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Generates a random digit sequence without repeats.
 */
function generateDigitSequence(length: number): number[] {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Fisher-Yates shuffle
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits.slice(0, length);
}

/**
 * Formats digit sequence for display (e.g., "3-7-2-9").
 */
function formatDigitSequence(digits: number[]): string {
  return digits.join("-");
}

/**
 * Calculates the next span length based on staircase algorithm.
 */
function getNextSpanLength(
  currentSpan: number,
  wasCorrect: boolean,
  minSpan: number,
  maxSpan: number
): number {
  if (wasCorrect) {
    return Math.min(currentSpan + 1, maxSpan);
  } else {
    return Math.max(currentSpan - 1, minSpan);
  }
}

/**
 * Creates the HTML for the number pad response interface.
 */
function createResponseHtml(
  currentResponse: string,
  text: TextConfig,
  mode: "forward" | "backward"
): string {
  const prompt =
    mode === "forward" ? text.response_prompt : text.response_prompt_backward;

  return `
    <div class="prompt">${prompt}</div>
    <div class="display" id="digit-span-display">${currentResponse || "&nbsp;"}</div>
    <div class="numpad-container">
      <div class="numpad">
        <button type="button" class="jspsych-btn digit-button" data-digit="1">1</button>
        <button type="button" class="jspsych-btn digit-button" data-digit="2">2</button>
        <button type="button" class="jspsych-btn digit-button" data-digit="3">3</button>
        <button type="button" class="jspsych-btn digit-button" data-digit="4">4</button>
        <button type="button" class="jspsych-btn digit-button" data-digit="5">5</button>
        <button type="button" class="jspsych-btn digit-button" data-digit="6">6</button>
        <button type="button" class="jspsych-btn digit-button" data-digit="7">7</button>
        <button type="button" class="jspsych-btn digit-button" data-digit="8">8</button>
        <button type="button" class="jspsych-btn digit-button" data-digit="9">9</button>
        <button type="button" class="jspsych-btn clear-button" id="digit-span-clear">${text.clear_button}</button>
        <button type="button" class="jspsych-btn digit-button" data-digit="0">0</button>
        <button type="button" class="jspsych-btn done-button" id="digit-span-done">${text.done_button}</button>
      </div>
    </div>
  `;
}

// -- TIMELINE UNITS --

/**
 * Creates interactive instructions with a practice trial.
 * Users must enter a short digit sequence correctly to proceed.
 */
function createInteractiveInstructions(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  mode: "forward" | "backward"
) {
  const text = config.text;

  // Intro page
  const introPage = {
    type: jsPsychHtmlButtonResponse,
    stimulus: mode === "forward" ? text.instruction_intro_forward : text.instruction_intro_backward,
    choices: [text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
      mode: mode,
    },
  };

  // Response explanation page
  const responseExplanation = {
    type: jsPsychHtmlButtonResponse,
    stimulus: mode === "forward" ? text.instruction_response_forward : text.instruction_example_backward,
    choices: [text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
      mode: mode,
    },
  };

  // Try prompt
  const tryPrompt = {
    type: jsPsychHtmlButtonResponse,
    stimulus: mode === "forward" ? text.instruction_try_forward : text.instruction_try_backward,
    choices: [text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
      mode: mode,
    },
  };

  // Practice digit sequence (2 digits for simplicity)
  const practiceDigits = [3, 7];
  const correctResponse = mode === "forward" ? "37" : "73";

  // Ready signal
  const readyTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class="ready">${text.ready_prompt}</div>`,
    choices: "NO_KEYS",
    trial_duration: config.readyDuration,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions-practice",
    },
  };

  // Digit presentation trials
  const digitTrials = practiceDigits.map((digit) => ({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class="stimulus">${digit}</div>`,
    choices: "NO_KEYS",
    trial_duration: config.digitDuration,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions-practice",
      digit: digit,
    },
  }));

  // Response trial with custom number pad
  const responseTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: createResponseHtml("", text, mode),
    choices: [],
    trial_duration: null,
    css_classes: ["response-interface"],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions-practice",
      mode: mode,
      correct_response: correctResponse,
    },
    on_load: () => {
      let currentResponse = "";
      const display = document.getElementById("digit-span-display");
      const startTime = performance.now();

      document.querySelectorAll(".digit-button").forEach((button) => {
        button.addEventListener("click", (e) => {
          const digit = (e.target as HTMLElement).getAttribute("data-digit");
          if (digit) {
            currentResponse += digit;
            if (display) display.textContent = currentResponse;
          }
        });
      });

      const clearBtn = document.getElementById("digit-span-clear");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          currentResponse = "";
          if (display) display.innerHTML = "&nbsp;";
        });
      }

      const doneBtn = document.getElementById("digit-span-done");
      if (doneBtn) {
        doneBtn.addEventListener("click", () => {
          const endTime = performance.now();
          const rt = endTime - startTime;

          jsPsych.finishTrial({
            response: currentResponse,
            rt: rt,
            correct: currentResponse === correctResponse,
          });
        });
      }
    },
  };

  // Feedback trial
  const feedbackTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().filter({ phase: "instructions-practice" }).last(1).values()[0];
      if (lastTrial && lastTrial.correct) {
        return `<div class="feedback correct"><p>${text.instruction_success}</p></div>`;
      }
      return `<div class="feedback incorrect"><p>${text.instruction_failure}</p></div>`;
    },
    choices: [text.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "instructions",
      mode: mode,
    },
  };

  // Create looping practice that retries if incorrect
  const practiceLoop = {
    timeline: [tryPrompt, readyTrial, ...digitTrials, responseTrial, feedbackTrial],
    loop_function: () => {
      const lastResponseTrial = jsPsych.data.get().filter({ phase: "instructions-practice", correct_response: correctResponse }).last(1).values()[0];
      return lastResponseTrial && !lastResponseTrial.correct;
    },
  };

  return {
    timeline: [introPage, responseExplanation, practiceLoop],
  };
}

/**
 * Creates instruction trials for a given mode.
 * @deprecated Use createInteractiveInstructions instead
 */
function createInstructionTrials(config: ResolvedConfig, mode: "forward" | "backward") {
  const pages =
    mode === "forward"
      ? config.text.instruction_pages_forward
      : config.text.instruction_pages_backward;

  return {
    timeline: pages.map((page) => ({
      type: jsPsychHtmlButtonResponse,
      stimulus: `<div class="instructions" >${page}</div>`,
      choices: [config.text.continue_button],
      data: {
        task: TASK_NAME,
        part: "instruction",
        mode: mode,
      },
    })),
  };
}

/**
 * Creates a ready signal trial.
 */
function createReadyTrial(config: ResolvedConfig) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class="ready" >${config.text.ready_prompt}</div>`,
    choices: "NO_KEYS",
    trial_duration: config.readyDuration,
    data: {
      task: TASK_NAME,
      part: "ready",
    },
  };
}

/**
 * Creates digit presentation trials for a given sequence.
 */
function createDigitPresentationTrials(digits: number[], config: ResolvedConfig) {
  return digits.map((digit) => ({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class="stimulus" >${digit}</div>`,
    choices: "NO_KEYS",
    trial_duration: config.digitDuration,
    data: {
      task: TASK_NAME,
      part: "digit_presentation",
      digit: digit,
    },
  }));
}

/**
 * Creates a response collection trial with custom number pad.
 */
function createResponseTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  mode: "forward" | "backward",
  presentedDigits: number[],
  phase: "practice" | "test",
  trialNumber: number,
  spanLength: number
) {
  // Calculate correct response
  const correctDigits = mode === "forward" ? presentedDigits : [...presentedDigits].reverse();
  const correctResponse = correctDigits.join("");
  const presentedDigitsStr = formatDigitSequence(presentedDigits);

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: createResponseHtml("", config.text, mode),
    choices: [], // No standard buttons - we use custom interface
    trial_duration: null, // Untimed
    css_classes: ["response-interface"],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: phase,
      mode: mode,
      trial: trialNumber,
      span_length: spanLength,
      presented_digits: presentedDigitsStr,
      correct_response: correctResponse,
      part: "response",
    },
    on_load: () => {
      let currentResponse = "";
      const display = document.getElementById("digit-span-display");
      const startTime = performance.now();

      // Handle digit button clicks
      document.querySelectorAll(".digit-button").forEach((button) => {
        button.addEventListener("click", (e) => {
          const digit = (e.target as HTMLElement).getAttribute("data-digit");
          if (digit) {
            currentResponse += digit;
            if (display) display.textContent = currentResponse;
          }
        });
      });

      // Handle clear button
      const clearBtn = document.getElementById("digit-span-clear");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          currentResponse = "";
          if (display) display.innerHTML = "&nbsp;";
        });
      }

      // Handle done button
      const doneBtn = document.getElementById("digit-span-done");
      if (doneBtn) {
        doneBtn.addEventListener("click", () => {
          const endTime = performance.now();
          const rt = endTime - startTime;

          // Finish the trial
          jsPsych.finishTrial({
            response: currentResponse,
            rt: rt,
            correct: currentResponse === correctResponse,
          });
        });
      }
    },
  };
}

/**
 * Creates a feedback trial.
 */
function createFeedbackTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().last(1).values()[0];
      let feedbackText: string;
      let feedbackClass: string;

      if (lastTrial.correct) {
        feedbackText = config.text.correct_feedback;
        feedbackClass = "feedback correct";
      } else {
        feedbackText = config.text.incorrect_feedback(lastTrial.correct_response);
        feedbackClass = "feedback incorrect";
      }

      return `<div class="${feedbackClass}" >${feedbackText}</div>`;
    },
    choices: "NO_KEYS",
    trial_duration: config.feedbackDuration,
    data: {
      task: TASK_NAME,
      part: "feedback",
    },
  };
}

/**
 * Creates an ITI trial.
 */
function createItiTrial(config: ResolvedConfig) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "",
    choices: "NO_KEYS",
    trial_duration: config.interTrialInterval,
    data: {
      task: TASK_NAME,
      part: "iti",
    },
  };
}

/**
 * Creates a transition screen.
 */
function createTransitionTrial(message: string, buttonLabel: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="transition" ><p>${message}</p></div>`,
    choices: [buttonLabel],
    data: {
      task: TASK_NAME,
      part: "transition",
    },
  };
}

/**
 * Creates a single digit span trial (ready + digits + response + feedback + ITI).
 */
function createSingleTrial(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  mode: "forward" | "backward",
  spanLength: number,
  phase: "practice" | "test",
  trialNumber: number
): any[] {
  const digits = generateDigitSequence(spanLength);

  const timeline: any[] = [
    createReadyTrial(config),
    ...createDigitPresentationTrials(digits, config),
    createResponseTrial(jsPsych, config, mode, digits, phase, trialNumber, spanLength),
  ];

  if (config.showFeedback) {
    timeline.push(createFeedbackTrial(jsPsych, config));
  }

  timeline.push(createItiTrial(config));

  return timeline;
}

/**
 * Creates a practice block with fixed span length.
 */
function createPracticeBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  mode: "forward" | "backward"
) {
  const trials: any[] = [];

  for (let i = 0; i < config.numPracticeTrials; i++) {
    trials.push(
      ...createSingleTrial(jsPsych, config, mode, config.practiceSpan, "practice", i + 1)
    );
  }

  return {
    timeline: trials,
  };
}

/**
 * Creates a test block with staircase adaptive span.
 */
function createTestBlock(
  jsPsych: JsPsych,
  config: ResolvedConfig,
  mode: "forward" | "backward"
) {
  // We need to create trials dynamically based on staircase
  // Using a loop procedure with conditional function

  let currentSpan = config.startingSpan;
  let trialNumber = 0;

  const trialProcedure = {
    timeline: [
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "",
        choices: "NO_KEYS",
        trial_duration: 0,
        on_finish: (data: any) => {
          // Generate digits for this trial
          trialNumber++;
          const digits = generateDigitSequence(currentSpan);
          data.generated_digits = digits;
          data.current_span = currentSpan;
          data.trial_number = trialNumber;
        },
      },
      // Ready signal
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<div class="ready" >${config.text.ready_prompt}</div>`,
        choices: "NO_KEYS",
        trial_duration: config.readyDuration,
        data: {
          task: TASK_NAME,
          part: "ready",
        },
      },
      // Digit presentation - we need to use a nested timeline for this
      {
        timeline: [
          {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: () => {
              // Get the setup trial data
              const setupData = jsPsych.data.get().filter({ trial_number: trialNumber }).values()[0];
              const digitIndex = jsPsych.data
                .get()
                .filter({ task: TASK_NAME, part: "digit_presentation", parent_trial: trialNumber })
                .count();
              const digit = setupData.generated_digits[digitIndex];
              return `<div class="stimulus" >${digit}</div>`;
            },
            choices: "NO_KEYS",
            trial_duration: config.digitDuration,
            data: () => ({
              task: TASK_NAME,
              part: "digit_presentation",
              parent_trial: trialNumber,
            }),
          },
        ],
        loop_function: () => {
          const setupData = jsPsych.data.get().filter({ trial_number: trialNumber }).values()[0];
          const presentedCount = jsPsych.data
            .get()
            .filter({ task: TASK_NAME, part: "digit_presentation", parent_trial: trialNumber })
            .count();
          return presentedCount < setupData.generated_digits.length;
        },
      },
      // Response collection
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => createResponseHtml("", config.text, mode),
        choices: [],
        trial_duration: null,
        css_classes: ["response-interface"],
        data: () => {
          const setupData = jsPsych.data.get().filter({ trial_number: trialNumber }).values()[0];
          const digits = setupData.generated_digits;
          const correctDigits = mode === "forward" ? digits : [...digits].reverse();
          const correctResponse = correctDigits.join("");

          return {
            task: TASK_NAME,
            task_version: VERSION,
            phase: "test",
            mode: mode,
            trial: trialNumber,
            span_length: currentSpan,
            presented_digits: formatDigitSequence(digits),
            correct_response: correctResponse,
            part: "response",
          };
        },
        on_load: () => {
          let currentResponse = "";
          const display = document.getElementById("digit-span-display");
          const startTime = performance.now();

          // Get correct response for validation
          const setupData = jsPsych.data.get().filter({ trial_number: trialNumber }).values()[0];
          const digits = setupData.generated_digits;
          const correctDigits = mode === "forward" ? digits : [...digits].reverse();
          const correctResponseStr = correctDigits.join("");

          document.querySelectorAll(".digit-button").forEach((button) => {
            button.addEventListener("click", (e) => {
              const digit = (e.target as HTMLElement).getAttribute("data-digit");
              if (digit) {
                currentResponse += digit;
                if (display) display.textContent = currentResponse;
              }
            });
          });

          const clearBtn = document.getElementById("digit-span-clear");
          if (clearBtn) {
            clearBtn.addEventListener("click", () => {
              currentResponse = "";
              if (display) display.innerHTML = "&nbsp;";
            });
          }

          const doneBtn = document.getElementById("digit-span-done");
          if (doneBtn) {
            doneBtn.addEventListener("click", () => {
              const endTime = performance.now();
              const rt = endTime - startTime;

              jsPsych.finishTrial({
                response: currentResponse,
                rt: rt,
                correct: currentResponse === correctResponseStr,
              });
            });
          }
        },
        on_finish: (data: any) => {
          // Update span for next trial based on staircase
          currentSpan = getNextSpanLength(currentSpan, data.correct, config.minSpan, config.maxSpan);
        },
      },
      // Feedback (conditional)
      {
        timeline: [
          {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: () => {
              const lastTrial = jsPsych.data.get().last(1).values()[0];
              let feedbackText: string;
              let feedbackClass: string;

              if (lastTrial.correct) {
                feedbackText = config.text.correct_feedback;
                feedbackClass = "feedback correct";
              } else {
                feedbackText = config.text.incorrect_feedback(lastTrial.correct_response);
                feedbackClass = "feedback incorrect";
              }

              return `<div class="${feedbackClass}" >${feedbackText}</div>`;
            },
            choices: "NO_KEYS",
            trial_duration: config.feedbackDuration,
            data: {
              task: TASK_NAME,
              part: "feedback",
            },
          },
        ],
        conditional_function: () => config.showFeedback,
      },
      // ITI
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "",
        choices: "NO_KEYS",
        trial_duration: config.interTrialInterval,
        data: {
          task: TASK_NAME,
          part: "iti",
        },
      },
    ],
    loop_function: () => {
      return trialNumber < config.numTestTrials;
    },
  };

  return trialProcedure;
}

// -- SCORING FUNCTIONS --

/**
 * Calculates scoring metrics for a single mode.
 */
function calculateModeScores(data: DataCollection, mode: "forward" | "backward"): ScoringResult {
  const testTrials = data
    .filter({ task: TASK_NAME, phase: "test", mode: mode, part: "response" })
    .values() as TrialData[];

  if (testTrials.length === 0) {
    return {
      maxSpan: 0,
      totalCorrect: 0,
      meanSpan: null,
      totalTrials: 0,
    };
  }

  const correctTrials = testTrials.filter((t) => t.correct);
  const maxSpan = correctTrials.length > 0 ? Math.max(...correctTrials.map((t) => t.span_length)) : 0;
  const totalCorrect = correctTrials.length;
  const meanSpan = mean(correctTrials.map((t) => t.span_length));

  return {
    maxSpan,
    totalCorrect,
    meanSpan,
    totalTrials: testTrials.length,
  };
}

/**
 * Calculates full scoring metrics for both modes.
 */
function calculateScores(data: DataCollection): FullScoringResult {
  const forwardScores = calculateModeScores(data, "forward");
  const backwardScores = calculateModeScores(data, "backward");

  return {
    forwardMaxSpan: forwardScores.totalTrials > 0 ? forwardScores.maxSpan : null,
    backwardMaxSpan: backwardScores.totalTrials > 0 ? backwardScores.maxSpan : null,
    forwardTotalCorrect: forwardScores.totalCorrect,
    backwardTotalCorrect: backwardScores.totalCorrect,
    forwardMeanSpan: forwardScores.meanSpan,
    backwardMeanSpan: backwardScores.meanSpan,
    forwardTrials: forwardScores.totalTrials,
    backwardTrials: backwardScores.totalTrials,
  };
}

/**
 * Returns a summary of the digit span task performance.
 */
function getSummary(
  data: DataCollection
): FullScoringResult & { taskName: string; version: string } {
  const scores = calculateScores(data);
  return {
    ...scores,
    taskName: TASK_NAME,
    version: VERSION,
  };
}

// -- MAIN EXPORT --

/**
 * Creates the complete Digit Span Task timeline.
 *
 * @param jsPsych - The jsPsych instance
 * @param options - Configuration options for the task
 * @returns A jsPsych timeline object
 *
 * @example
 * ```typescript
 * const jsPsych = initJsPsych();
 * const digitSpanTimeline = createTimeline(jsPsych, {
 *   mode: "both",
 *   numTestTrials: 14,
 * });
 * jsPsych.run([digitSpanTimeline]);
 * ```
 */
export function createTimeline(jsPsych: JsPsych, options: DigitSpanOptions = {}) {
  // Merge text with defaults
  const text: TextConfig = { ...defaultText, ...options.text };

  const config: ResolvedConfig = {
    ...DEFAULT_OPTIONS,
    ...options,
    text,
  };

  const timeline: any[] = [];

  // Determine which modes to run
  const runForward = config.mode === "forward" || config.mode === "both";
  const runBackward = config.mode === "backward" || config.mode === "both";

  // Forward mode
  if (runForward) {
    // Interactive Instructions
    if (config.showInstructions) {
      timeline.push(createInteractiveInstructions(jsPsych, config, "forward"));
    }

    // Practice
    if (config.numPracticeTrials > 0) {
      timeline.push(createPracticeBlock(jsPsych, config, "forward"));
      timeline.push(
        createTransitionTrial(config.text.practice_complete_forward, config.text.continue_button)
      );
    }

    // Test
    timeline.push(createTestBlock(jsPsych, config, "forward"));

    // Transition to backward if both modes
    if (runBackward) {
      timeline.push(
        createTransitionTrial(config.text.forward_complete, config.text.continue_button)
      );
    }
  }

  // Backward mode
  if (runBackward) {
    // Interactive Instructions
    if (config.showInstructions) {
      timeline.push(createInteractiveInstructions(jsPsych, config, "backward"));
    }

    // Practice
    if (config.numPracticeTrials > 0) {
      timeline.push(createPracticeBlock(jsPsych, config, "backward"));
      timeline.push(
        createTransitionTrial(config.text.practice_complete_backward, config.text.continue_button)
      );
    }

    // Test
    timeline.push(createTestBlock(jsPsych, config, "backward"));
  }

  // Completion
  timeline.push(createCompletionTrial(jsPsych, config));

  return { timeline };
}

/**
 * Creates the completion trial with result summary.
 */
function createCompletionTrial(jsPsych: JsPsych, config: ResolvedConfig) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const data = jsPsych.data.get();
      const scores = calculateScores(data);
      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += `<h2>${config.text.task_complete}</h2>`;
      html += config.text.result_summary(scores.forwardMaxSpan, scores.backwardMaxSpan, scores.forwardTotalCorrect + scores.backwardTotalCorrect);
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
 * Timeline units that can be used to create custom digit span experiments.
 */
export const timelineUnits = {
  createInteractiveInstructions,
  createInstructionTrials,
  createReadyTrial,
  createDigitPresentationTrials,
  createResponseTrial,
  createFeedbackTrial,
  createItiTrial,
  createTransitionTrial,
  createSingleTrial,
  createPracticeBlock,
  createTestBlock,
  createCompletionTrial,
};

/**
 * Utility functions for the digit span task.
 */
export const utils = {
  scoring: {
    calculateModeScores,
    calculateScores,
    getSummary,
  },
  digits: {
    generateDigitSequence,
    formatDigitSequence,
    getNextSpanLength,
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
