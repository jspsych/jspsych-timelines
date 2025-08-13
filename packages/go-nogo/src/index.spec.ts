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

    it("should validate probability inputs", () => {
      expect(() => {
        createTimeline(jsPsych, { probability: 1.5, num_trials: 5 });
      }).toThrow(/Invalid trial configuration/);
    });

    it("should use single stimuli when arrays not provided", () => {
      const config = { go_stimulus: 'GO', nogo_stimulus: 'STOP' };
      const timeline = createTimeline(jsPsych, config);
      
      expect(timeline).toHaveProperty('timeline');
    });
  });

  describe("createInstructions", () => {
    it("should create instructions trial", () => {
      const instructions = createInstructions();
      
      expect(instructions).toHaveProperty('type');
      expect(instructions).toHaveProperty('pages');
      expect(Array.isArray(instructions.pages)).toBe(true);
    });
  });

  describe("timelineUnits", () => {
    it("should have createPractice function", () => {
      expect(typeof timelineUnits.createPractice).toBe('function');
    });

    it("should have createDebrief function", () => {
      expect(typeof timelineUnits.createDebrief).toBe('function');
    });

    it("should create practice trials", () => {
      const practice = timelineUnits.createPractice();
      
      expect(Array.isArray(practice)).toBe(true);
      expect(practice.length).toBe(3); // go, nogo, completion
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

  describe("edge cases", () => {
    it("should handle zero trials", () => {
      const timeline = createTimeline(jsPsych, { num_trials: 0 });
      expect(timeline).toHaveProperty('timeline');
    });

    it("should handle extreme probability values", () => {
      const timeline1 = createTimeline(jsPsych, { probability: 0.0, num_trials: 5 });
      const timeline2 = createTimeline(jsPsych, { probability: 1.0, num_trials: 5 });
      
      expect(timeline1).toHaveProperty('timeline');
      expect(timeline2).toHaveProperty('timeline');
    });
  });
});