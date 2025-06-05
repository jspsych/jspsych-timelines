import { initJsPsych, JsPsych } from "jspsych"
import jsPsychPluginSpatialNbackTs from "../../plugin-spatial-nback-ts";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

// Remove this - don't initialize jsPsych here, let the consumer do it
const jsPsych = initJsPsych();


const task_instructions = {
    type: jsPsychHtmlKeyboardResponse,
    response_ends_trial: true,
    on_load: function() {
        document.body.addEventListener('pointerdown', function endTrialOnClick() {
            jsPsych.finishTrial();
            document.body.removeEventListener('pointerdown', endTrialOnClick);
        });
    },
    stimulus: `
        <div style="text-align: center; font-size: clamp(16px, 4vw, 20px); line-height: 1.5; padding: 10px; max-width: 90vw; margin: 0 auto;">
            <h2 style="font-size: clamp(20px, 5vw, 28px); margin-bottom: 20px;">Spatial N-Back Task</h2>
            <p style="margin-bottom: 15px;">In this task, you will see a grid with blue squares appearing in different positions.</p>
            <p style="margin-bottom: 15px;">Your job is to click the MATCH button whenever the current position is the same as the position from <strong>1 trial ago</strong>.</p>
            <p style="margin-bottom: 15px;">Try to respond as quickly and accurately as possible.</p>
            <p style="font-weight: bold; color: #2196F3;">Press any key or tap anywhere to begin the task.</p>
        </div>
    `,
    choices: "ALL_KEYS"
};

export function createTimeline(jsPsych: JsPsych, {
    rows = 3,
    cols = 3,
    n_back_level = 1,
    total_trials = 6,
    target_percentage = 25,
    stimulus_duration = 750,
    isi_duration = 250,
    feedback_duration = 1000,
    show_feedback = false,
    show_feedback_border = false,
    progress_bar = true,
    showFeedbackNoResponse = true,
    cell_size = 80,
    instructions = "Click MATCH when the position matches the one from {n} trial(s) ago",
    button_text = "MATCH",
    stimulus_color = "#2196F3",
    correct_color = "#4CAF50",
    incorrect_color = "#F44336",
}: {
    rows?: number,
    cols?: number,
    n_back_level?: number,
    total_trials?: number,
    target_percentage?: number,
    stimulus_duration?: number,
    isi_duration?: number,
    feedback_duration?: number,
    show_feedback?: boolean,
    show_feedback_border?: boolean,
    progress_bar?: boolean,
    showFeedbackNoResponse?: boolean,
    cell_size?: number,
    instructions?: string,
    button_text?: string,
    stimulus_color?: string,
    correct_color?: string,
    incorrect_color?: string,
} = {}) {

    // Create the actual spatial n-back task trial
    const spatial_nback_task = {
        type: jsPsychPluginSpatialNbackTs,
        rows: rows,
        cols: cols,
        n_back_level: n_back_level,
        total_trials: total_trials,
        target_percentage: target_percentage,
        stimulus_duration: stimulus_duration,
        isi_duration: isi_duration,
        feedback_duration: feedback_duration,
        show_feedback: show_feedback,
        show_feedback_border: show_feedback_border,
        show_progress: progress_bar,
        showFeedbackNoResponse: showFeedbackNoResponse,
        cell_size: cell_size,
        instructions: instructions,
        button_text: button_text,
        stimulus_color: stimulus_color,
        correct_color: correct_color,
        incorrect_color: incorrect_color,
    };

    // Return the complete timeline
    return {
        timeline: [task_instructions, spatial_nback_task]
    };
}

// Export the timeline units for modular use
export const timelineUnits = {
    instructions: task_instructions,
    createTask: (params: any) => ({
        type: jsPsychPluginSpatialNbackTs,
        ...params
    })
};

export const utils = { task_instructions };
