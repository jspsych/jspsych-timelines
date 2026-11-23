/**
 * Adapter from the generated spec's typed observed values to SelfOrderedPointingOptions.
 *
 * The spec records some values under role keys ("stimulus_set.item_stimulus_set", "set_sizes.set_sizes",
 * "practice.set_sizes.practice_set_size") and the position-repetition rule as an untyped string under
 * `sequence_constraints`. This file is the single, hand-written retyping table. Every entry is either an options
 * fragment or a classified gap.
 */
import { createAdapterKit, gap, isGap, ok } from "@jspsych-timelines/testing";
import type {
  Adapted as GenericAdapted,
  ConfigEntry as GenericConfigEntry,
} from "@jspsych-timelines/testing";

import type { SelfOrderedPointingOptions, StimulusSet } from "../src/options";
import { stimuli } from "../src/sets";

export type Adapted = GenericAdapted<SelfOrderedPointingOptions>;
export type ConfigEntry = GenericConfigEntry<SelfOrderedPointingOptions>;
export { isGap };

const SUB_BY_VARIATION: Record<string, string> = {
  item_stimulus_set: "items",
  item_pool_across_set_sizes: "pool",
  practice_set_size: "practice",
};
const SUB_BY_ROLE: Record<string, string> = SUB_BY_VARIATION;
const SUBBED = ["stimulus_set", "set_sizes"];
export const subFromVariation = (option: string, variation: string): string =>
  SUBBED.includes(option) && SUB_BY_VARIATION[variation] ? SUB_BY_VARIATION[variation] : "main";
export const subFromRole = (option: string, role: string): string =>
  SUBBED.includes(option) && SUB_BY_ROLE[role] ? SUB_BY_ROLE[role] : "main";

/** The position-repetition rules the spec could not type (`sequence_constraints.untranslated`), as the task-specific option. */
export const POSITION_RULES: Record<string, SelfOrderedPointingOptions> = {
  none: { position_repeat_rule: "none" },
  instructed_max_2_same_location: { position_repeat_rule: "instructed", position_repeat_max: 2 },
  enforced_max_2_same_position: { position_repeat_rule: "enforced", position_repeat_max: 2 },
  detect_strategy_and_remind: { position_repeat_rule: "detect_and_remind" },
};

/** The spec's stimulus-set values, as the bundled sets (utils.stimuli). */
export const STIMULUS_SETS: Record<string, StimulusSet> = {
  abstract_designs: stimuli.abstractDesigns,
  representational_drawings: stimuli.representationalDrawings,
  words: stimuli.words,
  nonwords: stimuli.nonwords,
};

/** Practice needs to run for a practice-phase value to be observable. */
const PRACTICE_RUNS: SelfOrderedPointingOptions = { practice_trials: 2 };

/**
 * Retype one observed value. `value` is the spec's typed value. The returned options contain the value
 * plus the companion settings the single value needs to be observable.
 */
export function adapt(
  option: string,
  sub: string,
  value: any,
  _phase: string | null = null
): Adapted {
  switch (option) {
    case "iti_ms":
      return ok({ iti_ms: value });
    case "response_window_ms":
      return ok({ response_window_ms: value });
    case "stimulus_layout":
      return ok({ stimulus_layout: value });
    case "stimulus_set":
      if (sub === "pool") return ok({ stimulus_set: { pool: value } });
      return STIMULUS_SETS[value]
        ? ok({ stimulus_set: { items: STIMULUS_SETS[value] } })
        : gap(
            "option missing",
            `no bundled stimulus set for "${value}"; pass your own set as stimulus_set.items`
          );
    case "rearrangement_rule":
      return ok({ rearrangement_rule: value });
    case "block_order":
      return ok({ block_order: value });
    case "sequence_constraints":
      // the typed value is `null`: no rule
      return value === null
        ? ok(POSITION_RULES.none)
        : gap("option missing", `untyped value ${JSON.stringify(value)}`);
    case "set_sizes":
      if (sub === "practice") return ok({ practice: { set_sizes: [value] } }, PRACTICE_RUNS);
      return ok({ set_sizes: value });
    case "trials_per_condition":
      return ok({ trials_per_condition: value });
    case "response_device":
      return ok({ response_device: value });
    case "adaptive":
      return value === "fixed"
        ? ok({ adaptive: null })
        : gap(
            "option missing",
            `"${value}" needs an item bank (irt_cat) or a discontinue rule with no count in the spec (ascending_until_fail)`
          );
    case "error_correction_procedure":
      return ok({ error_correction_procedure: value });
    case "practice_trials":
      return ok({ practice_trials: value });
    case "trial_feedback":
      // practice has feedback by default too; practice must run for the check to see it
      return ok({ trial_feedback: value }, PRACTICE_RUNS);
    case "instruction_language":
      return gap(
        "option missing",
        `"${value}": the language of the instructions is the \`text\` option; no translation is bundled`
      );
    case "population_protocol":
      return value === "standard"
        ? ok({ population_protocol: value })
        : gap(
            "option missing",
            `"${value}": the preschool protocol needs picture cards, pre-training and a discontinue rule with no count in the spec`
          );
    default:
      return ok({ [option]: value } as SelfOrderedPointingOptions);
  }
}

const kit = createAdapterKit<SelfOrderedPointingOptions>({
  mapOptions: ["stimulus_set", "practice"],
});
export const { mergeOptions, assumedSettings, combine } = kit;

/** Retype one key of a study configuration, e.g. "stimulus_set.item_stimulus_set" or "practice.set_sizes.practice_set_size". */
export function adaptConfigKey(key: string, value: any): Adapted {
  const bare = key.replace(/^practice\./, "");
  const dot = bare.indexOf(".");
  const option = dot < 0 ? bare : bare.slice(0, dot);
  const role = dot < 0 ? "main" : bare.slice(dot + 1);
  const sub = dot < 0 ? "main" : subFromRole(option, role);
  if (value && typeof value === "object" && !Array.isArray(value) && "untranslated" in value) {
    const rule = POSITION_RULES[value.untranslated as string];
    if (option === "sequence_constraints" && rule) return ok(rule);
    return gap("option missing", `untyped value: ${JSON.stringify(value.untranslated)}`);
  }
  if (option === "adaptive") return adapt("adaptive", "main", value);
  return adapt(option, sub, value);
}

/** Retype a whole study configuration. */
export function adaptConfig(options: Record<string, any>): ConfigEntry[] {
  return Object.keys(options).map((key) => ({ key, adapted: adaptConfigKey(key, options[key]) }));
}
