/**
 * Adapter from the generated spec's typed observed values to GoNogoOptions.
 *
 * The spec records some values as free text ("letters P / R", "top centre") or under component keys
 * ("condition_proportions.go_probability"). This file is the single, hand-written retyping table. Every
 * entry is either a GoNogoOptions fragment or a classified gap. Nothing is parsed from prose.
 */
import { createAdapterKit, gap, isGap, ok } from "@jspsych-timelines/testing";
import type {
  Adapted as GenericAdapted,
  ConfigEntry as GenericConfigEntry,
} from "@jspsych-timelines/testing";

import type { GoNogoOptions, StimulusItem, StimulusShape } from "../src/options";

export type Adapted = GenericAdapted<GoNogoOptions>;
export type ConfigEntry = GenericConfigEntry<GoNogoOptions>;
export { isGap };

/** Canonical sub-key of an option's component. Observed rows name it by variation, configs by role. */
const SUB_BY_VARIATION: Record<string, string> = {
  stimulus_set: "material",
  n_go_stimulus_types: "go",
  n_nogo_stimulus_types: "nogo",
  go_probability: "go",
  practice_go_probability: "practice_go",
  go_mapping_change_between_blocks: "change",
  response_deadline_rule: "rule",
};
const SUB_BY_ROLE: Record<string, string> = {
  stimulus_set: "material",
  go: "go",
  nogo: "nogo",
  go_probability: "go",
  practice_go_probability: "practice_go",
  go_mapping_change_between_blocks: "change",
  response_deadline_rule: "rule",
};
const HAS_SUBS = [
  "stimulus_set",
  "condition_proportions",
  "stimulus_role_assignment",
  "response_window_ms",
];

export const subFromVariation = (option: string, variation: string): string =>
  SUB_BY_VARIATION[variation] && HAS_SUBS.includes(option) ? SUB_BY_VARIATION[variation] : "main";
export const subFromRole = (option: string, role: string): string =>
  SUB_BY_ROLE[role] && HAS_SUBS.includes(option) ? SUB_BY_ROLE[role] : "main";

const shape = (shape: StimulusShape, color: string): StimulusItem => ({ shape, color });
const text = (t: string): StimulusItem => ({ text: t });

/** The stimulus sets the spec describes in words, as `stimulus_set` fragments. */
const MATERIAL: Record<string, GoNogoOptions["stimulus_set"]> = {
  "coloured squares (orange/blue)": {
    go: shape("square", "blue"),
    nogo: shape("square", "orange"),
  },
  "letters P / R": { go: text("P"), nogo: text("R") },
  "words Go / No go": { go: text("Go"), nogo: text("No go") },
  "coloured circles (blue go / orange no-go)": {
    go: shape("circle", "blue"),
    nogo: shape("circle", "orange"),
  },
  "letters (A, B, C go; X no-go)": { go: [text("A"), text("B"), text("C")], nogo: text("X") },
  "green circle go / red X no-go": {
    go: shape("circle", "green"),
    nogo: { shape: "cross", color: "red" },
  },
};
const IMAGE_SETS = [
  "faces: gender (cold) or emotion (hot)",
  "line drawings (car go / dog no-go)",
  "emoticon cat face x parachute colour conjunctions",
];

const COLORS = ["blue", "green", "purple", "teal"];
const OTHER_COLORS = ["orange", "red", "brown", "gold", "pink"];
/** `n` distinct coloured squares, the first colours of a list that does not clash with the other role's default. */
const items = (n: number, colors: string[]): StimulusItem[] =>
  Array.from({ length: n }, (_, i) => shape("square", colors[i]));

const round = (x: number) => Math.round(x * 1e6) / 1e6;
const proportions = (go: number) => ({ go, nogo: round(1 - go) });

/**
 * Retype one observed value. `value` is the spec's typed value, `raw` its source text.
 * The returned options contain the value plus the companion settings the single value needs to be
 * observable (for example, feedback duration needs feedback switched on).
 */
export function adapt(
  option: string,
  sub: string,
  value: any,
  phase: string | null = null
): Adapted {
  switch (option) {
    case "feedback_duration_ms":
      // the spec gives it for practice feedback; the check reads the test phase, so it is set at the top level
      return ok({ feedback_duration_ms: value }, { trial_feedback: "accuracy" });
    case "iti_ms":
      return ok({ iti_ms: value });
    case "pre_block_countdown_ms":
      return ok({ pre_block_countdown_ms: value });
    case "response_window_ms":
      if (sub === "rule")
        return gap(
          "option missing",
          "a deadline from short-SOA go RT is code-only: utils.deadlines.meanPlusSd(2) or percentile(90), not a typed value"
        );
      return value === null
        ? // no limit: the trial ends on a response, and a no-go trial would never end
          ok(
            { response_window_ms: null },
            { trial_termination_rule: "response_or_timeout", condition_proportions: { go: 1 } }
          )
        : ok({ response_window_ms: value });
    case "stimulus_duration_ms":
      // a stimulus longer than the default window needs a window at least as long
      return typeof value === "number" && value > 1000
        ? ok({ stimulus_duration_ms: value }, { response_window_ms: value })
        : ok({ stimulus_duration_ms: value });
    case "trial_termination_rule":
      return ok({ trial_termination_rule: value });
    case "stimulus_layout":
      if (value === "center") return ok({ stimulus_layout: "center" });
      if (value === "top centre") return ok({ stimulus_layout: "top_center" });
      if (value === "random cell of a 2x2 grid") return ok({ stimulus_layout: "random_2x2_grid" });
      return gap("option missing", "a rendered 3D scene is not a layout this package draws");
    case "stimulus_modality":
      return value === "visual"
        ? ok({ stimulus_modality: "visual" })
        : gap("plugin needed", "auditory stimuli need an audio plugin trial type");
    case "stimulus_set":
      if (sub === "material") {
        if (MATERIAL[value]) return ok({ stimulus_set: MATERIAL[value] });
        if (IMAGE_SETS.includes(value))
          return gap(
            "option missing",
            `no bundled pictures for "${value}"; pass the study's pictures as image items in stimulus_set.go and stimulus_set.nogo`
          );
        if (/3D room/.test(value))
          return gap("option missing", `picture stimuli (${value}) are not drawn by this package`);
        return gap(
          "option missing",
          `the dossier gives no symbols for "${value}", so the stimuli cannot be built`
        );
      }
      if (sub === "go") return ok({ stimulus_set: { go: items(value, COLORS) } });
      if (sub === "nogo") return ok({ stimulus_set: { nogo: items(value, OTHER_COLORS) } });
      break;
    case "inter_trial_display":
      if (value === "blank") return ok({ inter_trial_display: "blank" });
      if (value === "fixation_cross") {
        // visible in the ITI, and while the stimulus is off
        return ok({ inter_trial_display: "fixation_cross" }, { iti_ms: 500 });
      }
      return gap("option missing", "a placeholder grid with stars is not implemented");
    case "condition_proportions":
      if (sub === "practice_go")
        return ok({ practice: { condition_proportions: proportions(value) } });
      return ok({ condition_proportions: proportions(value) });
    case "n_blocks":
    case "n_test_trials":
    case "practice_trials":
      return ok({ [option]: value });
    case "sequence_constraints":
      // run_length cannot give the default 90% go: runs of 1, 3 or 5 go before each no-go need about 75%
      return value?.run_length
        ? ok({ sequence_constraints: value }, { condition_proportions: proportions(0.75) })
        : ok({ sequence_constraints: value });
    case "single_task_blocks":
      return ok({ single_task_blocks: value });
    case "stimulus_role_assignment":
      if (sub === "change") {
        // "none"/"fixed": the go mapping does not change between blocks, which is how this package always works
        if (value === "fixed" || value === "none") return ok({}, { n_blocks: 3 });
        return gap(
          "package fix needed",
          "a reversal of the go mapping between blocks (rotated) is not implemented"
        );
      }
      if (value === "counterbalanced")
        return gap(
          "plugin needed",
          "counterbalancing needs a participant counter from outside jsPsych"
        );
      return ok({ stimulus_role_assignment: value });
    case "trial_order":
      return ok({ trial_order: value });
    case "response_device":
      return ok({ response_device: value });
    case "block_feedback":
      return ok({ block_feedback: value }, { n_blocks: 2 });
    case "feedback_condition":
      return ok({ feedback_condition: value }, { trial_feedback: "accuracy" });
    case "trial_feedback":
      return ok({ trial_feedback: value });
    case "response_acknowledgement":
    case "rule_reminder":
    case "speed_accuracy_emphasis":
      return ok({ [option]: value });
    default:
      return ok({ [option]: value } as GoNogoOptions);
  }
  return gap("package fix needed", `no adapter entry for ${option}/${sub}`);
}

const kit = createAdapterKit<GoNogoOptions>({
  mapOptions: ["stimulus_set", "practice", "condition_proportions"],
  // a companion go-only proportion would contradict explicit proportions
  dropCompanion: () => false,
});
export const { mergeOptions, assumedSettings, combine } = kit;

/** Retype one key of a study configuration, e.g. "condition_proportions.go_probability". */
export function adaptConfigKey(key: string, value: any): Adapted {
  let rest = key;
  let practice = false;
  if (rest.startsWith("practice.")) {
    practice = true;
    rest = rest.slice("practice.".length);
  } else if (rest.startsWith("test.")) {
    rest = rest.slice("test.".length);
  }
  const dot = rest.indexOf(".");
  const option = dot < 0 ? rest : rest.slice(0, dot);
  const role = dot < 0 ? "main" : rest.slice(dot + 1);
  const sub = dot < 0 ? "main" : subFromRole(option, role);
  if (value && typeof value === "object" && "untranslated" in value) {
    return gap("option missing", `untyped value: ${JSON.stringify(value.untranslated)}`);
  }
  if (practice && option !== "condition_proportions") {
    // a practice-only value: the practice override
    return ok({ practice: { [option]: value } });
  }
  if (practice) return adapt(option, "practice_go", value, "practice");
  return adapt(option, sub, value);
}

/** Retype a whole study configuration. */
export function adaptConfig(options: Record<string, any>): ConfigEntry[] {
  return Object.keys(options).map((key) => ({ key, adapted: adaptConfigKey(key, options[key]) }));
}
