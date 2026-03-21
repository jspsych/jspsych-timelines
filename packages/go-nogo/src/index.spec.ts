import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, createInstructions, timelineUnits, utils } from ".";

describe("Go-NoGo Timeline", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  describe("createTimeline", () => {
    it("should create timeline with default config", () => {
      const timeline = createTimeline(jsPsych);

      expect(timeline).toHaveProperty('timeline');
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should create correct number of blocks with breaks between them", () => {
      const timeline = createTimeline(jsPsych, {
        num_blocks: 3,
        num_trials: 10,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      // Timeline structure: [blocksArray] where blocksArray = [block1, break, block2, break, block3]
      const blocksArray = timeline.timeline[0] as any[];
      // 3 blocks + 2 breaks = 5 items
      expect(blocksArray.length).toBe(5);

      // Verify block breaks are in correct positions
      const break1 = blocksArray[1];
      const break2 = blocksArray[3];
      expect(break1.timeline[0].data.part).toBe('block-break');
      expect(break2.timeline[0].data.part).toBe('block-break');
    });

    it("should create correct number of trials per block via timeline_variables", () => {
      const timeline = createTimeline(jsPsych, {
        num_blocks: 1,
        num_trials: 20,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];

      expect(blockProcedure.timeline_variables.length).toBe(20);
    });

    it("should apply trial_timeout to stimulus trials", () => {
      const timeline = createTimeline(jsPsych, {
        trial_timeout: 750,
        num_blocks: 1,
        num_trials: 5,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      // Trial sequence: [fixation, stimulus, isi_blank]
      const stimulusTrial = blockProcedure.timeline[1];

      expect(stimulusTrial.trial_duration).toBe(750);
    });

    it("should respect probability for go/nogo trial ratio", () => {
      const timeline = createTimeline(jsPsych, {
        probability: 0.8, // 80% go trials
        num_blocks: 1,
        num_trials: 100,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const trialVars = blockProcedure.timeline_variables;

      const goTrials = trialVars.filter((v: any) => v.is_go_trial === true);
      const nogoTrials = trialVars.filter((v: any) => v.is_go_trial === false);

      // With 0.8 probability and 100 trials, expect ~80 go and ~20 nogo
      expect(goTrials.length).toBe(80);
      expect(nogoTrials.length).toBe(20);
    });

    it("should include debrief when show_debrief is true", () => {
      const timeline = createTimeline(jsPsych, {
        show_debrief: true,
        show_instructions: false,
        show_practice: false,
        num_blocks: 1,
      });

      const lastItem = timeline.timeline[timeline.timeline.length - 1] as any;
      expect(lastItem.data.phase).toBe('completion');
      expect(typeof lastItem.stimulus).toBe('function');
    });

    it("should exclude debrief when show_debrief is false", () => {
      const timeline = createTimeline(jsPsych, {
        show_debrief: false,
        show_instructions: false,
        show_practice: false,
        num_blocks: 1,
      });

      const lastItem = timeline.timeline[timeline.timeline.length - 1] as any;
      // Last item should be the blocks array, not a debrief
      expect(Array.isArray(lastItem)).toBe(true);
    });

    it("should include instructions when show_instructions is true", () => {
      const withInstructions = createTimeline(jsPsych, {
        show_instructions: true,
        show_practice: false,
        show_debrief: false,
        num_blocks: 1,
      });
      const withoutInstructions = createTimeline(jsPsych, {
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
        num_blocks: 1,
      });

      // Instructions add practice trials at the start
      expect(withInstructions.timeline.length).toBeGreaterThan(withoutInstructions.timeline.length);
    });

    it("should include practice block when show_practice is true", () => {
      const timeline = createTimeline(jsPsych, {
        show_practice: true,
        num_practice_trials: 10,
        show_instructions: false,
        show_debrief: false,
        num_blocks: 1,
      });

      // First item should be practice procedure, followed by end-of-practice screen
      const firstItem = timeline.timeline[0] as any;
      expect(firstItem.data.phase).toBe('practice');
    });

    it("should use custom go_stimulus and nogo_stimulus in timeline_variables", () => {
      const timeline = createTimeline(jsPsych, {
        go_stimulus: '<span>GO!</span>',
        nogo_stimulus: '<span>STOP!</span>',
        num_blocks: 1,
        num_trials: 10,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const trialVars = blockProcedure.timeline_variables;

      const goTrial = trialVars.find((v: any) => v.is_go_trial === true);
      const nogoTrial = trialVars.find((v: any) => v.is_go_trial === false);

      expect(goTrial.stimulus).toContain('GO!');
      expect(nogoTrial.stimulus).toContain('STOP!');
    });
  });

  describe("createInstructions", () => {
    it("should create instructions trial", () => {
      const instructions = createInstructions(["hi","<b>test<b>"], {backButton: 'back', nextButton: 'next'});
      
      expect(instructions).toHaveProperty('type');
      expect(instructions).toHaveProperty('pages');
      // example of testing via functionality-- does it generate the correct number of pages with the right content?
      expect(instructions.pages).toEqual([
        '<div class="instructions" ><p>hi</p></div>',
        '<div class="instructions" ><p><b>test<b></p></div>'
      ]);
    });
  });

  describe("timelineUnits", () => {
    it("should create functional practice trials", () => {
      const practice = timelineUnits.createPractice();
      
      expect(Array.isArray(practice)).toBe(true);
      expect(practice.length).toBe(3); // go, nogo, completion
      
      // Test that each practice trial has timeline with stimulus
      practice.forEach(trial => {
        expect(trial).toHaveProperty('timeline');
        expect(Array.isArray(trial.timeline)).toBe(true);
        trial.timeline.forEach(subTrial => {
          expect(subTrial).toHaveProperty('stimulus');
          expect(typeof subTrial.stimulus).toBe('string');
        });
      });
    });

    it("should create functional debrief trial", () => {
      const debrief = timelineUnits.createDebrief(jsPsych);
      
      expect(debrief).toHaveProperty('type');
      expect(debrief).toHaveProperty('stimulus');
      expect(debrief).toHaveProperty('choices');
      expect(typeof debrief.stimulus).toBe('function');
    });

    it("should create functional go-nogo trial", () => {
      const trial = timelineUnits.createGoNoGo(jsPsych, 'Click', 1000);
      
      expect(trial).toHaveProperty('type');
      expect(trial).toHaveProperty('choices');
      expect(trial.choices).toContain('Click');
      expect(trial.trial_duration).toBe(1000);
    });

    it("should create block break trial", () => {
      const blockBreak = timelineUnits.createBlockBreak(1, 3);
      
      expect(blockBreak).toHaveProperty('type');
      expect(blockBreak).toHaveProperty('stimulus');
      expect(blockBreak).toHaveProperty('choices');
    });
  });

  describe("debrief calculation", () => {
    it("should calculate accuracy and RT correctly", () => {
      // Manually add data to the internal data store
      const dataCollection = jsPsych.data.get();
      dataCollection.push({ task: 'go-nogo', phase: 'test', part: 'go', correct: true, is_go_trial: true, response: 0, rt: 400 });
      dataCollection.push({ task: 'go-nogo', phase: 'test', part: 'go', correct: false, is_go_trial: true, response: null, rt: null });
      dataCollection.push({ task: 'go-nogo', phase: 'test', part: 'nogo', correct: true, is_go_trial: false, response: null, rt: null });

      const timeline = createTimeline(jsPsych, { show_debrief: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain('67%'); // 2 correct out of 3
      expect(stimulus).toContain('400ms'); // Only one valid GO RT
    });
  });

  describe("utils", () => {
    it("should provide createStimulusHTML function", () => {
      expect(typeof utils.createStimulusHTML).toBe('function');
      const html = utils.createStimulusHTML('TEST', true);
      expect(html).toContain(`<div id="go-stimulus-container"`);
      expect(html).toContain(`class="stimulus"`);
      expect(html).toContain(`TEST</div>`);
    });
  });

  describe("timing and display parameters", () => {
    it("should show button during fixation when show_button_during_fixation is true", () => {
      const fixationWithButton = timelineUnits.createFixation(500, 'Click', true, '25vh', '3em');
      const fixationWithoutButton = timelineUnits.createFixation(500, 'Click', false, '25vh', '3em');

      expect(fixationWithButton.choices).toEqual(['Click']);
      expect(fixationWithoutButton.choices).toEqual([]);
    });

    it("should apply stimulus_container_height to timeline_variables stimulus HTML", () => {
      const containerHeight = "35vh";
      const timeline = createTimeline(jsPsych, {
        stimulus_container_height: containerHeight,
        num_blocks: 1,
        num_trials: 5,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const trialVar = blockProcedure.timeline_variables[0];

      expect(trialVar.stimulus).toContain(`min-height: ${containerHeight}`);
    });

    it("should apply fixation_size to fixation stimulus HTML", () => {
      const fixation = timelineUnits.createFixation(500, 'Click', true, '25vh', '5em');

      expect(fixation.stimulus).toContain('font-size: 5em');
    });

    it("should apply stimulus_duration to stimulus trial", () => {
      const timeline = createTimeline(jsPsych, {
        stimulus_duration: 200,
        trial_timeout: 1000,
        num_blocks: 1,
        num_trials: 5,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const stimulusTrial = blockProcedure.timeline[1];

      expect(stimulusTrial.stimulus_duration).toBe(200);
      expect(stimulusTrial.trial_duration).toBe(1000);
    });

    it("should set stimulus_duration to null when not specified", () => {
      const trial = timelineUnits.createGoNoGo(jsPsych, 'Click', 500);

      expect(trial.stimulus_duration).toBeNull();
    });

    it("should apply stimulus_container_height to createStimulusHTML", () => {
      const containerHeight = "25vh";
      const html = utils.createStimulusHTML('TEST', true, containerHeight);

      expect(html).toContain(`min-height: ${containerHeight}`);
    });

    it("should create fixation with correct duration and button text", () => {
      const fixation = timelineUnits.createFixation(1000, 'Press', true, '25vh', '4em');

      expect(fixation.trial_duration).toBe(1000);
      expect(fixation.choices).toEqual(['Press']);
      expect(fixation.data.part).toBe('fixation');
      expect(fixation.response_ends_trial).toBe(false);
    });

    it("should create ISI blank with correct duration", () => {
      const isiBlank = timelineUnits.createISIBlank(500, 'Click', true, '25vh');

      expect(isiBlank.trial_duration).toBe(500);
      expect(isiBlank.data.part).toBe('isi-blank');
      expect(isiBlank.response_ends_trial).toBe(false);
    });

    it("should apply fixation_duration to fixation trial in timeline", () => {
      const timeline = createTimeline(jsPsych, {
        fixation_duration: 750,
        num_blocks: 1,
        num_trials: 5,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const fixationTrial = blockProcedure.timeline[0];

      expect(fixationTrial.trial_duration).toBe(750);
    });

    it("should apply isi_duration to ISI blank trial in timeline", () => {
      const timeline = createTimeline(jsPsych, {
        isi_duration: 300,
        num_blocks: 1,
        num_trials: 5,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const isiBlankTrial = blockProcedure.timeline[2];

      expect(isiBlankTrial.trial_duration).toBe(300);
    });

    it("should set stimulus_duration on trial when provided", () => {
      const trial = timelineUnits.createGoNoGo(jsPsych, 'Click', 1000, 200);

      expect(trial.stimulus_duration).toBe(200);
    });
  });
});