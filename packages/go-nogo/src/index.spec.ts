import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, utils } from ".";
import { englishText } from "./text";

describe("createTimeline", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
    // Mock Math.random to make tests deterministic
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("basic functionality", () => {
    it("should return a timeline with default configuration (no debrief)", () => {
      const timeline = createTimeline(jsPsych);
      
      expect(timeline).toBeDefined();
      // Should have: block1 + block2-instruction + block2 + block3-instruction + block3 = 5 items (no debrief by default)
      expect(timeline.timeline).toHaveLength(5);
      expect(timeline.timeline[0]).toHaveProperty('timeline'); // block 1
      expect(timeline.timeline[1]).toHaveProperty('stimulus'); // block 2 instruction
      expect(timeline.timeline[2]).toHaveProperty('timeline'); // block 2
      expect(timeline.timeline[3]).toHaveProperty('stimulus'); // block 3 instruction
      expect(timeline.timeline[4]).toHaveProperty('timeline'); // block 3
    });

    it("should create timeline with custom configuration", () => {
      const config = {
        goStimulus: 'A',
        noGoStimulus: 'C',
        buttonText: 'Press',
        responseTimeout: 2000,
        interTrialInterval: 800,
        numBlocks: 2,
        trialsPerBlock: 25,
        goTrialProbability: 0.8
      };

      const timeline = createTimeline(jsPsych, config);
      
      expect(timeline).toBeDefined();
      // Should have: block1 + block2-instruction + block2 = 3 items (no debrief by default)
      expect(timeline.timeline).toHaveLength(3);
      
      // Check first block has correct number of trials
      const firstBlock = timeline.timeline[0] as any;
      expect(firstBlock.timeline_variables).toHaveLength(25);
    });
  });

  describe("showDebrief parameter", () => {
    it("should not include debrief trial when showDebrief is false (default)", () => {
      const timeline = createTimeline(jsPsych, { showDebrief: false });
      
      expect(timeline).toBeDefined();
      // Should have: block1 + block2-instruction + block2 + block3-instruction + block3 = 5 items
      expect(timeline.timeline).toHaveLength(5);
      
      // None of the timeline items should be a debrief trial
      const hasDebriefTrial = timeline.timeline.some((item: any) => 
        item.data && item.data.trial_type === englishText.trialTypes.debrief
      );
      expect(hasDebriefTrial).toBe(false);
    });

    it("should include debrief trial when showDebrief is true", () => {
      const timeline = createTimeline(jsPsych, { showDebrief: true });
      
      expect(timeline).toBeDefined();
      // Should have: block1 + block2-instruction + block2 + block3-instruction + block3 + debrief = 6 items
      expect(timeline.timeline).toHaveLength(6);
      
      // Last item should be the debrief trial
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      expect(debriefTrial.choices).toEqual([englishText.finishButton]);
      expect(debriefTrial.data.trial_type).toBe(englishText.trialTypes.debrief);
      expect(typeof debriefTrial.stimulus).toBe('function');
    });

    it("should not include debrief trial by default when showDebrief not specified", () => {
      const timeline = createTimeline(jsPsych);
      
      expect(timeline).toBeDefined();
      // Should have: block1 + block2-instruction + block2 + block3-instruction + block3 = 5 items
      expect(timeline.timeline).toHaveLength(5);
      
      // None of the timeline items should be a debrief trial
      const hasDebriefTrial = timeline.timeline.some((item: any) => 
        item.data && item.data.trial_type === englishText.trialTypes.debrief
      );
      expect(hasDebriefTrial).toBe(false);
    });

    it("should work with different numBlocks when showDebrief is false", () => {
      const timeline = createTimeline(jsPsych, { numBlocks: 1, showDebrief: false });
      
      expect(timeline).toBeDefined();
      // Should have: block1 only = 1 item
      expect(timeline.timeline).toHaveLength(1);
      
      // Should be a block, not debrief
      const firstItem = timeline.timeline[0] as any;
      expect(firstItem).toHaveProperty('timeline'); // Should be a block
      expect(firstItem).toHaveProperty('timeline_variables');
    });

    it("should work with different numBlocks when showDebrief is true", () => {
      const timeline = createTimeline(jsPsych, { numBlocks: 1, showDebrief: true });
      
      expect(timeline).toBeDefined();
      // Should have: block1 + debrief = 2 items
      expect(timeline.timeline).toHaveLength(2);
      
      // First should be block, second should be debrief
      const firstItem = timeline.timeline[0] as any;
      const secondItem = timeline.timeline[1] as any;
      
      expect(firstItem).toHaveProperty('timeline'); // Should be a block
      expect(firstItem).toHaveProperty('timeline_variables');
      
      expect(secondItem.choices).toEqual([englishText.finishButton]);
      expect(secondItem.data.trial_type).toBe(englishText.trialTypes.debrief);
    });
  });

  describe("parameter combinations", () => {
    it("should handle custom stimuli", () => {
      // Mock Math.random to ensure we get both go and no-go trials
      const mockValues = [0.3, 0.7, 0.2, 0.8, 0.1, 0.9, 0.4, 0.6, 0.25, 0.75];
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);

      const config = {
        goStimulus: 'CUSTOM_GO',
        noGoStimulus: 'CUSTOM_NOGO',
        numBlocks: 1,
        trialsPerBlock: 10,
        goTrialProbability: 0.5
      };

      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      
      // Check that custom stimuli are used
      const stimuli = firstBlock.timeline_variables.map((trial: any) => 
        trial.stimulus.match(/>(.*?)</)[1]
      );
      
      expect(stimuli).toEqual(expect.arrayContaining(['CUSTOM_GO', 'CUSTOM_NOGO']));
      
      // Restore Math.random
      (Math.random as jest.Mock).mockRestore();
    });

    it("should handle default stimuli", () => {
      // Mock Math.random to ensure we get both go and no-go trials
      const mockValues = [0.3, 0.7, 0.2, 0.8, 0.1, 0.9, 0.4, 0.6, 0.25, 0.75];
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);

      const config = {
        numBlocks: 1,
        trialsPerBlock: 10,
        goTrialProbability: 0.5
      };

      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      
      // Check that default stimuli are used
      const stimuli = firstBlock.timeline_variables.map((trial: any) => 
        trial.stimulus.match(/>(.*?)</)[1]
      );
      
      expect(stimuli).toEqual(expect.arrayContaining(['Y', 'X']));
      
      // Restore Math.random
      (Math.random as jest.Mock).mockRestore();
    });

    it("should handle different goTrialProbability values", () => {
      // Mock Math.random to return sequential values
      const mockValues = [0.1, 0.9, 0.3, 0.7, 0.5];
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);

      const config = {
        goTrialProbability: 0.6,
        numBlocks: 1,
        trialsPerBlock: 5
      };

      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      
      const goTrials = firstBlock.timeline_variables.filter((trial: any) => 
        trial.trial_type === 'go'
      );
      const noGoTrials = firstBlock.timeline_variables.filter((trial: any) => 
        trial.trial_type === 'no-go'
      );

      expect(goTrials.length).toBe(3); // Values 0.1, 0.3, 0.5 are < 0.6
      expect(noGoTrials.length).toBe(2); // Values 0.9, 0.7 are >= 0.6
    });

    it("should handle different trialsPerBlock values", () => {
      const testCases = [1, 5, 10, 50, 100];
      
      testCases.forEach(trialsPerBlock => {
        const config = { numBlocks: 1, trialsPerBlock };
        const timeline = createTimeline(jsPsych, config);
        const firstBlock = timeline.timeline[0] as any;
        
        expect(firstBlock.timeline_variables).toHaveLength(trialsPerBlock);
      });
    });

    it("should handle different responseTimeout values", () => {
      const config = { responseTimeout: 3000 };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[0] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      expect(goNoGoTrial.trial_duration).toBe(3000);
    });

    it("should handle different interTrialInterval values", () => {
      const config = { interTrialInterval: 1000 };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[0] as any;
      const interTrialTrial = trialProcedure.timeline[1];
      
      expect(interTrialTrial.trial_duration).toBe(1000);
    });

    it("should handle different buttonText values", () => {
      const config = { buttonText: 'Respond' };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[0] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      expect(goNoGoTrial.choices).toEqual(['Respond']);
    });
  });

  describe("trial generation", () => {
    it("should generate correct trial structure", () => {
      const config = { trialsPerBlock: 10 };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[0] as any;
      
      trialProcedure.timeline_variables.forEach((trial: any) => {
        expect(trial).toHaveProperty('stimulus');
        expect(trial).toHaveProperty('trial_type');
        expect(trial).toHaveProperty('correct_response');
        expect(['go', 'no-go']).toContain(trial.trial_type);
        
        if (trial.trial_type === 'go') {
          expect(trial.correct_response).toBe(0);
          expect(trial.stimulus).toContain('black');
        } else {
          expect(trial.correct_response).toBe(null);
          expect(trial.stimulus).toContain('black');
        }
      });
    });

    it("should randomize trial order", () => {
      const timeline = createTimeline(jsPsych);
      const trialProcedure = timeline.timeline[0] as any;
      
      expect(trialProcedure.randomize_order).toBe(true);
    });
  });

  describe("stimulus formatting", () => {
    it("should format go stimuli correctly", () => {
      const config = { 
        goStimulus: 'TEST',
        goTrialProbability: 1.0,
        numBlocks: 1,
        trialsPerBlock: 1
      };
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      const trial = firstBlock.timeline_variables[0];
      
      expect(trial.stimulus).toContain('TEST');
      expect(trial.stimulus).toContain('color: black');
      expect(trial.stimulus).toContain('class="go-nogo-stimulus-content timeline-trial"');
    });

    it("should format no-go stimuli correctly", () => {
      const config = { 
        noGoStimulus: 'STOP',
        goTrialProbability: 0.0,
        numBlocks: 1,
        trialsPerBlock: 1
      };
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      const trial = firstBlock.timeline_variables[0];
      
      expect(trial.stimulus).toContain('STOP');
      expect(trial.stimulus).toContain('color: black');
      expect(trial.stimulus).toContain('class="go-nogo-stimulus-content timeline-trial"');
    });
  });

  describe("HTML stimulus formatting", () => {
    it("should handle plain text stimuli", () => {
      const config = { 
        goStimulus: 'TEXT_GO',
        numBlocks: 1,
        trialsPerBlock: 1,
        goTrialProbability: 1.0
      };
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      const trial = firstBlock.timeline_variables[0];
      
      expect(trial.stimulus).toContain('class="go-nogo-stimulus-content timeline-trial"');
      expect(trial.stimulus).toContain('TEXT_GO');
      expect(trial.stimulus).toContain('color: black');
    });

    it("should handle HTML image stimuli", () => {
      const config = { 
        goStimulus: '<img src="path/to/image.png" alt="GO">',
        numBlocks: 1,
        trialsPerBlock: 1,
        goTrialProbability: 1.0
      };
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      const trial = firstBlock.timeline_variables[0];
      
      expect(trial.stimulus).toContain('class="go-nogo-stimulus-content timeline-trial"');
      expect(trial.stimulus).toContain('<img src="path/to/image.png" alt="GO">');
      expect(trial.stimulus).not.toContain('border: 3px solid');
      expect(trial.stimulus).toContain('color: black');
    });

    it("should handle complex HTML stimuli", () => {
      const config = { 
        goStimulus: '<div><span>Custom</span><br><strong>GO</strong></div>',
        noGoStimulus: '<div style="color: red;">STOP</div>',
        numBlocks: 1,
        trialsPerBlock: 2,
        goTrialProbability: 0.5
      };
      
      // Mock to get both go and no-go trials
      const mockValues = [0.3, 0.7];
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      const trials = firstBlock.timeline_variables;
      
      // Find go and no-go trials
      const goTrial = trials.find((t: any) => t.stimulus.includes('Custom'));
      const noGoTrial = trials.find((t: any) => t.stimulus.includes('STOP'));
      
      expect(goTrial.stimulus).toContain('class="go-nogo-stimulus-content timeline-trial"');
      expect(goTrial.stimulus).toContain('<div><span>Custom</span><br><strong>GO</strong></div>');
      expect(goTrial.stimulus).toContain('color: black');
      
      expect(noGoTrial.stimulus).toContain('class="go-nogo-stimulus-content timeline-trial"');
      expect(noGoTrial.stimulus).toContain('<div style="color: red;">STOP</div>');
      expect(noGoTrial.stimulus).toContain('color: black');
      
      // Restore Math.random
      (Math.random as jest.Mock).mockRestore();
    });

    it("should apply correct colors for no-go stimuli", () => {
      const config = { 
        noGoStimulus: 'STOP',
        numBlocks: 1,
        trialsPerBlock: 1,
        goTrialProbability: 0.0
      };
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      const trial = firstBlock.timeline_variables[0];
      
      expect(trial.stimulus).not.toContain('border: 3px solid');
      expect(trial.stimulus).toContain('color: black');
      expect(trial.stimulus).toContain('STOP');
    });
  });

  describe("colorBorders parameter", () => {
    it("should apply colored borders when colorBorders: true", () => {
      const config = { 
        goStimulus: 'GO',
        noGoStimulus: 'STOP',
        numBlocks: 1,
        trialsPerBlock: 2,
        goTrialProbability: 0.5,
        colorBorders: true
      };
      
      // Mock Math.random to get predictable stimulus selection
      const mockValues = [0.3, 0.7]; // First call: go trial, second call: no-go trial
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      const trials = firstBlock.timeline_variables;
      
      // Find go and no-go trials
      const goTrial = trials.find((t: any) => t.stimulus.includes('GO'));
      const noGoTrial = trials.find((t: any) => t.stimulus.includes('STOP'));
      
      expect(goTrial.stimulus).toContain('border: 3px solid green');
      expect(goTrial.stimulus).toContain('color: green');
      expect(noGoTrial.stimulus).toContain('border: 3px solid red');
      expect(noGoTrial.stimulus).toContain('color: red');
      
      // Restore Math.random
      (Math.random as jest.Mock).mockRestore();
    });

    it("should not apply colored borders when colorBorders: false", () => {
      const config = { 
        goStimulus: 'GO',
        noGoStimulus: 'STOP',
        numBlocks: 1,
        trialsPerBlock: 2,
        goTrialProbability: 0.5,
        colorBorders: false
      };
      
      // Mock Math.random to get predictable stimulus selection
      const mockValues = [0.3, 0.7]; // First call: go trial, second call: no-go trial
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      const trials = firstBlock.timeline_variables;
      
      // Find go and no-go trials
      const goTrial = trials.find((t: any) => t.stimulus.includes('GO'));
      const noGoTrial = trials.find((t: any) => t.stimulus.includes('STOP'));
      
      expect(goTrial.stimulus).not.toContain('border: 3px solid green');
      expect(goTrial.stimulus).not.toContain('border: 3px solid');
      expect(goTrial.stimulus).toContain('color: black');
      expect(noGoTrial.stimulus).not.toContain('border: 3px solid red');
      expect(noGoTrial.stimulus).not.toContain('border: 3px solid');
      expect(noGoTrial.stimulus).toContain('color: black');
      
      // Restore Math.random
      (Math.random as jest.Mock).mockRestore();
    });

    it("should apply colored text when colorBorders: true", () => {
      const config = { 
        goStimulus: 'GO',
        noGoStimulus: 'STOP',
        numBlocks: 1,
        trialsPerBlock: 2,
        goTrialProbability: 0.5,
        colorBorders: true
      };
      
      // Mock Math.random to get predictable stimulus selection
      const mockValues = [0.3, 0.7]; // First call: go trial, second call: no-go trial
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      const trials = firstBlock.timeline_variables;
      
      // Find go and no-go trials
      const goTrial = trials.find((t: any) => t.stimulus.includes('GO'));
      const noGoTrial = trials.find((t: any) => t.stimulus.includes('STOP'));
      
      expect(goTrial.stimulus).toContain('color: green;');
      expect(noGoTrial.stimulus).toContain('color: red;');
      
      // Restore Math.random
      (Math.random as jest.Mock).mockRestore();
    });

    it("should use black text when colorBorders: false", () => {
      const config = { 
        goStimulus: 'GO',
        noGoStimulus: 'STOP',
        numBlocks: 1,
        trialsPerBlock: 2,
        goTrialProbability: 0.5,
        colorBorders: false
      };
      
      // Mock Math.random to get predictable stimulus selection
      const mockValues = [0.3, 0.7]; // First call: go trial, second call: no-go trial
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      const trials = firstBlock.timeline_variables;
      
      // Find go and no-go trials
      const goTrial = trials.find((t: any) => t.stimulus.includes('GO'));
      const noGoTrial = trials.find((t: any) => t.stimulus.includes('STOP'));
      
      expect(goTrial.stimulus).toContain('color: black;');
      expect(goTrial.stimulus).not.toContain('color: green;');
      expect(noGoTrial.stimulus).toContain('color: black;');
      expect(noGoTrial.stimulus).not.toContain('color: red;');
      
      // Restore Math.random
      (Math.random as jest.Mock).mockRestore();
    });

    it("should default to false when colorBorders parameter is not specified", () => {
      const config = { 
        goStimulus: 'GO',
        numBlocks: 1,
        trialsPerBlock: 1,
        goTrialProbability: 1.0
        // colorBorders not specified - should default to false
      };
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      const trial = firstBlock.timeline_variables[0];
      
      // Should have black text since colorBorders defaults to false
      expect(trial.stimulus).not.toContain('border: 3px solid');
      expect(trial.stimulus).toContain('color: black');
    });
  });

  describe("timeline structure", () => {
    it("should not include instruction trials in main timeline", () => {
      const timeline = createTimeline(jsPsych);
      
      // Timeline should start with the first block, not instructions
      const firstItem = timeline.timeline[0] as any;
      expect(firstItem).toHaveProperty('timeline'); // Should be a block
      expect(firstItem).toHaveProperty('timeline_variables');
      
      // No instruction trials should be present
      const hasInstructionTrials = timeline.timeline.some((item: any) => 
        item.data && item.data.trial_type === englishText.trialTypes.instructions
      );
      expect(hasInstructionTrials).toBe(false);
    });

    it("should have correct debrief trial when showDebrief is true", () => {
      const timeline = createTimeline(jsPsych, { showDebrief: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      
      expect(debriefTrial.choices).toEqual([englishText.finishButton]);
      expect(debriefTrial.data.trial_type).toBe(englishText.trialTypes.debrief);
      expect(typeof debriefTrial.stimulus).toBe('function');
    });

    it("should have correct trial procedure structure", () => {
      const timeline = createTimeline(jsPsych);
      const trialProcedure = timeline.timeline[0] as any;
      
      expect(trialProcedure.timeline).toHaveLength(2);
      expect(trialProcedure).toHaveProperty('timeline_variables');
      expect(trialProcedure.randomize_order).toBe(true);
      
      // Check go-no-go trial structure
      const goNoGoTrial = trialProcedure.timeline[0];
      expect(goNoGoTrial.response_ends_trial).toBe(true);
      expect(goNoGoTrial.data.trial_type).toBe(englishText.trialTypes.goNoGo);
      expect(typeof goNoGoTrial.on_finish).toBe('function');
      
      // Check inter-trial interval structure
      const interTrialTrial = trialProcedure.timeline[1];
      expect(interTrialTrial.stimulus).toBe('');
      expect(interTrialTrial.choices).toEqual([]);
      expect(interTrialTrial.response_ends_trial).toBe(false);
    });
  });

  describe("data handling", () => {
    it("should set correct data properties for go trials", () => {
      const mockData = {
        stimulus_type: 'go',
        response: 0,
        rt: 500,
        correct: undefined as any,
        accuracy: undefined as any,
        reaction_time: undefined as any
      };
      
      const timeline = createTimeline(jsPsych);
      const trialProcedure = timeline.timeline[0] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      goNoGoTrial.on_finish(mockData);
      
      expect(mockData.correct).toBe(true);
      expect(mockData.accuracy).toBe(1);
      expect(mockData.reaction_time).toBe(500);
    });

    it("should set correct data properties for no-go trials", () => {
      const mockData = {
        stimulus_type: 'no-go',
        response: null,
        rt: null,
        correct: undefined as any,
        accuracy: undefined as any,
        reaction_time: undefined as any
      };
      
      const timeline = createTimeline(jsPsych);
      const trialProcedure = timeline.timeline[0] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      goNoGoTrial.on_finish(mockData);
      
      expect(mockData.correct).toBe(true);
      expect(mockData.accuracy).toBe(1);
      expect(mockData.reaction_time).toBeNull();
    });

    it("should handle incorrect go trial responses", () => {
      const mockData = {
        stimulus_type: 'go',
        response: null,
        rt: null,
        correct: undefined as any,
        accuracy: undefined as any,
        reaction_time: undefined as any
      };
      
      const timeline = createTimeline(jsPsych);
      const trialProcedure = timeline.timeline[0] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      goNoGoTrial.on_finish(mockData);
      
      expect(mockData.correct).toBe(false);
      expect(mockData.accuracy).toBe(0);
    });

    it("should handle incorrect no-go trial responses", () => {
      const mockData = {
        stimulus_type: 'no-go',
        response: 0,
        rt: 300,
        correct: undefined as any,
        accuracy: undefined as any,
        reaction_time: undefined as any
      };
      
      const timeline = createTimeline(jsPsych);
      const trialProcedure = timeline.timeline[0] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      goNoGoTrial.on_finish(mockData);
      
      expect(mockData.correct).toBe(false);
      expect(mockData.accuracy).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle zero trials", () => {
      const config = { numBlocks: 1, trialsPerBlock: 0 };
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      
      expect(firstBlock.timeline_variables).toHaveLength(0);
    });

    it("should handle extreme goTrialProbability values", () => {
      const config1 = { goTrialProbability: 0.0, numBlocks: 1, trialsPerBlock: 5 };
      const timeline1 = createTimeline(jsPsych, config1);
      const firstBlock1 = timeline1.timeline[0] as any;
      
      const allNoGo = firstBlock1.timeline_variables.every((trial: any) => 
        trial.trial_type === 'no-go'
      );
      expect(allNoGo).toBe(true);
      
      const config2 = { goTrialProbability: 1.0, numBlocks: 1, trialsPerBlock: 5 };
      const timeline2 = createTimeline(jsPsych, config2);
      const firstBlock2 = timeline2.timeline[0] as any;
      
      const allGo = firstBlock2.timeline_variables.every((trial: any) => 
        trial.trial_type === 'go'
      );
      expect(allGo).toBe(true);
    });

    it("should handle single stimulus values", () => {
      const config = {
        goStimulus: 'GO_SINGLE',
        noGoStimulus: 'NOGO_SINGLE',
        numBlocks: 1,
        trialsPerBlock: 10
      };
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[0] as any;
      
      const goTrials = firstBlock.timeline_variables.filter((trial: any) => 
        trial.trial_type === 'go'
      );
      const noGoTrials = firstBlock.timeline_variables.filter((trial: any) => 
        trial.trial_type === 'no-go'
      );
      
      goTrials.forEach((trial: any) => {
        expect(trial.stimulus).toContain('GO_SINGLE');
      });
      
      noGoTrials.forEach((trial: any) => {
        expect(trial.stimulus).toContain('NOGO_SINGLE');
      });
    });
  });

  describe("debrief trial results calculation", () => {
    it("should calculate accuracy correctly with mixed trial results", () => {
      // Mock jsPsych data
      const mockTrialData = [
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 400 },
        { stimulus_type: 'go', accuracy: 0, response: null, rt: null },
        { stimulus_type: 'no-go', accuracy: 1, response: null, rt: null },
        { stimulus_type: 'no-go', accuracy: 0, response: 0, rt: 300 },
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 500 }
      ];

      const mockJsPsych = {
        data: {
          get: () => ({
            values: () => mockTrialData
          })
        },
        timelineVariable: (name: string) => `timeline_variable_${name}`
      };

      const timeline = createTimeline(mockJsPsych as any, { showDebrief: true, showResultsDetails: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<strong>Overall Accuracy:</strong> 60%'); // 3 correct out of 5 trials
      expect(stimulus).toContain('<strong>Average Response Time (GO trials):</strong> 450ms'); // (400 + 500) / 2
    });

    it("should handle all correct trials", () => {
      const mockTrialData = [
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 400 },
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 600 },
        { stimulus_type: 'no-go', accuracy: 1, response: null, rt: null },
        { stimulus_type: 'no-go', accuracy: 1, response: null, rt: null }
      ];

      const mockJsPsych = {
        data: {
          get: () => ({
            values: () => mockTrialData
          })
        },
        timelineVariable: (name: string) => `timeline_variable_${name}`
      };

      const timeline = createTimeline(mockJsPsych as any, { showDebrief: true, showResultsDetails: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<strong>Overall Accuracy:</strong> 100%');
      expect(stimulus).toContain('<strong>Average Response Time (GO trials):</strong> 500ms');
    });

    it("should handle all incorrect trials", () => {
      const mockTrialData = [
        { stimulus_type: 'go', accuracy: 0, response: null, rt: null },
        { stimulus_type: 'go', accuracy: 0, response: null, rt: null },
        { stimulus_type: 'no-go', accuracy: 0, response: 0, rt: 300 },
        { stimulus_type: 'no-go', accuracy: 0, response: 0, rt: 400 }
      ];

      const mockJsPsych = {
        data: {
          get: () => ({
            values: () => mockTrialData
          })
        },
        timelineVariable: (name: string) => `timeline_variable_${name}`
      };

      const timeline = createTimeline(mockJsPsych as any, { showDebrief: true, showResultsDetails: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<strong>Overall Accuracy:</strong> 0%');
      expect(stimulus).toContain('<strong>Average Response Time (GO trials):</strong> 0ms'); // No valid GO responses
    });

    it("should handle no go-no-go trials", () => {
      const mockTrialData = [
        { trial_type: 'instructions', response: 0 },
        { trial_type: 'html-button-response', response: 0 }
      ];

      const mockJsPsych = {
        data: {
          get: () => ({
            values: () => mockTrialData
          })
        },
        timelineVariable: (name: string) => `timeline_variable_${name}`
      };

      const timeline = createTimeline(mockJsPsych as any, { showDebrief: true, showResultsDetails: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<strong>Overall Accuracy:</strong> 0%');
      expect(stimulus).toContain('<strong>Average Response Time (GO trials):</strong> 0ms');
    });

    it("should handle only no-go trials", () => {
      const mockTrialData = [
        { stimulus_type: 'no-go', accuracy: 1, response: null, rt: null },
        { stimulus_type: 'no-go', accuracy: 0, response: 0, rt: 300 },
        { stimulus_type: 'no-go', accuracy: 1, response: null, rt: null }
      ];

      const mockJsPsych = {
        data: {
          get: () => ({
            values: () => mockTrialData
          })
        },
        timelineVariable: (name: string) => `timeline_variable_${name}`
      };

      const timeline = createTimeline(mockJsPsych as any, { showDebrief: true, showResultsDetails: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<strong>Overall Accuracy:</strong> 67%'); // 2 correct out of 3
      expect(stimulus).toContain('<strong>Average Response Time (GO trials):</strong> 0ms'); // No GO trials
    });

    it("should handle only go trials", () => {
      const mockTrialData = [
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 400 },
        { stimulus_type: 'go', accuracy: 0, response: null, rt: null },
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 600 }
      ];

      const mockJsPsych = {
        data: {
          get: () => ({
            values: () => mockTrialData
          })
        },
        timelineVariable: (name: string) => `timeline_variable_${name}`
      };

      const timeline = createTimeline(mockJsPsych as any, { showDebrief: true, showResultsDetails: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<strong>Overall Accuracy:</strong> 67%'); // 2 correct out of 3
      expect(stimulus).toContain('<strong>Average Response Time (GO trials):</strong> 500ms'); // (400 + 600) / 2
    });

    it("should filter out invalid response times", () => {
      const mockTrialData = [
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 400 },
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: null },
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 0 },
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 600 },
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: undefined }
      ];

      const mockJsPsych = {
        data: {
          get: () => ({
            values: () => mockTrialData
          })
        },
        timelineVariable: (name: string) => `timeline_variable_${name}`
      };

      const timeline = createTimeline(mockJsPsych as any, { showDebrief: true, showResultsDetails: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<strong>Overall Accuracy:</strong> 100%');
      expect(stimulus).toContain('<strong>Average Response Time (GO trials):</strong> 500ms'); // (400 + 600) / 2, excluding null, 0, undefined
    });

    it("should handle edge case with undefined accuracy values", () => {
      const mockTrialData = [
        { stimulus_type: 'go', accuracy: undefined, response: 0, rt: 400 },
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 500 },
        { stimulus_type: 'no-go', accuracy: null, response: null, rt: null },
        { stimulus_type: 'no-go', accuracy: 0, response: 0, rt: 300 }
      ];

      const mockJsPsych = {
        data: {
          get: () => ({
            values: () => mockTrialData
          })
        },
        timelineVariable: (name: string) => `timeline_variable_${name}`
      };

      const timeline = createTimeline(mockJsPsych as any, { showDebrief: true, showResultsDetails: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<strong>Overall Accuracy:</strong> 50%'); // 1 correct out of 2 valid accuracy values
      expect(stimulus).toContain('<strong>Average Response Time (GO trials):</strong> 450ms'); // Both GO trials have valid responses: (400 + 500) / 2
    });

    it("should show simple completion message when showResultsDetails is false", () => {
      const mockTrialData = [
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 400 },
        { stimulus_type: 'no-go', accuracy: 1, response: null, rt: null }
      ];

      const mockJsPsych = {
        data: {
          get: () => ({
            values: () => mockTrialData
          })
        },
        timelineVariable: (name: string) => `timeline_variable_${name}`
      };

      const timeline = createTimeline(mockJsPsych as any, { showDebrief: true, showResultsDetails: false });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<h2>Task Complete!</h2>');
      expect(stimulus).toContain('Thank you for completing the Go/No-Go task!');
      expect(stimulus).not.toContain('Overall Accuracy');
      expect(stimulus).not.toContain('Average Response Time');
    });

    it("should show detailed results when showResultsDetails is true (default)", () => {
      const mockTrialData = [
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 400 }
      ];

      const mockJsPsych = {
        data: {
          get: () => ({
            values: () => mockTrialData
          })
        },
        timelineVariable: (name: string) => `timeline_variable_${name}`
      };

      const timeline = createTimeline(mockJsPsych as any, { showResultsDetails: true, showDebrief: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<h2>Task Complete!</h2>');
      expect(stimulus).toContain('Thank you for completing the Go/No-Go task!');
      expect(stimulus).toContain('<strong>Overall Accuracy:</strong>');
      expect(stimulus).toContain('<strong>Average Response Time (GO trials):</strong>');
    });

    it("should show simple results by default when showResultsDetails is not specified", () => {
      const mockTrialData = [
        { stimulus_type: 'go', accuracy: 1, response: 0, rt: 400 }
      ];

      const mockJsPsych = {
        data: {
          get: () => ({
            values: () => mockTrialData
          })
        },
        timelineVariable: (name: string) => `timeline_variable_${name}`
      };

      const timeline = createTimeline(mockJsPsych as any, { showDebrief: true }); // showResultsDetails not specified, should default to false
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<h2>Task Complete!</h2>');
      expect(stimulus).toContain('Thank you for completing the Go/No-Go task!');
      expect(stimulus).not.toContain('<strong>Overall Accuracy:</strong>');
      expect(stimulus).not.toContain('<strong>Average Response Time (GO trials):</strong>');
    });
  });

  describe("utils", () => {
    it("should calculate accuracy correctly", () => {
      const mockData = {
        filter: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        mean: jest.fn().mockReturnValue(0.85)
      };
      
      const accuracy = utils.calculateAccuracy(mockData);
      
      expect(mockData.filter).toHaveBeenCalledWith({ trial_type: 'go-no-go' });
      expect(mockData.select).toHaveBeenCalledWith('accuracy');
      expect(accuracy).toBe(0.85);
    });

    it("should calculate mean RT correctly", () => {
      const mockData = {
        filter: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        mean: jest.fn().mockReturnValue(450)
      };
      
      const meanRT = utils.calculateMeanRT(mockData);
      
      expect(mockData.filter).toHaveBeenCalledWith({ 
        trial_type: 'go-no-go', 
        stimulus_type: 'go' 
      });
      expect(mockData.select).toHaveBeenCalledWith('rt');
      expect(meanRT).toBe(450);
    });
  });
});