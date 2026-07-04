import { JsPsych, initJsPsych } from "jspsych";
import { createTimeline, createPracticeTimeline, createMultiLevelNBackTimeline, presetConfigurations, createGridHTML } from "./index";

/* Test suite for Spatial N-Back Timeline
  In-depth HTML testing is in the Spatial N-Back plugin. */
describe('createTimeline', () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it('should create timeline with default parameters', () => {
    const timeline = createTimeline(jsPsych);
    expect(timeline.timeline).toHaveLength(20);
    expect(timeline.timeline[0].rows).toBe(3);
    expect(timeline.timeline[0].cols).toBe(3);
    expect(timeline.timeline[0].data.n_back).toBe(1);
  });

  it('should create timeline with custom total_trials', () => {
    const timeline = createTimeline(jsPsych, { total_trials: 25 });
    expect(timeline.timeline).toHaveLength(25);
  });

  it('should create timeline with custom grid dimensions', () => {
    const timeline = createTimeline(jsPsych, { rows: 4, cols: 5 });
    expect(timeline.timeline[0].rows).toBe(4);
    expect(timeline.timeline[0].cols).toBe(5);
  });

  it('should set correct n_back in trial data', () => {
    const timeline = createTimeline(jsPsych, { n_back: 3 });
    timeline.timeline.forEach(trial => {
      expect(trial.data.n_back).toBe(3);
    });
  });

  it('should include instructions when specified', () => {
    const timeline = createTimeline(jsPsych, { include_instructions: true });
    expect(timeline.timeline).toHaveLength(2);
    expect(timeline.timeline[0].show_clickable_nav).toBeTruthy();
  });

  it('should set correct trial properties', () => {
    const timeline = createTimeline(jsPsych, {
      stimulus_duration: 1000,
      buttons: ['CLICK'],
      cell_size: 200
    });

    expect(timeline.timeline[0].stimulus_duration).toBe(1000);
    expect(timeline.timeline[0].buttons).toEqual(['CLICK']);
    expect(timeline.timeline[0].cell_size).toBe(200);
  });

  it('should generate correct trial numbers in data', () => {
    const timeline = createTimeline(jsPsych, { total_trials: 5 });
    timeline.timeline.forEach((trial, index) => {
      expect(trial.data.trial_number).toBe(index + 1);
      expect(trial.data.task).toBe('spatial-nback');
    });
  });
});

describe('createPracticeTimeline', () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it('should create practice timeline with default 5 trials', () => {
    const timeline = createPracticeTimeline(jsPsych);
    expect(timeline.timeline).toHaveLength(5);
  });

  it('should enable feedback by default', () => {
    const timeline = createPracticeTimeline(jsPsych);
    expect(timeline.timeline[0].show_feedback_text).toBe(true);
    expect(timeline.timeline[0].show_feedback_border).toBe(true);
  });

  it('should accept custom options', () => {
    const timeline = createPracticeTimeline(jsPsych, { n_back: 2 });
    expect(timeline.timeline[0].data.n_back).toBe(2);
  });
});

describe('createMultiLevelNBackTimeline', () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it('should create timeline with multiple levels', () => {
    const timeline = createMultiLevelNBackTimeline(jsPsych, {
      n_backs: [1, 2, 3],
      trials_per_level: 10
    });

    expect(timeline.timeline).toHaveLength(3);
    expect(timeline.timeline[0].timeline).toHaveLength(10);
    expect(timeline.timeline[1].timeline).toHaveLength(10);
    expect(timeline.timeline[2].timeline).toHaveLength(10);
  });

  it('should set correct n_back for each level', () => {
    const timeline = createMultiLevelNBackTimeline(jsPsych, {
      n_backs: [1, 3],
      trials_per_level: 5
    });

    expect(timeline.timeline[0].timeline[0].data.n_back).toBe(1);
    expect(timeline.timeline[1].timeline[0].data.n_back).toBe(3);
  });

  it('should randomize levels when specified', () => {
    const timeline = createMultiLevelNBackTimeline(jsPsych, {
      randomize_levels: true
    });

    expect(timeline.randomize_order).toBe(true);
  });
});

describe('presetConfigurations', () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it('should create easy preset with correct parameters', () => {
    const timeline = presetConfigurations.easy(jsPsych);
    expect(timeline.timeline).toHaveLength(20);
    expect(timeline.timeline[0].data.n_back).toBe(1);
    expect(timeline.timeline[0].show_feedback_text).toBe(true);
  });

  it('should create medium preset with correct parameters', () => {
    const timeline = presetConfigurations.medium(jsPsych);
    expect(timeline.timeline).toHaveLength(30);
    expect(timeline.timeline[0].data.n_back).toBe(2);
    expect(timeline.timeline[0].show_feedback_text).toBe(false);
  });

  it('should create hard preset with correct parameters', () => {
    const timeline = presetConfigurations.hard(jsPsych);
    expect(timeline.timeline).toHaveLength(40);
    expect(timeline.timeline[0].data.n_back).toBe(3);
    expect(timeline.timeline[0].rows).toBe(4);
    expect(timeline.timeline[0].cols).toBe(4);
  });

  it('should create research preset with multi-level timeline', () => {
    const timeline = presetConfigurations.research(jsPsych);
    expect(timeline.timeline).toHaveLength(3);
    expect(timeline.randomize_order).toBe(true);

    // Check each level has 50 trials
    timeline.timeline.forEach(levelTimeline => {
      expect(levelTimeline.timeline).toHaveLength(50);
    });
  });
});

describe('timeline instruction customization', () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it('should replace placeholders in trial prompt', () => {
    const timeline = createTimeline(jsPsych, {
      prompt: "Level {n_back}, Trial {trial} of {total}",
      n_back: 2,
      total_trials: 5
    });

    expect(timeline.timeline[0].instructions).toBe("<p>Level 2, Trial 1 of 5</p>");
    expect(timeline.timeline[4].instructions).toBe("<p>Level 2, Trial 5 of 5</p>");
  });

  it('should use custom prompt parameter when provided', () => {
    const customPrompt = "Custom instruction: Position {n_back} back (Trial {trial}/{total})";
    const timeline = createTimeline(jsPsych, {
      prompt: customPrompt,
      n_back: 1,
      total_trials: 3
    });

    expect(timeline.timeline[0].instructions).toBe("<p>Custom instruction: Position 1 back (Trial 1/3)</p>");
    expect(timeline.timeline[1].instructions).toBe("<p>Custom instruction: Position 1 back (Trial 2/3)</p>");
    expect(timeline.timeline[2].instructions).toBe("<p>Custom instruction: Position 1 back (Trial 3/3)</p>");
  });
});

describe('timeline structure validation', () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it('should ensure first n trials are never targets', () => {
    const timeline = createTimeline(jsPsych, { n_back: 3, total_trials: 10 });

    expect(timeline.timeline[0].is_target).toBe(false);
    expect(timeline.timeline[1].is_target).toBe(false);
    expect(timeline.timeline[2].is_target).toBe(false);
  });

  it('should maintain consistent data structure across trials', () => {
    const timeline = createTimeline(jsPsych, { total_trials: 5 });

    timeline.timeline.forEach(trial => {
      expect(trial.data).toHaveProperty('trial_number');
      expect(trial.data).toHaveProperty('n_back');
      expect(trial.data).toHaveProperty('total_trials');
      expect(trial.data).toHaveProperty('task');
    });
  });
});

describe('createGridHTML', () => {
  it('should create grid with default parameters', () => {
    const html = createGridHTML();
    expect(html).toContain('id="nback-grid"');
    expect(html).toContain('id="cell-0-0"');
    expect(html).toContain('id="cell-2-2"');
  });

  it('should create grid with custom dimensions', () => {
    const html = createGridHTML({ rows: 4, cols: 5 });
    expect(html).toContain('id="cell-0-0"');
    expect(html).toContain('id="cell-3-4"');
    expect(html).not.toContain('id="cell-4-0"');
  });

  it('should use custom cell size', () => {
    const html = createGridHTML({ cell_size: 100 });
    expect(html).toContain('width: 100px');
    expect(html).toContain('height: 100px');
  });

  it('should highlight specified position', () => {
    const html = createGridHTML({
      highlight_position: { row: 1, col: 1 },
      highlight_color: "#FF0000"
    });
    expect(html).toContain('background-color: #FF0000');
  });

  it('should not highlight any position when highlight_position is null', () => {
    const html = createGridHTML({ highlight_position: null });
    expect(html).not.toContain('background-color');
  });
});
