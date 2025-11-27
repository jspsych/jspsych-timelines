import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline } from ".";

describe("Corsi Block Task", () => {
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

    it("should create timeline with default parameters", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 2,
        trials_per_length: 2
      });
      expect(timeline).toBeDefined();
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should support custom starting length", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 3,
        trials_per_length: 2
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom trials per length", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 2,
        trials_per_length: 3
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom max length", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 2,
        max_length: 7
      });
      expect(timeline).toBeDefined();
    });

    it("should support both-trials stop rule", () => {
      const timeline = createTimeline(jsPsych, {
        stop_rule: 'both-trials',
        trials_per_length: 2
      });
      expect(timeline).toBeDefined();
    });

    it("should support consecutive-errors stop rule", () => {
      const timeline = createTimeline(jsPsych, {
        stop_rule: 'consecutive-errors',
        consecutive_errors_threshold: 3
      });
      expect(timeline).toBeDefined();
    });

    it("should support fixed sequence generation", () => {
      const timeline = createTimeline(jsPsych, {
        sequence_generation: 'fixed'
      });
      expect(timeline).toBeDefined();
    });

    it("should support random sequence generation", () => {
      const timeline = createTimeline(jsPsych, {
        sequence_generation: 'random'
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom temporal parameters", () => {
      const timeline = createTimeline(jsPsych, {
        stimulus_duration: 750,
        inter_stimulus_interval: 1200,
        post_sequence_delay: 600,
        inter_trial_delay: 2000,
        response_timeout: 60000
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom block colors", () => {
      const timeline = createTimeline(jsPsych, {
        block_colors: {
          inactive: '#555555',
          active: '#ff0000',
          correct: '#00ff00',
          incorrect: '#ff0000'
        }
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom background color", () => {
      const timeline = createTimeline(jsPsych, {
        background_color: '#ffffff'
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom display dimensions", () => {
      const timeline = createTimeline(jsPsych, {
        display_width: '600px',
        display_height: '600px',
        block_size: 15
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom click feedback duration", () => {
      const timeline = createTimeline(jsPsych, {
        click_feedback_duration: 300
      });
      expect(timeline).toBeDefined();
    });

    it("should support auto sequence initiation", () => {
      const timeline = createTimeline(jsPsych, {
        sequence_initiation: 'auto'
      });
      expect(timeline).toBeDefined();
      // Should not have start button
      expect(timeline.timeline.length).toBe(1);
    });

    it("should support button sequence initiation", () => {
      const timeline = createTimeline(jsPsych, {
        sequence_initiation: 'button'
      });
      expect(timeline).toBeDefined();
      // Should have start button
      expect(timeline.timeline.length).toBe(2);
    });

    it("should support custom block positions", () => {
      const timeline = createTimeline(jsPsych, {
        blocks: [
          { x: 10, y: 10 },
          { x: 20, y: 20 },
          { x: 30, y: 30 },
          { x: 40, y: 40 },
          { x: 50, y: 50 }
        ]
      });
      expect(timeline).toBeDefined();
    });

    it("should support allowing repeats", () => {
      const timeline = createTimeline(jsPsych, {
        allow_repeats: true
      });
      expect(timeline).toBeDefined();
    });

    it("should support disallowing repeats", () => {
      const timeline = createTimeline(jsPsych, {
        allow_repeats: false
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom data labels", () => {
      const timeline = createTimeline(jsPsych, {
        data_labels: {
          task: 'corsi-block',
          condition: 'experiment-1',
          participant_group: 'control'
        }
      });
      expect(timeline).toBeDefined();
    });

    it("should support touchscreen input modality", () => {
      const timeline = createTimeline(jsPsych, {
        input_modality: 'touchscreen'
      });
      expect(timeline).toBeDefined();
    });

    it("should support mouse input modality", () => {
      const timeline = createTimeline(jsPsych, {
        input_modality: 'mouse'
      });
      expect(timeline).toBeDefined();
    });

    it("should support fixed ISI mode", () => {
      const timeline = createTimeline(jsPsych, {
        isi_mode: 'fixed'
      });
      expect(timeline).toBeDefined();
    });

    it("should support custom text configuration", () => {
      const timeline = createTimeline(jsPsych, {
        text_object: {
          display_prompt: 'Regardez la séquence',
          input_prompt: 'Tapez les blocs dans le même ordre'
        }
      });
      expect(timeline).toBeDefined();
    });

    it("should support null response timeout for unlimited time", () => {
      const timeline = createTimeline(jsPsych, {
        response_timeout: null
      });
      expect(timeline).toBeDefined();
    });

    it("should handle clinical standard parameters", () => {
      // Clinical standard: 1000ms stimulus, 1000ms ISI, 500ms delays
      const timeline = createTimeline(jsPsych, {
        stimulus_duration: 1000,
        inter_stimulus_interval: 1000,
        post_sequence_delay: 500,
        inter_trial_delay: 1500,
        starting_length: 2,
        trials_per_length: 2,
        stop_rule: 'both-trials',
        sequence_generation: 'fixed',
        allow_repeats: false
      });
      expect(timeline).toBeDefined();
    });

    it("should handle research variant parameters", () => {
      // Faster variant for research
      const timeline = createTimeline(jsPsych, {
        stimulus_duration: 500,
        inter_stimulus_interval: 500,
        post_sequence_delay: 250,
        inter_trial_delay: 1000,
        starting_length: 3,
        trials_per_length: 3,
        max_length: 8
      });
      expect(timeline).toBeDefined();
    });
  });
});
