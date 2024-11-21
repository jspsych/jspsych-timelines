import { JsPsych } from "jspsych";
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'

export function createTimeline(jsPsych: JsPsych,
  stimuli: any,
  keyboard_response: string = "n",          // Default key for response
  trial_duration: number = 1000,                // Default trial duration in ms
  post_trial_gap: number = 500,                 // Default gap between trials in ms
  fixation_duration: number = 500,              // Default fixation duration in ms
  n: number = 2,                                // Default value for N-back level
  num_trials: number = 20,                      // Default number of trials
  rep_ratio: number = 0.2, 
  debrief: boolean = false, 
  return_accuracy: boolean = false, 
  data_output: "none" | "json" | "csv" = "none") {

  const trial_sequence: any[] = [];

  for (var i = 0; i < num_trials; i++) {
    if (i >= n && Math.random() < rep_ratio) {
        trial_sequence.push(trial_sequence[i - n]);
    } else {
        const possible_stimuli = stimuli.filter(function (s: any) {
          return (i < n || s !== trial_sequence[i - n]);
        });
        const random_stimulus = jsPsych.randomization.sampleWithoutReplacement(possible_stimuli, 1)[0];
        trial_sequence.push(random_stimulus)
      }
    }

  const timeline: any[] = [];

  for (var i = 0; i < trial_sequence.length; i++) {

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<p style="font-size: 48px; color: gray;">+</p>`,
      choices: "NO_KEYS",
      trial_duration: fixation_duration
    });

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<p style="font-size: 48px;">${trial_sequence[i]}</p>`,
      choices: [keyboard_response],
      trial_duration: trial_duration,
      post_trial_gap: post_trial_gap,
      data: { correct: i >= n && trial_sequence[i].toLowerCase() === trial_sequence[i - n].toLowerCase() },
      on_finish: function (data: any) {
        data.correct_response = data.correct && data.response != null;
        data.correct_no_response = !data.correct && data.response === null;
      }
    })
  }


  if (debrief){
  if (return_accuracy){
    timeline.push(
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function(){
          var correct_responses = jsPsych.data.get().filter({correct_response: true}).count();
          var correct_no_responses = jsPsych.data.get().filter({correct_no_response: true}).count();
          var total_trials = jsPsych.data.get().count();
          var accuracy = Math.round(((correct_responses + correct_no_responses) / total_trials) * 100);
          const return_prompt = (correct_response: number, correct_no_response: number, accuracy: number): string => {
            return `<p>Thank you for participating!</p>
                    <p>You correctly responded to <strong>${correct_response}</strong> matching trials.</p>
                    <p>You correctly did not respond to <strong>${correct_no_response}</strong> non-matching trials.</p>
                    <p>Your accuracy was <strong>${accuracy}%</strong>.</p>
                    <p>Press any key to finish the experiment.</p>`;
          };
          return return_prompt(correct_responses, correct_no_responses, accuracy)
        },
        choices: "ALL_KEYS",
        on_start: function () {
          if (data_output == "csv"){
          jsPsych.data.get().localSave('csv', `n_back.csv`);} else if (data_output == "json") {
            jsPsych.data.get().localSave('json', `n_back.json`);
          } else {return null}
        },
        simulation_options: {
          simulate: false
        }
      })
  } else {
    timeline.push(
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function(){
          return `<p>Thank you for participating!</p>
            <p>Press any key to finish the experiment.</p>`;
        },
        choices: "ALL_KEYS",
        on_start: function () {
          if (data_output == "csv"){
            return jsPsych.data.get().localSave('csv', `n_back.csv`);} else if (data_output == "json") {
              return jsPsych.data.get().localSave('json', `n_back.json`)
            } else {return null}
        },
        simulation_options: {
          simulate: false
        }
      })
  }}

  return timeline
}