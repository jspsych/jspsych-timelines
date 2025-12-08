/**
 * Interface for the stimulus information object that describes the name and source of the stimulus for both target sides.
 */
export interface StimulusInfo {
  /**
   * The stimulus information object for the same target side.
   * @defaultValue { stimulus_name: "heart", stimulus_src: heartIconSvg, target_side: "same" }
   */
  same: SameStimulusInfo & { target_side: "same" };
  /**
   * The stimulus information object for the opposite target side.
   * @defaultValue { stimulus_name: "flower", stimulus_src: flowerIconSvg, target_side: "opposite" }
   */
  opposite: SameStimulusInfo & { target_side: "opposite" };
}

/** Interface for the stimulus name and source information. */
export interface SameStimulusInfo {
  stimulus_name: string;
  stimulus_src: string;
}

/** Interface for the `stimulus_options` property in {@link CreateTimelineOptions}. */
export interface StimulusOptions {
  /**
   * The name of the stimulus to be displayed when the target side is the same side.
   * @defaultValue "heart"
   */
  same_side_stimulus_name: string;

  /**
   * The source of the stimulus to be displayed when the target side is the same side.
   * @defaultValue heartIconSvg
   */
  same_side_stimulus_src: string;

  /**
   * The name of the stimulus to be displayed when the target side is the opposite side.
   * @defaultValue "flower"
   */
  opposite_side_stimulus_name: string;

  /**
   * The source of the stimulus to be displayed when the target side is the opposite side.
   * @defaultValue flowerIconSvg
   */
  opposite_side_stimulus_src: string;
}

/** Interface for the various display strings within the timeline. */
export interface TextOptions {
    // -- START INSTRUCTIONS --
    /**
     * The instruction text at the beginning of the experiment.
     * @defaultValue "Time to play!"
     */
    start_instructions_text: string;
    /**
     * The button text to proceed from the start instructions.
     * @defaultValue "Start"
     */
    start_instructions_button_text: string;
    // -- DEMO INSTRUCTIONS --
    /**
     * The instruction text for the demo section.
     * @defaultValue (stimulus_name: string, side: string) => `When you see a ${stimulus_name}, press the button on the ${side} side.`
     */
    format_instructions: (stimulus_name: string, side: string) => string;
    /**
     * The announcement text for the start of each gametype section.
     * @returns (name: string) => `This is the ${name} game. Here's how you play it.`
     */
    format_gametype_announcement: (name: string) => string;
    /**
     * The button text to proceed from the gametype announcement.
     * @defaultValue "OK"
     */
    gametype_announcement_button_text: string;
    // -- FIXATION -- 
    /**
     * The fixation cross text. This will automatically be wrapped in a `<div>` with the class `jspsych-hearts-and-flowers-fixation`.
     * @defaultValue "+"
     */
    fixation_text: string;
    // -- FEEDBACK --
    /**
     * The feedback text after each trial.
     * @defaultValue (correct: boolean) => correct ? "Great job!" : "Try again."
     */
    format_feedback: (correct: boolean) => string;
    // -- END INSTRUCTIONS --
    /**
     * The instruction text at the end of the experiment.
     * @defaultValue "Great job! You're all done."
     */
    end_instructions_text: string;
}

/** Interface for the `options` parameter in {@link createTimeline}. */
export interface CreateTimelineOptions {
    /**
     * The number of trials to include in the experiment.
     * @defaultValue 20
     */
    n_trials: number;

    /**
     * The weights for how often the stimulus appears on each side [left, right].
     * @defaultValue [1, 1]
     */
    side_weights: [left_weight: number, right_weight: number];

    /**
     * The weights for how often each type of stimulus appears, defined by their target side [same, opposite].
     * @defaultValue [1, 1]
     */
    target_side_weights: [same_weight: number, opposite_weight: number];

    /**
     * The function that returns a random fixation duration from a list of possible durations.
     * @defaultValue () => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0]
     * @returns {number} A function that returns a random fixation duration from a list of possible durations.
     */
    fixation_duration_function: () => number;

    /**
     * The options object that includes the name and source of each stimulus type.
     * @defaultValue { same_side_stimulus_name: "heart", same_side_stimulus_src: heartIconSvg, opposite_side_stimulus_name: "flower", opposite_side_stimulus_src: flowerIconSvg }
     */
    stimulus_options: Partial<StimulusOptions>;

    /**
     * The text object that contains all display strings within the timeline.
     * @defaultValue See {@link TextOptions}
     */
    text_options: Partial<TextOptions>;

    /**
     * Whether to include a demo section or not.
     * @defaultValue true
     */
    demo: boolean;

    /**
     * Whether to show the end instruction screen.
     * @defaultValue true
     */
    end_instruction: boolean;

    /**
     * The duration of time to show the end instruction screen, in milliseconds.
     * @defaultValue 4000
     */
    end_instruction_duration?: number;
}

/**
 * Interface for the options parameter in {@link createTrialsSubTimeline}.
 */
export interface CreateTrialsSubTimelineOptions {
    /**
     * The side of the target stimulus [same\|opposite\|both].
     * @defaultValue "both"
     */
    target_side: "same" | "opposite" | "both";

    /**
     * The number of trials to include in the experiment.
     * @defaultValue 20
     */
    n_trials: number;

    /**
     * The weights for how often each type of stimulus appears, defined by their target side [same, opposite].
     * @defaultValue [1, 1]
     */
    target_side_weights: [same_weight: number, opposite_weight: number];

    /**
     * The weights for how often the stimulus appears on each side [left, right].
     * @defaultValue [1, 1]
     */
    side_weights: [left_weight: number, right_weight: number];

    /**
     * The function that returns a random fixation duration.
     * @defaultValue () => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0]
     * @returns {number} A function that returns a random fixation duration.
     */
    fixation_duration_function: () => number;

    /**
     * The stimulus information object that describes the name and source of the stimulus.
     * @defaultValue { same_side_stimulus_name: "heart", same_side_stimulus_src: heartIconSvg, opposite_side_stimulus_name: "flower", opposite_side_stimulus_src: flowerIconSvg }
     */
    stimulus_info: StimulusInfo;

    /**
     * The text object that contains all display strings within the timeline.
     * @defaultValue See {@link TextOptions}
     */
    text_options: TextOptions;
}
