import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'

export function createTimeline(jsPsych: any, 
    stimuli: any,
    font: number = 48,  
    trial_duration: number = 10000,
    post_trial_gap: number = 500, 
    fixation_duration: number = 500,
    randomize_trials: boolean = true, 
) {

    const timeline = []

    const fixation = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<p style="font-size: 48px; color: gray;">+</p>`,
        choices: "NO_KEYS",
        trial_duration: fixation_duration, 
    }

    const trial = {
        type: jsPsychHtmlKeyboardResponse, 
        stimulus: function() {
            console.log("Stimuli:", stimuli);
            console.log("color", jsPsych.evaluateTimelineVariable('color'))
            return `<p style="color:${jsPsych.evaluateTimelineVariable('color')}; font-size:${font}px;">${jsPsych.evaluateTimelineVariable('word')}</p>`;
        },
        choices: "NO_KEYS", 
        trial_duration: trial_duration, 
        post_trial_gap: post_trial_gap, 
    }

    const full_trial = {
        timeline: [fixation, trial], 
        timeline_variables: stimuli, 
        randomize_order: randomize_trials, 
    }  

    timeline.push(full_trial)

    return timeline
}