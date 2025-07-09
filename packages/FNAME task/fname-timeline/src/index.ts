import { JsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychInstructions from '@jspsych/plugin-instructions';
import jsPsychAudioKeyboardResponse from '@jspsych/plugin-audio-keyboard-response';
import jsPsychPreload from '@jspsych/plugin-preload';
import { NAMES_POOL } from './names';
import { FACE_IMAGES, getFaceImagePath } from './faces';
import { FNAME_TEXT } from './text';

/* Constants */
const DEFAULT_FACE_NAME_PAIRS = 12;
const DEFAULT_PRESENTATION_TIME = 5000;
const DEFAULT_DELAY_DURATION = { min: 300000, max: 1500000 }; // 5-25 minutes in ms
const DEFAULT_SHOW_FEEDBACK = false;
const DEFAULT_INCLUDE_AUDIO = true;

/* Types */
interface FaceNamePair {
    face_id: string;
    face_path: string;
    name: string;
    first_letter: string;
}

interface TrialData {
    task: string;
    phase?: string;
    face_id?: string;
    name?: string;
    correct_response?: string;
    response?: string;
    correct?: boolean;
    rt?: number;
    difficulty_rating?: string;
}

interface FnameState {
    learningCompleted: boolean;
    delayStartTime: number | null;
    faceNamePairs: FaceNamePair[];
    currentTrialIndex: number;
}

/* Internal state */
let state: FnameState = {
    learningCompleted: false,
    delayStartTime: null,
    faceNamePairs: [],
    currentTrialIndex: 0
};

/* Internal functions */
function resetState() {
    state = {
        learningCompleted: false,
        delayStartTime: null,
        faceNamePairs: [],
        currentTrialIndex: 0
    };
}

function speakText(text: string) {
    if ('speechSynthesis' in window) {
        // Stop any ongoing speech
        speechSynthesis.cancel();

        // Create and speak the utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8; // Slightly slower for clarity
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
    }
  }

/* Text-to-Speech Configuration */
interface TTSConfig {
    rate?: number;      // 0.1 to 10, default 1
    pitch?: number;     // 0 to 2, default 1
    volume?: number;    // 0 to 1, default 0.8
    voice?: 'male' | 'female' | 'default';
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

function speakPageContent(
    htmlContent: string,
    config: TTSConfig = {}
): Promise<void> {
    return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported');
            resolve();
            return;
        }

        // Stop any ongoing speech
        stopSpeaking();

        // Parse HTML to extract text content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Remove button elements
        const buttons = tempDiv.querySelectorAll('button, .jspsych-btn');
        buttons.forEach(btn => btn.remove());

        // Get text content
        const textToSpeak = tempDiv.textContent?.trim() || '';

        if (!textToSpeak) {
            resolve();
            return;
        }

        // Create utterance
        currentUtterance = new SpeechSynthesisUtterance(textToSpeak);

        // Apply configuration
        currentUtterance.rate = config.rate || 1;
        currentUtterance.pitch = config.pitch || 1;
        currentUtterance.volume = config.volume || 0.8;

        // Set voice based on gender preference
        if (config.voice && config.voice !== 'default') {
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => {
                const voiceName = voice.name.toLowerCase();
                if (config.voice === 'female') {
                    return voiceName.includes('female') ||
                        voiceName.includes('woman') ||
                        voiceName.includes('samantha') ||
                        voiceName.includes('victoria') ||
                        voiceName.includes('karen');
                } else if (config.voice === 'male') {
                    return voiceName.includes('male') ||
                        voiceName.includes('man') ||
                        voiceName.includes('daniel') ||
                        voiceName.includes('james') ||
                        voiceName.includes('david');
                }
                return false;
            });

            if (preferredVoice) {
                currentUtterance.voice = preferredVoice;
            }
        }

        // Handle completion
        currentUtterance.onend = () => {
            currentUtterance = null;
            resolve();
        };

        currentUtterance.onerror = () => {
            currentUtterance = null;
            resolve();
        };

        // Start speaking
        speechSynthesis.speak(currentUtterance);
    });
}

function stopSpeaking() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    currentUtterance = null;
}

function initializeTTS(callback?: () => void) {
    if (!('speechSynthesis' in window)) {
        callback?.();
        return;
    }

    const voices = speechSynthesis.getVoices();

    if (voices.length > 0) {
        callback?.();
    } else {
        speechSynthesis.addEventListener('voiceschanged', function voicesLoadedHandler() {
            speechSynthesis.removeEventListener('voiceschanged', voicesLoadedHandler);
            callback?.();
        }, { once: true });
    }
}

function generateFaceNamePairs(number_of_pairs: number = DEFAULT_FACE_NAME_PAIRS): FaceNamePair[] {
    const pairs: FaceNamePair[] = [];
    const selectedFaces = shuffleArray(FACE_IMAGES).slice(0, number_of_pairs);
    const selectedNames = shuffleArray(NAMES_POOL).slice(0, number_of_pairs);

    for (let i = 0; i < number_of_pairs; i++) {
        pairs.push({
            face_id: selectedFaces[i],
            face_path: getFaceImagePath(selectedFaces[i]),
            name: selectedNames[i],
            first_letter: selectedNames[i].charAt(0).toUpperCase()
        });
    }

    return pairs;
}

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function generateDistractorFaces(correct_face: string, all_faces: string[], number_of_distractors: number = 2): string[] {
    const available_faces = all_faces.filter(face => face !== correct_face);
    return shuffleArray(available_faces).slice(0, number_of_distractors);
}

function generateDistractorNames(correct_name: string, all_names: string[], number_of_distractors: number = 2): string[] {
    const available_names = all_names.filter(name => name !== correct_name);
    return shuffleArray(available_names).slice(0, number_of_distractors);
}

/* Timeline component generating functions */
function createWelcome(tts_config?: TTSConfig) {
    const text = FNAME_TEXT.welcome;
    const stimulus = `
        <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
            <h1>${text.title}</h1>
            <p>${text.subtitle}</p>
            <p>${text.description}</p>
            <p>${text.info}</p>
        </div>
    `;
    const welcome = {
        type: jsPsychHtmlButtonResponse,
        stimulus: stimulus,
        choices: [text.buttonText],
        post_trial_gap: 500,
        on_load: function () {
            if (tts_config) {
                speakPageContent(stimulus, tts_config);
            }
        },
        on_finish: function () {
            stopSpeaking();
        }
    };

    return welcome;
}

function createInstructions(include_audio?: boolean, tts_config?: TTSConfig) {
    const text = FNAME_TEXT.instructions;
    const pages = text.pages.map(page => `
        <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
            <h2>${page.title}</h2>
            ${page.content.map(line => `<p>${line}</p>`).join('')}
        </div>
    `);
    const instructions = {
        type: jsPsychInstructions,
        pages: pages,
        show_clickable_nav: true,
        button_label_previous: text.navigation.previous,
        button_label_next: text.navigation.next,
        button_label_finish: text.navigation.finish,
        on_load: function () {
            if (tts_config) {
                speakPageContent(pages[0], tts_config);
                speakPageContent(pages[1], tts_config);
            }
        },
        on_finish: function () {
            stopSpeaking();
        }
    };
    

    return instructions;
}

function createPracticeItem() {
    const practice = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="text-align: center; padding: 20px;">
                <img src="${getFaceImagePath(FACE_IMAGES[Math.floor(Math.random() * FACE_IMAGES.length)])}" style="width: 300px; height: 400px; object-fit: cover; border-radius: 10px;">
                <h2 style="margin-top: 20px;">${NAMES_POOL[Math.floor(Math.random() * NAMES_POOL.length)]}</h2>
            </div>
        `,
        choices: ['Easy', 'Hard'],
        button_html: (choice) => `<button class="jspsych-btn" style="margin: 0 20px; padding: 15px 30px; font-size: 18px;">${choice}</button>`,
        trial_duration: DEFAULT_PRESENTATION_TIME,
        data: {
            task: 'practice',
            phase: 'learning'
        }
    };

    return practice;
}

function createLearningTransition(tts_config?: TTSConfig) {
    const text = FNAME_TEXT.learningTransition;
    const stimulus = `
        <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
            <h1>${text.title}</h1>
            ${text.content.map(line => `<p>${line}</p>`).join('')}
        </div>
    `;
    const transition = {
        type: jsPsychHtmlButtonResponse,
        stimulus: stimulus,
        choices: [text.buttonText],
        post_trial_gap: 500,
        on_load: function () {
            if (tts_config) {
                speakPageContent(stimulus, tts_config);
            }
        },
        on_finish: function () {
            stopSpeaking();
        }    
    };

    return transition;
}

function createLearningTrial(
    jsPsych: JsPsych,
    face_name_pair: FaceNamePair,
    trial_index: number,
    presentation_time?: number
) {
    const trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="text-align: center; padding: 20px;">
                <img src="${face_name_pair.face_path}" style="width: 300px; height: 400px; object-fit: cover; border-radius: 10px;">
                <h2 style="margin-top: 20px;">${face_name_pair.name}</h2>
            </div>
        `,
        choices: ['Easy', 'Hard'],
        button_html: (choice) => `<button class="jspsych-btn" style="margin: 0 20px; padding: 15px 30px; font-size: 18px;">${choice}</button>`,
        trial_duration: presentation_time || DEFAULT_PRESENTATION_TIME,
        data: {
            task: 'learning',
            phase: 'learning',
            face_id: face_name_pair.face_id,
            name: face_name_pair.name,
            trial_index: trial_index
        },
        on_finish: (data: any) => {
            data.difficulty_rating = data.response === 0 ? 'easy' : 'hard';
        }
    };

    return trial;
}

function createLearningComplete() {
    const complete = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
                <h2>Good job!</h2>
                <p>We will ask you about these names and faces later.</p>
                <p>There will be a delay period before the memory test.</p>
            </div>
        `,
        choices: ['Continue'],
        post_trial_gap: 500,
        on_finish: () => {
            state.learningCompleted = true;
            state.delayStartTime = Date.now();
        }
    };

    return complete;
}

function createDelayInstructions() {
    const instructions = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
                <h2>Delay Period</h2>
                <p>Please wait for 5-25 minutes before continuing with the memory test.</p>
                <p>You may take a break or complete other tasks during this time.</p>
                <p>When you're ready to continue (after at least 5 minutes), click the button below.</p>
            </div>
        `,
        choices: ['Continue to Memory Test'],
        on_finish: () => {
            const elapsed = Date.now() - (state.delayStartTime || Date.now());
            if (elapsed < 300000) { // Less than 5 minutes
                alert('Please wait at least 5 minutes before continuing. Time elapsed: ' + Math.floor(elapsed / 60000) + ' minutes.');
                return false;
            }
            return true;
        }
    };

    return instructions;
}

function createFaceSeenBeforeInstructions() {
    const instructions = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
                <h2>Face Recognition Test</h2>
                <p>Now you are going to be asked some questions about the faces and names you saw earlier.</p>
                <p>On the next screens, you will see three faces.</p>
                <p>Tap the face that you have already seen.</p>
                <p>Choose as quickly as you can.</p>
            </div>
        `,
        choices: ['Begin']
    };

    return instructions;
}

function createFaceSeenBeforeTrial(
    jsPsych: JsPsych,
    correct_pair: FaceNamePair,
    all_face_ids: string[],
    trial_index: number
) {
    const distractors = generateDistractorFaces(correct_pair.face_id, all_face_ids, 2);
    const all_options = shuffleArray([correct_pair.face_id, ...distractors]);
    const correct_index = all_options.indexOf(correct_pair.face_id);

    const trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="text-align: center; padding: 20px;">
                <h3>Which face have you seen before?</h3>
            </div>
        `,
        choices: all_options,
        button_html: (choice, i) => `<img src="${getFaceImagePath(choice)}" style="width: 200px; height: 267px; object-fit: cover; border-radius: 10px; cursor: pointer; border: 3px solid transparent;" data-choice="${i}">`,
        data: {
            task: 'delay',
            phase: 'face_seen_before',
            face_id: correct_pair.face_id,
            correct_response: correct_index,
            trial_index: trial_index
        },
        on_finish: (data: any) => {
            data.correct = data.response === data.correct_response;
        }
    };

    return trial;
}

function createFirstLetterInstructions() {
    const instructions = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
                <h2>First Letter Test</h2>
                <p>On the next screens, look at the picture and tap the FIRST letter of the person's name.</p>
                <p>Choose as quickly as you can.</p>
            </div>
        `,
        choices: ['Begin']
    };

    return instructions;
}

function createFirstLetterTrial(
    jsPsych: JsPsych,
    face_name_pair: FaceNamePair,
    trial_index: number
) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="text-align: center; padding: 20px;">
                <img src="${face_name_pair.face_path}" style="width: 250px; height: 333px; object-fit: cover; border-radius: 10px;">
                <h3 style="margin-top: 20px;">What is the first letter of this person's name?</h3>
            </div>
        `,
        choices: alphabet,
        button_html: (choice) => `<button class="jspsych-btn" style="width: 50px; height: 50px; margin: 5px; font-size: 20px;">${choice}</button>`,
        button_layout: 'grid',
        grid_rows: 4,
        grid_columns: 7,
        data: {
            task: 'delay',
            phase: 'first_letter',
            face_id: face_name_pair.face_id,
            correct_response: face_name_pair.first_letter,
            trial_index: trial_index
        },
        on_finish: (data: any) => {
            data.correct = alphabet[data.response] === data.correct_response;
        }
    };

    return trial;
}

function createMatchingInstructions() {
    const instructions = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
                <h2>Name Matching Test</h2>
                <p>On the next screens, look at the picture and tap the name that goes with the face.</p>
                <p>Choose as quickly as you can.</p>
            </div>
        `,
        choices: ['Begin']
    };

    return instructions;
}

function createMatchingTrial(
    jsPsych: JsPsych,
    face_name_pair: FaceNamePair,
    all_names: string[],
    trial_index: number
) {
    const distractors = generateDistractorNames(face_name_pair.name, all_names, 2);
    const all_options = shuffleArray([face_name_pair.name, ...distractors]);
    const correct_index = all_options.indexOf(face_name_pair.name);

    const trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="text-align: center; padding: 20px;">
                <img src="${face_name_pair.face_path}" style="width: 250px; height: 333px; object-fit: cover; border-radius: 10px;">
                <h3 style="margin-top: 20px;">What is this person's name?</h3>
            </div>
        `,
        choices: all_options,
        button_html: (choice) => `<button class="jspsych-btn" style="margin: 10px; padding: 15px 30px; font-size: 18px;">${choice}</button>`,
        data: {
            task: 'delay',
            phase: 'matching',
            face_id: face_name_pair.face_id,
            correct_response: face_name_pair.name,
            correct_index: correct_index,
            trial_index: trial_index
        },
        on_finish: (data: any) => {
            data.correct = data.response === data.correct_index;
        }
    };

    return trial;
}

function createResults(jsPsych: JsPsych) {
    const results = {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
            const learning_trials = jsPsych.data.get().filter({ task: 'learning' });
            const delay_trials = jsPsych.data.get().filter({ task: 'delay' });

            const fsb_trials = delay_trials.filter({ phase: 'face_seen_before' });
            const fnl_trials = delay_trials.filter({ phase: 'first_letter' });
            const fnm_trials = delay_trials.filter({ phase: 'matching' });

            const fsb_correct = fsb_trials.filter({ correct: true }).count();
            const fnl_correct = fnl_trials.filter({ correct: true }).count();
            const fnm_correct = fnm_trials.filter({ correct: true }).count();

            const fsb_accuracy = fsb_trials.count() > 0 ? Math.round(fsb_correct / fsb_trials.count() * 100) : 0;
            const fnl_accuracy = fnl_trials.count() > 0 ? Math.round(fnl_correct / fnl_trials.count() * 100) : 0;
            const fnm_accuracy = fnm_trials.count() > 0 ? Math.round(fnm_correct / fnm_trials.count() * 100) : 0;

            const easy_count = learning_trials.filter({ difficulty_rating: 'easy' }).count();
            const hard_count = learning_trials.filter({ difficulty_rating: 'hard' }).count();

            return `
                <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                    <h2>FNAME Task Complete!</h2>
                    <div style="text-align: left; background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Learning Phase Results:</h3>
                        <p><strong>Easy ratings:</strong> ${easy_count} faces</p>
                        <p><strong>Hard ratings:</strong> ${hard_count} faces</p>
                        
                        <h3 style="margin-top: 20px;">Memory Test Results:</h3>
                        <p><strong>Face Recognition:</strong> ${fsb_accuracy}% correct (${fsb_correct}/${fsb_trials.count()})</p>
                        <p><strong>First Letter Recall:</strong> ${fnl_accuracy}% correct (${fnl_correct}/${fnl_trials.count()})</p>
                        <p><strong>Name Matching:</strong> ${fnm_accuracy}% correct (${fnm_correct}/${fnm_trials.count()})</p>
                        
                        <h3 style="margin-top: 20px;">Overall Performance:</h3>
                        <p><strong>Total Accuracy:</strong> ${Math.round((fsb_accuracy + fnl_accuracy + fnm_accuracy) / 3)}%</p>
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
            number_of_face_name_pairs = DEFAULT_FACE_NAME_PAIRS,
            presentation_time = DEFAULT_PRESENTATION_TIME,
            delay_duration = DEFAULT_DELAY_DURATION,
            show_feedback = DEFAULT_SHOW_FEEDBACK,
            include_audio = DEFAULT_INCLUDE_AUDIO,
            show_instructions = true,
            show_results = true,
            randomize_learning_order = true,
            randomize_test_order = true,
            include_practice = true,
            auto_advance_delay = false,
            tts_config = { rate: 1, volume: 0.8, voice: 'female' }
        }: {
            number_of_face_name_pairs?: number,
            presentation_time?: number,
            delay_duration?: { min: number, max: number },
            show_feedback?: boolean,
            include_audio?: boolean,
            show_instructions?: boolean,
            show_results?: boolean,
            randomize_learning_order?: boolean,
            randomize_test_order?: boolean,
            include_practice?: boolean,
            auto_advance_delay?: boolean,
            tts_config?: TTSConfig
        } = {}
    ) {
        // Reset state for new timeline
        resetState();

        const timeline: any[] = [];

        // Generate face-name pairs
        state.faceNamePairs = generateFaceNamePairs(number_of_face_name_pairs);

        // Get all face IDs and names for distractor generation
        const all_face_ids = FACE_IMAGES.slice(0, number_of_face_name_pairs * 3); // Get extra for distractors
        const all_names = NAMES_POOL.slice(0, number_of_face_name_pairs * 3);

        // Preload images
        // const preload = {
        //     type: jsPsychPreload,
        //     images: () => {
        //         const images = [];
        //         // Add all face images that might be used
        //         for (const face_id of all_face_ids) {
        //             images.push(getFaceImagePath(face_id));
        //         }
        //         return images;
        //     }
        // };
        // timeline.push(preload);

        // Replace your existing preload with this:
        const preload = {
            type: jsPsychPreload,
            images: () => {
                const images = [];
                // Add all face images that might be used
                for (const face_id of all_face_ids) {
                    images.push(getFaceImagePath(face_id));
                }
                return images;
            },
            on_finish: function () {
                if (include_audio) {
                    initializeTTS();
                }
            }
        };
        timeline.push(preload);
        // PART 1: LEARNING PHASE

        // Add welcome
        timeline.push(createWelcome(include_audio ? tts_config : undefined));

        // Add instructions if requested
        if (show_instructions) {
            timeline.push(createInstructions(include_audio, include_audio ? tts_config : undefined));
        }

        // Add practice item if requested
        if (include_practice) {
            timeline.push(createPracticeItem());
        }

        // Add learning transition
        timeline.push(createLearningTransition(include_audio ? tts_config : undefined));

        // Add learning trials
        const learning_order = randomize_learning_order ?
            shuffleArray([...Array(state.faceNamePairs.length).keys()]) :
            [...Array(state.faceNamePairs.length).keys()];

        for (const index of learning_order) {
            timeline.push(createLearningTrial(
                jsPsych,
                state.faceNamePairs[index],
                index,
                presentation_time
            ));
        }

        // Add learning complete message
        timeline.push(createLearningComplete());

        // DELAY PHASE

        if (!auto_advance_delay) {
            // Add delay instructions for manual continuation
            timeline.push(createDelayInstructions());
        } else {
            // Add automatic delay
            const delay = {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: `
                <div style="text-align: center; padding: 20px;">
                    <h2>Please wait...</h2>
                    <p>The memory test will begin automatically.</p>
                </div>
            `,
                choices: "NO_KEYS",
                trial_duration: delay_duration.min
            };
            timeline.push(delay);
        }

        // PART 2: MEMORY TEST PHASE

        // Face Seen Before (FSB) phase
        timeline.push(createFaceSeenBeforeInstructions());

        const fsb_order = randomize_test_order ?
            shuffleArray([...Array(state.faceNamePairs.length).keys()]) :
            [...Array(state.faceNamePairs.length).keys()];

        for (const index of fsb_order) {
            timeline.push(createFaceSeenBeforeTrial(
                jsPsych,
                state.faceNamePairs[index],
                all_face_ids,
                index
            ));
        }

        // First Letter of Name (FNL) phase
        timeline.push(createFirstLetterInstructions());

        const fnl_order = randomize_test_order ?
            shuffleArray([...Array(state.faceNamePairs.length).keys()]) :
            [...Array(state.faceNamePairs.length).keys()];

        for (const index of fnl_order) {
            timeline.push(createFirstLetterTrial(
                jsPsych,
                state.faceNamePairs[index],
                index
            ));
        }

        // Matching (FNM) phase
        timeline.push(createMatchingInstructions());

        const fnm_order = randomize_test_order ?
            shuffleArray([...Array(state.faceNamePairs.length).keys()]) :
            [...Array(state.faceNamePairs.length).keys()];

        for (const index of fnm_order) {
            timeline.push(createMatchingTrial(
                jsPsych,
                state.faceNamePairs[index],
                all_names,
                index
            ));
        }

        // Add results if requested
        if (show_results) {
            timeline.push(createResults(jsPsych));
        }

        return timeline;
    }

    /* Export individual components for custom timeline building */
    export const timelineComponents = {
        createWelcome,
        createInstructions,
        createPracticeItem,
        createLearningTransition,
        createLearningTrial,
        createLearningComplete,
        createDelayInstructions,
        createFaceSeenBeforeInstructions,
        createFaceSeenBeforeTrial,
        createFirstLetterInstructions,
        createFirstLetterTrial,
        createMatchingInstructions,
        createMatchingTrial,
        createResults
    };

    /* Export utility functions */
    export const utils = {
        resetState,
        generateFaceNamePairs,
        shuffleArray,
        generateDistractorFaces,
        generateDistractorNames
    };

    /* Export types */
    export type { FaceNamePair, TrialData, FnameState };