export const trial_text = {
    /* INSTRUCTIONS PHASE*/
    instructions_pages: [
        "In this task, you will play a card game to earn points.",
        "You will see a grid of face-down cards. Each card is either a gain card (gives you points) or a loss card (takes away points).",
        "Click on cards to flip them over and reveal their value. You can click as many or as few cards as you want.",
        "Gain cards will give you points, while loss cards will subtract points from your total.",
        "Your goal is to earn as many points as possible, but be careful - you can also lose points!",
        "You can stop at any time by clicking the 'Stop' button.",
        "Let's start with some practice rounds to get familiar with the task."
    ],
    // Button labels (empty strings give us just arrows per jsPsychInstructions)
    back_button: '',
    next_button: '',

    /* TRIAL PAGE */
    defaultInstructions: "Tap the cards to flip them over. Gain cards give you points, loss cards lose points!",
    defaultGainCardsLabel: "Gain Cards", 
    defaultLossCardsLabel: "Loss Cards",
    defaultScoreLabel: "Points:",
    defaultContinueButtonText: "Stop",
    defaultCardFrontSymbol: "?",

    /* PRACTICE PAGES */
    practiceIntroContent: "<b>Practice Round</b><br>This will not count towards your final score.",
    practiceCompleteContent: "<b>Practice Complete!</b><br>Great job! You are now ready to begin the actual task.",
    beginTaskButton: "Begin Task",
    
    /* BLOCK BREAK PAGES */
    blockBreakContent: (blockNum: number, totalBlocks: number, blockPoints?: number, totalPoints?: number, showSummary: boolean = true) => 
        `<b>Round ${blockNum} Complete!</b><br>
        You have completed round ${blockNum} of ${totalBlocks}.<br>
        Take a short break if needed.` +
        (showSummary ? `<br>
            <b>Points This Round:</b> ${blockPoints}
            <b>Total Points So Far:</b> ${totalPoints}
            ` : ''),
    continueButton: "Continue",

    /* DEBRIEF PAGE */
    debriefContent: (totalScore: number, totalCards: number, avgPointsPerCard: number, riskScore: string) => 
        `Final Score: ${totalScore}<br>
        Total Cards Flipped: ${totalCards}<br>
        Average Points Per Card: ${avgPointsPerCard}<br>
        Risk-Taking Score:<br>
        ${riskScore}<br>
        Thank you for completing the Columbia Card Task!`,
    finishButton: "Finish",

    riskConservative: "You played conservatively, flipping fewer cards to minimize risk.",
    riskModerate: "You showed moderate risk-taking behavior.",
    riskAggressive: "You took high risks by flipping many cards for potential rewards.",
    
    blockBreakdownTitle: "Round-by-Round Breakdown:",
    round: "Round",
    points: "Points",
    cards: "Cards",
    avgPerCard: "Avg/Card"
}