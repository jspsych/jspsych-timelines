# BART Timeline

A jsPsych implementation of the Balloon Analogue Risk Task (BART) for measuring risk-taking behavior and decision-making under uncertainty.

## Overview

The Balloon Analogue Risk Task (BART) measures risk-taking propensity by having participants inflate virtual balloons to earn money. Each pump increases earnings but also increases the risk of the balloon exploding, which results in losing all earnings for that trial.

## Installation

### NPM
```bash
npm install @jspsych-timelines/bart
```

### CDN
```html
<script src="https://unpkg.com/@jspsych-timelines/bart"></script>
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/jspsych"></script>
  <script src="https://unpkg.com/@jspsych-timelines/bart"></script>
  <link rel="stylesheet" href="https://unpkg.com/jspsych/css/jspsych.css">
</head>
<body></body>
<script>
  const jsPsych = initJsPsych({
    on_finish: () => jsPsych.data.displayData('json')
  });

  const config = {
    max_pumps: 20,
    min_pumps: 1,
    currency_unit_per_pump: 1,
    num_blocks: 3,
    trials_per_block: 10
  };

  const timeline = jsPsychTimelineBartTimeline.createTimeline(jsPsych, config);
  jsPsych.run([timeline]);
</script>
</html>
```

## API Reference

### createTimeline(jsPsych, config)

Creates a complete BART task timeline.

**Parameters:**
- `jsPsych` (JsPsych): The jsPsych instance
- `config` (BartConfig, optional): Configuration options

**Returns:** Timeline object for use with `jsPsych.run()`

### timelineUnits

Access individual components for custom timeline construction:

```javascript
const { 
  showStartInstructions, 
  showBlockBreak, 
  showEndResults, 
  createInstructions, 
  createTrialTimeline 
} = jsPsychTimelineBartTimeline.timelineUnits;

// Get instruction trials
const instructions = createInstructions();

// Get start instructions
const startInstructions = showStartInstructions(currencyFormatter, currency_unit_per_pump);

// Get trial components
const trial = createTrialTimeline(jsPsych, max_pumps, min_pumps, currency_unit_per_pump);

// Get block break screen
const blockBreak = showBlockBreak(jsPsych, currentBlock, totalBlocks, currencyFormatter);

// Get end results screen
const endResults = showEndResults(jsPsych, currencyFormatter);
```

### utils

Utility functions and currency support:

```javascript
const { CurrencyFormatter, CURRENCY_PRESETS } = jsPsychTimelineBartTimeline;

// Create currency formatter
const formatter = new CurrencyFormatter(CURRENCY_PRESETS.USD);

// Format earnings
const formattedEarnings = formatter.formatBaseUnit(pumpCount);
```

## Configuration Options

### BartConfig Interface

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `max_pumps` | number | `20` | Maximum number of pumps before guaranteed explosion |
| `min_pumps` | number | `1` | Minimum number of pumps before explosion is possible |
| `currency_unit_per_pump` | number | `1` | Currency units earned per pump (in base units, e.g., cents) |
| `currency_config` | CurrencyConfig | `CURRENCY_PRESETS.USD` | Currency configuration object |
| `num_blocks` | number | `3` | Number of blocks in the experiment |
| `trials_per_block` | number | `10` | Number of trials per block |
| `trial_timeout` | number | `15000` | Timeout per trial in milliseconds |
| `enable_timeout` | boolean | `true` | Whether to enable automatic timeout and collection |

### Currency Configuration

The BART timeline supports multiple currencies with proper international formatting:

```javascript
// Available currency presets
const currencies = {
  USD: { locale: 'en-US', currency: 'USD', symbol: '$', decimalPlaces: 2, baseUnit: 100 },
  EUR: { locale: 'de-DE', currency: 'EUR', symbol: '�', decimalPlaces: 2, baseUnit: 100 },
  GBP: { locale: 'en-GB', currency: 'GBP', symbol: '�', decimalPlaces: 2, baseUnit: 100 },
  JPY: { locale: 'ja-JP', currency: 'JPY', symbol: '�', decimalPlaces: 0, baseUnit: 1 },
  CAD: { locale: 'en-CA', currency: 'CAD', symbol: 'C$', decimalPlaces: 2, baseUnit: 100 },
  AUD: { locale: 'en-AU', currency: 'AUD', symbol: 'A$', decimalPlaces: 2, baseUnit: 100 }
};

const config = {
  currency_config: CURRENCY_PRESETS.EUR,
  currency_unit_per_pump: 5  // 5 euro cents per pump
};
```

### Risk Parameters

Control the risk-reward structure of the task:

```javascript
const config = {
  max_pumps: 30,        // Balloons can explode anywhere from min_pumps to max_pumps
  min_pumps: 5,         // Safe pumps before explosion becomes possible
  currency_unit_per_pump: 2  // Higher reward per pump
};
```

### Time Pressure

Configure timeout behavior:

```javascript
const config = {
  trial_timeout: 10000,    // 10 second limit per trial
  enable_timeout: true,    // Auto-collect earnings when time runs out
};

// Disable timeout for self-paced version
const selfPacedConfig = {
  enable_timeout: false    // No time limit
};
```

## Data Generated

### Trial Data Properties

| Property | Type | Description |
|----------|------|-------------|
| `task` | string | Always `'bart'` for BART trials |
| `phase` | string | Trial phase: `'instructions'`, `'trial'`, `'block-break'`, `'end-results'` |
| `pump_count` | number | Number of pumps made in this trial |
| `exploded` | boolean | Whether the balloon exploded |
| `cashed_out` | boolean | Whether participant collected earnings |
| `timed_out` | boolean | Whether trial ended due to timeout |
| `explosion_point` | number | Randomly determined explosion point for this trial |
| `rt` | number | Reaction time for button presses |
| `response` | number | Button pressed (0 = pump, 1 = collect) |

### Data Analysis

```javascript
// Get all BART trial data
const bartData = jsPsych.data.filter({task: 'bart', phase: 'trial'});

// Calculate risk-taking measures
const successfulTrials = bartData.filter({exploded: false, cashed_out: true});
const explodedTrials = bartData.filter({exploded: true});

// Mean pumps on successful trials (adjusted BART score)
const adjustedBartScore = successfulTrials.select('pump_count').mean();

// Total earnings
const totalEarnings = successfulTrials.select('pump_count').sum();

// Risk-taking metrics
const explosionRate = explodedTrials.count() / bartData.count();
const meanPumpsAll = bartData.select('pump_count').mean();
const meanPumpsSuccessful = successfulTrials.select('pump_count').mean();

console.log('BART Performance:', {
  adjustedBartScore: Math.round(adjustedBartScore * 100) / 100,
  totalEarnings,
  explosionRate: Math.round(explosionRate * 100) + '%',
  meanPumpsAll: Math.round(meanPumpsAll * 100) / 100,
  meanPumpsSuccessful: Math.round(meanPumpsSuccessful * 100) / 100
});
```

## Examples

### Basic USD Task

```javascript
const config = {
  max_pumps: 20,
  min_pumps: 1,
  currency_unit_per_pump: 1,  // 1 cent per pump
  num_blocks: 3,
  trials_per_block: 10
};

const timeline = jsPsychTimelineBartTimeline.createTimeline(jsPsych, config);
```

### European Version with Euros

```javascript
const { CURRENCY_PRESETS } = jsPsychTimelineBartTimeline;

const config = {
  max_pumps: 25,
  min_pumps: 3,
  currency_unit_per_pump: 2,        // 2 euro cents per pump
  currency_config: CURRENCY_PRESETS.EUR,
  num_blocks: 4,
  trials_per_block: 15
};

const timeline = jsPsychTimelineBartTimeline.createTimeline(jsPsych, config);
```

### High Stakes Version

```javascript
const config = {
  max_pumps: 50,
  min_pumps: 10,
  currency_unit_per_pump: 5,   // 5 cents per pump
  trial_timeout: 20000,        // 20 seconds per trial
  num_blocks: 2,
  trials_per_block: 20
};

const timeline = jsPsychTimelineBartTimeline.createTimeline(jsPsych, config);
```

### Self-Paced Version

```javascript
const config = {
  enable_timeout: false,       // No time pressure
  max_pumps: 30,
  min_pumps: 1,
  currency_unit_per_pump: 1
};

const timeline = jsPsychTimelineBartTimeline.createTimeline(jsPsych, config);
```

### Custom Currency Configuration

```javascript
// Create custom currency (e.g., research points)
const customCurrency = {
  locale: 'en-US',
  currency: 'USD',      // Use USD formatting but custom symbol
  symbol: 'pts',
  decimalPlaces: 0,
  baseUnit: 1           // Whole numbers, not cents
};

const config = {
  currency_config: customCurrency,
  currency_unit_per_pump: 10,  // 10 points per pump
  max_pumps: 15,
  trials_per_block: 12
};

const timeline = jsPsychTimelineBartTimeline.createTimeline(jsPsych, config);
```

### Custom Timeline Structure

```javascript
// Create individual components
const { 
  createInstructions, 
  showStartInstructions, 
  createTrialTimeline,
  showEndResults 
} = jsPsychTimelineBartTimeline.timelineUnits;

const { CurrencyFormatter, CURRENCY_PRESETS } = jsPsychTimelineBartTimeline;

const config = {
  max_pumps: 20,
  min_pumps: 1,
  currency_unit_per_pump: 1,
  currency_config: CURRENCY_PRESETS.USD
};

const formatter = new CurrencyFormatter(config.currency_config);
const instructions = createInstructions();
const startInstructions = showStartInstructions(formatter, config.currency_unit_per_pump);
const trial = createTrialTimeline(jsPsych, config.max_pumps, config.min_pumps, config.currency_unit_per_pump);
const endResults = showEndResults(jsPsych, formatter);

// Custom timeline with single block
const customTimeline = {
  timeline: [
    ...instructions,
    startInstructions,
    {
      timeline: [trial],
      repetitions: 15
    },
    endResults
  ]
};

jsPsych.run([customTimeline]);
```

### Data Collection and Analysis

```javascript
const jsPsych = initJsPsych({
  on_trial_finish: (data) => {
    // Log each BART trial
    if (data.task === 'bart' && data.phase === 'trial') {
      console.log(`Trial: ${data.pump_count} pumps, Exploded: ${data.exploded}, Cashed out: ${data.cashed_out}`);
    }
  },
  on_finish: () => {
    // Calculate and save performance metrics
    const bartData = jsPsych.data.filter({task: 'bart', phase: 'trial'});
    const successfulTrials = bartData.filter({exploded: false, cashed_out: true});
    
    const results = {
      adjustedBartScore: successfulTrials.select('pump_count').mean(),
      totalEarnings: successfulTrials.select('pump_count').sum(),
      explosionRate: bartData.filter({exploded: true}).count() / bartData.count(),
      totalTrials: bartData.count(),
      completedTrials: successfulTrials.count()
    };
    
    // Send results to server or save locally
    console.log('Final BART Results:', results);
    
    // Display data
    jsPsych.data.displayData('json');
  }
});
```

## Best Practices

### Stimulus Considerations

1. **Balloon Images**: Ensure balloon images (transparent_balloon.png, transparent_popped_balloon.png) are in the images/ directory
2. **Image Scaling**: Default balloon scaling grows with pump count; test with different screen sizes
3. **Visual Feedback**: Balloon size increases with each pump to provide clear visual feedback

### Risk Parameter Tuning

1. **Explosion Range**: Larger ranges (max_pumps - min_pumps) create more uncertainty
2. **Minimum Pumps**: Setting min_pumps > 1 provides some guaranteed safe pumps
3. **Currency Units**: Use base units (cents) for precise control over earnings

### Performance Optimization

1. **Preload Images**: Preload balloon images to prevent loading delays
```javascript
const preload = {
  type: jsPsychPreload,
  images: ['images/transparent_balloon.png', 'images/transparent_popped_balloon.png']
};
```

2. **Block Structure**: Use multiple blocks with breaks to maintain engagement
3. **Trial Count**: 10-30 trials per block is typically effective

### Experimental Design

1. **Practice Trials**: Consider adding practice trials before the main task
2. **Instructions**: Ensure participants understand the risk-reward tradeoff
3. **Motivation**: Consider real or hypothetical monetary rewards to enhance motivation
4. **Individual Differences**: BART scores correlate with real-world risk-taking behaviors

### Currency and Localization

1. **Local Currency**: Use appropriate currency for your participant population
2. **Meaningful Amounts**: Scale currency units to be meaningful but not overwhelming
3. **Cultural Considerations**: Some cultures may respond differently to gambling-like tasks

## Timeline Structure

The complete default timeline includes:

1. **Instructions**: Multi-page instructions explaining the task
2. **Start Instructions**: Task summary with currency information and start button
3. **Block 1**: 10 trials (or configured amount) with balloon inflation
4. **Block 1 Break**: Progress display with current earnings and break option
5. **Block 2**: 10 trials
6. **Block 2 Break**: Progress display
7. **Block 3**: 10 trials  
8. **End Results**: Final earnings display and task completion

Each trial includes:
- **Pump Phase**: Participant can pump balloon or collect earnings
- **Outcome Phase**: Shows explosion result or collected earnings
- **Progress Update**: Real-time earnings tracking

The explosion point for each balloon is randomly determined between min_pumps and max_pumps, creating uncertainty about when the balloon will explode.

## License

MIT License