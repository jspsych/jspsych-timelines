# Serial Reaction Time Task for jsPsych

A comprehensive implementation of the Serial Reaction Time (SRT) Task based on Nissen & Bullemer (1987) and subsequent research. This timeline supports the full parameter space used in SRT implementations across four decades of research.

## Features

- **Multiple sequence structures**: FOC, SOC, deterministic, probabilistic, and ASRT variants
- **Temporal control**: RSI manipulation (0-750ms) for implicit/explicit learning
- **Block configurations**: Flexible training and random probe block placement
- **Dual-task support**: Tone counting secondary task (Nissen & Bullemer Exp 2)
- **Awareness assessment**: Free recall, recognition tests, process dissociation
- **Learning metrics**: Automatic RT difference calculation, triplet frequency analysis
- **Standard sequences**: Famous sequences from the literature built-in
- **Full TypeScript support**: Complete type definitions
- **Mobile-optimized**: Responsive examples with touch support

## Installation

```bash
npm install @jspsych-timelines/serial-reaction-time
```

Or load from CDN:

```html
<script src="https://unpkg.com/@jspsych-timelines/serial-reaction-time@latest"></script>
```

## Quick Start

```javascript
import { initJsPsych } from 'jspsych';
import { createTimeline } from '@jspsych-timelines/serial-reaction-time';

const jsPsych = initJsPsych();

// Basic Nissen & Bullemer (1987) replication
const timeline = createTimeline(jsPsych);

jsPsych.run([timeline]);
```

## Configuration Options

### Sequence Configuration

```javascript
const timeline = createTimeline(jsPsych, {
  sequence: {
    structure: 'SOC',  // 'FOC' | 'SOC' | 'deterministic' | 'probabilistic' | 'ASRT'
    sequence: [2, 3, 1, 2, 0, 1, 0, 3, 2, 1, 3, 0],  // Custom sequence
    length: 12,
    allow_repeats: false,
    probability_ratio: [0.8, 0.2],  // For probabilistic sequences
    asrt_pattern: [0, 2, 1, 3]  // For ASRT variant
  }
});
```

### Timing Configuration

```javascript
const timeline = createTimeline(jsPsych, {
  timing: {
    rsi: 250,  // Response-stimulus interval (0-750ms)
    pre_target_duration: 0,  // Display grid before target appears
    trial_duration: null,  // Max time for response (null = unlimited)
    show_response_feedback: false,
    feedback_duration: 200
  }
});
```

**RSI Values and Their Effects:**
- **0ms**: Prevents anticipatory processes, inhibits explicit awareness (purely implicit learning)
- **250ms**: Optimal for implicit learning (most common in literature)
- **500ms**: Original Nissen & Bullemer value
- **750ms+**: Reduces learning effectiveness

### Block Structure

```javascript
const timeline = createTimeline(jsPsych, {
  blocks: {
    num_training_blocks: 8,
    trials_per_block: 100,
    num_random_blocks: 2,
    random_block_placement: 'end',  // 'beginning' | 'middle' | 'end' | 'alternating' | 'sandwich'
    random_block_positions: []  // Custom positions, e.g., [0, 5, 10]
  }
});
```

### Response Configuration

```javascript
const timeline = createTimeline(jsPsych, {
  response: {
    modality: 'keyboard',  // 'keyboard' | 'mouse'
    choices: [['3', '5', '7', '9']],  // Key mapping for keyboard
    mapping: 'compatible',  // 'compatible' | 'incompatible'
    hand_config: 'bimanual',  // 'unimanual' | 'bimanual'
    allow_nontarget_responses: false  // For mouse modality
  }
});
```

### Dual-Task Configuration

```javascript
const timeline = createTimeline(jsPsych, {
  dual_task: {
    enabled: true,
    tone_frequencies: [800, 1200],  // [low, high] in Hz
    tone_duration: 500,  // milliseconds
    tones_per_block: 30
  }
});
```

### Awareness Assessment

```javascript
const timeline = createTimeline(jsPsych, {
  awareness: {
    enabled: true,
    assessment_types: ['free-recall', 'recognition'],
    recognition_fragments: 8,
    recognition_fragment_length: 3
  }
});
```

### Learning Metrics

```javascript
const timeline = createTimeline(jsPsych, {
  metrics: {
    calculate_rt_difference: true,  // Sequential vs random RT difference
    calculate_triplet_frequencies: true,  // For ASRT analysis
    track_chunk_boundaries: false,
    chunk_size: 3
  }
});
```

## Standard Sequences

Access famous sequences from the literature:

```javascript
import { STANDARD_SEQUENCES } from '@jspsych-timelines/serial-reaction-time';

// Nissen & Bullemer (1987) - 10-element hybrid sequence
STANDARD_SEQUENCES.NISSEN_BULLEMER  // [3, 1, 2, 0, 2, 1, 3, 2, 1, 0]

// Reed & Johnson (1994) - 12-element SOC sequence
STANDARD_SEQUENCES.REED_JOHNSON_SOC  // [2, 3, 1, 2, 0, 1, 0, 3, 2, 1, 3, 0]

// Cohen, Ivry, & Keele (1990) - Unique sequence
STANDARD_SEQUENCES.UNIQUE_SEQUENCE  // [0, 3, 2, 4, 1]

// Cohen, Ivry, & Keele (1990) - Ambiguous sequence
STANDARD_SEQUENCES.AMBIGUOUS_SEQUENCE  // [1, 0, 2, 1, 2, 0]

// Baird & Stewart (2018) - Evades explicit awareness
STANDARD_SEQUENCES.BAIRD_STEWART  // [2, 1, 3, 0, 2, 3, 1, 0, 3]

// Howard & Howard (1997) - ASRT pattern
STANDARD_SEQUENCES.ASRT_PATTERN  // [0, 2, 1, 3]
```

## Configuration Presets

Use research-validated configurations:

```javascript
import { PRESETS } from '@jspsych-timelines/serial-reaction-time';

// Nissen & Bullemer (1987) replication
const timeline = createTimeline(jsPsych, PRESETS.NISSEN_BULLEMER_1987);

// Second-order conditional standard
const timeline = createTimeline(jsPsych, PRESETS.SOC_STANDARD);

// Purely implicit learning (RSI = 0)
const timeline = createTimeline(jsPsych, PRESETS.PURELY_IMPLICIT);

// ASRT standard configuration
const timeline = createTimeline(jsPsych, PRESETS.ASRT_STANDARD);

// Dual-task configuration
const timeline = createTimeline(jsPsych, PRESETS.DUAL_TASK);
```

## Data Structure

Each trial records:

```javascript
{
  task: 'srt',
  phase: 'trial',
  block_type: 'sequential' | 'random',
  block_number: 0,
  trial_number: 45,
  target: [0, 2],  // or single number for keyboard
  response: '3',  // or [row, col] for mouse
  rt: 450,
  correct: true,
  sequence_position: 5,  // Position in sequence (null for random)
  previous_target: 1,
  triplet: '0-1-2',  // For ASRT analysis
  triplet_frequency: 'high'  // 'high' or 'low'
}
```

Summary metrics added to all data:

```javascript
{
  mean_rt_sequential: 425,
  mean_rt_random: 485,
  rt_difference: 60,  // Learning index
  mean_accuracy_sequential: 0.95,
  mean_accuracy_random: 0.92,
  high_freq_rt: 410,  // For ASRT
  low_freq_rt: 445,
  triplet_learning_index: 35
}
```

## Examples

### Implicit Learning (RSI = 0)

```javascript
const timeline = createTimeline(jsPsych, {
  sequence: {
    structure: 'SOC',
    sequence: STANDARD_SEQUENCES.REED_JOHNSON_SOC
  },
  timing: {
    rsi: 0  // Purely implicit
  },
  awareness: {
    enabled: true,
    assessment_types: ['free-recall']
  }
});
```

### ASRT (Alternating Serial Reaction Time)

```javascript
const timeline = createTimeline(jsPsych, {
  sequence: {
    structure: 'ASRT'
  },
  blocks: {
    num_training_blocks: 20,
    trials_per_block: 85,
    num_random_blocks: 0
  },
  metrics: {
    calculate_triplet_frequencies: true
  }
});
```

### Probabilistic Sequence

```javascript
const timeline = createTimeline(jsPsych, {
  sequence: {
    structure: 'probabilistic',
    sequence: STANDARD_SEQUENCES.NISSEN_BULLEMER,
    probability_ratio: [0.8, 0.2]  // 80% sequential, 20% random
  }
});
```

### Sandwich Design

```javascript
const timeline = createTimeline(jsPsych, {
  blocks: {
    num_training_blocks: 10,
    num_random_blocks: 2,
    random_block_placement: 'sandwich'  // Random-Sequential-Random
  }
});
```

## Accessing Data

```javascript
jsPsych.run([timeline]).then(() => {
  // Get all trial data
  const allData = jsPsych.data.get().filter({ task: 'srt', phase: 'trial' });

  // Get sequential trials only
  const sequentialData = allData.filter({ block_type: 'sequential' });

  // Get random trials only
  const randomData = allData.filter({ block_type: 'random' });

  // Calculate mean RTs
  const meanRTSequential = sequentialData.select('rt').mean();
  const meanRTRandom = randomData.select('rt').mean();

  // Learning index
  const learningIndex = meanRTRandom - meanRTSequential;

  console.log(`Learning effect: ${learningIndex} ms`);
});
```

## Internationalization

Customize all text displayed to participants:

```javascript
const timeline = createTimeline(jsPsych, {
  text_object: {
    instructions_implicit: '<p>Your custom instructions here...</p>',
    block_transition: '<p>Break time!</p>',
    continue_button: 'Weiter',  // German for "Continue"
    // ... see text.ts for all available strings
  }
});
```

## Research Applications

### Implicit vs Explicit Learning

Compare RSI conditions within-subjects:

```javascript
const implicit = createTimeline(jsPsych, {
  timing: { rsi: 0 },
  data_labels: { condition: 'implicit' }
});

const explicit = createTimeline(jsPsych, {
  timing: { rsi: 250 },
  learning_condition: 'explicit',
  data_labels: { condition: 'explicit' }
});

jsPsych.run([implicit, explicit]);
```

### Attentional Requirements

```javascript
const singleTask = createTimeline(jsPsych, {
  data_labels: { condition: 'single' }
});

const dualTask = createTimeline(jsPsych, {
  dual_task: { enabled: true },
  data_labels: { condition: 'dual' }
});
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript ES6+ support

## Citation

If you use this timeline in your research, please cite:

```
Nissen, M. J., & Bullemer, P. (1987). Attentional requirements of learning:
Evidence from performance measures. Cognitive Psychology, 19(1), 1-32.
```

And for specific variants:

**SOC sequences:**
```
Reed, J., & Johnson, P. (1994). Assessing implicit learning with indirect tests:
Determining what is learned about sequence structure. Journal of Experimental
Psychology: Learning, Memory, and Cognition, 20(3), 585-594.
```

**ASRT:**
```
Howard, J. H., & Howard, D. V. (1997). Age differences in implicit learning of
higher order dependencies in serial patterns. Psychology and Aging, 12(4), 634-656.
```

**Purely implicit (RSI = 0):**
```
Destrebecqz, A., & Cleeremans, A. (2001). Can sequence learning be implicit?
New evidence with the process dissociation procedure. Psychonomic Bulletin & Review,
8(2), 343-350.
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or pull request on GitHub.

## Support

For questions or issues:
- GitHub Issues: https://github.com/jspsych/jspsych-timelines/issues
- jsPsych Discussions: https://github.com/jspsych/jsPsych/discussions
