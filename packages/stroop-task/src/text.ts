export const welcomeAndInstructionsText = {
    pages: [
        `<div class="instructions-container">
            <h1>Welcome to the Stroop Task</h1>
        </div>`,
        `<div class="instructions-container">
            <p>In this task, you will see words that name colors (like RED, BLUE, GREEN)</p>
        </div>`,
        `<div class="instructions-container">
            <p>The color of the letters might not match the word, for example <span style="color: red;">RED</span> (in <span style="color: blue;">blue</span>), <span style="color: blue;">BLUE</span> (in <span style="color: green;">green</span>).</p>
            <p>Your job is to press the button that matches the color of the word, not what the word says.</p>
            <p>In the above example, you would press first a blue button; then a green button.</p>
        </div>`,
        (choiceOfColors?: string[]) => `<div class="instructions-container">
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
        `<div class="instructions-container">
            <p>More examples:</p>
            <ul>
                <li>If the word RED appears in green ink → press GREEN</li>
                <li>If the word BLUE appears in blue ink → press BLUE</li>
            </ul>
        </div>`,
        `<div class="instructions-container">
            <p>Try to go as fast and as accurately as possible.</p>
        </div>`
    ]
};