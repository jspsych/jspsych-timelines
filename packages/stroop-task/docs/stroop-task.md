# Stroop Task Documentation

## Data Handling

### Overview

The Stroop task timeline automatically collects and processes experimental data throughout the experiment. This document explains the data structure, variable meanings, collection methods, and export options.

### Data Collection Points

#### Trial-Level Data
Each trial in the experiment generates a data object with the following structure:

```javascript
interface TrialData {
    task: string;           // Trial type identifier
    word?: string;          // Stimulus word presented
    color?: string;         // Ink color of the word
    correct_response?: number; // Index of correct response
    congruent?: boolean;    // Whether word matches ink color
    correct?: boolean;      // Whether response was correct
    rt?: number;           // Response time in milliseconds
    response?: number;     // Participant's response (button index)
    trial_type: string;    // jsPsych plugin type
    trial_index: number;   // Sequential trial number
    time_elapsed: number;  // Time since experiment start
}
```

#### Data Collection Phases

##### 1. Instructions Phase
- **task**: `"instructions"`
- **Data Purpose**: Navigation timing and page views
- **Key Variables**: `view_history`, `rt` (time per page)

##### 2. Fixation Trials
- **task**: `"fixation"`
- **Data Purpose**: Timing validation and attention monitoring
- **Key Variables**: `trial_duration`, `stimulus` ("+")

##### 3. Practice Trials
- **task**: `"practice"`
- **Data Purpose**: Learning curve analysis and validation
- **Key Variables**: All stimulus and response variables
- **Special Features**: Includes feedback timing data

##### 4. Main Experiment Trials
- **task**: `"response"`
- **Data Purpose**: Primary data collection for analysis
- **Key Variables**: All stimulus and response variables
- **Critical Fields**: `rt`, `correct`, `congruent`

##### 5. Results Phase
- **task**: `"results"`
- **Data Purpose**: Experiment completion confirmation
- **Key Variables**: Display duration, data export actions

### Variable Definitions

#### Stimulus Variables

##### `word` (string)
- **Values**: "RED", "GREEN", "BLUE", "YELLOW" (or custom colors)
- **Purpose**: The text content of the stimulus
- **Usage**: Congruency calculation, stimulus categorization

##### `color` (string)
- **Values**: "red", "green", "blue", "yellow" (lowercase CSS colors)
- **Purpose**: The ink color of the presented word
- **Usage**: Correct response determination, congruency analysis

##### `correct_response` (number)
- **Values**: 0, 1, 2, 3 (array indices)
- **Purpose**: Index of the correct response button
- **Mapping**: Corresponds to position in `choice_of_colors` array
- **Example**: If colors are ["RED", "GREEN", "BLUE", "YELLOW"], green ink = index 1

##### `congruent` (boolean)
- **Values**: `true` or `false`
- **Purpose**: Whether word meaning matches ink color
- **Calculation**: `word === color.name.toUpperCase()`
- **Usage**: Stroop effect analysis, condition categorization

#### Response Variables

##### `response` (number)
- **Values**: 0, 1, 2, 3 (button indices) or `null` (timeout)
- **Purpose**: Participant's actual response
- **Mapping**: Index of clicked button in response array
- **Timeout**: `null` if no response within time limit

##### `rt` (number)
- **Values**: Milliseconds from stimulus onset
- **Purpose**: Response time measurement
- **Precision**: JavaScript timestamp precision
- **Null Handling**: `null` for timeout trials

##### `correct` (boolean)
- **Values**: `true` or `false`
- **Calculation**: `response === correct_response`
- **Purpose**: Accuracy analysis
- **Computed**: Automatically calculated in `on_finish`

#### Task Management Variables

##### `task` (string)
- **Values**: "instructions", "fixation", "practice", "response", "results"
- **Purpose**: Trial type identification for filtering
- **Usage**: Data analysis, progress tracking

##### `trial_index` (number)
- **Values**: Sequential integers starting from 0
- **Purpose**: Trial order tracking
- **Usage**: Timeline analysis, debugging

##### `time_elapsed` (number)
- **Values**: Milliseconds since experiment start
- **Purpose**: Overall experiment timing
- **Usage**: Fatigue analysis, session duration

### Data Processing

#### Results Compilation
The `createResults()` function automatically calculates:

##### Performance Metrics
- **Overall Accuracy**: `correctTrials.count() / totalTrials.count()`
- **Congruent Accuracy**: `congruentCorrect.count() / congruentTrials.count()`
- **Incongruent Accuracy**: `incongruentCorrect.count() / incongruentTrials.count()`

##### Response Time Analysis
- **Congruent RT**: `congruentCorrect.select('rt').mean()`
- **Incongruent RT**: `incongruentCorrect.select('rt').mean()`
- **Stroop Effect**: `incongruentRt - congruentRt`

#### Data Filtering

##### By Trial Type
```javascript
// Get only main experiment trials
const mainTrials = jsPsych.data.get().filter({ task: 'response' });

// Get only practice trials
const practiceTrials = jsPsych.data.get().filter({ task: 'practice' });
```

##### By Condition
```javascript
// Get congruent trials
const congruentTrials = jsPsych.data.get().filter({ 
    task: 'response', 
    congruent: true 
});

// Get incongruent trials
const incongruentTrials = jsPsych.data.get().filter({ 
    task: 'response', 
    congruent: false 
});
```

##### By Accuracy
```javascript
// Get correct responses only
const correctTrials = jsPsych.data.get().filter({ 
    task: 'response', 
    correct: true 
});
```

### Data Export

#### Built-in Export
- **Trigger**: "Download Data" button in results screen
- **Method**: `jsPsych.data.displayData()`
- **Format**: JSON structure with all trial data

#### Custom Export Options

##### CSV Export
```javascript
// Export as CSV
const csvData = jsPsych.data.get().csv();
```

##### JSON Export
```javascript
// Export as JSON
const jsonData = jsPsych.data.get().json();
```

##### Filtered Export
```javascript
// Export only main trials
const mainTrialsData = jsPsych.data.get()
    .filter({ task: 'response' })
    .csv();
```

### Data Validation

#### Response Validation
- **Range Check**: Response indices must be within button array bounds
- **Type Check**: Response must be number or null
- **Timeout Handling**: Null responses flagged appropriately

#### Timing Validation
- **RT Bounds**: Response times should be > 0 and < trial_duration
- **Sequence Check**: Trial indices should be sequential
- **Duration Check**: time_elapsed should be monotonically increasing

#### Data Integrity
- **Required Fields**: All stimulus variables must be present for response trials
- **Consistency**: congruent field must match word/color relationship
- **Completeness**: No missing data for completed trials

### Analysis Recommendations

#### Primary Measures
1. **Stroop Effect**: Difference in RT between incongruent and congruent trials
2. **Accuracy**: Overall and by condition
3. **Response Time**: Central tendency and variability measures

#### Secondary Measures
1. **Practice Effects**: Accuracy improvement during practice
2. **Fatigue Effects**: RT changes over time
3. **Error Analysis**: Types and patterns of incorrect responses

#### Statistical Considerations
- **Outlier Removal**: Consider RT cutoffs (e.g., < 200ms, > 3000ms)
- **Normality**: RT distributions often require transformation
- **Individual Differences**: Account for baseline RT differences

### Troubleshooting Data Issues

#### Common Problems

##### Missing Data
- **Cause**: Timeout trials, navigation errors
- **Solution**: Check trial_duration settings, validate responses

##### Incorrect Mapping
- **Cause**: Mismatched response indices
- **Solution**: Verify choice_of_colors array consistency

##### Timing Issues
- **Cause**: System performance, browser differences
- **Solution**: Validate RT distributions, consider exclusion criteria

#### Data Quality Checks
- Verify response distribution across buttons
- Check for systematic biases in RT
- Validate practice vs main trial differences
- Confirm congruency effect presence

## Parameters Customization Guide

### Overview

The Stroop task timeline provides extensive customization options through parameters passed to the `createTimeline()` function. This guide provides detailed explanations, use cases, and examples for each parameter.

### Parameter Categories

#### Trial Count Parameters

##### `practice_trials_per_condition`
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

##### `congruent_main_trials`
- **Type**: `number`
- **Default**: `4`
- **Description**: Number of congruent trials in main experiment
- **Range**: Typically 4-20 per condition

**Considerations:**
- **Statistical Power**: More trials = better reliability
- **Participant Fatigue**: Balance precision with engagement
- **Time Constraints**: Each trial ~3-5 seconds

##### `incongruent_main_trials`
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

#### Timing Parameters

##### `trial_timeout`
- **Type**: `number`
- **Default**: `3000` (3 seconds)
- **Description**: Maximum time allowed for each response
- **Units**: Milliseconds

**Guidelines:**
- **Fast Response**: `1500-2000ms` - Emphasizes speed
- **Standard**: `3000ms` - Balanced speed/accuracy
- **Extended**: `5000ms` - Accommodates slower populations

##### `fixation_duration`
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

#### Display Parameters

##### `number_of_rows`
- **Type**: `number`
- **Default**: `2`
- **Description**: Number of rows in response button grid
- **Interaction**: Works with `number_of_columns`

##### `number_of_columns`
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

##### `choice_of_colors`
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

#### Control Parameters

##### `show_practice_feedback`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show correctness feedback during practice
- **Duration**: 2 seconds per feedback screen

**Use Cases:**
- **Learning Phase**: `true` - Helps participants understand task
- **Assessment Phase**: `false` - Mimics main experiment conditions
- **Speed Training**: `false` - Reduces interruptions

##### `include_fixation`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show fixation cross between trials
- **Impact**: Affects timing and attention control

##### `show_welcome_and_instructions`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show instruction screens
- **Skip When**: Repeated sessions with same participants

##### `show_results`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show results summary and data export
- **Disable When**: Embedded in larger experiment battery

#### Randomization Parameters

##### `randomise_main_trial_condition_order`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to randomize order of main experiment trials
- **Impact**: Controls for order effects

##### `randomise_practice_trial_condition_order`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to randomize order of practice trials
- **Impact**: Prevents systematic learning patterns

##### `randomise_fixation_duration`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to randomize fixation cross duration
- **Alternative**: Uses minimum duration if `false`

### Common Parameter Combinations

#### Research Settings

##### Standard Cognitive Research
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

### Parameter Validation

#### Automatic Validation
The timeline includes built-in validation for:
- Color array length vs grid dimensions
- Positive trial counts
- Valid timeout values
- Proper duration ranges

#### Manual Validation
Always verify:
- Grid can accommodate all colors
- Trial counts provide sufficient power
- Timeout allows reasonable response
- Color names are valid CSS values

### Performance Optimization

#### Efficient Settings
- Use minimal practice trials for repeated testing
- Disable fixation for speed-focused experiments
- Reduce color count for simpler analyses
- Turn off results screen for embedded experiments

#### Memory Considerations
- Large trial counts increase memory usage
- Multiple color conditions multiply stimuli
- Consider stimulus pre-generation for very large experiments

### Troubleshooting Parameters

#### Common Issues

##### Grid Layout Problems
**Problem**: Buttons don't fit properly
**Solution**: Ensure `rows × columns ≥ color count`

##### Timing Issues
**Problem**: Trials feel too fast/slow
**Solution**: Adjust `trial_timeout` and `fixation_duration`

##### Color Display Problems
**Problem**: Colors not displaying correctly
**Solution**: Use standard CSS color names in `choice_of_colors`

##### Data Collection Issues
**Problem**: Insufficient trials for analysis
**Solution**: Increase `congruent_main_trials` and `incongruent_main_trials`

## Timeline Flow

### 1. Welcome & Instructions Phase
- **Component**: `createWelcomeAndInstructions()`
- **Purpose**: Introduce participants to the task and provide clear instructions
- **Structure**: Multi-page instruction sequence using jsPsych Instructions plugin
- **Navigation**: Click-through pages with previous/next buttons and arrow key support

**Page Sequence:**
1. Welcome screen
2. Task explanation (color words presentation)
3. Ink color vs word meaning distinction
4. Visual examples of response buttons
5. Practice examples
6. Speed and accuracy emphasis

### 2. Practice Phase
- **Purpose**: Familiarize participants with the task before data collection
- **Structure**: Controlled set of practice trials with feedback

**Practice Trial Structure:**
```
For each practice stimulus:
  → Fixation Cross (optional, randomized duration)
  → Stroop Trial (word in colored ink)
  → Feedback (optional, shows correctness)
```

**Practice Stimuli Generation:**
- Equal number of congruent and incongruent trials per condition
- Congruent: Word matches ink color (RED in red ink)
- Incongruent: Word doesn't match ink color (RED in blue ink)
- Randomization: Optional shuffling of trial order

### 3. Practice Debrief
- **Component**: `createPracticeDebrief()`
- **Purpose**: Transition from practice to main experiment
- **Content**: Reinforcement of instructions and encouragement

### 4. Main Experiment Phase
- **Purpose**: Data collection phase
- **Structure**: Controlled presentation of stimuli without feedback

**Main Trial Structure:**
```
For each main stimulus:
  → Fixation Cross (optional, randomized duration)
  → Stroop Trial (word in colored ink)
  → [No feedback - direct to next trial]
```

**Main Stimuli Generation:**
- Separate control over congruent and incongruent trial counts
- Independent randomization of trial order
- State tracking for progress monitoring

### 5. Results Phase
- **Component**: `createResults()`
- **Purpose**: Display performance summary and data export
- **Calculations**: Automatic Stroop effect computation

## Randomization Logic

### Practice Trials
- **When**: `randomise_practice_trial_condition_order = true`
- **What**: Shuffles combined congruent and incongruent practice stimuli
- **Purpose**: Prevents predictable patterns during learning

### Main Trials
- **When**: `randomise_main_trial_condition_order = true`
- **What**: Shuffles combined congruent and incongruent main stimuli
- **Purpose**: Controls for order effects in data collection

### Fixation Duration
- **When**: `randomise_fixation_duration = true`
- **Range**: Configurable min/max duration (default: 300-1500ms)
- **Purpose**: Prevents temporal predictability