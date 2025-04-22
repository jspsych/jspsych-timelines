import jsPsychAudioKeyboardResponse from "@jspsych/plugin-audio-keyboard-response";
import jsPsychPreload from "@jspsych/plugin-preload";
import { JsPsych } from "jspsych";

const animalStimuli: Array<listSortingWorkingMemoryTestStimulusInfo> = [
  {
    stimulus_image: "images/images-animals/mouse.jpg",
    stimulus_audio: "audio/audio-animals/mouse.mp3",
  },
  {
    stimulus_image: "images/images-animals/bird.jpg",
    stimulus_audio: "audio/audio-animals/bird.mp3",
  },
  {
    stimulus_image: "images/images-animals/rabbit.jpg",
    stimulus_audio: "audio/audio-animals/rabbit.mp3",
  },
  {
    stimulus_image: "images/images-animals/dog.jpg",
    stimulus_audio: "audio/audio-animals/dog.mp3",
  },
  {
    stimulus_image: "images/images-animals/monkey.jpg",
    stimulus_audio: "audio/audio-animals/monkey.mp3",
  },
  {
    stimulus_image: "images/images-animals/lion.jpg",
    stimulus_audio: "audio/audio-animals/lion.mp3",
  },
  {
    stimulus_image: "images/images-animals/elephant.jpg",
    stimulus_audio: "audio/audio-animals/elephant.mp3",
  },
  {
    stimulus_image: "images/images-animals/whale.jpg",
    stimulus_audio: "audio/audio-animals/whale.mp3",
  },
];

const audioAbsPath =
  "/Users/cchang/Documents/GitHub/jspsych-timelines/packages/list-sorting-working-memory/src/list-sorting-working-memory-test/audio";

const imagesAbsPath =
  "/Users/cchang/Documents/GitHub/jspsych-timelines/packages/list-sorting-working-memory/src/list-sorting-working-memory-test/images";

const foodStimuli: Array<listSortingWorkingMemoryTestStimulusInfo> = [
  {
    stimulus_image: `${imagesAbsPath}/images-food/bean.jpg`,
    stimulus_audio: `${audioAbsPath}/audio-food/bean.mp3`,
  },
  {
    stimulus_image: `${imagesAbsPath}/images-food/mushroom.jpg`,
    stimulus_audio: `${audioAbsPath}/audio-food/mushroom.mp3`,
  },
  {
    stimulus_image: `${imagesAbsPath}/images-food/grape.jpg`,
    stimulus_audio: `${audioAbsPath}/audio-food/grape.mp3`,
  },
  {
    stimulus_image: `${imagesAbsPath}/images-food/shrimp.jpg`,
    stimulus_audio: `${audioAbsPath}/audio-food/shrimp.mp3`,
  },
  {
    stimulus_image: `${imagesAbsPath}/images-food/apple.jpg`,
    stimulus_audio: `${audioAbsPath}/audio-food/apple.mp3`,
  },
  {
    stimulus_image: `${imagesAbsPath}/images-food/pizza.jpg`,
    stimulus_audio: `${audioAbsPath}/audio-food/pizza.mp3`,
  },
  {
    stimulus_image: `${imagesAbsPath}/images-food/turkey.jpg`,
    stimulus_audio: `${audioAbsPath}/audio-food/turkey.mp3`,
  },
  {
    stimulus_image: `${imagesAbsPath}/images-food/pumpkin.jpg`,
    stimulus_audio: `${audioAbsPath}/audio-food/pumpkin.mp3`,
  },
];

interface listSortingWorkingMemoryTestStimulusInfo {
  stimulus_image: string;
  stimulus_audio: string;
}

// utils
function preloadAudio(audioFiles: Array<string>) {
  return {
    type: jsPsychPreload,
    audio: audioFiles,
  };
}

// timeline units
function lswmTrial(jsPsych: JsPsych) {
  return {
    type: jsPsychAudioKeyboardResponse,
    stimulus: jsPsych.timelineVariable["stimulus_audio"],
    prompt: `<img src="${jsPsych.timelineVariable["stimulus_image"]}" />`,
    choices: "NO_KEYS",
    trial_duration: 2000,
  };
}

function lswmTrialSequence(
  jsPsych: JsPsych,
  stimulusSet: Array<listSortingWorkingMemoryTestStimulusInfo>
) {
  return {
    timeline: [lswmTrial(jsPsych)],
    timeline_variables: jsPsych.randomization.sampleWithoutReplacement(
      stimulusSet,
      jsPsych.timelineVariable("sequence_length")
    ),
  };
}

function lswmOneListSection(
  jsPsych: JsPsych,
  sampling_function?: () => Array<number>,
  stimulusSet?: Array<listSortingWorkingMemoryTestStimulusInfo>,
  stimulusType?: "animal" | "food"
) {
  stimulusSet = stimulusSet
    ? stimulusSet
    : stimulusType
    ? stimulusType === "animal"
      ? animalStimuli
      : foodStimuli
    : animalStimuli;

  let sampleSizes = [2, 3, 4, 5, 6, 7];
  if (sampling_function) {
    sampleSizes = sampling_function();
    // Check if all values in sampleSizes is within length of stimulusSet; truncate if not
    for (let i = 0; i < sampleSizes.length; i++) {
      if (sampleSizes[i] > stimulusSet.length) {
        sampleSizes[i] = stimulusSet.length;
      }
    }
  }

  return {
    timeline: [lswmTrialSequence(jsPsych, stimulusSet)],
    timeline_variables: sampleSizes.map((sequence_length) => ({
      sequence_length: sequence_length,
    })),
  };
}

function lswmTwoListSection(
  jsPsych: JsPsych,
  sampling_function?: () => Array<number>,
  stimulusSet?: Array<listSortingWorkingMemoryTestStimulusInfo>
) {
  stimulusSet = stimulusSet ? stimulusSet : animalStimuli.concat(foodStimuli);

  let sampleSizes = [2, 3, 4, 5, 6, 7];
  if (sampling_function) {
    sampleSizes = sampling_function();
    // Check if all values in sampleSizes is within length of stimulusSet; truncate if not
    for (let i = 0; i < sampleSizes.length; i++) {
      if (sampleSizes[i] > stimulusSet.length) {
        sampleSizes[i] = stimulusSet.length;
      }
    }
  }

  return {
    timeline: [lswmTrialSequence(jsPsych, stimulusSet)],
    timeline_variables: sampleSizes.map((sequence_length) => ({
      sequence_length: sequence_length,
    })),
  };
}

// main function
export function createTimeline(
  jsPsych: JsPsych,
  options: {
    in_person?: boolean;
    one_list_stimulus_set?: Array<listSortingWorkingMemoryTestStimulusInfo>;
    two_list_stimulus_set?: Array<listSortingWorkingMemoryTestStimulusInfo>;
  }
) {
  // Default options
  const defaultOptions = {
    in_person: true,
    one_list_stimulus_set: animalStimuli,
    two_list_stimulus_set: animalStimuli.concat(foodStimuli),
  };

  // Merge default options with user options
  options = {
    ...defaultOptions,
    ...options,
  };

  return {
    timeline: [
      preloadAudio(
        options.one_list_stimulus_set
          .map((stimulus) => stimulus.stimulus_audio)
          .concat(options.two_list_stimulus_set.map((stimulus) => stimulus.stimulus_audio))
      ),
      lswmOneListSection(jsPsych, undefined, options.one_list_stimulus_set),
      lswmTwoListSection(jsPsych, undefined, options.two_list_stimulus_set),
    ],
  };
}

export const timelineUnits = {
  lswmTrial,
  lswmTrialSequence,
  lswmOneListSection,
  lswmTwoListSection,
};

export const utils = {
  preloadAudio,
  animalStimuli,
  foodStimuli,
};
