import { JsPsych } from "jspsych";
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'

/* internal constants */
const KEYPRESS_TO_NEXT_SLIDE: String = 'Press <span style="color: red"><strong>any key</strong></span> to move to the next slide.';

enum StimulusBox {
    Default = `<div class="jspsych-spatial-cueing-target-container"><p class="target"></p></div>`,
    Highlighted = `<div class="jspsych-spatial-cueing-target-container-bold"><p class="target"></p></div>`,
    WithStimulus = `<div class="jspsych-spatial-cueing-target-container-stimulus"><p class="target">X</p></div>`,
    WithStimulusHighlighted = `<div class="jspsych-spatial-cueing-target-container-bold"><p class="target">X</p></div>`
};

enum FixationBox {
    NoCue = `<div class="jspsych-spatial-cueing-fixation-container"><p>&nbsp</p><p class="fixation">+</p><p>&nbsp</p></div>`,
    LeftCue = `<div class="jspsych-spatial-cueing-fixation-container"><p>←</p><p class="fixation">+</p><p>&nbsp</p></div>`,
    RightCue = `<div class="jspsych-spatial-cueing-fixation-container"><p>→</p><p class="fixation">+</p><p>&nbsp</p></div>`,
    BiCue = `<div class="jspsych-spatial-cueing-fixation-container"><p>↔︎</p><p class="fixation">+</p><p>&nbsp</p></div>`,
};

enum Direction {
    Left = -1,
    Right = 1,
    Bi = 2,
    None = 0
};

enum Validity {
    Valid = 1,
    Invalid = -1,
    Neutral = 0,
    None = -2,
};

const ALL_TEST_COMBOS = [
    {
        validity: Validity.Valid,
        stimulus_direction: Direction.Left,
    },
    {
        validity: Validity.Valid,
        stimulus_direction: Direction.Right,
    },
    {
        validity: Validity.Invalid,
        stimulus_direction: Direction.Left,
    },
    {
        validity: Validity.Invalid,
        stimulus_direction: Direction.Right,
    },
    {
        validity: Validity.Neutral,
        stimulus_direction: Direction.Left,
    },
    {
        validity: Validity.Neutral,
        stimulus_direction: Direction.Right,
    }
];

// function that generate start instructions
function showStartInstruction(endogenous_cue: boolean, blank_period: number, cue_period: number) {
    const start_instruction = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            return (
                `<div class="jspsych-spatial-cueing-instruction"><h3>This is a demo of the Posner spatial cueing task</h3>` +
                `<p>In each trial, you will see a fixation cross in the center and two empty boxes on the left and right of the cross.\n` +
                (endogenous_cue
                    ? `After ` +
                      blank_period +
                      `seconds, you will see an arrow pointing left, right or both directions appear on top of the fixation cross.\n`
                    : `After ` +
                      blank_period +
                      `seconds, you will see either the left, right or both boxes darken slightly.\n`) +
                `Then after ` +
                cue_period +
                `seconds, you will see a black 'X' appear in either one of the boxes.\n` +
                (endogenous_cue
                    ? `Most of the time, the location of the 'X' matches the direction the arrow is pointing at.\n` +
                      `However, sometimes they do not match. For example, sometimes the arrow points to both directions,` +
                      `but the 'X' can only be in one box. Another example would be if the arrow points left, but the 'X' is in the right box.\n`
                    : `Most of the time, the 'X' appears in the darkened box.\n` +
                      `However, sometimes it may appear in the other, non-darkened box.`) +
                `Your task is to respond as quickly as possible when you see the 'X'. If it appears in the left box, press 'f' on your keyboard. If it appears in the right box, press 'j'.</p>` +
                KEYPRESS_TO_NEXT_SLIDE + `</div>`
            );
        },
    };

    return start_instruction;
};

// function that generate end instruction
function showEndInstruction() {
    const end_instruction = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<div class="jspsych-spatial-cueing-instruction">
        <h3>That is the end of the demo.</h3>
        <p>Thank you for participating!</p></div>
    `,
    };

    return end_instruction;
}

// function that generate blank template
function makeDefaultTemplate(blank_period: number) {
    const stimulus = `<div class="jspsych-spatial-cueing-container">` + StimulusBox.Default + FixationBox.NoCue + StimulusBox.Default + '</div>';
    const default_template = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: stimulus,
        trial_duration: blank_period,
        choices: "NO_KEYS"
    };

    return default_template;
};

// function that generate endogenous cue
function makeEndogenousCue(jsPsych: JsPsych, cue_period: number) {
    const endogenous_cue = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            const validity = jsPsych.evaluateTimelineVariable("validity");
            const stimulus_direction = jsPsych.evaluateTimelineVariable("stimulus_direction");
            const cue_direction = cueDirectionMapper(validity, stimulus_direction);

            var stimulus = `<div class="jspsych-spatial-cueing-container">` + StimulusBox.Default;
            switch (cue_direction) {
                case Direction.Left:
                    stimulus += FixationBox.LeftCue;
                    break;
                case Direction.Right:
                    stimulus += FixationBox.RightCue;
                    break;
                case Direction.Bi:
                    stimulus += FixationBox.BiCue;
                    break;
                default:
                    stimulus += FixationBox.NoCue;
            };
            stimulus += StimulusBox.Default + `</div>`;

            return stimulus;
        },
        trial_duration: cue_period,
        choices: "NO_KEYS"
    };

    return endogenous_cue;
};

// function that generate exogenous cue
function makeExogenousCue(jsPsych: JsPsych, cue_period: number) {
    const exogenous_cue = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            const validity = jsPsych.evaluateTimelineVariable("validity");
            const stimulus_direction = jsPsych.evaluateTimelineVariable("stimulus_direction");
            const cue_direction = cueDirectionMapper(validity, stimulus_direction);

            var stimulus = `<div class="jspsych-spatial-cueing-container">`
                + (cue_direction == Direction.Left || cue_direction == Direction.Bi ? StimulusBox.Highlighted : StimulusBox.Default)
                + FixationBox.NoCue
                + (cue_direction == Direction.Right || cue_direction == Direction.Bi ? StimulusBox.Highlighted : StimulusBox.Default)
                + `</div>`;
            
            return stimulus;
        },
        trial_duration: cue_period,
        choices: "NO_KEYS"
    };

    return exogenous_cue;
};

// function that call the cue maker based on endogenous vs exogenous
function makeCue(jsPsych: JsPsych, endogenous_cue: boolean, cue_period: number) {
    return endogenous_cue ? makeEndogenousCue(jsPsych, cue_period) : makeExogenousCue(jsPsych, cue_period);
};

// function that generate exogenous stimulus
function makeExogenousStimulus(jsPsych: JsPsych) {
    const exogenous_stimulus = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            const validity = jsPsych.evaluateTimelineVariable("validity");
            const stimulus_direction = jsPsych.evaluateTimelineVariable("stimulus_direction");
            const cue_direction = cueDirectionMapper(validity, stimulus_direction);

            var stimulus = `<div class="jspsych-spatial-cueing-container">`;
            if (cue_direction == Direction.Left || cue_direction == Direction.Bi) {
                stimulus += jsPsych.evaluateTimelineVariable("stimulus_direction") == Direction.Left ? StimulusBox.WithStimulusHighlighted : StimulusBox.Highlighted;
            }
            else if (jsPsych.evaluateTimelineVariable("stimulus_direction") == Direction.Left) {
                stimulus += StimulusBox.WithStimulus;
            }
            else {
                stimulus += StimulusBox.Default;
            }

            stimulus += FixationBox.NoCue;

            if (cue_direction == Direction.Right || cue_direction == Direction.Bi) {
                stimulus += jsPsych.evaluateTimelineVariable("stimulus_direction") == Direction.Right ? StimulusBox.WithStimulusHighlighted : StimulusBox.Highlighted;
            }
            else if (jsPsych.evaluateTimelineVariable("stimulus_direction") == Direction.Right) {
                stimulus += StimulusBox.WithStimulus;
            }
            else {
                stimulus += StimulusBox.Default;
            }

            stimulus += `</div>`;

            return stimulus;
        },
        choices: ['f', 'j'],
        data: {
            task: "stimulus",
            cue_type: "exogenous",
            correct_response: () => {
                return jsPsych.evaluateTimelineVariable("stimulus_direction") == Direction.Left ? 'f' : 'j';
            }
        },
        on_finish: function (data: any) {
            data.correct = jsPsych.pluginAPI.compareKeys(
                data.response,
                data.correct_response
            );
        }
    };

    return exogenous_stimulus;
};

// function that generate endogenous stimulus
function makeEndogenousStimulus(jsPsych: JsPsych) {
    const endogenous_stimulus = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            const validity = jsPsych.evaluateTimelineVariable("validity");
            const stimulus_direction = jsPsych.evaluateTimelineVariable("stimulus_direction");
            const cue_direction = cueDirectionMapper(validity, stimulus_direction);

            var stimulus = `<div class="jspsych-spatial-cueing-container">` + (jsPsych.evaluateTimelineVariable("stimulus_direction") == Direction.Left ? StimulusBox.WithStimulus : StimulusBox.Default);    
            switch (cue_direction) {
                case Direction.Left:
                    stimulus += FixationBox.LeftCue;
                    break;
                case Direction.Right:
                    stimulus += FixationBox.RightCue;
                    break;
                case Direction.Bi:
                    stimulus += FixationBox.BiCue;
                    break;
                default:
                    stimulus += FixationBox.NoCue;
                    break;
            };

            stimulus += (jsPsych.evaluateTimelineVariable("stimulus_direction") == Direction.Right ? StimulusBox.WithStimulus : StimulusBox.Default) + `</div>`;
            
            return stimulus;
        },
        choices: ['f', 'j'],
        data: {
            task: "stimulus",
            cue_type: "endogenous",
            correct_response: () => {
                return jsPsych.evaluateTimelineVariable("stimulus_direction") == Direction.Left ? 'f' : 'j';
            }
        },
        on_finish: function (data: any) {
            data.correct = jsPsych.pluginAPI.compareKeys(
                data.response,
                data.correct_response
            );
        }
    };

    return endogenous_stimulus;
};

// function to map stimulus direction to cue direction based on cue validity
function cueDirectionMapper(validity: Validity, stimulus_direction: Direction) {
    switch (validity) {
        case Validity.Valid:
            return stimulus_direction;
        case Validity.Invalid:
            return stimulus_direction * -1;
        case Validity.Neutral:
            return Direction.Bi;
        case Validity.None:
            return Direction.None;
        default:
            return Direction.None;
    };
};

// function that call the stimulus maker based on endogenous vs exogenous
function makeStimulus(jsPsych: JsPsych, endogenous_cue: boolean) {
    return endogenous_cue ? makeEndogenousStimulus(jsPsych) : makeExogenousStimulus(jsPsych);
};


// make a trial consisting of blank, cue and stimulus
function createTrialTimeline(jsPsych: JsPsych, endogenous_cue: boolean, blank_period: number, cue_period: number) {
    const single_trial_timeline = {
        timeline: [
            makeDefaultTemplate(blank_period),
            makeCue(jsPsych, endogenous_cue, cue_period),
            makeStimulus(jsPsych, endogenous_cue)
        ]
    };

    return single_trial_timeline;
};

// generate a Posner spatial cueing task timeline
export function createTimeline(
    jsPsych: JsPsych, {
        endogenous_cue = false,
        blank_period = 2000,
        cue_period = 2000,
        num_trials = 60,        // must be divisible by 6
        valid_proportion = 0.8
    }: {
        endogenous_cue?: boolean,
        blank_period?: number,
        cue_period?: number,
        num_trials?: number,
        valid_proportion?: number
        } = {})
    {
        jsPsych = jsPsych;
        const num_each_valid_trial_type = num_trials * valid_proportion / 2;
        const num_each_invalid_trial_type = (num_trials - (num_each_valid_trial_type * 2)) / 4;
        var weights: number[] = [
            num_each_valid_trial_type, num_each_valid_trial_type,
            num_each_invalid_trial_type, num_each_invalid_trial_type,
            num_each_invalid_trial_type, num_each_invalid_trial_type
        ];

        const spatial_cueing_timeline = {
            timeline: [
                createTrialTimeline(jsPsych, endogenous_cue, blank_period, cue_period),
            ],
            timeline_variables: ALL_TEST_COMBOS,
            sample: {
                type: "with-replacement",
                size: num_trials,
                weights: weights
            }
        };

        return spatial_cueing_timeline;
};

export const timelineUnits = {
    createTrialTimeline
};

export const utils = {
    showStartInstruction,
    showEndInstruction,
    makeDefaultTemplate,
    cueDirectionMapper,
    makeEndogenousCue,
    makeExogenousCue,
    makeCue,
    makeExogenousStimulus,
    makeEndogenousStimulus,
    makeStimulus
}