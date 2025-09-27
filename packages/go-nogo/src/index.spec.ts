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
      expect(Array.isArray(instructions.pages)).toBe(true);
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
    it("should provide trial_text object", () => {
      expect(utils).toHaveProperty('trial_text');
      expect(typeof utils.trial_text).toBe('object');
      expect(utils.trial_text).toHaveProperty('buttonText');
    });

    it("should provide createStimulusHTML function", () => {
      expect(typeof utils.createStimulusHTML).toBe('function');
      const html = utils.createStimulusHTML('TEST', true);
      expect(html).toContain(`<div id="go-stimulus-container" class="go-nogo-container timeline-trial" style="font-size: 3em;">TEST</div>`);
    });
  });
});