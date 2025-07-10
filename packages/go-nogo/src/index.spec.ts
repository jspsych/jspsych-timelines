import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, utils } from ".";

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
      expect(timeline.timeline).toHaveLength(3);
      expect(timeline.timeline[0]).toHaveProperty('stimulus');
      expect(timeline.timeline[1]).toHaveProperty('timeline');
      expect(timeline.timeline[2]).toHaveProperty('stimulus');
    });

    it("should create timeline with custom configuration", () => {
      const config = {
        goStimuli: ['A', 'B'],
        noGoStimuli: ['C', 'D'],
        buttonText: 'Press',
        responseTimeout: 2000,
        interTrialInterval: 800,
        numTrials: 50,
        goTrialProbability: 0.8,
        varyStimulus: true
      };

      const timeline = createTimeline(jsPsych, config);
      
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toHaveLength(3);
      
      // Check trial procedure has correct number of trials
      const trialProcedure = timeline.timeline[1] as any;
      expect(trialProcedure.timeline_variables).toHaveLength(50);
    });
  });

  describe("parameter combinations", () => {
    it("should handle varyStimulus: true with custom stimuli", () => {
      // Mock Math.random to ensure we get both go and no-go trials
      const mockValues = [0.3, 0.7, 0.2, 0.8, 0.1, 0.9, 0.4, 0.6, 0.25, 0.75];
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);

      const config = {
        goStimuli: ['A', 'B', 'C'],
        noGoStimuli: ['X', 'Y', 'Z'],
        varyStimulus: true,
        numTrials: 10,
        goTrialProbability: 0.5
      };

      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[1] as any;
      
      // Check that various stimuli are used
      const stimuli = trialProcedure.timeline_variables.map((trial: any) => 
        trial.stimulus.match(/>(.*?)</)[1]
      );
      
      expect(stimuli).toEqual(expect.arrayContaining(['A', 'B', 'C', 'X', 'Y', 'Z']));
      
      // Restore Math.random
      (Math.random as jest.Mock).mockRestore();
    });

    it("should handle varyStimulus: false with default stimuli", () => {
      // Mock Math.random to ensure we get both go and no-go trials
      const mockValues = [0.3, 0.7, 0.2, 0.8, 0.1, 0.9, 0.4, 0.6, 0.25, 0.75];
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);

      const config = {
        goStimuli: ['A', 'B', 'C'],
        noGoStimuli: ['X', 'Y', 'Z'],
        varyStimulus: false,
        numTrials: 10,
        goTrialProbability: 0.5
      };

      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[1] as any;
      
      // Check that only default stimuli are used
      const stimuli = trialProcedure.timeline_variables.map((trial: any) => 
        trial.stimulus.match(/>(.*?)</)[1]
      );
      
      expect(stimuli).toEqual(expect.arrayContaining(['GO', 'NO GO']));
      expect(stimuli).not.toContain('A');
      expect(stimuli).not.toContain('X');
      
      // Restore Math.random
      (Math.random as jest.Mock).mockRestore();
    });

    it("should handle different goTrialProbability values", () => {
      // Mock Math.random to return sequential values
      const mockValues = [0.1, 0.9, 0.3, 0.7, 0.5];
      jest.spyOn(Math, 'random').mockImplementation(() => mockValues.shift() || 0.5);

      const config = {
        goTrialProbability: 0.6,
        numTrials: 5
      };

      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[1] as any;
      
      const goTrials = trialProcedure.timeline_variables.filter((trial: any) => 
        trial.trial_type === 'go'
      );
      const noGoTrials = trialProcedure.timeline_variables.filter((trial: any) => 
        trial.trial_type === 'no-go'
      );

      expect(goTrials.length).toBe(3); // Values 0.1, 0.3, 0.5 are < 0.6
      expect(noGoTrials.length).toBe(2); // Values 0.9, 0.7 are >= 0.6
    });

    it("should handle different numTrials values", () => {
      const testCases = [1, 5, 10, 50, 100];
      
      testCases.forEach(numTrials => {
        const config = { numTrials };
        const timeline = createTimeline(jsPsych, config);
        const trialProcedure = timeline.timeline[1] as any;
        
        expect(trialProcedure.timeline_variables).toHaveLength(numTrials);
      });
    });

    it("should handle different responseTimeout values", () => {
      const config = { responseTimeout: 3000 };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[1] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      expect(goNoGoTrial.trial_duration).toBe(3000);
    });

    it("should handle different interTrialInterval values", () => {
      const config = { interTrialInterval: 1000 };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[1] as any;
      const interTrialTrial = trialProcedure.timeline[1];
      
      expect(interTrialTrial.trial_duration).toBe(1000);
    });

    it("should handle different buttonText values", () => {
      const config = { buttonText: 'Respond' };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[1] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      expect(goNoGoTrial.choices).toEqual(['Respond']);
    });
  });

  describe("trial generation", () => {
    it("should generate correct trial structure", () => {
      const config = { numTrials: 10 };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[1] as any;
      
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
      const trialProcedure = timeline.timeline[1] as any;
      
      expect(trialProcedure.randomize_order).toBe(true);
    });
  });

  describe("stimulus formatting", () => {
    it("should format go stimuli correctly", () => {
      const config = { 
        goStimuli: ['TEST'],
        goTrialProbability: 1.0,
        numTrials: 1
      };
      
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[1] as any;
      const trial = trialProcedure.timeline_variables[0];
      
      expect(trial.stimulus).toContain('TEST');
      expect(trial.stimulus).toContain('green');
      expect(trial.stimulus).toContain('font-size: 48px');
      expect(trial.stimulus).toContain('font-weight: bold');
    });

    it("should format no-go stimuli correctly", () => {
      const config = { 
        noGoStimuli: ['STOP'],
        goTrialProbability: 0.0,
        numTrials: 1
      };
      
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[1] as any;
      const trial = trialProcedure.timeline_variables[0];
      
      expect(trial.stimulus).toContain('STOP');
      expect(trial.stimulus).toContain('red');
      expect(trial.stimulus).toContain('font-size: 48px');
      expect(trial.stimulus).toContain('font-weight: bold');
    });
  });

  describe("timeline structure", () => {
    it("should have correct instruction trial", () => {
      const timeline = createTimeline(jsPsych);
      const instructionTrial = timeline.timeline[0] as any;
      
      expect(instructionTrial.stimulus).toContain('Go/No-Go Task Instructions');
      expect(instructionTrial.stimulus).toContain('GO trials');
      expect(instructionTrial.stimulus).toContain('NO-GO trials');
      expect(instructionTrial.choices).toEqual(['Start']);
      expect(instructionTrial.data.trial_type).toBe('instructions');
    });

    it("should have correct debrief trial", () => {
      const timeline = createTimeline(jsPsych);
      const debriefTrial = timeline.timeline[2] as any;
      
      expect(debriefTrial.choices).toEqual(['Finish']);
      expect(debriefTrial.data.trial_type).toBe('debrief');
      expect(typeof debriefTrial.stimulus).toBe('function');
    });

    it("should have correct trial procedure structure", () => {
      const timeline = createTimeline(jsPsych);
      const trialProcedure = timeline.timeline[1] as any;
      
      expect(trialProcedure.timeline).toHaveLength(2);
      expect(trialProcedure).toHaveProperty('timeline_variables');
      expect(trialProcedure.randomize_order).toBe(true);
      
      // Check go-no-go trial structure
      const goNoGoTrial = trialProcedure.timeline[0];
      expect(goNoGoTrial.response_ends_trial).toBe(true);
      expect(goNoGoTrial.data.trial_type).toBe('go-no-go');
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
      const trialProcedure = timeline.timeline[1] as any;
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
      const trialProcedure = timeline.timeline[1] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      goNoGoTrial.on_finish(mockData);
      
      expect(mockData.correct).toBe(true);
      expect(mockData.accuracy).toBe(1);
      expect(mockData.reaction_time).toBeUndefined();
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
      const trialProcedure = timeline.timeline[1] as any;
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
      const trialProcedure = timeline.timeline[1] as any;
      const goNoGoTrial = trialProcedure.timeline[0];
      
      goNoGoTrial.on_finish(mockData);
      
      expect(mockData.correct).toBe(false);
      expect(mockData.accuracy).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle empty stimuli arrays", () => {
      const config = {
        goStimuli: [],
        noGoStimuli: [],
        numTrials: 5
      };
      
      expect(() => createTimeline(jsPsych, config)).not.toThrow();
    });

    it("should handle zero trials", () => {
      const config = { numTrials: 0 };
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[1] as any;
      
      expect(trialProcedure.timeline_variables).toHaveLength(0);
    });

    it("should handle extreme goTrialProbability values", () => {
      const config1 = { goTrialProbability: 0.0, numTrials: 5 };
      const timeline1 = createTimeline(jsPsych, config1);
      const trialProcedure1 = timeline1.timeline[1] as any;
      
      const allNoGo = trialProcedure1.timeline_variables.every((trial: any) => 
        trial.trial_type === 'no-go'
      );
      expect(allNoGo).toBe(true);
      
      const config2 = { goTrialProbability: 1.0, numTrials: 5 };
      const timeline2 = createTimeline(jsPsych, config2);
      const trialProcedure2 = timeline2.timeline[1] as any;
      
      const allGo = trialProcedure2.timeline_variables.every((trial: any) => 
        trial.trial_type === 'go'
      );
      expect(allGo).toBe(true);
    });

    it("should handle single stimulus arrays", () => {
      const config = {
        goStimuli: ['GO_SINGLE'],
        noGoStimuli: ['NOGO_SINGLE'],
        numTrials: 10
      };
      
      const timeline = createTimeline(jsPsych, config);
      const trialProcedure = timeline.timeline[1] as any;
      
      const goTrials = trialProcedure.timeline_variables.filter((trial: any) => 
        trial.trial_type === 'go'
      );
      const noGoTrials = trialProcedure.timeline_variables.filter((trial: any) => 
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