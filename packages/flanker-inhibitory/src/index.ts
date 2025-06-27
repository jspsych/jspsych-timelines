import { JsPsych } from "jspsych";
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import { trial_text, instruction_pages } from './text';
import { layered_stimuli, fish_only, arrow_only } from './stimuli';

// ============================================================================
// LAYERED SVG UTILITIES
// ============================================================================

// ============================================================================
// SVG UTILITIES
// ============================================================================

// Function to horizontally flip an SVG - works for all SVGs
function flipSVG(svgString: string): string {
  // Parse the SVG to extract viewBox and content
  const svgMatch = svgString.match(/<svg[^>]*>/);
  if (!svgMatch) return svgString;
  
  const svgTag = svgMatch[0];
  const svgContent = svgString.replace(svgTag, '').replace('</svg>', '');
  
  // Extract viewBox if it exists
  const viewBoxMatch = svgTag.match(/viewBox="([^"]+)"/);
  let viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 48 48';
  const viewBoxParts = viewBox.split(' ');
  const vbWidth = parseFloat(viewBoxParts[2]) || 48;
  
  // Extract width and height
  const widthMatch = svgTag.match(/width="([^"]+)"/);
  const heightMatch = svgTag.match(/height="([^"]+)"/);
  const width = widthMatch ? widthMatch[1] : '48';
  const height = heightMatch ? heightMatch[1] : '48';
  
  // Check if SVG already has a horizontal flip transform
  const hasFlipTransform = svgTag.includes('transform="matrix(-1,') || 
                          svgTag.includes('transform="matrix(-1 ') ||
                          svgTag.includes('transform="scale(-1');
  
  // If already flipped, remove the flip transform instead of adding another
  if (hasFlipTransform) {
    // Remove existing flip transforms and return the content directly
    let cleanedTag = svgTag
      .replace(/transform="[^"]*"/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Ensure we have proper attributes
    if (!cleanedTag.includes('xmlns')) {
      cleanedTag = cleanedTag.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!cleanedTag.includes('width')) {
      cleanedTag = cleanedTag.replace('<svg', `<svg width="${width}"`);
    }
    if (!cleanedTag.includes('height')) {
      cleanedTag = cleanedTag.replace('<svg', `<svg height="${height}"`);
    }
    if (!cleanedTag.includes('viewBox')) {
      cleanedTag = cleanedTag.replace('<svg', `<svg viewBox="${viewBox}"`);
    }
    
    return `${cleanedTag}${svgContent}</svg>`;
  } else {
    // Create a new SVG with a wrapper group that flips the content
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">
      <g transform="scale(-1,1) translate(-${vbWidth},0)">
        ${svgContent}
      </g>
    </svg>`;
  }
}

// Function to layer multiple SVGs on top of each other
function layerSVGs(svgArray: string[]): string {
  if (!svgArray || !Array.isArray(svgArray) || svgArray.length === 0) return '';
  if (svgArray.length === 1) return svgArray[0];
  
  // Create a container div with relative positioning
  let layeredHTML = '<div style="position: relative; display: inline-block;">';
  
  svgArray.forEach((svg, index) => {
    const style = index === 0 
      ? 'position: relative;' 
      : 'position: absolute; top: 0; left: 0;';
    layeredHTML += `<div style="${style}">${svg}</div>`;
  });
  
  layeredHTML += '</div>';
  return layeredHTML;
}

// Function to process layered stimuli - creates left/right from SVG arrays
function processLayeredStimuli(stimuli: { left?: string[], right?: string[] } | string[]) {
  // If it's a simple array, treat it as right-facing
  if (Array.isArray(stimuli)) {
    const rightLayered = layerSVGs(stimuli);
    const leftLayered = layerSVGs(stimuli.map(svg => flipSVG(svg)));
    return {
      left: leftLayered,
      right: rightLayered
    };
  }
  
  // If object with left/right arrays
  if (stimuli.left && !stimuli.right) {
    const leftLayered = layerSVGs(stimuli.left);
    const rightLayered = layerSVGs(stimuli.left.map(svg => flipSVG(svg)));
    return {
      left: leftLayered,
      right: rightLayered
    };
  } else if (stimuli.right && !stimuli.left) {
    const rightLayered = layerSVGs(stimuli.right);
    const leftLayered = layerSVGs(stimuli.right.map(svg => flipSVG(svg)));
    return {
      left: leftLayered,
      right: rightLayered
    };
  } else if (stimuli.left && stimuli.right) {
    return {
      left: layerSVGs(stimuli.left),
      right: layerSVGs(stimuli.right)
    };
  } else {
    // Neither provided, use default layered
    const rightLayered = layerSVGs(layered_stimuli);
    const leftLayered = layerSVGs(layered_stimuli.map(svg => flipSVG(svg)));
    return {
      left: leftLayered,
      right: rightLayered
    };
  }
}

export const default_stimuli = processLayeredStimuli(layered_stimuli);

export const fish_stimuli = processLayeredStimuli(fish_only);

export const arrow_stimuli = processLayeredStimuli(arrow_only);

// ============================================================================
// STIMULUS CREATION FUNCTIONS
// ============================================================================

export function createFlankerStim(direction, congruent, stimuli: string[] | { left?: string[]; right?: string[] } | { left: string; right: string } = layered_stimuli, stimuli_amount: number = 5) {
  // Ensure stimuli_amount is valid (odd number ≥3)
  let safeAmount = typeof stimuli_amount === 'number' && !isNaN(stimuli_amount) && isFinite(stimuli_amount) ? stimuli_amount : 5;
  const validAmount = Math.max(3, safeAmount % 2 === 0 ? safeAmount + 1 : safeAmount);
  const halfFlankers = Math.floor(validAmount / 2);
  
  // Handle different input types
  let processedStimuli;
  if (Array.isArray(stimuli) || (stimuli && ('left' in stimuli || 'right' in stimuli) && Array.isArray(stimuli.left || stimuli.right))) {
    processedStimuli = processLayeredStimuli(stimuli as string[] | { left?: string[]; right?: string[] });
  } else {
    // Already processed stimuli with left/right strings
    processedStimuli = stimuli as { left: string; right: string };
  }
  const center = processedStimuli[direction];
  const flanker = congruent ? processedStimuli[direction] : processedStimuli[direction === 'left' ? 'right' : 'left'];
  
  let html = `<div class="flanker-stim">`;
  
  // Add left flankers
  for (let i = 0; i < halfFlankers; i++) {
    html += `<span>${flanker}</span>`;
  }
  
  // Add center stimulus
  html += `<span class="center">${center}</span>`;
  
  // Add right flankers
  for (let i = 0; i < halfFlankers; i++) {
    html += `<span>${flanker}</span>`;
  }
  
  html += `</div>`;
  return html;
}

export function createPracticeStim(direction, congruent, stimuli: string[] | { left?: string[]; right?: string[] } | { left: string; right: string } = layered_stimuli, stimuli_amount: number = 5) {
  // Ensure stimuli_amount is valid (odd number ≥3)
  let safeAmount = typeof stimuli_amount === 'number' && !isNaN(stimuli_amount) && isFinite(stimuli_amount) ? stimuli_amount : 5;
  const validAmount = Math.max(3, safeAmount % 2 === 0 ? safeAmount + 1 : safeAmount);
  const halfFlankers = Math.floor(validAmount / 2);
  
  // Handle different input types
  let processedStimuli;
  if (Array.isArray(stimuli) || (stimuli && ('left' in stimuli || 'right' in stimuli) && Array.isArray(stimuli.left || stimuli.right))) {
    processedStimuli = processLayeredStimuli(stimuli as string[] | { left?: string[]; right?: string[] });
  } else {
    // Already processed stimuli with left/right strings
    processedStimuli = stimuli as { left: string; right: string };
  }
  const center = processedStimuli[direction];
  const flanker = congruent ? processedStimuli[direction] : processedStimuli[direction === 'left' ? 'right' : 'left'];
  
  let html = `<div class="flanker-stim practice">`;
  
  // Add left flankers
  for (let i = 0; i < halfFlankers; i++) {
    html += `<span>${flanker}</span>`;
  }
  
  // Add center stimulus with highlighting
  html += `<span class="center highlighted">${center}</span>`;
  
  // Add right flankers
  for (let i = 0; i < halfFlankers; i++) {
    html += `<span>${flanker}</span>`;
  }
  
  html += `</div>`;
  return html;
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface FlankerConfig {
  stimuli_type?: 'fish' | 'arrow' | 'layered';
  custom_stimuli?: { left?: string[]; right?: string[] };
  svg?: string[]; // Override parameter - array of SVGs to layer
  stimuli_amount?: number; // Number of stimuli in flanker display (default: 5, must be odd ≥3)
  fixation_duration?: number;
  show_instructions?: boolean;
  show_practice?: boolean;
  num_practice?: number;
  num_trials?: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculatePerformance(data: any[]) {
  const trial_data = data.filter(d => d.task === 'flanker');
  
  if (trial_data.length === 0) {
    return { accuracy: 0, mean_rt: 0, total_trials: 0 };
  }
  
  const correct_trials = trial_data.filter(d => d.correct);
  const accuracy = (correct_trials.length / trial_data.length) * 100;
  const mean_rt = correct_trials.length > 0 
    ? correct_trials.reduce((sum, d) => sum + d.rt, 0) / correct_trials.length 
    : 0;
  
  return {
    accuracy,
    mean_rt,
    total_trials: trial_data.length,
    correct_trials: correct_trials.length
  };
}

// ============================================================================
// MAIN TIMELINE FUNCTION
// ============================================================================

export function createTimeline(jsPsych: JsPsych, config: FlankerConfig = {}) {
  const {
    stimuli_type = 'layered',
    custom_stimuli,
    svg,
    stimuli_amount = 5,
    fixation_duration = 500,
    show_instructions = true,
    show_practice = true,
    num_practice = 8,
    num_trials = 20,
  } = config;

  // Determine which stimuli to use based on priority:
  // 1. svg override parameter (highest priority)
  // 2. custom_stimuli 
  // 3. stimuli_type selection
  let stimuli;
  if (svg) {
    stimuli = svg; // Use the SVG override array directly
  } else if (custom_stimuli) {
    stimuli = custom_stimuli;
  } else if (stimuli_type === 'arrow') {
    stimuli = arrow_stimuli;
  } else if (stimuli_type === 'fish') {
    stimuli = fish_stimuli;
  } else {
    stimuli = default_stimuli; // layered by default
  }
  const timeline = [];

  // Instructions
  if (show_instructions) {
    instruction_pages.forEach((page, index) => {
      timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: `
          <div class="flanker-instructions">
            ${page.header ? `<h1>${page.header}</h1>` : ''}
            ${page.header2 ? `<h2>${page.header2}</h2>` : ''}
            ${page.description ? `<p>${page.description}</p>` : ''}
            ${page.task_explanation ? `<p>${page.task_explanation}</p>` : ''}
            ${page.performance_note ? `<p class="performance-note">${page.performance_note}</p>` : ''}
            ${page.strategy_title ? `<h2>${page.strategy_title}</h2>` : ''}
            ${page.strategy_intro ? `<p>${page.strategy_intro}</p>` : ''}
            ${page.strategy_points ? `
              <ul>
                ${page.strategy_points.map(point => `<li>${point}</li>`).join('')}
              </ul>
            ` : ''}
            ${page.start_prompt ? `<p class="start-prompt">${page.start_prompt}</p>` : ''}
          </div>
        `,
        choices: page.buttons || [trial_text.continue_button],
        data: { task: 'instructions', page: index + 1 }
      });
    });
  }

  // Practice
  if (show_practice) {
    // Practice intro
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <div class="flanker-instructions">
          <h2>${trial_text.practice_header}</h2>
          <p>${trial_text.practice_intro_message}</p>
        </div>
      `,
      choices: [trial_text.start_button],
      data: { task: 'practice-intro' }
    });

    // Practice trials
    const practice_variables = [
      {direction: 'left', congruent: true},
      {direction: 'left', congruent: false},
      {direction: 'right', congruent: true},
      {direction: 'right', congruent: false},
    ];

    const practice_trials = jsPsych.randomization.repeat(practice_variables, Math.floor(num_practice/4))
      .concat(jsPsych.randomization.sampleWithoutReplacement(practice_variables, num_practice%4));

    // Fixation
    const practice_fixation = {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<div class="fixation">${trial_text.fixation_cross}</div>`,
      choices: [],
      trial_duration: fixation_duration,
      data: { task: 'fixation', phase: 'practice' }
    };

    // Practice trial
    const practice_trial = {
      type: jsPsychHtmlButtonResponse,
      stimulus: function() {
        const direction = jsPsych.evaluateTimelineVariable('direction');
        const congruent = jsPsych.evaluateTimelineVariable('congruent');
        return `
          <div class="flanker-trial">
            <div class="trial-prompt">${trial_text.main_task_prompt}</div>
            ${createPracticeStim(direction, congruent, stimuli, stimuli_amount)}
          </div>
        `;
      },
      choices: [trial_text.left_button, trial_text.right_button],
      data: {
        task: 'flanker',
        phase: 'practice',
        direction: jsPsych.timelineVariable('direction'),
        congruent: jsPsych.timelineVariable('congruent')
      },
      on_finish: function(data: any) {
        const correct_response = data.direction === 'left' ? 0 : 1;
        data.correct = data.response === correct_response;
      }
    };

    // Feedback
    const practice_feedback = {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        const last_trial = jsPsych.data.get().last(1).values()[0];
        const feedback = last_trial.correct ? trial_text.correct_feedback : trial_text.incorrect_feedback;
        return `<div class="feedback ${last_trial.correct ? 'correct' : 'incorrect'}">${feedback}</div>`;
      },
      choices: [],
      trial_duration: 1000,
      data: { task: 'feedback', phase: 'practice' }
    };

    // Practice timeline
    timeline.push({
      timeline: [practice_fixation, practice_trial, practice_feedback],
      timeline_variables: practice_trials,
      randomize_order: true
    });

    // Practice completion
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        const practice_data = jsPsych.data.get().filter({task: 'flanker', phase: 'practice'}).values();
        const performance = calculatePerformance(practice_data);
        
        return `
          <div class="flanker-instructions">
            <h2>${trial_text.practice_complete_header}</h2>
            <p>${trial_text.practice_complete_message}</p>
            <p>${trial_text.accuracy_label} ${performance.accuracy.toFixed(1)}%</p>
          </div>
        `;
      },
      choices: [trial_text.continue_button],
      data: { task: 'practice-complete' }
    });
  }

  // Main task
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div class="flanker-instructions">
        <h2>${trial_text.main_task_header}</h2>
        <p>${trial_text.main_task_intro}</p>
      </div>
    `,
    choices: [trial_text.ready_button],
    data: { task: 'main-intro' }
  });

  // Main trials
  const trial_variables = [
    {direction: 'left', congruent: true},
    {direction: 'left', congruent: false},
    {direction: 'right', congruent: true},
    {direction: 'right', congruent: false},
  ];

  const main_trials = jsPsych.randomization.repeat(trial_variables, Math.floor(num_trials/4))
    .concat(jsPsych.randomization.sampleWithoutReplacement(trial_variables, num_trials%4));

  // Fixation
  const fixation = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="fixation">${trial_text.fixation_cross}</div>`,
    choices: [],
    trial_duration: fixation_duration,
    data: { task: 'fixation', phase: 'main' }
  };

  // Main trial
  const flanker_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
      const direction = jsPsych.evaluateTimelineVariable('direction');
      const congruent = jsPsych.evaluateTimelineVariable('congruent');
      return `
        <div class="flanker-trial">
          <div class="trial-prompt">${trial_text.main_task_prompt}</div>
          ${createFlankerStim(direction, congruent, stimuli, stimuli_amount)}
        </div>
      `;
    },
    choices: [trial_text.left_button, trial_text.right_button],
    data: {
      task: 'flanker',
      phase: 'main',
      direction: jsPsych.timelineVariable('direction'),
      congruent: jsPsych.timelineVariable('congruent')
    },
    on_finish: function(data: any) {
      const correct_response = data.direction === 'left' ? 0 : 1;
      data.correct = data.response === correct_response;
    }
  };

  // Main task timeline
  timeline.push({
    timeline: [fixation, flanker_trial],
    timeline_variables: main_trials,
    randomize_order: true
  });

  // Completion
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const main_data = jsPsych.data.get().filter({task: 'flanker', phase: 'main'}).values();
      const performance = calculatePerformance(main_data);
      
      return `
        <div class="flanker-instructions">
          <h2>${trial_text.task_complete_header}</h2>
          <p>${trial_text.task_complete_message}</p>
          <div class="performance-summary">
            <h3>${trial_text.performance_title}</h3>
            <p>${trial_text.accuracy_label} ${performance.accuracy.toFixed(1)}%</p>
            <p>${trial_text.response_time_label} ${performance.mean_rt.toFixed(0)}ms</p>
          </div>
        </div>
      `;
    },
    choices: [trial_text.end_button],
    data: { task: 'complete' }
  });

  return {
    timeline: timeline
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const timelineUnits = {
  instructions: "Instructions for the flanker inhibitory control task",
  practice: "Practice trials with feedback",
  main: "Main flanker task trials",
  completion: "Task completion screen"
};

export const utils = {
  calculatePerformance,
  createFlankerStim,
  createPracticeStim
};

// Export text for external use
export { trial_text, instruction_pages } from './text';

// Default export
export default { createTimeline, timelineUnits, utils };