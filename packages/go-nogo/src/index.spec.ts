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
    it("should return a timeline with default configuration", () => {
      const timeline = createTimeline(jsPsych);
      
      expect(timeline).toBeDefined();
      // Should have: overview + go-instruction + nogo-instruction + practice-completion + block1 + block2-instruction + block2 + block3-instruction + block3 + debrief = 10 items
      expect(timeline.timeline).toHaveLength(10);
      expect(timeline.timeline[0]).toHaveProperty('stimulus'); // overview instruction
      expect(timeline.timeline[1]).toHaveProperty('stimulus'); // go instruction
      expect(timeline.timeline[2]).toHaveProperty('stimulus'); // nogo instruction
      expect(timeline.timeline[3]).toHaveProperty('stimulus'); // practice completion
      expect(timeline.timeline[4]).toHaveProperty('timeline'); // block 1
      expect(timeline.timeline[5]).toHaveProperty('stimulus'); // block 2 instruction
      expect(timeline.timeline[6]).toHaveProperty('timeline'); // block 2
      expect(timeline.timeline[7]).toHaveProperty('stimulus'); // block 3 instruction
      expect(timeline.timeline[8]).toHaveProperty('timeline'); // block 3
      expect(timeline.timeline[9]).toHaveProperty('stimulus'); // debrief
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
      // Should have: overview + go-instruction + nogo-instruction + practice-completion + block1 + block2-instruction + block2 + debrief = 8 items
      expect(timeline.timeline).toHaveLength(8);
      
      // Check first block has correct number of trials
      const firstBlock = timeline.timeline[4] as any;
      expect(firstBlock.timeline_variables).toHaveLength(25);
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
      const firstBlock = timeline.timeline[4] as any;
      
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
      const firstBlock = timeline.timeline[4] as any;
      
      // Check that default stimuli are used
      const stimuli = firstBlock.timeline_variables.map((trial: any) => 
        trial.stimulus.match(/>(.*?)</)[1]
      );
      
      expect(stimuli).toEqual(expect.arrayContaining(['GO', 'NO-GO']));
      
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
      const firstBlock = timeline.timeline[4] as any;
      
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
        const firstBlock = timeline.timeline[4] as any;
        
        expect(firstBlock.timeline_variables).toHaveLength(trialsPerBlock);
      });
    });

    it("should handle different responseTimeout values", () => {
      const config = { responseTimeout: 3000 };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[4] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      expect(goNoGoTrial.trial_duration).toBe(3000);
    });

    it("should handle different interTrialInterval values", () => {
      const config = { interTrialInterval: 1000 };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[4] as any;
      const interTrialTrial = trialProcedure.timeline[1];
      
      expect(interTrialTrial.trial_duration).toBe(1000);
    });

    it("should handle different buttonText values", () => {
      const config = { buttonText: 'Respond' };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[4] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      expect(goNoGoTrial.choices).toEqual(['Respond']);
    });
  });

  describe("trial generation", () => {
    it("should generate correct trial structure", () => {
      const config = { numTrials: 10 };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[4] as any;
      
      trialProcedure.timeline_variables.forEach((trial: any) => {
        expect(trial).toHaveProperty('stimulus');
        expect(trial).toHaveProperty('trial_type');
        expect(trial).toHaveProperty('correct_response');
        expect(['go', 'no-go']).toContain(trial.trial_type);
        
        if (trial.trial_type === 'go') {
          expect(trial.correct_response).toBe(0);
          expect(trial.stimulus).toContain('green');
        } else {
          expect(trial.correct_response).toBe(null);
          expect(trial.stimulus).toContain('red');
        }
      });
    });

    it("should randomize trial order", () => {
      const timeline = createTimeline(jsPsych);
      const trialProcedure = timeline.timeline[4] as any;
      
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
      const firstBlock = timeline.timeline[4] as any;
      const trial = firstBlock.timeline_variables[0];
      
      expect(trial.stimulus).toContain('TEST');
      expect(trial.stimulus).toContain('green');
      expect(trial.stimulus).toContain('font-size: 48px');
      expect(trial.stimulus).toContain('font-weight: bold');
    });

    it("should format no-go stimuli correctly", () => {
      const config = { 
        noGoStimulus: 'STOP',
        goTrialProbability: 0.0,
        numBlocks: 1,
        trialsPerBlock: 1
      };
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[4] as any;
      const trial = firstBlock.timeline_variables[0];
      
      expect(trial.stimulus).toContain('STOP');
      expect(trial.stimulus).toContain('red');
      expect(trial.stimulus).toContain('font-size: 48px');
      expect(trial.stimulus).toContain('font-weight: bold');
    });
  });

  describe("stimulus types", () => {
    it("should handle text stimuli by default", () => {
      const config = { 
        goStimulus: 'TEXT_GO',
        stimulusType: 'text' as const,
        numBlocks: 1,
        trialsPerBlock: 1,
        goTrialProbability: 1.0
      };
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[4] as any;
      const trial = firstBlock.timeline_variables[0];
      
      expect(trial.stimulus).toContain('<div style=');
      expect(trial.stimulus).toContain('TEXT_GO');
      expect(trial.stimulus).toContain('font-size: 48px');
      expect(trial.stimulus).not.toContain('<img');
    });

    it("should handle image stimuli", () => {
      const config = { 
        goStimulus: 'path/to/image.png',
        stimulusType: 'image' as const,
        numBlocks: 1,
        trialsPerBlock: 1,
        goTrialProbability: 1.0,
        imageWidth: 150,
        imageHeight: 150
      };
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[4] as any;
      const trial = firstBlock.timeline_variables[0];
      
      expect(trial.stimulus).toContain('<img src="path/to/image.png"');
      expect(trial.stimulus).toContain('width: 150px');
      expect(trial.stimulus).toContain('height: 150px');
      expect(trial.stimulus).toContain('border: 3px solid green');
      expect(trial.stimulus).not.toContain('<div');
    });

    it("should handle mixed stimuli (auto-detect for text)", () => {
      const config = { 
        goStimulus: 'TEXT_GO',
        noGoStimulus: 'image.jpg',
        stimulusType: 'mixed' as const,
        numBlocks: 1,
        trialsPerBlock: 2,
        goTrialProbability: 0.5
      };
      
      // Mock to get both go and no-go trials
      const mockValues = [0.3, 0.7];
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[4] as any;
      const trials = firstBlock.timeline_variables;
      
      // Find text and image trials
      const textTrial = trials.find((t: any) => t.stimulus.includes('TEXT_GO'));
      const imageTrial = trials.find((t: any) => t.stimulus.includes('image.jpg'));
      
      expect(textTrial.stimulus).toContain('<div style=');
      expect(textTrial.stimulus).toContain('TEXT_GO');
      
      expect(imageTrial.stimulus).toContain('<img src="image.jpg"');
      expect(imageTrial.stimulus).toContain('border: 3px solid red');
      
      // Restore Math.random
      (Math.random as jest.Mock).mockRestore();
    });

    it("should apply correct colors for no-go image stimuli", () => {
      const config = { 
        noGoStimulus: 'nogo.png',
        stimulusType: 'image' as const,
        numBlocks: 1,
        trialsPerBlock: 1,
        goTrialProbability: 0.0
      };
      
      const timeline = createTimeline(jsPsych, config);
      const firstBlock = timeline.timeline[4] as any;
      const trial = firstBlock.timeline_variables[0];
      
      expect(trial.stimulus).toContain('border: 3px solid red');
      expect(trial.stimulus).toContain('alt="NO-GO stimulus"');
    });
  });

  describe("timeline structure", () => {
    it("should have correct instruction trials", () => {
      const timeline = createTimeline(jsPsych);
      const overviewTrial = timeline.timeline[0] as any;
      const goTrial = timeline.timeline[1] as any;
      const noGoTrial = timeline.timeline[2] as any;
      
      // Overview trial
      expect(overviewTrial.stimulus).toContain(englishText.overviewText);
      expect(overviewTrial.stimulus).toContain(englishText.overviewPrompt);
      expect(overviewTrial.choices).toEqual([englishText.nextButton]);
      expect(overviewTrial.data.trial_type).toBe(englishText.trialTypes.instructions);
      
      // GO trial
      expect(goTrial.stimulus).toContain(englishText.goPageTitle);
      expect(goTrial.stimulus).toContain(englishText.goPageText);
      expect(goTrial.stimulus).toContain(englishText.goPageAction);
      expect(goTrial.stimulus).toContain(englishText.gotItButton);
      expect(goTrial.choices).toEqual([englishText.nextButton]);
      expect(goTrial.data.trial_type).toBe(englishText.trialTypes.instructions);
      
      // NO-GO trial
      expect(noGoTrial.stimulus).toContain(englishText.noGoPageTitle);
      expect(noGoTrial.stimulus).toContain(englishText.noGoPageText);
      expect(noGoTrial.stimulus).toContain(englishText.noGoPageAction);
      expect(noGoTrial.stimulus).toContain(englishText.waitButton);
      expect(noGoTrial.choices).toEqual([englishText.startButton]);
      expect(noGoTrial.data.trial_type).toBe(englishText.trialTypes.instructions);
    });

    it("should have correct debrief trial", () => {
      const timeline = createTimeline(jsPsych);
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      
      expect(debriefTrial.choices).toEqual([englishText.finishButton]);
      expect(debriefTrial.data.trial_type).toBe(englishText.trialTypes.debrief);
      expect(typeof debriefTrial.stimulus).toBe('function');
    });

    it("should have correct trial procedure structure", () => {
      const timeline = createTimeline(jsPsych);
      const trialProcedure = timeline.timeline[4] as any;
      
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
      const trialProcedure = timeline.timeline[4] as any;
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
      const trialProcedure = timeline.timeline[4] as any;
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
      const trialProcedure = timeline.timeline[4] as any;
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
      const trialProcedure = timeline.timeline[4] as any;
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
      const firstBlock = timeline.timeline[4] as any;
      
      expect(firstBlock.timeline_variables).toHaveLength(0);
    });

    it("should handle extreme goTrialProbability values", () => {
      const config1 = { goTrialProbability: 0.0, numBlocks: 1, trialsPerBlock: 5 };
      const timeline1 = createTimeline(jsPsych, config1);
      const firstBlock1 = timeline1.timeline[4] as any;
      
      const allNoGo = firstBlock1.timeline_variables.every((trial: any) => 
        trial.trial_type === 'no-go'
      );
      expect(allNoGo).toBe(true);
      
      const config2 = { goTrialProbability: 1.0, numBlocks: 1, trialsPerBlock: 5 };
      const timeline2 = createTimeline(jsPsych, config2);
      const firstBlock2 = timeline2.timeline[4] as any;
      
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
      const firstBlock = timeline.timeline[4] as any;
      
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

      const timeline = createTimeline(mockJsPsych as any);
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

      const timeline = createTimeline(mockJsPsych as any);
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

      const timeline = createTimeline(mockJsPsych as any);
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

      const timeline = createTimeline(mockJsPsych as any);
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

      const timeline = createTimeline(mockJsPsych as any);
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

      const timeline = createTimeline(mockJsPsych as any);
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

      const timeline = createTimeline(mockJsPsych as any);
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

      const timeline = createTimeline(mockJsPsych as any);
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

      const timeline = createTimeline(mockJsPsych as any, { showResultsDetails: false });
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

      const timeline = createTimeline(mockJsPsych as any, { showResultsDetails: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<h2>Task Complete!</h2>');
      expect(stimulus).toContain('Thank you for completing the Go/No-Go task!');
      expect(stimulus).toContain('<strong>Overall Accuracy:</strong>');
      expect(stimulus).toContain('<strong>Average Response Time (GO trials):</strong>');
    });

    it("should show detailed results by default when showResultsDetails is not specified", () => {
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

      const timeline = createTimeline(mockJsPsych as any); // No config parameter
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('<strong>Overall Accuracy:</strong>');
      expect(stimulus).toContain('<strong>Average Response Time (GO trials):</strong>');
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