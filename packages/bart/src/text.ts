export const englishText = {

}/* This file contains the configurable text used in the BART timeline.
 * Researchers can modify these texts to change the language or instructions.
 */

export const trial_text = {
    // Instruction pages buttons text, these will always have arrows < and >
    // these do not work right now due to CSS fixed position, might fix later
    next_button: "",
    back_button: "", 

    // Task completion messages
    task_complete_header: "Task Complete!",
    task_complete_message: "Thank you for participating in the balloon task.",
    
    // BART specific text
    pump_button: "Pump",
    collect_button: "Collect",
    continue_button: "Continue",
    start_button: "Start",
    finish_button: "Finish",
    
    // Trial feedback messages
    balloon_popped_message: "POP! The balloon exploded. You earned $0.00 this round.",
    collected_message: "You collected",
    timeout_message: "Time limit reached - earnings automatically collected.",
    total_earnings_message: "Total earnings across all rounds:",
    current_earnings_message: "Current total earnings:",
    possible_earnings_message: "Possible earnings this round:",
    
    // Block break messages
    block_complete_message: "You have completed block",
    take_break_message: "Take a break if you need one, then click Continue when ready for the next block.",
    
    // Final results
    final_earnings_message: "You earned a total of",
    thanks_message: "Thanks for participating!",
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
    "<b>In this task, you will inflate a balloon to earn money.</b>",
    "Click <b>Pump</b> to inflate the balloon and earn money with each pump.",
    "Click <b>Collect</b> to save your money and end the round.",
    "If the balloon pops, you lose the money for that round!",
    "Work quickly but carefully - you have limited time per trial.",
    "Click below to start the task."
];