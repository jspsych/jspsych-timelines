import { bearSvg } from "../assets/images/images-animals/bear.js";
import { beeSvg } from "../assets/images/images-animals/bee.js";
import { birdSvg } from "../assets/images/images-animals/bird.js";
import { butterflySvg } from "../assets/images/images-animals/butterfly.js";
import { camelSvg } from "../assets/images/images-animals/camel.js";
import { catSvg } from "../assets/images/images-animals/cat.js";
import { cowSvg } from "../assets/images/images-animals/cow.js";
import { dogSvg } from "../assets/images/images-animals/dog.js";
import { duckSvg } from "../assets/images/images-animals/duck.js";
import { elephantSvg } from "../assets/images/images-animals/elephant.js";
import { frogSvg } from "../assets/images/images-animals/frog.js";
import { horseSvg } from "../assets/images/images-animals/horse.js";
import { lionSvg } from "../assets/images/images-animals/lion.js";
import { monkeySvg } from "../assets/images/images-animals/monkey.js";
import { mouseSvg } from "../assets/images/images-animals/mouse.js";
import { pigSvg } from "../assets/images/images-animals/pig.js";
import { rabbitSvg } from "../assets/images/images-animals/rabbit.js";
import { sheepSvg } from "../assets/images/images-animals/sheep.js";
import { tigerSvg } from "../assets/images/images-animals/tiger.js";
import { turtleSvg } from "../assets/images/images-animals/turtle.js";
import { appleSvg } from "../assets/images/images-food/apple.js";
import { bananaSvg } from "../assets/images/images-food/banana.js";
import { beanSvg } from "../assets/images/images-food/bean.js";
import { cakeSvg } from "../assets/images/images-food/cake.js";
import { cherrySvg } from "../assets/images/images-food/cherry.js";
import { cornSvg } from "../assets/images/images-food/corn.js";
import { eggSvg } from "../assets/images/images-food/egg.js";
import { hamburgerSvg } from "../assets/images/images-food/hamburger.js";
import { limeSvg } from "../assets/images/images-food/lime.js";
import { orangeSvg } from "../assets/images/images-food/orange.js";
import { peachSvg } from "../assets/images/images-food/peach.js";
import { pearSvg } from "../assets/images/images-food/pear.js";
import { pineappleSvg } from "../assets/images/images-food/pineapple.js";
import { popcornSvg } from "../assets/images/images-food/popcorn.js";
import { strawberrySvg } from "../assets/images/images-food/strawberry.js";
import { watermelonSvg } from "../assets/images/images-food/watermelon.js";
import { getAssetUrl } from "./assets.js";

const ASSETS_REL_FILE_PATH = "../assets/";
const ASSETS_REL_FILE_PATH_AUDIO = ASSETS_REL_FILE_PATH + "audio/";
const AUDIO_ANIMALS_FP = `${ASSETS_REL_FILE_PATH_AUDIO}audio-animals/`;
const AUDIO_FOODS_FP = `${ASSETS_REL_FILE_PATH_AUDIO}audio-food/`;
const AUDIO_EXTENSION = ".mp3";

// Stimulus groupings in increasing size (7 groups)
const animalNames = [
  ["bee", "butterfly"],
  ["frog", "mouse", "bird"],
  ["turtle", "rabbit", "duck"],
  ["cat", "monkey"],
  ["dog", "sheep", "pig"],
  ["horse", "cow", "tiger"],
  ["lion", "bear", "camel", "elephant"],
];

const animalSvgs = [
  [beeSvg, butterflySvg],
  [frogSvg, mouseSvg, birdSvg],
  [turtleSvg, rabbitSvg, duckSvg],
  [catSvg, monkeySvg],
  [dogSvg, sheepSvg, pigSvg],
  [horseSvg, cowSvg, tigerSvg],
  [lionSvg, bearSvg, camelSvg, elephantSvg],
];

const foodNames = [
  ["bean", "popcorn"],
  ["cherry", "strawberry"],
  ["egg", "lime"],
  ["peach", "apple", "orange", "pear"],
  ["corn", "banana"],
  ["pineapple", "hamburger"],
  ["cake", "watermelon"],
];

const foodSvgs = [
  [beanSvg, popcornSvg],
  [cherrySvg, strawberrySvg],
  [eggSvg, limeSvg],
  [peachSvg, appleSvg, orangeSvg, pearSvg],
  [cornSvg, bananaSvg],
  [pineappleSvg, hamburgerSvg],
  [cakeSvg, watermelonSvg],
];

export const animalStimuli = {
  stimulus_set_name: "animals",
  stimulus_set: animalNames.map((group, group_idx) =>
    group.map((name, idx) => ({
      stimulus_name: name,
      stimulus_image: animalSvgs[group_idx][idx],
      stimulus_audio: getAssetUrl(name, AUDIO_EXTENSION, AUDIO_ANIMALS_FP),
      stimulus_index: group_idx * 100 + idx,
      stimulus_set_id: "animals",
    }))
  ),
};

export const foodStimuli = {
  stimulus_set_name: "foods",
  stimulus_set: foodNames.map((group, group_idx) =>
    group.map((name, idx) => ({
      stimulus_name: name,
      stimulus_image: foodSvgs[group_idx][idx],
      stimulus_audio: getAssetUrl(name, AUDIO_EXTENSION, AUDIO_FOODS_FP),
      stimulus_index: group_idx * 100 + idx,
      stimulus_set_id: "foods",
    }))
  ),
};

export const oneListPracticeStimuliA = [
  {
    stimulus_set_name: "animals",
    stimulus_set: [
      [
        {
          stimulus_name: "dog",
          stimulus_image: dogSvg,
          stimulus_audio: `${AUDIO_ANIMALS_FP}dog.mp3`,
        },
      ],
      [
        {
          stimulus_name: "horse",
          stimulus_image: horseSvg,
          stimulus_audio: `${AUDIO_ANIMALS_FP}horse.mp3`,
        },
      ],
    ],
  },
];

export const oneListPracticeStimuliB = [
  {
    stimulus_set_name: "animals",
    stimulus_set: [
      [
        {
          stimulus_name: "rabbit",
          stimulus_image: rabbitSvg,
          stimulus_audio: `${AUDIO_ANIMALS_FP}rabbit.mp3`,
        },
      ],
      [
        {
          stimulus_name: "sheep",
          stimulus_image: sheepSvg,
          stimulus_audio: `${AUDIO_ANIMALS_FP}sheep.mp3`,
        },
      ],
      [
        {
          stimulus_name: "elephant",
          stimulus_image: elephantSvg,
          stimulus_audio: `${AUDIO_ANIMALS_FP}elephant.mp3`,
        },
      ],
    ],
  },
];

export const twoListPracticeStimuliA = [
  {
    stimulus_set_name: "animals",
    stimulus_set: [
      [
        {
          stimulus_name: "bear",
          stimulus_image: bearSvg,
          stimulus_audio: `${AUDIO_ANIMALS_FP}bear.mp3`,
        },
      ],
    ],
  },
  {
    stimulus_set_name: "foods",
    stimulus_set: [
      [
        {
          stimulus_name: "banana",
          stimulus_image: bananaSvg,
          stimulus_audio: `${AUDIO_FOODS_FP}banana.mp3`,
        },
      ],
    ],
  },
];

export const twoListPracticeStimuliB = [
  {
    stimulus_set_name: "animals",
    stimulus_set: [
      [
        {
          stimulus_name: "frog",
          stimulus_image: frogSvg,
          stimulus_audio: `${AUDIO_ANIMALS_FP}frog.mp3`,
        },
      ],
      [
        {
          stimulus_name: "tiger",
          stimulus_image: tigerSvg,
          stimulus_audio: `${AUDIO_ANIMALS_FP}tiger.mp3`,
        },
      ],
    ],
  },
  {
    stimulus_set_name: "foods",
    stimulus_set: [
      [
        {
          stimulus_name: "pineapple",
          stimulus_image: pineappleSvg,
          stimulus_audio: `${AUDIO_FOODS_FP}pineapple.mp3`,
        },
      ],
    ],
  },
];

export const defaultLiveStimuli = [animalStimuli, foodStimuli];

// For CDN users who need custom asset paths, use:
// import { setAssetBase } from './assets.js';
// setAssetBase('https://unpkg.com/@jspsych-timelines/list-sorting-working-memory@latest/assets/');
