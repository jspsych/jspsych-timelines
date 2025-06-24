import jsPsychAudioKeyboardResponse from "@jspsych/plugin-audio-keyboard-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
// import jsPsychPreload from "@jspsych/plugin-preload";
import { JsPsych } from "jspsych";

import {bearSvg} from "../assets/images/images-animals/bear.js";
import {beeSvg} from "../assets/images/images-animals/bee.js";
import {birdSvg} from "../assets/images/images-animals/bird.js";
import {butterflySvg} from "../assets/images/images-animals/butterfly.js";
import {camelSvg} from "../assets/images/images-animals/camel.js";
import {catSvg} from "../assets/images/images-animals/cat.js";
import {cowSvg} from "../assets/images/images-animals/cow.js";
import {dogSvg} from "../assets/images/images-animals/dog.js";
import {duckSvg} from "../assets/images/images-animals/duck.js";
import {elephantSvg} from "../assets/images/images-animals/elephant.js";
import {frogSvg} from "../assets/images/images-animals/frog.js";
import {horseSvg} from "../assets/images/images-animals/horse.js";
import {lionSvg} from "../assets/images/images-animals/lion.js";
import {monkeySvg} from "../assets/images/images-animals/monkey.js";
import {mouseSvg} from "../assets/images/images-animals/mouse.js";
import {pigSvg} from "../assets/images/images-animals/pig.js";
import {rabbitSvg} from "../assets/images/images-animals/rabbit.js";
import {sheepSvg} from "../assets/images/images-animals/sheep.js";
import {tigerSvg} from "../assets/images/images-animals/tiger.js";
import {turtleSvg} from "../assets/images/images-animals/turtle.js";
import {appleSvg} from "../assets/images/images-food/apple.js";
import {bananaSvg} from "../assets/images/images-food/banana.js";
import {beanSvg} from "../assets/images/images-food/bean.js";
import {cakeSvg} from "../assets/images/images-food/cake.js";
import {cherrySvg} from "../assets/images/images-food/cherry.js";
import {cornSvg} from "../assets/images/images-food/corn.js";
import {eggSvg} from "../assets/images/images-food/egg.js";
import {hamburgerSvg} from "../assets/images/images-food/hamburger.js";
import {lemonSvg} from "../assets/images/images-food/lemon.js";
import {orangeSvg} from "../assets/images/images-food/orange.js";
import {peachSvg} from "../assets/images/images-food/peach.js";
import {pearSvg} from "../assets/images/images-food/pear.js";
import {pineappleSvg} from "../assets/images/images-food/pineapple.js";
import {popcornSvg} from "../assets/images/images-food/popcorn.js";
import {strawberrySvg} from "../assets/images/images-food/strawberry.js";
import {watermelonSvg} from "../assets/images/images-food/watermelon.js";

// Constants
const animals = [
  "bee",
  "butterfly",
  "frog",
  "bird",
  "mouse",
  "turtle",
  "rabbit",
  "duck",
  "cat",
  "monkey",
  "dog",
  "sheep",
  "pig",
  "horse",
  "cow",
  "tiger",
  "lion",
  "bear",
  "camel",
  "elephant",
];
const animalSvgs = [
  beeSvg,
  butterflySvg,
  frogSvg,
  birdSvg,
  mouseSvg,
  turtleSvg,
  rabbitSvg,
  duckSvg,
  catSvg,
  monkeySvg,
  dogSvg,
  sheepSvg,
  pigSvg,
  horseSvg,
  cowSvg,
  tigerSvg,
  lionSvg,
  bearSvg,
  camelSvg,
  elephantSvg,
];
const audioAnimalsFp = "../assets/audio/audio-animals/";
const animalStimuli: Array<listSortingWorkingMemoryTestStimulusInfo> = animals.map(
  (animal, index) => ({
    stimulus_image: animalSvgs[index],
    stimulus_audio: `${audioAnimalsFp}${animal}.mp3`,
  })
);

const foods = [
  "bean",
  "popcorn",
  "cherry",
  "strawberry",
  "egg",
  "lemon",
  "peach",
  "apple",
  "orange",
  "pear",
  "corn",
  "banana",
  "pineapple",
  "hamburger",
  "watermelon",
  "cake",
];
const foodSvgs = [
  beanSvg,
  popcornSvg,
  cherrySvg,
  strawberrySvg,
  eggSvg,
  lemonSvg,
  peachSvg,
  appleSvg,
  orangeSvg,
  pearSvg,
  cornSvg,
  bananaSvg,
  pineappleSvg,
  hamburgerSvg,
  watermelonSvg,
  cakeSvg,
];
const audioFoodsFp = "../assets/audio/audio-food/";
const foodStimuli: Array<listSortingWorkingMemoryTestStimulusInfo> = foods.map((food, index) => ({
  stimulus_image: foodSvgs[index],
  stimulus_audio: `${audioFoodsFp}${food}.mp3`,
}));

interface listSortingWorkingMemoryTestStimulusInfo {
  stimulus_image: string;
  stimulus_audio: string;
}

function imageTrial(jsPsych, image) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: image,
    choices: ["f"],
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
      stimulus_set_id: list_idx,
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
    for (const animalStimulus of options.stimulus_set[0]) {
      timeline.push(imageTrial(jsPsych, animalStimulus.stimulus_image));
      // timeline.push(
      // lswmSection(jsPsych, {
      //   // Assume stimulus_set[0] is always first dimension, stimulus_set[1] is second dimension, etc.
      //   stimulus_set: options.stimulus_set.toSpliced(
      //     dimension,
      //     options.stimulus_set.length - dimension
      //   ),
      // })
      // );
    }
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
