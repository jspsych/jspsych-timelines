import { JsPsych } from "jspsych";
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'

const left_arrow = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path fill="black" d="M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z"/></svg>`;
const right_arrow = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path fill="black" d="m24 40-2.1-2.15L34.25 25.5H8v-3h26.25L21.9 10.15 24 8l16 16Z"/></svg>`;

function createFlankerStim(direction, congruent) {
  let html = `<div class="flanker-stim">`;
  if (congruent) {
    if (direction === "left") {
      html += `<span> ${left_arrow} ${left_arrow} ${left_arrow} ${left_arrow} ${left_arrow} </span>`;
    } else {
      html += `<span> ${right_arrow} ${right_arrow} ${right_arrow} ${right_arrow} ${right_arrow} </span>`;
    }
  } else {
    if (direction === "left") {
      html += `<span> ${right_arrow} ${right_arrow} ${left_arrow} ${right_arrow} ${right_arrow} </span>`;
    } else {
      html += `<span> ${left_arrow} ${left_arrow} ${right_arrow} ${left_arrow} ${left_arrow} </span>`;
    }
  }
  html += `</div>`;
  return html;
}

export function createTimeline(jsPsych: JsPsych, {
  fixation_duration = 500,
  n = 12,
} : {
  fixation_duration?: number,
  n?: number,
} = {}){
  
  const timeline_variables = [
    {direction: 'left', congruent: true},
    {direction: 'left', congruent: false},
    {direction: 'right', congruent: true},
    {direction: 'right', congruent: false},
  ]

  const trials = jsPsych.randomization.repeat(timeline_variables, Math.floor(n/4)).concat(jsPsych.randomization.sampleWithoutReplacement(timeline_variables, n%4));

  const fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '+',
    choices: "NONE",
    trial_duration: fixation_duration,
  }

  const flanker = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: ()=>{
      return createFlankerStim(jsPsych.timelineVariable('direction'), jsPsych.timelineVariable('congruent'))
    },
    choices: ['ArrowLeft', 'ArrowRight'],
  }

  const flanker_task = {
    timeline: [fixation, flanker],
    timeline_variables: trials,
    randomize_order: true
  }

  return flanker_task;
}