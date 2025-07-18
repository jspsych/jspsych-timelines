# Data Handling

## Overview

The Stroop task timeline automatically collects and processes experimental data throughout the experiment. This document explains the data structure, variable meanings, collection methods, and export options.

## Data Collection Points

### Trial-Level Data
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

### Data Collection Phases

#### 1. Instructions Phase
- **task**: `"instructions"`
- **Data Purpose**: Navigation timing and page views
- **Key Variables**: `view_history`, `rt` (time per page)

#### 2. Fixation Trials
- **task**: `"fixation"`
- **Data Purpose**: Timing validation and attention monitoring
- **Key Variables**: `trial_duration`, `stimulus` ("+")

#### 3. Practice Trials
- **task**: `"practice"`
- **Data Purpose**: Learning curve analysis and validation
- **Key Variables**: All stimulus and response variables
- **Special Features**: Includes feedback timing data

#### 4. Main Experiment Trials
- **task**: `"response"`
- **Data Purpose**: Primary data collection for analysis
- **Key Variables**: All stimulus and response variables
- **Critical Fields**: `rt`, `correct`, `congruent`

#### 5. Results Phase
- **task**: `"results"`
- **Data Purpose**: Experiment completion confirmation
- **Key Variables**: Display duration, data export actions

## Variable Definitions

### Stimulus Variables

#### `word` (string)
- **Values**: "RED", "GREEN", "BLUE", "YELLOW" (or custom colors)
- **Purpose**: The text content of the stimulus
- **Usage**: Congruency calculation, stimulus categorization

#### `color` (string)
- **Values**: "red", "green", "blue", "yellow" (lowercase CSS colors)
- **Purpose**: The ink color of the presented word
- **Usage**: Correct response determination, congruency analysis

#### `correct_response` (number)
- **Values**: 0, 1, 2, 3 (array indices)
- **Purpose**: Index of the correct response button
- **Mapping**: Corresponds to position in `choice_of_colors` array
- **Example**: If colors are ["RED", "GREEN", "BLUE", "YELLOW"], green ink = index 1

#### `congruent` (boolean)
- **Values**: `true` or `false`
- **Purpose**: Whether word meaning matches ink color
- **Calculation**: `word === color.name.toUpperCase()`
- **Usage**: Stroop effect analysis, condition categorization

### Response Variables

#### `response` (number)
- **Values**: 0, 1, 2, 3 (button indices) or `null` (timeout)
- **Purpose**: Participant's actual response
- **Mapping**: Index of clicked button in response array
- **Timeout**: `null` if no response within time limit

#### `rt` (number)
- **Values**: Milliseconds from stimulus onset
- **Purpose**: Response time measurement
- **Precision**: JavaScript timestamp precision
- **Null Handling**: `null` for timeout trials

#### `correct` (boolean)
- **Values**: `true` or `false`
- **Calculation**: `response === correct_response`
- **Purpose**: Accuracy analysis
- **Computed**: Automatically calculated in `on_finish`

### Task Management Variables

#### `task` (string)
- **Values**: "instructions", "fixation", "practice", "response", "results"
- **Purpose**: Trial type identification for filtering
- **Usage**: Data analysis, progress tracking

#### `trial_index` (number)
- **Values**: Sequential integers starting from 0
- **Purpose**: Trial order tracking
- **Usage**: Timeline analysis, debugging

#### `time_elapsed` (number)
- **Values**: Milliseconds since experiment start
- **Purpose**: Overall experiment timing
- **Usage**: Fatigue analysis, session duration

## Data Processing

### Results Compilation
The `createResults()` function automatically calculates:

#### Performance Metrics
- **Overall Accuracy**: `correctTrials.count() / totalTrials.count()`
- **Congruent Accuracy**: `congruentCorrect.count() / congruentTrials.count()`
- **Incongruent Accuracy**: `incongruentCorrect.count() / incongruentTrials.count()`

#### Response Time Analysis
- **Congruent RT**: `congruentCorrect.select('rt').mean()`
- **Incongruent RT**: `incongruentCorrect.select('rt').mean()`
- **Stroop Effect**: `incongruentRt - congruentRt`

### Data Filtering

#### By Trial Type
```javascript
// Get only main experiment trials
const mainTrials = jsPsych.data.get().filter({ task: 'response' });

// Get only practice trials
const practiceTrials = jsPsych.data.get().filter({ task: 'practice' });
```

#### By Condition
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

#### By Accuracy
```javascript
// Get correct responses only
const correctTrials = jsPsych.data.get().filter({ 
    task: 'response', 
    correct: true 
});
```

## Data Export

### Built-in Export
- **Trigger**: "Download Data" button in results screen
- **Method**: `jsPsych.data.displayData()`
- **Format**: JSON structure with all trial data

### Custom Export Options

#### CSV Export
```javascript
// Export as CSV
const csvData = jsPsych.data.get().csv();
```

#### JSON Export
```javascript
// Export as JSON
const jsonData = jsPsych.data.get().json();
```

#### Filtered Export
```javascript
// Export only main trials
const mainTrialsData = jsPsych.data.get()
    .filter({ task: 'response' })
    .csv();
```

## Data Validation

### Response Validation
- **Range Check**: Response indices must be within button array bounds
- **Type Check**: Response must be number or null
- **Timeout Handling**: Null responses flagged appropriately

### Timing Validation
- **RT Bounds**: Response times should be > 0 and < trial_duration
- **Sequence Check**: Trial indices should be sequential
- **Duration Check**: time_elapsed should be monotonically increasing

### Data Integrity
- **Required Fields**: All stimulus variables must be present for response trials
- **Consistency**: congruent field must match word/color relationship
- **Completeness**: No missing data for completed trials

## Analysis Recommendations

### Primary Measures
1. **Stroop Effect**: Difference in RT between incongruent and congruent trials
2. **Accuracy**: Overall and by condition
3. **Response Time**: Central tendency and variability measures

### Secondary Measures
1. **Practice Effects**: Accuracy improvement during practice
2. **Fatigue Effects**: RT changes over time
3. **Error Analysis**: Types and patterns of incorrect responses

### Statistical Considerations
- **Outlier Removal**: Consider RT cutoffs (e.g., < 200ms, > 3000ms)
- **Normality**: RT distributions often require transformation
- **Individual Differences**: Account for baseline RT differences

## Troubleshooting Data Issues

### Common Problems

#### Missing Data
- **Cause**: Timeout trials, navigation errors
- **Solution**: Check trial_duration settings, validate responses

#### Incorrect Mapping
- **Cause**: Mismatched response indices
- **Solution**: Verify choice_of_colors array consistency

#### Timing Issues
- **Cause**: System performance, browser differences
- **Solution**: Validate RT distributions, consider exclusion criteria

### Data Quality Checks
- Verify response distribution across buttons
- Check for systematic biases in RT
- Validate practice vs main trial differences
- Confirm congruency effect presence