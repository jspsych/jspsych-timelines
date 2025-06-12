import { JsPsych } from "jspsych";
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychInstructions from '@jspsych/plugin-instructions';

/* Constants */
const DEFAULT_PRACTICE_TRIALS_PER_CONDITION = 1;
const DEFAULT_MAIN_TRIALS_PER_CONDITION = 6;
const DEFAULT_TRIAL_TIMEOUT = 3000;
const DEFAULT_FIXATION_DURATION = { min: 300, max: 1000 };
const DEFAULT_SHOW_PRACTICE_FEEDBACK = true;
const DEFAULT_INCLUDE_FIXATION = true;

const COLORS = [
    { name: 'RED', hex: 'red', index: 0 },
    { name: 'GREEN', hex: 'green', index: 1 },
    { name: 'BLUE', hex: 'blue', index: 2 },
    { name: 'YELLOW', hex: 'yellow', index: 3 }
];

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

function generateStimuli(): StroopStimulus[] {
    const stimuli: StroopStimulus[] = [];

    for (const word of WORDS) {
        for (const color of COLORS) {
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

/* Timeline component generating functions */
function createWelcome() {
    const welcome = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
                <h1>Welcome to the Stroop Task!</h1>
                <p>In this experiment, you will see words printed in different colors.</p>
                <p>Your task is to identify the <strong>color of the ink</strong> the word is printed in, NOT the word itself.</p>
                <p>Please respond as quickly and accurately as possible.</p>
            </div>
        `,
        choices: ['Continue'],
        post_trial_gap: 500
    };

    return welcome;
}

function createInstructions() {
    const instructions = {
        type: jsPsychInstructions,
        pages: [
            `<div style="max-width: 700px; margin: 0 auto; text-align: left; padding: 20px;">
                <h2>Instructions</h2>
                <p>You will see a word (e.g., "RED", "BLUE") displayed in one of four ink colors: red, green, blue, or yellow.</p>
                <p>Your task is to click the button corresponding to the <strong>INK COLOR</strong> of the word, ignoring what the word says.</p>
                <p>Click the colored buttons that will appear below each word:</p>
                
                <div style="display: flex; justify-content: space-around; margin: 20px 0; flex-wrap: wrap;">
                    ${COLORS.map(color => `
                        <div style="padding: 15px; border: 1px solid #ccc; border-radius: 8px; margin: 10px; min-width: 120px; text-align: center;">
                            <span style="color: ${color.hex}; font-size: 24px; font-weight: bold; display: block; margin-bottom: 5px;">${color.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`,
            `<div style="max-width: 700px; margin: 0 auto; text-align: left; padding: 20px;">
                <h2>Examples</h2>
                <p>If you see the word <strong style="color:blue;">RED</strong> (written in BLUE ink), you should click the BLUE button.</p>
                <p>If you see the word <strong style="color:green;">GREEN</strong> (written in GREEN ink), you should click the GREEN button.</p>
                <p>There will be a short practice session first.</p>
            </div>`
        ],
        show_clickable_nav: true,
        button_label_previous: 'Previous',
        button_label_next: 'Next',
        button_label_finish: 'Begin Practice'
    };

    return instructions;
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
    jsPsych: JsPsych,
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
        choices: choiceOfColors || COLORS.map(c => c.name),
        button_layout: 'grid',
        grid_rows: numberOfRows,
        grid_columns: numberOfColumns,
        button_html: (choice: string, choice_index: number) => {
            const color = COLORS.find(c => c.name === choice);
            return `<div style="border: 3px solid #333; width: 150px; height: 60px; margin: 20px; background-color: ${color?.hex}; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">${choice}</div>`;
        },
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

function createPracticeFeedback(jsPsych: JsPsych) {
    const feedback = {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
            const lastTrial = jsPsych.data.get().last(1).values()[0];
            const correctColorName = COLORS[lastTrial.correct_response].name;

            if (lastTrial.correct) {
                return '<div style="font-size: 24px; color: green; text-align: center;"><p>✓ CORRECT!</p></div>';
            } else {
                return `<div style="font-size: 24px; color: red; text-align: center;"><p>✗ INCORRECT. The correct answer was ${correctColorName} for ${lastTrial.color.toUpperCase()} ink.</p></div>`;
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
            const correctTrials = trials.filter({ correct: true });

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
        practiceTrialsPerCondition = 2,
        mainTrialsPerCondition = 4,
        trialTimeout = 3000,
        fixationDuration = { min: 300, max: 1500 },
        showPracticeFeedback = true,
        includeFixation = true,
        showInstructions = true,
        showResults = true,
        randomiseMainTrialConditionOrder = true,
        randomisePracticeTrialConditionOrder = true,
        randomiseFixationDuration = true,
        numberOfRows = 2,
        numberOfColumns = 2,
        choiceOfColours = ['RED', 'GREEN', 'BLUE', 'YELLOW']    
    }: {
        practiceTrialsPerCondition?: number,
        mainTrialsPerCondition?: number,
        trialTimeout?: number,
        fixationDuration?: { min: number, max: number },
        showPracticeFeedback?: boolean,
        includeFixation?: boolean,
        showInstructions?: boolean,
        showResults?: boolean,
        randomiseMainTrialConditionOrder?: boolean,
        randomisePracticeTrialConditionOrder?: boolean,
        randomiseFixationDuration?: boolean,
        numberOfRows?: number,
        numberOfColumns?: number,
        choiceOfColours?: string[]
    } = {}
) {
    // Reset state for new timeline
    resetState();

    const timeline: any[] = [];
    const stimuli = generateStimuli();

    // Separate congruent and incongruent stimuli
    const congruentStimuli = stimuli.filter(s => s.congruent);
    const incongruentStimuli = stimuli.filter(s => !s.congruent);

    // Add welcome
    timeline.push(createWelcome());

    // Add instructions if requested
    if (showInstructions) {
        timeline.push(createInstructions());
    }

    // Create practice trials
    let practiceStimuli = [];
    practiceStimuli.push(...congruentStimuli.slice(0, practiceTrialsPerCondition));
    practiceStimuli.push(...incongruentStimuli.slice(0, practiceTrialsPerCondition * 3));

    const shuffledPracticeStimuli = randomisePracticeTrialConditionOrder ? shuffleArray(practiceStimuli) : practiceStimuli;

    // Add practice trials
    for (const stimulus of shuffledPracticeStimuli) {
        if (includeFixation) {
            timeline.push(createFixation(fixationDuration, randomiseFixationDuration));
        }
        timeline.push(createStroopTrial(jsPsych, stimulus, true, trialTimeout, numberOfRows, numberOfColumns, choiceOfColours));
        if (showPracticeFeedback) {
            timeline.push(createPracticeFeedback(jsPsych));
        }
    }

    // Add practice debrief
    timeline.push(createPracticeDebrief());

    // Create main experiment stimuli
    let mainStimuli = [];

    // Add congruent trials
    for (let i = 0; i < mainTrialsPerCondition; i++) {
        mainStimuli.push(...congruentStimuli);
    }

    // Add incongruent trials
    for (let i = 0; i < Math.floor(mainTrialsPerCondition / 2); i++) {
        mainStimuli.push(...incongruentStimuli);
    }

    const shuffledMainStimuli = randomiseMainTrialConditionOrder ? shuffleArray(mainStimuli) : mainStimuli;
    state.totalTrials = shuffledMainStimuli.length;

    // Add main trials
    for (const stimulus of shuffledMainStimuli) {
        if (includeFixation) {
            timeline.push(createFixation(fixationDuration, randomiseFixationDuration));
        }
        timeline.push(createStroopTrial(jsPsych, stimulus, false, trialTimeout, numberOfRows, numberOfColumns, choiceOfColours));
    }

    // Add results if requested
    if (showResults) {
        timeline.push(createResults(jsPsych));
    }

    return timeline;
}

/* Export individual components for custom timeline building */
export const timelineComponents = {
    createWelcome,
    createInstructions,
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