/**
 * Options for the go/no-go timeline.
 *
 * Every default below states its source. The anchor is the Expfactory go_nogo task (S022), chosen by
 * the spec generator (typicality .96, no escalation). Defaults that differ from the generated spec
 * are listed with reasons in packages/go-nogo/DEFAULTS.md.
 */
import type { TextConfig } from "./text";

// -- value types --------------------------------------------------------------------------------

/** Trial types in `condition_proportions`. Go-only baseline trials are recorded as `go_control` and are never a proportion key. */
export type GoNogoCondition = "go" | "nogo";

/** Fixed duration, or a uniform jitter range sampled in `step` increments. */
export type DurationOrJitter = number | { min: number; max: number; step?: number };

export type StimulusShape = "square" | "circle" | "triangle" | "diamond" | "cross";

/**
 * One stimulus: a shape in a colour, or text (a letter or word). Text can have a colour too.
 * `label` names the stimulus in the data and the instructions; without it the name is built from
 * the colour and shape ("blue square") or is the text.
 */
export interface StimulusItem {
  shape?: StimulusShape;
  /** Any CSS colour. */
  color?: string;
  text?: string;
  label?: string;
}

/** Stimuli of each trial type: one item, or a list that is cycled through (balanced within a block). */
export interface GoNogoStimulusSet {
  /**
   * Stimuli to respond to. (default: one blue square; which of the two default squares is the go
   * stimulus is drawn once per participant, see `stimulus_role_assignment`. Expfactory go_nogo, S022)
   */
  go?: StimulusItem | StimulusItem[];
  /** Stimuli to withhold the response to. (default: one orange square; S022) */
  nogo?: StimulusItem | StimulusItem[];
}

/** Where the stimulus appears. */
export type StimulusLayout = "center" | "top_center" | "random_2x2_grid";

/** The ordering rules of `sequence_constraints` (PACKAGE-STANDARD §2a), applied to the trial type of each trial. */
export interface SequenceConstraints {
  /** At most n consecutive trials of the same trial type, or of each listed trial type. */
  max_run?: number | Record<string, number>;
  /** At least n other trials between two trials of that trial type. */
  min_gap?: Record<string, number>;
  /** At most n other trials between two trials of that trial type. */
  max_gap?: Record<string, number>;
  /** Runs of that trial type only have these lengths (the last run of the sequence is exempt). */
  run_length?: Record<string, number[]>;
  /** Each block starts with n trials of that trial type (one key). */
  start_with?: Record<string, number>;
  /** No trial type repeats on consecutive trials (`true`), or none of the listed trial fields does (`condition`, `stimulus`, `stimulus_location`). */
  no_immediate_repeat?: true | string[];
  /** Each trial type follows each trial type equally often (within 1). */
  balanced_transitions?: true;
  /** Every consecutive n trials of a block hold the block's proportions exactly (the last chunk of a block may be shorter). */
  cycle_length?: number;
}

/** Context passed to a function-valued option (PACKAGE-STANDARD §2a). */
export interface OptionContext {
  /**
   * The jsPsych instance. Typed loosely so the options type can be turned into a schema for the docs site;
   * read the data so far with `jsPsych.data.get()` and draw with `jsPsych.randomization`.
   */
  jsPsych: { data: { get: () => any }; randomization: any };
  phase: "practice" | "test";
  block: number;
  trial_index_in_block: number;
}

/** A response window computed during the session: called at the start of each trial, returns ms. */
export type ResponseWindowFunction = ((ctx: OptionContext) => number) & { label?: string };

export interface GoNogoOptions {
  // -- timing --
  /**
   * How long trial feedback stays on screen. A `{min, max, step}` object draws a uniform jitter per trial.
   * (default: 1000 — Expfactory go_nogo, S022, which shows feedback in practice only; also 500 ms in S183)
   */
  feedback_duration_ms?: DurationOrJitter;
  /**
   * Blank (or fixation) interval after the trial (and its feedback); 0 = none. A `{min, max, step}`
   * object draws a uniform jitter per trial.
   * (default: 0 — Expfactory go_nogo, S022; the other studies use 500 to 1700 ms)
   */
  iti_ms?: DurationOrJitter;
  /**
   * Length of a 'get ready' screen before each block (practice and test); 0 = none.
   * (default: 0 — Expfactory go_nogo, S022; PEBL (S028) has a countdown whose length the dossier does not give)
   */
  pre_block_countdown_ms?: number;
  /**
   * Time allowed to respond, from stimulus onset. A number, a `{min, max, step}` jitter range sampled per
   * trial, `null` for no limit (only with `trial_termination_rule: "response_or_timeout"` and no
   * no-go trials), or a function that returns the window when each trial starts, such as
   * `utils.deadlines.meanPlusSd(2.5)`. Misses are recorded as `timeout: true`.
   * (default: { min: 1000, max: 1500 } — Expfactory go_nogo, S022; fixed windows of 1000 to 2000 ms in S028, S031, S175, S183)
   */
  response_window_ms?: DurationOrJitter | null | ResponseWindowFunction;
  /**
   * How long the stimulus stays visible; null = until the end of the trial. Must not exceed the shortest
   * response window.
   * (default: 750 — Expfactory go_nogo, S022; 200 to 2000 ms in the other studies)
   */
  stimulus_duration_ms?: number | null;
  /**
   * What ends the trial. "fixed_duration": the trial lasts the whole response window, a response does
   * not end it; "response_or_timeout": a response or the end of the window ends it; "response_terminated"
   * is not implemented (a no-go trial has no response to end it).
   * (default: "fixed_duration" — the spec's fill-in value, 1/2 studies; Expfactory (S022) does not say)
   */
  trial_termination_rule?: "response_terminated" | "fixed_duration" | "response_or_timeout";

  // -- stimulus --
  /**
   * What the screen shows between stimuli: "blank", or "fixation_cross" (shown in the ITI, and while the
   * stimulus is off when `stimulus_duration_ms` ends before the window). "placeholder grid" is not implemented.
   * (default: "blank" — Expfactory go_nogo, S022; fixation cross in S054)
   */
  inter_trial_display?: "blank" | "fixation_cross";
  /**
   * Where the stimulus appears: "center", "top_center", or "random_2x2_grid" (a random cell of a 2x2 grid
   * per trial, recorded in `stimulus_location`). The 3D scene of S183 is not implemented.
   * (default: "center" — Expfactory go_nogo, S022)
   */
  stimulus_layout?: StimulusLayout;
  /** Visual only; "auditory", "audiovisual" and "tactile" are not implemented. (default: "visual" — S022) */
  stimulus_modality?: "visual" | "auditory" | "audiovisual" | "tactile";
  /** Stimulus material, keyed by trial type: `{ go, nogo }`. A key given here replaces the matching default. */
  stimulus_set?: GoNogoStimulusSet;

  // -- design --
  /**
   * Proportion of each trial type per block: `{ go: 0.9, nogo: 0.1 }`. Normalised to sum 1; counts per block use
   * largest remainders (except `trial_order: "random"`). Both keys are needed. A list of maps per block is not implemented.
   * (default: { go: 0.9, nogo: 0.1 } — Expfactory go_nogo, S022; the studies range from 0.25 to 0.9, median 0.75.
   * Practice default { go: 0.5, nogo: 0.5 }, S022)
   */
  condition_proportions?: Partial<Record<GoNogoCondition, number>>;
  /**
   * Number of test blocks.
   * (default: 1 — Expfactory go_nogo, S022; 2 to 8 in the other studies)
   */
  n_blocks?: number;
  /**
   * Scored test trials in total (split over blocks; each block follows the proportions).
   * (default: 350 — Expfactory go_nogo, S022; 40 to 600 in the other studies)
   */
  n_test_trials?: number;
  /**
   * Ordering rules within each block, and across block boundaries for the neighbour rules, applied to the trial type
   * (`go`, `nogo`): `{ max_run: { nogo: 2 }, min_gap: { nogo: 3 } }` (S157), `{ run_length: { go: [1, 3, 5] } }` (S207).
   * Applies to the test phase; practice is unconstrained unless `practice.sequence_constraints` is set.
   * An order the rules cannot satisfy throws at `createTimeline`, naming the rule.
   * (default: {} — no ordering rules; Expfactory go_nogo, S022, draws at random)
   */
  sequence_constraints?: SequenceConstraints | null;
  /**
   * Go-only baseline blocks of 16 go trials each: "before_dual" (one before the test blocks), "after_dual",
   * "interleaved" (one before each test block). They are not counted in `n_blocks` or `n_test_trials`, are
   * scored separately (`condition: "go_control"`, `block: null`), and use the test options. Named for the dual-task
   * designs of the vocabulary; in this task there is no dual task.
   * (default: "none" — Expfactory go_nogo, S022; S183 uses go-only blocks)
   */
  single_task_blocks?: "none" | "before_dual" | "after_dual" | "interleaved";
  /**
   * How the go and no-go stimulus sets are assigned: "fixed" (as given), "random_per_participant" (the two sets
   * swap roles with probability .5, drawn once), "counterbalanced" and "rotated" are not implemented.
   * (default: "random_per_participant" — Expfactory go_nogo, S022; fixed in S028)
   */
  stimulus_role_assignment?: "fixed" | "random_per_participant" | "counterbalanced" | "rotated";
  /**
   * Order within a block: "shuffled_list" (exact counts, shuffled), "random" (independent draws), "fixed_sequence"
   * (exact counts, the same order for every participant).
   * (default: "shuffled_list" — differs from the spec's "random" (S022): independent draws can give a block with no
   * no-go trial and inexact proportions; see DEFAULTS.md)
   */
  trial_order?: "random" | "shuffled_list" | "fixed_sequence";

  // -- response --
  /**
   * "keyboard" uses `response_keys`; "mouse" and "touch" use one on-screen button. The others are not implemented.
   * (default: "keyboard" — spacebar in Expfactory go_nogo, S022)
   */
  response_device?: "keyboard" | "mouse" | "touch" | "microphone" | "eye_tracker" | "gamepad";
  /**
   * The key to press for go (a list of one key). Letters, digits, space or named keys such as "ArrowUp".
   * (default: [" "] — the spacebar, S022 and most studies)
   */
  response_keys?: string[];

  // -- procedure --
  /**
   * Practice trials before the test; 0 = no practice. One block.
   * (default: 10 — Expfactory go_nogo, S022; 6 to 40 in the other studies)
   */
  practice_trials?: number;

  // -- feedback --
  /**
   * Summary screen after each test block (accuracy is the proportion of trials answered correctly, RT the mean
   * correct go RT). "points" is not implemented.
   * (default: "none" — Expfactory go_nogo, S022; S183 and S017 show RT and error rate)
   */
  block_feedback?: "none" | "accuracy" | "rt" | "accuracy_rt" | "points" | "progress";
  /**
   * On which trials trial feedback is shown (misses count as errors). Ignored when `trial_feedback` is "none".
   * (default: "all" — correct and incorrect feedback in S022's practice)
   */
  feedback_condition?: "all" | "errors_only" | "correct_only";
  /** Visual echo of a registered response: "highlight" rings the stimulus, "keypress_mark" shows a mark under it. (default: "none" — S022; highlight in S028, S046) */
  response_acknowledgement?: "none" | "keypress_mark" | "highlight";
  /**
   * What trial feedback shows. "points" and "reward_outcome" are not implemented.
   * (default: "none" — S022 gives no feedback in the test phase; practice default below)
   */
  trial_feedback?:
    | "none"
    | "accuracy"
    | "rt"
    | "accuracy_rt"
    | "points"
    | "reward_outcome"
    | "correct_answer";

  // -- instructions --
  /**
   * "text" shows instruction pages; "experimenter" shows none. Others are not implemented.
   * (default: "text")
   */
  instruction_format?: "text" | "audio" | "video" | "experimenter";
  /**
   * Walkthrough between the instruction pages and practice (PACKAGE-STANDARD §6a). "interactive": one untimed step
   * per stimulus (a go stimulus asks for the response; a no-go step waits 2.5 s for you not to respond), drawn with the
   * task's own renderer; a wrong response shows a hint and repeats the step (at most 3 attempts). "examples": the same stimuli as
   * static pages. "none": instruction pages only. "animated" and "guided_trial" are not implemented.
   * (default: "interactive" — a documented exception to the evidence-anchored defaults (PACKAGE-STANDARD §6a);
   * set "none" to reproduce the text-only instructions of the studies)
   */
  instruction_demonstration?: "none" | "examples" | "animated" | "guided_trial" | "interactive";
  /** On-screen reminder of the rule under the stimulus on every trial. (default: "none" — S022; on in S028) */
  rule_reminder?: "none" | "on_screen";
  /**
   * Emphasis sentence in the instructions.
   * (default: "speed" — the spec's fill-in value, 1/2 studies (S157); S017 says both)
   */
  speed_accuracy_emphasis?: "speed" | "accuracy" | "both" | "none";

  // -- phase overrides and text --
  /**
   * Overrides for the practice phase. Honoured: trial_feedback, feedback_condition, feedback_duration_ms,
   * response_window_ms, iti_ms, stimulus_duration_ms, trial_termination_rule, inter_trial_display, condition_proportions,
   * trial_order, sequence_constraints. Other keys are ignored in practice.
   * (default: { trial_feedback: "accuracy", condition_proportions: { go: 0.5, nogo: 0.5 } } — feedback and equal
   * proportions in practice only, as in Expfactory go_nogo (S022); the feedback is correct/incorrect without RT. A value set at the top level
   * or in `practice` replaces the matching default. `sequence_constraints` set at the top level applies to the test only.)
   */
  practice?: Partial<GoNogoOptions>;
  /** Custom text strings for translation. Partial objects are merged with defaults. */
  text?: Partial<TextConfig>;
}

/** Options that can differ between practice and test (the keys `practice` honours). */
export const PHASE_OPTIONS = [
  "trial_feedback",
  "feedback_condition",
  "feedback_duration_ms",
  "response_window_ms",
  "iti_ms",
  "stimulus_duration_ms",
  "trial_termination_rule",
  "inter_trial_display",
  "condition_proportions",
  "trial_order",
  "sequence_constraints",
] as const;

export type PhaseOptionKey = (typeof PHASE_OPTIONS)[number];

export type ResolvedOptions = Required<Omit<GoNogoOptions, "practice" | "text">> & {
  stimulus_set: { go: StimulusItem[]; nogo: StimulusItem[] };
  condition_proportions: Record<GoNogoCondition, number>;
};

export const DEFAULT_OPTIONS: ResolvedOptions & { practice: Partial<GoNogoOptions> } = {
  feedback_duration_ms: 1000,
  iti_ms: 0,
  pre_block_countdown_ms: 0,
  response_window_ms: { min: 1000, max: 1500 },
  stimulus_duration_ms: 750,
  trial_termination_rule: "fixed_duration",
  inter_trial_display: "blank",
  stimulus_layout: "center",
  stimulus_modality: "visual",
  stimulus_set: {
    go: [{ shape: "square", color: "blue" }],
    nogo: [{ shape: "square", color: "orange" }],
  },
  condition_proportions: { go: 0.9, nogo: 0.1 },
  n_blocks: 1,
  n_test_trials: 350,
  sequence_constraints: {},
  single_task_blocks: "none",
  stimulus_role_assignment: "random_per_participant",
  trial_order: "shuffled_list",
  response_device: "keyboard",
  response_keys: [" "],
  practice_trials: 10,
  block_feedback: "none",
  feedback_condition: "all",
  response_acknowledgement: "none",
  trial_feedback: "none",
  instruction_format: "text",
  instruction_demonstration: "interactive",
  rule_reminder: "none",
  speed_accuracy_emphasis: "speed",
  practice: { trial_feedback: "accuracy", condition_proportions: { go: 0.5, nogo: 0.5 } },
};

// -- resolution ---------------------------------------------------------------------------------

const NOT_IMPLEMENTED: Array<[keyof ResolvedOptions, string[], string]> = [
  [
    "trial_termination_rule",
    ["response_terminated"],
    "a no-go trial has no response to end it; use fixed_duration or response_or_timeout",
  ],
  [
    "stimulus_modality",
    ["auditory", "audiovisual", "tactile"],
    "only visual stimuli are implemented",
  ],
  [
    "response_device",
    ["microphone", "eye_tracker", "gamepad"],
    "only keyboard, mouse and touch are implemented",
  ],
  ["block_feedback", ["points"], "go/no-go has no points"],
  ["trial_feedback", ["points", "reward_outcome"], "go/no-go has no points or reward"],
  [
    "stimulus_role_assignment",
    ["counterbalanced", "rotated"],
    "counterbalanced needs an external participant counter (use random_per_participant); a reversal between blocks (rotated) is not implemented",
  ],
  [
    "instruction_format",
    ["audio", "video"],
    "no media is bundled; supply your own instruction trials",
  ],
  [
    "instruction_demonstration",
    ["animated", "guided_trial"],
    "use interactive (real stimuli, repeat until correct), examples or none",
  ],
];

/** Wrap a single stimulus item into a list. */
function asList(
  x: StimulusItem | StimulusItem[] | undefined,
  fallback: StimulusItem[]
): StimulusItem[] {
  if (x === undefined) return fallback;
  return Array.isArray(x) ? x : [x];
}

/**
 * Resolve user options into complete options for one phase. Precedence, highest first: the user's
 * `practice` value, the user's top-level value, the package's practice default, the package's default.
 * `sequence_constraints` is the exception: at the top level it applies to the test only.
 */
export function resolveOptions(
  user: GoNogoOptions = {},
  phase: "practice" | "test" = "test"
): ResolvedOptions {
  const { practice, text: _text, ...top } = user;
  const topKeys = new Set(Object.keys(top).filter((k) => (top as any)[k] !== undefined));
  let layer: Partial<GoNogoOptions> = { ...top };

  if (phase === "practice") {
    delete layer.sequence_constraints; // the literature's orderings are of the test sequence
    const practiceKeys = new Set(Object.keys(practice ?? {}));
    const defaultPractice: Partial<GoNogoOptions> = {};
    for (const [k, v] of Object.entries(DEFAULT_OPTIONS.practice)) {
      if (!topKeys.has(k) && !practiceKeys.has(k)) (defaultPractice as any)[k] = v;
    }
    layer = { ...layer, ...defaultPractice, ...(practice ?? {}) };
  }

  const merged: any = { ...DEFAULT_OPTIONS };
  delete merged.practice;
  for (const [k, v] of Object.entries(layer)) if (v !== undefined) merged[k] = v;
  merged.stimulus_set = {
    go: asList(layer.stimulus_set?.go, DEFAULT_OPTIONS.stimulus_set.go),
    nogo: asList(layer.stimulus_set?.nogo, DEFAULT_OPTIONS.stimulus_set.nogo),
  };
  const props = layer.condition_proportions;
  if (props !== undefined) {
    if (Array.isArray(props)) {
      throw new Error(
        "go-nogo: condition_proportions: a list of maps (one per block) is not implemented; give one map."
      );
    }
    const keys = Object.keys(props);
    const bad = keys.filter((k) => k !== "go" && k !== "nogo");
    if (bad.length) {
      throw new Error(
        `go-nogo: condition_proportions: unknown trial type ${bad.join(", ")} (use go and nogo).`
      );
    }
    if (Object.values(props).some((v) => v !== null && typeof v === "object")) {
      throw new Error("go-nogo: condition_proportions: crossed factors are not used by this task.");
    }
    merged.condition_proportions = { go: props.go ?? 0, nogo: props.nogo ?? 0 };
    if (keys.length === 1) {
      // one trial type given: the other is the rest
      const given = keys[0] as GoNogoCondition;
      const p = props[given] as number;
      if (p > 1)
        throw new Error("go-nogo: condition_proportions: a single proportion must be at most 1.");
      merged.condition_proportions =
        given === "go" ? { go: p, nogo: 1 - p } : { go: 1 - p, nogo: p };
    }
  }
  return merged as ResolvedOptions;
}

const stimulusKey = (i: StimulusItem) => i.label ?? JSON.stringify([i.shape, i.color, i.text]);

/** Throw on values the package cannot honour or combinations that contradict each other. */
export function validateOptions(o: ResolvedOptions): void {
  for (const [key, values, why] of NOT_IMPLEMENTED) {
    if (values.includes(o[key] as string)) {
      throw new Error(`go-nogo: ${key}: "${o[key]}" is not implemented (${why}).`);
    }
  }
  if (o.inter_trial_display !== "blank" && o.inter_trial_display !== "fixation_cross") {
    throw new Error(
      `go-nogo: inter_trial_display: "${o.inter_trial_display}" is not implemented (use blank or fixation_cross).`
    );
  }
  if (!["center", "top_center", "random_2x2_grid"].includes(o.stimulus_layout)) {
    throw new Error(
      `go-nogo: stimulus_layout: "${o.stimulus_layout}" is not implemented (use center, top_center or random_2x2_grid).`
    );
  }
  if (!Array.isArray(o.response_keys) || o.response_keys.length !== 1) {
    throw new Error("go-nogo: response_keys must list exactly one key (the go response).");
  }
  if (!(o.n_blocks >= 1) || !Number.isInteger(o.n_blocks)) {
    throw new Error("go-nogo: n_blocks must be a positive integer.");
  }
  const { go, nogo } = o.condition_proportions;
  if (!(go >= 0) || !(nogo >= 0) || !(go + nogo > 0)) {
    throw new Error("go-nogo: condition_proportions must be non-negative and sum to more than 0.");
  }
  if (o.stimulus_set.go.length === 0 || o.stimulus_set.nogo.length === 0) {
    throw new Error("go-nogo: stimulus_set needs at least one go and one no-go stimulus.");
  }
  const overlap = o.stimulus_set.go.filter((g) =>
    o.stimulus_set.nogo.some((n) => stimulusKey(n) === stimulusKey(g))
  );
  if (overlap.length) {
    throw new Error("go-nogo: stimulus_set: a stimulus is both a go and a no-go stimulus.");
  }
  const w = o.response_window_ms;
  const termination = o.trial_termination_rule;
  if (w === null) {
    if (termination === "fixed_duration") {
      throw new Error(
        'go-nogo: response_window_ms is null but trial_termination_rule is "fixed_duration": the trial would never end.'
      );
    }
    if (nogo > 0) {
      throw new Error(
        "go-nogo: response_window_ms is null but condition_proportions has no-go trials: a no-go trial would never end."
      );
    }
  }
  if (o.stimulus_duration_ms !== null && o.stimulus_duration_ms !== undefined) {
    if (!(o.stimulus_duration_ms > 0)) {
      throw new Error("go-nogo: stimulus_duration_ms must be positive or null.");
    }
    const shortest =
      typeof w === "number" ? w : w && typeof w === "object" && "min" in w ? w.min : null;
    if (shortest !== null && o.stimulus_duration_ms > shortest) {
      throw new Error(
        `go-nogo: stimulus_duration_ms (${o.stimulus_duration_ms}) is longer than the response window (${shortest}); the trial would end first.`
      );
    }
  }
}

/** The ordering rules' keys. */
export const SEQUENCE_KEYS = [
  "max_run",
  "min_gap",
  "max_gap",
  "run_length",
  "start_with",
  "no_immediate_repeat",
  "balanced_transitions",
  "cycle_length",
] as const;
