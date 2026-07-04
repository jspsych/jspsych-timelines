# @jspsych-timelines/go-nogo

## 0.5.0

### Minor Changes

- 3c17e49: Major overhaul of instructions and practice system:
  - Instructions are now interactive examples with feedback (old practice trials)
  - Practice is now a full block matching main task format with configurable num_practice_trials and practice_probability
  - Added end of practice screen with parameterized text
  - Simplified phase data variable to use only "instructions", "practice", "main", and "debrief"
  - Phase is now set at timeline level instead of individual trials

## 0.4.0

### Minor Changes

- 330ecd0: Add button_opacity_during_fixation parameter (default 1.0) to control button opacity during fixation and ISI screens, and add block_break_duration parameter to support timed breaks with countdown timer

## 0.3.2

### Patch Changes

- ae939f2: Update fixation button to use the same ID and CSS classes as the main trial button for consistent styling

## 0.3.1

### Patch Changes

- 4fe24a6: Update fixation button to use the same ID and CSS classes as the main trial button for consistent styling

## 0.3.0

### Minor Changes

- 11ae5a7: Add separate fixation_duration and isi_duration parameters. The trial sequence is now fixation → stimulus → ISI blank. The old isi_timeout parameter has been replaced with fixation_duration (duration of fixation cross before stimulus) and isi_duration (duration of blank screen after stimulus response).

## 0.2.0

### Minor Changes

- 4ed49b9: Major enhancements to the Go/No-Go timeline with new configuration parameters and updated default stimuli:

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

## 0.1.2

### Patch Changes

- cc383a3: finally rewires export to proper file name

## 0.1.1

### Patch Changes

- 7fb8fe4: now builds and exports cjs, along with rewiring exports to their proper file names

## 0.1.0

### Minor Changes

- 7bf9c62: initial release of go-nogo task timeline
