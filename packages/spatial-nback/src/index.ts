import jsPsychPluginSpatialNback from "@jspsych-contrib/plugin-spatial-nback";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, instruction_pages } from "./text";

function createInstructions(instruction_pages_data = instruction_pages, texts = trial_text) {
  return {
    type: jsPsychInstructions,
    pages: instruction_pages_data.map(page => `<div class="timeline-instructions"><p>${page}</p></div>`),
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: 'ArrowRight',
    key_backward: 'ArrowLeft',
    button_label_previous: texts?.back_button ?? trial_text.back_button,
    button_label_next: texts?.next_button ?? trial_text.next_button,
    data: {
      task: 'spatial-nback',
      phase: 'instructions'
    },
    css_classes: ["jspsych-spatial-nback-container"]
  };
}

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

    // Calculate and place targets
    const n_targets = Math.round((target_percentage / 100) * (total_trials - n_back));
    const remaining_trials = total_trials - n_back;

    // Create boolean array to signify how many targets we need
    const target_indices: boolean[] = [];
    for (let i = 0; i < remaining_trials; i++) {
        target_indices.push(i < n_targets);
    }
    // Fisher-Yates shuffle that boolean array
    for (let i = target_indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [target_indices[i], target_indices[j]] = [target_indices[j], target_indices[i]];
    }
    
    // Generate remaining trials based on target indices
    for (let i = 0; i < remaining_trials; i++) {
        const trial_index = n_back + i;
        
        if (target_indices[i]) {
            // Target trial, share the same position object as the n_back trial
            positions.push(positions[trial_index - n_back]);
            is_target.push(true);
        } else {
            // Non-target trial, find a new position
            let new_position: {row: number, col: number};
            do {
                new_position = {
                    row: Math.floor(Math.random() * rows),
                    col: Math.floor(Math.random() * cols)
                };
                // Ensure the new position is not the same as the n_back trial
            } while (
                new_position.row === positions[trial_index - n_back].row &&
                new_position.col === positions[trial_index - n_back].col
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
    target_percentage = 40,
    stimulus_duration = 750,
    isi_duration = 500,
    feedback_duration = 0,
    show_feedback_text = false,
    show_feedback_border = false,
    cell_size = null,
    prompt = null,
    buttons = null,
    stimulus_color = "#2196F3",
    correct_color = "#4CAF50",
    incorrect_color = "#F44336",
    include_instructions = false,
    instruction_texts = instruction_pages,
    texts = trial_text
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
    cell_size?: number,
    prompt?: string,
    buttons?: string[],
    stimulus_color?: string,
    correct_color?: string,
    incorrect_color?: string,
    include_instructions?: boolean,
    instruction_texts?: typeof instruction_pages,
    texts?: typeof trial_text
} = {}) {

    // Use texts object if provided, otherwise fall back to defaults
    const effective_prompt = prompt ?? texts?.prompt ?? trial_text.prompt;
    const effective_buttons = buttons ?? texts?.button ?? trial_text.button;

    // Generate the sequence
    const sequence = generateNBackSequence(total_trials, n_back, target_percentage, rows, cols);
    
    // Create individual trial objects
    const trials = [];
    for (let i = 0; i < total_trials; i++) {
        const trial_instructions = `<p>${effective_prompt
            .replace(/{n_back}/g, n_back.toString())
            .replace(/{plural}/g, n_back > 1 ? 's' : '')
            .replace(/{trial}/g, (i + 1).toString())
            .replace(/{total}/g, total_trials.toString())}</p>`;

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
            cell_size: cell_size,
            instructions: trial_instructions,
            buttons: effective_buttons,
            stimulus_color: stimulus_color,
            correct_color: correct_color,
            incorrect_color: incorrect_color,
            on_load: function() {
                // Automatically set CSS variable for button count, should add this to plugin later maybe
                document.getElementById('nback-grid-container')?.classList.add('timeline-trial');
                
                const buttonContainer = document.getElementById('nback-buttons-container'); 
                buttonContainer.classList.add('timeline-btn-container');
                if (buttonContainer) {
                    buttonContainer.style.setProperty('--button-count', effective_buttons.length.toString());
                }
            },
            data: {
                trial_number: i + 1,
                n_back: n_back,
                total_trials: total_trials,
                task: 'spatial-nback',
                phase: 'trial'
            },
            css_classes: ["jspsych-spatial-nback-container"]
        });
    }

    // Create the main task timeline
    const task_timeline = {
        timeline: trials,
    };

    // Return complete timeline with or without instructions
    if (include_instructions) {
        const instructions = createInstructions(instruction_texts, texts);
        
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
        total_trials: 5,
        target_percentage: 50,
        show_feedback_text: true,
        show_feedback_border: true,
        include_instructions: false,
        prompt: "Match the current position with the position from {n_back} trial{plural} ago. (trial {trial} of {total})",
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

export const timelineUnits = {
    createPracticeTimeline,
    createMultiLevelNBackTimeline,
    createInstructions
};

export const utils = {
    presetConfigurations,
    generateNBackSequence,
}