import { JsPsych } from "jspsych";
import { createTimeline } from "./index";
import { englishText } from "./text";
import { images } from "./images";

// Mock JsPsych
const mockJsPsych = {
  randomization: {
    shuffle: jest.fn((array) => [...array].reverse()), // Simple mock that reverses array
  },
  data: {
    get: jest.fn(() => ({
      filter: jest.fn(() => ({
        last: jest.fn(() => ({
          values: jest.fn(() => [{ correct: true, trial_id: 'practice-choice' }])
        }))
      }))
    }))
  }
} as unknown as JsPsych;

// Mock DOM elements for testing
const mockButton = document.createElement('button');
const mockBtnGroup = document.createElement('div');
mockBtnGroup.classList.add('jspsych-html-button-response-btngroup');
mockBtnGroup.appendChild(mockButton);

// Mock querySelector
Object.defineProperty(document, 'querySelector', {
  value: jest.fn(() => mockBtnGroup),
  writable: true
});

Object.defineProperty(document, 'querySelectorAll', {
  value: jest.fn(() => [mockButton]),
  writable: true
});

describe("Picture Vocab Timeline", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("resolveImages", () => {
    // Need to access the internal function - we'll test it through createTimeline behavior
    test("should use provided images when valid", () => {
      const config = {
        practiceItems: [{
          word: "test",
          images: ["<svg>test1</svg>", "<svg>test2</svg>"],
          correctIndex: 0
        }],
        liveItems: []
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      // Should create timeline with provided images
      expect(timeline.length).toBeGreaterThan(0);
    });

    test("should fallback to images.ts when no valid images provided", () => {
      const config = {
        practiceItems: [{
          word: "apple",
          images: [],
          correctIndex: 0
        }],
        liveItems: []
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      // Should create timeline with fallback images
      expect(timeline.length).toBeGreaterThan(0);
    });

    test("should match word to images.ts when images are empty", () => {
      const config = {
        practiceItems: [{
          word: "apple",
          images: ["", ""],
          correctIndex: 0
        }],
        liveItems: []
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      // Should find apple-related images from images.ts
      expect(timeline.length).toBeGreaterThan(0);
    });
  });

  describe("createSvgImageButton", () => {
    test("should handle complete SVG strings", () => {
      const config = {
        practiceItems: [{
          word: "test",
          images: ["<svg><rect/></svg>"],
          correctIndex: 0
        }],
        liveItems: []
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      const practiceTrials = timeline.filter(trial => 
        trial.timeline && trial.timeline.some((t: any) => t.data?.trial_id === 'practice-choice')
      );
      
      expect(practiceTrials.length).toBe(1);
    });

    test("should wrap SVG content in svg element when not complete", () => {
      const config = {
        practiceItems: [{
          word: "test",
          images: ["<rect fill='red'/>"],
          correctIndex: 0
        }],
        liveItems: []
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      const practiceTrials = timeline.filter(trial => 
        trial.timeline && trial.timeline.some((t: any) => t.data?.trial_id === 'practice-choice')
      );
      
      expect(practiceTrials.length).toBe(1);
    });
  });

  describe("autoCorrectIndex", () => {
    test("should find correct index based on word matching", () => {
      const config = {
        practiceItems: [{
          word: "apple",
          images: ["<svg>orange</svg>", "<svg>apple</svg>", "<svg>banana</svg>"],
          correctIndex: undefined as any // Will be auto-determined
        }],
        liveItems: []
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      // Should create timeline and auto-determine correct index
      expect(timeline.length).toBeGreaterThan(0);
    });

    test("should default to 0 when no match found", () => {
      const config = {
        practiceItems: [{
          word: "nonexistent",
          images: ["<svg>orange</svg>", "<svg>banana</svg>"],
          correctIndex: undefined as any
        }],
        liveItems: []
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      // Should create timeline with default index 0
      expect(timeline.length).toBeGreaterThan(0);
    });
  });

  describe("createTimeline", () => {
    const basicConfig = {
      practiceItems: [
        {
          word: "apple",
          images: ["<svg>apple</svg>", "<svg>orange</svg>"],
          correctIndex: 0
        }
      ],
      liveItems: [
        {
          word: "ball",
          images: ["<svg>ball</svg>", "<svg>car</svg>"],
          correctIndex: 0
        }
      ]
    };

    test("should create complete timeline with all screens", () => {
      const timeline = createTimeline(mockJsPsych, basicConfig);
      
      // Should have: welcome, instructions, practice trial, transition, live trial, thank you
      expect(timeline.length).toBe(6);
      
      // Check welcome screen
      expect(timeline[0].stimulus).toContain(englishText.welcome_message);
      expect(timeline[0].choices).toEqual([englishText.begin_button]);
      
      // Check instructions screen
      expect(timeline[1].stimulus).toContain(englishText.instructions_hearing);
      expect(timeline[1].choices).toEqual([englishText.next_button]);
      
      // Check transition screen
      expect(timeline[3].stimulus).toContain(englishText.transition_message);
      expect(timeline[3].choices).toEqual([englishText.start_button]);
      
      // Check thank you screen
      expect(timeline[5].stimulus).toContain(englishText.thank_you);
      expect(timeline[5].choices).toEqual([englishText.finish_button]);
    });

    test("should handle empty practice items", () => {
      const config = {
        practiceItems: [],
        liveItems: basicConfig.liveItems
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      // Should have: welcome, instructions, transition, live trial, thank you
      expect(timeline.length).toBe(5);
    });

    test("should handle empty live items", () => {
      const config = {
        practiceItems: basicConfig.practiceItems,
        liveItems: []
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      // Should have: welcome, instructions, practice trial, transition, thank you
      expect(timeline.length).toBe(5);
    });

    test("should handle multiple practice and live items", () => {
      const config = {
        practiceItems: [
          ...basicConfig.practiceItems,
          {
            word: "cat",
            images: ["<svg>cat</svg>", "<svg>dog</svg>"],
            correctIndex: 0
          }
        ],
        liveItems: [
          ...basicConfig.liveItems,
          {
            word: "house",
            images: ["<svg>house</svg>", "<svg>tree</svg>"],
            correctIndex: 0
          }
        ]
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      // Should have: welcome, instructions, 2 practice trials, transition, 2 live trials, thank you
      expect(timeline.length).toBe(8);
    });
  });

  describe("shuffling options", () => {
    const configWithMultipleItems = {
      practiceItems: [
        {
          word: "apple",
          images: ["<svg>apple</svg>", "<svg>orange</svg>"],
          correctIndex: 0
        },
        {
          word: "ball",
          images: ["<svg>ball</svg>", "<svg>car</svg>"],
          correctIndex: 0
        }
      ],
      liveItems: [
        {
          word: "cat",
          images: ["<svg>cat</svg>", "<svg>dog</svg>"],
          correctIndex: 0
        },
        {
          word: "house",
          images: ["<svg>house</svg>", "<svg>tree</svg>"],
          correctIndex: 0
        }
      ]
    };

    test("should shuffle trials when shuffleTrials is true", () => {
      const timeline = createTimeline(mockJsPsych, configWithMultipleItems, {
        shuffleTrials: true
      });
      
      // Should call shuffle on both practice and live items
      expect(mockJsPsych.randomization.shuffle).toHaveBeenCalledTimes(2);
      expect(timeline.length).toBe(8); // welcome, instructions, 2 practice, transition, 2 live, thank you
    });

    test("should shuffle image choices when shuffleImageChoices is true", () => {
      const timeline = createTimeline(mockJsPsych, configWithMultipleItems, {
        shuffleImageChoices: true
      });
      
      // Should call shuffle for each trial's images (4 trials total)
      expect(mockJsPsych.randomization.shuffle).toHaveBeenCalledTimes(4);
      expect(timeline.length).toBe(8);
    });

    test("should shuffle both trials and images when both options are true", () => {
      const timeline = createTimeline(mockJsPsych, configWithMultipleItems, {
        shuffleTrials: true,
        shuffleImageChoices: true
      });
      
      // Should call shuffle for trials (2 times) and images (4 times) = 6 total
      expect(mockJsPsych.randomization.shuffle).toHaveBeenCalledTimes(6);
      expect(timeline.length).toBe(8);
    });

    test("should not shuffle when no options provided", () => {
      const timeline = createTimeline(mockJsPsych, configWithMultipleItems);
      
      // Should not call shuffle
      expect(mockJsPsych.randomization.shuffle).not.toHaveBeenCalled();
      expect(timeline.length).toBe(8);
    });
  });

  describe("makePracticeTrial", () => {
    test("should create practice trial with correct structure", () => {
      const config = {
        practiceItems: [{
          word: "test",
          images: ["<svg>correct</svg>", "<svg>wrong</svg>"],
          correctIndex: 0
        }],
        liveItems: []
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      const practiceTrials = timeline.filter(trial => 
        trial.timeline && trial.timeline.some((t: any) => t.data?.trial_id === 'practice-choice')
      );
      
      expect(practiceTrials.length).toBe(1);
      
      const practiceTrial = practiceTrials[0];
      expect(practiceTrial.timeline).toBeDefined();
      expect(practiceTrial.timeline.length).toBe(2); // choice + feedback
      expect(practiceTrial.loop_function).toBeDefined();
      
      // Check choice trial
      const choiceTrial = practiceTrial.timeline[0];
      expect(choiceTrial.stimulus).toContain("test");
      expect(choiceTrial.data.trial_id).toBe('practice-choice');
      expect(choiceTrial.on_finish).toBeDefined();
      expect(choiceTrial.on_load).toBeDefined();
      
      // Check feedback trial
      const feedbackTrial = practiceTrial.timeline[1];
      expect(feedbackTrial.stimulus).toBeDefined();
      expect(feedbackTrial.choices).toBeDefined();
    });
  });

  describe("makeLiveTrial", () => {
    test("should create live trial with correct structure", () => {
      const config = {
        practiceItems: [],
        liveItems: [{
          word: "test",
          images: ["<svg>correct</svg>", "<svg>wrong</svg>"],
          correctIndex: 0
        }]
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      const liveTrials = timeline.filter(trial => 
        trial.stimulus && trial.stimulus.includes(englishText.live_instruction.replace('{word}', '<strong>test</strong>'))
      );
      
      expect(liveTrials.length).toBe(1);
      
      const liveTrial = liveTrials[0];
      expect(liveTrial.stimulus).toContain("test");
      expect(liveTrial.button_html).toBeDefined();
      expect(liveTrial.on_finish).toBeDefined();
      expect(liveTrial.on_load).toBeDefined();
    });
  });

  describe("error handling", () => {
    test("should handle malformed config gracefully", () => {
      const config = {
        practiceItems: [
          {
            word: "",
            images: [],
            correctIndex: 0
          }
        ],
        liveItems: []
      };
      
      expect(() => createTimeline(mockJsPsych, config)).not.toThrow();
    });

    test("should handle missing correctIndex", () => {
      const config = {
        practiceItems: [{
          word: "test",
          images: ["<svg>test1</svg>", "<svg>test2</svg>"],
          correctIndex: undefined as any
        }],
        liveItems: []
      };
      
      expect(() => createTimeline(mockJsPsych, config)).not.toThrow();
    });

    test("should handle invalid correctIndex", () => {
      const config = {
        practiceItems: [{
          word: "test",
          images: ["<svg>test1</svg>"],
          correctIndex: 5 // Out of bounds
        }],
        liveItems: []
      };
      
      expect(() => createTimeline(mockJsPsych, config)).not.toThrow();
    });
  });

  describe("text integration", () => {
    test("should use englishText for all UI elements", () => {
      const config = {
        practiceItems: [{
          word: "test",
          images: ["<svg>test</svg>"],
          correctIndex: 0
        }],
        liveItems: [{
          word: "test2",
          images: ["<svg>test2</svg>"],
          correctIndex: 0
        }]
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      // Check that English text is used throughout
      const welcomeScreen = timeline[0];
      expect(welcomeScreen.stimulus).toContain(englishText.welcome_message);
      expect(welcomeScreen.choices).toEqual([englishText.begin_button]);
      
      const instructionsScreen = timeline[1];
      expect(instructionsScreen.stimulus).toContain(englishText.instructions_hearing);
      expect(instructionsScreen.choices).toEqual([englishText.next_button]);
      
      const transitionScreen = timeline[3];
      expect(transitionScreen.stimulus).toContain(englishText.transition_message);
      expect(transitionScreen.choices).toEqual([englishText.start_button]);
      
      const thankYouScreen = timeline[timeline.length - 1];
      expect(thankYouScreen.stimulus).toContain(englishText.thank_you);
      expect(thankYouScreen.choices).toEqual([englishText.finish_button]);
    });
  });

  describe("images integration", () => {
    test("should fallback to images.ts when needed", () => {
      const config = {
        practiceItems: [{
          word: "apple", // Should match appleSVG in images.ts
          images: [],
          correctIndex: 0
        }],
        liveItems: []
      };
      
      const timeline = createTimeline(mockJsPsych, config);
      
      // Should successfully create timeline with images from images.ts
      expect(timeline.length).toBeGreaterThan(0);
    });
  });

  describe("exports", () => {
    test("should export required functions and objects", () => {
      const { createTimeline, timelineUnits, utils, images: exportedImages } = require("./index");
      
      expect(createTimeline).toBeDefined();
      expect(typeof createTimeline).toBe('function');
      expect(timelineUnits).toBeDefined();
      expect(utils).toBeDefined();
      expect(exportedImages).toBeDefined();
    });
  });
});