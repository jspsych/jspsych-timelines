import { initJsPsych } from "jspsych";
import { createTimeline, timelineComponents, utils } from "./index";

// Mock jsPsych plugins
jest.mock('@jspsych/plugin-html-keyboard-response', () => {
    return jest.fn();
});

jest.mock('@jspsych/plugin-html-button-response', () => {
    return jest.fn();
});

jest.mock('@jspsych/plugin-instructions', () => {
    return jest.fn();
});

jest.useFakeTimers();

beforeEach(() => {
    jest.clearAllMocks();
});

describe("stroop-task utility functions", () => {
    let jsPsych;
    
    beforeEach(() => {
        jsPsych = initJsPsych();
    });
    
    describe("generateStimuli", () => {
        test("generates exact number of requested trials", () => {
            const colors = ['RED', 'GREEN'];
            const stimuli = utils.generateStimuli(jsPsych, colors, 10, 8);
            
            const congruent = stimuli.filter(s => s.congruent);
            const incongruent = stimuli.filter(s => !s.congruent);
            
            expect(congruent.length).toBe(10);
            expect(incongruent.length).toBe(8);
            expect(stimuli.length).toBe(18);
        });

        test("distributes 10 congruent trials evenly across 2 colors (5 each)", () => {
            const colors = ['RED', 'GREEN'];
            const stimuli = utils.generateStimuli(jsPsych, colors, 10, 0);
            const congruent = stimuli.filter(s => s.congruent);
            
            expect(congruent.length).toBe(10);
            
            const redTrials = congruent.filter(s => s.word === 'RED').length;
            const greenTrials = congruent.filter(s => s.word === 'GREEN').length;
            
            expect(redTrials).toBe(5);
            expect(greenTrials).toBe(5);
        });

        test("distributes 18 congruent trials across 4 colors (5, 5, 4, 4)", () => {
            const colors = ['RED', 'GREEN', 'BLUE', 'YELLOW'];
            const stimuli = utils.generateStimuli(jsPsych, colors, 18, 0);
            const congruent = stimuli.filter(s => s.congruent);
            
            expect(congruent.length).toBe(18);
            
            const counts = colors.map(color => 
                congruent.filter(s => s.word === color).length
            );
            
            // Should have 4 complete sets (4 each) + 2 remainder = 18 total
            // With randomization, some colors get 5, others get 4
            counts.sort((a, b) => b - a); // Sort descending
            expect(counts[0]).toBe(5); // Two colors should have 5
            expect(counts[1]).toBe(5);
            expect(counts[2]).toBe(4); // Two colors should have 4
            expect(counts[3]).toBe(4);
            expect(counts.reduce((sum, count) => sum + count, 0)).toBe(18);
        });

        test("handles exact multiples correctly", () => {
            const colors = ['RED', 'GREEN', 'BLUE', 'YELLOW'];
            const stimuli = utils.generateStimuli(jsPsych, colors, 20, 0);
            const congruent = stimuli.filter(s => s.congruent);
            
            expect(congruent.length).toBe(20);
            
            // 20 / 4 = 5 exactly, so each color should appear 5 times
            const counts = colors.map(color => 
                congruent.filter(s => s.word === color).length
            );
            
            counts.forEach(count => {
                expect(count).toBe(5);
            });
        });

        test("has correct stimulus structure", () => {
            const colors = ['RED', 'GREEN'];
            const stimuli = utils.generateStimuli(jsPsych, colors, 4, 2);
            
            stimuli.forEach(stimulus => {
                expect(stimulus).toHaveProperty('word');
                expect(stimulus).toHaveProperty('color');
                expect(stimulus).toHaveProperty('correct_response');
                expect(stimulus).toHaveProperty('congruent');
                expect(typeof stimulus.correct_response).toBe('number');
                expect(typeof stimulus.congruent).toBe('boolean');
                expect(colors).toContain(stimulus.word);
                expect(stimulus.correct_response).toBeGreaterThanOrEqual(0);
                expect(stimulus.correct_response).toBeLessThan(colors.length);
            });
        });

        test("generates correct congruent vs incongruent stimuli", () => {
            const colors = ['RED', 'GREEN'];
            const stimuli = utils.generateStimuli(jsPsych, colors, 4, 6);
            
            const congruent = stimuli.filter(s => s.congruent);
            const incongruent = stimuli.filter(s => !s.congruent);
            
            // Check congruent stimuli have matching word and color
            congruent.forEach(stimulus => {
                expect(stimulus.word.toLowerCase()).toBe(stimulus.color);
            });
            
            // Check incongruent stimuli have mismatched word and color
            incongruent.forEach(stimulus => {
                expect(stimulus.word.toLowerCase()).not.toBe(stimulus.color);
            });
        });

        test("handles single color correctly", () => {
            const colors = ['RED'];
            const stimuli = utils.generateStimuli(jsPsych, colors, 3, 0);
            
            // With only one color, all trials should be congruent
            expect(stimuli.length).toBe(3);
            expect(stimuli.every(s => s.congruent)).toBe(true);
            expect(stimuli.every(s => s.word === 'RED' && s.color === 'red')).toBe(true);
        });

        test("handles zero trials correctly", () => {
            const colors = ['RED', 'GREEN'];
            const stimuli = utils.generateStimuli(jsPsych, colors, 0, 0);
            
            expect(stimuli.length).toBe(0);
        });

        test("distributes incongruent trials evenly", () => {
            const colors = ['RED', 'GREEN', 'BLUE'];
            const stimuli = utils.generateStimuli(jsPsych, colors, 0, 12);
            const incongruent = stimuli.filter(s => !s.congruent);
            
            expect(incongruent.length).toBe(12);
            
            // With 3 colors, there are 6 incongruent combinations (3x2)
            // 12 trials / 6 combinations = 2 of each combination
            const combinations = new Set();
            incongruent.forEach(s => {
                combinations.add(`${s.word}-${s.color}`);
            });
            expect(combinations.size).toBe(6); // All 6 combinations should be present
        });
    });

});

describe("stroop-task timeline components", () => {
    let jsPsych;

    beforeEach(() => {
        jsPsych = initJsPsych();
    });

    describe("createInstructions", () => {
        test("creates instructions with correct structure", () => {
            const instructionPages = ['<div>Page 1</div>', '<div>Page 2</div>'];
            const instructions = timelineComponents.createInstructions(instructionPages);
            expect(instructions).toHaveProperty('type');
            expect(instructions).toHaveProperty('pages');
            expect(instructions).toHaveProperty('show_clickable_nav');
            expect(instructions).toHaveProperty('allow_keys');
        });

        test("has multiple pages with instructions", () => {
            const instructionPages = ['<div>Page 1</div>', '<div>Page 2</div>'];
            const instructions = timelineComponents.createInstructions(instructionPages);
            expect(Array.isArray(instructions.pages)).toBe(true);
            expect(instructions.pages.length).toBe(2);
        });

        test("processes function-based pages with color choices", () => {
            const instructionPages = [
                '<div>Static page</div>',
                (colors?: string[]) => `<div>Colors: ${colors?.join(', ')}</div>`
            ];
            const instructions = timelineComponents.createInstructions(instructionPages, ['RED', 'BLUE']);
            expect(instructions.pages[0]).toBe('<div>Static page</div>');
            expect(instructions.pages[1]).toContain('RED, BLUE');
        });

        test("has proper HTML structure and navigation settings", () => {
            const instructionPages = ['<div><h1>Welcome</h1></div>'];
            const instructions = timelineComponents.createInstructions(instructionPages);
            const firstPage = instructions.pages[0];
            expect(firstPage).toMatch(/<div[^>]*>/);
            expect(firstPage).toMatch(/<h1[^>]*>/);
            expect(instructions.show_clickable_nav).toBe(true);
            expect(instructions.allow_keys).toBe(true);
        });

        test("has correct data properties", () => {
            const instructionPages = ['<div>Page 1</div>'];
            const instructions = timelineComponents.createInstructions(instructionPages);
            expect(instructions.data.page).toBe('instructions');
        });
    });


    describe("createFixation", () => {
        test("creates fixation cross with correct properties", () => {
            const fixation = timelineComponents.createFixation(500);
            expect(fixation).toHaveProperty('type');
            expect(fixation).toHaveProperty('stimulus');
            expect(fixation).toHaveProperty('choices');
            expect(fixation).toHaveProperty('trial_duration');
            expect(fixation).toHaveProperty('data');
        });

        test("has correct stimulus and choices", () => {
            const fixation = timelineComponents.createFixation(500);
            expect(fixation.choices).toBe("NO_KEYS");
            expect(fixation.stimulus).toContain('+');
        });

        test("accepts custom duration", () => {
            const customDuration = 1000;
            const fixation = timelineComponents.createFixation(customDuration);
            expect(fixation.trial_duration).toBe(customDuration);
        });

        test("has correct data properties", () => {
            const fixation = timelineComponents.createFixation(500);
            expect(fixation.data.page).toBe('fixation');
        });

        test("uses provided duration", () => {
            const fixation = timelineComponents.createFixation(750);
            expect(fixation.trial_duration).toBe(750);
        });
    });

    describe("createStroopTrials", () => {
        const mockStimuli = [{
            word: 'RED',
            color: 'blue',
            correct_response: 2,
            congruent: false
        }];

        test("creates timeline with correct structure", () => {
            const trials = timelineComponents.createStroopTrials(jsPsych, {
                trial_variables: mockStimuli,
                is_practice: false
            });
            expect(trials).toHaveProperty('timeline');
            expect(trials).toHaveProperty('timeline_variables');
            expect(trials).toHaveProperty('randomize_order');
            expect(trials).toHaveProperty('data');
        });

        test("has correct timeline variables", () => {
            const trials = timelineComponents.createStroopTrials(jsPsych, {
                trial_variables: mockStimuli,
                is_practice: false
            });
            expect(trials.timeline_variables).toEqual(mockStimuli);
        });

        test("distinguishes practice from main trials", () => {
            const practiceTrials = timelineComponents.createStroopTrials(jsPsych, {
                trial_variables: mockStimuli,
                is_practice: true
            });
            const mainTrials = timelineComponents.createStroopTrials(jsPsych, {
                trial_variables: mockStimuli,
                is_practice: false
            });

            expect(practiceTrials.data.phase).toBe('practice');
            expect(mainTrials.data.phase).toBe('test');
        });

        test("includes fixation when enabled", () => {
            const trials = timelineComponents.createStroopTrials(jsPsych, {
                trial_variables: mockStimuli,
                is_practice: false,
                include_fixation: true
            });
            expect(Array.isArray(trials.timeline)).toBe(true);
            expect(trials.timeline.length).toBeGreaterThan(1);
        });

        test("excludes fixation when disabled", () => {
            const trials = timelineComponents.createStroopTrials(jsPsych, {
                trial_variables: mockStimuli,
                is_practice: false,
                include_fixation: false
            });
            expect(Array.isArray(trials.timeline)).toBe(true);
        });

        test("includes feedback for practice trials when enabled", () => {
            const trials = timelineComponents.createStroopTrials(jsPsych, {
                trial_variables: mockStimuli,
                is_practice: true,
                show_practice_feedback: true
            });
            expect(Array.isArray(trials.timeline)).toBe(true);
            expect(trials.timeline.length).toBeGreaterThan(1);
        });
    });

    describe("createPracticeFeedback", () => {
        test("creates feedback trial", () => {
            const colors = ['RED', 'GREEN', 'BLUE'];
            const feedback = timelineComponents.createPracticeFeedback(
                jsPsych,
                colors,
                'Correct!',
                'Incorrect. The answer was %ANSWER%',
                'Continue'
            );
            expect(feedback).toHaveProperty('type');
            expect(feedback).toHaveProperty('stimulus');
            expect(feedback).toHaveProperty('choices');
            expect(feedback).toHaveProperty('trial_duration');
        });

        test("has correct choices and duration", () => {
            const colors = ['RED', 'GREEN', 'BLUE'];
            const feedback = timelineComponents.createPracticeFeedback(
                jsPsych,
                colors,
                'Correct!',
                'Incorrect. The answer was %ANSWER%',
                'Continue'
            );
            expect(feedback.choices).toEqual(['Continue']);
            expect(feedback.trial_duration).toBe(2000);
        });

        test("has dynamic stimulus function", () => {
            const colors = ['RED', 'GREEN', 'BLUE'];
            const feedback = timelineComponents.createPracticeFeedback(
                jsPsych,
                colors,
                'Correct!',
                'Incorrect. The answer was %ANSWER%',
                'Continue'
            );
            expect(typeof feedback.stimulus).toBe('function');
        });

        test("has correct data properties", () => {
            const colors = ['RED', 'GREEN', 'BLUE'];
            const feedback = timelineComponents.createPracticeFeedback(
                jsPsych,
                colors,
                'Correct!',
                'Incorrect. The answer was %ANSWER%',
                'Continue'
            );
            expect(feedback.data.page).toBe('feedback');
        });
    });

    describe("createPracticeDebrief", () => {
        test("creates debrief with correct properties", () => {
            const debrief = timelineComponents.createPracticeDebrief(
                'Practice complete!',
                'Start'
            );
            expect(debrief).toHaveProperty('type');
            expect(debrief).toHaveProperty('stimulus');
            expect(debrief).toHaveProperty('choices');
            expect(debrief).toHaveProperty('post_trial_gap');
        });

        test("has correct choices", () => {
            const debrief = timelineComponents.createPracticeDebrief(
                'Practice complete!',
                'Start Experiment'
            );
            expect(debrief.choices).toEqual(['Start Experiment']);
        });

        test("uses provided stimulus text", () => {
            const customText = 'Custom practice debrief message';
            const debrief = timelineComponents.createPracticeDebrief(
                customText,
                'Continue'
            );
            expect(debrief.stimulus).toBe(customText);
        });

        test("has correct data properties", () => {
            const debrief = timelineComponents.createPracticeDebrief(
                'Practice complete!',
                'Start'
            );
            expect(debrief.data.page).toBe('practice_debrief');
        });
    });

    describe("createResults", () => {
        test("creates results trial", () => {
            const results = timelineComponents.createResults(
                jsPsych,
                'Results: %congruentAccuracy%% accuracy'
            );
            expect(results).toHaveProperty('type');
            expect(results).toHaveProperty('stimulus');
            expect(results).toHaveProperty('choices');
        });

        test("has correct choices", () => {
            const results = timelineComponents.createResults(
                jsPsych,
                'Results: %congruentAccuracy%% accuracy'
            );
            expect(results.choices).toEqual(['Finish']);
        });

        test("has dynamic stimulus function", () => {
            const results = timelineComponents.createResults(
                jsPsych,
                'Results: %congruentAccuracy%% accuracy'
            );
            expect(typeof results.stimulus).toBe('function');
        });

        test("has correct data properties", () => {
            const results = timelineComponents.createResults(
                jsPsych,
                'Results: %congruentAccuracy%% accuracy'
            );
            expect(results.data.page).toBe('results');
        });
    });
});

describe("stroop-task full timeline", () => {
    let jsPsych;

    beforeEach(() => {
        jsPsych = initJsPsych();
    });

    test("creates timeline with default parameters", () => {
        const timeline = createTimeline(jsPsych);
        expect(timeline).toHaveProperty('timeline');
        expect(timeline).toHaveProperty('data');
        expect(Array.isArray(timeline.timeline)).toBe(true);
        expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    test("respects custom parameters", () => {
        const customParams = {
            congruent_practice_trials: 1,
            incongruent_practice_trials: 1,
            congruent_main_trials: 2,
            incongruent_main_trials: 2,
            show_instructions: false,
            show_results: false
        };

        const timeline = createTimeline(jsPsych, customParams);
        expect(timeline).toHaveProperty('timeline');
        expect(Array.isArray(timeline.timeline)).toBe(true);

        // Should have fewer components without instructions and results
        const timelineWithDefaults = createTimeline(jsPsych);
        expect(timeline.timeline.length).toBeLessThan(timelineWithDefaults.timeline.length);
    });

    test("includes instructions when enabled", () => {
        const timelineWithInstructions = createTimeline(jsPsych, { show_instructions: true });
        const hasInstructions = timelineWithInstructions.timeline.some((trial: any) =>
            trial.pages && Array.isArray(trial.pages)
        );
        expect(hasInstructions).toBe(true);
    });

    test("excludes instructions when disabled", () => {
        const timelineWithoutInstructions = createTimeline(jsPsych, { show_instructions: false });
        const hasInstructions = timelineWithoutInstructions.timeline.some((trial: any) =>
            trial.pages && Array.isArray(trial.pages)
        );
        expect(hasInstructions).toBe(false);
    });

    test("includes results when enabled", () => {
        const timelineWithResults = createTimeline(jsPsych, { show_results: true });
        const hasResults = timelineWithResults.timeline.some((trial: any) =>
            trial.choices && trial.choices.includes('Finish')
        );
        expect(hasResults).toBe(true);
    });

    test("excludes results when disabled", () => {
        const timelineWithoutResults = createTimeline(jsPsych, { show_results: false });
        const hasResults = timelineWithoutResults.timeline.some((trial: any) =>
            trial.choices && trial.choices.includes('Finish')
        );
        expect(hasResults).toBe(false);
    });

    test("works with minimal configuration", () => {
        const timeline = createTimeline(jsPsych, {
            congruent_practice_trials: 1,
            incongruent_practice_trials: 1,
            congruent_main_trials: 1,
            incongruent_main_trials: 1,
            show_instructions: false,
            show_results: false
        });

        expect(timeline).toHaveProperty('timeline');
        expect(Array.isArray(timeline.timeline)).toBe(true);
        expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    test("creates practice trials when specified", () => {
        const timeline = createTimeline(jsPsych, { 
            congruent_practice_trials: 2,
            incongruent_practice_trials: 2
        });
        const practiceTrials = timeline.timeline.filter((trial: any) =>
            trial.data && trial.data.phase === 'practice'
        );
        expect(practiceTrials.length).toBeGreaterThan(0);
    });

    test("creates main trials", () => {
        const timeline = createTimeline(jsPsych, {
            congruent_main_trials: 2,
            incongruent_main_trials: 2
        });
        expect(timeline).toHaveProperty('timeline');
        expect(Array.isArray(timeline.timeline)).toBe(true);
        expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    test("skips practice trials when set to 0", () => {
        const timeline = createTimeline(jsPsych, {
            congruent_practice_trials: 0,
            incongruent_practice_trials: 0
        });
        const practiceTrials = timeline.timeline.filter((trial: any) =>
            trial.data && trial.data.phase === 'practice'
        );
        expect(practiceTrials.length).toBe(0);
    });

    test("has correct task data", () => {
        const timeline = createTimeline(jsPsych);
        expect(timeline.data.task).toBe('stroop');
    });

    test("handles edge case parameters", () => {
        expect(() => {
            createTimeline(jsPsych, {
                congruent_practice_trials: 0,
                incongruent_practice_trials: 0,
                congruent_main_trials: 1,
                incongruent_main_trials: 1,
            });
        }).not.toThrow();
    });
});