/**
 * Adapter from the generated spec's typed observed values to ToneDetectionOptions.
 *
 * The spec records some values as free text ("1.5 dB descent") or under component keys
 * ("adaptive.step_size" is a schedule object). This file is the single, hand-written retyping table. Every
 * entry is either a ToneDetectionOptions fragment or a classified gap. Nothing is parsed from prose.
 */
import { createAdapterKit, gap, isGap, ok } from "@jspsych-timelines/testing";
import type {
  Adapted as GenericAdapted,
  ConfigEntry as GenericConfigEntry,
} from "@jspsych-timelines/testing";

import type { StepSizeSpec, ToneDetectionOptions } from "../src/options";

export type Adapted = GenericAdapted<ToneDetectionOptions>;
export type ConfigEntry = GenericConfigEntry<ToneDetectionOptions>;
export { isGap };

/** Canonical sub-key of an option's component. Observed rows name it by variation, configs by role. */
const SUB_BY_VARIATION: Record<string, Record<string, string>> = {
  presentation_level_db: { level_roving_db: "level_roving", masker_level_reference: "masker" },
  stimulus_set: { carrier_type: "tone", masker_type: "masker" },
  tone_frequency_hz: { standard_frequency_hz: "frequency", frequency_roving: "roving" },
  adaptive: {
    psychophysical_method: "method",
    tracking_rule: "procedure",
    step_size_schedule: "step_size",
    starting_level: "start_level",
    stopping_rule: "discontinue_rule",
  },
  device_eligibility: {
    device_restriction: "device_restriction",
    listener_transducer: "listener_transducer",
  },
};
export const subFromVariation = (option: string, variation: string): string =>
  SUB_BY_VARIATION[option]?.[variation] ?? "main";

/** Levels and trial counts a fixed-level (constant stimuli) observation needs to be observable. */
const FIXED_LEVELS: ToneDetectionOptions = {
  difficulty_levels: [-10, -14, -18],
  trials_per_block: 12,
};

/**
 * The step schedules the spec typed as objects with prose steps, by their JSON. Each is a list indexed by reversals, or a gap.
 * The spec has no field that says "list": the schedules are matched whole.
 */
const STEP_SCHEDULES: Record<string, StepSizeSpec | StepSizeSpec[] | [string, string]> = {
  // S012: 1.5 dB while descending, 0.75 dB after the first error. The anchor also switches at -19.75 dB SNR, which is not implemented.
  [JSON.stringify({
    scale: "dB",
    steps: ["1.5 dB descent", "0.75 dB"],
    switch_after: "first error or -19.75 dB SNR",
  })]: [1.5, 0.75],
  // S044: 8 dB until 2 reversals, 2 dB for 2 more, then 0.5 dB
  [JSON.stringify({
    scale: "dB",
    steps: ["8 dB", "2 dB", "0.5 dB"],
    switch_after: "2 reversals, then 2 more",
  })]: [8, 8, 2, 2, 0.5],
  // S031: a weighted rule, 2 dB down after a correct answer and 6 dB up after a wrong one (75% correct)
  [JSON.stringify({ scale: "dB", steps: ["down 2 dB, up 6 dB"], switch_after: "fixed" })]: {
    up: 6,
    down: 2,
  },
};

const MULTIPLICATIVE =
  "steps that multiply a Hz or % difference (frequency discrimination); the package's level is in dB";

/** The step list a schedule stands for, or null (used by level 2 to tie the resolved steps to the reported value). */
export function expectedSteps(value: any): Array<{ up: number; down: number }> | null {
  const s = STEP_SCHEDULES[JSON.stringify(value)];
  if (s === undefined) return null;
  const list = Array.isArray(s) ? s : [s];
  return list.map((x) =>
    typeof x === "number" ? { up: x, down: x } : (x as { up: number; down: number })
  );
}

const PROCEDURES: Record<string, ToneDetectionOptions["adaptive"]> = {
  "2down1up": { procedure: "staircase_1up_2down" },
  "3down1up": { procedure: "staircase_1up_3down" },
  // 1 down, 3 up: converges where the wrong answers' steps are three times the correct ones' (75%)
  weighted_1down_3up: { procedure: "staircase_1up_1down", step_size: { up: 3, down: 1 } },
};

const TASK_VARIANTS = new Set(["3I-3AFC_which_contains_tone", "2I-2AFC_which_contains_tone"]);

/**
 * Retype one observed value. `value` is the spec's typed value, `raw` its source text.
 * The returned options contain the value plus the companion settings the single value needs to be
 * observable (for example, a feedback duration needs feedback switched on).
 */
export function adapt(
  option: string,
  sub: string,
  value: any,
  _phase: string | null = null
): Adapted {
  switch (option) {
    case "inter_item_interval_ms":
      return ok({ inter_item_interval_ms: value });
    case "stimulus_duration_ms":
      return ok({ stimulus_duration_ms: value });
    case "tone_ramp_ms":
      return ok({ tone_ramp_ms: value });
    case "iti_ms":
      return ok({ iti_ms: value });
    case "feedback_duration_ms":
      return ok({ feedback_duration_ms: value }, { trial_feedback: "accuracy" });
    case "presentation_level_db":
      if (sub === "level_roving") {
        return gap(
          "option missing",
          "level roving of the tone (frequency discrimination: removes a loudness cue); the package has no roving"
        );
      }
      return gap(
        "option missing",
        "level re the participant's threshold or a calibration sound (untyped in the spec)"
      );
    case "stimulus_set":
      if (sub === "tone") {
        return value === "pure_tone"
          ? ok({ stimulus_set: { tone: "pure_tone" } })
          : gap(
              "option missing",
              `${value}: only pure tones are synthesised (complex tones and instrument notes are not)`
            );
      }
      if (value === "white_noise") return ok({ stimulus_set: { masker: "white_noise" } });
      return gap(
        "option missing",
        `${value}: only white noise is synthesised (no threshold-equalizing noise)`
      );
    case "tone_frequency_hz":
      if (sub === "roving")
        return gap(
          "option missing",
          `frequency roving ${JSON.stringify(value)}: not implemented (the anchor does not rove)`
        );
      return ok({ tone_frequency_hz: value });
    case "block_order":
      return ok({ block_order: value }, { tone_frequency_hz: [500, 1000, 2000] });
    case "difficulty_levels":
      return gap(
        "option missing",
        "constant-stimuli levels given as a count, a spacing and a range in prose (amplitude steps, an F0 shift in Hz); the package takes a list of levels in dB"
      );
    case "task_variant":
      return TASK_VARIANTS.has(value)
        ? ok({ task_variant: value })
        : gap(
            "option missing",
            `${value}: discrimination, oddity and comparison trials are not implemented (detection variants only)`
          );
    case "trials_per_condition":
      return ok({ trials_per_condition: value });
    case "response_device":
      return ok({ response_device: value });
    case "adaptive":
      return adaptField(sub, value);
    case "device_eligibility":
      if (value === "none") return ok({ device_eligibility: "none" });
      return gap(
        "plugin needed",
        value === "browser_restricted"
          ? "a browser and device restriction (a device-check plugin; excluding a browser by name is not defensible)"
          : "a headphone or hardware requirement cannot be verified in the browser (see headphone_check for the screen)"
      );
    case "headphone_check":
      return ok({ headphone_check: value });
    case "participant_eligibility":
      return ok({ participant_eligibility: value });
    case "practice_trials":
      return ok({ practice_trials: value });
    case "volume_calibration":
      return ok({ volume_calibration: value });
    case "feedback_condition":
      return ok({ feedback_condition: value }, { trial_feedback: "accuracy" });
    case "trial_feedback":
      return ok({ trial_feedback: value });
    case "performance_incentive":
      return gap(
        "option missing",
        "a bonus tied to accuracy (payment is the researcher's; no incentive is implemented)"
      );
    case "progress_indicator":
      return ok({ progress_indicator: value });
    case "environment_instructions":
      return ok({ environment_instructions: value });
    case "judgment_wording":
      return value === "which_interval_contains_tone"
        ? ok({ judgment_wording: value })
        : gap(
            "option missing",
            `"${value}" goes with the discrimination variants, which are not implemented`
          );
    default:
      return gap("package fix needed", `no adapter entry for ${option}/${sub}`);
  }
}

/** The fields of the `adaptive` bundle, one value at a time. */
function adaptField(sub: string, value: any): Adapted {
  switch (sub) {
    case "method":
      if (value === "transformed_up_down") return ok({ adaptive: {} });
      if (value === "weighted_up_down")
        return ok(
          { adaptive: { procedure: "staircase_1up_1down" } },
          { adaptive: { step_size: { up: 6, down: 2 } } }
        );
      if (value === "constant_stimuli") return ok({ adaptive: null }, FIXED_LEVELS);
      return gap("package fix needed", `method ${value}`);
    case "procedure": {
      const p = PROCEDURES[value];
      return p ? ok({ adaptive: p }) : gap("package fix needed", `rule ${value}`);
    }
    case "step_size": {
      const s = STEP_SCHEDULES[JSON.stringify(value)];
      if (s !== undefined) {
        const weighted = !Array.isArray(s) && typeof s === "object";
        return ok({
          adaptive: {
            ...(weighted ? { procedure: "staircase_1up_1down" as const } : {}),
            step_size: s as StepSizeSpec | StepSizeSpec[],
          },
        });
      }
      return value?.scale === "multiplicative"
        ? gap("option missing", MULTIPLICATIVE)
        : gap("package fix needed", `step schedule ${JSON.stringify(value)}`);
    }
    case "start_level":
      // -13.75 is dB SNR; 100 is a Hz or % frequency difference
      return value < 0
        ? ok({ adaptive: { start_level: value } })
        : gap(
            "option missing",
            `a start level of ${value} in Hz or % (frequency discrimination); the package's level is in dB`
          );
    case "discontinue_rule":
      return ok({ adaptive: { discontinue_rule: { [value.criterion]: value.n } } });
    default:
      return gap("package fix needed", `adaptive.${sub}`);
  }
}

const kit = createAdapterKit<ToneDetectionOptions>({
  mapOptions: ["stimulus_set", "adaptive", "practice"],
});
export const { mergeOptions, assumedSettings, combine } = kit;

/** Retype one key of a study configuration, e.g. "stimulus_set.tone timbre". */
export function adaptConfigKey(key: string, value: any): Adapted {
  if (key === "practice.trial_feedback") return ok({ practice: { trial_feedback: value } });
  const dot = key.indexOf(".");
  const option = dot < 0 ? key : key.slice(0, dot);
  const role = dot < 0 ? "main" : key.slice(dot + 1);
  if (value && typeof value === "object" && "untranslated" in value) {
    return gap("option missing", `untyped value: ${JSON.stringify(value.untranslated)}`);
  }
  switch (option) {
    case "adaptive":
      return adaptField(role, value);
    case "stimulus_set":
      return adapt(option, role === "tone timbre" ? "tone" : "masker", value);
    case "tone_frequency_hz":
      return adapt(option, role === "frequency_roving" ? "roving" : "frequency", value);
    case "presentation_level_db":
      return adapt(option, role === "level_roving_db" ? "level_roving" : "masker", value);
    case "device_eligibility":
      return adapt(option, role, value);
    default:
      return adapt(option, "main", value);
  }
}

/** Retype a whole study configuration. */
export function adaptConfig(options: Record<string, any>): ConfigEntry[] {
  return Object.keys(options).map((key) => ({ key, adapted: adaptConfigKey(key, options[key]) }));
}
