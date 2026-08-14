import { JsPsych, initJsPsych } from "jspsych";

import { createTimeline, utils } from ".";

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
        trials_per_length: 2,
      });
      expect(timeline).toBeDefined();
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should create timeline nodes for each length from starting_length to max_length", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 3,
        max_length: 5,
        trials_per_length: 2,
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
        trials_per_length: 4,
        // The fixed table only holds 2 sequences per length
        sequence_generation: "random",
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
        trials_per_length: 2,
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
        trials_per_length: 2,
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
        stop_rule: "both-trials",
        starting_length: 2,
        max_length: 4,
        trials_per_length: 2,
      });

      // The second length node should have a conditional_function
      const lengthNode = timeline.timeline[2] as any;
      expect(typeof lengthNode.conditional_function).toBe("function");
    });

    it("should apply consecutive-errors stop rule via conditional_function", () => {
      const timeline = createTimeline(jsPsych, {
        stop_rule: "consecutive-errors",
        consecutive_errors_threshold: 3,
        starting_length: 2,
        max_length: 4,
      });

      const lengthNode = timeline.timeline[2] as any;
      expect(typeof lengthNode.conditional_function).toBe("function");
    });

    it("should generate sequences without repeats when allow_repeats is false", () => {
      const timeline = createTimeline(jsPsych, {
        allow_repeats: false,
        starting_length: 5,
        max_length: 5,
        trials_per_length: 10,
        sequence_generation: "random",
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
          inactive: "#555555",
          active: "#ff0000",
          correct: "#00ff00",
          incorrect: "#0000ff",
        },
        starting_length: 2,
        max_length: 2,
        trials_per_length: 1,
      });

      // Instructions are at index 0, first length node at index 1
      const lengthNode = timeline.timeline[1] as any;
      const innerTimeline = lengthNode.timeline[0];
      const displayTrial = innerTimeline.timeline[0];

      expect(displayTrial.block_color).toBe("#555555");
      expect(displayTrial.highlight_color).toBe("#ff0000");
    });

    it("should use custom temporal parameters in display trials", () => {
      const timeline = createTimeline(jsPsych, {
        stimulus_duration: 750,
        inter_stimulus_interval: 1200,
        starting_length: 2,
        max_length: 2,
        trials_per_length: 1,
      });

      const lengthNode = timeline.timeline[1] as any;
      const innerTimeline = lengthNode.timeline[0];
      const displayTrial = innerTimeline.timeline[0];

      expect(displayTrial.sequence_block_duration).toBe(750);
      expect(displayTrial.sequence_gap_duration).toBe(1200);
    });

    it("should support auto sequence initiation", () => {
      const timeline = createTimeline(jsPsych, {
        sequence_initiation: "auto",
      });
      expect(timeline).toBeDefined();
      // Timeline includes interactive instructions and trials
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should support button sequence initiation", () => {
      const timeline = createTimeline(jsPsych, {
        sequence_initiation: "button",
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
          { x: 50, y: 50 },
        ],
        // The fixed table indexes blocks the default 9-block layout provides
        sequence_generation: "random",
        max_length: 5,
      });
      expect(timeline).toBeDefined();
    });

    it("should support allowing repeats", () => {
      const timeline = createTimeline(jsPsych, {
        allow_repeats: true,
      });
      expect(timeline).toBeDefined();
    });

    it("should support disallowing repeats", () => {
      const timeline = createTimeline(jsPsych, {
        allow_repeats: false,
      });
      expect(timeline).toBeDefined();
    });

    it("should add custom data labels to the recorded trials", () => {
      const timeline = createTimeline(jsPsych, {
        data_labels: {
          condition: "experiment-1",
          participant_group: "control",
        },
        starting_length: 2,
        max_length: 2,
        trials_per_length: 1,
      });

      const innerTimeline = (timeline.timeline[1] as any).timeline[0];
      const [displayTrial, inputTrial] = innerTimeline.timeline;

      for (const trial of [displayTrial, inputTrial]) {
        expect(trial.data.condition).toBe("experiment-1");
        expect(trial.data.participant_group).toBe("control");
      }
    });

    it("should not let data_labels overwrite the fields the timeline queries", () => {
      const timeline = createTimeline(jsPsych, {
        // `task`, `phase` and `part` are reserved; TypeScript rejects them, but
        // a plain-JS caller can still pass them through.
        data_labels: {
          task: "my-study",
          phase: "whatever",
          part: "whatever",
          task_version: "9.9.9",
        } as any,
        starting_length: 2,
        max_length: 3,
        trials_per_length: 2,
      });

      const innerTimeline = (timeline.timeline[1] as any).timeline[0];
      const inputTrial = innerTimeline.timeline[1];

      expect(inputTrial.data.task).toBe("corsi-block");
      expect(inputTrial.data.phase).toBe("test");
      expect(inputTrial.data.part).toBe("response");
      expect(inputTrial.data.task_version).not.toBe("9.9.9");

      // ...so the staircase still advances on correct responses
      jsPsych.data.get().push({
        task: "corsi-block",
        phase: "test",
        part: "response",
        sequence_length: 2,
        correct: true,
      });
      jsPsych.data.get().push({
        task: "corsi-block",
        phase: "test",
        part: "response",
        sequence_length: 2,
        correct: true,
      });

      expect((timeline.timeline[2] as any).conditional_function()).toBe(true);
    });

    it("should record the within-length trial number under a key jsPsych will not overwrite", () => {
      // jsPsych writes its own global `trial_index` onto every row after the
      // data parameter is applied, so this must not be called `trial_index`.
      const timeline = createTimeline(jsPsych, {
        starting_length: 2,
        max_length: 2,
        trials_per_length: 2,
      });

      const innerTimeline = (timeline.timeline[1] as any).timeline[0];

      expect(innerTimeline.timeline_variables.map((v: any) => v.trial_in_length)).toEqual([0, 1]);
      for (const trial of innerTimeline.timeline) {
        expect(trial.data.trial_in_length).toBeDefined();
        expect(trial.data.trial_index).toBeUndefined();
      }
    });

    it("should support touchscreen input modality", () => {
      const timeline = createTimeline(jsPsych, {
        input_modality: "touchscreen",
      });
      expect(timeline).toBeDefined();
    });

    it("should support mouse input modality", () => {
      const timeline = createTimeline(jsPsych, {
        input_modality: "mouse",
      });
      expect(timeline).toBeDefined();
    });

    it("should support fixed ISI mode", () => {
      const timeline = createTimeline(jsPsych, {
        isi_mode: "fixed",
      });
      expect(timeline).toBeDefined();
    });

    it("should route custom text through to the trial prompts", () => {
      const timeline = createTimeline(jsPsych, {
        text: {
          display_prompt: "Regardez la séquence",
          input_prompt: "Tapez les blocs dans le même ordre",
        },
        starting_length: 2,
        max_length: 2,
        trials_per_length: 1,
      });

      const innerTimeline = (timeline.timeline[1] as any).timeline[0];
      expect(innerTimeline.timeline[0].prompt).toBe("Regardez la séquence");
      expect(innerTimeline.timeline[1].prompt).toBe("Tapez les blocs dans le même ordre");
    });

    it("should support null response timeout for unlimited time", () => {
      const timeline = createTimeline(jsPsych, {
        response_timeout: null,
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
        stop_rule: "both-trials",
        sequence_generation: "fixed",
        allow_repeats: false,
      });
      expect(timeline).toBeDefined();
    });

    it("should use the standard fixed sequences at every length, not just the first", () => {
      // Guards against the fixed table being consulted only at the starting
      // length and silently falling through to random sequences above it.
      const sequencesFor = (instance: JsPsych) =>
        (
          createTimeline(instance, {
            starting_length: 2,
            max_length: 5,
            trials_per_length: 2,
            sequence_generation: "fixed",
          }).timeline.slice(1, -1) as any[]
        ).map((node) => node.timeline[0].timeline_variables.map((v: any) => v.sequence));

      expect(sequencesFor(jsPsych)).toEqual([
        [
          [2, 4],
          [5, 8],
        ], // length 2
        [
          [6, 2, 8],
          [4, 7, 3],
        ], // length 3
        [
          [6, 1, 5, 8],
          [4, 2, 7, 3],
        ], // length 4
        [
          [4, 2, 8, 6, 5],
          [6, 1, 5, 8, 3],
        ], // length 5
      ]);

      // ...and they are stable across runs, which is the point of 'fixed'
      expect(sequencesFor(initJsPsych())).toEqual(sequencesFor(initJsPsych()));
    });

    it("should reject configurations that would generate no trials", () => {
      expect(() => createTimeline(jsPsych, { starting_length: 5, max_length: 3 })).toThrow(
        /max_length \(3\) must be >= starting_length \(5\)/
      );
    });

    it("should reject fixed sequences the standard table cannot cover", () => {
      expect(() =>
        createTimeline(jsPsych, { sequence_generation: "fixed", trials_per_length: 3 })
      ).toThrow(/trials_per_length may be at most 2/);

      expect(() =>
        createTimeline(jsPsych, { sequence_generation: "fixed", max_length: 10 })
      ).toThrow(/covers sequence lengths 2-9/);

      expect(() =>
        createTimeline(jsPsych, {
          sequence_generation: "fixed",
          blocks: [
            { x: 10, y: 10 },
            { x: 20, y: 20 },
          ],
        })
      ).toThrow(/requires at least 9 blocks, got 2/);
    });

    it("should reject block layouts too small to generate a sequence", () => {
      // A single block with allow_repeats: false has no legal successor, which
      // would otherwise spin forever in the rejection loop.
      expect(() =>
        createTimeline(jsPsych, {
          blocks: [{ x: 50, y: 50 }],
          sequence_generation: "random",
          allow_repeats: false,
        })
      ).toThrow(/blocks must contain at least 2 positions/);
    });

    it("should reject out-of-range counts and durations", () => {
      expect(() => createTimeline(jsPsych, { trials_per_length: 0 })).toThrow(
        /trials_per_length must be an integer >= 1/
      );
      expect(() => createTimeline(jsPsych, { stimulus_duration: -1 })).toThrow(
        /stimulus_duration must be a duration in milliseconds >= 0/
      );
      expect(() => createTimeline(jsPsych, { response_timeout: 0 })).toThrow(
        /response_timeout must be null \(no limit\) or a positive number/
      );
      expect(() => createTimeline(jsPsych, { block_size: 0 })).toThrow(
        /block_size is a percentage of the display/
      );
    });

    it("should score the span as the longest length passed, not the length failed", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 2,
        max_length: 5,
        trials_per_length: 2,
      });

      // Passed length 2, failed both trials at length 3. Span is 2.
      [
        { sequence_length: 2, correct: true },
        { sequence_length: 2, correct: true },
        { sequence_length: 3, correct: false },
        { sequence_length: 3, correct: false },
      ].forEach((trial) =>
        jsPsych.data.get().push({ task: "corsi-block", phase: "test", part: "response", ...trial })
      );

      const scoringTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const row: any = {};
      scoringTrial.on_finish(row);

      expect(row.corsi_span).toBe(2);
    });

    it("should not award max_length when the final length was failed", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 2,
        max_length: 3,
        trials_per_length: 2,
      });

      // Reached the ceiling but failed every trial there. Span is 2, not 3.
      [
        { sequence_length: 2, correct: true },
        { sequence_length: 2, correct: true },
        { sequence_length: 3, correct: false },
        { sequence_length: 3, correct: false },
      ].forEach((trial) =>
        jsPsych.data.get().push({ task: "corsi-block", phase: "test", part: "response", ...trial })
      );

      const scoringTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const row: any = {};
      scoringTrial.on_finish(row);

      expect(row.corsi_span).toBe(3 - 1);
    });

    it("should record the span on its own row rather than every row", () => {
      const timeline = createTimeline(jsPsych, { starting_length: 2, max_length: 3 });
      const scoringTrial = timeline.timeline[timeline.timeline.length - 1] as any;

      // A trial belonging to another task in a composed battery
      jsPsych.data.get().push({ task: "some-other-task", trial_index: 0 });
      jsPsych.data.get().push({
        task: "corsi-block",
        phase: "test",
        part: "response",
        sequence_length: 2,
        correct: true,
      });

      const row: any = {};
      scoringTrial.on_finish(row);

      expect(row.corsi_span).toBe(2);
      expect(scoringTrial.data.phase).toBe("scoring");
      // Nothing else in the dataset gained a corsi_span column
      jsPsych.data
        .get()
        .values()
        .forEach((trial: any) => expect(trial.corsi_span).toBeUndefined());
    });

    it("should report undefined measures as null rather than 0", () => {
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.totalTrials).toBe(0);
      expect(summary.correctTrials).toBe(0);
      // 0 is a meaningful accuracy and a meaningful span; absence is not
      expect(summary.accuracy).toBeNull();
      expect(summary.maxLengthAttempted).toBeNull();
      expect(summary.span).toBeNull();
    });

    it("should leave the span undefined when no length was ever passed", () => {
      [
        { sequence_length: 2, correct: false },
        { sequence_length: 2, correct: false },
      ].forEach((trial) =>
        jsPsych.data.get().push({ task: "corsi-block", phase: "test", part: "response", ...trial })
      );

      const summary = utils.scoring.getSummary(jsPsych.data.get());
      expect(summary.span).toBeNull();
      expect(summary.accuracy).toBe(0);
      expect(summary.totalTrials).toBe(2);
    });

    it("should stop repeating the practice once max_practice_attempts is reached", () => {
      const timeline = createTimeline(jsPsych, { max_practice_attempts: 3 });
      const practiceLoop = (timeline.timeline[0] as any).timeline[3];

      const failPractice = () =>
        jsPsych.data
          .get()
          .push({ task: "corsi-block", phase: "practice", part: "instruction", correct: false });

      // Attempts 1 and 2 fail and retry; the third exhausts the allowance
      failPractice();
      expect(practiceLoop.loop_function()).toBe(true);
      failPractice();
      expect(practiceLoop.loop_function()).toBe(true);
      failPractice();
      expect(practiceLoop.loop_function()).toBe(false);
    });

    it.each([
      ["by default", {}],
      ["when max_practice_attempts is null", { max_practice_attempts: null }],
    ])("should repeat the practice indefinitely %s", (_label, config) => {
      const timeline = createTimeline(jsPsych, config);
      const practiceLoop = (timeline.timeline[0] as any).timeline[3];

      for (let attempt = 0; attempt < 25; attempt++) {
        jsPsych.data
          .get()
          .push({ task: "corsi-block", phase: "practice", part: "instruction", correct: false });
        expect(practiceLoop.loop_function()).toBe(true);
      }
    });

    it("should stop repeating the practice as soon as it is passed", () => {
      const timeline = createTimeline(jsPsych, { max_practice_attempts: 3 });
      const practiceLoop = (timeline.timeline[0] as any).timeline[3];

      jsPsych.data
        .get()
        .push({ task: "corsi-block", phase: "practice", part: "instruction", correct: true });

      expect(practiceLoop.loop_function()).toBe(false);
    });

    it("should not read another task's practice trials", () => {
      const timeline = createTimeline(jsPsych, { max_practice_attempts: 3 });
      const practiceLoop = (timeline.timeline[0] as any).timeline[3];
      const practiceFeedback = (timeline.timeline[0] as any).timeline[3].timeline[4];

      // `phase: "practice"` is near-universal across these packages, so a
      // sibling task's row must not be mistaken for this task's response.
      jsPsych.data
        .get()
        .push({ task: "some-other-task", phase: "practice", part: "instruction", correct: true });

      expect(practiceLoop.loop_function()).toBe(false);
      expect(practiceFeedback.stimulus()).toContain("wasn't quite right");

      // ...whereas this task's own correct response is read
      jsPsych.data
        .get()
        .push({ task: "corsi-block", phase: "practice", part: "instruction", correct: true });
      expect(practiceFeedback.stimulus()).toContain("ready to begin");
    });

    it("should not promise another try on the final practice attempt", () => {
      const timeline = createTimeline(jsPsych, { max_practice_attempts: 2 });
      const practiceLoop = (timeline.timeline[0] as any).timeline[3];
      const practiceFeedback = practiceLoop.timeline[4];

      const failPractice = () =>
        jsPsych.data
          .get()
          .push({ task: "corsi-block", phase: "practice", part: "instruction", correct: false });

      failPractice();
      expect(practiceFeedback.stimulus()).toContain("try again");
      expect(practiceLoop.loop_function()).toBe(true);

      failPractice();
      expect(practiceFeedback.stimulus()).toContain("move on to the task");
    });

    it("should reject a practice cap below one attempt", () => {
      expect(() => createTimeline(jsPsych, { max_practice_attempts: 0 })).toThrow(
        /max_practice_attempts must be an integer >= 1/
      );
    });

    it("should scope every trial it creates under the timeline's css class", () => {
      const timeline = createTimeline(jsPsych, {
        starting_length: 2,
        max_length: 4,
        trials_per_length: 2,
      });

      const trials: any[] = [];
      const collect = (node: any) => {
        if (Array.isArray(node)) return node.forEach(collect);
        if (node?.timeline) return collect(node.timeline);
        if (node?.type) trials.push(node);
      };
      collect(timeline);

      expect(trials.length).toBeGreaterThan(0);
      for (const trial of trials) {
        expect(trial.css_classes).toEqual(["jspsych-corsi-block-container"]);
      }
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
        max_length: 8,
        // The fixed table only holds 2 sequences per length
        sequence_generation: "random",
      });
      expect(timeline).toBeDefined();
    });
  });
});
