import { JsPsych } from "jspsych";
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychAudioButtonResponse from '@jspsych/plugin-audio-button-response';
import jsPsychInstructions from '@jspsych/plugin-instructions';
import jsPsychImageButtonResponse from '@jspsych/plugin-image-button-response';
import jsPsychPreload from '@jspsych/plugin-preload';
import { createStimulusGroups } from './images';

/* Constants */
const DEFAULT_START_AGE = 3;
const DEFAULT_START_EDUCATION = 'high_school';
const DEFAULT_TRIAL_TIMEOUT = 60000; // 60 seconds
const DEFAULT_ADMIN_GESTURE_ENABLED = true;
const DEFAULT_SHOW_PROGRESS = true;
const DEFAULT_INCLUDE_AUDIO = true;

// CAT Algorithm Constants
const CAT_INITIAL_THETA = 0;
const CAT_THETA_MIN = -3;
const CAT_THETA_MAX = 3;
const CAT_STOPPING_SE = 0.3;
const CAT_MIN_ITEMS = 20;
const CAT_MAX_ITEMS = 30;

/* Types */
interface VisualReasoningStimulus {
    item_id: string;
    difficulty: number;
    discrimination: number;
    item_type: 'analogy' | 'pattern' | 'matrix' | 'sequence';
    target_images?: string[];
    response_options: string[];
    correct_response: number;
    question_mark_position?: 'middle' | 'top' | 'sequence';
}

interface PracticeItem {
    instruction_audio: string;
    feedback_audio_correct: string;
    feedback_audio_incorrect: string;
    feedback_audio_second_incorrect: string;
    visual_stimulus: string;
    response_options: string[];
    correct_response: number;
    item_type: 'single_match' | 'sequence' | 'matrix';
    highlight_sequence?: Array<{ element: string, duration: number }>;
}

interface TrialData {
    task: string;
    item_id?: string;
    item_type?: string;
    difficulty?: number;
    correct_response?: number;
    response?: number;
    correct?: boolean;
    rt?: number;
    theta_estimate?: number;
    se_estimate?: number;
    trial_number?: number;
}

interface VisualReasoningState {
    practiceCompleted: boolean;
    currentTheta: number;
    currentSE: number;
    itemsAdministered: number;
    responsePattern: boolean[];
    itemBank: VisualReasoningStimulus[];
    usedItems: Set<string>;
}

interface CATParameters {
    start_point: number;
    min_items: number;
    max_items: number;
    stopping_se: number;
}

/* Internal state */
let state: VisualReasoningState = {
    practiceCompleted: false,
    currentTheta: CAT_INITIAL_THETA,
    currentSE: 1.0,
    itemsAdministered: 0,
    responsePattern: [],
    itemBank: [],
    usedItems: new Set()
};

/* Internal functions */
function resetState() {
    state = {
        practiceCompleted: false,
        currentTheta: CAT_INITIAL_THETA,
        currentSE: 1.0,
        itemsAdministered: 0,
        responsePattern: [],
        itemBank: [],
        usedItems: new Set()
    };
}

function getStartPoint(age?: number, education?: string): number {
    // Determine starting theta based on age or education
    if (age !== undefined && age < 19) {
        if (age < 5) return -1.5;
        if (age < 8) return -1.0;
        if (age < 12) return -0.5;
        if (age < 16) return 0;
        return 0.5;
    } else if (education) {
        switch (education) {
            case 'elementary': return -1.0;
            case 'middle_school': return -0.5;
            case 'high_school': return 0;
            case 'college': return 0.5;
            case 'graduate': return 1.0;
            default: return 0;
        }
    }
    return 0;
}

function calculateItemInformation(item: VisualReasoningStimulus, theta: number): number {
    // 2PL IRT model information function
    const a = item.discrimination;
    const b = item.difficulty;
    const p = 1 / (1 + Math.exp(-a * (theta - b)));
    const q = 1 - p;
    return a * a * p * q;
}

function selectNextItem(theta: number): VisualReasoningStimulus | null {
    // Select item with maximum information at current theta
    let maxInfo = -1;
    let selectedItem: VisualReasoningStimulus | null = null;

    for (const item of state.itemBank) {
        if (!state.usedItems.has(item.item_id)) {
            const info = calculateItemInformation(item, theta);
            if (info > maxInfo) {
                maxInfo = info;
                selectedItem = item;
            }
        }
    }

    return selectedItem;
}

function updateThetaEstimate(responses: boolean[], items: VisualReasoningStimulus[]): { theta: number, se: number } {
    // Maximum likelihood estimation with Newton-Raphson
    let theta = state.currentTheta;
    const maxIterations = 20;
    const convergence = 0.001;

    for (let iter = 0; iter < maxIterations; iter++) {
        let firstDerivative = 0;
        let secondDerivative = 0;

        for (let i = 0; i < responses.length; i++) {
            const a = items[i].discrimination;
            const b = items[i].difficulty;
            const p = 1 / (1 + Math.exp(-a * (theta - b)));

            firstDerivative += a * (responses[i] ? 1 : 0 - p);
            secondDerivative -= a * a * p * (1 - p);
        }

        const change = firstDerivative / secondDerivative;
        theta -= change;

        // Bound theta
        theta = Math.max(CAT_THETA_MIN, Math.min(CAT_THETA_MAX, theta));

        if (Math.abs(change) < convergence) break;
    }

    // Calculate standard error
    let information = 0;
    for (let i = 0; i < items.length; i++) {
        information += calculateItemInformation(items[i], theta);
    }
    const se = 1 / Math.sqrt(information);

    return { theta, se };
}

function generatePracticeItems(): PracticeItem[] {
    const stimulusGroups = createStimulusGroups();
    
    return [
        {
            instruction_audio: 'audio/practice_1_instruction.mp3',
            feedback_audio_correct: 'audio/thats_right.mp3',
            feedback_audio_incorrect: 'audio/lets_try_again_pencil.mp3',
            feedback_audio_second_incorrect: 'audio/this_one_pencil.mp3',
            visual_stimulus: stimulusGroups.practice1.target,
            response_options: stimulusGroups.practice1.response_options,
            correct_response: 1, // pen is at index 1 in the response options
            item_type: 'single_match',
            highlight_sequence: [
                { element: 'response_options', duration: 500 },
                { element: 'target', duration: 500 }
            ]
        },
        {
            instruction_audio: 'audio/practice_2_instruction.mp3',
            feedback_audio_correct: 'audio/thats_right.mp3',
            feedback_audio_incorrect: 'audio/lets_try_again_rocket.mp3',
            feedback_audio_second_incorrect: 'audio/this_one_planet.mp3',
            visual_stimulus: 'sequence',
            response_options: ['img/rocket.png', 'img/planet.png', 'img/star.png', 'img/moon.png'],
            correct_response: 1,
            item_type: 'sequence',
            highlight_sequence: [
                { element: 'top_images', duration: 500 },
                { element: 'response_options', duration: 500 },
                { element: 'blank_space', duration: 500 }
            ]
        },
        {
            instruction_audio: 'audio/practice_3_instruction.mp3',
            feedback_audio_correct: 'audio/thats_right.mp3',
            feedback_audio_incorrect: 'audio/lets_try_again_shapes.mp3',
            feedback_audio_second_incorrect: 'audio/this_one_star.mp3',
            visual_stimulus: 'matrix',
            response_options: ['img/circle.png', 'img/star.png', 'img/square.png', 'img/triangle.png'],
            correct_response: 1,
            item_type: 'matrix',
            highlight_sequence: [
                { element: 'response_options', duration: 500 },
                { element: 'blank_space', duration: 500 }
            ]
        }
    ];
}

// function loadItemBank(): VisualReasoningStimulus[] {
//     // In a real implementation, this would load from a database or file
//     // For now, returning a sample item bank
//     return [
//         {
//             item_id: 'VR001',
//             difficulty: -2.0,
//             discrimination: 1.2,
//             item_type: 'analogy',
//             target_images: ['img/items/vr001_target.png'],
//             response_options: ['img/items/vr001_opt1.png', 'img/items/vr001_opt2.png', 'img/items/vr001_opt3.png', 'img/items/vr001_opt4.png'],
//             correct_response: 0
//         },
//         // Add more items here...
//     ];
// }

function loadItemBank(): VisualReasoningStimulus[] {
    // TODO: Implement when adaptive test images are ready
    console.log('Loading adaptive test items...');
    return [];
}

/* Timeline component generating functions */
function createWelcome() {
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
                <h1>Visual Reasoning Test</h1>
                <p>Welcome to the Visual Reasoning assessment.</p>
                <p>This test measures your ability to identify patterns and relationships in visual information.</p>
                <p>The test will adapt to your performance and typically takes 5-10 minutes to complete.</p>
            </div>
        `,
        choices: ['Begin Test'],
        post_trial_gap: 500
    };
}

function createInstructions(include_audio: boolean) {
    const audioHTML = include_audio ?
        `<audio id="instruction-audio" src="audio/main_instructions.mp3" autoplay></audio>` : '';

    return {
        type: jsPsychInstructions,
        pages: [
            `<div style="max-width: 700px; margin: 0 auto; padding: 20px;">
                ${audioHTML}
                <h2>Instructions</h2>
                <p>Let's look at some pictures. You will see a picture in the middle of the screen and some pictures at the bottom.</p>
                <p>Tap the picture at the bottom that is most like the picture in the middle of the screen, or shows the missing picture.</p>
                <p>Some pictures will be easy and some will be harder. Just do the best you can.</p>
            </div>`
        ],
        show_clickable_nav: true,
        button_label_next: 'Continue',
        on_finish: () => {
            const audio = document.getElementById('instruction-audio') as HTMLAudioElement;
            if (audio) audio.pause();
        }
    };
}

function createPracticeTransition() {
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
                <h2>Practice Items</h2>
                <p>We'll start with some practice items to help you understand the task.</p>
                <p>During practice, you'll receive feedback on your answers.</p>
            </div>
        `,
        choices: ['Start Practice'],
        button_html: '<button class="jspsych-btn" style="background-color: #7B3F99; color: white; padding: 10px 20px; border-radius: 20px;">%choice%</button>',
        post_trial_gap: 500
    };
}

function createPracticeTrial(
    jsPsych: JsPsych,
    practiceItem: PracticeItem,
    trial_number: number,
    include_audio: boolean
) {
    const isFirstTrial = true; // This would track if it's the first attempt

    return {
        type: include_audio ? jsPsychAudioButtonResponse : jsPsychImageButtonResponse,
        stimulus: include_audio ? practiceItem.instruction_audio : createPracticeStimulus(practiceItem),
        choices: practiceItem.response_options,
        button_html: '<img src="%choice%" style="width: 100px; height: 100px; margin: 10px; border: 3px solid #ccc; border-radius: 10px; cursor: pointer;">',
        prompt: createPracticePrompt(practiceItem, trial_number),
        response_ends_trial: true,
        data: {
            task: 'practice',
            practice_item: trial_number,
            correct_response: practiceItem.correct_response,
            item_type: practiceItem.item_type
        },
        on_finish: (data: any) => {
            data.correct = (data.response === data.correct_response);
        }
    };
}

function createPracticeStimulus(item: PracticeItem): string {
    if (item.item_type === 'single_match') {
        return `<div style="text-align: center;">
            <img src="${item.visual_stimulus}" style="width: 150px; height: 150px; border: 4px solid #333; border-radius: 10px;">
        </div>`;
    } else if (item.item_type === 'sequence') {
        return `<div style="text-align: center;">
            <div style="display: flex; justify-content: center; margin-bottom: 30px;">
                <img src="img/rocket.png" style="width: 80px; height: 80px; margin: 5px; border: 2px solid #333;">
                <img src="img/planet.png" style="width: 80px; height: 80px; margin: 5px; border: 2px solid #333;">
                <img src="img/rocket.png" style="width: 80px; height: 80px; margin: 5px; border: 2px solid #333;">
                <div style="width: 80px; height: 80px; margin: 5px; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 48px;">?</div>
            </div>
        </div>`;
    } else if (item.item_type === 'matrix') {
        return `<div style="text-align: center;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 200px; margin: 0 auto;">
                <img src="img/circle.png" style="width: 80px; height: 80px; border: 2px solid #333;">
                <img src="img/circle.png" style="width: 80px; height: 80px; border: 2px solid #333;">
                <img src="img/star.png" style="width: 80px; height: 80px; border: 2px solid #333;">
                <div style="width: 80px; height: 80px; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 48px;">?</div>
            </div>
        </div>`;
    }
    return '';
}

function createPracticePrompt(item: PracticeItem, trial_number: number): string {
    const prompts = [
        "Which one of these is most like the picture in the middle of the screen?",
        "Look at these pictures. One picture is missing. Which one goes here?",
        "Look at these pictures. One picture is missing. Which one goes here?"
    ];
    return `<p style="margin-top: 30px; font-size: 18px;">${prompts[trial_number - 1]}</p>`;
}

function createPracticeFeedback(jsPsych: JsPsych, include_audio: boolean) {
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
            const lastTrial = jsPsych.data.get().last(1).values()[0];
            const audioTag = include_audio && lastTrial.correct ?
                '<audio autoplay><source src="audio/thats_right.mp3" type="audio/mpeg"></audio>' : '';

            if (lastTrial.correct) {
                return `${audioTag}<div style="font-size: 24px; color: green; text-align: center;"><p>✓ That's right!</p></div>`;
            } else {
                return '<div style="font-size: 24px; color: red; text-align: center;"><p>Let\'s try that again.</p></div>';
            }
        },
        choices: [],
        trial_duration: 2000,
        post_trial_gap: 500
    };
}

function createLiveTransition(include_audio: boolean) {
    const audioHTML = include_audio ?
        '<audio autoplay><source src="audio/live_transition.mp3" type="audio/mpeg"></audio>' : '';

    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            ${audioHTML}
            <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
                <h2>Ready for the Test</h2>
                <p>Now, let's look at some more pictures.</p>
                <p>Remember, you will see a picture in the middle of the screen and some pictures at the bottom.</p>
                <p>Tap the picture at the bottom that is most like the picture in the middle of the screen or shows the missing picture.</p>
                <p>Are you ready?</p>
            </div>
        `,
        choices: ['Start Test'],
        button_html: '<button class="jspsych-btn" style="background-color: #7B3F99; color: white; padding: 15px 30px; border-radius: 25px; font-size: 18px;">%choice%</button>',
        post_trial_gap: 500,
        on_finish: () => {
            state.practiceCompleted = true;
        }
    };
}

function createAdaptiveTrial(
    jsPsych: JsPsych,
    stimulus: VisualReasoningStimulus,
    trial_timeout: number,
    show_progress: boolean
) {
    const progressHTML = show_progress ?
        `<div style="position: absolute; top: 10px; right: 10px; font-size: 14px; color: #666;">
            Item ${state.itemsAdministered + 1}
        </div>` : '';

    return {
        type: jsPsychImageButtonResponse,
        stimulus: createAdaptiveStimulus(stimulus),
        choices: stimulus.response_options,
        button_html: '<img src="%choice%" style="width: 120px; height: 120px; margin: 10px; border: 3px solid #ccc; border-radius: 10px; cursor: pointer; transition: all 0.3s;">',
        prompt: `${progressHTML}<p style="margin-top: 30px; font-size: 18px;">Select your answer</p>`,
        trial_duration: trial_timeout,
        data: {
            task: 'adaptive',
            item_id: stimulus.item_id,
            item_type: stimulus.item_type,
            difficulty: stimulus.difficulty,
            discrimination: stimulus.discrimination,
            correct_response: stimulus.correct_response,
            theta_estimate: state.currentTheta,
            se_estimate: state.currentSE,
            trial_number: state.itemsAdministered + 1
        },
        on_finish: (data: any) => {
            data.correct = (data.response === data.correct_response);

            // Update state
            state.responsePattern.push(data.correct);
            state.usedItems.add(stimulus.item_id);
            state.itemsAdministered++;

            // Update theta estimate
            const administeredItems = Array.from(state.usedItems).map(id =>
                state.itemBank.find(item => item.item_id === id)!
            );
            const estimate = updateThetaEstimate(state.responsePattern, administeredItems);
            state.currentTheta = estimate.theta;
            state.currentSE = estimate.se;

            data.theta_estimate_post = state.currentTheta;
            data.se_estimate_post = state.currentSE;
        }
    };
}

function createAdaptiveStimulus(item: VisualReasoningStimulus): string {
    switch (item.item_type) {
        case 'analogy':
            return `<div style="text-align: center;">
                <img src="${item.target_images![0]}" style="width: 200px; height: 200px; border: 4px solid #333; border-radius: 10px;">
            </div>`;

        case 'pattern':
        case 'sequence':
            return `<div style="text-align: center;">
                <div style="display: flex; justify-content: center; flex-wrap: wrap; max-width: 400px; margin: 0 auto;">
                    ${item.target_images!.map((img, idx) =>
                `<img src="${img}" style="width: 80px; height: 80px; margin: 5px; border: 2px solid #333;">`
            ).join('')}
                    <div style="width: 80px; height: 80px; margin: 5px; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 48px;">?</div>
                </div>
            </div>`;

        case 'matrix':
            return `<div style="text-align: center;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 300px; margin: 0 auto;">
                    ${item.target_images!.map((img, idx) => {
                if (idx === item.target_images!.length - 1) {
                    return `<div style="width: 80px; height: 80px; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 48px;">?</div>`;
                }
                return `<img src="${img}" style="width: 80px; height: 80px; border: 2px solid #333;">`;
            }).join('')}
                </div>
            </div>`;

        default:
            return '';
    }
}

function createTimeoutWarning() {
    return {
        type: jsPsychAudioButtonResponse,
        stimulus: 'audio/please_choose_answer.mp3',
        choices: [],
        trial_duration: 2000,
        prompt: '<p style="font-size: 18px; color: #666;">Please choose an answer</p>'
    };
}

function createResults(jsPsych: JsPsych) {
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
            const trials = jsPsych.data.get().filter({ task: 'adaptive' });
            const correctTrials = trials.filter({ correct: true });
            const accuracy = Math.round((correctTrials.count() / trials.count()) * 100);

            return `
                <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                    <h2>Test Complete!</h2>
                    <div style="text-align: left; background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Items Completed:</strong> ${trials.count()}</p>
                        <p><strong>Accuracy:</strong> ${accuracy}%</p>
                        <p><strong>Final Ability Estimate:</strong> ${state.currentTheta.toFixed(2)}</p>
                        <p><strong>Standard Error:</strong> ${state.currentSE.toFixed(3)}</p>
                    </div>
                    <p>Thank you for completing the Visual Reasoning Test!</p>
                </div>
            `;
        },
        choices: ['Finish'],
        on_finish: () => {
            if (jsPsych.data.get().select('responses').values.length > 0) {
                jsPsych.data.displayData();
            }
        }
    };
}

/* Main timeline creation function */
export function createTimeline(
    jsPsych: JsPsych,
    {
        participant_age = DEFAULT_START_AGE,
        participant_education = DEFAULT_START_EDUCATION,
        start_point_override = 0,
        trial_timeout = DEFAULT_TRIAL_TIMEOUT,
        show_practice = true,
        show_instructions = true,
        show_results = true,
        include_audio = DEFAULT_INCLUDE_AUDIO,
        show_progress = DEFAULT_SHOW_PROGRESS,
        cat_parameters = {
            start_point: CAT_INITIAL_THETA,
            min_items: CAT_MIN_ITEMS,
            max_items: CAT_MAX_ITEMS,
            stopping_se: CAT_STOPPING_SE
        },
        //custom_item_bank,
        enable_admin_gesture = DEFAULT_ADMIN_GESTURE_ENABLED
    }: {
        participant_age?: number,
        participant_education?: string,
        start_point_override?: number,
        trial_timeout?: number,
        show_practice?: boolean,
        show_instructions?: boolean,
        show_results?: boolean,
        include_audio?: boolean,
        show_progress?: boolean,
        cat_parameters?: CATParameters,
        custom_item_bank?: VisualReasoningStimulus[],
        enable_admin_gesture?: boolean
    } = {}
) {
    // Reset state for new timeline
    resetState();

    // Load item bank
    //state.itemBank = custom_item_bank || loadItemBank();

    // Add this check here
    if (state.itemBank.length === 0) {
        console.warn('No adaptive test items available. Only practice items will be shown.');
    }

    // Set starting point
    if (start_point_override !== undefined) {
        state.currentTheta = start_point_override;
    } else {
        state.currentTheta = getStartPoint(participant_age, participant_education);
    }

    const timeline: any[] = [];

    // Preload all images and audio
    timeline.push({
        type: jsPsychPreload,
        images: () => {
            const images: string[] = [];

            // Add practice images
            const practiceItems = generatePracticeItems();
            practiceItems.forEach(item => {
                if (item.visual_stimulus && !['sequence', 'matrix'].includes(item.visual_stimulus)) {
                    images.push(item.visual_stimulus);
                }
                images.push(...item.response_options);
            });

            // Add images for specific practice patterns
            images.push('img/pencil.png', 'img/pen.png', 'img/book.png', 'img/pencil2.png', 'img/eraser.png');
            images.push('img/rocket.png', 'img/planet.png', 'img/star.png', 'img/moon.png');
            images.push('img/circle.png', 'img/star.png', 'img/square.png', 'img/triangle.png');

            // Add adaptive test images
            state.itemBank.forEach(item => {
                if (item.target_images) {
                    images.push(...item.target_images);
                }
                images.push(...item.response_options);
            });

            return images;
        },
        audio: () => {
            if (!include_audio) return [];

            const audio: string[] = [
                'audio/main_instructions.mp3',
                'audio/live_transition.mp3',
                'audio/please_choose_answer.mp3'
            ];

            // Add practice audio
            const practiceItems = generatePracticeItems();
            practiceItems.forEach(item => {
                audio.push(item.instruction_audio);
                audio.push(item.feedback_audio_correct);
                audio.push(item.feedback_audio_incorrect);
                audio.push(item.feedback_audio_second_incorrect);
            });

            return audio;
        },
        show_progress_bar: true,
        message: 'Loading test materials...'
    });

    // Add welcome screen
    timeline.push(createWelcome());

    // Add instructions if requested
    if (show_instructions) {
        timeline.push(createInstructions(include_audio));
    }

    // Add practice trials if requested
    if (show_practice) {
        timeline.push(createPracticeTransition());

        const practiceItems = generatePracticeItems();
        practiceItems.forEach((item, index) => {
            // First attempt
            timeline.push(createPracticeTrial(jsPsych, item, index + 1, include_audio));
            timeline.push(createPracticeFeedback(jsPsych, include_audio));

            // Conditional node for second attempt if incorrect
            const conditionalNode = {
                timeline: [
                    createPracticeTrial(jsPsych, item, index + 1, include_audio),
                    createPracticeFeedback(jsPsych, include_audio)
                ],
                conditional_function: () => {
                    const lastTrial = jsPsych.data.get().filter({ task: 'practice' }).last(1).values()[0];
                    return !lastTrial.correct;
                }
            };
            timeline.push(conditionalNode);
        });
    }

    // Add transition to live items
    timeline.push(createLiveTransition(include_audio));

if (state.itemBank.length > 0) {    
    // Create adaptive testing loop
    const adaptiveLoop = {
        timeline: [
            {
                timeline: [createAdaptiveTrial(jsPsych, selectNextItem(state.currentTheta)!, trial_timeout, show_progress)],
                conditional_function: () => {
                    // Check if we should continue testing
                    if (state.itemsAdministered >= cat_parameters.max_items) {
                        return false;
                    }

                    if (state.itemsAdministered >= cat_parameters.min_items &&
                        state.currentSE <= cat_parameters.stopping_se) {
                        return false;
                    }

                    // Check if there are items remaining
                    const nextItem = selectNextItem(state.currentTheta);
                    return nextItem !== null;
                }
            }
        ],
        loop_function: () => {
            // Continue looping while conditions are not met
            if (state.itemsAdministered >= cat_parameters.max_items) {
                return false;
            }

            if (state.itemsAdministered >= cat_parameters.min_items &&
                state.currentSE <= cat_parameters.stopping_se) {
                return false;
            }

            return true;
        }
    };

    // Since we need to handle the dynamic item selection, we'll use a different approach
    // Create individual trials in a loop
    for (let i = 0; i < cat_parameters.max_items; i++) {
        const trialNode = {
            timeline: [
                {
                    type: jsPsychImageButtonResponse,
                    stimulus: () => {
                        const item = selectNextItem(state.currentTheta);
                        if (!item) return '';
                        return createAdaptiveStimulus(item);
                    },
                    choices: () => {
                        const item = selectNextItem(state.currentTheta);
                        if (!item) return [];
                        return item.response_options;
                    },
                    button_html: '<img src="%choice%" style="width: 120px; height: 120px; margin: 10px; border: 3px solid #ccc; border-radius: 10px; cursor: pointer; transition: all 0.3s;">',
                    prompt: () => {
                        const progressHTML = show_progress ?
                            `<div style="position: absolute; top: 10px; right: 10px; font-size: 14px; color: #666;">
                                Item ${state.itemsAdministered + 1}
                            </div>` : '';
                        return `${progressHTML}<p style="margin-top: 30px; font-size: 18px;">Select your answer</p>`;
                    },
                    trial_duration: trial_timeout,
                    data: () => {
                        const item = selectNextItem(state.currentTheta);
                        if (!item) return {};
                        return {
                            task: 'adaptive',
                            item_id: item.item_id,
                            item_type: item.item_type,
                            difficulty: item.difficulty,
                            discrimination: item.discrimination,
                            correct_response: item.correct_response,
                            theta_estimate: state.currentTheta,
                            se_estimate: state.currentSE,
                            trial_number: state.itemsAdministered + 1
                        };
                    },
                    on_finish: (data: any) => {
                        const item = state.itemBank.find(i => i.item_id === data.item_id);
                        if (!item) return;

                        data.correct = (data.response === data.correct_response);

                        // Update state
                        state.responsePattern.push(data.correct);
                        state.usedItems.add(item.item_id);
                        state.itemsAdministered++;

                        // Update theta estimate
                        const administeredItems = Array.from(state.usedItems).map(id =>
                            state.itemBank.find(item => item.item_id === id)!
                        );
                        const estimate = updateThetaEstimate(state.responsePattern, administeredItems);
                        state.currentTheta = estimate.theta;
                        state.currentSE = estimate.se;

                        data.theta_estimate_post = state.currentTheta;
                        data.se_estimate_post = state.currentSE;
                    },
                    on_load: () => {
                        // Add timeout warning functionality
                        if (include_audio) {
                            setTimeout(() => {
                                const buttons = document.querySelectorAll('.jspsych-content-wrapper button');
                                if (buttons.length > 0 && !jsPsych.data.get().last(1).values()[0].response) {
                                    const audio = new Audio('audio/please_choose_answer.mp3');
                                    audio.play();
                                }
                            }, trial_timeout - 5000); // Play warning 5 seconds before timeout
                        }
                    }
                }
            ],
            conditional_function: () => {
                // Check if we should show this trial
                if (state.itemsAdministered >= cat_parameters.max_items) {
                    return false;
                }

                if (state.itemsAdministered >= cat_parameters.min_items &&
                    state.currentSE <= cat_parameters.stopping_se) {
                    return false;
                }

                // Check if there are items remaining
                const nextItem = selectNextItem(state.currentTheta);
                return nextItem !== null;
            }
        };

        timeline.push(trialNode);
    }

} else {
    // Add a message that no adaptive items are available
    timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: '<div style="text-align: center;"><h2>Practice Complete</h2><p>No adaptive test items are currently available.</p></div>',
        choices: ['Continue'],
        post_trial_gap: 500
    });
}

    return timeline;
}

/* Export individual components for custom timeline building */
export const timelineComponents = {
    createWelcome,
    createInstructions,
    createPracticeTransition,
    createPracticeTrial,
    createPracticeFeedback,
    createLiveTransition,
    createAdaptiveTrial,
    createTimeoutWarning,
    createResults
};

/* Export utility functions */
export const utils = {
    resetState,
    getStartPoint,
    calculateItemInformation,
    selectNextItem,
    updateThetaEstimate,
    generatePracticeItems,
    //loadItemBank,
    createPracticeStimulus,
    createAdaptiveStimulus
};

/* Export CAT functions for external use */
export const catFunctions = {
    initializeCAT: (itemBank: VisualReasoningStimulus[], startingTheta: number = 0) => {
        resetState();
        state.itemBank = itemBank;
        state.currentTheta = startingTheta;
    },

    getNextItem: () => selectNextItem(state.currentTheta),

    updateResponse: (itemId: string, correct: boolean) => {
        const item = state.itemBank.find(i => i.item_id === itemId);
        if (!item) return null;

        state.responsePattern.push(correct);
        state.usedItems.add(itemId);
        state.itemsAdministered++;

        const administeredItems = Array.from(state.usedItems).map(id =>
            state.itemBank.find(item => item.item_id === id)!
        );
        const estimate = updateThetaEstimate(state.responsePattern, administeredItems);
        state.currentTheta = estimate.theta;
        state.currentSE = estimate.se;

        return {
            theta: state.currentTheta,
            se: state.currentSE,
            itemsAdministered: state.itemsAdministered
        };
    },

    shouldStop: (minItems: number = CAT_MIN_ITEMS, maxItems: number = CAT_MAX_ITEMS, stoppingSE: number = CAT_STOPPING_SE) => {
        if (state.itemsAdministered >= maxItems) return true;
        if (state.itemsAdministered >= minItems && state.currentSE <= stoppingSE) return true;
        return false;
    },

    getState: () => ({
        currentTheta: state.currentTheta,
        currentSE: state.currentSE,
        itemsAdministered: state.itemsAdministered,
        responsePattern: [...state.responsePattern],
        usedItems: Array.from(state.usedItems)
    })
};

/* Export types */
export type {
    VisualReasoningStimulus,
    PracticeItem,
    TrialData,
    VisualReasoningState,
    CATParameters
};