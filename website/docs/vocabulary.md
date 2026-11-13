---
title: About the options vocabulary
sidebar_label: Options vocabulary
---

# About the options vocabulary

Options that mean the same thing in different tasks have the same name, type and absent value in every package. A researcher who learns one package has then learned most of the others. The shared list is [`vocabulary/vocabulary.yaml`](https://github.com/jspsych/jspsych-timelines/blob/main/vocabulary/vocabulary.yaml). It holds 148 parameters, each with a name, layer, type, unit, definition, allowed values and absent value. The rules are in [`vocabulary/RULES.md`](https://github.com/jspsych/jspsych-timelines/blob/main/vocabulary/RULES.md).

The vocabulary comes from a structured survey of how researchers vary 79 RDoC tasks in recent online studies and openly licensed reference implementations. Three independent passes standardized it across tasks, a human decided each contested rule, and a final pass reconciled the result.

## Conventions

These come from PACKAGE-STANDARD section 2a.

- **Names.** If an option is one of the vocabulary's concepts, use its name, for example `response_window_ms`, `iti_ms`, `practice_trials`, `trial_feedback`. Names are snake_case. Units go in the name (`_ms`), never in the value.
- **Absence is a value, typed by meaning.** There are no on/off booleans such as `show_fixation`.

  | Kind | Absent value | Example |
  |---|---|---|
  | Enum | `"none"` | `trial_feedback: "none"` |
  | Limit whose absence means "no limit" | `null` | `response_window_ms: null` |
  | Event whose absence means "doesn't happen" | `0` | `fixation_duration_ms: 0` |
  | Bundle switched off | `null` | `adaptive: null` |

  An option that is not given (`undefined`) always means "use the default".
- **Phase overrides, not phase names.** A package with a practice phase accepts `practice?: Partial<Options>`. Its values override the main options during practice, as in `{ trial_feedback: "none", practice: { trial_feedback: "accuracy" } }`. `practice_trials` is a separate count, not an override.
- **Task vocabulary goes in values, not names.** Options that cover several stimulus kinds take a map keyed by the task's own terms, such as `condition_proportions: { stop: 0.25, go: 0.75 }`.
- **Bundle only what is configured as a unit.** An adaptive procedure is one `adaptive` option. Settings changed one at a time stay flat.
- **Response is device plus format.** `response_device` takes `keyboard`, `mouse`, `touch`, `microphone`, `eye_tracker` or `gamepad`. `response_format` takes `single_response`, `n_afc`, `rating`, `free_text`, `location` or `none`.
- **Defaults are evidence-based and documented.** Each option's doc comment gives its default and where the default came from.

:::note Packages are mid-migration
Existing packages still use camelCase names (the flanker page shows these). They will be renamed to follow this vocabulary.
:::
