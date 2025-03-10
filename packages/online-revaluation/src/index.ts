import HtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import svgDictionary from "./svg-dictionary";
import { JsPsych } from "jspsych";

export function createTimeline(
  jsPsych: JsPsych,
  {
    fixation_duration = 500,
    highlight_duration = 300,
    feedback_duration = 1000,
    left_key = "f",
    right_key = "j",
    objects = [
      {icon: "tree-alt", value: 1, color: "green"},
      {icon: "balloon", value: 2, color: "red"},
      {icon: "cake", value: 3, color: "brown"},
      {icon: "car", value: 4, color: "blue"},
    ],
    temptation_objects = [
      {icon: 'polygon', value: 1, color: "purple"},
    ],
    reward_object = "dollar-circle",
    min_delay = 1000,
    max_delay = 10000,
    p_never = 0.15,
    trials_per_block = 20,
    forced_choices_per_block = 12,
  }: {
    fixation_duration?: number;
    highlight_duration?: number;
    feedback_duration?: number;
    left_key?: string;
    right_key?: string;
    objects?: {icon: string, value: number, color: string}[];
    temptation_objects?: {icon: string, value: number, color: string}[];
    reward_object?: string;
    min_delay?: number;
    max_delay?: number;
    p_never?: number;
    trials_per_block?: number;
    forced_choices_per_block?: number;
  } = {}
) {

  // Common styles to reduce redundant CSS
const styles = {
  container: "width: 50vw; display: flex; justify-content: space-between; align-items: center;",
  objectBase: "box-sizing: border-box; padding: 5px; border: 2px solid transparent; border-radius: 50%; min-width: 60px; min-height: 60px; display: flex; justify-content: center; align-items: center;",
  objectSelected: "padding: 5px; border: 2px solid black; border-radius: 50%;",
  objectUnselected: "padding: 5px; border: 2px solid transparent; border-radius: 50%;",
  fixation: "font-size: 60px;"
};

// Helper function to generate object HTML
function getObjectHTML(object, isSelected = false) {
  const style = isSelected ? styles.objectSelected : styles.objectUnselected;
  return `<div style="${style} color: ${object ? object.color : 'black'};">
    ${object ? svgDictionary[object.icon] : ''}
  </div>`;
}

// Helper function to generate choice display HTML
function getChoiceDisplayHTML(leftObject, rightObject, selectedSide = null) {
  return `<div style="${styles.container}">
    ${getObjectHTML(leftObject, selectedSide === "left")}
    ${getObjectHTML(rightObject, selectedSide === "right")}
  </div>`;
}

  const trial_params = [];
  for(let i = 0; i < trials_per_block; i++){
    const object = objects[i % objects.length];
    const other_object = i < forced_choices_per_block ? 
      objects[i % objects.length] :
      jsPsych.randomization.sampleWithoutReplacement(objects.filter((obj) => obj !== object), 1)[0];
    const side = jsPsych.randomization.sampleWithoutReplacement(["left", "right"], 1)[0];
    if(object == other_object){  
      const trial = {
        left_object: side === "left" ? object : null,
        right_object: side === "right" ? object : null,
        temptation_object: jsPsych.randomization.sampleWithoutReplacement(temptation_objects, 1)[0],
      }
      trial_params.push(trial);
    } else {
      const trial = {
        left_object: side === "left" ? object : other_object,
        right_object: side === "right" ? object : other_object,
        temptation_object: jsPsych.randomization.sampleWithoutReplacement(temptation_objects, 1)[0],
      }
      trial_params.push(trial);
    }

  }


  const fixation = {
    type: HtmlKeyboardResponse,
    stimulus: `<div style="${styles.fixation}">+</div>`,
    choices: "NO_KEYS",
    trial_duration: fixation_duration,
    data: {
      task: "fixation",
    },
  };

  const choice = {
    type: HtmlKeyboardResponse,
    stimulus: () => {
      const leftObject = jsPsych.evaluateTimelineVariable("left_object");
      const rightObject = jsPsych.evaluateTimelineVariable("right_object");
      return getChoiceDisplayHTML(leftObject, rightObject);
    },
    choices: () => {
      const keys = []
      if(jsPsych.evaluateTimelineVariable("left_object")!==null){
        keys.push(left_key);
      }
      if(jsPsych.evaluateTimelineVariable("right_object")!==null){
        keys.push(right_key);
      }
      return keys;
    },
    data: {
      task: "initial-choice",
    },
    on_finish: (data) => {
      data.side_picked = jsPsych.pluginAPI.compareKeys(data.response, left_key) ? "left" : "right";
      data.object_picked = jsPsych.evaluateTimelineVariable(data.side_picked + "_object").icon;
      data.value_picked = objects.find((obj) => obj.icon === data.object_picked).value;
    },
  };

  const highlight_choice = {
    type: HtmlKeyboardResponse,
    stimulus: () => {
      const leftObject = jsPsych.evaluateTimelineVariable("left_object");
      const rightObject = jsPsych.evaluateTimelineVariable("right_object");
      const selectedSide = jsPsych.data.get().filter({task: 'initial-choice'}).last(1).values()[0].side_picked;
      return getChoiceDisplayHTML(leftObject, rightObject, selectedSide);
    },
    choices: "NO_KEYS",
    trial_duration: highlight_duration,
    data: {
      task: "highlight-choice",
    },
  };

  const tempation_choice = {
    type: HtmlKeyboardResponse,
    stimulus: () => {
      const selectedSide = jsPsych.data.get().filter({task: 'initial-choice'}).last(1).values()[0].side_picked;
      const leftObject = selectedSide === "left" ? 
        jsPsych.evaluateTimelineVariable("left_object") : 
        jsPsych.evaluateTimelineVariable("temptation_object");
      const rightObject = selectedSide === "right" ? 
        jsPsych.evaluateTimelineVariable("right_object") : 
        jsPsych.evaluateTimelineVariable("temptation_object");
      return getChoiceDisplayHTML(leftObject, rightObject, selectedSide);
    },
    choices: () => {
      const side_picked = jsPsych.data.get().filter({task: 'initial-choice'}).last(1).values()[0].side_picked;
      return side_picked === "left" ? [right_key] : [left_key];
    },
    trial_duration: () => {
      const delay = generateDelayFromExponential([min_delay, max_delay], p_never);
      return delay;
    },
    save_trial_parameters: {
      trial_duration: true
    },
    data: {
      task: "temptation-choice",
      object_picked: () => jsPsych.data.get().filter({task: 'initial-choice'}).last(1).values()[0].object_picked,
      value_picked: () => jsPsych.data.get().filter({task: 'initial-choice'}).last(1).values()[0].value_picked,
      temptation_object: () => jsPsych.evaluateTimelineVariable('temptation_object').icon,
      temptation_value: () => jsPsych.evaluateTimelineVariable('temptation_object').value,
    },
    on_finish: (data) => {
      if(data.rt){
        // this means they picked the temptation object
        data.reward = data.temptation_value;
      } else {
        // no response
        // if the trial didn't max out, they get the original reward
        if(data.trial_duration < max_delay){
          data.reward = data.value_picked;
        } else {
          // otherwise they get nothing
          data.reward = 0;
        }
      }
    },
  };

  const feedback = {
    type: HtmlKeyboardResponse,
    stimulus: () => {
      const last_3 = jsPsych.data.get().last(3);
      let value;
      if(last_3.filter({task: "temptation-choice"}).count() == 1){
        value = last_3.filter({task: "temptation-choice"}).values()[0].reward;
      } else {
        value = last_3.filter({task: "initial-choice"}).values()[0].value_picked;
      }
      // show value copies of the reward_object
      const html = `<div style="display: flex; justify-content: center;">${
        Array(value)
        .fill(svgDictionary[reward_object])
        .join("")
      }</div>`;
      return html;
    },
    choices: "NO_KEYS",
    trial_duration: feedback_duration,
  };

  const timeline = {
    timeline: [fixation, choice, highlight_choice, tempation_choice, feedback],
    timeline_variables: trial_params,
    randomize_order: true,
  }

  return timeline;
}

/**
 *  timing and parameter dictionaries
event_timings = {
    'fix_time': .5,
    'post_selection_time': .3,
    'feedback_time': 1,
    'ITI': .3
}
 */

export const timelineUnits = {};

/**
 * Generate delays from truncated exponential distribution with constant hazard rate
 * 
 * @param delayRange - Array containing the minimum and maximum delay values [min, max]
 * @param pNever - Probability (between 0 and 1) that the event will never occur
 * @returns A tuple containing [delay length, boolean indicating if the event never occurs]
 */
function generateDelayFromExponential(
  delayRange: [number, number], 
  pNever: number
): number {
  const lambdaParam = 1 / (delayRange[1] - delayRange[0]);
  
  const u = Math.random();
  const F1 = 1 - Math.exp(-lambdaParam * (delayRange[0] - delayRange[0]));
  const F2 = 1 - Math.exp(-lambdaParam * (delayRange[1] - delayRange[0]));
  let delayLen = delayRange[0] - (1/lambdaParam) * Math.log(1 - u * (F2 - F1) - F1);
  delayLen = Number(delayLen.toFixed(3));
  
  const never = Math.random() < pNever;
  if (never) {
    delayLen = Math.max(...delayRange);
  }
  
  return delayLen;
}

export const utils = {
  generateDelayFromExponential,
};
