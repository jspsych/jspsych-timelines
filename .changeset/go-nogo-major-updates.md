---
"@jspsych-timelines/go-nogo": minor
---

Major enhancements to the Go/No-Go timeline with new configuration parameters and updated default stimuli:

**New Configuration Parameters:**
- `show_button_during_fixation` (default: true) - Controls whether the GO button is visible (but disabled) during fixation trials, preventing layout shifts
- `stimulus_container_height` (default: "25vh") - Sets a fixed height for the stimulus container to keep the button position consistent between fixation and stimulus screens
- `fixation_size` (default: "3em") - Allows customization of the fixation cross size
- `stimulus_duration` (default: null) - Controls how long the stimulus is displayed independently from the response window. By default (null), the stimulus remains visible until response or trial timeout. Set to a number (e.g., 200) to hide the stimulus after that duration in milliseconds

**Default Stimulus Changes:**
- GO stimulus changed from square to **circle** (smooth shape suggesting action/movement)
- NO-GO stimulus changed from circle to **octagon** (stop sign symbolism for inhibition)
- All shapes (square, circle, octagon) remain available for custom configurations

**Breaking Changes:**
- Default stimuli have changed. Users who want the old behavior should explicitly set `go_stimulus: square` and `nogo_stimulus: circle`

**Technical Improvements:**
- Enhanced `createStimulusHTML` to accept optional container height parameter
- Updated `createISIFixation` to support custom stimulus height and fixation size
- Modified `createGoNoGo` to support independent stimulus duration control
- Added 9 new test cases covering all new parameters (20 tests total)
