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
    task_complete_header: "Task Complete!",
    task_complete_message: "Thank you for participating in the flanker inhibitory control task.",
    
    // Practice phase text
    practice_header: "Practice Round",
    practice_intro_message: "Let's practice! Look at the middle fish and click the button that shows which way it's swimming.",
    practice_complete_header: "Practice Complete!",
    practice_complete_message: "Great job! Now you're ready for the real task.",
    practice_failed_message: "Let's try the practice again. Remember to focus on the middle fish only.",
    
    // Main task instructions and headers
    main_task_header: "Main Task",
    main_task_intro: "Now we'll start the real task. Remember to focus on the middle fish!",
    main_task_prompt: "Look at the middle fish. Click the button for the direction it's swimming.",
    
    // Performance summary labels
    performance_title: "Your Performance:",
    accuracy_label: "Accuracy:",
    response_time_label: "Average Response Time:",
    
    // Fixation and inter-trial
    fixation_cross: "+",
    
    // Feedback messages (optional)
    correct_feedback: "Correct",
    incorrect_feedback: "Incorrect",
    
    // Timing messages
    too_slow_message: "Please respond faster",
    
    // Progress messages
    block_progress: "Block {current} of {total}",
    trial_progress: "Trial {current} of {total}",
};

// TTS (Text-to-Speech) configuration
export const tts_config = {
    // Voice settings
    voice_name: '', // Empty string uses default voice, or specify like 'Google US English'
    rate: 1.0, // Speech rate (0.1 to 10)
    pitch: 1.0, // Speech pitch (0 to 2)
    volume: 1.0, // Speech volume (0 to 1)
    
    // Language and locale
    lang: 'en-US', // Language code for speech synthesis
    
    // What text to speak aloud (can be disabled per element)
    speak_instructions: true, // Speak instruction page content
    speak_prompts: true, // Speak trial prompts
    speak_feedback: true, // Speak correct/incorrect feedback
    speak_completion: true, // Speak task completion messages
    
    // Auto-play settings
    auto_speak_on_load: true, // Automatically start speaking when page loads
    speak_button_text: false, // Whether to also speak button labels
    
    // Timing
    speech_delay: 500, // Delay before starting speech (ms)
    allow_skip: true, // Allow users to skip/stop speech
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

