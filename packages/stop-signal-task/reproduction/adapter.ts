/**
 * Adapter from the generated spec's typed observed values to StopSignalTaskOptions.
 *
 * The spec records some values as free text ("go arrow turns red") or under component keys
 * ("adaptive.bounds" is a min in one study and a max in another). This file is the single,
 * hand-written retyping table. Every entry is either a StopSignalTaskOptions fragment or a classified
 * gap. Nothing is parsed from prose.
 */
import { createAdapterKit, gap, isGap, ok } from "@jspsych-timelines/testing";
import type {
  Adapted as GenericAdapted,
  ConfigEntry as GenericConfigEntry,
} from "@jspsych-timelines/testing";

import type { StopSignalTaskOptions } from "../src/options";

export type Adapted = GenericAdapted<StopSignalTaskOptions>;
export type ConfigEntry = GenericConfigEntry<StopSignalTaskOptions>;
export { isGap };

/** Canonical sub-key of an option's component. Observed rows name it by variation, configs by role. */
const SUB_BY_VARIATION: Record<string, Record<string, string>> = {
  stimulus_duration_ms: { go_stimulus_duration_ms: "go", stop_signal_duration_ms: "stop_signal" },
  stimulus_set: { go_stimulus_set: "go", stop_signal_stimulus: "stop_signal" },
  condition_proportions: {
    stop_signal_probability: "stop_probability",
    stop_probability_blocks: "blocks",
  },
  practice_trials: { go_only_practice: "go_only", practice_trials: "main" },
  adaptive: {
    ssd_procedure: "procedure",
    ssd_initial_ms: "start_level",
    ssd_step_ms: "step_size",
    tracking_target_stop_rate: "target_accuracy",
    ssd_min_ms: "bounds_min",
    ssd_max_ms: "bounds_max",
    ssd_staircase_structure: "tracks",
    ssd_reset_policy: "reset",
  },
};
export const subFromVariation = (option: string, variation: string): string =>
  SUB_BY_VARIATION[option]?.[variation] ?? "main";

const GO: Record<string, any> = {
  "left/right arrows": ok({ stimulus_set: { go: "arrows" } }),
  "left/right arrow inside a circle": ok({ stimulus_set: { go: "arrows_in_circle" } }),
};
const GO_GAPS: Record<string, [any, string]> = {
  "4 shapes mapped to 2 keys": ["option missing", "shape stimuli with a key mapping"],
  "stimulus location left/right of fixation (food/non-food pictures or words, task-irrelevant)": [
    "option missing",
    "picture and word stimuli at a location",
  ],
  "green arrow in white circle": [
    "option missing",
    "arrow and circle colours (no colour option in the spec)",
  ],
  "image orientation portrait/landscape (stones or money)": ["option missing", "image stimuli"],
  "black arrows on grey": ["option missing", "stimulus colours (no stimulus_color in the spec)"],
  "target square turns green (Exp 1) / letter T or X (Exp 2)": [
    "option missing",
    "square and letter stimuli",
  ],
  "game character (archer) signals left/right": [
    "option missing",
    "gamified stimuli (population_protocol gamified_child)",
  ],
  "go task of another paradigm (flanker, n-back, task switching, shape matching, directed forgetting)":
    ["plugin needed", "the stop-signal dual tasks need the other task's package"],
  "square/circle": ["option missing", "shape discrimination instead of arrow direction"],
  "peripheral saccade target (left/right)": [
    "plugin needed",
    "saccade countermanding (deferred: needs an eye-tracker plugin)",
  ],
};
const SIGNAL: Record<string, any> = {
  "go arrow turns red": ok({ stimulus_set: { stop_signal: "arrow_turns_red" } }),
  "surrounding circle turns red": ok({ stimulus_set: { stop_signal: "circle_turns_red" } }),
  "blue box around stimulus": ok({ stimulus_set: { stop_signal: "border" } }),
  "blue 15-px border": ok({ stimulus_set: { stop_signal: "border" } }),
  "tone through closed headphones": ok({ stimulus_set: { stop_signal: "tone" } }),
  "750 Hz tone, 75 ms": ok({ stimulus_set: { stop_signal: "tone" } }),
};
const SIGNAL_GAPS: Record<string, [any, string]> = {
  "star outline around the shape": ["option missing", "star-outline signal"],
  "blue square (0.7 x 0.7 deg)": ["option missing", "square signal sized in degrees"],
  "black square (Exp 1) / red circle (Exp 2) between targets": [
    "option missing",
    "signal between two targets",
  ],
  "game event (dragon breathes fire)": ["option missing", "gamified signal"],
  "fixation spot re-illuminated": ["plugin needed", "saccade countermanding"],
  "central flower changes green to red": ["option missing", "child-friendly flower stimulus"],
};

const round6 = (x: number) => Math.round(x * 1e6) / 1e6;

/**
 * Retype one observed value. `value` is the spec's typed value, `raw` its source text.
 * The returned options contain the value plus the companion settings the single value needs to be
 * observable (for example, feedback duration needs feedback switched on).
 */
export function adapt(
  option: string,
  sub: string,
  value: any,
  _phase: string | null = null
): Adapted {
  switch (option) {
    case "break_duration_ms":
      return ok({ break_duration_ms: value });
    case "strategy_instruction":
      return ok({ strategy_instruction: value }, { instruction_format: "text" });
    case "feedback_duration_ms":
      return ok({ feedback_duration_ms: value }, { trial_feedback: "accuracy" });
    case "fixation_duration_ms":
      return ok({ fixation_duration_ms: value });
    case "iti_ms":
      return ok({ iti_ms: value });
    case "response_window_ms":
      return ok({ response_window_ms: value });
    case "stimulus_duration_ms":
      if (sub === "go") {
        // a gone go stimulus cannot also be the red arrow: the signal is a frame
        return ok(
          { stimulus_duration_ms: { go: value } },
          value === null ? undefined : { stimulus_set: { stop_signal: "border" } }
        );
      }
      return ok({ stimulus_duration_ms: { stop_signal: value } });
    case "stimulus_eccentricity":
      return gap(
        "plugin needed",
        "saccade countermanding: degrees of eccentricity of a saccade target (deferred)"
      );
    case "stimulus_modality":
      return value === "visual" || value === "auditory"
        ? ok({ stimulus_modality: value })
        : gap("option missing", `modality ${value}`);
    case "stimulus_set":
      if (sub === "go") {
        if (GO[value]) return GO[value];
        const g = GO_GAPS[value];
        return g
          ? gap(g[0], g[1])
          : gap("package fix needed", `no adapter entry for go "${value}"`);
      }
      if (SIGNAL[value]) return SIGNAL[value];
      {
        const g = SIGNAL_GAPS[value];
        return g
          ? gap(g[0], g[1])
          : gap("package fix needed", `no adapter entry for stop signal "${value}"`);
      }
    case "condition_proportions":
      if (sub === "stop_probability") {
        return ok({ condition_proportions: { stop: value, go: round6(1 - value) } });
      }
      return gap("option missing", "block-wise stop proportions (the spec cannot type them)");
    case "difficulty_levels":
      return ok({ difficulty_levels: value });
    case "n_blocks":
      return ok({ n_blocks: value });
    case "trials_per_block":
      return ok({ trials_per_block: value });
    case "sequence_constraints":
      return ok({ sequence_constraints: value });
    case "response_device":
      return value === "gamepad"
        ? gap("plugin needed", "gamepad responses")
        : ok({ response_device: value });
    case "response_keys":
      return ok({ response_keys: value });
    case "response_mapping_counterbalancing":
      return value === "fixed"
        ? ok({ response_mapping_counterbalancing: "fixed" })
        : gap(
            "option missing",
            "random key assignment only makes sense for non-spatial stimuli (shapes mapped to two keys); the arrows here point left or right"
          );
    case "adaptive":
      return adaptField(sub, value);
    case "device_eligibility":
      if (value === "computer_only") return ok({ device_eligibility: "computer_only" });
      return gap(
        "plugin needed",
        value === "browser_restricted"
          ? "fullscreen, window size and browser checks (a device-check plugin)"
          : "a hardware requirement cannot be verified in the browser"
      );
    case "practice_criterion":
      return practiceCriterion(value);
    case "practice_trials":
      if (sub === "go_only") {
        return value === 0
          ? ok({})
          : gap(
              "option missing",
              "a go-only practice block before the mixed practice (one practice block only)"
            );
      }
      return ok({ practice_trials: value });
    case "block_feedback":
      return ok({ block_feedback: value });
    case "performance_incentive":
      return value === "none"
        ? ok({ performance_incentive: "none" })
        : gap("option missing", "points per response (no points in this task)");
    case "trial_feedback":
      return ok({ trial_feedback: value });
    case "population_protocol":
      return value === "standard"
        ? ok({ population_protocol: "standard" })
        : gap("option missing", "gamified child protocol (story, sounds, flower stimuli)");
    default:
      return gap("package fix needed", `no adapter entry for ${option}/${sub}`);
  }
}

/** The fields of the `adaptive` bundle, one value at a time. */
function adaptField(sub: string, value: any): Adapted {
  switch (sub) {
    case "procedure":
      // the dossier calls the 1-up/1-down staircase that tracks 50% "tracking" (not a vocabulary value)
      if (value === "tracking") return ok({ adaptive: { procedure: "staircase_1up_1down" } });
      if (value === "random_uniform_range") {
        return ok({ adaptive: null }, { difficulty_levels: { min: 100, max: 450 } });
      }
      if (value === "fixed_set")
        return ok({ adaptive: null }, { difficulty_levels: [17, 67, 117, 167] });
      if (value === "fixed_single") return ok({ adaptive: null }, { difficulty_levels: [250] });
      return gap("package fix needed", `procedure ${value}`);
    case "start_level":
      return ok({ adaptive: { start_level: value } });
    case "step_size":
      return ok({ adaptive: { step_size: value } });
    case "target_accuracy":
      return ok({ adaptive: { target_accuracy: value } });
    case "bounds_min":
      return ok({ adaptive: { bounds: [value, null] } });
    case "bounds_max":
      // the minimum is not reported alongside; 0 ms is the physical limit
      return ok({ adaptive: { bounds: [0, value] } });
    default:
      return gap("package fix needed", `adaptive.${sub}`);
  }
}

/** Practice criteria: only go accuracy is expressible. */
function practiceCriterion(v: any): Adapted {
  if (v === null) return ok({ practice_criterion: null });
  const keys = Object.keys(v);
  const extra = keys.filter((k) => !["go_accuracy_min", "on_fail"].includes(k));
  if (extra.length) {
    return gap(
      "option missing",
      `criterion on ${extra.join(
        ", "
      )} (the vocabulary's practice_criterion has accuracy, window, on_fail, max_repeats; the spec typed it with other field names)`
    );
  }
  return ok({ practice_criterion: { accuracy: v.go_accuracy_min, on_fail: v.on_fail } });
}

const kit = createAdapterKit<StopSignalTaskOptions>({
  mapOptions: [
    "stimulus_set",
    "stimulus_duration_ms",
    "adaptive",
    "practice",
    "condition_proportions",
  ],
});
export const { mergeOptions, assumedSettings } = kit;

export const { combine } = kit;

/** Retype one key of a study configuration, e.g. "stimulus_set.stop signal". */
export function adaptConfigKey(key: string, value: any): Adapted {
  if (key === "practice.trial_feedback") return ok({ practice: { trial_feedback: value } });
  const dot = key.indexOf(".");
  const option = dot < 0 ? key : key.slice(0, dot);
  const role = dot < 0 ? "main" : key.slice(dot + 1);
  if (value && typeof value === "object" && "untranslated" in value) {
    return gap("option missing", `untyped value: ${JSON.stringify(value.untranslated)}`);
  }
  if (option === "adaptive") {
    // the spec combines a study's ssd_min_ms and ssd_max_ms into `adaptive.bounds: [min, max]`, null for a
    // side it does not report; an unreported minimum is 0 ms (the physical limit), an unreported maximum none
    if (role === "bounds") {
      const [lo, hi] = value as (number | null)[];
      return ok({ adaptive: { bounds: [lo ?? 0, hi ?? null] } });
    }
    return adaptField(role, value);
  }
  if (option === "stimulus_duration_ms") {
    return adapt(option, role === "go_stimulus_duration_ms" ? "go" : "stop_signal", value);
  }
  if (option === "stimulus_set") return adapt(option, role === "go" ? "go" : "stop_signal", value);
  if (option === "condition_proportions") {
    return adapt(option, role === "stop_signal_probability" ? "stop_probability" : "blocks", value);
  }
  if (option === "practice_trials") {
    return adapt(option, role === "go_only_practice" ? "go_only" : "main", value);
  }
  return adapt(option, "main", value);
}

/** Retype a whole study configuration. */
export function adaptConfig(options: Record<string, any>): ConfigEntry[] {
  return Object.keys(options).map((key) => ({ key, adapted: adaptConfigKey(key, options[key]) }));
}
