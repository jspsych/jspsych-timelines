/**
 * One track: a fresh `jsPsych.adaptive` staircase for one condition, plus the two things core lacks that this task needs:
 *  - a `mistakes` stop rule (total wrong answers; core has `consecutive_failures` and `failures_at_level` only);
 *  - a hard cap on the number of trials, so a rule that never fires cannot run forever.
 * A step size that switches at a *level* (S012: after the first error or at -19.75 dB SNR) is not available in core: `step_sizes`
 * switches on the number of reversals only, so only that part of the schedule is implemented.
 */
import type { JsPsych } from "jspsych";

import { MAX_TRIALS_PER_TRACK } from "./constants";
import type { ResolvedAdaptive } from "./options";

type Staircase = ReturnType<JsPsych["adaptive"]["createStaircase"]>;

/** Correct answers in a row that make the task harder: the procedure's "n down". */
const N_DOWN: Record<ResolvedAdaptive["procedure"], number> = {
  staircase_1up_1down: 1,
  staircase_1up_2down: 2,
  staircase_1up_3down: 3,
};

export interface TrackUpdate {
  /** the level that was presented */
  level: number;
  correct: boolean;
  is_reversal: boolean;
  reversal_count: number;
  next_level: number;
  /** the step in force for this answer's move (after counting its reversal), dB */
  step_up: number;
  step_down: number;
}

export class Track {
  readonly staircase: Staircase;
  private errors = 0;
  private capped = false;

  /**
   * @param ignoreStop a practice staircase runs for a fixed number of trials, so its stop rules are left out
   */
  constructor(jsPsych: JsPsych, readonly cfg: ResolvedAdaptive, label: string, ignoreStop = false) {
    const { mistakes: _m, ...core } = cfg.discontinue_rule ?? {};
    this.staircase = jsPsych.adaptive.createStaircase({
      label,
      start_level: cfg.start_level,
      up: 1,
      down: N_DOWN[cfg.procedure],
      correct_moves: "down",
      step_sizes: cfg.step_sizes,
      bounds: cfg.bounds,
      ...(!ignoreStop && Object.keys(core).length ? { stop: core } : {}),
    });
    this.ignoreStop = ignoreStop;
  }

  private ignoreStop: boolean;

  get level(): number {
    return this.staircase.level;
  }

  get trialCount(): number {
    return this.staircase.trial_count;
  }

  get done(): boolean {
    return this.stopReason !== null;
  }

  /** Why the track ended: a core rule, `mistakes`, `cap`, or null while it runs. */
  get stopReason(): string | null {
    if (this.staircase.done) return this.staircase.stop_reason;
    const m = this.cfg.discontinue_rule?.mistakes;
    if (!this.ignoreStop && m !== undefined && this.errors >= m) return "mistakes";
    if (this.capped) return "cap";
    return null;
  }

  /** The step that the next move will use (by reversals so far). */
  currentStep(): { up: number; down: number } {
    const steps = this.cfg.step_sizes;
    return steps[Math.min(this.staircase.reversals, steps.length - 1)];
  }

  update(correct: boolean): TrackUpdate {
    if (this.done) throw new Error("tone-detection: update() on a track that is already done.");
    const level = this.staircase.level;
    const next = this.staircase.update(correct);
    // core picks the step after counting this answer's reversal, so a reversal move already uses the next step of the schedule
    const step = this.currentStep();
    if (!correct) this.errors++;
    if (
      !this.ignoreStop &&
      this.staircase.trial_count >= MAX_TRIALS_PER_TRACK &&
      !this.staircase.done
    ) {
      this.capped = true;
    }
    const last = this.staircase.history[this.staircase.history.length - 1];
    return {
      level,
      correct,
      is_reversal: last.reversal,
      reversal_count: this.staircase.reversals,
      next_level: next,
      step_up: step.up,
      step_down: step.down,
    };
  }

  /** The running estimate: the mean of the last `n` reversal levels (all if fewer), or null before the first reversal. */
  estimate(n?: number): number | null {
    return this.staircase.estimate(n === undefined ? {} : { last_n_reversals: n });
  }

  /** The staircase after the last update, without its history (small enough for every trial row). */
  compact(): Record<string, unknown> {
    const { history: _h, config: _c, ...rest } = this.staircase.toJSON() as any;
    return { ...rest, errors: this.errors, stop_reason: this.stopReason };
  }

  /** Full `toJSON()`, history included. */
  snapshot(): Record<string, unknown> {
    return {
      ...JSON.parse(JSON.stringify(this.staircase.toJSON())),
      errors: this.errors,
      stop_reason: this.stopReason,
    };
  }
}
