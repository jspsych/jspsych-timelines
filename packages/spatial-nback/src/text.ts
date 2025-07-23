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
    
    // Button text array - first button is "match", second is "no match"
    button: ["O", "X"],
    
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

const grid = "<div class='nback-grid-instructions' style='border: 3px solid #000; box-sizing: border-box; display: inline-block;'><div style='display: flex;'><div id='cell-0-0' style='width: 40px; height: 40px; border: 1px solid #ccc; box-sizing: border-box;'></div><div id='cell-0-1' style='width: 40px; height: 40px; border: 1px solid #ccc; box-sizing: border-box;'></div><div id='cell-0-2' style='width: 40px; height: 40px; border: 1px solid #ccc; box-sizing: border-box;'></div></div><div style='display: flex;'><div id='cell-1-0' style='width: 40px; height: 40px; border: 1px solid #ccc; box-sizing: border-box;'></div><div id='cell-1-1' style='width: 40px; height: 40px; border: 1px solid #ccc; box-sizing: border-box;'></div><div id='cell-1-2' style='width: 40px; height: 40px; border: 1px solid #ccc; box-sizing: border-box;'></div></div><div style='display: flex;'><div id='cell-2-0' style='width: 40px; height: 40px; border: 1px solid #ccc; box-sizing: border-box;'></div><div id='cell-2-1' style='width: 40px; height: 40px; border: 1px solid #ccc; box-sizing: border-box;'></div><div id='cell-2-2' style='width: 40px; height: 40px; border: 1px solid #ccc; box-sizing: border-box;'></div></div></div>";
export const instruction_pages = [
    "We now ask you to play a type of game.",
    "You will see a series of positions on a 3×3 grid<br><br>" + grid,
    "Tap O if the current position matches the one you saw just before it.",
    "Remember positions from ONE trial ago.",
    "Tap O if the positions match. Tap X if they do not match.",
    "Try to respond as quickly and accurately as you can.",
    "Let's start with a short practice round.",
];