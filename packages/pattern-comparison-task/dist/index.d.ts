import { JsPsych } from 'jspsych';
import jsPsychInstructions from '@jspsych/plugin-instructions';

declare const trial_text: {
    next_button: string;
    back_button: string;
    task_complete_header: string;
    task_complete_message: string;
    prompt: string;
    fixation_cross: string;
    same_button: string;
    different_button: string;
};
declare const instruction_pages: string[];

interface PatternComparisonConfig {
    /** Array of test categories, each containing test pairs */
    test_categories?: any[];
    /** Number of trials to generate */
    num_trials?: number;
    /** Instructions text to display above each trial */
    prompt?: string;
    /** Enable text-to-speech for instructions and prompts */
    enable_tts?: boolean;
    /** Text for the "same" button */
    same_button_text?: string;
    /** Text for the "different" button */
    different_button_text?: string;
    /** Maximum time allowed per trial (in ms) */
    trial_timeout?: number;
    /** Inter-trial interval (in ms) */
    inter_trial_interval?: number;
    /** Show instruction pages before the task */
    show_instructions?: boolean;
    /** Custom instruction texts */
    instruction_texts?: typeof instruction_pages;
    tts_method?: 'google' | 'system';
    tts_rate?: number;
    tts_pitch?: number;
    tts_volume?: number;
    tts_lang?: string;
}
/**
 * Intelligent TTS with user preference support
 * Tries user's preferred method first, then the other method as fallback
 */
declare function speakText(text: string, options?: {
    lang?: string;
    volume?: number;
    method?: 'google' | 'system';
}): Promise<void>;
declare function createInstructions(instruction_pages_data?: string[], enable_tts?: boolean, ttsOptions?: {}): {
    type: typeof jsPsychInstructions;
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
};
declare function generateTrials(config: PatternComparisonConfig): any[];
declare function createTimeline(jsPsych: JsPsych, config?: PatternComparisonConfig): {
    timeline: any[];
};
/** Calculate accuracy and reaction time statistics by category */
declare function calculatePerformance(data: any[]): {
    overall: {
        accuracy: number;
        mean_reaction_time: number;
        total_trials: number;
        correct_trials: number;
    };
    by_category: {
        category_index: number;
        accuracy: number;
        mean_reaction_time: number;
        total_trials: number;
        correct_trials: number;
    }[];
};
declare const timelineUnits: {
    instructions: string;
    trial: string;
    interTrialInterval: string;
    endScreen: string;
};
declare const utils: {
    generateTrials: typeof generateTrials;
    createInstructions: typeof createInstructions;
    speakText: typeof speakText;
    calculatePerformance: typeof calculatePerformance;
};

declare const _default: {
    createTimeline: typeof createTimeline;
    timelineUnits: {
        instructions: string;
        trial: string;
        interTrialInterval: string;
        endScreen: string;
    };
    utils: {
        generateTrials: typeof generateTrials;
        createInstructions: typeof createInstructions;
        speakText: typeof speakText;
        calculatePerformance: typeof calculatePerformance;
    };
};

export { createInstructions, createTimeline, _default as default, instruction_pages, timelineUnits, trial_text, utils };
