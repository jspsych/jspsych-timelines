# picture-vocab-timeline

## Overview

A jsPsych timeline for picture vocabulary assessment tasks. This package creates a structured vocabulary test where participants see words and select matching pictures from multiple choice options. The timeline includes practice trials with feedback and live assessment trials.

## Loading

### NPM Installation
```bash
npm install picture-vocab-timeline
```

### Script Tag
```html
<script src="https://unpkg.com/picture-vocab-timeline"></script>
```

### Module Import
```javascript
import { createTimeline } from 'picture-vocab-timeline';
```

## Compatibility

`picture-vocab-timeline` requires jsPsych v8.0.0 or later.

## Documentation

### createTimeline

#### jsPsychTimelinePictureVocabTimeline.createTimeline(jsPsych, config, options) ⇒ <code>timeline</code>

Creates a complete picture vocabulary assessment timeline with welcome screen, instructions, practice trials, live trials, and completion screen.

**Parameters:**
- `jsPsych` - The jsPsych instance
- `config` - Configuration object with practice and live items
- `options` - Optional settings for timeline behavior

**Config Object Structure:**
```javascript
{
  practiceItems: [
    {
      word: "banana",
      images: [bananaSVG, appleSVG, orangeSVG, grapeSVG], // SVG strings
      correctIndex: 0 // Index of correct image
    }
  ],
  liveItems: [
    {
      word: "dog", 
      images: [catSVG, dogSVG, fishSVG, birdSVG],
      correctIndex: 1
    }
  ]
}
```

**Options Object:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| shuffleTrials | boolean | false | Randomly shuffle the order of trials |
| shuffleImageChoices | boolean | false | Randomly shuffle image choices within each trial |

**Features:**
- Practice trials with feedback and retry mechanism (up to 3 attempts)
- **SVG validation and error handling** with automatic fallback to built-in images
- **Enhanced image resolution** with intelligent word-to-image matching
- **Robust error handling** with console warnings for invalid images
- Responsive image button layout with hover effects
- Comprehensive data collection for analysis

### timelineUnits

Individual timeline unit creators for building custom timelines:

- `createWelcomeScreen()` - Creates welcome screen with begin button
- `createInstructionsScreen()` - Creates instructions screen with next button  
- `createTransitionScreen()` - Creates transition screen between practice and live trials
- `createThankYouScreen()` - Creates completion screen with finish button
- `createPracticeTrial(jsPsych, word, images, correctIndex)` - Creates practice trial with feedback
- `createLiveTrial(word, images, correctIndex)` - Creates live trial without feedback

### utils

Utility functions for image validation and processing:

- `validateSvg(svgString)` - Validates SVG format and structure
- `resolveAndValidateImages(images, word)` - Validates provided images and adds fallbacks if needed  
- `getFallbackImages(word, count)` - Gets fallback images from built-in library, optionally matching word

### images

Built-in SVG image library containing common vocabulary items including:
- Food items: apple, banana, orange, grape, burger, cupcake, icecream
- Animals: dog, cat, bird, fish
- Objects: ball, car, spoon, fork, knife, plate

Images are automatically used as fallbacks when no images are provided in the config or when provided images fail validation. The system intelligently matches words to appropriate images when possible.

## Example Usage

```javascript
const jsPsych = initJsPsych({
  on_finish: () => jsPsych.data.displayData('json')
});

// Access built-in images
const images = jsPsychTimelinePictureVocabTimeline.images;

// Method 1: Pass config and options separately (recommended)
const timeline = jsPsychTimelinePictureVocabTimeline.createTimeline(jsPsych, {
  practiceItems: [
    {
      word: "banana",
      images: [images.bananaSVG, images.appleSVG, images.orangeSVG, images.grapeSVG],
      correctIndex: 0
    }
  ],
  liveItems: [
    {
      word: "dog",
      images: [images.catSVG, images.dogSVG, images.fishSVG, images.birdSVG], 
      correctIndex: 1
    }
  ]
}, {
  shuffleTrials: true,
  shuffleImageChoices: true
});

// Method 2: Pass everything in options (backward compatible)
const timeline2 = jsPsychTimelinePictureVocabTimeline.createTimeline(jsPsych, {
  practiceItems: [/* ... */],
  liveItems: [/* ... */],
  shuffleTrials: true,
  shuffleImageChoices: true
});

jsPsych.run(timeline);
```

## Advanced Usage

### Using Individual Timeline Units

```javascript
import { timelineUnits, utils, images } from 'picture-vocab-timeline';

// Create custom timeline with individual units
const customTimeline = [
  timelineUnits.createWelcomeScreen(),
  timelineUnits.createInstructionsScreen(),
  timelineUnits.createPracticeTrial(jsPsych, "apple", [images.appleSVG, images.orangeSVG], 0),
  timelineUnits.createTransitionScreen(),
  timelineUnits.createLiveTrial("dog", [images.dogSVG, images.catSVG], 0),
  timelineUnits.createThankYouScreen()
];
```

### Using Utility Functions

```javascript
import { utils } from 'picture-vocab-timeline';

// Validate SVG content
const isValid = utils.validateSvg("<svg><rect/></svg>"); // true
const isInvalid = utils.validateSvg("not svg"); // false

// Get fallback images for a word
const appleImages = utils.getFallbackImages("apple", 4);

// Validate and resolve images with fallbacks
const resolvedImages = utils.resolveAndValidateImages(
  ["<svg>custom</svg>", "", "invalid"], 
  "banana"
);
```


### Error Handling

The timeline automatically handles various error conditions:

- **Invalid SVG images**: Automatically filtered out with console warnings
- **Empty or missing images**: Replaced with intelligent fallbacks from built-in library
- **Insufficient images**: Additional fallback images added to meet minimum requirements
- **Missing correct indices**: Automatically determined based on word matching

All error conditions are logged to the console for debugging while maintaining functionality.

## Author / Citation

Caroline Griem