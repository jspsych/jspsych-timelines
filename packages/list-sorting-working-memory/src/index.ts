import jsPsychAudioKeyboardResponse from "@jspsych/plugin-audio-keyboard-response";
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychPreload from "@jspsych/plugin-preload";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
import { JsPsych } from "jspsych";

// DEV: Cannot directly export because tsup will throw error
import { getAssetUrl as _getAssetUrl, setAssetBase as _setAssetBase } from "./assets.js";
// Import default stimulus assets from src/stimuli.js
// NOTE: You can use own stimulus assets and/or change the file path to the assets folder by modifying the src/stimulus.js file
import {
  defaultLiveStimuli as defaultLiveStimuliImport,
  oneListPracticeStimuliA as oneListPracticeStimuliAImport,
  oneListPracticeStimuliB as oneListPracticeStimuliBImport,
  twoListPracticeStimuliA as twoListPracticeStimuliAImport,
  twoListPracticeStimuliB as twoListPracticeStimuliBImport,
} from "./stimuli.js";

const oneListPracticeStimuliA = oneListPracticeStimuliAImport as Array<lswmStimulusSet>;
const oneListPracticeStimuliB = oneListPracticeStimuliBImport as Array<lswmStimulusSet>;
const twoListPracticeStimuliA = twoListPracticeStimuliAImport as Array<lswmStimulusSet>;
const twoListPracticeStimuliB = twoListPracticeStimuliBImport as Array<lswmStimulusSet>;
const DEFAULT_LIVE_STIMULI = defaultLiveStimuliImport as Array<lswmStimulusSet>;
const DEFAULT_PRACTICE_STIMULI: Map<number, Array<Array<lswmStimulusSet>>> = new Map([
  [1, [oneListPracticeStimuliA, oneListPracticeStimuliB]],
  [2, [twoListPracticeStimuliA, twoListPracticeStimuliB]],
]);

/**
 * Interface for each stimulus in the List Sorting Working Memory Test experiment timeline.
 * Each stimulus object has a name, image code/file, and audio file.
 * The stimulus_set_id is optional and can be used to group stimuli in sets.
 */
export interface lswmStimulus {
  /**
   * The name of the stimulus, e.g. "lemon", "apple", "peach".
   */
  stimulus_name: string;
  /**
   * The SVG code, image file path or URL of the stimulus, e.g. `"images/lemon.png"`.
   */
  stimulus_image: string;
  /**
   * The audio file path or URL of the stimulus, e.g. `"audio/lemon.mp3"`.
   */
  stimulus_audio: string;
  /**
   * The ID of the stimulus set this stimulus belongs to, e.g. "animals", "foods", etc.
   */
  stimulus_set_id?: string;
}

/**
 * Interface for a set of stimuli that form a category (e.g. animals, foods) in the List Sorting Working Memory Test experiment timeline.
 * Each stimulus set has a stimulus_set_name, which is used to identify the stimuli category.
 * Each stimulus set also has a stimulus_set field, which is an array of stimulus objects that follow the {@link lswmStimulus} interface.
 * The stimulus objects in each set are grouped in arrays, where each array represents a group of stimuli that are of similar size, e.g. `[lemon, apple, peach]`.
 */
export interface lswmStimulusSet {
  /**
   * The name of the stimulus set, e.g. "animals", "foods", etc.
   */
  stimulus_set_name: string;
  /**
   * An array of arrays of stimulus objects, where each array represents a group of stimuli that are of similar size.
   */
  stimulus_set: Array<Array<lswmStimulus>>;
}

// Utils

/**
 * Generate instruction text for a practice section in the List Sorting Working Memory Test.
 *
 * @param {Array<lswmStimulusSet>} stimulusSetList The list of stimulus sets to be used in the section. This is used to determine the number of categories and dynamically generate the instruction text.
 * @param {boolean} [practice=true] Whether this is a practice section. If true, the instruction text will be tailored for practice.
 * @returns {string} The instruction text.
 * @throws {Error} If the `stimulusSetList` is empty or does not contain at least one stimulus set.
 */
function nListPracticeInstructionText(
  stimulusSetList: Array<lswmStimulusSet>,
  practice: boolean = true
): string {
  if (stimulusSetList.length <= 0) {
    throw new Error("stimulusSetList must contain at least one stimulus set.");
  } else if (stimulusSetList.length === 1) {
    return `You are going to see some pictures one at a time on the screen. After all the pictures have been shown, you will see a screen where you can enter the pictures you just saw in size order from smallest to biggest.<br><br>For example, if you see a motorcycle, a bus, and a car, you would enter: motorcycle, car, bus.<br><br><strong>Are you ready${
      practice ? " to practice" : ""
    }?</strong>`;
  } else {
    const stimulus_set_ids = Array.from(
      new Set(stimulusSetList.map((set) => set.stimulus_set_name))
    );
    return `You are going to see <strong>${stimulus_set_ids
      .slice(0, -1)
      .join(", ")}</strong> and <strong>${
      stimulus_set_ids[stimulus_set_ids.length - 1]
    }</strong> in a set of pictures one at a time on the screen. After all the pictures have been shown, you will see a screen where for each category (i.e. ${
      stimulus_set_ids[0]
    }, ${
      stimulus_set_ids[1]
    }, etc.), you can enter the pictures you just saw that belong to that category in order from smallest to biggest.<br><br>For example, if you see a motorcycle, a bus, a cup, and a barrel, you would enter: motorcycle, bus for the vehicles category, and cup, barrel for the containers category.<br><br><strong>Are you ready${
      practice ? " to practice" : ""
    }?</strong>`;
  }
}

/**
 * Modifies a list of stimulus sets in-place to exclude any sets that are specified in the `excluded_sets` array.
 *
 * @param {Array<lswmStimulusSet>} stimulus_set_list The list of stimulus sets to filter.
 * @param {Array<string | number>} excluded_sets An array of strings or numbers representing the names or indices of the stimulus sets to exclude.
 * @throws {RangeError} If an excluded set index is out of bounds or if an excluded set name is not found in the `stimulus_set_list`.
 */
function cleanExcludedSets(
  stimulus_set_list: Array<lswmStimulusSet>,
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

/**
 * Get a random subarray of a given size from an array.
 *
 * @param {Array<any>} array The array to sample from.
 * @param {number} sample_size The number of elements to sample.
 * @returns {Array<any>} A randomly sampled subarray of size = `sample_size`.
 * @throws {RangeError} if `sample_size` is not a valid positive integer or exceeds array length.
 */
function getRandomSubarray(array: Array<any>, sample_size: number): Array<any> {
  if (!Number.isInteger(sample_size) || sample_size <= 0 || sample_size > array.length) {
    throw new RangeError(
      "Sample size must be a positive integer that is equal to or smaller than the length of the input array."
    );
  }
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

/**
 * Flatten a list of stimulus sets into an array of stimulus groups, each group containing stimuli of one category and of similar size.
 * Each stimulus in each group records its name, image, audio, set ID, and index within the set, which denotes its position in the sequence in terms of size.
 *
 * @param {Array<lswmStimulusSet>} stimulus_set_subarray An array of stimulus sets, where each set contains groups of stimuli.
 * @returns {Array<Array<{ stimulus_index: number, stimulus_set_id: string } & lswmStimulus>>} The flattened array of stimulus groups.
 */
function flattenStimulusSetList(
  stimulus_set_subarray: Array<lswmStimulusSet>
): Array<Array<{ stimulus_index: number; stimulus_set_id: string } & lswmStimulus>> {
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

/**
 * Sample a specified number of stimuli across different sets, ensuring that each set is sampled roughly the same number of times via round-robin sampling.
 * Within each set, stimuli of similar size do not get sampled more than once.
 *
 * @param {Array<Array<{stimulus_name: string, stimulus_index: number, stimulus_set_id: string}>>} stimulus_set_list The list of stimulus groups, where each group contains stimuli of one category and of similar size.
 * @param {number} sample_size The number of stimuli to sample across all sets. Defaults to 1 if not provided.
 * @returns {Array<{stimulus_name: string, stimulus_index: number, stimulus_set_id: string}>} An array of sampled stimuli.
 */
function sampleStimulusAcrossSets(
  stimulus_set_list: Array<
    Array<{ stimulus_name: string; stimulus_index: number; stimulus_set_id: string }>
  >,
  sample_size: number = 1
): Array<{ stimulus_name: string; stimulus_index: number; stimulus_set_id: string }> {
  const flat = stimulus_set_list.flat();

  // Group by stimulus_set_id, then by stimulus_index
  const groups: Record<
    string,
    Record<
      number,
      Array<{ stimulus_name: string; stimulus_index: number; stimulus_set_id: string }>
    >
  > = {};
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
  const sampled: Array<{ stimulus_name: string; stimulus_index: number; stimulus_set_id: string }> =
    [];
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

/**
 * Automatically find all preloadable audio and/or image files for the List Sorting Working Memory Test and preloads them.
 *
 * @returns {object} A jsPsych trial object that preloads audio and/or image files for the List Sorting Working Memory Test.
 */
function preloadTrial() {
  return {
    type: jsPsychPreload,
    auto_preload: true,
    data: {
      timeline_unit_type: "preloadTrial",
    },
  };
}

/**
 * Trial that displays an instruction text and a button to continue (customizable text).
 *
 * @param {string} instruction_text The text to display in the instruction trial.
 * @param {string} [button_text="Yes"] The text to display on the button.
 * @returns {Object} A jsPsych trial object for displaying instructions.
 */
function instructionTrial(instruction_text: string, button_text?: string) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<div class="instruction-text" style="text-align: center; font-size: 1.2em; max-width: 80vw; max-height: 80vh; "><p>${instruction_text}</p></div>`,
    choices: [button_text || "Yes"],
    data: {
      timeline_unit_type: "instructionTrial",
    },
  };
}

/**
 * Trial for displaying one stimulus in the List Sorting Working Memory Test.
 * Displays the stimulus image with the stimulus name printed at the bottom and automatically plays the stimulus audio.
 *
 * @param {object} jsPsych The jsPsych instance of the experiment timeline.
 * @param {Set<string>} sampledSetIds A set of sampled stimulus set IDs for this trial, used to track which sets are used in the List Sorting Working Memory Test trial sequence this trial belongs to.
 * @param {"practice" | "live"} task The task type, either "practice" or "live".
 * @returns {Object} A jsPsych trial object for displaying a single stimulus in the List Sorting Working Memory Test.
 */
function lswmTrial(
  jsPsych: JsPsych,
  sampledSetIds: Set<string> = new Set([]),
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
    choices: ["NO_KEYS"], // DEV: comment out to click through trials
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

/**
 *
 * @param {Array<{stimulus_name: string; stimulus_set_id: string; stimulus_index: number;}>} trialSequenceStimuli The array of stimuli displayed in the trial sequence.
 * @param {"practice" | "live"} task The task type, either "practice" or "live".
 * @returns {Object} A jsPsych trial object for the participant to provide answers to a List Sorting Working Memory Test trial sequence.
 */
function answerTrial(
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
        prompt: `Order the <strong>${group.stimulus_set_id}</strong> from smallest to largest in size, separated by commas:`,
        name: `response_${group.stimulus_set_id}`,
        required: true,
        placeholder: "",
        // DEV: placeholder: group.correct_order.join(", "),
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

        acc[group.stimulus_set_id] =
          JSON.stringify(responseArray) === JSON.stringify(group.correct_order);
        return acc;
      }, {});
      data.all_correct = Object.values(data.correct).every((v) => v === true);
    },
  };
}

/**
 * Trial for providing feedback after a practice trial in the List Sorting Working Memory Test.
 *
 * @param {Object} jsPsych The jsPsych instance of the experiment timeline.
 * @param {() => number} getAttempts A function that returns the number of attempts made so far in the practice trial.
 * @param {number} max_attempts The maximum number of attempts allowed for the practice trial.
 * @returns {Object} A jsPsych trial object for providing feedback after a practice trial in the List Sorting Working Memory Test.
 */
function practiceFeedbackTrial(
  jsPsych: JsPsych,
  getAttempts: () => number,
  max_attempts: number = 2
) {
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

      let correctAnswerHtml = "";

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
          correctOrderHtml = `<p>${
            correctOrder[1]
              ? correctOrder[0] + " is smaller than " + correctOrder[1]
              : correctOrder[0] + " is the only item"
          }${
            correctOrder.length <= 2
              ? "."
              : ", which is smaller than " +
                correctOrder.slice(2).join(", which is smaller than ") +
                "."
          }</p>`;
          correctOrderHtml += `<p>Now say the ${set_id} in size order, starting with the smallest one.</p>`;
        } else {
          correctOrderHtml = `<p>So you would say: ${correctOrder.join(", ")}.</p>`;
        }
        correctAnswerHtml += `<div>${seenOrderHtml}${correctOrderHtml}</div>`;
      }
      if (getAttempts() >= max_attempts) {
        correctAnswerHtml += `<div><p><strong>Let's move on.</strong></p></div>`;
      }
      return correctAnswerHtml;
    },
    choices: ["Continue"],
    on_finish: (data) => {
      data.task_type = "practice";
      data.timeline_unit_type = "practiceFeedbackTrial";
      data.attempts = getAttempts();
      data.max_attempts = max_attempts;
    },
  };
}

/**
 * Options for {@link lswmTrialSequence}.
 */
export interface lswmTrialSequenceOptions {
  /**
   * The number of categories in the List Sorting Working Memory Test trial sequence, e.g. 1 for one-list, 2 for two-list, etc.
   */
  dimension: number;
  /**
   * The list of stimulus sets to be used in the List Sorting Working Memory Test trial sequence.
   */
  stimulus_set_list: Array<lswmStimulusSet>;
  /**
   * The number of stimuli to sample in the List Sorting Working Memory Test trial sequence.
   * @defaultValue All stimuli in `stimulus_set_list` will be used without replacement.
   */
  sequence_length?: number;
  /**
   * The task type, either "practice" or "live".
   * @defaultValue "live"
   */
  task?: "practice" | "live";
  /**
   * The maximum number of attempts allowed for the practice trial.
   * @defaultValue 2
   */
  max_attempts?: number;
}

/**
 * Create a sequence of List Sorting Working Memory Test trials.
 *
 * @param {Object} jsPsych The jsPsych instance of the experiment timeline.
 * @param {lswmTrialSequenceOptions} options Options for the List Sorting Working Memory Test trial sequence.
 * @returns {Array<Object>} An array of List Sorting Working Memory Test trials.
 */
function lswmTrialSequence(jsPsych: JsPsych, options: lswmTrialSequenceOptions): any[] {
  options.task = options.task || "live";
  options.max_attempts = options.max_attempts || 2;

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
      task_type: options.task,
      dimension: options.dimension,
    },
  });

  if (options.task === "practice") {
    const attempts = { count: 1 };
    const practiceRetryLoop = {
      timeline: [
        answerTrial(timelineVariables, options.task),
        practiceFeedbackTrial(jsPsych, () => attempts.count, options.max_attempts),
      ],
      loop_function: () => {
        const allCorrect = jsPsych.data.getLastTimelineData().values()[0]["all_correct"];
        if (allCorrect) return false;

        attempts.count += 1;
        if (attempts.count > options.max_attempts) return false; // stop retrying

        return true; // retry answerTrial only
      },
      data: {
        task_type: options.task,
        attempts: () => attempts.count,
        max_attempts: options.max_attempts,
        dimension: options.dimension,
      },
    };
    trialSequenceTimeline.push(practiceRetryLoop);
  } else {
    trialSequenceTimeline.push(answerTrial(timelineVariables, options.task));
  }
  return trialSequenceTimeline;
}

/**
 * Wrapper for {@link lswmTrialSequence} that creates a retry loop for each List Sorting Working Memory Test trial sequence.
 * For each trial sequence length, the participant is allowed to retry up to `max_attempts` times if they do not get all answers correct for the sequence.
 * In each retry, a new set of stimuli is sampled from the `stimulus_set_list`.
 *
 * @param {Object} jsPsych The jsPsych instance of the experiment timeline.
 * @param {lswmTrialSequenceOptions} options Options for the List Sorting Working Memory Test trial sequence wrapper.
 * @returns {Array<Object>} A timeline containing a List Sorting Working Memory Test trial sequence that recursively pushes a new trial sequence of the same length to the timeline upon participant's failure of the trial sequence, tracking the number of attempts.
 */
function lswmTrialSequenceRetryLoop(jsPsych: JsPsych, options: lswmTrialSequenceOptions): any[] {
  const timeline = [];
  const max_attempts = options.max_attempts ?? 2;
  let attempt = 0;

  function addAttempt() {
    const trialSeq = lswmTrialSequence(jsPsych, {
      dimension: options.dimension,
      stimulus_set_list: options.stimulus_set_list,
      sequence_length: options.sequence_length,
      task: options.task || "live",
      max_attempts,
    });

    timeline.push({
      timeline: trialSeq,
      on_timeline_finish: () => {
        const lastData = jsPsych.data.getLastTrialData().values().slice(-1)[0];
        const correct = lastData ? lastData["all_correct"] : false;
        attempt++;

        if (!correct && attempt < max_attempts) {
          addAttempt(); // Add a new attempt
        }
      },
    });
  }

  addAttempt(); // Start with the first attempt
  return timeline;
}

/**
 * Options for {@link lswmSection}.
 */
export interface lswmTrialSectionOptions {
  /**
   * The number of categories in the List Sorting Working Memory Test section, e.g. 1 for one-list, 2 for two-list, etc.
   */
  dimension: number;
  /**
   * The list of stimulus sets to be used in the List Sorting Working Memory Test section.
   */
  stimulus_set_list: Array<lswmStimulusSet>;
  /**
   * The sequence of sample sizes for each trial sequence in the section.
   * @defaultValue [2, 3, 4, 5, 6, 7].
   */
  sample_size_sequence?: Array<number>;
  /**
   * The list of stimulus set names or indices to exclude from the section.
   * @defaultValue Empty `Set()`
   */
  excluded_sets?: Array<string | number>;
  /**
   * The maximum number of attempts allowed for each trial sequence in the section.
   * @defaultValue 2
   */
  max_attempts?: number;
}
/**
 * Create a section of the list sorting working memory task.
 * Each section consists of multiple List Sorting Working Memory trial sequences.
 *
 * @param {Object} jsPsych The jsPsych instance of the experiment timeline.
 * @param {lswmTrialSectionOptions} options Options for a List Sorting Working Memory Test section.
 * @returns {Array<Object>} An array of List Sorting Working Memory Test trial sequences that make up one section.
 */
function lswmSection(jsPsych: JsPsych, options: lswmTrialSectionOptions): any[] {
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

  options.max_attempts = options.max_attempts || 2; // Default to 2 attempts if not provided

  // Section timeline
  let sectionTimeline = [];
  for (let i = 0; i < options.sample_size_sequence.length; i++) {
    const sequenceLength = options.sample_size_sequence[i];

    sectionTimeline.push(
      lswmTrialSequenceRetryLoop(jsPsych, {
        dimension: options.dimension,
        stimulus_set_list: options.stimulus_set_list,
        sequence_length: sequenceLength,
        task: "live",
        max_attempts: options.max_attempts,
      })
    );
    sectionTimeline.push(instructionTrial("Now let's try another set of pictures. Are you ready?"));
  }
  return sectionTimeline;
}

/**
 * Options for {@link createTimeline}.
 */
export interface lswmTimelineOptions {
  /**
   * The list of stimulus sets to be used in the List Sorting Working Memory Test.
   * @defaultValue `{@link DEFAULT_LIVE_STIMULI}`
   */
  stimulus_set_list?: Array<lswmStimulusSet>;
  /**
   * The sequence of dimensions (1-list, 2-list, etc.) for the List Sorting Working Memory Test.
   * @defaultValue [1, 2, ..., len(`stimulus_set_list`)]
   */
  dimensions_sequence?: Array<number>;
  /**
   * The maximum number of attempts allowed for each live trial sequence in the List Sorting Working Memory Test.
   * @defaultValue 2
   */
  n_live_max_attempts?: number;
  /**
   * Allow users to manually input the practice stimuli used for each dimension/section of the List Sorting Working Memory experiment timeline by providing a map from dimension value to the practice stimulus sets for that dimension.
   * Each key is a dimension (e.g. 1, 2, etc.) and the value is an array of arrays of stimulus sets that form the practice stimuli used for the List Sorting Working Memory section of that dimension.
   * @defaultValue Randomly sampling the stimuli sets for each section to form `n_practice_sequences` number of practice trial sequences for each section.
   */
  practice_stimulus_set_list?: Map<number, Array<Array<lswmStimulusSet>>>;
  /**
   * The number of practice trial sequences for each dimension/section of the List Sorting Working Memory experiment timeline.
   * @defaultValue 2
   */
  n_practice_sequences?: number;
  /**
   * The maximum number of attempts allowed for each practice trial sequence in the List Sorting Working Memory Test.
   * @defaultValue n_live_max_attempts
   */
  n_practice_max_attempts?: number;
}

/**
 * Create a timeline for the List Sorting Working Memory task.
 *
 * @param {Object} jsPsych The jsPsych instance of the experiment timeline.
 * @param {lswmTimelineOptions} options Options for the List Sorting Working Memory Test timeline.
 * @returns {Array<Object>} An array of List Sorting Working Memory sections that make up a List Sorting Working Memory Test experiment timeline.
 */
export function createTimeline(jsPsych: JsPsych, options: lswmTimelineOptions = {}): Array<Object> {
  // Default options
  const defaultOptions = {
    stimulus_set_list: DEFAULT_LIVE_STIMULI,
    n_live_max_attempts: 2,
    n_practice_sequences: 2,
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

  // Set n_practice_max_attempts to n_live_max_attempts if not provided
  if (!options.n_practice_max_attempts) {
    options.n_practice_max_attempts = options.n_live_max_attempts;
  }

  // Timeline
  let mainTimeline = [];
  mainTimeline.push(preloadTrial());
  mainTimeline.push(instructionTrial("Start"));

  // Push one List Sorting Working Memory Test section for each dimension
  for (let i = 0; i < options.dimensions_sequence.length; i++) {
    const curDimension = options.dimensions_sequence[i];
    let manuallyProvidedPracticeStimuli;
    let nPracticeSequences = options.n_practice_sequences;
    let practiceTrialSequences = [];

    // Check if practice stimuli is manually provided for this dimension
    if (
      options.practice_stimulus_set_list &&
      options.practice_stimulus_set_list.has(curDimension)
    ) {
      manuallyProvidedPracticeStimuli = options.practice_stimulus_set_list.get(curDimension);
      nPracticeSequences = Math.min(
        options.n_practice_sequences,
        manuallyProvidedPracticeStimuli.length
      );
    }

    // If there is a practice section, push instruction and practice trials
    if (nPracticeSequences > 0) {
      if (manuallyProvidedPracticeStimuli) {
        mainTimeline.push(
          instructionTrial(
            nListPracticeInstructionText(manuallyProvidedPracticeStimuli[0]),
            "Start Practice"
          )
        );
        manuallyProvidedPracticeStimuli.forEach((set, idx) => {
          practiceTrialSequences.push({
            timeline: [
              lswmTrialSequence(jsPsych, {
                dimension: curDimension,
                stimulus_set_list: set,
                task: "practice",
                max_attempts: options.n_practice_max_attempts,
              }),
            ],
          });
          if (idx < manuallyProvidedPracticeStimuli.length - 1) {
            practiceTrialSequences.push(
              instructionTrial("Now let's practice with another set of pictures. Are you ready?")
            );
          }
        });
      } else {
        console.info(
          "No manually provided practice stimuli found for dimension " +
            curDimension +
            ". Sampling from options.stimulus_set_list. Note that the sampled categories for this practice section may differ from those that appear in the live section."
        );
        // If no manually provided practice stimuli, sample directly from stimulus_set_list and run nPracticeSequences practice trial sequences starting with trial sequence_length = 2
        const practiceStimulusSets = getRandomSubarray(options.stimulus_set_list, curDimension);
        mainTimeline.push(
          instructionTrial(
            nListPracticeInstructionText(practiceStimulusSets, true),
            "Start Practice"
          )
        );
        // DEV: console.log("number of practice sequences: " + nPracticeSequences);
        for (let i = 0; i < nPracticeSequences; i++) {
          practiceTrialSequences.push({
            timeline: [
              lswmTrialSequence(jsPsych, {
                dimension: curDimension,
                stimulus_set_list: practiceStimulusSets,
                sequence_length: 2 + i, // Increase sequence length for each practice trial
                task: "practice",
                max_attempts: options.n_practice_max_attempts,
              }),
            ],
          });
          if (i < nPracticeSequences - 1) {
            practiceTrialSequences.push(
              instructionTrial("Now let's practice with another set of pictures. Are you ready?")
            );
          }
        }
      }
      mainTimeline.push(...practiceTrialSequences);
    } else {
      console.warn(`Number of practice trial sequences set to 0. Skipping practice section.`);
    }

    // Push the live section
    if (nPracticeSequences > 0) {
      // If there is a practice section, only push the live section if practice was passed
      mainTimeline.push({
        timeline: [
          instructionTrial(
            "Let's look at some more pictures. Remember, after you see all the pictures, you will need to enter the pictures in each category in size order from smallest to largest.<br><br><strong>Are you ready?</strong>"
          ),
          lswmSection(jsPsych, {
            dimension: curDimension,
            stimulus_set_list: options.stimulus_set_list,
            max_attempts: options.n_live_max_attempts,
          }),
        ],
        conditional_function: () => {
          const allData = jsPsych.data.get().values();
          const practicePassed = allData.some(
            (data) =>
              data["task_type"] === "practice" &&
              data["dimension"] == curDimension &&
              data["all_correct"] == true
          );
          return practicePassed;
        },
      });

      // If participant failed practice section
      mainTimeline.push({
        timeline: [
          instructionTrial(
            "You have failed the practice for this section. Moving on to the next section."
          ),
        ],
        conditional_function: () => {
          const allData = jsPsych.data.get().values();
          const practicePassed = allData.some(
            (data) =>
              data["task_type"] === "practice" &&
              data["dimension"] == curDimension &&
              data["all_correct"] == true
          );
          return !practicePassed;
        },
      });
    }
    // Directly start live section
    else {
      mainTimeline.push({
        timeline: [
          instructionTrial(nListPracticeInstructionText(options.stimulus_set_list, false)),
          lswmSection(jsPsych, {
            dimension: curDimension,
            stimulus_set_list: options.stimulus_set_list,
            max_attempts: options.n_live_max_attempts,
          }),
        ],
      });
    }
  }
  mainTimeline.push(
    instructionTrial("You have completed the experiment. Thank you for participating!")
  );
  return mainTimeline;
}

/**
 * Timeline units that can be used to create a List Sorting Working Memory Test experiment timeline.
 */
export const timelineUnits = {
  lswmTrialSequence,
  lswmTrialSequenceRetryLoop,
  lswmSection,
};

/**
 * Utility functions that can be used to create a List Sorting Working Memory Test experiment timeline.
 */
export const utils = {
  DEFAULT_LIVE_STIMULI,
  DEFAULT_PRACTICE_STIMULI,
  nListPracticeInstructionText,
  cleanExcludedSets,
  getRandomSubarray,
  flattenStimulusSetList,
  sampleStimulusAcrossSets,
  preloadTrial,
  instructionTrial,
  lswmTrial,
  answerTrial,
  practiceFeedbackTrial,
};

export const getAssetUrl = _getAssetUrl;
export const setAssetBase = _setAssetBase;
