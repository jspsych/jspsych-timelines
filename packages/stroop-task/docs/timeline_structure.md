# Timeline Structure

## Overview

The Stroop task timeline follows a structured experimental design that tests cognitive interference through color-word conflict. This document details the complete timeline structure, logic, and flow.

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

## Stimulus Generation Logic

### Color-Word Combinations
The `generateStimuli()` function creates all possible combinations:

```javascript
// For default colors [RED, GREEN, BLUE, YELLOW]
// Creates 16 total stimuli (4 words × 4 colors)

Congruent stimuli (4):
- RED in red ink
- GREEN in green ink  
- BLUE in blue ink
- YELLOW in yellow ink

Incongruent stimuli (12):
- RED in green/blue/yellow ink
- GREEN in red/blue/yellow ink
- BLUE in red/green/yellow ink
- YELLOW in red/green/blue ink
```

### Response Mapping
- Response buttons correspond to ink colors
- Correct response index matches color position in array
- Button layout configurable (grid rows/columns)

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

## Conditional Branching

### Optional Components
The timeline includes several conditional branches:

1. **Instructions**: `show_welcome_and_instructions` flag
2. **Fixation Cross**: `include_fixation` flag per trial
3. **Practice Feedback**: `show_practice_feedback` flag
4. **Results Display**: `show_results` flag

### State Management
Internal state tracking enables:
- Progress monitoring during experiment
- Conditional logic based on completion status
- Data validation and integrity checks

```javascript
interface StroopState {
    practiceCompleted: boolean;
    mainTrialsCompleted: number;
    totalTrials: number;
}
```

## Timeline Customization

### Modular Design
Each component can be used independently:
- Import individual functions from `timelineComponents`
- Build custom timelines with specific combinations
- Modify parameters for specific research needs

### Parameter Inheritance
- Timeline-level parameters apply to all relevant components
- Component-specific overrides possible through direct function calls
- Consistent styling and behavior across all phases

## Error Handling

### Data Validation
- Automatic response validation during trials
- Timeout handling for non-responses
- State consistency checks between phases

### Recovery Mechanisms
- State reset functionality for multiple timeline runs
- Graceful degradation if components fail
- Debug logging for troubleshooting

## Performance Considerations

### Efficient Stimulus Generation
- Pre-computed stimulus arrays
- Minimal runtime calculations
- Memory-efficient data structures

### Timeline Optimization
- Lazy loading of trial components
- Efficient state management
- Optimized rendering for smooth presentation