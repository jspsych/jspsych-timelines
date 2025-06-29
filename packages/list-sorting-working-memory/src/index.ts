import jsPsychAudioKeyboardResponse from "@jspsych/plugin-audio-keyboard-response";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
// import jsPsychPreload from "@jspsych/plugin-preload";
import { JsPsych } from "jspsych";

import {
  animalStimuli as animalStimuliImport,
  defaultStimuli as defaultStimuliImport,
  foodStimuli as foodStimuliImport,
} from "./stimuli.js";

// Cast imported stimuli to required types
const animalStimuli = animalStimuliImport as Array<Array<listSortingWorkingMemoryTestStimulus>>;
const foodStimuli = foodStimuliImport as Array<Array<listSortingWorkingMemoryTestStimulus>>;
const defaultStimuli = defaultStimuliImport as Array<listSortingWorkingMemoryTestStimulusSet>;

const oneListInstructionText =
  "You are going to see some pictures one at a time on the screen. When you hear the chime, tell me the pictures you just saw in size order from smallest to biggest. For example, if you see a motorcycle, a bus, and a car, you would say: motorcycle, car, bus. Are you ready to practice?";

const twoListInstructionText =
  "You are going to see two lists of pictures. After each list, you will be asked to remember the pictures in size order from smallest to biggest. Are you ready to practice?";

interface listSortingWorkingMemoryTestStimulus {
  stimulus_name: string;
  stimulus_image: string;
  stimulus_audio: string;
  stimulus_set_id?: string; // Optional, used for grouping stimuli in sets
}

interface listSortingWorkingMemoryTestStimulusSet {
  stimulus_set_name: string;
  stimulus_set: Array<Array<listSortingWorkingMemoryTestStimulus>>;
}

function cleanExcludedSets(
  stimulus_set_list: Array<listSortingWorkingMemoryTestStimulusSet>,
  excluded_sets: Array<string | number>
) {
  for (let i = excluded_sets.length - 1; i >= 0; i--) {
    const excluded_set = excluded_sets[i];
    if (typeof excluded_set === "number") {
      if (
        excluded_set < 0 ||
        excluded_set >= stimulus_set_list.length ||
        !Number.isInteger(excluded_set)
      ) {
        excluded_sets.splice(i, 1);
        throw new Error(
          `Excluded set index "${excluded_set}" is out of bounds and has been removed.`
        );
      } else {
        excluded_sets[i] = stimulus_set_list[excluded_set].stimulus_set_name;
      }
    } else if (typeof excluded_set === "string") {
      const match = stimulus_set_list.some(
        (set) => set.stimulus_set_name.trim().toLowerCase() === excluded_set.trim().toLowerCase()
      );
      if (!match) {
        excluded_sets.splice(i, 1);
        throw new Error(`Excluded set "${excluded_set}" was not found and has been removed.`);
      }
    }
  }

  // Deduplicate in-place
  const seen = new Set();
  for (let i = excluded_sets.length - 1; i >= 0; i--) {
    const val =
      typeof excluded_sets[i] === "string"
        ? (excluded_sets[i] as string).trim().toLowerCase()
        : excluded_sets[i];
    if (seen.has(val)) {
      excluded_sets.splice(i, 1);
    } else {
      seen.add(val);
    }
  }
}

function getRandomSubarray(arr, size) {
  var shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

function sampleStimulusAcrossSets<T extends { stimulus_set_id: string }>(
  stimulus_set_list: T[][],
  sample_size: number = 1
): T[] {
  const flat = stimulus_set_list.flat();

  const groups: Record<string, T[]> = {};
  for (const item of flat) {
    if (!groups[item.stimulus_set_id]) {
      groups[item.stimulus_set_id] = [];
    }
    groups[item.stimulus_set_id].push(item);
  }

  // Shuffle each group
  for (const id in groups) {
    const items = groups[id];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  }

  const sampled: T[] = [];
  const groupIds = Object.keys(groups);
  let groupIndex = 0;

  while (sampled.length < sample_size && sampled.length < flat.length) {
    const currentGroupId = groupIds[groupIndex % groupIds.length];
    const group = groups[currentGroupId];

    if (group && group.length > 0) {
      sampled.push(group.pop()!);
    }

    groupIndex++;
  }

  // Shuffle the final sampled array
  for (let i = sampled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sampled[i], sampled[j]] = [sampled[j], sampled[i]];
  }

  return sampled;
}

// Timeline Units
function instructionTrial(instruction_text?: string, button_text?: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div style="font-size: 24px;">${
      instruction_text ||
      "You are going to see some pictures one at a time on the screen. When you hear the chime, tell me the pictures you just saw in size order from smallest to biggest. For example, if you see a motorcycle, a bus, and a car, you would say: motorcycle, car, bus. Are you ready to practice?"
    }</div>`,
    choices: [button_text || "Yes"],
  };
}

function practiceTrial() {}

function answerTrial(
  jsPsych: JsPsych,
  stimulusSetList: Array<listSortingWorkingMemoryTestStimulusSet>,
  dimension: number
) {
  return {
    type: jsPsychSurveyText,
    questions: [], // Populated by on_start
    randomize_question_order: true,
    on_start: (trial) => {
      const sequenceData = jsPsych.data.getLastTimelineData()["trials"];

      const groups: Record<string, any[]> = {};

      // Group by stimulus_set_id
      for (const trialData of sequenceData) {
        const id = trialData.stimulus_set_id;
        if (!groups[id]) groups[id] = [];
        groups[id].push(trialData);
      }

      // Get correct order for each stimulus set
      const correctAnswer = Object.entries(groups).map(([stimulus_set_id, trials]) => {
        const sorted = trials.sort((a, b) => a.stimulus_index - b.stimulus_index);
        const correct_order = sorted.map((t) => t.stimulus_name);
        return { stimulus_set_id, correct_order };
      });

      // Dynamically set the questions
      trial.questions = correctAnswer.map((group) => ({
        prompt: `Order the ${group.stimulus_set_id} from smallest to largest in size, separated by commas:`,
        name: `response_${group.stimulus_set_id}`,
        placeholder: group.correct_order.join(", "), // optional, shows correct answer for debugging
      }));
    },
  };
}

function lswmTrial(
  jsPsych: JsPsych,
  sampledSetIds: Set<string> = new Set(),
  taskType: "practice" | "live" = "live"
) {
  return {
    type: jsPsychAudioKeyboardResponse,
    stimulus: jsPsych.timelineVariable("stimulus_audio"),
    prompt: () => {
      const stimulus_image = jsPsych.evaluateTimelineVariable("stimulus_image");
      const stimulus_name = jsPsych.evaluateTimelineVariable("stimulus_name");
      return `
      <div style="text-align: center;">
        ${stimulus_image}
        <div style="font-size: 24px;">${stimulus_name}</div>
      </div>
    `;
    },
    choices: ["f"],
    data: () => {
      const stimulusName = jsPsych.evaluateTimelineVariable("stimulus_name");
      const stimulusSetId = jsPsych.evaluateTimelineVariable("stimulus_set_id");
      const stimulusIndex = jsPsych.evaluateTimelineVariable("stimulus_index");
      return {
        task: taskType,
        timeline_unit_type: "lswmTrial",
        sampled_set_ids: sampledSetIds,
        stimulus_name: stimulusName,
        stimulus_set_id: stimulusSetId,
        stimulus_index: stimulusIndex,
      };
    },
  };
}

// timeline units
function lswmTrialSequence(
  jsPsych: JsPsych,
  options: {
    dimension: number;
    stimulus_set_list: Array<listSortingWorkingMemoryTestStimulusSet>;
    sequence_length: number;
  }
) {
  // The sampled list of stimulus sets for this section is standardized
  const stimulus_set_subarray = getRandomSubarray(options.stimulus_set_list, options.dimension);

  // Get flat array of stimuli for the section
  let stimulus_set_subarray_flat = [];
  for (const set of stimulus_set_subarray) {
    for (let i = 0; i < set.stimulus_set.length; i++) {
      const group = set.stimulus_set[i];
      const processedGroup = group.map((stimulus, index) => ({
        stimulus_name: stimulus.stimulus_name,
        stimulus_image: stimulus.stimulus_image,
        stimulus_audio: stimulus.stimulus_audio,
        stimulus_set_id: set.stimulus_set_name,
        stimulus_index: i,
      }));
      stimulus_set_subarray_flat.push(processedGroup);
    }
  }

  if (options.sequence_length > stimulus_set_subarray_flat.length) {
    options.sequence_length = stimulus_set_subarray_flat.length;
    console.warn(
      "Sequence length exceeds available stimuli. Using all stimuli without replacement."
    );
  }

  const timelineVariables = sampleStimulusAcrossSets(
    stimulus_set_subarray_flat,
    options.sequence_length
  );
  const sampledSetIds = new Set(timelineVariables.map((set) => set.stimulus_set_id));

  return {
    timeline: [lswmTrial(jsPsych, sampledSetIds)],
    timeline_variables: timelineVariables,
    sampled_set_ids: sampledSetIds,
    data: {
      sequence_length: options.sequence_length,
    },
  };
}

/**
 * Create a section of the list sorting working memory task.
 * @param jsPsych
 * @param options
 * @returns
 */
function lswmSection(
  jsPsych: JsPsych,
  options: {
    dimension: number;
    stimulus_set_list: Array<listSortingWorkingMemoryTestStimulusSet>;
    sample_size_sequence?: Array<number>;
    excluded_sets?: Array<string | number>;
  }
) {
  // Get list of excluded sets
  if (options.excluded_sets) {
    // Check and filter excluded_sets
    cleanExcludedSets(options.stimulus_set_list, options.excluded_sets);
    // Filter out excluded sets from stimulus_set_list
    options.stimulus_set_list = options.stimulus_set_list.filter(
      (set) => !options.excluded_sets.includes(set.stimulus_set_name)
    );
  }

  // Warn if cleaned stimulus_set_list.length is less than dimension
  if (options.stimulus_set_list.length < options.dimension) {
    console.warn(
      `The number of available stimulus sets (${options.stimulus_set_list.length}) is less than the specified dimension (${options.dimension}). The dimension will be adjusted to match the number of available sets.`
    );
    options.dimension = options.stimulus_set_list.length;
  }

  // If sample_size_sequence is not provided, set it to 2...7)
  if (!options.sample_size_sequence) {
    options.sample_size_sequence = Array.from({ length: 6 }, (_, i) => i + 2);
  }

  // Section timeline
  let sectionTimeline = [];
  for (let i = 0; i < options.sample_size_sequence.length; i++) {
    const trialSequence = lswmTrialSequence(jsPsych, {
      dimension: options.dimension,
      stimulus_set_list: options.stimulus_set_list,
      sequence_length: options.sample_size_sequence[i],
    });
    sectionTimeline.push({
      timeline: [trialSequence, answerTrial(jsPsych, options.stimulus_set_list, options.dimension)],
    });
  }

  return sectionTimeline;
}

/**
 * Create a timeline for the list sorting working memory task.
 * @param jsPsych
 * @param options
 * @returns
 */
export function createTimeline(
  jsPsych: JsPsych,
  options: {
    in_person?: boolean;
    stimulus_set_list?: Array<listSortingWorkingMemoryTestStimulusSet>;
    dimensions_sequence?: Array<number>;
  }
) {
  // Default options
  const defaultOptions = {
    in_person: true,
    stimulus_set_list: defaultStimuli,
  };

  // Merge default options with user options
  options = {
    ...defaultOptions,
    ...options,
  };

  // Get sequence of dimensions (1-list, 2-list, etc.)
  if (options.dimensions_sequence) {
    // Truncate values in dimensions_sequence larger than len(stimulus_set_list)
    options.dimensions_sequence = options.dimensions_sequence.map((dimension) =>
      Math.min(dimension, options.stimulus_set_list.length)
    );
  } else {
    // Set dimensions_sequence to 1...len(stimulus_set_list) if not provided
    options.dimensions_sequence = Array.from(
      { length: options.stimulus_set_list.length },
      (_, i) => i + 1
    );
  }

  // Timeline
  let mainTimeline = [];
  mainTimeline.push(instructionTrial());
  for (let i = 0; i < options.dimensions_sequence.length; i++) {
    mainTimeline.push(
      lswmSection(jsPsych, {
        dimension: options.dimensions_sequence[i],
        stimulus_set_list: options.stimulus_set_list,
      })
    );
  }
  return mainTimeline;
}

export const timelineUnits = {
  lswmTrial,
  lswmTrialSequence,
  lswmSection,
};

export const utils = {
  animalStimuli,
  foodStimuli,
};
