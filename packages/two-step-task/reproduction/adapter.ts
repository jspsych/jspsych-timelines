/**
 * Adapter from the generated spec's typed observed values to TwoStepTaskOptions.
 *
 * The spec records some values as free text (the reward walk as "{sd: 0.025, lower: 0.25, ...}") or
 * under placeholder keys (`state_1`, `option_1`). This file is the single, hand-written retyping
 * table. Every entry is either a TwoStepTaskOptions fragment or a classified gap. Nothing is
 * parsed from prose: the walk strings are looked up in a table of the values the dossier has.
 */
import { createAdapterKit, gap, isGap, ok } from "@jspsych-timelines/testing";
import type {
  Adapted as GenericAdapted,
  ConfigEntry as GenericConfigEntry,
} from "@jspsych-timelines/testing";

import { DEFAULT_OPTIONS } from "../src/options";
import type {
  RewardProbability,
  RewardSchedule,
  TwoStepStimulusSet,
  TwoStepTaskOptions,
} from "../src/options";
import { stimuli } from "../src/sets";

export type Adapted = GenericAdapted<TwoStepTaskOptions>;
export type ConfigEntry = GenericConfigEntry<TwoStepTaskOptions>;
export { isGap };

/** Canonical sub-key of an option's component. Observed rows name it by variation, configs by role. */
const SUB_BY_VARIATION: Record<string, string> = {
  reward_walk: "walk",
  reward_schedule: "kind",
  missed_trial_abort_threshold: "abort",
  training_sequence: "training",
};
const SUB_BY_ROLE: Record<string, string> = { ...SUB_BY_VARIATION };

const HAS_SUBS = ["reward_schedule", "missed_response_handling", "practice_trials"];

export const subFromVariation = (option: string, variation: string): string =>
  HAS_SUBS.includes(option) && SUB_BY_VARIATION[variation] ? SUB_BY_VARIATION[variation] : "main";

/** The spec's walk strings, as the typed schedule. */
const WALK = (
  sd: number,
  boundary: "reflect" | "reverse_step"
): Extract<RewardSchedule, { kind: "random_walk" }> => ({
  kind: "random_walk",
  sd,
  bounds: [0.25, 0.75],
  boundary,
});
export const WALKS: Record<string, RewardSchedule> = {
  "{sd: 0.025, lower: 0.25, upper: 0.75, boundary: reflect}": WALK(0.025, "reflect"),
  "{sd: 0.025, lower: 0.25, upper: 0.75, boundary: reverse_step}": WALK(0.025, "reverse_step"),
  "{sd: 0.0275, lower: 0.25, upper: 0.75, boundary: reflect}": WALK(0.0275, "reflect"),
};

/** The spec's `state_1` / `state_2` are the red and the blue state. */
export function retypeProbabilities(value: any): RewardProbability {
  const out: RewardProbability = {};
  const states: Array<["state_1" | "state_2", "red" | "blue"]> = [
    ["state_1", "red"],
    ["state_2", "blue"],
  ];
  for (const [from, to] of states) if (value[from]) out[to] = value[from];
  return out;
}

/** Settings that only make a single value cheap to observe: a short run. Level 1 only. */
const SPEED = { practice_trials: 4, n_test_trials: 40 } as const;

/**
 * The spec's `instruction_framing` values, as the bundled stimulus sets (utils.stimuli). The set carries the
 * pictures and the words of the cover story; the other stories of the literature have no bundled set.
 */
export const STIMULUS_SETS: Record<string, TwoStepStimulusSet> = {
  abstract_symbols: stimuli.abstractSymbols,
  spaceship_planet_alien: stimuli.spaceshipPlanetAlien,
};

/**
 * Retype one observed value. `value` is the spec's typed value. `fast` adds the short-run companions
 * (level 1); a whole study configuration keeps its own length.
 */
function adaptValue(option: string, sub: string, value: any, fast: boolean): Adapted {
  const speed = (omit: string[] = []): TwoStepTaskOptions | undefined =>
    fast
      ? (Object.fromEntries(
          Object.entries(SPEED).filter(([k]) => !omit.includes(k))
        ) as TwoStepTaskOptions)
      : undefined;
  switch (option) {
    case "n_test_trials":
      return ok({ n_test_trials: value }, speed(["n_test_trials"]));
    case "n_blocks":
    case "trials_per_block":
      // the counts reconcile with each other, so the run length is left to them
      return ok({ [option]: value } as TwoStepTaskOptions, speed(["n_test_trials"]));
    case "practice_trials":
      if (sub === "training") {
        return gap(
          "option missing",
          "a staged or observe-only tutorial (training_sequence) is not an option; the walkthrough is one design"
        );
      }
      return ok({ practice_trials: value }, speed(["practice_trials"]));
    case "reward_probability":
      return ok({ reward_probability: retypeProbabilities(value) }, speed());
    case "reward_schedule":
      if (sub === "walk") {
        return WALKS[value]
          ? ok({ reward_schedule: WALKS[value] }, speed(["n_test_trials"]))
          : gap("package fix needed", `no typed walk for ${JSON.stringify(value)}`);
      }
      if (value === "walk_generated_per_participant") {
        // the walk is always generated when the timeline is built; its parameters come from the walk value
        return ok({}, { reward_schedule: DEFAULT_OPTIONS.reward_schedule });
      }
      return gap(
        "option missing",
        `reward_schedule kind "${value}" (fixed walk sets or block alternation) is not implemented`
      );
    case "missed_response_handling":
      if (sub === "abort") {
        return value === "none"
          ? ok({}, speed())
          : gap(
              "option missing",
              "an abort after N missed trials is a performance gate, not built in"
            );
      }
      return ok({ missed_response_handling: value }, speed());
    case "comprehension_check":
      return value === "none"
        ? ok({ comprehension_check: "none" }, speed())
        : gap(
            "option missing",
            `comprehension_check "${value}": the walkthrough has its own check questions`
          );
    case "fullscreen_enforcement":
      return value === "none"
        ? ok({ fullscreen_enforcement: "none" }, speed())
        : gap("option missing", `fullscreen_enforcement "${value}" is not implemented`);
    case "instruction_format":
      return value === "text" || value === "experimenter"
        ? ok({ instruction_format: value }, speed())
        : gap("plugin needed", `instruction_format "${value}" needs recorded media`);
    case "instruction_framing":
      return STIMULUS_SETS[value]
        ? ok({ stimulus_set: STIMULUS_SETS[value] }, speed())
        : gap(
            "option missing",
            `no bundled stimulus set for the "${value}" cover story; pass your own set as stimulus_set`
          );
    case "population_protocol":
      return value === "standard"
        ? ok({ population_protocol: "standard" }, speed())
        : gap("option missing", `population_protocol "${value}" is a bundle of other options`);
    case "sequence_constraints":
      return ok({ sequence_constraints: value }, speed());
    case "response_window_ms":
      return ok({ response_window_ms: value }, speed());
    case "manipulation_check":
      return ok({ manipulation_check: value }, speed());
    default:
      return ok({ [option]: value } as TwoStepTaskOptions, speed());
  }
}

export function adapt(
  option: string,
  sub: string,
  value: any,
  _phase: string | null = null
): Adapted {
  return adaptValue(option, sub, value, true);
}

const kit = createAdapterKit<TwoStepTaskOptions>({
  mapOptions: ["reward_probability", "practice"],
});
export const { combine, mergeOptions, assumedSettings } = kit;

/** Retype one key of a study configuration, e.g. "reward_schedule.reward_walk". */
export function adaptConfigKey(key: string, value: any): Adapted {
  const dot = key.indexOf(".");
  const option = dot < 0 ? key : key.slice(0, dot);
  const role = dot < 0 ? "main" : key.slice(dot + 1);
  if (value && typeof value === "object" && "untranslated" in value) {
    return gap("option missing", `untyped value: ${JSON.stringify(value.untranslated)}`);
  }
  if (key.startsWith("practice.")) {
    return gap(
      "option missing",
      `practice override ${key.slice("practice.".length)} is a tutorial design`
    );
  }
  const sub = dot < 0 ? "main" : SUB_BY_ROLE[role] ?? "main";
  return adaptValue(option, sub, value, false);
}

export function adaptConfig(options: Record<string, any>): ConfigEntry[] {
  return Object.keys(options).map((key) => ({ key, adapted: adaptConfigKey(key, options[key]) }));
}
