/* This file contains the configurable text used in the speeded matching timeline.
 * Researchers can modify these texts to change the language or instructions.
 */

export const trial_text = {
    // Button texts
    continue_button: "Continue",
    start_button: "Start",
    ready_button: "I'm Ready",
    end_button: "End",
    // Instruction pages buttons text, these will always have arrows < and >
    // these do not work right now due to CSS fixed position, might fix later
    next_button: "",
    back_button: "", 
    // Task completion messages
    task_complete_header: "Task Complete!",
    task_complete_message: "Thank you for participating in the speeded matching task.",
    
    // Practice phase text
    practice_header: "Practice Round",
    practice_intro_message: "We'll now do a practice round to show you how the task works.",
    practice_look_instruction: "Look at this picture",
    practice_tap_instruction: "Tap the matching picture below",
    practice_complete_header: "Are you ready?",
    practice_complete_message: "Practice complete! Ready for the full test?",
    
    // Main task instructions
    main_task_prompt: "Tap the matching picture below",
    
    // Fixation and inter-trial
    fixation_cross: "+",
    
    // Feedback messages (optional)
    correct_feedback: "Correct!",
    incorrect_feedback: "Try again",
    
    // Timing messages
    too_slow_message: "Please respond faster",
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
    `<div class="instructions-container">
        <p>You will see a picture at the top.</p>
    </div>`,
    `<div class="instructions-container">
        <p>Below it, you will see four pictures.</p>
    </div>`,
    `<div class="instructions-container">
        <p>Click on the picture that matches the one at the top.</p>
    </div>`,
    `<div class="instructions-container">
        <p>Work quickly but carefully.</p>
    </div>`,
    `<div class="instructions-container">
        <p>Let's practice first.</p>
    </div>`
];