/**
 * Adapter from the generated spec's typed observed values to EefrtOptions.
 *
 * The spec records some values under component keys ("response_window_ms.easy task"), in other units
 * (the easy and hard time limits in seconds, next to a choice window in milliseconds), as strings
 * ("12%") or as finger names mixed into a key map. This file is the single, hand-written retyping
 * table. Every entry is an EefrtOptions fragment or a classified gap. Nothing is parsed from prose.
 */
import { createAdapterKit, gap, isGap, ok } from "@jspsych-timelines/testing";
import type {
  Adapted as GenericAdapted,
  ConfigEntry as GenericConfigEntry,
} from "@jspsych-timelines/testing";

import type { EefrtOptions } from "../src/options";

export type Adapted = GenericAdapted<EefrtOptions>;
export type ConfigEntry = GenericConfigEntry<EefrtOptions>;
export { isGap };

/** Canonical sub-key of an option's component. Observed rows name it by variation, configs by role. */
const SUB_BY_VARIATION: Record<string, Record<string, string>> = {
  feedback_duration_ms: { completion_feedback_ms: "completion", reward_feedback_ms: "reward" },
  response_window_ms: {
    choice_window_ms: "choice",
    easy_time_limit_s: "easy",
    hard_time_limit_s: "hard",
  },
  difficulty_levels: { easy_required_presses: "easy", hard_required_presses: "hard" },
  outcome_type: { reward_display_currency: "currency", reward_medium: "medium" },
  reward_magnitude: { hard_reward_values: "hard", easy_reward_value: "easy" },
  response_key_mapping: { effort_key_assignment: "keys", effort_finger_assignment: "fingers" },
};
export const subFromVariation = (option: string, variation: string): string =>
  SUB_BY_VARIATION[option]?.[variation] ?? "main";

/** Config roles (the part of the key after the dot) are the spec's component names; same sub-keys. */
const SUB_BY_ROLE: Record<string, Record<string, string>> = {
  feedback_duration_ms: SUB_BY_VARIATION.feedback_duration_ms,
  response_window_ms: {
    choice_window_ms: "choice",
    "easy task": "easy",
    "hard task": "hard",
  },
  difficulty_levels: { "easy task": "easy", "hard task": "hard" },
  outcome_type: SUB_BY_VARIATION.outcome_type,
  reward_magnitude: SUB_BY_VARIATION.reward_magnitude,
  response_key_mapping: SUB_BY_VARIATION.response_key_mapping,
};

/** Currency symbol and number format are text, not an option (`text.amount`). */
const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };

/** Finger names the spec uses, as the phrase the instructions give. */
const FINGER_PHRASE: Record<string, string> = {
  dominant_index: "with the index finger of your dominant hand",
  nondominant_index: "with the index finger of your non-dominant hand",
  dominant_little: "with the little finger of your dominant hand",
  nondominant_little: "with the little finger of your non-dominant hand",
};

const percent = (s: string) => parseFloat(s) / 100;

/**
 * Retype one observed value. `value` is the spec's typed value; `sub` the canonical component
 * key. Companion settings a single value needs to be observable are the second argument of `ok`.
 */
export function adapt(
  option: string,
  sub: string,
  value: any,
  _phase: string | null = null
): Adapted {
  switch (option) {
    case "feedback_duration_ms":
      return ok({ feedback_duration_ms: { [sub]: value } });
    case "fixation_duration_ms":
      return ok({ fixation_duration_ms: value });
    case "pre_block_countdown_ms":
      return ok({ pre_block_countdown_ms: value });
    case "response_window_ms":
      // the spec gives the easy and hard time limits in seconds; the choice window is in ms (null = untimed)
      return sub === "choice"
        ? ok({ response_window_ms: { choice: value } })
        : ok({ response_window_ms: { [sub]: value * 1000 } });
    case "session_duration_min":
      return ok({ session_duration_min: value });
    case "difficulty_levels":
      return ok({ difficulty_levels: { [sub]: value } });
    case "outcome_type":
      return sub === "currency" ? currency(value) : medium(value);
    case "outcome_valence":
      return value === "gain"
        ? ok({ outcome_valence: "gain" })
        : gap(
            "option missing",
            "loss trials: which trials carry losses and their size are not in the dossier (S008's review table only)"
          );
    case "reward_magnitude":
      if (sub === "easy") return ok({ reward_magnitude: { easy: value } });
      // The spec types a range {hard: {min, max}}. Whether the study used a list of levels, equally spaced,
      // or a fresh draw per trial is only in the raw text, so every range is read as the 8-level design.
      return ok({ reward_magnitude: { hard: { ...value.hard, n_levels: 8 } } });
    case "reward_probability":
      return ok({ reward_probability: (value as string[]).map(percent) });
    case "trial_order":
      return ok({ trial_order: value });
    case "social_influence_cue":
      return value === false
        ? ok({})
        : gap(
            "option missing",
            "the social-influence cue (S008's review table; not described in the dossier)"
          );
    case "missed_response_handling":
      return ok({ missed_response_handling: value });
    case "response_key_mapping":
      return sub === "fingers" ? fingers(value) : ok({ response_key_mapping: value });
    case "response_keys":
      return ok({ response_keys: value });
    case "adaptive":
      return value === "fixed"
        ? ok({})
        : gap(
            "option missing",
            "per-participant calibration of the press requirements (Fervaha 2013; the dossier gives no figures): deferred, see DEFAULTS.md"
          );
    case "device_eligibility":
      return value === "computer_only" || value === "none"
        ? ok({ device_eligibility: value })
        : gap("plugin needed", `${value}: not implemented`);
    case "practice_trials":
      return ok({ practice_trials: value });
    case "pretraining":
      return value === "none"
        ? ok({ pretraining: "none" })
        : gap("option missing", "the maximal-pressing pretest of S008 (deferred, see DEFAULTS.md)");
    case "task_end_rule":
      return ok({ task_end_rule: value });
    case "payout_rule":
      return value === "fixed_noncontingent_with_deception"
        ? gap(
            "option missing",
            "a fixed payment presented as contingent (deception): the researcher, not the package, carries it out"
          )
        : ok({ payout_rule: value });
    case "progress_indicator":
      return ok({ progress_indicator: value });
    default:
      return gap("package fix needed", `no adapter entry for ${option}/${sub}`);
  }
}

function medium(value: string): Adapted {
  if (value === "money") return ok({ outcome_type: "money" });
  if (value === "points") return ok({ outcome_type: "points" });
  return gap(
    "option missing",
    `${value}: only money and points are implemented (translate the payout text for other media)`
  );
}

/** USD, EUR and GBP are text: the amount function writes the symbol. */
function currency(value: string): Adapted {
  if (value === "points") return ok({ outcome_type: "points" });
  const symbol = CURRENCY_SYMBOL[value];
  if (!symbol) return gap("package fix needed", `currency ${value}`);
  return ok({ text: { amount: ({ value: v }: { value: number }) => `${symbol}${v.toFixed(2)}` } });
}

/** Finger assignments are instruction text (`text.finger_instruction`): tasks the spec leaves out keep the default. */
function fingers(value: Record<string, string>): Adapted {
  const text = {
    finger_instruction: ({ task }: { task: "easy" | "hard" }) =>
      FINGER_PHRASE[value[task]] ??
      (task === "easy"
        ? "with the index finger of your dominant hand"
        : "with the little finger of your non-dominant hand"),
  };
  return ok({ text });
}

const kit = createAdapterKit<EefrtOptions>({
  mapOptions: [
    "feedback_duration_ms",
    "response_window_ms",
    "difficulty_levels",
    "reward_magnitude",
    "response_key_mapping",
    "practice",
    "text",
  ],
});
export const { mergeOptions, assumedSettings, combine } = kit;

/** Retype one key of a study configuration, e.g. "response_window_ms.easy task". */
export function adaptConfigKey(key: string, value: any): Adapted {
  const dot = key.indexOf(".");
  const option = dot < 0 ? key : key.slice(0, dot);
  const role = dot < 0 ? "main" : key.slice(dot + 1);
  if (value && typeof value === "object" && "untranslated" in value) {
    return gap("option missing", `untyped value: ${JSON.stringify(value.untranslated)}`);
  }
  if (option === "adaptive") return adapt("adaptive", role, value);
  return adapt(option, SUB_BY_ROLE[option]?.[role] ?? "main", value);
}

/** Retype a whole study configuration. */
export function adaptConfig(options: Record<string, any>): ConfigEntry[] {
  return Object.keys(options).map((key) => ({ key, adapted: adaptConfigKey(key, options[key]) }));
}
