/* This file contains the configurable text used in the pattern comparison timeline.
 * Researchers can modify these texts to change the language or instructions.
 */

export const trial_text = {
    // Instruction pages buttons text, these will always have arrows < and >
    // these do not work right now due to CSS fixed position, might fix later
    next_button: "",
    back_button: "", 

    // Task completion messages
    task_complete_header: "Task Complete!",
    task_complete_message: "Thank you for participating in the pattern comparison task.",
    
    // Main task instructions
    prompt: "Are these two patterns the same?",
    
    // Fixation and inter-trial
    fixation_cross: "+",
    
    // Button text
    same_button: "Same",
    different_button: "Different",
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
    "You will see two patterns side by side.",
    "Your job is to determine if they are the same or different.",
    "Look carefully at all visual elements: shape, color, size, and quantity.",
    "Click 'Same' if the patterns are identical.",
    "Click 'Different' if the patterns vary in any way.",
    "Work quickly but carefully.",
    "Let's begin the task."
];