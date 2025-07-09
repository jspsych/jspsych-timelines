import { 
    getCategories, 
    getSubcategories, 
    getRandomImageFromSubcategory, 
    getRandomImageFromCategory,
    getRandomImageFromDifferentCategory,
    categoryMapping 
} from './images';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ExperimentType = 'experiment1' | 'experiment2';

export interface ExperimentTrial {
    experimentType: ExperimentType;
    difficulty: DifficultyLevel;
    target?: string;
    patternSequence?: string[];
    responseOptions: string[];
    correctResponse: number;
    trialData: {
        targetCategory?: string;
        targetSubcategory?: string;
        correctCategory?: string;
        correctSubcategory?: string;
        distractorSources?: string[];
        seedNumber?: number;
        trialIndex?: number;
        totalTrials?: number;
        generatedAt?: string;
        seedString?: string;
    };
}

// Generate Experiment 1 trial: Target matching task
export function generateExperiment1Trial(
    difficulty: DifficultyLevel,
    numberOfOptions: number = 4
): ExperimentTrial {
    const categories = getCategories();
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const subcategories = getSubcategories(randomCategory);
    const randomSubcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
    
    // Get target stimulus
    const targetImage = getRandomImageFromSubcategory(randomCategory, randomSubcategory);
    if (!targetImage) {
        throw new Error(`No images found in ${randomCategory}/${randomSubcategory}`);
    }
    
    // Get correct answer from same subcategory
    const correctImage = getRandomImageFromSubcategory(randomCategory, randomSubcategory);
    if (!correctImage) {
        throw new Error(`No additional images found in ${randomCategory}/${randomSubcategory}`);
    }
    
    const responseOptions = [correctImage.dataUrl];
    const distractorSources: string[] = [];
    
    // Generate distractors based on difficulty level
    for (let i = 1; i < numberOfOptions; i++) {
        let distractor;
        
        switch (difficulty) {
            case 'easy':
                // Options from different categories
                distractor = getRandomImageFromDifferentCategory(randomCategory);
                if (distractor) {
                    responseOptions.push(distractor.dataUrl);
                    distractorSources.push(`${distractor.category}/${distractor.subcategory}`);
                }
                break;
                
            case 'medium':
                // One option from same category (different subcategory), rest from different categories
                if (i === 1) {
                    // First distractor from same category, different subcategory
                    distractor = getRandomImageFromCategory(randomCategory, randomSubcategory);
                    if (distractor) {
                        responseOptions.push(distractor.dataUrl);
                        distractorSources.push(`${randomCategory}/${distractor.subcategory}`);
                    }
                } else {
                    // Rest from different categories
                    distractor = getRandomImageFromDifferentCategory(randomCategory);
                    if (distractor) {
                        responseOptions.push(distractor.dataUrl);
                        distractorSources.push(`${distractor.category}/${distractor.subcategory}`);
                    }
                }
                break;
                
            case 'hard':
                // All options from same category, different subcategories
                distractor = getRandomImageFromCategory(randomCategory, randomSubcategory);
                if (distractor) {
                    responseOptions.push(distractor.dataUrl);
                    distractorSources.push(`${randomCategory}/${distractor.subcategory}`);
                }
                break;
        }
    }
    
    // Shuffle response options and track correct position
    const shuffledOptions = [...responseOptions];
    const correctResponse = 0; // We'll shuffle and update this
    
    // Fisher-Yates shuffle
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    
    // Find where the correct answer ended up
    const finalCorrectResponse = shuffledOptions.indexOf(correctImage.dataUrl);
    
    return {
        experimentType: 'experiment1',
        difficulty,
        target: targetImage.dataUrl,
        responseOptions: shuffledOptions,
        correctResponse: finalCorrectResponse,
        trialData: {
            targetCategory: randomCategory,
            targetSubcategory: randomSubcategory,
            correctCategory: randomCategory,
            correctSubcategory: randomSubcategory,
            distractorSources
        }
    };
}

// Generate Experiment 2 trial: Pattern completion task
export function generateExperiment2Trial(
    numberOfOptions: number = 4
): ExperimentTrial {
    const categories = getCategories();
    
    // Select two different images for the alternating pattern
    const category1 = categories[Math.floor(Math.random() * categories.length)];
    const subcategories1 = getSubcategories(category1);
    const subcategory1 = subcategories1[Math.floor(Math.random() * subcategories1.length)];
    
    const category2 = categories[Math.floor(Math.random() * categories.length)];
    const subcategories2 = getSubcategories(category2);
    const subcategory2 = subcategories2[Math.floor(Math.random() * subcategories2.length)];
    
    const imageA = getRandomImageFromSubcategory(category1, subcategory1);
    const imageB = getRandomImageFromSubcategory(category2, subcategory2);
    
    if (!imageA || !imageB) {
        throw new Error('Could not generate pattern images');
    }
    
    // Create alternating pattern: A-B-A-?
    // The answer should be B
    const patternSequence = [
        imageA.dataUrl,  // A
        imageB.dataUrl,  // B
        imageA.dataUrl   // A
        // Fourth position is the question mark (missing B)
    ];
    
    // Response options: correct answer (B) + distractors
    const responseOptions = [imageB.dataUrl]; // Correct answer
    const distractorSources: string[] = [];
    
    // Generate random distractors from various categories
    for (let i = 1; i < numberOfOptions; i++) {
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        const distractor = getRandomImageFromCategory(randomCat);
        if (distractor) {
            responseOptions.push(distractor.dataUrl);
            distractorSources.push(`${randomCat}/${distractor.subcategory}`);
        }
    }
    
    // Shuffle response options and track correct position
    const shuffledOptions = [...responseOptions];
    
    // Fisher-Yates shuffle
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    
    // Find where the correct answer ended up
    const finalCorrectResponse = shuffledOptions.indexOf(imageB.dataUrl);
    
    return {
        experimentType: 'experiment2',
        difficulty: 'medium', // Pattern completion doesn't have variable difficulty
        patternSequence,
        responseOptions: shuffledOptions,
        correctResponse: finalCorrectResponse,
        trialData: {
            targetCategory: `${category1},${category2}`,
            targetSubcategory: `${subcategory1},${subcategory2}`,
            correctCategory: category2,
            correctSubcategory: subcategory2,
            distractorSources
        }
    };
}

// Generate a batch of trials
export function generateTrialBatch(
    numberOfExp1Trials: number,
    numberOfExp2Trials: number,
    difficulty: DifficultyLevel,
    numberOfAnswerOptions: number = 4
): ExperimentTrial[] {
    const trials: ExperimentTrial[] = [];
    
    // Generate Experiment 1 trials
    for (let i = 0; i < numberOfExp1Trials; i++) {
        trials.push(generateExperiment1Trial(difficulty, numberOfAnswerOptions));
    }
    
    // Generate Experiment 2 trials
    for (let i = 0; i < numberOfExp2Trials; i++) {
        trials.push(generateExperiment2Trial(numberOfAnswerOptions));
    }
    
    // Shuffle the combined trials
    for (let i = trials.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [trials[i], trials[j]] = [trials[j], trials[i]];
    }
    
    return trials;
}

// Utility function to create HTML for experiment displays
export function createExperiment1HTML(trial: ExperimentTrial): string {
    return `
        <div class="visual-reasoning-container">
            <div class="experiment-type-indicator experiment-1-indicator">
                Experiment 1: Find the Match
            </div>
            <div class="task-instructions">
                <p>Which image is most similar to the target image?</p>
            </div>
            <div class="target-container">
                <img src="${trial.target}" class="target-stimulus" alt="Target stimulus" />
            </div>
        </div>
    `;
}

export function createExperiment2HTML(trial: ExperimentTrial): string {
    if (!trial.patternSequence) return '';
    
    const patternItems = trial.patternSequence.map(img => 
        `<img src="${img}" class="pattern-item" alt="Pattern item" />`
    ).join('');
    
    return `
        <div class="visual-reasoning-container">
            <div class="experiment-type-indicator experiment-2-indicator">
                Experiment 2: Complete the Pattern
            </div>
            <div class="task-instructions">
                <p>What comes next in this pattern?</p>
            </div>
            <div class="pattern-sequence-container">
                <div class="pattern-sequence">
                    ${patternItems}
                    <div class="pattern-question-mark">?</div>
                </div>
            </div>
        </div>
    `;
}