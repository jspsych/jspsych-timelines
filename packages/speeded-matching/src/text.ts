/* This file contains the configurable text used in the speeded matching timeline.
 * Researchers can modify these texts to change the language or instructions.
 */

export const trial_text = {
    // Button texts
    continue_button: "Continue",
    start_button: "Start",
    ready_button: "I'm Ready",
    end_button: "End",
    
    // Task completion messages
    task_complete_header: "Task Complete!",
    task_complete_message: "Thank you for participating in the speeded matching task.",
    
    // Practice phase text
    practice_header: "Practice Round",
    practice_intro_message: "We'll now do a practice round to show you how the task works.",
    practice_look_instruction: "Look at this picture",
    practice_tap_instruction: "We are going to tap the matching picture below",
    practice_complete_header: "Practice Complete!",
    practice_complete_message: "Practice complete! Are you ready for the actual test?",
    
    // Main task instructions
    main_task_prompt: "",
    
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
    `<div class="speeded-matching-instructions-container">
        <p>You will see a picture at the top of the screen and four pictures below it.</p>
        <p>Your job is to find which of the four pictures matches the one at the top.</p>
        <p>Try to respond as quickly and accurately as you can.</p>
    </div>`,
    `<div class="speeded-matching-instructions-container">
        <p>For each round:</p>
        <ul>
            <li>Look at the picture at the top</li>
            <li>Compare it with the four pictures below</li>
            <li>Click on the picture that matches</li>
            <li>Work quickly but carefully</li>
        </ul>
        <p>Let's try a practice round first.</p>
    </div>`
];