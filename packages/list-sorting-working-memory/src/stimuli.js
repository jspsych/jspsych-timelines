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


// Default Stimuli
// bee, butterfly → frog, bird, mouse -> turtle, rabbit, duck → cat, monkey -> dog, sheep, pig -> horse, cow, tiger → lion, bear, camel, elephant
const audioAnimalsFp = "../assets/audio/audio-animals/";
export const animalStimuli = [
  [
    {
      stimulus_image: beeSvg,
      stimulus_audio: `${audioAnimalsFp}bee.mp3`,
    },
    {
      stimulus_image: butterflySvg,
      stimulus_audio: `${audioAnimalsFp}butterfly.mp3`,
    },
  ],
  [
    {
      stimulus_image: frogSvg,
      stimulus_audio: `${audioAnimalsFp}frog.mp3`,
    },
    {
      stimulus_image: mouseSvg,
      stimulus_audio: `${audioAnimalsFp}mouse.mp3`,
    },
    {
      stimulus_image: birdSvg,
      stimulus_audio: `${audioAnimalsFp}bird.mp3`,
    }
  ],
  [
    {
      stimulus_image: turtleSvg,
      stimulus_audio: `${audioAnimalsFp}turtle.mp3`,
    },
    {
      stimulus_image: rabbitSvg,
      stimulus_audio: `${audioAnimalsFp}rabbit.mp3`,
    },
    {
      stimulus_image: duckSvg,
      stimulus_audio: `${audioAnimalsFp}duck.mp3`,
    },
  ],
  [
    {
      stimulus_image: catSvg,
      stimulus_audio: `${audioAnimalsFp}cat.mp3`,
    },
    {
      stimulus_image: monkeySvg,
      stimulus_audio: `${audioAnimalsFp}monkey.mp3`,
    },
  ],
  [
    {
      stimulus_image: dogSvg,
      stimulus_audio: `${audioAnimalsFp}dog.mp3`,
    },
    {
      stimulus_image: sheepSvg,
      stimulus_audio: `${audioAnimalsFp}sheep.mp3`,
    },
    {
      stimulus_image: pigSvg,
      stimulus_audio: `${audioAnimalsFp}pig.mp3`,
    },
  ],
  [
    {
      stimulus_image: horseSvg,
      stimulus_audio: `${audioAnimalsFp}horse.mp3`,
    },
    {
      stimulus_image: cowSvg,
      stimulus_audio: `${audioAnimalsFp}cow.mp3`,
    },
    {
      stimulus_image: tigerSvg,
      stimulus_audio: `${audioAnimalsFp}tiger.mp3`,
    },
  ],
  [
    {
      stimulus_image: lionSvg,
      stimulus_audio: `${audioAnimalsFp}lion.mp3`,
    },
    {
      stimulus_image: bearSvg,
      stimulus_audio: `${audioAnimalsFp}bear.mp3`,
    },
    {
      stimulus_image: camelSvg,
      stimulus_audio: `${audioAnimalsFp}camel.mp3`,
    },
    {
      stimulus_image: elephantSvg,
      stimulus_audio: `${audioAnimalsFp}elephant.mp3`,
    },
  ],
];

// Bean, popcorn → cherry, strawberry → egg, lime -> peach, apple, orange, pear → corn, banana → pineapple, hamburger → cake, watermelon
const audioFoodsFp = "../assets/audio/audio-food/";
export const foodStimuli = [
  [
    {
      stimulus_image: beanSvg,
      stimulus_audio: `${audioFoodsFp}bean.mp3`,
    },
    {
      stimulus_image: popcornSvg,
      stimulus_audio: `${audioFoodsFp}popcorn.mp3`,
    },
  ],
  [
    {
      stimulus_image: cherrySvg,
      stimulus_audio: `${audioFoodsFp}cherry.mp3`,
    },
    {
      stimulus_image: strawberrySvg,
      stimulus_audio: `${audioFoodsFp}strawberry.mp3`,
    },
  ],
  [
    {
      stimulus_image: eggSvg,
      stimulus_audio: `${audioFoodsFp}egg.mp3`,
    },
    {
      stimulus_image: limeSvg,
      stimulus_audio: `${audioFoodsFp}lime.mp3`,
    },
  ],
  [
    {
      stimulus_image: peachSvg,
      stimulus_audio: `${audioFoodsFp}peach.mp3`,
    },
    {
      stimulus_image: appleSvg,
      stimulus_audio: `${audioFoodsFp}apple.mp3`,
    },
    {
      stimulus_image: orangeSvg,
      stimulus_audio: `${audioFoodsFp}orange.mp3`,
    },
    {
      stimulus_image: pearSvg,
      stimulus_audio: `${audioFoodsFp}pear.mp3`,
    },
  ],
  [
    {
      stimulus_image: cornSvg,
      stimulus_audio: `${audioFoodsFp}corn.mp3`,
    },
    {
      stimulus_image: bananaSvg,
      stimulus_audio: `${audioFoodsFp}banana.mp3`,
    },
  ],
  [
    {
      stimulus_image: pineappleSvg,
      stimulus_audio: `${audioFoodsFp}pineapple.mp3`,
    },
    {
      stimulus_image: hamburgerSvg,
      stimulus_audio: `${audioFoodsFp}hamburger.mp3`,
    },
  ],
  [
    {
      stimulus_image: cakeSvg,
      stimulus_audio: `${audioFoodsFp}cake.mp3`,
    },
    {
      stimulus_image: watermelonSvg,
      stimulus_audio: `${audioFoodsFp}watermelon.mp3`,
    },
  ],
];
