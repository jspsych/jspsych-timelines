export const instruction_pages = [
    "In this task, you will play a card game to earn points.",
    "You will see a grid of face-down cards. Each card is either a gain card (gives you points) or a loss card (takes away points).",
    "Click on cards to flip them over and reveal their value. You can click as many or as few cards as you want.",
    "Gain cards will give you points, while loss cards will subtract points from your total.",
    "Your goal is to earn as many points as possible, but be careful - you can also lose points!",
    "You can stop at any time by clicking the 'Stop' button.",
    "Let's start with some practice rounds to get familiar with the task."
]

export const trial_text = {
    // Default card task configuration text
    defaultInstructions: "Tap the cards to flip them over. Gain cards give you points, loss cards lose points!",
    defaultGainCardsLabel: "Gain Cards", 
    defaultLossCardsLabel: "Loss Cards",
    defaultScoreLabel: "Points:",
    defaultContinueButtonText: "Stop",
    defaultCardFrontSymbol: "?",

    // Instructions text
    instructionText: 'In this card task, you will try to earn as many points as possible.',
    cardGameInstructions: 'Click on cards to flip them over and see their value.',
    gainCardExplanation: 'Green cards give you points when flipped.',
    lossCardExplanation: 'Red cards subtract points when flipped.',
    generalInstructions: 'Try to earn as many points as possible, but be strategic about which cards you flip.',
    riskWarning: 'Remember: you can stop at any time to keep your current points.',
    startPrompt: 'Click "Start" when you\'re ready to begin.',
    startButton: 'Start',
    
    // Multi-page Instructions
    overviewText: 'Welcome to the Columbia Card Task.',
    overviewPrompt: 'Click to learn how to play.',
    nextButton: 'Next',
    
    cardTypesPageContent: 
    `<b>Card Types</b><br>
    There are two types of cards in this game:<br>
    <span style="color: #28a745; font-weight: bold;">Gain Cards</span> - Give you points<br>
    <span style="color: #dc3545; font-weight: bold;">Loss Cards</span> - Take away points`,
    
    gameRulesPageContent:
    `<b>How to Play</b><br>
    • Click on any face-down card to flip it over<br>
    • You will immediately gain or lose points based on the card<br>
    • You can flip as many cards as you want<br>
    • Click "Stop" when you want to end the round`,
    
    strategyPageContent:
    `<b>Strategy</b><br>
    The more cards you flip, the more points you could gain...<br>
    But you also risk hitting loss cards that subtract points.<br>
    Think carefully about when to stop!`,
    
    // Practice instructions
    practiceIntroContent: '<b>Practice Round</b><br>Let\'s try a practice round to get familiar with the game.',
    practiceCompleteContent: '<b>Practice Complete!</b><br>Great job! You are now ready to begin the actual task.',
    beginTaskButton: 'Begin Task',
    
    // Block instructions
    blockStartContent: (blockNum: number, totalBlocks: number) => 
        `<b>Round ${blockNum} of ${totalBlocks}</b><br>Get ready for the next round. Remember your strategy!`,
    blockBreakContent: (blockNum: number, totalBlocks: number) => 
        `<b>Round ${blockNum} Complete!</b><br>You have completed round ${blockNum} of ${totalBlocks}.<br>Take a short break if needed.`,
    blockContinuePrompt: (blockNum: number) => `Click below to continue to round ${blockNum + 1}.`,
    blockPointsLabel: 'Points This Round:',
    totalPointsLabel: 'Total Points So Far:',

    continueButton: 'Continue',
    
    // Results/Debrief
    taskComplete: 'Task Complete!',
    finalScoreLabel: 'Final Score:',
    totalCardsFlippedLabel: 'Total Cards Flipped:',
    averagePointsPerCardLabel: 'Average Points Per Card:',
    riskTakingScoreLabel: 'Risk-Taking Score:',
    thanksMessage: 'Thank you for completing the Columbia Card Task!',
    finishButton: 'Finish',
    
    // Trial feedback (for practice)
    goodChoiceMessage: 'Good choice!',
    gainCardMessage: (points: number) => `You gained ${points} points!`,
    lossCardMessage: (points: number) => `You lost ${Math.abs(points)} points.`,
    noCardsFlippedMessage: 'You didn\'t flip any cards this round.',
    
    // Button labels (empty strings give us just arrows per jsPsychInstructions)
    back_button: '',
    next_button: '',
    
    // Risk assessment messages  
    riskAssessmentConservative: 'You played conservatively, flipping fewer cards to minimize risk.',
    riskAssessmentModerate: 'You showed moderate risk-taking behavior.',
    riskAssessmentAggressive: 'You took high risks by flipping many cards for potential rewards.'
}