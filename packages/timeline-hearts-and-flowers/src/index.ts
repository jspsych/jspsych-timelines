import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { JsPsych } from "jspsych";

// Constants
const STIMULUS_INFO = {
  hearts: { name: "heart", target_side: "same" },
  flowers: { name: "flower", target_side: "opposite" },
};

const STIMULUS_SIDES = [{ stimulus_side: "left" }, { stimulus_side: "right" }];

const CHOICES = ["left", "right"];

/**
 * Generates the stimulus HTML for a given trial.
 */
function generateStimulus(trialStimulus: keyof typeof STIMULUS_INFO, stimulusSide: string) {
  const { name, target_side } = STIMULUS_INFO[trialStimulus];
  return `
    <div class="jspsych-hearts-and-flowers-instruction">
      <h3>When you see a ${name}, press the button on the ${target_side} side.</h3>
      <div class="hearts-and-flowers-stimulus-grid">
        <div class="hearts-and-flowers-stimulus-grid-item">
          <img src="../assets/${stimulusSide === "left" ? name : "blank"}-icon.png" />
        </div>
        <div class="hearts-and-flowers-stimulus-grid-item">
          <img src="../assets/${stimulusSide === "right" ? name : "blank"}-icon.png" />
        </div>
      </div>
    </div>`;
}

/**
 * Computes the correct response index.
 */
function getCorrectResponse(trialStimulus: keyof typeof STIMULUS_INFO, stimulusSide: string) {
  const { target_side } = STIMULUS_INFO[trialStimulus];
  return target_side === "same" ? (stimulusSide === "left" ? 0 : 1) : (stimulusSide === "left" ? 1 : 0);
}

/**
 * Trial that announces the demo game type.
 */
function createDemoGametypeTrial(trialStimulus: keyof typeof STIMULUS_INFO) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="jspsych-hearts-and-flowers-instruction"><h3>
      This is the ${trialStimulus} game. Here's how you play it.</h3></div>`,
    choices: ["OK"],
    data: { trial_type: "demo_gametype", stimulus: trialStimulus },
  };
}

/**
 * Trial that shows the stimulus and collects the response.
 */
function createDemoTrial(jsPsych: JsPsych, trialStimulus: keyof typeof STIMULUS_INFO) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const stimulusSide = jsPsych.evaluateTimelineVariable("stimulus_side");
      return generateStimulus(trialStimulus, stimulusSide);
    },
    choices: CHOICES,
    data: {
      trial_type: "demo_trial",
      stimulus: STIMULUS_INFO[trialStimulus].name,
      stimulus_side: () => jsPsych.evaluateTimelineVariable("stimulus_side"),
      target_side: STIMULUS_INFO[trialStimulus].target_side,
      correct_response: () => {
        const stimulusSide = jsPsych.evaluateTimelineVariable("stimulus_side");
        return getCorrectResponse(trialStimulus, stimulusSide);
      },
    },
    on_finish: (data) => {
      data.correct = jsPsych.pluginAPI.compareKeys(data.response.toString(), data.correct_response.toString());
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
        <h3>${jsPsych.data.get().last(1).select("correct").values[0] ? "Great job!" : "Try again."}</h3>
      </div>`;
    },
    trial_duration: 1000,
    data: { trial_type: "demo_feedback", correct: () => jsPsych.data.get().last(1).select("correct").values[0] },
  };
}

/**
 * Creates a demo subtimeline.
 */
function createDemoSubTimeline(jsPsych: JsPsych, trialStimulus: keyof typeof STIMULUS_INFO = "hearts") {
  return [
    createDemoGametypeTrial(trialStimulus),
    {
      timeline: [
        {
          timeline: [createDemoTrial(jsPsych, trialStimulus), createFeedbackTrial(jsPsych)],
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
export function createTimeline(jsPsych: JsPsych) {
  return [createDemoSubTimeline(jsPsych, "hearts")];
}

export const timelineUnits = { demoTimeline: [] };
export const utils = {};
