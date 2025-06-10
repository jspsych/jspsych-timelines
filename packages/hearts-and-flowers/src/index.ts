import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { JsPsych } from "jspsych";

import { blankIconSvg } from "../assets/blank-icon.js";
import { flowerIconSvg } from "../assets/flower-icon.js";
import { heartIconSvg } from "../assets/heart-icon.js";

// Constants
/**
 * Interface for the stimulus information object that describes the name and source of the stimulus for both target sides.
 */
export interface StimulusInfo {
  /**
   * The stimulus information object for the same target side.
   * @defaultValue { stimulus_name: "heart", stimulus_src: heartIconSvg, target_side: "same" }
   */
  same: SameStimulusInfo & { target_side: "same" };
  /**
   * The stimulus information object for the opposite target side.
   * @defaultValue { stimulus_name: "flower", stimulus_src: flowerIconSvg, target_side: "opposite" }
   */
  opposite: SameStimulusInfo & { target_side: "opposite" };
}

export interface SameStimulusInfo {
  stimulus_name: string;
  stimulus_src: string;
}

/**
 * The default stimulus information object that describes the name and source of the stimulus for both target sides.
 */
const DEFAULT_STIMULUS_INFO_OBJECT: StimulusInfo = {
  same: {
    stimulus_name: "heart",
    stimulus_src: heartIconSvg,
    target_side: "same",
  },
  opposite: {
    stimulus_name: "flower",
    stimulus_src: flowerIconSvg,
    target_side: "opposite",
  },
};

// utils
/**
 * Generates the stimulus HTML for a given trial.
 *
 * @param {"same" | "opposite"} targetSide - The side of the target stimulus [same\|opposite].
 * @param {"left" | "right"} stimulusSide - The side of the stimulus to be displayed [left\|right].
 * @param {StimulusInfo} stimulusInfo - The stimulus information object that describes the name and source of the stimulus.
 * @param {boolean} [instruction=false] - Whether to include instruction text teaching participants how to respond.
 * @returns {string} HTML string representing the stimulus.
 */
function generateStimulus(
  targetSide: "same" | "opposite",
  stimulusSide: "left" | "right",
  stimulusInfo: StimulusInfo,
  instruction: boolean = false
) {
  return `
    <div class="jspsych-hearts-and-flowers-instruction">
      ${
        instruction
          ? `<h3>When you see a ${stimulusInfo[targetSide].stimulus_name}, press
          the button on the ${targetSide} side.</h3>`
          : ""
      }
      </div>
      <div class="hearts-and-flowers-stimulus-grid">
        <div class="hearts-and-flowers-stimulus-grid-item">${
          stimulusSide === "left" ? stimulusInfo[targetSide].stimulus_src : blankIconSvg
        }</div>
        <div class="hearts-and-flowers-stimulus-grid-item">${
          stimulusSide === "right" ? stimulusInfo[targetSide].stimulus_src : blankIconSvg
        }</div>
      </div>
    </div>`;
}

/**
 * Computes the correct response index.
 *
 * @param {"same" | "opposite"} targetSide - The side of the target stimulus [same\|opposite].
 * @param {"left" | "right"} stimulusSide - The side of the stimulus to be displayed [left\|right].
 * @returns {"left" | "right"} The correct response index.
 */
function getCorrectResponse(targetSide: "same" | "opposite", stimulusSide: "left" | "right") {
  return targetSide === "same"
    ? stimulusSide === "left"
      ? "left"
      : "right"
    : stimulusSide === "left"
    ? "right"
    : "left";
}

// trials
/**
 * Trial that announces the demo game type.
 *
 * @param {string} stimulusName - The name of the stimulus to be demoed.
 * @returns {jsPsychHtmlButtonResponse} Plugin object displaying the name of the stimulus to be demoed.
 */
function createGametypeTrial(stimulusName: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="jspsych-hearts-and-flowers-instruction"><h3>
      This is the ${stimulusName}s game. Here's how you play it.</h3></div>`,
    choices: ["OK"],
    data: { trial_type: "demo_gametype", stimulus_name: stimulusName },
  };
}

/**
 * Trial that shows the stimulus and collects the response.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @param {StimulusInfo} stimulusInfo - The stimulus information object that describes the name of the stimulus and its source.
 * @param {boolean} instruction - Whether to include instruction text teaching participants how to respond or not.
 * @returns {jsPsychHtmlButtonResponse} Plugin object displaying the stimulus and collecting the response.
 */
function createTrial(jsPsych: JsPsych, stimulusInfo: StimulusInfo, instruction: boolean = false) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const stimulusSide = jsPsych.evaluateTimelineVariable("stimulus_side");
      const targetSide = jsPsych.evaluateTimelineVariable("target_side");
      return generateStimulus(targetSide, stimulusSide, stimulusInfo, instruction);
    },
    choices: ["left", "right"],
    data: {
      trial_type: instruction ? "demo_trial" : "trial",
      stimulus_side: () => jsPsych.evaluateTimelineVariable("stimulus_side"),
      target_side: () => jsPsych.evaluateTimelineVariable("target_side"),
      stimulus_name: () =>
        stimulusInfo[jsPsych.evaluateTimelineVariable("target_side")].stimulus_name,
      correct_response: () => {
        const stimulusSide = jsPsych.evaluateTimelineVariable("stimulus_side");
        const targetSide = jsPsych.evaluateTimelineVariable("target_side");
        return getCorrectResponse(targetSide, stimulusSide);
      },
    },
    on_finish: (data) => {
      data.correct = jsPsych.pluginAPI.compareKeys(
        data.response == 0 ? "left" : "right", // clicking "left" button results in data.response = 0
        data.correct_response
      );
    },
  };
}

/**
 * Trial that shows feedback after each demo trial.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @returns {jsPsychHtmlKeyboardResponse} jsPsychHtmlKeyboardResponse object displaying feedback after each demo trial that depends on whether the participant answered correctly.
 *
 */
function createFeedbackTrial(jsPsych: JsPsych) {
  return {
    plugin: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      return `<div class="jspsych-hearts-and-flowers-instruction">
        <h3>${
          jsPsych.data.get().last(1).select("correct").values[0] ? "Great job!" : "Try again."
        }</h3>
      </div>`;
    },
    trial_duration: 1000,
    data: {
      trial_type: "demo_feedback",
      correct: () => jsPsych.data.get().last(1).select("correct").values[0],
    },
  };
}

/**
 * Trial that shows a fixation cross.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @param {Function} fixationDurationFunction - The function that returns a random fixation duration from a list of possible durations.
 * @returns {jsPsychHtmlKeyboardResponse} Plugin object displaying a fixation cross for a random duration.
 */
function createFixationTrial(jsPsych: JsPsych, fixationDurationFunction: () => number) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<div class='jspsych-hearts-and-flowers-instruction'><h3>+</h3></div>",
    trial_duration: fixationDurationFunction,
    save_trial_parameters: {
      trial_duration: true,
    },
    data: {
      trial_type: "fixation",
    },
  };
}

/**
 * Creates a demo subtimeline.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @param {"same" | "opposite" | "both"} targetSide - The side of the target stimulus.
 * @param {StimulusInfo} stimulusInfo - The stimulus information object that describes the name of the stimulus and its source.
 * @returns {timeline object} A subtimeline that includes a demo trial with stimulus on the left, a demo trial with stimulus on the right, or both.
 */
function createDemoSubTimeline(
  jsPsych: JsPsych,
  targetSide: keyof StimulusInfo | "both",
  stimulusInfo: StimulusInfo
) {
  return {
    timeline: [
      createGametypeTrial(stimulusInfo[targetSide].stimulus_name),
      {
        timeline: [
          // A full demo session includes a demo trial with stimulus on the left and a demo trial with stimulus on the right
          {
            // Each demo trial includes a fixation trial, a trial with the actual stimulus, and a feedback trial
            timeline: [createTrial(jsPsych, stimulusInfo, true), createFeedbackTrial(jsPsych)],
            // The demo trial is repeated until the participant gets it right
            loop_function: () => !jsPsych.data.get().last(1).select("correct").values[0],
          },
        ],
        timeline_variables: ((targetSide) => {
          switch (targetSide) {
            case "same":
              return [
                { ...stimulusInfo.same, stimulus_side: "left" },
                { ...stimulusInfo.same, stimulus_side: "right" },
              ];
            case "opposite":
              return [
                { ...stimulusInfo.opposite, stimulus_side: "left" },
                { ...stimulusInfo.opposite, stimulus_side: "right" },
              ];
            case "both":
              return [
                { ...stimulusInfo.same, stimulus_side: "left" },
                { ...stimulusInfo.same, stimulus_side: "right" },
                { ...stimulusInfo.opposite, stimulus_side: "left" },
                { ...stimulusInfo.opposite, stimulus_side: "right" },
              ];
            default:
              return [];
          }
        })(targetSide),
      },
    ],
  };
}

/**
 * Creates a subtimeline with a set number of trials.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @param {CreateTrialsSubTimelineOptions} options - The options object that includes what kinds of trials to
 * include [same|opposte|both], the number of trials, the weights for how often
 * each type of stimulus appears, the weights for how often the stimulus appears on
 * each side, and the stimulus information containing the name and source of each
 * stimulus type.
 *
 * @returns {timeline object} A subtimeline with a set number of trials with the specified options.
 */
function createTrialsSubTimeline(
  jsPsych: JsPsych,
  options: Partial<CreateTrialsSubTimelineOptions> = {}
) {
  const defaultOptions = {
    target_side: "both" as keyof StimulusInfo | "both",
    n_trials: 20,
    target_side_weights: [1, 1] as [number, number],
    side_weights: [1, 1] as [number, number],
    fixation_duration_function: () =>
      jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0],
    stimulus_info: DEFAULT_STIMULUS_INFO_OBJECT,
  };

  options = {
    ...defaultOptions,
    ...options,
  };

  return {
    timeline: [
      createFixationTrial(jsPsych, options.fixation_duration_function),
      createTrial(jsPsych, options.stimulus_info, false),
    ],
    timeline_variables: ((targetSide) => {
      switch (targetSide) {
        case "same":
          return [
            { ...options.stimulus_info.same, stimulus_side: "left" },
            { ...options.stimulus_info.same, stimulus_side: "right" },
          ];
        case "opposite":
          return [
            { ...options.stimulus_info.opposite, stimulus_side: "left" },
            { ...options.stimulus_info.opposite, stimulus_side: "right" },
          ];
        case "both":
          return [
            { ...options.stimulus_info.same, stimulus_side: "left" },
            { ...options.stimulus_info.same, stimulus_side: "right" },
            { ...options.stimulus_info.opposite, stimulus_side: "left" },
            { ...options.stimulus_info.opposite, stimulus_side: "right" },
          ];
        default:
          return [];
      }
    })(options.target_side),
    sample: {
      type: "with-replacement",
      size: options.n_trials,
      weights: ((targetSide, targetSideWeights, sideWeights) => {
        if (targetSide === "both") {
          return targetSideWeights.flatMap((tsw) => sideWeights.map((sw) => tsw * sw));
        } else {
          return sideWeights;
        }
      })(options.target_side, options.target_side_weights, options.side_weights),
    },
  };
}

/**
 * Interface for the options parameter in {@link createTrialsSubTimeline}.
 */
export interface CreateTrialsSubTimelineOptions {
  /**
   * The side of the target stimulus [same\|opposite\|both].
   * @defaultValue "both"
   */
  target_side: "same" | "opposite" | "both";

  /**
   * The number of trials to include in the experiment.
   * @defaultValue 20
   */
  n_trials: number;

  /**
   * The weights for how often each type of stimulus appears, defined by their target side [same, opposite].
   * @defaultValue [1, 1]
   */
  target_side_weights: [same_weight: number, opposite_weight: number];

  /**
   * The weights for how often the stimulus appears on each side [left, right].
   * @defaultValue [1, 1]
   */
  side_weights: [left_weight: number, right_weight: number];

  /**
   * The function that returns a random fixation duration from a list of possible durations.
   * @defaultValue () => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0]
   * @returns {number} A function that returns a random fixation duration from a list of possible durations.
   */
  fixation_duration_function: () => number;

  /**
   * The stimulus information object that describes the name and source of the stimulus.
   * @defaultValue { same_side_stimulus_name: "heart", same_side_stimulus_src: heartIconSvg, opposite_side_stimulus_name: "flower", opposite_side_stimulus_src: flowerIconSvg }
   */
  stimulus_info: StimulusInfo;
}

/**
 * This timeline shows a sequence of hearts and flowers trials. In each trial,
 * participants are shown a stimulus on one side of the screen. There are only
 * two types of stimuli, and participants are taught and expected to respond to
 * one type by pressing the button on the same side as it (traditionally a
 * heart), and to the other by pressing the button on the opposite side
 * (traditionally a flower), as quickly as possible.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @param {CreateTimelineOptions} options - The options object that includes the number of trials, the weights
 * for how often each type of stimulus appears, the weights for how often the stimulus
 * appears on each side, the stimulus information containing the name and source
 * of each stimulus type, whether to include a demo section or not, and the instruction
 * text at the beginning and end of the experiment.
 * @returns {timeline object} The main timeline object.
 */
export function createTimeline(jsPsych: JsPsych, options: Partial<CreateTimelineOptions> = {}) {
  // Default values
  const defaultOptions = {
    n_trials: 20,
    side_weights: [1, 1] as [number, number],
    target_side_weights: [1, 1] as [number, number],
    fixation_duration_function: () =>
      jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0],
    stimulus_options: {
      same_side_stimulus_name: "heart",
      same_side_stimulus_src: heartIconSvg,
      opposite_side_stimulus_name: "flower",
      opposite_side_stimulus_src: flowerIconSvg,
    },
    demo: true,
    start_instruction_text: "Time to play!",
    end_instruction_text: "Great job! You're all done.",
  };

  // Merge default options with user options (deep merge for stimulusInfo)
  options = {
    ...defaultOptions,
    ...options,
    stimulus_options: {
      ...defaultOptions.stimulus_options,
      ...options.stimulus_options, // Ensures individual properties inside stimulusInfo are not lost
    },
  };

  const stimulusInfo: StimulusInfo = {
    same: {
      stimulus_name: options.stimulus_options.same_side_stimulus_name,
      stimulus_src: options.stimulus_options.same_side_stimulus_src,
      target_side: "same",
    },
    opposite: {
      stimulus_name: options.stimulus_options.opposite_side_stimulus_name,
      stimulus_src: options.stimulus_options.opposite_side_stimulus_src,
      target_side: "opposite",
    },
  };

  const heartsAndFlowersTimeline = [];

  if (options.demo) {
    heartsAndFlowersTimeline.push(createDemoSubTimeline(jsPsych, "same", stimulusInfo));
    heartsAndFlowersTimeline.push(createDemoSubTimeline(jsPsych, "opposite", stimulusInfo));
  }
  heartsAndFlowersTimeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: options.start_instruction_text,
    choices: ["OK"],
  });
  heartsAndFlowersTimeline.push(
    createTrialsSubTimeline(jsPsych, {
      target_side: "both",
      n_trials: options.n_trials,
      side_weights: options.side_weights,
      target_side_weights: options.target_side_weights,
      fixation_duration_function: options.fixation_duration_function,
      stimulus_info: stimulusInfo,
    })
  );
  heartsAndFlowersTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: options.end_instruction_text,
    choices: "NO_KEYS",
  });

  return { timeline: heartsAndFlowersTimeline };
}
/**
 * Define and export the interface for the `options` parameter in {@link createTimeline}.
 */
export interface CreateTimelineOptions {
  /**
   * The number of trials to include in the experiment.
   * @defaultValue 20
   */
  n_trials: number;

  /**
   * The weights for how often the stimulus appears on each side [left, right].
   * @defaultValue [1, 1]
   */
  side_weights: [left_weight: number, right_weight: number];

  /**
   * The weights for how often each type of stimulus appears, defined by their target side [same, opposite].
   * @defaultValue [1, 1]
   */
  target_side_weights: [same_weight: number, opposite_weight: number];

  /**
   * The function that returns a random fixation duration from a list of possible durations.
   * @defaultValue () => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0]
   * @returns {number} A function that returns a random fixation duration from a list of possible durations.
   */
  fixation_duration_function: () => number;

  /**
   * The options object that includes the name and source of each stimulus type.
   * @defaultValue { same_side_stimulus_name: "heart", same_side_stimulus_src: heartIconSvg, opposite_side_stimulus_name: "flower", opposite_side_stimulus_src: flowerIconSvg }
   */
  stimulus_options: Partial<StimulusOptions>;

  /**
   * Whether to include a demo section or not.
   * @defaultValue true
   */
  demo: boolean;

  /**
   * The instruction text at the beginning of the experiment.
   * @defaultValue "Time to play!"
   */
  start_instruction_text: string;

  /**
   * The instruction text at the end of the experiment.
   * @defaultValue "Great job! You're all done."
   */
  end_instruction_text: string;
}

/**
 * Define and export the interface for the `stimulus_options` property in {@link CreateTimelineOptions}.
 */
export interface StimulusOptions {
  /**
   * The name of the stimulus to be displayed when the target side is the same side.
   * @defaultValue "heart"
   */
  same_side_stimulus_name: string;

  /**
   * The source of the stimulus to be displayed when the target side is the same side.
   * @defaultValue heartIconSvg
   */
  same_side_stimulus_src: string;

  /**
   * The name of the stimulus to be displayed when the target side is the opposite side.
   * @defaultValue "flower"
   */
  opposite_side_stimulus_name: string;

  /**
   * The source of the stimulus to be displayed when the target side is the opposite side.
   * @defaultValue flowerIconSvg
   */
  opposite_side_stimulus_src: string;
}

/**
 * Timeline units that can be used to create a hearts and flowers experiment.
 */
export const timelineUnits = {
  createGametypeTrial,
  createTrial,
  createFeedbackTrial,
  createFixationTrial,
  createDemoSubTimeline,
  createTrialsSubTimeline,
};

/**
 * Utility functions that can be used to create a hearts and flowers experiment.
 */
export const utils = {
  generateStimulus,
  getCorrectResponse,
};