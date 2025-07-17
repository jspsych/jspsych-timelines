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
    describe("generateStimuli", () => {
        test("generates correct number of stimuli", () => {
            const stimuli = utils.generateStimuli();
            expect(stimuli).toHaveLength(16); // 4 words × 4 colors
        });

        test("generates both congruent and incongruent stimuli", () => {
            const stimuli = utils.generateStimuli();
            const congruent = stimuli.filter(s => s.congruent);
            const incongruent = stimuli.filter(s => !s.congruent);

            expect(congruent).toHaveLength(4);
            expect(incongruent).toHaveLength(12);
        });

        test("has correct stimulus structure", () => {
            const stimuli = utils.generateStimuli();
            stimuli.forEach(stimulus => {
                expect(stimulus).toHaveProperty('word');
                expect(stimulus).toHaveProperty('color');
                expect(stimulus).toHaveProperty('correct_response');
                expect(stimulus).toHaveProperty('congruent');
                expect(typeof stimulus.correct_response).toBe('number');
                expect(typeof stimulus.congruent).toBe('boolean');
            });
        });

        test("generates correct congruent stimuli", () => {
            const stimuli = utils.generateStimuli();
            const congruent = stimuli.filter(s => s.congruent);

            congruent.forEach(stimulus => {
                expect(stimulus.word).toBe(stimulus.color.toUpperCase());
            });
        });

        test("generates correct incongruent stimuli", () => {
            const stimuli = utils.generateStimuli();
            const incongruent = stimuli.filter(s => !s.congruent);

            incongruent.forEach(stimulus => {
                expect(stimulus.word).not.toBe(stimulus.color.toUpperCase());
            });
        });
    });

    describe("shuffleArray", () => {
        test("returns array of same length", () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = utils.shuffleArray(original);
            expect(shuffled).toHaveLength(original.length);
        });

        test("contains same elements", () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = utils.shuffleArray(original);
            expect(shuffled.sort()).toEqual(original.sort());
        });

        test("does not modify original array", () => {
            const original = [1, 2, 3, 4, 5];
            const originalCopy = [...original];
            utils.shuffleArray(original);
            expect(original).toEqual(originalCopy);
        });

        test("handles empty array", () => {
            const empty = [];
            const shuffled = utils.shuffleArray(empty);
            expect(shuffled).toEqual([]);
        });

        test("handles single element array", () => {
            const single = [1];
            const shuffled = utils.shuffleArray(single);
            expect(shuffled).toEqual([1]);
        });
    });

    describe("resetState", () => {
        test("resets state without throwing errors", () => {
            expect(() => utils.resetState()).not.toThrow();
        });
    });
});

describe("stroop-task timeline components", () => {
    let jsPsych;

    beforeEach(() => {
        jsPsych = initJsPsych();
    });

    describe("createWelcome", () => {
        test("creates welcome trial with correct structure", () => {
            const welcome = timelineComponents.createWelcome();
            expect(welcome).toHaveProperty('type');
            expect(welcome).toHaveProperty('stimulus');
            expect(welcome).toHaveProperty('choices');
            expect(welcome).toHaveProperty('post_trial_gap');
        });

        test("has correct choices", () => {
            const welcome = timelineComponents.createWelcome();
            expect(welcome.choices).toEqual(['Continue']);
        });

        test("stimulus contains key instructions", () => {
            const welcome = timelineComponents.createWelcome();
            const stimulus = welcome.stimulus.toLowerCase();
            expect(stimulus).toContain('stroop');
            expect(stimulus).toContain('color');
            expect(stimulus).toContain('ink');
            expect(stimulus).toContain('welcome');
        });

        test("has proper HTML structure", () => {
            const welcome = timelineComponents.createWelcome();
            expect(welcome.stimulus).toMatch(/<div[^>]*>/);
            expect(welcome.stimulus).toMatch(/<h1[^>]*>/);
            expect(welcome.stimulus).toMatch(/<p[^>]*>/);
        });

        test("post_trial_gap is reasonable value", () => {
            const welcome = timelineComponents.createWelcome();
            expect(typeof welcome.post_trial_gap).toBe('number');
            expect(welcome.post_trial_gap).toBeGreaterThanOrEqual(0);
            expect(welcome.post_trial_gap).toBeLessThan(5000);
        });
    });

    describe("createInstructions", () => {
        test("creates instructions with multiple pages", () => {
            const instructions = timelineComponents.createInstructions();
            expect(instructions).toHaveProperty('type');
            expect(instructions).toHaveProperty('pages');
            expect(Array.isArray(instructions.pages)).toBe(true);
            expect(instructions.pages.length).toBeGreaterThan(1);
        });

        test("includes navigation buttons", () => {
            const instructions = timelineComponents.createInstructions();
            expect(instructions.show_clickable_nav).toBe(true);
            expect(instructions).toHaveProperty('button_label_previous');
            expect(instructions).toHaveProperty('button_label_next');
            expect(instructions).toHaveProperty('button_label_finish');
        });

        test("contains essential instruction content", () => {
            const instructions = timelineComponents.createInstructions();
            const allPages = instructions.pages.join(' ').toLowerCase();
            expect(allPages).toContain('ink color');
            expect(allPages).toContain('red');
            expect(allPages).toContain('green');
            expect(allPages).toContain('blue');
            expect(allPages).toContain('yellow');
        });
    });

    describe("createFixation", () => {
        test("creates fixation cross with correct properties", () => {
            const fixation = timelineComponents.createFixation();
            expect(fixation).toHaveProperty('type');
            expect(fixation).toHaveProperty('stimulus');
            expect(fixation).toHaveProperty('choices');
            expect(fixation).toHaveProperty('trial_duration');
            expect(fixation).toHaveProperty('data');
        });

        test("has correct stimulus and choices", () => {
            const fixation = timelineComponents.createFixation();
            expect(fixation.choices).toBe("NO_KEYS");
            expect(fixation.stimulus).toContain('+');
        });

        test("accepts custom duration", () => {
            const customDuration = { min: 500, max: 1500 };
            const fixation = timelineComponents.createFixation(customDuration);
            expect(typeof fixation.trial_duration).toBe('function');

            // Test duration function returns value in range
            const duration = typeof fixation.trial_duration === 'function'
                ? fixation.trial_duration()
                : fixation.trial_duration;
            expect(duration).toBeGreaterThanOrEqual(500);
            expect(duration).toBeLessThanOrEqual(1500);
        });

        test("has correct data properties", () => {
            const fixation = timelineComponents.createFixation();
            expect(fixation.data.task).toBe('fixation');
        });

        test("uses default duration when none provided", () => {
            const fixation = timelineComponents.createFixation();
            const duration = typeof fixation.trial_duration === 'function'
                ? fixation.trial_duration()
                : fixation.trial_duration;
            expect(duration).toBeGreaterThanOrEqual(300);
            expect(duration).toBeLessThanOrEqual(1000);
        });
    });

    describe("createStroopTrial", () => {
        const mockStimulus = {
            word: 'RED',
            color: 'blue',
            correct_response: 2,
            congruent: false
        };

        test("creates trial with correct structure", () => {
            const trial = timelineComponents.createStroopTrial(jsPsych, mockStimulus, false);
            expect(trial).toHaveProperty('type');
            expect(trial).toHaveProperty('stimulus');
            expect(trial).toHaveProperty('choices');
            expect(trial).toHaveProperty('data');
            expect(trial).toHaveProperty('on_finish');
        });

        test("has correct choices", () => {
            const trial = timelineComponents.createStroopTrial(jsPsych, mockStimulus, false, 3000, 2, 2, ['RED', 'GREEN', 'BLUE', 'YELLOW']);
            expect(trial.choices).toEqual(['RED', 'GREEN', 'BLUE', 'YELLOW']);
        });

        test("stimulus displays word in correct color", () => {
            const trial = timelineComponents.createStroopTrial(jsPsych, mockStimulus, false);
            expect(trial.stimulus).toContain('RED');
            expect(trial.stimulus).toContain('blue');
            expect(trial.stimulus).toMatch(/color:\s*blue/);
        });

        test("sets correct data properties", () => {
            const trial = timelineComponents.createStroopTrial(jsPsych, mockStimulus, true);
            expect(trial.data.task).toBe('practice');
            expect(trial.data.word).toBe('RED');
            expect(trial.data.color).toBe('blue');
            expect(trial.data.correct_response).toBe(2);
            expect(trial.data.congruent).toBe(false);
        });

        test("distinguishes practice from main trials", () => {
            const practiceTrial = timelineComponents.createStroopTrial(jsPsych, mockStimulus, true);
            const mainTrial = timelineComponents.createStroopTrial(jsPsych, mockStimulus, false);

            expect(practiceTrial.data.task).toBe('practice');
            expect(mainTrial.data.task).toBe('response');
        });

        test("accepts custom trial timeout", () => {
            const customTimeout = 5000;
            const trial = timelineComponents.createStroopTrial(jsPsych, mockStimulus, false, customTimeout);
            expect(trial.trial_duration).toBe(customTimeout);
        });

        test("uses default timeout when none provided", () => {
            const trial = timelineComponents.createStroopTrial(jsPsych, mockStimulus, false);
            expect(trial.trial_duration).toBe(3000); // DEFAULT_TRIAL_TIMEOUT
        });

        test("on_finish function sets correct property", () => {
            const trial = timelineComponents.createStroopTrial(jsPsych, mockStimulus, false);
            const mockData: { response: number; correct_response: number; correct?: boolean } = { response: 2, correct_response: 2 };
            trial.on_finish(mockData);
            expect(mockData.correct).toBe(true);

            const incorrectData: { response: number; correct_response: number; correct?: boolean } = { response: 1, correct_response: 2 };
            trial.on_finish(incorrectData);
            expect(incorrectData.correct).toBe(false);
        });
    });

    describe("createPracticeFeedback", () => {
        test("creates feedback trial", () => {
            const feedback = timelineComponents.createPracticeFeedback(jsPsych);
            expect(feedback).toHaveProperty('type');
            expect(feedback).toHaveProperty('stimulus');
            expect(feedback).toHaveProperty('choices');
            expect(feedback).toHaveProperty('trial_duration');
        });

        test("has correct choices and duration", () => {
            const feedback = timelineComponents.createPracticeFeedback(jsPsych);
            expect(feedback.choices).toEqual(['Continue']);
            expect(feedback.trial_duration).toBe(2000);
        });

        test("has dynamic stimulus function", () => {
            const feedback = timelineComponents.createPracticeFeedback(jsPsych);
            expect(typeof feedback.stimulus).toBe('function');
        });
    });

    describe("createPracticeDebrief", () => {
        test("creates debrief with correct properties", () => {
            const debrief = timelineComponents.createPracticeDebrief();
            expect(debrief).toHaveProperty('type');
            expect(debrief).toHaveProperty('stimulus');
            expect(debrief).toHaveProperty('choices');
            expect(debrief).toHaveProperty('post_trial_gap');
            expect(debrief).toHaveProperty('on_finish');
        });

        test("has correct choices", () => {
            const debrief = timelineComponents.createPracticeDebrief();
            expect(debrief.choices).toEqual(['Start Experiment']);
        });

        test("stimulus contains key messages", () => {
            const debrief = timelineComponents.createPracticeDebrief();
            const stimulus = debrief.stimulus.toLowerCase();
            expect(stimulus).toContain('practice');
            expect(stimulus).toContain('complete');
            expect(stimulus).toContain('ink color');
        });
    });

    describe("createResults", () => {
        test("creates results trial", () => {
            const results = timelineComponents.createResults(jsPsych);
            expect(results).toHaveProperty('type');
            expect(results).toHaveProperty('stimulus');
            expect(results).toHaveProperty('choices');
            expect(results).toHaveProperty('on_finish');
        });

        test("has correct choices", () => {
            const results = timelineComponents.createResults(jsPsych);
            expect(results.choices).toEqual(['Download Data']);
        });

        test("has dynamic stimulus and on_finish functions", () => {
            const results = timelineComponents.createResults(jsPsych);
            expect(typeof results.stimulus).toBe('function');
            expect(typeof results.on_finish).toBe('function');
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
        expect(Array.isArray(timeline)).toBe(true);
        expect(timeline.length).toBeGreaterThan(0);
    });

    test("respects custom parameters", () => {
        const customParams = {
            practice_trials_per_condition: 2,
            congruent_main_trials: 4,
            incongruent_main_trials: 4,
            show_instructions: false,
            show_results: false
        };

        const timeline = createTimeline(jsPsych, customParams);
        expect(Array.isArray(timeline)).toBe(true);

        // Should have fewer trials without instructions and results
        const timelineWithDefaults = createTimeline(jsPsych);
        expect(timeline.length).toBeLessThan(timelineWithDefaults.length);
    });

    test("includes welcome component", () => {
        const timeline = createTimeline(jsPsych);
        const hasWelcome = timeline.some(trial =>
            trial.stimulus && typeof trial.stimulus === 'string' &&
            trial.stimulus.toLowerCase().includes('welcome')
        );
        expect(hasWelcome).toBe(true);
    });

    test("includes instructions when enabled", () => {
        const timelineWithInstructions = createTimeline(jsPsych, { show_instructions: true });
        const hasInstructions = timelineWithInstructions.some(trial =>
            trial.pages && Array.isArray(trial.pages)
        );
        expect(hasInstructions).toBe(true);
    });

    test("excludes instructions when disabled", () => {
        const timelineWithoutInstructions = createTimeline(jsPsych, { show_instructions: false });
        const hasInstructions = timelineWithoutInstructions.some(trial =>
            trial.pages && Array.isArray(trial.pages)
        );
        expect(hasInstructions).toBe(false);
    });

    test("includes results when enabled", () => {
        const timelineWithResults = createTimeline(jsPsych, { show_results: true });
        const hasResults = timelineWithResults.some(trial =>
            trial.choices && trial.choices.includes('Download Data')
        );
        expect(hasResults).toBe(true);
    });

    test("excludes results when disabled", () => {
        const timelineWithoutResults = createTimeline(jsPsych, { show_results: false });
        const hasResults = timelineWithoutResults.some(trial =>
            trial.choices && trial.choices.includes('Download Data')
        );
        expect(hasResults).toBe(false);
    });

    test("works with minimal configuration", () => {
        const timeline = createTimeline(jsPsych, {
            practice_trials_per_condition: 1,
            congruent_main_trials: 1,
            incongruent_main_trials: 1,
            show_instructions: false,
            show_results: false
        });

        expect(Array.isArray(timeline)).toBe(true);
        expect(timeline.length).toBeGreaterThan(0);
    });

    test("creates practice trials", () => {
        const timeline = createTimeline(jsPsych, { practice_trials_per_condition: 2 });
        const practiceTrials = timeline.filter(trial =>
            trial.data && trial.data.task === 'practice'
        );
        expect(practiceTrials.length).toBeGreaterThan(0);
    });

    test("creates main response trials", () => {
        const timeline = createTimeline(jsPsych, {
            congruent_main_trials: 2,
            incongruent_main_trials: 2
        });
        const responseTrials = timeline.filter(trial =>
            trial.data && trial.data.task === 'response'
        );
        expect(responseTrials.length).toBeGreaterThan(0);
    });

    test("includes fixation trials when enabled", () => {
        const timeline = createTimeline(jsPsych, { include_fixation: true });
        const fixationTrials = timeline.filter(trial =>
            trial.data && trial.data.task === 'fixation'
        );
        expect(fixationTrials.length).toBeGreaterThan(0);
    });

    test("excludes fixation trials when disabled", () => {
        const timeline = createTimeline(jsPsych, { include_fixation: false });
        const fixationTrials = timeline.filter(trial =>
            trial.data && trial.data.task === 'fixation'
        );
        expect(fixationTrials.length).toBe(0);
    });

    test("handles edge case parameters", () => {
        expect(() => {
            createTimeline(jsPsych, {
                practice_trials_per_condition: 0,
                congruent_main_trials: 0,
                incongruent_main_trials: 0,
            });
        }).not.toThrow();
    });
});