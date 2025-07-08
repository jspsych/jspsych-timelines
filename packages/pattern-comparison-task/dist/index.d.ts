import { JsPsych } from 'jspsych';

declare const trial_text: {
    same_button: string;
    different_button: string;
    prompt: string;
    task_complete_header: string;
    task_complete_message: string;
    fixation_cross: string;
};
declare const instruction_pages: ({
    header: string;
    header2: string;
    description: string;
    task_explanation: string;
    performance_note: string;
    strategy_title: string;
    strategy_intro: string;
    strategy_points: string[];
    start_prompt: string;
    buttons: string[];
    button_html: string[];
} | {
    header: string;
    header2: string;
    description: string;
    task_explanation: string;
    performance_note: string;
    start_prompt: string;
    buttons: string[];
    strategy_title?: undefined;
    strategy_intro?: undefined;
    strategy_points?: undefined;
    button_html?: undefined;
} | {
    strategy_title: string;
    strategy_intro: string;
    strategy_points: string[];
    start_prompt: string;
    buttons: string[];
    header?: undefined;
    header2?: undefined;
    description?: undefined;
    task_explanation?: undefined;
    performance_note?: undefined;
    button_html?: undefined;
})[];

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
}
declare function speakText(text: string): void;
declare function createInstructions(instruction_pages_data?: ({
    header: string;
    header2: string;
    description: string;
    task_explanation: string;
    performance_note: string;
    strategy_title: string;
    strategy_intro: string;
    strategy_points: string[];
    start_prompt: string;
    buttons: string[];
    button_html: string[];
} | {
    header: string;
    header2: string;
    description: string;
    task_explanation: string;
    performance_note: string;
    start_prompt: string;
    buttons: string[];
    strategy_title?: undefined;
    strategy_intro?: undefined;
    strategy_points?: undefined;
    button_html?: undefined;
} | {
    strategy_title: string;
    strategy_intro: string;
    strategy_points: string[];
    start_prompt: string;
    buttons: string[];
    header?: undefined;
    header2?: undefined;
    description?: undefined;
    task_explanation?: undefined;
    performance_note?: undefined;
    button_html?: undefined;
})[], enable_tts?: boolean): {
    timeline: any[];
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
