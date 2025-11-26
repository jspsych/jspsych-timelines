# Arrow Flanker Task - Examples

This directory contains working examples demonstrating various features of the arrow-flanker package.

## Available Examples

### 1. **index.html** - Basic Flanker Task
A simple implementation with default settings.

**Features demonstrated:**
- Basic configuration
- Fixation + stimulus + response sequence
- Multiple blocks with breaks
- Instructions

**Configuration:**
```javascript
{
  fixation_duration: 500,
  num_trials: 24,
  num_blocks: 2
}
```

**Use case:** Standard flanker task experiment

---

### 2. **advanced-soa.html** - SOA Manipulation
Demonstrates temporal manipulation using Stimulus Onset Asynchrony (SOA).

**Features demonstrated:**
- Array-based SOA sampling
- Brief stimulus duration
- Data analysis by SOA condition
- Sequential effects tracking

**Configuration:**
```javascript
{
  soa: [-200, -100, 0, 100, 200],
  stimulus_duration: 100,
  track_sequence_effects: true,
  num_trials: 40
}
```

**Use case:** Research on temporal dynamics of response competition

**Research application:** Isolate response selection vs perceptual filtering stages by varying when flankers appear relative to target

---

### 3. **congruency-ratio.html** - Global Control Manipulation
Demonstrates manipulation of conflict expectation through trial proportions.

**Features demonstrated:**
- Custom congruency ratios
- Multiple blocks with different contexts
- High-conflict vs low-conflict environments
- Block-specific data analysis

**Configuration:**
```javascript
// Block 1: High-conflict
{
  congruency_ratio: { congruent: 25, incongruent: 75 }
}

// Block 2: Low-conflict
{
  congruency_ratio: { congruent: 75, incongruent: 25 }
}
```

**Use case:** Study proactive vs reactive cognitive control

**Research application:** Test predictions that high-conflict contexts reduce overall flanker effect due to sustained control

---

### 4. **neutral-trials.html** - Neutral Trials
Demonstrates inclusion of neutral trials to separate facilitation from interference.

**Features demonstrated:**
- Three trial types (congruent, incongruent, neutral)
- Equal proportions
- Facilitation vs interference analysis

**Configuration:**
```javascript
{
  include_neutral: true,
  congruency_ratio: {
    congruent: 1,
    incongruent: 1,
    neutral: 1
  },
  num_trials: 36
}
```

**Use case:** Distinguish response facilitation from response interference

**Research application:** Determine whether flanker effects are driven by helpful congruent flankers, harmful incongruent flankers, or both

---

### 5. **sequential-effects.html** - Sequential Effects (Gratton Effect)
Demonstrates trial-to-trial adaptations in cognitive control.

**Features demonstrated:**
- Sequential effects tracking
- Congruency Sequence Effect (CSE) analysis
- Four transition types (cC, cI, iC, iI)
- Gratton effect calculation

**Configuration:**
```javascript
{
  track_sequence_effects: true,
  congruency_ratio: { congruent: 1, incongruent: 1 },
  num_trials: 64
}
```

**Use case:** Examine dynamic adjustments in cognitive control

**Research application:** Test whether experiencing conflict on trial n-1 reduces the flanker effect on trial n, supporting reactive control mechanisms

---

## Running the Examples

### Method 1: Local Build
1. Build the package: `npm run build`
2. Open any HTML file in a web browser
3. The examples load the built package from `../dist/index.global.js`

### Method 2: From unpkg (see load-from-unpkg.html)
Load the published package directly from unpkg CDN:
```html
<script src="https://unpkg.com/@jspsych-timelines/arrow-flanker"></script>
```

## Understanding the Output

All examples include data analysis in the browser console. Open Developer Tools (F12) to see:

- **Basic example:** Simple completion message
- **SOA example:** RT and flanker effect by SOA condition
- **Congruency ratio:** Flanker effect by block (high vs low conflict)
- **Neutral trials:** Facilitation and interference components
- **Sequential effects:** CSE analysis with all four transition types

## Customization Tips

### Timing Parameters
```javascript
fixation_duration: 500,      // Time before stimulus
stimulus_duration: 100,      // How long stimulus shows (null = until response)
iti_duration: 200,           // Blank time after response
response_timeout: 1500       // Max time to respond
```

### Spatial Parameters
```javascript
stimulus_size: '64px',                // Make arrows bigger
target_flanker_separation: '20px',    // More spacing
flanker_arrangement: 'vertical',      // Stack vertically
num_flankers: 6                       // 7-item array instead of 5
```

### Response Keys
```javascript
response_keys: {
  left: ['f', 'F'],
  right: ['j', 'J']
}
```

## Research Design Guidelines

### Minimum Trial Counts
- **Basic flanker effect:** 20-40 trials (balanced congruent/incongruent)
- **SOA manipulation:** 80-140 trials (balanced across SOA × congruency)
- **Sequential effects:** 60-100 trials (need sufficient n for all transitions)
- **Between-subjects design:** Consider practice block of 10-20 trials

### Block Structure
- Use breaks every 50-80 trials to maintain attention
- Consider counterbalancing block order for ratio manipulations
- First block often shows practice effects - consider exclusion or longer practice

### Data Quality
- Monitor accuracy (typically >90% for valid data)
- Check for outlier RTs (common cutoffs: <200ms or >2000ms)
- Verify sufficient trials per condition after exclusions

## Additional Resources

- **README.md** - Package documentation and feature overview
- **API.md** - Complete API reference with all parameters
- **plan.md** - Research background and theoretical framework

## Contributing

Have an example demonstrating another use case? Feel free to contribute!

Common requests:
- Blocked design example
- Custom stimulus sizing for visual angle control
- Integration with other jsPsych plugins
- Advanced data export and analysis
