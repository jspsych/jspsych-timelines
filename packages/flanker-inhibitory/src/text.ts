/* This file contains the configurable text used in the flanker inhibitory timeline.
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
    practice_button: "Practice Again",
    left_button: "←",
    right_button: "→",
    
    // Task completion messages
    task_complete: "Thank you for participating in the flanker inhibitory control task.",
    
    // Practice phase text: pre-practice intro and post-practice message.
    practice_intro: "Let's practice! Look at the middle fish and click the button that shows which way it's swimming.",
    practice_outro: "<h2>Practice Complete!</h2>Great job! Now you're ready for the real task.",
    
    // Main task instructions and inter-task prompt
    main_task_intro: "<h2>Main Task</h2>Now we'll start the real task. Are you ready?",
    main_task_prompt: "",

    // Performance summary labels
    performance_title: "Your Performance:",
    accuracy_label: "Accuracy:",
    response_time_label: "Average Response Time:",

    // Fixation and inter-trial
    fixation_cross: "+",

    // Feedback messages (optional)
    correct_feedback: "Correct",
    incorrect_feedback: "Incorrect",
};

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
    "Look at the middle fish only - ignore the other fish.",
    "Click the ← button if it's swimming left, click the → button if it's swimming right.",
    "Try to respond as quickly and accurately as possible.",
    "Continue to start the practice round."
];

