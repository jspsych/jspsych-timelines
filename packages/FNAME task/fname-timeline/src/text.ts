export const FNAME_TEXT = {
    welcome: {
        title: "Face Name Associative Memory Exam",
        subtitle: "Welcome to the FNAME task!",
        description: "This test measures your ability to remember associations between faces and names.",
        info: "The test has two parts with a delay between them.",
        buttonText: "Continue"
    },

    instructions: {
        pages: [
            {
                title: "Instructions",
                content: [
                    "You will see some pictures of faces with names below them.",
                    "Each face-name pair will appear for a few seconds.",
                    "For each face, decide whether it will be easy or hard for you to remember the name that goes with it.",
                    "Tap <strong>Easy</strong> if you think it will be easy to remember the face-name pair.",
                    "Tap <strong>Hard</strong> if you think it will be hard to remember the face-name pair.",
                    "Choose as quickly as you can before the next picture appears."
                ]
            },
            {
                title: "Important!",
                content: [
                    "Try to remember the name that goes with each face.",
                    "You will be asked about these names and faces later.",
                    "The test will begin with a practice item."
                ]
            }
        ],
        navigation: {
            previous: "Previous",
            next: "Next",
            finish: "Begin"
        }
    },

    // practiceItem: {
    //     instruction: "Which face have you seen before?",
    //     choices: ["Easy", "Hard"]
    // },

    learningTransition: {
        title: "Ready to begin!",
        content: [
            "You will now see more pictures of faces paired with names.",
            "For each face, decide whether it will be easy or hard for you to remember the name that goes with it.",
            "Choose as quickly as you can before the next picture appears.",
            "Try to remember the name that goes with each face."
        ],
        buttonText: "Start Experiment"
    },
};