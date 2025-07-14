/* This file contains the configurable text used in the digit span timeline.
 * Researchers can modify these texts to change the language or instructions.
 */

export const trial_text = {
    // Instruction pages buttons text, these will always have arrows < and >
    // these do not work right now due to CSS fixed position, might fix later
    next_button: "",
    back_button: "", 

    // Task completion messages
    task_complete_header: "Task Complete!",
    task_complete_message: "Thank you for participating in the digit span task.",
    
    // Recall phase text
    recall_header_forward: "Forward Span",
    recall_header_backward: "Backward Span", 
    recall_instruction_forward: "Enter the digits in the same order they appeared:",
    recall_instruction_backward: "Enter the digits in reverse order:",
    recall_placeholder: "Your response will appear here...",
    
    // Button labels
    clear_button: "Clear",
    submit_button: "Submit",
    continue_button: "Continue",
    
    // Feedback messages
    correct_feedback: "Correct!",
    incorrect_feedback: "Incorrect",
    target_label: "Target:",
    response_label: "Your response:",
    
    // Results text
    forward_span_score: "Forward Span Score:",
    backward_span_score: "Backward Span Score:",
    total_score: "Total Score:",
    finish_button: "Finish"
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
    "You will see a sequence of digits presented one at a time.",
    "Your job is to remember the digits in order.",
    "After seeing all the digits, you will enter them using number buttons.",
    "<b>Forward condition:</b> Enter the digits in the same order they appeared.",
    "<b>Backward condition:</b> Enter the digits in reverse order.",
    "The task will start with short sequences and get longer as you succeed.",
    "Let's begin with the digit span task."
];