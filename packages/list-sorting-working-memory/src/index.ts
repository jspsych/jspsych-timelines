import jsPsychAudioKeyboardResponse from "@jspsych/plugin-audio-keyboard-response";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
// import jsPsychPreload from "@jspsych/plugin-preload";
import { JsPsych } from "jspsych";

import {
  animalStimuli as animalStimuliImport,
  foodStimuli as foodStimuliImport,
} from "./stimuli.js";

// Cast imported stimuli to required types
const animalStimuli = animalStimuliImport as Array<Array<listSortingWorkingMemoryTestStimulusInfo>>;
const foodStimuli = foodStimuliImport as Array<Array<listSortingWorkingMemoryTestStimulusInfo>>;

interface listSortingWorkingMemoryTestStimulusInfo {
  stimulus_image: string;
  stimulus_audio: string;
}

// Timeline Units
function startTrial(jsPsych: JsPsych) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<div style="font-size: 24px;">Start</div>',
    choices: ["Start"],
  };
}
function fixationTrial(jsPsych: JsPsych) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="font-size: 48px;">+</div>',
    choices: "NO_KEYS",
    trial_duration: 1000,
  };
}

function lswmTrial(jsPsych: JsPsych) {
  return {
    type: jsPsychAudioKeyboardResponse,
    stimulus: jsPsych.timelineVariable("stimulus_audio"),
    prompt: jsPsych.timelineVariable("stimulus_image"),
    choices: "NO_KEYS",
    trial_duration: 2000,
  };
}

// timeline units
function lswmTrialSequence(
  jsPsych: JsPsych,
  options: {
    stimulus_set_list: Array<Array<listSortingWorkingMemoryTestStimulusInfo>>;
    sequence_length: number;
  }
) {
  const stimulusSets = jsPsych.randomization.sampleWithoutReplacement(
    options.stimulus_set_list,
    Math.min(options.sequence_length, options.stimulus_set_list.length)
  );

  const timelineVariables = stimulusSets.map((innerArray) => {
    return jsPsych.randomization.sampleWithoutReplacement(innerArray, 1)[0];
  });

  return {
    timeline: [lswmTrial(jsPsych)],
    timeline_variables: timelineVariables,
  };
}

function lswmSection(
  jsPsych: JsPsych,
  options: {
    stimulus_set_list: Array<Array<Array<listSortingWorkingMemoryTestStimulusInfo>>>;
    sample_size_sequence?: Array<number>;
  }
) {
  // Flatten stimulus_set; include index as stimulus_set_id (which set stimulus came from)
  const stimulusSetFlat = options.stimulus_set_list.flatMap((stimulus_set, list_idx) =>
    stimulus_set.map((stimulus_group) =>
      stimulus_group.map((stimulus) => ({
        stimulus_image: stimulus.stimulus_image,
        stimulus_audio: stimulus.stimulus_audio,
        stimulus_set_id: list_idx,
      }))
    )
  );

  // Truncate sample size values larger than len(stimulusSet)
  if (options.sample_size_sequence) {
    options.sample_size_sequence = options.sample_size_sequence.map((size) =>
      Math.min(size, stimulusSetFlat.length)
    );
  } else {
    // If sample_size_sequence is not provided, set it to 1...min(len(stimulusSetFlat), 7)
    options.sample_size_sequence = Array.from(
      { length: Math.min(stimulusSetFlat.length, 7) },
      (_, i) => i + 1
    );
  }

  let sectionTimeline = [];
  for (let i = 0; i < options.sample_size_sequence.length; i++) {
    sectionTimeline.push(
      lswmTrialSequence(jsPsych, {
        stimulus_set_list: stimulusSetFlat,
        sequence_length: options.sample_size_sequence[i],
      })
    );
    sectionTimeline.push(fixationTrial(jsPsych));
  }

  return sectionTimeline;
}

// Main function
export function createTimeline(
  jsPsych: JsPsych,
  options: {
    in_person?: boolean;
    stimulus_set?: Array<Array<Array<listSortingWorkingMemoryTestStimulusInfo>>>;
    dimensions_sequence?: Array<number>;
  }
) {
  // Default options
  const defaultOptions = {
    in_person: true,
    stimulus_set: [animalStimuli, foodStimuli],
  };

  // Merge default options with user options
  options = {
    ...defaultOptions,
    ...options,
  };

  if (options.dimensions_sequence == null) {
    // Set dimensions_sequence to 1...len(stimulus_set) if not provided
    options.dimensions_sequence = Array.from(
      { length: options.stimulus_set.length },
      (_, i) => i + 1
    );
    console.log(options.dimensions_sequence);
  } else {
    // Truncate values in dimensions_sequence larger than len(stimulus_set) if provided
    options.dimensions_sequence = options.dimensions_sequence.map((dimension) =>
      Math.min(dimension, options.stimulus_set.length)
    );
  }

  let timeline = [];
  timeline.push(startTrial(jsPsych));
  for (let i = 0; i < options.dimensions_sequence.length; i++) {
    timeline.push(
      lswmSection(jsPsych, {
        stimulus_set_list: options.stimulus_set.slice(0, options.dimensions_sequence[i]),
      })
    );
  }
  return timeline;
}

export const timelineUnits = {
  lswmTrial,
  lswmTrialSequence,
  // lswmSection,
};

export const utils = {
  animalStimuli,
  foodStimuli,
};
