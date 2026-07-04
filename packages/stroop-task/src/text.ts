/**
 * Metrics passed to the `results` text function.
 */
export interface StroopResultsStats {
    /** Percentage of congruent trials answered correctly */
    congruentAccuracy: number;
    /** Mean response time (ms) on correct congruent trials */
    congruentRt: number;
    /** Percentage of incongruent trials answered correctly */
    incongruentAccuracy: number;
    /** Mean response time (ms) on correct incongruent trials */
    incongruentRt: number;
    /** Stroop effect (ms): incongruentRt − congruentRt */
    stroopEffect: number;
}

/**
 * Default text content for the Stroop task.
 * Contains all instruction pages, feedback messages, and result templates.
 */
export const defaultText = {
    /**
     * Array of instruction pages. Can contain HTML strings or functions that return HTML.
     * Functions receive choiceOfColors array as parameter for dynamic content generation.
     */
    instructions: [
        `<div class="jspsych-stroop-task-instructions">
            <h1>Welcome to the Stroop Task</h1>
        </div>`,
        `<div class="jspsych-stroop-task-instructions">
            <p>In this task, you will see words that name colors (like RED, BLUE, GREEN)</p>
        </div>`,
        `<div class="jspsych-stroop-task-instructions">
            <p>The color of the letters might not match the word, for example <span style="color: red;">RED</span> (in <span style="color: blue;">blue</span>), <span style="color: blue;">BLUE</span> (in <span style="color: green;">green</span>).</p>
            <p>Your job is to press the button that matches the color of the word, not what the word says.</p>
            <p>In the above example, you would press first a blue button; then a green button.</p>
        </div>`,
        (choiceOfColors?: string[]) => `<div class="jspsych-stroop-task-instructions">
            <p>You will have to click one of the buttons that will appear below for each color:</p>
            <div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; margin: 20px 0;">
                ${(() => {
                    const selectedColors = choiceOfColors || ['RED', 'GREEN', 'BLUE', 'YELLOW'];
                    const dynamicColors = selectedColors.map((colorName, index) => ({
                        name: colorName,
                        hex: colorName.toLowerCase(),
                        index: index
                    }));
                    return dynamicColors.map(color => `
                        <div style="padding: 15px; border: 1px solid black; border-radius: 8px; margin: 10px; min-width: 120px; text-align: center; background-color: white;">
                            <span style="color: black; font-size: 24px; font-weight: bold; display: block; margin-bottom: 5px;">${color.name}</span>
                        </div>
                    `).join('');
                })()}
            </div>
        </div>`,
        `<div class="jspsych-stroop-task-instructions">
            <p>More examples:</p>
            <ul>
                <li>If the word RED appears in green ink → press GREEN</li>
                <li>If the word BLUE appears in blue ink → press BLUE</li>
            </ul>
        </div>`,
        `<div class="jspsych-stroop-task-instructions">
            <p>Try to go as fast and as accurately as possible.</p>
        </div>`
    ],
    /**
     * Function returning the HTML shown after a correct practice response.
     * Receives the correct color name (`answer`) and returns an HTML string.
     */
    correct_feedback: (answer: string) =>
        `<div style="font-size: 24px; text-align: center;"><p>✓ CORRECT!</p></div>`,
    /**
     * Function returning the HTML shown after an incorrect practice response.
     * Receives the correct color name (`answer`) and returns an HTML string.
     */
    incorrect_feedback: (answer: string) =>
        `<div style="font-size: 24px; text-align: center;"><p>✗ INCORRECT. The correct answer was ${answer.toUpperCase()}.</p></div>`,
    /** Text for the continue button in feedback screens */
    continue_button: "Continue",
    /** HTML content for the screen shown between practice and main experiment */
    practice_debrief: `
            <div style="max-width: 700px; margin: 0 auto; text-align: center; padding: 20px;">
                <h2>Practice Complete!</h2>
                <p>Great job! You've finished the practice trials.</p>
                <p>Now you'll begin the main experiment.</p>
                <p>Remember:</p>
                <ul style="text-align: left; display: inline-block;">
                    <li>Respond to the <strong>ink color</strong>, not the word</li>
                    <li>Be as fast and accurate as possible</li>
                    <li>Click the colored buttons for Red, Green, Blue, Yellow</li>
                </ul>
            </div>
        `,
    /** HTML content for the fixation cross stimulus */
    fixation: "+",
    /** Function to generate the button HTML for the Stroop tasks. */
    response_button_html: (choice: string, choice_index: number) =>
        `<div class="jspsych-stroop-task-response-button">${choice}</div>`,
    /** Text for the start button after practice debrief */
    start_button: "Start",
    /** Text for the finish button on the results screen */
    finish_button: "Finish",
    /**
     * Function returning the HTML for the results screen.
     * Receives a {@link StroopResultsStats} object with the computed metrics.
     */
    results: (stats: StroopResultsStats) => `
                <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                    <h2>Experiment Complete!</h2>
                    <div style="text-align: left; background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Congruent trials:</strong> ${stats.congruentAccuracy}% correct, ${stats.congruentRt}ms average</p>
                        <p><strong>Incongruent trials:</strong> ${stats.incongruentAccuracy}% correct, ${stats.incongruentRt}ms average</p>
                        <p><strong>Stroop Effect:</strong> ${stats.stroopEffect}ms</p>
                    </div>
                    <p>Thank you for participating!</p>
                </div>
            `
};