import jsPsychAudioKeyboardResponse from "@jspsych/plugin-audio-keyboard-response";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
// import jsPsychPreload from "@jspsych/plugin-preload";
import { JsPsych } from "jspsych";

import {
  animalStimuli as animalStimuliImport,
  defaultLiveStimuli as defaultLiveStimuliImport,
  foodStimuli as foodStimuliImport,
  oneListPracticeStimuliA as oneListPracticeStimuliAImport,
  oneListPracticeStimuliB as oneListPracticeStimuliBImport,
  twoListPracticeStimuliA as twoListPracticeStimuliAImport,
  twoListPracticeStimuliB as twoListPracticeStimuliBImport,
} from "./stimuli.js";

// Cast imported stimuli to required types
const animalStimuli = animalStimuliImport as Array<Array<listSortingWorkingMemoryTestStimulus>>;
const foodStimuli = foodStimuliImport as Array<Array<listSortingWorkingMemoryTestStimulus>>;
const oneListPracticeStimuliA =
  oneListPracticeStimuliAImport as Array<listSortingWorkingMemoryTestStimulusSet>;
const oneListPracticeStimuliB =
  oneListPracticeStimuliBImport as Array<listSortingWorkingMemoryTestStimulusSet>;
const twoListPracticeStimuliA =
  twoListPracticeStimuliAImport as Array<listSortingWorkingMemoryTestStimulusSet>;
const twoListPracticeStimuliB =
  twoListPracticeStimuliBImport as Array<listSortingWorkingMemoryTestStimulusSet>;
const defaultLiveStimuli =
  defaultLiveStimuliImport as Array<listSortingWorkingMemoryTestStimulusSet>;

const defaultPracticeStimuli = [
  {
    dimension: 1,
    stimulus_set_lists: [oneListPracticeStimuliA, oneListPracticeStimuliB],
  },
  {
    dimension: 2,
    stimulus_set_lists: [twoListPracticeStimuliA, twoListPracticeStimuliB],
  },
];

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

// Utils
function nListPracticeInstructionText(
  stimulusSetList: Array<listSortingWorkingMemoryTestStimulusSet>
) {
  if (stimulusSetList.length <= 0) {
    throw new Error("stimulusSetList must contain at least one stimulus set.");
  } else if (stimulusSetList.length === 1) {
    return `You are going to see some pictures one at a time on the screen. After all the pictures have been shown, you will see a screen where you can enter the pictures you just saw in size order from smallest to biggest. For example, if you see a motorcycle, a bus, and a car, you would enter: motorcycle, car, bus. Are you ready to practice?`;
  } else {
    const stimulus_set_ids = Array.from(
      new Set(stimulusSetList.map((set) => set.stimulus_set_name))
    );
    return `You are going to see ${stimulus_set_ids.slice(0, -1).join(", ")} and ${
      stimulus_set_ids[stimulus_set_ids.length - 1]
    } in a set of pictures one at a time on the screen. After all the pictures have been shown, you will see a screen where for each category (i.e. ${
      stimulus_set_ids[0]
    }, ${
      stimulus_set_ids[1]
    }, etc.), you can enter the pictures you just saw that belong to that category in order from smallest to biggest. For example, if you see a motorcycle, a bus, a cup, and a barrel, you would enter: motorcycle, bus for the vehicles category, and cup, barrel for the containers category. Are you ready to practice?`;
  }
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

function getRandomSubarray(array, sample_size) {
  var shuffled = array.slice(0),
    i = array.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, sample_size);
}

function flattenStimulusSetList(
  stimulus_set_subarray: Array<listSortingWorkingMemoryTestStimulusSet>
) {
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

  return stimulus_set_subarray_flat;
}

function sampleStimulusAcrossSets<
  T extends { stimulus_name: string; stimulus_index: number; stimulus_set_id: string }
>(stimulus_set_list: T[][], sample_size: number = 1): T[] {
  const flat = stimulus_set_list.flat();

  // Group by stimulus_set_id, then by stimulus_index
  const groups: Record<string, Record<number, T[]>> = {};
  for (const item of flat) {
    if (!groups[item.stimulus_set_id]) {
      groups[item.stimulus_set_id] = {};
    }
    if (!groups[item.stimulus_set_id][item.stimulus_index]) {
      groups[item.stimulus_set_id][item.stimulus_index] = [];
    }
    groups[item.stimulus_set_id][item.stimulus_index].push(item);
  }

  // Shuffle each (set_id, index) group
  for (const setId in groups) {
    for (const index in groups[setId]) {
      const items = groups[setId][index];
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
    }
  }

  // Round-robin across stimulus_set_ids
  const sampled: T[] = [];
  const setIds = Object.keys(groups);
  const usedPairs = new Set<string>(); // track set_id|index combos used
  let setIndex = 0;

  while (sampled.length < sample_size && usedPairs.size < flat.length) {
    const currentSetId = setIds[setIndex % setIds.length];
    const indexGroups = groups[currentSetId];

    // Find the first unused index group in this set
    const availableIndices = Object.keys(indexGroups)
      .map(Number)
      .filter((index) => {
        const key = `${currentSetId}|${index}`;
        return !usedPairs.has(key) && indexGroups[index]?.length > 0;
      });

    if (availableIndices.length > 0) {
      const index = availableIndices[0]; // pick lowest unused index in this set
      const key = `${currentSetId}|${index}`;
      const item = indexGroups[index].pop()!;
      sampled.push(item);
      usedPairs.add(key);
    }

    setIndex++;
  }

  // Shuffle final result
  for (let i = sampled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sampled[i], sampled[j]] = [sampled[j], sampled[i]];
  }

  return sampled;
}

// Timeline Units
function instructionTrial(instruction_text: string, button_text?: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="instruction-text" style="text-align: center; font-size: 1.2em;"><p>${instruction_text}</p></div>`,
    choices: [button_text || "Yes"],
  };
}

function lswmTrial(
  jsPsych: JsPsych,
  sampledSetIds: Set<string> = new Set(),
  task: "practice" | "live" = "live"
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
    // DEV: 'f' key for next stimulus
    // choices: ["f"],
    trial_duration: 2000, // Show each stimulus for 2 seconds
    data: () => {
      return {
        task_type: task,
        timeline_unit_type: "lswmTrial",
        sampled_set_ids: Array.from(sampledSetIds),
        stimulus_name: jsPsych.evaluateTimelineVariable("stimulus_name"),
        stimulus_set_id: jsPsych.evaluateTimelineVariable("stimulus_set_id"),
        stimulus_index: jsPsych.evaluateTimelineVariable("stimulus_index"),
      };
    },
  };
}

function answerTrial(
  jsPsych: JsPsych,
  trialSequenceStimuli: Array<{
    stimulus_name: string;
    stimulus_set_id: string;
    stimulus_index: number;
  }>,
  task: "practice" | "live" = "live"
) {
  const groups: Record<string, any[]> = {};

  // Group by stimulus_set_id
  for (const trialStimulus of trialSequenceStimuli) {
    const id = trialStimulus.stimulus_set_id;
    if (!groups[id]) groups[id] = [];
    groups[id].push(trialStimulus);
  }

  // Get correct order for each stimulus set
  const correctAnswer = Object.entries(groups).map(([stimulus_set_id, trials]) => {
    const sorted = trials.sort((a, b) => a.stimulus_index - b.stimulus_index);
    const correct_order = sorted.map((t) => t.stimulus_name);
    return { stimulus_set_id, correct_order };
  });

  return {
    type: jsPsychSurveyText,
    questions: [], // to be set dynamically
    randomize_question_order: true,
    on_start: (trial) => {
      // Dynamically set the questions
      trial.questions = correctAnswer.map((group) => ({
        prompt: `Order the ${group.stimulus_set_id} from smallest to largest in size, separated by commas:`,
        name: `response_${group.stimulus_set_id}`,
        placeholder: group.correct_order.join(", "), // DEV: shows correct answer as placeholder; helpful for debugging
      }));
    },
    on_finish: (data) => {
      data.task_type = task;
      data.timeline_unit_type = "answerTrial";
      data.trial_sequence_stimuli = trialSequenceStimuli.map((t) => ({
        stimulus_name: t.stimulus_name,
        stimulus_set_id: t.stimulus_set_id,
        stimulus_index: t.stimulus_index,
      }));
      data.correct_answer = correctAnswer;
      data.correct = correctAnswer.reduce((acc, group) => {
        const response = data.response[`response_${group.stimulus_set_id}`];
        const responseArray = response ? response.split(",").map((s) => s.trim()) : [];
        console.log("response:", response);
        console.log("responseArray:", responseArray);
        console.log("correct_order:", group.correct_order);

        acc[group.stimulus_set_id] =
          JSON.stringify(responseArray) === JSON.stringify(group.correct_order);
        return acc;
      }, {});
      data.all_correct = Object.values(data.correct).every((v) => v === true);
    },
  };
}

function practiceFeedbackTrial(jsPsych: JsPsych, getAttempts: () => number, max_attempts: number) {
  console.log(
    "practiceFeedbackTrial called with attempts:",
    getAttempts(),
    "max_attempts:",
    max_attempts
  );
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const data = jsPsych.data.getLastTrialData().values()[0];
      const allCorrect = data["all_correct"];
      const correctAnswers = data["correct_answer"];
      const incorrect = Object.entries(data["correct"] || {}).filter(([, isCorrect]) => !isCorrect);
      if (allCorrect) {
        return `<div class="instruction-text" style="text-align: center; font-size: 1.2em;"><p>That's right!</p></div>`;
      }

      let correctAnswerHTML = "";

      for (let i = 0; i < incorrect.length; i++) {
        const [set_id, _] = incorrect[i];
        const seenOrder = data.trial_sequence_stimuli
          .filter((t) => t.stimulus_set_id === set_id)
          .map((t) => t.stimulus_name);
        const correctOrder = correctAnswers.find(
          (group) => group.stimulus_set_id === set_id
        ).correct_order;
        const seenOrderHtml = `<p>You saw: ${seenOrder.join(", ")}</p>`;
        let correctOrderHtml = "";
        if (getAttempts() < max_attempts) {
          correctOrderHtml = `<p>${correctOrder[0]} is smaller than ${
            correctOrder[1] || "nothing"
          }${
            correctOrder.length <= 2
              ? "."
              : ", which is smaller than " +
                correctOrder.slice(2).join(", which is smaller than ") +
                "."
          }</p>`;
          correctOrderHtml += `<p>Now say the ${set_id} in size order.</p>`;
        } else {
          correctOrderHtml = `<p>So you would say: ${correctOrder.join(", ")}.</p>`;
          correctOrderHtml += `<p>Let's try another one.</p>`;
        }
        correctAnswerHTML += `<div>${seenOrderHtml}${correctOrderHtml}</div>`;
      }
      return correctAnswerHTML;
    },
    choices: ["Continue"],
    on_finish: (data) => {
      data.task_type = "practice_feedback";
      data.timeline_unit_type = "practiceFeedbackTrial";
      data.attempts = getAttempts();
      data.max_attempts = max_attempts;
    },
  };
}
// timeline units
function lswmTrialSequence(
  jsPsych: JsPsych,
  options: {
    dimension: number;
    stimulus_set_list: Array<listSortingWorkingMemoryTestStimulusSet>;
    sequence_length?: number;
    task?: "practice" | "live";
    max_attempts?: number;
  }
) {
  options.task = options.task || "live"; // Default to 'live' task if not provided
  options.max_attempts = options.max_attempts || 2; // Default to 2 attempts if not provided

  // The sampled list of stimulus sets for this sequence is set (but not across the whole section)
  const stimulus_set_subarray = getRandomSubarray(options.stimulus_set_list, options.dimension);
  const stimulus_set_subarray_flat = flattenStimulusSetList(stimulus_set_subarray);

  if (!options.sequence_length) {
    options.sequence_length = stimulus_set_subarray_flat.length;
    console.warn("No sequence length provided. Using all stimuli without replacement.");
  } else if (options.sequence_length > stimulus_set_subarray_flat.length) {
    options.sequence_length = stimulus_set_subarray_flat.length;
    console.warn(
      "Sequence length exceeds available stimuli. Using all stimuli without replacement."
    );
  } else if (options.sequence_length < 1) {
    options.sequence_length = 1;
    console.warn("Sequence length must be at least 1. Using 1.");
  }

  const timelineVariables = sampleStimulusAcrossSets(
    stimulus_set_subarray_flat,
    options.sequence_length
  );
  const sampledSetIds = new Set(timelineVariables.map((set) => set.stimulus_set_id));

  let trialSequenceTimeline = [];
  trialSequenceTimeline.push({
    timeline: [lswmTrial(jsPsych, sampledSetIds, options.task)],
    timeline_variables: timelineVariables,
    sampled_set_ids: sampledSetIds,
    data: {
      sequence_length: options.sequence_length,
    },
  });

  if (options.task === "practice") {
    const attempts = { count: 1 };
    const practiceRetryLoop = {
      timeline: [
        answerTrial(jsPsych, timelineVariables, options.task),
        practiceFeedbackTrial(jsPsych, () => attempts.count, options.max_attempts),
      ],
      loop_function: () => {
        const allCorrect = jsPsych.data.getLastTimelineData().values()[0]["all_correct"];
        if (allCorrect) return false;

        attempts.count += 1;
        if (attempts.count > options.max_attempts) return false; // stop retrying

        console.log("retrying");
        return true; // retry answerTrial only
      },
    };

    trialSequenceTimeline.push(practiceRetryLoop);
  } else {
    trialSequenceTimeline.push(answerTrial(jsPsych, timelineVariables, options.task));
  }
  return trialSequenceTimeline;
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
      timeline: [trialSequence],
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
    stimulus_set_list: defaultLiveStimuli,
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
  mainTimeline.push(instructionTrial("Start"));

  for (let i = 0; i < options.dimensions_sequence.length; i++) {
    const curDimension = options.dimensions_sequence[i];
    const practiceStimuli = defaultPracticeStimuli.find(
      (stimulus_set_lists) => stimulus_set_lists.dimension === curDimension
    )?.stimulus_set_lists;
    if (practiceStimuli) {
      mainTimeline.push(
        instructionTrial(nListPracticeInstructionText(practiceStimuli[0]), "Start Practice")
      );
      practiceStimuli.map((set) => {
        mainTimeline.push(
          lswmTrialSequence(jsPsych, {
            dimension: curDimension,
            stimulus_set_list: set,
            task: "practice",
          })
        );
      });
    } else {
      console.warn(
        `No practice stimuli found for dimension ${curDimension}. Skipping practice section.`
      );
    }
    mainTimeline.push(
      lswmSection(jsPsych, {
        dimension: curDimension,
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
