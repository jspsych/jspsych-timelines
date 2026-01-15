import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, defaultText, TextConfig, octagon, circle, square } from "./text";

// -- CONSTANTS --
const TASK_NAME = "go-nogo";
const VERSION = "0.5.0";

/**
 * Configuration options for the Go/No-Go timeline and helpers.
 * Defaults shown reflect the values used in createTimeline unless overridden.
 *
 * @property {boolean} [show_instructions=false] Whether to include interactive instructions (go/no-go examples with feedback).
 * @property {boolean} [show_practice=false] Whether to include a practice block matching the main task format.
 * @property {number}  [num_practice_trials=10] Number of trials in the practice block.
 * @property {number}  [practice_probability=0.75] Probability of a Go trial in the practice block (0..1).
 * @property {number}  [num_blocks=3] Number of experimental blocks.
 * @property {number}  [num_trials=50] Trials per block.
 * @property {number}  [trial_timeout=500] Total trial duration in milliseconds (time to respond).
 * @property {number}  [stimulus_duration=null] Duration to display the stimulus in milliseconds. Set to null to show until response or trial_timeout.
 * @property {number}  [fixation_duration=500] Duration to display the fixation cross in milliseconds.
 * @property {number}  [isi_duration=0] Inter-stimulus interval (blank screen after stimulus) in milliseconds.
 * @property {number}  [probability=0.75] Probability of a Go trial in each main block (0..1).
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
 * @property {typeof trial_text}   [text=trial_text] Text/config object with UI strings.
 */
interface GoNoGoConfig {
  //general configuration
  show_instructions?: boolean;
  show_practice?: boolean;
  num_practice_trials?: number;
  practice_probability?: number;
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
  text?: Partial<TextConfig>;
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
    pages: instructions.map((page) => `<div class="instructions" ><p>${page}</p></div>`),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: "ArrowRight",
    key_backward: "ArrowLeft",
    button_label_previous: texts?.backButton || "",
    button_label_next: texts?.nextButton || "",
    data: { task: TASK_NAME, phase: "instructions" },
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
  const heightStyle = containerHeight ? `min-height: ${containerHeight};` : '';
  return `<div id="${id}-container" class="stimulus"  style="${heightStyle}">${html}</div>`;
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
      <div >
        <p>${texts.goPageContent}</p>
        ${go_html}
        <p class="feedback" style="visibility: hidden;">${texts.goSuccess}</p>
      </div>
    `,
    choices: [texts.stimulusButton],
    trial_duration: timeout, // default 10 seconds
    data: { task: TASK_NAME, phase: "instructions", page: "go-practice" },
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
  };

  const successFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div >
        <p>${texts.goPageContent}</p>
        ${go_html}
        <p class="feedback correct">${texts.goSuccess}</p>
      </div>
    `,
    choices: [texts.stimulusButton],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: TASK_NAME, phase: "instructions", page: "success" },
  };

  const failureFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div >
        <p>${texts.goPageContent}</p>
        ${go_html}
        <p class="feedback incorrect">${texts.goFailure}</p>
      </div>
    `,
    choices: [texts.stimulusButton],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: TASK_NAME, phase: "instructions", page: "failure" },
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
      <div >
        <p>${texts.noGoPageContent}</p>
        ${nogo_html}
        <p class="feedback" style="visibility: hidden;">${texts.noGoSuccess}</p>
      </div>
    `,
    choices: [texts.stimulusButton],
    trial_duration: timeout,
    data: { task: TASK_NAME, phase: "instructions", page: "nogo-practice" },
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
  };

  const correctFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div >
        <p>${texts.noGoPageContent}</p>
        ${nogo_html}
        <p class="feedback correct">${texts.noGoSuccess}</p>
      </div>
    `,
    choices: [texts.stimulusButton],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: TASK_NAME, phase: "instructions", page: "success" },
  };

  const incorrectFeedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div >
        <p>${texts.noGoPageContent}</p>
        ${nogo_html}
        <p class="feedback incorrect">${texts.noGoFailure}</p>
      </div>
    `,
    choices: [texts.stimulusButton],
    trial_duration: 2000,
    response_ends_trial: false,
    data: { task: TASK_NAME, phase: "instructions", page: "failure" },
  };

  practiceNoGoTimeline.push(practiceTask);
  return { timeline: practiceNoGoTimeline };
};

/**
 * Create a small completion screen at the end of interactive instructions.
 *
 * @param texts Text configuration to render labels.
 * @returns A jsPsych trial for the practice completion screen.
 */
const createPracticeCompletion = (texts = trial_text) => {
  const completionTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="transition" >
          <p>${texts.practiceCompleteContent}</p>
        </div>
    `,
    choices: [texts.beginTaskButton],
    data: { task: TASK_NAME, phase: "instructions", page: "completion" },
  };

  return { timeline: [completionTrial] };
};

/**
 * Create an end of practice block screen.
 *
 * @param texts Text configuration to render labels.
 * @returns A jsPsych trial for the end of practice screen.
 */
const createEndOfPractice = (texts = trial_text) => {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="transition" ><p>${texts.endOfPracticeContent}</p></div>`,
    choices: [texts.endOfPracticeButton],
    data: { task: TASK_NAME, page: "end-of-practice" },
  };
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
      task: TASK_NAME,
      task_version: VERSION,
      is_go_trial: jsPsych.timelineVariable("is_go_trial"),
      block_number: jsPsych.timelineVariable("block_number"),
      page: jsPsych.timelineVariable("page"),
    },
    on_finish: (data: any) => {
      data.correct =
        (data.is_go_trial && data.response === 0) || (!data.is_go_trial && data.response === null);
    },
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
  const heightStyle = stimulus_height ? `min-height: ${stimulus_height};` : '';
  const blankHTML = `<div class="isi-blank"  style="${heightStyle}"></div>`;

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: blankHTML,
    choices: show_button ? [button_text] : [],
    trial_duration: isi_duration,
    response_ends_trial: false,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      page: "isi-blank",
    },
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
  const heightStyle = stimulus_height ? `min-height: ${stimulus_height};` : '';
  const fixationHTML = `<div class="fixation"  style="font-size: ${fixation_size}; ${heightStyle}">+</div>`;

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: fixationHTML,
    choices: show_button ? [button_text] : [],
    trial_duration: fixation_duration,
    response_ends_trial: false,
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      page: "fixation",
    },
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
      task: TASK_NAME,
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
const createBlockBreak = (blockNum: number, num_blocks: number, duration: number | null = null, texts = trial_text) => {
  if (duration === null) {
    // Button mode
    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<div class="block-break" ><p>${texts.blockBreakContent(blockNum, num_blocks)}</p></div>`,
      choices: [texts.continueButton],
      data: { task: TASK_NAME, task_version: VERSION, page: "block-break", block_number: blockNum },
    };
  } else {
    // Timer mode
    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<div class="block-break" ><p>${texts.blockBreakContent(blockNum, num_blocks)}</p><p id="timer-display"></p></div>`,
      choices: [],
      trial_duration: duration,
      data: { task: TASK_NAME, task_version: VERSION, page: "block-break", block_number: blockNum },
      on_load: () => {
        const timerDisplay = document.getElementById('timer-display');
        let timeRemaining = duration;

        const updateTimer = () => {
          const seconds = Math.ceil(timeRemaining / 1000);
          if (timerDisplay) {
            timerDisplay.textContent = texts.blockBreakTimerText(seconds);
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
    };
  }
};

/**
 * Create the end-of-experiment debrief screen showing accuracy and mean RT.
 *
 * @param jsPsych Active jsPsych instance from which results are derived.
 * @returns A jsPsych trial object for the debrief.
 */
const createDebrief = (jsPsych: JsPsych, texts = trial_text) => {
  // Calculate stats when trial starts, not when displayed
  const calculateStats = () => {
    const allTrials = jsPsych.data.get().filter({ task: TASK_NAME, phase: "main" }).filter((trial: any) => trial.page === "go" || trial.page === "nogo").values();

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

      return `<div class="debrief" >${texts.debriefContent(accuracy, meanRT)}</div>`;
    },
    choices: [texts.finishButton],
    data: { task: TASK_NAME, task_version: VERSION, phase: "debrief" },
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
    num_practice_trials = 10,
    practice_probability = 0.75,
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
    text = {},
  }: GoNoGoConfig = {},
) {
  const mergedText = { ...trial_text, ...text }; // Merge default texts with any overrides from config
  const timeline = [];

  // Interactive instructions (go/no-go examples with feedback)
  if (show_instructions) {
    const instructionTrials = createPractice({
      go_stimulus,
      nogo_stimulus,
      go_stimuli,
      nogo_stimuli,
      texts: mergedText,
      go_practice_timeout,
      nogo_practice_timeout,
    });
    timeline.push(instructionTrials);
  }
  // check for array stimuli then fallback on go_stimulus
  const actualGoStimuli = go_stimuli?.length > 0 ? go_stimuli : [go_stimulus];
  const actualNoGoStimuli = nogo_stimuli?.length > 0 ? nogo_stimuli : [nogo_stimulus];

  const goNoGoTrial = createGoNoGo(jsPsych, mergedText.stimulusButton, trial_timeout, stimulus_duration);
  const fixationTrial = createFixation(
    fixation_duration,
    mergedText.stimulusButton,
    show_button_during_fixation,
    stimulus_container_height,
    fixation_size,
    button_opacity_during_fixation
  );
  const isiBlankTrial = createISIBlank(
    isi_duration,
    mergedText.stimulusButton,
    show_button_during_fixation,
    stimulus_container_height,
    button_opacity_during_fixation
  );

  // Practice block (matches main task format)
  if (show_practice) {
    const practiceTrials = createTimelineVariables(
      jsPsych,
      0, // block 0 for practice
      num_practice_trials,
      practice_probability,
      actualGoStimuli,
      actualNoGoStimuli,
      stimulus_container_height,
    );

    const practiceProcedure = {
      timeline: [fixationTrial, goNoGoTrial, isiBlankTrial],
      timeline_variables: practiceTrials,
      randomize_order: true,
      data: {
        phase: "practice"
      }
    };
    timeline.push(practiceProcedure);

    // End of practice screen
    const endOfPracticeTrial = createEndOfPractice(mergedText);
    timeline.push({
      timeline: [endOfPracticeTrial],
      data: { phase: "practice" }
    });
  }

  // Generate main blocks
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
      data: {
        phase: "main"
      }
    };
    blocks.push(blockProcedure);

    // Add block break page between blocks (except after last block)
    if (blockNum < num_blocks) {
      const blockBreakTrial = createBlockBreak(blockNum, num_blocks, block_break_duration, mergedText);
      blocks.push({
        timeline: [blockBreakTrial],
        data: { phase: "main" }
      });
    }
  }

  timeline.push([...blocks]);

  if (show_debrief) {
    const debriefTrial = createDebrief(jsPsych, mergedText);
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
  texts = trial_text,
  go_practice_timeout = 10000,
  nogo_practice_timeout = 3000,
}: {
  go_stimulus?: string;
  nogo_stimulus?: string;
  go_stimuli?: string[];
  nogo_stimuli?: string[];
  texts?: TextConfig;
  go_practice_timeout?: number;
  nogo_practice_timeout?: number;
} = {}) {
  //check for array stimuli then fallback on go_stimulus
  const actualGoStimuli = go_stimuli?.length > 0 ? go_stimuli : [go_stimulus];
  const actualNoGoStimuli = nogo_stimuli?.length > 0 ? nogo_stimuli : [nogo_stimulus];

  return [
    createGoPractice(actualGoStimuli[0], texts, go_practice_timeout),
    createNoGoPractice(actualNoGoStimuli[0], texts, nogo_practice_timeout),
    createPracticeCompletion(texts),
  ];
}

// -- SCORING FUNCTIONS --

interface ScoringResult {
  goAccuracy: number;
  nogoAccuracy: number;
  overallAccuracy: number;
  meanGoRT: number;
  totalTrials: number;
  goTrials: number;
  nogoTrials: number;
  correctGoTrials: number;
  correctNogoTrials: number;
  commissionErrors: number;  // False alarms (clicked on no-go)
  omissionErrors: number;    // Misses (didn't click on go)
}

/**
 * Calculate scoring metrics from Go/No-Go data
 */
function calculateScores(data: DataCollection): ScoringResult {
  const mainTrials = data
    .filter({ task: TASK_NAME, phase: "main" })
    .filter((trial: any) => trial.page === "go" || trial.page === "nogo")
    .values() as any[];

  if (mainTrials.length === 0) {
    return {
      goAccuracy: 0,
      nogoAccuracy: 0,
      overallAccuracy: 0,
      meanGoRT: 0,
      totalTrials: 0,
      goTrials: 0,
      nogoTrials: 0,
      correctGoTrials: 0,
      correctNogoTrials: 0,
      commissionErrors: 0,
      omissionErrors: 0,
    };
  }

  const goTrials = mainTrials.filter((t) => t.is_go_trial === true);
  const nogoTrials = mainTrials.filter((t) => t.is_go_trial === false);

  const correctGoTrials = goTrials.filter((t) => t.correct === true);
  const correctNogoTrials = nogoTrials.filter((t) => t.correct === true);

  // Commission errors: clicked when shouldn't (false alarms on no-go trials)
  const commissionErrors = nogoTrials.filter((t) => t.correct === false).length;

  // Omission errors: didn't click when should (misses on go trials)
  const omissionErrors = goTrials.filter((t) => t.correct === false).length;

  const goAccuracy = goTrials.length > 0 ? correctGoTrials.length / goTrials.length : 0;
  const nogoAccuracy = nogoTrials.length > 0 ? correctNogoTrials.length / nogoTrials.length : 0;
  const overallAccuracy = mainTrials.length > 0
    ? (correctGoTrials.length + correctNogoTrials.length) / mainTrials.length
    : 0;

  // Calculate mean RT for correct go trials
  const goTrialsWithRT = correctGoTrials.filter((t) => t.rt > 0);
  const meanGoRT = goTrialsWithRT.length > 0
    ? goTrialsWithRT.reduce((sum: number, t: any) => sum + t.rt, 0) / goTrialsWithRT.length
    : 0;

  return {
    goAccuracy,
    nogoAccuracy,
    overallAccuracy,
    meanGoRT: Math.round(meanGoRT),
    totalTrials: mainTrials.length,
    goTrials: goTrials.length,
    nogoTrials: nogoTrials.length,
    correctGoTrials: correctGoTrials.length,
    correctNogoTrials: correctNogoTrials.length,
    commissionErrors,
    omissionErrors,
  };
}

/**
 * Get summary of Go/No-Go performance
 */
function getSummary(data: DataCollection): ScoringResult & { taskName: string; version: string } {
  const scores = calculateScores(data);
  return {
    ...scores,
    taskName: TASK_NAME,
    version: VERSION,
  };
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
  createEndOfPractice,
  createGoNoGo,
  createFixation,
  createISIBlank,
  createBlockBreak,
};

/**
 * Namespaced access to utility functions for advanced usage and testing.
 */
export const utils = {
  scoring: {
    calculateScores,
    getSummary,
  },
  createStimulusHTML,
  trial_text,
  createTimelineVariables,
  constants: {
    TASK_NAME,
    VERSION,
  },
  text: defaultText,
};

// Re-export types for TypeScript users
export type { TextConfig } from "./text";
