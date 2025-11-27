---
"@jspsych-timelines/corsi-block": major
---

Initial release of Corsi Block Task timeline

Complete implementation of the Corsi Block Tapping Task with comprehensive parameterization:

**Temporal Parameters:**
- Configurable stimulus duration, ISI, delays, and response timeout
- Supports commonly reported timing values (1000ms stimulus, 1000ms ISI)

**Visual Parameters:**
- Customizable block colors (inactive, active, correct, incorrect)
- Configurable background color and display dimensions
- High-contrast color schemes supported

**Algorithm Parameters:**
- Adaptive difficulty with configurable starting length and max length
- Multiple stop rules: both-trials failure or consecutive errors
- Fixed pseudorandom or truly random sequence generation
- Control over immediate repeats
- Automatic span calculation

**Features:**
- Automatic progression through difficulty levels
- Built-in performance tracking
- Custom block layouts supported
- Mobile-optimized examples
- Full TypeScript support
- Comprehensive test coverage (27 tests)
- Multiple example implementations

**Examples included:**
- Basic usage
- Common configuration with typical parameters
- Fast research variant
- Custom block layouts
- CDN loading example
