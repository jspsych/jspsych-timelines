/**
 * The effort screen as a small jsPsych plugin: many key presses against a time limit, with a live
 * progress display. jsPsych's keyboard plugin ends on one key, and a custom `on_load` screen is never
 * run by data-only simulation, cannot end the trial early on its own and leaves its timers to the caller.
 * A plugin ends on the target count or on the time limit, records every press time, and has its own
 * `simulate` (data-only from the package's press-rate model, visual by pressing the real keys).
 *
 * It is written here, in this package, and is a candidate for jspsych-contrib (PACKAGE-STANDARD §11).
 */
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";
import { EFFORT_PLUGIN_NAME } from "./constants";
import { simulatePressRate, simulatePressTimes } from "./simulation";
import { renderEffort, updateEffort } from "./stimuli";

const info = <const>{
  name: EFFORT_PLUGIN_NAME,
  version: version,
  parameters: {
    /** Keys that count as presses (event.key values; " " is the space bar). */
    keys: { type: ParameterType.KEYS, default: undefined },
    /** Presses needed to complete the trial. */
    required_presses: { type: ParameterType.INT, default: undefined },
    /** Time allowed, in ms, from the start of the screen. */
    time_limit: { type: ParameterType.INT, default: undefined },
    /** "progress_bar", "counter" or "none". */
    progress_indicator: { type: ParameterType.STRING, default: "progress_bar" },
    /** HTML shown below the progress display. */
    prompt: { type: ParameterType.HTML_STRING, default: "" },
    /** Text of the counter: `(count, required) => string`. */
    counter_text: {
      type: ParameterType.FUNCTION,
      default: (count: number, required: number) => `${count} / ${required}`,
    },
  },
  data: {
    /** Number of presses made. */
    press_count: { type: ParameterType.INT },
    /** Time of every press, ms from the start of the screen. */
    press_times: { type: ParameterType.INT, array: true },
    /** Whether the required number of presses was reached within the time limit. */
    completed: { type: ParameterType.BOOL },
    /** Time to the last required press, or the time limit when the target was not reached. */
    task_duration_ms: { type: ParameterType.INT },
    /** Time of the first press, or null if there was none. */
    rt: { type: ParameterType.INT },
    required_presses: { type: ParameterType.INT },
    time_limit: { type: ParameterType.INT },
  },
};

type Info = typeof info;

/** Options of the simulated participant (`simulation_options` of the trial). */
export interface EffortSimulationOptions {
  /** mean presses per second for this trial (default: drawn from the package's model for `task`) */
  press_rate?: number;
  /** which task's press-rate model to draw from when `press_rate` is not given (default "easy") */
  task?: "easy" | "hard";
  /** always reach the target (the walkthrough) */
  force_complete?: boolean;
}

class EffortPressPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const required = trial.required_presses;
    const limit = trial.time_limit;
    const counter_text = trial.counter_text as (c: number, r: number) => string;
    const indicator = trial.progress_indicator as "none" | "counter" | "progress_bar";
    display_element.innerHTML = renderEffort({
      progress_indicator: indicator,
      required,
      count: 0,
      counter_text,
      prompt: trial.prompt ?? "",
    });

    const times: number[] = [];
    let ended = false;
    const finish = (completed: boolean) => {
      if (ended) return;
      ended = true;
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
      this.jsPsych.pluginAPI.clearAllTimeouts();
      display_element.innerHTML = "";
      this.jsPsych.finishTrial({
        press_count: times.length,
        press_times: times,
        completed,
        task_duration_ms: completed ? times[times.length - 1] : limit,
        rt: times.length > 0 ? times[0] : null,
        required_presses: required,
        time_limit: limit,
      });
    };

    this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: (press: { key: string; rt: number }) => {
        if (ended) return;
        times.push(press.rt);
        updateEffort(display_element, {
          progress_indicator: indicator,
          required,
          count: times.length,
          counter_text,
        });
        if (times.length >= required) finish(true);
      },
      valid_responses: trial.keys,
      rt_method: "performance",
      persist: true,
      allow_held_key: false,
    });
    this.jsPsych.pluginAPI.setTimeout(() => finish(false), limit);
  }

  private simulationData(trial: TrialType<Info>, simulation_options: any) {
    const o: EffortSimulationOptions = simulation_options ?? {};
    const required = trial.required_presses;
    const limit = trial.time_limit;
    const rate = o.press_rate ?? simulatePressRate(this.jsPsych, o.task ?? "easy");
    const effectiveLimit = o.force_complete ? null : limit;
    const times = simulatePressTimes(this.jsPsych, required, effectiveLimit, rate);
    const completed = times.length >= required;
    const default_data = {
      press_count: times.length,
      press_times: times,
      completed,
      task_duration_ms: completed ? times[times.length - 1] : limit,
      rt: times.length > 0 ? times[0] : null,
      required_presses: required,
      time_limit: limit,
    };
    return this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
  }

  simulate(
    trial: TrialType<Info>,
    simulation_mode: "data-only" | "visual",
    simulation_options: any,
    load_callback: () => void
  ) {
    if (simulation_mode === "data-only") {
      load_callback();
      this.jsPsych.finishTrial(this.simulationData(trial, simulation_options));
      return;
    }
    // visual: run the real trial and press the real key at each simulated time
    const data = this.simulationData(trial, simulation_options);
    this.trial(this.jsPsych.getDisplayElement(), trial);
    load_callback();
    const key = (trial.keys as string[])[0];
    for (const t of data.press_times as number[]) this.jsPsych.pluginAPI.pressKey(key, t);
  }
}

export default EffortPressPlugin;
