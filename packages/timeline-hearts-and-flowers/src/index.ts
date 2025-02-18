import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { JsPsych } from "jspsych";

import { blankIconSvg } from "../assets/blank-icon.js";
import { flowerIconSvg } from "../assets/flower-icon.js";
import { heartIconSvg } from "../assets/heart-icon.js";

// Constants
let STIMULUS_INFO = {
  same: { stimulus_name: "heart", stimulus_src: heartIconSvg },
  opposite: { stimulus_name: "flower", stimulus_src: flowerIconSvg },
};

const STIMULUS_SIDES = [{ stimulus_side: "left" }, { stimulus_side: "right" }];

// utils
/**
 * Generates the stimulus HTML for a given trial.
 */
function generateStimulus(
  targetSide: keyof typeof STIMULUS_INFO,
  stimulusSide: "left" | "right",
  instruction: boolean = false
) {
  const { stimulus_name: stimulusName, stimulus_src: stimulusSrc } = STIMULUS_INFO[targetSide];
  return `
    <div class="jspsych-hearts-and-flowers-instruction">
      ${
        instruction
          ? `<h3>When you see a ${stimulusName}, press the button on the ${targetSide} side.</h3>`
          : ""
      }
      </div>
      <div class="hearts-and-flowers-stimulus-grid">
        <div class="hearts-and-flowers-stimulus-grid-item">${
          stimulusSide === "left" ? stimulusSrc : blankIconSvg
        }</div>
        <div class="hearts-and-flowers-stimulus-grid-item">${
          stimulusSide === "right" ? stimulusSrc : blankIconSvg
        }</div>
      </div>
    </div>`;
}

/**
 * Computes the correct response index.
 */
function getCorrectResponse(
  targetSide: keyof typeof STIMULUS_INFO,
  stimulusSide: "left" | "right"
) {
  return targetSide === "same"
    ? stimulusSide === "left"
      ? "left"
      : "right"
    : stimulusSide === "left"
    ? "right"
    : "left";
}

/**
 * Trial that announces the demo game type.
 */
function createGametypeTrial(targetSide: keyof typeof STIMULUS_INFO) {
  const stimulusName = STIMULUS_INFO[targetSide].stimulus_name;
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="jspsych-hearts-and-flowers-instruction"><h3>
      This is the ${stimulusName}s game. Here's how you play it.</h3></div>`,
    choices: ["OK"],
    data: { trial_type: "demo_gametype", stimulus_name: stimulusName },
  };
}

// trials
/**
 * Trial that shows the stimulus and collects the response.
 */
function createTrial(
  jsPsych: JsPsych,
  targetSide: keyof typeof STIMULUS_INFO,
  instruction: boolean = false
) {
  const stimulusName = STIMULUS_INFO[targetSide].stimulus_name;
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const stimulusSide = jsPsych.evaluateTimelineVariable("stimulus_side");
      return generateStimulus(targetSide, stimulusSide, instruction);
    },
    choices: ["left", "right"],
    data: {
      trial_type: "demo_trial",
      stimulus_name: stimulusName,
      stimulus_side: () => jsPsych.evaluateTimelineVariable("stimulus_side"),
      target_side: targetSide,
      correct_response: () => {
        const stimulusSide = jsPsych.evaluateTimelineVariable("stimulus_side");
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
 */
function createFeedbackTrial(jsPsych: JsPsych) {
  return {
    type: jsPsychHtmlKeyboardResponse,
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
 */
function createFixationTrial(jsPsych: JsPsych) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<div class='jspsych-hearts-and-flowers-instruction'><h3>+</h3></div>",
    trial_duration: () => {
      return jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0];
    },
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
 */
function createDemoSubTimeline(jsPsych: JsPsych, targetSide: keyof typeof STIMULUS_INFO = "same") {
  return [
    createGametypeTrial(targetSide),
    {
      timeline: [
        // A full demo session includes a demo trial with stimulus on the left and a demo trial with stimulus on the right
        {
          // Each demo trial includes a fixation trial, a trial with the actual stimulus, and a feedback trial
          timeline: [
            createFixationTrial(jsPsych),
            createTrial(jsPsych, targetSide, true),
            createFeedbackTrial(jsPsych),
          ],
          // The demo trial is repeated until the participant gets it right
          loop_function: () => !jsPsych.data.get().last(1).select("correct").values[0],
        },
      ],
      timeline_variables: STIMULUS_SIDES,
      randomize_order: true,
    },
  ];
}

/**
 * Creates the main timeline.
 */
export default function createTimeline(
  jsPsych: JsPsych,
  {
    same_side_stimulus_name = "heart",
    same_side_stimulus_src = heartIconSvg,
    opposite_side_stimulus_name = "flower",
    opposite_side_stimulus_src = flowerIconSvg,
  }: {
    same_side_stimulus_name: string;
    same_side_stimulus_src: string;
    opposite_side_stimulus_name: string;
    opposite_side_stimulus_src: string;
  }
) {
  STIMULUS_INFO.same.stimulus_name = same_side_stimulus_name;
  STIMULUS_INFO.same.stimulus_src = same_side_stimulus_src;
  STIMULUS_INFO.opposite.stimulus_name = opposite_side_stimulus_name;
  STIMULUS_INFO.opposite.stimulus_src = opposite_side_stimulus_src;
  return [
    createDemoSubTimeline(jsPsych, "same"),
    { type: jsPsychHtmlButtonResponse, stimulus: "Time to play!", choices: ["OK"] },
    {
      timeline: [createFixationTrial(jsPsych), createTrial(jsPsych, "same")],
      timeline_variables: STIMULUS_SIDES,
      randomize_order: true,
      repetitions: 20,
    },
    createDemoSubTimeline(jsPsych, "opposite"),
    { type: jsPsychHtmlButtonResponse, stimulus: "Time to play!", choices: ["OK"] },
    {
      timeline: [createFixationTrial(jsPsych), createTrial(jsPsych, "opposite")],
      timeline_variables: STIMULUS_SIDES,
      randomize_order: true,
      repetitions: 20,
    },
    { type: jsPsychHtmlButtonResponse, stimulus: "Great job! You're all done.", choices: ["OK"] },
  ];
}

export const timelineUnits = {
  createGametypeTrial,
  createTrial,
  createFeedbackTrial,
  createFixationTrial,
  createDemoSubTimeline,
};
export const utils = {
  generateStimulus,
  getCorrectResponse,
};
