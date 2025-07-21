/* This file contains the configurable text used in the spatial n-back timeline.
 * Researchers can modify these texts to change the language or instructions.
 * replaceable holders: {n_back}, {plural}, {trial}, {total}
 */

export const trial_text = {
    // Instruction pages buttons text, these will always have arrows < and >
    // these do not work right now due to CSS fixed position, might fix later
    next_button: "",
    back_button: "", 

    // Task completion messages
    task_complete_header: "Task Complete!",
    task_complete_message: "Thank you for participating in the spatial n-back task.",
    
    // Main task instructions
    prompt: "Click the MATCH button if the current position matches the position from {n_back} trial{plural} ago. (trial {trial} of {total})",
    
    // Fixation and inter-trial
    fixation_cross: "+",
    
    // Button text
    button: "MATCH",
    
    // Feedback messages
    correct: "Correct!",
    incorrect: "Incorrect!",
}

/* 
 * This is an array of HTML strings for instruction pages displayed before the actual trials.
 * Researchers can modify these instructions to change the task description, add new instruction 
 * pages, or translate to different languages.
 * 
 * Each string should contain valid HTML that will be displayed as an instruction page.
 * You can add more pages by adding more strings to the array, or modify existing pages
 * by editing the HTML content.
 */
export const instruction_pages = [
    "We now ask you to play a type of game.",
    "You will see a series of positions on a grid",
    "Watch the grid carefully.",
    "Remember positions from ONE trial ago.",
    "Click MATCH only when positions match.",
    "Try to respond as quickly and accurately as you can.",
    "Let's start the task."
];