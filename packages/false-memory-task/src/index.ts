import { JsPsych } from "jspsych";
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychSurveyText from '@jspsych/plugin-survey-text';

/* constants */
const NUM_LIST_CEILING: number = 12;
const NUM_WORDS_IN_LIST_CEILING: number = 15;
const ALL_LIST_KENT_ROSANOFF_INDEX: number[] = [32, 45, 97, 89, 26, 53, 33, 42, 63, 44, 7, 85];  //randomly chosen
const ALL_LIST_INDEX_ARRAY: number[] = Array.from({length: 12}, (_, index) => index + 1);
const KEYPRESS_TO_NEXT_SLIDE: String = 'Press <span style="color: red"><strong>any key</strong></span> to move to the next slide.';

const ALL_LIST = [
    {
        lure: "citizen",
        word_list: ["USA", "man", "person", "American", "country", "alien", "people", "state", "votes", "patriot", "flag", "voter", "foreigner", "government", "America"]
    },
    {
        lure: "trouble",
        word_list: ["bad", "shooter", "worry", "danger", "sorrow", "fear", "school", "problem", "police", "fight", "sad", "happy", "difficulty", "peace", "hard"]
    },
    {
        lure: "king",
        word_list: ["queen", "England", "crown", "pin", "ruler", "Kong", "throne", "cards", "Tut", "rule", "subjects", "chess", "royal", "power", "county"]
    },
    {
        lure: "mutton",
        word_list: ["lamb", "sheep", "meat", "chops", "beef", "veal", "collar", "stew", "coat", "steak", "fur", "pork", "dog", "wool", "animal"]
    },
    {
        lure: "whistle",
        word_list: ["stop", "train", "noise", "sing", "blow", "tune", "sound", "shrill", "lips", "wolf", "loud", "call", "mouth", "cop", "horn"]
    },
    {
        lure: "street",
        word_list: ["Avenue", "oars", "lights", "city", "alley", "walk", "sign", "houses", "corner", "sidewalk", "town", "number", "scene", "drive", "name"]
    },
    {
        lure: "foot",
        word_list: ["shoes", "hand", "toes", "soldier", "feet", "ball", "ankle", "arm", "sore", "inches", "boot", "yard", "socks", "head", "hurt"]
    },
    {
        lure: "working",
        word_list: ["loafing", "sleeping", "playing", "resting", "labor", "lazy", "job", "tired", "hours", "rest", "fast", "busy", "pay", "doing", "studying"]
    },
    {
        lure: "stomach",
        word_list: ["ache", "intestine", "ulcer", "body", "organ", "pains", "hunger", "belly", "pump", "full", "digestion", "gut", "sick", "abdomen", "empty"]
    },
    {
        lure: "table",
        word_list: ["chair", "desk", "top", "legs", "eat", "cloth", "dishes", "wood", "dinner", "tennis", "maple", "door", "cup", "room", "fork"]
    },
    {
        lure: "bath",
        word_list: ["clean", "soap", "tub", "wash", "shower", "dirty", "dirt", "warm", "cleanliness", "hot", "towel", "cold", "bathtub", "bubble", "bathe"]
    },
    {
        lure: "lion",
        word_list: ["tiger", "roar", "cub", "den", "zoo", "jungle", "cage", "tamer", "mouse", "bear", "hearted", "mane", "Africa", "Leo", "growl"]
    }
];

/* internal vars */
var list_studied = [];
var test_stimuli = [];
var weights: number[] = [];

var list_num = 1;
var word_num = 0;

/* internal functions */
// helper function that gives error message if the studied and unstudied lists overlap
function checkListOverflowOverlap(list_studied_index_array: number[], list_unstudied_index_array: number[]) {
    if ((list_studied_index_array.length + list_unstudied_index_array.length) > NUM_LIST_CEILING) {
        //TODO: some kind of warning message
    };
    let listIntersection = list_studied_index_array.filter(x => list_unstudied_index_array.includes(x));
    if (listIntersection.length > 0) {
        //TODO: some kind of warning message
    };
};

// helper function to check if input number of words in lists exceed ceiling
function checkNumWordsOverflow(input_num_words: number) {
    if (input_num_words > NUM_WORDS_IN_LIST_CEILING) {
        //TODO: some kind of warning message
    };
};

function pushTestStimuliStudied(num_studied_lists: number, num_words_in_list: number, list_studied_index_array: number[], test_all_studied_lures: boolean){
    for (let i = 0; i < num_studied_lists; i++){
        var studied_list_to_add = ALL_LIST[list_studied_index_array[i] - 1];
        list_studied.push(studied_list_to_add);
        test_stimuli.push({
            stimulus: studied_list_to_add.lure,
            correct_response: 'j'
        });
        weights.push(test_all_studied_lures ? 99999 : 1);
        for (let j = 0; j < num_words_in_list; j++){
            test_stimuli.push({
                stimulus: studied_list_to_add.word_list[j],
                correct_response: 'f'
            })
            weights.push(1);
        }
    };
};

function pushTestStimuliUnstudied(num_unstudied_lists: number, num_words_in_list: number, list_unstudied_index_array: number[], test_all_unstudied_lures: boolean){
    for (let i = 0; i < num_unstudied_lists; i++){
        var unstudied_list_to_add = ALL_LIST[list_unstudied_index_array[i] - 1];
        test_stimuli.push({
            stimulus: unstudied_list_to_add.lure,
            correct_response: 'j'
        });
        weights.push(test_all_unstudied_lures ? 99999 : 1);
        for (let j = 0; j < num_words_in_list; j++){
            test_stimuli.push({
                stimulus: unstudied_list_to_add.word_list[j],
                correct_response: 'f'
            })
            weights.push(1);
        };
    };
};

/* timeline component generating functions */
// generate start instructions
function showStartInstruction(num_studied_lists: number, num_words_in_list: number, recall_period: number) {
    const stimulus = `<div class="jspsych-false-memory-instruction"><h3>This is a demo of the DRM false memory experiment paradigm.</h3>`
        + `<p>In the following trials, you will learn`
        + num_studied_lists
        + `lists of words, with each list containing`
        + num_words_in_list
        + `words.<br>`
        + `The words in each list will be presented one by one.</p>`
        + `<p>After each list is presented, you will be given an empty text box and`
        + (recall_period / 1000)
        + `seconds to freely recall as many words you can remember from the list as possible.`
        + `What you write in this text box will not be recorded, but please do not try to capture the words you recall in this box by taking a screenshot, writing them down on paper, etc.</p>`
        + `<p>Try to remember as many words from all the lists as possible!</p>`
        + `<p>` + KEYPRESS_TO_NEXT_SLIDE + `</p></div>`;
        
    const introduction = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            return stimulus;
        }
    };

    return introduction;
};

// generate a study trial for a list
function createListStudyTimelineUnit(
    jsPsych: JsPsych,
    num_words_in_list: number,
    word_show_period: number,
    list_title_card_period: number,
    list_end_card_period: number,
    recall_period: number,
    allow_recall: boolean) {
    
    // study through list of words in a single list
    const study_trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            return "<h1>" + jsPsych.timelineVariable("word_list")[word_num] + "</h1>";
        },
        choices: "NO_KEYS",
        trial_duration: word_show_period
    };
    
    const word_study_timeline = {
        timeline: [study_trial],
        timeline_variables: jsPsych.timelineVariable("word_list")[list_num],
        loop_function: () => {
            word_num++;
            return word_num < num_words_in_list;
        }
    };

    // wrap single list study with title cards and recall period
    const list_start_card = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            return "<h1> List " + list_num + "</h1>";
        },
        choices: "NO_KEYS",
        trial_duration: list_title_card_period
    };

    const list_end_card = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            return "<h1> End of List " + list_num + "</h1>";
        },
        choices: "NO_KEYS",
        on_finish: () => {
            list_num++;   
            word_num = 0;
        },
        trial_duration: list_end_card_period
    };

    const recall = {
        type: jsPsychSurveyText,
        on_start: () => {
            jsPsych.pluginAPI.setTimeout(() => {
              let element : HTMLFormElement = document.querySelector('#jspsych-survey-text-form');
              element.requestSubmit();
            }, recall_period)
        },
        questions: [
            { prompt: 'Use this space to recall as many words as you can from the previous list.<br>Please do not try to capture what you type.', rows: 5 }
        ]
    };

    const single_list_study_timeline = {
        timeline: [
            list_start_card,
            word_study_timeline,
            list_end_card,
            (allow_recall? recall : null)
        ]
    };

    return single_list_study_timeline;
};

// generate a series of study trials for a list of lists
function createListStudyTimeline(
    jsPsych: JsPsych,
    num_studied_lists: number,
    num_words_in_list: number,
    word_show_period: number,
    list_title_card_period: number,
    list_end_card_period: number,
    recall_period: number,
    allow_recall: boolean) {
    const all_list_study_timeline = {
        timeline: [createListStudyTimelineUnit(
            jsPsych,
            num_words_in_list,
            word_show_period,
            list_title_card_period,
            list_end_card_period,
            recall_period,
            allow_recall
        )],
        timeline_variables: list_studied,
        randomize_order: true,
        sample: {
            type: "without-replacement",
            size: num_studied_lists
        }
    };

    return all_list_study_timeline;
};

// generate instruction for break section
function showBreakTimelineInstruction(break_period: number) {
    const break_instruction = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            var stimulus = `<div class="jspsych-false-memory-instruction"><h2>That's all the lists!</h2>`
                + `<p>Now, take a short `
                + (break_period / 1000 / 60)
                + ` minute break.<br>`
                + `The experiment will automatically start after the timer reaches 0.`
                + `<p>`
                + KEYPRESS_TO_NEXT_SLIDE
                + `</p></div>`;
            
            return stimulus;
        }
    };
}

// generate a break timer
function createBreakTimeline(break_period: number) {
    const break_timer = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
            var break_period_min = Math.floor(break_period / 60000);
            var break_period_s = ((break_period / 1000) % 60);
            return "<h1>" + break_period_min + ":" + ((break_period_s < 10) ? "0" : "") + break_period_s + "</h1>";
        },
        choices: "NO_KEYS",
        trial_duration: 1000
    };

    const break_timer_wrapper_timeline = {
        timeline: [break_timer],
        loop_function: () => {
            break_period -= 1000;
            return break_period >= 0;
        }
    };
    
    const break_timeline = {
        timeline: [
            break_timer_wrapper_timeline
        ]
    };

    return break_timeline;
};

// function that generates the instructions for the test section
function showTestTimelineInstruction() {
    const test_instruction = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<div class="jspsych-false-memory-instruction">
        <h2>Welcome back!</h2>
        <p>Now, you will be shown a series of words.<br>
        Some are words that were in the lists you just studied, and some are not.<br>
        For each word, press '<strong>f</strong>' if you remember seeing it in one of the lists;<br>
        and press '<strong>j</strong>' if you do not.</p>
        <p>${KEYPRESS_TO_NEXT_SLIDE}</p></div>`
    };

    return test_instruction;
}

// generate a series of test trials for all studied/unstudied lures + words
function createTestTimeline(jsPsych: JsPsych, test_with_replacement: boolean, num_tests: number) {
    const test_trial_timeline = {
        timeline: [
            {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: () => {
                    return "<h1>" + jsPsych.timelineVariable("stimulus") + "</h1>";
                },
                choices: ['f', 'j'],
                data: {
                    task: "test_response",
                    correct_response: jsPsych.timelineVariable("correct_response"),
                },
                on_finish: function (data) {
                    data.correct = jsPsych.pluginAPI.compareKeys(
                        data.response,
                        data.correct_response
                    );
                }
            }
        ],
        timeline_variables: test_stimuli,
        sample: {
            type: (test_with_replacement ? 'with-replacement' : 'without-replacement'),
            size: num_tests,
            weights: weights
        }
    };
    
    return test_trial_timeline;
};

// generate the end instruction
function showEndInstruction() {
    const end_experiment_instruction = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<div class="jspsych-false-memory-instruction">
            <h2>That's the end of the experiment!</h2>
            <p>Thank you so much for participating in this demo of the DRM false memory experiment.<br>
            Goodbye!</p></div>
        `
    };

    return end_experiment_instruction;
}

// generate entire false memory task timeline
export function createTimeline(
    jsPsych: JsPsych, {
        list_studied_index_array = [1, 2, 3, 4, 5, 6],     // how to give option of letting these take the default value?
        list_unstudied_index_array = [7, 8, 9, 10, 11, 12],
        num_words_in_list = NUM_WORDS_IN_LIST_CEILING,
        num_tests = 90,
        list_title_card_period = 3000,
        list_end_card_period = 3000,
        word_show_period = 2000,
        recall_period = 30000,
        break_period = 120000,
        test_all_studied_lures = true,
        test_all_unstudied_lures = true,
        allow_recall = true,
        test_with_replacement = false
    }: {
        list_studied_index_array?: number[],
        list_unstudied_index_array?: number[],
        num_words_in_list?: number,
        num_tests?: number,
        list_title_card_period?: number,
        list_end_card_period?: number,
        word_show_period?: number,
        recall_period?: number,
        break_period?: number,
        test_all_studied_lures?: boolean,
        test_all_unstudied_lures?: boolean,
        allow_recall?: boolean,
        test_with_replacement?: boolean
    } = {})
{
        var num_studied_lists: number = list_studied_index_array.length;
        var num_unstudied_lists: number = list_unstudied_index_array.length;
        var num_tests: number = (num_studied_lists + num_unstudied_lists) * (num_words_in_list + 1);
    
        checkListOverflowOverlap(list_studied_index_array, list_unstudied_index_array);
        checkNumWordsOverflow(num_words_in_list);
        
        pushTestStimuliStudied(num_studied_lists, num_words_in_list, list_studied_index_array, test_all_studied_lures);
        pushTestStimuliUnstudied(num_unstudied_lists, num_words_in_list, list_unstudied_index_array, test_all_unstudied_lures);

        const false_memory_timeline = {
            timeline: [
                createListStudyTimeline(
                    jsPsych,
                    num_studied_lists,
                    num_words_in_list,
                    word_show_period,
                    list_title_card_period,
                    list_end_card_period,
                    recall_period,
                    allow_recall),
                createBreakTimeline(break_period),
                createTestTimeline(jsPsych, test_with_replacement, num_tests),
            ]
        };

        return false_memory_timeline;
};

export const timelineUnits = {
    createListStudyTimeline,
    createListStudyTimelineUnit,
    createBreakTimeline,
    createTestTimeline
};

export const utils = {
    checkListOverflowOverlap,
    checkNumWordsOverflow,
    pushTestStimuliStudied,
    pushTestStimuliUnstudied,
    showStartInstruction,
    showBreakTimelineInstruction,
    showTestTimelineInstruction,
    showEndInstruction
}