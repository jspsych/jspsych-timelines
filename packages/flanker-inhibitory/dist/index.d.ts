import { JsPsych } from 'jspsych';

declare const trial_text: {
    continue_button: string;
    start_button: string;
    ready_button: string;
    end_button: string;
    practice_button: string;
    left_button: string;
    right_button: string;
    task_complete_header: string;
    task_complete_message: string;
    practice_header: string;
    practice_intro_message: string;
    practice_complete_header: string;
    practice_complete_message: string;
    practice_failed_message: string;
    main_task_header: string;
    main_task_intro: string;
    main_task_prompt: string;
    performance_title: string;
    accuracy_label: string;
    response_time_label: string;
    fixation_cross: string;
    correct_feedback: string;
    incorrect_feedback: string;
    too_slow_message: string;
    block_progress: string;
    trial_progress: string;
};
declare const tts_config: {
    voice_name: string;
    rate: number;
    pitch: number;
    volume: number;
    lang: string;
    speak_instructions: boolean;
    speak_prompts: boolean;
    speak_feedback: boolean;
    speak_completion: boolean;
    auto_speak_on_load: boolean;
    speak_button_text: boolean;
    speech_delay: number;
    allow_skip: boolean;
};
declare const tts_text: {
    welcome_spoken: string;
    task_explanation_spoken: string;
    directions_spoken: string;
    trial_prompt_spoken: string;
    correct_spoken: string;
    incorrect_spoken: string;
    practice_start_spoken: string;
    practice_complete_spoken: string;
    main_task_start_spoken: string;
    task_complete_spoken: string;
    skip_speech_text: string;
    speech_controls_note: string;
};
declare const instruction_pages: ({
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
} | {
    header2: string;
    description: string;
    task_explanation: string;
    performance_note: string;
    start_prompt: string;
    buttons: string[];
    header?: undefined;
    strategy_title?: undefined;
    strategy_intro?: undefined;
    strategy_points?: undefined;
})[];

declare function initializeTTS(config?: {
    voice_name: string;
    rate: number;
    pitch: number;
    volume: number;
    lang: string;
    speak_instructions: boolean;
    speak_prompts: boolean;
    speak_feedback: boolean;
    speak_completion: boolean;
    auto_speak_on_load: boolean;
    speak_button_text: boolean;
    speech_delay: number;
    allow_skip: boolean;
}): boolean;
declare function getAvailableVoices(): SpeechSynthesisVoice[];
declare function createUtterance(text: string, config?: {
    voice_name: string;
    rate: number;
    pitch: number;
    volume: number;
    lang: string;
    speak_instructions: boolean;
    speak_prompts: boolean;
    speak_feedback: boolean;
    speak_completion: boolean;
    auto_speak_on_load: boolean;
    speak_button_text: boolean;
    speech_delay: number;
    allow_skip: boolean;
}): SpeechSynthesisUtterance;
declare function stopSpeech(): void;
declare function speakText(text: string, config?: {
    voice_name: string;
    rate: number;
    pitch: number;
    volume: number;
    lang: string;
    speak_instructions: boolean;
    speak_prompts: boolean;
    speak_feedback: boolean;
    speak_completion: boolean;
    auto_speak_on_load: boolean;
    speak_button_text: boolean;
    speech_delay: number;
    allow_skip: boolean;
}, delay?: number): Promise<void>;
declare function speakInstructionPage(pageContent: string, config?: {
    voice_name: string;
    rate: number;
    pitch: number;
    volume: number;
    lang: string;
    speak_instructions: boolean;
    speak_prompts: boolean;
    speak_feedback: boolean;
    speak_completion: boolean;
    auto_speak_on_load: boolean;
    speak_button_text: boolean;
    speech_delay: number;
    allow_skip: boolean;
}): Promise<void>;
declare function speakTrialPrompt(config?: {
    voice_name: string;
    rate: number;
    pitch: number;
    volume: number;
    lang: string;
    speak_instructions: boolean;
    speak_prompts: boolean;
    speak_feedback: boolean;
    speak_completion: boolean;
    auto_speak_on_load: boolean;
    speak_button_text: boolean;
    speech_delay: number;
    allow_skip: boolean;
}): Promise<void>;
declare function speakFeedback(isCorrect: boolean, config?: {
    voice_name: string;
    rate: number;
    pitch: number;
    volume: number;
    lang: string;
    speak_instructions: boolean;
    speak_prompts: boolean;
    speak_feedback: boolean;
    speak_completion: boolean;
    auto_speak_on_load: boolean;
    speak_button_text: boolean;
    speech_delay: number;
    allow_skip: boolean;
}): Promise<void>;
declare function addSpeechControls(config?: {
    voice_name: string;
    rate: number;
    pitch: number;
    volume: number;
    lang: string;
    speak_instructions: boolean;
    speak_prompts: boolean;
    speak_feedback: boolean;
    speak_completion: boolean;
    auto_speak_on_load: boolean;
    speak_button_text: boolean;
    speech_delay: number;
    allow_skip: boolean;
}): () => void;
declare const default_stimuli: {
    left: string;
    right: string;
};
declare const fish_stimuli: {
    left: string;
    right: string;
};
declare const arrow_stimuli: {
    left: string;
    right: string;
};
declare function createFlankerStim(direction: any, congruent: any, stimuli?: string[] | {
    left?: string[];
    right?: string[];
} | {
    left: string;
    right: string;
}, stimuli_amount?: number): string;
declare function createPracticeStim(direction: any, congruent: any, stimuli?: string[] | {
    left?: string[];
    right?: string[];
} | {
    left: string;
    right: string;
}, stimuli_amount?: number): string;
interface FlankerConfig {
    stimuli_type?: 'fish' | 'arrow' | 'layered' | 'custom';
    svg?: string[];
    stimuli_amount?: number;
    fixation_duration?: number;
    show_instructions?: boolean;
    show_practice?: boolean;
    num_practice?: number;
    num_trials?: number;
    enable_tts?: boolean;
    tts_voice?: string;
    tts_rate?: number;
    tts_pitch?: number;
    tts_volume?: number;
    tts_lang?: string;
    speak_instructions?: boolean;
    speak_prompts?: boolean;
    speak_feedback?: boolean;
    auto_speak?: boolean;
}
declare function calculatePerformance(data: any[]): {
    accuracy: number;
    mean_rt: number;
    total_trials: number;
    correct_trials?: undefined;
} | {
    accuracy: number;
    mean_rt: number;
    total_trials: number;
    correct_trials: number;
};
declare function createTimeline(jsPsych: JsPsych, config?: FlankerConfig): {
    timeline: any[];
};
declare const timelineUnits: {
    instructions: string;
    practice: string;
    main: string;
    completion: string;
};
declare const utils: {
    calculatePerformance: typeof calculatePerformance;
    createFlankerStim: typeof createFlankerStim;
    createPracticeStim: typeof createPracticeStim;
    initializeTTS: typeof initializeTTS;
    speakText: typeof speakText;
    stopSpeech: typeof stopSpeech;
    getAvailableVoices: typeof getAvailableVoices;
    speakInstructionPage: typeof speakInstructionPage;
    speakTrialPrompt: typeof speakTrialPrompt;
    speakFeedback: typeof speakFeedback;
    addSpeechControls: typeof addSpeechControls;
};

declare const _default: {
    createTimeline: typeof createTimeline;
    timelineUnits: {
        instructions: string;
        practice: string;
        main: string;
        completion: string;
    };
    utils: {
        calculatePerformance: typeof calculatePerformance;
        createFlankerStim: typeof createFlankerStim;
        createPracticeStim: typeof createPracticeStim;
        initializeTTS: typeof initializeTTS;
        speakText: typeof speakText;
        stopSpeech: typeof stopSpeech;
        getAvailableVoices: typeof getAvailableVoices;
        speakInstructionPage: typeof speakInstructionPage;
        speakTrialPrompt: typeof speakTrialPrompt;
        speakFeedback: typeof speakFeedback;
        addSpeechControls: typeof addSpeechControls;
    };
};

export { type FlankerConfig, addSpeechControls, arrow_stimuli, calculatePerformance, createFlankerStim, createPracticeStim, createTimeline, createUtterance, _default as default, default_stimuli, fish_stimuli, getAvailableVoices, initializeTTS, instruction_pages, speakFeedback, speakInstructionPage, speakText, speakTrialPrompt, stopSpeech, timelineUnits, trial_text, tts_config, tts_text, utils };
