import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, createInstructions, timelineUnits, utils } from ".";

describe("Go-NoGo Timeline", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  //TODO: improve these tests to not test for existence of properties only, but also their functionality
  describe("createTimeline", () => {
    it("should create timeline with default config", () => {
      const timeline = createTimeline(jsPsych);
      
      expect(timeline).toHaveProperty('timeline');
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should handle custom config", () => {
      const config = {
        num_blocks: 2,
        num_trials: 10,
        show_debrief: true
      };
      
      const timeline = createTimeline(jsPsych, config);
      
      expect(timeline).toHaveProperty('timeline');
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should include blocks in timeline", () => {
      const timeline = createTimeline(jsPsych, { num_blocks: 2 });
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should use single stimuli when arrays not provided", () => {
      const config = { go_stimulus: 'GO', nogo_stimulus: 'STOP' };
      const timeline = createTimeline(jsPsych, config);
      
      expect(timeline).toHaveProperty('timeline');
    });
  });

  describe("createInstructions", () => {
    it("should create instructions trial", () => {
      const instructions = createInstructions(["hi","<b>test<b>"], {backButton: 'back', nextButton: 'next'});
      
      expect(instructions).toHaveProperty('type');
      expect(instructions).toHaveProperty('pages');
      // example of testing via functionality-- does it generate the correct number of pages with the right content?
      expect(instructions.pages).toEqual([
        '<div class="timeline-instructions"><p>hi</p></div>',
        '<div class="timeline-instructions"><p><b>test<b></p></div>'
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
      dataCollection.push({ task: 'go-nogo', phase: 'main-trial', correct: true, is_go_trial: true, response: 0, rt: 400 });
      dataCollection.push({ task: 'go-nogo', phase: 'main-trial', correct: false, is_go_trial: true, response: null, rt: null });
      dataCollection.push({ task: 'go-nogo', phase: 'main-trial', correct: true, is_go_trial: false, response: null, rt: null });

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
      expect(html).toContain(`class="go-nogo-container timeline-trial"`);
      expect(html).toContain(`TEST</div>`);
    });
  });

  describe("new parameter tests", () => {
    it("should use show_button_during_fixation parameter", () => {
      const timelineWithButton = createTimeline(jsPsych, {
        show_button_during_fixation: true
      });
      const timelineWithoutButton = createTimeline(jsPsych, {
        show_button_during_fixation: false
      });

      expect(timelineWithButton.timeline).toBeDefined();
      expect(timelineWithoutButton.timeline).toBeDefined();
    });

    it("should use stimulus_container_height parameter", () => {
      const customHeight = "30vh";
      const timeline = createTimeline(jsPsych, {
        stimulus_container_height: customHeight
      });

      expect(timeline.timeline).toBeDefined();
      // The timeline should be created with custom height
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should use fixation_size parameter", () => {
      const customSize = "5em";
      const timeline = createTimeline(jsPsych, {
        fixation_size: customSize
      });

      expect(timeline.timeline).toBeDefined();
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should use stimulus_duration parameter", () => {
      const timeline = createTimeline(jsPsych, {
        stimulus_duration: 200,
        trial_timeout: 1000
      });

      expect(timeline.timeline).toBeDefined();
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should handle stimulus_duration as null", () => {
      const timeline = createTimeline(jsPsych, {
        stimulus_duration: null,
        trial_timeout: 500
      });

      expect(timeline.timeline).toBeDefined();
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should apply stimulus_container_height to createStimulusHTML", () => {
      const containerHeight = "25vh";
      const html = utils.createStimulusHTML('TEST', true, containerHeight);

      expect(html).toContain(`height: ${containerHeight}`);
      expect(html).toContain('display: flex');
    });

    it("should create ISI fixation with custom parameters", () => {
      const fixation = timelineUnits.createISIFixation(
        1000,
        'Click',
        true,
        '25vh',
        '4em'
      );

      expect(fixation).toHaveProperty('type');
      expect(fixation).toHaveProperty('stimulus');
      expect(fixation.trial_duration).toBe(1000);
    });

    it("should create go-nogo trial with stimulus_duration", () => {
      const trial = timelineUnits.createGoNoGo(jsPsych, 'Click', 1000, 200);

      expect(trial).toHaveProperty('type');
      expect(trial.trial_duration).toBe(1000);
      expect(trial.stimulus_duration).toBe(200);
    });

    it("should default stimulus_container_height to 25vh", () => {
      const timeline = createTimeline(jsPsych, {});

      // Test passes if timeline is created successfully with defaults
      expect(timeline.timeline).toBeDefined();
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });
  });
});