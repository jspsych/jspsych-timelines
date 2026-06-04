export const defaultText = {
    instruction_pages: [
        "<b>You will see a picture at the top.</b>",
        "Below it, you will see four pictures.",
        "Click on the picture that matches the one at the top.",
        "Work quickly but carefully.",
        "Let's practice first."
    ],
    // Button texts
    continue_button: "Continue",
    ready_button: "I'm Ready",
    end_button: "End",
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
}

export type TrialText = Partial<typeof defaultText>
