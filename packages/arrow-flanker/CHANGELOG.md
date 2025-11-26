# @jspsych-timelines/arrow-flanker

## 0.3.0

### Minor Changes

- Refactored to use @jspsych-contrib/plugin-flanker for stimulus presentation
- Plugin now handles RAF-based SOA timing, response collection, and stimulus rendering
- Timeline package focuses on experiment orchestration (trial order, blocks, congruency ratios)
- Added peer dependency on @jspsych-contrib/plugin-flanker ^1.0.0
- Removed internal stimulus generation code (now handled by plugin)
- Improved timing precision with requestAnimationFrame implementation

## 0.2.0

### Minor Changes

- 22c0236: delete -task suffix

## 0.1.0

### Minor Changes

- d6a0e3b: upgrade jspsych depedencies to v8
- 0de5056: update all jspsych dependencies to v8
- 0b18198: upgrade to use jspsych v8
