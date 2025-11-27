# Corsi Block Task Examples

This directory contains example implementations of the Corsi Block Task timeline.

## Examples

### [index.html](index.html)
**Basic Example**
- Default settings
- Standard 9-block layout
- Demonstrates basic usage with minimal configuration

### [common-configuration.html](common-configuration.html)
**Common Configuration**
- Uses commonly reported timing parameters
- Blue/Yellow high-contrast color scheme
- Stop when both trials fail at a length
- Fixed pseudorandom sequences
- Comprehensive instructions
- Detailed results display

### [custom-parameters.html](custom-parameters.html)
**Fast Research Variant**
- Faster presentation (500ms vs 1000ms)
- Starts at length 3
- 3 trials per length
- Response timeout enabled
- Custom color theme
- Random sequence generation

### [custom-blocks.html](custom-blocks.html)
**Custom Block Layout**
- Demonstrates custom block positioning
- Uses 5-block cross pattern instead of standard 9 blocks
- Shows how to define custom layouts

### [load-from-unpkg.html](load-from-unpkg.html)
**CDN Loading**
- Shows how to load from unpkg CDN
- No build step required
- Quick demo version

## Running Examples

### Local Development
If you've built the package locally:
```bash
cd packages/corsi-block
npm run build
# Then open any example HTML file in a browser
```

### From CDN
The `load-from-unpkg.html` example can run directly without any build step.

## Common Customizations

### Adjusting Difficulty
```javascript
const corsiTask = jsPsychTimelineCorsiBlock.createTimeline(jsPsych, {
  starting_length: 3,      // Start harder
  max_length: 7,           // End earlier
  trials_per_length: 3     // More trials per level
});
```

### Changing Speed
```javascript
const corsiTask = jsPsychTimelineCorsiBlock.createTimeline(jsPsych, {
  stimulus_duration: 750,           // Faster blocks
  inter_stimulus_interval: 750,     // Faster gaps
  post_sequence_delay: 300          // Quicker start
});
```

### Custom Colors
```javascript
const corsiTask = jsPsychTimelineCorsiBlock.createTimeline(jsPsych, {
  block_colors: {
    inactive: '#4a90e2',
    active: '#f39c12',
    correct: '#2ecc71',
    incorrect: '#e74c3c'
  },
  background_color: '#2c3e50'
});
```

### Mobile-Optimized
All examples include:
- Viewport meta tags for proper mobile scaling
- `touch-action: manipulation` for better touch response
- `user-scalable=no` to prevent accidental zooming

## Data Access

After task completion:
```javascript
on_finish: function() {
  // Get the calculated span
  const span = jsPsych.data.get().values()[0].corsi_span;

  // Get all input trials
  const trials = jsPsych.data.get().filter({
    task: 'corsi-block',
    phase: 'input'
  });

  // Calculate accuracy
  const accuracy = trials.filter({ correct: true }).count() / trials.count();
}
```

## Note on Parameters

The examples show various parameter configurations. The "common configuration" example uses parameters that are frequently reported in the literature (e.g., 1000ms stimulus duration), but you should choose parameters appropriate for your specific research question and population.
