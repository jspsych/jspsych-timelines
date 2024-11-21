# n-back

Creating template for n-back experiments

## Parameters

Parameter | Type | Default Value | Description
----------|------|---------------|------------
| `stimuli`           | `any`                     |               | Stimuli array used in the N-back task, which can be customized based on the experiment needs. |
| `keyboard_response` | `string`                  | `"space"`     | Key used by participants to respond during trials.                                            |
| `trial_duration`    | `number`                  | `1000` ms     | Duration of each trial in milliseconds.                                                       |
| `post_trial_gap`    | `number`                  | `500` ms      | Gap between trials in milliseconds.                                                           |
| `fixation_duration` | `number`                  | `500` ms      | Duration of the fixation cross before each trial.                                             |
| `n`                 | `number`                  | `2`           | Level of N-back, determining how many trials back the participant should remember.            |
| `num_trials`        | `number`                  | `20`          | Total number of trials in the experiment.                                                     |
| `rep_ratio`         | `number`                  | `0.2`         | Probability that a stimulus will repeat in the N-back sequence, affecting task difficulty.     |
| `debrief`           | `boolean`                 | `false`       | Whether to show a debrief screen at the end of the task.                                      |
| `return_accuracy`   | `boolean`                 | `false`       | Whether to return participant accuracy as part of the output data.                            |
| `data_output`       | `"none"`, `"json"`, `"csv"` | `"none"`    | Specifies the format for saving output data, if any.                                          |
