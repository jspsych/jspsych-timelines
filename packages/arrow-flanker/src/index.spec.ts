import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline } from ".";

describe("Arrow Flanker Task", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  describe("createTimeline", () => {
    it("should return a timeline", () => {
      const timeline = createTimeline(jsPsych);
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should handle backward compatibility with 'n' parameter", () => {
      const timeline = createTimeline(jsPsych, { n: 8 });
      expect(timeline).toBeDefined();
      // Timeline should have trials
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should create timeline with default parameters", () => {
      const timeline = createTimeline(jsPsych, {
        fixation_duration: 500,
        num_trials: 12
      });
      expect(timeline).toBeDefined();
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should support neutral trials", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 12,
        include_neutral: true,
        congruency_ratio: {
          congruent: 1,
          incongruent: 1,
          neutral: 1
        }
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom congruency ratios", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 12,
        congruency_ratio: {
          congruent: 25,
          incongruent: 75
        }
      });
      expect(timeline).toBeDefined();
    });

    it("should support SOA configuration with array", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 12,
        soa: [-200, 0, 200]
      });
      expect(timeline).toBeDefined();
    });

    it("should support SOA configuration with range", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 12,
        soa: { min: -200, max: 200 }
      });
      expect(timeline).toBeDefined();
    });

    it("should support multiple blocks", () => {
      const timeline = createTimeline(jsPsych, {
        num_blocks: 3,
        num_trials: 12
      });
      expect(timeline).toBeDefined();
      // Should have 3 block procedures + 2 block breaks
      expect(timeline.timeline.length).toBe(5);
    });

    it("should support sequential effects tracking", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 24,
        track_sequence_effects: true
      });
      expect(timeline).toBeDefined();
    });

    it("should support vertical arrangement", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 12,
        flanker_arrangement: 'vertical'
      });
      expect(timeline).toBeDefined();
    });

    it("should support 7-item arrays", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 12,
        num_flankers: 6
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom spatial parameters", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 12,
        stimulus_size: '64px',
        target_flanker_separation: '20px',
        fixation_size: '32px'
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom temporal parameters", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 12,
        fixation_duration: 1000,
        stimulus_duration: 200,
        iti_duration: 500,
        response_timeout: 2000
      });
      expect(timeline).toBeDefined();
    });

    it("should support blocked design", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 12,
        block_design: 'blocked'
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom response keys", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 12,
        response_keys: {
          left: ['f'],
          right: ['j']
        }
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom data labels", () => {
      const timeline = createTimeline(jsPsych, {
        num_trials: 12,
        data_labels: {
          task: 'arrow-flanker',
          condition: 'experiment-1'
        }
      });
      expect(timeline).toBeDefined();
    });
  });
});
