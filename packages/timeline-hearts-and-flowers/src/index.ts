import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { JsPsych } from "jspsych";

// TYPE DEFINITIONS
// Possible stimuli and their target sides
const STIMULUS_INFO = {
  hearts: { name: "heart", target_side: "same" },
  flowers: { name: "flower", target_side: "opposite" },
};

// Possible sides stimuli can appear on
const STIMULUS_SIDES = [{ stimulus_side: "left" }, { stimulus_side: "right" }];

// TIMELINE UNITS
// Trial that announces what the following demo game type is.
function demo_gametype(trialStimulus: keyof typeof STIMULUS_INFO) {
  const stimulus = `
    <div class="jspsych-hearts-and-flowers-instruction"><h3>
    This is the ${trialStimulus} game. Here's how you play it.
    `;

  const demo_gameType = {
    type: jsPsychHtmlButtonResponse,
    stimulus: stimulus,
    choices: ["OK"],
    data: {
      trial_type: "demo_gametype",
      stimulus: trialStimulus,
    },
  };

  return demo_gameType;
}

// Individual demo trial
function demo_trial(
  jsPsych: JsPsych,
  {
    trialStimulus,
    stimulusInfo,
  }: { trialStimulus: keyof typeof STIMULUS_INFO; stimulusInfo: typeof STIMULUS_INFO }
) {
  const stimulusName = stimulusInfo[trialStimulus].name;
  const targetSide = stimulusInfo[trialStimulus].target_side;
  const stimulusSide = jsPsych.timelineVariable("stimulus_side").toString();
  console.log(stimulusName, targetSide, stimulusSide);
  const stimulus = `
    <div class="jspsych-hearts-and-flowers-instruction">
        <h3>When you see a ${stimulusName}, press the button on the ${targetSide} side.</h3>
        <div class="hearts-and-flowers-stimulus-grid">
            <div class="hearts-and-flowers-stimulus-grid-item">
                <img src="../assets/${stimulusSide == "left" ? stimulusName : "blank"}-icon.png" />
            </div>
            <div class="hearts-and-flowers-stimulus-grid-item">
                <img src="../assets/${stimulusSide == "right" ? stimulusName : "blank"}-icon.png" />
            </div>
        </div>
    </div>
    `;

  const demoTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: stimulus,
    choices: ["left", "right"],
    data: {
      trial_type: "demo_trial",
      stimulus: stimulusName,
      stimulus_side: stimulusSide,
      target_side: targetSide,
      correct_response: () => {
        switch (targetSide) {
          case "same":
            return stimulusSide == "left" ? 0 : 1; // left = 0, right = 1
          case "opposite":
            return stimulusSide == "left" ? 1 : 0;
          default:
            return "none";
        }
      },
    },
    on_finish: (data) => {
      data.correct = jsPsych.pluginAPI.compareKeys(
        data.response.toString(),
        data.correct_response.toString()
      );
    },
  };

  return demoTrial;
}

// Feedback for an individual demo trial
function demo_feedback(jsPsych: JsPsych) {
  const correct = jsPsych.data.get().last(1).select("correct").values[0];
  const demoFeedback = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <div class="jspsych-hearts-and-flowers-instruction">
            <h3>${correct ? "Great job!" : "Try again."}</h3>
        </div>
        `,
    trial_duration: 1000,
    data: {
      trial_type: "demo_feedback",
      correct: correct,
    },
  };

  return demoFeedback;
}

/**
 * This function returns a full demo subtimeline that includes demo game type, demo trials and feedback for each.
 * @param jsPsych The JsPsych instance representing the experiment.
 * @param param1 trialStimulus: TrialStimulus, stimulusSides: [] and stimulusInfo: StimulusInfoType
 * @returns A demo timeline that includes set of demo trials and feedback.
 */
function demoSubTimeline(
  jsPsych: JsPsych,
  {
    trialStimulus = "hearts",
    stimulusInfo = STIMULUS_INFO,
  }: {
    trialStimulus?: keyof typeof STIMULUS_INFO;
    stimulusInfo?: typeof STIMULUS_INFO;
  }
) {
  const demoTimeline = {
    timeline: [
      demo_gametype(trialStimulus),
      // Single demo-feedback pair
      {
        timeline: [demo_trial(jsPsych, { trialStimulus, stimulusInfo }), demo_feedback(jsPsych)],
        // Each demo trial repeats if incorrect response
        looping_function: () => {
          return !jsPsych.data.get().last(1).select("correct").values[0];
        },
      },
    ],
    timelineVariables: STIMULUS_SIDES,
    size: 1,
    randomize_order: true,
  };

  return demoTimeline;
}

/**
 * Creates a practice section that consists of instructions, demos and 2 practice trials.
 */
function createPractice() {}

/**
 * Creates a section of the timeline that consists of the practice section and trials section.
 */
function createFullSection() {}

export function createTimeline(jsPsych: JsPsych, {}) {
  const heartsAndFlowersTimeline = [
    demoSubTimeline(jsPsych, {
      trialStimulus: "hearts",
      stimulusInfo: STIMULUS_INFO,
    }),
  ];
  return heartsAndFlowersTimeline;
}

export const timelineUnits = {
  demoTimeline: [],
};

export const utils = {};
