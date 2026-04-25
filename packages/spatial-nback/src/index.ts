import "./styles.css";
import { JsPsych, DataCollection } from "jspsych";
import jsPsychPluginSpatialNback from "@jspsych-contrib/plugin-spatial-nback";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { trial_text, instruction_pages } from "./text";

// Constants
const TASK_NAME = "spatial-nback";
const VERSION = "0.3.0";

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
      task: TASK_NAME,
      task_version: VERSION,
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

export function createTimeline(
    jsPsych: JsPsych,
    {
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
    } = {}
) {

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
                task: TASK_NAME,
                task_version: VERSION,
                phase: 'test',
                trial_number: i + 1,
                n_back: n_back,
                total_trials: total_trials,
            },
            css_classes: ["jspsych-spatial-nback-container"]
        });
    }

    // Create the main task timeline
    const task_timeline = {
        timeline: trials,
    };

    // Completion screen
    const completionTrial = createCompletionTrial(jsPsych, texts);

    // Return complete timeline with or without instructions
    if (include_instructions) {
        const instructions = createInstructions(instruction_texts, texts);

        const nested_timeline = {
            timeline: [instructions, task_timeline, completionTrial]
        };
        return nested_timeline;

    } else {
        return {
            timeline: [...trials, completionTrial],
        };
    }
}

// Create a practice timeline with fewer trials
export function createPracticeTimeline(jsPsych: JsPsych, options: Parameters<typeof createTimeline>[1] = {}) {
    return createTimeline(jsPsych, {
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
export function createMultiLevelNBackTimeline(
    jsPsych: JsPsych,
    {
        n_backs = [1, 2],
        trials_per_level = 20,
        randomize_levels = false,
        ...sharedOptions
    }: {
        n_backs?: number[],
        trials_per_level?: number,
        randomize_levels?: boolean,
    } & Parameters<typeof createTimeline>[1] = {}
) {

    const level_timelines = n_backs.map(level => {
        return createTimeline(jsPsych, {
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
    easy: (jsPsych: JsPsych) => createTimeline(jsPsych, {
        n_back: 1,
        total_trials: 20,
        target_percentage: 30,
        show_feedback_text: true
    }),

    medium: (jsPsych: JsPsych) => createTimeline(jsPsych, {
        n_back: 2,
        total_trials: 30,
        target_percentage: 25,
        show_feedback_text: false
    }),

    hard: (jsPsych: JsPsych) => createTimeline(jsPsych, {
        n_back: 3,
        total_trials: 40,
        target_percentage: 20,
        show_feedback_text: false,
        rows: 4,
        cols: 4
    }),

    research: (jsPsych: JsPsych) => createMultiLevelNBackTimeline(jsPsych, {
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
    createInstructions,
    createCompletionTrial,
};

/**
 * Generate HTML for a spatial n-back grid
 * @param rows Number of rows in the grid
 * @param cols Number of columns in the grid
 * @param cell_size Cell size in pixels (if null, uses 12vh)
 * @param highlight_position Optional position to highlight {row, col}
 * @param highlight_color Color for the highlighted cell (default: "#2196F3")
 * @returns HTML string for the grid
 */
export function createGridHTML({
    rows = 3,
    cols = 3,
    cell_size = null,
    highlight_position = null,
    highlight_color = "#2196F3"
}: {
    rows?: number,
    cols?: number,
    cell_size?: number | null,
    highlight_position?: { row: number, col: number } | null,
    highlight_color?: string
} = {}): string {
    const cell_size_style = cell_size !== null ? `${cell_size}px` : '12vh';

    let html = `<div id="nback-grid" style="
        border: 3px solid #000;
        box-sizing: border-box;
        display: inline-block;
    ">`;

    for (let row = 0; row < rows; row++) {
        html += '<div style="display: flex;">';
        for (let col = 0; col < cols; col++) {
            const is_highlighted = highlight_position &&
                highlight_position.row === row &&
                highlight_position.col === col;
            const bg_color = is_highlighted ? `background-color: ${highlight_color};` : '';

            html += `<div id="cell-${row}-${col}" style="
                width: ${cell_size_style};
                height: ${cell_size_style};
                border: 1px solid #ccc;
                box-sizing: border-box;
                ${bg_color}
            "></div>`;
        }
        html += "</div>";
    }
    html += "</div>";

    return html;
}

// Scoring functions
const scoring = {
    /**
     * Calculate performance scores from spatial n-back data
     */
    calculateScores(data: DataCollection) {
        const trials = data.filter({ task: TASK_NAME, phase: 'test' }).values();

        if (trials.length === 0) {
            return {
                totalTrials: 0,
                correctTrials: 0,
                accuracy: 0,
                targetTrials: 0,
                targetHits: 0,
                targetHitRate: 0,
                nonTargetTrials: 0,
                correctRejections: 0,
                correctRejectionRate: 0,
                falseAlarms: 0,
                falseAlarmRate: 0,
                misses: 0,
                missRate: 0,
                meanRT: null as number | null,
                meanTargetRT: null as number | null,
                dPrime: null as number | null,
            };
        }

        const correctTrials = trials.filter((t: any) => t.correct === true);
        const targetTrials = trials.filter((t: any) => t.is_target === true);
        const nonTargetTrials = trials.filter((t: any) => t.is_target === false);

        // Hits: correctly identified targets
        const hits = targetTrials.filter((t: any) => t.correct === true);
        // Misses: targets that were not identified
        const misses = targetTrials.filter((t: any) => t.correct === false);
        // Correct rejections: correctly rejected non-targets
        const correctRejections = nonTargetTrials.filter((t: any) => t.correct === true);
        // False alarms: non-targets incorrectly identified as targets
        const falseAlarms = nonTargetTrials.filter((t: any) => t.correct === false);

        // RT calculations (correct trials only, excluding nulls)
        const validRTs = correctTrials
            .map((t: any) => t.rt)
            .filter((rt: any) => rt !== null && rt > 0);
        const meanRT = validRTs.length > 0
            ? validRTs.reduce((a: number, b: number) => a + b, 0) / validRTs.length
            : null;

        // RT for target hits only
        const targetRTs = hits
            .map((t: any) => t.rt)
            .filter((rt: any) => rt !== null && rt > 0);
        const meanTargetRT = targetRTs.length > 0
            ? targetRTs.reduce((a: number, b: number) => a + b, 0) / targetRTs.length
            : null;

        // Calculate d-prime (signal detection measure)
        const hitRate = targetTrials.length > 0 ? hits.length / targetTrials.length : 0;
        const falseAlarmRate = nonTargetTrials.length > 0 ? falseAlarms.length / nonTargetTrials.length : 0;

        // Apply corrections for extreme values (0 or 1) to allow z-score calculation
        const adjustedHitRate = Math.max(0.01, Math.min(0.99, hitRate));
        const adjustedFARate = Math.max(0.01, Math.min(0.99, falseAlarmRate));

        // Z-score approximation using inverse normal
        const zHit = inverseNormalCDF(adjustedHitRate);
        const zFA = inverseNormalCDF(adjustedFARate);
        const dPrime = zHit - zFA;

        return {
            totalTrials: trials.length,
            correctTrials: correctTrials.length,
            accuracy: trials.length > 0 ? correctTrials.length / trials.length : 0,
            targetTrials: targetTrials.length,
            targetHits: hits.length,
            targetHitRate: hitRate,
            nonTargetTrials: nonTargetTrials.length,
            correctRejections: correctRejections.length,
            correctRejectionRate: nonTargetTrials.length > 0 ? correctRejections.length / nonTargetTrials.length : 0,
            falseAlarms: falseAlarms.length,
            falseAlarmRate: falseAlarmRate,
            misses: misses.length,
            missRate: targetTrials.length > 0 ? misses.length / targetTrials.length : 0,
            meanRT,
            meanTargetRT,
            dPrime,
        };
    },

    /**
     * Get summary with task metadata
     */
    getSummary(data: DataCollection) {
        const scores = this.calculateScores(data);
        return {
            taskName: TASK_NAME,
            version: VERSION,
            ...scores,
        };
    },
};

// Approximate inverse normal CDF (Abramowitz and Stegun approximation)
function inverseNormalCDF(p: number): number {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;

    const a1 = -3.969683028665376e1;
    const a2 = 2.209460984245205e2;
    const a3 = -2.759285104469687e2;
    const a4 = 1.383577518672690e2;
    const a5 = -3.066479806614716e1;
    const a6 = 2.506628277459239e0;

    const b1 = -5.447609879822406e1;
    const b2 = 1.615858368580409e2;
    const b3 = -1.556989798598866e2;
    const b4 = 6.680131188771972e1;
    const b5 = -1.328068155288572e1;

    const c1 = -7.784894002430293e-3;
    const c2 = -3.223964580411365e-1;
    const c3 = -2.400758277161838e0;
    const c4 = -2.549732539343734e0;
    const c5 = 4.374664141464968e0;
    const c6 = 2.938163982698783e0;

    const d1 = 7.784695709041462e-3;
    const d2 = 3.224671290700398e-1;
    const d3 = 2.445134137142996e0;
    const d4 = 3.754408661907416e0;

    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    let q: number, r: number;

    if (p < pLow) {
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
            ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (p <= pHigh) {
        q = p - 0.5;
        r = q * q;
        return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
            (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
            ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
}

/**
 * Creates a completion screen showing results.
 */
function createCompletionTrial(jsPsych: JsPsych, texts = trial_text) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const data = jsPsych.data.get();
      const scores = scoring.calculateScores(data);

      let html = `<div style="max-width: 600px; margin: 0 auto;">`;
      html += `<h2>${texts.task_complete}</h2>`;
      html += texts.result_summary(scores.accuracy, scores.dPrime, scores.meanTargetRT);
      html += `</div>`;
      return html;
    },
    choices: [texts.continue_button],
    data: {
      task: TASK_NAME,
      task_version: VERSION,
      phase: "completion",
    },
  };
}

// Constants export
const constants = {
    TASK_NAME,
    VERSION,
};

export const utils = {
    scoring,
    constants,
    text: trial_text,
    presetConfigurations,
    generateNBackSequence,
    createGridHTML,
}