import {
  createSpatialNBackTimeline,
  createPracticeTimeline,
  createMultiLevelNBackTimeline,
  presetConfigurations,
} from './index';

describe('Spatial N-Back Timeline', () => {
  describe('createSpatialNBackTimeline', () => {
    it('should return a timeline object with correct structure', () => {
      const timeline = createSpatialNBackTimeline({ total_trials: 5 });
      
      expect(timeline).toHaveProperty('timeline');
      expect(Array.isArray(timeline.timeline)).toBe(true);
      expect(timeline.timeline.length).toBe(5);
    });

    it('should use default parameters when none provided', () => {
      const timeline = createSpatialNBackTimeline();
      
      expect(timeline.timeline.length).toBe(20); // default total_trials
      expect(timeline.timeline[0]).toHaveProperty('rows', 3);
      expect(timeline.timeline[0]).toHaveProperty('cols', 3);
      expect(timeline.timeline[0]).toHaveProperty('n_back_level', 1);
    });

    it('should set randomize_order when randomize_trials is true', () => {
      const timeline = createSpatialNBackTimeline({ 
        total_trials: 5, 
        randomize_trials: true 
      });
      
      expect(timeline.randomize_order).toBe(true);
    });

    it('should not set randomize_order when randomize_trials is false', () => {
      const timeline = createSpatialNBackTimeline({ 
        total_trials: 5, 
        randomize_trials: false 
      });
      
      expect(timeline.randomize_order).toBeUndefined();
    });

    it('should include instructions trial when include_instructions is true', () => {
      const timeline = createSpatialNBackTimeline({ 
        total_trials: 5, 
        include_instructions: true 
      });
      
      // First trial should be instructions
      expect(timeline.timeline[0].stimulus).toContain('Spatial N-Back Task');
      expect(timeline.timeline.length).toBe(6); // 5 trials + 1 instruction
    });

    it('should pass custom parameters to trial objects', () => {
      const customParams = {
        total_trials: 3,
        rows: 4,
        cols: 5,
        stimulus_color: '#ff0000',
        button_text: 'CUSTOM',
        n_back_level: 2
      };
      
      const timeline = createSpatialNBackTimeline(customParams);
      
      expect(timeline.timeline[0].rows).toBe(4);
      expect(timeline.timeline[0].cols).toBe(5);
      expect(timeline.timeline[0].stimulus_color).toBe('#ff0000');
      expect(timeline.timeline[0].button_text).toBe('CUSTOM');
    });

    it('should generate valid target sequences', () => {
      const timeline = createSpatialNBackTimeline({ 
        total_trials: 10, 
        n_back_level: 2,
        target_percentage: 30
      });
      
      // Check that early trials are not targets (can't be n-back matches)
      expect(timeline.timeline[0].is_target).toBe(false);
      expect(timeline.timeline[1].is_target).toBe(false);
      
      // Check that some trials are targets
      const targets = timeline.timeline.filter(trial => trial.is_target);
      expect(targets.length).toBeGreaterThan(0);
      expect(targets.length).toBeLessThanOrEqual(8); // Max possible with n_back_level=2
    });
  });

  describe('createPracticeTimeline', () => {
    it('should create practice timeline with correct defaults', () => {
      const timeline = createPracticeTimeline();
      
      expect(timeline.timeline.length).toBe(6);
      expect(timeline.timeline[0].show_feedback).toBe(true);
      expect(timeline.timeline[0].target_percentage).toBe(33);
    });

    it('should override defaults with custom parameters', () => {
      const timeline = createPracticeTimeline({ 
        rows: 4, 
        stimulus_color: '#00ff00' 
      });
      
      expect(timeline.timeline[0].rows).toBe(4);
      expect(timeline.timeline[0].stimulus_color).toBe('#00ff00');
      expect(timeline.timeline[0].show_feedback).toBe(true); // Should still be true
    });
  });

  describe('createMultiLevelNBackTimeline', () => {
    it('should create timeline with multiple n-back levels', () => {
      const timeline = createMultiLevelNBackTimeline({ 
        n_back_levels: [1, 2, 3], 
        trials_per_level: 5 
      });
      
      expect(timeline.timeline.length).toBe(3);
      expect(timeline.timeline[0].timeline.length).toBe(5);
      expect(timeline.timeline[1].timeline.length).toBe(5);
      expect(timeline.timeline[2].timeline.length).toBe(5);
    });

    it('should set correct n_back_level for each sub-timeline', () => {
      const timeline = createMultiLevelNBackTimeline({ 
        n_back_levels: [1, 2, 3], 
        trials_per_level: 3 
      });
      
      expect(timeline.timeline[0].timeline[0].n_back_level).toBe(1);
      expect(timeline.timeline[1].timeline[0].n_back_level).toBe(2);
      expect(timeline.timeline[2].timeline[0].n_back_level).toBe(3);
    });

    it('should randomize level order when randomize_levels is true', () => {
      const timeline = createMultiLevelNBackTimeline({ 
        n_back_levels: [1, 2], 
        randomize_levels: true 
      });
      
      expect(timeline.randomize_order).toBe(true);
    });
  });

  describe('presetConfigurations', () => {
    it('easy preset should have correct settings', () => {
      const timeline = presetConfigurations.easy();
      
      expect(timeline.timeline[0].n_back_level).toBe(1);
      expect(timeline.timeline[0].show_feedback).toBe(true);
      expect(timeline.timeline[0].total_trials).toBe(15);
    });

    it('medium preset should have correct settings', () => {
      const timeline = presetConfigurations.medium();
      
      expect(timeline.timeline[0].n_back_level).toBe(2);
      expect(timeline.timeline[0].show_feedback).toBe(false);
      expect(timeline.timeline[0].total_trials).toBe(20);
    });

    it('hard preset should have correct settings', () => {
      const timeline = presetConfigurations.hard();
      
      expect(timeline.timeline[0].n_back_level).toBe(3);
      expect(timeline.timeline[0].rows).toBe(4);
      expect(timeline.timeline[0].cols).toBe(4);
      expect(timeline.timeline[0].total_trials).toBe(25);
    });

    it('research preset should create multi-level timeline', () => {
      const timeline = presetConfigurations.research();
      
      expect(Array.isArray(timeline.timeline)).toBe(true);
      expect(timeline.timeline.length).toBe(3); // 1-back, 2-back, 3-back
    });
  });

  describe('parameter validation', () => {
    it('should handle edge case parameters', () => {
      const timeline = createSpatialNBackTimeline({
        total_trials: 1,
        target_percentage: 0,
        n_back_level: 1
      });
      
      expect(timeline.timeline.length).toBe(1);
      expect(timeline.timeline[0].is_target).toBe(false); // Can't be target with n_back_level=1
    });

    it('should handle high target percentage correctly', () => {
      const timeline = createSpatialNBackTimeline({
        total_trials: 10,
        target_percentage: 90,
        n_back_level: 1
      });
      
      // Should not exceed maximum possible targets
      const targets = timeline.timeline.filter(trial => trial.is_target);
      expect(targets.length).toBeLessThanOrEqual(9); // Max with n_back_level=1 and 10 trials
    });
  });
});