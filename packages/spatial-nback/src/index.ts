import { initJsPsych, JsPsych } from "jspsych"
import jsPsychPluginSpatialNback from "@jspsych/plugin-spatial-nback";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";

const instrictions_template = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="text-align: center; font-size: clamp(16px, 4vw, 20px); line-height: 1.5; padding: 10px; max-width: 90vw; margin: 0 auto;">
            <h2 style="font-size: clamp(20px, 5vw, 28px); margin-bottom: 20px;">Spatial N-Back Task</h2>
            <p style="margin-bottom: 15px;">In this task, you will see a grid with blue squares appearing in different positions.</p>
            <p style="margin-bottom: 15px;">Your job is to click the MATCH button whenever the current position is the same as the position from <strong>1 trial ago</strong>.</p>
            <p style="margin-bottom: 15px;">Try to respond as quickly and accurately as possible.</p>
            <p style="font-weight: bold; color: #2196F3;">Click the button below to begin the task.</p>
        </div>
    `,
    choices: ['Continue'],
};

// Generate stimulus sequence for n-back task
function generateNBackSequence(total_trials: number, n_back_level: number, target_percentage: number, rows: number, cols: number) {
    const positions: Array<{row: number, col: number}> = [];
    const is_target: boolean[] = [];
    
    // Generate first n trials (cannot be targets)
    for (let i = 0; i < n_back_level; i++) {
        positions.push({
            row: Math.floor(Math.random() * rows),
            col: Math.floor(Math.random() * cols)
        });
        is_target.push(false);
    }
    
    // Calculate number of targets to place
    const n_targets = Math.round((target_percentage / 100) * (total_trials - n_back_level));
    let targets_placed = 0;
    
    // Generate remaining trials with targets
    for (let i = n_back_level; i < total_trials; i++) {
        const can_be_target = targets_placed < n_targets;
        const should_be_target = can_be_target && Math.random() < 0.5;
        
        if (should_be_target) {
            // Make this a target trial (same position as n trials back)
            positions.push({
                row: positions[i - n_back_level].row,
                col: positions[i - n_back_level].col
            });
            is_target.push(true);
            targets_placed++;
        } else {
            // Generate non-target position
            let new_position: {row: number, col: number};
            do {
                new_position = {
                    row: Math.floor(Math.random() * rows),
                    col: Math.floor(Math.random() * cols)
                };
            } while (
                new_position.row === positions[i - n_back_level].row &&
                new_position.col === positions[i - n_back_level].col
            );
            positions.push(new_position);
            is_target.push(false);
        }
    }
    
    return { positions, is_target };
}

export function createSpatialNBackTimeline({
    rows = 3,
    cols = 3,
    n_back_level = 1,
    total_trials = 20,
    target_percentage = 25,
    stimulus_duration = 750,
    isi_duration = 250,
    feedback_duration = 1000,
    show_feedback = false,
    show_feedback_border = false,
    showFeedbackNoResponse = false,
    feedbackWaitNoResponse = true,
    cell_size = 150,
    instructions_trial = "Click the button when the position matches the one from {n} trial(s) ago",
    button_text = "MATCH",
    stimulus_color = "#2196F3",
    correct_color = "#4CAF50",
    incorrect_color = "#F44336",
    include_instructions = false,
    randomize_trials = false,
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
    showFeedbackNoResponse?: boolean,
    feedbackWaitNoResponse?: boolean,
    cell_size?: number,
    instructions_trial?: string,
    button_text?: string,
    stimulus_color?: string,
    correct_color?: string,
    incorrect_color?: string,
    include_instructions?: boolean,
    randomize_trials?: boolean,
} = {}) {

    // Generate the sequence
    const sequence = generateNBackSequence(total_trials, n_back_level, target_percentage, rows, cols);
    
    // Create individual trial objects
    const trials = [];
    for (let i = 0; i < total_trials; i++) {
        const trial_instructions = instructions_trial
            .replace('{n}', n_back_level.toString())
            .replace('{trial}', (i + 1).toString())
            .replace('{total}', total_trials.toString());

        trials.push({
            type: jsPsychPluginSpatialNback,
            rows: rows,
            cols: cols,
            stimulus_row: sequence.positions[i].row,
            stimulus_col: sequence.positions[i].col,
            is_target: sequence.is_target[i],
            stimulus_duration: stimulus_duration,
            isi_duration: isi_duration,
            feedback_duration: feedback_duration,
            show_feedback: show_feedback,
            show_feedback_border: show_feedback_border,
            showFeedbackNoResponse: showFeedbackNoResponse,
            feedbackWaitNoResponse: feedbackWaitNoResponse,
            cell_size: cell_size,
            instructions: trial_instructions,
            button_text: button_text,
            stimulus_color: stimulus_color,
            correct_color: correct_color,
            incorrect_color: incorrect_color,
            data: {
                trial_number: i + 1,
                n_back_level: n_back_level,
                total_trials: total_trials,
                task: 'spatial-nback'
            }
        });
    }

    // Create the main task timeline
    const task_timeline = {
        timeline: trials,
        randomize_order: randomize_trials
    };

    // Return complete timeline with or without instructions
    if (include_instructions) {
        // Update instructions to show current n-back level
        const custom_instructions = {
            ...instrictions_template,
            stimulus: instrictions_template.stimulus.replace(
                '<strong>1 trial ago</strong>',
                `<strong>${n_back_level} trial${n_back_level > 1 ? 's' : ''} ago</strong>`
            )
        };
        
        return {
            timeline: [custom_instructions, task_timeline]
        };
    } else {
        return task_timeline;
    }
}

// Create a practice timeline with fewer trials
export function createPracticeTimeline(options: Parameters<typeof createSpatialNBackTimeline>[0] = {}) {
    return createSpatialNBackTimeline({
        ...options,
        total_trials: 6,
        target_percentage: 33,
        show_feedback: true,
        show_feedback_border: true,
        include_instructions: true
    });
}

// Create multiple n-back levels timeline
export function createMultiLevelNBackTimeline({
    n_back_levels = [1, 2],
    trials_per_level = 20,
    randomize_levels = false,
    ...sharedOptions
}: {
    n_back_levels?: number[],
    trials_per_level?: number,
    randomize_levels?: boolean,
} & Parameters<typeof createSpatialNBackTimeline>[0] = {}) {
    
    const level_timelines = n_back_levels.map(level => {
        return createSpatialNBackTimeline({
            ...sharedOptions,
            n_back_level: level,
            total_trials: trials_per_level,
            include_instructions: false
        });
    });

    return {
        timeline: level_timelines,
        randomize_order: randomize_levels
    };
}

// Utility functions for common configurations
export const presetConfigurations = {
    easy: () => createSpatialNBackTimeline({
        n_back_level: 1,
        total_trials: 20,
        target_percentage: 30,
        show_feedback: true
    }),
    
    medium: () => createSpatialNBackTimeline({
        n_back_level: 2,
        total_trials: 30,
        target_percentage: 25,
        show_feedback: false
    }),
    
    hard: () => createSpatialNBackTimeline({
        n_back_level: 3,
        total_trials: 40,
        target_percentage: 20,
        show_feedback: false,
        rows: 4,
        cols: 4
    }),

    research: () => createMultiLevelNBackTimeline({
        n_back_levels: [1, 2, 3],
        trials_per_level: 50,
        target_percentage: 25,
        show_feedback: false,
        randomize_levels: true
    })
};

// Export individual components for custom use
export { instrictions_template, generateNBackSequence };

// Export default timeline creator
export default createSpatialNBackTimeline;

export const timelineUnits = {
    createPracticeTimeline,
    createSpatialNBackTimeline,
    createMultiLevelNBackTimeline,
};

export const utils = {
    presetConfigurations,
    generateNBackSequence,
    instrictions_template
}