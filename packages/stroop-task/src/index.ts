import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychInstructions from "@jspsych/plugin-instructions";
import { JsPsych } from "jspsych";

import { defaultText } from "./text";

interface StroopConfig {
  congruent_practice_trials?: number;
  incongruent_practice_trials?: number;
  congruent_main_trials?: number;
  incongruent_main_trials?: number;
  trial_timeout?: number;
  fixation_duration?: { min: number; max: number };
  show_practice_feedback?: boolean;
  include_fixation?: boolean;
  show_instructions?: boolean;
  show_results?: boolean;
  randomize_fixation_duration?: boolean;
  number_of_rows?: number;
  number_of_columns?: number;
  choice_of_colors?: string[];
  text?: typeof defaultText;
}

interface StroopStimulus {
  word: string;
  color: string;
  correct_response: number;
  congruent: boolean;
}

function generateStimuli(
  jsPsych: JsPsych,
  selectedColors: string[],
  congruent_trials: number,
  incongruent_trials: number
): StroopStimulus[] {
  let stimuli: StroopStimulus[] = [];

  const colorObjectsToUse = selectedColors.map((colorName, index) => ({
    name: colorName,
    hex: colorName.toLowerCase(),
    index: index,
  }));

  for (const word of colorObjectsToUse) {
    for (const color of colorObjectsToUse) {
      stimuli.push({
        word: word.name,
        color: color.hex,
        correct_response: color.index,
        congruent: word.name === color.name,
      });
    }
  }

  const congruentStimuli = stimuli.filter((stimulus) => stimulus.congruent);
  const incongruentStimuli = stimuli.filter((stimulus) => !stimulus.congruent);

  // Randomly select the specified number of trials,
  // selecting each stimulus the same number of times if possible

  const completeCongruentSets = Math.floor(congruentStimuli.length / congruent_trials);
  stimuli = stimuli.concat(jsPsych.randomization.repeat(congruentStimuli, completeCongruentSets));
  const completeIncongruentSets = Math.floor(incongruentStimuli.length / incongruent_trials);
  stimuli = stimuli.concat(
    jsPsych.randomization.repeat(incongruentStimuli, completeIncongruentSets)
  );

  if (congruentStimuli.length % congruent_trials !== 0) {
    const remainingCongruent = jsPsych.randomization.sampleWithoutReplacement(
      congruentStimuli,
      congruentStimuli.length % congruent_trials
    );
    stimuli = stimuli.concat(remainingCongruent);
  }

  if (incongruentStimuli.length % incongruent_trials !== 0) {
    const remainingIncongruent = jsPsych.randomization.sampleWithoutReplacement(
      incongruentStimuli,
      incongruentStimuli.length % incongruent_trials
    );
    stimuli = stimuli.concat(remainingIncongruent);
  }

  // Shuffle the final stimuli array
  stimuli = jsPsych.randomization.shuffle(stimuli);

  return stimuli;
}

function createInstructions(instructionsText: any[], choiceOfColors?: string[]) {
  const pages = instructionsText.map((page) => {
    if (typeof page === "function") {
      return page(choiceOfColors);
    }
    return page;
  });

  const instructions = {
    type: jsPsychInstructions,
    pages: pages,
    show_clickable_nav: true,
    allow_keys: true,
    key_forward: "ArrowRight",
    key_backward: "ArrowLeft",
    button_label_previous: "",
    button_label_next: "",
    data: {
      page: "instructions",
    }
  };

  return instructions;
}

function createFixation(fixationDuration: number) {
  const trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: "NO_KEYS",
    trial_duration: fixationDuration,
    data: {
      page: "fixation",
    },
  };

  return trial;
}

interface StroopTrialOptions {
  trial_variables: StroopStimulus[];
  is_practice: boolean;
  trial_timeout?: number;
  number_of_rows?: number;
  number_of_columns?: number;
  choice_of_colors?: string[];
  include_fixation?: boolean;
  randomize_fixation_duration?: boolean;
  fixation_duration?: { min: number; max: number };
  show_practice_feedback?: boolean;
  text?: typeof defaultText;
}

function createStroopTrials(
  jsPsych: JsPsych,
  {
    trial_variables,
    is_practice = false,
    trial_timeout = 2000,
    number_of_rows = 2,
    number_of_columns = 2,
    choice_of_colors = ["RED", "GREEN", "BLUE", "YELLOW"],
    include_fixation = true,
    randomize_fixation_duration = true,
    fixation_duration = { min: 300, max: 1500 },
    show_practice_feedback = true,
    text = defaultText,
  }: StroopTrialOptions
) {
  const trials = {
    timeline: [],
    timeline_variables: trial_variables,
    randomize_order: true,
    data: {
      phase: is_practice ? "practice" : "test",
    },
  };

  let fixationDuration = fixation_duration.min;
  if (randomize_fixation_duration) {
    fixationDuration = jsPsych.randomization.randomInt(
      fixation_duration.min,
      fixation_duration.max
    );
  }

  const fixation = createFixation(fixationDuration);

  const trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const color = jsPsych.timelineVariable("color");
      const word = jsPsych.timelineVariable("word");
      return `<div style="font-size: 48px; color: ${color}; font-weight: bold;">${word}</div>`;
    },
    choices: choice_of_colors,
    button_layout: "grid",
    grid_rows: number_of_rows,
    grid_columns: number_of_columns,
    button_html: (choice) =>
      `<div style="border: 3px solid black; width: 150px; height: 60px; margin: 20px; background-color: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; color: black;">${choice}</div>`,
    margin_horizontal: "20px",
    margin_vertical: "20px",
    trial_duration: trial_timeout || null,
    data: {
      page: "word",
      word: jsPsych.timelineVariable("word"),
      color: jsPsych.timelineVariable("color"),
      correct_response: jsPsych.timelineVariable("correct_response"),
      congruent: jsPsych.timelineVariable("congruent"),
    },
    on_finish: (data: any) => {
      data.correct = data.response === data.correct_response;
    },
  };

  const feedback = createPracticeFeedback(jsPsych, choice_of_colors, text.correct_feedback, text.incorrect_feedback, text.continue_button);

  if (include_fixation) {
    trials.timeline.push(fixation);
  }
  trials.timeline.push(trial);
  if (is_practice && show_practice_feedback) {
    trials.timeline.push(feedback);
  }

  return trials;
}

function createPracticeFeedback(jsPsych: JsPsych, selectedColors: string[], correctText:string, incorrectText:string, continueBtnText:string) {
  const feedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().filter({ page: "word" }).last(1).values()[0];
      const correctColorName = selectedColors[lastTrial.correct_response];

      if (lastTrial.correct) {
        return correctText.replace("%ANSWER%", correctColorName.toUpperCase());
      } else {
        return incorrectText.replace("%ANSWER%", lastTrial.color.toUpperCase());
      }
    },
    choices: [continueBtnText],
    trial_duration: 2000,
    data: {
      page: "feedback"
    }
  };

  return feedback;
}

function createPracticeDebrief(practiceDebriefText:string, continueBtnText:string) {
  const debrief = {
    type: jsPsychHtmlButtonResponse,
    stimulus: practiceDebriefText,
    choices: [continueBtnText],
    post_trial_gap: 500,
    data: {
      page: "practice_debrief",
    },
  };

  return debrief;
}

function createResults(jsPsych: JsPsych, text:string) {
  const results = {
    type: jsPsychHtmlButtonResponse,
    choices: ["Finish"],
    stimulus: () => {
      const trials = jsPsych.data.get().filter({ task: "stroop", page: "word" });

      if (trials.count() === 0) {
        return `<p>No trial data found.</p>`;
      }

      const congruentTrials = trials.filter({ congruent: true });
      const incongruentTrials = trials.filter({ congruent: false });

      const congruentCorrect = congruentTrials.filter({ correct: true });
      const incongruentCorrect = incongruentTrials.filter({ correct: true });

      const congruentAccuracy =
        congruentTrials.count() > 0
          ? Math.round((congruentCorrect.count() / congruentTrials.count()) * 100)
          : 0;

      const incongruentAccuracy =
        incongruentTrials.count() > 0
          ? Math.round((incongruentCorrect.count() / incongruentTrials.count()) * 100)
          : 0;

      const congruentRt =
        congruentCorrect.count() > 0 ? Math.round(congruentCorrect.select("rt").mean()) : 0;

      const incongruentRt =
        incongruentCorrect.count() > 0 ? Math.round(incongruentCorrect.select("rt").mean()) : 0;

      const stroopEffect = incongruentRt - congruentRt;

      const resultsText = text.replace("%congruentAccuracy%", congruentAccuracy.toString())
        .replace("%congruentRt%", congruentRt.toString())
        .replace("%incongruentAccuracy%", incongruentAccuracy.toString())
        .replace("%incongruentRt%", incongruentRt.toString())
        .replace("%stroopEffect%", stroopEffect.toString());

      return resultsText;
    },
    data: {
      page: "results",
    }
  };

  return results;
}

/* Main timeline creation function */
export function createTimeline(
  jsPsych: JsPsych,
  {
    congruent_practice_trials = 2,
    incongruent_practice_trials = 2,
    congruent_main_trials = 4,
    incongruent_main_trials = 4,
    trial_timeout = 2000,
    fixation_duration = { min: 300, max: 1500 },
    show_practice_feedback = true,
    include_fixation = true,
    show_instructions = true,
    show_results = true,
    randomize_fixation_duration = true,
    number_of_rows = 2,
    number_of_columns = 2,
    choice_of_colors = ["RED", "GREEN", "BLUE", "YELLOW"],
    text = defaultText,
  }: StroopConfig = {}
) {
  const timeline: any[] = [];

  if (show_instructions) {
    timeline.push(createInstructions(text.instructions, choice_of_colors));
  }

  if (congruent_practice_trials > 0 || incongruent_practice_trials > 0) {
    const practiceStimuli = generateStimuli(
      jsPsych,
      choice_of_colors,
      congruent_practice_trials,
      incongruent_practice_trials
    );

    const practice_trials = createStroopTrials(jsPsych, {
      trial_variables: practiceStimuli,
      is_practice: true,
      trial_timeout,
      number_of_rows,
      number_of_columns,
      choice_of_colors,
      include_fixation,
      randomize_fixation_duration,
      fixation_duration,
      show_practice_feedback,
    });
    timeline.push(practice_trials);

    // Add practice debrief
    timeline.push(createPracticeDebrief(text.practice_debrief, text.start_button));
  }

  const mainStimuli = generateStimuli(
    jsPsych,
    choice_of_colors,
    congruent_main_trials,
    incongruent_main_trials
  );

  const main_trials = createStroopTrials(jsPsych, {
    trial_variables: mainStimuli,
    is_practice: false,
    trial_timeout,
    number_of_rows,
    number_of_columns,
    choice_of_colors,
    include_fixation,
    randomize_fixation_duration,
    fixation_duration,
  });

  // Add results if requested
  if (show_results) {
    timeline.push(createResults(jsPsych, text.results));
  }

  const stroop = {
    timeline: timeline,
    data: {
      task: "stroop",
    }
  }

  return stroop
}

/* Export individual components for custom timeline building */
export const timelineComponents = {
  createInstructions,
  createFixation,
  createStroopTrials,
  createPracticeFeedback,
  createPracticeDebrief,
  createResults,
};

/* Export utility functions */
export const utils = {
  generateStimuli,
};

/* Export types */
export type { StroopConfig, StroopStimulus, StroopTrialOptions };
