export const symbols = {
  oneSymbol: '—',     // 1 - Horizontal line
  twoSymbol: 'ᴎ',     // 2 - Latin Letter Small Capital Reversed N (U+1D0E)
  threeSymbol: '⊐',   // 3 - Square Original Of (U+2290)
  fourSymbol: '∟',    // 4 - Right Angle (U+221F)
  fiveSymbol: 'U',    // 5 - Letter U
  sixSymbol: 'O',     // 6 - Letter O
  sevenSymbol: '^',   // 7 - Caret/hat
  eightSymbol: 'X',   // 8 - Letter X
  nineSymbol: '='     // 9 - Equals sign
} as const;

export const englishText = {
  // Instructions
  instructionsTitle: "Oral Symbol Digit Test - Instructions",
  symbolNumberKey: "Symbol-Number Key:",
  instructionsHeader: "Instructions:",
  instructionsIntro: "Look at the symbols at the top of this page. Each symbol is matched with a number.",
  instructionsTask: "You will see symbols without numbers. Your job is to {} that goes with each symbol.",
  instructionsExample1: "For example: The symbol {} is matched with the number {}, so you would {}.",
  instructionsExample2: "The symbol {} is matched with the number {}, so you would {}.",
  continueButton: "Continue to Practice",

  // Practice
  practiceTitle: "Practice Round",
  practiceHeader: "Practice: Symbol Digit Test",
  practiceKeyboardInstructions: "Use Number Keys to Answer",
  practiceKeyboardDetail: "Press the number key (1-9) on your keyboard that matches the symbol above",
  practiceKeyboardNote: "You'll get immediate feedback, then move to the next symbol",
  
  // Practice Results
  practiceResultsTitle: "Practice Results - Attempt {}",
  practiceResultsScore: "You got {} out of {} correct ({}% accuracy)!",
  practiceResultsPerfect: "Perfect! You're ready for the main test.",
  practiceResultsMaxAttempts: "You've completed {} practice attempts. You can now proceed to the main test.",
  practiceResultsRemember: "Remember: {}",
  practiceResultsRetry: "Let's try the practice again. (Attempt {} of {})",
  retryButton: "Retry Practice",
  startMainTestButton: "Start Main Test",

  // Pre-test Instructions
  preTestTitle: "Ready for the Main Test",
  preTestInstructionsHeader: "Instructions for the main test:",
  preTestDuration: "You will have {} to complete as many items as possible",
  preTestSpeed: "Work as quickly as you can without making mistakes",
  preTestInput: "{}",
  preTestAdvancement: "The test will automatically advance to the next symbol after you {}",
  preTestTimer: "Keep working until the timer reaches zero",
  beginMainTestButton: "Begin Main Test",

  // Main Test
  mainTestTitle: "Symbol Digit Test",
  mainTestKeyboardInstructions: "Use Number Keys to Answer",
  mainTestKeyboardDetail: "Press the number key (1-9) on your keyboard that matches the symbol above",
  mainTestKeyboardNote: "The test will automatically advance after you press a key",
  progressLabel: "Progress: {} / {}",
  correctLabel: "Correct: {}",
  timerLabel: "Time: {}s",

  // Feedback
  feedbackCorrect: "✓ Correct!",
  feedbackIncorrect: "✗ Incorrect",
  feedbackDetail: "{} → {} (you pressed {})",
  feedbackDetailCorrect: "{} → {}",

  // Thank You
  thankYouTitle: "Thank You!",
  thankYouHeader: "Test Completed Successfully",
  thankYouMessage: "You have successfully completed the Oral Symbol Digit Test. Your responses have been recorded and your results are being processed.",
  thankYouNote: "Click the button below to view your detailed results.",
  viewResultsButton: "View My Results",

  // Results
  resultsTitle: "Your Test Results",
  resultsItemsCorrect: "Items Correct",
  resultsItemsAttempted: "Items Attempted",
  resultsAccuracy: "Accuracy",
  resultsItemsPerMinute: "Items/Minute",
  resultsDetailsTitle: "Test Performance Details",
  resultsTiming: "Timing",
  resultsTotalTime: "Total Time: {} seconds",
  resultsAveragePerItem: "Average per Item: {} seconds",
  resultsProcessingSpeed: "Processing Speed: {} items/min",
  resultsAccuracyDetails: "Accuracy",
  resultsCorrectResponses: "Correct Responses: {}",
  resultsIncorrectSkipped: "Incorrect/Skipped: {}",
  resultsSuccessRate: "Success Rate: {}%",
  resultsPerformanceAssessment: "Performance Assessment",
  resultsExcellent: "Excellent performance! You demonstrated strong symbol-digit processing speed and accuracy.",
  resultsGood: "Good performance! You showed solid symbol-digit processing abilities with room for improvement.",
  resultsPractice: "This test measures processing speed. Consider practicing symbol-number associations to improve performance.",
  resultsViewData: "Click below to view the complete data breakdown.",
  viewCompleteDataButton: "View Complete Data",
  finishButton: "Finish",

  // Input method specific text
  inputMethodButtons: "Click the number button that matches each symbol",
  inputMethodKeyboard: "Press the number key (1-9) that matches each symbol",
  inputMethodSelectNumber: "select the number",
  inputMethodPressKey: "press the number key",
  inputMethodSelect: 'select "{}"',
  inputMethodPress: 'press the "{}" key',
  inputMethodSelectAnswer: "select an answer",
  inputMethodPressKey2: "press a key"
} as const;