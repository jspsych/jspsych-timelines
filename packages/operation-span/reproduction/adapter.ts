/**
 * Adapter from the generated spec's typed observed values to OperationSpanOptions.
 *
 * The spec records some values under role keys ("response_device.processing task",
 * "stimulus_set.memorandum_type") or with invented field names ("block_trials"). This file is the
 * single, hand-written retyping table. Every entry is either an options fragment or a classified gap.
 *
 * The spec's vocabulary calls the items to remember "memoranda" (`memorandum_order_in_pair`,
 * `processing_items_per_memorandum`, `memorandum_first`); the package calls them memory items. The spec's
 * names stay on the input side of this table (and in the check names); the options use the package's.
 */
import { createAdapterKit, gap, isGap, ok } from "@jspsych-timelines/testing";
import type {
  Adapted as GenericAdapted,
  ConfigEntry as GenericConfigEntry,
} from "@jspsych-timelines/testing";

import type { OperationSpanOptions, StimulusSet } from "../src/options";
import { digits, letters, words } from "../src/sets";

export type Adapted = GenericAdapted<OperationSpanOptions>;
export type ConfigEntry = GenericConfigEntry<OperationSpanOptions>;
export { isGap };

const SUB_BY_VARIATION: Record<string, string> = {
  processing_deadline_ms: "deadline",
  processing_pacing_rule: "rule",
  memorandum_type: "type",
  memorandum_source: "source",
  recall_input_mode: "recall",
  processing_response_input: "processing",
  processing_practice_trials: "processing",
  practice_structure: "structure",
};
const SUB_BY_ROLE: Record<string, string> = {
  "processing task": "processing",
  processing_deadline_ms: "deadline",
  memorandum_type: "type",
  memorandum: "source",
  recall_input_mode: "recall",
  processing_practice_trials: "processing",
};
const SUBBED = ["response_window_ms", "stimulus_set", "response_device", "practice_trials"];
export const subFromVariation = (option: string, variation: string): string =>
  SUBBED.includes(option) && SUB_BY_VARIATION[variation] ? SUB_BY_VARIATION[variation] : "main";
export const subFromRole = (option: string, role: string): string =>
  SUBBED.includes(option) && SUB_BY_ROLE[role] ? SUB_BY_ROLE[role] : "main";

/** Spec memorandum types -> the bundled set that expresses them (`words` is a stand-in: the studies' lists are not reported). */
export const MEMORY_ITEM_SETS: Record<string, StimulusSet> = {
  letters,
  digits,
  words,
};

/** Set sizes that make `n_test_trials` a multiple of the number of set sizes (trials per set size = n / count). */
const SETS_FOR_N: Record<number, number[]> = {
  9: [3, 4, 5],
  12: [2, 3, 4, 5],
  15: [3, 4, 5, 6, 7],
  18: [4, 5, 6],
  20: [2, 3, 4, 5, 6],
};

const RECALL_KEYBOARD: OperationSpanOptions = { response_device: { recall: "keyboard" } };

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
    case "feedback_duration_ms":
      return ok({ feedback_duration_ms: value }, { trial_feedback: "accuracy" });
    case "inter_item_interval_ms":
      return ok({ inter_item_interval_ms: value });
    case "response_window_ms":
      if (sub === "deadline") return ok({ response_window_ms: value });
      return gap(
        "option missing",
        `pacing rule ${JSON.stringify(
          value
        )}: implemented as a function (utils.deadlines.meanPlusSd), which a typed spec value cannot be`
      );
    case "stimulus_duration_ms":
      return ok({ stimulus_duration_ms: value });
    case "stimulus_language":
      return gap(
        "option missing",
        `"${value}" selects word or sentence lists; none are bundled (supply your own words as a set in stimulus_set)`
      );
    case "stimulus_set":
      if (sub === "type") {
        if (MEMORY_ITEM_SETS[value]) return ok({ stimulus_set: MEMORY_ITEM_SETS[value] });
        return gap(
          "option missing",
          `memory items "${value}" are spatial: they need a location grid or arrow display and a matching recall input`
        );
      }
      // memory items are always separate screens: nothing to set
      if (value === "separate_item") return ok({});
      return gap(
        "option missing",
        "the sentence-final word as memory item is reading span: it needs a sentence processing task"
      );
    case "processing_display_format":
      return value === "equation_and_memorandum_same_screen"
        ? gap(
            "option missing",
            "the memory item shown on the equation's screen (S039, lab) is not implemented"
          )
        : ok({ processing_display_format: value });
    case "memorandum_order_in_pair":
      return ok({ order_in_pair: value === "memorandum_first" ? "memory_item_first" : value });
    case "processing_items_per_memorandum":
      return ok({ processing_items_per_memory_item: value });
    case "block_order":
      return ok({ block_order: value });
    case "n_test_trials":
      return SETS_FOR_N[value]
        ? ok({ n_test_trials: value }, { set_sizes: SETS_FOR_N[value] })
        : gap("package fix needed", `no set_sizes companion for n_test_trials ${value}`);
    case "set_sizes":
      return ok({ set_sizes: value });
    case "trials_per_condition":
      return ok({ trials_per_condition: value });
    case "response_device":
      if (sub === "processing") return ok({ response_device: { processing: value } });
      return value === "keyboard"
        ? ok({ response_device: { recall: "keyboard" } }, { response_format: "free_text" })
        : ok({ response_device: { recall: value } });
    case "response_format":
      return value === "n_afc"
        ? ok({ response_format: value })
        : ok({ response_format: value }, RECALL_KEYBOARD);
    case "recall_omission_handling":
      return value === "question_mark_key"
        ? ok(
            { recall_omission_handling: value },
            { ...RECALL_KEYBOARD, response_format: "free_text" }
          )
        : ok({ recall_omission_handling: value });
    case "practice_criterion":
      // the spec's field `block_trials` is the vocabulary's `window`; the on-fail action is not stated (default: repeat)
      return ok({ practice_criterion: { accuracy: value.accuracy, window: value.block_trials } });
    case "practice_trials":
      if (sub === "processing") return ok({ practice_trials: value });
      return gap("package fix needed", "practice structure labels are typed as null in the spec");
    case "end_of_task_feedback":
      return ok({ end_of_task_feedback: value });
    case "trial_feedback":
      return ok({ trial_feedback: value });
    case "instruction_format":
      return ok({ instruction_format: value });
    default:
      return ok({ [option]: value } as OperationSpanOptions);
  }
}

const kit = createAdapterKit<OperationSpanOptions>({
  mapOptions: ["response_device", "practice"],
});
export const { mergeOptions, assumedSettings, combine } = kit;

/** Retype one key of a study configuration, e.g. "response_device.recall_input_mode". */
export function adaptConfigKey(key: string, value: any): Adapted {
  const dot = key.indexOf(".");
  const option = dot < 0 ? key : key.slice(0, dot);
  const role = dot < 0 ? "main" : key.slice(dot + 1);
  const sub = dot < 0 ? "main" : subFromRole(option, role);
  if (value && typeof value === "object" && "untranslated" in value) {
    const why =
      option === "response_window_ms"
        ? "implemented as a function (utils.deadlines.meanPlusSd); a typed spec value cannot be one"
        : `untyped value: ${JSON.stringify(value.untranslated)}`;
    return gap("option missing", why);
  }
  return adapt(option, sub, value);
}

/** Retype a whole study configuration. */
export function adaptConfig(options: Record<string, any>): ConfigEntry[] {
  return Object.keys(options).map((key) => ({ key, adapted: adaptConfigKey(key, options[key]) }));
}
