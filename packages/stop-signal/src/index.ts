import { JsPsych } from "jspsych"

import jsPsychPreload from "@jspsych/plugin-preload"
import jsPsychImageButtonResponse from "@jspsych/plugin-image-button-response"
import jsPsychStopSignal from "@jspsych-contrib/plugin-stop-signal"

/* Turns svg image strings into urls */
function get_svg_url(svgString){
    var blob =  new Blob([svgString], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob)
}

const plus = get_svg_url('<svg version="1.1" viewBox="0.0 0.0 480.0 480.0" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="p.0"><path d="m0 0l480.0 0l0 480.0l-480.0 0l0 -480.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#p.0)"><path fill="#ffffff" d="m0 0l480.0 0l0 480.0l-480.0 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m17.023623 240.0l0 0c0 -120.72858 99.829926 -218.59842 222.97638 -218.59842l0 0c59.137024 0 115.85193 23.03084 157.66812 64.026c41.816162 40.995155 65.30826 96.59652 65.30826 154.57242l0 0c0 120.72858 -99.829926 218.59842 -222.97638 218.59842l0 0c-123.146454 0 -222.97638 -97.86984 -222.97638 -218.59842z" fill-rule="evenodd"/><path stroke="#000000" stroke-width="16.0" stroke-linejoin="round" stroke-linecap="butt" d="m17.023623 240.0l0 0c0 -120.72858 99.829926 -218.59842 222.97638 -218.59842l0 0c59.137024 0 115.85193 23.03084 157.66812 64.026c41.816162 40.995155 65.30826 96.59652 65.30826 154.57242l0 0c0 120.72858 -99.829926 218.59842 -222.97638 218.59842l0 0c-123.146454 0 -222.97638 -97.86984 -222.97638 -218.59842z" fill-rule="evenodd"/><path fill="#000000" d="m175.8033 220.30988l44.506577 0l0 -41.83316l39.38025 0l0 41.83316l44.50656 0l0 39.38025l-44.50656 0l0 41.83316l-39.38025 0l0 -41.83316l-44.506577 0z" fill-rule="evenodd"/></g></svg>')
const left = get_svg_url('<svg version="1.1" viewBox="0.0 0.0 480.0 480.0" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="g390c7c94958_0_8.0"><path d="m0 0l480.0 0l0 480.0l-480.0 0l0 -480.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#g390c7c94958_0_8.0)"><path fill="#ffffff" d="m0 0l480.0 0l0 480.0l-480.0 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m17.023623 240.0l0 0c0 -120.72858 99.829926 -218.59842 222.97638 -218.59842l0 0c59.137024 0 115.85193 23.03084 157.66812 64.026c41.816162 40.995155 65.30826 96.59652 65.30826 154.57242l0 0c0 120.72858 -99.829926 218.59842 -222.97638 218.59842l0 0c-123.146454 0 -222.97638 -97.86984 -222.97638 -218.59842z" fill-rule="evenodd"/><path stroke="#000000" stroke-width="16.0" stroke-linejoin="round" stroke-linecap="butt" d="m17.023623 240.0l0 0c0 -120.72858 99.829926 -218.59842 222.97638 -218.59842l0 0c59.137024 0 115.85193 23.03084 157.66812 64.026c41.816162 40.995155 65.30826 96.59652 65.30826 154.57242l0 0c0 120.72858 -99.829926 218.59842 -222.97638 218.59842l0 0c-123.146454 0 -222.97638 -97.86984 -222.97638 -218.59842z" fill-rule="evenodd"/><path fill="#4a86e8" d="m344.80316 280.7953l-128.01576 0l0 40.795258l-81.590546 -81.590546l81.590546 -81.590546l0 40.795273l128.01576 0z" fill-rule="evenodd"/></g></svg>')
const right = get_svg_url('<svg version="1.1" viewBox="0.0 0.0 480.0 480.0" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="g390c7c94958_0_2.0"><path d="m0 0l480.0 0l0 480.0l-480.0 0l0 -480.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#g390c7c94958_0_2.0)"><path fill="#ffffff" d="m0 0l480.0 0l0 480.0l-480.0 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m17.023623 240.0l0 0c0 -120.72858 99.829926 -218.59842 222.97638 -218.59842l0 0c59.137024 0 115.85193 23.03084 157.66812 64.026c41.816162 40.995155 65.30826 96.59652 65.30826 154.57242l0 0c0 120.72858 -99.829926 218.59842 -222.97638 218.59842l0 0c-123.146454 0 -222.97638 -97.86984 -222.97638 -218.59842z" fill-rule="evenodd"/><path stroke="#000000" stroke-width="16.0" stroke-linejoin="round" stroke-linecap="butt" d="m17.023623 240.0l0 0c0 -120.72858 99.829926 -218.59842 222.97638 -218.59842l0 0c59.137024 0 115.85193 23.03084 157.66812 64.026c41.816162 40.995155 65.30826 96.59652 65.30826 154.57242l0 0c0 120.72858 -99.829926 218.59842 -222.97638 218.59842l0 0c-123.146454 0 -222.97638 -97.86984 -222.97638 -218.59842z" fill-rule="evenodd"/><path fill="#4a86e8" d="m135.19685 199.20473l128.01573 0l0 -40.795273l81.590576 81.590546l-81.590576 81.590546l0 -40.795258l-128.01573 0z" fill-rule="evenodd"/></g></svg>')
const left_stop = get_svg_url('<svg version="1.1" viewBox="0.0 0.0 480.0 480.0" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="g390c7c94958_0_21.0"><path d="m0 0l480.0 0l0 480.0l-480.0 0l0 -480.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#g390c7c94958_0_21.0)"><path fill="#ffffff" d="m0 0l480.0 0l0 480.0l-480.0 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m17.023623 240.0l0 0c0 -120.72858 99.829926 -218.59842 222.97638 -218.59842l0 0c59.137024 0 115.85193 23.03084 157.66812 64.026c41.816162 40.995155 65.30826 96.59652 65.30826 154.57242l0 0c0 120.72858 -99.829926 218.59842 -222.97638 218.59842l0 0c-123.146454 0 -222.97638 -97.86984 -222.97638 -218.59842z" fill-rule="evenodd"/><path stroke="#980000" stroke-width="16.0" stroke-linejoin="round" stroke-linecap="butt" d="m17.023623 240.0l0 0c0 -120.72858 99.829926 -218.59842 222.97638 -218.59842l0 0c59.137024 0 115.85193 23.03084 157.66812 64.026c41.816162 40.995155 65.30826 96.59652 65.30826 154.57242l0 0c0 120.72858 -99.829926 218.59842 -222.97638 218.59842l0 0c-123.146454 0 -222.97638 -97.86984 -222.97638 -218.59842z" fill-rule="evenodd"/><path fill="#4a86e8" d="m344.7991 280.80173l-128.01576 0l0 40.795288l-81.590546 -81.59056l81.590546 -81.590546l0 40.795273l128.01576 0z" fill-rule="evenodd"/><path fill="#980000" d="m86.77571 91.3758l27.433067 -23.842514l279.02362 321.10236l-27.433075 23.84253z" fill-rule="evenodd"/><path fill="#980000" d="m399.40686 82.643036l23.370087 27.842522l-337.82678 283.24408l-23.370079 -27.842499z" fill-rule="evenodd"/></g></svg>')
const right_stop = get_svg_url('<svg version="1.1" viewBox="0.0 0.0 480.0 480.0" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="g390c7c94958_0_13.0"><path d="m0 0l480.0 0l0 480.0l-480.0 0l0 -480.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#g390c7c94958_0_13.0)"><path fill="#ffffff" d="m0 0l480.0 0l0 480.0l-480.0 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m17.023623 240.0l0 0c0 -120.72858 99.829926 -218.59842 222.97638 -218.59842l0 0c59.137024 0 115.85193 23.03084 157.66812 64.026c41.816162 40.995155 65.30826 96.59652 65.30826 154.57242l0 0c0 120.72858 -99.829926 218.59842 -222.97638 218.59842l0 0c-123.146454 0 -222.97638 -97.86984 -222.97638 -218.59842z" fill-rule="evenodd"/><path stroke="#980000" stroke-width="16.0" stroke-linejoin="round" stroke-linecap="butt" d="m17.023623 240.0l0 0c0 -120.72858 99.829926 -218.59842 222.97638 -218.59842l0 0c59.137024 0 115.85193 23.03084 157.66812 64.026c41.816162 40.995155 65.30826 96.59652 65.30826 154.57242l0 0c0 120.72858 -99.829926 218.59842 -222.97638 218.59842l0 0c-123.146454 0 -222.97638 -97.86984 -222.97638 -218.59842z" fill-rule="evenodd"/><path fill="#4a86e8" d="m135.19685 199.20473l128.01573 0l0 -40.795273l81.590576 81.590546l-81.590576 81.590546l0 -40.795258l-128.01573 0z" fill-rule="evenodd"/><path fill="#980000" d="m86.77571 91.3758l27.433067 -23.842514l279.02362 321.10236l-27.433075 23.84253z" fill-rule="evenodd"/><path fill="#980000" d="m399.40686 82.643036l23.370087 27.842522l-337.82678 283.24408l-23.370079 -27.842499z" fill-rule="evenodd"/></g></svg>')


/* Formats the buttons */
function button_design(choice, index) {
    var html = ``
    if (index == 0){
        html = `<button style = "position: fixed; bottom: 30px; left: 15vw; padding: 2vh 10vw"> ${choice} </button>`
    }
    else{
        html = `<button style = "position: fixed; bottom: 30px; right: 15vw; padding: 2vh 10vw"> ${choice} </button>`
    }
    return html
}

export function createTimeline(jsPsych:JsPsych, {
    buttons = ['Left', 'Right'],
    image_width = 200,
    image_height = null,
    current_delay = 500,
    delay_change = 50,
    delay_adaptive = true,
    min_delay = 20,
    max_delay = 980,
    trial_duration = 1000,
    total_trials = 16,
    stop_percent = 0.25,
} : {
    buttons?: String[],
    image_width?: number,
    image_height?: number,
    current_delay?: number,
    delay_change?: number,
    delay_adaptive?: boolean,
    min_delay?: number,
    max_delay?: number,
    trial_duration?: number,
    total_trials?: number,
    stop_percent?: number,
    
} = {})
{ 
    /* makes sure the max_delay is no longer than trial_duration */
    if (trial_duration < max_delay){
        max_delay = trial_duration
    }

    /* loads images */
    var preload = {
        type: jsPsychPreload,
        images: [plus, left, right, left_stop, right_stop]
    };
    

    /* displays a + between trials */
    var fixation = {
        type: jsPsychImageButtonResponse,
        stimulus: plus,
        stimulus_width: image_width,
        stimulus_height: image_height,
        choices: [],
        trial_duration: trial_duration,
        data: {
            task: 'fixation'
        }
    };

   

    /* defines the number of stop and go trials */
    var stop_trial_count = Math.floor(total_trials * stop_percent)
    var go_trial_count = total_trials - stop_trial_count

    /* Defines possible parameters for the tests.
    Each stimulus is an image of an arrow followed by the same image
    or a matching stop signal image. */
    var stop_trials = [
        { stimulus: [right, right_stop], correct_response: "none"},
        { stimulus: [left, left_stop], correct_response: "none"}

    ];
    var go_trials = [
        { stimulus: [right], correct_response: 1},
        { stimulus: [left], correct_response: 0}
    ];

    var test_stimuli = [];

    /* adds stop_trial_count number of stop_trials to the test_simili */
   for (let i = 0; i<stop_trial_count; i++){
    test_stimuli.push(stop_trials[Math.floor(Math.random() * 2)])
   }

    /* adds go_trial_count number of go_trials to the test_simili */
   for (let i = 0; i<go_trial_count; i++){
    test_stimuli.push(go_trials[Math.floor(Math.random() * 2)])
   }

    /* defines a test */
    var test = {
        type: jsPsychStopSignal,
        stimuli: jsPsych.timelineVariable('stimulus'),
        trial_duration: trial_duration,
        /* If delay_adaptive,
        this function increases the delay if the last stop trial was successful
        and decreases the delay if it was not  */
        frame_delay: function() {
            if (delay_adaptive) {
                var data = jsPsych.data.get().filter({task: "response"}).last(1).values()[0];
                console.log(data)
                if (data && data.correct_response == "none") {
                    if (data.response == null) {
                        var new_delay = current_delay + delay_change

                        if (new_delay < max_delay) {
                            current_delay = new_delay
                        }
                        else {
                            current_delay = max_delay
                        }
                    }
                    else {
                        var new_delay = current_delay - delay_change

                        if (new_delay > min_delay)
                        {
                            current_delay = new_delay
                        }
                        else {
                            current_delay = min_delay
                        }
                       
                    }
                }
            }
            return current_delay;
            

        },
        stimulus_width: image_width,
        stimulus_height: image_height,
        multiple_responses: false,
        button_html: button_design,
        choices: buttons,
        data: {
            task: 'response',
            correct_response: jsPsych.timelineVariable('correct_response'),
        },
        /* Sets data.correct to whether the response was correct */
        on_finish: function(data){
            if (data.response == null) {
                data.correct = (data.correct_response == "none")

            }
            else {
                data.correct = (data.response == data.correct_response)
            }
        }
    }

    /* Each task consists of a wait (fixation) followed by the test */
    var test_procedure = {
        timeline: [fixation, test],
        timeline_variables: test_stimuli,
        randomize_order: true,
        repetitions: 1
    }
    
    const timeline_object = {
        timeline: [preload, test_procedure]
    }

    return timeline_object

}

export const timelineUnits = {}

export const utils = {}