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

    it("should create timeline nodes for each length from starting_length to max_length", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 3,
        max_length: 5,
        trials_per_length: 2
      });

      // Timeline includes: instructions + (3 lengths * 1 node each) + final span calculation
      // Length nodes: 3, 4, 5 = 3 nodes
      // First item is instructions, last item is span calculation
      // So we should have: instructions + 3 length nodes + span calc = 5 items
      expect(timeline.timeline.length).toBe(5);
    });

    it("should create correct number of trials per length via timeline_variables", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 2,
        max_length: 3,
        trials_per_length: 4
      });

      // Find a length node (skip instructions at index 0)
      const lengthNode = timeline.timeline[1] as any;
      const innerTimeline = lengthNode.timeline[0];

      expect(innerTimeline.timeline_variables.length).toBe(4);
    });

    it("should set correct sequence_length in timeline_variables", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 3,
        max_length: 4,
        trials_per_length: 2
      });

      // First length node (after instructions)
      const lengthNode = timeline.timeline[1] as any;
      const innerTimeline = lengthNode.timeline[0];

      // All trials at this length should have sequence_length = 3
      innerTimeline.timeline_variables.forEach((trialVar: any) => {
        expect(trialVar.sequence_length).toBe(3);
      });
    });

    it("should generate sequences with correct length", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 4,
        max_length: 5,
        trials_per_length: 2
      });

      // First length node (after instructions)
      const lengthNode = timeline.timeline[1] as any;
      const innerTimeline = lengthNode.timeline[0];

      // All sequences should have length 4
      innerTimeline.timeline_variables.forEach((trialVar: any) => {
        expect(trialVar.sequence.length).toBe(4);
      });
    });

    it("should apply both-trials stop rule via conditional_function", () => {
      const timeline = createTimeline(jsPsych, {
        stop_rule: 'both-trials',
        starting_length: 2,
        max_length: 4,
        trials_per_length: 2
      });

      // The second length node should have a conditional_function
      const lengthNode = timeline.timeline[2] as any;
      expect(typeof lengthNode.conditional_function).toBe('function');
    });

    it("should apply consecutive-errors stop rule via conditional_function", () => {
      const timeline = createTimeline(jsPsych, {
        stop_rule: 'consecutive-errors',
        consecutive_errors_threshold: 3,
        starting_length: 2,
        max_length: 4
      });

      const lengthNode = timeline.timeline[2] as any;
      expect(typeof lengthNode.conditional_function).toBe('function');
    });

    it("should generate sequences without repeats when allow_repeats is false", () => {
      const timeline = createTimeline(jsPsych, {
        allow_repeats: false,
        starting_length: 5,
        max_length: 5,
        trials_per_length: 10,
        sequence_generation: 'random'
      });

      const lengthNode = timeline.timeline[1] as any;
      const innerTimeline = lengthNode.timeline[0];

      // Check that sequences don't have consecutive repeated indices
      innerTimeline.timeline_variables.forEach((trialVar: any) => {
        const sequence = trialVar.sequence;
        for (let i = 1; i < sequence.length; i++) {
          expect(sequence[i]).not.toBe(sequence[i - 1]);
        }
      });
    });

    it("should use custom block_colors in display trials", () => {
      const timeline = createTimeline(jsPsych, {
        block_colors: {
          inactive: '#555555',
          active: '#ff0000',
          correct: '#00ff00',
          incorrect: '#0000ff'
        },
        starting_length: 2,
        max_length: 2,
        trials_per_length: 1
      });

      // Instructions are at index 0, first length node at index 1
      const lengthNode = timeline.timeline[1] as any;
      const innerTimeline = lengthNode.timeline[0];
      const displayTrial = innerTimeline.timeline[0];

      expect(displayTrial.block_color).toBe('#555555');
      expect(displayTrial.highlight_color).toBe('#ff0000');
    });

    it("should use custom temporal parameters in display trials", () => {
      const timeline = createTimeline(jsPsych, {
        stimulus_duration: 750,
        inter_stimulus_interval: 1200,
        starting_length: 2,
        max_length: 2,
        trials_per_length: 1
      });

      const lengthNode = timeline.timeline[1] as any;
      const innerTimeline = lengthNode.timeline[0];
      const displayTrial = innerTimeline.timeline[0];

      expect(displayTrial.sequence_block_duration).toBe(750);
      expect(displayTrial.sequence_gap_duration).toBe(1200);
    });

    it("should support auto sequence initiation", () => {
      const timeline = createTimeline(jsPsych, {
        sequence_initiation: 'auto'
      });
      expect(timeline).toBeDefined();
      // Timeline includes interactive instructions and trials
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should support button sequence initiation", () => {
      const timeline = createTimeline(jsPsych, {
        sequence_initiation: 'button'
      });
      expect(timeline).toBeDefined();
      // Timeline includes interactive instructions and trials
      expect(timeline.timeline.length).toBeGreaterThan(0);
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
