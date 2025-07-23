import { JsPsych } from "jspsych";
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychInstructions from '@jspsych/plugin-instructions';
import { welcomeAndInstructionsText } from './text';

/* Constants */
const DEFAULT_TRIAL_TIMEOUT = 3000;
const DEFAULT_FIXATION_DURATION = { min: 300, max: 1000 };
const WORDS = ['RED', 'GREEN', 'BLUE', 'YELLOW'];

/* Types */
interface StroopStimulus {
    word: string;
    color: string;
    correct_response: number;
    congruent: boolean;
}

interface TrialData {
    task: string;
    word?: string;
    color?: string;
    correct_response?: number;
    congruent?: boolean;
    correct?: boolean;
    rt?: number;
}

interface StroopState {
    practiceCompleted: boolean;
    mainTrialsCompleted: number;
    totalTrials: number;
}

/* Internal state */
let state: StroopState = {
    practiceCompleted: false,
    mainTrialsCompleted: 0,
    totalTrials: 0
};

/* Internal functions */
function resetState() {
    state = {
        practiceCompleted: false,
        mainTrialsCompleted: 0,
        totalTrials: 0
    };
}

function generateStimuli(selectedColors?: string[]): StroopStimulus[] {
    const stimuli: StroopStimulus[] = [];

    const colorsToUse = selectedColors ? selectedColors : WORDS;
    const colorObjectsToUse = colorsToUse.map((colorName, index) => ({
        name: colorName,
        hex: colorName.toLowerCase(),
        index: index
    }));

    for (const word of colorsToUse) {
        for (const color of colorObjectsToUse) {
            stimuli.push({
                word: word,
                color: color.hex,
                correct_response: color.index,
                congruent: word === color.name
            });
        }
    }

    return stimuli;
}

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}


function createWelcomeAndInstructions(
    choiceOfColors?: string[]
) {
    const pages = welcomeAndInstructionsText.pages.map(page => {
        if (typeof page === 'function') {
            return page(choiceOfColors);
        }
        return page;
    });

    const welcomeAndInstructions = {
        type: jsPsychInstructions,
        pages: pages,
        show_clickable_nav: true,
        allow_keys: true,
        key_forward: 'ArrowRight',
        key_backward: 'ArrowLeft',
        button_label_previous: "",
        button_label_next: "",
    };

    return welcomeAndInstructions;
}

function createFixation(duration?: { min: number, max: number }, randomize: boolean = true) {
    const fixationDuration = duration || DEFAULT_FIXATION_DURATION;

    const trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div style="font-size:60px;">+</div>',
        choices: "NO_KEYS",
        trial_duration: randomize ?
            () => {
                return Math.floor(Math.random() *
                    (fixationDuration.max - fixationDuration.min + 1)) +
                    fixationDuration.min;
            } :
            fixationDuration.min,
        data: {
            task: 'fixation'
        }
    };

    return trial;
}

function createStroopTrial(
    stimulus: StroopStimulus,
    isPractice: boolean,
    trialTimeout?: number,
    numberOfRows?: number,
    numberOfColumns?: number,
    choiceOfColors?: string[]
) {
    const trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `<div style="font-size: 48px; color: ${stimulus.color}; font-weight: bold;">${stimulus.word}</div>`,
        choices: choiceOfColors,
        button_layout: 'grid',
        grid_rows: numberOfRows,
        grid_columns: numberOfColumns,
        button_html: (choice) => `<div style="border: 3px solid black; width: 150px; height: 60px; margin: 20px; background-color: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; color: black;">${choice}</div>`,
        margin_horizontal: '20px',
        margin_vertical: '20px',
        trial_duration: trialTimeout || DEFAULT_TRIAL_TIMEOUT,
        data: {
            task: isPractice ? 'practice' : 'response',
            word: stimulus.word,
            color: stimulus.color,
            correct_response: stimulus.correct_response,
            congruent: stimulus.congruent
        },
        on_finish: (data: any) => {
            data.correct = (data.response === data.correct_response);
            if (!isPractice) {
                state.mainTrialsCompleted++;
            }
        }
    };

    return trial;
}

function createPracticeFeedback(jsPsych: JsPsych, selectedColors?: string[]) {
    const feedback = {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
            const lastTrial = jsPsych.data.get().last(1).values()[0];
            if (!lastTrial) {
                console.error('No trial data found');
                return '<div style="font-size: 24px; color: orange; text-align: center;"><p>No data available</p></div>';
            }
            const colorsToUse = selectedColors || ['RED', 'GREEN', 'BLUE', 'YELLOW'];
            const correctColorName = colorsToUse[lastTrial.correct_response];
            console.log('correct_response index:', lastTrial.correct_response, 'selectedColors:', selectedColors, 'correctColorName:', correctColorName);

            if (lastTrial.correct) {
                return '<div style="font-size: 24px; color: green; text-align: center;"><p>✓ CORRECT!</p></div>';
            } else {
                return `<div style="font-size: 24px; color: red; text-align: center;"><p>✗ INCORRECT. The correct answer was ${lastTrial.color.toUpperCase()}.</p></div>`;
            }
        },
        choices: ['Continue'],
        trial_duration: 2000
    };

    return feedback;
}

function createPracticeDebrief() {
    const debrief = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
                <h2>Practice Complete!</h2>
                <p>Great job! You've finished the practice trials.</p>
                <p>Now you'll begin the main experiment.</p>
                <p>Remember:</p>
                <ul style="text-align: left; display: inline-block;">
                    <li>Respond to the <strong>ink color</strong>, not the word</li>
                    <li>Be as fast and accurate as possible</li>
                    <li>Click the colored buttons for Red, Green, Blue, Yellow</li>
                </ul>
            </div>
        `,
        choices: ['Start Experiment'],
        post_trial_gap: 500,
        on_finish: () => {
            state.practiceCompleted = true;
        }
    };

    return debrief;
}

function createResults(jsPsych: JsPsych) {
    const results = {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
            const trials = jsPsych.data.get().filter({ task: 'response' });

            if (trials.count() === 0) {
                return `<p>No trial data found.</p>`;
            }

            const congruentTrials = trials.filter({ congruent: true });
            const incongruentTrials = trials.filter({ congruent: false });

            const congruentCorrect = congruentTrials.filter({ correct: true });
            const incongruentCorrect = incongruentTrials.filter({ correct: true });

            const congruentAccuracy = congruentTrials.count() > 0
                ? Math.round(congruentCorrect.count() / congruentTrials.count() * 100)
                : 0;
            const incongruentAccuracy = incongruentTrials.count() > 0
                ? Math.round(incongruentCorrect.count() / incongruentTrials.count() * 100)
                : 0;

            const congruentRt = congruentCorrect.count() > 0
                ? Math.round(congruentCorrect.select('rt').mean())
                : 0;
            const incongruentRt = incongruentCorrect.count() > 0
                ? Math.round(incongruentCorrect.select('rt').mean())
                : 0;

            const stroopEffect = incongruentRt - congruentRt;

            return `
                <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                    <h2>Experiment Complete!</h2>
                    <div style="text-align: left; background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Congruent trials:</strong> ${congruentAccuracy}% correct, ${congruentRt}ms average</p>
                        <p><strong>Incongruent trials:</strong> ${incongruentAccuracy}% correct, ${incongruentRt}ms average</p>
                        <p><strong>Stroop Effect:</strong> ${stroopEffect}ms</p>
                    </div>
                    <p>Thank you for participating!</p>
                </div>
            `;
        },
        choices: ['Download Data'],
        on_finish: () => {
            jsPsych.data.displayData();
        }
    };

    return results;
}

/* Main timeline creation function */
export function createTimeline(
    jsPsych: JsPsych,
    {
        practice_trials_per_condition = 2,
        congruent_main_trials = 4,
        incongruent_main_trials = 4,
        trial_timeout = 3000,
        fixation_duration = { min: 300, max: 1500 },
        show_practice_feedback = true,
        include_fixation = true,
        show_welcome_and_instructions = true,
        show_results = true,
        randomise_main_trial_condition_order = true,
        randomise_practice_trial_condition_order = true,
        randomise_fixation_duration = true,
        number_of_rows = 2,
        number_of_columns = 2,
        choice_of_colors = ['RED', 'GREEN', 'BLUE', 'YELLOW']
    }: {
        practice_trials_per_condition?: number,
        congruent_main_trials?: number,
        incongruent_main_trials?: number,
        trial_timeout?: number,
        fixation_duration?: { min: number, max: number },
        show_practice_feedback?: boolean,
        include_fixation?: boolean,
        show_welcome_and_instructions?: boolean,
        show_results?: boolean,
        randomise_main_trial_condition_order?: boolean,
        randomise_practice_trial_condition_order?: boolean,
        randomise_fixation_duration?: boolean,
        number_of_rows?: number,
        number_of_columns?: number,
        choice_of_colors?: string[]
    } = {}
) {
    // Reset state for new timeline
    resetState();

    const timeline: any[] = [];
    const stimuli = generateStimuli(choice_of_colors);

    // Separate congruent and incongruent stimuli
    const congruentStimuli = stimuli.filter(s => s.congruent);
    const incongruentStimuli = stimuli.filter(s => !s.congruent);

    // Add createCelcomeAndInstruction function
    if (show_welcome_and_instructions) {
        timeline.push(createWelcomeAndInstructions(choice_of_colors));
    }   


    // Create practice trials
    let practiceStimuli = [];
    practiceStimuli.push(...congruentStimuli.slice(0, practice_trials_per_condition));
    practiceStimuli.push(...incongruentStimuli.slice(0, practice_trials_per_condition));

    const shuffledPracticeStimuli = randomise_practice_trial_condition_order ? shuffleArray(practiceStimuli) : practiceStimuli;

    // Add practice trials
    for (const stimulus of shuffledPracticeStimuli) {
        if (include_fixation) {
            timeline.push(createFixation(fixation_duration, randomise_fixation_duration));
        }
        timeline.push(createStroopTrial(stimulus, true, trial_timeout, number_of_rows, number_of_columns, choice_of_colors));
        if (show_practice_feedback) {
            timeline.push(createPracticeFeedback(jsPsych, choice_of_colors));
        }
    }

    // Add practice debrief
    timeline.push(createPracticeDebrief());

    // Create main experiment stimuli
    let mainStimuli = [];

    // Add congruent trials
    mainStimuli.push(...congruentStimuli.slice(0, congruent_main_trials));

    // Add incongruent trials  
    mainStimuli.push(...incongruentStimuli.slice(0, incongruent_main_trials));

    const shuffledMainStimuli = randomise_main_trial_condition_order ? shuffleArray(mainStimuli) : mainStimuli;
    state.totalTrials = shuffledMainStimuli.length;

    // Add main trials
    for (const stimulus of shuffledMainStimuli) {
        if (include_fixation) {
            timeline.push(createFixation(fixation_duration, randomise_fixation_duration));
        }
        timeline.push(createStroopTrial(stimulus, false, trial_timeout, number_of_rows, number_of_columns, choice_of_colors));
    }

    // Add results if requested
    if (show_results) {
        timeline.push(createResults(jsPsych));
    }

    return timeline;
}

/* Export individual components for custom timeline building */
export const timelineComponents = {
    createWelcomeAndInstructions,
    createFixation,
    createStroopTrial,
    createPracticeFeedback,
    createPracticeDebrief,
    createResults
};

/* Export utility functions */
export const utils = {
    resetState,
    generateStimuli,
    shuffleArray
};

/* Export types */
export type { StroopStimulus, TrialData, StroopState };