/* This file contains the configurable text used in the flanker inhibitory timeline.
 * Researchers can modify these texts to change the language or instructions.
 */

export const trial_text = {
    // Button texts
    continue_button: "Continue",
    start_button: "Start",
    ready_button: "I'm Ready",
    end_button: "End",
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
    
    // Feedback messages
    correct_feedback: "Correct!",
    incorrect_feedback: "Incorrect",
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

// Spoken versions of text (can be different from displayed text for clarity)
export const tts_text = {
    // Instruction spoken versions
    welcome_spoken: "Welcome to the Flanker Inhibitory Control Task. This is an attention and focus test.",
    task_explanation_spoken: "You will see a group of fish swimming on the screen. Your job is to focus only on the middle fish and ignore the other fish around it.",
    directions_spoken: "Look at which direction the middle fish is swimming and click the corresponding button. Click the left arrow if it's swimming left, or the right arrow if it's swimming right.",
    
    // Trial spoken versions  
    trial_prompt_spoken: "Look at the middle fish. Click the direction it's swimming.",
    
    // Feedback spoken versions
    correct_spoken: "Correct",
    incorrect_spoken: "Incorrect", 
    
    // Practice spoken versions
    practice_start_spoken: "Let's practice. Look at the middle fish and click the button that shows which way it's swimming.",
    practice_complete_spoken: "Practice complete. Great job! Now you're ready for the real task.",
    
    // Main task spoken versions
    main_task_start_spoken: "Now we'll start the real task. Remember to focus on the middle fish.",
    task_complete_spoken: "Task complete. Thank you for participating.",
    
    // Controls
    skip_speech_text: "Press space to skip speech",
    speech_controls_note: "Speech can be skipped by pressing the space bar at any time.",
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

export const instruction_pages = [
    {
        header: "Flanker Inhibitory Control Task",
        header2: "Attention and Focus Test",
        description: "In this task, you will see a group of fish swimming on the screen.",
        task_explanation: "Your job is to <strong>focus only on the middle fish</strong> and ignore the other fish around it.",
        performance_note: "Look at which direction the middle fish is swimming and click the corresponding button.",
        start_prompt: "Click continue to learn more about the task.",
        buttons: ["Continue"],
    },
    {
        strategy_title: "Instructions",
        strategy_intro: "For each trial:",
        strategy_points: [
            "Look at the <strong>middle fish only</strong> - ignore the other fish",
            "See which direction the middle fish is swimming",
            "Click the ← button if it's swimming left",
            "Click the → button if it's swimming right",
            "Try to respond as quickly and accurately as possible"
        ],
        start_prompt: "The other fish around the middle fish might be swimming in different directions - don't let them distract you!",
        buttons: ["Continue"],
    },
    {
        header2: "Button Instructions",
        description: "Use these buttons to respond:",
        task_explanation: "← Left Button = Middle fish swimming left<br/>→ Right Button = Middle fish swimming right",
        performance_note: "Remember: Only pay attention to the middle fish, even if the other fish are swimming in different directions.",
        start_prompt: "Click continue to start the practice round.",
        buttons: ["Continue"],
    }
];