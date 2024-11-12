import { ParameterType } from 'jspsych';

// ../../node_modules/@jspsych/plugin-html-keyboard-response/dist/index.js
var _package = {
  name: "@jspsych/plugin-html-keyboard-response",
  version: "2.0.0",
  description: "jsPsych plugin for displaying a stimulus and getting a keyboard response",
  type: "module",
  main: "dist/index.cjs",
  exports: {
    import: "./dist/index.js",
    require: "./dist/index.cjs"
  },
  typings: "dist/index.d.ts",
  unpkg: "dist/index.browser.min.js",
  files: [
    "src",
    "dist"
  ],
  source: "src/index.ts",
  scripts: {
    test: "jest",
    "test:watch": "npm test -- --watch",
    tsc: "tsc",
    build: "rollup --config",
    "build:watch": "npm run build -- --watch"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/jspsych/jsPsych.git",
    directory: "packages/plugin-html-keyboard-response"
  },
  author: "Josh de Leeuw",
  license: "MIT",
  bugs: {
    url: "https://github.com/jspsych/jsPsych/issues"
  },
  homepage: "https://www.jspsych.org/latest/plugins/html-keyboard-response",
  peerDependencies: {
    jspsych: ">=7.1.0"
  },
  devDependencies: {
    "@jspsych/config": "^3.0.0",
    "@jspsych/test-utils": "^1.2.0"
  }
};
var info = {
  name: "html-keyboard-response",
  version: _package.version,
  parameters: {
    stimulus: {
      type: ParameterType.HTML_STRING,
      default: void 0
    },
    choices: {
      type: ParameterType.KEYS,
      default: "ALL_KEYS"
    },
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null
    },
    stimulus_duration: {
      type: ParameterType.INT,
      default: null
    },
    trial_duration: {
      type: ParameterType.INT,
      default: null
    },
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true
    }
  },
  data: {
    response: {
      type: ParameterType.STRING
    },
    rt: {
      type: ParameterType.INT
    },
    stimulus: {
      type: ParameterType.STRING
    }
  }
};
var HtmlKeyboardResponsePlugin = class {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  trial(display_element, trial) {
    var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' + trial.stimulus + "</div>";
    if (trial.prompt !== null) {
      new_html += trial.prompt;
    }
    display_element.innerHTML = new_html;
    var response = {
      rt: null,
      key: null
    };
    const end_trial = () => {
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key
      };
      this.jsPsych.finishTrial(trial_data);
    };
    var after_response = (info2) => {
      display_element.querySelector("#jspsych-html-keyboard-response-stimulus").className += " responded";
      if (response.key == null) {
        response = info2;
      }
      if (trial.response_ends_trial) {
        end_trial();
      }
    };
    if (trial.choices != "NO_KEYS") {
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false
      });
    }
    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector(
          "#jspsych-html-keyboard-response-stimulus"
        ).style.visibility = "hidden";
      }, trial.stimulus_duration);
    }
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }
  }
  simulate(trial, simulation_mode, simulation_options, load_callback) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }
  create_simulation_data(trial, simulation_options) {
    const default_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      response: this.jsPsych.pluginAPI.getValidKey(trial.choices)
    };
    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
    return data;
  }
  simulate_data_only(trial, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);
    this.jsPsych.finishTrial(data);
  }
  simulate_visual(trial, simulation_options, load_callback) {
    const data = this.create_simulation_data(trial, simulation_options);
    const display_element = this.jsPsych.getDisplayElement();
    this.trial(display_element, trial);
    load_callback();
    if (data.rt !== null) {
      this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
    }
  }
};
HtmlKeyboardResponsePlugin.info = info;

// src/index.ts
function createTimeline(jsPsych, stimuli, keyboard_response = "space", trial_duration = 1e3, post_trial_gap = 500, fixation_duration = 500, n = 2, num_trials = 20, rep_ratio = 0.2, debrief = false, return_accuracy = false, data_output = "none") {
  const trial_sequence = [];
  for (var i = 0; i < num_trials; i++) {
    if (i >= n && Math.random() < rep_ratio) {
      trial_sequence.push(trial_sequence[i - n]);
    } else {
      const possible_stimuli = stimuli.filter(function(s) {
        return i < n || s !== trial_sequence[i - n];
      });
      const random_stimulus = jsPsych.randomization.sampleWithoutReplacement(possible_stimuli, 1)[0];
      trial_sequence.push(random_stimulus);
    }
  }
  const timeline = [];
  for (var i = 0; i < trial_sequence.length; i++) {
    timeline.push({
      type: HtmlKeyboardResponsePlugin,
      stimulus: `<p style="font-size: 48px; color: gray;">+</p>`,
      choices: "NO_KEYS",
      trial_duration: fixation_duration
    });
    timeline.push({
      type: HtmlKeyboardResponsePlugin,
      stimulus: `<p style="font-size: 48px;">${trial_sequence[i]}</p>`,
      choices: [keyboard_response],
      trial_duration,
      post_trial_gap,
      data: { correct: i >= 2 && trial_sequence[i] === trial_sequence[i - n] },
      on_finish: function(data) {
        data.correct_response = data.correct && data.response === keyboard_response;
        data.correct_no_response = !data.correct && data.response === null;
      }
    });
  }
  if (debrief) {
    if (return_accuracy) {
      timeline.push(
        {
          type: HtmlKeyboardResponsePlugin,
          stimulus: function() {
            var correct_responses = jsPsych.data.get().filter({ correct_response: true }).count();
            var correct_no_responses = jsPsych.data.get().filter({ correct_no_response: true }).count();
            var total_trials = jsPsych.data.get().count();
            var accuracy = Math.round((correct_responses + correct_no_responses) / total_trials * 100);
            return `<p>Thank you for participating!</p>
            <p>You correctly responded to <strong>${correct_responses}</strong> matching trials.</p>
            <p>You correctly not responded to <strong>${correct_no_responses}</strong> non-matching trials.</p>
            <p>Your accuracy was <strong>${accuracy}%</strong>.</p>
            <p>Press any key to finish the experiment.</p>`;
          },
          choices: "NO_KEYS",
          on_start: function() {
            if (data_output == "csv") {
              jsPsych.data.get().localSave("csv", `n_back.csv`);
            } else if (data_output == "json") {
              jsPsych.data.get().localSave("json", `n_back.json`);
            }
          },
          simulation_options: {
            simulate: false
          }
        }
      );
    } else {
      timeline.push(
        {
          type: HtmlKeyboardResponsePlugin,
          stimulus: function() {
            return `<p>Thank you for participating!</p>
            <p>Press any key to finish the experiment.</p>`;
          },
          choices: "NO_KEYS",
          on_start: function() {
            if (data_output == "csv") {
              jsPsych.data.get().localSave("csv", `n_back.csv`);
            } else if (data_output == "json") {
              jsPsych.data.get().localSave("json", `n_back.json`);
            }
          },
          simulation_options: {
            simulate: false
          }
        }
      );
    }
  }
  return timeline;
}

export { createTimeline };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map