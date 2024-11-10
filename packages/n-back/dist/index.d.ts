import { JsPsych } from 'jspsych';

declare function createTimeline(jsPsych: JsPsych, stimuli: any, keyboard_response?: string, // Default key for response
trial_duration?: number, // Default trial duration in ms
post_trial_gap?: number, // Default gap between trials in ms
fixation_duration?: number, // Default fixation duration in ms
n?: number, // Default value for N-back level
num_trials?: number, // Default number of trials
rep_ratio?: number, debrief?: boolean, return_accuracy?: boolean, data_output?: "none" | "json" | "csv"): any[];

export { createTimeline, createTimeline as default };
