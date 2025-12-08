import "./styles.css";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { JsPsych } from "jspsych";

import { 
  StimulusInfo,
  SameStimulusInfo,
  StimulusOptions,
  TextOptions,
  CreateTimelineOptions,
  CreateTrialsSubTimelineOptions,
 } from "./text";

import { blankIconSvg } from "../assets/blank-icon.js";
import { flowerIconSvg } from "../assets/flower-icon.js";
import { heartIconSvg } from "../assets/heart-icon.js";

// -- CONSTANTS --
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

/**
 * The default text information object that includes various display strings and formatting functions within the timeline.
 */
const DEFAULT_TEXT_OBJECT: TextOptions = {
  // -- START INSTRUCTIONS --
  start_instructions_text: "Time to play!",
  start_instructions_button_text: "Start",
  // -- DEMO INSTRUCTIONS --
  format_instructions: (stimulus_name: string, side: string): string => 
    `When you see a ${stimulus_name}, press the button on the ${side} side.`,
  format_gametype_announcement: (name: string): string => 
    `This is the ${name} game. Here's how you play it.`,
  gametype_announcement_button_text: "OK",
  // -- FEEDBACK --
  format_feedback: (correct: boolean) => correct ? "Great job!" : "Try again.",
  // -- FIXATION --
  fixation_text: "+",
  // -- END INSTRUCTIONS --
  end_instructions_text: "Great job! You're all done.",
};

// -- UTILS --
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
  instruction: boolean = false,
) {
  return `
    ${
      instruction 
      ? `<div class="jspsych-hearts-and-flowers-instruction">
        When you see a ${stimulusInfo[targetSide].stimulus_name}, press the button on the ${targetSide} side.
      </div>`
      : ""
    }
    <div class="jspsych-hearts-and-flowers-stimulus-grid">
      <div class="jspsych-hearts-and-flowers-left-stimulus">${
        stimulusSide === "left" ? stimulusInfo[targetSide].stimulus_src : blankIconSvg
      }</div>
      <div class="jspsych-hearts-and-flowers-right-stimulus">${
        stimulusSide === "right" ? stimulusInfo[targetSide].stimulus_src : blankIconSvg
      }</div>
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

// -- TRIALS --
/**
 * Trial that announces the demo game type.
 *
 * @param {string} stimulusName - The name of the stimulus to be demoed.
 * @returns {jsPsychHtmlButtonResponse} Plugin object displaying the name of the stimulus to be demoed.
 */
function createGametypeTrial(stimulusName: string, format_gametype_announcement: (name: string) => string, gametype_announcement_button_text: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: format_gametype_announcement(stimulusName),
    choices: [gametype_announcement_button_text],
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
    on_load: () => {
      // restructure default html-button-reponse layout to have grid align
      const parent = document.querySelector(".jspsych-hearts-and-flowers-trial");
      
      if (instruction) {
        const instructionDiv = document.querySelector(".jspsych-hearts-and-flowers-instruction");
        instructionDiv.parentElement!.removeChild(instructionDiv);
        parent.prepend(instructionDiv);
      }

      const stimulusGrid = document.querySelector(".jspsych-hearts-and-flowers-stimulus-grid");
      const leftStimulus = stimulusGrid.children[0];
      const rightStimulus = stimulusGrid.children[1];
      
      parent.appendChild(leftStimulus);
      parent.appendChild(rightStimulus);
      parent.removeChild(document.querySelector("#jspsych-html-button-response-stimulus"));

      const buttons = document.querySelector("#jspsych-html-button-response-btngroup").children;
    
      const leftButton = buttons[0];
      const rightButton = buttons[1];

      leftButton.classList.add("jspsych-hearts-and-flowers-left-button");
      rightButton.classList.add("jspsych-hearts-and-flowers-right-button");
      
      parent.appendChild(leftButton);
      parent.appendChild(rightButton);
      parent.removeChild(document.querySelector("#jspsych-html-button-response-btngroup"));
    },
    on_finish: (data) => {
      data.correct = jsPsych.pluginAPI.compareKeys(
        data.response == 0 ? "left" : "right", // clicking "left" button results in data.response = 0
        data.correct_response,
      );
    },
    css_classes: ["jspsych-hearts-and-flowers-trial"],
  };
}

/**
 * Trial that shows feedback after each demo trial.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @returns {jsPsychHtmlKeyboardResponse} jsPsychHtmlKeyboardResponse object displaying feedback after each demo trial that depends on whether the participant answered correctly.
 *
 */
function createFeedbackTrial(jsPsych: JsPsych, format_feedback: (correct: boolean) => string) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      return `<div class="jspsych-hearts-and-flowers-instruction">${
        format_feedback(jsPsych.data.get().last(1).select("correct").values[0])
      }</div>`;
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
function createFixationTrial(jsPsych: JsPsych, fixationDurationFunction: () => number, fixation_text: string = "+") {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class='jspsych-hearts-and-flowers-fixation'>${fixation_text}</div>`,
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
  stimulusInfo: StimulusInfo,
  format_feedback: (correct: boolean) => string,
  format_gametype_announcement: (name: string) => string,
  gametype_announcement_button_text: string,
) {
  return {
    timeline: [
      createGametypeTrial(stimulusInfo[targetSide].stimulus_name, format_gametype_announcement, gametype_announcement_button_text),
      {
        timeline: [
          // A full demo session includes a demo trial with stimulus on the left and a demo trial with stimulus on the right
          {
            // Each demo trial includes a fixation trial, a trial with the actual stimulus, and a feedback trial
            timeline: [createTrial(jsPsych, stimulusInfo, true), createFeedbackTrial(jsPsych, format_feedback)],
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
  options: Partial<CreateTrialsSubTimelineOptions> = {},
) {
  const defaultOptions = {
    target_side: "both" as keyof StimulusInfo | "both",
    n_trials: 20,
    target_side_weights: [1, 1] as [number, number],
    side_weights: [1, 1] as [number, number],
    fixation_duration_function: () =>
      jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0],
    stimulus_info: DEFAULT_STIMULUS_INFO_OBJECT,
    text_options: DEFAULT_TEXT_OBJECT,
  };

  options = {
    ...defaultOptions,
    ...options,
  };

  const mergedTextOptions: TextOptions = {
    ...DEFAULT_TEXT_OBJECT,
    ...options.text_options,
  };

  return {
    timeline: [
      createFixationTrial(jsPsych, options.fixation_duration_function, mergedTextOptions.fixation_text),
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
 * Generates a timeline with the given options that constitute a hearts
 * and flowers task.
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
    text_options: DEFAULT_TEXT_OBJECT,
    demo: true,
    end_instruction: true,
    end_instruction_duration: 4000,
  };

  // Merge default options with user options (deep merge for stimulusInfo)
  options = {
    ...defaultOptions,
    ...options,
    stimulus_options: {
      ...defaultOptions.stimulus_options,
      ...options.stimulus_options, // Ensures individual properties inside stimulusInfo are not lost
    },
    text_options: {
      ...defaultOptions.text_options,
      ...options.text_options,
    },
  };

  // merge separately because typescript is unhappy otherwise
  const mergedTextOptions: TextOptions = {
    ...DEFAULT_TEXT_OBJECT,
    ...options.text_options,
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
    heartsAndFlowersTimeline.push(
      createDemoSubTimeline(
        jsPsych, "same", stimulusInfo, mergedTextOptions.format_feedback, mergedTextOptions.format_gametype_announcement, mergedTextOptions.gametype_announcement_button_text
      )
    );
    heartsAndFlowersTimeline.push(
      createDemoSubTimeline(
        jsPsych, "opposite", stimulusInfo, mergedTextOptions.format_feedback, mergedTextOptions.format_gametype_announcement, mergedTextOptions.gametype_announcement_button_text
      )
    );
  }

  heartsAndFlowersTimeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: mergedTextOptions.start_instructions_text,
    choices: [mergedTextOptions.start_instructions_button_text],
  });
  heartsAndFlowersTimeline.push(
    createTrialsSubTimeline(jsPsych, {
      target_side: "both",
      n_trials: options.n_trials,
      side_weights: options.side_weights,
      target_side_weights: options.target_side_weights,
      fixation_duration_function: options.fixation_duration_function,
      stimulus_info: stimulusInfo,
      text_options: mergedTextOptions,
    }),
  );
  if (options.end_instruction) {
    heartsAndFlowersTimeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: mergedTextOptions.end_instructions_text,
      choices: "NO_KEYS",
      trial_duration: options.end_instruction_duration,
    });
  }

  return { timeline: heartsAndFlowersTimeline };
}

export type {
  StimulusInfo,
  SameStimulusInfo,
  StimulusOptions,
  TextOptions,
  CreateTimelineOptions,
  CreateTrialsSubTimelineOptions,
};

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
  blankIconSvg,
  flowerIconSvg,
  heartIconSvg,
};
