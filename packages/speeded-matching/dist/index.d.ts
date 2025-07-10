import { JsPsych } from 'jspsych';
import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
import InstructionsPlugin from '@jspsych/plugin-instructions';

declare const test_items: string[];

declare const trial_text: {
    continue_button: string;
    start_button: string;
    ready_button: string;
    end_button: string;
    next_button: string;
    back_button: string;
    task_complete_header: string;
    task_complete_message: string;
    practice_header: string;
    practice_intro_message: string;
    practice_look_instruction: string;
    practice_tap_instruction: string;
    practice_complete_header: string;
    practice_complete_message: string;
    main_task_prompt: string;
    fixation_cross: string;
    correct_feedback: string;
    incorrect_feedback: string;
    too_slow_message: string;
};
declare const instruction_pages: string[];

interface SpeedMatchingConfig {
    /** Array of test items (animal SVGs) to use as stimuli */
    test_items?: string[];
    /** Number of trials to generate */
    num_trials?: number;
    /** Number of choice options per trial (default 4) */
    num_choices?: number;
    /** Enable text-to-speech for instructions and prompts */
    enable_tts?: boolean;
    /** Maximum time allowed per trial (in ms) */
    trial_timeout?: number;
    /** Inter-trial interval (in ms) */
    inter_trial_interval?: number;
    /** Show instruction pages before the task */
    show_instructions?: boolean;
    /** Show practice round before main task */
    show_practice?: boolean;
    /** Number of practice rounds to show (default 1) */
    practice_rounds?: number;
    /** Custom instruction texts */
    instruction_texts?: typeof instruction_pages;
}
/**
 * Function to provide text-to-speech functionality
 * Researchers can modify speech settings like rate and volume
 */
declare function speakText(text: string): void;
/**
 * Function to get a random selection of test items for creating choice sets
 * This ensures variety in the stimuli presented to participants
 */
declare function getRandomTestItems(items: string[], count?: number): string[];
/**
 * Function to create a trial set with one target and distractors
 * items: array of item strings (e.g., SVGs)
 * target_index: index of the item to use as target
 * num_choices: total number of choices to present (default 4)
 * Returns an object with target and choices array
 */
declare function createTrialSet(items: string[], target_index?: number, num_choices?: number): {
    target: string;
    choices: string[];
    correct_answer: number;
    target_index: number;
};
/**
 * Creates instruction pages with configurable text and TTS support
 * Uses the jsPsych instructions plugin with simple HTML strings
 */
declare function createInstructions(instruction_pages_data?: string[], enable_tts?: boolean): {
    type: typeof InstructionsPlugin;
    pages: string[];
    show_clickable_nav: boolean;
    allow_keys: boolean;
    key_forward: string;
    key_backward: string;
    button_label_previous: string;
    button_label_next: string;
    on_start: () => void;
    on_load: () => void;
    on_finish: (data: any) => void;
    data: {
        task: string;
    };
};
/**
 * Creates practice rounds with voice instructions and visual demonstrations
 * This helps participants understand the task before the actual trials
 */
declare function createPracticeRound(items: string[], enable_tts?: boolean, num_choices?: number, practice_rounds?: number): any[];
/**
 * Creates ready screen asking if user is ready for the actual test
 */
declare function createReadyScreen(): {
    type: typeof HtmlButtonResponsePlugin;
    stimulus: string;
    choices: string[];
    button_html: (choice: any) => string;
    data: {
        task: string;
    };
};
/**
 * Generates trials for the main speeded matching task
 * Each trial presents a target and multiple choice options
 */
declare function generateTrials(config: SpeedMatchingConfig): any[];
/**
 * Main function to create the complete speeded matching timeline
 * Includes instructions, practice, and test phases based on configuration
 */
declare function createTimeline(jsPsych: JsPsych, config?: SpeedMatchingConfig): {
    timeline: any[];
};
/**
 * Function to calculate accuracy and reaction time statistics
 * just for exporting with utils
*/
declare function calculatePerformance(data: any[]): {
    overall: {
        accuracy: number;
        mean_reaction_time: number;
        total_trials: number;
        correct_trials: number;
    };
    by_target: {};
};
declare const timelineUnits: {
    instructions: string;
    practice: string;
    readyScreen: string;
    trial: string;
    interTrialInterval: string;
    endScreen: string;
};
declare const utils: {
    generateTrials: typeof generateTrials;
    createInstructions: typeof createInstructions;
    createPracticeRound: typeof createPracticeRound;
    createReadyScreen: typeof createReadyScreen;
    speakText: typeof speakText;
    createTrialSet: typeof createTrialSet;
    getRandomTestItems: typeof getRandomTestItems;
    calculatePerformance: typeof calculatePerformance;
};

declare const _default: {
    createTimeline: typeof createTimeline;
    timelineUnits: {
        instructions: string;
        practice: string;
        readyScreen: string;
        trial: string;
        interTrialInterval: string;
        endScreen: string;
    };
    utils: {
        generateTrials: typeof generateTrials;
        createInstructions: typeof createInstructions;
        createPracticeRound: typeof createPracticeRound;
        createReadyScreen: typeof createReadyScreen;
        speakText: typeof speakText;
        createTrialSet: typeof createTrialSet;
        getRandomTestItems: typeof getRandomTestItems;
        calculatePerformance: typeof calculatePerformance;
    };
};

export { createInstructions, createTimeline, _default as default, instruction_pages, test_items, timelineUnits, trial_text, utils };
