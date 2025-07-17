# Troubleshooting Guide

## Overview

This guide addresses common issues encountered when implementing and running the Stroop task timeline, providing solutions and preventive measures.

## Installation & Setup Issues

### Package Import Problems

#### Error: Cannot find module '@jspsych/stroop-task'
**Symptoms:**
- Import statement fails
- Module not found errors
- TypeScript compilation errors

**Solutions:**
1. **Check Package Installation:**
   ```bash
   npm list @jspsych/stroop-task
   ```

2. **Reinstall Package:**
   ```bash
   npm uninstall @jspsych/stroop-task
   npm install @jspsych/stroop-task
   ```

3. **Verify Import Path:**
   ```javascript
   // Correct import
   import { createTimeline } from '@jspsych/stroop-task';
   
   // Incorrect import
   import { createTimeline } from '@jspsych/stroop-task/src/index';
   ```

#### Error: jsPsych is not defined
**Symptoms:**
- `jsPsych` object not available
- Timeline creation fails
- Console errors about undefined jsPsych

**Solutions:**
1. **Check jsPsych Import:**
   ```javascript
   import { initJsPsych } from 'jspsych';
   const jsPsych = initJsPsych();
   ```

2. **Verify jsPsych Version:**
   ```bash
   npm list jspsych
   # Should be v8.0.0 or later
   ```

3. **Check Initialization Order:**
   ```javascript
   // Correct order
   const jsPsych = initJsPsych();
   const timeline = createTimeline(jsPsych, options);
   
   // Incorrect order
   const timeline = createTimeline(jsPsych, options);
   const jsPsych = initJsPsych(); // Too late!
   ```

## Runtime Issues

### Timeline Execution Problems

#### Error: Timeline appears empty or doesn't start
**Symptoms:**
- Blank screen after initialization
- No instructions appear
- Console shows no errors

**Debugging Steps:**
1. **Check Timeline Creation:**
   ```javascript
   const timeline = createTimeline(jsPsych, options);
   console.log('Timeline length:', timeline.length);
   console.log('Timeline content:', timeline);
   ```

2. **Verify jsPsych.run() Call:**
   ```javascript
   jsPsych.run(timeline);
   ```

3. **Check for JavaScript Errors:**
   - Open browser developer tools
   - Check console for error messages
   - Look for failed network requests

#### Error: Trials skip or display incorrectly
**Symptoms:**
- Trials advance without user input
- Stimuli don't display properly
- Buttons don't respond

**Solutions:**
1. **Check Trial Timeout:**
   ```javascript
   createTimeline(jsPsych, {
       trial_timeout: 3000 // Ensure reasonable timeout
   });
   ```

2. **Verify Color Names:**
   ```javascript
   // Valid CSS color names
   choice_of_colors: ['RED', 'GREEN', 'BLUE', 'YELLOW']
   
   // Invalid - will cause display issues
   choice_of_colors: ['CRIMSON', 'LIME', 'NAVY', 'GOLD']
   ```

3. **Check Grid Layout:**
   ```javascript
   // Ensure grid can fit all colors
   number_of_rows: 2,
   number_of_columns: 2, // 2×2 = 4 slots for 4 colors
   choice_of_colors: ['RED', 'GREEN', 'BLUE', 'YELLOW']
   ```

### Data Collection Issues

#### Problem: No data recorded
**Symptoms:**
- `jsPsych.data.get()` returns empty
- CSV export contains no trials
- Results screen shows no data

**Solutions:**
1. **Check Data Collection:**
   ```javascript
   // Add debug logging
   jsPsych.data.addProperties({
       participant_id: 'test_' + Date.now()
   });
   
   // Check data after each trial
   console.log('Current data:', jsPsych.data.get().last(1).values());
   ```

2. **Verify Trial Completion:**
   ```javascript
   // Ensure trials are finishing properly
   on_finish: (data) => {
       console.log('Trial finished:', data);
   }
   ```

3. **Check for Premature Termination:**
   - Verify no `jsPsych.endExperiment()` calls
   - Check for navigation events
   - Ensure no JavaScript errors interrupt flow

#### Problem: Incorrect response mapping
**Symptoms:**
- Wrong answers marked as correct
- Response indices don't match buttons
- Accuracy calculations seem wrong

**Solutions:**
1. **Verify Response Mapping:**
   ```javascript
   // Check color array order
   const colors = ['RED', 'GREEN', 'BLUE', 'YELLOW'];
   // Button index 0 = RED, 1 = GREEN, 2 = BLUE, 3 = YELLOW
   ```

2. **Debug Response Values:**
   ```javascript
   on_finish: (data) => {
       console.log('Response:', data.response);
       console.log('Correct response:', data.correct_response);
       console.log('Correct:', data.correct);
   }
   ```

3. **Check Button Generation:**
   ```javascript
   // Ensure consistent button order
   choices: choice_of_colors, // Should match stimulus generation
   ```

## Performance Issues

### Slow Response Times

#### Problem: Experiment runs slowly
**Symptoms:**
- Long delays between trials
- Sluggish button responses
- High CPU usage

**Solutions:**
1. **Optimize Trial Count:**
   ```javascript
   // Reduce trials for testing
   createTimeline(jsPsych, {
       practice_trials_per_condition: 1,
       congruent_main_trials: 3,
       incongruent_main_trials: 3
   });
   ```

2. **Disable Unnecessary Features:**
   ```javascript
   createTimeline(jsPsych, {
       include_fixation: false,
       show_practice_feedback: false,
       show_results: false
   });
   ```

3. **Browser Optimization:**
   - Close unnecessary tabs
   - Disable browser extensions
   - Use Chrome or Firefox for best performance

### Memory Issues

#### Problem: Browser crashes or becomes unresponsive
**Symptoms:**
- "Out of memory" errors
- Browser freezes
- Slow timeline generation

**Solutions:**
1. **Reduce Stimulus Count:**
   ```javascript
   createTimeline(jsPsych, {
       choice_of_colors: ['RED', 'BLUE'] // Fewer colors = fewer stimuli
   });
   ```

2. **Optimize Data Storage:**
   ```javascript
   // Clear unnecessary data
   jsPsych.data.addProperties({
       experiment_id: 'stroop_task'
   });
   ```

3. **Monitor Memory Usage:**
   - Use browser developer tools
   - Check memory tab during experiment
   - Consider shorter sessions for large experiments

## Display Issues

### Visual Problems

#### Problem: Colors don't display correctly
**Symptoms:**
- Words appear in wrong colors
- Buttons show incorrect colors
- Colors look different across devices

**Solutions:**
1. **Use Standard Color Names:**
   ```javascript
   // Good - standard CSS colors
   choice_of_colors: ['red', 'green', 'blue', 'yellow']
   
   // Problematic - non-standard colors
   choice_of_colors: ['crimson', 'lime', 'navy', 'gold']
   ```

2. **Test Color Consistency:**
   ```javascript
   // Add color validation
   const validColors = ['red', 'green', 'blue', 'yellow'];
   const userColors = choice_of_colors.map(c => c.toLowerCase());
   ```

3. **Check Display Settings:**
   - Verify monitor color calibration
   - Test on multiple devices
   - Consider colorblind accessibility

#### Problem: Layout issues on mobile devices
**Symptoms:**
- Buttons too small to tap
- Text overlaps or truncates
- Scrolling interferes with responses

**Solutions:**
1. **Responsive Button Layout:**
   ```javascript
   createTimeline(jsPsych, {
       number_of_rows: 4,
       number_of_columns: 1 // Vertical layout for mobile
   });
   ```

2. **Add CSS Customization:**
   ```css
   /* Mobile-friendly button styles */
   .jspsych-btn {
       min-height: 60px;
       min-width: 120px;
       font-size: 18px;
   }
   ```

3. **Test on Target Devices:**
   - Use browser developer tools
   - Test on actual mobile devices
   - Consider touch vs mouse interactions

## Error Messages

### Common Error Messages

#### "Cannot read property 'length' of undefined"
**Cause:** Timeline array is undefined
**Solution:** Check timeline creation and parameter passing

#### "jsPsych.data.get() is not a function"
**Cause:** jsPsych not properly initialized
**Solution:** Verify jsPsych initialization and version

#### "Invalid choice parameter"
**Cause:** Button choices don't match expected format
**Solution:** Check `choice_of_colors` array format

#### "Trial timeout must be a number"
**Cause:** Invalid timeout parameter
**Solution:** Ensure `trial_timeout` is a positive number

## Debugging Strategies

### Systematic Debugging

1. **Start Simple:**
   ```javascript
   // Minimal configuration for testing
   const timeline = createTimeline(jsPsych, {
       practice_trials_per_condition: 1,
       congruent_main_trials: 1,
       incongruent_main_trials: 1
   });
   ```

2. **Add Logging:**
   ```javascript
   // Log key events
   on_trial_start: () => console.log('Trial started'),
   on_trial_finish: (data) => console.log('Trial finished:', data)
   ```

3. **Test Incrementally:**
   - Add one feature at a time
   - Test after each change
   - Keep working version as backup

### Browser Developer Tools

1. **Console Tab:**
   - Check for error messages
   - Add debug logging
   - Test individual functions

2. **Network Tab:**
   - Verify resource loading
   - Check for failed requests
   - Monitor timing

3. **Performance Tab:**
   - Monitor memory usage
   - Check for performance bottlenecks
   - Identify slow operations

## Getting Help

### Before Seeking Help

1. **Check Version Compatibility:**
   - jsPsych version ≥ 8.0.0
   - Browser compatibility
   - Package version

2. **Gather Debug Information:**
   - Browser and version
   - Operating system
   - Console error messages
   - Minimal reproduction example

3. **Review Documentation:**
   - README.md for basic usage
   - Parameter guide for configuration
   - Data handling guide for output

### Support Resources

1. **jsPsych Community:**
   - Official jsPsych documentation
   - GitHub issues for jsPsych
   - Community forums

2. **Bug Reports:**
   - Include minimal reproduction case
   - Provide system information
   - Describe expected vs actual behavior

3. **Feature Requests:**
   - Explain use case
   - Suggest implementation approach
   - Consider backward compatibility