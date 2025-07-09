# picture-vocab-timeline

## Overview

A jsPsych timeline for picture vocabulary assessment tasks. This package creates a structured vocabulary test where participants hear words and select matching pictures from multiple choice options. The timeline includes practice trials with feedback and live assessment trials.

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
| text_to_speech_enabled | boolean | false | Enable text-to-speech for all screens and word prompts |

**Features:**
- Practice trials with feedback and retry mechanism (up to 3 attempts)
- **Text-to-speech support** for all screens, instructions, and word prompts
- **SVG validation and error handling** with automatic fallback to built-in images
- **Enhanced image resolution** with intelligent word-to-image matching
- **Robust error handling** with console warnings for invalid images
- Responsive image button layout with hover effects
- Comprehensive data collection for analysis

### timelineUnits

Individual timeline unit creators for building custom timelines:

- `createWelcomeScreen(enableTTS?)` - Creates welcome screen with begin button
- `createInstructionsScreen(enableTTS?)` - Creates instructions screen with next button  
- `createTransitionScreen(enableTTS?)` - Creates transition screen between practice and live trials
- `createThankYouScreen(enableTTS?)` - Creates completion screen with finish button
- `createPracticeTrial(jsPsych, word, images, correctIndex, enableTTS?)` - Creates practice trial with feedback
- `createLiveTrial(word, images, correctIndex, enableTTS?)` - Creates live trial without feedback

### utils

Utility functions for image validation and processing:

- `validateSvg(svgString)` - Validates SVG format and structure
- `resolveAndValidateImages(images, word)` - Validates provided images and adds fallbacks if needed  
- `getFallbackImages(word, count)` - Gets fallback images from built-in library, optionally matching word
- `speakText(text, delay?)` - Speaks text using browser's speech synthesis API (returns Promise)

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
  shuffleImageChoices: true,
  text_to_speech_enabled: true
});

// Method 2: Pass everything in options (backward compatible)
const timeline2 = jsPsychTimelinePictureVocabTimeline.createTimeline(jsPsych, {
  practiceItems: [/* ... */],
  liveItems: [/* ... */],
  shuffleTrials: true,
  shuffleImageChoices: true,
  text_to_speech_enabled: true
});

jsPsych.run(timeline);
```

## Advanced Usage

### Using Individual Timeline Units

```javascript
import { timelineUnits, utils, images } from 'picture-vocab-timeline';

// Create custom timeline with individual units and TTS enabled
const customTimeline = [
  timelineUnits.createWelcomeScreen(true),
  timelineUnits.createInstructionsScreen(true),
  timelineUnits.createPracticeTrial(jsPsych, "apple", [images.appleSVG, images.orangeSVG], 0, true),
  timelineUnits.createTransitionScreen(true),
  timelineUnits.createLiveTrial("dog", [images.dogSVG, images.catSVG], 0, true),
  timelineUnits.createThankYouScreen(true)
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

// Use text-to-speech directly (async)
await utils.speakText("Select the picture that matches the word you heard");

// With delay
await utils.speakText("First instruction", 1000); // 1 second delay
```

### Text-to-Speech Features

When `text_to_speech_enabled` is set to `true`, the timeline automatically provides:

- **Welcome screen**: Speaks the welcome message
- **Instructions**: Reads all instruction text aloud
- **Practice trials**: Speaks the practice instruction and word, plus feedback
- **Transition screen**: Reads transition instructions
- **Live trials**: Speaks the instruction and target word
- **Thank you screen**: Speaks the completion message

The text-to-speech uses the browser's built-in Speech Synthesis API with enhanced reliability:
- **Optimized settings**: Rate 0.8, Volume 0.8 for clarity
- **Sequential speech**: Async/await pattern prevents overlapping utterances
- **Browser compatibility**: Handles voice loading across different browsers
- **Smart timing**: 500ms delay for page loading, 1000ms between instruction and word
- **Error handling**: Graceful fallbacks with timeout protection
- **Text cleaning**: Automatic HTML tag removal and whitespace normalization
- **Voice selection**: Prefers English voices when available
- **Comprehensive logging**: Console messages for debugging TTS issues

```javascript
// Enable TTS for the entire timeline
const timeline = createTimeline(jsPsych, config, {
  text_to_speech_enabled: true
});

// Or use individual TTS-enabled timeline units
const welcomeWithTTS = timelineUnits.createWelcomeScreen(true);
```

### Troubleshooting Text-to-Speech

If TTS is inconsistent, check the browser console for detailed logging:

**Common Issues and Solutions:**
- **No speech on some pages**: Check console for "Picture Vocab Timeline: Speaking text:" messages
- **Speech cuts off**: Browser may have paused synthesis; the system automatically resumes
- **No voices available**: System waits for voice loading with fallback timeout
- **Overlapping speech**: Sequential async pattern prevents this, but manual `speakText` calls should use `await`

**Browser Support:**
- Chrome/Edge: Full support with voice selection
- Firefox: Full support, may need user interaction first
- Safari: Full support on macOS/iOS
- Mobile browsers: May require user gesture to enable TTS

**Debugging:**
```javascript
// Import the timeline
import { utils } from 'picture-vocab-timeline';

// Run comprehensive TTS diagnostics
utils.diagnoseTTS();

// Check if TTS is available
console.log('TTS supported:', 'speechSynthesis' in window);
console.log('Available voices:', speechSynthesis.getVoices());

// Test TTS directly
await utils.speakText('Testing text to speech');

// Check parameter passing (should see console logs)
const timeline = createTimeline(jsPsych, config, { 
  text_to_speech_enabled: true 
});
```

**Console Messages to Look For:**
- `"Picture Vocab Timeline: TTS enabled = true"` - Confirms parameter is passed correctly
- `"Picture Vocab Timeline: Creating welcome screen with TTS = true"` - Confirms screen creation
- `"Picture Vocab Timeline: Welcome screen on_load called, TTS enabled"` - Confirms on_load fires
- `"Picture Vocab Timeline: Speaking text: [text]"` - Confirms TTS function is called

### Error Handling

The timeline automatically handles various error conditions:

- **Invalid SVG images**: Automatically filtered out with console warnings
- **Empty or missing images**: Replaced with intelligent fallbacks from built-in library
- **Insufficient images**: Additional fallback images added to meet minimum requirements
- **Missing correct indices**: Automatically determined based on word matching

All error conditions are logged to the console for debugging while maintaining functionality.

## Author / Citation

Caroline Griem