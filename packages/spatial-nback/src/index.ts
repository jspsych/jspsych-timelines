import { initJsPsych, JsPsych } from "jspsych"
import jsPsychPluginSpatialNback from "@jspsych-contrib/plugin-spatial-nback";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, instruction_pages } from "./text";

function createInstructions(instructions = instruction_pages) {
    const pages: string[] = [];
    // Iterate through instruction texts and replace placeholders
    for (const text of instruction_pages) {
        pages.push(`
            <h1>${text.header || ""}</h1>
            <h2>${text.header2 || ""}</h2>
            <p>${text.description || ""}</p>
            <p>${text.task_explanation || ""}</p>
            <p>${text.performance_note || ""}</p>    
            <h2>${text.strategy_title || ""}</h2>
            <p>${text.strategy_intro || ""}</p>
            <ul>
            ${text.strategy_points?.map(point => `<li>${point}</li>`).join('') || ""}
            </ul>
            <p style="font-weight: bold; color: #2196F3;">${text.start_prompt || ""}</p>
        `);
    }

    // Add the pages using instruction plugin
    return {
        type: jsPsychInstructions,
        pages: pages,
        button_label_next: "Continue",
        button_label_previous: "Back",
        show_clickable_nav: true
    };
    
}

// Generate stimulus sequence for n-back task
function generateNBackSequence(total_trials: number, n_back: number, target_percentage: number, rows: number, cols: number) {
    const positions: Array<{row: number, col: number}> = [];
    const is_target: boolean[] = [];
    
    // Generate first n trials (cannot be targets)
    for (let i = 0; i < n_back; i++) {
        positions.push({
            row: Math.floor(Math.random() * rows),
            col: Math.floor(Math.random() * cols)
        });
        is_target.push(false);
    }
    
    // Calculate number of targets to place
    const n_targets = Math.round((target_percentage / 100) * (total_trials - n_back));
    let targets_placed = 0;
    
    // Generate remaining trials with targets
    for (let i = n_back; i < total_trials; i++) {
        const can_be_target = targets_placed < n_targets;
        const should_be_target = can_be_target && Math.random() < 0.5;
        
        if (should_be_target) {
            // Make this a target trial (same position as n trials back)
            positions.push({
                row: positions[i - n_back].row,
                col: positions[i - n_back].col
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
                new_position.row === positions[i - n_back].row &&
                new_position.col === positions[i - n_back].col
            );
            positions.push(new_position);
            is_target.push(false);
        }
    }
    
    return { positions, is_target };
}

export function createTimeline({
    rows = 3,
    cols = 3,
    n_back = 1,
    total_trials = 20,
    target_percentage = 25,
    stimulus_duration = 750,
    isi_duration = 250,
    feedback_duration = 1000,
    show_feedback_text = false,
    show_feedback_border = false,
    show_feedback_no_click = false,
    feedback_wait_no_click = true,
    cell_size = 150,
    prompt = trial_text.prompt,
    button_text = trial_text.button,
    stimulus_color = "#2196F3",
    correct_color = "#4CAF50",
    incorrect_color = "#F44336",
    include_instructions = false,
    randomize_trials = false,
    instruction_texts = instruction_pages,
}: {
    rows?: number,
    cols?: number,
    n_back?: number,
    total_trials?: number,
    target_percentage?: number,
    stimulus_duration?: number,
    isi_duration?: number,
    feedback_duration?: number,
    show_feedback_text?: boolean,
    show_feedback_border?: boolean,
    show_feedback_no_click?: boolean,
    feedback_wait_no_click?: boolean,
    cell_size?: number,
    prompt?: string,
    button_text?: string,
    stimulus_color?: string,
    correct_color?: string,
    incorrect_color?: string,
    include_instructions?: boolean,
    randomize_trials?: boolean,
    instruction_texts?: typeof instruction_pages,
} = {}) {

    // Generate the sequence
    const sequence = generateNBackSequence(total_trials, n_back, target_percentage, rows, cols);
    
    // Create individual trial objects
    const trials = [];
    for (let i = 0; i < total_trials; i++) {
        const trial_instructions = prompt
            .replace(/{n_back}/g, n_back.toString())
            .replace(/{plural}/g, n_back > 1 ? 's' : '')
            .replace(/{trial}/g, (i + 1).toString())
            .replace(/{total}/g, total_trials.toString());

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
            show_feedback_text: show_feedback_text,
            show_feedback_border: show_feedback_border,
            show_feedback_no_click: show_feedback_no_click,
            feedback_wait_no_click: feedback_wait_no_click,
            cell_size: cell_size,
            instructions: trial_instructions,
            button_text: button_text,
            stimulus_color: stimulus_color,
            correct_color: correct_color,
            incorrect_color: incorrect_color,
            data: {
                trial_number: i + 1,
                n_back: n_back,
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
        const instructions = createInstructions(instruction_texts);
        
        const nested_timeline = {
            timeline: [instructions, task_timeline]
        };
        return nested_timeline;

    } else {
        return task_timeline;
    }
}

// Create a practice timeline with fewer trials
export function createPracticeTimeline(options: Parameters<typeof createTimeline>[0] = {}) {
    return createTimeline({
        ...options,
        total_trials: 6,
        target_percentage: 50,
        show_feedback_text: true,
        show_feedback_border: true,
        include_instructions: true
    });
}

// Create multiple n-back levels timeline
export function createMultiLevelNBackTimeline({
    n_backs = [1, 2],
    trials_per_level = 20,
    randomize_levels = false,
    ...sharedOptions
}: {
    n_backs?: number[],
    trials_per_level?: number,
    randomize_levels?: boolean,
} & Parameters<typeof createTimeline>[0] = {}) {
    
    const level_timelines = n_backs.map(level => {
        return createTimeline({
            ...sharedOptions,
            n_back: level,
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
    easy: () => createTimeline({
        n_back: 1,
        total_trials: 20,
        target_percentage: 30,
        show_feedback_text: true
    }),
    
    medium: () => createTimeline({
        n_back: 2,
        total_trials: 30,
        target_percentage: 25,
        show_feedback_text: false
    }),
    
    hard: () => createTimeline({
        n_back: 3,
        total_trials: 40,
        target_percentage: 20,
        show_feedback_text: false,
        rows: 4,
        cols: 4
    }),

    research: () => createMultiLevelNBackTimeline({
        n_backs: [1, 2, 3],
        trials_per_level: 50,
        target_percentage: 25,
        show_feedback_text: false,
        randomize_levels: true
    })
};

// Export individual components for custom use
export { createInstructions, generateNBackSequence };

// Export default timeline creator
export default createTimeline;

export const timelineUnits = {
    createPracticeTimeline,
    createTimeline,
    createMultiLevelNBackTimeline,
};

export const utils = {
    presetConfigurations,
    generateNBackSequence,
    createInstructions
}