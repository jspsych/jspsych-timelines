import { createTimeline, createPracticeTimeline, createMultiLevelNBackTimeline, presetConfigurations } from "./index";

/* Test suite for Spatial N-Back Timeline 
  In-depth HTML testing is in the Spatial N-Back plugin. */
describe('createTimeline', () => {
  it('should create timeline with default parameters', () => {
    const timeline = createTimeline();
    expect(timeline.timeline).toHaveLength(20);
    expect(timeline.randomize_order).toBe(false);
    expect(timeline.timeline[0].rows).toBe(3);
    expect(timeline.timeline[0].cols).toBe(3);
    expect(timeline.timeline[0].data.n_back).toBe(1);
  });

  it('should create timeline with custom total_trials', () => {
    const timeline = createTimeline({ total_trials: 25 });
    expect(timeline.timeline).toHaveLength(25);
  });

  it('should create timeline with custom grid dimensions', () => {
    const timeline = createTimeline({ rows: 4, cols: 5 });
    expect(timeline.timeline[0].rows).toBe(4);
    expect(timeline.timeline[0].cols).toBe(5);
  });

  it('should set correct n_back in trial data', () => {
    const timeline = createTimeline({ n_back: 3 });
    timeline.timeline.forEach(trial => {
      expect(trial.data.n_back).toBe(3);
    });
  });

  it('should include instructions when specified', () => {
    const timeline = createTimeline({ include_instructions: true });
    expect(timeline.timeline).toHaveLength(2);
    expect(timeline.timeline[0].show_clickable_nav).toBeTruthy();
  });

  it('should randomize trials when specified', () => {
    const timeline = createTimeline({ randomize_trials: true });
    expect(timeline.randomize_order).toBe(true);
  });

  it('should set correct trial properties', () => {
    const timeline = createTimeline({
      stimulus_duration: 1000,
      button_text: 'CLICK',
      cell_size: 200
    });
    
    expect(timeline.timeline[0].stimulus_duration).toBe(1000);
    expect(timeline.timeline[0].button_text).toBe('CLICK');
    expect(timeline.timeline[0].cell_size).toBe(200);
  });

  it('should generate correct trial numbers in data', () => {
    const timeline = createTimeline({ total_trials: 5 });
    timeline.timeline.forEach((trial, index) => {
      expect(trial.data.trial_number).toBe(index + 1);
      expect(trial.data.task).toBe('spatial-nback');
    });
  });
});

describe('createPracticeTimeline', () => {
  it('should create practice timeline with default 6 trials', () => {
    const timeline = createPracticeTimeline();
    expect(timeline.timeline).toHaveLength(2); // instructions + task
    expect(timeline.timeline[1].timeline).toHaveLength(6);
  });

  it('should enable feedback by default', () => {
    const timeline = createPracticeTimeline();
    const taskTimeline = timeline.timeline[1];
    expect(taskTimeline.timeline[0].show_feedback_text).toBe(true);
    expect(taskTimeline.timeline[0].show_feedback_border).toBe(true);
  });

  it('should accept custom options', () => {
    const timeline = createPracticeTimeline({ n_back: 2 });
    const taskTimeline = timeline.timeline[1];
    expect(taskTimeline.timeline[0].data.n_back).toBe(2);
  });
});

describe('createMultiLevelNBackTimeline', () => {
  it('should create timeline with multiple levels', () => {
    const timeline = createMultiLevelNBackTimeline({
      n_backs: [1, 2, 3],
      trials_per_level: 10
    });
    
    expect(timeline.timeline).toHaveLength(3);
    expect(timeline.timeline[0].timeline).toHaveLength(10);
    expect(timeline.timeline[1].timeline).toHaveLength(10);
    expect(timeline.timeline[2].timeline).toHaveLength(10);
  });

  it('should set correct n_back for each level', () => {
    const timeline = createMultiLevelNBackTimeline({
      n_backs: [1, 3],
      trials_per_level: 5
    });
    
    expect(timeline.timeline[0].timeline[0].data.n_back).toBe(1);
    expect(timeline.timeline[1].timeline[0].data.n_back).toBe(3);
  });

  it('should randomize levels when specified', () => {
    const timeline = createMultiLevelNBackTimeline({
      randomize_levels: true
    });
    
    expect(timeline.randomize_order).toBe(true);
  });
});

describe('presetConfigurations', () => {
  it('should create easy preset with correct parameters', () => {
    const timeline = presetConfigurations.easy();
    expect(timeline.timeline).toHaveLength(20);
    expect(timeline.timeline[0].data.n_back).toBe(1);
    expect(timeline.timeline[0].show_feedback_text).toBe(true);
  });

  it('should create medium preset with correct parameters', () => {
    const timeline = presetConfigurations.medium();
    expect(timeline.timeline).toHaveLength(30);
    expect(timeline.timeline[0].data.n_back).toBe(2);
    expect(timeline.timeline[0].show_feedback_text).toBe(false);
  });

  it('should create hard preset with correct parameters', () => {
    const timeline = presetConfigurations.hard();
    expect(timeline.timeline).toHaveLength(40);
    expect(timeline.timeline[0].data.n_back).toBe(3);
    expect(timeline.timeline[0].rows).toBe(4);
    expect(timeline.timeline[0].cols).toBe(4);
  });

  it('should create research preset with multi-level timeline', () => {
    const timeline = presetConfigurations.research();
    expect(timeline.timeline).toHaveLength(3);
    expect(timeline.randomize_order).toBe(true);
    
    // Check each level has 50 trials
    timeline.timeline.forEach(levelTimeline => {
      expect(levelTimeline.timeline).toHaveLength(50);
    });
  });
});

describe('timeline instruction customization', () => {

  it('should replace placeholders in trial prompt', () => {
    const timeline = createTimeline({
      prompt: "Level {n_back}, Trial {trial} of {total}",
      n_back: 2,
      total_trials: 5
    });
    
    expect(timeline.timeline[0].instructions).toBe("Level 2, Trial 1 of 5");
    expect(timeline.timeline[4].instructions).toBe("Level 2, Trial 5 of 5");
  });
});

describe('timeline structure validation', () => {
  it('should ensure first n trials are never targets', () => {
    const timeline = createTimeline({ n_back: 3, total_trials: 10 });
    
    expect(timeline.timeline[0].is_target).toBe(false);
    expect(timeline.timeline[1].is_target).toBe(false);
    expect(timeline.timeline[2].is_target).toBe(false);
  });

  it('should maintain consistent data structure across trials', () => {
    const timeline = createTimeline({ total_trials: 5 });
    
    timeline.timeline.forEach(trial => {
      expect(trial.data).toHaveProperty('trial_number');
      expect(trial.data).toHaveProperty('n_back');
      expect(trial.data).toHaveProperty('total_trials');
      expect(trial.data).toHaveProperty('task');
    });
  });
});
