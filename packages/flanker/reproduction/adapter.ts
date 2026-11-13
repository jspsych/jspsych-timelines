/**
 * Adapter from the generated spec's typed observed values to FlankerOptions.
 *
 * The spec records some values as free text ("letters X,C / V,B") or under component keys
 * ("stimulus_set.neutral flanker"). This file is the single, hand-written retyping table. Every
 * entry is either a FlankerOptions fragment or a classified gap. Nothing is parsed from prose.
 */
import type { FlankerOptions } from "../src/options";

export type GapClass =
  | "package fix needed"
  | "option missing"
  | "plugin needed"
  | "dossier value wrong"
  | "genuinely contradictory";

export type Adapted =
  | { opts: FlankerOptions; companions?: FlankerOptions }
  | { gap: GapClass; reason: string };

export const isGap = (a: Adapted): a is { gap: GapClass; reason: string } => "gap" in a;

/** Canonical sub-key of an option's component. Observed rows name it by variation, configs by role. */
const SUB_BY_VARIATION: Record<string, string> = {
  warning_cue: "cue",
  stimulus_set: "material",
  flankers_per_side: "flanker",
  neutral_flanker_form: "neutral",
  flanker_spacing: "spacing",
  array_position: "position",
  response_deadline_ms: "deadline",
  deadline_rule: "rule",
  trial_feedback_by_phase: "by_phase",
  trial_feedback_content: "content",
  condition_proportions: "types",
};
const SUB_BY_ROLE: Record<string, string> = {
  "warning cue": "cue",
  stimulus_set: "material",
  flanker: "flanker",
  "neutral flanker": "neutral",
  flanker_spacing: "spacing",
  array_position: "position",
  response_deadline_ms: "deadline",
  deadline_rule: "rule",
  trial_feedback_by_phase: "by_phase",
  trial_feedback_content: "content",
  condition_proportions: "types",
};

export const subFromVariation = (option: string, variation: string): string =>
  SUB_BY_VARIATION[variation] && hasSubs(option) ? SUB_BY_VARIATION[variation] : "main";
export const subFromRole = (option: string, role: string): string =>
  SUB_BY_ROLE[role] && hasSubs(option) ? SUB_BY_ROLE[role] : "main";
function hasSubs(option: string) {
  return [
    "stimulus_set",
    "stimulus_layout",
    "condition_proportions",
    "response_window_ms",
    "trial_feedback",
    "feedback_condition",
  ].includes(option);
}

const LETTERS: Record<string, string[][]> = {
  "letters f/h": [["f"], ["h"]],
  "letters X,C / V,B": [
    ["X", "C"],
    ["V", "B"],
  ],
  "letters H/S": [["H"], ["S"]],
  "letters S/H": [["S"], ["H"]],
};
const NEUTRAL: Record<string, any> = {
  straight_lines: "straight_lines",
  dashes: "dashes",
  blank: "blank",
  squares: "squares",
  "plus signs / diamonds / vertical arrows": ["plus_signs", "diamonds", "vertical_arrows"],
  "unmapped letter (S)": "unmapped_letter",
};
const SPACING: Record<string, any> = {
  "{gap: 2, unit: px}": { gap: 2, unit: "px" },
  adjacent: "adjacent",
  "[0.23, 0.91, 1.59, 2.95, 4.31, 5.67] deg edge-to-edge": {
    gap: [0.23, 0.91, 1.59, 2.95, 4.31, 5.67],
    unit: "deg",
  },
};

const gap = (g: GapClass, reason: string): Adapted => ({ gap: g, reason });
/** `companions` are settings the value needs to be observable; explicit settings override them. */
const ok = (opts: FlankerOptions, companions?: FlankerOptions): Adapted => ({ opts, companions });
const letterTargets = (groups: string[][]): Adapted =>
  ok({ stimulus_set: { target: { letters: groups } } }, { targets_per_response: groups[0].length });

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
    case "cue_target_interval_ms":
      return value === 0
        ? ok({ cue_target_interval_ms: 0 })
        : ok({ cue_target_interval_ms: value }, { stimulus_set: { cue: "circles" } });
    case "feedback_duration_ms":
      return ok({ feedback_duration_ms: value }, { trial_feedback: "accuracy" });
    case "stimulus_set":
      if (sub === "material") {
        if (value === "arrows") return ok({ stimulus_set: { target: "arrows" } });
        if (LETTERS[value]) return letterTargets(LETTERS[value]);
        return gap(
          "option missing",
          "picture stimuli with a location judgement are a different variant (S069)"
        );
      }
      if (sub === "flanker") {
        if (typeof value === "number")
          return ok({ stimulus_set: { flanker: { per_side: value } } });
        return ok({ stimulus_set: { flanker: value.flanker } });
      }
      if (sub === "neutral") {
        if (!(value in NEUTRAL)) return gap("option missing", `neutral flanker form "${value}"`);
        const letters = value === "unmapped_letter" || value === "unmapped letter (S)";
        return ok(
          { stimulus_set: { neutral_flanker: NEUTRAL[value] } },
          {
            condition_set: ["congruent", "incongruent", "neutral"],
            ...(letters ? { stimulus_set: { target: { letters: [["H"], ["K"]] } } } : {}),
          }
        );
      }
      if (sub === "cue") {
        return value.cue === "none"
          ? ok({ stimulus_set: { cue: "none" } })
          : ok({ stimulus_set: { cue: "circles" } }, { cue_target_interval_ms: 500 });
      }
      break;
    case "stimulus_layout":
      if (sub === "spacing") return ok({ stimulus_layout: { flanker_spacing: SPACING[value] } });
      if (sub === "position") {
        if (value === "vertical (flankers above/below target)") {
          return ok({
            stimulus_layout: { orientation: "vertical", array_position: "centre_at_fixation" },
          });
        }
        return ok({ stimulus_layout: { array_position: value } });
      }
      break;
    case "targets_per_response":
      return value === 1
        ? ok({ targets_per_response: 1 })
        : ok(
            { targets_per_response: 2 },
            {
              stimulus_set: {
                target: {
                  letters: [
                    ["X", "C"],
                    ["V", "B"],
                  ],
                },
              },
            }
          );
    case "concurrent_task":
      return value === "none"
        ? ok({ concurrent_task: "none" })
        : gap(
            "plugin needed",
            "interleaving with the Simon task needs the simon-task package; a flanker-only timeline cannot do it"
          );
    case "condition_proportions":
      if (sub === "types") return ok({ condition_proportions: value });
      if (sub === "cue") {
        return ok(
          { condition_proportions: value },
          { stimulus_set: { cue: "circles" }, cue_target_interval_ms: 500 }
        );
      }
      break;
    case "response_device":
      return ok({ response_device: value });
    case "response_hand":
      if (value === "one-handed vs two-handed (coded across 45 studies)") {
        return gap("dossier value wrong", "a coding scheme across studies, not a setting");
      }
      return ok({ response_hand: value });
    case "response_keys":
      if (value.some((k: string) => /shift/i.test(k))) {
        return gap(
          "plugin needed",
          "jsPsych's keyboard listener reports event.key, which is 'Shift' for both shift keys"
        );
      }
      return ok({ response_keys: value });
    case "response_mapping_counterbalancing":
      return ok(
        { response_mapping_counterbalancing: value },
        { stimulus_set: { target: { letters: [["f"], ["h"]] } } }
      );
    case "rest_breaks":
      return ok({ rest_breaks: value }, { n_blocks: 3 });
    case "block_feedback":
      return ok({ block_feedback: value });
    case "feedback_condition":
      return ok({ feedback_condition: value }, { trial_feedback: "accuracy" });
    case "trial_feedback":
      if (sub === "by_phase") {
        // raw "practice_only": no feedback in the test phase, feedback in practice
        return value === "none"
          ? ok({ trial_feedback: "none" })
          : gap("option missing", "phase scope");
      }
      return ok({ trial_feedback: value });
    case "response_window_ms":
      if (sub === "deadline") return ok({ response_window_ms: value });
      return gap("option missing", "deadline rule");
    default:
      return ok({ [option]: value } as FlankerOptions);
  }
  return gap("package fix needed", `no adapter entry for ${option}/${sub}`);
}

/** Merge option fragments; maps merge one level deep. Later fragments win. */
export function mergeOptions(...parts: FlankerOptions[]): FlankerOptions {
  const out: any = {};
  for (const p of parts) {
    for (const [k, v] of Object.entries(p)) {
      if (["stimulus_set", "stimulus_layout", "practice"].includes(k) && out[k]) {
        const prev = out[k];
        out[k] = { ...prev, ...(v as object) };
        if (k === "stimulus_set" && (v as any).flanker && prev.flanker) {
          out[k].flanker = { ...prev.flanker, ...(v as any).flanker };
        }
      } else out[k] = v;
    }
  }
  return out;
}

/** Combine adapted entries: companions first (weakest), then the explicit settings in order. */
export function combine(entries: Adapted[]): FlankerOptions {
  const primaries = entries.filter(
    (e): e is { opts: FlankerOptions; companions?: FlankerOptions } => !isGap(e)
  );
  const explicit = mergeOptions(...primaries.map((e) => e.opts));
  const comps: FlankerOptions[] = [];
  for (const e of primaries) {
    if (!e.companions) continue;
    const c: any = { ...e.companions };
    for (const k of Object.keys(c)) {
      if (k === "condition_set" && "condition_proportions" in explicit) delete c[k];
      else if (k !== "stimulus_set" && k in explicit) delete c[k];
    }
    comps.push(c);
  }
  return mergeOptions(...comps, explicit);
}

/** Retype one key of a study configuration, e.g. "stimulus_set.neutral flanker". */
export function adaptConfigKey(key: string, value: any): Adapted {
  if (key === "practice.trial_feedback") return ok({ practice: { trial_feedback: value } });
  const dot = key.indexOf(".");
  const option = dot < 0 ? key : key.slice(0, dot);
  const role = dot < 0 ? "main" : key.slice(dot + 1);
  const sub = dot < 0 ? "main" : subFromRole(option, role);
  if (value && typeof value === "object" && "untranslated" in value) {
    return gap("option missing", `untyped value: ${JSON.stringify(value.untranslated)}`);
  }
  return adapt(option, sub, value);
}

export interface ConfigEntry {
  key: string;
  adapted: Adapted;
}

/**
 * Retype a whole study configuration. Feedback keys interact: when the content applies to practice
 * only (`trial_feedback_by_phase: none`), it becomes the practice override; the spec's separate
 * `practice.trial_feedback` is then a placeholder that contradicts it (dossier note on S019).
 */
export function adaptConfig(options: Record<string, any>): ConfigEntry[] {
  const keys = Object.keys(options);
  const testNone = options["trial_feedback.trial_feedback_by_phase"] === "none";
  const content = options["trial_feedback.trial_feedback_content"];
  return keys.map((key) => {
    if (
      testNone &&
      key === "trial_feedback.trial_feedback_content" &&
      typeof content === "string"
    ) {
      return { key, adapted: ok({ practice: { trial_feedback: content } }) };
    }
    if (
      testNone &&
      key === "practice.trial_feedback" &&
      typeof content === "string" &&
      content !== options[key]
    ) {
      return {
        key,
        adapted: gap(
          "dossier value wrong",
          `practice.trial_feedback "${options[key]}" is a placeholder; the content is "${content}" (dossier translation note)`
        ),
      };
    }
    return { key, adapted: adaptConfigKey(key, options[key]) };
  });
}
