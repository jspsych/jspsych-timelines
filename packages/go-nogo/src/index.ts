import { JsPsych } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, octagon, circle, square } from "./text";

/**
 * Configuration options for the Go/No-Go timeline and helpers.
 * Defaults shown reflect the values used in createTimeline unless overridden.
 *
 * @property {boolean} [show_instructions=false] Whether to include the instructions pages at the start.
 * @property {boolean} [show_practice=false] Whether to include the interactive practice section.
 * @property {number}  [num_blocks=3] Number of experimental blocks.
 * @property {number}  [num_trials=50] Trials per block.
 * @property {number}  [trial_timeout=500] Total trial duration in milliseconds (time to respond).
 * @property {number}  [stimulus_duration=null] Duration to display the stimulus in milliseconds. Set to null to show until response or trial_timeout.
 * @property {number}  [fixation_duration=500] Duration to display the fixation cross in milliseconds.
 * @property {number}  [isi_duration=0] Inter-stimulus interval (blank screen after stimulus) in milliseconds.
 * @property {number}  [probability=0.75] Probability of a Go trial in each block (0..1).
 * @property {boolean} [show_debrief=false] Whether to append the debrief summary at the end.
 * @property {boolean} [show_button_during_fixation=true] Whether to show the GO button (disabled) during fixation trials.
 * @property {number}  [button_opacity_during_fixation=1.0] Opacity of the button during fixation and ISI (0.0 to 1.0).
 * @property {number|null} [block_break_duration=null] Duration of block breaks in milliseconds. If null, shows a continue button. If a number, shows a countdown timer.
 * @property {string}  [stimulus_container_height="25vh"] Height for stimulus container (e.g., "25vh", "200px"). Prevents button movement between fixation and stimulus.
 * @property {string}  [fixation_size="3em"] Font size for fixation cross (e.g., "3em", "48px", "5rem").
 *
 * Go/NoGo Stimulus configuration
 * @property {string}   [go_stimulus=circle] Single Go stimulus (used when go_stimuli is not provided).
 * @property {string}   [nogo_stimulus=octagon] Single No-Go stimulus (used when nogo_stimuli is not provided).
 * @property {string[]} [go_stimuli] Optional list of Go stimuli to rotate through.
 * @property {string[]} [nogo_stimuli] Optional list of No-Go stimuli to rotate through.
 * @property {number}   [go_practice_timeout=10000] Duration of Go practice trial.
 * @property {number}   [nogo_practice_timeout=3000] Duration of No-Go practice trial.
 *
 * Texts
 * @property {typeof trial_text}   [text_object=trial_text] Text/config object with UI strings.
 */
interface GoNoGoConfig {
  //general configuration
  show_instructions?: boolean;
  show_practice?: boolean;
  num_blocks?: number;
  num_trials?: number;
  trial_timeout?: number;
  stimulus_duration?: number | null;
  fixation_duration?: number;
  isi_duration?: number;
  probability?: number;
  show_debrief?: boolean;
  show_button_during_fixation?: boolean;
  button_opacity_during_fixation?: number;
  block_break_duration?: number | null;
  stimulus_container_height?: string;
  fixation_size?: string;
  //stimuli configuration
  go_stimulus?: string;
  nogo_stimulus?: string;
  go_stimuli?: string[];
  nogo_stimuli?: string[];
  go_practice_timeout?: number;
  nogo_practice_timeout?: number;
  //texts
  text_object?: typeof trial_text;
}

/**
 * Creates a set of instructions for the Go/No-Go Task.
 *
 * @param {string[]} instructions - Array of instruction pages to display.
 * @param {object} texts - Text configuration object containing messages and labels.
 * @returns {object} jsPsychInstructions trial object.
 */
export function createInstructions(instructions: string[], texts?) {
  return {
    type: jsPsychInstructions,
    pages: instructions.map((page) => `<div class="timeline-instructions"><p>${page}</p></div>`),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: "ArrowRight",
    key_backward: "ArrowLeft",
    button_label_previous: texts?.backButton || "",
    button_label_next: texts?.nextButton || "",
    data: { task: "go-nogo", phase: "instructions" },
    css_classes: ["jspsych-go-nogo-container"]
  };
}

/**
 * Wrap stimulus content in a standardized container for Go/No-Go trials.
 *
 * @param html The stimulus HTML or text (already formatted).
 * @param isGoTrial Whether this stimulus represents a Go (true) or No-Go (false) trial.
 * @param containerHeight Optional height for the container to prevent layout shifts.
 * @returns HTML string for inclusion in a jsPsych stimulus field.
 */
const createStimulusHTML = (html: string, isGoTrial: boolean, containerHeight?: string): string => {
  const id = isGoTrial ? "go-stimulus" : "nogo-stimulus";
  const heightStyle = containerHeight ? `height: ${containerHeight};` : '';
  return `<div id="${id}-container" class="go-nogo-container timeline-trial" style="font-size: 3em; ${heightStyle} display: flex; align-items: center; justify-content: center;">${html}</div>`;
};

/**
 * Creates a Go instruction trial with practice and infinite retry logic.
 *
 * This function creates a dynamic timeline that teaches users how to respond to "go" stimuli.
 * Users must click the button within 10 seconds to proceed. If they fail to click in time,
 * they receive failure feedback and the trial repeats until they succeed.
 *
 * @param go_stimulus - The stimulus content to display (can be text or HTML)
 * @param texts - Text configuration object containing all messages and labels
 *
 * @returns A timeline object containing:
 *   - Practice task with 10-second timeout
 *   - Success feedback (if clicked in time)
 *   - Failure feedback + retry loop (if timeout occurs)
 */
const createGoPractice = (go_stimulus: string, texts = trial_text, timeout: number = 10000) => {
  const go_html = createStimulusHTML(go_stimulus, true);

  // Create a timeline to hold the practice trials
  // This will allow us to conditionally push trials for retry logic
  const practiceGoTimeline = [];

  const practiceTask = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.goPageContent}</p>
      ${go_html}
      <p class="go-nogo-feedback" style="visibility: hidden;">${texts.goSuccess}</p>
    `,
    choices: [texts.stimulusButton],
    trial_duration: timeout, // default 10 seconds
    data: { task: "go-nogo", phase: "practice", page: "go-practice" },
    button_html: (choice, choice_index) =>
      `<button id="go-nogo-btn" class="jspsych-btn timeline-html-btn">${choice}</button>`,
    on_finish: (data: any) => {
      if (data.response !== null) {
        // They clicked - show success feedback
        data.correct = true; // They clicked on go trial
        practiceGoTimeline.push(successFeedback);
      } else {
        // They failed to click in time - show failure feedback then retry
        data.correct = false; // They did not click on go trial
        practiceGoTimeline.push(failureFeedback);
        practiceGoTimeline.push(practiceTask); // infinite retying until they succeed in clicking.
      }
    },
    css_classes: ["jspsych-go-nogo-container"]
  };

  const successFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.goPageContent}</p>
      ${go_html}
      <p class="go-nogo-feedback" style="color: #28a745;">${texts.goSuccess}</p>
    `,
    choices: [texts.stimulusButton],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: "go-nogo", phase: "practice", page: "success" },
    //disabled button to signify click
    button_html: (choice) =>
      `<button id="go-nogo-btn" class="jspsych-btn timeline-html-btn" style="opacity: 0.5;" disabled>${choice}</button>`,
    css_classes: ["jspsych-go-nogo-container"]
  };

  const failureFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.goPageContent}</p>
      ${go_html}
      <p class="go-nogo-feedback" style="color: #dc3545;">${texts.goFailure}</p>
    `,
    choices: [texts.stimulusButton],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: "go-nogo", phase: "practice", page: "failure" },
    //disabled button to signify click
    button_html: (choice) =>
      `<button id="go-nogo-btn" class="jspsych-btn timeline-html-btn" style="opacity: 0.5;" disabled>${choice}</button>`,
    css_classes: ["jspsych-go-nogo-container"]
  };

  practiceGoTimeline.push(practiceTask);
  return { timeline: practiceGoTimeline };
};

/**
 * Creates a No-Go instruction trial with practice and infinite retry logic.
 *
 * This function creates a dynamic timeline that teaches users how to respond to "no-go" stimuli.
 * Users must resist clicking the button for 3 seconds to proceed. If they click the button,
 * they receive failure feedback and the trial repeats until they succeed.
 *
 * @param nogo_stimulus - The stimulus content to display (can be text or HTML)
 * @param texts - Text configuration object containing all messages and labels
 *
 * @returns A timeline object containing:
 *   - Practice task with 3-second duration and button available
 *   - Success feedback (if they resist clicking)
 *   - Failure feedback + retry loop (if they click)
 */
const createNoGoPractice = (nogo_stimulus: string, texts = trial_text, timeout: number = 3000) => {
  const nogo_html = createStimulusHTML(nogo_stimulus, false);

  // Create a timeline to hold the practice trials
  // This will allow us to conditionally push trials to show feedback later
  const practiceNoGoTimeline = [];

  const practiceTask = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.noGoPageContent}</p>
      ${nogo_html}
      <p class="go-nogo-feedback" style="visibility: hidden;">${texts.noGoSuccess}</p>
    `,
    choices: [texts.stimulusButton],
    trial_duration: timeout,
    data: { task: "go-nogo", phase: "practice", page: "nogo-practice" },
    button_html: (choice, choice_index) =>
      `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
    on_finish: (data: any) => {
      if (data.response === null) {
        // They correctly didn't click - show success feedback
        data.correct = true; // They didn't click on no go trial
        practiceNoGoTimeline.push(correctFeedback);
      } else {
        // They failed by clicking - show failure feedback then retry
        data.correct = false; // They clicked on no go trial
        practiceNoGoTimeline.push(incorrectFeedback);
        practiceNoGoTimeline.push(practiceTask); // infinite retrying until they succeed by not clicking
      }
    },
    css_classes: ["jspsych-go-nogo-container"]
  };

  const correctFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.noGoPageContent}</p>
      ${nogo_html}
      <p class="go-nogo-feedback" style="color: #28a745;">${texts.noGoSuccess}</p>
    `,
    choices: [texts.stimulusButton],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: "go-nogo", phase: "practice", page: "success" },
    //disabled button to signify click
    button_html: (choice) =>
      `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn" style="opacity: 0.5;" disabled>${choice}</button>`,
    css_classes: ["jspsych-go-nogo-container"]
  };

  const incorrectFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <p>${texts.noGoPageContent}</p>
      ${nogo_html}
      <p class="go-nogo-feedback" style="color: #dc3545;">${texts.noGoFailure}</p>
    `,
    choices: [texts.stimulusButton],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: "go-nogo", phase: "practice", page: "failure" },
    //disabled button to signify click
    button_html: (choice) =>
      `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn" style="opacity: 0.5;" disabled>${choice}</button>`,
    css_classes: ["jspsych-go-nogo-container"]
  };

  practiceNoGoTimeline.push(practiceTask);
  return { timeline: practiceNoGoTimeline };
};

/**
 * Create a small completion screen at the end of practice.
 *
 * @param texts Text configuration to render labels.
 * @returns A jsPsych trial for the practice completion screen.
 */
const createPracticeCompletion = (texts = trial_text) => {
  const completionTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="go-nogo-practice">
          <p>${texts.practiceCompleteContent}</p>
        </div>
    `,
    choices: [texts.beginTaskButton],
    data: { task: "go-nogo", phase: "practice", page: "completion" },
    button_html: (choice, choice_index) =>
      `<button id="go-nogo-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
    css_classes: ["jspsych-go-nogo-container"]
  };

  return { timeline: [completionTrial] };
};

/**
 * Factory for the main Go/No-Go trial (stimulus + response button).
 *
 * @param jsPsych Active jsPsych instance (for timeline variables and data).
 * @param button_text Label for the response button.
 * @param trial_timeout Trial duration in milliseconds.
 * @param stimulus_duration Duration to display the stimulus in milliseconds (null means show until response/timeout).
 * @returns A jsPsych trial definition to be used within a procedure.
 */
const createGoNoGo = (jsPsych: JsPsych, button_text: string, trial_timeout: number, stimulus_duration?: number | null) => {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: jsPsych.timelineVariable("stimulus"),
    choices: [button_text],
    trial_duration: trial_timeout,
    stimulus_duration: stimulus_duration !== undefined ? stimulus_duration : null,
    response_ends_trial: true,
    data: {
      task: "go-nogo",
      phase: "main",
      is_go_trial: jsPsych.timelineVariable("is_go_trial"),
      block_number: jsPsych.timelineVariable("block_number"),
      page: jsPsych.timelineVariable("page"),
    },
    button_html: (choice, choice_index) =>
      `<button id="go-nogo-btn" class="continue-btn timeline-html-btn jspsych-btn">${choice}</button>`,
    on_finish: (data: any) => {
      data.correct =
        (data.is_go_trial && data.response === 0) || (!data.is_go_trial && data.response === null);
    },
    css_classes: ["jspsych-go-nogo-container"]
  };
};

/**
 * Creates a blank ISI screen (inter-stimulus interval after the stimulus).
 *
 * @param isi_duration Duration (ms) to show the blank screen.
 * @param button_text Label for the button.
 * @param show_button Whether to show the button (disabled) during ISI.
 * @param stimulus_height Height to match stimulus container (e.g., "25vh").
 * @param button_opacity Opacity of the button (0.0 to 1.0).
 * @returns A non-responsive jsPsych trial showing a blank screen.
 */
const createISIBlank = (
  isi_duration: number,
  button_text: string,
  show_button: boolean = true,
  stimulus_height?: string,
  button_opacity: number = 1.0,
) => {
  // Create a blank container with matching height to prevent button movement
  const blankHTML = stimulus_height
    ? `<div class="go-nogo-container timeline-trial" style="height: ${stimulus_height}; display: flex; align-items: center; justify-content: center;"></div>`
    : `<div></div>`;

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: blankHTML,
    choices: [button_text],
    trial_duration: isi_duration,
    response_ends_trial: false,
    data: {
      task: "go-nogo",
      phase: "main",
      page: "isi-blank",
    },
    css_classes: ["jspsych-go-nogo-container"],
    button_html: (choice) =>
      `<button id="isi-blank-btn" class="continue-btn timeline-html-btn jspsych-btn is-disabled"
               style="visibility: ${show_button ? 'visible' : 'hidden'}; opacity: ${button_opacity};" disabled>${choice}</button>`,
  };
};

/**
 * Creates a fixation screen.
 *
 * @param fixation_duration Duration (ms) to show the fixation.
 * @param button_text Label for the button.
 * @param show_button Whether to show the button (disabled) during fixation.
 * @param stimulus_height Height of the stimulus to match (e.g., "25vh"). If provided, creates a container with this height.
 * @param fixation_size Font size for the fixation cross (e.g., "3em").
 * @param button_opacity Opacity of the button (0.0 to 1.0).
 * @returns A non-responsive jsPsych trial showing a fixation cross.
 */
const createFixation = (
  fixation_duration: number,
  button_text: string,
  show_button: boolean = true,
  stimulus_height?: string,
  fixation_size: string = "3em",
  button_opacity: number = 1.0,
) => {
  // If stimulus_height is provided, create a container with matching height to prevent button movement
  const fixationHTML = stimulus_height
    ? `<div class="go-nogo-container timeline-trial" style="font-size: ${fixation_size}; height: ${stimulus_height}; display: flex; align-items: center; justify-content: center;"><div class="fixation">+</div></div>`
    : `<div class="fixation" style="font-size: ${fixation_size};">+</div>`;

  return {
    // Use button plugin so we can provide button_html
    type: jsPsychHtmlButtonResponse,
    stimulus: fixationHTML,
    choices: [button_text],
    trial_duration: fixation_duration,
    response_ends_trial: false,
    data: {
      task: "go-nogo",
      phase: "main",
      page: "fixation",
    },
    css_classes: ["jspsych-go-nogo-container"],
    // Button is disabled during fixation; visibility controlled by show_button parameter
    button_html: (choice) =>
      `<button id="go-nogo-btn" class="continue-btn timeline-html-btn jspsych-btn"
               style="visibility: ${show_button ? 'visible' : 'hidden'}; opacity: ${button_opacity};" disabled>${choice}</button>`,
  };
};

/**
 * Generate timeline variables for a single block.
 * Ensures the requested Go/No-Go ratio and rotates through provided stimuli.
 *
 * @param jsPsych Active jsPsych instance (for randomization helper).
 * @param blockNumber 1-based block index.
 * @param num_trials Number of trials to generate for the block.
 * @param probability Probability of a Go trial (0..1).
 * @param actualGoStimuli List of Go stimuli used in rotation order.
 * @param actualNoGoStimuli List of No-Go stimuli used in rotation order.
 * @param containerHeight Optional height for stimulus container.
 * @returns An array of timeline_variables entries consumed by createGoNoGo.
 */
const createTimelineVariables = (
  jsPsych: JsPsych,
  blockNumber: number,
  num_trials: number,
  probability: number,
  actualGoStimuli: string[],
  actualNoGoStimuli: string[],
  containerHeight?: string,
) => {
  const trials: any[] = [];

  // Calculate exact counts
  const numGoTrials = Math.round(num_trials * probability);
  const numNoGoTrials = num_trials - numGoTrials;

  // Validate inputs
  if (numGoTrials < 0 || numNoGoTrials < 0) {
    throw new Error(
      `Invalid trial configuration: probability (${probability}) results in ${numGoTrials} go trials and ${numNoGoTrials} no-go trials for ${num_trials} total trials. Both must be non-negative.`,
    );
  }

  // Create fixed array of trial types
  const trialTypes = Array(numGoTrials).fill(true).concat(Array(numNoGoTrials).fill(false));
  // Shuffle trial types
  jsPsych.randomization.shuffle(trialTypes);

  let goTrialCount = 0;
  let noGoTrialCount = 0;

  for (let i = 0; i < trialTypes.length; i++) {
    const isGoTrial = trialTypes[i];
    let stimulus: string;
    if (isGoTrial) {
      const stimulusIndex = goTrialCount % actualGoStimuli.length;
      stimulus = actualGoStimuli[stimulusIndex];
      goTrialCount++;
    } else {
      const stimulusIndex = noGoTrialCount % actualNoGoStimuli.length;
      stimulus = actualNoGoStimuli[stimulusIndex];
      noGoTrialCount++;
    }

    trials.push({
      stimulus: createStimulusHTML(stimulus, isGoTrial, containerHeight),
      is_go_trial: isGoTrial,
      task: "go-nogo",
      phase: "main",
      page: isGoTrial ? "go" : "nogo",
      block_number: blockNumber,
    });
  }
  return trials;
};

/**
 * Insert a short break screen between blocks.
 *
 * @param blockNum 1-based index of the block that just finished.
 * @param num_blocks Total number of blocks.
 * @param duration Duration in milliseconds. If null, shows a button. If a number, shows a countdown timer.
 * @param text_object Text configuration object containing messages and labels.
 * @returns A jsPsychHtmlButtonResponse screen prompting to continue or showing a countdown.
 */
const createBlockBreak = (blockNum: number, num_blocks: number, duration: number | null = null, text_object = trial_text) => {
  if (duration === null) {
    // Button mode
    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>${text_object.blockBreakContent(blockNum, num_blocks)}</p>`,
      choices: [text_object.continueButton],
      data: { task: "go-nogo", phase: "main", page: "block-break", block_number: blockNum },
      button_html: (choice) =>
        `<button id="block-break-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
      css_classes: ["jspsych-go-nogo-container"]
    };
  } else {
    // Timer mode
    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>${text_object.blockBreakContent(blockNum, num_blocks)}</p><p id="timer-display"></p>`,
      choices: [],
      trial_duration: duration,
      data: { task: "go-nogo", phase: "main", page: "block-break", block_number: blockNum },
      on_load: () => {
        const timerDisplay = document.getElementById('timer-display');
        let timeRemaining = duration;

        const updateTimer = () => {
          const seconds = Math.ceil(timeRemaining / 1000);
          if (timerDisplay) {
            timerDisplay.textContent = text_object.blockBreakTimerText(seconds);
          }
        };

        updateTimer();

        const intervalId = setInterval(() => {
          timeRemaining -= 100;
          if (timeRemaining <= 0) {
            clearInterval(intervalId);
          } else {
            updateTimer();
          }
        }, 100);
      },
      css_classes: ["jspsych-go-nogo-container"]
    };
  }
};

/**
 * Create the end-of-experiment debrief screen showing accuracy and mean RT.
 *
 * @param jsPsych Active jsPsych instance from which results are derived.
 * @returns A jsPsych trial object for the debrief.
 */
const createDebrief = (jsPsych: JsPsych, text_object = trial_text) => {
  // Calculate stats when trial starts, not when displayed
  const calculateStats = () => {
    const allTrials = jsPsych.data.get().filter({ task: "go-nogo", phase: "main" }).filter((trial: any) => trial.page === "go" || trial.page === "nogo").values();

    if (allTrials.length === 0) return { accuracy: 0, meanRT: 0 };

    // Calculate accuracy (percentage of correct responses)
    const correctTrials = allTrials.filter((trial: any) => trial.correct === true);
    const accuracy = Math.round((correctTrials.length / allTrials.length) * 100);

    // Calculate mean RT for GO trials where response was made
    const goTrialsWithResponse = allTrials.filter(
      (trial: any) => trial.is_go_trial === true && trial.response !== null && trial.rt > 0,
    );
    const meanRT =
      goTrialsWithResponse.length > 0
        ? Math.round(
            goTrialsWithResponse.reduce((sum: number, trial: any) => sum + trial.rt, 0) /
              goTrialsWithResponse.length,
          )
        : 0;

    return { accuracy, meanRT };
  };

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const { accuracy, meanRT } = calculateStats();

      return text_object.debriefContent(accuracy, meanRT);
    },
    choices: [text_object.finishButton],
    data: { task: "go-nogo", phase: "main", page: "debrief" },
    button_html: (choice, choice_index) =>
      `<button id="debrief-btn" class="continue-btn jspsych-btn timeline-html-btn">${choice}</button>`,
    css_classes: ["jspsych-go-nogo-container"]
  };
};

/**
 * High-level factory that assembles the full Go/No-Go jsPsych timeline.
 *
 * Example:
 * const { timeline } = createTimeline(jsPsych, { num_blocks: 2, probability: 0.8, show_debrief: true })
 * jsPsych.run(timeline)
 *
 * @param jsPsych Active jsPsych instance.
 * @param config Partial configuration overriding defaults; see GoNoGoConfig.
 * @returns An object with a `timeline` array ready for jsPsych.run.
 */
export function createTimeline(
  jsPsych: JsPsych,
  {
    // general
    show_instructions = false,
    show_practice = false,
    num_blocks = 3,
    num_trials = 50,
    trial_timeout = 500,
    stimulus_duration = null,
    fixation_duration = 500,
    isi_duration = 0,
    probability = 0.75,
    show_debrief = false,
    show_button_during_fixation = true,
    button_opacity_during_fixation = 1.0,
    block_break_duration = null,
    stimulus_container_height = "25vh",
    fixation_size = "3em",
    // stimuli
    go_stimulus = circle,
    nogo_stimulus = octagon,
    go_stimuli,
    nogo_stimuli,
    go_practice_timeout = 10000,
    nogo_practice_timeout = 3000,
    // texts
    text_object = trial_text,
  }: GoNoGoConfig = {},
) {
  text_object = { ...trial_text, ...(text_object ?? {}) }; // Merge default texts with any overrides from config
  const timeline = [];

  if (show_instructions) {
    timeline.push(createInstructions(text_object.instructions_pages, text_object));
  }

  if (show_practice) {
    const practiceTrials = createPractice({
      go_stimulus,
      nogo_stimulus,
      go_stimuli,
      nogo_stimuli,
      text_object: text_object,
      go_practice_timeout,
      nogo_practice_timeout,
    });
    timeline.push(practiceTrials);
  }
  // check for array stimuli then fallback on go_stimulus
  const actualGoStimuli = go_stimuli?.length > 0 ? go_stimuli : [go_stimulus];
  const actualNoGoStimuli = nogo_stimuli?.length > 0 ? nogo_stimuli : [nogo_stimulus];

  const goNoGoTrial = createGoNoGo(jsPsych, text_object.stimulusButton, trial_timeout, stimulus_duration);
  const fixationTrial = createFixation(
    fixation_duration,
    text_object.stimulusButton,
    show_button_during_fixation,
    stimulus_container_height,
    fixation_size,
    button_opacity_during_fixation
  );
  const isiBlankTrial = createISIBlank(
    isi_duration,
    text_object.stimulusButton,
    show_button_during_fixation,
    stimulus_container_height,
    button_opacity_during_fixation
  );

  // Generate blocks
  const blocks = [];
  for (let blockNum = 1; blockNum <= num_blocks; blockNum++) {
    const blockTrials = createTimelineVariables(
      jsPsych,
      blockNum,
      num_trials,
      probability,
      actualGoStimuli,
      actualNoGoStimuli,
      stimulus_container_height,
    );

    // Add block trials: fixation → stimulus → ISI blank
    const blockProcedure = {
      timeline: [fixationTrial, goNoGoTrial, isiBlankTrial],
      timeline_variables: blockTrials,
      randomize_order: true,
    };
    blocks.push(blockProcedure);

    // Add block break page between blocks (except after last block)
    if (blockNum < num_blocks) {
      const blockBreakTrial = createBlockBreak(blockNum, num_blocks, block_break_duration, text_object);
      blocks.push(blockBreakTrial);
    }
  }

  timeline.push([...blocks]);

  if (show_debrief) {
    const debriefTrial = createDebrief(jsPsych, text_object);
    timeline.push(debriefTrial);
  }

  return {
    timeline,
  };
}

/**
 * Create the practice section (Go, No-Go, then a short completion screen).
 *
 * @param config Partial configuration to select sample stimuli and texts.
 * @returns An array of practice timeline segments to be inserted into the main timeline.
 */
function createPractice({
  go_stimulus,
  nogo_stimulus,
  go_stimuli,
  nogo_stimuli,
  text_object = trial_text,
  go_practice_timeout = 10000,
  nogo_practice_timeout = 3000,
}: GoNoGoConfig = {}) {
  //check for array stimuli then fallback on go_stimulus
  const actualGoStimuli = go_stimuli?.length > 0 ? go_stimuli : [go_stimulus];
  const actualNoGoStimuli = nogo_stimuli?.length > 0 ? nogo_stimuli : [nogo_stimulus];

  return [
    createGoPractice(actualGoStimuli[0], text_object, go_practice_timeout),
    createNoGoPractice(actualNoGoStimuli[0], text_object, nogo_practice_timeout),
    createPracticeCompletion(text_object),
  ];
}

/**
 * Namespaced access to building blocks for advanced composition and testing.
 */
export const timelineUnits = {
  createInstructions,
  createPractice,
  createDebrief,
  createGoPractice,
  createNoGoPractice,
  createPracticeCompletion,
  createGoNoGo,
  createFixation,
  createISIBlank,
  createBlockBreak,
};

/**
 * Namespaced access to utility functions for advanced usage and testing.
 */
export const utils = {
  createStimulusHTML,
  trial_text,
  createTimelineVariables,
};
