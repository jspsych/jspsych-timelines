import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { JsPsych } from "jspsych";
import { DataCollection } from "jspsych/dist/modules/data/DataCollection"; // TODO: fix import?

export function createTimeline(
  jsPsych: JsPsych,
  {
    starting_span = 3,
    digit_duration = 1000,
    gap_duration = 0,
  }: { starting_span: number; digit_duration: number; gap_duration: number }
) {
  let current_span = starting_span;

  let current_sequence = jsPsych.randomization.sampleWithReplacement(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    current_span
  );

  let current_index = 0;

  const display_sequence_timeline = {
    timeline: [
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () =>
          `<p class="digit-span-adaptive-digit">${current_sequence[current_index]}<p>`,
        choices: "NO_KEYS",
        stimulus_duration: digit_duration,
        trial_duration: digit_duration + gap_duration,
      },
    ],
    loop_function: () => {
      current_index++;
      return current_index < current_span;
    },
  };

  const response = {
    type: "TBD",
    data: {
      task: "response",
    },
  };

  const adaptive_loop_timeline = {
    timeline: [display_sequence_timeline, response],
    loop_function: (data: DataCollection) => {
      const correct = data.filter({ task: "response" }).last(1).values()[0].correct;
      if (correct) {
        current_span++;
      } else {
        current_span--;
      }
      current_index = 0;
      current_sequence = pickDigits(jsPsych, current_span);
    },
  };
}

function createDigitSpanSequence(
  jsPsych: JsPsych,
  {
    n,
    digit_duration = 1000,
    gap_duration = 0,
  }: {
    n: number;
    digit_duration: number;
    gap_duration: number;
  }
) {
  const digits = jsPsych.randomization.sampleWithReplacement([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], n);

  const sequence = {
    timeline: [],
  };

  for (const digit of digits) {
    const trial = createDigitSpanDisplay({ digit, digit_duration, gap_duration });
    sequence.timeline.push(trial);
  }

  return sequence;
}

function createDigitSpanDisplay({
  digit,
  digit_duration = 1000,
  gap_duration = 0,
}: {
  digit: number;
  digit_duration: number;
  gap_duration: number;
}) {
  const show_digit = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p class="digit-span-adaptive-digit">${digit}</p>`,
    trial_duration: digit_duration + gap_duration,
    stimulus_duration: digit_duration,
    choices: "NO_KEYS",
  };
  return show_digit;
}

export const timelineUnits = { createDigitSpanDisplay, createDigitSpanSequence };

function pickDigits(jsPsych: JsPsych, n: number) {
  return jsPsych.randomization.sampleWithReplacement([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], n);
}

export const utils = {};
