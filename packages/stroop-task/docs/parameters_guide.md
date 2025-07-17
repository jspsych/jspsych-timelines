# Parameters Customization Guide

## Overview

The Stroop task timeline provides extensive customization options through parameters passed to the `createTimeline()` function. This guide provides detailed explanations, use cases, and examples for each parameter.

## Parameter Categories

### Trial Count Parameters

#### `practice_trials_per_condition`
- **Type**: `number`
- **Default**: `2`
- **Description**: Number of practice trials for each condition (congruent/incongruent)
- **Total Practice Trials**: `practice_trials_per_condition × 2`

**Use Cases:**
- **Minimal Practice**: `1` - Quick familiarization
- **Standard Practice**: `2-3` - Balanced learning opportunity
- **Extended Practice**: `4-6` - Thorough preparation for complex populations

**Example:**
```javascript
// 3 congruent + 3 incongruent = 6 total practice trials
createTimeline(jsPsych, {
    practice_trials_per_condition: 3
});
```

#### `congruent_main_trials`
- **Type**: `number`
- **Default**: `4`
- **Description**: Number of congruent trials in main experiment
- **Range**: Typically 4-20 per condition

**Considerations:**
- **Statistical Power**: More trials = better reliability
- **Participant Fatigue**: Balance precision with engagement
- **Time Constraints**: Each trial ~3-5 seconds

#### `incongruent_main_trials`
- **Type**: `number`
- **Default**: `4`
- **Description**: Number of incongruent trials in main experiment
- **Balance**: Should typically match `congruent_main_trials`

**Example:**
```javascript
// Balanced design with 12 trials per condition
createTimeline(jsPsych, {
    congruent_main_trials: 12,
    incongruent_main_trials: 12
});
```

### Timing Parameters

#### `trial_timeout`
- **Type**: `number`
- **Default**: `3000` (3 seconds)
- **Description**: Maximum time allowed for each response
- **Units**: Milliseconds

**Guidelines:**
- **Fast Response**: `1500-2000ms` - Emphasizes speed
- **Standard**: `3000ms` - Balanced speed/accuracy
- **Extended**: `5000ms` - Accommodates slower populations

**Population Considerations:**
```javascript
// Children or older adults
createTimeline(jsPsych, {
    trial_timeout: 5000
});

// Speed emphasis
createTimeline(jsPsych, {
    trial_timeout: 1500
});
```

#### `fixation_duration`
- **Type**: `{ min: number, max: number }`
- **Default**: `{ min: 300, max: 1500 }`
- **Description**: Duration range for fixation cross display
- **Units**: Milliseconds

**Purpose:**
- **Attention Reset**: Prepares focus for next trial
- **Temporal Unpredictability**: Prevents anticipation effects
- **Cognitive Preparation**: Allows mental reset between trials

**Customization:**
```javascript
// Short fixation for fast-paced experiment
createTimeline(jsPsych, {
    fixation_duration: { min: 200, max: 500 }
});

// Longer fixation for detailed analysis
createTimeline(jsPsych, {
    fixation_duration: { min: 800, max: 2000 }
});
```

### Display Parameters

#### `number_of_rows`
- **Type**: `number`
- **Default**: `2`
- **Description**: Number of rows in response button grid
- **Interaction**: Works with `number_of_columns`

#### `number_of_columns`
- **Type**: `number`
- **Default**: `2`
- **Description**: Number of columns in response button grid
- **Constraint**: `rows × columns ≥ number of colors`

**Layout Examples:**
```javascript
// 2×2 grid (default) - good for 4 colors
createTimeline(jsPsych, {
    number_of_rows: 2,
    number_of_columns: 2
});

// 1×4 horizontal layout
createTimeline(jsPsych, {
    number_of_rows: 1,
    number_of_columns: 4
});

// 4×1 vertical layout
createTimeline(jsPsych, {
    number_of_rows: 4,
    number_of_columns: 1
});
```

#### `choice_of_colors`
- **Type**: `string[]`
- **Default**: `['RED', 'GREEN', 'BLUE', 'YELLOW']`
- **Description**: Array of color names to use in experiment
- **Constraints**: Must be valid CSS color names

**Customization Options:**
```javascript
// Reduced color set (fewer conditions)
createTimeline(jsPsych, {
    choice_of_colors: ['RED', 'BLUE']
});

// Extended color set
createTimeline(jsPsych, {
    choice_of_colors: ['RED', 'GREEN', 'BLUE', 'YELLOW', 'PURPLE', 'ORANGE']
});

// Custom color combinations
createTimeline(jsPsych, {
    choice_of_colors: ['RED', 'GREEN', 'BLUE']
});
```

### Control Parameters

#### `show_practice_feedback`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show correctness feedback during practice
- **Duration**: 2 seconds per feedback screen

**Use Cases:**
- **Learning Phase**: `true` - Helps participants understand task
- **Assessment Phase**: `false` - Mimics main experiment conditions
- **Speed Training**: `false` - Reduces interruptions

#### `include_fixation`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show fixation cross between trials
- **Impact**: Affects timing and attention control

#### `show_welcome_and_instructions`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show instruction screens
- **Skip When**: Repeated sessions with same participants

#### `show_results`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show results summary and data export
- **Disable When**: Embedded in larger experiment battery

### Randomization Parameters

#### `randomise_main_trial_condition_order`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to randomize order of main experiment trials
- **Impact**: Controls for order effects

#### `randomise_practice_trial_condition_order`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to randomize order of practice trials
- **Impact**: Prevents systematic learning patterns

#### `randomise_fixation_duration`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to randomize fixation cross duration
- **Alternative**: Uses minimum duration if `false`

## Common Parameter Combinations

### Research Settings

#### Standard Cognitive Research
```javascript
createTimeline(jsPsych, {
    practice_trials_per_condition: 3,
    congruent_main_trials: 20,
    incongruent_main_trials: 20,
    trial_timeout: 3000,
    show_practice_feedback: true,
    include_fixation: true
});
```

#### Clinical Assessment
```javascript
createTimeline(jsPsych, {
    practice_trials_per_condition: 5,
    congruent_main_trials: 15,
    incongruent_main_trials: 15,
    trial_timeout: 5000,
    fixation_duration: { min: 500, max: 1000 },
    show_practice_feedback: true
});
```

#### Quick Screening
```javascript
createTimeline(jsPsych, {
    practice_trials_per_condition: 2,
    congruent_main_trials: 6,
    incongruent_main_trials: 6,
    trial_timeout: 2000,
    show_practice_feedback: false,
    include_fixation: false
});
```

### Educational Settings

#### Classroom Demonstration
```javascript
createTimeline(jsPsych, {
    practice_trials_per_condition: 1,
    congruent_main_trials: 3,
    incongruent_main_trials: 3,
    trial_timeout: 4000,
    choice_of_colors: ['RED', 'BLUE'],
    show_practice_feedback: true
});
```

#### Student Research Project
```javascript
createTimeline(jsPsych, {
    practice_trials_per_condition: 2,
    congruent_main_trials: 8,
    incongruent_main_trials: 8,
    trial_timeout: 3000,
    randomise_main_trial_condition_order: true,
    show_results: true
});
```

### Special Populations

#### Children (Ages 6-12)
```javascript
createTimeline(jsPsych, {
    practice_trials_per_condition: 4,
    congruent_main_trials: 10,
    incongruent_main_trials: 10,
    trial_timeout: 5000,
    fixation_duration: { min: 600, max: 1200 },
    show_practice_feedback: true,
    choice_of_colors: ['RED', 'BLUE', 'GREEN'] // Fewer colors
});
```

#### Older Adults (65+)
```javascript
createTimeline(jsPsych, {
    practice_trials_per_condition: 6,
    congruent_main_trials: 12,
    incongruent_main_trials: 12,
    trial_timeout: 6000,
    fixation_duration: { min: 800, max: 1500 },
    show_practice_feedback: true,
    number_of_rows: 1,
    number_of_columns: 4 // Horizontal layout
});
```

## Parameter Validation

### Automatic Validation
The timeline includes built-in validation for:
- Color array length vs grid dimensions
- Positive trial counts
- Valid timeout values
- Proper duration ranges

### Manual Validation
Always verify:
- Grid can accommodate all colors
- Trial counts provide sufficient power
- Timeout allows reasonable response
- Color names are valid CSS values

## Performance Optimization

### Efficient Settings
- Use minimal practice trials for repeated testing
- Disable fixation for speed-focused experiments
- Reduce color count for simpler analyses
- Turn off results screen for embedded experiments

### Memory Considerations
- Large trial counts increase memory usage
- Multiple color conditions multiply stimuli
- Consider stimulus pre-generation for very large experiments

## Troubleshooting Parameters

### Common Issues

#### Grid Layout Problems
**Problem**: Buttons don't fit properly
**Solution**: Ensure `rows × columns ≥ color count`

#### Timing Issues
**Problem**: Trials feel too fast/slow
**Solution**: Adjust `trial_timeout` and `fixation_duration`

#### Color Display Problems
**Problem**: Colors not displaying correctly
**Solution**: Use standard CSS color names in `choice_of_colors`

#### Data Collection Issues
**Problem**: Insufficient trials for analysis
**Solution**: Increase `congruent_main_trials` and `incongruent_main_trials`