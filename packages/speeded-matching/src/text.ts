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
    practice_look_instruction: "Look at this picture",
    practice_tap_instruction: "We are going to tap the matching picture below",
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
 * This is an array of page objects that have configurable texts for the instruction pages
 * before the actual trials. Researchers can modify these instructions to change the
 * task description, add new instruction pages, or translate to different languages.
 * 
 * Each page object can contain:
 * - header: Main title (displays in <h1>)
 * - header2: Subtitle (displays in <h2>)
 * - description: Main description text (displays in <p>)
 * - task_explanation: Detailed task explanation (displays in <p>)
 * - performance_note: Performance tips (displays in <p>)
 * - strategy_title: Strategy section title (displays in <h2>)
 * - strategy_intro: Introduction to strategy (displays in <p>)
 * - strategy_points: Array of strategy bullet points (displays as <ul><li>)
 * - start_prompt: Final instruction before starting (displays in <p>)
 * - buttons: Array of button text options
 * - button_html: Custom HTML for buttons (optional)
 */

export const instruction_pages = [
    {
        header: "Speeded Matching Task",
        header2: "Visual Pattern Matching",
        description: "In this task, you will see a target picture at the top of the screen and four choice pictures below.",
        task_explanation: "Your job is to <strong>quickly identify</strong> which of the four pictures below matches the target picture at the top.",
        performance_note: "Try to respond as quickly and accurately as possible. Speed and accuracy are both important.",
        start_prompt: "Click continue to learn more about the task.",
        buttons: ["Continue"],
    },
    {
        strategy_title: "Instructions",
        strategy_intro: "For each trial:",
        strategy_points: [
            "Look at the target picture at the top of the screen",
            "Compare it with the four choice pictures below",
            "Click on the picture that matches the target",
            "Respond as quickly and accurately as possible",
            "A brief outline will appear when you make your selection"
        ],
        start_prompt: "Click continue to start the practice round.",
        buttons: ["Continue"],
    }
];