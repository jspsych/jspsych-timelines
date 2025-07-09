import { JsPsych } from "jspsych";
import { DifficultyLevel, ExperimentTrial, generateTrialBatch } from './experiments';

export interface SeedParameters {
    numberOfAnswerOptions: number;
    numberOfExp1Trials: number;
    numberOfExp2Trials: number;
    difficulty: DifficultyLevel;
    seedNumber: number;
}

// Generate seeded trials function
export function genSeed(
    jsPsych: JsPsych,
    parameters: SeedParameters
): ExperimentTrial[] {
    const {
        numberOfAnswerOptions,
        numberOfExp1Trials,
        numberOfExp2Trials,
        difficulty,
        seedNumber
    } = parameters;
    
    // Validate parameters
    if (numberOfAnswerOptions < 2 || numberOfAnswerOptions > 8) {
        throw new Error('numberOfAnswerOptions must be between 2 and 8');
    }
    
    if (numberOfExp1Trials < 0 || numberOfExp2Trials < 0) {
        throw new Error('Trial numbers must be non-negative');
    }
    
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        throw new Error('Difficulty must be "easy", "medium", or "hard"');
    }
    
    if (!Number.isInteger(seedNumber) || seedNumber < 0) {
        throw new Error('Seed number must be a non-negative integer');
    }
    
    // Set the seed for reproducible randomization
    const seedString = seedNumber.toString();
    jsPsych.randomization.setSeed(seedString);
    
    // Generate trials with seeded randomization
    const trials = generateTrialBatch(
        numberOfExp1Trials,
        numberOfExp2Trials,
        difficulty,
        numberOfAnswerOptions
    );
    
    // Add seed information to each trial's data
    trials.forEach((trial, index) => {
        trial.trialData = {
            ...trial.trialData,
            seedNumber,
            trialIndex: index,
            totalTrials: trials.length,
            generatedAt: new Date().toISOString(),
            seedString
        };
    });
    
    return trials;
}

// Utility function to validate seed reproducibility
export function validateSeedReproducibility(
    jsPsych: JsPsych,
    parameters: SeedParameters,
    iterations: number = 3
): boolean {
    const results: string[][] = [];
    
    for (let i = 0; i < iterations; i++) {
        const trials = genSeed(jsPsych, parameters);
        const trialSignature = trials.map(trial => {
            if (trial.experimentType === 'experiment1') {
                return `E1:${trial.target}:${trial.responseOptions.join(',')}:${trial.correctResponse}`;
            } else {
                return `E2:${trial.patternSequence?.join(',')}:${trial.responseOptions.join(',')}:${trial.correctResponse}`;
            }
        });
        results.push(trialSignature);
    }
    
    // Check if all iterations produced identical results
    const firstResult = results[0];
    return results.every(result => 
        result.length === firstResult.length &&
        result.every((trial, index) => trial === firstResult[index])
    );
}

// Function to get seed information for logging
export function getSeedInfo(parameters: SeedParameters): object {
    return {
        seedNumber: parameters.seedNumber,
        difficulty: parameters.difficulty,
        numberOfExp1Trials: parameters.numberOfExp1Trials,
        numberOfExp2Trials: parameters.numberOfExp2Trials,
        numberOfAnswerOptions: parameters.numberOfAnswerOptions,
        totalTrials: parameters.numberOfExp1Trials + parameters.numberOfExp2Trials,
        timestamp: new Date().toISOString()
    };
}

// Preset configurations for common use cases
export const presetConfigurations = {
    quick: {
        numberOfAnswerOptions: 4,
        numberOfExp1Trials: 5,
        numberOfExp2Trials: 5,
        difficulty: 'easy' as DifficultyLevel,
        seedNumber: 12345
    },
    standard: {
        numberOfAnswerOptions: 4,
        numberOfExp1Trials: 10,
        numberOfExp2Trials: 10,
        difficulty: 'medium' as DifficultyLevel,
        seedNumber: 54321
    },
    comprehensive: {
        numberOfAnswerOptions: 6,
        numberOfExp1Trials: 15,
        numberOfExp2Trials: 15,
        difficulty: 'hard' as DifficultyLevel,
        seedNumber: 98765
    },
    research: {
        numberOfAnswerOptions: 4,
        numberOfExp1Trials: 20,
        numberOfExp2Trials: 20,
        difficulty: 'medium' as DifficultyLevel,
        seedNumber: 11111
    }
};

// Function to use preset configurations
export function genSeedFromPreset(
    jsPsych: JsPsych,
    presetName: keyof typeof presetConfigurations,
    customSeed?: number
): ExperimentTrial[] {
    const preset = presetConfigurations[presetName];
    const parameters: SeedParameters = {
        ...preset,
        seedNumber: customSeed !== undefined ? customSeed : preset.seedNumber
    };
    
    return genSeed(jsPsych, parameters);
}