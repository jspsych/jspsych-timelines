# flanker-inhibitory

The Flanker Inhibitory Control and Attention test is an assessment of inhibitory control and selective attention. Based on the NIH Toolbox Flanker task, participants must respond to the direction of a central stimulus while ignoring flanking stimuli that may be congruent (pointing the same direction) or incongruent (pointing the opposite direction).

## Parameters

### Configuration Parameters

Configuration parameters can be passed when calling `createTimeline()`:

```js
const timeline = jsPsychTimelineFlankerInhibitory.createTimeline(jsPsych, {
  stimuli_type: 'fish',
  stimuli_amount: 7,
  num_trials: 40
});
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli_type | string | 'layered' | Type of stimuli: 'fish', 'arrow', or 'layered' (fish + arrow)
custom_stimuli | object | undefined | Custom stimuli object with left/right arrays of SVG strings
svg | array | undefined | Override parameter - array of SVG strings to layer on top of each other
stimuli_amount | number | 5 | Number of stimuli in flanker display (must be odd number ≥3)
fixation_duration | number | 500 | Duration of fixation cross display in milliseconds
show_instructions | boolean | true | Whether to display instruction screens before the task
show_practice | boolean | true | Whether to include practice trials with feedback
num_practice | number | 8 | Number of practice trials to present
num_trials | number | 20 | Number of main task trials to present

### Stimulus Configuration Examples

```js
// Use fish stimuli only
const fishConfig = { stimuli_type: 'fish' };

// Use custom SVG with 7 total stimuli
const customConfig = {
  svg: ['<svg>...custom svg...</svg>'],
  stimuli_amount: 7
};

// Use layered stimuli with custom amounts
const layeredConfig = {
  stimuli_type: 'layered',
  stimuli_amount: 9,
  custom_stimuli: {
    left: ['<svg>...left base...</svg>', '<svg>...left overlay...</svg>'],
    right: ['<svg>...right base...</svg>', '<svg>...right overlay...</svg>']
  }
};
```

### Timeline Structure

The complete timeline includes:

1. **Instructions** (if `show_instructions: true`)
   - Multi-page instructions explaining the task
   - Examples of congruent and incongruent trials
   - Strategy tips for performance

2. **Practice Trials** (if `show_practice: true`)
   - Highlighted center stimulus to aid learning
   - Immediate feedback after each response
   - Performance summary at completion

3. **Main Task**
   - Equal numbers of congruent and incongruent trials
   - Left and right direction trials
   - Randomized trial order

4. **Completion Screen**
   - Final performance summary
   - Task completion confirmation

## Data Generated

Each trial generates the following data:

Name | Type | Value
-----|------|------
task | string | 'flanker' for stimulus trials, 'fixation' for fixation periods
phase | string | 'practice' or 'main' depending on trial phase
direction | string | 'left' or 'right' - direction of center stimulus
congruent | boolean | true if flankers match center direction, false if opposite
response | number | 0 for left button, 1 for right button
rt | number | Response time in milliseconds
correct | boolean | true if response matches stimulus direction
trial_number | number | Sequential trial number within phase

### Performance Calculation

The `calculatePerformance()` utility function returns:

```js
{
  accuracy: 85.5,        // Percentage of correct responses
  mean_rt: 650,          // Mean response time for correct trials (ms)
  total_trials: 20,      // Total number of trials analyzed
  correct_trials: 17     // Number of correct responses
}
```

## Functions

### createTimeline(jsPsych, config)

Creates the complete flanker task timeline with the specified configuration.

**Parameters:**
- `jsPsych`: jsPsych instance
- `config`: Configuration object (see Parameters section)

**Returns:** Timeline object ready for use with `jsPsych.run()`

### calculatePerformance(data)

Analyzes trial data to compute performance metrics.

**Parameters:**
- `data`: Array of trial data objects

**Returns:** Performance object with accuracy, mean RT, and trial counts

### createFlankerStim(direction, congruent, stimuli, stimuli_amount)

Generates HTML for flanker stimulus display.

**Parameters:**
- `direction`: 'left' or 'right'
- `congruent`: boolean indicating trial type
- `stimuli`: Stimuli object or array
- `stimuli_amount`: Number of stimuli to display (default: 5)

**Returns:** HTML string for stimulus display

### createPracticeStim(direction, congruent, stimuli, stimuli_amount)

Generates HTML for practice stimulus with center highlighting.

**Parameters:** Same as `createFlankerStim()`

**Returns:** HTML string with highlighted center stimulus

## Stimulus System

### Layered SVGs

The package supports layering multiple SVG elements to create complex stimuli:

```js
const layeredStimuli = [
  '<svg>...base fish shape...</svg>',
  '<svg>...arrow overlay...</svg>',
  '<svg>...additional elements...</svg>'
];
```

### Automatic Flipping

Single SVGs are automatically flipped to create left/right facing versions:

```js
// Provide only right-facing SVG
const config = {
  svg: ['<svg>...right-facing fish...</svg>']
};
// Left-facing version is automatically generated
```

### Mobile Optimization

- Touch-friendly button interfaces
- Responsive sizing using vmin units
- Optimized for various screen sizes
- No keyboard input required

