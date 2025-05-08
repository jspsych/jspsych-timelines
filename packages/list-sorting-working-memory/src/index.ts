import jsPsychAudioKeyboardResponse from "@jspsych/plugin-audio-keyboard-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychPreload from "@jspsych/plugin-preload";
import { JsPsych } from "jspsych";

import { sesameSeedSvg } from "../assets/images/images-food/1-sesame_seed.js";
import { peppercornSvg } from "../assets/images/images-food/2-peppercorn.js";
import { cornSvg } from "../assets/images/images-food/3-corn.js";
import { coffeeBeanSvg } from "../assets/images/images-food/4-coffee_bean.js";
import { blueberrySvg } from "../assets/images/images-food/5-blueberry.js";
import { raspberrySvg } from "../assets/images/images-food/6-raspberry.js";
import { grapeSvg } from "../assets/images/images-food/7-grape.js";
import { strawberrySvg } from "../assets/images/images-food/8-strawberry.js";
import { mushroomSvg } from "../assets/images/images-food/9-mushroom.js";
import { figSvg } from "../assets/images/images-food/10-fig.js";
import { garlicSvg } from "../assets/images/images-food/11-garlic.js";
import { eggSvg } from "../assets/images/images-food/12-egg.js";
import { kiwiSvg } from "../assets/images/images-food/13-kiwi.js";
import { apricotSvg } from "../assets/images/images-food/14-apricot.js";
import { tomatoSvg } from "../assets/images/images-food/15-tomato.js";
import { onionSvg } from "../assets/images/images-food/16-onion.js";
import { orangeSvg } from "../assets/images/images-food/17-orange.js";
import { appleSvg } from "../assets/images/images-food/18-apple.js";
import { mangoSvg } from "../assets/images/images-food/19-mango.js";
import { bellPepperSvg } from "../assets/images/images-food/20-bell_pepper.js";
import { grapefruitSvg } from "../assets/images/images-food/21-grapefruit.js";
import { cauliflowerSvg } from "../assets/images/images-food/22-cauliflower.js";
import { coconutSvg } from "../assets/images/images-food/23-coconut.js";
import { cabbageSvg } from "../assets/images/images-food/24-cabbage.js";
import { cantaloupeSvg } from "../assets/images/images-food/25-cantaloupe.js";
import { honeydewSvg } from "../assets/images/images-food/26-honeydew.js";
import { watermelonSvg } from "../assets/images/images-food/27-watermelon.js";
import { pumpkinSvg } from "../assets/images/images-food/28-pumpkin.js";

// Constants
const animalStimuli: Array<listSortingWorkingMemoryTestStimulusInfo> = [
  {
    stimulus_image: "/assets/images/images-animals/mouse.png",
    stimulus_audio: "/assets/audio/audio-animals/mouse.mp3",
  },
  {
    stimulus_image: "/assets/images/images-animals/bird.png",
    stimulus_audio: "/assets/audio/audio-animals/bird.mp3",
  },
  {
    stimulus_image: "/assets/images/images-animals/rabbit.png",
    stimulus_audio: "/assets/audio/audio-animals/rabbit.mp3",
  },
  {
    stimulus_image: "/assets/images/images-animals/dog.png",
    stimulus_audio: "/assets/audio/audio-animals/dog.mp3",
  },
  {
    stimulus_image: "/assets/images/images-animals/monkey.png",
    stimulus_audio: "/assets/audio/audio-animals/monkey.mp3",
  },
  {
    stimulus_image: "/assets/images/images-animals/lion.png",
    stimulus_audio: "/assets/audio/audio-animals/lion.mp3",
  },
  {
    stimulus_image: "/assets/images/images-animals/elephant.png",
    stimulus_audio: "/assets/audio/audio-animals/elephant.mp3",
  },
  {
    stimulus_image: "/assets/images/images-animals/whale.png",
    stimulus_audio: "/assets/audio/audio-animals/whale.mp3",
  },
];

const foodStimuli: Array<listSortingWorkingMemoryTestStimulusInfo> = [
  {
    stimulus_image: `/assets/images/images-food/bean.png`,
    stimulus_audio: `/assets/audio/audio-food/bean.mp3`,
  },
  {
    stimulus_image: `/assets/images/images-food/mushroom.png`,
    stimulus_audio: `/assets/audio/audio-food/mushroom.mp3`,
  },
  {
    stimulus_image: `/assets/images/images-food/grape.png`,
    stimulus_audio: `/assets/audio/audio-food/grape.mp3`,
  },
  {
    stimulus_image: `/assets/images/images-food/shrimp.png`,
    stimulus_audio: `/assets/audio/audio-food/shrimp.mp3`,
  },
  {
    stimulus_image: `/assets/images/images-food/apple.png`,
    stimulus_audio: `/assets/audio/audio-food/apple.mp3`,
  },
  // {
  //   stimulus_image: `/assets/images/images-food/papaya.png`,
  //   stimulus_audio: `/assets/audio/audio-food/papaya.mp3`,
  // },
  {
    stimulus_image: `/assets/images/images-food/turkey.png`,
    stimulus_audio: `/assets/audio/audio-food/turkey.mp3`,
  },
  {
    stimulus_image: `/assets/images/images-food/pumpkin.png`,
    stimulus_audio: `/assets/audio/audio-food/pumpkin.mp3`,
  },
];

interface listSortingWorkingMemoryTestStimulusInfo {
  stimulus_image: string;
  stimulus_audio: string;
}

function imageTrial(jsPsych, image) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: image,
    choices: ['f'],
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
    stimulus_set: Array<listSortingWorkingMemoryTestStimulusInfo>;
    sequence_length: number;
  }
) {
  return {
    timeline: [lswmTrial],
    // TODO: Figure out whether this sampling should be engineered to sample as sparsely as possible
    timeline_variables: jsPsych.randomization.sampleWithoutReplacement(
      options.stimulus_set,
      options.sequence_length
    ),
  };
}

function lswmSection(
  jsPsych: JsPsych,
  options: {
    stimulus_set_list: Array<Array<listSortingWorkingMemoryTestStimulusInfo>>;
    sample_size_sequence: Array<number>;
  }
) {
  // Flatten stimulus_set; include index as stimulus_set_id
  const stimulusSetFlat = options.stimulus_set_list.flatMap((stimulus, list_idx) =>
    stimulus.map((stimulusInfo) => ({
      stimulus_image: stimulusInfo.stimulus_image,
      stimulus_audio: stimulusInfo.stimulus_audio,
      stimulus_set_id: list_idx
    }))
  );

  // Truncate sample size values larger than len(stimulusSet)
  if (options.sample_size_sequence) {
    options.sample_size_sequence = options.sample_size_sequence.map((size) =>
      Math.min(size, stimulusSetFlat.length)
    );
  } else {
    options.sample_size_sequence = Array.from({ length: stimulusSetFlat.length }, (_, i) => i + 1);
  }

  let sectionTimeline = [];
  for (let i = 0; i < options.sample_size_sequence.length; i++) {
    sectionTimeline.push(
      lswmTrialSequence(jsPsych, {
        stimulus_set: stimulusSetFlat,
        sequence_length: options.sample_size_sequence[i],
      })
    );
  }

  return sectionTimeline;
}

// Main function
export function createTimeline(
  jsPsych: JsPsych,
  options: {
    in_person?: boolean;
    stimulus_set?: Array<Array<listSortingWorkingMemoryTestStimulusInfo>>;
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
      { length: options.stimulus_set.length - 1 },
      (_, i) => i + 1
    );
  } else {
    // Truncate values in dimensions_sequence larger than len(stimulus_set) if provided
    options.dimensions_sequence = options.dimensions_sequence.map((dimension) =>
      Math.min(dimension, options.stimulus_set.length)
    );
  }

  let timeline = [];
  // timeline.push(lswmTrial(jsPsych, {
  //   stimulus_image: options.stimulus_set[0][0].stimulus_image,
  //   stimulus_audio: options.stimulus_set[0][0].stimulus_audio,}));

  for (let i = 0; i < options.dimensions_sequence.length; i++) {
    const dimension = options.dimensions_sequence[i];
    timeline.push(
      imageTrial(jsPsych, sesameSeedSvg),
      imageTrial(jsPsych, peppercornSvg),
      imageTrial(jsPsych, cornSvg),
      imageTrial(jsPsych, coffeeBeanSvg),
      imageTrial(jsPsych, blueberrySvg),
      imageTrial(jsPsych, raspberrySvg),
      imageTrial(jsPsych, grapeSvg),
      imageTrial(jsPsych, strawberrySvg),
      imageTrial(jsPsych, mushroomSvg),
      imageTrial(jsPsych, figSvg),
      imageTrial(jsPsych, garlicSvg),
      imageTrial(jsPsych, eggSvg),
      imageTrial(jsPsych, kiwiSvg),
      imageTrial(jsPsych, apricotSvg),
      imageTrial(jsPsych, tomatoSvg),
      imageTrial(jsPsych, onionSvg),
      imageTrial(jsPsych, orangeSvg),
      imageTrial(jsPsych, appleSvg),
      imageTrial(jsPsych, mangoSvg),
      imageTrial(jsPsych, bellPepperSvg),
      imageTrial(jsPsych, grapefruitSvg),
      imageTrial(jsPsych, cauliflowerSvg),
      imageTrial(jsPsych, coconutSvg),
      imageTrial(jsPsych, cabbageSvg),
      imageTrial(jsPsych, cantaloupeSvg),
      imageTrial(jsPsych, honeydewSvg),
      imageTrial(jsPsych, watermelonSvg),
      imageTrial(jsPsych, pumpkinSvg),
      // lswmSection(jsPsych, {
      //   // Assume stimulus_set[0] is always first dimension, stimulus_set[1] is second dimension, etc.
      //   stimulus_set: options.stimulus_set.toSpliced(
      //     dimension,
      //     options.stimulus_set.length - dimension
      //   ),
      // })
    );
  }
  return timeline;
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
