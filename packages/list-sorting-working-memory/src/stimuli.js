const ASSETS_REL_FILE_PATH = "../assets/";
const ASSETS_REL_FILE_PATH_IMAGES = ASSETS_REL_FILE_PATH + "images/";
const ASSETS_REL_FILE_PATH_AUDIO = ASSETS_REL_FILE_PATH + "audio/";

// Image asset imports
import { bearSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/bear.js`;
import { beeSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/bee.js`;
import { birdSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/bird.js`;
import { butterflySvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/butterfly.js`;
import { camelSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/camel.js`;
import { catSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/cat.js`;
import { cowSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/cow.js`;
import { dogSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/dog.js`;
import { duckSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/duck.js`;
import { elephantSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/elephant.js`;
import { frogSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/frog.js`;
import { horseSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/horse.js`;
import { lionSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/lion.js`;
import { monkeySvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/monkey.js`;
import { mouseSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/mouse.js`;
import { pigSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/pig.js`;
import { rabbitSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/rabbit.js`;
import { sheepSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/sheep.js`;
import { tigerSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/tiger.js`;
import { turtleSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-animals/turtle.js`;
import { appleSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/apple.js`;
import { bananaSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/banana.js`;
import { beanSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/bean.js`;
import { cakeSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/cake.js`;
import { cherrySvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/cherry.js`;
import { cornSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/corn.js`;
import { eggSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/egg.js`;
import { hamburgerSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/hamburger.js`;
import { limeSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/lime.js`;
import { orangeSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/orange.js`;
import { peachSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/peach.js`;
import { pearSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/pear.js`;
import { pineappleSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/pineapple.js`;
import { popcornSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/popcorn.js`;
import { strawberrySvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/strawberry.js`;
import { watermelonSvg } from `${ASSETS_REL_FILE_PATH_IMAGES}images-food/watermelon.js`;

// Audio asset imports
// bee, butterfly → frog, bird, mouse -> turtle, rabbit, duck → cat, monkey -> dog, sheep, pig -> horse, cow, tiger → lion, bear, camel, elephant
const audioAnimalsFp = `${ASSETS_REL_FILE_PATH_AUDIO}audio-animals/`;
export const animalStimuli = [
  [
    {
      stimulus_name: "bee",
      stimulus_image: beeSvg,
      stimulus_audio: `${audioAnimalsFp}bee.mp3`,
    },
    {
      stimulus_name: "butterfly",
      stimulus_image: butterflySvg,
      stimulus_audio: `${audioAnimalsFp}butterfly.mp3`,
    },
  ],
  [
    {
      stimulus_name: "frog",
      stimulus_image: frogSvg,
      stimulus_audio: `${audioAnimalsFp}frog.mp3`,
    },
    {
      stimulus_name: "mouse",
      stimulus_image: mouseSvg,
      stimulus_audio: `${audioAnimalsFp}mouse.mp3`,
    },
    {
      stimulus_name: "bird",
      stimulus_image: birdSvg,
      stimulus_audio: `${audioAnimalsFp}bird.mp3`,
    },
  ],
  [
    {
      stimulus_name: "turtle",
      stimulus_image: turtleSvg,
      stimulus_audio: `${audioAnimalsFp}turtle.mp3`,
    },
    {
      stimulus_name: "rabbit",
      stimulus_image: rabbitSvg,
      stimulus_audio: `${audioAnimalsFp}rabbit.mp3`,
    },
    {
      stimulus_name: "duck",
      stimulus_image: duckSvg,
      stimulus_audio: `${audioAnimalsFp}duck.mp3`,
    },
  ],
  [
    {
      stimulus_name: "cat",
      stimulus_image: catSvg,
      stimulus_audio: `${audioAnimalsFp}cat.mp3`,
    },
    {
      stimulus_name: "monkey",
      stimulus_image: monkeySvg,
      stimulus_audio: `${audioAnimalsFp}monkey.mp3`,
    },
  ],
  [
    {
      stimulus_name: "dog",
      stimulus_image: dogSvg,
      stimulus_audio: `${audioAnimalsFp}dog.mp3`,
    },
    {
      stimulus_name: "sheep",
      stimulus_image: sheepSvg,
      stimulus_audio: `${audioAnimalsFp}sheep.mp3`,
    },
    {
      stimulus_name: "pig",
      stimulus_image: pigSvg,
      stimulus_audio: `${audioAnimalsFp}pig.mp3`,
    },
  ],
  [
    {
      stimulus_name: "horse",
      stimulus_image: horseSvg,
      stimulus_audio: `${audioAnimalsFp}horse.mp3`,
    },
    {
      stimulus_name: "cow",
      stimulus_image: cowSvg,
      stimulus_audio: `${audioAnimalsFp}cow.mp3`,
    },
    {
      stimulus_name: "tiger",
      stimulus_image: tigerSvg,
      stimulus_audio: `${audioAnimalsFp}tiger.mp3`,
    },
  ],
  [
    {
      stimulus_name: "lion",
      stimulus_image: lionSvg,
      stimulus_audio: `${audioAnimalsFp}lion.mp3`,
    },
    {
      stimulus_name: "bear",
      stimulus_image: bearSvg,
      stimulus_audio: `${audioAnimalsFp}bear.mp3`,
    },
    {
      stimulus_name: "camel",
      stimulus_image: camelSvg,
      stimulus_audio: `${audioAnimalsFp}camel.mp3`,
    },
    {
      stimulus_name: "elephant",
      stimulus_image: elephantSvg,
      stimulus_audio: `${audioAnimalsFp}elephant.mp3`,
    },
  ],
];

// Bean, popcorn → cherry, strawberry → egg, lime -> peach, apple, orange, pear → corn, banana → pineapple, hamburger → cake, watermelon
const audioFoodsFp = `${ASSETS_REL_FILE_PATH_AUDIO}audio-food/`;
export const foodStimuli = [
  [
    {
      stimulus_name: "bean",
      stimulus_image: beanSvg,
      stimulus_audio: `${audioFoodsFp}bean.mp3`,
    },
    {
      stimulus_name: "popcorn",
      stimulus_image: popcornSvg,
      stimulus_audio: `${audioFoodsFp}popcorn.mp3`,
    },
  ],
  [
    {
      stimulus_name: "cherry",
      stimulus_image: cherrySvg,
      stimulus_audio: `${audioFoodsFp}cherry.mp3`,
    },
    {
      stimulus_name: "strawberry",
      stimulus_image: strawberrySvg,
      stimulus_audio: `${audioFoodsFp}strawberry.mp3`,
    },
  ],
  [
    {
      stimulus_name: "egg",
      stimulus_image: eggSvg,
      stimulus_audio: `${audioFoodsFp}egg.mp3`,
    },
    {
      stimulus_name: "lime",
      stimulus_image: limeSvg,
      stimulus_audio: `${audioFoodsFp}lime.mp3`,
    },
  ],
  [
    {
      stimulus_name: "peach",
      stimulus_image: peachSvg,
      stimulus_audio: `${audioFoodsFp}peach.mp3`,
    },
    {
      stimulus_name: "apple",
      stimulus_image: appleSvg,
      stimulus_audio: `${audioFoodsFp}apple.mp3`,
    },
    {
      stimulus_name: "orange",
      stimulus_image: orangeSvg,
      stimulus_audio: `${audioFoodsFp}orange.mp3`,
    },
    {
      stimulus_name: "pear",
      stimulus_image: pearSvg,
      stimulus_audio: `${audioFoodsFp}pear.mp3`,
    },
  ],
  [
    {
      stimulus_name: "corn",
      stimulus_image: cornSvg,
      stimulus_audio: `${audioFoodsFp}corn.mp3`,
    },
    {
      stimulus_name: "banana",
      stimulus_image: bananaSvg,
      stimulus_audio: `${audioFoodsFp}banana.mp3`,
    },
  ],
  [
    {
      stimulus_name: "pineapple",
      stimulus_image: pineappleSvg,
      stimulus_audio: `${audioFoodsFp}pineapple.mp3`,
    },
    {
      stimulus_name: "hamburger",
      stimulus_image: hamburgerSvg,
      stimulus_audio: `${audioFoodsFp}hamburger.mp3`,
    },
  ],
  [
    {
      stimulus_name: "cake",
      stimulus_image: cakeSvg,
      stimulus_audio: `${audioFoodsFp}cake.mp3`,
    },
    {
      stimulus_name: "watermelon",
      stimulus_image: watermelonSvg,
      stimulus_audio: `${audioFoodsFp}watermelon.mp3`,
    },
  ],
];

export const oneListPracticeStimuliA = [
  {
    stimulus_set_name: "animals",
    stimulus_set: [
      [
        {
          stimulus_name: "dog",
          stimulus_image: dogSvg,
          stimulus_audio: `${audioAnimalsFp}dog.mp3`,
        },
      ],
      [
        {
          stimulus_name: "horse",
          stimulus_image: horseSvg,
          stimulus_audio: `${audioAnimalsFp}horse.mp3`,
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
          stimulus_audio: `${audioAnimalsFp}rabbit.mp3`,
        },
      ],
      [
        {
          stimulus_name: "sheep",
          stimulus_image: sheepSvg,
          stimulus_audio: `${audioAnimalsFp}sheep.mp3`,
        },
      ],
      [
        {
          stimulus_name: "elephant",
          stimulus_image: elephantSvg,
          stimulus_audio: `${audioAnimalsFp}elephant.mp3`,
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
          stimulus_audio: `${audioAnimalsFp}bear.mp3`,
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
          stimulus_audio: `${audioFoodsFp}banana.mp3`,
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
          stimulus_audio: `${audioAnimalsFp}frog.mp3`,
        },
      ],
      [
        {
          stimulus_name: "tiger",
          stimulus_image: tigerSvg,
          stimulus_audio: `${audioAnimalsFp}tiger.mp3`,
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
          stimulus_audio: `${audioFoodsFp}pineapple.mp3`,
        },
      ],
    ],
  },
];

export const defaultLiveStimuli = [
  {
    stimulus_set_name: "animals",
    stimulus_set: animalStimuli,
  },
  {
    stimulus_set_name: "foods",
    stimulus_set: foodStimuli,
  },
];
