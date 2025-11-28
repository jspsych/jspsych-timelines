---
"@jspsych-timelines/serial-reaction-time": major
---

Initial release of Serial Reaction Time Task timeline

Complete implementation of the Serial Reaction Time (SRT) Task based on Nissen & Bullemer (1987) and comprehensive methodology from 40+ years of SRT research.

**Sequence Structures:**
- FOC (First-Order Conditional)
- SOC (Second-Order Conditional) - Reed & Johnson (1994)
- Deterministic sequences
- Probabilistic sequences (60/40, 80/20, 85/15 ratios)
- ASRT (Alternating Serial Reaction Time) - Howard & Howard (1997)

**Temporal Parameters:**
- RSI manipulation (0-750ms) for implicit/explicit learning control
- RSI = 0ms for purely implicit learning (Destrebecqz & Cleeremans, 2001)
- RSI = 250ms for optimal implicit learning (most common in literature)
- RSI = 500ms for original Nissen & Bullemer value
- Configurable pre-target duration, trial duration, and feedback timing

**Block Configuration:**
- Flexible training and random probe block structure
- Multiple placement strategies: beginning, middle, end, alternating, sandwich
- Custom block position specification
- 8-10 training blocks standard, configurable trials per block

**Dual-Task Support:**
- Tone counting secondary task (Nissen & Bullemer Experiment 2)
- Configurable tone frequencies and presentation rate
- Tests attentional requirements of sequence learning

**Awareness Assessment:**
- Free recall test
- Recognition test with fragments
- Process Dissociation Procedure (inclusion/exclusion conditions)
- Prediction task support

**Learning Metrics:**
- Automatic RT difference calculation (sequential - random blocks)
- Triplet frequency analysis for ASRT (high-freq vs low-freq)
- Chunk boundary tracking
- Error rate analysis

**Standard Sequences Included:**
- Nissen & Bullemer (1987): [3, 1, 2, 0, 2, 1, 3, 2, 1, 0]
- Reed & Johnson SOC (1994): [2, 3, 1, 2, 0, 1, 0, 3, 2, 1, 3, 0]
- Cohen, Ivry, & Keele unique sequence (1990): [0, 3, 2, 4, 1]
- Cohen, Ivry, & Keele ambiguous sequence (1990): [1, 0, 2, 1, 2, 0]
- Baird & Stewart awareness-evading (2018): [2, 1, 3, 0, 2, 3, 1, 0, 3]
- ASRT pattern (Howard & Howard, 1997): [0, 2, 1, 3]

**Configuration Presets:**
- Nissen & Bullemer (1987) replication
- SOC standard configuration
- Purely implicit learning (RSI = 0)
- ASRT standard configuration
- Dual-task configuration

**Features:**
- Response modality: keyboard or mouse (uses serial-reaction-time or serial-reaction-time-mouse plugins)
- Spatial mapping: compatible or incompatible
- Hand configuration: unimanual or bimanual
- Custom stimulus configurations (4-9 locations, various arrangements)
- Show/hide response feedback
- Progress display between blocks
- Full internationalization support
- Custom data labels
- TypeScript support with complete type definitions

**Examples included:**
- Basic Nissen & Bullemer replication
- Common configuration (SOC, RSI = 250ms)
- Purely implicit learning (RSI = 0ms)
- ASRT variant
- Dual-task with tone counting
- CDN loading example

**Test Coverage:**
- 49 comprehensive tests covering all configuration options
- All tests passing
