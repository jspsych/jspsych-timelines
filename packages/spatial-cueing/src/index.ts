import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { JsPsych } from "jspsych";

interface options {
    exogenous: boolean;
    endogenous: boolean;
    validityWeights: number[];
    cueHTML: {
        endogenous: {
            left: string;
            right: string;
        };
        exogenous: {
            left: string;
            right: string;
            both: string;
        };
    }
}

const defaultOptions: options = {
    exogenous: false,
    endogenous: true,
    validityWeights: [1, 1, 1],
    cueHTML: {
        endogenous: {
            left: 'jspsych-spatial-cueing-target-container',
            right: 'jspsych-spatial-cueing-target-container'
        },
        exogenous: {
            left: '←',
            right: '→',
            both: '↔︎'
        }
    }
}

const stimulus = {
    LeftBox: function(cueType, cueSide, targetSide) {
        if (cueType == "endo") {
            console.log(cueSide);
            return `
            <div class=${cueSide == -1 ||Math.abs(cueSide) == 2 ? 
                'jspsych-spatial-cueing-target-container-bold' : 
                'jspsych-spatial-cueing-target-container'}>
                <p class="target">${targetSide == -1 ?
                    'X' :
                    '&nbsp'}</p>
            </div>`
        } else {
            return `
            <div class='jspsych-spatial-cueing-target-container'>
                <p class="target">${targetSide == -1 ?
                    'X' :
                    '&nbsp'}</p>
            </div>`
        }
    },
    Fixation: function(cueType, cueSide) {
        if (cueType == "exo") {
            // this could be consolidated into an options argument for users
            const cueMap = new Map([
                [-1, "←"],
                [1, "→"],
                [2, "↔︎"],
                [-2, "↔︎"]
            ]);
            return `
            <div class="jspsych-spatial-cueing-fixation-container">
                <p>${cueMap.get(cueSide)}</p>
                <p class="fixation">+</p>
                <p>&nbsp</p>
            </div>`
        } else {
        return `
        <div class="jspsych-spatial-cueing-fixation-container">
            <p>&nbsp</p>
            <p class="fixation">+</p>
            <p>&nbsp</p>
        </div>`
        }
    },
    RightBox: function(cueType, cueSide, targetSide) {
        if (cueType == "endo") {
            console.log(cueSide);
            return `
            <div class=${cueSide == 1 || Math.abs(cueSide) == 2 ? 
                'jspsych-spatial-cueing-target-container-bold' : 
                'jspsych-spatial-cueing-target-container'}>
                <p class="target">${targetSide == 1 ?
                    'X' :
                    '&nbsp'}</p>
            </div>`
        } else {
            return `
            <div class='jspsych-spatial-cueing-target-container'>
                <p class="target">${targetSide == 1 ?
                    'X' :
                    '&nbsp'}</p>
            </div>`
        }
    }
}

function buildVariables(options) {
    const variables = [];
    
    var builtin = [
        { cueValidity: 1, targetSide: 1 },
        { cueValidity: -1, targetSide: 1 },
        { cueValidity: 2, targetSide: 1 },
        { cueValidity: 1, targetSide: -1 },
        { cueValidity: -1, targetSide: -1 },
        { cueValidity: 2, targetSide: -1 },
    ];

    if (options.exogenous) {
        const cue = builtin.map((variable) => {
            variable['cueType'] = "exo";
        })
        variables.push(...builtin);
    }
    if (options.endogenous) {
        const cue = builtin.map((variable) => {
            variable['cueType'] = "endo";
        })
        variables.push(...builtin);
    }

    console.log(variables) // get rid of this
    return variables;
} 

function generateStimulus(cueType, cueSide, targetSide) {
    return `<div class="jspsych-spatial-cueing-container">`
    + stimulus.LeftBox(cueType, cueSide, targetSide) 
    + stimulus.Fixation(cueType, cueSide) 
    + stimulus.RightBox(cueType, cueSide, targetSide)
    + `</div>`;
    
}

function showBlank(jsPsych: JsPsych) {
    return {
      type: jsPsychHtmlKeyboardResponse,
      
      //ask Josh why evaluateTimelineVariable only works in arrow function, not when calling generateCue directly
      stimulus: () => {
        return generateStimulus(0, 0, 0)
      },
      choices: "NO_KEYS",
      trial_duration: 1000,
    }
}

function placeCue(jsPsych: JsPsych) {
    return {
      type: jsPsychHtmlKeyboardResponse,
      
      //ask Josh why evaluateTimelineVariable only works in arrow function, not when calling generateCue directly
      stimulus: () => {
        var cueType = jsPsych.evaluateTimelineVariable("cueType");
        var targetSide = jsPsych.evaluateTimelineVariable("targetSide");
        var cueValidity = jsPsych.evaluateTimelineVariable("cueValidity");
        var cueSide = cueValidity * targetSide;
        console.log(cueType, cueSide, targetSide) // get rid of this

        return generateStimulus(cueType, cueSide, 0)
      },
      choices: "NO_KEYS",
      trial_duration: jsPsych.randomization.sampleWithReplacement([500, 750, 1000, 1250], 1),
    }
}

function placeTarget(jsPsych: JsPsych) {
    return {
      type: jsPsychHtmlKeyboardResponse,
      
      //ask Josh why evaluateTimelineVariable only works in arrow function, not when calling generateCue directly
      stimulus: () => {
        var cueType = jsPsych.evaluateTimelineVariable("cueType");
        var cueValidity = jsPsych.evaluateTimelineVariable("cueValidity");
        var targetSide = jsPsych.evaluateTimelineVariable("targetSide");
        var cueSide = cueValidity * targetSide;

        return generateStimulus(cueType, cueSide, targetSide)
      },
      choices: ["f", "j"]
    }
}

function buildTrial(jsPsych: JsPsych) {

    return {
        timeline: [
            showBlank(jsPsych), 
            placeCue(jsPsych), 
            placeTarget(jsPsych)
        ], // consider restructuring this entirely as a nested timeline, without the separate placeCue and placeTarget functions
    }
}

export function createTimeline(
        jsPsych: JsPsych, 
        options: Partial<options> = defaultOptions
    ) {
    return {
        timeline: [buildTrial(jsPsych)],
        timeline_variables: buildVariables(options),
        sample: {
            type: "with-replacement", // maybe try alternate-groups between endo and exo?
            size: 10,
        }
    }
}

export const timelineUnits = {
    buildTrial,

}

export const utils = {
    generateStimulus,
    showBlank,
    placeCue,
    placeTarget,
}